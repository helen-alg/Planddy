import { useState } from 'react'
import { api, ApiError } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

export function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            if (isRegistering) {
                await api.register(email, password)
            }
            const { token } = await api.login(email, password)
            login(token)
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                setError('E-Mail oder Passwort falsch.')
            } else if (err instanceof ApiError && err.status === 409) {
                setError('Diese E-Mail ist schon registriert.')
            } else {
                setError('Etwas ist schiefgelaufen. Versuch es nochmal.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-8 w-full max-w-sm space-y-4">
                <h1 className="text-2xl font-semibold">{isRegistering ? 'Registrieren' : 'Anmelden'}</h1>

                <input
                    type="email"
                    placeholder="E-Mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded bg-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                    type="password"
                    placeholder="Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded bg-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
                >
                    {loading ? '...' : isRegistering ? 'Konto erstellen' : 'Anmelden'}
                </button>

                <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="w-full text-sm text-slate-400 hover:text-white"
                >
                    {isRegistering ? 'Schon ein Konto? Anmelden' : 'Neu hier? Konto erstellen'}
                </button>
            </form>
        </div>
    )
}