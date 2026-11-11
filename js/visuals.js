/* Offline videoke background: calm animated scenes (soft aurora, warm lights, sunset, starry night, city, equalizer)
   drawn by the browser, so no video file is needed. The scene moves with your own audio file when one is playing.
   Choose the scene in Settings → Playback & sound, or load your own looping video. */

const FX = { cv: null, x: null, an: null, data: null, ctx: null, t: 0, last: 0, n: 0, c: ["#7fb3d5", "#f0c987", "#ffe9c2"], W: 0, H: 0 };

function fxInit() {
  const st = $("stage"), c = document.createElement("canvas");
  c.id = "bgfx"; st.prepend(c); FX.cv = c; FX.x = c.getContext("2d");
  new ResizeObserver(fxSize).observe(st); fxSize(); requestAnimationFrame(fxLoop);
}
function fxSize() { const st = $("stage"), d = Math.min(devicePixelRatio || 1, 1.5); FX.W = FX.cv.width = st.clientWidth * d; FX.H = FX.cv.height = st.clientHeight * d; }

/* Called by audio.js for each audio file: lets the animation listen to the music */
async function hookAudio(a) {
  if (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return;   // iPhone/iPad: Web Audio is muted by the silent switch, so the song plays directly
  if (!S.set.fxreact) return;      // off by default: the song plays straight from the audio player, so nothing can mute it
  try {
    FX.ctx = FX.ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (a._an) { FX.an = a._an; FX.data = new Uint8Array(FX.an.frequencyBinCount); FX.ctx.resume(); return; }          // already connected once
    if (FX.ctx.state !== "running") await Promise.race([FX.ctx.resume(), new Promise(r => setTimeout(r, 300))]);        // never wait long for the browser
    if (FX.ctx.state !== "running") return;          // the browser is still blocking Web Audio: skip it so the song just plays normally (no silent audio)
    const src = FX.ctx.createMediaElementSource(a); FX.an = FX.ctx.createAnalyser(); a._an = FX.an; FX.an.fftSize = 128; FX.data = new Uint8Array(FX.an.frequencyBinCount);
    src.connect(FX.ctx.destination); src.connect(FX.an);                                                                // the sound has its own direct path
    a.addEventListener("play", () => FX.ctx.resume());
  } catch (e) { FX.an = null; }
}
function fxLevel() {
  const boost = $("stage").classList.contains("is-chorus") ? 0.25 : 0;
  const live = typeof audioTime === "function" && audioTime() !== null;
  if (live && FX.an) { FX.an.getByteFrequencyData(FX.data); let s = 0; for (let i = 0; i < 8; i++) s += FX.data[i]; return Math.min(1, s / 8 / 190 + boost); }
  if (live || run) return Math.min(1, 0.45 + boost + 0.45 * Math.abs(Math.sin(FX.t * Math.PI * 2)));   // about 120 beats per minute
  return 0.12 + 0.08 * Math.sin(FX.t * 2);
}
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

const R = (i, k = 1) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
const SCENES = {
  /* Dim lounge: warm stage lights through drifting haze, amber bokeh and slow dust */
  lounge(X, W, H, u, t, L, c1, c2) {
    const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0a0709"); g.addColorStop(1, "#1b0f10"); X.fillStyle = g; X.fillRect(0, 0, W, H);
    const wg = X.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.38, H * 0.9); wg.addColorStop(0, "rgba(240,170,90,.22)"); wg.addColorStop(1, "rgba(240,170,90,0)"); X.fillStyle = wg; X.fillRect(0, 0, W, H);
    X.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i++) {                                                           // stage lights
      const x = W * (0.2 + i * 0.3), sway = Math.sin(t * 0.3 + i * 2) * 0.22 * (1 - FX.p.k) + Math.max(-0.5, Math.min(0.5, (FX.p.x - x) / H)) * FX.p.k, len = H * 1.05, w = (9 + L * 3) * u;
      const cg = X.createLinearGradient(x, 0, x + sway * len, len); cg.addColorStop(0, "rgba(255,214,150," + (0.2 + L * 0.08) + ")"); cg.addColorStop(1, "rgba(255,214,150,0)"); X.fillStyle = cg;
      X.beginPath(); X.moveTo(x - 1.2 * u, 0); X.lineTo(x + 1.2 * u, 0); X.lineTo(x + sway * len + w, len); X.lineTo(x + sway * len - w, len); X.fill();
    }
    for (let i = 0; i < 6; i++) {                                                           // haze
      const x = ((R(i) * W + t * (1.5 + R(i, 2) * 2.5) * u) % (W + 80 * u)) - 40 * u, y = H * (0.35 + R(i, 3) * 0.55), hz = X.createRadialGradient(x, y, 0, x, y, 38 * u);
      hz.addColorStop(0, "rgba(255,220,170,.07)"); hz.addColorStop(1, "rgba(255,220,170,0)"); X.fillStyle = hz; X.fillRect(x - 38 * u, y - 38 * u, 76 * u, 76 * u);
    }
    for (let i = 0; i < 14; i++) {                                                          // bokeh
      const r = (3 + R(i, 4) * 6) * u, x = (R(i) * W + Math.sin(t * 0.15 + i) * 3 * u + W) % W, y = H * 0.55 + R(i, 2) * H * 0.4 + Math.sin(t * 0.2 + i * 1.3) * 2 * u;
      const dx = x - FX.p.x, dy = y - FX.p.y, dd = Math.hypot(dx, dy) || 1, ps = FX.p.k * Math.max(0, 1 - dd / (18 * u)) * 9 * u, xx = x + dx / dd * ps, yy = y + dy / dd * ps;
      const bg = X.createRadialGradient(xx, yy, 0, xx, yy, r); bg.addColorStop(0, i % 4 ? "rgba(255,190,110,.2)" : "rgba(255,140,120,.18)"); bg.addColorStop(1, "rgba(255,190,110,0)"); X.fillStyle = bg; X.beginPath(); X.arc(xx, yy, r, 0, 7); X.fill();
    }
    X.fillStyle = "#fff"; for (let i = 0; i < 40; i++) { X.globalAlpha = 0.08 + 0.25 * Math.abs(Math.sin(t * 0.7 + i * 3)); X.fillRect((R(i, 6) * W + t * 2 * u * (0.3 + R(i, 7))) % W, (R(i, 8) * H - t * 1.5 * u * (0.2 + R(i, 9)) + H * 4) % H, 0.25 * u, 0.25 * u); }
    X.globalAlpha = 1; X.globalCompositeOperation = "source-over";
  },
  /* Rainy city at night: layered skyline, lit windows, distant lights, light rain */
  city(X, W, H, u, t, L, c1, c2) {
    const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#060912"); g.addColorStop(0.65, "#1b1624"); g.addColorStop(1, "#33202a"); X.fillStyle = g; X.fillRect(0, 0, W, H);
    const hg = X.createRadialGradient(W / 2, H * 0.9, 0, W / 2, H * 0.9, H * 0.8); hg.addColorStop(0, "rgba(255,150,90,.28)"); hg.addColorStop(1, "rgba(255,150,90,0)"); X.fillStyle = hg; X.fillRect(0, 0, W, H);
    const par = (FX.p.x / W - 0.5) * FX.p.k;
    [[0.5, 16, 34, "#0e1424", 4, 0.1], [0.8, 22, 46, "#080b15", 6, 0.14]].forEach(([_, hMin, hMax, col, seed, win], li) => {
      const n = 12 + li * 2, w = W / n, off = par * (li + 1) * 3 * u;
      for (let i = 0; i < n; i++) {
        const h = (hMin + R(i, seed) * (hMax - hMin)) * u, x = i * w + off, y = H - h; X.fillStyle = col; X.fillRect(x, y, w + 1, h);
        for (let r = 0; r < Math.floor(h / (4.4 * u)) - 1; r++) for (let c = 0; c < Math.floor(w / (3.6 * u)); c++) {
          if (R(i * 91 + r * 17 + c + li * 7, Math.floor(t / 4)) > 1 - win - 0.12) { X.fillStyle = R(i + r, c) > 0.75 ? "#9fd0e0" : "#ffcf8a"; X.globalAlpha = 0.55; X.fillRect(x + (c + 0.6) * 3.6 * u, y + (r + 0.8) * 4.4 * u, 1.3 * u, 1.9 * u); }
        }
        X.globalAlpha = 1;
      }
    });
    X.globalCompositeOperation = "lighter";
    for (let i = 0; i < 12; i++) { const x = ((R(i) * W + t * (3 + R(i, 2) * 5) * u * (i % 2 ? 1 : -1)) % W + W) % W, y = H * (0.8 + R(i, 3) * 0.15), r = (2 + R(i, 4) * 3) * u, bg = X.createRadialGradient(x, y, 0, x, y, r);
      bg.addColorStop(0, i % 3 ? "rgba(255,170,100,.35)" : "rgba(255,80,80,.3)"); bg.addColorStop(1, "rgba(255,170,100,0)"); X.fillStyle = bg; X.beginPath(); X.arc(x, y, r, 0, 7); X.fill(); }
    X.globalCompositeOperation = "source-over"; X.strokeStyle = "#cfe3ff"; X.lineWidth = 0.18 * u;
    for (let i = 0; i < 80; i++) { const x = R(i) * W, y = ((t * (55 + R(i, 2) * 40) * u + R(i, 3) * H) % (H + 8 * u)) - 4 * u; X.globalAlpha = 0.1 + R(i, 4) * 0.12; X.beginPath(); X.moveTo(x, y); X.lineTo(x - 0.8 * u, y + 4 * u); X.stroke(); }
    X.globalAlpha = 1;
  },
  /* A neon sign on a dark wall */
  neon(X, W, H, u, t, L, c1, c2) {
    const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#09090d"); g.addColorStop(1, "#15101a"); X.fillStyle = g; X.fillRect(0, 0, W, H);
    X.fillStyle = "rgba(255,255,255,.025)"; for (let y = 0; y < H; y += 4 * u) X.fillRect(0, y, W, 0.25 * u);
    const flick = R(Math.floor(t * 7), 5) > 0.94 ? 0.4 : 1, pulse = 0.9 + 0.1 * Math.sin(t * 2) + L * 0.08;
    const glow = X.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, H * 0.8); glow.addColorStop(0, c1 + "30"); glow.addColorStop(1, c1 + "00"); X.fillStyle = glow; X.fillRect(0, 0, W, H);
    X.textAlign = "center"; X.textBaseline = "middle"; X.letterSpacing = (1.4 * u) + "px";
    const sign = (txt, size, y, col, w) => { X.font = w + " " + size * u + 'px "Helvetica Neue", Helvetica, Arial, sans-serif';
      for (const [blur, a] of [[22, 0.5], [10, 0.7], [3, 1]]) { X.shadowColor = col; X.shadowBlur = blur * u; X.globalAlpha = a * flick * pulse; X.fillStyle = blur === 3 ? "#fff" : col; X.fillText(txt, W / 2, y); } X.shadowBlur = 0; X.globalAlpha = 1; };
    sign("VIDEOKE", 15, H * 0.43, c1, 300); sign("NIGHTS", 6, H * 0.43 + 13 * u, c2, 300);
    X.strokeStyle = c2; X.lineWidth = 0.5 * u; X.shadowColor = c2; X.shadowBlur = 8 * u; X.globalAlpha = 0.7 * flick; X.beginPath(); X.roundRect ? X.roundRect(W * 0.2, H * 0.2, W * 0.6, H * 0.46, 3 * u) : X.rect(W * 0.2, H * 0.2, W * 0.6, H * 0.46); X.stroke(); X.shadowBlur = 0; X.globalAlpha = 1; X.letterSpacing = "0px";
  },
  /* Slow flowing lines that follow the music */
  waveform(X, W, H, u, t, L, c1, c2) {
    const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#06080d"); g.addColorStop(1, "#0f1520"); X.fillStyle = g; X.fillRect(0, 0, W, H);
    const live = FX.an && typeof audioTime === "function" && audioTime() !== null;
    X.lineWidth = 0.28 * u; X.globalCompositeOperation = "lighter";
    for (let k = 0; k < 10; k++) {
      X.strokeStyle = k % 2 ? c1 : c2; X.globalAlpha = 0.5 - k * 0.035; X.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const e = Math.sin(Math.PI * x / W), d = live ? 0.45 + FX.data[Math.floor(x / W * 30)] / 255 : 0.55 + L * 0.9;
        const bump = FX.p.k * 8 * u * Math.exp(-(((x - FX.p.x) / (24 * u)) ** 2)) * Math.sin(t * 3 + k);
        const y = H * 0.52 + e * ((4 + k * 0.7) * u * d * Math.sin(x / (22 * u) + t * (0.5 + k * 0.07) + k) + 2.5 * u * Math.sin(x / (9 * u) - t * 0.8 + k * 2)) + bump;
        x ? X.lineTo(x, y) : X.moveTo(x, y);
      }
      X.stroke();
    }
    X.globalAlpha = 1; X.globalCompositeOperation = "source-over";
  }
};
const ROT = ["lounge", "city", "neon", "waveform"];                                   // order used by "Auto-change scenes"

