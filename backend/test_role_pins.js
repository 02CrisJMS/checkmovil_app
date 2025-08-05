require('dotenv').config();
const axios = require('axios');

// Configuración
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;
const AUTH_URL = `${BASE_URL}/api/auth`;

console.log('🧪 Iniciando prueba de PINs para definir roles...');
console.log(`🌐 URL base: ${BASE_URL}`);

// Función para probar registro con PIN
async function testPinRegistration(username, password, pin, expectedRole) {
    try {
        console.log(`\n📝 Probando registro:`);
        console.log(`   Usuario: ${username}`);
        console.log(`   PIN: ${pin}`);
        console.log(`   Rol esperado: ${expectedRole}`);

        const response = await axios.post(`${AUTH_URL}/register`, {
            username,
            password,
            pin
        });

        if (response.status === 201) {
            const userRole = response.data.data.role;
            const success = userRole === expectedRole;
            
            console.log(`   ✅ Registro exitoso`);
            console.log(`   📊 Rol asignado: ${userRole}`);
            console.log(`   🎯 ¿Coincide?: ${success ? '✅ SÍ' : '❌ NO'}`);
            
            return { success: true, role: userRole, expected: expectedRole };
        }
    } catch (error) {
        console.log(`   ❌ Error en registro:`);
        if (error.response) {
            console.log(`   📄 ${error.response.data.message}`);
            return { success: false, error: error.response.data.message };
        } else {
            console.log(`   🔗 ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

// Función principal de prueba
async function testRolePins() {
    console.log('\n🚀 Iniciando pruebas de PINs para definir roles...\n');
    
    const tests = [
        // Pruebas de PINs válidos
        { username: 'cajero1', password: '123456', pin: '3725', expectedRole: 'cajero' },
        { username: 'supervisor1', password: '123456', pin: '2984', expectedRole: 'supervisor' },
        { username: 'superuser1', password: '123456', pin: '8101', expectedRole: 'superusuario' },
        
        // Pruebas de PINs inválidos (deben ser rechazados)
        { username: 'invalid1', password: '123456', pin: '1234', expectedRole: 'rejected' },
        { username: 'invalid2', password: '123456', pin: '9999', expectedRole: 'rejected' },
        { username: 'invalid3', password: '123456', pin: '3726', expectedRole: 'rejected' },
        { username: 'invalid4', password: '123456', pin: '2985', expectedRole: 'rejected' },
        { username: 'invalid5', password: '123456', pin: '8102', expectedRole: 'rejected' },
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        console.log(`\n🧪 Prueba ${i + 1}/${totalTests}:`);
        
        const result = await testPinRegistration(
            test.username,
            test.password,
            test.pin,
            test.expectedRole
        );

        // Verificar resultado
        if (test.expectedRole === 'rejected') {
            // Para PINs inválidos, esperamos que falle
            if (!result.success && result.error.includes('PIN no válido')) {
                passedTests++;
                console.log(`   ✅ Correcto: PIN inválido rechazado`);
            } else {
                console.log(`   ❌ Error: PIN inválido no fue rechazado`);
            }
        } else {
            // Para PINs válidos, esperamos éxito
            if (result.success && result.role === test.expectedRole) {
                passedTests++;
            }
        }
    }

    // Resumen
    console.log('\n📊 RESUMEN DE PRUEBAS:');
    console.log(`✅ Pruebas exitosas: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ¡Sistema de PINs para roles funcionando correctamente!');
        console.log('\n📋 PINs válidos:');
        console.log('   • 3725 - Cajero');
        console.log('   • 2984 - Supervisor');
        console.log('   • 8101 - Superusuario');
        console.log('\n❌ Cualquier otro PIN será rechazado');
    } else {
        console.log('❌ Algunas pruebas fallaron. Revisa los errores anteriores.');
    }
}

// Ejecutar las pruebas
testRolePins().catch(console.error); 