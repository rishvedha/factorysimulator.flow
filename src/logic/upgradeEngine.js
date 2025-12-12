import config from '../data/machine_config.json';
import upgrades from '../data/upgrade_effects.json';

class UpgradeEngine {
  constructor() {
    this.upgradeHistory = [];
    this.machineLevels = {};
  }

  /**
   * Apply an upgrade to a machine
   */
  applyUpgrade(machineId, upgradeType, currentMachineState) {
    const upgrade = upgrades.upgrades[upgradeType];
    if (!upgrade) {
      throw new Error(`Invalid upgrade type: ${upgradeType}`);
    }

    // Check if machine can accept this upgrade
    if (!this.canApplyUpgrade(machineId, upgradeType, currentMachineState)) {
      return {
        success: false,
        message: `Cannot apply ${upgrade.name} to this machine`
      };
    }

    // Calculate new machine state
    const newState = this.calculateUpgradedState(currentMachineState, upgrade);
    
    // Record the upgrade
    this.recordUpgrade(machineId, upgradeType, upgrade.cost);
    
    // Update machine level if needed
    this.updateMachineLevel(machineId);
    
    return {
      success: true,
      newState,
      upgrade,
      message: `Successfully applied ${upgrade.name}`
    };
  }

  /**
   * Check if upgrade can be applied
   */
  canApplyUpgrade(machineId, upgradeType, machineState) {
    const machineConfig = config.machines[machineId];
    const upgrade = upgrades.upgrades[upgradeType];
    
    if (!machineConfig || !upgrade) return false;
    
    // Check upgrade prerequisites
    if (upgrade.effect.requiresLevel) {
      const currentLevel = this.machineLevels[machineId]?.level || 1;
      if (currentLevel < upgrade.effect.requiresLevel) {
        return false;
      }
    }
    
    // Check if machine already has this upgrade
    if (machineState.upgrades?.includes(upgradeType)) {
      return false;
    }
    
    // Check upgrade slots
    const currentUpgrades = machineState.upgrades?.length || 0;
    if (currentUpgrades >= machineConfig.upgradeSlots) {
      return false;
    }
    
    return true;
  }

  /**
   * Calculate new machine state after upgrade
   */
  calculateUpgradedState(currentState, upgrade) {
    const newState = { ...currentState };
    const effects = upgrade.effect;
    
    // Apply effects
    if (effects.speedMultiplier) {
      newState.speed = Math.round(currentState.speed * effects.speedMultiplier);
    }
    
    if (effects.energyMultiplier) {
      newState.energyCost = Math.round(currentState.energyCost * effects.energyMultiplier * 10) / 10;
    }
    
    if (effects.failureRateMultiplier) {
      newState.failureRate = Math.round(currentState.failureRate * effects.failureRateMultiplier * 10) / 10;
    }
    
    if (effects.failureRateIncrease) {
      newState.failureRate = Math.round(currentState.failureRate * effects.failureRateIncrease * 10) / 10;
    }
    
    if (effects.energyIncrease) {
      newState.energyCost = Math.round(currentState.energyCost * effects.energyIncrease * 10) / 10;
    }
    
    if (effects.qualityMultiplier) {
      // Quality affects failure rate inversely
      newState.failureRate = Math.max(0.5, currentState.failureRate / effects.qualityMultiplier);
    }
    
    if (effects.maintenanceIntervalMultiplier) {
      // This would affect lastMaintenance calculation in simulation
      newState.maintenanceIntervalMultiplier = effects.maintenanceIntervalMultiplier;
    }
    
    if (effects.downtimeMultiplier) {
      newState.downtimeMultiplier = effects.downtimeMultiplier;
    }
    
    // Add upgrade to machine's upgrade list
    newState.upgrades = [...(currentState.upgrades || []), upgrade.name.toLowerCase().replace(' ', '_')];
    
    // Recalculate efficiency based on upgrades
    newState.efficiency = this.calculateEfficiency(newState);
    
    return newState;
  }

