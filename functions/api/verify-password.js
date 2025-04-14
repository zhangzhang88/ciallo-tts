export async function onRequest(context) {
  const { request } = context;
  if (request.method === 'POST') {
    const body = await request.json();
    const provided = body.password;
    // 在 Cloudflare 环境中用 ENV 变量（需在 Pages Settings 中设置）
    const envPass = PASSWORD || "";
    if (envPass && provided === envPass) {
      return new Response(JSON.stringify({ valid: true }), { status: 200, headers: { "Content-Type": "application/json" }});
    } else {
      return new Response(JSON.stringify({ valid: false, error: "Invalid password" }), { status: 401, headers: { "Content-Type": "application/json" }});
    }
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" }});
}
