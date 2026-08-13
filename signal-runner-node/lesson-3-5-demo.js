(function () {
  const canvas = document.querySelector("#missionCanvas");
  const ctx = canvas.getContext("2d");

  const dom = {
    tabs: [...document.querySelectorAll("[data-lesson]")],
    lessonKicker: document.querySelector("#lessonKicker"),
    lessonTitle: document.querySelector("#lessonTitle"),
    lessonConcept: document.querySelector("#lessonConcept"),
    lessonStory: document.querySelector("#lessonStory"),
    lessonTarget: document.querySelector("#lessonTarget"),
    presetHint: document.querySelector("#presetHint"),
    presetGrid: document.querySelector("#presetGrid"),
    runBtn: document.querySelector("#runBtn"),
    stepBtn: document.querySelector("#stepBtn"),
    resetBtn: document.querySelector("#resetBtn"),
    clearBtn: document.querySelector("#clearBtn"),
    loadBestBtn: document.querySelector("#loadBestBtn"),
    commandPalette: document.querySelector("#commandPalette"),
    programCount: document.querySelector("#programCount"),
    programList: document.querySelector("#programList"),
    codeMetric: document.querySelector("#codeMetric"),
    codeView: document.querySelector("#codeView"),
    objectiveTitle: document.querySelector("#objectiveTitle"),
    objectiveBody: document.querySelector("#objectiveBody"),
    compareGrid: document.querySelector("#compareGrid"),
    compareLabel: document.querySelector("#compareLabel"),
    logStatus: document.querySelector("#logStatus"),
    runLog: document.querySelector("#runLog"),
    artifactTitle: document.querySelector("#artifactTitle"),
    artifactList: document.querySelector("#artifactList"),
    hudGrid: document.querySelector("#hudGrid"),
    runState: document.querySelector("#runState")
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
      kind: "basic",
      code: "move();",
      expand: ["move"]
    },
    left: {
      label: "turnLeft()",
      name: "左转",
      kind: "basic",
      code: "turnLeft();",
      expand: ["left"]
    },
    right: {
      label: "turnRight()",
      name: "右转",
      kind: "basic",
      code: "turnRight();",
      expand: ["right"]
    },
    collect: {
      label: "collect()",
      name: "采集",
      kind: "system",
      code: "collect();",
      expand: ["collect"]
    },
    repeat2: {
      label: "repeat(2)",
      name: "循环 2 次",
      kind: "logic",
      code: "repeat(2) { move(); }",
      expand: ["move", "move"]
    },
    repeat3: {
      label: "repeat(3)",
      name: "循环 3 次",
      kind: "logic",
      code: "repeat(3) { move(); }",
      expand: ["move", "move", "move"]
    },
    repeat4: {
      label: "repeat(4)",
      name: "循环 4 次",
      kind: "logic",
      code: "repeat(4) { move(); }",
      expand: ["move", "move", "move", "move"]
    }
  };

  const lessons = {
    lesson3: {
      id: "lesson3",
      kicker: "Lesson 03",
      title: "能源搜救队",
      concept: "路线规划 · 步数比较",
      story: "飞船能量不足，Neo 需要先规划路线，再采集两颗宝石。",
      target: "画出至少两条采集路线，比较步数和稳定性，并能解释一次漏采集失败。",
      objectiveTitle: "第 3 课：路线规划、步数优化与调试",
      objectiveBody: "这节课不急着引入循环，重点是先看地图、数格子、比较路线，并把失败提示转化为下一次修改的线索。",
      artifactTitle: "路线草图和步数比较",
      artifacts: [
        "至少记录两条路线：先采近处、先采下方。",
        "写出每条路线的代码块数、移动步数和是否采集完整。",
        "保留一次漏采集失败，说明程序结束后为什么还差一颗宝石。"
      ],
      grid: [
        "_________",
        "_SssBsss_",
        "_s##s##s_",
        "_ssBssss_",
        "_sssssss_",
        "_________"
      ],
      startDir: "E",
      energy: 26,
      required: 2,
      limit: 16,
      allowed: ["move", "left", "right", "collect"],
      bestPreset: "near-first",
      presets: [
        {
          id: "near-first",
          title: "先采近处",
          note: "推荐路线，移动更少",
          commands: ["move", "move", "move", "collect", "right", "move", "move", "right", "move", "collect"]
        },
        {
          id: "bottom-first",
          title: "先采下方",
          note: "能完成，绕路更明显",
          commands: ["right", "move", "move", "left", "move", "move", "collect", "move", "left", "move", "move", "collect"]
        },
        {
          id: "miss-one",
          title: "漏采集样例",
          note: "用于调试讨论",
          commands: ["move", "move", "move", "collect", "right", "move", "move"]
        }
      ]
    },
    lesson5: {
      id: "lesson5",
      kicker: "Lesson 05",
      title: "循环引擎点火",
      concept: "重复执行 · for 循环",
      story: "长直线路径让代码变得很啰嗦。循环引擎可以把连续重复的 move() 压缩成清楚的重复意图。",
      target: "先用笨办法采到宝石，再把重复动作改成 repeat 循环，比较代码块数量和执行步数。",
      objectiveTitle: "第 5 课：重复动作与循环改造",
      objectiveBody: "这节课让学生先感受重复代码的笨重，再用 repeat(4) 表达同样的四次前进，理解循环不会改变执行结果，但会让程序更短、更清楚。",
      artifactTitle: "循环改造单",
      artifacts: [
        "保存笨办法代码和循环版代码。",
        "说明两种写法执行步数相同，但代码块数量不同。",
        "解释 repeat(3) 为什么会提前采集失败。"
      ],
      grid: [
        "___________",
        "_SsssBssss_",
        "_ggggggggg_",
        "___________"
      ],
      startDir: "E",
      energy: 18,
      required: 1,
      limit: 6,
      allowed: ["move", "collect", "repeat2", "repeat3", "repeat4"],
      bestPreset: "loop",
      presets: [
        {
          id: "long-way",
          title: "笨办法",
          note: "5 个代码块",
          commands: ["move", "move", "move", "move", "collect"]
        },
        {
          id: "loop",
          title: "循环版",
          note: "2 个代码块",
          commands: ["repeat4", "collect"]
        },
        {
          id: "short-loop",
          title: "次数少了",
          note: "用于边界错误",
          commands: ["repeat3", "collect"]
        }
      ]
    }
  };

  let activeLessonId = "lesson3";
  let program = lessons.lesson3.presets[0].commands.slice();
  let selectedPresetId = lessons.lesson3.presets[0].id;
  let sim = null;
  let runTimer = null;

  function lesson() {
    return lessons[activeLessonId];
  }

  function tileKey(x, y) {
    return `${x},${y}`;
  }

  function parseGrid(source) {
    const data = {
      width: Math.max(...source.map((row) => row.length)),
      height: source.length,
      start: { x: 0, y: 0 },
      relay: null,
      voids: new Set(),
      walls: new Set(),
      beacons: new Map(),
      materials: new Map()
    };

    source.forEach((row, y) => {
      for (let x = 0; x < data.width; x += 1) {
        const tile = row[x] || "_";
        const key = tileKey(x, y);
        if (tile === "_" || tile === " ") data.voids.add(key);
        if (tile === "#") data.walls.add(key);
        if (tile === "S") data.start = { x, y };
        if (tile === "R") data.relay = { x, y };
        if (tile === "B") data.beacons.set(key, { x, y });
        if (tile === "g" || tile === "s") data.materials.set(key, tile);
      }
    });

    return data;
  }

  function turn(dir, offset) {
    const index = directions.indexOf(dir);
    return directions[(index + offset + directions.length) % directions.length];
  }

  function resetSimulation(keepLogs = false) {
    stopRun();
    const grid = parseGrid(lesson().grid);
    const oldLogs = keepLogs && sim ? sim.logs.slice(0, 4) : null;
    sim = {
      grid,
      x: grid.start.x,
      y: grid.start.y,
      dir: lesson().startDir,
      energy: lesson().energy,
      collected: new Set(),
      path: [{ x: grid.start.x, y: grid.start.y }],
      queue: [],
      queueIndex: 0,
      expanded: false,
      failed: false,
      completed: false,
      status: "准备规划",
      logs: oldLogs || [{ message: "系统上线：等待路线方案。", type: "normal" }]
    };
  }

  function expandProgram(commands = program) {
    return commands.flatMap((id) => commandDefs[id]?.expand || [id]).map((id) => ({ id }));
  }

  function analyzeCommands(commands) {
    const expanded = expandProgram(commands);
    return {
      blocks: commands.length,
      moves: expanded.filter((item) => item.id === "move").length,
      executed: expanded.length
    };
  }

  function isWalkable(x, y) {
    const key = tileKey(x, y);
    return x >= 0
      && y >= 0
      && x < sim.grid.width
      && y < sim.grid.height
      && !sim.grid.voids.has(key)
      && !sim.grid.walls.has(key);
  }

  function frontTile() {
    const vector = vectors[sim.dir];
    return { x: sim.x + vector.x, y: sim.y + vector.y };
  }

  function log(message, type = "normal") {
    sim.logs.unshift({ message, type });
    sim.logs = sim.logs.slice(0, 8);
  }

  function fail(message) {
    sim.failed = true;
    sim.status = "需要调试";
    log(message, "error");
    stopRun();
  }

  function complete(message) {
    sim.completed = true;
    sim.status = "任务完成";
    log(message, "success");
    stopRun();
  }

  function reportUnfinished() {
    const missing = lesson().required - sim.collected.size;
    sim.status = "需要补充指令";
    if (missing > 0) {
      log(`程序结束：还差 ${missing} 颗宝石没有采集。`, "error");
      return;
    }
    log("程序结束：采集目标已达成，但完成状态没有更新。", "error");
  }

  function spendEnergy() {
    sim.energy -= 1;
    if (sim.energy <= 0) {
      fail("能量耗尽：路线太长或重复次数不合理。");
      return false;
    }
    return true;
  }

  function execute(id) {
    if (sim.failed || sim.completed) return;

    if (id === "move") {
      const next = frontTile();
      if (!isWalkable(next.x, next.y)) {
        fail(`这里不能通过：当前位置 (${sim.x}, ${sim.y})，朝向${directionLabels[sim.dir]}。`);
        return;
      }
      if (!spendEnergy()) return;
      sim.x = next.x;
      sim.y = next.y;
      sim.path.push({ x: sim.x, y: sim.y });
      log(`前进到 (${sim.x}, ${sim.y})。`);
      return;
    }

    if (id === "left") {
      sim.dir = turn(sim.dir, -1);
      log(`左转，当前朝向${directionLabels[sim.dir]}。`);
      return;
    }

    if (id === "right") {
      sim.dir = turn(sim.dir, 1);
      log(`右转，当前朝向${directionLabels[sim.dir]}。`);
      return;
    }

    if (id === "collect") {
      const key = tileKey(sim.x, sim.y);
      if (!sim.grid.beacons.has(key)) {
        fail("采集失败：当前位置没有宝石。");
        return;
      }
      if (sim.collected.has(key)) {
        fail("采集失败：这颗宝石已经收集过了。");
        return;
      }
      sim.collected.add(key);
      if (sim.collected.size >= lesson().required) {
        complete(`采集完成：${lesson().required} 颗宝石全部收集。`);
        return;
      }
      log(`采集成功：${sim.collected.size} / ${lesson().required}。`, "success");
      return;
    }
  }

  function stepProgram() {
    if (!program.length) {
      sim.status = "程序为空";
      log("主程序还没有指令。", "error");
      render();
      return;
    }

    if (!sim.expanded || sim.failed || sim.completed || sim.queueIndex >= sim.queue.length) {
      resetSimulation(true);
      sim.queue = expandProgram();
      sim.expanded = true;
    }

    if (sim.queueIndex >= sim.queue.length) {
      reportUnfinished();
      render();
      return;
    }

    const item = sim.queue[sim.queueIndex];
    sim.queueIndex += 1;
    execute(item.id);

    if (!sim.failed && !sim.completed && sim.queueIndex >= sim.queue.length) {
      reportUnfinished();
    }

    render();
  }

  function runProgram() {
    if (runTimer) {
      stopRun();
      render();
      return;
    }

    resetSimulation();
    sim.queue = expandProgram();
    sim.expanded = true;
    runTimer = window.setInterval(() => {
      if (sim.failed || sim.completed || sim.queueIndex >= sim.queue.length) {
        stopRun();
        render();
        return;
      }
      stepProgram();
    }, 430);
    stepProgram();
  }

  function stopRun() {
    if (runTimer) {
      window.clearInterval(runTimer);
      runTimer = null;
    }
  }

  function loadPreset(presetId) {
    const preset = lesson().presets.find((item) => item.id === presetId) || lesson().presets[0];
    selectedPresetId = preset.id;
    program = preset.commands.slice();
    resetSimulation();
    render();
  }

  function loadBest() {
    loadPreset(lesson().bestPreset);
  }

  function switchLesson(nextId) {
    if (!lessons[nextId] || nextId === activeLessonId) return;
    activeLessonId = nextId;
    selectedPresetId = lesson().presets[0].id;
    program = lesson().presets[0].commands.slice();
    resetSimulation();
    render();
  }

  function addCommand(id) {
    if (!lesson().allowed.includes(id)) return;
    if (program.length >= lesson().limit) return;
    program = [...program, id];
    selectedPresetId = "";
    resetSimulation(true);
    render();
  }

  function removeCommand(index) {
    program = program.filter((_, itemIndex) => itemIndex !== index);
    selectedPresetId = "";
    resetSimulation(true);
    render();
  }

  function clearProgram() {
    program = [];
    selectedPresetId = "";
    resetSimulation();
    render();
  }

  function render() {
    renderLesson();
    renderPresets();
    renderPalette();
    renderProgram();
    renderCode();
    renderHud();
    renderCompare();
    renderLogs();
    draw();
  }

  function renderLesson() {
    const item = lesson();
    dom.tabs.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.lesson === activeLessonId);
    });
    dom.lessonKicker.textContent = item.kicker;
    dom.lessonTitle.textContent = item.title;
    dom.lessonConcept.textContent = item.concept;
    dom.lessonStory.textContent = item.story;
    dom.lessonTarget.textContent = item.target;
    dom.objectiveTitle.textContent = item.objectiveTitle;
    dom.objectiveBody.textContent = item.objectiveBody;
    dom.artifactTitle.textContent = item.artifactTitle;
    dom.artifactList.innerHTML = `<ul>${item.artifacts.map((text) => `<li>${text}</li>`).join("")}</ul>`;
    dom.runState.textContent = sim.status;
    dom.presetHint.textContent = activeLessonId === "lesson3" ? "比较不同采集顺序" : "比较笨办法和循环版";
  }

  function renderPresets() {
    dom.presetGrid.innerHTML = lesson().presets.map((preset) => {
      const stats = analyzeCommands(preset.commands);
      return `
        <button class="preset-button${preset.id === selectedPresetId ? " is-active" : ""}" data-preset="${preset.id}" type="button">
          <strong>${preset.title}</strong>
          <small>${preset.note} · ${stats.moves} 步移动</small>
        </button>
      `;
    }).join("");
  }

  function renderPalette() {
    dom.programCount.textContent = `${program.length} / ${lesson().limit}`;
    dom.commandPalette.innerHTML = lesson().allowed.map((id) => {
      const command = commandDefs[id];
      const disabled = program.length >= lesson().limit ? "disabled" : "";
      const kindClass = command.kind === "logic" ? " is-logic" : command.kind === "system" ? " is-system" : "";
      return `
        <button class="command-button${kindClass}" data-command="${id}" ${disabled} type="button">
          <strong>${command.name}</strong>
          <small>${command.label}</small>
        </button>
      `;
    }).join("");
  }

  function renderProgram() {
    if (!program.length) {
      dom.programList.className = "program-list is-empty";
      dom.programList.innerHTML = "主程序还没有指令";
      return;
    }

    dom.programList.className = "program-list";
    dom.programList.innerHTML = program.map((id, index) => `
      <li class="program-chip">
        <span>${index + 1}</span>
        <strong>${commandDefs[id].label}</strong>
        <button data-remove="${index}" type="button" aria-label="移除 ${commandDefs[id].label}">x</button>
      </li>
    `).join("");
  }

  function renderCode() {
    const lines = program.length
      ? program.map((id) => `  ${commandDefs[id].code}`)
      : ["  // add commands"];
    const stats = analyzeCommands(program);
    dom.codeMetric.textContent = `${stats.blocks} 个代码块 · ${stats.executed} 个执行动作`;
    dom.codeView.textContent = `function main() {\n${lines.join("\n")}\n}`;
  }

  function renderHud() {
    const stats = analyzeCommands(program);
    const rows = [
      ["位置", `(${sim.x}, ${sim.y})`],
      ["朝向", directionLabels[sim.dir]],
      ["能量", sim.energy],
      ["宝石", `${sim.collected.size} / ${lesson().required}`],
      ["代码块", stats.blocks],
      ["执行动作", stats.executed],
      ["移动步数", stats.moves],
      ["状态", sim.completed ? "已完成" : sim.failed ? "需调试" : "运行前"]
    ];

    dom.hudGrid.innerHTML = rows.map(([label, value]) => `
      <div class="hud-item">
        <small>${label}</small>
        <strong>${value}</strong>
      </div>
    `).join("");
  }

  function renderCompare() {
    const currentStats = analyzeCommands(program);
    const best = lesson().presets.find((item) => item.id === lesson().bestPreset);
    const bestStats = analyzeCommands(best.commands);
    const rows = [
      ["当前代码块", currentStats.blocks, ""],
      ["当前移动步数", currentStats.moves, ""],
      ["推荐代码块", bestStats.blocks, "is-best"],
      ["推荐移动步数", bestStats.moves, "is-best"]
    ];
    dom.compareLabel.textContent = activeLessonId === "lesson3" ? "路线顺序对比" : "循环压缩对比";
    dom.compareGrid.innerHTML = rows.map(([label, value, className]) => `
      <div class="compare-item ${className}">
        <small>${label}</small>
        <strong>${value}</strong>
      </div>
    `).join("");
  }

  function renderLogs() {
    dom.logStatus.textContent = sim.completed ? "已通过" : sim.failed ? "需调试" : runTimer ? "运行中" : "待运行";
    dom.runLog.innerHTML = sim.logs.map((entry) => {
      const className = entry.type === "error" ? " is-error" : entry.type === "success" ? " is-success" : "";
      return `<li class="${className}">${entry.message}</li>`;
    }).join("");
  }

  function syncCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(420, Math.round(rect.width));
    const height = Math.max(420, Math.round(rect.height));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function draw() {
    syncCanvasSize();
    const grid = sim.grid;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#c9efff");
    sky.addColorStop(0.58, "#effcff");
    sky.addColorStop(1, "#ffffff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCloud(canvas.width * 0.16, 86, 0.86);
    drawCloud(canvas.width * 0.82, 112, 0.64);

    const margin = 52;
    const cell = Math.min((canvas.width - margin * 2) / grid.width, (canvas.height - 150) / grid.height);
    const boardW = cell * grid.width;
    const boardH = cell * grid.height;
    const ox = (canvas.width - boardW) / 2;
    const oy = Math.max(96, (canvas.height - boardH) / 2 + 34);

    ctx.fillStyle = "rgba(39, 73, 88, 0.14)";
    roundRect(ox - 24, oy + boardH - 24, boardW + 48, 56, 20);
    ctx.fill();

    for (let y = 0; y < grid.height; y += 1) {
      for (let x = 0; x < grid.width; x += 1) {
        drawTile(grid, x, y, ox, oy, cell);
      }
    }

    drawPath(ox, oy, cell);
    drawObjects(ox, oy, cell);
  }

  function drawTile(grid, x, y, ox, oy, cell) {
    const key = tileKey(x, y);
    if (grid.voids.has(key)) return;

    const px = ox + x * cell;
    const py = oy + y * cell;
    const material = grid.materials.get(key);
    const isWall = grid.walls.has(key);

    ctx.fillStyle = isWall ? "#9ba7b2" : material === "s" ? "#e5ca85" : "#82bf4d";
    roundRect(px + 2, py + 2, cell - 4, cell - 4, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(43, 82, 60, 0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (isWall) {
      ctx.fillStyle = "rgba(80, 90, 102, 0.34)";
      roundRect(px + cell * 0.18, py + cell * 0.2, cell * 0.64, cell * 0.5, 6);
      ctx.fill();
    }
  }

  function drawPath(ox, oy, cell) {
    if (sim.path.length < 2) return;
    ctx.save();
    ctx.strokeStyle = "rgba(35, 126, 189, 0.74)";
    ctx.lineWidth = Math.max(5, cell * 0.11);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    sim.path.forEach((point, index) => {
      const x = ox + point.x * cell + cell / 2;
      const y = oy + point.y * cell + cell / 2;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawObjects(ox, oy, cell) {
    const grid = sim.grid;
    drawMarker(ox, oy, cell, grid.start.x, grid.start.y, "#2b86cc", "S");
    if (grid.relay) {
      drawMarker(ox, oy, cell, grid.relay.x, grid.relay.y, "#8a57d2", "R");
    }

    grid.beacons.forEach((beacon, key) => {
      drawBeacon(ox, oy, cell, beacon.x, beacon.y, sim.collected.has(key));
    });

    drawBot(ox, oy, cell, sim.x, sim.y, sim.dir);
  }

  function drawMarker(ox, oy, cell, x, y, color, label) {
    const cx = ox + x * cell + cell / 2;
    const cy = oy + y * cell + cell / 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, cell * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `900 ${Math.max(14, cell * 0.28)}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, cx, cy + 1);
  }

  function drawBeacon(ox, oy, cell, x, y, collected) {
    const cx = ox + x * cell + cell / 2;
    const cy = oy + y * cell + cell / 2;
    if (collected) {
      ctx.strokeStyle = "rgba(13, 133, 119, 0.58)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 0.22, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }

    ctx.fillStyle = "#e44758";
    ctx.beginPath();
    ctx.moveTo(cx, cy - cell * 0.33);
    ctx.lineTo(cx + cell * 0.22, cy + cell * 0.18);
    ctx.lineTo(cx - cell * 0.22, cy + cell * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.62)";
    ctx.beginPath();
    ctx.moveTo(cx - cell * 0.05, cy - cell * 0.2);
    ctx.lineTo(cx + cell * 0.06, cy + cell * 0.04);
    ctx.lineTo(cx - cell * 0.12, cy + cell * 0.04);
    ctx.closePath();
    ctx.fill();
  }

  function drawBot(ox, oy, cell, x, y, dir) {
    const cx = ox + x * cell + cell / 2;
    const cy = oy + y * cell + cell / 2;
    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = "rgba(39, 49, 61, 0.18)";
    ctx.beginPath();
    ctx.ellipse(0, cell * 0.24, cell * 0.26, cell * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f2b84a";
    ctx.strokeStyle = "#945d24";
    ctx.lineWidth = 2;
    roundRect(-cell * 0.24, -cell * 0.2, cell * 0.48, cell * 0.42, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff8d9";
    ctx.beginPath();
    ctx.ellipse(0, -cell * 0.04, cell * 0.16, cell * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#263747";
    ctx.beginPath();
    ctx.arc(-cell * 0.05, -cell * 0.06, cell * 0.025, 0, Math.PI * 2);
    ctx.arc(cell * 0.05, -cell * 0.06, cell * 0.025, 0, Math.PI * 2);
    ctx.fill();

    const vector = vectors[dir];
    ctx.fillStyle = "#0d8577";
    ctx.beginPath();
    ctx.moveTo(vector.x * cell * 0.38, vector.y * cell * 0.38);
    ctx.lineTo(vector.y * cell * 0.12 - vector.x * cell * 0.06, -vector.x * cell * 0.12 - vector.y * cell * 0.06);
    ctx.lineTo(-vector.y * cell * 0.12 - vector.x * cell * 0.06, vector.x * cell * 0.12 - vector.y * cell * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawCloud(x, y, scale) {
    ctx.save();
    ctx.globalAlpha = 0.44;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(x, y, 72 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 42 * scale, y - 8 * scale, 42 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 44 * scale, y + 5 * scale, 34 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  dom.tabs.forEach((button) => {
    button.addEventListener("click", () => switchLesson(button.dataset.lesson));
  });

  dom.presetGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-preset]");
    if (button) loadPreset(button.dataset.preset);
  });

  dom.commandPalette.addEventListener("click", (event) => {
    const button = event.target.closest("[data-command]");
    if (button) addCommand(button.dataset.command);
  });

  dom.programList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove]");
    if (button) removeCommand(Number(button.dataset.remove));
  });

  dom.runBtn.addEventListener("click", runProgram);
  dom.stepBtn.addEventListener("click", stepProgram);
  dom.resetBtn.addEventListener("click", () => {
    resetSimulation();
    render();
  });
  dom.clearBtn.addEventListener("click", clearProgram);
  dom.loadBestBtn.addEventListener("click", loadBest);
  window.addEventListener("resize", draw);

  resetSimulation();
  render();
})();
