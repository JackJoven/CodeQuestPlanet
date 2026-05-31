(function () {
  const storageKey = "gameMakerPlanet.stateLabEvidence";
  const canvas = document.querySelector("#stateLabCanvas");
  const ctx = canvas.getContext("2d");

  const dom = {
    reset: document.querySelector("#resetLabBtn"),
    status: document.querySelector("#lessonStatus"),
    toast: document.querySelector("#canvasToast"),
    lessonFlow: document.querySelector("#lessonFlow"),
    stateList: document.querySelector("#stateList"),
    guide: document.querySelector("#guideText"),
    nextAction: document.querySelector("#nextActionText"),
    focusNext: document.querySelector("#focusNextBtn"),
    predictionList: document.querySelector("#predictionList"),
    predictionState: document.querySelector("#predictionState"),
    timelineList: document.querySelector("#timelineList"),
    ruleList: document.querySelector("#ruleList"),
    cardDeck: document.querySelector("#cardDeck"),
    deckTitle: document.querySelector("#deckTitle"),
    deckHint: document.querySelector("#deckHint"),
    assembledCount: document.querySelector("#assembledCount"),
    coachLog: document.querySelector("#coachLog"),
    diagnosisList: document.querySelector("#diagnosisList"),
    diagnosisState: document.querySelector("#diagnosisState"),
    transferOptions: document.querySelector("#transferOptions"),
    transferDetail: document.querySelector("#transferDetail"),
    transferState: document.querySelector("#transferState"),
    evidencePanel: document.querySelector("#evidencePanel"),
    evidencePreview: document.querySelector("#evidencePreview"),
    evidenceState: document.querySelector("#evidenceState"),
    reflectionForm: document.querySelector("#reflectionForm"),
    reflectionInput: document.querySelector("#reflectionInput"),
    saveFeedback: document.querySelector("#saveFeedback")
  };

  const cards = {
    event: [
      { id: "touch_key", label: "玩家碰到钥匙" },
      { id: "touch_door", label: "玩家碰到门" },
      { id: "touch_danger", label: "玩家碰到危险地砖" },
      { id: "timer_tick", label: "每隔 3 秒", distractor: true }
    ],
    condition: [
      { id: "key_not_collected", label: "钥匙还没有被拿走" },
      { id: "has_key_true", label: "hasKey 是 true" },
      { id: "has_key_false", label: "hasKey 是 false", distractor: true },
      { id: "hp_gt_zero", label: "hp > 0" },
      { id: "score_gt_ten", label: "score > 10", distractor: true }
    ],
    action: [
      { id: "take_key", label: "获得钥匙并隐藏钥匙" },
      { id: "open_door", label: "打开门并通关" },
      { id: "hurt_player", label: "hp - 1，并弹回安全点" },
      { id: "spawn_enemy", label: "生成敌人", distractor: true },
      { id: "increase_score", label: "分数 + 10", distractor: true }
    ]
  };

  const rules = [
    {
      id: "keyRule",
      title: "规则 1：钥匙会改变状态",
      slots: { event: null, condition: null, action: null },
      expected: { event: "touch_key", condition: "key_not_collected", action: "take_key" },
      triggered: false,
      recent: false,
      locked: false
    },
    {
      id: "doorRule",
      title: "规则 2：门会读取状态",
      slots: { event: "touch_door", condition: "has_key_false", action: "open_door" },
      expected: { event: "touch_door", condition: "has_key_true", action: "open_door" },
      triggered: false,
      recent: false,
      locked: false,
      bugRule: true
    },
    {
      id: "dangerRule",
      title: "规则 3：危险会改变 hp",
      slots: { event: null, condition: null, action: null },
      expected: { event: "touch_danger", condition: "hp_gt_zero", action: "hurt_player" },
      triggered: false,
      recent: false,
      locked: false
    }
  ];

  const lessonSteps = [
    { id: "observe", label: "1", title: "观察", copy: "先碰门，确认游戏现在没有开门。" },
    { id: "predict", label: "2", title: "预测", copy: "运行前先猜状态会怎么变。" },
    { id: "rules", label: "3", title: "拼规则", copy: "拼出钥匙、门和危险地砖规则。" },
    { id: "debug", label: "4", title: "修错", copy: "修复门规则条件写反的 bug。" },
    { id: "transfer", label: "5", title: "迁移", copy: "换个主题继续识别状态。" },
    { id: "evidence", label: "6", title: "证据", copy: "保存状态规则证据卡。" }
  ];

  const predictionQuestions = [
    {
      id: "doorBeforeKey",
      prompt: "如果 hasKey 是 false，玩家直接碰门会发生什么？",
      answer: "doorClosed",
      options: [
        { id: "doorClosed", label: "门不会开" },
        { id: "doorOpen", label: "门会打开" },
        { id: "hpDown", label: "hp 会减少" }
      ],
      feedback: "对。门规则要读取 hasKey，false 代表还没拿钥匙。"
    },
    {
      id: "keyState",
      prompt: "碰到钥匙后，哪一个状态应该变化？",
      answer: "hasKey",
      options: [
        { id: "doorOpen", label: "doorOpen" },
        { id: "hasKey", label: "hasKey" },
        { id: "hp", label: "hp" }
      ],
      feedback: "对。钥匙负责改变 hasKey，让游戏记住拿过钥匙。"
    },
    {
      id: "doorAfterKey",
      prompt: "如果 hasKey 已经是 true，再碰门应该发生什么？",
      answer: "doorOpen",
      options: [
        { id: "hpDown", label: "hp - 1" },
        { id: "keyHide", label: "钥匙重新出现" },
        { id: "doorOpen", label: "doorOpen 变 true" }
      ],
      feedback: "对。后面的门规则读取前面的 hasKey 状态。"
    }
  ];

  const diagnosisExercises = [
    {
      id: "wrongCondition",
      rule: "当 玩家碰到门 / 如果 hasKey 是 false / 就 打开门",
      question: "拿到钥匙后门不开。这条规则错在哪里？",
      answer: "condition",
      feedback: "对，错在“如果”。拿到钥匙后 hasKey 是 true，条件不能检查 false。"
    },
    {
      id: "wrongEvent",
      rule: "当 玩家碰到危险地砖 / 如果 钥匙还没有被拿走 / 就 获得钥匙",
      question: "玩家碰钥匙却拿不到钥匙。这条规则错在哪里？",
      answer: "event",
      feedback: "对，错在“当”。获得钥匙应该由碰到钥匙触发。"
    },
    {
      id: "wrongAction",
      rule: "当 玩家碰到危险地砖 / 如果 hp > 0 / 就 打开门",
      question: "碰危险地砖却把门打开了。这条规则错在哪里？",
      answer: "action",
      feedback: "对，错在“就”。危险地砖应该改变 hp，而不是开门。"
    }
  ];

  const diagnosisOptions = [
    { id: "event", label: "错在当" },
    { id: "condition", label: "错在如果" },
    { id: "action", label: "错在就" }
  ];

  const transferChallenges = [
    {
      id: "chest",
      title: "宝石开宝箱",
      setup: "先拿宝石，游戏记住 hasGem，再碰宝箱打开 chestOpen。",
      stateAnswer: "hasGem",
      readerAnswer: "宝箱规则",
      stateOptions: ["hasGem", "doorOpen", "hp"],
      readerOptions: ["宝箱规则", "危险规则", "计分规则"]
    },
    {
      id: "bridge",
      title: "拉杆放桥",
      setup: "先拉动机关，游戏记住 bridgeDown，再走到河边通过桥。",
      stateAnswer: "bridgeDown",
      readerAnswer: "过河规则",
      stateOptions: ["hasKey", "bridgeDown", "score"],
      readerOptions: ["过河规则", "生成规则", "扣血规则"]
    },
    {
      id: "shield",
      title: "护盾过危险区",
      setup: "先拿护盾，游戏记住 hasShield，再碰危险区不扣血。",
      stateAnswer: "hasShield",
      readerAnswer: "危险区规则",
      stateOptions: ["hasShield", "doorOpen", "timer"],
      readerOptions: ["危险区规则", "开门规则", "随机规则"]
    }
  ];

  const world = {
    width: 880,
    height: 520,
    keys: new Set(),
    touchKeys: new Set(),
    player: { x: 110, y: 380, r: 18, speed: 3.8 },
    start: { x: 110, y: 380 },
    key: { x: 250, y: 180, w: 44, h: 44, collected: false },
    door: { x: 780, y: 186, w: 52, h: 138 },
    danger: { x: 448, y: 322, w: 138, h: 62 },
    state: { hasKey: false, doorOpen: false, hp: 3 },
    previousState: { hasKey: false, doorOpen: false, hp: 3 },
    changed: new Set(),
    phase: "observeDoor",
    observedDoor: false,
    observedBug: false,
    dangerTested: false,
    completed: false,
    evidenceSaved: false,
    activeSlot: null,
    recommended: null,
    predictions: {},
    diagnosis: {},
    transfer: { challenge: null, state: null, reader: null },
    timeline: [],
    lastCollision: null,
    toastTimer: 0
  };

  function cardLabel(type, id) {
    const card = cards[type].find((item) => item.id === id);
    return card ? card.label : "选择卡片";
  }

  function ruleReady(rule) {
    return Boolean(rule.slots.event && rule.slots.condition && rule.slots.action);
  }

  function ruleCorrect(rule) {
    return ["event", "condition", "action"].every((slot) => rule.slots[slot] === rule.expected[slot]);
  }

  function allRequiredReady() {
    return rules.every(ruleReady);
  }

  function predictionsComplete() {
    return predictionQuestions.every((question) => world.predictions[question.id] === question.answer);
  }

  function diagnosisComplete() {
    return diagnosisExercises.every((exercise) => world.diagnosis[exercise.id] === exercise.answer);
  }

  function activeTransferChallenge() {
    return transferChallenges.find((challenge) => challenge.id === world.transfer.challenge) || null;
  }

  function transferComplete() {
    const challenge = activeTransferChallenge();
    return Boolean(challenge
      && world.transfer.state === challenge.stateAnswer
      && world.transfer.reader === challenge.readerAnswer);
  }

  function fullLessonComplete() {
    return Boolean(world.completed && predictionsComplete() && diagnosisComplete() && transferComplete());
  }

  function recordTimeline(label, text) {
    world.timeline.push({
      label,
      text
    });

    if (world.timeline.length > 8) {
      world.timeline = world.timeline.slice(-8);
    }

    renderTimeline();
  }

  function rectsOverlapCircle(rect, circle) {
    const closestX = clamp(circle.x, rect.x, rect.x + rect.w);
    const closestY = clamp(circle.y, rect.y, rect.y + rect.h);
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    return dx * dx + dy * dy <= circle.r * circle.r;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setToast(message) {
    dom.toast.textContent = message;
    world.toastTimer = 190;
  }

  function addCoachMessage(message, role = "coach") {
    const node = document.createElement("div");
    node.className = `coach-message ${role === "student" ? "student" : ""}`;
    node.textContent = message;
    dom.coachLog.appendChild(node);
    dom.coachLog.scrollTop = dom.coachLog.scrollHeight;
  }

  function setWorldState(key, value) {
    if (world.state[key] === value) {
      return;
    }

    world.previousState[key] = world.state[key];
    world.state[key] = value;
    world.changed.add(key);
    window.setTimeout(() => {
      world.changed.delete(key);
      renderStatePanel();
    }, 1200);
    renderStatePanel();
  }

  function resetPlayer() {
    world.player.x = world.start.x;
    world.player.y = world.start.y;
  }

  function resetLab() {
    world.player.x = world.start.x;
    world.player.y = world.start.y;
    world.key.collected = false;
    world.state.hasKey = false;
    world.state.doorOpen = false;
    world.state.hp = 3;
    world.previousState.hasKey = false;
    world.previousState.doorOpen = false;
    world.previousState.hp = 3;
    world.changed.clear();
    world.phase = "observeDoor";
    world.observedDoor = false;
    world.observedBug = false;
    world.dangerTested = false;
    world.completed = false;
    world.evidenceSaved = false;
    world.activeSlot = null;
    world.recommended = null;
    world.predictions = {};
    world.diagnosis = {};
    world.transfer = { challenge: null, state: null, reader: null };
    world.timeline = [
      { label: "开始", text: "hasKey false，doorOpen false，hp 3。先观察门为什么不开。" }
    ];
    rules[0].slots = { event: null, condition: null, action: null };
    rules[1].slots = { event: "touch_door", condition: "has_key_false", action: "open_door" };
    rules[2].slots = { event: null, condition: null, action: null };
    rules.forEach((rule) => {
      rule.triggered = false;
      rule.recent = false;
    });
    dom.reflectionInput.value = "";
    dom.saveFeedback.textContent = "证据卡会保存在这个浏览器里。";
    setToast("先移动到右侧门口，观察门为什么不开。");
    addCoachMessage("这次先不急着拼规则。请先碰一下门，观察 doorOpen 有没有变化。");
    renderAll();
  }

  function renderStatePanel() {
    const rows = [
      { key: "hasKey", label: "hasKey", hint: "是否已经拿到钥匙" },
      { key: "doorOpen", label: "doorOpen", hint: "门是否已经打开" },
      { key: "hp", label: "hp", hint: "碰到危险后的生命值" }
    ];

    dom.stateList.innerHTML = rows.map((row) => {
      const value = world.state[row.key];
      const changed = world.changed.has(row.key) ? " is-changed" : "";
      const previous = world.previousState[row.key];
      const display = world.changed.has(row.key) ? `${previous} -> ${value}` : String(value);
      return `
        <div class="state-row${changed}">
          <div class="state-name">
            <strong>${row.label}</strong>
            <span>${row.hint}</span>
          </div>
          <div class="state-value">${display}</div>
        </div>
      `;
    }).join("");
  }

  function renderLessonFlow() {
    const status = {
      observe: world.observedDoor,
      predict: predictionsComplete(),
      rules: allRequiredReady() && world.state.hasKey && world.state.doorOpen && world.dangerTested,
      debug: world.observedBug && ruleCorrect(rules[1]),
      transfer: transferComplete(),
      evidence: fullLessonComplete() && Boolean(loadEvidence())
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

  function renderPredictions() {
    const correctCount = predictionQuestions.filter((question) => world.predictions[question.id] === question.answer).length;
    dom.predictionState.textContent = `${correctCount} / ${predictionQuestions.length}`;

    dom.predictionList.innerHTML = predictionQuestions.map((question) => {
      const selected = world.predictions[question.id] || "";
      const answered = Boolean(selected);
      const correct = selected === question.answer;
      const itemClass = answered ? (correct ? " is-correct" : " is-wrong") : "";
      const options = question.options.map((option) => {
        const selectedClass = selected === option.id ? " is-selected" : "";
        const correctness = selected === option.id ? (correct ? " is-correct" : " is-wrong") : "";
        return `
          <button class="exercise-option${selectedClass}${correctness}" type="button" data-prediction="${question.id}" data-answer="${option.id}">
            ${option.label}
          </button>
        `;
      }).join("");
      const feedback = answered ? `<p class="exercise-feedback">${correct ? question.feedback : "再想想：先看状态面板，哪一个值会被规则改变？"}</p>` : "";

      return `
        <div class="exercise-item${itemClass}">
          <strong>${question.prompt}</strong>
          <div class="exercise-options">${options}</div>
          ${feedback}
        </div>
      `;
    }).join("");
  }

  function renderTimeline() {
    if (!dom.timelineList) {
      return;
    }

    dom.timelineList.innerHTML = world.timeline.map((item, index) => {
      const latest = index === world.timeline.length - 1 ? " is-latest" : "";
      return `
        <div class="timeline-item${latest}">
          <span>${item.label}</span>
          <p>${item.text}</p>
        </div>
      `;
    }).join("");
  }

  function renderDiagnosis() {
    const correctCount = diagnosisExercises.filter((exercise) => world.diagnosis[exercise.id] === exercise.answer).length;
    dom.diagnosisState.textContent = `${correctCount} / ${diagnosisExercises.length}`;

    dom.diagnosisList.innerHTML = diagnosisExercises.map((exercise) => {
      const selected = world.diagnosis[exercise.id] || "";
      const answered = Boolean(selected);
      const correct = selected === exercise.answer;
      const itemClass = answered ? (correct ? " is-correct" : " is-wrong") : "";
      const options = diagnosisOptions.map((option) => {
        const selectedClass = selected === option.id ? " is-selected" : "";
        const correctness = selected === option.id ? (correct ? " is-correct" : " is-wrong") : "";
        return `
          <button class="exercise-option${selectedClass}${correctness}" type="button" data-diagnosis="${exercise.id}" data-answer="${option.id}">
            ${option.label}
          </button>
        `;
      }).join("");
      const feedback = answered ? `<p class="exercise-feedback">${correct ? exercise.feedback : "再看这条规则：现象和哪一段不匹配？"}</p>` : "";

      return `
        <div class="exercise-item${itemClass}">
          <strong>${exercise.question}</strong>
          <p class="exercise-feedback">${exercise.rule}</p>
          <div class="exercise-options">${options}</div>
          ${feedback}
        </div>
      `;
    }).join("");
  }

  function renderTransfer() {
    const challenge = activeTransferChallenge();
    dom.transferState.textContent = transferComplete() ? "已完成" : "未完成";

    dom.transferOptions.innerHTML = transferChallenges.map((item) => {
      const selected = world.transfer.challenge === item.id ? " is-selected" : "";
      return `
        <button class="transfer-option${selected}" type="button" data-transfer="${item.id}">
          ${item.title}
        </button>
      `;
    }).join("");

    if (!challenge) {
      dom.transferDetail.innerHTML = `
        <div class="transfer-scenario">
          <h3>选择一个迁移主题</h3>
          <p>目标不是背钥匙和门，而是认出“先改变状态，后面的规则读取状态”。</p>
        </div>
      `;
      return;
    }

    dom.transferDetail.innerHTML = `
      <div class="transfer-scenario">
        <h3>${challenge.title}</h3>
        <p>${challenge.setup}</p>
      </div>
      ${renderTransferQuestion("state", "哪个状态负责记住第一件事？", challenge.stateOptions, challenge.stateAnswer)}
      ${renderTransferQuestion("reader", "后面哪条规则会读取这个状态？", challenge.readerOptions, challenge.readerAnswer)}
    `;
  }

  function renderTransferQuestion(type, prompt, options, answer) {
    const selected = world.transfer[type] || "";
    const buttons = options.map((option) => {
      const selectedClass = selected === option ? " is-selected" : "";
      const correctness = selected === option ? (option === answer ? " is-correct" : " is-wrong") : "";
      return `
        <button class="transfer-answer${selectedClass}${correctness}" type="button" data-transfer-answer="${type}" data-answer="${option}">
          ${option}
        </button>
      `;
    }).join("");

    return `
      <div class="transfer-question">
        <strong>${prompt}</strong>
        <div class="transfer-answer-grid">${buttons}</div>
      </div>
    `;
  }

  function renderRules() {
    const readyCount = rules.filter(ruleReady).length;
    dom.assembledCount.textContent = `${readyCount} / 3 已就绪`;

    dom.ruleList.innerHTML = rules.map((rule) => {
      const isActive = world.activeSlot && world.activeSlot.ruleId === rule.id ? " is-active" : "";
      const isTriggered = rule.recent ? " is-triggered" : "";
      const isBug = rule.id === "doorRule" && world.observedBug && !ruleCorrect(rule) ? " is-bug" : "";
      const status = rule.recent
        ? "刚触发"
        : rule.triggered
          ? "已触发"
          : ruleReady(rule)
            ? "已就绪"
            : "待拼装";

      return `
        <div class="rule-item${isActive}${isTriggered}${isBug}" data-rule-id="${rule.id}">
          <div class="rule-top">
            <strong>${rule.title}</strong>
            <span class="rule-status">${status}</span>
          </div>
          <div class="rule-slots">
            ${renderSlot(rule, "event", "当")}
            ${renderSlot(rule, "condition", "如果")}
            ${renderSlot(rule, "action", "就")}
          </div>
          ${renderInlineCardPicker(rule)}
        </div>
      `;
    }).join("");
  }

  function renderSlot(rule, slot, label) {
    const selected = world.activeSlot && world.activeSlot.ruleId === rule.id && world.activeSlot.slot === slot ? " is-selected" : "";
    const recommended = world.recommended && world.recommended.ruleId === rule.id && world.recommended.slot === slot ? " is-next" : "";
    return `
      <button class="slot-btn${selected}${recommended}" type="button" data-rule="${rule.id}" data-slot="${slot}">
        <span>${label}</span>
        <strong>${cardLabel(slot, rule.slots[slot])}</strong>
      </button>
    `;
  }

  function renderInlineCardPicker(rule) {
    if (!world.activeSlot || world.activeSlot.ruleId !== rule.id) {
      return "";
    }

    const slot = world.activeSlot.slot;
    const slotLabel = slotName(slot);
    const options = cards[slot].map((card) => {
      const recommended = world.recommended && world.recommended.slot === slot && world.recommended.cardId === card.id ? " is-next" : "";
      const current = rule.slots[slot] === card.id ? " is-current" : "";
      return `
        <button class="inline-card-option${card.distractor ? " is-distractor" : ""}${recommended}${current}" type="button" data-inline-card="${card.id}">
          ${card.label}
        </button>
      `;
    }).join("");

    return `
      <div class="inline-picker">
        <div>
          <strong>给“${slotLabel}”选择一张卡</strong>
          <span>${slot === "condition" ? "先看状态面板，再选条件。" : "选一张能描述小关行为的卡。"}</span>
        </div>
        <div class="inline-card-grid">${options}</div>
      </div>
    `;
  }

  function renderCardDeck() {
    if (!world.activeSlot) {
      dom.deckTitle.textContent = "选择一个规则槽";
      dom.deckHint.textContent = "点击规则里的“当 / 如果 / 就”槽，再选择一张卡片。";
      dom.cardDeck.innerHTML = `<div class="deck-note">候选卡会展开在当前规则下面。</div>`;
      return;
    }

    const rule = rules.find((item) => item.id === world.activeSlot.ruleId);
    const slot = world.activeSlot.slot;
    const slotLabel = slot === "event" ? "当" : slot === "condition" ? "如果" : "就";
    dom.deckTitle.textContent = `${rule.title} · 选择“${slotLabel}”`;
    dom.deckHint.textContent = slot === "condition"
      ? "这里有干扰项。先看状态面板，再决定规则应该检查什么。"
      : "选择能描述当前小关行为的卡片。";
    dom.cardDeck.innerHTML = `<div class="deck-note">候选卡已展开在这条规则下面，请直接点那里的卡片。</div>`;
  }

  function firstWrongOrEmptySlot(rule) {
    const order = ["event", "condition", "action"];
    return order.find((slot) => rule.slots[slot] !== rule.expected[slot]) || null;
  }

  function nextRecommendation() {
    const keySlot = firstWrongOrEmptySlot(rules[0]);
    const doorSlot = firstWrongOrEmptySlot(rules[1]);
    const dangerSlot = firstWrongOrEmptySlot(rules[2]);

    if (!world.observedDoor) {
      return {
        text: "先移动角色去碰右侧的门，观察 doorOpen 还是 false。",
        toast: "方向键或 WASD 移动到右侧门口。",
        slot: null
      };
    }

    if (keySlot) {
      return {
        text: `让 hasKey 变 true：先补规则 1 的“${slotName(keySlot)}”，选择“${cardLabel(keySlot, rules[0].expected[keySlot])}”。`,
        toast: "要让 hasKey 变 true，先把规则 1 拼完整。",
        ruleId: "keyRule",
        slot: keySlot,
        cardId: rules[0].expected[keySlot]
      };
    }

    if (!world.state.hasKey) {
      return {
        text: "规则 1 已就绪。现在移动角色去碰钥匙，hasKey 就会变成 true。",
        toast: "去碰左上方的钥匙，观察 hasKey 从 false 变成 true。",
        slot: null
      };
    }

    if (!world.observedBug) {
      return {
        text: "hasKey 已经是 true。现在去碰门，触发“拿了钥匙门还不开”的 debug 节点。",
        toast: "去碰门，观察门规则条件为什么不对。",
        slot: null
      };
    }

    if (doorSlot) {
      return {
        text: `修复门规则：把规则 2 的“${slotName(doorSlot)}”改成“${cardLabel(doorSlot, rules[1].expected[doorSlot])}”。`,
        toast: "门规则要检查 hasKey 是 true。",
        ruleId: "doorRule",
        slot: doorSlot,
        cardId: rules[1].expected[doorSlot]
      };
    }

    if (!world.state.doorOpen) {
      return {
        text: "门规则已修好。现在去碰门，让 doorOpen 变成 true。",
        toast: "去碰门，观察 doorOpen 从 false 变成 true。",
        slot: null
      };
    }

    if (dangerSlot) {
      return {
        text: `补规则 3 的“${slotName(dangerSlot)}”，选择“${cardLabel(dangerSlot, rules[2].expected[dangerSlot])}”。`,
        toast: "完成危险地砖规则，再去碰一下危险地砖。",
        ruleId: "dangerRule",
        slot: dangerSlot,
        cardId: rules[2].expected[dangerSlot]
      };
    }

    if (!world.dangerTested) {
      return {
        text: "危险规则已就绪。现在碰一下危险地砖，观察 hp 变化。",
        toast: "去碰危险地砖，hp 会减少并回到安全点。",
        slot: null
      };
    }

    return {
      text: "最后走到打开的门口，生成状态规则证据卡。",
      toast: "走到打开的门口完成小关。",
      slot: null
    };
  }

  function slotName(slot) {
    if (slot === "event") return "当";
    if (slot === "condition") return "如果";
    return "就";
  }

  function renderGuide() {
    world.recommended = nextRecommendation();
    dom.nextAction.textContent = world.recommended.text;

    const doorCorrect = ruleCorrect(rules[1]);
    const keyCorrect = ruleCorrect(rules[0]);
    const dangerCorrect = ruleCorrect(rules[2]);

    if (world.completed) {
      dom.status.textContent = "已通关";
      dom.guide.textContent = fullLessonComplete()
        ? "所有练习已完成。填写一句复盘，然后保存状态规则证据卡。"
        : "小关已通关。继续完成预测、修错和迁移练习，再保存证据卡。";
      return;
    }

    if (!world.observedDoor) {
      dom.status.textContent = "先碰门观察";
      dom.guide.textContent = "先不要拼规则。移动到门口，确认 doorOpen 没有变化。";
      return;
    }

    if (!keyCorrect || !world.state.hasKey) {
      dom.status.textContent = "拼钥匙规则";
      dom.guide.textContent = "拼出规则 1：碰到钥匙，并且钥匙未拿走，就获得钥匙。运行后观察 hasKey。";
      return;
    }

    if (!world.observedBug) {
      dom.status.textContent = "触发门规则 bug";
      dom.guide.textContent = "现在 hasKey 已经是 true。再碰门，观察为什么门还是不开。";
      return;
    }

    if (!doorCorrect || !world.state.doorOpen) {
      dom.status.textContent = "修复门规则";
      dom.guide.textContent = "对照状态面板：hasKey 是 true，所以门规则的“如果”也应该检查 true。";
      return;
    }

    if (!dangerCorrect || !world.dangerTested) {
      dom.status.textContent = "完成危险规则";
      dom.guide.textContent = "拼出规则 3 并碰一下危险地砖，让 hp 变化一次。";
      return;
    }

    dom.status.textContent = "准备生成证据";
    dom.guide.textContent = "你已经完成状态链路。走到打开的门口，生成证据卡。";
  }

  function renderEvidence() {
    const saved = loadEvidence();
    const canGenerate = fullLessonComplete() || saved;
    dom.evidenceState.textContent = saved ? "已保存" : canGenerate ? "可保存" : "未完成";
    dom.evidenceState.classList.toggle("is-saved", Boolean(saved));

    if (!canGenerate) {
      dom.evidencePreview.innerHTML = "<p>完成小关、预测、修错诊断和迁移挑战后，这里会生成证据卡。</p>";
      return;
    }

    const evidence = saved || buildEvidence();
    const transfer = evidence.transfer || { title: "迁移挑战", state: "待补充" };
    dom.evidencePreview.innerHTML = `
      <h3>${evidence.title}</h3>
      <p><strong>小关：</strong>${evidence.level}</p>
      <p><strong>状态链路：</strong></p>
      <ol>
        ${evidence.stateChain.map((item) => `<li>${item}</li>`).join("")}
      </ol>
      <p><strong>我修好的 bug：</strong>${evidence.debugRecord.bug}</p>
      <p><strong>原因：</strong>${evidence.debugRecord.cause}</p>
      <p><strong>修复：</strong>${evidence.debugRecord.fix}</p>
      <p><strong>迁移挑战：</strong>${transfer.title}，状态是 ${transfer.state}。</p>
      <p><strong>复盘：</strong>${evidence.reflection}</p>
    `;

    if (!dom.reflectionInput.value.trim()) {
      dom.reflectionInput.value = evidence.reflection;
    }
  }

  function renderAll() {
    renderGuide();
    renderLessonFlow();
    renderPredictions();
    renderStatePanel();
    renderTimeline();
    renderRules();
    renderCardDeck();
    renderDiagnosis();
    renderTransfer();
    renderEvidence();
  }

  function focusNextStep() {
    const rec = world.recommended || nextRecommendation();
    setToast(rec.toast || rec.text);

    if (!rec.slot) {
      return;
    }

    world.activeSlot = {
      ruleId: rec.ruleId,
      slot: rec.slot
    };
    renderAll();
  }

  function chooseCard(cardId) {
    if (!world.activeSlot) {
      return;
    }

    const rule = rules.find((item) => item.id === world.activeSlot.ruleId);
    if (rule.id === "doorRule" && world.activeSlot.slot === "condition" && cardId === "has_key_true" && !world.observedBug) {
      addCoachMessage("先拿到钥匙后再碰门，观察门为什么没开。看到 bug 以后再把条件改成 hasKey 是 true。");
      setToast("先触发门规则 bug，再修复条件。");
      return;
    }

    rule.slots[world.activeSlot.slot] = cardId;
    rule.recent = false;
    addCoachMessage(`我选择了：${cardLabel(world.activeSlot.slot, cardId)}`, "student");
    renderAll();
  }

  function conditionPass(condition) {
    if (condition === "key_not_collected") {
      return !world.key.collected;
    }
    if (condition === "has_key_true") {
      return world.state.hasKey === true;
    }
    if (condition === "has_key_false") {
      return world.state.hasKey === false;
    }
    if (condition === "hp_gt_zero") {
      return world.state.hp > 0;
    }
    if (condition === "score_gt_ten") {
      return false;
    }
    return false;
  }

  function applyAction(action, eventType, rule) {
    if (action === "take_key" && eventType === "touch_key") {
      world.key.collected = true;
      setWorldState("hasKey", true);
      recordTimeline("拿钥匙", "hasKey 从 false 变成 true。游戏记住了“我拿过钥匙”。");
      triggerRule(rule);
      setToast("hasKey 从 false 变成 true。游戏记住你拿过钥匙了。");
      addCoachMessage("很好，现在看状态面板：hasKey 已经变成 true。下一步用门规则读取这个状态。");
      return true;
    }

    if (action === "open_door" && eventType === "touch_door") {
      setWorldState("doorOpen", true);
      recordTimeline("开门", "门规则读取 hasKey true，于是 doorOpen 从 false 变成 true。");
      triggerRule(rule);
      setToast("doorOpen 变成 true。门已经打开。");
      addCoachMessage("门打开了。你刚刚修好的是：后面的规则会读取前面的状态。");
      return true;
    }

    if (action === "hurt_player" && eventType === "touch_danger") {
      const previousHp = world.state.hp;
      setWorldState("hp", Math.max(0, world.state.hp - 1));
      recordTimeline("危险", `碰到危险地砖，hp 从 ${previousHp} 变成 ${world.state.hp}。`);
      world.dangerTested = true;
      resetPlayer();
      triggerRule(rule);
      setToast("hp 变化了，玩家回到安全点。危险地砖也是一种状态变化。");
      addCoachMessage("现在你有 3 条规则都能触发了。走到打开的门口完成小关。");
      return true;
    }

    return false;
  }

  function triggerRule(rule) {
    rule.triggered = true;
    rule.recent = true;
    window.setTimeout(() => {
      rule.recent = false;
      renderRules();
    }, 900);
  }

  function evaluateRules(eventType) {
    const matchingRules = rules.filter((rule) => ruleReady(rule) && rule.slots.event === eventType);

    for (const rule of matchingRules) {
      if (conditionPass(rule.slots.condition)) {
        const applied = applyAction(rule.slots.action, eventType, rule);
        if (applied) {
          renderAll();
          return true;
        }
      }
    }

    return false;
  }

  function handleCollision(eventType) {
    if (world.lastCollision === eventType) {
      return;
    }
    world.lastCollision = eventType;

    if (eventType === "touch_door" && !world.state.hasKey) {
      if (!world.observedDoor) {
        world.observedDoor = true;
        recordTimeline("观察", "没有钥匙时碰门，doorOpen 仍然是 false。");
        setToast("观察成功：doorOpen 还是 false。门需要读取 hasKey。");
        addCoachMessage("你已经看到问题了：没有钥匙时门不开。现在请拼出钥匙规则，让 hasKey 变成 true。");
        renderAll();
      } else {
        setToast("还没有钥匙。门不会打开，请先修好钥匙规则。");
      }
      return;
    }

    if (eventType === "touch_door" && world.state.hasKey && !world.state.doorOpen && !world.observedBug) {
      world.observedBug = true;
      recordTimeline("发现 bug", "hasKey 已经 true，但门还是不开。需要检查门规则的“如果”。");
      setToast("Debug 节点：hasKey 已经 true，但门仍然不开。检查门规则的“如果”。");
      addCoachMessage("你已经看到 hasKey 是 true。门规则却还没触发，看看它现在检查的是 true 还是 false？");
      renderAll();
      return;
    }

    const applied = evaluateRules(eventType);

    if (eventType === "touch_door" && world.state.doorOpen && world.dangerTested && allRequiredReady()) {
      completeLevel();
      return;
    }

    if (!applied && eventType === "touch_door" && world.state.hasKey && !world.state.doorOpen) {
      setToast("门规则还没触发。对照状态面板，检查“如果”条件。");
      addCoachMessage("hasKey 已经是 true，但门没有开。请把门规则的条件改成 hasKey 是 true。");
      renderAll();
      return;
    }

    if (!applied && eventType === "touch_key") {
      setToast("钥匙还没有触发规则。检查规则 1 的三张卡片。");
    }

    if (!applied && eventType === "touch_danger") {
      setToast("危险地砖还没有触发规则。检查规则 3 的三张卡片。");
    }
  }

  function clearCollisionWhenAway() {
    const touchingKey = !world.key.collected && rectsOverlapCircle(world.key, world.player);
    const touchingDoor = rectsOverlapCircle(world.door, world.player);
    const touchingDanger = rectsOverlapCircle(world.danger, world.player);
    if (!touchingKey && !touchingDoor && !touchingDanger) {
      world.lastCollision = null;
    }
  }

  function updatePlayer() {
    const keySet = new Set([...world.keys, ...world.touchKeys]);
    let dx = 0;
    let dy = 0;
    if (keySet.has("ArrowLeft") || keySet.has("a")) dx -= 1;
    if (keySet.has("ArrowRight") || keySet.has("d")) dx += 1;
    if (keySet.has("ArrowUp") || keySet.has("w")) dy -= 1;
    if (keySet.has("ArrowDown") || keySet.has("s")) dy += 1;

    if (dx !== 0 || dy !== 0) {
      const length = Math.hypot(dx, dy) || 1;
      world.player.x += (dx / length) * world.player.speed;
      world.player.y += (dy / length) * world.player.speed;
    }

    world.player.x = clamp(world.player.x, 46, world.width - 46);
    world.player.y = clamp(world.player.y, 76, world.height - 46);

    if (!world.key.collected && rectsOverlapCircle(world.key, world.player)) {
      handleCollision("touch_key");
    } else if (rectsOverlapCircle(world.door, world.player)) {
      handleCollision("touch_door");
    } else if (rectsOverlapCircle(world.danger, world.player)) {
      handleCollision("touch_danger");
    } else {
      clearCollisionWhenAway();
    }
  }

  function completeLevel() {
    if (world.completed) {
      return;
    }
    world.completed = true;
    recordTimeline("完成", "三条规则都能触发：钥匙改变状态，门读取状态，危险改变 hp。");
    setToast("通关完成。现在保存状态规则证据卡。");
    addCoachMessage("你完成了钥匙门机关房。请用一句话说明：为什么拿钥匙会影响开门？");
    renderAll();
    dom.evidencePanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function buildEvidence() {
    const reflection = dom.reflectionInput.value.trim()
      || "游戏用 hasKey 记住我拿过钥匙，所以门规则会根据这个状态打开。";
    const challenge = activeTransferChallenge() || transferChallenges[0];

    return {
      courseId: "L1-08",
      status: "ready-for-agent",
      completed: Boolean(world.completed),
      savedAt: new Date().toISOString(),
      title: "状态规则证据卡",
      level: "钥匙门机关房",
      rules: rules.map((rule) => ({
        id: rule.id,
        title: rule.title,
        event: cardLabel("event", rule.slots.event),
        condition: cardLabel("condition", rule.slots.condition),
        action: cardLabel("action", rule.slots.action),
        triggered: rule.triggered
      })),
      stateChain: [
        "碰到钥匙 -> hasKey 从 false 变成 true",
        "hasKey 是 true -> 碰到门后 doorOpen 变成 true",
        "碰到危险地砖 -> hp 减少，并回到安全点"
      ],
      predictions: predictionQuestions.map((question) => ({
        prompt: question.prompt,
        answer: question.options.find((option) => option.id === world.predictions[question.id])?.label || ""
      })),
      diagnosis: diagnosisExercises.map((exercise) => ({
        rule: exercise.rule,
        answer: diagnosisOptions.find((option) => option.id === world.diagnosis[exercise.id])?.label || ""
      })),
      transfer: {
        title: challenge.title,
        setup: challenge.setup,
        state: world.transfer.state || "",
        reader: world.transfer.reader || ""
      },
      timeline: world.timeline.slice(),
      debugRecord: {
        bug: "拿到钥匙后门还是不开。",
        cause: "门规则的条件写成了 hasKey 是 false。",
        fix: "把条件改成 hasKey 是 true。"
      },
      reflection
    };
  }

  function saveEvidence(event) {
    event.preventDefault();

    if (!fullLessonComplete()) {
      dom.saveFeedback.textContent = "先完成小关、预测、修错诊断和迁移挑战，再保存证据卡。";
      return;
    }

    const evidence = buildEvidence();
    window.localStorage.setItem(storageKey, JSON.stringify(evidence));
    world.evidenceSaved = true;
    dom.saveFeedback.textContent = "已保存。成长报告页可以读取这张证据卡。";
    renderEvidence();
  }

  function loadEvidence() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function drawRoom() {
    ctx.clearRect(0, 0, world.width, world.height);

    ctx.fillStyle = "#e9f1ec";
    ctx.fillRect(0, 0, world.width, world.height);
    ctx.strokeStyle = "#b9c8c3";
    ctx.lineWidth = 4;
    ctx.strokeRect(34, 54, world.width - 68, world.height - 88);

    drawGrid();
    drawDanger();
    drawDoor();
    drawKey();
    drawPlayer();
    drawLegend();
  }

  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = "rgba(58, 76, 87, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 48; x < world.width - 40; x += 44) {
      ctx.beginPath();
      ctx.moveTo(x, 58);
      ctx.lineTo(x, world.height - 36);
      ctx.stroke();
    }
    for (let y = 72; y < world.height - 34; y += 44) {
      ctx.beginPath();
      ctx.moveTo(36, y);
      ctx.lineTo(world.width - 36, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawKey() {
    if (world.key.collected) {
      return;
    }
    const { x, y, w, h } = world.key;
    ctx.save();
    ctx.fillStyle = "#f5c84b";
    ctx.strokeStyle = "#8b6b18";
    ctx.lineWidth = 3;
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#4b3b11";
    ctx.font = "700 16px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("KEY", x + w / 2, y + h / 2 + 6);
    ctx.restore();
  }

  function drawDoor() {
    const { x, y, w, h } = world.door;
    ctx.save();
    ctx.fillStyle = world.state.doorOpen ? "#2f8f63" : "#40606f";
    ctx.strokeStyle = world.state.doorOpen ? "#1f6847" : "#263b45";
    ctx.lineWidth = 4;
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(world.state.doorOpen ? "OPEN" : "DOOR", x + w / 2, y + h / 2 + 5);
    ctx.restore();
  }

  function drawDanger() {
    const { x, y, w, h } = world.danger;
    ctx.save();
    ctx.fillStyle = "#f6d8d6";
    ctx.strokeStyle = "#d45b55";
    ctx.lineWidth = 3;
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#8d312c";
    ctx.font = "800 15px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("危险地砖", x + w / 2, y + h / 2 + 5);
    ctx.restore();
  }

  function drawPlayer() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(world.player.x, world.player.y, world.player.r, 0, Math.PI * 2);
    ctx.fillStyle = "#2f73d9";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 15px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("我", world.player.x, world.player.y + 6);
    ctx.restore();
  }

  function drawLegend() {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    roundRect(ctx, 54, 74, 288, 62, 8);
    ctx.fill();
    ctx.fillStyle = "#17202a";
    ctx.font = "800 16px system-ui";
    ctx.fillText("目标：拿钥匙 -> 修门规则 -> 测危险 -> 通关", 72, 100);
    ctx.fillStyle = "#596575";
    ctx.font = "700 13px system-ui";
    ctx.fillText("方向键或 WASD 移动", 72, 122);
    ctx.restore();
  }

  function roundRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r);
    context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    context.lineTo(x + r, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
  }

  function loop() {
    updatePlayer();
    drawRoom();
    if (world.toastTimer > 0) {
      world.toastTimer -= 1;
    }
    window.requestAnimationFrame(loop);
  }

  function bindEvents() {
    window.addEventListener("keydown", (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(key)) {
        event.preventDefault();
        world.keys.add(key);
      }
    });

    window.addEventListener("keyup", (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      world.keys.delete(key);
    });

    document.querySelectorAll("[data-move]").forEach((button) => {
      const key = button.dataset.move;
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        world.touchKeys.add(key);
        button.setPointerCapture(event.pointerId);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
        button.addEventListener(eventName, () => {
          world.touchKeys.delete(key);
        });
      });
    });

    dom.ruleList.addEventListener("click", (event) => {
      const inlineCard = event.target.closest("[data-inline-card]");
      if (inlineCard) {
        chooseCard(inlineCard.dataset.inlineCard);
        return;
      }

      const slot = event.target.closest("[data-slot]");
      if (!slot) {
        return;
      }
      world.activeSlot = {
        ruleId: slot.dataset.rule,
        slot: slot.dataset.slot
      };
      renderAll();
    });

    dom.predictionList.addEventListener("click", (event) => {
      const option = event.target.closest("[data-prediction]");
      if (!option) {
        return;
      }
      world.predictions[option.dataset.prediction] = option.dataset.answer;
      renderAll();
    });

    dom.diagnosisList.addEventListener("click", (event) => {
      const option = event.target.closest("[data-diagnosis]");
      if (!option) {
        return;
      }
      world.diagnosis[option.dataset.diagnosis] = option.dataset.answer;
      renderAll();
    });

    dom.transferOptions.addEventListener("click", (event) => {
      const option = event.target.closest("[data-transfer]");
      if (!option) {
        return;
      }
      world.transfer = {
        challenge: option.dataset.transfer,
        state: null,
        reader: null
      };
      renderAll();
    });

    dom.transferDetail.addEventListener("click", (event) => {
      const option = event.target.closest("[data-transfer-answer]");
      if (!option) {
        return;
      }
      world.transfer[option.dataset.transferAnswer] = option.dataset.answer;
      renderAll();
    });

    dom.cardDeck.addEventListener("click", (event) => {
      const card = event.target.closest("[data-card]");
      if (!card) {
        return;
      }
      chooseCard(card.dataset.card);
    });

    document.querySelectorAll("[data-coach]").forEach((button) => {
      button.addEventListener("click", () => {
        addCoachMessage(coachReply(button.dataset.coach));
      });
    });

    dom.reset.addEventListener("click", resetLab);
    dom.focusNext.addEventListener("click", focusNextStep);
    dom.reflectionForm.addEventListener("submit", saveEvidence);
  }

  function coachReply(type) {
    if (type === "observe") {
      return "先让角色碰门。观察 doorOpen 没变，这说明门需要一个读取状态的规则。";
    }
    if (type === "state") {
      return "hasKey 是游戏记忆。false 表示还没拿钥匙，true 表示游戏已经记住你拿过钥匙。";
    }
    if (type === "debug") {
      return world.observedBug
        ? "你已经看到 hasKey 是 true。门规则的“如果”也应该检查 true，不然它不会触发。"
        : "debug 前先制造现象：拿到钥匙后再碰门，看看规则和状态是否对得上。";
    }
    return "请用一句话说明：为什么拿钥匙以后，碰门的结果会改变？";
  }

  function init() {
    world.timeline = [
      { label: "开始", text: "hasKey false，doorOpen false，hp 3。先观察门为什么不开。" }
    ];
    addCoachMessage("欢迎来到 L1-08。第一步不是改规则，而是先碰门，观察游戏现在记住了什么。");
    bindEvents();
    renderAll();
    setToast("先移动到右侧门口，观察门为什么不开。");
    window.requestAnimationFrame(loop);
  }

  init();
})();
