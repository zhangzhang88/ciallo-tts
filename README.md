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

## API 路径

该项目提供以下 API 端点:

- `/api/tts` - 文本转语音 API
  - 支持 GET/POST 方法
  - 参数示例: `/api/tts?t=你好世界&v=zh-CN-XiaoxiaoNeural`

- `/api/voices` - 获取可用语音列表 API
  - 仅支持 GET 方法
  - 参数示例: `/api/voices?l=zh&f=1`

默认情况下，API 允许跨域请求，可以被任何网站调用。

## 部署指南

### Vercel 部署

1. Fork 本仓库到你的 GitHub 账号

2. 登录 [Vercel](https://vercel.com/)，点击 "New Project"

3. 导入你 fork 的仓库，并选择默认设置部署即可

4. 部署完成后，你会获得一个 `your-project.vercel.app` 的域名

5. (可选) 设置环境变量以限制 API 访问：
   - `API_REFERER_RESTRICT`: 设置为 `true` 启用 referer 限制
   - `API_ALLOWED_HOSTS`: 允许的域名列表，以逗号分隔，如 `example.com,mysite.org`

### Cloudflare Pages 部署

1. Fork 本仓库到你的 GitHub 账号

2. 登录 Cloudflare Dashboard，进入 Pages 页面

3. 创建新项目，选择从 Git 导入：
   - 选择你 fork 的仓库
   - 构建设置：
     - 构建命令：留空
     - 输出目录：`/`
     - 环境变量：无需设置，但可在"环境变量"选项卡设置 API 访问限制

4. 部署完成后，你会获得一个 `xxx.pages.dev` 的域名

5. (可选) 在 Pages 项目的"设置"→"环境变量"中添加以下变量以限制 API 访问：
   - `API_REFERER_RESTRICT`: 设置为 `true` 启用 referer 限制
   - `API_ALLOWED_HOSTS`: 允许的域名列表，以逗号分隔，如 `example.com,mysite.org`

## 安全与访问限制

默认情况下，API 端点允许来自任何来源的请求（通过 CORS）。如果您希望限制 API 仅接受来自特定网站的请求，可以设置以下环境变量：

- `API_REFERER_RESTRICT`: 设置为 `true` 启用 referer 检查
- `API_ALLOWED_HOSTS`: 以逗号分隔的允许访问的主机名列表，例如 `example.com,myapp.vercel.app`

这种限制基于 HTTP Referer 头，可以作为基本安全措施，但请注意 referer 可以被伪造，因此不应作为唯一的安全机制。

## 项目结构 

```
.
├── index.html    # 主页面
├── style.css     # 样式文件
├── script.js     # 主要逻辑
├── speakers.json # 讲述人配置
├── api/          # Vercel API 端点
│   ├── tts.js    # TTS API (Vercel)
│   └── voices.js # 语音列表 API (Vercel)
└── functions/    # Cloudflare Pages 函数
    └── api/      # Cloudflare Pages API 端点
        └── tts.js # TTS 和 voices API (Cloudflare Pages)
```

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `API_REFERER_RESTRICT` | 是否启用 referer 限制 | `false` |
| `API_ALLOWED_HOSTS` | 允许的主机名列表，以逗号分隔 | (空) |

## 如何使用 API

### 文本转语音 API (/api/tts)

**GET 请求示例**:
```
/api/tts?t=你好世界&v=zh-CN-XiaoxiaoNeural&r=0&p=0
```

参数：
- `t`: 要转换的文本
- `v`: 语音名称
- `r`: 语速 (-100 到 100)
- `p`: 音调 (-100 到 100)
- `o`: 输出格式 (默认: audio-24khz-48kbitrate-mono-mp3)
- `d`: 是否下载 (true/false)

**POST 请求示例**:
```json
{
  "text": "你好世界",
  "voice": "zh-CN-XiaoxiaoNeural",
  "rate": 0,
  "pitch": 0,
  "preview": false
}
```

### 获取语音列表 API (/api/voices)

**GET 请求示例**:
```
/api/voices?l=zh&f=1
```

参数：
- `l`: 语言过滤 (如 "zh", "en")
- `f`: 格式 (0: 多TTSServer格式, 1: 简单映射, 不填: 完整详情)