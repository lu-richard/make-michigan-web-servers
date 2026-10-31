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

// Django rejects writes from a logged-in session without this token; /me/ sets the csrftoken cookie it comes from.
function csrfHeaders(): Record<string, string> {
    const token = document.cookie.split('; ').find((c) => c.startsWith('csrftoken='))?.split('=')[1];
    return token ? { 'X-CSRFToken': token } : {};
}

// Apache answers API calls with 401 once the Okta session is gone (signed out, or idle past OIDCSessionInactivityTimeout).
// Reloading turns that into a page request, which Apache redirects to the Okta sign-in. The timestamp stops a reload loop
// if something other than an expired session keeps returning 401.
function reloadIfSessionExpired(response: Response) {
    if (response.status !== 401) {
        return;
    }

    try {
        const lastReload = Number(sessionStorage.getItem('sessionExpiredReloadAt'));

        if (Date.now() - lastReload < 10000) {
            return;
        }

        sessionStorage.setItem('sessionExpiredReloadAt', String(Date.now()));
    }
    catch {
        // Storage unavailable (e.g. blocked); reload anyway.
    }

    window.location.reload();
}

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

export async function apiGet<T>(path: string, params?: Params): Promise<T> {
    const response = await fetch(buildUrl(path, params));

    reloadIfSessionExpired(response);

    if (!response.ok) {
        throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export async function apiGetOrNull<T>(path: string, params?: Params): Promise<T | null> {
    const response = await fetch(buildUrl(path, params));

    reloadIfSessionExpired(response);

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export async function apiGetList<T>(path: string, params?: Params): Promise<T[]> {
    const data = await apiGet<Paginated<T> | T[]>(path, params);
    return Array.isArray(data) ? data : data.results;
}

export async function apiPost<T>(path: string, payload: Object): Promise<T> {
    const response = await fetch(buildUrl(path), {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            ...csrfHeaders()
        },
        body: JSON.stringify(payload)
    });

    reloadIfSessionExpired(response);

    if (!response.ok) {
        throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, payload: Object): Promise<T> {
    const response = await fetch(buildUrl(path), {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json',
            ...csrfHeaders()
        },
        body: JSON.stringify(payload)
    });

    reloadIfSessionExpired(response);

    if (!response.ok) {
        throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export async function apiDelete(path: string, params?: Params): Promise<void> {
    const response = await fetch(buildUrl(path, params), {
        method: "DELETE",
        headers: csrfHeaders()
    });

    reloadIfSessionExpired(response);

    if (!response.ok) {
        throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
    }
}