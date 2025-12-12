// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { SimulationProvider } from './context/SimulationContext'
import FactoryGrid2D from "./components/builder/FactoryGrid2D";
import Factory3DView from './simulation3d/Factory3DView'

export default function App() {
  return (
    <SimulationProvider>
      <Router>
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <header style={{ padding: '10px 16px', background: '#071026', color: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: 16 }}>FactorySim</Link>
            <nav style={{ display: 'flex', gap: 8 }}>
              <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Builder (2D)</Link>
              <Link to="/3d" style={{ color: '#94a3b8', textDecoration: 'none' }}>3D Viewer</Link>
            </nav>
          </header>

          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<FactoryGrid2D />} />
              <Route path="/3d" element={<Factory3DView />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SimulationProvider>
  )
}
