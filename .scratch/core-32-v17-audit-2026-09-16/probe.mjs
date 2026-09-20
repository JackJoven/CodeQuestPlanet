// Read-only curriculum audit. Executes the production lesson and game functions;
// only rendering, persistence, and animation are stubbed, as in the repo tests.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const repo = new URL('../../', import.meta.url);
const app = await readFile(new URL('signal-runner-node/app.js', repo), 'utf8');
const c = { console, performance, setTimeout, clearTimeout, Set, Map };
c.window = c;
vm.createContext(c);
for (const file of ['course-data.js', 'v16-course-overrides.js', 'early-lessons.js', 'early-lesson-ui.js']) {
  vm.runInContext(await readFile(new URL(`signal-runner-node/${file}`, repo), 'utf8'), c);
}
const E = c.CodeQuestEarlyLessons;
const bases = c.SignalRunnerCourseData.missions.slice(0, 32);
function sourceFunction(name) {
  const start = app.indexOf(`  function ${name}(`);
  assert.ok(start >= 0, name);
  return app.slice(start, app.indexOf('\n  }', start) + 4);
}
const functionNames = ['parseGrid', 'tileKey', 'turn', 'resetSimulation', 'expandProgram', 'log',
  'failureMotion', 'fail', 'complete', 'frontTile', 'blockingKind', 'isBlocked', 'failAtBlockedTile',
  'frontKind', 'spendEnergy', 'moveForward', 'moveBackward', 'executeCommand', 'stepProgram', 'finishEarlyRun', 'beginEarlyRun'];
function run(m, p, program = m.solution, route = m.solutionFn || []) {
  const env = { console, performance, early: E, program: [...program], routeProgram: [...route], sim: null,
    earlyRun: null, animationFrame: null, completed: new Set(), celebrationUntil: 0,
    sensorTarget: 'hazard', logicConnector: 'and', logicHazardMode: 'not-hazard',
    directions: ['N', 'E', 'S', 'W'], directionLabels: E.labels,
    vectors: { N: { x: 0, y: -1 }, E: { x: 1, y: 0 }, S: { x: 0, y: 1 }, W: { x: -1, y: 0 } },
    mission: () => m, earlyProfile: () => p, earlyPrerequisiteNeeded: () => false,
    activeFunctionName: () => p.functionName, stopAutoRun() {}, startMotion() {}, render() {},
    showRunBlocker() {}, renderEarlyLesson() {}, saveEarlyProfile() {}, saveProgress() {} };
  env.window = env;
  vm.createContext(env);
  for (const name of functionNames) vm.runInContext(sourceFunction(name), env);
  env.resetSimulation();
  for (let i = 0; i < 150 && !env.sim.failed && !env.sim.completed && (!env.sim.expanded || env.sim.queueIndex < env.sim.queue.length); i++) env.stepProgram();
  return { sim: env.sim, attempt: p.attempts.at(-1) };
}
const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);
const world = (m) => ({ grid: m.grid, direction: m.startDir, start: m.startOverride,
  targets: m.targetPositions || m.early.targets, energy: m.energy, required: m.required, gate: m.timedGate,
  ruleLimit: m.early.ruleLimit, expectedCount: m.early.expectedLoopCount });
const inventory = bases.map(base => {
  const guided = E.mission(base, E.profile(null));
  const variants = [0, 1, 2].map(variant => E.mission(base, E.profile({ version: E.version, phase: 'challenge', variant })));
  const used = [...new Set(guided.grid.join('').split(''))].sort();
  const passable = guided.grid.join('').split('').filter(t => !['_', '#', '~', ' '].includes(t)).length;
  return { no: base.lessonNo, title: base.title, mode: guided.lessonMode, guidedSize: [guided.grid[0].length, guided.grid.length],
    passable, symbols: used, guidedHash: digest(world(guided)), guidedProgram: [...guided.solution],
    transferHashes: variants.map(m => digest(world(m))), transferPrograms: variants.map(m => [...m.solution]),
    uniqueTransfers: new Set(variants.map(m => digest(world(m)))).size,
    choices: guided.early.dataLab?.options.map(item => item[1]),
    correctChoiceIndex: guided.early.dataLab ? guided.early.dataLab.options.findIndex(item => item[0] === guided.early.dataLab.correct) : null,
    allowed: [...guided.allowed], gate: guided.timedGate || null };
});

