import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { PlantList } from './pages/PlantList'
import { CreatePlant } from './pages/CreatePlant.tsx'
import { useAuth } from './lib/AuthContext'

export function AuthenticatedApp() {
    const { logout } = useAuth()
    return (
        <BrowserRouter>
            <nav className="bg-slate-950 text-white px-6 py-3 flex gap-4 items-center">
                <Link to="/dashboard" className="hover:text-emerald-400">Dashboard</Link>
                <Link to="/plants" className="hover:text-emerald-400">Pflanzen</Link>
                <Link to="/plants/new" className="hover:text-emerald-400">+ Neue Pflanze</Link>
                <button onClick={logout} className="ml-auto text-sm text-slate-400 hover:text-white">Abmelden</button>
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