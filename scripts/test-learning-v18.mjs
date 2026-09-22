import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Readable } from "node:stream";
import vm from "node:vm";
import { readJson } from "../backend/src/http-utils.mjs";

const read = file => readFile(new URL(`../signal-runner-node/${file}`, import.meta.url), "utf8");
const c = { console, performance, setTimeout, clearTimeout, setImmediate, setInterval, clearInterval };
c.window = c;
vm.createContext(c);
for (const file of ["vendor/skulpt-1.2.0.min.js", "world-rules.js", "learning-evidence.js", "structured-lessons.js", "python-runtime-core.js",
  "foundation-lessons.js", "foundation-lessons-ui.js", "navigation-lessons.js", "navigation-lessons-ui.js", "state-lesson.js", "state-lesson-ui.js", "parameter-lesson.js", "parameter-lesson-ui.js", "course-data.js", "v16-course-overrides.js", "early-lessons.js"])
  vm.runInContext(await read(file), c, { filename: file });
const P = c.CodeQuestParameterLesson, E = c.CodeQuestEarlyLessons, V = c.CodeQuestEvidence;
const base = c.SignalRunnerCourseData.missions[18];
const S = c.CodeQuestStateLesson, stateBase = c.SignalRunnerCourseData.missions[16];
const clone = value => JSON.parse(JSON.stringify(value));
let checks = 0;
const check = (name, fn) => { fn(); checks++; console.log(`✓ ${name}`); };

async function runFoundation(number, phase = "guided", variant = 0, commands = null, learner = null) {
  const p = learner || E.profile(), baseMission = c.SignalRunnerCourseData.missions[number - 1];
  E.mission(baseMission, p); Object.assign(p, { phase, variant });
  const m = E.mission(baseMission, p), adapter = c.CodeQuestStructuredLessons.get(number), d = adapter.draft(p);
  d.commands = clone(commands || c.CodeQuestFoundationLessons.authorCommands(number, phase, variant));
  d.nextId = Math.max(1, ...d.commands.map(x => x.id + 1));
  const execution = await adapter.compile(m, clone(d), c.Sk), attempt = adapter.assess(m, clone(d), execution, p.assisted);
  adapter.record(p, attempt); return { p, m, d, execution, attempt, adapter };
}

async function runNavigation(number, phase, setup, learner = null, variant = 0) {
  const p = learner || E.profile(), baseMission = c.SignalRunnerCourseData.missions[number - 1];
  E.mission(baseMission, p); Object.assign(p, { phase, variant });
  let m = E.mission(baseMission, p), adapter = c.CodeQuestStructuredLessons.get(number), d = adapter.draft(p);
  setup?.(d, m); m = E.mission(baseMission, p); d = adapter.draft(p);
  const execution = await adapter.compile(m, clone(d), c.Sk), attempt = adapter.assess(m, clone(d), execution, p.assisted);
  adapter.record(p, attempt); return { p, m, d, execution, attempt, adapter, baseMission };
}

{
  const stair = await runNavigation(3, "guided", (d,m) => { d.plan = "stair"; d.commands = m.navigation.routes.stair.commands.map((action,i)=>({id:i+1,action})); });
  check("lesson 3 stair shortcut wins the move-count objective with real stairs", () => {
    assert.equal(stair.attempt.success, true); assert.deepEqual(clone(stair.attempt.costs), { moves: 10, turns: 5, total: 16 });
    assert.equal(stair.execution.events.filter(e=>e.type === "move").length, 10);
    assert.equal(stair.m.terrain.stairs.length, 2);
  });
  const mismatch = await runNavigation(3, "guided", (d,m) => { d.plan = "flat"; d.commands = m.navigation.routes.stair.commands.map((action,i)=>({id:i+1,action})); });
  check("lesson 3 rejects a run that does not follow the selected plan", () => {
    assert.equal(mismatch.attempt.worldSuccess, true); assert.equal(mismatch.attempt.success, false); assert.match(mismatch.attempt.failure, /计划不一致/);
  });
  const transfer = await runNavigation(3, "challenge", (d,m) => { d.plan = "flat"; d.commands = m.navigation.routes.flat.commands.map((action,i)=>({id:i+1,action})); }, stair.p);
  check("lesson 3 changes the optimization objective and accepts the lower-total flat route", () => {
    assert.equal(transfer.attempt.success, true); assert.deepEqual(clone(transfer.attempt.costs), { moves: 12, turns: 2, total: 15 }); assert.equal(transfer.p.mastered, true);
  });
  const tie = await runNavigation(3, "challenge", (d,m) => { d.plan = "flat"; d.commands = m.navigation.routes.flat.commands.map((action,i)=>({id:i+1,action})); }, null, 1);
  check("lesson 3 equal-cost fixture accepts either declared plan", () => {
    assert.equal(tie.m.semanticConstraints.objective, "tie"); assert.equal(tie.m.navigation.routes.stair.total, 16); assert.equal(tie.m.navigation.routes.flat.total, 16); assert.equal(tie.attempt.success, true);
  });
}
{
  const first = await runNavigation(4, "guided", null);
  check("lesson 4 starts with a runnable faulty program and records the failure before editing", () => {
    assert.equal(first.attempt.isFaulty, true); assert.equal(first.attempt.success, false); assert.equal(first.p.debugRuns[first.m.early.key], true);
  });
  let m = E.mission(first.baseMission, first.p), d = first.adapter.draft(first.p); d.diagnosis = 5; d.commands[4].action = "left";
  const execution = await first.adapter.compile(m, clone(d), c.Sk), fixed = first.adapter.assess(m, clone(d), execution, false); first.adapter.record(first.p, fixed);
  check("lesson 4 requires the correct first-divergence step and one local repair", () => {
    assert.equal(fixed.success, true); assert.equal(fixed.diagnosis, 5); assert.equal(first.p.guidedEvidence.id, fixed.id);
    assert.equal(first.m.grid.length, 11); assert.equal(first.m.grid[0].length, 13); assert.equal(first.m.terrain.stairs.length, 2);
  });
  const challengeFail = await runNavigation(4, "challenge", null, first.p);
  m = E.mission(challengeFail.baseMission, challengeFail.p); d = challengeFail.adapter.draft(challengeFail.p); d.diagnosis = 8; d.commands[7].action = "left";
  const x = await challengeFail.adapter.compile(m, clone(d), c.Sk), transferred = challengeFail.adapter.assess(m, clone(d), x, false); challengeFail.adapter.record(challengeFail.p, transferred);
  check("lesson 4 moves the fault between two switchback turns for independent transfer", () => {
    assert.equal(challengeFail.m.navigation.faultStep, 8); assert.equal(transferred.success, true); assert.equal(challengeFail.p.mastered, true);
  });
}
{
  const correct = await runNavigation(5, "guided", (d,m) => { d.portalChoice = "2,5"; d.commands = ["move","move","teleport","move","collect"].map((action,i)=>({id:i+1,action})); });
  check("lesson 5 explicit portal lands at (2,5) and preserves east heading", () => {
    assert.equal(correct.attempt.success, true); assert.deepEqual(clone(correct.attempt.landedAt), { x: 2, y: 5 });
    assert.equal(correct.attempt.headingPreserved, true); assert.equal(correct.execution.events.filter(e=>e.type === "teleport").length, 1);
  });
  const swapped = await runNavigation(5, "guided", (d) => { d.portalChoice = "5,2"; d.commands = ["move","move","teleport","move","collect"].map((action,i)=>({id:i+1,action})); });
  check("lesson 5 swapped x/y is a legal exit but fails the requested coordinate task", () => {
    assert.equal(swapped.attempt.success, false); assert.equal(swapped.attempt.selectedExit, "5,2"); assert.match(swapped.attempt.failure, /没有可以采集|读反/);
  });
  const transfer = await runNavigation(5, "challenge", (d) => { d.portalChoice = "5,2"; d.commands = ["move","move","teleport","move","collect"].map((action,i)=>({id:i+1,action})); }, correct.p);
  check("lesson 5 swaps the requested exit and start heading for transfer", () => {
    assert.equal(transfer.m.startDir, "W"); assert.equal(transfer.attempt.success, true); assert.equal(transfer.attempt.directionAfter, "W"); assert.equal(transfer.p.mastered, true);
  });
}

