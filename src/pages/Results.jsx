import React from 'react'
import { useSimulation } from '../context/SimulationContext'

export default function Results() {
  const { state } = useSimulation()
  const results = state?.simulationResults

  if (!results) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
          No simulation results. Run a simulation first!
        </div>
      </div>
    )
  }

  const { summary, bottleneck, machineMetrics, totalTime } = results

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: 'white',
      padding: '40px 20px'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
          🏭 Simulation Results
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: '40px' }}>
          Duration: {totalTime}s | Items Produced: {summary.itemsProduced}
        </p>

        {/* Key Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* OEE Card */}
          <div style={{
            background: '#1e293b',
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '8px' }}>
              Overall Equipment Effectiveness
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
              {summary.oee}%
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
              Industry target: 85%+
            </div>
          </div>

          {/* Efficiency Card */}
          <div style={{
            background: '#1e293b',
            border: '2px solid #10b981',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '8px' }}>
              Machine Efficiency
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
              {summary.efficiency}%
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
              Average across all machines
            </div>
          </div>

          {/* Throughput Card */}
          <div style={{
            background: '#1e293b',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '8px' }}>
              Throughput
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
              {summary.throughput}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
              Items per hour
            </div>
          </div>

          {/* Cycle Time Card */}
          <div style={{
            background: '#1e293b',
            border: '2px solid #8b5cf6',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '8px' }}>
              Avg Cycle Time
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>
              {summary.avgCycleTime}s
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
              Time per item
            </div>
          </div>
        </div>

        {/* Bottleneck Alert */}
        {bottleneck && (
          <div style={{
            background: '#7f1d1d',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '40px'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>
              ⚠️ Production Bottleneck
            </h2>
            <p style={{ color: '#fca5a5', marginBottom: '8px' }}>
              <strong>{bottleneck.machineName}</strong>
            </p>
            <p style={{ color: '#fca5a5' }}>
              {bottleneck.reason} - Consider adding upgrades or parallel units
            </p>
          </div>
        )}

        {/* Machine Metrics Table */}
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '40px'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '20px', borderBottom: '1px solid #334155' }}>
            Machine Performance Details
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ background: '#0f172a' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: '#9ca3af' }}>Machine</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', color: '#9ca3af' }}>Cycle Time</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', color: '#9ca3af' }}>Items Processed</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', color: '#9ca3af' }}>Cycles</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', color: '#9ca3af' }}>Efficiency</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', color: '#9ca3af' }}>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(machineMetrics).map(([id, metric]) => (
                  <tr key={id} style={{ borderTop: '1px solid #334155' }}>
                    <td style={{ padding: '12px 20px' }}>{metric.name}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', color: '#d1d5db' }}>
                      {metric.cycleTime}s
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', color: '#d1d5db' }}>
                      {Math.round(metric.itemsProcessed)}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', color: '#d1d5db' }}>
                      {metric.cyclesCompleted.toFixed(1)}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                      <span style={{
                        background: metric.efficiency > 80 ? '#10b98180' : '#f59e0b80',
                        color: metric.efficiency > 80 ? '#10b981' : '#f59e0b',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {metric.efficiency.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', color: '#d1d5db' }}>
                      {metric.utilization.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div style={{
          background: '#1e293b',
          border: '2px solid #3b82f6',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>
            💡 Optimization Recommendations
          </h2>
          <ul style={{ color: '#d1d5db', fontSize: '0.95rem', lineHeight: '1.8' }}>
            {summary.oee < 70 && (
              <li>• Low OEE detected. Consider adding upgrades to improve efficiency</li>
            )}
            {summary.efficiency < 75 && (
              <li>• Machine efficiency is below target. Review and optimize cycle times</li>
            )}
            {bottleneck && (
              <li>• {bottleneck.machineName} is your bottleneck. Prioritize upgrades here</li>
            )}
            <li>• Consider adding parallel units for high-cycle-time machines</li>
            <li>• Review machine connections to minimize downtime between processes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
