require('dotenv').config();
const axios = require('axios');

// Configuración
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;
const AUTH_URL = `${BASE_URL}/api/auth`;

console.log('🧪 Iniciando prueba del sistema de pines...');
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
        } else {
            console.log(`   🔗 ${error.message}`);
        }
        return { success: false, error: error.response?.data?.message || error.message };
    }
}

// Función principal de prueba
async function testPinSystem() {
    console.log('\n🚀 Iniciando pruebas del sistema de pines...\n');
    
    const tests = [
        { username: 'cajero_test', password: '123456', pin: '3725', expectedRole: 'cajero' },
        { username: 'supervisor_test', password: '123456', pin: '2984', expectedRole: 'supervisor' },
        { username: 'superuser_test', password: '123456', pin: '8101', expectedRole: 'superusuario' },
        { username: 'pending_test', password: '123456', pin: '1234', expectedRole: 'pending' },
        { username: 'no_pin_test', password: '123456', pin: null, expectedRole: 'pending' },
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

        if (result.success && result.role === result.expected) {
            passedTests++;
        }
    }

    // Resumen
    console.log('\n📊 RESUMEN DE PRUEBAS:');
    console.log(`✅ Pruebas exitosas: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ¡Sistema de pines funcionando correctamente!');
    } else {
        console.log('❌ Algunas pruebas fallaron. Revisa los errores anteriores.');
    }
}

// Ejecutar las pruebas
testPinSystem().catch(console.error); 