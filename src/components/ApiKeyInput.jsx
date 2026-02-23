import { useState, useEffect } from 'react';

export default function ApiKeyInput({ onKeyChange }) {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('kofonote_groq_key');
    if (stored) {
      setKey(stored);
      setSaved(true);
      onKeyChange(stored);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('kofonote_groq_key', key);
    setSaved(true);
    onKeyChange(key);
  };

  const handleClear = () => {
    localStorage.removeItem('kofonote_groq_key');
    setKey('');
    setSaved(false);
    onKeyChange('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
      <p className="text-sm font-medium text-gray-700 mb-2">
        🔑 Groq API klíč <span className="text-gray-400 font-normal">(pro AI shrnutí – volitelné)</span>
      </p>
      {saved ? (
        <div className="flex items-center gap-3">
          <span className="text-green-600 text-sm font-medium">✅ Klíč uložen</span>
          <button onClick={handleClear} className="text-sm text-red-400 underline hover:text-red-600 transition-colors">
            Odstranit
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && key && handleSave()}
            placeholder="gsk_..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
          />
          <button
            onClick={handleSave}
            disabled={!key}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Uložit
          </button>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-2">
        Klíč se ukládá pouze v tvém prohlížeči. Nikam se neodesílá.
      </p>
    </div>
  );
}
