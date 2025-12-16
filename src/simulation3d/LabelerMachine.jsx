import React, { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Bottle from "./Bottle";

function LabelerMachine({ position, bottles = [] }) {
  const [labelRollRotation, setLabelRollRotation] = useState(0);

  useFrame((state) => {
    setLabelRollRotation(state.clock.elapsedTime * 2);
  });

  return (
    <group position={position}>
      {/* Main labeling unit */}
      <mesh castShadow position={[0, 6, 0]}>
        <boxGeometry args={[14, 12, 10]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.3} />
      </mesh>

      {/* Label roll */}
      <mesh position={[-7, 6, 0]} rotation={[0, 0, labelRollRotation]}>
        <cylinderGeometry args={[3, 3, 8, 16]} />
        <meshStandardMaterial color="#7c3aed" />
      </mesh>

      {/* Application roller */}
      <mesh position={[7, 4, 0]}>
        <cylinderGeometry args={[2, 2, 10, 16]} />
        <meshStandardMaterial color="#5b21b6" metalness={0.7} />
      </mesh>

      {/* Label path */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[14, 0.1, 2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Bottles being labeled */}
      {bottles.map((bottle, i) => (
        <Bottle
          key={i}
          position={[-5 + i * 2.5, 1, 0]}
          stage="labeled"
          size={0.8}
        />
      ))}
    </group>
  );
}

export default LabelerMachine;