export async function summarizeTranscript(text, apiKey) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `Jsi asistent pro zpracování přepisů meetingů. Vždy odpovídej česky. 
Vytvoř strukturované shrnutí v markdown formátu přesně v této struktuře:

## 📌 Hlavní body
- (seznam hlavních témat která zazněla)

## ✅ Úkoly a akce
- (co je potřeba udělat, kdo co má zajistit)

## 💡 Klíčová rozhodnutí
- (co bylo rozhodnuto)

## 📝 Poznámky
- (cokoliv důležitého co nezapadá jinam)

Buď stručný a výstižný. Pokud některá sekce není relevantní, vynech ji.`
        },
        {
          role: 'user',
          content: `Zde je přepis meetingu:\n\n${text}`
        }
      ],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Chyba Groq API – zkontroluj API klíč');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
