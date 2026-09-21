import type { Paginated } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

type Params = Record<string, string | number | undefined>;

function buildUrl(path: string, params?: Params): string {
    const url = `${BASE_URL}${path}`;

    if (!params) {
        return url;
    }

    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
            query.set(key, String(value));
        }
    }

    const queryString = query.toString();

    return queryString ? `${url}?${queryString}` : url;
}

/** Fetch a single resource. Throws ApiError on any non-2xx response, including 404. */
export async function apiGet<T>(path: string, params?: Params): Promise<T> {
    const response = await fetch(buildUrl(path, params));

    if (!response.ok) {
        throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

/** Like apiGet, but returns null instead of throwing on a 404 (for "may not exist" detail pages). */
export async function apiGetOrNull<T>(path: string, params?: Params): Promise<T | null> {
    const response = await fetch(buildUrl(path, params));

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

/** Fetch a list endpoint and always return a plain array, unwrapping DRF's paginated envelope. */
export async function apiGetList<T>(path: string, params?: Params): Promise<T[]> {
    const data = await apiGet<Paginated<T> | T[]>(path, params);
    return Array.isArray(data) ? data : data.results;
}
