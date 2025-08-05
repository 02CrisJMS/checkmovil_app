// Script completo de pruebas para el backend
require('dotenv').config();

const { exec } = require('child_process');
const path = require('path');

console.log('🧪 Iniciando pruebas completas del backend...\n');

// Función para ejecutar un comando y mostrar la salida
function runTest(testName, command) {
    return new Promise((resolve) => {
        console.log(`🔄 Ejecutando: ${testName}`);
        console.log(`📝 Comando: ${command}\n`);
        
        const child = exec(command, { cwd: path.join(__dirname, '../../') });
        
        let output = '';
        
        child.stdout.on('data', (data) => {
            output += data;
            process.stdout.write(data);
        });
        
        child.stderr.on('data', (data) => {
            output += data;
            process.stderr.write(data);
        });
        
        child.on('close', (code) => {
            console.log(`\n📊 ${testName} - Código de salida: ${code}\n`);
            resolve({ success: code === 0, output });
        });
    });
}

// Función principal
async function runAllTests() {
    const tests = [
        {
            name: 'Prueba de conexión a MongoDB',
            command: 'npm run test:db'
        },
        {
            name: 'Prueba de conexión al servidor',
            command: 'npm run test:server'
        },
        {
            name: 'Prueba del modelo de usuario',
            command: 'npm run test:user'
        },
        {
            name: 'Prueba de rutas de autenticación',
            command: 'npm run test:auth'
        },
        {
            name: 'Prueba del middleware de autenticación',
            command: 'npm run test:middleware'
        }
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    console.log('🚀 Ejecutando todas las pruebas...\n');
    
    for (const test of tests) {
        const result = await runTest(test.name, test.command);
        if (result.success) {
            passedTests++;
        }
        console.log('─'.repeat(50) + '\n');
    }
    
    // Resumen final
    console.log('📊 RESUMEN FINAL DE PRUEBAS:');
    console.log(`✅ Pruebas exitosas: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ¡Todas las pruebas pasaron! El backend está funcionando correctamente.');
        console.log('\n✅ Configuración completada:');
        console.log('   - MongoDB conectado y funcionando');
        console.log('   - Servidor Express ejecutándose');
        console.log('   - Variables de entorno cargadas');
        console.log('   - Rutas API respondiendo correctamente');
        console.log('   - Modelo de usuario funcionando correctamente');
        console.log('   - Rutas de autenticación funcionando correctamente');
        console.log('   - Middleware de autenticación funcionando correctamente');
        process.exit(0);
    } else {
        console.log('❌ Algunas pruebas fallaron. Revisa los errores anteriores.');
        process.exit(1);
    }
}

// Ejecutar todas las pruebas
runAllTests(); 