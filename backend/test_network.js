const http = require('http');
const dns = require('dns');

console.log('🔍 PRUEBA DE CONECTIVIDAD DE RED');
console.log('==================================\n');

// Función para probar conectividad
async function testConnectivity() {
    const testUrls = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.1.114:3000'
    ];

    console.log('📡 PROBANDO CONECTIVIDAD LOCAL:');
    for (const url of testUrls) {
        try {
            const response = await new Promise((resolve, reject) => {
                const req = http.get(url, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        resolve({
                            statusCode: res.statusCode,
                            data: data.substring(0, 50),
                            headers: res.headers
                        });
                    });
                });
                
                req.on('error', (err) => reject(err));
                req.setTimeout(5000, () => {
                    req.destroy();
                    reject(new Error('Timeout'));
                });
            });
            
            console.log(`✅ ${url} - Status: ${response.statusCode}`);
        } catch (error) {
            console.log(`❌ ${url} - Error: ${error.message}`);
        }
    }

    console.log('\n🌐 INFORMACIÓN DE RED:');
    console.log('• Computadora: 192.168.1.114');
    console.log('• Teléfono: 192.168.1.116');
    console.log('• Red: 192.168.1.x');
    console.log('• Máscara: 255.255.255.0');
    
    console.log('\n🔧 POSIBLES SOLUCIONES:');
    console.log('1. Verificar que ambos dispositivos estén en la misma red WiFi');
    console.log('2. Desactivar temporalmente el firewall de Windows');
    console.log('3. Verificar que el router no bloquee conexiones internas');
    console.log('4. Probar con ping desde el teléfono a 192.168.1.114');
    console.log('5. Verificar que no haya restricciones de red en el teléfono');
    
    console.log('\n📋 COMANDOS PARA PROBAR:');
    console.log('• En el teléfono: ping 192.168.1.114');
    console.log('• En la computadora: ping 192.168.1.116');
    console.log('• Verificar firewall: netsh advfirewall firewall show rule name="Node.js Server"');
}

testConnectivity(); 