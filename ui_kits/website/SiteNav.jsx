// Ravenn Studio — site navigation bar
function SiteNav({ active, onNav }) {
  const { Button, Logo } = window.RavennStudioDesignSystem_41bd5d;
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const el = document.querySelector('#rv-scroll');
    const onScroll = () => setScrolled((el ? el.scrollTop : window.scrollY) > 20);
    const target = el || window;
    target.addEventListener('scroll', onScroll);
    return () => target.removeEventListener('scroll', onScroll);
  }, []);

  const links = ['Work', 'Services', 'Studio', 'Journal'];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(24px, 5vw, 64px)',
        height: 76,
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        background: scrolled ? 'rgba(3,0,10,0.72)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'background 280ms ease, border-color 280ms ease',
      }}
    >
      <div style={{ cursor: 'pointer' }} onClick={() => onNav('top')}>
        <Logo iconSrc="../../assets/logos/raven-logo.svg" size="sm" />
      </div>

      <nav style={{ display: 'flex', gap: 36 }}>
        {links.map((l) => (
          <a
            key={l}
            onClick={() => onNav(l.toLowerCase())}
            style={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: active === l.toLowerCase() ? 'var(--text-heading)' : 'var(--text-faint)',
              cursor: 'pointer',
              transition: 'color 200ms ease',
            }}
          >
            {l}
          </a>
        ))}
      </nav>

      <Button variant="secondary" size="sm" onClick={() => onNav('contact')}>Start a Project</Button>
    </header>
  );
}
window.SiteNav = SiteNav;
