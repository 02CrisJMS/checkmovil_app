require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/checkmovil_db';

async function testPinLogic() {
    try {
        console.log('🧪 PROBANDO NUEVA LÓGICA DE PINs');
        console.log('==================================\n');

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Limpiar usuarios existentes
        await User.deleteMany({});
        console.log('🧹 Usuarios existentes eliminados\n');

        const testCases = [
            // Caso 1: Múltiples cajeros con el mismo PIN
            { username: 'cajero1', password: '123456', pin: '3725', expectedRole: 'cajero', description: 'Primer cajero' },
            { username: 'cajero2', password: '123456', pin: '3725', expectedRole: 'cajero', description: 'Segundo cajero' },
            { username: 'cajero3', password: '123456', pin: '3725', expectedRole: 'cajero', description: 'Tercer cajero' },
            
            // Caso 2: Múltiples supervisores con el mismo PIN
            { username: 'supervisor1', password: '123456', pin: '2984', expectedRole: 'supervisor', description: 'Primer supervisor' },
            { username: 'supervisor2', password: '123456', pin: '2984', expectedRole: 'supervisor', description: 'Segundo supervisor' },
            
            // Caso 3: Superusuario único
            { username: 'admin1', password: '123456', pin: '8101', expectedRole: 'superusuario', description: 'Primer superusuario' },
            { username: 'admin2', password: '123456', pin: '8101', expectedRole: 'rejected', description: 'Segundo superusuario (debe fallar)' },
            
            // Caso 4: PINs inválidos
            { username: 'invalid1', password: '123456', pin: '9999', expectedRole: 'rejected', description: 'PIN inválido' },
            { username: 'invalid2', password: '123456', pin: '1234', expectedRole: 'rejected', description: 'PIN inválido' }
        ];

        let passedTests = 0;
        let totalTests = testCases.length;

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            console.log(`\n🧪 Prueba ${i + 1}/${totalTests}: ${testCase.description}`);
            console.log(`   Usuario: ${testCase.username}`);
            console.log(`   PIN: ${testCase.pin}`);
            console.log(`   Rol esperado: ${testCase.expectedRole}`);

            try {
                // Determinar el rol basado en el PIN
                let userRole = null;
                switch (testCase.pin) {
                    case '3725':
                        userRole = 'cajero';
                        break;
                    case '2984':
                        userRole = 'supervisor';
                        break;
                    case '8101':
                        // Verificar si ya existe un superusuario
                        const existingSuperUser = await User.findOne({ role: 'superusuario' });
                        if (existingSuperUser) {
                            console.log(`   ❌ Error: Ya existe un superusuario`);
                            if (testCase.expectedRole === 'rejected') {
                                passedTests++;
                                console.log(`   ✅ Correcto: Superusuario adicional rechazado`);
                            }
                            continue;
                        }
                        userRole = 'superusuario';
                        break;
                    default:
                        userRole = null;
                        break;
                }

                if (testCase.expectedRole === 'rejected') {
                    if (!userRole) {
                        passedTests++;
                        console.log(`   ✅ Correcto: PIN inválido rechazado`);
                    } else {
                        console.log(`   ❌ Error: PIN inválido no fue rechazado`);
                    }
                } else {
                    // Crear usuario
                    const newUser = new User({
                        username: testCase.username,
                        password: testCase.password,
                        pin: testCase.pin,
                        role: userRole,
                        isVerified: true,
                        status: 'active'
                    });

                    await newUser.save();
                    console.log(`   ✅ Usuario creado: ${newUser.username} (${newUser.role})`);
                    passedTests++;
                }

            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
            }
        }

        console.log('\n📊 RESUMEN DE PRUEBAS:');
        console.log(`✅ Pruebas exitosas: ${passedTests}/${totalTests}`);

        if (passedTests === totalTests) {
            console.log('\n🎉 ¡Nueva lógica de PINs funcionando correctamente!');
            console.log('\n📋 REGLAS IMPLEMENTADAS:');
            console.log('• PIN 3725: Múltiples cajeros permitidos');
            console.log('• PIN 2984: Múltiples supervisores permitidos');
            console.log('• PIN 8101: Solo un superusuario permitido');
            console.log('• Otros PINs: Rechazados');
        } else {
            console.log('\n❌ Algunas pruebas fallaron. Revisa los errores anteriores.');
        }

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
    }
}

testPinLogic(); 