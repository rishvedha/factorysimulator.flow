// src/logic/simulationEngine.js
export function computeSimulationState(factoryLayout, opts = {}) {
  console.log("🔧 simulationEngine called with:", {
    layoutLength: factoryLayout?.length,
    layout: factoryLayout,
    opts: opts
  });

  // Default options
  const duration = opts.durationSeconds ?? 10; // Shorter for preview
  const cellSize = opts.cellSize ?? 20; // MUST match 3D viewer scale
  const rows = opts.rows ?? 6;
  const cols = opts.cols ?? 8;

  // If no layout, return empty state
  if (!factoryLayout || factoryLayout.length === 0) {
    console.log("⚠️ No factory layout provided");
    return {
      nodes: [],
      items: [],
      throughputPerSec: 0,
      estimatedItemsProduced: 0,
      metrics: {
        machineCount: 0,
        totalCycleTime: 0,
        avgCycleTime: 0
      }
    };
  }

  // Sort machines: top-left to bottom-right (row first, then column)
  const nodes = [...factoryLayout].sort((a, b) => {
    // First sort by row (y), then by column (x)
    if (a.position.y !== b.position.y) {
      return a.position.y - b.position.y;
    }
    return a.position.x - b.position.x;
  });

  console.log("📋 Sorted nodes:", nodes);

  // CRITICAL FIX: Convert 2D grid to 3D world coordinates
  // 2D: x = column (0-7), y = row (0-5)
  // 3D: x = column * cellSize, z = row * cellSize (negative for orientation)
  const positions = nodes.map((machine, index) => {
    const gridX = machine.position.x; // column
    const gridY = machine.position.y; // row
    
    // Convert to 3D world coordinates
    const worldX = gridX * cellSize;
    const worldZ = gridY * cellSize; // Using Z for row dimension
    
    // Center the machine in the cell
    const centeredX = worldX + (cellSize / 2);
    const centeredZ = worldZ + (cellSize / 2);
    
    return {
      id: machine.id || `machine-${index}`,
      name: machine.name || `Machine ${index + 1}`,
      type: machine.type || 'feeder',
      // POSITION: This is what Machine3D expects!
      pos: [centeredX, 0, centeredZ],
      // Store grid position for debugging
      gridPos: { x: gridX, y: gridY },
      // Machine properties
      cycleTime: machine.cycleTime || 5,
      speed: Math.max(1, Math.round(60 / (machine.cycleTime || 1))),
      icon: machine.icon || '⚙️',
      color: machine.color || '#3b82f6'
    };
  });

  console.log("🎯 Converted positions:", positions);

  // Calculate throughput
  const pathSpeedBpm = positions.length ? Math.min(...positions.map(p => p.speed)) : 0;
  const throughputPerSec = pathSpeedBpm / 60;
  console.log(`📊 Throughput: ${throughputPerSec.toFixed(2)} items/sec`);

  // Create moving items for visualization
  const items = [];
  if (positions.length > 0) {
    const totalPathTime = positions.reduce((sum, p) => sum + (p.cycleTime || 5), 0);
    const spawnInterval = throughputPerSec > 0 ? Math.max(0.5, 1 / throughputPerSec) : 2;
    
    console.log(`🕒 Path time: ${totalPathTime}s, Spawn interval: ${spawnInterval}s`);

    let t = 0;
    let idCounter = 0;
    
    // Generate items for the first 10 seconds
    while (t < Math.min(duration, 10)) {
      items.push({
        id: `item_${idCounter++}`,
        spawnTime: t,
        timePerItem: totalPathTime * 0.8, // Slightly faster for visual appeal
        // Add start and end positions for animation
        startPos: positions[0].pos,
        endPos: positions[positions.length - 1].pos
      });
      t += spawnInterval;
      
      // Limit to reasonable number of items
      if (items.length > 20) break;
    }
  }

  // Calculate metrics
  const totalCycleTime = positions.reduce((sum, node) => sum + node.cycleTime, 0);
  const avgCycleTime = positions.length > 0 ? totalCycleTime / positions.length : 0;

  const result = {
    nodes: positions,
    items,
    throughputPerSec,
    estimatedItemsProduced: Math.round(throughputPerSec * duration),
    metrics: {
      machineCount: positions.length,
      totalCycleTime,
      avgCycleTime: avgCycleTime.toFixed(2),
      efficiency: positions.length > 0 ? '85%' : '0%',
      energyUsage: positions.reduce((sum, node) => sum + (node.cycleTime * 10), 0)
    }
  };

  console.log("✅ Final simulation state:", result);
  return result;
}