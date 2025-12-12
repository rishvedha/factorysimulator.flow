import React, { useState } from 'react'
import { useSimulation } from '../context/SimulationContext'
import MachinePalette from '../components/builder/MachinePalette'
import FactoryGrid from '../components/builder/FactoryGrid'
import UpgradePalette from '../components/builder/UpgradePalette'
import SimulationEngine from '../logic/simulationEngine'
import '../styles/globals.css'

export default function Console() {
  const { state, dispatch } = useSimulation()
  const [selectedMachine, setSelectedMachine] = useState(null)
  const [mode, setMode] = useState('place')
  const [factoryLayout, setFactoryLayout] = useState([])
  const [simulationResults, setSimulationResults] = useState(null)
  
  const handleMachineDrop = (machineType, position) => {
    const specs = getMachineSpecs(machineType)
    const icon = getMachineIcon(machineType)
    const color = getMachineColor(machineType)
    
 const machine = {
  id: `machine_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
  type: machineType,
  name: specs.name,
  icon,
  color,
  cycleTime: specs.cycleTime,                // seconds per item
  speed: Math.round(60 / (specs.cycleTime || 1)), // items per minute (bpm)
  cost: specs.cost,
  operators: specs.operators,
  efficiency: specs.efficiency ?? 85,        // default if not present
  energyCost: specs.energyCost ??  (specs.energyCost || 5),
  failureRate: specs.failureRate ?? 3,
  position,
  connections: [],
  upgrades: []
}

    
    setFactoryLayout([...factoryLayout, machine])
    
    if (dispatch) {
      dispatch({ type: 'ADD_MACHINE', payload: machine })
    }
  }
  
  const handleSelectMachine = (machineId) => {
    const machine = factoryLayout.find(m => m.id === machineId)
    setSelectedMachine(machine)
  }
  
  const handleApplyUpgrade = (upgradeType) => {
    if (!selectedMachine) return
    
    const upgradedMachine = {
      ...selectedMachine,
      upgrades: [...selectedMachine.upgrades, upgradeType]
    }
    
    const newLayout = factoryLayout.map(m => 
      m.id === selectedMachine.id ? upgradedMachine : m
    )
    
    setFactoryLayout(newLayout)
    setSelectedMachine(upgradedMachine)
    dispatch({ type: 'APPLY_UPGRADE', payload: { machineId: selectedMachine.id, upgradeType } })
  }
  
  const handleRunSimulation = () => {
    try {
      if (factoryLayout.length === 0) {
        alert('❌ Add machines to factory first!')
        return
      }

      console.log('🚀 RUNNING SIMULATION with', factoryLayout.length, 'machines')
      
      // Create simulation engine
      const engine = new SimulationEngine(factoryLayout)
      
      // Run simulation for 1 hour (3600 seconds)
      const results = engine.run(3600)
      
      console.log('✅ SIMULATION COMPLETE:', results)
      
      // Store results locally
      setSimulationResults(results)
      
      // Also store in context
      dispatch({ type: 'RUN_SIMULATION', payload: results })
      
      alert('✅ Simulation Complete! Results displayed below.')
    } catch (error) {
      console.error('❌ SIMULATION ERROR:', error)
      alert('❌ Error: ' + error.message)
    }
  }
  
  const getMachineSpecs = (type) => {
    const specs = {
      feeder: { name: 'Feeder', cycleTime: 5, cost: 50000, operators: 1 },
      blowMolder: { name: 'Blow Molder', cycleTime: 8, cost: 120000, operators: 2 },
      filler: { name: 'Filler', cycleTime: 4, cost: 80000, operators: 1 },
      capper: { name: 'Capper', cycleTime: 3, cost: 60000, operators: 1 },
      labeler: { name: 'Labeler', cycleTime: 6, cost: 70000, operators: 1 },
      packager: { name: 'Packager', cycleTime: 7, cost: 90000, operators: 2 }
    }
    return specs[type] || specs.feeder
  }
  
  const getMachineIcon = (type) => {
    const icons = {
      feeder: '📦', blowMolder: '🔥', filler: '💧',
      capper: '🔩', labeler: '🏷️', packager: '📦'
    }
    return icons[type] || '⚙️'
  }
  
  const getMachineColor = (type) => {
    const colors = {
      feeder: '#3b82f6', blowMolder: '#ef4444', filler: '#10b981',
      capper: '#f59e0b', labeler: '#8b5cf6', packager: '#ec4899'
    }
    return colors[type] || '#6b7280'
  }
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header - SIMPLE */}
      <div style={{
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'white' }}>
            🏭 Factory Builder
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
            Build • Upgrade • Simulate
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setMode('place')}
            style={{
              padding: '8px 12px',
              background: mode === 'place' ? '#3b82f6' : '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            🏗️ Place
          </button>
          <button
            onClick={() => alert('Connect tool coming soon')}
            style={{
              padding: '8px 12px',
              background: '#374151',
              color: '#9ca3af',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            🔗 Connect
          </button>
          <button
            onClick={() => setMode('upgrade')}
            style={{
              padding: '8px 12px',
              background: mode === 'upgrade' ? '#8b5cf6' : '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            ⚡ Upgrade
          </button>
        </div>
      </div>
      
      {/* Main Area */}
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 110px)' }}>
        {/* Left: Machines */}
        <div style={{
          width: '250px',
          background: '#111827',
          borderRight: '1px solid #334155',
          padding: '16px',
          overflowY: 'auto'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
            Machines
          </h2>
          <MachinePalette />
          
          <div style={{ marginTop: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
              Upgrades
            </h2>
            <UpgradePalette 
              onUpgradeClick={handleApplyUpgrade}
              selectedMachine={selectedMachine}
            />
          </div>
        </div>
        
        {/* Center: Factory */}
        <div style={{ flex: 1, padding: '16px', position: 'relative' }}>
          <FactoryGrid
            mode={mode}
            factoryLayout={factoryLayout}
            onMachineDrop={handleMachineDrop}
            onSelectMachine={handleSelectMachine}
            selectedMachineId={selectedMachine?.id}
          />
          
          {/* Controls */}
          {factoryLayout.length > 0 && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={() => setFactoryLayout([])}
                style={{
                  padding: '8px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.9rem'
                }}
              >
                Clear
              </button>
              <button
                onClick={handleRunSimulation}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                🚀 Simulate
              </button>
            </div>
          )}
        </div>
        
        {/* Right: Info */}
        <div style={{
          width: '280px',
          background: '#111827',
          borderLeft: '1px solid #334155',
          padding: '16px',
          overflowY: 'auto'
        }}>
          {selectedMachine ? (
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
                {selectedMachine.name}
              </h2>
              <div style={{
                background: '#1e293b',
                borderRadius: '10px',
                padding: '14px',
                border: '1px solid #334155'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '4px' }}>
                    Position
                  </div>
                  <div style={{ color: 'white', fontSize: '1rem', fontWeight: '600' }}>
                    ({selectedMachine.position.x}, {selectedMachine.position.y})
                  </div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '4px' }}>
                    Cycle Time
                  </div>
                  <div style={{ color: '#60a5fa', fontSize: '1rem', fontWeight: '600' }}>
                    {selectedMachine.cycleTime}s
                  </div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '4px' }}>
                    Cost
                  </div>
                  <div style={{ color: '#fbbf24', fontSize: '1rem', fontWeight: '600' }}>
                    ${selectedMachine.cost.toLocaleString()}
                  </div>
                </div>
                
                {selectedMachine.upgrades.length > 0 && (
                  <div>
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '6px' }}>
                      Upgrades ({selectedMachine.upgrades.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedMachine.upgrades.map((upgrade, i) => (
                        <div key={i} style={{
                          background: '#3b82f6',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem'
                        }}>
                          {upgrade}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
                Factory
              </h2>
              <div style={{
                background: '#1e293b',
                borderRadius: '10px',
                padding: '14px',
                border: '1px solid #334155'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '2.5rem', color: '#3b82f6' }}>
                    {factoryLayout.length}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                    Machines placed
                  </div>
                </div>
                
                <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '8px' }}>
                  Quick Start:
                </div>
                <div style={{ color: '#d1d5db', fontSize: '0.8rem', lineHeight: '1.5' }}>
                  1. Drag machine from left<br/>
                  2. Drop on grid<br/>
                  3. Click machine to select<br/>
                  4. Apply upgrades if needed<br/>
                  5. Click Simulate
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SIMULATION RESULTS DISPLAY */}
      {simulationResults && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '800px',
            width: '100%',
            color: 'white',
            border: '2px solid #3b82f6'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
                📊 Simulation Results
              </h2>
              <button
                onClick={() => setSimulationResults(null)}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '8px' }}>Total Items Produced</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  {Math.round(simulationResults.totalItemsProduced)}
                </div>
              </div>

              <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '2px solid #10b981' }}>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '8px' }}>OEE Score</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>
                  {simulationResults.oee.toFixed(1)}%
                </div>
              </div>

              <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '8px' }}>Efficiency</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {simulationResults.efficiency.toFixed(1)}%
                </div>
              </div>

              <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '2px solid #8b5cf6' }}>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '8px' }}>Throughput</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {simulationResults.throughput.toFixed(0)}/hr
                </div>
              </div>
            </div>

            {simulationResults.bottleneck && (
              <div style={{
                background: '#7f1d1d',
                border: '2px solid #ef4444',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>⚠️ Bottleneck:</div>
                <div>{simulationResults.bottleneck.machineName}</div>
                <div style={{ fontSize: '0.875rem', color: '#fca5a5' }}>{simulationResults.bottleneck.reason}</div>
              </div>
            )}

            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '12px' }}>Machine Performance:</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {Object.entries(simulationResults.machineMetrics).map(([id, metric]) => (
                  <div key={id} style={{
                    background: '#0f172a',
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #3b82f6'
                  }}>
                    <div style={{ fontWeight: 'bold' }}>{metric.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                      Processed: {Math.round(metric.itemsProcessed)} | Efficiency: {metric.efficiency.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}