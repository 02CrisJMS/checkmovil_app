# 🚀 Deploy en Render

## Pasos para desplegar en Render:

### 1. Crear cuenta en Render
- Ve a [render.com](https://render.com)
- Inicia sesión con GitHub
- Crea una cuenta gratuita

### 2. Crear nuevo Web Service
- En Render Dashboard, haz clic en "New"
- Selecciona "Web Service"
- Conecta tu repositorio de GitHub

### 3. Configurar el servicio
- **Name**: `checkmovil-backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free`

### 4. Configurar variables de entorno
En la sección "Environment Variables", agrega:

```
NODE_ENV=production
JWT_SECRET=checkmovil_super_secret_key_2024_production
```

### 5. Crear base de datos MongoDB
- En Render Dashboard, haz clic en "New"
- Selecciona "MongoDB"
- **Name**: `checkmovil-db`
- **Database Name**: `checkmovil_db`
- **User**: `checkmovil_user`
- **Plan**: `Free`

### 6. Conectar base de datos
- En tu Web Service, ve a "Environment"
- Agrega variable: `MONGODB_URI`
- Valor: Copia la "Connection String" de tu MongoDB

### 7. Deploy automático
- Render hará deploy automático
- Cada push a `main` actualizará la app
- URL típica: `https://checkmovil-backend.onrender.com`

### 8. Actualizar frontend
Cambia la URL en `checkmovil_frontend/lib/config/api_config.dart`:

```dart
static const String baseUrl = 'https://checkmovil-backend.onrender.com/api';
```

## URLs típicas de Render:
- Backend: `https://checkmovil-backend.onrender.com`
- Base de datos: Automática en Render

## Monitoreo:
- Logs en tiempo real
- Métricas de rendimiento
- Deploy automático
- SSL automático

## Ventajas de Render:
- ✅ 100% GRATIS
- ✅ No se duerme
- ✅ Base de datos incluida
- ✅ SSL automático
- ✅ Deploy automático 