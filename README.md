# Shadowing Player

One HTML file. No frameworks. No accounts. No servers. Load a video, load a transcript, practice.

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

1. Load an `.mp4` video and a `.json` transcript (Premiere Pro auto-transcription format)
2. Player splits the transcript into sentences using `eos` flags and word-level timestamps
3. Each sentence plays, auto-pauses at the boundary, and waits for you
4. Navigate with arrow keys, record yourself, compare timing, move on

---

## Features

### Practice

| Feature | What it does |
|---------|-------------|
| **Auto-pause** | Stops at sentence boundaries — no cut-off phrases |
| **Split** | Merges current + next phrase into one continuous playback. Replay repeats both. Next skips +2 |
| **Click any word** | Tap a word → playback jumps to that exact moment |
| **Rec** | Listen → countdown → record your voice → auto-playback. Compare your timing with the original |
| **Shadow** | Phrase + your mic record simultaneously. Hit Mix to hear both layered (original 50% + voice 100%) |
| **5 takes per phrase** | Duration vs original, diff in seconds, color-coded. Reset after 5 |
| **Speed** | 0.75x for hard phrases, 1x for normal |
| **Loop** | Phrase repeats 3× automatically |
| **Hide text** | Listen first, check after |

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
| `F` | Split (current + next) |
| `H` | Hide / Show text |
| `S` | Cycle speed |
| `L` | Toggle loop |

---

## Setup

### Option A: Browser (instant)

1. Open `index.html` in any modern browser
2. Select video (.mp4)
3. Select transcript (.json)
4. Go

### Option B: Full workflow

1. Download video → `yt-dlp -f "bv[vcodec^=avc1]+ba" URL`
2. Import into Premiere Pro → auto-transcribe
3. Export transcript as JSON
4. Open the player, load both files
5. Practice

### Option C: Hosted

**[igorswift.github.io/shadowing-player](https://igorswift.github.io/shadowing-player/)**

Everything stays on your device. Nothing is uploaded.

---

## Transcript Format

The player expects Premiere Pro's auto-transcription JSON with this structure:

```json
{
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

---

## Tech

- **Zero dependencies** — no npm, no build, no CDN
- One HTML file: markup + styles + logic
- MediaRecorder API for voice capture
- Web Audio API for timer beeps
- localStorage for session history
- requestAnimationFrame for auto-pause timing (120ms buffer)
- Works offline after first load

---

## Why

I needed a shadowing tool that doesn't suck. Everything available either cuts phrases wrong, requires an account, needs internet, or buries the practice loop under features nobody asked for.

This is the tool I wanted. One file, works anywhere, does one thing well.

---

*Built for personal use. MIT license. If it helps you — good.*

---

<details>
<summary>🇷🇺 На русском</summary>

# Shadowing Player

Офлайн-инструмент для практики английского методом shadowing. Один HTML-файл. Без аккаунтов, без серверов, без зависимостей.

## Проблема

YouTube, Language Reactor, даже Premiere Pro — все режут фразы по таймингу, а не по смыслу. Повторяешь обрубки предложений.

## Решение

Плеер использует границы предложений из транскрипта (флаг `eos`). Каждая фраза — законченная мысль.

## Как пользоваться

1. Открой `index.html` в браузере (или [hosted версию](https://igorswift.github.io/shadowing-player/))
2. Загрузи видео (.mp4) и транскрипт (.json из Premiere Pro)
3. Стрелками — навигация, Rec/Shadow — запись голоса
4. Split — склеивает текущую + следующую фразу
5. Тап по слову — перемотка к этому слову
6. Таймер 10/15/20 мин — для ежедневной привычки

Файлы остаются на устройстве — ничего никуда не загружается.

</details>
