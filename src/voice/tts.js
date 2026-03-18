/**
 * 语音服务 - Qwen3-TTS 集成
 * 支持本地运行和远程 API 调用
 */

import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class VoiceService {
  constructor(config, outputDir = './outputs') {
    this.config = config.tts;
    this.outputDir = outputDir;
    
    // Qwen3-TTS API 地址
    this.ttsUrl = process.env.QWEN3_TTS_URL || 'http://localhost:5000';
    
    // 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async synthesize(text, options = {}) {
    const model = options.model || this.config.model || 'pro_custom';
    const speaker = options.speaker || this.config.speaker || 'Vivian';
    const emotion = options.emotion || this.config.emotion || 'Normal tone';
    const speed = options.speed || this.config.speed || 1.0;

    console.log(`🔊 语音合成: ${text.substring(0, 30)}...`);
    console.log(`   模型: ${model}, 音色: ${speaker}, 情感: ${emotion}`);

    try {
      // 调用 Qwen3-TTS API
      const response = await axios.post(
        `${this.ttsUrl}/api/generate`,
        {
          model: model,
          mode: 'custom',
          text: text,
          speaker: speaker,
          emotion: emotion,
          speed: speed
        },
        {
          responseType: 'arraybuffer',
          timeout: 120000 // 2分钟超时
        }
      );

      // 生成文件名
      const timestamp = Date.now();
      const hash = text.substring(0, 10).replace(/[^\w]/g, '_');
      const filename = `tts_${timestamp}_${hash}.wav`;
      const filepath = path.join(this.outputDir, filename);

      // 保存音频文件
      fs.writeFileSync(filepath, Buffer.from(response.data));
      
      console.log(`✅ 语音已保存: ${filepath}`);
      return filepath;

    } catch (error) {
      console.error('❌ 语音合成失败:', error.message);
      
      // 如果是连接错误，尝试使用占位音频
      if (error.code === 'ECONNREFUSED') {
        console.warn('⚠️ Qwen3-TTS 服务未运行，请启动: python webui/app.py');
      }
      
      return null;
    }
  }

  // 获取可用的音色列表
  async getSpeakers() {
    try {
      const response = await axios.get(`${this.ttsUrl}/api/speakers`);
      return response.data;
    } catch {
      return [];
    }
  }

  // 获取可用的模型列表
  async getModels() {
    try {
      const response = await axios.get(`${this.ttsUrl}/api/models`);
      return response.data;
    } catch {
      return {};
    }
  }
}
