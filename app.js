// ================= Yiiovo 的成长日记 · 核心逻辑 =================
const APP_VER="v20260730r"; // 手机端版本水印：改版时务必同步此值，便于确认是否刷到新版
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const todayStr=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
const dayIndex=off=>Math.floor(Date.now()/86400000)-(off||0);
const dateOf=off=>{const d=new Date(Date.now()-(off||0)*86400000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
const LS={get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},set:(k,v)=>{
  try{ localStorage.setItem(k,JSON.stringify(v)); }
  catch(e){
    // 配额超了（多因内联照片）：递归剥掉 data:image 图，保文字数据不丢
    if(e && (e.name==="QuotaExceededError"||e.code===22)){
      try{
        const clone=JSON.parse(JSON.stringify(v));
        _stripInlinePhotos(clone);
        localStorage.setItem(k,JSON.stringify(clone));
      }catch(e2){ throw e; } // 仍超则按原错误抛出
    } else throw e;
  }
}};
/* 递归剥离内联 base64 照片（data:image…），保留 http(s) 外链与文字 */
function _stripInlinePhotos(o){
  if(Array.isArray(o)){ o.forEach(_stripInlinePhotos); return; }
  if(o && typeof o==="object"){
    for(const k in o){
      const v=o[k];
      if((k==="photo"||k==="img") && typeof v==="string" && v.indexOf("data:image")===0){ o[k]=""; }
      else if(v && typeof v==="object"){ _stripInlinePhotos(v); }
    }
  }
}
function dailyPick(bank,n,off){const idx=dayIndex(off||0),out=[],start=(idx*n)%bank.length;for(let i=0;i<Math.min(n,bank.length);i++)out.push(bank[(start+i)%bank.length]);return out;}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

/* 错误捕获：只 console，不弹红条（界面干净）；以后想恢复诊断改这里 */
window.addEventListener("error",e=>console.error("[yi]",e.message,"@",e.filename+":"+e.lineno));
window.addEventListener("unhandledrejection",e=>console.error("[yi promise]",e.reason));

/* 缺 ?v= 时强制跳到带版本号 URL（绕过 HTTP 缓存） */
if(!location.search.match(/[?&]v=/)){
  location.replace("./?v="+APP_VER.replace("v","")+"&_t="+Date.now());
}

/* ============ 页面切换（支持 一级/二级 层级导航） ============ */
/* 抽成独立函数，click 与 touchend 共用（华为 WebView 的 click 偶发不触发，touchend 兜底） */
function _handleNav(e){
  const t=e.target;
  const head=t.closest(".nav-group-head");
  if(head){ head.closest(".nav-group").classList.toggle("collapsed"); return; }
  const item=t.closest(".nav-item, .nav-sub");
  if(!item) return;
  $$(".nav-item, .nav-sub").forEach(b=>b.classList.remove("active"));
  item.classList.add("active");
  $$(".page").forEach(p=>p.classList.remove("active"));
  const pg=$("#page-"+item.dataset.page); if(pg) pg.classList.add("active");
  $("#main").scrollTop=0;
  const p=item.dataset.page;
  if(p==="home"){renderHome();}
  if(p==="ledger")renderLedger();
  if(p==="health"){renderHealth();}
  if(p==="news"){const archEl=$("#news-arch-count");if(archEl)archEl.textContent=newsArchiveCount();renderNews();}
  if(p==="weekly"){renderWeekly();}
  if(p==="english")renderPapers();
  markAutoSave();
}
const sideNav=document.getElementById("side-nav");
if(sideNav){
  sideNav.addEventListener("click",_handleNav);
  // 触摸兜底：华为 WebView 的 click 偶发不触发，touchend 兜底（不做距离判定，避免 touchstart 丢失导致永久失灵）
  sideNav.addEventListener("touchend",function(e){
    e.preventDefault(); // 阻止随后可能重复的 click
    _handleNav(e);
  },{passive:false});
}
/* 侧栏折叠按钮：整栏缩到只显图标（56px），再点恢复（140px） */
const collapseBtn=$("#side-collapse");
if(collapseBtn){
  const appEl=$(".app");
  // 恢复上次状态
  try{ if(localStorage.getItem("yi_side_collapsed")==="1") appEl.classList.add("sidebar-collapsed"); }catch(_){}
  collapseBtn.addEventListener("click",e=>{
    e.stopPropagation();
    appEl.classList.toggle("sidebar-collapsed");
    try{ localStorage.setItem("yi_side_collapsed", appEl.classList.contains("sidebar-collapsed")?"1":"0"); }catch(_){}
  });
}
function gotoPage(name){
  const b=document.querySelector('[data-page="'+name+'"]');if(!b)return;
  const g=b.closest(".nav-group"); if(g) g.classList.remove("collapsed");
  b.click();
}

/* ============ 收藏系统（收藏入口放在各模块内，不在首页） ============ */
const favMeta={}; // key -> {module,id,title,ico,snippet}
function FAVS(){return LS.get("yi_favs",{});}
function cardStar(module,id,title,ico,snippet){
  const k=module+"|"+id; favMeta[k]={module,id,title,ico,snippet};
  const on=!!FAVS()[k];
  return '<button class="star-btn'+(on?" on":"")+'" data-k="'+k+'">'+(on?"★":"☆")+"</button>";
}
document.addEventListener("click",e=>{
  const b=e.target.closest(".star-btn"); if(!b)return;
  const k=b.dataset.k; if(!favMeta[k])return;
  const f=FAVS();
  if(f[k])delete f[k]; else f[k]=Object.assign({},favMeta[k],{date:todayStr()});
  LS.set("yi_favs",f);
  const on=!!f[k]; b.classList.toggle("on",on); b.textContent=on?"★":"☆";
  if(!$("#fav-modal").classList.contains("hidden"))renderFavModal();
});
const MODULE_NAME={baoyan:"🎓 保研资讯",bridge:"🌉 桥梁知识",word:"🔤 英语单词",read:"📄 文献阅读",knowledge:"💡 知识拓展",beauty:"🎀 变美&护肤"};
const MODULE_PAGE={baoyan:"baoyan",bridge:"bridge",word:"english",read:"english",knowledge:"knowledge",beauty:"beauty"};
function openFav(mod){ renderFavModal(mod); $("#fav-modal").classList.remove("hidden"); }
function renderFavModal(modFilter){
  const f=FAVS(); const keys=Object.keys(f);
  const box=$("#fav-list");
  if(!keys.length){box.innerHTML='<div class="fav-empty">还没有收藏哦～<br>在任意知识卡片点右上角 ☆ 即可收藏，进入对应模块点「❤️ 我的收藏」随时回看 💗</div>';return;}
  const groups={};
  keys.forEach(k=>{const m=f[k].module; if(modFilter&&modFilter.indexOf(m)<0)return; (groups[m]=groups[m]||[]).push(f[k]);});
  let html="";
  Object.keys(groups).forEach(m=>{
    html+='<div class="fav-group-title">'+MODULE_NAME[m]+'（'+groups[m].length+'）</div>';
    groups[m].forEach(it=>{
      html+='<div class="fav-item"><div class="fi-top"><span class="fi-ico">'+it.ico+'</span>'+
        '<span class="fi-title" data-go="'+MODULE_PAGE[m]+'">'+esc(it.title)+'</span>'+
        '<button class="fi-del" data-del="'+m+"|"+it.id+'">✕</button></div>'+
        (it.snippet?'<div class="fi-snip">'+esc(it.snippet)+'</div>':"")+'</div>';
    });
  });
  if(!html)html='<div class="fav-empty">这个模块还没有收藏哦～<br>在卡片右上角点 ☆ 就能收藏啦 💗</div>';
  box.innerHTML=html;
  box.querySelectorAll(".fi-title").forEach(t=>t.onclick=()=>{const p=t.dataset.go;$("#fav-modal").classList.add("hidden");gotoPage(p);});
  box.querySelectorAll(".fi-del").forEach(b=>b.onclick=()=>{const f2=FAVS();delete f2[b.dataset.del];LS.set("yi_favs",f2);renderFavModal(modFilter);});
}
// 各模块头「我的收藏」按钮（不再放在首页）
$$(".head-fav").forEach(b=>b.addEventListener("click",()=>{
  const mod=b.dataset.mod;
  openFav(mod==="english"?["word","read"]:[mod]);
}));
$("#fav-close").onclick=()=>$("#fav-modal").classList.add("hidden");
$("#fav-modal").addEventListener("click",e=>{if(e.target.id==="fav-modal")$("#fav-modal").classList.add("hidden");});

/* ============ 视频块（已按用户要求移除：桥梁知识手机端不显示视频） ============ */

/* ============ 饭团图片（严格按用户参考图：油画风比熊·蓝底·黄五角星·伸舌头·大腮红） ============ */
const DOG_IMG='assets/饭团.jpg';
function dogImg(cls){ return '<img src="'+DOG_IMG+'" alt="饭团" class="'+cls+'">'; }

/* ============ 每日计划 & 养成 ============ */
const PSTATE=()=>LS.get("yi_pet",{food:0,water:0,play:0,fedDates:[],lastAllDone:"",streak:0,health:70,spirit:70});
function savePet(p){LS.set("yi_pet",p);}
function grantReward(){
  const p=PSTATE();
  const r=["food","water","play"][Math.floor(Math.random()*3)];
  p[r]=(p[r]||0)+1;
  if(r==="food"){p.health=Math.min(100,p.health+2);p.spirit=Math.min(100,p.spirit+1);}
  else if(r==="water"){p.health=Math.min(100,p.health+1.5);}
  else {p.spirit=Math.min(100,p.spirit+3);}
  savePet(p);return r;
}
function consumeReward(kind){
  const p=PSTATE();if(p[kind]<=0)return;
  p[kind]--;
  const today=todayStr();
  if(kind==="food"){p.health=Math.min(100,p.health+4);p.spirit=Math.min(100,p.spirit+2);
    if(!p.fedDates.includes(today)){p.fedDates.push(today);const yst=dateOf(1);p.streak=p.fedDates.includes(yst)?p.streak+1:1;}}
  else if(kind==="water"){p.health=Math.min(100,p.health+3);}
  else {p.spirit=Math.min(100,p.spirit+5);}
  savePet(p);renderDog();
}
function getTodos(date){return LS.get("yi_todos_"+date,[]);}
function setTodos(date,list){LS.set("yi_todos_"+date,list);const all=LS.get("yi_todo_dates",[]);if(!all.includes(date)){all.push(date);LS.set("yi_todo_dates",all);}}
function missedDays(){
  const dates=LS.get("yi_todo_dates",[]);let miss=0;
  for(let off=1;off<=7;off++){const d=dateOf(off);const list=LS.get("yi_todos_"+d,null);
    if(list===null)continue;
    if(list.length>0&&list.every(t=>t.done))break; else miss++;}
  return miss;
}
function dogMood(){
  const t=getTodos(todayStr());const miss=missedDays();
  const fedToday=PSTATE().fedDates.includes(todayStr());
  if(miss>=3)return "dying"; if(miss===2)return "weak"; if(miss===1)return "hungry";
  if(fedToday)return "happy";
  if(t.length>0&&t.every(x=>x.done))return "happy";
  return "ok";
}
const MOOD_TXT={happy:"元气满满 ✨",ok:"心情不错 🐾",hungry:"有点饿了 🥺",weak:"很虚弱…💧",dying:"快饿死了！！😭"};
const MOOD_BUBBLE={happy:"汪汪！你太棒啦，饭团吃得饱饱的～ 🦴",ok:"汪！今天的计划完成了就能喂饭团狗粮哦～",hungry:"呜…昨天的任务没做完，饭团饿了一天了…",weak:"呜呜…已经两天没吃饱了，饭团快没力气了…",dying:"⚠️ 连续3天没完成计划，饭团快饿死了！！快自律起来救救我！"};
function setBar(sel,v){const el=$(sel);if(el){el.style.width=Math.max(0,Math.min(100,v))+"%";el.className="bar-fill "+(v>=70?"good":v>=40?"mid":"low");}}
function renderDog(){
  const mood=dogMood(),p=PSTATE();
  const dImg=$("#dog-img"); if(dImg) dImg.alt="饭团 · "+MOOD_TXT[mood];
  const hImg=$("#hero-dog-img"); if(hImg) hImg.alt="饭团";
  $("#dog-mood").textContent=MOOD_TXT[mood];
  $("#dog-bubble").textContent=MOOD_BUBBLE[mood];
  $("#food-count").textContent=p.food;
  $("#water-count").textContent=p.water;
  $("#play-count").textContent=p.play;
  $("#streak-count").textContent=p.streak;
  setBar("#bar-health",p.health); $("#health-val").textContent=Math.round(p.health);
  setBar("#bar-spirit",p.spirit); $("#spirit-val").textContent=Math.round(p.spirit);
  $("#btn-feed").disabled=p.food<=0;
  $("#btn-water").disabled=p.water<=0;
  $("#btn-play").disabled=p.play<=0;
  const warn=$("#dog-warn");const miss=missedDays();
  warn.textContent=miss>=3?"⚠️ 饭团已经连续 "+miss+" 天没吃饱，再不完成计划它真的会饿死的！今天必须全部完成！":
    miss>0?"提示：已连续 "+miss+" 天未完成全部计划，饭团状态变差了，今天加油补回来！":"";
}
$("#btn-feed").addEventListener("click",()=>{ if(PSTATE().food<=0)return; consumeReward("food"); triggerDogAnim("eat","🍖"); $("#dog-bubble").textContent="嗷呜～🍖 好好吃！谢谢Yiiovo，明天也要一起加油哦！"; });
$("#btn-water").addEventListener("click",()=>{ if(PSTATE().water<=0)return; consumeReward("water"); triggerDogAnim("drink","💧"); $("#dog-bubble").textContent="咕噜咕噜～💧 喝点水真舒服！"; });
$("#btn-play").addEventListener("click",()=>{ if(PSTATE().play<=0)return; consumeReward("play"); triggerDogAnim("play","🎾"); $("#dog-bubble").textContent="汪汪！🎾 陪我玩最开心啦～"; });
function triggerDogAnim(kind,emoji){
  const img=$("#dog-img"); if(!img)return;
  img.classList.remove("anim-eat","anim-drink","anim-play");
  void img.offsetWidth; // 强制重排，重启动画
  const cls=kind==="eat"?"anim-eat":kind==="drink"?"anim-drink":"anim-play";
  img.classList.add(cls);
  setTimeout(()=>img.classList.remove(cls),1700);
  const fx=$("#dog-fx"); if(fx && emoji){
    const el=document.createElement("div"); el.className="fx-float"; el.textContent=emoji;
    fx.appendChild(el);
    setTimeout(()=>el.remove(),1200);
  }
  const bub=$("#dog-bubble"); if(bub){bub.classList.remove("bubble-pop");void bub.offsetWidth;bub.classList.add("bubble-pop");}
}
function renderTodos(){
  const date=todayStr(),list=getTodos(date);
  $("#plan-date").textContent=date;
  const ul=$("#todo-list");ul.innerHTML="";
  if(!list.length)ul.innerHTML='<div class="empty-tip">还没有计划哦，添加第一条吧 🐾</div>';
  list.forEach((t,i)=>{
    const li=document.createElement("li");li.className=t.done?"done":"";
    li.innerHTML='<button class="todo-check">'+(t.done?"✓":"")+'</button><span class="todo-txt">'+esc(t.txt)+'</span><button class="todo-del">✕</button>';
    li.querySelector(".todo-check").onclick=()=>{
      const was=t.done; t.done=!t.done;setTodos(date,list);
      const p=PSTATE();
      if(!was && t.done){
        const r=grantReward();
        const names={food:"🦴 狗粮",water:"💧 清水",play:"🎾 玩耍"};
        const emoji={food:"🍖",water:"💧",play:"🎾"};
        triggerDogAnim(r,emoji[r]);
        const allDone=list.length>0&&list.every(x=>x.done);
        if(allDone&&p.lastAllDone!==date){p.lastAllDone=date;p.food++;savePet(p);}
        $("#dog-bubble").textContent="🎉 完成一项任务！获得 "+names[r]+" ×1，饭团更有活力啦～";
      }
      renderTodos();renderDog();renderHome();
    };
    li.querySelector(".todo-del").onclick=()=>{list.splice(i,1);setTodos(date,list);renderTodos();renderDog();renderHome();};
    ul.appendChild(li);
  });
  const done=list.filter(t=>t.done).length;
  $("#todo-bar").style.width=(list.length?done/list.length*100:0)+"%";
  $("#todo-tip").textContent=list.length?("已完成 "+done+" / "+list.length+(done===list.length?" · 太棒了！🎉":" · 加油！")):"";
}
function addTodo(txt){if(!txt.trim())return;const date=todayStr(),list=getTodos(date);list.push({txt:txt.trim(),done:false});setTodos(date,list);renderTodos();renderDog();renderHome();}
$("#todo-add-btn").onclick=()=>{addTodo($("#todo-input").value);$("#todo-input").value="";};
$("#todo-input").addEventListener("keydown",e=>{if(e.key==="Enter")$("#todo-add-btn").click();});

/* 打卡复盘 */
function renderReviews(){
  const rs=LS.get("yi_reviews",{});const keys=Object.keys(rs).sort().reverse().slice(0,7);
  $("#review-history").innerHTML=keys.length?keys.map(k=>'<div class="review-item"><b>'+k+"</b>　"+esc(rs[k])+"</div>").join(""):'<div class="empty-tip">还没有复盘记录</div>';
  const cur=rs[todayStr()];if(cur)$("#review-input").value=cur;
}
$("#review-save").onclick=()=>{
  const v=$("#review-input").value.trim();if(!v)return;
  const rs=LS.get("yi_reviews",{});rs[todayStr()]=v;LS.set("yi_reviews",rs);
  renderReviews();renderHome();
  $("#review-save").textContent="已保存 ✅";setTimeout(()=>$("#review-save").textContent="保存今日复盘 ✍️",1500);
};

/* ============ 保研资讯 ============ */
let baoyanFilter="all";
function infoCard(item,isNew){
  const star=cardStar("baoyan",item.school+item.title,item.school+"｜"+item.title,"🎓",item.major+" · "+item.type);
  return '<div class="info-card"><div class="info-top"><span class="info-school">'+item.school+'</span>'+
    '<span class="badge '+(item.lv==="985"?"b985":"b211")+'">'+item.lv+'</span>'+
    '<span class="badge btype">'+item.type+'</span>'+(isNew?'<span class="badge bnew">今日新增</span>':"")+"</div>"+
    '<div class="info-title">'+item.title+'</div>'+
    '<div class="info-meta">🎯 <b>方向：</b>'+item.major+'<br>🕐 <b>时间：</b>'+item.time+'<br>📌 <b>要求：</b>'+item.req+'<br>📝 <b>考核：</b>'+item.form+'</div>'+
    '<a class="info-link" href="'+item.link+'" target="_blank">🔗 前往官网核实</a>'+star+'</div>';
}
function renderBaoyan(){
  const bank=DB.baoyan;
  const todayList=dailyPick(bank,8).filter(x=>baoyanFilter==="all"||x.type===baoyanFilter);
  $("#baoyan-today").innerHTML=todayList.length?todayList.map(x=>infoCard(x,true)).join(""):'<div class="empty-tip">今日该分类暂无新增</div>';
  let arch="";
  for(let off=1;off<=5;off++){
    const list=dailyPick(bank,8,off).filter(x=>baoyanFilter==="all"||x.type===baoyanFilter);
    if(!list.length)continue;
    arch+='<div class="arch-day"><button class="arch-head" onclick="this.nextElementSibling.classList.toggle(\'hidden\')">📅 '+dateOf(off)+"（"+list.length+' 条）· 点击展开</button><div class="arch-body hidden">'+list.map(x=>infoCard(x,false)).join("")+"</div></div>";
  }
  $("#baoyan-archive").innerHTML=arch||'<div class="empty-tip">暂无归档</div>';
}
$("#baoyan-filter").addEventListener("click",e=>{
  if(!e.target.classList.contains("chip"))return;
  $$("#baoyan-filter .chip").forEach(c=>c.classList.remove("active"));e.target.classList.add("active");
  baoyanFilter=e.target.dataset.f;renderBaoyan();
});

/* ============ 桥梁知识 ============ */
let bridgeCh="all";
const CHAPTERS=["桥梁概论","桥梁类型","桥梁构造","施工技术","荷载与设计","名桥案例","桥梁与AI"];
function kItem(x,tag,module){
  const star=cardStar(module,x.ch+x.t,x.t,x.ico,x.d);
  // 传入完整对象，让 illu() 按关键词匹配到具体插画；若数据项带 img（真实照片URL/路径）则优先用照片
  const key=x.ch||x.c||"";
  const img='<div class="k-img">'+(x.img?('<img src="'+x.img+'" alt="'+esc(x.t)+'" loading="lazy">'):window.illu(x))+'</div>';
  return '<div class="k-item">'+img+'<div class="k-body"><span class="k-tag">'+(tag||key)+'</span><div class="k-t">'+esc(x.t)+'</div><div class="k-d">'+esc(x.d)+"</div></div>"+star+'</div>';
}
function renderBridge(){
  if(!LS.get("yi_bridge_first"))LS.set("yi_bridge_first",todayStr());
  const first=LS.get("yi_bridge_first",todayStr());
  const days=Math.max(1,Math.floor((Date.now()-new Date(first).getTime())/86400000)+1);
  const level=days>=21?3:days>=10?2:1;
  const adv=DB.bridgeAdvanced||[];
  const chBar=$("#bridge-chapters");
  if(!chBar.children.length){
    let chips='<button class="chip active" data-c="all">全部</button>'+CHAPTERS.map(c=>'<button class="chip" data-c="'+c+'">'+c+"</button>").join("");
    if(adv.length) chips+='<button class="chip" data-c="进阶挑战" style="background:linear-gradient(135deg,#ffe1ec,#ffd0e0);color:#c2567f">🚀 进阶挑战</button>';
    chBar.innerHTML=chips;
    chBar.addEventListener("click",e=>{if(!e.target.classList.contains("chip"))return;
      $$("#bridge-chapters .chip").forEach(x=>x.classList.remove("active"));e.target.classList.add("active");
      bridgeCh=e.target.dataset.c;renderBridge();
      // 切换类型后把知识列表滚到顶部，视觉上"跳转到该类型"
      const lp=$("#bridge-list"); if(lp&&lp.scrollIntoView)lp.scrollIntoView({block:"start"});
      if(window.scrollTo)window.scrollTo({top:0,behavior:"smooth"});
    });
  }
  let daily=[];
  if(bridgeCh==="进阶挑战"){
    daily=dailyPick(adv,Math.min(20,adv.length));
  }else{
    // 选中具体章节：直接从全库该章节中按日期轮换抽取，保证该类型知识一定出现（放到最前面）
    const bank=bridgeCh==="all"?DB.bridge:DB.bridge.filter(x=>x.ch===bridgeCh);
    daily=dailyPick(bank,Math.min(30,bank.length));
    if(bridgeCh==="all" && level>=2 && adv.length){
      daily=daily.concat(dailyPick(adv,5));
    }
  }
  const cnt=$("#bridge-count"); if(cnt)cnt.textContent=daily.length;
  let note='📖 今日已推送 <b>'+daily.length+'</b> 条知识点';
  if(level>=2) note+=' · 🎓 已解锁 <b>进阶挑战</b>（更深更难度的桥梁知识）';
  else note+=' · 坚持学习到约第 10 天会自动解锁「进阶挑战」';
  const noteEl=document.querySelector("#bridge-learn-panel .note-card.blue");
  if(noteEl)noteEl.innerHTML=note;
  const listEl=$("#bridge-list");
  if(listEl)listEl.innerHTML=daily.length?daily.map(x=>kItem(x,null,"bridge")).join(""):'<div class="empty-tip">今日该章节暂无推送，明天会轮换更新～</div>';
}
$("#bridge-history-btn").onclick=()=>{
  const box=$("#bridge-history");
  if(box.innerHTML){box.innerHTML="";return;}
  let html="";
  for(let off=1;off<=3;off++){
    const list=dailyPick(DB.bridge,30,off);
    html+='<div class="arch-day"><button class="arch-head" onclick="this.nextElementSibling.classList.toggle(\'hidden\')">📅 '+dateOf(off)+" 的 30 条知识点</button><div class=\"arch-body hidden\">"+list.map(x=>kItem(x,null,"bridge")).join("")+"</div></div>";
  }
  box.innerHTML=html;
};

/* ============ 桥梁复习模块 ============ */
let reviewRendered=false;
function renderReview(){
  const box=$("#bridge-review-panel");
  const subs=DB.review||[];
  let html='<div class="card note-card blue">🗂 8 大学科核心考点 · 点击 PDF / zip 直接打开复习资料（已复制到本地，离线可用）· 配合「知识学习」每日巩固效果最好</div>';
  html+=subs.map(r=>{
    const pdfBtns=r.pdfs.map(p=>{
      const raw=p.replace(/^复习\//,"");
      const isZip=/\.zip$/i.test(p);
      const nm=raw.replace(/\.(pdf|zip)$/i,"");
      return '<a class="rev-pdf" href="'+p+'" target="_blank">'+(isZip?"🗜 ":"📄 ")+esc(nm)+'</a>';
    }).join("");
    const pts=r.points.map(p=>'<div class="rev-pt"><b>'+esc(p.k)+'</b><span>'+esc(p.v)+'</span></div>').join("");
    const star=cardStar("bridge",r.id,r.sub,r.ico,(r.points[0]?r.points[0].v:""));
    return '<div class="rev-card" style="border-left:5px solid '+r.color+'">'+
      '<div class="rev-head"><span class="rev-ico">'+r.ico+'</span><span class="rev-sub">'+esc(r.sub)+'</span>'+star+'</div>'+
      '<div class="rev-pdfs">'+pdfBtns+'</div>'+
      '<div class="rev-pts">'+pts+'</div>'+
      '<div class="rev-tip">💡 '+esc(r.tip)+'</div>'+
    '</div>';
  }).join("");
  if(DB.reviewImgs && DB.reviewImgs.length){
    html+='<div class="card"><div class="card-title">🖼 复习参考图片（'+DB.reviewImgs.length+' 张 · 点击放大）</div><div class="rev-gallery">'+DB.reviewImgs.map(s=>'<img class="rev-thumb" src="'+s+'" alt="复习图片" loading="lazy" onclick="openRevImg(\''+s.replace(/'/g,"\\'")+'\')">').join("")+'</div></div>';
  }
  box.innerHTML=html;
}
function showReviewTab(){ if(!reviewRendered){renderReview();reviewRendered=true;} }
$$(".bridge-tabs .chip").forEach(b=>b.addEventListener("click",()=>{
  $$(".bridge-tabs .chip").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  const t=b.dataset.bt;
  $("#bridge-learn-panel").classList.toggle("hidden",t!=="learn");
  $("#bridge-review-panel").classList.toggle("hidden",t!=="review");
  if(t==="review")showReviewTab();
}));
window.openRevImg=function(src){ $("#rev-img-big").src=src; $("#rev-img-modal").classList.remove("hidden"); };
$("#rev-img-modal").addEventListener("click",e=>{ if(e.target.id==="rev-img-modal")$("#rev-img-modal").classList.add("hidden"); });

/* ============ 英语 - 单词 ============ */
let wordIdx=0,todayWords=[],wordState={};
let ACCENT=LS.get("yi_accent","en-GB");
let VOICES=[];
function loadVoices(){try{VOICES=speechSynthesis.getVoices()||[];}catch(e){VOICES=[];}}
function pickVoice(){return VOICES.find(v=>v.lang===ACCENT)||VOICES.find(v=>v.lang&&v.lang.indexOf(ACCENT.split("-")[0])===0)||null;}
if("speechSynthesis" in window){loadVoices();try{speechSynthesis.onvoiceschanged=loadVoices;}catch(e){}}
/* ============ TTS 朗读：兼容华为 Android WebView ============ */
/* Android WebView/华为浏览器的 speechSynthesis 经常无声，根因：
   1) 手机没装 TTS 引擎（华为 P60 默认无 Google TTS）
   2) speechSynthesis 需用户首次手势激活（unlock empty speak）
   3) 反复调用需要 cancel() 才能发声
   解法：检测 voice 列表为空时弹横幅指引 + 首次手势 unlock + 错误捕获。 */
let _ttsUnlocked=false, _ttsWarned=false;
let _ttsModePref="auto"; // 'auto' | 'device' | 'cloud'
try{ _ttsModePref = LS.get("yi_tts_mode")||"auto"; }catch(e){ _ttsModePref="auto"; }
function ttsUnlock(){
  if(_ttsUnlocked)return;
  if(!("speechSynthesis" in window)){_ttsUnlocked=true;return;}
  try{
    const u=new SpeechSynthesisUtterance(" ");
    u.volume=0;
    u.onend=()=>{ _ttsUnlocked=true; };
    u.onerror=()=>{ _ttsUnlocked=true; };
    speechSynthesis.speak(u);
    setTimeout(()=>{_ttsUnlocked=true;},600); // 兜底：万一 onend 不触发
  }catch(e){ _ttsUnlocked=true; }
}
function ttsHasDevice(){ return ("speechSynthesis" in window) && VOICES && VOICES.length>0; }
function ttsMode(){
  if(_ttsModePref==="cloud") return "cloud";
  if(_ttsModePref==="device") return "device";
  // auto：设备有语音引擎用设备，否则自动走云端（华为无 GMS 时常见）
  return ttsHasDevice() ? "device" : "cloud";
}

/* ---------- 云端朗读：微软 Edge TTS（免装引擎，需联网） ---------- */
let _cloudAudio=null, _cloudStopping=false;
function genUuid(){ return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){const r=Math.random()*16|0;const v=c==="x"?r:(r&0x3|0x8);return v.toString(16);}); }
function escXml(s){ return String(s==null?"":s).replace(/[<>&'"]/g,function(c){return c==="<"?"&lt;":c===">"?"&gt;":c==="&"?"&amp;":c==="'"?"&apos;":'"';}); }
/* 百度翻译公共 TTS：https://fanyi.baidu.com/gettts?lan=zh|en&text=...&spd=5&source=web
   返回 audio/mpeg，国内高速可达，无 token。文本过长按句号/换行切分播放。 */
function baiduTTS(text, rate, onEnd){
  _cloudStopping=false;
  return new Promise(function(resolve,reject){
    try{
      const isZh=/[\u4e00-\u9fa5]/.test(text) || (ACCENT||"").startsWith("zh");
      const lan=isZh?"zh":"en";
      const chunks=[];
      const segs=text.split(/(?<=[。！？!?.;；\n])/);
      let cur="";
      segs.forEach(function(s){
        if((cur+s).length>60){ if(cur)chunks.push(cur); cur=s; } else cur+=s;
      });
      if(cur)chunks.push(cur);
      if(chunks.length===0)chunks.push(text);
      let i=0;
      const playNext=function(){
        if(_cloudStopping){ resolve(); if(onEnd)onEnd(); return; }
        if(i>=chunks.length){ resolve(); if(onEnd)onEnd(); return; }
        const seg=chunks[i++];
        const enc=encodeURIComponent(seg);
        const url="https://fanyi.baidu.com/gettts?lan="+lan+"&text="+enc+"&spd=5&source=web";
        const aud=new Audio();
        _cloudAudio=aud;
        aud.preload="auto";
        aud.playbackRate=rate||0.95;
        aud.onended=function(){ if(_cloudStopping){ resolve(); if(onEnd)onEnd(); return; } setTimeout(playNext,80); };
        aud.onerror=function(){ _cloudAudio=null; reject(new Error("baidu")); };
        try{
          aud.src=url;
          const p=aud.play();
          if(p&&p.catch)p.catch(function(){ _cloudAudio=null; reject(new Error("play")); });
        }catch(e){ _cloudAudio=null; reject(e); }
      };
      playNext();
    }catch(e){ reject(e); }
  });
}
function edgeVoice(){
  if(ACCENT==="en-US") return {lang:"en-US",voice:"en-US-AriaNeural"};
  if(ACCENT==="en-GB") return {lang:"en-GB",voice:"en-GB-SoniaNeural"};
  return {lang:"zh-CN",voice:"zh-CN-XiaoxiaoNeural"};
}
function edgeTTS(text, rate, onEnd){
  _cloudStopping=false;
  return new Promise(function(resolve,reject){
    let ws;
    try{ ws=new WebSocket("wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23EA9A30FC22"); }
    catch(e){ reject(e); return; }
    ws.binaryType="arraybuffer";
    const chunks=[];
    const v=edgeVoice();
    const pct=Math.round(((rate||0.9)-1)*100);
    const ssml="<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='"+v.lang+"'><voice name='"+v.voice+"'><prosody rate='"+(pct>=0?("+"+pct):pct)+"%'>"+escXml(text)+"</prosody></voice></speak>";
    let ended=false;
    ws.onopen=function(){
      const cfg="X-Timestamp: "+new Date().toISOString()+"\r\nContent-Type: application/json; charset=utf-8\r\nPath: speech.config\r\n\r\n{\"context\":{\"synthesis\":{\"audio\":{\"metadataoptions\":{\"sentenceBoundaryEnabled\":false,\"wordBoundaryEnabled\":false},\"outputFormat\":\"audio-24khz-48kbitrate-mono-mp3\"}}}}";
      ws.send(cfg);
      const req="X-RequestId: "+genUuid()+"\r\nContent-Type: application/ssml+xml\r\nPath: ssml\r\n\r\n"+ssml;
      ws.send(req);
    };
    ws.onmessage=function(ev){
      if(typeof ev.data==="string"){
        if(ev.data.indexOf("Path:turn.end")>=0 && !ended){
          ended=true;
          if(chunks.length){
            const blob=new Blob(chunks,{type:"audio/mpeg"});
            const url=URL.createObjectURL(blob);
            const aud=new Audio(url);
            _cloudAudio=aud;
            aud.onended=function(){ try{URL.revokeObjectURL(url);}catch(e){} _cloudAudio=null; if(_cloudStopping)return; resolve(); if(onEnd)onEnd(); };
            aud.onerror=function(){ try{URL.revokeObjectURL(url);}catch(e){} _cloudAudio=null; reject(new Error("play")); };
            aud.play().catch(function(err){ try{URL.revokeObjectURL(url);}catch(e){} _cloudAudio=null; reject(err); });
          }else{ resolve(); if(onEnd)onEnd(); }
          try{ws.close();}catch(e){}
        }
      }else{
        try{
          const data=new Uint8Array(ev.data);
          const hl=(data[0]<<8)|data[1];
          const header=new TextDecoder().decode(data.slice(2,2+hl));
          if(header.indexOf("Path:audio")>=0){ chunks.push(data.slice(2+hl)); }
        }catch(e){}
      }
    };
    ws.onerror=function(){ if(!ended){ ended=true; reject(new Error("ws")); } };
  });
}
/* 有道词典公共 TTS：https://dict.youdao.com/dictvoice?type=0&audio={text}
   type=0 美式英语 / type=1 英式英语。中文用 type=2。
   国内稳定可达，免 key，无 CORS 限制。 */
function youdaoTTS(text, rate, onEnd){
  return new Promise(function(resolve,reject){
    try{
      const isEn=/^[A-Za-z\s\d\.\,\?\!\'\"\:\;\-\(\)]+$/.test(text.trim());
      let type="2"; // 中文
      if(isEn){
        if(ACCENT==="en-US") type="0";
        else if(ACCENT==="en-GB") type="1";
        else type="0";
      }
      const enc=encodeURIComponent(text.trim().slice(0,200));
      const url="https://dict.youdao.com/dictvoice?type="+type+"&audio="+enc;
      const aud=new Audio();
      _cloudAudio=aud;
      aud.preload="auto";
      aud.playbackRate=rate||1;
      aud.onended=function(){ _cloudAudio=null; resolve(); if(onEnd)onEnd(); };
      aud.onerror=function(){ _cloudAudio=null; reject(new Error("youdao")); };
      try{
        aud.src=url;
        const p=aud.play();
        if(p&&p.catch)p.catch(function(){ _cloudAudio=null; reject(new Error("play")); });
      }catch(e){ _cloudAudio=null; reject(e); }
    }catch(e){ reject(e); }
  });
}
function cloudStop(){ _cloudStopping=true; if(_cloudAudio){ try{_cloudAudio.pause();}catch(e){} _cloudAudio=null; } }

/* 统一云端入口：有道（国内最稳）→ 百度 → Edge */
function cloudSpeak(text, rate, onEnd){
  _cloudStopping=false;
  return youdaoTTS(text, rate, onEnd).catch(function(err){
    console.warn("youdao tts failed, try baidu", err);
    return baiduTTS(text, rate, onEnd).catch(function(err2){
      console.warn("baidu tts failed, try edge", err2);
      return edgeTTS(text, rate, onEnd);
    });
  });
}

/* 长文本云端朗读：按句号切段，逐句朗读
   - 复用单个 Audio 元素（华为浏览器禁止异步回调里 new Audio().play()，
     必须用首次用户手势激活的同一个元素切 src 才能连续播放）
   - 优先有道 → 失败试百度 → 再失败跳过继续
   - onProgress(idx, segText) 每句开播前回调（用于高亮）
   - 支持 cloudStop() 中断 */
function cloudSpeakLong(text, rate, onEnd, onProgress){
  _cloudStopping=false;
  const sentences = String(text||"").match(/[^.!?。！？\n]+[.!?。！？]?/g) || [text];
  let i=0, failed=0;
  const aud=new Audio();
  _cloudAudio=aud;
  aud.preload="auto";
  aud.playbackRate=rate||1;
  function playSeg(seg, provider){
    if(_cloudStopping)return;
    let url;
    if(provider==="baidu"){
      const isZh=/[\u4e00-\u9fa5]/.test(seg);
      url="https://fanyi.baidu.com/gettts?lan="+(isZh?"zh":"en")+"&text="+encodeURIComponent(seg.slice(0,200))+"&spd=5&source=web";
    }else{
      const isEn=/^[A-Za-z\s\d\.\,\?\!\'\"\:\;\-\(\)]+$/.test(seg.trim());
      let type="2";
      if(isEn){ type = (ACCENT==="en-GB")?"1":"0"; }
      url="https://dict.youdao.com/dictvoice?type="+type+"&audio="+encodeURIComponent(seg.trim().slice(0,200));
    }
    aud.src=url;
    const p=aud.play();
    if(p&&p.catch)p.catch(function(){
      // play 失败：试百度，百度也失败跳过
      if(provider==="youdao"){ playSeg(seg,"baidu"); }
      else { i++; setTimeout(nextSeg, 50); }
    });
  }
  aud.onended=function(){
    if(_cloudStopping)return;
    i++;
    setTimeout(nextSeg, 120);
  };
  aud.onerror=function(){
    if(_cloudStopping)return;
    // 当前源失败：youdao 失败试 baidu，baidu 失败跳过
    if(failed===0){ failed=1; playSeg(sentences[i]&&sentences[i].trim(),"baidu"); }
    else { i++; failed=0; setTimeout(nextSeg, 50); }
  };
  function nextSeg(){
    if(_cloudStopping) return;
    if(i>=sentences.length){ if(onEnd)onEnd(); return; }
    const seg=sentences[i].trim();
    if(!seg || seg.length<2){ i++; nextSeg(); return; }
    failed=0;
    if(onProgress) onProgress(i, seg);
    playSeg(seg,"youdao");
  }
  nextSeg();
}

/* ---------- Web Audio 朗读（base64 内联音频，彻底绕开华为"异步 play 被拦截"） ----------
   原理：用户点击手势内创建/恢复 AudioContext（state→running）后，
   AudioBufferSourceNode.start() 的异步播放不受浏览器自动播放策略限制。
   音频由 gen-tts.js 预生成并 base64 内联到 tts-data.js（沙箱静态服务器对 .mp3 返回空，故用 JS 文本载体）。 */
let _actx=null, _waSource=null, _waStopped=false;
let _ttsLoaded=false, _ttsLoading=null;
function loadTTSData(){
  if(_ttsLoaded) return Promise.resolve();
  if(_ttsLoading) return _ttsLoading;
  _ttsLoading=new Promise(res=>{
    const s=document.createElement("script");
    s.src="tts-data.js?v=20260729ak";
    s.onload=()=>{ _ttsLoaded=true; res(); };
    s.onerror=()=>{ res(); };
    document.head.appendChild(s);
  });
  return _ttsLoading;
}
function ensureWA(){
  if(!_actx){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(AC) _actx=new AC();
  }
  if(_actx && _actx.state==="suspended"){ try{_actx.resume();}catch(e){} }
  return _actx;
}
function splitSegs(text){
  const raw=String(text||"").match(/[^.!?。！？\n]+[.!?。！？]?/g)||[text];
  const out=[];
  raw.forEach(r=>{
    r=r.trim(); if(!r)return;
    if(r.length<=150){ out.push(r); return; }
    const parts=r.split(/([,;，；])/);
    let buf="";
    parts.forEach(p=>{ if((buf+p).length<=150){buf+=p;}else{if(buf.trim())out.push(buf.trim());buf=p;} });
    if(buf.trim())out.push(buf.trim());
  });
  return out;
}
function waStop(){
  _waStopped=true;
  if(_waSource){ try{_waSource.stop();}catch(e){} _waSource=null; }
}
function fallbackSeg(seg, rate, cb){ cloudSpeakLong(seg, rate, cb); }
function b64ToBuf(b64){
  const bin=atob(b64), len=bin.length;
  const ab=new ArrayBuffer(len), u8=new Uint8Array(ab);
  for(let k=0;k<len;k++) u8[k]=bin.charCodeAt(k);
  return ab;
}
async function playTTSViaWA(input, rate, onEnd, onProgress, prefix){
  _waStopped=false;
  await loadTTSData();
  const segs = Array.isArray(input) ? input.map(s=>String(s).trim()).filter(Boolean) : splitSegs(input);
  let i=0;
  function next(){
    if(_waStopped) return;
    if(i>=segs.length){ if(onEnd)onEnd(); return; }
    const seg=segs[i]; const idx=i;
    if(onProgress) onProgress(idx, seg);
    i++;
    const ctx=ensureWA();
    const key=prefix+"/"+idx;
    const b64=window.YI_TTS && window.YI_TTS[key];
    if(ctx && b64){
      try{
        ctx.decodeAudioData(b64ToBuf(b64)).then(audioBuf=>{
          if(_waStopped) return;
          const src=ctx.createBufferSource();
          src.buffer=audioBuf; src.playbackRate.value=rate||1;
          src.connect(ctx.destination);
          _waSource=src;
          src.onended=()=>{ if(_waSource===src) next(); };
          src.start(0);
        }).catch(()=>{ fallbackSeg(seg, rate, next); });
        return;
      }catch(e){ /* fall through to fallback */ }
    }
    fallbackSeg(seg, rate, next);
  }
  next();
}

/* speak(text, rate, onEnd)
   - onEnd：本段朗读结束后的回调（逐段朗读靠它推进）
   - 优先设备语音；设备无引擎（华为无 GMS）自动走 Edge 云端朗读；设备报错也兜底云端 */
function speak(text,rate,onEnd,opts){
  opts=opts||{};
  try{
    if(ttsMode()==="cloud" && !opts.deviceOnly){
      cloudSpeak(text, rate, onEnd).catch(function(err){
        console.warn("cloud tts failed", err);if(onEnd)onEnd();
      });
      return;
    }
    // device - 华为 HarmonyOS 即便 voices=[] 也内置引擎，故直接探测
    if(!("speechSynthesis" in window)){
      if(opts.deviceOnly){ if(onEnd)onEnd(); return; }
      cloudSpeak(text,rate,onEnd).catch(function(){if(onEnd)onEnd(); });
      return;
    }
    if(!_ttsUnlocked){ttsUnlock();}
    let deviceWorked=false;
    const doSpeak=()=>{
      try{
        speechSynthesis.cancel();
        const u=new SpeechSynthesisUtterance(text);
        const isZh=/[\u4e00-\u9fa5]/.test(text);
        u.lang=isZh?"zh-CN":(ACCENT||"en-GB");
        // 不指定 u.voice — 让浏览器/系统默认引擎接手（即便 voices=[] 也能发声）
        u.rate=rate||(isZh?0.95:0.9); u.pitch=1; u.volume=1;
        u.onstart=function(){ deviceWorked=true; };
        u.onend=function(){ deviceWorked=true; if(onEnd)onEnd(); };
        u.onerror=function(e){
          if(e && e.error && (e.error==="interrupted"||e.error==="canceled")){ if(onEnd)onEnd(); return; }
          console.warn("TTS device error",e&&e.error);
          if(opts.deviceOnly){ if(onEnd)onEnd(); return; }
          cloudSpeak(text, rate, onEnd).catch(function(){if(onEnd)onEnd(); });
        };
        speechSynthesis.speak(u);
        if(opts.deviceOnly) return; // 长文本强制设备：不再探测云端
        // 探测：短文本 1.5s / 长文本 3s（华为 TTS 启动慢，1.5s 会误判）
        const probe=opts.longText?3000:1500;
        setTimeout(function(){
          try{
            if(deviceWorked || speechSynthesis.speaking) return;
            cloudSpeak(text,rate,onEnd).catch(function(){if(onEnd)onEnd(); });
          }catch(e){
            cloudSpeak(text,rate,onEnd).catch(function(){if(onEnd)onEnd(); });
          }
        }, probe);
      }catch(e){
        console.warn(e);
        if(opts.deviceOnly){ if(onEnd)onEnd(); return; }
        cloudSpeak(text, rate, onEnd).catch(function(){if(onEnd)onEnd(); });
      }
    };
    if(_ttsUnlocked) doSpeak();
    else setTimeout(doSpeak, 350);
  }catch(e){ console.warn(e); if(onEnd)onEnd(); }
}
window.speak=speak;
/* 朗读方式切换（自动/云端/设备），持久化到 yi_tts_mode */
(function initTtsUI(){
  const cur=LS.get("yi_tts_mode")||"auto";
  const radios=document.querySelectorAll('input[name="tts_mode"]');
  if(!radios.length)return;
  radios.forEach(function(r){
    if(r.value===cur) r.checked=true;
    r.addEventListener("change",function(){
      if(!r.checked)return;
      _ttsModePref=r.value;
      try{ LS.set("yi_tts_mode",r.value); }catch(e){}
    });
  });
})();
function loadWordDay(){
  todayWords=dailyPick(DB.words,50);
  wordState=LS.get("yi_words_"+todayStr(),{});
  wordIdx=0;while(wordIdx<50&&wordState[wordIdx]!==undefined)wordIdx++;
  if(wordIdx>=50)wordIdx=0;
  renderFlash();
}
function renderFlash(){
  const w=todayWords[wordIdx];if(!w)return;
  $("#flash-count").textContent=(wordIdx+1)+" / 50";
  $("#flash-word").textContent=w.en;
  $("#flash-phon").textContent="";
  $("#flash-answer").classList.add("hidden");
  $("#flash-btns").classList.remove("hidden");
  $("#flash-next-row").classList.add("hidden");
  $("#flash-cn").textContent=w.cn;
  $("#flash-sent").textContent="📌 "+w.s;
  $("#flash-sentcn").textContent=w.sc;
  updateWordStat();
}
function reveal(known){
  wordState[wordIdx]=known;LS.set("yi_words_"+todayStr(),wordState);
  $("#flash-answer").classList.remove("hidden");
  $("#flash-btns").classList.add("hidden");
  $("#flash-next-row").classList.remove("hidden");
  updateWordStat();renderHome();
}
function updateWordStat(){
  const vals=Object.values(wordState);
  const know=vals.filter(v=>v===true).length,unknow=vals.filter(v=>v===false).length;
  $("#word-bar").style.width=(vals.length/50*100)+"%";
  $("#word-stat").textContent="已背 "+vals.length+" / 50 · 认识 "+know+" · 待巩固 "+unknow;
}
$("#flash-sound").onclick=()=>speak(todayWords[wordIdx].en);
$("#btn-know").onclick=()=>reveal(true);
$("#btn-unknow").onclick=()=>{reveal(false);speak(todayWords[wordIdx].en);};
$("#btn-next-word").onclick=()=>{wordIdx=(wordIdx+1)%50;renderFlash();};
$("#btn-undo-word").onclick=()=>{ wordState[wordIdx]=undefined; LS.set("yi_words_"+todayStr(),wordState); renderFlash(); updateWordStat(); renderHome(); };
$("#word-list-btn").onclick=()=>{
  const box=$("#word-full-list");
  if(!box.classList.contains("hidden")){box.classList.add("hidden");return;}
  box.classList.remove("hidden");
  box.innerHTML=todayWords.map((w,i)=>'<div class="word-row"><div><div class="w-en">'+w.en+'</div><div class="w-cn">'+w.cn+'</div></div>'+
    cardStar("word",w.en,w.en,"🔤",w.cn)+
    '<button onclick="speak(\''+w.en.replace(/'/g,"\\'")+'\')">🔊</button></div>').join("");
};
window.speak=speak;

/* 英语 tabs */
$$(".etab").forEach(b=>b.addEventListener("click",()=>{
  $$(".etab").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  $$(".etab-panel").forEach(p=>p.classList.add("hidden"));
  $("#epanel-"+b.dataset.t).classList.remove("hidden");
  if(b.dataset.t==="trans")renderTrans();
  if(b.dataset.t==="ted")renderTed();
}));

/* 英语 - 阅读 */
function renderReadings(){
  const list=dailyPick(DB.readings,5);
  $("#reading-list").innerHTML=list.map((r,i)=>{
    const opts=r.opts.map((o,j)=>'<button class="q-opt" data-r="'+i+'" data-j="'+j+'">'+String.fromCharCode(65+j)+". "+esc(o)+"</button>").join("");
    const star=cardStar("read",r.title,r.title,"📄",r.en.slice(0,40));
    return '<div class="read-card"><div class="read-title">📄 '+esc(r.title)+'</div><div class="read-src">'+esc(r.src)+'</div>'+
      '<div class="read-en">'+esc(r.en)+'</div>'+
      '<button class="btn-ghost sm toggle-cn">🇨🇳 查看中文翻译</button><div class="read-cn hidden">'+esc(r.cn)+"</div>"+
      '<div class="read-q"><div class="q-t">🤔 阅读理解：'+esc(r.q)+"</div>"+opts+'<div class="q-fb" style="font-size:12px;margin-top:4px;"></div></div>'+star+'</div>';
  }).join("");
  $$("#reading-list .toggle-cn").forEach(b=>b.onclick=()=>b.nextElementSibling.classList.toggle("hidden"));
  $$("#reading-list .q-opt").forEach(b=>b.onclick=()=>{
    const r=dailyPick(DB.readings,5)[+b.dataset.r];
    const box=b.parentElement;
    box.querySelectorAll(".q-opt").forEach((o,j)=>{o.classList.remove("right","wrong");if(j===r.a)o.classList.add("right");});
    if(+b.dataset.j!==r.a)b.classList.add("wrong");
    box.querySelector(".q-fb").textContent=(+b.dataset.j===r.a)?"✅ 回答正确！":"❌ 再想想，正确答案是 "+String.fromCharCode(65+r.a);
  });
}

/* 英语 - 翻译练习（中译英 / 英译中，自动判分 + 范例） */
let transCur=null;
function normT(s){return (s||"").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g,"").trim();}
function simT(a,b){
  a=normT(a);b=normT(b);if(!a||!b)return 0;
  const sa=new Set(a.split("")),sb=new Set(b.split(""));let hit=0;
  sa.forEach(c=>{if(sb.has(c))hit++;});
  return hit/Math.max(a.length,b.length);
}
function renderTrans(){
  const bank=DB.trans||[];if(!bank.length){$("#trans-box").innerHTML='<div class="empty-tip">暂无翻译题库</div>';return;}
  transCur=bank[Math.floor(Math.random()*bank.length)];
  const ask=transCur.type==="zh2en"?transCur.zh:transCur.en;
  const dir=transCur.type==="zh2en"?"中译英":"英译中";
  $("#trans-box").innerHTML=
    '<div class="trans-dir">🎯 方向：'+dir+'</div>'+
    '<div class="trans-q">'+esc(ask)+'</div>'+
    '<textarea id="trans-input" class="trans-input" placeholder="'+(transCur.type==="zh2en"?"在这里写下英文翻译…":"在这里写下中文翻译…")+'"></textarea>';
  $("#trans-fb").innerHTML="";$("#trans-score").textContent="";
}
function transCheck(){
  if(!transCur)return;
  const inp=$("#trans-input");if(!inp)return;
  const ans=normT(inp.value);
  if(!ans){alert("先写点什么再检查哦～");return;}
  const correct=transCur.type==="zh2en"?transCur.en:transCur.zh;
  const nc=normT(correct);
  const s=simT(inp.value,correct);
  let verdict,cls;
  if(ans===nc){verdict="✅ 完全正确！";cls="ok";}
  else if(s>=0.85){verdict="🟡 基本正确，有小瑕疵（拼写/空格/标点）";cls="warn";}
  else {verdict="❌ 还差一点，看看参考译文";cls="bad";}
  const ref=transCur.type==="zh2en"?transCur.en:transCur.zh;
  $("#trans-fb").innerHTML=
    '<div class="trans-verdict '+cls+'">'+verdict+'</div>'+
    '<div class="trans-ref">✅ 参考：'+esc(ref)+'</div>'+
    (transCur.tip?'<div class="trans-tip">💡 '+esc(transCur.tip)+'</div>':'');
  let sc=LS.get("yi_trans_score",{ok:0,total:0});
  sc.total++;if(ans===nc)sc.ok++;LS.set("yi_trans_score",sc);
  $("#trans-score").textContent="累计正确 "+sc.ok+"/"+sc.total;
}
if($("#trans-check"))$("#trans-check").onclick=transCheck;
if($("#trans-next"))$("#trans-next").onclick=renderTrans;
window.renderTrans=renderTrans;

/* 英语 - TED 文章朗读（每日一篇） */
let tedCur=null,tedPlaying=false;
function pickTedToday(){const all=DB.ted||[];if(!all.length)return null;return all[dayIndex()%all.length];}
function renderTed(){
  if(!tedCur)tedCur=pickTedToday()||(DB.ted&&DB.ted[0]);
  if(!tedCur){$("#ted-text").innerHTML='<div class="empty-tip">暂无 TED 文稿</div>';return;}
  $("#ted-pick").innerHTML='<div class="ted-title">🎤 '+esc(tedCur.title)+'</div><div class="ted-author">'+esc(tedCur.author||"")+'</div>';
  const enPs=(tedCur.text||"").split("\n\n").map(s=>s.trim()).filter(Boolean);
  const cnPs=(tedCur.cn||"").split("\n\n").map(s=>s.trim()).filter(Boolean);
  let html="";
  enPs.forEach((p,i)=>{
    html+='<div class="ted-para"><p class="ted-en">'+esc(p)+'</p>';
    if(cnPs[i])html+='<p class="ted-cn hidden">'+esc(cnPs[i])+'</p>';
    html+='</div>';
  });
  $("#ted-text").innerHTML=html;
  const btn=$("#ted-cn");if(btn){btn.textContent="🌐 显示中文翻译";btn.dataset.on="0";}
  $("#ted-tip").textContent="📅 今日推送：《"+tedCur.title+"》 · 明天自动换一篇（点「显示中文翻译」对照阅读）";
}
function tedPlay(){
  if(!tedCur||!tedCur.text)return;
  if(tedPlaying)return;
  tedPlaying=true;if($("#ted-play"))$("#ted-play").textContent="⏳ 加载语音…";
  // 整篇切句后用 Web Audio 播放同源预生成 mp3（手势内激活 AudioContext，异步 start 不受自动播放限制）
  const idx = dayIndex() % (DB.ted?DB.ted.length:1);
  playTTSViaWA(tedCur.text, 0.92, function(){
    tedPlaying=false;if($("#ted-play"))$("#ted-play").textContent="▶ 开始朗读";
    $$("#ted-text .ted-en").forEach(p=>p.classList.remove("now"));
  }, function(idx2, seg){
    if(!seg)return;
    const key=seg.slice(0, Math.min(12, seg.length));
    $$("#ted-text .ted-en").forEach(p=>{
      const hit=(p.textContent||"").includes(key);
      p.classList.toggle("now", hit);
      if(hit && p.scrollIntoView) p.scrollIntoView({block:"center"});
    });
  }, "ted"+idx);
}
function tedStop(){ tedPlaying=false; try{speechSynthesis.cancel();}catch(e){} cloudStop(); waStop(); if($("#ted-play"))$("#ted-play").textContent="▶ 开始朗读"; }
if($("#ted-play"))$("#ted-play").onclick=tedPlay;
if($("#ted-stop"))$("#ted-stop").onclick=tedStop;
if($("#ted-cn"))$("#ted-cn").onclick=()=>{
  const on=$("#ted-cn").dataset.on==="1";
  $("#ted-cn").dataset.on=on?"0":"1";
  $("#ted-cn").textContent=on?"🌐 显示中文翻译":"🌐 隐藏中文翻译";
  $$("#ted-text .ted-cn").forEach(p=>p.classList.toggle("hidden",on));
};
if($("#ted-next"))$("#ted-next").onclick=()=>{ tedStop(); tedCur=pickTedToday()||(DB.ted&&DB.ted[0]); renderTed(); };
window.renderTed=renderTed;


/* ============ 变美·护肤品拍照分析 ============ */
const SK_GENTLE=["芙丽芳丝","珂润","至本","薇诺娜","cerave","适乐肤","丝塔芙","雅漾","理肤泉","薇姿","启初","悦木之源","珂莱丽尔","雅诗兰黛小棕瓶(慎)","海蓝之谜(慎)","fresh","黛珂","怡丽丝尔","芙丽芳丝化妆水","IPSA","芳珂","fancl"];
const SK_HARD=["水杨酸","果酸","A 醇","A醇","视黄醇","retinol","377","苯甲酰","壬二酸","高浓度 VC","左旋 C","烟酰胺","磨砂","撕拉","清洁面膜","黑炭","冻干粉","377精华","a酸","果酸身体乳"];
const SK_BASIC_TAG={"洁面":"洁面","洗面奶":"洁面","卸妆":"卸妆","化妆水":"水","爽肤水":"水","水乳":"水","精华水":"水","精华":"精华","肌底液":"精华","面霜":"面霜","乳液":"乳液","防晒":"防晒","霜":"面霜","喷雾":"喷雾","面膜":"面膜","眼霜":"眼霜"};
function skClassifyItem(name){
  for(const k in SK_BASIC_TAG){
    if(name.includes(k))return SK_BASIC_TAG[k];
  }
  return "其他";
}
function skAnalyze(){
  const res=$("#sk-result");
  if(!res)return;
  if(!$("#sk-list").value.trim()){
    res.innerHTML='<div class="sk-warn">先写一下你有哪些护肤品（至少写一行）</div>';
    res.scrollIntoView({behavior:"smooth",block:"center"});
    return;
  }
  res.innerHTML='<div class="sk-warn">🔍 正在分析你的护肤阵容…</div>';
  // 先让 loading 渲染出来，再做（避免大段渲染卡住像“没反应”）
  setTimeout(()=>{
    try{
      const listRaw=$("#sk-list").value.trim();
      const items=listRaw.split(/[\n,,;;、\s]+/).map(s=>s.trim()).filter(s=>s.length>1);
      const concerns=$$(".sk-concern:checked").map(c=>c.value);
      const bp=getBeautyProfile();
      // 分类
      const buckets={};items.forEach(n=>{const t=skClassifyItem(n);(buckets[t]=buckets[t]||[]).push(n);});
      // 检测猛药
      const hardHits=items.filter(n=>SK_HARD.some(h=>n.toLowerCase().includes(h.toLowerCase())));
      // 检测温和
      const gentleHits=items.filter(n=>SK_GENTLE.some(g=>n.toLowerCase().includes(g.toLowerCase())));
      // 缺失关键步骤
      const missing=[];["洁面","水","面霜","防晒"].forEach(k=>{if(!Object.keys(buckets).some(x=>x.includes(k)))missing.push(k);});
      // 输出
      let html='<div class="sk-block"><b>📋 你的现有产品（按类型）</b>';
      for(const k of Object.keys(buckets)){
        html+='<div class="sk-line"><span class="sk-tag">'+k+'</span> '+buckets[k].map(esc).join('、')+'</div>';
      }
      html+='</div>';
      // 保留建议
      html+='<div class="sk-block"><b>✅ 可以保留（温和不致痘优先）</b><div class="sk-line">';
      if(gentleHits.length){
        html+=gentleHits.map(esc).join('、')+' —— 都是经典温和、不致痘款，适合你「'+esc(bp.skinType)+'」肤质，可以放心继续用。';
      }else{
        html+='没检测到明确的温和派品牌。建议你补一个珂润 / 薇诺娜 / 至本 / 适乐肤 类作为"安全牌"。';
      }
      html+='</div></div>';
      // 警惕
      html+='<div class="sk-block"><b>⚠️ 谨慎使用 / 减频</b><div class="sk-line">';
      if(hardHits.length){
        html+=hardHits.map(esc).join('、')+' —— 你当前档案为「'+esc(bp.barrier)+'」，这类<b>猛药</b>建议：<br>① 减频到每周 1-2 次 ② T 区出油区可正常用，避开泛红/敏感区 ③ 与神经酰胺面霜同用修护。';
      }else{
        html+='没检测到猛药成分，敏感肌状态更稳啦 👍';
      }
      html+='</div></div>';
      // 缺失补充
      html+='<div class="sk-block"><b>➕ 建议补充（按你关心的问题）</b><div class="sk-line">';
      const sug=[];
      if(missing.includes("洁面"))sug.push('<b>洁面</b>：芙丽芳丝 / 至本舒颜 / 珂润泡沫洁面，氨基酸表活，敏感肌标配');
      if(missing.includes("防晒"))sug.push('<b>防晒</b>：薇诺娜清透防晒乳 / 怡丽丝尔金管，混油皮选轻薄不闷痘款，防痘印加深');
      if(missing.includes("面霜"))sug.push('<b>面霜</b>：适乐肤 C 霜 / 珂润润浸保湿面霜，含神经酰胺修护屏障');
      if(missing.includes("水"))sug.push('<b>水</b>：至本舒颜修护水 / 薇诺娜舒敏保湿润肤水');
      // 按困扰
      if(concerns.includes("闭口粉刺")||concerns.includes("下巴小疙瘩")){
        sug.push('<b>局部闭口</b>：stridex 0.5% 棉片 / 博乐达 2% 水杨酸，每周 2 次点涂下巴+额头闭口');
      }
      if(concerns.includes("两颊泛红")){
        sug.push('<b>泛红急救</b>：可复美胶原棒 / 薇诺娜舒敏霜，泛红严重时局部湿敷');
      }
      if(concerns.includes("炎性痘痘")){
        sug.push('<b>炎性痘</b>：点涂过氧化苯甲酰(BPO) 2.5% 或壬二酸，切忌手挤；与闭口区的低浓度水杨酸分区使用');
      }
      if(concerns.includes("陈旧痘印")){
        sug.push('<b>陈旧痘印</b>：褐色印用含烟酰胺 / 传明酸精华淡化；红色印可低浓度壬二酸；严格防晒防加深');
      }
      if(concerns.includes("毛孔粗大")){
        sug.push('<b>毛孔</b>：混油皮做好「T 区控油 + 两颊保湿」，毛孔视觉更干净；不建议强清洁或撕拉，会加重出油和闭口');
      }
      if(concerns.includes("鼻子黑头")){
        sug.push('<b>黑头</b>：一周 1 次霍霍巴油按摩 + 氨基酸洁面，以溶代挤；T 区可低浓度水杨酸棉片');
      }
      if(concerns.includes("孕/哺乳期")){
        sug.push('<b>孕/哺乳期</b>：停水杨酸 / 视黄醇 / 377；用基础保湿+物理防晒即可');
      }
      html+=sug.length?sug.map(s=>'· '+s).join('<br>'):'你现有的配置已经比较完整，继续保持。';
      html+='</div></div>';
      // 早晚顺序
      html+='<div class="sk-block"><b>🌅🌙 建议使用顺序</b>';
      html+='<div class="sk-line"><b>早：</b>洁面（可清水）→ 化妆水 → 精华 → 面霜 → 防晒</div>';
      html+='<div class="sk-line"><b>晚：</b>卸妆（用了防晒就要）→ 洁面 → 化妆水 → 精华（避开猛药区）→ 面霜 → 局部水杨酸（仅闭口）</div>';
      html+='<div class="sk-line">⚠️ 重点：泛红/敏感区不要叠加猛药和酸；T 区出油偏多可重点控油，两颊偏干只薄涂保湿；涂护肤品从 T 区开始，最后到两颊。';
      html+='</div></div>';
      res.innerHTML=html;
      res.scrollIntoView({behavior:"smooth",block:"center"});
      // 保存历史
      const photo=$("#sk-photo-preview").src||"";
      const hist=LS.get("yi_sk_history",[]);
      hist.unshift({ts:Date.now(),list:items,concerns,photo,result:html});
      if(hist.length>10)hist.length=10;
      LS.set("yi_sk_history",hist);
      renderSkHistory();
    }catch(err){
      res.innerHTML='<div class="sk-warn">分析出错了：'+esc(err&&err.message||String(err))+'<br>请刷新页面重试。</div>';
      res.scrollIntoView({behavior:"smooth",block:"center"});
    }
  },30);
}
function renderSkHistory(){
  const hist=LS.get("yi_sk_history",[]);
  const el=$("#sk-history"); if(!el)return;
  if(!hist.length){el.innerHTML='';return;}
  el.innerHTML='<div class="sk-h-title">📂 历史分析（最近 '+hist.length+' 条）</div>'+hist.map(h=>
    '<div class="sk-h-item">'+
      (h.photo?'<img class="diet-thumb" src="'+h.photo+'">':'')+
      '<div class="sk-h-meta"><b>'+new Date(h.ts).toLocaleString()+'</b><br>'+
      '<span class="sk-tag">'+h.list.slice(0,4).join('、')+(h.list.length>4?'…':'')+'</span></div>'+
      '<div class="sk-h-result">'+h.result.slice(0,180)+'…</div></div>'
  ).join("");
}
function skBind(){
  if($("#sk-photo"))$("#sk-photo").addEventListener("change",async e=>{
    const f=e.target.files[0];if(!f)return;e.target.value="";
    const du=await pickPhoto(f);
    if(du){$("#sk-photo-preview").src=du;$("#sk-photo-preview").classList.remove("hidden");}
  });
  if($("#sk-analyze-btn"))$("#sk-analyze-btn").onclick=skAnalyze;
  renderSkHistory();
}
skBind();

/* ============ 专属档案（可编辑，驱动护肤建议） ============ */
function getBeautyProfile(){
  return LS.get("yi_beauty_profile",{
    height:"158cm", weight:"105 斤",
    shape:"梨形（腿粗+屁股大，腰正常不细）",
    skinType:"混合偏油（T区油·两颊偏干）",
    barrier:"屏障受损（外油内干）",
    concerns:["闭口粉刺","炎性痘痘","陈旧痘印","两颊泛红","毛孔粗大","鼻子黑头"],
    history:"曾刷酸，皮肤先变干后转油",
    note:"护肤做减法、拒绝猛药"
  });
}
function setBeautyProfile(p){ LS.set("yi_beauty_profile",p); }
function renderBeautyArchive(){
  const el=$("#beauty-archive"); if(!el)return;
  const p=getBeautyProfile();
  el.innerHTML='💗 <b>你的专属档案</b>：身高 '+esc(p.height)+' · 体重 '+esc(p.weight)+
    ' · <b>'+esc(p.shape)+'</b> · '+esc(p.skinType)+' · '+esc(p.barrier)+
    ' · 困扰：'+p.concerns.map(esc).join('、')+
    (p.history?(' · 护肤史：'+esc(p.history)):'')+
    ' —— 穿搭/塑形主攻<b>遮胯不遮腰 + 收腹核心训练</b>，'+esc(p.note)+'。'+
    '<button class="archive-edit" id="archive-edit">✏️ 编辑</button>';
  const btn=$("#archive-edit"); if(btn)btn.onclick=openArchiveEditor;
}
function syncSkConcerns(concerns){
  $$(".sk-concern").forEach(c=>{ c.checked=concerns.includes(c.value); });
}
function openArchiveEditor(){
  const p=getBeautyProfile();
  const set=(id,v)=>{const e=$(id);if(e)e.value=v;};
  set("#ba-height",p.height);set("#ba-weight",p.weight);set("#ba-shape",p.shape);
  set("#ba-skin",p.skinType);set("#ba-barrier",p.barrier);
  set("#ba-history",p.history||"");set("#ba-note",p.note||"");
  $$("#ba-concerns input").forEach(c=>{c.checked=p.concerns.includes(c.value);});
  const m=$("#beauty-archive-modal"); if(m)m.classList.remove("hidden");
}
function closeArchiveEditor(){ const m=$("#beauty-archive-modal"); if(m)m.classList.add("hidden"); }
// 绑定编辑弹窗（仅一次）
(function(){
  const save=$("#ba-save");
  if(save && !save.dataset.bound){
    save.dataset.bound="1";
    save.onclick=()=>{
      const concerns=$$("#ba-concerns input:checked").map(c=>c.value);
      const p={
        height:($("#ba-height").value.trim())||"158cm",
        weight:($("#ba-weight").value.trim())||"105 斤",
        shape:$("#ba-shape").value,
        skinType:$("#ba-skin").value,
        barrier:$("#ba-barrier").value,
        concerns:concerns.length?concerns:["闭口粉刺"],
        history:$("#ba-history").value.trim(),
        note:($("#ba-note").value.trim())||"护肤做减法、拒绝猛药"
      };
      setBeautyProfile(p);
      renderBeautyArchive();
      syncSkConcerns(p.concerns);
      closeArchiveEditor();
      toast("💗 专属档案已更新，护肤建议已按新状态刷新");
    };
  }
  const cancel=$("#ba-cancel");
  if(cancel && !cancel.dataset.bound){cancel.dataset.bound="1";cancel.onclick=closeArchiveEditor;}
  const m=$("#beauty-archive-modal");
  if(m && !m.dataset.bound){m.dataset.bound="1";m.addEventListener("click",e=>{if(e.target.id==="beauty-archive-modal")closeArchiveEditor();});}
})();
function toast(msg){
  let t=document.getElementById("toast");
  if(!t){t=document.createElement("div");t.id="toast";t.className="toast";document.body.appendChild(t);}
  t.textContent=msg;t.classList.add("show");
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.classList.remove("show"),2200);
}

/* ============ 变美·化妆品拍照分析 ============ */
let curLook="日常通勤";
const LOOK_PLAN={
 "日常通勤":{
   steps:["妆前乳（保湿型）","粉底液（轻薄持妆）","遮瑕（局部）","散粉（局部定妆 T 区）","眉粉","睫毛膏","豆沙/奶茶唇釉","（可选）浅色腮红"],
   tips:"① 用气垫代替粉底液更服帖 ② 眉毛自然野生感，不画粗平眉 ③ 唇色选玫瑰豆沙/奶茶最稳妥 ④ 通勤妆最忌浓睫毛膏苍蝇腿，纤长型即可。",
   skinTips:"混合偏油皮选「保湿控油型妆前乳 + 轻薄持妆粉底」；T区易出油先薄涂控油妆前；鼻翼易卡粉用粉扑拍开"
 },
 "约会淡妆":{
   steps:["隔离（提亮）","气垫/粉底液","遮瑕黑眼圈","眼影（浅粉/蜜桃）","内眼线 + 睫毛膏","腮红（苹果肌）","唇釉（蜜桃/玫瑰）","（可选）高光颧骨"],
   tips:"① 眼妆重点是卧蚕和睫毛，不画粗眼线 ② 腮红横扫苹果肌中心显可爱 ③ 唇釉用指腹晕开更自然。",
   skinTips:"敏感肌避免含酒精定妆喷雾；用粉状腮红更友好；约会前做好唇膜避免唇纹明显"
 },
 "面试气质":{
   steps:["妆前乳","粉底液（哑光持久）","遮瑕","眉笔（自然）","极细内眼线","睫毛膏","裸色/豆沙唇","（避免）浓眼影/亮片"],
   tips:"① 面试忌浓妆，显精神即可 ② 眉毛干净、眉峰不锐利 ③ 唇色最稳：玫瑰豆沙；不要用正红/橘红 ④ 散粉定妆防止出油脱妆。",
   skinTips:"敏感肌避免含水杨酸妆前；控油用散粉优于吸油纸；T 区出油处按压式补妆"
 },
 "伪素颜":{
   steps:["润唇膏","隔离（提亮）","气垫（少量多次）","眉粉","睫毛膏（少量）","唇釉（浅色）","（可选）素颜霜/有色面霜"],
   tips:"① 重点是均匀肤色 + 唇色，不要画眼影 ② 眉毛用眉粉梳顺即可 ③ 睫毛膏只刷一层，避免结块 ④ 唇色选与自己唇色相近的 MLBB 色。",
   skinTips:"混合偏油皮伪素颜最忌卡粉；用气垫少量多次拍开；T区出油处按压定妆；鼻翼用粉扑按压"
 },
 "中式新中式":{
   steps:["妆前乳","粉底液（奶油肌）","遮瑕","眉笔（远山眉/柳叶眉）","眼影（大地色+一点点红）","内眼线 + 睫毛","腮红（斜扫）","唇釉（枫叶红/中国红）"],
   tips:"① 眉毛是关键：远山眉或柳叶眉，不画一字眉 ② 眼影加一点点朱红/砖红色显气色 ③ 唇色选枫叶红/砖红/中国红，配黑发最有味道。",
   skinTips:"敏感肌避免亮片眼影；腮红斜扫到太阳穴修饰脸型；唇色饱和度高的口红需先涂润唇膏"
 },
 "晚宴/约会":{
   steps:["妆前乳（保湿）","粉底液（持妆）","遮瑕","修容（颧骨/鼻影）","眼影（大地色+酒红）","眼线（猫眼/上扬）","睫毛膏+假睫毛（可选）","腮红","唇釉（玫瑰/酒红）","高光"],
   tips:"① 眼妆是重点：大地色打底 + 酒红加深眼尾 ② 眼线从眼尾 1/3 上扬 ③ 唇色与眼影呼应：玫瑰/酒红 ④ 高光打在颧骨、鼻梁、唇峰。",
   skinTips:"敏感肌上妆前冰敷收缩红血丝；高光选细腻型避免显毛孔；定妆喷雾锁妆"
 },
 "夏日清透":{
   steps:["控油妆前乳","持妆粉底液","遮瑕","眉粉","眼影（橘棕/西柚）","睫毛膏","腮红（橘色系）","唇釉（西柚/水红）","（可选）透明定妆喷雾"],
   tips:"① 控油妆前乳是关键，T 区不出油 ② 眼影橘棕/西柚显夏日清新 ③ 唇色选水红/西柚，不用正红 ④ 散粉重点定 T 区。",
   skinTips:"混合偏油皮夏日选「控油保湿」妆前乳；防水睫毛膏防汗；唇釉选水润不拔干型"
 }
};
function mkAnalyze(){
  const listRaw=$("#mk-list").value.trim();
  const look=curLook;
  const plan=LOOK_PLAN[look];
  // 检测用户是否提了某些产品
  const items=listRaw?listRaw.split(/[\n,,;;、\s]+/).map(s=>s.trim()).filter(s=>s.length>1):[];
  const haveItems=items.length;
  let html='<div class="sk-block"><b>🎯 目标妆容：'+look+'</b><div class="sk-line">根据你现有的化妆品 + '+look+' 的搭配惯例，给出专属组合。</div></div>';
  if(haveItems){
    html+='<div class="sk-block"><b>🧰 你现有的化妆品（'+items.length+' 件）</b><div class="sk-line">'+items.map(esc).join('、')+'</div></div>';
    // 关键词命中提示
    const found={"妆前乳/隔离":[],"粉底":[],"遮瑕":[],"眼影":[],"眼线":[],"睫毛膏":[],"腮红":[],"唇釉/口红":[],"散粉/定妆":[],"眉粉/眉笔":[]};
    items.forEach(n=>{
      const lower=n.toLowerCase();
      if(lower.includes("隔离")||lower.includes("妆前"))found["妆前乳/隔离"].push(n);
      if(lower.includes("粉底")||lower.includes("气垫")||lower.includes("bb"))found["粉底"].push(n);
      if(lower.includes("遮瑕"))found["遮瑕"].push(n);
      if(lower.includes("眼影"))found["眼影"].push(n);
      if(lower.includes("眼线"))found["眼线"].push(n);
      if(lower.includes("睫毛"))found["睫毛膏"].push(n);
      if(lower.includes("腮红"))found["腮红"].push(n);
      if(lower.includes("唇釉")||lower.includes("口红")||lower.includes("唇泥"))found["唇釉/口红"].push(n);
      if(lower.includes("散粉")||lower.includes("定妆")||lower.includes("粉饼"))found["散粉/定妆"].push(n);
      if(lower.includes("眉"))found["眉粉/眉笔"].push(n);
    });
    const missing=Object.keys(found).filter(k=>!found[k].length);
    html+='<div class="sk-block"><b>✅ 能直接搭配出的产品</b><div class="sk-line">';
    html+=Object.keys(found).filter(k=>found[k].length).map(k=>'<span class="sk-tag">'+k+'</span> '+found[k].join('、')).join(' · ');
    html+='</div></div>';
    if(missing.length){
      html+='<div class="sk-block"><b>⚠️ 还缺这些基础单品（按预算选 1 件即可）</b><div class="sk-line">';
      const tips={"妆前乳/隔离":"干皮选保湿型（怡丽丝尔金管），油皮选控油型（苏菲娜）","粉底":"气垫最易上手（雪花秀/珂莱蒂尔）；粉底液 DW/NARS 持妆好","遮瑕":"彩棠三色遮瑕或橘朵三色","眼影":"橘朵七色 / 完美日记动物盘最平价","眼线":"KissMe 眼线笔，防水不晕","睫毛膏":"KissMe 纤长 / 艾杜纱睫毛打底","腮红":"橘朵单色 / NARS 高潮","唇釉/口红":"Colorkey 空气唇釉 / 完美日记名片唇釉平价好用","散粉/定妆":"RCMA 散粉平价大碗 / NARS 裸光蜜粉","眉粉/眉笔":"Kate 三色眉粉 / 橘朵眉笔"};
      html+=missing.map(m=>'· <b>'+m+'</b>：'+tips[m]).join('<br>');
      html+='</div></div>';
    }
  }else{
    html+='<div class="sk-block"><b>💡 没写你现有的化妆品？</b><div class="sk-line">在上面框里写下你有什么（比如「CPB 隔离、雅诗兰黛 DW、3CE 口红」），我帮你筛选哪些该用，再列出还缺什么。</div></div>';
  }
  html+='<div class="sk-block"><b>🎬 上妆顺序（'+look+'）</b><div class="sk-line">'+plan.steps.map((s,i)=>(i+1)+'. '+s).join(' → ')+'</div></div>';
  html+='<div class="sk-block"><b>💡 '+look+' 妆容小心机</b><div class="sk-line">'+plan.tips+'</div></div>';
  html+='<div class="sk-block"><b>🌸 针对混合偏油皮（你的档案）</b><div class="sk-line">'+plan.skinTips+'</div></div>';
  $("#mk-result").innerHTML=html;
  const photo=$("#mk-photo-preview").src||"";
  const hist=LS.get("yi_mk_history",[]);
  hist.unshift({ts:Date.now(),look,items,photo,result:html});
  if(hist.length>10)hist.length=10;
  LS.set("yi_mk_history",hist);
  renderMkHistory();
}
function renderMkHistory(){
  const hist=LS.get("yi_mk_history",[]);
  const el=$("#mk-history"); if(!el)return;
  if(!hist.length){el.innerHTML='';return;}
  el.innerHTML='<div class="sk-h-title">📂 历史妆容（最近 '+hist.length+' 条）</div>'+hist.map(h=>
    '<div class="sk-h-item">'+
      (h.photo?'<img class="diet-thumb" src="'+h.photo+'">':'')+
      '<div class="sk-h-meta"><b>'+h.look+'</b> · '+new Date(h.ts).toLocaleString()+'<br>'+
      '<span class="sk-tag">'+h.items.slice(0,3).join('、')+(h.items.length>3?'…':'')+'</span></div>'+
      '<div class="sk-h-result">'+h.result.slice(0,180)+'…</div></div>'
  ).join("");
}
function mkBind(){
  if($("#mk-photo"))$("#mk-photo").addEventListener("change",async e=>{
    const f=e.target.files[0];if(!f)return;e.target.value="";
    const du=await pickPhoto(f);
    if(du){$("#mk-photo-preview").src=du;$("#mk-photo-preview").classList.remove("hidden");}
  });
  if($("#mk-analyze-btn"))$("#mk-analyze-btn").onclick=mkAnalyze;
  if($("#mk-look-row")){
    $("#mk-look-row").addEventListener("click",e=>{
      if(!e.target.classList.contains("chip"))return;
      $("#mk-look-row").querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
      e.target.classList.add("active");
      curLook=e.target.dataset.look;
    });
  }
  renderMkHistory();
}
mkBind();

/* ============ 知识拓展 / 变美护肤（通用渲染） ============ */
function makeFilterList(filterBarId,listId,bank,n,catKey,module){
  let cur="all";
  const bar=$(filterBarId);
  bar.addEventListener("click",e=>{
    if(!e.target.classList.contains("chip"))return;
    bar.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));e.target.classList.add("active");
    cur=e.target.dataset.f;render();
  });
  function render(){
    const daily=dailyPick(bank,n);
    const list=daily.filter(x=>cur==="all"||x[catKey]===cur);
    $(listId).innerHTML=list.length?list.map(x=>kItem(x,null,module)).join(""):'<div class="empty-tip">今日该分类暂无内容，明日轮换更新～</div>';
  }
  render();return render;
}

/* ============ AI 创作（助手：Cora） ============ */
let aiDialogs=LS.get("yi_ai_dialogs",[]);
let inspirations=LS.get("yi_inspirations",[]);
function saveAI(){LS.set("yi_ai_dialogs",aiDialogs);}
function saveInsp(){LS.set("yi_inspirations",inspirations);}
function aiGenerate(input){
  const raw=input.trim().replace(/\s+/g," ");
  if(raw.length<2) return '<p style="color:#c25a76">先写一点灵感或故事开头吧～羊羊也在等你动笔 🐶</p>';
  const r=a=>a[Math.floor(Math.random()*a.length)];
  const op=r(DB.ai.openings), cl=r(DB.ai.closures);
  const title=raw.length<=18?("《"+raw+"》"):("《"+raw.slice(0,16)+"…》");
  const firstCut=raw.slice(0,20);
  const chars=[
    "主角：一个像你一样认真生活、正在为保研努力的女孩，名字可以先叫「小桥」（你也可以随时改名）。",
    "搭档 / 朋友：沉默但可靠，总在关键时刻递来一把伞、一杯热牛奶。",
    "阻碍：不是坏人，而是时间、距离，或一句一直没说出口的抱歉。"
  ];
  const outline=[
    "起：故事从「"+firstCut+"」开始，平静日常里藏着不寻常。",
    "承：主角迈出第一步，遇见搭档，也撞上第一道坎。",
    "转：一个意外让一切都倾斜了，她必须做出选择。",
    "合：风波过后回到那座桥 / 那间房 / 那个清晨，但人已经不一样。"
  ];
  const p1=op+" "+raw;
  const p2="她把这件事悄悄记在心里。日子像桥下的水，表面平静，底下却一直在流。搭档出现得毫无预兆——也许只是一句「要不要一起？」，却把整条路的灯都点亮了。";
  const p3="可故事不会一直顺。就在她以为稳妥的时候，一个小小的意外把计划打乱：一场雨、一通电话，或者一个被搁置太久的决定。她第一次发现，原来自己比想象中更在意。";
  const p4=cl;
  return '<h4>📌 标题建议</h4><p>'+title+'</p>'+
    '<h4>✨ 一句话梗概</h4><p>'+raw+' —— 而这件事，最终变成了一段关于成长与重逢的故事。</p>'+
    '<h4>👤 人物小传</h4><p>'+chars.join("<br>")+'</p>'+
    '<h4>🎬 情节大纲（四幕）</h4><p>'+outline.map((o,i)=>'<b>'+"起承转合"[i]+'：</b>'+o).join("<br>")+'</p>'+
    '<h4>📖 完整正文（Cora 帮你补充润色）</h4><p>'+p1+'</p><p>'+p2+'</p><p>'+p3+'</p><p>'+p4+'</p>'+
    '<div class="ai-meta">✨ 由内置创作引擎生成（Cora 辅助润色）。如需更贴合你风格的强模型，可在联网后接入大模型 API。</div>';
}
function renderAIDialogs(){
  const box=$("#ai-dialogs");
  if(!aiDialogs.length){box.innerHTML='<div class="ai-empty">还没有创作对话框，点「＋ 新建对话」开始和 Cora 一起写故事吧 ✍️</div>';return;}
  box.innerHTML=aiDialogs.map((d,i)=>
    '<div class="ai-dialog" data-i="'+i+'">'+
    '<div class="ai-name"><input class="ai-name-in" value="'+esc(d.name)+'" maxlength="20"><button class="ai-del">✕</button></div>'+
    '<textarea class="ai-input" placeholder="写下你的灵感或故事开头，Cora 帮你补充成完整故事…">'+esc(d.input)+'</textarea>'+
    '<div class="ai-tools"><button class="btn-ai-gen">✨ 生成完整故事</button><button class="btn-ghost sm ai-clear">清空</button></div>'+
    (d.output?'<div class="ai-output">'+d.output+'</div>':'')+
    '</div>').join("");
  box.querySelectorAll(".ai-dialog").forEach(el=>{
    const i=+el.dataset.i;
    el.querySelector(".ai-name-in").oninput=e=>{aiDialogs[i].name=e.target.value;saveAI();};
    el.querySelector(".ai-input").oninput=e=>{aiDialogs[i].input=e.target.value;saveAI();};
    el.querySelector(".ai-del").onclick=()=>{aiDialogs.splice(i,1);saveAI();renderAIDialogs();};
    el.querySelector(".ai-clear").onclick=()=>{aiDialogs[i].input="";aiDialogs[i].output="";saveAI();renderAIDialogs();};
    el.querySelector(".btn-ai-gen").onclick=()=>{
      const out=aiGenerate(aiDialogs[i].input);
      aiDialogs[i].output=out;saveAI();renderAIDialogs();
    };
  });
}
function renderInspirations(){
  const box=$("#insp-history");
  if(!inspirations.length){box.innerHTML='<div class="empty-tip">灵感还没开始记录，任何一闪而过的念头都值得留下 💡</div>';return;}
  box.innerHTML=inspirations.slice().reverse().map(it=>
    '<div class="insp-item"><div class="insp-txt">'+esc(it.text)+'<span class="insp-date">'+it.date+'</span></div>'+
    '<button class="insp-del" data-id="'+it.id+'">✕</button></div>').join("");
  box.querySelectorAll(".insp-del").forEach(b=>b.onclick=()=>{
    inspirations=inspirations.filter(x=>x.id!=b.dataset.id);saveInsp();renderInspirations();
  });
}
$("#ai-new").onclick=()=>{aiDialogs.push({id:Date.now(),name:"创作对话 "+(aiDialogs.length+1),input:"",output:""});saveAI();renderAIDialogs();};
$("#insp-save").onclick=()=>{
  const v=$("#insp-input").value.trim();if(!v)return;
  inspirations.push({id:Date.now(),text:v,date:todayStr()});
  $("#insp-input").value="";saveInsp();renderInspirations();
  $("#insp-save").textContent="已保存 ⭐";setTimeout(()=>$("#insp-save").textContent="保存灵感 ⭐",1500);
};

/* ============ 首页 ============ */
function renderHome(){
  $("#home-date").textContent="· "+todayStr();
  const todos=getTodos(todayStr());
  const done=todos.filter(t=>t.done).length;
  $("#stat-done").textContent=done+"/"+todos.length;
  const wordsDone=Object.keys(LS.get("yi_words_"+todayStr(),{})).length;
  const studyLeft=(50-wordsDone)+30; // 单词剩余 + 桥梁（不含已移出的知识拓展）
  $("#stat-study").textContent=studyLeft;
  $("#stat-read").textContent=5; // 5篇文献阅读（成长记录不计入）
  // 顶部 hero 小数据
  const p=PSTATE();
  $("#hs-streak").textContent=p.streak;
  const useStart=LS.get("yi_use_start",todayStr());
  const days=Math.max(1,Math.floor((Date.now()-new Date(useStart).getTime())/86400000)+1);
  LS.set("yi_use_start",useStart);
  $("#hs-day").textContent=days;
  // 今日待学习汇总（不含：保研资讯 / 知识拓展 / 变美护肤 / AI创作 / 记账 / 阅读 / 新闻热点 / 每周复核 / 健康生活 / 饮食 / 喝水 / 睡觉）
  const items=[
    {ico:"📝",txt:"完成今日待办 "+done+"/"+todos.length+" 项，喂饱饭团",page:"plan"},
    {ico:"🌉",txt:"学习今日 30 条桥梁知识点",page:"bridge"},
    {ico:"🔤",txt:"背诵 50 个专业单词（已背 "+wordsDone+"）+ 5 篇文献阅读",page:"english"}
  ];
  $("#home-summary").innerHTML=items.map(i=>'<div class="sum-item"><span class="sum-ico">'+i.ico+'</span><span>'+i.txt+'</span><button class="sum-go" data-p="'+i.page+'">去完成 →</button></div>').join("");
  $$("#home-summary .sum-go").forEach(b=>b.onclick=()=>gotoPage(b.dataset.p));
  const recs=[];
  const rs=LS.get("yi_reviews",{});
  Object.keys(rs).sort().reverse().slice(0,3).forEach(k=>recs.push("<b>"+k+" 复盘：</b>"+esc(rs[k].slice(0,40))+(rs[k].length>40?"…":"")));
  const dates=LS.get("yi_todo_dates",[]).sort().reverse().slice(0,3);
  dates.forEach(d=>{const l=LS.get("yi_todos_"+d,[]);if(l.length)recs.push("<b>"+d+"：</b>完成计划 "+l.filter(t=>t.done).length+"/"+l.length+" 项"+(l.every(t=>t.done)?" 🎉":""));});
  if(wordsDone>0)recs.push("<b>今日单词：</b>已背 "+wordsDone+"/50 个专业词汇");
  $("#home-recent").innerHTML=recs.length?recs.map(r=>'<div class="rec-item">'+r+"</div>").join(""):'<div class="empty-tip">开始你的第一天学习吧！🐾</div>';
}
/* 历史任务按日折叠 */
function renderHistory(){
  const box=$("#home-history");if(!box)return;
  const groups=[];
  const rs=LS.get("yi_reviews",{});
  Object.keys(rs).sort().reverse().forEach(d=>groups.push({date:d,type:"复盘",txt:rs[d]}));
  const dates=LS.get("yi_todo_dates",[]).sort().reverse();
  dates.forEach(d=>{const l=LS.get("yi_todos_"+d,[]);if(l.length)groups.push({date:d,type:"待办",txt:l.filter(t=>t.done).length+"/"+l.length+" 项完成"+(l.every(t=>t.done)?" 🎉":"")});});
  groups.sort((a,b)=>b.date.localeCompare(a.date));
  if(!groups.length){box.innerHTML='<div class="empty-tip">还没有历史记录</div>';return;}
  const byDate={};
  groups.forEach(g=>{(byDate[g.date]=byDate[g.date]||[]).push(g);});
  box.innerHTML=Object.keys(byDate).slice(0,30).map(d=>
    '<div class="hist-group"><div class="hist-head">📅 '+d+' · '+byDate[d].length+' 条</div>'+
    byDate[d].map(g=>'<div class="hist-item"><b>['+g.type+']</b> '+esc(g.txt.slice(0,80))+(g.txt.length>80?"…":"")+'</div>').join("")+
    '</div>'
  ).join("");
}
$("#ht-toggle") && $("#ht-toggle").addEventListener("click",()=>{
  const box=$("#home-history");box.classList.toggle("hidden");
  if(!box.classList.contains("hidden"))renderHistory();
  $$("#ht-toggle .ht-hint").forEach(s=>s.textContent=box.classList.contains("hidden")?"点击展开":"点击收起");
});

/* ============ 自动保存指示器 ============ */
let _saveTimer=null;
function markAutoSave(){
  if(_saveTimer)clearTimeout(_saveTimer);
  const b=$("#sync-badge");if(!b)return;
  b.classList.remove("saved");b.classList.add("saving");
  b.querySelector(".sync-txt").textContent="保存中";
  _saveTimer=setTimeout(()=>{
    if(window.CloudSync && typeof CloudSync.updateBadge==="function"){ CloudSync.updateBadge(); }
    else { b.classList.remove("saving");b.classList.add("saved"); b.querySelector(".sync-txt").textContent="已自动保存"; }
  },400);
}

/* ============ 悬浮按钮 ============ */
$("#fab").onclick=()=>{$("#fab-modal").classList.remove("hidden");$("#fab-input").focus();};
$("#fab-cancel").onclick=()=>$("#fab-modal").classList.add("hidden");
$("#fab-ok").onclick=()=>{addTodo($("#fab-input").value);$("#fab-input").value="";$("#fab-modal").classList.add("hidden");gotoPage("plan");};
$("#fab-modal").addEventListener("click",e=>{if(e.target.id==="fab-modal")$("#fab-modal").classList.add("hidden");});

/* ============ 记账模块 ============ */
function getLedger(){return LS.get("yi_ledger",{savings:0,days:{}});}
function saveLedger(L){LS.set("yi_ledger",L);}
let lgCat="餐饮";
function renderLedger(){
  const L=getLedger(); const today=todayStr();
  const todayList=L.days[today]||[];
  const todaySum=todayList.reduce((a,b)=>a+(+b.amt||0),0);
  let total=0; Object.values(L.days).forEach(arr=>arr.forEach(e=>total+=(+e.amt||0)));
  $("#lg-savings").textContent=L.savings;
  $("#lg-today").textContent=Math.round(todaySum*100)/100;
  $("#lg-total").textContent=Math.round(total*100)/100;
  // 近 7 日开支趋势
  const chart=$("#lg-chart"); let max=0; const arr=[];
  for(let off=6;off>=0;off--){const d=dateOf(off);const sum=(L.days[d]||[]).reduce((a,b)=>a+(+b.amt||0),0);arr.push({d,sum});if(sum>max)max=sum;}
  chart.innerHTML=arr.map(o=>{const h=max>0?Math.max(5,Math.round(o.sum/max*92)):5;const lab=o.d.slice(5);return '<div class="lg-bar-wrap"><div class="lg-amt">'+(o.sum>0?Math.round(o.sum*100)/100:"")+'</div><div class="lg-bar'+(o.sum===0?" lg-bar-0":"")+'" style="height:'+h+'px"></div><div class="lg-day">'+lab+'</div></div>';}).join("");
  // 开支复盘（按日）
  const hist=$("#lg-history");
  const dateKeys=Object.keys(L.days).sort().reverse();
  if(!dateKeys.length){hist.innerHTML='<div class="empty-tip">还没有开支记录，记一笔开始吧 🐾</div>';return;}
  hist.innerHTML=dateKeys.map(d=>{
    const list=L.days[d]; const sum=list.reduce((a,b)=>a+(+b.amt||0),0);
    const items=list.slice().reverse().map(e=>'<div class="lg-entry"><span class="lg-cat">'+e.cat+'</span><span class="lg-note">'+esc(e.note||"")+'</span><span class="lg-amt-e">¥'+(Math.round((+e.amt)*100)/100)+'</span><button class="lg-del" data-id="'+e.id+'">✕</button></div>').join("");
    return '<div class="lg-day-group"><div class="lg-day-head"><span>📅 '+d+'</span><span class="lg-day-sum">¥'+(Math.round(sum*100)/100)+'</span></div>'+items+'</div>';
  }).join("");
  hist.querySelectorAll(".lg-del").forEach(b=>b.onclick=()=>{
    const L2=getLedger();
    Object.keys(L2.days).forEach(d=>{L2.days[d]=L2.days[d].filter(e=>String(e.id)!==b.dataset.id);});
    saveLedger(L2);renderLedger();
  });
}
$("#lg-cats").addEventListener("click",e=>{ if(!e.target.classList.contains("chip"))return; $$("#lg-cats .chip").forEach(c=>c.classList.remove("active"));e.target.classList.add("active");lgCat=e.target.dataset.c; });
$("#lg-save-btn").onclick=()=>{const v=parseFloat($("#lg-save-input").value);if(isNaN(v)||v<0)return;const L=getLedger();L.savings=v;saveLedger(L);renderLedger();$("#lg-save-input").value="";$("#lg-save-btn").textContent="已更新 ✅";setTimeout(()=>$("#lg-save-btn").textContent="更新存款 💰",1500);};
$("#lg-add-btn").onclick=()=>{
  const amt=parseFloat($("#lg-amt").value); if(isNaN(amt)||amt<=0){$("#lg-amt").focus();return;}
  const L=getLedger(); const today=todayStr();
  L.days[today]=L.days[today]||[];
  L.days[today].push({id:Date.now(),cat:lgCat,amt:amt,note:$("#lg-note").value.trim()});
  saveLedger(L); $("#lg-amt").value=""; $("#lg-note").value=""; renderLedger();
};

/* ============ 喝水模块 ============ */
const WATER_SCHED=[
  {time:"07:00",ml:250,tip:"清肠、排du"},
  {time:"08:30",ml:350,tip:"提高肌肉活力"},
  {time:"10:00",ml:400,tip:"排du、补水"},
  {time:"11:30",ml:350,tip:"提高饱fu感"},
  {time:"13:00",ml:400,tip:"促进消化"},
  {time:"15:00",ml:350,tip:"缓解身体疲劳"},
  {time:"17:00",ml:300,tip:"增加饱fu感"},
  {time:"19:00",ml:300,tip:"促进身体代谢"}
];
function getWater(){return LS.get("yi_water",{});}
function saveWater(W){LS.set("yi_water",W);markAutoSave();}
/* 喝水时间表：用户可编辑，存 localStorage；没设过就用默认 */
function getWaterSched(){ return LS.get("yi_water_sched",null) || WATER_SCHED; }
function saveWaterSched(s){ LS.set("yi_water_sched",s); }
function waterTargetMl(sched){ return sched.reduce((a,b)=>a+(+b.ml||0),0); }
function renderWater(){
  const W=getWater();
  const today=todayStr();
  const list=W[today]||[];
  const sched=getWaterSched();
  const N=sched.length;
  const done=list.filter(x=>x.done).length;
  const ml=list.filter(x=>x.done).reduce((a,b)=>a+(+b.ml||0),0);
  $("#wh-cup").textContent=done;
  $("#wh-ml").textContent=ml;
  $("#wh-pct").textContent=Math.round(done/N*100);
  $("#wh-today-pct").textContent=Math.round(done/N*100);
  $("#wh-bar").style.width=(done/N*100)+"%";
  $("#wh-target").textContent=waterTargetMl(sched);
  // N 杯水打卡
  $("#water-grid").innerHTML=sched.map((s,i)=>{
    const item=list.find(x=>x.idx===i);
    const on=item&&item.done;
    return '<div class="water-cup'+(on?" done":"")+'" data-i="'+i+'">'+
      '<div class="wc-time">'+s.time+'</div>'+
      '<div class="wc-glass">💧</div>'+
      '<div class="wc-ml">'+s.ml+'ml</div>'+
      '<div class="wc-tip">'+s.tip+'</div>'+
      '<button class="wc-btn">'+(on?"✅ 已喝":"+ 打卡")+'</button>'+
    '</div>';
  }).join("");
  $$("#water-grid .water-cup").forEach(el=>el.onclick=()=>{
    const i=+el.dataset.i;const W2=getWater();const arr=W2[today]||[];
    const it=arr.find(x=>x.idx===i);
    if(it){it.done=!it.done;}else{arr.push({idx:i,done:true,ml:sched[i].ml,time:Date.now()});}
    W2[today]=arr;saveWater(W2);renderWater();
  });
  // 统计
  let streak=0;const dates=Object.keys(W).sort().reverse();
  for(const d of dates){const t=W[d]||[];if(t.filter(x=>x.done).length>=N)streak++;else break;}
  $("#wh-streak").textContent=streak;
  // 周均
  let weekSum=0,weekDays=0;
  for(let off=0;off<7;off++){const d=dateOf(off);const t=W[d]||[];const cnt=t.filter(x=>x.done).length;weekSum+=cnt;weekDays++;}
  $("#wh-week").textContent=weekDays?Math.round(weekSum/weekDays*10)/10:0;
  // 历史
  const hist=Object.keys(W).sort().reverse().slice(0,30).map(d=>{
    const t=W[d]||[];const c=t.filter(x=>x.done).length;const m=t.filter(x=>x.done).reduce((a,b)=>a+(+b.ml||0),0);
    return '<div class="hist-group"><div class="hist-head">📅 '+d+' · '+c+'/'+N+' 杯 · '+m+'ml</div></div>';
  }).join("");
  $("#wh-history").innerHTML=hist||'<div class="empty-tip">还没有记录</div>';
  renderWSSched();
}
/* 时间表编辑器 */
function renderWSSched(){
  const rows=$("#ws-rows"); if(!rows)return;
  const sched=getWaterSched();
  rows.innerHTML=sched.map((s,i)=>
    '<div class="ws-row">'+
      '<span class="ws-r-time">🕐 '+s.time+'</span>'+
      '<span class="ws-r-ml">'+s.ml+' ml</span>'+
      '<span class="ws-r-tip">'+s.tip+'</span>'+
      '<button type="button" class="ws-r-del" data-i="'+i+'">✕</button>'+
    '</div>').join("");
  $$("#ws-rows .ws-r-del").forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i;const s=getWaterSched().slice();
    if(s.length<=1){ if(typeof toast==="function") toast("至少保留 1 个时间点~"); return; }
    s.splice(i,1); saveWaterSched(s); renderWater();
  });
}
if($("#ws-add-btn"))$("#ws-add-btn").onclick=()=>{
  const t=$("#ws-time").value; const ml=Math.max(50,+$("#ws-ml").value||0);
  if(!t){ if(typeof toast==="function") toast("先选个时间~"); return; }
  const s=getWaterSched().slice();
  s.push({time:t,ml:ml,tip:"自定义"});
  s.sort((a,b)=>a.time.localeCompare(b.time));
  saveWaterSched(s); renderWater();
  if(typeof toast==="function") toast("➕ 已添加 "+t+" 喝水点");
};
if($("#ws-reset"))$("#ws-reset").onclick=()=>{
  LS.set("yi_water_sched",null); renderWater();
  if(typeof toast==="function") toast("已恢复默认时间表");
};

/* ============ 饮食健康模块 ============ */
const FOOD_CAL=[
  // 每 100g 大约 kcal（来源：常见食物成分表）
  {k:["米饭","白米饭","炒饭","粥","稀饭"],cal:130},
  {k:["面条","拉面","意面","通心粉","面"],cal:140},
  {k:["馒头","包子","饺子","馄饨"],cal:220},
  {k:["面包","吐司","可颂","牛角"],cal:300},
  {k:["全麦面包"],cal:240},
  {k:["鸡胸肉","鸡肉","鸡腿","鸡翅","白切鸡"],cal:165},
  {k:["牛肉","牛排","肥牛","牛肉片","酱牛肉"],cal:200},
  {k:["猪肉","排骨","五花肉","培根","香肠","火腿"],cal:260},
  {k:["鱼","三文鱼","鳕鱼","鲈鱼","清蒸鱼"],cal:130},
  {k:["虾","虾仁","基围虾","小龙虾"],cal:95},
  {k:["鸡蛋","水煮蛋","蛋","煎蛋"],cal:155},
  {k:["豆腐","豆干","豆浆","豆皮"],cal:80},
  {k:["牛奶","酸奶","希腊酸奶","奶粉","奶酪"],cal:90},
  {k:["西兰花","花菜","菜花","甘蓝","包菜","紫甘蓝"],cal:35},
  {k:["番茄","西红柿","圣女果"],cal:18},
  {k:["黄瓜","生菜","芹菜","菠菜","青菜","油麦菜"],cal:16},
  {k:["胡萝卜","萝卜","南瓜"],cal:40},
  {k:["土豆","红薯","芋头","山药","玉米"],cal:90},
  {k:["苹果","梨","桃","李子","香蕉","橙子","葡萄","草莓","蓝莓","猕猴桃","芒果","菠萝","西瓜","火龙果","牛油果","鳄梨"],cal:55},
  {k:["巧克力","蛋糕","饼干","薯片","辣条","冰淇淋","奶茶","可乐","雪碧","咖啡","拿铁","卡布奇诺","摩卡","甜品","糖","蜜饯","果干","坚果","花生","核桃","腰果","杏仁","开心果","瓜子","芝麻"],cal:500},
  {k:["油","橄榄油","花生油","菜籽油","黄油","奶油","沙拉酱","芝麻酱","花生酱","火锅底料","烧烤酱","炸鸡","薯条","炸串","烧烤"],cal:880},
  {k:["火锅","冒菜","麻辣烫","烧烤","炸鸡","炸串","汉堡","披萨","意面","咖喱饭","寿司","三明治","沙拉","麻辣香锅","烤肉","烤鱼"],cal:230}
];
function estCal(food,qty){
  if(!food)return 0;
  const f=food.toLowerCase();qty=+qty||100;
  for(const r of FOOD_CAL){for(const k of r.k){if(food.indexOf(k)>=0||f.indexOf(k.toLowerCase())>=0)return Math.round(r.cal*qty/100);}}
  // 兜底：根据关键词粗估
  if(/粥|汤|羹|沙拉|水果|蔬菜/.test(food))return Math.round(50*qty/100);
  return Math.round(200*qty/100);
}
/* ====================== 饮食模块 — 拍照自由记录 + 零点分析 ====================== */
function getDiet(){return LS.get("yi_diet",{profile:{target:1600},days:{},foodDb:[]});}
function saveDiet(D){
  const raw=()=>JSON.stringify(D);
  try{ localStorage.setItem("yi_diet",raw()); }
  catch(e){
    if(e && (e.name==="QuotaExceededError"||e.code===22)){
      // 从最旧一天起逐日剥照片，尽量保住最近几餐的图
      const days=Object.keys(D.days||{}).sort();
      for(const d of days){
        (D.days[d].foods||[]).forEach(f=>{ if(f.photo) f.photo=""; });
        try{ localStorage.setItem("yi_diet",raw()); markAutoSave(); return; }catch(_){}
      }
      // 实在没空间：交给 LS.set 兜底（剥全部图）
      try{ LS.set("yi_diet",D); }catch(_){}
    } else { try{ LS.set("yi_diet",D); }catch(_){} }
  }
  markAutoSave();
}
function getDietAnalysis(){return LS.get("yi_diet_analysis",{});}
function saveDietAnalysis(A){LS.set("yi_diet_analysis",A);markAutoSave();}

/* 把 yyyy-mm-dd 字符串加 N 天,返回新 yyyy-mm-dd */
function addDaysStr(s,n){const d=new Date(s+"T00:00:00");d.setDate(d.getDate()+n);return todayStr.call(null,d);}
/* 用本地时间戳返回 yyyy-mm-dd (支持传Date对象) */
function ymdOf(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}

/* 分析指定日期的饮食数据 → 返回分析对象(不存) */
function analyzeDay(dateStr){
  const D=getDiet();
  const entries=((D.days[dateStr]&&D.days[dateStr].foods)||[]).slice();
  // 兼容旧数据:按id推时间(取最后一个 1-24h 当作该餐时间)
  entries.forEach(f=>{
    if(!f.ts){
      // 旧 id 是 Date.now() 形式,直接用它
      f.ts = +f.id || Date.now();
    }
  });
  const total=entries.reduce((s,f)=>s+(+f.kcal||0),0);
  const target=(D.profile.target)||1600;
  const status=total<target-300?"偏低":(total>target+400?"偏高":(entries.length===0?"无记录":"正常"));
  const meals=entries.length;
  // 时间分布
  const buckets={morning:0,lunch:0,dinner:0,late:0};
  entries.forEach(f=>{
    const h=new Date(f.ts).getHours();
    const k=+f.kcal||0;
    if(h<10)buckets.morning+=k;
    else if(h<14)buckets.lunch+=k;
    else if(h<20)buckets.dinner+=k;
    else buckets.late+=k;
  });
  // 类别分布(优先 cat,后查 DB 推断)
  const cats={staple:0,protein:0,vegetable:0,fruit:0,drink:0,snack:0,takeaway:0,other:0};
  const foodDB=window.DB.food||[];
  entries.forEach(f=>{
    let c=f.cat;
    if(!c){
      const hit=foodDB.find(x=>x.name===f.name);
      c=hit?hit.cat:"other";
    }
    if(cats[c]===undefined)cats[c]=0;
    cats[c]+=(+f.kcal||0);
  });
  // 生成建议
  const advices=[];
  if(entries.length===0){
    advices.push({icon:"📝",text:"昨天没有记录哦，今天拍照吃一点就自动入账"});
  }else{
    if(status==="偏高")advices.push({icon:"⚠️",text:"总热量超出目标 "+(total-target)+" kcal，明天减少油炸/甜食/含糖饮料"});
    if(status==="偏低")advices.push({icon:"📉",text:"摄入偏低（" + total + " kcal），明天加一份主食或一把坚果"});

    const vegKcal=cats.vegetable||0;
    const fruitKcal=cats.fruit||0;
    if(vegKcal<80)advices.push({icon:"🥦",text:"蔬菜摄入很少，明天加 1 份绿叶菜 / 西兰花 / 番茄"});
    if(fruitKcal<60)advices.push({icon:"🍎",text:"没有水果，明天上午加 1 个苹果 / 香蕉 / 橙子"});

    const proteinKcal=cats.protein||0;
    if(proteinKcal<total*0.12)advices.push({icon:"🥚",text:"蛋白质偏低（<12%），明天加 1 个鸡蛋 / 1 块鸡胸 / 1 杯牛奶"});

    if(buckets.late>total*0.25&&total>0)advices.push({icon:"🌙",text:"夜宵占比 " + Math.round(buckets.late/total*100) + "%，尽量把热量集中在白天"});

    if(meals<3)advices.push({icon:"🍱",text:"餐数过少（" + meals + " 餐），建议 3 餐 + 1 加餐，血糖更稳"});

    const drinkKcal=(cats.drink||0);
    if(drinkKcal>200)advices.push({icon:"🥤",text:"含糖饮料/奶茶占 " + drinkKcal + " kcal，改无糖茶 / 黑咖啡 / 气泡水"});

    if(cats.snack>200)advices.push({icon:"🍫",text:"零食偏多（" + cats.snack + " kcal），改坚果 / 水果 / 酸奶"});

    if(total>0 && buckets.morning<total*0.15)advices.push({icon:"🌅",text:"早餐占比偏低（<15%），上午容易饿，加一份燕麦 / 鸡蛋 / 全麦面包"});

    if(advices.length===0)advices.push({icon:"✅",text:"昨天的搭配比较均衡，继续保持！明天可以试试多一种颜色的蔬果"});
  }
  // 下一日建议
  let nextTarget=target;
  let nextNote="维持当前节奏";
  if(status==="偏高"){nextTarget=Math.max(target-200,1200);nextNote="明天略减 200 kcal，清淡为主";}
  else if(status==="偏低"){nextTarget=target+200;nextNote="明天加 200 kcal，坚果 / 牛奶奶茶都可";}
  return {date:dateStr,total,target,status,meals,buckets,cats,advices,nextTarget,nextNote,
          summary: entries.length===0
            ? "昨天没有记录，今天开始拍一拍就自动入账 ✨"
            : ("昨天 " + meals + " 餐共 " + total + " kcal，目标 " + target + " kcal，" + status + "。")
         };
}

/* 在 app 启动时检查：若昨日未分析 + 昨日有/无数据都生成本地缓存 */
function checkDietAutoAnalyze(){
  const A=getDietAnalysis();
  const today=todayStr();
  // 计算"昨天"用真实 Date
  const y=new Date();y.setDate(y.getDate()-1);
  const yStr=ymdOf(y);
  if(!A[yStr]){
    const r=analyzeDay(yStr);
    A[yStr]=r;
    saveDietAnalysis(A);
  }
}

function renderWeightCard(){
  const D=getDiet();
  // 最新晨重
  const dates=Object.keys(D.days).sort();
  let latestW=null,latestDate=null;
  for(let i=dates.length-1;i>=0;i--){
    const w=D.days[dates[i]]&&D.days[dates[i]].weight;
    if(typeof w==="number"&&w>20&&w<200){latestW=w;latestDate=dates[i];break;}
  }
  $("#wt-latest").textContent=latestW?latestW.toFixed(1):"--";
  // 累计变化 = 最早 - 最新
  let firstW=null;
  for(const d of dates){
    const w=D.days[d]&&D.days[d].weight;
    if(typeof w==="number"&&w>20&&w<200){firstW=w;break;}
  }
  if(latestW&&firstW){
    const delta=latestW-firstW;
    const sign=delta>0?"+":"";
    $("#wt-change").textContent=sign+delta.toFixed(1);
  }else{
    $("#wt-change").textContent="0";
  }
  // 目标 + TDEE
  $("#wt-target").textContent=D.profile.target||"--";
  $("#wt-tdee").textContent=D.profile.tdee||"--";
  // 提示
  if(D.profile.height&&D.profile.weight){
    $("#wt-tip").innerHTML='💗 BMI <b>'+(D.profile.weight/Math.pow(D.profile.height/100,2)).toFixed(1)+'</b> · TDEE <b>'+(D.profile.tdee||"--")+'</b> kcal · 距目标 <b>'+(D.profile.target?(latestW?(D.profile.weight-D.profile.target).toFixed(1):"--"):"--")+' kg</b>';
  }else{
    $("#wt-tip").innerHTML='💗 身高/体重/活动量 暂未设置，前往 <b>健康生活 → 饮食 → 设置</b> 录入后会显示具体数据';
  }
}
function renderDiet(){
  const D=getDiet();
  const today=todayStr();
  // 1) 零点分析 banner
  const y=new Date();y.setDate(y.getDate()-1);const yStr=ymdOf(y);
  const A=getDietAnalysis();
  const ana=A[yStr] || analyzeDay(yStr);
  // 确保即使没数据也显示
  if(!A[yStr]){A[yStr]=ana;saveDietAnalysis(A);}
  $("#da-date").textContent="(" + yStr + ")";
  $("#da-body").innerHTML = renderAnalysisHTML(ana);
  $("#diet-analysis").classList.remove("hidden");

  // 2) 今日统计
  const todayFoods=((D.days[today]&&D.days[today].foods)||[]).slice();
  todayFoods.forEach(f=>{if(!f.ts)f.ts=+f.id||Date.now();});
  const todayKcal=todayFoods.reduce((s,f)=>s+(+f.kcal||0),0);
  const target=(+D.profile.target)||1600;
  $("#diet-in").textContent=todayKcal;
  $("#diet-target-kcal").textContent=target;
  $("#diet-left").textContent=Math.max(target-todayKcal,0);
  $("#diet-meals").textContent=todayFoods.length;

  // 3) 时间线 (按时间倒序)
  if(todayFoods.length===0){
    $("#diet-timeline").innerHTML='<div class="empty-tip">还没有记录。点击上方"➕ 记一笔"开始 ✨</div>';
  }else{
    todayFoods.sort((a,b)=>b.ts-a.ts);
    $("#diet-timeline").innerHTML = todayFoods.map(f=>{
      const d=new Date(f.ts);
      const hh=String(d.getHours()).padStart(2,"0");
      const mm=String(d.getMinutes()).padStart(2,"0");
      const catInfo=(window.DB.foodCat&&f.cat&&window.DB.foodCat[f.cat])||null;
      const catBadge=catInfo?`<span class="tl-cat" style="background:${catInfo.color}">${catInfo.emoji}${catInfo.name}</span>`:"";
        return `<div class="tl-item">
          <div class="tl-time">${hh}:${mm}</div>
          <div class="tl-thumb-wrap">
            <div class="tl-thumb tl-thumb-empty">🍽</div>
          </div>
        <div class="tl-info">
          <div class="tl-name">${esc(f.name)}</div>
          ${f.aiDetail&&f.aiDetail.length?`<div class="tl-meta">整餐 · ${catBadge}</div><div class="tl-detail">${f.aiDetail.map(x=>esc((x.emoji||"🍽")+x.name)+" "+x.qty+"g").join(" + ")}</div>`:`<div class="tl-meta">${f.qty||'?'}g · ${catBadge}</div>`}
        </div>
        <div class="tl-kcal">${f.kcal}<span>kcal</span></div>
        <button class="tl-del" data-id="${f.id}" title="删除">✕</button>
      </div>`;
    }).join("");
    $$("#diet-timeline .tl-del").forEach(b=>b.onclick=()=>{
      const D2=getDiet();const arr=(D2.days[today]&&D2.days[today].foods)||[];
      D2.days[today].foods=arr.filter(x=>x.id!==+b.dataset.id);saveDiet(D2);renderDiet();
    });
  }
}

function renderAnalysisHTML(ana){
  const bucketsArr=[
    {k:"morning",l:"🌅 早餐前"},
    {k:"lunch",l:"🍱 午餐"},
    {k:"dinner",l:"🌙 晚餐"},
    {k:"late",l:"🌃 夜宵"}
  ];
  const tot=ana.total||1;
  const bucketHTML=bucketsArr.map(b=>{
    const k=ana.buckets[b.k]||0;
    const pct=Math.round(k/tot*100);
    return `<div class="da-bk"><div class="da-bk-l">${b.l}</div><div class="da-bk-bar"><div class="da-bk-fill" style="width:${pct}%"></div></div><div class="da-bk-r">${k} kcal</div></div>`;
  }).join("");
  const advicesHTML=(ana.advices||[]).map(a=>`<div class="da-adv"><span class="da-adv-ic">${a.icon}</span><span>${esc(a.text)}</span></div>`).join("");
  const statusClass=ana.status==="偏高"?"da-stat-high":(ana.status==="偏低"?"da-stat-low":"da-stat-ok");
  return `
    <div class="da-top">
      <div class="da-sum">${esc(ana.summary)}</div>
      <span class="da-status ${statusClass}">${ana.status}</span>
    </div>
    <div class="da-buckets">${bucketHTML}</div>
    <div class="da-section-title">💡 给明天的建议</div>
    <div class="da-advs">${advicesHTML}</div>
    <div class="da-next">🎯 明日目标 <b>${ana.nextTarget||ana.target}</b> kcal · ${esc(ana.nextNote||'')}</div>
  `;
}

/* ============ 图片智能压缩（解决手机照片>4MB、localStorage 撑爆问题） ============ */
/* 不限制原图大小：读取后用 canvas 缩放到最长边 maxDim，导出 JPEG q，
   存进 localStorage 的 base64 通常只有 100~300KB，且画质足够辨认食物。 */
function compressImage(file, maxDim, q){
  return new Promise((resolve,reject)=>{
    const fr=new FileReader();
    fr.onerror=()=>reject(new Error("read fail"));
    fr.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error("decode fail"));
      img.onload=()=>{
        const ow=img.naturalWidth||img.width, oh=img.naturalHeight||img.height;
        if(!ow||!oh){ reject(new Error("bad image")); return; }
        const MAXKB=250; // 单张上限 ~250KB，避免占用过大
        const encode=(dim,quality)=>{
          let w=ow,h=oh;
          if(w>dim||h>dim){ const s=Math.min(dim/w,dim/h); w=Math.max(1,Math.round(w*s)); h=Math.max(1,Math.round(h*s)); }
          const cv=document.createElement("canvas"); cv.width=w; cv.height=h;
          const cx=cv.getContext("2d"); cx.fillStyle="#fff"; cx.fillRect(0,0,w,h); // PNG 透明转白底
          cx.drawImage(img,0,0,w,h);
          return cv.toDataURL("image/jpeg",quality);
        };
        let dim=maxDim, quality=q, data=encode(dim,quality), guard=0;
        while(data.length*0.75>MAXKB*1024 && guard<8){
          guard++;
          if(quality>0.45){ quality=Math.max(0.45,quality-0.12); }
          else { dim=Math.max(420,Math.round(dim*0.78)); quality=0.6; }
          data=encode(dim,quality);
        }
        resolve(data);
      };
      img.src=fr.result;
    };
    fr.readAsDataURL(file);
  });
}
/* 统一处理选择的照片：先压缩，失败则兜底直接读原图；返回 dataURL */
async function pickPhoto(file){
  if(!file) return "";
  if(typeof toast==="function") toast("📷 正在压缩照片…");
  try{
    return await compressImage(file,1280,0.8);
  }catch(e){
    // 兜底：直接读原图（极端情况才走到）
    return await new Promise((res)=>{
      const r=new FileReader();
      r.onload=()=>res(r.result);
      r.onerror=()=>res("");
      r.readAsDataURL(file);
    });
  }
}

/* ============ 拍照+选食物弹窗 (dm = diet modal) ============ */
let dmSelected=null,dmMultiplier=1;

function dmOpen(photos, keepState){
  if(!keepState){
    dmSelected=null;
    dmMultiplier=1;
  }
  // 时间默认现在，可改
  const now=new Date();
  if($("#dm-time-input"))$("#dm-time-input").value=String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
  // 快速添加
  dmRenderQuick();
  // 搜索清空
  $("#dm-search").value="";
  $("#dm-suggest").classList.add("hidden");
  $("#dm-suggest").innerHTML="";
  // 自定义食物清空
  if($("#dm-c-name")){ $("#dm-c-name").value=""; $("#dm-c-kcal").value=""; $("#dm-c-add").disabled=true; }
  // 已选隐藏
  if(!keepState){ $("#dm-selected").classList.add("hidden"); $("#dm-save").disabled=true; }
  $("#diet-modal").classList.remove("hidden");
  setTimeout(()=>$("#dm-search").focus(),80);
}


function dmRenderQuick(){
  const hot=(window.DB.food||[]).filter(f=>f.hot);
  // 随机取 8 个（每日变化）
  const seed=new Date().getDate();
  const sorted=hot.slice().sort((a,b)=>{
    const ha=((a.id.charCodeAt(0)+seed)%97);
    const hb=((b.id.charCodeAt(0)+seed*3)%97);
    return ha-hb;
  });
  const pick=sorted.slice(0,8);
  $("#dm-quick").innerHTML=pick.map(f=>
    `<button type="button" class="dm-quick-chip" data-id="${f.id}">
      <span class="dmq-em">${f.emoji}</span>
      <span class="dmq-name">${esc(f.name)}</span>
      <span class="dmq-k">${f.kcal}kcal</span>
    </button>`
  ).join("");
  $$(".dm-quick-chip").forEach(b=>b.onclick=()=>{
    const f=window.DB.food.find(x=>x.id===b.dataset.id);
    if(f)dmPick(f);
  });
}

function dmSearch(q){
  q=(q||"").trim();
  const sug=$("#dm-suggest");
  if(!q){sug.classList.add("hidden");sug.innerHTML="";return;}
  const all=window.DB.food||[];
  // 匹配：name 或 alias 包含
  const matches=all.filter(f=>{
    return f.name.indexOf(q)>=0 || (f.alias&&f.alias.toLowerCase().indexOf(q.toLowerCase())>=0);
  }).slice(0,10);
  if(matches.length===0){
    sug.innerHTML=`<div class="dm-nomatch">没找到。可在下方点"💾 保存"作为自定义食物</div>`;
  }else{
    sug.innerHTML=matches.map(f=>{
      const ci=window.DB.foodCat[f.cat]||{name:"其他",color:"#aaa",emoji:"🍽"};
      return `<div class="dm-sug" data-id="${f.id}">
        <span class="dms-em">${f.emoji}</span>
        <span class="dms-name">${esc(f.name)}</span>
        <span class="dms-unit">${f.kcal} kcal/${esc(f.unit)}</span>
        <span class="dms-cat" style="background:${ci.color}">${ci.emoji}</span>
      </div>`;
    }).join("");
    $$(".dm-sug").forEach(s=>s.onclick=()=>{
      const f=all.find(x=>x.id===s.dataset.id);
      if(f)dmPick(f);
    });
  }
  sug.classList.remove("hidden");
}

function dmPick(f){
  dmSelected=f;
  dmMultiplier=1;
  $("#dm-pick-emoji").textContent=f.emoji;
  $("#dm-pick-name").textContent=f.name;
  $("#dm-pick-kcal").textContent=f.kcal + " kcal / " + f.unit + " · 每 100g " + f.per100 + " kcal";
  $("#dm-qty").value=f.defQty;
  $("#dm-qty-tip").textContent="≈ " + f.unit;
  $$(".portion-btn").forEach(b=>b.classList.toggle("active",b.dataset.p==="1"));
  const ci=window.DB.foodCat[f.cat]||{name:"其他",color:"#aaa"};
  $("#dm-cat").innerHTML=`<span class="tl-cat" style="background:${ci.color}">${ci.emoji}${ci.name}</span>`;
  $("#dm-selected").classList.remove("hidden");
  $("#dm-save").disabled=false;
  $("#dm-suggest").classList.add("hidden");
  $("#dm-search").value=f.name;
  dmUpdateTotal();
}

function dmUpdateTotal(){
  if(!dmSelected)return;
  const qty=Math.max(1,+$("#dm-qty").value||dmSelected.defQty);
  // 实际 kcal = (qty / defQty) * baseKcal * multiplier
  const base=dmSelected.kcal;
  const k=Math.round(base*(qty/dmSelected.defQty)*dmMultiplier);
  $("#dm-total-kcal").textContent=k;
}

/* 自定义 / 品牌食物：输名称 + 每100g热量 + 重量 → 自动算合计 kcal */
function guessCatFromName(n){
  if(/米饭|面|馒头|包|饺|馄|粥|薯|玉米|面包|吐司|燕麦|麦片/.test(n))return "staple";
  if(/鸡|牛|猪|鱼|虾|蛋|豆腐|奶|豆|肉/.test(n))return "protein";
  if(/蔬|菜|瓜|番茄|西红|胡萝卜|西兰花|菠菜|芹|生菜|蘑|菇/.test(n))return "vegetable";
  if(/苹果|梨|桃|香蕉|橙|葡萄|莓|芒果|西瓜|火龙|牛油|果|枣/.test(n))return "fruit";
  if(/可乐|雪碧|咖啡|茶|果汁|奶茶|水|饮|酒|啤酒/.test(n))return "drink";
  if(/巧克|蛋糕|饼干|薯片|糖|坚果|零食|辣条|冰淇淋|蜜/.test(n))return "snack";
  if(/外卖|汉堡|披萨|烧烤|火锅|炸|寿司|麻辣|咖喱|三明治|沙拉|烤肉|烤鱼|饭/.test(n))return "takeaway";
  return "other";
}
function dmCustomUpdate(){
  const name=$("#dm-c-name").value.trim();
  const kcal=Math.max(0,+$("#dm-c-kcal").value||0);
  $("#dm-c-add").disabled=!(name&&kcal>0);
}
function dmCustomAdd(){
  const name=$("#dm-c-name").value.trim();
  const kcal=Math.max(0,+$("#dm-c-kcal").value||0);
  if(!name||!kcal)return;
  const cat=guessCatFromName(name);
  const food={ id:"cust_"+Date.now(), name:name, emoji:"🍽", kcal:kcal, unit:"自定义", per100:0, cat:cat, defQty:1, custom:true };
  dmSelected=food; dmMultiplier=1;
  dmSave();
}

function dmSave(){
  if(!dmSelected)return;
  const food=dmSelected;
  const qty=Math.max(1,+$("#dm-qty").value||food.defQty);
  const kcal=Math.round(food.kcal*(qty/food.defQty)*dmMultiplier);
  const D=getDiet();
  const today=todayStr();
  D.days[today]=D.days[today]||{foods:[]};
  // 时间：用弹窗里选的时间（缺省现在）
  let ts=Date.now();
  const tVal=$("#dm-time-input")&&$("#dm-time-input").value;
  if(tVal){
    const parts=tVal.split(":"); const hh=+parts[0]||0, mm=+parts[1]||0;
    const d=new Date(); d.setHours(hh,mm,0,0);
    ts=d.getTime();
    if(ts>Date.now()) ts-=86400000; // 选了未来时间则归到昨天
  }
  D.days[today].foods.push({
    id: Date.now(),
    name: food.name,
    cat: food.cat,
    qty: qty,
    kcal: kcal,
    ts: ts
  });
  saveDiet(D);
  $("#diet-modal").classList.add("hidden");
  renderDiet();
  // 顶部小提示
  if(typeof toast==="function")toast("✅ 已记录：" + food.name + " " + kcal + " kcal");
}


/* ============ 事件绑定（记一笔弹窗） ============ */
// （已移除拍照/相册/AI 识别相关逻辑，改为手动记录时间·食物·热量）
$("#dc-quick") && $("#dc-quick").addEventListener("click",()=>{ dmOpen([],false); });
$("#dm-cancel") && $("#dm-cancel").addEventListener("click",()=>$("#diet-modal").classList.add("hidden"));
$("#dm-x") && $("#dm-x").addEventListener("click",()=>$("#diet-modal").classList.add("hidden"));
$("#diet-modal") && $("#diet-modal").addEventListener("click",e=>{if(e.target.id==="diet-modal")$("#diet-modal").classList.add("hidden");});
$("#dm-save") && $("#dm-save").addEventListener("click",dmSave);
$("#dm-search") && $("#dm-search").addEventListener("input",e=>dmSearch(e.target.value));
$("#dm-qty") && $("#dm-qty").addEventListener("input",dmUpdateTotal);
// 自定义食物（直接填热量）
if($("#dm-c-name"))$("#dm-c-name").addEventListener("input",dmCustomUpdate);
if($("#dm-c-kcal"))$("#dm-c-kcal").addEventListener("input",dmCustomUpdate);
if($("#dm-c-add"))$("#dm-c-add").addEventListener("click",dmCustomAdd);
$$("#dm-portion-placeholder, .portion-btn").forEach(()=>{}); // 占位
document.addEventListener("click",e=>{
  const pb=e.target.closest(".portion-btn");
  if(pb){
    const parent=pb.parentElement;
    parent.querySelectorAll(".portion-btn").forEach(x=>x.classList.remove("active"));
    pb.classList.add("active");
    dmMultiplier=+pb.dataset.p||1;
    dmUpdateTotal();
  }
});

/* ============ 零点分析相关 UI ============ */
$("#dc-analyze") && $("#dc-analyze").addEventListener("click",()=>{
  const y=new Date();y.setDate(y.getDate()-1);const yStr=ymdOf(y);
  const r=analyzeDay(yStr);
  const A=getDietAnalysis();A[yStr]=r;saveDietAnalysis(A);
  renderDiet();
  if(typeof toast==="function")toast("✅ 已重新生成昨日分析");
});
$("#da-close") && $("#da-close").addEventListener("click",()=>{
  const card=$("#diet-analysis");
  const body=$("#da-body");
  const next=$("#da-next");
  if(body.style.display==="none"){
    body.style.display="";$("#da-close").textContent="▾";
  }else{
    body.style.display="none";$("#da-close").textContent="▸";
  }
});

/* ============ 饮食设置弹窗（保留身高体重+加 今日目标kcal） ============ */
$("#diet-set-btn") && $("#diet-set-btn").addEventListener("click",()=>{
  const D=getDiet();
  $("#ds-height").value=D.profile.height||"";
  $("#ds-weight").value=D.profile.weight||"";
  $("#ds-age").value=D.profile.age||"";
  $("#ds-activity").value=D.profile.activity||"1.55";
  $("#ds-target").value=D.profile.target||"";
  // 公式提示
  if(D.profile.height&&D.profile.weight&&D.profile.age){
    const h=+D.profile.height,w=+D.profile.weight,a=+D.profile.age;
    const act=+D.profile.activity||1.55;
    const bmr=Math.round(10*w+6.25*h-5*a-161);
    const tdee=Math.round(bmr*act);
    const soft=Math.round(tdee-500);
    $("#ds-formula").innerHTML='按你的资料自动算出 TDEE ≈ <b>'+tdee+'</b> kcal，温和减重 ≈ <b>'+soft+'</b> kcal';
    if(!D.profile.target)$("#ds-target").value=soft;
  }else{
    $("#ds-formula").textContent="填好身高/体重/年龄后会显示建议值";
  }
  $("#diet-set-modal").classList.remove("hidden");
});
if($("#ds-cancel"))$("#ds-cancel").onclick=()=>$("#diet-set-modal").classList.add("hidden");
if($("#ds-save"))$("#ds-save").onclick=()=>{
  const D=getDiet();
  D.profile.height=+$("#ds-height").value||D.profile.height;
  D.profile.weight=+$("#ds-weight").value||D.profile.weight;
  D.profile.age=+$("#ds-age").value||D.profile.age;
  D.profile.activity=$("#ds-activity").value;
  D.profile.sex=D.profile.sex||"女";
  // 目标 kcal
  const t=+$("#ds-target").value;
  if(t>500&&t<5000)D.profile.target=t;
  saveDiet(D);
  // 同步记录一次体重到 days[today]
  const today=todayStr();D.days[today]=D.days[today]||{foods:[]};
  if(D.profile.weight)D.days[today].weight=D.profile.weight;
  saveDiet(D);
  $("#diet-set-modal").classList.add("hidden");
  renderDiet();
};
$("#diet-set-modal") && $("#diet-set-modal").addEventListener("click",e=>{if(e.target.id==="diet-set-modal")$("#diet-set-modal").classList.add("hidden");});

/* ============ 睡眠记录模块 ============ */
function getSleep(){return LS.get("yi_sleep",{});}
function saveSleep(S){LS.set("yi_sleep",S);markAutoSave();}
let slRating=0;
function renderSleep(){
  const S=getSleep();
  const today=todayStr();
  // 上次
  const dates=Object.keys(S).sort().reverse();
  const last=dates[0]?S[dates[0]]:null;
  if(last&&last.dur){$("#sl-last-dur").textContent=last.dur+"h";}
  else{$("#sl-last-dur").textContent="--";}
  if(last&&last.rating){$("#sl-last-q").textContent="⭐".repeat(last.rating);}
  else{$("#sl-last-q").textContent="--";}
  // 近 7 日均时
  let sum=0,n=0;
  for(let off=0;off<7;off++){const d=dateOf(off);const r=S[d];if(r&&r.dur){sum+=r.dur;n++;}}
  $("#sl-avg").textContent=n?Math.round(sum/n*10)/10+"h":"--";
  // 图表
  const arr=[];for(let off=6;off>=0;off--){const d=dateOf(off);arr.push({d,val:(S[d]&&S[d].dur)||0});}
  const max=Math.max(8,...arr.map(x=>x.val));
  $("#sl-chart").innerHTML=arr.map(o=>{
    const h=o.val?(o.val/max*100):2;
    return '<div class="sl-bar-wrap"><div class="sl-bar'+(o.val?"":" sl-bar-0")+'" style="height:'+h+'%"></div><div class="sl-amt">'+(o.val?o.val+"h":"")+'</div><div class="sl-day">'+o.d.slice(5)+'</div></div>';
  }).join("");
  // 当前今日值（如果已填）
  if(S[today]){
    $("#sl-bed").value=S[today].bed||"";
    $("#sl-wake").value=S[today].wake||"";
    $("#sl-note").value=S[today].note||"";
    if(S[today].state)$("#sl-state").value=S[today].state;
    if(S[today].rating)setSlStars(S[today].rating);
  }
  // 历史
  const hist=dates.slice(0,30).map(d=>{
    const r=S[d];
    return '<div class="hist-group"><div class="hist-head">📅 '+d+' · '+r.dur+'h · ⭐'.repeat(r.rating)+(r.state?' '+esc(r.state):"")+'</div>'+
      (r.note?'<div class="hist-item">'+esc(r.note)+'</div>':'')+'</div>';
  }).join("");
  $("#sl-history").innerHTML=hist||'<div class="empty-tip">还没有睡眠记录</div>';
}
function setSlStars(n){
  slRating=n;
  $$("#sl-stars span").forEach(s=>{const v=+s.dataset.s;s.textContent=v<=n?"★":"☆";s.classList.toggle("on",v<=n);});
}
$$("#sl-stars span").forEach(s=>s.onclick=()=>setSlStars(+s.dataset.s));
if($("#sl-save-btn"))$("#sl-save-btn").onclick=()=>{
  const bed=$("#sl-bed").value,wake=$("#sl-wake").value;
  if(!bed||!wake){alert("请填写上床与起床时间");return;}
  const [bh,bm]=bed.split(":").map(Number),[wh,wm]=wake.split(":").map(Number);
  let dur=(wh*60+wm)-(bh*60+bm);if(dur<0)dur+=24*60;
  dur=Math.round(dur/6)/10;
  const S=getSleep();const today=todayStr();
  S[today]={bed,wake,dur,rating:slRating,state:$("#sl-state").value,note:$("#sl-note").value.trim()};
  saveSleep(S);renderSleep();
  $("#sl-save-btn").textContent="已保存 ✅";setTimeout(()=>$("#sl-save-btn").textContent="保存今日睡眠 🛏",1500);
};

/* ============ 睡眠·哄睡（倒计时 + 渐暗幕帘 + 循环催眠文字） ============ */
const SS_TIPS=[
  "慢慢闭上眼睛，让一天的疲惫沉下去……",
  "感受呼吸，吸气 4 秒，呼气 6 秒。",
  "肩膀放松，手臂放松，腿放松。",
  "脑海里出现一片安静的湖面。",
  "水面映着月光，没有风，只有你。",
  "明天会是新的一天，不用想。",
  "今夜只需要休息。",
  "身体一点点变沉，越来越沉。",
  "你已经做得很好了。",
  "一切都好。"
];
let ssTimer=null, ssTotal=15*60, ssLeft=15*60, ssPresetMin=15, ssTipIdx=0;
function fmtMMSS(s){const m=Math.floor(s/60),r=s%60;return (m<10?"0":"")+m+":"+(r<10?"0":"")+r;}
function renderSSRing(){
  const r=$("#ss-ring"); if(!r)return;
  const max=339.292, off=max*(1-ssLeft/ssTotal);
  r.setAttribute("stroke-dashoffset",off);
  $("#ss-time").textContent=fmtMMSS(ssLeft);
}
function ssTick(){
  ssLeft--; if(ssLeft<=0){stopSS();return;}
  renderSSRing();
  if(ssLeft%10===0){ssTipIdx=(ssTipIdx+1)%SS_TIPS.length;$("#ss-curtain").setAttribute("data-tip",SS_TIPS[ssTipIdx]);}
}
let ssVoiceOn=true;
function ssPickVoice(){
  if(!("speechSynthesis" in window))return null;
  const vs=speechSynthesis.getVoices()||[];
  return vs.find(v=>/zh|cmn|Chinese|中文/i.test(v.lang+" "+v.name))||vs[0]||null;
}
function ssSpeakLoop(){
  if(!ssTimer||!ssVoiceOn||!("speechSynthesis" in window))return;
  const tip=SS_TIPS[ssTipIdx];
  const u=new SpeechSynthesisUtterance(tip);
  u.lang="zh-CN"; u.rate=0.62; u.pitch=0.9; u.volume=1;
  const v=ssPickVoice(); if(v)u.voice=v;
  u.onend=()=>{ if(ssTimer&&ssVoiceOn){ ssTipIdx=(ssTipIdx+1)%SS_TIPS.length; setTimeout(ssSpeakLoop,1500); } };
  u.onerror=()=>{ if(ssTimer&&ssVoiceOn) setTimeout(ssSpeakLoop,1500); };
  try{ speechSynthesis.resume(); speechSynthesis.speak(u); }catch(e){}
}
function startSS(){
  if(ssTimer)return;
  ssTotal=ssPresetMin*60; ssLeft=ssTotal;
  ssTipIdx=0; $("#ss-curtain").setAttribute("data-tip",SS_TIPS[0]);
  $("#ss-curtain").classList.remove("hidden");
  // 下一帧加 .show 触发过渡
  requestAnimationFrame(()=>$("#ss-curtain").classList.add("show"));
  $("#ss-status").textContent="哄睡中……轻声读出来，闭上眼睛就好";
  $("#ss-start").textContent="⏸ 暂停";
  renderSSRing();
  ssTimer=setInterval(ssTick,1000);
  if(ssVoiceOn){ speechSynthesis.cancel(); setTimeout(ssSpeakLoop,400); }
}
function stopSS(){
  if(ssTimer){clearInterval(ssTimer);ssTimer=null;}
  if("speechSynthesis" in window) speechSynthesis.cancel();
  $("#ss-curtain").classList.remove("show");
  setTimeout(()=>$("#ss-curtain").classList.add("hidden"),1300);
  $("#ss-status").textContent="点击开始，把手机放床边，闭上眼";
  $("#ss-start").textContent="▶ 开始哄睡";
}
function bindSS(){
  if($("#ss-start"))$("#ss-start").onclick=()=>{ if(ssTimer)stopSS(); else startSS(); };
  if($("#ss-stop"))$("#ss-stop").onclick=stopSS;
  if($("#ss-voice"))$("#ss-voice").onclick=()=>{
    ssVoiceOn=!ssVoiceOn;
    $("#ss-voice").textContent=ssVoiceOn?"🔊 语音：开":"🔇 语音：关";
    if(ssVoiceOn&&ssTimer)ssSpeakLoop();
    else if("speechSynthesis" in window)speechSynthesis.cancel();
  };
  $$(".ss-preset").forEach(b=>b.onclick=()=>{
    $$(".ss-preset").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    ssPresetMin=+b.dataset.min; ssTotal=ssPresetMin*60; ssLeft=ssTotal;
    renderSSRing();
  });
  renderSSRing();
}
bindSS();

/* ============ PubMed 长文献（每日 2 篇） ============ */

/* ============ PubMed 长文献（每日 2 篇） ============ */
function getPaperCfg(){return LS.get("yi_paper_cfg",{keyword:DB.defaultPaperKeyword||"bridge health monitoring",lastUpdate:""});}
function savePaperCfg(C){LS.set("yi_paper_cfg",C);}
function getPaperNotes(){return LS.get("yi_paper_notes",{});}
function savePaperNotes(N){LS.set("yi_paper_notes",N);markAutoSave();}
function pickPapersToday(){
  const cfg=getPaperCfg();
  const all=DB.papers||[];
  const matched=all.filter(p=>p.keyword.toLowerCase().includes(cfg.keyword.toLowerCase())||cfg.keyword.toLowerCase().includes(p.keyword.toLowerCase()));
  const pool=matched.length?matched:all;
  const off=dayIndex();
  const a=pool[off%pool.length],b=pool[(off+Math.floor(pool.length/2))%pool.length];
  return [a,b].filter((x,i,arr)=>arr.findIndex(y=>y.id===x.id)===i);
}
function renderPapers(){
  const cfg=getPaperCfg();
  const list=pickPapersToday();
  const notes=getPaperNotes();
  const today=todayStr();
  $("#paper-keyword").value=cfg.keyword;
  $("#paper-time").textContent=cfg.lastUpdate||"--";
  let html='<div class="card note-card blue">📚 今日 '+list.length+' 篇桥梁方向顶刊文献（PubMed 已验证可访问） · 0 点自动换日</div>';
  list.forEach(p=>{
    const verified=p.verified?'✅ 已验证':'⚠️ 第三方';
    const wechat=(p.wechatLinks||[]).map(w=>'<a class="paper-wx" href="'+w.url+'" target="_blank" rel="noopener">🔗 '+esc(w.name)+'</a>').join("");
    html+='<div class="paper-card">'+
      '<div class="paper-title">📄 '+esc(p.title)+'</div>'+
      '<div class="paper-meta">👤 '+esc(p.authors)+' · <i>'+esc(p.journal)+'</i> · '+p.year+' · DOI: '+esc(p.doi)+' '+verified+'</div>'+
      '<div class="paper-oneline">🎯 <b>一句话：</b>'+esc(p.summaryOneLine)+'</div>'+
      '<div class="paper-cn">🇨🇳 <b>中文摘要：</b>'+esc(p.cn)+'</div>'+
      '<div class="paper-section"><b>⭐ 核心亮点：</b><ul>'+p.highlights.map(h=>'<li>'+esc(h)+'</li>').join("")+'</ul></div>'+
      '<div class="paper-section"><b>⚠️ 不足 / 局限：</b><ul>'+p.limits.map(h=>'<li>'+esc(h)+'</li>').join("")+'</ul></div>'+
      '<div class="paper-links">'+
        '<a class="paper-pubmed" href="'+p.pubmedUrl+'" target="_blank" rel="noopener">🔬 PubMed 原文</a>'+
        '<a class="paper-pdf" href="'+p.pdfUrl+'" target="_blank" rel="noopener">📑 期刊 PDF</a>'+
      '</div>'+
      (wechat?'<div class="paper-section"><b>💬 公众号 / 知乎解析：</b><div class="paper-wx-list">'+wechat+'</div></div>':'')+
      '<div class="paper-note-block" data-id="'+p.id+'">'+
        '<textarea placeholder="写下对这篇文献的笔记 / 看法 …" data-id="'+p.id+'">'+esc((notes[p.id]&&notes[p.id].text)||"")+'</textarea>'+
        '<button class="paper-note-save" data-id="'+p.id+'">保存笔记 ⭐</button>'+
      '</div>'+
    '</div>';
  });
  $("#paper-list").innerHTML=html;
  // 笔记事件
  $$(".paper-note-save").forEach(b=>b.onclick=()=>{
    const id=b.dataset.id;
    const ta=document.querySelector('.paper-note-block textarea[data-id="'+id+'"]');
    const N=getPaperNotes();N[id]={text:ta.value,date:todayStr()};savePaperNotes(N);
    b.textContent="已保存 ✅";setTimeout(()=>b.textContent="保存笔记 ⭐",1200);
  });
  $$(".paper-note-block textarea").forEach(ta=>ta.oninput=()=>{
    const id=ta.dataset.id;const N=getPaperNotes();
    N[id]={text:ta.value,date:todayStr()};savePaperNotes(N);
  });
  // 今日总笔记
  const todayNotes=Object.values(notes).filter(n=>n&&n.date===today&&n.text);
  $("#paper-note").value=(todayNotes.map(n=>"—— "+n.text).join("\n\n"))||"";
  $("#paper-note-history").innerHTML=todayNotes.length?
    '<div class="empty-tip" style="color:#3a7ab0">已为今日 '+todayNotes.length+' 篇文献记录笔记</div>':"";
}
if($("#paper-refresh"))$("#paper-refresh").onclick=()=>{
  const cfg=getPaperCfg();
  cfg.keyword=$("#paper-keyword").value.trim()||DB.defaultPaperKeyword;
  cfg.lastUpdate=todayStr();
  savePaperCfg(cfg);renderPapers();
};
$("#paper-keyword") && $("#paper-keyword").addEventListener("keydown",e=>{if(e.key==="Enter")$("#paper-refresh").click();});
if($("#paper-note-save"))$("#paper-note-save").onclick=()=>{
  const v=$("#paper-note").value.trim();if(!v)return;
  const all=LS.get("yi_paper_note_daily",{});all[todayStr()]=v;LS.set("yi_paper_note_daily",all);
  $("#paper-note-save").textContent="已保存 ✅";setTimeout(()=>$("#paper-note-save").textContent="保存阅读笔记 ⭐",1500);
};
// 0 点自动更新（每小时检查一次）
setInterval(()=>{
  const cfg=getPaperCfg();
  if(cfg.lastUpdate!==todayStr()){cfg.lastUpdate=todayStr();savePaperCfg(cfg);renderPapers();}
  // 新闻热点同步换日
  if(window.renderNews){
    const lastNews=LS.get("yi_news_date","");
    if(lastNews!==todayStr()){LS.set("yi_news_date",todayStr());renderNews();}
  }
  // 饮食：跨日则检查是否需要生成昨日分析
  try{ checkDietAutoAnalyze(); renderDiet(); }catch(e){console.warn(e);}
},3600*1000);


/* ============ 健康生活（合并：喝水 + 饮食 + 睡眠） ============ */
function renderHealth(){
  // 顶部 4 卡（晨重/累计/目标/TDEE）— 不论切到哪个 tab 都保持
  renderWeightCard();
  // 三个子模块都跑一次渲染（首次进入；后续切 tab 不用重渲染）
  renderWater();renderDiet();renderSleep();
  // tab 切换
  const bar=document.querySelector(".health-tabs");
  if(bar && !bar.dataset.bound){
    bar.dataset.bound="1";
    bar.addEventListener("click",e=>{
      if(!e.target.classList.contains("chip"))return;
      bar.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
      e.target.classList.add("active");
      const t=e.target.dataset.ht;
      $$(".ht-panel").forEach(p=>p.classList.add("hidden"));
      $("#ht-"+t).classList.remove("hidden");
    });
  }
}

/* ============ 新闻热点（每日推送·已验证链接） ============ */
let newsFilter="all";
function pickNewsToday(){
  const all=(DB.news||[]).filter(n=>newsFilter==="all"||n.cat===newsFilter);
  if(!all.length)return [];
  const off=dayIndex();
  const n=Math.min(6,all.length);
  const out=[];const start=(off*n)%all.length;
  for(let i=0;i<n;i++)out.push(all[(start+i)%all.length]);
  return out;
}
function recordNewsHistory(list){
  if(!list||!list.length)return;
  const hist=LS.get("yi_news_history",{});
  const today=todayStr();
  hist[today]=list.map(n=>n.id);
  // 只保留最近 30 天
  const keys=Object.keys(hist).sort();
  while(keys.length>30){const drop=keys.shift();delete hist[drop];}
  LS.set("yi_news_history",hist);
}
function newsArchiveCount(){
  const hist=LS.get("yi_news_history",{});
  return Object.values(hist).reduce((s,arr)=>s+(arr?arr.length:0),0);
}
function renderNewsArchive(){
  const hist=LS.get("yi_news_history",{});
  const box=$("#news-archive-list");
  if(!box)return;
  const days=Object.keys(hist).sort().reverse();
  if(!days.length){box.innerHTML='<div class="archive-empty">还没有历史推送记录 🗞️</div>';return;}
  const map={};(DB.news||[]).forEach(n=>{map[n.id]=n;});
  const catColor={国家政策:"#c25a76",桥梁工程:"#3a7ab0",行业动态:"#5fa05a",校招就业:"#9a6cbf"};
  box.innerHTML=days.map(d=>{
    const ids=(hist[d]||[]).map(id=>map[id]).filter(Boolean);
    return '<div class="archive-day"><h4>📅 '+d+'</h4>'+
      ids.map(n=>'<div class="archive-item" style="border-left-color:'+(catColor[n.cat]||"#7a7a7a")+'">'+
        '<span class="ai-cat" style="background:'+(catColor[n.cat]||"#7a7a7a")+'">'+n.cat+'</span>'+
        '<span class="ai-title">'+esc(n.title)+'</span>'+
        '<a href="'+n.url+'" target="_blank" rel="noopener">🔗 原文</a></div>').join("")+
      '</div>';
  }).join("");
}
function renderNews(){
  if(!DB.news||!DB.news.length){
    $("#news-list").innerHTML='<div class="empty-tip">暂无新闻数据</div>';
    $("#news-count").textContent="0";return;
  }
  const list=pickNewsToday();
  recordNewsHistory(list);
  const archEl=$("#news-arch-count"); if(archEl) archEl.textContent=newsArchiveCount();
  $("#news-count").textContent=list.length;
  $("#news-list").innerHTML=list.map(n=>{
    const catColor={国家政策:"#c25a76",桥梁工程:"#3a7ab0",行业动态:"#5fa05a",校招就业:"#9a6cbf"}[n.cat]||"#7a7a7a";
    const star=cardStar("news",n.id,n.title,catEmoji(n.cat),n.summary);
    return '<div class="news-card" style="border-left:5px solid '+catColor+'">'+
      '<div class="news-top"><span class="news-cat" style="background:'+catColor+'">'+n.cat+'</span>'+
      '<span class="news-date">📅 '+n.date+'</span>'+
      '<span class="news-src">📰 '+esc(n.source)+'</span></div>'+
      '<div class="news-title">'+esc(n.title)+' '+(n.verified?'<span class="news-verified">✅ 已验证</span>':'')+'</div>'+
      '<div class="news-summary">'+esc(n.summary)+'</div>'+
      '<a class="news-link" href="'+n.url+'" target="_blank" rel="noopener">🔗 点击查看原文</a>'+
      star+'</div>';
  }).join("");
}
function catEmoji(c){return {国家政策:"🇨🇳",桥梁工程:"🌉",行业动态:"📈",校招就业:"💼"}[c]||"📰";}
if($("#news-filter"))$("#news-filter").addEventListener("click",e=>{
  if(!e.target.classList.contains("chip"))return;
  $("#news-filter").querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
  e.target.classList.add("active");
  newsFilter=e.target.dataset.nf;
  renderNews();
});
// 注册到全局方便 0 点检测调用
window.renderNews=renderNews;

if($("#news-archive-btn"))$("#news-archive-btn").addEventListener("click",()=>{
  renderNewsArchive();
  const m=$("#news-archive-modal"); if(m) m.classList.remove("hidden");
});
if($("#news-archive-clear"))$("#news-archive-clear").addEventListener("click",()=>{
  if(!confirm("确定要清空所有新闻历史归档吗？"))return;
  LS.set("yi_news_history",{});
  renderNewsArchive();
  const archEl=$("#news-arch-count"); if(archEl) archEl.textContent="0";
  toast("🗑 历史归档已清空");
});


/* ============ 每周复核（基于本周数据自动生成周报 + 下周建议） ============ */
function weeklyData(){
  // 聚合最近 7 天的所有数据
  const todos={done:0,total:0,days:{}};
  const water={cups:0,ml:0,days:0};
  const sleep={total:0,rating:0,days:0};
  const diet={kcal:0,days:0,items:0};
  const reviews=[];
  const favs=Object.keys(FAVS()).length;
  for(let off=6;off>=0;off--){
    const d=dateOf(off);
    // 待办
    const t=getTodos(d);
    if(t.length){todos.total+=t.length;todos.done+=t.filter(x=>x.done).length;todos.days[d]={done:t.filter(x=>x.done).length,total:t.length};}
    // 喝水
    const W=getWater();
    if(W[d]){const cups=W[d].filter(x=>x.done).length;const ml=W[d].filter(x=>x.done).reduce((a,b)=>a+(+b.ml||0),0);water.cups+=cups;water.ml+=ml;if(cups>0)water.days++; }
    // 睡眠
    const S=getSleep();
    if(S[d]){sleep.total+=S[d].dur||0;sleep.rating+=S[d].rating||0;sleep.days++;}
    // 饮食
    const D=getDiet();
    if(D.days[d]&&D.days[d].foods){diet.kcal+=D.days[d].foods.reduce((a,b)=>a+(+b.cal||0),0);diet.items+=D.days[d].foods.length;diet.days++;}
    // 复盘
    const rs=LS.get("yi_reviews",{});if(rs[d])reviews.push({d,txt:rs[d]});
  }
  return {todos,water,sleep,diet,reviews,favs,words:Object.keys(LS.get("yi_words_"+todayStr(),{})).length};
}
function renderWeekly(){
  const box=$("#weekly-report");
  if(!box)return;
  const w=weeklyData();
  // 计算本周日期范围
  const dTo=dateOf(0),dFrom=dateOf(6);
  $("#wh-weekrange").textContent="📅 本周范围："+dFrom+" ~ "+dTo;
  // 完成率
  const taskRate=w.todos.total?Math.round(w.todos.done/w.todos.total*100):0;
  const avgCups=w.water.days?Math.round(w.water.cups/w.water.days*10)/10:0;
  const avgSleep=w.sleep.days?Math.round(w.sleep.total/w.sleep.days*10)/10:0;
  const avgRating=w.sleep.days?Math.round(w.sleep.rating/w.sleep.days*10)/10:0;
  const avgKcal=w.diet.days?Math.round(w.diet.kcal/w.diet.days):0;
  // 自动生成建议（基于数据的规则化模板）
  const advices=[];
  if(taskRate>=80) advices.push({ico:"🌟",title:"计划完成度优秀",txt:"本周任务完成率 "+taskRate+"%！保持节奏，可以挑战更高目标（比如每天多 1 项硬骨头任务）。"});
  else if(taskRate>=50) advices.push({ico:"⚖️",title:"计划完成度中等",txt:"本周完成 "+taskRate+"%，中规中矩。建议把“待办”拆得更细：每天 ≤ 5 项，每项 ≤ 60 分钟；前一天晚上先列清单。"}); 
  else if(w.todos.total>0) advices.push({ico:"🚨",title:"计划完成度偏低",txt:"仅完成 "+taskRate+"%。问题大概率在“开始难”——试试“两分钟启动法”：告诉自己“只做 2 分钟”，通常 2 分钟后就能继续。"}); 
  else advices.push({ico:"📝",title:"还没有本周待办",txt:"下周一开始，每天晚上花 5 分钟列第二天 3-5 项计划，按“重要 × 紧急”排序。"}); 
  if(avgCups<5) advices.push({ico:"💧",title:"喝水严重不足",txt:"周均 "+avgCups+" 杯/天，远低于 8 杯目标。下周试试：早上睁眼先灌 250ml；电脑前放 500ml 瓶；下午 3 点设闹钟。"}); 
  else if(avgCups<7) advices.push({ico:"💧",title:"喝水接近达标",txt:"周均 "+avgCups+" 杯/天，离 8 杯还差一点。把最常忘记的那一杯固定到具体动作上（比如：每次坐下吃饭前先喝 100ml）。"}); 
  else advices.push({ico:"💧",title:"喝水表现优秀",txt:"周均 "+avgCups+" 杯/天，皮肤和精力都会感谢你，继续保持！"}); 
  if(w.sleep.days===0) advices.push({ico:"😴",title:"还没有睡眠记录",txt:"下周开始每晚填上床/起床时间 + 1-5 星质量评分。2 周后你会看到自己的睡眠模式，问题会浮出来。"}); 
  else if(avgSleep<7) advices.push({ico:"😴",title:"睡眠时长偏短",txt:"周均 "+avgSleep+" 小时。试着把上床时间固定在 23:00 前 30 分钟；睡前 30 分钟不看手机（蓝光抑制褪黑素）。"}); 
  else if(avgRating<3) advices.push({ico:"😴",title:"睡眠质量偏低",txt:"时长够了（"+avgSleep+"h）但质量评分 "+avgRating+"/5。检查：卧室温度 18-22℃、遮光窗帘、避免 21 点后咖啡/浓茶、晚饭距离睡眠 ≥ 3 小时。"}); 
  else advices.push({ico:"😴",title:"睡眠质量优秀",txt:"周均 "+avgSleep+" 小时，质量 "+avgRating+"/5。把你的入睡流程（运动 / 热牛奶 / 拉伸）写成 SOP，状态不好时直接复用。"}); 
  if(w.diet.days===0) advices.push({ico:"🍱",title:"还没有饮食记录",txt:"下周至少 3 天完整记录（早午晚+加餐），配合“饮食时间段”卡片对比，2 周就能看出热量缺口。"}); 
  else if(avgKcal>0){
    const D=getDiet();
    if(D.profile.tdee && avgKcal>D.profile.tdee+200) advices.push({ico:"🍱",title:"摄入偏高",txt:"周均 "+avgKcal+" kcal，超 TDEE "+(avgKcal-D.profile.tdee)+" kcal。下周：每周 2 天“轻食日”（少油少糖，集中在周二/周五）。"}); 
    else if(D.profile.tdee && avgKcal<D.profile.tdee-400) advices.push({ico:"🍱",title:"摄入偏低",txt:"周均 "+avgKcal+" kcal，低于 TDEE 过多。女生长期低于 1200 kcal/天会掉发/闭经/失眠。建议把目标差值控制在 300-500 kcal。"}); 
  }
  if(w.favs<5) advices.push({ico:"⭐",title:"收藏太少",txt:"本周只收藏 "+w.favs+" 条。收藏 = 你的第二大脑。下周把每条让你有“哦！”感觉的内容都点 ☆，月底统一回看能串成体系。"}); 
  if(w.words<10) advices.push({ico:"📚",title:"英语单词进度落后",txt:"本周仅背 "+w.words+" 个目标词。每天 50 个看似多，但 5 分钟就能背 10 个，碎片时间（排队/睡前/通勤）拼起来就够。"}); 
  // 顶部数据卡
  let html='<div class="card"><div class="card-title">📈 本周数据总览</div><div class="weekly-stat-row">'+
    statBlock("✅ 计划完成",taskRate+"%","绿色",w.todos.done+"/"+w.todos.total+" 项")+
    statBlock("💧 喝水",avgCups,"蓝色",w.water.days+" 天有记录 / "+w.water.ml+" ml")+
    statBlock("😴 睡眠",avgSleep+"h","紫色",w.sleep.days+" 天有记录 / "+avgRating+"⭐")+
    statBlock("🍱 饮食",avgKcal+"kcal","橙色",w.diet.days+" 天有记录 / "+w.diet.items+" 项")+
    statBlock("⭐ 收藏",w.favs,"黄色","累计收藏条数")+
    statBlock("📚 单词",w.words,"粉色","今日已背 / 目标 50")+
    '</div></div>';
  // 建议
  html+='<div class="card"><div class="card-title">💡 下周建议（自动生成 · 看看是否对症）</div>';
  if(!advices.length)html+='<div class="empty-tip">本周数据太少，先用一周再来看建议 🐾</div>';
  else html+=advices.map(a=>'<div class="advice-card"><span class="adv-ico">'+a.ico+'</span><div><b>'+a.title+'</b><div class="adv-txt">'+a.txt+'</div></div></div>').join("");
  html+='</div>';
  // 本周每日明细
  html+='<div class="card"><div class="card-title">📅 本周每日计划完成度</div><div class="week-bar">';
  for(let off=6;off>=0;off--){
    const d=dateOf(off);
    const t=w.todos.days[d]||{done:0,total:0};
    const pct=t.total?Math.round(t.done/t.total*100):0;
    const dayName=["日","一","二","三","四","五","六"][new Date(d).getDay()];
    html+='<div class="wb-col"><div class="wb-pct">'+(t.total?pct+"%":"--")+'</div>'+
      '<div class="wb-bar'+(t.total&&pct===100?" wb-100":"")+(t.total&&pct<60?" wb-low":"")+'" style="height:'+(t.total?Math.max(8,pct):4)+'%"></div>'+
      '<div class="wb-day">'+d.slice(5)+' '+dayName+'</div></div>';
  }
  html+='</div></div>';
  // 复盘摘要
  if(w.reviews.length){
    html+='<div class="card"><div class="card-title">✍️ 本周复盘摘要</div>'+w.reviews.map(r=>'<div class="weekly-review"><b>'+r.d+'</b><div>'+esc(r.txt.slice(0,200))+(r.txt.length>200?"…":"")+'</div></div>').join("")+'</div>';
  }
  box.innerHTML=html;
}
function statBlock(label,val,color,sub){
  return '<div class="ws-block" style="--ws-color:'+(color||"#7a7a7a")+'"><div class="ws-val">'+val+'</div><div class="ws-lab">'+label+'</div><div class="ws-sub">'+sub+'</div></div>';
}
if($("#wh-refresh"))$("#wh-refresh").onclick=()=>{renderWeekly();$("#wh-refresh").textContent="已重新生成 ✅";setTimeout(()=>$("#wh-refresh").textContent="🔄 重新生成周报",1200);};


/* ============ 初始化（密码门禁通过后才执行） ============ */
function init(){
  if(!LS.get("yi_inited",false)){
    setTodos(todayStr(),[
      {txt:"背 50 个土木专业英语单词",done:false},
      {txt:"学习 30 条桥梁知识点",done:false},
      {txt:"查看今日成长记录",done:false}
    ]);
    LS.set("yi_inited",true);
  }
  renderTodos();renderDog();renderReviews();
  renderBaoyan();renderBridge();
  loadWordDay();renderReadings();
  makeFilterList("#know-filter","#knowledge-list",DB.knowledge,50,"c","knowledge");
  makeFilterList("#beauty-filter","#beauty-list",DB.beauty,40,"c","beauty");
  renderBeautyArchive();
  syncSkConcerns(getBeautyProfile().concerns);
  // 变美护肤三个板块 tab 切换
  const btBar=$("#beauty-tabs");
  if(btBar && !btBar.dataset.bound){
    btBar.dataset.bound="1";
    btBar.addEventListener("click",e=>{
      if(!e.target.classList.contains("chip"))return;
      btBar.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));e.target.classList.add("active");
      const t=e.target.dataset.bt;
      $$(".bt-panel").forEach(p=>p.classList.add("hidden"));
      const map={know:"bt-know",sk:"bt-sk",mk:"bt-mk"};
      const el=document.getElementById(map[t]);if(el)el.classList.remove("hidden");
    });
  }
  renderAIDialogs();renderInspirations();
  // 英语发音（英式 / 美式）同步
  const accBtn=document.querySelector('.acc-btn[data-acc="'+ACCENT+'"]');
  if(accBtn){$$(".acc-btn").forEach(x=>x.classList.remove("active"));accBtn.classList.add("active");}
  $$(".acc-btn").forEach(b=>b.addEventListener("click",()=>{
    $$(".acc-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");
    ACCENT=b.dataset.acc;LS.set("yi_accent",ACCENT);
  }));
  renderLedger();
  renderWater();renderDiet();renderSleep();renderPapers();
  renderHealth();renderNews();renderWeekly();
  // 饮食：检查昨日是否需要生成分析（零点效果）
  try{ checkDietAutoAnalyze(); }catch(e){console.warn("diet auto-analyze failed",e);}
  renderHome();
  // 初始化同步指示
  const sb=$("#sync-badge");if(sb){sb.classList.add("saved");sb.querySelector(".sync-txt").textContent="已自动保存";}
}
init();
