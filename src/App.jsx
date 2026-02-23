import { useState, useRef, useCallback } from 'react';
import ApiKeyInput from './components/ApiKeyInput';
import FileUpload from './components/FileUpload';
import ProgressBar from './components/ProgressBar';
import TranscriptView from './components/TranscriptView';
import SummaryView from './components/SummaryView';
import ExportButtons from './components/ExportButtons';
import { summarizeTranscript } from './lib/summarize';

// States: idle | loading | transcribing | done | summarizing
export default function App() {
  const [appState, setAppState] = useState('idle');
  const [apiKey, setApiKey] = useState('');
  const [progress, setProgress] = useState(null);
  const [statusText, setStatusText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const workerRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    setError('');
    setTranscript('');
    setSummary('');
    setProgress(null);
    setAppState('loading');
    setStatusText('Načítám audio soubor...');

    try {
      // Read audio file and decode to Float32Array at 16kHz
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      audioCtx.close();

      const channelData = audioBuffer.getChannelData(0);
      const float32 = new Float32Array(channelData);

      // Spin up worker
      if (workerRef.current) workerRef.current.terminate();
      const worker = new Worker(
        new URL('./workers/transcribe.worker.js', import.meta.url),
        { type: 'module' }
      );
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const { type, data, text, message } = e.data;
        if (type === 'status') {
          setStatusText(message || text);
          setAppState('transcribing');
        } else if (type === 'progress') {
          if (data?.progress != null) setProgress(data.progress / 100);
        } else if (type === 'result') {
          setTranscript(text.trim());
          setAppState('done');
          setProgress(null);
          worker.terminate();
        } else if (type === 'error') {
          setError(message);
          setAppState('idle');
          worker.terminate();
        }
      };

      worker.onerror = (e) => {
        setError(`Chyba workeru: ${e.message}`);
        setAppState('idle');
      };

      setAppState('transcribing');
      setStatusText('Stahuji model Whisper...');
      worker.postMessage({ audioData: float32 });

    } catch (err) {
      setError(`Chyba při načítání souboru: ${err.message}`);
      setAppState('idle');
    }
  }, []);

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
    if (workerRef.current) workerRef.current.terminate();
    setAppState('idle');
    setTranscript('');
    setSummary('');
    setError('');
    setProgress(null);
  };

  const isLoading = appState === 'loading' || appState === 'transcribing';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">🎵 KofoNote</h1>
          <p className="text-gray-500">Přepis meetingů do češtiny</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* IDLE */}
        {appState === 'idle' && (
          <>
            <ApiKeyInput onKeyChange={setApiKey} />
            <FileUpload onFile={handleFile} />
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
              💡 Při prvním použití se stáhne model (~150 MB). Příště okamžitě z cache.
            </div>
          </>
        )}

        {/* LOADING / TRANSCRIBING */}
        {isLoading && (
          <ProgressBar progress={progress} status={statusText} />
        )}

        {/* DONE / SUMMARIZING */}
        {(appState === 'done' || appState === 'summarizing') && (
          <div className="space-y-6">
            {/* Summary */}
            {summary && <SummaryView markdown={summary} />}

            {/* Transcript */}
            <TranscriptView text={transcript} onChange={setTranscript} />

            {/* Summarize button */}
            {!summary && (
              <div className="relative group inline-block">
                <button
                  onClick={handleSummarize}
                  disabled={!apiKey || appState === 'summarizing'}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {appState === 'summarizing' ? (
                    <>
                      <span className="animate-spin">⚙️</span> Generuji shrnutí...
                    </>
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

            {/* Export buttons */}
            <ExportButtons transcript={transcript} summary={summary} />

            {/* Reset */}
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
