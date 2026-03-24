# 🌙 月见八千代 AI - 前端

全新重写的 Vue 3 + Vite 前端，确保能够正常运行。

## 技术栈

- **Vue 3** - 组合式 API
- **Vite** - 快速构建工具
- **PixiJS** - 2D 渲染引擎
- **live2d-display** - Live2D 模型渲染

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

前端将在 http://localhost:5173 启动

### 3. 确保后端运行

后端服务需要在 http://localhost:3001 运行

## 功能

- ✅ Live2D 模型渲染
- ✅ 表情控制
- ✅ 动作播放
- ✅ 模型切换
- ✅ WebSocket 实时通信
- ✅ 口型同步
- ✅ 日志输出

## API 代理

Vite 配置了代理，将请求转发到后端：
- `/api/*` → `http://localhost:3001/api/*`
- `/ws` → `ws://localhost:3001/ws`
- `/models/*` → `http://localhost:3001/models/*`

## 构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录
