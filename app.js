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
  stepText1: document.querySelector("#stepText1"),
  stepText2: document.querySelector("#stepText2"),
  stepText3: document.querySelector("#stepText3"),
  stepText4: document.querySelector("#stepText4"),
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
  actionSlot: document.querySelector("#actionSlot")
};

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
    heading: "控制校准场",
    intro: "角色醒来了，但控制系统还没接上。先观察问题，再把“按键事件”连接到“移动动作”。",
    missionTitle: "把“按键”变成“动作”",
    missionCopy: "你要理解事件：玩家按下某个键，游戏会触发一条规则，让角色改变坐标。",
    button: "修复控制规则",
    activeButton: "控制规则已启用",
    statusIdle: "等待修复",
    statusLive: "控制已连接",
    statusWin: "校准完成",
    statLabels: ["X 坐标", "Y 坐标", "速度"],
    steps: ["试玩坏掉的游戏", "猜测为什么角色不动", "启用输入事件规则", "到达目标并复盘事件"],
    slots: ["按下方向键 / WASD", "角色没有被锁定", "改变角色坐标"],
    hintLocked: {
      shooter: "按 WASD 或方向键试试看：飞船现在不会动，因为输入事件还没连接。",
      platform: "按 A/D 或方向键试试看：角色现在不会动，因为输入事件还没连接。"
    },
    hintLive: {
      shooter: "规则已连接。移动飞船穿过右侧蓝色能量门。",
      platform: "规则已连接。移动并跳跃到终点旗帜。"
    },
    code: {
      rule: `当 玩家按下方向键
如果 角色没有被锁定
就 根据按键方向改变角色坐标

评价出口：
我知道按键是事件。
我知道 x/y 坐标变化会让角色移动。`,
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
    heading: "分数晶核",
    intro: "控制系统已经修好了，但分数系统坏了。收集晶核或金币后，修复 score 变量，让游戏记住你的成果。",
    missionTitle: "让“分数盒子”动起来",
    missionCopy: "你要理解变量：score 像一个会变化的盒子，用来记录游戏分数，屏幕上的分数来自这个盒子。",
    button: "修复计分规则",
    activeButton: "计分规则已启用",
    statusIdle: "分数未连接",
    statusLive: "计分运行中",
    statusWin: "阶段成果完成",
    statLabels: ["Score 分数", "目标", "已收集"],
    steps: ["收集一个物品", "观察分数为什么没变", "启用 score 变量规则", "收集全部目标并复盘变量"],
    slots: ["玩家碰到收集物", "收集物还没有被收集", "score 增加并隐藏收集物"],
    hintLocked: {
      shooter: "飞船已经能动了。先碰到能量晶核，你会发现 score 仍然是 0。",
      platform: "角色已经能动了。先吃一枚金币，你会发现 score 仍然是 0。"
    },
    hintLive: {
      shooter: "计分规则已连接。继续收集 3 个能量晶核，让 score 达到 30。",
      platform: "计分规则已连接。继续收集 3 枚金币，让 score 达到 3。"
    },
    code: {
      rule: `当 玩家碰到 收集物
如果 收集物还没有被收集
就 分数增加
并且 隐藏这个收集物`,
      pseudo: `当玩家碰到收集物:
    如果 item.collected 是 false:
        score = score + item.value
        item.collected = true
        隐藏 item`,
      python: `if player.collides_with(item):
    if item.collected == False:
        score += item.value
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

const state = {
  lesson: 1,
  route: "shooter",
  codeMode: "rule",
  ruleFixed: false,
  completed: false,
  observedIssue: false,
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
  const lesson = lessons[state.lesson];
  dom.lessonEyebrow.textContent = lesson.eyebrow;
  dom.lessonHeading.textContent = lesson.heading;
  dom.lessonIntro.textContent = lesson.intro;
  dom.routeTitle.textContent = routes[state.route].title;
  dom.missionTitle.textContent = lesson.missionTitle;
  dom.missionCopy.textContent = lesson.missionCopy;
  [dom.stepText1, dom.stepText2, dom.stepText3, dom.stepText4].forEach((node, index) => {
    node.textContent = lesson.steps[index];
  });
  [dom.statLabel1, dom.statLabel2, dom.statLabel3].forEach((node, index) => {
    node.textContent = lesson.statLabels[index];
  });
  [dom.eventSlot, dom.conditionSlot, dom.actionSlot].forEach((node, index) => {
    node.textContent = lesson.slots[index];
  });
  dom.applyRuleBtn.textContent = state.ruleFixed ? lesson.activeButton : lesson.button;
  dom.gameHint.textContent = state.ruleFixed ? lesson.hintLive[state.route] : lesson.hintLocked[state.route];
  updateCode();
  updateStats();
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
  state.score = 0;
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

  setupLessonObjects();

  if (resetProgress) {
    state.ruleFixed = false;
    dom.applyRuleBtn.classList.remove("is-applied");
    markStep(1, state.lesson === 1);
    markStep(2, false);
    markStep(3, false);
    markStep(4, false);
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
  const item = document.querySelector(`[data-step="${step}"]`);
  if (item) {
    item.classList.toggle("is-done", done);
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
  if (state.ruleFixed) {
    pulseHint(lessons[state.lesson].hintLive[state.route]);
    return;
  }

  const lesson = lessons[state.lesson];
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

function completeLesson(message) {
  if (state.completed) {
    return;
  }

  const lesson = lessons[state.lesson];
  state.completed = true;
  markStep(4, true);
  setStatus(lesson.statusWin, "is-win");
  pulseHint(message);
  addAiMessage(`${message} 现在可以用自己的话解释这一关背后的规则了。`);
}

function getRuleAppliedReply() {
  const route = routes[state.route];
  const replies = {
    1: `连接成功。现在${route.noun}会响应输入事件，目标是${route.targetText[1]}。`,
    2: `score 变量已经接上线了。每次收集${route.itemName}，变量和屏幕数字都会一起变化。`,
    3: "碰撞开关已打开。接下来观察：对象碰到以后，状态会真的改变。",
    4: "生成器开始工作。你会看到系统不等玩家操作，也能按节奏自己执行规则。",
    5: "技能函数已经激活。按 E 触发一组动作，冷却时间会防止无限连发。",
    6: "综合规则启动。现在这已经是一关完整小游戏：移动、得分、碰撞、生成和技能会一起运转。"
  };
  return replies[state.lesson];
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
  if (state.lesson === 1 || state.lesson === 6) {
    return state.ruleFixed;
  }
  return true;
}

function systemsEnabled() {
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
  const speed = state.player.shield > 0 ? 7.2 : 5.2;
  let dx = 0;
  let dy = 0;

  if (movementEnabled()) {
    if (keyIsDown("ArrowLeft", "a", "A")) dx -= 1;
    if (keyIsDown("ArrowRight", "d", "D")) dx += 1;
    if (keyIsDown("ArrowUp", "w", "W")) dy -= 1;
    if (keyIsDown("ArrowDown", "s", "S")) dy += 1;
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
  const speed = player.shield > 0 ? 7.5 : 5.3;

  if (movementEnabled()) {
    if (keyIsDown("ArrowLeft", "a", "A")) {
      player.vx = -speed;
    } else if (keyIsDown("ArrowRight", "d", "D")) {
      player.vx = speed;
    } else {
      player.vx *= 0.78;
    }

    if (consumeKey("ArrowUp", "w", "W", " ") && player.grounded) {
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
    if (state.lesson === 3 || state.lesson === 5 || state.lesson === 6) {
      fireBullet(false);
    }
  }

  if (consumeKey("e", "E")) {
    if (state.lesson === 5 || state.lesson === 6) {
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

    if (state.lesson === 2 && !state.ruleFixed) {
      markStep(1, true);
      observeIssue(`你碰到了${routes[state.route].itemName}，但 score 没有变化：变量更新规则还没接上。`);
      return;
    }

    if ((state.lesson === 2 || state.lesson === 3 || state.lesson === 6) && systemsEnabled()) {
      collectItem(item);
    }
  });
}

function collectItem(item) {
  item.collected = true;
  state.score += item.value;
  markStep(2, true);
  burst(item.x, item.y, state.route === "shooter" ? "#fad538" : "#ff9191", 14);

  if (state.lesson === 2 && state.score >= lessonTargetScore()) {
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
  const speed = Math.hypot(state.player.vx || 0, state.player.vy || 0);
  const collected = state.items.filter((item) => item.collected).length;

  if (state.lesson === 1) {
    dom.statX.textContent = Math.round(state.player.x);
    dom.statY.textContent = Math.round(state.player.y);
    dom.statSpeed.textContent = speed.toFixed(1);
    return;
  }

  if (state.lesson === 2) {
    dom.statX.textContent = state.score;
    dom.statY.textContent = lessonTargetScore();
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
  ctx.save();
  ctx.fillStyle = state.route === "shooter" ? "rgba(245, 247, 248, 0.9)" : "rgba(11, 15, 16, 0.78)";
  ctx.font = "800 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(`目标：${route.targetText[state.lesson]}`, 24, 34);

  ctx.font = "700 13px 'Be Vietnam Pro', sans-serif";
  const helperText = state.ruleFixed ? lessons[state.lesson].hintLive[state.route] : lessons[state.lesson].hintLocked[state.route];
  ctx.fillText(helperText.slice(0, 34), 24, 58);

  if (state.lesson === 6 || state.lesson === 3) {
    ctx.fillText(`HP ${state.hp}`, state.width - 88, 34);
  }
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
    observeIssue("你已经确认了现象：按键被按了，但角色没有移动，因为事件规则还没有连接。");
  }

  if (state.lesson === 5 && !state.ruleFixed && isSkillKey(key)) {
    markStep(1, true);
    observeIssue("你尝试了技能键，但没有任何动作：这正是函数还没被调用的表现。");
  }

  if (state.lesson === 6 && !state.ruleFixed && (isMoveKey(key) || isSkillKey(key) || key === " ")) {
    pulseHint("毕业关需要先启动综合规则，才会把移动、得分、碰撞、生成和技能组合起来。");
  }
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
      1: "先把问题说成一句话：我按了键，但角色坐标没有变化。所以我们要连接“输入事件 -> 坐标变化”。",
      2: "你可以盯住 score。碰到物品以后，如果 score 不变，说明缺的是变量更新，不是移动问题。",
      3: "碰撞不只是“碰到了”，还要写结果：如果碰到，就让目标失效、加分或扣 HP。",
      4: "这一关不用急着操作，先等待。没有新对象出现，就说明系统循环没有启动。",
      5: "技能像一个打包动作。按 E 没反应时，说明函数还没有被调用，或者冷却条件没通过。",
      6: "毕业关要把前 5 个系统合起来看。先确认哪条规则没运行，再单独修那一条。"
    },
    hint: {
      1: `点击“${lesson.button}”后，再让${route.noun}${route.targetText[1]}。`,
      2: `先碰一个${route.itemName}观察问题，再启用 score 规则，最后收集全部目标。`,
      3: state.route === "shooter" ? "先按空格打中靶子，再修复碰撞结果。" : "先碰一下红色怪物观察 HP，再修复碰撞结果。",
      4: "等 3 秒是第一步；启动生成规则后，盯住“生成数”变到 5。",
      5: "按 E 看有没有反应。启用函数后，等冷却归零再按下一次。",
      6: "射击路线靠空格和 E 得分；平台路线靠金币、躲怪和冲刺护盾。"
    },
    code: {
      1: "代码的核心是：按键事件发生后，改变 x/y。x 变大向右，y 变小向上。",
      2: "score += item.value 的意思是：把旧分数拿出来，加上物品价值，再放回 score。",
      3: "if collision 的价值是防止所有事情都发生。只有碰撞成立，才执行后面的结果。",
      4: "timer.every(1.5) 像节拍器：每隔一段时间，就检查一次能不能生成新对象。",
      5: "函数把多行行为包装成一个名字。use_skill() 被调用时，才会执行里面的动作。",
      6: "完整游戏循环通常是：处理输入、更新对象、检测碰撞、判断胜负。"
    },
    recap: {
      1: "你可以这样复盘：我修复了输入事件，让玩家按键能改变角色坐标。",
      2: "你可以这样复盘：我修复了变量 score，让收集结果能被游戏记录和展示。",
      3: "你可以这样复盘：我用 if 判断碰撞是否发生，再改变分数、HP 或对象状态。",
      4: "你可以这样复盘：我启动了定时循环，让系统自动生成对象。",
      5: "你可以这样复盘：我把一组动作封装成技能函数，并加入冷却和能量限制。",
      6: "你可以这样复盘：我把移动、分数、碰撞、生成和技能组合成了一关可展示的小游戏。"
    }
  };

  return replies[prompt][state.lesson];
}

function applyInitialUrlState() {
  const params = new URLSearchParams(window.location.search);
  const lesson = Number(params.get("lesson"));
  const route = params.get("route");

  if (lessons[lesson]) {
    state.lesson = lesson;
  }

  if (routes[route]) {
    state.route = route;
  }

  document.querySelectorAll(".lesson-card").forEach((card) => {
    card.classList.toggle("is-active", Number(card.dataset.lesson) === state.lesson);
  });

  document.querySelectorAll(".route-card").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.route === state.route);
  });
}

function syncLessonUrl() {
  const params = new URLSearchParams();
  params.set("lesson", state.lesson);
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

document.querySelectorAll(".lesson-card").forEach((button) => {
  button.addEventListener("click", () => {
    state.lesson = Number(button.dataset.lesson);
    document.querySelectorAll(".lesson-card").forEach((card) => card.classList.toggle("is-active", card === button));
    syncLessonUrl();
    resetGame(true);
    addAiMessage(`已切换到第 ${state.lesson} 关：${lessons[state.lesson].heading}。先观察，再修复。`);
  });
});

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

dom.runBtn.addEventListener("click", () => {
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
