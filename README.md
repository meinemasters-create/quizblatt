# Quizblatt Generator

KI-gestützter Quiz-Generator für Schulen – powered by Claude AI.

## Setup in 5 Schritten

### 1. GitHub Repository
- Neues Repository anlegen (leer, ohne README)
- Alle Dateien hochladen (empfohlen: GitHub Desktop)
- **Kein ZIP-Upload!**

### 2. Netlify
- „Import an existing project" → GitHub → Repository wählen
- Build-Einstellungen werden automatisch aus `netlify.toml` gelesen

### 3. Umgebungsvariablen in Netlify eintragen
```
ANTHROPIC_API_KEY        → console.anthropic.com
SUPABASE_URL             → Supabase → Settings → API → Project URL
SUPABASE_SERVICE_ROLE_KEY → Supabase → Settings → API → service_role key
VITE_SUPABASE_URL        → Supabase → Settings → API → Project URL
VITE_SUPABASE_ANON_KEY   → Supabase → Settings → API → anon key
```

### 4. Supabase
- Neues Projekt erstellen
- In SQL-Editor: Inhalt von `supabase-schema.sql` ausführen
- Authentication → Email → **„Enable email confirmations" deaktivieren**

### 5. Deployen
- Netlify → „Clear cache and deploy site"
- iPad: Safari → URL öffnen → „Zum Home-Bildschirm hinzufügen"

## Projektstruktur

```
├── netlify.toml              ← Build & Function-Konfiguration
├── vite.config.js
├── package.json
├── index.html                ← Google Fonts, Meta-Tags
├── supabase-schema.sql       ← SQL einmalig in Supabase ausführen
├── src/
│   ├── App.jsx               ← Gesamte App (eine Datei)
│   └── main.jsx
├── public/
│   ├── manifest.json         ← PWA-Manifest
│   ├── icon-192.png
│   └── icon-512.png
└── netlify/
    └── functions/
        ├── generate-quiz.js        ← Claude API (serverseitig)
        ├── create-quiz-session.js  ← PIN speichern
        └── get-quiz-session.js     ← PIN laden
```

## Features

- ✨ KI-Generierung aus PDF, Foto oder Thema
- 🎮 Kahoot-Stil Spielmodus mit Erklärungen
- 🔗 PIN/QR-Code Teilen für Mehrgeräte-Betrieb
- 💾 Quizze speichern mit Ordner-System (Supabase Auth)
- 📱 iPad-optimiert, PWA-installierbar
- 🌙 Dunkles Navy-Design

## Bekannte Hinweise

- Kamera (`capture="environment"`) funktioniert nur über HTTPS (Netlify, nicht localhost)
- QR-Code verwendet `https://api.qrserver.com` (Mixed-Content-sicher)
- Nach Code-Änderungen: immer „Clear cache and deploy site" in Netlify
