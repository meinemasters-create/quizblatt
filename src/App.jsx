import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  navy:   '#0F1729',
  mid:    '#1A2540',
  light:  '#243054',
  indigo: '#5B6EF5',
  amber:  '#F5A623',
  chalk:  '#F4F5FB',
  muted:  '#8892B0',
  green:  '#34D399',
  red:    '#F87171',
  border: '#2A3558',
  purple: '#8B5CF6',
  teal:   '#14B8A6',
};

const css = {
  app: {
    minHeight: '100vh',
    background: C.navy,
    color: C.chalk,
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
  },
  container: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '0 20px',
  },
  card: {
    background: C.mid,
    borderRadius: 16,
    border: `1px solid ${C.border}`,
    padding: 24,
  },
  btn: (variant = 'primary') => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 24px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: 15,
    transition: 'all 0.15s ease',
    background: variant === 'primary' ? C.indigo
      : variant === 'amber' ? C.amber
      : variant === 'ghost' ? 'transparent'
      : variant === 'danger' ? C.red
      : C.light,
    color: variant === 'amber' ? C.navy
      : variant === 'ghost' ? C.muted
      : C.chalk,
    outline: 'none',
    boxSizing: 'border-box',
    ...(variant === 'ghost' ? { border: `1px solid ${C.border}` } : { border: 'none' }),
  }),
  input: {
    width: '100%',
    background: C.light,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: '12px 16px',
    color: C.chalk,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 15,
    outline: 'none',
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: C.muted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily: "'DM Mono', monospace",
  },
  chip: (active) => ({
    padding: '6px 16px',
    borderRadius: 100,
    border: `1px solid ${active ? C.indigo : C.border}`,
    background: active ? `${C.indigo}22` : 'transparent',
    color: active ? C.indigo : C.muted,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    transition: 'all 0.15s',
    fontFamily: "'Space Grotesk', sans-serif",
  }),
};

// ─── Supabase Client ──────────────────────────────────────────────────────────
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || '';
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnon
  ? createClient(supabaseUrl, supabaseAnon)
  : null;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icon = {
  quiz: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill={`${C.indigo}33`}/>
      <path d="M10 9h12M10 14h12M10 19h8" stroke={C.indigo} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="22" cy="22" r="4" fill={C.amber} stroke={C.navy} strokeWidth="2"/>
      <path d="M22 20.5v1.5l1 1" stroke={C.navy} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  join: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill={`${C.teal}33`}/>
      <path d="M16 8l4 4-4 4" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 12H11a3 3 0 000 6h1" stroke={C.teal} strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 20l4 4-4 4" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 24H11a3 3 0 010-6h1" stroke={C.teal} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  account: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill={`${C.purple}33`}/>
      <circle cx="16" cy="13" r="4" stroke={C.purple} strokeWidth="2"/>
      <path d="M8 25c0-4 3.6-7 8-7s8 3 8 7" stroke={C.purple} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  pdf: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="2" width="14" height="18" rx="2" stroke={C.muted} strokeWidth="1.5"/>
      <path d="M17 2l4 4v14H17" stroke={C.muted} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7 9h6M7 13h4" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  camera: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={C.muted} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="13" r="4" stroke={C.muted} strokeWidth="1.5"/>
    </svg>
  ),
  text: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M17 6H3M21 12H3M15 18H3" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill={C.green}/>
      <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  wrong: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill={C.red}/>
      <path d="M7 7l6 6M13 7l-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill={C.amber}>
      <path d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L10 14.4l-4.8 2.5.9-5.4L2.2 7.7l5.4-.8z"/>
    </svg>
  ),
  back: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M13 4l-6 6 6 6" stroke={C.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  share: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="15" cy="5" r="2" stroke={C.chalk} strokeWidth="1.5"/>
      <circle cx="15" cy="15" r="2" stroke={C.chalk} strokeWidth="1.5"/>
      <circle cx="5" cy="10" r="2" stroke={C.chalk} strokeWidth="1.5"/>
      <path d="M7 9l6-3M7 11l6 3" stroke={C.chalk} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  save: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M15 18H5a2 2 0 01-2-2V4a2 2 0 012-2h7l5 5v9a2 2 0 01-2 2z" stroke={C.chalk} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M13 18v-6H7v6M7 2v5h6" stroke={C.chalk} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  trophy: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path d="M15 8h18v14a9 9 0 01-18 0V8z" stroke={C.amber} strokeWidth="2" strokeLinejoin="round" fill={`${C.amber}22`}/>
      <path d="M15 12H8v4a7 7 0 007 7M33 12h7v4a7 7 0 01-7 7" stroke={C.amber} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M24 30v8M18 40h12" stroke={C.amber} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  folder: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" stroke={C.muted} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M7 3H3a1 1 0 00-1 1v10a1 1 0 001 1h4M12 13l4-4-4-4M16 9H7" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// ─── Utility ──────────────────────────────────────────────────────────────────
