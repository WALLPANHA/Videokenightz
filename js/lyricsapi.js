/* Auto lyrics: looks up a song's lyrics from a third-party lyrics service (LRCLIB).
   The lyrics are NOT stored in this project. To use a different or licensed provider
   (for example Musixmatch), change LYRICS_API / fetchLyrics below. It must return
   plain text, or text with [mm:ss.xx] timestamps, or null when nothing is found. */
const LYRICS_API = "https://lrclib.net/api/search";

/* All lyric versions the service has for a song, best match first. Ranking prefers an exact title,
   the right artist, timed lyrics, and (when your own audio file is loaded) a version with the same length. */
async function fetchLyricList(song, duration) {
  const url = LYRICS_API + "?track_name=" + encodeURIComponent(song.title) + "&artist_name=" + encodeURIComponent(song.artist.split(/ ft\.| &|,/)[0]);
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const norm = x => (x || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim(), wt = norm(song.title), wa = norm(song.artist.split(/ ft\.| &|,/)[0]);
  return (await res.json()).filter(x => x.syncedLyrics || x.plainLyrics).map(x => ({
    text: x.syncedLyrics || x.plainLyrics, synced: !!x.syncedLyrics, dur: x.duration || 0, title: x.trackName, artist: x.artistName,
    score: (norm(x.trackName) === wt ? 4 : norm(x.trackName).includes(wt) ? 2 : 0) + (norm(x.artistName).includes(wa) ? 3 : 0) + (x.syncedLyrics ? 2 : 0)
           - (duration && x.duration ? Math.min(3, Math.abs(duration - x.duration) / 8) : 0)
  })).sort((a, b) => b.score - a.score);
}
async function fetchLyrics(song) { const l = await fetchLyricList(song, 0); return l.length ? l[0].text : null; }
