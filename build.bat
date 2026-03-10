@echo off
chcp 65001 >nul
echo 🌙 月见八千代 - 构建脚本
echo ========================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误：需要安装 Node.js
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo    版本：%NODE_VERSION%
echo.

echo 📦 安装依赖...
call npm ci --prefer-offline

echo.
echo 🔨 开始构建...
echo.

echo 🪟 构建 Windows 版本...
call npm run build:win

echo.
echo ✅ 构建完成！
echo.
echo 📦 构建产物位置：dist\
echo.
dir dist

pause
