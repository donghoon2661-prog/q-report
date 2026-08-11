/* ===== app.js — 렌더링 · 스케줄 · 표 · 카드 · 인증 · 라우팅 ===== */

/* ---------- 원 스케줄 병기 ---------- */
const ACTUAL_FLAG = { polDep:"polDepActual", tsArr:"tsArrActual", tsDep:"tsDepActual", eta:"etaActual" };

function origOf(bkg, field){
  const log = HIST[bkg] || [];
  for(const e of log){
    if(!Array.isArray(e.changes)) continue;
    const c = e.changes.find(x => x.field === field);
    if(c && c.from) return c.from;
  }
  const f = log.find(e => e.first);
  if(f && f[field]) return f[field];
  if(field === "eta" && POETA[bkg]) return POETA[bkg];
  return null;
}
const fmtAny = v => !v ? "\u2014"
  : /[T ]\d\d:/.test(String(v)) ? fmtDT(v) : monAbbr(String(v).slice(5,7))+"/"+String(v).slice(8,10);
const tsLoose = v => { const a = TS(v); return a !== null ? a : (v ? TS(v + "T00:00:00") : null); };

function dtCell(s, field){
  const cur = s[field], t = TS(cur);
  if(t === null) return fmtDT(cur);
  const flagKey = ACTUAL_FLAG[field];
  const done = flagKey ? !!s[flagKey] : false;
  const orig  = origOf(s.booking, field);
  const ot    = tsLoose(orig);
  const moved = ot !== null && ot !== t;
  const dd    = moved ? Math.round((t - ot) / DAY * 10) / 10 : 0;
  const ddStr = dd.toFixed(1);
  return `${fmtDT(cur)}<span class="sest">${done ? "actual" : "scheduled"}</span>`
       + (moved ? `<span class="sorig">(orig ${fmtAny(orig)}${
           dd ? ` <b class="${dd > 0 ? "warn" : ""}">${dd > 0 ? "+" : ""}${ddStr}d</b>` : ""})</span>` : "");
}

