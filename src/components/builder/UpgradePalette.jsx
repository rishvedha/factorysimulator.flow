import React from 'react'

const UpgradePalette = ({ onUpgradeClick, selectedMachine }) => {
  const upgrades = [
    {
      id: 'iot',
      name: 'IoT Sensors',
      icon: '📡',
      description: 'Real-time monitoring & predictive maintenance',
      cost: 5000,
      effects: [
        'Reduces downtime by 30%',
        'Improves availability',
        'Predictive alerts'
      ],
      color: '#3b82f6'
    },
    {
      id: 'ai',
      name: 'AI Vision System',
      icon: '👁️',
      description: 'Automated quality inspection using computer vision',
      cost: 15000,
      effects: [
        'Reduces defects by 40%',
        '100% inspection coverage',
        'No human fatigue'
      ],
      color: '#8b5cf6'
    },
    {
      id: 'automation',
      name: 'Robotic Automation',
      icon: '🤖',
      description: 'Automates manual tasks and material handling',
      cost: 25000,
      effects: [
        'Increases speed by 25%',
        'Reduces labor by 1 operator',
        '24/7 operation'
      ],
      color: '#10b981'
    },
    {
      id: 'energy',
      name: 'Energy Monitoring',
      icon: '⚡',
      description: 'Smart energy management and optimization',
      cost: 8000,
      effects: [
        'Reduces energy by 20%',
        'Peak load management',
        'Carbon footprint tracking'
      ],
      color: '#f59e0b'
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '8px' }}>
          Selected Machine:
        </div>
        <div style={{
          background: selectedMachine ? '#1e293b' : '#374151',
          borderRadius: '8px',
          padding: '12px',
          border: `1px solid ${selectedMachine ? '#3b82f6' : '#6b7280'}`,
          color: selectedMachine ? 'white' : '#9ca3af',
          fontSize: '0.875rem'
        }}>
          {selectedMachine ? selectedMachine.name : 'Select a machine first'}
        </div>
      </div>

      <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '12px' }}>
        Available Upgrades:
      </div>
      
      <div style={{ display: 'grid', gap: '12px' }}>
        {upgrades.map(upgrade => {
          const canApply = selectedMachine && !selectedMachine.upgrades.includes(upgrade.id)
          
          return (
            <div
              key={upgrade.id}
              onClick={() => canApply && onUpgradeClick(upgrade.id)}
              style={{
                background: '#1e293b',
                border: `1px solid ${upgrade.color}`,
                borderRadius: '12px',
                padding: '16px',
                cursor: canApply ? 'pointer' : 'not-allowed',
                opacity: canApply ? 1 : 0.5,
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (canApply) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 8px 20px ${upgrade.color}40`
                }
              }}
              onMouseOut={(e) => {
                if (canApply) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '28px' }}>
                  {upgrade.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: 'white', fontSize: '0.95rem' }}>
                    {upgrade.name}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                marginTop: '12px', 
                paddingTop: '12px', 
                borderTop: '1px solid #374151'
              }}>
                <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '8px' }}>
                  Effects:
                </div>
                <ul style={{ 
                  color: '#d1d5db', 
                  fontSize: '0.75rem',
                  paddingLeft: '16px',
                  margin: 0
                }}>
                  {upgrade.effects.map((effect, index) => (
                    <li key={index} style={{ marginBottom: '4px' }}>{effect}</li>
                  ))}
                </ul>
              </div>
              
              {selectedMachine && !canApply && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  textAlign: 'center'
                }}>
                  Already applied
                </div>
              )}
              
              {!selectedMachine && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px',
                  background: '#6b7280',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  textAlign: 'center'
                }}>
                  Select a machine
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UpgradePalette