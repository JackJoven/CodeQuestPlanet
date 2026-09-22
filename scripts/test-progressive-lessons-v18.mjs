import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const read = file => readFile(new URL(`../signal-runner-node/${file}`, import.meta.url), "utf8");
const c = { console, performance, setTimeout, clearTimeout, setImmediate, setInterval, clearInterval };
c.window = c; c.globalThis = c;
vm.createContext(c);
for (const file of ["vendor/skulpt-1.2.0.min.js", "world-rules.js", "learning-evidence.js", "structured-lessons.js", "python-runtime-core.js",
  "progressive-lessons.js", "progressive-lessons-ui.js", "course-data.js", "v16-course-overrides.js", "early-lessons.js"])
  vm.runInContext(await read(file), c, { filename: file });

const E = c.CodeQuestEarlyLessons;
const clone = value => JSON.parse(JSON.stringify(value));
let checks = 0;
const check = (name, fn) => { fn(); checks += 1; console.log(`✓ ${name}`); };

async function execute(number, phase, learner = null, variant = 0, prepare = null) {
  const p = learner || E.profile(), base = c.SignalRunnerCourseData.missions[number - 1];
  E.mission(base, p); Object.assign(p, { phase, variant });
  let m = E.mission(base, p), adapter = c.CodeQuestStructuredLessons.get(number);
  prepare ? prepare(adapter.draft(p), m, adapter, p) : adapter.reference(m, p);
  m = E.mission(base, p);
  const d = clone(adapter.draft(p)), execution = await adapter.compile(m, d, c.Sk);
  const attempt = adapter.assess(m, d, execution, p.assisted); adapter.record(p, attempt);
  return { p, m, d, execution, attempt, adapter, base };
}

for (const number of [6, 7]) {
  const guided = await execute(number, "guided");
  check(`lesson ${number} author solution proves the guided concept`, () => assert.equal(guided.attempt.success, true, guided.attempt.failure));
  const transfer = await execute(number, "challenge", guided.p);
  check(`lesson ${number} independent world changes semantics and completes mastery`, () => {
    assert.equal(transfer.attempt.success, true, transfer.attempt.failure);
    assert.notEqual(transfer.attempt.fingerprint, guided.attempt.fingerprint);
    assert.equal(transfer.p.mastered, true);
  });
}

{
  const failed = await execute(8, "guided", null, 0, () => {});
  check("lesson 8 starts with a runnable faulty rescue and records failure", () => {
    assert.equal(failed.attempt.success, false); assert.equal(failed.p.debugRuns[failed.m.early.key], true);
  });
  const fixed = await execute(8, "guided", failed.p);
  check("lesson 8 repaired rescue preserves teleport and dependency evidence", () => {
    assert.equal(fixed.attempt.success, true, fixed.attempt.failure); assert.equal(fixed.attempt.teleported, true); assert.equal(fixed.attempt.latched, true);
  });
  const transfer = await execute(8, "challenge", fixed.p);
  check("lesson 8 changed rescue map completes the stage gate", () => { assert.equal(transfer.attempt.success, true, transfer.attempt.failure); assert.equal(transfer.p.mastered, true); });
}

for (const number of [9, 10, 11, 12, 13, 14, 15]) {
  const guided = await execute(number, "guided");
  check(`lesson ${number} author structure executes through real Python`, () => assert.equal(guided.attempt.success, true, guided.attempt.failure));
  const transfer = await execute(number, "challenge", guided.p);
  check(`lesson ${number} independent structure proof completes mastery`, () => {
    assert.equal(transfer.attempt.success, true, transfer.attempt.failure);
    assert.notEqual(transfer.attempt.fingerprint, guided.attempt.fingerprint);
    assert.equal(transfer.p.mastered, true);
  });
}

{
  const world = c.CodeQuestProgressiveLessons.designerWorld(false, { fields: { ruleFix: "remove-wall" } });
  const edge = world.terrain.oneWays[0], reverseDir = edge.from.x < edge.to.x ? "W" : edge.from.x > edge.to.x ? "E" : edge.from.y < edge.to.y ? "N" : "S";
  const runtime = c.CodeQuestPythonRuntime.create({ Sk: c.Sk, initialEnergy: 20, apiCallLimit: 40,
    allowedFunctions: new Set(["move", "turn_left", "turn_right"]),
    world: { grid: world.grid, start: edge.to, startDir: reverseDir, required: 0, targetPositions: [], terrain: world.terrain } });
  let error;
  try { await runtime.compile("move()") } catch (caught) { error = caught; }
  check("one-way passage rejects reverse movement without turning the actor", () => {
    assert.ok(error); assert.match(String(error), /单向通道/); assert.equal(error.partialState.x, edge.to.x); assert.equal(error.partialState.y, edge.to.y);
  });
}

