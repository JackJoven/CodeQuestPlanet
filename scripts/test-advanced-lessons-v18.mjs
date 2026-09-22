import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const read=file=>readFile(new URL(`../signal-runner-node/${file}`,import.meta.url),"utf8");
const c={console,performance,setTimeout,clearTimeout,setImmediate,setInterval,clearInterval};c.window=c;c.globalThis=c;vm.createContext(c);
for(const file of ["vendor/skulpt-1.2.0.min.js","world-rules.js","learning-evidence.js","structured-lessons.js","python-runtime-core.js","advanced-lessons.js","advanced-lessons-ui.js","course-data.js","v16-course-overrides.js","early-lessons.js"])vm.runInContext(await read(file),c,{filename:file});
const E=c.CodeQuestEarlyLessons,clone=value=>JSON.parse(JSON.stringify(value));let checks=0;
const check=(name,fn)=>{fn();checks+=1;console.log(`✓ ${name}`);};
async function execute(no,phase,learner=null,prepare=null){const p=learner||E.profile(),base=c.SignalRunnerCourseData.missions[no-1];E.mission(base,p);Object.assign(p,{phase,variant:0});let m=E.mission(base,p),adapter=c.CodeQuestStructuredLessons.get(no);prepare?prepare(adapter.draft(p),m):adapter.reference(m,p);m=E.mission(base,p);const d=clone(adapter.draft(p)),execution=await adapter.compile(m,d,c.Sk),attempt=adapter.assess(m,d,execution,p.assisted);adapter.record(p,attempt);return{p,m,d,execution,attempt,adapter};}

for(const no of [16,18,20]){
  const guided=await execute(no,"guided");
  check(`lesson ${no} author program completes guided construction`,()=>assert.equal(guided.attempt.success,true,guided.attempt.failure));
  const transfer=await execute(no,"challenge",guided.p);
  check(`lesson ${no} independent semantic transfer completes mastery`,()=>{assert.equal(transfer.attempt.success,true,transfer.attempt.failure);assert.notEqual(transfer.attempt.fingerprint,guided.attempt.fingerprint);assert.equal(transfer.p.mastered,true);});
}

{
  const wrong=await execute(16,"guided",null,d=>{Object.assign(d.fields,{functionReturn:"stable",connector:"or",condition:"not-at",loopBody:"move"});d.commands=["call","guard","while","collect","move","upload"].map((action,i)=>({id:i+1,action}));});
  check("lesson 16 rejects OR even when the workshop route can finish",()=>{assert.equal(wrong.attempt.worldSuccess,true);assert.equal(wrong.attempt.success,false);});
}
{
  const wrong=await execute(18,"guided",null,d=>{Object.assign(d.fields,{moveLedger:"energy",shieldLedger:"backup",supplyLedger:"energy"});d.commands=[...Array(3).fill("move"),"supply","left",...Array(3).fill("move"),"right",...Array(2).fill("move"),"shield",...Array(3).fill("move"),"collect"].map((action,i)=>({id:i+1,action}));});
  check("lesson 18 rejects a shield connected to a separate ledger",()=>{assert.equal(wrong.attempt.worldSuccess,true);assert.equal(wrong.attempt.success,false);});
}
{
  const world=c.CodeQuestAdvancedLessons.energyWorld(false),runtime=c.CodeQuestPythonRuntime.create({Sk:c.Sk,initialEnergy:5,apiCallLimit:40,allowedFunctions:new Set(["move","activate_supply"]),world:{grid:world.grid,start:{x:world.supply.x,y:world.supply.y},startDir:"E",required:0,targetPositions:[],terrain:world.terrain}});
  const result=await runtime.compile("activate_supply()\nactivate_supply()");const supplies=result.events.filter(e=>e.type==="supply").map(e=>e.supply);
  check("lesson 18 supply is finite and a repeated activation adds zero",()=>{assert.equal(supplies.length,2);assert.equal(supplies[0].amount,7);assert.equal(supplies[1].amount,0);assert.equal(result.finalState.energy,12);});
}
{
  const wrong=await execute(20,"challenge",null,d=>{Object.assign(d.fields,{returnMode:"value",consumer:"fixed-true"});d.commands=[{id:1,action:"inspect"},{id:2,action:"branch"}];});
  check("lesson 20 rejects a caller that ignores a false return value",()=>{assert.equal(wrong.m.advanced.routeClear,false);assert.equal(wrong.attempt.worldSuccess,false);assert.equal(wrong.attempt.success,false);});
}
{
  const A=c.CodeQuestAdvancedLessons;
  check("lessons 16, 18 and 20 use full multi-zone maps instead of single-tile corridors",()=>{for(const [no,world] of [[16,A.workshopWorld(false)],[18,A.energyWorld(false)],[20,A.returnWorld(false)]]){const rowWidths=world.grid.map(row=>[...row].filter(tile=>tile!=="_").length),tiles=rowWidths.reduce((sum,count)=>sum+count,0);assert.ok(world.grid.length>=9,`lesson ${no} height`);assert.ok(world.grid[0].length>=13,`lesson ${no} width`);assert.ok(tiles>=50,`lesson ${no} playable footprint`);assert.ok(rowWidths.filter(width=>width>=5).length>=6,`lesson ${no} broad rows`);assert.ok(world.labels.length>=3,`lesson ${no} labels`);}});
}
console.log(`v1.8 lessons 16–20: ${checks} scenario groups passed.`);
