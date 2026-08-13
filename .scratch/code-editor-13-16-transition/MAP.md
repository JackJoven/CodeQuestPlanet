# 让第 13–16 课从指令卡进入真实 Python

**Type:** `wayfinder:map`  
**Status:** open

## Destination

形成一组足以交给 `$to-spec` 的完整决策：第 13 课开始让学生从指令卡过渡到以 Python 学生源代码直接驱动左侧 3D 世界的代码编辑模式；用第 13–16 课验证渐进开放、同步执行、错误反馈、能力门和学习证据，并把通过验证的规则推广到第 17–48 课。

## Notes

- 本地图只产出课程与系统决策，不直接实现生产代码。
- 每次继续地图前先读根目录 `CONTEXT.md`、本地图和当前课程实现。
- Grilling 任务使用 `$grilling` 与 `$domain-modeling`；原型任务使用 `$prototype`。
- 学生源代码是唯一执行源，代码模板只能向其中插入代码。
- 第 13–16 课继续采用“左侧 3D 世界、右侧学习与编程区”的游戏布局。
- 当前工作区已有大量未提交修改；地图任务不得整理或覆盖无关内容。

## Decisions so far

- [确定代码编辑模式的目的地与语言基础](issues/01-define-destination-language-and-authority.md) — 第 13–16 课验证 Python 代码编辑模式，并形成第 17–48 课可复用规则；学生源代码具有唯一执行权。
- [确定编辑器、起始程序与模板的关系](issues/02-define-editor-scaffolding-and-starter-program.md) — 使用渐进开放的真实编辑器、教学型 Python 子集和问题式起始程序，模板只向代码插入片段。
- [确定执行反馈、课程递进与学习证据](issues/03-define-execution-progression-and-evidence.md) — 代码行与 3D 世界同步运行，错误分类反馈；第 13–16 课依次验证 `if`、布尔组合、`while` 和综合迁移。
- [确定验收、帮助、语言界面与保存规则](issues/04-define-validation-help-language-and-saving.md) — 接受多种概念有效解，逐课撤离脚手架，采用中文教学加英文 Python，并自动保存关键代码版本。
- [定义第 13–16 课的具体挑战与 Python 学习接口](issues/05-define-four-lesson-briefs-and-python-api.md) — 四课分别采用条件透镜、安全控制台、循环监视器和能源搜救档案；统一使用返回布尔值的英文 `snake_case` 游戏函数，并以渐隐中文释义辅助英文学习。
- [选择浏览器内执行、编辑与保存架构](issues/06-choose-runtime-editor-and-persistence-architecture.md) — 本地 Skulpt 解析真实 Python，事件协议驱动 3D；轻量行号编辑器保存本机草稿与成功版本，登录完成记录附带代码证据。

## Route ahead

1. [定义第 13 课原型问题与推广门](issues/07-define-lesson-13-prototype-brief.md)
2. [制作第 13 课代码编辑黄金原型](issues/08-build-lesson-13-code-editor-prototype.md)
3. [验证原型并决定是否进入规格化](issues/09-validate-prototype-and-decide-spec-readiness.md)

## Not yet specified

- 第 13 课原型面对目标年龄学生时的自主完成与推广验收门槛。

## Horizon

- 第 17–48 课在验证后如何分阶段扩大 Python 语法与算法内容。
- 算法竞赛学习先以 Python 建立算法思维，再在独立桥接段引入 C++ 的时机和范围；不在本地图内改变第 13–16 课语言。

## Out of scope

- 在 Wayfinder 阶段直接重写或上线第 13–48 课。
- 重新设计第 1–12 课。
- 现在引入完整任意 Python 运行环境或 C++ 编译环境。
- 本轮详细设计算法竞赛课程、OJ 系统或赛事训练题库。
