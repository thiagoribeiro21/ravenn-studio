// Shared mutable state — written from DOM events, read in R3F useFrame.
// Plain object avoids React re-renders on every event tick.
export const scrollStore = {
  y:                   0,   // window.scrollY in pixels
  progress:            0,   // 0..1 (top → bottom of page)
  mouseX:              0,   // NDC: -1 (left) → +1 (right)
  mouseY:              0,   // NDC: -1 (bottom) → +1 (top) — inverted from screen Y
  capabilitiesVisible: false, // true when capabilities service blocks are in viewport
};
