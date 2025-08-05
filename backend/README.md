# Servidor Backend CheckMovil con Express, MongoDB y Multer

Este es un servidor de Express configurado con CORS, MongoDB y Multer para permitir conexiones desde aplicaciones frontend y manejar subida de imágenes.

## Instalación

1. Instala las dependencias:
```bash
npm install
```

## Ejecución

### Modo desarrollo (con nodemon para auto-reload):
```bash
npm run dev
```

### Modo producción:
```bash
npm start
```

## Características

- ✅ **Express.js** - Framework web para Node.js
- ✅ **CORS** - Configurado para permitir conexiones desde aplicaciones frontend
- ✅ **MongoDB** - Base de datos NoSQL con Mongoose ODM
- ✅ **Multer** - Middleware para manejo de subida de archivos
- ✅ **bcrypt** - Para hasheo seguro de contraseñas
- ✅ **Autenticación de usuarios** - Sistema de roles y autenticación
- ✅ **Acceso de red local** - Servidor accesible desde cualquier dispositivo en la red local

## Rutas disponibles

- `GET /` - Ruta de prueba del servidor
- `GET /api/test` - Ruta de ejemplo de la API
- `POST /api/data` - Ruta POST de ejemplo (requiere name y email en el body)
- `GET /uploads/*` - Acceso a archivos subidos (imágenes)

## Configuración CORS

El servidor está configurado para permitir conexiones desde:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- Cualquier IP de la red local (192.168.x.x, 10.x.x.x, 172.16-31.x.x) en el puerto 3000

## Base de Datos

El servidor se conecta a MongoDB en `mongodb://localhost:27017/checkmovil`. Asegúrate de tener MongoDB instalado y ejecutándose en tu sistema.

### Modelos de Datos

- **User**: Modelo para usuarios con autenticación y roles
  - Campos: username, email, password (hasheada), role, pin, isActive, lastLogin
  - Roles disponibles: superadmin, supervisor, cashier, pending
  - Validaciones: email único, username único, PIN de 4 dígitos
  - Seguridad: password y PIN no se devuelven en consultas por defecto

## Puerto y Acceso de Red

El servidor se ejecuta en el puerto 3001 por defecto, pero puedes cambiarlo usando la variable de entorno `PORT`.

**Importante:** El servidor está configurado para escuchar en `0.0.0.0`, lo que significa que es accesible desde cualquier dispositivo en la red local usando tu IP local.

## Estructura del Proyecto

```
backend/
├── src/
│   ├── models/          # Modelos de Mongoose
│   ├── controllers/     # Controladores de la lógica de negocio
│   ├── routes/          # Rutas de la API
│   └── middleware/      # Middleware personalizado
├── uploads/             # Archivos subidos
├── server.js           # Archivo principal del servidor
└── package.json
```

## Subida de Archivos

- Los archivos se guardan en la carpeta `uploads/`
- Se generan nombres únicos para evitar conflictos
- Las imágenes son accesibles vía URL: `http://localhost:3001/uploads/nombre_archivo.jpg`

## Ejemplo de uso

```bash
# Probar la ruta principal
curl http://localhost:3001/

# Probar la API
curl http://localhost:3001/api/test

# Probar POST
curl -X POST http://localhost:3001/api/data \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan", "email": "juan@ejemplo.com"}'
``` 