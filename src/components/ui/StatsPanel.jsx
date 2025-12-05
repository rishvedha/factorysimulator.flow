import React from "react";

function Sparkline({ data = [], color = "#3b82f6", height = 40, width = 200, title }) {
  if (!data.length) {
    return (
      <div className="sparkline-empty" style={{ width, height }}>
        No data yet
      </div>
    );
  }

  const values = data.map(d => d.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1 || 1);
  
  const points = values.map((v, i) => 
    `${i * step},${height - ((v - min) / range) * height}`
  ).join(" ");

  const current = values[values.length - 1];
  const prev = values.length > 1 ? values[values.length - 2] : current;
  const trend = current > prev ? '↗' : current < prev ? '↘' : '→';

  return (
    <div className="sparkline-container">
      <div className="sparkline-header">
        <span className="sparkline-title">{title}</span>
        <span className="sparkline-current">
          {current.toFixed(1)} {trend}
        </span>
      </div>
      <svg width={width} height={height} className="sparkline-svg">
        <defs>
          <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <polyline
          fill={`url(#gradient-${title})`}
          stroke={color}
          strokeWidth="2"
          points={points}
          className="sparkline-line"
        />
      </svg>
    </div>
  );
}

function KPICard({ label, value, unit, trend, target, color }) {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        {trend && (
          <span className={`kpi-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="kpi-value" style={{ color }}>
        {value}<span className="kpi-unit">{unit}</span>
      </div>
      {target && (
        <div className="kpi-target">
          <div className="target-label">Target: {target}</div>
          <div className="target-bar">
            <div 
              className="target-fill"
              style={{ 
                width: `${Math.min(100, (value / target) * 100)}%`,
                background: color
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function OEECard({ value }) {
  const getOEEStatus = (oee) => {
    if (oee >= 85) return { label: "World Class", color: "#10b981" };
    if (oee >= 75) return { label: "Good", color: "#3b82f6" };
    if (oee >= 65) return { label: "Average", color: "#f59e0b" };
    return { label: "Needs Improvement", color: "#ef4444" };
  };

  const status = getOEEStatus(value);

  return (
    <div className="oee-card">
      <div className="oee-header">
        <h3>Overall Equipment Effectiveness</h3>
        <div className="oee-status" style={{ color: status.color }}>
          {status.label}
        </div>
      </div>
      
      <div className="oee-display">
        <div className="oee-value" style={{ color: status.color }}>
          {value}%
        </div>
        <div className="oee-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${Math.min(100, value)}%`,
                background: `linear-gradient(90deg, ${status.color}, ${status.color}aa)`
              }}
            />
          </div>
          <div className="progress-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="oee-components">
        <div className="component">
          <div className="component-label">Availability</div>
          <div className="component-value">{Math.round(value * 0.33)}%</div>
        </div>
        <div className="component">
          <div className="component-label">Performance</div>
          <div className="component-value">{Math.round(value * 0.33)}%</div>
        </div>
        <div className="component">
          <div className="component-label">Quality</div>
          <div className="component-value">{Math.round(value * 0.34)}%</div>
        </div>
      </div>
    </div>
  );
}

