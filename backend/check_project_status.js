const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO ESTADO DEL PROYECTO CHECKMOVIL');
console.log('==============================================\n');

// Verificar archivos críticos del backend
const backendFiles = [
    'server.js',
    '.env',
    'package.json',
    'src/models/User.js',
    'src/routes/authRoutes.js',
    'src/middleware/authMiddleware.js',
    'setup_database.js'
];

console.log('📁 VERIFICANDO ARCHIVOS DEL BACKEND:');
let backendOk = true;
backendFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    if (!exists) backendOk = false;
});

// Verificar archivos críticos del frontend
const frontendFiles = [
    '../checkmovil_frontend/lib/main.dart',
    '../checkmovil_frontend/lib/config/api_config.dart',
    '../checkmovil_frontend/lib/services/auth_service.dart',
    '../checkmovil_frontend/lib/screens/login_screen.dart',
    '../checkmovil_frontend/lib/screens/register_screen.dart',
    '../checkmovil_frontend/pubspec.yaml'
];

console.log('\n📱 VERIFICANDO ARCHIVOS DEL FRONTEND:');
let frontendOk = true;
frontendFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    if (!exists) frontendOk = false;
});

// Verificar variables de entorno
console.log('\n⚙️ VERIFICANDO CONFIGURACIÓN:');
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const envLines = envContent.split('\n').filter(line => line.trim());
    const requiredVars = ['MONGODB_URI', 'HOST', 'PORT', 'JWT_SECRET'];
    
    let envOk = true;
    requiredVars.forEach(varName => {
        const hasVar = envLines.some(line => line.startsWith(varName + '='));
        console.log(`${hasVar ? '✅' : '❌'} ${varName}`);
        if (!hasVar) envOk = false;
    });
    
    console.log('\n📊 RESUMEN DEL ESTADO:');
    console.log(`Backend: ${backendOk ? '✅ COMPLETO' : '❌ INCOMPLETO'}`);
    console.log(`Frontend: ${frontendOk ? '✅ COMPLETO' : '❌ INCOMPLETO'}`);
    console.log(`Configuración: ${envOk ? '✅ COMPLETA' : '❌ INCOMPLETA'}`);
    
    if (backendOk && frontendOk && envOk) {
        console.log('\n🎉 ¡PROYECTO LISTO PARA DESARROLLO!');
        console.log('\n📋 PRÓXIMOS PASOS:');
        console.log('1. Instalar MongoDB localmente');
        console.log('2. Crear directorio: mkdir C:\\data\\db');
        console.log('3. Iniciar MongoDB: mongod --dbpath C:\\data\\db');
        console.log('4. Configurar BD: npm run setup:db');
        console.log('5. Iniciar backend: npm start');
        console.log('6. Ejecutar Flutter: flutter run');
        
        console.log('\n👤 USUARIOS DE PRUEBA (se crearán con setup:db):');
        console.log('• cajero1 / 123456 / PIN: 3725');
        console.log('• supervisor1 / 123456 / PIN: 2984');
        console.log('• admin1 / 123456 / PIN: 8101');
        
        console.log('\n🔑 PINs VÁLIDOS:');
        console.log('• 3725 - Cajero');
        console.log('• 2984 - Supervisor');
        console.log('• 8101 - Superusuario');
    } else {
        console.log('\n⚠️ HAY PROBLEMAS QUE NECESITAN ATENCIÓN');
        console.log('Revisa los archivos faltantes antes de continuar');
    }
    
} catch (error) {
    console.log('❌ Error leyendo archivo .env:', error.message);
}

console.log('\n🔍 VERIFICACIÓN COMPLETADA'); 