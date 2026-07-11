'use client';

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface GymProps {
  onSelectEquipment: (equipment: 'Treadmill' | 'Dumbbells' | 'Bench Press' | 'Spin Bike') => void;
}

interface EquipmentProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  name: 'Treadmill' | 'Dumbbells' | 'Bench Press' | 'Spin Bike';
  onSelect: () => void;
}

function TreadmillModel({ position, rotation = [0, 0, 0], onSelect }: Omit<EquipmentProps, 'name'>) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (hovered && meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 5) * 0.015);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* Base Deck */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.15, 1.4]} />
        <meshStandardMaterial color={hovered ? '#0ea5e9' : '#1f2937'} roughness={0.4} />
      </mesh>
      {/* Belt */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.55, 0.01, 1.2]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>
      {/* Front Panel Columns */}
      <mesh position={[-0.28, 0.45, -0.55]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.9]} />
        <meshStandardMaterial color="#4b5563" metalness={0.7} />
      </mesh>
      <mesh position={[0.28, 0.45, -0.55]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.9]} />
        <meshStandardMaterial color="#4b5563" metalness={0.7} />
      </mesh>
      {/* Console bar */}
      <mesh position={[0, 0.85, -0.5]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.65, 0.1, 0.2]} />
        <meshStandardMaterial color={hovered ? '#38bdf8' : '#374151'} emissive={hovered ? '#0284c7' : '#000000'} />
      </mesh>
      {/* Floating tag */}
      {hovered && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.16}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          Treadmill
        </Text>
      )}
    </group>
  );
}

function DumbbellModel({ position, rotation = [0, 0, 0], onSelect }: Omit<EquipmentProps, 'name'>) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (hovered && meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 5) * 0.015);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* Rack Base */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.08, 0.4]} />
        <meshStandardMaterial color="#374151" roughness={0.6} />
      </mesh>
      {/* Rack Stand Legs */}
      <mesh position={[-0.5, -0.3, 0]} castShadow>
        <boxGeometry args={[0.06, 0.6, 0.06]} />
        <meshStandardMaterial color="#4b5563" metalness={0.8} />
      </mesh>
      <mesh position={[0.5, -0.3, 0]} castShadow>
        <boxGeometry args={[0.06, 0.6, 0.06]} />
        <meshStandardMaterial color="#4b5563" metalness={0.8} />
      </mesh>
      
      {/* Dumbbells (Row 1) */}
      <group position={[-0.3, 0.08, 0]} rotation={[0, 0.2, 0]}>
        <mesh castShadow><cylinderGeometry args={[0.08, 0.08, 0.08, 12]} /><meshStandardMaterial color={hovered ? '#ec4899' : '#111827'} /></mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.015, 0.015, 0.24, 8]} /><meshStandardMaterial color="#9ca3af" metalness={0.9} /></mesh>
      </group>
      <group position={[0.3, 0.08, 0]} rotation={[0, -0.15, 0]}>
        <mesh castShadow><cylinderGeometry args={[0.1, 0.1, 0.1, 12]} /><meshStandardMaterial color={hovered ? '#ec4899' : '#111827'} /></mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.018, 0.018, 0.26, 8]} /><meshStandardMaterial color="#9ca3af" metalness={0.9} /></mesh>
      </group>
      
      {hovered && (
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.16}
          color="#ec4899"
          anchorX="center"
          anchorY="middle"
        >
          Dumbbells
        </Text>
      )}
    </group>
  );
}

