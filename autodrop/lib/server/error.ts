// types/api-error.ts

export class ApiError extends Error {
    status: number;
    details?: unknown;

    constructor(message: string, status: number = 500, details?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;

        // Maintain prototype chain for instanceof checks
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

type ErrorFactory = (msg?: string, details?: unknown) => ApiError;

export const createError: {
    badRequest: (msg: string, details?: unknown) => ApiError;
    unauthorized: ErrorFactory;
    forbidden: ErrorFactory;
    notFound: (msg: string, details?: unknown) => ApiError;
    conflict: (msg: string, details?: unknown) => ApiError;
    server: ErrorFactory;
} = {
    badRequest: (msg: string, details?: unknown) => new ApiError(msg, 400, details),
    unauthorized: (msg = "Unauthorized", details?: unknown) => new ApiError(msg, 401, details),
    forbidden: (msg = "Forbidden", details?: unknown) => new ApiError(msg, 403, details),
    notFound: (msg: string, details?: unknown) => new ApiError(msg, 404, details),
    conflict: (msg: string, details?: unknown) => new ApiError(msg, 409, details),
    server: (msg = "Server Error", details?: unknown) => new ApiError(msg, 500, details),
};
