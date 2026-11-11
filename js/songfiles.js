/* Finds the files you drop in a song's folder, by name. There is nothing to run or update.
   songs/<number>-<title>/   audio.mp3 | .m4a | .wav | .ogg | .aac | .flac | .opus (the song's audio;
                             <number>.mp3 or <title>.mp3 also work)
                             video.mp4 | video.webm                            (a video for the screen)
                             lyrics.lrc                                        (timed lyrics)
   backgrounds/              bg1.mp4 ... bg9.mp4 (or .webm)                    (videos for every song)  */
const AUDIO_EXT = ["mp3", "m4a", "wav", "ogg", "aac", "flac", "opus", "MP3", "M4A", "WAV"], VIDEO_EXT = ["mp4", "webm"];
const songSlug = t => (t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40)) || "song";
const songDir = id => { const s = byId(id); return s ? "songs/" + s.id + "-" + songSlug(s.title) + "/" : null; };

/* Tries to load a media file; true if the browser can open it. Results are remembered. */
const probeCache = {};
function probe(kind, src) {
  if (src in probeCache) return probeCache[src];
  return probeCache[src] = new Promise(res => {
    const m = document.createElement(kind === "audio" ? "audio" : "video"); m.preload = "metadata";
    const done = ok => { clearTimeout(t); m.onloadedmetadata = m.onerror = null; m.removeAttribute("src"); res(ok); }, t = setTimeout(() => done(false), 5000);
    m.onloadedmetadata = () => done(true); m.onerror = () => done(false); m.src = src;
  });
}
function songCandidates(id, kind) {
  const dir = songDir(id), s = byId(id), out = []; if (!dir) return out;
  for (const name of [kind, String(id), songSlug(s.title)]) for (const ext of kind === "audio" ? AUDIO_EXT : VIDEO_EXT) out.push(dir + name + "." + ext);
  return out;
}
async function findSongFile(id, kind) {
  const cands = songCandidates(id, kind); if (!cands.length) return null;
  const found = await Promise.all(cands.map(c => probe(kind, c)));                        // all checked at the same time
  const i = found.indexOf(true); return i < 0 ? null : cands[i];
}
const lyricsPathOf = id => { const d = songDir(id); return d ? d + "lyrics.lrc" : null; };

/* Videos in the backgrounds folder, found the first time "My video folder" is used */
const BG_VIDEOS = []; let bgFolderState = 0;
async function loadBgFolder() {
  if (bgFolderState) return; bgFolderState = 1;
  for (let n = 1; n <= 9; n++) for (const ext of VIDEO_EXT) { const src = "backgrounds/bg" + n + "." + ext; if (await probe("video", src)) { BG_VIDEOS.push(src); break; } }
}
