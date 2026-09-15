(function (root) {
  "use strict";
  const e = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const names = { move: "前进", left: "左转", right: "右转", back: "后退", collect: "采集", upload: "上传", callRoute: "调用 visit_side()" };
  function question(field, q, value, disabled = false) {
    return `<fieldset class="early-question" ${disabled ? "disabled" : ""}><legend>${e(q.prompt)}</legend><div class="early-options">${q.options.map((option) => `<button type="button" data-early-field="${field}" data-value="${e(option)}" aria-pressed="${value === option}">${e(option)}</button>`).join("")}</div></fieldset>`;
  }
  function map(m, planned = [], actual = []) {
    const size = 26, w = m.grid[0].length * size, h = m.grid.length * size;
    const points = (path) => path.map((p) => `${p.x * size + 13},${p.y * size + 13}`).join(" ");
    return `<svg class="early-map" viewBox="0 0 ${w} ${h}" role="img" aria-label="俯视地图：上北下南，左西右东；蓝色虚线为计划，黄色实线为实际。">${m.grid.map((row, y) => [...row].map((tile, x) => tile === "_" ? "" : `<rect x="${x * size + 1}" y="${y * size + 1}" width="24" height="24" rx="2" fill="${tile === "#" ? "#69748a" : tile === "~" ? "#111934" : "#293f91"}"/>`).join("")).join("")}<polyline points="${points(planned)}" fill="none" stroke="#78dcff" stroke-width="5" stroke-dasharray="5 4"/><polyline points="${points(actual)}" fill="none" stroke="#ffbf2f" stroke-width="2.5"/>${m.grid.map((row, y) => [...row].map((tile, x) => ["S", "B"].includes(tile) ? `<text x="${x * size + 13}" y="${y * size + 17}" text-anchor="middle" fill="white" font-size="13" font-weight="700">${tile === "S" ? "起" : m.early.targets.find(t => t.x === x && t.y === y)?.label.slice(-1) || "标"}</text>` : "").join("")).join("")}${m.lessonNo === 5 ? [...m.grid[0]].map((_,x)=>`<text x="${x*size+13}" y="17" fill="#e2eaff" font-size="12" text-anchor="middle">${x}</text>`).join("") + m.grid.slice(1).map((_,i)=>`<text x="13" y="${(i+1)*size+17}" fill="#e2eaff" font-size="12" text-anchor="middle">${i+1}</text>`).join("") : ""}</svg>`;
  }
  function v16Designer(m, p, running) {
    const unit = m.early;
    if (unit.repairing) {
      const observed = p.debugObservation?.challengeKey === unit.key;
      return `${map(m, unit.successPath)}
        <div class="early-rule-meter"><span>当前动作上限</span><strong>${unit.ruleLimit}</strong><small>${unit.repairKind === "sealed" && !p.ruleFixed ? "目标周围没有入口" : "作者解需要实际运行验证"}</small></div>
        ${observed ? question("ruleDiagnosis", { prompt: "失败来自哪里？", options: unit.diagnosisOptions }, p.ruleDiagnosis, running) : '<p class="early-task">先运行给定作者解，观察是程序错，还是规则本身有问题。</p>'}
        ${observed && p.ruleDiagnosis ? `<button class="early-primary" type="button" data-early-action="repair-rule" ${running || p.ruleFixed ? "disabled" : ""}>${p.ruleFixed ? "规则已修正" : unit.repairKind === "limit" ? "把上限增加 1" : "移开一块封路岩石"}</button>` : ""}`;
    }
    if (unit.independent) {
      const failed = Boolean(p.playtestObservation);
      return `${map(m)}<div class="early-rule-meter"><span>作品版本</span><strong>${p.ruleRevised ? "v2" : "v1"}</strong><small>动作上限 ${unit.ruleLimit}</small></div>
        <p class="early-task">${failed ? "内置试玩已经留下失败轨迹。说明失败来自哪条规则，再修改一次。" : "先运行内置失败方案，确认它为什么过不了你的关卡。"}</p>
        ${failed ? question("failureReason", { prompt: "失败方案违反了什么？", options: ["撞上我放的障碍", "超过动作上限", "没有站在信标上采集"] }, p.failureReason, running) : ""}
        ${failed && p.failureReason ? `<button class="early-primary" type="button" data-early-action="revise-rule" ${running || p.ruleRevised ? "disabled" : ""}>${p.ruleRevised ? "已保存作品 v2" : "调整上限并保存 v2"}</button>` : ""}`;
    }
    return `<fieldset class="early-question" ${running ? "disabled" : ""}><legend>1. 把信标放在哪里？</legend><div class="early-target-grid">${unit.designerTargets.map((target) => `<button type="button" data-early-field="designerTarget" data-value="${e(target.id)}" aria-pressed="${p.designerTarget === target.id}"><strong>${e(target.label)}</strong><span>(${target.x}, ${target.y})</span></button>`).join("")}</div></fieldset>
      <fieldset class="early-question" ${running ? "disabled" : ""}><legend>2. 放置障碍（最多两块）</legend><div class="early-options">${unit.obstacleChoices.map((item) => `<button type="button" data-early-action="toggle-obstacle" data-value="${e(item.id)}" aria-pressed="${p.obstacles.includes(item.id)}">${e(item.label)}</button>`).join("")}</div></fieldset>
      ${question("actionLimit", { prompt: "3. 选择动作上限", options: ["tight", "roomy"] }, p.actionLimit, running).replace("tight</button>", `刚好可解 · ${unit.ruleLimit}</button>`).replace("roomy</button>", `留 3 步余量</button>`)}
      ${map(m)}<div class="early-rule-meter"><span>规则状态</span><strong>${p.guidedComplete ? "作者解已验证" : "等待作者解"}</strong><small>目标 ${e(unit.selectedTarget.label)} · ${unit.selectedWalls.length} 块障碍 · 上限 ${unit.ruleLimit}</small></div>`;
  }
  function callTable(attempt, loopMode = false) {
    if (!attempt?.callSnapshots?.length) return "";
    return `<div class="early-call-table" role="table" aria-label="${loopMode ? "循环逐轮展开状态" : "函数调用前后状态"}"><div class="early-call-head" role="row"><span>${loopMode ? "轮次" : "调用"}</span><span>${loopMode ? "轮前" : "进入"}</span><span>${loopMode ? "轮后" : "离开"}</span><span>${loopMode ? "展开" : "约定"}</span></div>${attempt.callSnapshots.map((item) => {
      const before = item.before, after = item.after;
      const stable = before && after && before.x === after.x && before.y === after.y && before.dir === after.dir;
      const valid = loopMode ? Boolean(after && !item.failed) : stable;
      return `<div role="row"><strong>#${item.call}</strong><span>${before ? `(${before.x},${before.y}) 朝${e(root.CodeQuestEarlyLessons.labels[before.dir])}` : "—"}</span><span>${after ? `(${after.x},${after.y}) 朝${e(root.CodeQuestEarlyLessons.labels[after.dir])}` : "中断"}</span><b class="${valid ? "is-ok" : "is-bad"}">${loopMode ? valid ? "已展开" : "中断" : stable ? "一致" : "偏离"}</b></div>`;
    }).join("")}</div>`;
  }
  function renderV16(m, p, { notice = "", storage = "", running = false } = {}) {
    const unit = m.early;
    const latest = p.attempts.at(-1), attempt = latest?.challengeKey === unit.key ? latest : null;
    const phases = [["guided", unit.phaseLabels[0], p.guidedComplete], ["repair", unit.phaseLabels[1], Boolean(p.repairEvidence)], ["challenge", unit.phaseLabels[2], p.mastered]];
    const done = phases.filter((item) => item[2]).length;
    const next = p.phase === "guided" ? "repair" : "challenge";
    const diagnosisVisible = [6, 8, 11, 12].includes(m.lessonNo) && unit.repairing && p.debugObservation?.challengeKey === unit.key
      || m.lessonNo === 9 && unit.repairing && p.debugObservation?.challengeKey === unit.key
      || m.lessonNo === 10 && Boolean(attempt && !attempt.success || p.debugObservation?.challengeKey === unit.key);
    const taskBody = m.lessonNo === 7 ? v16Designer(m, p, running)
      : [11, 12].includes(m.lessonNo) ? `${map(m)}${question("loopCount", { prompt: "选择循环次数", options: unit.loopCountOptions.map(String) }, String(p.loopCount || ""), running)}${question("loopBoundary", { prompt: "collect() 应放在哪里？", options: ["inside", "outside"] }, p.loopBoundary, running).replace(">inside<", ">循环内：每轮执行<").replace(">outside<", ">循环外：只执行一次<")}<section class="early-function-contract"><div><span>循环体</span><strong>for _ in range(${p.loopCount || "?"}):</strong><small>${p.functionDraft.length ? p.functionDraft.map((id) => names[id]).join(" → ") : "等待你放入完整重复单元"}</small></div><i aria-hidden="true">×</i><div><span>实际展开</span><strong>${p.loopCount || 0} 轮</strong><small>每轮都会执行循环体中的全部动作</small></div></section>${diagnosisVisible ? question("diagnosis", { prompt: "循环问题在哪里？", options: unit.diagnosisOptions }, p.diagnosis, running) : ""}`
      : m.lessonNo >= 9 ? `${map(m)}<label class="early-function-name" for="earlyFunctionName"><span>给工具命名</span><input id="earlyFunctionName" value="${e(p.functionName)}" maxlength="24" pattern="[A-Za-z_][A-Za-z0-9_]*" ${running ? "disabled" : ""}><small>使用英文、数字或下划线，不能以数字开头</small></label><section class="early-function-contract"><div><span>函数定义区</span><strong>def ${e(p.functionName)}():</strong><small>${p.functionDraft.length ? p.functionDraft.map((id) => names[id]).join(" → ") : "等待你放入动作"}</small></div><i aria-hidden="true">⇄</i><div><span>主程序</span><strong>${p.draft.filter((id) => id === "callRoute").length} 次调用</strong><small>调用时才会执行函数里的动作</small></div></section>${diagnosisVisible ? question("diagnosis", { prompt: m.lessonNo === 9 ? "哪一个支路漏了调用？" : "问题应该修在哪里？", options: unit.diagnosisOptions }, p.diagnosis, running) : ""}`
      : `${map(m, unit.repairing ? unit.successPath : [], attempt?.path || [])}${unit.repairing && p.debugObservation?.challengeKey === unit.key ? question("diagnosis", { prompt: "第一次偏离是哪一步？", options: unit.faulty.map((_, index) => String(index + 1)) }, p.diagnosis, running) : !unit.repairing ? question("prediction", unit.prediction, p.prediction, running) : ""}`;
    return `<div class="early-heading"><div><span>第 ${m.lessonNo} 课 · v1.6</span><h2>${e(m.title)}</h2></div><strong class="early-badge">${p.mastered ? "能力门通过" : `${done} / 3`}</strong></div>
      <p class="early-goal"><b>任务：</b>${e(unit.goal)}</p><p class="early-rule"><b>本课规则：</b>${e(unit.rule)}</p>
      <nav class="early-phases" aria-label="本课任务包">${phases.map(([id, label, complete], index) => `<button type="button" data-early-action="${id}" aria-pressed="${p.phase === id}" ${running ? "disabled" : ""}><span>${index + 1}</span>${e(label)}${complete ? " ✓" : ""}</button>`).join("")}</nav>
      <div class="early-unit"><h3>${e(unit.title)}</h3>${p.phase !== "guided" ? `<button type="button" data-early-action="next" ${running ? "disabled" : ""}>换一个等价版本</button>` : ""}</div>
      ${taskBody}${notice ? `<p class="early-feedback" role="status">${e(notice)}</p>` : ""}
      <div class="early-options"><button class="early-primary" type="button" data-early-action="build">${[11, 12].includes(m.lessonNo) ? "打开循环体与主程序" : m.lessonNo >= 9 ? "打开定义区与主程序" : "开始操作"}</button>${attempt ? '<button type="button" data-early-action="show-review">看学习证据</button>' : ""}</div>
      <details class="early-help-details"><summary>看个例子或请求提示</summary><p>${e(unit.intro)}</p><div class="early-help"><button type="button" data-early-action="hint" ${running || p.hintLevel >= 3 ? "disabled" : ""}>${p.hintLevel === 2 ? "看局部示例" : p.hintLevel >= 3 ? "已看完提示" : `提示 ${p.hintLevel + 1}`}</button><span>${p.assisted ? "这次记为使用强提示；迁移任务仍需独立完成。" : "提示只帮助观察，不会替你完成。"}</span></div>${p.hintLevel ? `<p class="early-hint">${e(unit.hints[p.hintLevel - 1])}</p>` : ""}</details>
      <p class="early-storage" role="status">${e(storage || "已自动保存")}</p>
      ${attempt ? `<section class="early-result" aria-label="学习证据"><h3>${attempt.success ? "本次证据有效" : "本次运行留下了可检查的证据"}</h3><p>${attempt.trace.length} 个执行动作 · 采集 ${attempt.trace.filter((item) => item.command === "collect" && !item.failed).length} 次${attempt.failure ? ` · ${e(attempt.failure)}` : ""}</p>${m.lessonNo >= 9 ? callTable(attempt, [11, 12].includes(m.lessonNo)) : ""}<details><summary>查看执行轨迹</summary><ol class="early-trace">${attempt.trace.map((step, index) => `<li>${index + 1}. ${e(names[step.command] || step.command)}：(${step.x}, ${step.y})，朝${e(root.CodeQuestEarlyLessons.labels[step.dir])}${step.failed ? " · 失败" : ""}</li>`).join("")}</ol></details></section>` : ""}
      ${attempt?.success ? `<section class="early-review"><h3>保存一条关键证据</h3><label for="earlyReflection">${e(unit.reflectionPrompt)}</label><textarea id="earlyReflection" maxlength="600" rows="2" ${running ? "disabled" : ""} placeholder="用一句话说明">${e(p.reflection)}</textarea><button class="early-primary" type="button" data-early-action="review" ${running ? "disabled" : ""}>保存说明</button>${!unit.independent ? `<button type="button" data-early-action="${next}" ${running ? "disabled" : ""}>下一步：${e(unit.phaseLabels[next === "repair" ? 1 : 2])}</button>` : ""}</section>` : ""}
      <details class="early-mastery" ${p.mastered ? "open" : ""}><summary>能力门 ${done} / 3${p.mastered ? " ✓" : ""}</summary><ul>${phases.map(([, label, complete]) => `<li>${complete ? "✓" : "○"} ${e(label)}</li>`).join("")}</ul></details>`;
  }
  function render(m, p, { notice = "", storage = "", running = false, prerequisiteNeeded = true } = {}) {
    if (m.lessonNo >= 6) return renderV16(m, p, { notice, storage, running });
    const E = root.CodeQuestEarlyLessons, unit = m.early;
    const latest = p.attempts.at(-1), attempt = latest?.challengeKey === unit.key ? latest : null;
    const observed = p.debugObservation?.challengeKey === unit.key ? p.debugObservation : null;
    const plan = m.routeChoices?.find((route) => route.id === p.plan);
    const next = p.phase === "guided" ? "repair" : "challenge";
    const phases = [["guided", "自己编", p.guidedComplete], ["repair", "找错并改", Boolean(p.repairEvidence)], ["challenge", "换图挑战", p.mastered]];
    const done = phases.filter((phase) => phase[2]).length;
    const taskHint = unit.repairing
      ? observed ? "选出最早出错的一步，再替换指令。" : "先运行这段错误程序。"
      : unit.independent ? "这是新地图，重新观察后再编程。" : "先预测，再编程。";

    return `<div class="early-heading"><div><span>第 ${m.lessonNo} 课</span><h2>${e(m.title)}</h2></div><strong class="early-badge">${p.mastered ? "挑战完成" : `${done} / 3`}</strong></div>
      <p class="early-goal"><b>任务：</b>${e(unit.goal)}</p>
      <nav class="early-phases" aria-label="本课进度">${phases.map(([id, label, complete], index) => `<button type="button" data-early-action="${id}" aria-pressed="${p.phase === id}" ${running ? "disabled" : ""}>${index + 1}. ${label}${complete ? " ✓" : ""}</button>`).join("")}</nav>
      <div class="early-unit"><h3>${e(unit.title)}</h3>${p.phase !== "guided" ? `<button type="button" data-early-action="next" ${running ? "disabled" : ""}>换${unit.repairing ? "案例" : "地图"}</button>` : ""}</div>
      ${!unit.repairing && prerequisiteNeeded && unit.prerequisite ? question("prerequisite", unit.prerequisite, p.prerequisite, running) : ""}
      ${m.lessonNo === 3 && !unit.repairing ? `<fieldset class="early-question" ${running ? "disabled" : ""}><legend>选一条路线</legend><div class="early-routes">${m.routeChoices.map((route) => `<button type="button" data-early-field="plan" data-value="${e(route.id)}" aria-pressed="${p.plan === route.id}"><strong>${e(route.label)}</strong><span>${e(route.summary)}</span></button>`).join("")}</div></fieldset>${question("reason", { prompt: "为什么选它？", options: E.reasons }, p.reason, running)}` : ""}
      ${unit.repairing || unit.independent || (m.lessonNo === 3 && plan) || m.lessonNo === 5 ? `${map(m, unit.repairing ? unit.successPath : plan?.path || [])}<p class="early-map-caption">上北下南，左西右东${unit.repairing || plan ? "；蓝线是计划" : ""}。</p>` : ""}
      ${m.lessonNo === 5 ? `<p class="early-targets">顺序：${unit.targets.map((target) => `${e(target.label)} (${target.x}, ${target.y})`).join(" → ")}</p>` : ""}
      ${unit.repairing ? `${observed ? `<fieldset class="early-question" ${running ? "disabled" : ""}><legend>最早出错的是哪一步？</legend><div class="early-options">${unit.faulty.map((command, index) => `<button type="button" data-early-field="diagnosis" data-value="${index + 1}" aria-pressed="${p.diagnosis === String(index + 1)}">${index + 1}. ${names[command]}</button>`).join("")}</div></fieldset><p class="early-note">程序在第 ${observed.trace.length} 步停下。</p>` : ""}<button type="button" data-early-action="faulty" ${running ? "disabled" : ""}>恢复错误程序</button>` : question("prediction", unit.prediction, p.prediction, running)}
      <p class="early-task">${e(taskHint)}</p>
      ${notice ? `<p class="early-feedback" role="status">${e(notice)}</p>` : ""}
      <div class="early-options"><button class="early-primary" type="button" data-early-action="build">${unit.repairing ? "检查程序" : "开始编程"}</button>${attempt ? '<button type="button" data-early-action="show-review">看运行结果</button>' : ""}</div>
      <details class="early-help-details"><summary>需要帮助？</summary><p>${e(unit.intro)}</p><div class="early-help"><button type="button" data-early-action="hint" ${running || p.hintLevel >= 3 ? "disabled" : ""}>${p.hintLevel === 2 ? "看局部示例" : p.hintLevel >= 3 ? "已看完提示" : `提示 ${p.hintLevel + 1}`}</button><span>${p.assisted ? "请换一张图独立挑战。" : "需要时再打开。"}</span></div>${p.hintLevel ? `<p class="early-hint">${e(unit.hints[p.hintLevel - 1])}</p>` : ""}${p.legacyEvidence ? '<p class="early-note">旧版记录已保留。</p>' : ""}</details>
      <p class="early-storage" role="status">${e(storage || "已自动保存")}</p>
      ${attempt ? `<section class="early-result" aria-label="运行结果"><h3>${attempt.success ? "运行成功" : "运行停止"}</h3><p>${attempt.trace.length} 步 · ${attempt.trace.filter((step) => step.command === "left" || step.command === "right").length} 次转向${attempt.tailCount ? ` · 采集后还有 ${attempt.tailCount} 步` : ""}</p>
        ${!unit.repairing ? `<p>预测：${e(attempt.prediction)} · ${attempt.predictionCorrect ? "正确" : "需要重试"}</p>` : ""}
        ${!attempt.targetOrderCorrect && m.lessonNo === 5 ? '<p class="early-feedback">请按 A → B 的顺序采集。</p>' : ""}
        ${m.lessonNo === 3 ? `${map(m, attempt.plannedPath, attempt.path)}<p>${attempt.routeMatches ? "路线和计划一致。" : attempt.reconciled ? `已改用实际路线：${e(attempt.reconciliationReason)}。` : `第 ${attempt.divergence} 次移动开始偏离计划。`}</p>` : ""}
        <details ${unit.repairing ? "open" : ""}><summary>查看每一步</summary><ol class="early-trace">${attempt.trace.map((step, index) => `<li>${index + 1}. ${names[step.command]}：(${step.x}, ${step.y})，朝${e(E.labels[step.dir])}，采集 ${step.collected}${step.failed ? " · 失败" : ""}</li>`).join("")}</ol></details></section>` : ""}
      ${attempt?.success ? `<section class="early-review"><h3>你是怎么改的？</h3><label for="earlyReflection">${e(unit.reflectionPrompt)}</label><textarea id="earlyReflection" maxlength="600" rows="2" ${running ? "disabled" : ""} placeholder="写一句话">${e(p.reflection)}</textarea>${m.lessonNo === 3 && !unit.repairing && !attempt.routeMatches && !attempt.reconciled ? question("reconciliation", { prompt: "为什么改用实际路线？", options: E.reasons }, p.reconciliation, running) : ""}<button class="early-primary" type="button" data-early-action="review" ${running ? "disabled" : ""}>保存说明</button>${notice ? `<p class="early-feedback" role="status">${e(notice)}</p>` : ""}${!unit.independent ? `<button type="button" data-early-action="${next}" ${running ? "disabled" : ""}>下一步：${next === "repair" ? "找错并改" : "换图挑战"}</button>` : ""}</section>` : ""}
      <details class="early-mastery" ${p.mastered ? "open" : ""}><summary>本课进度 ${done} / 3${p.mastered ? " ✓" : ""}</summary><ul><li>${p.guidedComplete ? "✓" : "○"} 自己编</li><li>${p.repairEvidence ? "✓" : "○"} 找错并改</li><li>${p.mastered ? "✓" : "○"} 换图挑战</li></ul></details>`;
  }
  root.CodeQuestEarlyLessonUI = { render };
})(typeof globalThis !== "undefined" ? globalThis : window);
