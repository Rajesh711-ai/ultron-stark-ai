import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { PlasmaOrb } from './PlasmaOrb';
import { EnergyRings } from './EnergyRings';
import { LightningArcs } from './LightningArcs';
import { Particles3D } from './Particles3D';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';

export const UltronScene: React.FC = () => {
  const { theme, isTargetLocked } = useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  return (
    <div className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
      >
        <color attach="background" args={['#020617']} />

        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 7]} intensity={1.2} />

        <Stars
          radius={50}
          depth={50}
          count={2500}
          factor={4}
          saturation={1}
          fade
          speed={1.2}
        />

        <Suspense fallback={null}>
          <group>
            <PlasmaOrb />
            <EnergyRings />
            <LightningArcs />
            <Particles3D />
          </group>
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          rotateSpeed={0.5}
          maxDistance={10}
          minDistance={2.5}
          enabled={!isTargetLocked}
        />
      </Canvas>
    </div>
  );
};
