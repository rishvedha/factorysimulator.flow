import React from 'react';
import { useSimulation } from '../../context/SimulationContext';

export default function I40Panel() {
  const {
    i40Enabled,
    i40Config,
    toggleI40,
    updateI40Config,
    financialComparison,
  } = useSimulation();

  const Slider = ({ label, value, onChange }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: 12, color: 'white' }}>{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        style={{ width: '100%' }}
      />
    </div>
  );

  const num = (x, d = 0) =>
    typeof x === 'number' && isFinite(x)
      ? x.toFixed(d)
      : '—';

  const paybackLabel = () => {
    const m = financialComparison.financials.paybackMonths;
    if (!isFinite(m) || m === 0) return 'N/A';
    if (m < 1) return '< 1 month';
    return `${num(m, 1)} months`;
  };

  return (
    <div style={{
      position: 'absolute',
      right: 20,
      top: 240,
      width: 320,
      background: 'rgba(15,23,42,0.95)',
      color: 'white',
      padding: 16,
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      zIndex: 110,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 700 }}>Industry 4.0 (IoT + AI)</div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <span style={{ color: '#94a3b8' }}>{i40Enabled ? 'ON' : 'OFF'}</span>
          <input type="checkbox" checked={i40Enabled} onChange={toggleI40} />
        </label>
      </div>

      <div style={{ opacity: i40Enabled ? 1 : 0.5, pointerEvents: i40Enabled ? 'auto' : 'none' }}>
        <Slider
          label="Predictive Maintenance"
          value={i40Config.predictiveMaintenance}
          onChange={(v) => updateI40Config({ predictiveMaintenance: v })}
        />
        <Slider
          label="Adaptive Speed Optimization"
          value={i40Config.adaptiveSpeed}
          onChange={(v) => updateI40Config({ adaptiveSpeed: v })}
        />
        <Slider
          label="Quality AI (Vision)"
          value={i40Config.qualityAI}
          onChange={(v) => updateI40Config({ qualityAI: v })}
        />
        <Slider
          label="Energy Optimization"
          value={i40Config.energyOptimization}
          onChange={(v) => updateI40Config({ energyOptimization: v })}
        />
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 0 12px' }} />

      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>KPI Impact</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 8 }}>
          <div style={{ color: '#94a3b8' }}>Throughput</div>
          <div>{num(financialComparison.base.throughputPerMin)} → <b>{num(financialComparison.i40.throughputPerMin)}</b> /min</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 8 }}>
          <div style={{ color: '#94a3b8' }}>Defect Rate</div>
          <div>{num(financialComparison.base.defectRate*100,1)}% → <b>{num(financialComparison.i40.defectRate*100,1)}%</b></div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 8 }}>
          <div style={{ color: '#94a3b8' }}>Energy kWh/hr</div>
          <div>{num(financialComparison.base.energyKWhPerHour,2)} → <b>{num(financialComparison.i40.energyKWhPerHour,2)}</b></div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 8 }}>
          <div style={{ color: '#94a3b8' }}>Downtime hrs/mo</div>
          <div>{num(financialComparison.base.downtimeHrsPerMonth,1)} → <b>{num(financialComparison.i40.downtimeHrsPerMonth,1)}</b></div>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />

      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Financial Impact</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
        <div style={{ background: 'rgba(16,185,129,0.1)', padding: 8, borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ color: '#34d399' }}>Monthly Savings</div>
          <div><b>₹{num(financialComparison.financials.monthlySavings, 0)}</b></div>
        </div>
        <div style={{ background: 'rgba(59,130,246,0.1)', padding: 8, borderRadius: 8, border: '1px solid rgba(59,130,246,0.2)' }}>
          <div style={{ color: '#60a5fa' }}>Annual ROI</div>
          <div><b>{num(financialComparison.financials.annualRoiPct, 1)}%</b></div>
        </div>
        <div style={{ background: 'rgba(245,158,11,0.1)', padding: 8, borderRadius: 8, gridColumn: 'span 2', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ color: '#f59e0b' }}>Payback Period</div>
          <div><b>{paybackLabel()}</b></div>
        </div>
      </div>
    </div>
  );
}
