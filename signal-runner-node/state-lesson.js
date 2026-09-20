(function (root) {
  "use strict";
  const revision = "1.8-17.1";
  const E = () => root.CodeQuestEvidence;
  const copy = value => E().clone(value);
  const limit = 64;
  const actions = { move: "前进", left: "左转", right: "右转", attempt: "采集尝试", check: "检查计数" };
  const validInitial = value => Number.isInteger(value) && value >= 0 && value <= 3;
  const validDelta = value => Number.isInteger(value) && value >= 0 && value <= 2;

  function scenario(phase, variant = 0) {
    const challenge = phase === "challenge";
    const alternate = challenge && variant % 2 === 1;
    const grid = alternate
      ? ["__________", "__________", "_gSgggBgg_", "________g_", "________g_", "_Rggggggg_", "__________", "__________"]
      : challenge
      ? ["__________", "__________", "_ggBgggSg_", "_g________", "_g________", "_ggggggRg_", "__________", "__________"]
      : ["__________", "__________", "_gSgBgggg_", "________g_", "________g_", "_RggggggB_", "__________", "__________"];
    const start = challenge && !alternate ? { x: 7, y: 2 } : { x: 2, y: 2 };
    const empty = challenge ? alternate ? { x: 4, y: 2 } : { x: 5, y: 2 } : { x: 6, y: 2 };
    const check = { x: 4, y: 5 };
    const terminal = challenge && !alternate ? { x: 7, y: 5 } : { x: 1, y: 5 };
    const gate = challenge && !alternate ? { x: 5, y: 5 } : { x: 3, y: 5 };
    const targets = challenge ? [alternate ? { x: 6, y: 2 } : { x: 3, y: 2 }] : [{ x: 4, y: 2 }, { x: 8, y: 5 }];
    const stairX = challenge && !alternate ? 1 : 8;
    const heights = {};
    for (let x = 1; x <= 8; x++) heights[`${x},5`] = 1;
    return {
      grid, start, startDir: challenge && !alternate ? "W" : "E", empty, check, terminal, gate, targets,
      expectedAttempts: challenge ? ["empty", "collected", "already-collected"] : ["collected", "already-collected", "empty", "collected"],
      terrain: { version: "1.8", heights, stairs: [{ from: { x: stairX, y: 4 }, to: { x: stairX, y: 5 } }], portals: [], switches: [],
        gates: [{ id: "COUNT", kind: "count", at: gate }] }
    };
  }

  function authorCommands(phase, variant = 0) {
    const repeat = (action, count) => Array.from({ length: count }, () => ({ action }));
    const items = phase === "challenge" && variant % 2 === 1
      ? [...repeat("move", 2), { action: "attempt" }, ...repeat("move", 2), { action: "attempt" }, { action: "attempt" },
        ...repeat("move", 2), { action: "right" }, ...repeat("move", 3), { action: "right" }, ...repeat("move", 4),
        { action: "check" }, ...repeat("move", 3)]
      : phase === "challenge"
      ? [...repeat("move", 2), { action: "attempt" }, ...repeat("move", 2), { action: "attempt" }, { action: "attempt" },
        ...repeat("move", 2), { action: "left" }, ...repeat("move", 3), { action: "left" }, ...repeat("move", 3),
        { action: "check" }, ...repeat("move", 3)]
      : [...repeat("move", 2), { action: "attempt" }, { action: "attempt" }, ...repeat("move", 2), { action: "attempt" },
        ...repeat("move", 2), { action: "right" }, ...repeat("move", 3), { action: "attempt" }, { action: "right" },
        ...repeat("move", 4), { action: "check" }, ...repeat("move", 3)];
    return items.map((item, index) => ({ id: index + 1, ...item }));
  }

  const programModel = d => ({ initialCount: d.initialCount, updateOn: d.updateOn, delta: d.delta, commands: copy(d.commands) });
  function draft(p) {
    const key = `${p.phase}-${p.variant}`;
    p.stateDrafts ||= {};
    if (!p.stateDrafts[key]) {
      p.stateDrafts[key] = {
        initialCount: p.savedCountRule?.initialCount ?? null,
        updateOn: p.savedCountRule?.updateOn || null,
        delta: p.savedCountRule?.delta ?? null,
        commands: [], selected: null, undo: null, nextId: 1
      };
    }
    const d = p.stateDrafts[key];
    d.initialCount = validInitial(d.initialCount) ? d.initialCount : null;
    d.updateOn = ["success", "attempt"].includes(d.updateOn) ? d.updateOn : null;
    d.delta = validDelta(d.delta) ? d.delta : null;
    d.commands = Array.isArray(d.commands) ? d.commands.filter(c => actions[c.action]).slice(0, limit) : [];
    d.nextId = Math.max(d.nextId || 1, ...d.commands.map(c => Number(c.id) + 1));
    if (!d.commands.some(c => c.id === d.selected)) d.selected = null;
    return d;
  }

  function mission(base, p) {
    if (p.contentRevision !== revision) {
      if (p.contentRevision) p.contentArchives = { ...p.contentArchives, [p.contentRevision]: {
        attempts: copy(p.attempts), guidedEvidence: p.guidedEvidence, transferEvidence: p.transferEvidence,
        stateDrafts: p.stateDrafts, savedCountRule: p.savedCountRule
      } };
      p.contentRevision = revision; p.phase = "guided"; p.variant = 0; p.stateDrafts = {}; p.savedCountRule = null;
      p.mastered = false; p.guidedComplete = false; p.guidedEvidence = null; p.repairEvidence = null;
      p.transferEvidence = {}; p.explanationEvidence = null; p.attempts = [];
    }
    p.attempts = p.attempts.filter(a => a.contentRevision === revision);
    const s = scenario(p.phase, p.variant);
    const m = { ...base, contentRevision: revision, lessonMode: "v18-state-count", grid: s.grid,
      startOverride: s.start, startDir: s.startDir, targetPositions: s.targets, required: s.targets.length, energy: 80,
      terrain: s.terrain, countStation: s.check, terminal: s.terminal, emptyStation: s.empty, expectedAttempts: s.expectedAttempts,
      functionEnabled: true,
      worldLabels: [{ at: s.empty, text: "空采点", waypoint: true }, { at: s.check, text: "计数检查", waypoint: true },
        { at: s.terminal, text: "终端", waypoint: true }, { at: s.gate, text: "计数门" }],
      allowed: [], limit, solution: [], solutionFn: [], pythonStudio: null, routeChoices: [],
      semanticConstraints: { variable: "count", updateRule: "successful-collection", terminal: s.terminal, gate: s.gate },
      faultDescriptor: null,
      early: { v18: true, independent: p.phase === "challenge", repairing: false, key: `${revision}-${p.phase}-${p.variant}`,
        requiresUpload: false, goal: p.phase === "challenge" ? "新回收港只有一颗宝石。重新编路线，让 count 仍和实际数量一致。" : "依次制造成功、重复和空采，再用正确 count 打开计数门。",
        rule: "只有 try_collect() 返回 True，count 才加 1。",
        mainStarter: [], functionStarter: [], faulty: [], phaseLabels: ["连接成功计数", "回收港迁移"],
        targets: s.targets.map((point, index) => ({ ...point, label: String.fromCharCode(65 + index) })),
        prediction: { options: [] }, hints: ["先到标有“空采点”的格子试一次，也要在同一颗宝石上试两次。", "对照每次采集尝试：世界宝石没增加时，count 也不应改变。", "计数工具选：初值 0、成功后、加 1；路线仍要由你自己完成。"] } };
    draft(p);
    if (E().fingerprint(m) !== p.currentFingerprint) E().enter(p, m);
    p.mastered = E().stateGate(p, revision).mastered;
    return m;
  }

  function program(m, d, preview = false) {
    if (!preview && !d.commands.length) throw new Error("先点一条指令，加入程序。");
    if (!preview && !validInitial(d.initialCount)) throw new Error("先到“计数工具”选择 count 初值。");
    if (!preview && !d.updateOn) throw new Error("先选择 count 在成功后还是每次尝试后更新。");
    if (!preview && !validDelta(d.delta)) throw new Error("先选择 count 每次增加多少。");
    const initial = validInitial(d.initialCount) ? d.initialCount : "?";
    const delta = validDelta(d.delta) ? d.delta : "?";
    const lines = [`count = ${initial}`];
    const steps = [];
    for (const [index, command] of d.commands.entries()) {
      const start = lines.length + 1;
      if (command.action === "attempt") {
        lines.push("collected = try_collect()");
        if (d.updateOn === "success") lines.push("if collected:", `    count = count + ${delta}`);
        else if (d.updateOn === "attempt") lines.push(`count = count + ${delta}`);
        else lines.push("# 还未选择更新时间");
      } else lines.push(({ move: "move()", left: "turn_left()", right: "turn_right()", check: "check_count(count)" })[command.action]);
      const code = command.action === "attempt" ? "try_collect()" : lines[start - 1];
      steps.push({ id: `command-${command.id}`, commandId: command.id, index, kind: command.action,
        label: actions[command.action], code, line: start, endLine: lines.length });
    }
    return { source: lines.join("\n"), steps };
  }
  const source = (m, d) => program(m, d).source;

  async function compile(m, d, Sk = root.Sk) {
    const code = source(m, d);
    const runtime = root.CodeQuestPythonRuntime.create({ Sk, initialEnergy: m.energy, apiCallLimit: 240,
      allowedFunctions: new Set(["move", "turn_left", "turn_right", "try_collect", "check_count"]),
      world: { grid: m.grid, start: m.startOverride, startDir: m.startDir, required: m.required,
        targetPositions: m.targetPositions, terrain: m.terrain } });
    let execution;
    try { execution = { ...await runtime.compile(code), source: code, error: null }; }
    catch (error) { execution = { source: code, events: error.partialEvents || [], finalState: error.partialState || {},
      error: root.CodeQuestPythonRuntime.friendlyErrorMessage(error) }; }
    const description = program(m, d), initialLine = 1;
    execution.events = execution.events.map(event => {
      const action = description.steps.find(s => event.line >= s.line && event.line <= s.endLine);
      return { ...event, programStep: action?.id || (event.line === initialLine ? "count-rule" : null),
        stepLabel: action?.label || "设置 count 初值" };
    });
    return execution;
  }

  function assess(m, d, execution, assisted = false) {
    const compactState = s => ({ x: s.x, y: s.y, direction: s.direction, directionName: s.directionName,
      energy: s.energy, collectedKeys: s.collectedKeys, variables: s.variables, ticks: s.ticks, gates: s.gates });
    const events = execution.events.map(event => ({ ...event, state: compactState(event.state) }));
    const attemptIndexes = execution.events.map((e, index) => e.type === "collect-attempt" ? index : -1).filter(index => index >= 0);
    const attempts = attemptIndexes.map((eventIndex, index) => {
      const event = execution.events[eventIndex], next = attemptIndexes[index + 1] ?? execution.events.length;
      const countEvents = execution.events.slice(eventIndex + 1, next).filter(e => e.variable?.name === "count");
      return { eventId: `${eventIndex}`, ...event.collectAttempt,
        countBefore: event.state.variables?.count, countUpdates: countEvents.map(e => e.variable),
        countAfter: countEvents.at(-1)?.variable.value ?? event.state.variables?.count };
    });
    const initial = execution.events.find(e => e.variable?.name === "count");
    const checks = execution.events.filter(e => e.type === "count-check").map(e => e.countCheck);
    const correctTransitions = attempts.every(a => a.success
      ? a.countUpdates.length === 1 && a.countUpdates[0].previousValue === a.worldCountBefore && a.countUpdates[0].value === a.worldCountAfter
      : a.countUpdates.length === 0 && a.countAfter === a.worldCountAfter);
    const reasons = new Set(attempts.map(a => a.reason));
    const conceptSuccess = initial?.variable?.value === 0 && correctTransitions
      && ["collected", "empty", "already-collected"].every(reason => reasons.has(reason))
      && checks.some(check => check.passed);
    const atTerminal = execution.finalState.x === m.terminal.x && execution.finalState.y === m.terminal.y;
    const worldSuccess = !execution.error && execution.finalState.collectedKeys?.length === m.required
      && execution.finalState.gates?.COUNT && atTerminal;
    const failure = execution.error || (!execution.finalState.gates?.COUNT ? "count 与实际宝石数还没有通过检查。"
      : !atTerminal ? "计数门开了，还要继续编排路线走到终端。"
      : !conceptSuccess ? "任务完成了，但要同时留下成功、空采和重复采集证据。" : "");
    return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString(), lessonNo: 17,
      contentRevision: revision, fingerprint: E().fingerprint(m), challengeKey: m.early.key,
      phase: m.early.independent ? "challenge" : "guided", independent: m.early.independent, assisted,
      worldSuccess: Boolean(worldSuccess), success: Boolean(worldSuccess && conceptSuccess), failure,
      attempts, checks, source: execution.source, events: copy(events), program: [], routeProgram: [], path: [], trace: [],
      programModel: programModel(d), programVersion: E().canonical(programModel(d)),
      ruleVersion: E().canonical({ initialCount: d.initialCount, updateOn: d.updateOn, delta: d.delta }),
      practiceOnly: false, targetOrderCorrect: true, predictionCorrect: true };
  }

  function record(p, a) {
    p.attempts = [...p.attempts, copy(a)].slice(-12);
    if (a.worldSuccess) p.completed = true;
    if (a.success) {
      p.savedCountRule = { initialCount: a.programModel.initialCount, updateOn: a.programModel.updateOn, delta: a.programModel.delta };
      if (a.phase === "guided") { p.guidedComplete = true; p.guidedEvidence = copy(a); }
      if (a.independent) p.transferEvidence = E().mergeTransferProofs(p.transferEvidence, { [a.fingerprint]: copy(a) });
    }
    p.mastered = E().stateGate(p, revision).mastered;
  }

  const adapter = {
    revision, mission, draft, source, compile, assess, record,
    reconcile: p => { p.mastered = E().stateGate(p, revision).mastered; },
    render: (m, p, context) => root.CodeQuestStateLessonUI.render(m, p, context),
    builder: (m, p, context) => root.CodeQuestStateLessonUI.builder(m, p, context),
    reference: (m, p) => Object.assign(draft(p), { initialCount: 0, updateOn: "success", delta: 1,
      commands: authorCommands(p.phase, p.variant), selected: null }),
    feedback(m, p, a) {
      if (!a.success) return a.failure;
      if (p.mastered) return "本课完成！新地图里，count 也只跟着成功采集变化。";
      if (m.early.independent) return "迁移完成。";
      return "成功计数已接通。接着到新回收港独立编一次。";
    },
    edit(m, p, { action, field, value }) {
      const d = draft(p);
      if (action === "select") { d.selected = d.selected === Number(value) ? null : Number(value); return { reset: false, notice: "" }; }
      if (action === "append-end") { d.selected = null; return { reset: false, notice: "" }; }
      if (action === "undo") {
        if (d.undo) { Object.assign(d, d.undo); d.undo = null; }
        else { d.commands.pop(); d.selected = null; }
        return { reset: true, notice: "" };
      }
      const remember = () => { d.undo = { ...programModel(d), selected: d.selected, nextId: d.nextId }; };
      if (action === "add" && actions[value]) {
        const index = d.commands.findIndex(c => c.id === d.selected);
        if (index < 0 && d.commands.length >= limit) return { reset: false, notice: `最多放 ${limit} 条指令。` };
        remember();
        const command = { id: index >= 0 ? d.commands[index].id : d.nextId++, action: value };
        if (index >= 0) d.commands.splice(index, 1, command); else d.commands.push(command);
        d.selected = null;
      }
      if (action === "remove") {
        const index = d.commands.findIndex(c => c.id === Number(value));
        if (index >= 0) { remember(); d.commands.splice(index, 1); d.selected = null; }
      }
      if (action === "clear") { remember(); d.commands = []; d.selected = null; }
      if (action === "update-on") { remember(); d.updateOn = value; }
      if (field) {
        const n = value === "" ? null : Number(value); remember();
        if (field === "initialCount") d.initialCount = validInitial(n) ? n : null;
        if (field === "delta") d.delta = validDelta(n) ? n : null;
      }
      return { reset: true, notice: "" };
    }
  };
  root.CodeQuestStateLesson = { revision, scenario, authorCommands, actions, limit, draft, mission, program, source, compile, assess, record };
  root.CodeQuestStructuredLessons.register(17, adapter);
})(typeof globalThis !== "undefined" ? globalThis : window);
