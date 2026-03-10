#!/usr/bin/env python3
"""
语音服务 - STT 和 TTS
支持多种后端：本地 Whisper / Faster-Whisper / 自定义 API
"""

import os
import sys
import json
import asyncio
from pathlib import Path
from typing import Optional

class VoiceService:
    def __init__(self, config_path: str = "../config/config.json"):
        self.config = self.load_config(config_path)
        self.stt_model = None
        self.output_dir = Path("./output/audio")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def load_config(self, path: str) -> dict:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    async def initialize(self):
        """初始化语音服务"""
        # STT 初始化
        if self.config.get('stt', {}).get('enabled'):
            await self.init_stt()
        
        # TTS 初始化
        if self.config.get('tts', {}).get('enabled'):
            await self.init_tts()
    
    async def init_stt(self):
        """初始化语音识别"""
        provider = self.config['stt'].get('provider', 'faster-whisper')
        
        if provider == 'faster-whisper':
            try:
                from faster_whisper import WhisperModel
                model_size = self.config['stt'].get('model', 'large-v3')
                device = self.config['stt'].get('device', 'auto')
                
                print(f"🎤 加载 Whisper 模型：{model_size} ({device})")
                self.stt_model = WhisperModel(model_size, device=device)
                print("✅ 语音识别就绪")
            except ImportError:
                print("⚠️ faster-whisper 未安装，使用备用方案")
        else:
            print(f"🎤 使用外部 STT 服务：{provider}")
    
    async def init_tts(self):
        """初始化语音合成"""
        provider = self.config['tts'].get('provider', 'custom')
        print(f"🔊 TTS 服务：{provider}")
    
    def recognize(self, audio_path: str, language: str = "zh") -> str:
        """语音识别"""
        if self.stt_model:
            segments, info = self.stt_model.transcribe(
                audio_path,
                language=language,
                beam_size=5
            )
            text = " ".join([segment.text for segment in segments])
            print(f"📝 识别结果：{text}")
            return text
        else:
            # 调用外部 API
            return self.recognize_external(audio_path)
    
    def recognize_external(self, audio_path: str) -> str:
        """调用外部 STT API"""
        import requests
        
        provider = self.config['stt'].get('provider')
        
        if provider == 'whisper-api':
            # OpenAI Whisper API
            api_key = self.config['stt'].get('apiKey')
            with open(audio_path, 'rb') as f:
                response = requests.post(
                    'https://api.openai.com/v1/audio/transcriptions',
                    headers={'Authorization': f'Bearer {api_key}'},
                    files={'file': f},
                    data={'model': 'whisper-1', 'language': 'zh'}
                )
            return response.json()['text']
        
        return ""
    
    def synthesize(self, text: str, output_name: Optional[str] = None) -> str:
        """语音合成"""
        import hashlib
        
        if not output_name:
            hash_id = hashlib.md5(text.encode()).hexdigest()[:8]
            output_name = f"tts_{hash_id}.wav"
        
        output_path = self.output_dir / output_name
        
        provider = self.config['tts'].get('provider', 'custom')
        
        if provider == 'custom':
            # 调用自定义 TTS API
            return self.synthesize_custom(text, output_path)
        elif provider == 'cosyvoice':
            return self.synthesize_cosyvoice(text, output_path)
        else:
            # 返回占位路径
            print(f"🔊 合成：{text[:30]}...")
            return str(output_path)
    
    def synthesize_custom(self, text: str, output_path: Path) -> str:
        """调用自定义 TTS API"""
        import requests
        
        base_url = self.config['tts'].get('baseUrl', 'http://localhost:5000')
        voice = self.config['tts'].get('voice', 'default')
        
        try:
            response = requests.post(
                f'{base_url}/synthesize',
                json={'text': text, 'voice': voice},
                timeout=30
            )
            
            with open(output_path, 'wb') as f:
                f.write(response.content)
            
            print(f"💾 保存至：{output_path}")
            return str(output_path)
            
        except Exception as e:
            print(f"⚠️ TTS 请求失败：{e}")
            return str(output_path)
    
    def synthesize_cosyvoice(self, text: str, output_path: Path) -> str:
        """CosyVoice TTS"""
        # 需要安装 cosyvoice
        # https://github.com/FunAudioLLM/CosyVoice
        print("🔊 使用 CosyVoice 合成...")
        return str(output_path)
    
    async def shutdown(self):
        """关闭服务"""
        print("🔇 语音服务已关闭")


async def main():
    service = VoiceService()
    await service.initialize()
    
    if len(sys.argv) > 1:
        result = service.recognize(sys.argv[1])
        print(f"识别结果：{result}")
    else:
        result = service.synthesize("你好，我是八千代！")
        print(f"合成完成：{result}")


if __name__ == "__main__":
    asyncio.run(main())
