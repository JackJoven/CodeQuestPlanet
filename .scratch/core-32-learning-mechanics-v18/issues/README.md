# v1.8 逐课工单入口

更新：2026-09-22。第 1–32 课已通过本地技术验收；课堂效果待试教。

**2026-09-19 产品修订优先适用：**保留原指令卡操作，默认构造与独立迁移两阶段；修复仅在知识点需要时必做。下面旧工单的修复/边界夹具继续用于工程验证，开工前需先裁剪学生流程，不能直接照搬旧三阶段能力门。详见 [PRD 第 2.3 节](../PRD.md)。

**现在从 01 工单（第 17 课）开始。** 学生仍按 1–32 学习；下表按工程依赖安排。一次交付一课，不批量复制模板。

ready-for-agent 表示可开工；needs-triage 表示先完成依赖并审查夹具。完成情况以 [实施表](../IMPLEMENTATION_PLAN.md) 为准，仓库没有另造 done 标签。

共用标准见 [工程交接](../ENGINEERING_HANDOFF.md)。第 19 课的 1/5/0 数值谓词不能复制给其他知识点。

| 工单 | 课次 / 核心能力 | 前置技术依赖 | 初始状态 |
|---|---|---|---|
| [01](01-lesson-17.md) | 17 变量更新 | 19 样板及 A/W 基础 | technical-acceptance-passed |
| [02](02-lesson-18.md) | 18 共享状态 | 第 17 课 | technical-acceptance-passed |
| [03](03-lesson-20.md) | 20 返回值 | 第 18 课 | technical-acceptance-passed |
| [04](04-lesson-21.md) | 21 列表遍历 | 第 20 课 | technical-acceptance-passed |
| [05](05-lesson-22.md) | 22 长度与索引 | 第 21 课 | technical-acceptance-passed |
| [06](06-lesson-23.md) | 23 按键查值 | 第 22 课 | technical-acceptance-passed |
| [07](07-lesson-25.md) | 25 二维数据映射 | 第 23 课 | technical-acceptance-passed |
| [08](08-lesson-26.md) | 26 数据批量生成 | 第 25 课 | technical-acceptance-passed |
| [09](09-lesson-27.md) | 27 对象职责 | 第 18 课、第 20 课 | technical-acceptance-passed |
| [10](10-lesson-28.md) | 28 实例独立状态 | 第 27 课 | technical-acceptance-passed |
| [11](11-lesson-29.md) | 29 协作交接 | 第 28 课 | technical-acceptance-passed |
| [12](12-lesson-30.md) | 30 时间与条件重查 | 第 29 课 | technical-acceptance-passed |
| [13](13-lesson-01.md) | 01 顺序执行 | 19 样板及 A/W 基础 | technical-acceptance-passed |
| [14](14-lesson-02.md) | 02 相对方向 | 第 1 课 | technical-acceptance-passed |
| [15](15-lesson-03.md) | 03 规划与成本 | 第 2 课 | technical-acceptance-passed |
| [16](16-lesson-04.md) | 04 首次偏离与调试 | 第 3 课 | technical-acceptance-passed |
| [17](17-lesson-05.md) | 05 坐标定位 | 第 4 课 | technical-acceptance-passed |
| [18](18-lesson-06.md) | 06 子任务与依赖 | 第 5 课 | technical-acceptance-passed |
| [19](19-lesson-07.md) | 07 规则与可解性 | 第 6 课 | technical-acceptance-passed |
| [20](20-lesson-09.md) | 09 定义与调用 | 19 样板及 A/W 基础 | technical-acceptance-passed |
| [21](21-lesson-10.md) | 10 调用约定 | 第 9 课 | technical-acceptance-passed |
| [22](22-lesson-11.md) | 11 完整循环单元 | 第 10 课 | technical-acceptance-passed |
| [23](23-lesson-12.md) | 12 循环作用范围 | 第 11 课 | technical-acceptance-passed |
| [24](24-lesson-13.md) | 13 if 真假 | 第 12 课 | technical-acceptance-passed |
| [25](25-lesson-14.md) | 14 布尔组合 | 第 13 课 | technical-acceptance-passed |
| [26](26-lesson-15.md) | 15 while 停止 | 第 14 课 | technical-acceptance-passed |
| [27](27-lesson-31.md) | 31 作品与测试 | 第 7 课、第 23 课、第 26 课、第 30 课 | technical-acceptance-passed |
| [28](28-lesson-08.md) | 08 阶段综合 | 第 1 课、第 2 课、第 3 课、第 4 课、第 5 课、第 6 课、第 7 课 | technical-acceptance-passed |
| [29](29-lesson-16.md) | 16 阶段综合 | 第 9 课、第 10 课、第 11 课、第 12 课、第 13 课、第 14 课、第 15 课 | technical-acceptance-passed |
| [30](30-lesson-24.md) | 24 阶段综合 | 第 17 课、第 18 课、19 样板、第 20 课、第 21 课、第 22 课、第 23 课 | technical-acceptance-passed |
| [31](31-lesson-32.md) | 32 阶段综合 | 第 24 课、第 26 课、第 27 课、第 28 课、第 29 课、第 30 课、第 31 课 | technical-acceptance-passed |

改共享语义的第 18/23/26–30 课、第 31 课和阶段作品需专门复核架构与教学；第 17 课的运行器扩展也需审查。模型价格不是验收标准。