function shuffleAnswers(question) {
  const opts = question.options.map((text, i) => ({ text, originalIndex: i }));
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return {
    ...question,
    shuffledOptions: opts,
    shuffledCorrect: opts.findIndex(o => o.originalIndex === question.correct),
  };
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = () => reject(new Error('Lesen fehlgeschlagen'));
    r.readAsDataURL(file);
  });
}

// ─── Components ───────────────────────────────────────────────────────────────

// Progress Bar
function ProgressBar({ value, color = C.indigo, height = 6, animated = false }) {
  return (
    <div style={{ background: C.light, borderRadius: 100, overflow: 'hidden', height }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, value))}%`,
        height: '100%',
        background: color,
        borderRadius: 100,
        transition: animated ? 'width 0.4s ease' : 'width 0.15s',
      }} />
    </div>
  );
}

// Modal
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: '#000a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ ...css.card, maxWidth: 440, width: '100%', boxShadow: '0 24px 48px #000a' }}
      >
        {title && (
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
}

// Toast
function Toast({ message, type = 'info', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);
  const color = type === 'error' ? C.red : type === 'success' ? C.green : C.indigo;
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: C.mid, border: `1px solid ${color}`,
      borderRadius: 12, padding: '12px 20px',
      color: C.chalk, fontSize: 14, fontWeight: 500,
      zIndex: 2000, maxWidth: 360, textAlign: 'center',
      boxShadow: `0 8px 24px ${color}44`,
    }}>
      {message}
    </div>
  );
}

// ─── SCREEN: Home ─────────────────────────────────────────────────────────────
function HomeScreen({ onNavigate, user }) {
  const tiles = [
    {
      id: 'account',
      icon: Icon.account,
      label: 'Account',
      sublabel: user ? user.email.split('@')[0] : 'Anmelden',
      color: C.purple,
    },
    {
      id: 'join',
      icon: Icon.join,
      label: 'Beitreten',
      sublabel: 'PIN eingeben',
      color: C.teal,
    },
    {
      id: 'generate',
      icon: Icon.quiz,
      label: 'Generieren',
      sublabel: 'Quiz erstellen',
      color: C.indigo,
    },
  ];

  return (
    <div style={{ ...css.app, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        padding: '40px 20px 0',
        textAlign: 'center',
        background: `linear-gradient(180deg, ${C.mid} 0%, transparent 100%)`,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: `${C.indigo}1a`, border: `1px solid ${C.indigo}44`,
          borderRadius: 100, padding: '6px 16px', marginBottom: 20,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill={C.indigo}>
            <circle cx="7" cy="7" r="6.5" fill={`${C.indigo}33`} stroke={C.indigo} strokeWidth="1"/>
            <path d="M5 7l2 2 3-3" stroke={C.indigo} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 12, color: C.indigo, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
            KI-gestützt · Offline-fähig
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 12 }}>
          Quizblatt
          <span style={{ color: C.indigo }}> Generator</span>
        </h1>
        <p style={{ color: C.muted, fontSize: 16, maxWidth: 400, margin: '0 auto 40px' }}>
          Erstelle in Sekunden individuelle Quizze aus PDFs, Fotos oder einem Thema.
        </p>
      </div>

      {/* Tiles */}
      <div style={{
        ...css.container,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        padding: '0 20px 40px',
        maxWidth: 920,
      }}>
        {tiles.map(tile => (
          <button
            key={tile.id}
            onClick={() => onNavigate(tile.id)}
            style={{
              background: C.mid,
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              padding: '28px 16px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = tile.color;
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = `0 12px 32px ${tile.color}22`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: 36 }}>{tile.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{tile.label}</div>
              <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{tile.sublabel}</div>
            </div>
          </button>
        ))}
      </div>

      <style>{`
        @media (max-width: 480px) {
          .home-tiles { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px', marginTop: 'auto' }}>
        <p style={{ color: C.muted, fontSize: 12 }}>
          Powered by Claude AI · Für den Schulbetrieb
        </p>
      </div>
    </div>
  );
}

