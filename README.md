# 🎨 Museo Virtual con Realidad Aumentada

Sistema completo de museo virtual con experiencia de Realidad Aumentada para **Meta Quest 2**. Explora obras de arte de museos famosos (MET, Harvard) en una galería 3D inmersiva.

## 📁 Estructura del Proyecto

```
Frontend_Museo_Virtual/
├── frontend/                    # 🎨 Frontend React + WebXR (NUEVO)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AR/             # Componentes VR/AR para Quest 2
│   │   │   ├── Auth/           # Login y registro
│   │   │   └── Search/         # Búsqueda de obras
│   │   ├── services/           # APIs del backend
│   │   └── App.tsx
│   └── README.md               # Documentación detallada del frontend
│
└── ProyectoDise-o2/            # 🔧 Backend (Microservicios)
    ├── backend/
    │   ├── api-gateway/        # Puerto 3000
    │   ├── auth-service/       # Puerto 3004
    │   ├── composition-service/ # Puerto 3001
    │   ├── museum-proxy-service/ # Puerto 3010
    │   └── adapters/
    │       ├── harvard-adapter/ # Puerto 3013
    │       └── met-adapter/     # Puerto 3012
    └── docker-compose.yml
```

## 🚀 Quick Start

### 1. Backend (Microservicios)

```bash
# Levantar todos los servicios con Docker
cd ProyectoDise-o2
docker-compose up -d

# Verificar que estén corriendo
docker ps

# Ver logs
docker-compose logs -f
```

**URLs del Backend:**
- API Gateway: http://localhost:3000
- Composition Service: http://localhost:3001
- Auth Service: http://localhost:3004
- Harvard Adapter: http://localhost:3013
- MET Adapter: http://localhost:3012

### 2. Frontend (React + WebXR)

```bash
# Instalar y ejecutar
cd frontend
npm install
npm run dev

# Para desarrollo con Quest 2 (expone en la red local)
npm run dev -- --host
```

**Frontend URL:** http://localhost:5173

## 🥽 Uso con Meta Quest 2

### Configuración Rápida

1. **Inicia el backend y frontend** (ver arriba)

2. **Obtén tu IP local**:
   ```powershell
   ipconfig
   # Anota tu IPv4 (ej: 192.168.1.100)
   ```

3. **Configura el frontend para Quest**:
   ```bash
   # En frontend/.env
   VITE_API_URL=http://TU_IP:3000
   ```

4. **En las Meta Quest 2**:
   - Abre **Meta Quest Browser**
   - Navega a: `http://TU_IP:5173`
   - Haz clic en **"Enter VR"**
   - ¡Explora la galería! 🎨

### Controles Quest 2
- **Joystick izquierdo**: Movimiento
- **Joystick derecho**: Rotación
- **Gatillo**: Seleccionar obra
- **Botón A/X**: Cerrar info

Ver [frontend/README.md](./frontend/README.md) para más detalles.

## 🎯 Características Principales

### Backend
✅ Arquitectura de microservicios  
✅ Integración con APIs de Harvard y MET Museum  
✅ Autenticación JWT  
✅ Cache con Redis  
✅ Rate limiting  
✅ Circuit breaker para APIs externas  
✅ Documentación Swagger  

### Frontend
✅ React 18 + TypeScript  
✅ WebXR para Meta Quest 2  
✅ Galería 3D inmersiva  
✅ Búsqueda multi-museo  
✅ Autenticación de usuarios  
✅ Interacción con cuadros 3D  
✅ Iluminación realista  
✅ Navegación VR fluida  

## 📚 Documentación

- **[Frontend README](./frontend/README.md)** - Guía completa del frontend con WebXR
- **[Backend README](./ProyectoDise-o2/README.md)** - Documentación de microservicios
- **[Guía de Pruebas E2E](./ProyectoDise-o2/GUIA_PRUEBAS_E2E.md)**
- **[Docker Setup](./ProyectoDise-o2/DOCKER_README.md)**

## 🛠️ Stack Tecnológico

### Frontend
- React 18
- TypeScript
- Vite
- React Three Fiber
- @react-three/xr (WebXR)
- @react-three/drei
- Three.js
- Axios

### Backend
- Node.js + NestJS
- MongoDB
- Redis
- Docker
- Nginx
- JWT

### APIs Externas
- Harvard Art Museums API
- Metropolitan Museum API

## 🔧 Variables de Entorno

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3000
```

### Backend (ver `ProyectoDise-o2/docker-compose.yml`)
Ya configurado con Docker Compose.

## 📊 Flujo de Uso

1. **Usuario se registra/inicia sesión** → Auth Service (JWT)
2. **Usuario busca "monet"** → Composition Service
3. **Composition orquesta** → Museum Proxy → Harvard + MET Adapters
4. **Resultados consolidados** → Frontend
5. **Renderizado en galería 3D** → React Three Fiber + WebXR
6. **Usuario activa VR** → Meta Quest 2 (modo inmersivo)
7. **Interacción con obras** → Detalles + Favoritos

## 🎨 Capturas de Pantalla

*(Agrega capturas aquí cuando tengas el proyecto corriendo)*

## 🐛 Troubleshooting

### Backend no inicia
```bash
docker-compose down
docker-compose up -d --build
```

### Frontend no conecta con backend
- Verifica que `VITE_API_URL` sea correcta
- Revisa CORS en el backend
- Confirma que los servicios estén corriendo: `docker ps`

### Quest 2 no se conecta
- Ambos dispositivos en la **misma red WiFi**
- Usa `npm run dev -- --host`
- Desactiva firewall temporalmente
- Verifica IP con `ipconfig`

Ver más en [frontend/README.md](./frontend/README.md#-troubleshooting)

## 🚀 Próximas Características

- [ ] Hand tracking de Quest 2
- [ ] Modo AR con Passthrough
- [ ] Tours guiados por voz
- [ ] Multijugador
- [ ] Guardado de favoritos en 3D
- [ ] Exposiciones temporales

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Proyecto académico de museo virtual.

## 👥 Autor

**Jhonayker**  
Meta Quest 2 + React + NestJS

---

**¡Disfruta explorando arte en Realidad Virtual! 🎨🥽**
