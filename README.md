# 🌙 月见八千代 AI 虚拟主播

> 虚拟世界"月读"的管理员，辉夜姬八千年孤独后的未来形态

[![Release](https://img.shields.io/github/v/release/redchenk/Yachiyo-ai)](https://github.com/redchenk/Yachiyo-ai/releases)
[![License](https://img.shields.io/github/license/redchenk/Yachiyo-ai)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/redchenk/Yachiyo-ai/build.yml)](https://github.com/redchenk/Yachiyo-ai/actions)

## 📥 下载

### 最新版本：v1.0.0

| 平台 | 安装包 | 大小 |
|------|--------|------|
| **Windows** | [Yachiyo AI Setup.exe](https://github.com/redchenk/Yachiyo-ai/releases/latest) | ~150MB |
| **macOS** | [Yachiyo AI.dmg](https://github.com/redchenk/Yachiyo-ai/releases/latest) | ~150MB |
| **Linux** | [Yachiyo AI.AppImage](https://github.com/redchenk/Yachiyo-ai/releases/latest) | ~150MB |

[📦 查看所有版本](https://github.com/redchenk/Yachiyo-ai/releases)

## ✨ 特性

- 🎭 **内置 Live2D 渲染** - 不依赖 VTube Studio，直接渲染模型
- 🤖 **多 LLM 支持** - Ollama / 通义千问 / OpenAI / 自定义 API
- 🎤 **语音交互** - 支持语音识别和合成
- 👁️ **视觉识别** - 图片内容理解
- 🎮 **游戏集成** - Minecraft 机器人控制
- 💻 **跨平台** - Windows / macOS / Linux 原生应用
- 🌐 **网页版** - 浏览器即可使用

## 🚀 快速开始

### 方式 1: 下载应用 (推荐)

1. 从上表下载对应平台的安装包
2. 安装并运行
3. 配置 API (首次使用有向导)
4. 开始与八千代对话！

### 方式 2: 网页版

访问：https://redchenk.github.io/Yachiyo-ai/demo.html

### 方式 3: 源码运行

```bash
# 克隆仓库
git clone https://github.com/redchenk/Yachiyo-ai.git
cd Yachiyo-ai

# 安装依赖
npm install

# 启动
npm start
```

## 📖 文档

| 文档 | 说明 |
|------|------|
| [📦 发布指南](RELEASE.md) | 如何构建和发布 |
| [⚡ Electron 构建](ELECTRON.md) | 打包成可执行文件 |
| [🌐 网页演示](DEMO.md) | 网页版使用指南 |
| [🔌 API 配置](API_SETUP.md) | API 密钥获取和配置 |
| [🏠 本地部署](LOCAL_SETUP.md) | 完全本地化部署 |
| [📚 API 文档](API.md) | WebSocket 和 REST API |
| [🛠️ 开发指南](DEVELOPMENT.md) | 开发和自定义 |

## 🎮 使用场景

1. **虚拟主播** - Live2D 模型 + AI 对话 + 语音交互
2. **游戏直播** - Minecraft 自动游玩 + 观众互动
3. **客服助手** - 图片识别 + 多轮对话
4. **个人伴侣** - 本地部署，隐私安全

## 🛠️ 技术栈

| 模块 | 技术 |
|------|------|
| 前端 | HTML5 + CSS3 + JavaScript |
| 桌面应用 | Electron |
| Live2D | PixiJS + Cubism SDK |
| LLM | Ollama / OpenAI / Qwen |
| STT | Faster Whisper |
| TTS | CosyVoice / Fish Speech |
| 后端 | Node.js + Express |
| 通信 | WebSocket |

## 📦 构建

### 本地构建

```bash
# Windows
build.bat

# Linux / macOS
./build.sh
```

### 自动构建

```bash
# 打标签触发 GitHub Actions
git tag v1.0.0
git push origin v1.0.0
```

构建产物会自动上传到 [Releases](https://github.com/redchenk/Yachiyo-ai/releases)。

## 🎭 角色设定

**月见八千代**是虚拟世界"月读"的管理员，是辉夜姬跨越八千年孤独后蜕变的未来形态。

- **性格**: 温柔、通透、带着淡淡的疏离感
- **外貌**: 银白长发、淡紫色眼眸、白色和服
- **常用意象**: 月光、数据流、松饼、八千年的等待

详细设定见：[docs/YACHIYO_CHARACTER.md](docs/YACHIYO_CHARACTER.md)

## 🌟 截图

![Screenshot](docs/screenshot.png)

## 🤝 贡献

欢迎提交 Issue 和 PR！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 🙏 致谢

- [Live2D Cubism SDK](https://www.live2d.com/)
- [Electron](https://www.electronjs.org/)
- [Ollama](https://ollama.com/)
- [通义千问](https://www.aliyun.com/product/dashscope)

## 📬 联系方式

- 项目地址：https://github.com/redchenk/Yachiyo-ai
- Issue 反馈：https://github.com/redchenk/Yachiyo-ai/issues

---

> "欢迎来到'月读'。在这里，你可以做任何梦——而我，会一直守望着你。" 🌙
