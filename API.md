# API 接口文档

## WebSocket (ws://localhost:3000/ws)

### 服务端 → 客户端

#### 表情切换
```json
{
  "type": "expression",
  "expression": "happy"
}
```

可用表情：`neutral`, `happy`, `surprised`, `thinking`, `sad`, `angry`, `excited`

#### 动作播放
```json
{
  "type": "motion",
  "group": "idle",
  "id": 1
}
```

#### 口型同步
```json
{
  "type": "lipsync",
  "value": 0.5
}
```
值范围：0.0 - 1.0

#### 参数设置
```json
{
  "type": "parameter",
  "paramId": "ParamEyeLOpen",
  "value": 0.8
}
```

#### 音频播放
```json
{
  "type": "audio",
  "path": "/output/audio/tts_xxx.wav",
  "text": "要播放的文本"
}
```

#### 说话状态
```json
{
  "type": "speaking",
  "value": true
}
```

### 客户端 → 服务端

#### 文字输入
```json
{
  "type": "user_input",
  "text": "你好呀"
}
```

#### 语音输入（识别结果）
```json
{
  "type": "voice_input",
  "text": "识别到的文字"
}
```

#### 图片输入
```json
{
  "type": "image_input",
  "imagePath": "/path/to/image.jpg",
  "question": "这张图里有什么？"
}
```

---

## REST API

### GET /api/health
健康检查

**响应:**
```json
{
  "status": "ok",
  "name": "八千代"
}
```

### POST /api/expression
设置表情

**请求:**
```json
{
  "expression": "happy"
}
```

### POST /api/motion
播放动作

**请求:**
```json
{
  "group": "idle",
  "id": 1
}
```

### POST /api/parameter
设置参数

**请求:**
```json
{
  "paramId": "ParamMouthOpenY",
  "value": 0.5
}
```

### POST /api/lipsync
口型同步

**请求:**
```json
{
  "value": 0.5
}
```

### GET /api/models
获取可用模型列表

**响应:**
```json
{
  "models": ["yakumo", "other"]
}
```

---

## 常用 Live2D 参数

| 参数 ID | 说明 | 范围 |
|---------|------|------|
| ParamEyeLOpen | 左眼开合 | 0-1 |
| ParamEyeROpen | 右眼开合 | 0-1 |
| ParamEyeBallX | 眼球 X | -1-1 |
| ParamEyeBallY | 眼球 Y | -1-1 |
| ParamMouthOpenY | 嘴巴开合 | 0-1 |
| ParamBodyAngleX | 身体倾斜 X | -1-1 |
| ParamBodyAngleY | 身体倾斜 Y | -1-1 |
| ParamBreath | 呼吸 | 0-1 |
| ParamHairFront | 前发飘动 | 0-1 |

---

## 集成示例

### JavaScript (前端)
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onopen = () => {
  console.log('已连接');
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  
  switch(msg.type) {
    case 'expression':
      setExpression(msg.expression);
      break;
    case 'audio':
      playAudio(msg.path);
      break;
  }
};

// 发送消息
function sendMessage(text) {
  ws.send(JSON.stringify({
    type: 'user_input',
    text: text
  }));
}
```

### Python
```python
import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    print(f"收到：{data}")

def send_input(text):
    ws.send(json.dumps({
        "type": "user_input",
        "text": text
    }))

ws = websocket.WebSocketApp(
    "ws://localhost:3000/ws",
    on_message=on_message
)
```

### curl
```bash
# 设置表情
curl -X POST http://localhost:3000/api/expression \
  -H "Content-Type: application/json" \
  -d '{"expression": "happy"}'

# 播放动作
curl -X POST http://localhost:3000/api/motion \
  -H "Content-Type: application/json" \
  -d '{"group": "idle", "id": 1}'
```
