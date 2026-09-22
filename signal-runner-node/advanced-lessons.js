(function (root) {
  "use strict";
  const lessonNos = [16, 18, 20];
  const revisions = { 16: "1.8-16.2", 18: "1.8-18.2", 20: "1.8-20.2" };
  const limits = { 16: 10, 18: 40, 20: 6 };
  const labels = {
    call: "调用支路工具", guard: "安全检查", while: "while 前进", collect: "采集", move: "前进", upload: "上传",
    supply: "领取补给", shield: "开启护盾", left: "左转", right: "右转", inspect: "调用检测工具", branch: "按返回值选路"
  };
  const copy = value => root.CodeQuestEvidence.clone(value);
  const E = () => root.CodeQuestEvidence;
  const terrain = extra => ({ version: "1.8", heights: {}, stairs: [], portals: [], switches: [], gates: [], oneWays: [], rotators: [], conveyors: [], supplies: [], ...extra });
  const fill = (rows, x1, y1, x2, y2, tile="g") => { for(let y=y1;y<=y2;y+=1)for(let x=x1;x<=x2;x+=1)rows[y][x]=tile; };
  const paintLine = (rows, points, tile="s") => points.forEach(({x,y})=>{ rows[y][x]=tile; });

  function workshopWorld(challenge) {
    const rows = Array.from({ length: 11 }, () => Array(13).fill("_"));
    const branchX = challenge ? 10 : 2, start = { x: branchX, y: 8 }, startDir = challenge ? "W" : "E";
    fill(rows,1,7,11,10);
    fill(rows,challenge?7:1,2,challenge?11:5,6);
    fill(rows,5,3,7,5);
    paintLine(rows,[...Array.from({length:9},(_,i)=>({x:i+2,y:8})),...Array.from({length:6},(_,i)=>({x:branchX,y:i+3}))]);
    const sideGem = { x: branchX, y: 3 }, mainGem = { x: challenge ? 3 : 9, y: 8 }, relay = { x: challenge ? 2 : 10, y: 8 };
    rows[start.y][start.x] = "S"; rows[sideGem.y][sideGem.x] = "B"; rows[mainGem.y][mainGem.x] = "B"; rows[relay.y][relay.x] = "R";
    rows[8][challenge ? 9 : 3] = "H";
    const heights = {};
    for(let y=2;y<=6;y+=1)for(let x=challenge?7:1;x<= (challenge?11:5);x+=1)heights[`${x},${y}`]=1;
    for(let y=3;y<=5;y+=1)for(let x=5;x<=7;x+=1)heights[`${x},${y}`]=2;
    return { grid: rows.map(row => row.join("")), start, startDir, targets: [sideGem, mainGem], relay,
      turn: challenge ? "right" : "left", energy: 24,
      terrain: terrain({ heights, stairs: [{ from: { x: branchX, y: 7 }, to: { x: branchX, y: 6 } }] }),
      labels: [{ at: sideGem, text: "函数支路" }, { at: { x: challenge ? 9 : 3, y: 8 }, text: "安全检查" },
        { at: mainGem, text: "while 目标" }, { at: relay, text: "交付区" }] };
  }

  function energyWorld(challenge) {
    const rows = Array.from({ length: 11 }, () => Array(13).fill("_"));
    const start = { x: challenge ? 11 : 1, y: 8 }, startDir = challenge ? "W" : "E";
    fill(rows,challenge?7:1,7,challenge?11:6,10);
    fill(rows,challenge?1:3,3,challenge?9:11,6);
    fill(rows,challenge?1:8,7,challenge?4:11,9);
    const supply = { x: challenge ? 8 : 4, y: 8 }, spike = { x: challenge ? 5 : 7, y: 5 }, target = { x: challenge ? 3 : 9, y: 5 };
    paintLine(rows,[...Array.from({length:challenge?4:4},(_,i)=>({x:challenge?11-i:1+i,y:8})),...Array.from({length:4},(_,i)=>({x:supply.x,y:8-i})),...Array.from({length:7},(_,i)=>({x:challenge?9-i:3+i,y:5}))]);
    rows[start.y][start.x] = "S"; rows[spike.y][spike.x] = "H"; rows[target.y][target.x] = "B";
    const heights = {};
    for(let y=3;y<=6;y+=1)for(let x=challenge?1:3;x<= (challenge?9:11);x+=1)heights[`${x},${y}`]=1;
    const amount=challenge?8:7,turn=challenge?"right":"left";
    return { grid: rows.map(row => row.join("")), start, startDir, targets: [target], supply, spike, energy: challenge ? 4 : 5,
      supplyAmount: amount, turn,
      terrain: terrain({ heights, stairs: [{ from: { x: supply.x, y: 7 }, to: { x: supply.x, y: 6 } }],
        supplies: [{ id: "ENERGY-1", at: supply, amount }] }),
      labels: [{ at: supply, text: `补给 +${amount}` }, { at: { x:supply.x,y:6 }, text: "峡谷台阶" }, { at: spike, text: "尖刺通道" }, { at: target, text: "能源核心" }] };
  }

  function returnWorld(challenge) {
    const rows = Array.from({ length: 11 }, () => Array(13).fill("_"));
    fill(rows,1,4,5,6);
    fill(rows,3,1,11,3);
    fill(rows,3,7,11,9);
    fill(rows,9,3,11,7);
    paintLine(rows,[...Array.from({length:3},(_,i)=>({x:i+1,y:5})),...Array.from({length:7},(_,i)=>({x:3,y:i+2})),...Array.from({length:7},(_,i)=>({x:i+3,y:2})),...Array.from({length:7},(_,i)=>({x:i+3,y:8}))]);
    const start = { x: 1, y: 5 }, detector = { x: 2, y: 5 }, upper = { x: 9, y: 2 }, lower = { x: 9, y: 8 };
    rows[start.y][start.x] = "S";
    const heights={};
    for(let y=1;y<=3;y+=1)for(let x=3;x<=11;x+=1)heights[`${x},${y}`]=1;
    for(let y=7;y<=9;y+=1)for(let x=3;x<=11;x+=1)heights[`${x},${y}`]=1;
    return { grid: rows.map(row => row.join("")), start, startDir: "E", targets: [], detector,
      routeClear: !challenge, expected: challenge ? lower : upper, upper, lower, terrain: terrain({stairs:[{from:{x:3,y:4},to:{x:3,y:3}},{from:{x:3,y:6},to:{x:3,y:7}}],heights}),
      labels: [{ at: detector, text: "检测站" }, { at: upper, text: "A 出口" }, { at: lower, text: "B 出口" }] };
  }

  function initialFields(no) {
    if (no === 16) return { functionReturn: "", connector: "", condition: "", loopBody: "" };
    if (no === 18) return { moveLedger: "", shieldLedger: "", supplyLedger: "" };
    return { returnMode: "", consumer: "" };
  }
  function initialDraft(no) { return { fields: initialFields(no), commands: [], selected: null, nextId: 1, undo: null }; }
  function draft(p, no) {
    p.advancedDrafts ||= {};
    const key = `${no}-${p.phase}-${p.variant}`;
    if (!p.advancedDrafts[key]) p.advancedDrafts[key] = initialDraft(no);
    const d = p.advancedDrafts[key];
    d.fields = { ...initialFields(no), ...(d.fields || {}) };
    d.commands = Array.isArray(d.commands) ? d.commands.filter(item => labels[item.action]).slice(0, limits[no]) : [];
    d.nextId = Math.max(Number(d.nextId) || 1, 1, ...d.commands.map(item => Number(item.id) + 1));
    if (!d.commands.some(item => item.id === d.selected)) d.selected = null;
    return d;
  }
  function archive(p, no) {
    const revision = revisions[no];
    if (p.contentRevision === revision) return;
    if (p.contentRevision) p.contentArchives = { ...p.contentArchives, [p.contentRevision]: { attempts: copy(p.attempts), guidedEvidence: p.guidedEvidence, transferEvidence: p.transferEvidence, advancedDrafts: p.advancedDrafts } };
    Object.assign(p, { contentRevision: revision, phase: "guided", variant: 0, advancedDrafts: {}, mastered: false, guidedComplete: false,
      guidedEvidence: null, repairEvidence: null, transferEvidence: {}, explanationEvidence: null, attempts: [] });
  }

  function mission(base, p, no) {
    archive(p, no); p.attempts = p.attempts.filter(item => item.contentRevision === revisions[no]);
    const challenge = p.phase === "challenge", world = no === 16 ? workshopWorld(challenge) : no === 18 ? energyWorld(challenge) : returnWorld(challenge);
    const content = no === 16 ? {
      title: "分区自动工坊", goal: "让函数、安全判断和 while 各守一个区域，最后完成交付。", rule: "函数要恢复入口朝向；安全判断先于尖刺；while 每轮推进并重查。",
      phases: ["组装四个控制模块", "风险与距离迁移"], capability: "control-capstone", allowed: ["call","guard","while","collect","move","upload"]
    } : no === 18 ? {
      title: "能量峡谷账本", goal: "把移动、护盾和补给连接到同一个 energy，再穿过峡谷采集核心。", rule: "移动 −1、护盾 −1、补给只生效一次；台阶不另收费。",
      phases: ["连接共享能量账本", "预算变化迁移"], capability: "shared-energy", allowed: ["move","left","right","supply","shield","collect"]
    } : {
      title: "双出口检测站", goal: "让检测工具 return 真实结果，由主程序使用返回值选择 A 或 B 出口。", rule: "函数只检测并返回；调用者保存结果、判断并选路。",
      phases: ["连接 return 与调用结果", "真假结果迁移"], capability: "return-value", allowed: ["inspect","branch"]
    };
    const m = { ...base, contentRevision: revisions[no], lessonMode: `v18-advanced-${no}`, grid: world.grid,
      startOverride: world.start, startDir: world.startDir, targetPositions: world.targets, required: world.targets.length,
      energy: world.energy || 40, terrain: world.terrain, worldLabels: world.labels, functionEnabled: no === 16,
      allowed: [], limit: limits[no], solution: [], solutionFn: [], routeChoices: [], advanced: world, advancedAllowed: content.allowed,
      lessonInputs: no === 20 ? { routeClear: world.routeClear } : no === 18 ? { supplyAmount: world.supplyAmount } : null,
      semanticConstraints: { capability: content.capability, fields: draft(p,no).fields, expected: world.expected, routeClear: world.routeClear },
      early: { v18: true, independent: challenge, repairing: false, key: `${revisions[no]}-${p.phase}-${p.variant}`, requiresUpload: no === 16,
        title: content.title, goal: content.goal, rule: content.rule, phaseLabels: content.phases, targets: world.targets,
        hints: no === 16 ? ["先让支路函数回到原位和原朝向。", "安全检查必须发生在进入尖刺前。", "while 的循环体要让位置真的推进。"]
          : no === 18 ? ["三个连接槽都应指向 energy。", "补给站离开后再次回来也不会重复增加。", "对照每个动作前后的真实余额。"]
          : ["检测工具内部只负责得到结果。", "return 把值交回调用位置。", "主程序的 if 必须读取这次调用保存的变量。"] } };
    if (E().fingerprint(m) !== p.currentFingerprint) E().enter(p,m);
    p.mastered = E().stateGate(p,revisions[no]).mastered;
    return m;
  }

  const requireField = (d,key,message) => { if (!d.fields[key]) throw new Error(message); };
  function program(m,d,no,preview=false) {
    if (!preview && !d.commands.length) throw new Error("先点一张指令卡，加入程序。");
    if (!preview && no === 16) {
      requireField(d,"functionReturn","先设置函数出口约定。"); requireField(d,"connector","先连接安全条件。");
      requireField(d,"condition","先设置 while 停止条件。"); requireField(d,"loopBody","先选择 while 循环体。");
    }
    if (!preview && no === 18) {
      requireField(d,"moveLedger","先连接移动账本。"); requireField(d,"shieldLedger","先连接护盾账本。"); requireField(d,"supplyLedger","先连接补给账本。");
    }
    if (!preview && no === 20) { requireField(d,"returnMode","先放置 return 值。"); requireField(d,"consumer","先把调用结果连到判断。"); }
    const lines=[], steps=[];
    const push=(text,item)=>{const start=lines.length+1;String(text).split("\n").forEach(line=>lines.push(line));steps.push({id:`command-${item.id}`,commandId:item.id,index:steps.length,kind:item.action,label:labels[item.action],code:text,line:start,endLine:lines.length});};
    if (no === 16) {
      const turn=m.advanced.turn, opposite=turn==="left"?"right":"left";
      lines.push("def visit_side():",`    turn_${turn}()`);
      for(let i=0;i<5;i+=1)lines.push("    move()");
      lines.push("    collect()",`    turn_${opposite}()`,`    turn_${opposite}()`);
      for(let i=0;i<5;i+=1)lines.push("    move()");
      if(d.fields.functionReturn==="stable")lines.push(`    turn_${turn}()`);
      else lines.push("    # 未恢复入口朝向");
      lines.push("");
      for(const item of d.commands){
        if(item.action==="call")push("visit_side()",item);
        if(item.action==="guard")push(d.fields.connector==="safe"?"if is_spike_ahead() and energy_remaining() >= 2:\n    shield()":"if is_spike_ahead() or energy_remaining() >= 2:\n    shield()",item);
        if(item.action==="while")push(`${d.fields.condition==="not-at"?"while not at_gem():":"while at_gem():"}\n    ${d.fields.loopBody==="move"?"move()":"energy_remaining()"}`,item);
        if(item.action==="collect")push("collect()",item); if(item.action==="move")push("move()",item); if(item.action==="upload")push("upload()",item);
      }
    }
    if (no === 18) for(const item of d.commands){
      if(item.action==="move")push(`track_energy("move", "${d.fields.moveLedger||"?"}")\nmove()`,item);
      if(item.action==="shield")push(`track_energy("shield", "${d.fields.shieldLedger||"?"}")\nshield()`,item);
      if(item.action==="supply")push(`track_energy("supply", "${d.fields.supplyLedger||"?"}")\nactivate_supply()`,item);
      if(item.action==="collect")push("collect()",item);
      if(item.action==="left")push("turn_left()",item);
      if(item.action==="right")push("turn_right()",item);
    }
    if (no === 20) {
      lines.push("def inspect_route():","    result = course_value(\"route_clear\")",d.fields.returnMode==="value"?"    return result":"    return True","");
      for(const item of d.commands){
        if(item.action==="inspect")push("signal = inspect_route()",item);
        if(item.action==="branch"){
          const decision=d.fields.consumer==="result"?"signal":d.fields.consumer==="fixed-false"?"False":"True";
          push(`if ${decision}:\n    move()\n    move()\n    turn_left()\n    move()\n    move()\n    move()\n    turn_right()\n    move()\n    move()\n    move()\n    move()\n    move()\n    move()\nif not ${decision}:\n    move()\n    move()\n    turn_right()\n    move()\n    move()\n    move()\n    turn_left()\n    move()\n    move()\n    move()\n    move()\n    move()\n    move()`,item);
        }
      }
    }
    return {source:lines.join("\n"),steps};
  }
  const source=(m,d,no)=>program(m,d,no).source;

  async function compile(m,d,no,Sk=root.Sk){
    const src=source(m,d,no), allowed=no===16?["move","turn_left","turn_right","shield","collect","upload","is_spike_ahead","energy_remaining","at_gem"]
      :no===18?["move","turn_left","turn_right","shield","collect","activate_supply","track_energy"]:["move","turn_left","turn_right","course_value"];
    const runtime=root.CodeQuestPythonRuntime.create({Sk,initialEnergy:m.energy,apiCallLimit:320,allowedFunctions:new Set(allowed),languageFeatures:no===20||no===16?["functions"]:[],courseInputs:no===20?{route_clear:m.advanced.routeClear}:{},
      world:{grid:m.grid,start:m.startOverride,startDir:m.startDir,required:m.required,targetPositions:m.targetPositions,terrain:m.terrain}});
    let execution;try{execution={...await runtime.compile(src),source:src,error:null};}catch(error){execution={source:src,events:error.partialEvents||[],finalState:error.partialState||{},error:root.CodeQuestPythonRuntime.friendlyErrorMessage(error)};}
    const desc=program(m,d,no,true);execution.events=execution.events.map(event=>{const step=desc.steps.find(s=>event.line>=s.line&&event.line<=s.endLine);return{...event,programStep:step?.id||null,stepLabel:step?.label||"工具定义"};});return execution;
  }

  function assess(m,d,x,assisted,no){
    const events=x.events||[], at=(point)=>x.finalState.x===point.x&&x.finalState.y===point.y;
    let worldSuccess=false,conceptSuccess=false,evidence={};
    if(no===16){worldSuccess=!x.error&&x.finalState.uploaded&&x.finalState.collectedKeys?.length===2;const types=new Set(events.map(e=>e.type));conceptSuccess=worldSuccess&&d.fields.functionReturn==="stable"&&d.fields.connector==="safe"&&d.fields.condition==="not-at"&&d.fields.loopBody==="move"&&["function-call","condition","shield","collect","upload"].every(type=>types.has(type));evidence={types:[...types],energy:x.finalState.energy,collected:x.finalState.collectedKeys?.length||0,uploaded:Boolean(x.finalState.uploaded)};}
    if(no===18){worldSuccess=!x.error&&x.finalState.collectedKeys?.length===1;const ledgerEvents=events.filter(e=>e.type==="energy-ledger").map(e=>e.energyLedger),supplies=events.filter(e=>e.type==="supply").map(e=>e.supply);const mapped=["move","shield","supply"].every(action=>ledgerEvents.some(e=>e.action===action&&e.ledger==="energy"));conceptSuccess=worldSuccess&&mapped&&supplies.some(s=>s.amount===m.advanced.supplyAmount&&!s.repeated);evidence={ledgerEvents,supplies,finalEnergy:x.finalState.energy};}
    if(no===20){worldSuccess=!x.error&&at(m.advanced.expected);const returns=events.filter(e=>e.type==="function-return").map(e=>e.functionReturn),variables=events.filter(e=>e.variable?.name==="signal").map(e=>e.variable);conceptSuccess=worldSuccess&&d.fields.returnMode==="value"&&d.fields.consumer==="result"&&returns.some(e=>e.value===m.advanced.routeClear)&&variables.some(e=>e.value===m.advanced.routeClear);evidence={returns,variables,routeClear:m.advanced.routeClear,endpoint:{x:x.finalState.x,y:x.finalState.y}};}
    const failure=x.error||(!worldSuccess?(no===20?"返回值没有带 Nova 到正确出口。":no===18?"能量路线还没有完成采集。":"自动工坊还没有完成交付。"):!conceptSuccess?(no===20?"世界结果对了，但判断没有真正消费返回值。":no===18?"世界结果对了，但三类动作没有连到同一 energy 账本。":"世界结果对了，但函数、布尔规则或 while 模块证据不完整。"):"");
    const model={fields:copy(d.fields),commands:copy(d.commands)};return{id:`${Date.now()}-${Math.random().toString(36).slice(2,9)}`,at:new Date().toISOString(),lessonNo:no,contentRevision:revisions[no],fingerprint:E().fingerprint(m),challengeKey:m.early.key,phase:m.early.independent?"challenge":"guided",independent:m.early.independent,assisted,worldSuccess,success:Boolean(worldSuccess&&conceptSuccess),failure,evidence,source:x.source,events:copy(events),program:[],routeProgram:[],path:[],trace:[],programModel:model,programVersion:E().canonical(model),ruleVersion:E().canonical(d.fields),practiceOnly:false};
  }
  function record(p,a,no){p.attempts=[...p.attempts,copy(a)].slice(-12);if(a.worldSuccess)p.completed=true;if(a.success){if(a.phase==="guided"){p.guidedComplete=true;p.guidedEvidence=copy(a);}if(a.independent)p.transferEvidence=E().mergeTransferProofs(p.transferEvidence,{[a.fingerprint]:copy(a)});}p.mastered=E().stateGate(p,revisions[no]).mastered;}
  function reference(m,p,no){const d=draft(p,no);if(no===16){d.fields={functionReturn:"stable",connector:"safe",condition:"not-at",loopBody:"move"};d.commands=["call","guard","while","collect","move","upload"].map((action,i)=>({id:i+1,action}));}if(no===18){const opposite=m.advanced.turn==="left"?"right":"left";d.fields={moveLedger:"energy",shieldLedger:"energy",supplyLedger:"energy"};d.commands=[...Array(3).fill("move"),"supply",m.advanced.turn,...Array(3).fill("move"),opposite,...Array(2).fill("move"),"shield",...Array(3).fill("move"),"collect"].map((action,i)=>({id:i+1,action}));}if(no===20){d.fields={returnMode:"value",consumer:"result"};d.commands=["inspect","branch"].map((action,i)=>({id:i+1,action}));}d.nextId=d.commands.length+1;d.selected=null;}
  function edit(m,p,no,{action,field,value}){const d=draft(p,no),remember=()=>{d.undo={fields:copy(d.fields),commands:copy(d.commands),selected:d.selected,nextId:d.nextId};};if(action==="select"){d.selected=d.selected===Number(value)?null:Number(value);return{reset:false,notice:""};}if(action==="undo"){if(d.undo){Object.assign(d,d.undo);d.undo=null;}else d.commands.pop();return{reset:true,notice:""};}if(action==="add"&&labels[value]){const index=d.commands.findIndex(c=>c.id===d.selected);if(index<0&&d.commands.length>=limits[no])return{reset:false,notice:`最多放 ${limits[no]} 张指令卡。`};remember();const command={id:index>=0?d.commands[index].id:d.nextId++,action:value};if(index>=0)d.commands.splice(index,1,command);else d.commands.push(command);d.selected=null;}if(action==="remove"){const index=d.commands.findIndex(c=>c.id===Number(value));if(index>=0){remember();d.commands.splice(index,1);d.selected=null;}}if(action==="clear"){remember();d.commands=[];d.selected=null;}if(field&&Object.hasOwn(d.fields,field)){remember();d.fields[field]=value;}return{reset:true,notice:""};}
  function adapter(no){return{revision:revisions[no],mission:(base,p)=>mission(base,p,no),draft:p=>draft(p,no),source:(m,d)=>source(m,d,no),compile:(m,d,Sk)=>compile(m,d,no,Sk),assess:(m,d,x,a)=>assess(m,d,x,a,no),record:(p,a)=>record(p,a,no),reconcile:p=>{p.mastered=E().stateGate(p,revisions[no]).mastered;},render:(m,p,c)=>root.CodeQuestAdvancedLessonUI.render(m,p,c),builder:(m,p,c)=>root.CodeQuestAdvancedLessonUI.builder(m,p,c),edit:(m,p,input)=>edit(m,p,no,input),reference:(m,p)=>reference(m,p,no),feedback(m,p,a){if(!a.success)return a.failure;if(p.mastered)return`第 ${no} 课已完成独立验证。`;return m.early.independent?"迁移完成。":`这一阶段完成。接着做“${m.early.phaseLabels[1]}”。`;}};}
  root.CodeQuestAdvancedLessons={revisions,limits,labels,workshopWorld,energyWorld,returnWorld,draft,mission,program,compile,assess,record};
  lessonNos.forEach(no=>root.CodeQuestStructuredLessons.register(no,adapter(no)));
})(typeof globalThis!=="undefined"?globalThis:window);
