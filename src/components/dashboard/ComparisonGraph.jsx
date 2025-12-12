import React, { useState } from 'react'
import { useSimulation } from '../../context/SimulationContext'

export default function ComparisonGraph() {
  const { state } = useSimulation()
  const [chartType] = useState('line')
  
  const machines = Object.values(state.machines)
  
  // Historical data simulation
  const historicalData = [
    { hour: '8:00', production: 420 },
    { hour: '9:00', production: 480 },
    { hour: '10:00', production: 520 },
    { hour: '11:00', production: 510 },
    { hour: '12:00', production: 490 },
    { hour: '13:00', production: 530 },
    { hour: '14:00', production: 550 },
    { hour: '15:00', production: 540 }
  ]

  // Maximum values for scaling
  const maxValues = {
    "Speed (bpm)": 60,
    "Efficiency (%)": 100,
    "Failure Rate (%)": 10,
    "Energy Cost": 20
  }
  
  // Before/After comparison
  const comparisonData = [
    { 
      metric: 'Speed (bpm)', 
      before: 25.8, 
      after: machines.length 
        ? machines.reduce((sum, m) => sum + m.speed, 0) / machines.length
        : 0 
    },
    { 
      metric: 'Efficiency (%)', 
      before: 78.5, 
      after: machines.length 
        ? machines.reduce((sum, m) => sum + m.efficiency, 0) / machines.length
        : 0 
    },
    { 
      metric: 'Failure Rate (%)', 
      before: 3.2, 
      after: machines.length 
        ? machines.reduce((sum, m) => sum + m.failureRate, 0) / machines.length
        : 0 
    },
    { 
      metric: 'Energy Cost', 
      before: 5.2, 
      after: machines.length 
        ? machines.reduce((sum, m) => sum + m.energyCost, 0) / machines.length
        : 0 
    },
  ]
  
  return (
    <div style={{
      background: '#1e293b',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #334155'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📈 Performance Analytics
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: chartType === 'line' ? '#3b82f6' : '#374151',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            📈
          </button>
          <button
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: chartType === 'bar' ? '#3b82f6' : '#374151',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            📊
          </button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Machine Comparison */}
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
            Machine Performance
          </h3>
          <div style={{ height: '250px', padding: '20px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
            {machines.map(machine => (
              <div key={machine.id} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>{machine.name}</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ color: '#10b981', fontWeight: '500' }}>{machine.efficiency}%</span>
                    <span style={{ color: '#60a5fa', fontWeight: '500' }}>{machine.speed} bpm</span>
                  </div>
                </div>
                <div style={{ display: 'flex', height: '8px', gap: '4px' }}>
                  <div 
                    style={{
                      flex: machine.efficiency,
                      background: '#10b981',
                      borderRadius: '4px',
                      height: '100%'
                    }}
                  />
                  <div 
                    style={{
                      flex: machine.speed / 2,
                      background: '#60a5fa',
                      borderRadius: '4px',
                      height: '100%'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Historical Trend */}
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
            Production Trend
          </h3>
          <div style={{ 
            height: '250px', 
            padding: '20px', 
            background: '#0f172a', 
            borderRadius: '12px', 
            border: '1px solid #334155',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px'
          }}>
            {historicalData.map((data, index) => (
              <div key={index} style={{ textAlign: 'center', flex: 1 }}>
                <div 
                  style={{
                    height: `${(data.production / 600) * 100}%`,
                    background: 'linear-gradient(to top, #8b5cf6, #3b82f6)',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    minHeight: '20px'
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {data.hour}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Before/After Comparison */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
          Before vs After Upgrades
        </h3>
        <div style={{ height: '200px', padding: '20px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
          {comparisonData.map((data, index) => {
            const max = maxValues[data.metric] || 100

            return (
              <div key={index} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>{data.metric}</span>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{data.before.toFixed(1)}</span>
                    <span style={{ color: '#60a5fa', fontWeight: '500', fontSize: '0.875rem' }}>{data.after.toFixed(1)}</span>
                  </div>
                </div>

                {/* Corrected scaling */}
                <div style={{ display: 'flex', height: '6px', background: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
                  
                  {/* Before */}
                  <div 
                    style={{
                      width: `${(data.before / max) * 100}%`,
                      background: '#6b7280',
                      height: '100%'
                    }}
                  />

                  {/* After */}
                  <div 
                    style={{
                      width: `${(data.after / max) * 100}%`,
                      background: '#3b82f6',
                      height: '100%'
                    }}
                  />
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
