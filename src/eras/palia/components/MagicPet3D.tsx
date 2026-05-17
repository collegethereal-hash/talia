import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, GradientTexture, Cylinder, Box, Cone } from '@react-three/drei';
import * as THREE from 'three';

export const MagicPet3D = ({ color, mood, customization }: { color: string, mood: number, customization: any }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { furColor, eyeType, hatType, accessoryType } = customization;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Main Body */}
        <Sphere ref={meshRef} args={[1, 64, 64]}>
          <MeshDistortMaterial
            color={furColor || color}
            speed={3}
            distort={0.3 + (100 - mood) * 0.003}
            radius={1}
          />
        </Sphere>

        {/* Eyes Group */}
        <group position={[0, 0.2, 0.8]}>
          <Eye position={[-0.3, 0, 0]} type={eyeType} />
          <Eye position={[0.3, 0, 0]} type={eyeType} />
        </group>

        {/* Ears */}
        <group position={[0, 0.5, 0]}>
          <mesh position={[-0.7, 0.3, 0]} rotation={[0, 0, 0.4]}>
            <Sphere args={[0.3, 16, 16]} scale={[1, 1.5, 0.5]}>
               <meshStandardMaterial color={furColor || color} />
            </Sphere>
          </mesh>
          <mesh position={[0.7, 0.3, 0]} rotation={[0, 0, -0.4]}>
            <Sphere args={[0.3, 16, 16]} scale={[1, 1.5, 0.5]}>
               <meshStandardMaterial color={furColor || color} />
            </Sphere>
          </mesh>
        </group>

        {/* Accessories */}
        {hatType === 'pirate' && <PirateHat position={[0, 1, 0]} />}
        {hatType === 'crown' && <Crown position={[0, 1, 0]} />}
        {hatType === 'flower' && <Flower position={[0, 0.9, 0.3]} />}

        {accessoryType === 'glasses' && <Glasses position={[0, 0.2, 0.85]} />}
        {accessoryType === 'scarf' && <Scarf position={[0, -0.7, 0.3]} />}
        {accessoryType === 'bow' && <Bow position={[0, 0.8, -0.3]} />}
      </Float>
    </group>
  );
};

function Eye({ position, type }: any) {
  return (
    <mesh position={position}>
      <Sphere args={[0.12, 16, 16]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      <mesh position={[0, 0, 0.08]}>
        <Sphere args={[0.06, 16, 16]}>
          <meshStandardMaterial color="black" />
        </Sphere>
        {type === 'sparkle' && (
          <mesh position={[0.02, 0.02, 0.02]}>
            <Sphere args={[0.02, 8, 8]}>
              <meshStandardMaterial color="white" emissive="white" />
            </Sphere>
          </mesh>
        )}
      </mesh>
    </mesh>
  );
}

function PirateHat({ position }: any) {
  return (
    <group position={position} rotation={[0, 0, 0.1]}>
      <mesh>
        <Box args={[1.2, 0.3, 0.6]}>
          <meshStandardMaterial color="#1a1a1a" />
        </Box>
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <Cylinder args={[0.4, 0.4, 0.5, 32]}>
          <meshStandardMaterial color="#1a1a1a" />
        </Cylinder>
      </mesh>
      {/* Skull symbol */}
      <mesh position={[0, 0.3, 0.42]}>
        <Sphere args={[0.08, 8, 8]}>
           <meshStandardMaterial color="white" />
        </Sphere>
      </mesh>
    </group>
  );
}

function Crown({ position }: any) {
  return (
    <group position={position}>
      <mesh>
        <Cylinder args={[0.5, 0.4, 0.4, 6]}>
          <meshStandardMaterial color="gold" metalness={1} roughness={0.2} />
        </Cylinder>
      </mesh>
    </group>
  );
}

function Flower({ position }: any) {
  return (
    <group position={position} scale={0.3}>
      <mesh>
        <Sphere args={[0.3, 16, 16]}>
          <meshStandardMaterial color="yellow" />
        </Sphere>
      </mesh>
      {[0, 1, 2, 3, 4].map(i => (
        <mesh key={i} position={[Math.cos(i * 1.25) * 0.5, Math.sin(i * 1.25) * 0.5, 0]}>
          <Sphere args={[0.3, 16, 16]} scale={[1, 0.5, 0.2]}>
            <meshStandardMaterial color="pink" />
          </Sphere>
        </mesh>
      ))}
    </group>
  );
}

function Glasses({ position }: any) {
  return (
    <group position={position}>
      <mesh position={[-0.3, 0, 0]}>
        <Cylinder args={[0.18, 0.18, 0.05, 32]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial color="#333" transparent opacity={0.5} />
        </Cylinder>
      </mesh>
      <mesh position={[0.3, 0, 0]}>
        <Cylinder args={[0.18, 0.18, 0.05, 32]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial color="#333" transparent opacity={0.5} />
        </Cylinder>
      </mesh>
      <mesh position={[0, 0, 0]}>
        <Box args={[0.6, 0.05, 0.05]}>
          <meshStandardMaterial color="#333" />
        </Box>
      </mesh>
    </group>
  );
}

function Scarf({ position }: any) {
  return (
    <mesh position={position}>
      <Cylinder args={[0.8, 0.8, 0.3, 32]}>
        <meshStandardMaterial color="crimson" />
      </Cylinder>
    </mesh>
  );
}

function Bow({ position }: any) {
  return (
    <group position={position} rotation={[0, Math.PI/2, 0]}>
      <mesh position={[0, 0, 0.15]} rotation={[0, 0, Math.PI/4]}>
        <Cone args={[0.2, 0.4, 4]}>
           <meshStandardMaterial color="hotpink" />
        </Cone>
      </mesh>
      <mesh position={[0, 0, -0.15]} rotation={[0, 0, -Math.PI/4]}>
        <Cone args={[0.2, 0.4, 4]}>
           <meshStandardMaterial color="hotpink" />
        </Cone>
      </mesh>
    </group>
  );
}
