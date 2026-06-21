// ============================================================
// DATOS DEMO — VII Olimpiadas Atletismo FEMVO 2026
// Todo el contenido aquí es simulado para fines de prototipo.
// Para producción, reemplazar por llamadas a una API o panel admin.
// ============================================================

let SCHOOLS = [
  "Colegio Valle del Olivo", "Liceo San Ignacio", "Colegio Andes del Pacífico",
  "Escuela Manuel Rodríguez", "Colegio Las Encinas", "Liceo Bicentenario Quillota",
  "Colegio Padre Hurtado", "Escuela República de Chile", "Colegio Santa Teresa",
  "Liceo Industrial La Calera", "Colegio Pukará", "Escuela Los Aromos"
];

// ---------- MEDALLERO (acumulado, en vivo) ----------
let MEDAL_TABLE = [
  { school: "Colegio Valle del Olivo", gold: 7, silver: 4, bronze: 3 },
  { school: "Liceo San Ignacio", gold: 6, silver: 5, bronze: 2 },
  { school: "Colegio Andes del Pacífico", gold: 4, silver: 3, bronze: 5 },
  { school: "Escuela Manuel Rodríguez", gold: 3, silver: 4, bronze: 2 },
  { school: "Colegio Las Encinas", gold: 2, silver: 3, bronze: 4 },
  { school: "Liceo Bicentenario Quillota", gold: 2, silver: 2, bronze: 1 },
  { school: "Colegio Padre Hurtado", gold: 1, silver: 2, bronze: 3 },
  { school: "Escuela República de Chile", gold: 1, silver: 1, bronze: 2 },
  { school: "Colegio Santa Teresa", gold: 1, silver: 0, bronze: 1 },
  { school: "Liceo Industrial La Calera", gold: 0, silver: 2, bronze: 1 },
  { school: "Colegio Pukará", gold: 0, silver: 1, bronze: 2 },
  { school: "Escuela Los Aromos", gold: 0, silver: 0, bronze: 1 },
].map(r => ({...r, total: r.gold + r.silver + r.bronze}))
 .sort((a,b)=> b.gold-a.gold || b.silver-a.silver || b.bronze-a.bronze);

// ---------- PROGRAMACIÓN POR DÍA ----------
let SCHEDULE = {
  "sab": {
    label: "Sáb 27", date: "27 de junio",
    items: [
      { time:"09:00", name:"Ceremonia de apertura", cat:"General", status:"done" },
      { time:"09:30", name:"100m planos — Series Damas", cat:"Cat. 10-11 años", status:"done" },
      { time:"09:50", name:"100m planos — Series Varones", cat:"Cat. 10-11 años", status:"done" },
      { time:"10:20", name:"Lanzamiento de bala — Final", cat:"Cat. 12-13 años · Damas", status:"done" },
      { time:"10:50", name:"Salto largo — Final", cat:"Cat. 12-13 años · Varones", status:"done" },
      { time:"11:30", name:"400m planos — Final", cat:"Cat. 14-15 años · Damas", status:"done" },
      { time:"12:00", name:"100m planos — Final Damas", cat:"Cat. 14-15 años", status:"live" },
      { time:"12:20", name:"100m planos — Final Varones", cat:"Cat. 14-15 años", status:"next" },
      { time:"12:45", name:"Relevo 4x100 — Final", cat:"Cat. 16-18 años · Mixto", status:"pending" },
      { time:"13:15", name:"Receso almuerzo", cat:"General", status:"pending" },
      { time:"14:30", name:"800m planos — Final", cat:"Cat. 16-18 años · Damas", status:"pending" },
      { time:"15:00", name:"Salto alto — Final", cat:"Cat. 16-18 años · Varones", status:"pending" },
    ]
  },
  "dom": {
    label: "Dom 28", date: "28 de junio",
    items: [
      { time:"09:00", name:"110m vallas — Series", cat:"Cat. 16-18 años · Varones", status:"pending" },
      { time:"09:40", name:"1500m planos — Final", cat:"Cat. 14-15 años · Damas", status:"pending" },
      { time:"10:10", name:"Lanzamiento de jabalina — Final", cat:"Cat. 16-18 años · Varones", status:"pending" },
      { time:"10:50", name:"Salto triple — Final", cat:"Cat. 14-15 años · Damas", status:"pending" },
      { time:"11:30", name:"200m planos — Final", cat:"Cat. 12-13 años · Mixto", status:"pending" },
      { time:"12:15", name:"Relevo 4x400 — Final", cat:"Cat. 16-18 años · Mixto", status:"pending" },
      { time:"13:00", name:"Receso almuerzo", cat:"General", status:"pending" },
      { time:"14:30", name:"3000m planos — Final", cat:"Cat. 16-18 años · Varones", status:"pending" },
      { time:"15:15", name:"Premiación general y cierre", cat:"General", status:"pending" },
    ]
  }
};

