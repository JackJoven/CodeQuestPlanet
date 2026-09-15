(function (root) {
  "use strict";

  const course = root.SignalRunnerCourseData;
  if (!course?.missions?.length) return;

  const curriculum = [
    ["启动信号", "sequence", "用顺序让第一段救援信号启动", "顺序执行证据"],
    ["谁的左和右", "relative-direction", "从机器人朝向判断左转和右转", "方向变化记录"],
    ["先画路线再出发", "route-planning", "先选路线，再把路线变成程序", "计划与实跑对照"],
    ["调试侦探社", "first-divergence", "找到程序第一次偏离计划的位置", "错误定位记录"],
    ["星图坐标站", "coordinates", "用 (x, y) 坐标记录目标并按序抵达", "坐标扫描记录"],
    ["三段救援任务", "task-decomposition", "按采集 A、采集 B、上传拆成三段", "三段任务轨迹"],
    ["设计一条可解路线", "solvable-design", "设计规则并用作者解证明关卡可解", "可解关卡包"],
    ["第一场独立救援", "independent-transfer", "独立迁移前八课的规划与调试方法", "独立救援证据"],
    ["把动作装进工具箱", "function-definition-call", "定义一组动作并在主程序中调用", "函数调用证据"],
    ["一个工具，多处使用", "function-contract", "让同一工具在多个入口保持可靠", "调用前后状态表"],
    ["找出重复的一组", "loop-unit", "把“移动两格再采集”作为完整循环单元", "循环展开证据"],
    ["循环到哪里为止", "loop-boundary", "用缩进决定动作在循环内还是循环外", "循环边界对照"],
    ["看到危险再行动", "conditional-action", "每次移动前重新判断危险", "多场景条件轨迹"],
    ["写一条安全规则", "boolean-guard", "组合通路、危险和能量边界", "八状态规则表"],
    ["不数步，也能到达", "while-progress", "用状态而不是固定步数控制循环", "未知距离验证"],
    ["自动救援程序", "control-flow-capstone", "组合循环与条件写出可迁移规则", "自动救援测试包"],
    ["会记数的探测员", "event-counter", "让变量和真实采集事件一一对应", "计数事件账本"],
    ["能量账本", "energy-ledger", "根据真实动作计算消耗的能量", "能量收支记录"],
    ["给工具一个参数", "function-parameter", "让参数真正控制函数执行次数", "参数调用轨迹"],
    ["让函数交回答案", "return-value", "让返回值参与调用者的决定", "返回值决策证据"],
    ["一张会变化的清单", "list-iteration", "让任务清单直接驱动执行", "清单执行记录"],
    ["清单变长以后", "list-index-length", "用 append、len 和索引安全处理清单", "索引与长度证据"],
    ["用名字查规则", "dictionary-lookup", "用名字从字典查到并使用规则", "规则查询记录"],
    ["救援调度台", "scheduler", "综合清单、字典、函数和条件安排救援", "调度执行报告"],
    ["地图藏在表格里", "matrix-coordinates", "用 grid[y][x] 读写非正方形地图", "二维地图修复证据"],
    ["用数据修一座桥", "data-driven-building", "按缺口数据补桥并核算材料", "桥梁施工账本"],
    ["把任务交给谁", "object-responsibility", "按对象能力把动作交给正确角色", "对象职责记录"],
    ["两个同款机器人", "instance-identity", "创建两个独立实例并保持各自状态", "实例状态对照"],
    ["接力运输", "atomic-transfer", "在交接区完成合法且原子的货物转移", "交接事件记录"],
    ["等到通道真的空了", "discrete-time", "等待后重新检测占位状态再行动", "时间与占位轨迹"],
    ["让别人也能玩", "level-schema", "用数据规则创建并验证可玩的关卡", "可发布关卡包"],
    ["重建中继站", "final-capstone", "综合对象、交接、条件同步和关卡数据", "中继站重建作品"]
  ];

  const phaseNames = ["先试一试", "主任务", "调试比较", "独立迁移", "保存证据"];
  const curriculumKnowledge = [
    "顺序 · move · collect", "相对方向 · 左转 · 右转", "路线规划 · 先计划后执行", "第一次偏离 · 调试", "坐标 (x, y) · 目标顺序", "任务分段 · A→B→上传", "可解性 · 规则 · 作者解", "独立迁移 · 综合调试",
    "函数定义 · 函数调用", "函数约定 · 多处复用", "for · range · 完整重复单元", "缩进 · 循环边界", "if · 危险检测", "and · not · 能量边界", "while · 停止条件 · 进展保护", "循环 · 条件 · 自动控制",
    "变量 · 事件计数", "状态 · 能量收支", "函数参数 · 输入变化", "return · 调用者决策", "列表 · 遍历 · 空清单", "append · len · 索引", "字典 · 键值查询", "列表 · 字典 · 函数 · 条件",
    "二维列表 · grid[y][x]", "缺口清单 · 数据建造", "对象 · 方法 · 能力职责", "实例 · 身份 · 独立状态", "相邻 · 容量 · 原子交接", "离散时间 · wait · 占位", "schema · 作者解 · 版本", "对象协作 · 交接 · 同步 · 建造"
  ];
  const curriculumTypes = [
    "学习", "学习", "练习", "调试", "学习", "练习", "创作", "阶段作品",
    "学习", "调试", "学习", "调试", "学习", "学习", "练习", "阶段作品",
    "学习", "练习", "学习", "学习", "学习", "练习", "学习", "阶段作品",
    "学习", "练习", "学习", "学习", "练习", "调试", "创作", "毕业作品"
  ];
  const lessonTypeClasses = { "学习": "learning", "练习": "practice", "调试": "debugging", "创作": "creation", "阶段作品": "boss", "毕业作品": "capstone" };
  course.missions.slice(0, curriculum.length).forEach((mission, index) => {
    const [title, conceptId, goal, artifact] = curriculum[index];
    Object.assign(mission, {
      title,
      conceptId,
      curriculumVersion: "core-v1.6",
      contentId: `core-v1.6-${String(index + 1).padStart(2, "0")}`,
      target: goal,
      objective: goal,
      focus: conceptId,
      concept: curriculumKnowledge[index],
      knowledge: curriculumKnowledge[index].split(" · "),
      typeLabel: curriculumTypes[index],
      lessonType: lessonTypeClasses[curriculumTypes[index]],
      artifact,
      studentOutput: artifact,
      checkpoint: `我能说明并展示：${goal}。`,
      prdAlignment: {
        version: "1.6",
        phases: phaseNames.slice(),
        requiresIndependentTransfer: true,
        evidence: artifact
      }
    });
  });

  const stageCopy = [
    { title: "动作、方向与路线规划", ability: "顺序、相对方向、路线、调试、坐标、任务分段、可解设计", work: "第一场独立救援" },
    { title: "函数、循环与控制规则", ability: "函数、调用约定、for、缩进、if、布尔规则、while", work: "自动救援程序" },
    { title: "状态、函数与数据容器", ability: "变量账本、参数、返回值、列表、索引、字典、调度", work: "救援调度台" },
    { title: "世界数据与多对象协作", ability: "二维地图、数据建造、对象职责、实例、交接、离散时间、关卡发布", work: "重建中继站" }
  ];
  course.stages.slice(0, 4).forEach((stage, index) => Object.assign(stage, stageCopy[index]));

  const grid = (...rows) => rows;
  const studio = ({ no, title, concept, task, starter, reference, functions, features = [], checks = [], cases, objectModel = false, multiObject = false, rules = {}, templates = [], translations = [] }) => ({
    starterVersion: `core-v1.6-${String(no).padStart(2, "0")}-v1`,
    clickToBuild: false,
    kicker: `第 ${no} 课 · ${concept}`,
    title,
    taskBadge: "真实 Python",
    taskHtml: `${task}<br><small>运行会用同一份代码验证下方全部场景；全部通过才会保存为本课证据。</small>`,
    railEyebrow: "本课接口与提醒",
    railTitle: "可以直接编辑代码",
    initialFeedback: "先运行起始程序观察失败，再根据执行轨迹修改；迁移场景会自动复用同一份代码。",
    starterSource: starter,
    referenceSource: reference,
    allowedFunctions: [...new Set([...functions, "course_value", "report"])],
    languageFeatures: features,
    stateChecks: checks,
    conceptChecks: [],
    cases,
    objectModel,
    multiObject,
    courseRules: rules,
    statePanel: {
      title: "真实运行证据",
      description: "变量、对象、函数和世界变化都来自本次完整执行；迁移场会复用同一份代码。",
      variables: [], objects: [], functions: [], collections: [], worlds: []
    },
    templates: templates.length ? templates : [
      { id: `lesson-${no}-tip`, label: "检查重点", code: concept, help: task, referenceOnly: true }
    ],
    translations: translations.length ? translations : [["course_value(name)", "读取当前验证场的输入"], ["report(value)", "把关键结果交到证据台"]]
  });

  const makeCase = (id, label, options) => ({ id, label, ...options });
  const straight = (distance, { hazards = [], relayDistance = null } = {}) => {
    const width = Math.max(distance, relayDistance ?? distance) + 3;
    const row = Array(width).fill("g");
    row[0] = "_";
    row[width - 1] = "_";
    row[1] = "S";
    row[1 + distance] = "B";
    hazards.forEach((step) => { if (step > 0 && step < distance) row[1 + step] = "H"; });
    if (relayDistance !== null) row[1 + relayDistance] = "R";
    return ["_".repeat(width), row.join(""), "_".repeat(width)];
  };
  const source = (...lines) => lines.join("\n");

  const specs = {};

  {
    const reference = source(
      "while not at_beacon():",
      "    if is_hazard_ahead():",
      "        shield()",
      "    move()",
      "collect()"
    );
    specs[13] = {
      grid: straight(5, { hazards: [2] }), startDir: "E", energy: 12, required: 1, minEnergy: 0,
      pythonStudio: studio({ no: 13, title: "让判断跟着每一步走", concept: "if 条件", task: "把危险判断放进移动循环；危险出现在哪一步都要能处理。",
        starter: reference.replace("    if is_hazard_ahead():", "if is_hazard_ahead():"), reference,
        functions: ["move", "shield", "collect", "at_beacon", "is_hazard_ahead"],
        cases: [
          makeCase("clear", "无危险", { grid: straight(3), energy: 8, required: 1 }),
          makeCase("one", "一个危险", { grid: straight(5, { hazards: [2] }), energy: 12, required: 1 }),
          makeCase("many", "多个危险", { grid: straight(6, { hazards: [1, 4] }), energy: 14, required: 1 })
        ] })
    };
  }

  {
    const reference = source(
      "safe = is_path_clear() and not is_hazard_ahead() and energy_remaining() >= 2",
      "report(safe)",
      "if safe:",
      "    move()"
    );
    const conditionCase = (id, label, tile, energy, expected) => makeCase(id, label, {
      grid: grid("_____", `_S${tile}g_`, "_____"), energy, required: 0, requireObjective: false,
      stateChecks: [{ kind: "report", equals: expected, message: `安全规则应报告 ${expected ? "True" : "False"}` }]
    });
    specs[14] = {
      grid: grid("_____", "_Sgg_", "_____"), startDir: "E", energy: 2, required: 0,
      pythonStudio: studio({ no: 14, title: "把三个条件合成守卫", concept: "and / not / 边界", task: "只有前方可走、不是危险格，并且移动后还能剩 1 点能量时才前进。",
        starter: reference.replace(" and not is_hazard_ahead()", " or not is_hazard_ahead()"), reference,
        functions: ["move", "is_path_clear", "is_hazard_ahead", "energy_remaining"],
        cases: [
          conditionCase("clear-2", "通路 · 能量 2", "g", 2, true),
          conditionCase("clear-1", "通路 · 能量 1", "g", 1, false),
          conditionCase("hazard-2", "危险 · 能量 2", "H", 2, false),
          conditionCase("hazard-1", "危险 · 能量 1", "H", 1, false),
          conditionCase("wall-2", "岩石 · 能量 2", "#", 2, false),
          conditionCase("wall-1", "岩石 · 能量 1", "#", 1, false),
          conditionCase("void-2", "边界 · 能量 2", "_", 2, false),
          conditionCase("void-1", "边界 · 能量 1", "_", 1, false)
        ] })
    };
  }

  {
    const reference = source("while not at_beacon():", "    move()", "collect()");
    const distanceCase = (distance) => makeCase(`distance-${distance}`, `距离 ${distance}`, {
      grid: distance === 0 ? grid("_____", "_Sgg_", "_____") : straight(distance),
      targetPositions: distance === 0 ? [{ x: 1, y: 1 }] : undefined,
      energy: Math.max(4, distance + 2), required: 1
    });
    specs[15] = {
      grid: straight(4), startDir: "E", energy: 8, required: 1,
      pythonStudio: studio({ no: 15, title: "不知道距离也能停下", concept: "while 停止条件", task: "不要把距离写进程序；到达目标时循环应执行 0 次并正常采集。",
        starter: reference.replace("while not at_beacon():", "if not at_beacon():"), reference,
        functions: ["move", "collect", "at_beacon"], cases: [0, 1, 4, 6].map(distanceCase) })
    };
  }

  {
    const reference = source(
      "while not at_beacon():",
      "    if is_hazard_ahead():",
      "        shield()",
      "    move()",
      "collect()"
    );
    specs[16] = {
      grid: straight(5, { hazards: [3] }), startDir: "E", energy: 12, required: 1,
      pythonStudio: studio({ no: 16, title: "同一条规则完成陌生救援", concept: "控制流综合", task: "让距离和危险位置改变后，同一份自动救援程序仍能完成任务。",
        starter: reference.replace("    if is_hazard_ahead():", "if is_hazard_ahead():"), reference,
        functions: ["move", "shield", "collect", "at_beacon", "is_hazard_ahead"],
        cases: [
          makeCase("short", "短路无危险", { grid: straight(2), energy: 6, required: 1 }),
          makeCase("middle", "中段危险", { grid: straight(5, { hazards: [3] }), energy: 12, required: 1 }),
          makeCase("moving-risk", "危险位置改变", { grid: straight(7, { hazards: [1, 6] }), energy: 16, required: 1 })
        ] })
    };
  }

  {
    const reference = source(
      "collected = 0",
      "for _ in range(course_value(\"target_count\")):",
      "    while not at_beacon():",
      "        move()",
      "    collect()",
      "    collected = collected + 1",
      "report(collected)"
    );
    const beaconCase = (id, label, row, count, expected) => makeCase(id, label, {
      grid: grid("_".repeat(row.length), row, "_".repeat(row.length)), energy: 16, required: count,
      inputs: { target_count: count }, requireObjective: count > 0,
      stateChecks: [
        { kind: "variable-event-sync", name: "collected", eventType: "collect", equals: expected, message: "collected 必须与真实 collect() 事件一一对应" },
        { kind: "report", equals: expected, message: `最终应报告 ${expected}` }
      ]
    });
    specs[17] = {
      grid: grid("___________", "_SgBgBgBgg_", "___________"), startDir: "E", energy: 16, required: 3,
      pythonStudio: studio({ no: 17, title: "每次采集，计数一次", concept: "变量与事件", task: "只在 collect() 成功后更新计数，不能硬编码最后答案。",
        starter: reference.replace("    collected = collected + 1", "collected = collected + 1"), reference,
        functions: ["range", "move", "collect", "at_beacon"], features: ["for-loops"],
        cases: [
          beaconCase("none", "0 座信标", "_Sgggg_", 0, 0),
          beaconCase("one", "1 座信标", "_SgBgg_", 1, 1),
          beaconCase("three", "3 座信标", "_SgBgBgBgg_", 3, 3)
        ] })
    };
  }

  {
    const reference = source(
      "start_energy = energy_remaining()",
      "while not at_beacon():",
      "    if is_hazard_ahead():",
      "        shield()",
      "    move()",
      "collect()",
      "energy_used = start_energy - energy_remaining()",
      "report(energy_used)"
    );
    const energyCase = (id, label, distance, hazards, expected) => makeCase(id, label, {
      grid: straight(distance, { hazards }), energy: 20, required: 1,
      stateChecks: [
        { kind: "variable", name: "energy_used", equals: expected, message: `能量账本应记录 ${expected}` },
        { kind: "report", equals: expected, message: `最终应报告消耗 ${expected}` }
      ]
    });
    specs[18] = {
      grid: straight(4, { hazards: [2] }), startDir: "E", energy: 20, required: 1,
      pythonStudio: studio({ no: 18, title: "从真实余额算消耗", concept: "能量账本", task: "移动和护盾都消耗能量；用开始值减当前值得到真实账目。",
        starter: reference.replace("start_energy - energy_remaining()", "start_energy - 4"), reference,
        functions: ["move", "shield", "collect", "at_beacon", "is_hazard_ahead", "energy_remaining"],
        cases: [energyCase("plain", "3 步无护盾", 3, [], 3), energyCase("one-shield", "4 步 1 次护盾", 4, [2], 5), energyCase("two-shields", "6 步 2 次护盾", 6, [1, 5], 8)] })
    };
  }

  {
    const reference = source(
      "def move_steps(steps):",
      "    for _ in range(steps):",
      "        move()",
      "",
      "move_steps(course_value(\"steps\"))",
      "collect()"
    );
    const parameterCase = (steps) => makeCase(`steps-${steps}`, `参数 ${steps}`, {
      grid: steps === 0 ? grid("_____", "_Sgg_", "_____") : straight(steps), targetPositions: steps === 0 ? [{ x: 1, y: 1 }] : undefined,
      energy: Math.max(4, steps + 2), required: 1, inputs: { steps }
    });
    specs[19] = {
      grid: straight(4), startDir: "E", energy: 8, required: 1,
      pythonStudio: studio({ no: 19, title: "参数决定工具做几次", concept: "函数参数", task: "参数名可以自己定，但它必须真正控制循环次数。",
        starter: reference.replace("range(steps)", "range(2)"), reference,
        functions: ["range", "move", "collect"], features: ["functions", "for-loops"],
        cases: [0, 1, 4].map(parameterCase) })
    };
  }

  {
    const reference = source(
      "def energy_after(steps):",
      "    return energy_remaining() - steps",
      "",
      "steps = course_value(\"steps\")",
      "reserve = course_value(\"reserve\")",
      "enough = energy_after(steps) >= reserve",
      "report(enough)",
      "if enough:",
      "    while not at_beacon():",
      "        move()",
      "    collect()"
    );
    const returnCase = (id, label, energy, steps, reserve, expected) => makeCase(id, label, {
      grid: straight(steps), energy, required: 1, inputs: { steps, reserve }, requireObjective: expected,
      stateChecks: [
        { kind: "report", equals: expected, message: `调用者的决定应为 ${expected ? "True" : "False"}` },
        { kind: "function-return", name: "energy_after", equals: energy - steps, message: "函数应返回移动后的能量" }
      ]
    });
    specs[20] = {
      grid: straight(3), startDir: "E", energy: 7, required: 1,
      pythonStudio: studio({ no: 20, title: "返回值要被调用者使用", concept: "return", task: "函数只计算并返回答案；调用者用答案决定是否出发。",
        starter: reference.replace("return energy_remaining() - steps", "return energy_remaining()"), reference,
        functions: ["move", "collect", "at_beacon", "energy_remaining"], features: ["functions"],
        cases: [returnCase("above", "高于保留线", 8, 3, 2, true), returnCase("equal", "正好等于保留线", 5, 3, 2, true), returnCase("below", "低于保留线", 4, 3, 2, false)] })
    };
  }

  {
    const reference = source(
      "tasks = course_value(\"tasks\")",
      "for distance in tasks:",
      "    for _ in range(distance):",
      "        move()",
      "    collect()",
      "report(len(tasks))"
    );
    const listCase = (id, label, tasks, row) => makeCase(id, label, {
      grid: grid("_".repeat(row.length), row, "_".repeat(row.length)), energy: 20, required: tasks.length,
      inputs: { tasks }, requireObjective: tasks.length > 0,
      stateChecks: [{ kind: "report", equals: tasks.length, message: `应处理清单中的 ${tasks.length} 个任务` }]
    });
    specs[21] = {
      grid: grid("___________", "_SgBgBgBgg_", "___________"), startDir: "E", energy: 20, required: 3,
      pythonStudio: studio({ no: 21, title: "让清单决定要做多少次", concept: "列表遍历", task: "不要复制任务代码；清单变长或变空时程序结构保持不变。",
        starter: reference.replace("for distance in tasks:", "for distance in tasks[0:1]:"), reference,
        functions: ["range", "len", "move", "collect"], features: ["for-loops", "lists"],
        cases: [
          listCase("empty", "空清单", [], "_Sggggggg_"),
          listCase("one", "1 项", [2], "_SgBggggg_"),
          listCase("three", "3 项", [2, 2, 2], "_SgBgBgBgg_"),
          listCase("four", "4 项", [1, 2, 1, 2], "_SBgBBgBgg_")
        ] })
    };
  }

  {
    const reference = source(
      "segments = course_value(\"segments\")",
      "segments.append(course_value(\"last\"))",
      "for index in range(len(segments)):",
      "    for _ in range(segments[index]):",
      "        move()",
      "    collect()",
      "report(len(segments))"
    );
    const indexCase = (id, label, segments, last, row) => makeCase(id, label, {
      grid: grid("_".repeat(row.length), row, "_".repeat(row.length)), energy: 20, required: segments.length + 1,
      inputs: { segments, last }, stateChecks: [{ kind: "report", equals: segments.length + 1, message: "len() 应与追加后的清单长度一致" }]
    });
    specs[22] = {
      grid: grid("____________", "_SBgBgBgBgg_", "____________"), startDir: "E", energy: 20, required: 4,
      pythonStudio: studio({ no: 22, title: "追加以后仍不越界", concept: "append / len / index", task: "追加任务后用 len() 控制 0 到长度减一的索引范围。",
        starter: reference.replace("range(len(segments))", "range(len(segments) + 1)"), reference,
        functions: ["range", "len", "append", "move", "collect"], features: ["for-loops", "lists"],
        cases: [
          indexCase("four", "长度 4 · 索引 0–3", [1, 2, 2], 2, "_SBgBgBgBgg_"),
          indexCase("two", "长度 2", [3], 2, "_SggBgBggg_"),
          indexCase("five", "长度 5", [1, 1, 2, 1], 2, "_SBBgBBgBgg_")
        ] })
    };
  }

  {
    const reference = source(
      "rules = course_value(\"rules\")",
      "terrain = course_value(\"terrain\")",
      "action = rules[terrain]",
      "report(action)",
      "if action == \"shield\":",
      "    shield()",
      "while not at_beacon():",
      "    move()",
      "collect()"
    );
    const dictCase = (id, label, rules, terrain, expected, hazard = false) => makeCase(id, label, {
      grid: straight(3, { hazards: hazard ? [1] : [] }), energy: 9, required: 1, inputs: { rules, terrain },
      stateChecks: [{ kind: "report", equals: expected, message: `规则 ${terrain} 应查到 ${expected}` }]
    });
    specs[23] = {
      grid: straight(3, { hazards: [1] }), startDir: "E", energy: 9, required: 1,
      pythonStudio: studio({ no: 23, title: "查到规则，还要真的使用", concept: "字典查询", task: "字典顺序和取值会改变；用当前名字查规则，并让结果影响行动。",
        starter: reference.replace("rules[terrain]", "rules[\"plain\"]"), reference,
        functions: ["move", "shield", "collect", "at_beacon"], features: ["dictionaries"],
        cases: [
          dictCase("hazard", "危险规则", { plain: "move", hazard: "shield" }, "hazard", "shield", true),
          dictCase("reordered", "顺序改变", { hazard: "shield", plain: "move" }, "hazard", "shield", true),
          dictCase("plain", "普通地面", { hazard: "shield", plain: "move" }, "plain", "move", false),
          makeCase("missing", "缺少名字 · 调试", { grid: straight(2), energy: 6, required: 1, inputs: { rules: { plain: "move" }, terrain: "hazard" }, expectedError: "KeyError" })
        ] })
    };
  }

  {
    const reference = source(
      "def remaining_after(energy, cost):",
      "    return energy - cost",
      "",
      "mission_order = course_value(\"mission_order\")",
      "costs = course_value(\"costs\")",
      "remaining = course_value(\"budget\")",
      "rescued = 0",
      "for name in mission_order:",
      "    cost = costs[name]",
      "    if remaining >= cost:",
      "        rescue(name)",
      "        remaining = remaining_after(remaining, cost)",
      "        rescued = rescued + 1",
      "report(rescued)"
    );
    const schedulerCase = (id, label, missionOrder, costs, budget, expectedNames) => makeCase(id, label, {
      grid: grid("_____", "_Sgg_", "_____"), energy: 20, required: 0, requireObjective: false,
      inputs: { mission_order: missionOrder, costs, budget },
      stateChecks: [
        { kind: "rescues", equals: expectedNames, message: "实际救援顺序应符合任务清单和预算" },
        { kind: "report", equals: expectedNames.length, message: `应报告完成 ${expectedNames.length} 项救援` },
        ...(expectedNames.length ? [{ kind: "function-call", name: "remaining_after", message: "能量更新必须使用带参数并返回结果的函数" }] : [])
      ]
    });
    specs[24] = {
      grid: grid("_____", "_Sgg_", "_____"), startDir: "E", energy: 20, required: 0,
      pythonStudio: studio({ no: 24, title: "让数据驱动调度决定", concept: "综合调度", task: "按清单顺序查费用，在预算允许时调用 rescue(name) 并更新计数。",
        starter: reference.replace("remaining >= cost", "remaining > cost"), reference,
        functions: ["range", "rescue", "remaining_after"], features: ["for-loops", "lists", "dictionaries", "functions"],
        cases: [
          schedulerCase("normal", "常规调度", ["A", "B", "C"], { A: 2, B: 3, C: 2 }, 5, ["A", "B"]),
          schedulerCase("boundary", "正好够用", ["C", "A"], { A: 2, C: 2 }, 4, ["C", "A"]),
          schedulerCase("skip", "跳过昂贵任务", ["B", "A", "C"], { A: 2, B: 8, C: 1 }, 3, ["A", "C"]),
          schedulerCase("empty", "空任务", [], {}, 5, [])
        ] })
    };
  }

  {
    const reference = source(
      "map_data = course_value(\"map\")",
      "repair = course_value(\"repair\")",
      "map_data[repair[1]][repair[0]] = \"g\"",
      "build_world(map_data)",
      "while not at_beacon():",
      "    move()",
      "collect()"
    );
    const matrixCase = (id, label, map, repair, expected) => makeCase(id, label, {
      grid: expected, energy: 12, required: 1, inputs: { map: map.map((row) => [...row]), repair },
      stateChecks: [{ kind: "world-grid", equals: expected, message: "修复后世界应与二维表一致" }]
    });
    const map4x7 = ["_______", "_S_gB__", "_gggg__", "_______"];
    const fixed4x7 = ["_______", "_SggB__", "_gggg__", "_______"];
    const map5x6 = ["______", "_S_gB_", "_gggg_", "_gggg_", "______"];
    const fixed5x6 = ["______", "_SggB_", "_gggg_", "_gggg_", "______"];
    specs[25] = {
      grid: fixed4x7, startDir: "E", energy: 12, required: 1,
      pythonStudio: studio({ no: 25, title: "横坐标是 x，行号是 y", concept: "grid[y][x]", task: "在非正方形地图上修复指定格；界面会同时高亮 x 与 y。",
        starter: reference.replace("map_data[repair[1]][repair[0]]", "map_data[repair[0]][repair[1]]"), reference,
        functions: ["build_world", "move", "collect", "at_beacon"], features: ["lists", "world-building"],
        cases: [matrixCase("4x7", "4 行 × 7 列", map4x7, [2, 1], fixed4x7), matrixCase("5x6", "5 行 × 6 列", map5x6, [2, 1], fixed5x6)] })
    };
  }

  {
    const reference = source(
      "blueprint = course_value(\"map\")",
      "gaps = course_value(\"gaps\")",
      "materials = course_value(\"materials\")",
      "build_world(blueprint)",
      "for x in gaps:",
      "    place_tile(x, 1, \"g\")",
      "    materials = materials - 1",
      "report(materials)",
      "while not at_beacon():",
      "    move()",
      "collect()"
    );
    const bridgeCase = (id, label, map, gaps, materials, expectedGrid) => makeCase(id, label, {
      grid: expectedGrid, energy: 14, required: 1, inputs: { map, gaps, materials },
      stateChecks: [
        { kind: "world-grid", equals: expectedGrid, message: "桥面必须由缺口清单生成" },
        { kind: "world-placements", equals: gaps.length, message: "每个缺口只能产生一次真实铺设" },
        { kind: "report", equals: materials - gaps.length, message: "材料余额应按实际新格数扣除" }
      ]
    });
    specs[26] = {
      grid: ["_________", "_SggggB__", "_________"], startDir: "E", energy: 14, required: 1,
      pythonStudio: studio({ no: 26, title: "缺口清单就是施工计划", concept: "数据驱动建造", task: "只遍历缺口列铺桥；材料消耗必须等于实际新增格数。",
        starter: reference.replace("for x in gaps:", "for x in range(len(gaps) + 1):").replace("place_tile(x, 1", "place_tile(gaps[x], 1"), reference,
        functions: ["range", "len", "build_world", "place_tile", "move", "collect", "at_beacon"], features: ["for-loops", "lists", "world-building"],
        cases: [
          bridgeCase("two-gaps", "两处缺口", ["_________", "_S__ggB__", "_________"], [2, 3], 4, ["_________", "_SggggB__", "_________"]),
          bridgeCase("three-gaps", "三处缺口", ["__________", "_S___ggB__", "__________"], [2, 3, 4], 5, ["__________", "_SgggggB__", "__________"])
        ] })
    };
  }

  {
    const reference = source(
      "explorer = Explorer(\"Explorer\", 8, 1, 2, \"E\")",
      "flyer = Flyer(\"Flyer\", 6, 1, 1, \"E\")",
      "ship = Spaceship(\"Ship\", 6, 5, 1, \"E\")",
      "while not at_beacon():",
      "    explorer.move()",
      "explorer.collect()",
      "ship.upload()"
    );
    specs[27] = {
      grid: grid("_______", "_ggggR_", "_SgBgg_", "_______"), startDir: "E", energy: 16, required: 1,
      pythonStudio: studio({ no: 27, title: "能力属于对象，不属于名字", concept: "对象职责", task: "Explorer 负责采集，Flyer 负责侦察，Spaceship 负责上传；调用要落在真实对象上。",
        starter: reference.replace("explorer.collect()", "flyer.collect()"), reference,
        functions: ["Explorer", "Flyer", "Spaceship", "move", "collect", "upload", "at_beacon"], objectModel: true, multiObject: true,
        checks: [
          { kind: "object-action", name: "Explorer", type: "Explorer", action: "collect", message: "采集必须由 Explorer 实例完成" },
          { kind: "object-action", name: "Ship", type: "Spaceship", action: "upload", message: "上传必须由 Spaceship 实例完成" }
        ],
        cases: [
          makeCase("roles", "角色职责", { grid: grid("_______", "_ggggR_", "_SgBgg_", "_______"), energy: 16, required: 1 }),
          makeCase("same-names", "同名不等于同能力", { grid: grid("_______", "_ggggR_", "_SgBgg_", "_______"), energy: 16, required: 1 })
        ] })
    };
  }

  {
    const reference = source(
      "starts = course_value(\"starts\")",
      "atlas = Explorer(\"Atlas\", 8, starts[0][0], starts[0][1], \"E\")",
      "nova = Explorer(\"Nova\", 8, starts[1][0], starts[1][1], \"E\")",
      "atlas.move()",
      "atlas.collect()",
      "nova.move()",
      "nova.collect()"
    );
    const instanceGrid = grid("_______", "_SBggg_", "_SBggg_", "_______");
    specs[28] = {
      grid: instanceGrid, startDir: "E", energy: 16, required: 2,
      pythonStudio: studio({ no: 28, title: "同一种类型，也有各自状态", concept: "实例与别名", task: "创建两个真实 Explorer 实例；b = a 只是别名，不会生成第二份状态。",
        starter: reference.replace("nova = Explorer(\"Nova\", 8, starts[1][0], starts[1][1], \"E\")", "nova = atlas"), reference,
        functions: ["Explorer", "move", "collect"], features: ["lists"], objectModel: true, multiObject: true,
        checks: [{ kind: "distinct-objects", names: ["Atlas", "Nova"], message: "Atlas 与 Nova 必须是两个独立对象档案" }],
        cases: [
          makeCase("original", "上下两条任务", { grid: instanceGrid, energy: 16, required: 2, inputs: { starts: [[1, 1], [1, 2]] } }),
          makeCase("swapped", "交换起点数据", { grid: instanceGrid, energy: 16, required: 2, inputs: { starts: [[1, 2], [1, 1]] } })
        ] })
    };
  }

  {
    const reference = source(
      "plan = course_value(\"plan\")",
      "collector = Explorer(\"Collector\", 8, plan[\"collector_start\"][0], plan[\"collector_start\"][1], plan[\"direction\"], 0, 1)",
      "carrier = Spaceship(\"Carrier\", 8, plan[\"carrier_start\"][0], plan[\"carrier_start\"][1], plan[\"direction\"], 0, plan[\"capacity\"])",
      "for _ in range(plan[\"collector_moves\"]):",
      "    collector.move()",
      "collector.collect()",
      "collector.transfer_to(carrier, 1)",
      "for _ in range(plan[\"carrier_moves\"]):",
      "    carrier.move()",
      "carrier.upload()"
    );
    const transferGrid = grid("_______", "_SBggR_", "_______");
    const swappedGrid = grid("_______", "_RgBSg_", "_______");
    const originalPlan = { collector_start: [1, 1], carrier_start: [3, 1], direction: "E", collector_moves: 1, carrier_moves: 2, capacity: 2 };
    const swappedPlan = { collector_start: [4, 1], carrier_start: [2, 1], direction: "W", collector_moves: 1, carrier_moves: 1, capacity: 2 };
    const transferCase = (id, label, map, plan, handoffCells, expectedError) => makeCase(id, label, {
      grid: map, energy: 18, required: 1, inputs: { plan }, expectedError,
      courseRules: { handoffCells, requireCargoForUpload: true }
    });
    specs[29] = {
      grid: transferGrid, startDir: "E", energy: 18, required: 1,
      pythonStudio: studio({ no: 29, title: "交接要同时满足三条规则", concept: "原子转移", task: "发送者有货、接收者有容量，且双方相邻并在交接区时，transfer_to 才会一次完成。",
        starter: reference.replace("collector.transfer_to(carrier, 1)", "carrier.transfer_to(collector, 1)"), reference,
        functions: ["Explorer", "Spaceship", "range", "move", "collect", "upload", "transfer_to"], features: ["for-loops", "dictionaries"], objectModel: true, multiObject: true,
        rules: { handoffCells: [[2, 1], [3, 1]], requireCargoForUpload: true },
        checks: [
          { kind: "transfer", from: "Collector", to: "Carrier", amount: 1, message: "必须留下 Collector → Carrier 的合法交接事件" },
          { kind: "object", name: "Carrier", property: "cargo", equals: 0, message: "上传完成后货物应从 Carrier 的档案中清零" }
        ],
        cases: [
          transferCase("legal", "合法交接", transferGrid, originalPlan, [[2, 1], [3, 1]]),
          transferCase("swapped", "交换起点与交接区", swappedGrid, swappedPlan, [[2, 1], [3, 1]]),
          transferCase("capacity", "容量不足 · 原子失败", transferGrid, { ...originalPlan, capacity: 0 }, [[2, 1], [3, 1]], "容量不足")
        ] })
    };
  }

  {
    const reference = source(
      "atlas = Explorer(\"Atlas\", 6, 1, 1, \"E\")",
      "while not is_passage_clear():",
      "    atlas.wait()",
      "atlas.move()",
      "report(current_tick())"
    );
    const timeCase = (id, label, clearAt, expectedWaits, expectedError) => makeCase(id, label, {
      grid: grid("_____", "_Sgg_", "_____"), energy: 8, required: 0, requireObjective: false,
      courseRules: { passageCell: [2, 1], movingObjects: [{ name: "truck", x: 2, y: 1, clearAt }] }, expectedError,
      stateChecks: expectedError ? [] : [
        { kind: "object", name: "Atlas", property: "waits", equals: expectedWaits, message: `应等待 ${expectedWaits} 拍` },
        { kind: "tick", equals: expectedWaits, message: "离散时间必须由真实 wait() 推进" }
      ]
    });
    specs[30] = {
      grid: grid("_____", "_Sgg_", "_____"), startDir: "E", energy: 8, required: 0,
      pythonStudio: studio({ no: 30, title: "等待不是通行证", concept: "离散时间与占位", task: "条件必须每拍重读；wait() 只推进时间，移动前仍要确认通道真的空了。",
        starter: reference.replace("while not is_passage_clear():", "if not is_passage_clear():"), reference,
        functions: ["Explorer", "wait", "move", "is_passage_clear", "current_tick"], objectModel: true, multiObject: true,
        rules: { passageCell: [2, 1], movingObjects: [{ name: "truck", x: 2, y: 1, clearAt: 1 }] },
        cases: [timeCase("clear", "起初就是空的", 0, 0), timeCase("delay-1", "等待 1 拍", 1, 1), timeCase("delay-3", "等待 3 拍", 3, 3), timeCase("blocked", "永久占用 · 安全停止", null, 0, "循环")]
      })
    };
  }

  {
    const reference = source(
      "level = course_value(\"level\")",
      "validate_world(level)",
      "build_world(level[\"map\"])",
      "while not at_beacon():",
      "    move()",
      "collect()",
      "while not at_relay():",
      "    move()",
      "upload()"
    );
    const creatorCase = (id, label, level, expectedError) => makeCase(id, label, {
      grid: level.map, energy: 14, required: level.beacons, inputs: { level }, expectedError,
      stateChecks: expectedError ? [] : [{ kind: "world-schema", property: "name", equals: level.name, message: "发布证据必须来自当前关卡 schema" }]
    });
    const levelA = { name: "Bridge Relay", map: ["________", "_SgBggR_", "________"], beacons: 1, upload: true };
    const levelB = { name: "Long Relay", map: ["__________", "_SggBgggR_", "__________"], beacons: 1, upload: true };
    specs[31] = {
      grid: levelA.map, startDir: "E", energy: 14, required: 1,
      pythonStudio: studio({ no: 31, title: "数据、规则和作者解一起发布", concept: "关卡 schema", task: "修改有意义的地图位置与目标；静态 schema 校验后，还要动态运行作者解。",
        starter: reference.replace("level = course_value(\"level\")", "level = {\"name\": \"Broken\", \"map\": course_value(\"level\")[\"map\"], \"beacons\": 2, \"upload\": True}"), reference,
        functions: ["validate_world", "build_world", "move", "collect", "upload", "at_beacon", "at_relay"], features: ["dictionaries", "lists", "world-building"],
        cases: [creatorCase("bridge", "桥面模板", levelA), creatorCase("long", "改变目标位置", levelB), creatorCase("invalid", "数量不一致 · 调试", { ...levelA, name: "Broken", beacons: 2 }, "schema")]
      })
    };
  }

  {
    const reference = source(
      "world = course_value(\"level\")",
      "validate_world(world)",
      "build_world(world[\"map\"])",
      "explorer = Explorer(\"Explorer\", 10, 1, 1, \"E\", 0, 1)",
      "carrier = Spaceship(\"Carrier\", 10, 3, 1, \"E\", 0, 2)",
      "explorer.move()",
      "explorer.collect()",
      "explorer.transfer_to(carrier, 1)",
      "while not at_relay():",
      "    while not is_passage_clear():",
      "        carrier.wait()",
      "    carrier.move()",
      "carrier.upload()"
    );
    const finalLevel = { name: "Rebuild Relay", map: ["_______", "_SBggR_", "_______"], beacons: 1, upload: true };
    const capstoneCase = (id, label, clearAt) => makeCase(id, label, {
      grid: finalLevel.map, energy: 22, required: 1, inputs: { level: finalLevel },
      courseRules: { handoffCells: [[2, 1], [3, 1]], requireCargoForUpload: true, passageCell: [4, 1], movingObjects: [{ name: "truck", x: 4, y: 1, clearAt }] },
      stateChecks: [
        { kind: "world-schema", property: "beacons", equals: 1, message: "关卡 schema 必须通过" },
        { kind: "object-action", name: "Explorer", type: "Explorer", action: "collect", message: "Explorer 必须采集" },
        { kind: "transfer", from: "Explorer", to: "Carrier", amount: 1, message: "必须完成合法交接" },
        { kind: "object-action", name: "Carrier", type: "Spaceship", action: "upload", message: "Carrier 必须上传" },
        { kind: "object", name: "Carrier", property: "cargo", equals: 0, message: "作品交付后 Carrier 不应继续持有货物" }
      ]
    });
    specs[32] = {
      grid: finalLevel.map, startDir: "E", energy: 22, required: 1,
      pythonStudio: studio({ no: 32, title: "把四道能力门连成作品", concept: "综合重建", task: "关卡可验证、对象独立、交接合法、通道同步，四道能力门必须同时通过。",
        starter: reference.replace("explorer.transfer_to(carrier, 1)\n", ""), reference,
        functions: ["validate_world", "build_world", "Explorer", "Spaceship", "move", "wait", "collect", "upload", "at_relay", "transfer_to", "is_passage_clear"],
        features: ["dictionaries", "lists", "world-building"], objectModel: true, multiObject: true,
        rules: { handoffCells: [[2, 1], [3, 1]], requireCargoForUpload: true, passageCell: [4, 1], movingObjects: [{ name: "truck", x: 4, y: 1, clearAt: 1 }] },
        cases: [capstoneCase("quick", "快速清障", 1), capstoneCase("delayed", "延迟三拍", 3)] })
    };
  }

  const mainInputs = {
    17: { target_count: 3 },
    19: { steps: 4 },
    20: { steps: 3, reserve: 2 },
    21: { tasks: [2, 2, 2] },
    22: { segments: [1, 2, 2], last: 2 },
    23: { rules: { plain: "move", hazard: "shield" }, terrain: "hazard" },
    24: { mission_order: ["A", "B", "C"], costs: { A: 2, B: 3, C: 2 }, budget: 5 },
    25: { map: ["_______", "_S_gB__", "_gggg__", "_______"].map((row) => [...row]), repair: [2, 1] },
    26: { map: ["_________", "_S__ggB__", "_________"], gaps: [2, 3], materials: 4 },
    28: { starts: [[1, 1], [1, 2]] },
    29: { plan: { collector_start: [1, 1], carrier_start: [3, 1], direction: "E", collector_moves: 1, carrier_moves: 2, capacity: 2 } },
    31: { level: { name: "Bridge Relay", map: ["________", "_SgBggR_", "________"], beacons: 1, upload: true } },
    32: { level: { name: "Rebuild Relay", map: ["_______", "_SBggR_", "_______"], beacons: 1, upload: true } }
  };

  Object.entries(specs).forEach(([lessonNo, spec]) => {
    const mission = course.missions[Number(lessonNo) - 1];
    Object.assign(mission, spec, {
      lessonMode: `core-v1.6-${String(lessonNo).padStart(2, "0")}`,
      playgroundBrief: {
        challenge: mission.target,
        intro: `本课能力门：${mission.checkpoint}`,
        bullets: ["先运行起始程序，保留失败证据。", "修改后用同一份代码验证所有输入场景。", "成功代码、状态和迁移结果会一起保存。"],
        goal: mission.target
      }
    });
    mission.pythonStudio.courseInputs = mainInputs[lessonNo] || mission.pythonStudio.cases?.[0]?.inputs || {};
  });

  course.version = "core-v1.6";
})(typeof globalThis !== "undefined" ? globalThis : window);
