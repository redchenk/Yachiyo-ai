# 🌙 API 配置指南

## 快速开始

首次打开页面时会自动弹出配置向导，按照提示选择 API 提供商即可。

## 📋 可选 API 提供商

### 1️⃣ Ollama (本地免费) ⭐ 推荐新手

**优点:**
- ✅ 完全免费，无需联网
- ✅ 隐私安全，数据本地处理
- ✅ 支持多种开源模型

**缺点:**
- ❌ 需要较高硬件配置
- ❌ 需要自行下载安装

**配置步骤:**

```bash
# 1. 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. 下载模型 (选择一个)
ollama pull qwen2.5:7b    # 8GB 显存
ollama pull qwen2.5:72b   # 48GB+ 显存

# 3. 启动服务
ollama serve
```

**配置参数:**
```
API 提供商：Ollama (本地免费)
API 地址：http://localhost:11434/v1
API 密钥：(留空)
模型名称：qwen2.5:72b
```

**获取链接:** https://ollama.com/download

---

### 2️⃣ 通义千问 (推荐) ⭐ 效果最好

**优点:**
- ✅ 中文理解能力强
- ✅ 有免费额度
- ✅ 无需高配置硬件

**缺点:**
- ❌ 需要 API 密钥
- ❌ 超出免费额度后收费

**配置步骤:**

1. 访问阿里云控制台：https://dashscope.console.aliyun.com/apiKey
2. 登录/注册阿里云账号
3. 点击"创建新的 API-KEY"
4. 复制密钥到配置

**配置参数:**
```
API 提供商：通义千问
API 地址：https://dashscope.aliyuncs.com/api/v1
API 密钥：sk-xxxxxxxx (你的密钥)
模型名称：qwen-max
```

**获取密钥:** https://dashscope.console.aliyun.com/apiKey

**免费额度:** 新用户赠送 100 万 token

---

### 3️⃣ OpenAI

**优点:**
- ✅ GPT-4 强大能力
- ✅ 全球可用

**缺点:**
- ❌ 需要国际信用卡
- ❌ 大陆需要代理

**配置参数:**
```
API 提供商：OpenAI
API 地址：https://api.openai.com/v1
API 密钥：sk-xxxxxxxx
模型名称：gpt-4o
```

**获取密钥:** https://platform.openai.com/api-keys

---

### 4️⃣ 自定义 (OpenAI 兼容)

适用于任何 OpenAI 兼容的 API 端点，如：
- LocalAI
- FastChat
- vLLM
- 其他中转服务

**配置参数:**
```
API 提供商：自定义
API 地址：http://你的服务器：8000/v1
API 密钥：(可选)
模型名称：根据服务端填写
```

---

## 🔧 配置方法

### 方法 1: 首次使用向导

打开页面自动弹出，按步骤填写即可。

### 方法 2: 设置面板

1. 点击右上角 **"⚙️ API 设置"** 按钮
2. 选择 API 提供商
3. 填写相应参数
4. 点击 **"🔌 测试"** 验证连接
5. 点击 **"💾 保存设置"**

---

## ✅ 测试连接

配置完成后，点击 **"🔌 测试"** 按钮：

- ✅ **连接成功** - 显示绿色提示
- ❌ **连接失败** - 显示红色错误信息

常见错误：
- `ECONNREFUSED` - 服务未启动
- `401 Unauthorized` - API 密钥错误
- `404 Not Found` - API 地址错误
- `Model not found` - 模型名称错误

---

## 💡 推荐配置

### 本地部署 (免费)
```
提供商：Ollama
地址：http://localhost:11434/v1
模型：qwen2.5:7b  (8GB 显存)
     qwen2.5:72b (48GB+ 显存)
```

### 云端部署 (省心)
```
提供商：通义千问
地址：https://dashscope.aliyuncs.com/api/v1
密钥：sk-xxx (官网获取)
模型：qwen-max
```

---

## 🔐 安全提示

- API 密钥仅保存在本地浏览器 (localStorage)
- 不会上传到任何服务器
- 清除浏览器数据会删除配置
- 建议定期更换 API 密钥

---

## 📚 相关资源

- [Ollama 下载](https://ollama.com/download)
- [通义千问控制台](https://dashscope.console.aliyun.com/apiKey)
- [OpenAI 平台](https://platform.openai.com/api-keys)
- [Qwen2.5 模型介绍](https://qwenlm.github.io/)

---

**祝你使用愉快！** 🌙
