/**
 * Overall Equipment Effectiveness (OEE) Calculations
 */

export const calculateOEE = (availability, performance, quality) => {
  return (availability * performance * quality) / 10000;
};

export const calculateAvailability = (plannedProductionTime, downtime) => {
  const operatingTime = plannedProductionTime - downtime;
  return (operatingTime / plannedProductionTime) * 100;
};

export const calculatePerformance = (idealCycleTime, actualOutput) => {
  const idealOutput = 3600 / idealCycleTime; // per hour
  return (actualOutput / idealOutput) * 100;
};

export const calculateQuality = (totalOutput, defectiveOutput) => {
  const goodOutput = totalOutput - defectiveOutput;
  return (goodOutput / totalOutput) * 100;
};

/**
 * Production Calculations
 */
export const calculateBottlesPerMinute = (machines) => {
  // Bottleneck principle: production rate is limited by slowest machine
  const speeds = Object.values(machines).map(m => m.speed);
  return Math.min(...speeds) * 0.85; // 85% efficiency factor
};

export const calculateEnergyConsumption = (machines) => {
  return Object.values(machines).reduce((total, machine) => {
    return total + machine.energyCost;
  }, 0) * 60; // Convert to hourly
};

/**
 * Cost Calculations
 */
export const calculateProductionCost = (bottlesProduced, config) => {
  const {
    electricityCost,
    maintenanceCost,
    laborCost,
    rawMaterialCost,
    packagingCost
  } = config.costs;
  
  const materialCost = bottlesProduced * rawMaterialCost;
  const packaging = bottlesProduced * packagingCost;
  const energy = (bottlesProduced / 50) * electricityCost; // Approximation
  const maintenance = (bottlesProduced / 1000) * maintenanceCost;
  const labor = (bottlesProduced / 200) * laborCost;
  
  return materialCost + packaging + energy + maintenance + labor;
};

export const calculateROI = (investment, savings, timePeriod = 12) => {
  if (investment === 0) return 0;
  const netProfit = savings - investment;
  return (netProfit / investment) * 100;
};

export const calculatePaybackPeriod = (investment, monthlySavings) => {
  if (monthlySavings <= 0) return Infinity;
  return investment / monthlySavings;
};

/**
 * Machine Health Calculations
 */
export const calculateMachineHealth = (machine) => {
  const { temperature, vibration, lastMaintenance, failureRate } = machine;
  
  let healthScore = 100;
  
  // Temperature penalty
  if (temperature > 80) healthScore -= 30;
  else if (temperature > 70) healthScore -= 15;
  else if (temperature > 65) healthScore -= 5;
  
  // Vibration penalty
  if (vibration > 4) healthScore -= 40;
  else if (vibration > 3) healthScore -= 20;
  else if (vibration > 2.5) healthScore -= 10;
  
  // Maintenance penalty
  if (lastMaintenance > 200) healthScore -= 30;
  else if (lastMaintenance > 150) healthScore -= 15;
  else if (lastMaintenance > 100) healthScore -= 5;
  
  // Failure rate penalty
  healthScore -= failureRate * 2;
  
  return Math.max(0, Math.min(100, healthScore));
};

export const predictFailure = (machine, config) => {
  const health = calculateMachineHealth(machine);
  const baseFailureRate = machine.failureRate;
  
  // Calculate probability of failure in next 24 hours
  let failureProbability = baseFailureRate;
  
  if (machine.temperature > config.maxTemperature * 0.9) {
    failureProbability *= 1.5;
  }
  
  if (machine.vibration > config.criticalVibration * 0.8) {
    failureProbability *= 1.3;
  }
  
  if (machine.lastMaintenance > config.maintenanceInterval * 0.8) {
    failureProbability *= 1.4;
  }
  
  return Math.min(99, failureProbability * (1 - health / 100) * 100);
};