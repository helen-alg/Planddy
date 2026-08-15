import { useEffect, useState } from 'react'
import { api, type Plant } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

export function PlantList() {
    const { token, logout } = useAuth()
    const [plants, setPlants] = useState<Plant[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!token) return
        api.getPlants(token)
            .then(setPlants)
            .catch(() => setError('Pflanzen konnten nicht geladen werden.'))
            .finally(() => setLoading(false))
    }, [token])

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Meine Pflanzen</h1>
                <button onClick={logout} className="text-sm text-slate-400 hover:text-white">
                    Abmelden
                </button>
            </div>

            {loading && <p className="text-slate-400">Lädt...</p>}
            {error && <p className="text-red-400">{error}</p>}
            {!loading && !error && plants.length === 0 && (
                <p className="text-slate-400">Noch keine Pflanzen. Leg deine erste an!</p>
            )}

            <ul className="space-y-2">
                {plants.map((plant) => (
                    <li key={plant.id} className="bg-slate-800 rounded-lg p-4">
                        {plant.nickname}
                    </li>
                ))}
            </ul>
        </div>
    )
}