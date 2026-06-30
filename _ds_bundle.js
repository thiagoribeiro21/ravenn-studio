/* Ravenn Studio — Component Bundle
   All design system components as React.createElement calls.
   Exports to window.RavennStudioDesignSystem_41bd5d */
(function () {
  'use strict';
  var NS = 'RavennStudioDesignSystem_41bd5d';
  var R = window.React;
  var ce = R.createElement;
  var useState = R.useState;

  /* ── Button ──────────────────────────────────────────────── */
  function Button(_ref) {
    var children = _ref.children,
      _ref$variant = _ref.variant, variant = _ref$variant === void 0 ? 'primary' : _ref$variant,
      _ref$size = _ref.size, size = _ref$size === void 0 ? 'md' : _ref$size,
      _ref$icon = _ref.icon, icon = _ref$icon === void 0 ? null : _ref$icon,
      _ref$iconRight = _ref.iconRight, iconRight = _ref$iconRight === void 0 ? null : _ref$iconRight,
      _ref$fullWidth = _ref.fullWidth, fullWidth = _ref$fullWidth === void 0 ? false : _ref$fullWidth,
      _ref$disabled = _ref.disabled, disabled = _ref$disabled === void 0 ? false : _ref$disabled,
      _ref$as = _ref.as, as = _ref$as === void 0 ? 'button' : _ref$as,
      _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style,
      rest = Object.assign({}, _ref);
    ['children','variant','size','icon','iconRight','fullWidth','disabled','as','style'].forEach(function(k){delete rest[k];});

    var Tag = as;
    var sizes = {
      sm: { padding: '0 16px', height: 36, fontSize: 11 },
      md: { padding: '0 24px', height: 46, fontSize: 12 },
      lg: { padding: '0 36px', height: 56, fontSize: 13 },
    };
    var s = sizes[size] || sizes.md;

    var base = {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      height: s.height, padding: s.padding, width: fullWidth ? '100%' : 'auto',
      fontFamily: 'var(--font-sans)', fontSize: s.fontSize, fontWeight: 'var(--fw-medium)',
      textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', lineHeight: 1,
      whiteSpace: 'nowrap', borderRadius: 'var(--radius-2)', border: '1px solid transparent',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
      transition: 'background var(--dur) var(--ease-out), border-color var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out), color var(--dur) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
      userSelect: 'none', WebkitTapHighlightColor: 'transparent',
    };
    var variants = {
      primary:   { background: 'var(--action)',      borderColor: 'var(--action)',       color: 'var(--rv-text-on-purple)' },
      secondary: { background: 'transparent',        borderColor: 'var(--border-strong)', color: 'var(--text-heading)' },
      ghost:     { background: 'transparent',        borderColor: 'transparent',          color: 'var(--text-body)' },
    };
    var hovers = {
      primary:   { background: 'var(--action-hover)', borderColor: 'var(--action-hover)', boxShadow: 'var(--glow-md)' },
      secondary: { borderColor: 'var(--action)',       color: 'var(--text-heading)',        boxShadow: 'var(--glow-sm)' },
      ghost:     { color: 'var(--text-heading)',        background: 'var(--bg-surface-hover)' },
    };

    var hS = useState(false); var hover = hS[0]; var setHover = hS[1];
    var pS = useState(false); var press = pS[0]; var setPress = pS[1];

    var composed = Object.assign({}, base, variants[variant] || variants.primary,
      hover && !disabled ? hovers[variant] || hovers.primary : null,
      press && !disabled ? { transform: 'translateY(1px)' } : null,
      style);

    return ce(Tag, Object.assign({
      style: composed,
      disabled: Tag === 'button' ? disabled : undefined,
      onMouseEnter: function () { setHover(true); },
      onMouseLeave: function () { setHover(false); setPress(false); },
      onMouseDown:  function () { setPress(true); },
      onMouseUp:    function () { setPress(false); },
    }, rest),
      icon      ? ce('span', { style: { display: 'inline-flex', fontSize: '1.2em' } }, icon)      : null,
      children,
      iconRight  ? ce('span', { style: { display: 'inline-flex', fontSize: '1.2em' } }, iconRight) : null
    );
  }

  /* ── Card ────────────────────────────────────────────────── */
  function Card(_ref) {
    var children = _ref.children,
      _ref$interactive = _ref.interactive, interactive = _ref$interactive === void 0 ? false : _ref$interactive,
      _ref$glow = _ref.glow, glow = _ref$glow === void 0 ? false : _ref$glow,
      _ref$padding = _ref.padding, padding = _ref$padding === void 0 ? 'lg' : _ref$padding,
      _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style,
      rest = Object.assign({}, _ref);
    ['children','interactive','glow','padding','style'].forEach(function(k){delete rest[k];});

    var pads = { none: 0, sm: 16, md: 24, lg: 32, xl: 48 };
    var p = pads[padding] != null ? pads[padding] : 32;
    var hS = useState(false); var hover = hS[0]; var setHover = hS[1];

    var base = Object.assign({
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-3)', padding: p,
      transition: 'border-color var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out), background var(--dur) var(--ease-out), transform var(--dur) var(--ease-out)',
      boxShadow: glow ? 'var(--glow-md)' : 'none',
    },
      interactive ? { cursor: 'pointer' } : null,
      interactive && hover ? { borderColor: 'var(--action)', boxShadow: 'var(--glow-md)', background: 'var(--bg-surface-raised)', transform: 'translateY(-2px)' } : null,
      style);

    return ce('div', Object.assign({
      style: base,
      onMouseEnter: interactive ? function () { setHover(true); }  : undefined,
      onMouseLeave: interactive ? function () { setHover(false); } : undefined,
    }, rest), children);
  }

  /* ── Eyebrow ─────────────────────────────────────────────── */
  function Eyebrow(_ref) {
    var children = _ref.children,
      _ref$marker = _ref.marker, marker = _ref$marker === void 0 ? null : _ref$marker,
      color = _ref.color,
      _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style,
      rest = Object.assign({}, _ref);
    ['children','marker','color','style'].forEach(function(k){delete rest[k];});

    return ce('span', Object.assign({
      style: Object.assign({
        display: 'inline-flex', alignItems: 'center', gap: 12,
        fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-overline)', fontWeight: 'var(--fw-medium)',
        textTransform: 'uppercase', letterSpacing: 'var(--ls-wider)',
        color: color || 'var(--text-faint)',
      }, style),
    }, rest),
      marker != null ? ce('span', { style: { color: 'var(--action)' } }, marker) : null,
      children
    );
  }

  /* ── Badge ───────────────────────────────────────────────── */
  function Badge(_ref) {
    var children = _ref.children,
      _ref$variant = _ref.variant, variant = _ref$variant === void 0 ? 'outline' : _ref$variant,
      _ref$tone = _ref.tone, tone = _ref$tone === void 0 ? 'default' : _ref$tone,
      _ref$dot = _ref.dot, dot = _ref$dot === void 0 ? false : _ref$dot,
      _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style,
      rest = Object.assign({}, _ref);
    ['children','variant','tone','dot','style'].forEach(function(k){delete rest[k];});

    var tones = {
      default: 'var(--rv-purple-400)', success: 'var(--rv-success)',
      warning: 'var(--rv-warning)', danger: 'var(--rv-danger)', neutral: 'var(--text-faint)',
    };
    var c = tones[tone] || tones.default;
    var variants = {
      outline: { background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--text-body)' },
      soft:    { background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.25)', color: c },
      solid:   { background: 'var(--action)', border: '1px solid var(--action)', color: 'var(--rv-text-on-purple)' },
    };

    return ce('span', Object.assign({
      style: Object.assign({
        display: 'inline-flex', alignItems: 'center', gap: 7,
        height: 24, padding: '0 10px',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-overline)', fontWeight: 'var(--fw-medium)',
        textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', lineHeight: 1,
        borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap',
      }, variants[variant] || variants.outline, style),
    }, rest),
      dot ? ce('span', { style: { width: 6, height: 6, borderRadius: '50%', background: c, flexShrink: 0 } }) : null,
      children
    );
  }

  /* ── Input ───────────────────────────────────────────────── */
  function Input(_ref) {
    var label = _ref.label, hint = _ref.hint, error = _ref.error,
      _ref$icon = _ref.icon, icon = _ref$icon === void 0 ? null : _ref$icon,
      id = _ref.id,
      _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style,
      _ref$cs = _ref.containerStyle, containerStyle = _ref$cs === void 0 ? {} : _ref$cs,
      rest = Object.assign({}, _ref);
    ['label','hint','error','icon','id','style','containerStyle'].forEach(function(k){delete rest[k];});

    var fS = useState(false); var focus = fS[0]; var setFocus = fS[1];
    var inputId = id || ('inp-' + Math.random().toString(36).slice(2));
    var origFocus = rest.onFocus; var origBlur = rest.onBlur;
    delete rest.onFocus; delete rest.onBlur;
    var borderColor = error ? 'var(--rv-danger)' : focus ? 'var(--action)' : 'var(--border-strong)';

    return ce('div', { style: Object.assign({ display: 'flex', flexDirection: 'column', gap: 8 }, containerStyle) },
      label ? ce('label', {
        htmlFor: inputId,
        style: { fontSize: 'var(--fs-overline)', fontWeight: 'var(--fw-medium)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', color: 'var(--text-faint)' },
      }, label) : null,
      ce('div', {
        style: {
          display: 'flex', alignItems: 'center', gap: 10, height: 50, padding: '0 16px',
          background: 'var(--bg-surface)', border: '1px solid ' + borderColor,
          borderRadius: 'var(--radius-2)',
          boxShadow: focus && !error ? 'var(--glow-md)' : 'none',
          transition: 'border-color var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out)',
        },
      },
        icon ? ce('span', { style: { color: 'var(--text-faint)', display: 'inline-flex' } }, icon) : null,
        ce('input', Object.assign({
          id: inputId,
          onFocus: function (e) { setFocus(true); origFocus && origFocus(e); },
          onBlur:  function (e) { setFocus(false); origBlur  && origBlur(e); },
          style: Object.assign({
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-heading)', fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-body)', letterSpacing: '0.01em',
          }, style),
        }, rest))
      ),
      error ? ce('span', { style: { fontSize: 'var(--fs-caption)', color: 'var(--rv-danger)' } }, error) :
      hint  ? ce('span', { style: { fontSize: 'var(--fs-caption)', color: 'var(--text-faint)' } }, hint) : null
    );
  }

  /* ── Select ──────────────────────────────────────────────── */
  function Select(_ref) {
    var label = _ref.label, hint = _ref.hint,
      _ref$options = _ref.options, options = _ref$options === void 0 ? [] : _ref$options,
      id = _ref.id,
      _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style,
      _ref$cs = _ref.containerStyle, containerStyle = _ref$cs === void 0 ? {} : _ref$cs,
      rest = Object.assign({}, _ref);
    ['label','hint','options','id','style','containerStyle'].forEach(function(k){delete rest[k];});

    var fS = useState(false); var focus = fS[0]; var setFocus = fS[1];
    var selId = id || ('sel-' + Math.random().toString(36).slice(2));

    return ce('div', { style: Object.assign({ display: 'flex', flexDirection: 'column', gap: 8 }, containerStyle) },
      label ? ce('label', {
        htmlFor: selId,
        style: { fontSize: 'var(--fs-overline)', fontWeight: 'var(--fw-medium)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', color: 'var(--text-faint)' },
      }, label) : null,
      ce('div', { style: { position: 'relative' } },
        ce('select', Object.assign({
          id: selId,
          onFocus: function () { setFocus(true); },
          onBlur:  function () { setFocus(false); },
          style: Object.assign({
            appearance: 'none', WebkitAppearance: 'none', width: '100%', height: 50,
            padding: '0 44px 0 16px', background: 'var(--bg-surface)',
            border: '1px solid ' + (focus ? 'var(--action)' : 'var(--border-strong)'),
            borderRadius: 'var(--radius-2)', boxShadow: focus ? 'var(--glow-md)' : 'none',
            color: 'var(--text-heading)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)',
            cursor: 'pointer', outline: 'none',
            transition: 'border-color var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out)',
          }, style),
        }, rest),
          options.map(function (o) {
            var val = typeof o === 'string' ? o : o.value;
            var lbl = typeof o === 'string' ? o : o.label;
            return ce('option', { key: val, value: val, style: { background: 'var(--rv-surface-2)' } }, lbl);
          })
        ),
        ce('svg', {
          width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none',
          style: { position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
        },
          ce('path', { d: 'M2.5 4.5 L6 8 L9.5 4.5', stroke: 'var(--text-faint)', strokeWidth: '1.4', strokeLinecap: 'square' })
        )
      ),
      hint ? ce('span', { style: { fontSize: 'var(--fs-caption)', color: 'var(--text-faint)' } }, hint) : null
    );
  }

  /* ── Checkbox ────────────────────────────────────────────── */
  function Checkbox(_ref) {
    var checked = _ref.checked, onChange = _ref.onChange,
      _ref$disabled = _ref.disabled, disabled = _ref$disabled === void 0 ? false : _ref$disabled,
      label = _ref.label, id = _ref.id,
      _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style,
      rest = Object.assign({}, _ref);
    ['checked','onChange','disabled','label','id','style'].forEach(function(k){delete rest[k];});

    var cbId = id || ('cb-' + Math.random().toString(36).slice(2));
    var on = !!checked;
    function toggle() { if (!disabled && onChange) onChange(!on); }

    var box = ce('button', Object.assign({
      type: 'button', role: 'checkbox', 'aria-checked': on, id: cbId,
      onClick: toggle, disabled: disabled,
      style: Object.assign({
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 20, height: 20, flexShrink: 0, padding: 0,
        borderRadius: 'var(--radius-1)',
        border: '1px solid ' + (on ? 'var(--action)' : 'var(--border-strong)'),
        background: on ? 'var(--action)' : 'transparent',
        boxShadow: on ? 'var(--glow-sm)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
        transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
      }, style),
    }, rest),
      on ? ce('svg', { width: 11, height: 11, viewBox: '0 0 12 12', fill: 'none' },
        ce('path', { d: 'M2.5 6.2 L5 8.6 L9.5 3.4', stroke: 'var(--rv-titanium)', strokeWidth: '1.6', strokeLinecap: 'square', strokeLinejoin: 'miter' })
      ) : null
    );

    if (!label) return box;
    return ce('label', {
      htmlFor: cbId,
      style: { display: 'inline-flex', alignItems: 'center', gap: 12, cursor: disabled ? 'not-allowed' : 'pointer' },
    }, box, ce('span', { style: { color: 'var(--text-body)', fontSize: 'var(--fs-body-sm)' } }, label));
  }

  /* ── Switch ──────────────────────────────────────────────── */
  function Switch(_ref) {
    var checked = _ref.checked, onChange = _ref.onChange,
      _ref$disabled = _ref.disabled, disabled = _ref$disabled === void 0 ? false : _ref$disabled,
      label = _ref.label, id = _ref.id,
      _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style,
      rest = Object.assign({}, _ref);
    ['checked','onChange','disabled','label','id','style'].forEach(function(k){delete rest[k];});

    var switchId = id || ('sw-' + Math.random().toString(36).slice(2));
    var on = !!checked;
    function toggle() { if (!disabled && onChange) onChange(!on); }

    var control = ce('button', Object.assign({
      type: 'button', role: 'switch', 'aria-checked': on, id: switchId,
      onClick: toggle, disabled: disabled,
      style: Object.assign({
        position: 'relative', width: 46, height: 26, flexShrink: 0, padding: 0,
        borderRadius: 'var(--radius-pill)',
        border: '1px solid ' + (on ? 'var(--action)' : 'var(--border-strong)'),
        background: on ? 'var(--action)' : 'transparent',
        boxShadow: on ? 'var(--glow-md)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
        transition: 'background var(--dur) var(--ease-out), border-color var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out)',
      }, style),
    }, rest),
      ce('span', {
        style: {
          position: 'absolute', top: '50%', left: on ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: on ? 'var(--rv-titanium)' : 'var(--text-faint)',
          transform: 'translateY(-50%)',
          transition: 'left var(--dur) var(--ease-out), background var(--dur) var(--ease-out)',
        },
      })
    );

    if (!label) return control;
    return ce('label', {
      htmlFor: switchId,
      style: { display: 'inline-flex', alignItems: 'center', gap: 12, cursor: disabled ? 'not-allowed' : 'pointer' },
    }, control, ce('span', { style: { color: 'var(--text-body)', fontSize: 'var(--fs-body-sm)' } }, label));
  }

  /* ── Tabs ────────────────────────────────────────────────── */
  function Tabs(_ref) {
    var _ref$tabs = _ref.tabs, tabs = _ref$tabs === void 0 ? [] : _ref$tabs,
      value = _ref.value, onChange = _ref.onChange,
      _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style,
      rest = Object.assign({}, _ref);
    ['tabs','value','onChange','style'].forEach(function(k){delete rest[k];});

    var active = value != null ? value : (tabs[0] && tabs[0].id);
    return ce('div', Object.assign({
      role: 'tablist',
      style: Object.assign({ display: 'inline-flex', gap: 4, borderBottom: '1px solid var(--border)' }, style),
    }, rest),
      tabs.map(function (t) {
        var on = t.id === active;
        return ce('button', {
          key: t.id, role: 'tab', 'aria-selected': on,
          onClick: function () { onChange && onChange(t.id); },
          style: {
            position: 'relative', padding: '14px 18px', background: 'transparent', border: 'none',
            cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-overline)',
            fontWeight: 'var(--fw-medium)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)',
            color: on ? 'var(--text-heading)' : 'var(--text-faint)',
            transition: 'color var(--dur) var(--ease-out)',
          },
        },
          t.label,
          ce('span', {
            style: {
              position: 'absolute', left: 0, right: 0, bottom: -1, height: 1,
              background: 'var(--action)', boxShadow: 'var(--glow-md)',
              opacity: on ? 1 : 0, transition: 'opacity var(--dur) var(--ease-out)',
            },
          })
        );
      })
    );
  }

  /* ── Logo ────────────────────────────────────────────────── */
  function Logo(_ref) {
    var _ref$layout = _ref.layout, layout = _ref$layout === void 0 ? 'horizontal' : _ref$layout,
      _ref$iconSrc = _ref.iconSrc, iconSrc = _ref$iconSrc === void 0 ? null : _ref$iconSrc,
      _ref$size = _ref.size, size = _ref$size === void 0 ? 'md' : _ref$size,
      _ref$showStudio = _ref.showStudio, showStudio = _ref$showStudio === void 0 ? true : _ref$showStudio,
      _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style,
      rest = Object.assign({}, _ref);
    ['layout','iconSrc','size','showStudio','style'].forEach(function(k){delete rest[k];});

    var sizes = {
      sm: { raven: 13, studio: 7, icon: 22, gap: 12 },
      md: { raven: 18, studio: 9, icon: 30, gap: 16 },
      lg: { raven: 26, studio: 12, icon: 44, gap: 20 },
    };
    var s = sizes[size] || sizes.md;
    var vertical = layout === 'vertical';

    var word = ce('span', { style: { display: 'inline-flex', flexDirection: 'column', lineHeight: 1, alignItems: vertical ? 'center' : 'flex-start' } },
      ce('span', {
        style: {
          fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-medium)', fontSize: s.raven,
          letterSpacing: '0.4em', textIndent: '0.4em', color: 'var(--rv-titanium)', textTransform: 'uppercase',
        },
      }, 'Ravenn'),
      showStudio ? ce('span', {
        style: {
          marginTop: 5, fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-regular)', fontSize: s.studio,
          letterSpacing: '0.55em', textIndent: '0.55em', color: 'var(--text-faint)', textTransform: 'uppercase',
        },
      }, 'Studio') : null
    );

    return ce('span', Object.assign({
      style: Object.assign({ display: 'inline-flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', gap: s.gap }, style),
    }, rest),
      iconSrc ? ce('img', { src: iconSrc, alt: 'Ravenn Studio', style: { height: vertical ? s.icon * 1.4 : s.icon, width: 'auto', display: 'block' } }) : null,
      word
    );
  }

  /* ── Namespace export ────────────────────────────────────── */
  window[NS] = { Button: Button, Card: Card, Eyebrow: Eyebrow, Badge: Badge, Input: Input, Select: Select, Checkbox: Checkbox, Switch: Switch, Tabs: Tabs, Logo: Logo };
})();