function BenchPressModel({ position, rotation = [0, 0, 0], onSelect }: Omit<EquipmentProps, 'name'>) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (hovered && meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 5) * 0.015);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* Bench Cushion */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.1, 1.2]} />
        <meshStandardMaterial color={hovered ? '#0ea5e9' : '#1e293b'} roughness={0.3} />
      </mesh>
      {/* Bench Legs */}
      <mesh position={[0, -0.25, -0.45]} castShadow>
        <boxGeometry args={[0.08, 0.4, 0.08]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.25, 0.45]} castShadow>
        <boxGeometry args={[0.08, 0.4, 0.08]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>
      {/* Uprights (Barbell Rack) */}
      <mesh position={[-0.25, 0.2, -0.2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.8]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>
      <mesh position={[0.25, 0.2, -0.2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.8]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>
      {/* Barbell Bar */}
      <group position={[0, 0.6, -0.2]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow><cylinderGeometry args={[0.015, 0.015, 1.6, 8]} /><meshStandardMaterial color="#94a3b8" metalness={0.95} /></mesh>
        {/* Weight Plates */}
        <mesh position={[0, -0.7, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.08, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.08, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>
      </group>

      {hovered && (
        <Text
          position={[0, 1.0, 0]}
          fontSize={0.16}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          Bench Press
        </Text>
      )}
    </group>
  );
}

function SpinBikeModel({ position, rotation = [0, 0, 0], onSelect }: Omit<EquipmentProps, 'name'>) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (hovered && meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 5) * 0.015);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* Bike Flywheel */}
      <mesh position={[0, 0.1, -0.35]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 16]} />
        <meshStandardMaterial color={hovered ? '#ec4899' : '#4b5563'} metalness={0.9} />
      </mesh>
      {/* Frame Box */}
      <mesh position={[0, 0.2, 0]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.7]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </mesh>
      {/* Seat post & Seat */}
      <mesh position={[0, 0.52, 0.2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.3]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0, 0.65, 0.18]} castShadow>
        <boxGeometry args={[0.18, 0.05, 0.25]} />
        <meshStandardMaterial color="#111827" roughness={0.8} />
      </mesh>
      {/* Handle bars */}
      <mesh position={[0, 0.75, -0.28]} castShadow>
        <boxGeometry args={[0.4, 0.04, 0.1]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      {hovered && (
        <Text
          position={[0, 1.1, 0]}
          fontSize={0.16}
          color="#ec4899"
          anchorX="center"
          anchorY="middle"
        >
          Spin Bike
        </Text>
      )}
    </group>
  );
}

export default function Gym3D({ onSelectEquipment }: GymProps) {
  return (
    <div className="w-full h-full relative" style={{ minHeight: '380px' }}>
      <Canvas
        camera={{ position: [0, 3, 5.5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 4]} intensity={0.6} castShadow />
        <pointLight position={[0, 3, 0]} color="#0ea5e9" intensity={1} />

        {/* 3D Equipment Components */}
        <TreadmillModel position={[-1.6, 0.08, 0.5]} rotation={[0, 0.5, 0]} onSelect={() => onSelectEquipment('Treadmill')} />
        <DumbbellModel position={[1.5, 0.38, -0.6]} rotation={[0, -0.4, 0]} onSelect={() => onSelectEquipment('Dumbbells')} />
        <BenchPressModel position={[0.2, 0.3, 0.8]} rotation={[0, -0.1, 0]} onSelect={() => onSelectEquipment('Bench Press')} />
        <SpinBikeModel position={[-0.3, 0.3, -1.2]} rotation={[0, 0.3, 0]} onSelect={() => onSelectEquipment('Spin Bike')} />

        {/* Gym Floor Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#0b0f19" roughness={0.9} />
        </mesh>

        {/* Outer neon grids */}
        <gridHelper args={[10, 20, '#1e293b', '#1e293b']} position={[0, 0.01, 0]} />

        <OrbitControls
          enableZoom={true}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>
      <div className="absolute top-4 left-4 right-4 text-center pointer-events-none">
        <span className="text-xs bg-slate-900/80 border border-slate-700 backdrop-blur text-slate-300 px-3 py-1.5 rounded-full shadow">
          👈 Drag to orbit • Click any equipment to start tracking a workout
        </span>
      </div>
    </div>
  );
}
