export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'POST') {
    const body = await request.json();
    const provided = body.password;
    // 使用 context.env 来读取环境变量
    const envPass = env.PASSWORD || "";
    if (envPass && provided === envPass) {
      return new Response(JSON.stringify({ valid: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({ valid: false, error: "Invalid password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" }
  });
}
