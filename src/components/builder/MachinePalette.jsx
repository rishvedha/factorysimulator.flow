import React from 'react'

const MachinePalette = ({ onDragStart }) => {
  const machines = [
    { id: 'feeder', name: 'Feeder', icon: '📦', color: '#3b82f6', cycleTime: 5, cost: '50k' },
    { id: 'blowMolder', name: 'Blow Molder', icon: '🔥', color: '#ef4444', cycleTime: 8, cost: '120k' },
    { id: 'filler', name: 'Filler', icon: '💧', color: '#10b981', cycleTime: 4, cost: '80k' },
    { id: 'capper', name: 'Capper', icon: '🔩', color: '#f59e0b', cycleTime: 3, cost: '60k' },
    { id: 'labeler', name: 'Labeler', icon: '🏷️', color: '#8b5cf6', cycleTime: 6, cost: '70k' },
    { id: 'packager', name: 'Packager', icon: '📦', color: '#ec4899', cycleTime: 7, cost: '90k' }
  ]

  const handleDragStart = (e, machineId) => {
    const machine = machines.find(m => m.id === machineId)
    
    // Set data
    e.dataTransfer.setData('text/plain', machineId)
    e.dataTransfer.setData('machineType', machineId)
    e.dataTransfer.setData('application/json', JSON.stringify(machine))
    
    // Visual feedback
    e.currentTarget.style.opacity = '0.4'
    
    if (onDragStart) onDragStart(machineId)
  }

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1'
  }

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {machines.map(machine => (
        <div
          key={machine.id}
          draggable
          onDragStart={(e) => handleDragStart(e, machine.id)}
          onDragEnd={handleDragEnd}
          style={{
            background: '#1e293b',
            border: `2px solid ${machine.color}`,
            borderRadius: '10px',
            padding: '12px',
            cursor: 'grab',
            transition: 'all 0.2s ease',
            userSelect: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              fontSize: '22px',
              background: `${machine.color}20`,
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {machine.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: 'white', fontSize: '0.9rem' }}>
                {machine.name}
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#9ca3af',
                marginTop: '4px'
              }}>
                <span>{machine.cycleTime}s</span>
                <span>{machine.cost}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MachinePalette