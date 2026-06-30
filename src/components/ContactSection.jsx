import { useState } from 'react';
import { motion } from 'framer-motion';

// ── Input / Textarea ──────────────────────────────────────────────────────────
function Field({ tag: Tag = 'input', label, name, ...props }) {
  const [focused, setFocused] = useState(false);
  const isTextarea = Tag === 'textarea';
  const id = `field-${name}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <label htmlFor={id} style={{
          fontSize: 10, fontWeight: 500, textTransform: 'uppercase',
          letterSpacing: '0.18em', color: '#5B6472',
        }}>
          {label}
        </label>
      )}
      <Tag
        id={id}
        name={name}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:       '100%',
          boxSizing:   'border-box',
          background:  'rgba(14,10,30,0.6)',
          border:      `1px solid ${focused ? '#7C3AED' : '#1E1B4B'}`,
          borderRadius: 4,
          padding:     isTextarea ? '14px 16px' : '0 16px',
          height:      isTextarea ? undefined : 52,
          minHeight:   isTextarea ? 140 : undefined,
          resize:      isTextarea ? 'vertical' : undefined,
          color:       '#F8F9FA',
          fontSize:    14,
          fontFamily:  'inherit',
          outline:     'none',
          boxShadow:   focused ? '0 0 0 3px rgba(124,58,237,0.15)' : 'none',
          transition:  'border-color 180ms ease, box-shadow 180ms ease',
        }}
        {...props}
      />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
function SelectField({ label, options, name, ...props }) {
  const [focused, setFocused] = useState(false);
  const id = `field-${name}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <label htmlFor={id} style={{
          fontSize: 10, fontWeight: 500, textTransform: 'uppercase',
          letterSpacing: '0.18em', color: '#5B6472',
        }}>
          {label}
        </label>
      )}
      <select
        id={id}
        name={name}
        aria-label={label || 'Selecione o serviço'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:            '100%',
          boxSizing:        'border-box',
          height:           52,
          background:       'rgba(14,10,30,0.6)',
          border:           `1px solid ${focused ? '#7C3AED' : '#1E1B4B'}`,
          borderRadius:     4,
          padding:          '0 40px 0 16px',
          color:            '#F8F9FA',
          fontSize:         14,
          fontFamily:       'inherit',
          outline:          'none',
          boxShadow:        focused ? '0 0 0 3px rgba(124,58,237,0.15)' : 'none',
          transition:       'border-color 180ms ease, box-shadow 180ms ease',
          cursor:           'pointer',
          appearance:       'none',
          WebkitAppearance: 'none',
          backgroundImage:  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235B6472' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat:    'no-repeat',
          backgroundPosition:  'right 16px center',
        }}
        {...props}
      >
        {options.map(({ value, label: lbl }) => (
          <option key={value} value={value} style={{ background: '#0B0712', color: '#F8F9FA' }}>
            {lbl}
          </option>
        ))}
      </select>
    </div>
  );
}

const SERVICE_OPTIONS = [
  { value: '',        label: 'Selecione o serviço de interesse' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'site',    label: 'Site Institucional' },
  { value: 'exp',     label: 'Site Experiencial' },
  { value: 'auto',    label: 'Automação n8n & IA' },
  { value: 'trafego', label: 'Gestão de Tráfego Pago' },
  { value: 'outro',   label: 'Outro' },
];

const CONTACT_INFO = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    ),
    label: 'E-mail',
    value: 'contato@ravennstudio.com',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <circle cx="12" cy="11" r="2.5"/>
      </svg>
    ),
    label: 'Localização',
    value: 'São Paulo, Brasil',
  },
];

