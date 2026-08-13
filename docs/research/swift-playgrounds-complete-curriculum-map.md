# Swift Playgrounds 完整课程与关卡脉络

整理日期：2026-07-10  
用途：教师课程规划、学生学习路线说明、CodeQuestPlanet 原创课程设计参照

## 1. 先定义“全部内容”的范围

Swift Playgrounds 不是一套固定不变的单一课程。它至少包含四层内容：

1. Apple 核心编程谜题：`Get Started with Code`、`Learn to Code 1`、`Learn to Code 2`。
2. 进阶创作课程：原 `Learn to Code 3`，后更名为 `Blu's Adventure`。
3. Apple 教学体系：`Everyone Can Code Puzzles` 与 `Everyone Can Code Adventures`。
4. SwiftUI App 学习：`Get Started with Apps`、`Keep Going with Apps`、App Gallery、Extend Your App。

其中 App Gallery、第三方 Playground、硬件 Playground 会随版本、地区和时间变化，因此不存在一个永久固定的“全商店关卡总数”。本文件把可以形成稳定教学主线的 Apple 核心内容全部列出，并把动态内容单独标记。

本文件不复制 Apple 的课文、对白、插图、动画、完整题面或标准答案；它保留完整课程结构、关卡名称、知识点、能力目标和机制关系，足以用于课程研究与原创实现。

## 2. 一张图看懂完整学习路线

```text
零基础入口
  -> Get Started with Code
  -> Learn to Code 1
       Commands
       Functions
       For Loops
       Conditional Code
       Logical Operators
       While Loops
       Algorithms
  -> Learn to Code 2
       Variables
       Types
       Initialization
       Parameters
       World Building
       Arrays
  -> Blu's Adventure / 原 Learn to Code 3
       Coordinates and Graphics
       Touch Events
       Event Handlers
       Finale
  -> Get Started with Apps
       SwiftUI View / Text / Image / Modifier / Composition
  -> Keep Going with Apps
       State / Navigation / Shared Data / Layout
  -> 原创 App、游戏、模拟与项目展示
```

## 3. 核心谜题总量

按可核对的章节目录计算：

| 课程 | 章节 | 页面单元 | 其中章节导入 | 实作关卡 |
|---|---:|---:|---:|---:|
| Learn to Code 1 | 7 | 54 | 7 | 47 |
| Learn to Code 2 | 6 | 50 | 6 | 44 |
| 合计 | 13 | 104 | 13 | 91 |

`Get Started with Code` 是较新的入门入口，与上述基础章节存在重叠，不应再把重叠页面重复计算成一套全新的知识体系。

## 4. Learn to Code 1：完整页级目录

### 4.1 Commands：命令、顺序与调试

1. Introduction
2. Issuing Commands
3. Adding a New Command
4. Toggling a Switch
5. Portal Practice
6. Finding and Fixing Bugs
7. Bug Squash Practice
8. The Shortest Route

知识点：命令调用、顺序执行、位置与动作匹配、传送门、开关、阅读已有代码、发现错误、修复错误、比较路线长度。

能力递进：照做 -> 排序 -> 补充命令 -> 理解环境规则 -> 调试 -> 优化路线。

### 4.2 Functions：函数与分解

1. Introduction
2. Composing a New Behavior
3. Creating a New Function
4. Collect, Toggle, Repeat
5. Across the Board
6. Nesting Patterns
7. Slotted Stairways
8. Treasure Hunt

知识点：组合已有命令、定义函数、调用函数、命名、复用、分解问题、在主程序中组织多个子任务、函数与循环配合。

### 4.3 For Loops：确定次数循环

1. Introduction
2. Using Loops
3. Looping All the Sides
4. To the Edge and Back
5. Loop Jumper
6. Branch Out
7. Gem Farm
8. Four Stash Sweep

知识点：识别重复模式、`for` 循环、固定次数、循环体、循环边界、循环与函数、嵌套结构、用更少代码表达更长行为。

### 4.4 Conditional Code：条件分支

1. Introduction
2. Checking for Switches
3. Using else if
4. Looping Conditional Code
5. Conditional Climb
6. Defining Smarter Functions
7. Boxed In
8. Decision Tree

知识点：布尔条件、`if`、`else if`、条件与循环组合、环境检测、让函数适应变化、分支决策树。

### 4.5 Logical Operators：逻辑运算

