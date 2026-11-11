/* Your own audio: pick an audio file for a song (for example a minus-one track you have the right to use).
   It is saved on this device (IndexedDB), plays with the lyrics, and keeps the lyrics in sync with the audio. */
const A = { el: new Audio(), url: null, has: false, shared: false, pending: false };
A.main = A.el; A.el = null;                            // one audio player is reused for every song (browsers then keep allowing sound)
A.main.preload = "auto";
const audioDuration = () => (A.el && isFinite(A.el.duration) ? A.el.duration : 0);
let skew = 0;                                           // manual lyric nudge (◀ Line / Line ▶) while audio plays

function db() { return new Promise((ok, no) => { const r = indexedDB.open("vk-audio", 1); r.onupgradeneeded = () => r.result.createObjectStore("f"); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); }); }
async function dbDo(mode, fn) { const d = await db(); return new Promise((ok, no) => { const t = d.transaction("f", mode), q = fn(t.objectStore("f")); t.oncomplete = () => ok(q && q.result); t.onerror = () => no(t.error); }); }
const audioGet = id => dbDo("readonly", s => s.get(id)).catch(() => null);
const audioPut = (id, blob) => dbDo("readwrite", s => s.put(blob, id));
const audioDel = id => dbDo("readwrite", s => s.delete(id));

function stopAudio() {
  if (A.el) { A.el.pause(); if (A.el === BG.el) { BG.el.onplay = BG.el.onpause = BG.el.onended = BG.el.onloadedmetadata = null; } else { A.el.onplay = A.el.onpause = A.el.onended = A.el.onloadedmetadata = null; A.el.removeAttribute("src"); } }
  if (A.url && A.url.startsWith("blob:")) URL.revokeObjectURL(A.url);
  A.el = A.url = null; A.has = false; A.pending = false; BG.drives = false; $("addaudio").textContent = "Add audio file"; $("pp").classList.remove("attn");
}
function audioTime() { return A.has && A.el && !A.el.paused ? A.el.currentTime : null; }

/* Starts playback. Browsers (especially phones) refuse to play sound until you touch the page: if that happens,
   say so, and start the audio on the next tap anywhere. */
function startPlayback(a) {
  const p = a.play();
  if (p && p.catch) p.catch(e => {
    if (A.el !== a) return;
    if (e && e.name === "NotAllowedError") { A.pending = true; $("info").textContent = "Audio is ready. Tap anywhere, or press Play / Pause, to start."; $("pp").classList.add("attn"); }
    else if (e && e.name !== "AbortError") $("astat").textContent = "This audio file can't be played (" + e.name + "). Your browser may not support its format: convert it to MP3 or M4A and add it again.";
  });
}
document.addEventListener("pointerdown", e => {
  if (!A.pending || !A.el || e.target.closest("#pp")) return;
  A.pending = false; $("pp").classList.remove("attn"); startPlayback(A.el);
}, true);

