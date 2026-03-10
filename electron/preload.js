const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // 获取用户数据路径
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  
  // 打开外部链接
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // 监听重置配置事件
  onResetConfig: (callback) => {
    ipcRenderer.on('reset-config', callback);
  },
  
  // 移除监听器
  removeResetConfigListener: () => {
    ipcRenderer.removeAllListeners('reset-config');
  }
});

// 平台信息
contextBridge.exposeInMainWorld('platform', {
  isElectron: true,
  platform: process.platform
});
