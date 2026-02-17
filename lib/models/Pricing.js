import mongoose from 'mongoose';

const PricingSchema = new mongoose.Schema({
    blackWhitePerPage: {
        type: Number,
        required: true,
        default: 1.3,
    },
    colorPerPage: {
        type: Number,
        required: true,
        default: 2.6,
    },
    slidesPerPageOptions: {
        type: [Number],
        default: [1, 2, 4],
    },
    updatedBy: {
        type: String,
        default: 'admin',
    },
}, {
    timestamps: true,
});

export default mongoose.models.Pricing || mongoose.model('Pricing', PricingSchema);
