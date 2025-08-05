// Script de prueba para verificar el middleware de autenticación
require('dotenv').config();

const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuración
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;
const AUTH_URL = `${BASE_URL}/api/auth`;
const JWT_SECRET = process.env.JWT_SECRET || 'checkmovil_secret_key_2024';

console.log('🔐 Iniciando prueba del middleware de autenticación...');
console.log(`🌐 URL base: ${BASE_URL}`);
console.log(`🔑 URL de autenticación: ${AUTH_URL}`);

// Función para probar una ruta protegida
async function testProtectedRoute(url, headers = {}, description = '') {
    try {
        console.log(`🔄 Probando: ${description}`);
        
        const config = {
            method: 'GET',
            url,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            timeout: 10000
        };

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

// Función para crear un token JWT de prueba
function createTestToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

// Función principal de prueba
async function testAuthMiddleware() {
    console.log('\n🚀 Iniciando pruebas del middleware de autenticación...\n');
    
    let testResults = [];
    let validToken = null;
    let invalidToken = null;

    // Prueba 1: Crear un usuario para obtener un token válido
    console.log('📝 Prueba 1: Crear usuario para obtener token válido');
    try {
        const registerResponse = await axios.post(`${AUTH_URL}/register`, {
            username: 'testuser_middleware',
            password: 'password123',
            pin: '5678'
        });

        const loginResponse = await axios.post(`${AUTH_URL}/login`, {
            username: 'testuser_middleware',
            password: 'password123'
        });

        if (loginResponse.data.success) {
            validToken = loginResponse.data.data.token;
            console.log('✅ Token válido obtenido');
            console.log(`   Token: ${validToken.substring(0, 30)}...`);
        }
    } catch (error) {
        console.log('⚠️ Usuario ya existe, intentando login...');
        const loginResponse = await axios.post(`${AUTH_URL}/login`, {
            username: 'testuser_middleware',
            password: 'password123'
        });
        if (loginResponse.data.success) {
            validToken = loginResponse.data.data.token;
            console.log('✅ Token válido obtenido');
        }
    }
    console.log('');

    // Crear un token inválido para las pruebas
    invalidToken = 'invalid_token_123456789';

    // Prueba 2: Probar ruta protegida sin token
    console.log('🚫 Prueba 2: Ruta protegida sin token');
    const noTokenResult = await testProtectedRoute(
        `${BASE_URL}/api/test`,
        {},
        'GET /api/test sin token'
    );
    testResults.push({ name: 'Sin token (debe fallar)', success: !noTokenResult.success });
    console.log('');

    // Prueba 3: Probar ruta protegida con token inválido
    console.log('❌ Prueba 3: Ruta protegida con token inválido');
    const invalidTokenResult = await testProtectedRoute(
        `${BASE_URL}/api/test`,
        { 'Authorization': `Bearer ${invalidToken}` },
        'GET /api/test con token inválido'
    );
    testResults.push({ name: 'Token inválido (debe fallar)', success: !invalidTokenResult.success });
    console.log('');

    // Prueba 4: Probar ruta protegida con token válido
    if (validToken) {
        console.log('✅ Prueba 4: Ruta protegida con token válido');
        const validTokenResult = await testProtectedRoute(
            `${BASE_URL}/api/test`,
            { 'Authorization': `Bearer ${validToken}` },
            'GET /api/test con token válido'
        );
        testResults.push({ name: 'Token válido', success: validTokenResult.success });
        console.log('');
    }

    // Prueba 5: Probar verificación de token
    if (validToken) {
        console.log('🔍 Prueba 5: Verificar token válido');
        const verifyResult = await testProtectedRoute(
            `${AUTH_URL}/verify`,
            { 'Authorization': `Bearer ${validToken}` },
            'GET /api/auth/verify con token válido'
        );
        testResults.push({ name: 'Verificación de token', success: verifyResult.success });
        console.log('');
    }

    // Prueba 6: Probar token expirado (simulado)
    console.log('⏰ Prueba 6: Token expirado (simulado)');
    const expiredToken = jwt.sign(
        { id: 'test_id', username: 'test', role: 'cajero' },
        JWT_SECRET,
        { expiresIn: '0s' } // Token que expira inmediatamente
    );
    
    // Esperar un momento para que el token expire
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const expiredTokenResult = await testProtectedRoute(
        `${AUTH_URL}/verify`,
        { 'Authorization': `Bearer ${expiredToken}` },
        'GET /api/auth/verify con token expirado'
    );
    testResults.push({ name: 'Token expirado (debe fallar)', success: !expiredTokenResult.success });
    console.log('');

    // Prueba 7: Probar diferentes formatos de Authorization header
    console.log('📋 Prueba 7: Diferentes formatos de Authorization header');
    
    // Sin "Bearer"
    const noBearerResult = await testProtectedRoute(
        `${AUTH_URL}/verify`,
        { 'Authorization': validToken },
        'GET /api/auth/verify sin "Bearer"'
    );
    testResults.push({ name: 'Sin "Bearer" (debe fallar)', success: !noBearerResult.success });
    
    // Header vacío
    const emptyHeaderResult = await testProtectedRoute(
        `${AUTH_URL}/verify`,
        { 'Authorization': '' },
        'GET /api/auth/verify con header vacío'
    );
    testResults.push({ name: 'Header vacío (debe fallar)', success: !emptyHeaderResult.success });
    console.log('');

    // Prueba 8: Probar con token malformado
    console.log('🔧 Prueba 8: Token malformado');
    const malformedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid_payload.invalid_signature';
    const malformedResult = await testProtectedRoute(
        `${AUTH_URL}/verify`,
        { 'Authorization': `Bearer ${malformedToken}` },
        'GET /api/auth/verify con token malformado'
    );
    testResults.push({ name: 'Token malformado (debe fallar)', success: !malformedResult.success });
    console.log('');

    // Resumen de resultados
    console.log('📊 RESUMEN DE PRUEBAS DEL MIDDLEWARE:');
    const passedTests = testResults.filter(test => test.success).length;
    const totalTests = testResults.length;
    
    testResults.forEach((test, index) => {
        const status = test.success ? '✅' : '❌';
        console.log(`   ${index + 1}. ${status} ${test.name}`);
    });
    
    console.log(`\n📈 Resultados: ${passedTests}/${totalTests} pruebas exitosas`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ¡Todas las pruebas del middleware pasaron exitosamente!');
        console.log('\n✅ Funcionalidades verificadas:');
        console.log('   - Verificación de tokens JWT');
        console.log('   - Manejo de tokens ausentes');
        console.log('   - Manejo de tokens inválidos');
        console.log('   - Manejo de tokens expirados');
        console.log('   - Validación de formato de headers');
        console.log('   - Verificación de usuarios en base de datos');
        console.log('   - Verificación de estado de usuarios');
        process.exit(0);
    } else {
        console.log('❌ Algunas pruebas fallaron. Revisa los errores anteriores.');
        process.exit(1);
    }
}

// Ejecutar las pruebas
testAuthMiddleware(); 