/* ---------- 사이드바 ---------- */
function showSide(s,L2){
  const nm = portNames(s);
  const geo = L2
    ? `<dt>STATUS</dt><dd>${L2.phase}</dd>
       <dt>SEGMENT</dt><dd>${L2.i+1} / ${s.route.length-1} · ${(L2.f*100).toFixed(1)}%</dd>
       <dt>POSITION</dt><dd>${L2.pos[0].toFixed(3)}° , ${unwrap(L2.pos[1]).toFixed(3)}°</dd>`
    : `<dt>STATUS</dt><dd class="warn">Position unavailable — HMM map lookup failed</dd>`;
  const synthNote = s.routeSynth
    ? `<dt>ROUTE SOURCE</dt><dd class="dim">Estimated from booked schedule (HMM map not issued yet)</dd>` : "";

  const po = poSummary(s.booking);
  const poRow = po ? `<dt>PO / LOT</dt><dd>${po}</dd>` : "";
  const d = poDelay(s);
  const dRow = d ? `<dt>VS PLAN</dt><dd>${delayHTML(s)} <span class="dim">(original ${d.orig})</span></dd>` : "";
  const rRow = s.rollover
    ? `<dt>ROLLOVER</dt><dd class="warn">Not loaded on ${s.vessel} ${s.voyage} — ${s.rolloverDays||0}d past ETD</dd>` : "";

  const log = (HIST[s.booking]||[]).slice().reverse();
  const FL = {vessel:"VESSEL", voyage:"VOYAGE", polDep:"PKG ETD", tsDep:"SIN ETD", eta:"LA ETB", destEta:"DEST ETA"};
  const shortV = v => /^\d{4}-\d\d-\d\dT/.test(v||"") ? fmtDT(v) : v;
  const histHTML = log.length
    ? `<div class="schist"><div class="sh-h">SCHEDULE CHANGES</div>` + log.map(e=>{
        if(e.first) return `<div class="sh"><span class="st">${toKST(e.at)}</span>`
          + `<span class="sc dim">first seen · SIN ETD ${fmtDT(e.tsDep)} · LA ETB ${fmtDT(e.eta)}</span></div>`;
        return `<div class="sh"><span class="st">${toKST(e.at)}</span><span class="sc">`
          + (e.changes||[]).map(c=>`${FL[c.field]||c.label} <s>${shortV(c.from)}</s> → <b>${shortV(c.to)}</b>`).join("<br>")
          + `</span></div>`;
      }).join("") + `</div>`
    : `<div class="schist"><div class="sh-h">SCHEDULE CHANGES</div>
       <div class="sh"><span class="sc dim">No changes recorded yet — tracking started with this build.</span></div></div>`;

  const ev = Array.isArray(s.events) && s.events.length
    ? `<div class="evtl">${s.events.slice(0,6).map((e,k)=>
        `<div class="ev${k?"":" now"}"><span class="et">${fmtDT(e.at)}</span>
         <span class="es">${e.status}</span><span class="el">${shortPort(e.loc)}</span></div>`).join("")}</div>`
    : "";

  const chk = s.checkedAt
    ? `<dt>CHECKED</dt><dd>${toKST(s.checkedAt)} · ${ago(s.checkedAt)}${s.staleItem?' <b class="warn">(retry pending)</b>':''}</dd>` : "";

  document.getElementById('side').innerHTML=`
    <h3>${s.vessel} ${s.voyage}</h3>
    <div class="sb">${s.booking} · ${s.svc} · ${s.cntrQty||(s.containers&&s.containers.length)||"—"} CNTR${s.cntrType?" "+s.cntrType:""}</div>
    <dl>
      ${geo}
      <dt>ROUTE</dt><dd>${dedupeLabels(nm).filter(Boolean).join(" → ")}</dd>
      <dt>PKG ETD</dt><dd>${dtCell(s,"polDep")}</dd>
      ${s.spDep ? `<dt>GATE IN</dt><dd><span class="dt">${fmtDT(s.spDep)}</span><span class="sest">actual</span></dd>` : ""}
      <dt>SIN ETA</dt><dd>${dtCell(s,"tsArr")}</dd>
      <dt>SIN ETD</dt><dd>${dtCell(s,"tsDep")}</dd>
      ${(()=>{const t=tsDwell(s);return t?`<dt>T/S DWELL</dt><dd>${t.plan!==null?`plan ${t.plan}d → `:""}<b>${t.cur}d</b> <span class="dim">(${t.actual?"actual":"scheduled"})</span>${t.diff!==null&&t.diff!==0?` <span class="${t.diff>0?"warn":""}">${t.diff>0?"+":""}${t.diff}d</span>`:""}</dd>`:"";})()}
      <dt>LA ETB</dt><dd>${dtCell(s,"eta")}</dd>
      <dt>DEST ETA</dt><dd>${dtCell(s,"destEta")}</dd>
      <dt>FEEDER</dt><dd>${s.feeder||"— (direct)"}</dd>
      ${synthNote}${poRow}${dRow}${rRow}${chk}
      <dt>LATEST</dt><dd>${s.last||"—"}</dd>
    </dl>${histHTML}${ev}`;
}
function select(s,i,pan){
  showSide(s,locate(s));
  document.querySelectorAll('#vtbody tr').forEach(t=>t.classList.toggle('on',+t.dataset.i===i));
  if(pan && markers[i] && markers[i].getLatLng) map.panTo(markers[i].getLatLng());
  if(markers[i] && markers[i].openTooltip) markers[i].openTooltip();
}

/* ---------- 변동 로그 ---------- */
const SIGNAL_DAYS = 5;
const GAP_REMARK = `<p class="gapremark">The <b>!</b> mark appears when the LA ETB has moved
  against the original plan, and disappears automatically ${SIGNAL_DAYS} days after the change was
  detected. Click the number box at any time to see the full change log.</p>`;

