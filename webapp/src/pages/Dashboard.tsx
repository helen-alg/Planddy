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
        <div className="min-h-screen bg-paper p-6">
            <h1 className="font-display text-3xl text-ink mb-6">Dein Garten</h1>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="tag-card p-4">
                    <p className="text-soil text-xs font-mono uppercase tracking-wide">Pflanzen gesamt</p>
                    <p className="font-display text-4xl text-ink mt-1">{statuses.length}</p>
                </div>
                <div className="tag-card p-4">
                    <p className="text-soil text-xs font-mono uppercase tracking-wide">Überfällig</p>
                    <p className="font-display text-4xl text-bloom mt-1">{overdueCount}</p>
                </div>
                <div className="tag-card p-4">
                    <p className="text-soil text-xs font-mono uppercase tracking-wide">Bald fällig</p>
                    <p className="font-display text-4xl text-moss mt-1">{dueSoonCount}</p>
                </div>
            </div>

            {loading && <p className="text-ink-soft font-mono text-sm">Lädt...</p>}

            <ul className="space-y-3">
                {statuses.map(({ plant, species, nextDueAt, overdue }) => (
                    <li key={plant.id} className="tag-card p-4 flex justify-between items-center">
                        <div>
                            <p className="font-display text-lg text-ink">{plant.nickname}</p>
                            <p className="text-sm text-ink-soft">{species?.name ?? 'Unbekannte Art'}</p>
                        </div>
                        <span className={`font-mono text-xs px-2 py-1 rounded ${overdue ? 'bg-bloom-soft text-bloom' : 'bg-paper-deep text-ink-soft'}`}>
            {nextDueAt
                ? overdue ? 'Überfällig' : `Fällig ${nextDueAt.toLocaleDateString('de-DE')}`
                : 'Kein Intervall'}
          </span>
                    </li>
                ))}
            </ul>

            {!loading && statuses.length === 0 && (
                <p className="text-ink-soft">
                    Noch keine Pflanzen. <Link to="/plants/new" className="text-moss underline">Erste Pflanze anlegen</Link>
                </p>
            )}
        </div>
    )}