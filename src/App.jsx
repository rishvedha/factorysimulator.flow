// src/App.jsx
import { useState, useCallback, useEffect, useMemo } from "react";
import FactoryScene from "./components/canvas/FactoryScene.jsx";
import Sidebar from "./components/ui/Sidebar.jsx";
import StatsPanel from "./components/ui/StatsPanel.jsx";
import "./App.css";

export default function App() {
  const [inputs, setInputs] = useState({
    productionRate: 1200,
    defectRate: 3,
    shiftHours: 8,
    downtime: 45, // minutes
  });

  const [upgrades, setUpgrades] = useState({
    iot: false,
    ai: false,
    automation: false,
  });

  const [sensor, setSensor] = useState({
    temperature: 40,
    vibration: 3,
    power: 60,
    timestamp: Date.now(),
  });

  const [history, setHistory] = useState({
    temp: [],
    vib: [],
    power: [],
    alarms: [],
  });

  // Simulate realistic sensor updates
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const baseTemp = 35 + Math.random() * 15;
      const baseVib = 2 + Math.random() * 4;
      
      let temp = baseTemp;
      let vib = baseVib;
      let power = 60 + Math.random() * 20;

      // Upgrade effects on sensor readings
      if (upgrades.iot) {
        temp += Math.sin(now / 5000) * 3; // More stable with IoT
        vib *= 0.8; // IoT reduces vibration
      }
      
      if (upgrades.ai) {
        power = 65 + Math.random() * 10; // More efficient power usage
      }
      
      if (upgrades.automation) {
        temp *= 0.95;
        vib *= 0.9;
      }

      // Speed affects temperature
      temp += (inputs.productionRate / 1000) * 2;

      setSensor({
        temperature: Math.max(30, Math.min(65, temp)),
        vibration: Math.max(1, Math.min(8, vib)),
        power: Math.max(40, Math.min(85, power)),
        timestamp: now,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [upgrades, inputs.productionRate]);

  const onSensorUpdate = useCallback((newData) => {
    const t = Date.now();
    setSensor({ ...newData, timestamp: t });

    setHistory((h) => {
      const pushTrim = (arr, sample) => {
        const next = [...arr.slice(-59), sample];
        return next;
      };

      const alarms = [...h.alarms];
      if (newData.temperature > 55 || newData.vibration > 6) {
        alarms.push({ 
          t, 
          type: newData.temperature > 55 ? "temp" : "vib",
          severity: newData.temperature > 60 || newData.vibration > 7 ? "high" : "medium"
        });
        if (alarms.length > 100) alarms.shift();
      }

      return {
        temp: pushTrim(h.temp, { t, v: newData.temperature }),
        vib: pushTrim(h.vib, { t, v: newData.vibration }),
        power: pushTrim(h.power, { t, v: newData.power }),
        alarms,
      };
    });
  }, []);

  // Enhanced KPI Calculations
  const {
    dailyOutput,
    dailyDefects,
    availability,
    performance,
    quality,
    OEE,
    mtbf,
    mttr,
    invested,
    annualSavings,
    paybackYears
  } = useMemo(() => {
    // 1. Availability Calculation
    const totalMinutes = inputs.shiftHours * 60;
    const downtime = inputs.downtime || 0;
    let availabilityBase = (totalMinutes - downtime) / totalMinutes;
    
    // Upgrades affect availability
    if (upgrades.automation) availabilityBase *= 1.1;
    if (upgrades.ai) availabilityBase *= 1.05;
    if (upgrades.iot) availabilityBase *= 1.03;
    
    const availability = Math.min(0.99, Math.max(0.6, availabilityBase));

    // 2. Performance Calculation
    const idealSpeed = 1500; // units/hour
    let performanceBase = inputs.productionRate / idealSpeed;
    
    // Sensor effects on performance
    let sensorPenalty = 0;
    if (sensor.temperature > 50) sensorPenalty += 0.05;
    if (sensor.vibration > 5) sensorPenalty += 0.03;
    if (sensor.power < 50) sensorPenalty += 0.02;
    
    if (upgrades.ai) sensorPenalty *= 0.5; // AI mitigates sensor issues
    if (upgrades.iot) sensorPenalty *= 0.7; // IoT helps monitoring
    
    const performance = Math.min(1.1, Math.max(0.7, performanceBase - sensorPenalty));

    // 3. Quality Calculation
    let defectRate = inputs.defectRate / 100;
    
    // Speed affects quality (faster = more defects)
    const speedFactor = inputs.productionRate / idealSpeed;
    if (speedFactor > 1) defectRate *= speedFactor;
    
    // Sensor effects on quality
    if (sensor.temperature > 55) defectRate *= 1.3;
    if (sensor.vibration > 6) defectRate *= 1.4;
    
    // Upgrade benefits
    if (upgrades.ai) defectRate *= 0.6; // AI reduces defects by 40%
    if (upgrades.iot) defectRate *= 0.8; // IoT reduces by 20%
    if (upgrades.automation) defectRate *= 0.9; // Automation reduces by 10%
    
    const quality = Math.max(0.85, 1 - defectRate);

    // 4. OEE Calculation
    const OEE = +(availability * performance * quality * 100).toFixed(1);

    // 5. Production Output
    const effectiveHourly = inputs.productionRate * availability * performance;
    const dailyOutput = Math.round(effectiveHourly * inputs.shiftHours);
    const dailyDefects = Math.round(dailyOutput * (1 - quality));

    // 6. MTBF/MTTR Calculations
    const mtbf = history.alarms.length > 1 ? 
      Math.round((history.alarms[history.alarms.length - 1].t - history.alarms[0].t) / (history.alarms.length * 1000)) : 
      300;
    
    let mttrBase = 120; // seconds
    if (upgrades.iot) mttrBase *= 0.6;
    if (upgrades.ai) mttrBase *= 0.7;
    if (upgrades.automation) mttrBase *= 0.8;
    const mttr = Math.round(mttrBase);

    // 7. Financial Calculations
    const upgradeCosts = {
      iot: 120000,
      ai: 200000,
      automation: 350000,
    };
    
    const invested = Object.entries(upgrades).reduce(
      (total, [key, value]) => total + (value ? upgradeCosts[key] : 0), 0
    );

    // Savings calculation
    const revenuePerUnit = 2.5; // ₹ per bottle
    const costPerUnit = 1.8; // ₹ per bottle
    const profitPerUnit = revenuePerUnit - costPerUnit;
    
    const baseDailyProfit = inputs.productionRate * inputs.shiftHours * profitPerUnit * 0.7; // Base efficiency
    const enhancedDailyProfit = dailyOutput * profitPerUnit;
    
    const annualSavings = Math.round((enhancedDailyProfit - baseDailyProfit) * 300);
    const paybackYears = invested > 0 && annualSavings > 0 ? 
      +(invested / annualSavings).toFixed(1) : null;

    return {
      dailyOutput,
      dailyDefects,
      availability: Math.round(availability * 100),
      performance: Math.round(performance * 100),
      quality: Math.round(quality * 100),
      OEE,
      mtbf,
      mttr,
      invested,
      annualSavings,
      paybackYears
    };
  }, [inputs, upgrades, sensor, history.alarms]);

  return (
    <div className="app-container">
      <Sidebar
        inputs={inputs}
        setInputs={setInputs}
        upgrades={upgrades}
        setUpgrades={setUpgrades}
        sensor={sensor}
      />
      
<FactoryScene
  onSensorUpdate={onSensorUpdate}
  speed={inputs.productionRate / 100} // This gives us good speed range: 500-2000 units/hr -> 5-20 visual speed
  defectRate={inputs.defectRate}
  sensor={sensor}
  upgrades={upgrades}
/>
      <StatsPanel
        stats={{
          dailyOutput,
          dailyDefects,
          availability,
          performance,
          quality,
          OEE,
          mtbf,
          mttr,
          invested,
          annualSavings,
          paybackYears,
          history,
        }}
        sensor={sensor}
        upgrades={upgrades}
      />
    </div>
  );
}