import { useState, useCallback } from 'react';
import ApiKeyInput from './components/ApiKeyInput';
import FileUpload from './components/FileUpload';
import ProgressBar from './components/ProgressBar';
import TranscriptView from './components/TranscriptView';
import SummaryView from './components/SummaryView';
import ExportButtons from './components/ExportButtons';
import { summarizeTranscript } from './lib/summarize';

export default function App() {
  const [appState, setAppState] = useState('idle');
  const [apiKey, setApiKey] = useState('');
  const [progress, setProgress] = useState(null);
  const [statusText, setStatusText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const handleFile = useCallback(async (file) => {
    if (!apiKey) {
      setError('Zadej Groq API klíč před nahráním souboru.');
      return;
    }
    setError('');
    setTranscript('');
    setSummary('');
    setProgress(null);
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
        throw new Error(err?.error?.message || 'Chyba Groq Whisper API – zkontroluj API klíč');
      }

      const text = await response.text();
      setTranscript(text.trim());
      setAppState('done');
      setProgress(null);

    } catch (err) {
      setError(`Chyba při přepisu: ${err.message}`);
      setAppState('idle');
    }
  }, [apiKey]);

  const handleSummarize = async () => {
    if (!apiKey || !transcript) return;
    setError('');
    setAppState('summarizing');
    try {
      const result = await summarizeTranscript(transcript, apiKey);
      setSummary(result);
      setAppState('done');
    } catch (err) {
      setError(err.message);
      setAppState('done');
    }
  };

  const handleReset = () => {
    setAppState('idle');
    setTranscript('');
    setSummary('');
    setError('');
    setProgress(null);
  };

  const isLoading = appState === 'transcribing';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">🎵 KofoNote</h1>
          <p className="text-gray-500">Přepis meetingů do češtiny</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        {appState === 'idle' && (
          <>
            <ApiKeyInput onKeyChange={setApiKey} />
            <FileUpload onFile={handleFile} />
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
              💡 Přepis probíhá přes Groq Whisper API – rychlý a přesný i pro češtinu.
            </div>
          </>
        )}

        {isLoading && (
          <ProgressBar progress={progress} status={statusText} />
        )}

        {(appState === 'done' || appState === 'summarizing') && (
          <div className="space-y-6">
            {summary && <SummaryView markdown={summary} />}

            <TranscriptView text={transcript} onChange={setTranscript} />

            {!summary && (
              <div className="relative group inline-block">
                <button
                  onClick={handleSummarize}
                  disabled={!apiKey || appState === 'summarizing'}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {appState === 'summarizing' ? (
                    <><span className="animate-spin">⚙️</span> Generuji shrnutí...</>
                  ) : (
                    '✨ Vytvořit AI shrnutí'
                  )}
                </button>
                {!apiKey && (
                  <div className="absolute bottom-full left-0 mb-2 bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Zadej Groq API klíč výše
                  </div>
                )}
              </div>
            )}

            <ExportButtons transcript={transcript} summary={summary} />

            <button
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
            >
              ← Přepsat další soubor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
