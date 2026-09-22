import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const read = file => readFile(new URL(`../signal-runner-node/${file}`, import.meta.url), "utf8");
const context = { console, performance, setTimeout, clearTimeout, setImmediate, setInterval, clearInterval };
context.window = context; context.globalThis = context; vm.createContext(context);
for (const file of ["vendor/skulpt-1.2.0.min.js", "world-rules.js", "learning-evidence.js", "structured-lessons.js", "python-runtime-core.js", "data-lessons.js", "data-lessons-ui.js", "systems-lessons.js", "systems-lessons-ui.js", "course-data.js", "v16-course-overrides.js", "early-lessons.js"])
  vm.runInContext(await read(file), context, { filename: file });

const E = context.CodeQuestEarlyLessons, clone = value => JSON.parse(JSON.stringify(value));
let checks = 0; const check = (name, fn) => { fn(); checks += 1; console.log(`✓ ${name}`); };
async function execute(no, phase, learner = null, prepare = null) {
  const p = learner || E.profile(), base = context.SignalRunnerCourseData.missions[no - 1]; E.mission(base, p); Object.assign(p, { phase, variant: 0 });
  let m = E.mission(base, p); const adapter = context.CodeQuestStructuredLessons.get(no); prepare ? prepare(adapter.draft(p), m) : adapter.reference(m, p); m = E.mission(base, p);
  const d = clone(adapter.draft(p)), execution = await adapter.compile(m, d, context.Sk), attempt = adapter.assess(m, d, execution, p.assisted); adapter.record(p, attempt);
  return { p, m, d, execution, attempt, adapter };
}

for (const no of [26, 27, 28]) {
  const guided = await execute(no, "guided");
  check(`lesson ${no} completes guided construction`, () => assert.equal(guided.attempt.success, true, guided.attempt.failure));
  const transfer = await execute(no, "challenge", guided.p);
  check(`lesson ${no} completes changed independent transfer`, () => { assert.equal(transfer.attempt.success, true, transfer.attempt.failure); assert.notEqual(transfer.attempt.fingerprint, guided.attempt.fingerprint); assert.equal(transfer.p.mastered, true); });
}

{
  const first = await execute(26, "guided", null, d => { d.fields = { traversal: "first", offset: "exact" }; d.commands = [{ id: 1, action: "buildBridge" }, { id: 2, action: "finish" }]; });
  check("lesson 26 rejects only-first construction and leaves a real gap", () => { assert.equal(first.attempt.success, false); assert.equal(first.execution.finalState.worldBuild.placements.length, 1); });
  const shifted = await execute(26, "guided", null, d => { d.fields = { traversal: "all", offset: "shift" }; d.commands = [{ id: 1, action: "buildBridge" }, { id: 2, action: "finish" }]; });
  check("lesson 26 rejects off-by-one bridge positions", () => assert.equal(shifted.attempt.success, false));
  const S = context.CodeQuestSystemsLessons;
  check("lesson 26 bridge data supports 2, 4 and 6 cells without single-line maps", () => { for (const count of [2, 4, 6]) { const world = S.bridgeWorld(count === 6, count); assert.equal(world.gaps.length, count); assert.ok(world.grid.length >= 10); assert.ok(world.grid.reduce((n, row) => n + [...row].filter(tile => tile !== "_").length, 0) >= 90); } });
}

{
  const wrong = await execute(27, "guided", null, d => { d.fields = { scoutReceiver: "scout", cargoReceiver: "scout" }; d.commands = [{ id: 1, action: "scout" }, { id: 2, action: "carry" }, { id: 3, action: "finish" }]; });
  check("lesson 27 wrong receiver triggers a real capability error", () => { assert.equal(wrong.attempt.success, false); assert.match(wrong.execution.error, /不具备.*collect|能力/); });
  const swapped = await execute(27, "challenge");
  check("lesson 27 transfer swaps the scout and cargo zones", () => assert.deepEqual([swapped.m.data.scout.x, swapped.m.data.cargo.x], [12, 3]));
}

{
  const alias = await execute(28, "guided", null, d => { d.fields = { ownership: "alias", chargeTarget: "atlas" }; d.commands = [{ id: 1, action: "chargeA" }, { id: 2, action: "runTwins" }, { id: 3, action: "finish" }]; });
  check("lesson 28 rejects a shared alias as a second instance", () => { assert.equal(alias.attempt.success, false); assert.equal(Boolean(alias.execution.finalState.objects?.Beta), false); });
  const correct = await execute(28, "guided");
  check("lesson 28 changes only Atlas charge while both instances keep independent state", () => { const { Atlas, Beta } = correct.execution.finalState.objects; assert.equal(Atlas.energy, Atlas.initialEnergy + 1); assert.equal(Beta.energy, Beta.initialEnergy - 1); assert.equal(Atlas.cargo, 1); assert.equal(Beta.cargo, 1); });
}

{
  const S = context.CodeQuestSystemsLessons, worlds = [S.bridgeWorld(false), S.rolesWorld(false), S.twinsWorld(false)];
  check("lessons 26–28 have three broad and visually distinct spatial identities", () => { assert.equal(new Set(worlds.map(world => world.kind)).size, 3); assert.equal(new Set(worlds.map(world => world.grid.join("/"))).size, 3); for (const world of worlds) { assert.ok(world.grid[0].length >= 17); assert.ok(world.grid.length >= 11); assert.ok(world.labels.length >= 3); } });
  check("lessons 21–28 keep eight independent map silhouettes", () => { const D = context.CodeQuestDataLessons, all = [D.logisticsWorld(false), D.indexWorld(false), D.portalWorld(false), D.dispatchWorld(false), D.blueprintWorld(false), ...worlds]; assert.equal(new Set(all.map(world => world.kind)).size, 8); assert.equal(new Set(all.map(world => `${world.grid[0].length}x${world.grid.length}:${world.grid.join("/").replace(/[gSRBs]/g, "1")}`)).size, 8); });
  const p = E.profile(), m = E.mission(context.SignalRunnerCourseData.missions[25], p), adapter = context.CodeQuestStructuredLessons.get(26);
  check("systems lessons keep the original card builder and two-phase UI", () => { const rendered = adapter.render(m, p, {}), built = adapter.builder(m, p, {}); assert.match(rendered, /连接数据与施工位/); assert.match(rendered, /桥长变化迁移/); assert.match(rendered, /宽幅地图与状态落点/); assert.match(built.palette, /data-lesson-action="add"/); });
}

console.log(`v1.8 lessons 26–28: ${checks} scenario groups passed.`);
