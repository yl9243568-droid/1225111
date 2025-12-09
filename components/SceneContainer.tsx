import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { LuxuriousTree } from './LuxuriousTree';
import { TreeState } from '../types';

interface SceneContainerProps {
  treeState: TreeState;
}

export const SceneContainer: React.FC<SceneContainerProps> = ({ treeState }) => {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 22], fov: 45 }}
        gl={{ antialias: false }} // Post-processing handles AA usually, or better perf without
      >
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} color="#001a0f" />
        
        {/* Main warm spot for the gold */}
        <spotLight
          position={[10, 20, 10]}
          angle={0.25}
          penumbra={1}
          intensity={150}
          color="#ffebc2"
          castShadow
          shadow-bias={-0.0001}
        />
        
        {/* Rim light for definition */}
        <spotLight
          position={[-10, 5, -10]}
          angle={0.5}
          intensity={50}
          color="#42f5ad" // Emerald tint rim
        />

        {/* Environment for reflections on Gold */}
        <Environment preset="city" />
        
        {/* Background Stars */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <Suspense fallback={null}>
            <LuxuriousTree state={treeState} />
            
            {/* Ground Shadows */}
            <ContactShadows 
              position={[0, -7, 0]} 
              opacity={0.7} 
              scale={40} 
              blur={2.5} 
              far={10} 
              resolution={256} 
              color="#000000" 
            />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 3} 
          maxPolarAngle={Math.PI / 1.8}
          minDistance={10}
          maxDistance={40}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />

        {/* Post Processing for the "Glow" */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.8} // Only very bright things glow (gold reflections)
            mipmapBlur 
            intensity={1.5} 
            radius={0.4}
          />
          <Vignette eskil={false} offset={0.1} darkness={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};