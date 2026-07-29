# Shadowing Player

**A practice tool for speaking a foreign language out loud — one that doesn't cut sentences in half.**

### [▶ Try it live](https://igorswift.github.io/shadowing-player/) — 40-second demo, nothing to install

---

## Why this exists

Shadowing is a simple way to practise speaking: you listen to a native speaker and repeat right after them, copying the rhythm and intonation, not just the words.

I was doing this with a browser extension over YouTube. The problem showed up immediately. Those tools follow subtitle blocks, and subtitles are cut to fit the screen and the timecode — not to fit a thought. So the pause would land in the middle of a sentence. I'd repeat a fragment, lose where the sentence was going, and never hear the full intonation curve from start to finish.

Intonation is the whole point. It lives across a complete sentence — where the voice rises, where it drops at the end. Cut that in half and you're drilling nonsense.

I tried Premiere Pro's built-in transcription instead. Same problem: it also chunks by time.

So I built the thing I actually wanted.

## What it does differently

It reads **sentence boundaries** from the transcript, not subtitle timings. Premiere's auto-transcription marks the end of every sentence, and the player splits on that.

The result is a simple loop:

```
▶ One full sentence plays  →  ⏸ Auto-pause  →  🎤 You repeat it  →  ⏭ Next
```

Every phrase you repeat is a complete thought, with its intonation intact.

---

## Two ways to use it

### 1. Learn to speak by copying native speakers

Load a video of someone speaking, load the transcript, and work through it sentence by sentence. Record yourself and compare your timing against the original. If a sentence is too long, slow it to 0.5×. If it's too short to be useful on its own, merge it with the next one.

### 2. Record your own video in a language you're still learning

This is the part I use most, and it solves a different problem: you want to publish a video in English, but you're not a native speaker and your pronunciation isn't there yet.

The workflow:

1. **Write your script** in the target language.
2. **Have ElevenLabs read it** in a native-sounding voice. Now you have a reference recording of your own words, spoken correctly.
3. **Load that audio into the player** and practise it phrase by phrase until the pronunciation and rhythm stick.
4. **Film it.** Turn on **Mirror mode** — it flips the screen so the text reads correctly through a beam-splitter teleprompter, letting you look straight into the lens. A Bluetooth remote moves you through the phrases hands-free.

You end up recording your own script, in your own voice, having already trained on how it should sound.

---

## Features

### Working through phrases

| | |
|---|---|
| **Auto-pause** | Stops at the end of each sentence, never mid-phrase |
| **Buffer tuner** | Fine-tune where the pause lands: 0–350 ms |
| **Split: 2 / 3** | Chain two or three sentences into one continuous run |
| **Split Lock** | Keeps that grouping as you move through the whole transcript |
| **Merge** | Auto-groups very short phrases into workable blocks |
| **Click a word** | Jumps playback to that exact moment |
| **Right-click a word** | Marks it in CAPS, so you can see where to put the stress |
| **Speed** | 0.5× / 0.75× / 1×, or a continuous slider in Record mode |

### Recording your voice

| | |
|---|---|
| **Rec** | Listen, countdown, record, play back. Your duration vs the original |
| **Shadow** | Records you while the phrase plays. Mix layers both together |
| **5 takes per phrase** | Colour-coded timing difference, so you can see yourself improving |
| **Loop** | Repeats a phrase three times automatically |

### Filming with a teleprompter

| | |
|---|---|
| **Mirror** | Flips the interface for beam-splitter teleprompters |
| **Wake Lock** | Screen never dims in the middle of a take |
| **Bluetooth remote** | Standard remotes just work — arrows to move, space to pause |
| **Record mode** | Hides recording controls, adds a fine speed slider |

### Keeping the habit

| | |
|---|---|
| **Practice timer** | 10 / 15 / 20 minutes, with a chime at the end |
| **History** | Daily totals with ↑↓ trends, stored locally |
| **Session bar** | Time, phrases covered, takes recorded |

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `←` `→` | Previous / next phrase |
| `↑` `↓` | Replay current phrase |
| `Space` | Pause / play |
| `F` | Cycle Split (off → 2 → 3) |
| `R` | Record |
| `W` | Shadow mode |
| `S` | Cycle speed |
| `L` | Loop |
| `M` | Merge |
| `P` | Mirror |
| `T` | Translation |

Bluetooth presenter remotes send these same key events, so they work without any setup.

---

## Getting started

