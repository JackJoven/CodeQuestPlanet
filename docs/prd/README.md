# 产品需求文档索引

当前主项目是 `signal-runner-node`。旧 L0/L1/L2 课程门户和历史 PRD 已归档到 `archive/legacy-course-platform/`，不再作为主线继续开发。

## 本轮新规划

| 版本 | 文件 | 说明 |
|---|---|---|
| v1.8 | [知识点驱动的 32 课游戏机制](../../.scratch/core-32-learning-mechanics-v18/PRD.md) | 本轮修改规格；证据基础和第 19 课参数技术样板已实现，其余 31 课待逐课改造，课堂学习效果待验证。 |
| v1.8 交接 | [试玩与下一步操作](../../.scratch/core-32-learning-mechanics-v18/NEXT_STEPS.md) | 第 19 课试玩、工程接口、剩余 31 课工单与可复制的实现/审查指令；下一项为第 17 课。 |
| v1.8 实施 | [实施顺序与逐课完成表](../../.scratch/core-32-learning-mechanics-v18/IMPLEMENTATION_PLAN.md) | 先修证据与判定、建立地形基础，再以第 19 课高低码头为完整样板；按依赖逐课修改，技术与课堂状态分开记录。 |
| v1.8 关卡 | [地形、机关与 32 课关卡设计](../../.scratch/core-32-learning-mechanics-v18/LEVEL_DESIGN.md) | 台阶已用于第 19 课；传送/开关有运行基础，课程接入待完成；其他新机关按课实施，同时验收知识点匹配、可解释运行与任务新鲜感。 |
| 新版审查 | [v1.7 实现的 32 课教学审查](../../.scratch/core-32-v17-audit-2026-09-16/REVIEW.md) | 2026-09-16 审查：原有测试通过，但后半程存在概念操作缺失、故障与诊断不符、迁移重复及掌握判定问题，作为 v1.8 修改依据。 |
| v1.7 | [32 课游戏化递进课程](../../.scratch/core-32-game-first-v17/PRD.md) | 历史实现基线。游戏化界面和路线运行已落地；“课程机制完整”的判断由本轮审查修正，不能用原有测试通过推断教学验收完成。 |
| v1.6 | [前 32 课编程思维课程重规划](../../.scratch/core-32-programming-thinking-v16/PRD.md) | 上一版实现基准。保留知识顺序与运行能力；其中第 13 课直接切换代码编辑器的呈现方式已被 v1.7 替代。 |
| 配套审查 | [原 32 课课程与关卡审查](../../.scratch/core-32-programming-thinking-v16/REVIEW.md) | 对照实际课程数据和运行代码，逐课说明保留、重做、移动与拆分，并记录验证结果。 |

## 现有基线与历史版本

| 版本 | 文件 | 说明 |
|---|---|---|
| v1.5 | [iCode × Swift Playgrounds 融合课程体系](v1.5-codequestplanet-icode-swift-integrated-curriculum.md) | 现有共同核心开发的历史基线，含 32 节核心与双分支规划。当前实现与该文档存在差异，见本轮审查；不以文档中的规划推断功能已完成。 |
| v1.4 | `v1.4-codequestplanet-icode-swift-integrated-curriculum.md` | v1.5 的前版。融合 iCode 与 Swift Playgrounds，采用 32 节共同核心加算法/创作双分支的课程体系。 |
| v1.3 | `v1.3-signal-runner-code-quest-creative-curriculum.md` | 上一版主课程。首次融合 iCode 知识点、课堂互动和学生创作关，已被 v1.4 的分支结构替代。 |
| v1.2 | `v1.2-signal-runner-standard-course-prd.md` | 48 节标准课基础版本。按完整任务包重新设计，不再按微知识点拆课。 |
| v1.1 | `v1.1-signal-runner-zero-to-algorithms-curriculum.md` | 旧版 72 节微课结构，粒度过细，已被 v1.2 替代。 |
| v1.0 | `v1.0-signal-runner-3d-programming-node.md` | 早期 6 节 3D 编程作品节点草案，已被后续标准课版本替代。 |
