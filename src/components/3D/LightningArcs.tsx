import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';

export const LightningArcs: React.FC = () => {
  const lineRef = useRef<THREE.LineSegments>(null!);
  const { theme, mode, energyLevel, orbPhysics, audioData } =
    useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  const arcCount = 12;

  const geometry = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < arcCount; i++) {
      // 2 points per line segment
      positions.push(0, 0, 0);
      positions.push(0, 0, 0);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    return geom;
  }, []);

  useFrame((state) => {
    if (!lineRef.current) return;

    const time = state.clock.getElapsedTime();
    const posAttr = lineRef.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    const isActive =
      mode === 'ATTACK' ||
      mode === 'CHARGING' ||
      mode === 'SCANNING' ||
      energyLevel > 80 ||
      audioData.bass > 0.5;

    let idx = 0;
    for (let i = 0; i < arcCount; i++) {
      if (isActive && Math.random() < 0.65) {
        // Start near core
        const startR = 0.4;
        const theta1 = Math.random() * Math.PI * 2;
        const phi1 = Math.acos(Math.random() * 2 - 1);
        array[idx] = startR * Math.sin(phi1) * Math.cos(theta1);
        array[idx + 1] = startR * Math.sin(phi1) * Math.sin(theta1);
        array[idx + 2] = startR * Math.cos(phi1);

        // End outer arc
        const endR = 1.4 + Math.random() * 0.8;
        const theta2 = theta1 + (Math.random() - 0.5) * 0.8;
        const phi2 = phi1 + (Math.random() - 0.5) * 0.8;
        array[idx + 3] = endR * Math.sin(phi2) * Math.cos(theta2);
        array[idx + 4] = endR * Math.sin(phi2) * Math.sin(theta2);
        array[idx + 5] = endR * Math.cos(phi2);
      } else {
        // Collapse to zero
        array[idx] = 0;
        array[idx + 1] = 0;
        array[idx + 2] = 0;
        array[idx + 3] = 0;
        array[idx + 4] = 0;
        array[idx + 5] = 0;
      }
      idx += 6;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <group position={orbPhysics.position}>
      <lineSegments ref={lineRef} geometry={geometry}>
        <lineBasicMaterial
          color={themeColors.primary}
          linewidth={2}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
};