function etaChangeLog(booking){
  const plan = POETA[booking] || null;
  const log = (HIST[booking]||[]).filter(e => Array.isArray(e.changes) && e.changes.some(c => c.field === "eta"));
  const gapOf = v => { if(!plan || !v) return null; return Math.round((new Date(v.slice(0,10)) - new Date(plan))/86400000); };
  return log.map(e=>{
    const c = e.changes.find(x=>x.field==="eta");
    return { at:e.at, from:c.from, to:c.to, gapFrom:gapOf(c.from), gapTo:gapOf(c.to) };
  }).reverse();
}
function etaChangedRecently(booking){
  const log = etaChangeLog(booking);
  if(!log.length) return false;
  const t = Date.parse(String(log[0].at).replace(" ","T").replace("Z","")+"Z");
  if(!Number.isFinite(t)) return false;
  return (Date.now() - t) < SIGNAL_DAYS*86400000;
}
function vesselChangeLog(booking){
  const log = (HIST[booking]||[]).filter(e => Array.isArray(e.changes) && e.changes.some(c => c.field === "vessel"));
  return log.map(e=>{
    const v = e.changes.find(x=>x.field==="vessel");
    const y = e.changes.find(x=>x.field==="voyage");
    return { at:e.at, vFrom:v.from, vTo:v.to, yFrom:y?y.from:null, yTo:y?y.to:null };
  }).reverse();
}
function vesselChangedRecently(booking){
  const log = vesselChangeLog(booking);
  if(!log.length) return false;
  const t = Date.parse(String(log[0].at).replace(" ","T").replace("Z","")+"Z");
  if(!Number.isFinite(t)) return false;
  return (Date.now() - t) < SIGNAL_DAYS*86400000;
}
function showVesselLog(booking){
  const log = vesselChangeLog(booking);
  const box = document.getElementById("gaplog");
  if(!box) return;
  const rows = log.length
    ? log.map(e=>`<tr><td>${toKST(e.at)}</td>
        <td>${e.vFrom} → <b>${e.vTo}</b>${e.yTo?` (${e.yFrom||"—"} → ${e.yTo})`:""}</td></tr>`).join("")
    : `<tr><td colspan="2" class="dim">No vessel change recorded for this booking.</td></tr>`;
  box.innerHTML = `<div class="gl-in">
      <div class="gl-h"><b>${booking}</b> — Vessel change log<button class="gl-x" aria-label="close">✕</button></div>
      <table><thead><tr><th>DETECTED</th><th>VESSEL / VOYAGE</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="gl-n">Detected at each scheduled collection.</p></div>`;
  box.hidden = false;
  box.querySelector(".gl-x").addEventListener("click",()=>{ box.hidden = true; });
  box.addEventListener("click",e=>{ if(e.target===box) box.hidden=true; },{once:true});
}
function showGapLog(booking){
  const log = etaChangeLog(booking);
  const box = document.getElementById("gaplog");
  if(!box) return;
  const rows = log.length
    ? log.map(e=>`<tr><td>${toKST(e.at)}</td>
        <td>${fmtDT(e.from)} → <b>${fmtDT(e.to)}</b></td>
        <td class="${(e.gapTo??0) > (e.gapFrom??0) ? "worse":"better"}">
          ${e.gapFrom===null?"—":(e.gapFrom>0?"+":"")+e.gapFrom+"d"} →
          ${e.gapTo===null?"—":(e.gapTo>0?"+":"")+e.gapTo+"d"}</td></tr>`).join("")
    : `<tr><td colspan="3" class="dim">No ETB change recorded for this booking.</td></tr>`;
  box.innerHTML = `<div class="gl-in">
      <div class="gl-h"><b>${booking}</b> — LA ETB change log<button class="gl-x" aria-label="close">✕</button></div>
      <table><thead><tr><th>DETECTED</th><th>LA ETB</th><th>VS PLAN</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="gl-n">Original plan ${POETA[booking]||"—"} · detected at each scheduled collection.</p></div>`;
  box.hidden = false;
  box.querySelector(".gl-x").addEventListener("click",()=>{ box.hidden = true; });
  box.addEventListener("click",e=>{ if(e.target===box) box.hidden=true; },{once:true});
}

/* ---------- 배지 ---------- */
const DELAY_WATCH_D = 4;
const DELAY_ALERT_D = 7;
function poDelay(s){
  const orig = s.planEta || POETA[s.booking] || s.poEta;
  if(!orig || !s.eta) return null;
  const gap = (typeof s.delayDays === "number")
    ? s.delayDays
    : Math.round((new Date(s.eta.slice(0,10)) - new Date(orig))/86400000);
  const level = s.alert || (gap>=DELAY_ALERT_D ? "alert" : gap>=DELAY_WATCH_D ? "watch" : "ok");
  return {gap, orig, level};
}
function delayHTML(s){
  const d = poDelay(s);
  if(!d) return "";
  const cls = d.level==="alert" ? "late" : d.level==="watch" ? "watch" : "early";
  const txt = d.gap>0 ? `${d.gap}d behind` : d.gap<0 ? `${-d.gap}d ahead` : "on plan";
  return `<span class="dtag ${cls}" title="Original plan ${d.orig} · ${d.level.toUpperCase()}">${txt}</span>`;
}
function rolloverHTML(s){
  if(!s.rollover) return "";
  return `<span class="dtag roll" title="${s.rolloverNote||""}">ROLLOVER ${s.rolloverDays||0}d</span>`;
}
function changeHTML(s){
  if(!Array.isArray(s.justChanged) || !s.justChanged.length) return "";
  const t = s.justChanged.map(c=>`${c.label} ${c.from} → ${c.to}`).join(" / ");
  return `<p class="note warn">Schedule changed — ${t}</p>`;
}
function gapBox(s){
  const d = poDelay(s);
  if(!d) return "";
  const g = d.gap;
  const cls = g < 0 ? "g-early" : g <= 3 ? "g-ok" : g <= 6 ? "g-warn" : "g-bad";
  const txt = g > 0 ? "+" + g : String(g);
  const bell = etaChangedRecently(s.booking)
    ? `<span class="gapbang" data-b="${s.booking}" title="LA ETB changed within the last ${SIGNAL_DAYS} days — click for the log">!</span>` : "";
  const vbell = vesselChangedRecently(s.booking)
    ? `<span class="gapbang vsl-bang" data-b="${s.booking}" title="Vessel changed within the last ${SIGNAL_DAYS} days — click for the log">!</span>` : "";
  return `<span class="gapbox ${cls}" data-b="${s.booking}"
            title="Original plan ${d.orig} · click for the ETB change log">${txt}</span>${bell}${vbell}`;
}

