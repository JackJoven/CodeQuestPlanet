import { readFileSync, writeFileSync } from "node:fs";

const templatePath = "/Users/jack/.codex/skills/guizang-ppt-skill/assets/template-swiss.html";
const outputPath = new URL("./index.html", import.meta.url);
const template = readFileSync(templatePath, "utf8");

const extraCss = String.raw`
<style>
  .h-statement{font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(8vw,14vh);line-height:.96;letter-spacing:-.035em}
  .stmt-anchor{font-family:var(--mono);font-size:14px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--text-helper)}
  .slide.dark .stmt-anchor{color:rgba(255,255,255,.62)}
  .timeline-h .th-node .dot{border-radius:0}
  .slide.dark .timeline-h .th-node .dot{background:var(--paper)}
  .slide.dark .timeline-h .th-node .yr{color:rgba(255,255,255,.58)}
  .slide.dark .timeline-h .th-node .name{color:var(--paper)}
  .slide.dark .timeline-h .th-node .desc{color:rgba(255,255,255,.68)}
  .slide.dark .timeline-h .th-node.accent .dot{background:var(--accent-bright)}
  .slide.dark .timeline-h .th-node.accent .yr,
  .slide.dark .timeline-h .th-node.accent .name{color:var(--accent-bright)}
  .loop-diagram{display:grid;grid-template-columns:5fr 7fr;gap:5vw;align-items:center;flex:1;min-height:0}
  .loop-steps{display:flex;flex-direction:column;gap:0}
  .loop-step{display:grid;grid-template-columns:4.5vw 1fr;gap:1.4vw;align-items:center;padding:1.5vh 0;border-top:1px solid var(--border-subtle)}
  .loop-step:last-child{border-bottom:1px solid var(--border-subtle)}
  .loop-step .n{font-family:var(--sans);font-size:min(3.8vw,6.8vh);font-weight:200;line-height:.9;color:var(--accent)}
  .loop-step h3{font-size:max(18px,1.35vw);font-weight:400;line-height:1.25;margin-bottom:.35vh}
  .loop-step p{font-size:16px;font-weight:400;line-height:1.45;color:var(--text-secondary)}
  .loop-visual{position:relative;height:49vh;display:grid;place-items:center}
  .loop-ring{width:min(30vw,48vh);height:min(30vw,48vh);border:1px solid var(--border-strong);border-radius:50%;position:relative}
  .loop-ring::before{content:"";position:absolute;inset:16%;border:1px dashed var(--grey-2);border-radius:50%}
  .loop-center{position:absolute;inset:34%;background:var(--accent);color:var(--accent-on);display:grid;place-items:center;text-align:center;font-family:var(--mono);font-size:max(14px,.9vw);font-weight:600;letter-spacing:.08em;line-height:1.5}
  .loop-node{position:absolute;width:7.2vw;min-width:108px;padding:1.1vh .8vw;background:var(--grey-1);font-size:16px;font-weight:500;line-height:1.25;text-align:center}
  .loop-node.a{top:-2%;left:50%;transform:translateX(-50%)}
  .loop-node.b{right:-12%;top:42%}
  .loop-node.c{bottom:-2%;left:50%;transform:translateX(-50%)}
  .loop-node.d{left:-12%;top:42%}
  .matrix-fill{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,1fr);gap:1.2vh .8vw;min-height:0}
  .matrix-cell{padding:1.6vh 1vw;display:flex;flex-direction:column;justify-content:space-between;min-height:0;background:var(--grey-1);color:var(--ink)}
  .slide.dark .matrix-cell{background:rgba(255,255,255,.07);color:var(--paper)}
  .matrix-cell .n{font-family:var(--mono);font-size:14px;font-weight:600;letter-spacing:.12em;color:var(--accent-bright)}
  .matrix-cell h3{font-size:max(17px,1.22vw);font-weight:400;line-height:1.18;letter-spacing:-.01em;margin-top:1.1vh}
  .matrix-cell p{font-size:16px;font-weight:400;line-height:1.4;color:var(--text-secondary);margin-top:.8vh}
  .slide.dark .matrix-cell p{color:rgba(255,255,255,.68)}
  .hero-stat-bottom{display:grid;grid-template-columns:auto 1fr auto;gap:2vw;align-items:end;border-top:1px solid rgba(127,127,127,.35);padding-top:1.6vh}
  .hero-stat-bottom .nb{font-family:var(--sans);font-size:min(6.4vw,11vh);font-weight:200;line-height:.82;color:var(--accent-bright)}
  .hero-stat-bottom .label{font-size:max(18px,1.3vw);font-weight:400;line-height:1.35}
  .hero-stat-bottom .gate{font-family:var(--mono);font-size:14px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;text-align:right;color:rgba(255,255,255,.62)}
  .brief-grid{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:1.2vh .9vw;flex:1;min-height:0;margin-bottom:4vh}
  .brief-card{padding:2vh 1.4vw;display:flex;flex-direction:column;justify-content:space-between;background:rgba(255,255,255,.07);color:var(--paper)}
  .brief-card .lucide{width:2vw;height:2vw;stroke-width:1.4;color:var(--accent-bright)}
  .brief-card h3{font-size:max(18px,1.45vw);font-weight:400;line-height:1.22;letter-spacing:-.01em}
  .brief-card p{font-size:16px;font-weight:400;line-height:1.5;color:rgba(255,255,255,.68);max-width:28ch}
  .system-diagram{display:grid;grid-template-rows:auto 1fr auto;gap:3vh;flex:1;min-height:0;margin-bottom:4vh}
  .system-head{display:grid;grid-template-columns:7fr 5fr;gap:4vw;align-items:end}
  .system-head h2{font-family:var(--sans),var(--sans-zh);font-size:min(5.8vw,10.2vh);font-weight:200;line-height:.98;letter-spacing:-.035em}
  .system-core{position:relative;height:34vh;display:grid;place-items:center}
  .sys-svg{width:68vw;height:34vh;overflow:visible}
  .sys-svg circle{fill:none;stroke-width:1.2}
  .sys-label{position:absolute;background:var(--paper);padding:.8vh 1vw;font-size:16px;font-weight:500;line-height:1.35;border-top:2px solid var(--accent)}
  .sys-label.core{left:50%;top:50%;transform:translate(-50%,-50%);background:var(--accent);color:var(--accent-on);border:0;text-align:center}
  .sys-label.middle{left:24%;top:28%}
  .sys-label.outer{right:18%;top:10%}
  .system-notes{display:grid;grid-template-columns:repeat(3,1fr);gap:2vw;border-top:1px solid var(--border-subtle);padding-top:1.8vh}
  .system-notes h3{font-size:max(18px,1.35vw);font-weight:400;line-height:1.25;margin-bottom:.7vh}
  .system-notes p{font-size:16px;font-weight:400;line-height:1.45;color:var(--text-secondary)}
  .duo-compare{min-height:0;margin-top:4.5vh;margin-bottom:4vh}
  .duo-compare .col-ttl{font-size:min(4.6vw,8.2vh)}
  .duo-compare .col-desc{font-size:18px;font-weight:400}
  .duo-compare .col-list li{font-size:16px;font-weight:400}
  .image-hero-body{padding-top:4.8vh}
  .slide.dark .chrome-min{color:rgba(255,255,255,.62)}
  @media (max-width:900px){
    .matrix-cell p,.brief-card p,.loop-step p,.system-notes p{font-size:14px}
    .matrix-cell h3,.brief-card h3{font-size:16px}
  }
</style>`;