1. Introduction
2. Using the NOT Operator
3. Spiral of NOT
4. Checking This AND That
5. Checking This OR That
6. Logical Labyrinth

知识点：`!`、`&&`、`||`，否定条件、同时满足、至少满足一个、组合多个环境信号、布尔表达式阅读。

### 4.6 While Loops：未知次数循环

1. Introduction
2. Running Code While...
3. Creating Smarter While Loops
4. Choosing the Correct Tool
5. Four by Four
6. Turned Around
7. Land of Bounty
8. Nesting Loops
9. Random Rectangles
10. You're Always Right

知识点：`while`、停止条件、状态驱动重复、`for` 与 `while` 的选择、循环嵌套、随机环境、避免死循环、构造适应不同地图的程序。

### 4.7 Algorithms：通用算法

1. Introduction
2. The Right-Hand Rule
3. Adjusting Your Algorithm
4. Conquering a Maze
5. Which Way to Turn?
6. Roll Right, Roll Left

知识点：算法、伪代码、规则化解决问题、迷宫右手规则、根据失败调整算法、同一算法迁移到不同地图、比较多个可行方案。

## 5. Learn to Code 2：完整页级目录

### 5.1 Variables：变量与状态

1. Introduction
2. Keeping Track
3. Bump Up the Value
4. Incrementing the Value
5. Seeking Seven Gems
6. Three Gems, Four Switches
7. Checking for Equal Values
8. Round Up the Switches
9. Collect the Total

知识点：变量声明、初始值、赋值、递增、计数器、状态追踪、相等判断、用变量控制循环和条件。

### 5.2 Types：类型、属性与方法

1. Introduction
2. Deactivating a Portal
3. Portal On and Off
4. Setting the Right Portal
5. Corners of the World
6. Random Gems Everywhere

知识点：类型、实例、属性、方法、点语法、修改对象状态、用相同接口操作对象、随机生成和世界规则。

### 5.3 Initialization：初始化实例

1. Introduction
2. Initializing Your Expert
3. Train Your Expert
4. Using Instances of Different Types
5. It Takes Two

知识点：创建实例、初始化器、实例属性与方法、多实例协作、不同类型实例、对象之间的职责分工。

### 5.4 Parameters：带参数函数

1. Introduction
2. Moving Further Forward
3. Generalizing a Function
4. Crank Up and Down
5. Placing at a Specific Location
6. Rivers to Cross
7. Two Experts
8. Twin Peaks

知识点：形参与实参、用参数消除重复函数、整数参数、位置参数、多个参数、函数泛化、参数化建造、多个对象协作。

### 5.5 World Building：世界建造

1. Introduction
2. Uniting Worlds
3. Connect and Solve
4. Making Your Own Portals
5. Reach for the Stars / Reach for the Stairs
6. Floating Islands
7. Build a Loop
8. A Puzzle of Your Own

知识点：用代码创建世界、坐标、方块、楼梯、水域、传送门配对、世界合并、循环生成结构、设计原创谜题、测试别人能否完成。

说明：第 5 页在不同地区或版本资料中出现 `Reach for the Stars` 与 `Reach for the Stairs` 两种名称，应在目标版本的 Playground Book 中再次核对。

### 5.6 Arrays：数组、遍历与重构

1. Introduction
2. Storing Information
3. Iteration Exploration
4. Stacking Blocks
5. Getting in Order
6. Appending to an Array
7. Island Builder
8. Appending Removed Values
9. Fixing Array Out of Bounds Errors
10. Generate a Landscape
11. Randomized Lands
12. Another Way to Create an Array
13. The Art of the Array
14. World Creation

知识点：数组、元素、索引、零起始索引、遍历、数组中的对象、嵌套循环、`append`、`insert`、`remove`、越界错误、数组驱动生成、随机数据、重构和数据驱动世界。

## 6. Blu's Adventure：原 Learn to Code 3

这套课程从“控制角色解谜”转向“创建图形工具和交互作品”。旧教学资料把它称为 `Learn to Code 3`，后续版本改名为 `Blu's Adventure`。版本间章节拆分有变化，以下为可核对到的当前挑战名称。

### 6.1 Coordinates and Graphics

1. Coordinates and Graphics
2. Adding a Background
3. Placing Images
4. Placing Text
5. Cosmic Bus
6. Placing an Array of Images
7. Changing an Array

