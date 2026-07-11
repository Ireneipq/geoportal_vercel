const CONFIG = [
{ id:'arboles', nombre:'Árboles', tabla:'arboles_wgs84', color:'#2e7d32', campos:['codigo','familia','genero','especie','n_comun'] },
{ id:'vias', nombre:'Vías', tabla:'vias_WGS84', color:'#1565c0', campos:[{f:'dpa_nombre_1',l:'Nombre'},{f:'tipo_de_ro',l:'Tipo de rodadura'},{f:'Ciclovia',l:'Ciclovía'},{f:'sentido',l:'Sentido'}] },
{ id:'equipamientos', nombre:'Equipamientos', tabla:'equipamientos_wgs84', color:'#e65100', campos:[{f:'uso_real',l:'Uso real'},{f:'equip',l:'Equip'},{f:'barrio',l:'Barrio'}] },
{ id:'predios', nombre:'Predios', tabla:'predios_wgs84', color:'#6a1b9a', campos:['clave'] },
{ id:'limites', nombre:'Límites', tabla:'limites_wgs84', color:'#c62828', campos:['sector','isla'] },
{ id:'islas', nombre:'Islas', tabla:'islas_wgs84', color:'#00838f', campos:['txt'] },
{ id:'encuestas', nombre:'Encuestas', tabla:'encuesta_arbolado', color:'#d4a017', visible:false, campos:[{f:'valoracion',l:'Valoración'},{f:'comentario',l:'Comentario'},{f:'nombre',l:'Encuestado'},{f:'created_at',l:'Fecha'}] }
];

const BASEMAPS = {
street: {
name:'Calles',
url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
attribution:'&copy; <a href="https://openstreetmap.org/copyright">OSM</a>',
thumbnail:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="100" viewBox="0 0 160 100"%3E%3Crect fill="%23f5f0e1" width="160" height="100"/%3E%3Crect fill="%23e8e0c8" x="20" y="10" width="8" height="80" rx="1"/%3E%3Crect fill="%23e8e0c8" x="130" y="10" width="8" height="80" rx="1"/%3E%3Crect fill="%23e8e0c8" x="30" y="45" width="100" height="6" rx="1"/%3E%3Crect fill="%23d4c9a0" x="40" y="20" width="15" height="15" rx="2"/%3E%3Crect fill="%23d4c9a0" x="80" y="55" width="20" height="15" rx="2"/%3E%3Ccircle fill="%234ade80" cx="50" cy="52" r="4"/%3E%3Ccircle fill="%234ade80" cx="95" cy="38" r="4"/%3E%3Cpath fill="%23e65100" d="M60 70h5v5h-5zM70 70h5v5h-5zM80 70h5v5h-5z" opacity=".6"/%3E%3C/svg%3E'
},
satellite: {
name:'Satélite',
url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
attribution:'&copy; <a href="https://esri.com">Esri</a>',
thumbnail:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="100" viewBox="0 0 160 100"%3E%3Crect fill="%23263b4a" width="160" height="100"/%3E%3Crect fill="%233a5a6f" x="10" y="5" width="30" height="30" rx="4" opacity=".5"/%3E%3Crect fill="%233a5a6f" x="70" y="40" width="40" height="25" rx="4" opacity=".5"/%3E%3Crect fill="%233a5a6f" x="110" y="65" width="35" height="20" rx="4" opacity=".4"/%3E%3Ccircle fill="%234ade80" cx="45" cy="48" r="3"/%3E%3Ccircle fill="%234ade80" cx="90" cy="32" r="3"/%3E%3Cpath fill="%23e65100" d="M55 68h4v4h-4zM64 68h4v4h-4zM73 68h4v4h-4z" opacity=".5"/%3E%3C/svg%3E'
}
};

const map = L.map('map', { zoomControl: true, zoom: 13, center: [-2.15, -79.9] });

let currentBasemap = 'satellite';
const tileLayers = {};

for (const [key, bm] of Object.entries(BASEMAPS)) {
tileLayers[key] = L.tileLayer(bm.url, { attribution: bm.attribution, maxZoom: 19 });
}
tileLayers['satellite'].addTo(map);

const legend = L.control({ position: 'bottomright' });
legend.onAdd = function() {
const div = L.DomUtil.create('div', 'map-legend');
let html = '<div class="legend-title">Leyenda</div>';
for (const cfg of CONFIG) {
let icon = `<span class="legend-dot" style="background:${cfg.color}"></span>`;
if (cfg.id === 'encuestas') icon = '<i class="fas fa-location-dot" style="font-size:14px;color:#d4a017"></i>';
html += `<div class="legend-item">${icon}<span>${cfg.nombre}</span></div>`;
}
div.innerHTML = html;
return div;
};
legend.addTo(map);

initBasemapUI();
initLayerUI();

const layerMap = {};
const featureCounts = {};

async function fetchAllRows(tabla) {
const rows = [];
let from = 0;
const limit = 1000;
while (true) {
const res = await fetch(`/api/supabase?tabla=${tabla}&limit=${limit}&offset=${from}`);
if (!res.ok) throw new Error(`Error ${res.status} en ${tabla}`);
const data = await res.json();
rows.push(...data);
if (data.length < limit) break;
from += limit;
}
return rows;
}

function buildPopup(feature, cfg) {
const props = feature.properties || {};
let html = `<div class="popup-header">${cfg.nombre}</div><div class="popup-body"><table>`;
for (const campo of cfg.campos) {
const field = typeof campo === 'string' ? campo : campo.f;
const label = typeof campo === 'string' ? campo.charAt(0).toUpperCase() + campo.slice(1) : campo.l;
let v = props[field];
if (v === null || v === undefined || v === '') v = '—';
html += `<tr><td>${label}</td><td>${v}</td></tr>`;
}
html += '</table></div>';
return html;
}

async function loadLayer(cfg) {
const data = await fetchAllRows(cfg.tabla);
const features = [];
for (const row of data) {
let geom = row.geom || row.geometry;
if (typeof geom === 'string') { try { geom = JSON.parse(geom); } catch(e) {} }
if (geom && geom.type) {
features.push({ type:'Feature', properties:row, geometry:geom });
}
}
if (features.length === 0) return null;
const geoLayer = L.geoJSON({ type:'FeatureCollection', features }, {
style: { color: cfg.color, weight: cfg.id === 'vias' ? 3 : 2, fillOpacity: 0.25, opacity: cfg.id === 'vias' ? 0.9 : 0.8 },
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
for (const cfg of loadOrder) {
try {
if (statusText) statusText.textContent = `Cargando ${cfg.nombre}...`;
const layer = await loadLayer(cfg);
if (layer) {
layerMap[cfg.id] = layer;
const chk = document.getElementById('chk-' + cfg.id);
if (chk && chk.checked) { map.addLayer(layer); layer.eachLayer(l => grupo.addLayer(l)); anyLayer = true; }
}
} catch (e) { console.error('Error en ' + cfg.nombre, e); }
}
if (anyLayer && grupo.getLayers().length > 0) map.fitBounds(grupo.getBounds().pad(0.05));
if (statusText) statusText.textContent = 'Listo';
updateStats();
}

document.addEventListener('DOMContentLoaded', init);
