const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Payment = require('../models/Payment');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Crear carpeta uploads si no existe
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'payment-' + uniqueSuffix + ext);
    }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
    console.log('🔍 Validando archivo:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname
    });
    
    // Lista de tipos MIME válidos para imágenes
    const validImageTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'image/tiff',
        'image/tif'
    ];
    
    // Verificar si el mimetype es válido
    if (validImageTypes.includes(file.mimetype)) {
        console.log('✅ Tipo de archivo válido:', file.mimetype);
        cb(null, true);
    } else {
        console.log('❌ Tipo de archivo inválido:', file.mimetype);
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten: ${validImageTypes.join(', ')}`), false);
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
    }
});

// Ruta POST /upload - Subir imagen de pago
router.post('/upload', 
    authenticateToken, 
    authorizeRole(['cajero', 'supervisor', 'superusuario']), 
    upload.single('image'), 
    async (req, res) => {
        try {
            console.log('📤 Recibiendo petición de subida de imagen');
            console.log('   Headers:', req.headers);
            console.log('   Body:', req.body);
            console.log('   File:', req.file);
            
            // Verificar que se subió un archivo
            if (!req.file) {
                console.log('❌ No se proporcionó archivo');
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionó ninguna imagen'
                });
            }

            // Verificar que el archivo es una imagen
            if (!req.file.mimetype.startsWith('image/')) {
                // Eliminar archivo si no es imagen
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: 'El archivo debe ser una imagen'
                });
            }

            // Crear registro en la base de datos
            const payment = new Payment({
                processedBy: req.userId,
                imageUrl: req.file.path,
                originalFilename: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                status: 'pending'
            });

            await payment.save();

            // Respuesta exitosa
            res.status(201).json({
                success: true,
                message: 'Imagen subida exitosamente',
                data: {
                    id: payment.id,
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    size: req.file.size,
                    status: payment.status,
                    uploadedAt: payment.createdAt
                }
            });

        } catch (error) {
            console.error('❌ Error al subir imagen:', error);
            
            // Eliminar archivo si hubo error
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            // Determinar el tipo de error
            let errorMessage = 'Error interno del servidor al procesar la imagen';
            let statusCode = 500;

            if (error.message.includes('Tipo de archivo no permitido')) {
                errorMessage = error.message;
                statusCode = 400;
            } else if (error.name === 'ValidationError') {
                errorMessage = 'Error de validación en los datos';
                statusCode = 400;
            } else if (error.code === 'ENOSPC') {
                errorMessage = 'Espacio insuficiente en el servidor';
                statusCode = 507;
            }

            res.status(statusCode).json({
                success: false,
                message: errorMessage,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Ruta GET /payments - Obtener pagos del usuario
router.get('/payments', 
    authenticateToken, 
    authorizeRole(['cajero', 'supervisor', 'superusuario']), 
    async (req, res) => {
        try {
            const payments = await Payment.find({ processedBy: req.userId })
                .sort({ createdAt: -1 })
                .limit(50);

            res.json({
                success: true,
                message: 'Pagos obtenidos exitosamente',
                data: payments
            });

        } catch (error) {
            console.error('Error al obtener pagos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
);

// Ruta GET /payments/:id - Obtener pago específico
router.get('/payments/:id', 
    authenticateToken, 
    authorizeRole(['cajero', 'supervisor', 'superusuario']), 
    async (req, res) => {
        try {
            const payment = await Payment.findById(req.params.id);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Pago no encontrado'
                });
            }

            // Verificar que el usuario puede ver este pago
            if (payment.processedBy.toString() !== req.userId && req.userRole !== 'superusuario') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver este pago'
                });
            }

            res.json({
                success: true,
                message: 'Pago obtenido exitosamente',
                data: payment
            });

        } catch (error) {
            console.error('Error al obtener pago:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
);

// Ruta DELETE /payments/:id - Eliminar pago
router.delete('/payments/:id', 
    authenticateToken, 
    authorizeRole(['cajero', 'supervisor', 'superusuario']), 
    async (req, res) => {
        try {
            const payment = await Payment.findById(req.params.id);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Pago no encontrado'
                });
            }

            // Verificar que el usuario puede eliminar este pago
            if (payment.processedBy.toString() !== req.userId && req.userRole !== 'superusuario') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para eliminar este pago'
                });
            }

            // Eliminar archivo físico
            if (fs.existsSync(payment.imageUrl)) {
                fs.unlinkSync(payment.imageUrl);
            }

            // Eliminar registro de la base de datos
            await Payment.findByIdAndDelete(req.params.id);

            res.json({
                success: true,
                message: 'Pago eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar pago:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
);

module.exports = router; 