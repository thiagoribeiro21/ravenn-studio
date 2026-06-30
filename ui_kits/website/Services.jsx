// Ravenn Studio — services section
function Services() {
  const { Card, Eyebrow } = window.RavennStudioDesignSystem_41bd5d;
  const services = [
    { n: '01', t: 'Institutional Websites', d: 'Bespoke, high-end corporate sites engineered to project market authority and convert discerning audiences.' },
    { n: '02', t: 'Workflow Automation', d: 'Intelligent internal systems that remove friction, compress timelines and let teams operate above their weight.' },
    { n: '03', t: 'AI Integrations', d: 'Practical, sophisticated AI woven into your product and operations — assistants, retrieval, generation.' },
    { n: '04', t: 'Traffic Performance', d: 'Strategic acquisition and conversion programmes built for sustained, compounding growth.' },
  ];

  return (
    <section
      id="services"
      style={{ padding: 'clamp(80px,12vw,160px) clamp(24px,5vw,64px)', borderTop: '1px solid var(--border)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 64 }}>
        <div>
          <Eyebrow marker="—">Capabilities</Eyebrow>
          <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text-heading)', marginTop: 18, maxWidth: 620 }}>
            Four disciplines, one standard
          </h2>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-body)', maxWidth: 320 }}>
          We engage on a small number of engagements at a time — each treated as the studio's only client.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', overflow: 'hidden' }}>
        {services.map((s) => (
          <ServiceCell key={s.n} {...s} />
        ))}
      </div>
    </section>
  );
}

function ServiceCell({ n, t, d }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--bg-surface-raised)' : 'var(--bg-base)',
        padding: 'clamp(28px,3vw,44px)',
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        transition: 'background 280ms ease',
        cursor: 'default',
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: '0.2em', color: hover ? 'var(--rv-purple-400)' : 'var(--text-faint)', transition: 'color 280ms ease' }}>{n}</div>
      <h3 style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-heading)', marginTop: 'auto', marginBottom: 14 }}>{t}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-body)' }}>{d}</p>
      <div style={{ marginTop: 24, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: hover ? 'var(--text-heading)' : 'var(--text-faint)', transition: 'color 280ms ease' }}>
        Explore →
      </div>
    </div>
  );
}
window.Services = Services;
