'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface TrophyProps {
  unlockedBadges: string[]; // e.g. ['welcome', 'hydration_goal', 'streak_3']
}

interface BadgeMeshProps {
  position: [number, number, number];
  badgeKey: string;
  title: string;
  isUnlocked: boolean;
  color: string;
  geometry: THREE.BufferGeometry;
}

function TrophyToken({ position, badgeKey, title, isUnlocked, color, geometry }: BadgeMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Rotate constantly
      meshRef.current.rotation.y = clock.getElapsedTime() * (hovered ? 2.5 : 1.0);
      // Floating effect
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2 + position[0]) * 0.05;
    }
  });

  const material = new THREE.MeshStandardMaterial({
    color: isUnlocked ? color : '#334155',
    roughness: isUnlocked ? 0.15 : 0.6,
    metalness: isUnlocked ? 0.95 : 0.1,
    transparent: !isUnlocked,
    opacity: isUnlocked ? 1 : 0.35,
    emissive: isUnlocked ? color : '#000000',
    emissiveIntensity: hovered && isUnlocked ? 0.4 : 0.1
  });

  return (
    <group>
      {/* Pedestal */}
      <mesh position={[position[0], position[1] - 0.45, position[2]]}>
        <cylinderGeometry args={[0.22, 0.25, 0.1, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      
      {/* Trophy / Badge shape */}
      <mesh
        ref={meshRef}
        position={position}
        geometry={geometry}
        material={material}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {isUnlocked && <pointLight color={color} intensity={0.5} distance={1.2} />}
      </mesh>

      {/* Floating Badge title */}
      <Text
        position={[position[0], position[1] - 0.65, position[2]]}
        fontSize={0.09}
        color={isUnlocked ? '#f8fafc' : '#64748b'}
        anchorX="center"
      >
        {title}
      </Text>
      {!isUnlocked && (
        <Text
          position={[position[0], position[1] - 0.77, position[2]]}
          fontSize={0.07}
          color="#ef4444"
          anchorX="center"
        >
          Locked
        </Text>
      )}
    </group>
  );
}

export default function TrophyRoom3D({ unlockedBadges = [] }: TrophyProps) {
  const isUnlocked = (key: string) => unlockedBadges.includes(key) || key === 'welcome';

  // Badges geometries
  const starGeom = React.useMemo(() => new THREE.TorusGeometry(0.15, 0.04, 8, 24), []);
  const cupGeom = React.useMemo(() => new THREE.CylinderGeometry(0.14, 0.05, 0.32, 12), []);
  const gemGeom = React.useMemo(() => new THREE.OctahedronGeometry(0.18, 0), []);
  const sphereGeom = React.useMemo(() => new THREE.SphereGeometry(0.15, 12, 12), []);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '380px' }}>
      <Canvas
        camera={{ position: [0, 1.2, 3], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 4, 2]} intensity={0.7} />
        <pointLight position={[0, 2, 0]} color="#f59e0b" intensity={0.8} />

        {/* Badge 1: Welcome Pioneer */}
        <TrophyToken
          position={[-0.9, 0.5, -0.4]}
          badgeKey="welcome"
          title="FitVerse Pioneer"
          isUnlocked={true}
          color="#eab308" // Gold
          geometry={starGeom}
        />

        {/* Badge 2: Hydration Goal */}
        <TrophyToken
          position={[-0.3, 0.5, -0.4]}
          badgeKey="hydration_goal"
          title="Hydro Champion"
          isUnlocked={isUnlocked('hydration_goal')}
          color="#38bdf8" // Cyan
          geometry={sphereGeom}
        />

        {/* Badge 3: Streak 3 Days */}
        <TrophyToken
          position={[0.3, 0.5, -0.4]}
          badgeKey="streak_3"
          title="Consistent Starter"
          isUnlocked={isUnlocked('streak_3')}
          color="#ec4899" // Magenta
          geometry={gemGeom}
        />

        {/* Badge 4: Streak 7 Days */}
        <TrophyToken
          position={[0.9, 0.5, -0.4]}
          badgeKey="streak_7"
          title="Weekly Warrior"
          isUnlocked={isUnlocked('streak_7')}
          color="#10b981" // Green
          geometry={cupGeom}
        />

        {/* Display Cabinet Shelf */}
        <mesh position={[0, -0.15, -0.4]} receiveShadow>
          <boxGeometry args={[2.5, 0.05, 0.5]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        
        {/* Supporting Pillars */}
        <mesh position={[-1.15, -0.5, -0.4]}>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[1.15, -0.5, -0.4]}>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>

        <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 2 - 0.1} minDistance={1.8} maxDistance={4} />
      </Canvas>
      <div className="absolute top-4 left-4 right-4 text-center pointer-events-none">
        <span className="text-xs bg-slate-900/85 border border-slate-700 backdrop-blur text-slate-300 px-3 py-1.5 rounded-full shadow">
          🏆 Hover trophies to accelerate spin • Drag to orbit room cabinet
        </span>
      </div>
    </div>
  );
}
