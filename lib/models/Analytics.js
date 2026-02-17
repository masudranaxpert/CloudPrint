import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
    },
    pageViews: {
        type: Number,
        default: 0,
    },
    uniqueVisitors: {
        type: Number,
        default: 0,
    },
    calculatorUsage: {
        type: Number,
        default: 0,
    },
    toolsUsage: {
        compress: { type: Number, default: 0 },
        merge: { type: Number, default: 0 },
        split: { type: Number, default: 0 },
        invert: { type: Number, default: 0 },
    },
    orderClicks: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

export default mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
