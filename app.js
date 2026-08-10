/* Quality analysis 대시보드 — 기존 index.html을 quality.html로 이름만 바꿔 두면 됩니다.
   상대경로라 저장소 이름이 바뀌어도 깨지지 않습니다. */
const QUALITY_URL = "quality.html";

/* Worker 배포  주소를 채우면 [갱신하기]가 실h 수집분을 읽습니다. */
const API = "https://kossan-oqc.dhoqc.workers.dev/data";
const source = () => API || "shipments.json";

/* ============ HMM trackMap 실측 데이터 (조회 2026-08-03 10:12) ============
   route  : HMM이 준 Port call 좌표 [lat, lng]
   names  : Port call명
   idx    : Current position한 구간 번호 (route[idx] → route[idx+1])
   ratio  : 그 구간 내 진행 비율
   ======================================================================== */
const FALLBACK = {
  updated:"2026-08-03 10:12",
  shipments:[
    { booking:"KULM68088700", vessel:"CONTI CONQUEST", voyage:"0036E", svc:"PS3",
      feeder:"HMM MONGLA 0033N", imo:9293818,
      polDep:"2026-07-06T00:56", tsArr:"2026-07-07T23:13", tsDep:"2026-07-14T11:28", eta:"2026-08-08T07:00",
      names:["PORT KLANG","SINGAPORE","BA RIA VUNG TAU","YANTIAN","LOS ANGELES"],
      route:[[2.9372384,101.3007552],[1.2511247,103.7272898],[10.5372748,107.0315867],
             [22.5703753,114.2596394],[33.76478926,-118.2680205]],
      idx:3, ratio:0.6826,
      pos:["FNG031006 (Container 2 of 18)","FNG031006 (Container 3 of 18)","FNG031006 (Container 4 of 18)","FNG031006 (Container 5 of 18)","FNG031006 (Container 6 of 18)","FNG031006 (Container 7 of 18)","FNG031006 (Container 8 of 18)","FNG031006 (Container 9 of 18)","FNG031006 (Container 10 of 18)","FNG031006 (Container 11 of 18)","FNG031006 (Container 12 of 18)","FNG031006 (Container 13 of 18)","FNG031006 (Container 14 of 18)","FNG031006 (Container 15 of 18)"], poEta:"2026-08-09",
      last:"Jul 14 departed Singapore · Jul 22 departed Yantian" },

    { booking:"KULM75953600", vessel:"HYUNDAI PLUTO", voyage:"0047E", svc:"PS3",
      feeder:"HR RHEA 0110N", imo:9725160,
      polDep:"2026-07-22T20:30", tsArr:"2026-07-26T02:53", tsDep:"2026-07-29T06:59", eta:"2026-08-24T07:00",
      names:["PORT KLANG","SINGAPORE","BA RIA VUNG TAU","YANTIAN","LOS ANGELES"],
      route:[[2.9372384,101.3007552],[1.2511247,103.7272898],[10.5372748,107.0315867],
             [22.5703753,114.2596394],[33.76478926,-118.2680205]],
      idx:2, ratio:0.2374,
      pos:["FNG031006 (Container 16 of 18)","FNG031006 (Container 17 of 18)","FNG031006 (Container 18 of 18)","FNG031007 (Container 1 of 18)","FNG031007 (Container 2 of 18)","FNG031007 (Container 3 of 18)","FNG031007 (Container 4 of 18)","FNG031007 (Container 5 of 18)","FNG031007 (Container 6 of 18)","FNG031007 (Container 7 of 18)","FNG031007 (Container 8 of 18)","FNG031007 (Container 9 of 18)","FNG031007 (Container 10 of 18)","FNG031007 (Container 11 of 18)"], poEta:"2026-08-16",
      last:"Jul 29 departed Singapore · Cai Mep → Yantian leg" },

    { booking:"KULM40326600", vessel:"HANS SCHULTE", voyage:"0001E", svc:"PS5",
      feeder:"HR HERA 0110N", imo:9531909,
      polDep:"2026-07-29T12:00", tsArr:"2026-07-31T11:03", tsDep:"2026-08-07T09:30", eta:"2026-08-26T17:00",
      names:["PORT KLANG","SINGAPORE","BA RIA VUNG TAU","LOS ANGELES"],
      route:[[2.9372384,101.3007552],[1.2511247,103.7272898],[10.5372748,107.0315867],
             [33.76478926,-118.2680205]],
      idx:1, ratio:0,
      pos:["FNG031007 (Container 12 of 18)","FNG031007 (Container 13 of 18)","FNG031007 (Container 14 of 18)","FNG031007 (Container 15 of 18)","FNG031007 (Container 16 of 18)","FNG031007 (Container 17 of 18)","FNG031007 (Container 18 of 18)","FNG031008 (Container 1 of 15)","FNG031008 (Container 2 of 15)","FNG031008 (Container 3 of 15)","FNG031008 (Container 4 of 15)","FNG031008 (Container 5 of 15)","FNG031008 (Container 6 of 15)","FNG031008 (Container 7 of 15)"], poEta:"2026-08-23",
      poNote:"Source lists two ETAs for this lot (23-Aug and 27-Aug). The earlier date is shown.",
      last:"Jul 31 feeder discharged at Singapore · awaiting mother vessel" },

    { booking:"KULM85176300", vessel:"HMM JAKARTA", voyage:"0145E", svc:"PS5",
      feeder:"HR HERA 0110N", imo:9323522,
      polDep:"2026-07-29T12:00", tsArr:"2026-07-31T11:11", tsDep:"2026-08-08T03:00", eta:"2026-09-01T04:30",
      names:["PORT KLANG","SINGAPORE","BA RIA VUNG TAU","HAI PHONG","LOS ANGELES"],
      route:[[2.9372384,101.3007552],[1.2511247,103.7272898],[10.5372748,107.0315867],
             [20.796246,106.9065732],[33.76478926,-118.2680205]],
      idx:1, ratio:0,
      pos:["FNG031008 (Container 8 of 15)","FNG031008 (Container 9 of 15)","FNG031008 (Container 10 of 15)","FNG031008 (Container 11 of 15)","FNG031008 (Container 12 of 15)","FNG031008 (Container 13 of 15)","FNG031008 (Container 14 of 15)","FNG031008 (Container 15 of 15)","FNG031009 (Container 1 of 15)","FNG031009 (Container 2 of 15)","FNG031009 (Container 3 of 15)","FNG031009 (Container 4 of 15)","FNG031009 (Container 5 of 15)","FNG031009 (Container 6 of 15)"], poEta:"2026-09-03",
      last:"Jul 31 feeder discharged at Singapore · awaiting mother vessel" },

    { booking:"KULM72444200", vessel:"YM MODERATION", voyage:"0084E", svc:"PS5",
      feeder:"NZ SUZHOU 0015N", imo:9664897,
      polDep:"2026-08-02T12:00", tsArr:"2026-08-04T04:45", tsDep:"2026-08-19T15:30", eta:"2026-09-13T17:00",
      names:["PORT KLANG","SINGAPORE","BA RIA VUNG TAU","HAI PHONG","LOS ANGELES"],
      route:[[2.9372384,101.3007552],[1.2511247,103.7272898],[10.5372748,107.0315867],
             [20.796246,106.9065732],[33.76478926,-118.2680205]],
      idx:0, ratio:0,
      pos:["FNG031009 (Container 7 of 15)","FNG031009 (Container 8 of 15)","FNG031009 (Container 9 of 15)","FNG031009 (Container 10 of 15)","FNG031009 (Container 11 of 15)","FNG031009 (Container 12 of 15)","FNG031009 (Container 13 of 15)","FNG031009 (Container 14 of 15)","FNG031009 (Container 15 of 15)","FNG031010 (Container 1 of 15)","FNG031010 (Container 2 of 15)","FNG031010 (Container 3 of 15)","FNG031010 (Container 4 of 15)","FNG031010 (Container 5 of 15)"], poEta:"2026-09-06",
      poNote:"These 14 containers are split across 3 feeder/mother combinations (ONE PREMIUM 0093E \u00d72, YM MODERATION 0084E). The per-container split is not specified in the source.",
      last:"Aug 2 feeder loaded at Port Klang · Singapore ETA Aug 4" },

    { booking:"KULM92606700", vessel:"HYUNDAI TOKYO", voyage:"0164E", svc:"PS5",
      feeder:"HR RHEA 0109N", imo:null,
      polDep:"2026-07-03T12:00", tsArr:"2026-07-05T18:36", tsDep:"2026-07-18T21:45", eta:"2026-08-13T04:00",
      names:["PORT KLANG","SINGAPORE","SINGAPORE","BA RIA VUNG TAU","HAI PHONG","LOS ANGELES"],
      route:[[2.9372384,101.3007552],[1.2511247,103.7272898],[1.3115724,103.7188794],
             [10.5372748,107.0315867],[20.796246,106.9065732],[33.76478926,-118.2680205]],
      idx:4, ratio:0.4205,
      pos:["FNG031005 (Container 6 of 18)","FNG031005 (Container 7 of 18)","FNG031005 (Container 8 of 18)","FNG031005 (Container 9 of 18)","FNG031005 (Container 10 of 18)","FNG031005 (Container 11 of 18)","FNG031005 (Container 12 of 18)","FNG031005 (Container 13 of 18)","FNG031005 (Container 14 of 18)","FNG031005 (Container 15 of 18)","FNG031005 (Container 16 of 18)","FNG031005 (Container 17 of 18)","FNG031005 (Container 18 of 18)","FNG031006 (Container 1 of 18)"], poEta:"2026-08-02",
      last:"Jul 18 departed Singapore · Hai Phong → LA leg" }
  ]
};

/* ---------- 항구명 정규화 ----------
   Worker의 names는 "PORT KLANG,MALAYSIA"처럼 국가가 붙고, 지도 좌표를
   승계한 건은 "P1","P2"로 폴백되어 있다. legs에서 실제 항구명을 만들어 보완한다. */
const shortPort = n => !n ? "" : String(n).split(",")[0].replace(/\s+/g," ").trim().toUpperCase();

function portNames(s){
  const raw  = Array.isArray(s.names) ? s.names : [];
  const need = Array.isArray(s.route) ? s.route.length : raw.length;
  const real = raw.filter(n=>n && !/^P\d+$/.test(n));

  /* 지도에서 실제 항구명을 받은 경우 — 기항지를 그대로 쓴다 */
  if(real.length === need) return raw.map(shortPort);

  /* 지도 좌표만 승계되어 이름이 P1..Pn으로 폴백된 경우.
     legs로 알 수 있는 건 출발지와 최종 양하항뿐이므로 그 둘만 채우고,
     중간 기항지는 개수를 유지한 채 순번으로 남긴다 (임의로 합치거나 늘리지 않는다). */
  const legs = Array.isArray(s.legs) ? s.legs : [];
  const first = legs.length ? shortPort(legs[0].pol) : (raw[0] ? shortPort(raw[0]) : "");
  const lastN = legs.length ? shortPort(legs[legs.length-1].pod) : (raw[need-1] ? shortPort(raw[need-1]) : "");
  const out = [];
  for(let i=0;i<need;i++){
    if(i===0 && first) out.push(first);
    else if(i===need-1 && lastN) out.push(lastN);
    else out.push(raw[i] ? shortPort(raw[i]) : ("P"+(i+1)));
  }
  return out;
}

