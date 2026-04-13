import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

function App() {
  const token = localStorage.getItem('access_token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard/*" element={token ? <Dashboard /> : <Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/auth"} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
