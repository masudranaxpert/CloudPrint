import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pricing from '@/lib/models/Pricing';

// GET /api/pricing - Get current pricing
export async function GET() {
    try {
        await dbConnect();

        let pricing = await Pricing.findOne().sort({ updatedAt: -1 });

        // If no pricing exists, create default
        if (!pricing) {
            pricing = await Pricing.create({
                blackWhitePerPage: 1.3,
                colorPerPage: 2.6,
                slidesPerPageOptions: [1, 2, 4],
            });
        }

        return NextResponse.json(pricing);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
    }
}

// PUT /api/pricing - Update pricing (admin only)
export async function PUT(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { blackWhitePerPage, colorPerPage, slidesPerPageOptions } = body;

        let pricing = await Pricing.findOne().sort({ updatedAt: -1 });

        if (pricing) {
            pricing.blackWhitePerPage = blackWhitePerPage ?? pricing.blackWhitePerPage;
            pricing.colorPerPage = colorPerPage ?? pricing.colorPerPage;
            pricing.slidesPerPageOptions = slidesPerPageOptions ?? pricing.slidesPerPageOptions;
            pricing.updatedBy = 'admin';
            await pricing.save();
        } else {
            pricing = await Pricing.create({
                blackWhitePerPage: blackWhitePerPage ?? 1.3,
                colorPerPage: colorPerPage ?? 2.6,
                slidesPerPageOptions: slidesPerPageOptions ?? [1, 2, 4],
            });
        }

        return NextResponse.json(pricing);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 });
    }
}
