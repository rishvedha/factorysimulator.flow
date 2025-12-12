import React, { useState } from 'react'

const MachineProperties = ({ machine, onUpdate }) => {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    cycleTime: machine.cycleTime,
    operators: machine.operators,
    efficiency: 85
  })

  const handleSave = () => {
    onUpdate(formData)
    setEditing(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
          Machine Properties
        </h2>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          style={{
            padding: '8px 16px',
            background: editing ? '#10b981' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          {editing ? '💾 Save Changes' : '✏️ Edit'}
        </button>
      </div>

      {/* Machine Info */}
      <div style={{
        background: '#1e293b',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #334155',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            fontSize: '32px',
            background: `${machine.color}20`,
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {machine.icon}
          </div>
          <div>
            <div style={{ fontWeight: '600', color: 'white', fontSize: '1.125rem' }}>
              {machine.name}
            </div>
            <div style={{ color: machine.color, fontSize: '0.875rem' }}>
              ID: {machine.id.substring(0, 8)}...
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '4px' }}>
              Position
            </div>
            <div style={{ color: 'white', fontWeight: '500' }}>
              ({machine.position.x}, {machine.position.y})
            </div>
          </div>
          <div>
            <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '4px' }}>
              Status
            </div>
            <div style={{ 
              color: '#10b981', 
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
              Ready
            </div>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div style={{
        background: '#1e293b',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #334155',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '16px' }}>
          Configuration
        </h3>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Cycle Time */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Cycle Time (seconds)
              </div>
              <div style={{ color: 'white', fontWeight: '500' }}>
                {editing ? (
                  <input
                    type="number"
                    value={formData.cycleTime}
                    onChange={(e) => setFormData({...formData, cycleTime: Number(e.target.value)})}
                    style={{
                      width: '80px',
                      padding: '4px 8px',
                      background: '#374151',
                      border: '1px solid #475569',
                      borderRadius: '4px',
                      color: 'white',
                      textAlign: 'center'
                    }}
                  />
                ) : (
                  `${machine.cycleTime}s`
                )}
              </div>
            </div>
            <div style={{ 
              height: '6px', 
              background: '#374151', 
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: '#3b82f6',
                width: `${100 - (machine.cycleTime / 10) * 100}%`,
                borderRadius: '3px'
              }} />
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.75rem',
              color: '#6b7280',
              marginTop: '4px'
            }}>
              <span>Fast</span>
              <span>Optimal</span>
              <span>Slow</span>
            </div>
          </div>

          {/* Operators */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Operators Required
              </div>
              <div style={{ color: 'white', fontWeight: '500' }}>
                {editing ? (
                  <input
                    type="number"
                    value={formData.operators}
                    onChange={(e) => setFormData({...formData, operators: Number(e.target.value)})}
                    style={{
                      width: '80px',
                      padding: '4px 8px',
                      background: '#374151',
                      border: '1px solid #475569',
                      borderRadius: '4px',
                      color: 'white',
                      textAlign: 'center'
                    }}
                  />
                ) : (
                  machine.operators
                )}
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '8px'
            }}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: '8px',
                    background: i < machine.operators ? '#f59e0b' : '#374151',
                    borderRadius: '4px'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Efficiency */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Machine Efficiency
              </div>
              <div style={{ color: 'white', fontWeight: '500' }}>
                {editing ? (
                  <input
                    type="number"
                    value={formData.efficiency}
                    onChange={(e) => setFormData({...formData, efficiency: Number(e.target.value)})}
                    style={{
                      width: '80px',
                      padding: '4px 8px',
                      background: '#374151',
                      border: '1px solid #475569',
                      borderRadius: '4px',
                      color: 'white',
                      textAlign: 'center'
                    }}
                  />
                ) : (
                  `${machine.efficiency || 85}%`
                )}
              </div>
            </div>
            <div style={{ 
              height: '6px', 
              background: '#374151', 
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: machine.efficiency > 90 ? '#10b981' : 
                           machine.efficiency > 80 ? '#f59e0b' : '#ef4444',
                width: `${machine.efficiency || 85}%`,
                borderRadius: '3px'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Applied Upgrades */}
      <div style={{
        background: '#1e293b',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #334155'
      }}>
        <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '16px' }}>
          Applied Upgrades ({machine.upgrades.length})
        </h3>
        
        {machine.upgrades.length > 0 ? (
          <div style={{ display: 'grid', gap: '8px' }}>
            {machine.upgrades.map((upgradeId, index) => {
              const upgradeData = {
                iot: { name: 'IoT Sensors', color: '#3b82f6', icon: '📡' },
                ai: { name: 'AI Vision', color: '#8b5cf6', icon: '👁️' },
                automation: { name: 'Automation', color: '#10b981', icon: '🤖' },
                energy: { name: 'Energy Monitor', color: '#f59e0b', icon: '⚡' }
              }[upgradeId]
              
              return (
                <div
                  key={index}
                  style={{
                    background: `${upgradeData.color}20`,
                    border: `1px solid ${upgradeData.color}`,
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    fontSize: '20px',
                    background: upgradeData.color,
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    {upgradeData.icon}
                  </div>
                  <div>
                    <div style={{ color: 'white', fontWeight: '500', fontSize: '0.875rem' }}>
                      {upgradeData.name}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                      Applied to this machine
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{
            background: '#374151',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚡</div>
            <div>No upgrades applied yet</div>
            <div style={{ fontSize: '0.75rem', marginTop: '8px' }}>
              Apply upgrades from the left panel
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MachineProperties