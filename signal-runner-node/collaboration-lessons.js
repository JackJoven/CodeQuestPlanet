(function (root) {
  "use strict";

  const lessonNos = [29, 30, 31, 32];
  const revisions = { 29: "1.8-29.1", 30: "1.8-30.1", 31: "1.8-31.1", 32: "1.8-32.1" };
  const limits = { 29: 4, 30: 2, 31: 2, 32: 5 };
  const labels = {
    transfer: "执行交接", crossGate: "运输方穿门", upload: "上传货物", finish: "提交验证",
    waitReady: "按条件等待", enterPlatform: "进入升降台",
    runTests: "运行三类测试", savePack: "保存测试包",
    buildBridge: "按清单铺桥", relayCargo: "对象交接", waitPlatform: "重查平台", deliver: "交付中继"
  };
  const codes = {
    transfer: "collector.transfer_to(carrier)", crossGate: "carrier.move() × 3", upload: "carrier.upload()", finish: "finish_mission()",
    waitReady: "while not can_enter: wait()", enterPlatform: "finish_mission()",
    runTests: "run(normal, counterexample, boundary)", savePack: "finish_mission()",
    buildBridge: "for x in gaps: place_tile(...) ", relayCargo: "collector.transfer_to(carrier)", waitPlatform: "while not can_enter: wait()", deliver: "deliver_task(...)"
  };
  const E = () => root.CodeQuestEvidence;
  const copy = value => E().clone(value);
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const py = value => JSON.stringify(value).replace(/true/g, "True").replace(/false/g, "False").replace(/null/g, "None");
  const terrain = extra => ({ version: "1.8", heights: {}, stairs: [], portals: [], switches: [], gates: [], oneWays: [], rotators: [], conveyors: [], supplies: [], ...extra });
  const fill = (rows, x1, y1, x2, y2, tile = "g") => { for (let y = y1; y <= y2; y += 1) for (let x = x1; x <= x2; x += 1) rows[y][x] = tile; };

  function handoffWorld(challenge) {
    const rows = Array.from({ length: 14 }, () => Array(21).fill("_"));
    fill(rows, 1, 2, 8, 5); fill(rows, 2, 6, 10, 11); fill(rows, 5, 4, 11, 8, "s");
    fill(rows, 10, 5, 19, 8); fill(rows, 13, 2, 18, 11); fill(rows, 11, 9, 16, 12);
    fill(rows, 8, 1, 12, 3, "s"); fill(rows, 9, 3, 11, 5, "s");
    const meeting = challenge ? { x: 10, y: 5 } : { x: 10, y: 6 };
    const gate = { x: 11, y: meeting.y }, relay = { x: 13, y: meeting.y };
    rows[meeting.y][meeting.x] = "S"; rows[relay.y][relay.x] = "R"; rows[3][4] = "B";
    const heights = {}; for (let y = 2; y <= 5; y += 1) for (let x = 1; x <= 8; x += 1) if (rows[y][x] !== "_") heights[`${x},${y}`] = 1;
    return { kind: "pressure-key-interlock-yard", grid: rows.map(row => row.join("")), start: meeting, startDir: "E", meeting, gate, relay, terrain: terrain({ heights, switches: [{ id: "plate", at: meeting }], gates: [{ id: "handoff-gate", at: gate, switchId: "plate" }] }), labels: [{ at: { x: 4, y: 3 }, text: "采集者分区" }, { at: meeting, text: "同格会合压力板" }, { at: relay, text: "运输中继站" }] };
  }

  function platformWorld(challenge) {
    const rows = Array.from({ length: 15 }, () => Array(18).fill("_"));
    fill(rows, 1, 5, 16, 9); fill(rows, 4, 2, 13, 12, "s");
    fill(rows, 6, 0, 11, 3, "g"); fill(rows, 6, 11, 11, 14, "g");
    fill(rows, 7, 4, 10, 10, "_"); fill(rows, 8, 6, 9, 8, "g");
    const entry = challenge ? { x: 6, y: 7 } : { x: 6, y: 6 }, platform = { x: 8, y: 7 }, exit = { x: 11, y: 7 };
    rows[entry.y][entry.x] = "S"; rows[platform.y][platform.x] = "P"; rows[exit.y][exit.x] = "R";
    const readyAt = challenge ? 3 : 1;
    const heights = {}; for (let y = 0; y <= 3; y += 1) for (let x = 6; x <= 11; x += 1) if (rows[y][x] !== "_") heights[`${x},${y}`] = 2;
    return { kind: "stacked-hourglass-elevator", grid: rows.map(row => row.join("")), start: entry, startDir: "E", entry, platform, exit, readyAt, terrain: terrain({ heights }), labels: [{ at: { x: 8, y: 1 }, text: "上层停靠环" }, { at: platform, text: "共享升降台" }, { at: { x: 8, y: 13 }, text: "下层机房" }] };
  }

  function workshopWorld(challenge) {
    const rows = Array.from({ length: 13 }, () => Array(21).fill("_"));
    fill(rows, 1, 1, 6, 5); fill(rows, 8, 1, 19, 4, "s"); fill(rows, 2, 7, 9, 11, "s"); fill(rows, 12, 6, 19, 11);
    fill(rows, 5, 4, 15, 8); fill(rows, 7, 5, 13, 7, "_");
    rows[3][3] = "S"; rows[3][17] = "B"; rows[9][5] = "B"; rows[9][16] = "R";
    const heights = {}; for (let y = 1; y <= 4; y += 1) for (let x = 8; x <= 19; x += 1) if (rows[y][x] !== "_") heights[`${x},${y}`] = challenge ? 2 : 1;
    return { kind: "three-bay-test-workshop", grid: rows.map(row => row.join("")), start: { x: 3, y: 3 }, startDir: "E", terrain: terrain({ heights }), labels: [{ at: { x: 3, y: 3 }, text: "正常解试验湾" }, { at: { x: 5, y: 9 }, text: "指定反例湾" }, { at: { x: 16, y: 9 }, text: "边界安全湾" }] };
  }

  function capstoneWorld(challenge) {
    const width = 23, rows = Array.from({ length: 15 }, () => Array(width).fill("_"));
    fill(rows, 1, 1, 7, 5); fill(rows, 3, 5, 10, 8, "s");
    fill(rows, 8, 6, 14, 10); fill(rows, 12, 3, 18, 7, "s");
    fill(rows, 16, 7, 21, 13); fill(rows, 18, 4, 21, 9, "s");
    fill(rows, 6, 11, 15, 13); fill(rows, 7, 9, 9, 12, "s");
    const y = challenge ? 7 : 6, gapCount = challenge ? 4 : 2, gaps = Array.from({ length: gapCount }, (_, index) => 8 + index);
    gaps.forEach(x => rows[y][x] = "_"); rows[y][7] = "S"; rows[y][15] = "B"; rows[9][18] = "R";
    const meeting = { x: 14, y }, relay = { x: 18, y: 9 };
    const heights = {}; for (let yy = 7; yy <= 13; yy += 1) for (let x = 16; x <= 21; x += 1) if (rows[yy][x] !== "_") heights[`${x},${yy}`] = 1;
    return { kind: "diagonal-relay-campus", grid: rows.map(row => row.join("")), base: rows.map(row => row.join("")), start: { x: 7, y }, startDir: "E", gaps, y, meeting, relay, readyAt: challenge ? 3 : 1, terrain: terrain({ heights }), labels: [{ at: { x: 4, y: 3 }, text: "数据施工岛" }, { at: meeting, text: "对象会合区" }, { at: relay, text: "升降交付站" }] };
  }

  const fieldDefaults = no => no === 29 ? { meeting: "", direction: "", guard: "" }
    : no === 30 ? { condition: "" }
      : no === 31 ? { work: "", counterexample: "", boundary: "" }
        : { traversal: "", roles: "", meeting: "", waiting: "" };
  const initialDraft = no => ({ fields: fieldDefaults(no), commands: [], selected: null, nextId: 1, undo: null });
  function draft(p, no) {
    p.collaborationDrafts ||= {}; const key = `${no}-${p.phase}-${p.variant}`;
    if (!p.collaborationDrafts[key]) p.collaborationDrafts[key] = initialDraft(no);
    const d = p.collaborationDrafts[key]; d.fields = { ...fieldDefaults(no), ...(d.fields || {}) };
    d.commands = Array.isArray(d.commands) ? d.commands.filter(item => labels[item.action]).slice(0, limits[no]) : [];
    d.nextId = Math.max(Number(d.nextId) || 1, 1, ...d.commands.map(item => Number(item.id) + 1));
    if (!d.commands.some(item => item.id === d.selected)) d.selected = null;
    return d;
  }
  function archive(p, no) {
    const revision = revisions[no]; if (p.contentRevision === revision) return;
    if (p.contentRevision) p.contentArchives = { ...p.contentArchives, [p.contentRevision]: { attempts: copy(p.attempts), guidedEvidence: p.guidedEvidence, transferEvidence: p.transferEvidence, collaborationDrafts: p.collaborationDrafts } };
    Object.assign(p, { contentRevision: revision, phase: "guided", variant: 0, collaborationDrafts: {}, mastered: false, guidedComplete: false, guidedEvidence: null, repairEvidence: null, transferEvidence: {}, explanationEvidence: null, attempts: [] });
  }

  function mission(base, p, no) {
    archive(p, no); p.attempts = p.attempts.filter(item => item.contentRevision === revisions[no]); const challenge = p.phase === "challenge";
    const world = no === 29 ? handoffWorld(challenge) : no === 30 ? platformWorld(challenge) : no === 31 ? workshopWorld(challenge) : capstoneWorld(challenge);
    const content = no === 29 ? { title: "会合站守板交接", goal: "让采集者在会合板交出货物并留守，运输者穿门送达中继站。", rule: "本课只能在同一会合格交接；失败时货物归属不变。", phases: ["同格交接与守板", "会合点换位迁移"], allowed: ["transfer", "crossGate", "upload", "finish"], hints: ["两台机器要同时位于会合板。", "交接后采集者应继续压住板。", "transfer 是转移，不是复制。"] }
      : no === 30 ? { title: "升降台条件重查", goal: "等待平台同时满足“已停靠且未占用”，每拍后重新检查。", rule: "读取条件不推进时间；wait() 才推进一拍。", phases: ["组合停靠与占用", "三拍时间表迁移"], allowed: ["waitReady", "enterPlatform"], hints: ["可进入需要两个传感器同时成立。", "把 wait() 放进 while 循环。", "固定等待次数经不起时间表变化。"] }
        : no === 31 ? { title: "三湾关卡测试工坊", goal: "修改作品后，真实运行正常解、指定反例和安全边界三类测试。", rule: "反例必须因指定规则失败，不能用意外撞墙冒充。", phases: ["建立作品测试包", "改图后重跑迁移"], allowed: ["runTests", "savePack"], hints: ["正常解证明作品可完成。", "反例要核对明确失败原因。", "边界用例应安全运行而不是崩溃。"] }
          : { title: "重建斜向中继系统", goal: "依次完成数据铺桥、对象分工、守恒交接、条件等待和中继交付。", rule: "五个模块分别留证；路线完成不能掩盖任一缺口。", phases: ["重建五模块系统", "桥长与时刻迁移"], allowed: ["buildBridge", "relayCargo", "waitPlatform", "deliver", "finish"], hints: ["桥长来自当前 gaps。", "货物只从采集者转给运输者。", "等待段同时读取停靠和占用。"] };
    const m = { ...base, contentRevision: revisions[no], lessonMode: `v18-collaboration-${no}`, grid: world.grid, startOverride: world.start, startDir: world.startDir, targetPositions: [], required: no === 31 ? 2 : no === 32 ? 1 : 0, energy: 80, terrain: world.terrain, worldLabels: world.labels, allowed: [], limit: limits[no], solution: [], solutionFn: [], routeChoices: [], data: world, collaborationAllowed: content.allowed, semanticConstraints: { capability: `collaboration-${no}`, fields: draft(p, no).fields, data: world }, early: { v18: true, independent: challenge, repairing: false, key: `${revisions[no]}-${p.phase}-${p.variant}`, requiresUpload: false, title: content.title, goal: content.goal, rule: content.rule, phaseLabels: content.phases, targets: [], hints: content.hints } };
    if (E().fingerprint(m) !== p.currentFingerprint) E().enter(p, m); p.mastered = E().stateGate(p, revisions[no]).mastered; return m;
  }

  function requiredFields(no) {
    return no === 29 ? [["meeting", "先选择会合位置。"], ["direction", "先选择交接方向。"], ["guard", "先选择谁留守压力板。"]]
      : no === 30 ? [["condition", "先选择等待条件。"]]
        : no === 31 ? [["work", "先选择作品版本。"], ["counterexample", "先选择指定反例。"], ["boundary", "先选择边界用例。"]]
          : [["traversal", "先选择桥梁施工范围。"], ["roles", "先选择对象分工。"], ["meeting", "先选择会合方式。"], ["waiting", "先选择等待策略。"]];
  }
  function program(m, d, no, preview = false) {
    if (!preview && !d.commands.length) throw new Error("先点一张指令卡，加入程序。");
    if (!preview) for (const [key, message] of requiredFields(no)) if (!d.fields[key]) throw new Error(message);
    const lines = [], steps = []; const push = (text, item) => { const start = lines.length + 1; String(text).split("\n").forEach(line => lines.push(line)); steps.push({ id: `command-${item.id}`, commandId: item.id, index: steps.length, kind: item.action, label: labels[item.action], code: text, line: start, endLine: lines.length }); };
    if (no === 29) {
      const meet = m.data.meeting, apart = d.fields.meeting === "apart";
      lines.push(`collector = Explorer("Collector", 12, ${apart ? meet.x - 1 : meet.x}, ${meet.y}, "E", 1, 1)`, `carrier = Spaceship("Carrier", 12, ${meet.x}, ${meet.y}, "E", 0, 2)`, "");
      for (const item of d.commands) {
        if (item.action === "transfer") push(d.fields.direction === "reverse" ? "carrier.transfer_to(collector, 1)" : "collector.transfer_to(carrier, 1)", item);
        if (item.action === "crossGate") push(`carrier.move()\ncarrier.move()\ncarrier.move()${d.fields.guard === "leave" ? "\ncollector.move()" : ""}`, item);
        if (item.action === "upload") push("carrier.upload()", item);
        if (item.action === "finish") push("finish_mission()", item);
      }
    }
    if (no === 30) {
      for (const item of d.commands) {
        if (item.action === "waitReady") {
          const text = d.fields.condition === "fixed" ? "wait()\nwait()" : d.fields.condition === "occupied-only" ? "while is_platform_occupied():\n    wait()" : "while not (is_platform_docked() and not is_platform_occupied()):\n    wait()";
          push(text, item);
        }
        if (item.action === "enterPlatform") push("finish_mission()", item);
      }
    }
    if (no === 31) {
      const map = authoredMap(m, d.fields.work || "portal");
      lines.push(`work = ${py({ name: m.early.independent ? "迁移测试工坊" : "三湾测试工坊", map, gems: map.join("").split("B").length - 1, upload: map.some(row => row.includes("R")) })}`, "");
      for (const item of d.commands) { if (item.action === "runTests") push("validate_world(work)", item); if (item.action === "savePack") push("finish_mission()", item); }
    }
    if (no === 32) {
      lines.push(`blueprint = ${py(m.data.base.map(row => [...row]))}`, `gaps = ${py(m.data.gaps)}`, "");
      for (const item of d.commands) {
        if (item.action === "buildBridge") push(`build_world(blueprint)\nfor x in ${d.fields.traversal === "first" ? "gaps[:1]" : "gaps"}:\n    place_tile(x, ${m.data.y}, "g")`, item);
        if (item.action === "relayCargo") { const apart = d.fields.meeting === "apart", reverse = d.fields.roles === "reverse", q = m.data.meeting; push(`collector = Explorer("Collector", 20, ${apart ? q.x - 1 : q.x}, ${q.y}, "E", 1, 1)\ncarrier = Spaceship("Carrier", 20, ${q.x}, ${q.y}, "E", 0, 2)\n${reverse ? "carrier.transfer_to(collector, 1)" : "collector.transfer_to(carrier, 1)"}`, item); }
        if (item.action === "waitPlatform") push(d.fields.waiting === "fixed" ? "wait()\nwait()" : "while not (is_platform_docked() and not is_platform_occupied()):\n    wait()", item);
        if (item.action === "deliver") push(`deliver_task("relay-cargo", [${m.data.relay.x}, ${m.data.relay.y}])`, item);
        if (item.action === "finish") push("finish_mission()", item);
      }
    }
    return { source: lines.join("\n"), steps };
  }

  function authoredMap(m, work) {
    const rows = m.grid.map(row => [...row]);
    if (work === "stair") { rows[3][17] = "g"; rows[8][14] = "B"; }
    else { rows[6][10] = "P"; rows[7][10] = "g"; }
    return rows.map(row => row.join(""));
  }

  function runtimeFor(m, no, Sk, overrides = {}) {
    const functions = new Set(["Explorer", "Spaceship", "move", "upload", "transfer_to", "finish_mission", "wait", "is_platform_docked", "is_platform_occupied", "build_world", "place_tile", "validate_world", "deliver_task", "range", "len", "not"]);
    const courseRules = no === 29 ? { handoffMode: "same-cell", handoffCells: [[m.data.meeting.x, m.data.meeting.y]], pressurePlates: [{ cell: [m.data.meeting.x, m.data.meeting.y], gateId: "handoff-gate" }], requireCargoForUpload: true, uploadFromCargo: true }
      : no === 30 ? { platformSchedule: { dockedAt: m.data.readyAt, occupiedUntil: m.data.readyAt } }
        : no === 32 ? { handoffMode: "same-cell", handoffCells: [[m.data.meeting.x, m.data.meeting.y]], platformSchedule: { dockedAt: m.data.readyAt, occupiedUntil: m.data.readyAt } } : {};
    return root.CodeQuestPythonRuntime.create({ Sk, initialEnergy: m.energy, apiCallLimit: no === 30 ? 80 : 360, allowedFunctions: functions, languageFeatures: ["for-loops", "while-loops", "boolean-logic", "lists", "dictionaries"], objectModel: no === 29 || no === 32, multiObject: no === 29 || no === 32, courseRules: { ...courseRules, ...overrides }, world: { grid: m.grid.slice(), start: m.startOverride, startDir: m.startDir, required: m.required, targetPositions: m.targetPositions, terrain: m.terrain } });
  }
  async function safeCompile(runtime, source) { try { return { ...await runtime.compile(source), source, error: null }; } catch (error) { return { source, events: error.partialEvents || [], finalState: error.partialState || {}, error: root.CodeQuestPythonRuntime.friendlyErrorMessage(error) }; } }

  async function compile(m, d, no, Sk = root.Sk) {
    const desc = program(m, d, no, true), source = program(m, d, no).source;
    if (no === 31) {
      const normal = await safeCompile(runtimeFor(m, no, Sk), source);
      const counterMap = authoredMap(m, d.fields.work); const actual = counterMap.join("").split("B").length - 1;
      const counterSchema = { name: "指定反例", map: counterMap, gems: d.fields.counterexample === "gem-count" ? actual + 1 : actual, upload: counterMap.some(row => row.includes("R")) };
      const counter = await safeCompile(runtimeFor(m, no, Sk), `validate_world(${py(counterSchema)})`);
      const boundaryMap = ["SggB", "gggg", "gggR"];
      const boundarySchema = { name: "边界安全", map: boundaryMap, gems: 1, upload: d.fields.boundary !== "unsafe-relay" };
      const boundary = await safeCompile(runtimeFor(m, no, Sk), `validate_world(${py(boundarySchema)})`);
      return { ...normal, testRuns: { normal, counter, boundary }, events: [...normal.events, ...counter.events, ...boundary.events] };
    }
    const execution = await safeCompile(runtimeFor(m, no, Sk), source);
    execution.events = execution.events.map(event => { const step = desc.steps.find(item => event.line >= item.line && event.line <= item.endLine); return { ...event, programStep: step?.id || null, stepLabel: step?.label || "课程设置" }; });
    return execution;
  }

  function assess(m, d, x, assisted, no) {
    const state = x.finalState || {}, events = x.events || []; let worldSuccess = false, conceptSuccess = false, evidence = {};
    if (no === 29) { const collector = state.objects?.Collector, carrier = state.objects?.Carrier, transfer = state.transfers?.[0]; worldSuccess = !x.error && state.uploaded && state.dataComplete; conceptSuccess = worldSuccess && d.fields.meeting === "same" && d.fields.direction === "forward" && d.fields.guard === "stay" && transfer?.from === "Collector" && transfer?.to === "Carrier" && state.gates?.["handoff-gate"] === true && collector?.cargo === 0; evidence = { objects: state.objects, transfer, gateOpen: state.gates?.["handoff-gate"], uploaded: state.uploaded }; }
    if (no === 30) { const sensorEvents = events.filter(event => event.platform), waits = events.filter(event => event.type === "wait").length; worldSuccess = !x.error && state.dataComplete; conceptSuccess = worldSuccess && d.fields.condition === "both" && waits === m.data.readyAt && sensorEvents.some(event => event.platform?.docked === false) && sensorEvents.at(-1)?.platform?.docked === true && sensorEvents.at(-1)?.platform?.occupied === false; evidence = { readyAt: m.data.readyAt, waits, sensorReads: sensorEvents.map(event => event.platform), finalTick: state.ticks }; }
    if (no === 31) { const t = x.testRuns || {}; const normalOk = !t.normal?.error && t.normal?.finalState?.worldBuild?.schemaValidated; const counterOk = Boolean(t.counter?.error && /声明|宝石/.test(t.counter.error)); const boundaryOk = !t.boundary?.error && t.boundary?.finalState?.worldBuild?.schemaValidated; worldSuccess = Boolean(normalOk && counterOk && boundaryOk && state.dataComplete); conceptSuccess = worldSuccess && d.fields.counterexample === "gem-count" && d.fields.boundary === "safe-edge"; evidence = { normal: { passed: normalOk, error: t.normal?.error }, counterexample: { passed: counterOk, error: t.counter?.error }, boundary: { passed: boundaryOk, error: t.boundary?.error }, work: d.fields.work }; }
    if (no === 32) { const grid = state.worldBuild?.grid || [], placed = state.worldBuild?.placements || []; const bridgeComplete = m.data.gaps.every(gap => grid[m.data.y]?.[gap] === "g"); const transfer = state.transfers?.[0]; const sensorEvents = events.filter(event => event.platform); const waits = events.filter(event => event.type === "wait").length; const delivered = state.deliveries?.some(item => item.task === "relay-cargo"); worldSuccess = !x.error && state.dataComplete && delivered; conceptSuccess = worldSuccess && bridgeComplete && placed.length === m.data.gaps.length && transfer?.from === "Collector" && transfer?.to === "Carrier" && d.fields.meeting === "same" && d.fields.waiting === "recheck" && waits === m.data.readyAt && sensorEvents.at(-1)?.platform?.docked === true; evidence = { modules: { bridge: bridgeComplete, roles: transfer?.to === "Carrier", conservation: Boolean(transfer), recheck: waits === m.data.readyAt, delivery: delivered }, gaps: m.data.gaps, placements: placed, transfer, waits, readyAt: m.data.readyAt }; }
    const failure = x.error || (!worldSuccess ? no === 29 ? "交接、守板或上传尚未形成完整运输链。" : no === 30 ? "平台尚未在可进入状态提交。" : no === 31 ? "正常、指定反例和边界三类测试还没有全部按预期执行。" : "综合系统仍有模块没有完成。" : `世界结果完成，但第 ${no} 课的核心证据还不完整。`);
    const model = { fields: copy(d.fields), commands: copy(d.commands) };
    return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString(), lessonNo: no, contentRevision: revisions[no], fingerprint: E().fingerprint(m), challengeKey: m.early.key, phase: m.early.independent ? "challenge" : "guided", independent: m.early.independent, assisted, worldSuccess, success: Boolean(worldSuccess && conceptSuccess), failure, evidence, source: x.source, events: copy(events), program: [], routeProgram: [], path: [], trace: [], programModel: model, programVersion: E().canonical(model), ruleVersion: E().canonical(d.fields), practiceOnly: false };
  }
  function record(p, attempt, no) { p.attempts = [...p.attempts, copy(attempt)].slice(-12); if (attempt.worldSuccess) p.completed = true; if (attempt.success) { if (attempt.phase === "guided") { p.guidedComplete = true; p.guidedEvidence = copy(attempt); } if (attempt.independent) p.transferEvidence = E().mergeTransferProofs(p.transferEvidence, { [attempt.fingerprint]: copy(attempt) }); } p.mastered = E().stateGate(p, revisions[no]).mastered; }
  function reference(m, p, no) { const d = draft(p, no); d.fields = no === 29 ? { meeting: "same", direction: "forward", guard: "stay" } : no === 30 ? { condition: "both" } : no === 31 ? { work: "portal", counterexample: "gem-count", boundary: "safe-edge" } : { traversal: "all", roles: "correct", meeting: "same", waiting: "recheck" }; const actions = no === 29 ? ["transfer", "crossGate", "upload", "finish"] : no === 30 ? ["waitReady", "enterPlatform"] : no === 31 ? ["runTests", "savePack"] : ["buildBridge", "relayCargo", "waitPlatform", "deliver", "finish"]; d.commands = actions.map((action, index) => ({ id: index + 1, action })); d.nextId = actions.length + 1; d.selected = null; }
  function edit(m, p, no, { action, field, value }) { const d = draft(p, no); const remember = () => { d.undo = { fields: copy(d.fields), commands: copy(d.commands), selected: d.selected, nextId: d.nextId }; }; if (action === "select") { d.selected = d.selected === Number(value) ? null : Number(value); return { reset: false, notice: "" }; } if (action === "undo") { if (d.undo) { Object.assign(d, d.undo); d.undo = null; } else d.commands.pop(); return { reset: true, notice: "" }; } if (action === "add" && labels[value]) { const index = d.commands.findIndex(item => item.id === d.selected); if (index < 0 && d.commands.length >= limits[no]) return { reset: false, notice: `最多放 ${limits[no]} 张指令卡。` }; remember(); const command = { id: index >= 0 ? d.commands[index].id : d.nextId++, action: value }; if (index >= 0) d.commands.splice(index, 1, command); else d.commands.push(command); d.selected = null; } if (action === "remove") { const index = d.commands.findIndex(item => item.id === Number(value)); if (index >= 0) { remember(); d.commands.splice(index, 1); d.selected = null; } } if (action === "clear") { remember(); d.commands = []; d.selected = null; } if (field && Object.hasOwn(d.fields, field)) { remember(); d.fields[field] = value; } return { reset: true, notice: "" }; }
  function adapter(no) { return { revision: revisions[no], mission: (base, p) => mission(base, p, no), draft: p => draft(p, no), source: (m, d) => program(m, d, no).source, compile: (m, d, Sk) => compile(m, d, no, Sk), assess: (m, d, x, assisted) => assess(m, d, x, assisted, no), record: (p, a) => record(p, a, no), reconcile: p => { p.mastered = E().stateGate(p, revisions[no]).mastered; }, render: (m, p, c) => root.CodeQuestCollaborationLessonUI.render(m, p, c), builder: (m, p, c) => root.CodeQuestCollaborationLessonUI.builder(m, p, c), edit: (m, p, input) => edit(m, p, no, input), feedback(m, p, a) { if (!a.success) return a.failure; if (p.mastered) return `第 ${no} 课已完成独立验证。`; return m.early.independent ? "迁移完成。" : `这一阶段完成。接着做“${m.early.phaseLabels[1]}”。`; }, reference: (m, p) => reference(m, p, no) }; }

  root.CodeQuestCollaborationLessons = { revisions, limits, labels, codes, handoffWorld, platformWorld, workshopWorld, capstoneWorld, draft, mission, program, compile, assess, record };
  lessonNos.forEach(no => root.CodeQuestStructuredLessons.register(no, adapter(no)));
})(typeof globalThis !== "undefined" ? globalThis : window);
