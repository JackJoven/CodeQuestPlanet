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
  chatWindow: document.querySelector("#chatWindow")
};

const routes = {
  shooter: {
    title: "星际射击路线",
    icon: "S",
    noun: "飞船",
    targetText: {
      1: "穿过能量门",
      2: "收集 3 个能量晶核"
    }
  },
  platform: {
    title: "平台跳跃路线",
    icon: "M",
    noun: "角色",
    targetText: {
      1: "到达终点旗帜",
      2: "收集 3 枚金币"
    }
  }
};

const lessons = {
  1: {
    eyebrow: "AI 伴学式游戏编程平台 · 第 1 关",
    heading: "控制校准场",
    intro: "角色醒来了，但控制系统还没接上。先观察问题，再把“按键事件”连接到“移动动作”。",
    missionTitle: "把“按键”变成“动作”",
    missionCopy: "你要理解第一个核心概念：事件。当玩家按下某个键，游戏会触发一条规则，让角色改变坐标。",
    button: "修复控制规则",
    activeButton: "控制规则已启用",
    statusIdle: "等待修复",
    statusLive: "控制已连接",
    statusWin: "校准完成",
    statLabels: ["X 坐标", "Y 坐标", "速度"],
    steps: ["试玩坏掉的游戏", "猜测为什么角色不动", "启用输入事件规则", "到达目标并复盘事件"],
    hintLocked: {
      shooter: "按 WASD 或方向键试试看：飞船现在不会动，因为输入事件还没连接。",
      platform: "按 A/D 或方向键试试看：角色现在不会动，因为输入事件还没连接。"
    },
    hintLive: {
      shooter: "规则已连接。用 WASD 或方向键移动飞船，穿过右侧蓝色能量门。",
      platform: "规则已连接。用 A/D 移动，用 W、空格或上方向键跳到终点旗帜。"
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
并且 隐藏这个收集物

评价出口：
我知道 score 是变量。
我知道屏幕分数来自 score。`,
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
  }
};

const state = {
  lesson: 1,
  route: "shooter",
  codeMode: "rule",
  ruleFixed: false,
  completed: false,
  triedInput: false,
  scoreIssueObserved: false,
  width: 960,
  height: 540,
  keys: new Set(),
  particles: [],
  stars: [],
  items: [],
  score: 0,
  player: {
    x: 88,
    y: 270,
    vx: 0,
    vy: 0,
    size: 34,
    grounded: false
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
  state.stars = Array.from({ length: 84 }, (_, index) => ({
    x: Math.random() * state.width,
    y: Math.random() * state.height,
    r: index % 7 === 0 ? 2.1 : Math.random() * 1.7 + 0.6,
    speed: Math.random() * 0.42 + 0.08,
    alpha: Math.random() * 0.55 + 0.25
  }));
}

function applyLessonContent() {
  const lesson = lessons[state.lesson];
  const route = routes[state.route];
  dom.lessonEyebrow.textContent = lesson.eyebrow;
  dom.lessonHeading.textContent = lesson.heading;
  dom.lessonIntro.textContent = lesson.intro;
  dom.routeTitle.textContent = route.title;
  dom.missionTitle.textContent = lesson.missionTitle;
  dom.missionCopy.textContent = lesson.missionCopy;
  [dom.stepText1, dom.stepText2, dom.stepText3, dom.stepText4].forEach((node, index) => {
    node.textContent = lesson.steps[index];
  });
  [dom.statLabel1, dom.statLabel2, dom.statLabel3].forEach((node, index) => {
    node.textContent = lesson.statLabels[index];
  });
  dom.applyRuleBtn.textContent = state.ruleFixed ? lesson.activeButton : lesson.button;
  dom.gameHint.textContent = state.ruleFixed ? lesson.hintLive[state.route] : lesson.hintLocked[state.route];
  updateCode();
  updateStats();
}

function resetGame(resetProgress = true) {
  if (state.route === "shooter") {
    state.player = { x: 82, y: state.height * 0.5, vx: 0, vy: 0, size: 34, grounded: false };
  } else {
    state.player = {
      x: 74,
      y: Math.max(180, state.height - 94),
      vx: 0,
      vy: 0,
      size: 38,
      grounded: true
    };
  }

  state.particles = [];
  state.completed = false;
  state.score = 0;
  state.items = state.lesson === 2 ? createLessonTwoItems() : [];

  if (resetProgress) {
    state.ruleFixed = false;
    state.triedInput = false;
    state.scoreIssueObserved = false;
    dom.applyRuleBtn.classList.remove("is-applied");
    markStep(2, false);
    markStep(3, false);
    markStep(4, false);
    setStatus(lessons[state.lesson].statusIdle, "");
  }

  applyLessonContent();
}

function createLessonTwoItems() {
  if (state.route === "shooter") {
    return [
      { x: state.width * 0.36, y: state.height * 0.28, value: 10, collected: false },
      { x: state.width * 0.58, y: state.height * 0.62, value: 10, collected: false },
      { x: state.width * 0.82, y: state.height * 0.42, value: 10, collected: false }
    ];
  }

  return [
    { x: state.width * 0.31, y: state.height - 190, value: 1, collected: false },
    { x: state.width * 0.57, y: state.height - 262, value: 1, collected: false },
    { x: state.width * 0.78, y: state.height - 192, value: 1, collected: false }
  ];
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
  state.ruleFixed = true;
  dom.applyRuleBtn.textContent = lessons[state.lesson].activeButton;
  dom.applyRuleBtn.classList.add("is-applied");
  setStatus(lessons[state.lesson].statusLive, "is-live");
  pulseHint(lessons[state.lesson].hintLive[state.route]);
  markStep(3, true);

  if (state.lesson === 1) {
    addAiMessage("很好，你把“按键事件”接到了“移动动作”。现在观察坐标数字，它们会跟着角色移动而变化。");
  } else {
    addAiMessage("很好，你把“收集事件”接到了“score 变量更新”。继续收集目标，看看屏幕分数是否变化。");
  }
}

function completeLesson() {
  if (state.completed) {
    return;
  }
  state.completed = true;
  setStatus(lessons[state.lesson].statusWin, "is-win");
  markStep(4, true);
  burst(state.player.x, state.player.y, 36, "#ffb43b");

  if (state.lesson === 1) {
    addAiMessage("第 1 关完成。复盘出口：按键是事件，事件触发移动动作，x/y 坐标变化让角色在画面上移动。");
  } else {
    addAiMessage("第 2 关完成。阶段成果：score 是变量，收集物品会更新 score，屏幕上的分数来自这个变量。");
  }
}

function burst(x, y, count, color) {
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1.4;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color
    });
  }
}

function movementEnabled() {
  return state.lesson === 2 || state.ruleFixed;
}

function updateShooter() {
  const player = state.player;
  const speed = 6.2;
  let ax = 0;
  let ay = 0;

  if (movementEnabled()) {
    if (state.keys.has("ArrowLeft") || state.keys.has("a")) ax -= 1;
    if (state.keys.has("ArrowRight") || state.keys.has("d")) ax += 1;
    if (state.keys.has("ArrowUp") || state.keys.has("w")) ay -= 1;
    if (state.keys.has("ArrowDown") || state.keys.has("s")) ay += 1;
  }

  const length = Math.hypot(ax, ay) || 1;
  player.vx += ((ax / length) * speed - player.vx) * 0.24;
  player.vy += ((ay / length) * speed - player.vy) * 0.24;
  player.x += player.vx;
  player.y += player.vy;
  player.x = clamp(player.x, 32, state.width - 32);
  player.y = clamp(player.y, 42, state.height - 42);

  if (Math.hypot(player.vx, player.vy) > 1.2 && Math.random() > 0.42) {
    state.particles.push({
      x: player.x - 18,
      y: player.y + (Math.random() - 0.5) * 16,
      vx: -Math.random() * 1.6 - 0.8,
      vy: (Math.random() - 0.5) * 1.2,
      life: 0.9,
      color: "#d9fff2"
    });
  }

  if (state.lesson === 1) {
    const gateX = state.width - 92;
    const gateY = state.height * 0.5;
    if (state.ruleFixed && Math.hypot(player.x - gateX, player.y - gateY) < 50) {
      completeLesson();
    }
  } else {
    handleItemCollection();
  }
}

function updatePlatform() {
  const player = state.player;
  const ground = state.height - 58;
  const moveSpeed = 5.2;
  const left = state.keys.has("ArrowLeft") || state.keys.has("a");
  const right = state.keys.has("ArrowRight") || state.keys.has("d");
  const jump = state.keys.has("ArrowUp") || state.keys.has("w") || state.keys.has(" ");

  if (movementEnabled()) {
    if (left) player.vx += (-moveSpeed - player.vx) * 0.3;
    if (right) player.vx += (moveSpeed - player.vx) * 0.3;
    if (!left && !right) player.vx *= 0.78;

    if (jump && player.grounded) {
      player.vy = -13;
      player.grounded = false;
      burst(player.x, player.y + 18, 10, "#d9fff2");
    }
  } else {
    player.vx *= 0.82;
  }

  player.vy += 0.58;
  player.x += player.vx;
  player.y += player.vy;
  player.x = clamp(player.x, 30, state.width - 30);

  if (player.y + player.size * 0.5 >= ground) {
    player.y = ground - player.size * 0.5;
    player.vy = 0;
    player.grounded = true;
  }

  getPlatforms().forEach((platform) => {
    const wasAbove = player.y + player.size * 0.5 - player.vy <= platform.y;
    const withinX = player.x > platform.x && player.x < platform.x + platform.w;
    const falling = player.vy >= 0;
    if (wasAbove && withinX && falling && player.y + player.size * 0.5 >= platform.y) {
      player.y = platform.y - player.size * 0.5;
      player.vy = 0;
      player.grounded = true;
    }
  });

  if (state.lesson === 1) {
    const flag = getFlag();
    if (state.ruleFixed && Math.abs(player.x - flag.x) < 38 && Math.abs(player.y - flag.y) < 70) {
      completeLesson();
    }
  } else {
    handleItemCollection();
  }
}

function handleItemCollection() {
  state.items.forEach((item) => {
    if (item.collected) {
      return;
    }

    const distance = Math.hypot(state.player.x - item.x, state.player.y - item.y);
    if (distance > 34) {
      return;
    }

    markStep(2, true);
    if (!state.ruleFixed) {
      if (!state.scoreIssueObserved) {
        state.scoreIssueObserved = true;
        pulseHint("你碰到了收集物，但 score 没有变化。计分规则还没有连接到 score 变量。");
        addAiMessage("你观察到了关键 bug：收集发生了，但 score 没变。合理猜测是“变量更新规则”缺失。");
      }
      burst(item.x, item.y, 8, "#ef6548");
      return;
    }

    item.collected = true;
    state.score += item.value;
    burst(item.x, item.y, 18, "#ffb43b");
  });

  if (state.ruleFixed && state.items.length > 0 && state.items.every((item) => item.collected)) {
    completeLesson();
  }
}

function updateParticles() {
  state.particles = state.particles.filter((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.03;
    particle.life -= 0.025;
    return particle.life > 0;
  });
}

function updateStars() {
  state.stars.forEach((star) => {
    star.x -= star.speed;
    if (star.x < -10) {
      star.x = state.width + 10;
      star.y = Math.random() * state.height;
    }
  });
}

function updateStats() {
  if (state.lesson === 1) {
    dom.statX.textContent = Math.round(state.player.x);
    dom.statY.textContent = Math.round(state.player.y);
    dom.statSpeed.textContent = Math.round(Math.hypot(state.player.vx, state.player.vy) * 10) / 10;
    return;
  }

  const target = state.route === "shooter" ? 30 : 3;
  const collected = state.items.filter((item) => item.collected).length;
  dom.statX.textContent = state.score;
  dom.statY.textContent = target;
  dom.statSpeed.textContent = `${collected}/3`;
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, state.width, state.height);
  gradient.addColorStop(0, "#132a48");
  gradient.addColorStop(0.52, "#0c2f3f");
  gradient.addColorStop(1, "#071522");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.save();
  state.stars.forEach((star) => {
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = "#fff7d1";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#7fe0d2";
  ctx.lineWidth = 1;
  for (let y = 34; y < state.height; y += 42) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(state.width, y + Math.sin(y * 0.02) * 18);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawShooter() {
  const player = state.player;

  if (state.lesson === 1) {
    const gateX = state.width - 92;
    const gateY = state.height * 0.5;
    ctx.save();
    ctx.translate(gateX, gateY);
    const pulse = Math.sin(performance.now() * 0.006) * 7;
    ctx.strokeStyle = "rgba(99, 216, 255, 0.88)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.ellipse(0, 0, 30 + pulse, 78 + pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255, 244, 201, 0.72)";
    ctx.stroke();
    ctx.restore();
  } else {
    drawItems();
  }

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.vx * 0.018);
  ctx.fillStyle = "#ffb43b";
  ctx.beginPath();
  ctx.moveTo(24, 0);
  ctx.lineTo(-18, -17);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-18, 17);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#d9fff2";
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.58)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawPlatform() {
  const ground = state.height - 58;
  const player = state.player;

  ctx.fillStyle = "rgba(255, 244, 201, 0.95)";
  roundRect(0, ground, state.width, 80, 28);
  ctx.fill();

  getPlatforms().forEach((platform) => {
    ctx.fillStyle = "rgba(217, 255, 242, 0.9)";
    roundRect(platform.x, platform.y, platform.w, 18, 9);
    ctx.fill();
    ctx.fillStyle = "rgba(12, 155, 142, 0.45)";
    roundRect(platform.x + 8, platform.y + 7, platform.w - 16, 7, 4);
    ctx.fill();
  });

  if (state.lesson === 1) {
    drawFlag();
  } else {
    drawItems();
  }

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = "#ffb43b";
  roundRect(-18, -24, 36, 46, 13);
  ctx.fill();
  ctx.fillStyle = "#112138";
  ctx.beginPath();
  ctx.arc(-7, -6, 3, 0, Math.PI * 2);
  ctx.arc(8, -6, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0c9b8e";
  roundRect(-20, 10, 40, 16, 8);
  ctx.fill();
  ctx.restore();
}

function drawFlag() {
  const flag = getFlag();
  ctx.save();
  ctx.translate(flag.x, flag.y);
  ctx.strokeStyle = "#fff7d1";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 50);
  ctx.lineTo(0, -52);
  ctx.stroke();
  ctx.fillStyle = "#ef6548";
  ctx.beginPath();
  ctx.moveTo(2, -48);
  ctx.lineTo(58, -32);
  ctx.lineTo(2, -12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawItems() {
  state.items.forEach((item) => {
    if (item.collected) {
      return;
    }

    const bob = Math.sin(performance.now() * 0.005 + item.x * 0.03) * 5;
    ctx.save();
    ctx.translate(item.x, item.y + bob);
    if (state.route === "shooter") {
      ctx.rotate(performance.now() * 0.0018);
      ctx.fillStyle = "#63d8ff";
      ctx.strokeStyle = "rgba(255,255,255,0.82)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(18, 0);
      ctx.lineTo(0, 18);
      ctx.lineTo(-18, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = "#ffb43b";
      ctx.strokeStyle = "rgba(255,255,255,0.82)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(17, 33, 56, 0.76)";
      ctx.font = "900 18px Segoe UI, Microsoft YaHei, sans-serif";
      ctx.fillText("$", -5, 6);
    }
    ctx.restore();
  });
}

function drawParticles() {
  state.particles.forEach((particle) => {
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 3.5 + particle.life * 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawOverlay() {
  ctx.save();
  ctx.fillStyle = "rgba(255, 253, 245, 0.92)";
  ctx.font = "800 16px Segoe UI, Microsoft YaHei, sans-serif";
  ctx.fillText(routes[state.route].targetText[state.lesson], 22, 34);

  if (!state.ruleFixed) {
    ctx.fillStyle = "rgba(239, 101, 72, 0.92)";
    ctx.font = "900 22px Segoe UI, Microsoft YaHei, sans-serif";
    ctx.fillText(state.lesson === 1 ? "输入事件未连接" : "score 变量未连接", 22, 66);
  }

  if (state.lesson === 2) {
    ctx.fillStyle = "rgba(217, 255, 242, 0.94)";
    ctx.font = "900 24px Segoe UI, Microsoft YaHei, sans-serif";
    ctx.fillText(`score = ${state.score}`, 22, 100);
  }
  ctx.restore();
}

function loop() {
  updateStars();
  if (state.route === "shooter") {
    updateShooter();
  } else {
    updatePlatform();
  }
  updateParticles();
  updateStats();

  drawBackground();
  if (state.route === "shooter") {
    drawShooter();
  } else {
    drawPlatform();
  }
  drawParticles();
  drawOverlay();
  window.requestAnimationFrame(loop);
}

function getPlatforms() {
  return [
    { x: state.width * 0.28, y: state.height - 148, w: 150 },
    { x: state.width * 0.55, y: state.height - 220, w: 170 },
    { x: state.width * 0.76, y: state.height - 150, w: 130 }
  ];
}

function getFlag() {
  return {
    x: state.width - 92,
    y: state.height - 198
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function handleFirstInput(event) {
  const validKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "w", "a", "s", "d", " "];
  if (!validKeys.includes(event.key)) {
    return;
  }

  if (state.lesson !== 1) {
    return;
  }

  if (!state.triedInput) {
    state.triedInput = true;
    markStep(2, true);
    addAiMessage("你已经观察到现象：按键没有效果。一个合理猜测是“输入事件还没有连接到移动动作”。");
  }

  if (!state.ruleFixed) {
    pulseHint("角色没有动，因为规则编辑器里的“当按下按键，就改变坐标”还没有启用。");
  }
}

function switchLesson(lesson) {
  state.lesson = Number(lesson);
  document.querySelectorAll(".lesson-card").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.lesson) === state.lesson);
  });
  resetGame(true);
  addAiMessage(`已切换到第 ${state.lesson} 关「${lessons[state.lesson].heading}」。先试玩，再观察哪里坏了。`);
}

function switchRoute(route) {
  state.route = route;
  document.querySelectorAll(".route-card").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.route === route);
  });
  resetGame(true);
  addAiMessage(`你选择了「${routes[route].title}」。学习目标不变，但游戏表现会换成你喜欢的类型。`);
}

function getAiReply(prompt) {
  if (state.lesson === 1) {
    const replies = {
      stuck: state.ruleFixed
        ? "现在控制规则已经启用。如果仍然动得不对，观察坐标面板：X 代表左右，Y 代表上下。"
        : "先检查三件事：有没有事件、有没有条件、有没有动作。现在缺的是把按键事件接到移动动作。",
      hint: state.ruleFixed
        ? `朝着目标移动。${state.route === "shooter" ? "能量门在右侧。" : "终点旗帜在右上方，跳跃需要站在地面或平台上。"}`
        : "提示 1：按键本身只是事件。事件发生后，必须有一条规则告诉角色“改变坐标”。",
      code: "这段代码会检测哪个键被按下，然后改变角色的 x 或 y 坐标。x 变大通常向右，y 变小通常向上。",
      recap: "你可以这样复盘：我按下键盘触发事件；规则判断角色能移动；动作改变坐标；所以角色在画面上移动。"
    };
    return replies[prompt];
  }

  const replies = {
    stuck: state.ruleFixed
      ? "计分规则已经启用。如果分数仍然没变，先看收集物有没有被标记为 collected。"
      : "你已经能移动了，但 score 没变。最可能的问题是：收集事件没有连接到 score 变量更新。",
    hint: state.ruleFixed
      ? "继续收集剩余目标。观察 score、目标和已收集数量是否同步变化。"
      : "提示 1：score 是变量。收集发生后，需要执行 score = score + item.value。",
    code: "这段代码的意思是：如果玩家碰到未收集的物品，就让 score 增加，并把物品标记为已收集。",
    recap: "你可以这样复盘：score 是记录分数的变量；收集物品会更新 score；屏幕上的分数来自 score。"
  };
  return replies[prompt];
}

document.querySelectorAll(".lesson-card").forEach((button) => {
  button.addEventListener("click", () => switchLesson(button.dataset.lesson));
});

document.querySelectorAll(".route-card").forEach((button) => {
  button.addEventListener("click", () => switchRoute(button.dataset.route));
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
    const prompt = button.dataset.prompt;
    addAiMessage(button.textContent.trim(), "user");
    addAiMessage(getAiReply(prompt));
  });
});

document.querySelectorAll("[data-touch-key]").forEach((button) => {
  const key = button.dataset.touchKey;
  const press = (event) => {
    event.preventDefault();
    state.keys.add(key);
    handleFirstInput({ key });
  };
  const release = (event) => {
    event.preventDefault();
    state.keys.delete(key);
  };

  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
});

dom.applyRuleBtn.addEventListener("click", enableRule);

dom.runBtn.addEventListener("click", () => {
  canvas.focus();
  pulseHint(state.ruleFixed ? lessons[state.lesson].hintLive[state.route] : lessons[state.lesson].hintLocked[state.route]);
});

dom.resetBtn.addEventListener("click", () => {
  resetGame(true);
  addAiMessage("关卡已重置。再试一次：先观察，再修复，再运行验证。");
});

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }
  state.keys.add(event.key);
  handleFirstInput(event);
});

window.addEventListener("keyup", (event) => {
  state.keys.delete(event.key);
});

window.addEventListener("resize", resizeCanvas);

createStars();
applyLessonContent();
resizeCanvas();
loop();