{
  const p = E.profile(), baseMission = c.SignalRunnerCourseData.missions[0], adapter = c.CodeQuestStructuredLessons.get(1);
  const m = E.mission(baseMission, p), d = adapter.draft(p);
  check("lesson 1 opens with an empty original-card program", () => {
    assert.equal(d.commands.length, 0); assert.throws(() => adapter.source(m, d), /先点一条指令/);
    assert.equal(m.foundation.distance, 3); assert.equal(m.grid.flatMap(row => [...row]).filter(tile => tile !== "_").length, 35);
  });
  adapter.edit(m, p, { action: "add", value: "move" }); adapter.edit(m, p, { action: "add", value: "collect" });
  adapter.edit(m, p, { action: "select", value: "1" }); adapter.edit(m, p, { action: "add", value: "collect" });
  check("lesson 1 add, replace, remove, undo and refresh preserve student work", () => {
    assert.equal(adapter.source(m, adapter.draft(p)), "collect()\ncollect()");
    adapter.edit(m, p, { action: "remove", value: "2" }); adapter.edit(m, p, { action: "undo" });
    const restored = E.profile(clone(p)); E.mission(baseMission, restored);
    assert.equal(adapter.source(m, adapter.draft(restored)), "collect()\ncollect()");
  });
}
{
  const guided = await runFoundation(1);
  check("lesson 1 guided proof records exactly three moves before collection", () => {
    assert.equal(guided.attempt.success, true); assert.equal(guided.attempt.movesBeforeCollect, 3);
    assert.equal(guided.execution.events.length, 4); assert.equal(guided.p.mastered, false);
  });
  const early = await runFoundation(1, "guided", 0, [{ id: 1, action: "collect" }, { id: 2, action: "move" }]);
  check("lesson 1 early collection runs and fails in the world", () => {
    assert.equal(early.attempt.worldSuccess, false); assert.match(early.attempt.failure, /没有可以采集/);
  });
  const extra = await runFoundation(1, "guided", 0, [...c.CodeQuestFoundationLessons.authorCommands(1, "guided", 0), { id: 9, action: "move" }]);
  check("lesson 1 does not swallow an extra action after collection", () => {
    assert.equal(extra.execution.events.at(-1).type, "move"); assert.equal(extra.attempt.worldSuccess, false);
    assert.match(extra.attempt.failure, /离开了目标格/);
  });
  const transfer = await runFoundation(1, "challenge", 0, null, guided.p);
  check("lesson 1 distance-five transfer completes mastery", () => {
    assert.equal(transfer.m.foundation.distance, 5); assert.equal(transfer.attempt.success, true); assert.equal(transfer.p.mastered, true);
  });
  const boundary = await runFoundation(1, "challenge", 1);
  check("lesson 1 keeps a one-step boundary fixture", () => assert.equal(boundary.m.foundation.distance, 1));
}
{
  const guided = await runFoundation(2);
  check("lesson 2 guided route turns right in place at the four-way junction", () => {
    assert.equal(guided.attempt.success, true); assert.equal(guided.attempt.firstTurn, "right"); assert.equal(guided.attempt.turnStayed, true);
    const turn = guided.execution.events.find(e => e.type === "turn"); assert.equal(turn.state.x, 4); assert.equal(turn.state.y, 3);
  });
  const wrong = c.CodeQuestFoundationLessons.authorCommands(2, "guided", 0); wrong[2].action = "left";
  const failed = await runFoundation(2, "guided", 0, wrong);
  check("lesson 2 wrong relative direction follows the wrong branch and fails", () => {
    assert.equal(failed.attempt.success, false); assert.equal(failed.attempt.firstTurn, "left"); assert.match(failed.attempt.failure, /没有可以采集/);
  });
  const transfer = await runFoundation(2, "challenge", 0, null, guided.p);
  check("lesson 2 changed initial heading requires a left turn and completes mastery", () => {
    assert.equal(transfer.m.startDir, "N"); assert.equal(transfer.attempt.firstTurn, "left"); assert.equal(transfer.p.mastered, true);
    assert.equal(transfer.m.semanticConstraints.cameraIndependent, true);
  });
  const west = await runFoundation(2, "challenge", 1);
  check("lesson 2 keeps a west-facing fixture for N/E/S/W coverage", () => {
    assert.equal(west.m.startDir, "W"); assert.equal(west.attempt.turnStayed, true);
  });
}
const make = (phase = "guided", variant = 0) => {
  const p = E.profile(); E.mission(base, p);
  Object.assign(p, { phase, variant, parameterStep: "route" });
  return { p, m: E.mission(base, p) };
};
const fixture = inputs => {
  const [a, b] = inputs;
  const nodes = [{ action: "call", argument: a }, { action: "collect" }, { action: "right" }, { action: "right" },
    ...Array.from({ length: a }, () => ({ action: "move" })), { action: "left" },
    ...Array.from({ length: 4 }, () => ({ action: "move" })), { action: "left" }, { action: "call", argument: b }, { action: "collect" }];
  return nodes.map((n, i) => ({ id: i + 1, ...n }));
};
async function run(m, p, overrides = {}) {
  const d = { binding: "distance", constant: 3, commands: fixture(m.lessonInputs), ...overrides };
  const execution = await P.compile(m, d, c.Sk);
  const attempt = P.assess(m, d, execution, p.assisted); P.record(p, attempt);
  return { execution, attempt, d };
}
const adapter = c.CodeQuestStructuredLessons.get(19);
{
  const learner = E.profile(); let task = E.mission(base, learner);
  check("original two docks open with an empty student program, never a generated route", () => {
    assert.equal(task.required, 2); assert.equal(task.parameterStep, "route");
    assert.equal(task.grid.flatMap(row => [...row]).filter(t => t !== "_").length, 49);
    assert.equal(task.grid[4][2], "s"); assert.equal(task.grid[4][3], "_");
    assert.equal(task.terrain.heights["4,6"], 2); assert.equal(task.terrain.stairs.length, 2);
    assert.equal(P.draft(learner).commands.length, 0); assert.equal(P.draft(learner).binding, null);
    assert.throws(() => P.source(task, P.draft(learner)), /先点一条指令/);
  });
  const edit = input => adapter.edit(task, learner, input);
  edit({ action: "add", value: "move" }); edit({ action: "add", value: "right" });
  check("each click adds exactly one instruction, without hidden turns or movement", () => {
    assert.equal(P.source(task, P.draft(learner)), "move()\nturn_right()");
  });
  edit({ action: "select", value: "1" }); edit({ action: "add", value: "collect" });
  check("original replace interaction changes the selected row instead of inserting", () => {
    assert.equal(P.source(task, P.draft(learner)), "collect()\nturn_right()");
    assert.equal(P.draft(learner).selected, null);
  });
  edit({ action: "add", value: "move" });
  edit({ action: "remove", value: "2" }); edit({ action: "undo" });
  check("remove and undo preserve the original ordered program", () => assert.equal(P.source(task, P.draft(learner)), "collect()\nturn_right()\nmove()"));
  edit({ action: "clear" }); edit({ action: "undo" });
  check("clear is reversible and refresh retains the student's commands", () => {
    const restored = E.profile(clone(learner)); E.mission(base, restored);
    assert.equal(P.source(task, P.draft(restored)), "collect()\nturn_right()\nmove()");
  });
  edit({ action: "clear" }); edit({ action: "add", value: "call" });
  const id = P.draft(learner).commands[0].id;
  edit({ action: "binding", value: "distance" });
  check("new call starts with an empty argument, and identifies the missing row", () => assert.throws(() => P.source(task, P.draft(learner)), /第 1 条.*步数/));
  edit({ field: `argument-${id}`, value: "0" });
  check("zero is a real editable argument, not treated as missing", () => assert.match(P.source(task, P.draft(learner)), /walk\(0\)/));
  edit({ action: "clear" });
  for (let i = 0; i < P.limit; i++) edit({ action: "add", value: "move" });
  const tooMany = edit({ action: "add", value: "move" });
  check("program limit blocks extra insertion without silently dropping commands", () => {
    assert.equal(P.draft(learner).commands.length, P.limit); assert.match(tooMany.notice, /最多/);
    edit({ action: "select", value: String(P.draft(learner).commands[0].id) });
    edit({ action: "add", value: "left" });
    assert.equal(P.draft(learner).commands.length, P.limit); assert.equal(P.draft(learner).commands[0].action, "left");
  });
}
{
  const learner = E.profile(); let task = E.mission(base, learner);
  adapter.edit(task, learner, { action: "intro-start" }); task = E.mission(base, learner);
  check("optional experiment also starts with student clicks", () => {
    assert.equal(P.draft(learner).commands.length, 0);
    adapter.edit(task, learner, { action: "intro-next" }); assert.equal(learner.parameterStep, "recall");
  });
  adapter.edit(task, learner, { action: "add", value: "call" }); adapter.edit(task, learner, { action: "add", value: "collect" });
  async function runDraft() {
    const d = clone(P.draft(learner)), execution = await P.compile(task, d, c.Sk), attempt = P.assess(task, d, execution, false);
    P.record(learner, attempt); return { execution, attempt };
  }
  const short = await runDraft();
  check("fixed two-step experiment succeeds but never completes the course", () => {
    assert.equal(short.attempt.worldSuccess, true); assert.equal(short.attempt.calls[0].moves, 2);
    assert.equal(learner.completed, false); assert.equal(learner.guidedComplete, false); assert.equal(short.attempt.practiceOnly, true);
  });
  adapter.edit(task, learner, { action: "intro-next" }); task = E.mission(base, learner);
  const far = await runDraft();
  check("farther target reuses the student's exact program and fails after two steps", () => {
    assert.equal(far.execution.source, short.execution.source); assert.equal(far.attempt.worldSuccess, false);
    assert.equal(far.attempt.calls[0].moves, 2); assert.ok(learner.parameterIntroEvidence.mismatch);
  });
  const restored = E.profile(clone(learner)); E.mission(base, restored);
  check("refresh preserves experiment position and self-authored commands", () => {
    assert.equal(restored.parameterStep, "mismatch"); assert.ok(restored.parameterIntroEvidence.recall);
    assert.equal(P.draft(restored).commands.length, 2);
  });
  adapter.edit(task, learner, { action: "intro-next" }); task = E.mission(base, learner);
  const call = P.draft(learner).commands.find(c => c.action === "call");
  adapter.edit(task, learner, { field: `argument-${call.id}`, value: "4" });
  const unwired = await runDraft();
  check("an input of four cannot silently change a loop fixed at two", () => {
    assert.equal(unwired.attempt.calls[0].argument, 4); assert.equal(unwired.attempt.calls[0].count, 2);
    assert.equal(unwired.attempt.success, false);
  });
  adapter.edit(task, learner, { action: "binding", value: "distance" });
  const connected = await runDraft();
  check("linking the parameter changes real movement; live feedback does not reveal future values", () => {
    assert.equal(connected.attempt.calls[0].moves, 4); assert.ok(learner.parameterIntroEvidence.connect);
    const events = connected.execution.events, index = events.findIndex(e => e.type === "function-call");
    const html = c.CodeQuestParameterLessonUI.live({ execution: connected.execution, index: index + 1, event: events[index] });
    assert.match(html, /等待读取次数/); assert.match(html, /已走 <strong>0<\/strong>/); assert.doesNotMatch(html, /重复 4 次/);
  });
  adapter.edit(task, learner, { action: "intro-next" }); task = E.mission(base, learner);
  check("returning from help carries the function binding but never supplies a route", () => {
    assert.equal(task.parameterStep, "route"); assert.equal(P.draft(learner).binding, "distance");
    assert.equal(P.draft(learner).commands.length, 0); assert.equal(learner.guidedComplete, false);
  });
}
for (const phase of ["guided", "repair", "challenge"]) for (const variant of [0, 1, 2]) {
  const { p, m } = make(phase, variant), { execution, attempt, d } = await run(m, p);
  check(`${phase}/${variant}: student sequence, real parameters, original terrain, two gems`, () => {
    assert.equal(execution.error, null); assert.equal(attempt.success, true);
    assert.deepEqual(clone(attempt.calls.map(a => a.moves)), clone(m.lessonInputs));
    assert.ok(attempt.calls.every(c => c.validLeg && c.read === c.argument && c.returned));
    assert.equal(execution.finalState.collectedKeys.length, 2);
    assert.equal(execution.events.filter(e => e.type === "turn").length, 4);
    const ids = new Set(P.program(m, d).steps.map(s => s.id));
    assert.ok(execution.events.every(e => ids.has(e.programStep)), "every event belongs to a student instruction");
    assert.equal(P.program(m, d).steps.length, d.commands.length);
    assert.ok(execution.events.filter(e => e.type === "move").every(e => m.grid[e.state.y][e.state.x] !== "_"));
  });
}
for (const variant of [0, 1]) {
  const { p, m } = make("repair", variant), { attempt } = await run(m, p, { binding: "constant" });
  check(`fixed 3 exposes the parameter bug for input ${m.lessonInputs[0]}`, () => {
    assert.equal(attempt.success, false); assert.equal(attempt.calls[0].count, 3); assert.equal(attempt.calls[0].read, undefined);
    assert.equal(attempt.calls[0].moves, 3); assert.match(attempt.failure, /没有可以采集/); assert.equal(p.repairEvidence, null);
  });
}
{
  const { p, m } = make();
  const commands = fixture(m.lessonInputs); commands.find(c => c.action === "left").action = "right";
  const wrong = await run(m, p, { commands });
  check("student's wrong turn executes and fails; no route correction is inserted", () => {
    assert.equal(wrong.attempt.success, false); assert.match(wrong.execution.source, /turn_right/);
  });
  const wrongDistance = fixture([3, 4]); const wrongCall = await run(m, p, { commands: wrongDistance });
  check("wrong legal argument is allowed to run and causes an observable miss", () => {
    assert.equal(wrongCall.attempt.success, false); assert.equal(wrongCall.attempt.calls[0].moves, 3);
  });
  const expanded = fixture(m.lessonInputs).flatMap(c => c.action === "call" ? Array.from({length:c.argument},()=>({action:"move"})) : [c]).map((c,i)=>({...c,id:i+1}));
  const basic = await run(m, p, { binding: null, commands: expanded });
  check("all-basic solution may collect gems but cannot prove parameter use", () => {
    assert.equal(basic.attempt.worldSuccess, true); assert.equal(basic.attempt.success, false);
    assert.equal(basic.attempt.calls.length, 0); assert.equal(p.guidedEvidence, null);
  });
  const [a,b] = m.lessonInputs;
  const reuse = [{action:"call",argument:a},{action:"collect"},{action:"right"},{action:"right"},{action:"call",argument:a},
    {action:"left"},{action:"call",argument:4},{action:"left"},{action:"call",argument:b},{action:"collect"}].map((n,i)=>({id:i+1,...n}));
  const alternative = await run(m,p,{commands:reuse});
  check("extra meaningful calls for returning and crossing the bridge are accepted",()=>{
    assert.equal(alternative.attempt.success,true);assert.equal(alternative.attempt.calls.length,4);
    assert.equal(alternative.attempt.calls.filter(c=>c.validLeg).length,2);
  });
  const decoy = expanded.slice(); decoy.unshift({id:90,action:"call",argument:0});
  const bypass = await run(m,p,{commands:decoy});
  check("a token parameter call unrelated to a dock cannot earn the knowledge proof",()=>{
    assert.equal(bypass.attempt.worldSuccess,true);assert.equal(bypass.attempt.success,false);
  });
  const old=clone(p);old.contentRevision="1.8-19.3";old.mastered=true;E.mission(base,old);
  check("previous prewritten route is archived; new lesson opens an empty program",()=>{
    assert.ok(old.contentArchives["1.8-19.3"].attempts.length);assert.equal(P.draft(old).commands.length,0);assert.equal(old.mastered,false);
    const archive=old.contentArchives["1.8-19.3"];
    assert.equal(archive.format,"indexed-attempts-v1");
    assert.equal(new Set(archive.attempts.map(a=>a.id)).size,archive.attempts.length);
    const guided=archive.attempts.find(a=>a.id===archive.guidedEvidence.attemptId);
    assert.deepEqual(clone(guided.events),clone(p.guidedEvidence.events));
  });
}

