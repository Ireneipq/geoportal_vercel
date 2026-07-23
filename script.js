const CONFIG = [
{ id:'vias', nombre:'Vías', tabla:'vias_WGS84', color:'#ff6347', visible:false, campos:[{f:'dpa_nomb_1',l:'Nombre'}] },
{ id:'arboles', nombre:'Árboles', tabla:'arboles_wgs84', color:'#2e7d32', campos:[{f:'codigo',l:'Código'},{f:'familia',l:'Familia'},{f:'genero',l:'Género'},{f:'especie',l:'Especie',i:true},{f:'n_comun',l:'Nombre común'}] },
{ id:'equipamientos', nombre:'Equipamientos', tabla:'equipamientos_wgs84', color:'#e65100', visible:false, campos:[{f:'uso_real',l:'Uso real'},{f:'equip',l:'Equip'},{f:'barrio',l:'Barrio'}] },
{ id:'predios', nombre:'Predios', tabla:'predios_wgs84', color:'#6a1b9a', campos:['clave'] },
{ id:'limites', nombre:'Límites', tabla:'limites_wgs84', color:'#c62828', visible:false, campos:['sector','isla'] },
{ id:'islas', nombre:'Islas', tabla:'islas_wgs84', color:'#00838f', visible:false, campos:['txt'] },
{ id:'encuestas', nombre:'Encuestas', tabla:'encuesta_arbolado', color:'#d4a017', visible:false, campos:[{f:'valoracion',l:'Valoración'},{f:'comentario',l:'Comentario'},{f:'nombre',l:'Encuestado'},{f:'created_at',l:'Fecha'}] }
];

const BASEMAPS = {
standard: {
name:'Estándar',
url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
attribution:'&copy; <a href="https://openstreetmap.org/copyright">OSM</a>',
thumbnail:'https://tile.openstreetmap.org/5/5/5.png'
},
satellite: {
name:'Satelital',
url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
attribution:'&copy; <a href="https://esri.com">Esri</a>',
thumbnail:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/5/5'
}
};

const map = L.map('map', { zoomControl: true, zoom: 14, center: [-0.7432, -90.3038] });

let currentBasemap = 'satellite';
const tileLayers = {};

for (const [key, bm] of Object.entries(BASEMAPS)) {
tileLayers[key] = L.tileLayer(bm.url, { attribution: bm.attribution, maxZoom: 19 });
}
tileLayers['satellite'].addTo(map);

const legend = L.control({ position: 'bottomright' });
let legendDiv = null;
legend.onAdd = function() {
legendDiv = L.DomUtil.create('div', 'map-legend');
updateLegend();
return legendDiv;
};
legend.addTo(map);

function updateLegend() {
if (!legendDiv) return;
let html = '<div class="legend-title">Leyenda</div>';
for (const cfg of CONFIG) {
const chk = document.getElementById('chk-' + cfg.id);
if (chk && chk.checked) {
if (cfg.id === 'equipamientos' && layerMap['equipamientos']) {
const tipos = new Set();
layerMap['equipamientos'].eachLayer(l => { if (l.feature && l.feature.properties.equip) tipos.add(l.feature.properties.equip); });
tipos.forEach(t => {
const c = EQUIP_COLORS[t] || EQUIP_DEFAULT;
html += `<div class="legend-item"><span class="legend-dot" style="background:${c}"></span><span>${t}</span></div>`;
});
} else {
let icon = `<span class="legend-dot" style="background:${cfg.color}"></span>`;
if (cfg.id === 'vias') icon = `<svg width="20" height="14" style="vertical-align:middle"><line x1="0" y1="7" x2="20" y2="7" stroke="${cfg.color}" stroke-width="1.5" stroke-dasharray="6,4"/></svg>`;
if (cfg.id === 'encuestas') icon = '<i class="fas fa-location-dot" style="font-size:14px;color:#d4a017"></i>';
html += `<div class="legend-item">${icon}<span>${cfg.nombre}</span></div>`;
}
}
}
legendDiv.innerHTML = html;
}