const fullFlows = [];
for (const base of bases.filter(m => m.lessonNo >= 16)) {
  const p = E.profile(null);
  let m = E.mission(base, p);
  const chooseFirst = () => { p.systemChoice = m.early.dataLab.options[0][0]; p.systemChoiceB = m.early.dataLab.secondary?.options[0][0] || ''; };
  chooseFirst(); const guided = run(m, p);
  E.switchChallenge(p, 'repair'); m = E.mission(base, p);
  const broken = run(m, p, m.early.faulty, m.early.functionStarter || []);
  p.diagnosis = m.early.diagnosisOptions[0]; chooseFirst(); const repaired = run(m, p);
  E.switchChallenge(p, 'challenge'); m = E.mission(base, p); chooseFirst(); const transfer = run(m, p);
  E.review(m, p, '。');
  fullFlows.push({ no: base.lessonNo, guided: guided.attempt?.success, broken: broken.attempt?.failure,
    declaredDiagnosis: m.early.diagnosisAnswer, repaired: repaired.attempt?.success, repairBound: !!p.repairEvidence,
    transfer: transfer.attempt?.success, mastered: p.mastered, reflectionAssessment: p.masteryEvidence?.reflectionAssessment,
    program: [...m.solution], route: [...(m.solutionFn || [])], traceCommands: [...new Set(transfer.attempt?.trace.map(t => t.command))],
    simulationStateKeys: Object.keys(transfer.sim), gate: m.timedGate || null });
}

const fixedWaitTransfers = [0, 1, 2].map(variant => {
  const p = E.profile({ version: E.version, phase: 'challenge', variant }); const m = E.mission(bases[29], p);
  p.systemChoice = 'recheck-after-wait'; const result = run(m, p);
  return { variant, hash: digest(world(m)), program: [...m.solution], passed: result.attempt?.success,
    waits: result.sim.waitCount, conditionEvents: result.attempt?.trace.filter(t => t.condition).length };
});

const tailProfile = E.profile(null), tailMission = E.mission(bases[16], tailProfile);
tailProfile.systemChoice = tailMission.early.dataLab.options[0][0];
const tail = run(tailMission, tailProfile, [...tailMission.solution, 'move', 'collect']);
const tailResult = { no: 17, passed: tail.attempt?.success, plannedActions: tail.sim.queue.length,
  executedActions: tail.sim.queueIndex, unexecuted: tail.sim.queue.slice(tail.sim.queueIndex).map(item => item.id),
  completed: tail.sim.completed, failed: tail.sim.failed };

const loopProfile = E.profile(null), loopMission = E.mission(bases[10], loopProfile);
loopProfile.loopCount = 2; loopProfile.loopBoundary = 'inside';
const wrongLoopBlocked = E.canRun(loopMission, loopProfile, true);

const migration = [2, 3, 4, 5].map(version => {
  const imported = E.profile({ version, mastered: true, guidedComplete: true, completed: true, attempts: [] });
  return { oldVersion: version, returnedVersion: imported.version, mastered: imported.mastered, guidedComplete: imported.guidedComplete };
});
const exposure = E.profile({ version: E.version, phase: 'challenge', variant: 0, assisted: true, hintLevel: 3 });
const firstExposureWorld = E.mission(bases[29], exposure);
E.switchChallenge(exposure, 'challenge', true);
const nextExposureWorld = E.mission(bases[29], exposure);
const duplicateHintReset = { beforeHash: digest(world(firstExposureWorld)), afterHash: digest(world(nextExposureWorld)),
  nextAssisted: exposure.assisted, nextVariant: exposure.variant };

const guidedGridGroups = new Map(), allAdvancedGrids = new Set();
for (const base of bases.filter(m => m.lessonNo >= 16)) {
  const grid = E.mission(base, E.profile(null)).grid.join('\n');
  guidedGridGroups.set(grid, [...(guidedGridGroups.get(grid) || []), base.lessonNo]);
  for (const phase of ['guided', 'repair', 'challenge']) for (const variant of [0, 1, 2]) {
    allAdvancedGrids.add(E.mission(base, E.profile({ version: E.version, phase, variant })).grid.join('\n'));
  }
}
const mapReuse = { guidedGroups: [...guidedGridGroups.values()], guidedUniqueGrids: guidedGridGroups.size,
  allAdvancedUniqueGrids: allAdvancedGrids.size, comparison: 'grid only; energy and program are not included' };
const sourceHashes = {};
for (const file of ['app.js', 'course-data.js', 'v16-course-overrides.js', 'early-lessons.js', 'early-lesson-ui.js']) {
  sourceHashes[file] = createHash('sha256').update(await readFile(new URL(`signal-runner-node/${file}`, repo))).digest('hex');
}
const out = { date: '2026-09-16', method: 'production-functions-with-render-storage-animation-stubs', inventory, fullFlows,
  fixedWaitTransfers, tailResult, wrongLoopBlocked, migration, duplicateHintReset, mapReuse, sourceHashes };
await writeFile(new URL('evidence.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({ rows: inventory.map(x => ({ no: x.no, size: x.guidedSize, uniqueTransfers: x.uniqueTransfers, hash: x.guidedHash })),
  advancedFullFlows: fullFlows.map(x => ({ no: x.no, mastered: x.mastered, broken: x.broken, diagnosis: x.declaredDiagnosis })),
  fixedWaitTransfers, tailResult, wrongLoopBlocked, migration, duplicateHintReset }, null, 2));
