import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const read = file => readFile(new URL(`../signal-runner-node/${file}`, import.meta.url), "utf8");
const context = { console, performance, setTimeout, clearTimeout, setImmediate, setInterval, clearInterval };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const file of ["vendor/skulpt-1.2.0.min.js", "world-rules.js", "learning-evidence.js", "structured-lessons.js", "python-runtime-core.js", "data-lessons.js", "data-lessons-ui.js", "course-data.js", "v16-course-overrides.js", "early-lessons.js"])
  vm.runInContext(await read(file), context, { filename: file });

const E = context.CodeQuestEarlyLessons;
const clone = value => JSON.parse(JSON.stringify(value));
let checks = 0;
const check = (name, fn) => { fn(); checks += 1; console.log(`✓ ${name}`); };

async function execute(no, phase, learner = null, prepare = null) {
  const p = learner || E.profile(), base = context.SignalRunnerCourseData.missions[no - 1];
  E.mission(base, p);
  Object.assign(p, { phase, variant: 0 });
  let m = E.mission(base, p);
  const adapter = context.CodeQuestStructuredLessons.get(no);
  prepare ? prepare(adapter.draft(p), m) : adapter.reference(m, p);
  m = E.mission(base, p);
  const d = clone(adapter.draft(p));
  const execution = await adapter.compile(m, d, context.Sk);
  const attempt = adapter.assess(m, d, execution, p.assisted);
  adapter.record(p, attempt);
  return { p, m, d, execution, attempt, adapter };
}

for (const no of [21, 22, 23, 24, 25]) {
  const guided = await execute(no, "guided");
  check(`lesson ${no} completes guided construction`, () => assert.equal(guided.attempt.success, true, guided.attempt.failure));
  const transfer = await execute(no, "challenge", guided.p);
  check(`lesson ${no} completes independent transfer and mastery`, () => {
    assert.equal(transfer.attempt.success, true, transfer.attempt.failure);
    assert.notEqual(transfer.attempt.fingerprint, guided.attempt.fingerprint);
    assert.equal(transfer.p.mastered, true);
  });
}

{
  const wrong = await execute(21, "guided", null, (d, m) => {
    d.tasks = clone(m.data.requested);
    d.fields.loopSource = "fixed";
    d.commands = ["iterate", "home", "finish"].map((action, index) => ({ id: index + 1, action }));
  });
  check("lesson 21 rejects a hard-coded loop source", () => assert.equal(wrong.attempt.success, false));
}
{
  const boundary = await execute(21, "guided", null, d => {
    d.tasks = [];
    d.fields.loopSource = "tasks";
    d.commands = ["iterate", "home", "finish"].map((action, index) => ({ id: index + 1, action }));
  });
  check("lesson 21 empty list safely skips traversal", () => {
    assert.equal(boundary.execution.error, null);
    assert.equal(JSON.stringify(boundary.execution.finalState.stationVisits), "[]");
    assert.equal(boundary.attempt.success, false);
  });
}
{
  const single = await execute(21, "guided", null, (d, m) => {
    m.data.requested = ["D"];
    d.tasks = ["D"];
    d.fields.loopSource = "tasks";
    d.commands = ["iterate", "home", "finish"].map((action, index) => ({ id: index + 1, action }));
  });
  check("lesson 21 single-item list visits exactly one current item", () => {
    assert.equal(single.execution.error, null);
    assert.equal(JSON.stringify(single.execution.finalState.stationVisits), '["D"]');
  });
}
{
  const stale = await execute(22, "guided", null, (d, m) => {
    d.appends = clone(m.data.expectedAppends);
    d.fields = { lengthMode: "stale", boundMode: "valid" };
    d.commands = ["append", "index", "home", "finish"].map((action, index) => ({ id: index + 1, action }));
  });
  check("lesson 22 stale length misses the appended task", () => {
    assert.equal(stale.execution.error, null);
    assert.equal(stale.attempt.success, false);
    assert.equal(stale.execution.finalState.stationVisits.length, stale.m.data.baseTasks.length);
  });
}
{
  const p = E.profile(), base = context.SignalRunnerCourseData.missions[21];
  E.mission(base, p); Object.assign(p, { phase: "guided", variant: 0 });
  const m = E.mission(base, p), adapter = context.CodeQuestStructuredLessons.get(22), d = adapter.draft(p);
  m.data.baseTasks = []; m.data.expectedAppends = [];
  d.appends = []; d.fields = { lengthMode: "current", boundMode: "valid" };
  d.commands = ["index", "home", "finish"].map((action, index) => ({ id: index + 1, action }));
  const execution = await adapter.compile(m, clone(d), context.Sk), attempt = adapter.assess(m, clone(d), execution, false);
  check("lesson 22 zero-length list produces range(0) and exits safely", () => {
    assert.equal(execution.error, null);
    assert.equal(attempt.success, true, attempt.failure);
    assert.ok(execution.events.some(event => event.range?.value === 0));
  });
}
{
  const offByOne = await execute(22, "guided", null, (d, m) => {
    d.appends = clone(m.data.expectedAppends);
    d.fields = { lengthMode: "current", boundMode: "offby" };
    d.commands = ["append", "index", "home", "finish"].map((action, index) => ({ id: index + 1, action }));
  });
  check("lesson 22 exposes an out-of-range index", () => {
    assert.match(offByOne.execution.error, /索引|Index|范围/);
    assert.equal(offByOne.attempt.success, false);
  });
}
{
  const fixed = await execute(23, "challenge", null, (d, m) => {
    d.routes[m.data.expectedKey] = m.data.expectedExit;
    d.fields.lookupMode = "fixed";
    d.commands = ["lookup", "teleport", "finish"].map((action, index) => ({ id: index + 1, action }));
  });
  check("lesson 23 fixed destination fails after the mapping changes", () => assert.equal(fixed.attempt.success, false));
}
{
  const missing = await execute(23, "guided", null, (d, m) => {
    d.routes[m.data.expectedKey] = "";
    d.fields.lookupMode = "dict";
    d.commands = ["lookup", "teleport", "finish"].map((action, index) => ({ id: index + 1, action }));
  });
  check("lesson 23 missing key stays in place and records a lookup miss", () => {
    assert.equal(missing.execution.error, null);
    assert.ok(missing.execution.events.some(event => event.type === "lookup-miss"));
    assert.equal(missing.execution.finalState.routeLookups.at(-1).destination, null);
    assert.equal(`${missing.execution.finalState.x},${missing.execution.finalState.y}`, `${missing.m.startOverride.x},${missing.m.startOverride.y}`);
  });
}
{
  const over = await execute(24, "challenge", null, (d, m) => {
    d.tasks = clone(m.data.tasks);
    d.fields = { traversal: "tasks", lookup: "routes", inventory: "ignore", writeback: "results" };
    d.commands = ["dispatch", "home", "finish"].map((action, index) => ({ id: index + 1, action }));
  });
  check("lesson 24 rejects dispatch beyond available stock", () => {
    assert.equal(over.attempt.success, false);
    assert.ok(over.execution.finalState.deliveries.length > over.m.data.stock);
  });
}
{
  const p = E.profile(), base = context.SignalRunnerCourseData.missions[23];
  E.mission(base, p); Object.assign(p, { phase: "guided", variant: 0 });
  const m = E.mission(base, p), adapter = context.CodeQuestStructuredLessons.get(24), d = adapter.draft(p);
  m.data.tasks = [];
  d.tasks = []; d.fields = { traversal: "tasks", lookup: "routes", inventory: "check", writeback: "results" };
  d.commands = ["dispatch", "home", "finish"].map((action, index) => ({ id: index + 1, action }));
  const execution = await adapter.compile(m, clone(d), context.Sk), attempt = adapter.assess(m, clone(d), execution, false);
  check("lesson 24 empty task list dispatches nothing and remains complete", () => {
    assert.equal(execution.error, null);
    assert.equal(attempt.success, true, attempt.failure);
    assert.equal(execution.finalState.deliveries.length, 0);
  });
}
{
  const swapped = await execute(25, "guided", null, d => {
    d.fields = { row: "x", column: "y", tile: "rock" };
    d.commands = ["editGrid", "buildGrid", "finish"].map((action, index) => ({ id: index + 1, action }));
  });
  check("lesson 25 rejects swapped row and column coordinates", () => assert.equal(swapped.attempt.success, false));
}