/* 연속 중복 항구(같은 항 내 선석 이동 등)는 라벨을 비워 겹침을 막는다 */
const dedupeLabels = names => names.map((n,i)=> i>0 && n===names[i-1] ? "" : n);


/* ---------- 진행바(rail) ----------
   지도 좌표(route)는 베트남/중국 경유까지 포함한 기항지라 실제 기항 항구 수와 다르다.
   진행바는 legs(선적항 → T/S → 양하항)로만 그리고, 위치는 일정 시각으로 보간한다. */
function railInfo(s){
  const legs = Array.isArray(s.legs) ? s.legs : [];
  if(!legs.length) return null;

  /* 노드: [선적항, (T/S…), 양하항] — 각 노드에 도착/출발 시각을 붙인다 */
  const nodes = [{ name: shortPort(legs[0].pol), arr: null, dep: legs[0].etd }];
  legs.forEach((l,i)=>{
    nodes.push({ name: shortPort(l.pod), arr: l.eta, dep: legs[i+1] ? legs[i+1].etd : null });
  });

  /* 같은 항구가 연달아 나오면(같은 항 내 선석 이동 등) 하나로 합친다 */
  const merged = [];
  nodes.forEach(n=>{
    const prev = merged[merged.length-1];
    if(prev && prev.name === n.name){ prev.dep = n.dep || prev.dep; prev.arr = prev.arr || n.arr; }
    else merged.push({...n});
  });
  if(merged.length < 2) return null;

  const now = Date.now();
  const T = v => v ? new Date(v+"Z").getTime() : null;
  const last = merged.length-1;

  let i = 0, f = 0, atPort = true;
  for(let k=0;k<merged.length;k++){
    const dep = T(merged[k].dep), nextArr = T(merged[k+1] && merged[k+1].arr);
    const arr = T(merged[k].arr);
    if(arr && now < arr){ i = Math.max(0,k-1); f = 1; atPort = true; break; }   // 아직 도착 전
    if(dep && now < dep){ i = k; f = 0; atPort = true; break; }                  // 정박 중
    if(dep && nextArr && now >= dep && now < nextArr){                           // 항해 중
      i = k; f = Math.min(1,(now-dep)/(nextArr-dep)); atPort = false; break;
    }
    i = k; f = 0; atPort = true;
  }
  if(i >= last){ i = last-1; f = 1; atPort = true; }

  const names = merged.map(n=>n.name);
  return {
    nodes: merged, names, i, f, atPort,
    pct: (i + f) / last,
    phase: atPort ? `${names[Math.min(i + (f>=1?1:0), last)]} — berthed`
                  : `${names[i]} → ${names[i+1]}`
  };
}


/* ---------- 항구 좌표 ----------
   선적 전 부킹은 HMM이 지도 좌표를 주지 않는다. 다른 화물에서 이미 받은 좌표를
   항구명으로 모아두고, 그걸로 예정 항로를 합성해 지도에 표시한다. */
const PORT_FALLBACK = {
  "PORT KLANG":[2.9372384,101.3007552], "SINGAPORE":[1.2511247,103.7272898],
  "LOS ANGELES":[33.76478926,-118.2680205], "BA RIA VUNG TAU":[10.5372748,107.0315867],
  "HAI PHONG":[20.796246,106.9065732], "YANTIAN":[22.5703753,114.2596394]
};
let PORTXY = {};
function buildPortIndex(list){
  PORTXY = {...PORT_FALLBACK};
  (list||[]).forEach(s=>{
    if(!Array.isArray(s.route) || !Array.isArray(s.names)) return;
    s.names.forEach((n,i)=>{
      const k = shortPort(n);
      if(k && !/^P\d+$/.test(k) && s.route[i]) PORTXY[k] = s.route[i];
    });
  });
}

/* legs의 기항 항구로 예정 항로를 만든다. 좌표를 모르는 항구가 있으면 포기한다. */
function synthRoute(s){
  if(Array.isArray(s.route) && s.route.length>=2) return false;
  const legs = Array.isArray(s.legs) ? s.legs : [];
  if(!legs.length) return false;

  const names = [shortPort(legs[0].pol)];
  legs.forEach(l=> names.push(shortPort(l.pod)));
  const merged=[], route=[];
  for(const n of names){
    if(merged.length && merged[merged.length-1]===n) continue;
    const xy = PORTXY[n];
    if(!xy) return false;
    merged.push(n); route.push(xy);
  }
  if(route.length<2) return false;

  /* 예정 시각으로 현재 위치를 잡는다 (아직 안 떠났으면 출발항) */
  const T = v => v ? new Date(v+"Z").getTime() : null;
  const now = Date.now();
  let idx=0, ratio=0;
  for(let k=0;k<legs.length;k++){
    const dep=T(legs[k].etd), arr=T(legs[k].eta);
    if(dep && arr && now>=dep && now<arr){ idx=k; ratio=Math.min(1,(now-dep)/(arr-dep)); break; }
    if(arr && now>=arr) idx=Math.min(k+1, route.length-2);
  }
  s.route=route; s.names=merged; s.idx=idx; s.ratio=ratio; s.routeSynth=true;
  return true;
}

/* ---------- 좌표 유틸 ---------- */
const wrap = p => [p[0], p[1] < -30 ? p[1] + 360 : p[1]];   // 태평양 연속 표시
const unwrap = l => ((l + 180) % 360) - 180;

/* HMM이 준 idx/ratio를 그대로 적용 */
function locate(s){
  /* 지도 조회에 실패한 건(mapError)은 route가 없다 — 화면이 죽지 않도록 null 반환 */
  if(!Array.isArray(s.route) || s.route.length < 2) return null;
  const nm = portNames(s);
  const r = s.route.map(wrap);
  /* HMM은 위치를 못 잡으면 currentRouteIndex 를 -1 로 주기도 한다.
     범위를 벗어난 값이 들어오면 좌표 참조에서 터지므로 반드시 보정한다. */
  const idx = Number.isFinite(s.idx) ? s.idx : 0;
  const i = Math.max(0, Math.min(idx, r.length - 2));
  const f = Number.isFinite(s.ratio) ? Math.max(0, Math.min(1, s.ratio)) : 0;
  const a = r[i], b = r[i+1];
  if(!a || !b) return null;
  const pos = [a[0] + (b[0]-a[0])*f, a[1] + (b[1]-a[1])*f];

  const atPort = f < 0.01;
  const done = i + f, total = Math.max(1, r.length - 1);
  return {
    pos, i, f,
    names: nm,
    from: nm[i], to: nm[i+1],
    phase: atPort ? `${nm[i]} — berthed` : `${nm[i]} → ${nm[i+1]}`,
    atPort,
    pct: done / total
  };
}

/* ---------- 정렬 · 만료 ---------- */
/* 값이 없거나 형식이 어긋나면 NaN이 되어 정렬이 무너지므로 null로 정규화한다 */
const TS = s => { const t = s ? new Date(String(s).replace(" ","T")+"Z").getTime() : NaN;
                  return Number.isFinite(t) ? t : null; };
const DAY = 86400000;

/* ETA 확정  7일이 지난 은 LIST에서 제외 */
function prune(list){
  const now=Date.now();
  return list.filter(s=>{ const t=TS(s.eta); return t===null ? true : now < t + 7*DAY; });
}
/* 포트클랑 ETD 빠른 순 */
/* 포트클랑 ETD 빠른 순. ETD가 없으면 ETB로, 그것도 없으면 맨 뒤로 보낸다. */
function sortByETD(list){
  const key = s => TS(s.polDep) ?? TS(s.eta) ?? Infinity;
  return [...list].sort((a,b)=>{
    const d = key(a) - key(b);
    return d || String(a.booking).localeCompare(String(b.booking));
  });
}

/* 직항(피더 없음) 화물은 tsArr/tsDep가 null이므로 방어한다 */
const MON3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const monAbbr = mm => MON3[parseInt(mm,10)-1] || mm;
const fmtDT = s => !s ? "—" : monAbbr(s.slice(5,7))+"/"+s.slice(8,10)+" "+s.slice(11,16);
const fmtD  = s => !s ? "—" : monAbbr(s.slice(5,7))+"/"+s.slice(8,10);

/* ---------- MAP ---------- */
let map, markers=[];
function initMap(data){
  /* render()가 여러 번 불릴 수 있다 — 기존 지도를 먼저 파기하지 않으면
     Leaflet이 "Map container is already initialized"로 실패한다. */
  if(map){
    try{ map.remove(); }catch(_){}
    map = null; tileLayer = null;
  }
  markers = [];
  map = L.map('map',{worldCopyJump:false,minZoom:2}).setView([25,175],3);
  tileLayer = L.tileLayer(TILE[THEME],
    {attribution:'&copy; OpenStreetMap &copy; CARTO', subdomains:'abcd', maxZoom:10}).addTo(map);

  const portSeen = {};
  data.shipments.forEach(s=>{
    if(!Array.isArray(s.route) || s.route.length<2){ markers.push(null); return; }
    const r = s.route.map(wrap);
    L.polyline(r,{color:'#1E3A4C',weight:s.routeSynth?1:1.5,
      dashArray:s.routeSynth?'2,8':'4,6',opacity:s.routeSynth?.7:1}).addTo(map);
    r.forEach((p,k)=>{
      const key = p[0].toFixed(2)+","+p[1].toFixed(2);
      if(portSeen[key]) return; portSeen[key]=1;
      L.circleMarker(p,{radius:4,color:cssVar('--fog','#8AA4B5'),weight:1.5,
                        fillColor:cssVar('--ink','#07141C'),fillOpacity:1})
        .bindTooltip(s.names[k],{className:'vsl-tip',direction:'top'}).addTo(map);
    });
  });

  const seen={};
  data.shipments.forEach((s,idx)=>{
    const L2 = locate(s);
    let [lat,lng] = L2.pos;
    const key = lat.toFixed(1)+","+lng.toFixed(1);
    seen[key]=(seen[key]||0)+1;
    if(seen[key]>1){ lat += 0.9*(seen[key]-1); lng += 1.4*(seen[key]-1); }
    const m = L.circleMarker([lat,lng],{radius:8,color:cssVar('--buoy','#FF6B35'),weight:2,
      fillColor:'#FF6B35',fillOpacity:L2.atPort?1:0.45}).addTo(map);
    m.bindTooltip(`${s.vessel} ${s.voyage}`,{className:'vsl-tip',direction:'top',offset:[0,-6]});
    m.on('click',()=>{ select(s,idx,false); showPO(s,idx); });
    markers.push(m);
  });
  map.fitBounds(L.featureGroup(markers).getBounds().pad(0.35));
}

/* ---------- 원 스케줄 병기 ---------- */
/* HIST에서 해당 필드의 최초 관측값. 변경 이력이 있으면 가장 오래된 변경의 from,
   없으면 first 기록의 값. eta는 이력이 없을 때 MAPPING의 POETA로 대체. */
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
/* 날짜만 있는 값(POETA)도 안전하게 표기 */
const fmtAny = v => !v ? "\u2014"
  : /[T ]\d\d:/.test(String(v)) ? fmtDT(v) : monAbbr(String(v).slice(5,7))+"/"+String(v).slice(8,10);
