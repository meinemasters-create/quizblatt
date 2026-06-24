export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ error: 'Supabase-Konfiguration fehlt in den Umgebungsvariablen.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Ungültiger Request-Body' }), { status: 400 });
  }

  const { questions, opts } = body;

  // Generate random 6-digit PIN
  const pin = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/quiz_sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ pin, questions, opts }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    return new Response(JSON.stringify({ pin }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Quiz konnte nicht gespeichert werden.', detail: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const config = { path: '/api/create-quiz-session' };
