# Instrucciones de Uso - Museo Virtual AR

## 🚀 Inicio Rápido

### 1️⃣ Levantar el Backend

```powershell
cd ProyectoDise-o2
docker-compose up -d
```

Verifica que los servicios estén corriendo:
```powershell
docker ps
```

### 2️⃣ Iniciar el Frontend

```powershell
cd frontend
npm install
npm run dev
```

Accede en tu navegador: **http://localhost:5173**

---

## 🥽 Configuración para Meta Quest 2

### Paso 1: Preparar el Servidor Local

1. **Obtén tu dirección IP local**:
   ```powershell
   ipconfig
   # Busca "Dirección IPv4" (ejemplo: 192.168.1.100)
   ```

2. **Configura el archivo `.env`** en `frontend/.env`:
   ```env
   VITE_API_URL=http://192.168.1.100:3000
   ```
   *(Reemplaza con tu IP)*

3. **Reinicia el frontend con exposición en red**:
   ```powershell
   npm run dev -- --host
   ```

### Paso 2: Conectar Meta Quest 2

1. **Enciende tus Meta Quest 2**
2. **Abre el navegador** (Meta Quest Browser o Wolvic)
3. **Navega a**: `http://TU_IP:5173` (ej: `http://192.168.1.100:5173`)
4. **Registra una cuenta** o inicia sesión
5. **Busca obras de arte** (ej: "monet", "picasso")
6. **Haz clic en "Enter VR"** (botón azul en la parte superior)

### Paso 3: Navegar en VR

**Controles Quest 2:**
- 🕹️ **Joystick izquierdo**: Movimiento (teletransporte)
- 🔄 **Joystick derecho**: Rotar vista
- 🎯 **Gatillo**: Seleccionar obra de arte
- ❌ **Botón A/X**: Cerrar información

---

## 🎨 Flujo de Uso Completo

### En el Navegador Web (PC)

1. **Regístrate/Inicia sesión**
   - Email y contraseña
   - Mínimo 6 caracteres

2. **Busca Obras de Arte**
   - Escribe términos como: "monet", "impressionist", "renaissance"
   - Selecciona museos: MET y/o Harvard
   - Haz clic en "Buscar"

3. **Explora los Resultados**
   - Las obras aparecerán en la galería 3D
   - Usa el mouse para navegar (clic y arrastrar)
   - Haz scroll para hacer zoom

4. **Ver Detalles**
   - Haz clic en un cuadro
   - Se mostrará información detallada en la parte inferior

### En Meta Quest 2 (VR)

1. **Modo VR Activado**
   - Presiona "Enter VR"
   - Te encontrarás en el centro de la galería

2. **Navega por la Galería**
   - Usa el joystick para moverte
   - Las obras están distribuidas en 4 paredes

3. **Interactúa con las Obras**
   - Apunta con el control a un cuadro (se agrandará)
   - Presiona el gatillo para ver detalles
   - Presiona A/X para cerrar

---

## 🛠️ Comandos Útiles

### Backend

```powershell
# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar un servicio específico
docker-compose restart auth-service

# Detener todo
docker-compose down

# Reconstruir y reiniciar
docker-compose up -d --build
```

### Frontend

```powershell
# Desarrollo normal
npm run dev

# Desarrollo con exposición en red (para Quest 2)
npm run dev -- --host

# Build de producción
npm run build

# Preview del build
npm run preview
```

---

## 🔍 Ejemplos de Búsqueda

Prueba estos términos para encontrar obras interesantes:

- `monet` - Obras de Claude Monet
- `picasso` - Arte de Pablo Picasso
- `van gogh` - Pinturas de Van Gogh
- `renaissance` - Arte del Renacimiento
- `impressionist` - Movimiento impresionista
- `sculpture` - Esculturas
- `portrait` - Retratos
- `landscape` - Paisajes

---

## ⚠️ Solución de Problemas

### Quest 2 no se conecta

✅ **Verifica la red WiFi**: Ambos dispositivos deben estar en la misma red  
✅ **Usa `--host`**: Ejecuta `npm run dev -- --host`  
✅ **IP correcta**: Confirma tu IP con `ipconfig`  
✅ **Firewall**: Desactívalo temporalmente para pruebas  

### El botón "Enter VR" no aparece

✅ **Navegador correcto**: Usa Meta Quest Browser (no el de escritorio)  
✅ **WebXR soportado**: Verifica que el navegador soporte WebXR  
✅ **Permisos**: Acepta los permisos de VR cuando se soliciten  

### Backend no responde

✅ **Servicios corriendo**: `docker ps` debe mostrar 6+ contenedores  
✅ **Reiniciar**: `docker-compose down` y luego `docker-compose up -d`  
✅ **Logs**: `docker-compose logs -f` para ver errores  

### Las imágenes no cargan

✅ **CORS**: Verifica que el backend permita solicitudes desde tu IP  
✅ **API URL**: Confirma que `.env` tenga la URL correcta del backend  
✅ **Consola**: Revisa la consola del navegador (F12) para errores  

---

## 📊 Arquitectura del Sistema

```
┌─────────────────┐
│  Meta Quest 2   │
│   (WebXR/VR)    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐      ┌──────────────────┐
│  React Frontend │◄────►│  API Gateway     │
│  (Port 5173)    │      │  (Port 3000)     │
└─────────────────┘      └────────┬─────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│  Auth Service   │    │  Composition    │    │  Museum Proxy    │
│  (Port 3004)    │    │  Service        │    │  (Port 3010)     │
│  JWT + Users    │    │  (Port 3001)    │    │  Circuit Breaker │
└─────────────────┘    └────────┬────────┘    └────────┬─────────┘
                                │                      │
                    ┌───────────┴──────────┐          │
                    ▼                      ▼          │
         ┌─────────────────┐    ┌─────────────────┐  │
         │ Harvard Adapter │    │   MET Adapter   │  │
         │  (Port 3013)    │    │  (Port 3012)    │  │
         └────────┬────────┘    └────────┬────────┘  │
                  │                      │            │
                  └──────────┬───────────┴────────────┘
                             ▼
                  ┌─────────────────────┐
                  │  External Museum    │
                  │  APIs (Harvard/MET) │
                  └─────────────────────┘
```

---

## 🎯 Próximos Pasos Recomendados

1. ✅ Familiarízate con la interfaz en el navegador
2. ✅ Prueba diferentes búsquedas
3. ✅ Configura Quest 2 y prueba el modo VR
4. ✅ Explora las diferentes paredes de la galería
5. ✅ Experimenta con los controles de Quest

---

**¿Necesitas ayuda?** Revisa el [README.md](./README.md) completo o la [documentación del frontend](./frontend/README.md).

**¡Disfruta tu museo virtual en VR! 🎨🥽**