initBasemapUI();
initLayerUI();

const EQUIP_COLORS = {
'INSTITUCIONAL':'#FFB3BA','SERVICIO':'#BAF0FF','EDUCATIVO':'#BAE1FF','FINANCIERO':'#FFFFBA',
'SEGURIDAD Y DEFENSA':'#FFD4BA','SANITARIO':'#BAFFC9','CULTO':'#E8BAFF','ADMINISTRATIVO':'#D4BAFF',
'SALUD':'#BAFFC9','RECREATIVO':'#FFD1DC','TURISTICO':'#BAFFEF','MERCADO':'#FFE4BA',
'CAMAL':'#F0D4D4','CENTRO AGRICOLA':'#D4F0D4'
};
const EQUIP_DEFAULT = '#D4D4D4';
const layerMap = {};
const featureCounts = {};

async function fetchAllRows(tabla) {
const res = await fetch(`/api/supabase?tabla=${tabla}`);
if (!res.ok) throw new Error(`Error ${res.status} en ${tabla}`);
return await res.json();
}

function buildPopup(feature, cfg) {
const props = feature.properties || {};
let html = `<div class="popup-header">${cfg.nombre}</div><div class="popup-body"><table>`;
for (const campo of cfg.campos) {
const field = typeof campo === 'string' ? campo : campo.f;
const label = typeof campo === 'string' ? campo.charAt(0).toUpperCase() + campo.slice(1) : campo.l;
const italic = typeof campo === 'object' && campo.i;
let v = props[field];
if (v === null || v === undefined || v === '') v = '—';
if (italic) v = `<em>${v}</em>`;
html += `<tr><td>${label}</td><td>${v}</td></tr>`;
}
html += '</table></div>';
return html;
}

async function loadLayer(cfg) {
const data = await fetchAllRows(cfg.tabla);
if (data.length > 0) {
console.log(`[${cfg.nombre}] Campos disponibles:`, Object.keys(data[0]).join(', '));
if (cfg.id === 'equipamientos') {
const unicos = [...new Set(data.map(r => r.equip).filter(Boolean))];
console.log(`[Equipamientos] Tipos únicos (equip):`, JSON.stringify(unicos));
}
}
const features = [];
let skipped = 0;
const GEOM_KEYS = ['geom','geometry','wkb_geometry','the_geom','geom_column','st_asgeojson','shape','geom_webmercator'];
for (const row of data) {
let geom = null;
for (const k of GEOM_KEYS) {
if (row[k]) { geom = row[k]; break; }
}
if (!geom) {
for (const [k, v] of Object.entries(row)) {
if (k === 'id' || k === 'created_at') continue;
if (typeof v === 'object' && v !== null && v.type && (v.coordinates || v.geometries)) { geom = v; break; }
}
}
if (typeof geom === 'string') {
try { geom = JSON.parse(geom); } catch(e) {
const m = geom.match(/\{[\s\S]*"type"\s*:\s*"(?:Point|LineString|Polygon|MultiPoint|MultiLineString|MultiPolygon|GeometryCollection)"[\s\S]*\}/);
if (m) try { geom = JSON.parse(m[0]); } catch(e2) {}
}
}
if (geom && geom.type && (geom.coordinates || geom.geometries)) {
features.push({ type:'Feature', properties:row, geometry:geom });
} else {
skipped++;
}
}
console.log(`[${cfg.nombre}] Filas: ${data.length}, Geom válidas: ${features.length}, Sin geom: ${skipped}`);
if (features.length === 0 && data.length > 0) {
console.warn(`[${cfg.nombre}] Primera fila (sin geom detectada):`, JSON.stringify(data[0]).substring(0, 500));
}
if (features.length === 0) return null;
const geoLayer = L.geoJSON({ type:'FeatureCollection', features }, {
style: function(feature) {
const isEquip = cfg.id === 'equipamientos';
const fillColor = isEquip ? (EQUIP_COLORS[feature.properties.equip] || EQUIP_DEFAULT) : cfg.color;
return { color: fillColor, weight: cfg.id === 'vias' ? 1.5 : 2, fillColor: fillColor, fillOpacity: isEquip ? 0.7 : (cfg.id === 'vias' ? 0 : 0.25), opacity: isEquip ? 0.9 : (cfg.id === 'vias' ? 0.9 : 0.8), dashArray: cfg.id === 'vias' ? '8, 6' : undefined };
},
pointToLayer: (feature, latlng) => {
if (cfg.id === 'encuestas') {
return L.marker(latlng, { icon: L.divIcon({ className: '', html: '<i class="fas fa-location-dot" style="font-size:22px;color:#d4a017;text-shadow:0 1px 3px rgba(0,0,0,.4)"></i>', iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -22] }) });
}
return L.circleMarker(latlng, { radius: cfg.id === 'arboles' ? 7 : 5, fillColor: cfg.color, color: '#fff', weight: 1.5, fillOpacity: 0.85 });
},
onEachFeature: (feature, layer) => layer.bindPopup(buildPopup(feature, cfg))
});
featureCounts[cfg.id] = features.length;
return geoLayer;
}

