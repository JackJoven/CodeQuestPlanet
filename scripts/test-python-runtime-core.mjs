import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [skulptSource, runtimeSource, courseDataSource, v16Source, appSource, pageSource] = await Promise.all([
  read("signal-runner-node/vendor/skulpt-1.2.0.min.js"),
  read("signal-runner-node/python-runtime-core.js"),
  read("signal-runner-node/course-data.js"),
  read("signal-runner-node/v16-course-overrides.js"),
  read("signal-runner-node/app.js"),
  read("signal-runner-node/index.html")
]);

const context = { clearInterval, clearTimeout, console, performance, setImmediate, setInterval, setTimeout, TextDecoder, TextEncoder };
context.global = context;
context.globalThis = context;
context.window = context;
vm.createContext(context);
vm.runInContext(skulptSource, context, { filename: "skulpt-1.2.0.min.js" });
vm.runInContext(runtimeSource, context, { filename: "python-runtime-core.js" });
vm.runInContext(courseDataSource, context, { filename: "course-data.js" });
vm.runInContext(v16Source, context, { filename: "v16-course-overrides.js" });

assert.equal(typeof context.Sk?.parse, "function");
assert.equal(typeof context.CodeQuestPythonRuntime?.create, "function");
assert.equal(context.SignalRunnerCourseData.version, "core-v1.6");

const curriculumTitles = [
  "启动信号", "谁的左和右", "先画路线再出发", "调试侦探社", "星图坐标站", "三段救援任务", "设计一条可解路线", "第一场独立救援",
  "把动作装进工具箱", "一个工具，多处使用", "找出重复的一组", "循环到哪里为止", "看到尖刺再行动", "写一条安全规则", "不数步，也能到达", "自动救援程序",
  "会记数的 Nova", "能量账本", "给工具一个参数", "让函数交回答案", "一张会变化的清单", "清单变长以后", "用名字查规则", "救援调度台",
  "地图藏在表格里", "用数据修一座桥", "把任务交给谁", "两个同款机器人", "接力运输", "等到通道真的空了", "让别人也能玩", "重建中继站"
];

const missions = context.SignalRunnerCourseData.missions.slice(0, 32);
assert.equal(missions.length, 32);
missions.forEach((mission, index) => {
  const number = index + 1;
  assert.equal(mission.title, curriculumTitles[index], `course ${number} title`);
  assert.equal(mission.contentId, `core-v1.6-${String(number).padStart(2, "0")}`);
  assert.ok(mission.conceptId);
  assert.equal(mission.prdAlignment.version, "1.6");
  assert.equal(mission.prdAlignment.phases.length, 5);
});

for (let number = 13; number <= 32; number += 1) {
  const studio = missions[number - 1].pythonStudio;
  assert.ok(studio, `course ${number} should use real Python`);
  assert.ok(studio.starterSource && studio.referenceSource);
  assert.notEqual(studio.starterSource, studio.referenceSource);
  assert.ok(studio.cases?.length >= 2, `course ${number} should include transfer cases`);
  assert.ok(studio.statePanel, `course ${number} should expose execution evidence`);
}

function startOf(grid) {
  for (let y = 0; y < grid.length; y += 1) {
    const x = grid[y].indexOf("S");
    if (x >= 0) return { x, y };
  }
  throw new Error("grid missing S");
}

function runtimeFor(mission, testCase = {}) {
  const studio = mission.pythonStudio;
  const grid = testCase.grid || mission.grid;
  return context.CodeQuestPythonRuntime.create({
    Sk: context.Sk,
    initialEnergy: testCase.energy ?? mission.energy,
    apiCallLimit: 160,
    allowedFunctions: new Set(studio.allowedFunctions),
    objectModel: Boolean(studio.objectModel),
    multiObject: Boolean(studio.multiObject),
    languageFeatures: studio.languageFeatures || [],
    courseInputs: testCase.inputs || studio.courseInputs || {},
    courseRules: testCase.courseRules || studio.courseRules || {},
    world: {
      grid,
      start: startOf(grid),
      startDir: testCase.startDir || mission.startDir,
      required: testCase.required ?? mission.required,
      targetPositions: testCase.targetPositions || []
    }
  });
}

function objectiveComplete(mission, testCase, state) {
  const testGrid = testCase.grid || mission.grid;
  const required = testCase.required ?? mission.required;
  const collected = Array.isArray(state.collectedKeys) ? state.collectedKeys.length : state.collected ? 1 : 0;
  return collected >= required && (!testGrid.some((row) => row.includes("R")) || state.uploaded);
}

