#!/bin/bash
# 八千代 AI 虚拟主播启动脚本

set -e

echo "🌸 八千代 AI 虚拟主播系统"
echo "========================"

# 检查配置
if [ ! -f "config/config.json" ]; then
    echo "⚠️  配置文件不存在，从示例创建..."
    cp config/config.example.json config/config.json
    echo "📝 请编辑 config/config.json 填写 API 密钥"
    exit 1
fi

# 安装 Node.js 依赖
echo "📦 安装 Node.js 依赖..."
npm install

# 安装 Python 依赖（可选）
if command -v pip3 &> /dev/null; then
    echo "🐍 安装 Python 依赖..."
    pip3 install -r requirements.txt
fi

# 启动服务
echo ""
echo "🚀 启动八千代..."
node src/index.js
