import { NextResponse } from "next/server";

type SuccessResponse<T> = {
    success: true;
    data: T;
    message?: string;
};

type ErrorResponse = {
    success: false;
    error: string;
    details?: unknown;
};

export function success<T>(data: T, message?: string, status = 200) {
    const res: SuccessResponse<T> = { success: true, data, message };
    return NextResponse.json(res, { status });
}

interface ErrorDetails {
    [key: string]: unknown;
}

export function error(message: string, status: number = 500, details?: ErrorDetails) {
    const res: ErrorResponse = { success: false, error: message, details };
    return NextResponse.json(res, { status });
}
