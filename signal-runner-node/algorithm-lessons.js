(function (root) {
  "use strict";

  const E = () => root.CodeQuestEvidence;
  const copy = value => E().clone(value);
  const revision = no => `2.0-${String(no).padStart(2, "0")}.1`;
  const terrain = () => ({ version: "1.8", heights: {}, stairs: [], portals: [], switches: [], gates: [], oneWays: [], rotators: [], conveyors: [], supplies: [] });
  const definitions = {
    33: { title: "逐项寻找宝石", goal: "让程序逐个检查货舱，并明确处理找不到的情况。", rule: "当前值等于目标才返回索引；全查完返回 -1。", fields: { scan: [["loop", "遍历全部货舱"], ["first", "只看第一个"]], missing: [["minus", "找不到返回 -1"], ["zero", "找不到返回 0"]] }, correct: { scan: "loop", missing: "minus" }, hint: ["先想目标可能在哪个索引。", "遍历需要在每次检查后继续。", "未命中时应明确返回 -1。"] },
    34: { title: "筛选安全目标", goal: "先排除危险货舱，再从安全货舱里选能量最低的。", rule: "先筛选，再比较；不能让危险的低能量货舱混进候选。", fields: { filter: [["before", "先过滤危险货舱"], ["after", "先挑最小，再看是否安全"]], score: [["minimum", "安全目标中选最低能量"], ["maximum", "安全目标中选最高能量"]] }, correct: { filter: "before", score: "minimum" }, hint: ["先看每个货舱的安全标记。", "危险货舱即使数字最小也不能选。", "只在安全候选里比较能量。"] },
    35: { title: "稳定货舱排序", goal: "用相邻比较和交换把货舱从小到大排列；同分货舱保留原顺序。", rule: "相等时不交换，才能保持稳定。", fields: { comparison: [["greater", "左边更大才交换"], ["smaller", "左边更小才交换"]], equality: [["keep", "相等时保留顺序"], ["swap", "相等时也交换"]] }, correct: { comparison: "greater", equality: "keep" }, hint: ["一轮只会把一个较大值推向后面。", "比较的是相邻两个数。", "同分 A 应继续排在同分 B 前。"] },
    36: { title: "折半锁定频段", goal: "在有序数据里检查中点，并把不可能的一半排除。", rule: "二分搜索的前提是数据有序。", fields: { middle: [["center", "取区间中点"], ["left", "总取最左端"]], shrink: [["correct", "按大小缩小正确半区"], ["reverse", "方向写反"]] }, correct: { middle: "center", shrink: "correct" }, hint: ["先看数据是否已经有序。", "每次比较中点。", "目标更大时，左边界越过中点。"] },
    37: { title: "地图变成图", goal: "把当前格当作节点，按方向顺序列出可走的邻居。", rule: "墙和地图外的格子不是邻居。", fields: { order: [["NESW", "北→东→南→西"], ["ESWN", "东→南→西→北"]] }, correct: { order: "NESW" }, hint: ["一个格子就是一个节点。", "只看上下左右四个方向。", "按北、东、南、西记录可通行邻居。"] },
    38: { title: "访问标记", goal: "首次发现格子就标记，让它不会重复进入前沿。", rule: "visited 是已发现集合，不只是已经走过的路线。", fields: { visited: [["eager", "发现时立即标记"], ["late", "取出时才标记"], ["none", "完全不标记"]] }, correct: { visited: "eager" }, hint: ["观察前沿是否出现同一个格子。", "加入前沿时就可以记下已发现。", "标记越晚，重复候选越多。"] },
    39: { title: "深度优先与回溯", goal: "用后进先出的栈深入通道，死路时退回最近的岔口。", rule: "DFS 能找到路，但第一条路线不保证最短。", fields: { container: [["stack", "栈：最后加入先取"], ["queue", "队列：最早加入先取"]], visited: [["eager", "发现时标记"], ["none", "不标记"]] }, correct: { container: "stack", visited: "eager" }, hint: ["死路之后要回到最近的岔口。", "后进先出对应栈。", "还需要 visited 防止在环里绕圈。"] },
    40: { title: "阶段任务：未知区", goal: "组合容器、访问标记和前驱，还原 Nova 可以真实走通的路线。", rule: "搜索到目标之后仍要还原并走完路径。", fields: { container: [["stack", "栈"], ["queue", "队列"]], visited: [["eager", "发现时标记"], ["none", "不标记"]], parent: [["first", "首次发现时记录前驱"], ["off", "不记录前驱"]] }, correct: { container: "stack", visited: "eager", parent: "first" }, hint: ["前沿保存待处理格子。", "visited 保证搜索终止。", "前驱表才能把终点接回起点。"] },
    41: { title: "广度优先搜索", goal: "用队列逐层扩张，在等权地图中找最少步数。", rule: "第一次到达目标时，层数就是最短距离。", fields: { container: [["queue", "队列"], ["stack", "栈"]], visited: [["eager", "发现时标记"], ["none", "不标记"]] }, correct: { container: "queue", visited: "eager" }, hint: ["同一层的格子先于下一层处理。", "先进先出对应队列。", "发现时就标记避免重复入队。"] },
    42: { title: "前驱与路径还原", goal: "从终点沿前驱表倒推，得到连续路线并让 Nova 走一遍。", rule: "前驱记录的是首次发现时从哪个格子来。", fields: { parent: [["first", "首次发现时记录"], ["off", "不记录前驱"]], container: [["queue", "队列"], ["stack", "栈"]] }, correct: { parent: "first", container: "queue" }, hint: ["访问顺序不是路径。", "每个节点记录它从哪里来。", "从终点倒着插入，直到起点。"] },
    43: { title: "带权最短路", goal: "比较最少步数与最低能耗，优先处理累计代价最低的候选。", rule: "所有代价非负时可以使用 Dijkstra 思路。", fields: { container: [["priority", "最低累计代价优先"], ["queue", "只按步数排队"]], measure: [["energy", "累计能耗"], ["steps", "只数步数"]] }, correct: { container: "priority", measure: "energy" }, hint: ["最短路线未必最省能量。", "累计代价要随边更新。", "每次处理当前代价最低的候选。"] },
    44: { title: "搜索调试", goal: "修复重复访问与无路时的终止行为。", rule: "前沿空了必须明确报告不可达。", fields: { visited: [["eager", "发现时标记"], ["none", "不标记"]], noPath: [["return", "返回不可达"], ["pretend", "把空路径当成功"]] }, correct: { visited: "eager", noPath: "return" }, hint: ["先看重复节点是不是又入队了。", "没有 visited 会反复扩张。", "前沿耗尽时返回不可达。"] },
    45: { title: "贪心多目标", goal: "每一步根据当前位置选择最近补给站，并记录最终路线。", rule: "局部最近只是策略，不能保证全局最短。", fields: { score: [["nearest", "按当前距离"], ["reward", "只看奖励"]] }, correct: { score: "nearest" }, hint: ["候选距离要从当前点计算。", "每到一站重新评分。", "记录完整访问顺序与总距离。"] },
    46: { title: "反例与枚举", goal: "枚举小规模路线，找出比贪心更短的方案。", rule: "一个真实反例就能推翻“总是最优”。", fields: { method: [["enumerate", "枚举所有顺序"], ["greedy", "只看贪心结果"]] }, correct: { method: "enumerate" }, hint: ["先算出贪心路线。", "再试其他候选顺序。", "比较总路程，指出更短的一条。"] },
    47: { title: "爬楼梯与记忆化", goal: "每次走 1 或 2 阶，数一数到达楼顶有多少种走法，并减少重复计算。", rule: "ways(n) = ways(n-1) + ways(n-2)；相同的 n 算过一次就能缓存。", fields: { memo: [["on", "算过的阶数直接读取"], ["off", "每次都重新往下计算"]] }, correct: { memo: "on" }, hint: ["到第 n 阶前，可能来自 n-1 或 n-2 阶。", "观察同一个 ways(n) 是否重复出现。", "已经算过的阶数直接读旧答案。"] },
    48: { title: "终极项目：路线规划器", goal: "读懂任务目标，选择搜索策略，还原并走通最优路线。", rule: "最少步数用队列；最低能耗按累计代价处理。路线必须连续、可走。", fields: { objective: [["energy", "最低能耗"], ["steps", "最少步数"]], container: [["priority", "最低累计代价优先"], ["queue", "最少步数优先"]], visited: [["eager", "发现时标记"], ["none", "不标记"]], parent: [["first", "记录前驱"], ["off", "不记录前驱"]] }, correct: { objective: "energy", container: "priority", visited: "eager", parent: "first" }, hint: ["先读清本题的目标。", "最低能耗看累计代价；最少步数看层数。", "还原路径后让 Nova 实际行走。"] }
  };
  const explanations = {
    33: "线性搜索从第一个元素开始，一个接一个地比较；找到就停，全部查完仍没找到就返回 -1。它不要求数据预先排序。",
    34: "安全筛选先判断每个货舱能不能用，再在合格的候选中比较。先挑最小值、最后才检查安全，可能挑中危险货舱。",
    35: "冒泡排序反复比较相邻两个元素，让较大的逐步向右移动。只在左边严格大于右边时交换，相等的不动，才能保留同分货舱的原顺序。",
    36: "二分搜索只适用于已经排好序的数据。比较区间中点后，可以排除不可能的一半；边界每次都要真正缩小，搜索才会结束。",
    37: "图由节点和相邻关系组成。地图中的一个可走格就是一个节点，向北、东、南、西检查时，墙和边界外的位置都不能加入邻居。",
    38: "前沿保存接下来要处理的格子，visited 保存已经发现的格子。发现邻居时立刻标记，能避免同一个格子反复进入前沿。",
    39: "深度优先搜索用栈先沿一条分支深入，遇到死路再回到岔口。它适合判断能否到达，但第一条找到的路线不一定最短。",
    40: "一个完整的寻路器需要前沿、访问标记和前驱表。找到终点只是搜索结束；还要从终点倒着还原连续路线，并让角色真的走过去。",
    41: "广度优先搜索用队列先进先出，按距离一层层扩张。在每步代价相同的地图上，第一次找到目标时得到的就是最少步数。",
    42: "搜索时的访问顺序不等于行走路径。首次发现一个邻居时记下它的前驱，抵达终点后沿前驱倒推，再反转成从起点出发的路线。",
    43: "最少步数和最低能耗可能是两条不同的路。带权搜索每次处理当前累计代价最小的候选，并在发现更省的走法时更新代价与前驱。",
    44: "搜索也必须正确处理失败：如果前沿已经空了，目标仍未出现，就报告不可达。无访问标记可能让搜索在环中重复，掩盖真正的边界问题。",
    45: "贪心策略每一步只看眼前最近的补给站，然后从新的位置继续选择。它容易执行，但局部最近不等于整个行程最短。",
    46: "要反驳“贪心总是最优”，只需要一个具体反例。四个站点规模小，可以枚举每种访问顺序，算出总距离，再和贪心路线比较。",
    47: "爬到第 n 阶的走法数，等于从第 n-1 阶走 1 阶过来的走法数，加上从第 n-2 阶走 2 阶过来的走法数。两个分支会反复问同一个小问题；记住答案后就不用重算。",
    48: "同一张地图会因为目标不同而有不同的最优路线。先确认本题要求最低能耗还是最少步数，再选搜索方法；最后用连续路线与实际行走验证结果。"
  };

  const graphLayouts = {
    37: { start: [2, 4], goal: [10, 4], focus: [6, 4], paths: [[2, 4, 10, 4], [6, 1, 6, 7], [2, 2, 2, 6], [10, 2, 10, 6]], spur: [4, 4, 4, 6] },
    38: { start: [2, 4], goal: [10, 4], paths: [[2, 2, 10, 2], [10, 2, 10, 6], [10, 6, 2, 6], [2, 6, 2, 2], [2, 4, 6, 4]], spur: [6, 4, 6, 6] },
    39: { start: [2, 4], goal: [10, 6], paths: [[2, 4, 6, 4], [6, 4, 6, 2], [6, 2, 10, 2], [6, 4, 6, 6], [6, 6, 10, 6], [9, 2, 9, 1]], spur: [8, 6, 8, 7] },
    40: { start: [2, 4], goal: [10, 6], paths: [[2, 4, 10, 4], [5, 1, 5, 7], [8, 1, 8, 7], [3, 2, 10, 2], [3, 6, 10, 6], [3, 2, 3, 6]], spur: [10, 2, 10, 6] },
    41: { start: [2, 4], goal: [10, 4], paths: [[2, 4, 2, 3], [2, 3, 10, 3], [10, 3, 10, 4], [2, 4, 2, 6], [2, 6, 10, 6], [10, 6, 10, 4]], spur: [5, 3, 5, 2] },
    42: { start: [2, 2], goal: [10, 6], paths: [[2, 2, 8, 2], [8, 2, 8, 6], [8, 6, 10, 6], [2, 2, 2, 6], [2, 6, 6, 6], [6, 6, 6, 4], [6, 4, 10, 4]], spur: [4, 2, 4, 4] },
    43: { start: [2, 4], goal: [10, 4], paths: [[2, 4, 10, 4], [2, 4, 2, 2], [2, 2, 10, 2], [10, 2, 10, 4], [4, 2, 4, 1]], expensive: [[5, 4], [6, 4], [7, 4]], spur: [8, 2, 8, 3] },
    44: { start: [2, 4], goal: [10, 4], paths: [[2, 2, 5, 2], [5, 2, 5, 6], [5, 6, 2, 6], [2, 6, 2, 2], [2, 4, 5, 4], [9, 3, 11, 3], [11, 3, 11, 5], [11, 5, 9, 5], [9, 5, 9, 3], [9, 4, 10, 4]], spur: [3, 4, 3, 5] },
    48: { start: [2, 4], goal: [10, 6], paths: [[2, 4, 10, 4], [10, 4, 10, 6], [2, 4, 2, 2], [2, 2, 7, 2], [7, 2, 7, 6], [7, 6, 10, 6], [4, 4, 4, 6], [4, 6, 7, 6]], expensive: [[5, 4], [6, 4], [7, 4], [10, 5]], spur: [9, 4, 9, 6] }
  };
  function makeGrid({ paths, start, goal, expensive = [], spur }, challenge = false) {
    const cells = Array.from({ length: 9 }, () => Array(13).fill("_"));
    const carve = ([x1, y1, x2, y2]) => {
      if (x1 !== x2 && y1 !== y2) throw new Error("地图线段必须水平或垂直。");
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x += 1)
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y += 1) cells[y][x] = "g";
    };
    paths.forEach(carve);
    if (challenge && spur) carve(spur);
    expensive.forEach(([x, y]) => { cells[y][x] = "s"; });
    cells[start[1]][start[0]] = "S";
    if (goal) cells[goal[1]][goal[0]] = "B";
    const rows = cells.map(row => row.join(""));
    return challenge ? rows.map(row => [...row].reverse().join("")) : rows;
  }
  const pointId = (x, y, width) => y * width + x;
  const find = (grid, symbol) => { for (let y = 0; y < grid.length; y += 1) { const x = grid[y].indexOf(symbol); if (x >= 0) return { x, y }; } return { x: 1, y: 1 }; };
  const modeOf = no => no <= 36 ? "array" : no === 45 || no === 46 ? "route" : no === 47 ? "memo" : "graph";

  function taskData(no, challenge) {
    if (no === 33) return { values: challenge ? [8, 12, 5, 3, 19, 7] : [12, 7, 25, 9, 18, 31, 14], target: challenge ? 22 : 9 };
    if (no === 34) return { values: challenge ? [[7, 1], [1, 0], [4, 1], [5, 1], [2, 0], [6, 1]] : [[8, 1], [2, 0], [5, 1], [9, 1], [3, 0], [6, 1]] };
    if (no === 35) return { values: challenge ? [[4, "A"], [2, ""], [4, "B"], [1, ""], [3, ""]] : [[5, "A"], [3, ""], [5, "B"], [2, ""], [8, ""], [4, ""]] };
    if (no === 36) return { values: challenge ? [2, 5, 8, 13, 21, 34, 55, 89] : [3, 7, 11, 18, 24, 31, 42, 55, 68], target: challenge ? 20 : 55 };
    if (no === 45 || no === 46) return { points: challenge ? [[1, 1], [2, 5], [9, 1], [4, 2]] : [[1, 1], [8, 1], [5, 3], [3, 5]] };
    if (no === 47) return { n: challenge ? 9 : 7 };
    const grid = makeGrid(graphLayouts[no], challenge);
    const start = find(grid, "S"), goal = find(grid, "B"), width = grid[0].length;
    const originalFocus = graphLayouts[no].focus || [6, 4];
    const focus = challenge ? [width - 1 - originalFocus[0], originalFocus[1]] : originalFocus;
    return { grid, start: pointId(start.x, start.y, width), goal: pointId(goal.x, goal.y, width), focus: pointId(focus[0], focus[1], width),
      objective: no === 48 ? challenge ? "steps" : "energy" : no === 43 ? "energy" : "steps",
      costs: Object.fromEntries(grid.flatMap((row, y) => [...row].map((tile, x) => [pointId(x, y, width), tile === "s" ? 6 : 1]))) };
  }

  function sceneFor(no, data, challenge) {
    if (modeOf(no) === "graph") return null;
    const layouts = {
      33: { start: [1, 4], paths: [[1, 4, 10, 4], [1, 2, 1, 6], [10, 2, 10, 6], [1, 2, 10, 2], [1, 6, 10, 6]], spur: [4, 4, 4, 6] },
      34: { start: [1, 4], paths: [[2, 2, 10, 2], [2, 6, 10, 6], [2, 2, 2, 6], [6, 2, 6, 6], [10, 2, 10, 6], [1, 4, 10, 4]], spur: [4, 2, 4, 4] },
      35: { start: [1, 4], paths: [[1, 4, 11, 4], [2, 3, 10, 3], [2, 5, 10, 5], [2, 3, 2, 5], [10, 3, 10, 5]], spur: [6, 2, 6, 3] },
      36: { start: [1, 4], paths: [[1, 4, 11, 4], [3, 2, 3, 6], [6, 2, 6, 6], [9, 2, 9, 6], [3, 2, 9, 2]], spur: [3, 6, 9, 6] },
      45: { start: [1, 1], paths: [[1, 1, 10, 1], [1, 3, 10, 3], [1, 5, 10, 5], [1, 1, 1, 5], [4, 1, 4, 5], [8, 1, 8, 5], [10, 1, 10, 5]], spur: [6, 1, 6, 5] },
      46: { start: [1, 1], paths: [[1, 1, 10, 1], [1, 2, 10, 2], [1, 4, 10, 4], [1, 5, 10, 5], [1, 1, 1, 5], [5, 1, 5, 5], [10, 1, 10, 5]], spur: [8, 2, 8, 4] },
      47: { start: [2, 4], paths: [[2, 4, 4, 4], [4, 2, 4, 6], [4, 2, 8, 2], [4, 6, 8, 6], [8, 2, 8, 6], [8, 4, 10, 4]], spur: [6, 2, 6, 6] }
    };
    const layout = layouts[no];
    const grid = makeGrid({ ...layout, goal: null }, challenge);
    const points = no >= 45 && no <= 46 ? data.points : no === 47 ? [] : data.values.map((_, index) => [2 + index, 4]);
    const stations = points.map(([x, y], index) => {
      const at = { x: challenge ? grid[0].length - 1 - x : x, y };
      const item = data.values?.[index];
      const text = no === 34 ? `${index}·${item[0]}${item[1] ? "安" : "危"}`
        : no === 35 ? `${index}·${item[0]}${item[1]}`
          : no === 36 || no === 33 ? `${index}·${item}` : ["起点", "A", "B", "C"][index];
      return { index, at, text };
    });
    if (no === 47) return { grid, stations: [[data.n, 2, 4], [data.n - 1, 4, 2], [data.n - 2, 4, 6], [data.n - 3, 8, 2], [data.n - 3, 8, 6]]
      .map(([index, x, y]) => ({ index, at: { x: challenge ? 12 - x : x, y }, text: `ways(${index})` })), type: "dependency" };
    return { grid, stations, type: no <= 36 ? "data" : "route" };
  }

  function initialDraft(no) { return { fields: Object.fromEntries(Object.keys(definitions[no].fields).map(key => [key, ""])), commands: [{ id: 1, action: "execute" }], selected: null, nextId: 2, undo: null }; }
  function draft(p, no) {
    p.algorithmDrafts ||= {};
    const key = `${no}-${p.phase}-${p.variant}`;
    p.algorithmDrafts[key] ||= initialDraft(no);
    const d = p.algorithmDrafts[key];
    d.fields = { ...initialDraft(no).fields, ...(d.fields || {}) };
    d.commands = Array.isArray(d.commands) ? d.commands.filter(item => item.action === "execute").slice(0, 1) : [];
    if (!d.commands.length) d.commands = [{ id: Math.max(Number(d.nextId) || 1, 1), action: "execute" }];
    d.nextId = Math.max(Number(d.nextId) || 1, ...d.commands.map(item => Number(item.id) + 1));
    if (!d.commands.some(item => item.id === d.selected)) d.selected = null;
    return d;
  }

  function archive(p, no) {
    const next = revision(no);
    if (p.contentRevision === next) return;
    if (p.contentRevision) p.contentArchives = { ...p.contentArchives, [p.contentRevision]: { attempts: copy(p.attempts), guidedEvidence: p.guidedEvidence, transferEvidence: p.transferEvidence, algorithmDrafts: p.algorithmDrafts } };
    Object.assign(p, { contentRevision: next, phase: "guided", variant: 0, algorithmDrafts: {}, mastered: false, guidedComplete: false, guidedEvidence: null, transferEvidence: {}, attempts: [] });
  }

  function mission(base, p, no) {
    archive(p, no);
    p.attempts = p.attempts.filter(item => item.contentRevision === revision(no));
    const challenge = p.phase === "challenge", data = taskData(no, challenge), definition = definitions[no];
    const scene = sceneFor(no, data, challenge);
    const grid = data.grid || scene.grid;
    const start = find(grid, "S");
    const m = { ...base, contentRevision: revision(no), lessonMode: `v19-algorithm-${no}`, grid,
      startOverride: start, startDir: "E", required: modeOf(no) === "graph" && no !== 37 && no !== 44 ? 1 : 0,
      targetPositions: modeOf(no) === "graph" && no !== 37 && no !== 44 ? [find(grid, "B")] : [],
      energy: 100, terrain: terrain(), limit: 1, allowed: [], solution: [], solutionFn: [],
      worldLabels: scene ? scene.stations.map(item => ({ at: item.at, text: item.text, waypoint: true }))
        : (no === 43 || no === 48) ? grid.flatMap((row, y) => [...row].flatMap((tile, x) => tile === "s" ? [{ at: { x, y }, text: "能耗 6", waypoint: false }] : [])) : [],
      algorithmScene: scene ? { type: scene.type, stations: scene.stations } : null,
      algorithm: { ...data, mode: modeOf(no), noPath: no === 44 },
      lessonInputs: data, semanticConstraints: { capability: `algorithm-${no}`, order: "NESW", objective: data.objective || "steps" },
      early: { v18: true, independent: challenge, repairing: false, key: `${revision(no)}-${p.phase}-${p.variant}`, requiresUpload: false,
        title: definition.title, goal: no === 48 ? `${definition.goal}本题目标：${data.objective === "energy" ? "最低能耗" : "最少步数"}。` : definition.goal,
        rule: definition.rule, phaseLabels: ["构造算法", "换题独立验证"], targets: [], hints: definition.hint } };
    if (E().fingerprint(m) !== p.currentFingerprint) E().enter(p, m);
    p.mastered = E().stateGate(p, revision(no)).mastered;
    return m;
  }

  function py(value) { return JSON.stringify(value).replace(/\btrue\b/g, "True").replace(/\bfalse\b/g, "False").replace(/\bnull\b/g, "None"); }
  const lines = text => text.trim().split("\n").map(line => line.replace(/^      /, ""));

  function arraySource(m, d) {
    const no = m.lessonNo, f = d.fields;
    if (no === 33) return lines(`
      values = course_value("values")
      target = course_value("target")
      answer = ${f.missing === "zero" ? "0" : "-1"}
      for index in range(${f.scan === "first" ? "1" : "len(values)"}):
          report(["check", index, values[index]])
          if values[index] == target:
              answer = index
              break
      report(["result", answer])
      finish_mission()` ).join("\n");
    if (no === 34) return lines(`
      values = course_value("values")
      best = -1
      for index in range(len(values)):
          report(["check", index, values[index]])
          ${f.filter === "after" ? "if best == -1 or values[index][0] < values[best][0]:" : "if values[index][1] == 1:"}
              ${f.filter === "after" ? "best = index" : `if best == -1 or values[index][0] ${f.score === "maximum" ? ">" : "<"} values[best][0]:\n                  best = index`}
              report(["candidate", index, best])
      ${f.filter === "after" ? "if best != -1 and values[best][1] == 0:\n          best = -1" : ""}
      report(["result", best])
      finish_mission()` ).filter(line => line.trim()).join("\n");
    if (no === 35) return lines(`
      values = course_value("values")
      for end in range(len(values) - 1, 0, -1):
          changed = False
          for index in range(end):
              report(["compare", index, index + 1, values])
              if values[index][0] ${f.comparison === "smaller" ? "<" : f.equality === "swap" ? ">=" : ">"} values[index + 1][0]:
                  saved = values[index]
                  values[index] = values[index + 1]
                  values[index + 1] = saved
                  changed = True
                  report(["swap", index, index + 1, values])
          if not changed:
              break
      report(["result", values])
      finish_mission()` ).join("\n");
    return lines(`
      values = course_value("values")
      target = course_value("target")
      left = 0
      right = len(values) - 1
      answer = -1
      turns = 0
      while left <= right and turns < 20:
          turns += 1
          mid = ${f.middle === "left" ? "left" : "(left + right) // 2"}
          report(["middle", left, mid, right, values[mid]])
          if values[mid] == target:
              answer = mid
              break
          if values[mid] < target:
              left = ${f.shrink === "reverse" ? "left" : "mid + 1"}
              right = ${f.shrink === "reverse" ? "mid - 1" : "right"}
          if values[mid] > target:
              right = ${f.shrink === "reverse" ? "right" : "mid - 1"}
              left = ${f.shrink === "reverse" ? "mid + 1" : "left"}
      report(["result", answer])
      finish_mission()` ).join("\n");
  }

  function graphSource(m, d) {
    const f = d.fields, no = m.lessonNo;
    if (no === 37) return lines(`
      focus = course_value("focus")
      found = algorithm_neighbors(focus, "${f.order || "NESW"}")
      report(["neighbors", focus, found])
      finish_mission()` ).join("\n");
    const mode = f.container || (no === 39 || no === 40 ? "stack" : "queue");
    const visited = f.visited || "eager";
    const parent = f.parent || "first";
    const weight = no === 43 || no === 48 && m.algorithm.objective === "energy";
    const weighted = weight && mode === "priority" && (no !== 43 || f.measure === "energy");
    if (weighted) return weightedGraphSource(m, d);
    const noPath = no === 44 && f.noPath === "pretend" ? "pretend" : "return";
    return lines(`
      start = course_value("start")
      goal = course_value("goal")
      costs = course_value("costs")
      frontier = [start]
      visited = ${visited === "eager" ? "[start]" : "[]"}
      parent = {}
      distance = {start: 0}
      found = False
      turns = 0
      while len(frontier) > 0 and turns < 80:
          turns += 1
          current = frontier.pop(${mode === "stack" ? "-1" : "0"})
          ${weighted ? "for candidate in frontier:\n              if distance[candidate] < distance[current]:\n                  frontier.append(current)\n                  frontier.remove(candidate)\n                  current = candidate" : ""}
          ${visited === "late" ? "if current not in visited:\n              visited.append(current)" : ""}
          report(["expand", current, frontier, visited])
          if current == goal:
              found = True
              break
          for next_node in algorithm_neighbors(current, "NESW"):
              ${weighted ? "new_cost = distance[current] + costs[str(next_node)]" : "new_cost = distance[current] + 1"}
              if ${visited === "none" ? "next_node != -1" : weighted ? "next_node not in distance or new_cost < distance[next_node]" : "next_node not in visited"}:
                  ${parent === "off" ? "" : "parent[next_node] = current"}
                  distance[next_node] = new_cost
                  frontier.append(next_node)
                  ${visited === "eager" ? "visited.append(next_node)" : ""}
                  report(["discover", next_node, current, frontier, visited])
      path = []
      if found:
          node = goal
          path = [node]
          while node != start and len(path) < 80:
              if node not in parent:
                  path = []
                  break
              node = parent[node]
              path.insert(0, node)
      report(["path", path, found, turns])
      if len(path) > 0:
          walk_path(path)
          collect()
      ${noPath === "pretend" ? "if len(path) == 0:\n          report([\"result\", \"success\"])" : "if len(path) == 0:\n          report([\"result\", \"no-path\"])"}
      finish_mission()` ).filter(line => line.trim()).join("\n");
  }

  function weightedGraphSource(m, d) {
    const keepVisited = d.fields.visited !== "none";
    const keepParent = d.fields.parent !== "off";
    return [
      'start = course_value("start")',
      'goal = course_value("goal")',
      'costs = course_value("costs")',
      'frontier = [start]',
      'visited = [start]',
      'closed = []',
      'parent = {}',
      'distance = {start: 0}',
      'found = False',
      'turns = 0',
      'while len(frontier) > 0 and turns < 80:',
      '    turns += 1',
      '    best_index = 0',
      '    for index in range(len(frontier)):',
      '        if distance[frontier[index]] < distance[frontier[best_index]]:',
      '            best_index = index',
      '    current = frontier.pop(best_index)',
      '    closed.append(current)',
      '    report(["expand", current, frontier, visited])',
      '    if current == goal:',
      '        found = True',
      '        break',
      '    for next_node in algorithm_neighbors(current, "NESW"):',
      '        new_cost = distance[current] + costs[str(next_node)]',
      `        if ${keepVisited ? 'next_node not in closed and next_node not in distance or next_node not in closed and new_cost < distance[next_node]' : 'new_cost < 80'}:`,
      keepParent ? '            parent[next_node] = current' : '            report(["missing-parent", next_node])',
      '            distance[next_node] = new_cost',
      '            if next_node in frontier:',
      '                frontier.remove(next_node)',
      '            frontier.append(next_node)',
      keepVisited ? '            if next_node not in visited:' : '            if False:',
      '                visited.append(next_node)',
      '            report(["discover", next_node, current, frontier, visited])',
      'path = []',
      'if found:',
      '    node = goal',
      '    path = [node]',
      '    while node != start and len(path) < 80:',
      '        if node not in parent:',
      '            path = []',
      '            break',
      '        node = parent[node]',
      '        path.insert(0, node)',
      'report(["path", path, found, turns])',
      'if len(path) > 0:',
      '    walk_path(path)',
      '    collect()',
      'if len(path) == 0:',
      '    report(["result", "no-path"])',
      'finish_mission()'
    ].join("\n");
  }

  function routeSource(m, d) {
    const no = m.lessonNo, f = d.fields;
    if (no === 47) return lines(`
      n = course_value("n")
      memo = {}
      calls = [0]
      def ways(value):
          calls[0] += 1
          report(["call", value])
          if value <= 1:
              return 1
          ${f.memo === "on" ? "if value in memo:\n              report([\"cache-hit\", value])\n              return memo[value]" : ""}
          answer = ways(value - 1) + ways(value - 2)
          report(["computed", value, answer])
          ${f.memo === "on" ? "memo[value] = answer\n          report([\"store\", value, answer])" : ""}
          return answer
      result = ways(n)
      report(["result", result, calls[0]])
      finish_mission()` ).filter(line => line.trim()).join("\n");
    const method = no === 46 ? f.method : f.score;
    return lines(`
      points = course_value("points")
      remaining = [1, 2, 3]
      route = [0]
      current = 0
      while len(remaining) > 0:
          chosen = remaining[0]
          for candidate in remaining:
              distance_candidate = abs(points[current][0] - points[candidate][0]) + abs(points[current][1] - points[candidate][1])
              distance_chosen = abs(points[current][0] - points[chosen][0]) + abs(points[current][1] - points[chosen][1])
              if ${method === "reward" ? "candidate > chosen" : "distance_candidate < distance_chosen"}:
                  chosen = candidate
          route.append(chosen)
          remaining.remove(chosen)
          current = chosen
          report(["choose", route])
      best = route
      best_cost = 999
      ${method === "enumerate" ? "for a in [1, 2, 3]:\n          for b in [1, 2, 3]:\n              for c in [1, 2, 3]:\n                  if a != b and b != c and a != c:\n                      proposal = [0, a, b, c]\n                      cost = 0\n                      for i in range(3):\n                          cost += abs(points[proposal[i]][0] - points[proposal[i + 1]][0]) + abs(points[proposal[i]][1] - points[proposal[i + 1]][1])\n                      if cost < best_cost:\n                          best = proposal\n                          best_cost = cost\n                          report([\"candidate\", proposal, cost])" : "best = route"}
      report(["result", best])
      finish_mission()` ).filter(line => line.trim()).join("\n");
  }

  function source(m, d, preview = false) {
    if (!preview && !d.commands.length) throw new Error("先加入“运行算法”指令卡。");
    if (!preview) for (const name of Object.keys(definitions[m.lessonNo].fields)) if (!d.fields[name]) throw new Error(`先选择“${name}”的规则。`);
    const mode = modeOf(m.lessonNo);
    return mode === "array" ? arraySource(m, d) : mode === "graph" ? graphSource(m, d) : routeSource(m, d);
  }

  async function compile(m, d, Sk = root.Sk) {
    const code = source(m, d);
    const input = copy(m.algorithm);
    // Python dictionaries require string keys after crossing the JS boundary.
    const runtime = root.CodeQuestPythonRuntime.create({ Sk, initialEnergy: 100, apiCallLimit: 1800,
      allowedFunctions: new Set(["course_value", "report", "finish_mission", "algorithm_neighbors", "walk_path", "collect", "len", "range", "abs", "str", "append", "pop", "remove", "insert", "ways"]),
      languageFeatures: ["for-loops", "functions"],
      world: { grid: m.grid, start: m.startOverride, startDir: m.startDir, required: m.required, targetPositions: m.targetPositions, terrain: m.terrain },
      courseInputs: { ...input, algorithmGrid: input.grid, algorithmCostMode: input.objective === "energy",
        costs: Object.fromEntries(Object.entries(input.costs || {}).map(([key, value]) => [String(key), value])) } });
    let result;
    try { result = { ...await runtime.compile(code), source: code, error: null }; }
    catch (error) { result = { events: error.partialEvents || [], finalState: error.partialState || {}, source: code, error: root.CodeQuestPythonRuntime.friendlyErrorMessage(error) }; }
    return result;
  }

  function assess(m, d, execution, assisted) {
    const no = m.lessonNo, reports = (execution.events || []).filter(event => event.type === "report").map(event => event.report);
    const last = reports.filter(report => report?.[0] === "result").at(-1);
    const final = execution.finalState || {};
    let expected, worldSuccess = false;
    if (no === 33 || no === 36) {
      expected = m.algorithm.values.indexOf(m.algorithm.target);
      worldSuccess = last?.[1] === expected;
    } else if (no === 34) {
      const candidates = m.algorithm.values.map((item, index) => ({ item, index })).filter(({ item }) => item[1] === 1);
      expected = candidates.reduce((best, candidate) => !best || candidate.item[0] < best.item[0] ? candidate : best, null)?.index ?? -1;
      worldSuccess = last?.[1] === expected;
    } else if (no === 35) {
      expected = copy(m.algorithm.values).sort((a, b) => a[0] - b[0]);
      worldSuccess = E().canonical(last?.[1]) === E().canonical(expected);
    } else if (no === 37) {
      const report = reports.find(item => item?.[0] === "neighbors");
      expected = neighborIds(m.algorithm.grid, m.algorithm.focus, "NESW");
      worldSuccess = E().canonical(report?.[2]) === E().canonical(expected);
    } else if (no === 47) {
      const a = [1, 1]; for (let i = 2; i <= m.algorithm.n; i += 1) a.push(a[i - 1] + a[i - 2]);
      expected = a[m.algorithm.n]; worldSuccess = last?.[1] === expected && (d.fields.memo !== "on" || last?.[2] <= m.algorithm.n * 3);
    } else if (no === 45 || no === 46) {
      const route = last?.[1] || [];
      const valid = Array.isArray(route) && route.length === 4 && route[0] === 0 && new Set(route).size === 4;
      expected = no === 45 ? greedyRoute(m.algorithm.points) : minRouteCost(m.algorithm.points);
      worldSuccess = valid && (no === 45 ? E().canonical(route) === E().canonical(expected) : routeCost(m.algorithm.points, route) === expected);
    } else {
      const path = reports.filter(report => report?.[0] === "path").at(-1)?.[1] || [];
      const weighted = m.algorithm.objective === "energy";
      const bestCost = graphMinCost(m.algorithm, weighted);
      expected = no === 44 ? "no-path" : weighted ? bestCost : no === 41 || no === 42 ? bestCost : "到达宝石";
      worldSuccess = no === 44 ? bestCost === Infinity && last?.[1] === "no-path" && path.length === 0
        : path.length > 0 && final.collectedKeys?.length === 1 && final.dataComplete === true &&
          path[0] === m.algorithm.start && path.at(-1) === m.algorithm.goal && validGraphPath(m.algorithm, path) &&
          (!weighted || graphPathCost(m.algorithm, path, true) === bestCost) &&
          (no !== 41 && no !== 42 && no !== 48 || weighted || path.length - 1 === bestCost) &&
          (!weighted || 100 - final.energy === bestCost);
    }
    const correct = no === 48 && m.algorithm.objective === "steps"
      ? { ...definitions[no].correct, objective: "steps", container: "queue" } : definitions[no].correct;
    const chosenCorrect = Object.entries(correct).every(([name, value]) => d.fields[name] === value);
    const events = execution.events || [];
    const conceptSuccess = worldSuccess && chosenCorrect && reports.length > 0 &&
      (no <= 36 || no >= 45 || events.some(event => event.algorithm?.kind === "neighbors"));
    const success = !execution.error && final.dataComplete === true && conceptSuccess;
    const failure = success ? "" : execution.error || (!worldSuccess ? "任务结果尚未成立：查看当前执行轨迹和边界输入。" : !chosenCorrect ? "结果到达了，但本课核心算法结构还没有真实执行。" : "运行证据仍不完整。");
    const pathResult = reports.filter(item => item?.[0] === "path").at(-1)?.[1] || [];
    const resultValue = no === 37 ? reports.find(item => item?.[0] === "neighbors")?.[2] || []
      : no === 46 && Array.isArray(last?.[1]) ? routeCost(m.algorithm.points, last[1])
          : no === 41 || no === 42 || no === 48 && m.algorithm.objective === "steps" ? pathResult.length ? pathResult.length - 1 : null
          : no === 43 || no === 48 ? pathResult.length ? graphPathCost(m.algorithm, pathResult, true) : null
            : no >= 38 && no <= 40 && pathResult.length ? "到达宝石" : last?.[1] ?? null;
    const model = { fields: copy(d.fields), commands: copy(d.commands) };
    return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString(), lessonNo: no,
      contentRevision: revision(no), fingerprint: E().fingerprint(m), challengeKey: m.early.key,
      phase: m.early.independent ? "challenge" : "guided", independent: m.early.independent, assisted,
      worldSuccess: Boolean(worldSuccess), success: Boolean(success), failure,
      evidence: { expected, result: resultValue, reports: reports.slice(-60), expanded: reports.filter(item => item?.[0] === "expand").length,
        path: pathResult, executed: events.length, choice: copy(d.fields),
        pathCost: m.algorithm.objective === "energy" ? graphPathCost(m.algorithm, pathResult, true) : null },
      source: execution.source, events: events.slice(-60).map(event => ({ type: event.type, line: event.line, message: event.message,
        report: event.report, algorithm: event.algorithm })), program: [], routeProgram: [], path: [], trace: [],
      programModel: model, programVersion: E().canonical(model),
      ruleVersion: E().canonical(no === 48 ? { objectiveAware: true, visited: d.fields.visited, parent: d.fields.parent } : d.fields), practiceOnly: false };
  }

  function neighborIds(grid, node, order) {
    const width = grid[0].length, x = node % width, y = Math.floor(node / width), dirs = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
    return [...order].map(dir => { const [dx, dy] = dirs[dir], nx = x + dx, ny = y + dy; return grid[ny]?.[nx] && grid[ny][nx] !== "#" && grid[ny][nx] !== "_" ? ny * width + nx : null; }).filter(Number.isInteger);
  }
  function routeCost(points, route) { return route.slice(1).reduce((sum, node, index) => sum + Math.abs(points[route[index]][0] - points[node][0]) + Math.abs(points[route[index]][1] - points[node][1]), 0); }
  function greedyRoute(points) {
    const route = [0], remaining = [1, 2, 3];
    while (remaining.length) {
      const current = route.at(-1);
      const chosen = remaining.reduce((best, candidate) => {
        const candidateCost = routeCost(points, [current, candidate]);
        return candidateCost < routeCost(points, [current, best]) ? candidate : best;
      }, remaining[0]);
      route.push(chosen); remaining.splice(remaining.indexOf(chosen), 1);
    }
    return route;
  }
  function validGraphPath(data, path) {
    return Array.isArray(path) && path.every((node, index) => Number.isInteger(node) &&
      (index === 0 || neighborIds(data.grid, path[index - 1], "NESW").includes(node)));
  }
  function graphPathCost(data, path, weighted) {
    if (!validGraphPath(data, path) || !path.length) return Infinity;
    return path.slice(1).reduce((total, node) => total + (weighted ? data.costs[node] : 1), 0);
  }
  function graphMinCost(data, weighted) {
    const best = new Map([[data.start, 0]]), closed = new Set();
    while (true) {
      const candidates = [...best].filter(([node]) => !closed.has(node));
      if (!candidates.length) return Infinity;
      const [current, cost] = candidates.reduce((a, b) => a[1] <= b[1] ? a : b);
      if (current === data.goal) return cost;
      closed.add(current);
      for (const next of neighborIds(data.grid, current, "NESW")) {
        const proposal = cost + (weighted ? data.costs[next] : 1);
        if (proposal < (best.get(next) ?? Infinity)) best.set(next, proposal);
      }
    }
  }
  function minRouteCost(points) { let best = Infinity; for (const a of [1, 2, 3]) for (const b of [1, 2, 3]) for (const c of [1, 2, 3]) if (new Set([a, b, c]).size === 3) best = Math.min(best, routeCost(points, [0, a, b, c])); return best; }

  function record(p, attempt, no) {
    p.attempts = [...p.attempts, copy(attempt)].slice(-12);
    if (attempt.worldSuccess) p.completed = true;
    if (attempt.success) {
      if (attempt.phase === "guided") { p.guidedComplete = true; p.guidedEvidence = copy(attempt); }
      if (attempt.independent) p.transferEvidence = E().mergeTransferProofs(p.transferEvidence, { [attempt.fingerprint]: copy(attempt) });
    }
    p.mastered = E().stateGate(p, revision(no)).mastered;
  }

  function edit(m, p, no, { action, field, value }) {
    const d = draft(p, no);
    const remember = () => { d.undo = { fields: copy(d.fields), commands: copy(d.commands), selected: d.selected, nextId: d.nextId }; };
    if (action === "select") { d.selected = d.selected === Number(value) ? null : Number(value); return { reset: false, notice: "" }; }
    if (action === "undo") { if (d.undo) { Object.assign(d, d.undo); d.undo = null; } else d.commands.pop(); return { reset: true, notice: "" }; }
    if (action === "clear") { remember(); d.commands = []; d.selected = null; return { reset: true, notice: "" }; }
    if (action === "add" && value === "execute") { remember(); d.commands = [{ id: d.nextId++, action: "execute" }]; d.selected = null; return { reset: true, notice: "" }; }
    if (action === "remove") { remember(); d.commands = []; d.selected = null; return { reset: true, notice: "" }; }
    if (field && Object.hasOwn(d.fields, field) && definitions[no].fields[field].some(([key]) => key === value)) { remember(); d.fields[field] = value; return { reset: true, notice: "" }; }
    return { reset: false, notice: "" };
  }

  function reference(m, p, no) {
    const d = draft(p, no); d.fields = { ...definitions[no].correct,
      ...(no === 48 && m.algorithm.objective === "steps" ? { objective: "steps", container: "queue" } : {}) };
    d.commands = [{ id: d.nextId++, action: "execute" }]; d.selected = null;
  }

  function adapter(no) { return { revision: revision(no), mission: (base, p) => mission(base, p, no), draft: p => draft(p, no),
    source, compile, assess, record: (p, attempt) => record(p, attempt, no), reconcile: p => { p.mastered = E().stateGate(p, revision(no)).mastered; },
    render: (m, p, context) => root.CodeQuestAlgorithmLessonUI.render(m, p, context),
    builder: (m, p, context) => root.CodeQuestAlgorithmLessonUI.builder(m, p, context),
    edit: (m, p, input) => edit(m, p, no, input),
    feedback(m, p, attempt) { if (!attempt.success) return attempt.failure; if (p.mastered) return `第 ${no} 课已通过独立迁移。`; return m.early.independent ? "换题验证完成。" : "构造完成；继续换题独立验证。"; },
    reference: (m, p) => reference(m, p, no) }; }

  root.CodeQuestAlgorithmLessons = { definitions, explanations, revision, mission, draft, source, compile, assess, neighborIds, routeCost, minRouteCost, graphPathCost, graphMinCost, greedyRoute };
  for (let no = 33; no <= 48; no += 1) root.CodeQuestStructuredLessons.register(no, adapter(no));
})(typeof globalThis !== "undefined" ? globalThis : window);
