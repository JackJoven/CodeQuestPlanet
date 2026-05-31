import * as THREE from "./vendor/three.module.js";

function showStartupError(message) {
  const text = `初始化错误：${message}`;
  const display = () => {
    const banner = document.querySelector("#runBanner");
    if (banner) banner.textContent = text;
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", display, { once: true });
  } else {
    display();
  }
}

window.addEventListener("error", (event) => {
  showStartupError(event.message || "脚本加载失败");
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason instanceof Error ? event.reason.message : String(event.reason || "异步任务失败");
  showStartupError(reason);
});

(function () {
  const storageKey = "signalRunnerNode.progress";
  const canvas = document.querySelector("#gameCanvas");
  const scene3d = safeCreateThreeScene(canvas);
  const ctx = scene3d.ok ? null : canvas.getContext("2d");

  const dom = {
    nodeProgress: document.querySelector("#nodeProgress"),
    resetProgress: document.querySelector("#resetProgressBtn"),
    missionList: document.querySelector("#missionList"),
    missionKicker: document.querySelector("#missionKicker"),
    missionTitle: document.querySelector("#missionTitle"),
    missionConcept: document.querySelector("#missionConcept"),
    missionStory: document.querySelector("#missionStory"),
    missionTarget: document.querySelector("#missionTarget"),
    lessonFocus: document.querySelector("#lessonFocus"),
    lessonCheckpoint: document.querySelector("#lessonCheckpoint"),
    stateHud: document.querySelector("#stateHud"),
    runBanner: document.querySelector("#runBanner"),
    worldBeaconCounter: document.querySelector("#worldBeaconCounter"),
    worldRun: document.querySelector("#worldRunBtn"),
    worldHint: document.querySelector("#worldHintBtn"),
    runState: document.querySelector("#runState"),
    runLog: document.querySelector("#runLog"),
    runBtn: document.querySelector("#runBtn"),
    stepBtn: document.querySelector("#stepBtn"),
    resetBtn: document.querySelector("#resetBtn"),
    undoBtn: document.querySelector("#undoBtn"),
    clearBtn: document.querySelector("#clearBtn"),
    loadReference: document.querySelector("#loadReferenceBtn"),
    commandLimit: document.querySelector("#commandLimit"),
    commandPalette: document.querySelector("#commandPalette"),
    programTabs: document.querySelector("#programTabs"),
    programList: document.querySelector("#programList"),
    programTitle: document.querySelector("#programTitle"),
    activeBoardHint: document.querySelector("#activeBoardHint"),
    codeView: document.querySelector("#codeView"),
    evidenceCard: document.querySelector("#evidenceCard")
  };

  const directions = ["N", "E", "S", "W"];
  const directionLabels = { N: "北", E: "东", S: "南", W: "西" };
  const vectors = {
    N: { x: 0, y: -1 },
    E: { x: 1, y: 0 },
    S: { x: 0, y: 1 },
    W: { x: -1, y: 0 }
  };

  const commandDefs = {
    move: {
      label: "move()",
      name: "前进",
      hint: "沿当前方向走一格",
      kind: "basic",
      code: "move();"
    },
    left: {
      label: "turnLeft()",
      name: "左转",
      hint: "方向逆时针旋转",
      kind: "basic",
      code: "turnLeft();"
    },
    right: {
      label: "turnRight()",
      name: "右转",
      hint: "方向顺时针旋转",
      kind: "basic",
      code: "turnRight();"
    },
    collect: {
      label: "collect()",
      name: "采集",
      hint: "采集当前格信标",
      kind: "system",
      code: "collect();"
    },
    upload: {
      label: "upload()",
      name: "上传",
      hint: "在中继站完成任务",
      kind: "system",
      code: "upload();"
    },
    shield: {
      label: "shield()",
      name: "开盾",
      hint: "抵消下一格危险",
      kind: "system",
      code: "shield();"
    },
    ifHazardShield: {
      label: "if hazard",
      name: "危险判断",
      hint: "前方危险才开盾",
      kind: "logic",
      code: "if (scanAhead() === \"hazard\") shield();"
    },
    ifWallRight: {
      label: "if wall",
      name: "墙面判断",
      hint: "前方 blocked 就右转，否则前进",
      kind: "logic",
      code: "if (blockedAhead()) turnRight(); else move();"
    },
    repeat2: {
      label: "repeat(2)",
      name: "循环 2 次",
      hint: "连续执行两次 move",
      kind: "logic",
      code: "repeat(2) { move(); }"
    },
    repeat3: {
      label: "repeat(3)",
      name: "循环 3 次",
      hint: "连续执行三次 move",
      kind: "logic",
      code: "repeat(3) { move(); }"
    },
    callRoute: {
      label: "routeA()",
      name: "调用函数",
      hint: "执行 routeA 里的指令",
      kind: "logic",
      code: "routeA();"
    }
  };

  const missions = [
    {
      id: "sequence",
      title: "启动巡航",
      concept: "序列",
      lesson: "Lesson 01",
      story: "信标无人机刚刚上线。它只会按你排好的指令一条一条执行。",
      target: "采集绿色信标，再到中继站上传。",
      focus: "代码按顺序执行",
      checkpoint: "学生要能解释为什么 collect() 必须发生在无人机站到信标格之后。",
      grid: [
        "__ggg__",
        "_SsBsR_",
        "_ggggg_",
        "__ggg__"
      ],
      startDir: "E",
      energy: 12,
      required: 1,
      limit: 8,
      allowed: ["move", "collect", "upload"],
      solution: ["move", "move", "collect", "move", "move", "upload"]
    },
    {
      id: "route-debug",
      title: "路径调试",
      concept: "转向与日志",
      lesson: "Lesson 02",
      story: "维修区出现阻挡。程序撞墙时会停机，日志会告诉你是哪一步出了问题。",
      target: "绕过阻挡，采集下方信标后上传。",
      focus: "用失败日志修正程序",
      checkpoint: "学生要能根据“撞墙”或“空采集”的日志定位是哪条指令顺序错了。",
      grid: [
        "__gssg__",
        "_S#ssRg_",
        "_g#~~sg_",
        "_sBsssg_",
        "__ggsg__"
      ],
      startDir: "E",
      energy: 18,
      required: 1,
      limit: 16,
      allowed: ["move", "left", "right", "collect", "upload", "ifWallRight"],
      solution: ["ifWallRight", "move", "move", "left", "move", "collect", "move", "move", "move", "left", "move", "move", "upload"]
    },
    {
      id: "sensor",
      title: "危险传感器",
      concept: "条件判断",
      lesson: "Lesson 03",
      story: "前方有红色辐射格。直接穿过去会损失能量，传感器可以先判断再开盾。",
      target: "只在危险前开盾，保留能量完成上传。",
      focus: "if 条件不是装饰，它改变下一步行为",
      checkpoint: "学生要能说明 ifHazardShield 只有在前方是危险格时才会真正开盾。",
      grid: [
        "__gggg__",
        "_SgHBsR_",
        "_gg~~ss_",
        "__gssg__"
      ],
      startDir: "E",
      energy: 14,
      required: 1,
      limit: 10,
      allowed: ["move", "collect", "upload", "shield", "ifHazardShield"],
      solution: ["move", "ifHazardShield", "move", "move", "collect", "move", "move", "upload"]
    },
    {
      id: "loop",
      title: "压缩重复",
      concept: "循环",
      lesson: "Lesson 04",
      story: "长直线路径会让程序变得很啰嗦。循环可以把重复移动压成一个清楚的意图。",
      target: "用 repeat 指令减少程序长度，同时完成采集与上传。",
      focus: "循环表达重复模式",
      checkpoint: "学生要能把三个连续 move() 替换成 repeat(3)，并验证结果没有改变。",
      grid: [
        "__ggssss__",
        "_SsssBssR_",
        "_ggg~~ssg_",
        "__ggssss__"
      ],
      startDir: "E",
      energy: 16,
      required: 1,
      limit: 8,
      allowed: ["move", "collect", "upload", "repeat2", "repeat3"],
      solution: ["repeat3", "move", "collect", "repeat3", "upload"]
    },
    {
      id: "function",
      title: "路线函数",
      concept: "函数",
      lesson: "Lesson 05",
      story: "同一段短冲刺会被用两次。把它放进 routeA()，主程序就会更像一张计划图。",
      target: "定义 routeA()，在主程序里调用它两次。",
      focus: "函数把一段稳定动作命名",
      checkpoint: "学生要能说清 routeA() 被调用时，会执行函数里已经定义好的两次前进。",
      grid: [
        "_ggssg_",
        "_S.Bsg_",
        "_ggssg_",
        "__sR.__",
        "__gss__"
      ],
      startDir: "E",
      energy: 14,
      required: 1,
      limit: 8,
      functionEnabled: true,
      allowed: ["move", "right", "collect", "upload", "repeat2", "callRoute"],
      solution: ["callRoute", "collect", "right", "callRoute", "upload"],
      solutionFn: ["repeat2"]
    },
    {
      id: "capstone",
      title: "三塔同步",
      concept: "综合作品",
      lesson: "Lesson 06",
      story: "最后的网络区需要采集三座信标。你要同时考虑路径、危险、循环和上传条件。",
      target: "采集 3 座信标，在能量耗尽前回到中继站上传。",
      focus: "综合调试：先让它能跑，再让它跑得清楚",
      checkpoint: "学生要能用日志证明：三座信标都被采集，危险格被处理，最后在中继站上传。",
      grid: [
        "__ggssss__",
        "_SssB.H.R_",
        "_##~~sssg_",
        "_ssBssBsg_",
        "__ggssss__"
      ],
      startDir: "E",
      energy: 28,
      required: 3,
      limit: 24,
      allowed: ["move", "left", "right", "collect", "upload", "shield", "ifHazardShield", "repeat2", "repeat3"],
      solution: ["repeat3", "collect", "move", "ifHazardShield", "move", "right", "repeat2", "collect", "right", "repeat3", "collect", "right", "right", "repeat3", "repeat2", "left", "repeat2", "upload"]
    }
  ];

  let currentMissionIndex = 0;
  let activeBoard = "main";
  let program = [];
  let routeProgram = [];
  let completed = loadProgress();
  let sim = null;
  let runTimer = null;
  let animationFrame = null;
  let celebrationUntil = 0;

  function loadProgress() {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      return new Set();
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...completed]));
    } catch (error) {
      // Progress is a convenience only; the game still works without storage.
    }
  }

  function mission() {
    return missions[currentMissionIndex];
  }

  function unlockedCount() {
    return Math.min(missions.length - 1, completed.size);
  }

  function parseGrid(source) {
    const data = {
      width: source[0].length,
      height: source.length,
      start: { x: 0, y: 0 },
      walls: new Set(),
      hazards: new Set(),
      beacons: new Map(),
      voids: new Set(),
      waters: new Set(),
      materials: new Map(),
      relay: { x: 0, y: 0 }
    };

    source.forEach((row, y) => {
      [...row].forEach((tile, x) => {
        const key = tileKey(x, y);
        if (tile === "_" || tile === " ") data.voids.add(key);
        if (tile === "~") {
          data.voids.add(key);
          data.waters.add(key);
        }
        if (tile === "s") data.materials.set(key, "sand");
        if (tile === "g") data.materials.set(key, "grass");
        if (tile === "S") data.start = { x, y };
        if (tile === "#") data.walls.add(key);
        if (tile === "H") data.hazards.add(key);
        if (tile === "B") data.beacons.set(key, { x, y });
        if (tile === "R") data.relay = { x, y };
      });
    });

    return data;
  }

  function tileKey(x, y) {
    return `${x},${y}`;
  }

  function turn(dir, offset) {
    const index = directions.indexOf(dir);
    return directions[(index + offset + directions.length) % directions.length];
  }

  function currentTargetProgram() {
    return activeBoard === "route" ? routeProgram : program;
  }

  function setCurrentTargetProgram(next) {
    if (activeBoard === "route") {
      routeProgram = next;
    } else {
      program = next;
    }
  }

  function resetSimulation(keepLog = false) {
    stopAutoRun();
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    const grid = parseGrid(mission().grid);
    sim = {
      grid,
      x: grid.start.x,
      y: grid.start.y,
      dir: mission().startDir,
      energy: mission().energy,
      shield: 0,
      collected: new Set(),
      queue: [],
      queueIndex: 0,
      expanded: false,
      failed: false,
      completed: false,
      message: "准备编程",
      logs: keepLog && sim ? sim.logs.slice(0, 4) : ["系统上线：等待运行程序。"],
      path: [{ x: grid.start.x, y: grid.start.y }],
      motion: null
    };
  }

  function expandProgram() {
    const expanded = [];
    const pushCommand = (command, origin) => {
      if (command === "repeat2") {
        expanded.push({ id: "move", origin });
        expanded.push({ id: "move", origin });
        return;
      }
      if (command === "repeat3") {
        expanded.push({ id: "move", origin });
        expanded.push({ id: "move", origin });
        expanded.push({ id: "move", origin });
        return;
      }
      if (command === "callRoute") {
        if (!routeProgram.length) {
          expanded.push({ id: "missingRoute", origin });
          return;
        }
        routeProgram.forEach((item) => pushCommand(item, "route"));
        return;
      }
      expanded.push({ id: command, origin });
    };

    program.forEach((item) => pushCommand(item, "main"));
    sim.queue = expanded;
    sim.queueIndex = 0;
    sim.expanded = true;
  }

  function log(message, type = "normal") {
    sim.logs.unshift({ message, type });
    sim.logs = sim.logs.slice(0, 8);
  }

  function fail(message) {
    sim.failed = true;
    sim.message = "任务失败";
    log(message, "error");
    stopAutoRun();
  }

  function complete(message) {
    sim.completed = true;
    sim.message = "任务完成";
    log(message, "success");
    completed.add(mission().id);
    saveProgress();
    celebrationUntil = performance.now() + 1600;
    stopAutoRun();
  }

  function frontTile() {
    const vector = vectors[sim.dir];
    return { x: sim.x + vector.x, y: sim.y + vector.y };
  }

  function isBlocked(x, y) {
    return x < 0
      || y < 0
      || x >= sim.grid.width
      || y >= sim.grid.height
      || sim.grid.voids.has(tileKey(x, y))
      || sim.grid.walls.has(tileKey(x, y));
  }

  function frontKind() {
    const next = frontTile();
    if (isBlocked(next.x, next.y)) return "blocked";
    if (sim.grid.hazards.has(tileKey(next.x, next.y))) return "hazard";
    return "clear";
  }

  function spendEnergy(amount, reason) {
    sim.energy -= amount;
    if (sim.energy <= 0) {
      fail(`${reason}，能量耗尽。`);
      return false;
    }
    return true;
  }

  function startMotion(details) {
    const now = performance.now();
    sim.motion = {
      ...details,
      startedAt: now,
      endsAt: now + details.duration
    };
  }

  function motionIsActive() {
    return Boolean(sim?.motion && performance.now() < sim.motion.endsAt);
  }

  function scheduleMotionFrames() {
    if (animationFrame || !motionIsActive()) return;

    const tick = () => {
      animationFrame = null;
      if (!sim?.motion) return;

      drawGrid();
      if (motionIsActive()) {
        animationFrame = window.requestAnimationFrame(tick);
      } else {
        sim.motion = null;
        drawGrid();
      }
    };

    animationFrame = window.requestAnimationFrame(tick);
  }

  function moveForward() {
    const next = frontTile();
    if (isBlocked(next.x, next.y)) {
      fail(`撞到阻挡：当前位置 (${sim.x}, ${sim.y})，朝向${directionLabels[sim.dir]}。`);
      return;
    }

    if (!spendEnergy(1, "移动消耗能量")) return;

    const hazard = sim.grid.hazards.has(tileKey(next.x, next.y));
    startMotion({
      type: "move",
      fromX: sim.x,
      fromY: sim.y,
      toX: next.x,
      toY: next.y,
      fromDir: sim.dir,
      toDir: sim.dir,
      duration: 360
    });
    sim.x = next.x;
    sim.y = next.y;
    sim.path.push({ x: sim.x, y: sim.y });

    if (hazard) {
      if (sim.shield > 0) {
        sim.shield -= 1;
        log("穿过危险格：护盾生效。");
      } else if (spendEnergy(4, "无护盾穿过危险格")) {
        log("无护盾穿过危险格，额外损失 4 点能量。", "error");
      }
    } else {
      log(`前进到 (${sim.x}, ${sim.y})。`);
    }
  }

  function executeCommand(id) {
    if (sim.failed || sim.completed) return;

    if (id === "missingRoute") {
      fail("调用 routeA() 失败：函数里还没有指令。");
      return;
    }

    if (id === "move") {
      moveForward();
    } else if (id === "left") {
      const fromDir = sim.dir;
      sim.dir = turn(sim.dir, -1);
      startMotion({ type: "turn", fromX: sim.x, fromY: sim.y, toX: sim.x, toY: sim.y, fromDir, toDir: sim.dir, duration: 240 });
      log(`左转，当前朝向${directionLabels[sim.dir]}。`);
    } else if (id === "right") {
      const fromDir = sim.dir;
      sim.dir = turn(sim.dir, 1);
      startMotion({ type: "turn", fromX: sim.x, fromY: sim.y, toX: sim.x, toY: sim.y, fromDir, toDir: sim.dir, duration: 240 });
      log(`右转，当前朝向${directionLabels[sim.dir]}。`);
    } else if (id === "collect") {
      const key = tileKey(sim.x, sim.y);
      if (sim.grid.beacons.has(key) && !sim.collected.has(key)) {
        sim.collected.add(key);
        log(`采集成功：${sim.collected.size} / ${mission().required}。`, "success");
      } else {
        fail("采集失败：当前位置没有可采集信标。");
      }
    } else if (id === "upload") {
      const onRelay = sim.x === sim.grid.relay.x && sim.y === sim.grid.relay.y;
      if (!onRelay) {
        fail("上传失败：无人机不在中继站。");
      } else if (sim.collected.size < mission().required) {
        fail(`上传失败：还需要 ${mission().required - sim.collected.size} 座信标。`);
      } else {
        complete("上传成功：本关过关。");
      }
    } else if (id === "shield") {
      if (spendEnergy(1, "开盾消耗能量")) {
        sim.shield = 1;
        log("护盾已开启，可抵消下一格危险。");
      }
    } else if (id === "ifHazardShield") {
      if (frontKind() === "hazard") {
        if (spendEnergy(1, "条件开盾消耗能量")) {
          sim.shield = 1;
          log("条件成立：前方危险，自动开盾。");
        }
      } else {
        log("条件不成立：前方不是危险格。");
      }
    } else if (id === "ifWallRight") {
      if (frontKind() === "blocked") {
        const fromDir = sim.dir;
        sim.dir = turn(sim.dir, 1);
        startMotion({ type: "turn", fromX: sim.x, fromY: sim.y, toX: sim.x, toY: sim.y, fromDir, toDir: sim.dir, duration: 240 });
        log(`条件成立：前方 blocked，右转为${directionLabels[sim.dir]}。`);
      } else {
        log("条件不成立：前方可通行，执行前进。");
        moveForward();
      }
    }
  }

  function stepProgram() {
    if (!program.length) {
      sim.message = "程序为空";
      log("主程序还没有指令。", "error");
      render();
      return;
    }

    if (!sim.expanded || sim.failed || sim.completed || sim.queueIndex >= sim.queue.length) {
      resetSimulation(true);
      expandProgram();
    }

    if (!sim.queue.length) {
      fail("程序展开后没有可执行指令。");
      render();
      return;
    }

    const item = sim.queue[sim.queueIndex];
    sim.queueIndex += 1;
    executeCommand(item.id);

    if (!sim.failed && !sim.completed && sim.queueIndex >= sim.queue.length) {
      sim.message = "程序结束";
      log("程序结束，但任务还没有完成。", "error");
    }

    render();
  }

  function runProgram() {
    if (runTimer) {
      stopAutoRun();
      render();
      return;
    }

    resetSimulation();
    expandProgram();
    runTimer = window.setInterval(() => {
      if (sim.failed || sim.completed || sim.queueIndex >= sim.queue.length) {
        stopAutoRun();
        render();
        return;
      }
      stepProgram();
    }, 420);
    stepProgram();
  }

  function stopAutoRun() {
    if (runTimer) {
      window.clearInterval(runTimer);
      runTimer = null;
    }
  }

  function addCommand(command) {
    const m = mission();
    const target = currentTargetProgram();
    const limit = activeBoard === "route" ? 6 : m.limit;
    if (target.length >= limit) return;
    if (!m.allowed.includes(command)) return;
    if (activeBoard === "route" && ["upload", "collect", "callRoute"].includes(command)) return;

    setCurrentTargetProgram([...target, command]);
    resetSimulation(true);
    render();
  }

  function removeCommand(index) {
    const target = currentTargetProgram();
    setCurrentTargetProgram(target.filter((_, itemIndex) => itemIndex !== index));
    resetSimulation(true);
    render();
  }

  function selectMission(index) {
    if (index > unlockedCount()) return;
    stopAutoRun();
    currentMissionIndex = index;
    activeBoard = "main";
    program = [];
    routeProgram = [];
    resetSimulation();
    render();
  }

  function loadReferenceProgram() {
    program = mission().solution.slice();
    routeProgram = mission().solutionFn ? mission().solutionFn.slice() : [];
    activeBoard = "main";
    resetSimulation();
    render();
  }

  function formatCommand(id) {
    const command = commandDefs[id];
    return command ? command.label : id;
  }

  function renderMissionList() {
    const unlocked = unlockedCount();
    dom.missionList.innerHTML = missions.map((item, index) => {
      const current = index === currentMissionIndex ? " is-current" : "";
      const completeClass = completed.has(item.id) ? " is-complete" : "";
      const locked = index > unlocked ? " is-locked" : "";
      const disabled = index > unlocked ? "disabled" : "";
      return `
        <button class="mission-button${current}${completeClass}${locked}" data-mission="${index}" ${disabled} type="button">
          <span>${item.lesson}</span>
          <strong>${item.title}</strong>
          <small>${item.concept}</small>
        </button>
      `;
    }).join("");
  }

  function renderBrief() {
    const m = mission();
    dom.nodeProgress.textContent = `${completed.size} / ${missions.length} 完成`;
    dom.missionKicker.textContent = m.lesson;
    dom.missionTitle.textContent = m.title;
    dom.missionConcept.textContent = m.concept;
    dom.missionStory.textContent = m.story;
    dom.missionTarget.textContent = m.target;
    dom.lessonFocus.textContent = m.focus;
    dom.lessonCheckpoint.textContent = m.checkpoint;
    dom.runBanner.textContent = sim.message;
    dom.worldBeaconCounter.textContent = `${sim.collected.size}/${m.required}`;
    dom.runState.textContent = sim.completed ? "已过关" : sim.failed ? "需调试" : runTimer ? "运行中" : "待运行";
    dom.programTabs.classList.toggle("is-visible", Boolean(m.functionEnabled));
    if (!m.functionEnabled && activeBoard === "route") activeBoard = "main";
  }

  function renderHud() {
    const rows = [
      ["位置", `(${sim.x}, ${sim.y})`],
      ["朝向", directionLabels[sim.dir]],
      ["能量", sim.energy],
      ["信标", `${sim.collected.size} / ${mission().required}`]
    ];

    dom.stateHud.innerHTML = rows.map(([label, value]) => `
      <div class="hud-item">
        <small>${label}</small>
        <strong>${value}</strong>
      </div>
    `).join("");
  }

  function renderPalette() {
    const m = mission();
    const target = currentTargetProgram();
    const limit = activeBoard === "route" ? 6 : m.limit;
    dom.commandLimit.textContent = `${target.length} / ${limit}`;
    dom.commandPalette.innerHTML = m.allowed.map((id) => {
      const command = commandDefs[id];
      const blockedInRoute = activeBoard === "route" && ["upload", "collect", "callRoute"].includes(id);
      const disabled = target.length >= limit || blockedInRoute ? "disabled" : "";
      const style = command.kind === "logic" ? " is-logic" : command.kind === "system" ? " is-system" : "";
      return `
        <button class="command-button${style}" data-command="${id}" ${disabled} type="button">
          <strong>${command.name}</strong>
          <small>${command.label} · ${command.hint}</small>
        </button>
      `;
    }).join("");
  }

  function renderProgramTabs() {
    [...dom.programTabs.querySelectorAll(".tab-button")].forEach((button) => {
      button.classList.toggle("is-active", button.dataset.board === activeBoard);
    });
  }

  function renderProgramList() {
    const target = currentTargetProgram();
    dom.programTitle.textContent = activeBoard === "route" ? "函数 routeA()" : "主程序";
    dom.activeBoardHint.textContent = activeBoard === "route"
      ? "函数只放移动、转向和循环"
      : "点击指令加入主程序";

    if (!target.length) {
      dom.programList.className = "program-list is-empty";
      dom.programList.innerHTML = activeBoard === "route" ? "routeA() 还没有动作" : "主程序还没有指令";
      return;
    }

    dom.programList.className = "program-list";
    dom.programList.innerHTML = target.map((id, index) => `
      <li class="program-chip" data-remove="${index}">
        <span>${index + 1}</span>
        <strong>${formatCommand(id)}</strong>
        <button type="button" aria-label="移除 ${formatCommand(id)}">×</button>
      </li>
    `).join("");
  }

  function renderCodeView() {
    const mainLines = program.length
      ? program.map((id) => `  ${commandDefs[id].code}`)
      : ["  // add commands"];
    const routeLines = routeProgram.length
      ? routeProgram.map((id) => `  ${commandDefs[id].code}`)
      : ["  // define routeA"];

    const functionBlock = mission().functionEnabled
      ? `function routeA() {\n${routeLines.join("\n")}\n}\n\n`
      : "";

    dom.codeView.textContent = `${functionBlock}function main() {\n${mainLines.join("\n")}\n}`;
  }

  function renderLog() {
    dom.runLog.innerHTML = sim.logs.map((item) => {
      const entry = typeof item === "string" ? { message: item, type: "normal" } : item;
      const className = entry.type === "error" ? " is-error" : entry.type === "success" ? " is-success" : "";
      return `<li class="${className}">${entry.message}</li>`;
    }).join("");
  }

  function renderEvidence() {
    const allDone = missions.every((item) => completed.has(item.id));
    if (!allDone) {
      const next = missions.find((item) => !completed.has(item.id));
      dom.evidenceCard.innerHTML = `
        <div class="card-row">
          <strong>当前进度</strong>
          <p>完成所有 6 节后，这里会生成综合作品卡。下一关：${next ? next.title : "继续调试"}。</p>
        </div>
      `;
      return;
    }

    dom.evidenceCard.innerHTML = `
      <div class="card-row">
        <strong>作品名</strong>
        <p>Signal Runner：三塔同步无人机</p>
      </div>
      <div class="card-row">
        <strong>核心代码能力</strong>
        <p>序列、条件判断、循环压缩、函数封装、综合调试。</p>
      </div>
      <div class="card-row">
        <strong>最终验证</strong>
        <p>第 6 关需要采集 3 座信标、处理危险格，并在中继站上传。</p>
      </div>
    `;
  }

  function drawGrid() {
    syncCanvasSize();
    if (scene3d.ok) {
      scene3d.render(sim, mission(), {
        hasTile,
        walkableTiles,
        tileKey,
        hash2,
        directionIndex: directions.indexOf(sim.dir)
      });
      return;
    }

    if (!ctx) {
      showStartupError("浏览器没有可用的绘图环境");
      return;
    }

    const m = mission();
    const grid = sim.grid;
    const layout = createIsoLayout(grid);

    drawSky();
    drawWaterfalls(layout, grid);
    drawIslandShadow(layout, grid);

    for (let y = 0; y < grid.height; y += 1) {
      for (let x = 0; x < grid.width; x += 1) {
        if (hasTile(grid, x, y)) {
          drawIsoTile(layout, grid, x, y);
        }
      }
    }

    drawIsoPath(layout);

    const props = [];
    props.push({ depth: grid.start.x + grid.start.y + 0.05, draw: () => drawStartPad(layout, grid.start.x, grid.start.y) });
    props.push({ depth: grid.relay.x + grid.relay.y + 0.15, draw: () => drawRelay(layout, grid.relay.x, grid.relay.y) });

    grid.hazards.forEach((key) => {
      const [x, y] = key.split(",").map(Number);
      props.push({ depth: x + y + 0.12, draw: () => drawHazard(layout, x, y) });
    });

    grid.beacons.forEach((beacon, key) => {
      props.push({ depth: beacon.x + beacon.y + 0.35, draw: () => drawBeacon(layout, beacon.x, beacon.y, sim.collected.has(key)) });
    });

    grid.walls.forEach((key) => {
      const [x, y] = key.split(",").map(Number);
      props.push({ depth: x + y + 0.48, draw: () => drawRockCluster(layout, x, y) });
    });

    for (let y = 0; y < grid.height; y += 1) {
      for (let x = 0; x < grid.width; x += 1) {
        if (shouldDrawPlant(grid, x, y)) {
          props.push({ depth: x + y + 0.42, draw: () => drawPlant(layout, x, y) });
        } else if (shouldDrawPebbles(grid, x, y)) {
          props.push({ depth: x + y + 0.25, draw: () => drawPebbles(layout, x, y) });
        }
      }
    }

    props.push({ depth: sim.x + sim.y + 0.6, draw: () => drawBot(layout, sim.x, sim.y) });

    props.sort((a, b) => a.depth - b.depth).forEach((item) => item.draw());

    if (performance.now() < celebrationUntil) {
      drawCelebration(m.title);
    }
  }

  function syncCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.round(rect.width));
    const height = Math.max(360, Math.round(rect.height));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function createIsoLayout(grid) {
    const bounds = tileBounds(grid);
    const spanX = Math.max(1, bounds.maxX - bounds.minX + 1);
    const spanY = Math.max(1, bounds.maxY - bounds.minY + 1);
    const tileW = Math.min(112, ((canvas.width - 120) * 2) / (spanX + spanY));
    const tileH = tileW * 0.54;
    const blockH = tileW * 0.62;
    const minX = ((bounds.minX - bounds.maxY) * tileW) / 2;
    const maxX = ((bounds.maxX - bounds.minY) * tileW) / 2;
    const maxY = ((bounds.maxX + bounds.maxY) * tileH) / 2;
    const originX = canvas.width / 2 - (minX + maxX) / 2;
    const originY = Math.max(118, (canvas.height - maxY - blockH) / 2 + 42);
    return { tileW, tileH, blockH, originX, originY };
  }

  function isoPoint(layout, x, y, z = 0) {
    return {
      x: layout.originX + (x - y) * layout.tileW / 2,
      y: layout.originY + (x + y) * layout.tileH / 2 - z
    };
  }

  function tileCenter(layout, x, y, z = 0) {
    const p = isoPoint(layout, x, y, z);
    return { x: p.x, y: p.y + layout.tileH / 2 };
  }

  function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#c7efff");
    gradient.addColorStop(0.55, "#e9fbff");
    gradient.addColorStop(1, "#ffffff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCloud(120, 104, 0.9);
    drawCloud(805, 96, 0.72);
    drawCloud(725, 520, 0.56);
  }

  function drawCloud(x, y, scale) {
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(x, y, 70 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 45 * scale, y - 6 * scale, 44 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 42 * scale, y + 4 * scale, 36 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawWaterfalls(layout, grid) {
    const tiles = walkableTiles(grid);
    const frontTiles = tiles
      .filter((tile) => !hasTile(grid, tile.x, tile.y + 1))
      .sort((a, b) => a.x - b.x);
    const points = [
      { ...(frontTiles[0] || tiles[0]), side: "left" },
      { ...(frontTiles[Math.max(0, frontTiles.length - 2)] || tiles[tiles.length - 1]), side: "front" }
    ];

    points.forEach((point) => {
      const c = tileCenter(layout, point.x, point.y);
      const width = layout.tileW * 0.42;
      const topY = c.y + layout.blockH * 0.2;
      const bottomY = canvas.height + 40;
      const x = point.side === "left" ? c.x - layout.tileW * 0.52 : c.x + layout.tileW * 0.12;
      const gradient = ctx.createLinearGradient(x, topY, x, bottomY);
      gradient.addColorStop(0, "rgba(35, 151, 218, 0.95)");
      gradient.addColorStop(0.58, "rgba(42, 150, 220, 0.72)");
      gradient.addColorStop(1, "rgba(42, 150, 220, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x - width / 2, topY);
      ctx.lineTo(x + width / 2, topY + layout.tileH * 0.18);
      ctx.lineTo(x + width * 0.36, bottomY);
      ctx.lineTo(x - width * 0.62, bottomY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.48)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x - width * 0.28 + i * width * 0.22, topY + 12);
        ctx.lineTo(x - width * 0.38 + i * width * 0.18, bottomY - 20);
        ctx.stroke();
      }
    });
  }

  function drawIslandShadow(layout, grid) {
    const centers = walkableTiles(grid).map((tile) => tileCenter(layout, tile.x, tile.y));
    const cx = centers.reduce((sum, item) => sum + item.x, 0) / centers.length;
    const cy = Math.max(...centers.map((item) => item.y)) + layout.blockH * 0.74;
    ctx.fillStyle = "rgba(45, 76, 88, 0.14)";
    ctx.beginPath();
    ctx.ellipse(cx, cy, layout.tileW * Math.max(2.5, grid.width * 0.42), layout.tileH * Math.max(1.8, grid.height * 0.56), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawIsoTile(layout, grid, x, y) {
    const top = isoPoint(layout, x, y);
    const right = { x: top.x + layout.tileW / 2, y: top.y + layout.tileH / 2 };
    const bottom = { x: top.x, y: top.y + layout.tileH };
    const left = { x: top.x - layout.tileW / 2, y: top.y + layout.tileH / 2 };
    const downRight = { x: right.x, y: right.y + layout.blockH };
    const downBottom = { x: bottom.x, y: bottom.y + layout.blockH };
    const downLeft = { x: left.x, y: left.y + layout.blockH };

    if (!hasTile(grid, x, y + 1)) {
      drawPolygon([left, bottom, downBottom, downLeft], "#936034", "rgba(94, 61, 36, 0.24)");
      drawFaceDetails(left, bottom, downBottom, downLeft, layout, x, y);
    }
    if (!hasTile(grid, x + 1, y)) {
      drawPolygon([right, bottom, downBottom, downRight], "#74482b", "rgba(72, 45, 28, 0.28)");
      drawFaceDetails(right, bottom, downBottom, downRight, layout, x + 3, y + 1);
    }

    const grass = (x + y) % 2 === 0 ? "#79bd45" : "#86c84e";
    drawPolygon([top, right, bottom, left], grass, "rgba(45, 107, 51, 0.28)");

    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left.x + layout.tileW * 0.18, left.y);
    ctx.lineTo(top.x, top.y + layout.tileH * 0.2);
    ctx.stroke();

    if (hash2(x, y) % 4 === 0) {
      const c = tileCenter(layout, x, y);
      ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
      ctx.fillRect(c.x - layout.tileW * 0.18, c.y - layout.tileH * 0.08, layout.tileW * 0.2, 2);
    }
  }

  function drawFaceDetails(a, b, c, d, layout, x, y) {
    const inset = layout.tileW * 0.12;
    const rows = 2 + (hash2(x, y) % 2);
    ctx.strokeStyle = "rgba(57, 42, 30, 0.18)";
    ctx.lineWidth = 2;
    for (let i = 1; i <= rows; i += 1) {
      const t = i / (rows + 1);
      const left = lerpPoint(a, d, t);
      const right = lerpPoint(b, c, t);
      ctx.beginPath();
      ctx.moveTo(left.x + inset, left.y);
      ctx.lineTo(right.x - inset, right.y);
      ctx.stroke();
    }

    if (hash2(x + 1, y + 7) % 3 === 0) {
      const top = lerpPoint(a, b, 0.52);
      ctx.strokeStyle = "rgba(45, 105, 39, 0.7)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(top.x, top.y + 4);
      ctx.bezierCurveTo(top.x - 8, top.y + 28, top.x + 9, top.y + 42, top.x - 4, top.y + 66);
      ctx.stroke();
    }
  }

  function drawIsoPath(layout) {
    if (sim.path.length < 2) return;
    ctx.save();
    ctx.strokeStyle = "rgba(48, 157, 202, 0.68)";
    ctx.lineWidth = Math.max(5, layout.tileW * 0.08);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    sim.path.forEach((point, index) => {
      const c = tileCenter(layout, point.x, point.y, 2);
      if (index === 0) ctx.moveTo(c.x, c.y);
      else ctx.lineTo(c.x, c.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawStartPad(layout, x, y) {
    const c = tileCenter(layout, x, y, 2);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(1, 0.52);
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.beginPath();
    ctx.arc(0, 0, layout.tileW * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2d8ee4";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, layout.tileW * 0.21, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawRelay(layout, x, y) {
    const c = tileCenter(layout, x, y, 3);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(1, 0.52);
    ctx.fillStyle = "#f7efe0";
    ctx.beginPath();
    ctx.arc(0, 0, layout.tileW * 0.31, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2b9bd8";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, layout.tileW * 0.24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#b742d6";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, layout.tileW * 0.13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawHazard(layout, x, y) {
    const c = tileCenter(layout, x, y, 4);
    ctx.save();
    ctx.translate(c.x, c.y - layout.tileH * 0.02);
    ctx.scale(1, 0.52);
    ctx.fillStyle = "rgba(255, 219, 215, 0.88)";
    ctx.beginPath();
    ctx.arc(0, 0, layout.tileW * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = "#d65245";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y - layout.tileH * 0.35);
    ctx.lineTo(c.x + layout.tileW * 0.2, c.y + layout.tileH * 0.05);
    ctx.lineTo(c.x - layout.tileW * 0.2, c.y + layout.tileH * 0.05);
    ctx.closePath();
    ctx.stroke();
  }

  function drawBeacon(layout, x, y, collected) {
    const c = tileCenter(layout, x, y, 0);
    if (collected) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(1, 0.45);
      ctx.strokeStyle = "rgba(39, 139, 220, 0.48)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, layout.tileW * 0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(c.x, c.y - layout.tileH * 0.52);
    ctx.fillStyle = "rgba(161, 31, 49, 0.2)";
    ctx.beginPath();
    ctx.ellipse(0, layout.tileH * 0.56, layout.tileW * 0.2, layout.tileH * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    const gem = ctx.createLinearGradient(-12, -30, 14, 26);
    gem.addColorStop(0, "#ffaaa3");
    gem.addColorStop(0.44, "#f43751");
    gem.addColorStop(1, "#b61135");
    ctx.fillStyle = gem;
    ctx.beginPath();
    ctx.moveTo(0, -layout.tileH * 0.5);
    ctx.lineTo(layout.tileW * 0.19, -layout.tileH * 0.16);
    ctx.lineTo(layout.tileW * 0.12, layout.tileH * 0.42);
    ctx.lineTo(-layout.tileW * 0.12, layout.tileH * 0.42);
    ctx.lineTo(-layout.tileW * 0.19, -layout.tileH * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.ellipse(-layout.tileW * 0.06, -layout.tileH * 0.18, layout.tileW * 0.05, layout.tileH * 0.11, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawRockCluster(layout, x, y) {
    const c = tileCenter(layout, x, y, 0);
    drawRock(c.x - layout.tileW * 0.12, c.y - layout.tileH * 0.08, layout.tileW * 0.28, layout.tileH * 0.66);
    drawRock(c.x + layout.tileW * 0.08, c.y - layout.tileH * 0.02, layout.tileW * 0.24, layout.tileH * 0.5);
    drawRock(c.x, c.y + layout.tileH * 0.1, layout.tileW * 0.18, layout.tileH * 0.34);
  }

  function drawRock(x, y, w, h) {
    const gradient = ctx.createLinearGradient(x - w, y - h, x + w, y + h);
    gradient.addColorStop(0, "#d9e0e5");
    gradient.addColorStop(0.55, "#8d9aa7");
    gradient.addColorStop(1, "#5f6c7a");
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "rgba(65, 77, 89, 0.24)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.42, y + h * 0.32);
    ctx.lineTo(x - w * 0.5, y - h * 0.1);
    ctx.lineTo(x - w * 0.18, y - h * 0.5);
    ctx.lineTo(x + w * 0.3, y - h * 0.42);
    ctx.lineTo(x + w * 0.5, y + h * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawPlant(layout, x, y) {
    const c = tileCenter(layout, x, y);
    const offset = (hash2(x, y) % 7 - 3) * 2;
    ctx.fillStyle = "#4c8f2f";
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.ellipse(c.x - 10 + i * 6 + offset, c.y + layout.tileH * 0.18, 5, 12, (i - 1.5) * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPebbles(layout, x, y) {
    const c = tileCenter(layout, x, y);
    ctx.fillStyle = "rgba(111, 120, 120, 0.62)";
    for (let i = 0; i < 3; i += 1) {
      const shift = hash2(x + i, y + 3) % 18;
      ctx.beginPath();
      ctx.ellipse(c.x - 12 + shift, c.y - 4 + i * 4, 5, 3, 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBot(layout, x, y) {
    const c = tileCenter(layout, x, y, 0);
    const size = layout.tileW;
    ctx.save();
    ctx.translate(c.x, c.y - size * 0.38);

    ctx.fillStyle = "rgba(73, 70, 58, 0.22)";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.42, size * 0.22, size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ac7030";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, size * 0.06);
    ctx.quadraticCurveTo(-size * 0.46, size * 0.08, -size * 0.45, size * 0.3);
    ctx.moveTo(size * 0.2, size * 0.06);
    ctx.quadraticCurveTo(size * 0.46, size * 0.08, size * 0.45, size * 0.3);
    ctx.stroke();

    const body = ctx.createLinearGradient(-size * 0.2, -size * 0.42, size * 0.24, size * 0.38);
    body.addColorStop(0, "#ffc56b");
    body.addColorStop(0.5, "#ee9235");
    body.addColorStop(1, "#b85c22");
    ctx.fillStyle = body;
    ctx.strokeStyle = "#93491f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.48);
    ctx.bezierCurveTo(size * 0.28, -size * 0.32, size * 0.33, size * 0.16, size * 0.12, size * 0.36);
    ctx.bezierCurveTo(-size * 0.12, size * 0.48, -size * 0.32, size * 0.14, -size * 0.27, -size * 0.15);
    ctx.bezierCurveTo(-size * 0.23, -size * 0.35, -size * 0.1, -size * 0.45, 0, -size * 0.48);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#65341e";
    ctx.fillRect(-size * 0.2, size * 0.03, size * 0.4, size * 0.05);
    ctx.fillStyle = "#e8fff8";
    ctx.strokeStyle = "#2c7671";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(size * 0.12, -size * 0.23, size * 0.13, size * 0.08, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const angle = { N: -Math.PI / 2, E: 0, S: Math.PI / 2, W: Math.PI }[sim.dir];
    ctx.rotate(angle);
    ctx.fillStyle = "#245064";
    ctx.beginPath();
    ctx.moveTo(size * 0.34, 0);
    ctx.lineTo(size * 0.18, -size * 0.1);
    ctx.lineTo(size * 0.18, size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (sim.shield > 0) {
      ctx.strokeStyle = "rgba(38, 151, 220, 0.66)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y - size * 0.42, size * 0.36, size * 0.52, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawPolygon(points, fill, stroke) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function hasTile(grid, x, y) {
    return x >= 0
      && y >= 0
      && x < grid.width
      && y < grid.height
      && !grid.voids.has(tileKey(x, y));
  }

  function walkableTiles(grid) {
    const tiles = [];
    for (let y = 0; y < grid.height; y += 1) {
      for (let x = 0; x < grid.width; x += 1) {
        if (hasTile(grid, x, y)) tiles.push({ x, y });
      }
    }
    return tiles;
  }

  function tileBounds(grid) {
    const tiles = walkableTiles(grid);
    return {
      minX: Math.min(...tiles.map((tile) => tile.x)),
      maxX: Math.max(...tiles.map((tile) => tile.x)),
      minY: Math.min(...tiles.map((tile) => tile.y)),
      maxY: Math.max(...tiles.map((tile) => tile.y))
    };
  }

  function lerpPoint(a, b, t) {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t
    };
  }

  function hash2(x, y) {
    return Math.abs((x * 73856093) ^ (y * 19349663)) % 97;
  }

  function isOccupied(grid, x, y) {
    const key = tileKey(x, y);
    return !hasTile(grid, x, y)
      || grid.walls.has(key)
      || grid.hazards.has(key)
      || grid.beacons.has(key)
      || (grid.relay.x === x && grid.relay.y === y)
      || (grid.start.x === x && grid.start.y === y);
  }

  function shouldDrawPlant(grid, x, y) {
    return !isOccupied(grid, x, y) && hash2(x, y) % 17 === 0;
  }

  function shouldDrawPebbles(grid, x, y) {
    return !isOccupied(grid, x, y) && hash2(x + 9, y + 5) % 13 === 0;
  }

  function safeCreateThreeScene(targetCanvas) {
    try {
      return createThreeScene(targetCanvas);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || "3D 初始化失败");
      console.error("[SignalRunner] 3D init failed", error);
      return {
        ok: true,
        render() {
          showStartupError(message);
        }
      };
    }
  }

  function makeTerrainTexture(kind) {
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 256;
    textureCanvas.height = 256;
    const paint = textureCanvas.getContext("2d");

    const palettes = {
      grass: {
        base: "#7fc246",
        light: "#9fdc61",
        dark: "#5a9c34",
        mark: "rgba(246,255,208,0.14)",
        grain: "rgba(34,70,24,0.08)"
      },
      sand: {
        base: "#eac681",
        light: "#f8dfa9",
        dark: "#d6aa65",
        mark: "rgba(255,247,217,0.24)",
        grain: "rgba(112,70,28,0.07)"
      },
      water: {
        base: "#168ee0",
        light: "#55c8ff",
        dark: "#0864a8",
        mark: "rgba(255,255,255,0.34)",
        grain: "rgba(5,64,118,0.16)"
      }
    };

    const palette = palettes[kind] || palettes.grass;
    const background = paint.createLinearGradient(0, 0, 256, 256);
    background.addColorStop(0, palette.light);
    background.addColorStop(0.42, palette.base);
    background.addColorStop(1, palette.dark);
    paint.fillStyle = background;
    paint.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 90; i += 1) {
      const seed = Math.sin((i + 1) * 97.13) * 10000;
      const x = Math.abs(seed * 37) % 256;
      const y = Math.abs(seed * 53) % 256;
      const size = 1.2 + (Math.abs(seed) % 4.2);
      paint.fillStyle = i % 3 === 0 ? palette.mark : palette.grain;
      paint.globalAlpha = kind === "water" ? 0.38 : 0.14;
      paint.beginPath();
      paint.ellipse(x, y, size * 1.5, size * 0.5, seed % Math.PI, 0, Math.PI * 2);
      paint.fill();
    }

    paint.globalAlpha = 1;
    if (kind === "water") {
      paint.strokeStyle = palette.mark;
      paint.lineWidth = 2;
      for (let y = 30; y < 256; y += 38) {
        paint.beginPath();
        for (let x = 0; x <= 256; x += 14) {
          const wave = y + Math.sin((x + y) * 0.08) * 5;
          if (x === 0) paint.moveTo(x, wave);
          else paint.lineTo(x, wave);
        }
        paint.stroke();
      }
    } else {
      paint.strokeStyle = palette.mark;
      paint.lineWidth = 1.5;
      for (let i = 0; i < 6; i += 1) {
        const x = 18 + i * 38;
        paint.beginPath();
        paint.moveTo(x, 32 + (i % 2) * 28);
        paint.lineTo(x + 26, 24 + (i % 3) * 48);
        paint.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }

  function makeRoundedSlabGeometry(width, height, depth, radius = 0.08, bevel = 0.018) {
    const halfW = width / 2;
    const halfD = depth / 2;
    const r = Math.min(radius, halfW - 0.01, halfD - 0.01);
    const shape = new THREE.Shape();

    shape.moveTo(-halfW + r, -halfD);
    shape.lineTo(halfW - r, -halfD);
    shape.quadraticCurveTo(halfW, -halfD, halfW, -halfD + r);
    shape.lineTo(halfW, halfD - r);
    shape.quadraticCurveTo(halfW, halfD, halfW - r, halfD);
    shape.lineTo(-halfW + r, halfD);
    shape.quadraticCurveTo(-halfW, halfD, -halfW, halfD - r);
    shape.lineTo(-halfW, -halfD + r);
    shape.quadraticCurveTo(-halfW, -halfD, -halfW + r, -halfD);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: bevel,
      bevelThickness: bevel,
      curveSegments: 5
    });

    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, -height / 2, 0);
    geometry.computeVertexNormals();
    return geometry;
  }

  function makeRobotBodyGeometry() {
    const profile = [
      new THREE.Vector2(0.07, 0.02),
      new THREE.Vector2(0.2, 0.08),
      new THREE.Vector2(0.3, 0.28),
      new THREE.Vector2(0.28, 0.5),
      new THREE.Vector2(0.18, 0.68),
      new THREE.Vector2(0.1, 0.8),
      new THREE.Vector2(0.055, 0.87)
    ];
    const geometry = new THREE.LatheGeometry(profile, 32);
    geometry.computeVertexNormals();
    return geometry;
  }

  function createThreeScene(targetCanvas) {
    if (!THREE.WebGLRenderer) return { ok: false, render() {} };

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: targetCanvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
    } catch (error) {
      return { ok: false, render() {} };
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.setClearColor(0xd8f5ff, 0);

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.Fog(0xd8f5ff, 11, 24);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
    const root = new THREE.Group();
    scene.add(root);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x9fbdd2, 2.25);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffffff, 3.15);
    sun.position.set(5.5, 9.5, 5.4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -8;
    sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8;
    sun.shadow.camera.bottom = -8;
    sun.shadow.radius = 4;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xa5dbff, 0.9);
    fill.position.set(-5, 4, -5);
    scene.add(fill);

    const textures = {
      grass: makeTerrainTexture("grass"),
      sand: makeTerrainTexture("sand"),
      water: makeTerrainTexture("water")
    };

    const materials = {
      grassTop: new THREE.MeshStandardMaterial({ map: textures.grass, roughness: 0.86, metalness: 0.01, side: THREE.DoubleSide }),
      grassTopAlt: new THREE.MeshStandardMaterial({ map: textures.grass, color: 0xf3ffe4, roughness: 0.88, metalness: 0.01, side: THREE.DoubleSide }),
      sandTop: new THREE.MeshStandardMaterial({ map: textures.sand, roughness: 0.82, metalness: 0.01, side: THREE.DoubleSide }),
      sandTopAlt: new THREE.MeshStandardMaterial({ map: textures.sand, color: 0xfff4d8, roughness: 0.84, metalness: 0.01, side: THREE.DoubleSide }),
      dirtA: new THREE.MeshStandardMaterial({ color: 0xb86e2f, roughness: 0.82, side: THREE.DoubleSide }),
      dirtB: new THREE.MeshStandardMaterial({ color: 0x8a5128, roughness: 0.88, side: THREE.DoubleSide }),
      dirtBottom: new THREE.MeshStandardMaterial({ color: 0x5a3620, roughness: 0.95 }),
      water: new THREE.MeshStandardMaterial({ map: textures.water, color: 0x43b7ff, roughness: 0.18, metalness: 0.02, transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
      waterDeep: new THREE.MeshStandardMaterial({ color: 0x1186d9, roughness: 0.2, transparent: true, opacity: 0.72 }),
      waterfall: new THREE.MeshStandardMaterial({ color: 0x4abfff, roughness: 0.18, transparent: true, opacity: 0.74 }),
      foam: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.48, depthWrite: false, side: THREE.DoubleSide }),
      rock: new THREE.MeshStandardMaterial({ color: 0x8996a1, roughness: 0.78, flatShading: true }),
      rockLight: new THREE.MeshStandardMaterial({ color: 0xb9c3ca, roughness: 0.76, flatShading: true }),
      cliffPlate: new THREE.MeshStandardMaterial({ color: 0xb5bec6, roughness: 0.72, metalness: 0.02, flatShading: true }),
      gem: new THREE.MeshStandardMaterial({ color: 0xff2549, roughness: 0.28, metalness: 0.08, emissive: 0x45020b, emissiveIntensity: 0.25, flatShading: true }),
      gemGlow: new THREE.MeshBasicMaterial({ color: 0xff6680, transparent: true, opacity: 0.2, depthWrite: false }),
      spark: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
      padBlue: new THREE.MeshStandardMaterial({ color: 0x278fe8, roughness: 0.35, metalness: 0.1 }),
      padViolet: new THREE.MeshStandardMaterial({ color: 0xb735e8, roughness: 0.35, metalness: 0.1 }),
      padBase: new THREE.MeshStandardMaterial({ color: 0xf3e7c9, roughness: 0.62 }),
      padDark: new THREE.MeshStandardMaterial({ color: 0x4f5d67, roughness: 0.45, metalness: 0.18 }),
      padBlueSoft: new THREE.MeshStandardMaterial({ color: 0xb9f5ff, roughness: 0.34, metalness: 0.08, emissive: 0x0d789e, emissiveIntensity: 0.12 }),
      padVioletSoft: new THREE.MeshStandardMaterial({ color: 0xf1b2ff, roughness: 0.34, metalness: 0.08, emissive: 0x77159c, emissiveIntensity: 0.18 }),
      robot: new THREE.MeshStandardMaterial({ color: 0xf4a12f, roughness: 0.46, metalness: 0.03 }),
      robotDark: new THREE.MeshStandardMaterial({ color: 0x8d5128, roughness: 0.68 }),
      robotTrim: new THREE.MeshStandardMaterial({ color: 0x5fd6ca, roughness: 0.38, metalness: 0.08, flatShading: true }),
      robotGlass: new THREE.MeshStandardMaterial({ color: 0xb7fff4, roughness: 0.16, metalness: 0.12, transparent: true, opacity: 0.9 }),
      robotMouth: new THREE.MeshBasicMaterial({ color: 0x3f2418 }),
      plant: new THREE.MeshStandardMaterial({ color: 0x3f8d2e, roughness: 0.8, flatShading: true }),
      plantLight: new THREE.MeshStandardMaterial({ color: 0x6faf3c, roughness: 0.78, flatShading: true }),
      trunk: new THREE.MeshStandardMaterial({ color: 0x9a642d, roughness: 0.78 }),
      shadow: new THREE.MeshBasicMaterial({ color: 0x47606b, transparent: true, opacity: 0.14, depthWrite: false }),
      backdropDirt: new THREE.MeshStandardMaterial({ color: 0x8a5128, roughness: 0.9, transparent: true, opacity: 0.28 }),
      backdropGrass: new THREE.MeshStandardMaterial({ color: 0x8cc957, roughness: 0.9, transparent: true, opacity: 0.28 }),
      backdropRock: new THREE.MeshStandardMaterial({ color: 0x9ba9b3, roughness: 0.84, flatShading: true, transparent: true, opacity: 0.28 })
    };

    const geometry = {
      tileBase: makeRoundedSlabGeometry(0.77, 0.58, 0.77, 0.035, 0.012),
      tileCap: makeRoundedSlabGeometry(0.735, 0.085, 0.735, 0.028, 0.012),
      waterTile: makeRoundedSlabGeometry(0.86, 0.07, 0.86, 0.08, 0.012),
      ripple: new THREE.BoxGeometry(0.46, 0.012, 0.025),
      vine: makeRoundedSlabGeometry(0.04, 0.58, 0.04, 0.018, 0.006),
      grassBlade: new THREE.ConeGeometry(0.04, 0.24, 5),
      pebble: new THREE.DodecahedronGeometry(0.085, 0),
      rockLarge: new THREE.DodecahedronGeometry(0.3, 0),
      rockSmall: new THREE.DodecahedronGeometry(0.19, 0),
      gem: new THREE.OctahedronGeometry(0.26, 0),
      gemGlow: new THREE.SphereGeometry(0.38, 14, 8),
      gemGlyph: new THREE.CircleGeometry(0.048, 3),
      pad: new THREE.CylinderGeometry(0.36, 0.36, 0.065, 48),
      padRing: new THREE.TorusGeometry(0.24, 0.025, 8, 36),
      padOuterRing: new THREE.TorusGeometry(0.31, 0.018, 8, 48),
      padMiddleRing: new THREE.TorusGeometry(0.22, 0.012, 8, 42),
      padInnerRing: new THREE.TorusGeometry(0.13, 0.01, 8, 36),
      padCenter: new THREE.BoxGeometry(0.17, 0.012, 0.17),
      padTick: new THREE.BoxGeometry(0.035, 0.012, 0.13),
      robotBody: makeRobotBodyGeometry(),
      robotHead: new THREE.SphereGeometry(0.17, 14, 8),
      robotArm: new THREE.CylinderGeometry(0.026, 0.026, 0.38, 8),
      robotEye: new THREE.SphereGeometry(0.075, 12, 8),
      robotMouth: new THREE.BoxGeometry(0.02, 0.024, 0.16),
      arrow: new THREE.ConeGeometry(0.12, 0.32, 3),
      waterfall: makeRoundedSlabGeometry(0.36, 1.56, 0.052, 0.024, 0.006),
      cliffPlate: makeRoundedSlabGeometry(0.34, 0.045, 0.16, 0.03, 0.008),
      treeTop: new THREE.SphereGeometry(0.21, 9, 7),
      treeTrunk: new THREE.CylinderGeometry(0.045, 0.06, 0.32, 7)
    };
    const waterBaseGeometries = new Map();
    const surfaceY = 0.087;
    const cliffBottomY = -0.62;

    function render(simState, activeMission, helpers) {
      if (!simState || !simState.grid) return;
      resizeRenderer();
      root.clear();

      const grid = simState.grid;
      const tiles = helpers.walkableTiles(grid);
      const bounds = sceneBounds(tiles);
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerZ = (bounds.minY + bounds.maxY) / 2;
      const spacing = 0.78;
      const worldX = (x) => (x - centerX) * spacing;
      const worldZ = (y) => (y - centerZ) * spacing;

      addBackdropIslands(root, bounds, spacing);
      addWaterBase(root, bounds, spacing);
      addIslandShadow(root, tiles, worldX, worldZ, spacing);
      addWater(root, grid, worldX, worldZ, spacing);
      addContinuousIsland(root, grid, tiles, worldX, worldZ, spacing);

      tiles.forEach(({ x, y }) => {
        const material = materialFor(grid, x, y);
        addTileDressing(root, grid, x, y, worldX, worldZ, material);
        addCliffDressing(root, grid, x, y, worldX, worldZ);

        if (!helpers.hasTile(grid, x, y + 1) && helpers.hash2(x + 2, y) % 3 === 0) {
          const vine = new THREE.Mesh(geometry.vine, materials.plant);
          vine.position.set(worldX(x) + 0.24, -0.72, worldZ(y) + 0.37);
          vine.rotation.z = 0.2;
          vine.castShadow = true;
          root.add(vine);
        }
      });

      grid.walls.forEach((key) => {
        const [x, y] = key.split(",").map(Number);
        addRockCluster(root, worldX(x), worldZ(y));
      });

      grid.hazards.forEach((key) => {
        const [x, y] = key.split(",").map(Number);
        addHazard(root, worldX(x), worldZ(y));
      });

      grid.beacons.forEach((beacon, key) => {
        addGem(root, worldX(beacon.x), worldZ(beacon.y), simState.collected.has(key));
      });

      addPad(root, worldX(grid.start.x), worldZ(grid.start.y), "blue");
      addPad(root, worldX(grid.relay.x), worldZ(grid.relay.y), "violet");

      simState.path.forEach((point) => {
        const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.014, 24), materials.padBlue);
        dot.position.set(worldX(point.x), surfaceY + 0.012, worldZ(point.y));
        dot.material = dot.material.clone();
        dot.material.transparent = true;
        dot.material.opacity = 0.34;
        root.add(dot);
      });

      const actor = actorPose(simState, worldX, worldZ, helpers.directionIndex);
      addRobot(root, actor.x, actor.z, actor.rotation, simState.shield > 0, actor.lift);

      frameCamera(bounds, spacing);
      renderer.render(scene, camera);
    }

    function actorPose(simState, worldX, worldZ, directionIndex) {
      const base = {
        x: worldX(simState.x),
        z: worldZ(simState.y),
        rotation: angleForDirection(simState.dir, directionIndex),
        lift: 0
      };

      const motion = simState.motion;
      if (!motion) return base;

      const progress = Math.min(1, Math.max(0, (performance.now() - motion.startedAt) / motion.duration));
      const eased = easeInOut(progress);
      const fromRotation = angleForDirection(motion.fromDir);
      const toRotation = angleForDirection(motion.toDir);

      if (motion.type === "move") {
        return {
          x: lerp(worldX(motion.fromX), worldX(motion.toX), eased),
          z: lerp(worldZ(motion.fromY), worldZ(motion.toY), eased),
          rotation: toRotation,
          lift: Math.sin(progress * Math.PI) * 0.075
        };
      }

      return {
        x: worldX(motion.toX),
        z: worldZ(motion.toY),
        rotation: lerpAngle(fromRotation, toRotation, eased),
        lift: 0
      };
    }

    function angleForDirection(dir, fallbackIndex = 1) {
      const byDir = { N: -Math.PI / 2, E: 0, S: Math.PI / 2, W: Math.PI };
      if (dir && Object.hasOwn(byDir, dir)) return byDir[dir];
      return [-Math.PI / 2, 0, Math.PI / 2, Math.PI][fallbackIndex] || 0;
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function lerpAngle(a, b, t) {
      const full = Math.PI * 2;
      const delta = ((((b - a) % full) + Math.PI * 3) % full) - Math.PI;
      return a + delta * t;
    }

    function easeInOut(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function resizeRenderer() {
      const rect = targetCanvas.getBoundingClientRect();
      const width = Math.max(320, Math.round(rect.width));
      const height = Math.max(320, Math.round(rect.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function frameCamera(bounds, spacing) {
      const spanX = Math.max(1, bounds.maxX - bounds.minX + 1);
      const spanZ = Math.max(1, bounds.maxY - bounds.minY + 1);
      const span = Math.max(spanX, spanZ) * spacing;
      const aspect = Math.max(0.85, camera.aspect || 1);
      const shortCanvasBoost = targetCanvas.clientHeight < 390 ? 0.12 : 0;
      const fitMultiplier = aspect < 1.25
        ? 1.9
        : aspect < 1.65
          ? 1.72
          : 1.56;
      const distance = Math.max(6.25, span * (fitMultiplier + shortCanvasBoost));
      camera.position.set(distance * 0.68, distance * 0.86, distance * 0.78);
      camera.lookAt(0, aspect < 1.35 ? -0.34 : -0.26, 0);
    }

    function addBackdropIslands(parent, bounds, spacing) {
      const span = Math.max(bounds.maxX - bounds.minX + 1, bounds.maxY - bounds.minY + 1) * spacing;
      const placements = [
        [-span * 0.8, 1.6, -span * 0.9, 0.34],
        [span * 0.95, 1.9, -span * 1.05, 0.26]
      ];

      placements.forEach(([x, y, z, scale], index) => {
        const island = new THREE.Group();
        island.position.set(x, y, z);
        island.scale.setScalar(scale);

        const base = new THREE.Mesh(geometry.tileBase, materials.backdropDirt);
        base.position.y = -0.28;
        base.castShadow = false;
        base.receiveShadow = true;
        island.add(base);

        const cap = new THREE.Mesh(geometry.tileCap, materials.backdropGrass);
        cap.position.y = 0.045;
        island.add(cap);

        const rock = new THREE.Mesh(geometry.rockLarge, materials.backdropRock);
        rock.position.set(0.12, 0.24, -0.08);
        rock.scale.set(0.8, 1.1, 0.75);
        island.add(rock);
        parent.add(island);
      });
    }

    function addWaterBase(parent, bounds, spacing) {
      const width = (bounds.maxX - bounds.minX + 4.4) * spacing;
      const depth = (bounds.maxY - bounds.minY + 4.2) * spacing;
      const key = `${width.toFixed(2)}:${depth.toFixed(2)}`;
      if (!waterBaseGeometries.has(key)) {
        waterBaseGeometries.set(key, makeRoundedSlabGeometry(width, 0.08, depth, 0.34, 0.018));
      }
      const water = new THREE.Mesh(waterBaseGeometries.get(key), materials.waterDeep);
      water.position.set(0, -0.64, 0.18);
      water.receiveShadow = true;
      parent.add(water);

      for (let i = 0; i < 9; i += 1) {
        const ripple = new THREE.Mesh(geometry.ripple, materials.foam);
        ripple.position.set((i - 4) * width * 0.09, -0.585, depth * 0.28 + (i % 2) * 0.08);
        ripple.rotation.y = 0.15 + i * 0.08;
        ripple.scale.set(1.25 + (i % 3) * 0.24, 1, 1);
        parent.add(ripple);
      }
    }

    function addIslandShadow(parent, tiles, worldX, worldZ, spacing) {
      const shape = new THREE.Mesh(
        new THREE.CircleGeometry(Math.max(2.8, tiles.length * 0.13), 56),
        materials.shadow
      );
      const xs = tiles.map((tile) => worldX(tile.x));
      const zs = tiles.map((tile) => worldZ(tile.y));
      shape.position.set((Math.min(...xs) + Math.max(...xs)) / 2, -0.72, (Math.min(...zs) + Math.max(...zs)) / 2 + spacing * 0.28);
      shape.rotation.x = -Math.PI / 2;
      shape.scale.set(1.2, 0.48, 1);
      parent.add(shape);
    }

    function addContinuousIsland(parent, grid, tiles, worldX, worldZ, spacing) {
      tiles.forEach(({ x, y }) => {
        const seed = hash2(x, y);
        const base = new THREE.Mesh(geometry.tileBase, seed % 2 === 0 ? materials.dirtA : materials.dirtB);
        base.position.set(worldX(x), -0.28, worldZ(y));
        base.castShadow = true;
        base.receiveShadow = true;
        parent.add(base);

        const cap = new THREE.Mesh(geometry.tileCap, terrainCapMaterial(grid, x, y, seed));
        cap.position.set(worldX(x), 0.045, worldZ(y));
        cap.receiveShadow = true;
        parent.add(cap);
      });
    }

    function terrainCapMaterial(grid, x, y, seed) {
      if (materialFor(grid, x, y) === "sand") {
        return seed % 5 === 0 ? materials.sandTopAlt : materials.sandTop;
      }
      return seed % 4 === 0 ? materials.grassTopAlt : materials.grassTop;
    }

    function buildTerrainTopGeometry(grid, tiles, worldX, worldZ, spacing, includeTile) {
      const positions = [];
      const normals = [];
      const uvs = [];
      const half = spacing / 2;
      const topY = surfaceY;

      tiles.forEach(({ x, y }) => {
        if (!includeTile(x, y)) return;
        const left = worldX(x) - half;
        const right = worldX(x) + half;
        const back = worldZ(y) - half;
        const front = worldZ(y) + half;
        addSurfaceQuad(
          positions,
          normals,
          uvs,
          [left, topY, back],
          [right, topY, back],
          [right, topY, front],
          [left, topY, front],
          [0, 1, 0],
          [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]]
        );
      });

      return makeBufferGeometry(positions, normals, uvs);
    }

    function buildTerrainSideGeometry(grid, tiles, worldX, worldZ, spacing) {
      const positions = [];
      const normals = [];
      const uvs = [];
      const half = spacing / 2;
      const topY = surfaceY;
      const bottomY = cliffBottomY;

      tiles.forEach(({ x, y }) => {
        const left = worldX(x) - half;
        const right = worldX(x) + half;
        const back = worldZ(y) - half;
        const front = worldZ(y) + half;

        if (!hasTile(grid, x, y - 1)) {
          addSurfaceQuad(positions, normals, uvs, [right, topY, back], [left, topY, back], [left, bottomY, back], [right, bottomY, back], [0, 0, -1]);
        }
        if (!hasTile(grid, x, y + 1)) {
          addSurfaceQuad(positions, normals, uvs, [left, topY, front], [right, topY, front], [right, bottomY, front], [left, bottomY, front], [0, 0, 1]);
        }
        if (!hasTile(grid, x - 1, y)) {
          addSurfaceQuad(positions, normals, uvs, [left, topY, back], [left, topY, front], [left, bottomY, front], [left, bottomY, back], [-1, 0, 0]);
        }
        if (!hasTile(grid, x + 1, y)) {
          addSurfaceQuad(positions, normals, uvs, [right, topY, front], [right, topY, back], [right, bottomY, back], [right, bottomY, front], [1, 0, 0]);
        }
      });

      return makeBufferGeometry(positions, normals, uvs);
    }

    function addSurfaceQuad(positions, normals, uvs, a, b, c, d, normal, uv = [[0, 0], [1, 0], [1, 1], [0, 1]]) {
      addSurfaceTri(positions, normals, uvs, a, b, c, normal, uv[0], uv[1], uv[2]);
      addSurfaceTri(positions, normals, uvs, a, c, d, normal, uv[0], uv[2], uv[3]);
    }

    function addSurfaceTri(positions, normals, uvs, a, b, c, normal, uvA, uvB, uvC) {
      [a, b, c].forEach((point) => positions.push(point[0], point[1], point[2]));
      [0, 1, 2].forEach(() => normals.push(normal[0], normal[1], normal[2]));
      [uvA, uvB, uvC].forEach((point) => uvs.push(point[0] * 0.55, point[1] * 0.55));
    }

    function makeBufferGeometry(positions, normals, uvs) {
      if (!positions.length) return null;
      const terrainGeometry = new THREE.BufferGeometry();
      terrainGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      terrainGeometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
      terrainGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      terrainGeometry.computeBoundingSphere();
      return terrainGeometry;
    }

    function addWater(parent, grid, worldX, worldZ, spacing) {
      const waters = [...grid.waters].map((key) => {
        const [x, y] = key.split(",").map(Number);
        return { x, y };
      });
      const waterSurface = buildWaterSurfaceGeometry(waters, worldX, worldZ, spacing);
      if (waterSurface) {
        const water = new THREE.Mesh(waterSurface, materials.water);
        water.receiveShadow = true;
        parent.add(water);
      }

      waters.forEach(({ x, y }, index) => {
        if (index % 2 !== 0) return;
        const ripple = new THREE.Mesh(geometry.ripple, materials.foam);
        ripple.position.set(worldX(x) - 0.06, -0.015, worldZ(y) - 0.14);
        ripple.rotation.y = 0.2 + index * 0.08;
        parent.add(ripple);
      });

      const fronts = walkableTiles(grid).filter((tile) => !hasTile(grid, tile.x, tile.y + 1));
      fronts.slice(0, 2).forEach((tile) => {
        const fall = new THREE.Mesh(geometry.waterfall, materials.waterfall);
        fall.position.set(worldX(tile.x), -1.03, worldZ(tile.y) + 0.42);
        fall.rotation.x = 0.02;
        fall.receiveShadow = false;
        parent.add(fall);

        const foam = new THREE.Mesh(geometry.ripple, materials.foam);
        foam.position.set(worldX(tile.x), -1.78, worldZ(tile.y) + 0.44);
        foam.scale.set(1.2, 1, 1.2);
        parent.add(foam);
      });
    }

    function buildWaterSurfaceGeometry(waters, worldX, worldZ, spacing) {
      const positions = [];
      const normals = [];
      const uvs = [];
      const half = spacing / 2;
      const yLevel = -0.055;

      waters.forEach(({ x, y }) => {
        const left = worldX(x) - half;
        const right = worldX(x) + half;
        const back = worldZ(y) - half;
        const front = worldZ(y) + half;
        addSurfaceQuad(
          positions,
          normals,
          uvs,
          [left, yLevel, back],
          [right, yLevel, back],
          [right, yLevel, front],
          [left, yLevel, front],
          [0, 1, 0],
          [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]]
        );
      });

      return makeBufferGeometry(positions, normals, uvs);
    }

    function addTileDressing(parent, grid, x, y, worldX, worldZ, material) {
      const seed = hash2(x + 4, y + 11);
      const wx = worldX(x);
      const wz = worldZ(y);
      if (material === "sand") {
        if (seed % 4 === 0) addPebble(parent, wx + 0.18, wz + 0.14, 0.7);
        if (seed % 5 === 0) addStonePlate(parent, wx - 0.08, wz - 0.05);
        return;
      }

      if (!isOccupied(grid, x, y) && seed % 3 === 0) addGrass(parent, wx + 0.18, wz + 0.16);
      if (!isOccupied(grid, x, y) && seed % 4 === 0) addPebble(parent, wx - 0.2, wz + 0.12, 0.65);
      if (!isOccupied(grid, x, y) && seed % 11 === 0) addShrub(parent, wx - 0.19, wz - 0.12, 0.82);
    }

    function addCliffDressing(parent, grid, x, y, worldX, worldZ) {
      const wx = worldX(x);
      const wz = worldZ(y);
      const seed = hash2(x + 17, y + 3);
      if (!hasTile(grid, x, y + 1) && seed % 7 === 0) {
        const plate = new THREE.Mesh(geometry.cliffPlate, materials.cliffPlate);
        plate.position.set(wx - 0.08, -0.22, wz + 0.435);
        plate.rotation.x = Math.PI / 2;
        plate.rotation.z = 0.08;
        plate.castShadow = true;
        parent.add(plate);
      }
      if (!hasTile(grid, x - 1, y) && seed % 11 === 0) {
        const plate = new THREE.Mesh(geometry.cliffPlate, materials.cliffPlate);
        plate.position.set(wx - 0.435, -0.19, wz + 0.04);
        plate.rotation.x = Math.PI / 2;
        plate.rotation.z = Math.PI / 2;
        plate.castShadow = true;
        parent.add(plate);
      }
    }

    function addStonePlate(parent, x, z) {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.035, 0.24), materials.rock);
      plate.position.set(x, surfaceY + 0.02, z);
      plate.rotation.y = 0.2;
      plate.castShadow = true;
      plate.receiveShadow = true;
      parent.add(plate);
    }

    function addGrass(parent, x, z) {
      for (let i = 0; i < 5; i += 1) {
        const blade = new THREE.Mesh(geometry.grassBlade, materials.plant);
        blade.position.set(x + (i - 2) * 0.042, surfaceY + 0.12, z + (i % 2) * 0.03);
        blade.rotation.z = (i - 2) * 0.2;
        blade.castShadow = true;
        parent.add(blade);
      }
    }

    function addShrub(parent, x, z, scale = 1) {
      const group = new THREE.Group();
      group.position.set(x, surfaceY, z);
      group.scale.setScalar(scale);

      const trunk = new THREE.Mesh(geometry.treeTrunk, materials.trunk);
      trunk.position.set(0, 0.16, 0);
      trunk.castShadow = true;
      group.add(trunk);

      for (let i = 0; i < 4; i += 1) {
        const leaf = new THREE.Mesh(geometry.treeTop, i % 2 ? materials.plantLight : materials.plant);
        leaf.position.set((i - 1.5) * 0.1, 0.34 + (i % 2) * 0.06, (i % 3 - 1) * 0.06);
        leaf.scale.set(0.74, 0.9, 0.74);
        leaf.castShadow = true;
        group.add(leaf);
      }
      parent.add(group);
    }

    function addPebble(parent, x, z, scale = 1) {
      const pebble = new THREE.Mesh(geometry.pebble, materials.rockLight);
      pebble.position.set(x, surfaceY + 0.035, z);
      pebble.scale.set(1.1 * scale, 0.42 * scale, 0.8 * scale);
      pebble.rotation.set(0.4, 0.6, 0.1);
      pebble.castShadow = true;
      parent.add(pebble);
    }

    function addRockCluster(parent, x, z) {
      const a = new THREE.Mesh(geometry.rockLarge, materials.rock);
      a.position.set(x - 0.1, surfaceY + 0.19, z);
      a.scale.set(0.72, 1.28, 0.72);
      a.castShadow = true;
      parent.add(a);

      const b = new THREE.Mesh(geometry.rockSmall, materials.rockLight);
      b.position.set(x + 0.18, surfaceY + 0.12, z + 0.12);
      b.scale.set(0.82, 0.92, 0.82);
      b.castShadow = true;
      parent.add(b);
    }

    function addHazard(parent, x, z) {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.028, 28), materials.padBase);
      base.position.set(x, surfaceY + 0.014, z);
      parent.add(base);

      const hazard = new THREE.Mesh(new THREE.ConeGeometry(0.21, 0.38, 3), materials.gem);
      hazard.position.set(x, surfaceY + 0.22, z);
      hazard.rotation.y = Math.PI / 6;
      hazard.castShadow = true;
      parent.add(hazard);
    }

    function addGem(parent, x, z, collected) {
      if (collected) {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.026, 28), materials.padDark);
        base.position.set(x, surfaceY + 0.018, z);
        parent.add(base);

        const ring = new THREE.Mesh(geometry.padMiddleRing, materials.padBlueSoft);
        ring.position.set(x, surfaceY + 0.045, z);
        ring.rotation.x = Math.PI / 2;
        parent.add(ring);
        return;
      }

      const glow = new THREE.Mesh(geometry.gemGlow, materials.gemGlow);
      glow.position.set(x, surfaceY + 0.23, z);
      glow.scale.set(0.56, 0.26, 0.56);
      parent.add(glow);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.03, 24), materials.padDark);
      base.position.set(x, surfaceY + 0.018, z);
      parent.add(base);

      const gem = new THREE.Mesh(geometry.gem, materials.gem);
      gem.position.set(x, surfaceY + 0.34, z);
      gem.scale.set(0.58, 1.24, 0.58);
      gem.rotation.set(0.05, Math.PI / 4, -0.04);
      gem.castShadow = true;
      parent.add(gem);

      [
        [-0.13, 0.08, 0.42, -0.16],
        [0.13, -0.08, 0.36, 0.18]
      ].forEach(([dx, dz, scale, tilt]) => {
        const chip = new THREE.Mesh(geometry.gem, materials.gem);
        chip.position.set(x + dx, surfaceY + 0.19, z + dz);
        chip.scale.set(0.28 * scale, 0.8 * scale, 0.28 * scale);
        chip.rotation.set(tilt, Math.PI / 5, tilt);
        chip.castShadow = true;
        parent.add(chip);
      });

      const glyph = new THREE.Mesh(geometry.gemGlyph, materials.spark);
      glyph.position.set(x + 0.07, surfaceY + 0.37, z + 0.18);
      glyph.rotation.set(0, Math.PI / 5, Math.PI / 6);
      parent.add(glyph);

      const spark = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.08), materials.spark);
      spark.position.set(x - 0.11, surfaceY + 0.58, z + 0.04);
      spark.rotation.set(-Math.PI / 3, 0, Math.PI / 4);
      parent.add(spark);
    }

    function addPad(parent, x, z, color) {
      const accent = color === "blue" ? materials.padBlue : materials.padViolet;
      const softAccent = color === "blue" ? materials.padBlueSoft : materials.padVioletSoft;

      const base = new THREE.Mesh(geometry.pad, materials.padBase);
      base.position.set(x, surfaceY + 0.033, z);
      base.receiveShadow = true;
      parent.add(base);

      const outer = new THREE.Mesh(geometry.padOuterRing, materials.padDark);
      outer.position.set(x, surfaceY + 0.074, z);
      outer.rotation.x = Math.PI / 2;
      parent.add(outer);

      const colorRing = new THREE.Mesh(geometry.padRing, accent);
      colorRing.position.set(x, surfaceY + 0.087, z);
      colorRing.rotation.x = Math.PI / 2;
      parent.add(colorRing);

      const middle = new THREE.Mesh(geometry.padMiddleRing, softAccent);
      middle.position.set(x, surfaceY + 0.096, z);
      middle.rotation.x = Math.PI / 2;
      parent.add(middle);

      const inner = new THREE.Mesh(geometry.padInnerRing, materials.padDark);
      inner.position.set(x, surfaceY + 0.104, z);
      inner.rotation.x = Math.PI / 2;
      parent.add(inner);

      const center = new THREE.Mesh(geometry.padCenter, accent);
      center.position.set(x, surfaceY + 0.111, z);
      center.rotation.y = Math.PI / 4;
      parent.add(center);

      for (let i = 0; i < 4; i += 1) {
        const tick = new THREE.Mesh(geometry.padTick, softAccent);
        const angle = i * Math.PI / 2;
        tick.position.set(x + Math.cos(angle) * 0.19, surfaceY + 0.116, z + Math.sin(angle) * 0.19);
        tick.rotation.y = -angle;
        parent.add(tick);
      }
    }

    function addRobot(parent, x, z, rotation, shielded, lift = 0) {
      const group = new THREE.Group();
      group.position.set(x, surfaceY - 0.032 + lift, z);
      group.rotation.y = rotation;

      const body = new THREE.Mesh(geometry.robotBody, materials.robot);
      body.position.y = 0.02;
      body.scale.set(0.82, 0.95, 0.82);
      body.castShadow = true;
      group.add(body);

      const belt = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.018, 8, 28), materials.robotDark);
      belt.position.y = 0.31;
      belt.rotation.x = Math.PI / 2;
      group.add(belt);

      const head = new THREE.Mesh(geometry.robotHead, materials.robot);
      head.position.set(0, 0.84, 0);
      head.scale.set(0.76, 0.82, 0.62);
      head.castShadow = true;
      group.add(head);

      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.06, 12), materials.robotTrim);
      cap.position.set(0, 0.98, 0);
      cap.rotation.z = 0.15;
      cap.castShadow = true;
      group.add(cap);

      const eye = new THREE.Mesh(geometry.robotEye, materials.robotGlass);
      eye.position.set(0.13, 0.88, 0.1);
      eye.scale.set(1.24, 0.6, 0.58);
      group.add(eye);

      const mouth = new THREE.Mesh(geometry.robotMouth, materials.robotMouth);
      mouth.position.set(0.255, 0.55, 0);
      mouth.rotation.z = 0.06;
      group.add(mouth);

      const leftArm = new THREE.Mesh(geometry.robotArm, materials.robotDark);
      leftArm.position.set(-0.32, 0.35, 0);
      leftArm.rotation.z = 0.55;
      group.add(leftArm);

      const rightArm = new THREE.Mesh(geometry.robotArm, materials.robotDark);
      rightArm.position.set(0.32, 0.35, 0);
      rightArm.rotation.z = -0.55;
      group.add(rightArm);

      const arrow = new THREE.Mesh(geometry.arrow, materials.robotDark);
      arrow.position.set(0.29, 0.19, 0);
      arrow.rotation.z = -Math.PI / 2;
      group.add(arrow);

      if (shielded) {
        const shield = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.018, 8, 36), materials.padBlue);
        shield.position.y = 0.32;
        shield.rotation.x = Math.PI / 2;
        group.add(shield);
      }

      parent.add(group);
    }

    return { ok: true, render };
  }

  function createWebGLScene(targetCanvas) {
    const gl = targetCanvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) return { ok: false, render() {} };

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute vec4 aColor;
      uniform mat4 uProjection;
      uniform mat4 uView;
      varying vec3 vNormal;
      varying vec4 vColor;
      varying vec3 vWorld;
      void main() {
        vNormal = aNormal;
        vColor = aColor;
        vWorld = aPosition;
        gl_Position = uProjection * uView * vec4(aPosition, 1.0);
      }
    `);

    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying vec3 vNormal;
      varying vec4 vColor;
      varying vec3 vWorld;
      uniform vec3 uLightDir;
      void main() {
        vec3 normal = normalize(vNormal);
        float diffuse = max(dot(normal, normalize(uLightDir)), 0.0);
        float rim = pow(1.0 - max(dot(normal, normalize(vec3(0.2, 0.7, 0.6))), 0.0), 2.0) * 0.18;
        float shade = 0.54 + diffuse * 0.48 + rim;
        vec3 color = vColor.rgb * shade;
        float fog = smoothstep(10.0, 19.0, length(vWorld.xz));
        color = mix(color, vec3(0.82, 0.95, 1.0), fog * 0.34);
        gl_FragColor = vec4(color, vColor.a);
      }
    `);

    const program3d = gl.createProgram();
    gl.attachShader(program3d, vertexShader);
    gl.attachShader(program3d, fragmentShader);
    gl.linkProgram(program3d);
    if (!gl.getProgramParameter(program3d, gl.LINK_STATUS)) {
      return { ok: false, render() {} };
    }

    const attrs = {
      position: gl.getAttribLocation(program3d, "aPosition"),
      normal: gl.getAttribLocation(program3d, "aNormal"),
      color: gl.getAttribLocation(program3d, "aColor")
    };
    const uniforms = {
      projection: gl.getUniformLocation(program3d, "uProjection"),
      view: gl.getUniformLocation(program3d, "uView"),
      lightDir: gl.getUniformLocation(program3d, "uLightDir")
    };
    const buffer = gl.createBuffer();

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    function render(simState, activeMission, helpers) {
      if (!simState || !simState.grid) return;
      const grid = simState.grid;
      const vertices = [];
      const tiles = helpers.walkableTiles(grid);
      const bounds = sceneBounds(tiles);
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerZ = (bounds.minY + bounds.maxY) / 2;
      const spacing = 0.78;

      function worldX(x) { return (x - centerX) * spacing; }
      function worldZ(y) { return (y - centerZ) * spacing; }

      addWaterSurfaces(vertices, grid, worldX, worldZ);

      tiles.forEach(({ x, y }) => {
        const wx = worldX(x);
        const wz = worldZ(y);
        const variant = helpers.hash2(x, y) % 5;
        const tileMaterial = materialFor(grid, x, y);
        const palette = terrainPalette(tileMaterial, variant);
        addBox(vertices, [wx, -0.28, wz], [0.72, 0.56, 0.72], {
          top: palette.top,
          side1: [0.54, 0.32, 0.17, 1],
          side2: [0.42, 0.24, 0.13, 1],
          bottom: [0.28, 0.18, 0.12, 1]
        });

        addTileSurfaceDetail(vertices, [wx, 0.025, wz], tileMaterial, helpers.hash2(x + 4, y + 11));

        if (!helpers.hasTile(grid, x, y + 1) && helpers.hash2(x + 2, y) % 3 === 0) {
          addVine(vertices, [wx + 0.18, -0.78, wz + 0.36], 0.34);
        }
        if (!isOccupied(grid, x, y) && helpers.hash2(x, y) % 11 === 0) {
          addGrass(vertices, [wx - 0.18, 0.04, wz + 0.12], 0.13);
        }
        if (!isOccupied(grid, x, y) && helpers.hash2(x + 5, y) % 9 === 0) {
          addPebble(vertices, [wx + 0.16, 0.05, wz - 0.12], 0.08);
        }
      });

      addWaterfall(vertices, grid, helpers, worldX, worldZ);

      grid.walls.forEach((key) => {
        const [x, y] = key.split(",").map(Number);
        const wx = worldX(x);
        const wz = worldZ(y);
        addSphere(vertices, [wx - 0.1, 0.28, wz], [0.25, 0.42, 0.22], [0.58, 0.64, 0.7, 1], 10, 8);
        addSphere(vertices, [wx + 0.18, 0.18, wz + 0.08], [0.2, 0.3, 0.18], [0.46, 0.53, 0.61, 1], 10, 8);
      });

      grid.hazards.forEach((key) => {
        const [x, y] = key.split(",").map(Number);
        const wx = worldX(x);
        const wz = worldZ(y);
        addCylinder(vertices, [wx, 0.045, wz], 0.28, 0.035, [1.0, 0.78, 0.73, 1], 28);
        addPyramid(vertices, [wx, 0.25, wz], 0.25, 0.38, [0.9, 0.18, 0.22, 1]);
      });

      grid.beacons.forEach((beacon, key) => {
        const wx = worldX(beacon.x);
        const wz = worldZ(beacon.y);
        if (simState.collected.has(key)) {
          addCylinder(vertices, [wx, 0.055, wz], 0.28, 0.035, [0.24, 0.68, 1.0, 0.55], 32);
        } else {
          addCylinder(vertices, [wx, 0.035, wz], 0.22, 0.03, [0.36, 0.45, 0.18, 0.5], 24);
          addOctahedron(vertices, [wx, 0.46, wz], 0.26, [1.0, 0.12, 0.28, 1]);
        }
      });

      addCylinder(vertices, [worldX(grid.start.x), 0.04, worldZ(grid.start.y)], 0.32, 0.045, [0.27, 0.72, 1.0, 1], 36);
      addCylinder(vertices, [worldX(grid.relay.x), 0.04, worldZ(grid.relay.y)], 0.36, 0.045, [0.92, 0.93, 0.86, 1], 36);
      addCylinder(vertices, [worldX(grid.relay.x), 0.09, worldZ(grid.relay.y)], 0.22, 0.035, [0.23, 0.62, 1.0, 1], 36);
      addCylinder(vertices, [worldX(grid.relay.x), 0.13, worldZ(grid.relay.y)], 0.12, 0.03, [0.82, 0.18, 0.9, 1], 36);

      if (simState.path.length > 1) {
        simState.path.forEach((point) => {
          addCylinder(vertices, [worldX(point.x), 0.065, worldZ(point.y)], 0.13, 0.02, [0.14, 0.58, 1.0, 0.55], 18);
        });
      }

      addRobot(vertices, [worldX(simState.x), 0.36, worldZ(simState.y)], helpers.directionIndex, simState.shield > 0);

      const aspect = Math.max(1, targetCanvas.width / Math.max(1, targetCanvas.height));
      const projection = perspectiveMatrix(38 * Math.PI / 180, aspect, 0.1, 80);
      const span = Math.max(bounds.maxX - bounds.minX + 1, bounds.maxY - bounds.minY + 1);
      const cameraDistance = Math.max(4.8, span * 0.88);
      const camera = [3.6, 4.3, cameraDistance];
      const view = lookAtMatrix(camera, [0, -0.06, 0], [0, 1, 0]);

      gl.viewport(0, 0, targetCanvas.width, targetCanvas.height);
      gl.clearColor(0.78, 0.93, 1.0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program3d);
      gl.uniformMatrix4fv(uniforms.projection, false, projection);
      gl.uniformMatrix4fv(uniforms.view, false, view);
      gl.uniform3fv(uniforms.lightDir, normalize3([0.4, 0.9, 0.7]));

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      const stride = 10 * 4;
      gl.enableVertexAttribArray(attrs.position);
      gl.vertexAttribPointer(attrs.position, 3, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(attrs.normal);
      gl.vertexAttribPointer(attrs.normal, 3, gl.FLOAT, false, stride, 3 * 4);
      gl.enableVertexAttribArray(attrs.color);
      gl.vertexAttribPointer(attrs.color, 4, gl.FLOAT, false, stride, 6 * 4);
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 10);
    }

    return { ok: true, render };
  }

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  function sceneBounds(tiles) {
    return {
      minX: Math.min(...tiles.map((tile) => tile.x)),
      maxX: Math.max(...tiles.map((tile) => tile.x)),
      minY: Math.min(...tiles.map((tile) => tile.y)),
      maxY: Math.max(...tiles.map((tile) => tile.y))
    };
  }

  function pushVertex(out, position, normal, color) {
    out.push(position[0], position[1], position[2], normal[0], normal[1], normal[2], color[0], color[1], color[2], color[3]);
  }

  function addTri(out, a, b, c, normal, color) {
    pushVertex(out, a, normal, color);
    pushVertex(out, b, normal, color);
    pushVertex(out, c, normal, color);
  }

  function addQuad(out, a, b, c, d, normal, color) {
    addTri(out, a, b, c, normal, color);
    addTri(out, a, c, d, normal, color);
  }

  function addBox(out, center, size, colors) {
    const [cx, cy, cz] = center;
    const [sx, sy, sz] = size.map((v) => v / 2);
    const p = {
      lbf: [cx - sx, cy - sy, cz + sz],
      rbf: [cx + sx, cy - sy, cz + sz],
      rtf: [cx + sx, cy + sy, cz + sz],
      ltf: [cx - sx, cy + sy, cz + sz],
      lbb: [cx - sx, cy - sy, cz - sz],
      rbb: [cx + sx, cy - sy, cz - sz],
      rtb: [cx + sx, cy + sy, cz - sz],
      ltb: [cx - sx, cy + sy, cz - sz]
    };
    addQuad(out, p.ltf, p.rtf, p.rtb, p.ltb, [0, 1, 0], colors.top);
    addQuad(out, p.rbf, p.lbf, p.lbb, p.rbb, [0, -1, 0], colors.bottom || colors.side2);
    addQuad(out, p.rtf, p.rbf, p.rbb, p.rtb, [1, 0, 0], colors.side2);
    addQuad(out, p.lbf, p.ltf, p.ltb, p.lbb, [-1, 0, 0], colors.side1);
    addQuad(out, p.ltf, p.lbf, p.rbf, p.rtf, [0, 0, 1], colors.side1);
    addQuad(out, p.rtb, p.rbb, p.lbb, p.ltb, [0, 0, -1], colors.side2);
  }

  function addCylinder(out, center, radius, height, color, segments = 24) {
    const [cx, cy, cz] = center;
    const topY = cy + height / 2;
    const bottomY = cy - height / 2;
    for (let i = 0; i < segments; i += 1) {
      const a = i / segments * Math.PI * 2;
      const b = (i + 1) / segments * Math.PI * 2;
      const p1 = [cx + Math.cos(a) * radius, topY, cz + Math.sin(a) * radius];
      const p2 = [cx + Math.cos(b) * radius, topY, cz + Math.sin(b) * radius];
      const p3 = [cx + Math.cos(b) * radius, bottomY, cz + Math.sin(b) * radius];
      const p4 = [cx + Math.cos(a) * radius, bottomY, cz + Math.sin(a) * radius];
      addTri(out, [cx, topY, cz], p1, p2, [0, 1, 0], color);
      addTri(out, [cx, bottomY, cz], p3, p4, [0, -1, 0], color);
      const normal = normalize3([Math.cos((a + b) / 2), 0.25, Math.sin((a + b) / 2)]);
      addQuad(out, p1, p4, p3, p2, normal, color);
    }
  }

  function addPyramid(out, center, radius, height, color) {
    const [cx, cy, cz] = center;
    const top = [cx, cy + height / 2, cz];
    const baseY = cy - height / 2;
    const points = [
      [cx, baseY, cz + radius],
      [cx + radius, baseY, cz],
      [cx, baseY, cz - radius],
      [cx - radius, baseY, cz]
    ];
    for (let i = 0; i < points.length; i += 1) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      addTri(out, top, a, b, faceNormal(top, a, b), color);
    }
    addQuad(out, points[0], points[1], points[2], points[3], [0, -1, 0], [color[0] * 0.7, color[1] * 0.7, color[2] * 0.7, color[3]]);
  }

  function addOctahedron(out, center, size, color) {
    const [cx, cy, cz] = center;
    const top = [cx, cy + size, cz];
    const bottom = [cx, cy - size, cz];
    const ring = [
      [cx + size * 0.7, cy, cz],
      [cx, cy, cz + size * 0.7],
      [cx - size * 0.7, cy, cz],
      [cx, cy, cz - size * 0.7]
    ];
    for (let i = 0; i < 4; i += 1) {
      const a = ring[i];
      const b = ring[(i + 1) % 4];
      addTri(out, top, a, b, faceNormal(top, a, b), color);
      addTri(out, bottom, b, a, faceNormal(bottom, b, a), [color[0] * 0.72, color[1] * 0.72, color[2] * 0.8, color[3]]);
    }
  }

  function addSphere(out, center, scale, color, slices = 14, stacks = 10) {
    for (let y = 0; y < stacks; y += 1) {
      const v1 = y / stacks;
      const v2 = (y + 1) / stacks;
      const t1 = v1 * Math.PI;
      const t2 = v2 * Math.PI;
      for (let x = 0; x < slices; x += 1) {
        const u1 = x / slices * Math.PI * 2;
        const u2 = (x + 1) / slices * Math.PI * 2;
        const p1 = spherePoint(center, scale, t1, u1);
        const p2 = spherePoint(center, scale, t2, u1);
        const p3 = spherePoint(center, scale, t2, u2);
        const p4 = spherePoint(center, scale, t1, u2);
        addTri(out, p1.p, p2.p, p3.p, p1.n, color);
        addTri(out, p1.p, p3.p, p4.p, p1.n, color);
      }
    }
  }

  function spherePoint(center, scale, theta, phi) {
    const n = [Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi)];
    return {
      p: [center[0] + n[0] * scale[0], center[1] + n[1] * scale[1], center[2] + n[2] * scale[2]],
      n: normalize3(n)
    };
  }

  function addRobot(out, center, dirIndex, shielded) {
    const [x, y, z] = center;
    addSphere(out, [x, y + 0.26, z], [0.22, 0.34, 0.18], [0.95, 0.52, 0.16, 1], 16, 12);
    addSphere(out, [x, y + 0.58, z], [0.13, 0.16, 0.11], [1.0, 0.68, 0.24, 1], 14, 8);
    addSphere(out, [x + 0.08, y + 0.66, z + 0.02], [0.07, 0.035, 0.035], [0.78, 1.0, 0.98, 1], 10, 6);
    addSphere(out, [x - 0.22, y + 0.27, z], [0.05, 0.16, 0.04], [0.84, 0.42, 0.12, 1], 8, 6);
    addSphere(out, [x + 0.22, y + 0.27, z], [0.05, 0.16, 0.04], [0.84, 0.42, 0.12, 1], 8, 6);
    const arrow = [
      [[0.32, 0, 0], [0.12, 0, 0.09], [0.12, 0, -0.09]],
      [[0, 0, 0.32], [-0.09, 0, 0.12], [0.09, 0, 0.12]],
      [[-0.32, 0, 0], [-0.12, 0, -0.09], [-0.12, 0, 0.09]],
      [[0, 0, -0.32], [0.09, 0, -0.12], [-0.09, 0, -0.12]]
    ][dirIndex] || [[0.32, 0, 0], [0.12, 0, 0.09], [0.12, 0, -0.09]];
    addTri(out, arrow[0].map((v, i) => v + [x, y + 0.1, z][i]), arrow[1].map((v, i) => v + [x, y + 0.1, z][i]), arrow[2].map((v, i) => v + [x, y + 0.1, z][i]), [0, 1, 0], [0.08, 0.28, 0.42, 1]);
    if (shielded) {
      addCylinder(out, [x, y + 0.08, z], 0.42, 0.025, [0.18, 0.68, 1.0, 0.45], 36);
    }
  }

  function addWaterfall(out, grid, helpers, worldX, worldZ) {
    const fronts = helpers.walkableTiles(grid).filter((tile) => !helpers.hasTile(grid, tile.x, tile.y + 1));
    const selected = fronts.slice(0, 2);
    selected.forEach((tile) => {
      const x = worldX(tile.x);
      const z = worldZ(tile.y) + 0.34;
      addBox(out, [x, -1.05, z], [0.28, 1.4, 0.05], {
        top: [0.2, 0.65, 1.0, 0.55],
        side1: [0.12, 0.48, 0.95, 0.55],
        side2: [0.1, 0.42, 0.86, 0.45],
        bottom: [0.08, 0.34, 0.75, 0.35]
      });
    });
  }

  function addWaterSurfaces(out, grid, worldX, worldZ) {
    grid.waters.forEach((key) => {
      const [x, y] = key.split(",").map(Number);
      addBox(out, [worldX(x), -0.36, worldZ(y)], [0.74, 0.08, 0.74], {
        top: [0.1, 0.55, 0.95, 0.92],
        side1: [0.08, 0.42, 0.82, 0.8],
        side2: [0.06, 0.34, 0.72, 0.72],
        bottom: [0.04, 0.24, 0.56, 0.5]
      });
      addBox(out, [worldX(x), -0.29, worldZ(y) - 0.12], [0.5, 0.012, 0.025], {
        top: [0.76, 0.95, 1.0, 0.45],
        side1: [0.76, 0.95, 1.0, 0.36],
        side2: [0.76, 0.95, 1.0, 0.36],
        bottom: [0.76, 0.95, 1.0, 0.22]
      });
    });
  }

  function materialFor(grid, x, y) {
    const key = tileKey(x, y);
    if (grid.materials.has(key)) return grid.materials.get(key);
    if (grid.hazards.has(key) || grid.beacons.has(key) || (grid.relay.x === x && grid.relay.y === y)) return "sand";
    return "grass";
  }

  function terrainPalette(material, variant) {
    if (material === "sand") {
      const light = variant % 2 === 0 ? 1 : 0.92;
      return { top: [0.86 * light, 0.68 * light, 0.42 * light, 1] };
    }
    const light = variant < 2 ? 1 : 0.92;
    return { top: [0.45 * light, 0.74 * light, 0.24 * light, 1] };
  }

  function addTileSurfaceDetail(out, center, material, seed) {
    const [x, y, z] = center;
    if (material === "sand") {
      addBox(out, [x - 0.16, y + 0.012, z - 0.1], [0.22, 0.014, 0.018], {
        top: [0.96, 0.82, 0.56, 0.38],
        side1: [0.9, 0.72, 0.46, 0.28],
        side2: [0.86, 0.66, 0.4, 0.22],
        bottom: [0.86, 0.66, 0.4, 0.18]
      });
      if (seed % 3 === 0) addPebble(out, [x + 0.18, y + 0.03, z + 0.14], 0.055);
      return;
    }

    addBox(out, [x - 0.18, y + 0.012, z - 0.12], [0.22, 0.014, 0.02], {
      top: [0.72, 0.9, 0.38, 0.34],
      side1: [0.5, 0.7, 0.25, 0.24],
      side2: [0.42, 0.62, 0.2, 0.2],
      bottom: [0.42, 0.62, 0.2, 0.18]
    });
    if (seed % 4 === 0) addGrass(out, [x + 0.2, y + 0.03, z + 0.16], 0.08);
  }

  function addGrass(out, center, size) {
    const color = [0.18, 0.48, 0.13, 1];
    for (let i = 0; i < 3; i += 1) {
      const x = center[0] + (i - 1) * size * 0.45;
      addTri(out, [x, center[1], center[2]], [x + size * 0.18, center[1] + size * 1.6, center[2] + size * 0.08], [x + size * 0.36, center[1], center[2]], [0.2, 0.8, 0.2], color);
    }
  }

  function addPebble(out, center, size) {
    addSphere(out, center, [size * 1.4, size * 0.55, size], [0.5, 0.55, 0.52, 1], 8, 5);
  }

  function addVine(out, center, height) {
    addBox(out, [center[0], center[1] - height / 2, center[2]], [0.035, height, 0.035], {
      top: [0.18, 0.42, 0.12, 1],
      side1: [0.12, 0.32, 0.08, 1],
      side2: [0.1, 0.26, 0.07, 1],
      bottom: [0.08, 0.2, 0.05, 1]
    });
  }

  function faceNormal(a, b, c) {
    return normalize3(cross3(sub3(b, a), sub3(c, a)));
  }

  function sub3(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  function cross3(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  function normalize3(v) {
    const len = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / len, v[1] / len, v[2] / len];
  }

  function perspectiveMatrix(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, (2 * far * near) * nf, 0
    ]);
  }

  function lookAtMatrix(eye, target, up) {
    const z = normalize3(sub3(eye, target));
    const x = normalize3(cross3(up, z));
    const y = cross3(z, x);
    return new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -dot3(x, eye), -dot3(y, eye), -dot3(z, eye), 1
    ]);
  }

  function dot3(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  function drawCelebration(title) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    roundRect(250, 245, 460, 112, 8, true, false);
    ctx.strokeStyle = "rgba(47, 139, 87, 0.35)";
    ctx.lineWidth = 3;
    roundRect(250, 245, 460, 112, 8, false, true);
    ctx.fillStyle = "#17212b";
    ctx.font = "900 34px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MISSION CLEAR", 480, 292);
    ctx.fillStyle = "#2f8b57";
    ctx.font = "800 22px Segoe UI, sans-serif";
    ctx.fillText(title, 480, 326);
  }

  function roundRect(x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function render() {
    renderMissionList();
    renderBrief();
    renderHud();
    renderPalette();
    renderProgramTabs();
    renderProgramList();
    renderCodeView();
    renderLog();
    renderEvidence();
    drawGrid();
    scheduleMotionFrames();
    dom.runBtn.textContent = runTimer ? "暂停" : "运行";
    dom.worldRun.lastChild.textContent = runTimer ? " 暂停" : " 运行代码";
  }

  dom.missionList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mission]");
    if (!button) return;
    selectMission(Number(button.dataset.mission));
  });

  dom.commandPalette.addEventListener("click", (event) => {
    const button = event.target.closest("[data-command]");
    if (!button || button.disabled) return;
    addCommand(button.dataset.command);
  });

  dom.programTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-board]");
    if (!button) return;
    activeBoard = button.dataset.board;
    render();
  });

  dom.programList.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-remove]");
    if (!chip) return;
    removeCommand(Number(chip.dataset.remove));
  });

  dom.runBtn.addEventListener("click", runProgram);
  dom.worldRun.addEventListener("click", runProgram);
  dom.worldHint.addEventListener("click", () => {
    log(mission().checkpoint, "normal");
    render();
  });
  dom.stepBtn.addEventListener("click", stepProgram);
  dom.resetBtn.addEventListener("click", () => {
    resetSimulation();
    render();
  });
  dom.undoBtn.addEventListener("click", () => {
    const target = currentTargetProgram();
    setCurrentTargetProgram(target.slice(0, -1));
    resetSimulation(true);
    render();
  });
  dom.clearBtn.addEventListener("click", () => {
    setCurrentTargetProgram([]);
    resetSimulation(true);
    render();
  });
  dom.loadReference.addEventListener("click", loadReferenceProgram);
  dom.resetProgress.addEventListener("click", () => {
    completed = new Set();
    saveProgress();
    currentMissionIndex = 0;
    program = [];
    routeProgram = [];
    activeBoard = "main";
    resetSimulation();
    render();
  });

  resetSimulation();
  render();
})();
