import { useRef, useState } from 'react';

const ACCEPTED = ['audio/mp4', 'audio/m4a', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'video/webm'];
const ACCEPTED_EXT = ['.m4a', '.mp3', '.wav', '.ogg', '.webm'];

export default function FileUpload({ onFile }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    onFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current.click()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all select-none
        ${dragging
          ? 'border-blue-400 bg-blue-50 scale-[1.01]'
          : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50/30'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXT.join(',')}
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <div className="text-5xl mb-4">🎵</div>
      <p className="text-lg font-medium text-gray-700 mb-1">Přetáhni audio soubor sem</p>
      <p className="text-gray-400 text-sm mb-4">nebo</p>
      <span className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors inline-block">
        Vyber soubor
      </span>
      <p className="text-xs text-gray-400 mt-4">Podporované formáty: m4a, mp3, wav, ogg, webm</p>
    </div>
  );
}
