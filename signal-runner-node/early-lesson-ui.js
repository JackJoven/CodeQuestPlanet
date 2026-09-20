(function (root) {
  "use strict";
  const e = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const names = {
    move: "前进", left: "左转", right: "右转", back: "后退", wait: "等待一拍", collect: "采集", upload: "上传", shield: "开启护盾",
    callRoute: "调用路线工具", ifHazardShield: "遇到尖刺就开盾", ifWallRight: "遇到岩石就右转", ifSensorAct: "if 前方状态", logicGuard: "安全守卫",
    whileBeacon: "while 直到宝石", whileRelay: "while 直到中继站", repeat2: "重复前进 2 次", repeat3: "重复前进 3 次", repeat4: "重复前进 4 次", repeat5: "重复前进 5 次"
  };
  function question(field, q, value, disabled = false) {
    return `<fieldset class="early-question" ${disabled ? "disabled" : ""}><legend>${e(q.prompt)}</legend><div class="early-options">${q.options.map((option) => `<button type="button" data-early-field="${field}" data-value="${e(option)}" aria-pressed="${value === option}">${e(option)}</button>`).join("")}</div></fieldset>`;
  }
  function choiceGroup(field, prompt, options, value, disabled = false) {
    return `<fieldset class="early-question" ${disabled ? "disabled" : ""}><legend>${e(prompt)}</legend><div class="early-choice-grid">${options.map((option) => `<button type="button" data-early-field="${field}" data-value="${e(option.value)}" aria-pressed="${value === option.value}"><strong>${e(option.label)}</strong><small>${e(option.detail)}</small></button>`).join("")}</div></fieldset>`;
  }
  function map(m, planned = [], actual = []) {
    const size = 26, w = m.grid[0].length * size, h = m.grid.length * size;
    const points = (path) => path.map((p) => `${p.x * size + 13},${p.y * size + 13}`).join(" ");
    const targets = m.early.targets || [];
    const color = (tile) => tile === "#" ? "#69748a" : tile === "~" ? "#111934" : tile === "H" ? "#6f7783" : tile === "B" ? "#9a6a16" : tile === "S" ? "#236a83" : "#293f91";
    const marker = (tile, x, y) => {
      const target = targets.find((item) => item.x === x && item.y === y);
      if (tile === "S" && target) return "起★";
      if (tile === "S") return "起";
      if (tile === "H") return "刺";
      if (tile === "R") return "站";
      if (tile === "B" || target) return target?.label.slice(-1) || "标";
      return "";
    };
    return `<svg class="early-map${m.lessonNo >= 13 ? " is-advanced" : ""}" viewBox="0 0 ${w} ${h}" role="img" aria-label="俯视地图：上北下南，左西右东；蓝色虚线为计划，黄色实线为实际。">${m.grid.map((row, y) => [...row].map((tile, x) => tile === "_" ? "" : `<rect x="${x * size + 1}" y="${y * size + 1}" width="24" height="24" rx="2" fill="${color(tile)}"/>`).join("")).join("")}<polyline points="${points(planned)}" fill="none" stroke="#78dcff" stroke-width="5" stroke-dasharray="5 4"/><polyline points="${points(actual)}" fill="none" stroke="#ffbf2f" stroke-width="2.5"/>${m.grid.map((row, y) => [...row].map((tile, x) => { const label = marker(tile, x, y); return label ? `<text x="${x * size + 13}" y="${y * size + 17}" text-anchor="middle" fill="white" font-size="${label.length > 1 ? 9 : 13}" font-weight="700">${label}</text>` : ""; }).join("")).join("")}${m.lessonNo === 5 ? [...m.grid[0]].map((_,x)=>`<text x="${x*size+13}" y="17" fill="#e2eaff" font-size="12" text-anchor="middle">${x}</text>`).join("") + m.grid.slice(1).map((_,i)=>`<text x="13" y="${(i+1)*size+17}" fill="#e2eaff" font-size="12" text-anchor="middle">${i+1}</text>`).join("") : ""}</svg>`;
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
        ${failed ? question("failureReason", { prompt: "失败方案违反了什么？", options: ["撞上我放的障碍", "超过动作上限", "没有站在宝石上采集"] }, p.failureReason, running) : ""}
        ${failed && p.failureReason ? `<button class="early-primary" type="button" data-early-action="revise-rule" ${running || p.ruleRevised ? "disabled" : ""}>${p.ruleRevised ? "已保存作品 v2" : "调整上限并保存 v2"}</button>` : ""}`;
    }
    return `<fieldset class="early-question" ${running ? "disabled" : ""}><legend>1. 把宝石放在哪里？</legend><div class="early-target-grid">${unit.designerTargets.map((target) => `<button type="button" data-early-field="designerTarget" data-value="${e(target.id)}" aria-pressed="${p.designerTarget === target.id}"><strong>${e(target.label)}</strong><span>(${target.x}, ${target.y})</span></button>`).join("")}</div></fieldset>
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
  function decisionEvidence(attempt) {
    const decisions = attempt?.trace?.filter((step) => step.condition) || [];
    if (!decisions.length) return "";
    return `<div class="early-decision-list" aria-label="条件执行证据">${decisions.map((step) => {
      const condition = step.condition;
      if (condition.kind === "if") return `<div><span>传感器读到 <b>${e(condition.observed)}</b></span><strong class="${condition.result ? "is-true" : "is-false"}">${condition.result ? "TRUE · 执行动作" : "FALSE · 跳过动作"}</strong></div>`;
      if (condition.kind === "boolean") return `<div><span>${condition.values.map((value) => value ? "T" : "F").join(" · ")} · ${e(condition.connector).toUpperCase()}</span><strong class="${condition.result ? "is-true" : "is-false"}">${condition.result ? "MOVE" : "TURN"}</strong></div>`;
      if (condition.kind === "while-check") return `<div><span>while 第 ${condition.repetitions} 轮</span><strong class="is-true">TRUE · 前进一步</strong></div>`;
      return `<div><span>while 再次检查</span><strong class="is-false">FALSE · ${condition.repetitions} 次后停止</strong></div>`;
    }).join("")}</div>`;
  }
  function controlLab(m, p, running, diagnosisVisible) {
    const unit = m.early;
    if (m.lessonNo === 13) {
      const selected = p.conditionSensor || unit.defaultSensor;
      const visibleSelected = selected === "hazard" ? "spike" : selected;
      return `${map(m, unit.successPath)}<p class="early-map-caption">灰色“刺”格是尖刺区；条件卡会读取它正前方的一格。</p>
        ${choiceGroup("conditionSensor", "if 要检测哪一种前方状态？", unit.conditionOptions, selected, running)}
        <section class="early-control-rule"><span>先读取</span><strong>前方 == ${e(visibleSelected || "请选择")}</strong><i>→</i><b>${selected === "hazard" ? "开盾" : selected === "blocked" ? "右转" : selected === "clear" ? "前进" : "等待设置"}</b></section>
        ${diagnosisVisible ? question("diagnosis", { prompt: "失败的根因是什么？", options: unit.diagnosisOptions }, p.diagnosis, running) : ""}`;
    }
    if (m.lessonNo === 14) {
      const connector = p.logicConnector || unit.defaultConnector;
      const hazardMode = p.logicHazardMode || unit.defaultHazardMode;
      const state = unit.initialState;
      const values = [state.clear, state.enoughEnergy, hazardMode === "hazard" ? !state.notHazard : state.notHazard];
      const outcome = connector ? (connector === "and" ? values.every(Boolean) : values.some(Boolean)) : null;
      return `${map(m, unit.successPath)}<p class="early-map-caption">规则每次同时读取通路、能量和尖刺状态，再决定前进或右转。</p>
        <div class="early-rule-pickers">${choiceGroup("logicConnector", "条件怎样连接？", unit.connectorOptions, connector, running)}${choiceGroup("logicHazardMode", "尖刺条件怎样写？", unit.hazardOptions, hazardMode, running)}</div>
        <section class="early-truth-strip"><span>通路 <b>${state.clear ? "T" : "F"}</b></span><span>能量充足 <b>${state.enoughEnergy ? "T" : "F"}</b></span><span>${hazardMode === "hazard" ? "尖刺" : "NOT 尖刺"} <b>${values[2] ? "T" : "F"}</b></span><strong class="${outcome === null ? "" : outcome ? "is-true" : "is-false"}">${outcome === null ? "等待规则" : outcome ? "前进" : "右转"}</strong></section>
        ${diagnosisVisible ? question("diagnosis", { prompt: "OR 为什么让这条规则失效？", options: unit.diagnosisOptions }, p.diagnosis, running) : ""}`;
    }
    const observed = p.debugObservation?.challengeKey === unit.key;
    return `${map(m, unit.successPath)}<p class="early-map-caption">目标距离会变化；起点与宝石重合时，地图用“起★”表示。</p>
      ${!unit.repairing ? question("prediction", unit.prediction, p.prediction, running) : ""}
      <section class="early-control-rule"><span>每轮先检查</span><strong>还没有到宝石？</strong><i>→</i><b>是：前进 · 否：停止</b></section>
      ${observed ? question("diagnosis", { prompt: "为什么不能继续使用固定步数？", options: unit.diagnosisOptions }, p.diagnosis, running) : ""}`;
  }
  function advancedSystemLab(m, p, running, attempt) {
    const unit = m.early, lab = unit.dataLab;
    const observed = p.debugObservation?.challengeKey === unit.key;
    const selected = p.systemChoice || lab.selectedChoice;
    const selectedB = p.systemChoiceB || lab.selectedChoiceB;
    const choices = lab.options.map(([value, label, detail]) => ({ value, label, detail }));
    const secondary = lab.secondary
      ? choiceGroup("systemChoiceB", lab.secondary.prompt, lab.secondary.options.map(([value, label, detail]) => ({ value, label, detail })), selectedB, running)
      : "";
    return `<section class="early-system-lab">
      <div class="early-difficulty-card"><span>本课新增挑战</span><strong>${e(lab.difficulty)}</strong></div>
      ${map(m, unit.successPath, attempt?.path || [])}
      <p class="early-map-caption">13 × 8 大地图 · 蓝色虚线是任务路径，黄色实线是本次实际轨迹。</p>
      <div class="early-system-layout"><div class="early-system-decisions">
        ${choiceGroup("systemChoice", lab.prompt, choices, selected, running)}${secondary}
        ${observed ? question("diagnosis", { prompt: "原始失败来自哪条规则？", options: unit.diagnosisOptions }, p.diagnosis, running) : ""}
      </div><aside class="early-state-console" aria-label="任务给定信息"><div><span>任务给定信息</span><strong>尚非运行状态</strong></div><div class="early-state-grid">${lab.states.map(([label, value]) => `<div><small>${e(label)}</small><b>${e(value)}</b></div>`).join("")}</div></aside></div>
      <p class="early-note">当前可练习路线；本课核心操作正在升级，暂不认定已掌握。</p>
    </section>`;
  }
  function systemEvidence(m, attempt) {
    const lab = m.early.dataLab;
    const selected = lab.options.find((item) => item[0] === (attempt.systemChoice || lab.selectedChoice));
    const selectedB = lab.secondary?.options.find((item) => item[0] === (attempt.systemChoiceB || lab.selectedChoiceB));
    return `<section class="early-system-evidence"><p>以下仅为实际路线与条件记录，不能证明数据或对象知识已掌握。</p></section>${decisionEvidence(attempt)}${attempt.callSnapshots?.length ? callTable(attempt) : ""}`;
  }
  function renderV16(m, p, { notice = "", storage = "", running = false } = {}) {
    const unit = m.early;
    const latest = p.attempts.at(-1), attempt = latest?.challengeKey === unit.key ? latest : null;
    const phases = [["guided", unit.phaseLabels[0], p.guidedComplete], ["repair", unit.phaseLabels[1], Boolean(p.repairEvidence)], ["challenge", unit.phaseLabels[2], p.mastered]];
    const done = phases.filter((item) => item[2]).length;
    const next = p.phase === "guided" ? "repair" : "challenge";
    const diagnosisVisible = [6, 8, 11, 12, 13, 14, 15].includes(m.lessonNo) && unit.repairing && p.debugObservation?.challengeKey === unit.key
      || m.lessonNo === 9 && unit.repairing && p.debugObservation?.challengeKey === unit.key
      || m.lessonNo === 10 && Boolean(attempt && !attempt.success || p.debugObservation?.challengeKey === unit.key);
    const taskBody = m.lessonNo >= 16 ? advancedSystemLab(m, p, running, attempt)
      : m.lessonNo === 7 ? v16Designer(m, p, running)
      : [13, 14, 15].includes(m.lessonNo) ? controlLab(m, p, running, diagnosisVisible)
      : [11, 12].includes(m.lessonNo) ? `${map(m)}${question("loopCount", { prompt: "选择循环次数", options: unit.loopCountOptions.map(String) }, String(p.loopCount || ""), running)}${question("loopBoundary", { prompt: "collect() 应放在哪里？", options: ["inside", "outside"] }, p.loopBoundary, running).replace(">inside<", ">循环内：每轮执行<").replace(">outside<", ">循环外：只执行一次<")}<section class="early-function-contract"><div><span>循环体</span><strong>for _ in range(${p.loopCount || "?"}):</strong><small>${p.functionDraft.length ? p.functionDraft.map((id) => names[id]).join(" → ") : "等待你放入完整重复单元"}</small></div><i aria-hidden="true">×</i><div><span>实际展开</span><strong>${p.loopCount || 0} 轮</strong><small>每轮都会执行循环体中的全部动作</small></div></section>${diagnosisVisible ? question("diagnosis", { prompt: "循环问题在哪里？", options: unit.diagnosisOptions }, p.diagnosis, running) : ""}`
      : m.lessonNo >= 9 && m.lessonNo <= 10 ? `${map(m)}<label class="early-function-name" for="earlyFunctionName"><span>给工具命名</span><input id="earlyFunctionName" value="${e(p.functionName)}" maxlength="24" pattern="[A-Za-z_][A-Za-z0-9_]*" ${running ? "disabled" : ""}><small>使用英文、数字或下划线，不能以数字开头</small></label><section class="early-function-contract"><div><span>函数定义区</span><strong>def ${e(p.functionName)}():</strong><small>${p.functionDraft.length ? p.functionDraft.map((id) => names[id]).join(" → ") : "等待你放入动作"}</small></div><i aria-hidden="true">⇄</i><div><span>主程序</span><strong>${p.draft.filter((id) => id === "callRoute").length} 次调用</strong><small>调用时才会执行函数里的动作</small></div></section>${diagnosisVisible ? question("diagnosis", { prompt: m.lessonNo === 9 ? "哪一个支路漏了调用？" : "问题应该修在哪里？", options: unit.diagnosisOptions }, p.diagnosis, running) : ""}`
      : `${map(m, unit.repairing ? unit.successPath : [], attempt?.path || [])}${unit.repairing && p.debugObservation?.challengeKey === unit.key ? question("diagnosis", { prompt: "第一次偏离是哪一步？", options: unit.faulty.map((_, index) => String(index + 1)) }, p.diagnosis, running) : !unit.repairing ? question("prediction", unit.prediction, p.prediction, running) : ""}`;
    return `<div class="early-heading"><div><span>第 ${m.lessonNo} 课 · ${m.lessonNo >= 13 ? "v1.7" : "v1.6"}</span><h2>${e(m.title)}</h2></div><strong class="early-badge">${p.mastered ? "能力门通过" : `${done} / 3`}</strong></div>
      <p class="early-goal"><b>任务：</b>${e(unit.goal)}</p><p class="early-rule"><b>本课规则：</b>${e(unit.rule)}</p>
      <nav class="early-phases" aria-label="本课任务包">${phases.map(([id, label, complete], index) => `<button type="button" data-early-action="${id}" aria-pressed="${p.phase === id}" ${running ? "disabled" : ""}><span>${index + 1}</span>${e(label)}${complete ? " ✓" : ""}</button>`).join("")}</nav>
      <div class="early-unit"><h3>${e(unit.title)}</h3>${p.phase !== "guided" ? `<button type="button" data-early-action="next" ${running ? "disabled" : ""}>换一个等价版本</button>` : ""}</div>
      ${taskBody}${notice ? `<p class="early-feedback" role="status">${e(notice)}</p>` : ""}
      <div class="early-options"><button class="early-primary" type="button" data-early-action="build">${m.lessonNo >= 16 ? m.lessonNo === 19 ? "打开函数槽与运行区" : "打开任务板与运行区" : [11, 12].includes(m.lessonNo) ? "打开循环体与主程序" : [13, 14, 15].includes(m.lessonNo) ? "打开指令卡与运行区" : m.lessonNo >= 9 ? "打开定义区与主程序" : "开始操作"}</button>${attempt ? '<button type="button" data-early-action="show-review">看学习证据</button>' : ""}</div>
      <details class="early-help-details"><summary>看个例子或请求提示</summary><p>${e(unit.intro)}</p><div class="early-help"><button type="button" data-early-action="hint" ${running || p.hintLevel >= 3 ? "disabled" : ""}>${p.hintLevel === 2 ? "看局部示例" : p.hintLevel >= 3 ? "已看完提示" : `提示 ${p.hintLevel + 1}`}</button><span>${p.assisted ? "这次记为使用强提示；迁移任务仍需独立完成。" : "提示只帮助观察，不会替你完成。"}</span></div>${p.hintLevel ? `<p class="early-hint">${e(unit.hints[p.hintLevel - 1])}</p>` : ""}</details>
      <p class="early-storage" role="status">${e(storage || "已自动保存")}</p>
      ${attempt ? `<details class="early-result early-evidence-disclosure" aria-label="学习证据"><summary><span>学习证据</span><strong>${attempt.success ? "本次有效" : "可检查"}</strong></summary><div class="early-evidence-body"><h3>${attempt.success ? "本次证据有效" : "本次运行留下了可检查的证据"}</h3><p>${attempt.trace.length} 个执行动作 · 采集 ${attempt.trace.filter((item) => item.command === "collect" && !item.failed).length} 次${attempt.failure ? ` · ${e(attempt.failure)}` : ""}</p>${m.lessonNo >= 16 ? systemEvidence(m, attempt) : m.lessonNo >= 9 && m.lessonNo <= 12 ? callTable(attempt, [11, 12].includes(m.lessonNo)) : [13, 14, 15].includes(m.lessonNo) ? decisionEvidence(attempt) : ""}<details><summary>查看执行轨迹</summary><ol class="early-trace">${attempt.trace.map((step, index) => `<li>${index + 1}. ${e(names[step.command] || step.command)}：(${step.x}, ${step.y})，朝${e(root.CodeQuestEarlyLessons.labels[step.dir])}${step.failed ? " · 失败" : ""}</li>`).join("")}</ol></details></div></details>` : ""}
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
      <details class="early-help-details"><summary>需要帮助？</summary><p>${e(unit.intro)}</p><div class="early-help"><button type="button" data-early-action="hint" ${running || p.hintLevel >= 3 ? "disabled" : ""}>${p.hintLevel === 2 ? "看局部示例" : p.hintLevel >= 3 ? "已看完提示" : `提示 ${p.hintLevel + 1}`}</button><span>${p.assisted ? "请换一张图独立挑战。" : "需要时再打开。"}</span></div>${p.hintLevel ? `<p class="early-hint">${e(unit.hints[p.hintLevel - 1])}</p>` : ""}</details>
      <p class="early-storage" role="status">${e(storage || "已自动保存")}</p>
      ${attempt ? `<details class="early-result early-evidence-disclosure" aria-label="运行结果"><summary><span>运行证据</span><strong>${attempt.success ? "运行成功" : "运行停止"}</strong></summary><div class="early-evidence-body"><h3>${attempt.success ? "运行成功" : "运行停止"}</h3><p>${attempt.trace.length} 步 · ${attempt.trace.filter((step) => step.command === "left" || step.command === "right").length} 次转向${attempt.tailCount ? ` · 采集后还有 ${attempt.tailCount} 步` : ""}</p>
        ${!unit.repairing ? `<p>预测：${e(attempt.prediction)} · ${attempt.predictionCorrect ? "正确" : "需要重试"}</p>` : ""}
        ${!attempt.targetOrderCorrect && m.lessonNo === 5 ? '<p class="early-feedback">请按 A → B 的顺序采集。</p>' : ""}
        ${m.lessonNo === 3 ? `${map(m, attempt.plannedPath, attempt.path)}<p>${attempt.routeMatches ? "路线和计划一致。" : attempt.reconciled ? `已改用实际路线：${e(attempt.reconciliationReason)}。` : `第 ${attempt.divergence} 次移动开始偏离计划。`}</p>` : ""}
        <details ${unit.repairing ? "open" : ""}><summary>查看每一步</summary><ol class="early-trace">${attempt.trace.map((step, index) => `<li>${index + 1}. ${names[step.command]}：(${step.x}, ${step.y})，朝${e(E.labels[step.dir])}，采集 ${step.collected}${step.failed ? " · 失败" : ""}</li>`).join("")}</ol></details></div></details>` : ""}
      ${attempt?.success ? `<section class="early-review"><h3>你是怎么改的？</h3><label for="earlyReflection">${e(unit.reflectionPrompt)}</label><textarea id="earlyReflection" maxlength="600" rows="2" ${running ? "disabled" : ""} placeholder="写一句话">${e(p.reflection)}</textarea>${m.lessonNo === 3 && !unit.repairing && !attempt.routeMatches && !attempt.reconciled ? question("reconciliation", { prompt: "为什么改用实际路线？", options: E.reasons }, p.reconciliation, running) : ""}<button class="early-primary" type="button" data-early-action="review" ${running ? "disabled" : ""}>保存说明</button>${notice ? `<p class="early-feedback" role="status">${e(notice)}</p>` : ""}${!unit.independent ? `<button type="button" data-early-action="${next}" ${running ? "disabled" : ""}>下一步：${next === "repair" ? "找错并改" : "换图挑战"}</button>` : ""}</section>` : ""}
      <details class="early-mastery" ${p.mastered ? "open" : ""}><summary>本课进度 ${done} / 3${p.mastered ? " ✓" : ""}</summary><ul><li>${p.guidedComplete ? "✓" : "○"} 自己编</li><li>${p.repairEvidence ? "✓" : "○"} 找错并改</li><li>${p.mastered ? "✓" : "○"} 换图挑战</li></ul></details>`;
  }
  root.CodeQuestEarlyLessonUI = { render };
})(typeof globalThis !== "undefined" ? globalThis : window);
