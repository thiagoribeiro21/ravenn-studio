// Ravenn Studio — hero section
function Hero({ onNav }) {
  const { Button, Eyebrow, Badge } = window.RavennStudioDesignSystem_41bd5d;
  return (
    <section
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - 76px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 clamp(24px, 5vw, 64px)',
        overflow: 'hidden',
      }}
    >
      {/* Violet aura glow */}
      <div
        style={{
          position: 'absolute',
          top: '14%',
          right: '-6%',
          width: 620,
          height: 620,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,29,149,0.55) 0%, rgba(76,29,149,0) 68%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      {/* Faint raven watermark */}
      <img
        src="../../assets/logos/raven-logo.svg"
        alt=""
        style={{ position: 'absolute', right: 'clamp(24px,8vw,160px)', top: '50%', transform: 'translateY(-50%)', height: 'min(64vh, 560px)', opacity: 0.05, pointerEvents: 'none' }}
      />

      <div style={{ position: 'relative', maxWidth: 880 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <Eyebrow marker="—">Selected Digital Studio</Eyebrow>
          <Badge variant="soft" tone="success" dot>Accepting 2 clients · Q3</Badge>
        </div>

        <h1 style={{ fontSize: 'clamp(44px, 7vw, 92px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.02, color: 'var(--text-heading)' }}>
          Digital ecosystems<br />that command<br />
          <span style={{ color: 'var(--rv-purple-400)' }}>authority.</span>
        </h1>

        <p style={{ marginTop: 32, fontSize: 'clamp(16px,1.4vw,19px)', lineHeight: 1.6, color: 'var(--text-body)', maxWidth: 560 }}>
          A boutique studio crafting bespoke institutional websites, intelligent automations and AI-driven integrations for a select few. Cutting-edge engineering, dressed in restraint.
        </p>

        <div style={{ display: 'flex', gap: 16, marginTop: 44, flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg" onClick={() => onNav('contact')}>Start a Project</Button>
          <Button variant="secondary" size="lg" iconRight="→" onClick={() => onNav('work')}>View Selected Work</Button>
        </div>

        <div style={{ display: 'flex', gap: 48, marginTop: 72, flexWrap: 'wrap' }}>
          {[['12', 'Years compounding'], ['40+', 'Institutions served'], ['5%', 'Of inbound accepted']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>{n}</div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-faint)', marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
window.Hero = Hero;
