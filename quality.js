/* ── Kossan OQC · QUALITY ANALYSIS ─────────────────────────────────────────
   COA 원본 데이터는 이 파일에 없다. data/coa/index.json 에 나열된 JSON들을
   불러와 조립한다. 새 COA 추가 = JSON 파일 1개 + index.json 에 한 줄.
   이 파일(로직)은 건드릴 필요 없음.
   ───────────────────────────────────────────────────────────────────────── */

/* ── 스펙 상수 (v10.8) ── */
const WSPEC = {'Small':[80,90],'Medium':[90,100],'Large':[101,111],'Extra Large':[111,121]};
const ITEMS = [
  {id:'leak', name:'Leaking', dir:'hi', s1:15, s2:12, key:'leak', unit:'개/사이즈', specTxt:'사이즈당 Max 14'},
  {id:'maj',  name:'Visual Major', dir:'hi', s1:22, s2:18, key:'maj', unit:'개/사이즈', specTxt:'사이즈당 Max 21'},
  {id:'minr', name:'Visual Minor', dir:'hi', s1:22, s2:18, key:'minr', unit:'개/사이즈', specTxt:'사이즈당 Max 21'},
  {id:'ba_t', name:'BA Tensile Min', dir:'lo', s1:18, s2:20, key:'ba_t_min', unit:'MPa', specTxt:'≥ 18.0'},
  {id:'ba_e', name:'BA Elongation Min', dir:'lo', s1:500, s2:515, key:'ba_e_min', unit:'%', specTxt:'≥ 500'},
  {id:'aa_t', name:'AA Tensile Min', dir:'lo', s1:14, s2:18, key:'aa_t_min', unit:'MPa', specTxt:'≥ 14.0'},
  {id:'aa_e', name:'AA Elongation Min', dir:'lo', s1:400, s2:440, key:'aa_e_min', unit:'%', specTxt:'≥ 400'},
  {id:'powder', name:'Powder', dir:'hi', s1:1.5, s2:1.2, s1incl:true, key:'powder', unit:'', specTxt:'Max 1.50'},
  {id:'len', name:'Length Min', dir:'lo', s1:240, s2:243, key:'len_min', unit:'mm', specTxt:'≥ 240'},
  {id:'cuff', name:'Thk Cuff Min', dir:'lo', s1:0.05, s2:null, key:'cuff_min', unit:'mm', specTxt:'≥ 0.05 · 근접밴드 없음'},
  {id:'palm', name:'Thk Palm Min', dir:'lo', s1:0.06, s2:null, key:'palm_min', unit:'mm', specTxt:'≥ 0.06 · 근접밴드 없음'},
  {id:'fin', name:'Thk Finger Min', dir:'lo', s1:0.08, s2:null, key:'fin_min', unit:'mm', specTxt:'≥ 0.08 · 근접밴드 없음'},
  {id:'width', name:'Width 경계 여유', dir:'lo', s1:0, s2:1, key:null, unit:'mm', specTxt:'사이즈별 ±5, 0 = 스펙 경계', margin:true},
];

const COA_DIR = 'data/coa/';
let DATA = { sheets: [], detections: [] };

/* index.json → 각 시트 JSON 병렬 로드 → DATA 형태로 조립 */
async function loadCOA(){
  const ir = await fetch(COA_DIR + 'index.json', {cache:'no-store'});
  if(!ir.ok) throw new Error('index.json ' + ir.status);
  const idx = await ir.json();
  const list = Array.isArray(idx.sheets) ? idx.sheets : [];
  const files = await Promise.all(list.map(async e => {
    const r = await fetch(COA_DIR + e.file, {cache:'no-store'});
    if(!r.ok) throw new Error(e.file + ' ' + r.status);
    const j = await r.json();
    return { name: j.name || e.name, sectors: j.sectors || [], detections: j.detections || [] };
  }));
  return {
    sheets: files.map(f => ({ name: f.name, sectors: f.sectors })),
    detections: files.flatMap(f => f.detections.map(d => ({ ...d, sheet: d.sheet || f.name })))
  };
}

