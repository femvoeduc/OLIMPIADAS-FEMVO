// ============================================================
// LÓGICA DE LA APP — VII Olimpiadas Atletismo FEMVO 2026
// ============================================================

const SCREEN_META = {
  home:       { title:"Inicio",        sub:"Complejo Deportivo Valle del Olivo" },
  ubicacion:  { title:"Ubicación",     sub:"Cómo llegar al recinto" },
  programa:   { title:"Programación",  sub:"Sábado 27 y domingo 28 de junio" },
  vivo:       { title:"En vivo",       sub:"Resultados de las competencias" },
  medallero:  { title:"Medallero",     sub:"Acumulado por colegio" },
  galeria:    { title:"Galería",       sub:"Momentos del encuentro" },
};

// Aplica los textos de la pestaña "Info" de la planilla, si se cargaron.
// Si no hay datos de Sheets disponibles, se mantienen los textos de ejemplo.
function applyEventInfo(){
  const info = window.EVENT_INFO;
  if(!info) return;

  if(info.NombreEvento){
    document.querySelectorAll('.brand-text .title')[0].textContent = info.NombreEvento;
  }
  if(info.Recinto){
    SCREEN_META.home.sub = info.Recinto;
    const venueTitle = document.querySelector('#screen-ubicacion .venue-card .row .t');
    if(venueTitle) venueTitle.textContent = info.Recinto;
    // Si la pantalla de Inicio está activa en este momento, refresca el subtítulo ya mismo
    const subEl = document.getElementById('screenSub');
    if(subEl && document.getElementById('screen-home').classList.contains('active')){
      subEl.textContent = info.Recinto;
    }
  }
  if(info.Direccion){
    const venueDesc = document.querySelector('#screen-ubicacion .venue-card .row .d');
    if(venueDesc) venueDesc.textContent = info.Direccion;
  }
  if(info.HorarioTexto){
    const rows = document.querySelectorAll('#screen-ubicacion .venue-card .row');
    if(rows[1]) rows[1].querySelector('.d').textContent = info.HorarioTexto;
  }
  if(info.MapaLat && info.MapaLng){
    const lat = parseFloat(info.MapaLat), lng = parseFloat(info.MapaLng);
    const iframe = document.querySelector('.map-frame iframe');
    if(iframe && !isNaN(lat) && !isNaN(lng)){
      const d = 0.01;
      iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-d}%2C${lat-d}%2C${lng+d}%2C${lat+d}&layer=mapnik&marker=${lat}%2C${lng}`;
    }
  }
  if(info.LinkMaps){
    const btn = document.querySelector('#screen-ubicacion .btn-gold');
    if(btn) btn.setAttribute('onclick', `window.open('${info.LinkMaps}','_blank')`);
  }
}

function goTo(screen){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-'+screen).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.screen===screen));
  document.getElementById('screenTitle').textContent = SCREEN_META[screen].title;
  document.getElementById('screenSub').textContent = SCREEN_META[screen].sub;
  document.querySelector('.content').scrollTo({top:0, behavior:'instant'});
  window.scrollTo({top:0, behavior:'instant'});
}

// ---------------- HOME: estadísticas y "ahora compitiendo" (calculados desde los datos reales) ----------------
function renderHomeStats(){
  // Colegios: cuenta filas reales del medallero
  const statColegios = document.getElementById('statColegios');
  if(statColegios) statColegios.textContent = MEDAL_TABLE.length;

  // Pruebas: suma de todas las pruebas en la programación (ambas jornadas)
  const statPruebas = document.getElementById('statPruebas');
  if(statPruebas){
    const totalPruebas = Object.values(SCHEDULE).reduce((sum, day) => sum + day.items.length, 0);
    statPruebas.textContent = totalPruebas;
  }

  // Jornadas: cantidad de días distintos en la programación
  const statJornadas = document.getElementById('statJornadas');
  if(statJornadas) statJornadas.textContent = Object.keys(SCHEDULE).length;
}

function renderHomeNowCompeting(){
  // Busca la primera prueba marcada como EnVivo (la más reciente agregada en la planilla)
  const current = LIVE_EVENTS[0];

  const heroEventName = document.getElementById('heroEventName');
  const liveNowName = document.getElementById('liveNowName');
  const liveNowDetail = document.getElementById('liveNowDetail');
  const liveNowCard = document.getElementById('liveNowCard');
  const heroCard = document.getElementById('heroCard');

  if(current){
    if(heroEventName) heroEventName.textContent = current.name;
    if(liveNowName) liveNowName.textContent = current.name;
    if(liveNowDetail) liveNowDetail.textContent = current.cat;
    if(heroCard) heroCard.style.display = '';
    if(liveNowCard) liveNowCard.style.display = '';
  } else {
    // No hay ninguna prueba EnVivo en este momento
    if(heroCard) heroCard.style.display = 'none';
    if(liveNowCard){
      liveNowCard.style.display = 'block';
      liveNowCard.onclick = null;
      if(liveNowName) liveNowName.textContent = 'Sin pruebas en vivo por ahora';
      if(liveNowDetail) liveNowDetail.textContent = 'Revisa la Programación para ver el próximo horario';
    }
  }
}

// ---------------- HOME: top 3 medallero ----------------
function renderHomeTop3(){
  const top3 = MEDAL_TABLE.slice(0,3);
  const wrap = document.getElementById('homeTop3');
  wrap.innerHTML = top3.map((r,i)=>`
    <div class="school-row">
      <div class="rank-badge rank-${i+1}">${i+1}</div>
      <div class="sname">${r.school}</div>
      <div class="medal-mini">
        <span>🥇${r.gold}</span><span>🥈${r.silver}</span><span>🥉${r.bronze}</span>
      </div>
    </div>
  `).join('');
}

// ---------------- PROGRAMACIÓN ----------------
let currentDay = null;
function renderDayPills(){
  if(!currentDay || !SCHEDULE[currentDay]) currentDay = Object.keys(SCHEDULE)[0];
  const wrap = document.getElementById('dayPills');
  wrap.innerHTML = Object.keys(SCHEDULE).map(key=>{
    const d = SCHEDULE[key];
    return `<button class="day-pill ${key===currentDay?'active':''}" onclick="setDay('${key}')">
      <span class="d">JORNADA</span>${d.label}
    </button>`;
  }).join('');
}
function setDay(key){
  currentDay = key;
  renderDayPills();
  renderTimeline();
}
function renderTimeline(){
  const wrap = document.getElementById('timelineWrap');
  const items = (SCHEDULE[currentDay] && SCHEDULE[currentDay].items) || [];
  if(!items.length){
    wrap.innerHTML = `<div class="muted-note">Aún no hay pruebas programadas para esta jornada.</div>`;
    return;
  }
  wrap.innerHTML = items.map(it=>{
    let cls = '', tag = '';
    if(it.status==='done'){ cls='done'; tag='<span class="tl-tag tag-done">Finalizada</span>'; }
    else if(it.status==='live'){ cls='live'; tag='<span class="tl-tag tag-live">● En vivo</span>'; }
    else if(it.status==='next'){ tag='<span class="tl-tag tag-next">Próxima</span>'; }
    return `
      <div class="tl-item ${cls}">
        <div class="tl-card">
          <div class="tl-time">${it.time} hrs</div>
          <div class="tl-name">${it.name}</div>
          <div style="font-size:11.5px; color:var(--text-soft); margin-top:1px;">${it.cat}</div>
          ${tag}
        </div>
      </div>`;
  }).join('');
}

// ---------------- EN VIVO / RESULTADOS ----------------
function eventCardHTML(ev){
  const badge = ev.status==='live'
    ? `<span class="badge-live"><span class="badge-dot"></span>En vivo</span>`
    : `<span class="badge-final">Final</span>`;
  const rows = ev.results.map(r=>{
    const posClass = r.pos===1?'p1':r.pos===2?'p2':r.pos===3?'p3':'';
    return `
      <div class="result-row">
        <div class="pos-chip ${posClass}">${r.pos}</div>
        <div class="who">
          <div class="athlete">${r.athlete}</div>
          <div class="school">${r.school}</div>
        </div>
        <div class="mark">${r.mark}</div>
      </div>`;
  }).join('');
  return `
    <div class="event-card">
      <div class="ehead">
        <div>
          <div class="en">${ev.name}</div>
          <div class="ec">${ev.cat}</div>
        </div>
        ${badge}
      </div>
      ${rows}
    </div>`;
}

function renderVivoLive(){
  document.getElementById('vivoLive').innerHTML = LIVE_EVENTS.map(eventCardHTML).join('')
    || `<div class="muted-note">No hay competencias en vivo en este momento.</div>`;
}
function renderVivoFinal(){
  document.getElementById('vivoFinal').innerHTML = FINAL_EVENTS_TODAY.map(eventCardHTML).join('');
}

function setVivoTab(tab){
  document.querySelectorAll('#screen-vivo .seg-tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab));
  document.getElementById('vivoLive').style.display = tab==='live' ? 'block':'none';
  document.getElementById('vivoFinal').style.display = tab==='final' ? 'block':'none';
  document.getElementById('vivoHistorico').style.display = tab==='historico' ? 'block':'none';
}

// ---------------- HISTÓRICO ----------------
let currentYear = null;
function renderYearPills(){
  if(!currentYear || !HISTORICAL[currentYear]) currentYear = Object.keys(HISTORICAL)[0];
  const wrap = document.getElementById('yearPills');
  wrap.innerHTML = Object.keys(HISTORICAL).map(y=>
    `<button class="day-pill ${y===currentYear?'active':''}" onclick="setYear('${y}')">${y}</button>`
  ).join('');
}
function setYear(y){
  currentYear = y;
  renderYearPills();
  renderHistoricoList();
}
function renderHistoricoList(){
  const wrap = document.getElementById('historicoList');
  const events = (currentYear && HISTORICAL[currentYear]) || [];
  if(!events.length){
    wrap.innerHTML = `<div class="muted-note">Aún no hay resultados históricos cargados.</div>`;
    return;
  }
  wrap.innerHTML = events.map((ev,idx)=>`
    <div class="accordion-item" id="acc-${idx}">
      <div class="acc-head" onclick="toggleAcc(${idx})">
        <div>
          <div class="an">${ev.event}</div>
          <div class="ac">Edición ${currentYear}</div>
        </div>
        <svg class="acc-chev" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="acc-body">
        <div class="hist-row"><div class="pos-chip p1">1</div><div class="who"><div class="athlete">${ev.first.athlete}</div><div class="school">${ev.first.school}</div></div></div>
        <div class="hist-row"><div class="pos-chip p2">2</div><div class="who"><div class="athlete">${ev.second.athlete}</div><div class="school">${ev.second.school}</div></div></div>
        <div class="hist-row"><div class="pos-chip p3">3</div><div class="who"><div class="athlete">${ev.third.athlete}</div><div class="school">${ev.third.school}</div></div></div>
      </div>
    </div>
  `).join('');
}
function toggleAcc(idx){
  document.getElementById('acc-'+idx).classList.toggle('open');
}

// ---------------- MEDALLERO ----------------
function renderPodium(){
  const top3 = MEDAL_TABLE.slice(0,3);
  if(top3.length<3) return;
  const order = [top3[1], top3[0], top3[2]]; // 2do, 1ro, 3ro visualmente
  const ranks = [2,1,3];
  document.getElementById('podiumWrap').innerHTML = order.map((r,i)=>`
    <div class="podium-col podium-${ranks[i]}">
      <div class="podium-block">${ranks[i]}</div>
      <div class="podium-school">${r.school}</div>
      <div class="podium-pts">${r.total} medallas</div>
    </div>
  `).join('');
}
function renderMedalTable(){
  document.getElementById('medalTableBody').innerHTML = MEDAL_TABLE.map((r,i)=>`
    <tr>
      <td><span class="pos-num">${i+1}</span> <span class="sch-name">${r.school}</span></td>
      <td class="medal-gold">${r.gold}</td>
      <td class="medal-silver">${r.silver}</td>
      <td class="medal-bronze">${r.bronze}</td>
      <td class="medal-total">${r.total}</td>
    </tr>
  `).join('');
}

// ---------------- GALERÍA ----------------
let galleryFilter = 'todas';
const GALLERY_FILTERS = [
  {key:'todas', label:'Todas'},
  {key:'pista', label:'Pista'},
  {key:'podio', label:'Podios'},
  {key:'general', label:'General'},
];
function renderGalleryFilters(){
  document.getElementById('galleryFilters').innerHTML = GALLERY_FILTERS.map(f=>
    `<button class="chip ${f.key===galleryFilter?'active':''}" onclick="setGalleryFilter('${f.key}')">${f.label}</button>`
  ).join('');
}
function setGalleryFilter(key){
  galleryFilter = key;
  renderGalleryFilters();
  renderGalleryGrid();
}
function renderGalleryGrid(){
  const items = galleryFilter==='todas' ? GALLERY : GALLERY.filter(g=>g.filter===galleryFilter);
  document.getElementById('galleryGrid').innerHTML = items.map((g,i)=>`
    <div class="gph ${i===0?'wide':''}" onclick="openLightbox('${g.url}')">
      <img src="${g.url}" alt="${g.cap}" loading="lazy">
      <div class="cap">${g.cap}</div>
    </div>
  `).join('') || `<div class="muted-note" style="grid-column:span 2;">Aún no hay fotos en esta categoría.</div>`;
}
function openLightbox(url){
  document.getElementById('lightboxImg').src = url;
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox(e){
  if(e) e.stopPropagation();
  document.getElementById('lightbox').classList.remove('open');
}

// ---------------- SINCRONIZACIÓN CON GOOGLE SHEETS ----------------
function formatSyncTime(date){
  if(!date) return 'Sin conexión';
  const hh = String(date.getHours()).padStart(2,'0');
  const mm = String(date.getMinutes()).padStart(2,'0');
  return `Actualizado ${hh}:${mm}`;
}
function renderSyncIndicator(){
  const el = document.getElementById('syncIndicator');
  if(!el) return;
  el.textContent = formatSyncTime(window.lastSyncTime);
}
async function manualRefresh(){
  const el = document.getElementById('syncIndicator');
  if(el) el.textContent = 'Actualizando...';
  if(typeof syncAndRender === 'function'){
    await syncAndRender();
  } else {
    initApp();
  }
}

// ---------------- INIT ----------------
function initApp(){
  applyEventInfo();
  renderHomeStats();
  renderHomeNowCompeting();
  renderHomeTop3();
  renderDayPills();
  renderTimeline();
  renderVivoLive();
  renderVivoFinal();
  renderYearPills();
  renderHistoricoList();
  renderPodium();
  renderMedalTable();
  renderGalleryFilters();
  renderGalleryGrid();
  renderSyncIndicator();
}
document.addEventListener('DOMContentLoaded', () => {
  // 1. Muestra de inmediato los datos de ejemplo (data.js) para que la app
  //    nunca se vea vacía mientras carga la conexión a Sheets.
  initApp();

  // 2. Si existe el conector a Google Sheets, intenta cargar datos reales.
  if(typeof syncAndRender === 'function'){
    syncAndRender();
    // 3. Refresca automáticamente cada 30 segundos durante el evento.
    setInterval(syncAndRender, 30000);
  }
});
