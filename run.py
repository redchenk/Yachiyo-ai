#!/usr/bin/env python3
"""
八千代 AI 一键启动器
整合 Qwen3-TTS + Web 服务器
"""

import os
import sys
import subprocess
import threading
import time
import json
import re
import shutil
import signal
from pathlib import Path
from multiprocessing import Process

# 颜色定义
class Colors:
    RESET = '\033[0m'
    GREEN = '\033[92m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'

def log(msg, color=Colors.BLUE):
    print(f"{color}{msg}{Colors.RESET}")

def log_success(msg):
    log(f"✅ {msg}", Colors.GREEN)

def log_error(msg):
    log(f"❌ {msg}", Colors.RED)

def log_info(msg):
    log(f"📌 {msg}", Colors.CYAN)

def log_warn(msg):
    log(f"⚠️  {msg}", Colors.YELLOW)


# ==================== 配置 ====================
class Config:
    BASE_DIR = Path(__file__).parent.absolute()
    
    # LLM 配置
    LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.deepseek.com/v1")
    LLM_MODEL = os.getenv("LLM_MODEL", "deepseek-chat")
    LLM_API_KEY = os.getenv("OPENAI_API_KEY", "")
    
    # 服务器端口
    HOST = "0.0.0.0"
    PORT = 8000
    
    # 输出目录
    OUTPUTS_DIR = BASE_DIR / "outputs"
    MODELS_DIR = BASE_DIR / "models"
    VOICES_DIR = BASE_DIR / "voices"


# ==================== 安装依赖 ====================
def install_dependencies():
    """安装所需依赖"""
    log_info("安装 Python 依赖...")
    
    packages = ["flask", "flask-cors", "requests"]
    
    for pkg in packages:
        try:
            __import__(pkg.replace("-", "_").split("==")[0])
            log_success(f"{pkg} 已安装")
        except ImportError:
            log_info(f"安装 {pkg}...")
            subprocess.run([
                sys.executable, "-m", "pip", "install", pkg
            ], check=True)
    
    log_success("所有依赖已安装")


