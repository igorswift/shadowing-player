"""Exercise the packaged Android controls in Chrome at phone viewport sizes."""
import pathlib
import subprocess
import tempfile

root = pathlib.Path(__file__).resolve().parent
page = (root / "app/build/generated/player-assets/continuous.html").read_text()
adapter = (root / "app/src/main/assets/android.js").read_text()
bridge = "const calls=[]; window.AndroidPlayer={list:()=> '[]',translate:(text,id)=>calls.push([text,id])};"
test = """
function check(value, message) { if (!value) throw Error(message); }
try {
  check(innerWidth === Number(location.hash.slice(1)), "viewport");
  const el = id => document.getElementById(id);
  sentences = ["one","two","three"].map((text,i)=>({text,start:i*10,end:i*10+8}));
  video = el("video");
  Object.defineProperty(video,"duration",{value:30});
  let position=0, paused=false;
  Object.defineProperty(video,"currentTime",{get:()=>position,set:v=>position=v});
  Object.defineProperty(video,"paused",{get:()=>paused});
  video.pause=()=>paused=true; video.play=()=>{paused=false; return Promise.resolve();};
  el("setup").style.display="none"; el("player").classList.add("active");
  showPhrase(0); translationVisible=true;
  splitCount=2; activateSplit();
  check(document.querySelectorAll(".android-translation").length===2,"split 2");
  splitCount=3; activateSplit();
  for(const [text,id] of calls.slice().reverse()) androidTranslated(id,"RU "+text,"");
  const rows=()=>[...document.querySelectorAll(".android-translation")].map(e=>e.textContent);
  check(rows().join("|")==="RU one|RU two|RU three","split 3 order");
  toggleTranslation(); check(!rows().length,"RU off");
  toggleTranslation(); check(rows().length===3,"RU on");
  document.querySelector(".video-wrap").click(); check(paused,"pause");
  document.querySelector(".video-wrap").click(); check(!paused,"resume");
  video.dispatchEvent(new Event("durationchange"));
  const seek=document.querySelector(".movie-seek");
  for(const target of [25,1,30,0]){
    seek.value=target; seek.dispatchEvent(new Event("input")); check(position===target,"seek");
  }
  for(const id of ["loopBtn","recBtn","mirrorBtn","shadowBtn","sessionRecs","cdFill"]){
    check(!el(id).getClientRects().length,"hidden "+id);
  }
  for(const b of document.querySelectorAll(".controls button,.session-bar button")){
    const r=b.getBoundingClientRect(); check(r.left>=0 && r.right<=innerWidth+1 && r.bottom<=innerHeight+1,"bounds "+b.textContent);
  }
  const tops=[...document.querySelectorAll(".ctrl-icon")].map(e=>e.getBoundingClientRect().top);
  check(Math.max(...tops)-Math.min(...tops)<1,"alignment");
  parent.postMessage("passed","*");
} catch(e){parent.postMessage("error "+e.message,"*")}
"""
with tempfile.TemporaryDirectory() as tmp:
    path = pathlib.Path(tmp)/"test.html"
    page = page.replace("</body>", "<script>"+bridge+"</script><script>"+adapter+"</script><script>"+test+"</script></body>")
    path.write_text(page)
    for width,height in [(360,800),(412,915),(915,412)]:
        harness = pathlib.Path(tmp)/"viewport.html"
        harness.write_text(f'<script>onmessage=e=>document.body.dataset.testResult=e.data</script><body><iframe style="border:0;width:{width}px;height:{height}px" src="test.html#{width}"></iframe>')
        result = subprocess.run(["google-chrome","--headless","--no-sandbox","--disable-gpu","--hide-scrollbars",
                                 f"--window-size={width},{height}","--allow-file-access-from-files","--virtual-time-budget=5000","--host-resolver-rules=MAP * ~NOTFOUND","--dump-dom",harness.as_uri()],
                                capture_output=True, text=True, timeout=45)
        if 'data-test-result="passed"' not in result.stdout:
            import re
            raise RuntimeError(str((width,height,re.findall(r'<body[^>]*>',result.stdout),result.stderr[-300:])))
        print(f"Passed {width}x{height}")
