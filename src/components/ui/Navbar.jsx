import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSimulation } from '../../context/SimulationContext'

export default function Navbar() {
  const location = useLocation()
  const { state, toggleSimulation } = useSimulation()
  
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/console', label: 'Console', icon: '💻' }
  ]
  
  return (
    <nav style={{
      background: '#1e293b',
      borderBottom: '1px solid #334155',
      padding: '16px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '28px' }}>🏭</div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>Smart Factory</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Simulator v1.0</div>
          </div>
        </div>
        
        {/* Navigation */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? 'white' : '#d1d5db',
                  background: isActive ? '#3b82f6' : 'transparent',
                  fontWeight: '500'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
        
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Production</div>
            <div style={{ fontWeight: 'bold', color: 'white' }}>
              {state.bottlesPerMinute} <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>bpm</span>
            </div>
          </div>
          
          <button
            onClick={toggleSimulation}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: state.simulationRunning ? '#dc2626' : '#16a34a',
              color: 'white',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {state.simulationRunning ? '⏸️ Pause' : '▶️ Start'}
          </button>
        </div>
      </div>
    </nav>
  )
}