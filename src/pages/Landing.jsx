import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/globals.css'

export default function Landing() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px'
    }}>
      <div className="text-center">
        {/* Logo/Icon */}
        <div style={{
          fontSize: '5rem',
          marginBottom: '24px',
          animation: 'float 3s ease-in-out infinite'
        }}>
          🏭
        </div>
        
        {/* Title */}
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px'
        }}>
          Smart Bottle Factory Simulator
        </h1>
        
        {/* Subtitle */}
        <p style={{
          fontSize: '1.25rem',
          color: '#d1d5db',
          maxWidth: '800px',
          margin: '0 auto 40px',
          lineHeight: '1.8'
        }}>
          Experience Industry 4.0 with our interactive factory simulation. 
          Optimize production, reduce costs, and maximize efficiency in real-time.
        </p>
        
        {/* CTA Button */}
        <Link 
          to="/dashboard" 
          style={{
            display: 'inline-block',
            padding: '16px 40px',
            fontSize: '1.125rem',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(37, 99, 235, 0.5)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(37, 99, 235, 0.4)'
          }}
        >
          🚀 Launch Simulation
        </Link>
        
        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginTop: '60px',
          maxWidth: '1000px'
        }}>
          {[
            { icon: '🔧', title: 'Real-time Monitoring', desc: 'Live 3D factory visualization' },
            { icon: '📊', title: 'Analytics Dashboard', desc: 'OEE, ROI, and performance metrics' },
            { icon: '⚡', title: 'Smart Upgrades', desc: 'Optimize machines for maximum efficiency' },
            { icon: '🤖', title: 'AI Predictions', desc: 'Predictive maintenance alerts' }
          ].map((feature, index) => (
            <div key={index} style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = '#475569'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = '#334155'
            }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: 'white' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}