**Just looking?** Open the [live version](https://igorswift.github.io/shadowing-player/) and press **Try it now**. A sample clip loads instantly.

**Using your own material?** You need two files: a video or audio file, and a transcript in Premiere Pro's JSON format.

1. Download a video — `yt-dlp -f "bv[vcodec^=avc1]+ba" URL`
2. Import into Premiere Pro, run auto-transcription
3. Export the transcript as JSON
4. In the player, expand **Load my own video + transcript** and pick both files

Everything runs in the browser. Your files never leave your device — there's no server to send them to.

**Offline:** save `index.html` anywhere and open it in a browser. It works with no connection at all. (The bundled demo needs `http(s)`, since browsers block loading files from local disk — but your own files work either way.)

---

## Transcript format

```json
{
  "credit": "Optional attribution, shown under the phrase",
  "translations": ["First sentence translated.", "Second one."],
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

`eos: true` marks the end of a sentence — that's the flag everything is built on. Word-level `start` and `duration` power click-to-seek. `translations` and `credit` are optional and aren't produced by Premiere; add them by hand if you want them.

---

## Tech

Vanilla JavaScript, zero dependencies. No npm, no CDN, no build step. Markup, styles and logic live in one `index.html`.

- **MediaRecorder API** — voice capture
- **Web Audio API** — layering your take over the original, timer chimes
- **Wake Lock API** — keeps the screen on while filming
- **localStorage** — practice history
- **requestAnimationFrame** — auto-pause timing

### A problem worth mentioning

Auto-pause was clipping the start of the next phrase on Android, while behaving perfectly on desktop.

The cause: mobile Chrome fires `requestAnimationFrame` less precisely, so a fixed lookahead that was accurate at 120 ms simply arrived too late. Making the buffer device-aware fixed it — 120 ms on desktop, 220 ms on mobile.

But the right value also depends on the speaker: some leave a clear beat between sentences, others run straight on. So it became a control you can adjust while practising, rather than a constant buried in the code.

---

## Demo clip

The `demo/` folder holds the sample used by the **Try it now** button.

Source: [VOA Learning English](https://learningenglish.voanews.com/) — public domain.

---

Built by **[Igor Triandafilov](https://www.linkedin.com/in/igor-triandafilov)** — originally to learn English and film my own videos. If it's useful to you too, good.

---

<details>
<summary>🇷🇺 На русском</summary>

# Shadowing Player

Тренажёр для практики речи на иностранном языке методом shadowing — и для записи видео через телепромптер.

**[▶ Попробовать](https://igorswift.github.io/shadowing-player/)** — демо на 40 секунд, ставить ничего не нужно.

## Зачем

Shadowing — это когда слушаешь носителя и повторяешь сразу за ним, копируя ритм и интонацию.

Я занимался так через браузерное расширение поверх YouTube, и проблема вылезла сразу. Такие инструменты идут по блокам субтитров, а субтитры нарезаны под экран и таймкод, а не под законченную мысль. Пауза попадала в середину предложения. Повторяешь обрубок, теряешь смысл и никогда не слышишь интонацию целиком — а она живёт как раз на всём предложении: где голос поднимается, где падает в конце.

Попробовал через автотранскрибацию Premiere Pro — там та же беда, режет по времени.

Поэтому написал своё.

## Как работает

Плеер берёт из транскрипта **границы предложений** (флаг `eos`), а не тайминги субтитров. Каждая фраза — законченная мысль с целой интонацией.

```
▶ Играет фраза целиком → ⏸ Автопауза → 🎤 Повторяешь → ⏭ Дальше
```

## Два сценария

**1. Учиться говорить за носителем.** Загружаешь видео и транскрипт, идёшь по предложениям. Записываешь себя, сравниваешь тайминг с оригиналом. Сложную фразу замедляешь до 0.5×, короткие склеиваешь.

**2. Записывать своё видео на иностранном языке.** Это то, ради чего я в основном им пользуюсь:

1. Пишешь сценарий на нужном языке
2. Озвучиваешь его в ElevenLabs голосом носителя — получается эталон твоего же текста
3. Загружаешь эту озвучку в плеер и отрабатываешь по фразам, пока произношение не ляжет
4. Снимаешь. Включаешь **Mirror** — экран переворачивается, и текст читается правильно через телепромптер с полупрозрачным зеркалом, то есть смотришь прямо в объектив. Bluetooth-пульт листает фразы, руки свободны

## Возможности

- **Split 2/3** и **Lock** — склейка фраз для длинных пассажей
- **Merge** — автообъединение коротких фраз
- **Буфер паузы** 0–350 мс — подстройка на ходу
- **Клик по слову** — перемотка, **правый клик** — ЗАГЛАВНЫЕ для акцента
- **Rec / Shadow** — запись голоса, до 5 дублей со сравнением
- **Mirror + Wake Lock** — режим телепромптера
- **Таймер 10/15/20 мин** и история по дням

Файлы остаются на устройстве — отправлять их некуда, сервера нет.

</details>
