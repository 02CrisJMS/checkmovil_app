// Script de prueba para verificar la conexión al servidor
require('dotenv').config();

const axios = require('axios');

// Configuración
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;

console.log('🔍 Iniciando prueba de conexión al servidor...');
console.log(`🌐 URL base: ${BASE_URL}`);

// Función para probar una ruta
async function testRoute(url, description) {
    try {
        console.log(`🔄 Probando: ${description}`);
        const response = await axios.get(url, {
            timeout: 5000 // Timeout de 5 segundos
        });
        
        console.log(`✅ ${description} - Status: ${response.status}`);
        if (typeof response.data === 'object') {
            console.log(`📄 Respuesta: ${JSON.stringify(response.data, null, 2)}`);
        } else {
            console.log(`📄 Respuesta: ${response.data}`);
        }
        return true;
    } catch (error) {
        console.error(`❌ ${description} - Error:`);
        if (error.code === 'ECONNREFUSED') {
            console.error('   Servidor no está ejecutándose');
        } else if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Mensaje: ${error.response.data}`);
        } else {
            console.error(`   Error: ${error.message}`);
        }
        return false;
    }
}

// Función principal de prueba
async function testServerConnection() {
    console.log('\n🚀 Iniciando pruebas del servidor...\n');
    
    const tests = [
        {
            url: `${BASE_URL}/`,
            description: 'Ruta principal del servidor'
        },
        {
            url: `${BASE_URL}/api/test`,
            description: 'Ruta de prueba de la API'
        }
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
        const success = await testRoute(test.url, test.description);
        if (success) passedTests++;
        console.log(''); // Línea en blanco para separar
    }
    
    // Resumen de resultados
    console.log('📊 Resumen de pruebas:');
    console.log(`✅ Pruebas exitosas: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ¡Todas las pruebas pasaron! El servidor está funcionando correctamente.');
        process.exit(0);
    } else {
        console.log('❌ Algunas pruebas fallaron. Verifica que el servidor esté ejecutándose.');
        process.exit(1);
    }
}

// Ejecutar las pruebas
testServerConnection(); 