/* Player: video stage, reserve queue, score pop-up, full screen. */
function setStage(){const st=$("stage");st.classList.remove("on");void st.offsetWidth;st.classList.add("on");const vw=$("vw");vw.innerHTML="";const o=S.ov[S.now]||{};
  if(S.now===null){const d=document.createElement("div");d.className="idle";const i=new Image();i.src="images/logo-512.png";i.alt="Videoke Nights";d.append(i);vw.append(d)}
  parseNow();el=0;run=S.now!==null;$("lt").value=o.lyrics||"";lyrStatus="";drawLyr();if(S.now!==null&&(!o.lyrics||o.auto))sharedOrAuto(S.now);drawVersion();loadAudio(S.now)}
function render(){const s=S.now===null?null:byId(S.now);
  $("info").textContent=s?"Now singing: "+s.title+" — "+s.artist:"";$("lcd").textContent=s?String(s.id):"-----";$("eq").hidden=!s;
  const q=s?encodeURIComponent(s.title+" "+s.artist):"";$("srcs").style.display=s?"flex":"none";if(s){$("lnkA").href="https://music.apple.com/search?term="+q;$("lnkZ").href="https://www.amazon.com/s?k="+q+"&i=digital-music";$("lnkK").href="https://www.google.com/search?q="+q+"+site%3Akaraoke-version.com";}
  const m=$("ytm");if(s)m.href="https://www.youtube.com/results?search_query="+encodeURIComponent(s.title+" "+s.artist+" minus one instrumental karaoke");
  const ul=$("queue");ul.innerHTML="";if(!S.queue.length)ul.innerHTML='<li class="empty">No songs reserved.</li>';
  S.queue.forEach((id,i)=>{const t=byId(id),li=document.createElement("li"),sp=document.createElement("span");sp.textContent=(i+1)+". "+t.title;
    const x=document.createElement("button");x.className="btn alt sm";x.textContent="✕";x.setAttribute("aria-label","Remove");x.onclick=()=>{S.queue.splice(i,1);save();render()};li.append(sp,x);ul.append(li)})}
function reserve(id){if(!byId(id))return false;if(S.now===null){S.now=id;save();setStage()}else{S.queue.push(id);save()}render();return true}
function score(){const v=70+Math.floor(Math.random()*31),m=v>=95?"Wow, perfect!":v>=85?"Galing!":v>=75?"Magaling!":"Keep singing!",t=$("toast");
  t.textContent="Score: "+v+"\n"+m;t.style.whiteSpace="pre-line";confetti(t);sfxScore(v);t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3200)}
$("skip").onclick=()=>{const had=S.now!==null;S.now=S.queue.length?S.queue.shift():null;save();setStage();render();if(had)score()};
$("fs").onclick=()=>{const t=$("tv");try{(t.requestFullscreen||t.webkitRequestFullscreen).call(t)}catch(e){}};
$("rsv").onclick=()=>{if(reserve(+$("code").value))$("code").value="";else alert("Song number not found.")};
$("code").onkeydown=e=>{if(e.key==="Enter")$("rsv").click()};

/* Little burst of emoji around the score */
function confetti(){}   /* kept simple: the score pop-up is enough */

/* Lyrics for the current song: 1) your own saved/edited lyrics, 2) a .lrc file in the song's folder (songs/<number>-<title>/),
   3) the online service. The online service can have several versions; use "Next version" until one lines up. */
let cands = [], cidx = 0;
function applyLyrics(id, text, auto) {
  S.ov[id] = Object.assign(S.ov[id] || {}, { lyrics: text, auto }); save(); lyrStatus = ""; parseNow(); el = 0; $("lt").value = text; lastKey = ""; drawLyr(); drawVersion();
}
function drawVersion() {
  const c = cands[cidx];
  $("lver").textContent = c ? "Lyrics version " + (cidx + 1) + " of " + cands.length + (c.synced ? " (timed)" : " (not timed)") + (c.dur ? " · " + Math.floor(c.dur / 60) + ":" + String(Math.round(c.dur % 60)).padStart(2, "0") : "") + " · " + c.title : "Lyrics version: none loaded";
  $("lvp").disabled = $("lvn").disabled = cands.length < 2;
  const o = soff(); $("soff").textContent = "Timing for this song: " + (o > 0 ? "+" : "") + o.toFixed(1) + " s";
}
async function sharedOrAuto(id) {
  const o = S.ov[id] || {}; let txt = null;
  try { const r = await fetch(lyricsPathOf(id)); if (r.ok) txt = await r.text(); } catch (e) {}   // only works when the site is hosted online
  if (S.now !== id) return;
  if (txt && txt.trim()) { cands = []; applyLyrics(id, txt, false); $("lver").textContent = "Lyrics from this song's folder"; return; }
  if (!o.lyrics && S.set.auto) autoLyrics(id);
}
async function autoLyrics(id) {
  const s = byId(id); lyrStatus = "Looking for lyrics…"; drawLyr();
  try {
    const list = await fetchLyricList(s, typeof audioDuration === "function" ? audioDuration() : 0); if (S.now !== id) return;
    cands = list; cidx = 0;
    if (list.length) applyLyrics(id, list[0].text, true);
    else { lyrStatus = "No lyrics found for this song. You can paste your own in the box below."; drawLyr(); drawVersion(); }
  } catch (e) { if (S.now !== id) return; lyrStatus = "Couldn’t reach the lyrics service. Check your internet, or paste lyrics yourself."; drawLyr(); }
}
const stepVersion = d => { if (cands.length < 2 || S.now === null) return; cidx = (cidx + d + cands.length) % cands.length; applyLyrics(S.now, cands[cidx].text, true); };
$("lvp").onclick = () => stepVersion(-1); $("lvn").onclick = () => stepVersion(1);
const nudge = d => { if (S.now === null) return; const o = S.ov[S.now] = Object.assign(S.ov[S.now] || {}, {}); o.off = d === 0 ? 0 : Math.round(((o.off || 0) + d) * 10) / 10; save(); lastKey = ""; drawLyr(); drawVersion(); };
document.querySelectorAll("[data-nudge]").forEach(b => b.onclick = () => nudge(+b.dataset.nudge));
$("fl").onclick=()=>{if(S.now!==null)autoLyrics(S.now);else alert("Reserve a song first.")};
