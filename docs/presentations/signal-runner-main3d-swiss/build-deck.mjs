import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const templatePath = "/Users/jack/.codex/skills/guizang-ppt-skill/assets/template-swiss.html";
const outputPath = new URL("./index.html", import.meta.url);
const assetsDir = new URL("./assets/", import.meta.url);
const template = readFileSync(templatePath, "utf8");

const extraCss = String.raw`
<style>
  .h-statement{font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(7.4vw,13vh);line-height:.95;letter-spacing:-.04em}
  .stmt-anchor{font-family:var(--mono);font-size:14px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--text-helper)}
  .slide.dark .stmt-anchor{color:rgba(255,255,255,.62)}
  .slide.dark .chrome-min{color:rgba(255,255,255,.62)}

  .journey-grid{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:minmax(0,1.75fr) minmax(0,1fr);gap:1.4vh 1vw;flex:1;min-height:0;margin-bottom:4vh}
  .journey-shot{display:flex;flex-direction:column;min-width:0;min-height:0}
  .journey-shot .frame-img{flex:1;min-height:0;background:#08113b}
  .journey-shot img{object-fit:contain}
  .journey-cap{display:flex;justify-content:space-between;gap:1vw;padding-top:1vh;border-top:1px solid var(--border-subtle);font-family:var(--mono);font-size:14px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--text-helper)}
  .journey-note{padding:1.8vh 1.4vw;display:flex;flex-direction:column;justify-content:space-between;min-height:0}
  .journey-note .n{font-family:var(--mono);font-size:14px;font-weight:600;letter-spacing:.14em;color:var(--accent)}
  .journey-note h3{font-size:max(18px,1.45vw);font-weight:400;line-height:1.2}
  .journey-note p{font-size:16px;font-weight:400;line-height:1.45;color:var(--text-secondary)}

  .sub-card{border-radius:0}
  .feature-grid{margin-top:0;gap:1.2vh 1vw;margin-bottom:4vh}
  .feature-grid .sub-card{padding:2vh 1.35vw}
  .feature-grid .sub-card .lucide{width:2vw;height:2vw;margin-bottom:1vh;stroke-width:1.4;color:var(--accent-bright)}
  .feature-grid .sub-card .ttl{font-size:max(18px,1.36vw);font-weight:400;margin-bottom:.6vh}
  .feature-grid .sub-card .desc{font-size:16px;font-weight:400;line-height:1.42;margin-top:auto}
  .slide.dark .feature-grid .sub-card{background:rgba(255,255,255,.07);color:var(--paper)}
  .slide.dark .feature-grid .sub-card .desc{color:rgba(255,255,255,.68)}

  .loop-diagram{display:grid;grid-template-columns:5fr 7fr;gap:5vw;align-items:center;flex:1;min-height:0;margin-bottom:3vh}
  .loop-steps{display:flex;flex-direction:column}
  .loop-step{display:grid;grid-template-columns:4.2vw 1fr;gap:1.25vw;align-items:center;padding:1.05vh 0;border-top:1px solid var(--border-subtle)}
  .loop-step:last-child{border-bottom:1px solid var(--border-subtle)}
  .loop-step .n{font-family:var(--sans);font-size:min(3.4vw,6vh);font-weight:200;line-height:.9;color:var(--accent)}
  .loop-step h3{font-size:max(18px,1.28vw);font-weight:400;line-height:1.2;margin-bottom:.25vh}
  .loop-step p{font-size:16px;font-weight:400;line-height:1.38;color:var(--text-secondary)}
  .loop-visual{position:relative;height:45vh;display:grid;place-items:center}
  .loop-ring{width:min(26vw,43vh);height:min(26vw,43vh);border:1px solid var(--border-strong);border-radius:50%;position:relative}
  .loop-ring::before{content:"";position:absolute;inset:17%;border:1px dashed var(--grey-2);border-radius:50%}
  .loop-center{position:absolute;inset:35%;background:var(--accent);color:var(--accent-on);display:grid;place-items:center;text-align:center;font-family:var(--mono);font-size:14px;font-weight:600;letter-spacing:.08em;line-height:1.45}
  .loop-node{position:absolute;width:7.2vw;min-width:108px;padding:1vh .7vw;background:var(--grey-1);font-size:16px;font-weight:500;line-height:1.2;text-align:center}
  .loop-node.a{top:-4%;left:50%;transform:translateX(-50%)}
  .loop-node.b{right:-15%;top:26%}
  .loop-node.c{right:-6%;bottom:4%}
  .loop-node.d{left:-6%;bottom:4%}
  .loop-node.e{left:-15%;top:26%}

  .duo-compare{min-height:0;margin-top:4.6vh;margin-bottom:4vh}
  .duo-compare .col-ttl{font-size:min(4.6vw,8.2vh)}
  .duo-compare .col-desc{font-size:18px;font-weight:400}
  .duo-compare .col-list li{font-size:16px;font-weight:400}
  .code-box{background:var(--ink);color:var(--paper);padding:1.5vh 1.2vw;font-family:var(--mono);font-size:16px;font-weight:400;line-height:1.55;white-space:pre-wrap;margin-top:1.2vh}
  .state-row{display:grid;grid-template-columns:7em 1fr;gap:1vw;padding:1.05vh 0;border-top:1px solid var(--border-subtle);font-size:16px;font-weight:400}
  .state-row strong{font-family:var(--mono);font-weight:600}

  .system-diagram{display:grid;grid-template-rows:auto 1fr auto;gap:2.4vh;flex:1;min-height:0;margin-bottom:4vh}
  .system-head{display:grid;grid-template-columns:7fr 5fr;gap:4vw;align-items:end}
  .system-head h2{font-family:var(--sans),var(--sans-zh);font-size:min(5.2vw,9.2vh);font-weight:200;line-height:.98;letter-spacing:-.035em}
  .system-core{position:relative;height:32vh;display:grid;place-items:center}
  .sys-svg{width:62vw;height:32vh;overflow:visible}
  .sys-svg circle{fill:none;stroke-width:1.2}
  .sys-label{position:absolute;background:var(--paper);color:var(--ink);padding:.75vh .9vw;font-size:16px;font-weight:500;line-height:1.35;border-top:2px solid var(--accent)}
  .sys-label.core{left:50%;top:50%;transform:translate(-50%,-50%);background:var(--accent);color:var(--accent-on);border:0;text-align:center}
  .sys-label.middle{left:25%;top:26%}
  .sys-label.outer{right:17%;top:7%}
  .system-notes{display:grid;grid-template-columns:repeat(3,1fr);gap:2vw;border-top:1px solid rgba(255,255,255,.22);padding-top:1.6vh}
  .system-notes h3{font-size:max(18px,1.3vw);font-weight:400;line-height:1.25;margin-bottom:.6vh}
  .system-notes p{font-size:16px;font-weight:400;line-height:1.4;color:rgba(255,255,255,.68)}

  .image-hero-body{padding-top:4.7vh}
  .takeaway-list{list-style:none;display:flex;flex-direction:column;gap:0}
  .takeaway-list li{display:grid;grid-template-columns:auto 1fr;gap:2vw;padding:2.2vh 0;border-top:1px solid var(--border-subtle)}
  .takeaway-list .num{font-size:min(4.4vw,7.8vh);font-weight:200;line-height:.9}
  .takeaway-list h3{font-size:max(18px,1.75vw);font-weight:400;margin-bottom:.7vh}
  .takeaway-list p{font-size:16px;font-weight:400;line-height:1.5;color:var(--text-secondary)}
</style>`;