function initBasemapUI() {
const container = document.getElementById('basemapGroup');
container.innerHTML = '';
for (const [key, bm] of Object.entries(BASEMAPS)) {
const div = document.createElement('div');
div.className = 'basemap-card' + (key === currentBasemap ? ' active' : '');
div.dataset.key = key;
div.innerHTML = `<img src="${bm.thumbnail}" alt="${bm.name}" loading="lazy"><div class="label">${bm.name}</div>`;
div.addEventListener('click', () => switchBasemap(key));
container.appendChild(div);
}
}

function switchBasemap(key) {
if (key === currentBasemap) return;
currentBasemap = key;
for (const [k, ly] of Object.entries(tileLayers)) map.removeLayer(ly);
tileLayers[key].addTo(map);
document.querySelectorAll('.basemap-card').forEach(el => el.classList.toggle('active', el.dataset.key === key));
}

function initLayerUI() {
const container = document.getElementById('layerList');
container.innerHTML = '';
for (const cfg of CONFIG) {
const checked = cfg.visible !== false;
const div = document.createElement('div');
div.className = 'layer-item';
div.innerHTML = `<div class="color-dot" style="background:${cfg.color}"></div><div class="info"><span class="name">${cfg.nombre}</span></div><label class="switch"><input type="checkbox" id="chk-${cfg.id}" ${checked?'checked':''} onchange="toggleLayer('${cfg.id}')"><span class="track"></span></label>`;
container.appendChild(div);
}
}

function toggleLayer(id) {
const chk = document.getElementById('chk-' + id);
if (chk.checked) {
if (layerMap[id]) {
const loadOrder = [...CONFIG].reverse();
for (const cfg of loadOrder) { if (layerMap[cfg.id]) map.removeLayer(layerMap[cfg.id]); }
for (const cfg of loadOrder) { const ch = document.getElementById('chk-' + cfg.id); if (ch && ch.checked && layerMap[cfg.id]) map.addLayer(layerMap[cfg.id]); }
}
} else {
if (layerMap[id]) map.removeLayer(layerMap[id]);
}
updateStats();
updateLegend();
}

function updateStats() {
let active = 0, total = 0;
for (const cfg of CONFIG) {
const chk = document.getElementById('chk-' + cfg.id);
if (chk && chk.checked && layerMap[cfg.id]) { active++; total += featureCounts[cfg.id] || 0; }
}
document.getElementById('activeCount').textContent = active;
document.getElementById('totalFeatures').textContent = total;
const dot = document.querySelector('.header-status .dot');
if (dot) dot.classList.remove('loading');
}

