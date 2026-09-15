import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const app = await readFile(new URL("../signal-runner-node/app.js", import.meta.url), "utf8");
const context = { console, performance, setTimeout, clearTimeout, Set, Map };
context.window = context;
vm.createContext(context);
for (const file of ["course-data.js", "v16-course-overrides.js", "early-lessons.js", "early-lesson-ui.js"]) {
  vm.runInContext(await readFile(new URL(`../signal-runner-node/${file}`, import.meta.url), "utf8"), context);
}
const E = context.CodeQuestEarlyLessons;
const bases = context.SignalRunnerCourseData.missions.slice(0, 5);

// Exercise production command execution and completion, with only rendering/storage stubbed.
function sourceFunction(name) {
  const start = app.indexOf(`  function ${name}(`);
  assert.ok(start >= 0, `production function ${name} exists`);
  const end = app.indexOf("\n  }", start) + 4;
  return app.slice(start, end);
}
const productionFunctions = ["parseGrid", "tileKey", "turn", "resetSimulation", "expandProgram", "log",
  "failureMotion", "fail", "complete", "frontTile", "blockingKind", "isBlocked", "failAtBlockedTile",
  "frontKind", "spendEnergy", "moveForward", "executeCommand", "stepProgram", "finishEarlyRun", "beginEarlyRun"];
function run(m, p, commands, route = []) {
  const c = { console, performance, early: E, program: [...commands], routeProgram: [...route], sim: null,
    earlyRun: null, animationFrame: null, completed: new Set(), celebrationUntil: 0,
    directions: ["N", "E", "S", "W"], directionLabels: E.labels,
    vectors: { N: { x: 0, y: -1 }, E: { x: 1, y: 0 }, S: { x: 0, y: 1 }, W: { x: -1, y: 0 } },
    mission: () => m, earlyProfile: () => p, earlyPrerequisiteNeeded: () => false,
    stopAutoRun() {}, startMotion() {}, render() {}, renderEarlyLesson() {}, saveEarlyProfile() {}, saveProgress() {}
  };
  c.window = c;
  vm.createContext(c);
  for (const name of productionFunctions) vm.runInContext(sourceFunction(name), c);
  c.resetSimulation();
  for (let i = 0; i < 100 && !c.sim.failed && !c.sim.completed && (!c.sim.expanded || c.sim.queueIndex < c.sim.queue.length); i += 1) c.stepProgram();
  return { sim: c.sim, attempt: p.attempts.at(-1) };
}

