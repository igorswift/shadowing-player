# Shadowing Player

One HTML file. No frameworks. No accounts. No servers.
Load a video or audio file, load a transcript, practice.

**[Launch →](https://igorswift.github.io/shadowing-player/)**

---

## The Problem

Every shadowing tool out there — Language Reactor, YouTube auto-captions, even Premiere Pro's built-in player — chops phrases by **timing**, not by **meaning**. You end up repeating half-sentences. That's not shadowing. That's noise.

## The Solution

This player uses sentence boundaries from the transcript. Every phrase you repeat is a complete thought. The rest is a tight practice loop: play → pause → repeat → compare → next.

---

## Core Loop

```
▶ Phrase plays → ⏸ Auto-pause → 🎤 Your turn → ⏭ Next
```

1. Load an `.mp4` / `.mp3` file and a `.json` transcript (Premiere Pro auto-transcription format)
2. Player splits the transcript into sentences using `eos` flags and word-level timestamps
3. Each sentence plays, auto-pauses at the boundary, and waits for you
4. Navigate with arrow keys or a Bluetooth remote, record yourself, compare timing, move on

---

## Features

### Practice

| Feature | What it does |
|---------|-------------|
| **Auto-pause** | Stops at sentence boundaries — no cut-off phrases |
| **Split: 2 / 3** | Merges current + next 1–2 phrases into one continuous playback. Cycle with one button: Off → 2 → 3 → Off |
| **Split Lock** | Keeps Split active across navigation. Next skips +2 or +3, Prev goes back by the same amount. Every phrase auto-pairs |
| **Merge** | Auto-joins short phrases (< 2s) into blocks (max 8s). Toggle on/off without losing your position |
| **Click any word** | Tap a word → playback jumps to that exact timestamp |
| **Rec** | Listen → countdown → record your voice → auto-playback. Compare your timing with the original |
| **Shadow** | Phrase + your mic record simultaneously. Hit Mix to hear both layered (original 50% + voice 100%) |
| **5 takes per phrase** | Duration vs original, diff in seconds, color-coded. Reset after 5 |
| **Speed** | 0.75x for hard phrases, 1x for normal |
| **Loop** | Phrase repeats 3× automatically |

### Teleprompter

| Feature | What it does |
|---------|-------------|
| **Mirror** | Flips the entire interface vertically for beam-splitter teleprompters. Bigger font in mirror mode |
| **Wake Lock** | Screen stays on while the player is active — no dimming during recording |
| **Translation (RU)** | Shows Russian translation below each phrase. Toggle on/off. Translations stored in JSON |

### Tracking

| Feature | What it does |
|---------|-------------|
| **Session timer** | Running clock, phrases covered, recordings made |
| **Practice timer** | 10 / 15 / 20 min countdown. Beeps when done. Build a daily habit |
| **History** | Daily breakdown with deltas (↑↓) and all-time stats. Stored in localStorage |
| **Tab-switch pause** | Switch tabs → video pauses. No lost position |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` `→` | Previous / Next phrase |
| `↑` `↓` | Replay current phrase |
| `Space` | Pause / Play |
| `R` | Record |
| `W` | Shadow mode |
| `F` | Cycle Split (Off → 2 → 3) |
| `H` | Hide / Show text |
| `S` | Cycle speed |
| `L` | Toggle loop |
| `T` | Toggle translation |
| `P` | Toggle mirror |
| `M` | Toggle merge |

All shortcuts work with Bluetooth remotes that send standard HID key events.

---

## Setup

### Option A: Browser (instant)

1. Open `index.html` in any modern browser
2. Select video (.mp4) or audio (.mp3)
3. Select transcript (.json)
4. Go

### Option B: Full workflow

1. Download video → `yt-dlp -f "bv[vcodec^=avc1]+ba" URL`
2. Import into Premiere Pro → auto-transcribe
3. Export transcript as JSON
4. Open the player, load both files
5. Practice

### Option C: AI voiceover workflow

1. Write a script, generate audio with ElevenLabs (or any TTS)
2. Import .mp3 into Premiere Pro → auto-transcribe → export JSON
3. Load both into the player
4. Use Mirror mode with a teleprompter to practice and record

### Option D: Hosted

**[igorswift.github.io/shadowing-player](https://igorswift.github.io/shadowing-player/)**

Everything stays on your device. Nothing is uploaded.

---

## Transcript Format

The player expects Premiere Pro's auto-transcription JSON:

```json
{
  "translations": [
    "Перевод первой фразы.",
    "Перевод второй фразы."
  ],
  "segments": [
    {
      "words": [
        { "type": "word", "text": "Hello", "start": 0.5, "duration": 0.3, "eos": false },
        { "type": "word", "text": "world.", "start": 0.9, "duration": 0.4, "eos": true }
      ]
    }
  ]
}
```

- `eos: true` marks sentence boundaries — this is how the player knows where to split
- Word-level `start` and `duration` power click-to-seek and Split timing
- `type: "word"` filters out punctuation-only entries
- `translations` array (optional) — one translation per sentence, shown via RU button

---

## Tech

- **Zero dependencies** — no npm, no build, no CDN
- Single `index.html` — markup + styles + logic
- MediaRecorder API for voice capture
- Web Audio API for timer beeps
- Wake Lock API to prevent screen dimming
- localStorage for session history
- requestAnimationFrame for auto-pause timing (adaptive: 120ms desktop, 220ms mobile)
- Works offline after first load

---

## Why

I needed a shadowing tool that doesn't suck. Everything available either cuts phrases wrong, requires an account, needs internet, or buries the practice loop under features nobody asked for.

This is the tool I wanted. One file, works anywhere, does one thing well.

---

*Built for personal use. If it helps you too — good.*

---

<details>
<summary>🇷🇺 На русском</summary>

# Shadowing Player

Офлайн-инструмент для практики английского методом shadowing и записи видео с телепромптером. Один HTML-файл. Без аккаунтов, без серверов, без зависимостей.

## Проблема

YouTube, Language Reactor, даже Premiere Pro — все режут фразы по таймингу, а не по смыслу. Повторяешь обрубки предложений.

## Решение

Плеер использует границы предложений из транскрипта (флаг `eos`). Каждая фраза — законченная мысль.

## Возможности

- **Split: 2/3** — склеивает фразы для непрерывного воспроизведения
- **Lock** — Split не сбрасывается при навигации, каждая фраза автоматически склеивается
- **Merge** — автоматически объединяет короткие фразы (< 2с) в блоки
- **Mirror** — зеркалит интерфейс для телепромптера с beam-splitter
- **Перевод** — показывает русский перевод под фразой
- **Rec / Shadow** — запись голоса с таймингом и сравнением
- **Таймер** — 10/15/20 мин обратный отсчёт для формирования привычки
- **Wake Lock** — экран не гаснет во время записи
- **Bluetooth пульт** — все шорткаты работают с BT-пультом

## Как пользоваться

1. Открой `index.html` или [hosted версию](https://igorswift.github.io/shadowing-player/)
2. Загрузи видео/аудио (.mp4/.mp3) и транскрипт (.json из Premiere Pro)
3. Стрелками — навигация, F — Split, пробел — пауза
4. Mirror + BT пульт — режим телепромптера для записи на камеру

Файлы остаются на устройстве — ничего никуда не загружается.

</details>
