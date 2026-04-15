const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const applyRuleBtn = document.querySelector("#applyRuleBtn");
const runBtn = document.querySelector("#runBtn");
const resetBtn = document.querySelector("#resetBtn");
const routeTitle = document.querySelector("#routeTitle");
const runStatus = document.querySelector("#runStatus");
const gameHint = document.querySelector("#gameHint");
const codeView = document.querySelector("#codeView");
const chatWindow = document.querySelector("#chatWindow");
const statX = document.querySelector("#statX");
const statY = document.querySelector("#statY");
const statSpeed = document.querySelector("#statSpeed");

const routes = {
  shooter: {
    title: "星际射击路线",
    hintLocked: "按 WASD 或方向键试试看：飞船现在不会动，因为输入事件还没连接。",
    hintLive: "规则已连接。用 WASD 或方向键移动飞船，穿过右侧蓝色能量门。",
    targetText: "穿过能量门",
    code: {
      rule: `当 玩家按下方向键
如果 飞船没有被锁定
就 根据按键方向改变飞船坐标

学习重点：
按键 = 输入事件
坐标 = 角色位置
速度 = 每次移动多少`,
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
  platform: {
    title: "平台跳跃路线",
    hintLocked: "按 A/D 或方向键试试看：角色现在不会动，因为输入事件还没连接。",
    hintLive: "规则已连接。用 A/D 移动，用 W、空格或上方向键跳到终点旗帜。",
    targetText: "到达终点旗帜",
    code: {
      rule: `当 玩家按下移动键
如果 角色没有被锁定
就 改变角色的横向速度

当 玩家按下跳跃键
如果 角色站在地面上
就 给角色一个向上的速度`,
      pseudo: `当移动键被按下:
    如果 player.locked 是 false:
        player.vx = 输入方向 * move_speed

当跳跃键被按下:
    如果 player.on_ground 是 true:
        player.vy = -jump_power`,
      python: `move_speed = 5
jump_power = 13

if key_pressed("left"):
    player.vx = -move_speed
if key_pressed("right"):
    player.vx = move_speed
if key_pressed("jump") and player.on_ground:
    player.vy = -jump_power`
    }
  }
};

const state = {
  route: "shooter",
  codeMode: "rule",
  rulesEnabled: false,
  completed: false,
  triedInput: false,
  width: 960,
  height: 540,
  keys: new Set(),
  particles: [],
  stars: [],
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
  resetGame(false);
  createStars();
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

  if (resetProgress) {
    state.rulesEnabled = false;
    state.triedInput = false;
    applyRuleBtn.textContent = "修复控制规则";
    applyRuleBtn.classList.remove("is-applied");
    markStep(2, false);
    markStep(3, false);
    markStep(4, false);
    setStatus("等待修复", "");
    gameHint.textContent = routes[state.route].hintLocked;
  }

  updateStats();
}

function setStatus(text, mode) {
  runStatus.textContent = text;
  runStatus.classList.remove("is-live", "is-win");
  if (mode) {
    runStatus.classList.add(mode);
  }
}

function switchRoute(route) {
  state.route = route;
  routeTitle.textContent = routes[route].title;
  document.querySelectorAll(".route-card").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.route === route);
  });
  resetGame(true);
  updateCode();
  addAiMessage(`你选择了「${routes[route].title}」。这节课的知识点不变：按键事件会改变角色坐标。`);
}

function markStep(step, done = true) {
  const item = document.querySelector(`[data-step="${step}"]`);
  if (item) {
    item.classList.toggle("is-done", done);
  }
}

function updateCode() {
  codeView.textContent = routes[state.route].code[state.codeMode];
}

