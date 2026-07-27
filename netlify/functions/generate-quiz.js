exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY fehlt.' }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch (e) { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ungültiger Request-Body' }) }; }

  const { source, content, imageData, imageType, count = 10, difficulty = 'gemischt', level = 'Gymnasium', withImages = false } = body;

  const messageContent = [];
  if (source === 'image' && imageData && imageType) {
    messageContent.push({ type: 'image', source: { type: 'base64', media_type: imageType, data: imageData } });
    messageContent.push({ type: 'text', text: `Erstelle exakt ${count} EINZIGARTIGE Multiple-Choice-Fragen aus dem Bild, jede zu einem anderen Aspekt. Schwierigkeit: ${difficulty}. Niveau: ${level}.${withImages ? ' Füge bei jeder Frage ein "imageQuery"-Feld hinzu: ein präziser englischer Suchbegriff für ein passendes Bild (z.B. "french revolution 1789" oder "photosynthesis plant cells").' : ''}` });
  } else if (source === 'pdf' && imageData) {
    messageContent.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: imageData } });
    messageContent.push({ type: 'text', text: `Erstelle exakt ${count} EINZIGARTIGE Multiple-Choice-Fragen aus dem PDF, jede zu einem anderen Aspekt. Schwierigkeit: ${difficulty}. Niveau: ${level}.${withImages ? ' Füge bei jeder Frage ein "imageQuery"-Feld hinzu: ein präziser englischer Suchbegriff für ein passendes Bild.' : ''}` });
  } else {
    messageContent.push({ type: 'text', text: `Erstelle exakt ${count} EINZIGARTIGE Multiple-Choice-Fragen zum Thema: ${content}\n\nJede Frage muss einen anderen Aspekt, Fakt oder Teilbereich abfragen. Schwierigkeit: ${difficulty}. Niveau: ${level}.${withImages ? '\n\nFüge bei jeder Frage ein "imageQuery"-Feld hinzu: ein präziser englischer Suchbegriff für ein passendes Bild (z.B. "weimar republic germany 1919" oder "pythagorean theorem triangle").' : ''}` });
  }

  const systemPrompt = `Du bist ein erfahrener Pädagoge. Erstelle Multiple-Choice-Fragen. Niveau: ${level}. Schwierigkeit: ${difficulty}.
WICHTIG:
- Jede Frage MUSS einen anderen Aspekt, Fakt oder Teilbereich des Themas abfragen
- KEINE Wiederholungen: nicht dieselbe Kernaussage mit anderen Worten
- KEINE semantisch ähnlichen Fragen (z.B. nicht zweimal nach demselben Begriff fragen)
- Decke möglichst viele verschiedene Aspekte des Themas ab
- Genau 4 Antwortoptionen pro Frage, exakt eine korrekt
- Antworte NUR via quiz_output tool.`;

  // Build tool schema — with or without imageQuery field
  const questionSchema = {
    type: 'object',
    properties: {
      question:    { type: 'string' },
      options:     { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
      correct:     { type: 'number', description: 'Index 0-3' },
      explanation: { type: 'string' },
      ...(withImages ? { imageQuery: { type: 'string', description: 'Short English search query for a relevant image' } } : {}),
    },
    required: ['question', 'options', 'correct', 'explanation'],
  };

  let apiResponse;
  try {
    apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: systemPrompt,
        tool_choice: { type: 'tool', name: 'quiz_output' },
        tools: [{
          name: 'quiz_output',
          description: 'Gibt das generierte Quiz als strukturiertes JSON aus',
          input_schema: {
            type: 'object',
            properties: { questions: { type: 'array', items: questionSchema } },
            required: ['questions'],
          },
        }],
        messages: [{ role: 'user', content: messageContent }],
      }),
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
  if (!toolBlock) return { statusCode: 422, headers, body: JSON.stringify({ error: 'Keine Fragen generiert.' }) };

  let questions = toolBlock.input && toolBlock.input.questions ? toolBlock.input.questions : [];
  if (questions.length === 0) return { statusCode: 422, headers, body: JSON.stringify({ error: 'Keine Fragen generiert.' }) };

  // If withImages: fetch image URLs from Unsplash (no API key needed for source.unsplash.com)
  if (withImages) {
    questions = await Promise.all(questions.map(async (q) => {
      if (!q.imageQuery) return q;
      try {
        const query = encodeURIComponent(q.imageQuery);
        // Use Wikimedia Commons API — no key needed, educational context, CC-licensed
        const res = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url|mime&format=json&origin=*`,
          { headers: { 'User-Agent': 'QuizblattGenerator/1.0' } }
        );
        const json = await res.json();
        const pages = json.query && json.query.pages;
        if (pages) {
          const page = Object.values(pages)[0];
          if (page.imageinfo && page.imageinfo[0]) {
            const info = page.imageinfo[0];
            if (info.mime && info.mime.startsWith('image/') && !info.mime.includes('svg')) {
              return { ...q, imageUrl: info.url };
            }
          }
        }
        // Fallback: Picsum with deterministic seed from query
        const seed = q.imageQuery.split(' ').join('-').slice(0, 20);
        return { ...q, imageUrl: `https://picsum.photos/seed/${seed}/600/300` };
      } catch (e) {
        const seed = q.imageQuery.split(' ').join('-').slice(0, 20);
        return { ...q, imageUrl: `https://picsum.photos/seed/${seed}/600/300` };
      }
    }));
  }

  return { statusCode: 200, headers, body: JSON.stringify({ questions }) };
};
