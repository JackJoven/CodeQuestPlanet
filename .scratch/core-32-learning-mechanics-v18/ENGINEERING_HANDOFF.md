# v1.8 工程交接：在第 19 课样板上逐课扩展

日期：2026-09-22。产品约束以 [PRD.md](PRD.md) 和 [LEVEL_DESIGN.md](LEVEL_DESIGN.md) 为准；这里记录当前实际代码和接入方式。

## 1. 当前完成边界

| 范围 | 当前事实 |
|---|---|
| A 证据基础 | profile v7、任务语义指纹、提示暴露合并、旧掌握失效与档案、完成/掌握分离已接入；上传尾部执行和合法错误循环已修正 |
| W 地形基础 | 高度 0/1/2、相邻台阶、缺口、显式配对传送、闩锁开关/门的规则与测试已接入；样板有 3D 高度、台阶和俯视图。传送/开关的通用俯视图、首次教学交互留给第 5/6 课，不算完整课程已交付 |
| B 第 19 课 | 参数模型→可检查 Python→既有 Skulpt→事件播放→能力门；浏览器完成构造→一次独立迁移闭环，无必做修复或说明，详见验收文件 |
| C 第 17 课 | 原指令卡路线→计数规则→`try_collect()`/变量事件→`check_count()`/计数门→构造与独立迁移能力门；详见验收文件 |
| I/C 第 16、18、20 课 | 分区自动工坊综合证据、单一真值能量账本与有限补给、真实 return/调用结果分岔均完成构造和独立迁移；详见各课验收文件 |
| D/E/I 第 21–25 课 | 列表遍历、动态长度与索引、字典查询传送、库存调度和二维表重建均完成；地图依次为 S 形岛链、四指梳形港、八角水院环、H 形仓库和阶梯楔形蓝图 |
| E/F 第 26–28 课 | 数据批量建桥、对象职责和实例独立状态均完成；地图依次为对向峡湾、塔楼/月牙港和双 C 仓库 |
| F/H/I 第 29–32 课 | 同格守恒交接、压力板留守、停靠/占用条件重查、三类作品测试与五模块综合均完成；详见逐课验收文件 |
| 云端 | 进度接口上限为 512 KiB；其他 JSON 接口保持 64 KiB。合并函数和请求体边界有测试，真实登录、多设备和线上数据库联调尚待做 |
| 教学效果 | 未做真实学生试教，未验收整课时长 |

当前工作区有本轮及更早的未提交文件。先看 `git status`，保留已有修改；不要重置或批量覆盖，也不要触碰无关的 `cloudflare-pages-redirect/`、历史审查和 `docs/design/`。

## 2. 实际文件分工

| 文件（相对项目根目录） | 职责 |
|---|---|
| `signal-runner-node/structured-lessons.js` | 1–32 课的适配器注册表；当前注册 1–32；重复课号或缺方法会报错 |
| `state-lesson.js`、`state-lesson-ui.js` | 第 17 课地图、学生规则/卡片模型、Python、评估、证据、计数状态与原卡片界面；内容版本 `1.8-17.1` |
| `parameter-lesson.js` | 第 19 课地图、学生模型、Python 生成、真实运行、评估、证据和注册；内容版本 `1.8-19.5` |
| `parameter-lesson-ui.js` | 右侧短文案、原指令卡渲染、参数页签/调用卡片、运行状态、折叠俯视图/代码/证据 |
| `advanced-lessons.js`、`advanced-lessons-ui.js` | 第 16、18、20 课地图、程序模型、真实 Python、评估、版本化证据与原卡片界面 |
| `data-lessons.js`、`data-lessons-ui.js` | 第 21–25 课清单/字典/库存/二维表模型、宽幅地图、真实 Python、评估与原卡片界面 |
| `systems-lessons.js`、`systems-lessons-ui.js` | 第 26–28 课数据建桥、对象职责、实例状态模型，三种宽幅地图、真实 Python、评估与原卡片界面 |
| `collaboration-lessons.js`、`collaboration-lessons-ui.js` | 第 29–32 课同格交接、平台时间、作品测试包、阶段综合、四种宽幅地图与原卡片界面 |
| `learning-evidence.js` | 语义指纹、提示记录及合并；第 17、19 课分别使用 `stateGate`、`parameterGate`，不能跨课套用 |
| `world-rules.js` | v1.8 地形校验、连通和落点规则；不负责 UI，也不替学生选择动作 |
| `python-runtime-core.js` | 既有教学 Python 子集、世界动作、变量/函数/条件/循环事件；v1.8 增加 range 输入、正常函数结束、第 17 课计数动作、第 21–25 课数据事件，以及第 28 课对象充能事件 |
| `early-lessons.js` | 旧课程兼容、profile v7、课程分流、迁移和云端证据合并 |
| `app.js` | 共用事件播放、暂停、单步、复位、保存、3D；新课应经适配器接入，避免继续堆课号分支 |
| `early-lesson-ui.js` | 旧课界面；静态计划不再冒充实际运行证据 |
| `early-lessons.css` | 共用课程与第 17、19 课样式；沿用项目主题 |
| `scripts/test-learning-v18.mjs` | 真实 Skulpt、证据门、地形、请求体及生产播放函数的回归场景 |
| `scripts/test-data-lessons-v18.mjs` | 第 21–25 课构造/迁移、典型误解、边界、宽幅地图与原卡片 UI 回归 |
| `scripts/test-systems-lessons-v18.mjs` | 第 26–28 课构造/迁移、桥长/偏移、能力错误、别名状态与三种地图轮廓回归 |

