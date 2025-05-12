# Ciallo TTS - 在线文本转语音工具

Ciallo TTS 是一款免费的在线文本转语音工具，支持多种声音选择，可调节语速和语调，提供即时试听和下载功能。

## 功能特点

- 🎯 支持超过300种不同语言和口音的声音
- 🔊 实时预览和试听功能
- ⚡ 支持长文本自动分段处理
- 🎛️ 可调节语速和语调
- 📱 响应式设计，支持移动端
- 💾 支持音频下载
- 📝 历史记录功能（最多保存50条）
- 🔌 支持添加自定义OpenAI格式的TTS API

## API 说明

本项目提供以下 API 端点:

### Edge API 路径

- `/api/tts` - 文本转语音 API
  - 支持 GET/POST 方法
  - GET 示例: `/api/tts?t=你好世界&v=zh-CN-XiaoxiaoNeural&r=0&p=0`
  - POST 示例: 请求体为JSON格式 `{"text": "你好世界", "voice": "zh-CN-XiaoxiaoNeural", "rate": 0, "pitch": 0}`

- `/api/voices` - 获取可用语音列表 API
  - 仅支持 GET 方法
  - 示例: `/api/voices?l=zh&f=1` (l参数用于筛选语言，f参数指定返回格式)

### 自定义 API

Ciallo TTS 支持添加自定义 API 端点，目前支持两种格式：

#### OpenAI 格式 API

- 支持与 OpenAI TTS API 兼容的服务，如 OpenAI、LMStudio、LocalAI 等
- 请求格式: POST
  ```json
  {
    "model": "tts-1",
    "input": "您好，这是一段测试文本",
    "voice": "alloy",
    "response_format": "mp3"
  }
  ```
- 可选参数：`instructions` - 语音风格指导

#### Edge 格式 API

- 支持与 Microsoft Edge TTS API 兼容的服务
- 请求格式: POST
  ```json
  {
    "text": "您好，这是一段测试文本",
    "voice": "zh-CN-XiaoxiaoNeural",
    "rate": 0,
    "pitch": 0
  }
  ```

#### 如何添加自定义 API

1. 点击界面上的"管理API"按钮
2. 填写以下信息：
   - API 名称：自定义名称
   - API 端点：语音生成服务地址
   - API 密钥：可选，用于授权
   - 模型列表端点：可选，用于获取可用模型
   - API 格式：选择 OpenAI 或 Edge 格式
   - 手动输入讲述人列表：逗号分隔的讲述人列表
   - 最大文本长度：可选，限制单次请求的文本长度

3. 点击"获取模型"按钮可自动填充可用讲述人列表
4. 点击"保存"完成添加

#### 导入/导出 API 配置

- 导出：将所有自定义 API 配置导出为 JSON 文件
- 导入：从 JSON 文件导入 API 配置

## 部署指南

### Vercel 部署

1. Fork 本仓库到你的 GitHub 账号

2. 登录 [Vercel](https://vercel.com/)，点击 "New Project"

3. 导入你 fork 的仓库，并选择默认设置部署即可

4. 部署完成后，你会获得一个 `your-project.vercel.app` 的域名

### Cloudflare Pages 部署

1. Fork 本仓库到你的 GitHub 账号

2. 登录 Cloudflare Dashboard，进入 Pages 页面

3. 创建新项目，选择从 Git 导入：
   - 选择你 fork 的仓库
   - 构建设置：
     - 构建命令：留空
     - 输出目录：`/`
     - 环境变量：无需设置

4. 部署完成后，你会获得一个 `xxx.pages.dev` 的域名

## 环境变量

除了原有配置外，现在项目支持设置环境变量 PASSWORD 来开启访问密码验证。如果 PASSWORD 非空，则用户第一次访问页面时会显示密码输入界面，输入正确后在该设备上后续访问将不再需要验证。

