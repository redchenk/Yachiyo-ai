# 🌙 网页演示版

## 快速预览

打开 `demo.html` 即可在浏览器中体验八千代的聊天界面！

```bash
# 直接在浏览器打开
open demo.html

# 或使用任意 HTTP 服务器
python3 -m http.server 8080
# 访问 http://localhost:8080/demo.html
```

## 功能特性

### ✨ 当前功能

- 🌌 星空背景动画
- 💬 聊天界面（模拟回复）
- 🎭 情感状态指示器
- ⚡ 快捷问题按钮
- 📱 响应式设计

### 🔗 连接真实后端

编辑 `demo.html` 中的 `sendMessage()` 函数：

```javascript
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  
  addMessage(text, true);
  userInput.value = '';
  
  // 调用真实 API
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  });
  
  const data = await response.json();
  addMessage(data.text, false);
  emotionText.textContent = data.emotion;
}
```

## 截图预览

```
┌─────────────────────────────────────────────────────┐
│  🌙 月见八千代          │  💬 与八千代对话          │
│  虚拟世界"月读"的管理员  │                           │
│                           │  八千代：               │
│     [Live2D 模型]         │  欢迎来到"月读"...      │
│                           │                         │
│                           │  你：你幸福吗？         │
│                           │                         │
│                           │  八千代：               │
│     🟢 在线 - 温柔        │  幸福啊……松饼的味道...  │
│                           │                         │
│  ━━━━━━━━━━━━━━━━━━━━━━  │  [🥞 松饼] [💫 孤独]    │
│                           │  [⏳ 八千年]            │
│                           │  ━━━━━━━━━━━━━━━━━━━━  │
│                           │  [输入框]      [发送]   │
└─────────────────────────────────────────────────────┘
```

## 自定义

### 修改角色名称

```html
<h1>🌙 你的角色名</h1>
```

### 修改配色方案

```css
/* 主色调 */
background: linear-gradient(135deg, #c471ed 0%, #f64f59 100%);

/* 背景色 */
background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
```

### 添加更多快捷问题

```html
<button class="quick-btn" onclick="sendQuick('你的问题')">🏷️ 显示文本</button>
```

## 部署

### GitHub Pages

1. 启用 GitHub Pages（仓库设置 → Pages）
2. 选择 `main` 分支
3. 访问 `https://你的用户名.github.io/Yachiyo-ai/demo.html`

### Vercel / Netlify

直接连接 GitHub 仓库，自动部署！

## 下一步

- [ ] 集成真实 WebSocket API
- [ ] 添加 Live2D 模型渲染
- [ ] 添加语音播放功能
- [ ] 添加聊天记录保存
- [ ] 添加主题切换

---

**享受与八千代的对话吧！** 🌙
