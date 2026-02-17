import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Calculation from '@/lib/models/Calculation';
import Settings from '@/lib/models/Settings';

// GET /api/calculations?id=xxx - Get a single calculation by ID
// GET /api/calculations?all=true - Get all calculations (admin)
export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const all = searchParams.get('all');

        if (id) {
            const calc = await Calculation.findById(id);
            if (!calc) {
                return NextResponse.json({ error: 'Calculation not found or expired' }, { status: 404 });
            }
            return NextResponse.json(calc);
        }

        if (all === 'true') {
            const calculations = await Calculation.find({})
                .sort({ createdAt: -1 })
                .limit(100);
            return NextResponse.json({ calculations });
        }

        return NextResponse.json({ error: 'Missing id or all parameter' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch calculation' }, { status: 500 });
    }
}

// POST /api/calculations - Save a new calculation
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Get expiry days from settings (default 3)
        const expirySetting = await Settings.findOne({ key: 'calculationExpiryDays' });
        const expiryDays = expirySetting?.value || 3;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        const calc = await Calculation.create({
            items: body.items,
            grandTotal: body.grandTotal,
            totalSheets: body.totalSheets,
            expiresAt,
        });

        return NextResponse.json({ id: calc._id, expiresAt: calc.expiresAt }, { status: 201 });
    } catch (error) {
        console.error('Calculation save error:', error);
        return NextResponse.json({ error: 'Failed to save calculation' }, { status: 500 });
    }
}
