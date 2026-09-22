(function (root) {
  "use strict";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const C = () => root.CodeQuestCollaborationLessons;
  const option = (value, label, current) => `<option value="${esc(value)}" ${current === value ? "selected" : ""}>${esc(label)}</option>`;
  const select = (field, label, current, options, disabled) => `<label class="parameter-field"><span>${esc(label)}</span><select data-lesson-field="${esc(field)}" aria-label="${esc(label)}" ${disabled ? "disabled" : ""}><option value="">请选择</option>${options.map(item => option(item[0], item[1], current)).join("")}</select></label>`;

  function controls(m, d, running) {
    if (m.lessonNo === 29) return `<div class="role-deck"><article><span>Collector</span><strong>货物 1 · 留守会合板</strong></article><article><span>Carrier</span><strong>容量 2 · 穿门运输</strong></article></div><div class="advanced-control-grid">${select("meeting", "会合位置", d.fields.meeting, [["same", "双方同在会合格"], ["apart", "双方相隔一格"]], running)}${select("direction", "交接方向", d.fields.direction, [["forward", "Collector → Carrier"], ["reverse", "Carrier → Collector"]], running)}${select("guard", "交接后留守", d.fields.guard, [["stay", "Collector 留在压力板"], ["leave", "双方都离开"]], running)}</div><div class="data-axis-note"><code>唯一 owner</code><span>成功后发送方 −1，接收方 +1</span></div>`;
    if (m.lessonNo === 30) return `<div class="role-deck"><article><span>停靠时刻</span><strong>第 ${m.data.readyAt} 拍</strong></article><article><span>条件读取</span><strong>不推进时间</strong></article></div><div class="advanced-control-grid">${select("condition", "等待策略", d.fields.condition, [["both", "已停靠 AND NOT 被占用"], ["occupied-only", "只检查未占用"], ["fixed", "固定等待两拍"]], running)}</div><div class="data-axis-note"><code>while not can_enter</code><span>每次 wait() 后重新读取两个传感器</span></div>`;
    if (m.lessonNo === 31) return `<div class="test-pack-strip"><span>① 正常解应成功</span><span>② 指定反例应按规则失败</span><span>③ 边界应安全</span></div><div class="advanced-control-grid">${select("work", "作品版本", d.fields.work, [["portal", "传送水院作品"], ["stair", "台阶跨湾作品"]], running)}${select("counterexample", "指定反例", d.fields.counterexample, [["gem-count", "宝石声明与地图不符"], ["accidental", "无指定错误（错误示范）"]], running)}${select("boundary", "边界用例", d.fields.boundary, [["safe-edge", "边缘起点与落点安全"], ["unsafe-relay", "中继声明不一致"]], running)}</div>`;
    return `<div class="module-gate-strip"><span>数据桥</span><span>对象分工</span><span>交接守恒</span><span>条件重查</span><span>中继交付</span></div><div class="advanced-control-grid">${select("traversal", "施工范围", d.fields.traversal, [["all", "遍历全部 gaps"], ["first", "只铺第一格"]], running)}${select("roles", "对象分工", d.fields.roles, [["correct", "Collector 交给 Carrier"], ["reverse", "Carrier 反向交出"]], running)}${select("meeting", "会合方式", d.fields.meeting, [["same", "双方同在会合格"], ["apart", "双方相隔一格"]], running)}${select("waiting", "平台等待", d.fields.waiting, [["recheck", "每拍重查停靠与占用"], ["fixed", "固定等待两拍"]], running)}</div>`;
  }

  function map(m, state) {
    const size = 24, rules = root.CodeQuestWorldRules, labels = new Map((m.worldLabels || []).map(item => [`${item.at.x},${item.at.y}`, item.text]));
    const cells = m.grid.flatMap((row, y) => [...row].map((tile, x) => {
      if (tile === "_") return "";
      const h = rules.height(m.terrain, { x, y }), label = labels.get(`${x},${y}`);
      const fill = tile === "B" ? "#a74f5d" : tile === "R" ? "#6d55b5" : tile === "P" ? "#1f9aa8" : tile === "s" ? "#476a72" : ["#315b50", "#6f7547", "#92713e"][h] || "#315b50";
      const short = tile === "B" ? "货" : tile === "R" ? "站" : tile === "P" ? "台" : label ? label.slice(0, 2) : h ? `${h}层` : "";
      return `<g><rect x="${x * size + 1}" y="${y * size + 1}" width="22" height="22" rx="3" fill="${fill}"/><text x="${x * size + 12}" y="${y * size + 15}" text-anchor="middle" fill="#fff" font-size="7.5">${esc(short)}</text></g>`;
    })).join("");
    let actors = "";
    if (m.lessonNo === 29) actors = [[m.data.meeting, "C", "#72ddf7"], [m.data.meeting, "T", "#ffcf69"]].map(([pos, name, color], index) => `<g transform="translate(${index ? 5 : -5},0)"><circle cx="${pos.x * size + 12}" cy="${pos.y * size + 12}" r="7" fill="#101b40" stroke="${color}" stroke-width="2"/><text x="${pos.x * size + 12}" y="${pos.y * size + 15}" text-anchor="middle" fill="#fff" font-size="8">${name}</text></g>`).join("");
    else { const pos = state || m.startOverride; actors = `<circle cx="${pos.x * size + 12}" cy="${pos.y * size + 12}" r="8" fill="#101b40" stroke="#72ddf7" stroke-width="2"/>`; }
    return `<div class="data-map-wrap systems-map-wrap collaboration-map-wrap"><svg class="early-map data-map" viewBox="0 0 ${m.grid[0].length * size} ${m.grid.length * size}" role="img" aria-label="${esc(m.early.title)}宽幅俯视图">${cells}${actors}</svg><div class="data-map-legend">${(m.worldLabels || []).map(item => `<span>${esc(item.text)}</span>`).join("")}</div></div>`;
  }

  function builder(m, p, { running = false, playback = null, notice = "" } = {}) {
    const d = C().draft(p, m.lessonNo), desc = C().program(m, d, m.lessonNo, true), event = playback?.event;
    const palette = m.collaborationAllowed.map(action => `<button class="command-button is-logic" data-lesson-action="add" data-value="${action}" ${running || (d.commands.length >= C().limits[m.lessonNo] && d.selected === null) ? "disabled" : ""}><strong>${esc(C().labels[action])}</strong><small>${esc(C().codes[action])}</small></button>`).join("");
    const list = desc.steps.map((step, index) => `<li data-program-step="${step.id}" class="program-chip${step.commandId === d.selected ? " is-replacing" : ""}${event?.programStep === step.id ? " is-current" : ""}"><div class="program-command-summary"><span>${index + 1}</span><strong>${esc(C().codes[step.kind] || step.code)}</strong></div><button class="program-replace" data-lesson-action="select" data-value="${step.commandId}" ${running ? "disabled" : ""}>替换</button><button class="program-remove" data-lesson-action="remove" data-value="${step.commandId}" ${running ? "disabled" : ""}>×</button></li>`).join("");
    const last = p.attempts.at(-1), attempt = last?.challengeKey === m.early.key ? last : null;
    const stats = m.lessonNo === 29 ? `交接 ${attempt?.evidence?.transfer ? "已发生" : "待执行"} · 压力门 ${attempt?.evidence?.gateOpen ? "开启" : "关闭"}` : m.lessonNo === 30 ? `等待 ${attempt?.evidence?.waits ?? 0}/${m.data.readyAt} 拍 · 双传感器` : m.lessonNo === 31 ? `正常 / 反例 / 边界 · ${Object.values(attempt?.evidence || {}).filter(item => item?.passed).length}/3` : `五模块 · ${Object.values(attempt?.evidence?.modules || {}).filter(Boolean).length}/5`;
    return { palette, list, definition: "", hideFunctionTab: true, functionTabLabel: "协作", count: d.commands.length, replacing: d.selected !== null, undo: Boolean(d.undo || d.commands.length), feedback: `<span class="parameter-state">${esc(stats)}</span>${event ? `<p class="parameter-live-flow" role="status">${esc(event.message)}</p>` : ""}${notice ? `<p class="early-feedback" role="status">${esc(notice)}</p>` : ""}` };
  }

  function evidence(m, attempt) {
    if (!attempt) return ""; const e = attempt.evidence || {};
    const detail = m.lessonNo === 29 ? `交接 ${e.transfer ? `${e.transfer.from} → ${e.transfer.to}` : "未发生"}；压力门 ${e.gateOpen ? "开启" : "关闭"}` : m.lessonNo === 30 ? `等待 ${e.waits ?? 0} 拍；目标时刻 ${e.readyAt ?? "—"}` : m.lessonNo === 31 ? `正常 ${e.normal?.passed ? "通过" : "失败"}；指定反例 ${e.counterexample?.passed ? "命中" : "未命中"}；边界 ${e.boundary?.passed ? "安全" : "失败"}` : `模块：${Object.entries(e.modules || {}).map(([key, ok]) => `${key} ${ok ? "✓" : "×"}`).join(" · ")}`;
    return `<details class="early-result early-evidence-disclosure"><summary><span>运行记录</span><strong>${attempt.success ? "核心证据成立" : "继续调整"}</strong></summary><div class="early-evidence-body"><p>${esc(attempt.failure || "本次任务完成。")}</p><p>${esc(detail)}</p></div></details>`;
  }
  function render(m, p, { storage = "", running = false, state = null } = {}) {
    const d = C().draft(p, m.lessonNo), gate = root.CodeQuestEvidence.stateGate(p, C().revisions[m.lessonNo]), latest = p.attempts.at(-1), attempt = latest?.challengeKey === m.early.key ? latest : null;
    return `<section class="early-lesson-shell"><div class="early-heading"><h2>${esc(m.early.title)}</h2><span>第 ${m.lessonNo} 课</span></div><div class="early-phases">${m.early.phaseLabels.map((label, index) => `<button type="button" disabled aria-pressed="${(m.early.independent ? 1 : 0) === index}"><span>${index + 1}</span>${esc(label)}${index === 0 && gate.guided ? " ✓" : index === 1 && gate.transfer ? " ✓" : ""}</button>`).join("")}</div><p class="early-goal">${esc(m.early.goal)}</p><p class="early-rule">${esc(m.early.rule)}</p>${controls(m, d, running)}<details class="early-help-details"><summary>需要帮助？</summary><div class="early-help">${m.early.hints.map((hint, index) => `<button data-early-action="hint" data-value="${index + 1}">${index + 1}级：${esc(hint)}</button>`).join("")}</div></details><details open><summary>宽幅地图与状态落点</summary>${map(m, state)}</details>${evidence(m, attempt)}${attempt?.success && !p.mastered && !m.early.independent ? `<button class="early-primary" data-early-action="next">下一步：${esc(m.early.phaseLabels[1])} →</button>` : ""}${p.mastered ? `<p class="early-mastery">已掌握：构造与独立迁移都已留下证据。</p>` : ""}<p class="early-storage">${esc(storage || "已自动保存")}</p></section>`;
  }
  root.CodeQuestCollaborationLessonUI = { render, builder, map };
})(typeof globalThis !== "undefined" ? globalThis : window);
