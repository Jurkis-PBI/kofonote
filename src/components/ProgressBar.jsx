export default function ProgressBar({ progress, status }) {
  const pct = progress != null ? Math.round(progress * 100) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
      <div className="text-3xl mb-3 animate-pulse">⚙️</div>
      <p className="text-gray-700 font-medium mb-4">{status || 'Zpracovávám...'}</p>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
          style={{ width: pct != null ? `${pct}%` : '100%', animation: pct == null ? 'pulse 1.5s infinite' : 'none' }}
        />
      </div>
      {pct != null && (
        <p className="text-xs text-gray-400 mt-2">{pct}%</p>
      )}
      <p className="text-xs text-gray-400 mt-3">
        💡 Při prvním použití se stahuje model (~150 MB). Příště okamžitě z cache.
      </p>
    </div>
  );
}
