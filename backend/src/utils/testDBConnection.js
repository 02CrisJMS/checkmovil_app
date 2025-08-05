// Script de prueba para verificar la conexión a MongoDB
require('dotenv').config();

const mongoose = require('mongoose');

// Obtener la URI de MongoDB desde las variables de entorno
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/checkmovil_db';

console.log('🔍 Iniciando prueba de conexión a MongoDB...');
console.log(`📊 URI de conexión: ${MONGODB_URI}`);

// Función para probar la conexión
async function testDBConnection() {
    try {
        // Intentar conectar a MongoDB
        console.log('🔄 Intentando conectar a MongoDB...');
        
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
            socketTimeoutMS: 45000, // Timeout del socket
        });
        
        console.log('✅ Conexión a MongoDB exitosa.');
        console.log(`📊 Base de datos conectada: ${MONGODB_URI}`);
        
        // Obtener información de la conexión
        const db = mongoose.connection;
        console.log(`🏠 Host: ${db.host}`);
        console.log(`🚪 Puerto: ${db.port}`);
        console.log(`📁 Base de datos: ${db.name}`);
        console.log(`🔗 Estado de la conexión: ${db.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
        
        // Cerrar la conexión después de la prueba
        await mongoose.connection.close();
        console.log('🔒 Conexión cerrada correctamente.');
        console.log('✅ Prueba de conexión completada exitosamente.');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:');
        console.error(`   Tipo de error: ${error.name}`);
        console.error(`   Mensaje: ${error.message}`);
        console.error(`   Código: ${error.code || 'N/A'}`);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Sugerencia: Verifica que MongoDB esté ejecutándose en el puerto 27017');
        } else if (error.code === 'ENOTFOUND') {
            console.error('💡 Sugerencia: Verifica que la URI de MongoDB sea correcta');
        } else if (error.message.includes('authentication')) {
            console.error('💡 Sugerencia: Verifica las credenciales de MongoDB');
        }
        
        console.error('❌ Prueba de conexión fallida.');
        process.exit(1);
    }
}

// Ejecutar la prueba
testDBConnection(); 