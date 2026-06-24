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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API-Key fehlt. Bitte ANTHROPIC_API_KEY in Netlify-Umgebungsvariablen eintragen.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Ungültiger Request-Body' }), { status: 400 });
  }

  const { source, content, imageData, imageType, count = 10, difficulty = 'gemischt', level = 'Gymnasium' } = body;

  // Build the user message content
  const messageContent = [];

  if (source === 'image' && imageData && imageType) {
    messageContent.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: imageType,
        data: imageData,
      },
    });
    messageContent.push({
      type: 'text',
      text: `Erstelle ${count} Multiple-Choice-Fragen basierend auf dem obigen Bild/Dokument. Schwierigkeit: ${difficulty}. Sprachniveau: ${level}.`,
    });
  } else if (source === 'pdf' && imageData) {
    messageContent.push({
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: imageData,
      },
    });
    messageContent.push({
      type: 'text',
      text: `Erstelle ${count} Multiple-Choice-Fragen basierend auf dem obigen PDF-Dokument. Schwierigkeit: ${difficulty}. Sprachniveau: ${level}.`,
    });
  } else {
    messageContent.push({
      type: 'text',
      text: `Erstelle ${count} Multiple-Choice-Fragen zum folgenden Thema/Text:\n\n${content}\n\nSchwierigkeit: ${difficulty}. Sprachniveau: ${level}.`,
    });
  }

  const systemPrompt = `Du bist ein erfahrener Pädagoge und erstellst hochwertige Multiple-Choice-Fragen für den Schulunterricht.
Sprachniveau "${level}": Passe Vokabular und Komplexität entsprechend an.
Schwierigkeit "${difficulty}": einfach = klare Fakten, gemischt = Mischung, schwer = Analyse und Verständnis.
Jede Frage hat genau 4 Antwortoptionen (A–D), davon exakt eine richtige.
Die Erklärung soll lehrreich und knapp sein (1–2 Sätze).
Antworte ausschließlich über das Tool quiz_output.`;

  let apiResponse;
  try {
    apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        tool_choice: { type: 'tool', name: 'quiz_output' },
        tools: [
          {
            name: 'quiz_output',
            description: 'Gibt das generierte Quiz als strukturiertes JSON aus',
            input_schema: {
              type: 'object',
              properties: {
                questions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      question: { type: 'string', description: 'Die Frage' },
                      options: {
                        type: 'array',
                        items: { type: 'string' },
                        minItems: 4,
                        maxItems: 4,
                        description: 'Genau 4 Antwortoptionen',
                      },
                      correct: {
                        type: 'number',
                        description: 'Index der richtigen Antwort (0–3)',
                      },
                      explanation: {
                        type: 'string',
                        description: 'Kurze Erklärung der richtigen Antwort',
                      },
                    },
                    required: ['question', 'options', 'correct', 'explanation'],
                  },
                },
              },
              required: ['questions'],
            },
          },
        ],
        messages: [{ role: 'user', content: messageContent }],
      }),
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Verbindung zur KI fehlgeschlagen. Bitte erneut versuchen.', detail: err.message }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!apiResponse.ok) {
    const errText = await apiResponse.text();
    return new Response(
      JSON.stringify({ error: `KI-API Fehler (${apiResponse.status})`, detail: errText }),
      { status: apiResponse.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const data = await apiResponse.json();

  const toolBlock = data.content && data.content.find((b) => b.type === 'tool_use');
  if (!toolBlock) {
    return new Response(
      JSON.stringify({ error: 'Keine Fragen generiert. Bitte versuche es mit einem anderen Thema.' }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const questions = toolBlock.input?.questions ?? [];
  if (questions.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Keine Fragen generiert. Bitte versuche es mit einem anderen Thema.' }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ questions }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export const config = { path: '/api/generate-quiz' };