知识点：二维坐标、视图、图像和文字放置、背景、对象位置、数组批量生成图形、修改数组内容。

### 6.2 Touch Events

1. The Image Tool
2. Spacing Out Graphics
3. Moving and Erasing Graphics
4. Iterating Through an Array
5. Randomizing an Array
6. Going, Going, Gone
7. Placing Patterns
8. The Text Tool
9. Emoji Confetti
10. Interstellar Symmetry

知识点：触摸/点击位置、事件输入、根据输入创建对象、移动与移除、数组遍历、随机化、图案生成、文字工具、坐标对称。

### 6.3 Event Handlers

1. Creating a Tool
2. Creating More Tools
3. Creating Tools for Different Events
4. Touching a Graphic to Speak
5. Modifying a Graphic
6. Removing a Graphic
7. Responding to a Button
8. Playing Sounds
9. Playing Instruments
10. Soundboard

知识点：事件处理器、回调函数、不同事件类型、事件参数、图形命中、语音合成、按钮、声音、乐器和组合式交互工具。

### 6.4 Finale

最终部分要求综合坐标、数组、图形、触摸事件、事件处理器、文字与声音，完成开放式交互作品。旧版资料中还把 Strings 单独作为教学重点；新版挑战把字符串、文字和语音更多地融入工具与事件任务。

## 7. Everyone Can Code Puzzles：现行教师课程主线

这一层不是新增一套完全不同的游戏关卡，而是把 Learn to Code 谜题组织成约 45 小时、可直接用于课堂的教学方案。

| 章 | 主题 | 建议课时 | 核心学习结果 |
|---:|---|---:|---|
| 1 | Commands | 3 小时 | 精确命令、顺序、现实技术中的命令 |
| 2 | Functions | 3 小时 | 组合命令、定义与复用函数 |
| 3 | For Loops | 3.5 小时 | 识别模式、确定次数重复、提高效率 |
| 4 | Variables | 4 小时 | 存储和改变数据、变量驱动输出 |
| 5 | Conditional Code | 4 小时 | 布尔逻辑、变化条件下的决策 |
| 6 | Types and Initialization | 5 小时 | 类型、属性、方法、创建实例 |
| 7 | Functions with Parameters | 4 小时 | 通过参数让函数更灵活 |
| 8 | Logical Operators | 6 小时 | 多条件判断、NOT/AND/OR |
| 9 | While Loops | 4.5 小时 | 满足条件期间重复、停止条件 |
| 10 | Arrays and Refactoring | 5 小时 | 有序数据、遍历、重构和简化代码 |

贯穿项目：数字问答项目。学生逐章加入变量、条件、循环、函数和数组，并经历构思、构建、测试、用户反馈与重构。

## 8. Everyone Can Code Adventures：进阶项目课程

这套约 45 小时的课程承接 Puzzles，并组合 Blu's Adventure、Sensor Arcade、Sonic Workshop、Augmented Reality 等 Playground。

| 章 | 主题 | 建议课时 | 核心学习结果 |
|---:|---|---:|---|
| 1 | Coordinates | 3 小时 | 在视图中用坐标放置文字和图像 |
| 2 | Events and Handlers Part 1 | 3 小时 | 触摸事件、带参数函数、基本交互 |
| 3 | Arrays | 4 小时 | 数组方法、运算、嵌套循环、事件中的集合 |
| 4 | Events and Handlers Part 2 | 3 小时 | 事件参数、iPad 硬件输入 |
| 5 | Closures | 4 小时 | 把函数作为参数、闭包、增强事件响应 |
| 6 | Return Types and Outputs | 2 小时 | 函数返回值、把结果用于其他程序部分 |
| 7 | Classes and Components | 4 小时 | 类、组件、类型复习、组合创建新工具 |
| 8 | Design Patterns | 9 小时 | 游戏、模拟、模型、原型的程序架构 |
| 9 | Summative Projects | 10 小时 | 项目范围、工具选择、实现、解释与展示 |

涉及的进阶概念：设备传感器、加速度计、摄像头、触摸、音频、增强现实、事件驱动编程、闭包、返回值、类、组件化和设计模式。

## 9. SwiftUI App 学习主线

### 9.1 Get Started with Apps

核心内容：