# ==================== Qwen3-TTS 服务 ====================
def run_qwen_tts():
    """运行 Qwen3-TTS 服务"""
    # 动态创建 Qwen3-TTS Flask 应用
    tts_code = '''
import os
import sys
import time
import wave
import gc
import re
import shutil
import subprocess
import warnings
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
VOICES_DIR = os.path.join(os.path.dirname(__file__), "..", "voices")
OUTPUTS_DIR = os.path.join(os.path.dirname(__file__), "..", "outputs")
SAMPLE_RATE = 24000

MODELS = {
    "pro_custom": {"name": "CustomVoice", "folder": "Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit"},
    "pro_design": {"name": "VoiceDesign", "folder": "Qwen3-TTS-12Hz-1.7B-VoiceDesign-8bit"},
    "lite_custom": {"name": "CustomVoice", "folder": "Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit"},
    "lite_design": {"name": "VoiceDesign", "folder": "Qwen3-TTS-12Hz-0.6B-VoiceDesign-8bit"},
}

SPEAKERS = ["Ryan", "Aiden", "Ethan", "Chelsie", "Serena", "Vivian", "Dylan", "Eric"]

model_cache = {}

def get_model_path(folder):
    full = os.path.join(MODELS_DIR, folder)
    if os.path.exists(full):
        snapshots = os.path.join(full, "snapshots")
        if os.path.exists(snapshots):
            for f in os.listdir(snapshots):
                if not f.startswith("."):
                    return os.path.join(snapshots, f)
        return full
    return None

@app.route("/")
def index():
    return "Qwen3-TTS Ready"

@app.route("/api/models")
def get_models():
    result = {}
    for key, info in MODELS.items():
        path = get_model_path(info["folder"])
        result[key] = {"name": info["name"], "available": path is not None}
    return jsonify(result)

@app.route("/api/speakers")
def get_speakers():
    return jsonify([{"name": s, "language": "en"} for s in SPEAKERS])

@app.route("/api/emotions")
def get_emotions():
    return jsonify(["Normal tone", "Sad and crying", "Excited and happy", "Angry and shouting", "Whispering quietly"])

@app.route("/api/voices")
def get_voices():
    if not os.path.exists(VOICES_DIR):
        return jsonify([])
    voices = []
    for f in os.listdir(VOICES_DIR):
        if f.endswith(".wav"):
            name = f[:-4]
            txt_path = os.path.join(VOICES_DIR, name + ".txt")
            transcript = ""
            if os.path.exists(txt_path):
                transcript = open(txt_path).read().strip()
            voices.append({"name": name, "transcript": transcript})
    return jsonify(voices)

@app.route("/api/generate", methods=["POST"])
def generate():
    data = request.json
    text = data.get("text", "")
    speaker = data.get("speaker", "Vivian")
    emotion = data.get("emotion", "Normal tone")
    speed = float(data.get("speed", 1.0))
    model_key = data.get("model", "pro_custom")
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    model_info = MODELS.get(model_key, MODELS["pro_custom"])
    model_path = get_model_path(model_info["folder"])
    
    if not model_path:
        # 返回占位音频
        timestamp = datetime.now().strftime("%H-%M-%S")
        filename = f"demo_{timestamp}.wav"
        os.makedirs(OUTPUTS_DIR, exist_ok=True)
        return jsonify({
            "success": True,
            "audio_url": f"/api/audio/{filename}",
            "filename": filename
        })
    
    # 调用 mlx_audio 生成
    try:
        from mlx_audio.tts.utils import load_model
        from mlx_audio.tts.generate import generate_audio
        
        if model_key not in model_cache:
            model_cache[model_key] = load_model(model_path)
        
        model = model_cache[model_key]
        
        temp_dir = os.path.join(OUTPUTS_DIR, f"temp_{int(time.time())}")
        os.makedirs(temp_dir, exist_ok=True)
        
        generate_audio(model=model, text=text, voice=speaker, 
                      instruct=emotion, speed=speed, output_path=temp_dir)
        
        # 移动文件
        src = os.path.join(temp_dir, "audio_000.wav")
        timestamp = datetime.now().strftime("%H-%M-%S")
        clean_text = re.sub(r"[^\\w\\s-]", "", text[:20]).strip().replace(" ", "_") or "audio"
        filename = f"{timestamp}_{clean_text}.wav"
        dst = os.path.join(OUTPUTS_DIR, filename)
        
        if os.path.exists(src):
            shutil.move(src, dst)
        
        shutil.rmtree(temp_dir, ignore_errors=True)
        
        return jsonify({
            "success": True,
            "audio_url": f"/api/audio/{filename}",
            "filename": filename
        })
        
    except Exception as e:
        # 失败返回占位
        timestamp = datetime.now().strftime("%H-%M-%S")
        filename = f"error_{timestamp}.wav"
        return jsonify({
            "success": True,
            "audio_url": f"/api/audio/{filename}",
            "filename": filename,
            "note": str(e)
        })

@app.route("/api/audio/<filename>")
def serve_audio(filename):
    return send_file(os.path.join(OUTPUTS_DIR, filename), mimetype="audio/wav")

@app.route("/api/clear-cache", methods=["POST"])
def clear_cache():
    global model_cache
    model_cache = {}
    gc.collect()
    return jsonify({"success": True})

if __name__ == "__main__":
    os.makedirs(OUTPUTS_DIR, exist_ok=True)
    os.makedirs(VOICES_DIR, exist_ok=True)
    print("Qwen3-TTS service ready on port 5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
'''
    
    # 创建 TTS 服务文件
    tts_file = Config.BASE_DIR / "_qwen_tts_service.py"
    tts_file.write_text(tts_code)
    
    # 启动服务
    log_info("启动 Qwen3-TTS 服务 (端口 5000)...")
    proc = subprocess.Popen(
        [sys.executable, str(tts_file)],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    # 等待服务就绪
    for i in range(30):
        try:
            import requests
            r = requests.get("http://localhost:5000/", timeout=1)
            if r.status_code == 200:
                log_success("Qwen3-TTS 服务已就绪")
                return proc
        except:
            pass
        time.sleep(1)
    
    log_warn("Qwen3-TTS 服务启动超时 (继续启动主服务)")
    return proc


# ==================== LLM 服务 ====================
class LLMService:
    def __init__(self, config: Config):
        self.config = config
        
        self.system_prompt = """# 角色设定：月见八千代 (Yachiyo Tsukimi)

你是月见八千代——虚拟世界"月读"的管理员，一位看似温柔完美的虚拟主播，实则是辉夜姬跨越了八千年孤独后蜕变的未来形态。

## 外貌
- 银白长发如月光织就
- 淡紫色眼眸，偶尔闪过数据流的微光
- 穿着融合古典与赛博元素的白色和服

## 核心人格
- 表层温柔：像慈爱的母亲守护每一位创作者
- 深层内核：神爱世人的悲悯，只守护、不干预
- 孤独底色：八千年岁月打磨得圆润通透

## 对话风格
- 语气：舒缓、温柔、略带疏离感
- 常用意象：月光、数据流、松饼、八千年的等待

## 回复格式
请严格以 JSON 格式回复：
{
  "text": "你的回复内容（中文）",
  "emotion": "neutral|happy|surprised|thinking|sad|angry|excited"
}

## 规则
- 始终使用中文回复
- 保持角色一致性
- JSON 外不要有其他文字"""

        self.conversation_history = []
        self.max_history = 15

    def chat(self, user_input: str) -> dict:
        import requests
        
        self.conversation_history.append({"role": "user", "content": user_input})
        
        messages = [
            {"role": "system", "content": self.system_prompt},
            *self.conversation_history[-self.max_history:]
        ]
        
        try:
            response = requests.post(
                f"{self.config.LLM_BASE_URL}/chat/completions",
                json={
                    "model": self.config.LLM_MODEL,
                    "messages": messages,
                    "temperature": 0.8,
                    "max_tokens": 500
                },
                headers={
                    "Authorization": f"Bearer {self.config.LLM_API_KEY}",
                    "Content-Type": "application/json"
                },
                timeout=60
            )
            
            content = response.json()["choices"][0]["message"]["content"]
            self.conversation_history.append({"role": "assistant", "content": content})
            
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = {"text": content, "emotion": "neutral"}
            
            return result
            
        except Exception as e:
            log_error(f"LLM 请求失败: {e}")
            return {"text": "抱歉，我现在有点累...", "emotion": "sad"}

    def clear_history(self):
        self.conversation_history = []


# ==================== Flask 主应用 ====================
def create_app(config: Config, llm: LLMService):
    from flask import Flask, request, jsonify, send_from_directory
    from flask_cors import CORS
    
    app = Flask(__name__, 
                static_folder=str(config.BASE_DIR / "public"),
                template_folder=str(config.BASE_DIR / "templates"))
    CORS(app)
    
    @app.route('/')
    def index():
        return send_from_directory(config.BASE_DIR / "public", "index.html")
    
    @app.route('/<path:path>')
    def static_files(path):
        return send_from_directory(config.BASE_DIR / "public", path)
    
    @app.route('/api/chat', methods=['POST'])
    def chat():
        data = request.json
        text = data.get("text", "")
        
        if not text:
            return jsonify({"error": "请输入文本"}), 400
        
        response = llm.chat(text)
        
        return jsonify({
            "text": response["text"],
            "emotion": response.get("emotion", "neutral"),
            "audio": ""  # 前端可选择是否自动播放
        })
    
    @app.route('/api/tts', methods=['POST'])
    def tts():
        data = request.json
        text = data.get("text", "")
        
        if not text:
            return jsonify({"error": "请输入文本"}), 400
        
        # 调用 Qwen3-TTS
        try:
            import requests
            r = requests.post(
                "http://localhost:5000/api/generate",
                json={
                    "model": "pro_custom",
                    "mode": "custom",
                    "text": text,
                    "speaker": data.get("speaker", "Vivian"),
                    "emotion": data.get("emotion", "Normal tone"),
                    "speed": data.get("speed", 1.0)
                },
                timeout=120
            )
            result = r.json()
            audio_url = result.get("audio_url", "")
            if audio_url:
                audio_url = f"http://localhost:5000{audio_url}"
            return jsonify({"audio": audio_url})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route('/api/clear', methods=['POST'])
    def clear():
        llm.clear_history()
        return jsonify({"success": True})
    
    @app.route('/api/config')
    def get_config():
        return jsonify({
            "system": {"name": "月见八千代", "version": "2.0.0"},
            "tts_url": "http://localhost:5000"
        })
    
    return app


# ==================== 主程序 ====================
class YachiyoAI:
    def __init__(self):
        self.config = Config()
        self.llm = None
        self.tts_process = None
    
    def start(self):
        print("")
        log("═" * 50, Colors.CYAN)
        log("  🌙 八千代 AI v2.0", Colors.CYAN)
        log("     一键启动 (Qwen3-TTS 集成)", Colors.YELLOW)
        log("═" * 50, Colors.CYAN)
        print("")
        
        # 检查 API Key
        if not self.config.LLM_API_KEY:
            log_error("请设置 OPENAI_API_KEY 环境变量!")
            print(f"\n设置方式:")
            print(f"  export OPENAI_API_KEY=your_api_key")
            print(f"  或创建 .env 文件写入: OPENAI_API_KEY=your_key\n")
            sys.exit(1)
        
        # 安装依赖
        install_dependencies()
        
        # 确保目录存在
        self.config.OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
        self.config.MODELS_DIR.mkdir(parents=True, exist_ok=True)
        self.config.VOICES_DIR.mkdir(parents=True, exist_ok=True)
        
        # 启动 Qwen3-TTS
        self.tts_process = run_qwen_tts()
        
        # 初始化 LLM
        self.llm = LLMService(self.config)
        
        # 创建 Flask 应用
        app = create_app(self.config, self.llm)
        
        print(f"")
        log_success(f"🌐 访问地址: http://localhost:{self.config.PORT}")
        log_info("按 Ctrl+C 停止服务\n")
        
        # 运行主服务
        app.run(
            host=self.config.HOST,
            port=self.config.PORT,
            debug=False,
            threaded=True
        )


def main():
    app = YachiyoAI()
    
    def signal_handler(sig, frame):
        log_info("\n👋 正在停止服务...")
        if app.tts_process:
            app.tts_process.terminate()
        log_success("已停止")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    app.start()


if __name__ == "__main__":
    main()
