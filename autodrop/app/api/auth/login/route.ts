import { comparePassword } from '@/lib/hash';
import { generateToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await comparePassword(password, user.password))) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await generateToken({ id: user.id, email: user.email, role: user.role });
    console.log('Generated token:', token); // ✅ DEBUG LOG

    return NextResponse.json({
        user: { id: user.id, email: user.email, role: user.role, name: user.name },
        token,
    });
}


export async function GET() {

}



export async function PUT() {
    
}