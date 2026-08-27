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
  const pythonLessonStoragePrefix = "signalRunnerNode.python.";
  const cloudCourseId = "signal-runner";
  const progressApi = "/api/progress";
  const canvas = document.querySelector("#gameCanvas");
  const scene3d = safeCreateThreeScene(canvas);
  const ctx = scene3d.ok ? null : canvas.getContext("2d");

  const dom = {
    appKicker: document.querySelector("#appKicker"),
    pageTitle: document.querySelector("#pageTitle"),
    courseHome: document.querySelector("#courseHomeBtn"),
    courseHomeLabel: document.querySelector("#courseHomeLabel"),
    lessonPager: document.querySelector("#lessonPager"),
    prevLesson: document.querySelector("#prevLessonBtn"),
    nextLesson: document.querySelector("#nextLessonBtn"),
    trackSwitch: document.querySelector("#trackSwitch"),
    courseBreadcrumb: document.querySelector("#courseBreadcrumb"),
    courseBrowser: document.querySelector("#courseBrowser"),
    workspace: document.querySelector(".workspace"),
    nodeProgress: document.querySelector("#nodeProgress"),
    progressSync: document.querySelector("#progressSync"),
    resetProgress: document.querySelector("#resetProgressBtn"),
    portalProgress: document.querySelector(".expedition-summary"),
    portalProgressPercent: document.querySelector("#portalProgressPercent"),
    portalProgressCount: document.querySelector("#portalProgressCount"),
    portalNextMission: document.querySelector("#portalNextMission"),
    portalContinue: document.querySelector("#portalContinueBtn"),
    missionList: document.querySelector("#missionList"),
    missionBrief: document.querySelector("#missionBrief"),
    standardMissionBrief: document.querySelector("#standardMissionBrief"),
    sequenceLessonBrief: document.querySelector("#sequenceLessonBrief"),
    directionLessonBrief: document.querySelector("#directionLessonBrief"),
    routeLessonBrief: document.querySelector("#routeLessonBrief"),
    playgroundLessonBrief: document.querySelector("#playgroundLessonBrief"),
    sequenceTimelinePanel: document.querySelector("#sequenceTimelinePanel"),
    sequenceTimeline: document.querySelector("#sequenceTimeline"),
    sequenceTimelineState: document.querySelector("#sequenceTimelineState"),
    directionLearningPanel: document.querySelector("#directionLearningPanel"),
    directionLearningState: document.querySelector("#directionLearningState"),
    directionCompass: document.querySelector("#directionCompass"),
    directionCompassValue: document.querySelector("#directionCompassValue"),
    directionChangeRows: document.querySelector("#directionChangeRows"),
    routeComparisonPanel: document.querySelector("#routeComparisonPanel"),
    routeSelectionState: document.querySelector("#routeSelectionState"),
    routeChoiceList: document.querySelector("#routeChoiceList"),
    coordinateLessonBrief: document.querySelector("#coordinateLessonBrief"),
    segmentLessonBrief: document.querySelector("#segmentLessonBrief"),
    creatorLessonBrief: document.querySelector("#creatorLessonBrief"),
    capstoneLessonBrief: document.querySelector("#capstoneLessonBrief"),
    advancedLessonBrief: document.querySelector("#advancedLessonBrief"),
    advancedChallenge: document.querySelector("#advancedChallenge"),
    advancedBriefIntro: document.querySelector("#advancedBriefIntro"),
    advancedBriefBullets: document.querySelector("#advancedBriefBullets"),
    advancedBriefGoal: document.querySelector("#advancedBriefGoal"),
    coordinateScannerPanel: document.querySelector("#coordinateScannerPanel"),
    coordinateScannerState: document.querySelector("#coordinateScannerState"),
    coordinateCurrentValue: document.querySelector("#coordinateCurrentValue"),
    coordinateArchive: document.querySelector("#coordinateArchive"),
    segmentMissionPanel: document.querySelector("#segmentMissionPanel"),
    segmentMissionState: document.querySelector("#segmentMissionState"),
    carryingState: document.querySelector("#carryingState"),
    segmentMissionSteps: document.querySelector("#segmentMissionSteps"),
    creatorWorkbenchPanel: document.querySelector("#creatorWorkbenchPanel"),
    creatorValidationState: document.querySelector("#creatorValidationState"),
    creatorMapEditor: document.querySelector("#creatorMapEditor"),
    creatorTargetOptions: document.querySelector("#creatorTargetOptions"),
    creatorLimitOptions: document.querySelector("#creatorLimitOptions"),
    creatorValidationList: document.querySelector("#creatorValidationList"),
    capstoneProfilePanel: document.querySelector("#capstoneProfilePanel"),
    capstoneProfileState: document.querySelector("#capstoneProfileState"),
    capstoneProfileGates: document.querySelector("#capstoneProfileGates"),
    advancedLearningPanel: document.querySelector("#advancedLearningPanel"),
    advancedToolTitle: document.querySelector("#advancedToolTitle"),
    advancedToolState: document.querySelector("#advancedToolState"),
    advancedLearningContent: document.querySelector("#advancedLearningContent"),
    advancedEvidenceSave: document.querySelector("#advancedEvidenceSave"),
    advancedEvidenceName: document.querySelector("#advancedEvidenceName"),
    advancedEvidenceState: document.querySelector("#advancedEvidenceState"),
    detectiveGuidePanel: document.querySelector("#detectiveGuidePanel"),
    missionConcept: document.querySelector("#missionConcept"),
    missionTarget: document.querySelector("#missionTarget"),
    lessonCheckpoint: document.querySelector("#lessonCheckpoint"),
    stateHud: document.querySelector("#stateHud"),
    canvasShell: document.querySelector(".canvas-shell"),
    runBanner: document.querySelector("#runBanner"),
    worldState: document.querySelector("#worldState"),
    worldBeaconCounter: document.querySelector("#worldBeaconCounter"),
    worldRun: document.querySelector("#worldRunBtn"),
    worldHint: document.querySelector("#worldHintBtn"),
    worldFailureIndicator: document.querySelector("#worldFailureIndicator"),
    worldFailureTitle: document.querySelector("#worldFailureTitle"),
    worldFailureDetail: document.querySelector("#worldFailureDetail"),
    runState: document.querySelector("#runState"),
    runLog: document.querySelector("#runLog"),
    operationPanel: document.querySelector("#operationPanel"),
    standardLogPanel: document.querySelector("#standardLogPanel"),
    pythonLessonStudio: document.querySelector("#pythonLessonStudio"),
    pythonStudioKicker: document.querySelector("#pythonStudioKicker"),
    pythonStudioTitle: document.querySelector("#pythonStudioTitle"),
    pythonTaskBadge: document.querySelector("#pythonTaskBadge"),
    pythonTaskText: document.querySelector("#pythonTaskText"),
    pythonTemplateEyebrow: document.querySelector("#pythonTemplateEyebrow"),
    pythonTemplateTitle: document.querySelector("#pythonTemplateTitle"),
    pythonTemplateList: document.querySelector("#pythonTemplateList"),
    pythonTranslationHelp: document.querySelector("#pythonTranslationHelp"),
    pythonSaveState: document.querySelector("#pythonSaveState"),
    pythonEditor: document.querySelector("#pythonEditor"),
    pythonEditorFrame: document.querySelector("#pythonEditorFrame"),
    pythonEditTarget: document.querySelector("#pythonEditTarget"),
    pythonLineNumbers: document.querySelector("#pythonLineNumbers"),
    pythonLineHighlight: document.querySelector("#pythonEditorLineHighlight"),
    pythonLineState: document.querySelector("#pythonLineState"),
    pythonRunBtn: document.querySelector("#pythonRunBtn"),
    pythonStepBtn: document.querySelector("#pythonStepBtn"),
    pythonStopBtn: document.querySelector("#pythonStopBtn"),
    pythonResetBtn: document.querySelector("#pythonResetBtn"),
    pythonFeedbackKind: document.querySelector("#pythonFeedbackKind"),
    pythonFeedbackMessage: document.querySelector("#pythonFeedbackMessage"),
    pythonExecutionLog: document.querySelector("#pythonExecutionLog"),
    pythonStatePanel: document.querySelector("#pythonStatePanel"),
    pythonStateTitle: document.querySelector("#pythonStateTitle"),
    pythonStateDescription: document.querySelector("#pythonStateDescription"),
    pythonStateList: document.querySelector("#pythonStateList"),
    pythonEvidenceRow: document.querySelector("#pythonEvidenceRow"),
    pythonEvidenceState: document.querySelector("#pythonEvidenceState"),
    runBtn: document.querySelector("#runBtn"),
    stepBtn: document.querySelector("#stepBtn"),
    resetBtn: document.querySelector("#resetBtn"),
    undoBtn: document.querySelector("#undoBtn"),
    clearBtn: document.querySelector("#clearBtn"),
    loadReference: document.querySelector("#loadReferenceBtn"),
    commandLimit: document.querySelector("#commandLimit"),
    paletteInstruction: document.querySelector("#paletteInstruction"),
    commandPalette: document.querySelector("#commandPalette"),
    programTabs: document.querySelector("#programTabs"),
    programList: document.querySelector("#programList"),
    programTitle: document.querySelector("#programTitle"),
    activeBoardHint: document.querySelector("#activeBoardHint"),
    codeView: document.querySelector("#codeView"),
    evidenceKicker: document.querySelector("#evidenceKicker"),
    evidenceTitle: document.querySelector("#evidenceTitle"),
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
    back: {
      label: "back()",
      name: "后退",
      hint: "保持朝向后退一格",
      kind: "basic",
      code: "back();"
    },
    wait: {
      label: "wait()",
      name: "等待",
      hint: "原地等待一个时刻",
      kind: "basic",
      code: "wait();"
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
    ifSensorAct: {
      label: "if sensor",
      name: "传感器判断",
      hint: "按实验台条件处理前方格",
      kind: "logic",
      code: "if (scanAhead() === sensorTarget) act();"
    },
    logicGuard: {
      label: "safeGuard()",
      name: "安全守卫",
      hint: "组合多个布尔条件决定前进或转向",
      kind: "logic",
      code: "if (clear && enoughEnergy && !hazard) move(); else turnRight();"
    },
    whileBeacon: {
      label: "while not beacon",
      name: "走到信标",
      hint: "没有到达信标就继续移动",
      kind: "logic",
      code: "while (!onBeacon()) move();"
    },
    whileRelay: {
      label: "while not relay",
      name: "走到中继站",
      hint: "没有到达中继站就继续移动",
      kind: "logic",
      code: "while (!onRelay()) move();"
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
    repeat4: {
      label: "repeat(4)",
      name: "循环 4 次",
      hint: "连续执行四次 move",
      kind: "logic",
      code: "repeat(4) { move(); }"
    },
    repeat5: {
      label: "repeat(5)",
      name: "循环 5 次",
      hint: "连续执行五次 move",
      kind: "logic",
      code: "repeat(5) { move(); }"
    },
    callRoute: {
      label: "routeA()",
      name: "调用函数",
      hint: "执行 routeA 里的指令",
      kind: "logic",
      code: "routeA();"
    }
  };

  const demoMissions = [
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

  const courseCatalog = window.SignalRunnerCourseData || {
    version: "fallback",
    stages: [
      {
        id: "stage-1",
        number: 1,
        range: "1-2",
        title: "基础动作与路线规划",
        ability: "顺序、方向、采集、上传",
        work: "基础采集任务包"
      }
    ],
    missions: [
      {
        id: "course-01-launch-task",
        stage: "stage-1",
        stageTitle: "基础动作与路线规划",
        lessonNo: 1,
        lessonType: "learning",
        typeLabel: "学习",
        title: "启动任务",
        concept: "顺序 · 采集 · 上传",
        lesson: "第 01 节",
        story: "第一节正式课从读懂地图开始：先看起点、信标和中继站，再把路线拆成一条会被按顺序执行的程序。",
        target: "完成核心路线：到达信标、采集、回到中继站上传。",
        focus: "读懂地图目标，并把目标拆成程序步骤",
        checkpoint: "学生要能说明为什么必须先移动到信标格再 collect()，再到中继站 upload()。",
        artifact: "第一张任务卡",
        knowledge: ["地图", "角色", "运行", "顺序", "采集", "上传"],
        devNote: "备用课程数据，正常情况下由 course-data.js 提供 48 节课程。",
        commonMistakes: ["空采集", "提前上传"],
        grid: ["_________", "_SgBgRgg_", "_ggggggg_", "_________"],
        startDir: "E",
        energy: 14,
        required: 1,
        limit: 8,
        allowed: ["move", "collect", "upload"],
        solution: ["move", "move", "collect", "move", "move", "upload"]
      }
    ]
  };
  // Keep later course data intact while only exposing the classroom-ready range.
  // Raise this single limit when the next course segment is ready to reopen.
  const visibleCourseLessonLimit = 32;
  const courseMissions = (courseCatalog.missions || [])
    .filter((item) => Number(item.lessonNo) <= visibleCourseLessonLimit);
  const visibleCourseStageIds = new Set(courseMissions.map((item) => item.stage));
  const courseStages = (courseCatalog.stages || [])
    .filter((stage) => visibleCourseStageIds.has(stage.id));
  const stageImages = {
    "stage-1": "./assets/maps/stage-01-beacon-departure.webp",
    "stage-2": "./assets/maps/stage-02-energy-rescue.webp",
    "stage-3": "./assets/maps/stage-03-function-toolbox.webp",
    "stage-4": "./assets/maps/stage-04-star-map-data-station.webp",
    "stage-5": "./assets/maps/stage-05-maze-pathfinding.webp",
    "stage-6": "./assets/maps/stage-06-strategy-launch-summit.webp"
  };

  const tracks = {
    course: {
      id: "course",
      label: "正式课程",
      kicker: "沉浸式编程 · v1.4 Code Quest",
      progressLabel: `${courseCatalog.version || "v1.3"} · ${courseMissions.length} 节`,
      evidenceKicker: "标准课作品记录",
      evidenceTitle: "课堂任务卡",
      completeTitle: `CodeQuestPlanet：当前开放 ${courseMissions.length} 节`,
      completeSkill: "观察、规划、编码、调试、讲解和原创关卡设计。",
      completeValidation: `${courseMissions.length} 节课程已经拆成阶段、课次和单课任务，可逐级进入和跳转。`
    },
    demo: {
      id: "demo",
      label: "Demo 节点",
      kicker: "14 岁 · 6 节课作品节点 Demo",
      progressLabel: "保留 6 关 demo",
      evidenceKicker: "作品节点",
      evidenceTitle: "信标无人机作品卡",
      completeTitle: "CodeQuestPlanet：三塔同步无人机",
      completeSkill: "序列、条件判断、循环压缩、函数封装、综合调试。",
      completeValidation: "第 6 关需要采集 3 座信标、处理危险格，并在中继站上传。"
    }
  };

  tracks.course.missions = courseMissions;
  tracks.demo.missions = demoMissions;

  let currentTrackId = "course";
  let currentMissionIndex = 0;
  let courseView = "stages";
  let selectedStageId = courseStages[0]?.id || "stage-1";
  let activeBoard = "main";
  let program = [];
  let routeProgram = [];
  let selectedProgramIndex = null;
  let selectedRouteChoiceId = null;
  let detectiveGuideOpen = false;
  let creatorTargetId = null;
  let creatorLimitMode = "strict";
  let loopCreatorHazardId = null;
  let indentScopeChoice = "move-only";
  let sensorTarget = "hazard";
  let logicConnector = "and";
  let logicHazardMode = "not-hazard";
  const lessonToolChoices = new Map();
  let completed = loadProgress();
  let authUser = null;
  let isLocalPreview = false;
  let pendingMissionIndex = null;
  let progressSyncState = "本机进度";
  let progressSyncHideTimer = null;
  let progressSyncRemoveTimer = null;
  let syncQueue = Promise.resolve();
  let sim = null;
  let runTimer = null;
  let animationFrame = null;
  let celebrationUntil = 0;
  let pythonRuntime = null;
  let pythonInitializedLessonId = null;
  let pythonPlannedEvents = [];
  let pythonFinalState = null;
  let pythonPlaybackIndex = 0;
  let pythonCurrentSource = "";
  let pythonCurrentLine = 1;
  let pythonPlaybackToken = 0;
  let pythonPlaying = false;
  let pythonPendingError = null;
  let pythonSaveTimer = null;
  let pythonUploaded = false;
  let pythonEvidence = {};

  function loadProgress() {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      return new Set();
    }
  }

  function pythonLessonStorageKey(lessonId) {
    return `${pythonLessonStoragePrefix}${lessonId}`;
  }

  function loadPythonEvidence(lessonId) {
    if (!lessonId) return {};
    try {
      const raw = localStorage.getItem(pythonLessonStorageKey(lessonId));
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function savePythonEvidence(patch = {}) {
    const lessonId = pythonInitializedLessonId || (isPythonStudioLesson() ? mission().id : null);
    if (!lessonId) return;
    pythonEvidence = {
      ...pythonEvidence,
      ...patch,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(pythonLessonStorageKey(lessonId), JSON.stringify(pythonEvidence));
    } catch (error) {
      // The editor stays usable when local storage is unavailable.
    }
  }

  function saveLocalProgress() {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...completed]));
    } catch (error) {
      // Progress is a convenience only; the game still works without storage.
    }
  }

  function setProgressSyncState(message) {
    progressSyncState = message;
    if (!dom.progressSync) return;
    dom.progressSync.textContent = message;
    dom.progressSync.classList.remove("is-exiting", "is-hidden");
    dom.progressSync.setAttribute("aria-hidden", "false");
    window.clearTimeout(progressSyncHideTimer);
    window.clearTimeout(progressSyncRemoveTimer);
    progressSyncHideTimer = window.setTimeout(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      dom.progressSync.classList.add("is-exiting");
      progressSyncRemoveTimer = window.setTimeout(() => {
        dom.progressSync.classList.add("is-hidden");
        dom.progressSync.classList.remove("is-exiting");
        dom.progressSync.setAttribute("aria-hidden", "true");
      }, reduceMotion ? 0 : 280);
    }, 3000);
  }

  function updatePortalProgress() {
    if (!dom.portalProgress) return;
    const completedCount = courseMissions.filter((item) => completed.has(item.id)).length;
    const percent = courseMissions.length ? Math.round((completedCount / courseMissions.length) * 100) : 0;
    const nextMission = courseMissions.find((item) => !completed.has(item.id)) || courseMissions.at(-1);

    dom.portalProgress.style.setProperty("--progress", `${percent}%`);
    dom.portalProgressPercent.textContent = `${percent}%`;
    dom.portalProgressCount.textContent = `${completedCount} / ${courseMissions.length}`;
    dom.portalNextMission.textContent = nextMission ? `${nextMission.lesson} · ${nextMission.title}` : "课程即将开放";
    dom.portalContinue.disabled = !nextMission;
    if (nextMission) dom.portalContinue.dataset.lessonId = nextMission.id;
    else delete dom.portalContinue.dataset.lessonId;
  }

  async function requestJson(url, options = {}) {
    const response = await fetch(url, {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error?.message || "请求失败，请稍后再试。");
    }
    return payload;
  }

  function allMissions() {
    return [...courseMissions, ...demoMissions];
  }

  function lessonById(lessonId) {
    return allMissions().find((item) => item.id === lessonId);
  }

  function trackIdForLesson(lessonId) {
    return demoMissions.some((item) => item.id === lessonId) ? "demo" : "course";
  }

  function progressPayload(lessonId) {
    const item = lessonById(lessonId);
    const storedPythonEvidence = item?.pythonStudio ? loadPythonEvidence(lessonId) : null;
    const codeEvidence = storedPythonEvidence?.lastSuccessful
      ? {
          language: "python",
          source: storedPythonEvidence.lastSuccessful,
          attempts: Number(storedPythonEvidence.attempts || 0),
          verifiedAt: storedPythonEvidence.verifiedAt || new Date().toISOString(),
          ...(storedPythonEvidence.lastSuccessfulState
            ? { runtimeState: storedPythonEvidence.lastSuccessfulState }
            : {})
        }
      : null;
    return {
      courseId: cloudCourseId,
      lessonId,
      status: "completed",
      progress: {
        trackId: trackIdForLesson(lessonId),
        title: item?.title || lessonId,
        lesson: item?.lesson || "",
        completedAt: new Date().toISOString(),
        ...(codeEvidence ? { codeEvidence } : {})
      }
    };
  }

  function cloudProgressIds(rows = []) {
    return new Set(
      rows
        .filter((row) => row.status === "completed")
        .map((row) => row.lesson_id || row.lessonId)
        .filter(Boolean)
    );
  }

  async function saveLessonProgress(lessonId) {
    if (!authUser || !lessonId) return;
    await requestJson(progressApi, {
      method: "POST",
      body: JSON.stringify(progressPayload(lessonId))
    });
  }

  function queueLessonSync(lessonId) {
    if (!authUser || !lessonId) {
      setProgressSyncState(authUser ? "云端同步待命" : "本机进度");
      return;
    }

    setProgressSyncState("正在保存云端进度...");
    syncQueue = syncQueue
      .then(() => saveLessonProgress(lessonId))
      .then(() => setProgressSyncState("云端进度已保存"))
      .catch(() => setProgressSyncState("云端保存失败，已保留本机进度"));
  }

  function saveProgress({ lessonId = null, sync = true } = {}) {
    saveLocalProgress();
    if (sync) queueLessonSync(lessonId);
  }

  async function syncProgressFromCloud() {
    if (!authUser) {
      setProgressSyncState("本机进度");
      return;
    }

    setProgressSyncState("正在同步云端进度...");
    try {
      const payload = await requestJson(progressApi);
      const cloudIds = cloudProgressIds(payload.progress);
      const localIds = [...completed];
      let changed = false;

      cloudIds.forEach((lessonId) => {
        if (!completed.has(lessonId)) {
          completed.add(lessonId);
          changed = true;
        }
      });

      const missingCloudIds = localIds.filter((lessonId) => !cloudIds.has(lessonId));
      saveLocalProgress();

      for (const lessonId of missingCloudIds) {
        await saveLessonProgress(lessonId);
      }

      setProgressSyncState("云端进度已同步");
      if (changed || missingCloudIds.length) render();
    } catch (error) {
      setProgressSyncState("云端同步失败，已保留本机进度");
    }
  }

  async function deleteCloudProgress(lessonIds) {
    if (!authUser || !lessonIds.length) return;

    setProgressSyncState("正在重置云端进度...");
    try {
      const payload = await requestJson(progressApi, {
        method: "DELETE",
        body: JSON.stringify({ courseId: cloudCourseId, lessonIds })
      });
      setProgressSyncState(payload.deleted > 0 ? "云端进度已重置" : "云端无对应进度");
    } catch (error) {
      setProgressSyncState("云端重置失败，本机进度已重置");
    }
  }

  function currentTrack() {
    return tracks[currentTrackId];
  }

  function currentMissions() {
    return currentTrack().missions;
  }

  function buildLessonVariantGrid(baseMission, variantIndex) {
    if (!variantIndex) return baseMission.grid;
    const rows = baseMission.grid.map((line) => [...line]);
    let start = { x: 0, y: 0 };
    rows.forEach((line, y) => line.forEach((tile, x) => {
      if (tile === "S") start = { x, y };
    }));
    const expanded = [];
    const expand = (command) => {
      const repeat = String(command).match(/^repeat(\d+)$/);
      if (repeat) {
        for (let index = 0; index < Number(repeat[1]); index += 1) expanded.push("move");
      } else if (command === "callRoute") {
        (baseMission.solutionFn || []).forEach(expand);
      } else {
        expanded.push(command);
      }
    };
    baseMission.solution.forEach(expand);
    let x = start.x;
    let y = start.y;
    let dir = baseMission.startDir;
    const protectedKeys = new Set([tileKey(x, y)]);
    expanded.forEach((command) => {
      if (command === "left") dir = turn(dir, -1);
      if (command === "right") dir = turn(dir, 1);
      if (command === "move") {
        x += vectors[dir].x;
        y += vectors[dir].y;
        protectedKeys.add(tileKey(x, y));
      }
    });
    rows.forEach((line, rowY) => line.forEach((tile, columnX) => {
      if (["S", "B", "R", "H", "#", "_"].includes(tile)) protectedKeys.add(tileKey(columnX, rowY));
    }));
    const candidates = [];
    rows.forEach((line, rowY) => line.forEach((tile, columnX) => {
      if ((tile === "g" || tile === "s") && !protectedKeys.has(tileKey(columnX, rowY))) {
        candidates.push({ x: columnX, y: rowY, rank: (columnX * 7 + rowY * 11 + baseMission.lessonNo * 13) % 31 });
      }
    }));
    candidates.sort((a, b) => a.rank - b.rank);
    candidates.slice(0, variantIndex === 1 ? 2 : 3).forEach((point, index) => {
      rows[point.y][point.x] = variantIndex === 1 || index === 0 ? "#" : "H";
    });
    return rows.map((line) => line.join(""));
  }

  function mission() {
    const baseMission = currentMissions()[currentMissionIndex];
    if (baseMission?.lessonMode === "loop-creator") {
      const template = baseMission.advancedConfig?.loopHazardTemplate;
      const hazards = baseMission.advancedConfig?.loopHazards || [];
      const activeHazard = hazards.find((hazard) => hazard.id === loopCreatorHazardId)
        || hazards.find((hazard) => hazard.id === "middle")
        || hazards[0];
      if (!template || !activeHazard) return baseMission;
      return {
        ...baseMission,
        grid: template.map((line, y) => [...line].map((tile, x) => x === activeHazard.x && y === activeHazard.y ? "H" : tile).join("")),
        solution: activeHazard.solution.slice(),
        loopCreatorActiveHazard: activeHazard
      };
    }

    if (baseMission?.advancedConfig?.kind === "designer") {
      const options = baseMission.advancedConfig.options || [];
      const selected = lessonToolChoices.get(`${baseMission.id}:lesson-choice`) || options[0];
      const variantIndex = Math.max(0, options.indexOf(selected));
      return {
        ...baseMission,
        grid: buildLessonVariantGrid(baseMission, variantIndex),
        lessonVariant: selected
      };
    }

    if (baseMission?.lessonMode !== "route-creator") return baseMission;

    const targets = baseMission.creatorTargets || [];
    const activeTarget = targets.find((target) => target.id === creatorTargetId) || targets[0];
    if (!activeTarget || !baseMission.creatorTemplateGrid) return baseMission;

    const grid = baseMission.creatorTemplateGrid.map((line, y) => [...line].map((tile, x) => {
      if (tile === "B") return "g";
      return x === activeTarget.x && y === activeTarget.y ? "B" : tile;
    }).join(""));
    const strictLimit = activeTarget.solution.length;

    return {
      ...baseMission,
      grid,
      solution: activeTarget.solution.slice(),
      limit: creatorLimitMode === "relaxed" ? strictLimit + 3 : strictLimit,
      creatorActiveTarget: activeTarget,
      creatorLimitMode
    };
  }

  function selectedStage() {
    return courseStages.find((stage) => stage.id === selectedStageId) || courseStages[0];
  }

  function stageForMission(item = mission()) {
    return courseStages.find((stage) => stage.id === item?.stage) || courseStages[0];
  }

  function missionsForStage(stageId = selectedStageId) {
    return courseMissions.filter((item) => item.stage === stageId);
  }

  function missionIndexById(id) {
    return currentMissions().findIndex((item) => item.id === id);
  }

  function isCourseTrack() {
    return currentTrackId === "course";
  }

  function completedInCurrentTrack() {
    return currentMissions().filter((item) => completed.has(item.id)).length;
  }

  function unlockedCount() {
    return currentMissions().length - 1;
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
      relay: null
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

  function initialProgramForMission(activeMission = mission()) {
    return Array.isArray(activeMission.starterProgram)
      ? activeMission.starterProgram.slice()
      : [];
  }

  function hasSelectedProgramStep() {
    return Number.isInteger(selectedProgramIndex)
      && selectedProgramIndex >= 0
      && selectedProgramIndex < currentTargetProgram().length;
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
      activeStepNumber: null,
      failed: false,
      completed: false,
      message: "准备编程",
      logs: keepLog && sim ? sim.logs.slice(0, 4) : ["系统上线：等待运行程序。"],
      path: [{ x: grid.start.x, y: grid.start.y }],
      motion: null,
      failurePose: null,
      failureType: null,
      failureMessage: ""
    };
  }

  function expandProgram() {
    const expanded = [];
    const pushCommand = (command, origin) => {
      const repeatMatch = command.match(/^repeat(\d+)$/);
      if (repeatMatch) {
        const count = Number(repeatMatch[1]);
        for (let index = 0; index < count; index += 1) {
          expanded.push({ id: "move", origin });
        }
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
    const needsStepNumber = Boolean(mission().lessonMode && mission().lessonMode !== "standard");
    const stepPrefix = needsStepNumber && sim.activeStepNumber
      ? `第 ${sim.activeStepNumber} 步 · `
      : "";
    sim.logs.unshift({ message: `${stepPrefix}${message}`, type });
    sim.logs = sim.logs.slice(0, 8);
  }

  function failureMotion(type, overrides = {}) {
    const vector = vectors[sim.dir];
    return {
      type,
      fromX: sim.x,
      fromY: sim.y,
      toX: sim.x,
      toY: sim.y,
      fromDir: sim.dir,
      toDir: sim.dir,
      duration: type === "fall" ? 640 : type === "hazard-fail" ? 560 : type === "collision-fail" ? 360 : 420,
      vector,
      ...overrides
    };
  }

  function fail(message, effect = "action-fail") {
    if (effect !== false) {
      const motion = typeof effect === "string" ? failureMotion(effect) : effect;
      startMotion(motion);
      sim.failureType = motion.type;
    } else {
      sim.failureType = sim.motion?.type || "action-fail";
    }
    sim.failed = true;
    sim.message = "任务失败";
    sim.failureMessage = message;
    log(message, "error");
    stopAutoRun();
  }

  function complete(message) {
    const minimumEnergy = Number(mission().minEnergy || 0);
    if (minimumEnergy && sim.energy < minimumEnergy) {
      fail(`目标已经到达，但只剩 ${sim.energy} 点能量；本关至少需要保留 ${minimumEnergy} 点。`, "power-fail");
      return;
    }
    sim.completed = true;
    sim.message = "任务完成";
    log(message, "success");
    const lessonId = mission().id;
    completed.add(lessonId);
    saveProgress({ lessonId });
    celebrationUntil = performance.now() + 1600;
    stopAutoRun();
  }

  function frontTile() {
    const vector = vectors[sim.dir];
    return { x: sim.x + vector.x, y: sim.y + vector.y };
  }

  function blockingKind(x, y) {
    const isOutside = x < 0
      || y < 0
      || x >= sim.grid.width
      || y >= sim.grid.height;
    if (isOutside || sim.grid.voids.has(tileKey(x, y))) return "void";
    if (sim.grid.walls.has(tileKey(x, y))) return "wall";
    return "clear";
  }

  function isBlocked(x, y) {
    return blockingKind(x, y) !== "clear";
  }

  function failAtBlockedTile(next, wallMessage, voidMessage) {
    const kind = blockingKind(next.x, next.y);
    if (kind === "void") {
      fail(voidMessage, failureMotion("fall", {
        toX: next.x,
        toY: next.y,
        duration: 640
      }));
    } else {
      fail(wallMessage, failureMotion("collision-fail", {
        toX: next.x,
        toY: next.y,
        duration: 360
      }));
    }
  }

  function frontKind() {
    const next = frontTile();
    if (isBlocked(next.x, next.y)) return "blocked";
    if (sim.grid.hazards.has(tileKey(next.x, next.y))) return "hazard";
    return "clear";
  }

  function spendEnergy(amount, reason) {
    sim.energy = Math.max(0, sim.energy - amount);
    if (sim.energy <= 0) {
      fail(`${reason}，能量耗尽。`, "power-fail");
      return false;
    }
    return true;
  }

  function startMotion(details) {
    const now = performance.now();
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const duration = reduceMotion ? 1 : details.duration;
    sim.motion = {
      ...details,
      duration,
      startedAt: now,
      endsAt: now + duration
    };
  }

  function motionIsActive() {
    return Boolean(sim?.motion && performance.now() < sim.motion.endsAt);
  }

  function settleMotion() {
    if (!sim?.motion) return;
    if (["fall", "hazard-fail", "power-fail"].includes(sim.motion.type)) {
      sim.failurePose = {
        x: sim.motion.toX,
        y: sim.motion.toY,
        dir: sim.motion.toDir,
        lift: sim.motion.type === "fall" ? -2.4 : sim.motion.type === "hazard-fail" ? -0.42 : -0.16
      };
    }
    sim.motion = null;
  }

  function scheduleMotionFrames() {
    if (animationFrame || !sim?.motion) return;
    if (!motionIsActive()) {
      settleMotion();
      drawGrid();
      return;
    }

    const tick = () => {
      animationFrame = null;
      if (!sim?.motion) return;

      drawGrid();
      if (motionIsActive()) {
        animationFrame = window.requestAnimationFrame(tick);
      } else {
        settleMotion();
        drawGrid();
      }
    };

    animationFrame = window.requestAnimationFrame(tick);
  }

  function moveForward() {
    const next = frontTile();
    if (isBlocked(next.x, next.y)) {
      failAtBlockedTile(
        next,
        `撞到岩石：当前位置 (${sim.x}, ${sim.y})，朝向${directionLabels[sim.dir]}。`,
        `走出地图：探测员从 (${sim.x}, ${sim.y}) 向${directionLabels[sim.dir]}前进后跌落。`
      );
      return;
    }

    if (!spendEnergy(1, "移动消耗能量")) return;

    const from = { x: sim.x, y: sim.y };
    const hazard = sim.grid.hazards.has(tileKey(next.x, next.y));
    const fatalHazard = hazard && sim.shield <= 0 && sim.energy <= 4;
    startMotion({
      type: fatalHazard ? "hazard-fail" : hazard && sim.shield <= 0 ? "hazard-hit" : "move",
      fromX: from.x,
      fromY: from.y,
      toX: next.x,
      toY: next.y,
      fromDir: sim.dir,
      toDir: sim.dir,
      duration: fatalHazard ? 560 : hazard && sim.shield <= 0 ? 460 : 360
    });
    sim.x = next.x;
    sim.y = next.y;
    sim.path.push({ x: sim.x, y: sim.y });

    if (hazard) {
      if (sim.shield > 0) {
        sim.shield -= 1;
        log("穿过危险格：护盾生效。");
      } else {
        sim.energy = Math.max(0, sim.energy - 4);
        if (sim.energy <= 0) {
          fail("无护盾进入危险格，能量耗尽。", false);
        } else {
          log("无护盾穿过危险格，额外损失 4 点能量。", "error");
        }
      }
    } else {
      log(`前进到 (${sim.x}, ${sim.y})。`);
    }
  }

  function moveBackward() {
    const vector = vectors[sim.dir];
    const next = { x: sim.x - vector.x, y: sim.y - vector.y };
    if (isBlocked(next.x, next.y)) {
      failAtBlockedTile(
        next,
        `后退撞到岩石：当前位置 (${sim.x}, ${sim.y})。`,
        `后退走出地图：探测员从 (${sim.x}, ${sim.y}) 的边缘跌落。`
      );
      return;
    }

    if (!spendEnergy(1, "后退消耗能量")) return;

    const from = { x: sim.x, y: sim.y };
    const hazard = sim.grid.hazards.has(tileKey(next.x, next.y));
    const fatalHazard = hazard && sim.shield <= 0 && sim.energy <= 4;
    startMotion({
      type: fatalHazard ? "hazard-fail" : hazard && sim.shield <= 0 ? "hazard-hit" : "move",
      fromX: from.x,
      fromY: from.y,
      toX: next.x,
      toY: next.y,
      fromDir: sim.dir,
      toDir: sim.dir,
      duration: fatalHazard ? 560 : hazard && sim.shield <= 0 ? 460 : 360
    });
    sim.x = next.x;
    sim.y = next.y;
    sim.path.push({ x: sim.x, y: sim.y });

    if (hazard) {
      if (sim.shield > 0) {
        sim.shield -= 1;
        log("后退穿过危险格：护盾生效。");
      } else {
        sim.energy = Math.max(0, sim.energy - 4);
        if (sim.energy <= 0) {
          fail("无护盾后退进入危险格，能量耗尽。", false);
        } else {
          log("后退进入危险格，额外损失 4 点能量。", "error");
        }
      }
    } else {
      log(`后退到 (${sim.x}, ${sim.y})，朝向保持${directionLabels[sim.dir]}。`);
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
    } else if (id === "back") {
      moveBackward();
    } else if (id === "wait") {
      log(`等待一个时刻：位置 (${sim.x}, ${sim.y})，朝向${directionLabels[sim.dir]}。`);
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
        if (!mission().allowed.includes("upload") && sim.collected.size >= mission().required) {
          complete("采集完成：本关过关。");
        } else {
          log(`采集成功：${sim.collected.size} / ${mission().required}。`, "success");
        }
      } else {
        fail("采集失败：当前位置没有可采集信标。");
      }
    } else if (id === "upload") {
      const onRelay = sim.grid.relay && sim.x === sim.grid.relay.x && sim.y === sim.grid.relay.y;
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
    } else if (id === "ifSensorAct") {
      const kind = frontKind();
      const matches = kind === sensorTarget;
      if (!matches) {
        log(`条件不成立：前方是 ${kind}，不是 ${sensorTarget}。`);
      } else if (kind === "hazard") {
        if (spendEnergy(1, "条件开盾消耗能量")) {
          sim.shield = 1;
          log("条件成立：前方危险，自动开盾。");
        }
      } else if (kind === "blocked") {
        const fromDir = sim.dir;
        sim.dir = turn(sim.dir, 1);
        startMotion({ type: "turn", fromX: sim.x, fromY: sim.y, toX: sim.x, toY: sim.y, fromDir, toDir: sim.dir, duration: 240 });
        log(`条件成立：前方阻挡，右转为${directionLabels[sim.dir]}。`);
      } else {
        log("条件成立：前方可通行，执行前进。");
        moveForward();
      }
    } else if (id === "logicGuard") {
      const kind = frontKind();
      const conditions = [
        kind === "clear",
        sim.energy > 3,
        logicHazardMode === "not-hazard" ? kind !== "hazard" : kind === "hazard"
      ];
      const safe = logicConnector === "and"
        ? conditions.every(Boolean)
        : conditions.some(Boolean);
      if (safe) {
        log(`逻辑守卫为 true：${conditions.map((value) => value ? "T" : "F").join(" · ")}，执行前进。`);
        moveForward();
      } else {
        const fromDir = sim.dir;
        sim.dir = turn(sim.dir, 1);
        startMotion({ type: "turn", fromX: sim.x, fromY: sim.y, toX: sim.x, toY: sim.y, fromDir, toDir: sim.dir, duration: 240 });
        log(`逻辑守卫为 false：${conditions.map((value) => value ? "T" : "F").join(" · ")}，右转为${directionLabels[sim.dir]}。`);
      }
    } else if (id === "whileBeacon" || id === "whileRelay") {
      const isBeaconLoop = id === "whileBeacon";
      const atTarget = () => isBeaconLoop
        ? sim.grid.beacons.has(tileKey(sim.x, sim.y)) && !sim.collected.has(tileKey(sim.x, sim.y))
        : Boolean(sim.grid.relay && sim.x === sim.grid.relay.x && sim.y === sim.grid.relay.y);
      let repetitions = 0;
      const safetyLimit = sim.grid.width * sim.grid.height;
      while (!atTarget() && !sim.failed && repetitions < safetyLimit) {
        if (frontKind() === "blocked") {
          const next = frontTile();
          failAtBlockedTile(
            next,
            `while 撞到岩石：前方被挡住，但还没有到达${isBeaconLoop ? "信标" : "中继站"}。`,
            `while 走出地图：还没有到达${isBeaconLoop ? "信标" : "中继站"}，探测员从边缘跌落。`
          );
          break;
        }
        moveForward();
        repetitions += 1;
      }
      if (!sim.failed && atTarget()) {
        log(`while 条件变为 false：经过 ${repetitions} 次移动，到达${isBeaconLoop ? "信标" : "中继站"}。`, "success");
      } else if (!sim.failed && repetitions >= safetyLimit) {
        fail("while 超过安全执行次数，可能缺少有效停止条件。");
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
    sim.activeStepNumber = sim.queueIndex;
    executeCommand(item.id);
    sim.activeStepNumber = null;

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
    if (!m.allowed.includes(command)) return;
    if (activeBoard === "route" && ["upload", "collect", "callRoute"].includes(command)) return;

    if (hasSelectedProgramStep()) {
      const next = target.slice();
      next[selectedProgramIndex] = command;
      setCurrentTargetProgram(next);
      selectedProgramIndex = null;
    } else {
      if (target.length >= limit) return;
      setCurrentTargetProgram([...target, command]);
    }
    resetSimulation(true);
    render();
  }

  function removeCommand(index) {
    const target = currentTargetProgram();
    setCurrentTargetProgram(target.filter((_, itemIndex) => itemIndex !== index));
    selectedProgramIndex = null;
    resetSimulation(true);
    render();
  }

  function resetCreatorSettings() {
    creatorTargetId = null;
    creatorLimitMode = "strict";
    loopCreatorHazardId = null;
    indentScopeChoice = "move-only";
    sensorTarget = "hazard";
    logicConnector = "and";
    logicHazardMode = "not-hazard";
  }

  function suspendPythonStudio() {
    pythonPlaybackToken += 1;
    pythonPlaying = false;
    pythonPendingError = null;
    pythonFinalState = null;
    pythonUploaded = false;
    window.clearTimeout(pythonSaveTimer);
    if (pythonInitializedLessonId && dom.pythonEditor) {
      savePythonEvidence({ draft: dom.pythonEditor.value });
    }
    pythonInitializedLessonId = null;
    pythonRuntime = null;
  }

  function showStageList() {
    stopAutoRun();
    suspendPythonStudio();
    courseView = "stages";
    activeBoard = "main";
    selectedProgramIndex = null;
    selectedRouteChoiceId = null;
    detectiveGuideOpen = false;
    resetCreatorSettings();
    render();
    window.scrollTo(0, 0);
  }

  function showStage(stageId) {
    if (!courseStages.some((stage) => stage.id === stageId)) return;
    stopAutoRun();
    suspendPythonStudio();
    selectedStageId = stageId;
    courseView = "stage";
    activeBoard = "main";
    selectedProgramIndex = null;
    selectedRouteChoiceId = null;
    detectiveGuideOpen = false;
    resetCreatorSettings();
    render();
    window.scrollTo(0, 0);
  }

  function selectMission(index) {
    if (index < 0 || index >= currentMissions().length) return;
    if (!authUser && !isLocalPreview) {
      pendingMissionIndex = index;
      window.dispatchEvent(new CustomEvent("codequest:auth-required", { detail: { mode: "login" } }));
      return;
    }
    stopAutoRun();
    suspendPythonStudio();
    currentMissionIndex = index;
    resetCreatorSettings();
    if (isCourseTrack()) {
      selectedStageId = stageForMission(mission()).id;
      courseView = "lesson";
    }
    activeBoard = "main";
    program = initialProgramForMission(mission());
    routeProgram = [];
    selectedProgramIndex = null;
    selectedRouteChoiceId = null;
    detectiveGuideOpen = false;
    resetSimulation();
    render();
    window.scrollTo(0, 0);
  }

  function selectTrack(trackId) {
    if (!tracks[trackId] || trackId === currentTrackId) return;
    stopAutoRun();
    suspendPythonStudio();
    currentTrackId = trackId;
    currentMissionIndex = 0;
    courseView = trackId === "course" ? "stages" : "lesson";
    selectedStageId = courseStages[0]?.id || "stage-1";
    activeBoard = "main";
    program = [];
    routeProgram = [];
    selectedProgramIndex = null;
    selectedRouteChoiceId = null;
    detectiveGuideOpen = false;
    resetCreatorSettings();
    lessonToolChoices.clear();
    resetSimulation();
    render();
    window.scrollTo(0, 0);
  }

  function loadReferenceProgram() {
    const selectedRouteChoice = mission().routeChoices?.find((choice) => choice.id === selectedRouteChoiceId);
    program = mission().starterProgram
      ? initialProgramForMission()
      : selectedRouteChoice ? selectedRouteChoice.commands.slice() : mission().solution.slice();
    routeProgram = mission().solutionFn ? mission().solutionFn.slice() : [];
    activeBoard = "main";
    selectedProgramIndex = null;
    resetSimulation();
    render();
  }

  function formatCommand(id) {
    const command = commandDefs[id];
    return command ? command.label : id;
  }

  function renderMissionList() {
    if (!dom.missionList) return;
    const shouldShow = !isCourseTrack() || courseView === "lesson";
    dom.missionList.classList.toggle("is-hidden", !shouldShow);
    if (!shouldShow) {
      dom.missionList.innerHTML = "";
      return;
    }

    const items = isCourseTrack() ? missionsForStage(selectedStageId) : currentMissions();
    dom.missionList.innerHTML = items.map((item) => {
      const missionIndex = missionIndexById(item.id);
      const current = missionIndex === currentMissionIndex ? " is-current" : "";
      const completeClass = completed.has(item.id) ? " is-complete" : "";
      return `
        <button class="mission-button${current}${completeClass}" data-mission="${missionIndex}" type="button">
          <span>${item.lesson}</span>
          <strong>${item.title}</strong>
          <small>${item.concept}</small>
        </button>
      `;
    }).join("");
  }

  function renderTrackSwitch() {
    if (!dom.trackSwitch) return;
    [...dom.trackSwitch.querySelectorAll("[data-track]")].forEach((button) => {
      button.classList.toggle("is-active", button.dataset.track === currentTrackId);
    });
  }

  function renderCourseBreadcrumb() {
    if (!dom.courseBreadcrumb) return;
    if (!isCourseTrack()) {
      dom.courseBreadcrumb.classList.add("is-hidden");
      dom.courseBreadcrumb.innerHTML = "";
      return;
    }

    const stage = selectedStage();
    dom.courseBreadcrumb.classList.remove("is-hidden");
    const stageButton = stage ? `<button data-nav-stage="${stage.id}" type="button">${stage.title}</button>` : "";
    const lessonLabel = courseView === "lesson" ? `<span>${mission().lesson} ${mission().title}</span>` : "";
    dom.courseBreadcrumb.innerHTML = `
      <button data-nav-view="stages" type="button">全部阶段</button>
      ${courseView !== "stages" ? stageButton : ""}
      ${lessonLabel}
    `;
  }

  function renderCourseBrowser() {
    const browsing = isCourseTrack() && courseView !== "lesson";
    updatePortalProgress();
    dom.courseBrowser.classList.toggle("is-hidden", !browsing);
    dom.workspace.classList.toggle("is-hidden", browsing);
    document.body.classList.toggle("is-course-browsing", browsing);
    document.body.classList.toggle("is-lesson-playing", !browsing);
    if (!browsing) {
      dom.courseBrowser.innerHTML = "";
      return;
    }

    const overallDone = courseMissions.filter((item) => completed.has(item.id)).length;
    const overallPercent = courseMissions.length
      ? Math.round((overallDone / courseMissions.length) * 100)
      : 0;

    if (courseView === "stages") {
      dom.courseBrowser.innerHTML = `
        <section class="course-map-hero" aria-labelledby="courseMapTitle">
          <img src="./assets/maps/learning-world-overview.webp" alt="当前开放的 ${courseStages.length} 个编程任务星区围绕能量核心相互连接">
          <div class="course-map-hero-overlay"></div>
          <div class="course-map-hero-copy">
            <p class="course-map-brand">CODE QUEST · 学习世界</p>
            <h2 id="courseMapTitle">CodeQuestPlanet<br>星际学院</h2>
            <p>穿越当前开放的 ${courseStages.length} 个任务星区，从控制 Neo 的第一步，一路成长到能用数据和多对象协作重建星系。</p>
            <div class="course-map-hero-progress" style="--progress: ${overallPercent}%">
              <div>
                <span>探索进度</span>
                <strong>${overallPercent}%</strong>
              </div>
              <span class="progress-track" aria-hidden="true"><i></i></span>
              <small>${overallDone} / ${courseMissions.length} 节完成</small>
            </div>
          </div>
          <div class="course-map-counts" aria-label="课程规模">
            <span><strong>${courseStages.length}</strong> 任务星区</span>
            <span><strong>${courseMissions.length}</strong> 节课程</span>
          </div>
        </section>

        <section class="course-map-section" aria-labelledby="stageSelectTitle">
          <div class="course-map-heading">
            <div>
              <h2 id="stageSelectTitle">选择任务星区</h2>
              <p>每个星区包含 8 节课和一个阶段作品。</p>
            </div>
            <strong>${overallDone === courseMissions.length ? "全部探索完成" : "继续你的星际旅程"}</strong>
          </div>
          <div class="stage-grid">
          ${courseStages.map((stage) => {
            const items = missionsForStage(stage.id);
            const done = items.filter((item) => completed.has(item.id)).length;
            const percent = items.length ? Math.round((done / items.length) * 100) : 0;
            return `
              <button class="stage-card stage-${stage.number}" data-stage="${stage.id}" type="button" style="--progress: ${percent}%">
                <span class="stage-card-visual">
                  <img src="${stageImages[stage.id]}" alt="">
                  <span class="stage-card-number">星区 ${String(stage.number).padStart(2, "0")}</span>
                  <span class="stage-card-completion">${done} / ${items.length}</span>
                </span>
                <span class="stage-card-copy">
                  <small>${stage.chapter}</small>
                  <strong>${stage.title}</strong>
                  <span>${stage.ability}</span>
                  <span class="stage-card-progress" aria-hidden="true"><i></i></span>
                  <em>${stage.work}</em>
                  <b aria-hidden="true">→</b>
                </span>
              </button>
            `;
          }).join("")}
          </div>
        </section>
      `;
      return;
    }

    const stage = selectedStage();
    const lessons = missionsForStage(stage.id);
    const stageDone = lessons.filter((item) => completed.has(item.id)).length;
    const stagePercent = lessons.length ? Math.round((stageDone / lessons.length) * 100) : 0;
    const nextLesson = lessons.find((item) => !completed.has(item.id)) || lessons[lessons.length - 1];
    dom.courseBrowser.innerHTML = `
      <div class="stage-browser-head">
        <div class="stage-browser-progress" style="--progress: ${stagePercent}%">
          <span>阶段进度</span>
          <span class="progress-track" aria-hidden="true"><i></i></span>
          <strong>${stageDone} / ${lessons.length}</strong>
        </div>
      </div>

      <section class="stage-spotlight" aria-labelledby="stageTitle">
        <img src="${stageImages[stage.id]}" alt="${stage.chapter}任务地图">
        <div class="stage-spotlight-overlay"></div>
        <div class="stage-spotlight-copy">
          <span>任务星区 ${String(stage.number).padStart(2, "0")} · 第 ${stage.range} 节</span>
          <h2 id="stageTitle">${stage.chapter}</h2>
          <p>${stage.title}</p>
        </div>
        <div class="stage-mission-summary">
          <div>
            <small>你将掌握</small>
            <strong>${stage.ability}</strong>
          </div>
          <div>
            <small>阶段作品</small>
            <strong>${stage.work}</strong>
          </div>
        </div>
      </section>

      <section class="stage-lessons" aria-labelledby="lessonSelectTitle">
        <div class="stage-lessons-heading">
          <div>
            <h2 id="lessonSelectTitle">选择课程</h2>
            <p>完成学习、练习与创作任务，点亮这个星区。</p>
          </div>
          <span>${stagePercent}% 已完成</span>
        </div>
        <div class="lesson-grid">
          ${lessons.map((item) => {
            const isComplete = completed.has(item.id);
            const isNext = item.id === nextLesson?.id && !isComplete;
            const status = isComplete ? "已完成" : isNext ? "继续学习" : "未开始";
            return `
              <button class="lesson-card ${item.lessonType}${isComplete ? " is-complete" : ""}${isNext ? " is-next" : ""}" data-lesson-id="${item.id}" type="button">
                <span class="lesson-card-meta">
                  <span>${item.lesson}</span>
                  <span class="lesson-card-status">${status}</span>
                </span>
                <strong>${item.title}</strong>
                <small>${item.typeLabel || "学习"} · ${item.concept}</small>
                <span class="lesson-card-footer">
                  <em>${item.artifact}</em>
                  <b aria-hidden="true">→</b>
                </span>
              </button>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderBrief() {
    const m = mission();
    const browsing = isCourseTrack() && courseView !== "lesson";
    const isSequenceTimeline = m.lessonMode === "sequence-timeline";
    const isDirectionCompass = m.lessonMode === "direction-compass";
    const isRouteComparison = m.lessonMode === "route-comparison";
    const isDebugDetective = m.lessonMode === "debug-detective";
    const isCoordinateScanner = m.lessonMode === "coordinate-scanner";
    const isSegmentMission = m.lessonMode === "segment-mission";
    const isRouteCreator = m.lessonMode === "route-creator";
    const isCoreCapstone = m.lessonMode === "core-capstone";
    const isAdvancedLesson = Boolean(m.playgroundBrief);
    const isPythonStudio = isPythonStudioLesson(m);
    const usesPlaygroundBrief = isSequenceTimeline
      || isDirectionCompass
      || isRouteComparison
      || isDebugDetective
      || isCoordinateScanner
      || isSegmentMission
      || isRouteCreator
      || isCoreCapstone
      || isAdvancedLesson;
    const stage = selectedStage();
    dom.appKicker.textContent = browsing ? "CodeQuestPlanet" : `${stage.chapter || stage.title}`;
    dom.pageTitle.textContent = courseView === "stages"
      ? "课程地图"
      : courseView === "stage"
        ? stage.title
        : `${m.lesson} · ${m.title}`;
    dom.nodeProgress.textContent = `学习进度 ${completedInCurrentTrack()} / ${currentMissions().length}`;
    dom.courseHome.hidden = courseView === "stages";
    dom.courseHomeLabel.textContent = courseView === "lesson" ? "本阶段" : "课程地图";
    dom.lessonPager.hidden = browsing;
    dom.prevLesson.disabled = currentMissionIndex <= 0;
    dom.nextLesson.disabled = currentMissionIndex >= currentMissions().length - 1;
    document.title = browsing ? "CodeQuestPlanet | 课程地图" : `${m.lesson} ${m.title} | CodeQuestPlanet`;
    if (dom.progressSync) dom.progressSync.textContent = progressSyncState;
    dom.missionBrief.classList.toggle("is-playground", usesPlaygroundBrief);
    dom.standardMissionBrief.hidden = usesPlaygroundBrief;
    dom.sequenceLessonBrief.hidden = !isSequenceTimeline;
    dom.directionLessonBrief.hidden = !isDirectionCompass;
    dom.routeLessonBrief.hidden = !isRouteComparison;
    dom.playgroundLessonBrief.hidden = !isDebugDetective;
    dom.coordinateLessonBrief.hidden = !isCoordinateScanner;
    dom.segmentLessonBrief.hidden = !isSegmentMission;
    dom.creatorLessonBrief.hidden = !isRouteCreator;
    dom.capstoneLessonBrief.hidden = !isCoreCapstone;
    dom.advancedLessonBrief.hidden = !isAdvancedLesson;
    dom.sequenceTimelinePanel.hidden = !isSequenceTimeline;
    dom.directionLearningPanel.hidden = !isDirectionCompass;
    dom.routeComparisonPanel.hidden = !isRouteComparison;
    dom.coordinateScannerPanel.hidden = !isCoordinateScanner;
    dom.segmentMissionPanel.hidden = !isSegmentMission;
    dom.creatorWorkbenchPanel.hidden = !isRouteCreator;
    dom.capstoneProfilePanel.hidden = !isCoreCapstone;
    dom.advancedLearningPanel.hidden = !isAdvancedLesson || isPythonStudio;
    dom.detectiveGuidePanel.hidden = !isDebugDetective || !detectiveGuideOpen;
    dom.worldHint.textContent = isDebugDetective
      ? detectiveGuideOpen ? "关闭调试侦探社" : "调试侦探社（可选）"
      : isPythonStudio ? "代码提示" : "提示";
    dom.worldHint.setAttribute("aria-expanded", isDebugDetective ? String(detectiveGuideOpen) : "false");
    if (isDebugDetective) {
      dom.worldHint.setAttribute("aria-controls", "detectiveGuidePanel");
    } else {
      dom.worldHint.removeAttribute("aria-controls");
    }
    dom.loadReference.textContent = isDebugDetective
      ? "恢复错误程序"
      : isRouteCreator ? "加载参考解法"
        : usesPlaygroundBrief ? "查看参考程序" : "查看示例";
    if (isAdvancedLesson) {
      dom.advancedChallenge.textContent = m.playgroundBrief.challenge;
      dom.advancedBriefIntro.textContent = m.playgroundBrief.intro;
      dom.advancedBriefBullets.innerHTML = m.playgroundBrief.bullets.map((item) => `<li>${item}</li>`).join("");
      dom.advancedBriefGoal.textContent = m.playgroundBrief.goal;
      dom.advancedEvidenceName.textContent = m.studentOutput || m.artifact || "本课运行记录";
      dom.advancedEvidenceState.textContent = completed.has(m.id) ? "已保存" : "完成运行后保存";
      dom.advancedEvidenceSave.classList.toggle("is-saved", completed.has(m.id));
    }
    dom.missionConcept.textContent = m.concept;
    dom.missionTarget.textContent = m.target;
    dom.lessonCheckpoint.textContent = isCourseTrack() ? m.story : m.checkpoint;
    dom.runBanner.textContent = sim.message;
    const isRunning = isPythonStudio ? pythonPlaying : Boolean(runTimer);
    dom.worldState.textContent = sim.completed ? "已完成" : sim.failed ? "需要调试" : isRunning ? "运行中" : "等待运行";
    dom.worldState.dataset.state = sim.completed ? "success" : sim.failed ? "error" : isRunning ? "running" : "idle";
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

    if (dom.worldFailureIndicator) {
      const failureTypes = {
        fall: ["越界掉落", "探测员走出了地图边缘。"],
        "collision-fail": ["发生碰撞", "前方有岩石或墙体。"],
        "hazard-fail": ["危险区停机", "没有足够能量安全穿过危险格。"],
        "power-fail": ["能量耗尽", "探测员无法继续执行动作。"],
        "action-fail": ["动作失败", "当前位置不满足这条指令。"]
      };
      const kind = sim.failureType || "action-fail";
      const [title, fallback] = failureTypes[kind] || failureTypes["action-fail"];
      dom.worldFailureIndicator.hidden = !sim.failed;
      dom.worldFailureIndicator.dataset.kind = kind;
      dom.worldFailureTitle.textContent = title;
      dom.worldFailureDetail.textContent = sim.failureMessage || fallback;
      if (dom.canvasShell) {
        if (sim.failed) dom.canvasShell.dataset.failure = kind;
        else delete dom.canvasShell.dataset.failure;
      }
    }
  }

  function renderPalette() {
    const m = mission();
    const target = currentTargetProgram();
    const limit = activeBoard === "route" ? 6 : m.limit;
    const canReplace = hasSelectedProgramStep();
    dom.commandLimit.textContent = `${target.length} / ${limit} 个指令`;
    dom.paletteInstruction.textContent = canReplace
      ? `替换第 ${selectedProgramIndex + 1} 步`
      : m.lessonMode === "debug-detective" && target.length >= limit
        ? "先选中要修改的步骤"
        : m.lessonMode && m.lessonMode !== "standard" && target.length >= limit
          ? "点选步骤可以替换"
        : "点击加入";
    dom.commandPalette.innerHTML = m.allowed.map((id) => {
      const command = commandDefs[id];
      if (!command) return "";
      const blockedInRoute = activeBoard === "route" && ["upload", "collect", "callRoute"].includes(id);
      const disabled = (target.length >= limit && !canReplace) || blockedInRoute ? "disabled" : "";
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

  function advancedProgramHint(mode) {
    const hints = {
      "loop-expander": "用循环表达重复，不是瞬移",
      "range-indent": "缩进决定循环体范围",
      "energy-lab": "同时检查路线与剩余能量",
      "loop-creator": "先定危险格，再写参考解",
      "condition-lab": "条件成立时才执行动作",
      "logic-guard": "组合布尔条件决定分支",
      "while-monitor": "每轮重新检查停止条件",
      "energy-boss": "循环、条件与能量一起验证",
      "variable-counter": "观察 collected 的每次变化",
      "state-console": "同时追踪多个运行状态",
      "function-factory": "先定义 routeA，再在主程序调用",
      "reuse-creator": "同一函数要能重复使用"
    };
    return hints[mode] || "按顺序执行";
  }

  function renderProgramList() {
    const target = currentTargetProgram();
    if (!hasSelectedProgramStep()) selectedProgramIndex = null;
    dom.programTitle.textContent = activeBoard === "route" ? "函数 routeA()" : "我的程序";
    dom.activeBoardHint.textContent = activeBoard === "route"
      ? "只放路线动作"
      : mission().lessonMode === "debug-detective"
        ? "点选一步，再从左侧替换"
        : mission().lessonMode === "sequence-timeline"
          ? "第一步会最先发生"
          : mission().lessonMode === "direction-compass"
            ? "转向只改变朝向"
            : mission().lessonMode === "route-comparison"
              ? "先选路线，再排指令"
            : mission().lessonMode === "coordinate-scanner"
              ? "坐标不会随镜头改变"
            : mission().lessonMode === "segment-mission"
              ? "按子目标分段执行"
            : mission().lessonMode === "route-creator"
              ? "先定规则，再写解法"
            : mission().lessonMode === "core-capstone"
              ? "逐项点亮能力档案"
            : mission().playgroundBrief
              ? advancedProgramHint(mission().lessonMode) !== "按顺序执行"
                ? advancedProgramHint(mission().lessonMode)
                : `配合${mission().advancedConfig?.toolTitle || "学习工具"}验证`
          : "按顺序执行";

    if (!target.length) {
      dom.programList.className = "program-list is-empty";
      dom.programList.innerHTML = activeBoard === "route" ? "选择函数动作" : "从左侧选择第一条指令";
      return;
    }

    dom.programList.className = "program-list";
    dom.programList.innerHTML = target.map((id, index) => `
      <li class="program-chip${selectedProgramIndex === index ? " is-selected" : ""}">
        <button class="program-select-button" data-program-index="${index}" type="button" aria-pressed="${selectedProgramIndex === index}">
          <span>${index + 1}</span>
          <strong>${formatCommand(id)}</strong>
        </button>
        <button class="program-remove" data-remove="${index}" type="button" aria-label="移除 ${formatCommand(id)}">×</button>
      </li>
    `).join("");
  }

  function renderSequenceTimeline() {
    if (!dom.sequenceTimeline || mission().lessonMode !== "sequence-timeline") return;

    const activeMission = mission();
    const previewGrid = parseGrid(activeMission.grid);
    let x = previewGrid.start.x;
    let y = previewGrid.start.y;
    let dir = activeMission.startDir;
    let collected = false;
    const slotCount = activeMission.limit;
    const rows = [];

    for (let index = 0; index < slotCount; index += 1) {
      const command = program[index];
      let effect = `第 ${index + 1} 步还没有安排`;
      let hasProblem = false;

      if (command === "move") {
        const vector = vectors[dir];
        const nextX = x + vector.x;
        const nextY = y + vector.y;
        const blocked = nextX < 0
          || nextY < 0
          || nextX >= previewGrid.width
          || nextY >= previewGrid.height
          || previewGrid.voids.has(tileKey(nextX, nextY))
          || previewGrid.walls.has(tileKey(nextX, nextY));

        if (blocked) {
          effect = "前方不能通过，位置不会改变";
          hasProblem = true;
        } else {
          x = nextX;
          y = nextY;
          effect = previewGrid.beacons.has(tileKey(x, y))
            ? `到达信标格 (${x}, ${y})`
            : `位置变为 (${x}, ${y})`;
        }
      } else if (command === "collect") {
        if (previewGrid.beacons.has(tileKey(x, y)) && !collected) {
          collected = true;
          effect = "采集成功，信标变为 1 / 1";
        } else {
          effect = "当前位置没有可采集的信标";
          hasProblem = true;
        }
      }

      const executed = sim.expanded && index < sim.queueIndex;
      const isActualError = sim.failed && executed && index === sim.queueIndex - 1;
      const isCurrent = sim.expanded
        && !sim.failed
        && !sim.completed
        && index === sim.queueIndex
        && Boolean(command);
      const status = isActualError
        ? "执行失败"
        : executed ? "已执行" : isCurrent ? "下一步" : command ? "待执行" : "待放入";

      rows.push(`
        <li class="sequence-timeline-step${executed ? " is-executed" : ""}${isCurrent ? " is-current" : ""}${hasProblem ? " has-problem" : ""}${isActualError ? " is-error" : ""}">
          <span class="sequence-step-number">${index + 1}</span>
          <span class="sequence-step-copy">
            <strong>${command ? formatCommand(command) : "等待指令"}</strong>
            <small>${effect}</small>
          </span>
          <span class="sequence-step-status">${status}</span>
        </li>
      `);
    }

    dom.sequenceTimeline.innerHTML = rows.join("");
    dom.sequenceTimelineState.textContent = sim.completed
      ? "3 步依次完成，信号采集成功"
      : sim.failed ? "顺序有问题，查看失败步骤"
        : sim.expanded ? `已执行 ${Math.min(sim.queueIndex, program.length)} / ${program.length} 步`
          : program.length === slotCount ? "程序已排好，可以运行"
            : `已放入 ${program.length} / ${slotCount} 条指令`;
  }

  function renderDirectionTracker() {
    if (!dom.directionCompass || mission().lessonMode !== "direction-compass") return;

    const activeMission = mission();
    const previewGrid = parseGrid(activeMission.grid);
    let x = previewGrid.start.x;
    let y = previewGrid.start.y;
    let dir = activeMission.startDir;
    let collected = false;

    const rows = program.map((command, index) => {
      let positionChange = `位置保持 (${x}, ${y})`;
      let hasProblem = false;

      if (command === "left" || command === "right") {
        dir = turn(dir, command === "left" ? -1 : 1);
      } else if (command === "move") {
        const vector = vectors[dir];
        const nextX = x + vector.x;
        const nextY = y + vector.y;
        const blocked = nextX < 0
          || nextY < 0
          || nextX >= previewGrid.width
          || nextY >= previewGrid.height
          || previewGrid.voids.has(tileKey(nextX, nextY))
          || previewGrid.walls.has(tileKey(nextX, nextY));

        if (blocked) {
          positionChange = `前方阻挡，仍在 (${x}, ${y})`;
          hasProblem = true;
        } else {
          x = nextX;
          y = nextY;
          positionChange = previewGrid.beacons.has(tileKey(x, y))
            ? `到达信标 (${x}, ${y})`
            : `移动到 (${x}, ${y})`;
        }
      } else if (command === "collect") {
        if (previewGrid.beacons.has(tileKey(x, y)) && !collected) {
          collected = true;
          positionChange = `在 (${x}, ${y}) 采集成功`;
        } else {
          positionChange = `(${x}, ${y}) 没有信标`;
          hasProblem = true;
        }
      }

      const executed = sim.expanded && index < sim.queueIndex;
      const isActualError = sim.failed && executed && index === sim.queueIndex - 1;
      return `
        <div class="direction-change-row${executed ? " is-executed" : ""}${hasProblem ? " has-problem" : ""}${isActualError ? " is-error" : ""}" role="row">
          <span role="cell"><b>${index + 1}</b>${formatCommand(command)}</span>
          <strong role="cell">${directionLabels[dir]}</strong>
          <span role="cell">${positionChange}</span>
        </div>
      `;
    });

    dom.directionChangeRows.innerHTML = rows.length
      ? rows.join("")
      : `<div class="direction-change-empty" role="row"><span role="cell">放入指令后，这里会预览朝向和位置变化。</span></div>`;
    dom.directionCompass.dataset.direction = sim.dir;
    dom.directionCompass.setAttribute("aria-label", `探测员当前朝向${directionLabels[sim.dir]}`);
    dom.directionCompassValue.textContent = directionLabels[sim.dir];
    dom.directionLearningState.textContent = sim.completed
      ? `实际朝向：${directionLabels[sim.dir]} · 已到达信标`
      : sim.failed ? `实际朝向：${directionLabels[sim.dir]} · 查看失败步骤`
        : sim.expanded ? `实际朝向：${directionLabels[sim.dir]} · 已执行 ${Math.min(sim.queueIndex, program.length)} 步`
          : program.length ? `开始朝向：东 · 已预览 ${program.length} 步` : "开始朝向：东";
  }

  function renderRouteComparison() {
    if (!dom.routeChoiceList || mission().lessonMode !== "route-comparison") return;

    const choices = mission().routeChoices || [];
    const selectedChoice = choices.find((choice) => choice.id === selectedRouteChoiceId);
    dom.routeChoiceList.innerHTML = choices.map((choice) => {
      const isSelected = choice.id === selectedRouteChoiceId;
      return `
        <button class="route-choice${isSelected ? " is-selected" : ""}" data-route-choice="${choice.id}" type="button" aria-pressed="${isSelected}">
          <span class="route-choice-title">
            <strong>${choice.label}</strong>
            <b>${isSelected ? "已选择" : "选择路线"}</b>
          </span>
          <span class="route-choice-summary">${choice.summary}</span>
          <span class="route-choice-metrics">
            <span><small>可行性</small><strong>可完成</strong></span>
            <span><small>动作</small><strong>${choice.moves}</strong></span>
            <span><small>转向</small><strong>${choice.turns}</strong></span>
            <span><small>出错风险</small><strong>${choice.risk}</strong></span>
          </span>
        </button>
      `;
    }).join("");

    dom.routeSelectionState.textContent = sim.completed
      ? "路线已经通过运行验证"
      : sim.failed ? "程序未完成路线，请对照选择重新检查"
        : selectedChoice ? `已选 ${selectedChoice.label.replace("路线 ", "")}` : "先选择一条路线";
  }

  function renderCoordinateScanner() {
    if (!dom.coordinateArchive || mission().lessonMode !== "coordinate-scanner") return;

    const activeMission = mission();
    const targets = activeMission.coordinateTargets || [];
    dom.coordinateCurrentValue.textContent = `(${sim.x}, ${sim.y})`;
    dom.coordinateArchive.innerHTML = [
      {
        label: "起点",
        x: sim.grid.start.x,
        y: sim.grid.start.y,
        state: "坐标原点已记录",
        done: true
      },
      ...targets.map((target) => {
        const targetKey = tileKey(target.x, target.y);
        const collected = sim.collected.has(targetKey);
        const current = sim.x === target.x && sim.y === target.y;
        return {
          ...target,
          state: collected ? "已经采集" : current ? "已经到达，等待采集" : "等待到达",
          done: collected,
          current
        };
      })
    ].map((target, index) => `
      <li class="coordinate-record${target.done ? " is-complete" : ""}${target.current ? " is-current" : ""}">
        <span>${index === 0 ? "起" : String.fromCharCode(64 + index)}</span>
        <span>
          <strong>${target.label}</strong>
          <small>${target.state}</small>
        </span>
        <b>(${target.x}, ${target.y})</b>
      </li>
    `).join("");

    dom.coordinateScannerState.textContent = sim.completed
      ? "两座信标的坐标都已验证"
      : sim.failed ? "坐标或朝向有误，查看失败步骤"
        : sim.collected.size ? `已采集 ${sim.collected.size} / ${activeMission.required} 座信标`
          : sim.expanded ? `正在读取 (${sim.x}, ${sim.y})` : "读取起点与目标坐标";
  }

  function renderSegmentMission() {
    if (!dom.segmentMissionSteps || mission().lessonMode !== "segment-mission") return;

    const activeMission = mission();
    const beacons = [...sim.grid.beacons.values()].sort((a, b) => a.y - b.y || a.x - b.x);
    const steps = [
      {
        title: "采集信标 A",
        detail: beacons[0] ? `前往 (${beacons[0].x}, ${beacons[0].y}) 并 collect()` : "找到第一座信标",
        done: beacons[0] ? sim.collected.has(tileKey(beacons[0].x, beacons[0].y)) : false
      },
      {
        title: "采集信标 B",
        detail: beacons[1] ? `前往 (${beacons[1].x}, ${beacons[1].y}) 并 collect()` : "找到第二座信标",
        done: beacons[1] ? sim.collected.has(tileKey(beacons[1].x, beacons[1].y)) : false
      },
      {
        title: "到中继站上传",
        detail: sim.grid.relay ? `携带 2 份信号到 (${sim.grid.relay.x}, ${sim.grid.relay.y}) 并 upload()` : "前往中继站",
        done: sim.completed
      }
    ];
    const activeIndex = steps.findIndex((step) => !step.done);

    dom.carryingState.innerHTML = `
      <span>携带状态</span>
      <strong>${sim.collected.size} / ${activeMission.required} 份信号</strong>
    `;
    dom.segmentMissionSteps.innerHTML = steps.map((step, index) => `
      <li class="segment-mission-step${step.done ? " is-complete" : ""}${index === activeIndex ? " is-current" : ""}">
        <span>${step.done ? "✓" : index + 1}</span>
        <span><strong>${step.title}</strong><small>${step.detail}</small></span>
        <b>${step.done ? "完成" : index === activeIndex ? "当前" : "等待"}</b>
      </li>
    `).join("");
    dom.segmentMissionState.textContent = sim.completed
      ? "三个子目标全部完成"
      : sim.failed ? `子目标 ${Math.max(1, activeIndex + 1)} 需要检查`
        : activeIndex >= 0 ? `当前：子目标 ${activeIndex + 1}` : "等待最终验证";
  }

  function renderCreatorWorkbench() {
    if (!dom.creatorMapEditor || mission().lessonMode !== "route-creator") return;

    const activeMission = mission();
    const template = activeMission.creatorTemplateGrid || [];
    const targets = activeMission.creatorTargets || [];
    const activeTarget = activeMission.creatorActiveTarget || targets[0];
    const targetByPosition = new Map(targets.map((target) => [tileKey(target.x, target.y), target]));

    dom.creatorMapEditor.style.setProperty("--creator-columns", template[0]?.length || 1);
    dom.creatorMapEditor.innerHTML = template.flatMap((line, y) => [...line].map((tile, x) => {
      const target = targetByPosition.get(tileKey(x, y));
      const isSelected = target?.id === activeTarget?.id;
      if (target) {
        return `<button class="creator-map-cell is-target-slot${isSelected ? " is-selected" : ""}" data-creator-target="${target.id}" type="button" aria-pressed="${isSelected}" aria-label="${target.label}，坐标 ${target.x}, ${target.y}">${isSelected ? "◆" : "＋"}</button>`;
      }
      const tileClass = tile === "_" ? "is-void" : tile === "#" ? "is-wall" : tile === "S" ? "is-start" : "is-ground";
      const label = tile === "#" ? "岩石" : tile === "S" ? "起点" : "";
      return `<span class="creator-map-cell ${tileClass}" aria-label="${label || `坐标 ${x}, ${y}`}"${tile === "_" ? " aria-hidden=\"true\"" : ""}>${tile === "S" ? "S" : tile === "#" ? "■" : ""}</span>`;
    })).join("");

    dom.creatorTargetOptions.innerHTML = targets.map((target) => {
      const isSelected = target.id === activeTarget?.id;
      return `<button class="${isSelected ? "is-selected" : ""}" data-creator-target="${target.id}" type="button" aria-pressed="${isSelected}">${target.label} (${target.x}, ${target.y})</button>`;
    }).join("");

    [...dom.creatorLimitOptions.querySelectorAll("[data-creator-limit]")].forEach((button) => {
      const isSelected = button.dataset.creatorLimit === creatorLimitMode;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });

    const shortest = activeTarget?.solution.length || 0;
    const validations = [
      ["起点已设置", true],
      [activeTarget ? `目标位于 (${activeTarget.x}, ${activeTarget.y})` : "选择目标位置", Boolean(activeTarget)],
      ["起点到目标存在可走路线", Boolean(shortest)],
      [`步数限制 ${activeMission.limit} ≥ 最短解 ${shortest}`, activeMission.limit >= shortest]
    ];
    dom.creatorValidationList.innerHTML = validations.map(([label, valid]) => `
      <li class="${valid ? "is-valid" : "is-invalid"}"><span>${valid ? "✓" : "!"}</span>${label}</li>
    `).join("");
    dom.creatorValidationState.textContent = sim.completed
      ? "原创关卡已经通过运行验证"
      : sim.failed ? "参考程序未通过，请继续修改"
        : `关卡可解 · ${creatorLimitMode === "strict" ? "严格" : "宽松"}限制 ${activeMission.limit} 步`;
  }

  function renderCapstoneProfile() {
    if (!dom.capstoneProfileGates || mission().lessonMode !== "core-capstone") return;

    const activeMission = mission();
    const gates = [
      ["顺序程序", "已经开始把路线翻译为有顺序的指令", program.length > 0],
      ["朝向控制", "程序中使用了转向来改变后续路线", program.includes("left") || program.includes("right")],
      ["路线与限制", `程序没有超过 ${activeMission.limit} 步`, program.length > 0 && program.length <= activeMission.limit],
      ["日志验证", "已经运行或单步检查程序", sim.expanded],
      ["分段采集", "两座信标都已采集", sim.collected.size === activeMission.required],
      ["最终上传", "携带全部信号抵达中继站并上传", sim.completed]
    ];
    const completedGateCount = gates.filter(([, , done]) => done).length;

    dom.capstoneProfileGates.innerHTML = gates.map(([title, detail, done], index) => `
      <li class="${done ? "is-complete" : ""}">
        <span>${done ? "✓" : index + 1}</span>
        <span><strong>${title}</strong><small>${detail}</small></span>
      </li>
    `).join("");
    dom.capstoneProfileState.textContent = sim.completed
      ? "6 项能力全部通过验证"
      : `已证明 ${completedGateCount} / ${gates.length} 项`;
  }

  function renderAdvancedLearningTool() {
    const m = mission();
    if (!dom.advancedLearningContent || !m.playgroundBrief) return;

    const mode = m.lessonMode;
    const renderChoice = (action, value, label, selected) => `
      <button class="advanced-choice${selected ? " is-selected" : ""}" data-advanced-action="${action}" data-advanced-value="${value}" type="button" aria-pressed="${selected}">${label}</button>
    `;
    const currentKey = tileKey(sim.x, sim.y);
    const front = frontKind();

    if (mode === "loop-expander") {
      const expanded = [];
      program.forEach((command, sourceIndex) => {
        const match = command.match(/^repeat(\d+)$/);
        const count = match ? Number(match[1]) : 1;
        for (let index = 0; index < count; index += 1) {
          expanded.push({ command: match ? "move" : command, sourceIndex, repeatIndex: match ? index + 1 : null });
        }
      });
      dom.advancedToolTitle.textContent = "循环展开器";
      dom.advancedToolState.textContent = program.length
        ? `${program.length} 条代码 → ${expanded.length} 次实际动作`
        : "放入循环后查看展开结果";
      dom.advancedLearningContent.innerHTML = `
        <div class="advanced-summary-row"><span>程序长度 <strong>${program.length}</strong></span><span>实际动作 <strong>${expanded.length}</strong></span><span>目标距离 <strong>7 格</strong></span></div>
        <ol class="advanced-execution-list">
          ${expanded.length ? expanded.map((item, index) => `<li><span>${index + 1}</span><strong>${formatCommand(item.command)}</strong><small>${item.repeatIndex ? `来自第 ${item.sourceIndex + 1} 条循环 · 第 ${item.repeatIndex} 次` : `来自第 ${item.sourceIndex + 1} 条指令`}</small></li>`).join("") : "<li class=\"is-empty\">选择 repeat(2)–repeat(5)，这里会显示它实际执行了多少次 move()。</li>"}
        </ol>
      `;
      return;
    }

    if (mode === "range-indent") {
      const choices = [
        ["move-only", "只缩进 move()"],
        ["move-collect", "move() 和 collect() 都缩进"],
        ["no-indent", "两条都不缩进"]
      ];
      const correct = indentScopeChoice === "move-only";
      dom.advancedToolTitle.textContent = "缩进实验台";
      dom.advancedToolState.textContent = correct ? "循环范围正确" : "循环范围会造成错误";
      dom.advancedLearningContent.innerHTML = `
        <div class="advanced-choice-row">${choices.map(([value, label]) => renderChoice("indent", value, label, indentScopeChoice === value)).join("")}</div>
        <pre class="structured-code"><code>for step in range(2):\n${indentScopeChoice === "no-indent" ? "" : "    "}move()\n${indentScopeChoice === "move-collect" ? "    " : ""}collect()</code></pre>
        <p class="advanced-feedback ${correct ? "is-success" : "is-warning"}">${correct ? "move() 重复两次，退出循环后 collect() 只执行一次。" : indentScopeChoice === "move-collect" ? "collect() 会在第二次循环时再次执行，造成空采集。" : "没有动作进入循环体，range(2) 不会控制移动。"}</p>
      `;
      return;
    }

    if (mode === "energy-lab") {
      const reserveMet = sim.energy >= Number(m.minEnergy || 0);
      dom.advancedToolTitle.textContent = "能量预算台";
      dom.advancedToolState.textContent = sim.completed
        ? `过关 · 剩余 ${sim.energy} 点`
        : `当前 ${sim.energy} / ${m.energy} 点`;
      dom.advancedLearningContent.innerHTML = `
        <div class="energy-meter" style="--energy-scale:${Math.max(0, sim.energy / m.energy)}"><span><i></i></span><strong>${sim.energy}</strong><small>最低保留 ${m.minEnergy}</small></div>
        <div class="advanced-ledger">
          <div><span>移动</span><strong>−1 / 格</strong></div>
          <div><span>开启护盾</span><strong>−1</strong></div>
          <div><span>无盾进入危险格</span><strong>−4 额外</strong></div>
          <div class="${reserveMet ? "is-success" : "is-warning"}"><span>当前预算</span><strong>${reserveMet ? "达到保留线" : "低于保留线"}</strong></div>
        </div>
      `;
      return;
    }

    if (mode === "loop-creator") {
      const hazards = m.advancedConfig?.loopHazards || [];
      const activeHazard = m.loopCreatorActiveHazard || hazards[0];
      dom.advancedToolTitle.textContent = "循环危险关编辑器";
      dom.advancedToolState.textContent = sim.completed ? "原创设置已通过验证" : `危险格 (${activeHazard.x}, ${activeHazard.y})`;
      dom.advancedLearningContent.innerHTML = `
        <div class="advanced-choice-row">${hazards.map((hazard) => renderChoice("loop-hazard", hazard.id, `${hazard.label} (${hazard.x}, ${hazard.y})`, hazard.id === activeHazard.id)).join("")}</div>
        <div class="route-strip" aria-label="原创危险路线">
          ${Array.from({ length: 7 }, (_, index) => {
            const x = index + 1;
            const type = x === 1 ? "start" : x === 7 ? "beacon" : x === activeHazard.x ? "hazard" : "ground";
            return `<span class="is-${type}">${type === "start" ? "S" : type === "beacon" ? "B" : type === "hazard" ? "!" : ""}</span>`;
          }).join("")}
        </div>
        <p class="advanced-feedback">切换危险格后，左侧 3D 地图和参考解会同步更新；循环仍需覆盖总共 6 格移动。</p>
      `;
      return;
    }

    if (mode === "condition-lab") {
      const options = [["hazard", "危险格 hazard"], ["blocked", "阻挡 blocked"], ["clear", "可通行 clear"]];
      const matches = front === sensorTarget;
      dom.advancedToolTitle.textContent = "条件传感器";
      dom.advancedToolState.textContent = `前方读取：${front} · 条件 ${matches ? "true" : "false"}`;
      dom.advancedLearningContent.innerHTML = `
        <div class="advanced-choice-row">${options.map(([value, label]) => renderChoice("sensor", value, label, sensorTarget === value)).join("")}</div>
        <pre class="structured-code"><code>if scanAhead() == "${sensorTarget}":\n    ${sensorTarget === "hazard" ? "shield()" : sensorTarget === "blocked" ? "turnRight()" : "move()"}</code></pre>
        <div class="condition-result"><span>scanAhead()</span><strong>${front}</strong><span>判断结果</span><b class="${matches ? "is-true" : "is-false"}">${matches ? "true" : "false"}</b></div>
      `;
      return;
    }

    if (mode === "logic-guard") {
      const conditions = [front === "clear", sim.energy > 3, logicHazardMode === "not-hazard" ? front !== "hazard" : front === "hazard"];
      const result = logicConnector === "and" ? conditions.every(Boolean) : conditions.some(Boolean);
      dom.advancedToolTitle.textContent = "逻辑守卫构造器";
      dom.advancedToolState.textContent = `表达式结果：${result ? "true" : "false"}`;
      dom.advancedLearningContent.innerHTML = `
        <div class="logic-builder-row"><span>连接方式</span>${renderChoice("logic-connector", "and", "AND", logicConnector === "and")}${renderChoice("logic-connector", "or", "OR", logicConnector === "or")}</div>
        <div class="logic-builder-row"><span>危险条件</span>${renderChoice("logic-hazard", "not-hazard", "NOT hazard", logicHazardMode === "not-hazard")}${renderChoice("logic-hazard", "hazard", "hazard", logicHazardMode === "hazard")}</div>
        <div class="logic-truth-row"><span>clear <b>${conditions[0] ? "T" : "F"}</b></span><span>enoughEnergy <b>${conditions[1] ? "T" : "F"}</b></span><span>${logicHazardMode === "not-hazard" ? "NOT hazard" : "hazard"} <b>${conditions[2] ? "T" : "F"}</b></span><strong class="${result ? "is-true" : "is-false"}">${result ? "MOVE" : "TURN"}</strong></div>
      `;
      return;
    }

    if (mode === "while-monitor") {
      const onBeacon = sim.grid.beacons.has(currentKey) && !sim.collected.has(currentKey);
      const onRelay = Boolean(sim.grid.relay && sim.x === sim.grid.relay.x && sim.y === sim.grid.relay.y);
      dom.advancedToolTitle.textContent = "while 停止条件监视器";
      dom.advancedToolState.textContent = sim.completed ? "两个循环都已正确停止" : `位置 (${sim.x}, ${sim.y})`;
      dom.advancedLearningContent.innerHTML = `
        <div class="while-condition-row"><code>while not onBeacon()</code><span>${onBeacon ? "false · 停止" : "true · 继续"}</span></div>
        <div class="while-condition-row"><code>while not onRelay()</code><span>${onRelay ? "false · 停止" : sim.collected.size ? "true · 继续" : "等待采集后启用"}</span></div>
        <p class="advanced-feedback">循环每移动一格都会重新检查条件；到达目标的那一刻不再多走一步。</p>
      `;
      return;
    }

    if (mode === "energy-boss") {
      const gates = [
        ["循环压缩", program.some((command) => command.startsWith("repeat"))],
        ["信标 A", sim.collected.size >= 1],
        ["信标 B", sim.collected.size >= 2],
        ["能量保留", sim.energy >= Number(m.minEnergy || 0)],
        ["中继站上传", sim.completed]
      ];
      dom.advancedToolTitle.textContent = "能源搜救任务档案";
      dom.advancedToolState.textContent = `已完成 ${gates.filter(([, done]) => done).length} / ${gates.length} 项`;
      dom.advancedLearningContent.innerHTML = `<ol class="boss-gate-list">${gates.map(([label, done], index) => `<li class="${done ? "is-complete" : ""}"><span>${done ? "✓" : index + 1}</span><strong>${label}</strong></li>`).join("")}</ol>`;
      return;
    }

    if (mode === "variable-counter") {
      dom.advancedToolTitle.textContent = "变量追踪器";
      dom.advancedToolState.textContent = `collected = ${sim.collected.size}`;
      dom.advancedLearningContent.innerHTML = `
        <div class="variable-flow"><span class="is-complete"><small>开始</small><strong>0</strong></span><i>＋1</i><span class="${sim.collected.size >= 1 ? "is-complete" : ""}"><small>采集 A</small><strong>1</strong></span><i>＋1</i><span class="${sim.collected.size >= 2 ? "is-complete" : ""}"><small>采集 B</small><strong>2</strong></span></div>
        <pre class="structured-code"><code>collected = ${sim.collected.size}\n# 每次 collect() 成功后更新</code></pre>
      `;
      return;
    }

    if (mode === "state-console") {
      const stateRows = [["position", `(${sim.x}, ${sim.y})`], ["direction", directionLabels[sim.dir]], ["energy", sim.energy], ["collected", sim.collected.size]];
      dom.advancedToolTitle.textContent = "多变量状态控制台";
      dom.advancedToolState.textContent = sim.completed ? "最终状态已经通过上传验证" : `已执行 ${sim.queueIndex} 步`;
      dom.advancedLearningContent.innerHTML = `
        <div class="state-console-grid">${stateRows.map(([name, value]) => `<div><span>${name}</span><strong>${value}</strong></div>`).join("")}</div>
        <p class="advanced-feedback">单步运行时比较四个变量：哪些改变、哪些保持不变，以及上传检查了哪些状态。</p>
      `;
      return;
    }

    if (mode === "function-factory" || mode === "reuse-creator") {
      const calls = program.filter((command) => command === "callRoute").length;
      const expectedCalls = mode === "reuse-creator" ? 3 : 2;
      dom.advancedToolTitle.textContent = mode === "reuse-creator" ? "函数复用证明" : "函数工厂";
      dom.advancedToolState.textContent = `routeA() 已定义 ${routeProgram.length} 条 · 调用 ${calls} 次`;
      dom.advancedLearningContent.innerHTML = `
        <div class="function-boundary">
          <div><span>routeA() 负责</span><strong>${routeProgram.length ? routeProgram.map(formatCommand).join(" → ") : "等待定义路线动作"}</strong></div>
          <div><span>main() 负责</span><strong>调用、采集、转向与上传</strong></div>
        </div>
        <ol class="function-proof-list">
          <li class="${routeProgram.length ? "is-complete" : ""}"><span>${routeProgram.length ? "✓" : "1"}</span>函数中已有稳定路线</li>
          <li class="${calls >= expectedCalls ? "is-complete" : ""}"><span>${calls >= expectedCalls ? "✓" : "2"}</span>主程序调用至少 ${expectedCalls} 次</li>
          <li class="${sim.completed ? "is-complete" : ""}"><span>${sim.completed ? "✓" : "3"}</span>复用后运行结果正确</li>
        </ol>
      `;
      return;
    }

    const config = m.advancedConfig;
    if (config?.kind) {
      const options = config.options || [];
      const choiceKey = `${m.id}:lesson-choice`;
      const selectedChoice = lessonToolChoices.get(choiceKey) || options[0] || "";
      const choicesMarkup = options.length
        ? `<div class="advanced-choice-row">${options.map((option) => renderChoice("lesson-choice", option, option, selectedChoice === option)).join("")}</div>`
        : "";
      const evidence = config.evidence || [];
      const points = [
        { label: "起点", ...sim.grid.start },
        ...[...sim.grid.beacons.values()].map((point, index) => ({ label: `信标 ${String.fromCharCode(65 + index)}`, ...point })),
        ...(sim.grid.relay ? [{ label: "中继站", ...sim.grid.relay }] : [])
      ];
      const evidenceMarkup = () => `<ul class="concept-evidence-list">${evidence.map((item, index) => {
        const done = sim.completed
          || (index === 0 && program.length > 0)
          || (index === 1 && sim.expanded)
          || (index === 2 && sim.collected.size > 0)
          || (index === 3 && sim.collected.size >= m.required);
        return `<li class="${done ? "is-complete" : ""}"><span>${done ? "✓" : index + 1}</span>${item}</li>`;
      }).join("")}</ul>`;

      dom.advancedToolTitle.textContent = config.toolTitle || m.studentOutput || "学习工具";
      dom.advancedToolState.textContent = sim.completed ? "学习证据已经通过运行验证" : selectedChoice || "等待操作";

      if (config.kind === "parameter") {
        const n = Number(selectedChoice.match(/\d+/)?.[0] || 0);
        dom.advancedLearningContent.innerHTML = `
          ${choicesMarkup}
          <div class="parameter-call-view"><code>${selectedChoice}</code><span>参数 n</span><strong>${n}</strong><span>实际展开</span><strong>${n} 次 move()</strong></div>
          ${evidenceMarkup()}
        `;
        return;
      }

      if (config.kind === "return") {
        const returnValue = selectedChoice.startsWith("isSafe")
          ? front === "clear" && sim.energy > 3
          : selectedChoice.startsWith("onBeacon")
            ? sim.grid.beacons.has(currentKey)
            : sim.energy > 3;
        dom.advancedLearningContent.innerHTML = `
          ${choicesMarkup}
          <div class="return-value-view"><code>${selectedChoice}</code><span>返回</span><strong class="${returnValue ? "is-true" : "is-false"}">${returnValue ? "true" : "false"}</strong><small>返回值本身不移动 Neo，必须被 if 或变量使用。</small></div>
          ${evidenceMarkup()}
        `;
        return;
      }

      if (["collection", "index", "search", "sort", "planner", "strategy"].includes(config.kind)) {
        const start = sim.grid.start;
        const ordered = points.map((point, index) => ({
          ...point,
          index,
          distance: Math.abs(point.x - start.x) + Math.abs(point.y - start.y)
        }));
        if (config.kind === "sort" || config.kind === "strategy") {
          ordered.sort((a, b) => selectedChoice.includes("风险") ? b.distance - a.distance : a.distance - b.distance);
        }
        dom.advancedLearningContent.innerHTML = `
          ${choicesMarkup}
          <ol class="data-sequence-list">${ordered.map((point, index) => {
            const checked = sim.collected.has(tileKey(point.x, point.y)) || (point.label === "中继站" && sim.completed);
            return `<li class="${checked ? "is-complete" : ""}"><span>${config.kind === "index" ? `[${point.index}]` : index + 1}</span><strong>${point.label}</strong><small>(${point.x}, ${point.y}) · 距离 ${point.distance}</small><b>${checked ? "已处理" : config.kind === "search" ? "待检查" : "候选"}</b></li>`;
          }).join("")}</ol>
          ${evidenceMarkup()}
        `;
        return;
      }

      if (config.kind === "record" || config.kind === "multi" || config.kind === "rule") {
        const records = config.kind === "record"
          ? [["name", "Neo"], ["energy", sim.energy], ["position", `(${sim.x}, ${sim.y})`], ["carrying", sim.collected.size]]
          : config.kind === "multi"
            ? [["Neo", `位置 (${sim.x}, ${sim.y})`], ["维修工具", sim.expanded ? "正在同步" : "待命"], ["中继站", sim.completed ? "已接收" : "等待上传"]]
            : [["grass", "消耗 1"], ["sand", "消耗 1"], ["water", "不可通行"], ["hazard", "额外消耗 4"]];
        dom.advancedLearningContent.innerHTML = `
          ${choicesMarkup}
          <div class="record-inspector">${records.map(([key, value]) => `<div class="${selectedChoice === key ? "is-selected" : ""}"><code>${key}</code><strong>${value}</strong></div>`).join("")}</div>
          ${evidenceMarkup()}
        `;
        return;
      }

      if (config.kind === "matrix" || config.kind === "designer" || config.kind === "visited") {
        const visited = new Set(sim.path.map((point) => tileKey(point.x, point.y)));
        dom.advancedLearningContent.innerHTML = `
          ${choicesMarkup}
          <div class="data-matrix-mini" style="--matrix-columns:${sim.grid.width}" role="img" aria-label="本课二维地图数据">
            ${m.grid.flatMap((line, y) => [...line].map((tile, x) => {
              const isVisited = visited.has(tileKey(x, y));
              const type = tile === "_" ? "void" : tile === "#" ? "wall" : tile === "B" ? "beacon" : tile === "S" ? "start" : tile === "R" ? "relay" : tile === "H" ? "hazard" : "ground";
              return `<span class="is-${type}${isVisited ? " is-visited" : ""}" title="(${x}, ${y}) ${type}">${type === "start" ? "S" : type === "beacon" ? "B" : type === "relay" ? "R" : type === "wall" ? "#" : type === "hazard" ? "!" : ""}</span>`;
            })).join("")}
          </div>
          ${evidenceMarkup()}
        `;
        return;
      }

      if (config.kind === "timeline") {
        const beats = [["时刻 0", "Neo 准备", "工具移动中"], ["时刻 1", selectedChoice, selectedChoice === "等待 1 拍" ? "工具到位" : "尚未同步"], ["时刻 2", "开始行动", "协作状态检查"]];
        dom.advancedLearningContent.innerHTML = `${choicesMarkup}<ol class="sync-beat-list">${beats.map(([time, neo, tool], index) => `<li><span>${index}</span><strong>${time}</strong><small>Neo：${neo}</small><small>工具：${tool}</small></li>`).join("")}</ol>${evidenceMarkup()}`;
        return;
      }

      if (config.kind === "stack" || config.kind === "queue") {
        const trace = sim.path.slice(-8);
        const entries = trace.length ? trace : [sim.grid.start];
        dom.advancedLearningContent.innerHTML = `
          ${choicesMarkup}
          <div class="algorithm-trace ${config.kind === "queue" ? "is-queue" : "is-stack"}">${entries.map((point, index) => `<span><small>${config.kind === "queue" ? `层 ${index}` : `深度 ${index}`}</small><strong>(${point.x}, ${point.y})</strong></span>`).join("")}</div>
          ${evidenceMarkup()}
        `;
        return;
      }

      if (["cost", "counterexample", "enumeration", "cache", "test"].includes(config.kind)) {
        const tableRows = config.kind === "enumeration"
          ? [["A → B → C", "保留"], ["A → C → B", selectedChoice.includes("剪掉") ? "剪枝" : "保留"], ["B → A → C", "保留"], ["C → B → A", selectedChoice.includes("重复") ? "剪枝" : "保留"]]
          : config.kind === "cache"
            ? sim.path.slice(0, 6).map((point, index) => [`state ${index}`, `(${point.x}, ${point.y}), ${sim.collected.size}, ${Math.max(0, m.energy - index)}`])
            : config.kind === "test"
              ? options.map((option) => [option, option === selectedChoice ? (sim.completed ? "通过" : "当前测试") : "待测试"])
              : [["路线 A", selectedChoice.includes("能量") ? "能量 6" : "步数 6"], ["路线 B", selectedChoice.includes("风险") ? "风险低" : "步数 8"], ["当前选择", selectedChoice]];
        dom.advancedLearningContent.innerHTML = `
          ${choicesMarkup}
          <div class="analysis-table">${tableRows.map(([label, value]) => `<div><strong>${label}</strong><span>${value}</span></div>`).join("")}</div>
          ${evidenceMarkup()}
        `;
        return;
      }

      if (config.kind === "checklist" || config.kind === "release") {
        dom.advancedLearningContent.innerHTML = `${choicesMarkup}${evidenceMarkup()}`;
        return;
      }
    }

    dom.advancedToolTitle.textContent = m.studentOutput || "学习证据";
    dom.advancedToolState.textContent = sim.completed ? "已经通过运行验证" : "等待运行程序";
    dom.advancedLearningContent.innerHTML = `<p class="advanced-feedback">${m.classroomInteraction || m.deepExplanation || m.checkpoint}</p>`;
  }

  function codeForCommand(id) {
    if (id === "ifSensorAct") {
      const action = sensorTarget === "hazard" ? "shield();" : sensorTarget === "blocked" ? "turnRight();" : "move();";
      return `if (scanAhead() === "${sensorTarget}") ${action}`;
    }
    if (id === "logicGuard") {
      const connector = logicConnector === "and" ? "&&" : "||";
      const hazardExpression = logicHazardMode === "not-hazard" ? "!isHazardAhead()" : "isHazardAhead()";
      return `if (isClear() ${connector} enoughEnergy() ${connector} ${hazardExpression}) move(); else turnRight();`;
    }
    return commandDefs[id]?.code || id;
  }

  function renderCodeView() {
    const mainLines = program.length
      ? program.map((id) => `  ${codeForCommand(id)}`)
      : ["  // 选择指令"];
    const routeLines = routeProgram.length
      ? routeProgram.map((id) => `  ${codeForCommand(id)}`)
      : ["  // 添加函数动作"];

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
    const track = currentTrack();
    const items = currentMissions();
    if (dom.evidenceKicker) dom.evidenceKicker.textContent = track.evidenceKicker;
    if (dom.evidenceTitle) dom.evidenceTitle.textContent = track.evidenceTitle;
    const m = mission();

    if (isCourseTrack()) {
      const learned = String(m.learned || m.checkpoint || "")
        .replace(/^学生会知道[：:]\s*/, "")
        .replace(/^你会明白[：:]\s*/, "")
        .replace(/^你会知道[：:]\s*/, "")
        .replace(/^完成后你会明白[：:]\s*/, "");
      dom.evidenceCard.innerHTML = `
        <ul class="knowledge-chips">${(m.knowledge || [m.concept]).map((item) => `<li>${item}</li>`).join("")}</ul>
        <p class="lesson-takeaway"><strong>学完会：</strong>${learned}</p>
      `;
      return;
    }

    const allDone = items.every((item) => completed.has(item.id));
    if (!allDone) {
      const next = items.find((item) => !completed.has(item.id));
      dom.evidenceCard.innerHTML = `
        <div class="card-row">
          <strong>当前进度</strong>
          <p>${track.label}还有任务未完成。下一关：${next ? next.title : "继续调试"}。</p>
        </div>
        <div class="card-row">
          <strong>课堂产出</strong>
          <p>${next?.artifact || mission().artifact || "完成当前任务，并用日志说明调试证据。"}</p>
        </div>
      `;
      return;
    }

    dom.evidenceCard.innerHTML = `
      <div class="card-row">
        <strong>作品名</strong>
        <p>${track.completeTitle}</p>
      </div>
      <div class="card-row">
        <strong>核心代码能力</strong>
        <p>${track.completeSkill}</p>
      </div>
      <div class="card-row">
        <strong>最终验证</strong>
        <p>${track.completeValidation}</p>
      </div>
    `;
  }

  function isPythonStudioLesson(activeMission = mission()) {
    return currentTrackId === "course" && Boolean(activeMission?.pythonStudio);
  }

  function pythonStarterSource(activeMission = mission()) {
    return activeMission?.pythonStudio?.starterSource || "";
  }

  function pythonRouteConfig(activeMission = mission()) {
    const grid = parseGrid(activeMission.grid);
    const start = grid.start;
    const hazard = [...grid.hazards][0]?.split(",").map(Number) || [start.x + 2, start.y];
    const beacon = [...grid.beacons.values()][0] || { x: start.x + 4, y: start.y };
    return {
      start,
      hazardPosition: Math.max(1, hazard[0] - start.x),
      beaconPosition: Math.max(2, beacon.x - start.x),
      beaconKey: tileKey(beacon.x, beacon.y)
    };
  }

  function ensurePythonRuntime() {
    if (pythonRuntime) return pythonRuntime;
    if (!window.Sk || !window.CodeQuestPythonRuntime) {
      throw new Error("Python 运行器没有加载成功，请刷新页面后再试。");
    }
    const route = pythonRouteConfig();
    const activeMission = mission();
    const studio = activeMission.pythonStudio;
    pythonRuntime = window.CodeQuestPythonRuntime.create({
      Sk: window.Sk,
      initialEnergy: activeMission.energy,
      hazardPosition: route.hazardPosition,
      beaconPosition: route.beaconPosition,
      apiCallLimit: 160,
      allowedFunctions: new Set(studio.allowedFunctions || []),
      objectModel: Boolean(studio.objectModel),
      multiObject: Boolean(studio.multiObject),
      languageFeatures: studio.languageFeatures || [],
      world: {
        grid: activeMission.grid,
        start: route.start,
        startDir: activeMission.startDir,
        required: activeMission.required
      }
    });
    return pythonRuntime;
  }

  function pythonDirection(state) {
    if (state?.directionName && directions.includes(state.directionName)) return state.directionName;
    return ["E", "S", "W", "N"][Number(state?.direction) || 0] || "E";
  }

  function pythonAnimationDuration(type) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 20;
    if (type === "fall") return 640;
    if (type === "hazard-fail") return 560;
    if (type === "collision-fail") return 360;
    if (type === "move") return 400;
    if (type === "turn") return 280;
    return 180;
  }

  function waitForPythonAnimation(duration) {
    return new Promise((resolve) => window.setTimeout(resolve, duration + 40));
  }

  function updatePythonLineNumbers() {
    if (!dom.pythonEditor || !dom.pythonLineNumbers) return;
    const count = Math.max(1, dom.pythonEditor.value.split("\n").length);
    dom.pythonLineNumbers.innerHTML = Array.from({ length: count }, (_, index) => `<span>${index + 1}</span>`).join("");
    updatePythonEditTarget();
    syncPythonEditorScroll();
  }

  function findSourceOccurrence(source, search, occurrence = 1) {
    let fromIndex = 0;
    let foundIndex = -1;
    for (let count = 0; count < occurrence; count += 1) {
      foundIndex = source.indexOf(search, fromIndex);
      if (foundIndex < 0) return -1;
      fromIndex = foundIndex + search.length;
    }
    return foundIndex;
  }

  function pendingPythonTarget() {
    const source = dom.pythonEditor?.value || "";
    const targets = mission().pythonStudio?.targets || [];
    for (const target of targets) {
      const index = findSourceOccurrence(source, target.search, Number(target.occurrence || 1));
      if (index >= 0) {
        return {
          ...target,
          index,
          line: source.slice(0, index).split("\n").length
        };
      }
    }
    return null;
  }

  function updatePythonEditTarget() {
    if (!dom.pythonEditor || !dom.pythonEditTarget || !dom.pythonLineNumbers) return;
    const studio = mission().pythonStudio;
    const target = pendingPythonTarget();
    const pendingCount = (studio?.targets || []).filter((item) => {
      return findSourceOccurrence(dom.pythonEditor.value, item.search, Number(item.occurrence || 1)) >= 0;
    }).length;
    dom.pythonEditTarget.hidden = !target;
    if (target) dom.pythonEditTarget.style.top = `${16 + ((target.line - 1) * 26)}px`;
    [...dom.pythonLineNumbers.children].forEach((item, index) => {
      item.classList.toggle("is-edit-target", Boolean(target) && index + 1 === target.line);
    });
    (mission().pythonStudio?.templates || []).forEach((template) => {
      const button = dom.pythonTemplateList?.querySelector(`[data-python-template="${template.id}"]`);
      if (!button || !template.replaceFrom) return;
      const stillPending = findSourceOccurrence(dom.pythonEditor.value, template.replaceFrom, Number(template.replaceOccurrence || 1)) >= 0;
      const isCurrent = Boolean(target)
        && target.search === template.replaceFrom
        && Number(target.occurrence || 1) === Number(template.replaceOccurrence || 1);
      button.classList.toggle("is-complete", !stillPending);
      button.classList.toggle("is-current-target", isCurrent);
      if (template.guided) button.disabled = !isCurrent;
    });
    if (dom.pythonLineHighlight.hidden) {
      dom.pythonLineState.textContent = target ? `第 ${target.line} 行等待你动手` : "代码已补全 · 可以运行验证";
    }
    dom.pythonTaskBadge.textContent = target
      ? (studio.targets.length > 1 ? `还需补全 ${pendingCount} 处` : studio.taskBadge)
      : "可以运行验证";
    dom.pythonTemplateEyebrow.textContent = target
      ? (studio.targets.length > 1 ? `接下来处理第 ${target.line} 行` : studio.railEyebrow)
      : "本课编写位置已完成";
  }

  function syncPythonEditorScroll() {
    if (!dom.pythonEditor || !dom.pythonLineNumbers || !dom.pythonLineHighlight) return;
    dom.pythonLineNumbers.style.transform = `translateY(${-dom.pythonEditor.scrollTop}px)`;
    if (!dom.pythonLineHighlight.hidden) {
      const lineHeight = 26;
      dom.pythonLineHighlight.style.top = `${16 + ((pythonCurrentLine - 1) * lineHeight) - dom.pythonEditor.scrollTop}px`;
    }
  }

  function highlightPythonLine(line) {
    pythonCurrentLine = Math.max(1, Number(line) || 1);
    dom.pythonLineHighlight.hidden = false;
    dom.pythonLineState.textContent = `正在执行第 ${pythonCurrentLine} 行`;
    syncPythonEditorScroll();
    [...dom.pythonLineNumbers.children].forEach((item, index) => {
      item.classList.toggle("is-active", index + 1 === pythonCurrentLine);
    });
  }

  function clearPythonLineHighlight() {
    if (!dom.pythonLineHighlight) return;
    dom.pythonLineHighlight.hidden = true;
    [...dom.pythonLineNumbers.children].forEach((item) => item.classList.remove("is-active"));
    updatePythonEditTarget();
  }

  function setPythonFeedback(kind, title, message) {
    dom.pythonFeedbackKind.textContent = title;
    dom.pythonFeedbackMessage.textContent = message;
    dom.pythonFeedbackMessage.dataset.kind = kind;
  }

  function appendPythonLog(message) {
    const item = document.createElement("li");
    item.textContent = message;
    dom.pythonExecutionLog.append(item);
    dom.pythonExecutionLog.scrollTop = dom.pythonExecutionLog.scrollHeight;
  }

  function renderPythonStatePanel(state = null) {
    if (!dom.pythonStatePanel || !dom.pythonStateList) return;
    const config = mission().pythonStudio?.statePanel;
    dom.pythonStatePanel.hidden = !config;
    if (!config) {
      dom.pythonStateList.innerHTML = "";
      return;
    }
    dom.pythonStateTitle.textContent = config.title || "运行状态";
    dom.pythonStateDescription.textContent = config.description || "状态来自学生代码的实际运行结果。";
    const variableRows = (config.variables || []).map((item) => {
      const hasValue = Object.prototype.hasOwnProperty.call(state?.variables || {}, item.name);
      const value = hasValue ? state.variables[item.name] : item.initial;
      const reachedTarget = hasValue && item.target !== undefined && value === item.target;
      const targetText = item.target === undefined
        ? "等待运行"
        : reachedTarget ? `目标 ${item.target} 已达到` : `目标 ${item.target}`;
      return `
        <div class="python-state-item${reachedTarget ? " is-target" : ""}">
          <span>
            <strong>${item.label || item.name}</strong>
            <code>${item.name}</code>
          </span>
          <b>${String(value)}</b>
          <small>${targetText}</small>
        </div>
      `;
    });
    const objectRows = (config.objects || []).map((item) => {
      const objectState = state?.objects?.[item.name];
      const typeMatches = !item.expectedType || objectState?.type === item.expectedType;
      const energyMatches = item.targetEnergy === undefined || objectState?.energy === item.targetEnergy;
      const componentsMatch = item.expectedComponents === undefined
        || JSON.stringify(objectState?.components) === JSON.stringify(item.expectedComponents);
      const positionMatches = item.targetPosition === undefined
        || JSON.stringify([objectState?.x, objectState?.y]) === JSON.stringify(item.targetPosition);
      const waitsMatch = item.targetWaits === undefined || objectState?.waits === item.targetWaits;
      const reachedTarget = Boolean(objectState) && typeMatches && energyMatches && componentsMatch && positionMatches && waitsMatch;
      const summary = objectState
        ? objectState.components
          ? `${objectState.type} · ${objectState.components.join(" + ")}${item.showPosition ? ` · (${objectState.x}, ${objectState.y})` : ""}`
          : `${objectState.type}${item.showPosition ? ` · (${objectState.x}, ${objectState.y})` : ""} · 能量 ${objectState.energy}`
        : "尚未创建";
      const targetParts = [
        item.expectedType,
        item.expectedComponents ? item.expectedComponents.join(" + ") : null,
        item.targetPosition ? `位置 (${item.targetPosition.join(", ")})` : null,
        item.targetWaits === undefined ? null : `等待 ${item.targetWaits}`,
        item.targetEnergy === undefined ? null : `能量 ${item.targetEnergy}`
      ].filter(Boolean);
      const targetText = reachedTarget
        ? `目标已达到 · ${targetParts.join(" · ")}`
        : `目标 · ${targetParts.join(" · ")}`;
      return `
        <div class="python-state-item python-object-state${reachedTarget ? " is-target" : ""}">
          <span>
            <strong>${item.label || item.name}</strong>
            <code>${item.name}</code>
          </span>
          <b>${summary}</b>
          <small>${targetText}</small>
        </div>
      `;
    });
    const functionRows = (config.functions || []).map((item) => {
      const functionState = state?.functions?.[item.name];
      const callValues = (functionState?.calls || []).map((call) => {
        const values = Object.values(call || {});
        if (!values.length) return null;
        return values.length === 1 ? values[0] : values;
      });
      const returns = functionState?.returns || [];
      const callsMatch = item.targetCalls === undefined
        || JSON.stringify(callValues) === JSON.stringify(item.targetCalls);
      const returnsMatch = item.targetReturns === undefined
        || JSON.stringify(returns) === JSON.stringify(item.targetReturns);
      const reachedTarget = Boolean(functionState) && callsMatch && returnsMatch;
      const summaryParts = [];
      if (callValues.length) summaryParts.push(`调用 ${callValues.map((value) => value === null ? "无参数" : JSON.stringify(value)).join(" → ")}`);
      if (returns.length) summaryParts.push(`返回 ${returns.map((value) => JSON.stringify(value)).join(" → ")}`);
      const targetParts = [];
      if (item.targetCalls !== undefined) targetParts.push(`调用 ${item.targetCalls.map((value) => JSON.stringify(value)).join(" → ")}`);
      if (item.targetReturns !== undefined) targetParts.push(`返回 ${item.targetReturns.map((value) => JSON.stringify(value)).join(" → ")}`);
      return `
        <div class="python-state-item python-function-state${reachedTarget ? " is-target" : ""}">
          <span>
            <strong>${item.label || item.name}</strong>
            <code>${item.name}()</code>
          </span>
          <b>${summaryParts.join(" · ") || "尚未调用"}</b>
          <small>${reachedTarget ? "目标已达到" : `目标 · ${targetParts.join(" · ")}`}</small>
        </div>
      `;
    });
    const collectionRows = (config.collections || []).map((item) => {
      const hasValue = Object.prototype.hasOwnProperty.call(state?.variables || {}, item.name);
      const value = hasValue ? state.variables[item.name] : null;
      const reachedTarget = hasValue && JSON.stringify(value) === JSON.stringify(item.target);
      return `
        <div class="python-state-item python-collection-state${reachedTarget ? " is-target" : ""}">
          <span>
            <strong>${item.label || item.name}</strong>
            <code>${item.name}</code>
          </span>
          <b>${hasValue ? JSON.stringify(value) : "尚未创建"}</b>
          <small>${reachedTarget ? "目标已达到" : `目标 · ${JSON.stringify(item.target)}`}</small>
        </div>
      `;
    });
    const worldRows = (config.worlds || []).map((item) => {
      const grid = state?.worldBuild?.grid;
      const portals = state?.worldBuild?.portals || [];
      const placements = state?.worldBuild?.placements || [];
      const gridMatches = !item.targetGrid || JSON.stringify(grid) === JSON.stringify(item.targetGrid);
      const portalMatches = item.targetPortals === undefined || portals.length === item.targetPortals;
      const placementMatches = item.targetPlacements === undefined || placements.length === item.targetPlacements;
      const reachedTarget = Array.isArray(grid) && gridMatches && portalMatches && placementMatches;
      const summary = Array.isArray(grid)
        ? `${grid[0]?.length || 0} × ${grid.length} · 放置 ${placements.length} · 传送门 ${portals.length}`
        : "尚未生成";
      return `
        <div class="python-state-item python-world-state${reachedTarget ? " is-target" : ""}">
          <span>
            <strong>${item.label || "代码世界"}</strong>
            <code>${item.name || "world"}</code>
          </span>
          <b>${summary}</b>
          <small>${reachedTarget ? "目标已达到" : item.targetText || "等待世界数据"}</small>
          ${Array.isArray(grid) ? `<pre aria-label="世界字符蓝图">${grid.join("\n")}</pre>` : ""}
        </div>
      `;
    });
    dom.pythonStateList.innerHTML = [...variableRows, ...objectRows, ...worldRows, ...collectionRows, ...functionRows].join("");
  }

  function updatePythonEvidenceDisplay() {
    if (!dom.pythonEvidenceRow) return;
    const verified = Boolean(pythonEvidence.lastSuccessful);
    dom.pythonEvidenceRow.classList.toggle("is-verified", verified);
    dom.pythonEvidenceRow.firstElementChild.textContent = verified ? "✓" : "◇";
    dom.pythonEvidenceState.textContent = verified
      ? `已保存成功代码 · ${Number(pythonEvidence.attempts || 1)} 次运行`
      : "等待独立运行成功";
    if (verified && !pythonPlaying) {
      dom.pythonSaveState.dataset.state = "verified";
      dom.pythonSaveState.textContent = "成功代码已保存";
    }
  }

  function schedulePythonDraftSave() {
    if (!dom.pythonEditor) return;
    window.clearTimeout(pythonSaveTimer);
    dom.pythonSaveState.dataset.state = "saving";
    dom.pythonSaveState.textContent = "正在保存草稿…";
    pythonSaveTimer = window.setTimeout(() => {
      savePythonEvidence({ draft: dom.pythonEditor.value });
      dom.pythonSaveState.dataset.state = "saved";
      dom.pythonSaveState.textContent = "草稿已保存";
    }, 320);
  }

  function resetPythonWorld({ keepFeedback = false } = {}) {
    pythonPlaybackToken += 1;
    pythonPlaying = false;
    pythonPlannedEvents = [];
    pythonPlaybackIndex = 0;
    pythonPendingError = null;
    resetSimulation();
    sim.message = "准备运行 Python";
    dom.pythonStopBtn.disabled = true;
    dom.pythonRunBtn.disabled = false;
    dom.pythonStepBtn.disabled = false;
    dom.pythonExecutionLog.innerHTML = "";
    clearPythonLineHighlight();
    if (!keepFeedback) {
      setPythonFeedback(
        "normal",
        "等待运行",
        mission().pythonStudio?.initialFeedback || "先运行错误程序，看看它为什么会停在危险格。"
      );
    }
  }

  function renderPythonReference(template) {
    const content = `
      ${template.label ? `<strong>${template.label}</strong>` : ""}
      <code>${template.code}</code>
      <small>${template.help}</small>
    `;
    if (template.referenceOnly) {
      return `<div class="python-reference-card">${content}</div>`;
    }
    const classes = [
      template.recommended ? "is-recommended" : "",
      template.block ? "is-code-block" : ""
    ].filter(Boolean).join(" ");
    return `
      <button class="${classes}" type="button" data-python-template="${template.id}">
        ${content}
      </button>
    `;
  }

  function initializePythonLesson() {
    const activeMission = mission();
    if (!isPythonStudioLesson(activeMission) || pythonInitializedLessonId === activeMission.id) return;
    pythonInitializedLessonId = activeMission.id;
    pythonEvidence = loadPythonEvidence(activeMission.id);
    pythonRuntime = null;
    const studio = activeMission.pythonStudio;
    dom.pythonStudioKicker.textContent = studio.kicker;
    dom.pythonStudioTitle.textContent = studio.title;
    dom.pythonEditor.readOnly = Boolean(studio.clickToBuild);
    dom.pythonEditor.classList.toggle("is-click-build", Boolean(studio.clickToBuild));
    dom.pythonEditor.setAttribute("aria-label", `${activeMission.lesson} ${studio.clickToBuild ? "Python 代码组合结果" : "Python 代码编辑器"}`);
    dom.pythonTaskBadge.textContent = studio.taskBadge;
    dom.pythonTaskText.innerHTML = studio.taskHtml;
    dom.pythonTemplateEyebrow.textContent = studio.railEyebrow;
    dom.pythonTemplateTitle.textContent = studio.railTitle;
    dom.pythonTemplateList.innerHTML = (studio.templates || []).map(renderPythonReference).join("");
    dom.pythonTemplateList.classList.toggle("has-sequence", (studio.templates || []).filter((template) => template.recommended || template.guided).length > 1);
    dom.pythonTranslationHelp.innerHTML = (studio.translations || []).map(([code, translation]) => `<span><code>${code}</code> ${translation}</span>`).join("");
    const starterVersionMatches = !studio.starterVersion || pythonEvidence.starterVersion === studio.starterVersion;
    const restoredDraft = starterVersionMatches && typeof pythonEvidence.draft === "string" && pythonEvidence.draft.trim();
    const source = restoredDraft
      ? pythonEvidence.draft
      : pythonStarterSource();
    dom.pythonEditor.value = source;
    renderPythonStatePanel();
    if (studio.starterVersion && !starterVersionMatches) {
      savePythonEvidence({
        draft: source,
        starterVersion: studio.starterVersion,
        lastOutcome: "starter-upgraded"
      });
    }
    updatePythonLineNumbers();
    resetPythonWorld();
    try {
      ensurePythonRuntime();
      dom.pythonSaveState.dataset.state = "saved";
      dom.pythonSaveState.textContent = restoredDraft ? "已恢复上次草稿" : "起始程序已载入";
    } catch (error) {
      setPythonFeedback("error", "运行器未就绪", error.message);
      dom.pythonRunBtn.disabled = true;
      dom.pythonStepBtn.disabled = true;
    }
    updatePythonEvidenceDisplay();
  }

  function renderPythonStudio() {
    if (!dom.pythonLessonStudio) return;
    const active = isPythonStudioLesson() && (!isCourseTrack() || courseView === "lesson");
    dom.pythonLessonStudio.hidden = !active;
    dom.operationPanel.hidden = active;
    dom.standardLogPanel.hidden = active;
    if (active) initializePythonLesson();
  }

  async function compilePythonStudentProgram() {
    const runtime = ensurePythonRuntime();
    const source = dom.pythonEditor.value;
    pythonCurrentSource = source;
    pythonPlannedEvents = [];
    pythonFinalState = null;
    pythonPlaybackIndex = 0;
    clearPythonLineHighlight();
    dom.pythonExecutionLog.innerHTML = "";
    savePythonEvidence({
      draft: source,
      attempts: Number(pythonEvidence.attempts || 0) + 1,
      lastRunAt: new Date().toISOString()
    });
    try {
      const result = await runtime.compile(source);
      pythonPlannedEvents = result.events;
      pythonFinalState = result.finalState;
      return pythonPlannedEvents;
    } catch (error) {
      pythonPlannedEvents = Array.isArray(error.partialEvents) ? error.partialEvents : [];
      pythonFinalState = error.partialState || pythonPlannedEvents.at(-1)?.state || null;
      throw error;
    }
  }

  function showPythonExecutionError(error, afterPlayback) {
    const line = Number(error.studentLine) || 1;
    const category = error.category === "syntax" ? "语法错误" : "运行错误";
    const message = window.CodeQuestPythonRuntime.friendlyErrorMessage(error);
    const editTarget = pendingPythonTarget();
    const feedbackMessage = editTarget
      ? `${message} 请处理第 ${editTarget.line} 行：${editTarget.hint}。`
      : message;
    highlightPythonLine(line);
    setPythonFeedback("error", `${category} · 第 ${line} 行`, feedbackMessage);
    dom.pythonLineState.textContent = editTarget ? `停在第 ${line} 行 · 请处理第 ${editTarget.line} 行` : `停在第 ${line} 行`;
    sim.failed = true;
    sim.completed = false;
    const playbackType = pythonPlannedEvents.at(-1)?.type;
    sim.failureType = ["fall", "hazard-fail", "collision-fail"].includes(playbackType) ? playbackType : "action-fail";
    sim.failureMessage = message;
    if (!afterPlayback) startMotion(failureMotion(sim.failureType));
    sim.message = afterPlayback ? `程序停在第 ${line} 行` : `第 ${line} 行没有通过检查`;
    if (!afterPlayback) {
      appendPythonLog(`第 ${line} 行没有执行：${message}`);
    } else if (pythonPlannedEvents.at(-1)?.type === "fall") {
      appendPythonLog(`第 ${line} 行停止：探测员跌出通道。`);
    } else if (pythonPlannedEvents.at(-1)?.type === "hazard-fail") {
      appendPythonLog(`第 ${line} 行停止：探测员在危险格停机。`);
    } else {
      appendPythonLog(`第 ${line} 行停止：${message}`);
    }
    savePythonEvidence({ lastOutcome: "error", lastErrorLine: line, lastError: message });
    pythonPlaying = false;
    dom.pythonStopBtn.disabled = true;
    dom.pythonRunBtn.disabled = false;
    dom.pythonStepBtn.disabled = false;
    render();
  }

  async function preparePythonPlayback() {
    resetPythonWorld({ keepFeedback: true });
    setPythonFeedback("normal", "正在检查", "正在读取你写的 Python…");
    render();
    try {
      const events = await compilePythonStudentProgram();
      if (!events.length) {
        const target = pendingPythonTarget();
        const message = target
          ? `请先完成第 ${target.line} 行：${target.hint}。`
          : "代码可以运行，但没有产生任何游戏动作。";
        throw window.CodeQuestPythonRuntime.createStudentError(message, target?.line || 1, "runtime");
      }
      setPythonFeedback("normal", "检查通过", "代码可以运行。现在观察每一行怎样改变左侧世界。");
      return true;
    } catch (error) {
      if (pythonPlannedEvents.length) {
        pythonPendingError = error;
        const line = Number(error.studentLine) || 1;
        setPythonFeedback("normal", `发现问题 · 第 ${line} 行`, "先回放错误之前的动作，再停在真正出错的位置。");
        return true;
      }
      showPythonExecutionError(error, false);
      return false;
    }
  }

  async function applyPythonEvent(event) {
    const route = pythonRouteConfig();
    const previous = { x: sim.x, y: sim.y, dir: sim.dir };
    const nextDir = pythonDirection(event.state);
    const next = Number.isFinite(event.state.x) && Number.isFinite(event.state.y)
      ? { x: event.state.x, y: event.state.y }
      : { x: route.start.x + Number(event.state.position || 0), y: route.start.y };
    const duration = pythonAnimationDuration(event.type);

    highlightPythonLine(event.line);
    sim.failurePose = null;
    if (Array.isArray(event.state?.worldBuild?.grid)) {
      sim.grid = parseGrid(event.state.worldBuild.grid);
    }
    sim.dir = nextDir;
    sim.energy = event.state.energy;
    sim.shield = event.state.shieldActive ? 1 : 0;
    if (Array.isArray(event.state.collectedKeys)) {
      sim.collected = new Set(event.state.collectedKeys);
    } else if (event.state.collected) {
      sim.collected.add(route.beaconKey);
    }
    pythonUploaded = Boolean(event.state.uploaded);
    renderPythonStatePanel(event.state);

    if (["fall", "hazard-fail", "collision-fail"].includes(event.type)) {
      sim.failureType = event.type;
      sim.failureMessage = event.message;
    }

    if (event.type === "fall") {
      const vector = vectors[nextDir];
      startMotion({
        type: "fall",
        fromX: previous.x,
        fromY: previous.y,
        toX: previous.x + vector.x,
        toY: previous.y + vector.y,
        fromDir: previous.dir,
        toDir: nextDir,
        duration
      });
    } else if (event.type === "hazard-fail") {
      sim.x = next.x;
      sim.y = next.y;
      if (!sim.path.some((point) => point.x === next.x && point.y === next.y)) sim.path.push({ ...next });
      startMotion({
        type: "hazard-fail",
        fromX: previous.x,
        fromY: previous.y,
        toX: next.x,
        toY: next.y,
        fromDir: previous.dir,
        toDir: nextDir,
        duration
      });
    } else if (event.type === "collision-fail") {
      const vector = vectors[nextDir];
      startMotion({
        type: "collision-fail",
        fromX: previous.x,
        fromY: previous.y,
        toX: previous.x + vector.x,
        toY: previous.y + vector.y,
        fromDir: previous.dir,
        toDir: nextDir,
        duration
      });
    } else {
      sim.x = next.x;
      sim.y = next.y;
      if (event.type === "move") {
        sim.path.push({ ...next });
        startMotion({
          type: "move",
          fromX: previous.x,
          fromY: previous.y,
          toX: next.x,
          toY: next.y,
          fromDir: previous.dir,
          toDir: nextDir,
          duration
        });
      } else if (event.type === "turn") {
        startMotion({
          type: "turn",
          fromX: next.x,
          fromY: next.y,
          toX: next.x,
          toY: next.y,
          fromDir: previous.dir,
          toDir: nextDir,
          duration
        });
      }
    }

    sim.message = event.type === "condition" ? "正在判断条件" : event.message;
    sim.logs.unshift({ message: event.message, type: event.type.includes("fail") || event.type === "fall" ? "error" : "normal" });
    sim.logs = sim.logs.slice(0, 8);
    appendPythonLog(event.message);
    render();
    await waitForPythonAnimation(duration);
  }

  async function finishPythonPlayback() {
    pythonPlaying = false;
    dom.pythonStopBtn.disabled = true;
    dom.pythonRunBtn.disabled = false;
    dom.pythonStepBtn.disabled = false;
    if (pythonPendingError) {
      const error = pythonPendingError;
      pythonPendingError = null;
      showPythonExecutionError(error, true);
      return;
    }

    const minimumEnergy = Number(mission().minEnergy || 0);
    const needsUpload = Boolean(sim.grid.relay);
    const objectiveComplete = sim.collected.size >= mission().required && (!needsUpload || pythonUploaded);
    const sourceWithoutComments = dom.pythonEditor.value.replace(/#.*$/gm, "");
    const conceptFailures = (mission().pythonStudio?.conceptChecks || []).filter((check) => {
      const matches = sourceWithoutComments.match(new RegExp(check.pattern, "g")) || [];
      return matches.length < Number(check.min || 1);
    });
    const stateFailures = (mission().pythonStudio?.stateChecks || []).filter((check) => {
      if (check.kind === "variable") {
        return pythonFinalState?.variables?.[check.name] !== check.equals;
      }
      if (check.kind === "object") {
        const objectState = pythonFinalState?.objects?.[check.name];
        if (!objectState) return true;
        return JSON.stringify(objectState?.[check.property]) !== JSON.stringify(check.equals);
      }
      if (check.kind === "object-action") {
        return !pythonPlannedEvents.some((event) => {
          return event.object?.name === check.name
            && event.object?.type === check.type
            && event.object?.action === check.action;
        });
      }
      if (check.kind === "function-call") {
        return !pythonPlannedEvents.some((event) => {
          if (event.functionCall?.name !== check.name) return false;
          if (!check.arguments) return true;
          return JSON.stringify(event.functionCall.arguments) === JSON.stringify(check.arguments);
        });
      }
      if (check.kind === "function-return") {
        return !pythonPlannedEvents.some((event) => {
          return event.functionReturn?.name === check.name
            && event.functionReturn?.value === check.equals;
        });
      }
      if (check.kind === "collection") {
        return JSON.stringify(pythonFinalState?.variables?.[check.name]) !== JSON.stringify(check.equals);
      }
      if (check.kind === "world-grid") {
        return JSON.stringify(pythonFinalState?.worldBuild?.grid) !== JSON.stringify(check.equals);
      }
      if (check.kind === "world-portals") {
        return (pythonFinalState?.worldBuild?.portals || []).length !== check.equals;
      }
      if (check.kind === "world-placements") {
        return (pythonFinalState?.worldBuild?.placements || []).length !== check.equals;
      }
      if (check.kind === "world-schema") {
        const schema = pythonFinalState?.worldBuild?.schema;
        if (!pythonFinalState?.worldBuild?.schemaValidated || !schema) return true;
        return check.property ? JSON.stringify(schema[check.property]) !== JSON.stringify(check.equals) : false;
      }
      return false;
    });
    const learningFailure = conceptFailures[0] || stateFailures[0];
    if (objectiveComplete && sim.energy >= minimumEnergy && learningFailure) {
      sim.failed = true;
      sim.failureType = "action-fail";
      sim.failureMessage = learningFailure.message;
      startMotion(failureMotion("action-fail"));
      sim.message = "路线完成，但本课代码目标还没完成";
      setPythonFeedback("error", "还差一个代码要求", `${learningFailure.message}。请修改后再运行一次。`);
      savePythonEvidence({ lastOutcome: "concept-incomplete" });
    } else if (objectiveComplete && sim.energy >= minimumEnergy) {
      const verifiedAt = new Date().toISOString();
      savePythonEvidence({
        draft: dom.pythonEditor.value,
        lastSuccessful: dom.pythonEditor.value,
        lastSuccessfulState: {
          variables: { ...(pythonFinalState?.variables || {}) },
          objects: { ...(pythonFinalState?.objects || {}) },
          functions: { ...(pythonFinalState?.functions || {}) },
          worldBuild: { ...(pythonFinalState?.worldBuild || {}) }
        },
        lastOutcome: "success",
        verifiedAt
      });
      complete(`Python 程序运行成功：${mission().studentOutput || "本课任务"}已经通过验证。`);
      setPythonFeedback("success", "挑战完成", `你的 Python 已经完成“${mission().title}”，成功代码和运行证据都已保存。`);
      dom.pythonLineState.textContent = "全部运行完成";
      updatePythonEvidenceDisplay();
    } else {
      sim.failed = true;
      sim.failureType = sim.energy < minimumEnergy ? "power-fail" : "action-fail";
      sim.failureMessage = sim.energy < minimumEnergy
        ? `本关至少要保留 ${minimumEnergy} 点能量。`
        : needsUpload && !pythonUploaded
          ? "还没有在中继站完成上传。"
          : "还没有采集全部信标。";
      startMotion(failureMotion(sim.failureType));
      sim.message = "程序结束，但任务没有完成";
      setPythonFeedback("error", "任务还没完成", sim.energy < minimumEnergy
        ? `已经采集信标，但只剩 ${sim.energy} 点能量；本关至少要保留 ${minimumEnergy} 点。`
        : needsUpload && !pythonUploaded
          ? "程序已经结束，但还没有在中继站完成 upload()。检查第二个停止条件和最终位置。"
          : "程序已经结束，但还没有采集全部信标。检查停止条件、位置和 collect()。"
      );
      savePythonEvidence({ lastOutcome: "incomplete" });
    }
    render();
  }

  async function runPythonProgram() {
    if (!isPythonStudioLesson() || pythonPlaying) return;
    const ready = await preparePythonPlayback();
    if (!ready) return;
    const token = ++pythonPlaybackToken;
    pythonPlaying = true;
    dom.pythonStopBtn.disabled = false;
    dom.pythonRunBtn.disabled = true;
    dom.pythonStepBtn.disabled = true;
    sim.message = "正在运行 Python";
    render();

    while (pythonPlaybackIndex < pythonPlannedEvents.length && token === pythonPlaybackToken) {
      await applyPythonEvent(pythonPlannedEvents[pythonPlaybackIndex]);
      pythonPlaybackIndex += 1;
    }
    if (token === pythonPlaybackToken) await finishPythonPlayback();
  }

  async function stepPythonProgram() {
    if (!isPythonStudioLesson() || pythonPlaying) return;
    if (pythonCurrentSource !== dom.pythonEditor.value || !pythonPlannedEvents.length || pythonPlaybackIndex >= pythonPlannedEvents.length) {
      const ready = await preparePythonPlayback();
      if (!ready) return;
    }
    pythonPlaying = true;
    dom.pythonStopBtn.disabled = false;
    dom.pythonRunBtn.disabled = true;
    dom.pythonStepBtn.disabled = true;
    await applyPythonEvent(pythonPlannedEvents[pythonPlaybackIndex]);
    pythonPlaybackIndex += 1;
    pythonPlaying = false;
    dom.pythonStopBtn.disabled = true;
    dom.pythonRunBtn.disabled = false;
    dom.pythonStepBtn.disabled = false;
    if (pythonPlaybackIndex >= pythonPlannedEvents.length) await finishPythonPlayback();
    else render();
  }

  function stopPythonProgram() {
    pythonPlaybackToken += 1;
    pythonPlaying = false;
    if (sim.motion) {
      sim.motion = null;
      sim.failurePose = null;
    }
    dom.pythonStopBtn.disabled = true;
    dom.pythonRunBtn.disabled = false;
    dom.pythonStepBtn.disabled = false;
    sim.message = "运行已暂停";
    setPythonFeedback("normal", "已经停止", "可以修改代码，再从头运行。程序草稿会自动保存。");
    render();
  }

  function resetPythonStarter() {
    stopPythonProgram();
    dom.pythonEditor.value = pythonStarterSource();
    pythonCurrentSource = "";
    pythonFinalState = null;
    updatePythonLineNumbers();
    savePythonEvidence({ draft: dom.pythonEditor.value, lastOutcome: "starter-restored" });
    resetPythonWorld();
    renderPythonStatePanel();
    dom.pythonSaveState.dataset.state = "saved";
    dom.pythonSaveState.textContent = "起始程序已恢复";
    render();
  }

  function insertPythonTemplate(name) {
    const editor = dom.pythonEditor;
    if (!editor) return;
    const template = mission().pythonStudio?.templates?.find((item) => item.id === name);
    if (!template) return;
    const source = editor.value;
    if (template.replaceFrom) {
      const start = findSourceOccurrence(source, template.replaceFrom, Number(template.replaceOccurrence || 1));
      if (start < 0) {
        setPythonFeedback("normal", "这处已经完成", "程序里已经找不到需要替换的旧代码了。继续处理下一处黄色标记，或运行验证。");
        return;
      }
      const replacement = template.replaceTo || template.snippet || "";
      editor.value = `${source.slice(0, start)}${replacement}${source.slice(start + template.replaceFrom.length)}`;
      editor.setSelectionRange(start, start + replacement.length);
    } else {
      const snippet = template.snippet;
      if (!snippet) return;
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const needsLeadingBreak = start > 0 && editor.value[start - 1] !== "\n";
      const needsTrailingBreak = end < editor.value.length && editor.value[end] !== "\n";
      const insertion = `${needsLeadingBreak ? "\n" : ""}${snippet}${needsTrailingBreak ? "\n" : ""}`;
      editor.setRangeText(insertion, start, end, "end");
    }
    editor.focus();
    editor.dispatchEvent(new Event("input"));
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
    if (grid.relay) {
      props.push({ depth: grid.relay.x + grid.relay.y + 0.15, draw: () => drawRelay(layout, grid.relay.x, grid.relay.y) });
    }

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

    const actor = canvasActorPose();
    props.push({ depth: actor.x + actor.y + 0.6, draw: () => drawBot(layout, actor.x, actor.y, actor.lift) });

    props.sort((a, b) => a.depth - b.depth).forEach((item) => item.draw());

    if (performance.now() < celebrationUntil) {
      drawCelebration(m.title);
    }
  }

  function canvasActorPose() {
    const failurePose = sim.failurePose;
    const base = {
      x: failurePose?.x ?? sim.x,
      y: failurePose?.y ?? sim.y,
      lift: failurePose?.lift || 0
    };
    const motion = sim.motion;
    if (!motion) return base;

    const progress = Math.min(1, Math.max(0, (performance.now() - motion.startedAt) / motion.duration));
    const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    const travel = motion.type === "collision-fail" ? Math.sin(progress * Math.PI) * 0.28 : eased;
    const x = motion.fromX + (motion.toX - motion.fromX) * travel;
    const y = motion.fromY + (motion.toY - motion.fromY) * travel;

    if (motion.type === "fall") return { x, y, lift: (Math.sin(progress * Math.PI) * 0.16) - (progress * progress * 2.4) };
    if (motion.type === "hazard-fail") return { x, y, lift: -Math.max(0, (progress - 0.58) / 0.42) * 0.42 };
    if (motion.type === "power-fail") return { x, y, lift: -(progress * 0.16) };
    if (motion.type === "action-fail") return { x: x + Math.sin(progress * Math.PI * 6) * (1 - progress) * 0.08, y, lift: 0 };
    return { x, y, lift: Math.sin(progress * Math.PI) * 0.06 };
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

  function drawBot(layout, x, y, lift = 0) {
    const c = tileCenter(layout, x, y, 0);
    const size = layout.tileW;
    ctx.save();
    ctx.translate(c.x, c.y - size * 0.38 - lift * size * 0.6);

    ctx.fillStyle = "rgba(73, 70, 58, 0.22)";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.44, size * 0.25, size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#8a5a34";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, size * 0.02);
    ctx.quadraticCurveTo(-size * 0.44, size * 0.06, -size * 0.42, size * 0.24);
    ctx.moveTo(size * 0.2, size * 0.02);
    ctx.quadraticCurveTo(size * 0.44, size * 0.06, size * 0.42, size * 0.24);
    ctx.stroke();

    ctx.fillStyle = "#55d5c8";
    ctx.beginPath();
    ctx.ellipse(-size * 0.43, size * 0.25, size * 0.07, size * 0.06, -0.2, 0, Math.PI * 2);
    ctx.ellipse(size * 0.43, size * 0.25, size * 0.07, size * 0.06, 0.2, 0, Math.PI * 2);
    ctx.fill();

    const body = ctx.createLinearGradient(-size * 0.18, -size * 0.24, size * 0.24, size * 0.34);
    body.addColorStop(0, "#ffe08a");
    body.addColorStop(0.55, "#ffc85f");
    body.addColorStop(1, "#efa244");
    ctx.fillStyle = body;
    ctx.strokeStyle = "#a86a2b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.08, size * 0.29, size * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#55d5c8";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.11, size * 0.23, size * 0.06, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ffc85f";
    ctx.strokeStyle = "#a86a2b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.33, size * 0.22, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#55d5c8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-size * 0.08, -size * 0.5);
    ctx.lineTo(-size * 0.12, -size * 0.65);
    ctx.moveTo(size * 0.08, -size * 0.5);
    ctx.lineTo(size * 0.12, -size * 0.65);
    ctx.stroke();
    ctx.fillStyle = "#ff8e95";
    ctx.beginPath();
    ctx.arc(-size * 0.12, -size * 0.67, size * 0.045, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#55d5c8";
    ctx.beginPath();
    ctx.arc(size * 0.12, -size * 0.67, size * 0.045, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff3cf";
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.32, size * 0.16, size * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();

    [-1, 1].forEach((side) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(side * size * 0.06, -size * 0.35, size * 0.045, size * 0.052, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#263747";
      ctx.beginPath();
      ctx.arc(side * size * 0.062, -size * 0.35, size * 0.021, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff8e95";
      ctx.beginPath();
      ctx.ellipse(side * size * 0.13, -size * 0.28, size * 0.035, size * 0.025, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#6c392c";
    ctx.fillRect(-size * 0.04, -size * 0.29, size * 0.08, size * 0.012);

    ctx.fillStyle = "#55d5c8";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.08, size * 0.045, size * 0.034, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8a5a34";
    ctx.beginPath();
    ctx.ellipse(-size * 0.12, size * 0.39, size * 0.1, size * 0.045, 0, 0, Math.PI * 2);
    ctx.ellipse(size * 0.12, size * 0.39, size * 0.1, size * 0.045, 0, 0, Math.PI * 2);
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
      || (grid.relay && grid.relay.x === x && grid.relay.y === y)
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
    const geometry = new THREE.SphereGeometry(0.34, 28, 16);
    geometry.scale(0.92, 1, 0.86);
    geometry.translate(0, 0.34, 0);
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
    let viewYaw = 0;
    let lastViewFrame = null;
    let viewRenderFrame = null;
    let dragState = null;

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
      robot: new THREE.MeshStandardMaterial({ color: 0xffc85f, roughness: 0.5, metalness: 0.02 }),
      robotDark: new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: 0.72 }),
      robotTrim: new THREE.MeshStandardMaterial({ color: 0x55d5c8, roughness: 0.36, metalness: 0.05, flatShading: true }),
      robotFace: new THREE.MeshBasicMaterial({ color: 0xfff3cf, side: THREE.DoubleSide }),
      robotEyeWhite: new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
      robotEye: new THREE.MeshBasicMaterial({ color: 0x263747, side: THREE.DoubleSide }),
      robotCheek: new THREE.MeshBasicMaterial({ color: 0xff8e95, side: THREE.DoubleSide }),
      robotMouth: new THREE.MeshBasicMaterial({ color: 0x6c392c, side: THREE.DoubleSide }),
      plant: new THREE.MeshStandardMaterial({ color: 0x3f8d2e, roughness: 0.8, flatShading: true }),
      plantLight: new THREE.MeshStandardMaterial({ color: 0x6faf3c, roughness: 0.78, flatShading: true }),
      trunk: new THREE.MeshStandardMaterial({ color: 0x9a642d, roughness: 0.78 }),
      shadow: new THREE.MeshBasicMaterial({ color: 0x47606b, transparent: true, opacity: 0.14, depthWrite: false }),
      backdropDirt: new THREE.MeshStandardMaterial({ color: 0x8a5128, roughness: 0.9, transparent: true, opacity: 0.28 }),
      backdropGrass: new THREE.MeshStandardMaterial({ color: 0x8cc957, roughness: 0.9, transparent: true, opacity: 0.28 }),
      backdropRock: new THREE.MeshStandardMaterial({ color: 0x9ba9b3, roughness: 0.84, flatShading: true, transparent: true, opacity: 0.28 }),
      compassNorth: new THREE.MeshPhysicalMaterial({ color: 0xff657f, roughness: 0.22, metalness: 0.1, clearcoat: 0.72, clearcoatRoughness: 0.2, emissive: 0x791027, emissiveIntensity: 0.2 }),
      compassNorthSide: new THREE.MeshStandardMaterial({ color: 0x792139, roughness: 0.34, metalness: 0.1 })
    };

    const northLabelMaterial = makeNorthLabelMaterial();

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
      robotHead: new THREE.SphereGeometry(0.22, 24, 14),
      robotFace: new THREE.CircleGeometry(0.16, 32),
      robotArm: new THREE.CylinderGeometry(0.035, 0.042, 0.34, 10),
      robotHand: new THREE.SphereGeometry(0.055, 12, 8),
      robotFoot: new THREE.SphereGeometry(0.075, 12, 8),
      robotEyeWhite: new THREE.CircleGeometry(0.043, 20),
      robotEye: new THREE.CircleGeometry(0.019, 16),
      robotCheek: new THREE.CircleGeometry(0.027, 16),
      robotMouth: new THREE.PlaneGeometry(0.068, 0.012),
      robotBadge: new THREE.CircleGeometry(0.046, 18),
      robotAntennaStem: new THREE.CylinderGeometry(0.014, 0.018, 0.17, 8),
      robotAntennaTip: new THREE.SphereGeometry(0.045, 12, 8),
      waterfall: makeRoundedSlabGeometry(0.36, 1.56, 0.052, 0.024, 0.006),
      cliffPlate: makeRoundedSlabGeometry(0.34, 0.045, 0.16, 0.03, 0.008),
      treeTop: new THREE.SphereGeometry(0.21, 9, 7),
      treeTrunk: new THREE.CylinderGeometry(0.045, 0.06, 0.32, 7),
      compassArrow: makeNorthTriangleGeometry()
    };
    const waterBaseGeometries = new Map();
    const surfaceY = 0.087;
    const cliffBottomY = -0.62;

    setupViewDrag();

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
      addWorldCompass(root, bounds, worldX, worldZ);

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
      if (grid.relay) {
        addPad(root, worldX(grid.relay.x), worldZ(grid.relay.y), "violet");
      }

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

      lastViewFrame = { bounds, spacing };
      frameCamera(bounds, spacing);
      renderer.render(scene, camera);
    }

    function setupViewDrag() {
      targetCanvas.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 && event.pointerType === "mouse") return;
        dragState = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startYaw: viewYaw
        };
        targetCanvas.classList.add("is-dragging");
        targetCanvas.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      });

      targetCanvas.addEventListener("pointermove", (event) => {
        if (!dragState || dragState.pointerId !== event.pointerId) return;
        viewYaw = normalizeRadians(dragState.startYaw + (event.clientX - dragState.startX) * 0.008);
        scheduleViewRender();
        event.preventDefault();
      });

      ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) => {
        targetCanvas.addEventListener(type, (event) => {
          if (!dragState || dragState.pointerId !== event.pointerId) return;
          dragState = null;
          targetCanvas.classList.remove("is-dragging");
        });
      });
    }

    function scheduleViewRender() {
      if (!lastViewFrame || viewRenderFrame) return;
      viewRenderFrame = window.requestAnimationFrame(() => {
        viewRenderFrame = null;
        resizeRenderer();
        frameCamera(lastViewFrame.bounds, lastViewFrame.spacing);
        renderer.render(scene, camera);
      });
    }

    function normalizeRadians(value) {
      const fullTurn = Math.PI * 2;
      return ((value % fullTurn) + fullTurn) % fullTurn;
    }

    function actorPose(simState, worldX, worldZ, directionIndex) {
      const failurePose = simState.failurePose;
      const base = {
        x: worldX(failurePose?.x ?? simState.x),
        z: worldZ(failurePose?.y ?? simState.y),
        rotation: angleForDirection(failurePose?.dir ?? simState.dir, directionIndex),
        lift: failurePose?.lift || 0
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

      if (motion.type === "fall") {
        return {
          x: lerp(worldX(motion.fromX), worldX(motion.toX), eased),
          z: lerp(worldZ(motion.fromY), worldZ(motion.toY), eased),
          rotation: toRotation + (progress * 1.1),
          lift: (Math.sin(progress * Math.PI) * 0.16) - (progress * progress * 2.4)
        };
      }

      if (motion.type === "hazard-fail") {
        const travel = Math.min(1, progress / 0.62);
        const sink = Math.max(0, (progress - 0.62) / 0.38);
        return {
          x: lerp(worldX(motion.fromX), worldX(motion.toX), easeInOut(travel)),
          z: lerp(worldZ(motion.fromY), worldZ(motion.toY), easeInOut(travel)),
          rotation: toRotation + (sink * 0.22),
          lift: (Math.sin(travel * Math.PI) * 0.06) - (sink * 0.42)
        };
      }

      if (motion.type === "hazard-hit") {
        const travel = Math.min(1, progress / 0.72);
        const stagger = Math.max(0, (progress - 0.72) / 0.28);
        return {
          x: lerp(worldX(motion.fromX), worldX(motion.toX), easeInOut(travel)) + Math.sin(stagger * Math.PI * 4) * 0.045,
          z: lerp(worldZ(motion.fromY), worldZ(motion.toY), easeInOut(travel)),
          rotation: toRotation + Math.sin(stagger * Math.PI * 3) * 0.08,
          lift: Math.sin(travel * Math.PI) * 0.06
        };
      }

      if (motion.type === "collision-fail") {
        const bump = Math.sin(progress * Math.PI) * 0.28;
        return {
          x: lerp(worldX(motion.fromX), worldX(motion.toX), bump),
          z: lerp(worldZ(motion.fromY), worldZ(motion.toY), bump),
          rotation: toRotation,
          lift: Math.sin(progress * Math.PI) * 0.025
        };
      }

      if (motion.type === "power-fail") {
        return {
          x: worldX(motion.fromX) + Math.sin(progress * Math.PI * 5) * (1 - progress) * 0.04,
          z: worldZ(motion.fromY),
          rotation: toRotation + Math.sin(progress * Math.PI * 3) * 0.08,
          lift: -(progress * 0.16)
        };
      }

      if (motion.type === "action-fail") {
        const shake = Math.sin(progress * Math.PI * 6) * (1 - progress) * 0.07;
        return {
          x: worldX(motion.fromX) + shake,
          z: worldZ(motion.fromY),
          rotation: toRotation - shake * 0.9,
          lift: Math.sin(progress * Math.PI) * 0.02
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
      const byDir = { N: Math.PI / 2, E: 0, S: -Math.PI / 2, W: Math.PI };
      if (dir && Object.hasOwn(byDir, dir)) return byDir[dir];
      return [Math.PI / 2, 0, -Math.PI / 2, Math.PI][fallbackIndex] || 0;
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
      const baseX = distance * 0.68;
      const baseZ = distance * 0.78;
      const yawCos = Math.cos(viewYaw);
      const yawSin = Math.sin(viewYaw);
      camera.position.set(
        baseX * yawCos - baseZ * yawSin,
        distance * 0.86,
        baseX * yawSin + baseZ * yawCos
      );
      camera.lookAt(0, aspect < 1.35 ? -0.34 : -0.26, 0);

      const cameraRange = camera.position.length();
      scene.fog.near = Math.max(0, cameraRange - span * 0.15);
      scene.fog.far = cameraRange + Math.max(14, span * 1.8);
    }

    function addWorldCompass(parent, bounds, worldX, worldZ) {
      const compass = new THREE.Group();
      compass.position.set(
        worldX(bounds.minX) - 1.02,
        surfaceY + 0.48,
        worldZ(bounds.minY) - 0.78
      );
      compass.scale.setScalar(1.1);

      const northArrow = new THREE.Mesh(geometry.compassArrow, [materials.compassNorth, materials.compassNorthSide]);
      northArrow.position.set(0, 0, 0);
      northArrow.castShadow = true;
      compass.add(northArrow);

      const northLabel = new THREE.Sprite(northLabelMaterial);
      northLabel.position.set(0, 0.19, -0.32);
      northLabel.scale.set(0.28, 0.28, 1);
      northLabel.renderOrder = 8;
      compass.add(northLabel);

      parent.add(compass);
    }

    function makeNorthTriangleGeometry() {
      const shape = new THREE.Shape();
      shape.moveTo(0, -0.25);
      shape.quadraticCurveTo(0.012, -0.24, 0.02, -0.218);
      shape.lineTo(0.128, 0.12);
      shape.quadraticCurveTo(0.14, 0.15, 0.105, 0.15);
      shape.lineTo(-0.105, 0.15);
      shape.quadraticCurveTo(-0.14, 0.15, -0.128, 0.12);
      shape.lineTo(-0.02, -0.218);
      shape.quadraticCurveTo(-0.012, -0.24, 0, -0.25);
      shape.closePath();
      const triangle = new THREE.ExtrudeGeometry(shape, {
        depth: 0.05,
        bevelEnabled: true,
        bevelSegments: 4,
        bevelSize: 0.012,
        bevelThickness: 0.009,
        curveSegments: 5
      });
      triangle.rotateX(Math.PI / 2);
      triangle.translate(0, 0.055, 0);
      triangle.computeVertexNormals();
      return triangle;
    }

    function makeNorthLabelMaterial() {
      const labelCanvas = document.createElement("canvas");
      labelCanvas.width = 128;
      labelCanvas.height = 128;
      const paint = labelCanvas.getContext("2d");
      paint.font = '900 82px "Segoe UI", Arial, sans-serif';
      paint.textAlign = "center";
      paint.textBaseline = "middle";
      paint.strokeStyle = "rgba(6, 24, 67, 0.94)";
      paint.lineWidth = 12;
      paint.lineJoin = "round";
      paint.strokeText("N", 64, 67);
      paint.fillStyle = "#fff7df";
      paint.fillText("N", 64, 67);

      const texture = new THREE.CanvasTexture(labelCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      return new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false });
    }

    function addBackdropIslands(parent, bounds, spacing) {
      const span = Math.max(bounds.maxX - bounds.minX + 1, bounds.maxY - bounds.minY + 1) * spacing;
      const placements = [
        [-span * 0.82, 1.6, -span * 0.9, 0.34],
        [span * 0.96, 1.9, -span * 1.04, 0.26]
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
      body.scale.set(0.92, 0.92, 0.92);
      body.castShadow = true;
      group.add(body);

      const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.018, 8, 34), materials.robotTrim);
      scarf.position.y = 0.63;
      scarf.rotation.x = Math.PI / 2;
      scarf.scale.set(1, 0.78, 1);
      group.add(scarf);

      const head = new THREE.Mesh(geometry.robotHead, materials.robot);
      head.position.set(0, 0.82, 0);
      head.scale.set(1, 0.96, 0.92);
      head.castShadow = true;
      group.add(head);

      const face = new THREE.Mesh(geometry.robotFace, materials.robotFace);
      face.position.set(0.226, 0.8, 0);
      face.rotation.y = Math.PI / 2;
      face.scale.set(1, 0.82, 1);
      group.add(face);

      const addFaceFeature = (mesh, y, z, x = 0.231) => {
        mesh.position.set(x, y, z);
        mesh.rotation.y = Math.PI / 2;
        group.add(mesh);
      };

      [-1, 1].forEach((side) => {
        const antenna = new THREE.Mesh(geometry.robotAntennaStem, materials.robotTrim);
        antenna.position.set(-0.02, 1.04, side * 0.105);
        antenna.rotation.x = side * 0.16;
        group.add(antenna);

        const tip = new THREE.Mesh(geometry.robotAntennaTip, side < 0 ? materials.robotCheek : materials.robotTrim);
        tip.position.set(-0.02, 1.145, side * 0.13);
        tip.castShadow = true;
        group.add(tip);

        const eyeWhite = new THREE.Mesh(geometry.robotEyeWhite, materials.robotEyeWhite);
        eyeWhite.scale.set(0.78, 1.08, 1);
        addFaceFeature(eyeWhite, 0.84, side * 0.064);

        const pupil = new THREE.Mesh(geometry.robotEye, materials.robotEye);
        pupil.scale.set(0.78, 1, 1);
        addFaceFeature(pupil, 0.835, side * 0.064, 0.234);

        const cheek = new THREE.Mesh(geometry.robotCheek, materials.robotCheek);
        cheek.scale.set(1.2, 0.78, 1);
        addFaceFeature(cheek, 0.776, side * 0.12, 0.233);
      });

      const mouth = new THREE.Mesh(geometry.robotMouth, materials.robotMouth);
      addFaceFeature(mouth, 0.765, 0, 0.235);

      const leftArm = new THREE.Mesh(geometry.robotArm, materials.robotDark);
      leftArm.position.set(0.02, 0.39, -0.31);
      leftArm.rotation.x = Math.PI / 2;
      leftArm.rotation.z = -0.28;
      group.add(leftArm);

      const rightArm = new THREE.Mesh(geometry.robotArm, materials.robotDark);
      rightArm.position.set(0.02, 0.39, 0.31);
      rightArm.rotation.x = Math.PI / 2;
      rightArm.rotation.z = 0.28;
      group.add(rightArm);

      [-1, 1].forEach((side) => {
        const hand = new THREE.Mesh(geometry.robotHand, materials.robotTrim);
        hand.position.set(0.07, 0.32, side * 0.48);
        hand.castShadow = true;
        group.add(hand);

        const foot = new THREE.Mesh(geometry.robotFoot, materials.robotDark);
        foot.position.set(0.08, 0.055, side * 0.14);
        foot.scale.set(1.18, 0.5, 0.82);
        foot.castShadow = true;
        group.add(foot);
      });

      const badge = new THREE.Mesh(geometry.robotBadge, materials.robotTrim);
      badge.position.set(0.302, 0.36, 0);
      badge.rotation.y = Math.PI / 2;
      badge.scale.set(1, 0.86, 1);
      group.add(badge);

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
      if (grid.relay) {
        addCylinder(vertices, [worldX(grid.relay.x), 0.04, worldZ(grid.relay.y)], 0.36, 0.045, [0.92, 0.93, 0.86, 1], 36);
        addCylinder(vertices, [worldX(grid.relay.x), 0.09, worldZ(grid.relay.y)], 0.22, 0.035, [0.23, 0.62, 1.0, 1], 36);
        addCylinder(vertices, [worldX(grid.relay.x), 0.13, worldZ(grid.relay.y)], 0.12, 0.03, [0.82, 0.18, 0.9, 1], 36);
      }

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
    const direction = [
      { fx: 1, fz: 0, rx: 0, rz: 1 },
      { fx: 0, fz: 1, rx: -1, rz: 0 },
      { fx: -1, fz: 0, rx: 0, rz: -1 },
      { fx: 0, fz: -1, rx: 1, rz: 0 }
    ][dirIndex] || { fx: 1, fz: 0, rx: 0, rz: 1 };
    const offset = (base, front, side, up = 0) => [
      base[0] + direction.fx * front + direction.rx * side,
      base[1] + up,
      base[2] + direction.fz * front + direction.rz * side
    ];
    const bodyCenter = [x, y + 0.25, z];
    const headCenter = [x, y + 0.58, z];

    addSphere(out, bodyCenter, [0.24, 0.31, 0.22], [1.0, 0.74, 0.29, 1], 18, 12);
    addCylinder(out, [x, y + 0.5, z], 0.21, 0.04, [0.28, 0.78, 0.74, 1], 28);
    addSphere(out, headCenter, [0.19, 0.18, 0.18], [1.0, 0.75, 0.3, 1], 18, 10);
    addSphere(out, offset(headCenter, 0.155, 0, -0.01), [0.026, 0.1, 0.12], [1.0, 0.94, 0.78, 1], 12, 8);

    [-1, 1].forEach((side) => {
      addCylinder(out, [x + direction.rx * side * 0.08, y + 0.78, z + direction.rz * side * 0.08], 0.016, 0.18, [0.28, 0.78, 0.74, 1], 8);
      addSphere(out, [x + direction.rx * side * 0.1, y + 0.9, z + direction.rz * side * 0.1], [0.045, 0.045, 0.045], side < 0 ? [1, 0.56, 0.58, 1] : [0.34, 0.84, 0.78, 1], 10, 6);
      addSphere(out, offset(headCenter, 0.178, side * 0.065, 0.025), [0.024, 0.044, 0.034], [1, 1, 1, 1], 10, 6);
      addSphere(out, offset(headCenter, 0.185, side * 0.065, 0.02), [0.012, 0.02, 0.016], [0.15, 0.22, 0.28, 1], 8, 5);
      addSphere(out, offset(headCenter, 0.18, side * 0.13, -0.045), [0.018, 0.018, 0.024], [1, 0.56, 0.58, 1], 8, 5);
      addSphere(out, offset(bodyCenter, 0.03, side * 0.32, -0.02), [0.055, 0.055, 0.055], [0.34, 0.84, 0.78, 1], 8, 6);
      addSphere(out, offset(bodyCenter, 0.04, side * 0.13, -0.23), [0.08, 0.04, 0.065], [0.52, 0.35, 0.2, 1], 8, 5);
    });

    addBox(out, offset(headCenter, 0.187, 0, -0.07), [0.008, 0.01, 0.07], {
      top: [0.42, 0.22, 0.17, 1],
      side1: [0.34, 0.18, 0.14, 1],
      side2: [0.34, 0.18, 0.14, 1],
      bottom: [0.26, 0.13, 0.1, 1]
    });

    addSphere(out, offset(bodyCenter, 0.22, 0, 0.02), [0.032, 0.032, 0.032], [0.34, 0.84, 0.78, 1], 10, 6);
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
    if (grid.hazards.has(key) || grid.beacons.has(key) || (grid.relay && grid.relay.x === x && grid.relay.y === y)) return "sand";
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
    renderTrackSwitch();
    renderCourseBreadcrumb();
    renderCourseBrowser();
    renderMissionList();
    renderBrief();
    renderHud();
    renderPalette();
    renderProgramTabs();
    renderProgramList();
    renderSequenceTimeline();
    renderDirectionTracker();
    renderRouteComparison();
    renderCoordinateScanner();
    renderSegmentMission();
    renderCreatorWorkbench();
    renderCapstoneProfile();
    renderAdvancedLearningTool();
    renderCodeView();
    renderLog();
    renderEvidence();
    renderPythonStudio();
    drawGrid();
    scheduleMotionFrames();
    if (dom.runBtn) {
      const iconClass = runTimer ? "tool-pause-icon" : "tool-run-icon";
      dom.runBtn.innerHTML = `<span class="${iconClass}" aria-hidden="true"></span>${runTimer ? "暂停" : "运行"}`;
    }
    const activePlayback = isPythonStudioLesson() ? pythonPlaying : Boolean(runTimer);
    dom.worldRun.lastChild.textContent = activePlayback ? " 停止运行" : " 运行代码";
  }

  dom.missionList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mission]");
    if (!button) return;
    selectMission(Number(button.dataset.mission));
  });

  dom.trackSwitch?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-track]");
    if (!button) return;
    selectTrack(button.dataset.track);
  });

  dom.courseBrowser.addEventListener("click", (event) => {
    const stageButton = event.target.closest("[data-stage]");
    if (stageButton) {
      showStage(stageButton.dataset.stage);
      return;
    }

    const lessonButton = event.target.closest("[data-lesson-id]");
    if (lessonButton) {
      const index = missionIndexById(lessonButton.dataset.lessonId);
      selectMission(index);
      return;
    }

    const navButton = event.target.closest("[data-nav-view]");
    if (navButton?.dataset.navView === "stages") showStageList();
  });

  dom.portalContinue?.addEventListener("click", () => {
    const lessonId = dom.portalContinue.dataset.lessonId;
    if (!lessonId) return;
    selectMission(missionIndexById(lessonId));
  });

  dom.courseBreadcrumb?.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-nav-view]");
    if (viewButton?.dataset.navView === "stages") {
      showStageList();
      return;
    }

    const stageButton = event.target.closest("[data-nav-stage]");
    if (stageButton) showStage(stageButton.dataset.navStage);
  });

  dom.commandPalette.addEventListener("click", (event) => {
    const button = event.target.closest("[data-command]");
    if (!button || button.disabled) return;
    addCommand(button.dataset.command);
  });

  dom.routeChoiceList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-route-choice]");
    if (!button) return;
    selectedRouteChoiceId = button.dataset.routeChoice;
    render();
  });

  dom.creatorWorkbenchPanel.addEventListener("click", (event) => {
    const targetButton = event.target.closest("[data-creator-target]");
    if (targetButton) {
      if (mission().creatorActiveTarget?.id === targetButton.dataset.creatorTarget) return;
      creatorTargetId = targetButton.dataset.creatorTarget;
      program = [];
      routeProgram = [];
      selectedProgramIndex = null;
      resetSimulation();
      render();
      return;
    }

    const limitButton = event.target.closest("[data-creator-limit]");
    if (!limitButton || creatorLimitMode === limitButton.dataset.creatorLimit) return;
    creatorLimitMode = limitButton.dataset.creatorLimit;
    if (program.length > mission().limit) program = [];
    selectedProgramIndex = null;
    resetSimulation(true);
    render();
  });

  dom.advancedLearningPanel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-advanced-action]");
    if (!button) return;
    const action = button.dataset.advancedAction;
    const value = button.dataset.advancedValue;

    if (action === "indent") {
      indentScopeChoice = value;
      render();
      return;
    }
    if (action === "sensor") {
      sensorTarget = value;
      resetSimulation(true);
      render();
      return;
    }
    if (action === "logic-connector") {
      logicConnector = value;
      resetSimulation(true);
      render();
      return;
    }
    if (action === "logic-hazard") {
      logicHazardMode = value;
      resetSimulation(true);
      render();
      return;
    }
    if (action === "loop-hazard") {
      if (mission().loopCreatorActiveHazard?.id === value) return;
      loopCreatorHazardId = value;
      program = [];
      routeProgram = [];
      selectedProgramIndex = null;
      resetSimulation();
      render();
      return;
    }

    const activeMission = mission();
    lessonToolChoices.set(`${activeMission.id}:${action}`, value);
    if (activeMission.advancedConfig?.kind === "designer") resetSimulation(true);
    render();
  });

  dom.programTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-board]");
    if (!button) return;
    activeBoard = button.dataset.board;
    selectedProgramIndex = null;
    render();
  });

  dom.programList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove]");
    if (removeButton) {
      removeCommand(Number(removeButton.dataset.remove));
      return;
    }

    const selectButton = event.target.closest("[data-program-index]");
    if (!selectButton) return;
    const nextIndex = Number(selectButton.dataset.programIndex);
    selectedProgramIndex = selectedProgramIndex === nextIndex ? null : nextIndex;
    render();
  });

  dom.runBtn?.addEventListener("click", () => {
    if (isPythonStudioLesson()) runPythonProgram();
    else runProgram();
  });
  dom.worldRun.addEventListener("click", () => {
    if (isPythonStudioLesson()) {
      if (pythonPlaying) stopPythonProgram();
      else runPythonProgram();
      return;
    }
    runProgram();
  });
  dom.worldHint.addEventListener("click", () => {
    if (mission().lessonMode === "debug-detective") {
      detectiveGuideOpen = !detectiveGuideOpen;
      render();
      return;
    }
    if (isPythonStudioLesson()) {
      setPythonFeedback("normal", "提示", "比较两个英文函数：blocked 表示“被阻挡”，hazard 表示“危险”。本关真正需要检测的是危险格。");
      return;
    }
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
    selectedProgramIndex = null;
    resetSimulation(true);
    render();
  });
  dom.clearBtn.addEventListener("click", () => {
    setCurrentTargetProgram([]);
    selectedProgramIndex = null;
    resetSimulation(true);
    render();
  });
  dom.loadReference.addEventListener("click", loadReferenceProgram);
  dom.pythonRunBtn?.addEventListener("click", runPythonProgram);
  dom.pythonStepBtn?.addEventListener("click", stepPythonProgram);
  dom.pythonStopBtn?.addEventListener("click", stopPythonProgram);
  dom.pythonResetBtn?.addEventListener("click", resetPythonStarter);
  dom.pythonLessonStudio?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-python-template]");
    if (button) insertPythonTemplate(button.dataset.pythonTemplate);
  });
  dom.pythonEditor?.addEventListener("input", () => {
    if (pythonPlaying) stopPythonProgram();
    pythonCurrentSource = "";
    pythonPlannedEvents = [];
    pythonPlaybackIndex = 0;
    clearPythonLineHighlight();
    updatePythonLineNumbers();
    schedulePythonDraftSave();
  });
  dom.pythonEditor?.addEventListener("scroll", syncPythonEditorScroll);
  dom.pythonEditor?.addEventListener("keydown", (event) => {
    if (dom.pythonEditor.readOnly) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        runPythonProgram();
      }
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const start = dom.pythonEditor.selectionStart;
      const end = dom.pythonEditor.selectionEnd;
      dom.pythonEditor.setRangeText("    ", start, end, "end");
      dom.pythonEditor.dispatchEvent(new Event("input"));
    }
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      runPythonProgram();
    }
  });
  dom.courseHome.addEventListener("click", () => {
    if (courseView === "lesson") showStage(selectedStageId);
    else showStageList();
  });
  dom.prevLesson.addEventListener("click", () => selectMission(currentMissionIndex - 1));
  dom.nextLesson.addEventListener("click", () => selectMission(currentMissionIndex + 1));

  dom.resetProgress?.addEventListener("click", () => {
    suspendPythonStudio();
    const currentTrackIds = new Set(currentMissions().map((item) => item.id));
    const removedLessonIds = [...completed].filter((id) => currentTrackIds.has(id));
    completed = new Set([...completed].filter((id) => !currentTrackIds.has(id)));
    saveProgress({ sync: false });
    deleteCloudProgress(removedLessonIds);
    currentMissionIndex = 0;
    program = [];
    routeProgram = [];
    activeBoard = "main";
    selectedProgramIndex = null;
    selectedRouteChoiceId = null;
    detectiveGuideOpen = false;
    resetCreatorSettings();
    lessonToolChoices.clear();
    pythonEvidence = {};
    try {
      currentMissions().filter((item) => item.pythonStudio).forEach((item) => {
        localStorage.removeItem(pythonLessonStorageKey(item.id));
      });
    } catch (error) {
      // Reset continues even when local storage is unavailable.
    }
    resetSimulation();
    render();
  });

  window.addEventListener("codequest:auth-changed", (event) => {
    authUser = event.detail?.user || null;
    isLocalPreview = Boolean(event.detail?.localPreview);
    if (authUser) {
      syncProgressFromCloud();
      if (pendingMissionIndex !== null) {
        const lessonIndex = pendingMissionIndex;
        pendingMissionIndex = null;
        selectMission(lessonIndex);
      }
    } else {
      setProgressSyncState("本机进度");
    }
  });

  window.addEventListener("codequest:auth-dismissed", () => {
    pendingMissionIndex = null;
  });

  resetSimulation();
  render();
})();
