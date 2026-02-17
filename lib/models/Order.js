import mongoose from 'mongoose';

const PdfItemSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    pageCount: { type: Number, required: true },
    printType: { type: String, enum: ['bw', 'color'], default: 'bw' },
    slidesPerPage: { type: Number, enum: [1, 2, 4, 8, 16], default: 1 },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
        trim: true,
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true,
    },
    pdfs: {
        type: [PdfItemSchema],
        required: true,
        validate: [arr => arr.length > 0, 'At least one PDF is required'],
    },
    totalPages: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending',
    },
    orderChannel: {
        type: String,
        enum: ['whatsapp', 'telegram', 'manual'],
        default: 'whatsapp',
    },
    calculationUrl: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
