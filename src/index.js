/**
 * 主程序入口 - 整合所有模块
 */

import { EventEmitter } from 'eventemitter3';
import { WebServer } from './web/server.js';
import { AIBrain } from './core/brain.js';
import { VoiceService } from './voice/service.js';
import { MinecraftBot } from './minecraft/bot.js';
import config from '../config/config.json' assert { type: 'json' };

class YakumoAI extends EventEmitter {
  constructor() {
    super();
    this.config = config;
    this.name = config.system.name;
    this.version = config.system.version;
    
    // 初始化模块
    this.webServer = new WebServer(config);
    this.aiBrain = new AIBrain(config);
    this.voice = new VoiceService(config);
    this.mcBot = config.minecraft.enabled 
      ? new MinecraftBot(config.minecraft) 
      : null;
    
    this.isSpeaking = false;
    this.currentEmotion = 'neutral';
  }

  async start() {
    console.log(`🌸 ${this.name} v${this.version} 启动中...`);
    console.log('═'.repeat(50));
    
    // 启动 Web 服务器（包含 Live2D 渲染）
    this.webServer.start();
    
    // 设置 Web 消息处理
    this.webServer.onMessage = async (msg) => {
      await this.handleWebMessage(msg);
    };
    
    // 初始化语音服务
    if (this.config.stt.enabled || this.config.tts.enabled) {
      await this.voice.initialize();
    }
    
    // 连接 Minecraft
    if (this.mcBot) {
      await this.mcBot.connect();
    }
    
    // 设置事件监听
    this.setupEventListeners();
    
    console.log('═'.repeat(50));
    console.log(`✨ ${this.name} 已就绪！`);
    console.log(`🌐 Live2D: http://localhost:${this.config.live2d.port}`);
    
    this.emit('ready');
  }

  async handleWebMessage(msg) {
    switch (msg.type) {
      case 'user_input':
        // 用户在聊天框输入的文字
        await this.processInput(msg.text, 'chat');
        break;
        
      case 'voice_input':
        // 语音识别结果
        await this.processInput(msg.text, 'voice');
        break;
        
      case 'image_input':
        // 图片识别
        await this.processImage(msg.imagePath, msg.question);
        break;
    }
  }

  setupEventListeners() {
    // 语音识别完成
    this.voice.on('speech', async (text) => {
      console.log(`🎤 听到：${text}`);
      await this.processInput(text, 'voice');
    });

    // Minecraft 聊天
    if (this.mcBot) {
      this.mcBot.on('chat', async ({ username, message }) => {
        console.log(`[MC] ${username}: ${message}`);
        // 可以选择让 AI 回应
      });
    }
  }

  async processInput(text, source = 'chat') {
    console.log(`💬 输入 (${source}): ${text}`);
    
    // 1. LLM 理解并生成回复
    const response = await this.aiBrain.chat(text, {
      emotion: this.currentEmotion,
      source
    });

    console.log(`🤖 回复：${response.text}`);
    console.log(`😊 情感：${response.emotion}`);
    
    // 2. 设置表情
    if (response.emotion) {
      await this.setExpression(response.emotion);
    }

    // 3. 语音合成并播放
    if (this.config.tts.enabled && response.text) {
      await this.speak(response.text);
    } else {
      // 只发送文字到前端
      this.webServer.sendToClient({
        type: 'response',
        text: response.text
      });
    }

    // 4. 执行特殊动作
    if (response.action) {
      await this.executeAction(response.action);
    }
  }

  async processImage(imagePath, question = '这张图片里有什么？') {
    console.log(`👁️ 分析图片：${imagePath}`);
    
    const description = await this.aiBrain.analyzeImage(imagePath, question);
    console.log(`📝 图片描述：${description}`);
    
    // 生成回应
    const response = await this.aiBrain.chat(
      `我看到了一张图片：${description}。请给出有趣的评论。`,
      { source: 'vision' }
    );
    
    await this.speak(response.text);
  }

  async setExpression(emotion) {
    this.currentEmotion = emotion;
    this.webServer.broadcast({ type: 'expression', expression: emotion });
  }

  async speak(text) {
    if (this.isSpeaking) return;
    
    this.isSpeaking = true;
    this.webServer.broadcast({ type: 'speaking', value: true });
    
    try {
      // 合成语音
      const audioPath = await this.voice.synthesize(text);
      
      // 发送音频路径到前端播放
      this.webServer.sendToClient({
        type: 'audio',
        path: audioPath,
        text: text
      });
      
      // 等待播放完成（简化处理）
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (err) {
      console.error('语音合成失败:', err);
    } finally {
      this.isSpeaking = false;
      this.webServer.broadcast({ type: 'speaking', value: false });
    }
  }

  async executeAction(action) {
    console.log(`⚡ 执行动作：${action.type}`);
    
    switch (action.type) {
      case 'minecraft':
        if (this.mcBot) {
          await this.mcBot.execute(action.command);
        }
        break;
        
      case 'expression':
        await this.setExpression(action.value);
        break;
        
      case 'motion':
        this.webServer.broadcast({
          type: 'motion',
          group: action.group || 'idle',
          id: action.value
        });
        break;
    }
  }

  async shutdown() {
    console.log(`👋 ${this.name} 正在关闭...`);
    
    if (this.mcBot) await this.mcBot.disconnect();
    if (this.voice) await this.voice.shutdown();
    
    this.emit('shutdown');
  }
}

// 创建并启动实例
const yakumo = new YakumoAI();

yakumo.on('ready', () => {
  console.log('✅ 所有系统就绪');
});

yakumo.on('error', (err) => {
  console.error('❌ 错误:', err);
});

// 优雅退出
process.on('SIGINT', async () => {
  await yakumo.shutdown();
  process.exit(0);
});

// 启动
yakumo.start().catch(console.error);

export { YakumoAI };
