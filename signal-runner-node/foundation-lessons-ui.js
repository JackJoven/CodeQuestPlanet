(function (root) {
  "use strict";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const arrows = { N: "↑", E: "→", S: "↓", W: "←" };
  function map(m, state) {
    const size = 28, position = state || m.startOverride;
    const cells = m.grid.flatMap((row, y) => [...row].map((tile, x) => {
      if (tile === "_") return "";
      const target = m.targetPositions.some(p => p.x === x && p.y === y), junction = m.foundation.junction?.x === x && m.foundation.junction?.y === y;
      const label = target ? "宝" : junction ? "岔" : "";
      return `<g><rect x="${x * size + 1}" y="${y * size + 1}" width="26" height="26" rx="3" fill="${target ? "#8b6632" : junction ? "#2b7183" : "#284f49"}"/><text x="${x * size + 14}" y="${y * size + 18}" text-anchor="middle" fill="#fff" font-size="10">${label}</text></g>`;
    })).join("");
    return `<svg class="early-map foundation-map" viewBox="0 0 ${m.grid[0].length * size} ${m.grid.length * size}" role="img" aria-label="${m.lessonNo === 1 ? "登陆台俯视图" : "四向岔台俯视图"}">${cells}<circle cx="${position.x * size + 14}" cy="${position.y * size + 14}" r="11" fill="#111d45" stroke="#8be5ff" stroke-width="2"/><text x="${position.x * size + 14}" y="${position.y * size + 18}" text-anchor="middle" fill="#fff" font-size="13">${arrows[state?.dir || m.startDir]}</text></svg>`;
  }
  function builder(m, p, { running = false, playback = null, notice = "" } = {}) {
    const F = root.CodeQuestFoundationLessons, d = F.draft(p, m.lessonNo), description = F.program(m, d, m.lessonNo, true), event = playback?.event;
    const available = m.lessonNo === 1 ? ["move", "collect"] : ["move", "left", "right", "collect"];
    const code = { move: "move()", left: "turn_left()", right: "turn_right()", collect: "collect()" };
    const palette = available.map(action => `<button class="command-button${action === "collect" ? " is-logic" : ""}" data-lesson-action="add" data-value="${action}" type="button" ${running || d.commands.length >= F.limits[m.lessonNo] && d.selected === null ? "disabled" : ""}><strong>${F.actions[action]}</strong><small>${code[action]}</small></button>`).join("");
    const list = description.steps.map(step => `<li data-program-step="${step.id}" class="program-chip${step.commandId === d.selected ? " is-replacing" : ""}${event?.programStep === step.id ? " is-current" : ""}" ${event?.programStep === step.id ? 'aria-current="step"' : ""}><div class="program-command-summary"><span>${step.index + 1}</span><strong>${esc(step.code)}</strong></div><button class="program-replace" data-lesson-action="select" data-value="${step.commandId}" aria-label="替换第 ${step.index + 1} 条" ${running ? "disabled" : ""}>替换</button><button class="program-remove" data-lesson-action="remove" data-value="${step.commandId}" aria-label="移除第 ${step.index + 1} 条" ${running ? "disabled" : ""}>×</button></li>`).join("");
    const live = event ? `<p class="parameter-live-flow" role="status">${esc(event.message)}</p>` : "";
    return { palette, list, definition: "", hideFunctionTab: true, count: d.commands.length, replacing: d.selected !== null,
      undo: Boolean(d.undo || d.commands.length), feedback: `${live}${notice ? `<p class="early-feedback" role="status">${esc(notice)}</p>` : ""}` };
  }
  function render(m, p, { storage = "", running = false, playback = null, state = null } = {}) {
    const F = root.CodeQuestFoundationLessons, d = F.draft(p, m.lessonNo), gate = root.CodeQuestEvidence.stateGate(p, F.revisions[m.lessonNo]);
    const description = F.program(m, d, m.lessonNo, true), event = playback?.event, latest = p.attempts.at(-1);
    const attempt = latest?.challengeKey === m.early.key ? latest : null;
    const title = m.lessonNo === 1 ? "浮岛登陆台" : "四向岔台";
    return `<div class="early-heading"><h2>${title}</h2><span class="early-badge">${gate.mastered ? "已掌握" : `第 ${m.lessonNo} 课 · ${m.lessonNo === 1 ? "顺序" : "方向"}`}</span></div>
      <nav class="early-phases" aria-label="本课任务包">${[["guided", m.early.phaseLabels[0], gate.guided], ["challenge", m.early.phaseLabels[1], gate.transfer]].map(([phase, label, done], index) => `<button data-early-action="${phase}" aria-pressed="${p.phase === phase}" ${running || phase === "challenge" && !gate.guided ? "disabled" : ""}><span>${index + 1}</span>${label}${done ? " ✓" : ""}</button>`).join("")}</nav>
      <p class="early-goal">${esc(m.early.goal)}</p><p class="foundation-rule">${esc(m.early.rule)}</p>
      <div class="parameter-support">${p.phase === "guided" && gate.guided ? `<button class="early-primary" data-early-action="challenge" ${running ? "disabled" : ""}>下一步：${m.early.phaseLabels[1]} →</button>` : p.phase === "challenge" ? `<div class="early-options"><button data-early-action="next" ${running ? "disabled" : ""}>${gate.mastered ? "再练一张（可选）" : "换一个等价版本"}</button></div>` : ""}
      <details class="early-help-details"><summary>需要帮助？</summary><p>${m.lessonNo === 1 ? "先数格，再把采集放到抵达之后。" : "只看 Nova 的箭头判断左右；拖动画面不会改变程序方向。"}</p><button data-early-action="hint" ${running || p.hintLevel >= 3 ? "disabled" : ""}>提示 ${Math.min(3, p.hintLevel + 1)}</button>${p.hintLevel ? `<p>${esc(m.early.hints[p.hintLevel - 1])}</p>` : ""}${p.assisted ? "<p>用过强提示，请换图独立验证。</p>" : ""}</details>
      <details class="parameter-code"><summary>查看 Python</summary><pre>${(description.source || "# 还没有指令").split("\n").map((line, i) => `<span class="${event?.line === i + 1 ? "is-active" : ""}">${esc(line)}</span>`).join("")}</pre></details>
      <details class="parameter-overview"><summary>俯视图</summary>${map(m, state)}</details><small class="early-storage">${esc(storage || "自动保存")}</small></div>
      ${attempt ? `<details class="early-result early-evidence-disclosure"><summary>运行记录</summary><p>${esc(attempt.failure || "已完成")}</p>${m.lessonNo === 1 ? `<p>前进 ${attempt.movesBeforeCollect ?? 0} 次后采集；本图距离 ${attempt.distance} 格。</p>` : `<p>起始朝向 ${esc(attempt.initialDirection)}；第一次转向 ${attempt.firstTurn === "left" ? "左" : attempt.firstTurn === "right" ? "右" : "无"}；转向位置${attempt.turnStayed ? "未改变" : "发生改变"}。</p>`}</details>` : ""}
      <details class="early-mastery"><summary>学习进度 · ${[gate.guided, gate.transfer].filter(Boolean).length}/2</summary><ul><li>${gate.guided ? "✓" : "○"} ${m.early.phaseLabels[0]}</li><li>${gate.transfer ? "✓" : "○"} ${m.early.phaseLabels[1]}</li></ul></details>`;
  }
  root.CodeQuestFoundationLessonUI = { render, builder, map };
})(typeof globalThis !== "undefined" ? globalThis : window);
