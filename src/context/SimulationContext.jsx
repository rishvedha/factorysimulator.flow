// src/context/SimulationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const SimulationContext = createContext();

// Create the provider component
export function SimulationProvider({ children }) {
  // Load from localStorage on initial render
  const [factoryLayout, setFactoryLayout] = useState(() => {
    try {
      const saved = localStorage.getItem('factoryLayout');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  });
  
  // Save to localStorage whenever layout changes
  useEffect(() => {
    try {
      localStorage.setItem('factoryLayout', JSON.stringify(factoryLayout));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [factoryLayout]);

  const [machinesCatalog] = useState({
    feeder: { id: 'feeder', name: 'Feeder', cycleTime: 5, icon: '📦', color: '#3b82f6' },
    filler: { id: 'filler', name: 'Filler', cycleTime: 4, icon: '💧', color: '#10b981' },
    capper: { id: 'capper', name: 'Capper', cycleTime: 3, icon: '🔩', color: '#f59e0b' },
    labeler: { id: 'labeler', name: 'Labeler', cycleTime: 6, icon: '🏷️', color: '#8b5cf6' },
    packager: { id: 'packager', name: 'Packager', cycleTime: 7, icon: '📦', color: '#ec4899' }
  });

  const addMachine = (machine) => {
    // Ensure machine has ALL required properties
    const normalized = {
      ...machine,
      id: machine.id || `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      speed: machine.speed || Math.max(1, Math.round(60 / (machine.cycleTime || 1))),
      upgrades: machine.upgrades || [],
      // CRITICAL: Ensure position object exists with x and y
      position: machine.position || { x: 0, y: 0 },
      // Ensure these properties exist
      type: machine.type || 'feeder',
      name: machine.name || 'Unknown Machine',
      color: machine.color || '#3b82f6',
      icon: machine.icon || '⚙️',
      cycleTime: machine.cycleTime || 5
    };
    
    console.log('Context: Adding normalized machine:', normalized);
    setFactoryLayout(prev => [...prev, normalized]);
  };

  const removeMachine = (id) => {
    console.log('Context: Removing machine:', id);
    setFactoryLayout(prev => prev.filter(m => m.id !== id));
  };

  const updateMachine = (id, patch) => {
    console.log('Context: Updating machine:', id, patch);
    setFactoryLayout(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)));
  };

  const clearLayout = () => {
    console.log('Context: Clearing layout');
    setFactoryLayout([]);
  };

  const value = {
    factoryLayout,
    machinesCatalog,
    addMachine,
    removeMachine,
    updateMachine,
    clearLayout
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

// Create the custom hook
export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within SimulationProvider');
  }
  return context;
}

// ALSO export the context itself if needed elsewhere
export default SimulationContext;