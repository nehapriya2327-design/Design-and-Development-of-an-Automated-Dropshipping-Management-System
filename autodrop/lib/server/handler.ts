import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "./error";
import { error } from "./response";

// Define or import ErrorDetails type
type ErrorDetails = {
    message?: string;
    stack?: string;
    [key: string]: string | undefined;
};

export function handlerWrapper(
    handler: (
        req: NextRequest,
        context: { params: { [key: string]: string } }
    ) => Promise<NextResponse>
) {
    return async function (
        req: NextRequest,
        context: { params: { [key: string]: string } }
    ): Promise<NextResponse> {
        try {
            return await handler(req, context);
        } catch (err) {
            console.error("[API Error]:", err);

            if (err instanceof ApiError) {
                return error(err.message, err.status, err.details as ErrorDetails | undefined);
            }

            if (err instanceof Error) {
                return error("Unexpected server error", 500, {
                    message: err.message,
                    stack: err.stack,
                });
            }
            return error("Unexpected server error", 500, {
                message: String(err),
            });
        }
    };
}
