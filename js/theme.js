/* Look & feel: applies settings, builds the Customize panel, presets. */
function lum(h){const n=parseInt(h.slice(1),16);return .299*(n>>16&255)/255+.587*(n>>8&255)/255+.114*(n&255)/255}
function applySet(){const q=S.set,st=$("stage"),r=document.documentElement.style;if(q.layout==="tv")q.layout="full";if(!["auto","lounge","city","neon","waveform","folder","video","off"].includes(q.fx))q.fx="auto";
  r.setProperty("--bg",q.bg);r.setProperty("--card",q.card);r.setProperty("--ink",q.ink);r.setProperty("--pink",q.ac);r.setProperty("--cyan",q.ac2);r.setProperty("--tvc",q.tvc);
  r.setProperty("--onacc",lum(q.ac)>.6?"#1a1020":"#ffffff");document.body.classList.toggle("grad",!!q.grad);
  st.className=(q.layout==="split"?"split":"")+" pos-"+q.pos+(q.show?"":" nolyr")+(q.fill?"":" nofill");
  $("tv").className=q.layout==="tv"?"tv":"";
  st.style.setProperty("--fs",q.size);st.style.setProperty("--ff",q.font);st.style.setProperty("--bar",q.bar/100);st.style.setProperty("--tx",q.color);st.style.setProperty("--hi",q.hi);st.style.setProperty("--ch",q.ch);drawBar()}
const CTRL=[["layout","Screen layout","select",[["full","Full screen video"],["split","Video + lyrics side by side"]]],["pos","Lyrics position","select",[["bottom","Bottom"],["middle","Middle"],["top","Top"]]],["font","Lyrics font","select",[["system-ui,sans-serif","Clean"],["Georgia,serif","Classic"],["'Courier New',monospace","Retro"],["Impact,'Arial Black',sans-serif","Bold"]]],["size","Lyrics size","range",[20,80]],["bar","Lyrics backdrop","range",[0,90]],["color","Lyrics color","color"],["hi","Highlight color","color"],["ch","Chorus color","color"],["chor","Highlight the chorus","checkbox"],["fill","Sing-along color fill","checkbox"],["show","Show lyrics overlay","checkbox"],["spl","Seconds per line (no timing)","range",[1,12]],["fx","Background animation","select",[["auto","Auto-change scenes"],["lounge","Lounge"],["city","City in the rain"],["neon","Neon sign"],["waveform","Waveform"],["folder","My video folder"],["video","My own video"],["off","Off"]]],["fxi","Interactive background (touch / mouse)","checkbox"],["fxreact","Screen reacts to the music's loudness (reload the page to turn off)","checkbox"],["sfx","Button sounds","checkbox"],["vol","Sound volume","range",[0,100]],["auto","Auto-fetch lyrics","checkbox"],["off","Lyrics timing offset (seconds)","range",[-20,20,0.5]]];
const WCTRL=[["bg","Page background","color"],["card","Panels","color"],["ink","Text","color"],["ac","Accent color","color"],["ac2","Second accent","color"],["tvc","Machine color","color"],["grad","Gradient background","checkbox"]];
const THEMES={
 "Calm Night":{bg:"#121a26",card:"#1b2636",ink:"#eef2f7",ac:"#7fb3d5",ac2:"#f0c987",tvc:"#3a2f28",hi:"#f0c987",ch:"#8fd6c4"},
 "Warm Cream":{bg:"#f6efe6",card:"#fffaf3",ink:"#3a2f28",ac:"#c8805a",ac2:"#7a9a7e",tvc:"#6b4a35",hi:"#ffd58a",ch:"#ff9e80"},
 "Sage Garden":{bg:"#101c17",card:"#18281f",ink:"#eaf3ec",ac:"#8fbf9f",ac2:"#e6d6a3",tvc:"#2f3b32",hi:"#e6d6a3",ch:"#9be0c3"},
 "Lavender Dusk":{bg:"#17162a",card:"#211f3a",ink:"#efeefa",ac:"#b4a7e0",ac2:"#f0b8c8",tvc:"#2c2a45",hi:"#f4d9a8",ch:"#f0b8c8"},
 "Ocean Calm":{bg:"#0e1c24",card:"#162a35",ink:"#e8f3f7",ac:"#6cc3d5",ac2:"#f2d6a2",tvc:"#22343d",hi:"#f2d6a2",ch:"#9be3d0"},
 "Rose Sand":{bg:"#f7eeee",card:"#fffafa",ink:"#3b2f33",ac:"#c9788a",ac2:"#8aa6a3",tvc:"#5b4a4e",hi:"#ffd9c2",ch:"#ffb3c1"}};
const LKEYS=["pos","font","size","bar","color","hi","ch","chor","fill","show"],PKEYS=["fx","fxi","fxreact","sfx","vol","auto","off","spl"];
const setters=[];
[[CTRL.filter(c=>LKEYS.includes(c[0])),"lctrl"],[CTRL.filter(c=>PKEYS.includes(c[0])),"pctrl"],[WCTRL,"wctrl"]].forEach(([list,box])=>list.forEach(([k,l,t,o])=>{const w=document.createElement("label");w.append(l);let e;
  if(t==="select"){e=document.createElement("select");o.forEach(([v,nm])=>e.add(new Option(nm,v)))}else{e=document.createElement("input");e.type=t;if(t==="range"){e.min=o[0];e.max=o[1];e.step=o[2]||1}}
  const ck=t==="checkbox",set=()=>{e[ck?"checked":"value"]=S.set[k]};set();setters.push(set);
  e.oninput=()=>{S.set[k]=ck?e.checked:t==="range"?+e.value:e.value;save();applySet()};w.append(e);$(box).append(w)}));
const PRE={classic:{layout:"full",pos:"bottom",font:"Georgia,serif",size:46,bar:45,color:"#ffffff",show:true},
cinema:{layout:"full",pos:"bottom",font:"system-ui,sans-serif",size:38,bar:60,color:"#ffffff",show:true},
focus:{layout:"split",pos:"middle",font:"Georgia,serif",size:56,bar:70,color:"#ffffff",show:true}};
document.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{Object.assign(S.set,PRE[b.dataset.p]);save();applySet();setters.forEach(f=>f())});

/* Toolbar: screen-layout switch and one-tap theme swatches (themes also set the lyric colors) */
const LAYOUTS=[["full","Full screen"],["split","Split"]];
LAYOUTS.forEach(([v,l])=>{const b=document.createElement("button");b.textContent=l;b.dataset.v=v;
  b.onclick=()=>{S.set.layout=v;save();applySet();setters.forEach(f=>f())};$("seg").append(b)});
Object.keys(THEMES).forEach(n=>{const b=document.createElement("button");b.className="sw";b.title=n;b.setAttribute("aria-label",n+" theme");
  b.style.setProperty("--a",THEMES[n].ac);b.style.setProperty("--b",THEMES[n].ac2);
  b.onclick=()=>{Object.assign(S.set,THEMES[n]);save();applySet();setters.forEach(f=>f())};$("swatches").append(b)});
function drawBar(){
  document.querySelectorAll("#seg button").forEach(b=>b.classList.toggle("on",b.dataset.v===S.set.layout));
  document.querySelectorAll("#swatches .sw").forEach(b=>{const t=THEMES[b.title];b.classList.toggle("on",t.bg===S.set.bg&&t.ac===S.set.ac)})}
