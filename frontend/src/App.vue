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
        <div ref="live2dRef" class="live2d-view"></div>
      </div>

      <!-- 控制面板 -->
      <div class="control-panel">
        <!-- 表情控制 -->
        <section class="control-section">
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

        <!-- 模型切换 -->
        <section class="control-section">
          <h2>🔄 模型</h2>
          <div class="model-select">
            <select v-model="selectedModel" @change="switchModel">
              <option v-for="model in models" :key="model" :value="model">
                {{ model }}
              </option>
            </select>
            <button @click="loadModels" class="refresh-btn">🔄 刷新</button>
          </div>
          <p class="current-model" v-if="currentModel">
            当前：<strong>{{ currentModel }}</strong>
          </p>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { api } from './api/client.js'

// 状态
const connectionStatus = ref('disconnected')
const expressions = ref([])
const models = ref([])
const currentModel = ref('')
const selectedModel = ref('')
const currentExpression = ref('')
const lipsyncValue = ref(0)
const logs = ref([])
const live2dRef = ref(null)
const logRef = ref(null)

// WebSocket
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
    addLog(`WebSocket 错误：${err.message}`, 'error')
  }
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      addLog(`WS: ${data.type} - ${JSON.stringify(data)}`, 'info')
    } catch (e) {
      addLog(`WS 原始消息：${event.data}`, 'info')
    }
  }
}

// 发送 WebSocket 消息
const sendWs = (data) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data))
  }
}

// 加载模型列表
const loadModels = async () => {
  try {
    const res = await api.getModels()
    models.value = res.models || []
    addLog(`加载模型列表：${models.value.length} 个模型`, 'success')
  } catch (err) {
    addLog(`加载模型失败：${err.message}`, 'error')
  }
}

// 加载当前模型
const loadCurrentModel = async () => {
  try {
    const res = await api.getCurrentModel()
    currentModel.value = res.current
    selectedModel.value = res.current
    addLog(`当前模型：${res.current}`, 'info')
  } catch (err) {
    addLog(`获取当前模型失败：${err.message}`, 'error')
  }
}

// 切换模型
const switchModel = async () => {
  if (!selectedModel.value) return
  try {
    await api.switchModel(selectedModel.value)
    currentModel.value = selectedModel.value
    addLog(`切换到模型：${selectedModel.value}`, 'success')
    
    // 重新加载 Live2D 模型
    await loadLive2dModel(selectedModel.value)
  } catch (err) {
    addLog(`切换模型失败：${err.message}`, 'error')
  }
}

// 加载表情列表
const loadExpressions = async () => {
  try {
    const res = await api.getExpressions()
    expressions.value = res.expressions || []
    addLog(`加载表情列表：${expressions.value.length} 个表情`, 'success')
  } catch (err) {
    addLog(`加载表情失败：${err.message}`, 'error')
  }
}

// 设置表情
const setExpression = async (expr) => {
  try {
    await api.setExpression(expr)
    currentExpression.value = expr
    addLog(`设置表情：${expr}`, 'success')
    sendWs({ type: 'expression', expression: expr })
  } catch (err) {
    addLog(`设置表情失败：${err.message}`, 'error')
  }
}

// 播放动作
const playMotion = async (group, id) => {
  try {
    await api.playMotion(group, id)
    addLog(`播放动作：${group}_${id}`, 'success')
    sendWs({ type: 'motion', group, id })
  } catch (err) {
    addLog(`播放动作失败：${err.message}`, 'error')
  }
}

// 停止动作
const stopMotion = async () => {
  try {
    await api.stopMotion()
    addLog('停止动作', 'success')
  } catch (err) {
    addLog(`停止动作失败：${err.message}`, 'error')
  }
}

// 更新口型同步
const updateLipsync = () => {
  sendWs({ type: 'lipsync', value: lipsyncValue.value })
}

// 加载 Live2D 模型（占位符）
const loadLive2dModel = async (modelName) => {
  if (!live2dRef.value) return
  
  // 清空容器
  live2dRef.value.innerHTML = ''
  
  // 创建占位符内容
  const placeholder = document.createElement('div')
  placeholder.className = 'live2d-placeholder'
  placeholder.innerHTML = `
    <div class="placeholder-content">
      <div class="placeholder-icon">🎭</div>
      <p>Live2D 模型视图</p>
      <p class="placeholder-hint">模型：${modelName || '未选择'}</p>
      <p class="placeholder-note">需要配置 Live2D 模型文件</p>
    </div>
  `
  live2dRef.value.appendChild(placeholder)
  addLog(`Live2D 视图已就绪：${modelName || '未选择模型'}`, 'info')
}

// 初始化
onMounted(async () => {
  addLog('🚀 应用启动', 'success')
  
  // 连接 WebSocket
  connectWebSocket()
  
  // 加载数据
  await loadModels()
  await loadCurrentModel()
  await loadExpressions()
  
  // 加载 Live2D 模型
  if (currentModel.value) {
    await loadLive2dModel(currentModel.value)
  }
})

onUnmounted(() => {
  if (ws) {
    ws.close()
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

.model-select {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

select {
  flex: 1;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 0.875rem;
}

select option {
  background: #1a1a2e;
  color: #fff;
}

.refresh-btn {
  padding: 0.75rem 1rem;
}

.current-model {
  margin: 0;
  font-size: 0.875rem;
  color: #94a3b8;
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

.live2d-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.placeholder-content p {
  margin: 0.5rem 0;
}

.placeholder-hint {
  font-size: 1.25rem;
  color: #e2e8f0;
}

.placeholder-note {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 1rem;
}
</style>
