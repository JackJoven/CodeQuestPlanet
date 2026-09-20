(function (root) {
  "use strict";
  const revisions = { 3: "1.8-03.1", 4: "1.8-04.1", 5: "1.8-05.1" };
  const actions = { move: "前进", left: "左转", right: "右转", collect: "采集", teleport: "传送" };
  const limits = { 3: 20, 4: 12, 5: 8 };
  const copy = value => root.CodeQuestEvidence.clone(value);
  const canonical = value => root.CodeQuestEvidence.canonical(value);
  const actionCode = { move: "move()", left: "turn_left()", right: "turn_right()", collect: "collect()", teleport: "teleport()" };
  const allowedFor = lessonNo => lessonNo === 5 ? ["move", "left", "right", "teleport", "collect"] : ["move", "left", "right", "collect"];

  function routeWorld(equalCost = false) {
    const width = 10, height = 7, cells = Array.from({ length: height }, () => Array(width).fill("_"));
    const stairPath = [[1,5],[2,5],[3,5],[3,4],[4,4],[5,4],[5,3],[6,3],[7,3],[7,2],[7,1]];
    const flatPath = equalCost
      ? [[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[8,4],[8,3],[7,3],[7,2],[7,1]]
      : [[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[8,4],[8,3],[8,2],[8,1],[7,1]];
    for (const [x,y] of [...stairPath, ...flatPath]) cells[y][x] = "g";
    cells[5][1] = "S"; cells[1][7] = "B";
    const heights = {};
    for (const [x,y] of stairPath.slice(6)) heights[`${x},${y}`] = 1;
    for (const [x,y] of equalCost ? flatPath.slice(-3) : flatPath.slice(-2)) heights[`${x},${y}`] = 1;
    return { grid: cells.map(row => row.join("")), start: { x: 1, y: 5 }, startDir: "E", target: { x: 7, y: 1 },
      terrain: { version: "1.8", heights, stairs: [
        { from: { x: 5, y: 4 }, to: { x: 5, y: 3 } }, equalCost
          ? { from: { x: 8, y: 3 }, to: { x: 7, y: 3 } }
          : { from: { x: 8, y: 2 }, to: { x: 8, y: 1 } }
      ], portals: [], switches: [], gates: [] },
      routes: {
        stair: { id: "stair", label: "石阶捷径", commands: ["move","move","left","move","right","move","move","left","move","right","move","move","left","move","move","collect"], moves: 10, turns: 5, total: 16 },
        flat: equalCost
          ? { id: "flat", label: "平路折返", commands: ["move","move","move","move","move","move","move","left","move","move","left","move","right","move","move","collect"], moves: 12, turns: 3, total: 16 }
          : { id: "flat", label: "平路绕行", commands: ["move","move","move","move","move","move","move","left","move","move","move","move","left","move","collect"], moves: 12, turns: 2, total: 15 }
      }
    };
  }

  function debugWorld(phase) {
    const grid = ["________", "_gggg___", "_Sggg___", "___gg___", "___gB___", "________"];
    const correct = ["move","move","right","move","move","left","move","collect"];
    const faultStep = phase === "challenge" ? 5 : 3;
    const faulty = correct.slice(); faulty[faultStep - 1] = phase === "challenge" ? "right" : "left";
    return { grid, start: { x: 1, y: 2 }, startDir: "E", target: { x: 4, y: 4 }, correct, faulty, faultStep,
      faultKind: phase === "challenge" ? "漏走一步，提前右转" : "在岔口向反方向早转",
      terrain: { version: "1.8", heights: { "3,3": 1, "3,4": 1, "4,4": 1 },
        stairs: [{ from: { x: 3, y: 2 }, to: { x: 3, y: 3 } }], portals: [], switches: [], gates: [] } };
  }

  function coordinateWorld(phase, choice) {
    const challenge = phase === "challenge";
    const grid = ["________", "____ggg_", "____ggg_", "____ggg_", "_ggg____", "_ggg____", "_ggg____", "________"];
    const start = challenge ? { x: 3, y: 5 } : { x: 4, y: 2 };
    const startDir = challenge ? "W" : "E";
    const entrance = challenge ? { x: 1, y: 5 } : { x: 6, y: 2 };
    const correctExit = challenge ? { x: 5, y: 2 } : { x: 2, y: 5 };
    const wrongExit = challenge ? { x: 2, y: 5 } : { x: 5, y: 2 };
    const target = challenge ? { x: 4, y: 2 } : { x: 3, y: 5 };
    const selected = choice === `${correctExit.x},${correctExit.y}` ? correctExit : choice === `${wrongExit.x},${wrongExit.y}` ? wrongExit : null;
    const rows = grid.map(row => [...row]); rows[start.y][start.x] = "S"; rows[target.y][target.x] = "B";
    return { grid: rows.map(row => row.join("")), start, startDir, entrance, target, correctExit, wrongExit, selected,
      terrain: { version: "1.8", heights: {}, stairs: [], portals: selected ? [{ id: "P", from: entrance, to: selected }] : [], switches: [], gates: [] } };
  }

  function draft(p, lessonNo) {
    p.navigationDrafts ||= {};
    const key = `${lessonNo}-${p.phase}-${p.variant}`;
    if (!p.navigationDrafts[key]) {
      const debug = lessonNo === 4 ? debugWorld(p.phase) : null;
      p.navigationDrafts[key] = { commands: debug ? debug.faulty.map((action, index) => ({ id: index + 1, action })) : [],
        selected: null, undo: null, nextId: debug ? debug.faulty.length + 1 : 1, plan: null, diagnosis: null, portalChoice: null };
    }
    const d = p.navigationDrafts[key], allowed = allowedFor(lessonNo);
    d.commands = Array.isArray(d.commands) ? d.commands.filter(c => allowed.includes(c.action)).slice(0, limits[lessonNo]) : [];
    d.nextId = Math.max(Number(d.nextId) || 1, 1, ...d.commands.map(c => Number(c.id) + 1));
    if (!d.commands.some(c => c.id === d.selected)) d.selected = null;
    if (!['stair','flat'].includes(d.plan)) d.plan = null;
    if (!Number.isInteger(d.diagnosis)) d.diagnosis = null;
    return d;
  }

  function archive(p, revision) {
    if (p.contentRevision === revision) return;
    if (p.contentRevision) p.contentArchives = { ...p.contentArchives, [p.contentRevision]: {
      attempts: copy(p.attempts), guidedEvidence: p.guidedEvidence, transferEvidence: p.transferEvidence, navigationDrafts: p.navigationDrafts } };
    Object.assign(p, { contentRevision: revision, phase: "guided", variant: 0, navigationDrafts: {}, mastered: false,
      guidedComplete: false, guidedEvidence: null, repairEvidence: null, transferEvidence: {}, explanationEvidence: null, attempts: [], debugRuns: {} });
  }

  function mission(base, p, lessonNo) {
    const revision = revisions[lessonNo]; archive(p, revision); p.attempts = p.attempts.filter(a => a.contentRevision === revision);
    const d = draft(p, lessonNo), independent = p.phase === "challenge";
    let world, goal, rule, phases, hints, semanticConstraints, labels;
    if (lessonNo === 3) {
      const equalCost = independent && p.variant % 2 === 1;
      world = routeWorld(equalCost);
      const objective = !independent ? "moves" : equalCost ? "tie" : "total";
      goal = objective === "moves" ? "选择并编排“前进次数最少”的路线到达宝石。" : objective === "tie"
        ? "两条路线现在都是 16 条指令。任选一条，但计划和实跑必须一致。" : "目标改为“全部指令最少”。重新比较两条路线再编程。";
      rule = "成本按真实卡片计数：前进、转向、采集各算一条；台阶一格仍只算一次前进。";
      phases = ["比较路线成本", "优化目标迁移"];
      hints = ["先分别数两条路线的前进次数。", "目标是全部指令时，还要把转向和采集算进去。", `本图石阶路线 10 次前进、5 次转向；平路路线 12 次前进、2 次转向。`];
      semanticConstraints = { capability: "route-cost", objective };
      labels = [{ at: world.start, text: "起点" }, { at: { x: 5, y: 3 }, text: "石阶捷径" }, { at: { x: 8, y: 4 }, text: "平路绕行" }, { at: world.target, text: "宝石" }];
    } else if (lessonNo === 4) {
      world = debugWorld(p.phase);
      goal = independent ? "故障换了位置：先运行，再找出第一次偏离并只改这一条。" : "先运行这份坏程序，从头对照，指出第一次偏离并修好。";
      rule = "最终报错只是现象；第一次与正确状态不同的步骤才是根因。";
      phases = ["定位并修复首次偏离", "故障位置迁移"];
      hints = ["先运行原始坏程序，不要一开始就改。", "从第 1 步起比较位置和朝向，停在第一次不同处。", `本案例应重点检查第 ${world.faultStep} 步。`];
      semanticConstraints = { capability: "first-divergence", faultStep: world.faultStep, faultKind: world.faultKind };
      labels = [{ at: world.start, text: "维修道起点" }, { at: { x: 3, y: 2 }, text: "岔口" }, { at: world.target, text: "维修宝石" }];
    } else {
      world = coordinateWorld(p.phase, d.portalChoice);
      goal = `把入口配对到出口 (${world.correctExit.x}, ${world.correctExit.y})，再显式传送并采集宝石。`;
      rule = "坐标写作 (x,y)：x 向右增加，y 向下增加；传送保留角色朝向。";
      phases = ["配对坐标出口", "出口换位迁移"];
      hints = ["先横向读 x，再纵向读 y。", "站到入口后还要放一张“传送”卡。", `正确出口是 (${world.correctExit.x}, ${world.correctExit.y})；传送后朝向不会改变。`];
      semanticConstraints = { capability: "coordinate-portal", requestedExit: world.correctExit, selectedExit: world.selected };
      labels = [{ at: world.start, text: "起点" }, { at: world.entrance, text: "入口" }, { at: world.correctExit, text: `候选 (${world.correctExit.x},${world.correctExit.y})` },
        { at: world.wrongExit, text: `候选 (${world.wrongExit.x},${world.wrongExit.y})` }, { at: world.target, text: "宝石" }];
    }
    const m = { ...base, contentRevision: revision, lessonMode: `v18-navigation-${lessonNo}`, grid: world.grid,
      startOverride: world.start, startDir: world.startDir, targetPositions: [world.target], required: 1, energy: 48,
      terrain: world.terrain, worldLabels: labels, allowed: [], limit: limits[lessonNo], solution: [], solutionFn: [], functionEnabled: false,
      semanticConstraints, faultDescriptor: lessonNo === 4 ? { step: world.faultStep, kind: world.faultKind } : null,
      navigation: world, early: { v18: true, independent, repairing: lessonNo === 4, key: `${revision}-${p.phase}-${p.variant}`,
        requiresUpload: false, goal, rule, mainStarter: [], functionStarter: [], faulty: lessonNo === 4 ? world.faulty : [], phaseLabels: phases,
        targets: [{ ...world.target, label: "宝石" }], prediction: { options: [] }, hints } };
    if (root.CodeQuestEvidence.fingerprint(m) !== p.currentFingerprint) root.CodeQuestEvidence.enter(p, m);
    p.mastered = root.CodeQuestEvidence.stateGate(p, revision).mastered;
    return m;
  }

  function program(m, d, lessonNo, preview = false) {
    if (!preview && !d.commands.length) throw new Error("先点一条指令，加入程序。");
    if (!preview && lessonNo === 3 && !d.plan) throw new Error("先选择你计划走的路线。");
    if (!preview && lessonNo === 4 && m.navigation && m.early.repairing && m.navigation.faulty.join(',') !== d.commands.map(c => c.action).join(',')
      && !d.diagnosis) throw new Error("先指出第一次偏离发生在哪一步。");
    if (!preview && lessonNo === 5 && !d.portalChoice) throw new Error("先选择要配对的出口坐标。");
    const lines = [], steps = [];
    d.commands.forEach((command, index) => { lines.push(actionCode[command.action]); steps.push({ id: `command-${command.id}`, commandId: command.id,
      index, kind: command.action, label: actions[command.action], code: actionCode[command.action], line: index + 1, endLine: index + 1 }); });
    return { source: lines.join("\n"), steps };
  }

  async function compile(m, d, lessonNo, Sk = root.Sk) {
    const description = program(m, d, lessonNo), code = description.source;
    const runtime = root.CodeQuestPythonRuntime.create({ Sk, initialEnergy: m.energy, apiCallLimit: 120,
      allowedFunctions: new Set(["move","turn_left","turn_right","collect","teleport"]),
      world: { grid: m.grid, start: m.startOverride, startDir: m.startDir, required: m.required, targetPositions: m.targetPositions, terrain: m.terrain } });
    let execution;
    try { execution = { ...await runtime.compile(code), source: code, error: null }; }
    catch (error) { execution = { source: code, events: error.partialEvents || [], finalState: error.partialState || {}, error: root.CodeQuestPythonRuntime.friendlyErrorMessage(error) }; }
    execution.events = execution.events.map(event => { const step = description.steps.find(s => event.line >= s.line && event.line <= s.endLine);
      return { ...event, programStep: step?.id || null, stepLabel: step?.label || "" }; });
    return execution;
  }

  function assess(m, d, execution, assisted, lessonNo) {
    const final = execution.finalState, target = m.targetPositions[0], atTarget = final.x === target.x && final.y === target.y;
    const worldSuccess = !execution.error && final.collectedKeys?.length === 1 && atTarget;
    const sequence = d.commands.map(c => c.action), events = copy(execution.events);
    let conceptSuccess = false, evidence = {}, failure = execution.error || "";
    if (lessonNo === 3) {
      const routes = m.navigation.routes, actual = Object.values(routes).find(route => route.commands.join(',') === sequence.join(','));
      const objective = m.semanticConstraints.objective, expected = objective === "moves" ? ["stair"] : objective === "tie" ? ["stair","flat"] : ["flat"];
      conceptSuccess = Boolean(actual && actual.id === d.plan && expected.includes(actual.id));
      evidence = { plan: d.plan, actualRoute: actual?.id || "custom", objective,
        costs: { moves: execution.events.filter(e => e.type === 'move').length, turns: execution.events.filter(e => e.type === 'turn').length, total: sequence.length } };
      if (!failure && !conceptSuccess) failure = actual?.id !== d.plan ? "实际路线与计划不一致。" : `当前目标下，${routes[expected[0]].label}成本更低。`;
    } else if (lessonNo === 4) {
      const correct = m.navigation.correct.join(','), faulty = m.navigation.faulty.join(','), observed = Boolean(m.navigationProfileObserved);
      const fixed = sequence.join(',') === correct, isFaulty = sequence.join(',') === faulty;
      conceptSuccess = worldSuccess && fixed && d.diagnosis === m.navigation.faultStep && observed;
      evidence = { faultStep: m.navigation.faultStep, diagnosis: d.diagnosis, isFaulty, observed, fixed };
      if (!failure && !conceptSuccess) failure = !observed ? "先运行原始坏程序，留下失败轨迹。" : d.diagnosis !== m.navigation.faultStep
        ? "你选的不是状态第一次偏离的步骤。" : !fixed ? "已经定位到根因，还要只修正这条指令。" : "";
    } else {
      const tele = execution.events.find(e => e.type === "teleport"), expected = m.navigation.correctExit;
      const directionBefore = (() => { const index = execution.events.findIndex(e => e.type === 'teleport'); return index > 0 ? execution.events[index - 1].state.directionName : m.startDir; })();
      const directionAfter = tele?.state.directionName;
      const selectedCorrectly = d.portalChoice === `${expected.x},${expected.y}`;
      conceptSuccess = Boolean(selectedCorrectly && tele && tele.state.x === expected.x && tele.state.y === expected.y && directionBefore === directionAfter);
      evidence = { requestedExit: copy(expected), selectedExit: d.portalChoice, landedAt: tele ? { x: tele.state.x, y: tele.state.y } : null,
        directionBefore, directionAfter, headingPreserved: Boolean(tele && directionBefore === directionAfter) };
      if (!failure && !conceptSuccess) failure = !selectedCorrectly ? "选中的出口把 x、y 读反了。" : !tele ? "还没有执行显式传送。" : "传送落点或朝向证据不正确。";
    }
    const model = { commands: sequence, plan: d.plan, diagnosis: d.diagnosis, portalChoice: d.portalChoice };
    return { id: `${Date.now()}-${Math.random().toString(36).slice(2,9)}`, at: new Date().toISOString(), lessonNo,
      contentRevision: revisions[lessonNo], fingerprint: root.CodeQuestEvidence.fingerprint(m), challengeKey: m.early.key,
      phase: m.early.independent ? "challenge" : "guided", independent: m.early.independent, assisted: Boolean(assisted),
      worldSuccess: Boolean(worldSuccess), success: Boolean(worldSuccess && conceptSuccess), failure, ...evidence,
      source: execution.source, events, program: [], routeProgram: [], path: [], trace: [], programModel: model, programVersion: canonical(model),
      ruleVersion: canonical({ capability: m.semanticConstraints.capability }), practiceOnly: false, targetOrderCorrect: true, predictionCorrect: true };
  }

  function record(p, attempt, lessonNo) {
    p.attempts = [...p.attempts, copy(attempt)].slice(-12);
    if (lessonNo === 4 && attempt.isFaulty && !attempt.worldSuccess) p.debugRuns = { ...p.debugRuns, [attempt.challengeKey]: true };
    if (attempt.worldSuccess) p.completed = true;
    if (attempt.success) {
      if (attempt.phase === "guided") { p.guidedComplete = true; p.guidedEvidence = copy(attempt); }
      if (attempt.independent) p.transferEvidence = root.CodeQuestEvidence.mergeTransferProofs(p.transferEvidence, { [attempt.fingerprint]: copy(attempt) });
    }
    p.mastered = root.CodeQuestEvidence.stateGate(p, revisions[lessonNo]).mastered;
  }

  function edit(m, p, lessonNo, { action, value }) {
    const d = draft(p, lessonNo), allowed = allowedFor(lessonNo);
    if (action === "select") { d.selected = d.selected === Number(value) ? null : Number(value); return { reset: false, notice: "" }; }
    if (action === "plan") { d.plan = value; return { reset: true, notice: "" }; }
    if (action === "diagnosis") { d.diagnosis = Number(value); return { reset: false, notice: "" }; }
    if (action === "portal") { d.portalChoice = value; return { reset: true, notice: "" }; }
    if (action === "undo") { if (d.undo) { Object.assign(d, d.undo); d.undo = null; } else d.commands.pop(); return { reset: true, notice: "" }; }
    const remember = () => { d.undo = { commands: copy(d.commands), selected: d.selected, nextId: d.nextId, plan: d.plan, diagnosis: d.diagnosis, portalChoice: d.portalChoice }; };
    if (action === "add" && allowed.includes(value)) { const index = d.commands.findIndex(c => c.id === d.selected);
      if (index < 0 && d.commands.length >= limits[lessonNo]) return { reset: false, notice: `最多放 ${limits[lessonNo]} 条指令。` };
      remember(); const command = { id: index >= 0 ? d.commands[index].id : d.nextId++, action: value };
      if (index >= 0) d.commands.splice(index,1,command); else d.commands.push(command); d.selected = null; }
    if (action === "remove") { const index = d.commands.findIndex(c => c.id === Number(value)); if (index >= 0) { remember(); d.commands.splice(index,1); d.selected = null; } }
    if (action === "clear") { remember(); d.commands = []; d.selected = null; }
    return { reset: true, notice: "" };
  }

  function adapter(lessonNo) {
    return { revision: revisions[lessonNo], mission: (base,p) => { const m = mission(base,p,lessonNo);
        if (lessonNo === 4) m.navigationProfileObserved = Boolean(p.debugRuns?.[m.early.key]); return m; },
      draft: p => draft(p,lessonNo), source: (m,d) => program(m,d,lessonNo).source,
      compile: (m,d,Sk) => compile(m,d,lessonNo,Sk), assess: (m,d,x,a) => assess(m,d,x,a,lessonNo), record: (p,a) => record(p,a,lessonNo),
      reconcile: p => { p.mastered = root.CodeQuestEvidence.stateGate(p,revisions[lessonNo]).mastered; },
      render: (m,p,c) => root.CodeQuestNavigationLessonUI.render(m,p,c), builder: (m,p,c) => root.CodeQuestNavigationLessonUI.builder(m,p,c),
      reference: (m,p) => { const d = draft(p,lessonNo); const commands = lessonNo === 3 ? m.navigation.routes[m.semanticConstraints.objective === 'moves' || m.semanticConstraints.objective === 'tie' ? 'stair' : 'flat'].commands
          : lessonNo === 4 ? m.navigation.correct : ['move','move','teleport','move','collect'];
        Object.assign(d,{ commands: commands.map((action,index)=>({id:index+1,action})), nextId: commands.length+1, selected:null,
          plan: lessonNo === 3 ? (m.semanticConstraints.objective === 'moves' || m.semanticConstraints.objective === 'tie' ? 'stair' : 'flat') : d.plan,
          diagnosis: lessonNo === 4 ? m.navigation.faultStep : d.diagnosis,
          portalChoice: lessonNo === 5 ? `${m.navigation.correctExit.x},${m.navigation.correctExit.y}` : d.portalChoice }); },
      feedback(m,p,a) { if (!a.success) return a.failure; if (p.mastered) return "本课完成！变化后的任务也留下了独立证据。";
        return m.early.independent ? "迁移完成。" : `这一阶段完成。接着做“${m.early.phaseLabels[1]}”。`; },
      edit: (m,p,input) => edit(m,p,lessonNo,input) };
  }
  root.CodeQuestNavigationLessons = { revisions, actions, limits, routeWorld, debugWorld, coordinateWorld, draft, mission, program, compile, assess, record };
  for (const lessonNo of [3,4,5]) root.CodeQuestStructuredLessons.register(lessonNo, adapter(lessonNo));
})(typeof globalThis !== "undefined" ? globalThis : window);