function checkPasses(check, state, events) {
  if (check.kind === "variable") return state.variables?.[check.name] === check.equals;
  if (check.kind === "object") return JSON.stringify(state.objects?.[check.name]?.[check.property]) === JSON.stringify(check.equals);
  if (check.kind === "object-action") return events.some((event) => event.object?.name === check.name && event.object?.type === check.type && event.object?.action === check.action);
  if (check.kind === "function-return") return events.some((event) => event.functionReturn?.name === check.name && event.functionReturn?.value === check.equals);
  if (check.kind === "world-grid") return JSON.stringify(state.worldBuild?.grid) === JSON.stringify(check.equals);
  if (check.kind === "world-placements") return (state.worldBuild?.placements || []).length === check.equals;
  if (check.kind === "world-schema") return state.worldBuild?.schemaValidated && JSON.stringify(state.worldBuild.schema?.[check.property]) === JSON.stringify(check.equals);
  if (check.kind === "report") return JSON.stringify((state.reports || []).at(-1)) === JSON.stringify(check.equals);
  if (check.kind === "rescues") return JSON.stringify(state.rescues || []) === JSON.stringify(check.equals);
  if (check.kind === "distinct-objects") return check.names.every((name) => state.objects?.[name]);
  if (check.kind === "transfer") return (state.transfers || []).some((item) => item.from === check.from && item.to === check.to && item.amount === check.amount);
  if (check.kind === "tick") return Number(state.ticks || 0) === Number(check.equals);
  if (check.kind === "variable-event-sync") {
    const actions = events.filter((event) => event.type === check.eventType).length;
    const changes = events.filter((event) => event.variable?.name === check.name).length;
    return actions === check.equals && state.variables?.[check.name] === check.equals && changes >= actions + 1;
  }
  return true;
}

let passedCases = 0;
for (let number = 13; number <= 32; number += 1) {
  const mission = missions[number - 1];
  const studio = mission.pythonStudio;
  const mainResult = await runtimeFor(mission).compile(studio.referenceSource);
  assert.ok(objectiveComplete(mission, {}, mainResult.finalState), `course ${number} main reference objective`);
  for (const testCase of studio.cases) {
    let result;
    let error;
    try {
      result = await runtimeFor(mission, testCase).compile(studio.referenceSource);
    } catch (caught) {
      error = caught;
    }
    if (testCase.expectedError) {
      assert.ok(error, `course ${number} case ${testCase.id} should stop safely`);
      const errorText = `${String(error)} ${context.CodeQuestPythonRuntime.friendlyErrorMessage(error)}`.toLowerCase();
      assert.ok(errorText.includes(String(testCase.expectedError).toLowerCase()), `course ${number} case ${testCase.id} expected ${testCase.expectedError}, got ${errorText}`);
      passedCases += 1;
      continue;
    }
    assert.ifError(error);
    assert.ok(testCase.requireObjective === false || objectiveComplete(mission, testCase, result.finalState), `course ${number} case ${testCase.id} objective`);
    for (const check of [...(studio.stateChecks || []), ...(testCase.stateChecks || [])]) {
      assert.ok(checkPasses(check, result.finalState, result.events), `course ${number} case ${testCase.id}: ${check.message}`);
    }
    passedCases += 1;
  }
}

const safetyRuntime = context.CodeQuestPythonRuntime.create({ Sk: context.Sk, apiCallLimit: 12 });
await assert.rejects(() => safetyRuntime.compile("import os"), /暂时只开放/);
await assert.rejects(() => safetyRuntime.compile("while not at_gem():\n    turn_left()"), /循环|停止条件/);

const traced = context.CodeQuestPythonRuntime.instrumentSource("count = 0\ncount += 1").code;
assert.ok((traced.match(/__trace_variable__/g) || []).length >= 2, "+= should emit variable evidence");

assert.match(appSource, /const visibleCourseLessonLimit = 32;/);
assert.match(appSource, /verifyPythonTransferCases/);
assert.match(appSource, /signalRunnerNode\.python\.core-v1\.6/);
assert.match(pageSource, /id="pythonCaseGrid"/);
assert.match(pageSource, /id="worldResetBtn"[^>]*>[\s\S]*?复位<\/button>/);
assert.match(pageSource, /id="runBlockerToast"[^>]*role="alert"/);
assert.match(pageSource, /id="commandExplanation"[^>]*aria-live="polite"/);
assert.match(pageSource, /id="activeBoardHint">按顺序执行/);
assert.match(pageSource, /v16-course-overrides\.js/);
assert.match(appSource, /label: "while not gem"/);
assert.match(appSource, /code: "while not at_gem\(\):/);
assert.doesNotMatch(appSource, /label: "while not beacon"/i);
assert.doesNotMatch(appSource, /at_beacon\(/i);
assert.match(appSource, /data-replace-step=/);
assert.match(appSource, /请选择新指令/);

console.log(`Python runtime: ${passedCases} 个 v1.6 迁移场景、32 课清单与运行器安全检查全部通过。`);
