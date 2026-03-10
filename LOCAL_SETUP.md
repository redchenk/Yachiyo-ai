# 本地部署指南

## 完全本地化方案（无需外部 API）

### 1. LLM - 使用 Ollama

```bash
# 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 拉取模型
ollama pull qwen2.5:72b-instruct
# 或较小的模型
ollama pull qwen2.5:7b-instruct

# 启动服务（默认 http://localhost:11434）
ollama serve
```

配置文件：
```json
{
  "llm": {
    "provider": "ollama",
    "baseUrl": "http://localhost:11434",
    "model": "qwen2.5:72b-instruct"
  }
}
```

### 2. 视觉识别 - LLaVA

```bash
# 拉取视觉模型
ollama pull llava:latest
```

配置：
```json
{
  "vision": {
    "provider": "ollama",
    "baseUrl": "http://localhost:11434",
    "model": "llava:latest"
  }
}
```

### 3. 语音识别 - Faster Whisper

```bash
pip install faster-whisper
```

配置：
```json
{
  "stt": {
    "provider": "faster-whisper",
    "model": "large-v3",
    "device": "cuda"
  }
}
```

### 4. 语音合成 - 可选方案

#### 方案 A: CosyVoice（推荐）
```bash
git clone https://github.com/FunAudioLLM/CosyVoice
cd CosyVoice
pip install -r requirements.txt
python app.py --port 5000
```

#### 方案 B: Fish Speech
```bash
git clone https://github.com/fishaudio/fish-speech
pip install -e .
fish-speech api --listen 0.0.0.0:5000
```

#### 方案 C: XTTS
```bash
pip install TTS
# 使用 Coqui TTS API
```

配置：
```json
{
  "tts": {
    "provider": "custom",
    "baseUrl": "http://localhost:5000"
  }
}
```

### 5. Live2D - 内置渲染

无需额外配置，项目已内置 PixiJS + Cubism SDK。

只需准备模型文件：
```
models/yakumo/
├── yakumo.model3.json
├── yakumo.moc3
├── textures/
│   ├── texture_00.png
│   └── ...
├── motions/
│   ├── idle.motion3.json
│   └── ...
└── expressions/
    ├── neutral.exp3.json
    └── ...
```

## 完整本地配置示例

```json
{
  "live2d": {
    "enabled": true,
    "renderer": "pixijs",
    "modelPath": "./models/yakumo",
    "port": 3000
  },
  "llm": {
    "enabled": true,
    "provider": "ollama",
    "baseUrl": "http://localhost:11434",
    "model": "qwen2.5:72b-instruct"
  },
  "vision": {
    "enabled": true,
    "provider": "ollama",
    "baseUrl": "http://localhost:11434",
    "model": "llava:latest"
  },
  "stt": {
    "enabled": true,
    "provider": "faster-whisper",
    "model": "large-v3",
    "device": "cuda"
  },
  "tts": {
    "enabled": true,
    "provider": "custom",
    "baseUrl": "http://localhost:5000",
    "voice": "yakumo"
  },
  "minecraft": {
    "enabled": false
  }
}
```

## 云端 API 配置（可选）

### 通义千问
```json
{
  "llm": {
    "provider": "qwen",
    "baseUrl": "https://dashscope.aliyuncs.com/api/v1",
    "apiKey": "YOUR_API_KEY",
    "model": "qwen-max"
  }
}
```

### OpenAI
```json
{
  "llm": {
    "provider": "openai",
    "baseUrl": "https://api.openai.com/v1",
    "apiKey": "YOUR_API_KEY",
    "model": "gpt-4o"
  }
}
```

## 性能建议

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| LLM (72B) | - | 24GB VRAM |
| LLM (7B) | 8GB VRAM | 16GB VRAM |
| Whisper | 4GB VRAM | 8GB VRAM |
| TTS | 2GB VRAM | 4GB VRAM |
| Live2D | 集成显卡 | 独立显卡 |

## 启动顺序

```bash
# 1. 启动 Ollama
ollama serve

# 2. 启动 TTS 服务
cd CosyVoice && python app.py

# 3. 启动八千代
cd yakumo-ai
npm install
npm start
```

访问 http://localhost:3000 查看 Live2D 模型！
