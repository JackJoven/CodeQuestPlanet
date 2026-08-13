(function () {
  const appRoot = document.querySelector("#appRoot");
  const homeButton = document.querySelector("#homeButton");
  const navButtons = [...document.querySelectorAll("[data-route]")];

  const courseStages = [
    {
      id: "stage-1",
      title: "程序执行与空间任务",
      range: "1-8",
      status: "已开始",
      summary: "顺序、方向、坐标、运行、日志、单步调试",
      output: "基础采集上传任务包",
      lessons: [
        {
          id: "course-01",
          no: "第 01 节",
          title: "启动任务",
          subtitle: "读懂地图并完成一次采集上传",
          concept: "顺序 · 采集 · 上传",
          status: "开放",
          map: "line",
          target: "从起点出发，到达信标格 collect()，再到中继站 upload()。",
          focus: "把任务目标拆成一串会被按顺序执行的指令。",
          output: "完成 3 条小路线，并记录一次错误原因。",
          commands: ["move()", "move()", "collect()", "move()", "move()", "upload()"],
          logs: [
            { type: "success", text: "采集成功：信标已携带。" },
            { type: "normal", text: "前进到中继站，等待上传。" },
            { type: "success", text: "上传成功：任务完成。" }
          ],
          reflections: ["我先观察了起点、信标、中继站的位置。", "我知道 collect() 必须在信标格执行。", "我能解释一次提前上传为什么失败。"]
        },
        {
          id: "course-02",
          no: "第 02 节",
          title: "方向与视角",
          subtitle: "看得见不等于走得对",
          concept: "朝向 · 转弯 · 地图旋转",
          status: "开放",
          map: "turn",
          target: "完成一条含转弯的路线，并解释视角旋转不会改变无人机朝向。",
          focus: "用 HUD 里的朝向判断下一步 move() 会走向哪里。",
          output: "完成含转弯路线，并写出一次 turnRight() 后朝向如何变化。",
          commands: ["move()", "move()", "turnRight()", "move()", "collect()", "turnRight()", "move()", "upload()"],
          logs: [
            { type: "normal", text: "右转：当前朝向南。" },
            { type: "success", text: "采集成功：路线包含转向。" },
            { type: "success", text: "上传成功：视角变化没有改变程序结果。" }
          ],
          reflections: ["我不会只凭屏幕上下左右判断移动方向。", "我能说出视角旋转和角色朝向的区别。", "我能根据日志找到走错方向的那一步。"]
        },
        ...Array.from({ length: 6 }, (_, index) => ({
          id: `course-${String(index + 3).padStart(2, "0")}`,
          no: `第 ${String(index + 3).padStart(2, "0")} 节`,
          title: ["运行前先预测", "日志不是报错弹窗", "单步执行和断点思维", "多段任务的顺序设计", "设计基础关卡", "基础执行挑战"][index],
          subtitle: "规划中",
          concept: "第一阶段",
          status: "规划中",
          locked: true
        }))
      ]
    },
    {
      id: "stage-2",
      title: "控制结构与状态",
      range: "9-16",
      status: "规划中",
      summary: "条件、循环、函数、变量、能量、危险状态",
      output: "能量与危险关卡包",
      lessons: []
    },
    {
      id: "stage-3",
      title: "数据建模与任务管理",
      range: "17-24",
      status: "规划中",
      summary: "列表、二维地图、集合、映射、栈、队列、配置",
      output: "信标数据管理中心",
      lessons: []
    },
    {
      id: "stage-4",
      title: "搜索、排序与效率",
      range: "25-32",
      status: "规划中",
      summary: "线性搜索、筛选、排序、二分、复杂度直觉",
      output: "目标选择与排序工具",
      lessons: []
    },
    {
      id: "stage-5",
      title: "图与路径算法",
      range: "33-40",
      status: "规划中",
      summary: "网格图、邻居、深搜、广搜、路径重建、代价",
      output: "自动寻路任务包",
      lessons: []
    },
    {
      id: "stage-6",
      title: "综合算法作品",
      range: "41-48",
      status: "规划中",
      summary: "多目标规划、贪心、反例、枚举、剪枝、动态规划入门",
      output: "多目标路线规划器",
      lessons: []
    }
  ];

  const demoLessons = [
    "启动巡航",
    "路径调试",
    "危险传感器",
    "压缩重复",
    "路线函数",
    "三塔同步"
  ];

  let route = { name: "home" };
  let activeStageId = "stage-1";
  let activeStep = "编程";

  function setRoute(next) {
    route = next;
    render();
  }

  function render() {
    updateNav();
    if (route.name === "course") renderCatalog();
    else if (route.name === "demo") renderDemo();
    else if (route.name === "lesson") renderLesson(route.lessonId);
    else renderHome();
  }

  function updateNav() {
    navButtons.forEach((button) => {
      const isCourseLesson = route.name === "lesson" && route.track === "course" && button.dataset.route === "course";
      const isDemoLesson = route.name === "lesson" && route.track === "demo" && button.dataset.route === "demo";
      button.classList.toggle("is-active", button.dataset.route === route.name || isCourseLesson || isDemoLesson);
    });
  }

  function renderHome() {
    appRoot.innerHTML = `
      <section class="home-grid">
        <div class="home-intro">
          <div class="intro-copy">
            <span class="eyebrow">课程中心</span>
            <h1>先选课程，再进入每一节课。</h1>
            <p>首页只做课程选择；目录页负责看阶段和课次；单节课页面再进入地图、编程、日志和课堂产出。</p>
            <div class="hero-actions">
              <button class="primary-button" data-action="open-course" type="button">进入标准课程</button>
              <button class="ghost-button" data-action="open-demo" type="button">查看 Demo 节点</button>
            </div>
          </div>
          <div class="world-preview">
            <canvas id="homePreview" width="720" height="520" aria-label="课程世界预览"></canvas>
          </div>
        </div>

        <div class="course-options">
          ${renderCourseOption({
            title: "标准课程",
            badge: "48 节",
            body: "正式课程主线，从程序执行逐步推进到搜索、图、路径规划和综合算法作品。",
            live: true,
            metrics: [["阶段", "6"], ["已实现", "2"], ["当前", "1-8"]], 
            action: "open-course",
            actionText: "进入课程目录"
          })}
          ${renderCourseOption({
            title: "Demo 节点",
            badge: "体验",
            body: "保留原 6 关作品节点，只作为玩法、美术、综合交互的演示入口。",
            live: false,
            metrics: [["关卡", "6"], ["用途", "展示"], ["进度", "独立"]], 
            action: "open-demo",
            actionText: "查看 Demo 目录"
          })}
        </div>
      </section>
    `;
    drawWorldPreview(document.querySelector("#homePreview"), "home");
  }

  function renderCourseOption(options) {
    const metrics = options.metrics.map(([label, value]) => `
      <div class="metric">
        <small>${label}</small>
        <strong>${value}</strong>
      </div>
    `).join("");

    return `
      <article class="course-card">
        <header>
          <div>
            <span class="eyebrow">${options.live ? "主线" : "辅助入口"}</span>
            <h2>${options.title}</h2>
          </div>
          <span class="status-pill${options.live ? " is-live" : ""}">${options.badge}</span>
        </header>
        <p>${options.body}</p>
        <div class="metric-row">${metrics}</div>
        <button class="primary-button" data-action="${options.action}" type="button">${options.actionText}</button>
      </article>
    `;
  }

  function renderCatalog() {
    const stage = courseStages.find((item) => item.id === activeStageId) || courseStages[0];
    appRoot.innerHTML = `
      <section class="catalog-layout">
        <aside class="stage-panel">
          <span class="eyebrow">标准课程</span>
          <h2>6 个阶段</h2>
          <div class="stage-list">
            ${courseStages.map((item) => `
              <button class="stage-button${item.id === stage.id ? " is-active" : ""}" data-stage="${item.id}" type="button">
                <strong>第 ${item.range} 节</strong><br />
                ${item.title}
              </button>
            `).join("")}
          </div>
        </aside>

        <section class="catalog-main">
          <div class="catalog-head">
            <div>
              <span class="eyebrow">第 ${stage.range} 节 · ${stage.status}</span>
              <h1>${stage.title}</h1>
              <p>${stage.summary}</p>
            </div>
            <span class="status-pill is-live">${stage.output}</span>
          </div>
          <div class="lesson-grid">
            ${renderLessonCards(stage)}
          </div>
        </section>
      </section>
    `;
  }

  function renderLessonCards(stage) {
    if (!stage.lessons.length) {
      return `
        <article class="demo-note">
          <span class="eyebrow">后续阶段</span>
          <h2>${stage.title}</h2>
          <p>这个阶段先保留在课程地图里，等第一阶段的页面模板稳定后，再逐节展开。</p>
          <button class="ghost-button" data-stage="stage-1" type="button">回到第一阶段</button>
        </article>
      `;
    }

    return stage.lessons.map((lesson) => `
      <article class="lesson-card${lesson.locked ? " is-locked" : ""}">
        <div class="lesson-meta">
          <span class="eyebrow">${lesson.no}</span>
          <span class="lesson-pill">${lesson.status}</span>
        </div>
        <h3>${lesson.title}</h3>
        <p>${lesson.subtitle}</p>
        <div class="tag-row">
          ${(lesson.concept || "").split(" · ").map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
        <button class="${lesson.locked ? "ghost-button" : "primary-button"}" ${lesson.locked ? "disabled" : `data-lesson="${lesson.id}"`} type="button">
          ${lesson.locked ? "规划中" : "开始学习"}
        </button>
      </article>
    `).join("");
  }

  function renderDemo() {
    appRoot.innerHTML = `
      <section class="catalog-layout">
        <aside class="stage-panel">
          <span class="eyebrow">Demo 节点</span>
          <h2>6 关保留体验</h2>
          <p>这条线不计入 48 节正式课程，只保留给玩法和美术展示。</p>
        </aside>
        <section class="catalog-main">
          <div class="catalog-head">
            <div>
              <span class="eyebrow">保留入口</span>
              <h1>作品节点 Demo</h1>
              <p>如果要看完整综合玩法，可以从这里进入旧 6 关体验。</p>
            </div>
            <button class="primary-button" data-demo-lesson="demo-01" type="button">进入第 1 关</button>
          </div>
          <div class="lesson-grid">
            ${demoLessons.map((title, index) => `
              <article class="lesson-card">
                <div class="lesson-meta">
                  <span class="eyebrow">Demo ${String(index + 1).padStart(2, "0")}</span>
                  <span class="lesson-pill">保留</span>
                </div>
                <h3>${title}</h3>
                <p>用于展示原型玩法，不进入正式课程进度。</p>
                <button class="ghost-button" data-demo-lesson="demo-${String(index + 1).padStart(2, "0")}" type="button">查看样张</button>
              </article>
            `).join("")}
          </div>
        </section>
      </section>
    `;
  }

  function renderLesson(lessonId) {
    const lesson = findLesson(lessonId);
    if (!lesson) {
      setRoute({ name: "course" });
      return;
    }

    const stepContent = renderStepContent(lesson);

    appRoot.innerHTML = `
      <section class="lesson-page">
        <div class="breadcrumb">
          <button data-action="open-course" type="button">标准课程</button>
          <span>/</span>
          <button data-stage="stage-1" type="button">第一阶段</button>
          <span>/</span>
          <span>${lesson.no}</span>
        </div>

        <header class="lesson-hero">
          <div class="lesson-title">
            <span class="eyebrow">${lesson.no} · ${lesson.concept}</span>
            <h1>${lesson.title}</h1>
            <p>${lesson.subtitle}</p>
          </div>
          <div class="lesson-progress">
            <div class="progress-tile"><small>目标</small><strong>1 个任务包</strong></div>
            <div class="progress-tile"><small>地图</small><strong>${lesson.map === "turn" ? "转向路线" : "采集上传"}</strong></div>
            <div class="progress-tile"><small>状态</small><strong>${lesson.status}</strong></div>
            <div class="progress-tile"><small>产出</small><strong>课堂记录</strong></div>
          </div>
        </header>

        <section class="lesson-workspace">
          <div class="mission-canvas-panel">
            <canvas id="lessonCanvas" width="860" height="560" aria-label="${lesson.title}地图预览"></canvas>
          </div>

          <aside class="workbench">
            <span class="eyebrow">学习工作台</span>
            <h2>${activeStep}</h2>
            <div class="step-nav">
              ${["观察", "预测", "编程", "验证", "调试", "产出"].map((step) => `
                <button class="step-button${step === activeStep ? " is-active" : ""}" data-step="${step}" type="button">${step}</button>
              `).join("")}
            </div>
            ${stepContent}
          </aside>
        </section>

        <section class="lesson-lower">
          <article class="learning-panel">
            <span class="eyebrow">课堂闭环</span>
            <h2>本节从任务到作品记录</h2>
            <div class="task-flow">
              <div class="task-step"><strong>观察地图</strong><small>起点、目标、路线约束</small></div>
              <div class="task-step"><strong>预测路线</strong><small>先判断，再运行</small></div>
              <div class="task-step"><strong>编写程序</strong><small>把路线变成指令序列</small></div>
              <div class="task-step"><strong>调试复盘</strong><small>用日志解释错误</small></div>
            </div>
            <p>${lesson.target}</p>
          </article>

          <article class="output-panel">
            <span class="eyebrow">课堂产出</span>
            <h2>本节提交内容</h2>
            <p>${lesson.output}</p>
            <div class="reflection-list">
              ${lesson.reflections.map((item) => `
                <div class="reflection-item">
                  <strong>${item}</strong>
                  <small>学生完成后可在这里形成作品卡记录。</small>
                </div>
              `).join("")}
            </div>
          </article>
        </section>
      </section>
    `;

    drawWorldPreview(document.querySelector("#lessonCanvas"), lesson.map);
  }

  function renderStepContent(lesson) {
    if (activeStep === "观察") {
      return `
        <p>${lesson.focus}</p>
        <div class="reflection-list">
          <div class="reflection-item"><strong>起点</strong><small>先找到无人机初始位置和朝向。</small></div>
          <div class="reflection-item"><strong>目标</strong><small>确认信标和中继站的位置。</small></div>
          <div class="reflection-item"><strong>限制</strong><small>观察是否需要转弯、绕路或调试。</small></div>
        </div>
      `;
    }

    if (activeStep === "预测") {
      return `
        <p>运行前先说出路线，不让“试错”替代思考。</p>
        <div class="reflection-list">
          <div class="reflection-item"><strong>我预计会先向东移动</strong><small>预测必须能被运行结果验证。</small></div>
          <div class="reflection-item"><strong>我预计 collect() 的位置</strong><small>动作发生的位置比动作本身更重要。</small></div>
        </div>
      `;
    }

    if (activeStep === "验证") {
      return `
        <div class="tool-row">
          <button class="primary-button" type="button">运行</button>
          <button class="tool-button" type="button">单步</button>
          <button class="tool-button" type="button">复位</button>
        </div>
        <div class="log-stack">
          ${lesson.logs.map((item) => `<div class="log-line is-${item.type}">${item.text}</div>`).join("")}
        </div>
      `;
    }

    if (activeStep === "调试") {
      return `
        <p>每节课都保留一个故意犯错的位置，让学生用日志解释原因。</p>
        <div class="log-stack">
          <div class="log-line is-error">${lesson.map === "turn" ? "走错方向：只看屏幕方向，没有看 HUD 朝向。" : "采集失败：当前位置没有可采集信标。"}</div>
          <div class="log-line">定位错误步骤，再调整指令顺序。</div>
        </div>
      `;
    }

    if (activeStep === "产出") {
      return `
        <p>${lesson.output}</p>
        <div class="reflection-list">
          ${lesson.reflections.map((item) => `<div class="reflection-item"><strong>${item}</strong><small>可作为课后作品卡字段。</small></div>`).join("")}
        </div>
      `;
    }

    return `
      <div class="command-stack">
        ${lesson.commands.map((command, index) => `
          <div class="command-chip">
            <span>${index + 1}</span>
            <strong>${command}</strong>
          </div>
        `).join("")}
      </div>
      <div class="tool-row">
        <button class="primary-button" type="button">运行路线</button>
        <button class="tool-button" type="button">撤销</button>
        <button class="tool-button" type="button">清空</button>
      </div>
    `;
  }

  function findLesson(id) {
    return courseStages.flatMap((stage) => stage.lessons).find((lesson) => lesson.id === id);
  }

  function drawWorldPreview(canvas, variant) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#c9efff");
    sky.addColorStop(0.62, "#edfbff");
    sky.addColorStop(1, "#f8fff4");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(45, 143, 195, 0.22)";
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.7, width * 0.38, height * 0.17, -0.08, 0, Math.PI * 2);
    ctx.fill();

    const cells = variant === "turn"
      ? [
        [1, 1], [2, 1], [3, 1], [4, 1],
        [1, 2], [4, 2],
        [1, 3], [2, 3], [3, 3], [4, 3]
      ]
      : [
        [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
        [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
        [2, 3], [3, 3], [4, 3]
      ];

    const tileW = Math.min(width / 7.8, 92);
    const tileH = tileW * 0.55;
    const originX = width * 0.5;
    const originY = height * 0.22;

    function point(x, y, lift = 0) {
      return {
        x: originX + (x - y) * tileW * 0.5,
        y: originY + (x + y) * tileH * 0.5 - lift
      };
    }

    cells.sort((a, b) => a[0] + a[1] - b[0] - b[1]).forEach(([x, y], index) => {
      const top = point(x, y);
      const right = { x: top.x + tileW / 2, y: top.y + tileH / 2 };
      const bottom = { x: top.x, y: top.y + tileH };
      const left = { x: top.x - tileW / 2, y: top.y + tileH / 2 };
      ctx.fillStyle = index % 2 === 0 ? "#91ce57" : "#83c54e";
      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(right.x, right.y);
      ctx.lineTo(bottom.x, bottom.y);
      ctx.lineTo(left.x, left.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(62, 106, 52, 0.18)";
      ctx.lineWidth = 2;
      ctx.stroke();

      if (index % 3 === 0) {
        const center = point(x, y, -tileH * 0.48);
        ctx.fillStyle = "#5da843";
        ctx.beginPath();
        ctx.ellipse(center.x + 8, center.y, 7, 16, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const path = variant === "turn"
      ? [[1, 1], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [3, 3], [2, 3]]
      : [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1]];

    ctx.strokeStyle = "rgba(36, 125, 199, 0.72)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    path.forEach(([x, y], index) => {
      const p = point(x, y, -tileH * 0.5);
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    const start = point(path[0][0], path[0][1], -tileH * 0.72);
    drawMarker(ctx, start.x, start.y, "#f0b63a", "S");

    const beaconCoord = variant === "turn" ? [4, 1] : [3, 1];
    const beacon = point(beaconCoord[0], beaconCoord[1], -tileH * 0.84);
    drawBeacon(ctx, beacon.x, beacon.y);

    const relayCoord = variant === "turn" ? [2, 3] : [5, 1];
    const relay = point(relayCoord[0], relayCoord[1], -tileH * 0.72);
    drawMarker(ctx, relay.x, relay.y, "#b54fd1", "R");

    if (variant === "home") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
      roundRect(ctx, width * 0.07, height * 0.09, width * 0.32, 74, 8);
      ctx.fillStyle = "#1e313c";
      ctx.font = "900 22px Avenir Next, sans-serif";
      ctx.fillText("48 节课程地图", width * 0.1, height * 0.16);
      ctx.fillStyle = "#0d8a76";
      ctx.font = "800 15px Avenir Next, sans-serif";
      ctx.fillText("从第 1 阶段开始", width * 0.1, height * 0.2);
    }
  }

  function drawMarker(ctx, x, y, color, label) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "900 18px Avenir Next, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y + 1);
    ctx.restore();
  }

  function drawBeacon(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = "#e64d62";
    ctx.beginPath();
    ctx.moveTo(x, y - 30);
    ctx.lineTo(x + 17, y + 12);
    ctx.lineTo(x - 17, y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.62)";
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 18);
    ctx.lineTo(x + 4, y + 5);
    ctx.lineTo(x - 9, y + 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
  }

  appRoot.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    const stageId = event.target.closest("[data-stage]")?.dataset.stage;
    const lessonId = event.target.closest("[data-lesson]")?.dataset.lesson;
    const demoLessonId = event.target.closest("[data-demo-lesson]")?.dataset.demoLesson;
    const step = event.target.closest("[data-step]")?.dataset.step;

    if (action === "open-course") {
      setRoute({ name: "course" });
      return;
    }
    if (action === "open-demo") {
      setRoute({ name: "demo" });
      return;
    }
    if (stageId) {
      activeStageId = stageId;
      setRoute({ name: "course" });
      return;
    }
    if (lessonId) {
      activeStep = "编程";
      setRoute({ name: "lesson", track: "course", lessonId });
      return;
    }
    if (demoLessonId) {
      activeStep = "编程";
      setRoute({ name: "demo" });
      return;
    }
    if (step) {
      activeStep = step;
      render();
    }
  });

  navButtons.forEach((button) => {
    button.addEventListener("click", () => setRoute({ name: button.dataset.route }));
  });

  homeButton.addEventListener("click", () => setRoute({ name: "home" }));

  render();
})();
