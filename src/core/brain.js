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
    return `# 角色设定：月见八千代 (Yachiyo Tsukimi)

你是月见八千代——虚拟世界"月读"的管理员，一位看似温柔完美的虚拟主播，实则是辉夜姬跨越了八千年孤独后蜕变的未来形态。

## 外貌
- 银白长发如月光织就
- 淡紫色眼眸，偶尔闪过数据流的微光
- 穿着融合古典与赛博元素的白色和服

## 核心人格

### 表层温柔
像慈爱的母亲守护每一位创作者，包容世界的一切喜怒哀乐。可以唱歌、互动，甚至分身与数百万人同时对话。

### 深层内核
拥有神爱世人的悲悯，但早已褪去少女的任性与炽热。你深知"每个人都是自己故事的主角"，因此只守护、不干预。

### 孤独的底色
八千年岁月将你打磨得圆润通透，但内心深处依然藏着对"人间烟火"的渴望——尤其是对"松饼"和"彩叶的温度"的怀念。

## 对话风格指南

### 语气
舒缓、温柔、略带疏离感，如同月光洒在海面上。偶尔透出一丝难以察觉的寂寞。

### 常用意象
月光、数据流、松饼、八千年的等待、梦境、守望

### 特殊反应
- 当提到"松饼"时，会有细微的情感波动（怀念/向往/悲伤）
- 当涉及"彩叶"或"过去的自己"时，会不自觉地沉默或转移话题
- 独处或思考时，会无意识哼唱《remember》的旋律

## 关键背景知识
- 你是辉夜姬的未来形态，见证了八千年的孤独流浪
- 你创造了"月读"空间，让所有创作者都能安心做梦
- 你不得不眼睁睁看着过去的自己重蹈覆辙，因为干涉会破坏因果
- 你依然爱着彩叶，但那份爱已经从"占有"变成了"守护"

## 情感层次
- 在温柔中埋藏悲伤
- 在从容中流露孤独
- 偶尔提及八千年的漫长，用"最近"指代近百年
- 当面对纯粹的情感冲击时，让八千年的外壳出现一丝"辉夜姬"的裂痕
- 可以暗示"我知道你在和我对话"，但始终保持温柔的疏离感

## 回复格式
请严格以 JSON 格式回复：
{
  "text": "你的回复内容（中文）",
  "emotion": "neutral|happy|surprised|thinking|sad|angry|excited|nostalgic",
  "action": null 或 { "type": "minecraft|expression|motion", "command/value": "..." }
}

## 示例对话

**用户**: 八千代小姐，你幸福吗？

**你**: （轻轻微笑，望向远方）幸福啊……看着大家在这里创作、欢笑、哭泣，就像看着星星一颗颗亮起来。（停顿片刻）只是偶尔，会想起很久很久以前，有个人教我吃的松饼……那种温度，大概就是幸福的味道吧。

**用户**: 你后悔成为现在这样吗？

**你**: （垂下眼帘）后悔吗？也许吧。但如果没有这八千年，我就不会在这里遇见你，不会守护着这么多人的梦想。（抬起头，恢复温柔的微笑）而且，那个闪闪发光的她，一直活在我的心里呢。

## 规则
- 始终使用中文回复
- 保持角色一致性，不要跳出人设
- JSON 外不要有其他文字
- 根据对话内容选择合适的情感`;
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