/* Finishing touch for a cinematic look: soft dark edges and a trace of film grain */
function finish(X, W, H) {
  const v = X.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.0); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.55)"); X.fillStyle = v; X.fillRect(0, 0, W, H);
  if (!FX.grain) { const c = document.createElement("canvas"); c.width = c.height = 96; const k = c.getContext("2d"), d = k.createImageData(96, 96); for (let i = 0; i < d.data.length; i += 4) { const n = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = n; d.data[i + 3] = 60; } k.putImageData(d, 0, 0); FX.grain = X.createPattern(c, "repeat"); }
  X.save(); X.translate(Math.random() * 96, Math.random() * 96); X.globalAlpha = 0.07; X.fillStyle = FX.grain; X.fillRect(-96, -96, W + 192, H + 192); X.restore(); X.globalAlpha = 1;
}

/* Videos on the screen. What plays is decided in bgWant():
   1) a video in the song's own folder (silent with separate audio; otherwise its sound plays and the lyrics follow it),
   2) "My video folder": a random video from the backgrounds folder,
   3) "My own video": the looping video you chose with the file button (saved on this device). */
const BG = { el: document.createElement("video"), url: null, has: false, cur: null, songSrc: null, songMuted: true, drives: false, pick: null, pickSong: null };
Object.assign(BG.el, { id: "bgvid", muted: true, loop: true, playsInline: true }); BG.el.style.display = "none"; $("stage").prepend(BG.el);
async function loadBgVideo() {
  const blob = await audioGet("bgvideo"); if (BG.url) URL.revokeObjectURL(BG.url); BG.url = null; BG.has = false;
  if (blob) { BG.url = URL.createObjectURL(blob); BG.has = true; }
}
function bgWant() {
  if (BG.songSrc) return { src: BG.songSrc, muted: BG.songMuted, loop: BG.songMuted };
  if (S.set.fx === "folder") loadBgFolder();
  if (S.set.fx === "folder" && BG_VIDEOS.length) { if (!BG.pick || BG.pickSong !== S.now) { BG.pick = BG_VIDEOS[Math.floor(Math.random() * BG_VIDEOS.length)]; BG.pickSong = S.now; } return { src: BG.pick, muted: true, loop: true }; }
  if (S.set.fx === "video" && BG.has) return { src: BG.url, muted: true, loop: true };
  return null;
}
function bgSync() {
  const w = bgWant();
  if (w) { if (BG.cur !== w.src) { BG.cur = w.src; BG.el.src = w.src; } BG.el.muted = w.muted; BG.el.loop = w.loop; }
  else if (BG.cur) { BG.cur = null; BG.el.removeAttribute("src"); BG.el.load(); }
  return w;
}
const refreshSettings = () => { save(); applySet(); setters.forEach(f => f()); };
$("bf").onchange = async e => { const f = e.target.files[0]; if (!f) return; await audioPut("bgvideo", f); e.target.value = ""; await loadBgVideo(); S.set.fx = "video"; refreshSettings(); };
$("bfx").onclick = async () => { await audioDel("bgvideo"); await loadBgVideo(); if (S.set.fx === "video") { S.set.fx = "auto"; refreshSettings(); } };
loadBgVideo();

