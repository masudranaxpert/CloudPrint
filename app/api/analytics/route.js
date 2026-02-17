import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Analytics from '@/lib/models/Analytics';

// GET /api/analytics - Get analytics data
export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const analytics = await Analytics.find({
            date: { $gte: startDate },
        }).sort({ date: -1 });

        // Aggregate totals
        const totals = analytics.reduce(
            (acc, day) => ({
                pageViews: acc.pageViews + day.pageViews,
                uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
                calculatorUsage: acc.calculatorUsage + day.calculatorUsage,
                orderClicks: acc.orderClicks + day.orderClicks,
                toolsUsage: {
                    compress: acc.toolsUsage.compress + (day.toolsUsage?.compress || 0),
                    merge: acc.toolsUsage.merge + (day.toolsUsage?.merge || 0),
                    split: acc.toolsUsage.split + (day.toolsUsage?.split || 0),
                    invert: acc.toolsUsage.invert + (day.toolsUsage?.invert || 0),
                },
            }),
            {
                pageViews: 0,
                uniqueVisitors: 0,
                calculatorUsage: 0,
                orderClicks: 0,
                toolsUsage: { compress: 0, merge: 0, split: 0, invert: 0 },
            }
        );

        return NextResponse.json({ analytics, totals, days });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}

// POST /api/analytics - Track an event
export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { event, tool } = body;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Ensure today's document exists with all fields initialized
        await Analytics.findOneAndUpdate(
            { date: today },
            {
                $setOnInsert: {
                    date: today,
                    pageViews: 0,
                    uniqueVisitors: 0,
                    calculatorUsage: 0,
                    orderClicks: 0,
                    toolsUsage: { compress: 0, merge: 0, split: 0, invert: 0 },
                },
            },
            { upsert: true, new: true }
        );

        // Now apply the increment
        const update = {};

        switch (event) {
            case 'pageView':
                update.$inc = { pageViews: 1, uniqueVisitors: 1 };
                break;
            case 'calculator':
                update.$inc = { calculatorUsage: 1 };
                break;
            case 'orderClick':
                update.$inc = { orderClicks: 1 };
                break;
            case 'tool':
                if (tool && ['compress', 'merge', 'split', 'invert'].includes(tool)) {
                    update.$inc = { [`toolsUsage.${tool}`]: 1 };
                }
                break;
            default:
                return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
        }

        await Analytics.findOneAndUpdate(
            { date: today },
            update
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics tracking error:', error);
        return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }
}
