import React from 'react'
import { useSimulation } from '../../context/SimulationContext'

export default function FinancialSummary() {
  const { state } = useSimulation()
  
  const calculateROI = () => {
    if (state.totalUpgradesCost === 0) return 0
    return ((state.moneySaved - state.totalUpgradesCost) / state.totalUpgradesCost * 100).toFixed(1)
  }
  
  const calculatePaybackPeriod = () => {
    const monthlySavings = state.moneySaved / 12
    if (monthlySavings === 0) return 'N/A'
    return (state.totalUpgradesCost / monthlySavings).toFixed(1)
  }
  
  const financialMetrics = [
    { title: 'Total Investment', value: `$${state.totalUpgradesCost.toLocaleString()}`, icon: '💰', color: '#60a5fa' },
    { title: 'Cost Savings', value: `$${state.moneySaved.toLocaleString()}`, icon: '📈', color: '#10b981' },
    { title: 'ROI', value: `${calculateROI()}%`, icon: '🎯', color: state.moneySaved > state.totalUpgradesCost ? '#10b981' : '#ef4444' },
    { title: 'Payback Period', value: `${calculatePaybackPeriod()} months`, icon: '⏱️', color: '#8b5cf6' },
    { title: 'Production Cost', value: '$2.50/unit', icon: '🏷️', color: '#f59e0b' },
    { title: 'Energy Cost', value: `$${state.energyConsumption}/day`, icon: '⚡', color: '#f97316' }
  ]
  
  return (
    <div style={{
      background: '#1e293b',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #334155'
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        💰 Financial Performance
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {financialMetrics.map((metric, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #374151'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{
                padding: '8px',
                background: 'rgba(96, 165, 250, 0.1)',
                borderRadius: '8px',
                marginRight: '12px',
                fontSize: '20px'
              }}>
                {metric.icon}
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: metric.color, marginBottom: '4px' }}>
              {metric.value}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{metric.title}</div>
          </div>
        ))}
      </div>
      
      {/* ROI Breakdown */}
      <div style={{ paddingTop: '24px', borderTop: '1px solid #374151' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
          ROI Breakdown
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#d1d5db', marginBottom: '8px' }}>
              <span>Upgrade Investment</span>
              <span>${state.totalUpgradesCost.toLocaleString()}</span>
            </div>
            <div style={{ height: '6px', background: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#ef4444', width: '40%' }} />
            </div>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#d1d5db', marginBottom: '8px' }}>
              <span>Cost Savings</span>
              <span>${state.moneySaved.toLocaleString()}</span>
            </div>
            <div style={{ height: '6px', background: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: '#10b981', 
                  width: `${Math.min(100, (state.moneySaved / (state.totalUpgradesCost || 1)) * 40)}%` 
                }} 
              />
            </div>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#d1d5db', marginBottom: '8px' }}>
              <span>Net Profit</span>
              <span style={{ color: state.moneySaved > state.totalUpgradesCost ? '#10b981' : '#ef4444' }}>
                ${(state.moneySaved - state.totalUpgradesCost).toLocaleString()}
              </span>
            </div>
            <div style={{ height: '6px', background: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: state.moneySaved > state.totalUpgradesCost ? '#3b82f6' : '#f59e0b',
                  width: `${Math.min(100, Math.abs(state.moneySaved - state.totalUpgradesCost) / (state.totalUpgradesCost || 1) * 40)}%` 
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}