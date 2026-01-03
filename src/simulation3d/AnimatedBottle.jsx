import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Animated Bottle that moves along paths and updates its visual state
 */
export default function AnimatedBottle({ bottle, from, to, onDone }) {
  const ref = useRef();

  // Initialize position
  useEffect(() => {
    if (ref.current && from) {
      if (bottle.mode === "wait") {
        // Position at destination when waiting
        ref.current.position.set(to.x, 1.2, to.z);
      } else {
        // Start at source when moving
        ref.current.position.set(from.x, 1.2, from.z);
      }
    }
  }, []);

  useFrame((_, delta) => {
    // WAIT MODE - Bottle is being processed at a machine
    if (bottle.mode === "wait") {
      // Keep bottle positioned at destination
      if (ref.current && to) {
        ref.current.position.set(to.x, 1.2, to.z);
      }
      
      bottle.waitTime += delta;

      // Gradual filling animation
      if (bottle.stage === "fill") {
        bottle.fillLevel = Math.min(bottle.waitTime / 4, 1); // Fill over 4 seconds
      }

      // Capping animation
      if (bottle.stage === "cap") {
        bottle.capProgress = Math.min(bottle.waitTime / 3, 1); // Cap over 3 seconds
      }

      // Labeling animation
      if (bottle.stage === "label") {
        bottle.labelProgress = Math.min(bottle.waitTime / 6, 1); // Label over 6 seconds
      }

      // Packaging animation
      if (bottle.stage === "pack") {
        bottle.packProgress = Math.min(bottle.waitTime / 7, 1); // Pack over 7 seconds
      }

      // Check if processing is complete
      const processingTime = bottle.stage === "fill" ? 4 : 
                           bottle.stage === "cap" ? 3 :
                           bottle.stage === "label" ? 6 :
                           bottle.stage === "pack" ? 7 : 5;

      if (bottle.waitTime >= processingTime) {
        onDone(bottle.id);
      }
      return;
    }

    // MOVE MODE - Bottle is moving along conveyor
    bottle.progress += delta * bottle.speed;
    bottle.progress = Math.min(bottle.progress, 1);

    // Calculate position along path
    const x = from.x + (to.x - from.x) * bottle.progress;
    const z = from.z + (to.z - from.z) * bottle.progress;

    if (ref.current) {
      ref.current.position.set(x, 1.2, z);
    }

    // Check if reached destination
    if (bottle.progress >= 1) {
      onDone(bottle.id);
    }
  });

  // Get visual state based on stage
  const getBottleVisual = () => {
    const height = 2.5;
    const radius = 0.6;

    // Empty bottle (starting state)
    if (bottle.stage === "moveToFill" || (bottle.stage === "fill" && bottle.fillLevel === 0)) {
      return (
        <group>
          <mesh>
            <cylinderGeometry args={[radius, radius * 0.9, height, 16]} />
            <meshStandardMaterial color="#d1d5db" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0, height * 0.85, 0]}>
            <cylinderGeometry args={[radius * 0.5, radius * 0.5, height * 0.3, 8]} />
            <meshStandardMaterial color="#9ca3af" />
          </mesh>
        </group>
      );
    }

    // Filled bottle (with or without cap)
    if (bottle.stage === "fill" || bottle.stage === "moveToCap" || 
        bottle.stage === "cap" || bottle.stage === "moveToLabel") {
      return (
        <group>
          {/* Bottle body */}
          <mesh>
            <cylinderGeometry args={[radius, radius * 0.9, height, 16]} />
            <meshStandardMaterial color="#d1d5db" transparent opacity={0.7} />
          </mesh>
          
          {/* Water/Liquid - fills gradually */}
          {bottle.fillLevel > 0 && (
            <mesh position={[0, -height * 0.4 + bottle.fillLevel * height * 0.8, 0]}>
              <cylinderGeometry
                args={[radius * 0.95, radius * 0.85, bottle.fillLevel * height * 0.8, 16]}
              />
              <meshStandardMaterial color="#2563eb" transparent opacity={0.9} />
            </mesh>
          )}

          {/* Cap - appears and tightens during capping */}
          {(bottle.stage === "cap" || bottle.stage === "moveToLabel" || 
            bottle.stage === "label" || bottle.stage === "moveToPack" || bottle.stage === "pack") && (
            <mesh position={[0, height * 0.9, 0]} rotation={[0, 0, bottle.capProgress * Math.PI * 2]}>
              <cylinderGeometry args={[radius * 0.5, radius * 0.5, 0.3, 12]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
            </mesh>
          )}

          {/* Label - appears gradually during labeling */}
          {(bottle.stage === "label" || bottle.stage === "moveToPack" || bottle.stage === "pack") && (
            <>
              <mesh position={[0, height * 0.3, 0]}>
                <cylinderGeometry
                  args={[radius * 1.02, radius * 0.92, height * 0.5 * bottle.labelProgress, 16]}
                />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
            </>
          )}
        </group>
      );
    }

    // Packaged bottle
    if (bottle.stage === "pack" || bottle.stage === "done") {
      return (
        <group>
          {/* Packaging wrap */}
          {bottle.packProgress > 0 && (
            <mesh>
              <boxGeometry args={[radius * 2.5, height * 1.2, radius * 2.5]} />
              <meshStandardMaterial
                color="#ffffff"
                wireframe={bottle.packProgress < 1}
                transparent
                opacity={bottle.packProgress < 1 ? 0.3 : 0.1}
              />
            </mesh>
          )}
          
          {/* Bottle inside */}
          <mesh>
            <cylinderGeometry args={[radius, radius * 0.9, height, 16]} />
            <meshStandardMaterial color="#d1d5db" transparent opacity={0.6} />
          </mesh>
          
          {/* Filled liquid */}
          <mesh position={[0, -height * 0.4 + height * 0.8, 0]}>
            <cylinderGeometry args={[radius * 0.95, radius * 0.85, height * 0.8, 16]} />
            <meshStandardMaterial color="#2563eb" transparent opacity={0.9} />
          </mesh>
          
          {/* Cap */}
          <mesh position={[0, height * 0.9, 0]}>
            <cylinderGeometry args={[radius * 0.5, radius * 0.5, 0.3, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
          
          {/* Label */}
          <mesh position={[0, height * 0.3, 0]}>
            <cylinderGeometry args={[radius * 1.02, radius * 0.92, height * 0.5, 16]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
      );
    }

    return null;
  };

  return (
    <group ref={ref}>
      {getBottleVisual()}
    </group>
  );
}

