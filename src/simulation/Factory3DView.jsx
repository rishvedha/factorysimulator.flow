// src/simulation/Factory3DView.jsx
import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useSimulation } from "../context/SimulationContext";
import { computeSimulationState } from "../logic/simulationEngine";

// Machine models component
function MachineModel({ node, hovered }) {
  const getMachineModel = () => {
    switch(node.type) {
      case 'filler':
        return (
          <group>
            <mesh castShadow position={[0, 6, 0]}>
              <cylinderGeometry args={[6, 4, 10, 16]} />
              <meshStandardMaterial color="#10b981" metalness={0.4} roughness={0.3} />
            </mesh>
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[14, 4, 12]} />
              <meshStandardMaterial color="#065f46" />
            </mesh>
          </group>
        );
      
      case 'capper':
        return (
          <group>
            <mesh castShadow position={[0, 1, 0]}>
              <cylinderGeometry args={[8, 8, 2, 32]} />
              <meshStandardMaterial color="#d97706" />
            </mesh>
            <mesh castShadow position={[0, 8, 0]}>
              <boxGeometry args={[12, 2, 12]} />
              <meshStandardMaterial color="#b45309" />
            </mesh>
          </group>
        );
      
      case 'labeler':
        return (
          <group>
            <mesh castShadow position={[0, 5, 0]}>
              <boxGeometry args={[14, 10, 10]} />
              <meshStandardMaterial color="#8b5cf6" />
            </mesh>
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[18, 2, 8]} />
              <meshStandardMaterial color="#5b21b6" />
            </mesh>
          </group>
        );
      
      case 'packaging':
        return (
          <group>
            <mesh castShadow position={[0, 6, 0]}>
              <boxGeometry args={[16, 12, 12]} />
              <meshStandardMaterial color="#ec4899" />
            </mesh>
            <mesh castShadow position={[0, -2, 0]}>
              <boxGeometry args={[20, 4, 16]} />
              <meshStandardMaterial color="#831843" />
            </mesh>
          </group>
        );
      
      case 'feeder':
      default:
        return (
          <group>
            <mesh castShadow position={[0, 8, 0]}>
              <cylinderGeometry args={[7, 4, 10, 16]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[14, 4, 14]} />
              <meshStandardMaterial color="#1e40af" />
            </mesh>
          </group>
        );
    }
  };

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      {getMachineModel()}
      {hovered && <Sparkles count={10} scale={12} size={1} />}
    </Float>
  );
}

function Machine3D({ node }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 6 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  if (!node || !node.pos) return null;

  return (
    <group 
      ref={meshRef}
      position={[node.pos[0], 0, node.pos[2]]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <MachineModel node={node} hovered={hovered} />
      
      <Html position={[0, 16, 0]} center>
        <div style={{
          background: 'rgba(15,23,42,0.9)',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'white',
          border: `1px solid ${node.color || '#3b82f6'}`,
          minWidth: '120px',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: '600' }}>{node.name}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
            {node.cycleTime}s • {node.speed || 12}/min
          </div>
        </div>
      </Html>
    </group>
  );
}

function ProductItem({ item, nodes, startTimeRef }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current || !nodes || nodes.length === 0) return;
    
    const t = state.clock.getElapsedTime() - startTimeRef.current;
    const age = t - item.spawnTime;
    
    if (age < 0 || age > item.timePerItem) {
      meshRef.current.visible = false;
      return;
    }
    
    meshRef.current.visible = true;
    const prog = Math.min(1, age / item.timePerItem);
    const totalSeg = nodes.length - 1;
    const segPos = prog * totalSeg;
    const seg = Math.min(totalSeg - 1, Math.floor(segPos));
    const localT = segPos - seg;

    const a = nodes[seg]?.pos || [0, 0, 0];
    const b = nodes[seg + 1]?.pos || [0, 0, 0];

    const x = THREE.MathUtils.lerp(a[0], b[0], localT);
    const z = THREE.MathUtils.lerp(a[2], b[2], localT);
    const y = 8 + Math.sin(localT * Math.PI) * 3;

    meshRef.current.position.set(x, y, z);
    meshRef.current.rotation.x += 0.02;
    meshRef.current.rotation.y += 0.03;
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[1.5, 16, 16]} />
      <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
    </mesh>
  );
}

