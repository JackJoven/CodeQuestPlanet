(function () {
  const storageKey = "gameMakerPlanet.aiVerifyEvidence";
  const canvas = document.querySelector("#shieldCanvas");
  const ctx = canvas.getContext("2d");

  const dom = {
    reset: document.querySelector("#resetLessonBtn"),
    lessonFlow: document.querySelector("#lessonFlow"),
    status: document.querySelector("#lessonStatus"),
    codeTitle: document.querySelector("#codeTitle"),
    codeView: document.querySelector("#codeView"),
    runTests: document.querySelector("#runTestsBtn"),
    predictionList: document.querySelector("#predictionList"),
    predictionState: document.querySelector("#predictionState"),
    testList: document.querySelector("#testList"),
    testState: document.querySelector("#testState"),
    critiqueList: document.querySelector("#critiqueList"),
    critiqueState: document.querySelector("#critiqueState"),
    patchList: document.querySelector("#patchList"),
    patchState: document.querySelector("#patchState"),
    customTestList: document.querySelector("#customTestList"),
    customTestState: document.querySelector("#customTestState"),
    evidencePreview: document.querySelector("#evidencePreview"),
    evidenceState: document.querySelector("#evidenceState"),
    reflectionForm: document.querySelector("#reflectionForm"),
    reflectionInput: document.querySelector("#reflectionInput"),
    saveFeedback: document.querySelector("#saveFeedback"),
    simCaption: document.querySelector("#simCaption"),
    useShield: document.querySelector("#useShieldBtn"),
    resetArena: document.querySelector("#resetArenaBtn"),
    arenaHud: document.querySelector("#arenaHud")
  };

  const lessonSteps = [
    { id: "read", label: "1", title: "读需求", copy: "明确护盾技能必须检查哪些状态。" },
    { id: "predict", label: "2", title: "预测", copy: "先猜原始代码会在哪些用例失败。" },
    { id: "baseline", label: "3", title: "跑测试", copy: "用测试证明 bug 真实存在。" },
    { id: "critique", label: "4", title: "审 AI", copy: "指出 AI 建议漏掉了哪些风险。" },
    { id: "patch", label: "5", title: "选补丁", copy: "选择并验证能通过全部测试的补丁。" },
    { id: "evidence", label: "6", title: "证据", copy: "新增测试并保存验证证据卡。" }
  ];

  const codeVersions = {
    original: {
      title: "原始版本",
      label: "原始代码",
      code: `function useShield(state) {
  if (state.energy >= 30) {
    return {
      ...state,
      energy: state.energy - 30,
      shield: true,
      shieldTime: 5
    };
  }

  return state;
}`,
      run(state) {
        if (state.energy >= 30) {
          return {
            ...state,
            energy: state.energy - 30,
            shield: true,
            shieldTime: 5
          };
        }

        return { ...state };
      }
    },
    aiBad: {
      title: "AI 快速建议",
      label: "只改能量边界",
      code: `function useShield(state) {
  if (state.energy > 30) {
    return {
      ...state,
      energy: state.energy - 30,
      shield: true,
      shieldTime: 5
    };
  }

  return state;
}`,
      run(state) {
        if (state.energy > 30) {
          return {
            ...state,
            energy: state.energy - 30,
            shield: true,
            shieldTime: 5
          };
        }

        return { ...state };
      }
    },
    partial: {
      title: "部分修复",
      label: "检查冷却，但漏掉眩晕",
      code: `function useShield(state) {
  if (state.energy >= 30 && state.cooldown === 0) {
    return {
      ...state,
      energy: state.energy - 30,
      shield: true,
      shieldTime: 5,
      cooldown: 3
    };
  }

  return state;
}`,
      run(state) {
        if (state.energy >= 30 && state.cooldown === 0) {
          return {
            ...state,
            energy: state.energy - 30,
            shield: true,
            shieldTime: 5,
            cooldown: 3
          };
        }

        return { ...state };
      }
    },
    correct: {
      title: "完整补丁",
      label: "检查能量、冷却和眩晕",
      code: `function useShield(state) {
  const canUseShield =
    state.energy >= 30 &&
    state.cooldown === 0 &&
    state.stunned === false;

  if (!canUseShield) {
    return state;
  }

  return {
    ...state,
    energy: state.energy - 30,
    shield: true,
    shieldTime: 5,
    cooldown: 3
  };
}`,
      run(state) {
        const canUseShield = state.energy >= 30
          && state.cooldown === 0
          && state.stunned === false;

        if (!canUseShield) {
          return { ...state };
        }

        return {
          ...state,
          energy: state.energy - 30,
          shield: true,
          shieldTime: 5,
          cooldown: 3
        };
      }
    }
  };

  const testCases = [
    {
      id: "happy",
      title: "能量足够且无冷却时可以开盾",
      input: { energy: 60, cooldown: 0, stunned: false, shield: false, shieldTime: 0 },
      expect: { energy: 30, cooldown: 3, stunned: false, shield: true, shieldTime: 5 }
    },
    {
      id: "lowEnergy",
      title: "能量不足时不能开盾",
      input: { energy: 20, cooldown: 0, stunned: false, shield: false, shieldTime: 0 },
      expect: { energy: 20, cooldown: 0, stunned: false, shield: false, shieldTime: 0 }
    },
    {
      id: "cooling",
      title: "冷却中不能开盾",
      input: { energy: 60, cooldown: 2, stunned: false, shield: false, shieldTime: 0 },
      expect: { energy: 60, cooldown: 2, stunned: false, shield: false, shieldTime: 0 }
    },
    {
      id: "stunned",
      title: "眩晕中不能开盾",
      input: { energy: 60, cooldown: 0, stunned: true, shield: false, shieldTime: 0 },
      expect: { energy: 60, cooldown: 0, stunned: true, shield: false, shieldTime: 0 }
    }
  ];

  const predictionQuestions = testCases.map((test) => ({
    id: test.id,
    prompt: `原始代码：${test.title}。你预测测试结果？`,
    answer: test.id === "lowEnergy" ? "pass" : "fail"
  }));

  const critiqueItems = [
    {
      id: "boundary",
      label: "它把 energy >= 30 改成 > 30，会破坏刚好 30 能量的边界。",
      correct: true
    },
    {
      id: "cooldown",
      label: "它没有处理 cooldown，所以冷却中仍可能开盾。",
      correct: true
    },
    {
      id: "stunned",
      label: "它没有处理 stunned，所以眩晕中仍可能开盾。",
      correct: true
    },
    {
      id: "style",
      label: "它只是少写了注释，逻辑其实已经完整。",
      correct: false
    }
  ];

  const patchOptions = [
    {
      id: "aiBad",
      title: "补丁 A：接受 AI 快速建议",
      summary: "只把 energy >= 30 改成 energy > 30。",
      code: "if (state.energy > 30) { ... }"
    },
    {
      id: "partial",
      title: "补丁 B：检查冷却",
      summary: "检查 energy 和 cooldown，但没有检查 stunned。",
      code: "if (state.energy >= 30 && state.cooldown === 0) { ... }"
    },
    {
      id: "correct",
      title: "补丁 C：完整检查",
      summary: "同时检查 energy、cooldown 和 stunned，并设置 cooldown。",
      code: "energy >= 30 && cooldown === 0 && stunned === false"
    }
  ];

  const customTestOptions = [
    {
      id: "energyExact",
      label: "能量刚好 30 时应该可以开盾",
      correct: true,
      reason: "这能防止 AI 把 >= 30 错改成 > 30。"
    },
    {
      id: "rename",
      label: "变量名 state 应该改成 playerState",
      correct: false,
      reason: "命名可以讨论，但它不能证明护盾逻辑是否正确。"
    },
    {
      id: "color",
      label: "护盾颜色应该变蓝",
      correct: false,
      reason: "这是视觉需求，不是这段技能逻辑的边界测试。"
    }
  ];

  const state = {
    selectedVersion: "original",
    selectedCase: "happy",
    predictions: {},
    testsRun: false,
    testResults: [],
    critique: {},
    selectedPatch: null,
    customTest: null,
    saved: false
  };

  const arena = {
    keys: new Set(),
    player: {
      x: 96,
      y: 210,
      r: 18,
      speed: 3.4,
      hp: 3,
      energy: 40,
      cooldown: 0,
      stunned: false,
      stunTimer: 0,
      shield: false,
      shieldTime: 0
    },
    orb: { x: 586, y: 86, r: 14, active: true },
    hazards: [
      { x: 288, y: 92, w: 92, h: 88, label: "冷却陷阱" },
      { x: 430, y: 254, w: 138, h: 64, label: "眩晕区" }
    ],
    lastHitAt: 0,
    message: "先玩：吃能量球，按 Space 开盾，再试着穿过红色危险区。",
    lastFrame: performance.now()
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function shallowEqual(a, b) {
    return Object.keys(b).every((key) => a[key] === b[key]);
  }

  function runCase(versionId, test) {
    const output = codeVersions[versionId].run(clone(test.input));
    return {
      id: test.id,
      pass: shallowEqual(output, test.expect),
      output
    };
  }

  function runTests() {
    state.testsRun = true;
    state.testResults = testCases.map((test) => runCase(state.selectedVersion, test));
    state.selectedCase = state.testResults.find((result) => !result.pass)?.id || "happy";
    renderAll();
  }

  function predictionsComplete() {
    return predictionQuestions.every((question) => state.predictions[question.id] === question.answer);
  }

  function critiqueComplete() {
    const selected = Object.entries(state.critique).filter(([, value]) => value).map(([key]) => key);
    const correct = critiqueItems.filter((item) => item.correct).map((item) => item.id);
    return correct.every((id) => selected.includes(id))
      && selected.every((id) => critiqueItems.find((item) => item.id === id)?.correct);
  }

  function patchComplete() {
    return state.selectedVersion === "correct"
      && state.testsRun
      && state.testResults.length === testCases.length
      && state.testResults.every((result) => result.pass);
  }

  function customTestComplete() {
    return state.customTest === "energyExact";
  }

  function lessonComplete() {
    return predictionsComplete() && state.testsRun && critiqueComplete() && patchComplete() && customTestComplete();
  }

  function loadEvidence() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function renderLessonFlow() {
    const saved = Boolean(loadEvidence());
    const status = {
      read: true,
      predict: predictionsComplete(),
      baseline: state.testsRun,
      critique: critiqueComplete(),
      patch: patchComplete(),
      evidence: saved
    };
    const current = lessonSteps.find((step) => !status[step.id]);

    dom.lessonFlow.innerHTML = lessonSteps.map((step) => {
      const done = status[step.id] ? " is-done" : "";
      const active = current && current.id === step.id ? " is-current" : "";
      return `
        <div class="flow-step${done}${active}">
          <span>${step.label}</span>
          <strong>${step.title}</strong>
          <p>${step.copy}</p>
        </div>
      `;
    }).join("");
  }

  function renderCode() {
    const version = codeVersions[state.selectedVersion];
    dom.codeTitle.textContent = version.title;
    dom.codeView.textContent = version.code;
  }

  function renderPredictions() {
    const count = predictionQuestions.filter((question) => state.predictions[question.id] === question.answer).length;
    dom.predictionState.textContent = `${count} / ${predictionQuestions.length}`;

    dom.predictionList.innerHTML = predictionQuestions.map((question) => {
      const selected = state.predictions[question.id] || "";
      const correct = selected === question.answer;
      const itemClass = selected ? (correct ? " is-correct" : " is-wrong") : "";
      return `
        <div class="exercise-item${itemClass}">
          <strong>${question.prompt}</strong>
          <div class="exercise-options">
            ${renderPredictionOption(question.id, "pass", "会通过")}
            ${renderPredictionOption(question.id, "fail", "会失败")}
          </div>
          ${selected ? `<p class="exercise-feedback">${correct ? "预测正确。" : "再想想：原始代码只检查 energy，漏了哪些状态？"}</p>` : ""}
        </div>
      `;
    }).join("");
  }

  function renderPredictionOption(questionId, answer, label) {
    const selected = state.predictions[questionId] === answer ? " is-selected" : "";
    return `<button class="exercise-option${selected}" type="button" data-prediction="${questionId}" data-answer="${answer}">${label}</button>`;
  }

  function renderTests() {
    const passCount = state.testResults.filter((result) => result.pass).length;
    dom.testState.textContent = state.testsRun ? `${passCount} / ${testCases.length} 通过` : "未运行";

    dom.testList.innerHTML = testCases.map((test) => {
      const result = state.testResults.find((item) => item.id === test.id);
      const statusClass = !result ? "" : result.pass ? " is-pass" : " is-fail";
      const resultText = !result ? "未运行" : result.pass ? "PASS" : "FAIL";
      const resultClass = !result ? "" : result.pass ? " pass" : " fail";
      const selected = state.selectedCase === test.id ? " is-selected" : "";
      return `
        <div class="test-case${statusClass}${selected}">
          <div class="test-head">
            <strong>${test.title}</strong>
            <span class="test-result${resultClass}">${resultText}</span>
          </div>
          <p>输入：energy ${test.input.energy}，cooldown ${test.input.cooldown}，stunned ${test.input.stunned}</p>
          <button class="mini-action" type="button" data-case="${test.id}">查看这个状态</button>
        </div>
      `;
    }).join("");
  }

  function renderCritique() {
    dom.critiqueState.textContent = critiqueComplete() ? "已完成" : "未完成";
    dom.critiqueList.innerHTML = critiqueItems.map((item) => {
      const selected = state.critique[item.id] ? " is-selected" : "";
      const correctness = state.critique[item.id] ? (item.correct ? " is-correct" : " is-wrong") : "";
      return `
        <div class="exercise-item${selected}${correctness}">
          <button class="exercise-option${selected}${correctness}" type="button" data-critique="${item.id}">
            ${item.label}
          </button>
          ${state.critique[item.id] ? `<p class="exercise-feedback">${item.correct ? "这是有效审查点。" : "这不是主要逻辑风险。"}</p>` : ""}
        </div>
      `;
    }).join("");
  }

  function renderPatches() {
    dom.patchState.textContent = state.selectedPatch
      ? (patchComplete() ? "测试通过" : patchOptions.find((patch) => patch.id === state.selectedPatch)?.title || "已选择")
      : "未选择";

    dom.patchList.innerHTML = patchOptions.map((patch) => {
      const selected = state.selectedPatch === patch.id ? " is-selected" : "";
      const correct = state.selectedPatch === patch.id && patch.id === "correct" && patchComplete() ? " is-correct" : "";
      return `
        <div class="patch-card${selected}${correct}">
          <div class="patch-head">
            <strong>${patch.title}</strong>
            <button class="mini-action" type="button" data-patch="${patch.id}">应用补丁</button>
          </div>
          <p>${patch.summary}</p>
          <pre>${patch.code}</pre>
        </div>
      `;
    }).join("");
  }

  function renderCustomTest() {
    dom.customTestState.textContent = customTestComplete() ? "已完成" : "未完成";
    dom.customTestList.innerHTML = customTestOptions.map((option) => {
      const selected = state.customTest === option.id ? " is-selected" : "";
      const correctness = selected ? (option.correct ? " is-correct" : " is-wrong") : "";
      return `
        <div class="exercise-item${selected}${correctness}">
          <button class="exercise-option${selected}${correctness}" type="button" data-custom-test="${option.id}">
            ${option.label}
          </button>
          ${selected ? `<p class="exercise-feedback">${option.reason}</p>` : ""}
        </div>
      `;
    }).join("");
  }

  function buildEvidence() {
    const reflection = dom.reflectionInput.value.trim()
      || "AI 只改了能量边界，但没有检查 cooldown 和 stunned。我用测试证明它不够安全。";
    const originalFailures = testCases
      .map((test) => ({ test, result: runCase("original", test) }))
      .filter((item) => !item.result.pass)
      .map((item) => item.test.title);

    return {
      courseId: "L2-18",
      title: "AI 建议验证证据卡",
      savedAt: new Date().toISOString(),
      bug: "护盾技能原始代码只检查 energy，漏掉 cooldown 和 stunned。",
      failedTests: originalFailures,
      aiRisk: critiqueItems.filter((item) => item.correct).map((item) => item.label),
      patch: codeVersions.correct.label,
      newTest: "能量刚好 30 时应该可以开盾",
      reflection
    };
  }

  function renderEvidence() {
    const saved = loadEvidence();
    const canGenerate = lessonComplete() || saved;
    dom.evidenceState.textContent = saved ? "已保存" : canGenerate ? "可保存" : "未完成";

    if (!canGenerate) {
      dom.evidencePreview.innerHTML = "<p>完成预测、跑测试、审查建议、选择正确补丁和补测试后，这里会生成证据卡。</p>";
      return;
    }

    const evidence = saved || buildEvidence();
    dom.evidencePreview.innerHTML = `
      <h3>${evidence.title}</h3>
      <p><strong>Bug：</strong>${evidence.bug}</p>
      <p><strong>失败测试：</strong>${evidence.failedTests.join("；") || "最终补丁已通过全部测试"}</p>
      <p><strong>AI 风险：</strong>${evidence.aiRisk.join("；")}</p>
      <p><strong>正确补丁：</strong>${evidence.patch}</p>
      <p><strong>新增测试：</strong>${evidence.newTest}</p>
      <p><strong>复盘：</strong>${evidence.reflection}</p>
    `;

    if (!dom.reflectionInput.value.trim()) {
      dom.reflectionInput.value = evidence.reflection;
    }
  }

  function renderStatus() {
    if (lessonComplete()) {
      dom.status.textContent = "可保存证据";
    } else if (!predictionsComplete()) {
      dom.status.textContent = "先做预测";
    } else if (!state.testsRun) {
      dom.status.textContent = "运行测试";
    } else if (!critiqueComplete()) {
      dom.status.textContent = "审查 AI";
    } else if (!patchComplete()) {
      dom.status.textContent = "选择补丁";
    } else {
      dom.status.textContent = "补一个测试";
    }
  }

  function resetArena() {
    arena.player.x = 96;
    arena.player.y = 210;
    arena.player.hp = 3;
    arena.player.energy = 40;
    arena.player.cooldown = 0;
    arena.player.stunned = false;
    arena.player.stunTimer = 0;
    arena.player.shield = false;
    arena.player.shieldTime = 0;
    arena.orb.active = true;
    arena.lastHitAt = 0;
    arena.message = "先玩：吃能量球，按 Space 开盾，再试着穿过红色危险区。";
    updateArenaHud();
  }

  function attemptShield() {
    const before = arenaStateForCode();
    const after = codeVersions[state.selectedVersion].run(before);
    const changed = JSON.stringify(before) !== JSON.stringify(after);
    arena.player.energy = after.energy;
    arena.player.cooldown = after.cooldown || 0;
    arena.player.stunned = Boolean(after.stunned);
    arena.player.shield = Boolean(after.shield);
    arena.player.shieldTime = Number(after.shieldTime || 0);

    if (changed && arena.player.shield) {
      arena.message = `${codeVersions[state.selectedVersion].title} 允许开盾。现在撞危险区验证是否合理。`;
    } else {
      arena.message = "当前状态不能开盾。检查 energy、cooldown 和 stunned。";
    }

    updateArenaHud();
  }

  function arenaStateForCode() {
    return {
      energy: Math.round(arena.player.energy),
      cooldown: Math.round(arena.player.cooldown),
      stunned: arena.player.stunned,
      shield: arena.player.shield,
      shieldTime: Math.round(arena.player.shieldTime)
    };
  }

  function updateArena(dt) {
    const player = arena.player;
    player.cooldown = Math.max(0, player.cooldown - dt);
    player.shieldTime = Math.max(0, player.shieldTime - dt);
    if (player.shieldTime <= 0) {
      player.shield = false;
    }
    if (player.stunTimer > 0) {
      player.stunTimer = Math.max(0, player.stunTimer - dt);
      if (player.stunTimer === 0) {
        player.stunned = false;
      }
    }

    let dx = 0;
    let dy = 0;
    if (!player.stunned) {
      if (arena.keys.has("ArrowLeft") || arena.keys.has("a")) dx -= 1;
      if (arena.keys.has("ArrowRight") || arena.keys.has("d")) dx += 1;
      if (arena.keys.has("ArrowUp") || arena.keys.has("w")) dy -= 1;
      if (arena.keys.has("ArrowDown") || arena.keys.has("s")) dy += 1;
    }

    if (dx || dy) {
      const length = Math.hypot(dx, dy) || 1;
      player.x += (dx / length) * player.speed;
      player.y += (dy / length) * player.speed;
    }

    player.x = clamp(player.x, 26, canvas.width - 26);
    player.y = clamp(player.y, 58, canvas.height - 28);

    if (arena.orb.active && distance(player.x, player.y, arena.orb.x, arena.orb.y) < player.r + arena.orb.r) {
      arena.orb.active = false;
      player.energy = Math.min(100, player.energy + 30);
      arena.message = "吃到能量球：energy + 30。现在可以尝试开盾。";
    }

    const now = performance.now();
    for (const hazard of arena.hazards) {
      if (circleRectCollision(player, hazard) && now - arena.lastHitAt > 900) {
        arena.lastHitAt = now;
        if (player.shield) {
          arena.message = "护盾挡住了危险区。现在思考：什么状态下不应该允许开盾？";
        } else {
          player.hp = Math.max(0, player.hp - 1);
          player.stunned = true;
          player.stunTimer = 1.2;
          player.x = 96;
          player.y = 210;
          arena.message = "没有护盾撞危险区：hp - 1，并进入 stunned。";
        }
      }
    }

    updateArenaHud();
  }

  function updateArenaHud() {
    dom.arenaHud.textContent = `HP ${arena.player.hp} · Energy ${Math.round(arena.player.energy)} · Cooldown ${arena.player.cooldown.toFixed(1)} · Stunned ${arena.player.stunned} · Shield ${arena.player.shield}`;
    dom.simCaption.textContent = arena.message;
  }

  function renderArena() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#eaf1f2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawArenaGrid();
    drawArenaHud();
    drawHazards();
    drawOrb();
    drawArenaPlayer();
  }

  function drawArenaGrid() {
    ctx.strokeStyle = "rgba(23, 32, 42, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 48);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 48; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function drawArenaHud() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, 48);
    ctx.fillStyle = "#17202a";
    ctx.font = "900 18px system-ui";
    ctx.fillText(codeVersions[state.selectedVersion].title, 20, 31);
    drawBar("Energy", arena.player.energy, 100, 220, 16, "#2f73d9");
    drawBar("Cooldown", arena.player.cooldown, 3, 390, 16, "#f5c84b");
    drawBar("Shield", arena.player.shieldTime, 5, 560, 16, "#2f8f63");
  }

  function drawBar(label, value, max, x, y, color) {
    ctx.fillStyle = "#596575";
    ctx.font = "800 12px system-ui";
    ctx.fillText(label, x, y - 3);
    ctx.fillStyle = "#d8e0e4";
    ctx.fillRect(x, y + 5, 126, 10);
    ctx.fillStyle = color;
    ctx.fillRect(x, y + 5, 126 * Math.min(value / max, 1), 10);
  }

  function drawHazards() {
    for (const hazard of arena.hazards) {
      ctx.fillStyle = "#f6d8d6";
      ctx.strokeStyle = "#d45b55";
      ctx.lineWidth = 3;
      ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h);
      ctx.strokeRect(hazard.x, hazard.y, hazard.w, hazard.h);
      ctx.fillStyle = "#8d312c";
      ctx.font = "900 14px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(hazard.label, hazard.x + hazard.w / 2, hazard.y + hazard.h / 2 + 5);
      ctx.textAlign = "left";
    }
  }

  function drawOrb() {
    if (!arena.orb.active) return;
    ctx.beginPath();
    ctx.arc(arena.orb.x, arena.orb.y, arena.orb.r, 0, Math.PI * 2);
    ctx.fillStyle = "#f5c84b";
    ctx.fill();
    ctx.strokeStyle = "#8b6b18";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function drawArenaPlayer() {
    const player = arena.player;
    if (player.shield) {
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r + 16, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(47, 115, 217, 0.65)";
      ctx.lineWidth = 9;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fillStyle = player.stunned ? "#d45b55" : "#2f73d9";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "900 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(player.stunned ? "晕" : "我", player.x, player.y + 5);
    ctx.textAlign = "left";
  }

  function circleRectCollision(circle, rect) {
    const closestX = clamp(circle.x, rect.x, rect.x + rect.w);
    const closestY = clamp(circle.y, rect.y, rect.y + rect.h);
    return distance(circle.x, circle.y, closestX, closestY) < circle.r;
  }

  function distance(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function gameLoop(now) {
    const dt = Math.min(0.05, (now - arena.lastFrame) / 1000 || 0);
    arena.lastFrame = now;
    updateArena(dt);
    renderArena();
    window.requestAnimationFrame(gameLoop);
  }

  function renderAll() {
    renderLessonFlow();
    renderStatus();
    renderCode();
    renderPredictions();
    renderTests();
    renderCritique();
    renderPatches();
    renderCustomTest();
    renderEvidence();
    updateArenaHud();
  }

  function saveEvidence(event) {
    event.preventDefault();
    if (!lessonComplete()) {
      dom.saveFeedback.textContent = "先完成预测、测试、AI 审查、正确补丁和新增测试。";
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(buildEvidence()));
    dom.saveFeedback.textContent = "已保存。成长报告可以读取这张 L2 证据卡。";
    renderEvidence();
  }

  function resetLesson() {
    state.selectedVersion = "original";
    state.selectedCase = "happy";
    state.predictions = {};
    state.testsRun = false;
    state.testResults = [];
    state.critique = {};
    state.selectedPatch = null;
    state.customTest = null;
    state.saved = false;
    resetArena();
    dom.reflectionInput.value = "";
    dom.saveFeedback.textContent = "证据卡会保存在这个浏览器里。";
    renderAll();
  }

  function bindEvents() {
    dom.runTests.addEventListener("click", runTests);
    dom.reset.addEventListener("click", resetLesson);
    dom.useShield.addEventListener("click", attemptShield);
    dom.resetArena.addEventListener("click", resetArena);
    dom.reflectionForm.addEventListener("submit", saveEvidence);

    window.addEventListener("keydown", (event) => {
      const target = event.target;
      const isTyping = target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.isContentEditable);
      if (isTyping) {
        return;
      }
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(key)) {
        event.preventDefault();
        arena.keys.add(key);
      }
      if (event.code === "Space") {
        event.preventDefault();
        attemptShield();
      }
    });

    window.addEventListener("keyup", (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      arena.keys.delete(key);
    });

    dom.predictionList.addEventListener("click", (event) => {
      const option = event.target.closest("[data-prediction]");
      if (!option) return;
      state.predictions[option.dataset.prediction] = option.dataset.answer;
      renderAll();
    });

    dom.testList.addEventListener("click", (event) => {
      const option = event.target.closest("[data-case]");
      if (!option) return;
      state.selectedCase = option.dataset.case;
      renderAll();
    });

    dom.critiqueList.addEventListener("click", (event) => {
      const option = event.target.closest("[data-critique]");
      if (!option) return;
      state.critique[option.dataset.critique] = !state.critique[option.dataset.critique];
      renderAll();
    });

    dom.patchList.addEventListener("click", (event) => {
      const option = event.target.closest("[data-patch]");
      if (!option) return;
      state.selectedPatch = option.dataset.patch;
      state.selectedVersion = option.dataset.patch;
      state.testsRun = false;
      state.testResults = [];
      renderAll();
    });

    dom.customTestList.addEventListener("click", (event) => {
      const option = event.target.closest("[data-custom-test]");
      if (!option) return;
      state.customTest = option.dataset.customTest;
      renderAll();
    });
  }

  bindEvents();
  resetArena();
  renderAll();
  window.requestAnimationFrame(gameLoop);
})();
