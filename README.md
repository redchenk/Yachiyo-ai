# 🌙 月见八千代 AI

跨平台虚拟主播应用，内置 Live2D 渲染，前后端分离架构。

## 项目结构

```
Yachiyo-ai/
├── backend/           # 后端 API 服务 (Node.js + Express)
│   ├── src/
│   │   ├── index.js   # 入口文件
│   │   └── api/       # REST API 路由
│   └── package.json
│
└── frontend/          # 前端界面 (Vue 3 + Vite)
    ├── src/
    │   ├── App.vue    # 主应用组件
    │   ├── api/       # API 客户端
    │   └── styles/    # 样式文件
    └── package.json
```

## 快速开始

### 1. 启动后端

```bash
cd backend
npm install
npm start
```

后端服务将在 http://localhost:3001 启动

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:5173 启动

## API 文档

### 健康检查
- `GET /api/health` - 检查服务状态

### 模型管理
- `GET /api/model/list` - 获取模型列表
- `GET /api/model/current` - 获取当前模型
- `POST /api/model/switch` - 切换模型

### 表情控制
- `GET /api/expression/list` - 获取可用表情
- `POST /api/expression/set` - 设置表情

### 动作控制
- `POST /api/motion/play` - 播放动作
- `POST /api/motion/stop` - 停止动作

### 配置管理
- `GET /api/config` - 获取配置
- `POST /api/config/update` - 更新配置

### WebSocket
- `/ws` - 实时消息推送

## 技术栈

- **后端**: Express + WebSocket
- **前端**: Vue 3 + Vite
- **Live2D**: PixiJS + live2d-display

## License

MIT
