# Shadowing Player

**A practice tool for speaking a foreign language out loud — one that doesn't cut sentences in half.**

### [▶ Try it live](https://igorswift.github.io/shadowing-player/) — 40-second demo, nothing to install

---

## Why this exists

Shadowing is a simple way to practise speaking: you listen to a native speaker and repeat right after them, copying the rhythm and intonation, not just the words.

I was doing this with [Language Reactor](https://www.languagereactor.com/) over YouTube. It's a good tool — for reading subtitles, looking up words, building vocabulary. But it follows subtitle blocks, and subtitles are cut to fit the screen and the timecode, not to contain a finished thought. So the pause would land in the middle of a sentence. I'd repeat a fragment, lose where the sentence was going, and never hear the full intonation curve from start to finish.

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

## You choose who you learn from

Most language apps hand you a voice: a studio narrator reading scripted lines in a deliberately neutral accent. Useful for a while, then it stops resembling anything you'll actually hear in a meeting or a conversation.

Here the source is whatever you load. A YouTuber whose delivery you like. A particular regional accent. A podcast host, an interview, a conference talk, a stand-up set. If you can get the video and a transcript, you can shadow it.

That matters more than it sounds. You're not trying to sound like "an English speaker" in the abstract — you're trying to sound like someone specific. Pick a model close to how you actually want to come across, and the practice transfers much faster.

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

Я занимался так через [Language Reactor](https://www.languagereactor.com/) поверх YouTube. Инструмент неплохой — читать субтитры, смотреть незнакомые слова, набирать лексику. Но он идёт по блокам субтитров, а субтитры нарезаны под экран и таймкод, а не под законченную мысль. Пауза попадала в середину предложения. Повторяешь обрубок, теряешь смысл и никогда не слышишь интонацию целиком — а она живёт как раз на всём предложении: где голос поднимается, где падает в конце.

Попробовал через автотранскрибацию Premiere Pro — там та же беда, режет по времени.

Поэтому написал своё.

## Как работает

Плеер берёт из транскрипта **границы предложений** (флаг `eos`), а не тайминги субтитров. Каждая фраза — законченная мысль с целой интонацией.

```
▶ Играет фраза целиком → ⏸ Автопауза → 🎤 Повторяешь → ⏭ Дальше
```

## За кем повторять — выбираешь сам

Большинство приложений выдают тебе голос: студийный диктор читает заготовленные реплики нарочито нейтральным акцентом. Какое-то время полезно, потом перестаёт напоминать то, что реально услышишь в разговоре.

Здесь источник — что загрузишь, то и будет. Блогер, чья манера тебе нравится. Конкретный региональный акцент. Подкаст, интервью, выступление, стендап. Есть видео и транскрипт — можно отрабатывать.

Это важнее, чем кажется. Ты не учишься говорить «по-английски» вообще — ты учишься звучать как конкретный человек. Чем ближе образец к тому, как ты сам хочешь звучать, тем быстрее переносится.

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

<details>
<summary>🇪🇸 En español</summary>

# Shadowing Player

Herramienta para practicar el habla en un idioma extranjero mediante shadowing — y para grabar vídeos con teleprompter.

**[▶ Probar](https://igorswift.github.io/shadowing-player/)** — demo de 40 segundos, no hay nada que instalar.

## Por qué existe

El shadowing consiste en escuchar a un hablante nativo y repetir justo después, copiando el ritmo y la entonación, no solo las palabras.

Yo lo hacía con [Language Reactor](https://www.languagereactor.com/) sobre YouTube. Es una buena herramienta — para leer subtítulos, consultar palabras, ampliar vocabulario. Pero sigue los bloques de subtítulos, y los subtítulos se cortan para caber en pantalla y encajar con el código de tiempo, no para contener una idea completa. La pausa caía en mitad de la oración. Repetía fragmentos, perdía el hilo y nunca llegaba a escuchar la curva de entonación entera.

Y la entonación es justo lo que importa: vive a lo largo de la oración completa — dónde sube la voz, dónde baja al final. Si la partes por la mitad, estás practicando algo que no significa nada.

Probé con la transcripción automática de Premiere Pro. Mismo problema: también trocea por tiempo.

Así que construí lo que realmente quería.

## Cómo funciona

El reproductor lee de la transcripción los **límites de oración** (la marca `eos`), no los tiempos de los subtítulos. Cada frase es una idea completa, con su entonación intacta.

```
▶ Suena la frase entera → ⏸ Pausa automática → 🎤 La repites → ⏭ Siguiente
```

## Tú eliges a quién imitar

La mayoría de las apps de idiomas te imponen una voz: un locutor de estudio leyendo frases guionizadas con un acento deliberadamente neutro. Sirve un tiempo, y después deja de parecerse a nada de lo que vas a oír en una conversación real.

Aquí la fuente es lo que tú cargues. Un youtuber cuya forma de hablar te guste. Un acento regional concreto. Un podcast, una entrevista, una charla, un monólogo. Si consigues el vídeo y una transcripción, puedes practicarlo.

Esto importa más de lo que parece. No intentas sonar «como alguien que habla inglés» en abstracto — intentas sonar como una persona concreta. Cuanto más se acerque ese modelo a como quieres expresarte tú, antes se traslada a tu forma de hablar.

## Dos formas de usarlo

**1. Aprender a hablar imitando a nativos.** Cargas un vídeo y su transcripción y avanzas oración por oración. Te grabas y comparas tu duración con la del original. Si una frase se te resiste, la bajas a 0.5×; si es demasiado corta para practicarla sola, la unes con la siguiente.

**2. Grabar tu propio vídeo en un idioma que todavía estás aprendiendo.** Es para lo que más lo uso, y resuelve otro problema: quieres publicar un vídeo en inglés, pero no eres nativo y tu pronunciación aún no está ahí.

1. Escribes tu guion en el idioma de destino
2. Se lo haces leer a ElevenLabs con una voz que suena nativa — ya tienes una referencia de tu propio texto, bien pronunciado
3. Cargas ese audio en el reproductor y lo practicas frase por frase hasta que la pronunciación y el ritmo se asienten
4. Lo grabas. Activas **Mirror**: la pantalla se invierte para que el texto se lea correctamente a través del cristal semitransparente del teleprompter, de modo que miras directamente al objetivo. Un mando Bluetooth pasa las frases sin ocupar las manos

Acabas grabando tu propio guion, con tu propia voz, habiendo entrenado antes cómo debería sonar.

## Funciones

- **Split 2/3** y **Lock** — encadena frases para pasajes largos
- **Merge** — agrupa automáticamente las frases muy cortas
- **Ajuste de pausa** de 0 a 350 ms, sobre la marcha
- **Clic en una palabra** — salta a ese momento exacto; **clic derecho** — la pone en MAYÚSCULAS para marcar el acento
- **Rec / Shadow** — graba tu voz, hasta 5 tomas con comparación de duración
- **Mirror + Wake Lock** — modo teleprompter, la pantalla no se apaga
- **Temporizador de 10/15/20 min** e historial diario

Los archivos no salen de tu dispositivo — no hay servidor al que enviarlos.

</details>
