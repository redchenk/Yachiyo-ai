# 八千代 AI 虚拟主播

🌸 内置 Live2D 渲染 · 全 API 可自定义 · 本地部署友好

![版本](https://img.shields.io/badge/版本-1.0.0-blue)
![许可证](https://img.shields.io/badge/许可证-MIT-green)

## ✨ 特性

- 🎭 **内置 Live2D 渲染** - 不依赖 VTube Studio，PixiJS + Cubism SDK 直接渲染
- 🤖 **多 LLM 支持** - Ollama / OpenAI / 通义千问 / 自定义端点
- 🎤 **语音交互** - Whisper STT + 自定义 TTS（CosyVoice/Fish Speech）
- 👁️ **视觉识别** - LLaVA / Qwen-VL 图片理解
- 🎮 **游戏集成** - Minecraft 机器人控制
- 🔌 **WebSocket API** - 实时双向通信
- 🏠 **完全本地化** - 所有组件可本地部署，无需云端 API

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
pip install -r requirements.txt
```

### 2. 配置

```bash
cp config/config.example.json config/config.json
# 编辑 config/config.json
```

### 3. 准备 Live2D 模型

```
models/yakumo/
├── yakumo.model3.json
├── yakumo.moc3
└── textures/
```

### 4. 启动

```bash
npm start
```

访问 http://localhost:3000 查看 Live2D 模型！

## 📦 架构

```
┌─────────────────────────────────────────────────────┐
│                   八千代 AI 系统                      │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │
│  │ Live2D  │  │  LLM    │  │  STT    │  │  TTS   │ │
│  │ 渲染器  │  │  大脑   │  │  识别   │  │  合成  │ │
│  │ (内置)  │  │ (可配置)│  │(Whisper)│  │(自定义)│ │
│  └─────────┘  └─────────┘  └─────────┘  └────────┘ │
│                      │                              │
│  ┌─────────┐  ┌──────┴──────┐  ┌────────────────┐  │
│  │  视觉   │  │   WebSocket │  │   Minecraft    │  │
│  │  (VL)   │  │    API      │  │     机器人     │  │
│  └─────────┘  └─────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 🔧 配置示例

### 完全本地部署（推荐）

```json
{
  "llm": {
    "provider": "ollama",
    "baseUrl": "http://localhost:11434",
    "model": "qwen2.5:72b-instruct"
  },
  "vision": {
    "provider": "ollama",
    "baseUrl": "http://localhost:11434",
    "model": "llava:latest"
  },
  "stt": {
    "provider": "faster-whisper",
    "model": "large-v3"
  },
  "tts": {
    "provider": "custom",
    "baseUrl": "http://localhost:5000"
  }
}
```

### 使用云端 API

```json
{
  "llm": {
    "provider": "qwen",
    "baseUrl": "https://dashscope.aliyuncs.com/api/v1",
    "apiKey": "YOUR_KEY",
    "model": "qwen-max"
  }
}
```

## 📚 文档

- [本地部署指南](LOCAL_SETUP.md) - 完整本地化配置
- [API 文档](API.md) - WebSocket 和 REST API
- [开发指南](DEVELOPMENT.md) - 开发和自定义

## 🎯 使用场景

1. **虚拟主播** - Live2D 模型 + AI 对话 + 语音交互
2. **游戏直播** - Minecraft 自动游玩 + 观众互动
3. **客服助手** - 图片识别 + 多轮对话
4. **个人伴侣** - 本地部署，隐私安全

## 🛠️ 技术栈

| 模块 | 技术 |
|------|------|
| Live2D | PixiJS + Cubism SDK |
| LLM | Ollama / OpenAI 兼容 |
| STT | Faster Whisper |
| TTS | CosyVoice / Fish Speech |
| Vision | LLaVA / Qwen-VL |
| MC | Mineflayer |
| Backend | Node.js + Express |
| Frontend | WebSocket + Canvas |

## 📝 待办

- [ ] 完善 Live2D 物理效果
- [ ] 添加更多预设表情和动作
- [ ] 支持多模型切换
- [ ] 添加 Web 控制界面
- [ ] 支持 OBS 插件

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 📄 许可证

MIT License
