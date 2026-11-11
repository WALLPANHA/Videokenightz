/* Online song catalog: searches Apple's free iTunes catalog (song info only, no lyrics) so the song book
   can reach far more songs than the built-in list. Results show up under the built-in songs as you type. */
const BROWSE = ["OPM hits", "Tagalog love songs", "Pinoy rock", "Pop hits", "80s hits", "90s hits", "2000s hits", "Christmas songs", "Rock ballads", "K-pop", "Latin", "R&B", "Reggae", "Jazz"];
let olTerm = "", olLimit = 50, olTimer = null;

async function searchOnline(term, limit) {
  const res = await fetch("https://itunes.apple.com/search?media=music&entity=song&limit=" + limit + "&term=" + encodeURIComponent(term));
  if (!res.ok) throw new Error("HTTP " + res.status);
  const json = await res.json(), seenKeys = new Set();
  return json.results.filter(x => x.trackName && x.artistName).map(x => ({
    title: x.trackName, artist: x.artistName, cat: x.primaryGenreName || "Other"
  })).filter(x => { const k = (x.title + "|" + x.artist).toLowerCase(); return seenKeys.has(k) ? false : seenKeys.add(k); });
}

function addCustom(s) {
  const found = all().find(x => x.title.toLowerCase() === s.title.toLowerCase() && x.artist.toLowerCase() === s.artist.toLowerCase());
  if (found) return found.id;
  const id = Math.max(20000, ...S.custom.map(x => x.id)) + 1;
  S.custom.push({ id, title: s.title, artist: s.artist, cat: s.cat });
  save(); drawChips(); drawGrid();
  return id;
}

async function runOnline(t, limit) {
  olTerm = t; olLimit = limit;
  const box = $("olist"), note = txt => { const p = document.createElement("p"); p.className = "empty"; p.style.gridColumn = "1/-1"; p.textContent = txt; return p; };
  box.hidden = false; box.innerHTML = ""; box.append(note("Searching the online catalog…"));
  try {
    const have = new Set(all().map(x => (x.title + "|" + x.artist).toLowerCase()));
    const list = (await searchOnline(t, limit)).filter(x => !have.has((x.title + "|" + x.artist).toLowerCase()));
    if (olTerm !== t) return;                       // a newer search replaced this one
    box.innerHTML = "";
    box.append(note(list.length ? "More songs from the online catalog for “" + t + "”" : "Nothing new found online for “" + t + "”."));
    list.forEach(s => {
      const d = document.createElement("div"); d.className = "srow";
      d.innerHTML = '<span class="ttl"><b></b><small></small></span><button class="btn sm" type="button" aria-label="Reserve">＋</button>';
      d.querySelector("b").textContent = s.title;
      d.querySelector("small").textContent = s.artist + " · " + s.cat;
      const bt = d.querySelector("button"); bt.onclick = () => { reserve(addCustom(s)); bt.textContent = "✓"; setTimeout(() => bt.textContent = "＋", 1500); };
      box.append(d);
    });
    if (limit < 200) {
      const m = document.createElement("button"); m.className = "btn alt"; m.style.gridColumn = "1/-1"; m.textContent = "Show more songs";
      m.onclick = () => runOnline(t, Math.min(200, limit + 50)); box.append(m);
    }
  } catch (e) {
    if (olTerm !== t) return;
    box.innerHTML = ""; box.append(note("Couldn’t reach the online catalog. Check your internet and try again."));
  }
}

/* search as you type (waits a moment so it doesn't spam the service) */
$("q").addEventListener("input", e => {
  clearTimeout(olTimer); const t = e.target.value.trim();
  if (t.length < 2) { olTerm = ""; $("olist").hidden = true; return; }
  olTimer = setTimeout(() => runOnline(t, 50), 650);
});
$("onl").onclick = () => { const t = term.trim(); if (!t) { alert("Type a song or artist in the search box first."); return; } runOnline(t, 50); };
BROWSE.forEach(n => { const b = document.createElement("button"); b.className = "chip"; b.textContent = n; b.onclick = () => runOnline(n, 50); $("browse").append(b); });
