/**
 * AI 大脑 - 支持多种 LLM 后端
 * 可配置：Ollama / OpenAI 兼容 / 通义千问 / 本地部署
 */

import axios from 'axios';

export class AIBrain {
  constructor(config) {
    this.config = config.llm;
    this.visionConfig = config.vision;
    this.systemName = config.system.name;
    this.personality = config.system.personality;
    
    this.systemPrompt = this.buildSystemPrompt();
    this.conversationHistory = [];
    this.maxHistory = 20;
  }

  buildSystemPrompt() {
    return `你是${this.systemName}，一个 AI 虚拟主播。
性格：${this.personality}

## 能力
- 与观众聊天互动
- 理解语音和图片内容
- 玩 Minecraft 等游戏
- 表达各种情感

## 回复格式
请严格以 JSON 格式回复：
{
  "text": "你的回复内容（中文）",
  "emotion": "neutral|happy|surprised|thinking|sad|angry|excited",
  "action": null 或 { "type": "minecraft|expression|motion", "command/value": "..." }
}

## 规则
- 回复要自然、有趣、符合人设
- 根据对话内容选择合适的情感
- 如果需要执行动作，在 action 字段说明
- 保持对话流畅，不要过于机械
- 始终使用中文回复
- JSON 外不要有其他文字`;
  }

  async chat(input, context = {}) {
    // 添加用户消息到历史
    this.conversationHistory.push({
      role: 'user',
      content: input
    });

    // 构建请求
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.conversationHistory.slice(-this.maxHistory)
    ];

    try {
      const response = await this.callLLM(messages);
      
      // 解析 JSON 回复
      let parsed;
      try {
        // 尝试提取 JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = { text: response, emotion: 'neutral', action: null };
        }
      } catch {
        parsed = { text: response, emotion: 'neutral', action: null };
      }

      // 添加助手回复到历史
      this.conversationHistory.push({
        role: 'assistant',
        content: response
      });

      return parsed;
    } catch (error) {
      console.error('LLM 请求失败:', error.message);
      return {
        text: '抱歉，我现在有点迷糊...',
        emotion: 'confused',
        action: null
      };
    }
  }

  async callLLM(messages) {
    const provider = this.config.provider;
    
    // 支持多种后端
    switch (provider) {
      case 'ollama':
        return await this.callOllama(messages);
      case 'openai':
        return await this.callOpenAI(messages);
      case 'qwen':
        return await this.callQwen(messages);
      case 'custom':
      default:
        return await this.callCustom(messages);
    }
  }

  async callOllama(messages) {
    const response = await axios.post(
      `${this.config.baseUrl}/chat`,
      {
        model: this.config.model,
        messages,
        stream: false
      }
    );
    return response.data.message.content;
  }

  async callOpenAI(messages) {
    const response = await axios.post(
      `${this.config.baseUrl}/chat/completions`,
      {
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  }

  async callQwen(messages) {
    return await this.callOpenAI(messages); // 通义千问使用 OpenAI 兼容 API
  }

  async callCustom(messages) {
    // 自定义端点，兼容 OpenAI 格式
    return await this.callOpenAI(messages);
  }

  async analyzeImage(imagePath, question = '这张图片里有什么？') {
    if (!this.visionConfig.enabled) {
      return '视觉识别未启用';
    }

    try {
      const response = await axios.post(
        `${this.visionConfig.baseUrl}/chat/completions`,
        {
          model: this.visionConfig.model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: question },
                { type: 'image_url', image_url: { url: imagePath } }
              ]
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.visionConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('视觉识别失败:', error.message);
      return '抱歉，我看不清楚这张图片...';
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}