// ── Seção de contato ──────────────────────────────────────────────────────────
export default function ContactSection() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Orçamento – ${form.service || 'Ravenn Studio'}`);
    const body    = encodeURIComponent(
      `Nome: ${form.name}\nEmail: ${form.email}\nTelefone: ${form.phone}\nServiço: ${form.service}\n\n${form.message}`,
    );
    window.location.href = `mailto:contato@ravennstudio.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section
      id="contact"
      style={{
        position:  'relative',
        overflow:  'hidden',
        borderTop: '1px solid #1E1B4B',
        padding:   'clamp(80px, 10vw, 140px) clamp(32px, 5vw, 96px)',
      }}
    >
      {/* Gradiente roxo */}
      <div
        aria-hidden
        style={{
          position:      'absolute',
          inset:         0,
          background:    'radial-gradient(ellipse 65% 55% at 0% 100%, rgba(76,29,149,0.30) 0%, transparent 62%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position:      'absolute',
          inset:         0,
          background:    'radial-gradient(ellipse 50% 40% at 100% 0%, rgba(124,58,237,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Grid 2 colunas no desktop, 1 no mobile */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2"
        style={{
          position: 'relative',
          maxWidth: 1200,
          margin:   '0 auto',
          gap:      'clamp(56px, 7vw, 112px)',
          alignItems: 'start',
        }}
      >

        {/* ── Coluna esquerda: headline + info ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.15 }}
        >
          {/* Eyebrow */}
          <span style={{
            fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
            letterSpacing: '0.22em', color: '#7C3AED',
            display: 'block', marginBottom: 24,
          }}>
            — Contato
          </span>

          {/* Headline */}
          <h2 style={{
            fontSize:      'clamp(34px, 4.2vw, 58px)',
            fontWeight:    300,
            letterSpacing: '-0.025em',
            lineHeight:    1.06,
            color:         '#F8F9FA',
            marginBottom:  20,
          }}>
            Pronto para crescer<br />
            <span style={{ color: '#A78BFA' }}>no digital?</span>
          </h2>

          <p style={{
            fontSize:     15,
            lineHeight:   1.74,
            color:        '#94A3B8',
            maxWidth:     400,
            marginBottom: 44,
          }}>
            Conte sobre seu projeto e respondemos em até{' '}
            <strong style={{ color: '#F8F9FA', fontWeight: 500 }}>24 horas</strong>.
            Sem compromisso.
          </p>

          {/* Indicadores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 52 }}>
            {[
              ['24h',    'Resposta garantida'],
              ['R$ 3.8k','A partir de'],
              ['3 vagas','Disponíveis neste trimestre'],
            ].map(([stat, lbl]) => (
              <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{
                  display:        'inline-flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  minWidth:       68,
                  height:         32,
                  padding:        '0 12px',
                  fontSize:       12,
                  fontWeight:     600,
                  letterSpacing:  '-0.01em',
                  color:          '#A78BFA',
                  background:     'rgba(124,58,237,0.10)',
                  border:         '1px solid rgba(124,58,237,0.22)',
                  borderRadius:   4,
                }}>
                  {stat}
                </span>
                <span style={{
                  fontSize:      11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color:         '#5B6472',
                }}>
                  {lbl}
                </span>
              </div>
            ))}
          </div>

          {/* Info de contato */}
          <div
            style={{
              borderTop:  '1px solid #1E1B4B',
              paddingTop: 36,
              display:    'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {CONTACT_INFO.map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  width:          36,
                  height:         36,
                  borderRadius:   '50%',
                  background:     'rgba(124,58,237,0.10)',
                  border:         '1px solid rgba(124,58,237,0.20)',
                  color:          '#A78BFA',
                  flexShrink:     0,
                }}>
                  {icon}
                </span>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#5B6472', marginBottom: 2 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 13, color: '#94A3B8' }}>
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Coluna direita: formulário ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.18, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.15 }}
        >
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                textAlign:  'center',
                padding:    '80px 40px',
                border:     '1px solid #1E1B4B',
                borderRadius: 8,
                background: 'rgba(76,29,149,0.08)',
              }}
            >
              <p style={{
                fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.22em',
                color: '#A78BFA', marginBottom: 16,
              }}>
                Mensagem enviada
              </p>
              <p style={{ fontSize: 22, fontWeight: 400, color: '#F8F9FA', letterSpacing: '-0.02em' }}>
                Entraremos em contato<br />em breve.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display:       'flex',
                flexDirection: 'column',
                gap:           16,
                padding:       'clamp(28px, 3vw, 48px)',
                background:    'rgba(10,7,24,0.50)',
                border:        '1px solid #1E1B4B',
                borderRadius:  8,
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <Field label="Nome" tag="input" type="text"  name="name"  placeholder="Seu nome"       value={form.name}  onChange={onChange} required />
                <Field label="E-mail" tag="input" type="email" name="email" placeholder="seu@email.com" value={form.email} onChange={onChange} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <Field label="Telefone (opcional)" tag="input" type="tel" name="phone" placeholder="(11) 99999-9999" value={form.phone} onChange={onChange} />
                <SelectField label="Serviço de interesse" name="service" options={SERVICE_OPTIONS} value={form.service} onChange={onChange} />
              </div>

              <Field
                label="Sobre seu projeto"
                tag="textarea"
                name="message"
                placeholder="Descreva brevemente seu projeto ou objetivo…"
                value={form.message}
                onChange={onChange}
              />

              <button
                type="submit"
                style={{
                  width:         '100%',
                  height:        60,
                  background:    '#7C3AED',
                  color:         '#fff',
                  border:        'none',
                  borderRadius:  4,
                  fontSize:      12,
                  fontWeight:    500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  cursor:        'pointer',
                  marginTop:     8,
                  transition:    'background 200ms ease, box-shadow 200ms ease, transform 120ms ease',
                  fontFamily:    'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background  = '#6D28D9';
                  e.currentTarget.style.boxShadow   = '0 0 40px -8px rgba(124,58,237,0.60)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background  = '#7C3AED';
                  e.currentTarget.style.boxShadow   = 'none';
                }}
                onMouseDown={(e)  => { e.currentTarget.style.transform = 'scale(0.988)'; }}
                onMouseUp={(e)    => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Enviar Mensagem →
              </button>

              <p style={{
                fontSize:      10,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color:         '#3B3F4A',
                textAlign:     'center',
              }}>
                Seus dados são confidenciais e nunca compartilhados.
              </p>
            </form>
          )}
        </motion.div>

      </div>
    </section>
  );
}
