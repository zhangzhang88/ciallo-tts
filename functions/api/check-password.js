export async function onRequest(context) {
  const password = context.env.PASSWORD || '';
  
  return new Response(
    JSON.stringify({
      requirePassword: !!password
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}
