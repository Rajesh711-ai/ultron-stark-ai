import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';
import { PlasmaShaderMaterial } from '../../shaders/plasmaShader';

export const PlasmaOrb: React.FC = () => {
  const outerMeshRef = useRef<THREE.Mesh>(null!);
  const innerCoreRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  const {
    theme,
    mode,
    energyLevel,
    orbPhysics,
    updateOrbPhysics,
    audioData,
    shaderSpeed,
  } = useUltronStore();

  const themeColors = THEME_PRESETS[theme];

  // Material setup
  const shaderMat = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(PlasmaShaderMaterial.uniforms),
      vertexShader: PlasmaShaderMaterial.vertexShader,
      fragmentShader: PlasmaShaderMaterial.fragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    return mat;
  }, []);

  useFrame((state, delta) => {
    if (!outerMeshRef.current || !groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Mode index mapping
    const modeMap: Record<string, number> = {
      IDLE: 0,
      SCANNING: 1,
      CHARGING: 2,
      ATTACK: 3,
      SLEEP: 4,
      WARNING: 5,
      ALERT: 5,
      SHUTDOWN: 6,
      STANDBY: 4,
      ACTIVE: 1,
    };

    // Update shader uniforms
    shaderMat.uniforms.uTime.value = time * shaderSpeed;
    shaderMat.uniforms.uColorCore.value.set(themeColors.orbCoreHex);
    shaderMat.uniforms.uColorPlasma.value.set(themeColors.orbPlasmaHex);
    shaderMat.uniforms.uColorAccent.value.set(themeColors.accent);
    shaderMat.uniforms.uAudioBass.value = audioData.bass;
    shaderMat.uniforms.uAudioTreble.value = audioData.treble;
    shaderMat.uniforms.uEnergy.value = energyLevel / 100;
    shaderMat.uniforms.uMode.value = modeMap[mode] || 0;

    // Smooth Physics Lerping
    const [targetX, targetY, targetZ] = orbPhysics.targetPos;
    const [currentX, currentY, currentZ] = orbPhysics.position;

    const lerpFactor = delta * 6;
    const newX = THREE.MathUtils.lerp(currentX, targetX, lerpFactor);
    const newY = THREE.MathUtils.lerp(currentY, targetY, lerpFactor);
    const newZ = THREE.MathUtils.lerp(currentZ, targetZ, lerpFactor);

    // Floating levitation sine wave
    const floatY = Math.sin(time * 1.8) * 0.12;

    groupRef.current.position.set(newX, newY + floatY, newZ);

    // Smooth Scale Lerp
    const currentScale = groupRef.current.scale.x;
    const targetScale = orbPhysics.targetScale * (1 + audioData.bass * 0.18);
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, lerpFactor);
    groupRef.current.scale.set(
      newScale * orbPhysics.stretch,
      newScale / orbPhysics.stretch,
      newScale
    );

    // Rotation
    groupRef.current.rotation.y += delta * 0.4 * shaderSpeed;
    groupRef.current.rotation.x += delta * 0.2 * shaderSpeed;

    // Inner Core Pulse
    if (innerCoreRef.current) {
      const corePulse = 1 + Math.sin(time * 6) * 0.08 + audioData.volume * 0.25;
      innerCoreRef.current.scale.setScalar(corePulse);
    }

    // Update position back to store
    updateOrbPhysics({ position: [newX, newY, newZ], scale: newScale });
  });

  return (
    <group ref={groupRef}>
      {/* Outer Plasma Shell */}
      <mesh ref={outerMeshRef} material={shaderMat}>
        <sphereGeometry args={[1.1, 64, 64]} />
      </mesh>

      {/* Inner Glowing Core */}
      <mesh ref={innerCoreRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial
          color={themeColors.orbCoreHex}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Point Light emitted from core */}
      <pointLight
        color={themeColors.primary}
        intensity={3.5 + audioData.bass * 2.5}
        distance={8}
      />
    </group>
  );
};
