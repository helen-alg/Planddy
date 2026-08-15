import { createContext, useContext, useState, type ReactNode } from 'react'

interface AuthContextType {
    token: string | null
    login: (token: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('planddy_token'))

    const login = (newToken: string) => {
        localStorage.setItem('planddy_token', newToken)
        setToken(newToken)
    }

    const logout = () => {
        localStorage.removeItem('planddy_token')
        setToken(null)
    }

    return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}