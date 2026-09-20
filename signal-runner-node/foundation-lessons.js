(function (root) {
  "use strict";
  const revisions = { 1: "1.8-01.1", 2: "1.8-02.1" };
  const actions = { move: "前进", left: "左转", right: "右转", collect: "采集" };
  const commandsFor = lessonNo => lessonNo === 1 ? ["move", "collect"] : ["move", "left", "right", "collect"];
  const limits = { 1: 8, 2: 10 };
  const copy = value => root.CodeQuestEvidence.clone(value);
  const E = () => root.CodeQuestEvidence;

  function openPlatform(width, height) {
    return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) =>
      x && y && x < width - 1 && y < height - 1 ? "g" : "_").join(""));
  }

  function sequenceScenario(phase, variant = 0) {
    const challenge = phase === "challenge";
    const mode = challenge ? variant % 2 : -1;
    const distance = !challenge ? 3 : mode === 0 ? 5 : 1;
    const start = !challenge ? { x: 2, y: 3 } : mode === 0 ? { x: 6, y: 3 } : { x: 3, y: 3 };
    const startDir = challenge && mode === 0 ? "W" : "E";
    const target = { x: start.x + (startDir === "E" ? distance : -distance), y: start.y };
    const grid = openPlatform(9, 7);
    grid[start.y] = `${grid[start.y].slice(0, start.x)}S${grid[start.y].slice(start.x + 1)}`;
    grid[target.y] = `${grid[target.y].slice(0, target.x)}B${grid[target.y].slice(target.x + 1)}`;
    return { grid, start, startDir, target, distance, requiredTurn: null,
      labels: [{ at: start, text: "登陆点" }, { at: target, text: `宝石 · ${distance} 格` }] };
  }

  function directionScenario(phase, variant = 0) {
    const challenge = phase === "challenge";
    const alternate = challenge && variant % 2 === 1;
    const grid = ["_________", "____g____", "____g____", "_ggggggg_", "____g____", "____g____", "_________"];
    let start, startDir, target, requiredTurn;
    if (!challenge) { start = { x: 2, y: 3 }; startDir = "E"; target = { x: 4, y: 5 }; requiredTurn = "right"; }
    else if (!alternate) { start = { x: 4, y: 5 }; startDir = "N"; target = { x: 2, y: 3 }; requiredTurn = "left"; }
    else { start = { x: 6, y: 3 }; startDir = "W"; target = { x: 4, y: 1 }; requiredTurn = "right"; }
    grid[start.y] = `${grid[start.y].slice(0, start.x)}S${grid[start.y].slice(start.x + 1)}`;
    grid[target.y] = `${grid[target.y].slice(0, target.x)}B${grid[target.y].slice(target.x + 1)}`;
    return { grid, start, startDir, target, distance: 4, requiredTurn,
      junction: { x: 4, y: 3 }, labels: [{ at: start, text: `起点 · 朝${{N:"北",E:"东",S:"南",W:"西"}[startDir]}` },
        { at: { x: 4, y: 3 }, text: "四向岔台" }, { at: target, text: "宝石" }] };
  }

  function scenario(lessonNo, phase, variant = 0) {
    return lessonNo === 1 ? sequenceScenario(phase, variant) : directionScenario(phase, variant);
  }

  function authorCommands(lessonNo, phase, variant = 0) {
    const s = scenario(lessonNo, phase, variant);
    const items = lessonNo === 1
      ? [...Array.from({ length: s.distance }, () => ({ action: "move" })), { action: "collect" }]
      : [{ action: "move" }, { action: "move" }, { action: s.requiredTurn }, { action: "move" }, { action: "move" }, { action: "collect" }];
    return items.map((item, index) => ({ id: index + 1, ...item }));
  }

  function draft(p, lessonNo) {
    p.foundationDrafts ||= {};
    const key = `${lessonNo}-${p.phase}-${p.variant}`;
    if (!p.foundationDrafts[key]) p.foundationDrafts[key] = { commands: [], selected: null, undo: null, nextId: 1 };
    const d = p.foundationDrafts[key], allowed = commandsFor(lessonNo);
    d.commands = Array.isArray(d.commands) ? d.commands.filter(c => allowed.includes(c.action)).slice(0, limits[lessonNo]) : [];
    d.nextId = Math.max(Number(d.nextId) || 1, 1, ...d.commands.map(c => Number(c.id) + 1));
    if (!d.commands.some(c => c.id === d.selected)) d.selected = null;
    return d;
  }

  function mission(base, p, lessonNo) {
    const revision = revisions[lessonNo];
    if (p.contentRevision !== revision) {
      if (p.contentRevision) p.contentArchives = { ...p.contentArchives, [p.contentRevision]: {
        attempts: copy(p.attempts), guidedEvidence: p.guidedEvidence, transferEvidence: p.transferEvidence,
        foundationDrafts: p.foundationDrafts
      } };
      Object.assign(p, { contentRevision: revision, phase: "guided", variant: 0, foundationDrafts: {}, mastered: false,
        guidedComplete: false, guidedEvidence: null, repairEvidence: null, transferEvidence: {}, explanationEvidence: null, attempts: [] });
    }
    p.attempts = p.attempts.filter(a => a.contentRevision === revision);
    const s = scenario(lessonNo, p.phase, p.variant), independent = p.phase === "challenge";
    const goal = lessonNo === 1
      ? independent ? `宝石改到 ${s.distance} 格外。重新排列前进和采集。` : "按顺序走 3 格到宝石，再执行采集。"
      : independent ? "起始朝向变了。按 Nova 的朝向判断左右，穿过岔台采集宝石。" : "先到四向岔台，再按 Nova 的朝向右转去采集宝石。";
    const m = { ...base, contentRevision: revision, lessonMode: lessonNo === 1 ? "v18-sequence" : "v18-relative-direction",
      grid: s.grid, startOverride: s.start, startDir: s.startDir, targetPositions: [s.target], required: 1, energy: 24,
      terrain: { version: "1.8", heights: {}, stairs: [], portals: [], switches: [], gates: [] },
      worldLabels: s.labels, allowed: [], limit: limits[lessonNo], solution: [], solutionFn: [], functionEnabled: false,
      semanticConstraints: lessonNo === 1 ? { capability: "ordered-move-then-collect", distance: s.distance }
        : { capability: "relative-turn", initialDirection: s.startDir, requiredTurn: s.requiredTurn, cameraIndependent: true },
      faultDescriptor: null, foundation: { ...s },
      early: { v18: true, independent, repairing: false, key: `${revision}-${p.phase}-${p.variant}`,
        requiresUpload: false, goal, rule: lessonNo === 1 ? "程序从上到下执行；到达宝石不等于已经采集。" : "左、右以 Nova 当前朝向为准；转向只改朝向，不改位置。",
        mainStarter: [], functionStarter: [], faulty: [], phaseLabels: lessonNo === 1 ? ["排好执行顺序", "距离变化迁移"] : ["读懂角色左右", "朝向与镜头迁移"],
        targets: [{ ...s.target, label: "宝石" }], prediction: { options: [] }, hints: lessonNo === 1
          ? ["先数起点和宝石之间隔了几格。", "每次前进只走一格；站到宝石格后还要采集。", `局部提示：先放 ${s.distance} 张“前进”，最后再放“采集”。`]
          : ["先看角色朝向箭头，再想它的左边和右边。", "转向后位置不变，下一次前进才会离开岔台。", `局部提示：先前进 2 格到岔台，再${s.requiredTurn === "left" ? "左" : "右"}转。`] } };
    draft(p, lessonNo);
    if (E().fingerprint(m) !== p.currentFingerprint) E().enter(p, m);
    p.mastered = E().stateGate(p, revision).mastered;
    return m;
  }

  function program(m, d, lessonNo, preview = false) {
    if (!preview && !d.commands.length) throw new Error("先点一条指令，加入程序。");
    const lines = [], steps = [];
    d.commands.forEach((command, index) => {
      const code = ({ move: "move()", left: "turn_left()", right: "turn_right()", collect: "collect()" })[command.action];
      lines.push(code); steps.push({ id: `command-${command.id}`, commandId: command.id, index, kind: command.action,
        label: actions[command.action], code, line: index + 1, endLine: index + 1 });
    });
    return { source: lines.join("\n"), steps };
  }

  async function compile(m, d, lessonNo, Sk = root.Sk) {
    const description = program(m, d, lessonNo), code = description.source;
    const runtime = root.CodeQuestPythonRuntime.create({ Sk, initialEnergy: m.energy, apiCallLimit: 80,
      allowedFunctions: new Set(["move", "turn_left", "turn_right", "collect"]),
      world: { grid: m.grid, start: m.startOverride, startDir: m.startDir, required: m.required,
        targetPositions: m.targetPositions, terrain: m.terrain } });
    let execution;
    try { execution = { ...await runtime.compile(code), source: code, error: null }; }
    catch (error) { execution = { source: code, events: error.partialEvents || [], finalState: error.partialState || {},
      error: root.CodeQuestPythonRuntime.friendlyErrorMessage(error) }; }
    execution.events = execution.events.map(event => {
      const step = description.steps.find(s => event.line >= s.line && event.line <= s.endLine);
      return { ...event, programStep: step?.id || null, stepLabel: step?.label || "" };
    });
    return execution;
  }

  function assess(m, d, execution, assisted, lessonNo) {
    const compact = state => ({ x: state.x, y: state.y, direction: state.direction, directionName: state.directionName,
      energy: state.energy, collectedKeys: state.collectedKeys, ticks: state.ticks, gates: state.gates });
    const events = execution.events.map(event => ({ ...event, state: compact(event.state) }));
    const final = execution.finalState, target = m.targetPositions[0];
    const atTarget = final.x === target.x && final.y === target.y;
    const collected = final.collectedKeys?.length === 1;
    const worldSuccess = !execution.error && collected && atTarget;
    let conceptSuccess = false, evidence = {};
    if (lessonNo === 1) {
      const kinds = d.commands.map(c => c.action), collectIndex = kinds.indexOf("collect");
      const movesBefore = kinds.slice(0, collectIndex).filter(x => x === "move").length;
      conceptSuccess = collectIndex === kinds.length - 1 && movesBefore === m.foundation.distance
        && kinds.slice(0, collectIndex).every(x => x === "move");
      evidence = { distance: m.foundation.distance, movesBeforeCollect: movesBefore, collectIndex };
    } else {
      const firstTurnIndex = d.commands.findIndex(c => c.action === "left" || c.action === "right");
      const firstTurn = d.commands[firstTurnIndex]?.action;
      const turnEventIndex = execution.events.findIndex(e => e.type === "turn");
      const before = turnEventIndex > 0 ? execution.events[turnEventIndex - 1].state : { x: m.startOverride.x, y: m.startOverride.y };
      const after = execution.events[turnEventIndex]?.state;
      const turnStayed = Boolean(after && before.x === after.x && before.y === after.y);
      conceptSuccess = firstTurn === m.foundation.requiredTurn && turnStayed && execution.events.filter(e => e.type === "turn").length === 1;
      evidence = { initialDirection: m.startDir, requiredTurn: m.foundation.requiredTurn, firstTurn, turnStayed };
    }
    const failure = execution.error || (!collected ? "程序结束时还没有采集宝石。" : !atTarget ? "宝石采到了，但后面的多余动作让 Nova 离开了目标格。"
      : !conceptSuccess ? lessonNo === 1 ? "世界结果完成了，但采集没有紧跟在正确数量的前进之后。" : "世界结果完成了，但还没有留下相对转向且原地转身的证据。" : "");
    const model = { commands: copy(d.commands.map(c => ({ action: c.action }))) };
    return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString(), lessonNo,
      contentRevision: revisions[lessonNo], fingerprint: E().fingerprint(m), challengeKey: m.early.key,
      phase: m.early.independent ? "challenge" : "guided", independent: m.early.independent, assisted: Boolean(assisted),
      worldSuccess: Boolean(worldSuccess), success: Boolean(worldSuccess && conceptSuccess), failure, ...evidence,
      source: execution.source, events: copy(events), program: [], routeProgram: [], path: [], trace: [], programModel: model,
      programVersion: E().canonical(model), ruleVersion: E().canonical({ capability: lessonNo === 1 ? "sequence" : "relative-direction" }),
      practiceOnly: false, targetOrderCorrect: true, predictionCorrect: true };
  }

  function record(p, attempt, lessonNo) {
    p.attempts = [...p.attempts, copy(attempt)].slice(-12);
    if (attempt.worldSuccess) p.completed = true;
    if (attempt.success) {
      if (attempt.phase === "guided") { p.guidedComplete = true; p.guidedEvidence = copy(attempt); }
      if (attempt.independent) p.transferEvidence = E().mergeTransferProofs(p.transferEvidence, { [attempt.fingerprint]: copy(attempt) });
    }
    p.mastered = E().stateGate(p, revisions[lessonNo]).mastered;
  }

  function edit(p, lessonNo, { action, value }) {
    const d = draft(p, lessonNo), available = commandsFor(lessonNo);
    if (action === "select") { d.selected = d.selected === Number(value) ? null : Number(value); return { reset: false, notice: "" }; }
    if (action === "append-end") { d.selected = null; return { reset: false, notice: "" }; }
    if (action === "undo") {
      if (d.undo) { const undo = d.undo; d.undo = null; d.commands = undo.commands; d.selected = undo.selected; d.nextId = undo.nextId; }
      else { d.commands.pop(); d.selected = null; }
      return { reset: true, notice: "" };
    }
    const remember = () => { d.undo = { commands: copy(d.commands), selected: d.selected, nextId: d.nextId }; };
    if (action === "add" && available.includes(value)) {
      const index = d.commands.findIndex(c => c.id === d.selected);
      if (index < 0 && d.commands.length >= limits[lessonNo]) return { reset: false, notice: `最多放 ${limits[lessonNo]} 条指令。` };
      remember(); const command = { id: index >= 0 ? d.commands[index].id : d.nextId++, action: value };
      if (index >= 0) d.commands.splice(index, 1, command); else d.commands.push(command);
      d.selected = null;
    }
    if (action === "remove") { const index = d.commands.findIndex(c => c.id === Number(value)); if (index >= 0) { remember(); d.commands.splice(index, 1); d.selected = null; } }
    if (action === "clear") { remember(); d.commands = []; d.selected = null; }
    return { reset: true, notice: "" };
  }

  function adapter(lessonNo) {
    const revision = revisions[lessonNo];
    return { revision,
      mission: (base, p) => mission(base, p, lessonNo), draft: p => draft(p, lessonNo),
      source: (m, d) => program(m, d, lessonNo).source, compile: (m, d, Sk) => compile(m, d, lessonNo, Sk),
      assess: (m, d, execution, assisted) => assess(m, d, execution, assisted, lessonNo),
      record: (p, a) => record(p, a, lessonNo), reconcile: p => { p.mastered = E().stateGate(p, revision).mastered; },
      render: (m, p, context) => root.CodeQuestFoundationLessonUI.render(m, p, context),
      builder: (m, p, context) => root.CodeQuestFoundationLessonUI.builder(m, p, context),
      reference: (m, p) => Object.assign(draft(p, lessonNo), { commands: authorCommands(lessonNo, p.phase, p.variant), selected: null }),
      feedback(m, p, a) { if (!a.success) return a.failure; if (p.mastered) return "本课完成！你已经在变化后的任务中再次证明了这个能力。";
        return m.early.independent ? "迁移完成。" : `引导任务完成。接着做“${m.early.phaseLabels[1]}”。`; },
      edit: (m, p, input) => edit(p, lessonNo, input) };
  }

  root.CodeQuestFoundationLessons = { revisions, actions, limits, scenario, authorCommands, draft, mission, program, compile, assess, record };
  root.CodeQuestStructuredLessons.register(1, adapter(1));
  root.CodeQuestStructuredLessons.register(2, adapter(2));
})(typeof globalThis !== "undefined" ? globalThis : window);