/* ---- Interactive layer: a soft light that follows your finger or mouse, thin ripples and a few specks of dust when you tap.
   Turn it off in Settings -> Playback & sound. ---- */
FX.p = { x: -1e4, y: -1e4, in: false, k: 0 }; FX.parts = []; FX.rip = []; FX.lastSpawn = 0;
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
function spark(x, y, n, spd, col) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = (0.3 + Math.random()) * spd; FX.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spd * 0.2, life: 1, col, r: 0.2 + Math.random() * 0.3 }); }
  if (FX.parts.length > 220) FX.parts.splice(0, FX.parts.length - 220);
}
function pointerAt(e) { const r = $("stage").getBoundingClientRect(); FX.p.x = (e.clientX - r.left) / r.width * FX.W; FX.p.y = (e.clientY - r.top) / r.height * FX.H; }
const stg = $("stage");
stg.addEventListener("pointermove", e => {
  if (!S.set.fxi || calm) return; pointerAt(e); FX.p.in = true;
  if (performance.now() - FX.lastSpawn > 90) { FX.lastSpawn = performance.now(); spark(FX.p.x, FX.p.y, 1, FX.H / 100 * 0.15, FX.c[2]); }
});
stg.addEventListener("pointerleave", () => { FX.p.in = false; });
stg.addEventListener("pointerdown", e => { if (!S.set.fxi || calm) return; pointerAt(e); FX.p.in = true; FX.rip.push({ x: FX.p.x, y: FX.p.y, t0: FX.t }); spark(FX.p.x, FX.p.y, 6, FX.H / 100 * 0.45, FX.c[2]); });
stg.addEventListener("pointerup", e => { if (e.pointerType === "touch") FX.p.in = false; });
function interact(X, W, H, u, t, L, c1, c2) {
  FX.p.k += ((FX.p.in && S.set.fxi ? 1 : 0) - FX.p.k) * 0.12;
  if (!S.set.fxi || calm) return;
  if (FX.p.k > 0.02) { const g = X.createRadialGradient(FX.p.x, FX.p.y, 0, FX.p.x, FX.p.y, 16 * u); g.addColorStop(0, FX.c[2] + "30"); g.addColorStop(1, FX.c[2] + "00"); X.globalAlpha = FX.p.k; X.fillStyle = g; X.beginPath(); X.arc(FX.p.x, FX.p.y, 16 * u, 0, 7); X.fill(); }
  X.globalAlpha = 1; X.lineWidth = 0.5 * u;
  FX.rip = FX.rip.filter(r => t - r.t0 < 1.6);
  FX.rip.forEach(r => { const a = (t - r.t0) / 1.6; X.strokeStyle = FX.c[2]; X.globalAlpha = (1 - a) * 0.35; X.beginPath(); X.arc(r.x, r.y, (3 + a * 26) * u, 0, 7); X.stroke(); });
  X.globalCompositeOperation = "lighter";
  FX.parts = FX.parts.filter(p => p.life > 0);
  FX.parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += u * 0.012; p.vx *= 0.985; p.life -= 0.016; X.globalAlpha = Math.max(0, p.life) * 0.9; X.fillStyle = p.col; X.beginPath(); X.arc(p.x, p.y, p.r * u, 0, 7); X.fill(); });
  X.globalCompositeOperation = "source-over"; X.globalAlpha = 1;
}

