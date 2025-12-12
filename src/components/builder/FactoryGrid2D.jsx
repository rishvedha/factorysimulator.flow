// src/builder/FactoryGrid2D.jsx
import React, { useState } from 'react'
import { useSimulation } from "../../context/SimulationContext";
/**
 * 2D grid drag & drop builder.
 * - Left: palette (machines)
 * - Center: grid where you drop machines
 * - Right: selected machine details + actions
 *
 * Grid coordinates: (0..cols-1, 0..rows-1)
 */

export default function FactoryGrid2D({
  rows = 6,
  cols = 8,
  cellSize = 96 // px
}) {
  const { factoryLayout, machinesCatalog, addMachine, removeMachine, updateMachine, clearLayout } = useSimulation()
  const [selectedId, setSelectedId] = useState(null)
  const [draggingType, setDraggingType] = useState(null)

  // palette items
  const palette = Object.values(machinesCatalog)

  const onDragStart = (e, type) => {
    setDraggingType(type)
    e.dataTransfer.setData('machineType', type)
    // set effect
    e.dataTransfer.effectAllowed = 'copyMove'
  }
  const onDragEnd = () => setDraggingType(null)

  const onDrop = (e) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('machineType') || draggingType
    if (!type) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const gx = Math.floor((x / rect.width) * cols)
    const gy = Math.floor((y / rect.height) * rows)

    // don't place if occupied
    const occupied = factoryLayout.some(m => m.position.x === gx && m.position.y === gy)
    if (occupied) {
      alert('Cell occupied')
      return
    }

    const spec = machinesCatalog[type] || machinesCatalog['feeder']
    const machine = {
      type,
      name: spec.name,
      color: spec.color,
      icon: spec.icon,
      cycleTime: spec.cycleTime,
      position: { x: gx, y: gy }
    }
    console.log('Adding machine:', machine);
    addMachine(machine)
  }

  const onDragOver = (e) => e.preventDefault()

  const removeSelected = () => {
    if (!selectedId) return
    removeMachine(selectedId)
    setSelectedId(null)
  }

  const gridCells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${c}-${r}`
      const machine = factoryLayout.find(m => m.position.x === c && m.position.y === r)
      gridCells.push(
        <div
          key={key}
          onClick={() => setSelectedId(machine ? machine.id : null)}
          style={{
            width: cellSize,
            height: cellSize,
            border: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: machine ? (machine.id === selectedId ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)') : 'transparent',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          {machine ? (
            <>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>{machine.icon}</div>
                <div style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600 }}>{machine.name.split(' ')[0]}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{machine.cycleTime}s</div>
              </div>
            </>
          ) : null}
        </div>
      )
    }
  }

  const selectedMachine = factoryLayout.find(m => m.id === selectedId)

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      {/* Palette */}
      <div style={{ width: 180, background: '#0b1220', padding: 12, borderRadius: 8 }}>
        <h3 style={{ color: 'white', margin: '6px 0' }}>Palette</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {palette.map(p => (
            <div
              key={p.id}
              draggable
              onDragStart={(e) => onDragStart(e, p.id)}
              onDragEnd={onDragEnd}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                padding: 8,
                borderRadius: 8,
                background: '#071226',
                border: `1px solid ${p.color}33`,
                color: 'white',
                cursor: 'grab'
              }}
            >
              <div style={{ fontSize: 20 }}>{p.icon}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{p.cycleTime}s</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <button onClick={() => clearLayout()} style={{ width: '100%', padding: 8, borderRadius: 8, background: '#ef4444', color: 'white', border: 'none' }}>
            Clear
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          style={{
            width: cols * cellSize,
            height: rows * cellSize,
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            borderRadius: 8,
            border: '2px dashed rgba(255,255,255,0.03)',
            background: '#041024',
            padding: 2
          }}
        >
          {gridCells}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 260, background: '#0b1220', padding: 12, borderRadius: 8 }}>
        <h3 style={{ color: 'white', margin: '6px 0' }}>Inspector</h3>

        {selectedMachine ? (
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedMachine.name} {selectedMachine.icon}</div>
            <div style={{ color: '#94a3b8', marginTop: 6 }}>Position: ({selectedMachine.position.x}, {selectedMachine.position.y})</div>
            <div style={{ marginTop: 12 }}>
              <label style={{ color: '#94a3b8', fontSize: 12 }}>Cycle time (s)</label>
              <input
                type="number"
                value={selectedMachine.cycleTime}
                onChange={(e) => updateMachine(selectedMachine.id, { cycleTime: Number(e.target.value), speed: Math.max(1, Math.round(60 / Number(e.target.value))) })}
                style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 6, background: '#071226', color: 'white', border: '1px solid #334155' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={removeSelected} style={{ flex: 1, padding: 8, borderRadius: 6, background: '#ef4444', color: 'white', border: 'none' }}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div style={{ color: '#94a3b8' }}>
            <div>Select a machine on the grid to inspect</div>
            <div style={{ fontSize: 12, marginTop: 12 }}>* Drag machine from left and drop onto grid</div>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <button onClick={() => window.location.href = '/3d'} style={{ width: '100%', padding: 10, borderRadius: 8, background: '#10b981', color: 'white', border: 'none', fontWeight: 700 }}>
            Simulate in 3D
          </button>
        </div>
      </div>
    </div>
  )
}
