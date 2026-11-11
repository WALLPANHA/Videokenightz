/* App state: default settings, saved data (localStorage), small helpers. */
const D={layout:"full",pos:"bottom",font:"system-ui,sans-serif",size:46,bar:45,color:"#ffffff",hi:"#f0c987",show:true,spl:4,auto:true,off:0,ch:"#8fd6c4",chor:true,fill:true,bg:"#121a26",card:"#1b2636",ink:"#eef2f7",ac:"#7fb3d5",ac2:"#f0c987",tvc:"#3a2f28",grad:true,sfx:true,vol:60,fx:"auto",fxi:true,fxreact:false};
let S={queue:[],now:null,ov:{},custom:[],set:{}};
try{Object.assign(S,JSON.parse(localStorage.getItem("vk2")||"{}"))}catch(e){}
S.set=Object.assign({},D,S.set);
const $=i=>document.getElementById(i),save=()=>{try{localStorage.setItem("vk2",JSON.stringify(S))}catch(e){}};
const all=()=>SONGS.concat(S.custom),byId=id=>all().find(s=>s.id===id);
let cat="All",term="",lines=[],timed=false,el=0,run=false;
