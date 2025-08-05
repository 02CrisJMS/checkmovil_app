require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/checkmovil_db';

async function removePinIndex() {
    try {
        console.log('🔧 ELIMINANDO ÍNDICE ÚNICO DEL PIN');
        console.log('====================================\n');

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Obtener la colección de usuarios
        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // Listar índices existentes
        console.log('📋 Índices existentes:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log(`   • ${index.name}: ${JSON.stringify(index.key)}`);
        });

        // Eliminar el índice único del PIN si existe
        try {
            await collection.dropIndex('pin_1');
            console.log('✅ Índice único del PIN eliminado');
        } catch (error) {
            console.log('ℹ️ Índice único del PIN no existe o ya fue eliminado');
        }

        // Verificar índices después de la eliminación
        console.log('\n📋 Índices después de la eliminación:');
        const indexesAfter = await collection.indexes();
        indexesAfter.forEach(index => {
            console.log(`   • ${index.name}: ${JSON.stringify(index.key)}`);
        });

        console.log('\n✅ Proceso completado');
        console.log('📋 Ahora puedes crear múltiples usuarios con el mismo PIN');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
    }
}

removePinIndex(); 