async function init() {
const statusText = document.getElementById('statusText');
const dot = document.querySelector('.header-status .dot');
if (dot) dot.classList.add('loading');
const grupo = L.featureGroup();
let anyLayer = false;
const loadOrder = [...CONFIG].reverse();
const resultados = [];
for (const cfg of loadOrder) {
try {
if (statusText) statusText.textContent = `Cargando ${cfg.nombre}...`;
const layer = await loadLayer(cfg);
if (layer) {
layerMap[cfg.id] = layer;
const chk = document.getElementById('chk-' + cfg.id);
if (chk && chk.checked) { map.addLayer(layer); layer.eachLayer(l => grupo.addLayer(l)); anyLayer = true; }
resultados.push(`${cfg.nombre}: OK`);
} else {
resultados.push(`${cfg.nombre}: SIN GEOMETRÍA`);
}
} catch (e) { console.error('Error en ' + cfg.nombre, e); resultados.push(`${cfg.nombre}: ERROR - ${e.message}`); }
}
console.log('=== Resumen de carga de capas ===');
resultados.forEach(r => console.log('  ' + r));
if (anyLayer && grupo.getLayers().length > 0) map.fitBounds(grupo.getBounds().pad(0.05));
if (statusText) statusText.textContent = 'Listo';
updateStats();
updateLegend();
if (layerMap['vias']) {
const chkVias = document.getElementById('chk-vias');
if (chkVias && chkVias.checked) {
if (map.getZoom() < 17) map.removeLayer(layerMap['vias']);
}
map.on('zoomend', function() {
const chk = document.getElementById('chk-vias');
if (!chk || !chk.checked || !layerMap['vias']) return;
if (map.getZoom() >= 17) {
if (!map.hasLayer(layerMap['vias'])) map.addLayer(layerMap['vias']);
} else {
if (map.hasLayer(layerMap['vias'])) map.removeLayer(layerMap['vias']);
}
});
}
}

document.addEventListener('DOMContentLoaded', init);

async function generarPDF() {
const btn = document.activeElement;
const original = btn.innerHTML;
btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
btn.disabled = true;
try {
const res = await fetch('/api/supabase?tabla=encuesta_arbolado');
if (!res.ok) throw new Error('Error al obtener datos');
const datos = await res.json();
const { jsPDF } = window.jspdf;
const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

doc.setFontSize(18);
doc.setTextColor(15, 43, 61);
doc.text('Encuesta de Arborizado', 14, 18);
doc.setFontSize(10);
doc.setTextColor(107, 114, 128);
doc.text(`Inventario Arbóreo – Puerto Ayora – Santa Cruz`, 14, 25);
doc.text(`Generado: ${new Date().toLocaleString('es-EC')}  |  Total respuestas: ${datos.length}`, 14, 30.5);

const etiquetaProblemas = {
problema_raices: 'Raíces', problema_ramas: 'Ramas secas', problema_cables: 'Cables',
problema_veredas: 'Veredas', problema_seguridad: 'Seguridad', problema_altura: 'Altura'
};

const headers = [['#', 'Fecha', 'Lat', 'Lon', 'Val.', 'Problemas', 'Comentario', 'Nombre']];
const body = datos.map((r, i) => {
const problemas = Object.entries(etiquetaProblemas).filter(([k]) => r[k]).map(([,v]) => v).join(', ') || '—';
const fecha = r.created_at ? new Date(r.created_at).toLocaleDateString('es-EC') : '—';
return [
i + 1, fecha,
r.lat?.toFixed(4) || '—', r.lon?.toFixed(4) || '—',
r.valoracion || '—', problemas,
r.comentario || '—', r.nombre || '—'
];
});

doc.autoTable({
head: headers, body,
startY: 35,
theme: 'grid',
headStyles: { fillColor: [15, 43, 61], textColor: 255, fontStyle: 'bold', fontSize: 7 },
bodyStyles: { fontSize: 6.5 },
margin: { top: 35, right: 8, bottom: 15, left: 8 },
tableWidth: 'auto',
styles: { cellPadding: 1.5 }
});

doc.save('encuesta_arbolado.pdf');
} catch (err) {
alert('Error al generar PDF: ' + err.message);
console.error(err);
}
btn.innerHTML = original;
btn.disabled = false;
}
