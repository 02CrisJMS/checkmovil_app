// Script de prueba para verificar las rutas de autenticación
require('dotenv').config();

const axios = require('axios');

// Configuración
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;
const AUTH_URL = `${BASE_URL}/api/auth`;

console.log('🔐 Iniciando prueba de rutas de autenticación...');
console.log(`🌐 URL base: ${BASE_URL}`);
console.log(`🔑 URL de autenticación: ${AUTH_URL}`);

// Función para probar una ruta de autenticación
async function testAuthRoute(method, url, data = null, headers = {}) {
    try {
        console.log(`🔄 Probando: ${method.toUpperCase()} ${url}`);
        
        const config = {
            method,
            url,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            timeout: 10000
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        
        console.log(`✅ Status: ${response.status}`);
        if (typeof response.data === 'object') {
            console.log(`📄 Respuesta: ${JSON.stringify(response.data, null, 2)}`);
        } else {
            console.log(`📄 Respuesta: ${response.data}`);
        }
        return { success: true, data: response.data };
    } catch (error) {
        console.error(`❌ Error:`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Mensaje: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.error(`   Error: ${error.message}`);
        }
        return { success: false, error: error.response?.data || error.message };
    }
}

// Función principal de prueba
async function testAuthRoutes() {
    console.log('\n🚀 Iniciando pruebas de autenticación...\n');
    
    let testResults = [];
    let token = null;

    // Prueba 1: Registrar un usuario válido
    console.log('📝 Prueba 1: Registrar usuario válido');
    const registerData = {
        username: 'testuser_auth',
        password: 'password123',
        pin: '1234'
    };
    
    const registerResult = await testAuthRoute('POST', `${AUTH_URL}/register`, registerData);
    testResults.push({ name: 'Registro exitoso', success: registerResult.success });
    console.log('');

    // Prueba 2: Intentar registrar el mismo usuario (debe fallar)
    console.log('⚠️ Prueba 2: Registrar usuario duplicado');
    const duplicateResult = await testAuthRoute('POST', `${AUTH_URL}/register`, registerData);
    testResults.push({ name: 'Registro duplicado', success: !duplicateResult.success }); // Debe fallar
    console.log('');

    // Prueba 3: Login con usuario válido
    console.log('🔑 Prueba 3: Login con usuario válido');
    const loginData = {
        username: 'testuser_auth',
        password: 'password123'
    };
    
    const loginResult = await testAuthRoute('POST', `${AUTH_URL}/login`, loginData);
    if (loginResult.success && loginResult.data.data.token) {
        token = loginResult.data.data.token;
        console.log(`   Token obtenido: ${token.substring(0, 20)}...`);
    }
    testResults.push({ name: 'Login exitoso', success: loginResult.success });
    console.log('');

    // Prueba 4: Login con contraseña incorrecta
    console.log('❌ Prueba 4: Login con contraseña incorrecta');
    const wrongPasswordData = {
        username: 'testuser_auth',
        password: 'wrongpassword'
    };
    
    const wrongPasswordResult = await testAuthRoute('POST', `${AUTH_URL}/login`, wrongPasswordData);
    testResults.push({ name: 'Login con contraseña incorrecta', success: !wrongPasswordResult.success }); // Debe fallar
    console.log('');

    // Prueba 5: Login con usuario inexistente
    console.log('👤 Prueba 5: Login con usuario inexistente');
    const nonexistentUserData = {
        username: 'usuario_inexistente',
        password: 'password123'
    };
    
    const nonexistentResult = await testAuthRoute('POST', `${AUTH_URL}/login`, nonexistentUserData);
    testResults.push({ name: 'Login con usuario inexistente', success: !nonexistentResult.success }); // Debe fallar
    console.log('');

    // Prueba 6: Verificar token (si se obtuvo uno)
    if (token) {
        console.log('🔍 Prueba 6: Verificar token');
        const verifyResult = await testAuthRoute('GET', `${AUTH_URL}/verify`, null, {
            'Authorization': `Bearer ${token}`
        });
        testResults.push({ name: 'Verificación de token', success: verifyResult.success });
        console.log('');
    }

    // Prueba 7: Verificar token inválido
    console.log('🚫 Prueba 7: Verificar token inválido');
    const invalidTokenResult = await testAuthRoute('GET', `${AUTH_URL}/verify`, null, {
        'Authorization': 'Bearer invalid_token_123'
    });
    testResults.push({ name: 'Verificación de token inválido', success: !invalidTokenResult.success }); // Debe fallar
    console.log('');

    // Prueba 8: Validaciones de registro
    console.log('📋 Prueba 8: Validaciones de registro');
    
    // Username muy corto
    const shortUsernameData = {
        username: 'ab',
        password: 'password123'
    };
    const shortUsernameResult = await testAuthRoute('POST', `${AUTH_URL}/register`, shortUsernameData);
    testResults.push({ name: 'Username muy corto', success: !shortUsernameResult.success });
    
    // Password muy corta
    const shortPasswordData = {
        username: 'validuser',
        password: '123'
    };
    const shortPasswordResult = await testAuthRoute('POST', `${AUTH_URL}/register`, shortPasswordData);
    testResults.push({ name: 'Password muy corta', success: !shortPasswordResult.success });
    
    // Campos vacíos
    const emptyFieldsData = {
        username: '',
        password: ''
    };
    const emptyFieldsResult = await testAuthRoute('POST', `${AUTH_URL}/register`, emptyFieldsData);
    testResults.push({ name: 'Campos vacíos', success: !emptyFieldsResult.success });
    console.log('');

    // Resumen de resultados
    console.log('📊 RESUMEN DE PRUEBAS DE AUTENTICACIÓN:');
    const passedTests = testResults.filter(test => test.success).length;
    const totalTests = testResults.length;
    
    testResults.forEach((test, index) => {
        const status = test.success ? '✅' : '❌';
        console.log(`   ${index + 1}. ${status} ${test.name}`);
    });
    
    console.log(`\n📈 Resultados: ${passedTests}/${totalTests} pruebas exitosas`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ¡Todas las pruebas de autenticación pasaron exitosamente!');
        console.log('\n✅ Funcionalidades verificadas:');
        console.log('   - Registro de usuarios');
        console.log('   - Login de usuarios');
        console.log('   - Generación de JWT');
        console.log('   - Verificación de tokens');
        console.log('   - Validaciones de entrada');
        console.log('   - Manejo de errores');
        process.exit(0);
    } else {
        console.log('❌ Algunas pruebas fallaron. Revisa los errores anteriores.');
        process.exit(1);
    }
}

// Ejecutar las pruebas
testAuthRoutes(); 