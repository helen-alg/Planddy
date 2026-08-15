import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, type Species } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

export function CreatePlant() {
    const { token } = useAuth()
    const navigate = useNavigate()
    const [species, setSpecies] = useState<Species[]>([])
    const [speciesId, setSpeciesId] = useState('')
    const [nickname, setNickname] = useState('')
    const [addingNewSpecies, setAddingNewSpecies] = useState(false)
    const [newSpeciesName, setNewSpeciesName] = useState('')
    const [newSpeciesInterval, setNewSpeciesInterval] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        api.getSpecies().then(setSpecies).catch(() => setError('Arten konnten nicht geladen werden.'))
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!token) return
        setError(null)
        setLoading(true)
        try {
            let finalSpeciesId = speciesId
            if (addingNewSpecies) {
                const created = await api.createSpecies({
                    name: newSpeciesName,
                    careWaterIntervalDays: newSpeciesInterval ? Number(newSpeciesInterval) : null,
                })
                finalSpeciesId = created.id
            }
            if (!finalSpeciesId) {
                setError('Bitte eine Art auswählen oder eine neue anlegen.')
                setLoading(false)
                return
            }
            await api.createPlant(token, { speciesId: finalSpeciesId, nickname })
            navigate('/plants')
        } catch {
            setError('Pflanze konnte nicht angelegt werden.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-8 max-w-sm mx-auto space-y-4">
                <h1 className="text-2xl font-semibold">Neue Pflanze</h1>

                <input
                    type="text"
                    placeholder="Spitzname (z.B. Meine Monstera)"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    className="w-full rounded bg-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {!addingNewSpecies ? (
                    <div className="space-y-2">
                        <select
                            value={speciesId}
                            onChange={(e) => setSpeciesId(e.target.value)}
                            className="w-full rounded bg-slate-700 px-3 py-2"
                        >
                            <option value="">-- Art wählen --</option>
                            {species.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setAddingNewSpecies(true)}
                            className="text-sm text-emerald-400 hover:text-emerald-300"
                        >
                            + Art nicht dabei? Neue Art anlegen
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2 border border-slate-600 rounded p-3">
                        <input
                            type="text"
                            placeholder="Name der Art (z.B. Monstera Deliciosa)"
                            value={newSpeciesName}
                            onChange={(e) => setNewSpeciesName(e.target.value)}
                            required
                            className="w-full rounded bg-slate-700 px-3 py-2"
                        />
                        <input
                            type="number"
                            placeholder="Gießintervall in Tagen (optional)"
                            value={newSpeciesInterval}
                            onChange={(e) => setNewSpeciesInterval(e.target.value)}
                            className="w-full rounded bg-slate-700 px-3 py-2"
                        />
                        <button
                            type="button"
                            onClick={() => setAddingNewSpecies(false)}
                            className="text-sm text-slate-400 hover:text-white"
                        >
                            Stattdessen vorhandene Art wählen
                        </button>
                    </div>
                )}

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
                >
                    {loading ? '...' : 'Pflanze anlegen'}
                </button>
            </form>
        </div>
    )
}