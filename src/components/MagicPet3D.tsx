'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, GradientTexture } from '@react-three/drei';
import * as THREE from 'three';

export const MagicPet3D = ({ color, mood }: { color: string, mood: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color={color}
          speed={3}
          distort={0.4 + (100 - mood) * 0.005}
          radius={1}
        >
          <GradientTexture
            stops={[0, 1]}
            colors={['#ffffff', color]}
          />
        </MeshDistortMaterial>
      </Sphere>
    </Float>
  );
};
