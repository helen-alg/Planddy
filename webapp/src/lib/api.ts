const API_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
    status: number

    constructor(status: number, message: string) {
        super(message)
        this.status= status
    }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${API_URL}${path}`, { ...options, headers })

    if (!res.ok) {
        throw new ApiError(res.status, `Request failed: ${res.status}`)
    }
    if (res.status === 204) return undefined as T
    return res.json()
}

export const api = {
    register: (email: string, password: string) =>
        request<{ id: string }>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),

    login: (email: string, password: string) =>
        request<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

    getPlants: (token: string) =>
        request<Plant[]>('/plants', {}, token),
}

export interface Plant {
    id: string
    speciesId: string
    locationId: string | null
    nickname: string
    acquiredAt: string | null
    waterIntervalOverrideDays: number | null
    fertilizeIntervalOverrideDays: number | null
}