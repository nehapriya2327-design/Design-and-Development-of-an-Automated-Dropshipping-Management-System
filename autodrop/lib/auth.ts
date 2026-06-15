import { verifyToken } from './jwt';

export async function authenticate(req: Request) {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1]; // Bearer <token>

    if (!token) return null;

    const decoded = verifyToken(token);
    return decoded;
}