const slides = String.raw`
<section class="slide accent hero" data-layout="SWISS-COVER-ASCII" data-animate="hero">
  <div class="canvas-card">
    <canvas class="ascii-bg" aria-hidden="true"></canvas>
    <div class="chrome-min"><div class="l">CodeQuestPlanet · Curriculum Field Note</div><div class="r">CQ · 26.08.07 · 01 / 18</div></div>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:2.6vh">
      <div data-anim="kicker" class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em">32 LESSONS · ONE LIVING WORLD</div>
      <h1 data-anim="title" style="align-self:center;font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(8vw,14vh);line-height:.94;letter-spacing:-.025em;color:#fff">把编程变成<br/>一场<span style="font-style:italic;font-weight:300">星际远征</span></h1>
      <div data-anim="bottom" style="display:grid;grid-template-rows:auto auto;gap:1.6vh;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh">
        <div data-anim="lead" class="lead" style="max-width:58ch;color:rgba(255,255,255,.86);font-weight:400">CodeQuestPlanet 前 32 节共同核心课程：从执行第一条指令，到搭建一个可发布的多对象世界。</div>
        <div style="display:flex;justify-content:space-between;align-items:end"><div class="t-meta" style="color:rgba(255,255,255,.6)">Project Overview · Swiss Edition</div><div class="t-meta" style="color:rgba(255,255,255,.6)">→ swipe / arrow keys</div></div>
      </div>
    </div>
  </div>
</section>

<section class="slide hero dark" data-layout="S03" data-animate="statement">
  <div class="canvas-card">
    <div class="chrome-min"><div class="l">01 · THE PREMISE</div><div class="r">02 / 18</div></div>
    <div style="flex:1;display:grid;grid-template-rows:1fr auto;gap:3vh">
      <h2 data-anim="statement" class="h-statement" style="align-self:center;max-width:12ch">不是把题做对。<br/>是让代码<br/><span style="color:var(--accent-bright)">改变世界。</span></h2>
      <div data-anim="anchor" style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh"><span class="stmt-anchor">Code becomes visible action</span><span class="stmt-anchor">World → Evidence → Creation</span></div>
    </div>
  </div>
</section>

<section class="slide light" data-layout="S22" data-animate="image-hero">
  <div class="canvas-card" style="padding:0;display:flex;flex-direction:column;overflow:hidden">
    <div data-anim="img" style="position:relative;flex:0 0 58%;overflow:hidden;background:var(--ink)">
      <img src="images/03-world-overview.webp" data-image-slot="s22-hero-21x9" alt="CodeQuestPlanet 星际学习世界总览" loading="eager" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 35%">
      <div class="chrome-min" style="position:absolute;top:0;left:0;right:0;color:rgba(255,255,255,.9);padding:5.6vh 5vw 0"><div class="l">02 · PRODUCT WORLD</div><div class="r">03 / 18</div></div>
      <div data-anim="title-block" style="position:absolute;left:5vw;top:11vh;background:var(--paper);padding:2.8vh 2.8vw;max-width:42vw"><div style="font-weight:200;font-size:min(5.2vw,9.2vh);line-height:1;letter-spacing:-.035em">代码不是答案<br/>而是世界规则</div></div>
    </div>
    <div data-anim="kpi" class="image-hero-body">
      <div style="max-width:48ch;font-size:max(18px,1.25vw);line-height:1.55;font-weight:400;color:var(--text-primary)">学生控制角色、观察状态、修复失败、设计关卡。每个编程概念都对应一个看得见的世界变化。</div>
      <div class="image-hero-stats" style="gap:2vw">
        <div style="display:flex;flex-direction:column;gap:.6vh"><div style="height:1px;background:var(--ink)"></div><div class="t-meta">CORE</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200">32</div><p class="body-sm">共同核心课程</p></div>
        <div style="display:flex;flex-direction:column;gap:.6vh"><div style="height:1px;background:var(--ink)"></div><div class="t-meta">CHAPTERS</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200">04</div><p class="body-sm">星系章节</p></div>
        <div style="display:flex;flex-direction:column;gap:.6vh"><div style="height:1px;background:var(--ink)"></div><div class="t-meta">BRANCHES</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200;color:var(--accent)">02</div><p class="body-sm">后续成长方向</p></div>
      </div>
    </div>
  </div>
</section>

<section class="slide light" data-layout="S17" data-animate="system-diagram">
  <div class="canvas-card">
    <div class="chrome-min"><div class="l">03 · PRODUCT SYSTEM</div><div class="r">04 / 18</div></div>
    <div class="system-diagram">
      <div data-anim="line" class="system-head"><h2>一个项目<br/>三层学习系统</h2><p class="t-body">世界负责让问题可见，运行引擎负责让思考可验证，课程与作品系统负责让成长可以被保存和展示。</p></div>
      <div data-anim="up" class="system-core">
        <svg class="sys-svg" viewBox="0 0 900 310" aria-hidden="true"><circle cx="450" cy="155" r="68" stroke="var(--accent)"/><circle cx="450" cy="155" r="118" stroke="var(--ink)" opacity=".55"/><circle cx="450" cy="155" r="150" stroke="var(--grey-2)"/></svg>
        <div class="sys-label core">可运行的<br/>任务世界</div><div class="sys-label middle">编程与调试引擎</div><div class="sys-label outer">课程 · 作品 · 成长档案</div>
      </div>
      <div class="system-notes"><div><h3>WORLD</h3><p>地图、角色、危险、能量与目标，让抽象概念变成具体任务。</p></div><div><h3>ENGINE</h3><p>指令编排、代码视图、单步、状态 HUD 与日志形成证据链。</p></div><div><h3>EVIDENCE</h3><p>任务卡、失败记录、阶段作品和发布结果沉淀为学习档案。</p></div></div>
    </div>
  </div>
</section>

<section class="slide dark" data-layout="S11" data-animate="timeline-walk">
  <div class="canvas-card">
    <div class="chrome-min"><div class="l">04 · CURRICULUM MAP</div><div class="r">05 / 18</div></div>
    <div style="flex:1;display:grid;grid-template-rows:auto 1fr auto;gap:3vh">
      <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh"><div class="t-meta">FOUR CHAPTERS · ONE PROGRESSION</div><h2 style="font-weight:200;font-size:min(5.8vw,10.2vh);line-height:.96;letter-spacing:-.035em">32 节，不是知识点堆叠</h2></div>
      <div class="timeline-h" data-anim="timeline"><div class="tl-row">
        <div class="th-node up accent"><span class="dot"></span><div class="label"><span class="yr">01—08</span><span class="name">启动远征</span><span class="desc">执行 · 空间 · 调试</span></div></div>
        <div class="th-node down"><span class="dot"></span><div class="label"><span class="yr">09—16</span><span class="name">危机应对</span><span class="desc">函数 · 控制结构</span></div></div>
        <div class="th-node up"><span class="dot"></span><div class="label"><span class="yr">17—24</span><span class="name">数据驱动</span><span class="desc">状态 · 类型 · 容器</span></div></div>
        <div class="th-node down"><span class="dot"></span><div class="label"><span class="yr">25—32</span><span class="name">重建星系</span><span class="desc">世界 · 多对象系统</span></div></div>
        <div class="th-node up accent"><span class="dot"></span><div class="label"><span class="yr">+16</span><span class="name">选择分支</span><span class="desc">算法 / 互动创作</span></div></div>
      </div></div>
      <div data-anim="foot" class="t-meta" style="display:flex;justify-content:space-between;color:rgba(255,255,255,.62)"><span>每 8 节形成一次能力门与阶段作品</span><span>执行者 → 建造者</span></div>
    </div>
  </div>
</section>

<section class="slide light" data-layout="S14" data-animate="loop-form">
  <div class="canvas-card">
    <div class="chrome-min"><div class="l">05 · LEARNING LOOP</div><div class="r">06 / 18</div></div>
    <div style="flex:1;display:grid;grid-template-rows:auto 1fr;gap:4vh">
      <div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh"><div class="t-meta">HOW STUDENTS LEARN</div><h2 style="font-weight:200;font-size:min(5.8vw,10.2vh);line-height:.96;letter-spacing:-.035em">学生不是看完，而是跑通</h2></div>
      <div data-anim="up" class="loop-diagram">
        <div class="loop-steps">
          <div class="loop-step"><div class="n">01</div><div><h3>观察任务</h3><p>读懂起点、目标、限制和危险。</p></div></div>
          <div class="loop-step"><div class="n">02</div><div><h3>预测结果</h3><p>先说出路线、状态与可能失败。</p></div></div>
          <div class="loop-step"><div class="n">03</div><div><h3>编写程序</h3><p>用指令组织计划，并看到文本代码。</p></div></div>
          <div class="loop-step"><div class="n">04</div><div><h3>运行验证</h3><p>单步观察世界、位置与状态变化。</p></div></div>
          <div class="loop-step"><div class="n">05</div><div><h3>调试解释</h3><p>根据日志修改，并留下学习证据。</p></div></div>
        </div>
        <div class="loop-visual"><div class="loop-ring"><div class="loop-center">EVIDENCE<br/>→ WORK</div><div class="loop-node a">观察 / 预测</div><div class="loop-node b">编程 / 运行</div><div class="loop-node c">调试 / 解释</div><div class="loop-node d">迁移 / 创作</div></div></div>
      </div>
    </div>
  </div>
</section>

<section class="slide light" data-layout="S22" data-animate="image-hero">
  <div class="canvas-card" style="padding:0;display:flex;flex-direction:column;overflow:hidden">
    <div data-anim="img" style="position:relative;flex:0 0 58%;overflow:hidden;background:var(--ink)"><img src="images/07-stage-01.webp" data-image-slot="s22-hero-21x9" alt="第一章启动远征星球地图" loading="eager" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 35%"><div class="chrome-min" style="position:absolute;top:0;left:0;right:0;color:rgba(255,255,255,.9);padding:5.6vh 5vw 0"><div class="l">CHAPTER I · LAUNCH</div><div class="r">07 / 18</div></div><div data-anim="title-block" style="position:absolute;left:5vw;top:11vh;background:var(--paper);padding:2.6vh 2.6vw;max-width:42vw"><div style="font-weight:200;font-size:min(5.2vw,9.2vh);line-height:1;letter-spacing:-.035em">第一章<br/>启动远征</div></div></div>
    <div data-anim="kpi" class="image-hero-body"><div style="max-width:48ch;font-size:max(18px,1.25vw);line-height:1.55;font-weight:400">从“会点按钮”走向“能在运行前预测终点和朝向，并用日志解释第一次错误”。</div><div class="image-hero-stats"><div><div style="height:1px;background:var(--ink)"></div><div class="t-meta">LESSONS</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200">08</div><p class="body-sm">执行、空间与调试</p></div><div><div style="height:1px;background:var(--ink)"></div><div class="t-meta">CREATION</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200">01</div><p class="body-sm">原创路线关卡</p></div><div><div style="height:1px;background:var(--ink)"></div><div class="t-meta">PROJECT</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200;color:var(--accent)">01</div><p class="body-sm">基础路线任务包</p></div></div></div>
  </div>
</section>

<section class="slide dark" data-layout="S15" data-animate="matrix-fill">
  <div class="canvas-card">
    <div class="chrome-min"><div class="l">CHAPTER I · LESSON MATRIX</div><div class="r">08 / 18</div></div>
    <div style="flex:1;display:grid;grid-template-rows:auto 1fr auto;gap:2.4vh;min-height:0">
      <div data-anim="line" style="display:flex;flex-direction:column;gap:1.2vh"><div class="t-meta">01—08 · EXECUTION / SPACE / DEBUGGING</div><h2 style="font-weight:200;font-size:min(4.8vw,8.5vh);line-height:.96">先看懂世界，再写第一段程序</h2></div>
      <div data-anim="up" class="matrix-fill">
        <article class="matrix-cell"><span class="n">01</span><h3>启动信号</h3><p>命令、顺序与运行</p></article><article class="matrix-cell"><span class="n">02</span><h3>方向不是视角</h3><p>朝向、前进与转向</p></article><article class="matrix-cell"><span class="n">03</span><h3>路线先于代码</h3><p>观察、分解与预测</p></article><article class="matrix-cell"><span class="n">04</span><h3>调试侦探社</h3><p>日志、单步与错误分类</p></article>
        <article class="matrix-cell"><span class="n">05</span><h3>星图坐标站</h3><p>坐标与对象位置</p></article><article class="matrix-cell"><span class="n">06</span><h3>多段任务顺序</h3><p>多目标与携带状态</p></article><article class="matrix-cell"><span class="n">07</span><h3>第一张原创路线</h3><p>规则、限制与测试</p></article><article class="matrix-cell"><span class="n">08</span><h3>陨石危机</h3><p>阶段作品与变式调试</p></article>
      </div>
      <div data-anim="up" class="hero-stat-bottom"><div class="nb">08</div><div class="label">学生能预测执行结果，定位错误步骤，并设计一张可试玩的基础路线。</div><div class="gate">ABILITY GATE 01<br/>基础导航模块</div></div>
    </div>
  </div>
</section>

<section class="slide light" data-layout="S22" data-animate="image-hero">
  <div class="canvas-card" style="padding:0;display:flex;flex-direction:column;overflow:hidden">
    <div data-anim="img" style="position:relative;flex:0 0 58%;overflow:hidden;background:var(--ink)"><img src="images/09-stage-02.webp" data-image-slot="s22-hero-21x9" alt="第二章危机应对星球地图" loading="eager" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 35%"><div class="chrome-min" style="position:absolute;top:0;left:0;right:0;color:rgba(255,255,255,.9);padding:5.6vh 5vw 0"><div class="l">CHAPTER II · CONTROL</div><div class="r">09 / 18</div></div><div data-anim="title-block" style="position:absolute;left:5vw;top:11vh;background:var(--paper);padding:2.6vh 2.6vw;max-width:42vw"><div style="font-weight:200;font-size:min(5.2vw,9.2vh);line-height:1;letter-spacing:-.035em">第二章<br/>危机应对</div></div></div>
    <div data-anim="kpi" class="image-hero-body"><div style="max-width:48ch;font-size:max(18px,1.25vw);line-height:1.55;font-weight:400">学生开始把重复行为封装起来，让程序根据危险、障碍和未知距离自行做出选择。</div><div class="image-hero-stats"><div><div style="height:1px;background:var(--ink)"></div><div class="t-meta">LESSONS</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200">08</div><p class="body-sm">函数与控制结构</p></div><div><div style="height:1px;background:var(--ink)"></div><div class="t-meta">SYSTEM</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200">05</div><p class="body-sm">函数、for、if、逻辑、while</p></div><div><div style="height:1px;background:var(--ink)"></div><div class="t-meta">BOSS</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200;color:var(--accent)">01</div><p class="body-sm">能源危机任务包</p></div></div></div>
  </div>
</section>

<section class="slide dark" data-layout="S15" data-animate="matrix-fill">
  <div class="canvas-card"><div class="chrome-min"><div class="l">CHAPTER II · LESSON MATRIX</div><div class="r">10 / 18</div></div><div style="flex:1;display:grid;grid-template-rows:auto 1fr auto;gap:2.4vh;min-height:0"><div data-anim="line" style="display:flex;flex-direction:column;gap:1.2vh"><div class="t-meta">09—16 · FUNCTIONS / CONTROL FLOW</div><h2 style="font-weight:200;font-size:min(4.8vw,8.5vh);line-height:.96">让程序开始适应变化</h2></div><div data-anim="up" class="matrix-fill">
    <article class="matrix-cell"><span class="n">09</span><h3>组合一种新行为</h3><p>函数组合、命名与调用</p></article><article class="matrix-cell"><span class="n">10</span><h3>函数工厂</h3><p>定义、主程序与复用</p></article><article class="matrix-cell"><span class="n">11</span><h3>循环引擎</h3><p>重复模式与循环体</p></article><article class="matrix-cell"><span class="n">12</span><h3>次数、缩进与嵌套</h3><p>边界、层级与调试</p></article>
    <article class="matrix-cell"><span class="n">13</span><h3>危机判断室</h3><p>布尔值、if 与环境检测</p></article><article class="matrix-cell"><span class="n">14</span><h3>逻辑守卫</h3><p>else 与 and / or / not</p></article><article class="matrix-cell"><span class="n">15</span><h3>直到目标出现</h3><p>while、停止条件与死循环</p></article><article class="matrix-cell"><span class="n">16</span><h3>能源危机 Boss</h3><p>随机距离与危险状态</p></article>
  </div><div data-anim="up" class="hero-stat-bottom"><div class="nb">16</div><div class="label">学生能解释函数、for 与 while 的不同职责，并为未知环境写出停止条件。</div><div class="gate">ABILITY GATE 02<br/>控制结构任务包</div></div></div></div>
</section>

<section class="slide light" data-layout="S22" data-animate="image-hero">
  <div class="canvas-card" style="padding:0;display:flex;flex-direction:column;overflow:hidden"><div data-anim="img" style="position:relative;flex:0 0 58%;overflow:hidden;background:var(--ink)"><img src="images/11-stage-03.webp" data-image-slot="s22-hero-21x9" alt="第三章数据驱动远征星球地图" loading="eager" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 35%"><div class="chrome-min" style="position:absolute;top:0;left:0;right:0;color:rgba(255,255,255,.9);padding:5.6vh 5vw 0"><div class="l">CHAPTER III · DATA</div><div class="r">11 / 18</div></div><div data-anim="title-block" style="position:absolute;left:5vw;top:11vh;background:var(--paper);padding:2.6vh 2.6vw;max-width:44vw"><div style="font-weight:200;font-size:min(5.2vw,9.2vh);line-height:1;letter-spacing:-.035em">第三章<br/>数据驱动远征</div></div></div><div data-anim="kpi" class="image-hero-body"><div style="max-width:48ch;font-size:max(18px,1.25vw);line-height:1.55;font-weight:400">程序开始拥有记忆、类型与工具：记录状态、创建实例、传入参数、返回结果、处理整组目标。</div><div class="image-hero-stats"><div><div style="height:1px;background:var(--ink)"></div><div class="t-meta">LESSONS</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200">08</div><p class="body-sm">状态、类型与数据容器</p></div><div><div style="height:1px;background:var(--ink)"></div><div class="t-meta">CONCEPTS</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200">06</div><p class="body-sm">变量、类型、实例、参数、返回、数组</p></div><div><div style="height:1px;background:var(--ink)"></div><div class="t-meta">PROJECT</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200;color:var(--accent)">01</div><p class="body-sm">数据与函数任务包</p></div></div></div></div>
</section>

<section class="slide dark" data-layout="S15" data-animate="matrix-fill">
  <div class="canvas-card"><div class="chrome-min"><div class="l">CHAPTER III · LESSON MATRIX</div><div class="r">12 / 18</div></div><div style="flex:1;display:grid;grid-template-rows:auto 1fr auto;gap:2.4vh;min-height:0"><div data-anim="line" style="display:flex;flex-direction:column;gap:1.2vh"><div class="t-meta">17—24 · STATE / TYPES / CONTAINERS</div><h2 style="font-weight:200;font-size:min(4.8vw,8.5vh);line-height:.96">让程序记住、区分并组织世界</h2></div><div data-anim="up" class="matrix-fill">
    <article class="matrix-cell"><span class="n">17</span><h3>变量能量舱</h3><p>变量、常量与计数器</p></article><article class="matrix-cell"><span class="n">18</span><h3>多变量控制台</h3><p>更新、计算与状态依赖</p></article><article class="matrix-cell"><span class="n">19</span><h3>类型说明书</h3><p>类型、属性、方法与点语法</p></article><article class="matrix-cell"><span class="n">20</span><h3>初始化新成员</h3><p>实例、初始化与多实例</p></article>
    <article class="matrix-cell"><span class="n">21</span><h3>参数化工具</h3><p>形参、实参与多参数</p></article><article class="matrix-cell"><span class="n">22</span><h3>把结果交回来</h3><p>返回值与布尔函数</p></article><article class="matrix-cell"><span class="n">23</span><h3>有序任务清单</h3><p>数组、索引与遍历</p></article><article class="matrix-cell"><span class="n">24</span><h3>数组重构工坊</h3><p>增删、越界与重构</p></article>
  </div><div data-anim="up" class="hero-stat-bottom"><div class="nb">24</div><div class="label">学生能区分类型与实例、参数与返回值，并用数组重构多目标程序。</div><div class="gate">ABILITY GATE 03<br/>数据与函数任务包</div></div></div></div>
</section>

<section class="slide light" data-layout="S22" data-animate="image-hero">
  <div class="canvas-card" style="padding:0;display:flex;flex-direction:column;overflow:hidden"><div data-anim="img" style="position:relative;flex:0 0 58%;overflow:hidden;background:var(--ink)"><img src="images/13-stage-04.webp" data-image-slot="s22-hero-21x9" alt="第四章重建星系地图" loading="eager" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 35%"><div class="chrome-min" style="position:absolute;top:0;left:0;right:0;color:rgba(255,255,255,.9);padding:5.6vh 5vw 0"><div class="l">CHAPTER IV · WORLD SYSTEMS</div><div class="r">13 / 18</div></div><div data-anim="title-block" style="position:absolute;left:5vw;top:11vh;background:var(--paper);padding:2.6vh 2.6vw;max-width:42vw"><div style="font-weight:200;font-size:min(5.2vw,9.2vh);line-height:1;letter-spacing:-.035em">第四章<br/>重建星系</div></div></div><div data-anim="kpi" class="image-hero-body"><div style="max-width:48ch;font-size:max(18px,1.25vw);line-height:1.55;font-weight:400">学生不再只控制一个角色，而是用数据描述地图、组合组件、协调多个对象，并发布可验证的世界。</div><div class="image-hero-stats"><div><div style="height:1px;background:var(--ink)"></div><div class="t-meta">LESSONS</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200">08</div><p class="body-sm">世界建模与多对象系统</p></div><div><div style="height:1px;background:var(--ink)"></div><div class="t-meta">CREATION</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200">01</div><p class="body-sm">数据驱动原创关卡</p></div><div><div style="height:1px;background:var(--ink)"></div><div class="t-meta">GRADUATION</div><div class="kpi-hero" style="font-size:min(4.6vw,7.6vh);font-weight:200;color:var(--accent)">01</div><p class="body-sm">共同核心毕业世界</p></div></div></div></div>
</section>

<section class="slide dark" data-layout="S15" data-animate="matrix-fill">
  <div class="canvas-card"><div class="chrome-min"><div class="l">CHAPTER IV · LESSON MATRIX</div><div class="r">14 / 18</div></div><div style="flex:1;display:grid;grid-template-rows:auto 1fr auto;gap:2.4vh;min-height:0"><div data-anim="line" style="display:flex;flex-direction:column;gap:1.2vh"><div class="t-meta">25—32 · WORLD MODELING / MULTI-OBJECT</div><h2 style="font-weight:200;font-size:min(4.8vw,8.5vh);line-height:.96">从控制角色，到搭建系统</h2></div><div data-anim="up" class="matrix-fill">
    <article class="matrix-cell"><span class="n">25</span><h3>名字对应规则</h3><p>字典、键值与查找</p></article><article class="matrix-cell"><span class="n">26</span><h3>地图是一张表</h3><p>二维数组与坐标转换</p></article><article class="matrix-cell"><span class="n">27</span><h3>世界建造者</h3><p>放置、移除与世界生成</p></article><article class="matrix-cell"><span class="n">28</span><h3>类与组件</h3><p>组合与职责边界</p></article>
    <article class="matrix-cell"><span class="n">29</span><h3>飞船协作战</h3><p>多对象、状态与能力边界</p></article><article class="matrix-cell"><span class="n">30</span><h3>等待与同步</h3><p>时序、等待与对象冲突</p></article><article class="matrix-cell"><span class="n">31</span><h3>数据驱动关卡</h3><p>Schema、限制与可解性</p></article><article class="matrix-cell"><span class="n">32</span><h3>重新连接</h3><p>发布多对象协作世界</p></article>
  </div><div data-anim="up" class="hero-stat-bottom"><div class="nb">32</div><div class="label">学生能用数据描述世界、说明对象协作时序，并通过他人试玩验证作品。</div><div class="gate">CORE GRADUATION<br/>个人星际档案</div></div></div></div>
</section>

<section class="slide hero light" data-layout="S08" data-animate="duo-mirror">
  <div class="canvas-card"><div class="chrome-min"><div class="l">06 · CAPABILITY SHIFT</div><div class="r">15 / 18</div></div><div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh"><div class="t-meta">LESSON 01 → LESSON 32</div><h2 style="font-weight:200;font-size:min(5.8vw,10.2vh);line-height:.96;letter-spacing:-.035em">32 节，完成一次身份跃迁</h2></div><div class="duo-compare">
    <div class="col" data-anim="left"><div class="col-tag"><span class="num">01</span>ENTRY</div><h3 class="col-ttl">执行者</h3><p class="col-desc">看懂一张地图，按顺序放入几条指令，解释为什么必须先到达目标再行动。</p><ul class="col-list"><li>顺序与方向</li><li>第一次预测</li><li>第一次空采集失败</li><li>第一张任务卡</li></ul></div><div class="vrule"></div>
    <div class="col accent" data-anim="right"><div class="col-tag"><span class="num">32</span>GRADUATION</div><h3 class="col-ttl">世界建造者</h3><p class="col-desc">用数据和组件生成关卡，协调多个对象，通过测试与试玩证明世界规则有效。</p><ul class="col-list"><li>数据建模</li><li>组件与多对象</li><li>同步与冲突调试</li><li>可发布毕业世界</li></ul></div>
  </div></div>
</section>

<section class="slide dark" data-layout="S16" data-animate="field-notes">
  <div class="canvas-card"><div class="chrome-min"><div class="l">07 · LEARNING SCAFFOLDS</div><div class="r">16 / 18</div></div><div style="flex:1;display:grid;grid-template-rows:auto 1fr;gap:4vh;min-height:0"><div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh"><div class="t-meta">THE PRODUCT TEACHES WITH THE STUDENT</div><h2 style="font-weight:200;font-size:min(5.2vw,9.2vh);line-height:.96">项目不是播放器，是学习脚手架</h2></div><div data-anim="up" class="brief-grid">
    <article class="brief-card"><i data-lucide="map" class="lucide"></i><h3>3D 任务世界</h3><p>把路线、状态和对象关系变成可以观察的场景。</p></article><article class="brief-card"><i data-lucide="blocks" class="lucide"></i><h3>指令与代码双视图</h3><p>先组织行为，再逐步迁移到可读的文本代码。</p></article><article class="brief-card"><i data-lucide="step-forward" class="lucide"></i><h3>单步执行</h3><p>一次只看一条指令，定位第一次偏离预期的位置。</p></article>
    <article class="brief-card"><i data-lucide="gauge" class="lucide"></i><h3>状态 HUD</h3><p>位置、朝向、能量与目标完成度持续可见。</p></article><article class="brief-card"><i data-lucide="file-search" class="lucide"></i><h3>调试日志</h3><p>把失败从惩罚变成一条可以追溯的证据链。</p></article><article class="brief-card"><i data-lucide="folder-kanban" class="lucide"></i><h3>任务卡与作品</h3><p>保存预测、程序、失败、修改、结果与同伴反馈。</p></article>
  </div></div></div>
</section>

<section class="slide light" data-layout="S08" data-animate="duo-mirror">
  <div class="canvas-card"><div class="chrome-min"><div class="l">08 · AFTER THE CORE</div><div class="r">17 / 18</div></div><div data-anim="line" style="display:flex;flex-direction:column;gap:1.4vh"><div class="t-meta">ONE PAGE · TWO 16-LESSON BRANCHES</div><h2 style="font-weight:200;font-size:min(5.8vw,10.2vh);line-height:.96;letter-spacing:-.035em">32 节之后，能力开始分叉</h2></div><div class="duo-compare">
    <div class="col" data-anim="left"><div class="col-tag"><span class="num">A</span>ALGORITHM · 16</div><h3 class="col-ttl">自动路线规划器</h3><p class="col-desc">为喜欢逻辑、策略与算法的学生提供更深的搜索与优化路线。</p><ul class="col-list"><li>搜索、筛选与排序</li><li>递归、DFS 与 BFS</li><li>路径还原、权重与贪心</li><li>剪枝、缓存与算法毕业作品</li></ul></div><div class="vrule"></div>
    <div class="col accent" data-anim="right"><div class="col-tag"><span class="num">B</span>CREATION · 16</div><h3 class="col-ttl">星际创作者</h3><p class="col-desc">为喜欢游戏、故事与产品创作的学生提供图形、事件和交互路线。</p><ul class="col-list"><li>图形、文字与随机</li><li>触摸、事件与对象生命周期</li><li>声音、状态、多页面与组件</li><li>用户测试与互动毕业作品</li></ul></div>
  </div></div>
</section>

<section class="slide split light" data-layout="SWISS-CLOSING-ASCII" data-animate="split-statement">
  <div class="canvas-card"><div class="split-half">
    <div class="half b-accent" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between;position:relative;overflow:hidden"><canvas class="ascii-bg" aria-hidden="true"></canvas><div class="chrome-min" style="margin-bottom:0;position:relative;z-index:1"><div class="l">18 / 18</div><div class="r">CLOSING</div></div><div data-anim="manifesto" style="display:flex;flex-direction:column;gap:2vh;position:relative;z-index:1"><div class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em">MANIFESTO</div><h2 style="font-size:min(5.8vw,10.2vh);line-height:.96;letter-spacing:-.025em;font-weight:200;color:#fff">先像玩家。<br/>再像工程师。<br/>最后成为<span style="font-style:italic;font-weight:300">创造者</span>。</h2><div style="font-size:max(18px,1.08vw);line-height:1.6;color:rgba(255,255,255,.82);font-weight:400;max-width:34ch">在玩中学编程，在创造中改变世界。</div></div><div data-anim="signature" style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh;position:relative;z-index:1"><div class="t-meta" style="color:rgba(255,255,255,.62)">CodeQuestPlanet</div><div class="t-meta" style="color:rgba(255,255,255,.62)">2026</div></div></div>
    <div class="half" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between"><div class="chrome-min"><div class="l">TAKEAWAYS</div><div class="r">03 RULES</div></div><div data-anim="rules" style="display:flex;flex-direction:column;gap:0">
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2vw;padding:2.4vh 0;border-top:1px solid var(--border-subtle)"><div style="font-weight:200;font-size:min(4.4vw,7.8vh);line-height:.9">01</div><div><h3 style="font-weight:400;font-size:max(18px,1.8vw);margin-bottom:.8vh">共同核心先打稳</h3><p style="font-size:16px;line-height:1.55;color:var(--text-secondary);font-weight:400">32 节建立所有学生都需要的编程、调试、数据与系统基础。</p></div></div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2vw;padding:2.4vh 0;border-top:1px solid var(--border-subtle)"><div style="font-weight:200;font-size:min(4.4vw,7.8vh);line-height:.9">02</div><div><h3 style="font-weight:400;font-size:max(18px,1.8vw);margin-bottom:.8vh">过程必须可见</h3><p style="font-size:16px;line-height:1.55;color:var(--text-secondary);font-weight:400">世界变化、单步状态和失败日志共同证明学生是如何学会的。</p></div></div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2vw;padding:2.4vh 0;border-top:1px solid var(--border-subtle);border-bottom:2px solid var(--accent)"><div style="font-weight:200;font-size:min(4.4vw,7.8vh);line-height:.9;color:var(--accent)">03</div><div><h3 style="font-weight:400;font-size:max(18px,1.8vw);color:var(--accent);margin-bottom:.8vh">作品就是学习结果</h3><p style="font-size:16px;line-height:1.55;color:var(--text-secondary);font-weight:400">从任务卡到毕业世界，学生不断留下可以运行、解释、展示和 Remix 的作品。</p></div></div>
    </div><div data-anim="foot" class="t-meta" style="text-align:right">→ END · THANK YOU</div></div>
  </div></div>
</section>`;

const markerStart = template.indexOf("<!-- SLIDES_HERE");
const markerEnd = template.indexOf("\n</div>\n\n<div id=\"nav\">", markerStart);
if (markerStart < 0 || markerEnd < 0) throw new Error("Unable to locate slide insertion region in Swiss template");

let html = template.slice(0, markerStart) + slides + template.slice(markerEnd);
html = html.replace("<title>[必填] 替换为 PPT 标题 · Deck Title</title>", "<title>CodeQuestPlanet · 32 节星际远征课程地图</title>");
html = html.replace("</head>", `${extraCss}\n</head>`);
writeFileSync(outputPath, html, "utf8");
