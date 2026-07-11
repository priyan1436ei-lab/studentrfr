'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarProps {
  type?: 'skinny' | 'fit' | 'athletic' | 'muscular';
  activeAnimation?: 'idle' | 'running' | 'squatting' | 'pushups' | 'yoga';
}

function HumanoidModel({ type = 'fit', activeAnimation = 'idle' }: AvatarProps) {
  // References for joint animation
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const leftHipRef = useRef<THREE.Group>(null);
  const rightHipRef = useRef<THREE.Group>(null);

  // Compute morph scales based on body type
  const bodyScales = useMemo(() => {
    switch (type) {
      case 'skinny':
        return { torso: [0.7, 1.0, 0.7], limbs: [0.75, 1.0, 0.75], shoulders: [0.8, 1.0, 0.8] };
      case 'athletic':
        return { torso: [1.15, 1.0, 1.0], limbs: [1.1, 1.0, 1.1], shoulders: [1.2, 1.0, 1.1] };
      case 'muscular':
        return { torso: [1.4, 1.0, 1.3], limbs: [1.3, 1.0, 1.3], shoulders: [1.5, 1.0, 1.4] };
      case 'fit':
      default:
        return { torso: [1.0, 1.0, 1.0], limbs: [1.0, 1.0, 1.0], shoulders: [1.0, 1.0, 1.0] };
    }
  }, [type]);

  // Materials
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: '#0ea5e9', // cyan glow
    roughness: 0.1,
    metalness: 0.8,
    emissive: '#0284c7',
    emissiveIntensity: 0.2
  });

  const muscleMaterial = new THREE.MeshStandardMaterial({
    color: '#ec4899', // magenta accents
    roughness: 0.2,
    metalness: 0.9
  });

  const jointMaterial = new THREE.MeshBasicMaterial({
    color: '#f59e0b' // gold neon joints
  });

  // Animation Loop
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Reset positions/rotations before applying animations
    if (torsoRef.current) {
      torsoRef.current.position.set(0, 0.6, 0);
      torsoRef.current.rotation.set(0, 0, 0);
    }
    if (leftShoulderRef.current) leftShoulderRef.current.rotation.set(0, 0, 0);
    if (rightShoulderRef.current) rightShoulderRef.current.rotation.set(0, 0, 0);
    if (leftHipRef.current) leftHipRef.current.rotation.set(0, 0, 0);
    if (rightHipRef.current) rightHipRef.current.rotation.set(0, 0, 0);
    if (headRef.current) headRef.current.rotation.set(0, 0, 0);

    // Apply specific animations
    if (activeAnimation === 'idle') {
      // Gentle breathing
      const breathe = Math.sin(t * 2) * 0.05;
      if (torsoRef.current) {
        torsoRef.current.position.y += breathe;
      }
      if (leftShoulderRef.current) leftShoulderRef.current.rotation.z = -0.1 + breathe * 0.2;
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.z = 0.1 - breathe * 0.2;
    } 
    else if (activeAnimation === 'running') {
      // Jogging/Running
      const runSpeed = 8;
      const legAngle = Math.sin(t * runSpeed) * 0.6;
      const armAngle = -Math.sin(t * runSpeed) * 0.7;

      if (torsoRef.current) {
        torsoRef.current.position.y += Math.abs(Math.sin(t * runSpeed * 2)) * 0.08;
        torsoRef.current.rotation.x = 0.15; // lean forward
      }
      // Alternate limbs
      if (leftHipRef.current) leftHipRef.current.rotation.x = legAngle;
      if (rightHipRef.current) rightHipRef.current.rotation.x = -legAngle;
      if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = armAngle;
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = -armAngle;
    } 
    else if (activeAnimation === 'squatting') {
      // Squatting reps
      const squatCycle = Math.sin(t * 3); // speed
      const squatHeight = (squatCycle - 1) * 0.3; // ranges from -0.6 to 0

      if (torsoRef.current) {
        torsoRef.current.position.y += squatHeight;
      }
      // Squat knee flexion and arm extension
      if (leftHipRef.current) leftHipRef.current.rotation.x = squatHeight * -1.5;
      if (rightHipRef.current) rightHipRef.current.rotation.x = squatHeight * -1.5;
      if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = -Math.PI / 2; // arms forward
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = -Math.PI / 2;
    } 
    else if (activeAnimation === 'pushups') {
      // Pushups reps
      const pushupCycle = Math.sin(t * 4);
      const pushHeight = (pushupCycle + 1) * 0.15;

      if (torsoRef.current) {
        // Rotate body flat
        torsoRef.current.rotation.z = Math.PI / 2;
        torsoRef.current.position.y = 0.2 + pushHeight;
      }
      if (leftShoulderRef.current) leftShoulderRef.current.rotation.y = -Math.PI / 3;
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.y = Math.PI / 3;
    } 
    else if (activeAnimation === 'yoga') {
      // Stand on one leg (Tree pose)
      if (torsoRef.current) {
        torsoRef.current.position.y += Math.sin(t) * 0.02; // subtle sway
      }
      if (leftHipRef.current) {
        leftHipRef.current.rotation.z = 0.5; // fold leg in
        leftHipRef.current.rotation.x = 0.3;
      }
      if (leftShoulderRef.current) {
        leftShoulderRef.current.rotation.z = -Math.PI * 0.75; // arms overhead
      }
      if (rightShoulderRef.current) {
        rightShoulderRef.current.rotation.z = Math.PI * 0.75;
      }
    }
  });

  return (
    <group ref={torsoRef} position={[0, 0.6, 0]}>
      {/* Torso */}
      <mesh material={skinMaterial} scale={bodyScales.torso as [number, number, number]}>
        <boxGeometry args={[0.5, 0.8, 0.25]} />
      </mesh>
      
      {/* Muscular Chest Plate */}
      {(type === 'athletic' || type === 'muscular') && (
        <mesh position={[0, 0.2, 0.15]} material={muscleMaterial} scale={bodyScales.torso as [number, number, number]}>
          <boxGeometry args={[0.42, 0.3, 0.05]} />
        </mesh>
      )}

      {/* Head */}
      <group position={[0, 0.6, 0]}>
        <mesh ref={headRef} material={skinMaterial}>
          <sphereGeometry args={[0.18, 16, 16]} />
        </mesh>
        {/* Neon Eyes */}
        <mesh position={[-0.06, 0.04, 0.13]} material={jointMaterial}>
          <sphereGeometry args={[0.025, 8, 8]} />
        </mesh>
        <mesh position={[0.06, 0.04, 0.13]} material={jointMaterial}>
          <sphereGeometry args={[0.025, 8, 8]} />
        </mesh>
      </group>

      {/* LEFT ARM */}
      <group ref={leftShoulderRef} position={[-0.35, 0.3, 0]}>
        {/* Shoulder Joint */}
        <mesh material={jointMaterial}>
          <sphereGeometry args={[0.07, 8, 8]} />
        </mesh>
        {/* Upper Arm */}
        <mesh position={[0, -0.2, 0]} material={muscleMaterial} scale={bodyScales.shoulders as [number, number, number]}>
          <cylinderGeometry args={[0.06, 0.05, 0.35, 8]} />
        </mesh>
        {/* Forearm */}
        <group position={[0, -0.35, 0]}>
          <mesh material={jointMaterial}>
            <sphereGeometry args={[0.05, 8, 8]} />
          </mesh>
          <mesh position={[0, -0.15, 0]} material={skinMaterial} scale={bodyScales.limbs as [number, number, number]}>
            <cylinderGeometry args={[0.04, 0.035, 0.3, 8]} />
          </mesh>
        </group>
      </group>

      {/* RIGHT ARM */}
      <group ref={rightShoulderRef} position={[0.35, 0.3, 0]}>
        {/* Shoulder Joint */}
        <mesh material={jointMaterial}>
          <sphereGeometry args={[0.07, 8, 8]} />
        </mesh>
        {/* Upper Arm */}
        <mesh position={[0, -0.2, 0]} material={muscleMaterial} scale={bodyScales.shoulders as [number, number, number]}>
          <cylinderGeometry args={[0.06, 0.05, 0.35, 8]} />
        </mesh>
        {/* Forearm */}
        <group position={[0, -0.35, 0]}>
          <mesh material={jointMaterial}>
            <sphereGeometry args={[0.05, 8, 8]} />
          </mesh>
          <mesh position={[0, -0.15, 0]} material={skinMaterial} scale={bodyScales.limbs as [number, number, number]}>
            <cylinderGeometry args={[0.04, 0.035, 0.3, 8]} />
          </mesh>
        </group>
      </group>

      {/* LEFT LEG */}
      <group ref={leftHipRef} position={[-0.18, -0.4, 0]}>
        {/* Hip Joint */}
        <mesh material={jointMaterial}>
          <sphereGeometry args={[0.08, 8, 8]} />
        </mesh>
        {/* Thigh */}
        <mesh position={[0, -0.25, 0]} material={muscleMaterial} scale={bodyScales.limbs as [number, number, number]}>
          <cylinderGeometry args={[0.08, 0.065, 0.45, 8]} />
        </mesh>
        {/* Calf */}
        <group position={[0, -0.45, 0]}>
          <mesh material={jointMaterial}>
            <sphereGeometry args={[0.06, 8, 8]} />
          </mesh>
          <mesh position={[0, -0.2, 0]} material={skinMaterial} scale={bodyScales.limbs as [number, number, number]}>
            <cylinderGeometry args={[0.05, 0.04, 0.35, 8]} />
          </mesh>
        </group>
      </group>

      {/* RIGHT LEG */}
      <group ref={rightHipRef} position={[0.18, -0.4, 0]}>
        {/* Hip Joint */}
        <mesh material={jointMaterial}>
          <sphereGeometry args={[0.08, 8, 8]} />
        </mesh>
        {/* Thigh */}
        <mesh position={[0, -0.25, 0]} material={muscleMaterial} scale={bodyScales.limbs as [number, number, number]}>
          <cylinderGeometry args={[0.08, 0.065, 0.45, 8]} />
        </mesh>
        {/* Calf */}
        <group position={[0, -0.45, 0]}>
          <mesh material={jointMaterial}>
            <sphereGeometry args={[0.06, 8, 8]} />
          </mesh>
          <mesh position={[0, -0.2, 0]} material={skinMaterial} scale={bodyScales.limbs as [number, number, number]}>
            <cylinderGeometry args={[0.05, 0.04, 0.35, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function Avatar3D({ type = 'fit', activeAnimation = 'idle' }: AvatarProps) {
  return (
    <div className="w-full h-full relative" style={{ minHeight: '350px' }}>
      <Canvas
        camera={{ position: [0, 1.5, 3], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 4, 3]} intensity={0.8} castShadow />
        <pointLight position={[-2, 1, 2]} color="#0ea5e9" intensity={1} />
        <pointLight position={[2, 0.5, -2]} color="#ec4899" intensity={0.8} />
        
        <HumanoidModel type={type} activeAnimation={activeAnimation} />

        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          minDistance={1.5}
          maxDistance={6}
          maxPolarAngle={Math.PI / 2 + 0.1} 
        />
        
        {/* Futuristic Radial Grid Base */}
        <Grid 
          position={[0, -0.85, 0]} 
          args={[10.5, 10.5]} 
          cellSize={0.5} 
          cellThickness={0.5} 
          cellColor="#3b82f6" 
          sectionSize={2.5}
          sectionThickness={1} 
          sectionColor="#ec4899" 
          fadeDistance={25} 
          infiniteGrid 
        />
      </Canvas>
    </div>
  );
}