let checks = 0;
const v16Bases = context.SignalRunnerCourseData.missions.slice(6, 10);
{
  const p = E.profile({ version: E.version });
  const m = E.mission(v16Bases[1], p);
  assert.equal(E.canRun(m, p, true), "请先完成上方的“上传前要满足什么？”预测。");
  checks += 1;
}
{
  const base = context.SignalRunnerCourseData.missions[5], p = E.profile({ version: E.version });
  let m = E.mission(base, p); p.prediction = m.early.prediction.answer;
  const guided = run(m, p, m.solution);
  assert.equal(guided.sim.completed, true); assert.equal(guided.attempt.targetOrderCorrect, true);
  E.switchChallenge(p, "repair"); m = E.mission(base, p);
  run(m, p, m.early.faulty); p.diagnosis = m.early.diagnosisAnswer; run(m, p, m.solution);
  assert.ok(p.repairEvidence, "lesson 6 stores premature-upload before/after evidence");
  E.switchChallenge(p, "challenge"); m = E.mission(base, p); p.prediction = m.early.prediction.answer;
  run(m, p, m.solution); E.review(m, p, "我按 A、B、上传分成三段检查。");
  assert.equal(p.mastered, true); checks += 4;
}
for (const number of [11, 12]) {
  const base = context.SignalRunnerCourseData.missions[number - 1];
  const p = E.profile({ version: E.version });
  let m = E.mission(base, p);
  p.loopCount = m.early.expectedLoopCount; p.loopBoundary = m.early.expectedBoundary;
  const guided = run(m, p, m.solution, m.solutionFn);
  assert.equal(guided.attempt.success, true, `lesson ${number} guided loop should pass`);
  assert.equal(guided.attempt.callSnapshots.length, m.early.expectedLoopCount);
  E.switchChallenge(p, "repair"); m = E.mission(base, p);
  p.loopCount = m.early.expectedLoopCount; p.loopBoundary = m.early.expectedBoundary;
  run(m, p, m.early.faulty, m.early.faultyFunction);
  p.diagnosis = m.early.diagnosisAnswer;
  run(m, p, m.solution, m.solutionFn);
  assert.ok(p.repairEvidence, `lesson ${number} repair evidence`);
  E.switchChallenge(p, "challenge"); m = E.mission(base, p);
  p.loopCount = m.early.expectedLoopCount; p.loopBoundary = m.early.expectedBoundary;
  run(m, p, m.solution, m.solutionFn); E.review(m, p, "循环次数改变，循环体和边界规则保持不变。");
  assert.equal(p.mastered, true, `lesson ${number} transfer mastery`);
  assert.doesNotThrow(() => context.CodeQuestEarlyLessonUI.render(m, p));
  checks += 5;
}
{
  const base = v16Bases[0], p = E.profile({ version: E.version, designerTarget: "east-b", obstacles: ["rock-33"], actionLimit: "tight" });
  let m = E.mission(base, p);
  assert.equal(m.title, "设计一条可解路线");
  assert.ok(m.solution.length <= m.early.ruleLimit);
  run(m, p, m.solution);
  assert.equal(p.guidedComplete, true, "lesson 7 stores a real author solution");
  E.switchChallenge(p, "repair"); m = E.mission(base, p);
  run(m, p, m.solution);
  assert.ok(p.debugObservation, "lesson 7 preserves the broken-rule run");
  p.ruleDiagnosis = m.early.diagnosisAnswer; p.ruleFixed = true; m = E.mission(base, p);
  run(m, p, m.solution); assert.ok(p.repairEvidence, "lesson 7 repair evidence binds before and after");
  E.switchChallenge(p, "challenge"); m = E.mission(base, p);
  run(m, p, m.early.faulty); assert.ok(p.playtestObservation);
  p.failureReason = "撞上我放的障碍"; p.ruleRevised = true; m = E.mission(base, p);
  run(m, p, m.solution); E.review(m, p, "目标、限制和作者解一起验证。");
  assert.equal(p.mastered, true, JSON.stringify({ guided: p.guidedComplete, repair: Boolean(p.repairEvidence), revised: p.ruleRevised, reason: p.failureReason, playtest: Boolean(p.playtestObservation), last: p.attempts.at(-1) })); checks += 7;
}
{
  const base = v16Bases[1], p = E.profile({ version: E.version });
  let m = E.mission(base, p); p.prediction = m.early.prediction.answer;
  const guided = run(m, p, m.solution);
  assert.equal(guided.sim.completed, true, JSON.stringify({ failure: guided.sim.failureMessage, x: guided.sim.x, y: guided.sim.y, collected: guided.sim.collected.size, trace: guided.attempt?.trace })); assert.equal(guided.attempt.targetOrderCorrect, true);
  const reversed = E.result(m, p, { program: m.solution, routeProgram: [], path: [], prediction: p.prediction, callSnapshots: [], trace: [
    { command: "collect", ...m.early.targets[1] }, { command: "collect", ...m.early.targets[0] }
  ], success: true });
  assert.equal(reversed.success, false, "lesson 8 cannot pass by collecting A and B in reverse order");
  E.switchChallenge(p, "repair"); m = E.mission(base, p);
  run(m, p, m.early.faulty); p.diagnosis = String(m.early.faultStep); run(m, p, m.solution);
  assert.ok(p.repairEvidence);
  E.switchChallenge(p, "challenge"); m = E.mission(base, p); p.prediction = m.early.prediction.answer;
  run(m, p, m.solution); E.review(m, p, "我根据新的起点朝向重新规划。");
  assert.equal(p.mastered, true); checks += 5;
}
{
  const base = v16Bases[2], p = E.profile({ version: E.version });
  let m = E.mission(base, p);
  const guided = run(m, p, m.solution, m.solutionFn);
  assert.equal(guided.attempt.reuseValid, true, JSON.stringify({ failure: guided.sim.failureMessage, completed: guided.sim.completed, collected: guided.sim.collected.size, attempt: guided.attempt })); assert.equal(guided.attempt.callSnapshots.length, 3);
  E.switchChallenge(p, "repair"); m = E.mission(base, p);
  run(m, p, m.early.faulty, m.early.faultyFunction); p.diagnosis = m.early.diagnosisAnswer;
  run(m, p, m.solution, m.solutionFn); assert.ok(p.repairEvidence);
  E.switchChallenge(p, "challenge"); m = E.mission(base, p);
  run(m, p, m.solution, m.solutionFn); E.review(m, p, "定义保存动作，调用才执行动作。");
  assert.equal(p.mastered, true); checks += 5;
}
{
  const base = v16Bases[3], p = E.profile({ version: E.version });
  let m = E.mission(base, p);
  const broken = run(m, p, m.solution, m.early.faultyFunction);
  assert.equal(broken.attempt.contractValid, false);
  assert.equal(broken.attempt.callSnapshots[0].before.dir, "E");
  assert.equal(broken.attempt.callSnapshots[0].after.dir, "N");
  p.diagnosis = m.early.diagnosisAnswer; run(m, p, m.solution, m.solutionFn);
  assert.equal(p.guidedComplete, true);
  E.switchChallenge(p, "repair"); m = E.mission(base, p);
  run(m, p, m.early.faulty, m.early.faultyFunction); p.diagnosis = m.early.diagnosisAnswer;
  run(m, p, m.solution, m.solutionFn); assert.ok(p.repairEvidence);
  E.switchChallenge(p, "challenge"); m = E.mission(base, p);
  const rotated = run(m, p, m.solution, m.solutionFn);
  assert.equal(rotated.attempt.contractValid, true); assert.equal(rotated.attempt.callSnapshots[0].before.dir, "S");
  E.review(m, p, "每次调用前后位置和朝向都相同。"); assert.equal(p.mastered, true); checks += 8;
}
function prepare(base, phase = "guided", variant = 0) {
  const p = E.profile({ version: E.version, phase, variant });
  let m = E.mission(base, p);
  p.plan = m.routeChoices?.[0].id || "";
  p.reason = E.reasons[0];
  m = E.mission(base, p);
  p.prediction = m.early.prediction.answer;
  p.prerequisite = m.early.prerequisite?.answer || "";
  return { m, p };
}

