/* Re-time lyrics by tapping: play the song, tap once as each line starts, and the lyrics are saved with timing.
   Works with any source of music. Keyboard: press Space or Enter instead of tapping. */
let TAP = null;
const tapFmt = t => { const m = Math.floor(t / 60), s = (t - m * 60).toFixed(2).padStart(5, "0"); return "[" + String(m).padStart(2, "0") + ":" + s + "]"; };
const tapClock = () => { const a = typeof audioTime === "function" ? audioTime() : null; return a !== null ? a : (performance.now() - TAP.t0) / 1000; };
function tapDraw() { $("tapline").textContent = TAP ? "Next line (" + (TAP.i + 1) + " of " + TAP.lines.length + "): " + TAP.lines[TAP.i] : ""; $("tapbox").hidden = !TAP; $("tapb").hidden = !!TAP; }
$("tapb").onclick = () => {
  if (S.now === null) { alert("Reserve a song first."); return; }
  const raw = parse((S.ov[S.now] || {}).lyrics || $("lt").value).map(l => l.s).filter(Boolean);
  if (!raw.length) { alert("Fetch or paste the lyrics first, then re-time them."); return; }
  TAP = { lines: raw, i: 0, times: [], t0: performance.now() };
  skew = 0; el = 0; run = true; if (A.has && A.el) { A.el.currentTime = 0; A.el.play().catch(() => {}); }
  tapDraw();
};
function tapHit() {
  if (!TAP) return;
  TAP.times.push(Math.max(0, tapClock() - 0.15)); TAP.i++;                       // 0.15 s allows for your reaction time
  if (TAP.i < TAP.lines.length) { tapDraw(); return; }
  const id = S.now, text = TAP.lines.map((l, i) => tapFmt(TAP.times[i]) + " " + l).join("\n"); TAP = null;
  S.ov[id] = Object.assign(S.ov[id] || {}, { lyrics: text, auto: false, off: 0 }); save(); parseNow(); $("lt").value = text; lastKey = ""; drawLyr(); drawVersion(); tapDraw();
}
$("tapnow").onclick = tapHit; $("tapx").onclick = () => { TAP = null; tapDraw(); };
addEventListener("keydown", e => { if (TAP && (e.key === " " || e.key === "Enter") && !/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName)) { e.preventDefault(); tapHit(); } });
