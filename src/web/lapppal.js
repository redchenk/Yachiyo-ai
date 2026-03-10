/**
 * Live2D 平台适配层
 */

export class LAppPal {
  static LOG_LEVEL = 0;
  
  constructor() {
    this.startTime = Date.now();
  }

  /**
   * 获取运行时间（秒）
   */
  getElapsedTime() {
    return (Date.now() - this.startTime) / 1000;
  }

  /**
   * 加载文件
   */
  async loadFile(fileName) {
    const response = await fetch(fileName);
    if (!response.ok) {
      throw new Error(`文件加载失败：${fileName}`);
    }
    return await response.arrayBuffer();
  }

  /**
   * 加载 JSON
   */
  async loadJson(fileName) {
    const buffer = await this.loadFile(fileName);
    const decoder = new TextDecoder('utf-8');
    const jsonStr = decoder.decode(buffer);
    return JSON.parse(jsonStr);
  }

  /**
   * 加载纹理
   */
  async loadTexture(fileName) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`纹理加载失败：${fileName}`));
      img.src = fileName;
    });
  }

  /**
   * 日志输出
   */
  printLog(message) {
    if (LAppPal.LOG_LEVEL >= 1) {
      console.log(message);
    }
  }

  printError(message) {
    if (LAppPal.LOG_LEVEL >= 1) {
      console.error(message);
    }
  }

  dispose() {
    // 清理资源
  }
}
