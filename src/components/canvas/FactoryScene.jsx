import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Text } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

function ConveyorBelt({ speed }) {
  const beltRef = useRef();
  const textureRef = useRef();
  
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Dark grey base
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, 512, 128);
    
    // Belt ribs (dark grey stripes)
    ctx.fillStyle = '#4b5563';
    for (let i = 0; i < 512; i += 32) {
      ctx.fillRect(i, 0, 16, 128);
    }
    
    // Safety stripe (yellow - REMOVED the small balls)
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(0, 60, 512, 8);
    
    // Safety stripe border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 60, 512, 8);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.set(4, 1);
    textureRef.current = texture;
  }, []);

  useFrame((state) => {
    if (beltRef.current && textureRef.current) {
      textureRef.current.offset.x = (state.clock.elapsedTime * speed * 0.3) % 1;
    }
  });

  return (
    <group>
      <mesh ref={beltRef} position={[0, 0.15, 0]}>
        <boxGeometry args={[12, 0.2, 1.5]} />
        <meshStandardMaterial 
          map={textureRef.current}
          color="#374151"
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}

function Bottle({ position, index, defective, speed, vibration }) {
  const bottleRef = useRef();
  const capRef = useRef();
  const labelRef = useRef();
  const [rotationSpeed] = useState(0.3 + Math.random() * 0.4);
  const offset = useRef(Math.random() * 15); // Increased random offset
  const startTime = useRef(0);
  
  useFrame((state) => {
    if (!startTime.current) {
      startTime.current = state.clock.elapsedTime;
    }
    
    if (bottleRef.current) {
      const time = state.clock.elapsedTime - startTime.current;
      
      // Calculate position based on time and speed with slower movement
      let newX = position.x + (time * speed * 2.0) + offset.current;
      
      // Infinite loop: when bottle goes past right end, reset to left
      const conveyorLength = 20;
      const halfLength = conveyorLength / 2;
      
      if (newX > halfLength) {
        newX = -halfLength - (Math.random() * 3);
        offset.current = newX - (time * speed * 0.05) - position.x;
        startTime.current = state.clock.elapsedTime;
      }
      
      bottleRef.current.position.x = newX;
      
      // Gentle floating animation (reduced)
      bottleRef.current.position.y = 0.4 + Math.sin(time * 2 + index) * 0.01;
      
      // Slower rotation animation
      bottleRef.current.rotation.y += 0.005 * rotationSpeed;
      
      // Vibration effect
      if (vibration > 4) {
        bottleRef.current.rotation.z = Math.sin(time * 8 + index) * 0.01;
      }
      
      // Cap and label follow bottle
      if (capRef.current) {
        capRef.current.position.x = newX;
        capRef.current.position.y = 0.35 + Math.sin(time * 2 + index) * 0.01;
      }
      if (labelRef.current) {
        labelRef.current.position.x = newX;
        labelRef.current.position.y = 0.15 + Math.sin(time * 2 + index) * 0.01;
      }
    }
  });

  const bottleColor = defective ? "#ef4444" : "#60a5fa";
  
  return (
    <group>
      <mesh ref={bottleRef} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.6, 16]} />
        <meshPhysicalMaterial 
          color={bottleColor}
          transparent
          opacity={0.9}
          transmission={0.3}
          thickness={0.5}
          roughness={0.1}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0}
        />
      </mesh>
      
      <mesh ref={capRef}>
        <cylinderGeometry args={[0.16, 0.16, 0.08, 8]} />
        <meshStandardMaterial 
          color={defective ? "#991b1b" : "#1d4ed8"} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      <mesh ref={labelRef}>
        <boxGeometry args={[0.25, 0.3, 0.02]} />
        <meshStandardMaterial 
          color={defective ? "#dc2626" : "#3b82f6"} 
        />
      </mesh>
      
      {defective && (
        <mesh>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial 
            color="#ef4444" 
            emissive="#ef4444" 
            emissiveIntensity={0.5} 
          />
        </mesh>
      )}
    </group>
  );
}

function Bottles({ speed, defectRate, sensor }) {
  // Fewer bottles with more spacing
  const bottleCount = 30; // Reduced from 30 to 15
  const [bottles, setBottles] = useState([]);
  
  useEffect(() => {
    const conveyorLength = 12;
    const bottleSpacing = conveyorLength / bottleCount * 2; // Doubled spacing
    
    const initialBottles = Array.from({ length: bottleCount }, (_, i) => ({
      id: i,
      x: -6 + (i * bottleSpacing) + (Math.random() * 0.3 - 0.15), // Random slight offset
      defective: Math.random() * 100 < defectRate
    }));
    setBottles(initialBottles);
  }, [defectRate]);
  
  // Update defect status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setBottles(prev => prev.map(bottle => ({
        ...bottle,
        defective: Math.random() * 100 < defectRate
      })));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [defectRate]);

  return (
    <group>
      {bottles.map((bottle) => (
        <Bottle
          key={bottle.id}
          position={{ x: bottle.x }}
          index={bottle.id}
          defective={bottle.defective}
          speed={speed}
          vibration={sensor.vibration}
        />
      ))}
    </group>
  );
}

