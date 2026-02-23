export function downloadMd(transcript, summary) {
  const date = new Date().toLocaleDateString('cs-CZ').replace(/\./g, '-');
  const content = `# Meeting – ${date}

${summary}

---

## 📄 Celý přepis

${transcript}
`;
  triggerDownload(content, `meeting_${date}.md`, 'text/markdown');
}

export function downloadTxt(transcript) {
  const date = new Date().toLocaleDateString('cs-CZ').replace(/\./g, '-');
  triggerDownload(transcript, `prepis_${date}.txt`, 'text/plain');
}

function triggerDownload(content, filename, type) {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