const slides = String.raw`
<section class="slide accent" data-layout="SWISS-COVER-ASCII" data-animate="hero">
  <div class="canvas-card">
    <canvas class="ascii-bg" aria-hidden="true"></canvas>
    <div class="chrome-min"><div class="l">Signal Runner · Prototype Field Note</div><div class="r">SR · 26.08.07 · 01 / 12</div></div>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:2.6vh">
      <div data-anim="kicker" class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em">3D PROGRAMMING · ONE REAL TASK</div>
      <h1 data-anim="title" style="align-self:center;font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(7.4vw,13vh);line-height:.94;letter-spacing:-.025em;color:#fff">让第一段代码<br/>在 3D 世界里<span style="font-style:italic;font-weight:300">跑起来</span></h1>
      <div data-anim="bottom" style="display:grid;gap:1.6vh;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh">
        <div data-anim="lead" class="lead" style="max-width:58ch;color:rgba(255,255,255,.86);font-weight:400">Signal Runner 是一个可以运行的 3D 编程学习原型：学生编排指令、观察世界、读取日志，再修改程序。</div>
        <div style="display:flex;justify-content:space-between;align-items:end"><div class="t-meta" style="color:rgba(255,255,255,.6)">CodeQuestPlanet · Main 3D Prototype</div><div class="t-meta" style="color:rgba(255,255,255,.6)">→ swipe / arrow keys</div></div>
      </div>
    </div>
  </div>
</section>

<section class="slide hero light split" data-layout="S03" data-animate="statement">
  <div class="canvas-card"><div class="split-half">
    <div class="half" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between">
      <div class="chrome-min"><div class="l">01 · CURRENT PROTOTYPE</div><div class="r">02 / 12</div></div>
      <h2 data-anim="statement" style="font-weight:200;font-size:min(6vw,10.5vh);line-height:.96;letter-spacing:-.035em">先做好<br/>一个任务，<br/>让代码真正<span style="color:var(--accent)">跑起来。</span></h2>
      <div data-anim="anchor" class="stmt-anchor">A RUNNABLE 3D LEARNING LOOP</div>
    </div>
    <div class="half b-grey" style="padding:5.6vh 3.6vw 4.4vh;justify-content:center;gap:4vh">
      <div data-anim="right" class="t-meta">CURRENT SCOPE · NOT A COMPLETE PLATFORM</div>
      <p data-anim="right" style="font-size:max(22px,1.75vw);font-weight:400;line-height:1.55;max-width:24ch">学生能在同一个界面里完成观察、编程、运行、失败、调试和再次运行。</p>
      <div data-anim="right" style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--grey-2)"><div style="background:var(--paper);padding:2vh 1vw"><div class="t-meta">WORLD</div><p class="t-body-sm" style="margin-top:1vh">真实 3D 任务场景</p></div><div style="background:var(--paper);padding:2vh 1vw"><div class="t-meta">CODE</div><p class="t-body-sm" style="margin-top:1vh">指令与文本代码</p></div><div style="background:var(--paper);padding:2vh 1vw"><div class="t-meta">FEEDBACK</div><p class="t-body-sm" style="margin-top:1vh">状态与失败日志</p></div></div>
    </div>
  </div></div>
</section>

<section class="slide light" data-layout="S16" data-animate="field-notes">
  <div class="canvas-card">
    <div class="chrome-min"><div class="l">02 · ENTRY STRUCTURE</div><div class="r">03 / 12</div></div>
    <div style="flex:1;display:grid;grid-template-rows:auto 1fr;gap:4vh;min-height:0">
      <div data-anim="line" style="display:flex;flex-direction:column;gap:1.3vh"><div class="t-meta">THREE LEVELS · ONE DESTINATION</div><h2 style="font-weight:200;font-size:min(5.2vw,9.2vh);line-height:.96">从课程入口，走进一个具体任务</h2></div>
      <div data-anim="up" class="journey-grid">
        <figure class="journey-shot"><div class="frame-img"><img src="images/03-course-map.png" data-image-slot="s16-brief-16x10" alt="Signal Runner 课程地图"></div><figcaption class="journey-cap"><strong>01</strong><span>课程地图</span></figcaption></figure>
        <figure class="journey-shot"><div class="frame-img"><img src="images/03-stage-one.png" data-image-slot="s16-brief-16x10" alt="第一章信标启航阶段入口"></div><figcaption class="journey-cap"><strong>02</strong><span>选择阶段</span></figcaption></figure>
        <figure class="journey-shot"><div class="frame-img"><img src="images/03-lesson-task.png" data-image-slot="s16-brief-16x10" alt="第一节 3D 编程任务界面"></div><figcaption class="journey-cap"><strong>03</strong><span>进入任务</span></figcaption></figure>
        <article class="journey-note card-fill"><span class="n">LEVEL 01</span><h3>先知道自己在哪</h3><p>课程地图负责提供方向，不代表所有课程内容已经成熟。</p></article>
        <article class="journey-note card-fill"><span class="n">LEVEL 02</span><h3>再选择一组任务</h3><p>阶段页把能力主题、课程列表和当前进度放在一起。</p></article>
        <article class="journey-note card-fill"><span class="n">LEVEL 03</span><h3>最后解决一个问题</h3><p>真正的学习发生在可以运行、失败和修改的 3D 任务里。</p></article>
      </div>
    </div>
  </div>
</section>

<section class="slide light" data-layout="S22" data-animate="image-hero">
  <div class="canvas-card" style="padding:0;display:flex;flex-direction:column;overflow:hidden">
    <div data-anim="img" style="position:relative;flex:0 0 58%;overflow:hidden;background:var(--ink)">
      <img src="images/04-first-mission.jpg" data-image-slot="s22-hero-21x9" alt="第一节启动任务的 3D 场景、任务说明与指令程序" loading="eager" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center">
      <div class="chrome-min" style="position:absolute;top:0;left:0;right:0;color:rgba(255,255,255,.92);padding:5.6vh 5vw 0"><div class="l">03 · FIRST MISSION</div><div class="r">04 / 12</div></div>
      <div data-anim="title-block" style="position:absolute;left:5vw;top:11vh;background:var(--paper);padding:2.5vh 2.5vw;max-width:38vw"><div style="font-weight:200;font-size:min(4.1vw,7.2vh);line-height:1;letter-spacing:-.035em">第一课<br/>让无人机到达信标</div></div>
    </div>
    <div data-anim="kpi" class="image-hero-body">
      <div style="max-width:47ch;font-size:max(18px,1.22vw);line-height:1.55;font-weight:400">学生先移动到信标所在位置，再执行采集。任务很小，但已经包含“顺序会改变结果”这一核心概念。</div>
      <div class="image-hero-stats">
        <div style="display:flex;flex-direction:column;gap:.6vh"><div style="height:1px;background:var(--ink)"></div><div class="t-meta">COMMANDS</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200">03</div><p class="body-sm">move、move、collect</p></div>
        <div style="display:flex;flex-direction:column;gap:.6vh"><div style="height:1px;background:var(--ink)"></div><div class="t-meta">VISIBLE STATE</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200">04</div><p class="body-sm">位置、朝向、能量、信标</p></div>
        <div style="display:flex;flex-direction:column;gap:.6vh"><div style="height:1px;background:var(--ink)"></div><div class="t-meta">TARGET</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200;color:var(--accent)">01</div><p class="body-sm">站到正确格子后采集</p></div>
      </div>
    </div>
  </div>
</section>

<section class="slide dark" data-layout="S04" data-animate="grid-reveal">
  <div class="canvas-card">
    <div class="chrome-min"><div class="l">04 · ONE SCREEN</div><div class="r">05 / 12</div></div>
    <div style="flex:1;display:grid;grid-template-rows:auto 1fr;gap:4.5vh;min-height:0">
      <div data-anim="line" style="display:flex;flex-direction:column;gap:1.3vh"><div class="t-meta">TASK · CODE · FEEDBACK</div><h2 style="font-weight:200;font-size:min(5.2vw,9.2vh);line-height:.96">一个界面，同时呈现六种信息</h2></div>
      <div data-anim="up" class="sub-grid-3-2 feature-grid">
        <article class="sub-card"><i data-lucide="map" class="lucide"></i><h3 class="ttl">3D 任务世界</h3><p class="desc">角色、路径、信标和障碍都能被直接观察。</p></article>
        <article class="sub-card"><i data-lucide="target" class="lucide"></i><h3 class="ttl">本关目标</h3><p class="desc">学生知道要做什么，以及成功需要满足什么条件。</p></article>
        <article class="sub-card"><i data-lucide="blocks" class="lucide"></i><h3 class="ttl">指令选择区</h3><p class="desc">通过点击组织行为，不必先记住全部语法。</p></article>
        <article class="sub-card"><i data-lucide="code-2" class="lucide"></i><h3 class="ttl">程序与代码</h3><p class="desc">指令顺序同步转换成可以阅读的文本代码。</p></article>
        <article class="sub-card"><i data-lucide="step-forward" class="lucide"></i><h3 class="ttl">运行工具</h3><p class="desc">运行、单步、撤销、复位和清空支持反复尝试。</p></article>
        <article class="sub-card"><i data-lucide="file-search" class="lucide"></i><h3 class="ttl">HUD 与日志</h3><p class="desc">位置、朝向、能量和错误原因持续可见。</p></article>
      </div>
    </div>
  </div>
</section>

<section class="slide light" data-layout="S14" data-animate="loop-form">
  <div class="canvas-card">
    <div class="chrome-min"><div class="l">05 · LEARNING LOOP</div><div class="r">06 / 12</div></div>
    <div style="flex:1;display:grid;grid-template-rows:auto 1fr;gap:3.6vh;min-height:0">
      <div data-anim="line" style="display:flex;flex-direction:column;gap:1.3vh"><div class="t-meta">HOW A STUDENT LEARNS</div><h2 style="font-weight:200;font-size:min(5.2vw,9.2vh);line-height:.96">不是听完再做，而是一边运行一边理解</h2></div>
      <div data-anim="up" class="loop-diagram">
        <div class="loop-steps">
          <div class="loop-step"><div class="n">01</div><div><h3>观察与预测</h3><p>先看起点、目标和路线，猜测需要几步。</p></div></div>
          <div class="loop-step"><div class="n">02</div><div><h3>编排指令</h3><p>把计划放进程序，同时看到生成代码。</p></div></div>
          <div class="loop-step"><div class="n">03</div><div><h3>运行或单步</h3><p>让世界按照程序逐步发生变化。</p></div></div>
          <div class="loop-step"><div class="n">04</div><div><h3>读取状态与日志</h3><p>确认位置、能量、目标和第一次错误。</p></div></div>
          <div class="loop-step"><div class="n">05</div><div><h3>修改，再运行</h3><p>把失败变成下一次修改的依据。</p></div></div>
        </div>
        <div class="loop-visual"><div class="loop-ring"><div class="loop-center">RUN<br/>→ LEARN</div><div class="loop-node a">观察 / 预测</div><div class="loop-node b">编排 / 代码</div><div class="loop-node c">运行 / 单步</div><div class="loop-node d">状态 / 日志</div><div class="loop-node e">修改 / 再跑</div></div></div>
      </div>
    </div>
  </div>
</section>

<section class="slide light" data-layout="S08" data-animate="duo-mirror">
  <div class="canvas-card">
    <div class="chrome-min"><div class="l">06 · FIRST SUCCESS</div><div class="r">07 / 12</div></div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.3vh"><div class="t-meta">THREE COMMANDS · ONE VISIBLE RESULT</div><h2 style="font-weight:200;font-size:min(5.2vw,9.2vh);line-height:.96">三条指令，完成第一个任务</h2></div>
    <div class="duo-compare">
      <div class="col" data-anim="left"><div class="col-tag"><span class="num">01</span>PROGRAM</div><h3 class="col-ttl">运行之前</h3><p class="col-desc">无人机位于起点，信标还没有被采集。</p><pre class="code-box">function main() {
  move();
  move();
  collect();
}</pre><div><div class="state-row"><span>位置</span><strong>(1, 2)</strong></div><div class="state-row"><span>信标</span><strong>0 / 1</strong></div></div></div>
      <div class="vrule"></div>
      <div class="col accent" data-anim="right"><div class="col-tag"><span class="num">02</span>RESULT</div><h3 class="col-ttl">运行之后</h3><p class="col-desc">两次移动改变位置，采集指令在正确格子上生效。</p><div style="margin-top:1.2vh;background:var(--grey-1);padding:1.6vh 1.2vw"><div class="t-meta">WORLD FEEDBACK</div><div style="font-size:min(3.8vw,6.8vh);font-weight:200;color:var(--accent);margin-top:1vh">任务完成</div></div><div><div class="state-row"><span>位置</span><strong>(3, 2)</strong></div><div class="state-row"><span>信标</span><strong>1 / 1</strong></div><div class="state-row"><span>能量</span><strong>10</strong></div></div></div>
    </div>
  </div>
</section>

<section class="slide hero dark split" data-layout="S03" data-animate="statement">
  <div class="canvas-card"><div class="split-half">
    <div class="half b-ink" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between">
      <div class="chrome-min"><div class="l">07 · FAILURE AS EVIDENCE</div><div class="r">08 / 12</div></div>
      <h2 data-anim="statement" style="font-weight:200;font-size:min(6.2vw,11vh);line-height:.95;letter-spacing:-.04em">失败不是<br/>终点。<br/>它是下一次<span style="color:var(--accent-bright)">修改</span>的证据。</h2>
      <div data-anim="anchor" class="stmt-anchor">DEBUG THE FIRST WRONG STEP</div>
    </div>
    <div class="half b-grey" style="padding:5.6vh 3.6vw 4.4vh;justify-content:center;gap:3.2vh;color:var(--ink)">
      <div data-anim="right" class="t-meta">ACTUAL RUNTIME LOG</div>
      <div data-anim="right" style="background:var(--ink);color:var(--paper);padding:2.4vh 2vw;border-left:4px solid var(--accent)"><div class="t-meta" style="color:rgba(255,255,255,.62)">ERROR · COLLECT</div><p style="font-size:max(22px,1.6vw);font-weight:400;line-height:1.5;margin-top:1.2vh">采集失败：当前位置没有可采集信标。</p></div>
      <div data-anim="right" style="display:grid;gap:1px;background:var(--grey-2)"><div style="background:var(--paper);padding:1.5vh 1.2vw;font-size:16px;font-weight:400">无人机现在在哪里？</div><div style="background:var(--paper);padding:1.5vh 1.2vw;font-size:16px;font-weight:400">采集之前缺少什么动作？</div><div style="background:var(--paper);padding:1.5vh 1.2vw;font-size:16px;font-weight:400">第一次偏离预期发生在哪一步？</div></div>
    </div>
  </div></div>
</section>

<section class="slide light" data-layout="S04" data-animate="grid-reveal">
  <div class="canvas-card">
    <div class="chrome-min"><div class="l">08 · ENGINE CAPABILITIES</div><div class="r">09 / 12</div></div>
    <div style="flex:1;display:grid;grid-template-rows:auto 1fr;gap:4.5vh;min-height:0">
      <div data-anim="line" style="display:flex;flex-direction:column;gap:1.3vh"><div class="t-meta">SIX RUNNABLE MISSION TYPES</div><h2 style="font-weight:200;font-size:min(5.2vw,9.2vh);line-height:.96">当前引擎已经支持六类基础任务</h2></div>
      <div data-anim="up" class="sub-grid-3-2 feature-grid">
        <article class="sub-card"><i data-lucide="list-ordered" class="lucide" style="color:var(--accent)"></i><h3 class="ttl">启动巡航</h3><p class="desc">顺序、移动、采集：先把最小任务跑通。</p></article>
        <article class="sub-card"><i data-lucide="route" class="lucide" style="color:var(--accent)"></i><h3 class="ttl">路径调试</h3><p class="desc">转向、障碍和失败日志：找出第一次错误。</p></article>
        <article class="sub-card"><i data-lucide="scan-line" class="lucide" style="color:var(--accent)"></i><h3 class="ttl">危险传感器</h3><p class="desc">条件判断、危险检测和护盾改变下一步行为。</p></article>
        <article class="sub-card"><i data-lucide="repeat-2" class="lucide" style="color:var(--accent)"></i><h3 class="ttl">压缩重复</h3><p class="desc">用 repeat 表达重复模式，减少啰嗦指令。</p></article>
        <article class="sub-card"><i data-lucide="braces" class="lucide" style="color:var(--accent)"></i><h3 class="ttl">路线函数</h3><p class="desc">定义 routeA()，把稳定动作命名并复用。</p></article>
        <article class="sub-card"><i data-lucide="radio-tower" class="lucide" style="color:var(--accent)"></i><h3 class="ttl">三塔同步</h3><p class="desc">多个信标、危险和上传条件形成综合任务。</p></article>
      </div>
    </div>
  </div>
</section>

<section class="slide dark" data-layout="S17" data-animate="system-diagram">
  <div class="canvas-card">
    <div class="chrome-min"><div class="l">09 · WHY 3D</div><div class="r">10 / 12</div></div>
    <div class="system-diagram">
      <div data-anim="line" class="system-head"><h2>抽象代码，<br/>可以被学生直接看见</h2><p class="t-body" style="color:rgba(255,255,255,.78)">3D 不是装饰。它把指令、状态和结果放进同一个可观察系统，让初学者知道程序到底改变了什么。</p></div>
      <div data-anim="up" class="system-core">
        <svg class="sys-svg" viewBox="0 0 900 300" aria-hidden="true"><circle cx="450" cy="150" r="64" stroke="var(--accent-bright)"/><circle cx="450" cy="150" r="112" stroke="var(--paper)" opacity=".55"/><circle cx="450" cy="150" r="145" stroke="rgba(255,255,255,.26)"/></svg>
        <div class="sys-label core">可读的<br/>指令代码</div><div class="sys-label middle">可追踪的运行状态</div><div class="sys-label outer">可见的 3D 世界反馈</div>
      </div>
      <div class="system-notes"><div><h3>COMMAND</h3><p>move、turn、collect 等命令表达学生的计划。</p></div><div><h3>STATE</h3><p>位置、朝向、能量和目标记录程序正在发生什么。</p></div><div><h3>WORLD</h3><p>移动、转向、撞墙和采集把抽象执行变成可见变化。</p></div></div>
    </div>
  </div>
</section>

<section class="slide light" data-layout="S08" data-animate="duo-mirror">
  <div class="canvas-card">
    <div class="chrome-min"><div class="l">10 · CURRENT BOUNDARY</div><div class="r">11 / 12</div></div>
    <div data-anim="line" style="display:flex;flex-direction:column;gap:1.3vh"><div class="t-meta">WHAT EXISTS · WHAT COMES NEXT</div><h2 style="font-weight:200;font-size:min(5.2vw,9.2vh);line-height:.96">现在能演示什么，还需要继续做什么</h2></div>
    <div class="duo-compare">
      <div class="col" data-anim="left"><div class="col-tag"><span class="num">NOW</span>RUNNABLE</div><h3 class="col-ttl">已经完成</h3><p class="col-desc">核心学习闭环可以在现场完整演示。</p><ul class="col-list"><li>3D 小岛任务场景</li><li>移动、转向、采集与判定</li><li>指令编排和生成代码</li><li>运行、单步、撤销与复位</li><li>状态 HUD 和失败日志</li><li>课程地图、阶段和课次入口</li></ul></div>
      <div class="vrule"></div>
      <div class="col accent" data-anim="right"><div class="col-tag"><span class="num">NEXT</span>IN PROGRESS</div><h3 class="col-ttl">继续完善</h3><p class="col-desc">下一阶段重点是增加内容差异与学生创作能力。</p><ul class="col-list"><li>每节课更独立的地图与玩法</li><li>更丰富的模型、材质与动画</li><li>更自然的课程讲解</li><li>学生原创地图编辑能力</li><li>更完整的作品保存与展示</li><li>教师端与课堂管理功能</li></ul></div>
    </div>
  </div>
</section>

<section class="slide split light" data-layout="SWISS-CLOSING-ASCII" data-animate="split-statement">
  <div class="canvas-card"><div class="split-half">
    <div class="half b-accent" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between;position:relative;overflow:hidden"><canvas class="ascii-bg" aria-hidden="true"></canvas><div class="chrome-min" style="margin-bottom:0;position:relative;z-index:1"><div class="l">12 / 12</div><div class="r">CLOSING</div></div><div data-anim="manifesto" style="display:flex;flex-direction:column;gap:2vh;position:relative;z-index:1"><div class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em">THE SIMPLE PROMISE</div><h2 style="font-size:min(6.2vw,11vh);line-height:.95;letter-spacing:-.025em;font-weight:200;color:#fff">先让一条指令<br/><span style="font-style:italic;font-weight:300">跑起来</span>。</h2><div style="font-size:max(18px,1.08vw);line-height:1.6;color:rgba(255,255,255,.82);font-weight:400;max-width:34ch">再让学生看懂，它为什么成功，又为什么失败。</div></div><div data-anim="signature" style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh;position:relative;z-index:1"><div class="t-meta" style="color:rgba(255,255,255,.62)">Signal Runner</div><div class="t-meta" style="color:rgba(255,255,255,.62)">3D Prototype</div></div></div>
    <div class="half" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between"><div class="chrome-min"><div class="l">LIVE DEMO</div><div class="r">03 STEPS</div></div><ul data-anim="rules" class="takeaway-list">
      <li><div class="num">01</div><div><h3>先故意失败</h3><p>在起点直接执行 collect()，让系统给出具体错误日志。</p></div></li>
      <li><div class="num">02</div><div><h3>根据日志修改</h3><p>加入两个 move()，解释为什么必须先到达正确位置。</p></div></li>
      <li style="border-bottom:2px solid var(--accent)"><div class="num" style="color:var(--accent)">03</div><div><h3 style="color:var(--accent)">再次运行成功</h3><p>位置从 (1,2) 变为 (3,2)，信标从 0/1 变为 1/1。</p></div></li>
    </ul><div data-anim="foot" class="t-meta" style="text-align:right">→ END · THANK YOU</div></div>
  </div></div>
</section>`;

const markerStart = template.indexOf("<!-- SLIDES_HERE");
const markerEnd = template.indexOf("\n</div>\n\n<div id=\"nav\">", markerStart);
if (markerStart < 0 || markerEnd < 0) throw new Error("Unable to locate slide insertion region in Swiss template");

let html = template.slice(0, markerStart) + slides + template.slice(markerEnd);
html = html.replace("<title>[必填] 替换为 PPT 标题 · Deck Title</title>", "<title>Signal Runner · 让第一段代码在 3D 世界里跑起来</title>");
html = html.replace('src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"', 'src="./assets/lucide.min.js"');
html = html.replace("</head>", `${extraCss}\n</head>`);
mkdirSync(assetsDir, { recursive: true });
copyFileSync("/Users/jack/.codex/skills/guizang-ppt-skill/assets/motion.min.js", new URL("motion.min.js", assetsDir));
copyFileSync("/Users/jack/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/umd/lucide.min.js", new URL("lucide.min.js", assetsDir));
writeFileSync(outputPath, html, "utf8");
