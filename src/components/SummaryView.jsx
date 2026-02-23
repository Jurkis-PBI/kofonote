import { marked } from 'marked';

marked.setOptions({ breaks: true });

export default function SummaryView({ markdown }) {
  const html = marked.parse(markdown || '');

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">✨ AI Shrnutí</h2>
      <div
        className="bg-white border border-gray-200 rounded-xl p-5 prose prose-sm max-w-none text-gray-700"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
