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

// ─── COMPONENT: UserBar (persistent top-right account button) ────────────────
function UserBar({ user, onNavigate }) {
  if (!user) return null;
  return (
    <div style={{
      position: 'fixed', top: 12, right: 16, zIndex: 200,
    }}>
      <button
        onClick={() => onNavigate('account')}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: C.mid, border: `1px solid ${C.border}`,
          borderRadius: 100, padding: '7px 14px 7px 10px',
          cursor: 'pointer', color: C.chalk,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600, fontSize: 13,
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = C.indigo;
          e.currentTarget.style.boxShadow = `0 4px 20px ${C.indigo}33`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)';
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: `${C.indigo}30`, border: `1.5px solid ${C.indigo}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Mono', monospace",
          fontSize: 11, fontWeight: 700, color: C.indigo,
          flexShrink: 0,
        }}>
          {user.email[0].toUpperCase()}
        </div>
        Mein Konto
      </button>
    </div>
  );
}

// ─── SCREEN: Home ─────────────────────────────────────────────────────────────
function HomeScreen({ onNavigate, user }) {
  const SCHOOL = 'Robert-Schuman-Schule';

  const tiles = [
    {
      id: 'join',
      emoji: '🔑',
      label: 'Quiz beitreten',
      desc: 'PIN von der Lehrkraft eingeben und mitspielen',
      color: C.amber,
    },
    {
      id: 'generate',
      emoji: '✦',
      label: 'Quiz generieren',
      desc: 'Aus PDF, Foto oder Thema ein neues Quiz erstellen',
      color: C.indigo,
    },
  ];

  return (
    <div style={{ ...css.app, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 480px) {
          .home-tiles { grid-template-columns: 1fr !important; }
        }
        .home-tile:hover { transform: translateY(-4px) !important; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '52px 24px 0',
        textAlign: 'center',
      }}>
        {/* School label */}
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.18em',
          color: C.indigo,
          textTransform: 'uppercase',
          marginBottom: 18,
        }}>
          {SCHOOL}
        </div>

        {/* Main title */}
        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 52px)',
          fontWeight: 700,
          lineHeight: 1.05,
          marginBottom: 16,
          letterSpacing: '-0.02em',
        }}>
          RSB Quiz<span style={{ color: C.indigo }}>blatt</span> Generator
        </h1>

        <p style={{ color: C.muted, fontSize: 17, maxWidth: 420, margin: '0 auto 36px' }}>
          KI-gestützter Quiz-Generator für den Unterricht
        </p>

        {/* Auth banner */}
        <div
          onClick={() => onNavigate('account')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 560,
            margin: '0 auto 40px',
            background: C.mid,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: '14px 20px',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.indigo}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="7" r="3.5" stroke={C.muted} strokeWidth="1.5"/>
              <path d="M2 16c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ color: C.muted, fontSize: 15 }}>
              {user ? user.email : 'Noch nicht angemeldet'}
            </span>
          </div>
          <span style={{ color: C.muted, fontSize: 14 }}>
            {user ? 'Mein Account →' : 'Anmelden →'}
          </span>
        </div>
      </div>

      {/* Tiles */}
      <div
        className="home-tiles"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
          padding: '0 24px 48px',
          maxWidth: 640,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {tiles.map(tile => (
          <button
            key={tile.id}
            className="home-tile"
            onClick={() => onNavigate(tile.id)}
            style={{
              background: C.mid,
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              padding: '36px 24px 28px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'transform 0.18s ease, border-color 0.18s, box-shadow 0.18s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = tile.color;
              e.currentTarget.style.boxShadow = `0 16px 40px ${tile.color}28`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{
              fontSize: tile.emoji === '✦' ? 40 : 44,
              marginBottom: 20,
              lineHeight: 1,
              color: tile.emoji === '✦' ? tile.color : 'inherit',
            }}>
              {tile.emoji}
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, color: C.chalk }}>
              {tile.label}
            </div>
            <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>
              {tile.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '0 0 28px', marginTop: 'auto' }}>
        <p style={{ color: `${C.muted}66`, fontSize: 12, letterSpacing: '0.04em', marginBottom: 8 }}>
          © {new Date().getFullYear()} Tim Stahlberg · Powered by Claude AI
        </p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          <button
            onClick={() => onNavigate('impressum')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: `${C.muted}88`, fontSize: 11,
              fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: 0,
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}
          >Impressum</button>
          <button
            onClick={() => onNavigate('datenschutz')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: `${C.muted}88`, fontSize: 11,
              fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: 0,
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}
          >Datenschutz</button>
        </div>
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
  const [source, setSource] = useState('text');
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState(null);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('gemischt');
  const [level, setLevel] = useState('Sekundarstufe 1');
  const [withImages, setWithImages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const intervalRef = useRef();

  const handleFileChange = (f) => {
    if (!f) return;
    const isPdf = f.type === 'application/pdf';
    const isImg = f.type.startsWith('image/');
    if (!isPdf && !isImg) { setError('Nur PDF oder Bilddateien erlaubt.'); return; }
    setFile(f); setSource(isPdf ? 'pdf' : 'image'); setError('');
  };

  const startProgress = () => {
    setProgress(5); let val = 5;
    intervalRef.current = setInterval(() => {
      val += Math.random() * 6;
      if (val >= 88) { clearInterval(intervalRef.current); val = 88; }
      setProgress(val);
    }, 700);
  };

  const stopProgress = () => {
    clearInterval(intervalRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 600);
  };

  const handleGenerate = async () => {
    if (source === 'text' && !topic.trim()) { setError('Bitte gib ein Thema ein.'); return; }
    if ((source === 'pdf' || source === 'image') && !file) { setError('Bitte wähle eine Datei aus.'); return; }
    setLoading(true); setError(''); startProgress();
    try {
      let body = { source, count, difficulty, level, withImages };
      if (file) {
        const b64 = await toBase64(file);
        body.imageData = b64; body.imageType = file.type;
      } else { body.content = topic; }

      let allQuestions = [];
      if (file) {
        const res = await fetch('/.netlify/functions/generate-quiz', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, count: Math.min(count, 10) }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Generierung fehlgeschlagen');
        allQuestions = data.questions || [];
      } else {
        const BATCH = 5; const batches = [];
        let rem = count;
        while (rem > 0) { batches.push(Math.min(BATCH, rem)); rem -= BATCH; }
        for (let i = 0; i < batches.length; i++) {
          const res = await fetch('/.netlify/functions/generate-quiz', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...body, count: batches[i] }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Generierung fehlgeschlagen');
          allQuestions = allQuestions.concat(data.questions || []);
          setProgress(Math.min(88, 20 + (i + 1) * (65 / batches.length)));
        }
      }
      stopProgress();
      onQuizReady(allQuestions, { count: allQuestions.length, difficulty, level, topic: topic || file?.name || 'Generiert', withImages });
    } catch (e) { stopProgress(); setError(e.message); }
    finally { setLoading(false); }
  };

  const sources = [
    { id: 'text',  label: 'Thema / Text', icon: '✦', desc: 'Freitext eingeben' },
    { id: 'pdf',   label: 'PDF',          icon: '⬡', desc: 'Dokument hochladen' },
    { id: 'image', label: 'Foto',         icon: '◎', desc: 'Kamera oder Bild' },
  ];

  const selStyle = {
    width: '100%', appearance: 'none', WebkitAppearance: 'none',
    background: C.navy, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: '10px 32px 10px 12px',
    color: C.chalk, fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14, fontWeight: 500, cursor: 'pointer', outline: 'none',
  };

  const labelStyle = {
    display: 'block', fontFamily: "'DM Mono', monospace",
    fontSize: 10, letterSpacing: '0.14em', color: C.muted,
    textTransform: 'uppercase', marginBottom: 8,
  };

  return (
    <div style={{ ...css.app, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .gen-src { transition: all 0.16s ease; }
        .gen-src:hover { border-color: ${C.indigo} !important; background: ${C.indigo}14 !important; transform: translateY(-2px); box-shadow: 0 6px 20px ${C.indigo}22 !important; }
        .gen-src:hover .src-icon { color: ${C.indigo} !important; }
        .gen-src:hover .src-label { color: ${C.chalk} !important; }
        .drop-zone { transition: all 0.16s ease; }
        .drop-zone:hover { border-color: ${C.indigo} !important; background: ${C.indigo}0a !important; }
        .gen-go { transition: all 0.18s ease; }
        .gen-go:hover:not(:disabled) { opacity: 0.88 !important; transform: translateY(-2px) !important; box-shadow: 0 8px 28px ${C.indigo}44 !important; }
        .img-toggle:hover { border-color: ${C.indigo}88 !important; }
      `}</style>

      <div style={{ maxWidth: 680, margin: '0 auto', width: '100%', padding: '24px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <button onClick={() => onNavigate('home')} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: C.muted,
            fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: 0, display: 'flex', alignItems: 'center', gap: 4,
          }}>← Zurück</button>
          <div style={{ width: 1, height: 12, background: C.border }} />
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: '0.14em', color: C.indigo, textTransform: 'uppercase' }}>
            Quiz erstellen
          </div>
        </div>

        {/* Source tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {sources.map(s => (
            <button key={s.id} className="gen-src"
              onClick={() => { setSource(s.id); setFile(null); setError(''); }}
              style={{
                background: source === s.id ? `${C.indigo}18` : C.mid,
                border: `1.5px solid ${source === s.id ? C.indigo : C.border}`,
                borderRadius: 12, padding: '14px 10px',
                cursor: 'pointer', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                boxShadow: source === s.id ? `0 4px 20px ${C.indigo}28` : 'none',
                transition: 'all 0.16s ease',
              }}
            >
              <span className="src-icon" style={{
                fontSize: 22, fontFamily: "'DM Mono', monospace",
                color: source === s.id ? C.indigo : C.muted, lineHeight: 1,
                transition: 'color 0.16s',
              }}>{s.icon}</span>
              <span className="src-label" style={{
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13,
                color: source === s.id ? C.chalk : C.muted, transition: 'color 0.16s',
              }}>{s.label}</span>
              <span style={{
                fontSize: 11, fontFamily: "'DM Mono', monospace",
                color: source === s.id ? `${C.indigo}bb` : `${C.muted}77`,
              }}>{s.desc}</span>
            </button>
          ))}
        </div>

        {/* Input card */}
        <div style={{ background: C.mid, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 18px' }}>
          {source === 'text' && (
            <>
              <label style={labelStyle}>Thema oder Text</label>
              <textarea
                style={{
                  width: '100%', background: C.navy, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: '12px 14px', color: C.chalk,
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 14,
                  outline: 'none', resize: 'none', height: 110, lineHeight: 1.6,
                  boxSizing: 'border-box',
                }}
                placeholder="z. B. Die Weimarer Republik, Photosynthese, Satz des Pythagoras …"
                value={topic}
                onChange={e => { setTopic(e.target.value); setError(''); }}
              />
            </>
          )}
          {(source === 'pdf' || source === 'image') && (
            <>
              <label style={labelStyle}>{source === 'pdf' ? 'PDF hochladen' : 'Foto aufnehmen'}</label>
              <div className="drop-zone"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFileChange(e.dataTransfer.files[0]); }}
                style={{
                  border: `2px dashed ${file ? C.indigo : C.border}`, borderRadius: 10,
                  padding: '18px 16px', cursor: 'pointer',
                  background: file ? `${C.indigo}0a` : 'transparent',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: file ? `${C.indigo}20` : C.light,
                  border: `1px solid ${file ? C.indigo : C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'DM Mono', monospace", fontSize: 18,
                  color: file ? C.indigo : C.muted,
                }}>
                  {file ? '✓' : (source === 'pdf' ? '⬡' : '◎')}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: C.chalk }}>
                    {file ? file.name : (source === 'pdf' ? 'PDF ablegen oder antippen' : 'Foto aufnehmen oder auswählen')}
                  </p>
                  <p style={{ color: C.muted, fontSize: 12 }}>
                    {file ? `${(file.size / 1024).toFixed(0)} KB` : (source === 'pdf' ? 'PDF bis 10 MB' : 'JPG, PNG, HEIC')}
                  </p>
                </div>
                {file && (
                  <button onClick={e => { e.stopPropagation(); setFile(null); }} style={{
                    background: 'none', border: `1px solid ${C.border}`, borderRadius: 6,
                    padding: '4px 10px', color: C.muted, fontSize: 11, cursor: 'pointer', flexShrink: 0,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}>✕</button>
                )}
              </div>
              <input ref={fileRef} type="file"
                accept={source === 'pdf' ? 'application/pdf' : 'image/*'}
                capture={source === 'image' ? 'environment' : undefined}
                style={{ display: 'none' }}
                onChange={e => handleFileChange(e.target.files[0])}
              />
            </>
          )}
        </div>

        {/* Settings card */}
        <div style={{ background: C.mid, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 18px' }}>
          {/* Slider — full width */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Anzahl Fragen</label>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: C.indigo }}>{count}</span>
            </div>
            <input type="range" min={5} max={30} step={1} value={count}
              onChange={e => setCount(Number(e.target.value))}
              style={{ width: '100%', accentColor: C.indigo, cursor: 'pointer', margin: 0, height: 4 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: `${C.muted}66` }}>5</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: `${C.muted}66` }}>30</span>
            </div>
          </div>

          {/* Dropdowns row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Schwierigkeit</label>
              <div style={{ position: 'relative' }}>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={selStyle}>
                  <option value="einfach">Einfach</option>
                  <option value="gemischt">Gemischt</option>
                  <option value="schwer">Schwer</option>
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none', fontSize: 10, fontFamily: "'DM Mono', monospace" }}>▾</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Sprachniveau</label>
              <div style={{ position: 'relative' }}>
                <select value={level} onChange={e => setLevel(e.target.value)} style={selStyle}>
                  <option value="Grundschule">Grundschule</option>
                  <option value="Sekundarstufe 1">Sekundarstufe 1</option>
                  <option value="Sekundarstufe 2">Sekundarstufe 2</option>
                  <option value="Universität">Universität</option>
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none', fontSize: 10, fontFamily: "'DM Mono', monospace" }}>▾</span>
              </div>
            </div>
          </div>

          {/* Image toggle */}
          <button
            className="img-toggle"
            onClick={() => setWithImages(!withImages)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: withImages ? `${C.indigo}12` : C.navy,
              border: `1px solid ${withImages ? C.indigo : C.border}`,
              borderRadius: 10, padding: '11px 14px', cursor: 'pointer',
              transition: 'all 0.16s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🖼</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: withImages ? C.chalk : C.muted }}>
                  Bilder zu den Fragen
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: withImages ? `${C.indigo}cc` : `${C.muted}77`, letterSpacing: '0.06em' }}>
                  {withImages ? 'aktiviert — passende Bilder werden gesucht' : 'optional · über Web-Suche'}
                </div>
              </div>
            </div>
            {/* Toggle pill */}
            <div style={{
              width: 42, height: 24, borderRadius: 12, flexShrink: 0,
              background: withImages ? C.indigo : C.light,
              border: `1px solid ${withImages ? C.indigo : C.border}`,
              position: 'relative', transition: 'all 0.2s ease',
            }}>
              <div style={{
                position: 'absolute', top: 3,
                left: withImages ? 20 : 3,
                width: 16, height: 16, borderRadius: '50%',
                background: 'white', transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </button>
        </div>

        {/* Progress */}
        {loading && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <span>KI generiert{withImages ? ' + sucht Bilder' : ''}…</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div style={{ background: C.light, borderRadius: 100, height: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg, ${C.indigo}, ${C.purple})`, borderRadius: 100, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: `${C.red}12`, border: `1px solid ${C.red}44`, borderRadius: 10, padding: '10px 14px', color: C.red, fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Generate button */}
        <button className="gen-go" onClick={handleGenerate} disabled={loading}
          style={{
            width: '100%', padding: '15px',
            background: loading ? C.light : `linear-gradient(135deg, ${C.indigo} 0%, ${C.purple} 100%)`,
            border: 'none', borderRadius: 12,
            color: loading ? C.muted : 'white',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Generiere…' : `✦  ${count} Fragen generieren${withImages ? ' + Bilder' : ''}`}
        </button>
      </div>
    </div>
  );
}

// ─── SCREEN: Quiz Editor ──────────────────────────────────────────────────────
function QuizEditorScreen({ questions: initialQuestions, opts, onNavigate, onDone }) {
  const [questions, setQuestions] = useState(initialQuestions.map((q, i) => ({ ...q, _id: i })));
  const [editIdx, setEditIdx] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null); // null = all collapsed

  // ── Edit state for the currently open question ────────────────────────────
  const [editQ, setEditQ] = useState('');
  const [editOpts, setEditOpts] = useState(['', '', '', '']);
  const [editCorrect, setEditCorrect] = useState(0);
  const [editExp, setEditExp] = useState('');

  const openEdit = (idx) => {
    const q = questions[idx];
    setEditQ(q.question);
    setEditOpts([...q.options]);
    setEditCorrect(q.correct);
    setEditExp(q.explanation);
    setEditIdx(idx);
  };

  const saveEdit = () => {
    if (!editQ.trim()) return;
    setQuestions(qs => qs.map((q, i) => i === editIdx ? {
      ...q,
      question: editQ.trim(),
      options: editOpts.map(o => o.trim()),
      correct: editCorrect,
      explanation: editExp.trim(),
    } : q));
    setEditIdx(null);
  };

  const deleteQuestion = (idx) => {
    setQuestions(qs => qs.filter((_, i) => i !== idx));
    setDeleteConfirm(null);
  };

  const LABELS = ['A', 'B', 'C', 'D'];
  const answerColors = [
    `${C.red}18`, `${C.indigo}18`, `${C.amber}18`, `${C.green}18`,
  ];
  const answerBorders = [C.red, C.indigo, C.amber, C.green];

  return (
    <div style={{ ...css.app, minHeight: '100vh' }}>
      <style>{`
        .eq-card { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
        .eq-card:hover { border-color: ${C.indigo}55 !important; }
        .eq-edit-btn { transition: all 0.15s ease; opacity: 0; }
        .eq-card:hover .eq-edit-btn { opacity: 1 !important; }
        .eq-del-btn { transition: all 0.15s ease; opacity: 0; }
        .eq-card:hover .eq-del-btn { opacity: 1 !important; }
        .eq-opt-btn { transition: all 0.15s ease; cursor: pointer; }
        .eq-opt-btn:hover { opacity: 0.85; }
      `}</style>

      {/* Header */}
      <div style={{
        background: C.mid, borderBottom: `1px solid ${C.border}`,
        padding: '0 20px', height: 56,
        display: 'flex', alignItems: 'center', gap: 16,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => onNavigate('generate')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.muted, fontSize: 12, fontFamily: "'DM Mono', monospace",
          letterSpacing: '0.08em', textTransform: 'uppercase', padding: 0,
        }}>← Neu generieren</button>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            letterSpacing: '0.12em', color: C.muted, textTransform: 'uppercase',
          }}>
            {questions.length} Fragen · {opts?.topic || 'Quiz'}
          </span>
        </div>

        <button
          onClick={() => onDone(questions)}
          disabled={questions.length === 0}
          style={{
            background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`,
            border: 'none', borderRadius: 10, padding: '8px 20px',
            color: 'white', fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 13, cursor: questions.length === 0 ? 'not-allowed' : 'pointer',
            opacity: questions.length === 0 ? 0.5 : 1,
          }}
        >
          Weiter →
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Intro */}
        <div style={{
          background: `${C.indigo}10`, border: `1px solid ${C.indigo}30`,
          borderRadius: 14, padding: '14px 18px', marginBottom: 24,
          display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>✦</span>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
            Prüfe und bearbeite die generierten Fragen. Klicke auf eine Frage zum Bearbeiten oder lösche sie. Wenn du fertig bist, klicke auf <strong style={{ color: C.chalk }}>Weiter →</strong>
          </p>
        </div>

        {/* Question list */}
        {/* Expand/Collapse all controls */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
          <button
            onClick={() => setExpandedIdx('all')}
            style={{
              background: 'transparent', border: `1px solid ${C.border}`,
              borderRadius: 8, padding: '6px 14px',
              color: C.muted, fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600, fontSize: 12, cursor: 'pointer',
            }}
          >▾ Alle aufklappen</button>
          <button
            onClick={() => setExpandedIdx(null)}
            style={{
              background: 'transparent', border: `1px solid ${C.border}`,
              borderRadius: 8, padding: '6px 14px',
              color: C.muted, fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600, fontSize: 12, cursor: 'pointer',
            }}
          >▸ Alle einklappen</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {questions.map((q, idx) => {
            const isOpen = expandedIdx === 'all' || expandedIdx === idx;
            return (
              <div
                key={q._id}
                className="eq-card"
                style={{
                  background: C.mid, border: `1px solid ${isOpen ? C.indigo + '55' : C.border}`,
                  borderRadius: 14, overflow: 'hidden', position: 'relative',
                  transition: 'border-color 0.15s ease',
                }}
              >
                {/* ── Collapsed header — always visible ── */}
                <div
                  onClick={() => setExpandedIdx(isOpen && expandedIdx !== 'all' ? null : idx)}
                  style={{
                    padding: '14px 18px', display: 'flex', gap: 12,
                    alignItems: 'center', cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {/* Number badge */}
                  <div style={{
                    width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                    background: isOpen ? `${C.indigo}25` : `${C.indigo}15`,
                    border: `1px solid ${C.indigo}${isOpen ? '55' : '33'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'DM Mono', monospace", fontSize: 11,
                    fontWeight: 700, color: C.indigo,
                    transition: 'all 0.15s',
                  }}>
                    {idx + 1}
                  </div>

                  {/* Question text — always shown */}
                  <p style={{
                    fontWeight: 600, fontSize: 14, lineHeight: 1.45,
                    color: C.chalk, flex: 1,
                  }}>
                    {q.question}
                  </p>

                  {/* Right side: action buttons + chevron */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <button
                      className="eq-edit-btn"
                      onClick={e => { e.stopPropagation(); openEdit(idx); }}
                      style={{
                        background: `${C.indigo}18`, border: `1px solid ${C.indigo}44`,
                        borderRadius: 7, padding: '4px 10px',
                        color: C.indigo, fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600, fontSize: 11, cursor: 'pointer',
                      }}
                    >✎</button>
                    <button
                      className="eq-del-btn"
                      onClick={e => { e.stopPropagation(); setDeleteConfirm(idx); }}
                      style={{
                        background: `${C.red}15`, border: `1px solid ${C.red}44`,
                        borderRadius: 7, padding: '4px 8px',
                        color: C.red, fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600, fontSize: 11, cursor: 'pointer',
                      }}
                    >✕</button>
                    {/* Chevron */}
                    <span style={{
                      color: C.muted, fontSize: 12,
                      fontFamily: "'DM Mono', monospace",
                      transform: isOpen ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      display: 'inline-block', marginLeft: 2,
                    }}>▸</span>
                  </div>
                </div>

                {/* ── Expanded content — answers + explanation ── */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.border}` }}>
                    {/* Answer grid 2×2 */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr',
                      gap: 6, padding: '12px 18px',
                    }}>
                      {q.options.map((opt, oi) => (
                        <div key={oi} style={{
                          background: oi === q.correct ? `${C.green}15` : C.light,
                          border: `1px solid ${oi === q.correct ? C.green : C.border}44`,
                          borderRadius: 10, padding: '8px 12px',
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                            background: oi === q.correct ? `${C.green}25` : `${C.indigo}15`,
                            border: `1px solid ${oi === q.correct ? C.green : C.indigo}44`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 700,
                            color: oi === q.correct ? C.green : C.indigo,
                          }}>{LABELS[oi]}</span>
                          <span style={{
                            fontSize: 13, lineHeight: 1.4,
                            color: oi === q.correct ? C.green : C.muted,
                            fontWeight: oi === q.correct ? 600 : 400,
                          }}>{opt}</span>
                        </div>
                      ))}
                    </div>
                    {/* Explanation */}
                    {q.explanation && (
                      <div style={{
                        borderTop: `1px solid ${C.border}`,
                        padding: '10px 18px',
                        display: 'flex', gap: 8,
                      }}>
                        <span style={{
                          fontFamily: "'DM Mono', monospace", fontSize: 10,
                          color: C.indigo, textTransform: 'uppercase',
                          letterSpacing: '0.08em', flexShrink: 0, marginTop: 1,
                        }}>Erkl.</span>
                        <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.5 }}>
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {questions.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 24px',
            background: C.mid, border: `1px solid ${C.border}`, borderRadius: 16,
          }}>
            <p style={{ color: C.muted, fontSize: 15, marginBottom: 16 }}>Alle Fragen gelöscht.</p>
            <button onClick={() => onNavigate('generate')} style={{
              background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`,
              border: 'none', borderRadius: 12, padding: '12px 24px',
              color: 'white', fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>← Neu generieren</button>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      <Modal open={editIdx !== null} onClose={() => setEditIdx(null)} title={`Frage ${editIdx !== null ? editIdx + 1 : ''} bearbeiten`}>
        {editIdx !== null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '70vh', overflowY: 'auto' }}>

            {/* Question text */}
            <div>
              <label style={{ display: 'block', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                Frage
              </label>
              <textarea
                value={editQ}
                onChange={e => setEditQ(e.target.value)}
                style={{
                  width: '100%', background: C.light, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: '10px 12px', color: C.chalk,
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 14,
                  outline: 'none', resize: 'vertical', minHeight: 72, lineHeight: 1.6,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Answer options */}
            <div>
              <label style={{ display: 'block', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>
                Antworten — klicke auf ✓ um die richtige Antwort zu markieren
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {editOpts.map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      className="eq-opt-btn"
                      onClick={() => setEditCorrect(oi)}
                      style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: editCorrect === oi ? `${C.green}25` : `${C.indigo}15`,
                        border: `1.5px solid ${editCorrect === oi ? C.green : `${C.indigo}44`}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700,
                        color: editCorrect === oi ? C.green : C.indigo,
                      }}
                    >{editCorrect === oi ? '✓' : LABELS[oi]}</button>
                    <input
                      value={opt}
                      onChange={e => {
                        const next = [...editOpts];
                        next[oi] = e.target.value;
                        setEditOpts(next);
                      }}
                      style={{
                        flex: 1, background: C.light, border: `1px solid ${editCorrect === oi ? C.green : C.border}`,
                        borderRadius: 8, padding: '8px 12px', color: C.chalk,
                        fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, outline: 'none',
                      }}
                      placeholder={`Antwort ${LABELS[oi]}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label style={{ display: 'block', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                Erklärung
              </label>
              <textarea
                value={editExp}
                onChange={e => setEditExp(e.target.value)}
                style={{
                  width: '100%', background: C.light, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: '10px 12px', color: C.chalk,
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
                  outline: 'none', resize: 'vertical', minHeight: 56, lineHeight: 1.6,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button
                onClick={() => setEditIdx(null)}
                style={{
                  flex: 1, background: 'transparent', border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: '11px', color: C.muted,
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}
              >Abbrechen</button>
              <button
                onClick={saveEdit}
                disabled={!editQ.trim()}
                style={{
                  flex: 1, background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`,
                  border: 'none', borderRadius: 10, padding: '11px',
                  color: 'white', fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  opacity: !editQ.trim() ? 0.5 : 1,
                }}
              >Speichern</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Frage löschen?">
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          Frage {deleteConfirm !== null ? deleteConfirm + 1 : ''} wird unwiderruflich gelöscht.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setDeleteConfirm(null)} style={{
            flex: 1, background: 'transparent', border: `1px solid ${C.border}`,
            borderRadius: 10, padding: '11px', color: C.muted,
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>Abbrechen</button>
          <button onClick={() => deleteQuestion(deleteConfirm)} style={{
            flex: 1, background: C.red, border: 'none',
            borderRadius: 10, padding: '11px', color: 'white',
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>Löschen</button>
        </div>
      </Modal>
    </div>
  );
}

// ─── SCREEN: Quiz Ready (choose mode) ────────────────────────────────────────
function QuizReadyScreen({ questions: questionsProp, opts: optsProp, onNavigate, onStartQuiz, user, showToast }) {
  const stored = JSON.parse(sessionStorage.getItem('quizData') || '{}');
  const questions = (questionsProp && questionsProp.length > 0) ? questionsProp : (stored.questions || []);
  const opts = optsProp || stored.opts;

  const [pin, setPin] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [sharing, setSharing] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showSoloShare, setShowSoloShare] = useState(false); // NEW: solo PIN screen
  const [saveModal, setSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState(opts?.topic || 'Mein Quiz');
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolder, setNewFolder] = useState('');

  useEffect(() => { if (user && supabase) loadFolders(); }, [user]);

  const loadFolders = async () => {
    const { data } = await supabase.from('quiz_folders').select('*').order('name');
    if (data) setFolders(data);
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await fetch('/.netlify/functions/create-quiz-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, opts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPin(data.pin);
      const appUrl = `${window.location.origin}?pin=${data.pin}`;
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}`);
      setShowShare(true);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSharing(false); }
  };

  const handleSave = async () => {
    if (!supabase || !user) return;
    let folderId = selectedFolder || null;
    if (newFolder.trim()) {
      const { data } = await supabase.from('quiz_folders').insert({ name: newFolder.trim(), user_id: user.id }).select().single();
      if (data) folderId = data.id;
    }
    const { error } = await supabase.from('saved_quizzes').insert({ user_id: user.id, folder_id: folderId, title: saveTitle, questions, opts });
    if (error) {
      console.error('Supabase save error:', error);
      const msg = (error.message || error.code || 'Unbekannt');
      showToast('Fehler: ' + msg, 'error');
    } else { showToast('Quiz gespeichert!', 'success'); setSaveModal(false); }
  };

  const modes = [
    {
      id: 'beamer',
      icon: '▣',
      label: 'Gemeinsam am Bildschirm',
      desc: 'Beamer oder Smartboard — alle sehen dieselbe Frage.',
    },
    {
      id: 'solo',
      icon: '◈',
      label: 'Jeder für sich',
      desc: 'Jeder Schüler spielt auf seinem eigenen Gerät.',
    },
  ];

  return (
    <div style={{ ...css.app, minHeight: '100vh' }}>
      <style>{`
        .mode-card { transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease; }
        .mode-card:hover { border-color: ${C.indigo} !important; box-shadow: 0 8px 32px ${C.indigo}22 !important; transform: translateY(-2px); }
        .share-btn { transition: all 0.15s ease; }
        .share-btn:hover { border-color: ${C.indigo}88 !important; color: ${C.chalk} !important; }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 60px' }}>
        {/* Back */}
        <button
          onClick={() => onNavigate('generate')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: C.muted, fontSize: 13, fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.06em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 36,
          }}
        >
          ← Neues Quiz
        </button>

        {/* Quiz summary card */}
        <div style={{
          background: `linear-gradient(135deg, ${C.mid} 0%, ${C.light} 100%)`,
          border: `1px solid ${C.border}`,
          borderRadius: 20, padding: '28px 28px 24px',
          marginBottom: 32,
        }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            letterSpacing: '0.14em', color: C.indigo,
            textTransform: 'uppercase', marginBottom: 8,
          }}>
            Bereit
          </div>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>
            {opts?.topic || 'Quiz generiert'}
          </h2>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>
            {questions.length} Fragen · {opts?.difficulty} · {opts?.level}
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="share-btn"
              onClick={handleShare}
              disabled={sharing}
              style={{
                background: 'transparent',
                border: `1px solid ${C.border}`, borderRadius: 10,
                padding: '9px 18px',
                color: C.muted, fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600, fontSize: 13, cursor: sharing ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              ◈ {sharing ? 'Erstelle PIN…' : 'Per PIN teilen'}
            </button>
            {user && (
              <button
                className="share-btn"
                onClick={() => setSaveModal(true)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: '9px 18px',
                  color: C.muted, fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                ⬡ Speichern
              </button>
            )}
          </div>
        </div>

        {/* Mode selection */}
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          letterSpacing: '0.14em', color: C.muted,
          textTransform: 'uppercase', marginBottom: 16,
        }}>
          Spielmodus wählen
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {modes.map(m => (
            <button
              key={m.id}
              className="mode-card"
              onClick={() => {
                if (m.id === 'solo') {
                  // Generate PIN first, then show sharing screen
                  setSharing(true);
                  fetch('/.netlify/functions/create-quiz-session', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ questions, opts }),
                  })
                  .then(r => r.json())
                  .then(data => {
                    if (!data.pin) throw new Error('Kein PIN erhalten');
                    setPin(data.pin);
                    const appUrl = `${window.location.origin}?pin=${data.pin}`;
                    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(appUrl)}`);
                    setShowSoloShare(true);
                  })
                  .catch(() => {
                    // Fallback: encode quiz directly in URL (no Supabase needed)
                    try {
                      const encoded = btoa(encodeURIComponent(JSON.stringify({ questions, opts })));
                      const appUrl = `${window.location.origin}?quiz=${encoded}`;
                      setPin('——');
                      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(appUrl)}`);
                      setShowSoloShare(true);
                    } catch(e2) {
                      showToast('QR-Code konnte nicht erstellt werden', 'error');
                    }
                  })
                  .finally(() => setSharing(false));
                } else {
                  onStartQuiz(questions, m.id, opts);
                }
              }}
              style={{
                background: C.mid,
                border: `1px solid ${C.border}`,
                borderRadius: 16, padding: '22px 24px',
                cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 20,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: `${C.indigo}18`, border: `1px solid ${C.indigo}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'DM Mono', monospace", fontSize: 22, color: C.indigo,
              }}>
                {m.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: C.chalk }}>{m.label}</div>
                <div style={{ color: C.muted, fontSize: 13 }}>{m.desc}</div>
              </div>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                color: C.muted, fontSize: 18, flexShrink: 0,
              }}>→</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Solo PIN Screen (full page overlay) ── */}
      {showSoloShare && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: C.navy,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          {/* Header */}
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            letterSpacing: '0.16em', color: C.indigo,
            textTransform: 'uppercase', marginBottom: 12,
          }}>
            Schüler beitreten lassen
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>
            Jeder für sich
          </h2>
          <p style={{ color: C.muted, fontSize: 15, marginBottom: 40, textAlign: 'center', maxWidth: 400 }}>
            Schüler scannen den QR-Code oder geben den PIN auf der Startseite ein.
          </p>

          {/* QR Code */}
          {qrUrl && (
            <div style={{
              background: 'white', borderRadius: 20, padding: 16,
              marginBottom: 28, boxShadow: `0 0 0 1px ${C.border}`,
            }}>
              <img src={qrUrl} alt="QR-Code" style={{ width: 200, height: 200, display: 'block' }} />
            </div>
          )}

          {/* PIN */}
          <div style={{
            background: C.mid, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: '20px 40px',
            marginBottom: 12, textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: 11,
              letterSpacing: '0.14em', color: C.muted,
              textTransform: 'uppercase', marginBottom: 8,
            }}>PIN</div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 52, fontWeight: 700,
              color: C.indigo, letterSpacing: 10, lineHeight: 1,
            }}>
              {pin}
            </div>
          </div>

          <p style={{ color: C.muted, fontSize: 13, marginBottom: 36 }}>
            quizblatt.netlify.app · PIN eingeben
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => setShowSoloShare(false)}
              style={{
                background: 'transparent',
                border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '12px 24px', color: C.muted,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              ← Zurück
            </button>
            <button
              onClick={() => {
                setShowSoloShare(false);
                onStartQuiz(questions, 'solo', opts);
              }}
              style={{
                background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`,
                border: 'none', borderRadius: 12,
                padding: '12px 32px', color: 'white',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                minWidth: 200,
              }}
            >
              Quiz starten  →
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <Modal open={showShare} onClose={() => setShowShare(false)} title="Quiz teilen">
        <div style={{ textAlign: 'center' }}>
          {qrUrl && (
            <img src={qrUrl} alt="QR-Code" style={{
              width: 160, height: 160, borderRadius: 12,
              margin: '0 auto 20px', display: 'block',
              border: `1px solid ${C.border}`,
            }} />
          )}
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 44, fontWeight: 700, letterSpacing: 10,
            color: C.indigo, marginBottom: 8,
          }}>
            {pin}
          </div>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
            Schüler geben diesen PIN ein oder scannen den QR-Code.
          </p>
          <button
            onClick={() => setShowShare(false)}
            style={{
              width: '100%', background: C.indigo, border: 'none',
              borderRadius: 12, padding: '13px', color: 'white',
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
              fontSize: 15, cursor: 'pointer',
            }}
          >
            Schließen
          </button>
        </div>
      </Modal>

      {/* Save Modal */}
      <Modal open={saveModal} onClose={() => setSaveModal(false)} title="Quiz speichern">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ ...css.label }}>Titel</label>
            <input style={css.input} value={saveTitle} onChange={e => setSaveTitle(e.target.value)} />
          </div>
          {folders.length > 0 && (
            <div>
              <label style={css.label}>Ordner</label>
              <select style={css.input} value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
                <option value="">Kein Ordner</option>
                {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={css.label}>Neuer Ordner (optional)</label>
            <input style={css.input} placeholder="z. B. Klasse 8a – Biologie" value={newFolder} onChange={e => setNewFolder(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setSaveModal(false)} style={{ ...css.btn('ghost'), flex: 1 }}>Abbrechen</button>
            <button onClick={handleSave} style={{ ...css.btn(), flex: 1 }}>Speichern</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── SCREEN: Quiz Play ────────────────────────────────────────────────────────
function QuizPlayScreen({ questions: questionsProp, mode: modeProp, opts: optsProp, onNavigate, showToast }) {
  const stored = JSON.parse(sessionStorage.getItem('quizPlay') || '{}');
  const questions = (questionsProp && questionsProp.length > 0)
    ? questionsProp
    : (stored.questions && stored.questions.length > 0 ? stored.questions : []);
  const mode = modeProp || stored.mode;
  const opts = optsProp || stored.opts;

  const shuffled = useRef(questions.map(shuffleAnswers));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);
  const [exitModal, setExitModal] = useState(false);

  // Guard — no questions
  if (!questions || questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{
          background: C.mid, border: `1px solid ${C.border}`,
          borderRadius: 20, padding: 40, maxWidth: 440, width: '100%', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠</div>
          <h2 style={{ color: C.chalk, fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Keine Fragen geladen</h2>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Bitte geh zurück und versuche es mit weniger Fragen oder einem Thema als Text.
          </p>
          <button
            onClick={() => onNavigate('generate')}
            style={{
              width: '100%', background: C.indigo, border: 'none',
              borderRadius: 12, padding: '14px', color: 'white',
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
              fontSize: 15, cursor: 'pointer',
            }}
          >
            ← Zurück zur Generierung
          </button>
        </div>
      </div>
    );
  }

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
    if (current + 1 >= total) setDone(true);
    else { setCurrent(c => c + 1); setSelected(null); }
  };

  // ── Results ────────────────────────────────────────────────────────────────
  if (done) {
    const pct = Math.round((score / total) * 100);
    const grade = pct >= 90 ? 'Ausgezeichnet' : pct >= 70 ? 'Gut gemacht' : pct >= 50 ? 'Weiter üben' : 'Nicht aufgeben';
    const scoreColor = pct >= 70 ? C.green : pct >= 50 ? C.amber : C.red;
    return (
      <div style={{ ...css.app, minHeight: '100vh' }}>
        {/* Result hero */}
        <div style={{
          background: `linear-gradient(160deg, ${C.mid} 0%, ${C.light} 100%)`,
          borderBottom: `1px solid ${C.border}`,
          padding: '52px 24px 40px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            letterSpacing: '0.14em', color: C.muted,
            textTransform: 'uppercase', marginBottom: 20,
          }}>
            Ergebnis
          </div>
          {/* Big score */}
          <div style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 4,
            marginBottom: 16,
          }}>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 'clamp(72px, 12vw, 96px)',
              fontWeight: 700, color: scoreColor, lineHeight: 1,
              letterSpacing: '-0.03em',
            }}>{pct}</span>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 'clamp(28px, 5vw, 36px)',
              fontWeight: 700, color: scoreColor,
            }}>%</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: C.chalk }}>
            {grade}
          </h2>
          <p style={{ color: C.muted, fontSize: 15, marginBottom: 24 }}>
            {score} von {total} Fragen richtig
          </p>
          {/* Score bar */}
          <div style={{ maxWidth: 360, margin: '0 auto 32px' }}>
            <div style={{ background: C.light, borderRadius: 100, height: 6, overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: scoreColor,
                borderRadius: 100, transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('home')}
              style={{
                background: 'transparent', border: `1px solid ${C.border}`,
                borderRadius: 12, padding: '12px 24px',
                color: C.muted, fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600, fontSize: 14, cursor: 'pointer', minWidth: 140,
              }}
            >
              Startseite
            </button>
            <button
              onClick={() => {
                setCurrent(0); setSelected(null); setScore(0);
                setResults([]); setDone(false);
                shuffled.current = questions.map(shuffleAnswers);
              }}
              style={{
                background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`,
                border: 'none', borderRadius: 12, padding: '12px 24px',
                color: 'white', fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 14, cursor: 'pointer', minWidth: 140,
              }}
            >
              Wiederholen
            </button>
          </div>
        </div>

        {/* Question review */}
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 60px' }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            letterSpacing: '0.14em', color: C.muted,
            textTransform: 'uppercase', marginBottom: 20,
          }}>
            Fragenübersicht
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((r, i) => (
              <div key={i} style={{
                background: r.correct ? `${C.green}0c` : `${C.red}0c`,
                border: `1px solid ${r.correct ? C.green : C.red}33`,
                borderRadius: 14, padding: '16px 20px',
                display: 'flex', gap: 14, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  background: r.correct ? C.green : C.red,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: 'white',
                }}>
                  {r.correct ? '✓' : '✗'}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, lineHeight: 1.4, color: C.chalk }}>
                    {r.question}
                  </p>
                  <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>
                    {r.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Active Quiz ────────────────────────────────────────────────────────────
  return (
    <div style={{ ...css.app, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @media (max-width: 580px) { .opt-grid { grid-template-columns: 1fr !important; } }
        .opt-btn { transition: border-color 0.18s ease, background 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease; }
        .opt-btn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.012) !important;
          border-color: #5B6EF5 !important;
          background: rgba(91,110,245,0.13) !important;
          box-shadow: 0 8px 28px rgba(91,110,245,0.28) !important;
        }
      `}</style>

      {/* Top bar */}
      <div style={{
        background: C.mid, borderBottom: `1px solid ${C.border}`,
        padding: '0 20px', height: 56,
        display: 'flex', alignItems: 'center', gap: 16,
        position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
      }}>
        <button
          onClick={() => setExitModal(true)}
          style={{
            background: 'transparent', border: `1px solid ${C.border}`,
            borderRadius: 8, width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: C.muted, fontSize: 14, flexShrink: 0,
          }}
        >✕</button>

        {/* Progress */}
        <div style={{ flex: 1 }}>
          <div style={{ background: C.light, borderRadius: 100, height: 4, overflow: 'hidden' }}>
            <div style={{
              width: `${(current / total) * 100}%`, height: '100%',
              background: `linear-gradient(90deg, ${C.indigo}, ${C.purple})`,
              borderRadius: 100, transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 12,
          color: C.muted, flexShrink: 0,
        }}>
          {current + 1} / {total}
        </div>

        <div style={{
          background: `${C.amber}18`, border: `1px solid ${C.amber}44`,
          borderRadius: 100, padding: '4px 12px',
          fontFamily: "'DM Mono', monospace",
          fontSize: 13, color: C.amber, fontWeight: 700, flexShrink: 0,
        }}>
          {score} ★
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, maxWidth: 800, width: '100%',
        margin: '0 auto', padding: '32px 20px 40px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>

        {/* Question */}
        <div style={{
          background: `linear-gradient(135deg, ${C.mid} 0%, ${C.light} 100%)`,
          border: `1px solid ${C.border}`,
          borderRadius: 20, overflow: 'hidden',
        }}>
          {/* Question image */}
          {q.imageUrl && (
            <div style={{
              width: '100%', height: 180, overflow: 'hidden',
              position: 'relative',
            }}>
              <img
                src={q.imageUrl}
                alt=""
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  display: 'block',
                }}
                onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 50%, rgba(26,37,64,0.6) 100%)',
              }} />
            </div>
          )}
          <div style={{ padding: '20px 24px 20px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              fontFamily: "'DM Mono', monospace",
              fontSize: 11, color: C.indigo,
              background: `${C.indigo}18`, border: `1px solid ${C.indigo}30`,
              borderRadius: 100, padding: '4px 14px',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: 14,
            }}>
              Frage {current + 1}
            </div>
            <p style={{
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              fontWeight: 700, lineHeight: 1.45, color: C.chalk,
            }}>
              {q.question}
            </p>
          </div>
        </div>

        {/* Answer grid 2×2 */}
        <div className="opt-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {q.shuffledOptions.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect  = i === q.shuffledCorrect;
            const showResult = selected !== null;

            let bg     = C.mid;
            let border = C.border;

            if (showResult) {
              if (isCorrect)               { bg = `${C.green}18`; border = C.green; }
              else if (isSelected)         { bg = `${C.red}18`;   border = C.red; }
              else                         { bg = C.mid; border = `${C.border}88`; }
            } else if (isSelected) {
              bg = `${C.indigo}18`; border = C.indigo;
            }

            return (
              <button
                key={i}
                className="opt-btn"
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                style={{
                  background: bg,
                  border: `1.5px solid ${border}`,
                  borderRadius: 14, padding: '18px 18px',
                  cursor: selected !== null ? 'default' : 'pointer',
                  textAlign: 'left', color: C.chalk,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 500, minHeight: 86,
                  display: 'flex', alignItems: 'center', gap: 14,
                  opacity: (showResult && !isCorrect && !isSelected) ? 0.45 : 1,
                }}
              >
                {/* Label badge */}
                <span style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: showResult && isCorrect ? `${C.green}30`
                            : showResult && isSelected ? `${C.red}30`
                            : `${C.indigo}20`,
                  border: `1px solid ${
                    showResult && isCorrect ? C.green
                    : showResult && isSelected ? C.red
                    : `${C.indigo}44`}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 700, fontSize: 13,
                  color: showResult && isCorrect ? C.green
                       : showResult && isSelected ? C.red
                       : C.indigo,
                }}>
                  {LABELS[i]}
                </span>

                <span style={{ fontSize: 'clamp(13px, 1.8vw, 15px)', lineHeight: 1.4, flex: 1 }}>
                  {opt.text}
                </span>

                {showResult && isCorrect && (
                  <span style={{ color: C.green, fontSize: 18, flexShrink: 0 }}>✓</span>
                )}
                {showResult && isSelected && !isCorrect && (
                  <span style={{ color: C.red, fontSize: 18, flexShrink: 0 }}>✗</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {selected !== null && (
          <div style={{
            background: `${C.indigo}10`,
            border: `1px solid ${C.indigo}30`,
            borderRadius: 14, padding: '18px 20px',
          }}>
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10,
              letterSpacing: '0.14em', color: C.indigo,
              textTransform: 'uppercase', marginBottom: 8,
            }}>
              Erklärung
            </div>
            <p style={{ color: C.chalk, fontSize: 15, lineHeight: 1.6 }}>
              {q.explanation}
            </p>
          </div>
        )}

        {/* Next button */}
        {selected !== null && (
          <button
            onClick={handleNext}
            style={{
              width: '100%', padding: '16px', border: 'none', borderRadius: 14,
              background: current + 1 >= total
                ? `linear-gradient(135deg, ${C.amber} 0%, #FF9500 100%)`
                : `linear-gradient(135deg, ${C.indigo} 0%, ${C.purple} 100%)`,
              color: 'white',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: 16, cursor: 'pointer',
            }}
          >
            {current + 1 >= total ? '✦  Ergebnis anzeigen' : 'Nächste Frage  →'}
          </button>
        )}
      </div>

      {/* Exit Modal */}
      <Modal open={exitModal} onClose={() => setExitModal(false)} title="Quiz verlassen?">
        <p style={{ color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
          Dein Fortschritt geht verloren.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setExitModal(false)} style={{ ...css.btn('ghost'), flex: 1 }}>Weitermachen</button>
          <button onClick={() => onNavigate('home')} style={{ ...css.btn('danger'), flex: 1 }}>Verlassen</button>
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
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { if (user && supabase) loadMyQuizzes(); }, [user]);

  const loadMyQuizzes = async () => {
    const [{ data: qData }, { data: fData }] = await Promise.all([
      supabase.from('saved_quizzes').select('*').order('created_at', { ascending: false }),
      supabase.from('quiz_folders').select('*').order('name'),
    ]);
    if (qData) setQuizzes(qData);
    if (fData) setFolders(fData);
  };

  const handleAuth = async () => {
    if (!supabase) { setError('Supabase ist nicht konfiguriert.'); return; }
    if (mode === 'register') {
      if (password.length < 6) { setError('Das Passwort muss mindestens 6 Zeichen lang sein.'); return; }
      if (password !== confirm) { setError('Die Passwörter stimmen nicht überein.'); return; }
    }
    setLoading(true); setError('');
    try {
      const result = mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;
      setUser(result.data.user);
      showToast(mode === 'login' ? 'Angemeldet!' : 'Konto erstellt!', 'success');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    setUser(null);
  };

  const handleDelete = async (id) => {
    if (!supabase) return;
    setDeleting(id);
    const { error } = await supabase.from('saved_quizzes').delete().eq('id', id);
    if (error) showToast('Fehler beim Löschen', 'error');
    else {
      setQuizzes(q => q.filter(x => x.id !== id));
      showToast('Quiz gelöscht', 'success');
    }
    setDeleting(null);
  };

  // ── Login / Register ────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div style={{ ...css.app, minHeight: '100vh' }}>
        <style>{`
          .auth-input:focus { border-color: ${C.indigo} !important; }
          .auth-btn-primary { transition: opacity 0.15s, transform 0.15s; }
          .auth-btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        `}</style>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 24px 60px' }}>
          <button
            onClick={() => onNavigate('home')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.muted, fontSize: 13, fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.06em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 40,
            }}
          >← Startseite</button>

          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            letterSpacing: '0.16em', color: C.indigo,
            textTransform: 'uppercase', marginBottom: 10,
          }}>
            {mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>
            {mode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}
          </h1>
          <p style={{ color: C.muted, fontSize: 15, marginBottom: 36 }}>
            {mode === 'login'
              ? 'Meld dich an, um deine gespeicherten Quizze zu sehen.'
              : 'Erstelle ein kostenloses Konto und speichere deine Quizze.'}
          </p>

          <div style={{
            background: C.mid, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: 24,
          }}>
            <label style={{
              display: 'block', fontFamily: "'DM Mono', monospace",
              fontSize: 11, letterSpacing: '0.12em', color: C.muted,
              textTransform: 'uppercase', marginBottom: 8,
            }}>E-Mail</label>
            <input
              className="auth-input"
              type="email"
              style={{
                ...css.input, marginBottom: 16,
                transition: 'border-color 0.15s',
              }}
              placeholder="name@schule.de"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
            />

            <label style={{
              display: 'block', fontFamily: "'DM Mono', monospace",
              fontSize: 11, letterSpacing: '0.12em', color: C.muted,
              textTransform: 'uppercase', marginBottom: 8,
            }}>Passwort</label>
            <input
              className="auth-input"
              type="password"
              style={{
                ...css.input,
                marginBottom: mode === 'register' ? 16 : (error ? 10 : 24),
                transition: 'border-color 0.15s',
              }}
              placeholder="Mindestens 6 Zeichen"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
            />

            {mode === 'register' && (
              <>
                <label style={{
                  display: 'block', fontFamily: "'DM Mono', monospace",
                  fontSize: 11, letterSpacing: '0.12em', color: C.muted,
                  textTransform: 'uppercase', marginBottom: 8,
                }}>Passwort bestätigen</label>
                <input
                  className="auth-input"
                  type="password"
                  style={{
                    ...css.input,
                    marginBottom: error ? 10 : 24,
                    transition: 'border-color 0.15s',
                    borderColor: confirm && confirm !== password ? C.red : C.border,
                  }}
                  placeholder="Passwort wiederholen"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleAuth()}
                />
              </>
            )}

            {error && (
              <div style={{
                background: `${C.red}12`, border: `1px solid ${C.red}44`,
                borderRadius: 10, padding: '10px 14px',
                color: C.red, fontSize: 13, marginBottom: 16,
              }}>{error}</div>
            )}

            <button
              className="auth-btn-primary"
              onClick={handleAuth}
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? C.light : `linear-gradient(135deg, ${C.indigo}, ${C.purple})`,
                border: 'none', borderRadius: 12,
                color: loading ? C.muted : 'white',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: 12,
              }}
            >
              {loading ? 'Bitte warten…' : (mode === 'login' ? 'Anmelden' : 'Konto erstellen')}
            </button>

            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setConfirm(''); setPassword(''); }}
              style={{
                width: '100%', padding: '12px',
                background: 'transparent', border: `1px solid ${C.border}`,
                borderRadius: 12, color: C.muted,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              {mode === 'login' ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Anmelden'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Logged-in Dashboard ─────────────────────────────────────────────────────
  const filteredQuizzes = selectedFolder
    ? quizzes.filter(q => q.folder_id === selectedFolder)
    : quizzes;

  return (
    <div style={{ ...css.app, minHeight: '100vh' }}>
      <style>{`
        .quiz-card { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
        .quiz-card:hover { border-color: ${C.indigo}66 !important; box-shadow: 0 4px 20px ${C.indigo}18 !important; }
        .del-btn { transition: opacity 0.15s, color 0.15s; opacity: 0; }
        .quiz-card:hover .del-btn { opacity: 1 !important; }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* Top nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <button
            onClick={() => onNavigate('home')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.muted, fontSize: 13, fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.06em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 6, padding: 0,
            }}
          >← Startseite</button>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent', border: `1px solid ${C.border}`,
              borderRadius: 10, padding: '8px 16px',
              color: C.muted, fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            Abmelden
          </button>
        </div>

        {/* Profile + CTA */}
        <div style={{
          background: `linear-gradient(135deg, ${C.mid} 0%, ${C.light} 100%)`,
          border: `1px solid ${C.border}`,
          borderRadius: 20, padding: '28px 28px 24px',
          marginBottom: 32,
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}>
          {/* Avatar */}
          <div style={{
            width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
            background: `${C.indigo}28`, border: `2px solid ${C.indigo}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'DM Mono', monospace",
            fontSize: 22, fontWeight: 700, color: C.indigo,
          }}>
            {user.email[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: 11,
              letterSpacing: '0.12em', color: C.muted,
              textTransform: 'uppercase', marginBottom: 4,
            }}>Angemeldet als</div>
            <div style={{
              fontWeight: 700, fontSize: 16,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.email}
            </div>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>
              {quizzes.length} {quizzes.length === 1 ? 'Quiz' : 'Quizze'} gespeichert
            </div>
          </div>

          {/* New quiz CTA */}
          <button
            onClick={() => onNavigate('generate')}
            style={{
              background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`,
              border: 'none', borderRadius: 12,
              padding: '12px 22px', color: 'white',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            ✦ Neues Quiz
          </button>
        </div>

        {/* Folder filter */}
        {folders.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            <button
              onClick={() => setSelectedFolder(null)}
              style={{
                padding: '6px 16px', borderRadius: 100,
                border: `1px solid ${!selectedFolder ? C.indigo : C.border}`,
                background: !selectedFolder ? `${C.indigo}18` : 'transparent',
                color: !selectedFolder ? C.indigo : C.muted,
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >Alle</button>
            {folders.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFolder(f.id)}
                style={{
                  padding: '6px 16px', borderRadius: 100,
                  border: `1px solid ${selectedFolder === f.id ? C.indigo : C.border}`,
                  background: selectedFolder === f.id ? `${C.indigo}18` : 'transparent',
                  color: selectedFolder === f.id ? C.indigo : C.muted,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >⬡ {f.name}</button>
            ))}
          </div>
        )}

        {/* Section label */}
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          letterSpacing: '0.14em', color: C.muted,
          textTransform: 'uppercase', marginBottom: 16,
        }}>
          Meine Quizze
        </div>

        {/* Empty state */}
        {filteredQuizzes.length === 0 ? (
          <div style={{
            background: C.mid, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: '52px 32px',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 36, color: `${C.muted}55`, marginBottom: 16,
            }}>✦</div>
            <p style={{ color: C.chalk, fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
              Noch keine Quizze gespeichert
            </p>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>
              Generiere dein erstes Quiz und speichere es hier.
            </p>
            <button
              onClick={() => onNavigate('generate')}
              style={{
                background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`,
                border: 'none', borderRadius: 12,
                padding: '12px 28px', color: 'white',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              ✦ Erstes Quiz erstellen
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredQuizzes.map(q => (
              <div
                key={q.id}
                className="quiz-card"
                style={{
                  background: C.mid,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: '18px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                  cursor: 'pointer', position: 'relative',
                }}
                onClick={() => onNavigate('ready', { questions: q.questions, opts: q.opts })}
              >
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `${C.indigo}18`, border: `1px solid ${C.indigo}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'DM Mono', monospace", fontSize: 18, color: C.indigo,
                }}>✦</div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700, fontSize: 15, marginBottom: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: C.chalk,
                  }}>
                    {q.title}
                  </div>
                  <div style={{ color: C.muted, fontSize: 13 }}>
                    {q.questions?.length} Fragen
                    {q.opts?.difficulty ? ` · ${q.opts.difficulty}` : ''}
                    {q.opts?.level ? ` · ${q.opts.level}` : ''}
                    {' · '}{new Date(q.created_at).toLocaleDateString('de-DE')}
                  </div>
                </div>

                {/* Arrow */}
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  color: C.muted, fontSize: 16, flexShrink: 0,
                }}>→</div>

                {/* Delete button */}
                <button
                  className="del-btn"
                  onClick={e => { e.stopPropagation(); handleDelete(q.id); }}
                  disabled={deleting === q.id}
                  style={{
                    position: 'absolute', top: 12, right: 48,
                    background: `${C.red}18`, border: `1px solid ${C.red}44`,
                    borderRadius: 8, padding: '4px 10px',
                    color: C.red, fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {deleting === q.id ? '…' : 'Löschen'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SCREEN: Impressum ────────────────────────────────────────────────────────
function ImpressumScreen({ onNavigate }) {
  const linkStyle = {
    color: C.indigo, textDecoration: 'none', fontWeight: 600,
  };
  const h2Style = {
    fontSize: 15, fontWeight: 700, color: C.chalk,
    marginTop: 28, marginBottom: 8,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.08em', textTransform: 'uppercase',
  };
  const pStyle = { color: C.muted, fontSize: 14, lineHeight: 1.8, marginBottom: 4 };

  return (
    <div style={{ ...css.app, minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 24px 80px' }}>
        <button onClick={() => onNavigate('home')} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: C.muted,
          fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em',
          textTransform: 'uppercase', padding: 0, marginBottom: 36,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>← Startseite</button>

        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: C.indigo, textTransform: 'uppercase', marginBottom: 10 }}>
          Rechtliches
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.02em' }}>Impressum</h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
          Angaben gemäß § 5 TMG
        </p>

        <div style={{ background: C.mid, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 28px' }}>
          <div style={h2Style}>Verantwortlich</div>
          <p style={pStyle}>Tim Stahlberg</p>
          <p style={pStyle}>Am Landgraben 2</p>
          <p style={pStyle}>76532 Baden-Baden</p>

          <div style={h2Style}>Kontakt</div>
          <p style={pStyle}>
            E-Mail: <a href="mailto:tim.stahlberg@outlook.de" style={linkStyle}>tim.stahlberg@outlook.de</a>
          </p>

          <div style={h2Style}>Urheberrecht</div>
          <p style={pStyle}>
            © {new Date().getFullYear()} Tim Stahlberg. Alle Rechte vorbehalten.
          </p>
          <p style={pStyle}>
            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>

          <div style={h2Style}>Haftungsausschluss</div>
          <p style={pStyle}>
            Die durch diese App generierten Quizinhalte werden mithilfe von KI-Technologie (Anthropic Claude) erstellt. Für die inhaltliche Richtigkeit der generierten Fragen und Antworten wird keine Gewähr übernommen. Die Inhalte sollten vor dem Einsatz im Unterricht auf Korrektheit geprüft werden.
          </p>

          <div style={h2Style}>Externe Dienste</div>
          <p style={pStyle}>
            Diese App nutzt folgende externe Dienste: Anthropic Claude API (KI-Generierung), Supabase (Datenbank & Authentifizierung), Netlify (Hosting).
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: Datenschutz ───────────────────────────────────────────────────────
function DatenschutzScreen({ onNavigate }) {
  const h2Style = {
    fontSize: 15, fontWeight: 700, color: C.chalk,
    marginTop: 28, marginBottom: 8,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.08em', textTransform: 'uppercase',
  };
  const pStyle = { color: C.muted, fontSize: 14, lineHeight: 1.8, marginBottom: 8 };
  const linkStyle = { color: C.indigo, textDecoration: 'none', fontWeight: 600 };

  return (
    <div style={{ ...css.app, minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 24px 80px' }}>
        <button onClick={() => onNavigate('home')} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: C.muted,
          fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em',
          textTransform: 'uppercase', padding: 0, marginBottom: 36,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>← Startseite</button>

        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: C.indigo, textTransform: 'uppercase', marginBottom: 10 }}>
          Rechtliches
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.02em' }}>Datenschutzerklärung</h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
          Stand: {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </p>

        <div style={{ background: C.mid, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 28px' }}>

          <div style={h2Style}>Verantwortlicher</div>
          <p style={pStyle}>
            Tim Stahlberg, Am Landgraben 2, 76532 Baden-Baden<br/>
            E-Mail: <a href="mailto:tim.stahlberg@outlook.de" style={linkStyle}>tim.stahlberg@outlook.de</a>
          </p>

          <div style={h2Style}>Welche Daten werden erfasst?</div>
          <p style={pStyle}>
            <strong style={{ color: C.chalk }}>Bei Nutzung ohne Konto:</strong> Es werden keine personenbezogenen Daten gespeichert. Eingegebene Texte, hochgeladene PDFs und Fotos werden ausschließlich zur KI-Generierung an die Anthropic Claude API übermittelt und nicht dauerhaft gespeichert.
          </p>
          <p style={pStyle}>
            <strong style={{ color: C.chalk }}>Bei Registrierung mit Konto:</strong> Es wird lediglich die E-Mail-Adresse sowie ein verschlüsseltes Passwort gespeichert. Zusätzlich werden die vom Nutzer gespeicherten Quizze in der Datenbank abgelegt.
          </p>

          <div style={h2Style}>Zweck der Datenverarbeitung</div>
          <p style={pStyle}>
            Die E-Mail-Adresse dient ausschließlich der Authentifizierung (Anmeldung) und der Zuordnung gespeicherter Quizze zum jeweiligen Nutzerkonto. Eine Nutzung für Werbezwecke oder eine Weitergabe an Dritte findet nicht statt.
          </p>

          <div style={h2Style}>Externe Dienste & Datenübermittlung</div>
          <p style={pStyle}>
            <strong style={{ color: C.chalk }}>Anthropic Claude API:</strong> Eingegebene Texte, Themen sowie hochgeladene PDFs und Bilder werden zur Fragengeneration an Anthropic (USA) übermittelt. Anthropic verarbeitet diese Daten gemäß ihrer{' '}
            <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>Datenschutzrichtlinie</a>.
          </p>
          <p style={pStyle}>
            <strong style={{ color: C.chalk }}>Supabase:</strong> Nutzerkonten und gespeicherte Quizze werden bei Supabase Inc. (USA) gespeichert. Die Datenübertragung erfolgt verschlüsselt (TLS). Weitere Informationen:{' '}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>supabase.com/privacy</a>.
          </p>
          <p style={pStyle}>
            <strong style={{ color: C.chalk }}>Netlify:</strong> Das Hosting der App erfolgt über Netlify Inc. (USA). Beim Aufruf der Website werden technisch notwendige Zugriffsdaten (IP-Adresse, Zeitstempel) in Server-Logs gespeichert. Weitere Informationen:{' '}
            <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer" style={linkStyle}>netlify.com/privacy</a>.
          </p>

          <div style={h2Style}>Speicherdauer</div>
          <p style={pStyle}>
            Nutzerdaten (E-Mail, gespeicherte Quizze) werden so lange gespeichert, wie das Konto aktiv ist. Eine Löschung des Kontos kann jederzeit durch Kontaktaufnahme per E-Mail beantragt werden.
          </p>

          <div style={h2Style}>Ihre Rechte</div>
          <p style={pStyle}>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten (Art. 15–18 DSGVO) sowie ein Widerspruchsrecht (Art. 21 DSGVO). Wenden Sie sich dazu an:{' '}
            <a href="mailto:tim.stahlberg@outlook.de" style={linkStyle}>tim.stahlberg@outlook.de</a>.
          </p>
          <p style={pStyle}>
            Sie haben zudem das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren. Die zuständige Behörde in Baden-Württemberg ist der Landesbeauftragte für den Datenschutz und die Informationsfreiheit (LfDI Baden-Württemberg).
          </p>

          <div style={h2Style}>Cookies & Tracking</div>
          <p style={pStyle}>
            Diese App verwendet keine Tracking-Cookies und kein Web-Analyse-Tool. Es werden lediglich technisch notwendige Daten im Browser-Speicher (sessionStorage) abgelegt, die beim Schließen des Tabs automatisch gelöscht werden.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('home');
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const quizRef = useRef({ questions: [], mode: null, opts: null });
  // Separate state for play data so React re-renders with correct data
  const [playData, setPlayData] = useState(null);

  const goPlay = (questions, mode, opts) => {
    const data = { questions, mode, opts };
    sessionStorage.setItem('quizPlay', JSON.stringify(data));
    quizRef.current = data;
    setPlayData(data);
    setScreen('play');
  };

  useEffect(() => {
    // Check for URL parameters — load quiz directly, bypass join screen
    const params = new URLSearchParams(window.location.search);
    const urlPin = params.get('pin');
    const urlQuiz = params.get('quiz');

    if (urlQuiz) {
      // Fallback: quiz encoded directly in URL
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(urlQuiz)));
        if (decoded.questions && decoded.questions.length > 0) {
          const pd = { questions: decoded.questions, mode: 'solo', opts: decoded.opts };
          sessionStorage.setItem('quizPlay', JSON.stringify(pd));
          quizRef.current = pd;
          setPlayData(pd);
          setScreen('play');
        }
      } catch(e) { /* invalid encoded data, stay on home */ }
    } else if (urlPin && /^\d{6}$/.test(urlPin)) {
      fetch(`/.netlify/functions/get-quiz-session?pin=${urlPin}`)
        .then(r => r.json())
        .then(data => {
          if (data.questions && data.questions.length > 0) {
            const pd = { questions: data.questions, mode: 'solo', opts: data.opts };
            sessionStorage.setItem('quizPlay', JSON.stringify(pd));
            quizRef.current = pd;
            setPlayData(pd);
            setScreen('play');
          } else {
            setScreen('join');
          }
        })
        .catch(() => setScreen('join'));
    }

    // Auth listener — always runs
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
    const stored = JSON.parse(sessionStorage.getItem('quizData') || '{}');
    const safeQ = (questions && questions.length > 0)
      ? questions
      : (stored.questions && stored.questions.length > 0 ? stored.questions : []);
    const safeOpts = (opts && Object.keys(opts).length > 0) ? opts : stored.opts;
    goPlay(safeQ, mode, safeOpts);
  };

  const onQuizReady = (questions, opts) => {
    const data = { questions: questions || [], opts };
    sessionStorage.setItem('quizData', JSON.stringify(data));
    quizRef.current = { questions: questions || [], mode: null, opts };
    setScreen('editor'); // Go to editor first
  };

  const onEditorDone = (editedQuestions) => {
    const opts = quizRef.current.opts;
    const data = { questions: editedQuestions, opts };
    sessionStorage.setItem('quizData', JSON.stringify(data));
    quizRef.current = { questions: editedQuestions, mode: null, opts };
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
      case 'editor':
        return (
          <QuizEditorScreen
            questions={quizRef.current.questions}
            opts={quizRef.current.opts}
            onNavigate={navigate}
            onDone={onEditorDone}
          />
        );
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
      case 'play': {
        const pq = (playData && playData.questions && playData.questions.length > 0)
          ? playData.questions
          : questions;
        const pm = (playData && playData.mode) ? playData.mode : mode;
        const po = (playData && playData.opts) ? playData.opts : opts;
        return (
          <QuizPlayScreen
            questions={pq}
            mode={pm}
            opts={po}
            onNavigate={navigate}
            showToast={showToast}
          />
        );
      }
      case 'account':
        return (
          <AccountScreen
            onNavigate={navigate}
            user={user}
            setUser={setUser}
            showToast={showToast}
          />
        );
      case 'impressum':
        return <ImpressumScreen onNavigate={navigate} />;
      case 'datenschutz':
        return <DatenschutzScreen onNavigate={navigate} />;
      default:
        return <HomeScreen onNavigate={navigate} user={user} />;
    }
  };

  return (
    <>
      {renderScreen()}
      {/* Persistent account button — shown on all screens when logged in, except on account screen itself */}
      {screen !== 'account' && screen !== 'play' && (
        <UserBar user={user} onNavigate={navigate} />
      )}
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