/* ---------- 표 ---------- */
function rowsHTML(list){
  const actTag = (actual) => (actual ? "actual" : "scheduled");
  return list.map((s,i)=>{
    const etaActTag  = actTag(!!s.etaActual);
    const destActTag = s.destEta ? actTag(!!s.etaActual) : "";
    return `
    <tr data-i="${i}">
      <td><span class="nm">${s.vessel}</span><span class="vy">${s.voyage}</span>
          <span class="bk">${s.booking} · ${s.cntrQty||"—"} CNTR${s.staleItem?" · STALE":""}</span></td>
      <td data-l="PKG ETD"><span class="dt">${fmtDT(s.polDep)}</span><span class="est">${actTag(!!s.polDepActual)}</span></td>
      <td data-l="SIN ETD"><span class="dt">${fmtDT(s.tsDep)}</span><span class="est">${actTag(!!s.tsDepActual)}</span></td>
      <td data-l="LA ETB / DEST ETA">
        <div><span class="eta-lbl">ETB</span><span class="dt">${fmtDT(s.eta)}</span>${gapBox(s)}<span class="est">${etaActTag}</span></div>
        ${s.destEta?`<div style="margin-top:3px"><span class="eta-lbl">ETA</span><span class="dt">${fmtDT(s.destEta)}</span><span class="est">${destActTag}</span></div>`:""}
      </td>
    </tr>`;
  }).join("");
}

function buildTable(data){
  document.getElementById('vtbody').innerHTML = rowsHTML(data.shipments);
  document.getElementById('otbody').innerHTML = rowsHTML(data.shipments);
  ["vremark","oremark"].forEach(id=>{ const el = document.getElementById(id); if(el) el.innerHTML = GAP_REMARK; });
  document.querySelectorAll('.gapbox,.gapbang:not(.vsl-bang)').forEach(el=>{
    el.addEventListener('click', ev=>{ ev.stopPropagation(); showGapLog(el.dataset.b); });
  });
  document.querySelectorAll('.gapbang.vsl-bang').forEach(el=>{
    el.addEventListener('click', ev=>{ ev.stopPropagation(); showVesselLog(el.dataset.b); });
  });
  const hook = (sel, jump) => document.querySelectorAll(sel).forEach(tr=>
    tr.addEventListener('click',()=>{
      const i=+tr.dataset.i, s=data.shipments[i];
      if(jump) setView('map');
      document.querySelectorAll('#vtbody tr,#otbody tr').forEach(t=>t.classList.toggle('on',+t.dataset.i===i));
      select(s,i,true); showPO(s,i);
    }));
  hook('#vtbody tr', false);
  hook('#otbody tr', true);
}

