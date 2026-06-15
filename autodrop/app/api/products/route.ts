// example case with authentication middleware
import { authenticate } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const user = await authenticate(req);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Proceed with actual logic
    return NextResponse.json({ message: `Hello ${user.email}` });
}
