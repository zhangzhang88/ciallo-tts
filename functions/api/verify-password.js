export async function onRequest(context) {
  const { request, env } = context;
  
  // 处理CORS预检请求
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
  
  // 只允许POST请求
  if (request.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method not allowed"
    }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  
  try {
    // 读取环境变量密码
    const correctPassword = env.PASSWORD;
    
    // 如果未设置密码，则直接验证通过
    if (!correctPassword) {
      return new Response(JSON.stringify({
        valid: true,
        message: "No password required"
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
    // 解析请求体获取用户提交的密码
    const { password } = await request.json();
    
    // 验证密码
    if (password === correctPassword) {
      return new Response(JSON.stringify({
        valid: true,
        message: "Password verified successfully"
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } else {
      return new Response(JSON.stringify({
        valid: false,
        message: "Incorrect password"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Bad request"
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
