// ─── Längen-Prüfung: Verrät die Antwortlänge die richtige Lösung? ────────────
function isLengthGiveaway(q) {
  if (!q || !Array.isArray(q.options) || q.options.length !== 4) return false;
  if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) return false;

  const lens = q.options.map(o => String(o || '').trim().length);
  if (lens.some(l => l === 0)) return false;

  const correctLen = lens[q.correct];
  const others = lens.filter((_, i) => i !== q.correct);
  const otherAvg = others.reduce((a, b) => a + b, 0) / others.length;
  if (otherAvg === 0) return false;

  const ratio = correctLen / otherAvg;
  const maxLen = Math.max(...lens), minLen = Math.min(...lens);

  // Bei durchweg sehr kurzen Optionen (Einzelbegriffe, Jahreszahlen, Namen) ist
  // ein Längenunterschied von wenigen Zeichen kein verwertbarer Hinweis.
  if (maxLen <= 15) return false;

  const isLongest  = correctLen === maxLen && lens.filter(l => l === correctLen).length === 1;
  const isShortest = correctLen === minLen && lens.filter(l => l === correctLen).length === 1;

  // Richtige Antwort deutlich länger als der Schnitt der Distraktoren
  if (isLongest && ratio > 1.3) return true;
  // Oder deutlich kürzer (ebenfalls ein verräterisches Muster)
  if (isShortest && ratio < 0.7) return true;
  // Oder extreme Streuung, bei der die Lösung an einem Ende liegt
  if (maxLen > 0 && (maxLen - minLen) / maxLen > 0.55 && (isLongest || isShortest)) return true;

  return false;
}

