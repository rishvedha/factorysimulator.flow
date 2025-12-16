import React, { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Bottle from "./Bottle";

function FeederMachine({ position, bottles = [], outputRate = 1 }) {
  const [rotation, setRotation] = useState(0);

  useFrame((state) => {
    setRotation(state.clock.elapsedTime * outputRate);
  });

  return (
    <group position={position}>
      {/* Feeder hopper */}
      <mesh castShadow position={[0, 8, 0]}>
        <cylinderGeometry args={[8, 5, 12, 16]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.4} />
      </mesh>

      {/* Rotary feeder */}
      <mesh position={[0, 2, 0]} rotation={[0, rotation, 0]}>
        <cylinderGeometry args={[6, 6, 1, 8]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* Bottle queue */}
      {bottles.map((_, i) => (
        <Bottle
          key={i}
          position={[Math.cos(i * 0.5) * 3, i * 1.5, Math.sin(i * 0.5) * 3]}
          stage="empty"
          size={0.8}
        />
      ))}

      {/* Conveyor exit */}
      <mesh position={[0, 0.5, 8]}>
        <boxGeometry args={[12, 1, 6]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

export default FeederMachine;