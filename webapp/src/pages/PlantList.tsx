import { useEffect, useState } from 'react'
import { api, type Plant } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { Link } from 'react-router-dom'

export function PlantList() {
    const { token } = useAuth()
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
        <div className="min-h-screen bg-paper p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-display text-3xl text-ink">Meine Pflanzen</h1>
                <Link
                    to="/plants/new"
                    className="text-sm bg-moss text-white px-4 py-2 rounded-lg hover:bg-moss-dark transition-colors"
                >
                    + Neue Pflanze
                </Link>
            </div>

            {loading && <p className="text-ink-soft font-mono text-sm">Lädt...</p>}
            {error && <p className="text-bloom font-mono text-sm">{error}</p>}
            {!loading && !error && plants.length === 0 && (
                <p className="text-ink-soft">
                    Noch keine Pflanzen. <Link to="/plants/new" className="text-moss underline">Leg deine erste an!</Link>
                </p>
            )}

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plants.map((plant) => (
                    <li key={plant.id} className="tag-card p-4">
                        <p className="font-display text-lg text-ink">{plant.nickname}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}