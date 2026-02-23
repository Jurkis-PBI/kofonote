import { downloadMd, downloadTxt } from '../lib/export';

export default function ExportButtons({ transcript, summary }) {
  return (
    <div className="flex flex-wrap gap-3">
      {summary && (
        <button
          onClick={() => downloadMd(transcript, summary)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          ⬇️ Stáhnout .md <span className="text-green-200 text-xs">(shrnutí + přepis)</span>
        </button>
      )}
      <button
        onClick={() => downloadTxt(transcript)}
        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
      >
        ⬇️ Stáhnout .txt <span className="text-gray-300 text-xs">(jen přepis)</span>
      </button>
    </div>
  );
}