{
  const ring = c.CodeQuestProgressiveLessons.designerWorld(false, { fields: { ruleFix: "remove-wall" } });
  const station = c.CodeQuestProgressiveLessons.booleanWorld("clear");
  check("lesson 7 uses an outer ring, raised inner loop and editable final approach", () => {
    assert.equal(ring.grid.length,11); assert.equal(ring.grid[0].length,13); assert.equal(ring.terrain.stairs.length,1);
    assert.equal(ring.actionCount,27); assert.ok(ring.labels.some(item=>item.text.includes("内圈")));
  });
  check("lesson 14 uses three spatially separated sensor wings around a central gate", () => {
    assert.equal(station.grid.length,9); assert.equal(station.grid[0].length,11); assert.equal(station.labels.length,4);
    assert.equal(station.start.x,5); assert.equal(station.start.y,6); assert.equal(station.startDir,"N");
  });
}

{
  const world = c.CodeQuestProgressiveLessons.conveyorWorld(2);
  const runtime = c.CodeQuestPythonRuntime.create({ Sk: c.Sk, initialEnergy: 20, apiCallLimit: 40,
    allowedFunctions: new Set(["move", "collect"]), world: { grid: world.grid, start: world.start, startDir: world.startDir,
      required: 2, targetPositions: world.targets, terrain: world.terrain } });
  const result = await runtime.compile("move()\ncollect()\nmove()\ncollect()");
  check("conveyor adds one visible displacement but never collects automatically", () => {
    assert.equal(result.events.filter(e => e.type === "conveyor").length, 2);
    assert.equal(result.events.filter(e => e.type === "collect").length, 2);
    assert.equal(result.finalState.directionName, "E");
  });
}

{
  const world = c.CodeQuestProgressiveLessons.functionWorld(10, false);
  const runtime = c.CodeQuestPythonRuntime.create({ Sk: c.Sk, initialEnergy: 20, apiCallLimit: 40,
    allowedFunctions: new Set(["move", "turn_left", "turn_right", "collect"]), languageFeatures: ["functions"],
    world: { grid: world.grid, start: world.start, startDir: world.startDir, required: world.targets.length, targetPositions: world.targets, terrain: world.terrain } });
  const source = "def visit_side():\n    turn_left()\n    move()\n    move()\n    collect()\n    turn_right()\n    move()\n    move()\n    turn_left()\n\nvisit_side()";
  const result = await runtime.compile(source);
  check("rotator turns exactly once on entry and keeps position unchanged", () => {
    const event = result.events.find(e => e.type === "rotator"); assert.ok(event); assert.deepEqual([event.transition.from.x,event.transition.from.y],[event.transition.to.x,event.transition.to.y]);
  });
}

