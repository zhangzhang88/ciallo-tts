export async function onRequest(context) {
  const { env } = context;
  const envPass = env.PASSWORD || "";
  return new Response(JSON.stringify({ requirePassword: !!envPass }), { 
    status: 200, 
    headers: { "Content-Type": "application/json" } 
  });
}
