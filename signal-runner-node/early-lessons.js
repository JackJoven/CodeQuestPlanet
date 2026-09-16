(function (root) {
  "use strict";
  const version = 6;
  const directions = ["N", "E", "S", "W"];
  const vectors = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
  const labels = { N: "北", E: "东", S: "南", W: "西" };
  const reasons = ["指令更少", "转弯更少", "我想练习转向"];
  const isEarly = (mission) => /^course-(?:0[1-9]|[12][0-9]|3[0-2])$/.test(mission?.id || "");
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const commands = (items) => Array.isArray(items) ? items.filter((x) => [
    "move", "left", "right", "back", "wait", "collect", "upload", "shield",
    "callRoute", "ifHazardShield", "ifWallRight", "ifSensorAct", "logicGuard",
    "whileBeacon", "whileRelay", "repeat2", "repeat3", "repeat4", "repeat5"
  ].includes(x)).slice(0, 32) : [];
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
      conditionSensor: ["hazard", "blocked", "clear"].includes(a.conditionSensor) ? a.conditionSensor : "",
      logicConnector: ["and", "or"].includes(a.logicConnector) ? a.logicConnector : "",
      logicHazardMode: ["not-hazard", "hazard"].includes(a.logicHazardMode) ? a.logicHazardMode : "",
      trace: a.trace.slice(0, 40).map((t) => ({ command: commands([t?.command])[0] || "move", x: integer(t?.x), y: integer(t?.y),
        dir: directions.includes(t?.dir) ? t.dir : "N", collected: integer(t?.collected), energy: integer(t?.energy), failed: t?.failed === true,
        condition: t?.condition && typeof t.condition === "object" ? copy(t.condition) : null })) };
  }

  function profile(saved) {
    const p = saved?.version === version ? copy(saved) : [2, 3, 4, 5].includes(saved?.version)
      ? copy(saved) : saved?.version === 1
        ? { legacyEvidence: copy(saved), completed: saved.completed === true, updatedAt: saved.updatedAt || "" } : {};
    return {
      version, phase: "guided", variant: 0, draft: [], prediction: "", plan: "", reason: "",
      prerequisite: "", explanation: "", debug: "", diagnosis: "", reflection: "", repairEvidence: null, debugObservation: null, hintLevel: 0, assisted: false,
      guidedComplete: false, completed: false, mastered: false, attempts: [], updatedAt: "", functionDraft: [], savedFunction: [], functionName: "visit_side", initializedKey: "",
      designerTarget: "", obstacles: [], actionLimit: "tight", ruleFixed: false, ruleRevised: false, ruleDiagnosis: "", failureReason: "",
      loopCount: 0, loopBoundary: "", conditionSensor: "", logicConnector: "", logicHazardMode: "",
      systemChoice: "", systemChoiceB: "",
      ...p,
      phase: ["challenge", "repair"].includes(p.phase) ? p.phase : "guided",
      variant: integer(p.variant) % 3,
      draft: commands(p.draft), functionDraft: commands(p.functionDraft), savedFunction: commands(p.savedFunction),
      functionName: /^[A-Za-z_][A-Za-z0-9_]{0,23}$/.test(p.functionName || "") ? p.functionName : "visit_side",
      obstacles: Array.isArray(p.obstacles) ? p.obstacles.filter((x) => typeof x === "string").slice(0, 2) : [],
      loopCount: Math.min(8, integer(p.loopCount)),
      loopBoundary: ["inside", "outside"].includes(p.loopBoundary) ? p.loopBoundary : "",
      conditionSensor: ["hazard", "blocked", "clear"].includes(p.conditionSensor) ? p.conditionSensor : "",
      logicConnector: ["and", "or"].includes(p.logicConnector) ? p.logicConnector : "",
      logicHazardMode: ["not-hazard", "hazard"].includes(p.logicHazardMode) ? p.logicHazardMode : "",
      systemChoice: typeof p.systemChoice === "string" ? p.systemChoice.slice(0, 80) : "",
      systemChoiceB: typeof p.systemChoiceB === "string" ? p.systemChoiceB.slice(0, 80) : "",
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

  const advancedLessonSpecs = {
    16: {
      goal: "组合条件、循环和上传规则，完成一套能适应地图变化的自动救援程序。",
      rule: "自动化不是把步骤写得更长，而是让每个模块只负责一种判断，并由状态决定停止。",
      phaseLabels: ["组装自动救援", "修复模块约定", "三图独立验证"],
      difficulty: "同时协调尖刺判断、状态循环与上传顺序",
      prompt: "主控制器应该怎样组织动作？",
      options: [["sense-first", "先判断，再循环", "先处理尖刺，再让 while 负责到达"], ["move-first", "先移动，再检查", "可能先进入尖刺"], ["always-shield", "每格都开盾", "浪费共享能量"]],
      correct: "sense-first", faulty: "move-first", scenarios: ["control", "control-b", "control-c"],
      flow: ["读取前方", "需要时开盾", "循环到宝石", "上传"],
      states: [["控制模块", "条件 + while"], ["停止依据", "当前位置"], ["能力门", "三项分别验证"]],
      requiredCommands: ["ifHazardShield", "whileBeacon", "whileRelay"],
      diagnosis: ["先移动破坏了模块约定", "宝石数量太少", "地图尺寸太大"], diagnosisAnswer: "先移动破坏了模块约定",
      reflection: "三个模块分别负责什么？它们为什么不能换成固定步数？"
    },
    17: {
      goal: "让计数器只记录真实发生的采集事件，并用它判断任务进度。",
      rule: "变量保存会变化的状态；只有成功采集后，计数器才增加。",
      phaseLabels: ["接上采集计数", "修复提前加一", "目标数量变化"],
      difficulty: "采集、重复采集与失败事件会产生不同计数结果",
      prompt: "什么时候更新 collected_count？",
      options: [["only-success", "成功采集后 +1", "事件发生后再更新"], ["before-collect", "采集前先 +1", "失败也会被算进去"], ["only-end", "到终点一次性填写", "过程状态丢失"]],
      correct: "only-success", faulty: "before-collect", scenarios: ["a", "b", "c"],
      flow: ["尝试采集", "确认成功", "计数 +1", "检查目标数"],
      states: [["collected_count", "随事件变化"], ["失败采集", "不增加"], ["重复采集", "不增加"]],
      diagnosis: ["计数发生在事件之前", "地图坐标写反", "循环少一轮"], diagnosisAnswer: "计数发生在事件之前",
      reflection: "为什么计数器必须在成功采集之后更新？"
    },
    18: {
      goal: "用同一本能量账本协调移动、开盾和补给，保留足够能量完成上传。",
      rule: "多个动作共享同一个能量状态；任何消耗和补给都必须立即写回。",
      phaseLabels: ["建立共享账本", "修复漏记护盾", "预算变化迁移"],
      difficulty: "移动、护盾和尖刺会同时改变同一资源",
      prompt: "能量应该怎样记录？",
      options: [["shared-ledger", "共用一份账本", "所有动作读写同一个 energy"], ["separate-ledgers", "每个动作各算各的", "总量会对不上"], ["check-at-end", "只在终点检查", "中途可能已经耗尽"]],
      correct: "shared-ledger", faulty: "separate-ledgers", scenarios: ["d", "d", "b"],
      flow: ["读取 energy", "扣除动作成本", "写回余额", "检查保留线"],
      states: [["移动", "−1"], ["护盾", "−1"], ["无盾尖刺", "额外 −4"]],
      requiredCommands: ["ifHazardShield"],
      diagnosis: ["护盾没有写回共享账本", "上传站方向错误", "计数器没有归零"], diagnosisAnswer: "护盾没有写回共享账本",
      reflection: "哪几个动作在修改同一个能量变量？"
    },
    19: {
      goal: "给路线工具设置输入槽，让同一函数服务不同距离和方向。",
      rule: "参数是调用时交给函数的输入，不应为每张地图复制一份函数。",
      phaseLabels: ["连接参数槽", "修复写死距离", "方向参数迁移"],
      difficulty: "同一工具会收到不同输入，但必须保持同一职责",
      prompt: "距离和方向应该从哪里进入函数？",
      options: [["input-slot", "从参数槽传入", "每次调用都可给不同值"], ["fixed-inside", "写死在函数里面", "换地图就失效"], ["copy-function", "复制多个同名工具", "难以维护"]],
      correct: "input-slot", faulty: "fixed-inside", scenarios: ["f", "f", "f"],
      flow: ["调用 route_a", "读取参数", "按输入移动", "回到主程序"],
      states: [["distance", "本次距离"], ["direction", "本次方向"], ["函数份数", "始终 1"]],
      requiredCommands: ["callRoute"], requireCallCount: 2,
      diagnosis: ["距离被写死在函数里", "宝石不能采集", "上传必须放进函数"], diagnosisAnswer: "距离被写死在函数里",
      reflection: "参数改变了什么？函数中哪些部分保持不变？"
    },
    20: {
      goal: "让函数返回的真假答案真正决定下一段路线。",
      rule: "返回值先回答问题，再由调用处根据答案选择动作。",
      phaseLabels: ["接通答案流", "修复只显示不用", "真假路线互换"],
      difficulty: "函数结果必须进入后续决策，不能只显示在面板上",
      prompt: "函数返回 safe 后，下一步怎么做？",
      options: [["use-return", "交给 if 决策", "True 前进，False 改道"], ["print-return", "只显示答案", "世界不会因此改变"], ["ignore-return", "继续固定路线", "返回值被丢弃"]],
      correct: "use-return", faulty: "print-return", scenarios: ["b", "a", "d"],
      flow: ["函数检查", "return safe", "if 接收", "选择路线"],
      states: [["返回值", "True / False"], ["使用位置", "调用处"], ["世界结果", "路线改变"]],
      diagnosis: ["返回值没有被调用处使用", "函数名太短", "地图缺少岩石"], diagnosisAnswer: "返回值没有被调用处使用",
      reflection: "返回值从哪里来，又流向了哪一个决定？"
    },
    21: {
      goal: "让任务清单决定宝石的处理顺序，清单变化后仍按新顺序执行。",
      rule: "列表保存一组有顺序的任务；程序读取列表，而不是把顺序写死。",
      phaseLabels: ["连接任务清单", "修复固定顺序", "重排目标迁移"],
      difficulty: "目标位置不变，但数据顺序改变会改变正确路线",
      prompt: "下一座宝石由什么决定？",
      options: [["follow-list", "读取清单第一项", "完成后再处理下一项"], ["nearest-first", "永远选最近的", "可能违反任务顺序"], ["fixed-order", "把 A→B 写死", "清单重排后失效"]],
      correct: "follow-list", faulty: "fixed-order", scenarios: ["c", "a", "b"],
      flow: ["读取 targets[0]", "完成目标", "移除已完成项", "读取下一项"],
      states: [["targets", "有序清单"], ["当前项", "第 0 项"], ["完成后", "清单缩短"]],
      diagnosis: ["路线没有读取清单顺序", "计数器多加一次", "函数没有返回"], diagnosisAnswer: "路线没有读取清单顺序",
      reflection: "清单重排后，程序为什么不需要重写整条路线？"
    },
    22: {
      goal: "处理会增删的目标清单，并让循环边界始终跟随真实长度。",
      rule: "列表变化后必须重新读取长度；旧索引可能越界，也可能漏掉新任务。",
      phaseLabels: ["同步长度边界", "修复旧索引", "增删混合迁移"],
      difficulty: "运行中增加或删除目标会改变合法索引范围",
      prompt: "清单变化后，循环上限取哪里？",
      options: [["live-length", "重新读取 len(targets)", "边界随真实数据变化"], ["old-length", "继续使用旧长度", "可能越界或漏项"], ["last-index", "只检查最后一项", "前面的任务被跳过"]],
      correct: "live-length", faulty: "old-length", scenarios: ["c", "b", "c"],
      flow: ["修改 targets", "读取新长度", "更新边界", "逐项处理"],
      states: [["新增", "长度 +1"], ["删除", "长度 −1"], ["合法索引", "0 到 len−1"]],
      diagnosis: ["循环还在使用旧长度", "参数名字重复", "护盾开启太早"], diagnosisAnswer: "循环还在使用旧长度",
      reflection: "为什么列表变化后必须重新读取长度？"
    },
    23: {
      goal: "用地形名字查到对应规则，让同一个处理器适应普通格和尖刺格。",
      rule: "字典把名字映射到规则；当前地形是什么，就查对应的键。",
      phaseLabels: ["连接规则字典", "修复查错键", "规则表换序"],
      difficulty: "规则表顺序变化，但名称与处理动作的对应关系不变",
      prompt: "Nova 应该怎样找到当前地形的处理规则？",
      options: [["lookup-current", "用当前地形名查找", "spike 会查到 shield"], ["first-rule", "总用第一条规则", "字典顺序变化会失效"], ["fixed-action", "始终直接 move", "尖刺规则被绕过"]],
      correct: "lookup-current", faulty: "first-rule", scenarios: ["d", "d", "a"],
      flow: ["读取 terrain", "rules[terrain]", "得到动作", "执行动作"],
      states: [["plain", "move"], ["spike", "shield"], ["键查找", "不依赖顺序"]],
      requiredCommands: ["ifHazardShield"],
      diagnosis: ["查找使用了错误的地形键", "列表长度太长", "等待次数不足"], diagnosisAnswer: "查找使用了错误的地形键",
      reflection: "为什么规则表换顺序后，按名字查找仍然有效？"
    },
    24: {
      goal: "让任务清单、规则表和库存状态共同驱动救援调度。",
      rule: "调度器先选任务，再查规则，最后确认库存；三项都满足才派发。",
      phaseLabels: ["组装调度器", "修复漏检库存", "多目标迁移"],
      difficulty: "三个数据源共同决定一个动作，缺一项都会产生错误派发",
      prompt: "调度器的第一步是什么？",
      options: [["queue-first", "先读取任务队列", "明确当前处理谁"], ["rule-first", "随便先取一条规则", "可能与任务不匹配"], ["route-first", "先出发再决定", "无法验证资源"]],
      correct: "queue-first", faulty: "route-first",
      secondary: { prompt: "派发前还必须检查什么？", options: [["check-inventory", "库存是否足够", "避免途中耗尽"], ["skip-inventory", "不看库存", "可能无法完成"], ["count-map", "只数地图格", "不能代表资源"]], correct: "check-inventory", faulty: "skip-inventory" },
      scenarios: ["c", "b", "c"], flow: ["读取队列", "查处理规则", "检查库存", "派发路线"],
      states: [["queue", "目标顺序"], ["rules", "处理办法"], ["inventory", "可用资源"]],
      diagnosis: ["派发前漏检了库存", "地图没有旋转", "函数参数太多"], diagnosisAnswer: "派发前漏检了库存",
      reflection: "调度决定依赖哪三份数据？"
    },
    25: {
      goal: "把二维表格中的行列位置对应到世界地图，并沿数据路线完成任务。",
      rule: "二维数据先找行 y，再找列 x；数据格与世界格必须指向同一位置。",
      phaseLabels: ["连接数据与地图", "修复行列颠倒", "非对称表格迁移"],
      difficulty: "非对称目标会暴露把 x、y 或行、列写反的问题",
      prompt: "读取 grid[y][x] 时先确定什么？",
      options: [["row-column", "先行 y，再列 x", "与 grid[y][x] 一致"], ["column-row", "先列 x，再行 y", "会落到镜像位置"], ["visual-guess", "只看画面猜", "数据变化后无法迁移"]],
      correct: "row-column", faulty: "column-row", scenarios: ["b", "a", "c"],
      flow: ["读取 y 行", "读取 x 列", "高亮数据格", "同步世界格"],
      states: [["数据索引", "grid[y][x]"], ["世界坐标", "(x, y)"], ["双向高亮", "同一格"]],
      diagnosis: ["行与列的顺序颠倒", "能量没有补满", "目标清单为空"], diagnosisAnswer: "行与列的顺序颠倒",
      reflection: "数据中的 grid[y][x] 怎样对应世界坐标 (x, y)？"
    },
    26: {
      goal: "修改施工数据，让桥面批量出现在正确位置，再用 Nova 验证路线。",
      rule: "建造结果来自数据表；修改数据后，世界中的整组桥格一起更新。",
      phaseLabels: ["生成桥面", "修复偏移一格", "桥长变化迁移"],
      difficulty: "一个数据错误会批量改变多格世界，并影响整条路线可行性",
      prompt: "桥面应该从哪里生成？",
      options: [["build-from-data", "遍历施工表生成", "每个数据格对应一个桥格"], ["place-one", "只手动放一格", "无法形成完整桥面"], ["copy-picture", "照着图片摆放", "数据变化不会同步"]],
      correct: "build-from-data", faulty: "place-one", scenarios: ["a", "b", "c"],
      flow: ["读取施工表", "逐格生成", "更新世界", "Nova 试玩"],
      states: [["施工数据", "桥格列表"], ["生成数量", "跟随列表"], ["验证方式", "真实运行"]],
      diagnosis: ["施工表只生成了一格", "字典查错键", "返回值没有打印"], diagnosisAnswer: "施工表只生成了一格",
      reflection: "为什么改一份施工数据会改变多块桥面？"
    },
    27: {
      goal: "根据任务需求选择合适的机器人，让能力与路线真正匹配。",
      rule: "对象有不同能力；先读任务，再把职责交给能完成它的对象。",
      phaseLabels: ["分配对象职责", "修复能力错配", "任务组合迁移"],
      difficulty: "机器人能力不对称，最近的对象不一定最合适",
      prompt: "怎样决定把任务交给谁？",
      options: [["match-capability", "匹配任务与能力", "飞行、护盾和运输各司其职"], ["nearest-agent", "总选最近的", "可能没有所需能力"], ["random-agent", "随机分配", "结果不可验证"]],
      correct: "match-capability", faulty: "nearest-agent", scenarios: ["b", "d", "c"],
      flow: ["读取任务", "比较能力", "分配对象", "执行并回报"],
      states: [["Nova", "地面采集"], ["Flyer", "跨越障碍"], ["Carrier", "运输上传"]],
      diagnosis: ["对象能力与任务不匹配", "列表索引从 1 开始", "等待时间太长"], diagnosisAnswer: "对象能力与任务不匹配",
      reflection: "你根据哪项能力决定了任务归属？"
    },
    28: {
      goal: "分别追踪两个同款机器人的位置和能量，避免状态互相覆盖。",
      rule: "同一类型的实例共享能力，但各自拥有独立状态。",
      phaseLabels: ["拆开实例状态", "修复共享能量", "起点互换迁移"],
      difficulty: "两个外观相同的对象会同时变化，但状态必须彼此独立",
      prompt: "Nova-A 和 Nova-B 的能量怎样保存？",
      options: [["separate-state", "各自保存一份", "A 消耗不会改动 B"], ["shared-state", "共用一个 energy", "一个行动会覆盖另一个"], ["reset-both", "每步都重置两个", "历史状态丢失"]],
      correct: "separate-state", faulty: "shared-state", scenarios: ["a", "b", "c"],
      flow: ["选择实例", "读取该实例", "更新该实例", "保留另一份状态"],
      states: [["Nova-A", "位置 + 能量"], ["Nova-B", "位置 + 能量"], ["共享内容", "只有能力定义"]],
      diagnosis: ["两个实例错误共享了状态", "地图尺寸不一致", "函数没有参数"], diagnosisAnswer: "两个实例错误共享了状态",
      reflection: "两个同款机器人共享什么，又分别保存什么？"
    },
    29: {
      goal: "让两个对象在同一位置完成明确交接，并正确更新宝石归属。",
      rule: "交接同时检查位置、顺序和所有权；三项成立后才改变携带者。",
      phaseLabels: ["完成接力交接", "修复隔空转移", "路线与顺序迁移"],
      difficulty: "位置、时机和物品归属必须在同一拍同时成立",
      prompt: "交接发生前必须先满足什么？",
      options: [["same-place-first", "两个对象到同一格", "位置一致后才允许交接"], ["remote-transfer", "隔空直接转移", "没有真实会合"], ["upload-first", "先上传再交接", "顺序颠倒"]],
      correct: "same-place-first", faulty: "remote-transfer",
      secondary: { prompt: "交接成功后要更新什么？", options: [["update-owner", "把 owner 改为接收者", "归属和携带状态一致"], ["keep-owner", "仍记在原对象名下", "状态互相矛盾"], ["duplicate-item", "两边都保留一份", "产生重复宝石"]], correct: "update-owner", faulty: "keep-owner" },
      scenarios: ["b", "a", "c"], flow: ["到达会合格", "检查双方位置", "转移宝石", "更新 owner"],
      states: [["giver", "交出宝石"], ["receiver", "接收宝石"], ["owner", "只指向一方"]],
      diagnosis: ["交接时双方不在同一位置", "循环次数太多", "桥面长度不足"], diagnosisAnswer: "交接时双方不在同一位置",
      reflection: "一次有效交接需要哪三个状态同时正确？"
    },
    30: {
      goal: "让等待推进时间，并在共享通道真正空出后才继续移动。",
      rule: "wait() 会推进一拍；每次等待后都要重新检查共享占位状态。",
      phaseLabels: ["等待通道释放", "修复固定延迟", "占位时长迁移"],
      difficulty: "世界会随时间变化，固定等待次数不等于条件已经满足",
      prompt: "每次 wait() 之后应该做什么？",
      options: [["recheck-after-wait", "重新检查通道", "空了才继续"], ["fixed-delay", "等固定次数就走", "占位时长变化会失败"], ["skip-wait", "直接进入通道", "会发生占位冲突"]],
      correct: "recheck-after-wait", faulty: "fixed-delay", scenarios: ["e", "e", "e"],
      flow: ["检查 occupied", "仍占用就 wait", "时间 +1", "再次检查"],
      states: [["tick", "每次等待 +1"], ["occupied", "随时间变化"], ["通过条件", "occupied == False"]],
      requiredCommands: ["wait"],
      diagnosis: ["固定延迟没有重新检查占位", "参数类型错误", "宝石顺序颠倒"], diagnosisAnswer: "固定延迟没有重新检查占位",
      reflection: "等待为什么必须和重新检查放在一起？"
    },
    31: {
      goal: "为自己设计的任务提交作者解、反例和边界测试，证明别人也能玩。",
      rule: "可发布关卡必须同时通过正常解、典型错误和边界情况。",
      phaseLabels: ["建立测试包", "修复漏测边界", "陌生玩家验证"],
      difficulty: "作者解成功还不够，错误方案必须失败，边界方案也必须安全",
      prompt: "一个可发布测试包至少需要什么？",
      options: [["solution-and-counterexample", "作者解 + 反例", "同时证明能过和该失败时会失败"], ["solution-only", "只保存作者解", "无法验证规则约束"], ["screenshot-only", "只交最终截图", "没有执行证据"]],
      correct: "solution-and-counterexample", faulty: "solution-only",
      secondary: { prompt: "还要补哪类测试？", options: [["boundary-case", "边界情况", "距离 0、空清单或最低能量"], ["same-map", "重复同一张图", "没有扩大验证范围"], ["color-change", "只换颜色", "不是迁移"]], correct: "boundary-case", faulty: "same-map" },
      scenarios: ["c", "b", "a"], flow: ["运行作者解", "运行反例", "检查边界", "生成发布包"],
      states: [["作者解", "应成功"], ["反例", "应失败"], ["边界", "应安全处理"]],
      diagnosis: ["测试包漏掉了边界情况", "地图太宽", "函数名没有翻译"], diagnosisAnswer: "测试包漏掉了边界情况",
      reflection: "作者解、反例和边界测试分别证明了什么？"
    },
    32: {
      goal: "整合数据、对象、交接、等待和测试，在陌生世界重建中继站。",
      rule: "系统交付不能用总分掩盖缺口；每个模块约定和独立变式都必须通过。",
      phaseLabels: ["重建完整系统", "定位断开的模块", "独立世界交付"],
      difficulty: "多对象、多状态和多场景同时变化，每个能力门都不可缺失",
      prompt: "系统组合时首先要守住什么？",
      options: [["integrate-contracts", "保持模块约定", "输入、输出和状态边界一致"], ["merge-everything", "把逻辑全塞进一处", "无法定位故障"], ["final-state-only", "只看最终结果", "核心结构可能没有执行"]],
      correct: "integrate-contracts", faulty: "merge-everything",
      secondary: { prompt: "交付前最后验证什么？", options: [["independent-variant", "陌生变式独立通过", "证明系统可以迁移"], ["guided-replay", "只重放提示版本", "无法证明独立掌握"], ["skip-failure", "跳过失败案例", "证据不完整"]], correct: "independent-variant", faulty: "guided-replay" },
      scenarios: ["control", "d", "c"], flow: ["读取世界数据", "分配对象职责", "同步共享状态", "运行测试包"],
      states: [["数据层", "地图 + 清单"], ["对象层", "职责 + 状态"], ["验证层", "三类测试"]],
      requiredCommands: ["ifHazardShield"],
      diagnosis: ["模块约定被合并后失去边界", "地图颜色不一致", "计数器名字太长"], diagnosisAnswer: "模块约定被合并后失去边界",
      reflection: "你如何证明这套系统不是只在当前地图碰巧成功？"
    }
  };

  function makeAdvancedWorldGrid(width, height, start, gems, relay, hazards = [], walls = []) {
    const rows = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) =>
      !x || !y || x === width - 1 || y === height - 1 ? "_" : "g"));
    for (const point of walls) rows[point.y][point.x] = "#";
    for (const point of hazards) rows[point.y][point.x] = "H";
    for (const point of gems) rows[point.y][point.x] = "B";
    if (relay) rows[relay.y][relay.x] = "R";
    rows[start.y][start.x] = "S";
    return rows.map((row) => row.join(""));
  }

  function traceAdvancedProgram(start, startDir, program, routeProgram = []) {
    const queue = [];
    const expand = (command) => {
      const match = command.match(/^repeat(\d+)$/);
      if (match) for (let index = 0; index < Number(match[1]); index += 1) queue.push("move");
      else if (command === "callRoute") routeProgram.forEach(expand);
      else queue.push(command);
    };
    program.forEach(expand);
    let x = start.x, y = start.y, dir = startDir;
    const path = [{ x, y }], gems = [];
    let relay = null;
    for (const command of queue) {
      if (command === "left" || command === "right") dir = directions[(directions.indexOf(dir) + (command === "left" ? 3 : 1)) % 4];
      if (command === "move") { x += vectors[dir][0]; y += vectors[dir][1]; path.push({ x, y }); }
      if (command === "back") { x -= vectors[dir][0]; y -= vectors[dir][1]; path.push({ x, y }); }
      if (command === "collect") gems.push({ x, y });
      if (command === "upload") relay = { x, y };
    }
    return { path, gems, relay };
  }

  function advancedScenario(kind) {
    const walls = [{ x: 2, y: 6 }, { x: 8, y: 2 }, { x: 10, y: 6 }];
    let start = { x: 1, y: 1 }, startDir = "E", solution, solutionFn = [], hazards = [], timedGate = null;
    if (kind === "a") solution = ["repeat4", "collect", "right", "repeat3", "collect", "left", "repeat4", "upload"];
    if (kind === "b") { start = { x: 1, y: 5 }; startDir = "N"; solution = ["repeat3", "collect", "right", "repeat5", "collect", "right", "repeat3", "left", "repeat4", "upload"]; }
    if (kind === "c") solution = ["repeat3", "collect", "right", "repeat4", "collect", "left", "repeat5", "collect", "left", "repeat4", "upload"];
    if (kind === "d") { start = { x: 1, y: 3 }; solution = ["repeat2", "ifHazardShield", "repeat3", "collect", "right", "repeat2", "left", "repeat4", "upload"]; hazards = [{ x: 4, y: 3 }]; }
    if (kind === "e") { start = { x: 2, y: 4 }; solution = ["wait", "wait", "repeat3", "collect", "left", "repeat3", "right", "repeat4", "upload"]; timedGate = { x: 3, y: 4, requiredWaits: 2 }; walls.push({ x: timedGate.x, y: timedGate.y }); }
    if (kind === "f") { solutionFn = ["repeat3"]; solution = ["callRoute", "collect", "right", "callRoute", "collect", "left", "repeat3", "upload"]; }
    if (["control", "control-b", "control-c"].includes(kind)) {
      start = kind === "control-b" ? { x: 1, y: 2 } : kind === "control-c" ? { x: 1, y: 5 } : { x: 1, y: 3 };
      solution = kind === "control-b"
        ? ["move", "ifHazardShield", "whileBeacon", "collect", "right", "repeat3", "left", "whileRelay", "upload"]
        : kind === "control-c"
          ? ["repeat2", "ifHazardShield", "whileBeacon", "collect", "left", "whileRelay", "upload"]
          : ["repeat2", "ifHazardShield", "whileBeacon", "collect", "right", "repeat2", "left", "whileRelay", "upload"];
      hazards = kind === "control-b" ? [{ x: 3, y: 2 }] : kind === "control-c" ? [{ x: 4, y: 5 }] : [{ x: 4, y: 3 }];
      const gems = kind === "control-b" ? [{ x: 5, y: 2 }] : kind === "control-c" ? [{ x: 7, y: 5 }] : [{ x: 6, y: 3 }];
      const relay = kind === "control-b" ? { x: 9, y: 5 } : kind === "control-c" ? { x: 7, y: 1 } : { x: 10, y: 5 };
      const path = kind === "control-b"
        ? [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 }, { x: 9, y: 5 }]
        : kind === "control-c"
          ? [{ x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 7, y: 4 }, { x: 7, y: 3 }, { x: 7, y: 2 }, { x: 7, y: 1 }]
          : [{ x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 10, y: 5 }];
      return { grid: makeAdvancedWorldGrid(13, 8, start, gems, relay, hazards, walls), start, startDir, solution, solutionFn,
        path,
        gems, relay, hazards, walls, timedGate: null };
    }
    const traced = traceAdvancedProgram(start, startDir, solution, solutionFn);
    return { grid: makeAdvancedWorldGrid(13, 8, start, traced.gems, traced.relay, hazards, walls), start, startDir, solution, solutionFn,
      path: traced.path, gems: traced.gems, relay: traced.relay, hazards, walls, timedGate };
  }

  function breakAdvancedProgram(world) {
    const faulty = world.solution.slice();
    const riskyCondition = faulty.indexOf("ifHazardShield");
    if (riskyCondition >= 0) faulty.splice(riskyCondition, 1);
    else if (faulty.includes("wait")) faulty.splice(faulty.indexOf("wait"), 1);
    else if (faulty.includes("callRoute")) faulty.splice(faulty.lastIndexOf("callRoute"), 1);
    else {
      const collectIndex = faulty.indexOf("collect");
      faulty[collectIndex >= 0 ? collectIndex : 0] = "move";
    }
    return faulty;
  }

  function missionAdvanced(base, p) {
    const spec = advancedLessonSpecs[base.lessonNo];
    const phaseIndex = p.phase === "guided" ? 0 : p.phase === "repair" ? 1 : 2;
    const scenarioList = spec.scenarios || ["a", "b", "c"];
    const scenarioKind = p.phase === "challenge" ? scenarioList[(phaseIndex + p.variant) % scenarioList.length] : scenarioList[phaseIndex];
    const world = advancedScenario(scenarioKind);
    for (const requiredCommand of spec.requiredCommands || []) {
      if (!world.solution.includes(requiredCommand) && !world.solutionFn.includes(requiredCommand)) world.solution.unshift(requiredCommand);
    }
    const faulty = breakAdvancedProgram(world);
    const unique = (items) => [...new Set(items)];
    const allowed = unique(["move", "left", "right", "collect", "upload", ...world.solution, ...world.solutionFn]).filter((id) => id !== "callRoute" || base.lessonNo === 19);
    const targets = world.gems.map((point, index) => ({ ...point, label: `宝石 ${String.fromCharCode(65 + index)}` }));
    const selectedChoice = p.systemChoice || (p.phase === "repair" ? spec.faulty : "");
    const selectedChoiceB = p.systemChoiceB || (p.phase === "repair" && spec.secondary ? spec.secondary.faulty : "");
    return { ...base, grid: world.grid, startDir: world.startDir, startOverride: world.start, targetPositions: world.gems,
      solution: world.solution, solutionFn: world.solutionFn, functionEnabled: base.lessonNo === 19, functionLimit: 5,
      allowed, energy: base.lessonNo === 18 ? 20 : 32, minEnergy: base.lessonNo === 18 ? 5 : 0,
      required: world.gems.length, limit: Math.max(12, world.solution.length + 3), timedGate: world.timedGate,
      lessonMode: `v17-system-lab-${base.lessonNo}`, starterProgram: undefined,
      target: spec.goal, objective: spec.goal,
      early: { independent: p.phase === "challenge", repairing: p.phase === "repair", key: `${p.phase}-${p.variant}-${scenarioKind}`,
        goal: spec.goal, rule: spec.rule, title: p.phase === "guided" ? "构造任务 · 连接规则与世界" : p.phase === "repair" ? "修复任务 · 先看原始失败" : `迁移任务 · 世界 ${p.variant + 1}`,
        phaseLabels: spec.phaseLabels, prediction: { prompt: "", options: [], answer: "" }, prerequisite: null,
        faulty, mainStarter: p.phase === "repair" ? faulty : [], functionStarter: base.lessonNo === 19 && p.phase === "repair" ? world.solutionFn.slice() : [],
        faultStep: Math.max(1, world.solution.findIndex((item, index) => faulty[index] !== item) + 1),
        diagnosisOptions: spec.diagnosis, diagnosisAnswer: spec.diagnosisAnswer,
        reflectionPrompt: spec.reflection, intro: `${spec.rule} 本课增加的挑战：${spec.difficulty}。`,
        hints: [`先看任务台中的“${spec.prompt}”。`, `对照状态流：${spec.flow.join(" → ")}。`, `局部示例：正确规则是“${spec.options.find((item) => item[0] === spec.correct)?.[1]}”。`],
        targets, successPath: world.path, requiresUpload: Boolean(world.relay), requiredTargetOrder: [21, 22, 24, 31, 32].includes(base.lessonNo),
        dataLab: { ...spec, selectedChoice, selectedChoiceB }, requiredCommands: spec.requiredCommands || [], requireCallCount: spec.requireCallCount || 0 }
    };
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
        diagnosisOptions: repairKind === "limit" ? ["程序写错了", "动作上限少一步", "宝石不能采集"] : ["目标被规则围住", "程序缺少上传", "起点朝向错误"],
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
    grid.forEach((row, y) => [...row].forEach((tile, x) => { if (tile === "B") targets.push({ x, y, label: `宝石 ${String.fromCharCode(65 + targets.length)}` }); }));
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
      if (tile === "B") targets.push({ x, y, label: `宝石 ${String.fromCharCode(65 + targets.length)}` });
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
    grid.forEach((row, y) => [...row].forEach((tile, x) => { if (tile === "B") targets.push({ x, y, label: `宝石 ${targets.length + 1}` }); }));
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

  function controlGrid(width, height, start, target, { walls = [], hazards = [] } = {}) {
    return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
      if (!x || !y || x === width - 1 || y === height - 1) return "_";
      if (x === start.x && y === start.y) return "S";
      if (target && x === target.x && y === target.y) return "B";
      if (hazards.some((point) => point.x === x && point.y === y)) return "H";
      if (walls.some((point) => point.x === x && point.y === y)) return "#";
      return "g";
    }).join(""));
  }

  function straightPath(start, target) {
    const path = [{ ...start }];
    const stepX = Math.sign(target.x - start.x), stepY = Math.sign(target.y - start.y);
    let current = { ...start };
    while (current.x !== target.x || current.y !== target.y) {
      current = { x: current.x + stepX, y: current.y + stepY };
      path.push(current);
    }
    return path;
  }

  function missionCondition(base, p) {
    const independent = p.phase === "challenge", repairing = p.phase === "repair";
    const variants = [{ hazardX: null, checkX: 4 }, { hazardX: 2, checkX: 2 }, { hazardX: 5, checkX: 5 }];
    const setup = independent ? variants[p.variant % variants.length] : { hazardX: 4, checkX: 4 };
    const start = { x: 1, y: 3 }, target = { x: 8, y: 3 };
    const hazards = setup.hazardX ? [{ x: setup.hazardX, y: 3 }] : [];
    const grid = controlGrid(11, 7, start, target, {
      hazards,
      walls: [{ x: 3, y: 1 }, { x: 7, y: 5 }, { x: 9, y: 2 }]
    });
    const beforeCheck = setup.checkX - start.x - 1;
    const solution = [
      ...Array(Math.max(0, beforeCheck)).fill("move"),
      "ifSensorAct",
      ...Array(target.x - (start.x + Math.max(0, beforeCheck))).fill("move"),
      "collect"
    ];
    return { ...base, grid, startDir: "E", solution, energy: 9, limit: 12, required: 1,
      allowed: ["move", "ifSensorAct", "collect"], lessonMode: "v17-condition-lab", starterProgram: undefined,
      target: "让传感器在需要时采取行动，再安全抵达宝石。", objective: "让传感器在需要时采取行动，再安全抵达宝石。",
      early: { independent, repairing, key: `${p.phase}-${p.variant}-${setup.hazardX ?? "clear"}`,
        goal: "先观察前方状态，再决定条件动作是否执行。",
        rule: "只有检测结果与条件相同，if 里的动作才会执行；不相同就跳过。",
        title: independent ? `状态迁移 · ${setup.hazardX ? "尖刺换位" : "没有尖刺"}` : repairing ? "修复错误检测对象" : "尖刺感应实验",
        phaseLabels: ["观察条件真假", "修复检测对象", "尖刺位置变化"],
        prediction: { prompt: "", options: [], answer: "" }, prerequisite: null,
        faulty: solution.slice(), mainStarter: repairing ? solution.slice() : [], faultStep: beforeCheck + 1,
        conditionOptions: [
          { value: "hazard", label: "尖刺", detail: "相同就开盾" },
          { value: "blocked", label: "岩石", detail: "相同就右转" },
          { value: "clear", label: "通路", detail: "相同就前进" }
        ],
        defaultSensor: repairing ? "blocked" : "", expectedSensor: "hazard",
        expectedConditionResult: Boolean(setup.hazardX), observedFront: setup.hazardX ? "hazard" : "clear",
        diagnosisOptions: ["检测对象选错了", "前进次数太少", "采集应该放在开盾前"], diagnosisAnswer: "检测对象选错了",
        reflectionPrompt: independent ? "尖刺位置改变后，为什么同一条条件仍然有效？" : repairing ? "你改的是哪一个检测对象？运行证据有什么变化？" : "条件为真和为假时，程序分别做了什么？",
        intro: "if 不是永远执行的动作。它先读取传感器，再根据真假决定是否进入条件内部。",
        hints: ["先找出 if 执行时 Nova 面前的那一格。", "尖刺格需要开盾，所以检测对象应与尖刺状态一致。", "局部示例：scan_ahead() 得到 spike（尖刺）时，条件应为 true。"],
        targets: [{ ...target, label: "宝石 A" }], successPath: straightPath(start, target) }
    };
  }

  function missionBoolean(base, p) {
    const independent = p.phase === "challenge", repairing = p.phase === "repair";
    const variants = [
      { kind: "hazard", target: { x: 2, y: 5 }, energy: 5 },
      { kind: "low-energy", target: { x: 2, y: 4 }, energy: 3 },
      { kind: "blocked", target: { x: 2, y: 5 }, energy: 7 }
    ];
    const setup = independent ? variants[p.variant % variants.length]
      : repairing ? { kind: "blocked", target: { x: 2, y: 5 }, energy: 7 }
        : { kind: "clear", target: { x: 7, y: 3 }, energy: 7 };
    const start = independent || repairing ? { x: 2, y: 2 } : { x: 2, y: 3 };
    const front = { x: start.x + 1, y: start.y };
    const walls = [{ x: 7, y: 1 }, { x: 7, y: 5 }];
    const hazards = [];
    if (setup.kind === "blocked") walls.push(front);
    if (setup.kind === "hazard") hazards.push(front);
    const grid = controlGrid(10, 7, start, setup.target, { walls, hazards });
    const distance = Math.abs(setup.target.x - start.x) + Math.abs(setup.target.y - start.y);
    const solution = ["logicGuard", ...Array(Math.max(0, distance - (setup.kind === "clear" ? 1 : 0))).fill("move"), "collect"];
    const state = {
      clear: setup.kind === "clear" || setup.kind === "low-energy",
      enoughEnergy: setup.energy > 3,
      notHazard: setup.kind !== "hazard"
    };
    return { ...base, grid, startDir: "E", solution, energy: setup.energy, limit: 8, required: 1,
      allowed: ["move", "logicGuard", "collect"], lessonMode: "v17-boolean-lab", starterProgram: undefined,
      target: "组合三条安全条件，让 Nova 选择前进或转向。", objective: "组合三条安全条件，让 Nova 选择前进或转向。",
      early: { independent, repairing, key: `${p.phase}-${p.variant}-${setup.kind}`,
        goal: "用一条可复用的安全规则处理不同前方状态。",
        rule: "AND 要求每个条件都为真；OR 只要一个为真。安全规则应在任一风险出现时转向。",
        title: independent ? `状态压力测试 · ${setup.kind === "hazard" ? "尖刺" : setup.kind === "blocked" ? "岩石" : "低能量"}` : repairing ? "修复 OR 漏洞" : "三条件安全守卫",
        phaseLabels: ["拼好安全规则", "修复 OR 漏洞", "换状态验证"],
        prediction: { prompt: "", options: [], answer: "" }, prerequisite: null,
        faulty: solution.slice(), mainStarter: repairing ? solution.slice() : [], faultStep: 1,
        connectorOptions: [{ value: "and", label: "AND", detail: "全部为真" }, { value: "or", label: "OR", detail: "任一为真" }],
        hazardOptions: [{ value: "not-hazard", label: "NOT 尖刺", detail: "前方不能尖刺" }, { value: "hazard", label: "尖刺", detail: "前方必须尖刺" }],
        defaultConnector: repairing ? "or" : "", defaultHazardMode: repairing ? "not-hazard" : "",
        expectedConnector: "and", expectedHazardMode: "not-hazard", initialState: state,
        diagnosisOptions: ["OR 放过了部分风险", "能量条件不需要", "右转应该改成左转"], diagnosisAnswer: "OR 放过了部分风险",
        reflectionPrompt: independent ? "哪一个状态变了？为什么规则仍然做出安全选择？" : repairing ? "OR 为什么会把有风险的状态误判成可前进？" : "为什么安全规则需要三个条件同时为真？",
        intro: "布尔规则像一道闸门：每个条件贡献一个真或假，连接方式决定最终开门还是转向。",
        hints: ["分别读出通路、能量和尖刺三个真假值。", "只要存在一种风险就不能前进，因此要让任一 false 关上闸门。", "局部示例：F、T、T 用 OR 会得到 true，用 AND 会得到 false。"],
        targets: [{ ...setup.target, label: "宝石 A" }], successPath: straightPath(start, setup.target) }
    };
  }

  function missionWhile(base, p) {
    const independent = p.phase === "challenge", repairing = p.phase === "repair";
    const distance = independent ? [0, 1, 6][p.variant % 3] : repairing ? 2 : 4;
    const start = { x: 2, y: 3 }, target = { x: 2 + distance, y: 3 };
    const grid = controlGrid(12, 7, start, distance ? target : null, {
      walls: [{ x: 4, y: 1 }, { x: 8, y: 5 }, { x: 10, y: 2 }]
    });
    const solution = ["whileBeacon", "collect"];
    const faulty = ["move", "move", "collect"];
    return { ...base, grid, startDir: "E", solution, energy: 12, limit: 8, required: 1,
      allowed: ["move", "whileBeacon", "collect"], lessonMode: "v17-while-lab", starterProgram: undefined,
      targetPositions: [target], startOverride: start,
      target: "不用预先知道距离，也能走到宝石并停下。", objective: "不用预先知道距离，也能走到宝石并停下。",
      early: { independent, repairing, key: `${p.phase}-${p.variant}-${distance}`,
        goal: "让当前状态决定是否继续，而不是把步数写死。",
        rule: "while 会在每轮开始检查条件；已经到达时执行 0 次，未到达就继续。",
        title: independent ? `未知距离 · 场景 ${p.variant + 1}` : repairing ? "修复固定步数" : "状态控制的前进",
        phaseLabels: ["让状态决定停止", "修复固定步数", "距离完全变化"],
        prediction: repairing ? { prompt: "", options: [], answer: "" }
          : { prompt: "这张地图中，while 的循环体会执行几次？", options: ["0", "1", "2", "4", "6"], answer: String(distance) },
        prerequisite: null, faulty, mainStarter: repairing ? faulty.slice() : [], faultStep: 3,
        expectedRepetitions: distance,
        diagnosisOptions: ["固定步数只适合一张图", "采集动作不能放最后", "宝石必须在第 2 格"], diagnosisAnswer: "固定步数只适合一张图",
        reflectionPrompt: independent ? "距离变成现在这样后，while 为什么不需要改？" : repairing ? "固定步数和状态停止的差别是什么？" : "while 在什么时候继续，什么时候停止？",
        intro: "固定重复回答“做几次”，while 回答“做到什么时候”。距离变化时，停止条件比数字更可靠。",
        hints: ["先说出循环继续的条件：还没有到宝石。", "把固定数量的 move 换成一个 while 控制块。", "局部示例：如果起点就是宝石，while 应执行 0 次。"],
        targets: [{ ...target, label: "宝石 A" }], successPath: straightPath(start, target) }
    };
  }

  function missionControl(base, p) {
    if (base.lessonNo === 13) return missionCondition(base, p);
    if (base.lessonNo === 14) return missionBoolean(base, p);
    return missionWhile(base, p);
  }

  function missionSevenToTen(base, p) {
    if (base.lessonNo === 7) return missionSeven(base, p);
    if (base.lessonNo === 8) return missionEight(base, p);
    return missionFunction(base, p);
  }

  function mission(base, p) {
    if (!isEarly(base)) return base;
    if (base.lessonNo === 6) return missionSix(base, p);
    if (base.lessonNo >= 16) return missionAdvanced(base, p);
    if (base.lessonNo >= 13) return missionControl(base, p);
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
        { id: "upper", label: "路线 A · 先左转", summary: "先左转绕过岩石，再转向宝石并采集。", commands: ["left", "move", "right", "move", "move", "right", "move", "collect"] },
        { id: "lower", label: "路线 B · 先右转", summary: "先右转绕过岩石，再转向宝石并采集。", commands: ["right", "move", "left", "move", "move", "left", "move", "collect"] }
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
      ...(n === 3 ? { summary: route.id === "direct" ? "直走到宝石" : route.id === "detour" ? "绕行到宝石" : route.summary } : {}),
      path: pathFor(grid, startDir, route.commands)
    }));
    const rightDirection = directions[(directions.indexOf(startDir) + 1) % 4];
    const distance = solution.filter((x) => x === "move").length;
    const prediction = n === 1
      ? { prompt: "到宝石要前进几格？", options: ["1", "2", "3", "4", "5", "6"], answer: String(distance) }
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
      if (c === "collect") targets.push({ ...pos, label: `宝石 ${String.fromCharCode(65 + targets.length)}` });
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
      "让 Nova（诺瓦）到达宝石并采集。",
      "转弯到达宝石并采集。",
      "选一条路线，把它编成程序。",
      "找出第一处错误并修好程序。",
      "按顺序采集 A、B 两座宝石。"
    ];
    const reflectionPrompts = [
      "你把采集放在哪一步？为什么？",
      "你改了哪次转向？为什么？",
      "换图后，你改了哪一段？",
      "最早出错的是哪一步？",
      "哪些移动改变 x？哪些改变 y？"
    ];
    const prerequisite = n === 1 ? null : n === 2
      ? { prompt: "什么时候采集？", options: ["到达宝石后", "到达宝石前"], answer: "到达宝石后" }
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
          "程序从上到下执行。站在宝石格才能采集。",
          "转向只改朝向，不改位置。镜头方向不等于角色方向。",
          "先选路线，再排指令。运行后对照计划检查。",
          "从第一步开始查。报错的位置不一定是最早出错的位置。",
          "坐标写作 (x, y)。向东 x 增加，向南 y 增加。"
        ][n - 1],
        hints: [
          n === 1 ? "起点所在格不算一次前进。" : n === 2 ? "看罗盘，不看屏幕左右。" : n === 4 ? "从第一步开始检查朝向。" : n === 5 ? "坐标先写 x，再写 y。" : "转向、前进、采集都算一条指令。",
          n === 1 ? "到达宝石后，再执行采集。" : n === 2 ? "每次转向后，先确认朝向。" : n === 4 ? "撞墙前的转向可能已经错了。" : n === 5 ? "向东 x 加 1，向南 y 加 1。" : "沿路线逐格检查指令。",
          `局部示例：参考程序的前两条是 ${solution.slice(0, 2).map((x) => ({ move: "前进", left: "左转", right: "右转", collect: "采集" })[x]).join(" → ")}。其余步骤请自己完成。`
        ] }
    };
  }

  function canRun(m, p, hasPrerequisite = false) {
    if (m.lessonNo >= 16) {
      const lab = m.early.dataLab;
      const observedCurrentFailure = p.debugObservation?.challengeKey === m.early.key;
      if (m.early.repairing && !observedCurrentFailure) return "";
      if (m.early.repairing && !p.diagnosis) return "请先根据原始失败判断哪个规则断开了。";
      if ((p.systemChoice || lab.selectedChoice) !== lab.correct) return `请先完成任务台中的“${lab.prompt}”。`;
      if (lab.secondary && (p.systemChoiceB || lab.selectedChoiceB) !== lab.secondary.correct) return `请先完成任务台中的“${lab.secondary.prompt}”。`;
      return "";
    }
    if (m.lessonNo === 7) {
      if (p.phase === "guided" && !p.designerTarget) return "请先完成上方第 1 项：选择一座宝石。";
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
    if (m.lessonNo === 13) {
      if (m.early.repairing && p.debugObservation?.challengeKey === m.early.key && !p.diagnosis) return "请先根据失败轨迹判断问题在哪里。";
      if (m.early.repairing && !p.debugObservation) return "";
      if (!p.conditionSensor) return "请先选择 if 要检测的前方状态。";
      return "";
    }
    if (m.lessonNo === 14) {
      if (m.early.repairing && p.debugObservation?.challengeKey === m.early.key && !p.diagnosis) return "请先根据真假值判断 OR 为什么不安全。";
      if (m.early.repairing && !p.debugObservation) return "";
      if (!p.logicConnector || !p.logicHazardMode) return "请先选好连接方式和尖刺条件。";
      return "";
    }
    if (m.lessonNo === 15) {
      if (m.early.repairing && p.debugObservation?.challengeKey === m.early.key && !p.diagnosis) return "请先判断固定步数为什么不能迁移。";
      if (m.early.repairing) return "";
      if (!m.early.prediction.options.includes(p.prediction)) return "请先预测 while 的循环体会执行几次。";
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
    const conditionEvents = run.trace.filter((item) => item.condition);
    const lastCondition = conditionEvents.at(-1)?.condition;
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
          : m.lessonNo === 13
            ? run.success && run.conditionSensor === m.early.expectedSensor && lastCondition?.kind === "if"
              && lastCondition.result === m.early.expectedConditionResult
          : m.lessonNo === 14
            ? run.success && run.logicConnector === m.early.expectedConnector
              && run.logicHazardMode === m.early.expectedHazardMode && lastCondition?.kind === "boolean"
          : m.lessonNo === 15
            ? run.success && run.program.includes("whileBeacon") && lastCondition?.kind === "while"
              && Number(lastCondition.repetitions) === Number(m.early.expectedRepetitions)
          : m.lessonNo >= 16
            ? run.success
              && (run.systemChoice || m.early.dataLab.selectedChoice) === m.early.dataLab.correct
              && (!m.early.dataLab.secondary || (run.systemChoiceB || m.early.dataLab.selectedChoiceB) === m.early.dataLab.secondary.correct)
              && m.early.requiredCommands.every((command) => run.program.includes(command) || run.routeProgram.includes(command))
              && (!m.early.requireCallCount || run.program.filter((command) => command === "callRoute").length >= m.early.requireCallCount)
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
    if (m.lessonNo === 13 && run.success && !conceptSuccess) failure = "世界结果看似正确，但还没有证明条件会按前方状态真假工作";
    if (m.lessonNo === 14 && run.success && !conceptSuccess) failure = "世界结果看似正确，但安全规则没有同时挡住岩石、尖刺和低能量";
    if (m.lessonNo === 15 && run.success && !conceptSuccess) failure = "这张图走通了，但固定步数不能证明距离变化后仍然有效";
    if (m.lessonNo >= 16 && run.success && !conceptSuccess) failure = "世界结果完成了，但本课的数据规则或核心结构还没有真实参与运行";
    if (run.success && !targetOrderCorrect) failure = "宝石都采集到了，但顺序与任务要求不一致";
    const validatedSuccess = conceptSuccess && targetOrderCorrect;
    const programMatchesFault = JSON.stringify(run.program) === JSON.stringify(m.early.faulty);
    const isFaulty = m.lessonNo >= 16 ? programMatchesFault
      : m.lessonNo === 13 ? programMatchesFault && run.conditionSensor !== m.early.expectedSensor
      : m.lessonNo === 14 ? programMatchesFault && (run.logicConnector !== m.early.expectedConnector || run.logicHazardMode !== m.early.expectedHazardMode)
        : m.lessonNo === 15 ? !run.program.includes("whileBeacon")
          : programMatchesFault && (!m.early.faultyFunction || JSON.stringify(run.routeProgram) === JSON.stringify(m.early.faultyFunction));
    return { ...copy(run), success: validatedSuccess, failure, challengeKey: m.early.key, independent: m.early.independent,
      lessonNo: m.lessonNo, phase: p.phase, assisted: Boolean(run.assisted), predictionCorrect: [7, 11, 12].includes(m.lessonNo) || !m.early.prediction.options.length || run.prediction === m.early.prediction.answer,
      actualRoute: actual?.id || "custom", routeMatches: !planned || divergence === null,
      diagnosisCorrect: String(run.diagnosis || p.ruleDiagnosis) === String(diagnosisAnswer),
      isFaulty,
      targetOrderCorrect, reuseValid: m.lessonNo !== 9 || validatedSuccess, contractValid: m.lessonNo !== 10 || validatedSuccess,
      ruleValid: m.lessonNo !== 7 || validatedSuccess, stableCalls: stableCalls.length,
      divergence, plannedPath: expected, explanation: "", debug: "", reconciled: false,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, at: new Date().toISOString() };
  }

  function record(p, attempt) {
    p.attempts = [...p.attempts, attempt].slice(-6);
    if (attempt.phase === "repair" && !attempt.success && (attempt.isFaulty || attempt.lessonNo === 7 || attempt.lessonNo === 10 || attempt.lessonNo >= 13)) p.debugObservation = copy(attempt);
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
      conditionSensor: "", logicConnector: "", logicHazardMode: "", systemChoice: "", systemChoiceB: "",
      explanation: "", debug: "", diagnosis: "", reflection: "", reconciliation: "", ruleDiagnosis: "", failureReason: "",
      ruleFixed: false, ruleRevised: false, assisted: Boolean(exposure.assisted), hintLevel: exposure.hintLevel || 0 });
    return p;
  }

  function merge(local, remote) {
    if (![1, 2, 3, 4, 5, version].includes(remote?.version)) return profile(local);
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
