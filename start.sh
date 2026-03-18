#!/bin/bash
#
# 八千代 AI v2.0 启动脚本
# 支持 macOS / Linux
# 自动创建虚拟环境
#

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  🌙 八千代 AI v2.0${NC}"
echo -e "${YELLOW}     平台: $(uname -s)${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 未安装，请先安装 Python 3.10+${NC}"
    exit 1
fi

# 检查环境变量
if [ -z "$OPENAI_API_KEY" ]; then
    if [ -f ".env" ]; then
        echo -e "${YELLOW}📌 加载 .env 配置...${NC}"
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    if [ -z "$OPENAI_API_KEY" ]; then
        echo -e "${RED}❌ 请设置 OPENAI_API_KEY 环境变量${NC}"
        echo ""
        echo "设置方式:"
        echo "  临时: export OPENAI_API_KEY=your_key"
        echo "  永久: echo 'export OPENAI_API_KEY=your_key' >> ~/.bashrc"
        echo "  或创建 .env 文件写入: OPENAI_API_KEY=your_key"
        echo ""
        exit 1
    fi
fi

echo -e "${GREEN}✅ 环境检查通过${NC}"

# 启动 (虚拟环境自动创建)
echo ""
echo -e "${YELLOW}📌 启动八千代 AI...${NC}"
python3 run.py
