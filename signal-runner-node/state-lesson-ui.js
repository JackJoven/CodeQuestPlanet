(function (root) {
  "use strict";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const select = (field, label, value, max, disabled) => `<label class="parameter-field">${label}<select data-lesson-field="${field}" aria-label="${label}" ${disabled ? "disabled" : ""}><option value="">请选择</option>${Array.from({ length: max + 1 }, (_, n) => `<option value="${n}" ${value === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>`;
  function map(m, state) {
    const size = 26, rules = root.CodeQuestWorldRules;
    const cells = m.grid.flatMap((row, y) => [...row].map((tile, x) => {
      if (tile === "_") return "";
      const point = { x, y }, h = rules.height(m.terrain, point), gate = m.terrain.gates.find(g => rules.same(g.at, point));
      const target = m.targetPositions.some(p => rules.same(p, point));
      const label = rules.same(m.startOverride, point) ? "起" : rules.same(m.emptyStation, point) ? "空" : rules.same(m.countStation, point) ? "查"
        : rules.same(m.terminal, point) ? "终" : gate ? (state?.gates?.[gate.id] ? "开" : "门") : target ? "宝" : h ? `${h}层` : "";
      return `<g><rect x="${x * size + 1}" y="${y * size + 1}" width="24" height="24" rx="2" fill="${gate ? state?.gates?.[gate.id] ? "#238b73" : "#b36b35" : ["#224d43", "#516441", "#827042"][h]}"/><text x="${x * size + 13}" y="${y * size + 17}" text-anchor="middle" fill="#fff" font-size="9">${label}</text></g>`;
    })).join("");
    const position = state || m.startOverride, arrow = { N: "↑", E: "→", S: "↓", W: "←" }[state?.dir || m.startDir];
    return `<svg class="early-map parameter-map" viewBox="0 0 ${m.grid[0].length * size} ${m.grid.length * size}" role="img" aria-label="回收港俯视图：宝石、空采点、计数检查、计数门和终端都有文字标记。">${cells}<circle cx="${position.x * size + 13}" cy="${position.y * size + 13}" r="11" fill="#111d45" stroke="#8be5ff" stroke-width="2"/><text x="${position.x * size + 13}" y="${position.y * size + 17}" text-anchor="middle" fill="#fff" font-size="12">${arrow}</text></svg>`;
  }
  function live(playback) {
    const event = playback?.event;
    if (!event) return "";
    const state = event.state || {}, count = state.variables?.count ?? "—", actual = state.collectedKeys?.length ?? 0;
    if (event.type === "collect-attempt") {
      const label = event.collectAttempt.success ? "成功" : event.collectAttempt.reason === "already-collected" ? "重复" : "空采";
      return `<div class="parameter-live-flow" role="status"><b>${label}</b> · count ${esc(count)} · 实际宝石 ${actual}</div>`;
    }
    return `<p class="parameter-live-flow" role="status">${esc(event.message)} · count ${esc(count)} / 实际 ${actual}</p>`;
  }
  function builder(m, p, { running = false, playback = null, state = null, notice = "" } = {}) {
    const S = root.CodeQuestStateLesson, d = S.draft(p), description = S.program(m, d, true), event = playback?.event;
    const cards = [["move", "前进", "move()"], ["left", "左转", "turn_left()"], ["right", "右转", "turn_right()"],
      ["attempt", "采集尝试", "try_collect()"], ["check", "检查计数", "check_count(count)"]];
    const palette = cards.map(([action, name, code]) => `<button class="command-button${["attempt", "check"].includes(action) ? " is-logic" : ""}" data-lesson-action="add" data-value="${action}" type="button" ${running || d.commands.length >= S.limit && d.selected === null ? "disabled" : ""}><strong>${name}</strong><small>${code}</small></button>`).join("");
    const list = description.steps.map(s => `<li data-program-step="${s.id}" class="program-chip${s.commandId === d.selected ? " is-replacing" : ""}${event?.programStep === s.id ? " is-current" : ""}" ${event?.programStep === s.id ? 'aria-current="step"' : ""}>
      <div class="program-command-summary"><span>${s.index + 1}</span><strong>${esc(s.code)}</strong></div>
      <button class="program-replace" data-lesson-action="select" data-value="${s.commandId}" aria-label="替换第 ${s.index + 1} 条 ${esc(s.code)}" ${running ? "disabled" : ""}>替换</button>
      <button class="program-remove" data-lesson-action="remove" data-value="${s.commandId}" aria-label="移除第 ${s.index + 1} 条 ${esc(s.code)}" ${running ? "disabled" : ""}>×</button></li>`).join("");
    const definition = `<fieldset class="parameter-function state-rule" ${running ? "disabled" : ""}><legend>计数工具 · count</legend>
      <p>先定初值，再决定哪种采集结果会让 count 增加。</p>
      <div class="state-rule-grid">${select("initialCount", "count 初值", d.initialCount, 3, running)}
        <div class="parameter-binding"><span>更新时间</span><button data-lesson-action="update-on" data-value="success" aria-pressed="${d.updateOn === "success"}">成功后</button><button data-lesson-action="update-on" data-value="attempt" aria-pressed="${d.updateOn === "attempt"}">每次尝试后</button></div>
        ${select("delta", "每次增加", d.delta, 2, running)}</div>
      <div class="parameter-function-body ${event?.programStep === "count-rule" ? "is-executing" : ""}">count = ${d.initialCount ?? "?"} · ${d.updateOn === "success" ? "成功后" : d.updateOn === "attempt" ? "每次尝试后" : "?"} + ${d.delta ?? "?"}</div></fieldset>`;
    const count = playback?.event?.state?.variables?.count ?? 0, actual = state?.collected?.size ?? 0;
    return { palette, list, definition, functionTabLabel: "计数工具", count: d.commands.length, replacing: d.selected !== null,
      undo: Boolean(d.undo || d.commands.length), feedback: `<div class="state-counters" aria-live="polite"><span>Python 变量 <strong>count = ${esc(count)}</strong></span><span>世界实际 <strong>${actual} 颗</strong></span></div>${live(playback)}${notice ? `<p class="early-feedback" role="status">${esc(notice)}</p>` : ""}` };
  }
  function render(m, p, { storage = "", running = false, playback = null, state = null } = {}) {
    const S = root.CodeQuestStateLesson, d = S.draft(p), gate = root.CodeQuestEvidence.stateGate(p, S.revision);
    const description = S.program(m, d, true), event = playback?.event, latest = p.attempts.at(-1);
    const attempt = latest?.challengeKey === m.early.key ? latest : null;
    return `<div class="early-heading"><h2>回收港计数闸门</h2><span class="early-badge">${gate.mastered ? "已掌握" : "第 17 课 · 变量"}</span></div>
      <nav class="early-phases" aria-label="本课任务包">${[["guided", m.early.phaseLabels[0], gate.guided], ["challenge", m.early.phaseLabels[1], gate.transfer]].map(([phase, label, done], index) => `<button data-early-action="${phase}" aria-pressed="${p.phase === phase}" ${running || phase === "challenge" && !gate.guided ? "disabled" : ""}><span>${index + 1}</span>${label}${done ? " ✓" : ""}</button>`).join("")}</nav>
      <p class="early-goal">${esc(m.early.goal)}</p><p class="parameter-instruction">先在“计数工具”设置规则，再回主程序点卡片编排路线。观察每次尝试后两个数字是否仍相同。</p>
      <div class="parameter-support">${p.phase === "guided" && gate.guided ? `<button class="early-primary" data-early-action="challenge" ${running ? "disabled" : ""}>下一步：${m.early.phaseLabels[1]} →</button>` : p.phase === "challenge" ? `<div class="early-options"><button data-early-action="next" ${running ? "disabled" : ""}>${gate.mastered ? "再练一张（可选）" : "换一个等价版本"}</button></div>` : ""}
      <details class="early-help-details"><summary>需要帮助？</summary><p>站到空采点试一次；同一颗宝石也要连续试两次。计数检查后还要自己走过门。</p><button data-early-action="hint" ${running || p.hintLevel >= 3 ? "disabled" : ""}>提示 ${Math.min(3, p.hintLevel + 1)}</button>${p.hintLevel ? `<p>${esc(m.early.hints[p.hintLevel - 1])}</p>` : ""}${p.assisted ? "<p>用过强提示，请换图独立验证。</p>" : ""}</details>
      <details class="parameter-code"><summary>查看 Python</summary><pre>${description.source.split("\n").map((line, i) => `<span class="${event?.line === i + 1 ? "is-active" : ""}">${esc(line) || " "}</span>`).join("")}</pre>${description.source.includes("?") ? "<p>问号是未填的设置，补好才能运行。</p>" : ""}</details>
      <details class="parameter-overview"><summary>俯视图</summary>${map(m, state)}</details><small class="early-storage">${esc(storage || "自动保存")}</small></div>
      ${attempt ? `<details class="early-result early-evidence-disclosure"><summary>运行记录</summary><p>${esc(attempt.failure || "已完成")}</p><ol class="early-trace">${attempt.attempts.map((item, i) => `<li>尝试 ${i + 1} · ${item.success ? "成功" : item.reason === "already-collected" ? "重复" : "空采"} · count ${esc(item.countBefore)} → ${esc(item.countAfter)} · 实际 ${item.worldCountBefore} → ${item.worldCountAfter}</li>`).join("")}</ol></details>` : ""}
      <details class="early-mastery"><summary>学习进度 · ${[gate.guided, gate.transfer].filter(Boolean).length}/2</summary><ul><li>${gate.guided ? "✓" : "○"} ${m.early.phaseLabels[0]}</li><li>${gate.transfer ? "✓" : "○"} ${m.early.phaseLabels[1]}</li></ul></details>`;
  }
  root.CodeQuestStateLessonUI = { render, builder, map, live };
})(typeof globalThis !== "undefined" ? globalThis : window);
