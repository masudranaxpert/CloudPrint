import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Calculation from '@/lib/models/Calculation';

// POST /api/calculations/cleanup - Delete all calculations (no time check)
export async function POST() {
    try {
        await dbConnect();

        const result = await Calculation.deleteMany({});

        return NextResponse.json({ deleted: result.deletedCount });
    } catch (error) {
        return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
    }
}