// ─── Reparatur: Optionen auf gleiche Länge umschreiben lassen ────────────────
async function repairOptions(badQuestions, apiKey, level) {
  const list = badQuestions.map((q, i) =>
    `Frage ${i + 1}: ${q.question}\nOptionen:\n${q.options.map((o, j) =>
      `  [${j}] (${String(o).length} Zeichen)${j === q.correct ? ' <-- RICHTIG' : ''} ${o}`).join('\n')}`
  ).join('\n\n');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: `Du überarbeitest Multiple-Choice-Antworten. Niveau: ${level}.
Bei den folgenden Fragen verrät die LÄNGE der Antworten, welche richtig ist. Das muss behoben werden.

Deine Aufgabe für jede Frage:
- Schreibe alle vier Optionen so um, dass sie ANNÄHERND GLEICH LANG sind (max. ±15% Abweichung)
- Der INHALT der richtigen Antwort bleibt sachlich unverändert, nur die Formulierung wird angepasst
- Welche Option sachlich richtig ist, darf sich NICHT ändern
- Kürze zu lange Optionen, ergänze zu kurze um fachlich passende Präzisierungen
- Alle vier Optionen: gleicher Detailgrad, gleicher Satzbau, gleicher Sprachstil
- Die Distraktoren müssen fachlich falsch, aber plausibel bleiben
- Gib die Fragen in derselben Reihenfolge zurück, mit korrektem "correct"-Index
- Die Frage selbst und die Erklärung bleiben unverändert

Antworte NUR via quiz_output tool.`,
      tool_choice: { type: 'tool', name: 'quiz_output' },
      tools: [{
        name: 'quiz_output',
        description: 'Gibt die überarbeiteten Fragen zurück',
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
                  correct:     { type: 'number', description: 'Index 0-3 der richtigen Antwort' },
                  explanation: { type: 'string' },
                },
                required: ['question', 'options', 'correct', 'explanation'],
              },
            },
          },
          required: ['questions'],
        },
      }],
      messages: [{ role: 'user', content: `Überarbeite diese ${badQuestions.length} Frage(n):\n\n${list}` }],
    }),
  });

  if (!res.ok) throw new Error('Repair-Call fehlgeschlagen');
  const data = await res.json();
  const block = data.content && data.content.find(b => b.type === 'tool_use');
  const fixed = block && block.input && block.input.questions ? block.input.questions : [];
  if (fixed.length !== badQuestions.length) throw new Error('Repair-Antwort unvollstaendig');
  return fixed;
}

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  const startTime = Date.now();

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

  const { source, content, imageData, imageType, count = 10, difficulty = 'gemischt', level = 'Gymnasium', withImages = false, existingQuestions = [] } = body;

  const messageContent = [];
  if (source === 'image' && imageData && imageType) {
    messageContent.push({ type: 'image', source: { type: 'base64', media_type: imageType, data: imageData } });
    messageContent.push({ type: 'text', text: `Erstelle exakt ${count} EINZIGARTIGE Multiple-Choice-Fragen aus dem Bild, jede zu einem anderen Aspekt. Schwierigkeit: ${difficulty}. Niveau: ${level}.${withImages ? ' Füge bei jeder Frage ein "imageQuery"-Feld hinzu: ein präziser englischer Suchbegriff für ein passendes Bild (z.B. "french revolution 1789" oder "photosynthesis plant cells").' : ''}` });
  } else if (source === 'pdf' && imageData) {
    messageContent.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: imageData } });
    messageContent.push({ type: 'text', text: `Erstelle exakt ${count} EINZIGARTIGE Multiple-Choice-Fragen aus dem PDF, jede zu einem anderen Aspekt. Schwierigkeit: ${difficulty}. Niveau: ${level}.${withImages ? ' Füge bei jeder Frage ein "imageQuery"-Feld hinzu: ein präziser englischer Suchbegriff für ein passendes Bild.' : ''}` });
  } else {
    const existingList = existingQuestions.length > 0
      ? `\n\nBereits generierte Fragen (DIESE NICHT WIEDERHOLEN, auch nicht sinngemäß):\n${existingQuestions.map((q, i) => `${i+1}. ${q}`).join('\n')}`
      : '';
    messageContent.push({ type: 'text', text: `Erstelle exakt ${count} NEUE, EINZIGARTIGE Multiple-Choice-Fragen zum Thema: ${content}${existingList}\n\nJede Frage muss einen völlig anderen Aspekt, Fakt oder Teilbereich abfragen als alle anderen. Schwierigkeit: ${difficulty}. Niveau: ${level}.${withImages ? '\n\nFüge bei jeder Frage ein "imageQuery"-Feld hinzu: ein präziser englischer Suchbegriff für ein passendes Bild.' : ''}` });
  }

  const existingHint = existingQuestions.length > 0
    ? `\n- Es wurden bereits ${existingQuestions.length} Fragen generiert. Deine neuen Fragen dürfen sich inhaltlich NICHT mit diesen überschneiden.`
    : '';
  const systemPrompt = `Du bist ein erfahrener Pädagoge und Testkonstrukteur. Erstelle Multiple-Choice-Fragen. Niveau: ${level}. Schwierigkeit: ${difficulty}.

INHALTLICHE REGELN:
- Jede Frage MUSS einen völlig anderen Aspekt, Fakt oder Teilbereich abfragen
- ABSOLUT KEINE Wiederholungen: weder wörtlich noch sinngemäß
- KEINE Fragen die dasselbe Wissen auf andere Weise testen
- Verteile die Fragen über verschiedene Teilbereiche des Themas
- Genau 4 Antwortoptionen pro Frage, exakt eine korrekt${existingHint}

ANTWORTLÄNGE — HÖCHSTE PRIORITÄT:
Schüler dürfen die richtige Antwort NIEMALS an ihrer Länge erkennen. Das ist der häufigste
Konstruktionsfehler bei Multiple-Choice-Aufgaben und muss zwingend vermieden werden.
- Alle vier Optionen einer Frage müssen ANNÄHERND GLEICH LANG sein (maximal ±15% Zeichenabweichung)
- Zähle vor der Ausgabe die Zeichen jeder Option und gleiche Abweichungen aus
- Die richtige Antwort darf NICHT die längste und NICHT die kürzste Option sein
- Alle vier Optionen haben denselben Detailgrad, dieselbe Satzstruktur und denselben Sprachstil
- Formuliere die Distraktoren genauso sorgfältig und fachlich präzise wie die richtige Antwort
- VERBOTEN: die richtige Antwort mit erklärenden Zusätzen, Nebensätzen oder Präzisierungen
  aufblähen, während die Distraktoren knapp bleiben
- VERBOTEN: Distraktoren als kurze Stichworte formulieren, wenn die richtige Antwort ein Satz ist
- Wenn die richtige Antwort nur ein Wort braucht, sind auch alle Distraktoren einwortig

FORMALE TARNUNG:
- Keine absoluten Signalwörter ("immer", "nie", "ausschließlich", "alle") nur in Distraktoren
- Keine einschränkenden Signalwörter ("meist", "in der Regel", "tendenziell") nur in der richtigen Antwort
- Alle Optionen beginnen grammatikalisch gleichartig (alle mit Substantiv, alle mit Verb, usw.)

Antworte NUR via quiz_output tool.`;

  // Build tool schema — with or without imageQuery field
  const questionSchema = {
    type: 'object',
    properties: {
      question:    { type: 'string' },
      options:     {
        type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4,
        description: 'Genau 4 Optionen, ANNÄHERND GLEICH LANG (max. ±15% Zeichenabweichung). Die richtige Antwort darf weder die längste noch die kürzeste sein. Gleicher Detailgrad und Satzbau bei allen vier.',
      },
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

  // ── Längen-Kontrolle: Fragen reparieren, bei denen die Länge die Lösung verrät
  const flaggedIdx = [];
  questions.forEach((q, i) => { if (isLengthGiveaway(q)) flaggedIdx.push(i); });

  // Nur reparieren, wenn genug Zeit bleibt (Netlify-Timeout: 26 s)
  if (flaggedIdx.length > 0 && (Date.now() - startTime) < 14000) {
    try {
      const fixed = await repairOptions(flaggedIdx.map(i => questions[i]), apiKey, level);
      flaggedIdx.forEach((origIdx, k) => {
        const f = fixed[k];
        // Nur übernehmen, wenn die Reparatur formal gültig UND tatsächlich besser ist
        if (f && Array.isArray(f.options) && f.options.length === 4 &&
            typeof f.correct === 'number' && f.correct >= 0 && f.correct <= 3 &&
            f.options.every(o => String(o || '').trim().length > 0) &&
            !isLengthGiveaway(f)) {
          questions[origIdx] = {
            ...questions[origIdx],
            options: f.options,
            correct: f.correct,
          };
        }
      });
    } catch (e) {
      // Reparatur fehlgeschlagen: Originalfragen behalten, Quiz trotzdem ausliefern
    }
  }

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
