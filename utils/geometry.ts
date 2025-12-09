import * as THREE from 'three';
import { ParticleData } from '../types';

// Constants for the tree shape
const TREE_HEIGHT = 13; 
const TREE_RADIUS_BASE = 6; 
const SCATTER_RADIUS = 35; 

/**
 * Generates random position inside a sphere
 */
const getRandomSpherePosition = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  
  return [x, y, z];
};

/**
 * Generates position on a cone surface (Christmas Tree)
 */
const getTreeConePosition = (height: number, maxRadius: number, index: number, total: number): [number, number, number] => {
  const yRatio = Math.pow(Math.random(), 1.6); 
  
  // Utilise the full height so the star sits ON the tip, not floating above
  // Tree goes from -6.5 to +6.5
  const y = yRatio * height - (height / 2); 

  // Radius at this height (linear taper)
  const r = maxRadius * (1 - yRatio);

  // Spiral distribution with golden angle
  const angle = index * 137.5 * (Math.PI / 180); 
  
  // Jitter: Allows needles to fill the inside volume
  const rJitter = r * (0.3 + Math.random() * 0.7);

  const x = rJitter * Math.cos(angle);
  const z = rJitter * Math.sin(angle);

  return [x, y, z];
};

export const generateParticles = (count: number, type: 'needle' | 'sphere' | 'bell' | 'gift'): ParticleData[] => {
  const particles: ParticleData[] = [];
  
  for (let i = 0; i < count; i++) {
    const scatter = getRandomSpherePosition(SCATTER_RADIUS);
    const tree = getTreeConePosition(TREE_HEIGHT, TREE_RADIUS_BASE, i, count);
    
    // Ornaments are pushed slightly outward to sit ON the needles
    let finalTreePos: [number, number, number] = tree;
    let rotation: [number, number, number] = [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI];
    let scale = 1;

    if (type !== 'needle') {
       // Calculate radius of this specific point to normalize it
       const currentRadius = Math.sqrt(tree[0]*tree[0] + tree[2]*tree[2]);
       
       // Don't push gifts/bells too far out, keep them snug
       const pushFactor = type === 'sphere' ? 1.15 : 1.05; 
       
       if (currentRadius > 0.1) {
           finalTreePos = [tree[0] * pushFactor, tree[1], tree[2] * pushFactor];
       }

       if (type === 'sphere') {
          scale = 0.5 + Math.random() * 0.8; 
       } else if (type === 'bell') {
          scale = 0.6 + Math.random() * 0.6;
       } else if (type === 'gift') {
          scale = 0.5 + Math.random() * 0.4;
       }
    } else {
        scale = 0.8 + Math.random() * 0.4;
    }

    particles.push({
      id: i,
      scatterPosition: scatter,
      treePosition: finalTreePos,
      rotation: rotation,
      scale: scale,
      speed: 0.2 + Math.random() * 0.8
    });
  }
  return particles;
};

/**
 * Generates Ribbon Segments
 * Creates a continuous spiral path
 */
export const generateRibbonSegments = (count: number): ParticleData[] => {
  const particles: ParticleData[] = [];
  const spiralTurns = 6.0;
  
  const dummyObj = new THREE.Object3D();
  const nextPos = new THREE.Vector3();
  const currentPos = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    const scatter = getRandomSpherePosition(SCATTER_RADIUS);
    
    // Progress 0 (top) to 1 (bottom)
    const t = i / count; 
    
    // Height: Match tree height more closely. 
    // Tree top is ~6.5. Start slightly below tip.
    const startY = (TREE_HEIGHT / 2) - 0.5;
    const endY = -(TREE_HEIGHT / 2);
    const y = startY - t * (startY - endY);
    
    // Radius: Linearly expands towards bottom
    const rBase = (t * TREE_RADIUS_BASE) * 1.3; // Floating slightly outside
    const drape = Math.sin(t * Math.PI * 12) * 0.15; // Waves
    const r = rBase + drape;

    // Angle
    const theta = t * (Math.PI * 2 * spiralTurns);
    
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    
    currentPos.set(x, y, z);
    
    // Calculate LookAt Target (Next Point)
    const tNext = (i + 1) / count;
    const yNext = startY - tNext * (startY - endY);
    const rBaseNext = (tNext * TREE_RADIUS_BASE) * 1.3;
    const drapeNext = Math.sin(tNext * Math.PI * 12) * 0.15;
    const rNext = rBaseNext + drapeNext;
    const thetaNext = tNext * (Math.PI * 2 * spiralTurns);
    
    nextPos.set(rNext * Math.cos(thetaNext), yNext, rNext * Math.sin(thetaNext));

    dummyObj.position.copy(currentPos);
    dummyObj.lookAt(nextPos);
    
    const rot = dummyObj.rotation;

    // Varying width logic
    const widthVariation = 0.8 + Math.sin(t * Math.PI * 8) * 0.5;

    particles.push({
      id: i + 20000,
      scatterPosition: scatter,
      treePosition: [x, y, z],
      rotation: [rot.x, rot.y, rot.z],
      scale: widthVariation, 
      speed: 0.5 + Math.random() * 0.5
    });
  }
  
  return particles;
}