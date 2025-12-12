import React from 'react'
import { useSimulation } from '../../context/SimulationContext'

export default function OEECards() {
  const { state } = useSimulation()
  
  const cards = [
    {
      title: 'Overall OEE',
      value: `${state.oee.toFixed(1)}%`,
      description: 'Overall Equipment Effectiveness',
      color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      icon: '📈',
      status: state.oee > 85 ? 'excellent' : state.oee > 70 ? 'good' : 'needs-improvement'
    },
    {
      title: 'Availability',
      value: `${state.availability.toFixed(1)}%`,
      description: 'Uptime vs Downtime',
      color: 'linear-gradient(135deg, #10b981, #059669)',
      icon: '✅',
      status: state.availability > 90 ? 'excellent' : state.availability > 80 ? 'good' : 'needs-improvement'
    },
    {
      title: 'Performance',
      value: `${state.performance.toFixed(1)}%`,
      description: 'Actual vs Maximum Speed',
      color: 'linear-gradient(135deg, #f59e0b, #d97706)',
      icon: '⚡',
      status: state.performance > 85 ? 'excellent' : state.performance > 75 ? 'good' : 'needs-improvement'
    },
    {
      title: 'Quality',
      value: `${state.quality.toFixed(1)}%`,
      description: 'Good vs Defective Output',
      color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      icon: '🎯',
      status: state.quality > 95 ? 'excellent' : state.quality > 90 ? 'good' : 'needs-improvement'
    }
  ]
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'excellent': return '#10b981'
      case 'good': return '#f59e0b'
      case 'needs-improvement': return '#ef4444'
      default: return '#9ca3af'
    }
  }
  
  const getStatusText = (status) => {
    switch(status) {
      case 'excellent': return 'Excellent'
      case 'good': return 'Good'
      case 'needs-improvement': return 'Needs Improvement'
      default: return ''
    }
  }
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            background: card.color,
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ fontSize: '28px' }}>{card.icon}</div>
            <div style={{
              padding: '4px 12px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: getStatusColor(card.status)
            }}>
              {getStatusText(card.status)}
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{card.value}</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{card.title}</div>
          </div>
          
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '20px' }}>{card.description}</div>
          
          {/* Progress Bar */}
          <div>
            <div style={{ height: '4px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '2px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: 'rgba(255, 255, 255, 0.7)',
                  width: `${parseFloat(card.value)}%`,
                  borderRadius: '2px'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '8px', opacity: 0.8 }}>
              <span>0%</span>
              <span>Target: {card.title === 'Quality' ? '99%' : '85%'}</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}