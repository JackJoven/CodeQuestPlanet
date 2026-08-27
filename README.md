# CodeQuestPlanet

当前主项目是 `signal-runner-node`：一个面向学生的独立 3D 闯关式编程学习原型。

当前实现包含两条入口：

- `正式课程`：按 v1.3 的 48 节 Code Quest 创作型课程落地，使用阶段 -> 课次 -> 单课任务的多级入口。
- `Demo 节点`：保留原 6 关作品节点，用作交互和美术效果演示。

## 打开方式

### 本地预览

直接用 Edge / Chrome 打开：

```text
signal-runner-node/index.html
```

也可以打开根目录的 `index.html`，它会自动跳转到 CodeQuestPlanet。直接打开 `file://` 时只使用本机预览数据，不连接账号服务器。

### 测试真实账号和云端进度

复制环境变量并启动完整服务：

```sh
cp .env.example .env
docker compose up -d --build
```

然后访问：

```text
http://127.0.0.1:8088/
```

通过 HTTP/HTTPS 访问时，`localhost` 和 `127.0.0.1` 会正常请求同源的 `/api/auth/*` 与 `/api/progress`；只有 `file://` 才进入本地预览模式。线上测试地址为 `https://ebu.de5.net/`。

## 当前保留

- `signal-runner-node/`：主项目，包含 48 节正式课程数据、多级课程入口、保留 Demo、3D 小岛场景、指令编排、运行日志和作品卡。
- `docs/prd/`：当前 CodeQuestPlanet 主线 PRD。
- `archive/legacy-course-platform/`：旧 L0/L1/L2 静态课程门户、旧实验课页面和历史 PRD，仅作归档参考。

## 方向

后续开发以 CodeQuestPlanet 为主，不再继续扩展旧课程门户。
