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
  function translateCurrent() {
    if (!translationVisible || !sentences[currentIndex]) return;
    const phrase = sentences[currentIndex];
    const display = $("phraseTranslation");
    if (phrase.translation) {
      display.textContent = phrase.translation;
      display.style.display = "";
      return;
    }
    translationRequest++;
    const token = translationRequest + ":" + currentIndex;
    display.textContent = "Translating… First use downloads the language model.";
    display.style.display = "";
    AndroidPlayer.translate(phrase.text, token);
  }
  window.androidTranslated = (token, russian, error) => {
    if (token !== translationRequest + ":" + currentIndex || !translationVisible) return;
    if (russian) sentences[currentIndex].translation = russian;
    $("phraseTranslation").textContent = russian || error;
    $("phraseTranslation").style.display = "";
  };
  const originalShowPhrase = showPhrase;
  showPhrase = index => { originalShowPhrase(index); translateCurrent(); };
  const originalToggleTranslation = toggleTranslation;
  toggleTranslation = () => { originalToggleTranslation(); translateCurrent(); androidSaveProgress(); };
  renderLibrary();
})();
