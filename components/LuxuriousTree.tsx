import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { generateParticles, generateRibbonSegments } from '../utils/geometry';

interface LuxuriousTreeProps {
  state: TreeState;
}

// --- Procedural Texture Generation for Gift Boxes ---
// Returns an array of textures for variety
const createGiftBoxTextures = () => {
  if (typeof document === 'undefined') return [];
  
  const createCanvas = () => {
    const c = document.createElement('canvas');
    c.width = 128; 
    c.height = 128; 
    return c;
  };

  // Texture 1: Classic Cross
  const c1 = createCanvas();
  const ctx1 = c1.getContext('2d');
  if (ctx1) {
    ctx1.fillStyle = '#C40C0C'; ctx1.fillRect(0,0,128,128);
    ctx1.fillStyle = '#FFFFFF';
    ctx1.fillRect(54, 0, 20, 128);
    ctx1.fillRect(0, 54, 128, 20);
  }

  // Texture 2: Vertical Stripes
  const c2 = createCanvas();
  const ctx2 = c2.getContext('2d');
  if (ctx2) {
    ctx2.fillStyle = '#8B0000'; ctx2.fillRect(0,0,128,128);
    ctx2.fillStyle = '#FFD700'; // Gold stripe
    ctx2.fillRect(44, 0, 40, 128);
  }

  // Texture 3: Diagonal / Fancy
  const c3 = createCanvas();
  const ctx3 = c3.getContext('2d');
  if (ctx3) {
    ctx3.fillStyle = '#E60000'; ctx3.fillRect(0,0,128,128);
    ctx3.fillStyle = '#FFFFFF';
    ctx3.beginPath();
    ctx3.moveTo(0,0); ctx3.lineTo(20,0); ctx3.lineTo(128,108); ctx3.lineTo(128,128); ctx3.fill();
    ctx3.beginPath();
    ctx3.moveTo(108,0); ctx3.lineTo(128,0); ctx3.lineTo(20,128); ctx3.lineTo(0,128); ctx3.fill();
  }

  return [c1, c2, c3].map(c => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
};

// --- Geometries ---
const needleGeometry = new THREE.ConeGeometry(0.08, 0.45, 4);
const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32); 
const giftGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); 
const bellGeometry = new THREE.CylinderGeometry(0.1, 0.4, 0.5, 16, 1);
bellGeometry.translate(0, -0.25, 0); 

// Ribbon: Elongated along Z axis (length) to overlap with next segment
// Width (X) = 0.15, Thickness (Y) = 0.01 (Paper thin), Length (Z) = 0.12 (Slightly longer than step to overlap)
const ribbonSegmentGeometry = new THREE.BoxGeometry(0.15, 0.01, 0.12); 

// Star Geometry
const createStarGeometry = () => {
  const shape = new THREE.Shape();
  const points = 5;
  const outerRadius = 0.9; 
  const innerRadius = 0.45;
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const extrudeSettings = { depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 };
  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};
const starGeometry = createStarGeometry();
starGeometry.center();

// --- Materials ---
const emeraldMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#004d25'),
  roughness: 0.4,
  metalness: 0.1,
  flatShading: true,
});

const goldMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#FFD700'),
  roughness: 0.15,
  metalness: 1.0,
  emissive: new THREE.Color('#FDB931'),
  emissiveIntensity: 0.1,
  envMapIntensity: 1.2,
});

const redGlossMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#D90429'),
  roughness: 0.05,
  metalness: 0.2,
  envMapIntensity: 1.5,
});

const ribbonMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#D6001C'),
  roughness: 0.2, // Silky
  metalness: 0.3,
  emissive: new THREE.Color('#550000'),
  emissiveIntensity: 0.1,
  side: THREE.DoubleSide,
});

