# Scripts de Prueba del Backend

Este directorio contiene scripts de prueba para verificar el funcionamiento correcto del backend.

## 📁 Archivos

### `testDBConnection.js`
Script para probar la conexión a MongoDB.
- Verifica que MongoDB esté ejecutándose
- Prueba la conexión usando la variable de entorno `MONGODB_URI`
- Muestra información detallada de la conexión
- Cierra la conexión correctamente después de la prueba

### `testServerConnection.js`
Script para probar la conexión al servidor Express.
- Verifica que el servidor esté ejecutándose
- Prueba las rutas principales del API
- Muestra las respuestas de cada ruta
- Usa axios para las peticiones HTTP

### `testAll.js`
Script completo que ejecuta todas las pruebas.
- Ejecuta tanto la prueba de MongoDB como la del servidor
- Muestra un resumen final de todas las pruebas
- Útil para verificar que todo esté funcionando correctamente

## 🚀 Comandos de Prueba

### Prueba individual de MongoDB
```bash
npm run test:db
```

### Prueba individual del servidor
```bash
npm run test:server
```

### Prueba completa (recomendado)
```bash
npm run test:all
```

## 📊 Variables de Entorno Requeridas

Los scripts utilizan las siguientes variables de entorno del archivo `.env`:

- `MONGODB_URI`: URI de conexión a MongoDB
- `HOST`: Dirección IP del servidor
- `PORT`: Puerto del servidor

## ✅ Resultados Esperados

### Prueba de MongoDB
```
✅ Conexión a MongoDB exitosa.
📊 Base de datos conectada: mongodb://localhost:27017/checkmovil_db
🏠 Host: localhost
🚪 Puerto: 27017
📁 Base de datos: checkmovil_db
🔗 Estado de la conexión: Conectado
🔒 Conexión cerrada correctamente.
✅ Prueba de conexión completada exitosamente.
```

### Prueba del Servidor
```
✅ Ruta principal del servidor - Status: 200
📄 Respuesta: Backend CheckMovil funcionando correctamente!

✅ Ruta de prueba de la API - Status: 200
📄 Respuesta: {
  "success": true,
  "data": {
    "message": "API funcionando correctamente",
    "items": ["item1", "item2", "item3"]
  }
}
```

## 🔧 Solución de Problemas

### Error de conexión a MongoDB
- Verifica que MongoDB esté ejecutándose: `mongod --version`
- Inicia MongoDB: `Start-Process mongod -ArgumentList "--dbpath", "C:\data\db" -WindowStyle Hidden`
- Verifica la URI en el archivo `.env`

### Error de conexión al servidor
- Verifica que el servidor esté ejecutándose: `npm start`
- Verifica que el puerto 3000 esté disponible
- Verifica las variables de entorno en `.env`

## 📝 Notas

- Los scripts usan `dotenv` para cargar las variables de entorno
- El script de servidor usa `axios` para las peticiones HTTP
- Todos los scripts muestran información detallada para facilitar el debugging
- Los scripts se cierran automáticamente después de completar las pruebas 