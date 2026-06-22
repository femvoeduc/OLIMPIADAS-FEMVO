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
      const coordKey = `${lat},${lng}`;
      // Solo recarga el mapa si las coordenadas cambiaron desde la última vez que se aplicaron
      // (evita que el iframe parpadee cada 30s si los datos no han cambiado).
      if(iframe.dataset.coordKey !== coordKey){
        iframe.dataset.coordKey = coordKey;
        iframe.src = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
      }
    }
    // Guardamos las coordenadas para usarlas al abrir Google Maps / Waze desde "Cómo llegar"
    window.VENUE_COORDS = { lat, lng };
  }
  if(info.ComoLlegarTexto){
    const el = document.getElementById('comoLlegarText');
    if(el) el.textContent = info.ComoLlegarTexto;
  }
}

// ---------------- UBICACIÓN: "Cómo llegar" (abrir en Maps o Waze) ----------------
function openComoLlegarMenu(){
  const coords = window.VENUE_COORDS || { lat: -36.81494, lng: -73.02377 }; // Estadio Ester Roa por defecto
  const choice = window.confirm(
    "¿Cómo quieres llegar?\n\nAceptar = Abrir en Google Maps\nCancelar = Abrir en Waze"
  );
  if(choice){
    window.open(`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`, '_blank');
  } else {
    window.open(`https://waze.com/ul?ll=${coords.lat},${coords.lng}&navigate=yes`, '_blank');
  }
}

