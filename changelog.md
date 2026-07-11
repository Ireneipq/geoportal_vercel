# Changelog - Geoportal Inventario Arboreo

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
