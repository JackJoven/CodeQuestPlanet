(function (root) {
  "use strict";
  const lessonNos = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const revisions = Object.fromEntries(lessonNos.map(no => [no, `1.8-${String(no).padStart(2, "0")}.${[7,14].includes(no) ? 3 : 2}`]));
  const copy = value => root.CodeQuestEvidence.clone(value);
  const canonical = value => root.CodeQuestEvidence.canonical(value);
  const labels = { move: "前进", left: "左转", right: "右转", collect: "采集", upload: "上传", teleport: "传送", switch: "激活开关",
    call: "调用支路工具", loop: "重复运输单元", adaptive: "条件巡检", guard: "安全门判断", while: "while 前进" };
  const code = { move: "move()", left: "turn_left()", right: "turn_right()", collect: "collect()", upload: "upload()",
    teleport: "teleport()", switch: "activate_switch()", call: "visit_side()" };
  const limits = { 6: 64, 7: 28, 8: 80, 9: 24, 10: 24, 11: 4, 12: 8, 13: 4, 14: 3, 15: 3 };
  const terrain = extra => ({ version: "1.8", heights: {}, stairs: [], portals: [], switches: [], gates: [], oneWays: [], rotators: [], conveyors: [], ...extra });
  const dirs = ["N", "E", "S", "W"];
  function pathCommands(path, startDir, collect = true) {
    let direction = dirs.indexOf(startDir), commands = [];
    for (let index = 1; index < path.length; index += 1) {
      const [x0,y0] = path[index - 1], [x1,y1] = path[index];
      const next = x1 > x0 ? 1 : x1 < x0 ? 3 : y1 > y0 ? 2 : 0, turn = (next - direction + 4) % 4;
      if (turn === 1) commands.push("right");
      if (turn === 2) commands.push("right", "right");
      if (turn === 3) commands.push("left");
      commands.push("move"); direction = next;
    }
    if (collect) commands.push("collect");
    return commands;
  }
  const line = (width, distance, { spike = -1, relay = false, height = false } = {}) => {
    const rows = Array.from({ length: 5 }, () => Array(width).fill("_"));
    const cells = rows[2];
    const end = distance + (relay ? 2 : 1), platformEnd = height ? Math.max(end, 6) : end;
    for (let x = 1; x <= platformEnd; x += 1) {
      cells[x] = "g";
      rows[1][x] = "g";
      rows[3][x] = "g";
    }
    cells[1] = "S"; if (distance > 0) cells[1 + distance] = "B";
    if (spike > 0) cells[1 + spike] = "H";
    if (relay) cells[2 + distance] = "R";
    const t = terrain();
    if (height && distance > 1) {
      for (let x = 1 + Math.ceil(distance / 2); x <= 1 + distance; x += 1) {
        for (const y of [1, 2, 3]) t.heights[`${x},${y}`] = 1;
      }
      t.stairs.push({ from: { x: Math.ceil(distance / 2), y: 2 }, to: { x: 1 + Math.ceil(distance / 2), y: 2 } });
    }
    return { grid: rows.map(row => row.join("")), start: { x: 1, y: 2 }, startDir: "E", targets: [{ x: 1 + distance, y: 2 }], relay: relay ? { x: 2 + distance, y: 2 } : null, terrain: t, distance };
  };

  function dependencyWorld(challenge) {
    const left = challenge ? 1 : 2, right = challenge ? 11 : 10, center = 6, branchDepth = 4;
    const rows = Array.from({ length: 11 }, () => Array(13).fill("_"));
    for (let x = left; x <= right; x += 1) rows[5][x] = "g";
    for (const x of [left, right]) for (let y = 1; y <= 4; y += 1) rows[y][x] = y === 1 ? "B" : "g";
    for (let y = 6; y <= 9; y += 1) rows[y][center] = "g";
    rows[5][center] = "S"; rows[9][center] = "R";
    const go = steps => Array(steps).fill("move");
    const side = (steps, turn) => [...go(steps), turn, ...go(branchDepth), "collect", turn, turn, ...go(branchDepth), turn === "left" ? "right" : "left", ...go(steps)];
    const ref = [...side(right - center, "left"), ...side(center - left, "right"), "right", "move", "switch", "move", "move", "move", "upload"];
    return { grid: rows.map(r => r.join("")), start: { x: center, y: 5 }, startDir: "E", targets: [{ x: left, y: 1 }, { x: right, y: 1 }], relay: { x: center, y: 9 }, ref,
      terrain: terrain({ switches: [{ id: "S", at: { x: center, y: 6 } }], gates: [{ id: "G", at: { x: center, y: 7 }, switchId: "S" }] }) };
  }

  function designerWorld(challenge, d) {
    const rows = Array.from({ length: 11 }, () => Array(13).fill("_"));
    const path = challenge
      ? [[11,9],[10,9],[9,9],[8,9],[7,9],[6,9],[5,9],[4,9],[3,9],[3,8],[3,7],[3,6],[3,5],[3,4],[3,3],[4,3],[5,3],[6,3],[7,3],[7,4],[7,5],[6,5],[5,5]]
      : [[1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],[9,9],[9,8],[9,7],[9,6],[9,5],[9,4],[9,3],[8,3],[7,3],[6,3],[5,3],[5,4],[5,5],[6,5],[7,5]];
    path.forEach(([x,y]) => { rows[y][x] = "g"; });
    const plazas = challenge ? [[11,9],[3,9],[3,3],[7,3],[7,5],[5,5]] : [[1,9],[9,9],[9,3],[5,3],[5,5],[7,5]];
    for (const [cx,cy] of plazas) for (let y=cy-1;y<=cy+1;y+=1) for (let x=cx-1;x<=cx+1;x+=1)
      if (x>0&&x<12&&y>0&&y<10) rows[y][x]="g";
    const start = { x: path[0][0], y: path[0][1] }, target = { x: path.at(-1)[0], y: path.at(-1)[1] };
    rows[start.y][start.x] = "S"; rows[target.y][target.x] = "B";
    const block = { x: path.at(-2)[0], y: path.at(-2)[1] };
    if (d.fields.ruleFix !== "remove-wall") rows[block.y][block.x] = "#";
    const startDir = challenge ? "W" : "E", ref = pathCommands(path,startDir), heights = {};
    path.slice(15).forEach(([x,y]) => { heights[`${x},${y}`] = 1; });
    if (d.fields.ruleFix !== "remove-wall") delete heights[`${block.x},${block.y}`];
    const stair = { from: { x: path[14][0], y: path[14][1] }, to: { x: path[15][0], y: path[15][1] } };
    return { grid: rows.map(r => r.join("")), start, startDir, targets: [target], ref, block, actionCount: ref.length,
      labels: [{ at: path[8], text: "外环" }, { at: path[15], text: "内圈台阶" }, { at: block, text: "可编辑封路" }],
      terrain: terrain({ heights, stairs: [stair], oneWays: [{ from: { x: path[5][0], y: path[5][1] }, to: { x: path[6][0], y: path[6][1] } }] }) };
  }

  function capstoneWorld(challenge) {
    const rows = Array.from({ length: 11 }, () => Array(13).fill("_"));
    for (let x = 1; x <= 11; x += 1) rows[6][x] = "g";
    for (let y = 1; y <= 6; y += 1) { rows[y][1] = "g"; rows[y][6] = "g"; rows[y][11] = "g"; }
    for (let y = 7; y <= 9; y += 1) rows[y][6] = "g";
    rows[6][6] = "S"; rows[9][6] = "R"; rows[1][1] = "B"; rows[1][11] = "B";
    const first = challenge ? 11 : 1, second = challenge ? 1 : 11;
    const portal = { id: "P", from: { x: 6, y: 3 }, to: { x: first, y: 3 } };
    const cmds = [...Array(3).fill("move"), "teleport", ...Array(2).fill("move"), "collect", "left", "left",
      ...Array(2).fill("move"), "teleport", ...Array(3).fill("move"), challenge ? "right" : "left", ...Array(5).fill("move"),
      challenge ? "right" : "left", ...Array(5).fill("move"), "collect", "left", "left", ...Array(5).fill("move"),
      challenge ? "left" : "right", ...Array(5).fill("move"), challenge ? "right" : "left", "move", "switch", "move", "move", "upload"];
    const highX = second;
    const heights = { [`${highX},1`]: 1, [`${highX},2`]: 1, [`${highX},3`]: 1 };
    return { grid: rows.map(r => r.join("")), start: { x: 6, y: 6 }, startDir: "N", targets: [{ x: 1, y: 1 }, { x: 11, y: 1 }], relay: { x: 6, y: 9 }, ref: cmds,
      terrain: terrain({ heights, stairs: [{ from: { x: highX, y: 4 }, to: { x: highX, y: 3 } }], portals: [portal],
        switches: [{ id: "S", at: { x: 6, y: 7 } }], gates: [{ id: "G", at: { x: 6, y: 8 }, switchId: "S" }] }) };
  }

  function functionWorld(lessonNo, challenge) {
    const branches = challenge ? [1, 6, 11] : [2, 9];
    const width = 13, rows = Array.from({ length: 7 }, () => Array(width).fill("_"));
    const startX = branches[0];
    for (let x = startX; x <= branches.at(-1); x += 1) rows[4][x] = "g";
    for (const x of branches) {
      for (let px = Math.max(1, x - 1); px <= Math.min(width - 2, x + 1); px += 1) {
        rows[1][px] = "g";
        rows[2][px] = px === x ? "B" : "g";
      }
      rows[3][x] = "g"; rows[4][x] = "g";
    }
    rows[4][startX] = "S";
    const main = [];
    branches.forEach((x, index) => {
      main.push("call");
      if (index < branches.length - 1) main.push(...Array(branches[index + 1] - x).fill("move"));
    });
    const fn = lessonNo === 10 ? ["left","move","move","collect","right","move","move","left"] : ["left","move","move","collect","left","left","move","move","left"];
    return { grid: rows.map(r => r.join("")), start: { x: startX, y: 4 }, startDir: "E", targets: branches.map(x => ({ x, y: 2 })), ref: main, fn,
      terrain: terrain({ rotators: lessonNo === 10 ? branches.map(x => ({ at: { x, y: 2 } })) : [] }) };
  }

  function conveyorWorld(groups, withRelay = false) {
    const width = groups * 2 + (withRelay ? 4 : 3), row = Array(width).fill("_");
    row[1] = "S"; const targets = [], conveyors = [];
    for (let i = 0; i < groups; i += 1) { const belt = 2 + i * 2, gem = belt + 1; row[belt] = "g"; row[gem] = "B"; conveyors.push({ at: { x: belt, y: 1 }, direction: "E" }); targets.push({ x: gem, y: 1 }); }
    let relay = null;
    if (withRelay) { relay = { x: groups * 2 + 2, y: 1 }; row[relay.x] = "R"; }
    const upper = Array(width).fill("_"), lower = Array(width).fill("_");
    for (let x = 1; x < width - 1; x += 1) {
      if (row[x] !== "_") { upper[x] = "g"; lower[x] = "g"; }
    }
    return { grid: ["_".repeat(width), upper.join(""), row.join(""), lower.join(""), "_".repeat(width)], start: { x: 1, y: 2 }, startDir: "E",
      targets: targets.map(at => ({ x: at.x, y: 2 })), relay: relay ? { x: relay.x, y: 2 } : null, groups,
      terrain: terrain({ conveyors: conveyors.map(item => ({ ...item, at: { x: item.at.x, y: 2 } })) }) };
  }

  function straightScopeWorld(distance) { return line(distance + 4, distance, { relay: true }); }
  function booleanWorld(kind) {
    const tile = kind === "spike" ? "H" : kind === "wall" ? "#" : "g";
    const rows = Array.from({ length: 9 }, () => Array(11).fill("_"));
    for (let y=2;y<=4;y+=1) for (let x=1;x<=3;x+=1) rows[y][x]="g";
    for (let y=2;y<=4;y+=1) for (let x=7;x<=9;x+=1) rows[y][x]="g";
    for (let y=1;y<=7;y+=1) rows[y][5]="g";
    for (let y=5;y<=7;y+=1) for (let x=4;x<=6;x+=1) rows[y][x]="g";
    rows[6][5] = "S"; rows[5][5] = tile;
    const heights={};
    for(let y=2;y<=4;y+=1) for(const x of [1,2,3,7,8,9]) heights[`${x},${y}`]=1;
    return { grid: rows.map(row => row.join("")), start: { x: 5, y: 6 }, startDir: "N", targets: [], terrain: terrain({heights}),
      expected: kind === "clear", energy: kind === "energy" ? 1 : 3, kind,
      labels: [{at:{x:5,y:2},text:"通路灯"},{at:{x:2,y:3},text:"能量灯"},{at:{x:8,y:3},text:"尖刺灯"},{at:{x:5,y:5},text:"安全门"}] };
  }

  function initialFields(lessonNo) {
    if (lessonNo === 7) return { target: "", ruleFix: "", actionLimit: "" };
    if (lessonNo === 11) return { loopCount: "", loopBody: "" };
    if (lessonNo === 12) return { loopCount: "", collectScope: "", uploadScope: "" };
    if (lessonNo === 13) return { sensor: "", action: "" };
    if (lessonNo === 14) return { connector: "", negateSpike: "" };
    if (lessonNo === 15) return { condition: "", loopBody: "" };
    return {};
  }

  function draft(p, lessonNo) {
    p.progressiveDrafts ||= {};
    const key = `${lessonNo}-${p.phase}-${p.variant}`;
    if (!p.progressiveDrafts[key]) {
      p.progressiveDrafts[key] = { commands: [], functionCommands: [], selected: null, selectedFunction: null, nextId: 1, nextFunctionId: 101,
        undo: null, fields: initialFields(lessonNo) };
      if (lessonNo === 8 && p.phase === "guided") p.progressiveDrafts[key].commands = capstoneWorld(false).ref.filter((_, index) => index !== 19).map((action,index)=>({id:index+1,action}));
    }
    const d = p.progressiveDrafts[key];
    d.commands = Array.isArray(d.commands) ? d.commands.slice(0, limits[lessonNo]) : [];
    d.functionCommands = Array.isArray(d.functionCommands) ? d.functionCommands.slice(0, 16) : [];
    d.fields = { ...initialFields(lessonNo), ...(d.fields || {}) };
    d.nextId = Math.max(Number(d.nextId) || 1, 1, ...d.commands.map(item => Number(item.id) + 1));
    d.nextFunctionId = Math.max(Number(d.nextFunctionId) || 101, 101, ...d.functionCommands.map(item => Number(item.id) + 1));
    return d;
  }

  function archive(p, lessonNo) {
    const revision = revisions[lessonNo];
    if (p.contentRevision === revision) return;
    if (p.contentRevision) p.contentArchives = { ...p.contentArchives, [p.contentRevision]: { attempts: copy(p.attempts), guidedEvidence: p.guidedEvidence, transferEvidence: p.transferEvidence, progressiveDrafts: p.progressiveDrafts } };
    Object.assign(p, { contentRevision: revision, phase: "guided", variant: 0, progressiveDrafts: {}, mastered: false, guidedComplete: false,
      guidedEvidence: null, repairEvidence: null, transferEvidence: {}, explanationEvidence: null, attempts: [], debugRuns: {} });
  }

  function mission(base, p, lessonNo) {
    archive(p, lessonNo); p.attempts = p.attempts.filter(a => a.contentRevision === revisions[lessonNo]);
    const d = draft(p, lessonNo), challenge = p.phase === "challenge";
    let world, title, goal, rule, phaseLabels, capability, allowed;
    if (lessonNo === 6) { world = dependencyWorld(challenge); title = "双岛依赖站"; goal = "分别完成 A、B，再激活开关并到中继站上传。"; rule = "支路顺序可以换；上传同时检查位置和两颗宝石。"; phaseLabels = ["拆分三段任务", "支路长度迁移"]; capability = "subtask-dependency"; allowed = ["move","left","right","collect","switch","upload"]; }
    if (lessonNo === 7) { world = designerWorld(challenge,d); title = "单向迷宫工坊"; goal = "修正封死规则，设置可行上限，再用作者程序证明可解。"; rule = "单向边只能沿箭头通过；加大上限不能修好被岩石封死的路。"; phaseLabels = ["修正规则并提交作者解", "单向布局迁移"]; capability = "rule-solvability"; allowed = ["move","left","right","collect"]; }
    if (lessonNo === 8) { world = capstoneWorld(challenge); title = "第一场独立救援"; goal = challenge ? "在新地图完成跨岛双目标救援和完整交付。" : "先运行故障方案，修好跨岛双目标救援并完成交付。"; rule = "坐标、路线、分段依赖和调试四项都要留下运行证据。"; phaseLabels = ["综合救援与调试", "陌生救援迁移"]; capability = "stage-one-capstone"; allowed = ["move","left","right","collect","teleport","switch","upload"]; }
    if (lessonNo === 9 || lessonNo === 10) { world = functionWorld(lessonNo,challenge); title = lessonNo === 9 ? "高台支路工具" : "稳定出口工具"; goal = lessonNo === 9 ? "编辑一份支路函数，并在每个入口真实调用。" : "让每次函数调用都回到入口位置并恢复向东。"; rule = lessonNo === 9 ? "定义不会自动执行；主程序必须放入调用卡。" : "函数出口同时包含位置和朝向；补丁要写进函数体。"; phaseLabels = lessonNo === 9 ? ["定义并调用支路工具","支路数量迁移"] : ["恢复函数出口约定","转向盘位置迁移"]; capability = lessonNo === 9 ? "function-call" : "function-contract"; allowed = ["move","call"]; }
    if (lessonNo === 11) { world = conveyorWorld(challenge ? 5 : 4); title = "货运循环线"; goal = `把“进入输送格 + 采集”组成一轮，重复 ${world.groups} 次。`; rule = "输送格额外送一格但不自动采集；合法错误次数会真实运行。"; phaseLabels = ["搭建完整重复单元","组数变化迁移"]; capability = "complete-loop-unit"; allowed = ["loop"]; }
    if (lessonNo === 12) { world = challenge ? straightScopeWorld(6) : conveyorWorld(4,true); title = "循环边界站"; goal = challenge ? "重复前进，循环结束后采集一次、再上传一次。" : "每轮采集一件，循环结束后只上传一次。"; rule = "重复发生的动作放里面，只做一次的动作放外面。"; phaseLabels = ["区分循环内外","作用范围迁移"]; capability = "loop-scope"; allowed = ["loop","move","collect","upload"]; }
    if (lessonNo === 13) { world = line(14, challenge ? 10 : 8, { spike: challenge ? -1 : 4 }); title = "尖刺巡检通道"; goal = challenge ? "同一判断面对无尖刺通道时应跳过开盾。" : "检测到尖刺才开盾，再继续前进到宝石。"; rule = "条件为 True 才执行条件体；False 会留下检查证据但跳过动作。"; phaseLabels = ["连接条件与动作","真假变化迁移"]; capability = "if-truth"; allowed = ["adaptive","collect"]; }
    if (lessonNo === 14) { const kinds = challenge ? ["spike","energy","wall"][p.variant % 3] : "clear"; world = booleanWorld(kinds); title = "三灯安全门"; goal = world.expected ? "让三项条件全部通过时前进一步。" : "找出哪一项风险阻止前进，安全规则应保持不动。"; rule = "可通行 AND 能量足 AND NOT 尖刺；任一项为 False 都不能前进。"; phaseLabels = ["连接三项安全规则","单项风险迁移"]; capability = "boolean-guard"; allowed = ["guard"]; }
    if (lessonNo === 15) { const distance = challenge ? (p.variant % 2 ? 0 : 6) : 1; world = line(16,distance,{height:true}); title = "未知距离观测道"; goal = `不知道距离；用停止条件走到宝石（本图实际距离 ${distance}）。`; rule = "每轮先重查是否到达；已到达时循环体执行 0 次。"; phaseLabels = ["搭建会停止的 while","陌生距离迁移"]; capability = "while-stop"; allowed = ["while","collect"]; }
    const requiresUpload = [6,8,12].includes(lessonNo);
    const m = { ...base, contentRevision: revisions[lessonNo], lessonMode: `v18-progressive-${lessonNo}`, grid: world.grid,
      startOverride: world.start, startDir: world.startDir, targetPositions: world.targets, required: world.targets.length,
      energy: world.energy || 80, terrain: world.terrain, worldLabels: [...world.targets.map((at,i)=>({at,text:`${String.fromCharCode(65+i)}·宝石`})), ...(world.relay?[{at:world.relay,text:"中继站"}]:[]), ...(world.labels||[])],
      allowed: [], limit: limits[lessonNo], solution: [], solutionFn: [], functionEnabled: [9,10].includes(lessonNo), progressive: world,
      semanticConstraints: { capability, fields: d.fields, expected: world.expected, distance: world.distance, groups: world.groups },
      faultDescriptor: lessonNo === 8 && !challenge ? { kind: "missing-second-collect" } : null,
      early: { v18: true, independent: challenge, repairing: lessonNo === 8 && !challenge, key: `${revisions[lessonNo]}-${p.phase}-${p.variant}`,
        requiresUpload, goal, rule, title, mainStarter: [], functionStarter: [], faulty: [], phaseLabels, targets: world.targets,
        hints: ["先看当前阶段只要求你改变哪一个结构。", lessonNo <= 8 ? "把长任务按目标分段，再逐段运行。" : "查看 Python 和运行记录，确认结构控制了真实事件。", `参考程序会标记为强帮助；之后请换一张等价地图独立完成。`] },
      progressiveAllowed: allowed };
    if (root.CodeQuestEvidence.fingerprint(m) !== p.currentFingerprint) root.CodeQuestEvidence.enter(p,m);
    p.mastered = root.CodeQuestEvidence.stateGate(p,revisions[lessonNo]).mastered;
    return m;
  }

  function requireField(d, key, message) { if (d.fields[key] === "" || d.fields[key] === null || d.fields[key] === undefined) throw new Error(message); }
  function describeProgram(m,d,lessonNo,preview=false) {
    if (!preview && !d.commands.length) throw new Error("先点一张指令卡，加入程序。");
    if (!preview && lessonNo === 7) { requireField(d,"target","先选择作品目标。"); requireField(d,"ruleFix","先修正封死规则。"); requireField(d,"actionLimit","先设置动作上限。"); }
    if (!preview && [9,10].includes(lessonNo) && d.commands.some(item => item.action === "call") && !d.functionCommands.length) throw new Error("先到函数页签编辑支路工具。");
    if (!preview && lessonNo === 11) { requireField(d,"loopCount","先设置重复次数。"); requireField(d,"loopBody","先选择完整重复单元。"); }
    if (!preview && lessonNo === 12) { requireField(d,"loopCount","先设置重复次数。"); requireField(d,"collectScope","先决定采集在循环内还是外。"); requireField(d,"uploadScope","先决定上传在循环内还是外。"); }
    if (!preview && lessonNo === 13) { requireField(d,"sensor","先选择 if 检测条件。"); requireField(d,"action","先选择条件成立时的动作。"); }
    if (!preview && lessonNo === 14) { requireField(d,"connector","先连接三个条件。"); requireField(d,"negateSpike","先决定尖刺条件是否取反。"); }
    if (!preview && lessonNo === 15) { requireField(d,"condition","先选择 while 的继续条件。"); requireField(d,"loopBody","先选择让状态推进的循环体。"); }
    const lines=[], steps=[];
    const push=(text,id,label,kind)=>{ const start=lines.length+1; String(text).split("\n").forEach(value=>lines.push(value)); steps.push({id,commandId:Number(String(id).replace(/\D/g,""))||id,index:steps.length,kind,label,code:text,line:start,endLine:lines.length}); };
    if ([9,10].includes(lessonNo) && (d.functionCommands.length || d.commands.some(item => item.action === "call"))) {
      lines.push("def visit_side():");
      if (!d.functionCommands.length) lines.push("    # 在函数页签加入动作");
      d.functionCommands.forEach(item=>push(`    ${code[item.action]}`,`function-${item.id}`,labels[item.action],item.action));
      lines.push("");
    }
    d.commands.forEach(item=>{
      if (item.action === "loop") {
        const count = Number(d.fields.loopCount || 0), body=[];
        if (lessonNo === 11) { body.push("    move()"); if (d.fields.loopBody === "complete") body.push("    collect()"); }
        if (lessonNo === 12) { body.push("    move()"); if (d.fields.collectScope === "inside") body.push("    collect()"); if (d.fields.uploadScope === "inside") body.push("    upload()"); }
        push(`for _ in range(${count}):\n${body.join("\n") || "    # 选择循环体"}`,`command-${item.id}`,labels.loop,item.action);
      } else if (item.action === "adaptive") {
        const sensor = d.fields.sensor === "spike" ? "is_spike_ahead()" : "is_blocked_ahead()";
        const action = d.fields.action === "shield" ? "shield()" : "turn_right()";
        push(`while not at_gem():\n    if ${sensor}:\n        ${action}\n    move()`,`command-${item.id}`,labels.adaptive,item.action);
      } else if (item.action === "guard") {
        const join = d.fields.connector === "and" ? " and " : " or ", spike = d.fields.negateSpike === "not" ? "not is_spike_ahead()" : "is_spike_ahead()";
        push(`safe = ${["is_path_clear()","energy_remaining() >= 2",spike].join(join)}\nif safe:\n    move()`,`command-${item.id}`,labels.guard,item.action);
      } else if (item.action === "while") {
        const condition = d.fields.condition === "not-at" ? "not at_gem()" : "at_gem()", body = d.fields.loopBody === "move" ? "move()" : "wait()";
        push(`while ${condition}:\n    ${body}`,`command-${item.id}`,labels.while,item.action);
      } else push(code[item.action],`command-${item.id}`,labels[item.action],item.action);
    });
    return {source:lines.join("\n"),steps};
  }

  async function compile(m,d,lessonNo,Sk=root.Sk) {
    const desc=describeProgram(m,d,lessonNo), allowed=new Set(["move","turn_left","turn_right","collect","upload","teleport","activate_switch","shield","wait","is_spike_ahead","is_blocked_ahead","is_path_clear","energy_remaining","at_gem","range"]);
    const runtime=root.CodeQuestPythonRuntime.create({Sk,initialEnergy:m.energy,apiCallLimit:180,allowedFunctions:allowed,
      languageFeatures:[...([9,10].includes(lessonNo)?["functions"]:[]),...([11,12].includes(lessonNo)?["for-loops"]:[])],
      world:{grid:m.grid,start:m.startOverride,startDir:m.startDir,required:m.required,targetPositions:m.targetPositions,terrain:m.terrain}});
    let execution;
    try { execution={...await runtime.compile(desc.source),source:desc.source,error:null}; }
    catch(error){ execution={source:desc.source,events:error.partialEvents||[],finalState:error.partialState||{},error:root.CodeQuestPythonRuntime.friendlyErrorMessage(error)}; }
    execution.events=execution.events.map(event=>{const step=desc.steps.find(s=>event.line>=s.line&&event.line<=s.endLine);return{...event,programStep:step?.id||null,stepLabel:step?.label||""};});
    return execution;
  }

  function functionPairs(events) {
    const calls=events.filter(e=>e.type==="function-call"), ends=events.filter(e=>e.type==="function-end");
    return calls.map(call=>({call,end:ends.find(end=>end.callId===call.callId)}));
  }
  function assess(m,d,x,assisted,lessonNo) {
    const events=copy(x.events), final=x.finalState||{}, collected=final.collectedKeys?.length||0;
    let worldSuccess=!x.error, conceptSuccess=false, evidence={}, failure=x.error||"";
    if ([6,8,12].includes(lessonNo)) worldSuccess=worldSuccess&&final.uploaded&&collected===m.required;
    else if (![14].includes(lessonNo)) worldSuccess=worldSuccess&&collected===m.required;
    if (lessonNo===6) { const uploadIndex=events.findIndex(e=>e.type==="upload"), collects=events.map((e,i)=>e.type==="collect"?i:-1).filter(i=>i>=0); conceptSuccess=worldSuccess&&events.some(e=>e.type==="switch")&&collects.length===2&&collects.every(i=>i<uploadIndex); evidence={collects:collects.length,switchLatched:events.some(e=>e.type==="switch"),uploadedAfterBoth:collects.every(i=>i<uploadIndex)}; }
    if (lessonNo===7) { const actionLimit=Number(d.fields.actionLimit), actions=events.filter(e=>["move","turn","collect"].includes(e.type)).length; conceptSuccess=worldSuccess&&d.fields.target==="exit"&&d.fields.ruleFix==="remove-wall"&&actionLimit>=actions; evidence={target:d.fields.target,ruleFix:d.fields.ruleFix,actionLimit,actions,oneWay:m.terrain.oneWays}; }
    if (lessonNo===8) { const observed=Boolean(m.early.independent||m.debugObserved); conceptSuccess=worldSuccess&&observed&&events.some(e=>e.type==="teleport")&&events.some(e=>e.type==="switch"); evidence={observed,teleported:events.some(e=>e.type==="teleport"),latched:events.some(e=>e.type==="switch")}; }
    if ([9,10].includes(lessonNo)) { const pairs=functionPairs(events), expected=m.progressive.targets.length; const contracts=pairs.every(({call,end})=>end&&end.state.x===call.state.x&&end.state.y===call.state.y&&end.state.directionName===call.state.directionName); conceptSuccess=worldSuccess&&pairs.length===expected&&(lessonNo===9||contracts); evidence={callCount:pairs.length,expectedCalls:expected,contracts}; }
    if (lessonNo===11) { const ranges=events.filter(e=>e.type==="range-input"), belts=events.filter(e=>e.type==="conveyor"); conceptSuccess=worldSuccess&&Number(d.fields.loopCount)===m.progressive.groups&&d.fields.loopBody==="complete"&&ranges.length===1&&belts.length===m.progressive.groups; evidence={loopCount:Number(d.fields.loopCount),conveyors:belts.length,collects:events.filter(e=>e.type==="collect").length}; }
    if (lessonNo===12) { const expectedCollect=m.early.independent?"outside":"inside"; conceptSuccess=worldSuccess&&d.fields.collectScope===expectedCollect&&d.fields.uploadScope==="outside"&&events.filter(e=>e.type==="upload").length===1; evidence={collectScope:d.fields.collectScope,uploadScope:d.fields.uploadScope,collects:events.filter(e=>e.type==="collect").length,uploads:events.filter(e=>e.type==="upload").length}; }
    if (lessonNo===13) { const conditions=events.filter(e=>e.type==="condition"), shields=events.filter(e=>e.type==="shield"); const expectedShield=m.grid.some(row=>row.includes("H")); conceptSuccess=worldSuccess&&d.fields.sensor==="spike"&&d.fields.action==="shield"&&conditions.length>0&&(expectedShield?shields.length>0:shields.length===0); evidence={conditionChecks:conditions.length,shieldCount:shields.length,expectedShield}; }
    if (lessonNo===14) { const moved=events.some(e=>e.type==="move"); worldSuccess=!x.error&&m.progressive.expected===moved; conceptSuccess=worldSuccess&&d.fields.connector==="and"&&d.fields.negateSpike==="not"; evidence={case:m.progressive.kind,expectedMove:m.progressive.expected,moved,conditionReads:events.filter(e=>e.type==="condition").map(e=>e.message)}; }
    if (lessonNo===15) { const moves=events.filter(e=>e.type==="move").length, checks=events.filter(e=>e.type==="condition").length; conceptSuccess=worldSuccess&&d.fields.condition==="not-at"&&d.fields.loopBody==="move"&&moves===m.progressive.distance&&checks>=1; evidence={distance:m.progressive.distance,moves,conditionChecks:checks}; }
    if (!failure&&!conceptSuccess) failure={6:"先确认两颗宝石都在上传前采集，并激活闩锁开关。",7:"规则、上限和作者解还没有同时证明作品可解。",8:"综合任务还缺调试、传送或依赖证据。",9:"每条支路都必须由同一个函数真实调用。",10:"至少一次函数结束时没有同时恢复位置和朝向。",11:"重复次数或循环体不完整。",12:"采集和上传的作用范围不符合当前任务。",13:"条件或条件体没有产生正确的真假轨迹。",14:"三项安全规则必须用 AND 连接，并对尖刺取反。",15:"while 的条件或循环体没有按距离推进并停止。"}[lessonNo];
    const model={commands:d.commands.map(c=>c.action),functionCommands:d.functionCommands.map(c=>c.action),fields:copy(d.fields)};
    return {id:`${Date.now()}-${Math.random().toString(36).slice(2,9)}`,at:new Date().toISOString(),lessonNo,contentRevision:revisions[lessonNo],fingerprint:root.CodeQuestEvidence.fingerprint(m),challengeKey:m.early.key,
      phase:m.early.independent?"challenge":"guided",independent:m.early.independent,assisted:Boolean(assisted),worldSuccess:Boolean(worldSuccess),success:Boolean(worldSuccess&&conceptSuccess),failure,...evidence,
      source:x.source,events,programModel:model,programVersion:canonical(model),ruleVersion:canonical({capability:m.semanticConstraints.capability}),practiceOnly:false,trace:[]};
  }

  function record(p,a,lessonNo){p.attempts=[...p.attempts,copy(a)].slice(-12);if(lessonNo===8&&!a.independent&&!a.worldSuccess)p.debugRuns={...p.debugRuns,[a.challengeKey]:true};if(a.worldSuccess)p.completed=true;if(a.success){if(a.phase==="guided"){p.guidedComplete=true;p.guidedEvidence=copy(a);}if(a.independent)p.transferEvidence=root.CodeQuestEvidence.mergeTransferProofs(p.transferEvidence,{[a.fingerprint]:copy(a)});}p.mastered=root.CodeQuestEvidence.stateGate(p,revisions[lessonNo]).mastered;}
  function remember(d){d.undo={commands:copy(d.commands),functionCommands:copy(d.functionCommands),selected:d.selected,selectedFunction:d.selectedFunction,nextId:d.nextId,nextFunctionId:d.nextFunctionId,fields:copy(d.fields)};}
  function edit(m,p,lessonNo,{action,field,value}){
    const d=draft(p,lessonNo);if(field){d.fields[field]=/^\d+$/.test(value)?Number(value):value;return{reset:true,notice:""};}
    if(action==="select"){d.selected=d.selected===Number(value)?null:Number(value);return{reset:false,notice:""};}
    if(action==="select-function"){d.selectedFunction=d.selectedFunction===Number(value)?null:Number(value);return{reset:false,notice:""};}
    if(action==="undo"){if(d.undo){Object.assign(d,d.undo);d.undo=null;}else d.commands.pop();return{reset:true,notice:""};}
    if(action==="clear"){remember(d);d.commands=[];d.selected=null;return{reset:true,notice:""};}
    if(action==="add"&&m.progressiveAllowed.includes(value)){const index=d.commands.findIndex(c=>c.id===d.selected);if(index<0&&d.commands.length>=limits[lessonNo])return{reset:false,notice:`最多放 ${limits[lessonNo]} 条指令。`};remember(d);const item={id:index>=0?d.commands[index].id:d.nextId++,action:value};if(index>=0)d.commands.splice(index,1,item);else d.commands.push(item);d.selected=null;return{reset:true,notice:""};}
    if(action==="remove"){const index=d.commands.findIndex(c=>c.id===Number(value));if(index>=0){remember(d);d.commands.splice(index,1);d.selected=null;}return{reset:true,notice:""};}
    if(action==="add-function"&&["move","left","right","collect"].includes(value)){const index=d.functionCommands.findIndex(c=>c.id===d.selectedFunction);remember(d);const item={id:index>=0?d.functionCommands[index].id:d.nextFunctionId++,action:value};if(index>=0)d.functionCommands.splice(index,1,item);else d.functionCommands.push(item);d.selectedFunction=null;return{reset:true,notice:""};}
    if(action==="remove-function"){const index=d.functionCommands.findIndex(c=>c.id===Number(value));if(index>=0){remember(d);d.functionCommands.splice(index,1);}return{reset:true,notice:""};}
    return{reset:false,notice:""};
  }
  function reference(m,p,lessonNo){const d=draft(p,lessonNo),fallback={11:["loop"],12:m.early.independent?["loop","collect","move","upload"]:["loop","move","upload"],13:["adaptive","collect"],14:["guard"],15:["while","collect"]}[lessonNo]||[],ref=m.progressive.ref||fallback;d.commands=ref.map((action,index)=>({id:index+1,action}));d.nextId=ref.length+1;d.selected=null;if([9,10].includes(lessonNo)){d.functionCommands=m.progressive.fn.map((action,index)=>({id:101+index,action}));d.nextFunctionId=101+d.functionCommands.length;}if(lessonNo===7)d.fields={target:"exit",ruleFix:"remove-wall",actionLimit:m.progressive.actionCount};if(lessonNo===11)d.fields={loopCount:m.progressive.groups,loopBody:"complete"};if(lessonNo===12)d.fields={loopCount:m.early.independent?6:4,collectScope:m.early.independent?"outside":"inside",uploadScope:"outside"};if(lessonNo===13)d.fields={sensor:"spike",action:"shield"};if(lessonNo===14)d.fields={connector:"and",negateSpike:"not"};if(lessonNo===15)d.fields={condition:"not-at",loopBody:"move"};}
  function adapter(lessonNo){return{revision:revisions[lessonNo],mission:(base,p)=>{const m=mission(base,p,lessonNo);if(lessonNo===8)m.debugObserved=Boolean(p.debugRuns?.[m.early.key]);return m;},draft:p=>draft(p,lessonNo),source:(m,d)=>describeProgram(m,d,lessonNo).source,compile:(m,d,Sk)=>compile(m,d,lessonNo,Sk),assess:(m,d,x,a)=>assess(m,d,x,a,lessonNo),record:(p,a)=>record(p,a,lessonNo),reconcile:p=>{p.mastered=root.CodeQuestEvidence.stateGate(p,revisions[lessonNo]).mastered;},render:(m,p,c)=>root.CodeQuestProgressiveLessonUI.render(m,p,c),builder:(m,p,c)=>root.CodeQuestProgressiveLessonUI.builder(m,p,c),edit:(m,p,input)=>edit(m,p,lessonNo,input),reference:(m,p)=>reference(m,p,lessonNo),feedback(m,p,a){if(!a.success)return a.failure;if(p.mastered)return"前 15 课中的本课已完成独立验证。";return m.early.independent?"迁移完成。":`这一阶段完成。接着做“${m.early.phaseLabels[1]}”。`;}};}
  root.CodeQuestProgressiveLessons={revisions,labels,limits,draft,mission,describeProgram,compile,assess,record,dependencyWorld,designerWorld,capstoneWorld,functionWorld,conveyorWorld,booleanWorld};
  lessonNos.forEach(no=>root.CodeQuestStructuredLessons.register(no,adapter(no)));
})(typeof globalThis!=="undefined"?globalThis:window);