// ---------- COMPETENCIAS EN VIVO (resultados parciales que se están corriendo ahora) ----------
let LIVE_EVENTS = [
  {
    name: "100m planos — Final Damas",
    cat: "Categoría 14-15 años",
    status: "live",
    results: [
      { pos:1, athlete:"Florencia Muñoz", school:"Colegio Valle del Olivo", mark:"13.21s" },
      { pos:2, athlete:"Antonia Reyes", school:"Liceo San Ignacio", mark:"13.34s" },
      { pos:3, athlete:"Camila Soto", school:"Colegio Andes del Pacífico", mark:"13.40s" },
      { pos:4, athlete:"Valentina Ríos", school:"Colegio Las Encinas", mark:"13.52s" },
    ]
  },
  {
    name: "Salto alto — Final",
    cat: "Categoría 16-18 años · Varones",
    status: "live",
    results: [
      { pos:1, athlete:"Joaquín Pérez", school:"Liceo San Ignacio", mark:"1.78 m" },
      { pos:2, athlete:"Diego Fuentes", school:"Colegio Padre Hurtado", mark:"1.74 m" },
      { pos:3, athlete:"Matías Lobos", school:"Colegio Valle del Olivo", mark:"1.71 m" },
    ]
  }
];

// ---------- COMPETENCIAS FINALIZADAS HOY ----------
let FINAL_EVENTS_TODAY = [
  {
    name: "400m planos — Final",
    cat: "Categoría 14-15 años · Damas",
    status: "final",
    results: [
      { pos:1, athlete:"Martina Vega", school:"Colegio Valle del Olivo", mark:"1:02.4" },
      { pos:2, athlete:"Sofía Carrasco", school:"Escuela Manuel Rodríguez", mark:"1:03.1" },
      { pos:3, athlete:"Isidora Bravo", school:"Liceo San Ignacio", mark:"1:03.8" },
    ]
  },
  {
    name: "Salto largo — Final",
    cat: "Categoría 12-13 años · Varones",
    status: "final",
    results: [
      { pos:1, athlete:"Benjamín Torres", school:"Colegio Andes del Pacífico", mark:"5.12 m" },
      { pos:2, athlete:"Tomás Aguilera", school:"Colegio Valle del Olivo", mark:"5.05 m" },
      { pos:3, athlete:"Ignacio Castro", school:"Liceo Bicentenario Quillota", mark:"4.97 m" },
    ]
  },
  {
    name: "Lanzamiento de bala — Final",
    cat: "Categoría 12-13 años · Damas",
    status: "final",
    results: [
      { pos:1, athlete:"Constanza Díaz", school:"Liceo San Ignacio", mark:"9.84 m" },
      { pos:2, athlete:"Javiera Morales", school:"Colegio Las Encinas", mark:"9.41 m" },
      { pos:3, athlete:"Fernanda Espinoza", school:"Colegio Santa Teresa", mark:"9.10 m" },
    ]
  },
  {
    name: "100m planos — Series Varones",
    cat: "Categoría 10-11 años",
    status: "final",
    results: [
      { pos:1, athlete:"Cristóbal Salas", school:"Escuela República de Chile", mark:"14.02s" },
      { pos:2, athlete:"Agustín Paredes", school:"Colegio Pukará", mark:"14.18s" },
      { pos:3, athlete:"Vicente Maldonado", school:"Colegio Valle del Olivo", mark:"14.25s" },
    ]
  }
];

