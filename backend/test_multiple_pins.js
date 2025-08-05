require('dotenv').config();
const axios = require('axios');

// Configuración
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;
const AUTH_URL = `${BASE_URL}/api/auth`;

console.log('🧪 Iniciando prueba de múltiples PINs por rol...');
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
async function testMultiplePins() {
    console.log('\n🚀 Iniciando pruebas de múltiples PINs por rol...\n');
    
    const tests = [
        // Pruebas de Cajero
        { username: 'cajero1', password: '123456', pin: '3725', expectedRole: 'cajero' },
        { username: 'cajero2', password: '123456', pin: '3726', expectedRole: 'cajero' },
        { username: 'cajero3', password: '123456', pin: '3727', expectedRole: 'cajero' },
        { username: 'cajero4', password: '123456', pin: '3728', expectedRole: 'cajero' },
        { username: 'cajero5', password: '123456', pin: '3729', expectedRole: 'cajero' },
        
        // Pruebas de Supervisor
        { username: 'supervisor1', password: '123456', pin: '2984', expectedRole: 'supervisor' },
        { username: 'supervisor2', password: '123456', pin: '2985', expectedRole: 'supervisor' },
        { username: 'supervisor3', password: '123456', pin: '2986', expectedRole: 'supervisor' },
        { username: 'supervisor4', password: '123456', pin: '2987', expectedRole: 'supervisor' },
        { username: 'supervisor5', password: '123456', pin: '2988', expectedRole: 'supervisor' },
        
        // Pruebas de Superusuario
        { username: 'superuser1', password: '123456', pin: '8101', expectedRole: 'superusuario' },
        { username: 'superuser2', password: '123456', pin: '8102', expectedRole: 'superusuario' },
        { username: 'superuser3', password: '123456', pin: '8103', expectedRole: 'superusuario' },
        { username: 'superuser4', password: '123456', pin: '8104', expectedRole: 'superusuario' },
        { username: 'superuser5', password: '123456', pin: '8105', expectedRole: 'superusuario' },
        
        // Pruebas de Pendiente
        { username: 'pending1', password: '123456', pin: '1234', expectedRole: 'pending' },
        { username: 'pending2', password: '123456', pin: '9999', expectedRole: 'pending' },
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
        console.log('🎉 ¡Sistema de múltiples PINs funcionando correctamente!');
        console.log('\n📋 PINs disponibles:');
        console.log('   Cajero: 3725, 3726, 3727, 3728, 3729');
        console.log('   Supervisor: 2984, 2985, 2986, 2987, 2988');
        console.log('   Superusuario: 8101, 8102, 8103, 8104, 8105');
        console.log('   Pendiente: Cualquier otro PIN');
    } else {
        console.log('❌ Algunas pruebas fallaron. Revisa los errores anteriores.');
    }
}

// Ejecutar las pruebas
testMultiplePins().catch(console.error); 