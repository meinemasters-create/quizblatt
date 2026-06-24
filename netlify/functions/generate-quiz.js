exports.handler = async function(event, context) {
  // Maximize available time
  context.callbackWaitsForEmptyEventLoop = false;

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY fehlt.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ungültiger Request-Body' }) };
  }

  const { source, content, imageData, imageType, count = 10, difficulty = 'gemischt', level = 'Gymnasium' } = body;

  const messageContent = [];

  if (source === 'image' && imageData && imageType) {
    messageContent.push({ type: 'image', source: { type: 'base64', media_type: imageType, data: imageData } });
    messageContent.push({ type: 'text', text: `Erstelle exakt ${count} Multiple-Choice-Fragen aus dem Bild. Schwierigkeit: ${difficulty}. Niveau: ${level}.` });
  } else if (source === 'pdf' && imageData) {
    messageContent.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: imageData } });
    messageContent.push({ type: 'text', text: `Erstelle exakt ${count} Multiple-Choice-Fragen aus dem PDF. Schwierigkeit: ${difficulty}. Niveau: ${level}.` });
  } else {
    messageContent.push({ type: 'text', text: `Erstelle exakt ${count} Multiple-Choice-Fragen zum Thema: ${content}\n\nSchwierigkeit: ${difficulty}. Niveau: ${level}.` });
  }

  // Short, efficient system prompt
  const systemPrompt = `Pädagoge. Erstelle Multiple-Choice-Fragen. Niveau: ${level}. Schwierigkeit: ${difficulty}. Genau 4 Optionen pro Frage, eine korrekt. Antworte NUR via quiz_output tool.`;

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
        model: 'claude-haiku-4-5-20251001',  // Haiku: much faster than Sonnet for this task
        max_tokens: 4096,
        system: systemPrompt,
        tool_choice: { type: 'tool', name: 'quiz_output' },
        tools: [{
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
                    question:    { type: 'string' },
                    options:     { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
                    correct:     { type: 'number', description: 'Index 0-3' },
                    explanation: { type: 'string' }
                  },
                  required: ['question', 'options', 'correct', 'explanation']
                }
              }
            },
            required: ['questions']
          }
        }],
        messages: [{ role: 'user', content: messageContent }]
      })
    });
  } catch (err) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'Verbindung zur KI fehlgeschlagen.', detail: err.message }) };
  }

  if (!apiResponse.ok) {
    const errText = await apiResponse.text();
    return { statusCode: apiResponse.status, headers, body: JSON.stringify({ error: `KI-API Fehler (${apiResponse.status})`, detail: errText }) };
  }

  const data = await apiResponse.json();
  const toolBlock = data.content && data.content.find(b => b.type === 'tool_use');
  if (!toolBlock) {
    return { statusCode: 422, headers, body: JSON.stringify({ error: 'Keine Fragen generiert.' }) };
  }

  const questions = toolBlock.input && toolBlock.input.questions ? toolBlock.input.questions : [];
  if (questions.length === 0) {
    return { statusCode: 422, headers, body: JSON.stringify({ error: 'Keine Fragen generiert.' }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify({ questions }) };
};
