import { pipeline } from '@xenova/transformers';

let transcriber = null;

self.onmessage = async (e) => {
  const { audioData } = e.data;

  try {
    if (!transcriber) {
      self.postMessage({ type: 'status', text: 'Stahuji model Whisper...' });
      transcriber = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-base',
        {
          progress_callback: (progress) => {
            self.postMessage({ type: 'progress', data: progress });
          }
        }
      );
    }

    self.postMessage({ type: 'status', text: 'Přepisuji audio...' });

    const result = await transcriber(audioData, {
      language: 'czech',
      task: 'transcribe',
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: false,
    });

    self.postMessage({ type: 'result', text: result.text });
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message });
  }
};
