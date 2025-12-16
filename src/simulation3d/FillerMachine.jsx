import React, { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Bottle from "./Bottle";

function FillerMachine({ position, bottles = [], fillingProgress = 0 }) {
  const [nozzleHeight, setNozzleHeight] = useState(0);

  useFrame((state) => {
    setNozzleHeight(Math.sin(state.clock.elapsedTime * 2) * 0.5);
  });

  return (
    <group position={position}>
      {/* Main tank */}
      <mesh castShadow position={[0, 10, 0]}>
        <cylinderGeometry args={[6, 5, 15, 16]} />
        <meshStandardMaterial
          color="#10b981"
          metalness={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Liquid in tank */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[5.8, 4.8, 15, 16]} />
        <meshStandardMaterial color="#059669" transparent opacity={0.6} />
      </mesh>

      {/* Filling nozzles */}
      {[-3, 0, 3].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 5 + nozzleHeight, 0]}>
            <cylinderGeometry args={[0.3, 0.1, 3, 8]} />
            <meshStandardMaterial color="#064e3b" />
          </mesh>
          {/* Liquid stream */}
          <mesh position={[x, 3, 0]} scale={[1, fillingProgress, 1]}>
            <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
            <meshStandardMaterial
              color="#10b981"
              transparent
              opacity={0.7}
              emissive="#10b981"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      ))}

      {/* Filling station bottles */}
      {bottles.map((bottle, i) => (
        <Bottle
          key={i}
          position={[-3 + i * 3, 1, 0]}
          stage="filled"
          size={0.8}
          progress={bottle.progress || 0}
        />
      ))}
    </group>
  );
}

export default FillerMachine;