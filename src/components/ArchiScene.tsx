'use client';

import { Canvas } from '@react-three/fiber';
import { MagicPet3D } from './MagicPet3D';

export default function ArchiScene({ color, mood }: { color: string, mood: number }) {
  return (
    <Canvas camera={{ position: [0, 0, 3] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <MagicPet3D color={color} mood={mood} />
    </Canvas>
  );
}
