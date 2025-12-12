import React from 'react'

const ConnectionTool = ({ active, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '16px',
        background: active ? '#3b82f6' : '#1e293b',
        border: `1px solid ${active ? '#3b82f6' : '#334155'}`,
        borderRadius: '12px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        transition: 'all 0.3s ease',
        marginBottom: '16px'
      }}
      onMouseOver={(e) => {
        if (!active) {
          e.currentTarget.style.background = '#374151'
          e.currentTarget.style.borderColor = '#475569'
        }
      }}
      onMouseOut={(e) => {
        if (!active) {
          e.currentTarget.style.background = '#1e293b'
          e.currentTarget.style.borderColor = '#334155'
        }
      }}
    >
      <div style={{ fontSize: '24px' }}>🔗</div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontWeight: '600', fontSize: '1rem' }}>
          Connection Tool
        </div>
        <div style={{ fontSize: '0.75rem', color: active ? 'white' : '#9ca3af' }}>
          {active ? 'Click machines to connect' : 'Click to enable connection mode'}
        </div>
      </div>
    </button>
  )
}

export default ConnectionTool