async function loadAudio(id) {
  stopAudio(); skew = 0; if (id === null) { BG.songSrc = null; $("astat").textContent = ""; return; }
  const blob = await audioGet(id), shared = blob ? null : await findSongFile(id, "audio"), vblob = await audioGet("vid" + id), vpath = vblob ? URL.createObjectURL(vblob) : await findSongFile(id, "video");
  if (S.now !== id) return;
  const hasAudio = !!(blob || shared);
  $("astat").textContent = hasAudio ? (blob ? "Audio: added on this device." : "Audio: found " + shared.split("/").pop() + " in the song's folder.")
    : vpath ? "Video with its own sound: " + (vblob ? "added on this device." : "found " + vpath.split("/").pop() + ".") : "No playable audio found for this song. Press “Add audio file”, or put a file named audio.mp3 in the folder " + songDir(id) + ". If you did add one, your browser may not support its format: convert it to MP3 or M4A.";
  if (BG.songBlobUrl) URL.revokeObjectURL(BG.songBlobUrl); BG.songBlobUrl = vblob ? vpath : null;
  BG.songSrc = vpath; BG.songMuted = hasAudio; BG.drives = !!vpath && !hasAudio;         // a video with its own sound drives the lyrics
  if (!hasAudio && !vpath) return;
  let a;
  if (hasAudio) {
    A.url = blob ? URL.createObjectURL(blob) : shared; A.shared = !blob; $("addaudio").textContent = "Change audio file";
    a = A.main; a.src = A.url;                                                            // no player on screen: the audio plays in the background
  } else { a = BG.el; A.url = null; A.shared = true; bgSync(); a.currentTime = 0; }     // the song's video plays with its own sound
  A.has = true; A.el = a; $("vw").innerHTML = "";
  if (!A.shared || location.protocol !== "file:") await hookAudio(a);                    // (file:// media is never routed through the analyser)
  if (S.now !== id || A.el !== a) return;
  a.onerror = () => { if (A.el !== a) return; const c = a.error ? a.error.code : 0; $("astat").textContent = "This audio file can't be played: " + (c === 4 ? "your browser does not support its format. Convert it to MP3 or M4A." : c === 3 ? "the file looks damaged." : c === 2 ? "the file could not be loaded (check its name and folder)." : "unknown error."); };
  a.onloadedmetadata = () => { if ((S.ov[id] || {}).auto && S.now === id) autoLyrics(id); };   // pick the lyric version that matches this recording
  a.onplay = () => { run = true; A.pending = false; $("pp").classList.remove("attn"); }; a.onpause = () => { if (!a.ended) run = false; }; a.onended = () => $("skip").click();
  el = 0; lastKey = ""; run = false; startPlayback(a);
}
const pickAudio = async e => {
  const f = e.target.files[0]; if (!f) return;
  if (S.now === null) { alert("Reserve a song first, then choose its audio file."); e.target.value = ""; return; }
  await audioPut(S.now, f); e.target.value = ""; loadAudio(S.now);
};
$("af").onchange = $("af2").onchange = pickAudio;
$("addaudio").onclick = () => { if (S.now === null) { alert("Reserve a song first, then add its audio."); return; } $("af2").click(); };
$("afx").onclick = async () => { if (S.now === null) return; await audioDel(S.now); stopAudio(); setStage(); };
$("pp").addEventListener("click", () => { if (A.has && A.el) { if (run) { A.pending = false; $("pp").classList.remove("attn"); startPlayback(A.el); } else A.el.pause(); } });
$("rs").addEventListener("click", () => { if (A.has && A.el) { A.el.currentTime = 0; skew = 0; A.el.play().catch(() => {}); } });

/* Sound check: plays a test beep and shows what the audio player is doing, so a silent song can be diagnosed */
function toneUrl() {
  const sr = 22050, n = Math.floor(sr * 0.9), buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf), w = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.sin(2 * Math.PI * 440 * i / sr) * 0.5 * Math.min(1, i / 800, (n - i) / 2000) * 32767, true);
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}
const MEDIA_ERR = ["none", "aborted", "network problem", "damaged file", "format not supported"];
function soundReport(first) {
  const a = A.el || A.main;
  return [first, "Song audio: " + (A.has ? "loaded" : "none") + (A.url ? (A.url.startsWith("blob:") ? " (added on this device)" : " (" + A.url + ")") : ""),
    "Player: " + (a.paused ? "paused" : "playing") + ", " + a.currentTime.toFixed(1) + " s of " + (isFinite(a.duration) ? a.duration.toFixed(1) : "?") + " s",
    "Volume " + Math.round(a.volume * 100) + "%, muted: " + (a.muted ? "yes" : "no"),
    "Ready state " + a.readyState + ", error: " + (a.error ? MEDIA_ERR[a.error.code] || a.error.code : "none"),
    "Visualizer routing: " + (a._an ? "on" : "off") + ", AudioContext: " + (typeof FX !== "undefined" && FX.ctx ? FX.ctx.state : "not used"),
    "Opened from: " + location.protocol.replace(":", "")].filter(Boolean).join("\n");
}
let toneSrc = null;
$("stest").onclick = async () => {
  const r = $("srep"); r.hidden = false;
  try { toneSrc = toneSrc || toneUrl(); const t = new Audio(toneSrc); t.volume = 1; await t.play(); r.dataset.first = "Test tone: playing. Did you hear a beep? If not, the problem is your device volume, the silent switch or the output device, not the site."; }
  catch (e) { r.dataset.first = "Test tone was blocked or failed (" + (e && e.name || "error") + ")."; }
  r.textContent = soundReport(r.dataset.first);
};
setInterval(() => { const r = $("srep"); if (!r.hidden && r.offsetParent) r.textContent = soundReport(r.dataset.first || ""); }, 1000);
