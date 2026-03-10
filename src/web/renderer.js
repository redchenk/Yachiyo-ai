/**
 * Live2D 渲染器 - 内置 PixiJS + Cubism SDK
 * 不依赖 VTube Studio，直接渲染模型
 */

import { LAppModel } from './lappmodel.js';
import { LAppPal } from './lapppal.js';

export class Live2DRenderer {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.gl = null;
    this.models = [];
    this.currentModel = null;
    this.platform = null;
    this.frame = false;
    
    this.onModelLoaded = null;
    this.onExpressionChanged = null;
  }

  async initialize() {
    // 初始化 Cubism SDK
    const option = { logLevel: LAppPal.LOG_LEVEL }
    await Live2DCubismFramework.startUp(option);
    Live2DCubismFramework.initialize();
    
    // 初始化 WebGL
    this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
    if (!this.gl) {
      console.error('WebGL 不支持');
      return false;
    }
    
    // 设置 canvas 尺寸
    this.resize();
    
    // 初始化平台
    this.platform = new LAppPal();
    
    console.log('✅ Live2D 渲染器初始化完成');
    return true;
  }

  async loadModel(modelPath, modelFile) {
    console.log(`🎭 加载模型：${modelPath}/${modelFile}`);
    
    try {
      // 释放旧模型
      this.releaseModels();
      
      // 创建新模型
      const model = new LAppModel();
      model.renderer = this;
      
      // 加载模型文件
      await model.loadModel(modelPath, modelFile);
      
      this.models.push(model);
      this.currentModel = model;
      
      // 隐藏加载提示
      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'none';
      
      console.log('✅ 模型加载完成');
      
      if (this.onModelLoaded) {
        this.onModelLoaded(model);
      }
      
      return model;
    } catch (error) {
      console.error('模型加载失败:', error);
      throw error;
    }
  }

  resize() {
    const dpi = window.devicePixelRatio || 1;
    this.canvas.width = this.config.canvas.width * dpi;
    this.canvas.height = this.config.canvas.height * dpi;
    this.canvas.style.width = `${this.config.canvas.width}px`;
    this.canvas.style.height = `${this.config.canvas.height}px`;
    
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  setExpression(expressionId) {
    if (this.currentModel) {
      console.log(`🎭 切换表情：${expressionId}`);
      this.currentModel.setExpression(expressionId);
      
      if (this.onExpressionChanged) {
        this.onExpressionChanged(expressionId);
      }
    }
  }

  playMotion(motionGroup, motionId) {
    if (this.currentModel) {
      console.log(`🎭 播放动作：${motionGroup}_${motionId}`);
      this.currentModel.playMotion(motionGroup, motionId);
    }
  }

  setLipSync(value) {
    // 设置口型同步参数
    if (this.currentModel) {
      this.currentModel.setParameterValueById('ParamMouthOpenY', value);
    }
  }

  setParameterValue(paramId, value) {
    if (this.currentModel) {
      this.currentModel.setParameterValueById(paramId, value);
    }
  }

  startRenderLoop() {
    const render = () => {
      this.frame = !this.frame;
      
      if (this.frame) {
        this.update();
        this.render();
      }
      
      requestAnimationFrame(render);
    };
    
    render();
  }

  update() {
    // 更新模型
    for (const model of this.models) {
      model.update();
    }
  }

  render() {
    const gl = this.gl;
    
    // 清除
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearDepth(1.0);
    
    // 渲染模型
    for (const model of this.models) {
      model.render(gl);
    }
  }

  releaseModels() {
    for (const model of this.models) {
      model.release();
    }
    this.models = [];
    this.currentModel = null;
  }

  dispose() {
    this.releaseModels();
    
    if (this.platform) {
      this.platform.dispose();
    }
    
    Live2DCubismFramework.dispose();
  }
}
