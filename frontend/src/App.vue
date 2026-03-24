<template>
  <div class="app">
    <header class="header">
      <h1>🌙 月见八千代 AI</h1>
      <div class="status" :class="connectionStatus">
        <span class="dot"></span>
        {{ connectionStatus === 'connected' ? '已连接' : '未连接' }}
      </div>
    </header>

    <main class="main">
      <!-- Live2D 视图区域 -->
      <div class="live2d-container">
        <div ref="live2dRef" class="live2d-view">
          <canvas ref="canvasRef"></canvas>
        </div>
        
        <!-- 模型加载提示 -->
        <div v-if="!modelLoaded && !loadingError" class="loading-overlay">
          <div class="loading-content">
            <div class="spinner"></div>
            <p>正在加载 Live2D 模型...</p>
          </div>
        </div>
        
        <!-- 错误提示 -->
        <div v-if="loadingError" class="error-overlay">
          <div class="error-content">
            <p>⚠️ {{ loadingError }}</p>
            <button @click="showUpload = true">📁 上传模型文件</button>
            <p class="hint">支持 .model3.json 格式的 Live2D 模型</p>
          </div>
        </div>
      </div>

      <!-- 控制面板 -->
      <div class="control-panel">
        <!-- 模型文件上传 -->
        <section class="control-section">
          <h2>📂 模型文件</h2>
          <div class="file-upload">
            <input 
              type="file" 
              ref="fileInput"
              accept=".model3.json,.json"
              @change="handleModelUpload"
              style="display: none"
            />
            <button @click="$refs.fileInput.click()" class="upload-btn">
              📁 选择 .model3.json 文件
            </button>
            <p class="hint">选择后会自动加载同目录下的贴图文件</p>
          </div>
          <div v-if="modelName" class="current-model">
            当前模型：<strong>{{ modelName }}</strong>
          </div>
        </section>

        <!-- 表情控制 -->
        <section class="control-section" v-if="expressions.length > 0">
          <h2>🎭 表情</h2>
          <div class="button-grid">
            <button 
              v-for="expr in expressions" 
              :key="expr"
              @click="setExpression(expr)"
              :class="{ active: currentExpression === expr }"
            >
              {{ getExpressionEmoji(expr) }} {{ expr }}
            </button>
          </div>
        </section>

        <!-- 动作控制 -->
        <section class="control-section">
          <h2>🎬 动作</h2>
          <div class="button-grid">
            <button @click="playMotion('idle', 'idle_01')">待机 1</button>
            <button @click="playMotion('idle', 'idle_02')">待机 2</button>
            <button @click="playMotion('greeting', 'greeting_01')">打招呼</button>
            <button @click="playMotion('greeting', 'greeting_02')">挥手</button>
            <button @click="stopMotion()">⏹ 停止</button>
          </div>
        </section>

        <!-- 口型同步 -->
        <section class="control-section">
          <h2>🎤 口型同步</h2>
          <div class="slider-control">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              v-model="lipsyncValue"
              @input="updateLipsync"
            />
            <span>{{ (lipsyncValue * 100).toFixed(0) }}%</span>
          </div>
        </section>

        <!-- 日志输出 -->
        <section class="control-section">
          <h2>📋 日志</h2>
          <div class="log-output" ref="logRef">
            <div v-for="(log, i) in logs" :key="i" :class="log.type">
              <span class="log-time">{{ log.time }}</span>
              {{ log.message }}
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 上传模态框 -->
    <div v-if="showUpload" class="modal-overlay" @click.self="showUpload = false">
      <div class="modal">
        <h2>📁 上传 Live2D 模型</h2>
        <p>请上传 .model3.json 文件，并确保同目录下有相关的贴图文件</p>
        <input 
          type="file" 
          ref="modalFileInput"
          accept=".model3.json,.json"
          @change="handleModelUpload"
        />
        <button @click="showUpload = false" class="close-btn">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display'