const tsLoose = v => { const a = TS(v); return a !== null ? a : (v ? TS(v + "T00:00:00") : null); };

/* 날짜 한 칸 — 이벤트 기반 actual 플래그 우선, 없으면 시간 경과로 fallback.
   worker.js가 computeActualFlags()로 polDepActual/tsArrActual/tsDepActual/etaActual을 붙여주면
   그걸 신뢰하고, 구버전 데이터(플래그 없음)일 때만 시간 경과로 판단한다. */
const ACTUAL_FLAG = { polDep:"polDepActual", tsArr:"tsArrActual", tsDep:"tsDepActual", eta:"etaActual" };
function dtCell(s, field){
  const cur = s[field], t = TS(cur);
  if(t === null) return fmtDT(cur);
  const flagKey = ACTUAL_FLAG[field];
  const done = flagKey && s[flagKey] !== undefined
    ? !!s[flagKey]            // 이벤트 기반 (신뢰)
    : t <= Date.now();        // fallback: 시간 경과 (구버전 데이터)
  const orig  = origOf(s.booking, field);
  const ot    = tsLoose(orig);
  const moved = ot !== null && ot !== t;
  const dd    = moved ? Math.round((t - ot) / DAY * 10) / 10 : 0;
  const ddStr = dd.toFixed(1);
  return `${fmtDT(cur)}<span class="sest">${done ? "actual" : "scheduled"}</span>`
       + (moved ? `<span class="sorig">(orig ${fmtAny(orig)}${
           dd ? ` <b class="${dd > 0 ? "warn" : ""}">${dd > 0 ? "+" : ""}${ddStr}d</b>` : ""})</span>` : "");
}

function showSide(s,L2){
  const nm = portNames(s);
  const geo = L2
    ? `<dt>STATUS</dt><dd>${L2.phase}</dd>
       <dt>SEGMENT</dt><dd>${L2.i+1} / ${s.route.length-1} · ${(L2.f*100).toFixed(1)}%</dd>
       <dt>POSITION</dt><dd>${L2.pos[0].toFixed(3)}° , ${unwrap(L2.pos[1]).toFixed(3)}°</dd>`
    : `<dt>STATUS</dt><dd class="warn">Position unavailable — HMM map lookup failed</dd>`;
  const synthNote = s.routeSynth
    ? `<dt>ROUTE SOURCE</dt><dd class="dim">Estimated from booked schedule (HMM map not issued yet)</dd>` : "";

  /* PO 매핑은 붙여넣기로 등록된 로컬 데이터 */
  const po = poSummary(s.booking);
  const poRow = po ? `<dt>PO / LOT</dt><dd>${po}</dd>` : "";
  const d = poDelay(s);
  const dRow = d ? `<dt>VS PLAN</dt><dd>${delayHTML(s)} <span class="dim">(original ${d.orig})</span></dd>` : "";
  const rRow = s.rollover
    ? `<dt>ROLLOVER</dt><dd class="warn">Not loaded on ${s.vessel} ${s.voyage} — ${s.rolloverDays||0}d past ETD</dd>` : "";

  /* 스케줄 변경 이력 — tsDep(SIN ETD)이 밀리는지 추적하는 용도 */
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

  /* 최근 이벤트 타임라인 */
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

/* ---------- 표 ---------- */
const SIGNAL_DAYS = 5;   /* 느낌표 표시 유지 기간 — SIGNAL_DAYS를 쓰는 GAP_REMARK보다 먼저 선언해야 한다 */
const GAP_REMARK = `<p class="gapremark">The <b>!</b> mark appears when the LA ETB has moved
  against the original plan, and disappears automatically ${SIGNAL_DAYS} days after the change was
  detected. Click the number box at any time to see the full change log.</p>`;

function buildTable(data){
  document.getElementById('vtbody').innerHTML = rowsHTML(data.shipments);
  document.getElementById('otbody').innerHTML = rowsHTML(data.shipments);
  ["vremark","oremark"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.innerHTML = GAP_REMARK;
  });
  /* 편차 배지·느낌표 클릭 → ETB 변동 로그 (노란 본선교체 느낌표는 별도 로그) */
  document.querySelectorAll('.gapbox,.gapbang:not(.vsl-bang)').forEach(el=>{
    el.addEventListener('click', ev=>{
      ev.stopPropagation();
      showGapLog(el.dataset.b);
    });
  });
  document.querySelectorAll('.gapbang.vsl-bang').forEach(el=>{
    el.addEventListener('click', ev=>{
      ev.stopPropagation();
      showVesselLog(el.dataset.b);
    });
  });
  const hook = (sel, jump) => document.querySelectorAll(sel).forEach(tr=>
    tr.addEventListener('click',()=>{
      const i=+tr.dataset.i, s=data.shipments[i];
      if(jump) setView('map');
      document.querySelectorAll('#vtbody tr,#otbody tr').forEach(t=>t.classList.toggle('on',+t.dataset.i===i));
      select(s,i,true);
      showPO(s,i);
    }));
  hook('#vtbody tr', false);
  hook('#otbody tr', true);
}

