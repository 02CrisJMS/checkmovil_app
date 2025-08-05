# 🚀 Deploy en Heroku

## Pasos para desplegar en Heroku:

### 1. Crear cuenta en Heroku
- Ve a [heroku.com](https://heroku.com)
- Crea una cuenta gratuita
- **NO requiere tarjeta** para el plan gratuito

### 2. Instalar Heroku CLI (Opcional)
```bash
# Descargar desde: https://devcenter.heroku.com/articles/heroku-cli
```

### 3. Crear aplicación en Heroku
- En Heroku Dashboard, haz clic en "New" → "Create new app"
- **App name**: `checkmovil-backend`
- **Region**: United States
- **Stack**: Container (automático)

### 4. Conectar con GitHub
- En tu app, ve a "Deploy" tab
- Selecciona "GitHub" como método de deploy
- Conecta tu repositorio: `02CrisJMS/checkmovil_app`

### 5. Configurar variables de entorno
En "Settings" → "Config Vars", agrega:

```
NODE_ENV=production
JWT_SECRET=checkmovil_super_secret_key_2024_production
MONGODB_URI=mongodb+srv://tu_usuario:tu_password@cluster.mongodb.net/checkmovil_db
```

### 6. Configurar MongoDB Atlas
- Ve a [mongodb.com/atlas](https://mongodb.com/atlas)
- Crea cuenta gratuita
- Crea cluster gratuito
- Obtén connection string
- Agrégalo a MONGODB_URI

### 7. Deploy automático
- En "Deploy" tab, activa "Automatic deploys"
- Cada push a `main` actualizará la app
- URL típica: `https://checkmovil-backend.herokuapp.com`

### 8. Actualizar frontend
Cambia la URL en `checkmovil_frontend/lib/config/api_config.dart`:

```dart
static const String baseUrl = 'https://checkmovil-backend.herokuapp.com/api';
```

## URLs típicas de Heroku:
- Backend: `https://checkmovil-backend.herokuapp.com`
- Base de datos: MongoDB Atlas (gratuita)

## Ventajas de Heroku:
- ✅ 100% GRATIS (sin tarjeta)
- ✅ Muy confiable
- ✅ Fácil de usar
- ✅ MongoDB Atlas incluida
- ✅ SSL automático 