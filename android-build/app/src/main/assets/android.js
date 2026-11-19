(() => {
  if (window.androidGoHome) return;
  const $ = id => document.getElementById(id);
  let currentMedia = null;
  let translationRequest = 0;

  const originalParse = parseTranscript;
  parseTranscript = function(data) {
    const result = originalParse(data);
    for (const phrase of result) {
      if (!Number.isFinite(phrase.start) || !Number.isFinite(phrase.end) || phrase.start < 0 || phrase.end < phrase.start)
        throw new Error("Invalid transcript timestamps");
    }
    return result;
  };

  const style = document.createElement("style");
  style.textContent = `
    .android-library { width:min(100%,560px); display:grid; gap:10px; }
    .android-library-row { display:flex; gap:8px; border:1px solid var(--surface2); border-radius:12px; padding:10px; }
    .android-library-item { flex:1; min-width:0; border:0; background:none; color:var(--text); text-align:left; font:inherit; overflow-wrap:anywhere; }
    .android-library-item small { display:block; color:var(--accent); margin-top:5px; }
    .android-library-row button:last-child { color:var(--text-dim); }
    .android-add { width:100%; padding:14px; border:0; border-radius:12px; background:var(--accent); color:var(--bg); font:inherit; font-weight:bold; }
    .android-add:disabled { opacity:.4; }
    .setup-screen { justify-content:flex-start; }
    #androidStatus { color:var(--accent); }
  `;
  document.head.append(style);
  const setup = $("setup");
  const library = document.createElement("section");
  library.className = "android-library";
  function button(label, action) {
    const element = document.createElement("button");
    element.className = "android-add";
    element.textContent = label;
    element.onclick = action;
    return element;
  }
  const media = button("Выбрать видео или аудио", () => AndroidPlayer.chooseVideo());
  const json = button("Выбрать JSON", () => AndroidPlayer.chooseJson());
  const open = button("Открыть в плеере", () => {
    const id = AndroidPlayer.openSelected();
    if (id) androidLibraryChanged(id);
    else androidError("Не удалось открыть выбранные файлы.");
  });
  open.disabled = true;
  function selected(element, name) {
    element.dataset.selected = "1";
    element.textContent = (element === media ? "Видео / аудио · " : "JSON · ") + name;
    open.disabled = !(media.dataset.selected && json.dataset.selected);
  }
  window.androidVideoChosen = name => selected(media, name);
  window.androidJsonChosen = name => selected(json, name);
  const status = document.createElement("p");
  status.id = "androidStatus";
  const list = document.createElement("div");
  list.className = "android-library";
  library.append(media, json, open, status, list);
  setup.insertBefore(library, $("demoBtn"));
  document.querySelectorAll(".own-files,.setup-divider,.own-files-toggle").forEach(el => el.style.display = "none");
  $("demoBtn").remove();
  document.querySelector(".demo-hint")?.remove();
  $("videoPicker").style.display = "none";
  $("jsonPicker").style.display = "none";
  $("videoInput").style.display = "none";
  $("jsonInput").style.display = "none";
  $("startBtn").style.display = "none";
  const home = document.createElement("button");
  home.className = "session-history-btn";
  home.textContent = "Library";
  home.onclick = event => { event.stopPropagation(); androidGoHome(); };
  document.querySelector(".session-bar").append(home);

  const format = seconds => Math.floor(seconds/60) + ":" + String(Math.floor(seconds%60)).padStart(2,"0");
  const settingsKey = id => "android-player:" + id;
  function loadSettings(id) {
    try { return JSON.parse(localStorage.getItem(settingsKey(id)) || "{}"); }
    catch { return {}; }
  }
  function renderLibrary() {
    list.replaceChildren();
    for (const entry of JSON.parse(AndroidPlayer.list())) {
      const row = document.createElement("div");
      row.className = "android-library-row";
      const open = document.createElement("button");
      open.className = "android-library-item";
      open.textContent = entry.name;
      const label = document.createElement("small");
      const saved = loadSettings(entry.id);
      label.textContent = saved.position > 0 ? "Continue at " + format(saved.position) : "Start watching";
      open.append(label);
      open.onclick = () => openEntry(entry);
      const remove = document.createElement("button");
      remove.className = "tool-btn";
      remove.textContent = "Remove";
      remove.onclick = () => { AndroidPlayer.remove(entry.id); renderLibrary(); };
      row.append(open, remove);
      list.append(row);
    }
  }
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.hidden = true;
  setup.append(fileInput);
  function openEntry(entry) {
    if (!AndroidPlayer.preparePlayback(entry.id)) {
      androidError("Нет доступа к файлу «" + entry.name + "». Выберите его снова в этом профиле Android.");
      return;
    }
    fileInput.value = "";
    fileInput.onchange = () => {
      const file = fileInput.files[0];
      if (file && file.size > 0) playDocument(entry, file);
      else androidError("Android вернул пустой файл.");
    };
    fileInput.click();
  }
  function playDocument(entry, file) {
    try {
      const data = JSON.parse(AndroidPlayer.transcript(entry.id));
      sentences = parseTranscript(data);
      if (!sentences.length) throw new Error("No phrases found in JSON");
      rawJsonData = data;
      currentMedia = entry;
      videoFile = file;
      const saved = loadSettings(entry.id);
      if (Number.isInteger(saved.speed) && saved.speed >= 0 && saved.speed < speeds.length) speedIndex = saved.speed;
      textVisible = saved.textVisible !== false;
      translationVisible = !!saved.translationVisible;
      startPlayer();
      $("speedBtn").textContent = speeds[speedIndex] + "x";
      $("ruBtn").style.display = "";
      video.addEventListener("loadedmetadata", () => {
        if (saved.position > 0 && saved.position < video.duration) {
          video.currentTime = saved.position;
          syncWatchPhrase();
        }
      }, {once:true});
      video.addEventListener("timeupdate", androidSaveProgress);
      video.addEventListener("pause", androidSaveProgress);
      video.addEventListener("seeked", androidSaveProgress);
      video.addEventListener("ratechange", androidSaveProgress);
      video.addEventListener("error", () => alert("Не удалось воспроизвести «" + file.name + "». Код " + video.error?.code + ". " + (video.error?.message || "")));
    } catch (error) { androidError(error.message); }
  }
  window.androidSaveProgress = function() {
    if (!currentMedia || !video || !Number.isFinite(video.currentTime)) return;
    localStorage.setItem(settingsKey(currentMedia.id), JSON.stringify({
      position:video.ended ? 0 : video.currentTime, speed:speedIndex, textVisible, translationVisible
    }));
  };
  window.androidGoHome = function() {
    androidSaveProgress();
    if (video) video.pause();
    location.reload();
  };
  window.androidError = message => { status.textContent = message; };
  window.androidLibraryChanged = id => {
    renderLibrary();
    const entry = JSON.parse(AndroidPlayer.list()).find(row => row.id === id);
    if (entry) {
      delete media.dataset.selected;
      delete json.dataset.selected;
      media.textContent = "Выбрать видео или аудио";
      json.textContent = "Выбрать JSON";
      open.disabled = true;
      openEntry(entry);
    }
  };
  const mobileStyle = document.createElement("style");
  mobileStyle.textContent = `
    #loopBtn,#recBtn,#shadowBtn,#mirrorBtn,#toolbarRecord,#takesArea,.countdown-presets,
    .cd-progress,#cdDisplay,.session-stat:has(#sessionRecs),#progressBar { display:none!important }
    .countdown-bar { display:contents }
    .session-bar { flex-wrap:wrap; gap:5px; padding:6px 10px }
    .session-left { gap:6px } .session-history-btn { color:#bcc2d0 }
    @media(max-width:500px){.session-today{display:none}}
    .controls { padding:6px 6px max(8px,env(safe-area-inset-bottom)); }
    .controls .ctrl-btn { min-width:0; min-height:48px; display:grid; grid-template-rows:23px 14px;
      justify-items:center; align-content:center; align-items:center; gap:3px; padding:6px 0; font-size:11px; line-height:14px }
    .controls .ctrl-icon { display:grid; place-items:center; width:100%; height:23px; font:18px/1 sans-serif }
    .android-translation { color:#d4f4e6; font-size:clamp(16px,4vw,20px); line-height:1.45; margin:4px 0 10px; }
    .tap-feedback { position:absolute; inset:50% auto auto 50%; transform:translate(-50%,-50%); pointer-events:none;
      border-radius:50%; background:#10131bd9; color:white; width:48px; height:48px; display:grid; place-items:center; opacity:0 }
    .video-wrap { touch-action:manipulation }
    .movie-seek { width:100%; height:36px; flex:none; margin:0; touch-action:none; accent-color:var(--accent); cursor:pointer }
    @media(max-height:480px){.video-wrap video{max-height:22dvh}.controls{padding-block:2px}.toolbar{padding-block:2px}}
  `;
  document.head.append(mobileStyle);
  $("toolbarPractice").append($("bufferBtn"));
  const wrap = document.querySelector(".video-wrap");
  const feedback = document.createElement("span");
  feedback.className = "tap-feedback";
  feedback.setAttribute("aria-hidden","true");
  wrap.append(feedback);
  wrap.onclick = () => {
    if (!video) return;
    const resume = video.paused;
    if (resume) isPausedByUser = true;
    togglePause();
    feedback.textContent = resume ? "▶" : "Ⅱ";
    feedback.getAnimations().forEach(animation => animation.cancel());
    feedback.animate([{opacity:0.95,scale:"0.94"},{opacity:0,scale:"1.05"}],
      {duration:matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 320});
  };
  const seek = document.createElement("input");
  seek.type = "range";
  seek.className = "movie-seek";
  seek.setAttribute("aria-label","Позиция в фильме");
  seek.min = "0"; seek.step = "any"; seek.value = "0"; seek.disabled = true;
  $("progressBar").after(seek);
  const movie = $("video");
  function syncTimeline() {
    seek.disabled = !(Number.isFinite(movie.duration) && movie.duration > 0);
    if (!seek.disabled) { seek.max = movie.duration; seek.value = movie.currentTime; }
  }
  let dragging = false;
  for (const name of ["durationchange","timeupdate","seeked"]) {
    movie.addEventListener(name, () => { if (!dragging) syncTimeline(); });
  }
  seek.onpointerdown = () => { dragging = true; };
  for (const name of ["pointerup","pointercancel","lostpointercapture"]) {
    seek.addEventListener(name, () => { dragging = false; });
  }
  seek.oninput = () => {
    if (seek.disabled) return;
    movie.currentTime = Number(seek.value);
    syncWatchPhrase();
  };
  const pending = new Map();
  const tokens = new Map();
  function attachTranslation(after, phrase) {
    const node = document.createElement("div");
    node.className = "android-translation";
    after.after(node);
    if (phrase.translation) { node.textContent = phrase.translation; return; }
    node.textContent = "Перевод…";
    const existing = pending.get(phrase);
    if (existing) { existing.node = node; return; }
    const token = String(++translationRequest);
    const request = {phrase, node};
    pending.set(phrase, request);
    tokens.set(token, request);
    AndroidPlayer.translate(phrase.text, token);
  }
  function renderTranslations() {
    document.querySelectorAll(".android-translation").forEach(node => node.remove());
    $("phraseTranslation").style.display = "none";
    $("ruBtn").classList.toggle("accent-btn", translationVisible);
    if (!translationVisible || !sentences[currentIndex]) return;
    attachTranslation($("phraseText"), sentences[currentIndex]);
    if (splitMode) {
      for (const block of $("splitNext").querySelectorAll("[data-split-index]")) {
        attachTranslation(block, sentences[Number(block.dataset.splitIndex)]);
      }
    }
  }
  window.androidTranslated = (token, russian, error) => {
    const request = tokens.get(String(token));
    if (!request) return;
    tokens.delete(String(token));
    pending.delete(request.phrase);
    if (russian) request.phrase.translation = russian;
    request.node.textContent = russian || error || "Перевод недоступен";
  };
  const updateAfter = action => (...args) => { action(...args); renderTranslations(); };
  activateSplit = updateAfter(activateSplit);
  deactivateSplit = updateAfter(deactivateSplit);
  showPhrase = updateAfter(showPhrase);
  toggleTranslation = updateAfter(() => { translationVisible = !translationVisible; androidSaveProgress(); });
  renderLibrary();
})();
