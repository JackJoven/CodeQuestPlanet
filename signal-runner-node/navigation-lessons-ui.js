(function (root) {
  "use strict";
  const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const arrows = {N:"↑",E:"→",S:"↓",W:"←"};
  function map(m,state) {
    const size=25, rules=root.CodeQuestWorldRules, pos=state||m.startOverride;
    const cells=m.grid.flatMap((row,y)=>[...row].map((tile,x)=>{ if(tile==="_")return""; const p={x,y},h=rules.height(m.terrain,p);
      const target=m.targetPositions.some(t=>rules.same(t,p)), portal=m.terrain.portals?.some(t=>rules.same(t.from,p)||rules.same(t.to,p));
      return `<g><rect x="${x*size+1}" y="${y*size+1}" width="23" height="23" rx="3" fill="${portal?'#286e88':target?'#8b6632':['#284f49','#667044','#897342'][h]}"/><text x="${x*size+12.5}" y="${y*size+16}" text-anchor="middle" fill="#fff" font-size="8">${portal?'传':target?'宝':h?`${h}层`:''}</text></g>`;})).join('');
    return `<svg class="early-map navigation-map" viewBox="0 0 ${m.grid[0].length*size} ${m.grid.length*size}" role="img" aria-label="本课俯视图">${cells}<circle cx="${pos.x*size+12.5}" cy="${pos.y*size+12.5}" r="10" fill="#111d45" stroke="#8be5ff" stroke-width="2"/><text x="${pos.x*size+12.5}" y="${pos.y*size+16}" text-anchor="middle" fill="#fff" font-size="12">${arrows[state?.dir||m.startDir]}</text></svg>`;
  }
  function builder(m,p,{running=false,playback=null,notice=""}={}) {
    const N=root.CodeQuestNavigationLessons,d=N.draft(p,m.lessonNo),desc=N.program(m,d,m.lessonNo,true),event=playback?.event;
    const available=m.lessonNo===5?["move","left","right","teleport","collect"]:["move","left","right","collect"];
    const code={move:"move()",left:"turn_left()",right:"turn_right()",teleport:"teleport()",collect:"collect()"};
    const palette=available.map(a=>`<button class="command-button${['teleport','collect'].includes(a)?' is-logic':''}" data-lesson-action="add" data-value="${a}" type="button" ${running||d.commands.length>=N.limits[m.lessonNo]&&d.selected===null?'disabled':''}><strong>${N.actions[a]}</strong><small>${code[a]}</small></button>`).join('');
    const list=desc.steps.map(s=>`<li data-program-step="${s.id}" class="program-chip${s.commandId===d.selected?' is-replacing':''}${event?.programStep===s.id?' is-current':''}"><div class="program-command-summary"><span>${s.index+1}</span><strong>${esc(s.code)}</strong></div><button class="program-replace" data-lesson-action="select" data-value="${s.commandId}" ${running?'disabled':''}>替换</button><button class="program-remove" data-lesson-action="remove" data-value="${s.commandId}" ${running?'disabled':''}>×</button></li>`).join('');
    return {palette,list,definition:"",hideFunctionTab:true,count:d.commands.length,replacing:d.selected!==null,undo:Boolean(d.undo||d.commands.length),
      feedback:`${event?`<p class="parameter-live-flow" role="status">${esc(event.message)}</p>`:''}${notice?`<p class="early-feedback" role="status">${esc(notice)}</p>`:''}`};
  }
  function tools(m,p,running) {
    const d=root.CodeQuestNavigationLessons.draft(p,m.lessonNo);
    if(m.lessonNo===3) return `<section class="navigation-choice"><strong>本阶段目标：${m.semanticConstraints.objective==='moves'?'前进次数最少':m.semanticConstraints.objective==='tie'?'等成本时计划与实跑一致':'全部指令最少'}</strong><div class="navigation-route-grid">${Object.values(m.navigation.routes).map(r=>`<button data-lesson-action="plan" data-value="${r.id}" aria-pressed="${d.plan===r.id}" ${running?'disabled':''}><b>${r.label}</b><span>${r.moves} 前进 · ${r.turns} 转向 · 共 ${r.total}</span></button>`).join('')}</div></section>`;
    if(m.lessonNo===4) return `<section class="navigation-choice"><strong>${m.navigationProfileObserved?'已看到失败轨迹。第一次偏离在哪一步？':'先运行原始坏程序，再回来定位。'}</strong><div class="debug-step-grid">${m.navigation.correct.map((_,i)=>`<button data-lesson-action="diagnosis" data-value="${i+1}" aria-pressed="${d.diagnosis===i+1}" ${running||!m.navigationProfileObserved?'disabled':''}>${i+1}</button>`).join('')}</div>${d.diagnosis?`<p>已选择第 ${d.diagnosis} 步；现在在程序中替换这一条。</p>`:''}</section>`;
    const points=[m.navigation.correctExit,m.navigation.wrongExit];
    return `<section class="navigation-choice"><strong>入口应连接到哪个 (x,y)？</strong><div class="coordinate-choice">${points.map(point=>{const value=`${point.x},${point.y}`;return `<button data-lesson-action="portal" data-value="${value}" aria-pressed="${d.portalChoice===value}" ${running?'disabled':''}>(${point.x}, ${point.y})</button>`}).join('')}</div><p>选格会改变真实传送配对；站上入口后仍需执行“传送”。</p></section>`;
  }
  function render(m,p,{storage="",running=false,playback=null,state=null}={}) {
    const N=root.CodeQuestNavigationLessons,d=N.draft(p,m.lessonNo),gate=root.CodeQuestEvidence.stateGate(p,N.revisions[m.lessonNo]);
    const desc=N.program(m,d,m.lessonNo,true),latest=p.attempts.at(-1),attempt=latest?.challengeKey===m.early.key?latest:null;
    const titles={3:"上山路线规划",4:"山崖调试站",5:"坐标传送岛"};
    return `<div class="early-heading"><h2>${titles[m.lessonNo]}</h2><span class="early-badge">${gate.mastered?'已掌握':`第 ${m.lessonNo} 课`}</span></div>
      <nav class="early-phases">${[["guided",m.early.phaseLabels[0],gate.guided],["challenge",m.early.phaseLabels[1],gate.transfer]].map(([phase,label,done],i)=>`<button data-early-action="${phase}" aria-pressed="${p.phase===phase}" ${running||phase==='challenge'&&!gate.guided?'disabled':''}><span>${i+1}</span>${label}${done?' ✓':''}</button>`).join('')}</nav>
      <p class="early-goal">${esc(m.early.goal)}</p><p class="foundation-rule">${esc(m.early.rule)}</p>${tools(m,p,running)}
      <div class="parameter-support">${p.phase==='guided'&&gate.guided?`<button class="early-primary" data-early-action="challenge" ${running?'disabled':''}>下一步：${m.early.phaseLabels[1]} →</button>`:p.phase==='challenge'?`<div class="early-options"><button data-early-action="next" ${running?'disabled':''}>${gate.mastered?'再练一张（可选）':'换一个等价版本'}</button></div>`:''}
      <details class="early-help-details"><summary>需要帮助？</summary><button data-early-action="hint" ${running||p.hintLevel>=3?'disabled':''}>提示 ${Math.min(3,p.hintLevel+1)}</button>${p.hintLevel?`<p>${esc(m.early.hints[p.hintLevel-1])}</p>`:''}${p.assisted?'<p>用过强提示，请换图独立验证。</p>':''}</details>
      <details class="parameter-code"><summary>查看 Python</summary><pre>${(desc.source||'# 还没有指令').split('\n').map((line,i)=>`<span class="${playback?.event?.line===i+1?'is-active':''}">${esc(line)}</span>`).join('')}</pre></details>
      <details class="parameter-overview"><summary>俯视图</summary>${map(m,state)}</details><small class="early-storage">${esc(storage||'自动保存')}</small></div>
      ${attempt?`<details class="early-result early-evidence-disclosure"><summary>运行记录</summary><p>${esc(attempt.failure||'已完成')}</p>${m.lessonNo===3?`<p>${attempt.actualRoute==='stair'?'石阶捷径':attempt.actualRoute==='flat'?'平路绕行':'自定义路线'} · ${attempt.costs.moves} 前进 · ${attempt.costs.turns} 转向 · 共 ${attempt.costs.total}</p>`:m.lessonNo===4?`<p>首次偏离：正确第 ${attempt.faultStep} 步 / 选择第 ${attempt.diagnosis??'—'} 步</p>`:`<p>要求 (${attempt.requestedExit.x},${attempt.requestedExit.y}) · 选择 ${attempt.selectedExit?`(${attempt.selectedExit})`:'—'} · ${attempt.headingPreserved?'朝向保持':'尚无朝向证据'}</p>`}</details>`:''}
      <details class="early-mastery"><summary>学习进度 · ${[gate.guided,gate.transfer].filter(Boolean).length}/2</summary><ul><li>${gate.guided?'✓':'○'} ${m.early.phaseLabels[0]}</li><li>${gate.transfer?'✓':'○'} ${m.early.phaseLabels[1]}</li></ul></details>`;
  }
  root.CodeQuestNavigationLessonUI={render,builder,map};
})(typeof globalThis!=="undefined"?globalThis:window);