  /**
   * Calculate machine efficiency based on upgrades and condition
   */
  calculateEfficiency(machineState) {
    let efficiency = machineState.efficiency || 80;
    
    // Base efficiency from machine condition
    const temperatureFactor = machineState.temperature > 75 ? 0.9 : 1;
    const vibrationFactor = machineState.vibration > 3 ? 0.95 : 1;
    const maintenanceFactor = machineState.lastMaintenance > 150 ? 0.85 : 1;
    
    efficiency *= temperatureFactor * vibrationFactor * maintenanceFactor;
    
    // Upgrade bonuses
    if (machineState.upgrades) {
      if (machineState.upgrades.includes('efficiency')) {
        efficiency *= 1.08;
      }
      if (machineState.upgrades.includes('reliability')) {
        efficiency *= 1.05;
      }
      if (machineState.upgrades.includes('speed')) {
        efficiency *= 0.98; // Speed upgrades slightly reduce efficiency
      }
      if (machineState.upgrades.includes('energy')) {
        efficiency *= 1.03;
      }
    }
    
    return Math.min(100, Math.max(50, Math.round(efficiency)));
  }

  /**
   * Record upgrade in history
   */
  recordUpgrade(machineId, upgradeType, cost) {
    const upgrade = upgrades.upgrades[upgradeType];
    
    this.upgradeHistory.push({
      machineId,
      upgradeType,
      upgradeName: upgrade.name,
      cost,
      timestamp: new Date().toISOString(),
      effects: upgrade.effect
    });
    
    // Update machine's upgrade count
    if (!this.machineLevels[machineId]) {
      this.machineLevels[machineId] = {
        upgrades: 0,
        level: 1,
        totalInvestment: 0
      };
    }
    
    this.machineLevels[machineId].upgrades++;
    this.machineLevels[machineId].totalInvestment += cost;
    
    // Sort upgrade history by timestamp
    this.upgradeHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Update machine level based on upgrades
   */
  updateMachineLevel(machineId) {
    const machineData = this.machineLevels[machineId];
    if (!machineData) return;
    
    const upgradeCount = machineData.upgrades;
    const totalInvestment = machineData.totalInvestment;
    
    let newLevel = 1;
    
    if (upgradeCount >= 4 || totalInvestment >= 2000) {
      newLevel = 3; // Premium
    } else if (upgradeCount >= 2 || totalInvestment >= 1000) {
      newLevel = 2; // Advanced
    }
    
    machineData.level = newLevel;
  }

  /**
   * Get available upgrades for a machine
   */
  getAvailableUpgrades(machineId, machineState) {
    const machineConfig = config.machines[machineId];
    const currentLevel = this.machineLevels[machineId]?.level || 1;
    const levelConfig = upgrades.levels[currentLevel];
    
    if (!machineConfig || !levelConfig) return [];
    
    return levelConfig.availableUpgrades
      .filter(upgradeType => {
        const upgrade = upgrades.upgrades[upgradeType];
        // Check prerequisites
        if (upgrade.effect.requiresLevel && currentLevel < upgrade.effect.requiresLevel) {
          return false;
        }
        // Check if already applied
        if (machineState.upgrades?.includes(upgradeType)) {
          return false;
        }
        return true;
      })
      .map(upgradeType => ({
        type: upgradeType,
        ...upgrades.upgrades[upgradeType]
      }));
  }

  /**
   * Get upgrade recommendations based on ROI
   */
  getUpgradeRecommendations(machineId, machineState, roiAnalysis) {
    const availableUpgrades = this.getAvailableUpgrades(machineId, machineState);
    const recommendations = [];
    
    availableUpgrades.forEach(upgrade => {
      // Calculate expected impact
      const impact = this.calculateUpgradeImpact(machineState, upgrade);
      
      // Use ROI analysis if available
      const roi = roiAnalysis?.find(a => a.upgradeType === upgrade.type)?.roiPercentage || 0;
      
      recommendations.push({
        upgrade,
        impact,
        priority: this.calculatePriority(impact, roi),
        cost: upgrade.cost,
        expectedBenefits: this.describeBenefits(impact)
      });
    });
    
    // Sort by priority
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate upgrade impact
   */
  calculateUpgradeImpact(machineState, upgrade) {
    const effects = upgrade.effect;
    const impact = {
      speed: 0,
      efficiency: 0,
      reliability: 0,
      energy: 0,
      quality: 0
    };
    
    if (effects.speedMultiplier) {
      impact.speed = (effects.speedMultiplier - 1) * 100;
    }
    
    if (effects.energyMultiplier) {
      impact.energy = (1 - effects.energyMultiplier) * 100;
    }
    
    if (effects.failureRateMultiplier) {
      impact.reliability = (1 - effects.failureRateMultiplier) * 100;
    }
    
    if (effects.qualityMultiplier) {
      impact.quality = (effects.qualityMultiplier - 1) * 100;
    }
    
    // Calculate overall efficiency impact
    const tempState = this.calculateUpgradedState(machineState, upgrade);
    impact.efficiency = tempState.efficiency - machineState.efficiency;
    
    return impact;
  }

  /**
   * Calculate upgrade priority
   */
  calculatePriority(impact, roi) {
    // Weight different factors
    const weights = {
      efficiency: 0.3,
      reliability: 0.25,
      energy: 0.2,
      speed: 0.15,
      quality: 0.1
    };
    
    let priority = 0;
    Object.keys(weights).forEach(factor => {
      priority += (impact[factor] || 0) * weights[factor];
    });
    
    // Add ROI bonus
    priority += roi * 0.01;
    
    return priority;
  }

  /**
   * Describe upgrade benefits
   */
  describeBenefits(impact) {
    const benefits = [];
    
    if (impact.speed > 0) {
      benefits.push(`+${impact.speed.toFixed(1)}% production speed`);
    }
    if (impact.efficiency > 0) {
      benefits.push(`+${impact.efficiency.toFixed(1)}% overall efficiency`);
    }
    if (impact.reliability > 0) {
      benefits.push(`+${impact.reliability.toFixed(1)}% reliability`);
    }
    if (impact.energy > 0) {
      benefits.push(`${impact.energy.toFixed(1)}% energy savings`);
    }
    if (impact.quality > 0) {
      benefits.push(`+${impact.quality.toFixed(1)}% quality improvement`);
    }
    
    return benefits.length > 0 ? benefits : ['Minor improvements'];
  }

  /**
   * Get upgrade history for a machine
   */
  getUpgradeHistory(machineId) {
    return this.upgradeHistory
      .filter(upgrade => upgrade.machineId === machineId)
      .slice(0, 10); // Return last 10 upgrades
  }

  /**
   * Get total investment for a machine
   */
  getTotalInvestment(machineId) {
    const machineData = this.machineLevels[machineId];
    return machineData?.totalInvestment || 0;
  }

  /**
   * Get machine level information
   */
  getMachineLevel(machineId) {
    const machineData = this.machineLevels[machineId];
    if (!machineData) {
      return {
        level: 1,
        name: 'Basic',
        upgradesApplied: 0,
        totalInvestment: 0,
        nextLevel: {
          requiredUpgrades: 2,
          requiredInvestment: 1000,
          unlocks: upgrades.levels[2].availableUpgrades
        }
      };
    }
    
    const currentLevel = machineData.level;
    const nextLevel = currentLevel < 3 ? currentLevel + 1 : null;
    
    return {
      level: currentLevel,
      name: upgrades.levels[currentLevel].name,
      upgradesApplied: machineData.upgrades,
      totalInvestment: machineData.totalInvestment,
      nextLevel: nextLevel ? {
        requiredUpgrades: machineData.upgrades >= 2 ? 4 : 2,
        requiredInvestment: 2000 - machineData.totalInvestment,
        unlocks: upgrades.levels[nextLevel].availableUpgrades
      } : null
    };
  }
}

export default new UpgradeEngine();