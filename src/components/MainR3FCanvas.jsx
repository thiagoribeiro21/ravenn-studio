import { Suspense, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import HeroSphere from './HeroSphere';

// Prevents 3D errors from crashing the page
class R3FBoundary extends Component {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? null : this.props.children; }
}

// Fixed, full-screen 3D canvas — scoped to the HeroSphere only.
// The crow lives in its own inline Canvas inside CapabilitiesSection.
export default function MainR3FCanvas() {
  return (
    <div
      aria-hidden
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        3,
        pointerEvents: 'none',
        width:         '100%',
        height:        '100vh',
      }}
    >
      <R3FBoundary>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 55 }}
          gl={{
            alpha:           true,
            antialias:       true,
            powerPreference: 'high-performance',
          }}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            <HeroSphere />
          </Suspense>
        </Canvas>
      </R3FBoundary>
    </div>
  );
}
