# Museo Virtual con Realidad Aumentada

Sistema de museo virtual con experiencia de Realidad Aumentada para Meta Quest 2. Permite explorar obras de arte de museos famosos (MET, Harvard Art Museums) en una galería 3D inmersiva.

## Estructura del Proyecto

```
Frontend_Museo_Virtual/
├── frontend/                    # Frontend React + WebXR
│   ├── src/
│   │   ├── components/
│   │   │   ├── AR/             # Componentes VR/AR
│   │   │   ├── Auth/           # Autenticación
│   │   │   ├── Search/         # Búsqueda
│   │   │   └── Favorites/      # Favoritos
│   │   ├── services/           # Comunicación con backend
│   │   └── App.tsx
│   └── package.json
│
└── ProyectoDise-o2/            # Backend (Microservicios)
    ├── backend/
    │   ├── auth-service/       # Puerto 3001
    │   ├── composition-service/ # Puerto 3002
    │   ├── museum-proxy-service/ # Puerto 3010
    │   └── adapters/
    │       ├── harvard-adapter/ # Puerto 3013
    │       └── met-adapter/     # Puerto 3012
    └── docker-compose.yml
```

## Iniciar el Proyecto

## Iniciar el Proyecto

### Backend

```bash
cd ProyectoDise-o2
docker-compose up -d
```

Servicios disponibles:
- Auth Service: http://localhost:3001
- Composition Service: http://localhost:3002
- Museum Proxy: http://localhost:3010
- Harvard Adapter: http://localhost:3013
- MET Adapter: http://localhost:3012

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host
```

Frontend disponible en: https://localhost:5173

## Uso con Meta Quest 2

## Uso con Meta Quest 2

1. Obtener IP local:
   ```bash
   ipconfig
   ```

2. Asegurarse de que PC y Quest 2 estén en la misma red WiFi

3. En las Meta Quest 2:
   - Abrir Meta Quest Browser
   - Navegar a: `https://TU_IP:5173`
   - Aceptar certificado autofirmado
   - Hacer clic en "Enter VR"

Controles:
- Joystick izquierdo: Movimiento
- Joystick derecho: Rotación
- Gatillo: Seleccionar obra
- Botón A/X: Cerrar información

## Características

### Backend
- Arquitectura de microservicios
- Integración con APIs de Harvard y MET Museum
- Autenticación JWT
- Sistema de favoritos
- Historial de búsquedas
- Rate limiting

### Frontend
- React 18 + TypeScript
- WebXR para Meta Quest 2
- Galería 3D con Three.js
- Búsqueda multi-museo
- Sistema de autenticación
- Gestión de favoritos
- HTTPS automático para VR

## Stack Tecnológico

**Frontend:** React, TypeScript, Vite, Three.js, React Three Fiber, @react-three/xr

**Backend:** Node.js, NestJS, MongoDB, Docker

**APIs:** Harvard Art Museums API, Metropolitan Museum API

## Endpoints Principales

### Auth Service (Puerto 3001)
- POST `/auth/register` - Registro de usuario
- POST `/auth/login` - Inicio de sesión
- POST `/users/:id/favorites` - Agregar favorito
- DELETE `/users/:id/favorites/:artworkId` - Eliminar favorito
- GET `/users/:id/favorites` - Obtener favoritos

### Composition Service (Puerto 3002)
- GET `/api/artworks/search?query=monet&museums=met,harvard` - Búsqueda de obras


Proyecto académico de museo virtual.
