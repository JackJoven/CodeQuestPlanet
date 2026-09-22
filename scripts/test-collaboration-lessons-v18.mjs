import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const read = file => readFile(new URL(`../signal-runner-node/${file}`, import.meta.url), "utf8");
const context = { console, performance, setTimeout, clearTimeout, setImmediate, setInterval, clearInterval };
context.window = context; context.globalThis = context; vm.createContext(context);
for (const file of ["vendor/skulpt-1.2.0.min.js", "world-rules.js", "learning-evidence.js", "structured-lessons.js", "python-runtime-core.js", "collaboration-lessons.js", "collaboration-lessons-ui.js", "course-data.js", "v16-course-overrides.js", "early-lessons.js"])
  vm.runInContext(await read(file), context, { filename: file });

const E = context.CodeQuestEarlyLessons, clone = value => JSON.parse(JSON.stringify(value));
let checks = 0; const check = (name, fn) => { fn(); checks += 1; console.log(`✓ ${name}`); };
async function execute(no, phase, learner = null, prepare = null) {
  const p = learner || E.profile(), base = context.SignalRunnerCourseData.missions[no - 1]; E.mission(base, p); Object.assign(p, { phase, variant: 0 });
  let m = E.mission(base, p); const adapter = context.CodeQuestStructuredLessons.get(no); prepare ? prepare(adapter.draft(p), m) : adapter.reference(m, p); m = E.mission(base, p);
  const d = clone(adapter.draft(p)), execution = await adapter.compile(m, d, context.Sk), attempt = adapter.assess(m, d, execution, p.assisted); adapter.record(p, attempt);
  return { p, m, d, execution, attempt, adapter };
}

for (const no of [29, 30, 31, 32]) {
  const guided = await execute(no, "guided");
  check(`lesson ${no} completes guided construction`, () => assert.equal(guided.attempt.success, true, guided.attempt.failure));
  const transfer = await execute(no, "challenge", guided.p);
  check(`lesson ${no} completes a changed independent transfer`, () => { assert.equal(transfer.attempt.success, true, transfer.attempt.failure); assert.notEqual(transfer.attempt.fingerprint, guided.attempt.fingerprint); assert.equal(transfer.p.mastered, true); });
}

{
  const remote = await execute(29, "guided", null, d => { d.fields = { meeting: "apart", direction: "forward", guard: "stay" }; d.commands = ["transfer", "crossGate", "upload", "finish"].map((action, index) => ({ id: index + 1, action })); });
  check("lesson 29 rejects remote transfer without changing ownership", () => { assert.equal(remote.attempt.success, false); assert.match(remote.execution.error, /同在会合格/); assert.equal(remote.execution.finalState.objects.Collector.cargo, 1); assert.equal(remote.execution.finalState.objects.Carrier.cargo, 0); });
  const leaves = await execute(29, "guided", null, d => { d.fields = { meeting: "same", direction: "forward", guard: "leave" }; d.commands = ["transfer", "crossGate", "upload", "finish"].map((action, index) => ({ id: index + 1, action })); });
  check("lesson 29 closes the pressure gate after every object leaves", () => { assert.equal(leaves.attempt.success, false); assert.equal(leaves.execution.finalState.gates["handoff-gate"], false); });
  const m = leaves.m, makeTransferRuntime = () => context.CodeQuestPythonRuntime.create({ Sk: context.Sk, apiCallLimit: 40, allowedFunctions: new Set(["Explorer", "Spaceship", "transfer_to"]), objectModel: true, multiObject: true, courseRules: { handoffMode: "same-cell", handoffCells: [[m.data.meeting.x, m.data.meeting.y]] }, world: { grid: m.grid, start: m.startOverride, startDir: m.startDir, required: 0, targetPositions: [], terrain: m.terrain } });
  const noCargoSource = `collector = Explorer("Collector", 8, ${m.data.meeting.x}, ${m.data.meeting.y}, "E", 0, 1)\ncarrier = Spaceship("Carrier", 8, ${m.data.meeting.x}, ${m.data.meeting.y}, "E", 0, 2)\ncollector.transfer_to(carrier, 1)`;
  let noCargo = null; try { await makeTransferRuntime().compile(noCargoSource) } catch (error) { noCargo = error; }
  check("lesson 29 no-cargo transfer is atomic", () => { assert.match(context.CodeQuestPythonRuntime.friendlyErrorMessage(noCargo), /没有足够货物/); assert.equal(noCargo.partialState.objects.Collector.cargo, 0); assert.equal(noCargo.partialState.objects.Carrier.cargo, 0); });
  const fullSource = `collector = Explorer("Collector", 8, ${m.data.meeting.x}, ${m.data.meeting.y}, "E", 1, 1)\ncarrier = Spaceship("Carrier", 8, ${m.data.meeting.x}, ${m.data.meeting.y}, "E", 2, 2)\ncollector.transfer_to(carrier, 1)`;
  let full = null; try { await makeTransferRuntime().compile(fullSource) } catch (error) { full = error; }
  check("lesson 29 full-receiver transfer is atomic", () => { assert.match(context.CodeQuestPythonRuntime.friendlyErrorMessage(full), /容量不足/); assert.equal(full.partialState.objects.Collector.cargo, 1); assert.equal(full.partialState.objects.Carrier.cargo, 2); });
}

