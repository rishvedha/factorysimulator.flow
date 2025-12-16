import React, { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Bottle from "./Bottle";

function PackagingMachine({ position, bottles = [], packagingProgress = 0 }) {
  const [armAnimation, setArmAnimation] = useState(0);

  useFrame((state) => {
    setArmAnimation(Math.sin(state.clock.elapsedTime * 2) * 0.5);
  });

  return (
    <group position={position}>
      {/* Packaging chamber */}
      <mesh castShadow position={[0, 8, 0]}>
        <boxGeometry args={[18, 16, 14]} />
        <meshStandardMaterial
          color="#ec4899"
          metalness={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Robotic arm */}
      <group position={[0, 12, 0]}>
        <mesh position={[0, -4, 0]}>
          <boxGeometry args={[2, 8, 2]} />
          <meshStandardMaterial color="#db2777" />
        </mesh>
        <mesh position={[0, -8, 0]} rotation={[armAnimation, 0, 0]}>
          <boxGeometry args={[2, 6, 2]} />
          <meshStandardMaterial color="#be185d" />
        </mesh>
        {/* Gripper */}
        <mesh position={[0, -11, 0]}>
          <boxGeometry args={[4, 1, 4]} />
          <meshStandardMaterial color="#9d174d" metalness={0.8} />
        </mesh>
      </group>

      {/* Packaging material roll */}
      <mesh position={[10, 4, 0]}>
        <cylinderGeometry args={[4, 4, 8, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Packaged bottles */}
      <group position={[-6, 2, 0]}>
        {/* 4x6 bottle pack */}
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3, 4, 5].map((col) => (
            <Bottle
              key={`${row}-${col}`}
              position={[col * 1.5, row * 1.8, 0]}
              stage="packaged"
              size={0.6}
            />
          ))
        )}
        {/* Shrink wrap */}
        <mesh position={[4.5, 3, 0]} scale={[1, packagingProgress, 1]}>
          <boxGeometry args={[10, 8, 2]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      </group>
    </group>
  );
}

export default PackagingMachine;