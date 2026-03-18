@echo off
chcp 65001 >nul
title 八千代 AI

echo ================================================
echo   🌙 八千代 AI v2.0 - Windows 启动器
echo ================================================
echo.

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 未安装，请先安装 Python 3.10+
    pause
    exit /b 1
)

REM 检查环境变量
if "%OPENAI_API_KEY%"=="" (
    echo ⚠️  未设置 OPENAI_API_KEY
    echo 请创建 .env 文件或设置环境变量
    echo 示例: set OPENAI_API_KEY=your_api_key
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

REM 启动
echo.
echo 📌 启动八千代 AI...
python run.py

pause
