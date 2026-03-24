/**
 * API 客户端
 */

const BASE_URL = '/api'

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }
  
  const res = await fetch(url, config)
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
  
  return res.json()
}

export const api = {
  // 健康检查
  async health() {
    return request('/health')
  },
  
  // 模型管理
  async getModels() {
    return request('/model/list')
  },
  
  async getCurrentModel() {
    return request('/model/current')
  },
  
  async switchModel(modelName) {
    return request('/model/switch', {
      method: 'POST',
      body: JSON.stringify({ modelName })
    })
  },
  
  // 表情控制
  async getExpressions() {
    return request('/expression/list')
  },
  
  async setExpression(expression) {
    return request('/expression/set', {
      method: 'POST',
      body: JSON.stringify({ expression })
    })
  },
  
  // 动作控制
  async playMotion(group, id) {
    return request('/motion/play', {
      method: 'POST',
      body: JSON.stringify({ group, id })
    })
  },
  
  async stopMotion() {
    return request('/motion/stop', {
      method: 'POST'
    })
  },
  
  // 配置管理
  async getConfig() {
    return request('/config')
  },
  
  async updateConfig(key, value) {
    return request('/config/update', {
      method: 'POST',
      body: JSON.stringify({ key, value })
    })
  }
}
