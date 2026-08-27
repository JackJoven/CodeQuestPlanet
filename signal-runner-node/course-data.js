(function () {
  const stages = [
    {
      id: "stage-1",
      number: 1,
      range: "1-8",
      title: "基础动作与路线规划",
      chapter: "第 1 章：信标启航",
      ability: "顺序、方向、后退、等待、坐标、日志",
      work: "基础采集任务包"
    },
    {
      id: "stage-2",
      number: 2,
      range: "9-16",
      title: "循环、条件与状态",
      chapter: "第 2 章：能源搜救",
      ability: "for、range、缩进、if、逻辑、while、能量",
      work: "能量与危险关卡包"
    },
    {
      id: "stage-3",
      number: 3,
      range: "17-24",
      title: "状态、类型与数据容器",
      chapter: "第 3 章：数据驱动远征",
      ability: "变量、状态、类型、实例、参数、返回值、列表",
      work: "数据与函数任务包"
    },
    {
      id: "stage-4",
      number: 4,
      range: "25-32",
      title: "世界建模与多对象系统",
      chapter: "第 4 章：重建星系",
      ability: "字典、二维地图、世界建造、组件、多对象、同步",
      work: "共同核心毕业包"
    },
    {
      id: "stage-5",
      number: 5,
      range: "33-40",
      title: "搜索、排序与路径规划",
      chapter: "第 5 章：迷宫与寻路",
      ability: "搜索、排序、visited、DFS、BFS、路径还原",
      work: "自动寻路任务包"
    },
    {
      id: "stage-6",
      number: 6,
      range: "41-48",
      title: "综合算法与原创作品",
      chapter: "第 6 章：策略发布会",
      ability: "贪心、反例、枚举、剪枝、动态规划入门、测试",
      work: "毕业原创关卡"
    }
  ];

  const directions = ["N", "E", "S", "W"];
  const vectors = {
    N: { x: 0, y: -1 },
    E: { x: 1, y: 0 },
    S: { x: 0, y: 1 },
    W: { x: -1, y: 0 }
  };

  const routePlans = [
    {
      id: "line-upload",
      width: 9,
      height: 5,
      start: { x: 1, y: 2 },
      startDir: "E",
      solution: ["move", "move", "collect", "move", "move", "upload"]
    },
    {
      id: "corner-upload",
      width: 8,
      height: 7,
      start: { x: 1, y: 1 },
      startDir: "E",
      solution: ["right", "move", "move", "left", "move", "collect", "move", "move", "right", "move", "upload"]
    },
    {
      id: "back-wait",
      width: 9,
      height: 5,
      start: { x: 1, y: 2 },
      startDir: "E",
      solution: ["move", "move", "back", "wait", "move", "collect", "move", "move", "upload"]
    },
    {
      id: "two-targets",
      width: 10,
      height: 5,
      start: { x: 1, y: 2 },
      startDir: "E",
      solution: ["move", "move", "collect", "move", "move", "collect", "move", "move", "upload"]
    },
    {
      id: "repeat-line",
      width: 10,
      height: 5,
      start: { x: 1, y: 2 },
      startDir: "E",
      solution: ["repeat4", "collect", "repeat2", "upload"]
    },
    {
      id: "hazard-line",
      width: 9,
      height: 5,
      start: { x: 1, y: 2 },
      startDir: "E",
      solution: ["move", "ifHazardShield", "move", "move", "collect", "move", "move", "upload"]
    },
    {
      id: "function-route",
      width: 9,
      height: 5,
      start: { x: 1, y: 2 },
      startDir: "E",
      functionEnabled: true,
      solution: ["callRoute", "collect", "repeat3", "upload"],
      solutionFn: ["repeat2"]
    },
    {
      id: "maze-hook",
      width: 9,
      height: 7,
      start: { x: 1, y: 1 },
      startDir: "E",
      solution: ["right", "move", "move", "left", "move", "collect", "move", "move", "upload"]
    },
    {
      id: "three-targets",
      width: 11,
      height: 5,
      start: { x: 1, y: 2 },
      startDir: "E",
      solution: ["move", "move", "collect", "move", "move", "collect", "move", "move", "collect", "move", "upload"]
    },
    {
      id: "zigzag",
      width: 9,
      height: 7,
      start: { x: 1, y: 5 },
      startDir: "E",
      solution: ["move", "move", "collect", "left", "move", "move", "right", "move", "collect", "move", "right", "move", "upload"]
    },
    {
      id: "narrow-bridge",
      width: 10,
      height: 6,
      start: { x: 1, y: 4 },
      startDir: "E",
      solution: ["move", "move", "right", "move", "left", "move", "collect", "move", "move", "upload"]
    },
    {
      id: "spiral",
      width: 9,
      height: 7,
      start: { x: 1, y: 5 },
      startDir: "E",
      solution: ["move", "move", "left", "move", "move", "right", "move", "collect", "right", "move", "move", "upload"]
    },
    {
      id: "coordinate-scan",
      width: 12,
      height: 8,
      start: { x: 1, y: 6 },
      startDir: "E",
      solution: ["move", "move", "collect", "left", "move", "move", "right", "move", "move", "collect"]
    },
    {
      id: "segment-upload",
      width: 13,
      height: 7,
      start: { x: 1, y: 3 },
      startDir: "E",
      solution: ["move", "move", "collect", "move", "move", "collect", "right", "move", "move", "left", "move", "move", "move", "upload"]
    },
    {
      id: "creator-template",
      width: 9,
      height: 7,
      start: { x: 1, y: 1 },
      startDir: "E",
      solution: ["move", "move", "collect"]
    },
    {
      id: "core-capstone",
      width: 13,
      height: 9,
      start: { x: 1, y: 7 },
      startDir: "E",
      solution: ["move", "move", "move", "collect", "left", "move", "move", "move", "right", "move", "move", "move", "collect", "right", "move", "move", "left", "move", "move", "move", "upload"]
    }
  ];

  const lessonRows = [
    ["学习", "启动信号", "地图、角色、运行、顺序、采集", "从起点到信标，站到正确格子后采集", "第一张任务卡", "line-upload", "学习入口不是记按钮，而是理解程序会按顺序改变世界状态。", "先让学生预测到达信标需要几步，再运行参考程序，对照日志说出每一步改变了什么。", "学生会知道：采集不是装饰动作，它必须发生在正确位置。", ["空采集", "还没到信标就采集", "走过头"]],
    ["学习", "方向不是视角", "朝向、左转、右转、视角旋转", "完成含转弯的采集路线", "朝向变化记录", "corner-upload", "屏幕看起来的上下左右不等于角色真实朝向，HUD 才是程序执行依据。", "让学生旋转观察地图，再要求他们写下每次 turn 后 Neo 面向哪里。", "学生会知道：转向改变的是角色状态，不是地图本身。", ["把屏幕右边当成角色右边", "转向后忘记重新判断前方"]],
    ["学习", "路线先于代码", "路线规划、方案比较、动作成本", "先比较两条可行路线，再把选择翻译成程序", "路线比较板", "back-wait", "代码不是路线规划的起点。先看目标、比较方案，再把选中的路线翻译成指令，程序才会更短、更清楚、更不容易出错。", "比较直达路线与绕行路线是否可行、动作数量、转向次数和出错风险，再选择一条路线编程。", "学生会知道：能通关的路线不只一条，先比较再编码能减少无效尝试。", ["运行后才开始思考", "只看几何距离", "选择路线却说不出理由"]],
    ["调试", "调试侦探社", "日志、单步、错误分类", "修复方向错误并指出第一次偏离的位置", "失败卡记录", "maze-hook", "日志不是报错弹窗，而是程序留下的证据链。", "先运行一个错误程序，再用步骤编号定位第一次与正确路线不同的位置。", "学生会知道：调试要找第一处错误，而不是随机改最后一步。", ["只看最后失败", "一次修改多处", "没有记录错误步骤"]],
    ["学习", "星图坐标站", "Neo 坐标、信标坐标、坐标变化", "根据坐标依次找到两座信标并解释转向", "坐标档案", "coordinate-scan", "坐标让位置从直觉变成可记录的数据：x 向右增加，y 向下增加，镜头旋转也不会改变对象坐标。", "记录起点、两座信标和每次转向后的关键坐标，再说明路线为什么能到达目标。", "学生会知道：坐标是地图任务的数据语言，不会随着观察视角改变。", ["横纵顺序读反", "把镜头方向当坐标方向", "只记终点不记录变化"]],
    ["练习", "多段任务顺序", "分段路线、携带状态、上传", "依次采集信标 A、信标 B，再到中继站上传", "分段任务说明", "segment-upload", "复杂任务不是一条无法解释的长程序，而是几个有明确完成条件的子目标。采集会改变携带状态，上传必须发生在两座信标都已携带之后。", "把程序拆成采集 A、采集 B、前往中继站上传三段，并观察携带状态如何变化。", "学生会知道：多段任务要同时管理目标顺序和携带状态。", ["漏掉第二次采集", "提前上传", "到达中继站却没有上传"]],
    ["创作", "第一张原创路线", "关卡规则、可解性、步数限制", "选择信标位置和步数限制，制作一张可解的路线关", "原创路线规则卡", "creator-template", "原创关卡不是摆装饰，而是确定起点、目标、限制和可验证答案。系统会检查目标是否可达，以及步数限制是否足够。", "从候选格中选择信标位置，再设置严格或宽松的步数限制，用参考程序验证关卡。", "学生会知道：好的关卡必须规则清楚、路线可解、限制有意义。", ["目标不可达", "限制小于最短解", "参考程序不能通过"]],
    ["阶段作品", "陨石危机", "顺序、方向、路线、调试、坐标、分段上传", "在长路线中采集两座信标并完成最终上传", "综合能力档案", "core-capstone", "最终挑战不引入新指令，而是把前七课能力放进一张陌生长地图：先规划、再编码、观察坐标和状态，失败时用日志定位。", "完成两次采集和最终上传，逐项点亮综合能力档案，不比较速度，可以无限重试。", "学生会知道：真正掌握不是记住答案，而是能把已有方法迁移到陌生任务。", ["只会熟悉地图", "漏掉中间目标", "失败后直接查看答案"]],
    ["学习", "循环引擎点火", "重复规律、repeat、for", "把重复移动改写为循环", "循环改造单", "repeat-line", "循环的价值不是少写字，而是把重复意图表达清楚。", "先用 4 个 move 跑通，再换成 repeat(4)，比较代码长度和执行步数。", "学生会知道：循环改变表达方式，不改变实际执行次数。", ["循环次数少一格", "把 collect 放进重复段"]],
    ["学习", "range 与缩进", "range、循环次数、循环体、缩进", "判断哪些指令被循环执行", "循环体标注图", "zigzag", "缩进决定谁属于循环体，位置错了会让程序重复错误动作。", "让学生圈出哪些指令在 repeat 内，哪些只执行一次。", "学生会知道：程序结构会影响执行范围。", ["缩进范围判断错", "重复了不该重复的指令"]],
    ["学习", "危险与能量状态", "能量、危险格、护盾、状态面板", "穿越危险区并保留足够能量", "能量变化记录", "hazard-line", "状态面板会告诉你每个动作的代价：移动、开盾和踏入危险格都会消耗能量。", "每一步后记录能量变化，比较有护盾和无护盾穿越危险格的差异。", "学生会知道：程序不仅改变位置，也改变资源状态。", ["危险格前没有开盾", "只看路线不看能量"]],
    ["创作", "循环危险关", "循环、危险、限制条件", "学生设计带危险格的循环关", "循环危险原创关", "narrow-bridge", "带限制的关卡会迫使学生优化，而不是堆很多动作。", "学生设置最大步数或能量上限，要求同伴用循环压缩路线。", "学生会知道：限制条件能让关卡更有教学价值。", ["限制过松", "危险格没有影响策略"]],
    ["学习", "条件判断", "if、前方检测、当前位置检测", "前方危险才开盾，前方阻挡才转向", "条件规则卡", "hazard-line", "if 是让程序根据现场情况选择动作，不是固定替代某个按钮。", "让学生先预测条件成立与不成立时分别会执行什么。", "学生会知道：条件判断让程序开始适应地图变化。", ["条件不成立时仍期待动作发生", "检测对象写错"]],
    ["学习", "逻辑守卫", "if else、elif、and/or/not", "组合可走、能量足、不是危险", "安全协议卡", "maze-hook", "复杂安全规则通常由几个小判断组合而成。", "把可走、能量足、不是危险拆成三张条件卡，再合成安全规则。", "学生会知道：and/or/not 解决的是规则组合问题。", ["and/or 混淆", "not 的范围不清"]],
    ["练习", "while 与上传条件", "while、停止条件、是否携带信标", "未知距离移动，采集后到中继站上传", "停止条件说明", "repeat-line", "while 的核心是停止条件，条件不清楚就可能少走、过走或死循环。", "让学生写出：什么时候继续走，什么时候停下来采集或上传。", "学生会知道：循环必须有明确结束条件。", ["停止条件漏掉上传", "把 while 当成无限 repeat"]],
    ["阶段作品", "能量与危险 Boss 关", "循环、条件、while、能量、上传", "完成综合危险区任务", "能量与危险任务包", "spiral", "Boss 关要综合检查路线、能量、条件和上传顺序。", "学生提交一张能量变化表，并说明哪一步最容易失败。", "学生会知道：综合任务需要同时管理位置和状态。", ["只优化步数不看风险", "失败卡没有归类"]],
    ["学习", "变量能量舱", "变量、常量、赋值、计数器", "记录采集数和剩余能量", "变量追踪表", "two-targets", "变量是给变化状态起名字，让程序能记住发生过什么；常量则标记本课不应改变的规则值。", "让学生把 collected 从 0 写到 2，标出每次变量变化发生在哪一步，并区分它与固定任务目标。", "学生会知道：变量记录的是运行过程中的状态，不是手工写出的最终答案。", ["变量没有随采集更新", "把变量当成固定文字", "修改了本应固定的任务目标"]],
    ["调试", "多变量控制台", "更新变量、计算、状态依赖", "根据逐步日志还原变量变化", "状态账本", "narrow-bridge", "多个变量会互相影响：步数只记录移动次数，能量消耗还包含护盾等额外动作。", "让学生根据实际运行轨迹修复 energy_used 的来源，并解释为什么它不能直接等于 steps。", "学生会知道：复杂任务需要追踪变量之间的数据来源，而不只记录最终结果。", ["把能量消耗直接等同步数", "只记录最终结果", "变量使用了错误的数据来源"]],
    ["学习", "类型说明书", "类型、属性、方法、点语法", "比较探测员与飞板的能力边界", "类型对照表", "function-route", "类型规定对象能保存哪些属性、能执行哪些方法；点语法表示由哪个对象负责动作。", "让学生对照 Explorer 与 Flyer 的能力表，修复把采集任务交给飞板的错误。", "学生会知道：对象的方法来自它所属的类型，调用时必须先选对负责人。", ["只看到方法名，没有检查对象类型", "把对象变量和对象名字混为一谈"]],
    ["练习", "初始化新成员", "实例、初始化参数、多个对象、初始属性", "创建职责不同的两个探测员", "成员档案表", "corner-upload", "实例让同一种类型拥有各自的名字、能量和任务记录，初始化参数决定它们刚加入时的状态。", "让学生修复第二位成员的名字和能量，观察两个对象分别执行动作并保留独立状态。", "学生会知道：同一类型可以创建多个互不混淆的实例。", ["复制实例时忘记修改参数", "两个变量指向同名档案", "把运行后的能量当成初始能量"]],
    ["学习", "参数化工具", "形参、实参、单参数、函数复用", "让同一移动函数适应不同距离", "参数调用表", "repeat-line", "参数把每次调用会变化的数据交给同一个函数，让工具不再只适合一种距离。", "比较 move_steps(2) 与 move_steps(4) 的真实动作轨迹，修复第二段距离参数。", "学生会知道：形参是函数里的输入位置，实参是调用时交进去的具体值。", ["第二次调用仍照抄旧参数", "把参数当成函数运行后的结果"]],
    ["学习", "把结果交回来", "返回值、布尔函数、结果流向", "返回前方是否安全并用于条件判断", "返回值流向图", "hazard-line", "返回值不会直接改变世界，它把函数算出的结果交回调用处，再由 if 决定动作。", "观察 safe_ahead() 的 True/False 如何流入 if，修复返回方向写反导致的危险穿越。", "学生会知道：有些函数负责回答问题，调用者负责使用答案。", ["把返回值当成动作", "函数算出结果但调用处没有使用", "布尔方向写反"]],
    ["学习", "有序任务清单", "列表、索引、遍历、元素", "按距离列表依次处理多个信标", "多目标清单", "three-targets", "列表把同类任务排成有顺序的清单，索引取出一个元素，遍历则依次处理全部元素。", "先读取第 0 个距离，再遍历剩余距离，补回漏掉的第三段任务。", "学生会知道：列表既能按位置读取，也能作为循环的数据来源。", ["列表漏项", "把第 1 个元素误写成索引 1", "遍历遗漏最后一个元素"]],
    ["阶段作品", "数组重构工坊", "append、insert、remove、越界、重构", "修复数组边界并用数组生成任务", "数据与函数任务包", "zigzag", "数组会在增删后改变长度与索引；让循环读取真实长度，才能避免任务清单变化后越界。", "用 remove、insert、append 整理距离清单，再把固定次数循环重构为 range(len(segments))。", "学生会知道：数据变化后，程序结构也应依赖数据本身而不是硬编码旧长度。", ["修改数组后仍使用旧长度", "访问等于数组长度的索引", "只修报错没有完成重构"]],
    ["学习", "名字对应规则", "字典、键值、查找、策略映射", "用地形名称查找处理动作", "规则字典", "hazard-line", "字典用有意义的键找到对应规则，适合把地形类型映射到处理策略。", "修复危险格 H 对应的动作，并让程序通过键查找决定是否开盾。", "学生会知道：字典把名称与规则配对，查找结果可以直接驱动程序决策。", ["键和值对应错", "查找了不存在的键", "修改规则后没有使用查询结果"]],
    ["学习", "地图是一张表", "二维数组、格子类型、行列坐标", "用二维数据生成可运行地图", "地图编码表", "maze-hook", "二维列表的外层表示行、内层表示列；每个字符会被世界生成器翻译成一种格子。", "修复中继站所在行列的字符，观察二维数据如何重建左侧 3D 世界。", "学生会知道：关卡可以由数据生成，row 与 column 共同定位格子。", ["行列顺序读反", "地图字符与格子含义不一致", "各行长度不一致"]],
    ["学习", "世界建造者", "放置、移除、传送门配对、世界校验", "用代码修改岛屿并连接两个区域", "世界蓝图", "narrow-bridge", "建造 API 把修改世界的意图写成可回放事件：先生成蓝图，再放置、移除并配对传送门。", "修复第二个传送门坐标，让入口与出口落在可用格子并完成跨岛任务。", "学生会知道：世界建造不仅要放对格子，还要满足起点、目标、连接和可解性约束。", ["传送门没有成对", "坐标超出地图", "移除了必经通路"]],
    ["学习", "类与组件", "类、组件、组合、职责边界", "组合传感、移动和采集组件", "组件关系图", "spiral", "类规定组件的共同接口，组合则让一个任务单元按需获得传感、移动、采集等职责。", "修复 RescueKit 的组件清单，让它具备完成路线所需的移动、采集与上传能力。", "学生会知道：组件各管一件事，组合决定实例最终拥有哪些能力。", ["组件职责重复", "漏掉任务必需组件", "把类型名称当成实例"]],
    ["学习", "飞船协作战", "多对象、独立位置、状态、能力边界", "协调 Explorer 与 Spaceship 分工", "协作流程图", "spiral", "多对象不是轮流操纵同一个角色，而是每个实例都保留自己的位置、能量和动作历史。", "修复把采集任务交给飞船的能力错误，让 Neo 与 Carrier 分别承担采集和上传。", "学生会知道：协作首先要把任务交给具有相应能力的对象。", ["对象职责混乱", "只看路线不看能力", "把多个实例当成同一位置"]],
    ["调试", "等待与同步", "时序、wait、对象冲突、占位状态", "用等待释放共享通道", "同步时序图", "back-wait", "等待会改变多对象的时序状态，让占用通道的对象先保持不动或释放机会。", "起始程序让两个对象在共享格发生冲突，补上 wait 并观察时间线如何改变。", "学生会知道：正确时机和正确路线一样重要。", ["等待太早或太晚", "忽略另一个对象位置", "冲突后只改路线"]],
    ["创作", "数据驱动关卡", "schema、成功条件、限制、可解性", "从地图数据生成原创关卡并校验", "原创关卡 v1", "maze-hook", "原创关卡必须先通过机器可读的 schema 校验，名字、地图、信标数量和上传条件要彼此一致。", "修复 schema 中错误的信标数量，生成世界并完成一遍参考解。", "学生会知道：发布前要同时验证数据约定和可运行答案。", ["schema 缺字段", "声明目标与地图不一致", "只有地图没有参考解"]],
    ["阶段作品", "重新连接", "字典、地图数据、组件、多对象、同步、校验", "完成并验证共同核心协作世界", "共同核心毕业包", "narrow-bridge", "共同核心作品要把世界数据、组件能力、对象分工、同步时机和最终上传放进同一个可解释系统。", "修复最后一个同步等待，让 Explorer 与 Spaceship 完成跨对象毕业任务并保存完整证据。", "学生会知道：代码可以同时定义世界、对象与协作规则，并用证据证明系统可靠。", ["世界和对象状态脱节", "同步等待缺失", "只完成路线没有能力证据"]],
    ["学习", "搜索入门", "线性搜索、筛选、找不到", "找到指定信标或安全信标", "搜索记录表", "three-targets", "搜索不是乱找，而是按规则检查候选目标。", "学生按顺序检查多个信标，标出找到、跳过和找不到的情况。", "学生会知道：搜索要有目标条件，也要处理找不到。", ["找到第一个目标后忘记条件", "没有处理找不到"]],
    ["学习", "排序与优先级", "排序、距离、收益、风险", "按距离或收益排序目标", "排序过程表", "zigzag", "排序让目标从一堆选择变成有优先级的计划。", "学生给目标打分，比较最近优先和收益优先的排序结果。", "学生会知道：排序依据不同，路线策略也会不同。", ["只看距离不看风险", "比较规则前后不一致"]],
    ["学习", "迷宫与 visited", "visited、死路、回退", "找到迷宫中的可行路线", "visited 标记图", "maze-hook", "visited 防止程序在迷宫里反复走同一条路。", "学生每走过一格就标记 visited，遇到死路时说明为什么回退。", "学生会知道：记录走过哪里，是搜索能结束的关键。", ["重复访问同一格", "死路不回退"]],
    ["创作", "迷宫搜索关", "迷宫、visited、搜索限制", "学生设计一个可搜索迷宫", "迷宫原创关", "spiral", "迷宫关要有死路但不能无解，才能训练搜索。", "学生设计一条正确路线和至少两条死路，再让同伴标 visited。", "学生会知道：好迷宫有挑战，也有可验证的出口。", ["迷宫无解", "没有设计死路意义"]],
    ["学习", "深度优先与递归", "DFS、递归、调用栈、回溯", "解释搜索遇到死路如何退回", "调用栈说明", "maze-hook", "DFS 像沿一条路走到底，失败后沿调用栈退回来。", "学生用卡片模拟函数调用栈，标出进入、失败、返回。", "学生会知道：递归需要出口，也需要回退。", ["递归没有出口", "回退后没有继续探索"]],
    ["学习", "广度优先搜索", "BFS、队列、层级、最少步数", "找到最少步数路线", "BFS 层级图", "narrow-bridge", "BFS 一层一层扩展，所以第一次到达目标就是最少步数。", "学生画出第 0 层、第 1 层、第 2 层能到哪些格子。", "学生会知道：队列可以保证按距离层级探索。", ["把队列当成栈", "层级标错"]],
    ["练习", "路径还原与代价", "前驱、路径重建、权重、能量代价", "比较最短路线和最低能量路线", "路径对比卡", "hazard-line", "最短步数不一定最低代价，危险格会改变路线价值。", "学生比较两条路线的步数和能量消耗，说明选择理由。", "学生会知道：算法评价需要明确指标。", ["只比较步数", "没有记录前驱"]],
    ["阶段作品", "自动寻路任务包", "图、DFS、BFS、路径还原、代价", "自动规划路线并讲解回放", "自动寻路作品", "spiral", "自动寻路作品要把地图变成图，再把搜索过程讲给别人听。", "学生展示 visited、队列、前驱和最终路线四张证据图。", "学生会知道：路径算法是可解释的搜索过程。", ["只展示结果不展示过程", "搜索证据不完整"]],
    ["学习", "多目标路线规划", "目标组合、顺序、状态变化", "规划多个信标的采集顺序", "多目标路线表", "three-targets", "多目标规划要把当前点、已采集集合和剩余目标一起考虑。", "学生列出两种采集顺序，比较步数和风险。", "学生会知道：目标顺序本身就是算法选择。", ["顺序没有理由", "忽略已采集状态"]],
    ["学习", "贪心策略", "最近优先、收益优先、局部最优", "实现一种贪心选择策略", "贪心策略卡", "zigzag", "贪心每一步都做当前看起来最好的选择，但不保证全局最好。", "学生分别用最近优先和收益优先跑同一张图，比较结果。", "学生会知道：策略要用测试来证明表现。", ["把局部最优当全局最优", "没有写选择规则"]],
    ["调试", "贪心为什么失败", "反例、全局最优、方案比较", "设计让贪心失败的地图", "反例地图", "spiral", "反例不是为了否定算法，而是帮助理解算法适用边界。", "学生设计一张让最近优先绕远的地图，并解释失败原因。", "学生会知道：算法需要边界意识。", ["反例不能证明问题", "只说失败不比较方案"]],
    ["创作", "策略挑战关", "策略、限制、反例", "学生设计一个策略挑战关", "策略原创关", "narrow-bridge", "策略关要让不同算法出现不同表现，评价才有意义。", "学生设置评分规则：步数、能量、成功率各占多少。", "学生会知道：设计评价指标会影响算法选择。", ["评分规则不清", "挑战无法区分策略"]],
    ["学习", "枚举与剪枝", "全部方案、组合爆炸、提前排除", "枚举小规模采集顺序", "方案比较表", "three-targets", "枚举能看全局，但方案数量会快速增长，所以需要剪枝。", "学生列出 3 个目标的所有顺序，再划掉明显无效方案。", "学生会知道：剪枝是在不漏答案的前提下少试无效路线。", ["没有剪掉明显无效方案", "剪掉了可能最优的方案"]],
    ["学习", "动态规划入门", "子问题、缓存、状态表示", "理解位置、已采集、能量的缓存价值", "状态缓存表", "zigzag", "动态规划的入口是状态表示：同一状态不用重复计算。", "学生用位置、已采集集合、剩余能量写出状态卡。", "学生会知道：缓存的前提是能准确描述状态。", ["状态缺少已采集集合", "把路线当状态"]],
    ["练习", "综合测试与性能", "测试地图、成功率、步数、能量", "用多张地图验证策略稳定性", "测试报告", "maze-hook", "一个策略不能只靠一张地图证明，要用多张测试图看稳定性。", "学生记录每张图的成功率、步数和能量余量。", "学生会知道：测试是判断算法好坏的证据。", ["只用一张地图", "只记录是否成功"]],
    ["毕业作品", "原创关卡发布会", "综合算法、创作、讲解、互评", "完成并展示原创毕业关卡", "毕业作品包", "spiral", "毕业作品要像一个可试玩的小产品：规则清楚、路线可解、讲解完整。", "学生发布地图、规则、解法、测试结果和展示讲稿，同伴试玩评分。", "学生会知道：编程作品需要设计、实现、测试和表达一起完成。", ["只有地图没有规则", "没有测试证据"]]
  ];

  const typeClass = {
    "学习": "learning",
    "练习": "practice",
    "调试": "debugging",
    "创作": "creation",
    "阶段作品": "boss",
    "毕业作品": "capstone"
  };

  const allowedByStage = {
    1: ["move", "left", "right", "back", "wait", "collect", "upload"],
    2: ["move", "left", "right", "collect", "upload", "shield", "ifHazardShield", "ifWallRight", "repeat2", "repeat3", "repeat4"],
    3: ["move", "left", "right", "collect", "upload", "repeat2", "repeat3", "repeat4", "callRoute"],
    4: ["move", "left", "right", "back", "wait", "collect", "upload", "ifWallRight", "repeat2", "repeat3"],
    5: ["move", "left", "right", "collect", "upload", "ifWallRight", "repeat2", "repeat3", "shield", "ifHazardShield"],
    6: ["move", "left", "right", "collect", "upload", "repeat2", "repeat3", "repeat4", "shield", "ifHazardShield"]
  };

  const advancedLessonSpecs = {
    9: {
      mode: "loop-expander",
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "____________",
        "__ggggggg___",
        "_SssssssBgg_",
        "__ggg#ggg___",
        "____________"
      ],
      solution: ["repeat5", "repeat2", "collect"],
      allowed: ["move", "repeat2", "repeat3", "repeat4", "repeat5", "collect"],
      required: 1,
      energy: 12,
      limit: 5,
      brief: {
        challenge: "远处的信标位于一条长直线上。使用循环表达重复前进，不要堆叠七条 move()。",
        intro: "循环会把一条重复规则展开成多次真实动作：",
        bullets: ["repeat(5) 不是瞬移，它仍然会执行五次前进。", "循环次数决定实际移动格数，循环外的指令只执行一次。", "先数清距离，再选择合适的循环次数。"],
        goal: "用不超过 5 条程序指令完成 7 格移动和信标采集。"
      }
    },
    10: {
      mode: "range-indent",
      start: { x: 1, y: 5 },
      startDir: "E",
      grid: [
        "_________",
        "___gggg__",
        "__g#ggg__",
        "_ggsgBgg_",
        "_g#s_ggg_",
        "_SgBggg__",
        "_________"
      ],
      solution: ["repeat2", "collect", "left", "repeat2", "right", "repeat2", "collect"],
      allowed: ["move", "left", "right", "repeat2", "repeat3", "collect"],
      required: 2,
      energy: 14,
      limit: 9,
      brief: {
        challenge: "程序包含三段重复移动和两次采集。判断哪些动作属于循环体，避免把 collect() 重复执行。",
        intro: "缩进表示一条指令是否属于循环体：",
        bullets: ["range(2) 会让缩进在循环里的动作执行两次。", "退出缩进后，后面的 collect() 只执行一次。", "循环范围放错，会造成空采集或走过目标。"],
        goal: "先在缩进实验台确认循环范围，再完成两座信标的折线路线。"
      }
    },
    11: {
      mode: "energy-lab",
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "__________",
        "_ggggggg__",
        "_SgHgBgg__",
        "_ggg#ggg__",
        "__________"
      ],
      solution: ["move", "ifHazardShield", "repeat2", "move", "collect"],
      allowed: ["move", "repeat2", "repeat3", "collect", "shield", "ifHazardShield"],
      required: 1,
      energy: 9,
      minEnergy: 4,
      limit: 7,
      brief: {
        challenge: "穿过辐射格抵达信标，同时至少保留 4 点能量。直接硬闯虽然更短，但会损失额外能量。",
        intro: "位置不是唯一状态，能量也会决定任务是否成功：",
        bullets: ["每次移动消耗 1 点能量。", "开盾消耗 1 点能量，但能阻止危险格造成的额外 4 点损失。", "比较路线时要同时计算步数与能量。"],
        goal: "使用护盾或危险检测穿过辐射格，采集后保持能量不少于 4。"
      }
    },
    12: {
      mode: "loop-creator",
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "___________",
        "__gggggg___",
        "_SgggHgBgg_",
        "__gg#ggg___",
        "___________"
      ],
      solution: ["repeat3", "ifHazardShield", "move", "repeat2", "collect"],
      allowed: ["move", "repeat2", "repeat3", "repeat4", "collect", "shield", "ifHazardShield"],
      required: 1,
      energy: 10,
      minEnergy: 3,
      limit: 7,
      advancedConfig: {
        loopHazardTemplate: [
          "___________",
          "__gggggg___",
          "_SgggggBgg_",
          "__gg#ggg___",
          "___________"
        ],
        loopHazards: [
          { id: "early", label: "前段危险格", x: 3, y: 2, solution: ["move", "ifHazardShield", "move", "repeat4", "collect"] },
          { id: "middle", label: "中段危险格", x: 5, y: 2, solution: ["repeat3", "ifHazardShield", "move", "repeat2", "collect"] },
          { id: "late", label: "后段危险格", x: 6, y: 2, solution: ["repeat4", "ifHazardShield", "move", "move", "collect"] }
        ]
      },
      brief: {
        challenge: "制作一条带危险格的循环路线。选择危险格位置，再用循环和护盾写出可通过的参考程序。",
        intro: "有教学价值的原创关卡要让限制真正影响策略：",
        bullets: ["危险格必须放在必经路线，而不是装饰区。", "循环负责表达重复移动，护盾负责管理能量风险。", "参考程序必须证明每一种设置都有解。"],
        goal: "选择危险位置，让 3D 地图更新，并用不超过 7 条指令验证关卡。"
      }
    },
    13: {
      mode: "condition-lab",
      pythonStudio: {
        clickToBuild: true,
        kicker: "第 13 课 · 简单 if",
        title: "修复危险判断",
        taskBadge: "修改第 2 行",
        taskHtml: "把 <code>is_blocked_ahead()</code>（前方是否被阻挡）改成 <code>is_hazard_ahead()</code>（前方是否危险）。你也可以直接点击标有“本关修改”的代码卡。",
        railEyebrow: "第 2 行需要替换",
        railTitle: "选择正确条件",
        starterSource: ["move()", "if is_blocked_ahead():", "    shield()", "move()", "move()", "move()", "collect()"].join("\n"),
        allowedFunctions: ["move", "turn_left", "turn_right", "shield", "collect", "is_hazard_ahead", "is_blocked_ahead"],
        targets: [{ search: "if is_blocked_ahead():", occurrence: 1, hint: "把阻挡检测换成危险检测" }],
        templates: [
          { id: "hazard-condition", label: "本关修改", code: "is_hazard_ahead()", help: "前方是否危险 · 替换错误条件", recommended: true, replaceFrom: "if is_blocked_ahead():", replaceTo: "if is_hazard_ahead():" },
          { id: "move", code: "move()", help: "前进一格", snippet: "move()" },
          { id: "collect", code: "collect()", help: "采集信标", snippet: "collect()" }
        ],
        translations: [["move()", "前进一格"], ["is_blocked_ahead()", "前方是否被阻挡"], ["is_hazard_ahead()", "前方是否危险"], ["shield()", "开启护盾"], ["collect()", "采集信标"]]
      },
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "__________",
        "_ggggggg__",
        "_SgHgBgg__",
        "_gg#gggg__",
        "__________"
      ],
      solution: ["move", "ifSensorAct", "repeat3", "collect"],
      allowed: ["move", "repeat2", "repeat3", "collect", "ifSensorAct"],
      required: 1,
      energy: 9,
      minEnergy: 4,
      limit: 6,
      brief: {
        challenge: "让程序先读取前方格子，只在前方是危险格时开启护盾，然后继续前进并采集信标。",
        intro: "if 会先得到一个真或假的判断，再决定是否执行动作：",
        bullets: ["条件成立时，缩进在 if 里的动作才会发生。", "条件不成立时，程序会跳过动作并继续向下执行。", "检测对象必须和要解决的问题一致。"],
        goal: "保持传感器条件为 hazard，运行程序并观察条件从 false 变为 true。"
      }
    },
    14: {
      mode: "logic-guard",
      pythonStudio: {
        clickToBuild: true,
        starterVersion: "click-build-v1",
        kicker: "第 14 课 · and / or / not",
        title: "用代码按钮组成安全守卫",
        taskBadge: "选择 2 块代码",
        taskHtml: "不用敲代码。先从左侧选择正确的 <code>if</code> 条件，再加入缩进的 <code>move()</code>。只有“前方可通行、能量大于 3、前方不是危险格”同时成立，探测员才能前进。",
        railEyebrow: "按黄色位置依次选择",
        railTitle: "选择代码积木",
        initialFeedback: "先选择安全条件，再选择条件成立后要执行的动作。选错可以恢复起始程序重新组合。",
        starterSource: [
          "if is_blocked_ahead():",
          "    turn_right()",
          "move()",
          "move()",
          "turn_left()",
          "",
          "# TODO_1: 选择安全条件",
          "# TODO_2: 选择条件成立后的动作",
          "",
          "move()",
          "move()",
          "collect()"
        ].join("\n"),
        allowedFunctions: ["move", "turn_left", "turn_right", "collect", "is_path_clear", "is_blocked_ahead", "is_hazard_ahead", "energy_remaining"],
        targets: [
          { search: "# TODO_1: 选择安全条件", occurrence: 1, hint: "从左侧选择一条完整的 if 条件" },
          { search: "# TODO_2: 选择条件成立后的动作", occurrence: 1, hint: "点击缩进的 move() 作为 if 内部动作" }
        ],
        conceptChecks: [
          { pattern: "\\bif\\s+is_path_clear\\(\\)", message: "需要用 if 检查前方是否可通行" },
          { pattern: "\\band\\b", min: 2, message: "安全守卫需要用两个 and 连接三个条件" },
          { pattern: "\\bnot\\s+is_hazard_ahead\\(\\)", message: "需要用 not 排除危险格" },
          { pattern: "energy_remaining\\(\\)\\s*>\\s*3", message: "需要检查剩余能量是否大于 3" }
        ],
        templates: [
          { id: "guard-and", label: "三个条件都成立", code: "if clear and energy and not hazard:", help: "AND：必须全部满足", block: true, guided: true, replaceFrom: "# TODO_1: 选择安全条件", replaceTo: "if is_path_clear() and energy_remaining() > 3 and not is_hazard_ahead():" },
          { id: "guard-or", label: "任一条件成立", code: "if clear or energy or not hazard:", help: "OR：只要一个满足", block: true, guided: true, replaceFrom: "# TODO_1: 选择安全条件", replaceTo: "if is_path_clear() or energy_remaining() > 3 or not is_hazard_ahead():" },
          { id: "guard-hazard", label: "只检查危险", code: "if not hazard:", help: "只判断前方是否安全", block: true, guided: true, replaceFrom: "# TODO_1: 选择安全条件", replaceTo: "if not is_hazard_ahead():" },
          { id: "guard-move", label: "条件成立后", code: "    move()", help: "缩进表示属于 if", block: true, guided: true, replaceFrom: "# TODO_2: 选择条件成立后的动作", replaceTo: "    move()" }
        ],
        translations: [["and", "并且，全部为真"], ["or", "或者，至少一个为真"], ["not", "把真假反转"], ["is_path_clear()", "前方可通过"], ["energy_remaining()", "剩余能量"]]
      },
      start: { x: 1, y: 1 },
      startDir: "E",
      grid: [
        "__________",
        "_S#ggggg__",
        "_s#gg_gg__",
        "_ssgBggg__",
        "_ggg#gg___",
        "__________"
      ],
      solution: ["logicGuard", "repeat2", "left", "logicGuard", "repeat2", "collect"],
      allowed: ["move", "left", "right", "repeat2", "collect", "logicGuard"],
      required: 1,
      energy: 12,
      limit: 8,
      brief: {
        challenge: "使用安全守卫绕过起点岩石，并在开阔路段继续前进。守卫要同时检查可通行、能量足够且不是危险格。",
        intro: "多个布尔条件可以组合成一条完整安全规则：",
        bullets: ["AND 要求所有条件都为 true。", "OR 只要求其中一个条件为 true。", "NOT 会把一个布尔结果反转，例如 NOT hazard。"],
        goal: "使用 clear AND enoughEnergy AND NOT hazard 的守卫完成路线。"
      }
    },
    15: {
      mode: "while-monitor",
      pythonStudio: {
        clickToBuild: true,
        starterVersion: "click-build-v1",
        kicker: "第 15 课 · while",
        title: "用代码按钮组成第二个 while",
        taskBadge: "选择 2 块代码",
        taskHtml: "第一个 <code>while</code> 已经示范了“走到信标就停止”。不用敲代码：从左侧选择第二个循环的停止目标，再加入缩进的 <code>move()</code>，最后程序会自动执行已有的上传动作。",
        railEyebrow: "按黄色位置依次选择",
        railTitle: "选择循环积木",
        initialFeedback: "先选择正确的 while 停止目标，再选择循环中重复执行的动作。",
        starterSource: ["while not at_beacon():", "    move()", "collect()", "", "# TODO_1: 选择第二个 while 的停止目标", "# TODO_2: 选择循环里重复的动作", "", "upload()"].join("\n"),
        allowedFunctions: ["move", "collect", "upload", "at_beacon", "at_relay"],
        targets: [
          { search: "# TODO_1: 选择第二个 while 的停止目标", occurrence: 1, hint: "选择走到中继站才停止的 while" },
          { search: "# TODO_2: 选择循环里重复的动作", occurrence: 1, hint: "选择缩进的 move()" }
        ],
        conceptChecks: [{ pattern: "while\\s+not\\s+at_relay\\(\\)\\s*:", message: "需要自己写出以 at_relay() 为停止目标的 while" }],
        templates: [
          { id: "while-relay", label: "走到中继站为止", code: "while not at_relay():", help: "未到中继站就继续", block: true, guided: true, replaceFrom: "# TODO_1: 选择第二个 while 的停止目标", replaceTo: "while not at_relay():" },
          { id: "while-beacon", label: "走到信标为止", code: "while not at_beacon():", help: "未到信标就继续", block: true, guided: true, replaceFrom: "# TODO_1: 选择第二个 while 的停止目标", replaceTo: "while not at_beacon():" },
          { id: "if-relay", label: "只判断一次", code: "if not at_relay():", help: "if 不会持续重复", block: true, guided: true, replaceFrom: "# TODO_1: 选择第二个 while 的停止目标", replaceTo: "if not at_relay():" },
          { id: "while-move", label: "循环动作", code: "    move()", help: "每次循环前进一格", block: true, guided: true, replaceFrom: "# TODO_2: 选择循环里重复的动作", replaceTo: "    move()" }
        ],
        translations: [["while", "当条件成立时重复"], ["not", "还没有达到"], ["at_beacon()", "是否在信标格"], ["at_relay()", "是否在中继站"], ["upload()", "上传任务数据"]]
      },
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "____________",
        "_ggggggggg__",
        "_SgggBgggRg_",
        "_ggg#ggggg__",
        "____________"
      ],
      solution: ["whileBeacon", "collect", "whileRelay", "upload"],
      allowed: ["move", "collect", "upload", "whileBeacon", "whileRelay"],
      required: 1,
      energy: 14,
      limit: 6,
      brief: {
        challenge: "信标和中继站的距离不写在程序里。让 while 根据是否到达目标决定继续移动或停止。",
        intro: "while 的重点不是重复，而是每次重复前都重新检查停止条件：",
        bullets: ["没有到达信标时继续移动，到达后立即停止。", "采集后，循环目标要从信标切换为中继站。", "停止条件永远不改变，会造成过走或死循环。"],
        goal: "用两个带停止条件的 while 完成采集和上传。"
      }
    },
    16: {
      mode: "energy-boss",
      pythonStudio: {
        clickToBuild: true,
        starterVersion: "click-build-v1",
        kicker: "第 16 课 · 综合任务",
        title: "用代码按钮完成能源搜救",
        taskBadge: "组合 6 块代码",
        taskHtml: "不用敲代码。按照三段任务说明，从左侧依次选择路线积木和任务动作：采集第一座信标、安全采集第二座信标，最后到中继站上传。",
        railEyebrow: "一次完成一个黄色位置",
        railTitle: "选择任务积木",
        initialFeedback: "从第一个黄色位置开始，依次点击六块代码。编辑器会展示你组合出的完整 Python。",
        starterSource: [
          "# 任务 1：向东走到第一座信标并采集",
          "# TODO_1A: 选择走到第一座信标的循环",
          "# TODO_1B: 选择抵达后的动作",
          "",
          "# 任务 2：转向北，安全走到第二座信标并采集",
          "# TODO_2A: 选择安全路线",
          "# TODO_2B: 选择抵达后的动作",
          "",
          "# 任务 3：转向东，安全走到中继站并上传",
          "# TODO_3A: 选择安全路线",
          "# TODO_3B: 选择抵达后的动作"
        ].join("\n"),
        allowedFunctions: ["move", "turn_left", "turn_right", "shield", "collect", "upload", "is_hazard_ahead", "at_beacon", "at_relay"],
        targets: [
          { search: "# TODO_1A: 选择走到第一座信标的循环", occurrence: 1, hint: "点击走到信标的循环" },
          { search: "# TODO_1B: 选择抵达后的动作", occurrence: 1, hint: "点击 collect()" },
          { search: "# TODO_2A: 选择安全路线", occurrence: 1, hint: "点击向北安全采集的路线" },
          { search: "# TODO_2B: 选择抵达后的动作", occurrence: 1, hint: "点击 collect()" },
          { search: "# TODO_3A: 选择安全路线", occurrence: 1, hint: "点击向东安全前往中继站的路线" },
          { search: "# TODO_3B: 选择抵达后的动作", occurrence: 1, hint: "点击 upload()" }
        ],
        conceptChecks: [
          { pattern: "\\bwhile\\b", message: "综合程序至少需要一个 while 循环" },
          { pattern: "\\bif\\s+is_hazard_ahead\\(\\)", message: "综合程序需要用 if 判断危险格" },
          { pattern: "\\bshield\\(\\)", message: "综合程序需要在危险格前开启护盾" }
        ],
        templates: [
          { id: "task1-route", label: "任务 1 · 走到信标", code: "while not at_beacon():\n    move()", help: "重复前进直到信标", block: true, guided: true, replaceFrom: "# TODO_1A: 选择走到第一座信标的循环", replaceTo: "while not at_beacon():\n    move()" },
          { id: "task1-collect", label: "任务 1 · 采集", code: "collect()", help: "采集第一座信标", block: true, guided: true, replaceFrom: "# TODO_1B: 选择抵达后的动作", replaceTo: "collect()" },
          { id: "task2-route", label: "任务 2 · 安全向北", code: "turn_left()\nwhile not at_beacon():\n    if is_hazard_ahead():\n        shield()\n    move()", help: "转向、判断危险并前进", block: true, guided: true, replaceFrom: "# TODO_2A: 选择安全路线", replaceTo: "turn_left()\nwhile not at_beacon():\n    if is_hazard_ahead():\n        shield()\n    move()" },
          { id: "task2-collect", label: "任务 2 · 采集", code: "collect()", help: "采集第二座信标", block: true, guided: true, replaceFrom: "# TODO_2B: 选择抵达后的动作", replaceTo: "collect()" },
          { id: "task3-route", label: "任务 3 · 前往中继站", code: "turn_right()\nwhile not at_relay():\n    if is_hazard_ahead():\n        shield()\n    move()", help: "转向并安全抵达中继站", block: true, guided: true, replaceFrom: "# TODO_3A: 选择安全路线", replaceTo: "turn_right()\nwhile not at_relay():\n    if is_hazard_ahead():\n        shield()\n    move()" },
          { id: "task3-upload", label: "任务 3 · 上传", code: "upload()", help: "上传搜救数据", block: true, guided: true, replaceFrom: "# TODO_3B: 选择抵达后的动作", replaceTo: "upload()" }
        ],
        translations: [["at_beacon()", "是否在信标格"], ["at_relay()", "是否在中继站"], ["is_hazard_ahead()", "前方是否危险"], ["upload()", "上传任务数据"]]
      },
      start: { x: 1, y: 5 },
      startDir: "E",
      grid: [
        "_____________",
        "__ggggg______",
        "_ggBggHgRgg__",
        "_g#s_ggsgg___",
        "_ggH_ggs_gg__",
        "_SsBgggggg___",
        "_____________"
      ],
      solution: ["repeat2", "collect", "left", "ifHazardShield", "repeat3", "collect", "right", "repeat2", "ifHazardShield", "repeat3", "upload"],
      allowed: ["move", "left", "right", "repeat2", "repeat3", "collect", "upload", "shield", "ifHazardShield"],
      required: 2,
      energy: 18,
      minEnergy: 4,
      limit: 14,
      brief: {
        challenge: "完成能源搜救 Boss 关：采集两座信标、穿过两处危险格，并带着至少 4 点能量完成上传。",
        intro: "这张长地图要求你同时管理程序结构与运行状态：",
        bullets: ["用循环压缩三段重复移动。", "只在危险格前开启护盾，避免浪费能量。", "上传前检查两座信标和剩余能量。"],
        goal: "完成两次采集、两次安全穿越和最终上传，点亮能源任务档案。"
      }
    },
    17: {
      mode: "variable-counter",
      pythonStudio: {
        clickToBuild: false,
        starterVersion: "variable-trace-v1",
        kicker: "第 17 课 · 变量与赋值",
        title: "让采集计数跟着任务变化",
        taskBadge: "补全第 11 行",
        taskHtml: "程序已经采集两座信标，但变量 <code>collected</code> 只记录到 1。补上第二次更新，让变量轨迹真实显示 <code>0 → 1 → 2</code>。",
        railEyebrow: "变量必须随事件更新",
        railTitle: "变量更新参考",
        initialFeedback: "先运行起始程序。世界任务会完成，但变量追踪表会暴露漏掉的第二次更新。",
        starterSource: [
          "collected = 0",
          "while not at_beacon():",
          "    move()",
          "collect()",
          "collected = collected + 1",
          "",
          "while not at_beacon():",
          "    move()",
          "collect()",
          "",
          "# TODO: 第二次采集后更新 collected"
        ].join("\n"),
        allowedFunctions: ["move", "collect", "at_beacon"],
        targets: [
          { search: "# TODO: 第二次采集后更新 collected", occurrence: 1, hint: "让 collected 在原值上再增加 1" }
        ],
        conceptChecks: [
          { pattern: "\\bcollected\\s*=\\s*0\\b", message: "程序开始时需要把 collected 初始化为 0" },
          { pattern: "\\bcollected\\s*=\\s*collected\\s*\\+\\s*1\\b", min: 2, message: "每次采集后都需要把 collected 增加 1" }
        ],
        stateChecks: [
          { kind: "variable", name: "collected", equals: 2, message: "任务完成了，但 collected 的最终值还不是 2" }
        ],
        statePanel: {
          title: "变量追踪表",
          description: "每次赋值都来自正在执行的学生代码行。",
          variables: [{ name: "collected", label: "已采集数量", initial: "未运行", target: 2 }]
        },
        templates: [
          { id: "increment-collected", label: "第二次更新", code: "collected = collected + 1", help: "在当前值上增加 1", recommended: true, replaceFrom: "# TODO: 第二次采集后更新 collected", replaceTo: "collected = collected + 1" },
          { id: "reset-collected", code: "collected = 0", help: "把计数器初始化为 0", snippet: "collected = 0" },
          { id: "collect", code: "collect()", help: "采集当前位置的信标", snippet: "collect()" }
        ],
        translations: [["collected", "已采集数量"], ["=", "把右侧结果保存到左侧变量"], ["collected + 1", "在当前数量上增加 1"], ["at_beacon()", "是否到达未采集信标"]]
      },
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "___________",
        "_gggggggg__",
        "_SgBggBgg__",
        "_ggg#gggg__",
        "___________"
      ],
      solution: ["repeat2", "collect", "repeat3", "collect"],
      allowed: ["move", "repeat2", "repeat3", "collect"],
      required: 2,
      energy: 12,
      limit: 7,
      brief: {
        challenge: "采集两座信标，并用变量 collected 记录已经完成的采集数量。",
        intro: "变量给会变化的状态起名字：",
        bullets: ["任务开始时 collected = 0。", "每次采集成功后执行 collected = collected + 1。", "变量值来自运行过程，不是手工写出的最终答案。"],
        goal: "完成两次采集，让 collected 按 0 → 1 → 2 变化。"
      }
    },
    18: {
      mode: "state-console",
      pythonStudio: {
        clickToBuild: false,
        starterVersion: "multi-variable-ledger-v1",
        kicker: "第 18 课 · 多变量调试",
        title: "找出能量账本的数据来源",
        taskBadge: "修复最后一行",
        taskHtml: "路线和采集都能完成，但 <code>energy_used = steps</code> 漏掉了开启护盾的消耗。根据起始能量与剩余能量重新计算，让状态账本得到真实结果。",
        railEyebrow: "变量依赖需要可解释",
        railTitle: "选择正确计算",
        initialFeedback: "先运行起始程序，对比 steps 和 energy_used。它们相同并不代表账本正确。",
        starterSource: [
          "start_energy = 18",
          "steps = 0",
          "collected = 0",
          "",
          "while not at_beacon():",
          "    move()",
          "    steps = steps + 1",
          "collect()",
          "collected = collected + 1",
          "",
          "turn_left()",
          "shield()",
          "move()",
          "steps = steps + 1",
          "move()",
          "steps = steps + 1",
          "turn_right()",
          "",
          "while not at_beacon():",
          "    move()",
          "    steps = steps + 1",
          "collect()",
          "collected = collected + 1",
          "",
          "turn_right()",
          "while not at_relay():",
          "    move()",
          "    steps = steps + 1",
          "upload()",
          "",
          "energy_used = steps"
        ].join("\n"),
        allowedFunctions: ["move", "turn_left", "turn_right", "shield", "collect", "upload", "at_beacon", "at_relay", "energy_remaining"],
        targets: [
          { search: "energy_used = steps", occurrence: 1, hint: "用 start_energy 减去 energy_remaining()" }
        ],
        conceptChecks: [
          { pattern: "\\bstart_energy\\s*-\\s*energy_remaining\\(\\)", message: "energy_used 需要来自起始能量减去实际剩余能量" }
        ],
        stateChecks: [
          { kind: "variable", name: "start_energy", equals: 18, message: "start_energy 应保持为本关固定的 18" },
          { kind: "variable", name: "steps", equals: 9, message: "steps 应只记录 9 次 move()" },
          { kind: "variable", name: "collected", equals: 2, message: "collected 应记录两次成功采集" },
          { kind: "variable", name: "energy_used", equals: 10, message: "energy_used 应包含 9 次移动和 1 次护盾消耗" }
        ],
        statePanel: {
          title: "状态账本",
          description: "逐行对照变量值，确认每个结果来自正确的数据。",
          variables: [
            { name: "start_energy", label: "起始能量", initial: "未运行", target: 18 },
            { name: "steps", label: "移动步数", initial: "未运行", target: 9 },
            { name: "collected", label: "采集数量", initial: "未运行", target: 2 },
            { name: "energy_used", label: "能量消耗", initial: "未运行", target: 10 }
          ]
        },
        templates: [
          { id: "energy-from-state", label: "按实际状态计算", code: "energy_used = start_energy - energy_remaining()", help: "包含移动与护盾的全部消耗", recommended: true, replaceFrom: "energy_used = steps", replaceTo: "energy_used = start_energy - energy_remaining()" },
          { id: "energy-from-steps", label: "只使用步数", code: "energy_used = steps", help: "会漏掉护盾等额外消耗", snippet: "energy_used = steps" },
          { id: "increment-steps", code: "steps = steps + 1", help: "只在移动后更新步数", snippet: "steps = steps + 1" }
        ],
        translations: [["steps", "已经移动的次数"], ["energy_used", "已经消耗的能量"], ["start_energy", "任务开始时的固定能量"], ["energy_remaining()", "当前真实剩余能量"]]
      },
      start: { x: 1, y: 5 },
      startDir: "E",
      grid: [
        "__________",
        "__gggg____",
        "_ggggggg__",
        "_ggsggBgg_",
        "_g#H_ggg__",
        "_SsBggRgg_",
        "__________"
      ],
      solution: ["repeat2", "collect", "left", "ifHazardShield", "repeat2", "right", "repeat3", "collect", "right", "repeat2", "upload"],
      allowed: ["move", "left", "right", "repeat2", "repeat3", "collect", "upload", "shield", "ifHazardShield"],
      required: 2,
      energy: 18,
      limit: 14,
      brief: {
        challenge: "在折线路线中同时追踪位置、朝向、能量和采集数量，最后完成上传。",
        intro: "多个变量会一起描述程序当前所处的状态：",
        bullets: ["move() 同时改变位置和能量。", "turn 会改变朝向，但不会改变位置。", "collect 会改变采集计数，upload 会检查多个状态。"],
        goal: "运行程序并在状态控制台中观察四个变量逐步变化。"
      }
    },
    19: {
      mode: "type-manual",
      pythonStudio: {
        clickToBuild: false,
        objectModel: true,
        starterVersion: "object-types-v1",
        kicker: "第 19 课 · 类型与方法",
        title: "把采集任务交给正确的对象",
        taskBadge: "修复第 8 行",
        taskHtml: "<code>Explorer</code> 能移动、采集和上传，<code>Flyer</code> 只能移动与扫描。程序把采集任务交给了 Scout，请根据类型说明书换成具备该能力的对象。",
        railEyebrow: "先看类型，再调用方法",
        railTitle: "对象能力说明书",
        initialFeedback: "先运行起始程序。能力错误会指出对象的类型、名字和无法执行的方法。",
        starterSource: [
          "neo = Explorer(\"Neo\", 8)",
          "scout = Flyer(\"Scout\", 4)",
          "",
          "while not at_beacon():",
          "    neo.move()",
          "",
          "# Flyer 没有采集能力",
          "scout.collect()",
          "",
          "while not at_relay():",
          "    neo.move()",
          "neo.upload()"
        ].join("\n"),
        allowedFunctions: ["Explorer", "Flyer", "move", "collect", "upload", "at_beacon", "at_relay"],
        targets: [
          { search: "scout.collect()", occurrence: 1, hint: "让 Explorer 实例 Neo 负责采集" }
        ],
        conceptChecks: [
          { pattern: "\\bneo\\s*=\\s*Explorer\\(", message: "需要用 Explorer 创建 Neo" },
          { pattern: "\\bscout\\s*=\\s*Flyer\\(", message: "需要用 Flyer 创建 Scout" },
          { pattern: "\\bneo\\.collect\\(\\)", message: "采集方法应该由 Explorer 实例 Neo 调用" }
        ],
        stateChecks: [
          { kind: "object", name: "Neo", property: "type", equals: "Explorer", message: "Neo 的类型应该是 Explorer" },
          { kind: "object", name: "Scout", property: "type", equals: "Flyer", message: "Scout 的类型应该是 Flyer" },
          { kind: "object-action", name: "Neo", type: "Explorer", action: "collect", message: "采集动作需要记录在 Neo 的对象档案中" }
        ],
        statePanel: {
          title: "对象能力档案",
          description: "点语法左侧是负责人，右侧是它请求执行的方法。",
          objects: [
            { name: "Neo", label: "采集探测员", expectedType: "Explorer", targetEnergy: 2 },
            { name: "Scout", label: "空中侦察员", expectedType: "Flyer", targetEnergy: 4 }
          ]
        },
        templates: [
          { id: "neo-collect", label: "交给 Neo", code: "neo.collect()", help: "Explorer 具备采集能力", recommended: true, replaceFrom: "scout.collect()", replaceTo: "neo.collect()" },
          { id: "scout-collect", label: "仍交给 Scout", code: "scout.collect()", help: "Flyer 不具备采集能力", snippet: "scout.collect()" },
          { id: "neo-upload", code: "neo.upload()", help: "由 Explorer 上传任务数据", snippet: "neo.upload()" }
        ],
        translations: [["Explorer", "探测员类型：移动、采集、上传"], ["Flyer", "飞板类型：移动、扫描"], ["neo.collect()", "让 Neo 执行采集"], ["scout.collect()", "让 Scout 执行采集（能力不匹配）"]]
      },
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "___________",
        "_gggggggg__",
        "_SggBggRgg_",
        "_gg#ggggg__",
        "___________"
      ],
      solution: ["repeat3", "collect", "repeat3", "upload"],
      allowed: ["move", "repeat3", "collect", "upload"],
      required: 1,
      energy: 12,
      limit: 7,
      brief: {
        challenge: "根据类型说明书，把移动、采集和上传任务交给真正具备相应能力的对象。",
        intro: "对象把状态和能力组织在一起：",
        bullets: ["Explorer 可以移动、采集和上传。", "Flyer 可以移动与扫描，但不能采集。", "neo.collect() 表示由 neo 这个实例负责采集。"],
        goal: "修复能力不匹配，使用 Neo 完成采集和上传。"
      }
    },
    20: {
      mode: "instance-initializer",
      pythonStudio: {
        clickToBuild: false,
        objectModel: true,
        starterVersion: "two-instances-v1",
        kicker: "第 20 课 · 实例与初始化",
        title: "为第二位成员建立独立档案",
        taskBadge: "修复第 2 行",
        taskHtml: "Atlas 和 Nova 都属于 <code>Explorer</code>，但需要不同的名字和初始能量。第二行复制了 Atlas 的参数，导致两个变量写入同一份对象档案。",
        railEyebrow: "同一类型，不同实例",
        railTitle: "成员初始化档案",
        initialFeedback: "先运行起始程序。路线会完成，但对象面板只有 Atlas，没有独立的 Nova 档案。",
        starterSource: [
          "atlas = Explorer(\"Atlas\", 8)",
          "nova = Explorer(\"Atlas\", 8)",
          "",
          "while not at_beacon():",
          "    atlas.move()",
          "atlas.collect()",
          "",
          "turn_right()",
          "while not at_beacon():",
          "    nova.move()",
          "nova.collect()",
          "",
          "turn_right()",
          "while not at_relay():",
          "    atlas.move()",
          "atlas.upload()"
        ].join("\n"),
        allowedFunctions: ["Explorer", "move", "collect", "upload", "turn_right", "at_beacon", "at_relay"],
        targets: [
          { search: "nova = Explorer(\"Atlas\", 8)", occurrence: 1, hint: "创建名为 Nova、初始能量为 4 的 Explorer" }
        ],
        conceptChecks: [
          { pattern: "\\batlas\\s*=\\s*Explorer\\(\\s*[\"']Atlas[\"']\\s*,\\s*8\\s*\\)", message: "Atlas 应以 8 点能量加入" },
          { pattern: "\\bnova\\s*=\\s*Explorer\\(\\s*[\"']Nova[\"']\\s*,\\s*4\\s*\\)", message: "Nova 需要独立名字和 4 点初始能量" }
        ],
        stateChecks: [
          { kind: "object", name: "Atlas", property: "energy", equals: 4, message: "Atlas 完成四次移动后应剩余 4 点对象能量" },
          { kind: "object", name: "Nova", property: "energy", equals: 2, message: "Nova 完成两次移动后应剩余 2 点对象能量" },
          { kind: "object-action", name: "Atlas", type: "Explorer", action: "collect", message: "Atlas 需要拥有自己的采集记录" },
          { kind: "object-action", name: "Nova", type: "Explorer", action: "collect", message: "Nova 需要拥有自己的采集记录" }
        ],
        statePanel: {
          title: "成员状态表",
          description: "每个实例保留自己的类型、初始参数、剩余能量和动作记录。",
          objects: [
            { name: "Atlas", label: "一号探测员", expectedType: "Explorer", targetEnergy: 4 },
            { name: "Nova", label: "二号探测员", expectedType: "Explorer", targetEnergy: 2 }
          ]
        },
        templates: [
          { id: "create-nova", label: "创建 Nova", code: "nova = Explorer(\"Nova\", 4)", help: "独立名字与初始能量", recommended: true, replaceFrom: "nova = Explorer(\"Atlas\", 8)", replaceTo: "nova = Explorer(\"Nova\", 4)" },
          { id: "duplicate-atlas", label: "复制 Atlas 参数", code: "nova = Explorer(\"Atlas\", 8)", help: "会覆盖同名对象档案", snippet: "nova = Explorer(\"Atlas\", 8)" },
          { id: "nova-collect", code: "nova.collect()", help: "动作写入 Nova 自己的档案", snippet: "nova.collect()" }
        ],
        translations: [["Explorer(\"Atlas\", 8)", "创建名为 Atlas、能量为 8 的探测员"], ["Explorer(\"Nova\", 4)", "创建名为 Nova、能量为 4 的探测员"], ["atlas", "指向 Atlas 实例的变量"], ["nova", "指向 Nova 实例的变量"]]
      },
      start: { x: 1, y: 1 },
      startDir: "E",
      grid: [
        "_______",
        "_SgBgg_",
        "_ggsgg_",
        "_RgBgg_",
        "_______"
      ],
      solution: ["repeat2", "collect", "right", "repeat2", "collect", "right", "repeat2", "upload"],
      allowed: ["move", "right", "repeat2", "collect", "upload"],
      required: 2,
      energy: 12,
      limit: 10,
      brief: {
        challenge: "创建 Atlas 和 Nova 两个独立探测员，让它们分别完成采集并保留各自的能量与动作记录。",
        intro: "同一种类型可以创建多个实例：",
        bullets: ["名字是对象档案的身份标识。", "初始化能量属于各自实例，不会自动共享。", "atlas.move() 与 nova.move() 会更新不同的成员记录。"],
        goal: "修复 Nova 的初始化参数，完成双成员协作任务。"
      }
    },
    21: {
      mode: "parameter-tool",
      pythonStudio: {
        clickToBuild: false,
        languageFeatures: ["functions", "for-loops"],
        starterVersion: "parameter-distance-v1",
        kicker: "第 21 课 · 函数参数",
        title: "让同一个工具适应两种距离",
        taskBadge: "修复第 8 行",
        taskHtml: "<code>move_steps(steps)</code> 会按照参数移动。第一段到信标需要 2 格，第二段到中继站需要 4 格；修复第二次调用的实参。",
        railEyebrow: "函数不变，输入可以变",
        railTitle: "参数调用对照表",
        initialFeedback: "先运行起始程序。第二次仍传入 2，所以探测员会在到达中继站前提前上传。",
        starterSource: [
          "def move_steps(steps):",
          "    for _ in range(steps):",
          "        move()",
          "",
          "move_steps(2)",
          "collect()",
          "",
          "move_steps(2)",
          "upload()"
        ].join("\n"),
        allowedFunctions: ["range", "move", "collect", "upload"],
        targets: [
          { search: "move_steps(2)", occurrence: 2, hint: "第二段距离是 4，把实参改为 4" }
        ],
        conceptChecks: [
          { pattern: "\\bdef\\s+move_steps\\(steps\\):", message: "需要保留带 steps 形参的 move_steps 函数" },
          { pattern: "\\bmove_steps\\(2\\)", message: "第一段需要调用 move_steps(2)" },
          { pattern: "\\bmove_steps\\(4\\)", message: "第二段需要调用 move_steps(4)" }
        ],
        stateChecks: [
          { kind: "function-call", name: "move_steps", arguments: { steps: 2 }, message: "参数轨迹需要记录第一段 steps=2" },
          { kind: "function-call", name: "move_steps", arguments: { steps: 4 }, message: "参数轨迹需要记录第二段 steps=4" }
        ],
        statePanel: {
          title: "参数调用表",
          description: "每次调用都进入同一个函数，但 steps 会收到不同的实参。",
          functions: [
            { name: "move_steps", label: "距离移动工具", targetCalls: [2, 4] }
          ]
        },
        templates: [
          { id: "relay-distance", label: "传入 4", code: "move_steps(4)", help: "第二段需要移动 4 格", recommended: true, replaceFrom: "move_steps(2)", replaceOccurrence: 2, replaceTo: "move_steps(4)" },
          { id: "old-distance", label: "仍传入 2", code: "move_steps(2)", help: "只会走到中继站前两格", snippet: "move_steps(2)" },
          { id: "function-header", code: "def move_steps(steps):", help: "steps 是函数接收的形参", snippet: "def move_steps(steps):" }
        ],
        translations: [["steps", "函数内部接收距离的形参"], ["move_steps(2)", "把实参 2 交给 steps"], ["move_steps(4)", "把实参 4 交给 steps"], ["range(steps)", "按照当前参数重复移动"]]
      },
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "_________",
        "_ggggggg_",
        "_SgBgggR_",
        "_ggg#ggg_",
        "_________"
      ],
      solution: ["repeat2", "collect", "repeat4", "upload"],
      allowed: ["move", "repeat2", "repeat4", "collect", "upload"],
      required: 1,
      energy: 10,
      limit: 6,
      brief: {
        challenge: "用同一个 move_steps 函数完成 2 格与 4 格两种路线。",
        intro: "参数让函数适应变化：",
        bullets: ["steps 是函数定义里的形参。", "2 和 4 是调用时传入的实参。", "函数结构不变，实参决定真实移动次数。"],
        goal: "修复第二次调用参数，抵达中继站并上传。"
      }
    },
    22: {
      mode: "return-channel",
      pythonStudio: {
        clickToBuild: false,
        languageFeatures: ["functions"],
        starterVersion: "boolean-return-v1",
        kicker: "第 22 课 · 返回值",
        title: "把安全判断交回给 if",
        taskBadge: "修复第 2 行",
        taskHtml: "<code>safe_ahead()</code> 应在前方安全时返回 <code>True</code>。起始程序把判断方向写反，导致危险格出现时没有开启护盾。",
        railEyebrow: "函数回答，调用者决策",
        railTitle: "返回值流向图",
        initialFeedback: "先运行起始程序，观察 safe_ahead() 返回 True 后，if 为什么跳过 shield()。",
        starterSource: [
          "def safe_ahead():",
          "    return is_hazard_ahead()",
          "",
          "move()",
          "if not safe_ahead():",
          "    shield()",
          "move()",
          "move()",
          "move()",
          "collect()"
        ].join("\n"),
        allowedFunctions: ["is_hazard_ahead", "move", "shield", "collect"],
        targets: [
          { search: "return is_hazard_ahead()", occurrence: 1, hint: "安全代表前方不是危险格" }
        ],
        conceptChecks: [
          { pattern: "\\breturn\\s+not\\s+is_hazard_ahead\\(\\)", message: "safe_ahead() 需要返回“前方不是危险格”" },
          { pattern: "\\bif\\s+not\\s+safe_ahead\\(\\):", message: "调用处需要使用返回值决定是否开盾" }
        ],
        stateChecks: [
          { kind: "function-return", name: "safe_ahead", equals: false, message: "危险格前 safe_ahead() 应真实返回 False" }
        ],
        statePanel: {
          title: "返回值流向图",
          description: "safe_ahead() 先计算布尔结果，再把结果交回 if 使用。",
          functions: [
            { name: "safe_ahead", label: "安全查询函数", targetReturns: [false] }
          ]
        },
        templates: [
          { id: "return-safe", label: "返回不是危险", code: "return not is_hazard_ahead()", help: "危险时返回 False", recommended: true, replaceFrom: "return is_hazard_ahead()", replaceTo: "return not is_hazard_ahead()" },
          { id: "return-hazard", label: "直接返回危险", code: "return is_hazard_ahead()", help: "含义与函数名相反", snippet: "return is_hazard_ahead()" },
          { id: "use-return", code: "if not safe_ahead():", help: "使用函数返回值进行判断", snippet: "if not safe_ahead():" }
        ],
        translations: [["return", "把函数算出的结果交回调用位置"], ["safe_ahead()", "询问前方是否安全"], ["not is_hazard_ahead()", "前方不是危险格"], ["if not safe_ahead()", "不安全时执行护盾动作"]]
      },
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "_______",
        "_ggggg_",
        "_SgHgB_",
        "_gg#gg_",
        "_______"
      ],
      solution: ["move", "ifHazardShield", "repeat3", "collect"],
      allowed: ["move", "repeat3", "shield", "ifHazardShield", "collect"],
      required: 1,
      energy: 9,
      limit: 6,
      brief: {
        challenge: "让安全查询函数返回正确布尔值，并由 if 使用它穿越危险格。",
        intro: "返回值是函数交回来的答案：",
        bullets: ["查询函数不直接移动或开盾。", "return 决定调用表达式得到什么值。", "if 使用这个值选择是否执行动作。"],
        goal: "修复返回方向，安全抵达信标并采集。"
      }
    },
    23: {
      mode: "ordered-task-list",
      pythonStudio: {
        clickToBuild: false,
        languageFeatures: ["functions", "for-loops", "lists"],
        starterVersion: "ordered-list-v1",
        kicker: "第 23 课 · 列表与遍历",
        title: "补回任务清单里的第三段距离",
        taskBadge: "修复第 5 行",
        taskHtml: "距离列表会先用索引读取第 0 项，再遍历剩余元素。起始清单少了第三座信标前的 3 格距离，请补回漏项。",
        railEyebrow: "顺序就是执行计划",
        railTitle: "多目标任务清单",
        initialFeedback: "先运行起始程序。列表只有两项，所以循环处理完第二座信标后会跳过第三座。",
        starterSource: [
          "def move_steps(steps):",
          "    for _ in range(steps):",
          "        move()",
          "",
          "target_distances = [2, 2]",
          "first_distance = target_distances[0]",
          "",
          "move_steps(first_distance)",
          "collect()",
          "",
          "for distance in target_distances[1:]:",
          "    move_steps(distance)",
          "    collect()",
          "",
          "move_steps(2)",
          "upload()"
        ].join("\n"),
        allowedFunctions: ["range", "move", "collect", "upload"],
        targets: [
          { search: "target_distances = [2, 2]", occurrence: 1, hint: "在列表末尾补上第三段距离 3" }
        ],
        conceptChecks: [
          { pattern: "\\btarget_distances\\s*=\\s*\\[\\s*2\\s*,\\s*2\\s*,\\s*3\\s*\\]", message: "距离清单需要按顺序包含 2、2、3" },
          { pattern: "target_distances\\[0\\]", message: "需要保留用索引 0 读取第一项的示例" },
          { pattern: "\\bfor\\s+distance\\s+in\\s+target_distances\\[1:\\]", message: "需要遍历第一项之后的剩余距离" }
        ],
        stateChecks: [
          { kind: "collection", name: "target_distances", equals: [2, 2, 3], message: "运行状态中的目标列表应为 [2, 2, 3]" },
          { kind: "function-call", name: "move_steps", arguments: { steps: 3 }, message: "第三段任务需要真实调用 move_steps(3)" }
        ],
        statePanel: {
          title: "多目标任务清单",
          description: "列表状态来自实际赋值，函数调用轨迹显示元素被依次使用。",
          collections: [
            { name: "target_distances", label: "信标距离列表", target: [2, 2, 3] }
          ],
          functions: [
            { name: "move_steps", label: "列表驱动的移动", targetCalls: [2, 2, 3, 2] }
          ]
        },
        templates: [
          { id: "complete-list", label: "补上第三段", code: "target_distances = [2, 2, 3]", help: "按路线顺序保存三段距离", recommended: true, replaceFrom: "target_distances = [2, 2]", replaceTo: "target_distances = [2, 2, 3]" },
          { id: "short-list", label: "保留两项", code: "target_distances = [2, 2]", help: "会漏掉第三座信标", snippet: "target_distances = [2, 2]" },
          { id: "first-index", code: "target_distances[0]", help: "索引 0 表示第一项", snippet: "target_distances[0]" }
        ],
        translations: [["[2, 2, 3]", "按顺序保存三段信标距离"], ["target_distances[0]", "读取列表第一项"], ["target_distances[1:]", "读取第一项之后的全部元素"], ["for distance in", "依次把每个元素交给 distance"]]
      },
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "____________",
        "_gggggggggg_",
        "_SgBgBggBgR_",
        "_ggg#gggggg_",
        "____________"
      ],
      solution: ["repeat2", "collect", "repeat2", "collect", "repeat3", "collect", "repeat2", "upload"],
      allowed: ["move", "repeat2", "repeat3", "collect", "upload"],
      required: 3,
      energy: 15,
      limit: 10,
      brief: {
        challenge: "用一个有序距离列表依次采集三座信标，再前往中继站。",
        intro: "列表是有顺序的任务清单：",
        bullets: ["索引 0 读取第一项。", "切片 [1:] 表示剩余全部元素。", "for 会按列表顺序逐个处理。"],
        goal: "补回第三段距离，让任务清单覆盖全部信标。"
      }
    },
    24: {
      mode: "array-refactor-boss",
      pythonStudio: {
        clickToBuild: false,
        languageFeatures: ["functions", "for-loops", "lists"],
        starterVersion: "array-refactor-v1",
        kicker: "第 24 课 · 阶段作品",
        title: "让循环跟随任务清单的真实长度",
        taskBadge: "修复第 10 行",
        taskHtml: "程序先用 <code>remove</code>、<code>insert</code>、<code>append</code> 整理路线数组，但循环仍写死为 5 次。把循环重构为读取数组真实长度，避免索引越界。",
        railEyebrow: "数据变了，边界也要跟着变",
        railTitle: "数组重构工坊",
        initialFeedback: "先运行起始程序。四段路线已经完成，但第 5 次访问 segments[4] 会越过列表边界。",
        starterSource: [
          "def move_steps(steps):",
          "    for _ in range(steps):",
          "        move()",
          "",
          "segments = [2, 99, 2]",
          "segments.remove(99)",
          "segments.insert(2, 3)",
          "segments.append(2)",
          "",
          "for index in range(5):",
          "    move_steps(segments[index])",
          "    if index < 3:",
          "        collect()",
          "",
          "upload()"
        ].join("\n"),
        allowedFunctions: ["range", "len", "append", "insert", "remove", "move", "collect", "upload"],
        targets: [
          { search: "for index in range(5):", occurrence: 1, hint: "使用 range(len(segments)) 读取数组真实长度" }
        ],
        conceptChecks: [
          { pattern: "\\bsegments\\.remove\\(99\\)", message: "需要保留 remove 清理错误距离" },
          { pattern: "\\bsegments\\.insert\\(2\\s*,\\s*3\\)", message: "需要保留 insert 插入第三段距离" },
          { pattern: "\\bsegments\\.append\\(2\\)", message: "需要保留 append 添加中继站距离" },
          { pattern: "\\brange\\(len\\(segments\\)\\)", message: "循环边界必须来自 segments 的真实长度" }
        ],
        stateChecks: [
          { kind: "collection", name: "segments", equals: [2, 2, 3, 2], message: "整理后的路线数组应为 [2, 2, 3, 2]" },
          { kind: "function-call", name: "move_steps", arguments: { steps: 3 }, message: "数组中的第三段距离需要进入函数调用" }
        ],
        statePanel: {
          title: "数据与函数任务包",
          description: "数组的每次增删和函数的每次调用都来自真实运行轨迹。",
          collections: [
            { name: "segments", label: "重构后的路线数组", target: [2, 2, 3, 2] }
          ],
          functions: [
            { name: "move_steps", label: "数组驱动移动", targetCalls: [2, 2, 3, 2] }
          ]
        },
        templates: [
          { id: "data-length", label: "读取数组长度", code: "for index in range(len(segments)):", help: "列表增删后仍保持正确边界", recommended: true, replaceFrom: "for index in range(5):", replaceTo: "for index in range(len(segments)):" },
          { id: "fixed-five", label: "固定循环 5 次", code: "for index in range(5):", help: "第 5 次会访问不存在的索引 4", snippet: "for index in range(5):" },
          { id: "append-segment", code: "segments.append(2)", help: "在数组末尾添加中继站距离", snippet: "segments.append(2)" }
        ],
        translations: [["remove(99)", "移除错误距离 99"], ["insert(2, 3)", "在索引 2 插入距离 3"], ["append(2)", "在末尾加入距离 2"], ["len(segments)", "读取数组当前真实长度"]]
      },
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "____________",
        "_gggggggggg_",
        "_SgBgBggBgR_",
        "_ggg#gggggg_",
        "____________"
      ],
      solution: ["repeat2", "collect", "repeat2", "collect", "repeat3", "collect", "repeat2", "upload"],
      allowed: ["move", "repeat2", "repeat3", "collect", "upload"],
      required: 3,
      energy: 16,
      limit: 10,
      brief: {
        challenge: "整理一份会发生增删的路线数组，并让循环边界始终跟随真实数据长度。",
        intro: "数组重构同时处理数据和程序边界：",
        bullets: ["remove 删除错误元素。", "insert 与 append 补齐有序任务。", "range(len(...)) 避免数据变化后的索引越界。"],
        goal: "修复越界，完成三座信标与最终上传，生成数据与函数任务包。"
      }
    },
    25: {
      mode: "strategy-dictionary",
      pythonStudio: {
        clickToBuild: false,
        languageFeatures: ["dictionaries"],
        starterVersion: "terrain-rules-v1",
        kicker: "第 25 课 · 字典与规则",
        title: "修复危险地形对应的处理策略",
        taskBadge: "修复第 1 行",
        taskHtml: "字典把地形字符映射到处理动作。起始规则把危险格 <code>H</code> 对应成了 <code>move</code>，导致查询结果无法开启护盾。",
        railEyebrow: "用键找到规则",
        railTitle: "地形策略字典",
        initialFeedback: "先运行起始程序。hazard_action 会从字典真实查到 move，因此 if 不会执行 shield()。",
        starterSource: [
          "terrain_actions = {\"H\": \"move\", \"B\": \"collect\", \"R\": \"upload\"}",
          "hazard_action = terrain_actions[\"H\"]",
          "",
          "move()",
          "if hazard_action == \"shield\":",
          "    shield()",
          "move()",
          "move()",
          "move()",
          "collect()",
          "move()",
          "move()",
          "upload()"
        ].join("\n"),
        allowedFunctions: ["move", "shield", "collect", "upload"],
        targets: [
          { search: "\"H\": \"move\"", occurrence: 1, hint: "把 H 对应的值改成 shield" }
        ],
        conceptChecks: [
          { pattern: "[\"']H[\"']\\s*:\\s*[\"']shield[\"']", message: "字典中的 H 必须对应 shield 策略" },
          { pattern: "terrain_actions\\s*\\[\\s*[\"']H[\"']\\s*\\]", message: "程序需要通过键 H 查找策略" }
        ],
        stateChecks: [
          { kind: "collection", name: "terrain_actions", equals: { H: "shield", B: "collect", R: "upload" }, message: "运行状态中的规则字典还没有正确配对" },
          { kind: "variable", name: "hazard_action", equals: "shield", message: "hazard_action 应从字典查到 shield" }
        ],
        statePanel: {
          title: "规则字典",
          description: "每个键对应一种地形，每个值说明程序应采用的策略。",
          collections: [
            { name: "terrain_actions", label: "地形 → 策略", target: { H: "shield", B: "collect", R: "upload" } }
          ],
          variables: [
            { name: "hazard_action", label: "危险格查询结果", initial: "未查询", target: "shield" }
          ]
        },
        templates: [
          { id: "shield-rule", label: "H 对应护盾", code: "\"H\": \"shield\"", help: "危险格前开启护盾", recommended: true, replaceFrom: "\"H\": \"move\"", replaceTo: "\"H\": \"shield\"" },
          { id: "move-rule", label: "H 对应移动", code: "\"H\": \"move\"", help: "会跳过护盾判断", snippet: "\"H\": \"move\"" },
          { id: "dictionary-lookup", code: "terrain_actions[\"H\"]", help: "用键 H 查找对应值", snippet: "terrain_actions[\"H\"]" }
        ],
        translations: [["terrain_actions", "保存地形处理规则的字典"], ["\"H\": \"shield\"", "危险地形对应护盾策略"], ["terrain_actions[\"H\"]", "查找键 H 对应的值"], ["hazard_action", "本次查询得到的动作名称"]]
      },
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "_________",
        "_ggggggg_",
        "_SgHgBgR_",
        "_gg#gggg_",
        "_________"
      ],
      solution: ["move", "ifHazardShield", "repeat2", "move", "collect", "repeat2", "upload"],
      allowed: ["move", "repeat2", "collect", "upload", "shield", "ifHazardShield"],
      required: 1,
      energy: 12,
      limit: 9,
      brief: {
        challenge: "通过规则字典查找危险地形对应的动作，安全采集并上传。",
        intro: "字典把名称与规则配对：",
        bullets: ["H、B、R 是可查找的键。", "shield、collect、upload 是对应值。", "查询结果可以进入 if 驱动决策。"],
        goal: "修复 H 的策略映射，安全完成任务。"
      }
    },
    26: {
      mode: "matrix-world",
      pythonStudio: {
        clickToBuild: false,
        languageFeatures: ["lists", "world-building"],
        starterVersion: "matrix-map-v1",
        kicker: "第 26 课 · 二维地图",
        title: "修复二维表里的中继站字符",
        taskBadge: "修复第 3 行",
        taskHtml: "世界由四行字符列表生成。第 2 行第 5 列本应是中继站 <code>R</code>，起始数据却写成普通草地 <code>g</code>。",
        railEyebrow: "先找行，再找列",
        railTitle: "地图编码表",
        initialFeedback: "先运行起始程序。3D 世界会按当前二维表重建，因为缺少 R，程序会一直寻找不存在的中继站。",
        starterSource: [
          "row0 = [\"_\", \"_\", \"_\", \"_\", \"_\", \"_\", \"_\"]",
          "row1 = [\"_\", \"g\", \"g\", \"g\", \"g\", \"g\", \"_\"]",
          "row2 = [\"_\", \"S\", \"g\", \"B\", \"g\", \"g\", \"_\"]",
          "row3 = [\"_\", \"_\", \"_\", \"_\", \"_\", \"_\", \"_\"]",
          "map_data = [row0, row1, row2, row3]",
          "build_world(map_data)",
          "",
          "while not at_beacon():",
          "    move()",
          "collect()",
          "while not at_relay():",
          "    move()",
          "upload()"
        ].join("\n"),
        allowedFunctions: ["build_world", "move", "collect", "upload", "at_beacon", "at_relay"],
        targets: [
          { search: "\"B\", \"g\", \"g\", \"_\"", occurrence: 1, hint: "把 row2 中索引 5 的 g 改成 R" }
        ],
        conceptChecks: [
          { pattern: "row2\\s*=\\s*\\[[^\\n]*[\"']B[\"'][^\\n]*[\"']R[\"']", message: "row2 必须同时编码信标 B 与中继站 R" },
          { pattern: "\\bbuild_world\\(map_data\\)", message: "二维表需要交给 build_world 生成世界" }
        ],
        stateChecks: [
          { kind: "world-grid", equals: ["_______", "_ggggg_", "_SgBgR_", "_______"], message: "运行生成的世界网格与目标编码还不一致" }
        ],
        statePanel: {
          title: "地图编码表",
          description: "字符矩阵来自学生列表；build_world 会把它翻译为真实世界格子。",
          worlds: [
            { name: "map_data", label: "二维字符世界", targetGrid: ["_______", "_ggggg_", "_SgBgR_", "_______"], targetText: "row2 的索引 5 应为 R" }
          ]
        },
        templates: [
          { id: "relay-character", label: "写入中继站 R", code: "\"B\", \"g\", \"R\", \"_\"", help: "row2 索引 5 生成中继站", recommended: true, replaceFrom: "\"B\", \"g\", \"g\", \"_\"", replaceTo: "\"B\", \"g\", \"R\", \"_\"" },
          { id: "grass-character", label: "保留普通草地", code: "\"B\", \"g\", \"g\", \"_\"", help: "世界中不会出现中继站", snippet: "\"B\", \"g\", \"g\", \"_\"" },
          { id: "build-world", code: "build_world(map_data)", help: "用二维数据重建 3D 世界", snippet: "build_world(map_data)" }
        ],
        translations: [["row2", "二维表的第 2 行"], ["row2[5]", "第 2 行索引 5 的格子"], ["R", "中继站字符"], ["build_world(map_data)", "把字符表生成可运行世界"]]
      },
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "_______",
        "_ggggg_",
        "_SgBgR_",
        "_______"
      ],
      solution: ["repeat2", "collect", "repeat2", "upload"],
      allowed: ["move", "repeat2", "collect", "upload"],
      required: 1,
      energy: 9,
      limit: 6,
      brief: {
        challenge: "用二维字符列表生成世界，并修复中继站所在行列的编码。",
        intro: "二维地图是一张数据表：",
        bullets: ["外层列表保存多行。", "每个内层列表保存一行格子。", "row 与 column 一起定位字符和世界位置。"],
        goal: "修复 R 字符，生成并走通数据世界。"
      }
    },
    27: {
      mode: "world-builder",
      pythonStudio: {
        clickToBuild: false,
        languageFeatures: ["lists", "world-building"],
        starterVersion: "portal-builder-v1",
        kicker: "第 27 课 · 世界建造 API",
        title: "把传送门出口放到第二座岛",
        taskBadge: "修复第 8 行",
        taskHtml: "蓝图生成后，程序会放置一块地、移除一块空位并配对传送门。起始出口落在第 1 行，传送后前方是虚空；请把出口改到第 2 行。",
        railEyebrow: "每次建造都可回放",
        railTitle: "世界蓝图事件",
        initialFeedback: "先运行起始程序，观察世界生成、放置、移除、配对四类事件，再看错误出口造成的跌落。",
        starterSource: [
          "blueprint = [\"_________\", \"_Sg______\", \"_____gBR_\", \"_________\"]",
          "build_world(blueprint)",
          "",
          "place_tile(2, 1, \"g\")",
          "remove_tile(4, 1)",
          "",
          "# 出口应落在第二座岛的 (5, 2)",
          "pair_portals(3, 1, 5, 1)",
          "",
          "while not at_beacon():",
          "    move()",
          "collect()",
          "move()",
          "upload()"
        ].join("\n"),
        allowedFunctions: ["build_world", "place_tile", "remove_tile", "pair_portals", "move", "collect", "upload", "at_beacon"],
        targets: [
          { search: "pair_portals(3, 1, 5, 1)", occurrence: 1, hint: "把出口 y 坐标从 1 改为 2" }
        ],
        conceptChecks: [
          { pattern: "\\bplace_tile\\(2\\s*,\\s*1\\s*,\\s*[\"']g[\"']\\)", message: "世界蓝图需要包含放置格子事件" },
          { pattern: "\\bremove_tile\\(4\\s*,\\s*1\\)", message: "世界蓝图需要包含移除格子事件" },
          { pattern: "\\bpair_portals\\(3\\s*,\\s*1\\s*,\\s*5\\s*,\\s*2\\)", message: "传送门出口必须配对到第二座岛的 (5, 2)" }
        ],
        stateChecks: [
          { kind: "world-grid", equals: ["_________", "_SgP_____", "_____PBR_", "_________"], message: "最终世界蓝图中的传送门位置还不正确" },
          { kind: "world-portals", equals: 1, message: "世界必须保存一对传送门" },
          { kind: "world-placements", equals: 2, message: "放置和移除事件都需要进入建造记录" }
        ],
        statePanel: {
          title: "世界蓝图",
          description: "代码事件会立即修改字符世界，并同步到左侧任务地图。",
          worlds: [
            { name: "blueprint", label: "跨岛建造结果", targetGrid: ["_________", "_SgP_____", "_____PBR_", "_________"], targetPortals: 1, targetPlacements: 2, targetText: "出口应位于 (5, 2)" }
          ]
        },
        templates: [
          { id: "portal-on-island", label: "出口放到第二座岛", code: "pair_portals(3, 1, 5, 2)", help: "传送后前方是信标", recommended: true, replaceFrom: "pair_portals(3, 1, 5, 1)", replaceTo: "pair_portals(3, 1, 5, 2)" },
          { id: "portal-in-void", label: "出口留在第 1 行", code: "pair_portals(3, 1, 5, 1)", help: "传送后会面对虚空", snippet: "pair_portals(3, 1, 5, 1)" },
          { id: "remove-tile", code: "remove_tile(4, 1)", help: "移除指定坐标的格子", snippet: "remove_tile(4, 1)" }
        ],
        translations: [["place_tile", "在指定坐标放置格子"], ["remove_tile", "移除指定坐标格子"], ["pair_portals", "把两个坐标登记为双向传送门"], ["(5, 2)", "第二座岛上的出口位置"]]
      },
      start: { x: 1, y: 1 },
      startDir: "E",
      grid: [
        "_________",
        "_SgP_____",
        "_____PBR_",
        "_________"
      ],
      solution: ["repeat2", "move", "collect", "move", "upload"],
      allowed: ["move", "repeat2", "collect", "upload"],
      required: 1,
      energy: 10,
      limit: 7,
      brief: {
        challenge: "用建造 API 修改蓝图并配对跨岛传送门，让世界保持可解。",
        intro: "世界建造是一串可验证事件：",
        bullets: ["build_world 建立初始蓝图。", "place 与 remove 修改具体坐标。", "pair_portals 必须让入口和出口都落在可用位置。"],
        goal: "修复出口坐标，通过传送门完成跨岛采集与上传。"
      }
    },
    28: {
      mode: "component-kit",
      pythonStudio: {
        clickToBuild: false,
        objectModel: true,
        languageFeatures: ["lists", "components"],
        starterVersion: "rescue-components-v1",
        kicker: "第 28 课 · 类与组件",
        title: "为 RescueKit 补上上传组件",
        taskBadge: "修复第 1 行",
        taskHtml: "<code>RescueKit</code> 类型会把组件组合成实例能力。起始清单只有移动和采集，路线完成后无法执行上传方法。",
        railEyebrow: "组件各管一件事",
        railTitle: "组件关系图",
        initialFeedback: "先运行起始程序。对象档案会显示现有组件，上传时会指出缺少的职责。",
        starterSource: [
          "kit = RescueKit(\"Aster\", 8, [\"move\", \"collect\"])",
          "",
          "while not at_beacon():",
          "    kit.move()",
          "kit.collect()",
          "",
          "while not at_relay():",
          "    kit.move()",
          "kit.upload()"
        ].join("\n"),
        allowedFunctions: ["RescueKit", "move", "collect", "upload", "at_beacon", "at_relay"],
        targets: [
          { search: "[\"move\", \"collect\"]", occurrence: 1, hint: "在组件列表末尾加入 upload" }
        ],
        conceptChecks: [
          { pattern: "RescueKit\\(\\s*[\"']Aster[\"']\\s*,\\s*8\\s*,\\s*\\[[^\\]]*[\"']move[\"'][^\\]]*[\"']collect[\"'][^\\]]*[\"']upload[\"']", message: "RescueKit 必须组合 move、collect、upload 三个组件" }
        ],
        stateChecks: [
          { kind: "object", name: "Aster", property: "components", equals: ["move", "collect", "upload"], message: "Aster 的组件清单还不完整" },
          { kind: "object-action", name: "Aster", type: "RescueKit", action: "upload", message: "上传动作需要进入 Aster 的组件执行记录" }
        ],
        statePanel: {
          title: "组件关系图",
          description: "RescueKit 是组件容器；列表决定 Aster 实例最终具备哪些职责。",
          objects: [
            { name: "Aster", label: "救援组件实例", expectedType: "RescueKit", expectedComponents: ["move", "collect", "upload"], targetEnergy: 4 }
          ]
        },
        templates: [
          { id: "complete-components", label: "加入上传组件", code: "[\"move\", \"collect\", \"upload\"]", help: "补齐任务所需三项职责", recommended: true, replaceFrom: "[\"move\", \"collect\"]", replaceTo: "[\"move\", \"collect\", \"upload\"]" },
          { id: "missing-upload", label: "只有移动与采集", code: "[\"move\", \"collect\"]", help: "抵达中继站后无法上传", snippet: "[\"move\", \"collect\"]" },
          { id: "kit-upload", code: "kit.upload()", help: "请求 upload 组件执行上传", snippet: "kit.upload()" }
        ],
        translations: [["RescueKit", "可组合组件的任务单元类型"], ["move", "负责移动的组件"], ["collect", "负责采集的组件"], ["upload", "负责上传的组件"]]
      },
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "_______",
        "_ggggg_",
        "_SgBgR_",
        "_gg#gg_",
        "_______"
      ],
      solution: ["repeat2", "collect", "repeat2", "upload"],
      allowed: ["move", "repeat2", "collect", "upload"],
      required: 1,
      energy: 10,
      limit: 6,
      brief: {
        challenge: "给 RescueKit 组合完成任务所需的移动、采集与上传组件。",
        intro: "组合让能力来自多个单一职责组件：",
        bullets: ["类型规定组件容器和方法接口。", "组件列表决定实例实际能力。", "缺少组件时，路线正确也不能执行相应方法。"],
        goal: "补齐上传组件，让 Aster 完成完整救援流程。"
      }
    },
    29: {
      mode: "multi-object-roles",
      pythonStudio: {
        clickToBuild: false,
        objectModel: true,
        multiObject: true,
        starterVersion: "multi-object-roles-v1",
        kicker: "第 29 课 · 多对象分工",
        title: "把采集任务交给 Explorer",
        taskBadge: "修复第 8 行",
        taskHtml: "Neo 与 Carrier 有独立位置和状态。<code>Spaceship</code> 可以移动与上传，但不能采集；请把信标任务交回 Explorer。",
        railEyebrow: "每个对象保留自己的状态",
        railTitle: "协作对象档案",
        initialFeedback: "先运行起始程序。Carrier 会在自己的位置移动到信标，但能力边界会阻止它采集。",
        starterSource: [
          "neo = Explorer(\"Neo\", 8, 1, 2, \"E\")",
          "carrier = Spaceship(\"Carrier\", 6, 1, 1, \"E\")",
          "",
          "while not at_beacon():",
          "    neo.move()",
          "",
          "# Spaceship 不具备采集能力",
          "carrier.collect()",
          "",
          "while not at_relay():",
          "    carrier.move()",
          "carrier.upload()"
        ].join("\n"),
        allowedFunctions: ["Explorer", "Spaceship", "move", "collect", "upload", "at_beacon", "at_relay"],
        targets: [
          { search: "carrier.collect()", occurrence: 1, hint: "让 Explorer 实例 Neo 执行采集" }
        ],
        conceptChecks: [
          { pattern: "\\bneo\\.collect\\(\\)", message: "采集必须交给 Explorer 实例 Neo" },
          { pattern: "\\bcarrier\\.upload\\(\\)", message: "上传应由 Spaceship 实例 Carrier 完成" }
        ],
        stateChecks: [
          { kind: "object-action", name: "Neo", type: "Explorer", action: "collect", message: "Neo 需要留下采集动作记录" },
          { kind: "object-action", name: "Carrier", type: "Spaceship", action: "upload", message: "Carrier 需要留下上传动作记录" }
        ],
        statePanel: {
          title: "协作流程图",
          description: "两个实例各自保存位置、能量与动作；世界结果由它们共同完成。",
          objects: [
            { name: "Neo", label: "采集负责人", expectedType: "Explorer", targetPosition: [3, 2], targetEnergy: 6, showPosition: true },
            { name: "Carrier", label: "上传负责人", expectedType: "Spaceship", targetPosition: [5, 1], targetEnergy: 2, showPosition: true }
          ]
        },
        templates: [
          { id: "neo-collect-role", label: "交给 Neo 采集", code: "neo.collect()", help: "Explorer 具备采集能力", recommended: true, replaceFrom: "carrier.collect()", replaceTo: "neo.collect()" },
          { id: "carrier-collect-role", label: "仍交给 Carrier", code: "carrier.collect()", help: "Spaceship 不具备采集能力", snippet: "carrier.collect()" },
          { id: "carrier-upload-role", code: "carrier.upload()", help: "Spaceship 负责最终上传", snippet: "carrier.upload()" }
        ],
        translations: [["neo", "拥有独立位置的 Explorer 实例"], ["carrier", "拥有独立位置的 Spaceship 实例"], ["neo.collect()", "由 Neo 完成采集"], ["carrier.upload()", "由 Carrier 完成上传"]]
      },
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "_______",
        "_ggggR_",
        "_SgBgg_",
        "_gg#gg_",
        "_______"
      ],
      solution: ["repeat2", "collect", "repeat4", "upload"],
      allowed: ["move", "repeat2", "repeat4", "collect", "upload"],
      required: 1,
      energy: 14,
      limit: 8,
      brief: {
        challenge: "让 Neo 负责采集、Carrier 负责上传，并保留各自的位置与能量状态。",
        intro: "多对象协作先明确能力边界：",
        bullets: ["每个实例拥有独立坐标。", "Explorer 能采集。", "Spaceship 能上传，但不能采集。"],
        goal: "修复职责分配，完成跨对象任务。"
      }
    },
    30: {
      mode: "object-sync",
      pythonStudio: {
        clickToBuild: false,
        objectModel: true,
        multiObject: true,
        starterVersion: "wait-sync-v1",
        kicker: "第 30 课 · 等待与同步",
        title: "让 Atlas 等待一拍再进入共享格",
        taskBadge: "补全第 4 行",
        taskHtml: "Atlas 从 (1,2) 前往 (2,2)，Nova 正占用该格。对象上一次执行 <code>wait()</code> 后可以按同步规则进入共享格；补上等待解除冲突。",
        railEyebrow: "时序也是状态",
        railTitle: "同步时间线",
        initialFeedback: "先运行起始程序。冲突事件会指出谁试图进入哪一格、该位置被谁占用。",
        starterSource: [
          "atlas = Explorer(\"Atlas\", 5, 1, 2, \"E\")",
          "nova = Explorer(\"Nova\", 5, 2, 2, \"E\")",
          "",
          "# TODO: Atlas 先等待一拍",
          "atlas.move()"
        ].join("\n"),
        allowedFunctions: ["Explorer", "wait", "move"],
        targets: [
          { search: "# TODO: Atlas 先等待一拍", occurrence: 1, hint: "调用 atlas.wait() 再移动" }
        ],
        conceptChecks: [
          { pattern: "\\batlas\\.wait\\(\\)", message: "Atlas 进入共享格前需要等待一拍" },
          { pattern: "\\batlas\\.move\\(\\)", message: "等待后仍需要执行移动" }
        ],
        stateChecks: [
          { kind: "object", name: "Atlas", property: "waits", equals: 1, message: "Atlas 的对象状态需要记录一次等待" },
          { kind: "object-action", name: "Atlas", type: "Explorer", action: "move", message: "同步后 Atlas 需要完成移动" }
        ],
        statePanel: {
          title: "同步时序图",
          description: "wait 不改变位置，但会改变下一动作的时序许可。",
          objects: [
            { name: "Atlas", label: "等待后移动", expectedType: "Explorer", targetPosition: [2, 2], targetWaits: 1, targetEnergy: 4, showPosition: true },
            { name: "Nova", label: "共享格占用者", expectedType: "Explorer", targetPosition: [2, 2], targetEnergy: 5, showPosition: true }
          ]
        },
        templates: [
          { id: "atlas-wait", label: "等待一拍", code: "atlas.wait()", help: "为下一次移动取得同步许可", recommended: true, replaceFrom: "# TODO: Atlas 先等待一拍", replaceTo: "atlas.wait()" },
          { id: "move-now", label: "立即移动", code: "atlas.move()", help: "会与 Nova 发生占位冲突", snippet: "atlas.move()" },
          { id: "wait-method", code: "atlas.wait()", help: "位置不变，等待计数增加", snippet: "atlas.wait()" }
        ],
        translations: [["wait()", "保持位置并让出当前时序"], ["共享格", "多个对象需要协调进入的同一坐标"], ["占位冲突", "目标格当前被另一个对象占用"]]
      },
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "_____",
        "_ggg_",
        "_Sgg_",
        "_ggg_",
        "_____"
      ],
      solution: ["wait", "move"],
      allowed: ["move", "wait"],
      required: 0,
      energy: 8,
      limit: 3,
      brief: {
        challenge: "用 wait 调整两个对象进入共享格的时序，修复占位冲突。",
        intro: "同步问题来自时间与位置共同作用：",
        bullets: ["立即移动会检测目标格占用。", "wait 保持位置但更新时序状态。", "等待后再移动可以通过本课同步许可。"],
        goal: "让 Atlas 等待一次后进入共享格。"
      }
    },
    31: {
      mode: "schema-creator",
      pythonStudio: {
        clickToBuild: false,
        languageFeatures: ["dictionaries", "lists", "world-building"],
        starterVersion: "schema-world-v1",
        kicker: "第 31 课 · 原创关卡 schema",
        title: "让 schema 声明与地图目标一致",
        taskBadge: "修复第 4 行",
        taskHtml: "原创关卡字典声明有 2 座信标，但地图实际只编码了 1 座。修复 <code>beacons</code> 字段，通过校验后生成并走通世界。",
        railEyebrow: "发布前先机器校验",
        railTitle: "原创关卡规则表",
        initialFeedback: "先运行起始程序。validate_world 会比较 schema 声明与地图真实字符，并直接指出不一致。",
        starterSource: [
          "level = {",
          "    \"name\": \"Relay Garden\",",
          "    \"map\": [\"_______\", \"_SgBgR_\", \"_______\"],",
          "    \"beacons\": 2,",
          "    \"upload\": True",
          "}",
          "validate_world(level)",
          "build_world(level[\"map\"])",
          "",
          "while not at_beacon():",
          "    move()",
          "collect()",
          "while not at_relay():",
          "    move()",
          "upload()"
        ].join("\n"),
        allowedFunctions: ["validate_world", "build_world", "move", "collect", "upload", "at_beacon", "at_relay"],
        targets: [
          { search: "\"beacons\": 2", occurrence: 1, hint: "地图实际只有 1 座信标" }
        ],
        conceptChecks: [
          { pattern: "[\"']beacons[\"']\\s*:\\s*1", message: "schema 的 beacons 字段应与地图中的 1 座信标一致" },
          { pattern: "\\bvalidate_world\\(level\\)", message: "原创关卡必须先通过 schema 校验" },
          { pattern: "\\bbuild_world\\(level\\[[\"']map[\"']\\]\\)", message: "校验后需要从 schema 的 map 字段生成世界" }
        ],
        stateChecks: [
          { kind: "world-schema", property: "beacons", equals: 1, message: "关卡 schema 的信标数量仍不正确" }
        ],
        statePanel: {
          title: "原创关卡 v1",
          description: "schema 校验通过后，地图字段才进入世界生成器与参考解验证。",
          worlds: [
            { name: "level", label: "Relay Garden", targetGrid: ["_______", "_SgBgR_", "_______"], targetText: "schema 需声明 1 座信标并要求上传" }
          ],
          collections: [
            { name: "level", label: "关卡 schema", target: { name: "Relay Garden", map: ["_______", "_SgBgR_", "_______"], beacons: 1, upload: true } }
          ]
        },
        templates: [
          { id: "one-beacon", label: "声明 1 座信标", code: "\"beacons\": 1", help: "与地图中的 B 数量一致", recommended: true, replaceFrom: "\"beacons\": 2", replaceTo: "\"beacons\": 1" },
          { id: "two-beacons", label: "仍声明 2 座", code: "\"beacons\": 2", help: "会被 schema 校验拒绝", snippet: "\"beacons\": 2" },
          { id: "validate-level", code: "validate_world(level)", help: "比较字段、地图与成功条件", snippet: "validate_world(level)" }
        ],
        translations: [["schema", "机器可读取的关卡规则约定"], ["beacons", "关卡要求的信标数量"], ["upload", "是否要求到中继站上传"], ["validate_world", "检查规则与地图是否一致"]]
      },
      start: { x: 1, y: 1 },
      startDir: "E",
      grid: [
        "_______",
        "_SgBgR_",
        "_______"
      ],
      solution: ["repeat2", "collect", "repeat2", "upload"],
      allowed: ["move", "repeat2", "collect", "upload"],
      required: 1,
      energy: 9,
      limit: 6,
      brief: {
        challenge: "修复原创关卡 schema，让声明、地图和参考解全部一致。",
        intro: "发布关卡需要一份完整约定：",
        bullets: ["name 标识作品。", "map 描述世界。", "beacons 与 upload 描述成功条件。"],
        goal: "通过 schema 校验并完成一次参考解。"
      }
    },
    32: {
      mode: "core-reconnection-boss",
      pythonStudio: {
        clickToBuild: false,
        objectModel: true,
        multiObject: true,
        languageFeatures: ["dictionaries", "lists", "world-building"],
        starterVersion: "core-capstone-v1",
        kicker: "第 32 课 · 共同核心毕业作品",
        title: "补上最后一次同步等待，重新连接星区",
        taskBadge: "补全第 14 行",
        taskHtml: "世界 schema、组件、对象分工都已就位。路线能够完成，但毕业能力门还缺少 Carrier 的同步等待证据；补上等待，让世界、对象与同步同时通过。",
        railEyebrow: "最后一次能力整合",
        railTitle: "共同核心毕业档案",
        initialFeedback: "先运行起始程序。系统会先校验世界，再回放两个对象的独立动作，最后在共享格冲突处停止。",
        starterSource: [
          "world = {\"name\": \"Reconnection\", \"map\": [\"________\", \"_gggggR_\", \"_SgBggg_\", \"________\"], \"beacons\": 1, \"upload\": True}",
          "validate_world(world)",
          "build_world(world[\"map\"])",
          "",
          "neo = Explorer(\"Neo\", 8, 1, 2, \"E\")",
          "carrier = Spaceship(\"Carrier\", 8, 1, 1, \"E\")",
          "",
          "while not at_beacon():",
          "    neo.move()",
          "neo.collect()",
          "",
          "while not at_relay():",
          "    carrier.move()",
          "# TODO: Carrier 上传前等待同步",
          "carrier.upload()"
        ].join("\n"),
        allowedFunctions: ["validate_world", "build_world", "Explorer", "Spaceship", "move", "wait", "collect", "upload", "at_beacon", "at_relay"],
        targets: [
          { search: "# TODO: Carrier 上传前等待同步", occurrence: 1, hint: "调用 carrier.wait() 记录最终同步" }
        ],
        conceptChecks: [
          { pattern: "\\bvalidate_world\\(world\\)", message: "毕业作品需要先校验世界 schema" },
          { pattern: "\\bneo\\.collect\\(\\)", message: "Explorer 需要完成采集职责" },
          { pattern: "\\bcarrier\\.wait\\(\\)", message: "Carrier 上传前需要留下同步等待证据" },
          { pattern: "\\bcarrier\\.upload\\(\\)", message: "Spaceship 需要完成上传职责" }
        ],
        stateChecks: [
          { kind: "world-schema", property: "beacons", equals: 1, message: "世界 schema 需要通过校验" },
          { kind: "object-action", name: "Neo", type: "Explorer", action: "collect", message: "Neo 需要留下采集证据" },
          { kind: "object", name: "Carrier", property: "waits", equals: 1, message: "Carrier 需要记录一次同步等待" },
          { kind: "object-action", name: "Carrier", type: "Spaceship", action: "upload", message: "Carrier 需要留下上传证据" }
        ],
        statePanel: {
          title: "共同核心毕业档案",
          description: "世界校验、对象分工、独立状态、等待同步和最终上传共同决定毕业能力门。",
          worlds: [
            { name: "world", label: "Reconnection 世界", targetGrid: ["________", "_gggggR_", "_SgBggg_", "________"], targetText: "schema 已校验" }
          ],
          objects: [
            { name: "Neo", label: "采集对象", expectedType: "Explorer", targetPosition: [3, 2], targetEnergy: 6, showPosition: true },
            { name: "Carrier", label: "同步上传对象", expectedType: "Spaceship", targetPosition: [6, 1], targetWaits: 1, targetEnergy: 3, showPosition: true }
          ]
        },
        templates: [
          { id: "carrier-wait-capstone", label: "记录最终等待", code: "carrier.wait()", help: "上传前完成同步能力门", recommended: true, replaceFrom: "# TODO: Carrier 上传前等待同步", replaceTo: "carrier.wait()" },
          { id: "skip-wait-capstone", label: "直接上传", code: "carrier.upload()", help: "世界会完成但缺少同步证据", snippet: "carrier.upload()" },
          { id: "validate-capstone", code: "validate_world(world)", help: "先验证世界规则", snippet: "validate_world(world)" }
        ],
        translations: [["validate_world", "校验世界规则与地图"], ["Explorer", "负责采集的对象类型"], ["Spaceship", "负责上传的对象类型"], ["wait", "多对象同步证据"]]
      },
      start: { x: 1, y: 2 },
      startDir: "E",
      grid: [
        "________",
        "_gggggR_",
        "_SgBggg_",
        "________"
      ],
      solution: ["repeat2", "collect", "repeat5", "wait", "upload"],
      allowed: ["move", "wait", "repeat2", "repeat5", "collect", "upload"],
      required: 1,
      energy: 18,
      limit: 9,
      brief: {
        challenge: "综合使用世界 schema、多对象独立状态、能力分工和等待同步，完成共同核心毕业任务。",
        intro: "重新连接需要整个系统同时成立：",
        bullets: ["数据定义世界规则。", "对象类型决定职责。", "独立位置与等待记录协作时序。", "世界完成与语义证据共同构成能力门。"],
        goal: "补上最后一次等待，保存共同核心毕业包与个人星际档案。"
      }
    },
    40: {
      mode: "pathfinding-boss",
      start: { x: 1, y: 7 },
      startDir: "E",
      grid: [
        "_______________",
        "___gggggg______",
        "__gg#gggggg____",
        "_gggBssssBgg___",
        "_g#gs_gggs_gg__",
        "_gggs_gggs_gg__",
        "_gggs_gggsssR__",
        "_SssBggggggg___",
        "_______________"
      ],
      solution: ["repeat3", "collect", "left", "repeat4", "collect", "right", "repeat5", "right", "repeat3", "left", "repeat3", "upload"],
      allowed: ["move", "left", "right", "repeat2", "repeat3", "repeat4", "repeat5", "collect", "upload"],
      required: 2,
      energy: 26,
      limit: 15
    },
    48: {
      mode: "graduation-studio",
      start: { x: 1, y: 8 },
      startDir: "E",
      grid: [
        "________________",
        "____gggggg______",
        "___gg#gggggg____",
        "__ggsggggggs____",
        "_gggs_ggggggsgR_",
        "_gggsHgsBgggs_g_",
        "_g#gs_ggs_ggsgg_",
        "_gggHgggssssBgg_",
        "_SssBgggggggg___",
        "________________"
      ],
      solution: ["repeat3", "collect", "left", "ifHazardShield", "repeat3", "right", "ifHazardShield", "repeat4", "collect", "right", "repeat2", "left", "repeat4", "collect", "left", "repeat3", "right", "repeat2", "upload"],
      allowed: ["move", "left", "right", "repeat2", "repeat3", "repeat4", "repeat5", "collect", "upload", "shield", "ifHazardShield"],
      required: 3,
      energy: 32,
      minEnergy: 6,
      limit: 23
    }
  };

  const extendedLessonSpecs = {
    33: { mode: "search-scanner", toolTitle: "线性搜索扫描器", kind: "search", options: ["寻找最近信标", "寻找安全信标", "寻找指定坐标"], evidence: ["按顺序检查候选目标", "条件不匹配就继续", "列表结束后处理找不到"] },
    34: { mode: "priority-sorter", toolTitle: "目标优先级排序器", kind: "sort", options: ["距离优先", "收益优先", "风险优先"], evidence: ["先确定比较字段", "排序规则前后一致", "不同规则会产生不同路线"] },
    35: { mode: "visited-map", toolTitle: "visited 标记图", kind: "visited", options: ["显示已访问", "显示未访问", "显示死路"], evidence: ["走过的格子加入 visited", "重复格子不再探索", "记录使搜索能够结束"] },
    36: { mode: "maze-creator", toolTitle: "迷宫可解性检查器", kind: "designer", options: ["基础迷宫", "双死路", "风险死路"], evidence: ["迷宫至少有一条解", "死路用于训练回退", "参考路线能够通过"] },
    37: { mode: "dfs-stack", toolTitle: "DFS 调用栈", kind: "stack", options: ["深入", "遇到死路", "回溯"], evidence: ["沿一条分支走到底", "调用栈保存返回位置", "回退后继续其他分支"] },
    38: { mode: "bfs-layers", toolTitle: "BFS 层级队列", kind: "queue", options: ["第 0 层", "第 1 层", "第 2 层", "第 3 层"], evidence: ["队列保证先进先出", "同一层距离相同", "第一次到达目标得到最少步数"] },
    39: { mode: "path-cost", toolTitle: "路线代价比较器", kind: "cost", options: ["最少步数", "最低能量", "最低风险"], evidence: ["最短不一定代价最低", "危险格改变路线价值", "评价前必须说明指标"] },
    40: { mode: "pathfinding-boss", toolTitle: "自动寻路证据档案", kind: "checklist", evidence: ["地图已经转化为可搜索状态", "visited 记录完整", "队列或调用栈可解释", "前驱能够还原路径", "最终路线通过运行验证"] },
    41: { mode: "target-order", toolTitle: "多目标顺序规划器", kind: "planner", options: ["A → B → C", "B → A → C", "C → B → A"], evidence: ["当前点影响下一目标代价", "已采集集合属于状态", "目标顺序本身就是算法选择"] },
    42: { mode: "greedy-strategy", toolTitle: "贪心策略实验台", kind: "strategy", options: ["最近优先", "收益优先", "风险最低优先"], evidence: ["每一步只看当前候选", "局部最优不保证全局最优", "策略需要多张地图测试"] },
    43: { mode: "counterexample-lab", toolTitle: "贪心反例实验室", kind: "counterexample", options: ["近处低收益", "远处高收益", "危险捷径"], evidence: ["反例必须满足算法规则", "比较贪心结果与全局结果", "失败说明算法适用边界"] },
    44: { mode: "strategy-creator", toolTitle: "策略挑战编辑器", kind: "designer", options: ["步数评分图", "能量评分图", "风险评分图"], evidence: ["不同策略应产生不同表现", "评分规则必须清楚", "挑战关需要参考测试"] },
    45: { mode: "enumeration-pruner", toolTitle: "枚举与剪枝表", kind: "enumeration", options: ["保留全部方案", "剪掉超能量方案", "剪掉重复状态"], evidence: ["先确认方案空间完整", "剪枝不能漏掉正确答案", "明显无效方案应提前排除"] },
    46: { mode: "dp-cache", toolTitle: "状态缓存观察器", kind: "cache", options: ["position", "collected", "energy"], evidence: ["状态需要足够描述子问题", "相同状态直接读取缓存", "缓存减少重复计算"] },
    47: { mode: "test-matrix", toolTitle: "策略测试矩阵", kind: "test", options: ["短直线", "危险捷径", "多目标地图", "无解地图"], evidence: ["不能只用一张图证明策略", "同时记录成功率、步数和能量", "失败用例同样是证据"] },
    48: { mode: "graduation-studio", toolTitle: "原创关卡发布台", kind: "release", options: ["规则", "地图", "参考解", "测试", "讲解"], evidence: ["规则清楚", "地图可解", "参考程序通过", "测试覆盖不同情况", "展示能够解释设计选择"] }
  };

  function turn(dir, offset) {
    const index = directions.indexOf(dir);
    return directions[(index + offset + directions.length) % directions.length];
  }

  function expandCommands(commands, routeProgram = []) {
    const output = [];
    const push = (command) => {
      const repeat = String(command).match(/^repeat(\d+)$/);
      if (repeat) {
        for (let index = 0; index < Number(repeat[1]); index += 1) output.push("move");
        return;
      }
      if (command === "callRoute") {
        routeProgram.forEach(push);
        return;
      }
      output.push(command);
    };
    commands.forEach(push);
    return output;
  }

  function simulatePlan(plan, solution = plan.solution, routeProgram = plan.solutionFn) {
    let x = plan.start.x;
    let y = plan.start.y;
    let dir = plan.startDir;
    const path = [{ x, y }];
    const beacons = [];
    let relay = null;
    let shieldNext = false;
    const hazards = [];

    expandCommands(solution, routeProgram).forEach((command) => {
      if (command === "left") dir = turn(dir, -1);
      if (command === "right") dir = turn(dir, 1);
      if (command === "shield" || command === "ifHazardShield") shieldNext = true;
      if (command === "wait") return;
      if (command === "move" || command === "back") {
        const vector = vectors[dir];
        x += command === "move" ? vector.x : -vector.x;
        y += command === "move" ? vector.y : -vector.y;
        path.push({ x, y });
        if (shieldNext) {
          hazards.push({ x, y });
          shieldNext = false;
        }
      }
      if (command === "collect") beacons.push({ x, y });
      if (command === "upload") relay = { x, y };
    });

    return { path, beacons, relay, hazards };
  }

  function missionSolutionFor(row, plan) {
    if (row.no >= 15) return plan.solution.slice();

    const lastCollect = plan.solution.lastIndexOf("collect");
    if (lastCollect >= 0) return plan.solution.slice(0, lastCollect + 1);
    return plan.solution.filter((command) => command !== "upload");
  }

  function key(x, y) {
    return `${x},${y}`;
  }

  function addDecor(grid, protectedKeys, row, plan, sim) {
    const width = plan.width;
    const height = plan.height;
    const stage = stageForLesson(row.no);
    const seed = row.no * 17 + stage.number * 31;

    sim.hazards.forEach((point) => {
      const pointKey = key(point.x, point.y);
      const current = grid[point.y]?.[point.x];
      if (current && !["S", "B", "R"].includes(current)) grid[point.y][point.x] = "H";
      protectedKeys.add(pointKey);
    });

    const tries = [
      { x: 1 + seed % Math.max(1, width - 2), y: 1 + (seed * 3) % Math.max(1, height - 2), tile: "#" },
      { x: 1 + (seed * 5) % Math.max(1, width - 2), y: 1 + (seed * 7) % Math.max(1, height - 2), tile: "#" },
      { x: 1 + (seed * 11) % Math.max(1, width - 2), y: 1 + (seed * 13) % Math.max(1, height - 2), tile: row.no % 3 === 0 ? "H" : "#" },
      { x: 1 + (seed * 17) % Math.max(1, width - 2), y: 1 + (seed * 19) % Math.max(1, height - 2), tile: row.no % 4 === 0 ? "~" : "#" }
    ];

    tries.forEach((item) => {
      const itemKey = key(item.x, item.y);
      if (protectedKeys.has(itemKey)) return;
      if (item.x <= 0 || item.y <= 0 || item.x >= width - 1 || item.y >= height - 1) return;
      grid[item.y][item.x] = item.tile;
      protectedKeys.add(itemKey);
    });
  }

  function buildGrid(row, plan, sim) {
    const grid = Array.from({ length: plan.height }, () => Array(plan.width).fill("g"));
    const protectedKeys = new Set();

    for (let y = 0; y < plan.height; y += 1) {
      for (let x = 0; x < plan.width; x += 1) {
        if (x === 0 || y === 0 || x === plan.width - 1 || y === plan.height - 1) grid[y][x] = "_";
      }
    }

    sim.path.forEach((point) => {
      const pointKey = key(point.x, point.y);
      protectedKeys.add(pointKey);
      if (grid[point.y]?.[point.x] !== undefined) grid[point.y][point.x] = row.no % 2 === 0 ? "s" : "g";
    });

    grid[plan.start.y][plan.start.x] = "S";
    protectedKeys.add(key(plan.start.x, plan.start.y));

    sim.beacons.forEach((point) => {
      grid[point.y][point.x] = "B";
      protectedKeys.add(key(point.x, point.y));
    });

    if (sim.relay) {
      grid[sim.relay.y][sim.relay.x] = "R";
      protectedKeys.add(key(sim.relay.x, sim.relay.y));
    }

    if (row.no === 3) {
      [[1, 3], [2, 3], [3, 3]].forEach(([x, y]) => {
        if (grid[y]?.[x] === undefined) return;
        grid[y][x] = "g";
        protectedKeys.add(key(x, y));
      });
    }

    addDecor(grid, protectedKeys, row, plan, sim);

    return grid.map((line) => line.join(""));
  }

  function stageForLesson(no) {
    return stages[Math.floor((no - 1) / 8)];
  }

  function conceptFromKnowledge(text) {
    return text.split("、").slice(0, 3).join(" · ");
  }

  function planForLesson(row) {
    return routePlans[(row.no - 1) % routePlans.length];
  }

  function toStudentVoice(text) {
    return String(text)
      .replaceAll("学生会知道：", "你会明白：")
      .replaceAll("让学生", "请你")
      .replaceAll("要求他们", "请你")
      .replaceAll("让他们", "请你")
      .replaceAll("学生", "你");
  }

  function extendedBriefFor(row, spec) {
    if (!spec) return undefined;
    const mistakes = row.mistakes || [];
    return {
      challenge: `${toStudentVoice(row.task)}。`,
      intro: toStudentVoice(row.explanation),
      bullets: [
        `本课核心：${row.knowledgeText.replaceAll("、", "、")}。`,
        `学习证据：完成“${row.output}”，用过程记录证明结果不是猜出来的。`,
        `特别留意：${mistakes.slice(0, 2).join("；") || "每一步都要能够解释"}。`
      ],
      goal: toStudentVoice(row.interaction)
    };
  }

  function buildMission(values, index) {
    const row = {
      no: index + 1,
      type: values[0],
      title: values[1],
      knowledgeText: values[2],
      task: values[3],
      output: values[4],
      planId: values[5],
      explanation: values[6],
      interaction: values[7],
      learned: values[8],
      mistakes: values[9]
    };
    const stage = stageForLesson(row.no);
    const plan = routePlans.find((item) => item.id === row.planId) || planForLesson(row);
    const isSequenceLaunch = row.no === 1;
    const isDirectionCompass = row.no === 2;
    const isRouteComparison = row.no === 3;
    const isDebugDetective = row.no === 4;
    const isCoordinateScanner = row.no === 5;
    const isSegmentMission = row.no === 6;
    const isRouteCreator = row.no === 7;
    const isCoreCapstone = row.no === 8;
    const advancedSpec = advancedLessonSpecs[row.no];
    const extendedSpec = extendedLessonSpecs[row.no];
    const routeChoices = isRouteComparison
      ? [
          {
            id: "direct",
            label: "路线 A · 直达",
            summary: "向东前进 2 格，在信标格采集。",
            commands: ["move", "move", "collect"],
            moves: 3,
            turns: 0,
            risk: "低"
          },
          {
            id: "detour",
            label: "路线 B · 绕行",
            summary: "向南 1 格，向东 2 格，再向北 1 格到达信标。",
            commands: ["right", "move", "left", "move", "move", "left", "move", "collect"],
            moves: 8,
            turns: 3,
            risk: "较高"
          }
        ]
      : undefined;
    const creatorTemplateGrid = isRouteCreator
      ? [
          "_________",
          "_Sgg#ggg_",
          "_ggg#ggg_",
          "_ggggggg_",
          "_g###ggg_",
          "_ggggggg_",
          "_________"
        ]
      : undefined;
    const creatorTargets = isRouteCreator
      ? [
          {
            id: "near",
            label: "近距信标",
            x: 3,
            y: 1,
            solution: ["move", "move", "collect"]
          },
          {
            id: "turn",
            label: "转弯信标",
            x: 5,
            y: 2,
            solution: ["right", "move", "move", "left", "move", "move", "move", "move", "left", "move", "collect"]
          },
          {
            id: "far",
            label: "远距信标",
            x: 6,
            y: 5,
            solution: ["right", "move", "move", "move", "move", "left", "move", "move", "move", "move", "move", "collect"]
          }
        ]
      : undefined;
    const customGrid = isCoordinateScanner
      ? [
          "____________",
          "___gggg_____",
          "__gg#gggg___",
          "_ggg#ggggg__",
          "_ggggBgggg__",
          "_g#ggg#ggg__",
          "_SgBgggg____",
          "____________"
        ]
      : isSegmentMission
        ? [
            "_____________",
            "__gggg_______",
            "_ggggggg_____",
            "_SgBgBggg____",
            "_gg##sggg____",
            "_ggggsssRgg__",
            "_____________"
          ]
        : isCoreCapstone
          ? [
              "_____________",
              "___gggg______",
              "__ggg_ggg____",
              "_gg#s_gggg___",
              "_gggsssBggg__",
              "__g#s_gs_gg__",
              "_gggs_gsssR__",
              "_SssBggggg___",
              "_____________"
            ]
          : undefined;
    const missionSolution = advancedSpec?.solution
      ? advancedSpec.solution.slice()
      : isRouteComparison
        ? routeChoices[0].commands.slice()
        : isSegmentMission || isCoreCapstone
          ? plan.solution.slice()
          : isRouteCreator ? creatorTargets[0].solution.slice() : missionSolutionFor(row, plan);
    const starterProgram = isDebugDetective
      ? ["right", "move", "move", "right", "move", "collect"]
      : undefined;
    const simulationPlan = advancedSpec
      ? {
          ...plan,
          start: advancedSpec.start || plan.start,
          startDir: advancedSpec.startDir || plan.startDir,
          solutionFn: advancedSpec.solutionFn || plan.solutionFn
        }
      : plan;
    const sim = simulatePlan(simulationPlan, missionSolution, advancedSpec?.solutionFn || plan.solutionFn);
    const hasUpload = missionSolution.includes("upload");
    const baseAllowed = allowedByStage[stage.number] || allowedByStage[1];
    const filteredAllowed = baseAllowed
      .filter((command) => command !== "upload" || hasUpload)
      .filter((command) => command !== "callRoute" || plan.functionEnabled)
      .filter((command) => command !== "back" || row.no === 3 || row.no >= 25)
      .filter((command) => command !== "wait" || row.no === 3 || row.no >= 30)
      .filter((command) => command !== "shield" || row.knowledgeText.includes("危险") || row.knowledgeText.includes("能量") || row.no >= 39)
      .filter((command) => command !== "ifHazardShield" || row.knowledgeText.includes("危险") || row.knowledgeText.includes("条件") || row.no >= 39);
    const referenceCommands = [...missionSolution, ...(plan.solutionFn || [])];
    const allowed = [...new Set([...filteredAllowed, ...referenceCommands])]
      .filter((command) => command !== "upload" || hasUpload)
      .filter((command) => command !== "callRoute" || plan.functionEnabled);

    return {
      id: `course-${String(row.no).padStart(2, "0")}`,
      stage: stage.id,
      stageNumber: stage.number,
      stageTitle: stage.title,
      chapterLabel: stage.chapter,
      lessonNo: row.no,
      lessonType: typeClass[row.type] || "learning",
      typeLabel: row.type,
      title: row.title,
      concept: conceptFromKnowledge(row.knowledgeText),
      lesson: `第 ${String(row.no).padStart(2, "0")} 节`,
      story: `这一关，你会学习“${row.title}”：${toStudentVoice(row.explanation)}`,
      target: toStudentVoice(row.task),
      focus: row.knowledgeText,
      checkpoint: toStudentVoice(row.learned),
      artifact: row.output,
      knowledge: row.knowledgeText.split("、"),
      objective: toStudentVoice(row.task),
      deepExplanation: toStudentVoice(row.explanation),
      classroomInteraction: toStudentVoice(row.interaction),
      learned: toStudentVoice(row.learned),
      devNote: `地图 ${plan.id} 为本课专用变式；${row.output} 是本课学习证据。`,
      commonMistakes: row.mistakes,
      studentOutput: row.output,
      grid: advancedSpec?.grid || (isRouteCreator
        ? creatorTemplateGrid.map((line, y) => [...line].map((tile, x) => x === creatorTargets[0].x && y === creatorTargets[0].y ? "B" : tile).join(""))
        : customGrid || buildGrid(row, plan, sim)),
      startDir: advancedSpec?.startDir || plan.startDir,
      energy: advancedSpec?.energy ?? Math.max(12, plan.solution.length + stage.number * 3 + sim.beacons.length * 2),
      required: advancedSpec?.required ?? sim.beacons.length,
      minEnergy: advancedSpec?.minEnergy,
      limit: advancedSpec?.limit ?? (isRouteComparison
        ? Math.max(...routeChoices.map((choice) => choice.commands.length))
        : isCoordinateScanner ? missionSolution.length
        : isSegmentMission ? missionSolution.length + 2
        : isRouteCreator ? creatorTargets[0].solution.length
        : isCoreCapstone ? missionSolution.length + 3
        : isSequenceLaunch || isDirectionCompass
        ? missionSolution.length
        : isDebugDetective ? starterProgram.length : Math.max(plan.solution.length + 2, 8)),
      allowed: advancedSpec?.allowed || (isSequenceLaunch
        ? ["move", "collect"]
        : isDirectionCompass || isRouteComparison || isDebugDetective
          ? ["move", "left", "right", "collect"]
          : isCoordinateScanner || isRouteCreator
            ? ["move", "left", "right", "collect"]
            : isSegmentMission || isCoreCapstone
              ? ["move", "left", "right", "collect", "upload"]
          : allowed),
      solution: missionSolution,
      lessonMode: advancedSpec?.mode || extendedSpec?.mode || (isSequenceLaunch
        ? "sequence-timeline"
        : isDirectionCompass
          ? "direction-compass"
          : isRouteComparison ? "route-comparison"
            : isDebugDetective ? "debug-detective"
              : isCoordinateScanner ? "coordinate-scanner"
                : isSegmentMission ? "segment-mission"
                  : isRouteCreator ? "route-creator"
                    : isCoreCapstone ? "core-capstone" : "standard"),
      starterProgram,
      routeChoices,
      creatorTemplateGrid,
      creatorTargets,
      coordinateTargets: isCoordinateScanner
        ? sim.beacons.map((point, targetIndex) => ({
            id: `beacon-${targetIndex + 1}`,
            label: `信标 ${String.fromCharCode(65 + targetIndex)}`,
            x: point.x,
            y: point.y
          }))
        : undefined,
      solutionFn: advancedSpec?.solutionFn
        ? advancedSpec.solutionFn.slice()
        : plan.solutionFn ? plan.solutionFn.slice() : undefined,
      functionEnabled: Boolean(advancedSpec?.functionEnabled ?? plan.functionEnabled),
      pythonStudio: advancedSpec?.pythonStudio,
      playgroundBrief: advancedSpec?.brief || extendedBriefFor(row, extendedSpec),
      advancedConfig: advancedSpec?.advancedConfig || extendedSpec,
      creationPrompt: row.type.includes("创作") || row.type.includes("作品")
        ? `${row.output}：写清地图规则、限制条件、参考解法、一次失败和修改说明。`
        : ""
    };
  }

  window.SignalRunnerCourseData = {
    version: "v1.5-dev",
    title: "CodeQuestPlanet",
    stages,
    missions: lessonRows.map(buildMission)
  };
})();
