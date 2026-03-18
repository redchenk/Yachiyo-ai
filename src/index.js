/**
 * 八千代 AI v2.0.0
 * Qwen3-TTS + Live2D 虚拟主播
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AIBrain } from './core/brain.js';
import { VoiceService } from './voice/tts.js';
import { WebServer } from './web/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 加载环境变量
dotenv.config();

class YachiyoAI {
  constructor() {
    // 加载配置
    this.config = this.loadConfig();
    
    // 初始化模块
    this.brain = new AIBrain(this.config);
    this.voiceService = new VoiceService(this.config);
    this.webServer = new WebServer(this.config, this.brain, this.voiceService);
    
    this.isSpeaking = false;
    this.currentEmotion = 'neutral';
  }

  loadConfig() {
    const configPath = path.join(__dirname, '../config/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    // 替换环境变量
    const str = JSON.stringify(config);
    const replaced = str.replace(/\$\{(\w+)\}/g, (_, key) => process.env[key] || '');
    return JSON.parse(replaced);
  }

  async start() {
    console.log('');
    console.log('═'.repeat(50));
    console.log('🌙 八千代 AI v2.0.0');
    console.log('   Qwen3-TTS + Live2D 虚拟主播');
    console.log('═'.repeat(50));
    console.log('');

    // 启动 Web 服务器
    this.webServer.start();

    console.log('');
    console.log('✨ 系统就绪!');
    console.log('');
    console.log('📖 使用说明:');
    console.log('   1. 确保 Qwen3-TTS 服务运行在 localhost:5000');
    console.log('   2. 在浏览器打开 http://localhost:8080');
    console.log('   3. 开始与八千代对话!');
    console.log('');
    console.log('🔧 API 接口:');
    console.log('   POST /api/chat   - 聊天');
    console.log('   POST /api/tts   - 语音合成');
    console.log('');
  }

  async shutdown() {
    console.log('👋 八千代正在关闭...');
    process.exit(0);
  }
}

// 创建并启动
const app = new YachiyoAI();

// 优雅退出
process.on('SIGINT', () => app.shutdown());
process.on('SIGTERM', () => app.shutdown());

// 启动
app.start().catch(console.error);
