import api from './axios';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions<TData = unknown, TParams = Record<string, unknown>> {
    method: Method;
    url: string;
    data?: TData;
    params?: TParams;
    headers?: Record<string, string>;
}

export const request = async <TResponse = unknown, TData = unknown, TParams = Record<string, unknown>>(
    options: ApiOptions<TData, TParams>
): Promise<TResponse> => {
    try {
        const response = await api.request<TResponse>({
            method: options.method,
            url: options.url,
            data: options.data,
            params: options.params,
            headers: options.headers,
        });
        return response.data;
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'response' in error) {
            // @ts-expect-error: error type is unknown, but we expect response.data
            return Promise.reject(error.response?.data);
        }
        return Promise.reject((error as Error).message);
    }
};
