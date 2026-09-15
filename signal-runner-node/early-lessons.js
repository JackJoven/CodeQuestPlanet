(function (root) {
  "use strict";
  const version = 4;
  const directions = ["N", "E", "S", "W"];
  const vectors = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
  const labels = { N: "北", E: "东", S: "南", W: "西" };
  const reasons = ["指令更少", "转弯更少", "我想练习转向"];
  const isEarly = (mission) => /^course-(?:0[1-9]|1[0-2])$/.test(mission?.id || "");
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const commands = (items) => Array.isArray(items) ? items.filter((x) => ["move", "left", "right", "back", "collect", "upload", "callRoute"].includes(x)).slice(0, 32) : [];
  const integer = (value) => Number.isFinite(Number(value)) ? Math.max(0, Math.min(100, Math.floor(Number(value)))) : 0;
  const points = (items) => Array.isArray(items) ? items.slice(0, 41).map((p) => ({ x: integer(p?.x), y: integer(p?.y) })) : [];
  function normalizeAttempt(a) {
    if (!a || typeof a !== "object" || typeof a.id !== "string" || !Array.isArray(a.trace)) return null;
    return { ...a, id: a.id.slice(0, 100), program: commands(a.program), routeProgram: commands(a.routeProgram), path: points(a.path), plannedPath: points(a.plannedPath),
      tailCount: integer(a.tailCount), divergence: a.divergence === null ? null : integer(a.divergence),
      callSnapshots: Array.isArray(a.callSnapshots) ? a.callSnapshots.slice(0, 6).map((item) => ({
        call: integer(item?.call), before: item?.before && { x: integer(item.before.x), y: integer(item.before.y), dir: directions.includes(item.before.dir) ? item.before.dir : "N" },
        after: item?.after && { x: integer(item.after.x), y: integer(item.after.y), dir: directions.includes(item.after.dir) ? item.after.dir : "N" }, failed: item?.failed === true
      })) : [],
      trace: a.trace.slice(0, 40).map((t) => ({ command: commands([t?.command])[0] || "move", x: integer(t?.x), y: integer(t?.y),
        dir: directions.includes(t?.dir) ? t.dir : "N", collected: integer(t?.collected), energy: integer(t?.energy), failed: t?.failed === true })) };
  }

  function profile(saved) {
    const p = saved?.version === version ? copy(saved) : [2, 3].includes(saved?.version)
      ? copy(saved) : saved?.version === 1
        ? { legacyEvidence: copy(saved), completed: saved.completed === true, updatedAt: saved.updatedAt || "" } : {};
    return {
      version, phase: "guided", variant: 0, draft: [], prediction: "", plan: "", reason: "",
      prerequisite: "", explanation: "", debug: "", diagnosis: "", reflection: "", repairEvidence: null, debugObservation: null, hintLevel: 0, assisted: false,
      guidedComplete: false, completed: false, mastered: false, attempts: [], updatedAt: "", functionDraft: [], savedFunction: [], functionName: "visit_side", initializedKey: "",
      designerTarget: "", obstacles: [], actionLimit: "tight", ruleFixed: false, ruleRevised: false, ruleDiagnosis: "", failureReason: "",
      loopCount: 0, loopBoundary: "",
      ...p,
      phase: ["challenge", "repair"].includes(p.phase) ? p.phase : "guided",
      variant: integer(p.variant) % 3,
      draft: commands(p.draft), functionDraft: commands(p.functionDraft), savedFunction: commands(p.savedFunction),
      functionName: /^[A-Za-z_][A-Za-z0-9_]{0,23}$/.test(p.functionName || "") ? p.functionName : "visit_side",
      obstacles: Array.isArray(p.obstacles) ? p.obstacles.filter((x) => typeof x === "string").slice(0, 2) : [],
      loopCount: Math.min(8, integer(p.loopCount)),
      loopBoundary: ["inside", "outside"].includes(p.loopBoundary) ? p.loopBoundary : "",
      hintLevel: Math.min(3, integer(p.hintLevel)),
      assisted: p.assisted === true, mastered: p.mastered === true, completed: p.completed === true,
      attempts: Array.isArray(p.attempts) ? p.attempts.map(normalizeAttempt).filter(Boolean).slice(-6) : []
    };
  }

  function floor(width, height, start, beacon, walls = []) {
    return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
      if (!x || !y || x === width - 1 || y === height - 1) return "_";
      if (x === start[0] && y === start[1]) return "S";
      if (x === beacon[0] && y === beacon[1]) return "B";
      return walls.some(([wx, wy]) => x === wx && y === wy) ? "#" : "g";
    }).join(""));
  }

  function rotate(grid, turns) {
    let result = grid;
    for (let n = 0; n < turns; n += 1) {
      result = Array.from({ length: result[0].length }, (_, y) =>
        Array.from({ length: result.length }, (_, x) => result[result.length - x - 1][y]).join(""));
    }
    return result;
  }

  function pathFor(grid, startDir, commands) {
    let x = 0, y = 0, dir = startDir;
    grid.forEach((row, rowY) => { if (row.includes("S")) { x = row.indexOf("S"); y = rowY; } });
    const path = [{ x, y }];
    for (const command of commands) {
      if (command === "left" || command === "right") dir = directions[(directions.indexOf(dir) + (command === "left" ? 3 : 1)) % 4];
      if (command === "move") { x += vectors[dir][0]; y += vectors[dir][1]; path.push({ x, y }); }
    }
    return path;
  }

  function shortestProgram(grid, startDir, target) {
    let start = { x: 0, y: 0 };
    grid.forEach((row, y) => { if (row.includes("S")) start = { x: row.indexOf("S"), y }; });
    const open = (x, y) => Boolean(grid[y]?.[x] && !["_", " ", "#", "~"].includes(grid[y][x]));
    const queue = [{ ...start, dir: startDir, program: [] }];
    const seen = new Set([`${start.x},${start.y},${startDir}`]);
    while (queue.length) {
      const state = queue.shift();
      if (state.x === target.x && state.y === target.y) return [...state.program, "collect"];
      const candidates = [
        { x: state.x, y: state.y, dir: directions[(directions.indexOf(state.dir) + 3) % 4], command: "left" },
        { x: state.x, y: state.y, dir: directions[(directions.indexOf(state.dir) + 1) % 4], command: "right" },
        { x: state.x + vectors[state.dir][0], y: state.y + vectors[state.dir][1], dir: state.dir, command: "move" }
      ];
      for (const next of candidates) {
        if (next.command === "move" && !open(next.x, next.y)) continue;
        const key = `${next.x},${next.y},${next.dir}`;
        if (seen.has(key)) continue;
        seen.add(key);
        queue.push({ ...next, program: [...state.program, next.command] });
      }
    }
    return [];
  }

  function makeGrid(width, height, start, beacons, walls = [], relay = null) {
    return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
      if (!x || !y || x === width - 1 || y === height - 1) return "_";
      if (x === start.x && y === start.y) return "S";
      if (beacons.some((point) => point.x === x && point.y === y)) return "B";
      if (relay && relay.x === x && relay.y === y) return "R";
      if (walls.some((point) => point.x === x && point.y === y)) return "#";
      return "g";
    }).join(""));
  }

  function functionGrid(rotated = false, spacing = false) {
    if (rotated) {
      const width = 10, height = 10, rows = Array.from({ length: height }, () => Array(width).fill("_"));
      for (let y = 1; y <= 8; y += 1) rows[y][6] = "g";
      rows[1][6] = "S";
      for (const y of [3, 5, 7]) rows[y][5] = "B";
      return rows.map((row) => row.join(""));
    }
    const width = 11, rows = Array.from({ length: 5 }, () => Array(width).fill("_"));
    for (let x = 1; x <= 9; x += 1) rows[1][x] = "g";
    rows[1][1] = "S";
    for (const x of spacing ? [2, 5, 8] : [3, 5, 7]) rows[2][x] = "B";
    return rows.map((row) => row.join(""));
  }

  function missionSeven(base, p) {
    const targets = [
      { id: "north-a", label: "北侧 A", x: 3, y: 1 }, { id: "north-b", label: "北侧 B", x: 5, y: 1 },
      { id: "east-a", label: "东侧 A", x: 7, y: 2 }, { id: "east-b", label: "东侧 B", x: 7, y: 4 },
      { id: "south-a", label: "南侧 A", x: 5, y: 5 }, { id: "south-b", label: "南侧 B", x: 3, y: 5 }
    ];
    const obstacleChoices = [
      { id: "rock-33", label: "中央岩石", x: 3, y: 3 }, { id: "rock-43", label: "中央右侧", x: 4, y: 3 },
      { id: "rock-52", label: "东北岩石", x: 5, y: 2 }, { id: "rock-54", label: "东南岩石", x: 5, y: 4 }
    ];
    const independent = p.phase === "challenge", repairing = p.phase === "repair";
    let target = targets.find((item) => item.id === p.designerTarget) || targets[0];
    let walls = obstacleChoices.filter((item) => p.obstacles.includes(item.id) && item.id !== target.id);
    let grid;
    let repairKind = "";
    if (repairing && p.variant % 2 === 0) {
      target = { id: "limit-case", label: "限步案例", x: 6, y: 3 };
      walls = [];
      grid = makeGrid(9, 7, { x: 1, y: 3 }, [target], walls);
      repairKind = "limit";
    } else if (repairing) {
      target = { id: "sealed-case", label: "围住案例", x: 1, y: 1 };
      walls = p.ruleFixed ? [{ x: 2, y: 1 }] : [{ x: 2, y: 1 }, { x: 1, y: 2 }];
      grid = makeGrid(9, 7, { x: 5, y: 4 }, [target], walls);
      repairKind = "sealed";
    } else {
      grid = makeGrid(9, 7, { x: 1, y: 3 }, [target], walls);
    }
    const fixedGrid = repairKind === "sealed" ? makeGrid(9, 7, { x: 5, y: 4 }, [target], [{ x: 2, y: 1 }]) : grid;
    const solution = shortestProgram(fixedGrid, "E", target);
    const ruleLimit = repairKind === "limit" && !p.ruleFixed
      ? Math.max(1, solution.length - 1)
      : solution.length + (p.actionLimit === "roomy" || p.ruleRevised ? 3 : 0);
    const faulty = independent && solution.length
      ? [solution[0] === "left" ? "right" : "left", ...solution.slice(1)]
      : solution.slice();
    return { ...base, grid, startDir: "E", solution, limit: Math.max(ruleLimit, 1), required: 1,
      allowed: ["move", "left", "right", "collect"], lessonMode: "v16-route-designer", starterProgram: undefined,
      target: "设计一关，并用自己的程序证明它能通关。", objective: "设计一关，并用自己的程序证明它能通关。",
      early: { independent, repairing, key: repairing ? `repair-${p.variant}` : `${p.phase}-${p.variant}-${target.id}-${walls.map((x) => x.id || `${x.x}-${x.y}`).join(".")}-${ruleLimit}`,
        goal: "设计一关，并用自己的程序证明它能通关。", rule: "先定目标与限制，再用真实运行交出作者解。",
        title: independent ? "内置试玩 · 找到失败方案" : repairing ? `坏规则诊所 · ${repairKind === "limit" ? "上限少一步" : "目标被围住"}` : "路线设计台",
        phaseLabels: ["设计并验证", "修正坏规则", "内置试玩"], targets: [target], designerTargets: targets, obstacleChoices,
        selectedTarget: target, selectedWalls: walls, ruleLimit, repairKind, ruleFixed: p.ruleFixed, ruleRevised: p.ruleRevised,
        prediction: { prompt: "这套规则经过作者验证了吗？", options: ["等待验证"], answer: "等待验证" }, prerequisite: null,
        faulty, mainStarter: independent ? faulty : repairing ? solution : [], faultStep: 0,
        diagnosisOptions: repairKind === "limit" ? ["程序写错了", "动作上限少一步", "信标不能采集"] : ["目标被规则围住", "程序缺少上传", "起点朝向错误"],
        diagnosisAnswer: repairKind === "limit" ? "动作上限少一步" : "目标被规则围住",
        reflectionPrompt: independent ? "这个失败方案违反了哪条规则？你改了什么？" : repairing ? "你修的是程序，还是题目规则？" : "你的目标、限制和作者解怎样互相配合？",
        intro: "可解不是一句保证：作者解必须在当前目标、障碍和动作上限下真实运行成功。",
        hints: ["先选离起点不太远的目标，再只放一块岩石。", "如果程序差一步，检查上限；如果怎样都到不了，检查规则是否堵死目标。", `局部示例：当前作者解需要 ${solution.length || "若干"} 个动作。`],
        successPath: pathFor(fixedGrid, "E", solution) }
    };
  }

  function missionEight(base, p) {
    const independent = p.phase === "challenge", repairing = p.phase === "repair";
    let grid, startDir, solution, faulty, required, requiresUpload = false, targets, faultStep = 0;
    if (!repairing && !independent) {
      grid = ["___________", "_SgBggggg__", "_ggggg#gg__", "_ggggBggg__", "_gggggggg__", "_gggggggR__", "___________"];
      startDir = "E";
      solution = ["move", "move", "collect", "move", "move", "right", "move", "move", "collect", "left", "move", "move", "move", "right", "move", "move", "upload"];
      faulty = solution.slice(); required = 2; requiresUpload = true;
    } else if (repairing) {
      grid = ["_________", "_gggggg__", "_Sgg#gg__", "_ggggBg__", "_gggggg__", "_________"];
      startDir = "E";
      solution = ["move", "move", "right", "move", "left", "move", "move", "collect"];
      faulty = solution.slice(); faultStep = 3; faulty[faultStep - 1] = "left"; required = 1;
    } else {
      grid = ["_________", "_gggggg__", "_Bgg#gg__", "_gggggg__", "_gg#ggg__", "_Sggggg__", "_________"];
      startDir = ["N", "E", "W"][p.variant % 3];
      solution = shortestProgram(grid, startDir, { x: 1, y: 2 });
      faulty = solution.slice(); required = 1;
    }
    targets = [];
    grid.forEach((row, y) => [...row].forEach((tile, x) => { if (tile === "B") targets.push({ x, y, label: `信标 ${String.fromCharCode(65 + targets.length)}` }); }));
    return { ...base, grid, startDir, solution, limit: solution.length + 3, required,
      allowed: ["move", "left", "right", "collect", ...(requiresUpload ? ["upload"] : [])], lessonMode: "v16-capstone", starterProgram: undefined,
      target: "独立完成救援，留下你的办法。", objective: "独立完成救援，留下你的办法。",
      early: { independent, repairing, key: `${p.phase}-${p.variant}`, goal: "独立完成救援，留下你的办法。",
        rule: independent ? "目标变了，重新规划；不要照搬上一张图。" : repairing ? "从第一次偏离开始修，不只看撞墙的位置。" : "按 A → B 收齐信号，再到中继站上传。",
        title: independent ? `独立迁移 · 任务 ${p.variant + 1}` : repairing ? `调试修复 · 案例 ${p.variant + 1}` : "分段救援",
        phaseLabels: ["分段救援", "调试修复", "独立迁移"], targets, prediction: independent
          ? { prompt: `起点朝${labels[startDir]}，第一步该先做什么？`, options: ["前进", "左转", "右转"], answer: ({ move: "前进", left: "左转", right: "右转" })[solution[0]] }
          : { prompt: "上传前要满足什么？", options: ["收齐 A、B", "到过中继站", "只收 A"], answer: "收齐 A、B" },
        prerequisite: null, faulty, mainStarter: repairing ? faulty : [], faultStep, requiredTargetOrder: !repairing && !independent,
        requiresUpload, diagnosisOptions: repairing ? faulty.map((command, index) => `${index + 1}. ${command}`) : [], diagnosisAnswer: String(faultStep),
        reflectionPrompt: independent ? "哪一处变化让你必须重新规划？" : repairing ? "你修改了哪一步？证据是什么？" : "你把任务分成了哪三段？",
        intro: "阶段作品不增加新动作；它检查你能否把顺序、方向、规划和调试带到陌生任务。",
        hints: [repairing ? "先运行问题程序，记录停止前的朝向。" : "先找 A、B 和中继站，再分三段。", repairing ? "比较第 3 步前后的朝向。" : "每段结束都检查携带状态。", `局部示例：参考程序从 ${solution.slice(0, 2).join(" → ")} 开始。`],
        successPath: pathFor(grid, startDir, solution) }
    };
  }

  function missionFunction(base, p) {
    const n = base.lessonNo, independent = p.phase === "challenge", repairing = p.phase === "repair";
    const correctFunction = ["right", "move", "collect", "right", "right", "move", "right"];
    const rotated = n === 10 && independent;
    const spaced = n === 9 && independent;
    const grid = functionGrid(rotated, spaced);
    const startDir = rotated ? "S" : "E";
    const distances = spaced ? [1, 3, 3] : [2, 2, 2];
    const main = distances.flatMap((distance) => [...Array(distance).fill("move"), "callRoute"]);
    let mainStarter = [], functionStarter = [];
    let faulty = main.slice(), faultyFunction = correctFunction.slice();
    if (n === 9 && repairing) {
      faulty = main.filter((_, index) => index !== distances[0] + 1 + distances[1]);
      mainStarter = faulty.slice(); functionStarter = correctFunction.slice();
    } else if (n === 9 && independent) {
      functionStarter = p.savedFunction.length ? p.savedFunction.slice() : correctFunction.slice();
    } else if (n === 10 && !independent) {
      faultyFunction = correctFunction.slice(0, -1);
      mainStarter = main.slice(); functionStarter = repairing && p.variant % 2 ? ["left", ...correctFunction.slice(1)] : faultyFunction.slice();
    } else if (n === 10) {
      mainStarter = []; functionStarter = p.savedFunction.length ? p.savedFunction.slice() : correctFunction.slice();
    }
    const diagnosisOptions = n === 9
      ? ["第一个支路漏调用", "第二个支路漏调用", "第三个支路漏调用"]
      : ["函数结束时位置变了", "函数结束时朝向不一致", "主程序移动次数太多"];
    const diagnosisAnswer = n === 9 ? "第二个支路漏调用" : "函数结束时朝向不一致";
    return { ...base, grid, startDir, solution: main, solutionFn: correctFunction, functionEnabled: true, energy: 32,
      limit: 12, functionLimit: 7, required: 3, allowed: ["move", "left", "right", "collect", "callRoute"],
      lessonMode: n === 9 ? "v16-function-toolbox" : "v16-function-contract", starterProgram: undefined,
      target: n === 9 ? "把同一套动作做成一个工具。" : "修好工具，让它每次都可靠。",
      objective: n === 9 ? "把同一套动作做成一个工具。" : "修好工具，让它每次都可靠。",
      early: { independent, repairing, key: `${p.phase}-${p.variant}`, goal: n === 9 ? "把同一套动作做成一个工具。" : "修好工具，让它每次都可靠。",
        rule: n === 9 ? "定义只是在工具箱里写好；主程序调用时，动作才会发生。" : "每次调用都要从约定状态开始，并回到同样的位置和朝向。",
        title: n === 9 ? (independent ? "间距迁移" : repairing ? "补齐调用" : "visit_side() 工具箱") : (independent ? "旋转迁移" : repairing ? "再次检查约定" : "起止状态检查"),
        phaseLabels: n === 9 ? ["定义并调用", "补齐调用", "间距迁移"] : ["检查起止", "再次修复", "旋转迁移"],
        prediction: { prompt: "", options: [], answer: "" }, prerequisite: null,
        faulty, faultyFunction, mainStarter, functionStarter, diagnosisOptions, diagnosisAnswer,
        faultStep: 0, targets: [],
        reflectionPrompt: n === 9 ? "定义和调用分别做了什么？" : "你怎样确认函数离开时恢复了约定状态？",
        intro: n === 9 ? "函数把一组完整动作命名；修改函数内部，会同时影响每一次调用。" : "可靠工具必须有稳定的入口和出口；一次成功不能证明后面的调用也可靠。",
        hints: n === 9
          ? ["先在 visit_side() 中写进支路、采集、返回和恢复朝向。", "主程序只负责走到入口并调用，不要复制函数体。", "局部示例：visit_side() 的第一步是向右转。"]
          : ["打开调用状态，先比较位置，再比较朝向。", "补丁应该放在函数内部，不能只修某一个调用点。", "局部示例：返回入口后，还需要恢复进入前的朝向。"],
        successPath: [] }
    };
  }

  function segmentLine(distances) {
    const width = distances.reduce((sum, value) => sum + value, 0) + 3;
    const row = Array(width).fill("g");
    row[0] = "_"; row[width - 1] = "_"; row[1] = "S";
    let x = 1;
    distances.forEach((distance, index) => {
      x += distance;
      row[x] = index === distances.length - 1 ? "R" : "B";
    });
    return ["_".repeat(width), row.join(""), "_".repeat(width)];
  }

  function missionSix(base, p) {
    const independent = p.phase === "challenge", repairing = p.phase === "repair";
    const distances = independent ? [[1, 3, 2], [3, 1, 3], [2, 3, 1]][p.variant % 3]
      : repairing ? [2, 3, 2] : [2, 2, 2];
    const grid = segmentLine(distances);
    const solution = distances.flatMap((distance, index) => [
      ...Array(distance).fill("move"),
      index === distances.length - 1 ? "upload" : "collect"
    ]);
    const firstSegmentEnd = distances[0];
    const faulty = repairing
      ? [...Array(distances[0]).fill("move"), "collect", "upload", ...solution.slice(firstSegmentEnd + 1)]
      : solution.slice();
    const targets = [];
    grid.forEach((row, y) => [...row].forEach((tile, x) => {
      if (tile === "B") targets.push({ x, y, label: `信标 ${String.fromCharCode(65 + targets.length)}` });
    }));
    return { ...base, grid, startDir: "E", solution, limit: solution.length + 2, required: 2,
      allowed: ["move", "collect", "upload"], lessonMode: "v16-segment-rescue", starterProgram: undefined,
      target: "按 A → B → 中继站完成三段救援。", objective: "按 A → B → 中继站完成三段救援。",
      early: { independent, repairing, key: `${p.phase}-${p.variant}`, goal: "按 A → B → 中继站完成三段救援。",
        rule: "upload() 只能在 A、B 都已采集并到达中继站后执行。",
        title: independent ? `三段迁移 · 路线 ${p.variant + 1}` : repairing ? "过早上传调试" : "A → B → 上传",
        phaseLabels: ["分段执行", "修复过早上传", "改变三段距离"],
        prediction: { prompt: "什么时候可以上传？", options: ["采集 A 后", "收齐 A、B 并到中继站", "一到中继站"], answer: "收齐 A、B 并到中继站" },
        prerequisite: null, faulty, mainStarter: repairing ? faulty : [], faultStep: distances[0] + 2,
        targets, requiredTargetOrder: true, requiresUpload: true,
        diagnosisOptions: faulty.map((command, index) => `${index + 1}. ${command}`), diagnosisAnswer: String(distances[0] + 2),
        reflectionPrompt: "你用哪三个检查点确认任务顺序没有乱？",
        intro: "复杂任务先切成小段：到 A 并采集、到 B 并采集、到中继站上传。每段结束都检查携带状态。",
        hints: ["先只找 A、B 和中继站的位置。", "upload() 之前应能在轨迹里看到两次成功 collect()。", `局部示例：第一段先执行 ${distances[0]} 次前进，再采集 A。`],
        successPath: pathFor(grid, "E", solution) }
    };
  }

  function loopLine(count, stepSize, collectInside) {
    const distance = count * stepSize;
    const width = distance + 4;
    const row = Array(width).fill("g");
    row[0] = "_"; row[width - 1] = "_"; row[1] = "S";
    if (collectInside) {
      for (let index = 1; index <= count; index += 1) row[1 + index * stepSize] = "B";
    } else {
      row[1 + distance] = "B";
    }
    return ["_".repeat(width), row.join(""), "_".repeat(width)];
  }

  function missionLoop(base, p) {
    const n = base.lessonNo, independent = p.phase === "challenge", repairing = p.phase === "repair";
    const expectedCount = n === 11 ? (independent ? 4 : repairing ? 2 : 3) : (independent ? 2 + (p.variant % 3) : repairing ? 3 : 4);
    const collectInside = n === 11;
    const grid = loopLine(expectedCount, n === 11 ? 2 : 1, collectInside);
    const solutionFn = n === 11 ? ["move", "move", "collect"] : ["move"];
    const solution = n === 11 ? ["callRoute"] : ["callRoute", "collect"];
    const faultyFunction = n === 11 ? ["move", "move"] : ["move", "collect"];
    const faulty = solution.slice();
    const targets = [];
    grid.forEach((row, y) => [...row].forEach((tile, x) => { if (tile === "B") targets.push({ x, y, label: `信标 ${targets.length + 1}` }); }));
    return { ...base, grid, startDir: "E", solution, solutionFn, functionEnabled: true,
      energy: 24, required: collectInside ? expectedCount : 1, limit: 4, functionLimit: 4,
      allowed: ["move", "collect", "callRoute"], lessonMode: n === 11 ? "v16-loop-unit" : "v16-loop-boundary", starterProgram: undefined,
      target: n === 11 ? "把完整重复单元放进循环体。" : "让缩进准确表示循环边界。",
      objective: n === 11 ? "把完整重复单元放进循环体。" : "让缩进准确表示循环边界。",
      early: { independent, repairing, key: `${p.phase}-${p.variant}-${p.loopCount || 0}`, goal: n === 11 ? "把“前进两格再采集”整体重复。" : "判断 collect() 应在循环内还是循环外。",
        rule: n === 11 ? "循环体必须是一组完整动作；次数只决定这组动作重复几次。" : "缩进在循环内的动作每轮执行；退出缩进后只执行一次。",
        title: independent ? `循环迁移 · ${expectedCount} 轮` : repairing ? "循环体调试" : n === 11 ? "完整重复单元" : "缩进边界实验",
        phaseLabels: n === 11 ? ["找出重复单元", "补回漏掉的采集", "改变循环次数"] : ["比较循环内外", "修复错误缩进", "改变终点距离"],
        prediction: { prompt: `这张图需要重复几轮？`, options: ["2", "3", "4"], answer: String(expectedCount) }, prerequisite: null,
        faulty, faultyFunction, mainStarter: repairing ? faulty : solution, functionStarter: repairing ? faultyFunction : [], faultStep: 0,
        loopCountOptions: [2, 3, 4], expectedLoopCount: expectedCount, expectedBoundary: n === 11 ? "inside" : "outside", targets,
        diagnosisOptions: n === 11 ? ["循环次数太少", "循环体漏了 collect()", "主程序不该调用循环"] : ["collect() 应在循环内", "collect() 应在循环外", "move() 不该重复"],
        diagnosisAnswer: n === 11 ? "循环体漏了 collect()" : "collect() 应在循环外",
        reflectionPrompt: n === 11 ? "为什么 collect() 属于这个重复单元？" : "你怎样从执行次数判断缩进边界？",
        intro: n === 11 ? "循环不是把单个动作变魔术；它会按次数展开循环体里的每一个真实动作。" : "同一行代码放在缩进内外，执行次数会完全不同。",
        hints: [n === 11 ? "先圈出第一次从起点到采集完成的全部动作。" : "先数目标只有一座还是每轮都有一座。", n === 11 ? "每一轮结束都应看到一次 collect()。" : "最终目标只采集一次，所以 collect() 应退出缩进。", `局部示例：本场循环次数是 ${expectedCount}。`],
        successPath: pathFor(grid, "E", Array(expectedCount).fill(solutionFn).flat()) }
    };
  }

  function missionSevenToTen(base, p) {
    if (base.lessonNo === 7) return missionSeven(base, p);
    if (base.lessonNo === 8) return missionEight(base, p);
    return missionFunction(base, p);
  }

  function mission(base, p) {
    if (!isEarly(base)) return base;
    if (base.lessonNo === 6) return missionSix(base, p);
    if (base.lessonNo >= 11) return missionLoop(base, p);
    if (base.lessonNo >= 7) return missionSevenToTen(base, p);
    const n = base.lessonNo, independent = p.phase === "challenge", repairing = p.phase === "repair", variant = p.variant;
    let grid = base.grid, startDir = base.startDir, solution = base.solution, limit = base.limit + 2;
    let routeChoices = base.routeChoices;
    if ((independent || repairing) && n === 1) {
      const distance = variant + (repairing ? 1 : 4);
      grid = floor(9, 5, [1, 2], [1 + distance, 2]);
      solution = [...Array(distance).fill("move"), "collect"];
      limit = distance + 3;
    }
    if ((independent || repairing) && n === 2) {
      grid = rotate(base.grid, variant + 1);
      startDir = directions[(directions.indexOf(base.startDir) + variant + 1) % 4];
      if (repairing) {
        grid = grid.map(row => [...row].reverse().join(""));
        startDir = ({ E: "W", W: "E", N: "N", S: "S" })[startDir];
        solution = solution.map(c => c === "left" ? "right" : c === "right" ? "left" : c);
      }
      limit = 10;
    }
    if ((independent || repairing) && n === 3) {
      grid = rotate(repairing ? floor(8, 7, [1, 3], [4, 3], [[2, 3]]) : floor(7, 6, [1, 2], [3, 2], [[2, 2]]), variant);
      startDir = directions[(1 + variant) % 4];
      routeChoices = [
        { id: "upper", label: "路线 A · 先左转", summary: "先左转绕过岩石，再转向信标并采集。", commands: ["left", "move", "right", "move", "move", "right", "move", "collect"] },
        { id: "lower", label: "路线 B · 先右转", summary: "先右转绕过岩石，再转向信标并采集。", commands: ["right", "move", "left", "move", "move", "left", "move", "collect"] }
      ].map((route) => ({ ...route, commands: repairing ? [...route.commands.slice(0, 5), "move", ...route.commands.slice(5)] : route.commands, label: route.id === "upper" ? "路线 A · 先左转" : "路线 B · 先右转", moves: repairing ? 9 : 8, turns: 3, risk: "需留意最后一次转向" }));
      solution = routeChoices[0].commands;
      limit = 12;
    }
    if (n >= 4 && independent) {
      // A changed target requires a changed program, not just replaying the repair solution.
      const row = n === 4 ? 3 : 4, from = n === 4 ? 2 : 5;
      grid = grid.map((line, y) => y === row ? [...line].map((tile, x) => x === from ? "g" : x === from + 1 ? "B" : tile).join("") : line);
      solution = [...solution.slice(0, -1), "move", "collect"];
    }
    if (n >= 4 && (independent || repairing)) {
      const turns = independent ? variant + 1 : variant;
      grid = rotate(grid, turns);
      startDir = directions[(directions.indexOf(base.startDir) + turns) % 4];
    }
    routeChoices = routeChoices?.map((route) => ({
      ...route,
      ...(n === 3 ? { summary: route.id === "direct" ? "直走到信标" : route.id === "detour" ? "绕行到信标" : route.summary } : {}),
      path: pathFor(grid, startDir, route.commands)
    }));
    const rightDirection = directions[(directions.indexOf(startDir) + 1) % 4];
    const distance = solution.filter((x) => x === "move").length;
    const prediction = n === 1
      ? { prompt: "到信标要前进几格？", options: ["1", "2", "3", "4", "5", "6"], answer: String(distance) }
      : n === 2
        ? { prompt: `现在朝${labels[startDir]}，右转后朝哪？`, options: ["北", "东", "南", "西"], answer: labels[rightDirection] }
        : n === 4 ? { prompt: `现在朝${labels[startDir]}，右转后朝哪？`, options: ["北", "东", "南", "西"], answer: labels[rightDirection] }
        : n === 5 ? { prompt: "前进一格后，坐标是多少？", options: [], answer: "" }
        : { prompt: "这条路线有几条指令？", options: ["3", "5", "8", "10"], answer: String(routeChoices.find((r) => r.id === p.plan)?.moves || "") };
    const targets = [];
    let pos = pathFor(grid, startDir, [])[0], dir = startDir;
    for (const c of solution) {
      if (c === "left" || c === "right") dir = directions[(directions.indexOf(dir) + (c === "left" ? 3 : 1)) % 4];
      if (c === "move") pos = { x: pos.x + vectors[dir][0], y: pos.y + vectors[dir][1] };
      if (c === "collect") targets.push({ ...pos, label: `信标 ${String.fromCharCode(65 + targets.length)}` });
    }
    if (n === 5) {
      const start = pathFor(grid, startDir, [])[0];
      const a = { x: start.x + vectors[startDir][0], y: start.y + vectors[startDir][1] }, b = targets[0];
      prediction.answer = `(${a.x}, ${a.y})`;
      prediction.options = [...new Set([prediction.answer, `(${a.y}, ${a.x})`, `(${b.x}, ${b.y})`, `(${a.x + 1}, ${a.y})`])];
    }
    const faulty = solution.slice();
    const faultIndex = n === 1 ? 0 : n === 2 ? 0 : n === 3 ? 2 : n === 4 ? 3 : 1;
    faulty[faultIndex] = n === 1 || n === 5 ? "collect" : n === 2 ? (solution[0] === "left" ? "right" : "left") : n === 3 ? "left" : "right";
    const goals = [
      "让 Neo 到达信标并采集。",
      "转弯到达信标并采集。",
      "选一条路线，把它编成程序。",
      "找出第一处错误并修好程序。",
      "按顺序采集 A、B 两座信标。"
    ];
    const reflectionPrompts = [
      "你把采集放在哪一步？为什么？",
      "你改了哪次转向？为什么？",
      "换图后，你改了哪一段？",
      "最早出错的是哪一步？",
      "哪些移动改变 x？哪些改变 y？"
    ];
    const prerequisite = n === 1 ? null : n === 2
      ? { prompt: "什么时候采集？", options: ["到达信标后", "到达信标前"], answer: "到达信标后" }
      : { prompt: "朝东右转后，朝哪里？", options: ["南", "北", "位置也向右移动一格"], answer: "南" };
    return { ...base, grid, startDir, solution, limit, routeChoices,
      lessonMode: "thinking-lab", starterProgram: undefined, coordinateTargets: targets,
      target: goals[n - 1], objective: goals[n - 1],
      early: { independent, repairing, key: `${p.phase}-${variant}`, prediction, prerequisite,
        goal: goals[n - 1], reflectionPrompt: reflectionPrompts[n - 1],
        faulty, faultStep: faultIndex + 1, targets,
        repairGoal: n === 3 ? "修好路线 A。" : "找出最早的错误并修好。",
        successPath: pathFor(grid, startDir, solution),
        title: independent ? `换图验证 · 地图 ${variant + 1}` : repairing ? `修复程序 · 案例 ${variant + 1}` : "构造程序",
        intro: [
          "程序从上到下执行。站在信标格才能采集。",
          "转向只改朝向，不改位置。镜头方向不等于角色方向。",
          "先选路线，再排指令。运行后对照计划检查。",
          "从第一步开始查。报错的位置不一定是最早出错的位置。",
          "坐标写作 (x, y)。向东 x 增加，向南 y 增加。"
        ][n - 1],
        hints: [
          n === 1 ? "起点所在格不算一次前进。" : n === 2 ? "看罗盘，不看屏幕左右。" : n === 4 ? "从第一步开始检查朝向。" : n === 5 ? "坐标先写 x，再写 y。" : "转向、前进、采集都算一条指令。",
          n === 1 ? "到达信标后，再执行采集。" : n === 2 ? "每次转向后，先确认朝向。" : n === 4 ? "撞墙前的转向可能已经错了。" : n === 5 ? "向东 x 加 1，向南 y 加 1。" : "沿路线逐格检查指令。",
          `局部示例：参考程序的前两条是 ${solution.slice(0, 2).map((x) => ({ move: "前进", left: "左转", right: "右转", collect: "采集" })[x]).join(" → ")}。其余步骤请自己完成。`
        ] }
    };
  }

  function canRun(m, p, hasPrerequisite = false) {
    if (m.lessonNo === 7) {
      if (p.phase === "guided" && !p.designerTarget) return "请先完成上方第 1 项：选择一座信标。";
      if (p.phase === "repair" && p.debugObservation && !p.ruleDiagnosis) return "请先完成上方的“失败来自哪里？”判断。";
      if (p.phase === "repair" && p.debugObservation && !p.ruleFixed) return "你的判断已记录；现在修正规则再运行。";
      if (p.phase === "challenge" && !p.ruleRevised && p.playtestObservation) return "先说明失败违反哪条规则，再修改一次规则。";
      return "";
    }
    if ([9, 10].includes(m.lessonNo)) return "";
    if ([11, 12].includes(m.lessonNo)) {
      if (Number(p.loopCount) !== Number(m.early.expectedLoopCount)) return `请先选择本场需要的 ${m.early.expectedLoopCount} 轮。`;
      if (p.loopBoundary !== m.early.expectedBoundary) return "请先判断 collect() 应在循环内还是循环外。";
      return "";
    }
    if (m.early.repairing) return "";
    if (m.early.prerequisite && !hasPrerequisite && p.prerequisite !== m.early.prerequisite.answer) return `请先完成上方的“${m.early.prerequisite.prompt}”选择题。`;
    if (m.lessonNo === 3 && !m.routeChoices.some((r) => r.id === p.plan)) return "请先在上方选择一条路线。";
    if (m.lessonNo === 3 && !reasons.includes(p.reason)) return "请先在上方选择这条路线的理由。";
    if (!m.early.prediction.options.includes(p.prediction)) return `请先完成上方的“${m.early.prediction.prompt}”预测。`;
    return "";
  }

  function result(m, p, run) {
    const planned = m.routeChoices?.find((r) => r.id === run.plan) || (m.early.repairing ? m.routeChoices?.[0] : null);
    const actual = m.routeChoices?.find((r) => JSON.stringify(r.path) === JSON.stringify(run.path));
    const expected = planned?.path || [];
    let divergence = null;
    if (planned) {
      const length = Math.max(expected.length, run.path.length);
      for (let i = 0; i < length; i += 1) {
        if (JSON.stringify(expected[i]) !== JSON.stringify(run.path[i])) { divergence = i; break; }
      }
    }
    const snapshots = Array.isArray(run.callSnapshots) ? run.callSnapshots : [];
    const stableCalls = snapshots.filter((item) => item.before && item.after && item.before.x === item.after.x
      && item.before.y === item.after.y && item.before.dir === item.after.dir);
    const callPlaces = new Set(snapshots.filter((item) => item.before).map((item) => `${item.before.x},${item.before.y}`));
    const conceptSuccess = m.lessonNo === 7
      ? run.program.length <= m.early.ruleLimit && run.success
      : m.lessonNo === 9
        ? run.success && snapshots.length >= 2 && callPlaces.size >= 2 && run.routeProgram.includes("collect")
        : m.lessonNo === 10
          ? run.success && snapshots.length >= 2 && stableCalls.length === snapshots.length && callPlaces.size >= 2
          : m.lessonNo === 11
            ? run.success && Number(run.loopCount) === Number(m.early.expectedLoopCount)
              && run.program.filter((item) => item === "callRoute").length === 1
              && run.routeProgram.join(",") === "move,move,collect"
          : m.lessonNo === 12
            ? run.success && Number(run.loopCount) === Number(m.early.expectedLoopCount)
              && run.loopBoundary === "outside" && !run.routeProgram.includes("collect")
              && run.program.at(-1) === "collect"
          : run.success;
    const diagnosisAnswer = m.early.diagnosisAnswer ?? String(m.early.faultStep);
    const targetOrderRequired = m.lessonNo === 5 || m.early.requiredTargetOrder;
    const targetOrderCorrect = !targetOrderRequired || (() => {
      const collected = run.trace.filter(t => t.command === "collect" && !t.failed);
      return collected.length === m.early.targets.length && collected.every((t, i) => t.x === m.early.targets[i].x && t.y === m.early.targets[i].y);
    })();
    let failure = run.failure || "";
    if (m.lessonNo === 7 && run.success && run.program.length > m.early.ruleLimit) failure = `作者解用了 ${run.program.length} 个动作，超过上限 ${m.early.ruleLimit}`;
    if (m.lessonNo === 9 && run.success && !conceptSuccess) failure = "世界结果正确，但还没有证明同一函数在两个位置真实调用";
    if (m.lessonNo === 10 && run.success && !conceptSuccess) failure = "世界结果正确，但函数的起止状态还没有全部满足约定";
    if (m.lessonNo === 11 && run.success && !conceptSuccess) failure = "世界结果正确，但还没有证明完整重复单元由循环真实展开";
    if (m.lessonNo === 12 && run.success && !conceptSuccess) failure = "世界结果正确，但 collect() 的循环边界还没有放对";
    if (run.success && !targetOrderCorrect) failure = "信标都采集到了，但顺序与任务要求不一致";
    const validatedSuccess = conceptSuccess && targetOrderCorrect;
    return { ...copy(run), success: validatedSuccess, failure, challengeKey: m.early.key, independent: m.early.independent,
      lessonNo: m.lessonNo, phase: p.phase, assisted: Boolean(run.assisted), predictionCorrect: [7, 11, 12].includes(m.lessonNo) || !m.early.prediction.options.length || run.prediction === m.early.prediction.answer,
      actualRoute: actual?.id || "custom", routeMatches: !planned || divergence === null,
      diagnosisCorrect: String(run.diagnosis || p.ruleDiagnosis) === String(diagnosisAnswer),
      isFaulty: JSON.stringify(run.program) === JSON.stringify(m.early.faulty)
        && (m.lessonNo < 9 || JSON.stringify(run.routeProgram) === JSON.stringify(m.early.faultyFunction)),
      targetOrderCorrect, reuseValid: m.lessonNo !== 9 || validatedSuccess, contractValid: m.lessonNo !== 10 || validatedSuccess,
      ruleValid: m.lessonNo !== 7 || validatedSuccess, stableCalls: stableCalls.length,
      divergence, plannedPath: expected, explanation: "", debug: "", reconciled: false,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, at: new Date().toISOString() };
  }

  function record(p, attempt) {
    p.attempts = [...p.attempts, attempt].slice(-6);
    if (attempt.phase === "repair" && !attempt.success && (attempt.isFaulty || attempt.lessonNo === 7 || attempt.lessonNo === 10)) p.debugObservation = copy(attempt);
    if (attempt.phase === "challenge" && !attempt.success) p.playtestObservation = copy(attempt);
    if (attempt.success) {
      p.completed = true;
      if (attempt.phase === "guided" && attempt.targetOrderCorrect && (attempt.lessonNo !== 10 || attempt.diagnosisCorrect)) {
        p.guidedComplete = true;
        p.guidedEvidence = copy(attempt);
      }
      if (attempt.phase === "repair" && (!attempt.isFaulty || attempt.lessonNo === 7) && attempt.diagnosisCorrect && !attempt.assisted
        && attempt.targetOrderCorrect && p.debugObservation?.challengeKey === attempt.challengeKey) {
        p.repairEvidence = { before: copy(p.debugObservation), after: copy(attempt), step: attempt.diagnosis };
      }
      if ([9, 10].includes(attempt.lessonNo) && attempt.routeProgram.length) p.savedFunction = commands(attempt.routeProgram);
    }
    return p;
  }

  function review(m, p, reflection, unused, reconciliation = null) {
    const attempt = p.attempts.at(-1);
    if (!attempt?.success || attempt.challengeKey !== m.early.key || !String(reflection || "").trim()) return false;
    attempt.reflection = String(reflection).trim().slice(0, 600);
    attempt.reflectionAssessment = "teacher-review";
    if (reconciliation && reasons.includes(reconciliation)) {
      attempt.reconciled = true;
      attempt.reconciliationReason = reconciliation;
    }
    if (attempt.phase === "guided" && attempt.targetOrderCorrect) p.guidedEvidence = copy(attempt);
    if (p.repairEvidence?.after.id === attempt.id) p.repairEvidence.after = copy(attempt);
    const challengeProof = m.lessonNo === 7 ? Boolean(p.ruleRevised && p.failureReason && p.playtestObservation) : true;
    if (p.guidedComplete && p.repairEvidence && attempt.independent && !attempt.assisted
      && attempt.predictionCorrect && attempt.targetOrderCorrect
      && challengeProof && (m.lessonNo !== 3 || attempt.routeMatches || attempt.reconciled)) {
      p.mastered = true;
      p.masteryEvidence = copy(attempt);
    }
    return true;
  }

  function switchChallenge(p, phase, next = false) {
    const variant = next ? (p.variant + 1) % 3 : p.variant;
    // Returning to the same challenge must not erase a reference/hint exposure.
    p.exposures = { ...(p.exposures || {}), [`${p.phase}-${p.variant}`]: { assisted: p.assisted, hintLevel: p.hintLevel } };
    const exposure = p.exposures[`${phase}-${variant}`] || {};
    Object.assign(p, { phase, variant, draft: [], functionDraft: [], initializedKey: "", prediction: "", plan: "", reason: "", loopCount: 0, loopBoundary: "",
      explanation: "", debug: "", diagnosis: "", reflection: "", reconciliation: "", ruleDiagnosis: "", failureReason: "",
      ruleFixed: false, ruleRevised: false, assisted: Boolean(exposure.assisted), hintLevel: exposure.hintLevel || 0 });
    return p;
  }

  function merge(local, remote) {
    if (![1, 2, 3, version].includes(remote?.version)) return profile(local);
    const a = profile(local), b = profile(remote);
    const latest = Date.parse(b.updatedAt) > Date.parse(a.updatedAt || "1970-01-01") ? b : a;
    const older = latest === a ? b : a;
    const attempts = [...new Map([...older.attempts, ...latest.attempts].map((r) => [r.id, r])).values()]
      .sort((x, y) => String(x.at).localeCompare(String(y.at))).slice(-6);
    const exposures = {};
    for (const key of new Set([...Object.keys(a.exposures || {}), ...Object.keys(b.exposures || {})])) {
      exposures[key] = { assisted: Boolean(a.exposures?.[key]?.assisted || b.exposures?.[key]?.assisted), hintLevel: Math.max(a.exposures?.[key]?.hintLevel || 0, b.exposures?.[key]?.hintLevel || 0) };
    }
    return { ...latest, attempts, exposures,
      assisted: Boolean(latest.assisted || exposures[`${latest.phase}-${latest.variant}`]?.assisted),
      guidedComplete: a.guidedComplete || b.guidedComplete, completed: a.completed || b.completed,
      mastered: a.mastered || b.mastered,
      legacyEvidence: latest.legacyEvidence || older.legacyEvidence,
      debugObservation: latest.debugObservation || older.debugObservation,
      playtestObservation: latest.playtestObservation || older.playtestObservation,
      repairEvidence: latest.repairEvidence || older.repairEvidence,
      guidedEvidence: latest.guidedEvidence || older.guidedEvidence,
      masteryEvidence: latest.masteryEvidence || older.masteryEvidence };
  }

  root.CodeQuestEarlyLessons = { version, reasons, labels, isEarly, profile, mission, canRun, result, record, review, switchChallenge, merge, pathFor, shortestProgram };
})(typeof globalThis !== "undefined" ? globalThis : window);
