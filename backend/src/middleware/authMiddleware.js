const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Variable para la clave secreta del JWT
const JWT_SECRET = process.env.JWT_SECRET || 'checkmovil_secret_key_2024';

/**
 * Middleware de autenticación
 * Verifica si la solicitud incluye un token JWT válido
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

        // Verificar si el token está presente
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Verificar si el usuario existe en la base de datos
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
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

        // Agregar información del usuario al objeto req
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            isVerified: user.isVerified,
            status: user.status
        };

        next();

    } catch (error) {
        console.error('Error en middleware de autenticación:', error);

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

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware de autorización por roles
 * Verifica si el rol del usuario está permitido
 */
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // Verificar si el usuario está autenticado
            if (!req.userRole) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            // Verificar si el rol del usuario está permitido
            if (!allowedRoles.includes(req.userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Rol no autorizado',
                    requiredRoles: allowedRoles,
                    userRole: req.userRole
                });
            }

            next();

        } catch (error) {
            console.error('Error en middleware de autorización:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };
};

/**
 * Middleware para verificar si el usuario está verificado
 */
const requireVerification = (req, res, next) => {
    try {
        // Verificar si el usuario está autenticado
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Verificar si el usuario está verificado
        if (!req.user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Usuario no verificado. Se requiere verificación'
            });
        }

        next();

    } catch (error) {
        console.error('Error en middleware de verificación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar si el usuario es superusuario
 */
const requireSuperUser = authorizeRole(['superusuario']);

/**
 * Middleware para verificar si el usuario es supervisor o superusuario
 */
const requireSupervisor = authorizeRole(['supervisor', 'superusuario']);

/**
 * Middleware para verificar si el usuario es cajero, supervisor o superusuario
 */
const requireCajero = authorizeRole(['cajero', 'supervisor', 'superusuario']);

module.exports = {
    authenticateToken,
    authorizeRole,
    requireVerification,
    requireSuperUser,
    requireSupervisor,
    requireCajero
}; 