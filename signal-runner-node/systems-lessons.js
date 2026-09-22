(function (root) {
  "use strict";

  const lessonNos = [26, 27, 28];
  const revisions = { 26: "1.8-26.2", 27: "1.8-27.2", 28: "1.8-28.2" };
  const limits = { 26: 4, 27: 4, 28: 5 };
  const labels = {
    buildBridge: "按缺口清单铺桥", finish: "提交验证",
    scout: "执行高台侦察", carry: "执行港口采集",
    chargeA: "只给 Atlas 充能", runTwins: "双机执行相同行为"
  };
  const codes = {
    buildBridge: "for x in gaps: place_tile(x, y, 'g')", finish: "finish_mission()",
    scout: "receiver.scan()", carry: "receiver.collect()",
    chargeA: "atlas.recharge(2)", runTwins: "atlas.move(); beta.move()"
  };
  const E = () => root.CodeQuestEvidence;
  const copy = value => E().clone(value);
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const terrain = extra => ({ version: "1.8", heights: {}, stairs: [], portals: [], switches: [], gates: [], oneWays: [], rotators: [], conveyors: [], supplies: [], ...extra });
  const fill = (rows, x1, y1, x2, y2, tile = "g") => { for (let y = y1; y <= y2; y += 1) for (let x = x1; x <= x2; x += 1) rows[y][x] = tile; };

  function bridgeWorld(challenge, gapCount = challenge ? 6 : 4) {
    const width = challenge ? 22 : 20, rows = Array.from({ length: 13 }, () => Array(width).fill("_"));
    const y = challenge ? 5 : 6, left = challenge ? 7 : 8;
    const leftSpans = [[3, 5], [2, 6], [1, 7], [1, 7], [1, 7], [2, 7], [2, 7], [1, 7], [1, 7], [2, 6], [3, 5]];
    leftSpans.forEach(([a, b], index) => fill(rows, a, index + 1, b, index + 1));
    const rightStart = left + gapCount;
    const rightSpans = [[rightStart + 2, width - 4], [rightStart + 1, width - 3], [rightStart, width - 2], [rightStart, width - 2], [rightStart, width - 2], [rightStart, width - 3], [rightStart, width - 3], [rightStart, width - 2], [rightStart, width - 2], [rightStart + 1, width - 3], [rightStart + 2, width - 4]];
    rightSpans.forEach(([a, b], index) => fill(rows, a, index + 1, b, index + 1));
    fill(rows, 3, 2, 6, 4, "s"); fill(rows, width - 7, 8, width - 4, 10, "s");
    const gaps = Array.from({ length: gapCount }, (_, index) => left + index);
    rows[y][left - 1] = "S"; rows[y][left + gapCount] = "B";
    const heights = {}; for (let yy = 2; yy <= 4; yy += 1) for (let x = 3; x <= 6; x += 1) if(rows[yy][x]!=="_") heights[`${x},${yy}`] = 1;
    return { kind: "opposed-fjord-cliffs", grid: rows.map(row => row.join("")), base: rows.map(row => row.join("")), start: { x: left - 1, y }, startDir: "E", gaps, y, materials: gapCount + 2, terrain: terrain({ heights }), labels: [{ at: { x: 4, y: 3 }, text: "扇形西崖" }, { at: { x: left + Math.floor(gapCount / 2), y }, text: `${gapCount} 格裂谷` }, { at: { x: width - 5, y: 9 }, text: "阶梯东崖" }] };
  }

  function rolesWorld(challenge) {
    const rows = Array.from({ length: 13 }, () => Array(19).fill("_"));
    fill(rows, 6, 1, 12, 2, "s"); fill(rows, 4, 3, 14, 5, "s"); fill(rows, 7, 6, 11, 8);
    fill(rows, 1, 8, 5, 11); fill(rows, 13, 8, 17, 11); fill(rows, 4, 9, 14, 12);
    fill(rows, 7, 9, 11, 11, "_"); fill(rows, 8, 8, 10, 8, "s");
    const scout = challenge ? { x: 12, y: 4 } : { x: 6, y: 4 };
    const cargo = challenge ? { x: 3, y: 10 } : { x: 15, y: 10 };
    rows[scout.y][scout.x] = "S"; rows[cargo.y][cargo.x] = "B";
    const heights = {}; for (let y = 1; y <= 5; y += 1) for (let x = 4; x <= 14; x += 1) if (rows[y][x] !== "_") heights[`${x},${y}`] = y <= 2 ? 2 : 1;
    return { kind: "tower-over-crescent-harbor", grid: rows.map(row => row.join("")), start: scout, startDir: "E", scout, cargo, terrain: terrain({ heights }), labels: [{ at: scout, text: "山顶侦察台" }, { at: { x: 9, y: 7 }, text: "垂直职责轴" }, { at: cargo, text: "月牙货港" }] };
  }

  function twinsWorld(challenge) {
    const rows = Array.from({ length: 13 }, () => Array(20).fill("_"));
    fill(rows, 1, 1, 7, 3); fill(rows, 1, 3, 3, 8); fill(rows, 1, 8, 7, 10);
    fill(rows, 12, 2, 18, 4); fill(rows, 16, 4, 18, 9); fill(rows, 12, 9, 18, 11);
    fill(rows, 6, 5, 13, 7, "s"); fill(rows, 8, 3, 11, 9, "s");
    fill(rows, 9, 5, 10, 7, "_");
    const starts = challenge ? [[13, 3], [3, 9]] : [[3, 2], [14, 10]];
    const gems = starts.map(([x, y]) => [x + 1, y]);
    rows[starts[0][1]][starts[0][0]] = "S"; rows[gems[0][1]][gems[0][0]] = "B"; rows[gems[1][1]][gems[1][0]] = "B";
    const heights = {}; for (let y = 2; y <= 11; y += 1) for (let x = 12; x <= 18; x += 1) if (rows[y][x] !== "_") heights[`${x},${y}`] = 1;
    return { kind: "opposed-c-depots", grid: rows.map(row => row.join("")), start: { x: starts[0][0], y: starts[0][1] }, startDir: "E", starts, gems, initialEnergy: challenge ? [5, 8] : [4, 7], terrain: terrain({ heights }), labels: [{ at: { x: 3, y: 2 }, text: "Atlas C 仓" }, { at: { x: 14, y: 10 }, text: "Beta 反向仓" }, { at: { x: 9, y: 4 }, text: "交叉状态桥" }] };
  }

  const initialFields = no => no === 26 ? { traversal: "", offset: "" } : no === 27 ? { scoutReceiver: "", cargoReceiver: "" } : { ownership: "", chargeTarget: "" };
  const initialDraft = no => ({ fields: initialFields(no), commands: [], selected: null, nextId: 1, undo: null });
  function draft(p, no) {
    p.systemDrafts ||= {}; const key = `${no}-${p.phase}-${p.variant}`;
    if (!p.systemDrafts[key]) p.systemDrafts[key] = initialDraft(no);
    const d = p.systemDrafts[key]; d.fields = { ...initialFields(no), ...(d.fields || {}) };
    d.commands = Array.isArray(d.commands) ? d.commands.filter(item => labels[item.action]).slice(0, limits[no]) : [];
    d.nextId = Math.max(Number(d.nextId) || 1, 1, ...d.commands.map(item => Number(item.id) + 1));
    if (!d.commands.some(item => item.id === d.selected)) d.selected = null;
    return d;
  }
  function archive(p, no) { const revision = revisions[no]; if (p.contentRevision === revision) return; if (p.contentRevision) p.contentArchives = { ...p.contentArchives, [p.contentRevision]: { attempts: copy(p.attempts), guidedEvidence: p.guidedEvidence, transferEvidence: p.transferEvidence, systemDrafts: p.systemDrafts } }; Object.assign(p, { contentRevision: revision, phase: "guided", variant: 0, systemDrafts: {}, mastered: false, guidedComplete: false, guidedEvidence: null, repairEvidence: null, transferEvidence: {}, explanationEvidence: null, attempts: [] }); }

  function mission(base, p, no) {
    archive(p, no); p.attempts = p.attempts.filter(item => item.contentRevision === revisions[no]); const challenge = p.phase === "challenge";
    const world = no === 26 ? bridgeWorld(challenge) : no === 27 ? rolesWorld(challenge) : twinsWorld(challenge);
    const content = no === 26 ? { title: "峡谷数据施工队", goal: "让缺口清单中的每一项都成为真实桥面，缩短清单时旧桥面也不能残留。", rule: "施工位置来自当前项；遍历清单全部元素，不写死次数。", phases: ["连接数据与施工位", "桥长变化迁移"], allowed: ["buildBridge", "finish"], hints: ["先从 gaps 读取当前位置。", "循环次数应由清单本身决定。", "每次都从原始蓝图重新建造。"] }
      : no === 27 ? { title: "高台与货港职责", goal: "把侦察和采集调用交给真正具备该能力的对象。", rule: "方法属于对象的职责；名字相似不会让对象获得另一种能力。", phases: ["匹配对象职责", "岗位换位迁移"], allowed: ["scout", "carry", "finish"], hints: ["Flyer 可以侦察。", "货物需要 Explorer 采集。", "把 collect() 给 Flyer 会产生真实能力错误。"] }
      : { title: "双机独立状态场", goal: "同一种 Explorer 行为可以复用，但 Atlas 与 Beta 必须保存各自的能量、位置和货物。", rule: "两个构造调用产生两个实例；别名只指向同一个实例。", phases: ["建立独立实例", "起点与能量迁移"], allowed: ["chargeA", "runTwins", "finish"], hints: ["Atlas 和 Beta 都要单独创建。", "充能只改变接收调用的对象。", "beta = atlas 不会生成第二份状态。"] };
    const m = { ...base, contentRevision: revisions[no], lessonMode: `v18-systems-${no}`, grid: world.grid, startOverride: world.start, startDir: world.startDir, targetPositions: no === 28 ? world.gems.map(([x, y]) => ({ x, y })) : no === 27 ? [{ ...world.cargo }] : [], required: no === 28 ? 2 : no === 27 ? 1 : 0, energy: 60, terrain: world.terrain, worldLabels: world.labels, allowed: [], limit: limits[no], solution: [], solutionFn: [], routeChoices: [], data: world, systemAllowed: content.allowed, semanticConstraints: { capability: `systems-${no}`, fields: draft(p, no).fields, data: world }, early: { v18: true, independent: challenge, repairing: false, key: `${revisions[no]}-${p.phase}-${p.variant}`, requiresUpload: false, title: content.title, goal: content.goal, rule: content.rule, phaseLabels: content.phases, targets: [], hints: content.hints } };
    if (E().fingerprint(m) !== p.currentFingerprint) E().enter(p, m); p.mastered = E().stateGate(p, revisions[no]).mastered; return m;
  }

  const py = value => JSON.stringify(value).replace(/true/g, "True").replace(/false/g, "False").replace(/null/g, "None");
  function program(m, d, no, preview = false) {
    if (!preview && !d.commands.length) throw new Error("先点一张指令卡，加入程序。");
    const required = no === 26 ? [["traversal", "先选择清单遍历方式。"], ["offset", "先连接施工坐标。"]] : no === 27 ? [["scoutReceiver", "先选择侦察对象。"], ["cargoReceiver", "先选择采集对象。"]] : [["ownership", "先选择实例关系。"], ["chargeTarget", "先选择充能对象。"]];
    if (!preview) for (const [key, message] of required) if (!d.fields[key]) throw new Error(message);
    const lines = [], steps = []; const push = (text, item) => { const start = lines.length + 1; String(text).split("\n").forEach(line => lines.push(line)); steps.push({ id: `command-${item.id}`, commandId: item.id, index: steps.length, kind: item.action, label: labels[item.action], code: text, line: start, endLine: lines.length }); };
    if (no === 26) {
      lines.push(`blueprint = ${py(m.data.base.map(row => [...row]))}`, `gaps = ${py(m.data.gaps)}`, `materials = ${m.data.materials}`, "");
      for (const item of d.commands) { if (item.action === "buildBridge") { const iterable = d.fields.traversal === "first" ? "gaps[:1]" : "gaps"; const x = d.fields.offset === "shift" ? "current + 1" : "current"; push(`build_world(blueprint)\nfor current in ${iterable}:\n    place_tile(${x}, ${m.data.y}, \"g\")\n    materials = materials - 1\nreport(materials)`, item); } if (item.action === "finish") push("finish_mission()", item); }
    }
    if (no === 27) {
      lines.push(`scout = Flyer("Scout", 6, ${m.data.scout.x}, ${m.data.scout.y}, "E")`, `transport = Explorer("Transport", 8, ${m.data.cargo.x}, ${m.data.cargo.y}, "E")`, "");
      for (const item of d.commands) { if (item.action === "scout") push(`${d.fields.scoutReceiver === "transport" ? "transport" : "scout"}.scan()`, item); if (item.action === "carry") push(`${d.fields.cargoReceiver === "scout" ? "scout" : "transport"}.collect()`, item); if (item.action === "finish") push("finish_mission()", item); }
    }
    if (no === 28) {
      const [a, b] = m.data.starts, [ea, eb] = m.data.initialEnergy;
      lines.push(`atlas = Explorer("Atlas", ${ea}, ${a[0]}, ${a[1]}, "E")`, d.fields.ownership === "alias" ? "beta = atlas" : `beta = Explorer("Beta", ${eb}, ${b[0]}, ${b[1]}, "E")`, "");
      for (const item of d.commands) { if (item.action === "chargeA") push(`${d.fields.chargeTarget === "beta" ? "beta" : "atlas"}.recharge(2)`, item); if (item.action === "runTwins") push("atlas.move()\natlas.collect()\nbeta.move()\nbeta.collect()", item); if (item.action === "finish") push("finish_mission()", item); }
    }
    return { source: lines.join("\n"), steps };
  }

  async function compile(m, d, no, Sk = root.Sk) {
    const desc = program(m, d, no, true), source = program(m, d, no).source;
    const functions = new Set(["build_world", "place_tile", "report", "finish_mission", "range", "len", "Explorer", "Flyer", "scan", "collect", "move", "recharge"]);
    const runtime = root.CodeQuestPythonRuntime.create({ Sk, initialEnergy: m.energy, apiCallLimit: 320, allowedFunctions: functions, languageFeatures: no === 26 ? ["for-loops"] : [], objectModel: no >= 27, multiObject: no >= 27, world: { grid: m.grid, start: m.startOverride, startDir: m.startDir, required: m.required, targetPositions: m.targetPositions, terrain: m.terrain } });
    let execution; try { execution = { ...await runtime.compile(source), source, error: null }; } catch (error) { execution = { source, events: error.partialEvents || [], finalState: error.partialState || {}, error: root.CodeQuestPythonRuntime.friendlyErrorMessage(error) }; }
    execution.events = execution.events.map(event => { const step = desc.steps.find(item => event.line >= item.line && event.line <= item.endLine); return { ...event, programStep: step?.id || null, stepLabel: step?.label || "对象设置" }; }); return execution;
  }

  function assess(m, d, x, assisted, no) {
    const state = x.finalState || {}, events = x.events || []; let worldSuccess = false, conceptSuccess = false, evidence = {};
    if (no === 26) { const expectedRows = m.data.base.map(row => [...row]); for (const xPos of m.data.gaps) expectedRows[m.data.y][xPos] = "g"; const expected = expectedRows.map(row => row.join("")), grid = state.worldBuild?.grid, placements = state.worldBuild?.placements || []; worldSuccess = !x.error && state.dataComplete && same(grid, expected); conceptSuccess = worldSuccess && d.fields.traversal === "all" && d.fields.offset === "exact" && placements.length === m.data.gaps.length; evidence = { gaps: m.data.gaps, placements, grid, expected, materials: state.reports?.at(-1) }; }
    if (no === 27) { const scout = state.objects?.Scout, transport = state.objects?.Transport; worldSuccess = !x.error && state.dataComplete && scout?.actions?.includes("scan") && transport?.actions?.includes("collect"); conceptSuccess = worldSuccess && d.fields.scoutReceiver === "scout" && d.fields.cargoReceiver === "transport"; evidence = { objects: state.objects, capabilityFailure: events.find(event => event.failureKind === "object-capability") || null }; }
    if (no === 28) { const atlas = state.objects?.Atlas, beta = state.objects?.Beta; worldSuccess = !x.error && state.dataComplete && atlas && beta && atlas.cargo === 1 && beta.cargo === 1; conceptSuccess = worldSuccess && d.fields.ownership === "independent" && d.fields.chargeTarget === "atlas" && atlas.initialEnergy === m.data.initialEnergy[0] && beta.initialEnergy === m.data.initialEnergy[1] && atlas.energy === atlas.initialEnergy + 1 && beta.energy === beta.initialEnergy - 1; evidence = { objects: state.objects, starts: m.data.starts }; }
    const failure = x.error || (!worldSuccess ? no === 26 ? "桥面还没有完全跟随当前缺口清单生成。" : no === 27 ? "侦察或采集被交给了不合适的对象。" : "Atlas 与 Beta 还没有留下两份独立的运行状态。" : `世界结果完成，但第 ${no} 课的概念证据还不完整。`);
    const model = { fields: copy(d.fields), commands: copy(d.commands) };
    return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString(), lessonNo: no, contentRevision: revisions[no], fingerprint: E().fingerprint(m), challengeKey: m.early.key, phase: m.early.independent ? "challenge" : "guided", independent: m.early.independent, assisted, worldSuccess, success: Boolean(worldSuccess && conceptSuccess), failure, evidence, source: x.source, events: copy(events), program: [], routeProgram: [], path: [], trace: [], programModel: model, programVersion: E().canonical(model), ruleVersion: E().canonical(d.fields), practiceOnly: false };
  }
  function record(p, attempt, no) { p.attempts = [...p.attempts, copy(attempt)].slice(-12); if (attempt.worldSuccess) p.completed = true; if (attempt.success) { if (attempt.phase === "guided") { p.guidedComplete = true; p.guidedEvidence = copy(attempt); } if (attempt.independent) p.transferEvidence = E().mergeTransferProofs(p.transferEvidence, { [attempt.fingerprint]: copy(attempt) }); } p.mastered = E().stateGate(p, revisions[no]).mastered; }
  function reference(m, p, no) { const d = draft(p, no); d.fields = no === 26 ? { traversal: "all", offset: "exact" } : no === 27 ? { scoutReceiver: "scout", cargoReceiver: "transport" } : { ownership: "independent", chargeTarget: "atlas" }; const actions = no === 26 ? ["buildBridge", "finish"] : no === 27 ? ["scout", "carry", "finish"] : ["chargeA", "runTwins", "finish"]; d.commands = actions.map((action, index) => ({ id: index + 1, action })); d.nextId = actions.length + 1; d.selected = null; }
  function edit(m, p, no, { action, field, value }) { const d = draft(p, no); const remember = () => { d.undo = { fields: copy(d.fields), commands: copy(d.commands), selected: d.selected, nextId: d.nextId }; }; if (action === "select") { d.selected = d.selected === Number(value) ? null : Number(value); return { reset: false, notice: "" }; } if (action === "undo") { if (d.undo) { Object.assign(d, d.undo); d.undo = null; } else d.commands.pop(); return { reset: true, notice: "" }; } if (action === "add" && labels[value]) { const index = d.commands.findIndex(item => item.id === d.selected); if (index < 0 && d.commands.length >= limits[no]) return { reset: false, notice: `最多放 ${limits[no]} 张指令卡。` }; remember(); const command = { id: index >= 0 ? d.commands[index].id : d.nextId++, action: value }; if (index >= 0) d.commands.splice(index, 1, command); else d.commands.push(command); d.selected = null; } if (action === "remove") { const index = d.commands.findIndex(item => item.id === Number(value)); if (index >= 0) { remember(); d.commands.splice(index, 1); d.selected = null; } } if (action === "clear") { remember(); d.commands = []; d.selected = null; } if (field && Object.hasOwn(d.fields, field)) { remember(); d.fields[field] = value; } return { reset: true, notice: "" }; }
  function adapter(no) { return { revision: revisions[no], mission: (base, p) => mission(base, p, no), draft: p => draft(p, no), source: (m, d) => program(m, d, no).source, compile: (m, d, Sk) => compile(m, d, no, Sk), assess: (m, d, x, assisted) => assess(m, d, x, assisted, no), record: (p, a) => record(p, a, no), reconcile: p => { p.mastered = E().stateGate(p, revisions[no]).mastered; }, render: (m, p, c) => root.CodeQuestSystemsLessonUI.render(m, p, c), builder: (m, p, c) => root.CodeQuestSystemsLessonUI.builder(m, p, c), edit: (m, p, input) => edit(m, p, no, input), feedback(m, p, a) { if (!a.success) return a.failure; if (p.mastered) return `第 ${no} 课已完成独立验证。`; return m.early.independent ? "迁移完成。" : `这一阶段完成。接着做“${m.early.phaseLabels[1]}”。`; }, reference: (m, p) => reference(m, p, no) }; }

  root.CodeQuestSystemsLessons = { revisions, limits, labels, codes, bridgeWorld, rolesWorld, twinsWorld, draft, mission, program, compile, assess, record };
  lessonNos.forEach(no => root.CodeQuestStructuredLessons.register(no, adapter(no)));
})(typeof globalThis !== "undefined" ? globalThis : window);
