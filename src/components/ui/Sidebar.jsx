import React from "react";

export default function Sidebar({ inputs, setInputs, upgrades, setUpgrades, sensor }) {
  const updateField = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: Number(value) }));
  };

  const toggle = (key) => {
    setUpgrades(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const upgradeConfigs = {
    iot: {
      label: "IoT Sensors",
      icon: "📡",
      cost: "₹1.2L",
      benefit: "Real-time monitoring",
      color: "#a15bbbff"
    },
    ai: {
      label: "AI Analytics",
      icon: "🤖",
      cost: "₹2L",
      benefit: "Predictive maintenance",
      color: "#a15bbbff"
    },
    automation: {
      label: "Automation",
      icon: "⚙️",
      cost: "₹3.5L",
      benefit: "Reduced downtime",
      color: "#a15bbbff"
    }
  };

  return (
    <div className="sidebar">
      <div className="header-section">
        <h2>🏭 Factory Controls</h2>
        <p className="subtitle">Adjust parameters to optimize production</p>
      </div>

      <div className="input-group">
        <label>
          <span className="label-icon"></span>
          Production Rate
          <span className="unit">(units/hour)</span>
        </label>
        <div className="input-with-slider">
          <input
            type="range"
            min="500"
            max="2000"
            step="50"
            value={inputs.productionRate}
            onChange={(e) => updateField("productionRate", e.target.value)}
            className="slider"
          />
          <input
            type="number"
            value={inputs.productionRate}
            onChange={(e) => updateField("productionRate", e.target.value)}
            className="number-input"
          />
        </div>
        <div className="hint">Higher speed may increase defects</div>
      </div>

      <div className="input-group">
        <label>
          <span className="label-icon"></span>
          Target Defect Rate
          <span className="unit">(%)</span>
        </label>
        <input
          type="range"
          min="0.5"
          max="10"
          step="0.1"
          value={inputs.defectRate}
          onChange={(e) => updateField("defectRate", e.target.value)}
          className="slider"
        />
        <div className="value-display">
          <span>{inputs.defectRate}%</span>
          <span className="range">0.5% - 10%</span>
        </div>
      </div>

      <div className="input-group">
        <label>
          <span className="label-icon"></span>
          Shift Hours
          <span className="unit">(per day)</span>
        </label>
        <div className="time-inputs">
          {[8, 12, 16, 24].map(hours => (
            <button
              key={hours}
              className={`time-btn ${inputs.shiftHours === hours ? 'active' : ''}`}
              onClick={() => updateField("shiftHours", hours)}
            >
              {hours}h
            </button>
          ))}
        </div>
      </div>

      <div className="input-group">
        <label>
          <span className="label-icon"></span>
          Downtime
          <span className="unit">(minutes/day)</span>
        </label>
        <input
          type="number"
          value={inputs.downtime || 0}
          onChange={(e) => updateField("downtime", e.target.value)}
          className="number-input full"
          min="0"
          max="240"
        />
      </div>

      <div className="upgrades-section">
        <h3>Digital Upgrades</h3>
        <p className="section-subtitle">Toggle to see impact on KPIs</p>
        
        <div className="upgrades-grid">
          {Object.entries(upgradeConfigs).map(([key, config]) => (
            <div key={key} className="upgrade-card">
              <div className="upgrade-header">
                <span className="upgrade-icon">{config.icon}</span>
                <div>
                  <div className="upgrade-name">{config.label}</div>
                  <div className="upgrade-cost">{config.cost}</div>
                </div>
              </div>
              <div className="upgrade-benefit">{config.benefit}</div>
              <button
                onClick={() => toggle(key)}
                className={`toggle-btn ${upgrades[key] ? 'on' : 'off'}`}
                style={upgrades[key] ? { background: config.color } : {}}
              >
                {upgrades[key] ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="sensor-section">
        <h3>Live Sensor Dashboard</h3>
        
        <div className="sensor-card">
          <div className="sensor-header">
            <span className="sensor-icon">o</span>
            <div className="sensor-info">
              <div className="sensor-label">Temperature</div>
              <div className="sensor-value">{sensor.temperature?.toFixed(1) || "45.0"}°C</div>
            </div>
            <div className={`sensor-status ${sensor.temperature > 55 ? 'danger' : sensor.temperature > 50 ? 'warning' : 'normal'}`}>
              {sensor.temperature > 55 ? 'HIGH' : sensor.temperature > 50 ? 'WARN' : 'OK'}
            </div>
          </div>
          <div className="sensor-bar">
            <div 
              className="sensor-fill"
              style={{
                width: `${Math.min(100, (sensor.temperature / 70) * 100)}%`,
                background: sensor.temperature > 55 ? '#ef4444' : sensor.temperature > 50 ? '#f59e0b' : '#10b981'
              }}
            />
          </div>
        </div>

        <div className="sensor-card">
          <div className="sensor-header">
            <span className="sensor-icon">o</span>
            <div className="sensor-info">
              <div className="sensor-label">Vibration</div>
              <div className="sensor-value">{sensor.vibration?.toFixed(2) || "3.00"} mm/s</div>
            </div>
            <div className={`sensor-status ${sensor.vibration > 6 ? 'danger' : sensor.vibration > 5 ? 'warning' : 'normal'}`}>
              {sensor.vibration > 6 ? 'HIGH' : sensor.vibration > 5 ? 'WARN' : 'OK'}
            </div>
          </div>
          <div className="sensor-bar">
            <div 
              className="sensor-fill"
              style={{
                width: `${Math.min(100, (sensor.vibration / 8) * 100)}%`,
                background: sensor.vibration > 6 ? '#ef4444' : sensor.vibration > 5 ? '#f59e0b' : '#f59e0b'
              }}
            />
          </div>
        </div>

        <div className="sensor-card">
          <div className="sensor-header">
            <span className="sensor-icon">o</span>
            <div className="sensor-info">
              <div className="sensor-label">Power Consumption</div>
              <div className="sensor-value">{sensor.power?.toFixed(0) || "60"} kW</div>
            </div>
            <div className={`sensor-status ${sensor.power > 80 ? 'warning' : 'normal'}`}>
              {sensor.power > 80 ? 'HIGH' : 'OK'}
            </div>
          </div>
          <div className="sensor-bar">
            <div 
              className="sensor-fill"
              style={{
                width: `${Math.min(100, (sensor.power / 100) * 100)}%`,
                background: sensor.power > 80 ? '#f59e0b' : '#3b82f6'
              }}
            />
          </div>
        </div>
      </div>

      <div className="tips-section">
        <div className="tip">
          <span className="tip-icon">💡</span>
          <span className="tip-text">
            Try enabling IoT sensors first to reduce defects by 20%
          </span>
        </div>
      </div>
    </div>
  );
}