/* ---------- 카드 ---------- */
function cardHTML(s){
  const L2 = locate(s);
  const pre = s.preShipment ? `<span class="dtag pre">NOT SHIPPED</span>` : "";
  const stale = s.staleItem ? `<span class="tag t-stale" title="This item's last lookup failed; the previous value is shown">STALE</span>` : "";
  let railHTML;
  if(!L2){
    railHTML = `<p class="note warn">Position unavailable — HMM map lookup failed. Schedule below is current.</p>`;
  }else{
    const nm = dedupeLabels(L2.names);
    const n = L2.names.length-1;
    let nodes="";
    nm.forEach((label,k)=>{
      const x = k/n*100;
      const c = k===n ? "node end" : (k <= L2.i ? "node on" : "node");
      nodes += `<div class="${c}" style="left:${x}%"></div>` + (label?`<div class="node-lb" style="left:${x}%">${label}</div>`:"");
    });
    const pos = (L2.pct*100).toFixed(1);
    railHTML = `<div class="rail"><div class="rail-line"></div><div class="rail-done" style="width:${pos}%"></div>
        ${nodes}<div class="ship-icon" style="left:${pos}%">▮</div>
        <div class="pct">${Math.round(L2.pct*100)}%</div></div>`;
  }
  const cls = !L2 ? "t-dock" : (L2.atPort ? "t-dock" : "t-sail");
  const phase = L2 ? L2.phase : "No position";
  const po = poSummary(s.booking);
  return `<article class="card${s.staleItem?" is-stale":""}">
    <div class="card-hd"><span class="bkg">${s.booking}</span>
      <span class="vsl">${s.vessel} ${s.voyage}</span>
      <span class="tag ${cls}">${phase}</span>${stale}${pre}${rolloverHTML(s)}${delayHTML(s)}</div>
    <div class="card-bd">
      ${railHTML}
      <div class="grid">
        <div class="f"><label>PKG ETD</label><span>${fmtDT(s.polDep)}</span></div>
        <div class="f"><label>SIN ETA</label><span>${fmtDT(s.tsArr)}</span></div>
        <div class="f"><label>SIN ETD</label><span>${fmtDT(s.tsDep)}</span></div>
        <div class="f"><label>LA ETB</label><span>${fmtDT(s.eta)}</span></div>
        <div class="f"><label>SERVICE</label><span>${s.svc}</span></div>
        <div class="f"><label>FEEDER</label><span>${s.feeder||"— (direct)"}</span></div>
        <div class="f"><label>CNTR</label><span>${s.cntrQty||"—"}</span></div>
        <div class="f"><label>PO / LOT</label><span>${po||"—"}</span></div>
      </div>
      ${changeHTML(s)}
      <p class="note">Latest event — ${s.last||"—"}</p>
      ${s.checkedAt?`<p class="note dim">Checked ${toKST(s.checkedAt)} · ${ago(s.checkedAt)}</p>`:""}
    </div></article>`;
}

/* ---------- 개요 ---------- */
function buildOverview(list){
  const rows = list.map((s,i)=>({s,L:locate(s),i})).filter(r=>r.L);
  const active = rows.filter(r=>r.L.pct>0 && r.L.pct<1);
  const sorted=[...rows].sort((a,b)=>a.L.pct-b.L.pct);
  const tiers=[0,1,2]; let k=0;
  const marks=sorted.map(r=>{
    const tier=tiers[k++%3];
    const top=[8,42,76][tier], stem=[104,70,36][tier];
    const x=Math.max(1.5,Math.min(98.5,r.L.pct*100));
    return `<div class="ov" data-b="${r.s.booking}" style="left:${x}%;top:${top}px">
        <div class="lb">${r.s.vessel}</div>
        <div class="pc">${Math.round(r.L.pct*100)}%</div>
        <div class="stem" style="height:${stem}px"></div>
        <div class="dot"></div></div>`;
  }).join("");
  document.getElementById("overview").innerHTML=`
    <h2>ALL SHIPMENTS · PORT KLANG → LOS ANGELES</h2>
    <div class="sub">In transit ${active.length} of ${list.length} · by port-call segment${rows.length<list.length?` · ${list.length-rows.length} without position`:""}</div>
    <div class="orail">
      <div class="base"></div>
      <div class="cap" style="left:0"></div><div class="cap-lb" style="left:0">PORT KLANG</div>
      <div class="cap" style="left:100%"></div><div class="cap-lb" style="left:100%">LOS ANGELES</div>
      ${marks}</div>`;
  document.querySelectorAll("#overview .ov").forEach(el=>{
    el.addEventListener("click",()=>{ const i=list.findIndex(s=>s.booking===el.dataset.b); setView('map'); select(list[i],i,true); });
  });
}

