// Ravenn Studio — contact section + footer
function Contact() {
  const { Button, Input, Select, Eyebrow, Logo, Checkbox } = window.RavennStudioDesignSystem_41bd5d;
  const [sent, setSent] = React.useState(false);
  const [nda, setNda] = React.useState(false);

  return (
    <React.Fragment>
      <section id="contact" style={{ position: 'relative', padding: 'clamp(80px,12vw,160px) clamp(24px,5vw,64px)', borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-30%', left: '20%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0) 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 'clamp(40px,6vw,96px)', alignItems: 'start' }}>
          <div>
            <Eyebrow marker="—">Start a Project</Eyebrow>
            <h2 style={{ fontSize: 'clamp(36px,5vw,68px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.04, color: 'var(--text-heading)', marginTop: 20 }}>
              Let's build something<br />worth guarding.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text-body)', marginTop: 28, maxWidth: 400 }}>
              Tell us about the work. We reply to every serious enquiry within one business day.
            </p>
            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <a href="mailto:studio@ravenn.co" style={{ fontSize: 15, color: 'var(--text-body)' }}>studio@ravenn.co</a>
              <span style={{ fontSize: 13, color: 'var(--text-faint)', letterSpacing: '0.08em' }}>WORLDWIDE · REMOTE-FIRST</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', padding: 'clamp(28px,3vw,40px)' }}>
            {sent ? (
              <div style={{ minHeight: 360, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 16 }}>
                <img src="../../assets/logos/raven-logo.svg" alt="" style={{ height: 64, opacity: 0.9 }} />
                <h3 style={{ fontSize: 24, color: 'var(--text-heading)' }}>Enquiry received</h3>
                <p style={{ fontSize: 14, color: 'var(--text-body)', maxWidth: 280 }}>Thank you. A studio principal will be in touch within one business day.</p>
                <Button variant="ghost" size="sm" onClick={() => setSent(false)}>Send another</Button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Input label="Full Name" placeholder="Ada Lovelace" required />
                <Input label="Work Email" type="email" placeholder="you@company.com" required />
                <Select label="Engagement" options={['Institutional Website','Workflow Automation','AI Integration','Traffic Performance','Something else']} />
                <Input label="Indicative Budget" placeholder="e.g. $50k–$150k" />
                <Checkbox checked={nda} onChange={setNda} label="An NDA is required before we speak" />
                <Button variant="primary" size="lg" fullWidth type="submit" iconRight="→">Send Enquiry</Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: 'clamp(40px,5vw,64px) clamp(24px,5vw,64px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <Logo iconSrc="../../assets/logos/raven-logo.svg" size="sm" />
          <div style={{ display: 'flex', gap: 28 }}>
            {['LinkedIn', 'Dribbble', 'X', 'Journal'].map((l) => (
              <a key={l} style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-faint)', cursor: 'pointer' }}>{l}</a>
            ))}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em' }}>© MMXXV RAVENN STUDIO</span>
        </div>
      </footer>
    </React.Fragment>
  );
}
window.Contact = Contact;