{
  const D = context.CodeQuestDataLessons;
  const worlds = [[21, D.logisticsWorld(false)], [22, D.indexWorld(true)], [23, D.portalWorld(false)], [24, D.dispatchWorld(true)], [25, D.blueprintWorld(false)]];
  check("lessons 21–25 use broad multi-zone maps instead of single-line corridors", () => {
    for (const [no, world] of worlds) {
      const rowWidths = world.grid.map(row => [...row].filter(tile => tile !== "_").length);
      const tiles = rowWidths.reduce((sum, count) => sum + count, 0);
      assert.ok(world.grid.length >= 7, `lesson ${no} height`);
      assert.ok(world.grid[0].length >= 11, `lesson ${no} width`);
      assert.ok(tiles >= 50, `lesson ${no} playable footprint`);
      assert.ok(rowWidths.filter(width => width >= 7).length >= 6, `lesson ${no} broad rows`);
      assert.ok(world.labels.length >= 2, `lesson ${no} labels`);
    }
  });
  check("lessons 21–25 have five distinct silhouettes and spatial identities", () => {
    const dataWorlds = worlds.map(([, world]) => world);
    assert.equal(new Set(dataWorlds.map(world => world.kind)).size, 5);
    assert.equal(new Set(dataWorlds.map(world => `${world.grid[0].length}x${world.grid.length}:${world.grid.join("/").replace(/[gSRs]/g, "1")}`)).size, 5);
    assert.deepEqual(dataWorlds.map(world => [world.grid[0].length, world.grid.length]), [[19, 13], [20, 13], [17, 15], [20, 13], [15, 11]]);
  });
}
{
  const p = E.profile(), base = context.SignalRunnerCourseData.missions[21 - 1], m = E.mission(base, p);
  const adapter = context.CodeQuestStructuredLessons.get(21), rendered = adapter.render(m, p, {}), built = adapter.builder(m, p, {});
  check("data lessons preserve the original card builder and two-phase learning UI", () => {
    assert.match(rendered, /连接当前任务项/);
    assert.match(rendered, /清单重排迁移/);
    assert.match(rendered, /宽幅地图与数据落点/);
    assert.match(built.palette, /data-lesson-action="add"/);
    assert.equal(built.hideFunctionTab, true);
  });
}

console.log(`v1.8 lessons 21–25: ${checks} scenario groups passed.`);
