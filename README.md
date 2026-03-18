# 🌙 八千代 AI v2.0

一键启动的虚拟主播应用，内置 Qwen3-TTS 语音合成。

## 快速开始

```bash
# 1. 克隆
git clone https://github.com/redchenk/yachiyo-ai-v2.git
cd yachiyo-ai-v2

# 2. 配置
cp .env.example .env
# 编辑 .env 填入 OPENAI_API_KEY

# 3. 启动 (一行命令!)
python run.py
```

浏览器打开 **http://localhost:8000** 即可使用!

---

## 前置要求

- **Python 3.10+**
- **MLX 兼容 Mac** (用于本地 TTS 推理)

### 可选: 本地 TTS 模型

如需使用本地 Qwen3-TTS 推理, 从 HuggingFace 下载模型到 `models/` 目录:

| 模型 | 下载 |
|------|------|
| CustomVoice (1.7B) | [Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit](https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit) |
| VoiceDesign (1.7B) | [Qwen3-TTS-12Hz-1.7B-VoiceDesign-8bit](https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-8bit) |

---

## 配置

```env
OPENAI_API_KEY=your_api_key
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
```

### 支持的 LLM

- DeepSeek: `https://api.deepseek.com/v1`
- OpenAI: `https://api.openai.com/v1`
- Ollama: `http://localhost:11434/v1`

---

## API

```bash
# 聊天
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "你好"}'

# 语音合成
curl -X POST http://localhost:8000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "你好八千代"}'
```

---

## 端口

| 服务 | 端口 |
|------|------|
| 主服务 | 8000 |
| TTS 服务 | 5000 |

---

## License

MIT
