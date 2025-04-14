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

默认情况下，API 允许跨域请求，可以被任何网站调用。

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