for (const base of bases) {
  for (const phase of ["guided", "repair", "challenge"]) {
    for (const variant of phase === "guided" ? [0] : [0, 1, 2]) {
      const { m, p } = prepare(base, phase, variant);
      if (phase === "repair") {
        const failed = run(m, p, m.early.faulty);
        assert.equal(failed.sim.completed, false, `${base.id} faulty case must fail`);
        assert.ok(p.debugObservation, "real execution preserves original evidence");
        p.diagnosis = String(m.early.faultStep);
      }
      const { sim, attempt } = run(m, p, m.solution);
      assert.ok(m.solution.length <= m.limit);
      assert.equal(sim.completed, true, `${base.id} ${phase} ${variant} solution completes`);
      assert.equal(attempt.trace.length, m.solution.length);
      assert.equal(attempt.targetOrderCorrect, true);
      assert.equal(p.mastered, false, "world success alone cannot confer mastery");
      if (phase === "repair") {
        assert.ok(p.repairEvidence);
        assert.equal(p.repairEvidence.before.success, false);
        assert.equal(p.repairEvidence.after.success, true);
      }
      assert.doesNotThrow(() => context.CodeQuestEarlyLessonUI.render(m, p));
      checks++;
    }
  }
}
for (const base of bases) {
  for (const variant of [0, 1, 2]) {
    const repair = prepare(base, "repair", variant);
    const challenge = prepare(base, "challenge", variant);
    assert.notDeepEqual([...repair.m.grid], [...challenge.m.grid]);
    const replay = run(challenge.m, challenge.p, repair.m.solution);
    assert.equal(replay.sim.completed, false, `${base.id}: replaying repair solution must not solve transfer map`);
    checks++;
  }
}
for (const base of bases) {
  const { p, m } = prepare(base);
  run(m, p, m.solution);
  E.switchChallenge(p, "repair");
  let repair = E.mission(base, p);
  run(repair, p, repair.early.faulty);
  p.diagnosis = String(repair.early.faultStep);
  run(repair, p, repair.solution);
  E.switchChallenge(p, "challenge");
  let challenge = E.mission(base, p);
  p.plan = challenge.routeChoices?.[0].id || ""; p.reason = E.reasons[0];
  challenge = E.mission(base, p); p.prediction = challenge.early.prediction.answer;
  run(challenge, p, challenge.solution);
  assert.equal(E.review(challenge, p, ""), false, "reflection is required but not semantically graded");
  assert.equal(E.review(challenge, p, "我根据位置和朝向修改了程序，并在新地图上验证。"), true);
  assert.equal(p.mastered, true, `${base.id} full construct-repair-transfer loop`);
  assert.equal(p.masteryEvidence.reflectionAssessment, "teacher-review");
  checks++;
}
{
  const { m, p } = prepare(bases[3], "repair");
  p.diagnosis = String(m.early.faultStep);
  run(m, p, m.solution);
  assert.equal(p.repairEvidence, null, "cannot skip observing the faulty program");
  run(m, p, m.early.faulty);
  p.diagnosis = "5"; run(m, p, m.solution);
  assert.equal(p.repairEvidence, null, "last failure step is not first wrong turn");
  p.diagnosis = "4"; p.assisted = true; run(m, p, m.solution);
  assert.equal(p.repairEvidence, null, "reference-assisted repair is not independent");
  E.switchChallenge(p, "repair", true);
  const next = E.mission(bases[3], p);
  p.diagnosis = String(next.early.faultStep); run(next, p, next.solution);
  assert.equal(p.repairEvidence, null, "observation from another case cannot be reused");
  checks++;
}
{
  const { m, p } = prepare(bases[0], "challenge");
  p.guidedComplete = true;
  run(m, p, m.solution); E.review(m, p, "说明");
  assert.equal(p.mastered, false, "reflection cannot replace hands-on repair evidence");
  p.repairEvidence = { before: {}, after: {} }; p.prediction = "1";
  run(m, p, m.solution); p.prediction = m.early.prediction.answer; E.review(m, p, "说明");
  assert.equal(p.mastered, false, "prediction edited after execution cannot rewrite evidence");
  p.assisted = true; run(m, p, m.solution); E.review(m, p, "说明");
  assert.equal(p.mastered, false);
  E.switchChallenge(p, "guided"); E.switchChallenge(p, "challenge");
  assert.equal(p.assisted, true, "same-map exposure survives switching");
  E.switchChallenge(p, "challenge", true); assert.equal(p.assisted, false);
  checks++;
}
{
  const { m, p } = prepare(bases[0]);
  const { sim, attempt } = run(m, p, [...m.solution, "collect"]);
  assert.equal(sim.failed, true); assert.equal(sim.completed, false);
  assert.equal(attempt.tailCount, 1);
  const other = run({ ...m, id: "demo-unchanged" }, p, [...m.solution, "collect"]);
  assert.equal(other.sim.completed, true); assert.equal(other.sim.queueIndex, 3);
  checks++;
}
{
  const { m, p } = prepare(bases[2], "challenge");
  p.guidedComplete = true; p.repairEvidence = { before: {}, after: {} };
  run(m, p, m.routeChoices[1].commands);
  assert.equal(p.attempts.at(-1).success, true);
  E.review(m, p, "我改用另一条路线"); assert.equal(p.mastered, false);
  E.review(m, p, "我改用另一条路线", null, E.reasons[2]); assert.equal(p.mastered, true);
  checks++;
}
{
  const { m, p } = prepare(bases[4], "challenge");
  const fake = E.result(m, p, {program:m.solution, path:[], prediction:p.prediction, trace:[
    {command:"collect", ...m.early.targets[1]}, {command:"collect", ...m.early.targets[0]}], success:true});
  assert.equal(fake.targetOrderCorrect, false, "collecting both targets in reverse order does not satisfy the lesson");
  checks++;
}
{
  const old = {version:1, mastered:true, completed:true, phase:"challenge", draft:["move"], attempts:[]};
  const migrated = E.profile(old);
  assert.equal(migrated.version, 4); assert.equal(migrated.mastered, false);
  assert.equal(migrated.completed, true); assert.equal(migrated.legacyEvidence.mastered, true);
  const {m,p}=prepare(bases[0]);run(m,p,m.solution);p.updatedAt="2026-09-14T01:00:00Z";
  const remote=E.profile(p);E.review(m,p,"新说明");p.updatedAt="2026-09-14T02:00:00Z";
  const merged=E.merge(p,remote);
  assert.equal(merged.attempts.at(-1).reflection,"新说明");
  const id=p.guidedEvidence.id;
  for(let i=0;i<8;i++) E.record(p,{...p.attempts.at(-1),id:`later-${i}`,phase:"challenge"});
  assert.equal(p.guidedEvidence.id,id); assert.equal(p.attempts.length,6);
  const invalid=E.profile({version:2,variant:1.5,draft:["move","<script>"],attempts:[null]});
  assert.equal(invalid.variant,1);assert.equal(invalid.draft.length,1);
  const c={authUser:{id:"A"},isLocalPreview:false,courseMissions:context.SignalRunnerCourseData.missions};vm.createContext(c);vm.runInContext(sourceFunction("earlyStorageKey"),c);
  const key=c.earlyStorageKey("course-05");c.authUser={id:"B"};assert.notEqual(c.earlyStorageKey("course-05"),key);
  checks++;
}
console.log(`early-lessons: ${checks} behavior scenarios passed (v1.6 lessons 1–12, repair, transfer, migration).`);
