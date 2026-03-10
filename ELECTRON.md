# Electron 构建说明

## 📦 构建产物

### Windows
- `Yachiyo AI Setup x.x.x.exe` - 安装版 (NSIS)
- `Yachiyo AI x.x.x.exe` - 便携版 (Portable)

### macOS
- `Yachiyo AI x.x.x.dmg` - 磁盘镜像 (支持 Intel 和 Apple Silicon)

### Linux
- `Yachiyo AI x.x.x.AppImage` - 免安装应用
- `yachiyo-ai_x.x.x_amd64.deb` - Debian/Ubuntu 安装包

## 🚀 快速构建

### 本地构建

```bash
# 安装依赖
npm install

# 构建所有平台 (需要对应系统)
npm run build

# 仅构建 Windows
npm run build:win

# 仅构建 macOS
npm run build:mac

# 仅构建 Linux
npm run build:linux
```

### GitHub Actions 自动构建

推送标签自动构建:

```bash
# 打标签
git tag v1.0.0
git push origin v1.0.0

# 触发 GitHub Actions 构建并上传到 Releases
```

## 📝 构建前准备

### 1. 安装依赖

```bash
npm install
```

### 2. 准备图标文件

在 `electron/icons/` 目录下放置:

- `icon.ico` (Windows, 256x256)
- `icon.icns` (macOS, 512x512)
- `icon.png` (Linux, 512x512)

### 3. 准备 Live2D 模型 (可选)

将模型文件放入 `models/yakumo/` 目录。

## 🔧 自定义配置

### 修改应用信息

编辑 `package.json`:

```json
{
  "name": "yachiyo-ai",
  "version": "1.0.0",
  "description": "🌙 月见八千代 AI 虚拟主播",
  "build": {
    "appId": "ai.yachiyo.vtuber",
    "productName": "Yachiyo AI"
  }
}
```

### 修改构建目标

编辑 `package.json` 的 `build` 部分:

```json
"build": {
  "win": {
    "target": ["nsis", "portable"]
  },
  "mac": {
    "target": ["dmg"]
  },
  "linux": {
    "target": ["AppImage", "deb"]
  }
}
```

## 📊 构建产物说明

### Windows NSIS 安装版
- 标准安装程序
- 创建桌面快捷方式
- 支持卸载
- 可自定义安装路径

### Windows Portable 便携版
- 单文件可执行
- 无需安装
- 适合 U 盘携带
- 数据保存在同目录

### macOS DMG
- 标准 macOS 安装包
- 拖拽安装到 Applications
- 支持 Intel 和 Apple Silicon

### Linux AppImage
- 通用 Linux 格式
- 无需安装
- 双击即可运行
- 适合大多数发行版

### Linux DEB
- Debian/Ubuntu 专用
- 包管理器安装
- 自动处理依赖

## 🐛 常见问题

### 构建失败：找不到图标
确保 `electron/icons/` 目录下有对应的图标文件。

### 构建失败：内存不足
Electron 构建需要较多内存，建议至少 4GB 可用内存。

### macOS 签名问题
正式分发需要 Apple Developer 签名，开发测试可跳过。

### Windows SmartScreen 警告
首次运行可能显示警告，点击"仍要运行"即可。

## 📦 分发

### GitHub Releases
自动构建并上传到 GitHub Releases，用户可直接下载。

### 手动分发
构建产物在 `dist/` 目录，可自行上传到服务器或云存储。

## 🔐 代码签名 (可选)

### Windows
```json
"win": {
  "certificateSubjectName": "Your Company Name",
  "sign": "signtool sign /tr http://timestamp.digicert.com /td sha256 /fd sha256 /f \"${CERTIFICATE_FILE}\" /p \"${CERTIFICATE_PASSWORD}\" \"$path\""
}
```

### macOS
```json
"mac": {
  "hardenedRuntime": true,
  "gatekeeperAssess": false,
  "entitlements": "build/entitlements.mac.plist",
  "entitlementsInherit": "build/entitlements.mac.plist"
}
```

## 📚 相关资源

- [Electron 官方文档](https://www.electronjs.org/)
- [electron-builder 文档](https://www.electron.build/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

**构建愉快！** 🌙
