
import { hashPassword } from '@/lib/hash';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { email, password, name, role } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const hashedPassword = hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role,
        },
    });

    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } }, { status: 201 });
}
