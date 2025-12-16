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
import Bottle from "./Bottle";

function ConveyorSystem({ nodes, bottles = [] }) {
  if (!nodes || nodes.length < 2) return null;

// Create conveyor belt path
  const curvePoints = nodes.map(node => 
    new THREE.Vector3(node.pos[0], 0.5, node.pos[2])
  );
  
  const curve = new THREE.CatmullRomCurve3(curvePoints);
  
  return (
    <group>
      {/* Conveyor belt */}
      <mesh>
        <tubeGeometry args={[curve, 100, 1, 8, false]} />
        <meshStandardMaterial color="#475569" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Conveyor belt texture (moving) */}
      <mesh position={[0, 0.6, 0]}>
        <tubeGeometry args={[curve, 200, 0.8, 8, false]} />
        <meshStandardMaterial color="#94a3b8" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Conveyor supports */}
      {curvePoints.map((point, i) => (
        <mesh key={i} position={[point.x, 0, point.z]}>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}
      
      {/* Bottles on conveyor */}
      {bottles.map((bottle, i) => {
        if (!bottle.position) return null;
        const progress = bottle.progress || 0;
        const segmentIndex = Math.floor(progress * (curvePoints.length - 1));
        const segmentProgress = progress * (curvePoints.length - 1) - segmentIndex;
        
        if (segmentIndex >= curvePoints.length - 1) return null;
        
        const start = curvePoints[segmentIndex];
        const end = curvePoints[segmentIndex + 1];
        
        const x = THREE.MathUtils.lerp(start.x, end.x, segmentProgress);
        const z = THREE.MathUtils.lerp(start.z, end.z, segmentProgress);
        
        return (
          <Bottle
            key={i}
            position={[x, 1.5, z]}
            stage={bottle.stage || 'empty'}
            size={0.7}
            progress={bottle.fillProgress || 0}
          />
        );
      })}
    </group>
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
      case 'packaging':
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
  const [simulationTime, setSimulationTime] = useState(0);
  const [bottlesOnLine, setBottlesOnLine] = useState([]);

  const sim = useMemo(
    () =>
      computeSimulationState(factoryLayout, {
        cellSize: 25,
        durationSeconds: 30,
      }),
    [factoryLayout]
  );

  // Generate bottles on conveyor
  useEffect(() => {
    if (sim.nodes.length === 0) return;

    const bottles = [];
    const stages = ['empty', 'filled', 'capped', 'labeled', 'packaged'];
    
    // Create bottles at different positions
    for (let i = 0; i < 20; i++) {
      const progress = (i / 20) * 0.8; // 80% of line filled
      const stageIndex = Math.min(Math.floor(progress * stages.length), stages.length - 1);
      
      bottles.push({
        id: `bottle-${i}`,
        position: [0, 1.5, 0],
        stage: stages[stageIndex],
        progress: progress,
        fillProgress: Math.min(progress * 1.5, 1)
      });
    }
    
    setBottlesOnLine(bottles);
    
    // Update simulation time
    const interval = setInterval(() => {
      setSimulationTime(prev => prev + 0.1);
    }, 100);
    
    return () => clearInterval(interval);
  }, [sim.nodes.length]);

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
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Real-time Simulation</div>
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
              <div style={{ fontSize: 18, fontWeight: 700 }}>{Math.floor(sim.throughputPerSec * 60)}</div>
            </div>
          </div>
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

        {/* Conveyor system */}
        <ConveyorSystem nodes={sim.nodes} bottles={bottlesOnLine} />

        {/* Machine stations */}
        {sim.nodes.map((node) => (
          <MachineStation key={node.id} node={node} />
        ))}

        {/* Animated items from simulation */}
        {sim.items.map((item) => (
          <Bottle
            key={item.id}
            position={[item.spawnTime * 10, 1.5, 0]}
            stage="empty"
            size={0.7}
          />
        ))}
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
    </div>
  );
}