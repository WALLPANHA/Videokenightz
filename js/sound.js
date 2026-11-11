/* Sound effects, made with the browser's audio engine (no audio files needed).
   Button clicks, a "ding" when you reserve a song, and a drum roll + fanfare + applause after each song. */
let ac = null, noiseBuf = null;
function audio() {
  if (!S.set.sfx || S.set.vol <= 0) return null;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    return ac;
  } catch (e) { return null; }
}
function note(a, f, t, d, type, v, f2) {
  const o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime + t, vol = v * S.set.vol / 100;
  o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + d + 0.03);
}
function hiss(a, t, d, kind, freq, v) {
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t0 = a.currentTime + t, vol = v * S.set.vol / 100;
  s.buffer = noiseBuf; f.type = kind; f.frequency.value = freq;
  g.gain.setValueAtTime(Math.max(vol, 0.0002), t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  s.connect(f).connect(g).connect(a.destination); s.start(t0, Math.random()); s.stop(t0 + d + 0.03);
}
function sfx(kind) {
  const a = audio(); if (!a) return;
  if (kind === "tick") note(a, 1200, 0, 0.05, "triangle", 0.14);
  else if (kind === "ding") { note(a, 1318, 0, 0.35, "sine", 0.25); note(a, 1760, 0.09, 0.5, "sine", 0.22); }
  else if (kind === "swoosh") note(a, 250, 0, 0.18, "sawtooth", 0.1, 1200);
  else { note(a, 900, 0, 0.06, "square", 0.1); note(a, 600, 0.03, 0.06, "square", 0.07); }
}
/* After a song: drum roll, cymbal, fanfare, applause (bigger for higher scores) */
function sfxScore(score) {
  const a = audio(); if (!a) return;
  for (let i = 0; i < 12; i++) hiss(a, i * 0.06, 0.07, "bandpass", 220, 0.1 + i * 0.02);
  hiss(a, 0.78, 1.2, "highpass", 6000, 0.25);
  [523, 659, 784, 1047].forEach((f, i) => note(a, f, 0.78 + i * 0.12, 0.45, "triangle", 0.2));
  const claps = score >= 90 ? 60 : score >= 80 ? 40 : 22;
  for (let i = 0; i < claps; i++) hiss(a, 1.0 + Math.random() * (score >= 85 ? 2.4 : 1.6), 0.04, "bandpass", 1500 + Math.random() * 2500, 0.12);
}
document.addEventListener("click", e => {
  const b = e.target.closest("button,a.btn,.chip,.sw,.tool"); if (!b) return;
  const txt = b.textContent;
  sfx(/^(Reserve|Added|\+)/.test(txt) || b.id === "rsv" || b.id === "add" ? "ding" : b.id === "skip" ? "swoosh"
    : b.matches(".tool,.chip,.sw,.seg button") ? "tick" : "click");
}, true);
