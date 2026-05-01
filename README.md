# Shadowing Player

A dead-simple offline tool for English shadowing practice. No accounts, no servers, no bullshit — just you, a video, and a transcript.

## What it does

You load a video file and a JSON transcript. The player splits it into individual sentences, plays each one, auto-pauses, and waits for you to repeat. That's the core loop. Everything else is built around making that loop faster and more useful.

**The problem it solves:** YouTube auto-captions and tools like Language Reactor chop phrases by timing, not by meaning. You end up repeating half-sentences. This player uses sentence boundaries from the transcript, so every phrase is a complete thought.

## Features

- **Auto-pause at sentence boundaries** — no more cut-off phrases
- **Rec mode** — listens to the phrase first, countdown, then records your voice. Compare your timing with the original
- **Shadow mode** — plays the phrase and records you simultaneously. Use headphones so the mic only catches your voice. Hit Mix to hear both layered together
- **Up to 5 takes per phrase** — see your duration vs the original, track improvement across attempts
- **Speed control** — 0.75x for difficult phrases, 1x for normal
- **Loop mode** — phrase repeats 3 times automatically
- **Hide/Show text** — listen first, check the text after
- **Session tracker** — timer, phrases covered, recordings made. Stats saved by day in localStorage
- **Practice history** — daily breakdown with deltas (↑↓) showing progress trends
- **Tab-switch pause** — switches tab, video pauses. No losing your place
- **Fully offline** — one HTML file, works in any browser, no internet needed after loading

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `←` `→` | Previous / Next phrase |
| `↑` `↓` | Replay current phrase |
| `Space` | Pause / Play |
| `R` | Start/Stop recording |
| `W` | Start Shadow mode |
| `H` | Hide/Show text |
| `S` | Cycle speed (0.75x / 1x) |
| `L` | Toggle loop mode |

## How to use

### Quick start (browser)

1. Open `index.html` in Chrome (or any modern browser)
2. Select your video file (.mp4)
3. Select your transcript (.json — exported from Premiere Pro auto-transcription)
4. Practice

### Full workflow with Premiere Pro

1. Download video with [yt-dlp](https://github.com/yt-dlp/yt-dlp) in H.264 format
2. Import into Premiere Pro, run auto-transcription
3. Export transcript as JSON
4. Open the player, load both files
5. Arrow keys to navigate, Rec/Shadow to practice, repeat until it clicks

### Hosted version

Open directly at: **[igorswift.github.io/shadowing-player](https://igorswift.github.io/shadowing-player/)**

Files stay on your device — nothing is uploaded anywhere.

## Why this exists

I was using Language Reactor + YouTube for shadowing, but the auto-pause kept cutting phrases in the middle. Tried Premiere Pro — the built-in transcription also chunks by time, not by meaning. So I built this: a player that actually respects sentence boundaries and gives you a proper practice loop with recording, comparison, and progress tracking.

It's one HTML file. No frameworks, no build step, no dependencies. Works on desktop, works on mobile, works offline. That's it.

---

*Built for personal use. If it helps you too — good.*

---

<details>
<summary>🇷🇺 На русском</summary>

# Shadowing Player

Офлайн-инструмент для практики английского методом shadowing. Без аккаунтов, без серверов — просто видео, транскрипт и ты.

## Что делает

Загружаешь видеофайл и JSON-транскрипт. Плеер разбивает на отдельные предложения, проигрывает каждое, ставит на паузу и ждёт пока повторишь. Всё остальное — обвязка вокруг этого цикла.

**Какую проблему решает:** YouTube и Language Reactor режут фразы по таймингу, а не по смыслу. Повторяешь обрубки предложений. Этот плеер использует границы предложений из транскрипта — каждая фраза завершена.

## Как пользоваться

1. Открой `index.html` в браузере
2. Выбери видеофайл (.mp4)
3. Выбери транскрипт (.json из автотранскрибации Premiere Pro)
4. Стрелками переключай фразы, Rec/Shadow для записи голоса

Хостинг: **[igorswift.github.io/shadowing-player](https://igorswift.github.io/shadowing-player/)**

Файлы остаются на устройстве — ничего никуда не загружается.

</details>
