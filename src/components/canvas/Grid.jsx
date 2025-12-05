import { Grid as DreiGrid } from "@react-three/drei";

export default function Grid() {
  return (
    <DreiGrid 
      args={[20, 20]} 
      cellSize={1}
      cellThickness={0.8}
      infiniteGrid
    />
  );
}
