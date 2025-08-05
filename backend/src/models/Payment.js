const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    // Información del usuario que procesó el pago
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Información de la imagen
    imageUrl: {
        type: String,
        required: true
    },
    
    // Datos extraídos del pago (se llenarán con OCR)
    paymentData: {
        amount: {
            type: Number,
            default: null
        },
        currency: {
            type: String,
            default: 'USD'
        },
        paymentMethod: {
            type: String,
            default: null
        },
        transactionId: {
            type: String,
            default: null
        },
        merchantName: {
            type: String,
            default: null
        },
        date: {
            type: Date,
            default: null
        }
    },
    
    // Estado del procesamiento
    status: {
        type: String,
        enum: ['pending', 'processed', 'failed', 'verified'],
        default: 'pending'
    },
    
    // Resultado del procesamiento OCR
    ocrResult: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    
    // Notas adicionales
    notes: {
        type: String,
        default: ''
    },
    
    // Metadatos
    originalFilename: {
        type: String,
        required: true
    },
    
    fileSize: {
        type: Number,
        required: true
    },
    
    mimeType: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Añade automáticamente createdAt y updatedAt
});

// Método para verificar si el pago está procesado
PaymentSchema.methods.isProcessed = function() {
    return this.status === 'processed' || this.status === 'verified';
};

// Método para verificar si el pago falló
PaymentSchema.methods.isFailed = function() {
    return this.status === 'failed';
};

// Método para obtener el monto formateado
PaymentSchema.methods.getFormattedAmount = function() {
    if (this.paymentData.amount) {
        return `${this.paymentData.currency} ${this.paymentData.amount.toFixed(2)}`;
    }
    return 'No disponible';
};

// Transformación toJSON para seguridad
PaymentSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        return returnedObject;
    }
});

// Exportar el modelo
module.exports = mongoose.model('Payment', PaymentSchema); 