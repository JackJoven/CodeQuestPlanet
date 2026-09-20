(function (root) {
  "use strict";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function numberSelect(field, label, value, disabled) {
    return `<label class="parameter-field">${label}<select data-lesson-field="${field}" aria-label="${label}" ${disabled ? "disabled" : ""}><option value="">请选择</option>${Array.from({ length: 7 }, (_, n) => `<option value="${n}" ${value === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>`;
  }
  function map(m, state) {
    const size = 26, rules = root.CodeQuestWorldRules;
    const cells = m.grid.flatMap((row, y) => [...row].map((tile, x) => {
      if (tile === "_") return "";
      const height = rules.height(m.terrain, { x, y }), target = m.targetPositions.some(p => rules.same(p, { x, y }));
      const entry = m.entries?.findIndex(p => rules.same(p, { x, y })) ?? -1;
      const targetIndex = m.targetPositions.findIndex(p => rules.same(p, { x, y }));
      const atStart = rules.same(m.startOverride, { x, y });
      const text = [atStart ? "起" : "", entry >= 0 ? `${["A", "B"][entry]}入口` : "", target ? m.parameterStep === "route" ? ["A", "B"][targetIndex] : "目标" : ""].filter(Boolean).join("/") || (height ? `${height}层` : "");
      return `<g><rect x="${x * size + 1}" y="${y * size + 1}" width="24" height="24" rx="2" fill="${["#224d43", "#516441", "#827042"][height]}"/><text x="${x * size + 13}" y="${y * size + 17}" text-anchor="middle" fill="#fff" font-size="9">${text}</text></g>`;
    })).join("");
    const stairs = m.terrain.stairs.map(s => `<path d="M${s.from.x * size + 13} ${s.from.y * size + 13} L${s.to.x * size + 13} ${s.to.y * size + 13}" stroke="#fadd89" stroke-width="4" stroke-dasharray="2 2"/>`).join("");
    const arrow = { N: "↑", E: "→", S: "↓", W: "←" }[state?.dir || m.startDir];
    const position = state || m.startOverride;
    const current = `<circle cx="${position.x * size + 13}" cy="${position.y * size + 13}" r="11" fill="#111d45" stroke="#8be5ff" stroke-width="2"/><text x="${position.x * size + 13}" y="${position.y * size + 17}" text-anchor="middle" fill="#fff" font-size="12">${arrow}</text>`;
    return `<svg class="early-map parameter-map" viewBox="0 0 ${m.grid[0].length * size} ${m.grid.length * size}" role="img" aria-label="${m.parameterStep === "route" ? "两座码头各有一颗宝石；从各自入口出发，中间通过窄桥连接。" : `目标在当前朝向 ${m.lessonInputs[0]} 格外。`}">${cells}${stairs}${current}</svg>`;
  }
  function live(playback) {
    if (!playback?.event) return "";
    const event = playback.event, prefix = playback.execution.events.slice(0, playback.index);
    if (!event.callId) return `<p class="parameter-live-flow" role="status">${esc(event.stepLabel)}</p>`;
    const events = prefix.filter(e => e.callId === event.callId), call = events.find(e => e.type === "function-call");
    if (!call) return "";
    const range = events.find(e => e.type === "range-input"), moves = events.filter(e => e.type === "move").length;
    const input = call.functionCall.arguments.distance, count = range?.range?.value;
    return `<div class="parameter-live-flow" role="status"><b>${input === undefined ? "固定两格工具" : `传入 ${esc(input)}`}</b> → ${count === undefined ? "等待读取次数" : `重复 ${count} 次`} · 已走 <strong>${moves}</strong> 格${event.type === "function-end" ? " · 调用结束" : ""}</div>`;
  }
  // Use the existing operationPanel, command cards and program chips.
  function builder(m, p, { running = false, playback = null, state = null, notice = "" } = {}) {
    const P = root.CodeQuestParameterLesson, d = P.draft(p), description = P.program(m, d, true);
    const fixed = ["recall", "mismatch"].includes(m.parameterStep), event = playback?.event;
    const disabled = running ? "disabled" : "";
    const cards = [["move", "前进", "move()"], ["left", "左转", "turn_left()"], ["right", "右转", "turn_right()"], ["collect", "采集", "collect()"],
      ["call", fixed ? "前进两格工具" : "前进工具", fixed ? "walk_two()" : "walk(步数)"]];
    const palette = cards.map(([action, name, code]) => `<button class="command-button${action === "call" ? " is-logic" : ""}" data-lesson-action="add" data-value="${action}" type="button" ${running || d.commands.length >= P.limit && d.selected === null ? "disabled" : ""}><strong>${name}</strong><small>${code}</small></button>`).join("");
    const list = description.steps.map(s => `<li data-program-step="${s.id}" class="program-chip${s.commandId === d.selected ? " is-replacing" : ""}${event?.programStep === s.id ? " is-current" : ""}" ${event?.programStep === s.id ? 'aria-current="step"' : ""}>
      <div class="program-command-summary"><span>${s.index + 1}</span><strong>${esc(s.code)}</strong></div>
      <button class="program-replace" data-lesson-action="select" data-value="${s.commandId}" aria-label="替换第 ${s.index + 1} 条 ${esc(s.code)}" ${disabled}>替换</button>
      <button class="program-remove" data-lesson-action="remove" data-value="${s.commandId}" aria-label="移除第 ${s.index + 1} 条 ${esc(s.code)}" ${disabled}>×</button>
      ${s.kind === "call" && !fixed ? numberSelect(`argument-${s.commandId}`, `第 ${s.index + 1} 条步数`, s.input, running) : ""}</li>`).join("");
    const definition = `<fieldset class="parameter-function" ${disabled}><legend>${fixed ? "前进两格工具" : "前进工具 · walk(distance)"}</legend>
      <p>${fixed ? "调用一次，固定前进两格。" : "参数是本次步数：传入几，就前进几格。"}</p>
      ${!fixed ? `<div class="parameter-binding"><span>重复次数</span><button data-lesson-action="binding" data-value="distance" aria-pressed="${d.binding === "distance"}">传入步数</button><button data-lesson-action="binding" data-value="constant" aria-pressed="${d.binding === "constant"}">固定数字</button>${d.binding === "constant" ? numberSelect("constant", "次数", d.constant, running) : ""}</div>` : ""}
      <div class="parameter-function-body ${event?.callId ? "is-executing" : ""}">重复 <b>${fixed ? 2 : d.binding === "distance" ? "distance" : d.binding === "constant" ? d.constant : "?"}</b> 次 → 前进一步</div>
      <p>转弯和采集放在主程序里。</p></fieldset>`;
    const stats = state ? `宝石 ${state.collected?.size ?? 0}/${m.required} · 朝${({ N: "北", E: "东", S: "南", W: "西" })[state.dir] || "—"}` : "";
    return { palette, list, definition, functionTabLabel: "前进工具", count: d.commands.length, replacing: d.selected !== null, undo: Boolean(d.undo || d.commands.length),
      feedback: `<span class="parameter-state">${stats}</span>${live(playback)}${notice ? `<p class="early-feedback" role="status">${esc(notice)}</p>` : ""}` };
  }
  function render(m, p, { storage = "", running = false, playback = null, state = null } = {}) {
    const P = root.CodeQuestParameterLesson, d = P.draft(p), gate = root.CodeQuestEvidence.parameterGate(p, P.revision);
    const stage = m.parameterStep, small = stage !== "route", description = P.program(m, d, true), event = playback?.event;
    const latest = p.attempts.at(-1), attempt = latest?.challengeKey === m.early.key ? latest : null;
    const title = { recall: "两格工具", mismatch: "宝石变远了", connect: "给工具传步数", route: "双码头采集" }[stage];
    const ready = Boolean(p.parameterIntroEvidence?.[stage]);
    const nextLabel = { recall: "把宝石移远", mismatch: "给工具加参数", connect: "返回码头" }[stage];
    return `<div class="early-heading"><h2>${title}</h2><span class="early-badge">${gate.mastered ? "已掌握" : small ? "参数小实验" : "第 19 课 · 参数"}</span></div>
      ${!small ? `<nav class="early-phases" aria-label="本课任务包">${[["guided", m.early.phaseLabels[0], gate.guided], ["challenge", m.early.phaseLabels[1], gate.transfer]].map(([phase, label, done], index) => `<button data-early-action="${phase}" aria-pressed="${p.phase === phase}" ${running || phase !== "guided" && !gate.guided ? "disabled" : ""}><span>${index + 1}</span>${label}${done ? " ✓" : ""}</button>`).join("")}</nav>` : ""}
      <p class="early-goal">${esc(m.early.goal)}</p>
      <p class="parameter-instruction">先在“前进工具”设置重复次数，再回主程序点指令。每次调用在卡片里填步数。</p>
      <div class="parameter-support">
      ${small ? `<div class="early-options"><button data-lesson-action="intro-next" ${running || !ready ? "disabled" : ""}>${nextLabel} →</button><button data-lesson-action="intro-close" ${running ? "disabled" : ""}>返回主任务</button></div>` : p.phase === "guided" && gate.guided ? `<button class="early-primary" data-early-action="challenge" ${running ? "disabled" : ""}>下一步：${m.early.phaseLabels[1]} →</button>` : p.phase === "challenge" ? `<div class="early-options"><button data-early-action="next" ${running ? "disabled" : ""}>${gate.mastered ? "再练一张（可选）" : "换一个等价版本"}</button></div>` : ""}
      <details class="early-help-details"><summary>需要帮助？</summary><p>前进沿当前朝向；转弯和采集要另加指令。台阶每格也算一步。</p><button data-early-action="hint" ${running || p.hintLevel >= 3 ? "disabled" : ""}>提示 ${Math.min(3, p.hintLevel + 1)}</button>${p.hintLevel ? `<p>${esc(m.early.hints[p.hintLevel - 1])}</p>` : ""}${!small ? `<button data-lesson-action="intro-start" ${running ? "disabled" : ""}>试试参数</button>` : ""}${p.assisted ? '<p>用过强提示，请换图独立验证。</p>' : ""}</details>
      <details class="parameter-code"><summary>查看 Python</summary><pre>${description.source ? description.source.split("\n").map((line, i) => `<span class="${event?.line === i + 1 ? "is-active" : ""}">${esc(line) || " "}</span>`).join("") : "# 点指令后，这里显示代码"}</pre>${description.source.includes("?") ? '<p>问号是未填的设置，补好才能运行。</p>' : ""}</details>
      <details class="parameter-overview"><summary>俯视图</summary>${map(m, state)}</details><small class="early-storage">${esc(storage || "自动保存")}</small></div>
      ${attempt ? `<details class="early-result early-evidence-disclosure"><summary>运行记录</summary><p>${esc(attempt.failure || "已完成")}</p><ol class="early-trace">${attempt.events.map(e => `<li>${esc(e.stepLabel)} · ${esc(e.message)}</li>`).join("")}</ol></details>` : ""}
      ${!small ? `<details class="early-mastery"><summary>学习进度 · ${[gate.guided, gate.transfer].filter(Boolean).length}/2</summary><ul>${[[gate.guided, m.early.phaseLabels[0]], [gate.transfer, m.early.phaseLabels[1]]].map(([ok, text]) => `<li>${ok ? "✓" : "○"} ${text}</li>`).join("")}</ul></details>` : ""}`;
  }
  root.CodeQuestParameterLessonUI = { render, builder, map, live };
})(typeof globalThis !== "undefined" ? globalThis : window);
