// ============================================================
// CONECTOR CON GOOGLE SHEETS
// Lee la planilla pública y la transforma a las estructuras
// que usa render.js (MEDAL_TABLE, SCHEDULE, LIVE_EVENTS, etc).
//
// IMPORTANTE: reemplaza SHEET_ID por el ID de tu planilla.
// Lo encuentras en la URL de tu Google Sheet:
// https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
// ============================================================

const SHEET_ID = "1ip5Z7rn_jA7yEElOcxUVQ85eyvoc_RRY";

// No tocar: construye la URL de lectura para cada pestaña
function sheetUrl(tabName){
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;
}

// Google envuelve el JSON en "google.visualization.Query.setResponse(...)"
// Esta función limpia ese envoltorio y devuelve filas como arreglos de objetos simples.
//
// Nota importante: Google Sheets, al exportar una pestaña vía gviz/tq, no siempre
// entrega un encabezado limpio en data.table.cols[i].label. Dos casos problemáticos:
// (1) Si la fila 1 no está inmovilizada/congelada, el label llega vacío o genérico
//     ("A","B","C"), y la fila 1 real aparece como un dato más.
// (2) Incluso con la fila 1 congelada, si Google detecta ambigüedad sobre el tipo
//     de columna, puede generar un label que CONCATENA el encabezado real con
//     varias muestras de valores de esa columna, separados por espacios (por
//     ejemplo "Campo NombreEvento Recinto Direccion" en vez de solo "Campo").
// Ambos casos se corrigen aquí para que la app no dependa de configuraciones
// frágiles de formato en la planilla.
async function fetchSheetTab(tabName){
  const res = await fetch(sheetUrl(tabName));
  const text = await res.text();
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  const data = JSON.parse(text.substring(jsonStart, jsonEnd + 1));

  let cols = data.table.cols.map(c => (c.label || '').trim());
  let dataRows = data.table.rows;

  // Caso 1: ¿Google no detectó encabezados? (labels vacíos o genéricos tipo "A","B","C")
  const looksGeneric = cols.every((c, i) => c === '' || c === String.fromCharCode(65 + i));
  if(looksGeneric && dataRows.length){
    cols = dataRows[0].c.map(cell => (cell ? String(cell.v).trim() : ''));
    dataRows = dataRows.slice(1);
  } else {
    // Caso 2: label concatenado (varias palabras separadas por espacio donde
    // debería haber un solo nombre de columna corto). Nos quedamos solo con
    // la primera palabra, que es siempre el encabezado real verdadero.
    cols = cols.map(c => {
      if(c.includes(' ') && c.split(' ').length > 1){
        return c.split(' ')[0];
      }
      return c;
    });
  }

  const rows = dataRows.map(r => {
    const obj = {};
    cols.forEach((colName, i) => {
      const cell = r.c[i];
      obj[colName] = cell ? (cell.f !== undefined ? cell.f : cell.v) : '';
    });
    return obj;
  });
  return rows;
}

// ---------- Transformadores: de filas de Sheets a las variables que usa render.js ----------

function buildMedalTable(rows){
  return rows
    .filter(r => r.Colegio && String(r.Colegio).trim() !== '')
    // Ignora filas de nota/ayuda accidentales (frases largas no son nombres de colegio reales)
    .filter(r => String(r.Colegio).trim().length <= 60)
    .map(r => ({
      school: String(r.Colegio).trim(),
      gold: Number(r.Oro) || 0,
      silver: Number(r.Plata) || 0,
      bronze: Number(r.Bronce) || 0,
    }))
    .map(r => ({ ...r, total: r.gold + r.silver + r.bronze }))
    .sort((a,b)=> b.gold-a.gold || b.silver-a.silver || b.bronze-a.bronze);
}

