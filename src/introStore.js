// Pub-sub bridging IntroReveal (the curtain) to whatever content should only
// start its own entrance animation once the curtain has fully opened —
// avoids threading a prop through App -> SiteShell -> HeroSection.
const SESSION_KEY = 'ravenn-intro-shown';

function computeInitialDone() {
  if (typeof window === 'undefined') return true;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduceMotion || sessionStorage.getItem(SESSION_KEY) === '1';
}

let done = computeInitialDone();
const listeners = new Set();

export function isIntroDone() {
  return done;
}

export function markIntroDone() {
  if (done) return;
  done = true;
  listeners.forEach((fn) => fn());
  listeners.clear();
}

// Calls back once, immediately if the intro already finished (or never ran).
export function onIntroDone(callback) {
  if (done) {
    callback();
    return () => {};
  }
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export { SESSION_KEY };
