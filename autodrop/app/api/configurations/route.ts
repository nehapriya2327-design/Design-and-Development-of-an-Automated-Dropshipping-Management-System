import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Mock user
const mockUser = { id: 1, name: 'John Doe' };

// GET
export async function GET() {
    try {
        const configurations = await prisma.configuration.findMany({
            where: { userId: mockUser.id },
        });

        return NextResponse.json(configurations);
    } catch (error) {
        console.error('Error fetching configurations:', error);
        return NextResponse.json({ error: 'Failed to fetch configurations' }, { status: 500 });
    }
}

// POST
export async function POST(request: Request) {
    try {
        // Ensure only one configuration per user
        const existingConfigs = await prisma.configuration.findMany({
            where: { userId: mockUser.id },
        });
        if (existingConfigs.length > 0) {
            return NextResponse.json({ error: 'Only one configuration is allowed' }, { status: 400 });
        }

        const { category, salesTax, categoryFee, profitMargin } = await request.json();

        const configuration = await prisma.configuration.create({
            data: {
                userId: mockUser.id,
                category,
                salesTax,
                categoryFee,
                profitMargin,
            },
        });

        return NextResponse.json({ message: 'Configuration saved successfully', configuration });
    } catch (error) {
        console.error('Error saving configuration:', error);
        return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
    }
}

// PUT
export async function PUT(request: NextRequest) {
    try {
        const userId = request.headers.get('X-User-Id');
        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 401 });
        }

        const id = request.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
        }

        console.log('Updating configuration for user:', id);

        const { category, salesTax, categoryFee, profitMargin } = await request.json();

        const configuration = await prisma.configuration.update({
            where: { id: Number(id), userId: Number(userId) },
            data: {
                category,
                salesTax,
                categoryFee,
                profitMargin
            },
        });

        return NextResponse.json({ message: 'Configuration updated successfully', configuration });
    } catch (error) {
        console.error('Error updating configuration:', error);
        return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
    }
}