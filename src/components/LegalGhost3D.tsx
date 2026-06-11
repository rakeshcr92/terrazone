import { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { R3FErrorBoundary } from './R3FErrorBoundary';

// NOTE: Error suppression is now handled globally in main.tsx
// This ensures it runs BEFORE any R3F code loads

interface LegalGhost3DProps {
  coordinates: number[][][];
  maxHeightMeters: number;
  setbacks?: {
    front: string;
    rear: string;
    side: string;
  };
  violation?: boolean;
}

function BuildingEnvelope({ 
  coordinates, 
  maxHeight, 
  violation 
}: { 
  coordinates: number[][][]; 
  maxHeight: number; 
  violation?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Convert lat/lng coordinates to local 3D space
  const shape = useMemo(() => {
    if (!coordinates[0] || coordinates[0].length < 3) return null;

    const points = coordinates[0].slice(0, -1); // Remove duplicate last point
    
    // Calculate centroid for centering
    const centroidX = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const centroidY = points.reduce((sum, p) => sum + p[1], 0) / points.length;

    // Create shape with scaled coordinates (exaggerate for visibility)
    const shape = new THREE.Shape();
    points.forEach((point, i) => {
      const x = (point[0] - centroidX) * 100000; // Scale factor for visibility
      const y = (point[1] - centroidY) * 100000;
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    });

    return shape;
  }, [coordinates]);

  // Gentle pulse animation
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
      meshRef.current.scale.set(1, pulse, 1);
    }
  });

  if (!shape) return null;

  // Extrusion settings for 3D building volume
  const extrudeSettings = {
    depth: maxHeight,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.2,
    bevelSegments: 3
  };

  return (
    <group>
      {/* Main building envelope */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial
          color={violation ? '#ef4444' : '#3b82f6'}
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
          wireframe={false}
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>

      {/* Wireframe outline for better definition */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshBasicMaterial
          color={violation ? '#dc2626' : '#2563eb'}
          wireframe
          opacity={0.9}
          transparent
        />
      </mesh>

      {/* Ground footprint - ANCHORED TO GROUND */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial
          color={violation ? '#fca5a5' : '#60a5fa'}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Height indicator line */}
      <mesh position={[0, maxHeight / 2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, maxHeight, 8]} />
        <meshStandardMaterial
          color={violation ? '#f87171' : '#60a5fa'}
          emissive={violation ? '#ef4444' : '#3b82f6'}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

function Scene({ coordinates, maxHeight, violation }: { 
  coordinates: number[][][]; 
  maxHeight: number;
  violation?: boolean;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.3} />
      <pointLight position={[0, maxHeight * 1.5, 0]} intensity={0.5} color="#60a5fa" />

      {/* Camera */}
      <PerspectiveCamera makeDefault position={[50, 40, 50]} fov={50} />
      
      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={20}
        maxDistance={200}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Grid for reference */}
      <Grid
        args={[100, 100]}
        cellSize={5}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={20}
        sectionThickness={1}
        sectionColor="#9ca3af"
        fadeDistance={200}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Building envelope */}
      <BuildingEnvelope
        coordinates={coordinates}
        maxHeight={maxHeight}
        violation={violation}
      />
    </>
  );
}

export function LegalGhost3D({ 
  coordinates, 
  maxHeightMeters, 
  setbacks, 
  violation 
}: LegalGhost3DProps) {
  // CRITICAL: Comprehensive validation BEFORE any React hooks or processing
  const hasValidCoordinates = Boolean(
    coordinates && 
    Array.isArray(coordinates) && 
    coordinates.length > 0 &&
    coordinates[0] && 
    Array.isArray(coordinates[0]) && 
    coordinates[0].length >= 3
  );

  const hasValidHeight = Boolean(
    maxHeightMeters && 
    typeof maxHeightMeters === 'number' && 
    maxHeightMeters > 0 && 
    !isNaN(maxHeightMeters)
  );

  // Create stable key for Canvas remounting
  const canvasKey = useMemo(() => {
    if (!hasValidCoordinates || !hasValidHeight) return 'invalid';
    return `canvas-${coordinates[0].length}-${maxHeightMeters}-${Date.now()}`;
  }, [coordinates, maxHeightMeters, hasValidCoordinates, hasValidHeight]);

  // Cleanup on unmount to prevent R3F errors
  useEffect(() => {
    return () => {
      // Small delay to allow R3F to clean up properly
      setTimeout(() => {
        // Force garbage collection of any lingering R3F objects
        if (typeof window !== 'undefined') {
          const canvases = document.querySelectorAll('canvas');
          canvases.forEach(canvas => {
            try {
              const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl');
              if (ctx && typeof (ctx as WebGLRenderingContext).getExtension === 'function') {
                const loseCtx = (ctx as WebGLRenderingContext).getExtension('WEBGL_lose_context');
                if (loseCtx) {
                  loseCtx.loseContext();
                }
              }
            } catch (e) {
              // Silently fail - cleanup is best effort
            }
          });
        }
      }, 100);
    };
  }, []);

  // Early return if no valid data - BEFORE Canvas renders
  if (!hasValidCoordinates || !hasValidHeight) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🏗️</div>
          <h3 className="text-xl font-semibold text-white mb-2">No 3D Data Available</h3>
          <p className="text-white/60 text-sm">Draw a polygon on the map to see the 3D legal envelope</p>
        </div>
      </div>
    );
  }

  // Now safe to render Canvas with Error Boundary
  return (
    <R3FErrorBoundary>
      <div className="relative w-full h-full rounded-lg overflow-hidden border border-border/50 bg-background/95">
        {/* Info overlay */}
        <div className="absolute top-4 left-4 z-10 glass-panel p-3 space-y-1">
          <div className="text-xs font-medium text-foreground/90">Legal Building Envelope</div>
          <div className="text-xl font-bold text-primary">{maxHeightMeters}m</div>
          <div className="text-xs text-muted-foreground">Maximum Height</div>
          {violation && (
            <div className="mt-2 text-xs text-red-500 font-medium">
              ⚠️ Height Violation
            </div>
          )}
        </div>

        {/* Controls hint */}
        <div className="absolute bottom-4 right-4 z-10 glass-panel p-2 text-xs text-muted-foreground">
          Drag to rotate • Scroll to zoom
        </div>

        {/* 3D Canvas with Suspense and stable key for proper remounting */}
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="text-white text-sm">Loading 3D...</div>
          </div>
        }>
          <Canvas
            key={canvasKey}
            shadows
            gl={{ 
              antialias: true, 
              alpha: true,
              preserveDrawingBuffer: false, // Prevent memory leaks
              powerPreference: 'default'
            }}
            style={{ background: 'transparent' }}
            onCreated={(state) => {
              state.gl.setClearColor('#000000', 0);
              
              // Suppress R3F warnings in the Canvas context
              const originalSetState = state.set;
              state.set = (partial: Record<string, unknown>) => {
                try {
                  return originalSetState(partial);
                } catch (e: unknown) {
                  const error = e as Error;
                  if (!error.message?.includes('R3F') && !error.message?.includes('__r3f')) {
                    throw e;
                  }
                  // Silently catch R3F internal errors
                }
              };
            }}
            dpr={[1, 2]} // Limit pixel ratio to prevent performance issues
          >
            <Scene 
              coordinates={coordinates} 
              maxHeight={maxHeightMeters}
              violation={violation}
            />
          </Canvas>
        </Suspense>
      </div>
    </R3FErrorBoundary>
  );
}