// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Configuración de MongoDB para Render
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/checkmovil_db';

// Configurar CORS para producción
app.use(cors({
  origin: [
    'https://checkmovil-frontend.vercel.app',
    'https://checkmovil-app.vercel.app',
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost:3000',
    /^http:\/\/192\.168\.\d+\.\d+:3000$/, // Permitir IPs de red local
    /^http:\/\/10\.\d+\.\d+\.\d+:3000$/,  // Permitir IPs de red local
    /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:3000$/ // Permitir IPs de red local
  ],
  credentials: true // Permitir cookies y headers de autenticación
}));

// Middleware para parsear JSON en el cuerpo de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'uploads'
// Esto es crucial para que las imágenes subidas sean accesibles vía URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de prueba inicial (mantén esta ruta)
app.get('/', (req, res) => {
    res.send('Backend CheckMovil funcionando correctamente!');
});



// Importar rutas de autenticación
console.log('🔄 Importando rutas de autenticación...');
const authRoutes = require('./src/routes/authRoutes');
console.log('✅ Rutas de autenticación importadas correctamente');

// Importar rutas de pagos
console.log('🔄 Importando rutas de pagos...');
const paymentRoutes = require('./src/routes/paymentRoutes');
console.log('✅ Rutas de pagos importadas correctamente');

// Importar middleware de autenticación
console.log('🔄 Importando middleware de autenticación...');
const { authenticateToken, authorizeRole } = require('./src/middleware/authMiddleware');
console.log('✅ Middleware de autenticación importado correctamente');

// Ruta POST de ejemplo
app.post('/api/data', (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Nombre y email son requeridos'
    });
  }
  
  res.json({
    success: true,
    message: 'Datos recibidos correctamente',
    data: { name, email }
  });
});

// Usar las rutas de autenticación
console.log('🔄 Configurando rutas de autenticación...');
app.use('/api/auth', authRoutes);
console.log('✅ Rutas de autenticación configuradas en /api/auth');

// Usar las rutas de pagos
console.log('🔄 Configurando rutas de pagos...');
app.use('/api/payments', paymentRoutes);
console.log('✅ Rutas de pagos configuradas en /api/payments');

// Ruta protegida de prueba
app.get('/api/test', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Ruta protegida accedida correctamente',
        data: {
            userId: req.userId,
            userRole: req.userRole,
            user: req.user
        }
    });
});

// Ruta protegida por rol específico
app.get('/api/admin', authenticateToken, authorizeRole(['superusuario', 'supervisor']), (req, res) => {
    res.json({
        success: true,
        message: 'Ruta de administrador accedida correctamente',
        data: {
            userId: req.userId,
            userRole: req.userRole,
            user: req.user
        }
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});



// Configuración de Multer para el almacenamiento de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // cb(null, 'uploads/'); // La carpeta donde se guardarán los archivos
        // Asegurarse de que la carpeta 'uploads' exista. Multer no la crea automáticamente.
        const uploadPath = path.join(__dirname, 'uploads');
        // Puedes añadir una comprobación aquí si quieres que el código cree la carpeta si no existe
        // fs.mkdirSync(uploadPath, { recursive: true }); // Requiere 'fs' module
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generar un nombre de archivo único utilizando la marca de tiempo y la extensión original
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Inicializar Multer con la configuración de almacenamiento
// No especificamos 'fileFilter' aquí para aceptar cualquier tipo de imagen como se solicitó.
const upload = multer({ storage: storage });

// NOTA: Las rutas que utilizarán 'upload' se definirán en la siguiente fase (ej. app.post('/upload', upload.single('image'), ...));
// Por ahora, solo necesitamos la configuración de 'upload'.

// Función para iniciar el servidor después de conectar a MongoDB
const startServer = () => {
    app.listen(PORT, HOST, () => {
        console.log(`🚀 Servidor de backend escuchando en http://${HOST}:${PORT}`);
        console.log(`📁 Accede a las imágenes en http://${HOST}:${PORT}/uploads/nombre_imagen.jpg`);
        console.log(`🌐 Variables de entorno cargadas:`);
        console.log(`   - HOST: ${HOST}`);
        console.log(`   - PORT: ${PORT}`);
        console.log(`   - MONGODB_URI: ${MONGODB_URI}`);
    });
};

// Conectar a MongoDB y luego iniciar el servidor
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Conectado exitosamente a MongoDB.');
        console.log(`📊 Base de datos: ${MONGODB_URI}`);
        startServer();
    })
    .catch(err => {
        console.error('❌ Error al conectar a MongoDB:', err);
        process.exit(1);
}); 