function InjectionMoldingMachine({ sensor, upgrades }) {
  const machineRef = useRef();
  const pistonRef = useRef();
  const hopperRef = useRef();
  const [pistonPosition, setPistonPosition] = useState(0);
  
  useFrame((state) => {
    if (machineRef.current && pistonRef.current) {
      const time = state.clock.elapsedTime;
      
      // Machine base subtle vibration
      machineRef.current.position.y = 1 + Math.sin(time * 0.5) * 0.01;
      
      // Piston animation
      const pistonCycle = Math.sin(time * 3);
      setPistonPosition(pistonCycle);
      pistonRef.current.position.z = pistonCycle * 0.3;
      
      // Hopper rotation
      if (hopperRef.current) {
        hopperRef.current.rotation.y += 0.005;
      }
    }
  });

  const statusColor = sensor.temperature > 55 ? "#ef4444" : 
                     sensor.temperature > 50 ? "#f59e0b" : 
                     upgrades.ai ? "#10b981" : "#3b82f6";
  
  return (
    <group ref={machineRef} position={[0, 1, -4]}>
      {/* Machine Base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 2, 2]} />
        <meshStandardMaterial 
          color="#1f2937"
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>
      
      {/* Machine Front Panel */}
      <mesh position={[0, 0.5, 1.1]}>
        <boxGeometry args={[2.8, 1.5, 0.1]} />
        <meshStandardMaterial 
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Control Panel */}
      <mesh position={[1, 1.5, 1.1]}>
        <boxGeometry args={[0.8, 0.4, 0.12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      
      {/* Control Panel Screen */}
      <mesh position={[1, 1.5, 1.16]}>
        <boxGeometry args={[0.6, 0.2, 0.01]} />
        <meshStandardMaterial 
          color="#0ea5e9"
          emissive="#0ea5e9"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Injection Unit */}
      <group position={[0, 1.5, 0]}>
        {/* Barrel */}
        <mesh position={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.4, 0.4, 1.5, 16]} />
          <meshStandardMaterial color="#4b5563" metalness={0.7} />
        </mesh>
        
        {/* Piston */}
        <mesh ref={pistonRef} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.8, 12]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.8} />
        </mesh>
        
        {/* Nozzle */}
        <mesh position={[0, 0, -1.4]}>
          <cylinderGeometry args={[0.2, 0.1, 0.3, 8]} />
          <meshStandardMaterial color="#6b7280" metalness={0.9} />
        </mesh>
      </group>
      
      {/* Hopper */}
      <mesh ref={hopperRef} position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 0.8, 8]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      
      {/* Status Light */}
      <group position={[-1, 1.8, 1.1]}>
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial 
            color={statusColor}
            emissive={statusColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>
    </group>
  );
}

function FactoryLights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* Ceiling Lights */}
      {[-4, -1, 2, 5].map((x) => (
        <group key={x} position={[x, 6, 0]}>
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial 
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={1.5}
            />
          </mesh>
          <pointLight
            position={[0, -1, 0]}
            intensity={0.8}
            distance={12}
            color="#fbbf24"
          />
        </group>
      ))}
    </>
  );
}

export default function FactoryScene({ speed, defectRate, sensor, upgrades }) {
  // Map production rate to visual speed
  const visualSpeed = Math.max(0.04, speed / 100); // Slower speed
  
  return (
    <div className="canvas-area">
      <Canvas
        shadows
        camera={{ position: [14, 8, 14], fov: 50 }}
      >
        <color attach="background" args={["#0f172a"]} />
        
        <FactoryLights />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
        
        <Environment preset="warehouse" />
        
        {/* Grid Floor */}
        <gridHelper args={[20, 20, "#334155", "#1e293b"]} />
        
        {/* Factory Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial 
            color="#1e293b"
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
        
        {/* Production Line Components */}
        <ConveyorBelt speed={visualSpeed} />
        <Bottles speed={visualSpeed} defectRate={defectRate} sensor={sensor} />
        <InjectionMoldingMachine sensor={sensor} upgrades={upgrades} />
        
        {/* Quality Inspection Station */}
        <group position={[4, 0.5, -2]}>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[0.8, 0.2, 0.8]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 4, 0, 0]}>
            <coneGeometry args={[0.2, 0.4, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
          </mesh>
        </group>
        
        {/* Factory Sign */}
        <Float speed={2} rotationIntensity={0.5}>
          <Text
            position={[0, 5, -9.5]}
            fontSize={0.8}
            color="#3b82f6"
            outlineWidth={0.02}
            outlineColor="#0ea5e9"
          >
            SMART FACTORY SIMULATOR
          </Text>
        </Float>
        
        <fog attach="fog" args={["#0f172a", 10, 25]} />
      </Canvas>
    </div>
  );
}