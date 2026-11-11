import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';

export const Particles3D: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null!);
  const { theme, particleCount, audioData, orbPhysics } = useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  const { positions, velocities, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(themeColors.primary);
    const color2 = new THREE.Color(themeColors.accent);

    for (let i = 0; i < particleCount; i++) {
      // Sphere distribution around orb
      const radius = 1.2 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

      const mixedCol = color1.clone().lerp(color2, Math.random());
      col[i * 3] = mixedCol.r;
      col[i * 3 + 1] = mixedCol.g;
      col[i * 3 + 2] = mixedCol.b;
    }

    return { positions: pos, velocities: vel, colors: col };
  }, [particleCount, theme]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const time = state.clock.getElapsedTime();
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    const boost = 1 + audioData.bass * 2.0;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;

      posArray[idx] += velocities[idx] * boost;
      posArray[idx + 1] += velocities[idx + 1] * boost;
      posArray[idx + 2] += velocities[idx + 2] * boost;

      // Distance check from center
      const distSq =
        posArray[idx] ** 2 + posArray[idx + 1] ** 2 + posArray[idx + 2] ** 2;

      if (distSq > 36 || distSq < 0.8) {
        // Respawn near center
        const radius = 1.2 + Math.random() * 0.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        posArray[idx] = radius * Math.sin(phi) * Math.cos(theta);
        posArray[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
        posArray[idx + 2] = radius * Math.cos(phi);
      }
    }

    posAttr.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.05;
  });

  return (
    <group position={orbPhysics.position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
