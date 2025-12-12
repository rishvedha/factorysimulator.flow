import React from 'react'
import { useSimulation } from '../context/SimulationContext'
import FactoryScene from '../components/canvas/FactoryScene'
import Navbar from '../components/ui/Navbar'
import Sidebar from '../components/ui/Sidebar'
import StatsPanel from '../components/ui/StatsPanel'
import OEECard from '../components/dashboard/OEECard'
import FinancialSummary from '../components/dashboard/FinancialSummary'
import ComparisonGraph from '../components/dashboard/ComparisonGraph'
import '../styles/globals.css'

export default function Dashboard() {
  const { state, toggleSimulation } = useSimulation()

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Navbar />
      
      <div style={{ display: 'flex' }}>
        <Sidebar />
        
        <div style={{ flex: 1, padding: '24px' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
              Factory Dashboard
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
              Real-time monitoring and optimization
            </p>
          </div>
          
          {/* Stats Panel */}
          <StatsPanel />
          
          {/* OEE Cards */}
          <OEECard />
          
          {/* 3D Factory */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white' }}>
                3D Factory View
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  Status: 
                  <span style={{ 
                    color: state.simulationRunning ? '#4ade80' : '#f87171',
                    fontWeight: '600',
                    marginLeft: '6px'
                  }}>
                    {state.simulationRunning ? 'RUNNING' : 'PAUSED'}
                  </span>
                </span>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: state.simulationRunning ? '#4ade80' : '#f87171',
                  animation: state.simulationRunning ? 'pulse 2s ease-in-out infinite' : 'none'
                }} />
              </div>
            </div>
            <FactoryScene />
          </div>
          
          {/* Analytics Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px',
            marginBottom: '32px'
          }}>
            <FinancialSummary />
            <ComparisonGraph />
          </div>
          
          {/* Control Panel */}
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={toggleSimulation}
                style={{
                  padding: '12px 32px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  background: state.simulationRunning 
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {state.simulationRunning ? '⏸️' : '▶️'}
                {state.simulationRunning ? ' Pause Simulation' : ' Start Simulation'}
              </button>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{
                  padding: '10px 20px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⚡ Apply Upgrade
                </button>
                <button style={{
                  padding: '10px 20px',
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📊 View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}