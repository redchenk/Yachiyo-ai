const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icons', 'icon.png'),
    backgroundColor: '#0f0c29',
    titleBarStyle: 'hiddenInset',
    show: false,
    frame: true,
    trafficLightPosition: { x: 15, y: 15 }
  });

  // 加载 demo.html
  const demoPath = path.join(__dirname, '..', 'demo.html');
  mainWindow.loadFile(demoPath);

  // 窗口准备就绪后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 开发模式打开开发者工具
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // 窗口关闭
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 创建菜单栏
  createMenu();
}

// 创建菜单栏
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '重置配置',
          click: () => {
            mainWindow.webContents.send('reset-config');
          }
        },
        {
          label: '打开模型目录',
          click: () => {
            const modelsPath = path.join(app.getPath('userData'), 'models');
            if (!fs.existsSync(modelsPath)) {
              fs.mkdirSync(modelsPath, { recursive: true });
            }
            require('electron').shell.openPath(modelsPath);
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '刷新',
          accelerator: 'F5',
          click: () => {
            mainWindow.reload();
          }
        },
        { type: 'separator' },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const zoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(zoom + 0.5);
          }
        },
        {
          label: '缩小',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const zoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(zoom - 0.5);
          }
        },
        {
          label: '重置缩放',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.setZoomLevel(0);
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于 月见八千代',
              message: '月见八千代 AI 虚拟主播',
              detail: `版本：1.0.0\n\n虚拟世界"月读"的管理员\n辉夜姬八千年孤独后的未来形态`,
              buttons: ['确定']
            });
          }
        },
        {
          label: '查看文档',
          click: () => {
            require('electron').shell.openExternal('https://github.com/redchenk/Yachiyo-ai');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Electron 就绪
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 通信处理
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('open-external', (event, url) => {
  require('electron').shell.openExternal(url);
});

// 阻止导航到外部链接
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});
