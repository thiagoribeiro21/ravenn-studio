import { Suspense, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import RavenScene from './RavenScene';

class R3FBoundary extends Component {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? null : this.props.children; }
}

export default function StickyRaven() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Subtle violet aura behind the crow */}
      <div aria-hidden style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(76,29,149,0.22) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <R3FBoundary>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 52 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%', background: 'transparent', position: 'relative', zIndex: 1 }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            <RavenScene />
          </Suspense>
        </Canvas>
      </R3FBoundary>

      {/* Bottom caption */}
      <div aria-hidden style={{
        position: 'absolute',
        bottom: 36,
        left: 0,
        right: 0,
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 2,
      }}>
        <span style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#5B6472' }}>
          — Capabilities —
        </span>
      </div>
    </div>
  );
}
