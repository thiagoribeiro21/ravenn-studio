import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import RavenScene from './RavenScene';

// Simple ErrorBoundary so 3D errors never crash the page
import { Component } from 'react';
class R3FBoundary extends Component {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? null : this.props.children; }
}

export default function RavenCanvas() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        width: '100%',
        height: '100vh',
      }}
    >
      <R3FBoundary>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 55 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            <RavenScene />
          </Suspense>
        </Canvas>
      </R3FBoundary>
    </div>
  );
}
