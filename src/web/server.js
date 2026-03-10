/**
 * Web 服务器 - 提供 Live2D 渲染页面和 API
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class WebServer {
  constructor(config) {
    this.config = config;
    this.app = express();
    this.server = createServer(this.app);
    this.wss = null;
    this.clients = new Set();
  }

  start() {
    // 中间件
    this.app.use(cors());
    this.app.use(express.json());
    
    // 静态文件
    this.app.use(express.static(join(__dirname, '.')));
    this.app.use('/models', express.static('models'));
    
    // API 路由
    this.setupRoutes();
    
    // WebSocket
    this.setupWebSocket();
    
    // 启动服务器
    const port = this.config.live2d.port || 3000;
    this.server.listen(port, () => {
      console.log(`🌐 Web 服务器运行在 http://localhost:${port}`);
      console.log(`🎭 Live2D 页面：http://localhost:${port}/index.html`);
    });
  }

  setupRoutes() {
    // 健康检查
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', name: '八千代' });
    });

    // 设置表情
    this.app.post('/api/expression', (req, res) => {
      const { expression } = req.body;
      console.log(`🎭 API: 设置表情 ${expression}`);
      this.broadcast({ type: 'expression', expression });
      res.json({ success: true });
    });

    // 播放动作
    this.app.post('/api/motion', (req, res) => {
      const { group, id } = req.body;
      console.log(`🎭 API: 播放动作 ${group}_${id}`);
      this.broadcast({ type: 'motion', group, id });
      res.json({ success: true });
    });

    // 设置参数
    this.app.post('/api/parameter', (req, res) => {
      const { paramId, value } = req.body;
      console.log(`🎭 API: 设置参数 ${paramId} = ${value}`);
      this.broadcast({ type: 'parameter', paramId, value });
      res.json({ success: true });
    });

    // 口型同步
    this.app.post('/api/lipsync', (req, res) => {
      const { value } = req.body;
      this.broadcast({ type: 'lipsync', value });
      res.json({ success: true });
    });

    // 获取模型列表
    this.app.get('/api/models', (req, res) => {
      // 扫描 models 目录
      res.json({ models: ['yakumo'] });
    });
  }

  setupWebSocket() {
    this.wss = new WebSocketServer({ server: this.server, path: '/ws' });
    
    this.wss.on('connection', (ws) => {
      console.log('🔌 新客户端连接');
      this.clients.add(ws);
      
      ws.on('close', () => {
        console.log('🔌 客户端断开');
        this.clients.delete(ws);
      });
      
      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data);
          console.log('📩 收到消息:', msg);
          
          // 转发给主程序
          if (this.onMessage) {
            this.onMessage(msg);
          }
        } catch (err) {
          console.error('消息解析失败:', err);
        }
      });
    });
  }

  broadcast(data) {
    const message = JSON.stringify(data);
    for (const client of this.clients) {
      if (client.readyState === 1) { // OPEN
        client.send(message);
      }
    }
  }

  sendToClient(data) {
    // 发送给第一个连接的客户端
    for (const client of this.clients) {
      if (client.readyState === 1) {
        client.send(JSON.stringify(data));
        break;
      }
    }
  }
}