// Keep legacy repair-pair validation, but do not make it a learner prerequisite.
{
  const {p,m} = make("repair");
  await run(m,p);
  check("a repair proof still requires an original failed run", () => assert.equal(p.repairEvidence,null));
  await run(m,p,{binding:"constant"}); await run(m,p);
  check("legacy repair records remain readable", () => {
    assert.ok(p.repairEvidence); assert.equal(P.explain(p,0,3,2,"find"),false);
    assert.equal(P.explain(p,0,3,2,"forward"),true);
  });
}
const p = make().p;
let m = E.mission(base,p);
await run(m,p);
check("construction alone does not mark mastery",()=>assert.equal(p.mastered,false));
E.switchChallenge(p,"challenge");m=E.mission(base,p);
await run(m,p);
check("construction plus one independent transfer completes the lesson without repair or explanation",()=>{
  assert.equal(p.mastered,true);assert.equal(p.repairEvidence,null);assert.equal(p.explanationEvidence,null);
  assert.equal(Object.keys(p.transferEvidence).length,1);
});
check("same-task and changed-rule proofs cannot substitute for independent transfer",()=>{
  const repeated=clone(p); repeated.transferEvidence={repeat:{...clone(p.guidedEvidence),independent:true}};
  assert.equal(V.parameterGate(repeated,P.revision).mastered,false);
  const changed=clone(p); Object.values(changed.transferEvidence)[0].ruleVersion="different rule";
  assert.equal(V.parameterGate(changed,P.revision).mastered,false);
});
{
  const extra=clone(p);E.switchChallenge(extra,"challenge",true);const next=E.mission(base,extra);const zero=await run(next,extra);
  check("zero-step practice stays available after completion without adding a required stage",()=>{
    assert.equal(zero.attempt.calls[0].moves,0);assert.equal(zero.attempt.calls[0].returned,true);assert.equal(extra.mastered,true);
  });
}
check("persist/reload recomputes mastery from actual construction and transfer",()=>{
  const restored=E.profile(clone(p));E.mission(base,restored);assert.equal(restored.mastered,true);
  const fake=E.profile({version:E.version,mastered:true,contentRevision:P.revision});E.mission(base,fake);assert.equal(fake.mastered,false);
  const incomplete=clone(p);incomplete.transferEvidence={};assert.equal(V.parameterGate(incomplete,P.revision).mastered,false);
});
check("free text cannot replace the missing transfer run",()=>{
  const other=clone(p);other.transferEvidence={};E.review(m,other,"。");E.mission(base,other);assert.equal(other.mastered,false);
});
check("old versions 1–6 keep archives, never inherit mastery", () => {
  for (const version of [1, 2, 3, 4, 5, 6]) {
    const old = { version, mastered: true, completed: true, guidedComplete: true, attempts: [] };
    const migrated = E.profile(old); E.mission(base, migrated);
    assert.equal(migrated.mastered, false); assert.equal(migrated.completed, true);
    assert.equal(migrated.legacyEvidence.mastered, true); assert.equal(migrated.version, 7);
    const merged = E.merge(migrated, old); E.mission(base, merged); assert.equal(merged.mastered, false);
  }
});
check("content revision change invalidates old proof without deleting history", () => {
  const outdated = clone(p); outdated.contentRevision = "1.8-19.0";
  E.mission(base, outdated); assert.equal(outdated.mastered, false); assert.equal(outdated.guidedEvidence, null);
  assert.ok(outdated.contentArchives["1.8-19.0"].guidedEvidence);
});
check("merging stale mastered flag cannot upgrade an incomplete record", () => {
  const clean = E.profile(); E.mission(base, clean);
  const old = { version: 6, mastered: true, updatedAt: "2099-01-01" };
  assert.equal(E.merge(clean, old).mastered, false);
});
check("newer timestamp on a legacy lesson cannot replace registered v1.8 proof", () => {
  const stale = E.profile({ version: 7, contentRevision: "1.7-19-evidence2", updatedAt: "2099-01-01", mastered: true });
  const merged = E.merge(p, stale);
  assert.equal(merged.contentRevision, P.revision); assert.equal(merged.mastered, true);
});
check("helped practice preserves an earlier independent success locally and in merge", () => {
  const other = clone(p), proof = Object.values(other.transferEvidence)[0];
  const retry = { ...clone(proof), id: "helped-retry", at: "2099-01-01", assisted: true };
  P.record(other, retry);
  assert.equal(other.transferEvidence[proof.fingerprint].id, proof.id);
  const remote = clone(p); remote.updatedAt = "2099-01-01"; remote.transferEvidence[proof.fingerprint] = retry;
  assert.equal(E.merge(p, remote).transferEvidence[proof.fingerprint].id, proof.id);
});
check("strong-help exposure follows semantics, not phase or numbering", () => {
  const other = E.profile(); const world = E.mission(base, other);
  V.expose(other, world, 3, true);
  const renamed = clone(world); renamed.early.key = "new-index"; renamed.title = "new decoration";
  V.enter(other, renamed); assert.equal(other.assisted, true);
  const changed = clone(world); changed.terrain.heights["5,6"] = 1;
  assert.notEqual(V.fingerprint(world), V.fingerprint(changed));
  const shuffled = { ...world, terrain: { ...world.terrain, heights: Object.fromEntries(Object.entries(world.terrain.heights).reverse()) } };
  assert.equal(V.fingerprint(world), V.fingerprint(shuffled));
});
{
  const assisted = clone(p), fp = Object.keys(assisted.transferEvidence)[0];
  assisted.semanticExposures[fp] = { assisted: true, hintLevel: 3, firstAssistedAt: "2000-01-01" };
  const merged = E.merge(p, assisted);
  check("cloud help evidence cannot be erased by a clean local draft", () => assert.equal(merged.mastered, false));
  assisted.semanticExposures[fp].firstAssistedAt = "2099-01-01";
  check("later practice hints do not retroactively erase independent proof", () => assert.equal(V.parameterGate(assisted, P.revision).mastered, true));
}

