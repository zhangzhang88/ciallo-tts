export async function onRequest(context) {
  // 在 Cloudflare Pages 中 PASSWORD 为全局绑定的环境变量
  const envPass = PASSWORD || "";
  return new Response(JSON.stringify({ requirePassword: !!envPass }), { 
    status: 200, 
    headers: { "Content-Type": "application/json" } 
  });
}