/* ---------- 부킹 추가 ---------- */
const ADD_MAX_TRIES = 3;
function isFatalLookupError(msg){
  return /invalid booking number format|no lookup result|check the booking number|no schedule info|already/i.test(msg||"");
}
function addBooking(){
  const inp=document.getElementById("newbkg");
  const el=document.getElementById("rstatus");
  const bkg=inp.value.trim().toUpperCase();
  if(!/^[A-Z]{4}\d{8}$/.test(bkg)){ el.innerHTML="Invalid booking number format. Expected 4 letters + 8 digits."; return; }
  if(CUR && CUR.shipments.some(s=>s.booking===bkg)){ el.innerHTML=`<b>${bkg}</b> is already in the list.`; return; }
  if(!API){ el.innerHTML=`The browser cannot call HMM directly. Set <b>API</b> at the top of the script to enable this button.`; return; }
  const btn=document.getElementById("addbtn");
  inp.disabled=true; btn.disabled=true;
  const attempt = (n) => {
    el.innerHTML = n===1 ? `${bkg} Retrieving… (HMM responds in 5–10s)` : `${bkg} Retrying ${n} of ${ADD_MAX_TRIES}…`;
    return fetch(API.replace(/\/data$/,"")+"/lookup?bkg="+encodeURIComponent(bkg),{cache:"no-store"})
      .then(r=>r.json()).then(res=>{ if(res.error) throw new Error(res.error); return res; })
      .catch(e=>{
        const msg = e.message || "no response";
        if(n < ADD_MAX_TRIES && !isFatalLookupError(msg)){
          el.innerHTML = `${bkg} attempt ${n} failed — ${msg}<br>Retrying automatically…`;
          return new Promise(r=>setTimeout(r, 4000*n)).then(()=>attempt(n+1));
        }
        throw new Error(msg + (n>1 ? ` (after ${n} attempts)` : ""));
      });
  };
  attempt(1)
    .then(res=>{
      el.innerHTML=`<b>${bkg}</b> added — ${res.vessel||"?"} ${res.voyage||""}. Refreshing…`;
      inp.value="";
      return Promise.all([loadHistory(), fetch(source(),{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject())])
        .then(([,data])=>{
          if(!data.shipments.some(x=>x.booking===bkg)) data.shipments.push(res);
          render(data);
          el.innerHTML=`<b>${bkg}</b> added — ${res.vessel||"?"} ${res.voyage||""}.`
            + (res.preShipment? " Not shipped yet." : "")
            + (res.savedToData ? ` Saved — it stays on screen and refreshes on the next scheduled update.` : ` It will appear from the next scheduled update.`);
        })
        .catch(()=>{ if(CUR){ CUR.shipments.push(res); render(CUR); } el.innerHTML=`<b>${bkg}</b> added — shown from the lookup result.`; });
    })
    .catch(e=>{ el.innerHTML=`${bkg} lookup failed — ${e.message||"no response"}`; })
    .finally(()=>{ inp.disabled=false; btn.disabled=false; });
}

/* ---------- 스탬프 · 알림 ---------- */
function alertBanner(d){
  const el = document.getElementById("alertbar");
  if(!el) return;
  const list = (d.shipments||[]).filter(s=>s.rollover || s.alert==="alert");
  if(!list.length){ el.hidden = true; el.innerHTML=""; return; }
  el.hidden = false;
  el.innerHTML = `<b>${list.length} shipment(s) need action</b>` +
    list.map(s=>{
      const why = s.rollover
        ? `not loaded on ${s.vessel} ${s.voyage} (${s.rolloverDays||0}d past ETD)`
        : `${s.delayDays}d behind original plan${s.planEta?` (${s.planEta})`:""}`;
      return `<span class="ai" data-b="${s.booking}">${s.booking} · ${why}</span>`;
    }).join("");
  el.querySelectorAll(".ai").forEach(x=>x.addEventListener("click",()=>{
    const i=(CUR.shipments||[]).findIndex(v=>v.booking===x.dataset.b);
    if(i>=0){ setView('map'); select(CUR.shipments[i],i,true); showPO(CUR.shipments[i],i); }
  }));
}

function stampText(d){
  const lr = document.getElementById("lane-refresh");
  if(lr) lr.textContent = CRON_KST.length + "× / DAY";
  document.getElementById("stamp").innerHTML =
    `HMM retrieved ${toKST(d.updated)} · ${ago(d.updated)}` +
    (d.stale ? `<span class="warn"> · no new HMM events</span>` : "") +
    `<span class="dim2"> · next update in ${nextRun()}</span>` +
    `<span class="dim2"> · ${CRON_KST.length}× daily (${CRON_LABEL})</span>`;
}

/* ---------- 렌더링 ---------- */
let CUR=null;
function render(data){
  const seen = new Map();
  (data.shipments||[]).forEach(s=>{
    s.booking = String(s.booking||"").trim().toUpperCase();
    const old = seen.get(s.booking);
    if(!old) { seen.set(s.booking, s); return; }
    const t = x => Date.parse(String(x.checkedAt||"").replace(" ","T").replace("Z","")+"Z") || 0;
    if(t(s) >= t(old)) seen.set(s.booking, s);
  });
  data.shipments = [...seen.values()];
  buildPortIndex(data.shipments);
  data.shipments.forEach(s=>{ try{ synthRoute(s); }catch(_){} });
  const before = data.shipments.length;
  data.shipments = sortByETD(prune(data.shipments));
  const dropped = before - data.shipments.length;
  CUR=data; stampText(data);
  document.getElementById("n-bkg").textContent=data.shipments.length;
  document.getElementById("n-eta").textContent=fmtD(data.shipments.map(s=>s.eta).sort()[0]);
  document.getElementById("cardlist").innerHTML=data.shipments.map(cardHTML).join("");
  if(dropped) document.getElementById("rstatus").innerHTML=`Removed <b>${dropped}</b> shipment(s) that arrived over 7 days ago.`;
  const safe = (fn,label)=>{ try{ fn(); }catch(e){ console.error(label,e); const el=document.getElementById("rstatus"); if(el) el.innerHTML += `<div class="warn">${label} failed — ${e.message||e}</div>`; } };
  safe(()=>closePO(),"Close PO");
  safe(()=>alertBanner(data),"Alert banner");
  safe(()=>initMap(data),"Map");
  safe(()=>buildTable(data),"Table");
  safe(()=>buildOverview(data.shipments),"Overview");
  safe(()=>renderPOTable(),"PO table");
}

let refreshing = false;
function refreshData(){
  if(refreshing) return;
  refreshing = true;
  const t = document.getElementById("ship-title");
  if(t) t.classList.add("busy");
  const el = document.getElementById("rstatus");
  if(el) el.innerHTML = "Reloading…";
  Promise.all([
    loadPO(), loadHistory(),
    fetch(source(),{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject())
  ]).then(([,,data])=>{
    render(data);
    if(el) el.innerHTML = `Reloaded — ${toKST(data.updated)}`;
  }).catch(e=>{
    if(el) el.innerHTML = `Reload failed — ${e.message||"no response"}`;
  }).finally(()=>{ refreshing = false; if(t) t.classList.remove("busy"); });
}

/* ---------- 라우팅 ---------- */
function setView(v){
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.view===v));
  document.querySelectorAll('.ship-tabbar button').forEach(t=>t.classList.toggle('on',t.dataset.view===v));
  document.getElementById('mapwrap').style.display  = v==='map'?'grid':'none';
  document.getElementById('cards').style.display    = v==='list'?'block':'none';
  document.getElementById('history').style.display  = v==='history'?'block':'none';
  document.getElementById('system').style.display   = v==='system'?'block':'none';
  const laneEl = document.querySelector('.lane');
  if(laneEl) laneEl.style.display = (v==='history'||v==='system') ? 'none' : 'flex';
  if(v==='map'&&map) setTimeout(()=>map.invalidateSize(),60);
  if(v==='history') renderHistoryMonths().catch(e=>console.error("History",e));
  if(v==='system') renderSystemTab();
}
function show(v){
  if(v==="ship" && ACCESS_ROLE==="qc") return;
  if(v==="quality" && ACCESS_ROLE==="eta") return;
  document.getElementById("menu").hidden = v!=="menu";
  document.getElementById("ship").style.display = v==="ship"?"block":"none";
  document.getElementById("ftr").style.display  = v==="ship"?"block":"none";
  const q=document.getElementById("qview");
  const qb=document.getElementById("qbar");
  if(q)  q.style.display  = v==="quality"?"block":"none";
  if(qb) qb.style.display = v==="quality"?"flex":"none";
  window.scrollTo(0,0);
}