{
  const p = E.profile();
  for (const number of [6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) {
    const base = c.SignalRunnerCourseData.missions[number - 1], mission = E.mission(base, p);
    check(`lesson ${number} uses an expanded playable footprint`, () => {
      assert.ok(mission.grid.length >= 5, `lesson ${number} height ${mission.grid.length}`);
      assert.ok(mission.grid[0].length >= 9, `lesson ${number} width ${mission.grid[0].length}`);
      assert.ok(mission.grid.flatMap(row => [...row]).filter(tile => tile !== "_").length >= 15, `lesson ${number} active tiles`);
    });
  }
}

{
  const zero = await execute(15, "challenge", null, 1);
  check("lesson 15 zero-distance fixture runs the while body zero times", () => {
    assert.equal(zero.m.progressive.distance, 0); assert.equal(zero.attempt.moves, 0); assert.equal(zero.attempt.success, true, zero.attempt.failure);
  });
}

{
  const earlyUpload = await execute(6, "guided", null, 0, d => { d.commands = [{ id: 1, action: "upload" }]; });
  check("lesson 6 early upload runs and fails the real position dependency", () => { assert.equal(earlyUpload.attempt.success, false); assert.match(earlyUpload.attempt.failure, /还没有到达中继站/); });
  const sealed = await execute(7, "guided", null, 0, d => { d.fields = { target: "exit", ruleFix: "keep-wall", actionLimit: 14 }; d.commands = c.CodeQuestProgressiveLessons.designerWorld(false,d).ref.map((action,i)=>({id:i+1,action})); });
  check("lesson 7 cannot repair a sealed goal by only raising the action limit", () => { assert.equal(sealed.attempt.success, false); assert.equal(sealed.d.fields.actionLimit, 14); });
}

{
  const copied = await execute(9, "guided", null, 0, d => {
    const world = c.CodeQuestProgressiveLessons.functionWorld(9, false);
    d.commands = world.ref.flatMap(action => action === "call" ? world.fn : [action]).map((action,i)=>({id:i+1,action}));
  });
  check("lesson 9 copied main-program actions may finish the world but do not prove function calls", () => { assert.equal(copied.attempt.worldSuccess, true); assert.equal(copied.attempt.success, false); assert.equal(copied.attempt.callCount, 0); });
  const brokenContract = await execute(10, "guided", null, 0, (d,m,adapter,p) => { adapter.reference(m,p); d.functionCommands.pop(); });
  check("lesson 10 rejects a function that returns to the right place with the wrong heading", () => { assert.equal(brokenContract.attempt.success, false); assert.equal(brokenContract.attempt.contracts, false); });
}

{
  const shortLoop = await execute(11, "guided", null, 0, (d,m,adapter,p) => { adapter.reference(m,p); d.fields.loopCount = 2; });
  check("lesson 11 legal count one short leaves one real conveyor unit unfinished", () => { assert.equal(shortLoop.attempt.success, false); assert.equal(shortLoop.attempt.conveyors, 2); });
  const uploadInside = await execute(12, "guided", null, 0, (d,m,adapter,p) => { adapter.reference(m,p); d.fields.uploadScope = "inside"; });
  check("lesson 12 upload inside the loop fails before the final relay", () => { assert.equal(uploadInside.attempt.success, false); assert.match(uploadInside.attempt.failure, /上传失败/); });
}

{
  const wrongSensor = await execute(13, "guided", null, 0, (d,m,adapter,p) => { adapter.reference(m,p); d.fields.sensor = "blocked"; });
  check("lesson 13 checking blocked instead of spike produces a real hazard failure", () => { assert.equal(wrongSensor.attempt.success, false); assert.match(wrongSensor.attempt.failure, /尖刺/); });
  const orGuard = await execute(14, "challenge", null, 0, (d,m,adapter,p) => { adapter.reference(m,p); d.fields.connector = "or"; });
  check("lesson 14 OR lets a single-risk case through and is rejected", () => { assert.equal(orGuard.attempt.success, false); assert.equal(orGuard.d.fields.connector, "or"); });
  const stalled = await execute(15, "guided", null, 0, (d,m,adapter,p) => { adapter.reference(m,p); d.fields.loopBody = "wait"; });
  check("lesson 15 non-progressing while body stops safely", () => { assert.equal(stalled.attempt.success, false); assert.match(stalled.attempt.failure, /太多次|时间过长/); });
}

{
  const p = E.profile(), base = c.SignalRunnerCourseData.missions[10], adapter = c.CodeQuestStructuredLessons.get(11), m = E.mission(base,p);
  adapter.edit(m,p,{action:"add",value:"loop"}); adapter.edit(m,p,{field:"loopCount",value:"3"}); adapter.edit(m,p,{field:"loopBody",value:"complete"});
  const restored = E.profile(clone(p)); const restoredMission = E.mission(base,restored), restoredDraft = adapter.draft(restored);
  check("lesson 11 refresh restores the student's structure card and fields", () => { assert.equal(restoredDraft.commands[0].action,"loop"); assert.equal(restoredDraft.fields.loopCount,3); assert.equal(adapter.source(restoredMission,restoredDraft).includes("range(3)"),true); });
  check("lesson 6–15 UI keeps two required phases and the original card builder contract", () => {
    const ui = adapter.render(restoredMission,restored,{storage:"本机进度"}); const builder = adapter.builder(restoredMission,restored,{});
    assert.equal((ui.match(/data-early-action="(?:guided|challenge)"/g)||[]).length,2); assert.match(builder.palette,/data-lesson-action="add"/); assert.match(builder.list,/data-lesson-action="select"/);
  });
}

console.log(`v1.8 lessons 6–15: ${checks} scenario groups passed.`);