注册脚本顺序：`world-rules`、`learning-evidence`、`structured-lessons` 在课程模块之前；课程模块及其 UI 在 `early-lessons`/`app` 使用之前。新课通常增加 `state-lesson.js`、`state-lesson-ui.js` 这类清晰命名文件，并在 `index.html` 接入。

## 3. 课程适配器契约

```js
CodeQuestStructuredLessons.register(17, {
  revision: '1.8-17.1',
  mission, draft, source, compile, assess, record,
  reconcile, render, edit, feedback, reference
});
```

| 方法 | 输入和输出约定 |
|---|---|
| `mission(base,p)` | 由课次基础数据和 profile 构造世界；返回含 `lessonNo`、`contentRevision`、`grid`、`startOverride`、`startDir`、`early.v18=true` 的任务。首次进入内容版本时归档旧证据；按语义恢复提示；重新计算掌握 |
| `draft(p)` | 返回本任务的可序列化学生模型；可以初始化缺失槽，不得暗填正确答案。修复任务提供可运行坏方案 |
| `source(m,d)` | 只从当前世界和学生模型生成规范 Python；必要槽缺失时抛出可操作的中文提示；合法错误值必须生成程序并执行 |
| `compile(m,d)` | Promise 返回 `{source,events,finalState,error}`。复用 `CodeQuestPythonRuntime.create(...).compile(source)`；运行错误保留 `partialEvents/partialState`，不得另跑一份固定路线 |
| `assess(m,d,execution,assisted)` | 返回尝试记录；分开 `worldSuccess` 与本课核心结构有效的 `success`。从实际事件取证，不按字符串是否含关键字评分 |
| `record(p,attempt)` | 保存最近 12 次尝试、必要的持久能力证据和程序版本；修复前后必须是同一任务的两次实际运行 |
| `reconcile(p)` | 从有效、同版本、未受强提示影响的证据重新计算 `mastered`；用于合并后恢复 |
| `render(m,p,context)` | 返回 HTML；context 含 notice/storage/running/playback/state；学生输入必须转义。证据容器使用现有 `early-evidence-disclosure`/`early-review`/`early-mastery` 类，以便共用布局归位 |
| `edit(m,p,{action,field,value})` | 修改学生模型，返回 `{reset,notice}`。程序变化需复位播放；解释输入不应清除运行证据 |
| `feedback(m,p,attempt)` | 给出一条与实际缺口对应的下一步提示 |
| `reference(m,p)` | 可选参考方案的实际模型修改；调用路径必须先标记强帮助，不能取得独立证据 |

通用控件使用 `data-lesson-action`、`data-lesson-field` 和 `data-value`。`run`、`step`、`reset` 是播放器保留动作；其他动作交给 `edit`。阶段控件复用 `data-early-action="guided|repair|challenge|next|hint"`。参数课专用 CSS 名不应被当成其他课的数据协议；后续可以按实际复用需要整理样式。

历史适配器的可选 `.structured-program-overview` 会被 app 移到地图上方；第 19 课不输出该区域，左侧只保留 3D 地图。编程直接复用 `#operationPanel` 的 `#commandPalette`、`#programList`、`#programTabs` 与工具栏；`parameter-lesson-ui.builder` 提供卡片、函数定义和反馈。支持区移到操作区之后，其他内容全部在右侧。每个执行事件的 programStep 来自实际调用/源行与 program() 的对应关系。不能把计划序列当成已经发生的事件。

