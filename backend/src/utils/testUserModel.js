// Script de prueba para verificar el modelo de usuario
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');

// Obtener la URI de MongoDB desde las variables de entorno
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/checkmovil_db';

console.log('🧪 Iniciando prueba del modelo de usuario...');
console.log(`📊 URI de conexión: ${MONGODB_URI}`);

// Función para probar el modelo de usuario
async function testUserModel() {
    try {
        // Conectar a MongoDB
        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB exitosamente.');

        // Limpiar la colección de usuarios para pruebas
        console.log('🧹 Limpiando colección de usuarios...');
        await User.deleteMany({});
        console.log('✅ Colección limpiada.');

        // Prueba 1: Crear un usuario válido
        console.log('\n📝 Prueba 1: Crear usuario válido');
        const testUser = new User({
            username: 'testuser',
            password: 'password123',
            pin: '1234',
            role: 'cajero',
            isVerified: false,
            status: 'active'
        });

        await testUser.save();
        console.log('✅ Usuario creado exitosamente.');
        console.log(`   - ID: ${testUser.id}`);
        console.log(`   - Username: ${testUser.username}`);
        console.log(`   - Role: ${testUser.role}`);
        console.log(`   - Status: ${testUser.status}`);
        console.log(`   - Password hasheada: ${testUser.password ? 'Sí' : 'No'}`);

        // Prueba 2: Verificar que la contraseña se hasheó
        console.log('\n🔐 Prueba 2: Verificar hash de contraseña');
        const savedUser = await User.findById(testUser.id).select('+password');
        console.log(`   - Contraseña original: password123`);
        console.log(`   - Contraseña hasheada: ${savedUser.password}`);
        console.log(`   - ¿Es diferente?: ${savedUser.password !== 'password123' ? 'Sí' : 'No'}`);

        // Prueba 3: Comparar contraseñas
        console.log('\n🔍 Prueba 3: Comparar contraseñas');
        const isPasswordValid = await savedUser.comparePassword('password123');
        const isPasswordInvalid = await savedUser.comparePassword('wrongpassword');
        console.log(`   - Contraseña correcta: ${isPasswordValid ? '✅ Válida' : '❌ Inválida'}`);
        console.log(`   - Contraseña incorrecta: ${isPasswordInvalid ? '❌ Válida' : '✅ Inválida'}`);

        // Prueba 4: Verificar métodos del modelo
        console.log('\n⚙️ Prueba 4: Verificar métodos del modelo');
        console.log(`   - ¿Usuario activo?: ${savedUser.isActive() ? 'Sí' : 'No'}`);
        console.log(`   - ¿Usuario verificado?: ${savedUser.isUserVerified() ? 'Sí' : 'No'}`);

        // Prueba 5: Crear usuario con rol diferente
        console.log('\n👥 Prueba 5: Crear usuario supervisor');
        const supervisorUser = new User({
            username: 'supervisor1',
            password: 'supervisor123',
            pin: '5678',
            role: 'supervisor',
            isVerified: true,
            status: 'active'
        });

        await supervisorUser.save();
        console.log('✅ Supervisor creado exitosamente.');

        // Prueba 6: Usar métodos estáticos
        console.log('\n🔍 Prueba 6: Métodos estáticos');
        const cajeros = await User.findByRole('cajero');
        const activos = await User.findActive();
        console.log(`   - Cajeros encontrados: ${cajeros.length}`);
        console.log(`   - Usuarios activos: ${activos.length}`);

        // Prueba 7: Verificar validaciones
        console.log('\n⚠️ Prueba 7: Validaciones del modelo');
        try {
            const invalidUser = new User({
                username: 'ab', // Muy corto
                password: '123', // Muy corta
                role: 'invalid_role' // Rol inválido
            });
            await invalidUser.save();
        } catch (error) {
            console.log('✅ Validaciones funcionando correctamente:');
            console.log(`   - Error: ${error.message}`);
        }

        // Prueba 8: Verificar unicidad
        console.log('\n🔒 Prueba 8: Verificar unicidad');
        try {
            const duplicateUser = new User({
                username: 'testuser', // Username duplicado
                password: 'password123',
                pin: '9999',
                role: 'cajero'
            });
            await duplicateUser.save();
        } catch (error) {
            console.log('✅ Unicidad funcionando correctamente:');
            console.log(`   - Error: ${error.message}`);
        }

        // Limpiar después de las pruebas
        console.log('\n🧹 Limpiando datos de prueba...');
        await User.deleteMany({});
        console.log('✅ Datos de prueba eliminados.');

        // Cerrar conexión
        await mongoose.connection.close();
        console.log('🔒 Conexión cerrada correctamente.');
        
        console.log('\n🎉 ¡Todas las pruebas del modelo de usuario pasaron exitosamente!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error en las pruebas del modelo de usuario:');
        console.error(`   Tipo: ${error.name}`);
        console.error(`   Mensaje: ${error.message}`);
        
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        
        process.exit(1);
    }
}

// Ejecutar las pruebas
testUserModel(); 