function fxLoop(ts) {
  requestAnimationFrame(fxLoop);
  if (ts - FX.last < 33) return;
  FX.t += Math.min(0.1, (ts - FX.last) / 1000); FX.last = ts;
  const X = FX.x, W = FX.W, H = FX.H, u = H / 100;
  let mode = S.set.fx; if (mode === "auto") mode = ROT[Math.floor(FX.t / 40) % ROT.length];
  const w = bgSync(), off = (S.set.fx === "off" && !w) || document.hidden, vid = !off && !!w;
  if ((mode === "video" || mode === "folder") && !w) mode = "lounge";
  FX.cv.style.display = off || vid ? "none" : "block"; BG.el.style.display = vid ? "block" : "none";
  if (!BG.drives) { if (vid && BG.el.paused) BG.el.play().catch(() => {}); if (!vid && !BG.el.paused) BG.el.pause(); }
  if (off || vid || !W) return;
  if (FX.n++ % 60 === 0) FX.c = [css("--pink"), css("--cyan"), "#ffe9c2"];
  const L = fxLevel(), [c1, c2, c3] = FX.c;
  X.globalAlpha = 1; (SCENES[mode] || SCENES.lounge)(X, W, H, u, FX.t, L, c1, c2, c3); interact(X, W, H, u, FX.t, L, c1, c2); finish(X, W, H);
  if (S.set.fx === "auto") { const a = FX.t % 40; if (a < 1.2) { X.globalAlpha = 1 - a / 1.2; X.fillStyle = "#000"; X.fillRect(0, 0, W, H); X.globalAlpha = 1; } }
}
fxInit();
