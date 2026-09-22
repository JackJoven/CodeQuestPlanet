(function (root) {
  "use strict";

  const lessonNos = [21, 22, 23, 24, 25];
  const revisions = { 21: "1.8-21.3", 22: "1.8-22.3", 23: "1.8-23.3", 24: "1.8-24.3", 25: "1.8-25.2" };
  const limits = { 21: 6, 22: 7, 23: 5, 24: 6, 25: 5 };
  const labels = {
    iterate: "遍历任务清单", home: "返回调度中心", finish: "提交数据任务",
    append: "追加新任务", index: "按有效索引访问", lookup: "按入口名称查表", teleport: "使用查询结果传送",
    dispatch: "遍历并派发", editGrid: "修改二维表格", buildGrid: "从二维表生成世界"
  };
  const codes = {
    iterate: "for current in tasks", home: "return_hub()", finish: "finish_mission()",
    append: "tasks.append(...) ", index: "for index in range(len(tasks))", lookup: "destination = routes.get(key)",
    teleport: "teleport_to(destination, key)", dispatch: "dispatch_one(current, destination)",
    editGrid: "map_data[row][column] = tile", buildGrid: "build_world(map_data)"
  };
  const E = () => root.CodeQuestEvidence;
  const copy = value => E().clone(value);
  const terrain = extra => ({ version: "1.8", heights: {}, stairs: [], portals: [], switches: [], gates: [], oneWays: [], rotators: [], conveyors: [], supplies: [], ...extra });
  const fill = (rows,x1,y1,x2,y2,tile="g") => { for(let y=y1;y<=y2;y+=1)for(let x=x1;x<=x2;x+=1)rows[y][x]=tile; };
  const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);

  function logisticsWorld(challenge) {
    const rows=Array.from({length:13},()=>Array(19).fill("_"));
    fill(rows,1,1,5,4); fill(rows,4,3,8,6,"s"); fill(rows,7,5,11,8,"s"); fill(rows,10,7,15,10,"s"); fill(rows,14,9,17,11);
    fill(rows,13,1,17,4); fill(rows,1,8,5,11); fill(rows,6,2,7,4,"s"); fill(rows,11,3,14,5,"s"); fill(rows,4,8,7,9,"s");
    rows[1][1]="_";rows[4][5]="_";rows[8][1]="_";rows[11][17]="_";
    const normal={A:[3,2],B:[15,2],C:[3,10],D:[15,10]}, shifted={A:[15,10],B:[3,2],C:[15,2],D:[3,10]};
    const stations=challenge?shifted:normal,start={x:9,y:6},hub=[10,7];
    rows[start.y][start.x]="S";rows[hub[1]][hub[0]]="R";
    return {kind:"s-curve-archipelago",grid:rows.map(row=>row.join("")),start,startDir:"S",stations,hub,terrain:terrain(),labels:[{at:start,text:"清单中枢"},{at:{x:7,y:4},text:"上行航道"},{at:{x:12,y:8},text:"下行航道"},...Object.entries(stations).map(([name,[x,y]])=>({at:{x,y},text:`${name} 岛`}))]};
  }

  function indexWorld(challenge) {
    const rows=Array.from({length:13},()=>Array(20).fill("_"));
    fill(rows,1,5,18,8,"s");
    for(const [x1,x2,height] of [[2,4,5],[7,9,4],[12,14,3],[17,18,2]])fill(rows,x1,1,x2,height);
    fill(rows,5,8,16,10,"s"); fill(rows,8,10,11,11,"s");
    rows[8][6]="_";rows[8][10]="_";rows[8][15]="_";
    if(challenge){fill(rows,16,8,18,10,"g");rows[1][18]="_";}
    const normal={A:[3,2],B:[8,2],C:[13,2],D:[18,2]}, shifted={A:[18,9],B:[3,2],C:[8,2],D:[13,2]};
    const stations=challenge?shifted:normal,start={x:10,y:6},hub=[6,7],heights={};
    for(let y=1;y<=4;y+=1)for(let x=7;x<=9;x+=1)if(rows[y][x]!=="_")heights[`${x},${y}`]=1;
    for(let y=1;y<=3;y+=1)for(let x=12;x<=14;x+=1)if(rows[y][x]!=="_")heights[`${x},${y}`]=2;
    rows[start.y][start.x]="S";rows[hub[1]][hub[0]]="R";
    return {kind:"four-finger-comb-port",grid:rows.map(row=>row.join("")),start,startDir:"E",stations,hub,terrain:terrain({heights}),labels:[{at:start,text:"索引主梁"},{at:{x:13,y:2},text:"高层吊臂"},{at:{x:9,y:10},text:"维修坞"},...Object.entries(stations).map(([name,[x,y]])=>({at:{x,y},text:`${name} 泊位`}))]};
  }

  function portalWorld(challenge) {
    const rows=Array.from({length:15},()=>Array(17).fill("_"));
    const spans=[[6,10],[4,12],[3,13],[2,14],[2,14],[1,15],[1,15],[1,15],[1,15],[2,14],[2,14],[3,13],[4,12],[6,10]];
    spans.forEach(([a,b],i)=>fill(rows,a,i+1,b,i+1,"s"));
    fill(rows,5,5,11,10,"_"); fill(rows,6,4,10,4,"g"); fill(rows,12,6,14,9,"g"); fill(rows,6,11,10,12,"g"); fill(rows,2,6,4,9,"g");
    const exits={北塔:[8,2],东港:[13,7],南台:[8,12],西站:[3,7]};
    const expectedKey=challenge?"天文台":"回收港",expectedExit=challenge?"西站":"东港",start={x:8,y:4};rows[start.y][start.x]="S";
    return {kind:"octagonal-lagoon-ring",grid:rows.map(row=>row.join("")),start,startDir:"E",exits,fixedExit:"北塔",expectedKey,expectedExit,expected:exits[expectedExit],terrain:terrain(),labels:[{at:start,text:"北侧查表台"},{at:{x:8,y:7},text:"中央水院"},...Object.entries(exits).map(([name,[x,y]])=>({at:{x,y},text:name}))]};
  }

  function dispatchWorld(challenge) {
    const rows=Array.from({length:13},()=>Array(20).fill("_"));
    fill(rows,1,1,6,11); fill(rows,13,1,18,11); fill(rows,5,5,14,8,"s");
    fill(rows,2,3,5,5,"g"); fill(rows,14,2,17,4,"g"); fill(rows,14,8,17,10,"g");
    fill(rows,7,2,11,4,"s"); fill(rows,8,9,12,11,"s");
    fill(rows,7,5,12,8,"_"); fill(rows,9,6,10,7,"g");
    if(challenge){fill(rows,16,5,18,7,"g");rows[1][1]="_";}
    const sites={医疗:[3,9],能源:[16,3],通讯:[16,9]},routes=challenge?{医疗:sites.通讯,能源:sites.医疗,通讯:sites.能源}:sites;
    const start={x:5,y:6},hub=[5,7],heights={};
    for(let y=1;y<=4;y+=1)for(let x=13;x<=18;x+=1)if(rows[y][x]!=="_")heights[`${x},${y}`]=1;
    rows[start.y][start.x]="S";rows[hub[1]][hub[0]]="R";
    return {kind:"h-frame-warehouse",grid:rows.map(row=>row.join("")),start,startDir:"S",hub,terrain:terrain({heights}),labels:[{at:start,text:"西侧控制室"},{at:{x:9,y:6},text:"中央装卸井"},{at:{x:3,y:9},text:"医疗库"},{at:{x:16,y:3},text:"能源塔"},{at:{x:16,y:9},text:"通讯坪"}],tasks:challenge?["通讯","医疗"]:["医疗","能源","通讯"],routes,stock:challenge?1:2};
  }

  function blueprintWorld(challenge) {
    const width=challenge?16:15,height=11,rows=Array.from({length:height},()=>Array(width).fill("_"));
    const spans=challenge?[[3,10],[2,12],[1,13],[1,14],[2,14],[3,14],[4,14],[5,14],[6,14]]:[[3,9],[2,11],[1,12],[1,13],[2,13],[3,13],[4,13],[5,13],[6,13]];
    spans.forEach(([a,b],index)=>fill(rows,a,index+1,b,index+1,"g"));
    for(let y=2;y<=8;y+=1)rows[y][Math.min(width-3,Math.floor(width/2)+Math.floor(y/3))]="s";
    const start={x:challenge?2:1,y:4},target=challenge?{x:13,y:8}:{x:11,y:2};
    rows[start.y][start.x]="S";
    rows[1][challenge?9:8]="B";
    const heights={};for(let y=1;y<height-1;y+=1)for(let x=1;x<width-1;x+=1)if(rows[y][x]!=="_"&&x>Math.floor(width/2)+Math.floor(y/4))heights[`${x},${y}`]=1;
    return {kind:"stepped-blueprint-wedge",grid:rows.map(row=>row.join("")),base:rows.map(row=>row.join("")),start,startDir:"E",target,tile:"#",terrain:terrain({heights}),labels:[{at:start,text:"蓝图入口"},{at:target,text:"待修改格"},{at:{x:width-3,y:8},text:"阶梯边界"}]};
  }

  function initialFields(no) {
    if(no===21)return{loopSource:""};
    if(no===22)return{lengthMode:"",boundMode:""};
    if(no===23)return{lookupMode:""};
    if(no===24)return{traversal:"",lookup:"",inventory:"",writeback:""};
    return{row:"",column:"",tile:""};
  }
  const initialDraft=no=>({fields:initialFields(no),commands:[],tasks:[],appends:[],routes:{回收港:"",天文台:"",能源港:""},selected:null,nextId:1,undo:null});
  function draft(p,no,m) {
    p.dataDrafts ||= {};
    const key=`${no}-${p.phase}-${p.variant}`;
    if(!p.dataDrafts[key])p.dataDrafts[key]=initialDraft(no);
    const d=p.dataDrafts[key];d.fields={...initialFields(no),...(d.fields||{})};d.commands=Array.isArray(d.commands)?d.commands.filter(item=>labels[item.action]).slice(0,limits[no]):[];
    d.tasks=Array.isArray(d.tasks)?d.tasks.filter(item=>typeof item==="string").slice(0,6):[];d.appends=Array.isArray(d.appends)?d.appends.filter(item=>typeof item==="string").slice(0,3):[];
    d.routes={回收港:"",天文台:"",能源港:"",...(d.routes||{})};d.nextId=Math.max(Number(d.nextId)||1,1,...d.commands.map(item=>Number(item.id)+1));if(!d.commands.some(item=>item.id===d.selected))d.selected=null;return d;
  }
  function archive(p,no){const revision=revisions[no];if(p.contentRevision===revision)return;if(p.contentRevision)p.contentArchives={...p.contentArchives,[p.contentRevision]:{attempts:copy(p.attempts),guidedEvidence:p.guidedEvidence,transferEvidence:p.transferEvidence,dataDrafts:p.dataDrafts}};Object.assign(p,{contentRevision:revision,phase:"guided",variant:0,dataDrafts:{},mastered:false,guidedComplete:false,guidedEvidence:null,repairEvidence:null,transferEvidence:{},explanationEvidence:null,attempts:[]});}

  function mission(base,p,no){archive(p,no);p.attempts=p.attempts.filter(item=>item.contentRevision===revisions[no]);const challenge=p.phase==="challenge";let world,title,goal,rule,phases,allowed;
    if(no===21){world=logisticsWorld(challenge);world.requested=challenge?["C","A"]:["A","C","B"];title="物流群岛清单";goal="编辑任务清单，再让同一个 for 循环按当前顺序访问每座投递站。";rule="循环读取 current；清单为空时安全待命。";phases=["连接当前任务项","清单重排迁移"];allowed=["iterate","home","finish"];}
    if(no===22){world=indexWorld(challenge);world.baseTasks=challenge?["C"]:["A","B"];world.expectedAppends=challenge?["A","D"]:["D"];title="新码头索引台";goal="先追加任务，再用 len(tasks) 生成所有有效索引，不能漏掉新码头。";rule="长度为 n 时，最后有效索引是 n−1；range(len(tasks)) 不越界。";phases=["追加后读取长度","边界变化迁移"];allowed=["append","index","home","finish"];}
    if(no===23){world=portalWorld(challenge);title="可编程传送枢纽";goal="编辑入口名到出口坐标的表，用当前名称查值并传送到真实落点。";rule="字典按键查值；缺键或无效坐标时保持原位。";phases=["连接名称与坐标","映射变化迁移"];allowed=["lookup","teleport","finish"];}
    if(no===24){world=dispatchWorld(challenge);title="仓库调度网络";goal="遍历任务、查目的地、检查库存并调用派发函数，把结果写回状态表。";rule="派发量不能超过库存；缺货任务必须留下未完成状态。";phases=["组装调度链","缺货重排迁移"];allowed=["dispatch","home","finish"];}
    if(no===25){world=blueprintWorld(challenge);title="二维岛屿蓝图";goal="在非正方形表格中修改指定单元格，再由同一份二维数据重建 3D 世界。";rule="world(x, y) 对应 table[y][x]；先选行 y，再选列 x。";phases=["连接行列映射","尺寸边界迁移"];allowed=["editGrid","buildGrid","finish"];}
    const d=draft(p,no,world);const m={...base,contentRevision:revisions[no],lessonMode:`v18-data-${no}`,grid:world.grid,startOverride:world.start,startDir:world.startDir,targetPositions:[],required:0,energy:60,terrain:world.terrain,worldLabels:world.labels,allowed:[],limit:limits[no],solution:[],solutionFn:[],routeChoices:[],data:world,dataAllowed:allowed,semanticConstraints:{capability:`data-${no}`,fields:d.fields,data:world},lessonInputs:no===23?{entry:world.expectedKey}:null,early:{v18:true,independent:challenge,repairing:false,key:`${revisions[no]}-${p.phase}-${p.variant}`,requiresUpload:false,title,goal,rule,phaseLabels:phases,targets:[],hints:no===21?["先按任务牌要求排好清单。","循环对象应是 tasks，不是写死的站名。","每轮把 current 交给访问动作。"]:no===22?["追加必须发生在读取长度之前。","range(len(tasks)) 只产生有效索引。","索引等于 len(tasks) 时已经越界。"]:no===23?["先确认当前入口名称。","用同一个名称查询 routes。","查询不到出口时不要猜坐标。"]:no===24?["四个连接槽分别对应遍历、查表、库存和写回。","先保存 available，再决定派发或标记缺货。","派发函数只处理当前任务。"]:["二维表先写行，再写列。","行使用 y，列使用 x。","运行后对照 3D 世界中唯一变化的格子。"]}};
    if(E().fingerprint(m)!==p.currentFingerprint)E().enter(p,m);p.mastered=E().stateGate(p,revisions[no]).mastered;return m;
  }

  const requireField=(d,key,message)=>{if(!d.fields[key])throw new Error(message);};
  const py=value=>JSON.stringify(value).replace(/true/g,"True").replace(/false/g,"False").replace(/null/g,"None");
  function program(m,d,no,preview=false){if(!preview&&!d.commands.length)throw new Error("先点一张指令卡，加入程序。");
    if(!preview&&no===21)requireField(d,"loopSource","先选择循环读取哪一份清单。");
    if(!preview&&no===22){requireField(d,"lengthMode","先选择长度来源。");requireField(d,"boundMode","先连接有效索引范围。");}
    if(!preview&&no===23)requireField(d,"lookupMode","先选择查询方式。");
    if(!preview&&no===24)for(const [key,msg] of [["traversal","先连接任务遍历。"],["lookup","先连接目的地查询。"],["inventory","先连接库存检查。"],["writeback","先连接结果写回。"]])requireField(d,key,msg);
    if(!preview&&no===25)for(const [key,msg] of [["row","先选择表格行。"],["column","先选择表格列。"],["tile","先选择要写入的格子。"]])requireField(d,key,msg);
    const lines=[],steps=[];const push=(text,item)=>{const start=lines.length+1;String(text).split("\n").forEach(line=>lines.push(line));steps.push({id:`command-${item.id}`,commandId:item.id,index:steps.length,kind:item.action,label:labels[item.action],code:text,line:start,endLine:lines.length});};
    if(no===21){lines.push(`tasks = ${py(d.tasks)}`,"");for(const item of d.commands){if(item.action==="iterate")push(`for current in ${d.fields.loopSource==="tasks"?"tasks":py(["A","B","C"])}:\n    visit_station(current)`,item);if(item.action==="home")push("return_hub()",item);if(item.action==="finish")push("finish_mission()",item);}}
    if(no===22){lines.push(`tasks = ${py(m.data.baseTasks)}`,"");for(const item of d.commands){if(item.action==="append")push((d.appends.length?d.appends:["?"]).map(value=>`tasks.append(${py(value)})`).join("\n"),item);if(item.action==="index"){const range=d.fields.boundMode==="offby"?"range(len(tasks) + 1)":d.fields.lengthMode==="stale"?`range(${m.data.baseTasks.length})`:"range(len(tasks))";push(`for index in ${range}:\n    current = tasks[index]\n    visit_station(current)`,item);}if(item.action==="home")push("return_hub()",item);if(item.action==="finish")push("finish_mission()",item);}}
    if(no===23){const routes={};for(const key of m.data.challengeKeys||["回收港","天文台","能源港"]){const exit=d.routes[key];if(m.data.exits[exit])routes[key]=m.data.exits[exit];}lines.push(`routes = ${py(routes)}`,`key = course_value("entry")`,"");for(const item of d.commands){if(item.action==="lookup")push(d.fields.lookupMode==="dict"?"destination = routes.get(key)":`destination = ${py(m.data.exits[m.data.fixedExit])}`,item);if(item.action==="teleport")push("teleport_to(destination, key)",item);if(item.action==="finish")push("finish_mission()",item);}}
    if(no===24){lines.push("def dispatch_one(task, destination):","    deliver_task(task, destination)","",`tasks = ${py(d.tasks)}`,`routes = ${py(m.data.routes)}`,`stock = ${m.data.stock}`,"results = {}","");for(const item of d.commands){if(item.action==="dispatch"){const iterable=d.fields.traversal==="tasks"?"tasks":py(m.data.tasks);const lookup=d.fields.lookup==="routes"?"routes[current]":py(m.data.routes[Object.keys(m.data.routes)[0]]);const available=d.fields.inventory==="check"?"stock > 0":"True";const writeOk=d.fields.writeback==="results"?'\n        results[current] = "delivered"':'';const writeMiss=d.fields.writeback==="results"?'\n        results[current] = "out-of-stock"':'';push(`for current in ${iterable}:\n    destination = ${lookup}\n    available = ${available}\n    if available:\n        dispatch_one(current, destination)\n        stock = stock - 1${writeOk}\n    if not available:\n        mark_unfilled(current)${writeMiss}`,item);}if(item.action==="home")push("return_hub()",item);if(item.action==="finish")push("finish_mission()",item);}}
    if(no===25){lines.push(`map_data = ${py(m.data.base.map(row=>[...row]))}`,"");for(const item of d.commands){if(item.action==="editGrid"){const row=d.fields.row==="y"?m.data.target.y:m.data.target.x,column=d.fields.column==="x"?m.data.target.x:m.data.target.y;push(`map_data[${row}][${column}] = ${py(d.fields.tile==="rock"?m.data.tile:"g")}`,item);}if(item.action==="buildGrid")push("build_world(map_data)",item);if(item.action==="finish")push("finish_mission()",item);}}
    return{source:lines.join("\n"),steps};
  }
  async function compile(m,d,no,Sk=root.Sk){const desc=program(m,d,no,true),source=program(m,d,no).source;const functions=new Set(["visit_station","return_hub","finish_mission","course_value","teleport_to","deliver_task","mark_unfilled","build_world","range","len","append","get"]);const runtime=root.CodeQuestPythonRuntime.create({Sk,initialEnergy:m.energy,apiCallLimit:320,allowedFunctions:functions,languageFeatures:["for-loops",...([24].includes(no)?["functions"]:[])],courseInputs:no===23?{entry:m.data.expectedKey}:no===21||no===22?{stations:m.data.stations,hub:m.data.hub}:no===24?{hub:m.data.hub}:{},world:{grid:m.grid,start:m.startOverride,startDir:m.startDir,required:0,targetPositions:[],terrain:m.terrain}});let execution;try{execution={...await runtime.compile(source),source,error:null};}catch(error){execution={source,events:error.partialEvents||[],finalState:error.partialState||{},error:root.CodeQuestPythonRuntime.friendlyErrorMessage(error)};}execution.events=execution.events.map(event=>{const step=desc.steps.find(s=>event.line>=s.line&&event.line<=s.endLine);return{...event,programStep:step?.id||null,stepLabel:step?.label||"数据设置"};});return execution;}
  function assess(m,d,x,assisted,no){const events=x.events||[],state=x.finalState||{};let worldSuccess=false,conceptSuccess=false,evidence={};
    if(no===21){const visits=state.stationVisits||[],atHub=same([state.x,state.y],m.data.hub);worldSuccess=!x.error&&state.dataComplete&&atHub&&same(visits,m.data.requested);conceptSuccess=worldSuccess&&d.fields.loopSource==="tasks"&&events.some(e=>e.type==="station-visit");evidence={visits,requested:m.data.requested,atHub};}
    if(no===22){const expected=[...m.data.baseTasks,...m.data.expectedAppends],visits=state.stationVisits||[],atHub=same([state.x,state.y],m.data.hub);worldSuccess=!x.error&&state.dataComplete&&atHub&&same(visits,expected);conceptSuccess=worldSuccess&&same(d.appends,m.data.expectedAppends)&&d.fields.lengthMode==="current"&&d.fields.boundMode==="valid"&&events.some(e=>e.range?.expression==="len(tasks)");evidence={visits,expected,finalTasks:state.variables?.tasks,atHub};}
    if(no===23){const lookup=(state.routeLookups||[]).at(-1),endpoint=[state.x,state.y];worldSuccess=!x.error&&state.dataComplete&&same(endpoint,m.data.expected);conceptSuccess=worldSuccess&&d.fields.lookupMode==="dict"&&lookup?.key===m.data.expectedKey&&same(lookup.destination,m.data.expected)&&lookup.valid;evidence={lookup,endpoint,expected:m.data.expected};}
    if(no===24){const expectedDelivered=m.data.tasks.slice(0,m.data.stock),expectedUnfilled=m.data.tasks.slice(m.data.stock),delivered=(state.deliveries||[]).map(item=>item.task),unfilled=state.unfilled||[],atHub=same([state.x,state.y],m.data.hub);worldSuccess=!x.error&&state.dataComplete&&atHub&&same(delivered,expectedDelivered)&&same(unfilled,expectedUnfilled);conceptSuccess=worldSuccess&&same(d.tasks,m.data.tasks)&&d.fields.traversal==="tasks"&&d.fields.lookup==="routes"&&d.fields.inventory==="check"&&d.fields.writeback==="results"&&events.filter(e=>e.functionCall?.name==="dispatch_one").length===expectedDelivered.length&&same(state.variables?.results,Object.fromEntries([...expectedDelivered.map(name=>[name,"delivered"]),...expectedUnfilled.map(name=>[name,"out-of-stock"])]));evidence={delivered,unfilled,stock:state.variables?.stock,results:state.variables?.results,atHub};}
    if(no===25){const expected=m.data.base.slice();expected[m.data.target.y]=expected[m.data.target.y].slice(0,m.data.target.x)+m.data.tile+expected[m.data.target.y].slice(m.data.target.x+1);const built=state.worldBuild?.grid;worldSuccess=!x.error&&state.dataComplete&&same(built,expected);conceptSuccess=worldSuccess&&d.fields.row==="y"&&d.fields.column==="x"&&d.fields.tile==="rock"&&events.some(e=>e.type==="world-build");evidence={target:m.data.target,built,expected};}
    const failure=x.error||(!worldSuccess?(no===21?"访问顺序还没有跟随当前清单。":no===22?"追加后的任务没有被完整、安全地访问。":no===23?"查询结果没有带 Nova 到指定出口。":no===24?"派发数量或缺货状态与库存不一致。":"二维表没有只改变指定的世界格。"):`世界结果完成，但第 ${no} 课的数据连接证据还不完整。`);const model={fields:copy(d.fields),commands:copy(d.commands),tasks:copy(d.tasks),appends:copy(d.appends),routes:copy(d.routes)};return{id:`${Date.now()}-${Math.random().toString(36).slice(2,9)}`,at:new Date().toISOString(),lessonNo:no,contentRevision:revisions[no],fingerprint:E().fingerprint(m),challengeKey:m.early.key,phase:m.early.independent?"challenge":"guided",independent:m.early.independent,assisted,worldSuccess,success:Boolean(worldSuccess&&conceptSuccess),failure,evidence,source:x.source,events:copy(events),program:[],routeProgram:[],path:[],trace:[],programModel:model,programVersion:E().canonical(model),ruleVersion:E().canonical(d.fields),practiceOnly:false};}
  function record(p,a,no){p.attempts=[...p.attempts,copy(a)].slice(-12);if(a.worldSuccess)p.completed=true;if(a.success){if(a.phase==="guided"){p.guidedComplete=true;p.guidedEvidence=copy(a);}if(a.independent)p.transferEvidence=E().mergeTransferProofs(p.transferEvidence,{[a.fingerprint]:copy(a)});}p.mastered=E().stateGate(p,revisions[no]).mastered;}
  function reference(m,p,no){const d=draft(p,no,m);if(no===21){d.tasks=copy(m.data.requested);d.fields.loopSource="tasks";d.commands=["iterate","home","finish"].map((action,i)=>({id:i+1,action}));}if(no===22){d.appends=copy(m.data.expectedAppends);d.fields={lengthMode:"current",boundMode:"valid"};d.commands=["append","index","home","finish"].map((action,i)=>({id:i+1,action}));}if(no===23){const keys=["回收港","天文台","能源港"],exits=Object.keys(m.data.exits);d.routes=Object.fromEntries(keys.map((key,i)=>[key,exits[i+1]||exits[0]]));d.routes[m.data.expectedKey]=m.data.expectedExit;d.fields.lookupMode="dict";d.commands=["lookup","teleport","finish"].map((action,i)=>({id:i+1,action}));}if(no===24){d.tasks=copy(m.data.tasks);d.fields={traversal:"tasks",lookup:"routes",inventory:"check",writeback:"results"};d.commands=["dispatch","home","finish"].map((action,i)=>({id:i+1,action}));}if(no===25){d.fields={row:"y",column:"x",tile:"rock"};d.commands=["editGrid","buildGrid","finish"].map((action,i)=>({id:i+1,action}));}d.nextId=d.commands.length+1;d.selected=null;}
  function edit(m,p,no,{action,field,value}){const d=draft(p,no,m),remember=()=>{d.undo={fields:copy(d.fields),commands:copy(d.commands),tasks:copy(d.tasks),appends:copy(d.appends),routes:copy(d.routes),selected:d.selected,nextId:d.nextId};};if(action==="select"){d.selected=d.selected===Number(value)?null:Number(value);return{reset:false,notice:""};}if(action==="undo"){if(d.undo){Object.assign(d,d.undo);d.undo=null;}else d.commands.pop();return{reset:true,notice:""};}if(action==="add"&&labels[value]){const index=d.commands.findIndex(c=>c.id===d.selected);if(index<0&&d.commands.length>=limits[no])return{reset:false,notice:`最多放 ${limits[no]} 张指令卡。`};remember();const command={id:index>=0?d.commands[index].id:d.nextId++,action:value};if(index>=0)d.commands.splice(index,1,command);else d.commands.push(command);d.selected=null;}if(action==="remove"){const index=d.commands.findIndex(c=>c.id===Number(value));if(index>=0){remember();d.commands.splice(index,1);d.selected=null;}}if(action==="clear"){remember();d.commands=[];d.selected=null;}if(action==="task-add"){if(d.tasks.length<6){remember();d.tasks.push(value);}}if(action==="task-remove"){remember();d.tasks.splice(Number(value),1);}if(action==="task-left"){const i=Number(value);if(i>0){remember();[d.tasks[i-1],d.tasks[i]]=[d.tasks[i],d.tasks[i-1]];}}if(action==="task-right"){const i=Number(value);if(i<d.tasks.length-1){remember();[d.tasks[i+1],d.tasks[i]]=[d.tasks[i],d.tasks[i+1]];}}if(action==="append-add"&&!d.appends.includes(value)&&d.appends.length<3){remember();d.appends.push(value);}if(action==="append-remove"){remember();d.appends.splice(Number(value),1);}if(field&&Object.hasOwn(d.fields,field)){remember();d.fields[field]=value;}if(field?.startsWith("route:")){remember();d.routes[field.slice(6)]=value;}return{reset:true,notice:""};}
  function adapter(no){return{revision:revisions[no],mission:(base,p)=>mission(base,p,no),draft:p=>draft(p,no),source:(m,d)=>program(m,d,no).source,compile:(m,d,Sk)=>compile(m,d,no,Sk),assess:(m,d,x,a)=>assess(m,d,x,a,no),record:(p,a)=>record(p,a,no),reconcile:p=>{p.mastered=E().stateGate(p,revisions[no]).mastered;},render:(m,p,c)=>root.CodeQuestDataLessonUI.render(m,p,c),builder:(m,p,c)=>root.CodeQuestDataLessonUI.builder(m,p,c),edit:(m,p,input)=>edit(m,p,no,input),feedback(m,p,a){if(!a.success)return a.failure;if(p.mastered)return`第 ${no} 课已完成独立验证。`;return m.early.independent?"迁移完成。":`这一阶段完成。接着做“${m.early.phaseLabels[1]}”。`;},reference:(m,p)=>reference(m,p,no)};}
  root.CodeQuestDataLessons={revisions,limits,labels,codes,logisticsWorld,indexWorld,portalWorld,dispatchWorld,blueprintWorld,draft,mission,program,compile,assess,record};lessonNos.forEach(no=>root.CodeQuestStructuredLessons.register(no,adapter(no)));
})(typeof globalThis!=="undefined"?globalThis:window);