// ---------------- UBICACIÓN: Servicios del recinto por sector ----------------
const SERVICE_ICONS = {
  bano: '<path d="M5 4v16M19 4v16M5 9h14M9 9V4M15 9V4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  enfermeria: '<rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M12 7v10M7 12h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  alimentacion: '<path d="M5 11h14a1 1 0 0 1 1 1v1a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6v-1a1 1 0 0 1 1-1z" fill="currentColor"/><path d="M7 11V7a2 2 0 0 1 4 0M11 11V6a2 2 0 0 1 4 0v5" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  hidratacion: '<path d="M12 2C12 2 6 10 6 15a6 6 0 0 0 12 0c0-5-6-13-6-13z" fill="currentColor"/>',
  delegaciones: '<circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="17" cy="8" r="2.5" stroke="currentColor" stroke-width="1.6" fill="none" opacity="0.6"/><path d="M15 14c2.8.3 5 2.7 5 6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.6"/>',
  acceso: '<path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" stroke="currentColor" stroke-width="1.8" fill="none"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="1.8" fill="none"/>',
};
function serviceIconSVG(iconKey){
  return SERVICE_ICONS[iconKey] || SERVICE_ICONS['acceso'];
}
function renderServiciosPanel(){
  const panel = document.getElementById('serviciosPanel');
  if(!panel) return;
  const services = VENUE_SERVICES || [];
  if(!services.length){
    panel.innerHTML = `<div class="muted-note">Aún no hay servicios cargados para este recinto.</div>`;
    return;
  }
  panel.innerHTML = services.map(s => `
    <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-top:1px solid #F0F2F6;">
      <div style="width:34px;height:34px;border-radius:10px;background:var(--navy-100);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="color:var(--navy-700);">${serviceIconSVG(s.icon)}</svg>
      </div>
      <div style="flex:1;">
        <div style="font-weight:700; font-size:13px;">${s.name}</div>
      </div>
      <div style="font-size:11.5px; font-weight:700; color:var(--navy-700); background:var(--navy-100); padding:4px 10px; border-radius:100px; flex-shrink:0;">${s.sector}</div>
    </div>
  `).join('');
}
function toggleServicios(){
  const panel = document.getElementById('serviciosPanel');
  const chev = document.getElementById('serviciosChev');
  if(!panel) return;
  const isOpen = panel.style.display === 'block';
  panel.style.display = isOpen ? 'none' : 'block';
  if(chev) chev.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
  if(!isOpen) renderServiciosPanel();
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
// ---------------- HOME: cuenta regresiva al inicio del evento ----------------
// Lee la fecha/hora de inicio desde la pestaña Info (campo FechaInicioCuenta,
// formato AAAA-MM-DD HH:MM:SS) y muestra un contador en vivo. Una vez que esa
// fecha ya pasó, el contador se oculta y se muestra la tarjeta normal de "ahora compitiendo".
let countdownInterval = null;

function pad2(n){ return String(n).padStart(2,'0'); }

function startCountdown(targetDate){
  const card = document.getElementById('countdownCard');
  const heroCard = document.getElementById('heroCard');
  if(!card) return;

  if(countdownInterval) clearInterval(countdownInterval);

  function tick(){
    const now = new Date();
    const diff = targetDate - now;
    if(diff <= 0){
      // El evento ya comenzó: ocultamos el contador y dejamos la tarjeta normal visible
      card.style.display = 'none';
      clearInterval(countdownInterval);
      return;
    }
    card.style.display = 'block';
    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const mins = Math.floor((diff / (1000*60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    const elD = document.getElementById('cdDays');
    const elH = document.getElementById('cdHours');
    const elM = document.getElementById('cdMins');
    const elS = document.getElementById('cdSecs');
    if(elD) elD.textContent = pad2(days);
    if(elH) elH.textContent = pad2(hours);
    if(elM) elM.textContent = pad2(mins);
    if(elS) elS.textContent = pad2(secs);
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

function renderCountdown(){
  const info = window.EVENT_INFO;
  const dateText = document.getElementById('countdownDate');
  // Valor por defecto: 1 de octubre de 2026, 8:30 hrs (según lo informado para este evento)
  let targetStr = (info && info.FechaInicioCuenta) ? String(info.FechaInicioCuenta).trim() : '2026-10-01 08:30:00';
  const target = new Date(targetStr.replace(' ', 'T'));
  if(isNaN(target.getTime())){
    const card = document.getElementById('countdownCard');
    if(card) card.style.display = 'none';
    return;
  }
  if(dateText){
    const opciones = { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' };
    dateText.textContent = target.toLocaleDateString('es-CL', opciones).replace(',', ' ·') + ' hrs';
  }
  startCountdown(target);
}

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

// ---------------- Íconos contextuales según tipo de actividad ----------------
// Detecta palabras clave en el nombre/categoría de una prueba y devuelve el
// SVG e ícono de fondo adecuados (ceremonia, almuerzo, carrera, salto, lanzamiento, relevo...)
const ACTIVITY_ICONS = [
  { keywords: ['apertura', 'ceremonia', 'inauguracion', 'inauguración', 'cierre', 'clausura', 'premiacion', 'premiación'],
    color: '#FFD23F',
    svg: '<path d="M12 2L4 7v2l8 4 8-4V7l-8-5z" fill="currentColor"/><path d="M4 11v6l8 4 8-4v-6l-8 4-8-4z" fill="currentColor" opacity="0.6"/>' },
  { keywords: ['almuerzo', 'receso', 'colación', 'colacion', 'break'],
    color: '#F2994A',
    svg: '<path d="M5 11h14a1 1 0 0 1 1 1v1a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6v-1a1 1 0 0 1 1-1z" fill="currentColor"/><path d="M7 11V7a2 2 0 0 1 4 0M11 11V6a2 2 0 0 1 4 0v5" stroke="currentColor" stroke-width="1.5" fill="none"/>' },
  { keywords: ['salto alto', 'salto largo', 'salto triple', 'salto'],
    color: '#10477f',
    svg: '<path d="M3 20h6M15 4l4 4-9 9-4-4 9-9z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
  { keywords: ['lanzamiento', 'bala', 'jabalina', 'disco', 'martillo'],
    color: '#0c3560',
    svg: '<circle cx="7" cy="7" r="3" fill="currentColor"/><path d="M9 9l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  { keywords: ['relevo', 'posta', '4x100', '4 x 100', '4x400', '4 x 400'],
    color: '#F2994A',
    svg: '<path d="M4 17l5-5-5-5M11 17l5-5-5-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 7h3v3M17 17h3v-3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
  { keywords: ['vallas', '110m', '100m vallas', '400m vallas'],
    color: '#10477f',
    svg: '<path d="M2 18h20M6 18V10M6 10h0M10 18v-8M14 18v-8M18 18v-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 10h4M8 10h4M12 10h4M16 10h4" stroke="currentColor" stroke-width="2"/>' },
];
const DEFAULT_ACTIVITY_ICON = {
  color: '#F2994A',
  svg: '<path d="M12 2C12 2 8 7 8 11.5C8 14 9.5 16 12 16C14.5 16 16 14 16 11.5C16 9.8 15 8 14 6.5C14 8 13 9 12 9C11 9 11.5 7 11.5 6C11.5 4.5 12 3 12 2Z" fill="currentColor"/>'
};

function getActivityIcon(name){
  const lower = (name || '').toLowerCase();
  for(const entry of ACTIVITY_ICONS){
    if(entry.keywords.some(kw => lower.includes(kw))){
      return entry;
    }
  }
  return DEFAULT_ACTIVITY_ICON;
}

function renderActivityIconInto(elementId, activityName){
  const el = document.getElementById(elementId);
  if(!el) return;
  const icon = getActivityIcon(activityName);
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" style="color:${icon.color}">${icon.svg}</svg>`;
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
    renderActivityIconInto('liveNowIcon', current.name);
  } else {
    // No hay ninguna prueba EnVivo en este momento
    if(heroCard) heroCard.style.display = 'none';
    if(liveNowCard){
      liveNowCard.style.display = 'block';
      liveNowCard.onclick = null;
      if(liveNowName) liveNowName.textContent = 'Sin pruebas en vivo por ahora';
      if(liveNowDetail) liveNowDetail.textContent = 'Revisa la Programación para ver el próximo horario';
    }
    renderActivityIconInto('liveNowIcon', '');
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
// ---------------- Recinto según tipo de prueba ----------------
// Regla fija: el lanzamiento de bala se realiza en el Estadio Atlético Militar;
// todo el resto del programa se realiza en el Estadio Municipal Ester Roa Rebolledo.
function getVenueForActivity(name){
  const lower = (name || '').toLowerCase();
  if(lower.includes('bala')){
    return 'Estadio Atlético Militar';
  }
  return 'Estadio Municipal Ester Roa Rebolledo';
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
    const venue = getVenueForActivity(it.name);
    const venueTag = venue !== 'Estadio Municipal Ester Roa Rebolledo'
      ? `<div style="font-size:11px; color:#C9531C; font-weight:600; margin-top:4px;">📍 ${venue}</div>`
      : '';
    return `
      <div class="tl-item ${cls}">
        <div class="tl-card">
          <div class="tl-time">${it.time} hrs</div>
          <div class="tl-name">${it.name}</div>
          <div style="font-size:11.5px; color:var(--text-soft); margin-top:1px;">${it.cat}</div>
          ${venueTag}
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
  const venue = getVenueForActivity(ev.name);
  const venueLine = venue !== 'Estadio Municipal Ester Roa Rebolledo'
    ? `<div style="font-size:11px; color:#C9531C; font-weight:600; margin-top:2px;">📍 ${venue}</div>`
    : '';
  return `
    <div class="event-card">
      <div class="ehead">
        <div>
          <div class="en">${ev.name}</div>
          <div class="ec">${ev.cat}</div>
          ${venueLine}
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
  renderCountdown();
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