`running` 为真时禁用会修改程序/世界的控件；暂停时仍保持运行模型冻结，需要编辑先复位。共用播放器编译一次，自动每 420ms 播放一个事件，单步播放一个事件；达到事件尾部才记一次尝试。复位令牌使迟到的编译结果失效。

Skulpt 复用全局 builtins，**同一上下文内的编译必须串行**。不要在同一个 Sk 实例上用 Promise.all 同时编译不同课程。

## 4. 学生模型、程序、世界必须是一条链

第 19 课草稿模型为 `{binding,constant,commands:[{id,action,argument?}],selected,nextId,undo}`，动作是 move/left/right/collect/call。连接参数槽与每张独立图的 commands 初始为空；`authorCommands` 仅用于旧修复兼容/强帮助参考，不能用于默认导航。当前没有必做修复阶段。

`program()` 只从 commands 的实际顺序生成 Python 和可见步骤，调用共享一份函数定义；每个稳定命令 ID 映射为 `command-N`，函数内事件按 callId 归属同一条命令。选中、撤销等编辑器状态不混入程序证明。`edit` 的 add 在未选中时追加，select 选中后再 add 原位替换并清除选择，保持稳定命令 ID；remove/clear/undo 对应原工具。调用字段为 `argument-${id}`；最多 64 条，已满时仍允许替换，0 是合法实参。参数输入只改所属调用，不改其他卡片。

参数有效性按实际语义判定：两段各有一次从对应入口出发、读取本次实参、移动相同次数并到达目标的调用；返回和过桥允许额外调用。纯普通指令可以完成世界任务，但不能取得参数能力证明；无关位置上的装饰调用也不能绕过判定。recall/mismatch/connect 为可选帮助，保留学生构造的实验程序。`range-input` 保存真实表达式/值/绑定；`function-call/function-end` 用 callId 配对。

学生看见的函数体和运行器读取的函数体必须一致。不要通过 UI 做一个参数输入框，再在 `app.js` 按课号硬编码移动次数。不要用固定流程图冒充事件，更不要在点击运行前把不正确但合法的数值拦掉。

示例尝试记录的必要字段：

```text
id, at, lessonNo, contentRevision, fingerprint, challengeKey,
phase, independent, assisted, source, programModel, programVersion,
ruleVersion, worldSuccess, success, failure, events
```

每课可增加 calls、状态转移、数据访问或对象归属等证据。`events[].state` 是深拷贝快照；只保存所需字段控制体积，不能引用后来会变的运行对象。活动播放使用完整状态，保存档案可以压缩。当前第 19 课完整证明测试样本为 174,488 字节（不含历史档案）；历史档案按 `indexed-attempts-v1` 去重，同一实际尝试只保存一份完整轨迹，证明通过 `{attemptId}` 引用，recentAttemptIds 保留近期顺序；旧尝试不再重复混入当前版本列表。含多版档案的浏览器样本见最新验收记录；新课必须另测完整证据包，不要无限保存所有重试。

## 5. 内容版本和能力门

- 全局 profile 当前为 7。版本 1–6 的完成记录和旧作品保留在档案中，旧 mastered 不能直接继承。
- `contentRevision` 是课的语义版本。改程序含义、世界规则或评估标准时升版，修改纯文案通常不需升版。归档旧证据，不能仅换字符串后重用旧掌握。
- 指纹来自完整语义描述的稳定序列化：地图、起点/朝向、目标、能量、地形、输入、数据、对象、规则、限制和原始故障。不含标题、阶段编号和皮肤。新增决定执行的新字段必须纳入指纹并补“字段改变→指纹改变”的测试。
- 强提示按指纹保存，取最高等级及首次暴露时间。同图重编号、离开再回来、云端合并不能洗掉帮助；取得独立证据之后再看提示，不倒扣原先有效证据。
- 构造可以在帮助下完成；独立迁移须无强提示。仅有调试学习目标的课才把修复设为必做；此时需原始失败与同图修复证明。强提示污染后提供等价新任务。
- `completed` 表示做完过；`mastered` 每次由能力门重算。自由文字仅供教师查看，不能靠“非空”“带标点”自动升级。
- 第 19 课能力门：有效构造 + 一次不同语义任务上的独立迁移，使用与构造相同的函数规则；迁移须 phase=challenge、independent=true 且非微实验。修复、说明与第二次迁移不作为门槛，零步图是可选扩展。其他课按核心目标定义谓词。

