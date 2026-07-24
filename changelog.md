# Changelog - Geoportal Inventario Arboreo

## Estado actual: commit 68c7a51 (sidebar compacto, equipamientos sin verde, mapa base estandar)

---

## 2026-07-23

### Menú de capas - Diseño limpio
- **Archivos:** `script.js`, `styles.css`
- Eliminado el punto de color (`color-dot`) junto al nombre de cada capa
- Solo se muestra nombre de la capa + toggle switch
- Bordes inferiores sutiles entre capas para separación visual
- Padding y espaciado optimizado (11px 14px)

### Leyenda - Fuente pequeña y capitalización uniforme
- **Archivos:** `styles.css`
- Fuente reducida a `.72rem`, puntos de color a 8px
- `text-transform: capitalize` para que solo la primera letra sea mayúscula
- Ejemplo: "INSTITUCIONAL" → "Institucional", "arboles" → "Arboles"
- Tamaño máximo de ancho controlado (180px)

### Leyenda - Equipamientos orden alfabético
- **Archivos:** `script.js`
- Tipos de equipamiento ordenados alfabéticamente con `localeCompare('es')`

### Popups - Tamaño compacto y proporcional
- **Archivos:** `styles.css`
- Fuente reducida a `.72rem` (texto) y `.7rem` (tabla)
- Header y cuerpo con menos padding (6px 10px)
- Altura máxima reducida a 220px
- Labels en gris claro (`#6b7280`) para mejor jerarquía visual
- Border-radius reducido a 6px

### Popup Equipamientos - Campos actualizados
- **Archivos:** `script.js`
- **Antes:** uso_real, equip, barrio
- **Ahora:** uso_actual, barrio, tipo (equip)
- Labels: "Uso actual", "Barrio", "Tipo"

### Equipamientos - Colores distintivos por tipo (10 tipos reales)
- **Archivos:** `script.js`
- Consulta directa a API confirmó 10 tipos en la DB: Institucional, Servicio, Educativo, Financiero, Seguridad, Culto, Administrativo, Salud, Recreativo, Turistico
- **Eliminados:** MERCADO, CAMAL, CENTRO AGRICOLA (no existen en la DB)
- **Corregido:** "SEGURIDAD Y DEFENSA" → "Seguridad" (nombre real en DB)
- Keys del diccionario ahora coinciden con valores exactos de la DB
- Paleta: Violeta, Azul claro, Azul oscuro, Amarillo, Rojo-naranja, Púrpura, Gris oscuro, Verde azulado, Rosa, Cian

### Equipamientos - Colores más distinguibles
- **Archivos:** `script.js`
- Paleta recalibrada para máxima diferenciación visual entre tipos
- Institucional(violeta), Servicio(azul oscuro), Educativo(verde bosque), Financiero(ámbar), Seguridad(rojo), Culto(magenta), Administrativo(gris azulado), Salud(verde oscuro), Recreativo(naranja), Turistico(índigo)

### Sidebar - Rediseño compacto y profesional
- **Archivos:** `styles.css`, `index.html`
- Ancho reducido 320px → 280px, padding 20px → 12px, gap 18px → 12px
- Títulos de sección más pequeños (.62rem)
- Capas más compactas (padding 7px 10px, fuente .78rem)
- Toggle switches más pequeños (32x18px)
- Estadísticas compactas (padding 4px, fuente .75rem)
- Botones Participa con clases CSS (.btn-action, .btn-green, .btn-red) en vez de estilos inline
- Thumbnails de mapa base más compactos (altura fija 52px)
- Footer más reducido

### Sidebar - Fondo gradiente
- **Archivos:** `styles.css`
- Fondo gradiente de #f7f8fa a #eef1f5, combina con tono del header
- Capas con fondo semitransparente blanco (rgba(255,255,255,.6))
- Estadísticas con mismo tratamiento semitransparente
- Separadores sutiles con rgba(0,0,0,.06)

### Botón PDF eliminado
- **Archivos:** `index.html`
- Eliminado botón "Generar PDF encuestas" del sidebar

### Árboles - Triángulos SVG en mapa
- **Archivos:** `script.js`
- **Antes:** circleMarker verde con radio 7
- **Ahora:** Triángulo SVG (12x14px) verde bosque #2e7d32
- Sin borde blanco, solo relleno sólido
- Anclaje en base para que apunte hacia arriba

### Leyenda - Iconos SVG según forma geometrica
- **Archivos:** `script.js`
- Cada capa muestra en la leyenda su forma real del mapa
- Árboles: triángulo verde | Vías: línea punteada | Equipamientos: rectángulo con color por tipo
- Predios/Límites/Islas: rectángulo con color de la capa | Encuestas: pin de ubicación

### Capa Límites - Contorno rojo sin relleno
- **Archivos:** `script.js`
- Color: `#c62828` (rojo), fillOpacity: 0 (solo contorno)
- Weight: 2px
- Leyenda: rectángulo sin relleno borde rojo

### Capa Islas - Contorno amarillo sin relleno
- **Archivos:** `script.js`
- Color: `#f9a825` (amarillo), fillOpacity: 0 (solo contorno)
- Weight: 2px
- Leyenda: rectángulo sin relleno borde amarillo

