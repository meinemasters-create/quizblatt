exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Supabase-Konfiguration fehlt.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ungültiger Request-Body' }) };
  }

  const { questions, opts } = body;
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

    return { statusCode: 200, headers, body: JSON.stringify({ pin }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Quiz konnte nicht gespeichert werden.', detail: err.message }) };
  }
};
