import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tutorial from '@/lib/models/Tutorial';

// GET /api/tutorials - Get all tutorials (public: only published, admin: all)
export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const admin = searchParams.get('admin') === 'true';

        const query = admin ? {} : { published: true };
        const tutorials = await Tutorial.find(query).sort({ order: 1, createdAt: -1 });

        return NextResponse.json({ tutorials });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tutorials' }, { status: 500 });
    }
}

// POST /api/tutorials - Create a new tutorial
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        const tutorial = await Tutorial.create({
            title: body.title,
            description: body.description || '',
            videoUrl: body.videoUrl,
            order: body.order || 0,
            published: body.published !== false,
        });

        return NextResponse.json(tutorial, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create tutorial' }, { status: 500 });
    }
}

// PUT /api/tutorials - Update a tutorial
export async function PUT(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, ...updateData } = body;

        const tutorial = await Tutorial.findByIdAndUpdate(id, updateData, { new: true });
        if (!tutorial) {
            return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
        }

        return NextResponse.json(tutorial);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update tutorial' }, { status: 500 });
    }
}

// DELETE /api/tutorials - Delete a tutorial
export async function DELETE(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await Tutorial.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete tutorial' }, { status: 500 });
    }
}
