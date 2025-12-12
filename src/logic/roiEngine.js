import { calculateROI, calculatePaybackPeriod } from './calculations';

class ROIEngine {
  constructor() {
    this.upgradeHistory = [];
    this.financialMetrics = {
      totalInvestment: 0,
      totalSavings: 0,
      energySavings: 0,
      maintenanceSavings: 0,
      qualitySavings: 0,
      productivityGains: 0
    };
  }

  /**
   * Calculate ROI for a specific upgrade
   */
  calculateUpgradeROI(upgradeCost, machine, config) {
    const savings = this.calculateExpectedSavings(machine, config);
    const roi = calculateROI(upgradeCost, savings.annualSavings);
    const paybackMonths = calculatePaybackPeriod(upgradeCost, savings.monthlySavings);
    
    return {
      upgradeCost,
      annualSavings: savings.annualSavings,
      monthlySavings: savings.monthlySavings,
      roiPercentage: roi,
      paybackMonths: paybackMonths,
      breakEvenDate: this.calculateBreakEvenDate(paybackMonths),
      details: savings.breakdown
    };
  }

  /**
   * Calculate expected savings from an upgrade
   */
  calculateExpectedSavings(machine, config) {
    const {
      electricityCost,
      maintenanceCost,
      laborCost,
      rawMaterialCost,
      packagingCost
    } = config.costs;

    // Energy savings
    const energyReduction = machine.energyCost * 0.2; // 20% reduction
    const hourlyEnergySavings = energyReduction * electricityCost;
    const annualEnergySavings = hourlyEnergySavings * 24 * 365 * 0.85; // 85% utilization

    // Maintenance savings
    const maintenanceReduction = maintenanceCost * 0.3; // 30% reduction
    const annualMaintenanceSavings = maintenanceReduction * 12;

    // Productivity gains (reduced downtime)
    const downtimeReduction = machine.failureRate * 0.3; // 30% reduction
    const hourlyProductionValue = machine.speed * (rawMaterialCost + packagingCost) * 60;
    const annualProductivityGains = downtimeReduction * 8 * 250 * hourlyProductionValue / 100;

    // Quality improvements (reduced defects)
    const defectReduction = machine.failureRate * 0.25; // 25% reduction
    const annualQualitySavings = defectReduction * machine.speed * 60 * 8 * 250 * (rawMaterialCost + packagingCost) / 100;

    const totalAnnualSavings = annualEnergySavings + annualMaintenanceSavings + annualProductivityGains + annualQualitySavings;
    const monthlySavings = totalAnnualSavings / 12;

    return {
      annualSavings: totalAnnualSavings,
      monthlySavings: monthlySavings,
      breakdown: {
        energy: annualEnergySavings,
        maintenance: annualMaintenanceSavings,
        productivity: annualProductivityGains,
        quality: annualQualitySavings
      }
    };
  }

  /**
   * Calculate break-even date
   */
  calculateBreakEvenDate(paybackMonths) {
    const now = new Date();
    const breakEven = new Date(now);
    breakEven.setMonth(now.getMonth() + paybackMonths);
    return breakEven;
  }

  /**
   * Record an upgrade for tracking
   */
  recordUpgrade(upgradeData) {
    this.upgradeHistory.push({
      ...upgradeData,
      timestamp: new Date().toISOString()
    });
    
    // Update financial metrics
    this.financialMetrics.totalInvestment += upgradeData.upgradeCost;
    this.financialMetrics.totalSavings += upgradeData.annualSavings;
    this.financialMetrics.energySavings += upgradeData.details.energy;
    this.financialMetrics.maintenanceSavings += upgradeData.details.maintenance;
    this.financialMetrics.qualitySavings += upgradeData.details.quality;
    this.financialMetrics.productivityGains += upgradeData.details.productivity;
  }

  /**
   * Get ROI summary
   */
  getROISummary() {
    if (this.financialMetrics.totalInvestment === 0) {
      return {
        overallROI: 0,
        paybackPeriod: 'N/A',
        netPresentValue: 0,
        internalRateOfReturn: 0
      };
    }

    const overallROI = calculateROI(
      this.financialMetrics.totalInvestment,
      this.financialMetrics.totalSavings
    );

    const totalMonthlySavings = this.financialMetrics.totalSavings / 12;
    const paybackPeriod = calculatePaybackPeriod(
      this.financialMetrics.totalInvestment,
      totalMonthlySavings
    );

    // Simplified NPV calculation (5-year horizon, 10% discount rate)
    const npv = this.calculateNPV(5, 0.1);
    
    // Simplified IRR calculation
    const irr = this.calculateIRR();

    return {
      overallROI,
      paybackPeriod: `${paybackPeriod.toFixed(1)} months`,
      netPresentValue: npv,
      internalRateOfReturn: irr,
      totalInvestment: this.financialMetrics.totalInvestment,
      totalSavings: this.financialMetrics.totalSavings,
      savingsBreakdown: {
        energy: this.financialMetrics.energySavings,
        maintenance: this.financialMetrics.maintenanceSavings,
        quality: this.financialMetrics.qualitySavings,
        productivity: this.financialMetrics.productivityGains
      }
    };
  }

  /**
   * Calculate Net Present Value
   */
  calculateNPV(years, discountRate) {
    let npv = -this.financialMetrics.totalInvestment;
    const annualCashFlow = this.financialMetrics.totalSavings;
    
    for (let i = 1; i <= years; i++) {
      npv += annualCashFlow / Math.pow(1 + discountRate, i);
    }
    
    return npv;
  }

  /**
   * Calculate Internal Rate of Return (simplified)
   */
  calculateIRR() {
    const years = 5;
    const initialInvestment = this.financialMetrics.totalInvestment;
    const annualCashFlow = this.financialMetrics.totalSavings;
    
    if (annualCashFlow <= 0) return 0;
    
    // Simplified IRR calculation
    const npvAt10 = this.calculateNPV(years, 0.1);
    const npvAt20 = this.calculateNPV(years, 0.2);
    
    // Linear interpolation
    const irr = 0.1 + (0.1 * npvAt10 / (npvAt10 - npvAt20));
    
    return Math.min(100, Math.max(0, irr * 100));
  }

  /**
   * Generate upgrade recommendations
   */
  generateRecommendations(machines, config) {
    const recommendations = [];
    
    Object.values(machines).forEach(machine => {
      // Check which upgrades would be most beneficial
      const upgrades = ['speed', 'efficiency', 'reliability', 'energy'];
      
      upgrades.forEach(upgradeType => {
        const upgradeCost = config.upgradeCosts[upgradeType] || 500;
        const roiAnalysis = this.calculateUpgradeROI(upgradeCost, machine, config);
        
        if (roiAnalysis.roiPercentage > 50) { // Only recommend high-ROI upgrades
          recommendations.push({
            machine: machine.name,
            upgradeType,
            cost: upgradeCost,
            expectedROI: roiAnalysis.roiPercentage,
            paybackMonths: roiAnalysis.paybackMonths,
            priority: this.calculatePriority(machine, roiAnalysis.roiPercentage)
          });
        }
      });
    });
    
    // Sort by priority (highest ROI first)
    return recommendations.sort((a, b) => b.expectedROI - a.expectedROI);
  }

  calculatePriority(machine, roi) {
    const healthScore = machine.efficiency - machine.failureRate;
    return (roi * 0.6) + (healthScore * 0.4);
  }
}

export default new ROIEngine();