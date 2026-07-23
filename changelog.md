# Changelog - Geoportal Inventario Arboreo

## Estado actual: commit 54899f6

---

## 2026-07-12

### Popup capa Arboles - Labels y cursiva en especie
- **Archivos:** `script.js`
- **Cambios en CONFIG:** `campos` migrados de strings a objetos `{f, l, i}` con labels legibles. Campo `especie` tiene flag `i:true` para cursiva.
- **Cambios en buildPopup:** Soporte para flag `i` que envuelve el valor en `<em>`.
- **Labels:** Codigo, Familia, Genero, Especie (cursiva), Nombre comun.

### Thumbnails de mapas base con imagenes reales
- **Archivos:** `script.js`, `styles.css`
- Thumbnails SVGs grises reemplazados por tiles reales (OSM/Esri) en zoom 5.
- `background:#e5e7eb` como fallback.

### Reposicionar mapas base y renombrar
- **Archivos:** `index.html`, `script.js`
- Seccion "Mapa base" movida al fondo del sidebar (debajo de "Participa").
- Nombres: "Calles"/"Satelite" → **"Estandar"** / **"Satelital"**.
- Key interna `satellite` conservada.

---

## 2026-07-11

### Coordenadas del area de estudio
- **Archivos:** `script.js`, `encuesta.html`
- **Antes:** `center: [-2.15, -79.9]`, `zoom: 13`
- **Ahora:** `center: [-0.7432, -90.3038]` (Puerto Ayora, Santa Cruz, Galapagos), `zoom: 14`

### Configuracion inicial
- Repositorio: `https://github.com/Ireneipq/geoportal_vercel`
- Variables de entorno Vercel: `SUPABASE_URL`, `SUPABASE_KEY`

---

## Notas pendientes

- Las capas vias, predios, limites e islas pueden no verse. Revisar en consola (F12) los logs de `loadLayer` para diagnosticar si Supabase devuelve 0 filas o si el campo de geometria tiene nombre distinto (`geom`, `geometry`, `wkb_geometry`, `the_geom`).
- No hay archivo `.env` local. Las credenciales de Supabase se configuran en Vercel.