云端合并时保存当前课进行中的模型与阶段，合并更早的提示暴露，替换播放器持有的 profile 引用；不能运行结束后写回已被替换的旧对象。跨版本不得 OR mastered/guided/repair。

## 6. 地形运行契约与尚未扩展的部分

```js
terrain = {
  version: '1.8',
  heights: {'2,1': 1}, // 省略为 0，值只能是 0/1/2
  stairs: [{from:{x:1,y:1},to:{x:2,y:1}}],
  portals: [{id:'P',from:{x:2,y:1},to:{x:5,y:1}}],
  switches: [{id:'S',at:{x:1,y:1}}],
  gates: [{id:'G',at:{x:5,y:1},switchId:'S'}]
};
```

台阶只连接相邻且相差一层的格子，沿边双向通行；一次 move 仍只消耗一步/一能量，不改变朝向。缺口不可走。v1.8 的 `teleport()` 必须在端点执行，完整校验落点后才移动，保留方向与物品，不自动触发第二次，不采集。未开盾的尖刺出口会安全拒绝，留在入口。`activate_switch()` 激活后门保持打开至复位。

成功的移动、转向、采集、上传、护盾、传送、开关各推进一拍；wait 自己推进一拍，条件读取不推进。失败不会继续执行后续动作；碰撞不移动/不扣能量。现有进入尖刺失败保持“已进入并扣移动能量”的语义，应在尖刺课程明确说明，不可套用交接原子失败规则。

move/turn/teleport 等事件含 `transition:{actor,from,to,tick,trigger}`，起止含坐标、高度和朝向；调用/行号在外层事件。地形不负责多对象行动分派。既有对象交接仍是**相邻格**旧语义，第 29 课规划要求**同会合格**，必须按新版本另做，不能以旧测试通过声称符合 v1.8。

当前尚未完成：通用机关俯视图及可访问说明、单向通道、转向盘、输送格、有限补给、检测站、可编程传送台、数据桥与 v1.8 多对象/压力板/升降台整合。按对应工单逐项加；每种新机关必须同时有规则、实际状态、3D/俯视图、事件和反例。不能给所有旧课直接附加 terrain 版本导致自动传送等旧语义改变。

## 7. 验证与交付

在项目目录执行：

```sh
npm test
npm run build
node signal-runner-node/server.mjs
```

当前主机没有全局 Node 时，使用 `NEXT_STEPS.md` 中的 Node 绝对路径分别执行 `scripts/test-python-runtime-core.mjs`、`scripts/test-early-lessons.mjs`、`scripts/test-learning-v18.mjs`、`scripts/build-site.mjs`、`scripts/verify-site-build.mjs`。

每课增加正常/错误/边界测试，并保留第 19 课和旧运行器回归。浏览器必须实际操作，不直接注入 mastered 或直接调用评估函数充当学生验收。默认完成构造与一次独立任务；有必做修复的课再验收原始失败、修改及解释。工程上仍验证合法错误和边界。检查刷新、同图帮助、复位、单步及自动结果。

`preview=1` 仅在 localhost/127.0.0.1/[::1] 或本地文件场景有效，正式站点仍须鉴权。不要为测试修改线上权限。当前服务器只在 loopback 监听，公开静态文件白名单不包含后端、点目录或 server.mjs。

输出 `lesson-XX-acceptance.md`，列明可复现输入、预期/实际、运行命令、浏览器结果、未验证内容；更新实施表。任务完成后再安排下一课。本文不授权部署，也不要求自动启动新的任务或代理。

## 第 19 课修订的保留要求

parameterStep 默认 route，保存可选 recall/mismatch/connect 实验与主任务的位置。parameterIntroEvidence 保存实际观察，practiceOnly 不授予整课完成。1.8-19.5 归档旧证据，空白程序使用原指令卡构造；连接参数槽之后直接进入距离参数迁移。旧修复记录只保留兼容与归档能力，不得重新接成强制步骤。保留原操作形式、左图右操作及简短说明。

后续 31 课先按 PRD 第 2.3 节裁剪学生流程。旧工单里的修复、解释、两次迁移要求属于此前规划，不能不加判断地变成每课必做步骤。正常/错误/边界仍是工程验收要求。