1. 声明 SwiftUI `View`。
2. 放置 `Text` 与 `Image`。
3. 使用 modifier 修改样式与行为。
4. 用 `VStack`、`HStack`、`ZStack` 等组合视图。
5. 理解小视图组合成复杂界面的 composability。
6. 在 App Preview 中即时观察代码变化。

### 9.2 Keep Going with Apps

核心内容：

1. 使用状态管理数据和界面变化。
2. 状态变化时自动刷新 UI。
3. 在多个视图间导航。
4. 在视图间共享数据。
5. 使用 padding、spacer 和 alignment 管理布局。

### 9.3 App Gallery 与 Extend Your App

这两部分是动态样例库，不是固定关卡书：

- App Gallery：完整样例 App，带内置导览，可修改和个性化。
- Extend Your App：按功能拆分的扩展样例，例如手势、传感器输入、导航和其他 App 能力。
- 空白 App：从 SwiftUI 模板开始原创。
- 可继续加入 Swift 文件、图片、Swift Package、App 图标，并通过 App Store Connect 提交 App。

## 10. 完整知识依赖图

```text
命令与顺序
  -> 调试
  -> 函数与分解
  -> For 循环
  -> 条件与布尔值
  -> 逻辑运算
  -> While 循环与停止条件
  -> 通用算法
  -> 变量与状态
  -> 类型、属性、方法
  -> 初始化与多实例
  -> 参数化函数
  -> 坐标与世界建造
  -> 数组、索引、遍历、重构
  -> 图形与二维坐标
  -> 触摸事件
  -> 事件处理器与回调
  -> 字符串、文字、语音和音频
  -> 闭包与返回值
  -> 类与组件
  -> SwiftUI View 与 Modifier
  -> 状态、导航、共享数据和布局
  -> 独立 App / 游戏 / 模拟项目
```

## 11. Swift Playgrounds 真正值得复刻的教学逻辑

关卡名称不是最重要的资产，真正的产品逻辑是：

1. 每章先用动画或现实类比建立概念直觉。
2. 每页只引入一个主要变化，复用前页已经学过的工具。
3. 学生写真实代码，运行后立刻看到世界变化。
4. 先给有限命令和代码补全，逐步开放表达空间。
5. 同一目标允许多个正确答案，不把标准答案当作唯一思路。
6. 通过错误状态、动态提示和单步执行支持调试。
7. 从角色控制过渡到修改世界，再过渡到创建交互工具和 App。
8. 后期任务从封闭谜题转成开放项目，让学生设计、测试、解释和分享。

关卡的标准学习循环可以抽象为：

```text
概念导入
-> 观察环境
-> 明确目标
-> 预测方案
-> 编写代码
-> 即时运行
-> 查看逐步执行或错误反馈
-> 修改与重构
-> 迁移挑战
-> 开放创作
```

## 12. 对 CodeQuestPlanet 的直接启示

现有 48 课 PRD 已经覆盖顺序、调试、条件、循环、函数、变量、数据结构、搜索和路径算法，算法深度超过 Swift Playgrounds 核心谜题；目前相对薄弱的是 Apple 课程后半段的“创作与 App”链路。

建议保留项目自己的 48 课主线，同时吸收以下结构：

1. 前 16 课对标 Learn to Code 1/2 的渐进谜题，但使用原创世界、角色、地图和题面。
2. 第 17-24 课强化世界建造、坐标、数组驱动关卡和学生出题。
3. 增加“图形与交互”阶段：坐标、图像、文字、触摸、声音和事件处理。
4. 增加“作品工具箱”：状态、导航、共享数据、组件化和界面布局。
5. 毕业项目不只做算法规划器，还允许学生选择游戏、模拟、互动故事或工具 App。

不可照搬的部分：Byte/Blu 角色、Apple 关卡地图、原始题面、对白、动画、插图、音效、提示文本和源码实现。应当复刻知识递进、反馈机制和关卡范式，并为本项目重新设计原创内容。

### 12.1 Apple 课程与现有 48 课对照

