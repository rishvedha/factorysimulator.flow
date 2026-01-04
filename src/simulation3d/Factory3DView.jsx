// src/simulation/Factory3DView.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Float, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";
import { useSimulation } from "../context/SimulationContext";
import { computeSimulationState } from "../logic/simulationEngine";
import FeederMachine from "./FeederMachine";
import FillerMachine from "./FillerMachine";
import CapperMachine from "./CapperMachine";
import LabelerMachine from "./LabelerMachine";
import PackagingMachine from "./PackagingMachine";
import AnimatedBottle from "./AnimatedBottle";
import I40Panel from "../components/ui/I40Panel";

// Simple conveyor segment between two points
function ConveyorSegment({ from, to }) {
  if (!from || !to) return null;
  
  const length = Math.hypot(to.x - from.x, to.z - from.z);
  const angle = Math.atan2(to.x - from.x, to.z - from.z);
  
  return (
    <mesh
      position={[(from.x + to.x) / 2, 0.3, (from.z + to.z) / 2]}
      rotation={[0, angle, 0]}
    >
      <boxGeometry args={[1.2, 0.2, length]} />
      <meshStandardMaterial color="#475569" />
      {/* Conveyor belt top */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1, 0.05, length]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
    </mesh>
  );
}

function MachineStation({ node, stage }) {
  if (!node || !node.pos) return null;

  // Create appropriate machine based on type
  const getMachineComponent = () => {
    const commonProps = {
      position: [node.pos[0], 0, node.pos[2]]
    };

    switch(node.type) {
      case 'feeder':
        return <FeederMachine {...commonProps} bottles={Array(5).fill({})} outputRate={0.5} />;
      case 'filler':
        return <FillerMachine {...commonProps} bottles={Array(3).fill({ progress: 0.8 })} fillingProgress={0.7} />;
      case 'capper':
        return <CapperMachine {...commonProps} bottles={Array(6).fill({ progress: 0.6 })} cappingProgress={0.5} />;
      case 'labeler':
        return <LabelerMachine {...commonProps} bottles={Array(4).fill({})} />;
      case 'packager':
      case 'packaging': // Support both for backwards compatibility
        return <PackagingMachine {...commonProps} bottles={Array(24).fill({})} packagingProgress={0.8} />;
      default:
        return null;
    }
  };

  return (
    <group>
      {getMachineComponent()}
      {/* Machine info panel */}
      <Html position={[node.pos[0], 15, node.pos[2]]} center>
        <div style={{
          background: 'rgba(15,23,42,0.95)',
          padding: '10px 15px',
          borderRadius: '10px',
          fontSize: '12px',
          color: 'white',
          border: `2px solid ${node.color || '#3b82f6'}`,
          minWidth: '150px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{node.name}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
            {node.type.toUpperCase()} STATION
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '10px',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span>⚡ {node.cycleTime}s</span>
            <span>📊 {node.speed || 12}/min</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function Factory3DView() {
  const { factoryLayout } = useSimulation();
  const [bottles, setBottles] = useState([]);
  const [simulationStatus, setSimulationStatus] = useState('idle'); // idle, running, paused, stopped
  const [simulationSpeed, setSimulationSpeed] = useState(1); // 0.5x, 1x, 2x
  const [productionMetrics, setProductionMetrics] = useState({
    totalBottles: 0,
    bottlesCompleted: 0,
    elapsedTime: 0
  });

  const sim = useMemo(
    () =>
      computeSimulationState(factoryLayout, {
        cellSize: 25,
        durationSeconds: 30,
      }),
    [factoryLayout]
  );

  // Get machine positions in order (feeder → filler → capper → labeler → packager)
  const machinePositions = useMemo(() => {
    if (!sim.nodes || sim.nodes.length === 0) return null;

    const positions = {};
    sim.nodes.forEach(node => {
      positions[node.type] = { x: node.pos[0], z: node.pos[2] };
    });

    return positions;
  }, [sim.nodes]);

  // Update metrics only when simulation is running
  useEffect(() => {
    if (simulationStatus !== 'running') return;

    const interval = setInterval(() => {
      setProductionMetrics(prev => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 0.1 * simulationSpeed
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [simulationStatus, simulationSpeed]);

  // Spawn bottles from feeder (only when running)
  useEffect(() => {
    if (!machinePositions || !machinePositions.feeder || simulationStatus !== 'running') return;

    const spawnInterval = 6000 / simulationSpeed; // Adjust spawn rate based on speed
    const interval = setInterval(() => {
      setBottles((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          stage: "moveToFill",
          mode: "move",
          progress: 0,
          speed: 0.8, // Movement speed (will be multiplied by simulationSpeed)
          waitTime: 0,
          fillLevel: 0,
          capProgress: 0,
          labelProgress: 0,
          packProgress: 0,
        },
      ]);
      setProductionMetrics(prev => ({ ...prev, totalBottles: prev.totalBottles + 1 }));
    }, spawnInterval);

    return () => clearInterval(interval);
  }, [machinePositions, simulationStatus, simulationSpeed]);

  // Handle bottle stage transitions
  const onBottleDone = (id) => {
    setBottles((prev) =>
      prev.flatMap((b) => {
        if (b.id !== id) return b;

        // Move to filler → WAIT & FILL
        if (b.stage === "moveToFill") {
          return {
            ...b,
            stage: "fill",
            mode: "wait",
            waitTime: 0,
            fillLevel: 0,
          };
        }

        // Filling done → move to capper
        if (b.stage === "fill") {
          return {
            ...b,
            stage: "moveToCap",
            mode: "move",
            progress: 0,
            fillLevel: 1,
          };
        }

        // Arrived at capper → WAIT & CAP
        if (b.stage === "moveToCap") {
          return {
            ...b,
            stage: "cap",
            mode: "wait",
            waitTime: 0,
            capProgress: 0,
          };
        }

        // Cap done → move to labeler
        if (b.stage === "cap") {
          return {
            ...b,
            stage: "moveToLabel",
            mode: "move",
            progress: 0,
            capProgress: 1,
          };
        }

        // Arrived at labeler → WAIT & LABEL
        if (b.stage === "moveToLabel") {
          return {
            ...b,
            stage: "label",
            mode: "wait",
            waitTime: 0,
            labelProgress: 0,
          };
        }

        // Label done → move to packager
        if (b.stage === "label") {
          return {
            ...b,
            stage: "moveToPack",
            mode: "move",
            progress: 0,
            labelProgress: 1,
          };
        }

        // Arrived at packager → WAIT & PACK
        if (b.stage === "moveToPack") {
          return {
            ...b,
            stage: "pack",
            mode: "wait",
            waitTime: 0,
            packProgress: 0,
          };
        }

        // Packed → remove from simulation
        if (b.stage === "pack") {
          setProductionMetrics(prev => ({ ...prev, bottlesCompleted: prev.bottlesCompleted + 1 }));
          return [];
        }

        return b;
      })
    );
  };

  // Simulation control handlers
  const handleStart = () => {
    setSimulationStatus('running');
  };

  const handlePause = () => {
    setSimulationStatus('paused');
  };

  const handleStop = () => {
    setSimulationStatus('stopped');
  };

  const handleReset = () => {
    setSimulationStatus('idle');
    setBottles([]);
    setProductionMetrics({
      totalBottles: 0,
      bottlesCompleted: 0,
      elapsedTime: 0
    });
  };

  if (!factoryLayout || factoryLayout.length === 0) {
    return (
      <div style={{ 
        width: "100%", 
        height: "100vh", 
        background: "linear-gradient(135deg, #071024 0%, #0b1220 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🏭</div>
          <h1 style={{ fontSize: 28, marginBottom: 10 }}>Bottle Production Line</h1>
          <p style={{ color: "#94a3b8", marginBottom: 30, maxWidth: 500 }}>
            Design your production line in the 2D Builder to see the complete bottle manufacturing process.
          </p>
          <button
            onClick={() => window.location.href = "/"}
            style={{
              padding: "14px 28px",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 16,
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)"
            }}
          >
            ← Design Production Line
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", background: "#071024", position: "relative" }}>
      {/* Control Panel */}
      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: 15,
        padding: 20,
        color: "white",
        zIndex: 100,
        border: "1px solid rgba(255,255,255,0.1)",
        width: 300,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)"
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 28, marginRight: 12 }}>🍾</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Bottle Production</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              {simulationStatus === 'running' ? '🟢 Running' : 
               simulationStatus === 'paused' ? '🟡 Paused' : 
               simulationStatus === 'stopped' ? '🔴 Stopped' : '⚪ Idle'}
            </div>
          </div>
        </div>

        {/* Simulation Controls */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Simulation Controls</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {simulationStatus === 'running' ? (
              <button
                onClick={handlePause}
                style={{
                  padding: "10px",
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ⏸ Pause
              </button>
            ) : (
              <button
                onClick={handleStart}
                style={{
                  padding: "10px",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ▶ Start
              </button>
            )}
            <button
              onClick={handleStop}
              style={{
                padding: "10px",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ⏹ Stop
            </button>
          </div>
          <button
            onClick={handleReset}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              fontSize: 12,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            🔄 Reset
          </button>
        </div>

        {/* Speed Control */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Simulation Speed</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[0.5, 1, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: simulationSpeed === speed 
                    ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" 
                    : "rgba(255,255,255,0.05)",
                  color: "white",
                  border: simulationSpeed === speed 
                    ? "2px solid #60a5fa" 
                    : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Production Stats</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Stations</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{sim.nodes.length}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Bottles/min</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {simulationStatus === 'running' ? Math.floor(sim.throughputPerSec * 60 * simulationSpeed) : 0}
              </div>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 8, marginTop: 10 }}>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Bottles Produced</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{productionMetrics.bottlesCompleted}</div>
          </div>
          {simulationStatus === 'running' && (
            <div style={{ background: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 8, marginTop: 10 }}>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Time Elapsed</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{productionMetrics.elapsedTime.toFixed(1)}s</div>
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Production Stages</div>
          <div style={{ fontSize: 11, color: "white", lineHeight: 1.8 }}>
            <div>1. <span style={{ color: "#3b82f6" }}>Feeder</span> → Empty bottles</div>
            <div>2. <span style={{ color: "#10b981" }}>Filler</span> → Fill with product</div>
            <div>3. <span style={{ color: "#f59e0b" }}>Capper</span> → Apply caps</div>
            <div>4. <span style={{ color: "#8b5cf6" }}>Labeler</span> → Apply labels</div>
            <div>5. <span style={{ color: "#ec4899" }}>Packager</span> → Package bottles</div>
          </div>
        </div>
        
        <button
          onClick={() => window.location.href = "/"}
          style={{
            width: "100%",
            padding: 12,
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            cursor: "pointer",
            fontWeight: 600,
            marginTop: 10
          }}
        >
          ← Modify Production Line
        </button>
      </div>

      <Canvas
        shadows
        camera={{
          position: [150, 100, 150],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[100, 200, 100]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-50, 100, -50]} intensity={0.5} color="#3b82f6" />
        <pointLight position={[50, 100, 50]} intensity={0.5} color="#10b981" />

        <OrbitControls 
          enablePan 
          enableZoom 
          enableRotate 
          maxPolarAngle={Math.PI / 2}
          minDistance={20}
          maxDistance={400}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Factory floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[400, 400]} />
          <meshStandardMaterial color="#0f1628" roughness={0.8} />
        </mesh>

        {/* Production line grid */}
        <primitive 
          object={new THREE.GridHelper(400, 40, '#1e293b', '#0f172a')} 
          position={[0, 0.1, 0]} 
        />

        {/* Conveyor segments between machines */}
        {machinePositions && sim.nodes.length >= 2 && (
          <>
            {machinePositions.feeder && machinePositions.filler && (
              <ConveyorSegment
                from={machinePositions.feeder}
                to={machinePositions.filler}
              />
            )}
            {machinePositions.filler && machinePositions.capper && (
              <ConveyorSegment
                from={machinePositions.filler}
                to={machinePositions.capper}
              />
            )}
            {machinePositions.capper && machinePositions.labeler && (
              <ConveyorSegment
                from={machinePositions.capper}
                to={machinePositions.labeler}
              />
            )}
            {machinePositions.labeler && machinePositions.packager && (
              <ConveyorSegment
                from={machinePositions.labeler}
                to={machinePositions.packager}
              />
            )}
          </>
        )}

        {/* Machine stations */}
        {sim.nodes.map((node) => (
          <MachineStation key={node.id} node={node} />
        ))}

        {/* Animated bottles */}
        {machinePositions &&
          bottles.map((bottle) => {
            const isPaused = simulationStatus === 'paused' || simulationStatus === 'stopped' || simulationStatus === 'idle';
            // Determine which segment the bottle is on
            if (bottle.stage === "moveToFill" || bottle.stage === "fill") {
              if (!machinePositions.feeder || !machinePositions.filler) return null;
              return (
                <AnimatedBottle
                  key={bottle.id}
                  bottle={bottle}
                  from={{ x: machinePositions.feeder.x, z: machinePositions.feeder.z }}
                  to={{ x: machinePositions.filler.x, z: machinePositions.filler.z }}
                  onDone={onBottleDone}
                  speedMultiplier={simulationSpeed}
                  isPaused={isPaused}
                />
              );
            }

            if (bottle.stage === "moveToCap" || bottle.stage === "cap") {
              if (!machinePositions.filler || !machinePositions.capper) return null;
              return (
                <AnimatedBottle
                  key={bottle.id}
                  bottle={bottle}
                  from={{ x: machinePositions.filler.x, z: machinePositions.filler.z }}
                  to={{ x: machinePositions.capper.x, z: machinePositions.capper.z }}
                  onDone={onBottleDone}
                  speedMultiplier={simulationSpeed}
                  isPaused={isPaused}
                />
              );
            }

            if (bottle.stage === "moveToLabel" || bottle.stage === "label") {
              if (!machinePositions.capper || !machinePositions.labeler) return null;
              return (
                <AnimatedBottle
                  key={bottle.id}
                  bottle={bottle}
                  from={{ x: machinePositions.capper.x, z: machinePositions.capper.z }}
                  to={{ x: machinePositions.labeler.x, z: machinePositions.labeler.z }}
                  onDone={onBottleDone}
                  speedMultiplier={simulationSpeed}
                  isPaused={isPaused}
                />
              );
            }

            if (bottle.stage === "moveToPack" || bottle.stage === "pack") {
              if (!machinePositions.labeler || !machinePositions.packager) return null;
              return (
                <AnimatedBottle
                  key={bottle.id}
                  bottle={bottle}
                  from={{ x: machinePositions.labeler.x, z: machinePositions.labeler.z }}
                  to={{ x: machinePositions.packager.x, z: machinePositions.packager.z }}
                  onDone={onBottleDone}
                  speedMultiplier={simulationSpeed}
                  isPaused={isPaused}
                />
              );
            }

            return null;
          })}
      </Canvas>

      {/* Production Stage Indicators */}
      <div style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: 12,
        padding: "16px 24px",
        color: "white",
        zIndex: 100,
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        gap: 24,
        fontSize: 14
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#3b82f6" }}></div>
          <span>Feeder</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }}></div>
          <span>Filler</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }}></div>
          <span>Capper</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#8b5cf6" }}></div>
          <span>Labeler</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ec4899" }}></div>
          <span>Packager</span>
        </div>
      </div>

      {/* Bottle Status Legend */}
      <div style={{
        position: "absolute",
        top: 20,
        right: 20,
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: 12,
        padding: 16,
        color: "white",
        zIndex: 100,
        border: "1px solid rgba(255,255,255,0.1)",
        width: 200,
        fontSize: 12
      }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Bottle Status</div>
        <div style={{ color: "#94a3b8", lineHeight: 1.8 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <div style={{ width: 8, height: 16, background: "#d1d5db", marginRight: 8, borderRadius: 2 }}></div>
            <span>Empty</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <div style={{ width: 8, height: 16, background: "#3b82f6", marginRight: 8, borderRadius: 2 }}></div>
            <span>Filled</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <div style={{ width: 8, height: 16, background: "#fbbf24", marginRight: 8, borderRadius: 2 }}></div>
            <span>Capped</span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 8, height: 16, background: "#ef4444", marginRight: 8, borderRadius: 2 }}></div>
            <span>Labeled</span>
          </div>
        </div>
      </div>

      {/* Industry 4.0 Panel */}
      <I40Panel />
    </div>
  );
}