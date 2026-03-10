# 📦 发布指南

## 自动构建 (推荐)

### 步骤 1: 打版本标签

```bash
# 更新版本号 (在 package.json 中)
npm version patch  # 1.0.0 -> 1.0.1 (补丁版本)
# 或
npm version minor  # 1.0.0 -> 1.1.0 (次要版本)
# 或
npm version major  # 1.0.0 -> 2.0.0 (主要版本)
```

### 步骤 2: 推送标签

```bash
git push origin v1.0.0
```

### 步骤 3: 等待自动构建

GitHub Actions 会自动：
1. 在 Windows、macOS、Linux 上构建
2. 生成安装包
3. 创建 GitHub Release
4. 上传所有构建产物

### 步骤 4: 查看 Release

访问：https://github.com/redchenk/Yachiyo-ai/releases

## 手动构建

### Windows

```bash
# 使用 PowerShell 或 CMD
build.bat

# 或手动执行
npm install
npm run build:win
```

构建产物：
- `dist/Yachiyo AI Setup 1.0.0.exe` - 安装版
- `dist/Yachiyo AI 1.0.0.exe` - 便携版

### macOS

```bash
chmod +x build.sh
./build.sh

# 或手动执行
npm install
npm run build:mac
```

构建产物：
- `dist/Yachiyo AI 1.0.0.dmg` - 磁盘镜像

### Linux

```bash
chmod +x build.sh
./build.sh

# 或手动执行
npm install
npm run build:linux
```

构建产物：
- `dist/Yachiyo AI 1.0.0.AppImage` - 免安装
- `dist/yachiyo-ai_1.0.0_amd64.deb` - Debian 包

## 测试构建

在推送标签前，可以先测试构建：

```bash
# 本地测试构建
npm install
npm run build

# 检查输出
ls -lh dist/
```

## 上传到 Releases

### 方法 1: 自动 (推荐)

使用 GitHub Actions，推送标签自动上传。

### 方法 2: 手动上传

1. 访问 https://github.com/redchenk/Yachiyo-ai/releases/new
2. 选择或创建标签
3. 填写发布说明
4. 上传 `dist/` 目录下的所有文件
5. 点击发布

## 版本命名规范

遵循语义化版本 (Semantic Versioning)：

```
主版本号。次版本号。修订号
  ↑      ↑      ↑
  |      |      └─ 向后兼容的问题修正
  |      └─ 向后兼容的功能新增
  └─ 不兼容的 API 修改
```

示例：
- `1.0.0` - 首个正式版本
- `1.0.1` - 修复 bug
- `1.1.0` - 新增功能
- `2.0.0` - 重大更新/破坏性变更

## 发布说明模板

```markdown
## 🌙 月见八千代 v1.0.0

### ✨ 新功能
- 功能 1
- 功能 2

### 🐛 Bug 修复
- 修复问题 1
- 修复问题 2

### 📝 更新说明
- 更新内容 1
- 更新内容 2

### 📦 下载
- Windows: Yachiyo AI Setup 1.0.0.exe
- macOS: Yachiyo AI 1.0.0.dmg
- Linux: Yachiyo AI 1.0.0.AppImage
```

## 签名和公证 (可选)

### Windows 代码签名

需要购买代码签名证书：

```json
"build": {
  "win": {
    "certificateSubjectName": "Your Company",
    "sign": "signtool sign /tr http://timestamp.digicert.com /td sha256 /fd sha256 /f \"${CERT_FILE}\" /p \"${CERT_PASS}\" \"$path\""
  }
}
```

### macOS 公证

需要 Apple Developer 账号：

```bash
xcrun notarytool submit dist/Yachiyo\ AI\ 1.0.0.dmg \
  --apple-id "your@email.com" \
  --password "app-specific-password" \
  --team-id "TEAM_ID"
```

## 分发渠道

### GitHub Releases (推荐)
- 免费
- 自动 CDN
- 版本管理方便

### 官网下载
- 自建服务器
- 需要 CDN 加速

### 应用商店
- Microsoft Store
- Mac App Store
- Snap Store (Linux)

## 常见问题

### Q: 构建失败怎么办？
A: 查看错误日志，通常是缺少依赖或图标文件。

### Q: 如何减小安装包体积？
A: 优化模型文件，使用更小的 LLM 模型。

### Q: 可以自定义安装包名称吗？
A: 可以，在 `package.json` 的 `build.productName` 中修改。

### Q: 如何添加安装后自动启动？
A: 在 NSIS 配置中添加 `include: "build/installer.nsh"`。

---

**发布愉快！** 🌙