/* ---------- LIST 카드 ---------- */
function cardHTML(s){
  const L2 = locate(s);
  const pre = s.preShipment ? `<span class="dtag pre">NOT SHIPPED</span>` : "";
  const stale = s.staleItem ? `<span class="tag t-stale" title="This item's last lookup failed; the previous value is shown">STALE</span>` : "";

  let railHTML;
  if(!L2){
    railHTML = `<p class="note warn">Position unavailable — HMM map lookup failed. Schedule below is current.</p>`;
  }else{
    const nm = dedupeLabels(L2.names);      // 연속 중복 항구만 라벨 생략
    const n = L2.names.length-1;
    let nodes="";
    nm.forEach((label,k)=>{
      const x = k/n*100;
      const c = k===n ? "node end" : (k <= L2.i ? "node on" : "node");
      nodes += `<div class="${c}" style="left:${x}%"></div>`
             + (label?`<div class="node-lb" style="left:${x}%">${label}</div>`:"");
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

/* ---------- 갱신 ---------- */
let CUR=null;
function ago(ts){
  /* Worker는 UTC로 "2026-08-03 23:13Z"를 준다. Z가 있으면 UTC, 없으면 KST로 해석 */
  const t = ts.trim().replace(" ","T");
  const iso = /Z$/i.test(t) ? t : t+"+09:00";
  const m=Math.round((Date.now()-new Date(iso).getTime())/60000);
  return m<60 ? m+"m ago" : m<1440 ? Math.round(m/60)+"h ago" : Math.round(m/1440)+"d ago";
}
/* 자동 수집 시각 (한국시간) — Worker의 Cron과 일치시켜야 합니다 */
const CRON_KST = [8.1667, 14.1667, 20.1667];   // 08:10 / 14:10 / 20:10
/* 화면에 표시할 수집 주기 문구 (Worker의 Cron 설정과 일치시켜야 합니다) */
const CRON_LABEL = "08:10 / 14:10 / 20:10 KST";
const hhmm = f => String(Math.floor(f)).padStart(2,"0")+":"+String(Math.round((f%1)*60)).padStart(2,"0");

function nextRun(){
  const now=new Date();
  const kst=new Date(now.getTime()+(now.getTimezoneOffset()*60000)+9*3600000);
  const h=kst.getHours()+kst.getMinutes()/60;
  let wait=null;
  for(const c of CRON_KST){ if(c>h){ wait=(c-h)*3600000; break; } }
  if(wait===null) wait=(24-h+CRON_KST[0])*3600000;
  const m=Math.round(wait/60000);
  return m<60 ? m+"m" : Math.floor(m/60)+"h "+(m%60?m%60+"m ":"")+"";
}
/* "2026-08-03 23:13Z"(UTC) → "08-04 08:13 KST" */
function toKST(ts){
  if(!ts) return "—";
  const t = String(ts).trim().replace(" ","T");
  const d = new Date(/Z$/i.test(t) ? t : t+"+09:00");
  if(isNaN(d)) return ts;
  const k = new Date(d.getTime() + 9*3600000);
  const p = n => String(n).padStart(2,"0");
  return `${p(k.getUTCMonth()+1)}-${p(k.getUTCDate())} ${p(k.getUTCHours())}:${p(k.getUTCMinutes())} KST`;
}

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

/* ---------- 종합 도표 (전 선적 한 화면) ---------- */
function buildOverview(list){
  const rows = list.map((s,i)=>({s,L:locate(s),i})).filter(r=>r.L);
  const active = rows.filter(r=>r.L.pct>0 && r.L.pct<1);

  // 라벨 겹침 방지: 진행률 순으로 정렬해 3단 높이를 번갈아 배치
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
        <div class="dot"></div>
      </div>`;
  }).join("");

  document.getElementById("overview").innerHTML=`
    <h2>ALL SHIPMENTS · PORT KLANG → LOS ANGELES</h2>
    <div class="sub">In transit ${active.length} of ${list.length} · by port-call segment${rows.length<list.length?` · ${list.length-rows.length} without position`:""}</div>
    <div class="orail">
      <div class="base"></div>
      <div class="cap" style="left:0"></div><div class="cap-lb" style="left:0">PORT KLANG</div>
      <div class="cap" style="left:100%"></div><div class="cap-lb" style="left:100%">LOS ANGELES</div>
      ${marks}
    </div>`;

  document.querySelectorAll("#overview .ov").forEach(el=>{
    el.addEventListener("click",()=>{
      const i=list.findIndex(s=>s.booking===el.dataset.b);
      setView('map'); select(list[i],i,true);
    });
  });
}


/* ---------- ETB 변동 로그 ----------
   /history 에 쌓인 스케줄 변경 중 LA ETB(eta) 가 바뀐 것만 뽑아
   원 스케줄 대비 편차가 며칠에서 며칠로 옮겨갔는지로 환산한다. */
function etaChangeLog(booking){
  const plan = POETA[booking] || null;
  const log = (HIST[booking]||[]).filter(e => Array.isArray(e.changes)
    && e.changes.some(c => c.field === "eta"));
  const gapOf = v => {
    if(!plan || !v) return null;
    return Math.round((new Date(v.slice(0,10)) - new Date(plan))/86400000);
  };
  return log.map(e=>{
    const c = e.changes.find(x=>x.field==="eta");
    return { at:e.at, from:c.from, to:c.to, gapFrom:gapOf(c.from), gapTo:gapOf(c.to) };
  }).reverse();          // 최신순
}

/* 마지막 변동이 SIGNAL_DAYS 이내인지 */
function etaChangedRecently(booking){
  const log = etaChangeLog(booking);
  if(!log.length) return false;
  const t = Date.parse(String(log[0].at).replace(" ","T").replace("Z","")+"Z");
  if(!Number.isFinite(t)) return false;
  return (Date.now() - t) < SIGNAL_DAYS*86400000;
}

/* ---------- 본선 교체 로그 ----------
   /history 에서 vessel(본선) 변경 항목만 뽑는다. 항차도 같이 바뀌었으면 같이 표시.
   T/S 지연 원인 분석용 — ETA 변경과 별개로, 본선 자체가 바뀌었는지를 구분해서 보여준다. */
function vesselChangeLog(booking){
  const log = (HIST[booking]||[]).filter(e => Array.isArray(e.changes)
    && e.changes.some(c => c.field === "vessel"));
  return log.map(e=>{
    const v = e.changes.find(x=>x.field==="vessel");
    const y = e.changes.find(x=>x.field==="voyage");
    return { at:e.at, vFrom:v.from, vTo:v.to, yFrom:y?y.from:null, yTo:y?y.to:null };
  }).reverse(); // 최신순
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
    ? log.map(e=>`<tr>
        <td>${toKST(e.at)}</td>
        <td>${e.vFrom} → <b>${e.vTo}</b>${e.yTo?` (${e.yFrom||"—"} → ${e.yTo})`:""}</td></tr>`).join("")
    : `<tr><td colspan="2" class="dim">No vessel change recorded for this booking.</td></tr>`;
  box.innerHTML = `<div class="gl-in">
      <div class="gl-h"><b>${booking}</b> — Vessel change log
        <button class="gl-x" aria-label="close">✕</button></div>
      <table><thead><tr><th>DETECTED</th><th>VESSEL / VOYAGE</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <p class="gl-n">Detected at each scheduled collection.</p>
    </div>`;
  box.hidden = false;
  box.querySelector(".gl-x").addEventListener("click",()=>{ box.hidden = true; });
  box.addEventListener("click",e=>{ if(e.target===box) box.hidden=true; },{once:true});
}

function showGapLog(booking){
  const log = etaChangeLog(booking);
  const box = document.getElementById("gaplog");
  if(!box) return;
  const rows = log.length
    ? log.map(e=>`<tr>
        <td>${toKST(e.at)}</td>
        <td>${fmtDT(e.from)} → <b>${fmtDT(e.to)}</b></td>
        <td class="${(e.gapTo??0) > (e.gapFrom??0) ? "worse":"better"}">
          ${e.gapFrom===null?"—":(e.gapFrom>0?"+":"")+e.gapFrom+"d"} →
          ${e.gapTo===null?"—":(e.gapTo>0?"+":"")+e.gapTo+"d"}</td></tr>`).join("")
    : `<tr><td colspan="3" class="dim">No ETB change recorded for this booking.</td></tr>`;
  box.innerHTML = `<div class="gl-in">
      <div class="gl-h"><b>${booking}</b> — LA ETB change log
        <button class="gl-x" aria-label="close">✕</button></div>
      <table><thead><tr><th>DETECTED</th><th>LA ETB</th><th>VS PLAN</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <p class="gl-n">Original plan ${POETA[booking]||"—"} · detected at each scheduled collection.</p>
    </div>`;
  box.hidden = false;
  box.querySelector(".gl-x").addEventListener("click",()=>{ box.hidden = true; });
  box.addEventListener("click",e=>{ if(e.target===box) box.hidden=true; },{once:true});
}

/* 원 스케줄 대비 편차를 작은 사각 배지로. 색 구간은 요청 기준:
   빠름(음수) 초록 / 1~3일 흰색 / 4~6일 노랑 / 7일 이상 빨강 */
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

/* 표 HTML (MAP 아래 / LIST 상단 공용) */
function rowsHTML(list){
  const now=Date.now();
  const actTag = (actual, fallbackT) => {
    const isActual = actual !== undefined ? !!actual : (fallbackT !== null && fallbackT <= now);
    return isActual ? "actual" : "scheduled";
  };
  return list.map((s,i)=>{
    const etaActTag = s.etaActual !== undefined ? (s.etaActual?"actual":"scheduled")
      : (TS(s.eta)!==null && TS(s.eta)<=now ? "actual" : "scheduled");
    const destActTag = s.destEta
      ? (s.etaActual !== undefined ? (s.etaActual?"actual":"scheduled")
          : (TS(s.destEta)!==null && TS(s.destEta)<=now ? "actual" : "scheduled"))
      : "";
    return `
    <tr data-i="${i}">
      <td><span class="nm">${s.vessel}</span><span class="vy">${s.voyage}</span>
          <span class="bk">${s.booking} · ${s.cntrQty||"—"} CNTR${s.staleItem?" · STALE":""}</span></td>
      <td data-l="PKG ETD"><span class="dt">${fmtDT(s.polDep)}</span><span class="est">${actTag(s.polDepActual,TS(s.polDep))}</span></td>
      <td data-l="SIN ETD"><span class="dt">${fmtDT(s.tsDep)}</span><span class="est">${actTag(s.tsDepActual,TS(s.tsDep))}</span></td>
      <td data-l="LA ETB / DEST ETA">
        <div><span class="eta-lbl">ETB</span><span class="dt">${fmtDT(s.eta)}</span>${gapBox(s)}<span class="est">${etaActTag}</span></div>
        ${s.destEta?`<div style="margin-top:3px"><span class="eta-lbl">ETA</span><span class="dt">${fmtDT(s.destEta)}</span><span class="est">${destActTag}</span></div>`:""}
      </td>
    </tr>`;
  }).join("");
}

/* ---------- 부킹 추가 ---------- */
/* 부킹 추가 — HMM의 산발적 520은 재시도로 흡수한다.
   520/5xx 계열만 자동 재시도하고, 형식 오류나 "조회 결과 없음"은 즉시 중단한다. */
const ADD_MAX_TRIES = 3;

/* 재시도해도 소용없는 오류인지 판별 */
function isFatalLookupError(msg){
  return /invalid booking number format|no lookup result|check the booking number|no schedule info|already/i.test(msg||"");
}

function addBooking(){
  const inp=document.getElementById("newbkg");
  const el=document.getElementById("rstatus");
  const bkg=inp.value.trim().toUpperCase();

  if(!/^[A-Z]{4}\d{8}$/.test(bkg)){
    el.innerHTML="Invalid booking number format. Expected 4 letters + 8 digits.";
    return;
  }
  if(CUR && CUR.shipments.some(s=>s.booking===bkg)){
    el.innerHTML=`<b>${bkg}</b> is already in the list.`;
    return;
  }
  if(!API){
    el.innerHTML=`The browser cannot call HMM directly (CORS / session / CSRF), so the request `+
      `goes through the Worker. Set <b>API</b> at the top of the script to enable this button.`;
    return;
  }

  const btn=document.getElementById("addbtn");
  inp.disabled=true; btn.disabled=true;

  const attempt = (n) => {
    el.innerHTML = n===1
      ? `${bkg} Retrieving… (HMM responds in 5–10s)`
      : `${bkg} Retrying ${n} of ${ADD_MAX_TRIES}… (HMM returned a temporary error)`;

    return fetch(API.replace(/\/data$/,"")+"/lookup?bkg="+encodeURIComponent(bkg),{cache:"no-store"})
      .then(r=>r.json())
      .then(res=>{
        if(res.error) throw new Error(res.error);
        return res;
      })
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
      /* 새로고침하면 비밀번호 화면으로 되돌아가므로 데이터만 다시 받아 갱신한다 */
      return Promise.all([loadHistory(), fetch(source(),{cache:"no-store"})
                .then(r=>r.ok?r.json():Promise.reject())])
        .then(([,data])=>{
          if(!data.shipments.some(x=>x.booking===bkg)) data.shipments.push(res);
          render(data);
          el.innerHTML=`<b>${bkg}</b> added — ${res.vessel||"?"} ${res.voyage||""}.`
            + (res.preShipment? " Not shipped yet." : "")
            + (res.savedToData
                ? ` Saved — it stays on screen and refreshes on the next scheduled update.`
                : ` It will appear from the next scheduled update.`);
        })
        .catch(()=>{
          if(CUR){ CUR.shipments.push(res); render(CUR); }
          el.innerHTML=`<b>${bkg}</b> added — shown from the lookup result.`;
        });
    })
    .catch(e=>{ el.innerHTML=`${bkg} lookup failed — ${e.message||"no response"}`; })
    .finally(()=>{ inp.disabled=false; btn.disabled=false; });
}


/* ================= PO / CONTAINER 매핑 =================
   HMM에는 없는 사내 정보라 브라우저(localStorage)에 저장한다.
   스프레드시트에서 두 열을 그대로 복사해 붙여넣으면 되고,
   부킹번호 칸이 비어 있으면 위 행의 값을 이어받는다(fill-down). */
const PO_KEY  = "oqc_po_map_v1";     // 서버 응답 캐시 (오프라인 대비)
const KEY_KEY = "oqc_refresh_key";   // 저장용 키를 이 브라우저에 기억
const PO_URL  = API.replace(/\/data$/,"") + "/po";
const HIST_URL = API.replace(/\/data$/,"") + "/history";
let HIST = {};

/* 스케줄 변경 이력 (본선/항차/T-S 출항/ETB 변동) */
async function loadHistory(){
  try{
    const r = await fetch(HIST_URL,{cache:"no-store"});
    HIST = r.ok ? (await r.json() || {}) : {};
  }catch(_){ HIST = {}; }
  return HIST;
}
let PO = {}, POETA = {}, PHOTOS = {};

/* 서버(Worker KV)에서 읽는다. 실패하면 마지막 캐시를 쓴다. */
async function loadPO(){
  try{
    const r = await fetch(PO_URL, {cache:"no-store"});
    if(!r.ok) throw new Error(r.status);
    const j = await r.json() || {};
    PO     = j.po  || j;          // 구버전 응답(부킹 키가 최상위)도 수용
    POETA  = j.eta || {};
    PHOTOS = j.photos || {};
    try{ localStorage.setItem(PO_KEY, JSON.stringify({po:PO,eta:POETA,photos:PHOTOS})); }catch(_){}
  }catch(_){
    try{
      const c = JSON.parse(localStorage.getItem(PO_KEY) || "{}") || {};
      PO = c.po || c; POETA = c.eta || {}; PHOTOS = c.photos || {};
    }catch(__){ PO = {}; POETA = {}; PHOTOS = {}; }
  }
  return PO;
}

function getKey(){
  let k = "";
  try{ k = localStorage.getItem(KEY_KEY) || ""; }catch(_){}
  if(!k){
    k = (prompt("Enter the refresh key to save PO mapping to the server:")||"").trim();
    if(k){ try{ localStorage.setItem(KEY_KEY,k); }catch(_){} }
  }
  return k;
}
function forgetKey(){ try{ localStorage.removeItem(KEY_KEY); }catch(_){} }

/* 서버에 저장. mode:"replace"면 전체 교체 */
async function savePO(patch, mode, etaPatch, photoPatch){
  const key = getKey();
  if(!key) return {ok:false, msg:"No key entered — nothing was saved."};
  const r = await fetch(PO_URL, {
    method:"POST",
    headers:{"Content-Type":"application/json","X-Refresh-Key":key},
    body: JSON.stringify({po:patch, eta:etaPatch||{}, photos:photoPatch||{}, mode:mode||"merge"})
  });
  const res = await r.json().catch(()=>({}));
  if(!r.ok){
    if(r.status===401) forgetKey();
    return {ok:false, msg: res.error || ("Save failed ("+r.status+")")};
  }
  PO = res.po || {}; POETA = res.eta || {}; PHOTOS = res.photos || {};
  try{ localStorage.setItem(PO_KEY, JSON.stringify({po:PO,eta:POETA,photos:PHOTOS})); }catch(_){}
  return {ok:true, res};
}

/* 붙여넣은 텍스트 → { 부킹번호: [PO 문자열, ...] } */
function parsePO(text){
  const map = {}, eta = {}, photos = {}, bad = [];
  let cur = null, n = 0;
  /* 날짜 정규화: 2026-08-02 / 2026/8/2 / 2026.08.02 → 2026-08-02 */
  const normDate = v => {
    const d = String(v||"").trim().replace(/[./]/g,"-");
    if(!/^\d{4}-\d{1,2}-\d{1,2}$/.test(d)) return null;
    const [y,m,dd] = d.split("-");
    return `${y}-${String(m).padStart(2,"0")}-${String(dd).padStart(2,"0")}`;
  };

  text.split(/\r?\n/).forEach((line,ln)=>{
    if(!line.trim()) return;

    /* 부킹번호 + pCloud 상위 폴더 링크 → 그 부킹의 사진 폴더 등록
       예: KULM40326600 https://u.pcloud.link/publink/show?code=XXXX
       (상위 폴더 안에 FNG-0310-07-12 같은 컨테이너별 하위 폴더가 들어 있다) */
    const ph = line.trim().match(/^(\S+)[\s,\t]+(https?:\/\/\S*pcloud\S*)$/i);
    if(ph){
      const code = (ph[2].match(/[?&]code=([A-Za-z0-9_-]+)/)||[])[1];
      if(code) photos[ph[1].trim().toUpperCase()] = code;
      return;
    }

    /* 부킹번호로 시작하는 줄은 "부킹 + 원 스케줄"만 등록한다 (PO 항목 없이도 가능).
       예: KULM92606700 2026-08-02 */
    const solo = line.trim().match(/^([A-Z]{4}\d{8})[\s,\t]+(\S+)?\s*$/i);
    if(solo){
      cur = solo[1].toUpperCase();
      const d = normDate(solo[2]);
      if(d) eta[cur] = d;
      if(!map[cur]) map[cur] = [];      // 목록에 등록만 하고 PO는 비워둔다
      return;
    }
    /* 탭 우선, 없으면 2칸 이상 공백으로 분리 */
    const parts = line.includes("\t") ? line.split("\t") : line.split(/\s{2,}/);
    const left  = (parts[0]||"").trim();
    const right = (parts[1]||"").trim().toUpperCase();
    const third = (parts[2]||"").trim();
    if(right){
      if(!/^[A-Z]{4}\d{8}$/.test(right)){ bad.push(ln+1); return; }
      cur = right;
      /* 3열이 있으면 그 부킹의 원 스케줄 도착일로 쓴다 (YYYY-MM-DD) */
      const d = normDate(third);
      if(d) eta[cur] = d;
    }
    if(!left) return;
    if(!cur){ bad.push(ln+1); return; }   // 첫 행에 부킹번호가 없으면 귀속 불가
    (map[cur] = map[cur] || []).push(left);
    n++;
  });
  return { map, eta, photos, bad, n };
}

/* 카드/사이드바에 넣을 한 줄 요약 — "FNG031002 ×8, FNG031003 ×6 (14)" */
/* 원 스케줄 대비 지연일 — 없으면 null */
/* 원 스케줄 대비 지연 임계값 — Worker와 같은 값을 유지해야 한다 */
const DELAY_WATCH_D = 4;
const DELAY_ALERT_D = 7;
function poDelay(s){
  const orig = s.planEta || POETA[s.booking] || s.poEta;
  if(!orig || !s.eta) return null;
  const gap = (typeof s.delayDays === "number")
    ? s.delayDays
    : Math.round((new Date(s.eta.slice(0,10)) - new Date(orig))/86400000);
  const level = s.alert
    || (gap>=DELAY_ALERT_D ? "alert" : gap>=DELAY_WATCH_D ? "watch" : "ok");
  return {gap, orig, level};
}
function delayHTML(s){
  const d = poDelay(s);
  if(!d) return "";
  const cls = d.level==="alert" ? "late" : d.level==="watch" ? "watch" : "early";
  const txt = d.gap>0 ? `${d.gap}d behind` : d.gap<0 ? `${-d.gap}d ahead` : "on plan";
  return `<span class="dtag ${cls}" title="Original plan ${d.orig} · ${d.level.toUpperCase()}">${txt}</span>`;
}
/* 롤오버: 본선 예정 출항이 지났는데 선적 이벤트가 없는 상태 */
function rolloverHTML(s){
  if(!s.rollover) return "";
  return `<span class="dtag roll" title="${s.rolloverNote||""}">ROLLOVER ${s.rolloverDays||0}d</span>`;
}
/* 최근 스케줄 변경 (이번 수집에서 바뀐 항목) */
function changeHTML(s){
  if(!Array.isArray(s.justChanged) || !s.justChanged.length) return "";
  const t = s.justChanged.map(c=>`${c.label} ${c.from} → ${c.to}`).join(" / ");
  return `<p class="note warn">Schedule changed — ${t}</p>`;
}
function poSummary(booking){
  const list = PO[booking];
  if(!list || !list.length) return "";
  const lots = {};
  list.forEach(v=>{ const m=v.match(/^(\S+)/); const k=m?m[1]:v; lots[k]=(lots[k]||0)+1; });
  const parts = Object.keys(lots).map(k=>`${k} ×${lots[k]}`);
  return `${parts.join(", ")} (${list.length})`;
}

function renderPOTable(){
  const el = document.getElementById("potable");
  if(!el) return;
  /* PO·원 스케줄·사진 중 하나라도 등록된 부킹을 모두 보여준다 */
  /* LIST/MAP 표와 같은 기준(포트클랑 ETD)으로 정렬한다.
     아직 수집되지 않은 부킹은 ETD를 모르므로 맨 뒤에 부킹번호순으로 둔다. */
  const etdOf = b => {
    const sh = CUR && (CUR.shipments||[]).find(x=>x.booking===b);
    return sh ? (TS(sh.polDep) ?? TS(sh.eta) ?? Infinity) : Infinity;
  };
  const keys = [...new Set([].concat(
    Object.keys(PO||{}), Object.keys(POETA||{}), Object.keys(PHOTOS||{})
  ))].sort((a,b)=>{
    const d = etdOf(a) - etdOf(b);
    return d || String(a).localeCompare(String(b));
  });
  if(!keys.length){ el.innerHTML=""; return; }

  el.innerHTML = `<table><thead><tr>
      <th>BOOKING</th><th>PKG ETD</th><th>LOTS</th><th>CNTR</th><th>PHOTOS</th><th>ORIGINAL ETA</th>
    </tr></thead><tbody>`
    + keys.map(k=>{
        const known  = CUR && CUR.shipments.some(s=>s.booking===k);
        const nCntr  = (PO[k]||[]).length;
        const hasPic = !!PHOTOS[k];
        const eta    = POETA[k] || null;
        return `<tr>
          <td class="b">${k}${known?"":' <span class="l">(not tracked)</span>'}</td>
          <td class="l">${(()=>{const sh=CUR&&(CUR.shipments||[]).find(x=>x.booking===k);
                              return sh?fmtDT(sh.polDep):"—";})()}</td>
          <td class="l">${poSummary(k) || "—"}</td>
          <td>${nCntr || "—"}</td>
          <td class="${hasPic?"yes":"no"}">${hasPic?"O":"X"}</td>
          <td class="${eta?"":"no"}">${eta || "N/A"}</td>
        </tr>`;
      }).join("")
    + `</tbody></table>`;
}

async function applyPO(){
  const st = document.getElementById("postatus");
  const btn = document.getElementById("posave");
  const txt = document.getElementById("poin").value;
  if(!txt.trim()){ st.textContent="Nothing to apply."; return; }
  const { map, eta, photos, bad, n } = parsePO(txt);
  const keys = Object.keys(map);
  if(!keys.length && !Object.keys(photos).length){
    st.innerHTML = `No rows parsed. The first line must carry a booking number.`;
    return;
  }
  btn.disabled = true; st.textContent = "Saving to server…";
  const out = await savePO(map, "merge", eta, photos);
  btn.disabled = false;
  renderPOTable();
  if(CUR) render(CUR);
  const ph = Object.keys(photos);
  const parts = [];
  if(n) parts.push(`${n} PO row(s) → ${keys.length} booking(s)`);
  if(Object.keys(eta).length) parts.push(`${Object.keys(eta).length} original schedule date(s)`);
  if(ph.length) parts.push(`${ph.length} photo folder(s): ${ph.join(", ")}`);
  st.innerHTML = out.ok
    ? (parts.length ? parts.join(" · ") : "Nothing recognised")
      + ` — saved to server, visible on any device.`
      + (bad.length? ` Skipped line(s): ${bad.slice(0,8).join(", ")}${bad.length>8?"…":""}.` : "")
    : `Not saved — ${out.msg}`;
}

async function clearPO(){
  const st = document.getElementById("postatus");
  /* 서버의 PO·원 스케줄·사진 링크를 모두 지운다. 모든 기기·모든 사용자에게 영향이 있으므로
     확인 문구를 직접 입력하게 한다. (비밀번호를 코드에 넣으면 공개 저장소에 노출된다) */
  const typed = prompt(
    "This deletes ALL mapping data on the server — PO/containers, original schedules and photo links.\n" +
    "It affects every device and cannot be undone.\n\n" +
    "Type  DELETE ALL  to continue:");
  if((typed||"").trim().toUpperCase() !== "DELETE ALL"){
    st.textContent = "Cancelled — nothing was deleted.";
    return;
  }
  st.textContent = "Clearing…";
  const out = await savePO({}, "replace", {}, {});
  renderPOTable();
  if(CUR) render(CUR);
  st.textContent = out.ok ? "Cleared on server." : ("Not cleared — " + out.msg);
}


/* ---------- T/S 체류일 ----------
   계획: 처음 관측했을 때의 T/S 도착→출항 (이력 first 기록)
   실제/현재: 지금 스케줄 기준. 본선 출항 이벤트가 있으면 실적으로 확정된 값이다. */
function tsDwell(s){
  if(!s.tsArr || !s.tsDep) return null;
  const D = (a,b)=> (new Date(b+"Z") - new Date(a+"Z"))/86400000;
  const cur = D(s.tsArr, s.tsDep);
  if(!isFinite(cur)) return null;

  const first = (HIST[s.booking]||[]).find(e=>e.first);
  const plan = (first && first.tsArr && first.tsDep) ? D(first.tsArr, first.tsDep) : null;

  /* 본선이 이미 T/S를 떠났으면 실적, 아니면 예정 */
  const departed = (s.events||[]).some(e=>{
    const m=(e.mode||"").toUpperCase(), st=(e.status||"").toUpperCase();
    return s.vessel && m.includes(s.vessel.toUpperCase()) && st.includes("DEPARTURE");
  });
  return {
    cur: Math.round(cur*10)/10,
    plan: plan===null ? null : Math.round(plan*10)/10,
    diff: plan===null ? null : Math.round((cur-plan)*10)/10,
    actual: departed
  };
}
function tsDwellHTML(s){
  const t = tsDwell(s);
  if(!t) return "";
  const lbl = t.actual ? "actual" : "scheduled";
  let extra = "";
  if(t.plan!==null && t.diff!==0){
    const cls = t.diff>0 ? "late" : "early";
    extra = ` <span class="dtag ${cls}">${t.diff>0?"+":""}${t.diff}d vs plan</span>`;
  }else if(t.plan!==null){
    extra = ` <span class="dtag early">on plan</span>`;
  }
  const planTxt = t.plan!==null ? `plan ${t.plan}d → ` : "";
  return `<div class="tsdwell">T/S DWELL <b>${planTxt}${t.cur}d</b> <i>(${lbl})</i>${extra}
    <span class="dim">${fmtDT(s.tsArr)} → ${fmtDT(s.tsDep)}</span></div>`;
}


/* ---------- 로트 사진 (pCloud 공개 폴더) ----------
   showpublink 로 폴더 목록을 받고 getpubthumb 로 썸네일을 띄운다. 5장씩 넘긴다. */
const PC_API  = "https://api.pcloud.com";
const PC_PROXY = API.replace(/\/data$/,"") + "/pcloud";
const pcCache = {};
/* 브라우저에서 api.pcloud.com 을 직접 부르면 CORS로 막히므로 워커를 경유한다 */
async function pcList(code, folderName){
  const key = code + "|" + (folderName||"");
  if(pcCache[key]) return pcCache[key];
  const u = `${PC_PROXY}?code=${encodeURIComponent(code)}`
          + (folderName?`&folder=${encodeURIComponent(folderName)}`:"");
  const r = await fetch(u,{cache:"no-store"});
  const j = await r.json();
  if(j.error) throw new Error(j.error);
  pcCache[key] = j;
  return j;
}
const pcThumb = (code,id,size) => `${PC_API}/getpubthumb?code=${encodeURIComponent(code)}&fileid=${id}&size=${size||"240x320"}&crop=1&type=jpg`;

/* PO 항목 "FNG031007 (Container 12 of 18)" → 폴더명 "FNG-0310-07-12"
   상위 폴더 아래에 이 이름의 하위 폴더가 있고 그 안에 해당 컨테이너 사진이 들어 있다. */
function poFolderName(poText){
  const m = String(poText).match(/^([A-Z]+)(\d+)\s*\(\s*Container\s*(\d+)\s*of/i);
  if(!m) return null;
  const d = m[2];
  if(d.length < 6) return null;
  const n = String(m[3]).padStart(2,"0");
  return `${m[1].toUpperCase()}-${d.slice(0,4)}-${d.slice(4)}-${n}`;
}

const PAGE_N = 5;
function renderGallery(el, label, code, folderName){
  const head = txt => `<div class="gal-h"><b>${label}</b> ${txt}</div>`;
  if(!code){ el.innerHTML = head(`<span class="dim">no photo link for this booking</span>`); return; }
  el.innerHTML = head(`<span class="dim">loading…</span>`);

  pcList(code, folderName).then(data=>{
    const files = data.files||[];
    if(!files.length){ el.innerHTML = head(`<span class="dim">no images</span>`); return; }
    let page = 0;
    const pages = Math.ceil(files.length/PAGE_N);
    const draw = () => {
      const slice = files.slice(page*PAGE_N,(page+1)*PAGE_N);
      el.innerHTML = head(
          `<span class="dim">${folderName} · ${files.length} photos · ${page+1}/${pages}</span>
           <span class="gal-nav">
             <button class="gnav" data-d="-1" ${page===0?"disabled":""}>‹</button>
             <button class="gnav" data-d="1" ${page>=pages-1?"disabled":""}>›</button>
           </span>`)
        + `<div class="gal">${slice.map(f=>`
          <a class="gcell" href="${pcThumb(code,f.fileid,"1200x1600")}" target="_blank" rel="noopener"
             title="${(f.name||"").replace(/"/g,"")}">
            <img loading="lazy" src="${pcThumb(code,f.fileid,"240x320")}" alt="${(f.name||"").replace(/"/g,"")}">
            <span class="gname">${f.name||""}</span></a>`).join("")}</div>`;
      el.querySelectorAll(".gnav").forEach(b=>b.addEventListener("click",e=>{
        e.stopPropagation(); page = Math.max(0,Math.min(pages-1,page+ +b.dataset.d)); draw();
      }));
    };
    draw();
  }).catch(e=>{
    el.innerHTML = head(`<span class="warn">photos unavailable — ${e.message||e}</span>`);
  });
}

/* ---------- PO 팝업 ---------- */
let poSelected = null;
function cssVar(name, fb){
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fb;
}
function paintMarkers(){
  const on1 = cssVar('--sail','#3FD0A6'), off = cssVar('--buoy','#FF6B35');
  markers.forEach((m,k)=>{
    if(!m || !m.setStyle) return;
    const on = (k===poSelected);
    m.setStyle({color: on?on1:off, fillColor: on?on1:off});
    if(on) m.bringToFront();
  });
}
function showPO(s,i){
  poSelected = i; paintMarkers();
  const list = PO[s.booking] || s.pos || [];
  let cells;
  if(!list.length){
    cells = `<p class="hint" style="margin:0">No PO mapping for this booking yet — `
          + `use “MAPPING” above to paste it in.</p>`;
  }else{
    const CELLS = Math.max(list.length, 1);
    let out = "";
    for(let k=0;k<CELLS;k++){
      const v = list[k];
      if(!v){ out += `<div class="pocell empty">—</div>`; continue; }
      const m = v.match(/^(\S+)\s*\(Container\s*(\d+)\s*of\s*(\d+)\)/i);
      const fn = poFolderName(v);
      const attr = fn ? ` data-folder="${fn}" data-k="${k}" title="Click to view photos — ${fn}"` : "";
      const cls = fn ? "pocell has-photo" : "pocell";
      out += m
        ? `<div class="${cls}"${attr}><span class="po">${m[1]}</span><span class="cn">${m[2]} / ${m[3]}</span></div>`
        : `<div class="${cls}"${attr}><span class="po">${v}</span></div>`;
    }
    cells = `<div class="pogrid">${out}</div>
      <div class="polegend">
        <span><i style="background:#7FD8FF"></i>PO No.</span>
        <span><i style="background:#F2C14E"></i>Container</span>
      </div>`;
  }
  const p=document.getElementById('popanel');
  let eta="";
  const orig = POETA[s.booking] || s.poEta;
  if(orig && s.eta){
    const gap=Math.round((new Date(s.eta.slice(0,10))-new Date(orig))/86400000);
    const tag = gap>0 ? `<b class="late">${gap}d BEHIND original plan</b>`
              : gap<0 ? `<b class="early">${-gap}d ahead of original plan</b>`
                      : `<b class="ontime">On original plan</b>`;
    eta=`<div class="poeta">
      <span>Original ETA <s>${orig}</s></span>
      <span>Current ETB <b class="cur">${s.eta.slice(0,10)}</b></span>
      ${tag}</div>`;
  }
  const note = s.poNote? `<p class="ponote">${s.poNote}</p>`:"";
  p.innerHTML = `<button class="close" id="poclose" title="Close">✕</button>
     <h3>${s.vessel} ${s.voyage}</h3>
     <div class="sb">${s.booking} · ${list.length} container(s)</div>
     ${tsDwellHTML(s)}${eta}${cells}${note}<div id="galwrap"></div>
     <p class="hintclose">TAP ANYWHERE TO CLOSE · ESC</p>`;
  p.hidden=false;
  document.querySelector('.tablerow').classList.add('open');
  document.getElementById('poclose').addEventListener('click',e=>{e.stopPropagation();closePO();});
  /* PO 칸을 누르면 그 컨테이너 폴더의 사진을 아래에 표시 */
  const gw = document.getElementById("galwrap");
  const code = PHOTOS[s.booking] || null;
  if(gw){
    gw.innerHTML = code
      ? `<div class="gal-title">Select a PO / container above to see its photos</div>`
      : `<div class="gal-title dim">No photo link registered for ${s.booking}</div>`;
    if(code){
      p.querySelectorAll(".pocell.has-photo").forEach(cell=>{
        cell.addEventListener("click", ev=>{
          ev.stopPropagation();
          p.querySelectorAll(".pocell").forEach(c=>c.classList.remove("sel"));
          cell.classList.add("sel");
          const label = (list[+cell.dataset.k]||"").replace(/\s*\(/," (");
          gw.innerHTML = `<div class="galbox"></div>`;
          renderGallery(gw.querySelector(".galbox"), label, code, cell.dataset.folder);
        });
      });
    }
  }
  p.onclick = e => {
    if(e.target.closest('.pocell') || e.target.closest('.galbox')) return;
    closePO();
  };
}
document.addEventListener('keydown',e=>{ if(e.key==="Escape") closePO(); });
function closePO(){
  const pp=document.getElementById('popanel'); if(!pp||pp.hidden) return;
  poSelected=null; paintMarkers();
  const p=document.getElementById('popanel');
  p.hidden=true; p.innerHTML="";
  document.querySelector('.tablerow').classList.remove('open');
  document.querySelectorAll('#vtbody tr,#otbody tr').forEach(t=>t.classList.remove('on'));
}

/* ---------- 라우팅 ---------- */
function render(data){
  /* 같은 부킹이 두 번 들어올 수 있다(Add 재시도 등) — 최신 항목만 남긴다 */
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
  if(dropped) document.getElementById("rstatus").innerHTML=
    `Removed <b>${dropped}</b> shipment(s) that arrived over 7 days ago.`;
  /* 한 구역이 실패해도 나머지 화면은 그린다 */
  const safe = (fn,label)=>{ try{ fn(); }catch(e){ console.error(label,e);
    const el=document.getElementById("rstatus");
    if(el) el.innerHTML += `<div class="warn">${label} failed — ${e.message||e}</div>`; } };
  /* PO 패널이 열려 있으면 .tablerow.open 규칙 때문에 MAP 아래 표가 숨겨진다 */
  safe(()=>closePO(),"Close PO");
  safe(()=>alertBanner(data),"Alert banner");
  safe(()=>initMap(data),"Map");
  safe(()=>buildTable(data),"Table");
  safe(()=>buildOverview(data.shipments),"Overview");
  safe(()=>renderPOTable(),"PO table");
}
/* 제목 클릭 = 데이터 다시 받기.
   location.reload()를 쓰면 비밀번호 화면으로 되돌아가므로 데이터만 갱신한다. */
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
  }).finally(()=>{
    refreshing = false;
    if(t) t.classList.remove("busy");
  });
}

function setView(v){
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.view===v));
  document.querySelectorAll('.ship-tabbar button').forEach(t=>t.classList.toggle('on',t.dataset.view===v));
  document.getElementById('mapwrap').style.display = v==='map'?'grid':'none';
  document.getElementById('cards').style.display  = v==='list'?'block':'none';
  document.getElementById('history').style.display = v==='history'?'block':'none';
  const laneEl = document.querySelector('.lane');
  if(laneEl) laneEl.style.display = v==='history' ? 'none' : 'flex';
  if(v==='map'&&map) setTimeout(()=>map.invalidateSize(),60);
  if(v==='history') renderHistoryMonths().catch(e=>console.error("History",e));
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
document.querySelectorAll(".tile").forEach(t=>t.addEventListener("click",()=>{
  if(t.dataset.go==="quality"){show("quality");setTimeout(()=>document.getElementById("qbar").scrollIntoView({block:"start"}),60);return;}
  show("ship"); setTimeout(()=>{ map&&map.invalidateSize(); document.getElementById('ship').scrollIntoView({block:'start'}); },80);
}));
document.getElementById("back").addEventListener("click",()=>show("menu"));
document.getElementById("ship-title").addEventListener("click",refreshData);

/* ================= 변경 이력(Changelog) — admin 전용 ================= */
const CHANGELOG = [
  { v:"1.1", date:"2026-08-08", notes:[
    "admin 계정 추가 — 업데이트 로그(변경 이력)는 이제 admin 계정에서만 볼 수 있음 (kossan 포함 다른 계정에서는 안 보임)",
    "eta / qc 계정으로 로그인하면 메뉴(01/02 선택 화면) 없이 바로 해당 화면으로 진입",
    "로그아웃 버튼 추가 — 화면 우측 상단에서 언제든 로그아웃하고 다른 계정으로 재접속 가능"
  ]},
  { v:"1.0", date:"2026-08-08", notes:[
    "역할별 로그인 — kossan(전체 접근), eta(SHIPMENT STATUS만), qc(QUALITY ANALYSIS만)",
    "로그인이 5분간 유지돼 새로고침해도 비밀번호를 다시 묻지 않음",
    "HISTORY 탭: 기존 월별 상세 보기에 더해 월별 요약(선박 수 / 평균 지연일 / 최대 지연일)을 표와 차트로 추가",
    "지연 배지: 기존 빨간 \"!\"(ETB 변경)에 더해 노란 \"!\"(본선 변경)을 추가해 본선 교체로 인한 지연을 구분 가능",
    "모바일: 품질 백데이터 모달이 정상적으로 닫히고, 열려 있는 동안 배경 스크롤이 잠김",
    "사이트 전체 날짜 표기를 숫자(월/일) 대신 \"Mon/DD\"(예: Aug/08) 형식으로 변경",
    "SHIPMENT STATUS 전반 영문화 — 워커 오류 메시지, 스케줄 변경 라벨 등 남아있던 한글 문구 정리"
  ]}
];
function renderChangelog(){
  return CHANGELOG.map(v=>`<div class="cl-v">
      <div class="vh">v${v.v}<span class="d">${v.date}</span></div>
      <ul>${v.notes.map(n=>`<li>${n}</li>`).join("")}</ul>
    </div>`).join("");
}
function showChangelog(){
  if(ACCESS_ROLE !== "admin") return; // admin 전용
  const box = document.getElementById("changelog");
  box.innerHTML = `<div class="gl-in" style="max-width:520px">
      <div class="gl-h"><b>업데이트 로그</b><button class="gl-x" id="changelog-x">✕</button></div>
      ${renderChangelog()}
    </div>`;
  box.hidden = false;
  document.getElementById("changelog-x").addEventListener("click",()=>{ box.hidden = true; });
  box.addEventListener("click",e=>{ if(e.target===box) box.hidden = true; },{once:true});
}
document.getElementById("update-btn").addEventListener("click",showChangelog);

/* ================= RESTORE (admin 전용) ================= */
const BACKUP_API = "https://api.github.com/repos/donghoon2661-prog/q-report/contents/backups";

async function showRestoreModal(){
  if(ACCESS_ROLE !== "admin") return;
  const modal = document.getElementById("restore-modal");
  modal.innerHTML = `<div class="rm-in">
    <div class="rm-h"><b>⚠ RESTORE</b> — 백업에서 KV 복원<button class="gl-x" id="rm-x">✕</button></div>
    <div class="rm-note">백업 날짜를 선택하고 RESTORE를 누르면 <b>bookings · pomap · poeta · pophoto · history</b>가 해당 시점으로 복원됩니다.<br>shipments는 복원 후 /collect로 재수집됩니다. 이 작업은 되돌릴 수 없습니다.</div>
    <div class="rm-list" id="rm-list"><div style="padding:14px;font-size:11px;color:var(--fog)">백업 목록 불러오는 중…</div></div>
    <div class="rm-actions">
      <button class="btn" id="rm-cancel">취소</button>
      <button class="btn danger" id="rm-confirm" disabled>RESTORE</button>
    </div>
  </div>`;
  modal.hidden = false;
  document.getElementById("rm-x").addEventListener("click",()=>{ modal.hidden=true; });
  document.getElementById("rm-cancel").addEventListener("click",()=>{ modal.hidden=true; });
  modal.addEventListener("click",e=>{ if(e.target===modal) modal.hidden=true; });

  /* GitHub API로 backups/ 목록 fetch */
  let files;
  try{
    const r = await fetch(BACKUP_API);
    if(!r.ok) throw new Error("GitHub API " + r.status);
    files = await r.json();
  } catch(e){
    document.getElementById("rm-list").innerHTML =
      `<div style="padding:14px;font-size:11px;color:var(--buoy)">목록 불러오기 실패: ${e.message}</div>`;
    return;
  }

  /* backup-YYYY-MM-DD.json 파일만 필터, 최신순 정렬 */
  const backups = files
    .filter(f => /^backup-\d{4}-\d{2}-\d{2}\.json$/.test(f.name))
    .sort((a,b) => b.name.localeCompare(a.name));

  if(!backups.length){
    document.getElementById("rm-list").innerHTML =
      `<div style="padding:14px;font-size:11px;color:var(--fog)">백업 파일 없음</div>`;
    return;
  }

  let selectedDate = null;
  document.getElementById("rm-list").innerHTML = backups.map(f=>{
    const date = f.name.replace("backup-","").replace(".json","");
    return `<button class="rm-item" data-date="${date}">${date}</button>`;
  }).join("");

  document.querySelectorAll(".rm-item").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll(".rm-item").forEach(b=>b.classList.remove("sel"));
      btn.classList.add("sel");
      selectedDate = btn.dataset.date;
      document.getElementById("rm-confirm").disabled = false;
    });
  });

  document.getElementById("rm-confirm").addEventListener("click", async ()=>{
    if(!selectedDate) return;
    const confirmBtn = document.getElementById("rm-confirm");
    confirmBtn.disabled = true;
    confirmBtn.textContent = "복원 중…";
    const key = await getKey();
    if(!key){ confirmBtn.disabled=false; confirmBtn.textContent="RESTORE"; return; }
    try{
      const r = await fetch(`${API.replace("/data","/restore")}`, {
        method:"POST",
        headers:{"Content-Type":"application/json","X-Refresh-Key":key},
        body: JSON.stringify({ date: selectedDate })
      });
      const res = await r.json();
      if(!r.ok) throw new Error(res.error || r.status);
      modal.hidden = true;
      /* 완료 알림 */
      const box = document.getElementById("gaplog");
      box.innerHTML = `<div class="gl-in">
        <div class="gl-h"><b>${selectedDate} 복원 완료</b><button class="gl-x" id="rl-x">✕</button></div>
        <p style="font-size:12px;color:var(--paper);margin-bottom:8px">복원된 키: ${res.restored.join(", ")}</p>
        <p style="font-size:11px;color:var(--fog)">${res.note}</p>
      </div>`;
      box.hidden = false;
      document.getElementById("rl-x").addEventListener("click",()=>{ box.hidden=true; });
      /* 화면 데이터 갱신 */
      fetch(source(),{cache:"no-store"}).then(r=>r.ok?r.json():FALLBACK).then(d=>render(d));
    } catch(e){
      confirmBtn.disabled = false;
      confirmBtn.textContent = "RESTORE";
      document.getElementById("rm-list").insertAdjacentHTML("afterend",
        `<p style="font-size:11px;color:var(--buoy);margin-bottom:8px">오류: ${e.message}</p>`);
    }
  });
}
document.getElementById("restore-btn").addEventListener("click", showRestoreModal);
document.addEventListener("DOMContentLoaded",()=>{
  const qb=document.getElementById("qback");
  if(qb) qb.addEventListener("click",()=>show("menu"));
  const qt=document.getElementById("q-title");
  if(qt) qt.addEventListener("click",()=>{
    if(typeof repaintCharts==="function") repaintCharts();
    window.scrollTo(0,0);
  });
});
document.getElementById("posave").addEventListener("click",applyPO);
document.getElementById("poclear").addEventListener("click",clearPO);
document.getElementById("addbtn").addEventListener("click",addBooking);
document.getElementById("newbkg").addEventListener("keydown",e=>{if(e.key==="Enter")addBooking();});
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>setView(t.dataset.view)));
document.querySelectorAll(".ship-tabbar button").forEach(t=>t.addEventListener("click",()=>setView(t.dataset.view)));

/* ================= 테마 =================
   기본은 다크. 게이트의 스위치를 켜면 라이트로 전환되고 선택은 브라우저에 남는다.
   지도 타일도 함께 바꾼다(라이트 배경에 다크 타일은 읽히지 않음). */
const THEME_KEY = "oqc_theme";
let THEME = "dark";
const TILE = {
  dark : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
};
let tileLayer = null;

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
document.addEventListener("DOMContentLoaded", ()=>{
  initTheme();
  const sw = document.getElementById("themesw");
  if(sw) sw.addEventListener("click", ()=> applyTheme(THEME === "light" ? "dark" : "light"));
});

const AUTH_KEY = "kossan_auth_ts";
const ROLE_KEY = "kossan_role";
const AUTH_TTL_MS = 5*60*1000; // 5분
let ACCESS_ROLE = "kossan";

/* 접속 비밀번호별 권한
   kossan → 전체 / admin → 전체 + 업데이트 로그 열람 / eta → SHIPMENT STATUS만 / qc → QUALITY ANALYSIS만
   eta·qc는 메뉴(01/02) 없이 바로 해당 화면으로 들어간다. */
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
  if(backBtn)    backBtn.style.display    = restricted ? 'none' : '';
  if(qbackBtn)   qbackBtn.style.display   = restricted ? 'none' : '';

  /* Add booking / MAPPING — admin 전용. kossan·eta는 조회만 가능 */
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

  /* qc 전용 접속 — 메뉴를 거치지 않고 바로 QUALITY ANALYSIS로, SHIPMENT 데이터는 받지 않는다 */
  if(ACCESS_ROLE === "qc"){
    show("quality");
    setTimeout(()=>document.getElementById("qbar").scrollIntoView({block:"start"}),60);
    return;
  }

  /* eta 전용 접속 — 메뉴를 거치지 않고 바로 SHIPMENT STATUS로 */
  if(ACCESS_ROLE === "eta"){
    show("ship");
    setTimeout(()=>{ map&&map.invalidateSize(); document.getElementById('ship').scrollIntoView({block:'start'}); },80);
  } else {
    show("menu");
  }
  setView('map');

  Promise.all([
    loadPO(), loadHistory(),
    fetch(source(),{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).catch(()=>FALLBACK)
  ]).then(([,,data])=>render(data));
}

function unlock(){
  const val = document.getElementById("pw").value.trim();
  const role = Object.keys(ROLE_PW).find(k => ROLE_PW[k] === val);
  if(!role){
    document.getElementById("gate-err").textContent="Incorrect password."; return;
  }
  try{
    localStorage.setItem(AUTH_KEY, String(Date.now()));
    localStorage.setItem(ROLE_KEY, role);
  }catch(_){}
  proceedAfterUnlock();
}
document.getElementById("gate-go").addEventListener("click",unlock);
document.getElementById("pw").addEventListener("keydown",e=>{if(e.key==="Enter")unlock();});
document.getElementById("pw").focus();

/* 로그아웃 — 인증 정보를 지우고 게이트로 되돌아간다(다른 계정으로 재접속 가능) */
document.getElementById("logout-btn").addEventListener("click",()=>{
  try{
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ROLE_KEY);
  }catch(_){}
  location.reload();
});

// 5분 이내 재방문이면 게이트 건너뛰기
(function tryAutoUnlock(){
  let ts = null;
  try{ ts = parseInt(localStorage.getItem(AUTH_KEY)||"0",10); }catch(_){}
  if(ts && (Date.now()-ts) < AUTH_TTL_MS){
    proceedAfterUnlock();
  }
})();

/* ================= HISTORY 탭 =================
   ETD(PKG 출항) 기준 월별 완료 화물 조회. worker.js의 /delayhistory 사용.
   delayHistory:{planEta 기준월} 키로 저장돼 있지만, 화면은 polDepMonth로 다시 그룹핑해서
   ETD 기준 월 카드를 보여준다 (백엔드 저장 축과 화면 표시 축이 다름 — 의도된 설계). */
const HIST_API = "https://kossan-oqc.dhoqc.workers.dev/delayhistory";
let histCache = null;   // { "2026-06":[...], "2026-07":[...] } — polDepMonth 기준으로 재그룹핑된 캐시

function histBadgeClass(d){
  if(d===null||d===undefined) return "b-plain";
  if(d<=0) return "b-green";
  if(d>=7) return "b-red";
  if(d>=4) return "b-amber";
  return "b-plain";
}
function histBadgeLabel(d){
  if(d===null||d===undefined) return "N/A";
  if(d<=0){
    const n=Math.abs(d);
    return n===0?"ON TIME":(n===1?"1 DAY EARLY":`${n} DAYS EARLY`);
  }
  return d===1?"1 DAY DELAY":`${d} DAYS DELAY`;
}
function histShortDate(s){ return s ? monAbbr(String(s).slice(5,7))+"/"+String(s).slice(8,10) : "—"; }

async function loadHistoryData(){
  if(histCache) return histCache;
  const monthsRes = await fetch(HIST_API,{cache:"no-store"}).then(r=>r.ok?r.json():{months:[]});
  const months = monthsRes.months||[];
  const byPlanMonth = await Promise.all(months.map(m=>
    fetch(`${HIST_API}?month=${m}`,{cache:"no-store"}).then(r=>r.ok?r.json():{records:[]})
  ));
  /* planMonth별로 받아온 레코드를 polDepMonth(ETD 기준) 축으로 재그룹핑 */
  const byEtdMonth = {};
  byPlanMonth.forEach(res=>(res.records||[]).forEach(rec=>{
    const key = rec.polDepMonth || "unknown";
    (byEtdMonth[key] = byEtdMonth[key]||[]).push(rec);
  }));
  histCache = byEtdMonth;
  return histCache;
}

function histMonthLabel(ym){
  if(!ym||ym==="unknown") return {m:"UNKNOWN",y:""};
  const [y,mo] = ym.split("-");
  const names=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return { m:names[parseInt(mo,10)-1]||mo, y };
}

async function renderHistoryMonths(){
  const wrap = document.getElementById("hist-months");
  document.getElementById("hist-detail").hidden = true;
  wrap.hidden = false;
  wrap.innerHTML = `<div class="hist-empty">Loading…</div>`;
  let data;
  try{ data = await loadHistoryData(); }
  catch(e){ wrap.innerHTML = `<div class="hist-empty">Failed to load history — ${e.message||e}</div>`; return; }

  const keys = Object.keys(data).filter(k=>k!=="unknown").sort().reverse();
  if(!keys.length){
    wrap.innerHTML = `<div class="hist-empty">No completed shipments yet.</div>`;
    document.getElementById("hist-summary").style.display = "none";
    return;
  }
  document.getElementById("hist-summary").style.display = "";
  renderHistorySummary(data, keys);

  wrap.innerHTML = keys.map(k=>{
    const {m,y} = histMonthLabel(k);
    const n = data[k].length;
    return `<button class="hist-mcard" data-month="${k}">
      <div class="m">${m}</div><div class="y">${y} &middot; ${n} shipment${n===1?"":"s"}</div>
    </button>`;
  }).join("");

  wrap.querySelectorAll(".hist-mcard").forEach(b=>
    b.addEventListener("click",()=>renderHistoryDetail(b.dataset.month)));
}

/* ---------- HISTORY 월별 요약(표+차트) ----------
   완료 화물의 delayDays 기준: 월별 vessel 수 / 평균 지연일 / 최대 지연일.
   표는 시간순(오름차순, 차트와 같은 순서), 카드 그리드(renderHistoryMonths)는 최신순 그대로 유지. */
let histChartInst = null;
function monthStats(data, keys){
  return keys.slice().sort().map(k=>{
    const recs = data[k]||[];
    const delays = recs.map(r=>r.delayDays).filter(d=>d!==null&&d!==undefined);
    const avg = delays.length ? delays.reduce((a,b)=>a+b,0)/delays.length : null;
    const max = delays.length ? Math.max(...delays) : null;
    const {m,y} = histMonthLabel(k);
    return { key:k, label:`${m} ${y}`, vessels:recs.length, avg, max };
  });
}
function renderHistorySummary(data, keys){
  const stats = monthStats(data, keys);

  const tbody = document.getElementById("hist-stats-tbody");
  tbody.innerHTML = stats.map((s,i)=>`<tr data-idx="${i}">
      <td>${s.label}</td><td>${s.vessels}</td>
      <td>${s.avg===null?"—":s.avg.toFixed(1)+"d"}</td>
      <td>${s.max===null?"—":s.max+"d"}</td>
    </tr>`).join("");

  const ctx = document.getElementById("hist-chart");
  if(histChartInst){ histChartInst.destroy(); histChartInst = null; }
  const barColor = cssVar('--sail','#3FD0A6');
  histChartInst = new Chart(ctx, {
    type: "bar",
    data: {
      labels: stats.map(s=>s.label),
      datasets: [{
        label: "Avg delay (days)",
        data: stats.map(s=>s.avg===null?0:s.avg),
        backgroundColor: barColor,
        borderRadius: 4,
        maxBarThickness: 46
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display:false },
        tooltip: {
          callbacks: {
            title: items => stats[items[0].dataIndex].label,
            label: item => {
              const s = stats[item.dataIndex];
              return [
                `Vessels: ${s.vessels}`,
                `Avg delay: ${s.avg===null?"—":s.avg.toFixed(1)+"d"}`,
                `Max delay: ${s.max===null?"—":s.max+"d"}`
              ];
            }
          }
        }
      },
      onHover: (evt, elements) => {
        tbody.querySelectorAll("tr").forEach(tr=>tr.classList.remove("hi"));
        if(elements.length){
          const row = tbody.querySelector(`tr[data-idx="${elements[0].index}"]`);
          if(row) row.classList.add("hi");
        }
      },
      scales: {
        x: { ticks:{ color:cssVar('--fog','#8AA4B5') }, grid:{ display:false } },
        y: { beginAtZero:true, ticks:{ color:cssVar('--fog','#8AA4B5') },
             grid:{ color:cssVar('--line-soft','#162C3B') } }
      }
    }
  });

  /* 표 행에 마우스 올리면 차트에서도 강조 */
  tbody.querySelectorAll("tr").forEach(tr=>{
    tr.addEventListener("mouseenter", ()=>{
      tbody.querySelectorAll("tr").forEach(t=>t.classList.remove("hi"));
      tr.classList.add("hi");
    });
  });
}

function renderHistoryDetail(monthKey){
  const data = histCache || {};
  const recs = (data[monthKey]||[]).slice().sort((a,b)=>(a.polDep||"").localeCompare(b.polDep||""));
  document.getElementById("hist-months").hidden = true;
  const detail = document.getElementById("hist-detail");
  detail.hidden = false;

  const {m,y} = histMonthLabel(monthKey);
  document.getElementById("hist-monthtitle").textContent = `${m} ${y}`;
  document.getElementById("hist-monthmeta").textContent =
    `ETD basis · ${recs.length} shipment${recs.length===1?"":"s"}`;

  const tbody = document.getElementById("hist-tbody");
  tbody.innerHTML = recs.map((r,i)=>{
    const dwell = (r.legBreakdown||[]).find(l=>l.label==="T/S 출항 ETD");
    const dwellTxt = dwell && dwell.note ? dwell.note.split("d vs")[0]+"d" : "—";
    return `<tr>
      <td><span class="vname">${r.vessel||"—"}</span><span class="vbkg">${r.booking}</span></td>
      <td class="route">${(r.pol||"").split(",")[0]||"—"} &rarr; ${(r.pod||"").split(",")[0]||"—"}</td>
      <td>${histShortDate(r.polDep)} <span class="plandate">(${histShortDate(r.polDep)})</span></td>
      <td class="dwell">${dwellTxt}</td>
      <td>${histShortDate(r.actualEta)} <span class="plandate">(${histShortDate(r.planEta)})</span></td>
      <td><span class="hist-badge ${histBadgeClass(r.delayDays)}" data-idx="${i}">${histBadgeLabel(r.delayDays)}</span></td>
    </tr>`;
  }).join("");

  tbody.querySelectorAll(".hist-badge").forEach(b=>
    b.addEventListener("click",()=>openHistPopup(recs[parseInt(b.dataset.idx,10)])));

  document.getElementById("hist-back").onclick = ()=>{
    detail.hidden = true;
    document.getElementById("hist-months").hidden = false;
  };
}

function openHistPopup(rec){
  const popup = document.getElementById("hist-popup");
  document.getElementById("hist-popup-title").textContent =
    `${rec.vessel||"—"}${rec.voyage?" "+rec.voyage:""}`;
  document.getElementById("hist-popup-sub").textContent =
    `${rec.booking} · ${(rec.pol||"").split(",")[0]||"—"} &rarr; ${(rec.pod||"").split(",")[0]||"—"}`
      .replace("&rarr;","→");

  const legs = rec.legBreakdown;
  const legsEl = document.getElementById("hist-popup-legs");
  if(!legs){
    legsEl.innerHTML = `<div class="hist-empty">This booking predates tracking start, so a leg-by-leg breakdown isn't available.</div>`;
  } else {
    legsEl.innerHTML = legs.map(l=>{
      const val = l.days===null ? "N/A" :
        (l.days===0 ? "ON TIME" : `${l.days>0?"+":""}${l.days} DAY${Math.abs(l.days)===1?"":"S"}`);
      const cls = (l.days===null||l.days<=0) ? "lv-plain" : "lv-red";
      const note = l.note ? `<span class="note">(${l.note})</span>` : "";
      return `<div class="hist-leg"><span>${l.label}</span><span class="${cls}">${val}${note}</span></div>`;
    }).join("");
  }

  document.getElementById("hist-popup-total").textContent = histBadgeLabel(rec.delayDays).replace(" DELAY","");
  popup.hidden = false;
}
document.getElementById("hist-popup-close").addEventListener("click",()=>{
  document.getElementById("hist-popup").hidden = true;
});
document.getElementById("hist-popup").addEventListener("click",e=>{
  if(e.target.id==="hist-popup") document.getElementById("hist-popup").hidden = true;
});
