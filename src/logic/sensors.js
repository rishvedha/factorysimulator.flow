/**
 * Simulates machine sensors and generates realistic sensor data
 */

class SensorSimulator {
  constructor() {
    this.sensorHistory = {};
    this.anomalyProbabilities = {};
    this.maintenanceSchedule = {};
  }

  /**
   * Initialize sensors for a machine
   */
  initializeMachineSensors(machineId, baseValues) {
    this.sensorHistory[machineId] = {
      temperature: [baseValues.temperature || 60],
      vibration: [baseValues.vibration || 2.0],
      pressure: [baseValues.pressure || 100],
      current: [baseValues.current || 15],
      noise: [baseValues.noise || 70]
    };
    
    this.anomalyProbabilities[machineId] = {
      temperature: 0.05,
      vibration: 0.03,
      pressure: 0.02,
      current: 0.04,
      noise: 0.01
    };
  }

  /**
   * Generate new sensor readings with realistic patterns
   */
  generateSensorReadings(machineId, machineState) {
    const readings = {};
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Base patterns
    const timeFactor = Math.sin((hour * 60 + minute) * Math.PI / 720) * 0.5 + 0.5;
    
    // Temperature (varies with time and machine load)
    readings.temperature = this.generateTemperature(machineId, machineState, timeFactor);
    
    // Vibration (increases with wear and speed)
    readings.vibration = this.generateVibration(machineId, machineState);
    
    // Pressure (relatively stable with minor fluctuations)
    readings.pressure = this.generatePressure(machineId);
    
    // Current draw (correlates with speed and efficiency)
    readings.current = this.generateCurrent(machineId, machineState);
    
    // Noise level (increases with vibration)
    readings.noise = this.generateNoise(machineId, readings.vibration);
    
    // Detect anomalies
    readings.anomalies = this.detectAnomalies(machineId, readings, machineState);
    
    // Update history
    Object.keys(readings).forEach(key => {
      if (key !== 'anomalies' && this.sensorHistory[machineId]) {
        this.sensorHistory[machineId][key].push(readings[key]);
        if (this.sensorHistory[machineId][key].length > 100) {
          this.sensorHistory[machineId][key].shift();
        }
      }
    });
    
    return readings;
  }

  /**
   * Generate temperature reading with realistic patterns
   */
  generateTemperature(machineId, machineState, timeFactor) {
    const history = this.sensorHistory[machineId]?.temperature || [60];
    const lastTemp = history[history.length - 1];
    
    // Base temperature based on machine load
    let baseTemp = 60 + (machineState.speed / 30) * 10;
    
    // Efficiency effect (more efficient = less heat)
    baseTemp -= (machineState.efficiency - 80) * 0.2;
    
    // Time of day effect (colder at night)
    baseTemp += timeFactor * 5;
    
    // Random fluctuation
    const fluctuation = (Math.random() - 0.5) * 2;
    
    // Gradual change from last reading (inertia)
    const newTemp = lastTemp * 0.7 + (baseTemp + fluctuation) * 0.3;
    
    return Math.round(newTemp * 10) / 10;
  }

  /**
   * Generate vibration reading
   */
  generateVibration(machineId, machineState) {
    const history = this.sensorHistory[machineId]?.vibration || [2.0];
    const lastVib = history[history.length - 1];
    
    // Base vibration based on speed
    let baseVib = 2.0 + (machineState.speed / 30) * 1.5;
    
    // Wear effect (increases over time)
    const wearFactor = Math.min(1, (machineState.lastMaintenance || 0) / 200);
    baseVib += wearFactor * 1.5;
    
    // Reliability upgrades reduce vibration
    if (machineState.upgrades?.includes('reliability')) {
      baseVib *= 0.8;
    }
    
    // Random component
    const random = (Math.random() - 0.5) * 0.5;
    
    // Gradual change
    const newVib = lastVib * 0.8 + (baseVib + random) * 0.2;
    
    return Math.round(newVib * 10) / 10;
  }

  /**
   * Generate pressure reading
   */
  generatePressure(machineId) {
    const history = this.sensorHistory[machineId]?.pressure || [100];
    const lastPressure = history[history.length - 1];
    
    // Pressure is relatively stable
    const basePressure = 100;
    const fluctuation = (Math.random() - 0.5) * 5;
    
    // Gradual return to base
    const newPressure = lastPressure * 0.9 + (basePressure + fluctuation) * 0.1;
    
    return Math.round(newPressure);
  }

  /**
   * Generate current reading
   */
  generateCurrent(machineId, machineState) {
    // Base current based on energy cost
    let baseCurrent = machineState.energyCost * 3;
    
    // Efficiency effect
    baseCurrent *= (100 - machineState.efficiency) / 100 * 0.5 + 0.5;
    
    // Speed effect
    baseCurrent *= machineState.speed / 30;
    
    // Energy upgrades reduce current
    if (machineState.upgrades?.includes('energy')) {
      baseCurrent *= 0.8;
    }
    
    // Random fluctuation
    const fluctuation = (Math.random() - 0.5) * 0.5;
    
    return Math.round((baseCurrent + fluctuation) * 10) / 10;
  }

