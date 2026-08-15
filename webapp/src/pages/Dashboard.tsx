import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Plant, type Species } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

interface PlantStatus {
    plant: Plant
    species: Species | undefined
    nextDueAt: Date | null
    overdue: boolean
}

export function Dashboard() {
    const { token } = useAuth()
    const [statuses, setStatuses] = useState<PlantStatus[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) return
        async function load() {
            const [plants, species] = await Promise.all([api.getPlants(token!), api.getSpecies()])
            const speciesById = new Map(species.map((s) => [s.id, s]))

            const results = await Promise.all(
                plants.map(async (plant) => {
                    const sp = speciesById.get(plant.speciesId)
                    const interval = plant.waterIntervalOverrideDays ?? sp?.careWaterIntervalDays ?? null
                    const events = await api.getWateringEvents(plant.id, token!)
                    const lastWatered = events
                        .map((e) => new Date(e.wateredAt))
                        .sort((a, b) => b.getTime() - a.getTime())[0]

                    let nextDueAt: Date | null = null
                    if (interval && lastWatered) {
                        nextDueAt = new Date(lastWatered.getTime() + interval * 24 * 60 * 60 * 1000)
                    }
                    return {
                        plant,
                        species: sp,
                        nextDueAt,
                        overdue: nextDueAt ? nextDueAt.getTime() < Date.now() : false,
                    }
                })
            )
            results.sort((a, b) => (a.nextDueAt?.getTime() ?? Infinity) - (b.nextDueAt?.getTime() ?? Infinity))
            setStatuses(results)
            setLoading(false)
        }
        load()
    }, [token])

    const overdueCount = statuses.filter((s) => s.overdue).length
    const dueSoonCount = statuses.filter(
        (s) => !s.overdue && s.nextDueAt && s.nextDueAt.getTime() < Date.now() + 2 * 24 * 60 * 60 * 1000
    ).length

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Pflanzen gesamt</p>
                    <p className="text-3xl font-bold">{statuses.length}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Überfällig</p>
                    <p className="text-3xl font-bold text-red-400">{overdueCount}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Bald fällig</p>
                    <p className="text-3xl font-bold text-amber-400">{dueSoonCount}</p>
                </div>
            </div>

            {loading && <p className="text-slate-400">Lädt...</p>}

            <ul className="space-y-2">
                {statuses.map(({ plant, species, nextDueAt, overdue }) => (
                    <li key={plant.id} className="bg-slate-800 rounded-lg p-4 flex justify-between items-center">
                        <div>
                            <p className="font-medium">{plant.nickname}</p>
                            <p className="text-sm text-slate-400">{species?.name ?? 'Unbekannte Art'}</p>
                        </div>
                        <span className={overdue ? 'text-red-400 text-sm' : 'text-slate-400 text-sm'}>
              {nextDueAt
                  ? overdue
                      ? 'Überfällig'
                      : `Fällig ${nextDueAt.toLocaleDateString('de-DE')}`
                  : 'Kein Gieß-Intervall gesetzt'}
            </span>
                    </li>
                ))}
            </ul>

            {!loading && statuses.length === 0 && (
                <p className="text-slate-400">
                    Noch keine Pflanzen. <Link to="/plants/new" className="text-emerald-400">Erste Pflanze anlegen</Link>
                </p>
            )}
        </div>
    )
}