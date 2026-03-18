/**
 * Web 服务器 - Express + WebSocket
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class WebServer {
  constructor(config, brain, voiceService) {
    this.config = config.server;
    this.brain = brain;
    this.voiceService = voiceService;
    
    this.app = express();
    this.server = createServer(this.app);
    this.wss = null;
    this.clients = new Set();
  }

  start() {
    // 中间件
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // 静态文件
    this.app.use(express.static(path.join(__dirname, '../public')));
    this.app.use('/outputs', express.static(path.join(__dirname, '../../outputs')));
    this.app.use('/models', express.static(path.join(__dirname, '../../models')));

    // API 路由
    this.setupRoutes();

    // WebSocket
    this.wss = new WebSocketServer({ server: this.server });
    this.wss.on('connection', (ws) => {
      console.log('🔌 WebSocket 客户端连接');
      this.clients.add(ws);

      ws.on('message', async (data) => {
        try {
          const msg = JSON.parse(data.toString());
          await this.handleMessage(ws, msg);
        } catch (e) {
          console.error('消息解析错误:', e);
        }
      });

      ws.on('close', () => {
        console.log('🔌 WebSocket 客户端断开');
        this.clients.delete(ws);
      });
    });

    // 启动服务器
    this.server.listen(this.config.port, this.config.host, () => {
      console.log(`🌐 服务器启动: http://${this.config.host}:${this.config.port}`);
    });
  }

  setupRoutes() {
    // 健康检查
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', time: new Date().toISOString() });
    });

    // 聊天接口
    this.app.post('/api/chat', async (req, res) => {
      try {
        const { text, emotion, speaker } = req.body;
        
        if (!text) {
          return res.status(400).json({ error: '请输入文本' });
        }

        console.log(`💬 收到消息: ${text}`);

        // LLM 生成回复
        const response = await this.brain.chat(text);
        
        console.log(`🤖 AI 回复: ${response.text}`);
        console.log(`😊 情感: ${response.emotion}`);

        // 广播情感变化
        this.broadcast({ type: 'emotion', emotion: response.emotion });

        // 语音合成
        let audioPath = null;
        if (this.voiceService) {
          audioPath = await this.voiceService.synthesize(response.text, {
            emotion: response.emotion === 'happy' ? 'Excited and happy, speaking very fast' :
                    response.emotion === 'sad' ? 'Sad and crying, speaking slowly' :
                    'Normal tone'
          });
        }

        res.json({
          text: response.text,
          emotion: response.emotion,
          audio: audioPath ? `/outputs/${path.basename(audioPath)}` : null
        });

      } catch (error) {
        console.error('❌ 聊天错误:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // 语音合成接口
    this.app.post('/api/tts', async (req, res) => {
      try {
        const { text, speaker, emotion, speed } = req.body;
        
        if (!text) {
          return res.status(400).json({ error: '请输入文本' });
        }

        const audioPath = await this.voiceService.synthesize(text, {
          speaker, emotion, speed
        });

        if (audioPath) {
          res.json({ audio: `/outputs/${path.basename(audioPath)}` });
        } else {
          res.status(500).json({ error: '语音合成失败' });
        }

      } catch (error) {
        console.error('❌ TTS 错误:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // 获取配置
    this.app.get('/api/config', (req, res) => {
      res.json({
        system: {
          name: this.brain?.systemPrompt ? '八千代' : '未初始化',
          version: '2.0.0'
        }
      });
    });

    // 清除对话历史
    this.app.post('/api/clear', (req, res) => {
      this.brain?.clearHistory();
      res.json({ success: true });
    });
  }

  async handleMessage(ws, msg) {
    switch (msg.type) {
      case 'chat':
        // WebSocket 聊天
        const response = await this.brain.chat(msg.text);
        
        ws.send(JSON.stringify({
          type: 'response',
          text: response.text,
          emotion: response.emotion
        }));

        // 广播情感
        this.broadcast({ type: 'emotion', emotion: response.emotion }, ws);

        // 语音合成
        if (this.voiceService) {
          const audioPath = await this.voiceService.synthesize(response.text);
          if (audioPath) {
            ws.send(JSON.stringify({
              type: 'audio',
              path: `/outputs/${path.basename(audioPath)}`
            }));
          }
        }
        break;

      case 'emotion':
        // 切换表情
        this.broadcast({ type: 'emotion', emotion: msg.emotion });
        break;

      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
    }
  }

  broadcast(data, exclude = null) {
    const message = JSON.stringify(data);
    for (const client of this.clients) {
      if (client !== exclude && client.readyState === 1) {
        client.send(message);
      }
    }
  }

  sendToClient(ws, data) {
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(data));
    }
  }
}
