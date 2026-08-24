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
        <div className="min-h-screen bg-paper flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="tag-card w-full max-w-sm p-8 space-y-4">
                <h1 className="font-display text-3xl text-ink">{isRegistering ? 'Registrieren' : 'Willkommen zurück'}</h1>
                <p className="text-ink-soft text-sm -mt-2">Dein persönliches Pflanzenjournal</p>

                <input
                    type="email"
                    placeholder="E-Mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:ring-2 focus:ring-moss font-body"
                />
                <input
                    type="password"
                    placeholder="Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:ring-2 focus:ring-moss font-body"
                />

                {error && <p className="text-bloom text-sm font-mono">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-moss text-white py-2 font-medium hover:bg-moss-dark disabled:opacity-50 transition-colors"
                >
                    {loading ? '...' : isRegistering ? 'Konto erstellen' : 'Anmelden'}
                </button>

                <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="w-full text-sm text-soil hover:text-ink transition-colors"
                >
                    {isRegistering ? 'Schon ein Konto? Anmelden' : 'Neu hier? Konto erstellen'}
                </button>
            </form>
        </div>
    )
}