| Apple 模块 | CodeQuestPlanet 对应课次 | 覆盖判断 | 后续动作 |
|---|---:|---|---|
| Commands + Debugging | 1-5 | 强覆盖 | 保留日志、单步和错误分类优势 |
| Functions + For Loops | 11-13 | 基本覆盖 | 增加从重复代码到函数抽象的连续谜题 |
| Conditional + Logical Operators | 9-12 | 基本覆盖 | 明确补齐 NOT/AND/OR 的独立变式 |
| While Loops | 12 | 偏薄 | 增加停止条件、死循环和 for/while 选择关卡 |
| Algorithms | 25-48 | 超出 Apple 基础深度 | 保留搜索、排序、图和路径作为项目特色 |
| Variables | 14-15 | 基本覆盖 | 增加相等比较、计数器和状态追踪连续任务 |
| Types + Initialization | 现 PRD 分散出现 | 结构性缺口 | 单列对象、类型、属性、方法和初始化任务包 |
| Parameters | 13、后续算法函数 | 部分覆盖 | 增加参数化移动、放置和多对象协作任务 |
| World Building | 17-24 | 部分覆盖 | 增加学生造世界、传送门配对和同伴试玩 |
| Arrays + Refactoring | 17-24 | 基本覆盖 | 补齐索引变化、越界、插入、删除和重构 |
| Coordinates + Graphics | 1-8 有坐标，无图形工具 | 一半覆盖 | 新增二维创作世界或编辑器模式 |
| Touch + Event Handlers | 无明确阶段 | 缺失 | 新增点击、拖动、按钮、声音和回调任务 |
| Closures + Return Values | 选修中零散 | 缺失 | 放入进阶创作课，不必过早进入主线 |
| Classes + Components | 无明确阶段 | 缺失 | 用角色、工具、传感器组件建立对象模型 |
| SwiftUI App | 无 | 缺失 | 作为算法主线之后的作品方向，而非替换 3D 主线 |

结论：CodeQuestPlanet 在“调试、数据结构和算法”上比 Apple 核心谜题更深入，但在“类型系统、事件驱动创作、组件化与 App 表达”上缺少一条连续教学线。最合理的方向不是把 48 课改成 Apple 副本，而是在现有算法主线后增加一个原创创作分支。

## 13. 当前资料覆盖状态与下一步核对

| 内容 | 当前覆盖状态 | 还需什么才能做到指定版本逐页一致 |
|---|---|---|
| Learn to Code 1 | 页级目录完整 | 用目标版本 Playground Book 核对本地化标题 |
| Learn to Code 2 | 页级目录完整 | 核对 World Building 第 5 页的地区版本名称 |
| Blu's Adventure | 主要挑战页完整 | 用目标版本核对 Finale 内部页和是否单列 Strings |
| Puzzles 教师主线 | 10 章、课时和目标完整 | 教师手册可补充课堂活动、评价量规和示例方案 |
| Adventures 教师主线 | 9 章、课时和目标完整 | 不同年份课程包可能调整 Playground 组合 |
| SwiftUI 两段教程 | 概念主线完整 | 下载教程后导出具体页面标题和代码任务 |
| App Gallery / Extend Your App | 已说明内容类型 | 必须在指定地区、指定 App 版本中现场盘点 |
| 第三方与硬件内容 | 不属于固定 Apple 核心关卡 | 需另建动态目录，按设备与发布者维护 |

这台 Mac 当前没有安装 Swift Playgrounds，也没有已下载的 `.playgroundbook`。因此本文件是“Apple 核心课程的完整稳定脉络”，不是声称看过某个指定版本中的每一段正文。安装应用并下载目标课程包后，可以继续生成机器可核对的逐页清单、概念标签和 CodeQuestPlanet 映射表。

## 14. 主要来源

- Apple Swift Playground 产品页：https://developer.apple.com/swift-playground/
- Apple Swift Playground 用户指南：https://support.apple.com/guide/playgrounds/welcome/mac
- Apple Learn to Code 说明：https://support.apple.com/guide/playgrounds/learn-to-code-itca964ba79c/mac
- Apple App Playground 说明：https://support.apple.com/guide/playgrounds/get-started-with-app-playgrounds-itc2b8af4df0/mac
- Apple Everyone Can Code Curriculum Guide：https://www.apple.com/education/docs/everyone-can-code-curriculum-guide.pdf
- Apple 2017 Swift Playgrounds Curriculum Guide：https://www.apple.com/in/education/docs/Swift_Playgrounds_Curriculum_Guide.pdf
- Apple Education 教学资源：https://education.apple.com/learning-center/T049791A-en_US
- Apple Developer Playground Books 文档：https://developer.apple.com/documentation/swift-playgrounds/playground-books
- 页级目录交叉核对：https://buildingrainbows.com/swift-playgrounds-videos/
