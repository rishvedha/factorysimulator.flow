import React, { useRef } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

// Bottle Model Component
function Bottle({ position, stage = 'empty', size = 1, progress = 0 }) {
  const meshRef = useRef();

  // Different bottle states
  const getBottleState = () => {
    const height = 3 * size;
    const radius = 0.8 * size;

    switch(stage) {
      case 'filled':
        return (
          <group>
            {/* Bottle body - filled */}
            <mesh castShadow position={[0, height/2, 0]}>
              <cylinderGeometry args={[radius, radius * 0.9, height, 16]} />
              <meshStandardMaterial
                color="#3b82f6"
                transparent
                opacity={0.7}
                emissive="#3b82f6"
                emissiveIntensity={0.1}
              />
            </mesh>
            {/* Liquid level */}
            <mesh position={[0, progress * height * 0.6, 0]}>
              <cylinderGeometry args={[radius * 0.95, radius * 0.85, height * 0.6, 16]} />
              <meshStandardMaterial
                color="#1e40af"
                transparent
                opacity={0.9}
              />
            </mesh>
            {/* Label */}
            <mesh position={[radius * 0.98, height * 0.3, 0]}>
              <boxGeometry args={[0.1, height * 0.4, radius * 1.5]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Cap */}
            <mesh position={[0, height + 0.2, 0]}>
              <cylinderGeometry args={[radius * 0.7, radius * 0.7, 0.4, 12]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        );

      case 'capped':
        return (
          <group>
            {/* Bottle body */}
            <mesh castShadow position={[0, height/2, 0]}>
              <cylinderGeometry args={[radius, radius * 0.9, height, 16]} />
              <meshStandardMaterial
                color="#3b82f6"
                transparent
                opacity={0.8}
              />
            </mesh>
            {/* Cap (with torque) */}
            <mesh position={[0, height + 0.2, 0]} rotation={[0, 0, Math.PI * progress]}>
              <cylinderGeometry args={[radius * 0.7, radius * 0.7, 0.4, 12]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        );

      case 'labeled':
        return (
          <group>
            {/* Bottle with full wrap label */}
            <mesh castShadow position={[0, height/2, 0]}>
              <cylinderGeometry args={[radius, radius * 0.9, height, 16]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.9}
              />
            </mesh>
            {/* Label design */}
            <mesh position={[0, height * 0.5, 0]}>
              <cylinderGeometry args={[radius * 1.01, radius * 0.91, height * 0.6, 16]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            {/* Product name */}
            <Text
              position={[0, height * 0.5, radius * 1.05]}
              fontSize={0.2}
              color="white"
              rotation={[0, 0, 0]}
            >
              PRODUCT
            </Text>
          </group>
        );

      case 'packaged':
        return (
          <group>
            {/* Bottle in packaging */}
            <mesh>
              <boxGeometry args={[radius * 2.5, height * 1.2, radius * 2.5]} />
              <meshStandardMaterial
                color="#ffffff"
                wireframe
                transparent
                opacity={0.3}
              />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[radius, radius * 0.9, height, 16]} />
              <meshStandardMaterial
                color="#3b82f6"
                transparent
                opacity={0.6}
              />
            </mesh>
          </group>
        );

      default: // empty bottle
        return (
          <group>
            <mesh castShadow position={[0, height/2, 0]}>
              <cylinderGeometry args={[radius, radius * 0.9, height, 16]} />
              <meshStandardMaterial
                color="#d1d5db"
                transparent
                opacity={0.3}
              />
            </mesh>
            {/* Bottle neck */}
            <mesh position={[0, height * 0.8, 0]}>
              <cylinderGeometry args={[radius * 0.5, radius * 0.5, height * 0.4, 8]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
          </group>
        );
    }
  };

  return (
    <group position={position} ref={meshRef}>
      {getBottleState()}
    </group>
  );
}

export default Bottle;