import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const app = await readFile(new URL("../signal-runner-node/app.js", import.meta.url), "utf8");
const context = { console, performance, setTimeout, clearTimeout, Set, Map };
context.window = context;
vm.createContext(context);
for (const file of ["world-rules.js", "learning-evidence.js", "structured-lessons.js", "parameter-lesson.js", "course-data.js", "v16-course-overrides.js", "early-lessons.js", "early-lesson-ui.js"]) {
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
function run(m, p, commands, route = [], maxSteps = 100) {
  const c = { console, performance, early: E, program: [...commands], routeProgram: [...route], sim: null,
    earlyRun: null, structuredEpoch: 0, structuredPlayback: null, animationFrame: null, completed: new Set(), celebrationUntil: 0,
    sensorTarget: "hazard", logicConnector: "and", logicHazardMode: "not-hazard",
    directions: ["N", "E", "S", "W"], directionLabels: E.labels,
    vectors: { N: { x: 0, y: -1 }, E: { x: 1, y: 0 }, S: { x: 0, y: 1 }, W: { x: -1, y: 0 } },
    mission: () => m, earlyProfile: () => p, earlyPrerequisiteNeeded: () => false,
    stopAutoRun() {}, startMotion() {}, render() {}, renderEarlyLesson() {}, saveEarlyProfile() {}, saveProgress() {}
  };
  c.window = c;
  vm.createContext(c);
  for (const name of productionFunctions) vm.runInContext(sourceFunction(name), c);
  c.resetSimulation();
  for (let i = 0; i < maxSteps && !c.sim.failed && !c.sim.completed && (!c.sim.expanded || c.sim.queueIndex < c.sim.queue.length); i += 1) c.stepProgram();
  return { sim: c.sim, attempt: p.attempts.at(-1) };
}

let checks = 0;
assert.doesNotMatch(app, /旧版学习记录|export-legacy/, "legacy migration data stays internal and is not shown in the learner UI");
checks += 1;
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
  assert.equal(p.mastered, false); checks += 4;
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
  assert.equal(p.mastered, false, `lesson ${number} transfer mastery`);
  assert.doesNotThrow(() => context.CodeQuestEarlyLessonUI.render(m, p));
  checks += 5;
}
for (const number of [13, 14, 15]) {
  const base = context.SignalRunnerCourseData.missions[number - 1];
  const p = E.profile({ version: E.version });
  let m = E.mission(base, p);
  assert.ok(m.grid.length >= 7 && m.grid[0].length >= 10, `lesson ${number} keeps a substantial map`);
  if (number === 13) p.conditionSensor = m.early.expectedSensor;
  if (number === 14) { p.logicConnector = m.early.expectedConnector; p.logicHazardMode = m.early.expectedHazardMode; }
  if (number === 15) p.prediction = m.early.prediction.answer;
  const guided = run(m, p, m.solution);
  assert.equal(guided.attempt.success, true, `lesson ${number} guided control task should pass`);
  assert.ok(guided.attempt.trace.some((step) => step.condition), `lesson ${number} stores a control decision`);

  E.switchChallenge(p, "repair"); m = E.mission(base, p);
  const broken = run(m, p, m.early.faulty);
  assert.equal(broken.attempt.success, false, `lesson ${number} faulty strategy must fail its concept check`);
  assert.ok(p.debugObservation, `lesson ${number} stores before-repair evidence`);
  p.diagnosis = m.early.diagnosisAnswer;
  if (number === 13) p.conditionSensor = m.early.expectedSensor;
  if (number === 14) { p.logicConnector = m.early.expectedConnector; p.logicHazardMode = m.early.expectedHazardMode; }
  run(m, p, m.solution);
  assert.ok(p.repairEvidence, `lesson ${number} binds repair evidence`);

  E.switchChallenge(p, "challenge"); m = E.mission(base, p);
  if (number === 13) p.conditionSensor = m.early.expectedSensor;
  if (number === 14) { p.logicConnector = m.early.expectedConnector; p.logicHazardMode = m.early.expectedHazardMode; }
  if (number === 15) p.prediction = m.early.prediction.answer;
  const transfer = run(m, p, m.solution);
  assert.equal(transfer.attempt.success, true, `lesson ${number} transfer should pass`);
  E.review(m, p, "我根据变化后的状态重新验证了同一条控制规则。");
  assert.equal(p.mastered, false, `lesson ${number} completes construct-repair-transfer mastery`);
  assert.doesNotThrow(() => context.CodeQuestEarlyLessonUI.render(m, p));
  checks += 7;
}
for (const number of [13, 14, 15]) {
  const base = context.SignalRunnerCourseData.missions[number - 1];
  for (const variant of [0, 1, 2]) {
    const p = E.profile({ version: E.version, phase: "challenge", variant });
    const m = E.mission(base, p);
    if (number === 13) p.conditionSensor = m.early.expectedSensor;
    if (number === 14) { p.logicConnector = m.early.expectedConnector; p.logicHazardMode = m.early.expectedHazardMode; }
    if (number === 15) p.prediction = m.early.prediction.answer;
    const proof = run(m, p, m.solution);
    assert.equal(proof.attempt.success, true, `lesson ${number} variant ${variant} should validate`);
    if (number === 13) assert.equal(proof.attempt.trace.find((step) => step.condition)?.condition.result, m.early.expectedConditionResult);
    if (number === 15) assert.equal(proof.attempt.trace.find((step) => step.condition?.kind === "while")?.condition.repetitions, m.early.expectedRepetitions);
    checks += 1;
  }
}
for (let number = 16; number <= 32; number += 1) {
  if (number === 19) continue; // Real Python parameter sample has a separate end-to-end suite.
  const base = context.SignalRunnerCourseData.missions[number - 1];
  const p = E.profile({ version: E.version });
  let m = E.mission(base, p);
  assert.equal(E.isEarly(m), true, `lesson ${number} stays in the game-first experience`);
  assert.equal(m.grid.length, 8, `lesson ${number} uses the full-height world`);
  assert.equal(m.grid[0].length, 13, `lesson ${number} uses the full-width world`);
  p.systemChoice = m.early.dataLab.correct;
  if (m.early.dataLab.secondary) p.systemChoiceB = m.early.dataLab.secondary.correct;
  const guided = run(m, p, m.solution, m.solutionFn);
  assert.equal(guided.attempt.worldSuccess, true, `lesson ${number} guided system task should pass: ${guided.attempt.failure}`);
  assert.ok(guided.sim.completed, `lesson ${number} completes in the world, not only in a quiz`);

  E.switchChallenge(p, "repair"); m = E.mission(base, p);
  const broken = run(m, p, m.early.faulty, m.early.functionStarter);
  assert.equal(broken.attempt.success, false, `lesson ${number} faulty system rule must fail`);
  assert.equal(p.debugObservation?.challengeKey, m.early.key, `lesson ${number} stores current failure evidence`);
  p.diagnosis = m.early.diagnosisAnswer;
  p.systemChoice = m.early.dataLab.correct;
  if (m.early.dataLab.secondary) p.systemChoiceB = m.early.dataLab.secondary.correct;
  const repaired = run(m, p, m.solution, m.solutionFn);
  assert.equal(repaired.attempt.worldSuccess, true, `lesson ${number} repaired system should pass: ${repaired.attempt.failure}`);
  assert.equal(Boolean(p.repairEvidence), false, `lesson ${number} cannot use route-only repairs as concept evidence`);

  E.switchChallenge(p, "challenge"); m = E.mission(base, p);
  p.systemChoice = m.early.dataLab.correct;
  if (m.early.dataLab.secondary) p.systemChoiceB = m.early.dataLab.secondary.correct;
  const transfer = run(m, p, m.solution, m.solutionFn);
  assert.equal(transfer.attempt.worldSuccess, true, `lesson ${number} transfer world should pass: ${transfer.attempt.failure}`);
  assert.equal(E.review(m, p, "我根据新地图重新检查状态、规则和停止条件。"), false);
  assert.equal(transfer.attempt.success, false, "a correct choice and route cannot establish the concept");
  assert.equal(p.mastered, false, `lesson ${number} completes construct-repair-transfer mastery`);
  const rendered = context.CodeQuestEarlyLessonUI.render(m, p);
  assert.doesNotMatch(rendered, /\bundefined\b|信标|\bbeacon\b/i, `lesson ${number} keeps student-facing terminology clean`);
  assert.match(rendered, /early-system-lab/, `lesson ${number} renders the game-first system lab`);
  checks += 10;
}
for (let number = 16; number <= 32; number += 1) {
  if (number === 19) continue; // Real Python parameter sample has a separate end-to-end suite.
  const base = context.SignalRunnerCourseData.missions[number - 1];
  for (const variant of [0, 1, 2]) {
    const p = E.profile({ version: E.version, phase: "challenge", variant });
    const m = E.mission(base, p);
    p.systemChoice = m.early.dataLab.correct;
    if (m.early.dataLab.secondary) p.systemChoiceB = m.early.dataLab.secondary.correct;
    const proof = run(m, p, m.solution, m.solutionFn);
    assert.equal(proof.attempt.worldSuccess, true, `lesson ${number} transfer variant ${variant} should validate: ${proof.attempt.failure}`);
    const rendered = context.CodeQuestEarlyLessonUI.render(m, p);
    assert.doesNotMatch(rendered, /\bundefined\b|信标|\bbeacon\b/i, `lesson ${number} variant ${variant} keeps student-facing terminology clean`);
    checks += 1;
  }
}
{
  const base = context.SignalRunnerCourseData.missions[14];
  const p = E.profile({ version: E.version });
  const m = E.mission(base, p);
  p.prediction = m.early.prediction.answer;
  const firstTick = run(m, p, m.solution, [], 1);
  assert.equal(firstTick.sim.path.length, 2, "while advances exactly one tile on its first execution tick");
  assert.notDeepEqual(firstTick.sim.path.at(-1), m.early.targets[0], "while must not flash directly to the gem");
  assert.equal(firstTick.sim.queue[firstTick.sim.queueIndex]?.id, "whileBeacon", "the next loop check stays queued for the next tick");

  const completed = run(m, p, m.solution);
  const rendered = context.CodeQuestEarlyLessonUI.render(m, p);
  const evidenceTag = rendered.match(/<details class="early-result early-evidence-disclosure"[^>]*>/)?.[0] || "";
  assert.ok(completed.attempt.success);
  assert.ok(evidenceTag, "evidence uses a disclosure control");
  assert.doesNotMatch(evidenceTag, /\bopen\b/, "evidence is collapsed by default");
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
  assert.equal(p.mastered, false, JSON.stringify({ guided: p.guidedComplete, repair: Boolean(p.repairEvidence), revised: p.ruleRevised, reason: p.failureReason, playtest: Boolean(p.playtestObservation), last: p.attempts.at(-1) })); checks += 7;
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
  assert.equal(p.mastered, false); checks += 5;
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
  assert.equal(p.mastered, false); checks += 5;
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
  E.review(m, p, "每次调用前后位置和朝向都相同。"); assert.equal(p.mastered, false); checks += 8;
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
  assert.equal(p.mastered, false, `${base.id} full construct-repair-transfer loop`);
  assert.equal(p.attempts.at(-1).reflectionAssessment, "teacher-review");
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
  context.CodeQuestEvidence.expose(p, m);
  E.switchChallenge(p, "guided"); E.switchChallenge(p, "challenge"); E.mission(bases[0], p);
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
  E.review(m, p, "我改用另一条路线", null, E.reasons[2]); assert.equal(p.mastered, false);
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
  assert.equal(migrated.version, 7); assert.equal(migrated.mastered, false);
  assert.equal(migrated.completed, true); assert.equal(migrated.legacyEvidence.mastered, true);
  const {m,p}=prepare(bases[0]);run(m,p,m.solution);p.updatedAt="2026-09-14T01:00:00Z";
  const remote=E.profile(p);E.review(m,p,"新说明");p.updatedAt="2026-09-14T02:00:00Z";
  const merged=E.merge(p,remote);
  assert.equal(merged.attempts.at(-1).reflection,"新说明");
  const id=p.guidedEvidence.id;
  for(let i=0;i<8;i++) E.record(p,{...p.attempts.at(-1),id:`later-${i}`,phase:"challenge"});
  assert.equal(p.guidedEvidence.id,id); assert.equal(p.attempts.length,9);
  const invalid=E.profile({version:2,variant:1.5,draft:["move","<script>"],attempts:[null]});
  assert.equal(invalid.variant,1);assert.equal(invalid.draft.length,1);
  const c={authUser:{id:"A"},isLocalPreview:false,courseMissions:context.SignalRunnerCourseData.missions};vm.createContext(c);vm.runInContext(sourceFunction("earlyStorageKey"),c);
  const key=c.earlyStorageKey("course-05");c.authUser={id:"B"};assert.notEqual(c.earlyStorageKey("course-05"),key);
  checks++;
}
console.log(`early-lessons: ${checks} behavior scenarios passed (legacy route behavior, honest mastery, repair, transfer, migration).`);
