# 🌙 网页版使用指南

## 快速开始

```bash
# 方式 1: 直接打开
open demo.html

# 方式 2: 使用 HTTP 服务器
python3 -m http.server 8080
# 访问 http://localhost:8080/demo.html
```

## ⚙️ API 配置

点击页面右上角的 **⚙️** 按钮打开设置面板。

### 预设配置

#### Ollama (本地部署)
```
API 提供商：Ollama (本地)
API 地址：http://localhost:11434/v1
API 密钥：(留空)
模型名称：qwen2.5:72b
```

#### 通义千问
```
API 提供商：通义千问
API 地址：https://dashscope.aliyuncs.com/api/v1
API 密钥：sk-xxxxx (你的密钥)
模型名称：qwen-max
```

#### OpenAI
```
API 提供商：OpenAI
API 地址：https://api.openai.com/v1
API 密钥：sk-xxxxx
模型名称：gpt-4o
```

#### 自定义 (OpenAI 兼容)
```
API 提供商：自定义
API 地址：http://你的服务器：3000
API 密钥：(可选)
模型名称：任意
```

## 🎭 Live2D 配置

### 模型文件结构

```
models/yakumo/
├── yakumo.model3.json    # 模型定义文件
├── yakumo.moc3          # 模型数据
├── textures/
│   ├── texture_00.png
│   └── ...
├── motions/
│   ├── idle.motion3.json
│   └── ...
└── expressions/
    ├── neutral.exp3.json
    └── ...
```

### 配置示例

```
模型路径：./models/yakumo
模型文件：yakumo.model3.json
```

## 🔌 后端 API 接口

### WebSocket (推荐)

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

// 发送消息
ws.send(JSON.stringify({
  type: 'user_input',
  text: '你好'
}));

// 接收回复
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // data.type: 'response' | 'expression' | 'audio' | 'speaking'
};
```

### HTTP API (降级方案)

```javascript
POST /v1/chat/completions
Content-Type: application/json
Authorization: Bearer sk-xxx

{
  "model": "qwen2.5:72b",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "你好"}
  ]
}
```

## 📱 功能特性

### ✅ 已实现

- [x] 实时聊天界面
- [x] WebSocket 连接
- [x] HTTP API 降级
- [x] 自定义 API 配置
- [x] 本地存储配置
- [x] 快捷问题按钮
- [x] 情感状态显示
- [x] Live2D 渲染框架
- [x] 星空背景动画
- [x] 响应式设计

### 🚧 待完善

- [ ] 完整 Live2D 模型加载
- [ ] 语音播放功能
- [ ] 聊天记录保存
- [ ] 多主题切换
- [ ] 表情手动切换

## 🎨 自定义样式

编辑 `demo.html` 中的 CSS 部分：

```css
/* 修改主色调 */
background: linear-gradient(135deg, #c471ed 0%, #f64f59 100%);

/* 修改背景 */
background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
```

## 📦 部署

### GitHub Pages

1. 仓库设置 → Pages
2. 选择 `main` 分支
3. 访问：`https://redchenk.github.io/Yachiyo-ai/demo.html`

### Vercel / Netlify

直接连接 GitHub 仓库自动部署。

### 自建服务器

```bash
# Nginx 配置示例
server {
    listen 80;
    server_name yachiyo.example.com;
    
    root /path/to/yakumo-ai;
    index demo.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # 反向代理到后端 API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

## 🔧 故障排除

### Live2D 显示"加载失败"

1. 检查模型文件路径是否正确
2. 确保服务器允许跨域访问
3. 查看浏览器控制台错误信息

### API 连接失败

1. 确认后端服务已启动
2. 检查 API 地址格式（http:// 或 https://）
3. 查看浏览器控制台网络请求

### 配置不保存

1. 检查浏览器是否允许 localStorage
2. 清除浏览器缓存后重试
3. 使用无痕模式测试

## 📚 相关文档

- [API.md](API.md) - 完整 API 文档
- [LOCAL_SETUP.md](LOCAL_SETUP.md) - 本地部署指南
- [DEVELOPMENT.md](DEVELOPMENT.md) - 开发指南

---

**祝你使用愉快！** 🌙
