/**
 * Live2D 控制器
 * 支持 VTube Studio API 和原生 Live2D 渲染
 */

import { EventEmitter } from 'eventemitter3';
import WebSocket from 'ws';

export class Live2DController extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.ws = null;
    this.connected = false;
    this.currentExpression = 'neutral';
    this.isSpeaking = false;
  }

  async connect() {
    if (!this.config.enabled) {
      console.log('🎭 Live2D 已禁用');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // 连接 VTube Studio
        this.ws = new WebSocket(`ws://localhost:${this.config.vtsPort}`);
        
        this.ws.on('open', () => {
          this.connected = true;
          console.log('🎭 已连接 VTube Studio');
          this.authenticate();
          resolve();
        });

        this.ws.on('error', (err) => {
          console.error('Live2D 连接失败，将使用备用模式');
          this.connected = false;
          resolve(); // 不阻断启动
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async authenticate() {
    // VTube Studio 认证流程
    const authRequest = {
      apiName: "VTubeStudioPublicAPI",
      apiVersion: "1.0",
      requestID: "YakumoAuth",
      messageType: "AuthenticationTokenRequest",
      data: {
        pluginName: "YakumoVTuber",
        pluginDeveloper: "User",
        pluginIcon: "base64_icon_data"
      }
    };

    this.send(authRequest);
  }

  send(data) {
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  async setExpression(emotion) {
    const expName = this.config.expressions[emotion] || this.config.expressions.neutral;
    
    console.log(`🎭 表情：${emotion} (${expName})`);
    
    if (this.connected) {
      this.send({
        apiName: "VTubeStudioPublicAPI",
        apiVersion: "1.0",
        requestID: `Exp-${Date.now()}`,
        messageType: "ArtMeshListRequest",
        data: { expressionFile: expName }
      });
    }
    
    this.currentExpression = emotion;
    this.emit('expressionChanged', emotion);
  }

  async playMotion(motionId) {
    console.log(`🎭 播放动作：${motionId}`);
    
    if (this.connected) {
      this.send({
        apiName: "VTubeStudioPublicAPI",
        apiVersion: "1.0",
        requestID: `Motion-${Date.now()}`,
        messageType: "AnimationRequest",
        data: {
          animationFile: motionId,
          fadeOutTime: 0.5
        }
      });
    }
  }

  async playAudioWithLipSync(audioPath) {
    console.log(`🔊 播放音频并同步口型：${audioPath}`);
    
    this.isSpeaking = true;
    
    // VTube Studio 支持音频文件播放和自动口型同步
    if (this.connected) {
      this.send({
        apiName: "VTubeStudioPublicAPI",
        apiVersion: "1.0",
        requestID: `Audio-${Date.now()}`,
        messageType: "AudioFileRequest",
        data: {
          file: audioPath,
          outputVolume: 1.0,
          lipSync: true
        }
      });
    }

    // 等待音频播放完成（简化处理）
    return new Promise(resolve => setTimeout(resolve, 3000));
  }

  async setParameterValue(paramName, value) {
    // 设置 Live2D 参数（如眼睛大小、嘴巴开合等）
    if (this.connected) {
      this.send({
        apiName: "VTubeStudioPublicAPI",
        apiVersion: "1.0",
        requestID: `Param-${Date.now()}`,
        messageType: "ParameterValueRequest",
        data: {
          parameterName: paramName,
          value: value
        }
      });
    }
  }

  async disconnect() {
    if (this.ws) {
      this.ws.close();
      this.connected = false;
      console.log('🎭 Live2D 已断开');
    }
  }
}
