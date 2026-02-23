# 🎵 KofoNote – Kompletní dokumentace

> Přepis meetingů do češtiny pomocí Groq Whisper API  
> Nasazeno na: https://jurkis-pbi.github.io/kofonote/  
> GitHub repozitář: https://github.com/Jurkis-PBI/kofonote

---

## 📋 Obsah

1. [Co je KofoNote](#co-je-kofonote)
2. [Jak používat aplikaci](#jak-používat-aplikaci)
3. [Architektura – jak to funguje](#architektura)
4. [Co jsme nastavili a kde](#co-jsme-nastavili)
5. [Jak nasadit změny (update)](#jak-nasadit-změny)
6. [Řešení problémů](#řešení-problémů)
7. [Důležité přístupy a účty](#důležité-přístupy)

---

## Co je KofoNote

KofoNote je webová aplikace která:
- Přijme audio soubor z meetingu (mp3, m4a, wav, ogg, webm)
- Pošle ho na Groq Whisper API → dostane přesný přepis v češtině
- Volitelně vytvoří AI shrnutí (hlavní body, úkoly, rozhodnutí)
- Umožní stáhnout přepis nebo shrnutí jako .txt nebo .md soubor

Aplikace běží **přímo v prohlížeči** – není potřeba žádný server. Groq API klíč se ukládá pouze lokálně v prohlížeči uživatele.

---

## Jak používat aplikaci

### Krok 1 – Otevři aplikaci
Jdi na adresu: **https://jurkis-pbi.github.io/kofonote/**

### Krok 2 – Zadej Groq API klíč
- Do pole "Groq API klíč" vlož svůj klíč (začíná `gsk_...`)
- Klikni **Uložit** – klíč se uloží do prohlížeče, příště ho nemusíš zadávat znovu
- Klíč se nikam neodesílá, je pouze v tvém prohlížeči

### Krok 3 – Nahraj audio
- Přetáhni soubor do označené oblasti, nebo klikni **Vyber soubor**
- Podporované formáty: **mp3, m4a, wav, ogg, webm**
- Maximální velikost souboru: **25 MB** (limit Groq API)

### Krok 4 – Počkej na přepis
- Přepis přes Groq trvá obvykle **5–30 sekund** i pro dlouhá audia
- Po dokončení se zobrazí text přepisu

### Krok 5 – Vytvoř AI shrnutí (volitelné)
- Klikni **✨ Vytvořit AI shrnutí**
- Groq AI vytvoří strukturované shrnutí s: hlavními body, úkoly, rozhodnutími, poznámkami

### Krok 6 – Exportuj
- **Stáhnout .txt** – jen přepis
- **Stáhnout .md** – přepis + shrnutí ve formátu Markdown (vhodné pro Obsidian)

---

## Architektura

```
Uživatel
   │
   ├── Prohlížeč (jurkis-pbi.github.io/kofonote/)
   │      │
   │      ├── React aplikace (Vite build)
   │      ├── Groq API klíč (uložen v localStorage)
   │      │
   │      └── Volání Groq API
   │             │
   │             ├── Whisper API → přepis audia
   │             └── LLaMA 3.3 70B → AI shrnutí
   │
   └── GitHub Pages (hosting, zdarma)
          │
          └── GitHub Actions (automatický build při každém push)
```

### Klíčové soubory v projektu

```
kofonote/
├── src/
│   ├── App.jsx                    # Hlavní logika aplikace
│   ├── components/
│   │   ├── ApiKeyInput.jsx        # Pole pro zadání API klíče
│   │   ├── FileUpload.jsx         # Nahrání audio souboru
│   │   ├── ProgressBar.jsx        # Progress bar při přepisu
│   │   ├── TranscriptView.jsx     # Zobrazení přepisu
│   │   ├── SummaryView.jsx        # Zobrazení shrnutí
│   │   └── ExportButtons.jsx      # Tlačítka pro export
│   └── lib/
│       └── summarize.js           # Volání Groq API pro shrnutí
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions – automatický deploy
├── package.json                   # Závislosti a skripty
└── vite.config.js                 # Konfigurace buildu
```

---

## Co jsme nastavili

### 1. Lokální prostředí (tvůj počítač)

**Nainstalováno:**
- **Node.js** – spouští npm příkazy (staženo z nodejs.org)
- **Git** – správa verzí a nahrávání na GitHub (staženo z git-scm.com)

**Složka s projektem:**
```
C:\Users\rjuroska\Downloads\kofonote\
```

### 2. GitHub

**Účet:** Jurkis-PBI  
**Repozitář:** https://github.com/Jurkis-PBI/kofonote  
**Branch:** `main` – zdrojový kód  
**Branch:** `gh-pages` – sestavená aplikace (generuje se automaticky)

**Personal Access Token:**
- Název: `kofonote-deploy`
- Oprávnění: `repo` + `workflow`
- Platnost: 30 dní (vyprší cca 25. března 2026)
- ⚠️ Po vypršení je potřeba vygenerovat nový na: https://github.com/settings/tokens

**GitHub Pages nastavení:**
- Settings → Pages → Branch: `gh-pages` → `/ (root)`

**GitHub Actions** (automatický deploy):
- Soubor: `.github/workflows/deploy.yml`
- Spustí se automaticky při každém `git push` na `main`
- Build trvá cca 1–2 minuty
- Výsledek vidíš na: https://github.com/Jurkis-PBI/kofonote/actions

### 3. Groq API

**Konzole:** https://console.groq.com  
**API klíče:** https://console.groq.com/keys

**Používané modely:**
- Přepis: `whisper-large-v3-turbo` – rychlý, přesný pro češtinu
- Shrnutí: `llama-3.3-70b-versatile` – aktuální LLaMA model

**Limity free tier Groq:**
- Whisper: 7 200 sekund audia / hodina (= 2 hodiny meetingů za hodinu)
- LLaMA: 6 000 tokenů / minuta
- Maximální velikost souboru: 25 MB

---

## Jak nasadit změny

Kdykoli chceš upravit aplikaci, postupuj takto:

### 1. Uprav soubory
Otevři soubory v `C:\Users\rjuroska\Downloads\kofonote\src\` a proveď změny.

### 2. Otevři CMD
```
cd C:\Users\rjuroska\Downloads\kofonote
```

### 3. Nahraj změny na GitHub
```
git add .
git commit -m "popis co jsi změnil"
git push https://Jurkis-PBI:TVUJ_TOKEN@github.com/Jurkis-PBI/kofonote.git main
```
*(místo `TVUJ_TOKEN` vlož aktuální Personal Access Token)*

### 4. Počkej na build
- Jdi na https://github.com/Jurkis-PBI/kofonote/actions
- Počkej na zelenou fajfku ✅ (cca 1–2 minuty)

### 5. Otevři aplikaci
- https://jurkis-pbi.github.io/kofonote/
- Stiskni **Ctrl+F5** (tvrdý refresh) aby se načetla nová verze

---

## Řešení problémů

### ❌ "Authentication failed" při git push

**Příčina:** Vypršel nebo je neplatný Personal Access Token.

**Řešení:**
1. Jdi na https://github.com/settings/tokens
2. Smaž starý token `kofonote-deploy`
3. Vytvoř nový (New → Classic → zaškrtni `repo` + `workflow` → Generate)
4. Zkopíruj nový token a použij ho v příkazu push

---

### ❌ Aplikace se neaktualizovala po push

**Příčina:** GitHub Actions ještě nedokončil build, nebo prohlížeč má cache.

**Řešení:**
1. Zkontroluj https://github.com/Jurkis-PBI/kofonote/actions – čekej na ✅
2. V prohlížeči stiskni **Ctrl+F5**

---

### ❌ "Chyba Groq Whisper API – zkontroluj API klíč"

**Příčina:** Neplatný nebo expirovaný API klíč, nebo soubor je větší než 25 MB.

**Řešení:**
1. Jdi na https://console.groq.com/keys
2. Ověř že klíč existuje a není smazaný
3. Pokud je smazaný – vytvoř nový a vlož do aplikace
4. Zkontroluj velikost souboru (max 25 MB)

---

### ❌ Přepis je nesmyslný / špatný

**Příčina:** Špatná kvalita audia, příliš velký šum, nebo jazyk není čeština.

**Řešení:**
- Zkus nahrát čistší audio (bez šumu na pozadí)
- Ujisti se že mluvčí mluví česky nebo slovensky
- Pro slovenštinu změň v `App.jsx` řádek `language: 'cs'` na `language: 'sk'`

---

### ❌ GitHub Actions selhal (červený křížek)

**Řešení:**
1. Klikni na failed workflow na https://github.com/Jurkis-PBI/kofonote/actions
2. Klikni na červený krok a přečti chybovou hlášku
3. Nejčastější příčiny:
   - Chyba v kódu (syntax error v JSX)
   - Vypršel token pro GitHub Actions (v `.github/workflows/deploy.yml`)

---

### ❌ "model has been decommissioned" (červené varování)

**Příčina:** Groq vypnul model který aplikace používá.

**Řešení:**
1. Jdi na https://console.groq.com/docs/models a najdi aktuální název modelu
2. V souboru `src/lib/summarize.js` změň řádek `model: 'llama-3.3-70b-versatile'` na nový název
3. Nasaď změnu (viz sekce Jak nasadit změny)

---

### ❌ Soubor je větší než 25 MB

**Příčina:** Groq Whisper API má limit 25 MB na soubor.

**Řešení:**
- Komprimuj audio před nahráním (např. v Audacity nebo online konvertorem)
- Nebo rozděl dlouhé nahrávky na části

---

## Důležité přístupy

| Služba | URL | Účet |
|--------|-----|------|
| Aplikace | https://jurkis-pbi.github.io/kofonote/ | – |
| GitHub | https://github.com/Jurkis-PBI/kofonote | Jurkis-PBI |
| GitHub tokens | https://github.com/settings/tokens | Jurkis-PBI |
| GitHub Actions | https://github.com/Jurkis-PBI/kofonote/actions | Jurkis-PBI |
| Groq konzole | https://console.groq.com | rjuroska účet |
| Groq API klíče | https://console.groq.com/keys | rjuroska účet |
| Groq modely | https://console.groq.com/docs/models | – |

---

## ⚠️ Důležitá upozornění

1. **Nikdy nesdílej Groq API klíč** – je to jako heslo, dává přístup k tvému Groq účtu
2. **Nikdy nesdílej GitHub Personal Access Token** – dává přístup k repozitáři
3. **GitHub token vyprší 25. března 2026** – pak bude potřeba vygenerovat nový
4. **Groq API klíč v aplikaci** se ukládá jen v prohlížeči – při vymazání cache prohlížeče se smaže a bude potřeba ho zadat znovu
5. **Maximální velikost souboru je 25 MB** – větší soubory je potřeba komprimovat nebo rozdělit

---

*Dokumentace vytvořena: únor 2026*