{
  const fixed = await execute(30, "challenge", null, d => { d.fields = { condition: "fixed" }; d.commands = [{ id: 1, action: "waitReady" }, { id: 2, action: "enterPlatform" }]; });
  check("lesson 30 rejects a fixed two-tick delay against a three-tick schedule", () => { assert.equal(fixed.attempt.success, false); assert.equal(fixed.execution.finalState.ticks, 2); });
  const occupiedOnly = await execute(30, "challenge", null, d => { d.fields = { condition: "occupied-only" }; d.commands = [{ id: 1, action: "waitReady" }, { id: 2, action: "enterPlatform" }]; });
  check("lesson 30 rejects checking occupation without docking", () => assert.equal(occupiedOnly.attempt.success, false));
  const m = occupiedOnly.m;
  const runtime = context.CodeQuestPythonRuntime.create({ Sk: context.Sk, apiCallLimit: 18, allowedFunctions: new Set(["is_platform_docked", "is_platform_occupied", "wait", "not"]), languageFeatures: ["while-loops", "boolean-logic"], courseRules: { platformSchedule: { neverDocks: true } }, world: { grid: m.grid, start: m.startOverride, startDir: m.startDir, required: 0, targetPositions: [], terrain: m.terrain } });
  let blocked = null; try { await runtime.compile("while not (is_platform_docked() and not is_platform_occupied()):\n    wait()") } catch (error) { blocked = context.CodeQuestPythonRuntime.friendlyErrorMessage(error); }
  check("lesson 30 safely stops when the platform never docks", () => assert.match(blocked || "", /太多次|过长|安全停止/));
  const readyRuntime = context.CodeQuestPythonRuntime.create({ Sk: context.Sk, apiCallLimit: 20, allowedFunctions: new Set(["is_platform_docked", "is_platform_occupied", "wait", "not"]), languageFeatures: ["while-loops", "boolean-logic"], courseRules: { platformSchedule: { dockedAt: 0, occupiedUntil: 0 } }, world: { grid: m.grid, start: m.startOverride, startDir: m.startDir, required: 0, targetPositions: [], terrain: m.terrain } });
  const ready = await readyRuntime.compile("while not (is_platform_docked() and not is_platform_occupied()):\n    wait()")
  check("lesson 30 initial-ready fixture waits zero ticks", () => { assert.equal(ready.finalState.ticks, 0); assert.equal(ready.events.filter(event => event.type === "wait").length, 0); });
}

{
  const wrongReason = await execute(31, "guided", null, d => { d.fields = { work: "portal", counterexample: "accidental", boundary: "safe-edge" }; d.commands = [{ id: 1, action: "runTests" }, { id: 2, action: "savePack" }]; });
  check("lesson 31 requires the counterexample to fail for its named rule", () => { assert.equal(wrongReason.attempt.success, false); assert.equal(Boolean(wrongReason.execution.testRuns.counter.error), false); });
  const unsafeBoundary = await execute(31, "guided", null, d => { d.fields = { work: "stair", counterexample: "gem-count", boundary: "unsafe-relay" }; d.commands = [{ id: 1, action: "runTests" }, { id: 2, action: "savePack" }]; });
  check("lesson 31 executes and rejects an unsafe boundary fixture", () => { assert.equal(unsafeBoundary.attempt.success, false); assert.match(unsafeBoundary.execution.testRuns.boundary.error, /中继站|上传/); });
}

{
  const partial = await execute(32, "challenge", null, d => { d.fields = { traversal: "first", roles: "correct", meeting: "same", waiting: "recheck" }; d.commands = ["buildBridge", "relayCargo", "waitPlatform", "deliver", "finish"].map((action, index) => ({ id: index + 1, action })); });
  check("lesson 32 does not let successful delivery hide an incomplete data bridge", () => { assert.equal(partial.attempt.worldSuccess, true); assert.equal(partial.attempt.success, false); assert.equal(partial.attempt.evidence.modules.bridge, false); });
}

{
  const C = context.CodeQuestCollaborationLessons, worlds = [C.handoffWorld(false), C.platformWorld(false), C.workshopWorld(false), C.capstoneWorld(false)];
  check("lessons 29–32 use four broad, dense and distinct spatial identities", () => { assert.equal(new Set(worlds.map(world => world.kind)).size, 4); assert.equal(new Set(worlds.map(world => world.grid.join("/"))).size, 4); for (const world of worlds) { assert.ok(world.grid[0].length >= 18); assert.ok(world.grid.length >= 13); assert.ok(world.grid.reduce((sum, row) => sum + [...row].filter(tile => tile !== "_").length, 0) >= 100); assert.ok(world.labels.length >= 3); } });
  const p = E.profile(), m = E.mission(context.SignalRunnerCourseData.missions[28], p), adapter = context.CodeQuestStructuredLessons.get(29);
  check("collaboration lessons preserve card editing and two-phase controls", () => { const rendered = adapter.render(m, p, {}), built = adapter.builder(m, p, {}); assert.match(rendered, /同格交接与守板/); assert.match(rendered, /会合点换位迁移/); assert.match(rendered, /宽幅地图与状态落点/); assert.match(built.palette, /data-lesson-action="add"/); });
}

console.log(`v1.8 lessons 29–32: ${checks} scenario groups passed.`);