function buildSchedule(rows){
  const dayMeta = {
    "Sabado": { label:"Sáb", date:"" },
    "Domingo": { label:"Dom", date:"" },
  };
  const schedule = {};
  rows
    .filter(r => r.Dia && String(r.Dia).trim().length <= 20)
    .forEach(r => {
    const dayKey = String(r.Dia).trim();
    if(!schedule[dayKey]){
      const meta = dayMeta[dayKey] || { label: dayKey.slice(0,3), date:"" };
      schedule[dayKey] = { label: meta.label, date: meta.date, items: [] };
    }
    const statusMap = { "Finalizada":"done", "EnVivo":"live", "Proxima":"next", "Pendiente":"pending" };
    schedule[dayKey].items.push({
      time: String(r.Hora || '').trim(),
      name: String(r.Prueba || '').trim(),
      cat: String(r.Categoria || '').trim(),
      status: statusMap[String(r.Estado || '').trim()] || "pending",
    });
  });
  return schedule;
}

function buildLiveAndFinal(rows){
  const grouped = {};
  rows
    .filter(r => r.Prueba && String(r.Prueba).trim().length <= 80)
    .forEach(r => {
    const key = r.Prueba + "||" + r.Categoria;
    if(!grouped[key]){
      grouped[key] = {
        name: String(r.Prueba).trim(),
        cat: String(r.Categoria).trim(),
        status: String(r.Estado).trim() === "EnVivo" ? "live" : "final",
        results: []
      };
    }
    grouped[key].results.push({
      pos: Number(r.Posicion) || (grouped[key].results.length + 1),
      athlete: String(r.Atleta || '').trim(),
      school: String(r.Colegio || '').trim(),
      mark: String(r.Marca || '').trim(),
    });
  });
  const all = Object.values(grouped);
  all.forEach(ev => ev.results.sort((a,b)=> a.pos - b.pos));
  return {
    live: all.filter(ev => ev.status === "live"),
    final: all.filter(ev => ev.status === "final"),
  };
}

function buildGallery(rows){
  return rows
    .filter(r => r.URL_Imagen && String(r.URL_Imagen).trim().startsWith('http'))
    .map(r => ({
      url: String(r.URL_Imagen).trim(),
      cap: String(r.Descripcion || '').trim(),
      filter: String(r.Categoria || 'general').trim().toLowerCase(),
    }));
}

function buildInfo(rows){
  const info = {};
  rows.filter(r => r.Campo).forEach(r => {
    info[String(r.Campo).trim()] = r.Valor;
  });
  return info;
}

function buildVenueServices(rows){
  return rows
    .filter(r => r.Servicio && String(r.Servicio).trim() !== '')
    .map(r => ({
      name: String(r.Servicio).trim(),
      sector: String(r.Sector || '').trim(),
      icon: String(r.Icono || 'acceso').trim().toLowerCase(),
    }));
}

// ---------- Carga principal ----------
// Se ejecuta al abrir la app. Si Google Sheets no responde
// (sin internet, planilla no compartida, etc.), se mantienen
// los datos de ejemplo definidos en data.js como respaldo.

async function loadFromSheets(){
  try {
    const [medalRows, schedRows, liveRows, galRows, infoRows, servRows] = await Promise.all([
      fetchSheetTab("Medallero"),
      fetchSheetTab("Programacion"),
      fetchSheetTab("EnVivo"),
      fetchSheetTab("Galeria"),
      fetchSheetTab("Info"),
      fetchSheetTab("Servicios"),
    ]);

    if(medalRows.length) MEDAL_TABLE = buildMedalTable(medalRows);
    if(schedRows.length) SCHEDULE = buildSchedule(schedRows);
    if(liveRows.length){
      const { live, final } = buildLiveAndFinal(liveRows);
      LIVE_EVENTS = live;
      FINAL_EVENTS_TODAY = final;
    }
    if(galRows.length) GALLERY = buildGallery(galRows);
    if(infoRows.length) window.EVENT_INFO = buildInfo(infoRows);
    if(servRows.length) VENUE_SERVICES = buildVenueServices(servRows);

    return true;
  } catch (err){
    console.warn("No se pudo conectar a Google Sheets, usando datos de ejemplo.", err);
    return false;
  }
}

// Marca de cuándo se actualizaron los datos por última vez (para mostrar en la UI)
window.lastSyncTime = null;

async function syncAndRender(){
  const ok = await loadFromSheets();
  window.lastSyncTime = new Date();
  if(typeof initApp === 'function') initApp();
  return ok;
}