### Capa Predios - Estilo discreto base de mapa
- **Archivos:** `script.js`
- **Antes:** púrpura `#6a1b9a`, weight 2, fillOpacity 0.25, opacity 0.8
- **Ahora:** gris `#9e9e9e`, weight 0.8 (delgado), fillOpacity 0.15, opacity 0.5
- Diseñado como capa base que no compite con otras capas

### Popup Islas - Campo nam
- **Archivos:** `script.js`
- Popup muestra solo campo `nam` (Nombre)
- Eliminado campo `txt` del popup

### Equipamientos - Sin colores verdes
- **Archivos:** `script.js`
- Educativo: `#2E7D32` (verde) → `#1565C0` (azul oscuro)
- Salud: `#00695C` (verde azulado) → `#00838F` (cian)
- Evita confusión con capa Árboles (verde)

### Sidebar - Sin scrollbar, todo visible
- **Archivos:** `styles.css`
- `overflow-y:hidden` en `.sidebar-scroll`
- Gap reducido 12px → 8px, padding 12px → 10px
- Capas padding 5px, mapa base altura 44px
- Botones padding 7px, footer más compacto

### Mapa base - Estándar por defecto
- **Archivos:** `script.js`
- **Antes:** Satelital por defecto
- **Ahora:** Estándar (OSM) por defecto
- Ambas opciones siguen disponibles

---

## 2026-07-22

### Fix: loadLayer - detección de geometría y diagnóstico
- **Archivos:** `script.js`, `changelog.md`
- **Problema:** Solo buscaba `geom` o `geometry`. Capas como vías/predios/límites/islas fallaban silenciosamente.
- **Solución:** Detección ampliada con lista extendida + auto-detección por forma GeoJSON + regex fallback para strings corruptos.
- Logs de diagnóstico en consola (F12): filas cargadas, geom válidas, sin geom.
- Resumen de carga por capa al iniciar el geoportal.

### Capa Vías - Estilo, popup, orden y zoom
- **Archivos:** `script.js`
- Color: `#1565c0` (azul) → `#ff6347` (tomate)
- Línea: sólida → entrecortada (`dashArray: '8, 6'`), peso 1.5 (delgada)
- Popup: campo `dpa_nomb_1` (Nombre) — corregido nombre real del campo en Supabase
- Leyenda: punto circular → segmento de línea SVG entrecortada
- Orden CONFIG: movida al inicio para que cargue última en Leaflet (encima de todas las capas)
- **Zoom mínimo:** solo visible a zoom ≥ 17 (escala ≈ 1:1.000). Se oculta automáticamente al alejar.

### Capas por defecto al ingresar
- **Archivos:** `script.js`
- **Activas:** Árboles, Predios
- **Desactivadas:** Vías, Equipamientos, Límites, Islas, Encuestas
- El zoom inicial ajusta automáticamente a Árboles + Predios

### Leyenda dinámica
- **Archivos:** `script.js`
- La leyenda del mapa ahora se actualiza al activar/desactivar capas
- Solo muestra los ítems de las capas que están activadas
- Se actualiza en: carga inicial, toggle de capas

### Capa Equipamientos - Colores por tipo (tonos pastel)
- **Archivos:** `script.js`
- Cada valor del campo `equip` se muestra con un color pastel diferente
- Paleta: INSTITUCIONAL(rosa), SERVICIO(celeste), EDUCATIVO(azul), FINANCIERO(amarillo), SEGURIDAD(naranja), SANITARIO/CULTO(verde/morado), ADMINISTRATIVO(azul oscuro), SALUD(verde), RECREATIVO(rosa claro), TURISTICO(turquesa), MERCADO(naranja claro), CAMAL(rosa pálido), CENTRO AGRICOLA(verde pálido)
- `fillOpacity: 0.7`, borde del mismo color
- Diagnóstico: log de tipos únicos de `equip` en consola
- Leyenda: desglosa cada tipo con su color cuando Equipamientos está activa

### Fix: silenciar warnings Leaflet deprecated
- **Archivos:** `index.html`
- `Object.defineProperty` en `MouseEvent.prototype` para `mozPressure` y `mozInputSource`, evitando que Firefox dispare la advertencia de deprecated al Leaflet accederlas.

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

### Diagnóstico: capas sin datos (0 filas)
- **Tablas afectadas:** `vias_WGS84`, `predios_wgs84`, `limites_wgs84`, `islas_wgs84`
- **Causa:** RLS (Row Level Security) activado en Supabase sin política de SELECT para el rol `anon`.
- **Solución aplicada en Supabase:** Habilitar RLS + crear política de SELECT anónimo para las 4 tablas.
- **Verificar:** Recargar el geoportal y comprobar que estadísticas muestra 7 capas activas.

---

## Notas pendientes

- No hay archivo `.env` local. Las credenciales de Supabase se configuran en Vercel.
- Próximo paso pendiente: icono diferente por especie de árbol (actualmente todos son triángulos verdes iguales).
