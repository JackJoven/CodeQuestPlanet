(function (root) {
  "use strict";
  const A = () => root.CodeQuestAlgorithmLessons;
  const E = () => root.CodeQuestEvidence;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  const guides = {
    33: ["要从一排货舱里找到指定编号，怎样才不会漏掉？", "从左到右看一个、比一个；相同就停。", "全部看完仍没有，明确回答“没找到”。", "线性查找不要求事先排序。", "第 10 章 · 线性查找"],
    34: ["最省能量的货舱可能有危险标记，应该怎么选？", "先读安全标记，把危险货舱排除。", "只在安全货舱中比较能量。", "这是在书中线性遍历上扩展的筛选任务。", "项目应用 · 遍历与筛选"],
    35: ["怎样让能量小的货舱排前面，又不打乱同分 A、B？", "从左到右比较相邻两个货舱。", "左边更大才交换；一轮后较大的来到右侧。", "相等时不交换，所以同分顺序能保留。", "第 11 章 · 冒泡排序"],
    36: ["数据已经排好序，怎样更快找到目标频段？", "先看当前范围中间的数。", "根据大小关系，丢掉不可能的半边。", "只有有序数据才能这样排除一半。", "第 10 章 · 二分查找"],
    37: ["地图上的格子怎样交给搜索算法处理？", "把每个可走格子看作一个点。", "从当前点检查上下左右，连到可走的邻居。", "墙和地图外的位置不是邻居。", "第 9 章 · 图的表示"],
    38: ["绕圈的地图里，怎样避免同一格反复排队？", "第一次发现邻居时就记下它。", "以后再遇到它，不再加入待处理集合。", "“已发现”不等于 Nova 已经走过。", "第 9 章 · 图搜索"],
    39: ["如果想沿一条路走到底，碰到死路再退回来？", "把新发现的格子放到栈顶。", "每次先拿最后加入的格子；死路时返回岔口。", "深度优先能找路，但第一条路未必最短。", "第 9 章 · 深度优先搜索"],
    40: ["找到了宝石，还需要什么才能让 Nova 真正走过去？", "用栈探索并记住已发现的格子。", "第一次发现邻居时，记下它从哪里来。", "从终点沿前驱倒推，才能得到实际路线。", "项目综合 · 图搜索与路径"],
    41: ["每走一步花费相同，怎样找到步数最少的路线？", "把起点放进队列。", "先处理早加入的格子，一层一层向外扩张。", "仅在每步代价相同时，首次到达才保证最少步数。", "第 9 章 · 广度优先搜索"],
    42: ["搜索访问了很多格，哪些格才是到宝石的路线？", "发现邻居时，记下它来自哪个格子。", "到达终点后沿记录向起点倒推，再反转。", "访问顺序不是行走路线。", "项目应用 · 广度优先与路径还原"],
    43: ["近路上有耗能地形，最少步数还是最省能量吗？", "把每条候选路线的进入能耗累加。", "先处理目前累计能耗最低的候选。", "这是书中有权图与贪心思想的延伸；要求能耗非负。", "项目进阶 · 带权最短路"],
    44: ["目标被墙隔开时，搜索应该怎样结束？", "只让没发现过的格子入队。", "队列空了仍未找到，就回答“不可达”。", "空路线不能假装成成功。", "项目调试 · 图搜索边界"],
    45: ["要依次补给，每次先去眼前最近的一站会怎样？", "从当前位置算到各站的距离。", "选择最近的一站，再从新位置重新比较。", "局部最近容易执行，却不保证总路程最短。", "第 15 章 · 贪心思想"],
    46: ["怎样证明“每次去最近站”并不总是最好？", "先算贪心路线的总距离。", "小规模下试遍其他访问顺序并比较。", "只要找到一条更短路线，就是反例。", "第 15 章 · 贪心反例"],
    47: ["每次能走 1 或 2 阶，走到楼顶一共有几种方式？", "到第 n 阶，最后一步来自 n−1 或 n−2 阶。", "两类走法相加；算过的阶数记下来，下次直接用。", "站在第 0 阶也算 1 种起始状态。", "第 14 章 · 爬楼梯与记忆化"],
    48: ["同一张地图，要求变成“最少步数”或“最低能耗”，路线还一样吗？", "先读本题究竟要优化什么。", "按目标选搜索方法，再记录前驱并走通路线。", "这是把前面方法组合起来的项目关卡。", "项目综合 · 路线规划"]
  };

  function reportFrame(context) {
    const playback = context.playback;
    const frames = playback?.execution?.events?.slice(0, playback.index).filter(event => event.type === "report") || [];
    const selected = Number.isInteger(playback?.reviewIndex) ? Math.min(playback.reviewIndex, frames.length - 1) : frames.length - 1;
    return { frames, selected, event: frames[selected] || null, report: frames[selected]?.report || null };
  }

  function arrayView(m, report) {
    const values = report?.[0] === "swap" || report?.[0] === "compare" ? report[3]
      : report?.[0] === "result" && m.lessonNo === 35 ? report[1] : m.algorithm.values;
    const active = report?.[0] === "check" ? [report[1]] : report?.[0] === "middle" ? [report[2]]
      : report?.[0] === "candidate" ? [report[2]] : ["swap", "compare"].includes(report?.[0]) ? [report[1], report[2]] : [];
    const caption = m.lessonNo === 33 ? `要找的宝石编号：${m.algorithm.target}`
      : m.lessonNo === 34 ? "先看安全标记，再在安全货舱中选最低能量"
        : m.lessonNo === 35 ? "把能量从小到大排好；同分 A、B 保留先后"
          : `要找的频段：${m.algorithm.target} · 数据已排序`;
    return `<div class="algorithm-data-track" role="img" aria-label="${esc(m.early.title)}数据轨道">${values.map((item, index) => {
      const text = m.lessonNo === 34 ? `${item[0]} 能量` : Array.isArray(item) ? `${item[0]}${item[1]}` : item;
      const excluded = report?.[0] === "middle" && (index < report[1] || index > report[3]);
      return `<div class="algorithm-data-cell${active.includes(index) ? " is-current" : ""}${excluded ? " is-excluded" : ""}${m.lessonNo === 34 && !item[1] ? " is-unsafe" : ""}"><small>${index}</small><strong>${esc(text)}</strong>${m.lessonNo === 34 ? `<em>${item[1] ? "安全" : "危险"}</em>` : ""}${active.includes(index) ? '<b aria-hidden="true">▼</b>' : ""}</div>`;
    }).join("")}</div><p class="algorithm-track-caption">${esc(caption)}</p>`;
  }

  function graphView(m, report) {
    const grid = m.algorithm.grid;
    const width = grid[0].length;
    const state = report?.[0] === "expand" ? { current: report[1], frontier: report[2], visited: report[3] }
      : report?.[0] === "discover" ? { current: report[2], frontier: report[3], visited: report[4] }
        : report?.[0] === "path" ? { path: report[1], current: m.algorithm.goal }
          : report?.[0] === "neighbors" ? { current: report[1], frontier: report[2] } : {};
    const frontier = new Set(state.frontier || []), visited = new Set(state.visited || []), path = new Set(state.path || []);
    const cells = grid.flatMap((row, y) => [...row].map((tile, x) => {
      const id = y * width + x, wall = tile === "#" || tile === "_";
      const classes = [wall ? "is-wall" : "is-open", visited.has(id) ? "is-visited" : "", frontier.has(id) ? "is-frontier" : "", path.has(id) ? "is-path" : "", state.current === id ? "is-current" : ""].join(" ");
      const cost = m.algorithm.costs?.[id] || 1;
      const label = tile === "S" ? "起" : tile === "B" ? "宝" : state.current === id ? "●" : frontier.has(id) ? "+" : path.has(id) ? "•" : (m.lessonNo === 43 || m.lessonNo === 48) && !wall && cost > 1 ? cost : "";
      return `<div class="algorithm-map-cell ${classes}" title="(${x}, ${y})${(m.lessonNo === 43 || m.lessonNo === 48) && !wall ? ` · 能耗 ${cost}` : ""}" aria-label="${wall ? "墙" : `格子 ${x},${y}${(m.lessonNo === 43 || m.lessonNo === 48) ? `，进入能耗 ${cost}` : ""}${state.current === id ? "，当前" : frontier.has(id) ? "，待处理" : visited.has(id) ? "，已访问" : ""}`}">${label}</div>`;
    })).join("");
    return `<div class="algorithm-map" style="--algorithm-columns:${width}" role="img" aria-label="${esc(m.early.title)}探索地图">${cells}</div>`;
  }

  function routeView(m, report, context) {
    if (m.lessonNo === 47) {
      const n = m.algorithm.n;
      const focus = ["call", "cache-hit", "computed", "store"].includes(report?.[0]) ? report[1] : null;
      const frame = reportFrame(context);
      const known = new Map([[0, 1], [1, 1]]);
      frame.frames.slice(0, frame.selected + 1).forEach(item => { if (item.report?.[0] === "store") known.set(item.report[1], item.report[2]); });
      if (report?.[0] === "computed") known.set(report[1], report[2]);
      const status = report?.[0] === "result" ? `答案 ${esc(report[1])} · 调用 ${esc(report[2])} 次`
        : report?.[0] === "cache-hit" ? `缓存命中 ways(${esc(report[1])})，直接使用旧答案`
          : report?.[0] === "store" ? `存入 ways(${esc(report[1])}) = ${esc(report[2])}`
            : report?.[0] === "computed" ? `这次算出 ways(${esc(report[1])}) = ${esc(report[2])}`
              : report?.[0] === "call" ? `正在求 ways(${esc(report[1])})` : "观察同一个子问题如何重复出现";
      const node = (value, duplicate = false) => `<span class="algorithm-dependency-node${focus === value ? " is-current" : ""}${duplicate ? " is-duplicate" : ""}">ways(${value})</span>`;
      return `<div class="algorithm-route-readout"><strong>爬楼梯：每次走 1 或 2 阶</strong><div class="algorithm-stairs" role="img" aria-label="从第 0 阶到第 ${n} 阶，逐步记录每阶的走法数">${Array.from({ length: n + 1 }, (_, value) => `<div class="algorithm-stair${focus === value ? " is-current" : ""}${known.has(value) ? " is-known" : ""}"><strong>${value}</strong><small>${known.has(value) ? `${known.get(value)} 种` : "待算"}</small></div>`).join("")}</div><span>${status}</span><details class="algorithm-dependency-detail"><summary>为什么会重复计算？</summary><div class="algorithm-dependency-tree" role="img" aria-label="ways(${n}) 分成 ways(${n - 1}) 和 ways(${n - 2})，两侧都包含 ways(${n - 3})"><div>${node(n)}</div><div>${node(n - 1)}${node(n - 2)}</div><div>${node(n - 3, true)}${node(n - 3, true)}</div></div><small>两个分支都可能再次问到第 ${n - 3} 阶的走法数；存下答案就不用重算。</small></details></div>`;
    }
    const route = report?.[0] === "choose" || report?.[0] === "candidate" || report?.[0] === "result" ? report[1] : [];
    const cost = Array.isArray(route) && route.length > 1 ? A().routeCost(m.algorithm.points, route) : null;
    const names = ["S", "A", "B", "C"];
    const points = new Map(m.algorithm.points.map(([x, y], index) => [`${x},${y}`, index]));
    const map = Array.from({ length: 7 }, (_, y) => Array.from({ length: 11 }, (_, x) => {
      const index = points.get(`${x},${y}`), active = Array.isArray(route) && route.includes(index);
      return `<span class="algorithm-point-cell${index === undefined ? "" : " is-point"}${active ? " is-selected" : ""}" title="(${x}, ${y})">${index === undefined ? "" : names[index]}</span>`;
    }).join("")).join("");
    return `<div class="algorithm-route-readout"><strong>补给站：S · A · B · C</strong><div class="algorithm-point-map" role="img" aria-label="S、A、B、C 四个补给站在坐标网格中的位置">${map}</div><span>当前路线 ${Array.isArray(route) && route.length ? route.map(index => names[index]).join(" → ") : "等待运行"}${cost === null ? "" : ` · 已走距离 ${cost}`}</span><small>距离按横向格数＋纵向格数计算</small></div>`;
  }

  function plainStep(m, report) {
    if (!report) return "先看题目和图，再选规则。运行后这里会解释每一步发生了什么。";
    const [kind, a, b, c, d] = report;
    const cell = id => {
      const width = m.algorithm.grid?.[0]?.length || 13;
      return `(${id % width}, ${Math.floor(id / width)})`;
    };
    if (kind === "check") return m.lessonNo === 34
      ? `正在看第 ${a + 1} 个货舱：能量 ${b[0]}，${b[1] ? "安全，可以参与比较" : "危险，不能选"}。`
      : `正在看第 ${a + 1} 个位置，值是 ${Array.isArray(b) ? b[0] : b}。${b === m.algorithm.target ? "它就是目标！" : "还不是目标，继续看。"}`;
    if (kind === "candidate") return m.lessonNo === 34 ? `比较后，当前最合适的是第 ${b + 1} 个货舱。`
      : `发现一条候选路线，当前距离 ${b}。`;
    if (kind === "compare") return `比较相邻的第 ${a + 1}、${b + 1} 个货舱：${c[a][0]} 和 ${c[b][0]}。`;
    if (kind === "swap") return `左边更大，交换第 ${a + 1}、${b + 1} 个货舱。`;
    if (kind === "middle") return `只看索引 ${a}～${c}；中点是 ${b}，值为 ${d}。`;
    if (kind === "neighbors") return `从格子 ${cell(a)} 出发，找到 ${b.length} 个能走的邻居。`;
    if (kind === "expand") return `现在处理格子 ${cell(a)}。待处理还有 ${b.length} 格，已发现 ${c.length} 格。`;
    if (kind === "discover") return `从 ${cell(b)} 首次发现 ${cell(a)}，把它加入待处理集合。`;
    if (kind === "path") return a.length ? `沿前驱倒推后，得到 ${a.length} 格连续路线。` : "搜索结束，但没有找到可走的路线。";
    if (kind === "missing-parent") return `发现 ${cell(a)} 时没有记录从哪里来，稍后可能无法还原路线。`;
    if (kind === "choose") return `从当前位置选下一站：${a.map(i => ["S", "A", "B", "C"][i]).join(" → ")}。`;
    if (kind === "call") return `现在要求爬到第 ${a} 阶的走法数。`;
    if (kind === "cache-hit") return `第 ${a} 阶已经算过，直接读取答案。`;
    if (kind === "computed") return `刚算出第 ${a} 阶有 ${b} 种走法。`;
    if (kind === "store") return `算出第 ${a} 阶有 ${b} 种走法，记下来备用。`;
    if (kind === "result") return m.lessonNo === 47 ? `最终有 ${a} 种走法，共调用 ${b} 次。`
      : Array.isArray(a) ? `得到结果：${m.algorithm.mode === "route" ? a.map(i => ["S", "A", "B", "C"][i]).join(" → ") : "排序或路线已完成"}。`
        : a === -1 || a === "no-path" ? "检查结束，没有找到目标。" : `本次结果是 ${a}。`;
    return "观察图中当前高亮的元素和下一步变化。";
  }

  function frontierView(m, report) {
    if (m.algorithm.mode !== "graph") return "";
    let queue = null;
    if (report?.[0] === "expand") queue = report[2];
    if (report?.[0] === "discover") queue = report[3];
    if (report?.[0] === "neighbors") queue = report[2];
    if (!Array.isArray(queue)) return "";
    const width = m.algorithm.grid[0].length;
    const stack = m.lessonNo === 39 || m.lessonNo === 40;
    const weighted = m.lessonNo === 43 || m.lessonNo === 48 && m.algorithm.objective === "energy";
    const label = stack ? "待处理栈" : weighted ? "候选集合" : "待处理队列";
    const order = stack ? "右边先取" : weighted ? "按累计能耗选最小" : "左边先取";
    return `<div class="algorithm-frontier"><strong>${label}</strong><small>${order}</small><div>${queue.length ? queue.slice(0, 8).map(id => `<span>(${id % width},${Math.floor(id / width)})</span>`).join("") : "<span>空</span>"}${queue.length > 8 ? `<small>另有 ${queue.length - 8} 格</small>` : ""}</div></div>`;
  }

  function guide(m) {
    const [question, first, second, boundary, source] = guides[m.lessonNo];
    const input = m.algorithm.mode === "array" ? m.lessonNo === 34 ? "输入：每个货舱的能量与安全标记"
      : `输入：${m.algorithm.values.length} 个数${m.algorithm.target === undefined ? "" : `，目标 ${m.algorithm.target}`}`
      : m.algorithm.mode === "memo" ? `输入：${m.algorithm.n} 阶楼梯，每步可走 1 或 2 阶`
        : m.algorithm.mode === "route" ? "输入：四个补给站的位置"
          : `输入：地图起点、${m.lessonNo === 37 || m.lessonNo === 44 ? "可走格" : "宝石终点"}${m.lessonNo === 43 || m.lessonNo === 48 ? "与进入格子的能耗" : ""}`;
    return `<section class="algorithm-guide" aria-label="先看懂这道题"><div class="algorithm-guide-top"><span>先看懂这道题</span><small>${esc(source)}</small></div><h3>${esc(question)}</h3><p class="algorithm-guide-input">${esc(input)}</p><ol><li>${esc(first)}</li><li>${esc(second)}</li></ol><p class="algorithm-guide-boundary">记住：${esc(boundary)}</p></section>`;
  }

  function liveView(m, context) {
    const frame = reportFrame(context), report = frame.report;
    const body = m.algorithm.mode === "array" ? arrayView(m, report) : m.algorithm.mode === "graph" ? graphView(m, report) : routeView(m, report, context);
    const status = plainStep(m, report);
    const progress = m.algorithm.mode === "graph" && ["expand", "discover"].includes(report?.[0])
      ? `<p class="algorithm-state-count">待处理 ${esc(report[0] === "expand" ? report[2].length : report[3].length)} 格 · 已发现 ${esc(report[0] === "expand" ? report[3].length : report[4].length)} 格</p>` : "";
    const playback = context.playback;
    const controls = frame.frames.length ? `<div class="algorithm-review"><span>步骤 ${frame.selected + 1} / ${frame.frames.length}${Number.isInteger(playback.reviewIndex) ? " · 正在回看" : ""}</span><div><button type="button" data-lesson-action="review-first" ${frame.selected <= 0 || playback.playing ? "disabled" : ""} aria-label="回看第一步">⏮</button><button type="button" data-lesson-action="review-back" ${frame.selected <= 0 || playback.playing ? "disabled" : ""} aria-label="回看上一步">← 上一步</button><button type="button" data-lesson-action="review-next" ${frame.selected >= frame.frames.length - 1 || playback.playing ? "disabled" : ""} aria-label="回看下一步">下一步 →</button><button type="button" data-lesson-action="review-latest" ${frame.selected >= frame.frames.length - 1 || playback.playing ? "disabled" : ""} aria-label="回到最新一步">⏭</button><button type="button" data-lesson-action="review-speed" ${playback.finished ? "disabled" : ""} aria-label="调整播放速度">${playback.speed || 1}× 速度</button></div></div>` : "";
    const legend = m.algorithm.mode === "memo" ? "金色＝正在计算 · 绿色＝已有答案"
      : m.algorithm.mode === "route" ? "金色＝已选站点 · 路线旁显示累计距离"
        : m.algorithm.mode === "array" ? "金色＝正在检查 · 变暗＝已排除"
          : m.lessonNo === 43 || m.lessonNo === 48 ? "数字＝能耗 · 金色＝当前 · 蓝色＝待处理"
            : "金色＝当前 · 蓝色＝待处理 · 绿色＝路线";
    return `<div class="algorithm-live"><div class="algorithm-live-head"><strong>${m.algorithm.mode === "array" ? "数据轨道" : m.algorithm.mode === "graph" ? "探索状态" : "策略轨迹"}</strong><span>${legend}</span></div>${body}${progress}${frontierView(m, report)}<p class="algorithm-live-status" role="status">${esc(status)}</p>${controls}</div>`;
  }

  function code(m, d, context) {
    if (Object.keys(A().definitions[m.lessonNo].fields).some(name => !d.fields[name]))
      return `<details class="parameter-code algorithm-code"><summary>查看实际运行的 Python</summary><p>先选择全部规则，再查看由你的选择生成的 Python。</p></details>`;
    const source = A().source(m, d, true);
    const currentLine = Number.isInteger(context.playback?.reviewIndex) ? reportFrame(context).event?.line : context.playback?.event?.line;
    return `<details class="parameter-code algorithm-code"><summary>查看实际运行的 Python</summary><pre>${source.split("\n").map((line, index) => `<span class="${currentLine === index + 1 ? "is-active" : ""}">${esc(String(index + 1).padStart(2, "0"))}  ${esc(line)}</span>`).join("")}</pre></details>`;
  }

  function evidence(m, attempt) {
    if (!attempt) return "";
    const detail = attempt.evidence || {};
    const readable = value => {
      if (value === null || value === undefined) return "尚无结果";
      if (value === -1 || value === "no-path") return "未找到";
      if (Array.isArray(value)) {
        if (m.lessonNo === 37) { const width = m.algorithm.grid[0].length; return value.map(id => `(${id % width},${Math.floor(id / width)})`).join("、"); }
        if (m.algorithm.mode === "route") return value.map(id => ["S", "A", "B", "C"][id]).join(" → ");
        return value.map(item => Array.isArray(item) ? item.join("") : item).join(" → ");
      }
      if (typeof value === "number") {
        if ([33, 34, 36].includes(m.lessonNo)) return `第 ${value + 1} 个位置（索引 ${value}）`;
        if (m.lessonNo === 47) return `${value} 种走法`;
        if ([41, 42].includes(m.lessonNo) || m.lessonNo === 48 && m.algorithm.objective === "steps") return `${value} 步`;
        if ([43, 48].includes(m.lessonNo)) return `${value} 点能耗`;
        if (m.lessonNo === 46) return `${value} 格距离`;
      }
      return String(value);
    };
    return `<details class="early-result early-evidence-disclosure"><summary><span>这次运行的结果</span><strong>${attempt.success ? "规则通过验证" : "再调整一次"}</strong></summary><div class="early-evidence-body"><p>${esc(attempt.failure || "结果和关键步骤都通过了验证。")}</p><p>得到：${esc(readable(detail.result))} · 目标：${esc(readable(detail.expected))}</p><p>程序记录了 ${esc((detail.reports || []).length)} 个可观察步骤${m.algorithm.mode === "graph" ? `，找到 ${esc(detail.path?.length || 0)} 格路线` : ""}。</p><details><summary>查看每一步的文字记录</summary><ol>${(detail.reports || []).map(item => `<li>${esc(plainStep(m, item))}</li>`).join("")}</ol></details></div></details>`;
  }

  function render(m, p, context = {}) {
    const d = A().draft(p, m.lessonNo), gate = E().stateGate(p, A().revision(m.lessonNo));
    const latest = p.attempts.at(-1), attempt = latest?.challengeKey === m.early.key ? latest : null;
    return `<section class="early-lesson-shell algorithm-lesson-shell"><div class="early-heading"><h2>${esc(m.early.title)}</h2><span>第 ${m.lessonNo} 课</span></div>
      <div class="early-phases algorithm-phases"><button type="button" disabled aria-pressed="${!m.early.independent}"><span>1</span>跟着例子试${gate.guided ? " ✓" : ""}</button><button type="button" disabled aria-pressed="${m.early.independent}"><span>2</span>换题自己做${gate.transfer ? " ✓" : ""}</button></div>
      ${guide(m)}
      ${m.lessonNo === 48 ? `<p class="algorithm-task-target">本题验收：${m.algorithm.objective === "energy" ? "实际消耗能量必须最低" : "实际行走步数必须最少"}。${m.early.independent ? "这次目标与上一题不同，请重新选择。" : "下一题会切换目标。"}</p>` : ""}
      ${liveView(m, context)}
      <section class="algorithm-decide" aria-label="选择算法规则"><div class="algorithm-section-head"><span>现在轮到你</span><h3>选规则，看看算法怎样走</h3></div><p>${esc(m.early.goal)}</p><div class="algorithm-fields">${Object.entries(A().definitions[m.lessonNo].fields).map(([name, options], index) => `<label class="parameter-field"><span>${index + 1}. ${esc({ scan: "要检查哪些位置？", missing: "如果找不到呢？", filter: "先做哪一步？", comparison: "什么时候交换？", equality: "同分怎么办？", middle: "先看哪里？", shrink: "接下来保留哪半边？", order: "按什么顺序看邻居？", visited: "何时记下已发现？", container: "先处理哪个候选？", parent: "怎样记住来路？", measure: "这题比较什么？", noPath: "无路时怎么回答？", score: m.lessonNo === 34 ? "安全候选里怎么选？" : "下一站怎么选？", method: "怎样找更好的路线？", memo: "算过的阶数怎么办？", objective: "本题要优化什么？" }[name] || name)}</span><select data-lesson-field="${esc(name)}" aria-label="${esc(name)}" ${context.running ? "disabled" : ""}><option value="">请选择一种做法</option>${options.map(([value, label]) => `<option value="${esc(value)}" ${d.fields[name] === value ? "selected" : ""}>${esc(label)}</option>`).join("")}</select></label>`).join("")}</div><p class="algorithm-run-hint">选完规则，点击下方“运行”自动播放，或点“单步”慢慢看。</p></section>
      <details class="algorithm-concept"><summary>为什么这样做？</summary><p>${esc(A().explanations[m.lessonNo])}</p><p><strong>本课要点：</strong>${esc(m.early.rule)}</p></details>
      ${code(m, d, context)}<details class="early-help-details"><summary>需要帮助？</summary><div class="early-help">${m.early.hints.map((hint, index) => `<button data-early-action="hint" data-value="${index + 1}" ${context.running ? "disabled" : ""}>${index + 1} 级：${esc(hint)}</button>`).join("")}</div>${p.hintLevel ? `<p class="early-hint">${esc(m.early.hints[p.hintLevel - 1])}</p>` : ""}</details>
      ${evidence(m, attempt)}${attempt?.success && !m.early.independent && !p.mastered ? `<button class="early-primary" data-early-action="next">换题独立验证 →</button>` : ""}
      ${p.mastered ? `<p class="early-mastery">已掌握：两张语义不同的任务都留下了程序证据。</p>` : ""}<p class="early-storage">${esc(context.storage || "已自动保存")}</p></section>`;
  }

  function builder(m, p, context = {}) {
    const d = A().draft(p, m.lessonNo), event = context.playback?.event;
    return { palette: `<div class="algorithm-ready-card"><strong>已准备好运行</strong><small>本课算法会使用你在上方选的规则。</small></div>`,
      list: d.commands.map(item => `<li data-program-step="command-${item.id}" class="program-chip${event && event.type !== "data-complete" ? " is-current" : ""}"><div class="program-command-summary"><span>✓</span><strong>${esc(m.early.title)}</strong></div></li>`).join(""),
      definition: "", hideFunctionTab: true, count: d.commands.length, undo: Boolean(d.undo),
      feedback: `${event ? `<p class="parameter-live-flow" role="status">${esc(event.message)}</p>` : ""}${context.notice ? `<p class="early-feedback" role="status">${esc(context.notice)}</p>` : ""}` };
  }

  root.CodeQuestAlgorithmLessonUI = { render, builder };
})(typeof globalThis !== "undefined" ? globalThis : window);