export const LuxuriousTree: React.FC<LuxuriousTreeProps> = ({ state }) => {
  const needlesRef = useRef<THREE.InstancedMesh>(null);
  const redRef = useRef<THREE.InstancedMesh>(null);
  const bellRef = useRef<THREE.InstancedMesh>(null);
  const ribbonRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.Mesh>(null);
  
  // Multiple Refs for different gift styles
  const giftRef1 = useRef<THREE.InstancedMesh>(null);
  const giftRef2 = useRef<THREE.InstancedMesh>(null);
  const giftRef3 = useRef<THREE.InstancedMesh>(null);

  // Generate Gift Textures and Materials
  const giftMaterials = useMemo(() => {
    const textures = createGiftBoxTextures();
    return textures.map(tex => new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: tex,
      roughness: 0.3,
      metalness: 0.1,
    }));
  }, []);

  // Counts
  const needleCount = 3500;
  const redCount = 80;
  const bellCount = 70;
  const ribbonSegmentCount = 2000; // Increased for continuous look
  const totalGiftCount = 30; // Reduced by half
  const giftPerType = 10;

  // Data
  const needlesData = useMemo(() => generateParticles(needleCount, 'needle'), []);
  const redData = useMemo(() => generateParticles(redCount, 'sphere'), []);
  const bellData = useMemo(() => generateParticles(bellCount, 'bell'), []);
  const ribbonData = useMemo(() => generateRibbonSegments(ribbonSegmentCount), []);
  
  // Split Gift Data into 3 groups
  const giftDataAll = useMemo(() => generateParticles(totalGiftCount, 'gift'), []);
  const giftData1 = useMemo(() => giftDataAll.slice(0, 10), [giftDataAll]);
  const giftData2 = useMemo(() => giftDataAll.slice(10, 20), [giftDataAll]);
  const giftData3 = useMemo(() => giftDataAll.slice(20, 30), [giftDataAll]);

  // Star Data (Connected to tip)
  // Tree height is 13, centered at 0. So tip is at +6.5.
  // Star center needs to be at roughly +6.6 to +6.8
  const starData = useMemo(() => ({
    scatterPosition: [0, 25, 0] as [number, number, number],
    treePosition: [0, 6.6, 0] as [number, number, number], 
  }), []);

  const tempObject = new THREE.Object3D();
  const targetProgress = useRef(0);

  useFrame((stateThree, delta) => {
    const target = state === TreeState.TREE_SHAPE ? 1 : 0;
    targetProgress.current = THREE.MathUtils.lerp(targetProgress.current, target, delta * 1.5);
    const t = targetProgress.current;
    const time = stateThree.clock.getElapsedTime();

    // 1. Needles
    if (needlesRef.current) {
      needlesData.forEach((data, i) => {
        const x = THREE.MathUtils.lerp(data.scatterPosition[0], data.treePosition[0], t);
        const y = THREE.MathUtils.lerp(data.scatterPosition[1], data.treePosition[1], t);
        const z = THREE.MathUtils.lerp(data.scatterPosition[2], data.treePosition[2], t);
        
        const noiseAmt = (1 - t) * 0.5;
        const floatY = Math.sin(time * data.speed + data.id) * noiseAmt;
        tempObject.position.set(x, y + floatY, z);

        const treeRotY = Math.atan2(x, z);
        const treeRotZ = Math.PI / 4;
        tempObject.rotation.set(
            THREE.MathUtils.lerp(data.rotation[0], 0, t),
            THREE.MathUtils.lerp(data.rotation[1], treeRotY, t),
            THREE.MathUtils.lerp(data.rotation[2], treeRotZ, t)
        );
        tempObject.scale.setScalar(data.scale);
        tempObject.updateMatrix();
        needlesRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      needlesRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Ornaments (Generic Handler)
    const updateOrnaments = (
      ref: React.RefObject<THREE.InstancedMesh>, 
      dataArray: typeof redData, 
      type: 'sphere' | 'bell' | 'gift'
    ) => {
      if (!ref.current) return;
      dataArray.forEach((data, i) => {
        const x = THREE.MathUtils.lerp(data.scatterPosition[0], data.treePosition[0], t);
        const y = THREE.MathUtils.lerp(data.scatterPosition[1], data.treePosition[1], t);
        const z = THREE.MathUtils.lerp(data.scatterPosition[2], data.treePosition[2], t);
        
        const noiseAmt = (1 - t) * 1.0;
        const floatY = Math.cos(time * data.speed + data.id) * noiseAmt;
        tempObject.position.set(x, y + floatY, z);

        if (t < 0.2) {
            tempObject.rotation.set(
                data.rotation[0] + time, 
                data.rotation[1] + time, 
                data.rotation[2]
            );
        } else {
            if (type === 'bell') {
                const wind = Math.sin(time * 2 + data.id) * 0.1;
                const rX = THREE.MathUtils.lerp(data.rotation[0], wind, t); 
                const rY = THREE.MathUtils.lerp(data.rotation[1], Math.atan2(x, z), t); 
                const rZ = THREE.MathUtils.lerp(data.rotation[2], wind, t);
                tempObject.rotation.set(rX, rY, rZ);
            } else if (type === 'gift') {
                const rX = THREE.MathUtils.lerp(data.rotation[0], 0, t);
                const rY = THREE.MathUtils.lerp(data.rotation[1], data.id, t);
                const rZ = THREE.MathUtils.lerp(data.rotation[2], 0, t);
                tempObject.rotation.set(rX, rY, rZ);
            } else {
                tempObject.rotation.set(data.rotation[0], data.rotation[1], data.rotation[2]);
            }
        }

        const scalePop = 1.0 + (Math.sin(t * Math.PI) * 0.2);
        tempObject.scale.setScalar(data.scale * scalePop);
        tempObject.updateMatrix();
        ref.current!.setMatrixAt(i, tempObject.matrix);
      });
      ref.current.instanceMatrix.needsUpdate = true;
    };

    updateOrnaments(redRef, redData, 'sphere');
    updateOrnaments(bellRef, bellData, 'bell');
    
    // Update all 3 gift groups
    updateOrnaments(giftRef1, giftData1, 'gift');
    updateOrnaments(giftRef2, giftData2, 'gift');
    updateOrnaments(giftRef3, giftData3, 'gift');

    // 3. Ribbon (Seamless & Silky)
    if (ribbonRef.current) {
      ribbonData.forEach((data, i) => {
        const x = THREE.MathUtils.lerp(data.scatterPosition[0], data.treePosition[0], t);
        const y = THREE.MathUtils.lerp(data.scatterPosition[1], data.treePosition[1], t);
        const z = THREE.MathUtils.lerp(data.scatterPosition[2], data.treePosition[2], t);

        const noiseAmt = (1 - t) * 2.5;
        const floatX = Math.sin(time * 0.5 + data.id * 0.1) * noiseAmt;
        const floatY = Math.cos(time * 0.3 + data.id * 0.1) * noiseAmt;

        tempObject.position.set(x + floatX, y + floatY, z);

        if (t < 0.9) {
             tempObject.rotation.set(time + data.id, time * 0.5 + data.id, data.rotation[2]);
        } else {
             // LookAt logic is pre-calculated in data.rotation to be tangent
             tempObject.rotation.set(data.rotation[0], data.rotation[1], data.rotation[2]);
        }

        const breathe = 1 + Math.sin(time * 2 + i * 0.05) * 0.1;
        tempObject.scale.set(data.scale * breathe, 1, 1);
        
        tempObject.updateMatrix();
        ribbonRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      ribbonRef.current.instanceMatrix.needsUpdate = true;
    }

    // 4. Star
    if (starRef.current) {
      const sx = THREE.MathUtils.lerp(starData.scatterPosition[0], starData.treePosition[0], t);
      const sy = THREE.MathUtils.lerp(starData.scatterPosition[1], starData.treePosition[1], t);
      const sz = THREE.MathUtils.lerp(starData.scatterPosition[2], starData.treePosition[2], t);

      starRef.current.position.set(sx, sy, sz);
      starRef.current.rotation.y = time * 0.8;
      const scale = 1.2 + Math.sin(time * 3) * 0.05;
      starRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      {/* Needles */}
      <instancedMesh ref={needlesRef} args={[needleGeometry, emeraldMaterial, needleCount]} castShadow receiveShadow />
      
      {/* Red Ribbon - Rendered early to blend well */}
      <instancedMesh ref={ribbonRef} args={[ribbonSegmentGeometry, ribbonMaterial, ribbonSegmentCount]} castShadow receiveShadow />

      {/* Red Spheres */}
      <instancedMesh ref={redRef} args={[sphereGeometry, redGlossMaterial, redCount]} castShadow receiveShadow />

      {/* Gold Bells */}
      <instancedMesh ref={bellRef} args={[bellGeometry, goldMaterial, bellCount]} castShadow receiveShadow />

      {/* Gift Boxes - 3 Variations */}
      <instancedMesh ref={giftRef1} args={[giftGeometry, giftMaterials[0], giftPerType]} castShadow receiveShadow />
      <instancedMesh ref={giftRef2} args={[giftGeometry, giftMaterials[1], giftPerType]} castShadow receiveShadow />
      <instancedMesh ref={giftRef3} args={[giftGeometry, giftMaterials[2], giftPerType]} castShadow receiveShadow />

      {/* Star */}
      <mesh ref={starRef} geometry={starGeometry} material={goldMaterial} castShadow />
    </group>
  );
};