// ─── SCREEN: Join (PIN) ───────────────────────────────────────────────────────
function JoinScreen({ onNavigate, onStartQuiz }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check URL for pin param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPin = params.get('pin');
    if (urlPin) {
      setPin(urlPin);
      // Auto-load after short delay
      setTimeout(() => handleJoin(urlPin), 400);
    }
  }, []);

  const handleJoin = async (pinToUse = pin) => {
    const cleanPin = pinToUse.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setError('Bitte gib einen gültigen 6-stelligen PIN ein.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/.netlify/functions/get-quiz-session?pin=${cleanPin}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unbekannter Fehler');
      onStartQuiz(data.questions, 'solo', data.opts);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...css.app, padding: '20px 0 40px' }}>
      <div style={css.container}>
        <button onClick={() => onNavigate('home')} style={{ ...css.btn('ghost'), marginBottom: 24 }}>
          {Icon.back} Zurück
        </button>
        <div style={css.card}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Quiz beitreten</h2>
          <p style={{ color: C.muted, marginBottom: 24 }}>
            Gib den PIN deines Lehrers ein oder scanne den QR-Code.
          </p>

          <label style={css.label}>6-stelliger PIN</label>
          <input
            style={{
              ...css.input,
              fontSize: 28,
              fontWeight: 700,
              textAlign: 'center',
              letterSpacing: 8,
              fontFamily: "'DM Mono', monospace",
              marginBottom: error ? 8 : 20,
            }}
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="000000"
            value={pin}
            onChange={e => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 6));
              setError('');
            }}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
          {error && (
            <p style={{ color: C.red, fontSize: 14, marginBottom: 12 }}>{error}</p>
          )}
          <button
            onClick={() => handleJoin()}
            disabled={loading || pin.length !== 6}
            style={{
              ...css.btn('primary'),
              width: '100%',
              opacity: (loading || pin.length !== 6) ? 0.5 : 1,
              cursor: loading || pin.length !== 6 ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Lade Quiz…' : 'Beitreten →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: Generate ─────────────────────────────────────────────────────────
function GenerateScreen({ onNavigate, onQuizReady, user }) {
  const [source, setSource] = useState('text'); // 'text' | 'pdf' | 'image'
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState(null);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('gemischt');
  const [level, setLevel] = useState('Gymnasium');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();
  const intervalRef = useRef();

  const difficulties = ['einfach', 'gemischt', 'schwer'];
  const levels = ['Grundschule', 'Gymnasium', 'Universität'];

  const handleFileChange = (f) => {
    if (!f) return;
    const isPdf = f.type === 'application/pdf';
    const isImg = f.type.startsWith('image/');
    if (!isPdf && !isImg) {
      setError('Nur PDF oder Bilddateien sind erlaubt.');
      return;
    }
    setFile(f);
    setSource(isPdf ? 'pdf' : 'image');
    setError('');
  };

  const startProgress = () => {
    setProgress(5);
    let val = 5;
    intervalRef.current = setInterval(() => {
      val += Math.random() * 8;
      if (val >= 88) {
        clearInterval(intervalRef.current);
        val = 88;
      }
      setProgress(val);
    }, 600);
  };

  const stopProgress = () => {
    clearInterval(intervalRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 600);
  };

  const handleGenerate = async () => {
    if (source === 'text' && !topic.trim()) {
      setError('Bitte gib ein Thema oder einen Text ein.');
      return;
    }
    if ((source === 'pdf' || source === 'image') && !file) {
      setError('Bitte wähle eine Datei aus.');
      return;
    }

    setLoading(true);
    setError('');
    startProgress();

    try {
      let body = { source, count, difficulty, level };

      if (file) {
        const b64 = await toBase64(file);
        body.imageData = b64;
        body.imageType = file.type;
      } else {
        body.content = topic;
      }

      // Split into batches of max 5 to avoid timeouts
      const BATCH = 5;
      const batches = [];
      let remaining = count;
      while (remaining > 0) {
        batches.push(Math.min(BATCH, remaining));
        remaining -= BATCH;
      }

      let allQuestions = [];
      for (let i = 0; i < batches.length; i++) {
        const batchBody = { ...body, count: batches[i] };
        const res = await fetch('/.netlify/functions/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batchBody),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Generierung fehlgeschlagen');
        allQuestions = allQuestions.concat(data.questions || []);
        // Update progress between batches
        setProgress(Math.min(88, 20 + (i + 1) * (65 / batches.length)));
      }

      stopProgress();
      onQuizReady(allQuestions, { count, difficulty, level, topic: topic || file?.name || 'Generiert' });
    } catch (e) {
      stopProgress();
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...css.app, padding: '20px 0 60px' }}>
      <div style={css.container}>
        <button onClick={() => onNavigate('home')} style={{ ...css.btn('ghost'), marginBottom: 24 }}>
          {Icon.back} Zurück
        </button>

        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Quiz generieren</h2>
        <p style={{ color: C.muted, marginBottom: 24 }}>Wähle eine Quelle und pass das Quiz an.</p>

        {/* Source Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'text',  icon: Icon.text,   label: 'Thema/Text' },
            { id: 'pdf',   icon: Icon.pdf,    label: 'PDF' },
            { id: 'image', icon: Icon.camera, label: 'Foto' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => { setSource(s.id); setFile(null); setError(''); }}
              style={{
                ...css.btn(source === s.id ? 'primary' : 'ghost'),
                flex: 1,
                gap: 6,
                padding: '10px 8px',
                fontSize: 13,
              }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Source Input */}
        <div style={{ ...css.card, marginBottom: 16 }}>
          {source === 'text' && (
            <>
              <label style={css.label}>Thema oder Text</label>
              <textarea
                style={{
                  ...css.input,
                  minHeight: 120,
                  resize: 'vertical',
                  lineHeight: 1.6,
                }}
                placeholder="z.B. Die Französische Revolution, Photosynthese, Quadratische Gleichungen …"
                value={topic}
                onChange={e => { setTopic(e.target.value); setError(''); }}
              />
            </>
          )}

          {(source === 'pdf' || source === 'image') && (
            <>
              <label style={css.label}>
                {source === 'pdf' ? 'PDF-Dokument hochladen' : 'Foto aufnehmen oder hochladen'}
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDragging(false);
                  handleFileChange(e.dataTransfer.files[0]);
                }}
                style={{
                  border: `2px dashed ${dragging ? C.indigo : file ? C.green : C.border}`,
                  borderRadius: 12,
                  padding: 32,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                  background: dragging ? `${C.indigo}11` : file ? `${C.green}11` : 'transparent',
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  {file ? Icon.check : (source === 'pdf' ? Icon.pdf : Icon.camera)}
                </div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>
                  {file ? file.name : (source === 'pdf' ? 'PDF hier ablegen oder antippen' : 'Foto aufnehmen oder auswählen')}
                </p>
                {file && (
                  <p style={{ color: C.muted, fontSize: 13 }}>
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                )}
                {!file && (
                  <p style={{ color: C.muted, fontSize: 13 }}>
                    {source === 'pdf' ? 'PDF-Dateien bis 10 MB' : 'JPG, PNG, HEIC'}
                  </p>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept={source === 'pdf' ? 'application/pdf' : 'image/*'}
                capture={source === 'image' ? 'environment' : undefined}
                style={{ display: 'none' }}
                onChange={e => handleFileChange(e.target.files[0])}
              />
              {file && (
                <button
                  onClick={() => setFile(null)}
                  style={{ ...css.btn('ghost'), fontSize: 12, marginTop: 10, padding: '6px 12px' }}
                >
                  Datei entfernen
                </button>
              )}
            </>
          )}
        </div>

        {/* Settings */}
        <div style={{ ...css.card, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={css.label}>Anzahl Fragen</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range"
                  min={5} max={30} step={1}
                  value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  style={{ flex: 1, accentColor: C.indigo }}
                />
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 20, fontWeight: 700,
                  color: C.indigo, minWidth: 32, textAlign: 'right',
                }}>
                  {count}
                </span>
              </div>
            </div>
            <div>
              <label style={css.label}>Schwierigkeit</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {difficulties.map(d => (
                  <button key={d} onClick={() => setDifficulty(d)} style={css.chip(difficulty === d)}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label style={css.label}>Sprachniveau</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {levels.map(l => (
                <button key={l} onClick={() => setLevel(l)} style={css.chip(level === l)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress */}
        {loading && (
          <div style={{ marginBottom: 16 }}>
            <ProgressBar value={progress} animated />
            <p style={{ color: C.muted, fontSize: 13, marginTop: 8, textAlign: 'center' }}>
              KI generiert {count} Fragen… Bitte warten.
            </p>
          </div>
        )}

        {error && (
          <div style={{
            background: `${C.red}15`, border: `1px solid ${C.red}44`,
            borderRadius: 10, padding: 14, marginBottom: 16, color: C.red, fontSize: 14,
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            ...css.btn('primary'),
            width: '100%',
            fontSize: 16,
            padding: '14px 24px',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Generiere…' : `✨ ${count} Fragen generieren`}
        </button>
      </div>
    </div>
  );
}

// ─── SCREEN: Quiz Ready (choose mode) ────────────────────────────────────────
function QuizReadyScreen({ questions, opts, onNavigate, onStartQuiz, user, showToast }) {
  const [pin, setPin] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [sharing, setSharing] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState(opts?.topic || 'Mein Quiz');
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolder, setNewFolder] = useState('');

  useEffect(() => {
    if (user && supabase) loadFolders();
  }, [user]);

  const loadFolders = async () => {
    const { data } = await supabase
      .from('quiz_folders')
      .select('*')
      .order('name');
    if (data) setFolders(data);
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await fetch('/.netlify/functions/create-quiz-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, opts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPin(data.pin);
      const appUrl = `${window.location.origin}?pin=${data.pin}`;
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}`);
      setShowShare(true);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSharing(false);
    }
  };

  const handleSave = async () => {
    if (!supabase || !user) return;
    let folderId = selectedFolder || null;

    if (newFolder.trim()) {
      const { data } = await supabase
        .from('quiz_folders')
        .insert({ name: newFolder.trim(), user_id: user.id })
        .select()
        .single();
      if (data) folderId = data.id;
    }

    const { error } = await supabase.from('saved_quizzes').insert({
      user_id: user.id,
      folder_id: folderId,
      title: saveTitle,
      questions,
      opts,
    });

    if (error) {
      showToast('Fehler beim Speichern', 'error');
    } else {
      showToast('Quiz gespeichert!', 'success');
      setSaveModal(false);
    }
  };

  return (
    <div style={{ ...css.app, padding: '20px 0 60px' }}>
      <div style={css.container}>
        <button onClick={() => onNavigate('generate')} style={{ ...css.btn('ghost'), marginBottom: 24 }}>
          {Icon.back} Neues Quiz
        </button>

        {/* Summary */}
        <div style={{ ...css.card, marginBottom: 20, background: `${C.indigo}15`, border: `1px solid ${C.indigo}33` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>{opts?.topic || 'Quiz bereit!'}</h2>
              <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
                {questions.length} Fragen · {opts?.difficulty} · {opts?.level}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {user && (
                <button onClick={() => setSaveModal(true)} style={{ ...css.btn('ghost'), padding: '8px 14px', fontSize: 13 }}>
                  {Icon.save} Speichern
                </button>
              )}
              <button
                onClick={handleShare}
                disabled={sharing}
                style={{ ...css.btn('ghost'), padding: '8px 14px', fontSize: 13, opacity: sharing ? 0.6 : 1 }}
              >
                {Icon.share} {sharing ? 'Erstelle PIN…' : 'Teilen'}
              </button>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        <Modal open={showShare} onClose={() => setShowShare(false)} title="Quiz teilen">
          <div style={{ textAlign: 'center' }}>
            {qrUrl && (
              <img
                src={qrUrl}
                alt="QR-Code"
                style={{ width: 180, height: 180, borderRadius: 12, margin: '0 auto 20px', display: 'block' }}
              />
            )}
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 42, fontWeight: 700,
              letterSpacing: 8, color: C.indigo,
              marginBottom: 8,
            }}>
              {pin}
            </div>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>
              Schüler geben diesen PIN ein oder scannen den QR-Code.
            </p>
            <button onClick={() => setShowShare(false)} style={{ ...css.btn(), width: '100%' }}>
              Schließen
            </button>
          </div>
        </Modal>

        {/* Save Modal */}
        <Modal open={saveModal} onClose={() => setSaveModal(false)} title="Quiz speichern">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={css.label}>Titel</label>
              <input
                style={css.input}
                value={saveTitle}
                onChange={e => setSaveTitle(e.target.value)}
              />
            </div>
            {folders.length > 0 && (
              <div>
                <label style={css.label}>Ordner</label>
                <select
                  style={{ ...css.input }}
                  value={selectedFolder}
                  onChange={e => setSelectedFolder(e.target.value)}
                >
                  <option value="">Kein Ordner</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label style={css.label}>Neuer Ordner (optional)</label>
              <input
                style={css.input}
                placeholder="z.B. Klasse 8a – Biologie"
                value={newFolder}
                onChange={e => setNewFolder(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setSaveModal(false)} style={{ ...css.btn('ghost'), flex: 1 }}>
                Abbrechen
              </button>
              <button onClick={handleSave} style={{ ...css.btn(), flex: 1 }}>
                Speichern
              </button>
            </div>
          </div>
        </Modal>

        {/* Mode Selection */}
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Spielmodus wählen</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            {
              mode: 'beamer',
              icon: '🖥️',
              title: 'Gemeinsam am Bildschirm',
              desc: 'Beamer oder Smartboard — alle sehen die gleiche Frage.',
              color: C.indigo,
            },
            {
              mode: 'solo',
              icon: '📱',
              title: 'Jeder für sich',
              desc: 'Jeder Schüler spielt auf seinem eigenen Gerät.',
              color: C.teal,
            },
          ].map(option => (
            <button
              key={option.mode}
              onClick={() => onStartQuiz(questions, option.mode, opts)}
              style={{
                ...css.card,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                border: `1px solid ${C.border}`,
                transition: 'border-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = option.color;
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ fontSize: 36 }}>{option.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{option.title}</div>
                <div style={{ color: C.muted, fontSize: 14 }}>{option.desc}</div>
              </div>
              <div style={{ marginLeft: 'auto', color: C.muted }}>→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: Quiz Play ────────────────────────────────────────────────────────
function QuizPlayScreen({ questions: questionsProp, mode, opts, onNavigate, showToast }) {
  const questions = (questionsProp && questionsProp.length > 0)
    ? questionsProp
    : (window.__lastQuizData && window.__lastQuizData.questions) || [];
  const shuffled = useRef(questions.map(shuffleAnswers));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);
  const [exitModal, setExitModal] = useState(false);

  const q = shuffled.current[current];
  const total = shuffled.current.length;
  const LABELS = ['A', 'B', 'C', 'D'];

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === q.shuffledCorrect;
    if (correct) setScore(s => s + 1);
    setResults(r => [...r, { question: q.question, correct, explanation: q.explanation }]);
  };

  const handleNext = () => {
    if (current + 1 >= total) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  };

  if (done) {
    const pct = Math.round((score / total) * 100);
    const grade = pct >= 90 ? 'Ausgezeichnet!' : pct >= 70 ? 'Gut gemacht!' : pct >= 50 ? 'Weiter üben!' : 'Nicht aufgeben!';
    return (
      <div style={{ ...css.app, padding: '20px 0 60px' }}>
        <div style={css.container}>
          {/* Result Summary */}
          <div style={{
            ...css.card,
            textAlign: 'center',
            marginBottom: 24,
            background: `linear-gradient(135deg, ${C.mid}, ${C.light})`,
          }}>
            <div style={{ marginBottom: 16 }}>{Icon.trophy}</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{grade}</h2>
            <div style={{
              fontSize: 56,
              fontWeight: 700,
              color: pct >= 70 ? C.green : pct >= 50 ? C.amber : C.red,
              fontFamily: "'DM Mono', monospace",
              lineHeight: 1,
              marginBottom: 8,
            }}>
              {pct}%
            </div>
            <p style={{ color: C.muted, fontSize: 16 }}>
              {score} von {total} Fragen richtig
            </p>
            <div style={{ marginTop: 16 }}>
              <ProgressBar
                value={pct}
                color={pct >= 70 ? C.green : pct >= 50 ? C.amber : C.red}
                height={10}
                animated
              />
            </div>
          </div>

          {/* Question Review */}
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Fragenübersicht</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {results.map((r, i) => (
              <div
                key={i}
                style={{
                  ...css.card,
                  padding: 16,
                  border: `1px solid ${r.correct ? `${C.green}44` : `${C.red}44`}`,
                  background: r.correct ? `${C.green}0a` : `${C.red}0a`,
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    {r.correct ? Icon.check : Icon.wrong}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{r.question}</p>
                    <p style={{ color: C.muted, fontSize: 13 }}>{r.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => onNavigate('home')}
              style={{ ...css.btn('ghost'), flex: 1 }}
            >
              Zur Startseite
            </button>
            <button
              onClick={() => {
                setCurrent(0);
                setSelected(null);
                setScore(0);
                setResults([]);
                setDone(false);
                shuffled.current = questions.map(shuffleAnswers);
              }}
              style={{ ...css.btn(), flex: 1 }}
            >
              Wiederholen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...css.app, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: C.mid,
        borderBottom: `1px solid ${C.border}`,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => setExitModal(true)} style={{ ...css.btn('ghost'), padding: '6px 10px', flexShrink: 0 }}>
          ✕
        </button>
        <div style={{ flex: 1 }}>
          <ProgressBar value={(current / total) * 100} />
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 13, color: C.muted, flexShrink: 0,
        }}>
          {current + 1}/{total}
        </div>
        <div style={{
          background: `${C.amber}22`, border: `1px solid ${C.amber}44`,
          borderRadius: 100, padding: '4px 12px',
          fontFamily: "'DM Mono', monospace",
          fontSize: 13, color: C.amber, fontWeight: 700,
          flexShrink: 0,
        }}>
          {score} ★
        </div>
      </div>

      {/* Question */}
      <div style={{ flex: 1, ...css.container, padding: '32px 20px' }}>
        <div style={{ ...css.card, marginBottom: 20, minHeight: 100 }}>
          <div style={{
            fontSize: 11, fontFamily: "'DM Mono', monospace",
            color: C.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Frage {current + 1}
          </div>
          <p style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600, lineHeight: 1.5 }}>
            {q.question}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {q.shuffledOptions.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === q.shuffledCorrect;
            const showResult = selected !== null;
            let bg = C.mid;
            let border = C.border;
            let textColor = C.chalk;
            if (showResult) {
              if (isCorrect) { bg = `${C.green}22`; border = C.green; }
              else if (isSelected && !isCorrect) { bg = `${C.red}22`; border = C.red; }
            } else if (isSelected) {
              bg = `${C.indigo}22`; border = C.indigo;
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: bg,
                  border: `1.5px solid ${border}`,
                  borderRadius: 12,
                  padding: '14px 18px',
                  cursor: selected !== null ? 'default' : 'pointer',
                  textAlign: 'left',
                  color: textColor,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 15,
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  width: '100%',
                }}
              >
                <span style={{
                  width: 32, height: 32,
                  borderRadius: 8,
                  background: showResult && isCorrect ? C.green : showResult && isSelected ? C.red : `${C.indigo}33`,
                  color: showResult ? 'white' : C.indigo,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 700, fontSize: 13,
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}>
                  {LABELS[i]}
                </span>
                <span>{opt.text}</span>
                {showResult && isCorrect && (
                  <span style={{ marginLeft: 'auto' }}>{Icon.check}</span>
                )}
                {showResult && isSelected && !isCorrect && (
                  <span style={{ marginLeft: 'auto' }}>{Icon.wrong}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {selected !== null && (
          <div style={{
            ...css.card,
            background: `${C.indigo}15`,
            border: `1px solid ${C.indigo}33`,
            marginBottom: 20,
          }}>
            <p style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: C.indigo, marginBottom: 6 }}>
              ERKLÄRUNG
            </p>
            <p style={{ color: C.chalk, fontSize: 15, lineHeight: 1.6 }}>
              {q.explanation}
            </p>
          </div>
        )}

        {selected !== null && (
          <button
            onClick={handleNext}
            style={{ ...css.btn('primary'), width: '100%', fontSize: 16, padding: '14px' }}
          >
            {current + 1 >= total ? '🏆 Ergebnis anzeigen' : 'Weiter →'}
          </button>
        )}
      </div>

      {/* Exit Modal */}
      <Modal open={exitModal} onClose={() => setExitModal(false)} title="Quiz verlassen?">
        <p style={{ color: C.muted, marginBottom: 20 }}>
          Dein Fortschritt geht verloren.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setExitModal(false)} style={{ ...css.btn('ghost'), flex: 1 }}>
            Weitermachen
          </button>
          <button onClick={() => onNavigate('home')} style={{ ...css.btn('danger'), flex: 1 }}>
            Verlassen
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ─── SCREEN: Account ──────────────────────────────────────────────────────────
function AccountScreen({ onNavigate, user, setUser, showToast }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);

  useEffect(() => {
    if (user && supabase) loadMyQuizzes();
  }, [user]);

  const loadMyQuizzes = async () => {
    const [{ data: qData }, { data: fData }] = await Promise.all([
      supabase.from('saved_quizzes').select('*').order('created_at', { ascending: false }),
      supabase.from('quiz_folders').select('*').order('name'),
    ]);
    if (qData) setQuizzes(qData);
    if (fData) setFolders(fData);
  };

  const handleAuth = async () => {
    if (!supabase) {
      setError('Supabase ist nicht konfiguriert. Bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY setzen.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let result;
      if (mode === 'login') {
        result = await supabase.auth.signInWithPassword({ email, password });
      } else {
        result = await supabase.auth.signUp({ email, password });
      }
      if (result.error) throw result.error;
      setUser(result.data.user);
      showToast(mode === 'login' ? 'Angemeldet!' : 'Konto erstellt!', 'success');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    setUser(null);
  };

  if (!user) {
    return (
      <div style={{ ...css.app, padding: '20px 0 60px' }}>
        <div style={css.container}>
          <button onClick={() => onNavigate('home')} style={{ ...css.btn('ghost'), marginBottom: 24 }}>
            {Icon.back} Zurück
          </button>
          <div style={css.card}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              {mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
            </h2>
            <p style={{ color: C.muted, marginBottom: 24 }}>
              {mode === 'login'
                ? 'Meld dich an, um deine gespeicherten Quizze zu sehen.'
                : 'Erstelle ein kostenloses Konto und speichere deine Quizze.'}
            </p>

            <label style={css.label}>E-Mail</label>
            <input
              type="email"
              style={{ ...css.input, marginBottom: 14 }}
              placeholder="name@schule.de"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
            />
            <label style={css.label}>Passwort</label>
            <input
              type="password"
              style={{ ...css.input, marginBottom: error ? 8 : 20 }}
              placeholder="Mindestens 6 Zeichen"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
            />
            {error && (
              <p style={{ color: C.red, fontSize: 14, marginBottom: 12 }}>{error}</p>
            )}
            <button
              onClick={handleAuth}
              disabled={loading}
              style={{
                ...css.btn('primary'),
                width: '100%',
                marginBottom: 14,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Lade…' : (mode === 'login' ? 'Anmelden' : 'Konto erstellen')}
            </button>
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ ...css.btn('ghost'), width: '100%' }}
            >
              {mode === 'login' ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Anmelden'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredQuizzes = selectedFolder
    ? quizzes.filter(q => q.folder_id === selectedFolder)
    : quizzes.filter(q => !q.folder_id);

  return (
    <div style={{ ...css.app, padding: '20px 0 60px' }}>
      <div style={css.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => onNavigate('home')} style={{ ...css.btn('ghost') }}>
            {Icon.back} Zurück
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={handleLogout} style={{ ...css.btn('ghost'), padding: '8px 14px', fontSize: 13 }}>
            {Icon.logout} Abmelden
          </button>
        </div>

        <div style={{ ...css.card, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: `${C.purple}33`, border: `2px solid ${C.purple}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>{user.email}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{quizzes.length} gespeicherte Quizze</div>
            </div>
          </div>
        </div>

        {/* Folders */}
        {folders.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <button onClick={() => setSelectedFolder(null)} style={css.chip(!selectedFolder)}>
              Alle
            </button>
            {folders.map(f => (
              <button key={f.id} onClick={() => setSelectedFolder(f.id)} style={css.chip(selectedFolder === f.id)}>
                {Icon.folder} {f.name}
              </button>
            ))}
          </div>
        )}

        {/* Saved Quizzes */}
        {filteredQuizzes.length === 0 ? (
          <div style={{ ...css.card, textAlign: 'center', padding: 40 }}>
            <p style={{ color: C.muted, fontSize: 16, marginBottom: 8 }}>Noch keine Quizze gespeichert.</p>
            <p style={{ color: C.muted, fontSize: 14 }}>Generiere ein Quiz und speichere es hier.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredQuizzes.map(q => (
              <div
                key={q.id}
                style={{
                  ...css.card,
                  padding: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                }}
                onClick={() => onNavigate('ready', { questions: q.questions, opts: q.opts })}
              >
                <div style={{
                  width: 40, height: 40,
                  background: `${C.indigo}22`,
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  📋
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.title}
                  </div>
                  <div style={{ color: C.muted, fontSize: 13 }}>
                    {q.questions?.length} Fragen · {new Date(q.created_at).toLocaleDateString('de-DE')}
                  </div>
                </div>
                <div style={{ color: C.muted }}>→</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('home');
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  // Use a ref so quiz data is NEVER lost between renders or state updates
  const quizRef = useRef({ questions: [], mode: null, opts: null });

  useEffect(() => {
    // Check for PIN in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('pin')) setScreen('join');

    // Auth listener
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) setUser(session.user);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
        setUser(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  const navigate = (to, data = null) => {
    if (data) {
      quizRef.current = { ...quizRef.current, ...data };
    }
    if (to !== 'play') window.scrollTo(0, 0);
    setScreen(to);
  };

  const startQuiz = (questions, mode, opts) => {
    // Store directly in ref - guaranteed to persist
    quizRef.current = { questions: questions || [], mode, opts };
    setScreen('play');
  };

  const onQuizReady = (questions, opts) => {
    quizRef.current = { questions: questions || [], mode: null, opts };
    setScreen('ready');
  };

  const renderScreen = () => {
    const { questions, mode, opts } = quizRef.current;
    switch (screen) {
      case 'home':
        return <HomeScreen onNavigate={navigate} user={user} />;
      case 'join':
        return <JoinScreen onNavigate={navigate} onStartQuiz={startQuiz} />;
      case 'generate':
        return <GenerateScreen onNavigate={navigate} onQuizReady={onQuizReady} user={user} />;
      case 'ready':
        return (
          <QuizReadyScreen
            questions={questions}
            opts={opts}
            onNavigate={navigate}
            onStartQuiz={startQuiz}
            user={user}
            showToast={showToast}
          />
        );
      case 'play':
        return (
          <QuizPlayScreen
            questions={questions}
            mode={mode}
            opts={opts}
            onNavigate={navigate}
            showToast={showToast}
          />
        );
      case 'account':
        return (
          <AccountScreen
            onNavigate={navigate}
            user={user}
            setUser={setUser}
            showToast={showToast}
          />
        );
      default:
        return <HomeScreen onNavigate={navigate} user={user} />;
    }
  };

  return (
    <>
      {renderScreen()}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </>
  );
}
