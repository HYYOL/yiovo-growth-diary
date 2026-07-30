// ================= 云端同步层（Supabase） =================
// 设计：本地优先（localStorage 永丢），配置 Supabase 凭证后自动双向同步。
// 未配置 / 连接失败 → 明显标识「未连接·本地」，数据仍安全保存在本机。
//
// 在 Supabase SQL Editor 执行一次建表（个人项目，策略放开即可）：
//   create table if not exists yi_sync (
//     key text primary key,
//     value jsonb not null,
//     updated_at timestamptz default now()
//   );
//   alter table yi_sync enable row level security;
//   create policy "anon_all" on yi_sync for all using (true) with check (true);
// （anon key 已放开写权限；若你更谨慎，可改为按 auth.uid() 隔离。）
window.CloudSync = (function(){
  const CFG_KEY  = "yi_supabase";
  const META_KEY = "yi_sync_meta";
  const TABLE    = "yi_sync";
  // 不同步的配置类键
  const EXCLUDE  = ["yi_supabase","yi_device_id","yi_inited","yi_sync_meta"];

  let cfg = null;            // {url, anonKey}
  let status = "local";      // local | connecting | online | offline
  let pushTimer = null;
  const queue = new Set();
  let deviceId = (function(){
    let d = localStorage.getItem("yi_device_id");
    if(!d){ d = "dev_"+Math.random().toString(36).slice(2,10); localStorage.setItem("yi_device_id",d); }
    return d;
  })();

  /* ---------- 配置读写 ---------- */
  function loadCfg(){ try{ cfg=JSON.parse(localStorage.getItem(CFG_KEY)); }catch(e){ cfg=null; } if(!cfg||!cfg.url||!cfg.anonKey)cfg=null; }
  function saveCfg(c){ cfg=c; localStorage.setItem(CFG_KEY, JSON.stringify(c)); }
  function clearCfg(){ cfg=null; localStorage.removeItem(CFG_KEY); }

  /* ---------- 元信息（记录每条本地最后写入时间，用于拉取时判断谁更新） ---------- */
  function getMeta(){ try{ return JSON.parse(localStorage.getItem(META_KEY))||{}; }catch(e){ return {}; } }
  function setMeta(m){ try{ localStorage.setItem(META_KEY, JSON.stringify(m)); }catch(e){} }

  /* ---------- 收集需要同步的数据键 ---------- */
  function dataKeys(){
    const out=[];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k && k.indexOf("yi_")===0 && EXCLUDE.indexOf(k)<0) out.push(k);
    }
    return out;
  }

  /* ---------- Supabase REST（PostgREST）封装 ---------- */
  function authHeaders(){
    return {
      "apikey": cfg.anonKey,
      "Authorization":"Bearer "+cfg.anonKey,
      "Content-Type":"application/json",
      "Prefer":"resolution=merge-duplicates,return=minimal"
    };
  }
  function api(path,opts){
    opts=opts||{};
    opts.headers=Object.assign(authHeaders(), opts.headers||{});
    const base=cfg.url.replace(/\/+$/,"");
    return fetch(base+"/rest/v1/"+path, opts);
  }

  async function ping(){
    if(!cfg) return false;
    try{
      const r=await api(TABLE+"?select=key&limit=1");
      return r.ok;  // 严格 2xx：404/401/403 都不算连接成功
    }
    catch(e){ return false; }
  }

  async function pushKey(k){
    if(status!=="online") return;
    let raw; try{ raw=localStorage.getItem(k); }catch(e){ return; }
    if(raw===null) return;
    let val; try{ val=JSON.parse(raw); }catch(e){ return; }
    try{
      const r=await api(TABLE+"?on_conflict=key",{
        method:"POST",
        body:JSON.stringify({ key:k, value:val, updated_at:new Date().toISOString() })
      });
      if(r.status===401||r.status===403){ setStatus("offline"); return; }
      if(!r.ok){ // 兜底：尝试 PATCH（行已存在时）
        await api(TABLE+"?key=eq."+encodeURIComponent(k),{
          method:"PATCH",
          body:JSON.stringify({ value:val, updated_at:new Date().toISOString() })
        });
      }
    }catch(e){ /* 离线或表不存在：本机数据保留 */ }
  }

  async function pullAll(){
    if(status!=="online") return;
    try{
      const r=await api(TABLE+"?select=key,value,updated_at");
      if(!r.ok) return;
      const rows=await r.json();
      const meta=getMeta();
      let changed=false;
      rows.forEach(row=>{
        if(EXCLUDE.indexOf(row.key)>=0) return;
        const last=meta[row.key];
        if(!last || new Date(row.updated_at) > new Date(last)){
          try{ localStorage.setItem(row.key, JSON.stringify(row.value)); changed=true; }catch(e){}
        }
      });
      // 把远端时间写回 meta，避免回写循环
      const m=getMeta();
      rows.forEach(rw=>{ if(EXCLUDE.indexOf(rw.key)<0) m[rw.key]=rw.updated_at; });
      setMeta(m);
      if(changed) rerender();
    }catch(e){}
  }

  async function fullSync(){
    for(const k of dataKeys()){ await pushKey(k); }
    await pullAll();
  }

  /* ---------- 角标状态 ---------- */
  function setStatus(s){ status=s; updateBadge(); }

  function updateBadge(forceTxt){
    const b=document.getElementById("sync-badge"); if(!b) return;
    b.classList.remove("saving");
    const t=b.querySelector(".sync-txt");
    let cls="", txt=forceTxt||"";
    if(status==="local"){ cls="local"; txt=txt||"未连接·本地"; }
    else if(status==="connecting"){ cls="syncing"; txt=txt||"云端连接中…"; }
    else if(status==="online"){ cls="online"; txt=txt||"云端已连接"; }
    else if(status==="offline"){ cls="offline"; txt=txt||"云端断开"; }
    b.className="sync-badge "+cls;
    if(t) t.textContent=txt;
    b.title = status==="online"
      ? "已通过 Supabase 云端同步，多设备共享 ✅"
      : (status==="offline"
          ? "云端连接失败，已切换本地模式（数据仍在本机）"
          : "尚未配置云端：数据仅保存在本设备。点击此处填写 Supabase 凭证即可多设备同步");
  }

  function flashSave(){
    const b=document.getElementById("sync-badge"); if(!b) return;
    b.classList.add("saving"); b.classList.remove("saved");
    const t=b.querySelector(".sync-txt"); if(t) t.textContent="保存中…";
    setTimeout(()=>updateBadge(), 380);
  }

  /* ---------- 写操作后触发推送（本地优先，联网才推） ---------- */
  function schedulePush(k){
    if(status!=="online") return;
    queue.add(k);
    if(pushTimer) clearTimeout(pushTimer);
    pushTimer=setTimeout(async()=>{
      const keys=[...queue]; queue.clear();
      for(const kk of keys){ await pushKey(kk); }
      updateBadge();
    }, 700);
  }

  /* ---------- 重新渲染（拉取后刷新界面） ---------- */
  function rerender(){
    const fns=["renderHome","renderTodos","renderDog","renderReviews","renderBaoyan","renderBridge",
      "renderReadings","renderWater","renderDiet","renderSleep","renderPapers",
      "renderLedger","renderInspirations","renderAIDialogs","renderFavModal"];
    fns.forEach(fn=>{ try{ if(typeof window[fn]==="function") window[fn](); }catch(e){} });
  }

  /* ---------- 弹窗（配置 Supabase 凭证） ---------- */
  function openModal(){
    const m=document.getElementById("sync-modal"); if(!m) return;
    const c=getCfgSafe();
    const u=document.getElementById("sync-url"), k=document.getElementById("sync-key");
    if(u) u.value=c.url||""; if(k) k.value=c.anonKey||"";
    const st=document.getElementById("sync-status");
    if(st) st.textContent = status==="online" ? "当前已连接云端 ✅"
                  : (status==="offline" ? "当前云端不可用，请检查 URL / anon key"
                  : "尚未连接云端：填写后点击「保存并连接」即可多设备同步");
    const err=document.getElementById("sync-err"); if(err) err.textContent="";
    /* SQL 提示折叠：已连接用户折叠；未连接时展开引导 */
    const tip=document.getElementById("sync-tip-details");
    if(tip) tip.open = (status!=="online");
    m.classList.remove("hidden");
  }
  function closeModal(){ const m=document.getElementById("sync-modal"); if(m) m.classList.add("hidden"); }
  function getCfgSafe(){ try{ return JSON.parse(localStorage.getItem(CFG_KEY))||{}; }catch(e){ return {}; } }

  async function saveAndConnect(){
    const u=document.getElementById("sync-url").value.trim();
    const k=document.getElementById("sync-key").value.trim();
    const err=document.getElementById("sync-err");
    if(!u||!k){ if(err) err.textContent="请填写 Supabase URL 和 anon key"; return; }
    if(err){ err.textContent=""; err.innerHTML=""; }
    setStatus("connecting");
    const prev=cfg; cfg={url:u, anonKey:k};
    let okR=false, status=0, body="";
    try{
      const r=await api(TABLE+"?select=key&limit=1");
      okR=r.ok; status=r.status;
      if(!r.ok){ try{ body=await r.text(); }catch(e){} }
    }catch(e){
      cfg=prev; setStatus(prev?"offline":"local");
      if(err) err.innerHTML="❌ 请求失败：<b>"+(e&&e.message?e.message:e)+"</b><br><span class=\"muted\">可能是网络问题，国内访问 supabase.co 有时需要代理。</span>";
      return;
    }
    if(okR){
      saveCfg(cfg); setStatus("online"); await fullSync(); closeModal();
      return;
    }
    cfg=prev; setStatus(prev?"offline":"local");
    // 表不存在（最常见坑：用户填了 URL 和 key 但忘了去 SQL Editor 建表）
    if(status===404 && /PGRST205|Could not find the table/i.test(body)){
      if(err) err.innerHTML="❌ 连接通了，但 <b>yi_sync 表还没建</b>！<br><span class=\"muted\">请到 Supabase 后台 <b>SQL Editor</b>，用折叠区里的「一键复制建表 SQL」按钮复制 SQL → 粘贴运行 → 完成后回到这里再点一次「保存并连接」。</span>";
      const tip=document.getElementById("sync-tip-details"); if(tip) tip.open=true;
      return;
    }
    if(status===401 || status===403){
      if(err) err.innerHTML="❌ <b>anon key 无效或无读权限</b>（HTTP "+status+"）。请检查 <b>Project Settings → API → anon public</b> 是否完整复制（eyJ 开头的长串）。";
      return;
    }
    if(err) err.innerHTML="⚠️ HTTP "+status+(body?`：${body.slice(0,160)}`:"");
  }
  function disconnect(){
    clearCfg(); setStatus("local");
    const err=document.getElementById("sync-err"); if(err) err.textContent="";
  }

  /* ---------- 诊断：实际拉取云端 yi_sync 表，对比本地 ---------- */
  async function inspectCloud(){
    const btn=document.getElementById("sync-inspect");
    const box=document.getElementById("sync-inspect-result");
    if(!cfg){ if(box) box.textContent="⚠️ 尚未配置云端凭证，无法检查。请先填写 URL / anon key 并保存连接。"; return; }
    if(btn){ btn.disabled=true; btn.textContent="检查中…"; }
    if(box) box.innerHTML="<span class='muted'>正在向云端请求 yi_sync 表…</span>";
    try{
      const r=await api(TABLE+"?select=key,updated_at&order=updated_at.desc");
      if(!r.ok){
        const msg=await r.text().catch(()=>"");
        if(box) box.innerHTML="❌ 云端返回 HTTP "+r.status+"："+msg.slice(0,200);
        return;
      }
      const rows=await r.json();
      const local=dataKeys();
      const cloudSet=new Set(rows.map(rw=>rw.key).filter(k=>EXCLUDE.indexOf(k)<0));
      const synced=local.filter(k=>cloudSet.has(k));
      const localOnly=local.filter(k=>!cloudSet.has(k));
      const cloudOnly=[...cloudSet].filter(k=>local.indexOf(k)<0);
      const fmt=t=>{ const d=new Date(t); if(isNaN(d)) return String(t);
        return (d.getMonth()+1)+"/"+d.getDate()+" "+("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2); };
      let html="<b>☁️ 云端 yi_sync 表共 "+rows.length+" 条记录</b><br>";
      rows.filter(rw=>EXCLUDE.indexOf(rw.key)<0).slice(0,14).forEach(rw=>{
        html+="· <span class='k'>"+rw.key+"</span> <span class='muted'>("+fmt(rw.updated_at)+")</span><br>";
      });
      if(rows.length>14) html+="<span class='muted'>… 还有 "+(rows.length-14)+" 条</span><br>";
      html+="<br><b>对比本地</b>：已同步 <span class='ok'>"+synced.length+"</span> 项 / 本地独有 <span class='warn'>"+localOnly.length+"</span> 项";
      if(localOnly.length) html+="（"+localOnly.slice(0,6).join("、")+(localOnly.length>6?"…":"")+"）";
      if(cloudOnly.length) html+="<br><span class='muted'>云端独有 "+cloudOnly.length+" 项：</span>"+cloudOnly.slice(0,6).join("、");
      if(box) box.innerHTML=html;
    }catch(e){
      if(box) box.innerHTML="❌ 请求失败："+(e&&e.message?e.message:e);
    }finally{
      if(btn){ btn.disabled=false; btn.textContent="📡 检查云端同步"; }
    }
  }

  /* ---------- 初始化 ---------- */
  function init(){
    loadCfg();
    wrapLS();
    const b=document.getElementById("sync-badge"); if(b) b.onclick=openModal;
    const closeBtn=document.getElementById("sync-close"); if(closeBtn) closeBtn.onclick=closeModal;
    const saveBtn=document.getElementById("sync-save"); if(saveBtn) saveBtn.onclick=saveAndConnect;
    const discBtn=document.getElementById("sync-disconnect"); if(discBtn) discBtn.onclick=disconnect;
    const nowBtn=document.getElementById("sync-now"); if(nowBtn) nowBtn.onclick=()=>{ if(status==="online") fullSync(); };
    const insBtn=document.getElementById("sync-inspect"); if(insBtn) insBtn.onclick=inspectCloud;
    const copyBtn=document.getElementById("sync-copy-sql");
    if(copyBtn){
      copyBtn.onclick=()=>{
        const sql=`create table if not exists public.yi_sync (\n  key text primary key,\n  value jsonb not null,\n  updated_at timestamptz default now()\n);\nalter table public.yi_sync enable row level security;\ncreate policy "anon_all" on public.yi_sync for all to anon\n  using (true) with check (true);`;
        const done=()=>{ copyBtn.textContent="✅ 已复制，去 Supabase SQL Editor 粘贴"; setTimeout(()=>{ copyBtn.textContent="📋 一键复制建表 SQL"; }, 2400); };
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(sql).then(done).catch(()=>{
            // 兜底
            const ta=document.createElement("textarea"); ta.value=sql; ta.style.position="fixed"; ta.style.opacity="0";
            document.body.appendChild(ta); ta.select();
            try{ document.execCommand("copy"); done(); }catch(e){ copyBtn.textContent="❌ 复制失败，请手动选中 SQL"; }
            document.body.removeChild(ta);
          });
        }
      };
    }
    const modal=document.getElementById("sync-modal");
    if(modal) modal.addEventListener("click",e=>{ if(e.target.id==="sync-modal") closeModal(); });

    if(cfg){
      setStatus("connecting");
      ping().then(ok=>{ setStatus(ok?"online":"offline"); if(ok) fullSync(); });
    }else{
      setStatus("local");
    }

    // 心跳：每分钟探测；前台切回时拉取
    setInterval(()=>{
      if(cfg && status!=="connecting"){
        ping().then(ok=>{
          const ns=ok?"online":"offline";
          if(ns!==status){ setStatus(ns); if(ns==="online") fullSync(); }
        });
      }
    }, 60000);
    document.addEventListener("visibilitychange",()=>{ if(!document.hidden && status==="online") pullAll(); });
  }

  function wrapLS(){
    const orig=LS.set;
    LS.set=function(k,v){
      const r=orig.apply(LS, arguments);
      if(k && k.indexOf("yi_")===0 && EXCLUDE.indexOf(k)<0){
        const m=getMeta(); m[k]=new Date().toISOString(); setMeta(m);
        schedulePush(k);
      }
      return r;
    };
  }

  return { init, updateBadge, flashSave, status:()=>status, fullSync, pullAll, pushKey, inspectCloud };
})();

CloudSync.init();
