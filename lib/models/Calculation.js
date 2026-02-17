import mongoose from 'mongoose';

const CalcItemSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    pageCount: { type: Number, required: true },
    printType: { type: String, enum: ['bw', 'color'], default: 'bw' },
    slidesPerPage: { type: Number, default: 1 },
    sheets: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
}, { _id: false });

const CalculationSchema = new mongoose.Schema({
    items: {
        type: [CalcItemSchema],
        required: true,
    },
    grandTotal: {
        type: Number,
        required: true,
    },
    totalSheets: {
        type: Number,
        default: 0,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});

// TTL index - MongoDB will auto-delete expired docs
CalculationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Calculation || mongoose.model('Calculation', CalculationSchema);
