#!/usr/bin/env bash
# 快速构建脚本

set -e

echo "🌙 月见八千代 - 构建脚本"
echo "========================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：需要安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本：$(node -v)"
echo "✅ npm 版本：$(npm -v)"
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm ci --prefer-offline

echo ""
echo "🔨 开始构建..."
echo ""

# 检测操作系统
case "$(uname -s)" in
    Darwin*)
        echo "🍎 检测到 macOS，构建 DMG..."
        npm run build:mac
        ;;
    Linux*)
        echo "🐧 检测到 Linux，构建 AppImage 和 DEB..."
        npm run build:linux
        ;;
    MINGW*|CYGWIN*|MSYS*)
        echo "🪟 检测到 Windows，构建 NSIS 和 Portable..."
        npm run build:win
        ;;
    *)
        echo "❓ 未知系统，尝试构建所有平台..."
        npm run build
        ;;
esac

echo ""
echo "✅ 构建完成！"
echo ""
echo "📦 构建产物位置：dist/"
echo ""
echo "查看文件:"
ls -lh dist/
