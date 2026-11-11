/* When audio put in a song folder is not picked up:
   - "Check this song's folder" shows what the site looked for and what it found.
   - "Import song folders": choose your songs folder once. The browser reads the files directly, so any file
     names work and it does not matter how the page was opened. Files are saved on this device. */
async function checkFolder(id) {
  const s = byId(id), out = ["Opened from: " + location.protocol.replace(":", "") + (location.protocol === "file:" ? " (double-clicked file)" : ""), "The site looks in this folder: " + songDir(id), ""];
  for (const kind of ["audio", "video"]) {
    const c = songCandidates(id, kind); c.forEach(x => delete probeCache[x]);               // look again instead of using memory
    const res = await Promise.all(c.map(x => probe(kind, x))), hits = c.filter((_, i) => res[i]);
    out.push((kind === "audio" ? "Audio" : "Video") + " files found: " + (hits.length ? hits.map(x => x.split("/").pop()).join(", ") : "none"));
  }
  try { const r = await fetch(lyricsPathOf(id)); out.push("Lyrics file (lyrics.lrc): " + (r.ok ? "found" : "not found")); }
  catch (e) { out.push("Lyrics file: cannot be read when the page is opened as a file. Use the lyrics box, or Import song folders."); }
  out.push("", "Accepted audio names: audio.mp3, " + id + ".mp3 or " + songSlug(s.title) + ".mp3 (also m4a, wav, ogg, aac, flac, opus).",
    "Common mistakes: the file is really audio.mp3.mp3 (Windows can hide extensions), it is in a different song's folder, or the page was not reloaded after adding it.",
    "Easiest fix: press Import song folders below and choose your songs folder; then any file name works.");
  return out.join("\n");
}
$("fcheck").onclick = async () => {
  const r = $("frep"); r.hidden = false;
  if (S.now === null) { r.textContent = "Reserve a song first, then check its folder."; return; }
  r.textContent = "Checking…"; r.textContent = await checkFolder(S.now);
};

$("impf").onchange = async e => {
  const files = [...e.target.files], st = $("impstat"); if (!files.length) return;
  const AUD = ["mp3", "m4a", "wav", "ogg", "aac", "flac", "opus"], VID = ["mp4", "webm", "m4v", "mov", "ogv"], ext = f => f.name.split(".").pop().toLowerCase(), by = {};
  files.forEach(f => { const dir = (f.webkitRelativePath || "").split("/").find(p => /^\d{5}-/.test(p)); if (dir) (by[+dir.slice(0, 5)] = by[+dir.slice(0, 5)] || []).push(f); });
  const ids = Object.keys(by).map(Number); let na = 0, nv = 0, nl = 0; st.textContent = "Importing…";
  const best = (list, id) => list.sort((x, y) => rank(x, id) - rank(y, id))[0], rank = (f, id) => { const n = f.name.toLowerCase(); return /^(audio|video)\./.test(n) || n.startsWith(id + ".") ? 0 : 1; };
  for (const id of ids) {
    const list = by[id], a = list.filter(f => AUD.includes(ext(f))), v = list.filter(f => VID.includes(ext(f))), l = list.filter(f => ext(f) === "lrc");
    if (a.length) { await audioPut(id, best(a, id)); na++; }
    if (v.length) { await audioPut("vid" + id, best(v, id)); nv++; }
    if (l.length) { S.ov[id] = Object.assign(S.ov[id] || {}, { lyrics: await best(l, id).text(), auto: false }); nl++; }
  }
  save(); e.target.value = "";
  st.textContent = ids.length ? "Imported from " + ids.length + " song folder" + (ids.length > 1 ? "s" : "") + ": " + na + " audio, " + nv + " video, " + nl + " lyrics file" + (nl === 1 ? "" : "s") + ". Reserve those songs to play them."
                              : "No song folders found. Choose the songs folder itself: it contains folders like 10006-ang-huling-el-bimbo.";
  if (S.now !== null) { setStage(); render(); }
};
