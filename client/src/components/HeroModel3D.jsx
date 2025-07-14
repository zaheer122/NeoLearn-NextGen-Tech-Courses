import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Vector3 } from 'three';

// 3D Model Component
function Model({ scale = 2, position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const group = useRef();
  
  // Using a simple cube as placeholder, but you can use a GLTF model instead
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.01;
      
      // Add floating animation
      const time = state.clock.getElapsedTime();
      group.current.position.y = Math.sin(time) * 0.1 + position[1];
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6d28d9" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Floating Book model for education theme
function Book({ scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], color = "#6d28d9" }) {
  const group = useRef();
  
  useFrame((state) => {
    if (group.current) {
      const time = state.clock.getElapsedTime();
      group.current.rotation.y = Math.sin(time * 1) * 5 + rotation[4];
      group.current.position.y = Math.sin(time * 1) * 5 + position[4];
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Book cover */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.2, 2]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.2} />
      </mesh>
      
      {/* Pages */}
      <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[1.4, 0.05, 1.9]} />
        <meshStandardMaterial color="white" roughness={0.7} />
      </mesh>
    </group>
  );
}

// Course Model
function CourseCard3D({ scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const group = useRef();
  
  useFrame((state) => {
    if (group.current) {
      const time = state.clock.getElapsedTime();
      group.current.rotation.y = Math.sin(time * 0.2) * 0.1 + rotation[1];
      group.current.position.y = Math.sin(time * 0.4) * 0.1 + position[1];
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Card */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 0.1, 3]} />
        <meshStandardMaterial color="#f3f4f6" metalness={0.1} roughness={0.2} />
      </mesh>
      
      {/* Header area */}
      <mesh castShadow receiveShadow position={[0, 0.06, -1]}>
        <boxGeometry args={[1.8, 0.05, 0.8]} />
        <meshStandardMaterial color="#6d28d9" metalness={0.3} roughness={0.2} />
      </mesh>
      
      {/* Content lines */}
      <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
        <boxGeometry args={[1.6, 0.03, 0.2]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.5} />
      </mesh>
      
      <mesh castShadow receiveShadow position={[0, 0.06, 0.4]}>
        <boxGeometry args={[1.6, 0.03, 0.2]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.5} />
      </mesh>
      
      <mesh castShadow receiveShadow position={[0, 0.06, 0.8]}>
        <boxGeometry args={[1.6, 0.03, 0.2]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.5} />
      </mesh>
    </group>
  );
}

// Scene component with multiple elements
function Scene() {
  return (
    <>
      <Book position={[-2, 0, 0]} rotation={[0.2, 0.5, 0.1]} color="#6d28d9" />
      <Book position={[-1.5, 0.3, -1]} rotation={[-0.3, -0.2, 0.1]} scale={0.8} color="#7c3aed" />
      <Book position={[2, 0.5, -0.5]} rotation={[0.1, -0.3, -0.1]} scale={0.7} color="#4c1d95" />
      
      <CourseCard3D position={[1, -0.2, 1]} rotation={[0, -0.5, 0]} scale={0.6} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
    </>
  );
}

export default function HeroModel3D() {
  return (
    <div className="h-72 w-full">
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 60 }}>
        <Scene />
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI/3} maxPolarAngle={Math.PI/2} />
        <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={1.5} far={4} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
} 