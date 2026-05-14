const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const dom = {
  lessonEyebrow: document.querySelector("#lessonEyebrow"),
  lessonHeading: document.querySelector("#lessonHeading"),
  lessonIntro: document.querySelector("#lessonIntro"),
  routeTitle: document.querySelector("#routeTitle"),
  runStatus: document.querySelector("#runStatus"),
  gameHint: document.querySelector("#gameHint"),
  applyRuleBtn: document.querySelector("#applyRuleBtn"),
  runBtn: document.querySelector("#runBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  missionTitle: document.querySelector("#missionTitle"),
  missionCopy: document.querySelector("#missionCopy"),
  progressList: document.querySelector("#progressList"),
  statLabel1: document.querySelector("#statLabel1"),
  statLabel2: document.querySelector("#statLabel2"),
  statLabel3: document.querySelector("#statLabel3"),
  statX: document.querySelector("#statX"),
  statY: document.querySelector("#statY"),
  statSpeed: document.querySelector("#statSpeed"),
  codeView: document.querySelector("#codeView"),
  chatWindow: document.querySelector("#chatWindow"),
  eventSlot: document.querySelector("#eventSlot"),
  conditionSlot: document.querySelector("#conditionSlot"),
  actionSlot: document.querySelector("#actionSlot"),
  studentActivity: document.querySelector("#studentActivity"),
  guideTitle: document.querySelector("#guideTitle"),
  guideBadge: document.querySelector("#guideBadge"),
  guideGoal: document.querySelector("#guideGoal"),
  guideObserve: document.querySelector("#guideObserve"),
  guideExperiment: document.querySelector("#guideExperiment"),
  guideCheckpoint: document.querySelector("#guideCheckpoint")
};

const curriculum = window.GameMakerCurriculum || null;

const routes = {
  shooter: {
    title: "星际射击路线",
    noun: "飞船",
    itemName: "能量晶核",
    targetText: {
      1: "穿过能量门",
      2: "收集 3 个能量晶核",
      3: "修复子弹命中结果",
      4: "启动敌机生成器",
      5: "释放 3 次强化射击",
      6: "完成一关射击挑战"
    }
  },
  platform: {
    title: "平台跳跃路线",
    noun: "角色",
    itemName: "金币",
    targetText: {
      1: "到达终点旗帜",
      2: "收集 3 枚金币",
      3: "修复怪物碰撞结果",
      4: "启动金币刷新器",
      5: "释放 3 次冲刺技能",
      6: "完成一关平台挑战"
    }
  }
};

const lessons = {
  1: {
    eyebrow: "AI 伴学式游戏编程平台 · 第 1 关",
    heading: "控制诊断场",
    intro: "这一关不是让你点一下按钮，而是像小工程师一样诊断：按键有没有被听见？坐标为什么没变？左右、上下和速度分别由哪条规则负责？",
    missionTitle: "独立搞懂“输入 -> 坐标 -> 移动”",
    missionCopy: "你要学会把游戏控制拆成 3 件事：事件被触发、方向被判断、坐标按速度变化。过关标准是能解释这条因果链。",
    button: "先连接左右移动",
    activeButton: "控制规则已完整连接",
    statusIdle: "等待诊断",
    statusLive: "分步调试中",
    statusWin: "校准完成",
    statLabels: ["X 坐标", "Y 坐标", "规则进度"],
    steps: ["按两个方向键，确认事件被听见", "只连接左右移动，观察 x 坐标", "再连接上下/跳跃和速度", "到达目标并复盘事件链"],
    slots: ["按下方向键 / WASD", "判断方向：左/右/上/下", "按速度改变 x/y 坐标"],
    hintLocked: {
      shooter: "先别急着修。按两个不同方向键：飞船不动，但系统会记录你按了什么，这就是“事件”。",
      platform: "先别急着修。按 A/D/方向键：角色不动，但系统会记录你按了什么，这就是“事件”。"
    },
    hintLive: {
      shooter: "控制规则已完整连接。现在用 x/y 坐标和速度，把飞船送进右侧能量门。",
      platform: "控制规则已完整连接。现在用左右移动和跳跃，到达终点旗帜。"
    },
    code: {
      rule: `当 玩家按下方向键
先 判断按键方向
再 选择要改变 x 还是 y
最后 按 speed 改变坐标

评价出口：
我知道按键只是事件，不等于移动。
我知道 x/y 坐标变化才会让角色移动。
我能解释 speed 为什么会影响手感。`,
      pseudo: `当按键被按下:
    如果 player.locked 是 false:
        direction = 读取按键方向
        player.x = player.x + direction.x * speed
        player.y = player.y + direction.y * speed`,
      python: `speed = 6

if key_pressed("left"):
    player.x -= speed
if key_pressed("right"):
    player.x += speed
if key_pressed("up"):
    player.y -= speed
if key_pressed("down"):
    player.y += speed`
    }
  },
  2: {
    eyebrow: "AI 伴学式游戏编程平台 · 第 2 关",
    heading: "分数侦探局",
    intro: "这一关把计分拆开学：先发现“碰到了但没记录”，再让 score 变量变化，最后把变量同步到屏幕 UI。",
    missionTitle: "搞懂“变量”和“屏幕显示”不是一回事",
    missionCopy: "score 是游戏记忆，屏幕分数只是把这个记忆显示出来。你要分步修复：碰撞触发、变量增加、UI 刷新、防止重复计分。",
    button: "先记录 score 变量",
    activeButton: "计分规则已完整连接",
    statusIdle: "分数未连接",
    statusLive: "计分调试中",
    statusWin: "阶段成果完成",
    statLabels: ["变量 score", "屏幕分数", "已收集"],
    steps: ["先收集一次，确认没有计分", "连接 score 变量，观察变量变化", "同步屏幕 UI 并防止重复计分", "收集全部目标并复盘变量链"],
    slots: ["玩家碰到收集物", "物品未收集，且本次只加一次", "score 增加，再刷新屏幕分数"],
    hintLocked: {
      shooter: "先碰一个能量晶核：你会发现“碰到”和“计分”不是同一件事。",
      platform: "先吃一枚金币：你会发现“碰到”和“计分”不是同一件事。"
    },
    hintLive: {
      shooter: "计分链路已完整连接。继续收集能量晶核，让变量 score 和屏幕分数一起达到 30。",
      platform: "计分链路已完整连接。继续收集金币，让变量 score 和屏幕分数一起达到 3。"
    },
    code: {
      rule: `当 玩家碰到 收集物
如果 收集物还没有被收集
就 score 增加
然后 刷新屏幕分数
并且 隐藏这个收集物

评价出口：
我知道 score 是变量。
我知道 UI 显示需要从变量同步。`,
      pseudo: `当玩家碰到收集物:
    如果 item.collected 是 false:
        score = score + item.value
        score_text = score
        item.collected = true
        隐藏 item`,
      python: `if player.collides_with(item):
    if item.collected == False:
        score += item.value
        score_text.update(score)
        item.collected = True
        item.hide()`
    }
  },
  3: {
    eyebrow: "AI 伴学式游戏编程平台 · 第 3 关",
    heading: "碰撞开关",
    intro: "对象已经碰到了，但游戏没有结果。你要修复“如果发生碰撞，就改变状态”的规则。",
    missionTitle: "让碰撞产生结果",
    missionCopy: "你要理解条件和碰撞：如果两个对象碰到，就触发加分、扣血、消失等结果。",
    button: "修复碰撞规则",
    activeButton: "碰撞规则已启用",
    statusIdle: "碰撞无结果",
    statusLive: "碰撞检测中",
    statusWin: "互动系统完成",
    statLabels: ["Score / HP", "目标", "碰撞次数"],
    steps: ["触发一次碰撞", "观察为什么没有结果", "启用如果碰到就执行", "完成碰撞任务并复盘条件"],
    slots: ["对象发生碰撞", "目标还处于有效状态", "加分 / 扣血 / 隐藏对象"],
    hintLocked: {
      shooter: "按空格或“发射”打中训练靶，你会看到命中了，但分数不变、目标不消失。",
      platform: "移动角色碰到红色怪物，你会看到碰到了，但 HP 不会变化。"
    },
    hintLive: {
      shooter: "碰撞规则已连接。发射子弹消灭训练靶，让 score 达到 20。",
      platform: "碰撞规则已连接。碰到怪物会扣 HP，踩到绿色宝石会加分。"
    },
    code: {
      rule: `当 子弹/玩家 碰到 目标
如果 目标还有效
就 改变目标状态
并且 更新 score 或 hp`,
      pseudo: `当发生碰撞:
    如果 target.active 是 true:
        target.active = false
        score = score + target.value`,
      python: `if bullet.collides_with(enemy):
    if enemy.active:
        enemy.active = False
        score += 20`
    }
  },
  4: {
    eyebrow: "AI 伴学式游戏编程平台 · 第 4 关",
    heading: "自动生成器",
    intro: "游戏世界不应该只响应玩家，系统也会持续运行。启动定时器，让敌人或金币自动出现。",
    missionTitle: "让系统自己运行",
    missionCopy: "你要理解循环和定时器：每隔一段时间，系统会自动执行一次生成规则。",
    button: "启动生成规则",
    activeButton: "生成规则已启用",
    statusIdle: "生成器未启动",
    statusLive: "自动生成中",
    statusWin: "生成系统完成",
    statLabels: ["生成数", "目标", "倒计时"],
    steps: ["等待 3 秒观察现象", "猜测为什么没有新对象", "启用循环/定时生成", "生成 5 个对象并复盘循环"],
    slots: ["每隔 1.5 秒", "场景中数量未达上限", "随机位置生成对象"],
    hintLocked: {
      shooter: "先等几秒：敌机不会自己出现，因为生成器还没启动。",
      platform: "先等几秒：金币不会刷新，因为定时生成规则还没启动。"
    },
    hintLive: {
      shooter: "生成器已启动。观察敌机不断出现，这就是循环和定时器。",
      platform: "生成器已启动。观察金币在不同平台附近刷新。"
    },
    code: {
      rule: `当 每隔一段时间
如果 场景中对象数量未达上限
就 在随机位置生成一个对象`,
      pseudo: `每 1.5 秒重复:
    如果 objects.count < max_count:
        position = random_position()
        spawn(object, position)`,
      python: `if timer.every(1.5):
    if len(objects) < max_count:
        spawn_object(random_position())`
    }
  },
  5: {
    eyebrow: "AI 伴学式游戏编程平台 · 第 5 关",
    heading: "技能胶囊",
    intro: "重复动作可以打包成一个技能。修复技能胶囊，让一组动作能被按键触发，并受到冷却限制。",
    missionTitle: "把一组动作打包成技能",
    missionCopy: "你要理解函数和参数：技能是一组被打包的动作，速度、伤害、冷却时间都是参数。",
    button: "激活技能函数",
    activeButton: "技能函数已启用",
    statusIdle: "技能未连接",
    statusLive: "技能可释放",
    statusWin: "技能系统完成",
    statLabels: ["技能次数", "冷却", "能量"],
    steps: ["尝试按 E 使用技能", "观察技能为什么没反应", "启用函数/参数/冷却", "释放 3 次技能并复盘函数"],
    slots: ["玩家按下 E / 技能键", "技能冷却已结束", "执行强化射击或冲刺函数"],
    hintLocked: {
      shooter: "按 E 或“技能”：现在不会释放强化射击，因为技能函数还没连接。",
      platform: "按 E 或“技能”：现在不会冲刺，因为技能函数还没连接。"
    },
    hintLive: {
      shooter: "技能已启用。按 E 发射强化弹，等待冷却后再释放。",
      platform: "技能已启用。按 E 冲刺，观察冷却和能量变化。"
    },
    code: {
      rule: `当 玩家按下技能键
如果 技能冷却结束
就 调用 skill()
并且 重置冷却时间`,
      pseudo: `函数 use_skill(power, cooldown):
    如果 cooldown <= 0:
        执行技能动作
        cooldown = cooldown_time`,
      python: `def use_skill(power, cooldown_time):
    global cooldown
    if cooldown <= 0:
        cast_skill(power)
        cooldown = cooldown_time`
    }
  },
  6: {
    eyebrow: "AI 伴学式游戏编程平台 · 第 6 关",
    heading: "我的第一款小游戏",
    intro: "把前 5 课的规则组合起来：移动、分数、碰撞、自动生成和技能。完成一关可展示的小游戏。",
    missionTitle: "完成毕业小作品",
    missionCopy: "你要综合运用前面学过的规则，并能向家长解释最重要的 3 条规则。",
    button: "启动综合规则",
    activeButton: "综合规则已启用",
    statusIdle: "作品待启动",
    statusLive: "毕业项目运行中",
    statusWin: "作品可展示",
    statLabels: ["Score", "目标", "HP"],
    steps: ["启动综合关卡", "收集/击中目标得分", "使用技能处理危险", "达成目标并完成展示复盘"],
    slots: ["游戏开始运行", "移动/碰撞/生成/技能都可用", "完成胜利条件并生成展示证据"],
    hintLocked: {
      shooter: "这是毕业综合关。先点击启动综合规则，再用移动、射击、技能完成挑战。",
      platform: "这是毕业综合关。先点击启动综合规则，再用移动、收集、躲避和冲刺完成挑战。"
    },
    hintLive: {
      shooter: "综合规则已启动。得分达到 60 并保持 HP 大于 0，即可展示作品。",
      platform: "综合规则已启动。收集金币、躲避怪物，得分达到 6 即可展示作品。"
    },
    code: {
      rule: `当 游戏运行中
如果 玩家完成目标并且 hp > 0
就 标记作品完成
并生成展示复盘`,
      pseudo: `游戏循环:
    处理输入
    处理碰撞
    定时生成对象
    处理技能
    如果 score >= target and hp > 0:
        publish_project()`,
      python: `while game.running:
    handle_input()
    handle_collisions()
    spawn_objects()
    handle_skill()
    if score >= target and hp > 0:
        publish_project()`
    }
  }
};

const selfGuides = {
  1: {
    title: "这一关不是学“按键”，是学事件链",
    badge: "Event Lab",
    goal: "能说清楚：按键事件被触发后，程序判断方向，再改变 x/y 坐标，所以角色才移动。",
    observe: "先按两个不同方向键。注意：你按键了，但角色没动；这说明“事件发生”和“动作执行”中间还差一条规则。",
    experiment: "不要一口气全修。先只连接左右移动，看 x 坐标；再连接上下/跳跃，看 y 坐标；最后比较速度变化。",
    checkpoint: "出口自测：不用看代码，能解释“为什么 x 变大角色向右，为什么 speed 变大手感更快”。"
  },
  2: {
    title: "这一关不是学“加分”，是学变量链",
    badge: "Score Lab",
    goal: "能区分两件事：score 变量负责记住分数，屏幕 UI 负责把 score 显示给玩家。",
    observe: "先收集一次物品。注意：碰撞发生了，但 score 没变；这说明“碰到物品”和“更新变量”不是自动等价的。",
    experiment: "先只连接 score 变量，观察变量 score 和屏幕分数是否一致；再刷新 UI，让两者同步。",
    checkpoint: "出口自测：能解释为什么要判断“未收集”，否则同一个金币可能被重复加分。"
  },
  default: {
    title: "自学路线：先观察，再修复，最后复盘",
    badge: "Self Learn",
    goal: "知道这一关对应的核心编程概念，并能在游戏现象里找到它。",
    observe: "先试玩坏掉的状态，确认到底是哪条规则没有工作。",
    experiment: "启用规则后立刻回到游戏里测试，用数据或现象验证自己的判断。",
    checkpoint: "出口自测：能用自己的话解释“我修了什么、为什么这样修、结果怎么变了”。"
  }
};

function courseConceptList(course) {
  return String(course.concepts || "")
    .split("·")
    .map((item) => item.trim())
    .filter(Boolean);
}

function courseModule(course) {
  if (!course) {
    return "M1";
  }

  if (course.stage === "L0") {
    return course.stageIndex <= 4 ? "M1" : course.stageIndex <= 8 ? "M2" : "M3";
  }

  if (course.stage === "L1") {
    if (course.stageIndex <= 4) {
      return "M1";
    }
    if (course.stageIndex <= 8) {
      return "M2";
    }
    if (course.stageIndex <= 12) {
      return "M3";
    }
    return "M4";
  }

  if (course.stageIndex <= 6) {
    return "M1";
  }
  if (course.stageIndex <= 12) {
    return "M2";
  }
  if (course.stageIndex <= 18) {
    return "M3";
  }
  return "M4";
}

const fullCourseTemplates = {
  "L1-01": {
    badge: "Rule Lab",
    button: "建立对象目标规则卡",
    activeButton: "规则拆解模板已建立",
    statusIdle: "等待试玩观察",
    statusLive: "拆解与验证中",
    statusWin: "规则拆解完成",
    statLabels: ["规则选择", "试玩证据", "学习单"],
    statValues: ["45-60", "拆解卡", "3 对象 + 1 目标"],
    intro: "这一课不是讲“游戏有什么元素”，而是让学生从试玩中拆出对象、目标和规则。课堂要完成一张可复用的规则拆解卡，为后续 L1-02、L1-03 进入规则实验台做准备。",
    missionCopy: "按 v0.8 的 L1 课时结构展开：先试玩观察，再拆对象和目标，接着用“当 / 如果 / 就”写出第一版规则，运行验证后改出第二版，并用拆解卡作为出口证据。",
    steps: [
      "5-8 分钟：试玩单屏小游戏，只记录看见的对象、目标和失败现象",
      "8-10 分钟：拆出 3 个对象、1 个玩家目标、1 个通关或失败条件",
      "10-12 分钟：写第一版规则骨架：当什么发生，如果什么成立，就出现什么结果",
      "10 分钟：运行验证，检查规则是否真的解释了画面变化",
      "8-12 分钟：替换一个对象或目标，改写第二版规则",
      "5-8 分钟：完成规则拆解卡，并口头说明对象、目标和规则的关系"
    ],
    slots: [
      "当 玩家操控角色、收集物、障碍或出口被观察到",
      "如果 这 3 个对象里有 1 个负责目标，1 个负责反馈，1 个负责限制",
      "就 写成一张规则拆解卡：对象 -> 目标 -> 当 / 如果 / 就"
    ],
    guide: {
      title: "L1-01 完整课模板：游戏由对象、目标和规则组成",
      badge: "45-60 min",
      goal: "学生能拆解一个单屏小游戏的 3 个对象和 1 个目标，并写出至少 1 条当 / 如果 / 就规则。",
      observe: "第一轮只观察，不急着修规则。要求学生说出“谁在场、我要做什么、什么会阻止我”。",
      experiment: "从一条最小规则开始：当玩家碰到目标，如果目标有效，就完成或得分。验证后再换对象或目标做第二版。",
      checkpoint: "出口证据是规则拆解卡：3 个对象、1 个目标、1 条规则、1 次验证结果。"
    },
    phaseExperiments: {
      discover: "先试玩 1 分钟，写下 3 个对象和 1 个目标，不解释代码。",
      build: "现在把观察结果写成一条“当 / 如果 / 就”规则，优先保证规则能解释画面。",
      verify: "再运行一次，用拆解卡检查：对象是否清楚、目标是否唯一、规则是否能验证。"
    },
    phaseHints: {
      discover: "先观察：这个单屏小游戏里有哪些对象？玩家真正想完成的目标是什么？",
      build: "把观察结果放进规则实验台：当某个对象发生事情，如果目标条件成立，就得到结果。",
      verify: "规则拆解模板已建立。现在用第二个例子验证这张卡是否还能解释游戏。"
    },
    completionMessage: "L1-01 完成：学生已经产出规则拆解卡，并能用对象、目标和规则解释一个单屏小游戏。",
    code: {
      rule: `完整课模板：L1-01 游戏由对象、目标和规则组成

课时长度：45-60 分钟
课时定位：L1 的入口课，只做规则拆解，不提前进入复杂系统或真实代码。

课堂流程：
1. 试玩观察 5-8 分钟
   学生只记录看到的对象、玩家目标和失败现象。
2. 对象目标拆解 8-10 分钟
   每组必须写出 3 个对象：玩家对象、目标对象、限制或反馈对象。
3. 第一版规则 10-12 分钟
   用当 / 如果 / 就写出一条最小规则。
4. 运行验证与 debug 10 分钟
   检查规则是否解释了真实画面，不成立就改对象或条件。
5. 扩展变化 8-12 分钟
   换一个目标或限制对象，写第二版规则。
6. 出口复盘 5-8 分钟
   完成规则拆解卡并向同伴讲清：对象如何支持目标，规则如何产生结果。

学生产出：
- 3 个对象
- 1 个玩家目标
- 1 条当 / 如果 / 就规则
- 1 条验证记录`,
      pseudo: `scene = observe_game()
objects = pick_three(scene.objects)
goal = find_player_goal(scene)

rule = {
    when: "玩家和目标对象发生关系",
    if: "目标条件成立",
    then: "产生得分、通关或反馈"
}

run(rule)
record(objects, goal, result)`,
      python: `objects = ["player", "goal", "obstacle"]
goal = "reach_goal"

def explain_rule(event, condition):
    if event == "player_touch_goal" and condition == "goal_active":
        return "win_or_score"
    return "keep_testing"

evidence = explain_rule("player_touch_goal", "goal_active")`
    }
  },
  "L1-02": {
    badge: "Input Lab",
    button: "搭建输入规则",
    activeButton: "输入移动规则已建立",
    statusIdle: "等待输入观察",
    statusLive: "移动规则验证中",
    statusWin: "可控角色完成",
    statLabels: ["规则选择", "试玩证据", "学习单"],
    statValues: ["45-60", "可控角色", "输入 -> 坐标"],
    intro: "这一课把 L1-01 的规则拆解推进到可操作规则。学生要在规则实验台中观察按键事件、坐标变化和目标区，做出一个能移动到目标区的可控角色。",
    missionCopy: "课堂不是只让角色动一下，而是完整经历输入观察、规则搭建、运行验证、调速度和边界、复盘输入链路，支撑 45-60 分钟的 L1 课时。",
    steps: [
      "5-8 分钟：试玩坏掉的角色，记录按键发生了但角色为什么没到目标区",
      "8-10 分钟：拆对象、目标和规则：玩家、目标区、边界或障碍",
      "10-12 分钟：搭第一版输入规则，让左 / 右或上 / 下改变坐标",
      "10 分钟：运行验证，检查方向、速度和目标区判定是否正确",
      "8-12 分钟：扩展挑战，加入边界限制或速度参数对比",
      "5-8 分钟：保存可控角色，并讲清输入 -> 坐标 -> 到达目标的链路"
    ],
    slots: [
      "当 玩家按下方向键或 WASD",
      "如果 角色还在场景边界内，且目标是到达目标区",
      "就 按 speed 改变 x / y 坐标，并检查是否进入目标区"
    ],
    guide: {
      title: "L1-02 完整课模板：当按键发生",
      badge: "45-60 min",
      goal: "学生能让角色移动到目标区，并解释按键事件、方向判断和坐标变化之间的关系。",
      observe: "先故意试玩未连接规则的状态，让学生发现“按键发生”和“角色移动”不是同一件事。",
      experiment: "第一版只做一个方向轴，验证坐标变化；第二版补另一个方向轴，再调速度或边界。",
      checkpoint: "出口证据是可控角色：能到达目标区，且学生能说清输入 -> 坐标 -> 目标判定。"
    },
    phaseExperiments: {
      discover: "先按两个方向键，观察系统能否听到输入，以及坐标有没有变化。",
      build: "先接一条输入规则：当按下方向键，就改变对应坐标，不急着加复杂障碍。",
      verify: "输入规则已建立。现在测试方向、速度、边界和目标区判定是否都稳定。"
    },
    phaseHints: {
      discover: "先按键观察：事件发生了吗？角色坐标变了吗？目标区在哪里？",
      build: "先让一个方向稳定移动，再补另一个方向。每次只验证一条坐标变化。",
      verify: "输入移动规则已建立。现在调一次速度或边界，确认手感变化来自参数。"
    },
    completionMessage: "L1-02 完成：学生已经做出可控角色，并能解释输入、坐标和目标区的因果链。",
    code: {
      rule: `完整课模板：L1-02 当按键发生

课时长度：45-60 分钟
课时定位：用规则实验台完成第一条可操作规则，让学生知道事件不是结果，坐标变化才产生移动。

课堂流程：
1. 试玩观察 5-8 分钟
   按方向键，记录角色是否移动、坐标是否变化、目标区在哪里。
2. 拆对象目标规则 8-10 分钟
   对象：玩家、目标区、边界或障碍。目标：移动到目标区。
3. 第一版规则 10-12 分钟
   当按下左 / 右键，如果角色未越界，就改变 x 坐标。
4. 运行验证与 debug 10 分钟
   检查方向反了、速度太快、边界穿出、目标区不触发等问题。
5. 扩展挑战 8-12 分钟
   加上上 / 下移动，或比较 speed = 3 和 speed = 8 的手感。
6. 出口复盘 5-8 分钟
   学生口头解释：输入事件被听见，方向被判断，坐标被改变，所以角色移动。

学生产出：
- 一个能进目标区的可控角色
- 一条输入规则
- 一次速度或边界调试记录`,
      pseudo: `when key_pressed:
    direction = read_key()

    if player_inside_bounds:
        player.x += direction.x * speed
        player.y += direction.y * speed

    if player.overlaps(goal_zone):
        complete_goal()`,
      python: `speed = 5

def update_player(keys):
    if "left" in keys:
        player.x -= speed
    if "right" in keys:
        player.x += speed
    if "up" in keys:
        player.y -= speed
    if "down" in keys:
        player.y += speed

    player.x = clamp(player.x, 0, screen.width)
    player.y = clamp(player.y, 0, screen.height)`
    }
  },
  "L1-03": {
    badge: "Collision Lab",
    button: "搭建碰撞结果",
    activeButton: "碰撞结果规则已建立",
    statusIdle: "等待碰撞观察",
    statusLive: "碰撞规则验证中",
    statusWin: "碰撞关卡完成",
    statLabels: ["规则选择", "试玩证据", "学习单"],
    statValues: ["45-60", "碰撞关卡", "奖励 / 障碍"],
    intro: "这一课把移动角色放进有结果的世界。学生要观察碰撞现象，区分“碰到了”和“产生结果”，再做出奖励加分或障碍后退的单屏碰撞关卡。",
    missionCopy: "按照 v0.8 的完整课时结构，课堂会经历试玩、对象规则拆解、第一版碰撞规则、debug、扩展第二种碰撞结果和出口复盘。",
    steps: [
      "5-8 分钟：试玩碰撞场景，记录碰到奖励和障碍时分别发生了什么",
      "8-10 分钟：拆对象、目标和规则：玩家、奖励、障碍或安全区",
      "10-12 分钟：搭第一版碰撞规则，碰到奖励后加分或隐藏奖励",
      "10 分钟：运行验证，检查重复加分、未隐藏、碰撞范围太大或太小",
      "8-12 分钟：扩展挑战，加入障碍后退、扣血或重置位置",
      "5-8 分钟：完成碰撞关卡记录，讲清碰撞条件和结果动作"
    ],
    slots: [
      "当 玩家碰到奖励物或障碍物",
      "如果 目标对象仍然有效，且碰撞结果还没有被处理过",
      "就 加分 / 后退 / 隐藏对象，并记录本次碰撞结果"
    ],
    guide: {
      title: "L1-03 完整课模板：碰到就有结果",
      badge: "45-60 min",
      goal: "学生能做出奖励或障碍碰撞结果，并解释碰撞检测、条件判断和结果动作。",
      observe: "先让学生只试玩：有些碰撞只是接触，有些碰撞会改变分数、位置或状态。",
      experiment: "第一版只做奖励碰撞，稳定后再加障碍碰撞。每加一种结果都要运行验证。",
      checkpoint: "出口证据是碰撞关卡：至少 1 个奖励结果、1 个障碍结果、1 条防重复或有效状态判断。"
    },
    phaseExperiments: {
      discover: "先分别碰奖励和障碍，记录哪些结果发生了，哪些结果缺失。",
      build: "先接奖励碰撞规则：当玩家碰到奖励，如果奖励有效，就加分并隐藏。",
      verify: "碰撞规则已建立。现在加入障碍结果，检查两种碰撞不会互相干扰。"
    },
    phaseHints: {
      discover: "先观察：碰到对象只是事件，真正的课程重点是碰撞之后的结果。",
      build: "先做奖励加分和隐藏，再处理障碍后退。不要一次加太多结果。",
      verify: "碰撞结果规则已建立。现在验证同一个奖励不会重复加分，障碍会稳定产生后退。"
    },
    completionMessage: "L1-03 完成：学生已经做出碰撞关卡，并能说明碰撞条件如何触发奖励或障碍结果。",
    code: {
      rule: `完整课模板：L1-03 碰到就有结果

课时长度：45-60 分钟
课时定位：让学生理解碰撞不是自动结果，必须有条件和动作。

课堂流程：
1. 试玩观察 5-8 分钟
   分别碰奖励和障碍，记录分数、位置、对象显示是否变化。
2. 拆对象目标规则 8-10 分钟
   对象：玩家、奖励、障碍。目标：碰奖励得分，碰障碍受阻。
3. 第一版规则 10-12 分钟
   当玩家碰到奖励，如果奖励有效，就加分并隐藏奖励。
4. 运行验证与 debug 10 分钟
   重点检查重复加分、碰撞范围、对象未隐藏、结果顺序。
5. 扩展挑战 8-12 分钟
   增加障碍后退或扣血，并和奖励规则同时运行。
6. 出口复盘 5-8 分钟
   学生用一条规则说明奖励结果，用另一条规则说明障碍结果。

学生产出：
- 一个单屏碰撞关卡
- 奖励结果规则
- 障碍结果规则
- 一条防重复或有效状态判断`,
      pseudo: `when player collides with reward:
    if reward.active:
        score += reward.value
        reward.active = false
        hide(reward)

when player collides with obstacle:
    if obstacle.active:
        player.x = player.start_x
        hp -= 1`,
      python: `def handle_collisions():
    for reward in rewards:
        if player.collides_with(reward) and reward.active:
            score.add(reward.value)
            reward.active = False
            reward.hide()

    for obstacle in obstacles:
        if player.collides_with(obstacle):
            player.move_back()
            hp.lose(1)`
    }
  },
  "L2-01": {
    badge: "Prototype Lab",
    button: "搭建核心循环",
    activeButton: "核心玩法循环已建立",
    statusIdle: "等待玩法拆解",
    statusLive: "原型循环验证中",
    statusWin: "玩法循环完成",
    statLabels: ["规则选择", "试玩证据", "学习单"],
    statValues: ["60-90", "循环图", "30 秒体验"],
    intro: "这一课是 L2 的入口，不再重复讲事件和碰撞本身，而是把 L1 的单屏规则升级为玩法循环。学生要画出并做出“做什么 -> 得到什么 -> 为什么继续玩”的 30 秒核心体验。",
    missionCopy: "按 v0.8 的 L2 课时结构展开：玩法分析、第一版原型、运行测试、体验调校、AI 协作验证、记录展示，目标是撑起 60-90 分钟的完整原型课。",
    steps: [
      "10 分钟：分析一个小游戏循环，写出玩家动作、即时反馈、短目标和失败回路",
      "15-20 分钟：做第一版 30 秒原型，只保留一个玩家动作和一个目标",
      "15 分钟：运行测试，记录玩家是否知道该做什么、是否得到反馈、是否想继续",
      "10-15 分钟：调校目标距离、反馈强度、失败成本或回合时长",
      "10-15 分钟：用 AI 帮忙检查循环缺口，但必须用试玩结果验证建议",
      "10 分钟：完成玩法循环图和 30 秒体验记录"
    ],
    slots: [
      "当 玩家执行核心动作",
      "如果 动作能带来清楚反馈，并推动短目标或失败回路",
      "就 形成 30 秒玩法循环：行动 -> 反馈 -> 再行动"
    ],
    guide: {
      title: "L2-01 完整课模板：核心玩法循环",
      badge: "60-90 min",
      goal: "学生能画出并做出一个 30 秒核心玩法循环，说明玩家为什么会继续玩。",
      observe: "先分析体验，不从规则名词开始。关注玩家第一秒做什么、第三秒看到什么、十秒后为什么继续。",
      experiment: "第一版原型只保留一个动作和一个短目标。调校阶段再改反馈、失败成本和目标节奏。",
      checkpoint: "出口证据是玩法循环图：玩家动作、反馈、目标、失败回路、一次调校记录。"
    },
    phaseExperiments: {
      discover: "先拆玩法循环：玩家做什么，得到什么，失败后为什么再试。",
      build: "现在只做 30 秒核心体验，不做完整关卡和复杂系统。",
      verify: "核心循环已建立。让同伴试玩 30 秒，记录他是否知道下一步要做什么。"
    },
    phaseHints: {
      discover: "先问玩法问题：玩家第一秒会做什么？反馈够不够快？失败后还想再试吗？",
      build: "先把动作、反馈和短目标连成一圈。内容量少一点没关系，循环要清楚。",
      verify: "核心玩法循环已建立。现在用 30 秒试玩结果验证，而不是只看自己觉得好不好。"
    },
    completionMessage: "L2-01 完成：学生已经做出 30 秒核心循环，并留下玩法循环图和试玩证据。",
    code: {
      rule: `完整课模板：L2-01 核心玩法循环

课时长度：60-90 分钟
课时定位：L2 入口课。重点是玩法循环和原型体验，不再把事件、变量、碰撞当主线卖点。

课堂流程：
1. 玩法分析 10 分钟
   拆一个小游戏：玩家动作、即时反馈、短目标、失败回路。
2. 第一版原型 15-20 分钟
   只保留一个动作和一个目标，做出 30 秒可体验版本。
3. 运行测试与调试 15 分钟
   观察玩家是否知道做什么，反馈是否及时，失败是否清楚。
4. 扩展调校 10-15 分钟
   调目标距离、反馈强度、失败成本、回合时长。
5. AI 协作验证 10-15 分钟
   让 AI 检查循环缺口，但必须用同伴试玩验证。
6. 记录展示 10 分钟
   完成玩法循环图和一次调校记录。

学生产出：
- 30 秒核心玩法原型
- 玩法循环图
- 一次同伴试玩记录
- 一条 AI 建议验证结论`,
      pseudo: `loop:
    player_action()
    feedback = show_immediate_result()

    if short_goal_reached:
        reward_player()
        raise_next_goal()

    if fail_condition:
        reset_quickly()
        invite_retry()`,
      python: `def core_loop():
    action = read_player_action()
    feedback = apply_action(action)
    show(feedback)

    if reached_short_goal():
        reward()
        set_next_goal()

    if failed():
        quick_reset()
        prompt_retry()`
    }
  },
  "L2-02": {
    badge: "Risk Lab",
    button: "搭建风险奖励回路",
    activeButton: "风险奖励回路已建立",
    statusIdle: "等待决策拆解",
    statusLive: "风险回路验证中",
    statusWin: "风险回路完成",
    statLabels: ["规则选择", "试玩证据", "学习单"],
    statValues: ["60-90", "风险回路", "选择记录"],
    intro: "这一课把 L2-01 的核心循环推到决策层。学生要让玩家面对安全路径和高收益路径的选择，并用试玩结果证明风险与奖励真的影响了行为。",
    missionCopy: "完整课时包括玩法分析、第一版风险原型、测试调试、体验调校、AI 协作验证和复盘展示。重点是玩家决策，不是重复讲碰撞或分数。",
    steps: [
      "10 分钟：分析一个风险选择，写出安全路线、高收益路线和失败成本",
      "15-20 分钟：做第一版风险原型，让玩家能在安全与收益间选择",
      "15 分钟：运行测试，记录玩家是否愿意冒险以及原因",
      "10-15 分钟：调校奖励大小、危险密度、失败成本或重试速度",
      "10-15 分钟：用 AI 生成 2 个调参建议，并通过试玩筛掉无效建议",
      "10 分钟：完成风险回路记录，说明哪组参数让选择最明显"
    ],
    slots: [
      "当 玩家靠近安全路线或高收益路线",
      "如果 高收益伴随更高失败成本，安全路线收益更低但稳定",
      "就 让玩家做选择，并记录选择次数和结果"
    ],
    guide: {
      title: "L2-02 完整课模板：风险与奖励回路",
      badge: "60-90 min",
      goal: "学生能做出一个有安全选择和冒险选择的原型，并用数据或观察说明玩家为什么选择。",
      observe: "先从玩家心理分析：什么奖励值得冒险？失败会不会太重？安全路线是不是也有意义？",
      experiment: "第一版只做两条路线或两个选择点。调校阶段改奖励、危险密度和失败成本。",
      checkpoint: "出口证据是风险回路：至少 2 种选择、1 次参数调校、1 份试玩选择记录。"
    },
    phaseExperiments: {
      discover: "先拆安全路线和冒险路线：收益、风险、失败成本分别是什么。",
      build: "现在做一个能被试玩选择的风险点，不要只写规则说明。",
      verify: "风险奖励回路已建立。让同伴试玩，记录他选安全还是冒险，以及为什么。"
    },
    phaseHints: {
      discover: "先判断选择是否真的存在：如果一条路永远更好，玩家就没有决策。",
      build: "先做一个清楚的二选一，再调奖励和危险。玩法选择比内容数量更重要。",
      verify: "风险奖励回路已建立。现在看试玩记录：玩家行为有没有因为风险和奖励改变。"
    },
    completionMessage: "L2-02 完成：学生已经做出风险奖励回路，并用试玩记录证明选择确实存在。",
    code: {
      rule: `完整课模板：L2-02 风险与奖励回路

课时长度：60-90 分钟
课时定位：让核心循环出现玩家决策。重点是风险、奖励和行为变化。

课堂流程：
1. 玩法分析 10 分钟
   写出安全选择、高收益选择、失败成本。
2. 第一版原型 15-20 分钟
   做一个二选一场景，让玩家能立即选择。
3. 运行测试与调试 15 分钟
   记录玩家选择、失败次数、是否愿意重试。
4. 扩展调校 10-15 分钟
   改奖励大小、危险密度、失败成本或重试速度。
5. AI 协作验证 10-15 分钟
   用 AI 生成调参建议，再用试玩筛选。
6. 记录展示 10 分钟
   完成风险回路记录，说明最有效的一组参数。

学生产出：
- 一个安全与冒险二选一原型
- 一次参数调校
- 一份试玩选择记录
- 一句设计结论`,
      pseudo: `if player_choose_safe_path:
    reward += small_reward
    risk = low

if player_choose_risky_path:
    reward += big_reward
    risk = high

record(choice, reward, fail_count)
adjust_until(choice_is_meaningful)`,
      python: `paths = {
    "safe": {"reward": 1, "danger": 0.2},
    "risky": {"reward": 4, "danger": 0.7}
}

def resolve_choice(path_name):
    path = paths[path_name]
    if random_chance(path["danger"]):
        fail_and_retry()
    else:
        score.add(path["reward"])
    log_choice(path_name)`
    }
  },
  "L2-03": {
    badge: "Resource Lab",
    button: "搭建资源策略系统",
    activeButton: "资源策略系统已建立",
    statusIdle: "等待资源拆解",
    statusLive: "资源系统验证中",
    statusWin: "资源系统完成",
    statLabels: ["规则选择", "试玩证据", "学习单"],
    statValues: ["60-90", "资源系统", "策略限制"],
    intro: "这一课让玩法从“能循环”进入“有策略”。学生要加入能量、弹药、冷却或货币中的一种资源，让玩家不能一直使用最强行为，必须计划何时使用。",
    missionCopy: "完整课时围绕资源设计展开：先拆核心策略，再做最小资源系统，运行测试消耗和恢复，调校数值，并用 AI 协作检查是否产生真实选择。",
    steps: [
      "10 分钟：分析资源在玩法里的作用：限制什么、鼓励什么、什么时候恢复",
      "15-20 分钟：做第一版资源系统，加入消耗、不足提示和恢复方式",
      "15 分钟：运行测试，检查资源是否真的限制了最强行为",
      "10-15 分钟：调校最大值、消耗值、恢复速度或冷却时间",
      "10-15 分钟：用 AI 检查数值漏洞，并通过反例测试验证",
      "10 分钟：完成资源系统说明，记录一条策略选择和一组最终参数"
    ],
    slots: [
      "当 玩家想使用强力行为或关键道具",
      "如果 当前资源足够，且冷却或消耗条件允许",
      "就 执行动作、扣除资源，并通过恢复规则让玩家重新规划"
    ],
    guide: {
      title: "L2-03 完整课模板：资源和策略",
      badge: "60-90 min",
      goal: "学生能加入一个限制策略的资源系统，并说明资源如何改变玩家选择。",
      observe: "先观察原型里是否存在无脑最优行为。如果玩家可以一直用最强动作，就需要资源限制。",
      experiment: "第一版资源系统必须包含消耗、不足反馈和恢复。调校阶段再决定数值是否紧张。",
      checkpoint: "出口证据是资源系统：资源最大值、消耗规则、恢复规则、一次反例测试和最终参数。"
    },
    phaseExperiments: {
      discover: "先找到需要被限制的强力行为：技能、攻击、冲刺、道具或购买。",
      build: "现在做最小资源系统：足够就执行，不足就反馈，随后有恢复方式。",
      verify: "资源策略系统已建立。用反例测试：玩家能不能无限使用最强行为？"
    },
    phaseHints: {
      discover: "先问策略问题：如果没有资源限制，玩家会不会一直做同一件事？",
      build: "资源系统至少要有消耗、不足提示和恢复。只有数字显示还不够。",
      verify: "资源策略系统已建立。现在调一组参数，让资源既有压力，又不会让玩家完全不能行动。"
    },
    completionMessage: "L2-03 完成：学生已经加入资源策略系统，并用参数和反例测试证明它能限制选择。",
    code: {
      rule: `完整课模板：L2-03 资源和策略

课时长度：60-90 分钟
课时定位：让玩法从核心循环进入策略限制。重点是资源如何改变玩家行为。

课堂流程：
1. 玩法分析 10 分钟
   找到需要限制的强力行为，定义资源作用。
2. 第一版系统 15-20 分钟
   加入资源最大值、消耗、不足提示和恢复。
3. 运行测试与调试 15 分钟
   检查资源是否真的限制了最强行为，有没有卡死或无限使用。
4. 扩展调校 10-15 分钟
   调最大值、消耗、恢复速度、冷却时间。
5. AI 协作验证 10-15 分钟
   让 AI 找数值漏洞，再用反例测试验证。
6. 记录展示 10 分钟
   写下最终参数和它带来的策略选择。

学生产出：
- 一个可见或可感知的资源系统
- 消耗规则
- 恢复规则
- 一次反例测试记录
- 最终参数表`,
      pseudo: `when player_uses_power_action:
    if resource >= cost and cooldown_ready:
        perform_action()
        resource -= cost
        start_cooldown()
    else:
        show_not_enough_feedback()

over_time:
    resource = min(max_resource, resource + recover_rate)`,
      python: `max_energy = 5
energy = 5
cost = 2
recover_rate = 0.5

def use_skill():
    global energy
    if energy >= cost and cooldown.ready:
        cast_skill()
        energy -= cost
        cooldown.start()
    else:
        show("energy not enough")

def recover(dt):
    global energy
    energy = min(max_energy, energy + recover_rate * dt)`
    }
  }
};

const handsOnActivities = {
  "L1-01": {
    title: "学生动手：点对象，拼规则",
    badge: "对象拆解",
    prompt: "先在画布里点出玩家、目标、限制 3 个对象，再在这里拼出规则拆解卡。",
    completeMessage: "L1-01 完成：学生已经亲自标出 3 个对象，并拼出一张可验证的规则拆解卡。",
    groups: [
      {
        id: "objects",
        label: "规则卡里的 3 个对象",
        limit: 3,
        choices: [
          { id: "player", label: "玩家对象", correct: true },
          { id: "goal", label: "目标对象", correct: true },
          { id: "blocker", label: "限制对象", correct: true },
          { id: "background", label: "背景装饰", correct: false }
        ]
      },
      {
        id: "goal",
        label: "玩家目标",
        limit: 1,
        choices: [
          { id: "reach", label: "到达目标 / 拿到宝物", correct: true },
          { id: "watch", label: "只看角色移动", correct: false },
          { id: "decorate", label: "给背景换颜色", correct: false }
        ]
      },
      {
        id: "rule",
        label: "最小规则",
        limit: 1,
        choices: [
          { id: "touch-goal", label: "当玩家碰到目标，如果目标有效，就通关或得分", correct: true },
          { id: "always-win", label: "当游戏开始，就直接通关", correct: false },
          { id: "only-look", label: "如果背景好看，就算完成", correct: false }
        ]
      }
    ],
    playChecks: [
      { id: "markedObjects", label: "在画布上点出 3 个对象", target: 3 }
    ]
  },
  "L1-02": {
    title: "学生动手：拼输入规则，再把角色送进目标区",
    badge: "输入实验",
    prompt: "先选出输入规则的关键部件，再用方向键或触屏方向键把角色移动到右侧目标区。",
    completeMessage: "L1-02 完成：学生已经拼出输入规则，并亲自把角色移动到目标区。",
    groups: [
      {
        id: "input",
        label: "输入事件",
        limit: 1,
        choices: [
          { id: "keys", label: "方向键 / WASD", correct: true },
          { id: "timer", label: "每隔 1 秒", correct: false },
          { id: "random", label: "随机位置", correct: false }
        ]
      },
      {
        id: "condition",
        label: "移动条件",
        limit: 1,
        choices: [
          { id: "bounds", label: "角色还在边界内", correct: true },
          { id: "score", label: "分数已经满了", correct: false },
          { id: "enemy", label: "敌人正在巡逻", correct: false }
        ]
      },
      {
        id: "action",
        label: "结果动作",
        limit: 1,
        choices: [
          { id: "position", label: "改变 x / y 坐标", correct: true },
          { id: "hide", label: "隐藏目标区", correct: false },
          { id: "spawn", label: "生成新敌人", correct: false }
        ]
      }
    ],
    playChecks: [
      { id: "targetReached", label: "用方向键进入目标区", target: 1 }
    ]
  },
  "L1-03": {
    title: "学生动手：拼碰撞规则，触发两种结果",
    badge: "碰撞实验",
    prompt: "先拼出碰撞条件，再实际触发奖励和障碍两种结果。射击路线用空格发射，平台路线用方向键移动。",
    completeMessage: "L1-03 完成：学生已经亲自触发奖励和障碍，并验证碰撞确实产生结果。",
    groups: [
      {
        id: "collision",
        label: "碰撞事件",
        limit: 1,
        choices: [
          { id: "touch", label: "玩家 / 子弹碰到目标对象", correct: true },
          { id: "time", label: "时间到 0 秒", correct: false },
          { id: "theme", label: "背景音乐变化", correct: false }
        ]
      },
      {
        id: "reward",
        label: "奖励结果",
        limit: 1,
        choices: [
          { id: "score-hide", label: "加分，并隐藏奖励", correct: true },
          { id: "repeat-score", label: "一直重复加分", correct: false },
          { id: "no-change", label: "什么都不改变", correct: false }
        ]
      },
      {
        id: "hazard",
        label: "障碍结果",
        limit: 1,
        choices: [
          { id: "hurt-back", label: "扣血或后退", correct: true },
          { id: "free-pass", label: "碰到障碍也通关", correct: false },
          { id: "delete-player", label: "删除玩家对象", correct: false }
        ]
      }
    ],
    playChecks: [
      { id: "rewardTriggered", label: "触发奖励结果", target: 1 },
      { id: "hazardTriggered", label: "触发障碍结果", target: 1 }
    ]
  },
  "L2-01": {
    title: "学生动手：做 30 秒核心循环",
    badge: "循环原型",
    prompt: "先拼出动作、反馈、失败回路，再用方向键连续完成两个短目标，验证循环能让玩家继续玩。",
    completeMessage: "L2-01 完成：学生已经拼出核心循环，并通过两次短目标试玩验证它。",
    groups: [
      {
        id: "action",
        label: "玩家动作",
        limit: 1,
        choices: [
          { id: "move-collect", label: "移动并收集 / 命中目标", correct: true },
          { id: "wait", label: "站着等待", correct: false },
          { id: "menu", label: "只打开菜单", correct: false }
        ]
      },
      {
        id: "feedback",
        label: "即时反馈",
        limit: 1,
        choices: [
          { id: "visible", label: "分数、光效或目标变化", correct: true },
          { id: "hidden", label: "没有任何提示", correct: false },
          { id: "later", label: "下节课再显示", correct: false }
        ]
      },
      {
        id: "retry",
        label: "为什么继续玩",
        limit: 1,
        choices: [
          { id: "short-goal", label: "短目标 + 快速失败回路", correct: true },
          { id: "too-long", label: "5 分钟后才知道结果", correct: false },
          { id: "no-risk", label: "没有目标也没有失败", correct: false }
        ]
      }
    ],
    playChecks: [
      { id: "loopRuns", label: "完成 2 次短目标", target: 2 }
    ]
  },
  "L2-02": {
    title: "学生动手：试玩安全与冒险路线",
    badge: "风险回路",
    prompt: "先拼出安全路线、冒险路线和失败成本，再分别走一次安全区和高收益区，记录选择差异。",
    completeMessage: "L2-02 完成：学生已经分别试玩安全和冒险路线，并证明选择会影响收益和风险。",
    groups: [
      {
        id: "safe",
        label: "安全路线",
        limit: 1,
        choices: [
          { id: "low-risk", label: "低风险、低奖励", correct: true },
          { id: "high-risk", label: "高风险、高奖励", correct: false },
          { id: "no-reward", label: "没有奖励", correct: false }
        ]
      },
      {
        id: "risky",
        label: "冒险路线",
        limit: 1,
        choices: [
          { id: "high-return", label: "高奖励、失败成本更高", correct: true },
          { id: "always-best", label: "永远最安全也最高分", correct: false },
          { id: "same", label: "和安全路线完全一样", correct: false }
        ]
      },
      {
        id: "cost",
        label: "失败成本",
        limit: 1,
        choices: [
          { id: "retry-cost", label: "扣时间 / 扣血 / 回到起点", correct: true },
          { id: "none", label: "失败没有任何变化", correct: false },
          { id: "finish", label: "失败后直接完成课程", correct: false }
        ]
      }
    ],
    playChecks: [
      { id: "safeVisits", label: "走过安全路线", target: 1 },
      { id: "riskyVisits", label: "走过冒险路线", target: 1 }
    ]
  },
  "L2-03": {
    title: "学生动手：使用资源，验证限制",
    badge: "资源策略",
    prompt: "先拼出资源系统，再按技能键消耗能量。用完后再按一次，看到“不足反馈”才算验证了策略限制。",
    completeMessage: "L2-03 完成：学生已经配置资源系统，并通过技能消耗与不足反馈验证了策略限制。",
    groups: [
      {
        id: "resource",
        label: "资源类型",
        limit: 1,
        choices: [
          { id: "energy", label: "能量 / 弹药 / 冷却", correct: true },
          { id: "background", label: "背景颜色", correct: false },
          { id: "title", label: "关卡标题", correct: false }
        ]
      },
      {
        id: "cost",
        label: "消耗规则",
        limit: 1,
        choices: [
          { id: "pay-cost", label: "使用强力动作时扣资源", correct: true },
          { id: "free", label: "强力动作永远免费", correct: false },
          { id: "random-cost", label: "随机删除一个对象", correct: false }
        ]
      },
      {
        id: "feedback",
        label: "不足反馈",
        limit: 1,
        choices: [
          { id: "not-enough", label: "资源不足时给出提示", correct: true },
          { id: "silent", label: "资源不足时没有提示", correct: false },
          { id: "crash", label: "资源不足时让游戏崩溃", correct: false }
        ]
      }
    ],
    playChecks: [
      { id: "resourceUses", label: "成功使用 2 次技能", target: 2 },
      { id: "resourceBlocked", label: "触发 1 次资源不足反馈", target: 1 }
    ]
  }
};

const lessonWorkPacks = {
  "L1-01": {
    materials: ["单屏游戏对象图：玩家、目标、限制、背景", "规则拆解卡：对象 -> 目标 -> 当/如果/就", "迁移挑战：把宝物目标换成钥匙开门"],
    taskCards: [
      { title: "对象侦探", body: "在画布里点出玩家对象、目标对象、限制对象，并说清它们各自负责什么。" },
      { title: "规则翻译", body: "把目标翻译成一句规则：当玩家和目标发生关系，如果目标有效，就出现结果。" },
      { title: "换一个目标", body: "把“拿到宝物”换成“拿到钥匙再开门”，判断对象和规则哪里要变。" }
    ],
    notebook: [
      { id: "observe", label: "对象记录", placeholder: "写下 3 个对象分别负责什么，例如：玩家负责移动，目标负责通关，障碍负责限制。", minLength: 18 },
      { id: "rule", label: "规则句", placeholder: "用“当 / 如果 / 就”写一条规则。", minLength: 18 },
      { id: "transfer", label: "迁移想法", placeholder: "如果把目标换掉，哪些对象或条件要改？", minLength: 16 }
    ]
  },
  "L1-02": {
    materials: ["输入测试场：方向键、目标区、边界线", "速度参数卡：慢速、中速、快速", "坐标记录表：按键 -> x/y 变化 -> 结果"],
    taskCards: [
      { title: "按键观察", body: "先按两个方向键，确认事件发生但角色不会自动移动。" },
      { title: "坐标实验", body: "启动规则后只测试移动，记录 x/y 哪个数字在变化。" },
      { title: "手感调参", body: "比较慢速和快速移动，写下哪种速度更容易进入目标区。" }
    ],
    notebook: [
      { id: "observe", label: "输入观察", placeholder: "按键后你看到了什么？角色、坐标或提示有什么变化？", minLength: 18 },
      { id: "design", label: "移动设计", placeholder: "写出你的输入规则：哪个键改变 x，哪个键改变 y，为什么需要边界？", minLength: 22 },
      { id: "test", label: "测试结论", placeholder: "你是怎样把角色送进目标区的？速度或边界有什么影响？", minLength: 20 }
    ]
  },
  "L1-03": {
    materials: ["碰撞测试场：奖励物、障碍物、玩家/子弹", "结果卡：加分、隐藏、后退、扣血", "Bug 卡：重复加分、碰撞范围过大、对象未隐藏"],
    taskCards: [
      { title: "先碰不修", body: "先触发一次碰撞，观察有没有结果，区分“碰到了”和“产生结果”。" },
      { title: "奖励规则", body: "让奖励碰撞产生加分和隐藏，避免同一个奖励重复加分。" },
      { title: "障碍规则", body: "让障碍碰撞产生后退或扣血，并检查奖励和障碍不会互相干扰。" }
    ],
    notebook: [
      { id: "observe", label: "碰撞观察", placeholder: "写下你触发了哪两种碰撞，各自原本有没有结果。", minLength: 18 },
      { id: "design", label: "结果设计", placeholder: "奖励和障碍分别应该产生什么结果？为什么？", minLength: 20 },
      { id: "debug", label: "Debug 记录", placeholder: "你如何防止重复加分、碰撞范围错误或结果顺序错误？", minLength: 22 }
    ]
  },
  "L2-01": {
    materials: ["30 秒原型画布：动作、反馈、短目标", "循环图模板：行动 -> 反馈 -> 再行动", "试玩记录表：玩家是否知道下一步"],
    taskCards: [
      { title: "三秒判断", body: "写出玩家第一秒做什么、第二秒看到什么、第三秒为什么继续。" },
      { title: "30 秒原型", body: "只保留一个动作和一个短目标，连续完成两次短目标。" },
      { title: "同伴试玩", body: "让同伴试玩 30 秒，记录他有没有迷路、有没有反馈、是否想再试。" }
    ],
    notebook: [
      { id: "loop", label: "核心循环", placeholder: "写出：玩家做什么 -> 得到什么 -> 为什么继续玩。", minLength: 24 },
      { id: "prototype", label: "原型范围", placeholder: "你删掉了哪些不必要功能，保留了哪一个动作和短目标？", minLength: 24 },
      { id: "test", label: "试玩结论", placeholder: "试玩后发现循环哪里清楚，哪里还需要调？", minLength: 20 }
    ]
  },
  "L2-02": {
    materials: ["路线图：安全区、冒险区、失败回路", "参数卡：奖励大小、危险密度、失败成本", "选择记录表：玩家选了哪条路"],
    taskCards: [
      { title: "做出二选一", body: "安全路线低风险低奖励，冒险路线高奖励但失败成本更明显。" },
      { title: "分别试玩", body: "亲自走一次安全路线，再走一次冒险路线，记录收益和风险。" },
      { title: "调参判断", body: "如果所有人都选同一路线，调整奖励或失败成本，让选择更有意义。" }
    ],
    notebook: [
      { id: "choice", label: "选择设计", placeholder: "安全路线和冒险路线分别给玩家什么好处和代价？", minLength: 24 },
      { id: "data", label: "试玩记录", placeholder: "你分别走了哪两条路线？结果有什么不同？", minLength: 20 },
      { id: "tune", label: "调参结论", placeholder: "你会调高/调低哪个参数，让选择更明显？", minLength: 20 }
    ]
  },
  "L2-03": {
    materials: ["资源面板：能量值、技能键、不足提示", "数值卡：最大值、消耗、恢复、冷却", "反例测试表：能不能无限用强力动作"],
    taskCards: [
      { title: "找最强动作", body: "先判断哪个动作如果免费无限用，会破坏玩法策略。" },
      { title: "消耗测试", body: "连续使用技能，观察资源减少和动作反馈。" },
      { title: "不足验证", body: "资源用完后再按一次技能，必须看到不足反馈，才说明限制生效。" }
    ],
    notebook: [
      { id: "resource", label: "资源用途", placeholder: "这套资源系统限制了哪个强力动作？为什么要限制？", minLength: 22 },
      { id: "params", label: "参数表", placeholder: "写下最大值、每次消耗、冷却或恢复规则。", minLength: 18 },
      { id: "counter", label: "反例测试", placeholder: "如果玩家想无限使用强力动作，系统如何阻止？", minLength: 22 }
    ]
  }
};

function curriculumProfile(course) {
  const concepts = courseConceptList(course);
  const conceptA = concepts[0] || "目标";
  const conceptB = concepts[1] || "规则";
  const conceptC = concepts[2] || "作品";
  const module = courseModule(course);
  const fullTemplate = fullCourseTemplates[course.id];

  if (fullTemplate) {
    return fullTemplate;
  }

  if (course.stage === "L0" && module === "M1") {
    return {
      badge: "Response Lab",
      button: "连接第一条回应",
      activeButton: "回应规则已启动",
      statusIdle: "等待回应",
      statusLive: "回应实验中",
      statusWin: "回应作品完成",
      statLabels: ["动作", "反馈", "作品"],
      statValues: [conceptA, conceptB, course.product],
      intro: `这一课先让作品出现直接回应。重点不是做复杂关卡，而是让“${course.task}”真的发生，并感受到 ${conceptA} 和 ${conceptB} 是怎么连起来的。`,
      missionCopy: `先观察谁会动、谁会回应，再接上一条最小规则，留下“${course.product}”这个学习证据。`,
      steps: [
        `观察谁会负责 ${conceptA}`,
        `找出最明显的 ${conceptB} 反馈`,
        `接上一条最小回应规则`,
        `展示 ${course.product} 并讲清变化`
      ],
      slots: [
        `当 ${conceptA} 被触发`,
        `如果 我要完成：${course.task}`,
        `就 让作品出现 ${conceptB} 的回应`
      ],
      guide: {
        title: `${course.id} 回应实验：${course.title}`,
        badge: "Response",
        goal: `让作品对一个动作或事件做出清楚回应，完成“${course.product}”。`,
        observe: `先观察这节课里谁是主角、谁是触发点、谁会出现反馈。`,
        experiment: `先只做一个最小回应，不要同时改很多东西。`,
        checkpoint: `出口自测：能说出“我触发了什么，所以作品出现了什么反馈”。`
      },
      phaseExperiments: {
        discover: `先点击“试运行”，找出最明显的一处 ${conceptB} 反馈应该出现在哪里。`,
        build: `现在接上一条最小规则，只专注完成“${course.task}”。`,
        verify: `再试运行一次，确认 ${course.product} 已经稳定出现。`
      },
      phaseHints: {
        discover: `先试运行，观察这节课最先会动的对象和最明显的反馈。`,
        build: `现在把最小回应规则接上，只做一件事：${course.task}。`,
        verify: `回应规则已启动。再试运行一次，确认 ${course.product} 真的出现。`
      },
      completionMessage: `${course.id} 完成：你已经做出了“${course.product}”，并让作品对你的动作产生了清楚回应。`,
      code: {
        rule: `当 一个动作或事件发生
如果 我要完成 ${course.task}
就 让作品出现一次清楚反馈

本课证据：
${course.product}`,
        pseudo: `observe("${course.task}")
trigger = "${conceptA}"
response = "${conceptB}"

when(trigger):
    show(response)
    save("${course.product}")`,
        python: `goal = "${course.task}"

def respond(trigger):
    if trigger:
        show_feedback("${conceptB}")
        save_artifact("${course.product}")`
      }
    };
  }

  if (course.stage === "L0" && module === "M2") {
    return {
      badge: "World Lab",
      button: "连接世界规则",
      activeButton: "世界规则已启动",
      statusIdle: "等待选择",
      statusLive: "规则实验中",
      statusWin: "世界规则完成",
      statLabels: ["变化", "结果", "作品"],
      statValues: [conceptA, conceptB, course.product],
      intro: `这一课开始让作品不只是“会回应”，还会因为选择、重复或计数而变化。目标是完成“${course.task}”。`,
      missionCopy: `先看世界会在哪一步发生变化，再用一条最小规则把 ${conceptA} 和结果连起来。`,
      steps: [
        `观察哪里会发生 ${conceptA}`,
        `猜测不同选择会带来什么结果`,
        `接上世界变化规则`,
        `完成 ${course.product} 并复盘`
      ],
      slots: [
        `当 世界进入 ${conceptA} 情况`,
        `如果 我想完成：${course.task}`,
        `就 让结果变成 ${conceptB}`
      ],
      guide: {
        title: `${course.id} 世界规则：${course.title}`,
        badge: "World",
        goal: `让作品因为选择、重复或计数发生真正变化。`,
        observe: `先想一想：这一课里什么会变，什么保持不变。`,
        experiment: `只先连一条“世界变化”规则，再看结果是否成立。`,
        checkpoint: `出口自测：能说出“如果我换一种选择，结果会怎样不同”。`
      },
      phaseExperiments: {
        discover: `先试运行，找到这节课最明显的“变化前”和“变化后”。`,
        build: `把最小的世界变化规则接上，先看到一次结果。`,
        verify: `再试运行，确认结果会稳定重复出现，而不是偶然发生。`
      },
      phaseHints: {
        discover: `先观察作品在哪一步会变，别急着一次做完整。`,
        build: `把世界规则接上后，先确认一次变化就够了。`,
        verify: `世界规则已启动。请验证结果是否真的和你的选择或重复动作一致。`
      },
      completionMessage: `${course.id} 完成：你已经让作品因为规则发生变化，并留下了“${course.product}”。`,
      code: {
        rule: `当 世界出现一种情况
如果 目标是 ${course.task}
就 让结果跟着变化

作品证据：
${course.product}`,
        pseudo: `state = "${conceptA}"

if state_changes():
    update_world("${conceptB}")
    save("${course.product}")`,
        python: `goal = "${course.task}"

def update_world(state):
    if state:
        world_change("${conceptB}")
        save_artifact("${course.product}")`
      }
    };
  }

  if (course.stage === "L0") {
    return {
      badge: "Story Lab",
      button: "启动作品任务",
      activeButton: "作品任务已启动",
      statusIdle: "等待创作",
      statusLive: "创作进行中",
      statusWin: "作品展示完成",
      statLabels: ["角色", "问题", "展示"],
      statValues: [conceptA, conceptB, course.product],
      intro: `这一课要把前面的回应和世界规则组合起来，做出一个能展示的完整小作品。目标是“${course.task}”。`,
      missionCopy: `先确定主角和目标，再借助 AI、调试或展示环节，把“${course.product}”做完整。`,
      steps: [
        `明确主角和目标`,
        `找出要补上的关键一步`,
        `完成最小可展示版本`,
        `讲清 ${course.product} 的规则`
      ],
      slots: [
        `当 我要完成 ${course.product}`,
        `如果 还差关键一步`,
        `就 用 ${conceptA} 和 ${conceptB} 把作品补完整`
      ],
      guide: {
        title: `${course.id} 创作工坊：${course.title}`,
        badge: "Story",
        goal: `完成一个能展示的小作品，而不只是单个动作。`,
        observe: `先确认这节课的主角、目标和最重要的规则证据。`,
        experiment: `优先补最关键的一步，先做出能展示的最小版本。`,
        checkpoint: `出口自测：能向家长或同学说清这件作品最重要的 2-3 条规则。`
      },
      phaseExperiments: {
        discover: `先试运行，确认这节课最关键的主角、目标和缺少的那一步。`,
        build: `现在补上关键规则，让作品至少能形成一个完整片段。`,
        verify: `再试运行，确认 ${course.product} 已经可以拿去展示和讲解。`
      },
      phaseHints: {
        discover: `先看清主角、目标和缺少的那一步，别一上来就追求完整。`,
        build: `先把最关键的一步接上，做出最小可展示版本。`,
        verify: `作品任务已启动。现在请确认它已经能被讲清、被展示、被保存。`
      },
      completionMessage: `${course.id} 完成：你已经把这节课做成了可展示的小作品“${course.product}”。`,
      code: {
        rule: `当 我准备展示这节课
先 完成 ${course.task}
再 保存作品证据
最后 讲清关键规则`,
        pseudo: `goal = "${course.task}"
artifact = "${course.product}"

build(goal)
save(artifact)
present(artifact)`,
        python: `goal = "${course.task}"
artifact = "${course.product}"

def create_showcase():
    build(goal)
    save_artifact(artifact)
    present(artifact)`
      }
    };
  }

  if (course.stage === "L1" && module === "M1") {
    return {
      badge: "Rule Lab",
      button: "连接规则骨架",
      activeButton: "规则骨架已启动",
      statusIdle: "等待拆解",
      statusLive: "规则搭建中",
      statusWin: "规则骨架完成",
      statLabels: ["对象", "规则", "位置"],
      statValues: [conceptA, conceptB, course.product],
      intro: `这一课进入规则游戏阶段。重点是把对象、事件和位置关系讲清楚，让“${course.task}”可以被一条规则表达出来。`,
      missionCopy: `先拆对象和目标，再用一条“当/如果/就”规则搭出最小骨架，完成“${course.product}”。`,
      steps: [
        `拆出对象和目标`,
        `找到触发规则的事件`,
        `搭起最小规则骨架`,
        `验证 ${course.product}`
      ],
      slots: [
        `当 ${conceptA} 发生`,
        `如果 目标是：${course.task}`,
        `就 用一条规则完成 ${conceptB}`
      ],
      guide: {
        title: `${course.id} 规则实验：${course.title}`,
        badge: "Rule",
        goal: `学会把一个小游戏目标拆成对象、事件和规则。`,
        observe: `先数一数：这节课至少有几个对象、一个目标、哪条规则最关键。`,
        experiment: `先只写一条最小骨架规则，确认它真的影响作品。`,
        checkpoint: `出口自测：能把目标用一句“当/如果/就”讲清。`
      },
      phaseExperiments: {
        discover: `先试运行，确认对象、事件和目标分别是谁。`,
        build: `接上一条最小骨架规则，不要一次塞进太多条件。`,
        verify: `再试运行，确认这条规则已经足以支撑“${course.task}”。`
      },
      phaseHints: {
        discover: `先拆对象和目标，再决定哪条规则最先写。`,
        build: `把最小骨架接上后，先验证它真的动到了作品。`,
        verify: `规则骨架已启动。请检查对象、事件和结果是否已经连起来。`
      },
      completionMessage: `${course.id} 完成：你已经把小游戏目标拆成了一条清楚的规则骨架。`,
      code: {
        rule: `当 一个对象发生事件
如果 我要完成 ${course.task}
就 让另一对象或位置发生变化`,
        pseudo: `objects = inspect_scene()
event = "${conceptA}"

when(event):
    apply_rule("${course.task}")`,
        python: `goal = "${course.task}"

def apply_rule(event):
    if event:
        connect_objects(goal)`
      }
    };
  }

  if (course.stage === "L1" && module === "M2") {
    return {
      badge: "State Lab",
      button: "连接状态规则",
      activeButton: "状态规则已启动",
      statusIdle: "等待状态变化",
      statusLive: "状态实验中",
      statusWin: "状态系统完成",
      statLabels: ["变量", "状态", "结果"],
      statValues: [conceptA, conceptB, course.product],
      intro: `这一课关注变量、显示、碰撞和状态。目标是让“${course.task}”不只发生一次，而是能被游戏记住。`,
      missionCopy: `先找出哪一个数值或状态会变，再把它和结果连起来，完成“${course.product}”。`,
      steps: [
        `找到会变化的状态`,
        `判断它和结果怎么关联`,
        `接上状态变化规则`,
        `验证 ${course.product}`
      ],
      slots: [
        `当 ${conceptA} 或 ${conceptB} 发生变化`,
        `如果 目标是：${course.task}`,
        `就 更新状态并得到结果`
      ],
      guide: {
        title: `${course.id} 状态实验：${course.title}`,
        badge: "State",
        goal: `让游戏开始“记住”一次碰撞、一次收集或一次状态变化。`,
        observe: `先看清：这节课到底哪个值会变，哪个结果会被看见。`,
        experiment: `先连状态变化，再看结果；不要同时改很多判定。`,
        checkpoint: `出口自测：能解释“哪个变量/状态变了，所以哪个结果出现了”。`
      },
      phaseExperiments: {
        discover: `先试运行，找出会变化的变量、UI 或状态。`,
        build: `先把状态变化接上，再检查结果是不是跟着变。`,
        verify: `再试运行，确认同一条状态规则可以稳定重复工作。`
      },
      phaseHints: {
        discover: `先分清“会变化的状态”和“屏幕上看到的结果”是不是同一件事。`,
        build: `把状态规则接上后，先盯住一个值是不是变了。`,
        verify: `状态规则已启动。现在请确认结果确实来自状态变化。`
      },
      completionMessage: `${course.id} 完成：你已经把状态变化和结果反馈连成了完整链路。`,
      code: {
        rule: `当 状态发生变化
如果 目标是 ${course.task}
就 更新变量、显示或结果`,
        pseudo: `state = "${conceptA}"

if state_changes():
    render("${conceptB}")
    save("${course.product}")`,
        python: `state_name = "${conceptA}"

def update_state():
    change(state_name)
    show_result("${conceptB}")`
      }
    };
  }

  if (course.stage === "L1" && module === "M3") {
    return {
      badge: "System Lab",
      button: "启动系统规则",
      activeButton: "系统规则已启动",
      statusIdle: "等待系统运行",
      statusLive: "系统运行中",
      statusWin: "系统任务完成",
      statLabels: ["系统", "节奏", "作品"],
      statValues: [conceptA, conceptB, course.product],
      intro: `这一课让游戏系统开始自己运行。重点是把循环、随机、目标和参数调校成一个能持续工作的系统。`,
      missionCopy: `先观察系统什么时候该自己动起来，再接上一条最小系统规则，完成“${course.product}”。`,
      steps: [
        `观察系统什么时候该自动运行`,
        `找出节奏或目标条件`,
        `接上系统规则`,
        `验证 ${course.product}`
      ],
      slots: [
        `当 系统进入 ${conceptA} 节奏`,
        `如果 目标是：${course.task}`,
        `就 让系统持续产生 ${conceptB}`
      ],
      guide: {
        title: `${course.id} 系统实验：${course.title}`,
        badge: "System",
        goal: `让游戏不只是等玩家操作，而是自己按节奏运行。`,
        observe: `先看：这一课里什么应该自动发生，什么应该由玩家决定。`,
        experiment: `先让系统成功运行一次，再考虑调参数和手感。`,
        checkpoint: `出口自测：能解释系统靠什么条件开始、继续和停止。`
      },
      phaseExperiments: {
        discover: `先试运行，确认系统该在什么时候自动开始。`,
        build: `把最小系统规则接上，先让它成功运行一次。`,
        verify: `再试运行，观察它能否稳定重复，而不是只偶然成功。`
      },
      phaseHints: {
        discover: `先分清什么是玩家输入，什么是系统自己运行。`,
        build: `系统规则接上后，先盯住节奏和目标条件。`,
        verify: `系统规则已启动。请确认它已经能稳定地产生结果。`
      },
      completionMessage: `${course.id} 完成：你已经让这一课的系统按节奏跑起来了。`,
      code: {
        rule: `当 系统条件满足
如果 目标是 ${course.task}
就 按节奏运行一条系统规则`,
        pseudo: `while system_ready():
    run("${course.task}")
    tune("${conceptB}")`,
        python: `goal = "${course.task}"

def run_system():
    if system_ready():
        execute(goal)
        tune("${conceptB}")`
      }
    };
  }

  if (course.stage === "L1") {
    return {
      badge: "Studio Lab",
      button: "开启工作室任务",
      activeButton: "工作室任务已启动",
      statusIdle: "等待定位问题",
      statusLive: "工作室进行中",
      statusWin: "工作室任务完成",
      statLabels: ["问题", "提示", "作品"],
      statValues: [conceptA, conceptB, course.product],
      intro: `这一课进入规则工作室阶段。重点不是再学一个概念，而是把调试、AI 求助、关卡设计和展示串起来。`,
      missionCopy: `先确认这节课的核心问题或目标，再做一个最小可展示版本，完成“${course.product}”。`,
      steps: [
        `说清问题或目标`,
        `记录一个猜测或提示`,
        `完成最小作品证据`,
        `展示并复盘 ${course.product}`
      ],
      slots: [
        `当 我定位到一个问题或目标`,
        `如果 我要完成 ${course.task}`,
        `就 做一个最小版本并写下复盘`
      ],
      guide: {
        title: `${course.id} 工作室任务：${course.title}`,
        badge: "Studio",
        goal: `形成“会定位、会求助、会设计、会展示”的完整工作流。`,
        observe: `先把这节课要解决的问题或要完成的目标说清楚。`,
        experiment: `先做最小版本，再决定要不要向 AI 求助或继续打磨。`,
        checkpoint: `出口自测：能讲清问题、修改、结果和下一步。`
      },
      phaseExperiments: {
        discover: `先试运行，写下这节课最核心的问题或目标。`,
        build: `接上最关键的一条规则或设计决定，先形成最小版本。`,
        verify: `再试运行，确认你已经能展示“${course.product}”并解释它。`
      },
      phaseHints: {
        discover: `先把问题或目标讲清楚，再决定要不要问 AI。`,
        build: `别一上来就打磨细节，先做出能验证的最小版本。`,
        verify: `工作室任务已启动。现在请用结果证明你的规则或设计选择是有效的。`
      },
      completionMessage: `${course.id} 完成：你已经把这节课做成了一个可展示、可解释的规则作品。`,
      code: {
        rule: `当 我说清目标或问题
如果 目标是 ${course.task}
就 先做一个最小版本
最后 写下复盘`,
        pseudo: `goal = "${course.task}"
build_small_version(goal)
ask_ai_if_needed()
present("${course.product}")`,
        python: `goal = "${course.task}"

def studio_task():
    build(goal)
    review_with_ai()
    present("${course.product}")`
      }
    };
  }

  if (course.stage === "L2" && module === "M1") {
    return {
      badge: "Prototype Lab",
      button: "启动玩法原型",
      activeButton: "玩法原型已启动",
      statusIdle: "等待原型搭建",
      statusLive: "原型运行中",
      statusWin: "玩法原型完成",
      statLabels: ["控制", "反馈", "目标"],
      statValues: [conceptA, conceptB, course.product],
      intro: `这一课不再只是拼规则，而是开始搭玩法原型。目标是围绕“${course.task}”做出一个能立即体验的最小玩法。`,
      missionCopy: `先找出玩家最先接触到的输入、反馈和目标，再做一个最小原型，完成“${course.product}”。`,
      steps: [
        `明确玩家最先会做什么`,
        `确定最关键的反馈`,
        `接上玩法原型规则`,
        `验证 ${course.product}`
      ],
      slots: [
        `当 玩家进行 ${conceptA}`,
        `如果 目标是：${course.task}`,
        `就 立刻给出 ${conceptB} 和目标反馈`
      ],
      guide: {
        title: `${course.id} 玩法原型：${course.title}`,
        badge: "Prototype",
        goal: `做出一眼就能上手的最小玩法原型。`,
        observe: `先想清玩家第一秒做什么、第二秒看到什么、第三秒为什么想继续玩。`,
        experiment: `先做一个能体验 10-30 秒的最小版本，不追求内容量。`,
        checkpoint: `出口自测：能讲清这节课的输入、反馈和目标循环。`
      },
      phaseExperiments: {
        discover: `先试运行，确认玩家第一步输入、第一眼反馈和短目标是什么。`,
        build: `把玩法原型接上，先做出一个可以立刻体验的核心循环。`,
        verify: `再试运行，确认“${course.product}”已经能在短时间内被感受到。`
      },
      phaseHints: {
        discover: `先抓住“玩家第一秒会做什么”，不要一开始就想完整关卡。`,
        build: `先把核心循环接上，只要能玩起来就够。`,
        verify: `玩法原型已启动。请确认玩家能立刻感受到目标和反馈。`
      },
      completionMessage: `${course.id} 完成：你已经做出了可体验的玩法原型“${course.product}”。`,
      code: {
        rule: `当 玩家开始输入
如果 我要完成 ${course.task}
就 建立最小玩法循环`,
        pseudo: `input = "${conceptA}"
feedback = "${conceptB}"

start_loop(input, feedback, "${course.product}")`,
        python: `def build_prototype():
    read_input("${conceptA}")
    show_feedback("${conceptB}")
    loop_until_goal("${course.task}")`
      }
    };
  }

  if (course.stage === "L2" && module === "M2") {
    return {
      badge: "Systems Lab",
      button: "启动关卡系统",
      activeButton: "关卡系统已启动",
      statusIdle: "等待系统设计",
      statusLive: "系统调校中",
      statusWin: "系统设计完成",
      statLabels: ["地图", "行为", "难度"],
      statValues: [conceptA, conceptB, course.product],
      intro: `这一课把作品从“能玩”推到“有节奏、有策略”。重点是关卡空间、行为系统、道具和难度曲线。`,
      missionCopy: `先找出这节课的系统目标，再接上一条能真正影响体验的系统规则，完成“${course.product}”。`,
      steps: [
        `明确系统要影响什么体验`,
        `找出节奏或空间变化点`,
        `接上系统设计规则`,
        `验证 ${course.product}`
      ],
      slots: [
        `当 关卡进入 ${conceptA} 节点`,
        `如果 目标是：${course.task}`,
        `就 通过 ${conceptB} 改变体验`
      ],
      guide: {
        title: `${course.id} 系统设计：${course.title}`,
        badge: "Systems",
        goal: `让作品不只是能玩，还能形成节奏、策略和难度变化。`,
        observe: `先判断这节课最该变化的是空间、行为、道具还是难度。`,
        experiment: `先改一个最影响体验的系统点，再继续微调。`,
        checkpoint: `出口自测：能解释为什么这条系统规则会让作品更好玩。`
      },
      phaseExperiments: {
        discover: `先试运行，找到最影响体验的一处系统节点。`,
        build: `接上一条系统规则，先看体验有没有明显变化。`,
        verify: `再试运行，确认系统变化不是偶然，而是能稳定影响体验。`
      },
      phaseHints: {
        discover: `先抓最影响体验的一处系统点，不要同时改很多参数。`,
        build: `系统规则接上后，先确认玩家能明显感受到变化。`,
        verify: `关卡系统已启动。请说明它具体改变了什么体验。`
      },
      completionMessage: `${course.id} 完成：你已经把关卡或系统设计推进成了真正影响体验的版本。`,
      code: {
        rule: `当 关卡或系统进入一个节点
如果 目标是 ${course.task}
就 用一条设计规则改变体验`,
        pseudo: `system_point = "${conceptA}"
effect = "${conceptB}"

apply_design(system_point, effect)`,
        python: `def tune_system():
    focus = "${course.task}"
    adjust("${conceptA}", "${conceptB}")
    verify(focus)`
      }
    };
  }

  if (course.stage === "L2" && module === "M3") {
    return {
      badge: "Code Lab",
      button: "开启代码过渡",
      activeButton: "代码过渡已启动",
      statusIdle: "等待读码",
      statusLive: "代码验证中",
      statusWin: "代码过渡完成",
      statLabels: ["规则", "代码", "验证"],
      statValues: [conceptA, conceptB, course.product],
      intro: `这一课开始从规则编辑器过渡到伪代码、真实代码和 AI 协作。重点是把玩法和代码对应起来，而不是死记语法。`,
      missionCopy: `先说清这节课的规则含义，再读一段代码、做一次修改或验证，完成“${course.product}”。`,
      steps: [
        `说清玩法规则`,
        `标出代码里对应位置`,
        `完成一次修改或验证`,
        `留下 ${course.product}`
      ],
      slots: [
        `当 我读到一段代码`,
        `如果 它影响 ${course.task}`,
        `就 标出规则、变量或函数的对应关系`
      ],
      guide: {
        title: `${course.id} 代码实验：${course.title}`,
        badge: "Code",
        goal: `学会把规则翻成代码，再把代码翻回玩法解释。`,
        observe: `先判断这节课最关键的是规则、变量、条件还是函数。`,
        experiment: `先做一次最小改动或标注，再验证它真的影响玩法。`,
        checkpoint: `出口自测：能解释“这段代码为什么会改变作品结果”。`
      },
      phaseExperiments: {
        discover: `先试运行，想一想哪一段规则最值得翻成代码。`,
        build: `接上代码过渡任务，先做一次最小标注或最小修改。`,
        verify: `再试运行，确认你能把玩法和代码一一对应讲清。`
      },
      phaseHints: {
        discover: `先把玩法说清楚，再去看代码，顺序不要反。`,
        build: `代码过渡已开始，先做一次最小修改或标注，不要急着重写。`,
        verify: `代码过渡已启动。请确认你能证明代码和结果之间的关系。`
      },
      completionMessage: `${course.id} 完成：你已经把玩法规则、代码片段和验证结果连起来了。`,
      code: {
        rule: `当 我要理解一段代码
先 说清它对应哪条规则
再 标出变量、条件或函数
最后 运行验证`,
        pseudo: `rule = "${course.task}"
code_map = ["${conceptA}", "${conceptB}", "${conceptC}"]

read(code_map)
verify(rule)`,
        python: `rule = "${course.task}"

def inspect_code():
    map_rule_to_code(rule)
    run_test()
    verify_result()`
      }
    };
  }

  return {
    badge: "Project Lab",
    button: "启动毕业项目",
    activeButton: "毕业项目已启动",
    statusIdle: "等待立项",
    statusLive: "项目推进中",
    statusWin: "项目原型完成",
    statLabels: ["范围", "原型", "展示"],
    statValues: [conceptA, conceptB, course.product],
    intro: `这一课进入毕业项目阶段。重点是把范围、原型、测试、展示和 AI 协作串成一条完整项目链。`,
    missionCopy: `先确认项目范围，再做一个最小可展示版本，最后把“${course.product}”包装成能说明白的成果。`,
    steps: [
      `确认项目范围和目标`,
      `产出最小原型或草图`,
      `推进关键系统或内容`,
      `完成展示与复盘`
    ],
    slots: [
      `当 我要推进毕业项目`,
      `如果 当前目标是：${course.task}`,
      `就 先完成最小版本，再准备展示`
    ],
    guide: {
      title: `${course.id} 项目工坊：${course.title}`,
      badge: "Project",
      goal: `把一个项目从想法推进到可展示成果，而不只是完成单节任务。`,
      observe: `先明确范围：这节课最重要的是选题、原型、开发、测试还是展示。`,
      experiment: `先做能证明方向成立的最小版本，再继续扩展内容。`,
      checkpoint: `出口自测：能说出目标、取舍、证据和下一步。`
    },
    phaseExperiments: {
      discover: `先试运行，确认这节课在项目流程里负责哪一步。`,
      build: `启动项目任务后，先产出最小版本或关键证据。`,
      verify: `再试运行，确认你已经能展示“${course.product}”并解释取舍。`
    },
    phaseHints: {
      discover: `先收范围，不要一开始就把项目做得太大。`,
      build: `项目任务启动后，先拿出能证明方向成立的最小证据。`,
      verify: `毕业项目已启动。现在请确认你已经有能展示、能复盘的成果。`
    },
    completionMessage: `${course.id} 完成：你已经把项目推进到了“${course.product}”这一步，并留下了展示证据。`,
    code: {
      rule: `当 我要推进毕业项目
先 明确范围和目标
再 完成最小原型
最后 准备展示和复盘`,
      pseudo: `scope = "${course.task}"
artifact = "${course.product}"

plan(scope)
build(artifact)
present(artifact)`,
      python: `scope = "${course.task}"

def ship_project():
    plan(scope)
    build("${course.product}")
    present("${course.product}")`
    }
  };
}

function createCurriculumLesson(course) {
  const stage = course.stageMeta || curriculum.getStage(course.stage);
  const profile = curriculumProfile(course);
  const lessonNumber = String(course.stageIndex).padStart(2, "0");
  const stageTitle = `${course.stage} · ${stage.title}`;

  return {
    eyebrow: `${stageTitle} · 第 ${lessonNumber} 课`,
    heading: course.title,
    badge: profile.badge,
    intro: profile.intro,
    missionTitle: `本课任务：${course.task}`,
    missionCopy: profile.missionCopy,
    button: profile.button,
    activeButton: profile.activeButton,
    statusIdle: profile.statusIdle,
    statusLive: profile.statusLive,
    statusWin: profile.statusWin,
    statLabels: profile.statLabels,
    statValues: profile.statValues,
    steps: profile.steps,
    slots: profile.slots,
    guide: profile.guide,
    phaseExperiments: profile.phaseExperiments,
    phaseHints: profile.phaseHints,
    completionMessage: profile.completionMessage,
    code: profile.code
  };
}

if (curriculum) {
  curriculum.courses.forEach((course) => {
    if (!course.playableLesson) {
      lessons[course.id] = createCurriculumLesson(course);
    }
  });
}

function getActiveCourse() {
  if (!curriculum) {
    return null;
  }
  return curriculum.getCourse(state.courseId);
}

function isPlayableLesson() {
  return Number.isInteger(state.lesson);
}

function lessonKeyForCourse(course) {
  return course && course.playableLesson ? course.playableLesson : course.id;
}

const state = {
  lesson: 1,
  courseId: "L0-01",
  route: "shooter",
  codeMode: "rule",
  ruleFixed: false,
  ruleStage: 0,
  completed: false,
  completedSteps: new Set(),
  activity: null,
  observedIssue: false,
  observedKeys: new Set(),
  width: 960,
  height: 540,
  keys: new Set(),
  keyLocks: {},
  particles: [],
  stars: [],
  items: [],
  enemies: [],
  bullets: [],
  spawned: 0,
  score: 0,
  displayScore: 0,
  hp: 3,
  collisionCount: 0,
  bulletCooldown: 0,
  spawnClock: 0,
  spawnCountdown: 90,
  skillCooldown: 0,
  skillUses: 0,
  skillEnergy: 3,
  finalStarted: false,
  player: {
    x: 88,
    y: 270,
    vx: 0,
    vy: 0,
    size: 34,
    grounded: false,
    shield: 0
  }
};

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(640, Math.floor(rect.width * ratio));
  canvas.height = Math.max(360, Math.floor(rect.height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  state.width = rect.width;
  state.height = rect.height;
  createStars();
  resetGame(false);
}

function createStars() {
  state.stars = Array.from({ length: 90 }, (_, index) => ({
    x: Math.random() * state.width,
    y: Math.random() * state.height,
    r: index % 8 === 0 ? 2.1 : Math.random() * 1.7 + 0.6,
    speed: Math.random() * 0.42 + 0.08,
    alpha: Math.random() * 0.55 + 0.25
  }));
}

function applyLessonContent() {
  const lesson = lessons[state.lesson] || lessons[1];
  const course = getActiveCourse();
  const stage = course ? course.stageMeta : null;
  dom.lessonEyebrow.textContent = course
    ? `${course.id} · ${stage.title}${course.playableLesson ? " · 可玩原型" : ""}`
    : lesson.eyebrow;
  dom.lessonHeading.textContent = course ? course.title : lesson.heading;
  dom.lessonIntro.textContent = lesson.intro;
  dom.routeTitle.textContent = isPlayableLesson() ? routes[state.route].title : `${stage.title} · ${lesson.badge}`;
  dom.missionTitle.textContent = lesson.missionTitle;
  dom.missionCopy.textContent = lesson.missionCopy;
  renderLessonSteps(lesson);
  [dom.statLabel1, dom.statLabel2, dom.statLabel3].forEach((node, index) => {
    node.textContent = lesson.statLabels[index];
  });
  updateRuleSlots();
  updateGuide();
  renderStudentActivity();
  updateRuleButton();
  dom.gameHint.textContent = getCurrentHint();
  updateCode();
  updateStats();
}

function renderLessonSteps(lesson) {
  const steps = Array.isArray(lesson.steps) && lesson.steps.length
    ? lesson.steps
    : ["理解本课目标", "观察作品现象", "完成最小作品证据", "复盘并保存成果"];

  dom.progressList.innerHTML = "";
  steps.forEach((step, index) => {
    const item = document.createElement("div");
    const number = document.createElement("span");
    const text = document.createElement("p");

    item.className = "progress-item";
    item.dataset.step = String(index + 1);
    item.classList.toggle("is-done", state.completedSteps.has(String(index + 1)));
    number.textContent = String(index + 1);
    text.textContent = step;
    item.append(number, text);
    dom.progressList.appendChild(item);
  });
}

function activeCourseId() {
  const course = getActiveCourse();
  return course ? course.id : String(state.lesson);
}

function currentHandsOnActivity() {
  return handsOnActivities[activeCourseId()] || null;
}

function isHandsOnCourse() {
  return Boolean(currentHandsOnActivity());
}

function ensureActivityState(reset = false) {
  const definition = currentHandsOnActivity();
  if (!definition) {
    state.activity = null;
    return null;
  }

  if (reset || !state.activity || state.activity.courseId !== activeCourseId()) {
    state.activity = {
      courseId: activeCourseId(),
      selections: {},
      metrics: {},
      notes: {},
      feedback: "先完成观察，再在操作台做选择。"
    };
  }

  definition.groups.forEach((group) => {
    if (!state.activity.selections[group.id]) {
      state.activity.selections[group.id] = [];
    }
  });

  definition.playChecks.forEach((check) => {
    if (state.activity.metrics[check.id] === undefined) {
      state.activity.metrics[check.id] = 0;
    }
  });

  const pack = lessonWorkPacks[activeCourseId()];
  if (pack) {
    pack.notebook.forEach((prompt) => {
      if (state.activity.notes[prompt.id] === undefined) {
        state.activity.notes[prompt.id] = "";
      }
    });
  }

  return state.activity;
}

function renderStudentActivity() {
  const definition = currentHandsOnActivity();
  const activity = ensureActivityState(false);
  const pack = lessonWorkPacks[activeCourseId()];

  if (!definition || !activity) {
    dom.studentActivity.hidden = true;
    dom.studentActivity.innerHTML = "";
    return;
  }

  const materialMarkup = pack ? pack.materials.map((item) => (
    `<li>${escapeHtml(item)}</li>`
  )).join("") : "";

  const taskMarkup = pack ? pack.taskCards.map((card, index) => `
    <article class="activity-task-card">
      <span>${index + 1}</span>
      <strong>${escapeHtml(card.title)}</strong>
      <p>${escapeHtml(card.body)}</p>
    </article>
  `).join("") : "";

  const groupMarkup = definition.groups.map((group) => {
    const selected = new Set(activity.selections[group.id] || []);
    const choices = group.choices.map((choice) => {
      const isSelected = selected.has(choice.id) ? " is-selected" : "";
      return `
        <button class="activity-choice${isSelected}" type="button" data-activity-group="${group.id}" data-activity-choice="${choice.id}" aria-pressed="${selected.has(choice.id)}">
          ${escapeHtml(choice.label)}
        </button>
      `;
    }).join("");

    const isDone = activityGroupComplete(group) ? " is-done" : "";
    return `
      <div class="activity-group${isDone}">
        <div class="activity-group-head">
          <strong>${escapeHtml(group.label)}</strong>
          <span>${activityGroupProgress(group)}</span>
        </div>
        <div class="activity-choices">${choices}</div>
      </div>
    `;
  }).join("");

  const evidenceMarkup = activityEvidenceItems(definition).map((item) => {
    const isDone = item.done ? " is-done" : "";
    return `<span class="activity-evidence-pill${isDone}">${escapeHtml(item.label)}</span>`;
  }).join("");

  const notebookMarkup = pack ? pack.notebook.map((prompt) => {
    const value = activity.notes[prompt.id] || "";
    const isDone = value.trim().length >= prompt.minLength ? " is-done" : "";
    return `
      <label class="activity-note${isDone}">
        <span>${escapeHtml(prompt.label)} · ${Math.min(value.trim().length, prompt.minLength)}/${prompt.minLength}</span>
        <textarea data-activity-note="${prompt.id}" rows="3" placeholder="${escapeHtml(prompt.placeholder)}">${escapeHtml(value)}</textarea>
      </label>
    `;
  }).join("") : "";

  dom.studentActivity.hidden = false;
  dom.studentActivity.innerHTML = `
    <div class="activity-head">
      <div>
        <p class="section-kicker">学生操作台</p>
        <h3>${escapeHtml(definition.title)}</h3>
      </div>
      <span>${escapeHtml(definition.badge)}</span>
    </div>
    <p class="activity-prompt">${escapeHtml(definition.prompt)}</p>
    ${pack ? `
      <div class="activity-materials">
        <strong>课堂材料</strong>
        <ul>${materialMarkup}</ul>
      </div>
      <div class="activity-task-cards">${taskMarkup}</div>
    ` : ""}
    <div class="activity-groups">${groupMarkup}</div>
    ${pack ? `
      <div class="activity-notebook">
        <strong>学生学习单</strong>
        ${notebookMarkup}
      </div>
    ` : ""}
    <div class="activity-evidence">${evidenceMarkup}</div>
    <p class="activity-feedback">${escapeHtml(activity.feedback)}</p>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function activityGroupProgress(group) {
  const selected = state.activity && state.activity.selections[group.id]
    ? state.activity.selections[group.id].length
    : 0;
  return `${selected}/${group.limit}`;
}

function activityGroupComplete(group) {
  if (!state.activity) {
    return false;
  }

  const selected = new Set(state.activity.selections[group.id] || []);
  const correct = group.choices.filter((choice) => choice.correct).map((choice) => choice.id);

  if (selected.size !== group.limit) {
    return false;
  }

  return correct.every((id) => selected.has(id))
    && [...selected].every((id) => group.choices.find((choice) => choice.id === id && choice.correct));
}

function activityRuleReady() {
  const definition = currentHandsOnActivity();
  return Boolean(definition && definition.groups.every(activityGroupComplete));
}

function activityEvidenceItems(definition) {
  const pack = lessonWorkPacks[activeCourseId()];
  const groupItems = definition.groups.map((group) => ({
    label: `${group.label} ${activityGroupComplete(group) ? "完成" : "未完成"}`,
    done: activityGroupComplete(group)
  }));

  const playItems = definition.playChecks.map((check) => {
    const value = Number(state.activity && state.activity.metrics[check.id] || 0);
    return {
      label: `${check.label} ${Math.min(value, check.target)}/${check.target}`,
      done: value >= check.target
    };
  });

  const noteItems = pack ? pack.notebook.map((prompt) => {
    const value = state.activity && state.activity.notes[prompt.id] || "";
    return {
      label: `${prompt.label} ${Math.min(value.trim().length, prompt.minLength)}/${prompt.minLength}`,
      done: value.trim().length >= prompt.minLength
    };
  }) : [];

  return groupItems.concat(playItems, noteItems);
}

function activityPlayReady() {
  const definition = currentHandsOnActivity();
  if (!definition || !state.activity) {
    return false;
  }

  return definition.playChecks.every((check) => Number(state.activity.metrics[check.id] || 0) >= check.target);
}

function activityNotebookReady() {
  const pack = lessonWorkPacks[activeCourseId()];
  if (!pack || !state.activity) {
    return true;
  }

  return pack.notebook.every((prompt) => {
    const value = state.activity.notes[prompt.id] || "";
    return value.trim().length >= prompt.minLength;
  });
}

function handleActivityNote(noteId, value) {
  const activity = ensureActivityState(false);
  const pack = lessonWorkPacks[activeCourseId()];
  if (!activity || !pack) {
    return;
  }

  activity.notes[noteId] = value;
  const prompt = pack.notebook.find((item) => item.id === noteId);
  if (prompt) {
    const length = value.trim().length;
    activity.feedback = length >= prompt.minLength
      ? `“${prompt.label}”已经留下文字证据。`
      : `“${prompt.label}”还需要更具体一点：至少 ${prompt.minLength} 个字。`;
  }

  markStep(5, activityNotebookReady());
  renderStudentActivity();
  updateGuide();
  updateStats();
  maybeCompleteHandsOnActivity();
}

function handleActivityChoice(groupId, choiceId) {
  const definition = currentHandsOnActivity();
  const activity = ensureActivityState(false);
  if (!definition || !activity) {
    return;
  }

  const group = definition.groups.find((item) => item.id === groupId);
  if (!group) {
    return;
  }

  const selected = new Set(activity.selections[group.id] || []);
  if (selected.has(choiceId)) {
    selected.delete(choiceId);
  } else {
    if (group.limit === 1) {
      selected.clear();
    }
    if (selected.size < group.limit) {
      selected.add(choiceId);
    }
  }

  activity.selections[group.id] = [...selected];
  const choice = group.choices.find((item) => item.id === choiceId);

  if (activityGroupComplete(group)) {
    activity.feedback = `“${group.label}”已经选对了。继续完成下一项，别急着点完成。`;
  } else if (choice && !choice.correct) {
    activity.feedback = `“${choice.label}”不能支撑这节课的规则，请换一个能被运行结果验证的选项。`;
  } else {
    activity.feedback = `已记录选择。这个小组需要选满 ${group.limit} 项，并且都要能解释游戏结果。`;
  }

  if (activityRuleReady()) {
    markStep(2, true);
    pulseHint("规则部件已经拼对。现在点左侧主按钮启动规则，然后到画布里完成试玩证据。");
  }

  renderStudentActivity();
  updateGuide();
  updateStats();
  maybeCompleteHandsOnActivity();
}

function recordActivityMetric(metricId, amount = 1, message = "") {
  const activity = ensureActivityState(false);
  if (!activity) {
    return;
  }

  activity.metrics[metricId] = Number(activity.metrics[metricId] || 0) + amount;
  if (message) {
    activity.feedback = message;
    pulseHint(message);
  }

  markStep(4, activityPlayReady());
  renderStudentActivity();
  updateGuide();
  updateStats();
  maybeCompleteHandsOnActivity();
}

function maybeCompleteHandsOnActivity() {
  const definition = currentHandsOnActivity();
  if (!definition || state.completed || !state.ruleFixed) {
    return;
  }

  if (activityRuleReady() && activityPlayReady() && activityNotebookReady()) {
    completeLesson(definition.completeMessage);
  }
}

function updateGuide() {
  const lesson = lessons[state.lesson];
  const guide = !isPlayableLesson() && lesson && lesson.guide
    ? lesson.guide
    : selfGuides[state.lesson] || selfGuides.default;
  dom.guideTitle.textContent = guide.title;
  dom.guideBadge.textContent = guide.badge;
  dom.guideGoal.textContent = guide.goal;
  dom.guideObserve.textContent = guide.observe;
  dom.guideExperiment.textContent = getGuideExperimentText(guide);
  dom.guideCheckpoint.textContent = guide.checkpoint;
}

function updateRuleSlots() {
  const lesson = lessons[state.lesson];
  let slots = lesson.slots;

  if (state.lesson === 1) {
    const staged = [
      ["按下方向键 / WASD", "只侦测事件，不移动", "记录按键方向"],
      ["按左/右键", "方向是 left 或 right", "改变 x 坐标"],
      ["按上/下/跳跃", "方向是 up/down 或 jump", "改变 y 坐标"],
      ["按任意方向键", "方向有效且角色未锁定", "按 speed 改变 x/y"]
    ];
    slots = staged[state.ruleStage] || lesson.slots;
  }

  if (state.lesson === 2) {
    const staged = [
      ["玩家碰到收集物", "还没有 score 更新规则", "先观察不计分现象"],
      ["玩家碰到收集物", "物品未收集", "score 增加，但 UI 暂不刷新"],
      ["score 发生变化", "屏幕分数不是最新", "刷新 UI 显示"],
      ["玩家碰到收集物", "物品未收集，且只加一次", "score 增加并刷新 UI"]
    ];
    slots = staged[state.ruleStage] || lesson.slots;
  }

  [dom.eventSlot, dom.conditionSlot, dom.actionSlot].forEach((node, index) => {
    node.textContent = slots[index];
  });
}

function getGuideExperimentText(guide) {
  if (isHandsOnCourse()) {
    if (!activityRuleReady()) {
      return "学生必须先在操作台做选择，选错可以修改；只有能解释运行结果的规则部件才算有效。";
    }
    if (!state.ruleFixed) {
      return "规则部件已完成，下一步是启动规则，让学生到画布里亲自测试。";
    }
    if (!activityPlayReady()) {
      return "现在不要继续点按钮，请用键盘或触屏完成画布里的试玩证据。";
    }
    if (!activityNotebookReady()) {
      return "试玩证据已经有了，还需要在学生学习单里写下观察、设计和测试结论。";
    }
    return "试玩证据已完整，请让学生说出自己的操作、观察到的反馈和规则结论。";
  }

  if (!isPlayableLesson()) {
    const lesson = lessons[state.lesson];
    if (lesson && lesson.phaseExperiments) {
      if (!state.observedIssue) {
        return lesson.phaseExperiments.discover;
      }
      if (!state.ruleFixed) {
        return lesson.phaseExperiments.build;
      }
      return lesson.phaseExperiments.verify;
    }
  }

  if (state.lesson === 1) {
    const stageText = [
      "第 1 步：先按两个不同方向键，不要点修复。你要先证明“事件被听见，但坐标没变”。",
      "第 2 步：现在只连了左右移动。按左/右，看 x 坐标；按上/下，应该还不能完整移动。",
      "第 3 步：上下/跳跃也接上了。继续按不同方向，观察 x/y 分别怎么变。",
      "第 4 步：速度已校准。去到达目标，然后用自己的话复盘事件链。"
    ];
    return stageText[state.ruleStage] || guide.experiment;
  }

  if (state.lesson === 2) {
    const stageText = [
      "第 1 步：先收集一个物品，看变量 score 和屏幕分数都不变，确认问题。",
      "第 2 步：现在只连接 score 变量。收集物品后，变量会变，但屏幕分数还不会同步。",
      "第 3 步：现在同步 UI。继续收集，观察变量 score 和屏幕分数是否一致。",
      "第 4 步：完整计分规则已连接。收集全部目标，并解释为什么不能重复加分。"
    ];
    return stageText[state.ruleStage] || guide.experiment;
  }

  return guide.experiment;
}

function updateRuleButton() {
  const lesson = lessons[state.lesson];
  const stagedButtons = {
    1: ["先连接左右移动", "再连接上下/跳跃", "校准速度并完成规则", lesson.activeButton],
    2: ["先记录 score 变量", "同步屏幕分数 UI", "启用防重复计分", lesson.activeButton]
  };

  if (stagedButtons[state.lesson]) {
    dom.applyRuleBtn.textContent = stagedButtons[state.lesson][state.ruleStage] || lesson.activeButton;
    dom.applyRuleBtn.classList.toggle("is-applied", state.ruleFixed);
    return;
  }

  dom.applyRuleBtn.textContent = state.ruleFixed ? lesson.activeButton : lesson.button;
  dom.applyRuleBtn.classList.toggle("is-applied", state.ruleFixed);
}

function getCurrentHint() {
  const lesson = lessons[state.lesson];

  if (isHandsOnCourse()) {
    if (!state.observedIssue) {
      return "先试玩或观察，再到学生操作台完成规则选择。";
    }
    if (!activityRuleReady()) {
      return "请在学生操作台里选出能解释运行结果的规则部件。";
    }
    if (!state.ruleFixed) {
      return "规则选择已完成。现在启动规则，再用键盘或触屏完成试玩证据。";
    }
    if (!activityPlayReady()) {
      return "规则已启动。继续在画布里操作，直到试玩证据全部完成。";
    }
    if (!activityNotebookReady()) {
      return "试玩证据已完成。请把观察、设计和测试结论写进学生学习单。";
    }
    return "试玩证据完整。现在可以复盘：我做了什么、看到了什么、规则如何改变结果。";
  }

  if (!isPlayableLesson() && lesson && lesson.phaseHints) {
    if (!state.observedIssue) {
      return lesson.phaseHints.discover;
    }
    if (!state.ruleFixed) {
      return lesson.phaseHints.build;
    }
    return lesson.phaseHints.verify;
  }

  if (state.lesson === 1 && !state.ruleFixed) {
    const stageHints = [
      lesson.hintLocked[state.route],
      "只连接了左右移动。测试左/右键，看 x 坐标；再按上/下，想想为什么 y 还不变。",
      "上下/跳跃也接上了。现在对比 x/y 和速度，准备完成最后校准。",
      lesson.hintLive[state.route]
    ];
    return stageHints[state.ruleStage] || lesson.hintLocked[state.route];
  }

  if (state.lesson === 2 && !state.ruleFixed) {
    const stageHints = [
      lesson.hintLocked[state.route],
      "score 变量已连接，但屏幕分数还没同步。收集一个物品，观察两个数字是否一致。",
      "UI 同步已连接。继续收集，并确认同一个物品不会重复加分。",
      lesson.hintLive[state.route]
    ];
    return stageHints[state.ruleStage] || lesson.hintLocked[state.route];
  }

  return state.ruleFixed ? lesson.hintLive[state.route] : lesson.hintLocked[state.route];
}

function resetGame(resetProgress = true) {
  if (state.route === "shooter") {
    state.player = { x: 82, y: state.height * 0.5, vx: 0, vy: 0, size: 34, grounded: false, shield: 0 };
  } else {
    state.player = {
      x: 74,
      y: Math.max(180, state.height - 94),
      vx: 0,
      vy: 0,
      size: 38,
      grounded: true,
      shield: 0
    };
  }

  state.particles = [];
  state.items = [];
  state.enemies = [];
  state.bullets = [];
  state.keyLocks = {};
  state.completed = false;
  state.observedIssue = false;
  state.observedKeys = new Set();
  state.score = 0;
  state.displayScore = 0;
  state.hp = 3;
  state.collisionCount = 0;
  state.bulletCooldown = 0;
  state.spawned = 0;
  state.spawnClock = 0;
  state.spawnCountdown = 90;
  state.skillCooldown = 0;
  state.skillUses = 0;
  state.skillEnergy = 3;
  state.finalStarted = false;
  ensureActivityState(resetProgress);

  setupLessonObjects();
  setupHandsOnObjects();

  if (resetProgress) {
    state.ruleFixed = false;
    state.ruleStage = 0;
    dom.applyRuleBtn.classList.remove("is-applied");
    markAllSteps(false);
    setStatus(lessons[state.lesson].statusIdle, "");
  }

  applyLessonContent();
}

function setupLessonObjects() {
  if (state.lesson === 2) {
    state.items = createCollectibles(3);
  }

  if (state.lesson === 3) {
    if (state.route === "shooter") {
      state.enemies = [{ x: state.width * 0.72, y: state.height * 0.5, hp: 1, alive: true, value: 20, radius: 28, vx: 0 }];
    } else {
      state.enemies = [{ x: state.width * 0.58, y: state.height - 88, hp: 1, alive: true, value: 1, radius: 26, vx: 0 }];
      state.items = [{ x: state.width * 0.78, y: state.height - 192, value: 2, collected: false }];
    }
  }

  if (state.lesson === 5) {
    state.enemies = state.route === "shooter"
      ? [{ x: state.width * 0.74, y: state.height * 0.5, hp: 3, alive: true, value: 10, radius: 30, vx: 0 }]
      : [];
  }

  if (state.lesson === 6) {
    state.items = createCollectibles(state.route === "shooter" ? 2 : 4);
    state.enemies = state.route === "shooter"
      ? [{ x: state.width * 0.72, y: state.height * 0.4, hp: 2, alive: true, value: 20, radius: 28, vx: -0.35 }]
      : [{ x: state.width * 0.62, y: state.height - 88, hp: 1, alive: true, value: 1, radius: 26, vx: -0.45 }];
  }
}

function setupHandsOnObjects() {
  const courseId = activeCourseId();

  if (!handsOnActivities[courseId]) {
    return;
  }

  if (courseId === "L1-03") {
    if (state.route === "shooter") {
      state.enemies = [
        { x: state.width * 0.7, y: state.height * 0.42, hp: 1, alive: true, value: 1, radius: 28, vx: 0, role: "reward" },
        { x: state.width * 0.8, y: state.height * 0.68, hp: 999, alive: true, value: 0, radius: 30, vx: 0, role: "hazard" }
      ];
    } else {
      state.items = [{ x: state.width * 0.54, y: platformGroundY() - 86, value: 1, collected: false, role: "reward" }];
      state.enemies = [{ x: state.width * 0.76, y: platformGroundY() - 26, hp: 1, alive: true, value: 0, radius: 26, vx: 0, role: "hazard" }];
    }
  }

  if (courseId === "L2-01") {
    state.items = [
      { x: state.width * 0.48, y: state.route === "shooter" ? state.height * 0.36 : platformGroundY() - 104, value: 1, collected: false, role: "loop" },
      { x: state.width * 0.78, y: state.route === "shooter" ? state.height * 0.64 : platformGroundY() - 178, value: 1, collected: false, role: "loop" }
    ];
  }

  if (courseId === "L2-03") {
    state.skillEnergy = 2;
    state.skillCooldown = 0;
  }
}

function createCollectibles(count) {
  if (state.route === "shooter") {
    return Array.from({ length: count }, (_, index) => ({
      x: state.width * (0.32 + index * 0.22),
      y: state.height * (index % 2 === 0 ? 0.32 : 0.64),
      value: 10,
      collected: false
    }));
  }

  const spots = [
    { x: state.width * 0.31, y: state.height - 190 },
    { x: state.width * 0.57, y: state.height - 262 },
    { x: state.width * 0.78, y: state.height - 192 },
    { x: state.width * 0.86, y: state.height - 95 }
  ];
  return spots.slice(0, count).map((spot) => ({ ...spot, value: 1, collected: false }));
}

function setStatus(text, mode) {
  dom.runStatus.textContent = text;
  dom.runStatus.classList.remove("is-live", "is-win");
  if (mode) {
    dom.runStatus.classList.add(mode);
  }
}

function markStep(step, done = true) {
  const stepKey = String(step);
  const item = document.querySelector(`[data-step="${step}"]`);
  if (done) {
    state.completedSteps.add(stepKey);
  } else {
    state.completedSteps.delete(stepKey);
  }
  if (item) {
    item.classList.toggle("is-done", done);
  }
}

function markAllSteps(done = true) {
  document.querySelectorAll("[data-step]").forEach((item) => {
    if (done) {
      state.completedSteps.add(item.dataset.step);
    } else {
      state.completedSteps.delete(item.dataset.step);
    }
    item.classList.toggle("is-done", done);
  });

  if (!done) {
    state.completedSteps.clear();
  }
}

function updateCode() {
  dom.codeView.textContent = lessons[state.lesson].code[state.codeMode];
}

function addAiMessage(text, role = "ai") {
  const node = document.createElement("div");
  node.className = `message ${role}`;
  node.textContent = text;
  dom.chatWindow.appendChild(node);
  dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;
}

function pulseHint(text) {
  dom.gameHint.textContent = text;
  dom.gameHint.classList.remove("pulse");
  window.requestAnimationFrame(() => {
    dom.gameHint.classList.add("pulse");
  });
}

function enableRule() {
  const lesson = lessons[state.lesson];

  if (!isPlayableLesson()) {
    const course = getActiveCourse();
    if (isHandsOnCourse()) {
      const definition = currentHandsOnActivity();
      const activity = ensureActivityState(false);

      if (!state.observedIssue) {
        state.observedIssue = true;
        markStep(1, true);
        activity.feedback = "已完成第一轮观察。现在请在学生操作台做选择，选择错了也可以改。";
        pulseHint("先别完成课程。请在学生操作台做选择，拼出这节课的规则证据。");
        renderStudentActivity();
        addAiMessage(course
          ? `已记录 ${course.id} 的观察。下一步不是继续点按钮，而是让学生在操作台完成选择。`
          : "已记录观察。下一步请在操作台完成选择。");
        return;
      }

      if (!activityRuleReady()) {
        activity.feedback = "还不能启动规则：学生操作台里的选择没有完成，或有选项不能解释运行结果。";
        renderStudentActivity();
        pulseHint("还不能启动。请先让学生完成操作台里的规则选择。");
        return;
      }

      if (state.ruleFixed) {
        pulseHint(activityPlayReady() && activityNotebookReady()
          ? "试玩和学习单证据已经完成，课程会自动保存成果。"
          : activityPlayReady()
            ? "试玩证据已经完成。还需要填写学生学习单，写下观察、设计和测试结论。"
          : "规则已启动。现在要在画布里完成试玩动作，而不是继续点按钮。");
        return;
      }

      state.ruleFixed = true;
      dom.applyRuleBtn.textContent = lesson.activeButton;
      dom.applyRuleBtn.classList.add("is-applied");
      markStep(3, true);
      setStatus(lesson.statusLive, "is-live");
      activity.feedback = definition.playChecks.length
        ? "规则已启动。现在请用键盘或触屏在画布里完成试玩证据。"
        : "规则已启动。检查证据是否完整，系统会自动保存。";
      pulseHint(activity.feedback);
      renderStudentActivity();
      updateGuide();
      addAiMessage("规则启动了。接下来必须完成画布里的学生动作证据，不能靠按钮跳过。");
      maybeCompleteHandsOnActivity();
      return;
    }

    if (!state.observedIssue) {
      pulseHint(lesson.phaseHints.discover);
      addAiMessage(course
        ? `先别急着启动。请先试运行 ${course.id}《${course.title}》，把第一眼观察到的现象记下来。`
        : "先别急着启动。请先试运行，记录第一眼观察到的现象。");
      return;
    }

    if (state.ruleFixed) {
      pulseHint(lesson.phaseHints.verify);
      return;
    }

    state.ruleFixed = true;
    dom.applyRuleBtn.textContent = lesson.activeButton;
    dom.applyRuleBtn.classList.add("is-applied");
    markStep(3, true);
    setStatus(lesson.statusLive, "is-live");
    pulseHint(lesson.phaseHints.verify);
    addAiMessage(getRuleAppliedReply());
    updateGuide();
    return;
  }

  if (state.lesson === 1) {
    advanceControlRule();
    return;
  }

  if (state.lesson === 2) {
    advanceScoreRule();
    return;
  }

  if (state.ruleFixed) {
    pulseHint(lessons[state.lesson].hintLive[state.route]);
    return;
  }

  state.ruleFixed = true;
  dom.applyRuleBtn.textContent = lesson.activeButton;
  dom.applyRuleBtn.classList.add("is-applied");
  markStep(3, true);
  setStatus(lesson.statusLive, "is-live");
  pulseHint(lesson.hintLive[state.route]);

  if (state.lesson === 6) {
    state.finalStarted = true;
    markStep(1, true);
  }

  if (state.lesson === 4) {
    state.spawnClock = 0;
    state.spawnCountdown = 90;
  }

  addAiMessage(getRuleAppliedReply());
}

function advanceControlRule() {
  if (state.ruleFixed) {
    pulseHint(lessons[1].hintLive[state.route]);
    return;
  }

  if (state.ruleStage === 0 && state.observedKeys.size < 2) {
    pulseHint("先按两个不同方向键，证明系统听见了事件。别急，工程师第一步是观察。");
    addAiMessage("先别点修复。请按两个不同方向键，然后看统计区：X/Y 没变，但 AI 会记录你的输入事件。");
    return;
  }

  state.ruleStage += 1;
  setStatus(lessons[1].statusLive, "is-live");

  if (state.ruleStage === 1) {
    markStep(2, true);
    pulseHint("已连接左右移动。现在只按左/右，观察 x 坐标怎么变；再按上/下，对比差异。");
    addAiMessage("很好，现在我们只修了一半：左右键会改变 x 坐标。请先验证“x 变，y 不变”。");
  } else if (state.ruleStage === 2) {
    markStep(3, true);
    pulseHint("已连接上下/跳跃。现在测试不同方向，确认 x 和 y 分别由哪些键控制。");
    addAiMessage("第二条规则接上了。现在你要能说出：左右改 x，上下或跳跃改 y。");
  } else {
    state.ruleStage = 3;
    state.ruleFixed = true;
    markStep(3, true);
    pulseHint(lessons[1].hintLive[state.route]);
    addAiMessage("控制链路完整了：输入事件、方向判断、坐标变化、速度参数都接起来了。去完成目标吧。");
  }

  updateRuleButton();
  updateRuleSlots();
  updateGuide();
}

function advanceScoreRule() {
  if (state.ruleFixed) {
    pulseHint(lessons[2].hintLive[state.route]);
    return;
  }

  if (state.ruleStage === 0 && !state.observedIssue) {
    pulseHint("先收集一个物品，观察“碰到了但没加分”。先有问题证据，再修规则。");
    addAiMessage(`请先碰一个${routes[state.route].itemName}。如果 score 没变，你就找到了本关要修的第一条规则。`);
    return;
  }

  state.ruleStage += 1;
  setStatus(lessons[2].statusLive, "is-live");

  if (state.ruleStage === 1) {
    markStep(2, true);
    pulseHint("score 变量已连接。下一次收集后，变量会增加，但屏幕分数还不会自动同步。");
    addAiMessage("现在只修了“游戏记忆”：score 变量会变。请观察变量 score 和屏幕分数是否一致。");
  } else if (state.ruleStage === 2) {
    state.displayScore = state.score;
    markStep(3, true);
    pulseHint("屏幕 UI 已同步。现在变量 score 和屏幕分数会保持一致。");
    addAiMessage("很好，UI 刷新接上了。现在请继续收集，并观察变量和屏幕显示是否同步。");
  } else {
    state.ruleStage = 3;
    state.ruleFixed = true;
    state.displayScore = state.score;
    markStep(3, true);
    pulseHint(lessons[2].hintLive[state.route]);
    addAiMessage("完整计分链路已连接：碰撞触发、未收集判断、score 增加、UI 刷新、防重复计分。");
    if (state.displayScore >= lessonTargetScore()) {
      completeLesson(`计分任务完成：score 已经达到 ${lessonTargetScore()}。`);
    }
  }

  updateRuleButton();
  updateRuleSlots();
  updateGuide();
  updateStats();
}

function completeLesson(message) {
  if (state.completed) {
    return;
  }

  const lesson = lessons[state.lesson];
  state.completed = true;
  markAllSteps(true);
  setStatus(lesson.statusWin, "is-win");
  pulseHint(message);
  addAiMessage(`${message} 现在可以用自己的话解释这一关背后的规则了。`);
}

function getRuleAppliedReply() {
  const route = routes[state.route];
  const course = getActiveCourse();
  const replies = {
    1: `连接成功。现在${route.noun}会响应输入事件，目标是${route.targetText[1]}。`,
    2: `score 变量已经接上线了。每次收集${route.itemName}，变量和屏幕数字都会一起变化。`,
    3: "碰撞开关已打开。接下来观察：对象碰到以后，状态会真的改变。",
    4: "生成器开始工作。你会看到系统不等玩家操作，也能按节奏自己执行规则。",
    5: "技能函数已经激活。按 E 触发一组动作，冷却时间会防止无限连发。",
    6: "综合规则启动。现在这已经是一关完整小游戏：移动、得分、碰撞、生成和技能会一起运转。"
  };
  return replies[state.lesson] || (course
    ? `任务已开启。请围绕 ${course.concepts} 做出“${course.product}”，并把关键规则讲清楚。`
    : "任务已开启。先观察、再验证，最后完成复盘。");
}

function observeIssue(text) {
  if (!state.observedIssue) {
    state.observedIssue = true;
    markStep(2, true);
    addAiMessage(text);
  }
  pulseHint(text);
}

function isMoveKey(key) {
  return ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "w", "a", "s", "d", "W", "A", "S", "D"].includes(key);
}

function isSkillKey(key) {
  return key === "e" || key === "E";
}

function keyIsDown(...keys) {
  return keys.some((key) => state.keys.has(key));
}

function consumeKey(...keys) {
  const key = keys.find((candidate) => state.keys.has(candidate));
  if (!key || state.keyLocks[key]) {
    return false;
  }
  state.keyLocks[key] = true;
  return true;
}

function movementEnabled() {
  if (isHandsOnCourse()) {
    return state.ruleFixed && activeCourseId() !== "L1-01";
  }

  if (state.lesson === 1) {
    return state.ruleStage > 0;
  }

  if (state.lesson === 6) {
    return state.ruleFixed;
  }
  return true;
}

function canMoveHorizontal() {
  return state.lesson !== 1 || state.ruleStage >= 1;
}

function canMoveVertical() {
  return state.lesson !== 1 || state.ruleStage >= 2;
}

function controlSpeed() {
  if (state.lesson === 1 && state.ruleStage < 3) {
    return state.route === "shooter" ? 3.4 : 4.1;
  }
  return state.route === "shooter" ? 5.2 : 5.3;
}

function systemsEnabled() {
  if (isHandsOnCourse()) {
    return state.ruleFixed;
  }

  if (state.lesson === 6) {
    return state.ruleFixed && state.finalStarted;
  }
  return state.ruleFixed;
}

function lessonTargetScore() {
  if (state.lesson === 2) {
    return state.route === "shooter" ? 30 : 3;
  }

  if (state.lesson === 3) {
    return state.route === "shooter" ? 20 : 2;
  }

  if (state.lesson === 6) {
    return state.route === "shooter" ? 60 : 6;
  }

  return 0;
}

function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function burst(x, y, color = "#fad538", count = 12) {
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1.2;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: Math.random() * 24 + 24,
      maxLife: 48,
      color,
      size: Math.random() * 4 + 2
    });
  }
}

function updatePlayer() {
  if (state.route === "shooter") {
    updateShooterPlayer();
  } else {
    updatePlatformPlayer();
  }
}

function updateShooterPlayer() {
  const speed = state.player.shield > 0 ? 7.2 : controlSpeed();
  let dx = 0;
  let dy = 0;

  if (movementEnabled()) {
    if (canMoveHorizontal() && keyIsDown("ArrowLeft", "a", "A")) dx -= 1;
    if (canMoveHorizontal() && keyIsDown("ArrowRight", "d", "D")) dx += 1;
    if (canMoveVertical() && keyIsDown("ArrowUp", "w", "W")) dy -= 1;
    if (canMoveVertical() && keyIsDown("ArrowDown", "s", "S")) dy += 1;
  }

  if (dx !== 0 && dy !== 0) {
    dx *= 0.72;
    dy *= 0.72;
  }

  state.player.vx = dx * speed;
  state.player.vy = dy * speed;
  state.player.x = clamp(state.player.x + state.player.vx, 42, state.width - 42);
  state.player.y = clamp(state.player.y + state.player.vy, 54, state.height - 54);
}

function updatePlatformPlayer() {
  const player = state.player;
  const groundY = platformGroundY();
  const speed = player.shield > 0 ? 7.5 : controlSpeed();

  if (movementEnabled()) {
    if (canMoveHorizontal() && keyIsDown("ArrowLeft", "a", "A")) {
      player.vx = -speed;
    } else if (canMoveHorizontal() && keyIsDown("ArrowRight", "d", "D")) {
      player.vx = speed;
    } else {
      player.vx *= 0.78;
    }

    if (canMoveVertical() && consumeKey("ArrowUp", "w", "W", " ") && player.grounded) {
      player.vy = -13.2;
      player.grounded = false;
      burst(player.x, player.y + player.size * 0.4, "#b1d5ff", 8);
    }
  } else {
    player.vx *= 0.78;
  }

  player.vy += 0.72;
  player.x = clamp(player.x + player.vx, 34, state.width - 34);
  player.y += player.vy;

  if (player.y + player.size * 0.5 >= groundY) {
    player.y = groundY - player.size * 0.5;
    player.vy = 0;
    player.grounded = true;
  }

  handlePlatformLandings();
}

function platformGroundY() {
  return state.height - 54;
}

function platformRects() {
  return [
    { x: state.width * 0.24, y: state.height - 150, w: 150, h: 18 },
    { x: state.width * 0.52, y: state.height - 220, w: 164, h: 18 },
    { x: state.width * 0.74, y: state.height - 145, w: 150, h: 18 }
  ];
}

function handlePlatformLandings() {
  if (state.route !== "platform" || state.player.vy < 0) {
    return;
  }

  const player = state.player;
  const half = player.size * 0.5;
  platformRects().forEach((platform) => {
    const wasAbove = player.y + half - player.vy <= platform.y + 6;
    const insideX = player.x + half > platform.x && player.x - half < platform.x + platform.w;
    const touchesY = player.y + half >= platform.y && player.y + half <= platform.y + platform.h + 12;

    if (wasAbove && insideX && touchesY) {
      player.y = platform.y - half;
      player.vy = 0;
      player.grounded = true;
    }
  });
}

function updateSystems() {
  state.bulletCooldown = Math.max(0, state.bulletCooldown - 1);
  state.skillCooldown = Math.max(0, state.skillCooldown - 1);
  state.player.shield = Math.max(0, state.player.shield - 1);

  if (state.route === "shooter" && consumeKey(" ")) {
    if (state.lesson === 3 || state.lesson === 5 || state.lesson === 6 || activeCourseId() === "L1-03") {
      fireBullet(false);
    }
  }

  if (consumeKey("e", "E")) {
    if (activeCourseId() === "L2-03") {
      useHandsOnResource();
    } else if (state.lesson === 5 || state.lesson === 6) {
      useSkill();
    }
  }

  updateLesson4Spawner();
  updateFinalProject();
  updateBullets();
  updateEnemies();
  handleItemCollection();
  handleBulletEnemyCollisions();
  handlePlayerEnemyCollisions();
  updateHandsOnActivity();
}

function fireBullet(powered) {
  if (state.route !== "shooter" || state.bulletCooldown > 0 || !movementEnabled()) {
    return;
  }

  const damage = powered ? 3 : 1;
  const radius = powered ? 8 : 5;
  const spread = powered ? [-10, 0, 10] : [0];

  spread.forEach((offset) => {
    state.bullets.push({
      x: state.player.x + 26,
      y: state.player.y + offset,
      vx: powered ? 12 : 8,
      vy: offset * 0.018,
      damage,
      radius,
      alive: true,
      color: powered ? "#fad538" : "#b1d5ff"
    });
  });

  state.bulletCooldown = powered ? 18 : 12;
  burst(state.player.x + 24, state.player.y, powered ? "#fad538" : "#b1d5ff", powered ? 8 : 4);
}

function useSkill() {
  if (!systemsEnabled()) {
    observeIssue("你按下了技能键，但技能函数还没接上线，所以没有执行任何动作。");
    markStep(1, true);
    return;
  }

  if (state.skillCooldown > 0) {
    pulseHint(`技能冷却中，还需要 ${(state.skillCooldown / 60).toFixed(1)} 秒。`);
    return;
  }

  if (state.skillEnergy <= 0) {
    pulseHint("能量已经用完。这个限制就是技能系统里的资源规则。");
    return;
  }

  state.skillUses += 1;
  state.skillEnergy -= 1;
  state.skillCooldown = 76;
  markStep(1, true);
  markStep(3, true);

  if (state.route === "shooter") {
    state.bulletCooldown = 0;
    fireBullet(true);
    pulseHint("强化射击已释放：函数一次执行了多颗子弹和更高伤害。");
  } else {
    state.player.vx = 12;
    state.player.shield = 68;
    burst(state.player.x, state.player.y, "#fad538", 20);
    pulseHint("冲刺技能已释放：速度提升，并获得短暂护盾。");
  }

  if (state.lesson === 5 && state.skillUses >= 3) {
    completeLesson("技能系统完成：你已经释放 3 次技能，并看到了冷却与能量限制。");
  }
}

function useHandsOnResource() {
  const activity = ensureActivityState(false);
  if (!activity || activeCourseId() !== "L2-03") {
    return;
  }

  if (!state.ruleFixed) {
    activity.feedback = "先拼出资源规则并启动，再测试技能消耗。";
    renderStudentActivity();
    pulseHint(activity.feedback);
    return;
  }

  if (state.skillEnergy > 0) {
    state.skillEnergy -= 1;
    state.skillUses += 1;
    state.player.shield = 34;
    burst(state.player.x, state.player.y, "#fad538", 16);
    recordActivityMetric("resourceUses", 1, `技能释放成功：能量剩余 ${state.skillEnergy}。继续测试直到看到资源不足。`);
    return;
  }

  recordActivityMetric("resourceBlocked", 1, "能量不足，技能没有释放。这就是资源系统对最强行为的限制。");
}

function updateHandsOnActivity() {
  const definition = currentHandsOnActivity();
  if (!definition || !state.ruleFixed || state.completed) {
    return;
  }

  const courseId = activeCourseId();

  if (courseId === "L1-02") {
    const target = handsOnTargetRect();
    if (target && pointInsideRect(state.player.x, state.player.y, target)
      && Number(state.activity.metrics.targetReached || 0) < 1) {
      recordActivityMetric("targetReached", 1, "你已经亲自把角色送进目标区：输入 -> 坐标 -> 目标判定成立。");
    }
    return;
  }

  if (courseId === "L1-03" && state.route === "platform") {
    state.items.forEach((item) => {
      if (!item.collected && distance(state.player.x, state.player.y, item.x, item.y) < 42) {
        item.collected = true;
        state.score += 1;
        burst(item.x, item.y, "#fad538", 16);
        recordActivityMetric("rewardTriggered", 1, "奖励碰撞已验证：玩家碰到奖励后，分数和对象状态都变了。");
      }
    });

    state.enemies.forEach((enemy) => {
      if (enemy.alive && (enemy.touchLock || 0) <= 0
        && Number(state.activity.metrics.hazardTriggered || 0) < 1
        && distance(state.player.x, state.player.y, enemy.x, enemy.y) < state.player.size * 0.5 + enemy.radius) {
        enemy.touchLock = 60;
        state.hp = Math.max(0, state.hp - 1);
        state.player.x = Math.max(54, state.player.x - 80);
        burst(state.player.x, state.player.y, "#ff9191", 14);
        recordActivityMetric("hazardTriggered", 1, "障碍碰撞已验证：玩家碰到障碍后，HP 或位置发生变化。");
      }
    });
    return;
  }

  if (courseId === "L2-01") {
    state.items.forEach((item) => {
      if (!item.collected && distance(state.player.x, state.player.y, item.x, item.y) < 44) {
        item.collected = true;
        state.score += 1;
        burst(item.x, item.y, "#fad538", 16);
        recordActivityMetric("loopRuns", 1, "完成一次短目标：玩家行动、得到反馈、出现下一个目标。");
      }
    });
    return;
  }

  if (courseId === "L2-02") {
    const zones = riskRouteZones();
    if (pointInsideRect(state.player.x, state.player.y, zones.safe)
      && Number(state.activity.metrics.safeVisits || 0) < 1) {
      recordActivityMetric("safeVisits", 1, "你走过安全路线：风险低、奖励低，但结果稳定。");
    }
    if (pointInsideRect(state.player.x, state.player.y, zones.risky)
      && Number(state.activity.metrics.riskyVisits || 0) < 1) {
      state.score += 3;
      burst(state.player.x, state.player.y, "#ff9191", 18);
      recordActivityMetric("riskyVisits", 1, "你走过冒险路线：收益更高，但失败成本也应该更明显。");
    }
  }
}

function handsOnTargetRect() {
  if (activeCourseId() !== "L1-02") {
    return null;
  }

  return state.route === "shooter"
    ? { x: state.width - 138, y: state.height * 0.5 - 86, w: 96, h: 172 }
    : { x: state.width - 156, y: platformGroundY() - 132, w: 110, h: 132 };
}

function riskRouteZones() {
  return {
    safe: { x: state.width * 0.48, y: state.height * 0.4, w: 128, h: 92 },
    risky: { x: state.width * 0.7, y: state.height * 0.58, w: 148, h: 112 }
  };
}

function pointInsideRect(x, y, rect) {
  return rect && x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function updateLesson4Spawner() {
  if (state.lesson !== 4) {
    return;
  }

  state.spawnClock += 1;

  if (!state.ruleFixed) {
    state.spawnCountdown = 0;
    if (state.spawnClock > 180) {
      markStep(1, true);
      observeIssue("你等了几秒，但没有新对象出现：说明定时生成规则还没有启动。");
    }
    return;
  }

  state.spawnCountdown = 90 - (state.spawnClock % 90);

  if (state.spawnClock % 90 === 1 && state.spawned < 5) {
    spawnObject(false);
    markStep(1, true);
  }

  if (state.spawned >= 5) {
    completeLesson("生成器任务完成：系统已经自动生成 5 个对象。");
  }
}

function updateFinalProject() {
  if (state.lesson !== 6 || !systemsEnabled()) {
    return;
  }

  state.spawnClock += 1;
  state.spawnCountdown = 80 - (state.spawnClock % 80);

  if (state.spawnClock % 80 === 1) {
    spawnObject(true);
  }

  if (state.score >= lessonTargetScore() && state.hp > 0) {
    completeLesson("毕业小游戏完成：你的作品已经达到展示标准。");
  }
}

function spawnObject(forFinalProject) {
  if (state.route === "shooter") {
    const enemyCount = state.enemies.filter((enemy) => enemy.alive).length;
    const itemCount = state.items.filter((item) => !item.collected).length;

    if (forFinalProject && itemCount < 3 && Math.random() > 0.52) {
      state.items.push({
        x: state.width * (0.45 + Math.random() * 0.42),
        y: state.height * (0.22 + Math.random() * 0.56),
        value: 10,
        collected: false
      });
      state.spawned += 1;
      return;
    }

    if (!forFinalProject || enemyCount < 4) {
      state.enemies.push({
        x: state.width + 36,
        y: state.height * (0.18 + Math.random() * 0.64),
        hp: forFinalProject ? 1 + Math.floor(Math.random() * 2) : 1,
        alive: true,
        value: forFinalProject ? 20 : 1,
        radius: 24 + Math.random() * 8,
        vx: forFinalProject ? -1.1 - Math.random() * 0.8 : -0.45,
        touchLock: 0
      });
      state.spawned += 1;
    }
    return;
  }

  const monsterCount = state.enemies.filter((enemy) => enemy.alive).length;
  const shouldSpawnMonster = forFinalProject && monsterCount < 2 && Math.random() > 0.62;

  if (shouldSpawnMonster) {
    state.enemies.push({
      x: state.width * (0.48 + Math.random() * 0.42),
      y: platformGroundY() - 26,
      hp: 1,
      alive: true,
      value: 1,
      radius: 25,
      vx: Math.random() > 0.5 ? -0.75 : 0.75,
      touchLock: 0
    });
  } else {
    const platforms = platformRects();
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    state.items.push({
      x: platform.x + 32 + Math.random() * (platform.w - 64),
      y: platform.y - 34,
      value: 1,
      collected: false
    });
  }

  state.spawned += 1;
}

function updateBullets() {
  state.bullets.forEach((bullet) => {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    if (bullet.x > state.width + 40 || bullet.y < -40 || bullet.y > state.height + 40) {
      bullet.alive = false;
    }
  });
  state.bullets = state.bullets.filter((bullet) => bullet.alive);
}

function updateEnemies() {
  state.enemies.forEach((enemy) => {
    if (!enemy.alive) {
      return;
    }

    enemy.touchLock = Math.max(0, (enemy.touchLock || 0) - 1);

    if (state.route === "shooter") {
      enemy.x += enemy.vx || 0;
      enemy.y += Math.sin((enemy.x + state.spawnClock) * 0.015) * 0.45;

      if (enemy.x < -60) {
        enemy.alive = false;
      }
      return;
    }

    enemy.x += enemy.vx || 0;
    const left = state.width * 0.28;
    const right = state.width - 54;
    if (enemy.x < left || enemy.x > right) {
      enemy.vx *= -1;
      enemy.x = clamp(enemy.x, left, right);
    }
  });
}

function handleItemCollection() {
  state.items.forEach((item) => {
    if (item.collected) {
      return;
    }

    const touchDistance = state.route === "shooter" ? 34 : 38;
    if (distance(state.player.x, state.player.y, item.x, item.y) > touchDistance + state.player.size * 0.35) {
      return;
    }

    if (state.lesson === 2 && state.ruleStage === 0) {
      markStep(1, true);
      observeIssue(`你碰到了${routes[state.route].itemName}，但 score 没有变化：变量更新规则还没接上。`);
      return;
    }

    if (state.lesson === 2 && state.ruleStage > 0) {
      collectItem(item);
      return;
    }

    if ((state.lesson === 3 || state.lesson === 6) && systemsEnabled()) {
      collectItem(item);
    }
  });
}

function collectItem(item) {
  item.collected = true;
  state.score += item.value;
  if (state.lesson !== 2 || state.ruleStage >= 2) {
    state.displayScore = state.score;
  }
  markStep(2, true);
  burst(item.x, item.y, state.route === "shooter" ? "#fad538" : "#ff9191", 14);

  if (state.lesson === 2 && state.ruleStage === 1) {
    pulseHint("变量 score 已经增加，但屏幕分数还没刷新。这就是变量和 UI 的区别。");
    addAiMessage("观察统计区：变量 score 变了，屏幕分数还没同步。下一步要接 UI 刷新。");
  }

  if (state.lesson === 2 && state.ruleFixed && state.displayScore >= lessonTargetScore()) {
    completeLesson(`计分任务完成：score 已经达到 ${lessonTargetScore()}。`);
  }

  if (state.lesson === 3 && state.route === "platform" && state.score >= lessonTargetScore()) {
    completeLesson("碰撞任务完成：你让碰撞产生了真实结果。");
  }
}

function handleBulletEnemyCollisions() {
  if (state.route !== "shooter") {
    return;
  }

  state.bullets.forEach((bullet) => {
    state.enemies.forEach((enemy) => {
      if (!bullet.alive || !enemy.alive) {
        return;
      }

      if (distance(bullet.x, bullet.y, enemy.x, enemy.y) > enemy.radius + bullet.radius) {
        return;
      }

      bullet.alive = false;
      state.collisionCount += 1;
      markStep(1, true);

      if (activeCourseId() === "L1-03") {
        burst(enemy.x, enemy.y, enemy.role === "hazard" ? "#ff9191" : bullet.color, 12);
        if (enemy.role === "hazard") {
          recordActivityMetric("hazardTriggered", 1, "障碍碰撞已验证：子弹命中危险目标后，系统记录了障碍结果。");
          return;
        }

        enemy.alive = false;
        state.score += 1;
        recordActivityMetric("rewardTriggered", 1, "奖励碰撞已验证：命中目标后，奖励对象隐藏并产生分数。");
        return;
      }

      if (state.lesson === 3 && !state.ruleFixed) {
        observeIssue("子弹确实打中了训练靶，但分数没变、目标也没消失：碰撞结果规则缺失。");
        burst(enemy.x, enemy.y, "#ffffff", 8);
        return;
      }

      if (!systemsEnabled() && state.lesson !== 5) {
        return;
      }

      enemy.hp -= bullet.damage;
      burst(enemy.x, enemy.y, bullet.color, 12);

      if (enemy.hp <= 0) {
        enemy.alive = false;
        state.score += enemy.value;
        markStep(2, true);
        burst(enemy.x, enemy.y, "#fad538", 20);
      }

      if (state.lesson === 3 && state.score >= lessonTargetScore()) {
        completeLesson("碰撞任务完成：命中、隐藏目标、加分这三件事已经连起来。");
      }
    });
  });

  state.bullets = state.bullets.filter((bullet) => bullet.alive);
}

function handlePlayerEnemyCollisions() {
  state.enemies.forEach((enemy) => {
    if (!enemy.alive) {
      return;
    }

    const touchDistance = state.player.size * 0.5 + enemy.radius;
    if (distance(state.player.x, state.player.y, enemy.x, enemy.y) > touchDistance) {
      return;
    }

    if (state.lesson === 3 && state.route === "platform" && !state.ruleFixed) {
      markStep(1, true);
      observeIssue("角色已经碰到怪物，但 HP 没有变化：缺的是 if 碰到就扣血的条件规则。");
      enemy.touchLock = 50;
      return;
    }

    if (!systemsEnabled()) {
      return;
    }

    if (enemy.touchLock > 0) {
      return;
    }

    if (activeCourseId() === "L1-03") {
      state.collisionCount += 1;
      state.hp = Math.max(0, state.hp - 1);
      enemy.touchLock = 70;
      state.player.vx *= -0.8;
      burst(state.player.x, state.player.y, "#ff9191", 14);
      recordActivityMetric("hazardTriggered", 1, "障碍碰撞已验证：玩家碰到障碍后，HP 或位置发生变化。");
      return;
    }

    state.collisionCount += 1;
    markStep(1, true);

    if (state.player.shield > 0) {
      enemy.alive = false;
      state.score += enemy.value;
      markStep(2, true);
      burst(enemy.x, enemy.y, "#fad538", 18);
    } else {
      state.hp = Math.max(0, state.hp - 1);
      enemy.touchLock = 70;
      state.player.vx *= -0.8;
      burst(state.player.x, state.player.y, "#ff9191", 14);
    }

    if (state.lesson === 3 && state.route === "platform") {
      completeLesson("碰撞任务完成：怪物碰撞已经能改变 HP 状态。");
    }

    if (state.lesson === 6 && state.hp <= 0) {
      setStatus("作品需要调试", "");
      pulseHint("HP 归零了。点击重置关卡再试一次，或者用技能护盾处理危险。");
    }
  });
}

function updateParticles() {
  state.particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.97;
    particle.vy *= 0.97;
    particle.life -= 1;
  });
  state.particles = state.particles.filter((particle) => particle.life > 0);
}

function updateStars() {
  state.stars.forEach((star) => {
    star.x -= star.speed;
    if (star.x < -4) {
      star.x = state.width + 4;
      star.y = Math.random() * state.height;
    }
  });
}

function checkLesson1Goal() {
  if (state.lesson !== 1 || !state.ruleFixed) {
    return;
  }

  if (state.route === "shooter" && state.player.x > state.width - 112) {
    completeLesson("控制校准完成：你已经穿过能量门。");
  }

  if (state.route === "platform" && state.player.x > state.width - 112 && state.player.y > state.height - 150) {
    completeLesson("控制校准完成：你已经到达终点旗帜。");
  }
}

function updateStats() {
  const collected = state.items.filter((item) => item.collected).length;
  const course = getActiveCourse();
  const lesson = lessons[state.lesson];

  if (isHandsOnCourse() && course) {
    const definition = currentHandsOnActivity();
    ensureActivityState(false);
    const groupDone = definition.groups.filter(activityGroupComplete).length;
    const playDone = definition.playChecks.filter((check) => Number(state.activity.metrics[check.id] || 0) >= check.target).length;
    const pack = lessonWorkPacks[activeCourseId()];
    const noteDone = pack ? pack.notebook.filter((prompt) => (state.activity.notes[prompt.id] || "").trim().length >= prompt.minLength).length : 0;
    dom.statX.textContent = `${groupDone}/${definition.groups.length}`;
    dom.statY.textContent = `${playDone}/${definition.playChecks.length}`;
    dom.statSpeed.textContent = state.completed ? "100%" : pack ? `${noteDone}/${pack.notebook.length}` : state.ruleFixed ? "验证中" : "待操作";
    return;
  }

  if (!isPlayableLesson() && course && lesson && lesson.statValues) {
    [dom.statX, dom.statY, dom.statSpeed].forEach((node, index) => {
      node.textContent = lesson.statValues[index] || "--";
    });
    return;
  }

  if (state.lesson === 1) {
    dom.statX.textContent = Math.round(state.player.x);
    dom.statY.textContent = Math.round(state.player.y);
    dom.statSpeed.textContent = `${state.ruleStage}/3`;
    return;
  }

  if (state.lesson === 2) {
    dom.statX.textContent = state.score;
    dom.statY.textContent = state.displayScore;
    dom.statSpeed.textContent = `${collected}/3`;
    return;
  }

  if (state.lesson === 3) {
    dom.statX.textContent = state.route === "shooter" ? state.score : `HP ${state.hp}`;
    dom.statY.textContent = state.route === "shooter" ? lessonTargetScore() : "扣血/加分";
    dom.statSpeed.textContent = state.collisionCount;
    return;
  }

  if (state.lesson === 4) {
    dom.statX.textContent = state.spawned;
    dom.statY.textContent = 5;
    dom.statSpeed.textContent = state.ruleFixed ? `${(state.spawnCountdown / 60).toFixed(1)}s` : "--";
    return;
  }

  if (state.lesson === 5) {
    dom.statX.textContent = state.skillUses;
    dom.statY.textContent = `${(state.skillCooldown / 60).toFixed(1)}s`;
    dom.statSpeed.textContent = state.skillEnergy;
    return;
  }

  dom.statX.textContent = state.score;
  dom.statY.textContent = lessonTargetScore();
  dom.statSpeed.textContent = state.hp;
}

function drawGame() {
  if (state.route === "shooter") {
    drawShooterScene();
  } else {
    drawPlatformScene();
  }

  drawHandsOnElements();
  drawItems();
  drawEnemies();
  drawBullets();
  drawParticles();
  drawPlayer();
  drawOverlay();
}

function drawShooterScene() {
  const gradient = ctx.createLinearGradient(0, 0, state.width, state.height);
  gradient.addColorStop(0, "#07111c");
  gradient.addColorStop(0.55, "#0c1f31");
  gradient.addColorStop(1, "#12314a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.save();
  state.stars.forEach((star) => {
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = "#e8f4ff";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#005f9b";
  ctx.beginPath();
  ctx.arc(state.width * 0.22, state.height * 0.18, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff9191";
  ctx.beginPath();
  ctx.arc(state.width * 0.78, state.height * 0.82, 160, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (state.lesson === 1) {
    drawEnergyGate();
  }
}

function drawEnergyGate() {
  const x = state.width - 92;
  const y = state.height * 0.5;
  ctx.save();
  ctx.strokeStyle = state.ruleFixed ? "#fad538" : "#b1d5ff";
  ctx.lineWidth = 10;
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.ellipse(x, y, 28, 112, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawPlatformScene() {
  const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
  gradient.addColorStop(0, "#b1d5ff");
  gradient.addColorStop(0.56, "#f5f7f8");
  gradient.addColorStop(1, "#d5f5da");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.save();
  ctx.fillStyle = "rgba(0, 95, 155, 0.14)";
  ctx.beginPath();
  ctx.arc(state.width * 0.18, state.height + 70, 220, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "rgba(20, 119, 70, 0.14)";
  ctx.beginPath();
  ctx.arc(state.width * 0.68, state.height + 88, 260, Math.PI, 0);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#1f6f46";
  roundRect(0, platformGroundY(), state.width, 86, 28);
  ctx.fill();
  ctx.fillStyle = "#fad538";
  ctx.fillRect(0, platformGroundY(), state.width, 10);

  platformRects().forEach((platform) => {
    ctx.fillStyle = "#005f9b";
    roundRect(platform.x, platform.y, platform.w, platform.h, 12);
    ctx.fill();
    ctx.fillStyle = "#fad538";
    roundRect(platform.x + 10, platform.y - 7, platform.w - 20, 9, 10);
    ctx.fill();
  });

  if (state.lesson === 1) {
    drawFlag();
  }
}

function drawFlag() {
  const x = state.width - 96;
  const y = platformGroundY() - 118;
  ctx.save();
  ctx.strokeStyle = "#0b0f10";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, platformGroundY());
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.fillStyle = "#ff9191";
  ctx.beginPath();
  ctx.moveTo(x + 3, y);
  ctx.lineTo(x + 72, y + 24);
  ctx.lineTo(x + 3, y + 48);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHandsOnElements() {
  const courseId = activeCourseId();

  if (!handsOnActivities[courseId]) {
    return;
  }

  if (courseId === "L1-01") {
    drawObjectHotspots();
  }

  if (courseId === "L1-02") {
    drawTargetZone(handsOnTargetRect(), "目标区");
  }

  if (courseId === "L2-02") {
    const zones = riskRouteZones();
    drawTargetZone(zones.safe, "安全路线 +1");
    drawTargetZone(zones.risky, "冒险路线 +3");
  }

  if (courseId === "L2-03") {
    drawResourceMeter();
  }
}

function drawObjectHotspots() {
  const activity = ensureActivityState(false);
  const marked = new Set(activity && activity.markedObjects || []);
  const spots = objectHotspots();

  spots.forEach((spot) => {
    ctx.save();
    ctx.fillStyle = marked.has(spot.id) ? "rgba(250, 213, 56, 0.9)" : "rgba(255, 255, 255, 0.82)";
    ctx.strokeStyle = spot.correct ? "rgba(250, 213, 56, 0.95)" : "rgba(255, 145, 145, 0.95)";
    ctx.lineWidth = 3;
    roundRect(spot.x - spot.w * 0.5, spot.y - spot.h * 0.5, spot.w, spot.h, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0b0f10";
    ctx.font = "900 14px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(spot.label, spot.x - spot.w * 0.5 + 14, spot.y + 5);
    ctx.restore();
  });
}

function objectHotspots() {
  return [
    { id: "player", label: "玩家对象", x: state.width * 0.22, y: state.height * 0.58, w: 118, h: 46, correct: true },
    { id: "goal", label: "目标对象", x: state.width * 0.58, y: state.height * 0.42, w: 118, h: 46, correct: true },
    { id: "blocker", label: "限制对象", x: state.width * 0.72, y: state.height * 0.68, w: 118, h: 46, correct: true },
    { id: "background", label: "背景装饰", x: state.width * 0.34, y: state.height * 0.78, w: 118, h: 46, correct: false }
  ];
}

function drawTargetZone(rect, label) {
  if (!rect) {
    return;
  }

  ctx.save();
  ctx.fillStyle = "rgba(250, 213, 56, 0.2)";
  ctx.strokeStyle = "#fad538";
  ctx.lineWidth = 4;
  roundRect(rect.x, rect.y, rect.w, rect.h, 18);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = state.route === "shooter" ? "#f5f7f8" : "#0b0f10";
  ctx.font = "900 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(label, rect.x + 14, rect.y + 28);
  ctx.restore();
}

function drawResourceMeter() {
  const x = state.width - 214;
  const y = 112;
  const max = 2;

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
  roundRect(x, y, 170, 74, 20);
  ctx.fill();
  ctx.fillStyle = "#0b0f10";
  ctx.font = "900 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(`能量 ${state.skillEnergy}/${max}`, x + 16, y + 28);
  for (let index = 0; index < max; index += 1) {
    ctx.fillStyle = index < state.skillEnergy ? "#fad538" : "#dfe5e8";
    roundRect(x + 16 + index * 58, y + 42, 46, 16, 8);
    ctx.fill();
  }
  ctx.restore();
}

function drawItems() {
  state.items.forEach((item) => {
    if (item.collected) {
      return;
    }

    const bob = Math.sin((performance.now() * 0.004) + item.x) * 4;
    ctx.save();
    ctx.translate(item.x, item.y + bob);

    if (state.route === "shooter") {
      ctx.fillStyle = "#fad538";
      ctx.strokeStyle = "#fff3aa";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(16, 0);
      ctx.lineTo(0, 18);
      ctx.lineTo(-16, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = state.lesson === 3 ? "#73d987" : "#fad538";
      ctx.strokeStyle = "#0b0f10";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#0b0f10";
      ctx.fillRect(-3, -8, 6, 16);
    }

    ctx.restore();
  });
}

function drawEnemies() {
  state.enemies.forEach((enemy) => {
    if (!enemy.alive) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = enemy.touchLock > 0 ? 0.65 : 1;
    ctx.translate(enemy.x, enemy.y);

    if (state.route === "shooter") {
      ctx.fillStyle = "#ff9191";
      ctx.strokeStyle = "#ffd0d0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#0b0f10";
      ctx.beginPath();
      ctx.arc(-8, -4, 4, 0, Math.PI * 2);
      ctx.arc(8, -4, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#ff9191";
      ctx.strokeStyle = "#0b0f10";
      ctx.lineWidth = 3;
      roundRect(-enemy.radius, -enemy.radius, enemy.radius * 2, enemy.radius * 2, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#0b0f10";
      ctx.beginPath();
      ctx.arc(-8, -4, 3, 0, Math.PI * 2);
      ctx.arc(8, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-10, 9, 20, 4);
    }

    ctx.restore();
  });
}

function drawBullets() {
  state.bullets.forEach((bullet) => {
    ctx.save();
    ctx.fillStyle = bullet.color;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawParticles() {
  state.particles.forEach((particle) => {
    ctx.save();
    ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawPlayer() {
  const player = state.player;
  ctx.save();
  ctx.translate(player.x, player.y);

  if (player.shield > 0) {
    ctx.strokeStyle = "rgba(250, 213, 56, 0.8)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, player.size * 0.75 + Math.sin(performance.now() * 0.02) * 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (state.route === "shooter") {
    ctx.rotate((player.vy || 0) * 0.03);
    ctx.fillStyle = state.ruleFixed || state.lesson !== 1 ? "#fad538" : "#b1d5ff";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(-18, -18);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-18, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#005f9b";
    ctx.beginPath();
    ctx.arc(-2, 0, 7, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = state.ruleFixed || state.lesson !== 1 ? "#fad538" : "#b1d5ff";
    ctx.strokeStyle = "#0b0f10";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, player.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0b0f10";
    ctx.beginPath();
    ctx.arc(-7, -4, 3, 0, Math.PI * 2);
    ctx.arc(7, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0b0f10";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 4, 8, 0.1, Math.PI - 0.1);
    ctx.stroke();
  }

  ctx.restore();
}

function drawOverlay() {
  const route = routes[state.route];
  const course = getActiveCourse();
  const lesson = lessons[state.lesson];

  if (!isPlayableLesson() && course && lesson) {
    drawCurriculumOverlay(course, lesson);
    return;
  }

  const targetText = route.targetText[state.lesson] || (course ? course.task : lessons[state.lesson].heading);
  ctx.save();
  ctx.fillStyle = state.route === "shooter" ? "rgba(245, 247, 248, 0.9)" : "rgba(11, 15, 16, 0.78)";
  ctx.font = "800 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(`目标：${targetText}`, 24, 34);

  ctx.font = "700 13px 'Be Vietnam Pro', sans-serif";
  const helperText = getCurrentHint();
  ctx.fillText(helperText.slice(0, 34), 24, 58);

  if (state.lesson === 6 || state.lesson === 3) {
    ctx.fillText(`HP ${state.hp}`, state.width - 88, 34);
  }
  ctx.restore();
}

function curriculumPhaseLabel() {
  if (state.completed) {
    return "成果已保存";
  }
  if (state.ruleFixed) {
    return "验证与复盘";
  }
  if (state.observedIssue) {
    return "搭建最小规则";
  }
  return "观察与拆解";
}

function drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = String(text).split("");
  let line = "";
  let lines = 0;

  for (let index = 0; index < words.length; index += 1) {
    const char = words[index];
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      if (lines >= maxLines) {
        return;
      }
      ctx.fillText(line, x, y + lineHeight * lines);
      line = char;
      lines += 1;
    } else {
      line = testLine;
    }

    if (index === words.length - 1 && lines < maxLines) {
      ctx.fillText(line, x, y + lineHeight * lines);
    }
  }
}

function drawCurriculumOverlay(course, lesson) {
  const panelX = 20;
  const panelY = 18;
  const panelW = Math.min(state.width - 40, 520);
  const panelH = 148;
  const chipY = panelY + panelH - 34;
  const concepts = courseConceptList(course);
  const hint = getCurrentHint();

  ctx.save();
  ctx.fillStyle = state.route === "shooter" ? "rgba(7, 17, 28, 0.74)" : "rgba(245, 247, 248, 0.88)";
  ctx.strokeStyle = state.route === "shooter" ? "rgba(177, 213, 255, 0.3)" : "rgba(0, 95, 155, 0.18)";
  ctx.lineWidth = 2;
  roundRect(panelX, panelY, panelW, panelH, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = state.route === "shooter" ? "#f5f7f8" : "#0b0f10";
  ctx.font = "800 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(`${course.id} · ${lesson.badge}`, panelX + 18, panelY + 28);

  ctx.font = "800 20px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(course.title, panelX + 18, panelY + 56);

  ctx.font = "700 13px 'Be Vietnam Pro', sans-serif";
  drawWrappedText(`目标：${course.task}`, panelX + 18, panelY + 82, panelW - 36, 18, 2);

  ctx.font = "700 12px 'Be Vietnam Pro', sans-serif";
  drawWrappedText(`提示：${hint}`, panelX + 18, panelY + 118, panelW - 36, 16, 2);

  concepts.slice(0, 3).forEach((concept, index) => {
    const chipX = panelX + 18 + index * 118;
    ctx.fillStyle = state.route === "shooter" ? "rgba(250, 213, 56, 0.16)" : "rgba(0, 95, 155, 0.12)";
    roundRect(chipX, chipY, 102, 22, 11);
    ctx.fill();
    ctx.fillStyle = state.route === "shooter" ? "#fad538" : "#005f9b";
    ctx.fillText(concept, chipX + 10, chipY + 15);
  });

  ctx.fillStyle = state.route === "shooter" ? "rgba(250, 213, 56, 0.95)" : "rgba(20, 119, 70, 0.95)";
  ctx.font = "800 13px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(`阶段：${curriculumPhaseLabel()}`, state.width - 184, 34);
  ctx.font = "700 13px 'Be Vietnam Pro', sans-serif";
  ctx.fillText(`产出：${course.product}`, state.width - 184, 58);
  ctx.fillText(`模块：${courseModule(course)}`, state.width - 184, 82);
  ctx.restore();
}

function roundRect(x, y, width, height, radius) {
  const r = Math.min(radius, width * 0.5, height * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function handleInputObservation(key) {
  if (state.lesson === 1 && !state.ruleFixed && isMoveKey(key)) {
    state.observedKeys.add(normalizeMoveKey(key));
    if (state.observedKeys.size >= 2) {
      markStep(1, true);
      observeIssue("你已经确认了现象：系统听见了不同按键事件，但角色还没有移动，因为事件还没连到坐标变化。");
      updateGuide();
    } else {
      pulseHint("很好，系统听见了第一个按键事件。再按另一个方向键，对比一下。");
    }
  }

  if (state.lesson === 5 && !state.ruleFixed && isSkillKey(key)) {
    markStep(1, true);
    observeIssue("你尝试了技能键，但没有任何动作：这正是函数还没被调用的表现。");
  }

  if (state.lesson === 6 && !state.ruleFixed && (isMoveKey(key) || isSkillKey(key) || key === " ")) {
    pulseHint("毕业关需要先启动综合规则，才会把移动、得分、碰撞、生成和技能组合起来。");
  }
}

function handleCanvasClick(event) {
  if (activeCourseId() !== "L1-01") {
    return;
  }

  const activity = ensureActivityState(false);
  if (!activity) {
    return;
  }

  if (!state.observedIssue) {
    state.observedIssue = true;
    markStep(1, true);
  }

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const spot = objectHotspots().find((item) => (
    x >= item.x - item.w * 0.5
    && x <= item.x + item.w * 0.5
    && y >= item.y - item.h * 0.5
    && y <= item.y + item.h * 0.5
  ));

  if (!spot) {
    pulseHint("请点击画布里的对象标签：玩家对象、目标对象、限制对象。");
    return;
  }

  activity.markedObjects = activity.markedObjects || [];

  if (!spot.correct) {
    activity.feedback = "背景装饰可以影响氛围，但不是这张规则拆解卡的核心对象。请继续找玩家、目标和限制。";
    renderStudentActivity();
    pulseHint(activity.feedback);
    return;
  }

  if (!activity.markedObjects.includes(spot.id)) {
    activity.markedObjects.push(spot.id);
    activity.metrics.markedObjects = activity.markedObjects.length;
    activity.feedback = `已标记“${spot.label}”。继续在画布里找剩下的核心对象。`;
    markStep(1, true);
    renderStudentActivity();
    updateStats();
    pulseHint(activity.feedback);
    maybeCompleteHandsOnActivity();
  }
}

function normalizeMoveKey(key) {
  const groups = {
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right",
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down"
  };
  return groups[key] || key;
}

function rememberKey(key) {
  state.keys.add(key);
  if (key.length === 1) {
    state.keys.add(key.toLowerCase());
    state.keys.add(key.toUpperCase());
  }
}

function forgetKey(key) {
  state.keys.delete(key);
  delete state.keyLocks[key];
  if (key.length === 1) {
    state.keys.delete(key.toLowerCase());
    state.keys.delete(key.toUpperCase());
    delete state.keyLocks[key.toLowerCase()];
    delete state.keyLocks[key.toUpperCase()];
  }
}

function getAiReply(prompt) {
  const route = routes[state.route];
  const lesson = lessons[state.lesson];
  const replies = {
    stuck: {
      1: "先把问题拆成链条：按键事件发生了没有？方向判断出来了吗？x/y 坐标有没有变化？不要急着修，先找到断点。",
      2: "先区分变量和显示：碰到物品只是事件，score 增加是变量更新，屏幕数字变化是 UI 刷新。",
      3: "碰撞不只是“碰到了”，还要写结果：如果碰到，就让目标失效、加分或扣 HP。",
      4: "这一关不用急着操作，先等待。没有新对象出现，就说明系统循环没有启动。",
      5: "技能像一个打包动作。按 E 没反应时，说明函数还没有被调用，或者冷却条件没通过。",
      6: "毕业关要把前 5 个系统合起来看。先确认哪条规则没运行，再单独修那一条。"
    },
    hint: {
      1: state.ruleStage === 0 ? "先按两个不同方向键，完成观察证据；再点第一条修复。" : `当前规则进度 ${state.ruleStage}/3。每次只测试刚接上的那一条。`,
      2: state.ruleStage === 0 ? `先碰一个${route.itemName}，确认“碰到但不计分”。` : `当前计分链路 ${state.ruleStage}/3。观察变量 score 和屏幕分数是否一致。`,
      3: state.route === "shooter" ? "先按空格打中靶子，再修复碰撞结果。" : "先碰一下红色怪物观察 HP，再修复碰撞结果。",
      4: "等 3 秒是第一步；启动生成规则后，盯住“生成数”变到 5。",
      5: "按 E 看有没有反应。启用函数后，等冷却归零再按下一次。",
      6: "射击路线靠空格和 E 得分；平台路线靠金币、躲怪和冲刺护盾。"
    },
    code: {
      1: "代码的核心不是“按键=移动”，而是事件触发后，程序判断方向，再用 speed 改变 x/y。",
      2: "score += item.value 只是在改变量；如果没有 refreshScoreUI()，玩家看到的屏幕分数可能还没变。",
      3: "if collision 的价值是防止所有事情都发生。只有碰撞成立，才执行后面的结果。",
      4: "timer.every(1.5) 像节拍器：每隔一段时间，就检查一次能不能生成新对象。",
      5: "函数把多行行为包装成一个名字。use_skill() 被调用时，才会执行里面的动作。",
      6: "完整游戏循环通常是：处理输入、更新对象、检测碰撞、判断胜负。"
    },
    recap: {
      1: "你可以这样复盘：我先确认按键事件被听见，再分步连接左右、上下和速度，最后让坐标变化形成移动。",
      2: "你可以这样复盘：我先确认碰撞不会自动计分，再连接 score 变量、UI 刷新和防重复计分。",
      3: "你可以这样复盘：我用 if 判断碰撞是否发生，再改变分数、HP 或对象状态。",
      4: "你可以这样复盘：我启动了定时循环，让系统自动生成对象。",
      5: "你可以这样复盘：我把一组动作封装成技能函数，并加入冷却和能量限制。",
      6: "你可以这样复盘：我把移动、分数、碰撞、生成和技能组合成了一关可展示的小游戏。"
    }
  };

  const legacyReply = replies[prompt] && replies[prompt][state.lesson];
  if (legacyReply) {
    return legacyReply;
  }

  const course = getActiveCourse();
  if (!course) {
    return "先把目标、现象和猜测说清楚，再让 AI 给一个小提示。";
  }

  const fallbackReplies = {
    stuck: `把 ${course.id} 拆成三步：你想完成什么？现在看到什么？你猜哪条规则没连上？先写这三句话，再继续。`,
    hint: `本课先做最小证据：${course.task}。不要加太多功能，先证明 ${course.concepts} 真的发生了。`,
    code: `这节课的代码透视重点是：把“${course.task}”翻译成“当/如果/就”。先写中文规则，再看伪代码。`,
    recap: `你可以这样复盘：我完成了“${course.product}”，它对应 ${course.concepts}；AI 给了提示，我通过运行或观察验证了结果。`
  };

  return fallbackReplies[prompt] || fallbackReplies.hint;
}

function setActiveCourse(courseId) {
  if (!curriculum) {
    const legacyLesson = Number(courseId);
    if (lessons[legacyLesson]) {
      state.lesson = legacyLesson;
    }
    return;
  }

  const course = curriculum.getCourse(courseId);
  state.courseId = course.id;
  state.lesson = lessonKeyForCourse(course);
}

function renderLessonNavigator(stageId) {
  if (!curriculum) {
    return;
  }

  const course = getActiveCourse();
  const activeStage = stageId || course.stage;
  curriculum.renderStageTabs("#stageTabs", { activeStage });
  curriculum.renderLessonRail("#lessonCourseRail", {
    activeCourseId: state.courseId,
    stage: activeStage
  });
  bindStageTabEvents();
  bindCourseCardEvents();
  updateCourseNavigation();
}

function updateCourseNavigation() {
  const activeCourse = getActiveCourse();
  document.querySelectorAll(".lesson-card").forEach((card) => {
    const courseId = card.dataset.course || (card.dataset.lesson ? `L2-${String(Number(card.dataset.lesson)).padStart(2, "0")}` : "");
    card.classList.toggle("is-active", activeCourse ? courseId === activeCourse.id : Number(card.dataset.lesson) === state.lesson);
  });

  document.querySelectorAll(".stage-tab").forEach((tab) => {
    tab.classList.toggle("is-active", activeCourse ? tab.dataset.stage === activeCourse.stage : false);
  });
}

function bindStageTabEvents() {
  document.querySelectorAll(".stage-tab").forEach((button) => {
    if (button.dataset.bound === "true") {
      return;
    }

    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      const firstCourse = curriculum.coursesForStage(button.dataset.stage)[0];
      if (firstCourse) {
        activateCourse(firstCourse.id);
      }
    });
  });
}

function bindCourseCardEvents() {
  document.querySelectorAll(".lesson-card").forEach((button) => {
    if (button.dataset.bound === "true") {
      return;
    }

    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      const courseId = button.dataset.course || button.dataset.lesson;
      activateCourse(courseId);
    });
  });
}

function activateCourse(courseId) {
  setActiveCourse(courseId);
  const course = getActiveCourse();
  renderLessonNavigator(course ? course.stage : undefined);
  syncLessonUrl();
  resetGame(true);
  addAiMessage(course && course.playableLesson
    ? `已切换到 ${course.id}：${lessons[state.lesson].heading}。先观察，再修复。`
    : course
      ? `已切换到 ${course.id}：${course.title}。先读任务，再完成一个最小作品证据。`
      : `已切换到第 ${state.lesson} 关：${lessons[state.lesson].heading}。先观察，再修复。`);
}

function applyInitialUrlState() {
  const params = new URLSearchParams(window.location.search);
  const course = params.get("course") || params.get("lesson") || "L0-01";
  const route = params.get("route");

  setActiveCourse(course);

  if (routes[route]) {
    state.route = route;
  }

  renderLessonNavigator(getActiveCourse() ? getActiveCourse().stage : undefined);

  document.querySelectorAll(".route-card").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.route === state.route);
  });
}

function syncLessonUrl() {
  const params = new URLSearchParams();
  if (state.courseId) {
    params.set("course", state.courseId);
  } else {
    params.set("lesson", state.lesson);
  }
  params.set("route", state.route);
  window.history.replaceState(null, "", `./lesson.html?${params.toString()}`);
}

function gameLoop() {
  updateStars();
  updatePlayer();
  updateSystems();
  updateParticles();
  checkLesson1Goal();
  updateStats();
  drawGame();
  window.requestAnimationFrame(gameLoop);
}

bindCourseCardEvents();

document.querySelectorAll(".route-card").forEach((button) => {
  button.addEventListener("click", () => {
    state.route = button.dataset.route;
    document.querySelectorAll(".route-card").forEach((card) => card.classList.toggle("is-active", card === button));
    syncLessonUrl();
    resetGame(true);
    addAiMessage(`你选择了${routes[state.route].title}。同一个编程概念，会换成你喜欢的游戏表达。`);
  });
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    state.codeMode = button.dataset.code;
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("is-active", tab === button));
    updateCode();
  });
});

document.querySelectorAll(".prompt-chips button").forEach((button) => {
  button.addEventListener("click", () => {
    addAiMessage(button.textContent, "user");
    addAiMessage(getAiReply(button.dataset.prompt));
  });
});

document.querySelectorAll(".touch-pad button").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const key = button.dataset.touchKey;
    rememberKey(key);
    handleInputObservation(key);
    button.setPointerCapture(event.pointerId);
  });

  ["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => {
    button.addEventListener(eventName, () => {
      forgetKey(button.dataset.touchKey);
    });
  });
});

dom.applyRuleBtn.addEventListener("click", enableRule);
canvas.addEventListener("click", handleCanvasClick);

dom.runBtn.addEventListener("click", () => {
  if (!isPlayableLesson()) {
    const lesson = lessons[state.lesson];
    const course = getActiveCourse();
    if (isHandsOnCourse()) {
      const activity = ensureActivityState(false);

      if (!state.observedIssue) {
        state.observedIssue = true;
        markStep(1, true);
        activity.feedback = "已记录第一轮试玩观察。现在去学生操作台做选择。";
        pulseHint("观察完成。接下来要学生自己拼规则、做试玩动作。");
        renderStudentActivity();
        addAiMessage(course
          ? `已记录 ${course.id}《${course.title}》的第一轮观察。现在请学生到操作台完成规则选择。`
          : "已记录第一轮观察。现在请学生到操作台完成规则选择。");
        return;
      }

      if (!activityRuleReady()) {
        activity.feedback = "试玩不能跳过规则选择。请先在学生操作台选对规则部件。";
        renderStudentActivity();
        pulseHint("先完成学生操作台里的选择，再开始规则验证。");
        return;
      }

      if (!state.ruleFixed) {
        pulseHint("规则部件已经拼好。请点主按钮启动规则，然后用键盘或触屏完成试玩证据。");
        return;
      }

      if (!activityPlayReady()) {
        pulseHint("规则已经启动，但试玩证据还不够。请继续在画布中操作。");
        return;
      }

      if (!activityNotebookReady()) {
        pulseHint("试玩证据完成了，但学生学习单还没写完。请补充观察、设计和测试结论。");
        return;
      }

      maybeCompleteHandsOnActivity();
      return;
    }

    if (!state.observedIssue) {
      state.observedIssue = true;
      markStep(1, true);
      markStep(2, true);
      pulseHint(lesson.phaseHints.build);
      addAiMessage(course
        ? `已记录 ${course.id}《${course.title}》的第一轮观察。下一步请把最小规则接上，再回来验证“${course.product}”。`
        : "已记录第一轮观察。下一步请把最小规则接上，再回来验证结果。");
      return;
    }

    if (!state.ruleFixed) {
      pulseHint(lesson.phaseHints.build);
      return;
    }

    completeLesson(lesson.completionMessage || `课程任务完成：${lessons[state.lesson].heading} 已留下学习证据。`);
    return;
  }

  if (state.lesson !== 6 || state.ruleFixed) {
    markStep(1, true);
  }
  if (state.ruleFixed) {
    setStatus(lessons[state.lesson].statusLive, "is-live");
    pulseHint(lessons[state.lesson].hintLive[state.route]);
    return;
  }
  pulseHint(lessons[state.lesson].hintLocked[state.route]);
});

dom.resetBtn.addEventListener("click", () => {
  resetGame(true);
  addAiMessage("关卡已重置。没关系，调试就是反复观察和修正。");
});

[dom.eventSlot, dom.conditionSlot, dom.actionSlot].forEach((slot) => {
  slot.addEventListener("click", () => {
    addAiMessage(getAiReply("code"));
  });
});

dom.studentActivity.addEventListener("click", (event) => {
  const button = event.target.closest("[data-activity-group]");
  if (!button) {
    return;
  }
  handleActivityChoice(button.dataset.activityGroup, button.dataset.activityChoice);
});

dom.studentActivity.addEventListener("change", (event) => {
  const note = event.target.closest("[data-activity-note]");
  if (!note) {
    return;
  }
  handleActivityNote(note.dataset.activityNote, note.value);
});

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }
  rememberKey(event.key);
  handleInputObservation(event.key);
});

window.addEventListener("keyup", (event) => {
  forgetKey(event.key);
});

window.addEventListener("resize", resizeCanvas);

applyInitialUrlState();
resizeCanvas();
resetGame(true);
window.requestAnimationFrame(gameLoop);

