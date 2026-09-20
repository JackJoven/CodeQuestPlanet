(function (root) {
  "use strict";
  const revision = "1.8-19.5";
  const E = () => root.CodeQuestEvidence;
  const copy = value => E().clone(value);
  const validNumber = value => Number.isInteger(value) && value >= 0 && value <= 6;
  const learningSteps = ["recall", "mismatch", "connect", "route"];
  const step = p => p.phase === "guided" ? p.parameterStep || "route" : "route";
  function dockScenario(phase, variant) {
    const inputs = phase === "challenge" ? [[1, 5], [0, 4], [5, 0]][variant % 3] : phase === "repair" && variant % 3 === 1 ? [4, 2] : [2, 4];
    const turns = phase === "challenge" ? [1, 2, 3][variant % 3] : phase === "repair" ? (variant + 1) % 4 : 0;
    const rows = Array.from({ length: 10 }, () => Array(11).fill("_"));
    const heights = {}, stairs = [];
    for (let y = 1; y <= 3; y++) for (let x = 1; x <= 8; x++) rows[y][x] = "g";
    for (let y = 5; y <= 7; y++) for (let x = 1; x <= 8; x++) {
      rows[y][x] = "s";
      if (phase !== "guided" || y === 6) heights[`${x},${y}`] = Math.min(2, Math.max(0, x - 2));
    }
    rows[4][2] = "s"; // One fixed bridge joins the islands; the surrounding gap is impassable.
    stairs.push({ from: { x: 2, y: 6 }, to: { x: 3, y: 6 } }, { from: { x: 3, y: 6 }, to: { x: 4, y: 6 } });
    let grid = rows.map(row => row.join(""));
    const transform = point => {
      let p = { ...point }, width = 11, height = 10;
      for (let i = 0; i < turns; i++) { p = { x: height - 1 - p.y, y: p.x }; [width, height] = [height, width]; }
      return p;
    };
    for (let i = 0; i < turns; i++) grid = Array.from({ length: grid[0].length }, (_, y) => Array.from({ length: grid.length }, (_, x) => grid[grid.length - 1 - x][y]).join(""));
    const start = transform({ x: 2, y: 2 });
    const targets = [transform({ x: 2 + inputs[0], y: 2 }), transform({ x: 2 + inputs[1], y: 6 })];
    const marked = grid.map(row => [...row]);
    marked[start.y][start.x] = "S";
    targets.forEach(p => { if (p.x !== start.x || p.y !== start.y) marked[p.y][p.x] = "B"; });
    return { grid: marked.map(row => row.join("")), start, startDir: ["E", "S", "W", "N"][turns], inputs,
      entries: [start, transform({ x: 2, y: 6 })], targets,
      terrain: { version: "1.8", heights: Object.fromEntries(Object.entries(heights).map(([cell, h]) => {
        const [x, y] = cell.split(",").map(Number), p = transform({ x, y }); return [`${p.x},${p.y}`, h];
      })), stairs: stairs.map(s => ({ from: transform(s.from), to: transform(s.to) })), portals: [], switches: [], gates: [] } };
  }
  function scenario(phase, variant, lessonStep = "route") {
    if (lessonStep === "route") return dockScenario(phase, variant);
    const distance = lessonStep === "recall" ? 2 : 4;
    const rows = Array.from({ length: 6 }, () => Array(9).fill("_"));
    for (let y = 1; y <= 3; y++) for (let x = 1; x <= distance + 3; x++) rows[y][x] = "g";
    const start = { x: 2, y: 2 }, target = { x: 2 + distance, y: 2 };
    rows[start.y][start.x] = "S"; rows[target.y][target.x] = "B";
    return { grid: rows.map(row => row.join("")), start, startDir: "E", inputs: [distance], targets: [target],
      terrain: { version: "1.8", heights: {}, stairs: [], portals: [], switches: [], gates: [] } };
  }
  const actions = { move: "前进", left: "左转", right: "右转", collect: "采集", call: "前进工具" };
  const limit = 64;
  // Author fixture for repair/reference only. Student construction starts empty.
  function authorCommands(inputs) {
    const [a, b] = inputs;
    const items = [{ action: "call", argument: a }, { action: "collect" }, { action: "right" }, { action: "right" },
      ...Array.from({ length: a }, () => ({ action: "move" })), { action: "left" },
      ...Array.from({ length: 4 }, () => ({ action: "move" })), { action: "left" }, { action: "call", argument: b }, { action: "collect" }];
    return items.map((item, i) => ({ id: i + 1, ...item }));
  }
  const programModel = d => ({ binding: d.binding, constant: d.constant, commands: copy(d.commands) });
  function archiveEvidence(archive) {
    if (archive.format === "indexed-attempts-v1") return archive;
    const attempts = new Map();
    const ref = attempt => {
      if (!attempt?.id) return null;
      attempts.set(attempt.id, attempt);
      return { attemptId: attempt.id };
    };
    const recentAttemptIds = (archive.attempts || []).map(a => ref(a)?.attemptId).filter(Boolean);
    const guidedEvidence = ref(archive.guidedEvidence);
    const repairEvidence = archive.repairEvidence ? { before: ref(archive.repairEvidence.before), after: ref(archive.repairEvidence.after) } : null;
    const transferEvidence = Object.fromEntries(Object.entries(archive.transferEvidence || {}).map(([key, a]) => [key, ref(a)]));
    return { ...archive, format: "indexed-attempts-v1", attempts: [...attempts.values()], recentAttemptIds, guidedEvidence, repairEvidence, transferEvidence };
  }
  function draft(p) {
    const lessonStep = step(p), taskKey = `${p.phase}-${p.variant}-${lessonStep}`;
    p.parameterDrafts ||= {};
    if (!p.parameterDrafts[taskKey]) {
      const previous = lessonStep === "mismatch" ? "recall" : lessonStep === "connect" ? "mismatch" : null;
      const inherited = previous ? copy(p.parameterDrafts[`${p.phase}-${p.variant}-${previous}`]?.commands || []) : [];
      p.parameterDrafts[taskKey] = {
        binding: lessonStep === "route" && p.phase !== "repair" ? p.savedParameterDefinition?.binding || null : "constant",
        constant: lessonStep === "route" ? p.phase === "repair" ? 3 : p.savedParameterDefinition?.constant ?? 3 : 2,
        commands: p.phase === "repair" ? authorCommands(scenario(p.phase, p.variant).inputs) : inherited,
        selected: null, undo: null
      };
    }
    const d = p.parameterDrafts[taskKey];
    d.binding = ["distance", "constant"].includes(d.binding) ? d.binding : null;
    d.constant = validNumber(d.constant) ? d.constant : 3;
    d.commands = Array.isArray(d.commands) ? d.commands.slice(0, limit) : [];
    d.nextId = Math.max(d.nextId || 1, ...d.commands.map(c => Number(c.id) + 1));
    if (!d.commands.some(c => c.id === d.selected)) d.selected = null;
    return d;
  }
  function mission(base, p) {
    if (p.contentRevision !== revision) {
      if (p.contentRevision) p.contentArchives = { ...p.contentArchives, [p.contentRevision]: {
        attempts: copy(p.attempts), guidedEvidence: p.guidedEvidence, repairEvidence: p.repairEvidence,
        transferEvidence: p.transferEvidence, explanationEvidence: p.explanationEvidence, parameterDrafts: p.parameterDrafts
      } };
      p.contentRevision = revision;
      p.phase = "guided"; p.variant = 0; p.parameterStep = "route";
      p.parameterIntroEvidence = {}; p.parameterDrafts = {}; p.savedParameterDefinition = null;
      p.mastered = false; p.guidedComplete = false;
      p.guidedEvidence = null; p.repairEvidence = null; p.debugObservation = null;
      p.transferEvidence = {}; p.explanationEvidence = null; p.parameterMeaning = null;
    }
    // Historical proofs share attempt IDs; keep each full trace once, without discarding history.
    if (p.contentArchives) p.contentArchives = Object.fromEntries(Object.entries(p.contentArchives).map(([key, value]) => [key, archiveEvidence(value)]));
    p.attempts = p.attempts.filter(a => a.contentRevision === revision);
    const lessonStep = step(p), s = scenario(p.phase, p.variant, lessonStep), small = lessonStep !== "route";
    const labels = small ? [{ at: s.targets[0], text: `目标 · ${s.inputs[0]} 格` }]
      : [{ at: s.targets[0], text: s.inputs[0] === 0 ? "A · 入口宝石" : "A · 宝石" },
        { at: s.targets[1], text: s.inputs[1] === 0 ? "B · 入口宝石" : "B · 宝石" },
        ...(s.inputs[0] ? [{ at: s.entries[0], text: "A 入口" }] : []),
        ...(s.inputs[1] ? [{ at: s.entries[1], text: "B 入口", waypoint: true }] : [])];
    const m = { ...base, contentRevision: revision, lessonMode: "v18-parameters", grid: s.grid,
      startOverride: s.start, startDir: s.startDir, targetPositions: s.targets, required: small ? 1 : 2, energy: 80,
      terrain: s.terrain, lessonInputs: s.inputs, parameterStep: lessonStep, entries: s.entries,
      worldLabels: labels, allowed: [], limit, solution: [], solutionFn: [], pythonStudio: null, routeChoices: [],
      semanticConstraints: { reusableFunction: true, parameter: "distance", lessonStep, entries: s.entries, layout: small ? "experiment" : "original-docks" },
      faultDescriptor: p.phase === "repair" ? { binding: "constant", count: 3 } : null,
      early: { v18: true, independent: p.phase === "challenge", repairing: p.phase === "repair",
        key: `${revision}-${p.phase}-${p.variant}-${lessonStep}`, requiresUpload: false,
        goal: small ? lessonStep === "recall" ? "点“前进两格工具”，再点“采集”。" : lessonStep === "mismatch" ? "宝石移远了。原程序还行吗？" : "给工具传入 4，让它前进四格。"
          : "收集 A、B；入口到宝石用前进工具。",
        rule: "函数沿当前朝向前进；主程序负责转弯和采集。",
        mainStarter: [], functionStarter: [], faulty: [], phaseLabels: ["连接参数槽", "距离参数迁移"],
        targets: s.targets.map((point, i) => ({ ...point, label: small ? "目标" : ["A", "B"][i] })),
        prediction: { options: [] }, hints: ["把两次调用的步数和函数内部的重复次数对照。", "输入已改变，函数是否仍在使用固定数字？", "把循环次数连接到 distance；从各自入口数步数；返回入口后左转过桥，到 B 入口再左转。"] } };
    draft(p);
    if (E().fingerprint(m) !== p.currentFingerprint) E().enter(p, m);
    p.mastered = E().parameterGate(p, revision).mastered;
    return m;
  }
  // Python is generated only from the student's ordered commands.
  function program(m, d, preview = false) {
    const fixed = ["recall", "mismatch"].includes(m.parameterStep), commands = d.commands || [];
    if (!preview && !commands.length) throw new Error("先点一条指令，加入程序。");
    if (commands.length > limit) throw new Error(`最多放 ${limit} 条指令。`);
    const hasCalls = commands.some(c => c.action === "call"), name = fixed ? "walk_two" : "walk";
    if (!preview && hasCalls && !fixed && !d.binding) throw new Error("先点“前进工具”页签，选择重复次数。");
    const count = fixed ? "2" : d.binding === "distance" ? "distance" : d.binding === "constant" ? String(d.constant) : "?";
    const lines = hasCalls ? [`def ${name}(${fixed ? "" : "distance"}):`, `    for _ in range(${count}):`, "        move()", ""] : [];
    const steps = commands.map((command, index) => {
      if (!actions[command.action]) throw new Error(`第 ${index + 1} 条指令无法识别。`);
      const call = command.action === "call";
      if (!preview && call && !fixed && !validNumber(command.argument)) throw new Error(`请填写第 ${index + 1} 条前进工具的步数。`);
      const code = call ? `${name}(${fixed ? "" : validNumber(command.argument) ? command.argument : "?"})`
        : ({ move: "move()", left: "turn_left()", right: "turn_right()", collect: "collect()" })[command.action];
      lines.push(code);
      return { id: `command-${command.id}`, commandId: command.id, index, kind: call ? "call" : command.action,
        label: call ? fixed ? "前进两格工具" : `前进工具（${validNumber(command.argument) ? command.argument : "?"} 步）` : actions[command.action],
        code, line: lines.length, endLine: lines.length, input: command.argument };
    });
    return { source: lines.join("\n"), steps, name };
  }
  const source = (m, d) => program(m, d).source;
  async function compile(m, d, Sk = root.Sk) {
    const code = source(m, d);
    const runtime = root.CodeQuestPythonRuntime.create({ Sk, initialEnergy: m.energy, apiCallLimit: 240,
      allowedFunctions: new Set(["move", "collect", "turn_left", "turn_right", "range"]),
      languageFeatures: ["functions", "for-loops"],
      world: { grid: m.grid, start: m.startOverride, startDir: m.startDir, required: m.required, targetPositions: m.targetPositions, terrain: m.terrain } });
    let execution;
    try { execution = { ...await runtime.compile(code), source: code, error: null }; }
    catch (error) { execution = { source: code, events: error.partialEvents || [], finalState: error.partialState || {},
      error: root.CodeQuestPythonRuntime.friendlyErrorMessage(error) }; }
    const description = program(m, d), calls = description.steps.filter(s => s.kind === "call"), callSteps = new Map();
    let callIndex = 0;
    execution.events = execution.events.map(event => {
      if (event.type === "function-call") callSteps.set(event.callId, calls[callIndex++]);
      const action = event.callId ? callSteps.get(event.callId) : description.steps.find(s => event.line >= s.line && event.line <= s.endLine);
      return { ...event, programStep: action?.id || null, stepLabel: action?.label || "函数定义" };
    });
    return execution;
  }

  function assess(m, d, execution, assisted = false) {
    const compactState = s => ({ x: s.x, y: s.y, direction: s.direction, directionName: s.directionName,
      energy: s.energy, collectedKeys: s.collectedKeys, uploaded: s.uploaded, ticks: s.ticks, gates: s.gates });
    const events = execution.events.map(event => ({ ...event, state: compactState(event.state) }));
    const calls = execution.events.filter(e => e.type === "function-call" && ["walk", "walk_two"].includes(e.functionCall.name)).map(e => {
      const events = execution.events.filter(item => item.callId === e.callId);
      const range = events.find(item => item.type === "range-input");
      return { callId: e.callId, programStep: e.programStep, argument: e.functionCall.arguments.distance,
        count: range?.range?.value, read: range?.range?.bindings?.distance,
        moves: events.filter(item => item.type === "move").length,
        returned: events.some(item => item.type === "function-end"), before: compactState(e.state),
        after: events.find(item => item.type === "function-end") ? compactState(events.find(item => item.type === "function-end").state) : null };
    });
    const worldSuccess = !execution.error && execution.finalState.collectedKeys?.length === m.required;
    const fixed = ["recall", "mismatch"].includes(m.parameterStep);
    const validCall = c => c.read === c.argument && c.count === c.argument && c.moves === c.argument && c.returned;
    const same = (a, b) => a && b && a.x === b.x && a.y === b.y;
    calls.forEach(c => {
      c.taskLeg = m.entries?.findIndex((entry, i) => same(c.before, entry) && c.argument === m.lessonInputs[i]) ?? -1;
      c.validLeg = c.taskLeg >= 0 && validCall(c) && same(c.after, m.targetPositions[c.taskLeg]);
    });
    const conceptSuccess = fixed ? calls.length === 1 && calls[0].count === 2 && calls[0].moves === 2 && calls[0].returned
      : m.parameterStep === "route" ? m.entries.every((_, i) => calls.some(c => c.taskLeg === i && c.validLeg))
        : calls.some(c => c.argument === m.lessonInputs[0] && validCall(c));
    const failure = execution.error || (!worldSuccess ? "还没收齐宝石。" : !conceptSuccess ? "宝石收齐了。请从 A、B 入口分别调用前进工具。" : "");
    return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString(),
      lessonNo: 19, lessonStep: m.parameterStep, practiceOnly: m.parameterStep !== "route", contentRevision: revision, fingerprint: E().fingerprint(m), challengeKey: m.early.key,
      phase: m.early.repairing ? "repair" : m.early.independent ? "challenge" : "guided", independent: m.early.independent,
      inputs: m.lessonInputs.slice(), assisted, worldSuccess: Boolean(worldSuccess), success: Boolean(worldSuccess && conceptSuccess),
      failure, calls, source: execution.source, events: copy(events), program: [], routeProgram: [], path: [], trace: [],
      programModel: programModel(d), programVersion: E().canonical(programModel(d)), ruleVersion: E().canonical({ binding: d.binding, constant: d.binding === "constant" ? d.constant : null }),
      isFaulty: d.binding === "constant" && d.constant === 3 && calls.some(c => c.taskLeg >= 0 && c.argument !== 3 && c.count === 3),
      targetOrderCorrect: true, predictionCorrect: true };
  }
  function record(p, a) {
    p.attempts = [...p.attempts, copy(a)].slice(-12);
    if (a.worldSuccess && a.lessonStep === "route") p.completed = true;
    if (a.phase === "guided" && a.lessonStep !== "route") {
      const learned = a.lessonStep === "recall" ? a.worldSuccess : a.lessonStep === "mismatch" ?
        !a.worldSuccess && a.calls[0]?.count === 2 && a.calls[0]?.moves === 2 && a.calls[0]?.returned : a.success;
      if (learned) p.parameterIntroEvidence = { ...p.parameterIntroEvidence, [a.lessonStep]: copy(a) };
    }
    if (a.phase === "repair" && a.isFaulty && !a.success) p.debugObservation = copy(a);
    if (a.success) {
      p.savedParameterDefinition = { binding: a.programModel.binding, constant: a.programModel.constant };
      if (a.phase === "guided" && a.lessonStep === "route") { p.guidedComplete = true; p.guidedEvidence = copy(a); }
      if (a.phase === "repair" && p.debugObservation?.fingerprint === a.fingerprint && !a.assisted)
        p.repairEvidence = { before: copy(p.debugObservation), after: copy(a) };
      if (a.independent) p.transferEvidence = E().mergeTransferProofs(p.transferEvidence, { [a.fingerprint]: copy(a) });
    }
    p.mastered = E().parameterGate(p, revision).mastered;
  }
  function explain(p, callIndex, beforeCount, afterCount, meaning = p.parameterMeaning) {
    const pair = p.repairEvidence;
    const before = pair?.before.calls[callIndex];
    const after = pair?.after.calls.find(c => c.taskLeg === before?.taskLeg && c.argument === before?.argument && c.validLeg);
    if (!before || !after) return false;
    const valid = before.count !== before.argument && after.read === after.argument
      && after.count === after.argument && beforeCount === before.count && afterCount === after.count && meaning === "forward";
    p.explanationEvidence = { beforeId: pair.before.id, afterId: pair.after.id, callIndex, beforeCount, afterCount, meaning, valid };
    p.mastered = E().parameterGate(p, revision).mastered;
    return valid;
  }
  root.CodeQuestParameterLesson = { revision, scenario, step, actions, limit, authorCommands, draft, mission, program, source, compile, assess, record, explain };
  root.CodeQuestStructuredLessons.register(19, {
    ...root.CodeQuestParameterLesson,
    reconcile: p => { p.mastered = E().parameterGate(p, revision).mastered; },
    render: (m, p, context) => root.CodeQuestParameterLessonUI.render(m, p, context),
    builder: (m, p, context) => root.CodeQuestParameterLessonUI.builder(m, p, context),
    reference: (m, p) => Object.assign(draft(p), { binding: "distance", commands: authorCommands(m.lessonInputs), selected: null }),
    feedback(m, p, a) {
      if (m.parameterStep === "recall") return a.worldSuccess ? "工具固定走两格。试试更远的宝石。" : a.failure;
      if (m.parameterStep === "mismatch") return "宝石在四格外，工具只走了两格。";
      if (m.parameterStep === "connect") return a.success ? "传入 4，重复 4 次，走了 4 格。" : "对照传入步数和实际次数，再改工具。";
      if (!a.success) return a.failure;
      if (p.mastered) return "本课完成！同一个工具用不同步数完成了新地图。";
      if (m.early.repairing) return "修好了。说说步数为什么变了。";
      if (m.early.independent) return "这张图完成。换图再试一次。";
      return "参数槽已接通。接着试试距离变化后的地图。";
    },
    edit(m, p, { action, field, value }) {
      const d = draft(p);
      if (action === "intro-start" || action === "intro-close") {
        p.phase = "guided"; p.parameterStep = action === "intro-start" ? "recall" : "route";
        if (p.parameterStep === "route" && !draft(p).binding && p.savedParameterDefinition)
          Object.assign(draft(p), p.savedParameterDefinition);
        return { reset: true, notice: "" };
      }
      if (action === "intro-next") {
        const current = step(p);
        if (!p.parameterIntroEvidence?.[current]) return { reset: false, notice: "先运行这个小实验，观察实际结果。" };
        p.parameterStep = learningSteps[Math.min(3, learningSteps.indexOf(current) + 1)];
        if (p.parameterStep === "route" && !draft(p).binding && p.savedParameterDefinition)
          Object.assign(draft(p), p.savedParameterDefinition);
        return { reset: true, notice: "" };
      }
      if (action === "intro-back") {
        p.parameterStep = learningSteps[Math.max(0, learningSteps.indexOf(step(p)) - 1)];
        return { reset: true, notice: "" };
      }
      if (action === "meaning") { p.parameterMeaning = value; return { reset: false, notice: "" }; }
      if (action === "select") { d.selected = d.selected === Number(value) ? null : Number(value); return { reset: false, notice: "" }; }
      if (action === "append-end") { d.selected = null; return { reset: false, notice: "" }; }
      if (action === "undo") {
        if (d.undo) { Object.assign(d, d.undo); d.undo = null; }
        else { d.commands.pop(); d.selected = null; }
        return { reset: true, notice: "" };
      }
      const remember = () => { d.undo = { ...programModel(d), selected: d.selected }; };
      if (action === "add" && actions[value]) {
        const index = d.commands.findIndex(c => c.id === d.selected);
        if (index < 0 && d.commands.length >= limit) return { reset: false, notice: `最多放 ${limit} 条指令。` };
        remember();
        const command = { id: index >= 0 ? d.commands[index].id : d.nextId++, action: value };
        if (value === "call") command.argument = index >= 0 && d.commands[index].action === "call" ? d.commands[index].argument : null;
        if (index >= 0) d.commands.splice(index, 1, command);
        else d.commands.push(command);
        d.selected = null;
      }
      if (["remove", "up", "down"].includes(action)) {
        const index = d.commands.findIndex(c => c.id === Number(value));
        const target = index + (action === "up" ? -1 : 1);
        if (index >= 0 && (action === "remove" || target >= 0 && target < d.commands.length)) {
          remember();
          if (action === "remove") { d.commands.splice(index, 1); d.selected = null; }
          else { [d.commands[index], d.commands[target]] = [d.commands[target], d.commands[index]]; d.selected = Number(value); }
        }
      }
      if (action === "clear") { remember(); d.commands = []; d.selected = null; }
      if (action === "binding") { remember(); d.binding = value; }
      if (action === "faulty") { remember(); Object.assign(d, { binding: "constant", constant: 3, commands: authorCommands(m.lessonInputs), selected: null }); }
      if (field) {
        const n = value === "" ? null : Number(value);
        if (field === "constant") { remember(); d.constant = n ?? 3; }
        else if (field.startsWith("argument-")) {
          const command = d.commands.find(c => c.id === Number(field.slice(9)) && c.action === "call");
          if (command) { remember(); command.argument = validNumber(n) ? n : null; }
        } else if (["explainBefore", "explainAfter"].includes(field)) p[field] = n;
      }
      if (action === "explain") {
        const index = p.repairEvidence?.before.calls.findIndex(c => c.taskLeg >= 0 && c.count !== c.argument) ?? -1;
        const valid = explain(p, index, p.explainBefore, p.explainAfter);
        return { reset: false, notice: valid ? p.mastered ? "能力门通过。" : "说明有效，再完成陌生地图和 0 次边界。"
          : p.parameterMeaning !== "forward" ? "工具只负责前进。转向是哪条指令做的？" : "再对照两份记录中的循环次数。" };
      }
      return { reset: !field?.startsWith("explain"), notice: "" };
    }
  });
})(typeof globalThis !== "undefined" ? globalThis : window);
