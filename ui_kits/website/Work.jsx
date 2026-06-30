// Ravenn Studio — selected work section
function Work() {
  const { Eyebrow, Badge } = window.RavennStudioDesignSystem_41bd5d;
  const projects = [
    { client: 'Meridian Capital', cat: 'Institutional Website', year: '2025', tag: 'Finance' },
    { client: 'Atelier Noir', cat: 'Brand + Commerce', year: '2025', tag: 'Luxury' },
    { client: 'Vantage Health', cat: 'AI Integration', year: '2024', tag: 'Healthcare' },
    { client: 'Orbital Logistics', cat: 'Workflow Automation', year: '2024', tag: 'Industry' },
  ];

  return (
    <section id="work" style={{ padding: 'clamp(80px,12vw,160px) clamp(24px,5vw,64px)', borderTop: '1px solid var(--border)' }}>
      <Eyebrow marker="—">Selected Work</Eyebrow>
      <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text-heading)', marginTop: 18, marginBottom: 56, maxWidth: 620 }}>
        Quietly engineered, plainly effective
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {projects.map((p, i) => (
          <WorkRow key={p.client} {...p} first={i === 0} />
        ))}
      </div>
    </section>
  );
}

function WorkRow({ client, cat, year, tag, first }) {
  const { Badge } = window.RavennStudioDesignSystem_41bd5d;
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr auto auto',
        alignItems: 'center',
        gap: 24,
        padding: 'clamp(24px,3vw,40px) 8px',
        borderTop: first ? '1px solid var(--border)' : 'none',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'padding-left 280ms ease',
        paddingLeft: hover ? 24 : 8,
      }}
    >
      {hover ? <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: '60%', background: 'var(--action)', boxShadow: 'var(--glow-md)' }} /> : null}
      <div style={{ fontSize: 'clamp(20px,2.4vw,30px)', fontWeight: 500, color: hover ? 'var(--rv-purple-400)' : 'var(--text-heading)', transition: 'color 280ms ease', letterSpacing: '-0.01em' }}>{client}</div>
      <div style={{ fontSize: 14, color: 'var(--text-body)' }}>{cat}</div>
      <Badge variant="outline" tone="neutral">{tag}</Badge>
      <div style={{ fontSize: 13, color: 'var(--text-faint)', letterSpacing: '0.08em', minWidth: 80, textAlign: 'right' }}>
        {hover ? '↗ View' : year}
      </div>
    </div>
  );
}
window.Work = Work;
