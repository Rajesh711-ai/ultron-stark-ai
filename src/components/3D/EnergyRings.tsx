import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';

export const EnergyRings: React.FC = () => {
  const ring1Ref = useRef<THREE.Group>(null!);
  const ring2Ref = useRef<THREE.Group>(null!);
  const ring3Ref = useRef<THREE.Group>(null!);

  const { theme, shaderSpeed, audioData, orbPhysics } = useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const speed = shaderSpeed * (1 + audioData.bass * 0.5);

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.6 * speed;
      ring1Ref.current.rotation.y = time * 0.4 * speed;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -time * 0.5 * speed;
      ring2Ref.current.rotation.z = time * 0.7 * speed;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = -time * 0.8 * speed;
      ring3Ref.current.rotation.z = -time * 0.3 * speed;
    }
  });

  const primaryColor = new THREE.Color(themeColors.primary);
  const secondaryColor = new THREE.Color(themeColors.secondary);
  const accentColor = new THREE.Color(themeColors.accent);

  return (
    <group position={orbPhysics.position}>
      {/* Outer Ring 1 */}
      <group ref={ring1Ref}>
        <mesh>
          <torusGeometry args={[1.65, 0.015, 16, 100]} />
          <meshBasicMaterial
            color={primaryColor}
            wireframe
            transparent
            opacity={0.75}
          />
        </mesh>
      </group>

      {/* Middle Ring 2 */}
      <group ref={ring2Ref}>
        <mesh>
          <torusGeometry args={[1.9, 0.012, 16, 100]} />
          <meshBasicMaterial
            color={secondaryColor}
            transparent
            opacity={0.65}
          />
        </mesh>
      </group>

      {/* Outer Ring 3 */}
      <group ref={ring3Ref}>
        <mesh>
          <torusGeometry args={[2.2, 0.01, 16, 120]} />
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>
    </group>
  );
};