export default function StatsPanel({ stats = {}, sensor, upgrades }) {
  const {
    dailyOutput = 0,
    dailyDefects = 0,
    availability = 0,
    performance = 0,
    quality = 0,
    OEE = 0,
    mtbf = null,
    mttr = null,
    invested = 0,
    annualSavings = 0,
    paybackYears = null,
    history = {}
  } = stats;

  const efficiency = dailyOutput > 0 ? 
    ((dailyOutput - dailyDefects) / dailyOutput) * 100 : 0;

  return (
    <div className="stats-panel">
      <div className="panel-header">
        <h2>Production Analytics</h2>
        <div className="live-indicator">
          <span className="live-dot" /> LIVE
        </div>
      </div>

      <div className="quick-stats">
        <div className="quick-stat">
          <div className="stat-label">Today's Output</div>
          <div className="stat-value">{dailyOutput.toLocaleString()}</div>
          <div className="stat-unit">units</div>
        </div>
        <div className="quick-stat">
          <div className="stat-label">Defects</div>
          <div className="stat-value">{dailyDefects.toLocaleString()}</div>
          <div className="stat-unit">units</div>
        </div>
        <div className="quick-stat">
          <div className="stat-label">Efficiency</div>
          <div className="stat-value">{efficiency.toFixed(1)}%</div>
          <div className="stat-unit">yield</div>
        </div>
      </div>

      <OEECard value={OEE} />

      <div className="kpi-grid">
        <KPICard 
          label="Availability" 
          value={availability} 
          unit="%" 
          target={95}
          color="#3b82f6"
        />
        <KPICard 
          label="Performance" 
          value={performance} 
          unit="%" 
          target={100}
          color="#3b82f6"
        />
        <KPICard 
          label="Quality" 
          value={quality} 
          unit="%" 
          target={99}
          color="#3b82f6"
        />
      </div>

      <div className="reliability-section">
        <h3>Reliability Metrics</h3>
        <div className="reliability-grid">
          <div className="metric-card">
            <div className="metric-icon"></div>
            <div className="metric-content">
              <div className="metric-label">MTBF</div>
              <div className="metric-value">
                {mtbf ? `${mtbf}s` : "—"}
              </div>
              <div className="metric-desc">Mean Time Between Failures</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"></div>
            <div className="metric-content">
              <div className="metric-label">MTTR</div>
              <div className="metric-value">
                {mttr ? `${mttr}s` : "—"}
              </div>
              <div className="metric-desc">Mean Time To Repair</div>
            </div>
          </div>
        </div>
      </div>

      <div className="sensor-trends">
        <h3>Sensor Trends</h3>
        <div className="trends-grid">
          <Sparkline 
            data={history.temp || []} 
            color="#ef4444" 
            title="Temperature (°C)"
          />
          <Sparkline 
            data={history.vib || []} 
            color="#f59e0b" 
            title="Vibration (mm/s)"
          />
          <Sparkline 
            data={history.power || []} 
            color="#3b82f6" 
            title="Power (kW)"
          />
        </div>
      </div>

      <div className="financial-section">
        <h3>💡 Financial Impact</h3>
        <div className="financial-cards">
          <div className="financial-card">
            <div className="financial-header">
              <div className="financial-label">Total Investment</div>
              <div className="financial-badge">Upgrades</div>
            </div>
            <div className="financial-value">
              ₹{invested.toLocaleString()}
            </div>
          </div>

          <div className="financial-card">
            <div className="financial-header">
              <div className="financial-label">Annual Savings</div>
              <div className="financial-badge success">Estimate</div>
            </div>
            <div className="financial-value">
              ₹{annualSavings.toLocaleString()}
            </div>
          </div>

          {paybackYears && (
            <div className="financial-card highlight">
              <div className="financial-header">
                <div className="financial-label">Payback Period</div>
                <div className="financial-badge warning">
                  {paybackYears <= 2 ? "Quick ROI" : "Long Term"}
                </div>
              </div>
              <div className="financial-value large">
                {paybackYears} years
              </div>
              <div className="financial-note">
                {paybackYears <= 2 
                  ? "Excellent investment! ✅" 
                  : paybackYears <= 5 
                  ? "Good long-term investment 📈" 
                  : "Consider phased implementation ⚠️"
                }
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="insights-section">
        <h3>💡 Insights</h3>
        <div className="insight-card">
          {OEE < 70 && (
            <p>Consider enabling IoT sensors to improve equipment monitoring and reduce defects.</p>
          )}
          {paybackYears && paybackYears > 3 && (
            <p>Focus on one upgrade at a time for better ROI calculation.</p>
          )}
          {sensor.temperature > 55 && (
            <p>High temperature detected! This may increase defect rates.</p>
          )}
          <p className="insight-note">
            Based on industry benchmarks for bottle manufacturing. Results may vary with actual data.
          </p>
        </div>
      </div>
    </div>
  );
}