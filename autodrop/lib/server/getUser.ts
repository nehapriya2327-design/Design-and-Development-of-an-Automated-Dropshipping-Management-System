// lib/server/getUser.ts
export function getUserFromRequest(req: Request) {
    return {
        id: Number(req.headers.get('x-user-id')),
        email: req.headers.get('x-user-email') || '',
    };
}
