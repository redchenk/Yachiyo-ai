/**
 * Live2D 模型类
 * 基于 Cubism SDK 封装
 */

import { LAppPal } from './lapppal.js';

export class LAppModel {
  constructor() {
    this.renderer = null;
    this.model = null;
    this.motionManager = null;
    this.expressionManager = null;
    this.textures = [];
    this.modelHomeDir = '';
    this.modelSetting = null;
    this.dragManager = null;
    this.dragX = 0;
    this.dragY = 0;
  }

  async loadModel(modelPath, modelFile) {
    this.modelHomeDir = modelPath;
    
    const pal = new LAppPal();
    
    // 加载模型设置文件
    const settingPath = `${modelPath}/${modelFile}`;
    this.modelSetting = await pal.loadJson(settingPath);
    
    // 创建模型实例
    this.model = Live2DCubismFramework.getModel();
    
    // 加载模型数据
    const modelJsonPath = this.modelSetting.FileReferences.Moc;
    const mocBuffer = await pal.loadFile(`${modelPath}/${modelJsonPath}`);
    this.model.loadMoc(mocBuffer);
    
    // 加载纹理
    const texturePaths = this.modelSetting.FileReferences.Textures;
    for (let i = 0; i < texturePaths.length; i++) {
      const img = await pal.loadTexture(`${modelPath}/${texturePaths[i]}`);
      const texture = this.createTexture(img);
      this.textures.push(texture);
    }
    
    // 加载物理效果
    if (this.modelSetting.FileReferences.Physics) {
      const physicsBuffer = await pal.loadFile(
        `${modelPath}/${this.modelSetting.FileReferences.Physics}`
      );
      this.model.loadPhysics(physicsBuffer);
    }
    
    // 加载表情
    if (this.modelSetting.FileReferences.Expressions) {
      this.expressionManager = Live2DCubismFramework.getExpressionManager();
      const expressions = this.modelSetting.FileReferences.Expressions;
      
      for (const exp of expressions) {
        const expBuffer = await pal.loadFile(`${modelPath}/${exp.File}`);
        this.expressionManager.loadExpression(exp.Name, expBuffer);
      }
    }
    
    // 加载动作
    if (this.modelSetting.FileReferences.Motions) {
      this.motionManager = Live2DCubismFramework.getMotionManager();
      const motions = this.modelSetting.FileReferences.Motions;
      
      for (const [group, motionList] of Object.entries(motions)) {
        for (const motion of motionList) {
          const motionBuffer = await pal.loadFile(`${modelPath}/${motion.File}`);
          this.motionManager.loadMotion(group, motionBuffer);
        }
      }
    }
    
    // 初始化模型
    this.model.initialize();
    
    // 设置默认表情
    if (this.expressionManager) {
      this.expressionManager.setExpression('neutral');
    }
    
    LAppPal.printLog(`模型加载完成：${modelFile}`);
  }

  createTexture(img) {
    const gl = this.renderer.gl;
    const texture = gl.createTexture();
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    return texture;
  }

  update() {
    const deltaTime = 16 / 1000; // 约 60fps
    
    if (this.motionManager) {
      this.motionManager.update(deltaTime);
    }
    
    if (this.expressionManager) {
      this.expressionManager.update(deltaTime);
    }
    
    // 更新模型
    this.model.update();
  }

  render(gl) {
    if (!this.model) return;
    
    // 设置投影矩阵
    const width = this.renderer.canvas.width;
    const height = this.renderer.canvas.height;
    
    this.model.setMatrix(gl, width, height);
    this.model.draw(gl);
  }

  setExpression(expressionId) {
    if (this.expressionManager) {
      this.expressionManager.setExpression(expressionId);
    }
  }

  playMotion(group, id) {
    if (this.motionManager) {
      this.motionManager.startMotion(group, id);
    }
  }

  setParameterValue(paramId, value) {
    if (this.model) {
      this.model.setParameterValueById(paramId, value);
    }
  }

  release() {
    // 释放纹理
    const gl = this.renderer.gl;
    for (const texture of this.textures) {
      if (texture) {
        gl.deleteTexture(texture);
      }
    }
    this.textures = [];
    
    // 释放模型
    if (this.model) {
      this.model.release();
      this.model = null;
    }
    
    this.motionManager = null;
    this.expressionManager = null;
  }
}
