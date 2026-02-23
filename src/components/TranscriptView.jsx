export default function TranscriptView({ text, onChange }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">📄 Přepis</h2>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-64 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        placeholder="Přepis se zobrazí zde..."
      />
    </div>
  );
}