  /**
   * Generate noise level
   */
  generateNoise(machineId, vibration) {
    // Noise correlates with vibration
    const baseNoise = 70 + vibration * 5;
    const fluctuation = (Math.random() - 0.5) * 3;
    
    return Math.round(baseNoise + fluctuation);
  }

  /**
   * Detect anomalies in sensor readings
   */
  detectAnomalies(machineId, readings, machineState) {
    const anomalies = [];
    const history = this.sensorHistory[machineId] || {};
    
    // Check temperature anomaly
    if (readings.temperature > 80) {
      anomalies.push({
        type: 'high_temperature',
        severity: readings.temperature > 85 ? 'critical' : 'warning',
        value: readings.temperature,
        threshold: 80,
        message: `High temperature detected: ${readings.temperature}°C`
      });
    }
    
    // Check vibration anomaly
    if (readings.vibration > 3.5) {
      anomalies.push({
        type: 'high_vibration',
        severity: readings.vibration > 4 ? 'critical' : 'warning',
        value: readings.vibration,
        threshold: 3.5,
        message: `High vibration detected: ${readings.vibration} mm/s`
      });
    }
    
    // Check sudden changes
    Object.keys(readings).forEach(sensor => {
      if (sensor === 'anomalies') return;
      
      const sensorHistory = history[sensor];
      if (sensorHistory && sensorHistory.length >= 3) {
        const recentReadings = sensorHistory.slice(-3);
        const avgRecent = recentReadings.reduce((a, b) => a + b, 0) / 3;
        const change = Math.abs(readings[sensor] - avgRecent) / avgRecent;
        
        if (change > 0.3) { // 30% sudden change
          anomalies.push({
            type: `sudden_change_${sensor}`,
            severity: 'warning',
            value: readings[sensor],
            previous: avgRecent,
            change: (change * 100).toFixed(1),
            message: `Sudden ${sensor} change: ${(change * 100).toFixed(1)}%`
          });
        }
      }
    });
    
    // Predict maintenance needs
    const maintenanceUrgency = this.predictMaintenance(machineState);
    if (maintenanceUrgency > 0.7) {
      anomalies.push({
        type: 'maintenance_required',
        severity: maintenanceUrgency > 0.9 ? 'critical' : 'warning',
        value: maintenanceUrgency,
        threshold: 0.7,
        message: `Maintenance required soon (${Math.round(maintenanceUrgency * 100)}% wear)`
      });
    }
    
    return anomalies;
  }

  /**
   * Predict maintenance urgency
   */
  predictMaintenance(machineState) {
    const { lastMaintenance, failureRate, efficiency } = machineState;
    
    // Normalize values
    const timeFactor = Math.min(1, (lastMaintenance || 0) / 200);
    const reliabilityFactor = failureRate / 5; // Normalize to 0-1
    const efficiencyFactor = (100 - efficiency) / 100;
    
    // Weighted average
    const urgency = (timeFactor * 0.5 + reliabilityFactor * 0.3 + efficiencyFactor * 0.2);
    
    return Math.min(1, urgency);
  }

  /**
   * Get sensor trends
   */
  getSensorTrends(machineId, hours = 24) {
    if (!this.sensorHistory[machineId]) {
      return null;
    }
    
    const trends = {};
    const pointsPerHour = 2; // Assuming readings every 30 minutes
    const totalPoints = hours * pointsPerHour;
    
    Object.keys(this.sensorHistory[machineId]).forEach(sensor => {
      const history = this.sensorHistory[machineId][sensor];
      const recent = history.slice(-totalPoints);
      
      if (recent.length >= 2) {
        const first = recent[0];
        const last = recent[recent.length - 1];
        const trend = (last - first) / first;
        
        trends[sensor] = {
          current: last,
          average: recent.reduce((a, b) => a + b, 0) / recent.length,
          min: Math.min(...recent),
          max: Math.max(...recent),
          trend: trend,
          trendDirection: trend > 0.05 ? 'increasing' : trend < -0.05 ? 'decreasing' : 'stable'
        };
      }
    });
    
    return trends;
  }

  /**
   * Generate sensor alerts
   */
  generateAlerts(machineId, machineState) {
    const readings = this.generateSensorReadings(machineId, machineState);
    const anomalies = readings.anomalies;
    
    const alerts = anomalies.map(anomaly => ({
      machineId,
      machineName: machineState.name,
      timestamp: new Date().toISOString(),
      ...anomaly,
      suggestedAction: this.getSuggestedAction(anomaly.type, machineState)
    }));
    
    return alerts;
  }

  /**
   * Get suggested action for an anomaly
   */
  getSuggestedAction(anomalyType, machineState) {
    const actions = {
      'high_temperature': 'Reduce machine speed or check cooling system',
      'high_vibration': 'Schedule maintenance check and balance rotating parts',
      'sudden_change_temperature': 'Investigate for blockages or cooling failure',
      'sudden_change_vibration': 'Check for loose components or bearing failure',
      'sudden_change_current': 'Check electrical connections and motor condition',
      'maintenance_required': `Schedule preventive maintenance (${machineState.lastMaintenance} hours since last)`
    };
    
    return actions[anomalyType] || 'Investigate machine condition';
  }
}

export default new SensorSimulator();