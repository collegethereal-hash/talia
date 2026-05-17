'use client';

import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, Cylinder, Box, Cone } from '@react-three/drei';
import * as THREE from 'three';

export default function CharacterScene({ customization }: { customization: any }) {
  return (
    <Canvas camera={{ position: [0, 0.5, 3] }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />
      <PirateCharacter3D customization={customization} />
    </Canvas>
  );
}

function PirateCharacter3D({ customization }: { customization: any }) {
  const groupRef = useRef<THREE.Group>(null);
  const { skinColor, hat, clothes, weapon, accessory } = customization;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        {/* Head */}
        <mesh position={[0, 1, 0]}>
          <Sphere args={[0.4, 32, 32]}>
            <meshStandardMaterial color={skinColor || '#ffdbac'} />
          </Sphere>
        </mesh>

        {/* Body */}
        <mesh position={[0, 0.2, 0]}>
          <Cylinder args={[0.3, 0.4, 1, 32]}>
            <meshStandardMaterial color={clothes === 'jacket' ? '#8b0000' : clothes === 'vest' ? '#1e3a8a' : '#4a3c31'} />
          </Cylinder>
        </mesh>

        {/* Eyes */}
        <group position={[0, 1.1, 0.35]}>
          {accessory === 'eyepatch' ? (
            <Eyepatch position={[-0.15, 0, 0]} />
          ) : (
            <Eye position={[-0.15, 0, 0]} />
          )}
          <Eye position={[0.15, 0, 0]} />
        </group>

        {/* Mouth */}
        <mesh position={[0, 0.9, 0.35]} rotation={[0.2, 0, 0]}>
          <Box args={[0.15, 0.02, 0.02]}>
            <meshStandardMaterial color="#333" />
          </Box>
        </mesh>

        {/* Hats */}
        {hat === 'captain' && <CaptainHat position={[0, 1.4, 0]} />}
        {hat === 'bandana' && <Bandana position={[0, 1.3, 0]} />}

        {/* Weapons */}
        {weapon === 'saber' && <Saber position={[0.5, 0.2, 0.2]} rotation={[0, 0, -0.5]} />}
        {weapon === 'hook' && <Hook position={[-0.5, 0.2, 0.2]} />}

        {/* Legs */}
        <mesh position={[-0.15, -0.5, 0]}>
          <Cylinder args={[0.05, 0.05, 0.5, 16]}>
            <meshStandardMaterial color="#1a1a1a" />
          </Cylinder>
        </mesh>
        <mesh position={[0.15, -0.5, 0]}>
          <Cylinder args={[0.05, 0.05, 0.5, 16]}>
            <meshStandardMaterial color="#1a1a1a" />
          </Cylinder>
        </mesh>
      </Float>
    </group>
  );
}

function Eye({ position }: any) {
  return (
    <mesh position={position}>
      <Sphere args={[0.08, 16, 16]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      <mesh position={[0, 0, 0.05]}>
        <Sphere args={[0.04, 16, 16]}>
          <meshStandardMaterial color="black" />
        </Sphere>
      </mesh>
    </mesh>
  );
}

function Eyepatch({ position }: any) {
  return (
    <group position={position}>
      <mesh>
        <Sphere args={[0.09, 16, 16]}>
          <meshStandardMaterial color="#111" />
        </Sphere>
      </mesh>
      <mesh position={[0.15, 0.05, -0.05]} rotation={[0, 0, -0.5]}>
        <Box args={[0.4, 0.02, 0.02]}>
          <meshStandardMaterial color="#111" />
        </Box>
      </mesh>
    </group>
  );
}

function CaptainHat({ position }: any) {
  return (
    <group position={position} rotation={[0, 0, 0]}>
      <mesh>
        <Box args={[1.2, 0.2, 0.6]}>
          <meshStandardMaterial color="#1a1a1a" />
        </Box>
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <Cylinder args={[0.3, 0.4, 0.4, 32]}>
          <meshStandardMaterial color="#1a1a1a" />
        </Cylinder>
      </mesh>
      {/* Gold trim */}
      <mesh position={[0, 0.05, 0.31]}>
        <Box args={[0.4, 0.05, 0.01]}>
          <meshStandardMaterial color="gold" />
        </Box>
      </mesh>
    </group>
  );
}

function Bandana({ position }: any) {
  return (
    <group position={position}>
      <mesh>
        <Sphere args={[0.42, 32, 32]} scale={[1, 0.8, 1]}>
          <meshStandardMaterial color="#991b1b" />
        </Sphere>
      </mesh>
      {/* Knot */}
      <mesh position={[-0.3, -0.1, -0.2]} rotation={[0, 0.5, 0]}>
        <Sphere args={[0.1, 8, 8]}>
          <meshStandardMaterial color="#991b1b" />
        </Sphere>
      </mesh>
    </group>
  );
}

function Saber({ position, rotation }: any) {
  return (
    <group position={position} rotation={rotation}>
      {/* Handle */}
      <mesh>
        <Cylinder args={[0.02, 0.02, 0.3, 16]}>
          <meshStandardMaterial color="gold" />
        </Cylinder>
      </mesh>
      {/* Guard */}
      <mesh position={[0, 0.1, 0]}>
        <Sphere args={[0.08, 16, 16]} scale={[1, 0.5, 1]}>
          <meshStandardMaterial color="gold" />
        </Sphere>
      </mesh>
      {/* Blade */}
      <mesh position={[0, 0.5, 0]}>
        <Box args={[0.02, 0.8, 0.1]}>
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </Box>
      </mesh>
    </group>
  );
}

function Hook({ position }: any) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh>
        <Cylinder args={[0.05, 0.08, 0.2, 16]}>
          <meshStandardMaterial color="#111" />
        </Cylinder>
      </mesh>
      {/* Hook */}
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI/2, 0, 0]}>
        <Box args={[0.03, 0.03, 0.2]}>
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </Box>
      </mesh>
    </group>
  );
}
