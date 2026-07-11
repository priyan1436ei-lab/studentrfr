'use client';

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface BodyMapProps {
  onSelectMuscle: (muscle: string) => void;
}

interface MusclePartProps {
  position: [number, number, number];
  scale?: [number, number, number];
  name: string;
  onSelect: () => void;
  geometry: THREE.BufferGeometry;
}

function MusclePart({ position, scale = [1, 1, 1], name, onSelect, geometry }: MusclePartProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (hovered && meshRef.current) {
      meshRef.current.scale.set(
        scale[0] * (1 + Math.sin(clock.getElapsedTime() * 8) * 0.02),
        scale[1] * (1 + Math.sin(clock.getElapsedTime() * 8) * 0.02),
        scale[2] * (1 + Math.sin(clock.getElapsedTime() * 8) * 0.02)
      );
    } else if (meshRef.current) {
      meshRef.current.scale.set(scale[0], scale[1], scale[2]);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      geometry={geometry}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <meshStandardMaterial
        color={hovered ? '#ec4899' : '#334155'}
        emissive={hovered ? '#db2777' : '#0f172a'}
        emissiveIntensity={hovered ? 0.6 : 0.1}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

export default function BodyMap3D({ onSelectMuscle }: BodyMapProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const handleSelect = (muscleName: string) => {
    setSelectedMuscle(muscleName);
    onSelectMuscle(muscleName);
  };

  // Pre-compiled geometries to share
  const headGeom = useMemo(() => new THREE.SphereGeometry(0.24, 16, 16), []);
  const chestGeom = useMemo(() => new THREE.BoxGeometry(0.5, 0.28, 0.1), []);
  const absGeom = useMemo(() => new THREE.BoxGeometry(0.42, 0.32, 0.08), []);
  const backGeom = useMemo(() => new THREE.BoxGeometry(0.54, 0.55, 0.08), []);
  const armGeom = useMemo(() => new THREE.CylinderGeometry(0.07, 0.05, 0.45, 8), []);
  const shoulderGeom = useMemo(() => new THREE.SphereGeometry(0.09, 8, 8), []);
  const legGeom = useMemo(() => new THREE.CylinderGeometry(0.12, 0.09, 0.7, 8), []);

  function useMemo<T>(fn: () => T, deps: any[]): T {
    return React.useMemo(fn, deps);
  }

  return (
    <div className="w-full h-full relative" style={{ minHeight: '380px' }}>
      <Canvas
        camera={{ position: [0, 0.6, 2.5], fov: 40 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[0, 5, 3]} intensity={0.6} />
        <pointLight position={[2, 2, 2]} color="#0ea5e9" intensity={0.8} />
        <pointLight position={[-2, 1, -2]} color="#ec4899" intensity={0.6} />

        <group position={[0, -0.2, 0]}>
          {/* Head (Decorative, not filtered) */}
          <mesh position={[0, 0.75, 0]} geometry={headGeom}>
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </mesh>

          {/* Shoulders */}
          <MusclePart position={[-0.32, 0.48, 0]} name="Shoulders" onSelect={() => handleSelect('Shoulders')} geometry={shoulderGeom} />
          <MusclePart position={[0.32, 0.48, 0]} name="Shoulders" onSelect={() => handleSelect('Shoulders')} geometry={shoulderGeom} />

          {/* Chest */}
          <MusclePart position={[0, 0.35, 0.08]} name="Chest" onSelect={() => handleSelect('Chest')} geometry={chestGeom} />

          {/* Abs */}
          <MusclePart position={[0, 0.06, 0.07]} name="Abs" onSelect={() => handleSelect('Abs')} geometry={absGeom} />

          {/* Back (Facing rear) */}
          <MusclePart position={[0, 0.22, -0.09]} name="Back" onSelect={() => handleSelect('Back')} geometry={backGeom} />

          {/* Biceps (Front arms) */}
          <MusclePart position={[-0.36, 0.24, 0.03]} scale={[1, 1, 1]} name="Biceps" onSelect={() => handleSelect('Biceps')} geometry={armGeom} />
          <MusclePart position={[0.36, 0.24, 0.03]} scale={[1, 1, 1]} name="Biceps" onSelect={() => handleSelect('Biceps')} geometry={armGeom} />

          {/* Triceps (Back arms) */}
          <MusclePart position={[-0.36, 0.24, -0.05]} scale={[0.9, 1, 0.9]} name="Triceps" onSelect={() => handleSelect('Triceps')} geometry={armGeom} />
          <MusclePart position={[0.36, 0.24, -0.05]} scale={[0.9, 1, 0.9]} name="Triceps" onSelect={() => handleSelect('Triceps')} geometry={armGeom} />

          {/* Legs (Thighs) */}
          <MusclePart position={[-0.18, -0.36, 0]} name="Legs" onSelect={() => handleSelect('Legs')} geometry={legGeom} />
          <MusclePart position={[0.18, -0.36, 0]} name="Legs" onSelect={() => handleSelect('Legs')} geometry={legGeom} />
        </group>

        <OrbitControls enableZoom={true} enablePan={false} minDistance={1.8} maxDistance={4} />
      </Canvas>

      <div className="absolute top-4 left-4 right-4 text-center pointer-events-none flex flex-col gap-2 items-center">
        <span className="text-xs bg-slate-900/85 border border-slate-700 backdrop-blur text-slate-300 px-3 py-1.5 rounded-full shadow">
          👈 Orbit to click front/back muscle groups
        </span>
        {selectedMuscle && (
          <span className="text-sm font-bold bg-pink-500/20 text-pink-400 border border-pink-500/40 px-3 py-1 rounded-full backdrop-blur">
            Selected: {selectedMuscle} exercises
          </span>
        )}
      </div>
    </div>
  );
}
