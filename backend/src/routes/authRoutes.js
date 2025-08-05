const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Variable para la clave secreta del JWT (en producción debería estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'checkmovil_secret_key_2024';

// Ruta POST /register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
    try {
        const { username, password, pin } = req.body;

        // Validar que los campos requeridos no estén vacíos
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username y password son requeridos'
            });
        }

        // Validar que el username tenga al menos 3 caracteres
        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'El username debe tener al menos 3 caracteres'
            });
        }

        // Validar que el password tenga al menos 6 caracteres
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Validar que el PIN sea obligatorio
        if (!pin) {
            return res.status(400).json({
                success: false,
                message: 'El PIN es obligatorio para definir tu rol'
            });
        }

        // Validar que el PIN tenga 4 dígitos
        if (!/^\d{4}$/.test(pin)) {
            return res.status(400).json({
                success: false,
                message: 'El PIN debe ser un número de 4 dígitos'
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El nombre de usuario ya está en uso'
            });
        }



        // Determinar el rol basado en el PIN
        let userRole = null;
        switch (pin) {
            // PINs para Cajero (múltiples usuarios permitidos)
            case '3725':
                userRole = 'cajero';
                break;
            // PINs para Supervisor (múltiples usuarios permitidos)
            case '2984':
                userRole = 'supervisor';
                break;
            // PIN único para Superusuario (solo un usuario)
            case '8101':
                // Verificar si ya existe un superusuario
                const existingSuperUser = await User.findOne({ role: 'superusuario' });
                if (existingSuperUser) {
                    return res.status(409).json({
                        success: false,
                        message: 'Ya existe un superusuario. Solo se permite un superusuario por sistema.'
                    });
                }
                userRole = 'superusuario';
                break;
            default:
                userRole = null; // PIN no válido
                break;
        }

        // Si el PIN no es válido, rechazar el registro
        if (!userRole) {
            return res.status(400).json({
                success: false,
                message: 'PIN no válido. Solo se permiten PINs preestablecidos para definir roles.'
            });
        }

        // Crear nuevo usuario con el rol determinado
        const newUser = new User({
            username,
            password,
            pin: pin,
            role: userRole,
            isVerified: false,
            status: 'active'
        });

        // Guardar el usuario (el hash de la contraseña se hace automáticamente en el middleware)
        await newUser.save();

        // Devolver respuesta de éxito
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
                isVerified: newUser.isVerified,
                status: newUser.status,
                createdAt: newUser.createdAt
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        
        // Manejar errores específicos de validación de Mongoose
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta POST /login - Iniciar sesión
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validar que los campos requeridos no estén vacíos
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username y password son requeridos'
            });
        }

        // Buscar el usuario por username e incluir la contraseña para comparación
        const user = await User.findOne({ username }).select('+password');
        
        // Si el usuario no existe
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si el usuario está activo
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo o suspendido'
            });
        }

        // Verificar la contraseña usando el método del modelo
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña incorrecta'
            });
        }

        // Generar JWT con id y role del usuario
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: '1h' // Token expira en 1 hora
            }
        );

        // Devolver respuesta con token y datos del usuario (sin password ni pin)
        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    isVerified: user.isVerified,
                    status: user.status,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta GET /verify - Verificar token (opcional, para testing)
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        // Verificar el token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Buscar el usuario
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Token válido',
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
                isVerified: user.isVerified,
                status: user.status
            }
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router; 