/* Song book (left side): category tabs, a page of songs, page turning, adding your own songs.
   The search box opens a dialog (see the end of this file) so results have room to breathe. */
const PAGE = 12;
let bp = 0;                                             // current book page

function drawChips() {
  const cs = ["All", ...new Set(all().map(s => s.cat))];
  $("chips").innerHTML = ""; $("cats").innerHTML = "";
  cs.forEach(c => { const b = document.createElement("button"); b.className = "tab" + (c === cat ? " on" : ""); b.textContent = c; b.type = "button";
    b.onclick = () => { cat = c; bp = 0; drawChips(); drawGrid(); }; $("chips").append(b); if (c !== "All") $("cats").append(new Option(c)); });
}
/* One row of the book / of the search results */
function songRow(s) {
  const d = document.createElement("div"); d.className = "srow" + "";
  d.innerHTML = '<span class="no"></span><span class="ttl"><b></b><small></small></span><button class="btn sm" type="button" aria-label="Reserve">＋</button>';
  d.querySelector(".no").textContent = s.id; d.querySelector("b").textContent = s.title; d.querySelector("small").textContent = s.artist;
  const b = d.querySelector("button"); b.onclick = () => { reserve(s.id); b.textContent = "✓"; setTimeout(() => b.textContent = "＋", 1500); };
  return d;
}
function drawGrid() {
  const list = all().filter(s => cat === "All" || s.cat === cat), pages = Math.max(1, Math.ceil(list.length / PAGE)), g = $("grid");
  bp = Math.min(bp, pages - 1); g.innerHTML = "";
  list.slice(bp * PAGE, bp * PAGE + PAGE).forEach(s => g.append(songRow(s)));
  if (!list.length) g.innerHTML = '<p class="empty">No songs in this section yet.</p>';
  $("pgno").textContent = "Page " + (bp + 1) + " of " + pages; $("pgprev").disabled = bp === 0; $("pgnext").disabled = bp >= pages - 1;
  $("count").textContent = all().length + " songs";
}
$("pgprev").onclick = () => { bp--; drawGrid(); }; $("pgnext").onclick = () => { bp++; drawGrid(); };

/* Add your own song */
$("add").onclick = () => {
  const t = $("at").value.trim(); if (!t) { alert("Please enter a title."); return; }
  const id = Math.max(20000, ...S.custom.map(s => s.id)) + 1;
  S.custom.push({ id, title: t, artist: $("aa").value.trim() || "Unknown", cat: $("ac").value.trim() || "My Songs" });
  save(); ["at", "aa", "ac"].forEach(i => $(i).value = ""); drawChips(); drawGrid(); alert("Added as song #" + id);
};

/* Search dialog: results from the song book show up as you type */
function drawResults() {
  const t = term.trim().toLowerCase(), box = $("sres"); box.innerHTML = "";
  if (!t) { box.innerHTML = '<p class="empty">Type a title, an artist or a song number.</p>'; return; }
  const list = all().filter(s => (s.id + " " + s.title + " " + s.artist).toLowerCase().includes(t));
  const note = document.createElement("p"); note.className = "empty"; note.textContent = list.length ? list.length + " song" + (list.length > 1 ? "s" : "") + " in the song book" + (list.length > 40 ? " (showing 40)" : "") : "Nothing in the song book yet. Try the online catalog below."; box.append(note);
  list.slice(0, 40).forEach(s => box.append(songRow(s)));
}
$("q").oninput = e => { term = e.target.value; drawResults(); };
$("opensearch").onclick = () => { $("sdlg").showModal(); drawResults(); $("q").focus(); };
$("sdlg").addEventListener("click", e => { if (e.target === $("sdlg")) $("sdlg").close(); });
