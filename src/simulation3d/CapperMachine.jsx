import React, { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Bottle from "./Bottle";

function CapperMachine({ position, bottles = [], cappingProgress = 0 }) {
  const [armRotation, setArmRotation] = useState(0);

  useFrame((state) => {
    setArmRotation(Math.sin(state.clock.elapsedTime * 3) * 0.3);
  });

  return (
    <group position={position}>
      {/* Turntable */}
      <mesh castShadow position={[0, 1, 0]} rotation={[0, cappingProgress * Math.PI * 2, 0]}>
        <cylinderGeometry args={[8, 8, 2, 32]} />
        <meshStandardMaterial color="#d97706" metalness={0.5} />
      </mesh>

      {/* Capping arms */}
      {[0, 120, 240].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 6;
        const z = Math.sin(rad) * 6;

        return (
          <group key={i} position={[x, 6, z]}>
            <mesh rotation={[armRotation, 0, 0]}>
              <boxGeometry args={[0.5, 4, 0.5]} />
              <meshStandardMaterial color="#f59e0b" />
            </mesh>
            {/* Capping head */}
            <mesh position={[0, -2, 0]}>
              <cylinderGeometry args={[1, 0.5, 2, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} />
            </mesh>
          </group>
        );
      })}

      {/* Cap feeder */}
      <mesh position={[8, 4, 0]}>
        <cylinderGeometry args={[3, 3, 6, 16]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>

      {/* Bottles on turntable */}
      {bottles.map((bottle, i) => {
        const angle = (i * 60 * Math.PI) / 180;
        const x = Math.cos(angle) * 4;
        const z = Math.sin(angle) * 4;

        return (
          <Bottle
            key={i}
            position={[x, 2, z]}
            stage="capped"
            size={0.8}
            progress={bottle.progress || 0}
          />
        );
      })}
    </group>
  );
}

export default CapperMachine;