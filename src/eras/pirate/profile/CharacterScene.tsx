'use client';

import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, Cylinder, Box, Cone, Sparkles, Torus, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function CharacterScene({ customization }: { customization: any }) {
  return (
    <Canvas camera={{ position: [0, 0.5, 3] }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />
      <Sparkles count={60} scale={2} size={4} speed={1.5} color="#ff00ea" />
      <PirateCharacter3D customization={customization} />
    </Canvas>
  );
}

function PirateCharacter3D({ customization }: { customization: any }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<any>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const { skinColor, hat, clothes, weapon, accessory } = customization;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
    if (coreRef.current) {
      // Dynamic color shift for the magical substance
      const t = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2;
      const color1 = new THREE.Color(isMale ? '#ffaa00' : '#00ffff');
      const color2 = new THREE.Color(isMale ? '#ff0055' : '#aa00ff');
      coreRef.current.material.emissive.lerpColors(color1, color2, t);
    }
  });

  const isMale = customization.skinColor === '#e0ac69'; // Grinch fallback

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
        
        {/* Central Energy Core (The Substance) */}
        <mesh ref={coreRef} position={[0, 0.5, 0]}>
          <Sphere args={[0.35, 64, 64]}>
            <MeshDistortMaterial
              color={isMale ? '#ffaa00' : '#00ffff'}
              emissive={isMale ? '#ff4400' : '#00aaff'}
              emissiveIntensity={2}
              speed={6}
              distort={0.7}
            />
          </Sphere>
        </mesh>

        {/* Outer Wireframe Shell (Body) */}
        <mesh position={[0, 0.2, 0]}>
          <Cylinder args={[0.4, 0.5, 1.2, 16]}>
            <meshBasicMaterial 
              color={isMale ? '#ff5500' : '#ff00aa'} 
              wireframe 
              transparent 
              opacity={0.3} 
            />
          </Cylinder>
        </mesh>

        {/* Floating Rings (Orbitals) */}
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI/4, 0, 0]}>
          <Torus args={[0.65, 0.02, 16, 100]}>
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </Torus>
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI/4, Math.PI/4, 0]}>
          <Torus args={[0.75, 0.01, 16, 100]}>
            <meshBasicMaterial color={isMale ? '#ffaa00' : '#00ffff'} />
          </Torus>
        </mesh>

        {/* Head (Floating Crystal or Sphere) */}
        <mesh ref={headRef} position={[0, 1.3, 0]}>
          {isMale ? (
            <Cone args={[0.3, 0.6, 4]}>
              <meshStandardMaterial color="#222" metalness={1} roughness={0.1} emissive="#ff0055" emissiveIntensity={0.5} />
            </Cone>
          ) : (
            <Sphere args={[0.3, 32, 32]}>
              <MeshDistortMaterial color="#ff00aa" emissive="#aa00ff" emissiveIntensity={1.5} speed={4} distort={0.4} />
            </Sphere>
          )}
        </mesh>

        {/* Face Elements (Abstract) */}
        <group position={[0, 1.3, 0.3]}>
          <mesh position={[-0.1, 0, 0]}>
            <Sphere args={[0.05, 16, 16]}>
              <meshBasicMaterial color="#fff" />
            </Sphere>
          </mesh>
          <mesh position={[0.1, 0, 0]}>
            <Sphere args={[0.05, 16, 16]}>
              <meshBasicMaterial color="#fff" />
            </Sphere>
          </mesh>
          {accessory === 'eyepatch' && (
            <mesh position={[-0.1, 0, 0.02]}>
              <Box args={[0.12, 0.12, 0.02]}>
                <meshBasicMaterial color="#ff0000" />
              </Box>
            </mesh>
          )}
        </group>

        {/* Hats (Fixed sizes and positions) */}
        {hat === 'captain' && (
          <group position={[0, 1.6, 0]}>
            <mesh>
              <Box args={[1.2, 0.15, 0.6]}>
                <meshStandardMaterial color="#111" emissive="#ffaa00" emissiveIntensity={0.2} />
              </Box>
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <Cylinder args={[0.3, 0.4, 0.4, 32]}>
                <meshStandardMaterial color="#111" />
              </Cylinder>
            </mesh>
          </group>
        )}
        
        {hat === 'crown' && (
          <group position={[0, 1.6, 0]}>
            <mesh>
              <Torus args={[0.35, 0.05, 16, 100]} rotation={[Math.PI/2, 0, 0]}>
                <meshStandardMaterial color="gold" metalness={1} roughness={0.2} />
              </Torus>
            </mesh>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <mesh key={i} position={[Math.cos(i * 1.04) * 0.35, 0.15, Math.sin(i * 1.04) * 0.35]}>
                <Cone args={[0.05, 0.15, 4]}>
                  <meshStandardMaterial color="gold" metalness={1} />
                </Cone>
              </mesh>
            ))}
          </group>
        )}

        {hat === 'bandana' && (
          <mesh position={[0, 1.4, 0]}>
            <Sphere args={[0.35, 32, 32]} scale={[1, 0.8, 1]}>
              <meshBasicMaterial color="#ff0055" />
            </Sphere>
          </mesh>
        )}

        {/* Weapons (Energy versions) */}
        {weapon === 'saber' && (
          <group position={[0.6, 0.2, 0.2]} rotation={[0, 0, -0.5]}>
            <mesh>
              <Cylinder args={[0.02, 0.02, 0.3, 16]}>
                <meshStandardMaterial color="#fff" />
              </Cylinder>
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <Box args={[0.02, 0.8, 0.05]}>
                <meshBasicMaterial color="#ff0055" />
              </Box>
            </mesh>
          </group>
        )}

        {weapon === 'pistol' && (
          <group position={[0.6, 0.2, 0.2]} rotation={[0, Math.PI/2, 0]}>
            <mesh>
              <Box args={[0.05, 0.15, 0.05]}>
                <meshStandardMaterial color="#111" />
              </Box>
            </mesh>
            <mesh position={[0, 0.1, 0.1]} rotation={[Math.PI/2, 0, 0]}>
              <Cylinder args={[0.02, 0.02, 0.3, 16]}>
                <meshBasicMaterial color="#00ffff" />
              </Cylinder>
            </mesh>
          </group>
        )}

        {weapon === 'hook' && (
          <group position={[-0.6, 0.2, 0.2]}>
            <mesh rotation={[Math.PI/2, 0, 0]}>
              <Torus args={[0.2, 0.04, 16, 100]}>
                <meshBasicMaterial color="#ff00aa" />
              </Torus>
            </mesh>
          </group>
        )}

        {/* Clothes / Aura Shapes */}
        {clothes === 'jacket' && (
          <mesh position={[0, 0.2, 0]}>
            <Cylinder args={[0.45, 0.55, 1.2, 6]}>
              <meshBasicMaterial color="#ffaa00" wireframe opacity={0.5} transparent />
            </Cylinder>
          </mesh>
        )}

        {clothes === 'vest' && (
          <mesh position={[0, 0.2, 0]}>
            <Torus args={[0.5, 0.1, 16, 100]} rotation={[Math.PI/2, 0, 0]}>
              <meshBasicMaterial color="#00ffff" wireframe />
            </Torus>
          </mesh>
        )}

        {clothes === 'armor' && (
          <mesh position={[0, 0.2, 0]}>
            <Sphere args={[0.6, 16, 16]} scale={[1, 1.2, 1]}>
              <meshStandardMaterial color="#00ffff" transparent opacity={0.2} metalness={1} roughness={0} />
            </Sphere>
          </mesh>
        )}

      </Float>
    </group>
  );
}
