import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const skulptSource = await readFile(new URL("../signal-runner-node/vendor/skulpt-1.2.0.min.js", import.meta.url), "utf8");
const runtimeSource = await readFile(new URL("../signal-runner-node/python-runtime-core.js", import.meta.url), "utf8");
const courseDataSource = await readFile(new URL("../signal-runner-node/course-data.js", import.meta.url), "utf8");
const appSource = await readFile(new URL("../signal-runner-node/app.js", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../signal-runner-node/index.html", import.meta.url), "utf8");

const context = {
  clearInterval,
  clearTimeout,
  console,
  performance,
  setImmediate,
  setInterval,
  setTimeout,
  TextDecoder,
  TextEncoder
};
context.global = context;
context.globalThis = context;
context.window = context;
vm.createContext(context);
vm.runInContext(skulptSource, context, { filename: "skulpt-1.2.0.min.js" });
vm.runInContext(runtimeSource, context, { filename: "python-runtime-core.js" });
vm.runInContext(courseDataSource, context, { filename: "course-data.js" });

assert.equal(typeof context.Sk?.parse, "function", "Skulpt parser should load");
assert.equal(typeof context.CodeQuestPythonRuntime?.create, "function", "runtime core should load");

assert.match(appSource, /const visibleCourseLessonLimit = 32;/, "student course entry should stop at lesson 32");
assert.match(appSource, /Number\(item\.lessonNo\) <= visibleCourseLessonLimit/, "student missions should use the visible lesson limit");
assert.match(appSource, /visibleCourseStageIds\.has\(stage\.id\)/, "student stages should hide stages without visible lessons");
assert.match(pageSource, /学习进度 0 \/ 32/, "initial student progress should match the visible course count");

for (let number = 17; number <= 32; number += 1) {
  const mission = context.SignalRunnerCourseData.missions[number - 1];
  assert.ok(mission.pythonStudio, `course ${number} should use the v1.5 Python studio`);
  assert.ok(mission.pythonStudio.starterSource, `course ${number} should provide a problem-based starter program`);
  assert.ok(mission.pythonStudio.statePanel, `course ${number} should expose visible runtime evidence`);
  assert.ok(mission.pythonStudio.stateChecks?.length, `course ${number} should gate success on runtime semantics`);
  assert.ok(mission.pythonStudio.targets?.length, `course ${number} should identify a focused repair target`);
}

const runtime = context.CodeQuestPythonRuntime.create({
  Sk: context.Sk,
  initialEnergy: 8,
  hazardPosition: 3,
  beaconPosition: 4,
  apiCallLimit: 16
});

async function expectFailure(source, expected) {
  try {
    await runtime.compile(source);
    assert.fail("program should fail");
  } catch (error) {
    assert.equal(error.category, expected.category);
    assert.equal(Number(error.studentLine), expected.line);
    assert.match(context.CodeQuestPythonRuntime.friendlyErrorMessage(error), expected.message);
    if (expected.lastEvent) assert.equal(error.partialEvents?.at(-1)?.type, expected.lastEvent);
    return error;
  }
}

const success = await runtime.compile([
  "move()",
  "move()",
  "if is_hazard_ahead():",
  "    shield()",
  "move()",
  "move()",
  "collect()"
].join("\n"));

assert.equal(success.finalState.position, 4);
assert.equal(success.finalState.collected, true);
assert.equal(success.finalState.energy, 3);
assert.ok(success.events.some((event) => event.type === "condition" && event.line === 3));
assert.ok(success.events.some((event) => event.type === "shield" && event.line === 4));
assert.ok(success.events.some((event) => event.type === "collect" && event.line === 7));

await expectFailure([
  "move()",
  "if is_hazard_ahead()",
  "    shield()"
].join("\n"), { category: "syntax", line: 2, message: /语法|冒号|缩进/ });

await expectFailure([
  "move()",
  "move()",
  "move()"
].join("\n"), { category: "runtime", line: 3, message: /危险格|护盾/, lastEvent: "hazard-fail" });

const loopError = await expectFailure([
  "while not at_beacon():",
  "    turn_left()"
].join("\n"), { category: "runtime", line: 1, message: /循环|while|停止条件/ });
assert.ok(loopError.partialEvents.length > 0 && loopError.partialEvents.length <= 16);

await expectFailure([
  "move()",
  "move()",
  "if is_hazard_ahead():",
  "    shield()",
  "move()",
  "move()",
  "collect()",
  "move()"
].join("\n"), { category: "runtime", line: 8, message: /走过|尽头|跌落/, lastEvent: "fall" });

await expectFailure([
  "turn_left()",
  "move()"
].join("\n"), { category: "runtime", line: 2, message: /通道外|边缘|跌落/, lastEvent: "fall" });

await expectFailure("import os", { category: "syntax", line: 1, message: /暂时只开放/ });

const lesson13Runtime = context.CodeQuestPythonRuntime.create({
  Sk: context.Sk,
  initialEnergy: 9,
  hazardPosition: 2,
  beaconPosition: 4,
  apiCallLimit: 36,
  allowedFunctions: new Set(["move", "turn_left", "turn_right", "shield", "collect", "is_hazard_ahead", "is_blocked_ahead"])
});

try {
  await lesson13Runtime.compile([
    "move()",
    "if is_blocked_ahead():",
    "    shield()",
    "move()",
    "move()",
    "move()",
    "collect()"
  ].join("\n"));
  assert.fail("lesson 13 starter should stop in the hazard");
} catch (error) {
  assert.equal(error.category, "runtime");
  assert.equal(Number(error.studentLine), 4);
  assert.equal(error.partialEvents?.at(-1)?.type, "hazard-fail");
}

const lesson13Success = await lesson13Runtime.compile([
  "move()",
  "if is_hazard_ahead():",
  "    shield()",
  "move()",
  "move()",
  "move()",
  "collect()"
].join("\n"));
assert.equal(lesson13Success.finalState.position, 4);
assert.equal(lesson13Success.finalState.collected, true);
assert.equal(lesson13Success.finalState.energy, 4);

function courseMission(number) {
  return context.SignalRunnerCourseData.missions[number - 1];
}

for (let number = 1; number <= 12; number += 1) {
  const earlyMission = courseMission(number);
  assert.ok(earlyMission.grid.some((row) => row.includes("_")), `course ${number} should keep a visible fall boundary`);
  assert.ok(earlyMission.allowed.includes("move"), `course ${number} should allow students to test the map edge`);
}

assert.match(appSource, /function blockingKind\(x, y\)/, "standard lessons should distinguish walls from void tiles");
assert.match(appSource, /failureMotion\("fall"/, "standard lessons should animate an out-of-map fall");
assert.match(appSource, /failureMotion\("collision-fail"/, "standard lessons should animate wall collisions");
assert.match(appSource, /fail\(`\$\{reason\}，能量耗尽。`, "power-fail"\)/, "standard lessons should animate power failures");
assert.match(appSource, /function addWorldCompass\(/, "the 3D world should include a cardinal compass that follows map rotation");
assert.match(pageSource, /地图左上方外侧包含随视角旋转的三维N向三角箭头/, "the 3D north marker should have an accessible description");
assert.match(pageSource, /id="worldFailureIndicator"/, "the 3D map should include visible failure feedback");

function gridRuntime(number) {
  const mission = courseMission(number);
  return context.CodeQuestPythonRuntime.create({
    Sk: context.Sk,
    initialEnergy: mission.energy,
    apiCallLimit: 160,
    allowedFunctions: new Set(mission.pythonStudio.allowedFunctions),
    objectModel: Boolean(mission.pythonStudio.objectModel),
    multiObject: Boolean(mission.pythonStudio.multiObject),
    languageFeatures: mission.pythonStudio.languageFeatures || [],
    world: {
      grid: mission.grid,
      start: mission.grid.flatMap((row, y) => [...row].map((tile, x) => tile === "S" ? { x, y } : null)).find(Boolean),
      startDir: mission.startDir,
      required: mission.required
    }
  });
}

function clickCodeBlocks(number, templateIds) {
  const studio = courseMission(number).pythonStudio;
  return templateIds.reduce((source, templateId) => {
    const template = studio.templates.find((item) => item.id === templateId);
    assert.ok(template?.replaceFrom, `course ${number} should provide button ${templateId}`);
    assert.ok(source.includes(template.replaceFrom), `button ${templateId} should match its current yellow target`);
    return source.replace(template.replaceFrom, template.replaceTo);
  }, studio.starterSource);
}

async function expectGridFailure(number, source, expectedType, expectedLine) {
  try {
    await gridRuntime(number).compile(source);
    assert.fail(`course ${number} starter should fail`);
  } catch (error) {
    assert.equal(error.category, "runtime");
    assert.equal(Number(error.studentLine), expectedLine);
    assert.equal(error.partialEvents?.at(-1)?.type, expectedType);
  }
}

await expectGridFailure(13, courseMission(13).pythonStudio.starterSource, "hazard-fail", 4);
const grid13Success = await gridRuntime(13).compile(courseMission(13).pythonStudio.starterSource.replace("is_blocked_ahead", "is_hazard_ahead"));
assert.equal(grid13Success.finalState.collected, true);
assert.equal(grid13Success.finalState.energy, 4);

await expectGridFailure(14, courseMission(14).pythonStudio.starterSource, "action-fail", 12);
const grid14Success = await gridRuntime(14).compile(clickCodeBlocks(14, ["guard-and", "guard-move"]));
assert.equal(grid14Success.finalState.collected, true);
assert.deepEqual([grid14Success.finalState.x, grid14Success.finalState.y], [4, 3]);

await expectGridFailure(15, courseMission(15).pythonStudio.starterSource, "action-fail", 8);
const grid15Success = await gridRuntime(15).compile(clickCodeBlocks(15, ["while-relay", "while-move"]));
assert.equal(grid15Success.finalState.uploaded, true);
assert.deepEqual([grid15Success.finalState.x, grid15Success.finalState.y], [9, 2]);

const grid16Starter = await gridRuntime(16).compile(courseMission(16).pythonStudio.starterSource);
assert.equal(grid16Starter.events.length, 0);
const grid16SuccessSource = clickCodeBlocks(16, [
  "task1-route",
  "task1-collect",
  "task2-route",
  "task2-collect",
  "task3-route",
  "task3-upload"
]);
const grid16Success = await gridRuntime(16).compile(grid16SuccessSource);
assert.equal(grid16Success.finalState.uploaded, true);
assert.equal(grid16Success.finalState.collectedKeys.length, 2);
assert.equal(grid16Success.finalState.energy, 6);

const grid17Starter = await gridRuntime(17).compile(courseMission(17).pythonStudio.starterSource);
assert.equal(grid17Starter.finalState.collectedKeys.length, 2);
assert.equal(grid17Starter.finalState.variables.collected, 1);
assert.equal(
  JSON.stringify(grid17Starter.events.filter((event) => event.variable?.name === "collected").map((event) => event.variable.value)),
  JSON.stringify([0, 1])
);

const grid17Success = await gridRuntime(17).compile(
  courseMission(17).pythonStudio.starterSource.replace(
    "# TODO: 第二次采集后更新 collected",
    "collected = collected + 1"
  )
);
assert.equal(grid17Success.finalState.collectedKeys.length, 2);
assert.equal(grid17Success.finalState.variables.collected, 2);
assert.equal(
  JSON.stringify(grid17Success.events.filter((event) => event.variable?.name === "collected").map((event) => event.variable.value)),
  JSON.stringify([0, 1, 2])
);
assert.match(pageSource, /id="pythonStatePanel"/, "variable lessons should expose a visible state trace panel");
assert.match(appSource, /lastSuccessfulState/, "successful Python evidence should save the final variable state");

const grid18Starter = await gridRuntime(18).compile(courseMission(18).pythonStudio.starterSource);
assert.equal(grid18Starter.finalState.uploaded, true);
assert.equal(grid18Starter.finalState.collectedKeys.length, 2);
assert.equal(grid18Starter.finalState.variables.steps, 9);
assert.equal(grid18Starter.finalState.variables.collected, 2);
assert.equal(grid18Starter.finalState.variables.energy_used, 9);
assert.equal(grid18Starter.finalState.energy, 8);

const grid18Success = await gridRuntime(18).compile(
  courseMission(18).pythonStudio.starterSource.replace(
    "energy_used = steps",
    "energy_used = start_energy - energy_remaining()"
  )
);
assert.equal(grid18Success.finalState.uploaded, true);
assert.equal(grid18Success.finalState.variables.steps, 9);
assert.equal(grid18Success.finalState.variables.energy_used, 10);
assert.ok(grid18Success.events.some((event) => event.variable?.name === "energy_used" && event.variable.value === 10));

const grid19Failure = await (async () => {
  try {
    await gridRuntime(19).compile(courseMission(19).pythonStudio.starterSource);
    assert.fail("course 19 starter should fail on a Flyer capability mismatch");
  } catch (error) {
    assert.equal(error.category, "runtime");
    assert.equal(Number(error.studentLine), 8);
    assert.equal(error.partialEvents?.at(-1)?.type, "action-fail");
    assert.equal(error.partialEvents?.at(-1)?.failureKind, "object-capability");
    assert.equal(
      JSON.stringify(error.partialEvents?.at(-1)?.object),
      JSON.stringify({ name: "Scout", type: "Flyer", action: "collect" })
    );
    assert.doesNotMatch(context.CodeQuestPythonRuntime.friendlyErrorMessage(error), /on line \d+/i);
    return error;
  }
})();
assert.equal(grid19Failure.partialState.objects.Neo.energy, 5);
assert.equal(grid19Failure.partialState.objects.Scout.type, "Flyer");

const grid19Success = await gridRuntime(19).compile(
  courseMission(19).pythonStudio.starterSource.replace("scout.collect()", "neo.collect()")
);
assert.equal(grid19Success.finalState.uploaded, true);
assert.equal(grid19Success.finalState.collectedKeys.length, 1);
assert.equal(grid19Success.finalState.objects.Neo.type, "Explorer");
assert.equal(grid19Success.finalState.objects.Neo.energy, 2);
assert.equal(grid19Success.finalState.objects.Scout.energy, 4);
assert.equal(grid19Success.finalState.variables.neo, "<Explorer>");
assert.equal(grid19Success.finalState.variables.scout, "<Flyer>");
assert.ok(grid19Success.events.some((event) => event.object?.name === "Neo" && event.object?.action === "collect"));

const grid20Starter = await gridRuntime(20).compile(courseMission(20).pythonStudio.starterSource);
assert.equal(grid20Starter.finalState.uploaded, true);
assert.equal(grid20Starter.finalState.collectedKeys.length, 2);
assert.deepEqual(Object.keys(grid20Starter.finalState.objects), ["Atlas"]);
assert.equal(grid20Starter.finalState.objects.Atlas.energy, 2);
assert.ok(grid20Starter.events.some((event) => event.type === "object-create" && event.object?.replaced));

const grid20Success = await gridRuntime(20).compile(
  courseMission(20).pythonStudio.starterSource.replace(
    "nova = Explorer(\"Atlas\", 8)",
    "nova = Explorer(\"Nova\", 4)"
  )
);
assert.equal(grid20Success.finalState.uploaded, true);
assert.equal(grid20Success.finalState.collectedKeys.length, 2);
assert.equal(grid20Success.finalState.objects.Atlas.energy, 4);
assert.equal(grid20Success.finalState.objects.Nova.energy, 2);
assert.ok(grid20Success.events.some((event) => event.object?.name === "Atlas" && event.object?.action === "collect"));
assert.ok(grid20Success.events.some((event) => event.object?.name === "Nova" && event.object?.action === "collect"));

await expectGridFailure(21, courseMission(21).pythonStudio.starterSource, "action-fail", 9);
const grid21Success = await gridRuntime(21).compile(
  courseMission(21).pythonStudio.starterSource.replace(
    /move_steps\(2\)(?=\nupload\(\))/, 
    "move_steps(4)"
  )
);
assert.equal(grid21Success.finalState.uploaded, true);
assert.deepEqual([grid21Success.finalState.x, grid21Success.finalState.y], [7, 2]);
assert.equal(
  JSON.stringify(grid21Success.finalState.functions.move_steps.calls),
  JSON.stringify([{ steps: 2 }, { steps: 4 }])
);

await expectGridFailure(22, courseMission(22).pythonStudio.starterSource, "hazard-fail", 7);
const grid22Success = await gridRuntime(22).compile(
  courseMission(22).pythonStudio.starterSource.replace(
    "return is_hazard_ahead()",
    "return not is_hazard_ahead()"
  )
);
assert.equal(grid22Success.finalState.collectedKeys.length, 1);
assert.equal(JSON.stringify(grid22Success.finalState.functions.safe_ahead.returns), JSON.stringify([false]));
assert.ok(grid22Success.events.some((event) => event.type === "function-return" && event.functionReturn?.value === false));

await expectGridFailure(23, courseMission(23).pythonStudio.starterSource, "action-fail", 16);
const grid23Success = await gridRuntime(23).compile(
  courseMission(23).pythonStudio.starterSource.replace(
    "target_distances = [2, 2]",
    "target_distances = [2, 2, 3]"
  )
);
assert.equal(grid23Success.finalState.uploaded, true);
assert.equal(grid23Success.finalState.collectedKeys.length, 3);
assert.equal(JSON.stringify(grid23Success.finalState.variables.target_distances), JSON.stringify([2, 2, 3]));
assert.equal(
  JSON.stringify(grid23Success.finalState.functions.move_steps.calls),
  JSON.stringify([{ steps: 2 }, { steps: 2 }, { steps: 3 }, { steps: 2 }])
);

const grid24Failure = await (async () => {
  try {
    await gridRuntime(24).compile(courseMission(24).pythonStudio.starterSource);
    assert.fail("course 24 starter should fail after reading beyond the array boundary");
  } catch (error) {
    assert.equal(error.category, "runtime");
    assert.equal(Number(error.studentLine), 11);
    assert.match(context.CodeQuestPythonRuntime.friendlyErrorMessage(error), /index|索引|范围/i);
    return error;
  }
})();
assert.equal(grid24Failure.partialState.collectedKeys.length, 3);
assert.equal(grid24Failure.partialState.uploaded, false);
assert.equal(JSON.stringify(grid24Failure.partialState.variables.segments), JSON.stringify([2, 2, 3, 2]));

const grid24Success = await gridRuntime(24).compile(
  courseMission(24).pythonStudio.starterSource.replace(
    "for index in range(5):",
    "for index in range(len(segments)):"
  )
);
assert.equal(grid24Success.finalState.uploaded, true);
assert.equal(grid24Success.finalState.collectedKeys.length, 3);
assert.equal(JSON.stringify(grid24Success.finalState.variables.segments), JSON.stringify([2, 2, 3, 2]));
assert.equal(
  JSON.stringify(grid24Success.events.filter((event) => event.variable?.name === "segments").map((event) => event.variable.value)),
  JSON.stringify([[2, 99, 2], [2, 2], [2, 2, 3], [2, 2, 3, 2]])
);

await expectGridFailure(25, courseMission(25).pythonStudio.starterSource, "hazard-fail", 7);
const grid25Success = await gridRuntime(25).compile(
  courseMission(25).pythonStudio.starterSource.replace("\"H\": \"move\"", "\"H\": \"shield\"")
);
assert.equal(grid25Success.finalState.uploaded, true);
assert.equal(grid25Success.finalState.variables.hazard_action, "shield");
assert.equal(
  JSON.stringify(grid25Success.finalState.variables.terrain_actions),
  JSON.stringify({ H: "shield", B: "collect", R: "upload" })
);

await expectGridFailure(26, courseMission(26).pythonStudio.starterSource, "fall", 12);
const grid26Success = await gridRuntime(26).compile(
  courseMission(26).pythonStudio.starterSource.replace(
    "\"B\", \"g\", \"g\", \"_\"",
    "\"B\", \"g\", \"R\", \"_\""
  )
);
assert.equal(grid26Success.finalState.uploaded, true);
assert.equal(
  JSON.stringify(grid26Success.finalState.worldBuild.grid),
  JSON.stringify(["_______", "_ggggg_", "_SgBgR_", "_______"])
);
assert.ok(grid26Success.events.some((event) => event.type === "world-build"));

await expectGridFailure(27, courseMission(27).pythonStudio.starterSource, "fall", 11);
const grid27Success = await gridRuntime(27).compile(
  courseMission(27).pythonStudio.starterSource.replace(
    "pair_portals(3, 1, 5, 1)",
    "pair_portals(3, 1, 5, 2)"
  )
);
assert.equal(grid27Success.finalState.uploaded, true);
assert.equal(grid27Success.finalState.collectedKeys.length, 1);
assert.equal(grid27Success.finalState.worldBuild.portals.length, 1);
assert.equal(grid27Success.finalState.worldBuild.placements.length, 2);
assert.equal(
  JSON.stringify(grid27Success.finalState.worldBuild.grid),
  JSON.stringify(["_________", "_SgP_____", "_____PBR_", "_________"])
);
assert.ok(grid27Success.events.some((event) => event.type === "teleport" && event.portal?.to?.y === 2));

const grid28Failure = await (async () => {
  try {
    await gridRuntime(28).compile(courseMission(28).pythonStudio.starterSource);
    assert.fail("course 28 starter should fail without the upload component");
  } catch (error) {
    assert.equal(error.category, "runtime");
    assert.equal(Number(error.studentLine), 9);
    assert.equal(error.partialEvents?.at(-1)?.failureKind, "component-capability");
    assert.equal(error.partialEvents?.at(-1)?.object?.action, "upload");
    return error;
  }
})();
assert.equal(grid28Failure.partialState.objects.Aster.energy, 4);
assert.equal(JSON.stringify(grid28Failure.partialState.objects.Aster.components), JSON.stringify(["move", "collect"]));

const grid28Success = await gridRuntime(28).compile(
  courseMission(28).pythonStudio.starterSource.replace(
    "[\"move\", \"collect\"]",
    "[\"move\", \"collect\", \"upload\"]"
  )
);
assert.equal(grid28Success.finalState.uploaded, true);
assert.equal(grid28Success.finalState.objects.Aster.energy, 4);
assert.equal(
  JSON.stringify(grid28Success.finalState.objects.Aster.components),
  JSON.stringify(["move", "collect", "upload"])
);
assert.ok(grid28Success.events.some((event) => event.object?.name === "Aster" && event.object?.action === "upload"));

const grid29Failure = await (async () => {
  try {
    await gridRuntime(29).compile(courseMission(29).pythonStudio.starterSource);
    assert.fail("course 29 starter should fail when Spaceship is asked to collect");
  } catch (error) {
    assert.equal(error.category, "runtime");
    assert.equal(Number(error.studentLine), 8);
    assert.equal(error.partialEvents?.at(-1)?.failureKind, "object-capability");
    assert.equal(error.partialEvents?.at(-1)?.object?.name, "Carrier");
    return error;
  }
})();
assert.equal(grid29Failure.partialState.objects.Neo.x, 3);
assert.equal(grid29Failure.partialState.objects.Carrier.x, 1);

const grid29Success = await gridRuntime(29).compile(
  courseMission(29).pythonStudio.starterSource.replace("carrier.collect()", "neo.collect()")
);
assert.equal(grid29Success.finalState.uploaded, true);
assert.deepEqual([grid29Success.finalState.objects.Neo.x, grid29Success.finalState.objects.Neo.y], [3, 2]);
assert.deepEqual([grid29Success.finalState.objects.Carrier.x, grid29Success.finalState.objects.Carrier.y], [5, 1]);
assert.ok(grid29Success.events.some((event) => event.object?.name === "Neo" && event.object?.action === "collect"));
assert.ok(grid29Success.events.some((event) => event.object?.name === "Carrier" && event.object?.action === "upload"));

const grid30Failure = await (async () => {
  try {
    await gridRuntime(30).compile(courseMission(30).pythonStudio.starterSource);
    assert.fail("course 30 starter should fail on a shared-tile conflict");
  } catch (error) {
    assert.equal(error.category, "runtime");
    assert.equal(Number(error.studentLine), 5);
    assert.equal(error.partialEvents?.at(-1)?.failureKind, "object-conflict");
    assert.equal(error.partialEvents?.at(-1)?.conflict?.occupiedBy, "Nova");
    return error;
  }
})();
assert.equal(grid30Failure.partialState.objects.Atlas.waits, 0);

const grid30Success = await gridRuntime(30).compile(
  courseMission(30).pythonStudio.starterSource.replace(
    "# TODO: Atlas 先等待一拍",
    "atlas.wait()"
  )
);
assert.equal(grid30Success.finalState.objects.Atlas.waits, 1);
assert.deepEqual([grid30Success.finalState.objects.Atlas.x, grid30Success.finalState.objects.Atlas.y], [2, 2]);
assert.ok(grid30Success.events.some((event) => event.type === "wait" && event.object?.name === "Atlas"));

const grid31Failure = await (async () => {
  try {
    await gridRuntime(31).compile(courseMission(31).pythonStudio.starterSource);
    assert.fail("course 31 starter should fail schema validation");
  } catch (error) {
    assert.equal(error.category, "runtime");
    assert.equal(Number(error.studentLine), 7);
    assert.match(context.CodeQuestPythonRuntime.friendlyErrorMessage(error), /声明 2 座信标|实际编码了 1 座/);
    return error;
  }
})();
assert.equal(grid31Failure.partialState.worldBuild.schemaValidated, false);

const grid31Success = await gridRuntime(31).compile(
  courseMission(31).pythonStudio.starterSource.replace("\"beacons\": 2", "\"beacons\": 1")
);
assert.equal(grid31Success.finalState.worldBuild.schemaValidated, true);
assert.equal(grid31Success.finalState.worldBuild.schema.beacons, 1);
assert.equal(grid31Success.finalState.uploaded, true);

const grid32Starter = await gridRuntime(32).compile(courseMission(32).pythonStudio.starterSource);
assert.equal(grid32Starter.finalState.uploaded, true);
assert.equal(grid32Starter.finalState.objects.Carrier.waits, 0);
assert.equal(grid32Starter.finalState.worldBuild.schemaValidated, true);

const grid32Success = await gridRuntime(32).compile(
  courseMission(32).pythonStudio.starterSource.replace(
    "# TODO: Carrier 上传前等待同步",
    "carrier.wait()"
  )
);
assert.equal(grid32Success.finalState.uploaded, true);
assert.equal(grid32Success.finalState.objects.Carrier.waits, 1);
assert.equal(grid32Success.finalState.objects.Carrier.energy, 3);
assert.deepEqual([grid32Success.finalState.objects.Carrier.x, grid32Success.finalState.objects.Carrier.y], [6, 1]);
assert.ok(grid32Success.events.some((event) => event.object?.name === "Carrier" && event.object?.action === "wait"));

assert.match(appSource, /event\.state\?\.worldBuild\?\.grid/, "world-building lessons should project generated grids into the visible world");
console.log("python-runtime-core: 49 scenarios + early-map failure UI checks passed");
