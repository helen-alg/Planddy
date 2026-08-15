import { useAuth } from './lib/AuthContext'
import { Login } from './pages/Login'
import { AuthenticatedApp } from './AuthenticatedApp'

function App() {
  const { token } = useAuth()
  return token ? <AuthenticatedApp /> : <Login />
}

export default App