function coaError(msg){
  const c = document.getElementById('chips');
  if(c) c.innerHTML = '<span class="chip alert">COA 데이터 로드 실패<b>!</b></span>';
  const l = document.getElementById('left');
  if(l) l.innerHTML = '<div class="empty-note">' + msg + '<br>data/coa/ 경로와 index.json을 확인하세요.</div>';
  console.error('[quality] COA load failed:', msg);
}

(async function boot(){
  try {
    DATA = await loadCOA();
    if(!DATA.sheets.length) return coaError('COA 파일이 하나도 없습니다.');
    buildQuality();
  } catch(e) {
    coaError(String(e.message || e));
  }
})();

function buildQuality(){
  const lots = [...new Set(DATA.sheets.flatMap(s=>s.sectors.map(x=>x.lot)))].sort();
  const lotMonth = l => '20'+l.slice(1,3)+'-'+l.slice(3,5);
  function widthMargin(rows){
    let m = Infinity;
    for(const sz in rows){
      const b=WSPEC[sz]; if(!b) continue;
      const r=rows[sz];
      [r.w_min,r.w_med].forEach(v=>{ if(v!=null) m=Math.min(m, v-b[0], b[1]-v); });
    }
    return m===Infinity?null:m;
  }
  function lotWorst(item){
    return lots.map(l=>{
      let vals=[];
      DATA.sheets.forEach(s=>s.sectors.forEach(sec=>{
        if(sec.lot!==l) return;
        if(item.margin){ const m=widthMargin(sec.rows); if(m!=null) vals.push(m); return; }
        Object.values(sec.rows).forEach(r=>{ const v=r[item.key]; if(v!=null) vals.push(v); });
      }));
      if(!vals.length) return null;
      return item.dir==='hi'?Math.max(...vals):Math.min(...vals);
    });
  }
  const detBySheet = {};
  DATA.sheets.forEach(s=>detBySheet[s.name]=[]);
  DATA.detections.forEach(d=>detBySheet[d.sheet].push(d));

  /* ── 헤더 요약 ── */
  const nS1 = DATA.detections.filter(d=>d.tier==='S1').length;
  const nS2 = DATA.detections.filter(d=>d.tier==='S2').length;
  document.getElementById('chips').innerHTML =
    '<span class="chip">Lot<b>'+lots.length+'</b></span>'+
    '<span class="chip">섹터<b>'+DATA.sheets.reduce((a,s)=>a+s.sectors.length,0)+'</b></span>'+
    '<span class="chip alert">S1 Off-spec<b>'+nS1+'</b></span>'+
    '<span class="chip">S2 근접<b>'+nS2+'</b></span>';

  /* ── 좌측 ── */
  const left = document.getElementById('left');
  DATA.sheets.forEach(s=>{
    const dets = detBySheet[s.name];
    const slots = [...new Set(s.sectors.map(x=>x.lot))].join(' · ');
    const btn = document.createElement('button');
    btn.className='sheet-item'; btn.setAttribute('aria-expanded','false');
    btn.innerHTML = '<span class="nm">'+s.name+'<span class="lots">Lot '+slots+'</span></span>'+
                    '<span class="badge '+(dets.length?'hit':'zero')+'">'+dets.length+'</span>';
    const dl = document.createElement('div');
    dl.className='det-list'; dl.style.display='none';
    dl.innerHTML = dets.length ? dets.map(d=>
      '<div class="det-row" style="border-left-color:var(--g'+d.grade+')">'+
        '<div class="top"><span class="grade '+d.grade+'">'+d.grade+'</span>'+
        '<span class="item">'+d.size+' / '+d.item+'</span><span class="val">'+d.gv+'</span></div>'+
        '<div class="note">'+d.note+'</div>'+
        '<div class="lot">Lot '+d.lot+' · p.'+d.pages+' · 셀 '+d.cell+'</div></div>').join('')
      : '<div class="empty-note">신 기준(v10.8) 탐지 없음 — 전 항목 스펙 이내</div>';
    btn.addEventListener('click',()=>{
      const open = dl.style.display!=='none';
      dl.style.display = open?'none':'block';
      btn.setAttribute('aria-expanded', String(!open));
    });
    left.appendChild(btn); left.appendChild(dl);
  });

  /* ── 중앙 차트 ── */
  const ichips = document.getElementById('ichips');
  let curItem = ITEMS.find(i=>i.id==='fin');
  ITEMS.forEach(it=>{
    const b=document.createElement('button');
    b.className='ichip'+(it===curItem?' on':''); b.textContent=it.name;
    b.addEventListener('click',()=>{
      curItem=it;
      document.querySelectorAll('.ichip').forEach(x=>x.classList.remove('on'));
      b.classList.add('on'); draw();
    });
    ichips.appendChild(b);
  });

  /* 차트 색은 #qview의 CSS 변수에서 읽어 테마를 따라가게 한다 */
  function qvar(name, fb){
    const el = document.getElementById('qview');
    if(!el) return fb;
    const v = getComputedStyle(el).getPropertyValue('--'+name).trim();
    return v || fb;
  }
  Chart.defaults.color = qvar('muted','#7E8AA0');
  Chart.defaults.font.family="'IBM Plex Mono',monospace";
  Chart.defaults.font.size=10.5;
  let chart=null;
  function isOff(it,v){ return it.dir==='hi' ? (it.s1incl? v>it.s1 : v>=it.s1) : v<it.s1; }
  function isNear(it,v){ if(it.s2==null) return false; return it.dir==='hi' ? (v>=it.s2 && !isOff(it,v)) : (v<it.s2 && !isOff(it,v)); }
  window.repaintCharts = function(){
    try{ Chart.defaults.color = qvar('muted','#7E8AA0'); draw(); }catch(_){}
  };
  function draw(){
    const worst = lotWorst(curItem);
    if(chart) chart.destroy();
    const barColor = worst.map(v=> v==null?qvar('line2','#2A3446'): isOff(curItem,v)?qvar('gA','#FF6D5E'): isNear(curItem,v)?qvar('gB','#F5B84F'):qvar('blue','#4DA3FF'));
    const ds=[{type:'bar',label:'Lot 최악값',data:worst,backgroundColor:barColor,borderRadius:5,maxBarThickness:52},
      {type:'line',label:'S1 한계',data:lots.map(()=>curItem.s1),borderColor:qvar('gA','#FF6D5E'),borderWidth:1.6,borderDash:[6,4],pointRadius:0}];
    if(curItem.s2!=null) ds.push({type:'line',label:'S2 경계',data:lots.map(()=>curItem.s2),borderColor:qvar('gB','#F5B84F'),borderWidth:1.2,borderDash:[3,4],pointRadius:0});
    chart=new Chart(document.getElementById('chart'),{
      data:{labels:lots,datasets:ds},
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false},tooltip:{backgroundColor:qvar('panel','#12161E'),borderColor:qvar('line2','#2A3446'),borderWidth:1,
          callbacks:{title:c=>'Lot '+lots[c[0].dataIndex]+' ('+lotMonth(lots[c[0].dataIndex])+' 제조)'}}},
        scales:{x:{grid:{color:qvar('line','#1A2130')}},
                y:{grid:{color:qvar('line','#1A2130')},title:{display:true,text:curItem.name+(curItem.unit?' ('+curItem.unit+')':'')+' — 스펙: '+curItem.specTxt,color:'#7E8AA0',font:{size:11}}}}
      }});
    const last = worst[worst.length-1];
    let marginTxt='—', cls='ok';
    if(last!=null){
      const mm = curItem.dir==='hi' ? (curItem.s1incl? curItem.s1-last : (curItem.s1-1)-last) : last-curItem.s1;
      marginTxt=(mm>=0?'+':'')+(Math.round(mm*100)/100);
      cls = isOff(curItem,last)?'bad': isNear(curItem,last)?'warn':'ok';
    }
    const hist = worst.filter(v=>v!=null);
    const histWorst = hist.length? (curItem.dir==='hi'?Math.max(...hist):Math.min(...hist)) : '—';
    document.getElementById('mstrip').innerHTML =
      '<div class="mcard"><div class="l">최신 Lot '+lots[lots.length-1]+'</div><div class="v '+cls+'">'+(last==null?'—':last)+'</div></div>'+
      '<div class="mcard"><div class="l">허용 한계까지 여유</div><div class="v '+cls+'">'+marginTxt+'</div></div>'+
      '<div class="mcard"><div class="l">전체 기간 최악값</div><div class="v">'+histWorst+'</div></div>'+
      '<div class="mcard"><div class="l">판정 상태</div><div class="v '+cls+'">'+(cls==='bad'?'OFF-SPEC':cls==='warn'?'근접':'정상')+'</div></div>';
  }
  draw();

  /* ── 우측: 제조일자 ── */
  const byDate={};
  DATA.sheets.forEach(s=>s.sectors.forEach(sec=>{
    const d=sec.mfg||'미상';
    byDate[d]=byDate[d]||{};
    byDate[d][s.name]=byDate[d][s.name]||new Set();
    byDate[d][s.name].add(sec.lot);
  }));
  const right=document.getElementById('right');
  Object.keys(byDate).sort().reverse().forEach(d=>{
    const mh=document.createElement('div'); mh.className='month-h';
    mh.textContent='제조월 '+d.slice(0,7); right.appendChild(mh);
    const db=document.createElement('button'); db.className='date-item'; db.setAttribute('aria-expanded','false');
    db.innerHTML='<div class="d">'+d+'</div><div class="c">워크시트 '+Object.keys(byDate[d]).length+'개 · 클릭하여 파일 목록</div>';
    const fl=document.createElement('div'); fl.className='file-list'; fl.style.display='none';
    Object.entries(byDate[d]).forEach(([nm,ls])=>{
      const fb=document.createElement('button'); fb.className='file-btn';
      fb.innerHTML=nm+'<span class="lotln">Lot '+[...ls].join(' · ')+' → 백데이터 열기</span>';
      fb.addEventListener('click',()=>openBackdata(nm));
      fl.appendChild(fb);
    });
    db.addEventListener('click',()=>{
      const open=fl.style.display!=='none';
      fl.style.display=open?'none':'block';
      db.setAttribute('aria-expanded',String(!open));
    });
    right.appendChild(db); right.appendChild(fl);
  });

  /* ── 백데이터 모달 ── */
  const overlay=document.getElementById('overlay');
  document.getElementById('mClose').addEventListener('click',()=>overlay.classList.remove('show'));
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('show')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')overlay.classList.remove('show')});

  const GROUPS=[
   ['수량',[['cartons','Cartons'],['qty_max','Qty Max'],['qty_min','Qty Min']]],
   ['외관 검사',[['leak','Leaking'],['maj','V.Major'],['minr','V.Minor']]],
   ['Before Aging',[['ba_t_max','Tensile Max'],['ba_t_min','Tensile Min'],['ba_t_avg','Tensile AVRG'],['ba_e_max','Elong Max'],['ba_e_min','Elong Min'],['ba_e_avg','Elong AVRG']]],
   ['After Aging',[['aa_t_max','Tensile Max'],['aa_t_min','Tensile Min'],['aa_t_avg','Tensile AVRG'],['aa_e_max','Elong Max'],['aa_e_min','Elong Min'],['aa_e_avg','Elong AVRG']]],
   ['Powder · 치수',[['powder','Powder'],['len_min','Length Min'],['len_med','Length Med'],['w_min','Width Min'],['w_med','Width Med']]],
   ['Thickness',[['cuff_min','Cuff Min'],['cuff_med','Cuff Med'],['palm_min','Palm Min'],['palm_med','Palm Med'],['fin_min','Finger Min'],['fin_med','Finger Med']]]
  ];
  function cellClass(k,v,sz){
    if(v==null) return '';
    if(k==='leak') return v>=15?'viol':v>=12?'near':'';
    if(k==='maj'||k==='minr') return v>=22?'viol':v>=18?'near':'';
    if(k==='ba_t_min') return v<18?'viol':v<20?'near':'';
    if(k==='ba_e_min') return v<500?'viol':v<515?'near':'';
    if(k==='aa_t_min') return v<14?'viol':v<18?'near':'';
    if(k==='aa_e_min') return v<400?'viol':v<440?'near':'';
    if(k==='powder') return v>1.5?'viol':v>=1.2?'near':'';
    if(k==='len_min') return v<240?'viol':v<243?'near':'';
    if(k==='cuff_min') return Math.round((v-0.05)*1e6)<0?'viol':'';
    if(k==='palm_min') return Math.round((v-0.06)*1e6)<0?'viol':'';
    if(k==='fin_min') return Math.round((v-0.08)*1e6)<0?'viol':'';
    if(k==='w_min'||k==='w_med'){const b=WSPEC[sz];if(!b)return '';return (v<b[0]||v>b[1])?'viol':(v<=b[0]+1||v>=b[1]-1)?'near':'';}
    return '';
  }
  function openBackdata(name){
    const sheet=DATA.sheets.find(s=>s.name===name);
    document.getElementById('mTitle').textContent=name;
    document.getElementById('mSub').textContent='섹터 '+sheet.sectors.length+'개 · 셀 강조 = v10.8 기준 Off-spec(적) / 근접(황)';
    const tabs=document.getElementById('mTabs'); tabs.innerHTML='';
    sheet.sectors.forEach((sec,i)=>{
      const b=document.createElement('button'); b.className='stab'+(i===0?' on':'');
      b.textContent='#'+(i+1)+' · Lot '+sec.lot+' · p.'+sec.pages;
      b.addEventListener('click',()=>{
        tabs.querySelectorAll('.stab').forEach(x=>x.classList.remove('on'));
        b.classList.add('on'); renderSector(sheet,i);
      });
      tabs.appendChild(b);
    });
    renderSector(sheet,0);
    overlay.classList.add('show');
  }
  function renderSector(sheet,idx){
    const sec=sheet.sectors[idx];
    const sizes=Object.keys(sec.rows);
    let h='<div class="meta-row"><span>Lot <b>'+sec.lot+'</b></span><span>제조일 <b>'+(sec.mfg||'—')+'</b></span><span>Pages <b>'+sec.pages+'</b></span></div>';
    h+='<table class="bd"><tr><th>항목</th>'+sizes.map(s=>'<th>'+s+'</th>').join('')+'</tr>';
    GROUPS.forEach(g=>{
      h+='<tr><td class="grp" colspan="'+(sizes.length+1)+'">'+g[0]+'</td></tr>';
      g[1].forEach(col=>{
        h+='<tr><td>'+col[1]+'</td>'+sizes.map(sz=>{
          const v=sec.rows[sz][col[0]];
          return '<td class="'+cellClass(col[0],v,sz)+'">'+(v==null?'—':v)+'</td>';
        }).join('')+'</tr>';
      });
    });
    h+='</table><div class="legend-bd">강조: <i class="r">적색 = Off-spec(S1)</i> · <i class="y">황색 = 근접 밴드(S2)</i> — 검사 기준 v10.8 (Thickness는 근접 밴드 없음)</div>';
    document.getElementById('mBody').innerHTML=h;
  }

  /* ── 모바일 탭 전환 ── */
  const mq = window.matchMedia('(max-width:900px)');
  document.getElementById('tbBadge').textContent = DATA.detections.length || '';
  if(!DATA.detections.length) document.getElementById('tbBadge').style.display='none';
  document.querySelectorAll('.tabbar button').forEach(b=>{
    b.addEventListener('click',()=>{
      document.querySelectorAll('.tabbar button').forEach(x=>x.classList.remove('on'));
      b.classList.add('on');
      document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
      document.getElementById(b.dataset.panel).classList.add('active');
      if(b.dataset.panel==='p-chart') requestAnimationFrame(()=>draw()); // 숨김 상태에서 초기화된 캔버스 재생성
      window.scrollTo({top:0});
    });
  });
  mq.addEventListener('change',()=>requestAnimationFrame(()=>draw()));
  window.addEventListener('orientationchange',()=>setTimeout(()=>draw(),250));

}
