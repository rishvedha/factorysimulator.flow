import { useEffect, useState } from "react";

/**
 * Core simulation brain.
 * No visuals. No three.js.
 */
export function useBottleSimulation(machinePositions) {
  const { feeder, filler, capper, labeler, packer } = machinePositions;

  const [bottles, setBottles] = useState([]);

  /* =========================
     FEEDER — SPAWN BOTTLES
  ========================= */
  useEffect(() => {
    if (!feeder) return;

    const interval = setInterval(() => {
      setBottles((prev) => [
        ...prev,
        {
          id: Date.now(),
          stage: "moveToFill",
          mode: "move",
          progress: 0,
          speed: 0.05,
          waitTime: 0,
          waterLevel: 0,
        },
      ]);
    }, 6000);

    return () => clearInterval(interval);
  }, [feeder]);

  /* =========================
     STAGE TRANSITIONS
  ========================= */
  const onStageDone = (id) => {
    setBottles((prev) =>
      prev.flatMap((bottle) => {
        if (bottle.id !== id) return bottle;

        switch (bottle.stage) {
          case "moveToFill":
            return {
              ...bottle,
              stage: "fill",
              mode: "wait",
              waitTime: 0,
            };

          case "fill":
            return {
              ...bottle,
              stage: "moveToCap",
              mode: "move",
              progress: 0,
            };

          case "moveToCap":
            return {
              ...bottle,
              stage: "cap",
              mode: "wait",
              waitTime: 0,
            };

          case "cap":
            return {
              ...bottle,
              stage: "moveToLabel",
              mode: "move",
              progress: 0,
            };

          case "moveToLabel":
            return {
              ...bottle,
              stage: "label",
              mode: "wait",
              waitTime: 0,
            };

          case "label":
            return {
              ...bottle,
              stage: "moveToPack",
              mode: "move",
              progress: 0,
            };

          case "moveToPack":
            return [];

          default:
            return bottle;
        }
      })
    );
  };

  return {
    bottles,
    setBottles,
    onStageDone,
  };
}
