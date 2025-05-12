export async function onRequest(context) {
  const { env } = context;
  
  // 检查是否设置了密码环境变量
  const passwordRequired = !!env.PASSWORD;
  
  // 返回是否需要密码的信息
  return new Response(JSON.stringify({
    requirePassword: passwordRequired
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
