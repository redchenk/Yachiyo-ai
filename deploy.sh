#!/bin/bash
# Yachiyo-ai 部署脚本

set -e

echo "🚀 开始部署 Yachiyo-ai..."

# 创建应用目录
APP_DIR="/opt/yachiyo-ai"
mkdir -p $APP_DIR

# 复制文件
echo "📦 复制文件..."
cp -r frontend $APP_DIR/
cp -r backend $APP_DIR/ 2>/dev/null || echo "后端目录不存在，跳过"
cp README.md $APP_DIR/

cd $APP_DIR/frontend

# 安装依赖
echo "📥 安装前端依赖..."
npm install --production

# 创建 systemd 服务文件
echo "⚙️ 创建系统服务..."
cat > /etc/systemd/system/yachiyo-ai-frontend.service << 'EOF'
[Unit]
Description=Yachiyo-ai Frontend
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/opt/yachiyo-ai/frontend
ExecStart=/usr/bin/npm run dev
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 如果使用 PM2
echo ""
echo "💡 或者使用 PM2 运行:"
echo "   cd $APP_DIR/frontend"
echo "   pm2 start npm --name yachiyo-ai-frontend -- run dev"

echo ""
echo "✅ 部署完成!"
echo ""
echo "启动服务:"
echo "  systemctl daemon-reload"
echo "  systemctl enable yachiyo-ai-frontend"
echo "  systemctl start yachiyo-ai-frontend"
echo ""
echo "访问：http://服务器IP:5173"
