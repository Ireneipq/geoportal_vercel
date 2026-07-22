# Changelog - Geoportal Inventario Arboreo

## 2026-07-12

### Cambio: Reposicionar mapas base y renombrar
- **Archivos afectados:** `index.html`, `script.js`
- **Motivo:** El selector de mapas base estaba en la parte superior del sidebar; se movio debajo de "Participa" (junto al footer). Se renombraron para coincidir con convencion Google Maps.
- **Antes:** Seccion "Mapa base" arriba del sidebar. Nombres: "Calles" / "Satelite".
- **Ahora:** Seccion "Mapa base" al fondo del sidebar. Nombres: "Estandar" / "Satelital".
- **Detalle:** La key interna `satellite` se conservo para mantener compatibilidad con el codigo existente; solo cambio la propiedad `name` display.

---

## 2026-07-11

### Cambio: Coordenadas del area de estudio
- **Archivos afectados:** `script.js`, `encuesta.html`
- **Motivo:** El mapa estaba centrado en `[-2.15, -79.9]` (costa continental Ecuador/Colombia), fuera del area de estudio real.
- **Antes:** `center: [-2.15, -79.9]`, `zoom: 13`
- **Ahora:** `center: [-0.7432, -90.3038]` (Puerto Ayora, Santa Cruz, Galapagos), `zoom: 14`
- **Verificacion:** Las coordenadas `[-0.7432, -90.3038]` corresponden a Puerto Ayora, Santa Cruz, Islas Galapagos.

### Configuracion
- Repositorio remoto: `https://github.com/Ireneipq/geoportal_vercel`
- Git remote ya estaba configurado correctamente.

### Notas
- No se encontro archivo `.env` localmente. Las credenciales de Supabase (`SUPABASE_URL`, `SUPABASE_KEY`) deben configurarse como variables de entorno en Vercel.
