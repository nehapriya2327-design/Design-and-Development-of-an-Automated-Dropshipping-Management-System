import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/webhooks/shopify-cancelled",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Skip auth for public routes
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // ✅ Extract token from Authorization header
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: No token" },
      { status: 401 }
    );
  }

  // ✅ Await token verification (with jose)
  const decoded = await verifyToken(token);
  if (!decoded || !decoded.id) {
    return NextResponse.json(
      { error: "Forbidden: Invalid token" },
      { status: 403 }
    );
  }

  // ✅ Pass decoded info as custom headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", String(decoded.id));
  requestHeaders.set("x-user-email", String(decoded.email || ""));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/:path*"],
};
