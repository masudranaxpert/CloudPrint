import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';

// GET /api/settings - Get all public settings
export async function GET() {
    try {
        await dbConnect();

        const whatsapp = await Settings.findOne({ key: 'whatsappNumber' });
        const telegram = await Settings.findOne({ key: 'telegramUsername' });
        const expiry = await Settings.findOne({ key: 'calculationExpiryDays' });

        return NextResponse.json({
            whatsappNumber: whatsapp?.value || process.env.WHATSAPP_NUMBER || '8801XXXXXXXXX',
            telegramUsername: telegram?.value || process.env.TELEGRAM_USERNAME || 'cloudprint_bd',
            calculationExpiryDays: expiry?.value || 3,
        });
    } catch (error) {
        return NextResponse.json({
            whatsappNumber: process.env.WHATSAPP_NUMBER || '8801XXXXXXXXX',
            telegramUsername: process.env.TELEGRAM_USERNAME || 'cloudprint_bd',
            calculationExpiryDays: 3,
        });
    }
}

// PUT /api/settings - Update settings (admin only)
export async function PUT(request) {
    try {
        await dbConnect();
        const body = await request.json();

        if (body.whatsappNumber) {
            await Settings.findOneAndUpdate(
                { key: 'whatsappNumber' },
                { value: body.whatsappNumber },
                { upsert: true }
            );
        }

        if (body.telegramUsername) {
            await Settings.findOneAndUpdate(
                { key: 'telegramUsername' },
                { value: body.telegramUsername },
                { upsert: true }
            );
        }

        if (body.calculationExpiryDays !== undefined) {
            await Settings.findOneAndUpdate(
                { key: 'calculationExpiryDays' },
                { value: Number(body.calculationExpiryDays) },
                { upsert: true }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
