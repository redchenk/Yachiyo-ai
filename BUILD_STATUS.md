# 🚀 构建状态

## 当前构建

**版本**: v1.0.0  
**状态**: 🟡 构建中...  
**开始时间**: 2026-03-10T16:26:33Z

### 查看构建进度

1. **GitHub Actions 页面**:  
   https://github.com/redchenk/Yachiyo-ai/actions/runs/22912883699

2. **Releases 页面**:  
   https://github.com/redchenk/Yachiyo-ai/releases

### 构建流程

```
推送标签 v1.0.0
    ↓
触发 GitHub Actions
    ↓
并行构建 (3 个平台)
├── 🪟 Windows (windows-latest)
│   ├── 安装依赖
│   ├── 构建 NSIS 安装版
│   └── 构建 Portable 便携版
├── 🍎 macOS (macos-latest)
│   ├── 安装依赖
│   └── 构建 DMG
└── 🐧 Linux (ubuntu-latest)
    ├── 安装依赖
    ├── 构建 AppImage
    └── 构建 DEB 包
    ↓
上传到 Releases
    ↓
完成！
```

### 预计时间

- **Windows**: ~15-20 分钟
- **macOS**: ~20-25 分钟
- **Linux**: ~10-15 分钟

总时间：约 20-30 分钟（并行构建）

### 构建产物

完成后将在 Releases 页面显示：

```
📦 Yachiyo-ai v1.0.0
├── 🪟 Windows
│   ├── Yachiyo AI Setup 1.0.0.exe    (安装版)
│   └── Yachiyo AI 1.0.0.exe          (便携版)
├── 🍎 macOS
│   └── Yachiyo AI 1.0.0.dmg
└── 🐧 Linux
    ├── Yachiyo AI 1.0.0.AppImage
    └── yachiyo-ai_1.0.0_amd64.deb
```

## 手动触发构建

如果需要重新构建：

### 方法 1: GitHub UI
1. 访问 https://github.com/redchenk/Yachiyo-ai/actions/workflows/build.yml
2. 点击 "Run workflow"
3. 选择分支/标签
4. 点击 "Run workflow"

### 方法 2: 命令行
```bash
# 删除旧标签（谨慎！）
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0

# 重新创建标签
git tag v1.0.0
git push origin v1.0.0
```

## 故障排除

### 构建失败

查看日志：
1. 访问 Actions 页面
2. 点击失败的构建
3. 查看具体错误信息

常见问题：
- **内存不足**: macOS 构建需要较多内存
- **依赖安装失败**: 检查网络连接
- **签名错误**: macOS 公证需要 Apple Developer 账号

### 产物缺失

检查 `package.json` 的 `build.files` 配置，确保包含所有需要的文件。

## 下载构建产物

构建完成后，访问：
https://github.com/redchenk/Yachiyo-ai/releases/tag/v1.0.0

直接下载对应平台的安装包。

---

**构建状态会实时更新，请稍候...** 🌙