/* ---------- 테마 ---------- */
const THEME_KEY = "oqc_theme";
let THEME = "dark";

function applyTheme(t){
  THEME = (t === "light") ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", THEME);
  const sw = document.getElementById("themesw");
  if(sw) sw.setAttribute("aria-checked", THEME === "light" ? "true" : "false");
  if(tileLayer) tileLayer.setUrl(TILE[THEME]);
  if(typeof repaintCharts === "function") repaintCharts();
  try{ localStorage.setItem(THEME_KEY, THEME); }catch(_){}
}
function initTheme(){
  let saved = null;
  try{ saved = localStorage.getItem(THEME_KEY); }catch(_){}
  applyTheme(saved || "dark");
}

/* ---------- 인증 ---------- */
const AUTH_KEY = "kossan_auth_ts";
const ROLE_KEY = "kossan_role";
const AUTH_TTL_MS = 5*60*1000;
let ACCESS_ROLE = "kossan";
const ROLE_PW = { kossan:"kossan", admin:"admin", eta:"eta", qc:"qc" };

function applyRoleRestrictions(){
  const shipTile  = document.querySelector('.tile[data-go="ship"]');
  const qualTile  = document.querySelector('.tile[data-go="quality"]');
  const updateBtn  = document.getElementById('update-btn');
  const restoreBtn = document.getElementById('restore-btn');
  const backBtn    = document.getElementById('back');
  const qbackBtn   = document.getElementById('qback');
  const restricted = (ACCESS_ROLE === 'eta' || ACCESS_ROLE === 'qc');
  const isAdmin    = (ACCESS_ROLE === 'admin');
  if(ACCESS_ROLE === 'eta' && qualTile) qualTile.style.display = 'none';
  if(ACCESS_ROLE === 'qc'  && shipTile) shipTile.style.display = 'none';
  if(updateBtn)  updateBtn.style.display  = isAdmin ? '' : 'none';
  if(restoreBtn) restoreBtn.style.display = isAdmin ? '' : 'none';
  const sysTab = document.getElementById('tab-system');
  const mobileSysBtn = document.getElementById('mobile-system-btn');
  if(sysTab) sysTab.style.display = isAdmin ? '' : 'none';
  if(mobileSysBtn) mobileSysBtn.hidden = !isAdmin;
  if(backBtn)    backBtn.style.display    = restricted ? 'none' : '';
  if(qbackBtn)   qbackBtn.style.display   = restricted ? 'none' : '';
  const addbar = document.querySelector('.addbar');
  const pobox  = document.getElementById('pobox');
  const showOps = (ACCESS_ROLE === 'admin');
  if(addbar) addbar.style.display = showOps ? '' : 'none';
  if(pobox)  pobox.style.display  = showOps ? '' : 'none';
}