// ---------- RESULTADOS HISTÓRICOS (años anteriores) ----------
let HISTORICAL = {
  "2025": [
    { event:"100m planos Damas (16-18)", first:{athlete:"Camila Herrera", school:"Liceo San Ignacio"}, second:{athlete:"Daniela Soto", school:"Colegio Valle del Olivo"}, third:{athlete:"Paula Jiménez", school:"Colegio Las Encinas"} },
    { event:"100m planos Varones (16-18)", first:{athlete:"Felipe Araya", school:"Colegio Valle del Olivo"}, second:{athlete:"Cristián Molina", school:"Colegio Andes del Pacífico"}, third:{athlete:"Bastián Núñez", school:"Liceo San Ignacio"} },
    { event:"Salto largo Damas (14-15)", first:{athlete:"Valentina Campos", school:"Colegio Andes del Pacífico"}, second:{athlete:"Antonia Vergara", school:"Colegio Padre Hurtado"}, third:{athlete:"María José Tapia", school:"Liceo San Ignacio"} },
    { event:"800m planos Varones (16-18)", first:{athlete:"Sebastián Rojas", school:"Liceo San Ignacio"}, second:{athlete:"Maximiliano Reyes", school:"Colegio Valle del Olivo"}, third:{athlete:"Joaquín Sandoval", school:"Escuela Manuel Rodríguez"} },
    { event:"Lanzamiento de jabalina Varones (16-18)", first:{athlete:"Rodrigo Ibáñez", school:"Colegio Las Encinas"}, second:{athlete:"Esteban Pizarro", school:"Colegio Valle del Olivo"}, third:{athlete:"Nicolás Bustos", school:"Liceo Bicentenario Quillota"} },
  ],
  "2024": [
    { event:"100m planos Damas (16-18)", first:{athlete:"Josefa Contreras", school:"Colegio Valle del Olivo"}, second:{athlete:"Camila Herrera", school:"Liceo San Ignacio"}, third:{athlete:"Rocío Fernández", school:"Colegio Andes del Pacífico"} },
    { event:"100m planos Varones (16-18)", first:{athlete:"Cristián Molina", school:"Colegio Andes del Pacífico"}, second:{athlete:"Felipe Araya", school:"Colegio Valle del Olivo"}, third:{athlete:"Diego Fuentes", school:"Colegio Padre Hurtado"} },
    { event:"Salto alto Varones (16-18)", first:{athlete:"Joaquín Pérez", school:"Liceo San Ignacio"}, second:{athlete:"Matías Lobos", school:"Colegio Valle del Olivo"}, third:{athlete:"Ignacio Vidal", school:"Escuela República de Chile"} },
    { event:"400m planos Damas (14-15)", first:{athlete:"Martina Vega", school:"Colegio Valle del Olivo"}, second:{athlete:"Florencia Muñoz", school:"Colegio Valle del Olivo"}, third:{athlete:"Antonia Reyes", school:"Liceo San Ignacio"} },
  ],
  "2023": [
    { event:"100m planos Damas (16-18)", first:{athlete:"Daniela Soto", school:"Colegio Valle del Olivo"}, second:{athlete:"Javiera Lara", school:"Liceo San Ignacio"}, third:{athlete:"Camila Herrera", school:"Liceo San Ignacio"} },
    { event:"Lanzamiento de bala Damas (12-13)", first:{athlete:"Constanza Díaz", school:"Liceo San Ignacio"}, second:{athlete:"Javiera Morales", school:"Colegio Las Encinas"}, third:{athlete:"Belén Quiroz", school:"Colegio Pukará"} },
    { event:"Relevo 4x100 Mixto (16-18)", first:{athlete:"Equipo completo", school:"Colegio Valle del Olivo"}, second:{athlete:"Equipo completo", school:"Liceo San Ignacio"}, third:{athlete:"Equipo completo", school:"Colegio Andes del Pacífico"} },
  ]
};

// ---------- GALERÍA DE FOTOS ----------
let GALLERY = [
  { url:"img/g1.svg", cap:"Salida 100m planos", filter:"pista" },
  { url:"img/g2.svg", cap:"Calentamiento previo", filter:"pista" },
  { url:"img/g3.svg", cap:"Podio damas 400m", filter:"podio" },
  { url:"img/g4.svg", cap:"Apertura del encuentro", filter:"general" },
  { url:"img/g1.svg", cap:"Final 100m varones", filter:"pista" },
  { url:"img/g3.svg", cap:"Podio salto largo", filter:"podio" },
];
