(function () {
  const stages = [
    {
      id: "L0",
      title: "AI 创作启蒙",
      age: "6-8 岁",
      count: 12,
      duration: "35-45 分钟/节",
      summary: "从角色、动作、规则和结果开始，让孩子先喜欢创作。",
      color: "sun"
    },
    {
      id: "L1",
      title: "规则编程入门",
      age: "8-10 岁",
      count: 16,
      duration: "45-60 分钟/节",
      summary: "用自研规则编辑器学习事件、变量、条件、循环和碰撞。",
      color: "sky"
    },
    {
      id: "L2",
      title: "AI 游戏编程主线",
      age: "10-14 岁",
      count: 24,
      duration: "60-90 分钟/节",
      summary: "做出完整 2D 游戏，并学会基础 AI 协作、调试和作品展示。",
      color: "mint"
    }
  ];

  const courses = [
    { id: "L0-01", stage: "L0", title: "我的第一个会动角色", concepts: "角色 · 舞台 · 动作", task: "让一个角色走到星星旁边", product: "会动角色" },
    { id: "L0-02", stage: "L0", title: "按一下就发生", concepts: "事件 · 按钮 · 触发", task: "点击按钮让角色变表情", product: "互动按钮" },
    { id: "L0-03", stage: "L0", title: "会说话的角色", concepts: "顺序 · 台词 · 等待", task: "做一段两句对话", product: "角色对话" },
    { id: "L0-04", stage: "L0", title: "找到宝藏", concepts: "目标 · 胜利反馈", task: "角色碰到宝藏后庆祝", product: "寻宝小动画" },
    { id: "L0-05", stage: "L0", title: "小怪兽来了", concepts: "规则 · 结果", task: "碰到怪兽会后退", product: "怪兽规则" },
    { id: "L0-06", stage: "L0", title: "选择一条路", concepts: "简单条件", task: "选左路/右路出现不同结局", product: "分支故事" },
    { id: "L0-07", stage: "L0", title: "重复跳舞", concepts: "重复动作", task: "让角色循环跳舞 3 次", product: "循环舞台" },
    { id: "L0-08", stage: "L0", title: "我的小游戏按钮", concepts: "输入 · 反馈", task: "点按钮加一颗星", product: "加星小游戏" },
    { id: "L0-09", stage: "L0", title: "让 AI 帮我想角色", concepts: "AI 辅助创意", task: "让 AI 给 3 个角色名字，学生选一个", product: "原创角色卡" },
    { id: "L0-10", stage: "L0", title: "发现哪里坏了", concepts: "初级调试", task: "找出角色为什么没动", product: "修复小挑战" },
    { id: "L0-11", stage: "L0", title: "我的小故事关卡", concepts: "综合规则", task: "做一个有开始和结尾的互动故事", product: "互动故事" },
    { id: "L0-12", stage: "L0", title: "小小创作者展示", concepts: "表达展示", task: "给家长演示并说出 2 条规则", product: "启蒙展示" },

    { id: "L1-01", stage: "L1", title: "游戏是由规则组成的", concepts: "规则 · 对象 · 动作", task: "拆解一个小游戏的 3 条规则", product: "规则拆解卡" },
    { id: "L1-02", stage: "L1", title: "当按键发生", concepts: "事件 · 输入", task: "让角色左右移动", product: "可控角色" },
    { id: "L1-03", stage: "L1", title: "坐标让角色换位置", concepts: "x/y 坐标", task: "把角色送到目标点", product: "坐标挑战" },
    { id: "L1-04", stage: "L1", title: "变量是游戏记忆", concepts: "分数变量", task: "吃 3 个金币加分", product: "金币计分" },
    { id: "L1-05", stage: "L1", title: "屏幕显示来自变量", concepts: "UI 显示", task: "让屏幕分数同步变化", product: "分数面板" },
    { id: "L1-06", stage: "L1", title: "如果碰到了就发生", concepts: "条件 · 碰撞", task: "碰到宝石加分，碰到怪物扣血", product: "碰撞关卡" },
    { id: "L1-07", stage: "L1", title: "重复出现的东西", concepts: "循环 · 定时", task: "金币每隔几秒出现", product: "刷新器" },
    { id: "L1-08", stage: "L1", title: "随机让游戏不一样", concepts: "随机位置", task: "让宝物随机出现", product: "随机宝物" },
    { id: "L1-09", stage: "L1", title: "生命值和失败", concepts: "状态 · 失败条件", task: "血量为 0 游戏结束", product: "生命系统" },
    { id: "L1-10", stage: "L1", title: "胜利条件", concepts: "目标判断", task: "分数达到 10 通关", product: "通关规则" },
    { id: "L1-11", stage: "L1", title: "找 bug 小侦探", concepts: "观察 · 猜测 · 验证", task: "修复一个分数不变的关卡", product: "调试记录" },
    { id: "L1-12", stage: "L1", title: "让 AI 给提示", concepts: "AI 提问格式", task: "描述“目标/现象/猜测”", product: "AI 求助卡" },
    { id: "L1-13", stage: "L1", title: "改数值改变手感", concepts: "参数 · 平衡", task: "调整速度、分数、时间", product: "手感调校" },
    { id: "L1-14", stage: "L1", title: "做一关自己的挑战", concepts: "关卡设计", task: "自己摆放金币和障碍", product: "原创关卡" },
    { id: "L1-15", stage: "L1", title: "作品打磨", concepts: "反馈 · 难度", task: "给作品加标题、提示和胜负反馈", product: "打磨作品" },
    { id: "L1-16", stage: "L1", title: "规则作品展", concepts: "展示表达", task: "展示作品并讲清 3 条规则", product: "规则作品集" },

    { id: "L2-01", stage: "L2", title: "控制诊断场", concepts: "事件 · 坐标 · 速度", task: "修复角色移动，并解释输入到移动的链路", product: "控制实验", playableLesson: 1 },
    { id: "L2-02", stage: "L2", title: "分数侦探局", concepts: "变量 · UI 同步 · 状态", task: "修复分数变量和屏幕显示", product: "计分实验", playableLesson: 2 },
    { id: "L2-03", stage: "L2", title: "碰撞与结果", concepts: "条件 · 碰撞 · 状态变化", task: "子弹命中/吃金币/碰怪物产生结果", product: "碰撞实验", playableLesson: 3 },
    { id: "L2-04", stage: "L2", title: "自动生成系统", concepts: "循环 · 定时器 · 随机", task: "自动生成敌人、金币或机关", product: "生成实验", playableLesson: 4 },
    { id: "L2-05", stage: "L2", title: "设计一个技能", concepts: "函数 · 参数 · 冷却", task: "做强化子弹、冲刺或二段跳", product: "技能实验", playableLesson: 5 },
    { id: "L2-06", stage: "L2", title: "第一款小游戏", concepts: "综合规则 · 复盘", task: "完成 MVP 毕业小游戏", product: "MVP 毕业作品", playableLesson: 6 },
    { id: "L2-07", stage: "L2", title: "关卡地图怎么设计", concepts: "地图 · 目标路线", task: "设计一张有开始和终点的关卡", product: "关卡地图" },
    { id: "L2-08", stage: "L2", title: "游戏手感调校", concepts: "速度 · 加速度 · 反馈", task: "调整移动、跳跃或射击手感", product: "手感版本" },
    { id: "L2-09", stage: "L2", title: "敌人行为", concepts: "状态机 · 简单 AI", task: "敌人巡逻、追踪或发射", product: "敌人行为" },
    { id: "L2-10", stage: "L2", title: "道具系统", concepts: "数据 · 效果 · 持续时间", task: "做加速、护盾、回血或双倍分数", product: "道具系统" },
    { id: "L2-11", stage: "L2", title: "难度曲线", concepts: "数值 · 节奏 · 平衡", task: "让游戏从简单逐渐变难", product: "难度曲线" },
    { id: "L2-12", stage: "L2", title: "小型关卡包", concepts: "作品结构", task: "做 2-3 个连续关卡", product: "关卡包" },
    { id: "L2-13", stage: "L2", title: "看懂规则背后的代码", concepts: "伪代码 · 真实代码结构", task: "把一条规则翻译成代码", product: "代码透视卡" },
    { id: "L2-14", stage: "L2", title: "修改一小段真实代码", concepts: "变量赋值 · 条件语句", task: "改分数、速度或胜利条件", product: "代码修改" },
    { id: "L2-15", stage: "L2", title: "AI 调试三句话", concepts: "目标 · 现象 · 猜测", task: "用固定模板向 AI 求助", product: "调试对话" },
    { id: "L2-16", stage: "L2", title: "AI 答案可靠吗", concepts: "验证 · 测试用例", task: "检查 AI 建议是否真的修好", product: "验证清单" },
    { id: "L2-17", stage: "L2", title: "版本保存和回滚", concepts: "Git 概念 · 作品版本", task: "保存一个稳定版本，再做实验版", product: "版本记录" },
    { id: "L2-18", stage: "L2", title: "代码不只是能跑", concepts: "可读性 · 命名 · 注释", task: "整理规则命名和作品说明", product: "可读版本" },
    { id: "L2-19", stage: "L2", title: "毕业项目立项", concepts: "需求 · 范围 · 路线选择", task: "写作品目标和最小可玩版本", product: "项目计划" },
    { id: "L2-20", stage: "L2", title: "核心玩法制作", concepts: "主循环 · 核心规则", task: "做出 1 分钟可玩的核心玩法", product: "可玩原型" },
    { id: "L2-21", stage: "L2", title: "加入个性化机制", concepts: "创意 · 技能 · 道具", task: "加一个原创机制", product: "原创机制" },
    { id: "L2-22", stage: "L2", title: "测试和修 bug", concepts: "调试 · 边界情况", task: "找出并修复 3 个问题", product: "修复清单" },
    { id: "L2-23", stage: "L2", title: "展示页和家长报告", concepts: "表达 · 作品包装", task: "生成作品说明和规则透视", product: "展示页" },
    { id: "L2-24", stage: "L2", title: "毕业展示", concepts: "复盘 · 演示 · AI 协作", task: "展示作品并讲清 AI 如何帮助", product: "毕业展示" }
  ];

  const stageById = new Map(stages.map((stage) => [stage.id, stage]));
  const courseById = new Map(courses.map((course) => [course.id, course]));

  courses.forEach((course, index) => {
    const stageCourses = courses.filter((item) => item.stage === course.stage);
    course.stageIndex = stageCourses.findIndex((item) => item.id === course.id) + 1;
    course.globalIndex = index + 1;
    course.stageMeta = stageById.get(course.stage);
  });

  function normalizeCourseId(value) {
    if (!value) {
      return "L2-01";
    }

    const raw = String(value).trim().toUpperCase();
    const legacyLesson = Number(raw);

    if (Number.isInteger(legacyLesson) && legacyLesson >= 1 && legacyLesson <= 6) {
      return `L2-${String(legacyLesson).padStart(2, "0")}`;
    }

    const normalized = raw.replace(/^([L]\d)[\-_\s]?(\d{1,2})$/, (_, stage, number) => {
      return `${stage}-${String(Number(number)).padStart(2, "0")}`;
    });

    return courseById.has(normalized) ? normalized : "L2-01";
  }

  function getCourse(value) {
    return courseById.get(normalizeCourseId(value)) || courseById.get("L2-01");
  }

  function getStage(value) {
    return stageById.get(value) || stageById.get("L2");
  }

  function coursesForStage(stageId) {
    return courses.filter((course) => course.stage === stageId);
  }

  function courseUrl(courseId, route) {
    const course = getCourse(courseId);
    const params = new URLSearchParams();
    params.set("course", course.id);
    if (route) {
      params.set("route", route);
    }
    return `./lesson.html?${params.toString()}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderStageOverview(rootSelector, options = {}) {
    const root = typeof rootSelector === "string" ? document.querySelector(rootSelector) : rootSelector;
    if (!root) {
      return;
    }

    const activeStage = options.activeStage || "L2";
    root.innerHTML = stages.map((stage) => {
      const isActive = stage.id === activeStage ? " is-active" : "";
      return `
        <a class="stage-card stage-${stage.color}${isActive}" href="#stage-${stage.id}" data-stage="${stage.id}">
          <span>${stage.id}</span>
          <strong>${escapeHtml(stage.title)}</strong>
          <small>${escapeHtml(stage.age)} · ${stage.count} 节 · ${escapeHtml(stage.duration)}</small>
          <p>${escapeHtml(stage.summary)}</p>
        </a>
      `;
    }).join("");
  }

  function renderCurriculumMap(rootSelector) {
    const root = typeof rootSelector === "string" ? document.querySelector(rootSelector) : rootSelector;
    if (!root) {
      return;
    }

    root.innerHTML = stages.map((stage) => {
      const stageCourses = coursesForStage(stage.id);
      const tiles = stageCourses.map((course) => {
        const isPlayable = course.playableLesson ? " is-playable" : "";
        const label = course.playableLesson ? "可玩原型" : "课程任务";
        return `
          <a class="course-tile${isPlayable}" href="${courseUrl(course.id)}" data-course="${course.id}">
            <span class="course-number">${course.id.replace("L", "").replace("-", ".")}</span>
            <strong>${escapeHtml(course.title)}</strong>
            <small>${escapeHtml(course.concepts)}</small>
            <p>${escapeHtml(course.task)}</p>
            <em>${label}</em>
          </a>
        `;
      }).join("");

      return `
        <section class="stage-lane" id="stage-${stage.id}" aria-label="${escapeHtml(stage.title)}">
          <div class="stage-lane-head">
            <div>
              <p class="section-kicker">${stage.id} · ${escapeHtml(stage.age)}</p>
              <h2>${escapeHtml(stage.title)}</h2>
            </div>
            <span class="mini-badge">${stage.count} Lessons</span>
          </div>
          <div class="course-grid">${tiles}</div>
        </section>
      `;
    }).join("");
  }

  function renderStageTabs(rootSelector, options = {}) {
    const root = typeof rootSelector === "string" ? document.querySelector(rootSelector) : rootSelector;
    if (!root) {
      return;
    }

    const activeStage = options.activeStage || "L2";
    root.innerHTML = stages.map((stage) => {
      const isActive = stage.id === activeStage ? " is-active" : "";
      return `
        <button class="stage-tab${isActive}" type="button" data-stage="${stage.id}">
          <span>${stage.id}</span>
          <strong>${escapeHtml(stage.title)}</strong>
          <small>${escapeHtml(stage.age)} · ${stage.count} 节</small>
        </button>
      `;
    }).join("");
  }

  function renderLessonRail(rootSelector, options = {}) {
    const root = typeof rootSelector === "string" ? document.querySelector(rootSelector) : rootSelector;
    if (!root) {
      return;
    }

    const activeCourse = getCourse(options.activeCourseId);
    const activeStage = options.stage || activeCourse.stage;
    const stage = getStage(activeStage);
    const cards = coursesForStage(activeStage).map((course) => {
      const isActive = course.id === activeCourse.id ? " is-active" : "";
      const isPlayable = course.playableLesson ? " is-playable" : "";
      const label = course.playableLesson ? "可玩" : "任务";

      return `
        <button class="lesson-card curriculum-lesson-card${isActive}${isPlayable}" data-course="${course.id}" data-stage="${course.stage}" type="button">
          <span>${String(course.stageIndex).padStart(2, "0")}</span>
          <div>
            <strong>${escapeHtml(course.title)}</strong>
            <small>${escapeHtml(course.concepts)}</small>
            <em>${label} · ${escapeHtml(course.product)}</em>
          </div>
        </button>
      `;
    }).join("");

    root.innerHTML = `
      <div class="course-rail-head">
        <div>
          <p class="section-kicker">${stage.id} · ${escapeHtml(stage.age)}</p>
          <h2>${escapeHtml(stage.title)}</h2>
        </div>
        <span class="mini-badge">${stage.count} 节</span>
      </div>
      <div class="course-rail-grid">${cards}</div>
    `;
  }

  function activeCourseFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return getCourse(params.get("course") || params.get("lesson"));
  }

  function autoRender() {
    const activeCourse = activeCourseFromUrl();
    renderStageOverview("#stageOverview", { activeStage: activeCourse.stage });
    renderCurriculumMap("#curriculumMap");
    renderStageTabs("#stageTabs", { activeStage: activeCourse.stage });
    renderLessonRail("#lessonCourseRail", { activeCourseId: activeCourse.id, stage: activeCourse.stage });
  }

  window.GameMakerCurriculum = {
    stages,
    courses,
    normalizeCourseId,
    getCourse,
    getStage,
    coursesForStage,
    courseUrl,
    renderStageOverview,
    renderCurriculumMap,
    renderStageTabs,
    renderLessonRail
  };

  if (document.querySelector("#stageOverview, #curriculumMap, #stageTabs, #lessonCourseRail")) {
    autoRender();
  } else {
    document.addEventListener("DOMContentLoaded", autoRender, { once: true });
  }
})();
