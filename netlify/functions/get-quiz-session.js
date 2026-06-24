exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Supabase-Konfiguration fehlt.' }) };
  }

  const pin = event.queryStringParameters && event.queryStringParameters.pin;

  if (!pin || !/^\d{6}$/.test(pin)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ungültiger PIN.' }) };
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/quiz_sessions?pin=eq.${pin}&select=questions,opts`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) throw new Error(await response.text());

    const rows = await response.json();
    if (!rows || rows.length === 0) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: `PIN ${pin} nicht gefunden.` }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ questions: rows[0].questions, opts: rows[0].opts }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Quiz konnte nicht geladen werden.', detail: err.message }) };
  }
};
