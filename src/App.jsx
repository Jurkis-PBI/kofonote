import { useState, useCallback } from 'react';
import ExportButtons from './components/ExportButtons';
import { summarizeTranscript } from './lib/summarize';

export default function App() {
  const [appState, setAppState] = useState('idle');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [apiSaved, setApiSaved] = useState(() => !!localStorage.getItem('groq_api_key'));
  const [statusText, setStatusText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);

  const saveApiKey = (val) => {
    localStorage.setItem('groq_api_key', val.trim());
    setApiKey(val.trim());
    setApiSaved(true);
  };

  const handleFile = useCallback(async (file) => {
    if (!apiKey) { setError('Zadej Groq API klíč před nahráním souboru.'); return; }
    setError(''); setTranscript(''); setSummary('');
    setAppState('transcribing');
    setStatusText('Nahrávám audio na Groq...');
    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('model', 'whisper-large-v3-turbo');
      formData.append('language', 'cs');
      formData.append('response_format', 'text');
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'Chyba Groq Whisper API');
      }
      const text = await response.text();
      setTranscript(text.trim());
      setAppState('done');
    } catch (err) {
      setError(`Chyba při přepisu: ${err.message}`);
      setAppState('idle');
    }
  }, [apiKey]);

  const handleSummarize = async () => {
    if (!apiKey || !transcript) return;
    setError(''); setAppState('summarizing');
    try {
      const result = await summarizeTranscript(transcript, apiKey);
      setSummary(result); setAppState('done');
    } catch (err) {
      setError(err.message); setAppState('done');
    }
  };

  const handleReset = () => {
    setAppState('idle'); setTranscript(''); setSummary(''); setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const isLoading = appState === 'transcribing';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0e0e10;
          --surface: #161618;
          --surface2: #1c1c1f;
          --border: rgba(255,255,255,0.07);
          --border-hover: rgba(255,255,255,0.13);
          --text: #f0f0f2;
          --text-2: rgba(240,240,242,0.55);
          --text-3: rgba(240,240,242,0.28);
          --accent: #FF6363;
          --accent2: #FF8C42;
          --radius: 14px;
          --radius-sm: 10px;
        }

        body {
          font-family: 'Inter', -apple-system, sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        /* subtle noise texture */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          background-size: 180px;
          pointer-events: none;
          z-index: 0;
          opacity: 0.4;
        }

        .page {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* NAV */
        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(14,14,16,0.85);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .nav-icon {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }

        .nav-name {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--text);
        }

        .nav-pill {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-3);
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 3px 10px;
          letter-spacing: 0.02em;
        }

        /* MAIN */
        main {
          flex: 1;
          max-width: 580px;
          width: 100%;
          margin: 0 auto;
          padding: 48px 20px 80px;
        }

        /* HERO */
        .hero {
          margin-bottom: 40px;
        }

        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-3);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .hero-tag::before {
          content: '';
          width: 16px; height: 1px;
          background: linear-gradient(90deg, var(--accent), transparent);
        }

        h1 {
          font-size: clamp(28px, 5vw, 38px);
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 12px;
        }

        .accent-word {
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 14px;
          font-weight: 400;
          color: var(--text-3);
          line-height: 1.6;
        }

        /* SECTION */
        .section {
          margin-bottom: 12px;
        }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-3);
          margin-bottom: 8px;
          padding: 0 2px;
        }

        /* CARD */
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          transition: border-color 0.15s;
        }

        .card:hover { border-color: var(--border-hover); }

        /* API INPUT */
        .api-row { display: flex; gap: 8px; }

        .api-in {
          flex: 1;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          color: var(--text);
          outline: none;
          transition: border-color 0.15s;
        }

        .api-in::placeholder { color: var(--text-3); }
        .api-in:focus { border-color: rgba(255,99,99,0.4); }

        .btn-save {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 10px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-2);
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
          white-space: nowrap;
        }

        .btn-save:hover { border-color: var(--border-hover); color: var(--text); }
        .btn-save.saved { color: #4ade80; border-color: rgba(74,222,128,0.2); }

        .api-hint {
          font-size: 11.5px;
          color: var(--text-3);
          margin-top: 8px;
          padding: 0 2px;
        }

        /* DROPZONE */
        .dropzone {
          border: 1px dashed rgba(255,255,255,0.1);
          border-radius: var(--radius-sm);
          padding: 36px 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }

        .dropzone:hover, .dropzone.drag {
          border-color: rgba(255,99,99,0.35);
          background: rgba(255,99,99,0.03);
        }

        .drop-icon {
          font-size: 28px;
          margin-bottom: 12px;
          display: block;
          opacity: 0.7;
        }

        .drop-title {
          font-size: 15px;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 5px;
        }

        .drop-sub {
          font-size: 13px;
          color: var(--text-3);
          margin-bottom: 18px;
        }

        .btn-pick {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border: none;
          border-radius: 100px;
          padding: 10px 22px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
        }

        .btn-pick:hover { opacity: 0.88; transform: translateY(-1px); }

        .drop-fmts {
          font-size: 11.5px;
          color: var(--text-3);
          margin-top: 12px;
          letter-spacing: 0.02em;
        }

        /* INFO */
        .info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(255,99,99,0.05);
          border: 1px solid rgba(255,99,99,0.12);
          border-radius: var(--radius-sm);
          font-size: 12.5px;
          color: var(--text-3);
          margin-top: 12px;
        }

        .info-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
          box-shadow: 0 0 8px var(--accent);
        }

        /* PROGRESS */
        .prog-wrap {
          text-align: center;
          padding: 40px 20px;
        }

        .spin-ring {
          width: 40px; height: 40px;
          border: 2px solid rgba(255,99,99,0.15);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .prog-label {
          font-size: 15px;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 5px;
        }

        .prog-hint {
          font-size: 12.5px;
          color: var(--text-3);
        }

        /* TRANSCRIPT */
        .tbox {
          width: 100%;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 14px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          line-height: 1.75;
          color: var(--text-2);
          resize: vertical;
          outline: none;
          min-height: 110px;
          transition: border-color 0.15s;
        }

        .tbox:focus { border-color: rgba(255,99,99,0.3); }

        /* SUMMARY */
        .smd {
          font-size: 13.5px;
          line-height: 1.75;
          color: var(--text-2);
        }

        .smd h2 {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 16px 0 8px;
          letter-spacing: -0.01em;
        }

        .smd h2:first-child { margin-top: 0; }
        .smd ul { padding-left: 16px; }
        .smd li { margin-bottom: 4px; color: var(--text-2); }

        /* ACTIONS */
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .btn-main {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border: none;
          border-radius: 100px;
          padding: 10px 20px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
        }

        .btn-main:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .btn-main:disabled { opacity: 0.3; cursor: not-allowed; }

        .sep { width: 1px; height: 20px; background: var(--border); margin: 0 4px; }

        .btn-ghost {
          background: none;
          border: none;
          font-family: 'Inter', sans-serif;
          font-size: 12.5px;
          color: var(--text-3);
          cursor: pointer;
          transition: color 0.15s;
          padding: 4px 0;
          margin-top: 14px;
          display: block;
          text-decoration: none;
        }

        .btn-ghost:hover { color: var(--text-2); }

        .btn-ghost::before { content: '← '; }

        /* ERROR */
        .err {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(255,82,82,0.06);
          border: 1px solid rgba(255,82,82,0.18);
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          font-size: 13px;
          color: rgba(255,130,130,0.9);
          margin-bottom: 12px;
        }

        /* DIVIDER */
        .div { border: none; border-top: 1px solid var(--border); margin: 16px 0; }

        /* RESPONSIVE */
        @media (max-width: 480px) {
          nav { padding: 14px 16px; }
          main { padding: 32px 16px 60px; }
          h1 { font-size: 26px; }
          .card { padding: 16px; }
          .dropzone { padding: 28px 16px; }
          .actions { gap: 6px; }
          .btn-main, .btn-pick { padding: 10px 18px; font-size: 13px; }
        }
      `}</style>

      <div className="page">
        {/* Nav */}
        <nav>
          <div className="nav-logo">
            <div className="nav-icon">🎵</div>
            <span className="nav-name">KofoNote</span>
          </div>
          <span className="nav-pill">Kofola a.s. · Interní nástroj</span>
        </nav>

        <main>
          {/* Hero */}
          <div className="hero">
            <div className="hero-tag">AI přepis meetingů</div>
            <h1>Přepis do češtiny<br /><span className="accent-word">za sekundy.</span></h1>
            <p className="hero-sub">Nahraj audio z meetingu – Groq Whisper ho přepíše a AI vytvoří strukturované shrnutí.</p>
          </div>

          {/* Error */}
          {error && <div className="err"><span>⚠️</span><span>{error}</span></div>}

          {/* IDLE */}
          {appState === 'idle' && (
            <>
              <div className="section">
                <div className="section-label">API klíč</div>
                <div className="card">
                  <div className="api-row">
                    <input
                      id="api-key-in"
                      type="password"
                      className="api-in"
                      placeholder="gsk_..."
                      defaultValue={apiKey}
                      onChange={() => setApiSaved(false)}
                      onKeyDown={e => e.key === 'Enter' && saveApiKey(document.getElementById('api-key-in').value)}
                    />
                    <button
                      className={`btn-save${apiSaved ? ' saved' : ''}`}
                      onClick={() => saveApiKey(document.getElementById('api-key-in').value)}
                    >
                      {apiSaved ? '✓ Uloženo' : 'Uložit'}
                    </button>
                  </div>
                  <div className="api-hint">Ukládá se pouze lokálně v prohlížeči.</div>
                </div>
              </div>

              <div className="section">
                <div className="section-label">Audio soubor</div>
                <div className="card">
                  <div
                    className={`dropzone${drag ? ' drag' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('f-in').click()}
                  >
                    <input
                      id="f-in" type="file"
                      accept=".mp3,.m4a,.wav,.ogg,.webm,audio/*"
                      style={{ display: 'none' }}
                      onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
                    />
                    <span className="drop-icon">🎙</span>
                    <div className="drop-title">Přetáhni sem nebo vyber soubor</div>
                    <div className="drop-sub">mp3, m4a, wav, ogg, webm</div>
                    <button className="btn-pick" onClick={e => { e.stopPropagation(); document.getElementById('f-in').click(); }}>
                      Vybrat soubor
                    </button>
                    <div className="drop-fmts">Maximální velikost 25 MB</div>
                  </div>
                </div>
              </div>

              <div className="info-row">
                <div className="info-dot" />
                <span>Groq Whisper API – přesný přepis češtiny, hodinové audio za desítky sekund</span>
              </div>
            </>
          )}

          {/* LOADING */}
          {isLoading && (
            <div className="section">
              <div className="card">
                <div className="prog-wrap">
                  <div className="spin-ring" />
                  <div className="prog-label">{statusText || 'Přepisuji...'}</div>
                  <div className="prog-hint">Může trvat několik sekund</div>
                </div>
              </div>
            </div>
          )}

          {/* DONE */}
          {(appState === 'done' || appState === 'summarizing') && (
            <>
              {summary && (
                <div className="section">
                  <div className="section-label">AI Shrnutí</div>
                  <div className="card">
                    <div className="smd" dangerouslySetInnerHTML={{
                      __html: summary
                        .replace(/## (.*)/g, '<h2>$1</h2>')
                        .replace(/^- (.*)/gm, '<li>$1</li>')
                        .replace(/(<li>[\s\S]*?(?=<h2>|$))/g, '<ul>$1</ul>')
                    }} />
                  </div>
                </div>
              )}

              <div className="section">
                <div className="section-label">Přepis</div>
                <div className="card">
                  <textarea
                    className="tbox"
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    rows={7}
                  />
                </div>
              </div>

              <div className="section">
                <div className="card">
                  <div className="actions">
                    {!summary && (
                      <button
                        className="btn-main"
                        onClick={handleSummarize}
                        disabled={!apiKey || appState === 'summarizing'}
                      >
                        {appState === 'summarizing' ? '⚙️ Generuji...' : '✨ Vytvořit AI shrnutí'}
                      </button>
                    )}
                    <ExportButtons transcript={transcript} summary={summary} />
                  </div>
                  <hr className="div" />
                  <button className="btn-ghost" onClick={handleReset}>
                    Přepsat další soubor
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
