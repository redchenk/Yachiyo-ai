# 开发指南

## 项目结构

```
yakumo-ai/
├── src/
│   ├── index.js           # 主入口
│   ├── core/
│   │   └── brain.js       # AI 大脑 (LLM)
│   ├── web/
│   │   ├── server.js      # Web 服务器
│   │   ├── renderer.js    # Live2D 渲染器
│   │   ├── lappmodel.js   # 模型类
│   │   ├── lapppal.js     # 平台适配
│   │   └── index.html     # 前端页面
│   ├── voice/
│   │   └── service.py     # 语音服务
│   └── minecraft/
│       └── bot.js         # MC 机器人
├── models/                # Live2D 模型
├── config/
│   └── config.json        # 配置文件
├── output/
│   └── audio/             # 生成的音频
└── docs/
```

## 添加新表情

1. 在模型文件中添加表情定义
2. 在配置文件中注册：

```json
{
  "live2d": {
    "expressions": {
      "neutral": "exp_00",
      "happy": "exp_01",
      "surprised": "exp_02",
      "thinking": "exp_03",
      "custom": "exp_custom"  // 新表情
    }
  }
}
```

3. 在 AI 大脑中添加情感映射：

```javascript
// src/core/brain.js
emotion: "neutral|happy|surprised|thinking|sad|angry|excited|custom"
```

## 添加新动作

1. 准备动作文件 (.motion3.json)
2. 在模型配置中引用
3. 通过 API 调用：

```javascript
// 播放动作
POST /api/motion
{
  "group": "special",
  "id": 1
}
```

## 自定义 AI 人设

编辑 `src/core/brain.js` 中的 `systemPrompt`：

```javascript
buildSystemPrompt() {
  return `你是${this.systemName}，...

## 你的设定
- 年龄：永远的 17 岁
- 爱好：玩游戏、唱歌
- 说话风格：活泼可爱
...
`;
}
```

## 集成新 TTS

1. 实现 TTS 接口（HTTP POST）
2. 更新配置：

```json
{
  "tts": {
    "provider": "custom",
    "baseUrl": "http://your-tts-service:5000"
  }
}
```

3. 在 `src/voice/service.py` 中添加处理方法

## 调试技巧

### 查看 Live2D 日志

在 `src/web/lapppal.js` 中设置：

```javascript
static LOG_LEVEL = 1; // 0=关闭，1=开启
```

### 测试 API

```bash
# 测试表情
curl -X POST http://localhost:3000/api/expression \
  -H "Content-Type: application/json" \
  -d '{"expression": "happy"}'

# WebSocket 测试
wscat -c ws://localhost:3000/ws
> {"type": "user_input", "text": "你好"}
```

### 性能监控

```javascript
// 在 renderer.js 中添加
debug() {
  const fps = this.getFPS();
  console.log(`FPS: ${fps}, Models: ${this.models.length}`);
}
```

## 常见问题

### Live2D 不显示
- 检查模型文件路径
- 确认 WebGL 支持
- 查看浏览器控制台错误

### LLM 响应慢
- 使用更小的模型
- 增加 context length
- 使用 GPU 加速

### 音频播放问题
- 检查文件路径
- 确认音频格式
- 测试直接播放

## 扩展功能

### 添加弹幕集成
```javascript
// src/integrations/danmaku.js
export class DanmakuService {
  constructor(config) {
    this.ws = new WebSocket(config.url);
  }
  
  onDanmaku(callback) {
    this.ws.onmessage = (e) => {
      callback(JSON.parse(e.data));
    };
  }
}
```

### 添加记忆系统
```javascript
// src/core/memory.js
export class MemorySystem {
  constructor() {
    this.memories = [];
  }
  
  add(text) {
    this.memories.push({ text, time: Date.now() });
  }
  
  get(query) {
    // 语义搜索
  }
}
```
