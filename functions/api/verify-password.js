export async function onRequest(context) {
  const request = context.request;
  
  // Handle OPTIONS request
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: this.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
  
  // Only allow POST
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }

  try {
    const password = context.env.PASSWORD || '';
    
    // If no password is set, always return valid
    if (!password) {
      return new Response(
        JSON.stringify({ valid: true }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
    
    // Check the password
    const body = await request.json();
    const providedPassword = body.password || '';
    
    const isValid = providedPassword === password;
    
    return new Response(
      JSON.stringify({ valid: isValid }),
      {
        status: isValid ? 200 : 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Invalid request" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}
