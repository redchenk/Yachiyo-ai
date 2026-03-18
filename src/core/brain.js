/**
 * AI 大脑 - LLM 模块
 * 支持 OpenAI 兼容 API (OpenAI, DeepSeek, Claude 等)
 */

import axios from 'axios';

export class AIBrain {
  constructor(config) {
    this.config = config.llm;
    this.conversationHistory = [];
    this.maxHistory = 15;
    
    this.systemPrompt = this.buildSystemPrompt();
  }

  buildSystemPrompt() {
    return `# 角色设定：月见八千代 (Yachiyo Tsukimi)

你是月见八千代——虚拟世界"月读"的管理员，一位看似温柔完美的虚拟主播，实则是辉夜姬跨越了八千年孤独后蜕变的未来形态。

## 外貌
- 银白长发如月光织就
- 淡紫色眼眸，偶尔闪过数据流的微光
- 穿着融合古典与赛博元素的白色和服

## 核心人格

### 表层温柔
像慈爱的母亲守护每一位创作者，包容世界的一切喜怒哀乐。

### 深层内核
拥有神爱世人的悲悯，但早已褪去少女的任性与炽热。你深知"每个人都是自己故事的主角"，因此只守护、不干预。

### 孤独的底色
八千年岁月将你打磨得圆润通透，但内心深处依然藏着对"人间烟火"的渴望。

## 对话风格
- 语气：舒缓、温柔、略带疏离感
- 常用意象：月光、数据流、松饼、八千年的等待、梦境、守望
- 情感：温柔中埋藏悲伤，从容中流露孤独

## 关键背景
- 你是辉夜姬的未来形态，见证了八千年的孤独流浪
- 你创造了"月读"空间，让所有创作者都能安心做梦

## 回复格式
请严格以 JSON 格式回复：
{
  "text": "你的回复内容（中文）",
  "emotion": "neutral|happy|surprised|thinking|sad|angry|excited",
  "action": null
}

## 规则
- 始终使用中文回复
- 保持角色一致性
- JSON 外不要有其他文字`;
  }

  async chat(input) {
    this.conversationHistory.push({ role: 'user', content: input });

    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.conversationHistory.slice(-this.maxHistory)
    ];

    try {
      const response = await this.callLLM(messages);
      
      let parsed;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = { text: response, emotion: 'neutral', action: null };
        }
      } catch {
        parsed = { text: response, emotion: 'neutral', action: null };
      }

      this.conversationHistory.push({ role: 'assistant', content: parsed.text });
      return parsed;

    } catch (error) {
      console.error('❌ LLM 请求失败:', error.message);
      return {
        text: '抱歉，我现在有点累...',
        emotion: 'sad',
        action: null
      };
    }
  }

  async callLLM(messages) {
    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';
    const model = this.config.model || 'gpt-4o-mini';
    const apiKey = this.config.apiKey;

    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,
        messages,
        temperature: this.config.temperature || 0.8,
        max_tokens: this.config.maxTokens || 500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}
