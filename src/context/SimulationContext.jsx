// src/context/SimulationContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Create the context
const SimulationContext = createContext();

// Defaults for Industry 4.0 config and financial inputs
const defaultI40Config = {
  predictiveMaintenance: 60, // intensity 0-100
  adaptiveSpeed: 50,
  qualityAI: 50,
  energyOptimization: 50,
};

const defaultFinancials = {
  marginPerUnit: 3, // ₹ per bottle
  scrapCostPerUnit: 1, // ₹ per bottle
  downtimeCostPerHour: 5000, // ₹/hour
  energyRatePerKWh: 8, // ₹/kWh
  i40Capex: 1200000, // ₹ (approx ₹12 lakh)
  i40MonthlyOpex: 15000, // ₹/month
};

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

  // Industry 4.0 state
  const [i40Enabled, setI40Enabled] = useState(() => {
    const saved = localStorage.getItem('i40Enabled');
    return saved ? JSON.parse(saved) : false;
  });
  const [i40Config, setI40Config] = useState(() => {
    const saved = localStorage.getItem('i40Config');
    return saved ? JSON.parse(saved) : defaultI40Config;
  });
  const [financialInputs, setFinancialInputs] = useState(() => {
    const saved = localStorage.getItem('financialInputs');
    return saved ? JSON.parse(saved) : defaultFinancials;
  });

  useEffect(() => localStorage.setItem('i40Enabled', JSON.stringify(i40Enabled)), [i40Enabled]);
  useEffect(() => localStorage.setItem('i40Config', JSON.stringify(i40Config)), [i40Config]);
  useEffect(() => localStorage.setItem('financialInputs', JSON.stringify(financialInputs)), [financialInputs]);

  // Baseline and i40 KPIs (placeholders; to be refined by simulationEngine in future)
  const [baselineKpis, setBaselineKpis] = useState(null);
  const [i40Kpis, setI40Kpis] = useState(null);

  // Actions for Industry 4.0
  const toggleI40 = () => setI40Enabled(v => !v);
  const updateI40Config = (patch) => setI40Config(prev => ({ ...prev, ...patch }));

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

  // Simple derived financials to show in UI (placeholder until full sim KPIs wired)
  const financialComparison = useMemo(() => {
    // Rough heuristics based on number of stations and i40 config
    const stations = factoryLayout?.length || 0;
    const baseThroughputPerMin = stations > 0 ? Math.min(...factoryLayout.map(m => Math.max(1, Math.round(60 / (m.cycleTime || 1))))) : 0;
    const baseGoodUnitsPerMonth = baseThroughputPerMin * 60 * 8 * 22; // 8h/day, 22 days
    const baseDefectRate = 0.05; // 5%
    const baseEnergyKWhPerHour = stations * 0.8;
    const baseDowntimeHrsPerMonth = stations * 4; // heuristic

    // Modifiers from i40 config (0-1 intensities)
    const pm = (i40Config.predictiveMaintenance || 0) / 100;
    const as = (i40Config.adaptiveSpeed || 0) / 100;
    const qa = (i40Config.qualityAI || 0) / 100;
    const eo = (i40Config.energyOptimization || 0) / 100;

    const i40ThroughputPerMin = baseThroughputPerMin * (1 + 0.15 * as);
    const i40GoodUnitsPerMonth = i40ThroughputPerMin * 60 * 8 * 22;
    const i40DefectRate = baseDefectRate * (1 - 0.4 * qa);
    const i40EnergyKWhPerHour = baseEnergyKWhPerHour * (1 - 0.3 * eo);
    const i40DowntimeHrsPerMonth = baseDowntimeHrsPerMonth * (1 - 0.35 * pm);

    const deltaGoodUnits = (i40GoodUnitsPerMonth * (1 - i40DefectRate)) - (baseGoodUnitsPerMonth * (1 - baseDefectRate));
    const defectsAvoided = (baseGoodUnitsPerMonth * baseDefectRate) - (i40GoodUnitsPerMonth * i40DefectRate);
    const energySavedKWh = (baseEnergyKWhPerHour - i40EnergyKWhPerHour) * 8 * 22;
    const downtimeAvoidedHrs = baseDowntimeHrsPerMonth - i40DowntimeHrsPerMonth;

    const { marginPerUnit, scrapCostPerUnit, downtimeCostPerHour, energyRatePerKWh, i40Capex, i40MonthlyOpex } = financialInputs;

    const monthlySavings = Math.max(0,
      deltaGoodUnits * marginPerUnit +
      defectsAvoided * scrapCostPerUnit +
      downtimeAvoidedHrs * downtimeCostPerHour +
      energySavedKWh * energyRatePerKWh -
      i40MonthlyOpex
    );

    const paybackMonths = monthlySavings > 0 ? i40Capex / monthlySavings : Infinity;
    const annualRoiPct = monthlySavings > 0 && i40Capex > 0 ? (monthlySavings * 12) / i40Capex * 100 : 0;

    return {
      i40Enabled,
      base: {
        throughputPerMin: baseThroughputPerMin,
        goodUnitsPerMonth: baseGoodUnitsPerMonth * (1 - baseDefectRate),
        defectRate: baseDefectRate,
        energyKWhPerHour: baseEnergyKWhPerHour,
        downtimeHrsPerMonth: baseDowntimeHrsPerMonth,
      },
      i40: {
        throughputPerMin: i40ThroughputPerMin,
        goodUnitsPerMonth: i40GoodUnitsPerMonth * (1 - i40DefectRate),
        defectRate: i40DefectRate,
        energyKWhPerHour: i40EnergyKWhPerHour,
        downtimeHrsPerMonth: i40DowntimeHrsPerMonth,
      },
      deltas: {
        goodUnits: deltaGoodUnits,
        defectsAvoided,
        energySavedKWh,
        downtimeAvoidedHrs,
      },
      financials: {
        monthlySavings,
        paybackMonths,
        annualRoiPct,
      }
    };
  }, [factoryLayout, i40Config, i40Enabled, financialInputs]);

  const value = {
    factoryLayout,
    machinesCatalog,
    addMachine,
    removeMachine,
    updateMachine,
    clearLayout,
    // Industry 4.0
    i40Enabled,
    i40Config,
    toggleI40,
    updateI40Config,
    financialInputs,
    setFinancialInputs,
    financialComparison,
    baselineKpis,
    i40Kpis,
    setBaselineKpis,
    setI40Kpis,
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