function addAiMessage(text, role = "ai") {
  const node = document.createElement("div");
  node.className = `message ${role}`;
  node.textContent = text;
  chatWindow.appendChild(node);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function pulseHint(text) {
  gameHint.textContent = text;
  gameHint.classList.remove("pulse");
  window.requestAnimationFrame(() => {
    gameHint.classList.add("pulse");
  });
}

function enableRules() {
  state.rulesEnabled = true;
  applyRuleBtn.textContent = "规则已启用";
  applyRuleBtn.classList.add("is-applied");
  setStatus("规则运行中", "is-live");
  pulseHint(routes[state.route].hintLive);
  markStep(3, true);
  addAiMessage("很好，你刚刚把“输入事件”接到了“移动动作”。现在运行游戏，观察坐标数字是不是在变化。");
}

function completeLesson() {
  if (state.completed) {
    return;
  }
  state.completed = true;
  setStatus("任务完成", "is-win");
  markStep(4, true);
  burst(state.player.x, state.player.y, 36, "#ffb43b");
  addAiMessage("通关了。复盘一下：你按下按键触发了事件，事件改变了角色坐标，所以角色到达了目标。");
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

function updateShooter() {
  const player = state.player;
  const speed = 6.2;
  let ax = 0;
  let ay = 0;

  if (state.rulesEnabled) {
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

  const gateX = state.width - 92;
  const gateY = state.height * 0.5;
  if (state.rulesEnabled && Math.hypot(player.x - gateX, player.y - gateY) < 50) {
    completeLesson();
  }
}

function updatePlatform() {
  const player = state.player;
  const ground = state.height - 58;
  const moveSpeed = 5.2;
  const left = state.keys.has("ArrowLeft") || state.keys.has("a");
  const right = state.keys.has("ArrowRight") || state.keys.has("d");
  const jump = state.keys.has("ArrowUp") || state.keys.has("w") || state.keys.has(" ");

  if (state.rulesEnabled) {
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

  const flag = getFlag();
  if (state.rulesEnabled && Math.abs(player.x - flag.x) < 38 && Math.abs(player.y - flag.y) < 70) {
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
  const flag = getFlag();

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
  ctx.fillText(routes[state.route].targetText, 22, 34);

  if (!state.rulesEnabled) {
    ctx.fillStyle = "rgba(239, 101, 72, 0.92)";
    ctx.font = "900 22px Segoe UI, Microsoft YaHei, sans-serif";
    ctx.fillText("输入事件未连接", 22, 66);
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

function updateStats() {
  statX.textContent = Math.round(state.player.x);
  statY.textContent = Math.round(state.player.y);
  statSpeed.textContent = Math.round(Math.hypot(state.player.vx, state.player.vy) * 10) / 10;
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

  if (!state.triedInput) {
    state.triedInput = true;
    markStep(2, true);
    addAiMessage("你已经观察到现象：按键没有效果。一个合理猜测是“输入事件还没有连接到移动动作”。");
  }

  if (!state.rulesEnabled) {
    pulseHint("角色没有动，因为规则编辑器里的“当按下按键，就改变坐标”还没有启用。");
  }
}

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

    const replies = {
      stuck: state.rulesEnabled
        ? "现在规则已经启用，如果仍然动得不对，请观察坐标面板：X 代表左右，Y 代表上下。"
        : "先别急着写代码。你可以先检查三件事：有没有事件、有没有条件、有没有动作。现在缺的是把按键事件接到移动动作。",
      hint: state.rulesEnabled
        ? `提示：朝着目标移动。${state.route === "shooter" ? "能量门在右侧。" : "终点旗帜在右上方，跳跃需要站在地面或平台上。"}`
        : "提示 1：按键本身只是事件。事件发生后，必须有一条规则告诉角色“改变坐标”。",
      code: "这段代码的意思是：检测哪个键被按下，然后改变角色的 x 或 y 坐标。x 变大通常向右，y 变小通常向上。",
      recap: "你可以这样复盘：我按下键盘触发事件；规则判断角色能移动；动作改变坐标；所以角色在画面上移动。"
    };

    addAiMessage(replies[prompt]);
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

applyRuleBtn.addEventListener("click", enableRules);

runBtn.addEventListener("click", () => {
  canvas.focus();
  pulseHint(state.rulesEnabled ? routes[state.route].hintLive : routes[state.route].hintLocked);
});

resetBtn.addEventListener("click", () => {
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
updateCode();
resizeCanvas();
loop();
