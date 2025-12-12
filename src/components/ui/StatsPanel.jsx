import React from 'react'
import { useSimulation } from '../../context/SimulationContext'

export default function StatsPanel() {
  const { state } = useSimulation()
  
  const stats = [
    { label: 'Bottles Produced', value: state.bottlesProduced.toLocaleString(), icon: '🧴', color: '#60a5fa' },
    { label: 'Energy Consumption', value: `${state.energyConsumption} kWh`, icon: '⚡', color: '#fbbf24' },
    { label: 'Total Downtime', value: `${state.totalDowntime} mins`, icon: '⏱️', color: '#f87171' },
    { label: 'Cost Savings', value: `$${state.moneySaved.toLocaleString()}`, icon: '💰', color: '#10b981' },
    { label: 'OEE Score', value: `${state.oee.toFixed(1)}%`, icon: '📈', color: '#8b5cf6' },
    { label: 'Active Alerts', value: '2', icon: '⚠️', color: '#f59e0b' }
  ]
  
  return (
    <div style={{
      background: '#1e293b',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #334155',
      marginBottom: '24px'
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
        Live Production Stats
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = stat.color
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = '#374151'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '24px' }}>{stat.icon}</div>
              <div style={{ fontSize: '0.875rem', color: stat.color, fontWeight: '500' }}>+12.5%</div>
            </div>
            
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: stat.color, marginBottom: '4px' }}>
              {stat.value}
            </div>
            
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{stat.label}</div>
          </div>
        ))}
      </div>
      
      {/* Production Rate Bar */}
      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #374151' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Current Production Rate</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
              {state.bottlesPerMinute} <span style={{ fontSize: '1rem', color: '#9ca3af' }}>bottles/min</span>
            </div>
          </div>
          <div style={{
            padding: '6px 12px',
            background: state.bottlesPerMinute > 40 ? 'rgba(16, 185, 129, 0.2)' : 
                       state.bottlesPerMinute > 30 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: state.bottlesPerMinute > 40 ? '#10b981' : 
                   state.bottlesPerMinute > 30 ? '#f59e0b' : '#ef4444',
            borderRadius: '20px',
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
            {state.bottlesPerMinute > 40 ? 'Optimal' : state.bottlesPerMinute > 30 ? 'Good' : 'Low'}
          </div>
        </div>
        
        <div style={{ height: '8px', background: '#374151', borderRadius: '4px', overflow: 'hidden' }}>
          <div 
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #10b981, #fbbf24, #ef4444)',
              width: `${(state.bottlesPerMinute / 60) * 100}%`,
              borderRadius: '4px'
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: '#6b7280' }}>
          <span>0 bpm</span>
          <span>Target: 50 bpm</span>
          <span>60 bpm</span>
        </div>
      </div>
    </div>
  )
}