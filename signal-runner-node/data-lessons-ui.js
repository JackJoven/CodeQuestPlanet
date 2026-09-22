(function (root) {
  "use strict";

  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const arrows = { N: "↑", E: "→", S: "↓", W: "←" };
  const D = () => root.CodeQuestDataLessons;
  const option = (value, label, current) => `<option value="${esc(value)}" ${current === value ? "selected" : ""}>${esc(label)}</option>`;
  const select = (field, label, current, options, disabled) => `<label class="parameter-field"><span>${esc(label)}</span><select data-lesson-field="${esc(field)}" aria-label="${esc(label)}" ${disabled ? "disabled" : ""}><option value="">请选择</option>${options.map(item => option(item[0], item[1], current)).join("")}</select></label>`;

  function taskEditor(d, choices, disabled, action = "task") {
    const chips = d.tasks.map((name, index) => `<li class="data-chip"><strong>${esc(name)}</strong><span><button data-lesson-action="task-left" data-value="${index}" aria-label="${esc(name)} 左移" ${disabled || index === 0 ? "disabled" : ""}>←</button><button data-lesson-action="task-right" data-value="${index}" aria-label="${esc(name)} 右移" ${disabled || index === d.tasks.length - 1 ? "disabled" : ""}>→</button><button data-lesson-action="task-remove" data-value="${index}" aria-label="移除 ${esc(name)}" ${disabled ? "disabled" : ""}>×</button></span></li>`).join("");
    const buttons = choices.map(name => `<button data-lesson-action="${action}-add" data-value="${esc(name)}" ${disabled ? "disabled" : ""}>+ ${esc(name)}</button>`).join("");
    return `<div class="data-editor"><ol class="data-chip-list">${chips || "<li class=\"data-empty\">清单为空：循环应安全跳过</li>"}</ol><div class="data-add-list">${buttons}</div></div>`;
  }

  function controls(m, d, running) {
    if (m.lessonNo === 21) return `<div class="data-instruction"><span>目标顺序</span><strong>${m.data.requested.map(esc).join(" → ") || "空清单"}</strong></div>${taskEditor(d, Object.keys(m.data.stations), running)}<div class="advanced-control-grid">${select("loopSource", "循环读取", d.fields.loopSource, [["tasks", "当前 tasks 清单"], ["fixed", "写死 A、B、C"]], running)}</div>`;
    if (m.lessonNo === 22) {
      const appends = d.appends.map((name, index) => `<li class="data-chip"><strong>${esc(name)}</strong><button data-lesson-action="append-remove" data-value="${index}" aria-label="移除追加任务 ${esc(name)}" ${running ? "disabled" : ""}>×</button></li>`).join("");
      return `<div class="data-instruction"><span>初始任务</span><strong>${m.data.baseTasks.map(esc).join(" → ")}</strong><span>本轮新增</span><strong>${m.data.expectedAppends.map(esc).join(" → ")}</strong></div><div class="data-editor"><ol class="data-chip-list">${appends || "<li class=\"data-empty\">还没有追加任务</li>"}</ol><div class="data-add-list">${Object.keys(m.data.stations).map(name => `<button data-lesson-action="append-add" data-value="${esc(name)}" ${running ? "disabled" : ""}>+ ${esc(name)}</button>`).join("")}</div></div><div class="advanced-control-grid">${select("lengthMode", "长度来源", d.fields.lengthMode, [["current", "当前 len(tasks)"], ["stale", "追加前旧长度"]], running)}${select("boundMode", "索引边界", d.fields.boundMode, [["valid", "range(len(tasks))"], ["offby", "多访问一个索引"]], running)}</div>`;
    }
    if (m.lessonNo === 23) {
      const exits = Object.keys(m.data.exits).map(name => [name, `${name} (${m.data.exits[name].join(", ")})`]);
      return `<div class="data-instruction"><span>当前入口名</span><strong>${esc(m.data.expectedKey)}</strong><span>目标出口</span><strong>由映射表决定</strong></div><div class="data-route-grid">${Object.keys(d.routes).map(key => select(`route:${key}`, `${key} →`, d.routes[key], exits, running)).join("")}</div><div class="advanced-control-grid">${select("lookupMode", "目的地来源", d.fields.lookupMode, [["dict", "routes.get(key)"], ["fixed", "写死东北出口"]], running)}</div>`;
    }
    if (m.lessonNo === 24) return `<div class="data-instruction"><span>库存</span><strong>${m.data.stock} 份</strong><span>任务顺序</span><strong>${m.data.tasks.map(esc).join(" → ")}</strong></div>${taskEditor(d, Object.keys(m.data.routes), running)}<div class="advanced-control-grid">${select("traversal", "遍历来源", d.fields.traversal, [["tasks", "当前 tasks"], ["fixed", "写死旧任务"]], running)}${select("lookup", "目的地查询", d.fields.lookup, [["routes", "routes[current]"], ["fixed", "固定一个坐标"]], running)}${select("inventory", "库存判断", d.fields.inventory, [["check", "stock > 0"], ["ignore", "忽略库存"]], running)}${select("writeback", "结果写回", d.fields.writeback, [["results", "results[current]"], ["none", "不写回"]], running)}</div>`;
    const target = m.data.target;
    return `<div class="data-instruction"><span>世界坐标</span><strong>(${target.x}, ${target.y})</strong><span>蓝图尺寸</span><strong>${m.grid[0].length} × ${m.grid.length}</strong></div><div class="advanced-control-grid">${select("row", "先选行", d.fields.row, [["y", `y = ${target.y}`], ["x", `x = ${target.x}`]], running)}${select("column", "再选列", d.fields.column, [["x", `x = ${target.x}`], ["y", `y = ${target.y}`]], running)}${select("tile", "写入格子", d.fields.tile, [["rock", "岩石 #"], ["ground", "普通地面 g"]], running)}</div><div class="data-axis-note"><code>table[row][column]</code><span>行向下增长 y，列向右增长 x</span></div>`;
  }

  function map(m, state) {
    const size = 24, rules = root.CodeQuestWorldRules;
    const labelMap = new Map((m.worldLabels || []).map(item => [`${item.at.x},${item.at.y}`, item.text]));
    const cells = m.grid.flatMap((row, y) => [...row].map((tile, x) => {
      if (tile === "_") return "";
      const h = rules.height(m.terrain, { x, y }), label = labelMap.get(`${x},${y}`), target = m.data.target?.x === x && m.data.target?.y === y;
      const fill = target ? "#c45f4b" : tile === "B" ? "#8d514d" : tile === "R" ? "#75652f" : tile === "s" ? "#4e695e" : ["#315b50", "#6b7648", "#8b7442"][h] || "#315b50";
      const short = target ? "改" : tile === "B" ? "宝" : tile === "R" ? "站" : label ? label.slice(0, 2) : h ? `${h}层` : "";
      return `<g><rect x="${x * size + 1}" y="${y * size + 1}" width="22" height="22" rx="3" fill="${fill}"/><text x="${x * size + 12}" y="${y * size + 15}" text-anchor="middle" fill="#fff" font-size="7.5">${esc(short)}</text></g>`;
    })).join("");
    const pos = state || m.startOverride, dir = state?.dir || state?.directionName || m.startDir;
    const labels = (m.worldLabels || []).map(item => `<span>${esc(item.text)}</span>`).join("");
    return `<div class="data-map-wrap"><svg class="early-map data-map" viewBox="0 0 ${m.grid[0].length * size} ${m.grid.length * size}" role="img" aria-label="${esc(m.early.title)}宽幅俯视图">${cells}<circle cx="${pos.x * size + 12}" cy="${pos.y * size + 12}" r="9" fill="#111d45" stroke="#8be5ff" stroke-width="2"/><text x="${pos.x * size + 12}" y="${pos.y * size + 16}" text-anchor="middle" fill="#fff" font-size="11">${arrows[dir] || "●"}</text></svg><div class="data-map-legend">${labels}</div></div>`;
  }

  function builder(m, p, { running = false, playback = null, state = null, notice = "" } = {}) {
    const d = D().draft(p, m.lessonNo), desc = D().program(m, d, m.lessonNo, true), event = playback?.event;
    const palette = m.dataAllowed.map(action => `<button class="command-button is-logic" data-lesson-action="add" data-value="${action}" ${running || (d.commands.length >= D().limits[m.lessonNo] && d.selected === null) ? "disabled" : ""}><strong>${esc(D().labels[action])}</strong><small>${esc(D().codes[action])}</small></button>`).join("");
    const list = desc.steps.map((step, index) => `<li data-program-step="${step.id}" class="program-chip${step.commandId === d.selected ? " is-replacing" : ""}${event?.programStep === step.id ? " is-current" : ""}"><div class="program-command-summary"><span>${index + 1}</span><strong>${esc(D().codes[step.kind] || step.code)}</strong></div><button class="program-replace" data-lesson-action="select" data-value="${step.commandId}" ${running ? "disabled" : ""}>替换</button><button class="program-remove" data-lesson-action="remove" data-value="${step.commandId}" ${running ? "disabled" : ""}>×</button></li>`).join("");
    const last = p.attempts.at(-1), attempt = last?.challengeKey === m.early.key ? last : null;
    const stats = m.lessonNo === 23 ? `查询 ${attempt?.evidence?.lookup?.key || "—"} · 出口 ${attempt?.evidence?.endpoint?.join(", ") || "—"}` : m.lessonNo === 25 ? `目标 (${m.data.target.x}, ${m.data.target.y}) · ${m.grid[0].length}×${m.grid.length}` : m.lessonNo === 24 ? `已派发 ${attempt?.evidence?.delivered?.length || 0} · 待处理 ${attempt?.evidence?.unfilled?.length || 0}` : `已访问 ${attempt?.evidence?.visits?.length || 0} 站`;
    return { palette, list, definition: "", hideFunctionTab: true, functionTabLabel: "数据", count: d.commands.length, replacing: d.selected !== null, undo: Boolean(d.undo || d.commands.length), feedback: `<span class="parameter-state">${esc(stats)}</span>${event ? `<p class="parameter-live-flow" role="status">${esc(event.message)}</p>` : ""}${notice ? `<p class="early-feedback" role="status">${esc(notice)}</p>` : ""}` };
  }

  function evidence(m, attempt) {
    if (!attempt) return "";
    const e = attempt.evidence || {};
    const detail = m.lessonNo === 21 || m.lessonNo === 22 ? `访问：${(e.visits || []).join(" → ") || "无"}` : m.lessonNo === 23 ? `查询 ${e.lookup?.key || "—"}，落点 (${(e.endpoint || []).join(", ")})` : m.lessonNo === 24 ? `派发 ${(e.delivered || []).join("、") || "无"}；待处理 ${(e.unfilled || []).join("、") || "无"}` : `修改目标 (${e.target?.x}, ${e.target?.y})`;
    return `<details class="early-result early-evidence-disclosure"><summary><span>运行记录</span><strong>${attempt.success ? "核心证据成立" : "继续调整"}</strong></summary><div class="early-evidence-body"><p>${esc(attempt.failure || "本次任务完成。")}</p><p>${esc(detail)}</p></div></details>`;
  }

  function render(m, p, { storage = "", running = false, state = null } = {}) {
    const d = D().draft(p, m.lessonNo), gate = root.CodeQuestEvidence.stateGate(p, D().revisions[m.lessonNo]), latest = p.attempts.at(-1), attempt = latest?.challengeKey === m.early.key ? latest : null;
    return `<section class="early-lesson-shell"><div class="early-heading"><h2>${esc(m.early.title)}</h2><span>第 ${m.lessonNo} 课</span></div><div class="early-phases">${m.early.phaseLabels.map((label, index) => `<button type="button" disabled aria-pressed="${(m.early.independent ? 1 : 0) === index}"><span>${index + 1}</span>${esc(label)}${index === 0 && gate.guided ? " ✓" : index === 1 && gate.transfer ? " ✓" : ""}</button>`).join("")}</div><p class="early-goal">${esc(m.early.goal)}</p><p class="early-rule">${esc(m.early.rule)}</p>${controls(m, d, running)}<details class="early-help-details"><summary>需要帮助？</summary><div class="early-help">${m.early.hints.map((hint, index) => `<button data-early-action="hint" data-value="${index + 1}">${index + 1}级：${esc(hint)}</button>`).join("")}</div></details><details open><summary>宽幅地图与数据落点</summary>${map(m, state)}</details>${evidence(m, attempt)}${attempt?.success && !p.mastered && !m.early.independent ? `<button class="early-primary" data-early-action="next">下一步：${esc(m.early.phaseLabels[1])} →</button>` : ""}${p.mastered ? `<p class="early-mastery">已掌握：构造与独立迁移都已留下证据。</p>` : ""}<p class="early-storage">${esc(storage || "已自动保存")}</p></section>`;
  }

  root.CodeQuestDataLessonUI = { render, builder, map };
})(typeof globalThis !== "undefined" ? globalThis : window);
