import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

// 目标API地址 - 这是我们转发到的服务
const TARGET_API = "https://oai-tts.zwei.de.eu.org";
// const TARGET_API = "https://ttsapi.site";  // 备用地址，根据需要切换

const ALLOWED_ORIGINS = [
  "https://ciallo-tts.pages.dev",
  "https://tts.ciallo.de",
  "http://localhost:3000",
  "http://127.0.0.1:5500"
];

// 将目标请求路径映射到实际URL
function getTargetUrl(url: URL): string {
  const path = url.pathname;
  return `${TARGET_API}${path}`;
}

// 处理CORS预检请求
function handlePreflight(req: Request): Response {
  const origin = req.headers.get("origin") || "*";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Content-Length, Accept, Accept-Encoding, User-Agent, Origin",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// 处理队列状态请求
async function handleQueueRequest(req: Request): Promise<Response> {
  const targetUrl = getTargetUrl(new URL(req.url));
  
  try {
    const response = await fetch(`${targetUrl}`, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": req.headers.get("User-Agent") || "Deno-Proxy",
      }
    });
    
    const data = await response.json();
    const origin = req.headers.get("origin") || "*";
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      }
    });
  } catch (error) {
    console.error("队列请求错误:", error);
    return new Response(JSON.stringify({ error: "代理服务器错误" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    });
  }
}

// 处理TTS API请求
async function handleTTSRequest(req: Request): Promise<Response> {
  const targetUrl = getTargetUrl(new URL(req.url));
  
  try {
    // 获取并处理请求体
    let requestBody;
    if (req.method === "POST") {
      requestBody = await req.json();
    }
    
    // 处理请求头
    const headersToForward = new Headers();
    headersToForward.set("Content-Type", "application/json");
    headersToForward.set("Accept", req.headers.get("Accept") || "*/*");
    headersToForward.set("User-Agent", req.headers.get("User-Agent") || "Deno-Proxy");
    
    // 发送请求到目标API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headersToForward,
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    });
    
    // 准备响应头
    const responseHeaders = new Headers();
    const origin = req.headers.get("origin") || "*";
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    
    responseHeaders.set("Access-Control-Allow-Origin", allowedOrigin);
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    
    // 复制内容类型及其他重要头
    const contentType = response.headers.get("Content-Type");
    if (contentType) {
      responseHeaders.set("Content-Type", contentType);
    }
    
    // 如果有速率限制响应，复制相关头
    const retryAfter = response.headers.get("Retry-After");
    if (retryAfter) {
      responseHeaders.set("Retry-After", retryAfter);
    }
    
    // 获取响应体 - 如果是音频内容则按照二进制处理
    let responseBody;
    if (contentType && contentType.includes("audio/")) {
      responseBody = await response.arrayBuffer();
    } else {
      // 尝试以JSON解析，若失败则直接读取文本
      try {
        const text = await response.text();
        try {
          // 尝试解析为JSON
          JSON.parse(text);
          responseHeaders.set("Content-Type", "application/json");
          responseBody = text;
        } catch {
          // 如果无法解析为JSON，直接返回文本
          responseBody = text;
        }
      } catch (e) {
        // 如果文本读取失败，返回原始响应
        responseBody = await response.arrayBuffer();
      }
    }
    
    // 返回响应
    return new Response(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("TTS请求错误:", error);
    return new Response(JSON.stringify({ error: "代理服务器错误", message: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    });
  }
}

// 主处理函数
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  // 记录请求信息
  console.log(`${req.method} ${url.pathname}`);
  
  // 处理预检请求
  if (req.method === "OPTIONS") {
    return handlePreflight(req);
  }
  
  // 处理队列状态请求
  if (url.pathname === "/api/queue-size") {
    return handleQueueRequest(req);
  }
  
  // 处理TTS请求
  if (url.pathname === "/v1/audio/speech") {
    return handleTTSRequest(req);
  }
  
  // 处理根路径请求
  if (url.pathname === "/" || url.pathname === "") {
    return new Response("OAI-TTS 代理服务器正常运行", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      }
    });
  }
  
  // 处理不支持的路径
  return new Response("不支持的请求路径", { 
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    }
  });
}

// 启动服务器
console.log("启动OAI-TTS代理服务器...");
serve(handler, { port: 8000 });
