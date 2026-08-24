import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { PlantList } from './pages/PlantList'
import { CreatePlant } from './pages/CreatePlant.tsx'
import { useAuth } from './lib/AuthContext'

export function AuthenticatedApp() {
    const { logout } = useAuth()
    return (
        <BrowserRouter>
            <nav className="bg-paper-deep border-b border-line px-6 py-4 flex gap-6 items-center font-body">
                <span className="font-display text-lg text-ink mr-2">🌿 Planddy</span>
                <Link to="/dashboard" className="text-ink-soft hover:text-moss transition-colors">Dashboard</Link>
                <Link to="/plants" className="text-ink-soft hover:text-moss transition-colors">Pflanzen</Link>
                <Link to="/plants/new" className="text-ink-soft hover:text-moss transition-colors">+ Neue Pflanze</Link>
                <button onClick={logout} className="ml-auto text-sm text-soil hover:text-ink transition-colors">Abmelden</button>
            </nav>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/plants" element={<PlantList />} />
                <Route path="/plants/new" element={<CreatePlant />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    )
}