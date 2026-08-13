# 让共同核心第 1–8 课真正可学

**Type:** `wayfinder:map`  
**Status:** open

## Destination

形成一组足以交给 `$to-spec` 的完整决策：以 v1.5 为课程基线，把共同核心第 1–8 课定义成八节真正不同、适合学生独立学习、可练习、可评测、可保存学习证据的标准课，并确定后续课程可复用的教学与运行架构。

## Notes

- 本地图只产出决策，不直接实现生产代码。
- 每个会话先读根目录 `CONTEXT.md`、相关课程 PRD 和本地图。
- Grilling 任务使用 `$grilling` 与 `$domain-modeling`；原型任务使用 `$prototype`。
- 讨论课程时使用“标准课、挑战单元、能力门、学习证据、知识讲解、分层提示”等项目语言。
- 当前工作区已有大量未提交内容；地图任务不得顺手整理或覆盖无关修改。

## Decisions so far

- [确定地图目的地与交付边界](issues/01-define-destination-and-delivery-boundary.md) — 地图交付第 1–8 课规格所需决策与可复用架构决策，实施留给后续流程。
- [确定唯一课程基线](issues/02-select-canonical-curriculum-baseline.md) — 采用 v1.5 的第 1–8 课顺序，并保留已确认的上传与传送安排。
- [确定自主学习标准课的产品形态](issues/03-define-self-directed-standard-lesson.md) — 以学生独立学习为主，每课约 60 分钟，系统内置完整知识讲解和情境补讲。
- [确定能力门与学习证据原则](issues/04-define-mastery-and-evidence-principles.md) — 掌握需要完成、迁移、调试和解释四类证据，采用软能力门和结构化回答。
- [确定技术与发布边界](issues/05-set-technical-and-rollout-boundaries.md) — 保留 3D 视觉世界，允许重做课程与运行内核；未完成的后续课程不再伪装成可学内容。
- [选择黄金标准课与验证方式](issues/06-select-gold-standard-lesson-and-validation.md) — 先以第 4 课“调试侦探社”制作原型，再由教师和目标年龄学生验证。
- [确定标准课共同骨架与差异原则](issues/07-define-common-lesson-skeleton-and-difference-rule.md) — 每课共享稳定学习骨架，但必须通过不同的核心思维活动或学习工具形成真实差异。
- [确定知识讲解与分层提示关系](issues/08-define-explanation-and-hint-relationship.md) — 先完整讲解，再对具体障碍提供情境补讲和逐级提示。
- [设计八节课的能力递进与独特学习机制](issues/09-design-eight-lesson-capability-progression.md) — 八课各引入一个核心能力，并以八种不同学习工具、逐项能力门和陌生任务迁移形成无重复的连续递进。
- [定义“调试侦探社”原型问题与验收条件](issues/10-define-gold-lesson-prototype-brief.md) — 原型验证学生能否独立用证据找到第一次偏离并迁移调试方法，且须同时通过学习、自主使用、证据和教师判断四道推广门。

## Not yet specified

- 黄金标准课原型可能暴露新的教学状态、学习证据或运行能力，目前无法提前准确拆分。
- 第 1–8 课验证完成后，哪些架构能力应立即推广到第 9–32 课，需根据原型和数据模型的结论再界定。

## Out of scope

- 在 Wayfinder 阶段直接实现或上线生产课程。
- 本轮重新设计或实现第 9–64 课的具体内容。
- 首页视觉重做、部署、账号管理和后台管理功能。
- XP、排行榜、公共星图、Remix、赛季与 AI 助教。
