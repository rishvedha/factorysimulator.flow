import React, { useState } from 'react'
import { useSimulation } from '../../context/SimulationContext'

export default function Sidebar() {
  const { state } = useSimulation()
  const [selectedMachine, setSelectedMachine] = useState('filler')
  
  const machines = Object.values(state.machines)
  const selectedMachineData = state.machines[selectedMachine]
  
  return (
    <div style={{
      width: '280px',
      background: '#111827',
      borderRight: '1px solid #334155',
      height: 'calc(100vh - 70px)',
      overflowY: 'auto',
      padding: '20px'
    }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '20px' }}>
        Machine Dashboard
      </h2>
      
      {/* Machine List */}
      <div style={{ marginBottom: '24px' }}>
        {machines.map((machine) => (
          <button
            key={machine.id}
            onClick={() => setSelectedMachine(machine.id)}
            style={{
              width: '100%',
              padding: '16px',
              background: selectedMachine === machine.id ? 'rgba(59, 130, 246, 0.2)' : '#1f2937',
              border: selectedMachine === machine.id ? '1px solid #3b82f6' : '1px solid #374151',
              borderRadius: '8px',
              textAlign: 'left',
              marginBottom: '8px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '20px' }}>
                  {machine.id === 'filler' ? '💧' : 
                   machine.id === 'capper' ? '🔩' : 
                   machine.id === 'labeler' ? '🏷️' : '📦'}
                </div>
                <div>
                  <div style={{ fontWeight: '500' }}>{machine.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{machine.speed} bpm</div>
                </div>
              </div>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: machine.status === 'running' ? '#10b981' : 
                           machine.status === 'warning' ? '#f59e0b' : '#ef4444'
              }} />
            </div>
          </button>
        ))}
      </div>
      
      {/* Selected Machine Details */}
      {selectedMachineData && (
        <div style={{
          background: '#1f2937',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #374151'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
            {selectedMachineData.name}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '4px' }}>Speed</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>{selectedMachineData.speed} bpm</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '4px' }}>Efficiency</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{selectedMachineData.efficiency}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '4px' }}>Temp</div>
              <div style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: selectedMachineData.temperature > 70 ? '#f59e0b' : '#60a5fa'
              }}>
                {selectedMachineData.temperature}°C
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '4px' }}>Energy</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fbbf24' }}>{selectedMachineData.energyCost} kW</div>
            </div>
          </div>
          
          {/* Upgrades */}
          <div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '8px' }}>Active Upgrades</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedMachineData.upgrades.length > 0 ? (
                selectedMachineData.upgrades.map((upgrade, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '4px 12px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#60a5fa',
                      borderRadius: '20px',
                      fontSize: '0.75rem'
                    }}
                  >
                    {upgrade}
                  </div>
                ))
              ) : (
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>No upgrades applied</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}