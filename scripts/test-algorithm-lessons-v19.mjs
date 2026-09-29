import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const read = file => readFile(new URL(`../signal-runner-node/${file}`, import.meta.url), "utf8");
const context = { console, performance, setTimeout, clearTimeout, setImmediate, setInterval, clearInterval };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const file of ["vendor/skulpt-1.2.0.min.js", "world-rules.js", "learning-evidence.js", "structured-lessons.js", "python-runtime-core.js", "algorithm-lessons.js", "algorithm-lessons-ui.js", "course-data.js", "v16-course-overrides.js", "early-lessons.js"])
  vm.runInContext(await read(file), context, { filename: file });

const E = context.CodeQuestEarlyLessons;
const clone = value => JSON.parse(JSON.stringify(value));
let checks = 0;

async function execute(no, phase = "guided", profile = null, change = null) {
  const p = profile || E.profile(), base = context.SignalRunnerCourseData.missions[no - 1];
  E.mission(base, p);
  p.phase = phase;
  const m = E.mission(base, p), adapter = context.CodeQuestStructuredLessons.get(no);
  adapter.reference(m, p);
  const d = clone(adapter.draft(p));
  if (change) change(d);
  const execution = await adapter.compile(m, d, context.Sk);
  const attempt = adapter.assess(m, d, execution, p.assisted);
  adapter.record(p, attempt);
  return { p, m, d, execution, attempt };
}

for (let no = 33; no <= 48; no += 1) {
  const guided = await execute(no);
  assert.equal(guided.attempt.success, true, `lesson ${no} guided: ${guided.attempt.failure}\n${guided.execution.source}`);
  assert.equal(guided.attempt.failure, "", `lesson ${no} success must not carry a failure message`);
  assert.ok(JSON.stringify(guided.attempt).length < 65000, `lesson ${no} evidence should remain safe for local storage`);
  if (no === 41 || no === 42 || no === 43 || no === 48) {
    const weighted = no === 43 || no === 48;
    const minimum = context.CodeQuestAlgorithmLessons.graphMinCost(guided.m.algorithm, weighted);
    assert.equal(context.CodeQuestAlgorithmLessons.graphPathCost(guided.m.algorithm, guided.attempt.evidence.path, weighted), minimum,
      `lesson ${no} must use the genuinely optimal route`);
    if (weighted) assert.equal(100 - guided.execution.finalState.energy, minimum,
      `lesson ${no} energy in the world must match its algorithmic cost`);
  }
  if (no === 46) {
    const greedy = context.CodeQuestAlgorithmLessons.greedyRoute(guided.m.algorithm.points);
    assert.ok(context.CodeQuestAlgorithmLessons.routeCost(guided.m.algorithm.points, greedy) > guided.attempt.evidence.expected,
      "lesson 46 must contain a real counterexample to greedy choice");
  }
  checks += 1;
  const transfer = await execute(no, "challenge", guided.p);
  assert.equal(transfer.attempt.success, true, `lesson ${no} transfer: ${transfer.attempt.failure}\n${transfer.execution.source}`);
  assert.notEqual(transfer.attempt.fingerprint, guided.attempt.fingerprint);
  assert.equal(transfer.p.mastered, true, `lesson ${no} mastery`);
  if (no === 48) {
    assert.equal(guided.m.algorithm.objective, "energy");
    assert.equal(transfer.m.algorithm.objective, "steps");
    assert.equal(transfer.d.fields.container, "queue");
    assert.equal(context.CodeQuestAlgorithmLessons.graphPathCost(transfer.m.algorithm, transfer.attempt.evidence.path, false),
      context.CodeQuestAlgorithmLessons.graphMinCost(transfer.m.algorithm, false), "capstone transfer must minimize steps");
  }
  if (no === 46) {
    const greedy = context.CodeQuestAlgorithmLessons.greedyRoute(transfer.m.algorithm.points);
    assert.ok(context.CodeQuestAlgorithmLessons.routeCost(transfer.m.algorithm.points, greedy) > transfer.attempt.evidence.expected,
      "lesson 46 transfer must also be a real greedy counterexample");
  }
  checks += 1;
}

const mapShapes = new Map();
for (let no = 33; no <= 48; no += 1) {
  const profile = E.profile(), base = context.SignalRunnerCourseData.missions[no - 1];
  const m = E.mission(base, profile);
  const shape = m.grid.map(row => row.replace(/[SBs]/g, "g")).join("\n");
  assert.equal(mapShapes.has(shape), false, `lesson ${no} should not reuse lesson ${mapShapes.get(shape)} map geometry`);
  mapShapes.set(shape, no);
  assert.equal(context.CodeQuestAlgorithmLessons.draft(profile, no).commands.length, 1,
    `lesson ${no} should be ready to run after the student chooses rules`);
  const lessonHtml = context.CodeQuestAlgorithmLessonUI.render(m, profile);
  assert.match(lessonHtml, /先看懂这道题/, `lesson ${no} should open with a concrete question`);
  assert.match(lessonHtml, /现在轮到你/, `lesson ${no} should put decisions after the worked example`);
  if (no === 47) assert.match(lessonHtml, /爬楼梯：每次走 1 或 2 阶/);
  if (no <= 36 || no >= 45 && no <= 47) assert.ok(m.algorithmScene?.stations?.length,
    `lesson ${no} must map the data into visible 3D stations`);
  checks += 1;
}

{
  const profile = E.profile(), base = context.SignalRunnerCourseData.missions[32];
  const m = E.mission(base, profile);
  const events = [0, 1].map(index => ({ type: "report", line: 5, report: ["check", index, m.algorithm.values[index]] }));
  const html = context.CodeQuestAlgorithmLessonUI.render(m, profile, { playback: { execution: { events }, index: 2, reviewIndex: 0 } });
  assert.match(html, /正在看第 1 个位置/);
  assert.match(html, /步骤 1 \/ 2 · 正在回看/);
  checks += 1;
}

{
  const profile = E.profile(), m = E.mission(context.SignalRunnerCourseData.missions[33], profile);
  const events = [{ type: "report", line: 8, report: ["candidate", 2, 2] }];
  const html = context.CodeQuestAlgorithmLessonUI.render(m, profile, { playback: { execution: { events }, index: 1 } });
  assert.match(html, /当前最合适的是第 3 个货舱/);
  checks += 1;
}

for (const [no, field, wrong] of [[33, "scan", "first"], [34, "filter", "after"], [34, "score", "maximum"], [35, "equality", "swap"], [36, "shrink", "reverse"], [37, "order", "ESWN"], [38, "visited", "none"], [39, "container", "queue"], [41, "container", "stack"], [42, "parent", "off"], [43, "container", "queue"], [43, "measure", "steps"], [44, "noPath", "pretend"], [45, "score", "reward"], [46, "method", "greedy"], [47, "memo", "off"], [48, "container", "queue"]]) {
  const run = await execute(no, "guided", null, d => { d.fields[field] = wrong; });
  assert.equal(run.attempt.success, false, `lesson ${no} must reject ${field}=${wrong}`);
  if ([34, 36, 43, 45, 46].includes(no)) assert.equal(run.attempt.worldSuccess, false,
    `lesson ${no} misconception must have a visible result difference, not only a label mismatch`);
  checks += 1;
}

console.log(`v2.0 algorithm lessons: ${checks} guided, transfer and misconception checks passed.`);
