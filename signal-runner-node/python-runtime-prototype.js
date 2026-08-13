(function () {
  "use strict";

  const presets = {
    success: [
      "move()",
      "move()",
      "if is_hazard_ahead():",
      "    shield()",
      "move()",
      "move()",
      "collect()"
    ].join("\n"),
    syntax: [
      "move()",
      "if is_hazard_ahead()",
      "    shield()",
      "move()"
    ].join("\n"),
    loop: [
      "while not at_beacon():",
      "    turn_left()"
    ].join("\n"),
    overshoot: [
      "move()",
      "move()",
      "if is_hazard_ahead():",
      "    shield()",
      "move()",
      "move()",
      "collect()",
      "move()"
    ].join("\n"),
    sidefall: [
      "turn_left()",
      "move()"
    ].join("\n")
  };

  const dom = {
    runtimeBadge: document.querySelector("#runtimeBadge"),
    runtimeBadgeText: document.querySelector("#runtimeBadgeText"),
    canvas: document.querySelector("#prototypeCanvas"),
    worldStatus: document.querySelector("#worldStatus"),
    worldCallout: document.querySelector("#worldCallout"),
    position: document.querySelector("#positionValue"),
    energy: document.querySelector("#energyValue"),
    shield: document.querySelector("#shieldValue"),
    beacon: document.querySelector("#beaconValue"),
    runState: document.querySelector("#runState"),
    presetButtons: [...document.querySelectorAll("[data-preset]")],
    editor: document.querySelector("#pythonEditor"),
    editorFrame: document.querySelector("#editorFrame"),
    lineNumbers: document.querySelector("#lineNumbers"),
    lineHighlight: document.querySelector("#editorLineHighlight"),
    runButton: document.querySelector("#runButton"),
    stepButton: document.querySelector("#stepButton"),
    stopButton: document.querySelector("#stopButton"),
    resetButton: document.querySelector("#resetButton"),
    feedbackKind: document.querySelector("#feedbackKind"),
    feedbackMessage: document.querySelector("#feedbackMessage"),
    log: document.querySelector("#executionLog"),
    checks: new Map([...document.querySelectorAll("[data-check]")].map((item) => [item.dataset.check, item]))
  };

  const INITIAL_ENERGY = 8;
  const HAZARD_POSITION = 3;
  const BEACON_POSITION = 4;
  const API_CALL_LIMIT = 16;
  const ANIMATION_MS = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 20 : 420;

  let displayState = createInitialState();
  let plannedEvents = [];
  let playbackIndex = 0;
  let currentSource = "";
  let currentStudentLine = 1;
  let playbackToken = 0;
  let isPlaying = false;
  let scene = null;
  let pythonRuntime = null;
  let pendingPlaybackError = null;

  function createInitialState() {
    return {
      position: 0,
      direction: 0,
      energy: INITIAL_ENERGY,
      shieldActive: false,
      collected: false
    };
  }

  function cloneState(state) {
    return { ...state };
  }

  function initializeScene() {
    if (!window.THREE) throw new Error("3D 资源没有加载成功。");

    const renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x9bdcff, 1);

    const world = new THREE.Scene();
    world.fog = new THREE.Fog(0x9bdcff, 11, 23);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    camera.position.set(5.5, 7.6, 10.8);
    camera.lookAt(2.1, 0, 0);

    world.add(new THREE.HemisphereLight(0xe8f8ff, 0x34416b, 2.15));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(-4, 9, 7);
    sun.castShadow = true;
    world.add(sun);

    const bridge = new THREE.Group();
    const tileMeshes = [];
    for (let index = 0; index <= BEACON_POSITION; index += 1) {
      const isHazard = index === HAZARD_POSITION;
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 0.56, 1.65),
        new THREE.MeshStandardMaterial({
          color: isHazard ? 0xe7574f : index === BEACON_POSITION ? 0xf1ad35 : 0xeda45a,
          roughness: 0.82,
          metalness: 0.05
        })
      );
      tile.position.set(index * 1.72, 0, 0);
      tile.castShadow = true;
      tile.receiveShadow = true;
      bridge.add(tile);
      tileMeshes.push(tile);

      const grass = new THREE.Mesh(
        new THREE.BoxGeometry(1.48, 0.09, 1.48),
        new THREE.MeshStandardMaterial({ color: isHazard ? 0xff746c : 0x61a957, roughness: 0.9 })
      );
      grass.position.set(index * 1.72, 0.325, 0);
      grass.receiveShadow = true;
      bridge.add(grass);
    }
    bridge.position.x = -3.45;
    world.add(bridge);

    const hazardRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.43, 0.1, 12, 28),
      new THREE.MeshStandardMaterial({ color: 0xffe1de, emissive: 0xff4538, emissiveIntensity: 1.4 })
    );
    hazardRing.rotation.x = Math.PI / 2;
    hazardRing.position.set((HAZARD_POSITION * 1.72) - 3.45, 0.57, 0);
    world.add(hazardRing);

    const beacon = new THREE.Group();
    const beaconBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.52, 0.48, 18),
      new THREE.MeshStandardMaterial({ color: 0x143c88, roughness: 0.35, metalness: 0.5 })
    );
    beaconBase.castShadow = true;
    beacon.add(beaconBase);
    const beaconLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 18, 14),
      new THREE.MeshStandardMaterial({ color: 0xfff0a3, emissive: 0xffb327, emissiveIntensity: 2.1 })
    );
    beaconLight.position.y = 0.54;
    beacon.add(beaconLight);
    beacon.position.set((BEACON_POSITION * 1.72) - 3.45, 0.66, -0.38);
    world.add(beacon);

    const agent = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.28, 0.48, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x176ee8, roughness: 0.4, metalness: 0.25 })
    );
    body.position.y = 0.64;
    body.castShadow = true;
    agent.add(body);
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.18, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xa7efff, emissive: 0x42cfff, emissiveIntensity: 0.8 })
    );
    visor.position.set(0.23, 0.77, 0);
    agent.add(visor);
    const shield = new THREE.Mesh(
      new THREE.SphereGeometry(0.68, 24, 18),
      new THREE.MeshBasicMaterial({ color: 0x71e5ff, transparent: true, opacity: 0.24, wireframe: true })
    );
    shield.position.y = 0.58;
    shield.visible = false;
    agent.add(shield);
    world.add(agent);

    const cloudGeometry = new THREE.DodecahedronGeometry(1.1, 0);
    for (const [x, y, z, scale] of [[-5.5, 2.8, -4.5, 0.7], [7, 3.7, -5, 0.9], [0, 4.8, -7, 0.55]]) {
      const cloud = new THREE.Mesh(
        cloudGeometry,
        new THREE.MeshStandardMaterial({ color: 0xe9f7ff, transparent: true, opacity: 0.68, roughness: 1 })
      );
      cloud.position.set(x, y, z);
      cloud.scale.setScalar(scale);
      world.add(cloud);
    }

    function resize() {
      const rect = dom.canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      if (dom.canvas.width !== Math.round(width * renderer.getPixelRatio()) || dom.canvas.height !== Math.round(height * renderer.getPixelRatio())) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    }

    function render(time) {
      resize();
      beacon.rotation.y = time * 0.0007;
      hazardRing.rotation.z = time * 0.001;
      renderer.render(world, camera);
      window.requestAnimationFrame(render);
    }

    scene = { renderer, world, camera, agent, shield, beacon, tileMeshes };
    placeAgent(displayState, true);
    window.requestAnimationFrame(render);
  }

  function placeAgent(state, immediate) {
    if (!scene) return Promise.resolve();
    const targetX = (state.position * 1.72) - 3.45;
    const startX = scene.agent.position.x;
    const startTime = performance.now();
    scene.agent.rotation.y = -state.direction * (Math.PI / 2);
    scene.shield.visible = state.shieldActive;
    scene.beacon.visible = !state.collected;

    if (immediate || ANIMATION_MS <= 20) {
      scene.agent.visible = true;
      scene.agent.scale.setScalar(1);
      scene.agent.rotation.x = 0;
      scene.agent.rotation.z = 0;
      scene.agent.position.set(targetX, 0.33, 0);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      function tick(now) {
        const progress = Math.min(1, (now - startTime) / ANIMATION_MS);
        const eased = 1 - Math.pow(1 - progress, 4);
        scene.agent.position.set(startX + ((targetX - startX) * eased), 0.33 + (Math.sin(progress * Math.PI) * 0.18), 0);
        if (progress < 1) window.requestAnimationFrame(tick);
        else resolve();
      }
      window.requestAnimationFrame(tick);
    });
  }

  function playFall(event) {
    if (!scene) return Promise.resolve();
    const vectors = [
      { x: 1.75, z: 0 },
      { x: 0, z: 1.75 },
      { x: -1.75, z: 0 },
      { x: 0, z: -1.75 }
    ];
    const vector = vectors[Number(event.fallDirection) || 0];
    const start = scene.agent.position.clone();
    const duration = ANIMATION_MS <= 20 ? 20 : 520;
    const startTime = performance.now();
    scene.shield.visible = false;

    return new Promise((resolve) => {
      function tick(now) {
        const progress = Math.min(1, (now - startTime) / duration);
        const horizontal = 1 - Math.pow(1 - progress, 3);
        const drop = progress * progress;
        scene.agent.position.set(
          start.x + (vector.x * horizontal),
          start.y + (0.28 * Math.sin(progress * Math.PI)) - (3.4 * drop),
          start.z + (vector.z * horizontal)
        );
        scene.agent.rotation.z = progress * 1.2;
        scene.agent.rotation.x = progress * 0.45;
        if (progress < 1) window.requestAnimationFrame(tick);
        else resolve();
      }
      window.requestAnimationFrame(tick);
    });
  }

  async function playHazardFailure() {
    if (!scene) return;
    await placeAgent(displayState, false);
    if (ANIMATION_MS <= 20) {
      scene.agent.position.y = -0.1;
      scene.agent.scale.setScalar(0.78);
      return;
    }

    const startTime = performance.now();
    await new Promise((resolve) => {
      function tick(now) {
        const progress = Math.min(1, (now - startTime) / 360);
        const eased = 1 - Math.pow(1 - progress, 4);
        scene.agent.position.y = 0.33 - (0.43 * eased);
        scene.agent.rotation.z = eased * 0.24;
        scene.agent.scale.setScalar(1 - (eased * 0.22));
        if (progress < 1) window.requestAnimationFrame(tick);
        else resolve();
      }
      window.requestAnimationFrame(tick);
    });
  }

  function updateHud() {
    dom.position.textContent = `${displayState.position} / ${BEACON_POSITION}`;
    dom.energy.textContent = String(displayState.energy);
    dom.shield.textContent = displayState.shieldActive ? "开启" : "关闭";
    dom.beacon.textContent = displayState.collected ? "已采集" : "未采集";
  }

  function updateLineNumbers() {
    const count = Math.max(1, dom.editor.value.split("\n").length);
    dom.lineNumbers.innerHTML = Array.from({ length: count }, (_, index) => `<span>${index + 1}</span>`).join("");
    syncEditorScroll();
  }

  function syncEditorScroll() {
    dom.lineNumbers.style.transform = `translateY(${-dom.editor.scrollTop}px)`;
    if (!dom.lineHighlight.hidden) {
      const lineHeight = 26;
      dom.lineHighlight.style.top = `${18 + ((currentStudentLine - 1) * lineHeight) - dom.editor.scrollTop}px`;
    }
  }

  function highlightLine(line) {
    currentStudentLine = Math.max(1, Number(line) || 1);
    dom.lineHighlight.hidden = false;
    syncEditorScroll();
    [...dom.lineNumbers.children].forEach((item, index) => item.classList.toggle("is-active", index + 1 === currentStudentLine));
  }

  function clearLineHighlight() {
    dom.lineHighlight.hidden = true;
    [...dom.lineNumbers.children].forEach((item) => item.classList.remove("is-active"));
  }

  function setFeedback(kind, title, message) {
    dom.feedbackKind.textContent = title;
    dom.feedbackMessage.textContent = message;
    dom.feedbackMessage.dataset.kind = kind;
  }

  function setRuntimeBadge(state, text) {
    dom.runtimeBadge.dataset.state = state;
    dom.runtimeBadgeText.textContent = text;
  }

  function markCheck(name) {
    const item = dom.checks.get(name);
    if (item) item.classList.add("is-passed");
  }

  function appendLog(message) {
    const item = document.createElement("li");
    item.textContent = message;
    dom.log.append(item);
    dom.log.scrollTop = dom.log.scrollHeight;
  }

  function resetWorld(options = {}) {
    playbackToken += 1;
    isPlaying = false;
    plannedEvents = [];
    playbackIndex = 0;
    pendingPlaybackError = null;
    displayState = createInitialState();
    dom.stopButton.disabled = true;
    dom.runButton.disabled = false;
    dom.stepButton.disabled = false;
    dom.worldStatus.textContent = "等待运行";
    dom.worldCallout.textContent = options.keepFeedback ? "世界已经复位，可以重新运行。" : "运行 Python 后，探测员会从这里出发。";
    dom.runState.textContent = "尚未运行";
    dom.log.innerHTML = "";
    clearLineHighlight();
    updateHud();
    placeAgent(displayState, true);
    if (!options.keepFeedback) setFeedback("normal", "等待代码", "选择一个预设或直接修改代码，然后运行。");
  }

  async function compileStudentProgram() {
    if (!pythonRuntime) throw CodeQuestPythonRuntime.createStudentError("Python 运行器没有加载成功。", 1, "runtime");
    const source = dom.editor.value;
    currentSource = source;
    plannedEvents = [];
    playbackIndex = 0;
    clearLineHighlight();
    dom.log.innerHTML = "";
    try {
      const result = await pythonRuntime.compile(source);
      plannedEvents = result.events;
      markCheck("python");
      return plannedEvents;
    } catch (error) {
      plannedEvents = Array.isArray(error.partialEvents) ? error.partialEvents : [];
      throw error;
    }
  }

  function showExecutionError(error, afterPlayback) {
    const line = Number(error.studentLine) || 1;
    const category = error.category === "syntax" ? "语法错误" : "运行错误";
    const message = CodeQuestPythonRuntime.friendlyErrorMessage(error);
    highlightLine(line);
    setFeedback("error", `${category} · 第 ${line} 行`, message);
    dom.runState.textContent = "已安全停止";
    if (!afterPlayback) {
      dom.worldStatus.textContent = "没有执行";
      dom.worldCallout.textContent = `代码在第 ${line} 行停止，左侧世界没有开始行动。`;
    } else if (plannedEvents.at(-1)?.type === "fall") {
      dom.worldStatus.textContent = "跌出通道";
      dom.worldCallout.textContent = `程序运行到第 ${line} 行，探测员跌出通道后停止。`;
    } else if (plannedEvents.at(-1)?.type === "hazard-fail") {
      dom.worldStatus.textContent = "危险格停止";
      dom.worldCallout.textContent = `程序运行到第 ${line} 行，探测员在危险格停止。`;
    } else {
      dom.worldStatus.textContent = "停在错误步骤";
      dom.worldCallout.textContent = `程序已经回放到第 ${line} 行，并停在第一次无法继续的位置。`;
    }
    appendLog(`第 ${line} 行停止：${message}`);
    markCheck("line");
    if (/循环|while|运行时间|执行太多次/.test(message)) markCheck("loop");
  }

  async function preparePlayback() {
    resetWorld({ keepFeedback: true });
    dom.runState.textContent = "正在检查";
    setFeedback("normal", "Python 运行器", "正在解析学生源代码……");
    try {
      const events = await compileStudentProgram();
      if (!events.length) throw CodeQuestPythonRuntime.createStudentError("代码可以运行，但没有产生任何游戏动作。", 1, "runtime");
      setFeedback("normal", "代码已通过检查", `Python 生成了 ${events.length} 个可回放事件，准备驱动左侧世界。`);
      dom.runState.textContent = "准备执行";
      return true;
    } catch (error) {
      if (plannedEvents.length) {
        pendingPlaybackError = error;
        const line = Number(error.studentLine) || 1;
        setFeedback("normal", `发现运行错误 · 第 ${line} 行`, "语法是成立的。现在先执行错误前的步骤，再在真正出错的位置停下。 ");
        dom.runState.textContent = "准备回放错误程序";
        return true;
      }
      showExecutionError(error, false);
      return false;
    }
  }

  async function applyEvent(event) {
    highlightLine(event.line);
    displayState = cloneState(event.state);
    appendLog(event.message);
    dom.worldCallout.textContent = event.message;
    dom.worldStatus.textContent = event.type === "condition" ? "正在判断" : event.type === "fall" ? "越界" : event.type === "hazard-fail" ? "危险" : "正在行动";
    if (event.type === "fall") await playFall(event);
    else if (event.type === "hazard-fail") await playHazardFailure();
    else await placeAgent(displayState, event.type === "condition" || event.type === "turn");
    updateHud();
    if (event.type !== "condition") markCheck("world");
  }

  async function finishPlayback() {
    isPlaying = false;
    dom.stopButton.disabled = true;
    dom.runButton.disabled = false;
    dom.stepButton.disabled = false;
    if (pendingPlaybackError) {
      const error = pendingPlaybackError;
      pendingPlaybackError = null;
      showExecutionError(error, true);
      return;
    }
    if (displayState.collected) {
      dom.runState.textContent = "验证通过";
      dom.worldStatus.textContent = "信标已采集";
      dom.worldCallout.textContent = "学生写的 Python 已经真正驱动 3D 世界完成任务。";
      setFeedback("success", "运行成功", "Python 语法、条件判断、游戏动作和 3D 回放已经连通。再试试其他错误预设。 ");
      markCheck("python");
      markCheck("world");
    } else {
      dom.runState.textContent = "运行结束";
      dom.worldStatus.textContent = "任务未完成";
      setFeedback("error", "任务逻辑错误", "代码运行结束了，但还没有采集信标。请检查路线和条件。 ");
    }
  }

  async function runAll() {
    const ready = await preparePlayback();
    if (!ready) return;
    const token = ++playbackToken;
    isPlaying = true;
    dom.stopButton.disabled = false;
    dom.runButton.disabled = true;
    dom.stepButton.disabled = true;
    dom.runState.textContent = "正在运行";

    while (playbackIndex < plannedEvents.length && token === playbackToken) {
      await applyEvent(plannedEvents[playbackIndex]);
      playbackIndex += 1;
      if (ANIMATION_MS > 20) await new Promise((resolve) => window.setTimeout(resolve, 120));
    }
    if (token === playbackToken) await finishPlayback();
  }

  async function runStep() {
    if (currentSource !== dom.editor.value || !plannedEvents.length || playbackIndex >= plannedEvents.length) {
      const ready = await preparePlayback();
      if (!ready) return;
    }
    dom.runState.textContent = "单步执行";
    dom.worldStatus.textContent = "单步";
    await applyEvent(plannedEvents[playbackIndex]);
    playbackIndex += 1;
    if (playbackIndex >= plannedEvents.length) await finishPlayback();
  }

  function stopPlayback() {
    playbackToken += 1;
    isPlaying = false;
    dom.stopButton.disabled = true;
    dom.runButton.disabled = false;
    dom.stepButton.disabled = false;
    dom.runState.textContent = "学生已停止";
    dom.worldStatus.textContent = "暂停";
    setFeedback("normal", "已经停止", "运行已停止；可以修改代码后重新开始。 ");
  }

  function choosePreset(name) {
    if (!presets[name]) return;
    if (isPlaying) stopPlayback();
    dom.editor.value = presets[name];
    dom.presetButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.preset === name));
    updateLineNumbers();
    resetWorld();
    try {
      localStorage.setItem("codeQuest.pythonRuntimePrototype", name);
    } catch (error) {
      // Local preview is allowed to continue when storage is unavailable.
    }
  }

  function initialize() {
    try {
      initializeScene();
      if (!window.Sk) throw new Error("Python 运行器没有加载成功。");
      if (!window.CodeQuestPythonRuntime) throw new Error("课程运行核心没有加载成功。");
      pythonRuntime = CodeQuestPythonRuntime.create({
        Sk,
        initialEnergy: INITIAL_ENERGY,
        hazardPosition: HAZARD_POSITION,
        beaconPosition: BEACON_POSITION,
        apiCallLimit: API_CALL_LIMIT
      });
      setRuntimeBadge("ready", "离线 Python 已就绪");
    } catch (error) {
      setRuntimeBadge("error", "运行器加载失败");
      setFeedback("error", "初始化错误", error.message);
    }

    dom.presetButtons.forEach((button) => button.addEventListener("click", () => choosePreset(button.dataset.preset)));
    dom.runButton.addEventListener("click", runAll);
    dom.stepButton.addEventListener("click", runStep);
    dom.stopButton.addEventListener("click", stopPlayback);
    dom.resetButton.addEventListener("click", () => resetWorld());
    dom.editor.addEventListener("input", () => {
      currentSource = "";
      updateLineNumbers();
      dom.presetButtons.forEach((button) => button.classList.remove("is-active"));
    });
    dom.editor.addEventListener("scroll", syncEditorScroll);
    dom.editor.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        const start = dom.editor.selectionStart;
        const end = dom.editor.selectionEnd;
        dom.editor.setRangeText("    ", start, end, "end");
        dom.editor.dispatchEvent(new Event("input"));
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        runAll();
      }
    });

    let initialPreset = "success";
    try {
      const saved = localStorage.getItem("codeQuest.pythonRuntimePrototype");
      if (presets[saved]) initialPreset = saved;
    } catch (error) {
      // Use the success preset when storage is unavailable.
    }
    choosePreset(initialPreset);
  }

  initialize();
})();
