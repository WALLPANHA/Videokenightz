/* Lyrics engine: parsing, timing, drawing and stepping through lines. */
/* Turns pasted/fetched text into lines: {t: seconds or null, s: text, ch: is chorus}.
   Chorus is known from tags like [Chorus]; otherwise guessed from lines that repeat. */
function parse(text){
  const raw=(text||"").split("\n").map(l=>l.trim()).filter(Boolean).filter(l=>!/^\[[a-z]{2,}:.*\]$/i.test(l));
  const out=[];let sec=false,tagged=false;
  raw.forEach(l=>{
    const tag=/^[\[(]\s*([^\])]*)[\])]$/.exec(l);
    if(tag&&/(chorus|refrain|hook|verse|bridge|intro|outro|interlude)/i.test(tag[1])){
      sec=/(chorus|refrain|hook)/i.test(tag[1])&&!/pre/i.test(tag[1]);tagged=true;return}
    const m=l.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/);
    out.push(m?{t:+m[1]*60+ +m[2],s:m[3],ch:sec}:{t:null,s:l,ch:sec})});
  if(!tagged){
    const norm=x=>x.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,"").replace(/\s+/g," ").trim(),c={};
    out.forEach(o=>{const k=norm(o.s);c[k]=(c[k]||0)+1});
    out.forEach(o=>{const k=norm(o.s);o.ch=k.length>=8&&c[k]>=2})}
  return out}
function parseNow(){const o=S.ov[S.now]||{};lines=parse(o.lyrics);timed=lines.length>0&&lines.every(l=>l.t!==null)}
function cur(){if(!lines.length)return -1;if(timed){let i=-1;lines.forEach((l,j)=>{if(l.t<=el+S.set.off+soff())i=j});return i}return Math.min(Math.floor(el/S.set.spl),lines.length-1)}
let lastKey="",lyrStatus="";
function drawLyr(){const L=$("lyr"),i=cur(),k=[S.now,lyrStatus,S.set.chor,i,lines.length,lines[i]&&lines[i].s,lines[i+1]&&lines[i+1].s].join("|");
  if(k===lastKey)return;lastKey=k;L.innerHTML="";
  const add=(c,t,ch)=>{const d=document.createElement("div");d.className=c+(ch&&S.set.chor?" ch":"");
    if(c==="c"){const total=t.replace(/\s/g,"").length||1;let acc=0;
      t.split(/(\s+)/).forEach(tok=>{if(!tok)return;if(/^\s+$/.test(tok)){d.append(tok);return}
        const w=document.createElement("span");w.className="w";w.dataset.s=acc/total;acc+=tok.length;w.dataset.e=acc/total;
        w.append(tok);const f=document.createElement("span");f.className="f";f.setAttribute("aria-hidden","true");f.textContent=tok;w.append(f);d.append(w)})}else d.textContent=t;L.append(d)};
  if(S.now===null)add("c","Reserve a song to start ♪");
  else if(!lines.length){const s=byId(S.now);add("c","♪ "+s.title+" ♪");add("n",lyrStatus||"Add lyrics in the side panel, or sing along with the video.")}
  else{add("c",i<0?"♪ ♪ ♪":(lines[i].s||"♪"),i>=0&&lines[i].ch);if(lines[i+1])add("n",lines[i+1].s)}
  L.firstChild.classList.add("lyr-in");updateFill()}
function go(d){if(!lines.length)return;const i=Math.max(0,Math.min(lines.length-1,cur()+d));el=timed?lines[i].t-S.set.off-soff():i*S.set.spl;if(typeof audioTime==="function"&&audioTime()!==null)skew=el-audioTime();drawLyr()}
setInterval(()=>{if(run){const at=typeof audioTime==="function"?audioTime():null;el=at!==null?at+skew:el+.2;drawLyr();updateFill()}},200);
$("lyr").onclick=()=>go(1);$("nx").onclick=()=>go(1);$("pv").onclick=()=>go(-1);
$("rs").onclick=()=>{el=0;run=true;drawLyr()};$("pp").onclick=()=>{run=!run};
addEventListener("keydown",e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==="ArrowRight")go(1);if(e.key==="ArrowLeft")go(-1)});
$("lt").oninput=e=>{if(S.now===null)return;S.ov[S.now]=Object.assign(S.ov[S.now]||{},{lyrics:e.target.value,auto:false});save();parseNow();drawLyr()};

/* Sing-along fill: a smooth color sweep through the current line, word by word (so wrapped lines fill in order),
   and tints the lyrics bar during the chorus */
function updateFill(){
  const c=document.querySelector("#lyr .c"),i=cur(),ln=lines[i];
  $("stage").classList.toggle("is-chorus",!!(S.set.chor&&ln&&ln.ch));
  if(!c||!lines.length)return;
  let p=-1;
  if(ln){if(timed){const a=ln.t,nx=lines[i+1]?lines[i+1].t:a+4,d=Math.max(.5,Math.min(nx-a,6));p=(el+S.set.off+soff()-a)/d}
         else p=(el-i*S.set.spl)/S.set.spl}
  c.querySelectorAll(".w").forEach(w=>{const s=+w.dataset.s,e=+w.dataset.e,f=p<0?0:Math.max(0,Math.min(1,(p-s)/((e-s)||1)));w.style.setProperty("--wp",f*100+"%")})}

/* Timing nudge saved for the current song (seconds; + makes the lyrics appear earlier) */
function soff(){return (S.ov[S.now]&&S.ov[S.now].off)||0}