// Lesson 17: the student's original cards drive the route while one reusable rule drives real Python variables.
const stateAdapter = c.CodeQuestStructuredLessons.get(17);
const stateMake = (phase = "guided", variant = 0) => {
  const p = E.profile(); E.mission(stateBase, p); p.phase = phase; p.variant = variant;
  const m = E.mission(stateBase, p), d = S.draft(p);
  Object.assign(d, { initialCount: 0, updateOn: "success", delta: 1, commands: S.authorCommands(phase, variant), selected: null });
  return { p, m, d };
};
async function runState(state, overrides = {}) {
  Object.assign(state.d, overrides);
  const execution = await S.compile(state.m, state.d, c.Sk);
  const attempt = S.assess(state.m, state.d, execution, state.p.assisted);
  S.record(state.p, attempt);
  return { execution, attempt };
}
{
  const learner = E.profile(), task = E.mission(stateBase, learner), d = S.draft(learner);
  check("lesson 17 opens with an empty route and empty count-rule slots", () => {
    assert.equal(task.contentRevision, S.revision); assert.equal(d.commands.length, 0);
    assert.equal(d.initialCount, null); assert.equal(d.updateOn, null); assert.equal(d.delta, null);
    assert.throws(() => S.source(task, d), /先点一条指令/);
  });
  stateAdapter.edit(task, learner, { action: "add", value: "move" });
  stateAdapter.edit(task, learner, { action: "add", value: "attempt" });
  stateAdapter.edit(task, learner, { action: "select", value: String(d.commands[0].id) });
  stateAdapter.edit(task, learner, { action: "add", value: "right" });
  stateAdapter.edit(task, learner, { action: "remove", value: String(d.commands[1].id) });
  stateAdapter.edit(task, learner, { action: "undo" });
  check("lesson 17 keeps append, replace, remove and undo card behavior", () => {
    assert.deepEqual(clone(d.commands.map(command => command.action)), ["right", "attempt"]);
    assert.doesNotMatch(S.program(task, d, true).source, /go_to_|navigate/);
  });
}
{
  const state = stateMake(), { execution, attempt } = await runState(state);
  check("guided count rule runs success, duplicate and empty attempts before crossing the real gate", () => {
    assert.equal(execution.error, null); assert.equal(attempt.success, true); assert.equal(attempt.worldSuccess, true);
    assert.deepEqual(clone(attempt.attempts.map(item => item.reason)), ["collected", "already-collected", "empty", "collected"]);
    assert.deepEqual(clone(attempt.attempts.map(item => item.countAfter)), [1, 1, 1, 2]);
    assert.equal(execution.finalState.variables.count, 2); assert.equal(execution.finalState.collectedKeys.length, 2);
    assert.equal(execution.finalState.gates.COUNT, true);
    assert.deepEqual(clone([execution.finalState.x, execution.finalState.y]), clone([state.m.terminal.x, state.m.terminal.y]));
    assert.ok(execution.events.filter(event => event.type === "collect-attempt").every(event => event.state.ticks > 0));
  });
  check("all executed lesson actions map back to a student card or the visible count rule", () => {
    const ids = new Set(S.program(state.m, state.d).steps.map(step => step.id)); ids.add("count-rule");
    assert.ok(execution.events.every(event => ids.has(event.programStep)));
  });
  const restored = E.profile(clone(state.p)); E.mission(stateBase, restored);
  check("refresh restores lesson 17 cards, rule and guided evidence", () => {
    assert.equal(restored.guidedEvidence.success, true); assert.equal(S.draft(restored).commands.length, state.d.commands.length);
    assert.deepEqual(clone(restored.savedCountRule), { initialCount: 0, updateOn: "success", delta: 1 });
  });
}
for (const bad of [
  { name: "attempt +1", rule: { updateOn: "attempt" }, expected: 4 },
  { name: "success +2", rule: { delta: 2 }, expected: 4 },
  { name: "wrong initial", rule: { initialCount: 2 }, expected: 4 },
  { name: "zero delta", rule: { delta: 0 }, expected: 0 }
]) {
  const state = stateMake(), { execution, attempt } = await runState(state, bad.rule);
  check(`lesson 17 legal misconception executes and is rejected: ${bad.name}`, () => {
    assert.ok(execution.events.some(event => event.type === "count-check" && !event.countCheck.passed));
    assert.equal(execution.finalState.variables.count, bad.expected); assert.equal(attempt.success, false);
    assert.equal(execution.finalState.gates.COUNT, false); assert.match(attempt.failure, /计数/);
  });
}
{
  const state = stateMake("challenge"), { execution, attempt } = await runState(state);
  check("one-gem independent transfer changes layout and still proves the same count rule", () => {
    assert.equal(attempt.success, true); assert.deepEqual(clone(attempt.attempts.map(item => item.reason)), ["empty", "collected", "already-collected"]);
    assert.equal(execution.finalState.variables.count, 1); assert.equal(attempt.ruleVersion, V.canonical({ initialCount: 0, updateOn: "success", delta: 1 }));
  });
}
{
  const guided = stateMake(); await runState(guided);
  E.switchChallenge(guided.p, "challenge"); let m = E.mission(stateBase, guided.p), d = S.draft(guided.p);
  Object.assign(d, { commands: S.authorCommands("challenge", 0) });
  V.expose(guided.p, m, 3, true);
  let helped = await runState({ p: guided.p, m, d });
  check("strong help lets lesson 17 finish a map but cannot award transfer", () => {
    assert.equal(helped.attempt.success, true); assert.equal(guided.p.mastered, false);
  });
  E.switchChallenge(guided.p, "challenge", true); m = E.mission(stateBase, guided.p); d = S.draft(guided.p);
  Object.assign(d, { commands: S.authorCommands("challenge", 1) });
  const clean = await runState({ p: guided.p, m, d });
  check("an alternate semantic map can recover clean transfer after strong help", () => {
    assert.equal(clean.attempt.success, true); assert.notEqual(clean.attempt.fingerprint, helped.attempt.fingerprint);
    assert.equal(guided.p.mastered, true);
  });
}
{
  const state = stateMake(); await runState(state);
  E.switchChallenge(state.p, "challenge"); const transfer = { p: state.p, m: E.mission(stateBase, state.p) };
  transfer.d = S.draft(transfer.p); transfer.d.commands = S.authorCommands("challenge");
  const result = await runState(transfer);
  check("construction plus one clean transfer is the complete lesson 17 ability gate", () => {
    assert.equal(result.attempt.success, true); assert.equal(state.p.mastered, true);
    assert.equal(V.stateGate(state.p, S.revision).transfer, true); assert.equal(state.p.repairEvidence, null);
  });
  const wire = JSON.stringify({ courseId: "signal-runner", lessonId: "course-17", status: "completed", progress: { earlyEvidence: state.p } });
  const bytes = Buffer.byteLength(wire);
  await readJson(Readable.from([Buffer.from(wire)]), { maxBytes: 512 * 1024 });
  check(`lesson 17 complete proof fits progress endpoint (${bytes} bytes)`, () => assert.ok(bytes < 512 * 1024));
  const fake = clone(state.p); fake.transferEvidence = {};
  check("world completion or a stored mastered flag cannot replace transfer evidence", () => {
    fake.mastered = true; assert.equal(V.stateGate(fake, S.revision).mastered, false);
  });
}
{
  const zeroWorld = { grid: ["_____", "_SgR_", "_____"], start: { x: 1, y: 1 }, startDir: "E", required: 0,
    targetPositions: [], terrain: { version: "1.8", heights: {}, stairs: [], portals: [], switches: [], gates: [{ id: "COUNT", kind: "count", at: { x: 2, y: 1 } }] } };
  const zeroRuntime = c.CodeQuestPythonRuntime.create({ Sk: c.Sk, world: zeroWorld, initialEnergy: 8,
    allowedFunctions: new Set(["try_collect", "check_count", "move"]), apiCallLimit: 30 });
  const zero = await zeroRuntime.compile("count = 0\ncollected = try_collect()\nif collected:\n    count = count + 1\ncheck_count(count)\nmove()\nmove()");
  check("zero-result fixture opens only through a real zero count check", () => {
    assert.equal(zero.finalState.variables.count, 0); assert.equal(zero.finalState.collectedKeys.length, 0);
    assert.equal(zero.finalState.gates.COUNT, true); assert.equal(zero.events.find(event => event.type === "collect-attempt").collectAttempt.reason, "empty");
  });
}
check("lesson 17 UI uses the original card builder and exactly two required phases", () => {
  const state = stateMake(), ui = c.CodeQuestStateLessonUI.render(state.m, state.p), builder = c.CodeQuestStateLessonUI.builder(state.m, state.p);
  assert.match(builder.palette, /data-value="attempt"/); assert.match(builder.palette, /data-value="check"/);
  assert.match(builder.list, /class="program-chip/); assert.match(builder.definition, /count 初值/);
  assert.match(ui, /连接成功计数/); assert.match(ui, /回收港迁移/);
  assert.doesNotMatch(ui, /data-early-action="repair"|填写解释/);
});

const terrain = { version: "1.8", heights: { "2,1": 1, "3,1": 1, "4,1": 1 },
  stairs: [{ from: { x: 1, y: 1 }, to: { x: 2, y: 1 } }],
  portals: [{ id: "P", from: { x: 2, y: 1 }, to: { x: 4, y: 1 } }],
  switches: [{ id: "S", at: { x: 1, y: 1 } }], gates: [{ id: "G", switchId: "S", at: { x: 4, y: 1 } }] };
const world = { grid: ["______", "_SgBB_", "______"], start: { x: 1, y: 1 }, startDir: "E", required: 2, terrain };
const runtime = w => c.CodeQuestPythonRuntime.create({ Sk: c.Sk, world: clone(w), initialEnergy: 20,
  allowedFunctions: new Set(["move", "turn_left", "turn_right", "collect", "upload", "teleport", "activate_switch", "is_path_clear"]), apiCallLimit: 120 });
async function executeWorld(w, code) {
  try { return { ...await runtime(w).compile(code), error: null }; }
  catch (error) { return { events: error.partialEvents, finalState: error.partialState, error: String(error) }; }
}
{
  const r = await executeWorld(world, "move()\nteleport()");
  check("standing on a portal never auto-teleports; blocked landing is atomic", () => {
    assert.equal(r.events[0].type, "move"); assert.equal(r.events[0].state.x, 2);
    assert.equal(r.finalState.x, 2); assert.equal(r.finalState.ticks, 1); assert.equal(r.finalState.energy, 19);
    assert.match(r.error, /门还没有打开/);
  });
  const s = await executeWorld(world, "activate_switch()\nmove()\nmove()\ncollect()\nturn_right()\nturn_right()\nmove()\nteleport()");
  check("latched gate, stairs, cargo, heading and one explicit portal hop", () => {
    assert.equal(s.error, null); assert.equal(s.finalState.x, 4); assert.equal(s.finalState.directionName, "W");
    assert.equal(s.finalState.collectedKeys.length, 1); assert.equal(s.finalState.gates.G, true);
    assert.equal(s.events.filter(e => e.type === "teleport").length, 1);
    assert.equal(s.finalState.ticks, 8);
    assert.equal(s.finalState.energy, 17);
    const climb = s.events.find(e => e.type === "move");
    assert.equal(climb.transition.actor, "Nova");
    assert.equal(climb.transition.from.height, 0); assert.equal(climb.transition.to.height, 1);
    assert.equal(climb.transition.from.direction, climb.transition.to.direction);
  });
  const reset = await executeWorld(world, "move()\nteleport()");
  check("fresh run resets latched gates", () => assert.equal(reset.finalState.gates.G, false));
  const noStair = clone(world); noStair.terrain.stairs = [];
  const fail = await executeWorld(noStair, "move()");
  check("height without stairs blocks movement and leaves energy/state intact", () => {
    assert.match(fail.error, /没有相连台阶/); assert.equal(fail.finalState.x, 1); assert.equal(fail.finalState.energy, 20);
  });
  const gap = clone(world); gap.grid[1] = "_S_BB_"; gap.terrain = { version: "1.8" };
  const fall = await executeWorld(gap, "move()");
  check("gaps remain actual collision barriers", () => assert.match(fall.error, /没有可通行/));
  const spike = clone(world); spike.terrain.gates = []; spike.grid[1] = "_SgBH_";
  const blocked = await executeWorld(spike, "move()\nteleport()");
  check("unsafe portal destination leaves position and tick unchanged", () => {
    assert.match(blocked.error, /尖刺格/); assert.equal(blocked.finalState.x, 2); assert.equal(blocked.finalState.ticks, 1);
  });
}
{
  const w = { grid: ["_____", "_SBR_", "_____"], start: { x: 1, y: 1 }, startDir: "E", required: 1 };
  const r = await executeWorld(w, "move()\ncollect()\nmove()\nupload()\ncollect()");
  check("Python upload does not swallow trailing errors", () => {
    assert.ok(r.events.some(e => e.type === "upload")); assert.match(r.error, /没有可以采集/);
  });
}
check("original card builder carries parameter controls and only two named stages", () => {
  const ui=c.CodeQuestParameterLessonUI.render(m,p), builder=c.CodeQuestParameterLessonUI.builder(m,p);
  assert.match(builder.definition,/data-lesson-action="binding" data-value="distance"/);
  assert.match(builder.palette,/class="command-button is-logic" data-lesson-action="add" data-value="call"/);
  const learner=clone(p);Object.assign(P.draft(learner),{binding:"distance",commands:fixture(m.lessonInputs)});
  const populated=c.CodeQuestParameterLessonUI.builder(m,learner);
  assert.match(populated.list,/class="program-chip/);assert.match(populated.list,/class="program-replace"/);
  assert.match(populated.list,/data-lesson-field="argument-/);
  assert.match(ui,/连接参数槽/);assert.match(ui,/距离参数迁移/);
  assert.doesNotMatch(ui,/data-early-action="repair"|检查说明|自己编|换图试/);
  assert.doesNotMatch(ui,/early-evidence-disclosure" open|\bundefined\b/);
});
{
  // Fill the full recent-attempt ring and all three independent proofs, as an active learner would.
  E.switchChallenge(p, "challenge", true); m = E.mission(base, p); await run(m, p);
  for (let n = 0; n < 12; n++) await run(m, p);
  const wire = JSON.stringify({ courseId: "signal-runner", lessonId: "course-19", status: "completed", progress: { earlyEvidence: p } });
  const bytes = Buffer.byteLength(wire);
  assert.ok(bytes < 512 * 1024, `full evidence payload ${bytes} bytes`);
  await readJson(Readable.from([Buffer.from(wire)]), { maxBytes: 512 * 1024 });
  await assert.rejects(() => readJson(Readable.from([Buffer.alloc(65 * 1024)])), /too large/);
  await assert.rejects(() => readJson(Readable.from([Buffer.alloc(513 * 1024)]), { maxBytes: 512 * 1024 }), /too large/);
  check(`full saved proof fits progress endpoint (${bytes} bytes); normal API limits unchanged`, () => {});
}
// Run the production playback functions; only rendering, timers and persistence are stubbed.
// This checks the boundary where a compiled trace becomes a saved student attempt.
{
  const app = await read("app.js");
  const productionFunction = name => {
    const start = app.search(new RegExp(`  (?:async )?function ${name}\\(`));
    assert.ok(start >= 0);
    return app.slice(start, app.indexOf("\n  }", start) + 4);
  };
  function player(compile = (m, d) => P.compile(m, d, c.Sk), scenario = make()) {
    const { p, m } = scenario;
    if (m.parameterStep === "route") Object.assign(P.draft(p), { binding: "distance", commands: fixture(m.lessonInputs) });
    const adapter = { ...c.CodeQuestStructuredLessons.get(19), compile };
    let saves = 0, timerId = 0, courseCompletions = 0;
    const timers = new Map();
    const ui = { console, structuredPlayback: null, structuredEpoch: 0, earlyRun: null, animationFrame: null,
      runTimer: null, sim: null, earlyNotice: "", directions: ["N", "E", "S", "W"],
      CodeQuestStructuredLessons: { get: () => adapter }, CodeQuestEvidence: V,
      mission: () => m, earlyProfile: () => p, render() {}, showRunBlocker() {}, log() {}, startMotion() {},
      saveEarlyProfile() { saves++; }, complete() { courseCompletions++; ui.sim.completed = true; },
      setInterval(fn) { timers.set(++timerId, fn); return timerId; }, clearInterval(id) { timers.delete(id); }
    };
    ui.window = ui; vm.createContext(ui);
    for (const name of ["parseGrid", "tileKey", "resetSimulation", "stopAutoRun", "runStructuredProgram", "advanceStructuredPlayback"])
      vm.runInContext(productionFunction(name), ui);
    ui.resetSimulation();
    return { ui, p, timers, saves: () => saves, completions: () => courseCompletions };
  }
  const introProfile = E.profile(); E.mission(base, introProfile);
  introProfile.parameterStep = "recall"; const introMission = E.mission(base, introProfile);
  P.draft(introProfile).commands = [{ id: 1, action: "call" }, { id: 2, action: "collect" }];
  const experiment = player(undefined, { p: introProfile, m: introMission });
  await experiment.ui.runStructuredProgram(false);
  while (!experiment.ui.structuredPlayback.finished) experiment.ui.advanceStructuredPlayback();
  check("production player never awards course completion for the short experiment", () => {
    assert.equal(experiment.completions(), 0); assert.equal(experiment.ui.sim.completed, true);
    assert.equal(introProfile.completed, false); assert.ok(introProfile.parameterIntroEvidence.recall);
  });
  const single = player(); await single.ui.runStructuredProgram(false);
  check("single step shows exactly one real event and saves no premature proof", () => {
    assert.equal(single.ui.structuredPlayback.index, 1); assert.equal(single.p.attempts.length, 0);
    assert.equal(single.timers.size, 0);
  });
  const auto = player(); await auto.ui.runStructuredProgram(true);
  await auto.ui.runStructuredProgram(true); // Pause, preserving the current event.
  const pausedAt = auto.ui.structuredPlayback.index;
  check("pause keeps the playback cursor; manual step advances one event", () => {
    assert.equal(auto.timers.size, 0); assert.equal(auto.ui.structuredPlayback.playing, false);
  });
  await auto.ui.runStructuredProgram(false); assert.equal(auto.ui.structuredPlayback.index, pausedAt + 1);
  while (!auto.ui.structuredPlayback.finished) auto.ui.advanceStructuredPlayback();
  while (!single.ui.structuredPlayback.finished) single.ui.advanceStructuredPlayback();
  check("auto/pause/step and single-step finish at identical states and save once", () => {
    assert.equal(auto.p.attempts[0].success, true);
    assert.deepEqual(clone(auto.p.attempts[0].events), clone(single.p.attempts[0].events));
    auto.ui.advanceStructuredPlayback(); assert.equal(auto.saves(), 1);
  });
  const interrupted = player(); await interrupted.ui.runStructuredProgram(true); interrupted.ui.resetSimulation();
  check("reset cancels playback without erasing old proof or awarding new proof", () => {
    assert.equal(interrupted.timers.size, 0); assert.equal(interrupted.ui.structuredPlayback, null);
    assert.equal(interrupted.p.attempts.length, 0);
    auto.ui.resetSimulation(); assert.equal(auto.p.attempts.length, 1);
  });
  let release;
  const pending = player((m, d) => new Promise(resolve => { release = async () => resolve(await P.compile(m, d, c.Sk)); }));
  const preparing = pending.ui.runStructuredProgram(true);
  pending.ui.resetSimulation(); await release(); await preparing;
  check("late compile result after reset cannot restart playback or save proof", () => {
    assert.equal(pending.ui.structuredPlayback, null); assert.equal(pending.timers.size, 0);
    assert.equal(pending.saves(), 0);
  });
}
console.log(`v1.8 learning foundation: ${checks} scenario groups passed.`);