function proceedAfterUnlock(){
  let role = "kossan";
  try{ role = localStorage.getItem(ROLE_KEY) || "kossan"; }catch(_){}
  ACCESS_ROLE = role;
  document.getElementById("gate").remove();
  applyRoleRestrictions();
  const lo = document.getElementById("logout-btn");
  if(lo) lo.hidden = false;
  if(ACCESS_ROLE === "qc"){
    show("quality");
    setTimeout(()=>document.getElementById("qbar").scrollIntoView({block:"start"}),60);
    return;
  }
  if(ACCESS_ROLE === "eta"){
    show("ship");
    setTimeout(()=>{ map&&map.invalidateSize(); document.getElementById('ship').scrollIntoView({block:'start'}); },80);
  } else { show("menu"); }
  setView('map');
  Promise.all([
    loadPO(), loadHistory(),
    fetch(source(),{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).catch(()=>FALLBACK)
  ]).then(([,,data])=>render(data));
}

function unlock(){
  const val = document.getElementById("pw").value.trim();
  const role = Object.keys(ROLE_PW).find(k => ROLE_PW[k] === val);
  if(!role){ document.getElementById("gate-err").textContent="Incorrect password."; return; }
  try{ localStorage.setItem(AUTH_KEY, String(Date.now())); localStorage.setItem(ROLE_KEY, role); }catch(_){}
  proceedAfterUnlock();
}

/* ---------- 이벤트 리스너 ---------- */
document.querySelectorAll(".tile").forEach(t=>t.addEventListener("click",()=>{
  if(t.dataset.go==="quality"){show("quality");setTimeout(()=>document.getElementById("qbar").scrollIntoView({block:"start"}),60);return;}
  show("ship"); setTimeout(()=>{ map&&map.invalidateSize(); document.getElementById('ship').scrollIntoView({block:'start'}); },80);
}));
document.getElementById("back").addEventListener("click",()=>show("menu"));
document.getElementById("ship-title").addEventListener("click",refreshData);
document.getElementById("gate-go").addEventListener("click",unlock);
document.getElementById("pw").addEventListener("keydown",e=>{if(e.key==="Enter")unlock();});
document.getElementById("pw").focus();
document.getElementById("logout-btn").addEventListener("click",()=>{
  try{ localStorage.removeItem(AUTH_KEY); localStorage.removeItem(ROLE_KEY); }catch(_){}
  location.reload();
});
document.getElementById("mobile-system-btn").addEventListener("click",()=>setView('system'));
document.getElementById("posave").addEventListener("click",applyPO);
document.getElementById("poclear").addEventListener("click",clearPO);
document.getElementById("addbtn").addEventListener("click",addBooking);
document.getElementById("newbkg").addEventListener("keydown",e=>{if(e.key==="Enter")addBooking();});
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>setView(t.dataset.view)));
document.querySelectorAll(".ship-tabbar button").forEach(t=>t.addEventListener("click",()=>setView(t.dataset.view)));
document.getElementById("update-btn").addEventListener("click",showChangelog);
document.getElementById("restore-btn").addEventListener("click",showRestoreModal);

document.addEventListener("DOMContentLoaded",()=>{
  initTheme();
  const sw = document.getElementById("themesw");
  if(sw) sw.addEventListener("click", ()=> applyTheme(THEME === "light" ? "dark" : "light"));
  const qb=document.getElementById("qback");
  if(qb) qb.addEventListener("click",()=>show("menu"));
  const qt=document.getElementById("q-title");
  if(qt) qt.addEventListener("click",()=>{ if(typeof repaintCharts==="function") repaintCharts(); window.scrollTo(0,0); });
});

(function tryAutoUnlock(){
  let ts = null;
  try{ ts = parseInt(localStorage.getItem(AUTH_KEY)||"0",10); }catch(_){}
  if(ts && (Date.now()-ts) < AUTH_TTL_MS){ proceedAfterUnlock(); }
})();
