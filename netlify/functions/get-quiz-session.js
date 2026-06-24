export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'GET') {
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

  const url = new URL(req.url);
  const pin = url.searchParams.get('pin');

  if (!pin || !/^\d{6}$/.test(pin)) {
    return new Response(JSON.stringify({ error: 'Ungültiger PIN. Bitte 6-stelligen PIN eingeben.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/quiz_sessions?pin=eq.${pin}&select=questions,opts`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const rows = await response.json();
    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ error: `PIN ${pin} nicht gefunden. Bitte prüfe die Eingabe.` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ questions: rows[0].questions, opts: rows[0].opts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Quiz konnte nicht geladen werden.', detail: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const config = { path: '/api/get-quiz-session' };
