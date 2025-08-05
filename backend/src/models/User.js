const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Definir el esquema de usuario
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'El nombre de usuario es requerido.'],
        unique: [true, 'El nombre de usuario ya está en uso.'],
        trim: true,
        minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres.'],
        maxlength: [30, 'El nombre de usuario no debe exceder los 30 caracteres.']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida.'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres.'],
        select: false // No retornar la contraseña en las consultas por defecto
    },
    pin: {
        type: String,
        match: [/^\d{4}$/, 'El PIN debe ser un número de 4 dígitos.'],
        select: false // No retornar el PIN en las consultas por defecto
    },
    role: {
        type: String,
        required: [true, 'El rol es requerido.'],
        enum: {
            values: ['superusuario', 'supervisor', 'cajero', 'pending'],
            message: 'Rol no válido. Los valores permitidos son: superusuario, supervisor, cajero, pending'
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: 'active',
        enum: {
            values: ['active', 'inactive', 'suspended'],
            message: 'Estado no válido. Los valores permitidos son: active, inactive, suspended'
        }
    }
}, {
    timestamps: true // Añade automáticamente createdAt y updatedAt
});

// Middleware pre-save para hashear la contraseña
UserSchema.pre('save', async function(next) {
    // Solo hashear la contraseña si ha sido modificada (o es nueva)
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        // Generar salt y hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar la contraseña ingresada con la almacenada
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
    return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error al comparar contraseñas');
    }
};

// Método para verificar si el usuario está activo
UserSchema.methods.isActive = function() {
    return this.status === 'active';
};

// Método para verificar si el usuario está verificado
UserSchema.methods.isUserVerified = function() {
    return this.isVerified === true;
};

// Método estático para buscar usuarios por rol
UserSchema.statics.findByRole = function(role) {
    return this.find({ role: role });
};

// Método estático para buscar usuarios activos
UserSchema.statics.findActive = function() {
    return this.find({ status: 'active' });
};

// Transformación toJSON para seguridad
UserSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.password; // Eliminar la contraseña por seguridad
        delete returnedObject.pin;      // Eliminar el PIN por seguridad
        return returnedObject;
    }
});

// Exportar el modelo
module.exports = mongoose.model('User', UserSchema); 