export default function Factory3DView() {
  const { factoryLayout } = useSimulation();
  const [controlsVisible, setControlsVisible] = useState(true);

  const sim = useMemo(
    () =>
      computeSimulationState(factoryLayout, {
        cellSize: 20,
        durationSeconds: 10,
      }),
    [factoryLayout]
  );

  const startTimeRef = useRef(0);
  if (!startTimeRef.current) startTimeRef.current = 0;

  if (!factoryLayout || factoryLayout.length === 0) {
    return (
      <div style={{ 
        width: "100%", 
        height: "100vh", 
        background: "#071024",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏭</div>
          <h2 style={{ marginBottom: 8 }}>Factory Layout Required</h2>
          <p style={{ color: "#94a3b8", marginBottom: 24, maxWidth: 400 }}>
            Design your factory layout in the 2D Builder to see it in 3D.
          </p>
          <button
            onClick={() => window.location.href = "/"}
            style={{
              padding: "12px 24px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            ← Go to 2D Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", background: "#071024", position: "relative" }}>
      {/* Simple Control Panel */}
      {controlsVisible && (
        <div style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "10px",
          borderRadius: 6,
          fontSize: "12px",
          zIndex: 100,
          minWidth: "200px"
        }}>
          <div style={{ fontWeight: "bold", marginBottom: 5 }}>3D Factory Viewer</div>
          <div style={{ marginBottom: 8 }}>Machines: {sim.nodes.length}</div>
          <div style={{ marginBottom: 8 }}>Throughput: {sim.throughputPerSec.toFixed(2)}/s</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => setControlsVisible(false)}
              style={{
                padding: "4px 8px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: 4,
                fontSize: "11px",
                cursor: "pointer"
              }}
            >
              Hide Panel
            </button>
            <button
              onClick={() => window.location.href = "/"}
              style={{
                padding: "4px 8px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: 4,
                fontSize: "11px",
                cursor: "pointer"
              }}
            >
              ← Builder
            </button>
          </div>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>
            Drag to rotate • Scroll to zoom
          </div>
        </div>
      )}

      {/* Show controls button when hidden */}
      {!controlsVisible && (
        <button
          onClick={() => setControlsVisible(true)}
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            padding: "6px 12px",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: "12px",
            zIndex: 100,
            cursor: "pointer"
          }}
        >
          Show Controls
        </button>
      )}

      <Canvas
        camera={{
          position: [120, 120, 120],
          fov: 40,
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[50, 100, 50]} intensity={1} castShadow />
        <pointLight position={[-50, 50, -50]} intensity={0.3} />

        <OrbitControls enablePan enableZoom enableRotate />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[300, 300]} />
          <meshStandardMaterial color="#0f1628" />
        </mesh>

        {/* Grid lines - Using THREE.GridHelper directly */}
        <primitive 
          object={new THREE.GridHelper(300, 15, '#3b82f6', '#1e293b')} 
          position={[0, 0.1, 0]} 
        />

        {/* Machines */}
        {sim.nodes.map((node) => (
          <Machine3D node={node} key={node.id} />
        ))}

        {/* Product items */}
        {sim.items.map((item) => (
          <ProductItem 
            key={item.id}
            item={item}
            nodes={sim.nodes}
            startTimeRef={startTimeRef}
          />
        ))}
      </Canvas>

      {/* Legend */}
      <div style={{
        position: "absolute",
        bottom: 10,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "8px 16px",
        borderRadius: 6,
        fontSize: "12px",
        zIndex: 100,
        display: "flex",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, background: "#3b82f6", borderRadius: 2 }}></div>
          <span>Feeder</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, background: "#10b981", borderRadius: 2 }}></div>
          <span>Filler</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, background: "#f59e0b", borderRadius: 2 }}></div>
          <span>Capper</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, background: "#8b5cf6", borderRadius: 2 }}></div>
          <span>Labeler</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, background: "#ec4899", borderRadius: 2 }}></div>
          <span>Packager</span>
        </div>
      </div>
    </div>
  );
}