// 状态
const connectionStatus = ref('disconnected')
const expressions = ref(['happy', 'sad', 'neutral', 'surprised', 'angry', 'relaxed'])
const currentExpression = ref('')
const lipsyncValue = ref(0)
const logs = ref([])
const live2dRef = ref(null)
const canvasRef = ref(null)
const logRef = ref(null)
const modelLoaded = ref(false)
const loadingError = ref('')
const modelName = ref('')
const showUpload = ref(false)

// PIXI & Live2D
let app = null
let live2dModel = null
let ws = null

// 日志函数
const addLog = (message, type = 'info') => {
  const time = new Date().toLocaleTimeString()
  logs.value.push({ time, message, type })
  nextTick(() => {
    if (logRef.value) {
      logRef.value.scrollTop = logRef.value.scrollHeight
    }
  })
}

// 表情 emoji 映射
const getExpressionEmoji = (expr) => {
  const map = {
    happy: '😊',
    sad: '😢',
    neutral: '😐',
    surprised: '😲',
    angry: '😠',
    relaxed: '😌'
  }
  return map[expr] || '😐'
}

// 连接 WebSocket
const connectWebSocket = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  ws = new WebSocket(`${protocol}//${window.location.host}/ws`)
  
  ws.onopen = () => {
    connectionStatus.value = 'connected'
    addLog('WebSocket 已连接', 'success')
  }
  
  ws.onclose = () => {
    connectionStatus.value = 'disconnected'
    addLog('WebSocket 已断开', 'error')
    setTimeout(connectWebSocket, 3000)
  }
  
  ws.onerror = (err) => {
    addLog(`WebSocket 错误`, 'error')
  }
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      addLog(`WS: ${data.type}`, 'info')
    } catch (e) {
      addLog(`WS 消息`, 'info')
    }
  }
}

// 发送 WebSocket 消息
const sendWs = (data) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data))
  }
}

// 设置表情
const setExpression = (expr) => {
  currentExpression.value = expr
  addLog(`设置表情：${expr}`, 'success')
  sendWs({ type: 'expression', expression: expr })
}

// 播放动作
const playMotion = (group, id) => {
  addLog(`播放动作：${group}_${id}`, 'success')
  sendWs({ type: 'motion', group, id })
}

// 停止动作
const stopMotion = () => {
  addLog('停止动作', 'success')
  sendWs({ type: 'motion', action: 'stop' })
}

// 更新口型同步
const updateLipsync = () => {
  sendWs({ type: 'lipsync', value: lipsyncValue.value })
}

// 处理模型上传
const handleModelUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    addLog(`读取模型文件：${file.name}`, 'info')
    modelName.value = file.name.replace('.model3.json', '')
    
    // 创建模型 URL
    const modelUrl = URL.createObjectURL(file)
    
    // 初始化 PIXI 和 Live2D
    await initPixi(null, modelUrl)
    
    addLog(`模型加载成功：${modelName.value}`, 'success')
    loadingError.value = ''
    modelLoaded.value = true
    showUpload.value = false
  } catch (err) {
    addLog(`模型加载失败：${err.message}`, 'error')
    loadingError.value = `加载失败：${err.message}`
  }
}

