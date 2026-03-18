# 🌙 八千代 AI v2.0

跨平台虚拟主播应用，内置 Qwen3-TTS 语音合成。

## 支持平台

- ✅ Windows
- ✅ macOS  
- ✅ Linux

---

## 快速开始

### 1. 克隆

```bash
git clone https://github.com/redchenk/Yachiyo-ai.git
cd Yachiyo-ai
```

### 2. 配置

```bash
# 复制配置模板
cp .env.example .env

# 编辑 .env，填入你的 API Key
```

### 3. 启动

#### Windows

双击运行 `start.bat` 或:
```cmd
set OPENAI_API_KEY=your_key
python run.py
```

#### macOS / Linux

```bash
# 添加执行权限
chmod +x start.sh

# 启动
./start.sh
```

或直接:
```bash
export OPENAI_API_KEY=your_key
python run.py
```

浏览器打开 **http://localhost:8000**

---

## 配置说明

编辑 `.env` 文件:

```env
# 必填 - LLM API Key
OPENAI_API_KEY=your_api_key

# 可选 - LLM 配置
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
```

### 支持的 LLM

| 提供商 | BASE_URL |
|--------|----------|
| DeepSeek | `https://api.deepseek.com/v1` |
| OpenAI | `https://api.openai.com/v1` |
| Ollama | `http://localhost:11434/v1` |
| 硅基流动 | `https://api.siliconflow.cn/v1` |

---

## Qwen3-TTS 模型 (可选)

如需本地语音合成，从 HuggingFace 下载模型到 `models/` 目录:

| 模型 | 下载 |
|------|------|
| CustomVoice (1.7B) | [Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit](https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit) |
| VoiceDesign (1.7B) | [Qwen3-TTS-12Hz-1.7B-VoiceDesign-8bit](https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-8bit) |

> 注意: 本地 TTS 需要 Apple Silicon Mac (M1-M4) + MLX

---

## 端口

| 服务 | 端口 |
|------|------|
| 主服务 | 8000 |
| TTS | 5000 |

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

## License

MIT
