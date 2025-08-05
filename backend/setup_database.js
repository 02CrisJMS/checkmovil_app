require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/checkmovil_db';

async function setupDatabase() {
    try {
        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB exitosamente');

        // Limpiar usuarios existentes (por si acaso)
        console.log('🧹 Limpiando usuarios existentes...');
        await User.deleteMany({});
        console.log('✅ Usuarios existentes eliminados');

        // Crear usuarios de prueba con PINs específicos
        const testUsers = [
            {
                username: 'cajero1',
                password: '123456',
                pin: '3725',
                role: 'cajero',
                isVerified: true,
                status: 'active'
            },
            {
                username: 'supervisor1',
                password: '123456',
                pin: '2984',
                role: 'supervisor',
                isVerified: true,
                status: 'active'
            },
            {
                username: 'admin1',
                password: '123456',
                pin: '8101',
                role: 'superusuario',
                isVerified: true,
                status: 'active'
            },
            {
                username: 'cajero2',
                password: '123456',
                pin: '3725',
                role: 'cajero',
                isVerified: true,
                status: 'active'
            },
            {
                username: 'supervisor2',
                password: '123456',
                pin: '2984',
                role: 'supervisor',
                isVerified: true,
                status: 'active'
            }
        ];

        console.log('👥 Creando usuarios de prueba...');
        const createdUsers = [];
        
        for (const userData of testUsers) {
            try {
                const user = new User(userData);
                await user.save();
                createdUsers.push({
                    username: user.username,
                    role: user.role,
                    pin: userData.pin
                });
                console.log(`✅ Usuario creado: ${user.username} (${user.role})`);
            } catch (error) {
                console.log(`❌ Error creando usuario ${userData.username}:`, error.message);
            }
        }

        console.log('\n📊 RESUMEN DE CONFIGURACIÓN:');
        console.log(`✅ Total de usuarios creados: ${createdUsers.length}`);
        console.log('\n👤 USUARIOS DISPONIBLES PARA PRUEBAS:');
        
        createdUsers.forEach((user, index) => {
            console.log(`${index + 1}. Usuario: ${user.username}`);
            console.log(`   Contraseña: 123456`);
            console.log(`   PIN: ${user.pin}`);
            console.log(`   Rol: ${user.role}`);
            console.log('');
        });

        console.log('🔑 PINs VÁLIDOS:');
        console.log('   • 3725 - Cajero');
        console.log('   • 2984 - Supervisor');
        console.log('   • 8101 - Superusuario');
        console.log('\n❌ Cualquier otro PIN será rechazado');

        console.log('\n🎯 PRÓXIMOS PASOS:');
        console.log('1. Instalar MongoDB localmente');
        console.log('2. Ejecutar: mongod --dbpath C:\\data\\db');
        console.log('3. Ejecutar: npm start (en el backend)');
        console.log('4. Probar la aplicación Flutter');

    } catch (error) {
        console.error('❌ Error configurando la base de datos:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
}

// Ejecutar la configuración
setupDatabase(); 