// 初始化 PIXI 和 Live2D
const initPixi = async (modelData, modelPath = null) => {
  if (app) {
    app.destroy()
    app = null
  }
  
  const container = live2dRef.value
  if (!container) return
  
  // 创建 PIXI 应用
  app = new PIXI.Application({
    view: canvasRef.value,
    width: container.clientWidth,
    height: container.clientHeight,
    transparent: true,
    resizeTo: container,
    backgroundColor: 0x000000,
    backgroundAlpha: 0
  })
  
  addLog('PIXI 初始化完成', 'success')
  
  try {
    // 如果提供了模型路径，加载 Live2D 模型
    if (modelPath) {
      addLog('加载 Live2D 模型...', 'info')
      
      live2dModel = await Live2DModel.from(modelPath, {
        autoInteract: true,
        autoAnimate: true,
        draggable: true,
        hitArea: 'head'
      })
      
      // 设置模型大小和位置
      const scale = Math.min(
        app.screen.width / live2dModel.width,
        app.screen.height / live2dModel.height
      ) * 0.8
      live2dModel.scale.set(scale)
      live2dModel.x = (app.screen.width - live2dModel.width * scale) / 2
      live2dModel.y = (app.screen.height - live2dModel.height * scale) / 2
      
      app.stage.addChild(live2dModel)
      
      addLog('Live2D 模型加载成功', 'success')
      modelLoaded.value = true
    } else {
      // 显示占位符
      const graphics = new PIXI.Graphics()
      graphics.beginFill(0x6366f1, 0.3)
      graphics.drawEllipse(app.screen.width / 2, app.screen.height / 2, 150, 200)
      graphics.endFill()
      
      const text = new PIXI.Text('Live2D 模型视图\n\n上传 .model3.json 文件\n以加载模型', {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xffffff,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 250
      })
      text.anchor.set(0.5)
      text.x = app.screen.width / 2
      text.y = app.screen.height / 2
      
      app.stage.addChild(graphics)
      app.stage.addChild(text)
      
      addLog('等待用户上传模型...', 'info')
    }
  } catch (err) {
    addLog(`模型加载失败：${err.message}`, 'error')
    loadingError.value = `加载失败：${err.message}`
  }
}

// 初始化
onMounted(async () => {
  addLog('🚀 应用启动', 'success')
  
  // 连接 WebSocket
  connectWebSocket()
  
  // 尝试加载默认模型
  try {
    const response = await fetch('/models/default.model3.json')
    if (response.ok) {
      const modelData = await response.json()
      await initPixi(modelData)
      modelName.value = 'default'
      modelLoaded.value = true
    } else {
      loadingError.value = '未找到默认模型，请上传模型文件'
    }
  } catch (err) {
    loadingError.value = '未找到默认模型，请上传模型文件'
    addLog('等待用户上传模型...', 'info')
  }
})

onUnmounted(() => {
  if (ws) {
    ws.close()
  }
  if (app) {
    app.destroy()
  }
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.status.connected {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status.disconnected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.status .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.main {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 1rem;
  padding: 1rem;
  height: calc(100vh - 70px);
}

.live2d-container {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.live2d-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.live2d-view canvas {
  max-width: 100%;
  max-height: 100%;
}

.loading-overlay, .error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-content, .error-content {
  text-align: center;
  color: #fff;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-content button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #6366f1;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
}

.error-content button:hover {
  background: #4f46e5;
}

.hint {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

.control-panel {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
  overflow-y: auto;
}

.control-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.control-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.control-section h2 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
}

.file-upload {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-btn {
  padding: 0.75rem 1rem;
  background: rgba(99, 102, 241, 0.5);
  border: 1px solid rgba(99, 102, 241, 0.5);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: rgba(99, 102, 241, 0.7);
}

.current-model {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #94a3b8;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

button {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

button.active {
  background: rgba(99, 102, 241, 0.5);
  border-color: #6366f1;
}

.slider-control {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider-control input[type="range"] {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
}

.slider-control input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #6366f1;
  border-radius: 50%;
  cursor: pointer;
}

.log-output {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 0.75rem;
  height: 200px;
  overflow-y: auto;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.75rem;
}

.log-output > div {
  margin-bottom: 0.25rem;
  word-break: break-all;
}

.log-time {
  color: #64748b;
  margin-right: 0.5rem;
}

.log-output .success { color: #22c55e; }
.log-output .error { color: #ef4444; }
.log-output .warning { color: #f59e0b; }
.log-output .info { color: #94a3b8; }

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
}

.modal h2 {
  margin: 0 0 1rem 0;
}

.modal input[type="file"] {
  margin: 1rem 0;
  width: 100%;
}

.modal .close-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
}
</style>
