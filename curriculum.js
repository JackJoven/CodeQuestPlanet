(function () {
  const stages = [
    {
      id: "L0",
      title: "AI 创作启蒙",
      age: "6-8 岁",
      count: 12,
      duration: "35-45 分钟/节",
      summary: "从动作、反馈、选择和计数开始，让孩子做出会回应的小场景和小玩具。",
      color: "sun"
    },
    {
      id: "L1",
      title: "规则游戏入门",
      age: "8-10 岁",
      count: 16,
      duration: "45-60 分钟/节",
      summary: "用规则实验台做单屏小游戏，理解对象、状态、系统和调试。",
      color: "sky"
    },
    {
      id: "L2",
      title: "AI 游戏创作进阶",
      age: "10-14 岁",
      count: 24,
      duration: "60-90 分钟/节",
      summary: "围绕玩法循环、系统设计、代码过渡和毕业项目，完成原创 2D 游戏。",
      color: "mint"
    }
  ];

  const courses = [
    { id: "L0-01", stage: "L0", title: "让角色动起来", concepts: "角色 · 动作 · 舞台", task: "让主角从起点走到目标", product: "动作小作品" },
    { id: "L0-02", stage: "L0", title: "点一下就会回应", concepts: "点击 · 事件 · 反馈", task: "做一个会发光或变表情的按钮", product: "互动按钮" },
    { id: "L0-03", stage: "L0", title: "让角色按顺序表演", concepts: "顺序 · 等待 · 节奏", task: "做一段三步小动画", product: "顺序动画" },
    { id: "L0-04", stage: "L0", title: "模块挑战：会回应的小场景", concepts: "动作 · 反馈 · 组合", task: "做一个点一下就有完整回应的小场景", product: "回应小场景" },
    { id: "L0-05", stage: "L0", title: "碰到就有结果", concepts: "接触 · 结果 · 反馈", task: "碰到星星后庆祝或得分", product: "碰撞反馈" },
    { id: "L0-06", stage: "L0", title: "选左还是选右", concepts: "选择 · 分支", task: "做两个不同结局", product: "分支故事" },
    { id: "L0-07", stage: "L0", title: "重复和计数让世界变化", concepts: "重复 · 计数 · 显示直觉", task: "收集 3 颗星并显示数量", product: "计数挑战" },
    { id: "L0-08", stage: "L0", title: "模块挑战：会变化的小玩具", concepts: "选择 · 重复 · 计数组合", task: "做一个会不断变化的小玩具", product: "变化小玩具" },
    { id: "L0-09", stage: "L0", title: "让 AI 帮我想角色和场景", concepts: "AI 创意协作 · 选择 · 改写", task: "做角色卡和场景草图", product: "原创角色卡" },
    { id: "L0-10", stage: "L0", title: "找到坏掉的一步", concepts: "观察 · 猜测 · 修复", task: "修好一个少了动作的小作品", product: "修复记录" },
    { id: "L0-11", stage: "L0", title: "我的互动故事", concepts: "角色 · 分支 · 规则组合", task: "做一个有开头中间结尾的互动故事", product: "互动故事" },
    { id: "L0-12", stage: "L0", title: "小小创作者展", concepts: "表达 · 复盘 · 展示", task: "向家长讲清 3 条作品规则", product: "启蒙展示" },

    { id: "L1-01", stage: "L1", title: "游戏由对象、目标和规则组成", concepts: "对象 · 目标 · 规则", task: "拆解一个单屏小游戏的 3 个对象和 1 个目标", product: "规则拆解卡" },
    { id: "L1-02", stage: "L1", title: "当按键发生", concepts: "事件 · 输入", task: "让角色移动到目标区", product: "可控角色" },
    { id: "L1-03", stage: "L1", title: "碰到就有结果", concepts: "碰撞 · 结果", task: "碰到奖励加分或碰到障碍后退", product: "碰撞关卡" },
    { id: "L1-04", stage: "L1", title: "模块挑战：做一个单规则挑战关", concepts: "事件 · 碰撞 · 目标", task: "做一个“拿到宝物就通关”的单屏关", product: "单规则挑战关" },
    { id: "L1-05", stage: "L1", title: "分数和倒计时是游戏记忆", concepts: "变量 · 计数 · 时间", task: "做一个分数或倒计时系统", product: "变量面板" },
    { id: "L1-06", stage: "L1", title: "屏幕显示为什么会变", concepts: "UI 同步 · 数值显示", task: "做一个会同步变化的面板", product: "显示面板" },
    { id: "L1-07", stage: "L1", title: "如果满足条件就能过、开或扣", concepts: "条件 · 状态 · 判断", task: "做一个有钥匙/血量/开门条件的小关卡", product: "状态关卡" },
    { id: "L1-08", stage: "L1", title: "模块挑战：做一个会记住状态的小关", concepts: "变量 · 条件 · 状态", task: "做一个带分数或钥匙状态的单屏关", product: "状态小关" },
    { id: "L1-09", stage: "L1", title: "让系统自己生成东西", concepts: "循环 · 定时", task: "每隔几秒生成目标或障碍", product: "自动系统" },
    { id: "L1-10", stage: "L1", title: "随机让每局都不一样", concepts: "随机 · 位置变化", task: "让道具或障碍随机出现", product: "随机挑战" },
    { id: "L1-11", stage: "L1", title: "胜利、失败和难度", concepts: "目标判断 · 失败条件 · 难度", task: "做一个有胜利失败且会逐渐变难的挑战", product: "胜负规则" },
    { id: "L1-12", stage: "L1", title: "模块挑战：做一个 30 秒规则小游戏", concepts: "系统组合 · 节奏", task: "做一个能玩 30 秒的收集或躲避小游戏", product: "30秒规则小游戏" },
    { id: "L1-13", stage: "L1", title: "找 bug 的三步法", concepts: "观察 · 猜测 · 验证", task: "修复一个规则错误并记录过程", product: "调试记录" },
    { id: "L1-14", stage: "L1", title: "让 AI 帮我定位问题", concepts: "AI 提问 · 限制条件 · 验证", task: "完成一次有效求助并验证建议", product: "AI 求助卡" },
    { id: "L1-15", stage: "L1", title: "设计我的原创挑战关", concepts: "规则组合 · 关卡设计 · 反馈", task: "做一个原创单屏挑战关", product: "原创关卡" },
    { id: "L1-16", stage: "L1", title: "规则作品展", concepts: "展示 · 讲解 · 反馈", task: "展示并讲清核心规则与调试过程", product: "规则作品集" },

    { id: "L2-01", stage: "L2", title: "核心玩法循环", concepts: "玩家动作 · 目标 · 失败回路", task: "画出并做出“做什么 -> 得到什么 -> 为什么继续玩”", product: "玩法循环图" },
    { id: "L2-02", stage: "L2", title: "风险与奖励回路", concepts: "风险 · 奖励 · 决策", task: "让玩家在安全与收益间做选择", product: "风险回路" },
    { id: "L2-03", stage: "L2", title: "资源和策略", concepts: "能量 · 弹药 · 冷却 · 货币", task: "加入一个会限制策略的资源系统", product: "资源系统" },
    { id: "L2-04", stage: "L2", title: "敌人压力与场景节奏", concepts: "压力 · 波次 · 节奏", task: "让场景出现有节奏的危险或机会", product: "节奏方案" },
    { id: "L2-05", stage: "L2", title: "技能与特殊机制", concepts: "技能 · 参数 · 差异化", task: "设计一个让玩法变得不同的机制", product: "技能系统" },
    { id: "L2-06", stage: "L2", title: "模块原型：30 秒可玩玩法", concepts: "核心循环 · 原型整合", task: "做一个 30 秒可玩的玩法原型", product: "玩法原型" },
    { id: "L2-07", stage: "L2", title: "关卡空间与路线", concepts: "地图 · 路径 · 节奏", task: "设计一张有路线选择的关卡", product: "关卡地图" },
    { id: "L2-08", stage: "L2", title: "手感调校工作坊", concepts: "加速度 · 跳跃曲线 · 反馈", task: "调到自己喜欢的操作手感", product: "手感版本" },
    { id: "L2-09", stage: "L2", title: "敌人和机关联动", concepts: "简单 AI · 机关 · 状态切换", task: "做巡逻敌人或开关机关组合", product: "行为系统" },
    { id: "L2-10", stage: "L2", title: "道具与数值系统", concepts: "数据 · 效果叠加 · 持续时间", task: "加入护盾、加速或双倍分系统", product: "道具系统" },
    { id: "L2-11", stage: "L2", title: "难度曲线与波次", concepts: "节奏 · 波次 · 平衡", task: "让作品前后半段难度递进", product: "难度方案" },
    { id: "L2-12", stage: "L2", title: "模块作品：双关卡试玩版", concepts: "关卡结构 · 系统组合", task: "做一个双关卡试玩 vertical slice", product: "双关卡试玩版" },
    { id: "L2-13", stage: "L2", title: "用流程图讲清玩法系统", concepts: "流程图 · 状态图 · 系统拆解", task: "把玩法拆成一张系统图", product: "系统图" },
    { id: "L2-14", stage: "L2", title: "把规则翻成伪代码", concepts: "规则到步骤", task: "把一套玩法写成伪代码", product: "伪代码卡" },
    { id: "L2-15", stage: "L2", title: "读懂一段真实代码", concepts: "变量 · 条件 · 函数 · 对象", task: "标出代码和玩法的对应关系", product: "代码标注" },
    { id: "L2-16", stage: "L2", title: "改一个真实功能片段", concepts: "参数 · 条件 · 函数调用", task: "改一段真实代码并验证结果", product: "代码修改" },
    { id: "L2-17", stage: "L2", title: "和 AI 一起拆问题", concepts: "目标 · 现象 · 约束", task: "完成一次有效 AI 调试对话", product: "调试对话" },
    { id: "L2-18", stage: "L2", title: "验证 AI，而不是盲信 AI", concepts: "测试 · 反例 · 复现", task: "检查 AI 建议是否真的修好", product: "验证清单" },
    { id: "L2-19", stage: "L2", title: "毕业项目选题与范围", concepts: "用户 · 主题 · MVP", task: "选一个 4-6 节可完成的项目", product: "项目提案" },
    { id: "L2-20", stage: "L2", title: "纸面原型与任务拆解", concepts: "流程 · 界面草图 · 任务拆解", task: "画出玩法流程并拆 5-8 个任务", product: "纸面原型" },
    { id: "L2-21", stage: "L2", title: "核心玩法开发", concepts: "主循环 · 关键系统", task: "做出 1 分钟可玩的核心玩法", product: "核心玩法" },
    { id: "L2-22", stage: "L2", title: "扩展内容与调试", concepts: "关卡 · 音效 · 道具 · 修 bug", task: "补足完整体验并修关键问题", product: "打磨版本" },
    { id: "L2-23", stage: "L2", title: "展示页、说明和试玩反馈", concepts: "文档 · 包装 · 反馈", task: "准备作品介绍并收集试玩意见", product: "展示页" },
    { id: "L2-24", stage: "L2", title: "Demo Day", concepts: "展示 · 复盘 · AI 协作", task: "演示作品并讲清设计选择", product: "毕业展示" }
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
      return "L0-01";
    }

    const raw = String(value).trim().toUpperCase();
    const legacyLesson = Number(raw);

    if (Number.isInteger(legacyLesson) && legacyLesson >= 1 && legacyLesson <= 6) {
      return `L2-${String(legacyLesson).padStart(2, "0")}`;
    }

    const normalized = raw.replace(/^([L]\d)[\-_\s]?(\d{1,2})$/, (_, stage, number) => {
      return `${stage}-${String(Number(number)).padStart(2, "0")}`;
    });

    return courseById.has(normalized) ? normalized : "L0-01";
  }

  function getCourse(value) {
    return courseById.get(normalizeCourseId(value)) || courseById.get("L0-01");
  }

  function getStage(value) {
    return stageById.get(value) || stageById.get("L0");
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

    const activeStage = options.activeStage || "L0";
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

    const activeStage = options.activeStage || "L0";
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
