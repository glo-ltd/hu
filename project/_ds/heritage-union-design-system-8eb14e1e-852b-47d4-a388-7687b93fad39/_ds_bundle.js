/* @ds-bundle: {"format":3,"namespace":"HeritageUnionDesignSystem_8eb14e","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Divider","sourcePath":"components/core/Divider.jsx"},{"name":"EyebrowLabel","sourcePath":"components/core/EyebrowLabel.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"b11ddd1afefe","components/core/Button.jsx":"d95bef5e573a","components/core/Card.jsx":"e247897039a6","components/core/Divider.jsx":"2e7453091f98","components/core/EyebrowLabel.jsx":"200fbc4ec73b","components/core/Logo.jsx":"7ae2ef016b49","components/forms/Checkbox.jsx":"6daa63661a0e","components/forms/Input.jsx":"9862ee66574e","components/forms/Select.jsx":"9168eb1b8739","components/forms/Textarea.jsx":"7a936bbe7983","site/Scheduler.jsx":"2e1075f646d6","site/sections.jsx":"1528b7bf824a","ui_kits/website/App.jsx":"bcd1e5f90cfa","ui_kits/website/ApplyPage.jsx":"fcc58389889a","ui_kits/website/CulturalSection.jsx":"f0b69804ee51","ui_kits/website/Footer.jsx":"d814d5d2c3e6","ui_kits/website/Hero.jsx":"82c59ca674e9","ui_kits/website/Nav.jsx":"7304e968600f","ui_kits/website/ProcessSection.jsx":"e82a47b18e66","ui_kits/website/TestimonialSection.jsx":"344e08d8e729","ui_kits/website/ValuesSection.jsx":"9d300f0c3feb","ui_kits/website/icons.jsx":"c17f3608a1af"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.HeritageUnionDesignSystem_8eb14e = window.HeritageUnionDesignSystem_8eb14e || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Heritage Union — Badge / Tag
 * Quiet status & category markers. Outlined or soft-filled, near-square.
 */
function Badge({
  children,
  variant = 'outline',
  // 'outline' | 'gold' | 'burgundy' | 'soft'
  style = {},
  ...rest
}) {
  const variants = {
    outline: {
      background: 'transparent',
      color: 'var(--burgundy-700)',
      border: '1px solid var(--burgundy-300)'
    },
    gold: {
      background: 'var(--gold-100)',
      color: 'var(--gold-700)',
      border: '1px solid var(--gold-300)'
    },
    burgundy: {
      background: 'var(--burgundy-700)',
      color: 'var(--cream-50)',
      border: '1px solid var(--burgundy-700)'
    },
    soft: {
      background: 'var(--cream-200)',
      color: 'var(--ink-700)',
      border: '1px solid transparent'
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontFamily: 'var(--font-text)',
      fontSize: '12px',
      fontWeight: 500,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      padding: '4px 10px',
      borderRadius: 'var(--radius-xs)',
      lineHeight: 1.2,
      ...variants[variant],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Heritage Union — Button
 * Primary actions in Heritage Burgundy; restrained, near-square corners.
 */
function Button({
  children,
  variant = 'primary',
  // 'primary' | 'secondary' | 'ghost' | 'gold'
  size = 'md',
  // 'sm' | 'md' | 'lg'
  as = 'button',
  iconLeft = null,
  iconRight = null,
  disabled = false,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '8px 16px',
      fontSize: '13px'
    },
    md: {
      padding: '13px 26px',
      fontSize: '15px'
    },
    lg: {
      padding: '17px 36px',
      fontSize: '16px'
    }
  };
  const variants = {
    primary: {
      background: 'var(--action-primary)',
      color: 'var(--text-on-brand)',
      border: '1px solid var(--action-primary)'
    },
    secondary: {
      background: 'transparent',
      color: 'var(--burgundy-700)',
      border: '1px solid var(--burgundy-700)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--burgundy-700)',
      border: '1px solid transparent'
    },
    gold: {
      background: 'var(--gold-500)',
      color: 'var(--ink-800)',
      border: '1px solid var(--gold-500)'
    }
  };
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontFamily: 'var(--font-text)',
    fontWeight: 500,
    letterSpacing: '0.02em',
    lineHeight: 1,
    borderRadius: 'var(--radius-xs)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'var(--transition-base)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    ...sizes[size],
    ...variants[variant],
    ...style
  };
  const Tag = as;
  const [hover, setHover] = React.useState(false);
  const hoverStyle = !disabled && hover ? hoverFor(variant) : null;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      ...base,
      ...hoverStyle
    },
    disabled: as === 'button' ? disabled : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest), iconLeft, /*#__PURE__*/React.createElement("span", null, children), iconRight);
}
function hoverFor(variant) {
  switch (variant) {
    case 'primary':
      return {
        background: 'var(--action-primary-hover)',
        borderColor: 'var(--action-primary-hover)'
      };
    case 'secondary':
      return {
        background: 'var(--burgundy-050)'
      };
    case 'ghost':
      return {
        background: 'var(--burgundy-050)'
      };
    case 'gold':
      return {
        background: 'var(--action-accent-hover)',
        borderColor: 'var(--action-accent-hover)'
      };
    default:
      return null;
  }
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Heritage Union — Card
 * Calm editorial surface. White or cream, 4px radius, hairline or soft shadow.
 */
function Card({
  children,
  elevation = 'shadow',
  // 'flat' | 'shadow' | 'border'
  surface = 'white',
  // 'white' | 'cream' | 'ink'
  padding = '28px',
  hover = false,
  style = {},
  ...rest
}) {
  const surfaces = {
    white: {
      background: 'var(--surface-card)',
      color: 'var(--text-body)'
    },
    cream: {
      background: 'var(--cream-50)',
      color: 'var(--text-body)'
    },
    ink: {
      background: 'var(--ink-800)',
      color: 'var(--cream-50)'
    }
  };
  const elevations = {
    flat: {
      boxShadow: 'none',
      border: '1px solid transparent'
    },
    shadow: {
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid transparent'
    },
    border: {
      boxShadow: 'none',
      border: surface === 'ink' ? '1px solid var(--border-on-dark)' : 'var(--hairline)'
    }
  };
  const [h, setH] = React.useState(false);
  const hoverStyle = hover && h ? {
    boxShadow: 'var(--shadow-md)',
    transform: 'translateY(-2px)'
  } : null;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      borderRadius: 'var(--radius-sm)',
      padding,
      transition: 'var(--transition-base)',
      ...surfaces[surface],
      ...elevations[elevation],
      ...hoverStyle,
      ...style
    },
    onMouseEnter: () => hover && setH(true),
    onMouseLeave: () => hover && setH(false)
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Divider.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Heritage Union — Divider
 * Thin rule for section separation. Short gold accent or full hairline.
 */
function Divider({
  variant = 'gold',
  // 'gold' (short accent) | 'hairline' (full) | 'dot'
  align = 'left',
  // 'left' | 'center'
  onDark = false,
  style = {},
  ...rest
}) {
  const lineColor = onDark ? 'var(--border-on-dark)' : 'var(--border-hairline)';
  if (variant === 'dot') {
    return /*#__PURE__*/React.createElement("div", _extends({
      style: {
        textAlign: align,
        color: 'var(--gold-500)',
        letterSpacing: '0.6em',
        ...style
      }
    }, rest), "\xB7\xA0\xB7\xA0\xB7");
  }
  if (variant === 'gold') {
    return /*#__PURE__*/React.createElement("hr", _extends({
      style: {
        width: '48px',
        height: '1px',
        border: 0,
        background: 'var(--gold-500)',
        margin: align === 'center' ? '0 auto' : '0',
        ...style
      }
    }, rest));
  }
  return /*#__PURE__*/React.createElement("hr", _extends({
    style: {
      width: '100%',
      height: '1px',
      border: 0,
      background: lineColor,
      margin: 0,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Divider.jsx", error: String((e && e.message) || e) }); }

// components/core/EyebrowLabel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Heritage Union — EyebrowLabel
 * Gold, uppercase, wide-tracked label that marks section starts.
 * Items joined by middots, the brand's signature separator.
 */
function EyebrowLabel({
  children,
  items = null,
  color,
  align = 'left',
  style = {},
  ...rest
}) {
  const content = items ? items.map((it, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.7,
      margin: '0 0.5em'
    }
  }, "\xB7"), it)) : children;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: 'var(--font-text)',
      fontSize: 'var(--text-eyebrow)',
      fontWeight: 500,
      letterSpacing: 'var(--tracking-eyebrow)',
      textTransform: 'uppercase',
      color: color || 'var(--text-accent)',
      textAlign: align,
      ...style
    }
  }, rest), content);
}
Object.assign(__ds_scope, { EyebrowLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/EyebrowLabel.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Heritage Union — Logo (Union Mark + wordmark lockup)
 * Renders the two-ring mark with the wordmark and optional descriptor.
 * Self-contained SVG so it needs no asset path.
 */
function Logo({
  variant = 'primary',
  // 'primary' (burgundy+gold) | 'reversed' (cream+gold) | 'mark-only'
  showDescriptor = false,
  height = 40,
  style = {},
  ...rest
}) {
  const onDark = variant === 'reversed';
  const ringA = onDark ? 'var(--cream-50)' : 'var(--burgundy-700)';
  const ringB = 'var(--gold-500)';
  const wordColor = onDark ? 'var(--cream-50)' : 'var(--burgundy-700)';
  const descColor = onDark ? 'var(--gold-300)' : 'var(--gold-700)';
  const mark = /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 64 44",
    height: height,
    style: {
      display: 'block',
      flex: 'none'
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "24",
    cy: "22",
    r: "18.5",
    stroke: ringA,
    strokeWidth: "2.4",
    fill: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "40",
    cy: "22",
    r: "18.5",
    stroke: ringB,
    strokeWidth: "2.4",
    fill: "none"
  }));
  if (variant === 'mark-only') {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        display: 'inline-flex',
        ...style
      }
    }, rest), mark);
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: `${height * 0.34}px`,
      ...style
    }
  }, rest), mark, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: `${height * 0.72}px`,
      lineHeight: 1,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: wordColor
    }
  }, "Heritage Union"), showDescriptor && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-text)',
      fontSize: `${Math.max(9, height * 0.24)}px`,
      letterSpacing: '0.26em',
      textTransform: 'uppercase',
      color: descColor
    }
  }, "Companionship \xB7 Marriage \xB7 Family")));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Heritage Union — Checkbox
 * Near-square serif checkbox with burgundy fill when checked.
 */
function Checkbox({
  label,
  checked,
  defaultChecked,
  onChange,
  id,
  style = {},
  ...rest
}) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const on = isControlled ? checked : internal;
  const inputId = id || (label ? `hu-cb-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const toggle = e => {
    if (!isControlled) setInternal(e.target.checked);
    onChange && onChange(e);
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'inline-flex',
      alignItems: 'flex-start',
      gap: '10px',
      cursor: 'pointer',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '20px',
      height: '20px',
      flex: 'none',
      borderRadius: 'var(--radius-xs)',
      border: `1.5px solid ${on ? 'var(--burgundy-700)' : 'var(--burgundy-300)'}`,
      background: on ? 'var(--burgundy-700)' : 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'var(--transition-base)',
      marginTop: '1px'
    }
  }, on && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.2L5 8.7L9.5 3.5",
    stroke: "var(--cream-50)",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: "checkbox",
    checked: on,
    onChange: toggle,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-text)',
      fontSize: '15px',
      color: 'var(--text-body)',
      lineHeight: 1.4
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Heritage Union — Input
 * Quiet serif text field. Hairline border, cream-tinted, gold focus ring.
 */
function Input({
  label,
  hint,
  error,
  id,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? `hu-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '7px',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: labelStyle
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      fontFamily: 'var(--font-text)',
      fontSize: '16px',
      color: 'var(--text-body)',
      background: 'var(--cream-50)',
      border: `1px solid ${error ? 'var(--status-error)' : focus ? 'var(--gold-500)' : 'var(--border-hairline)'}`,
      borderRadius: 'var(--radius-xs)',
      padding: '12px 14px',
      outline: 'none',
      boxShadow: focus ? 'var(--shadow-focus)' : 'none',
      transition: 'var(--transition-base)',
      width: '100%'
    }
  }, rest)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      color: error ? 'var(--status-error)' : 'var(--text-muted)'
    }
  }, error || hint));
}
const labelStyle = {
  fontFamily: 'var(--font-text)',
  fontSize: '13px',
  fontWeight: 500,
  letterSpacing: '0.04em',
  color: 'var(--ink-700)'
};
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Heritage Union — Select
 * Styled native select matching the Input field.
 */
function Select({
  label,
  hint,
  options = [],
  id,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? `hu-sel-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '7px',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: 'var(--font-text)',
      fontSize: '13px',
      fontWeight: 500,
      letterSpacing: '0.04em',
      color: 'var(--ink-700)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: inputId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: 'none',
      WebkitAppearance: 'none',
      fontFamily: 'var(--font-text)',
      fontSize: '16px',
      color: 'var(--text-body)',
      background: 'var(--cream-50)',
      border: `1px solid ${focus ? 'var(--gold-500)' : 'var(--border-hairline)'}`,
      borderRadius: 'var(--radius-xs)',
      padding: '12px 38px 12px 14px',
      outline: 'none',
      boxShadow: focus ? 'var(--shadow-focus)' : 'none',
      transition: 'var(--transition-base)',
      width: '100%',
      cursor: 'pointer'
    }
  }, rest), options.map(o => {
    const value = typeof o === 'string' ? o : o.value;
    const text = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: value,
      value: value
    }, text);
  })), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    style: {
      position: 'absolute',
      right: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 5L7 9L11 5",
    stroke: "var(--burgundy-700)",
    strokeWidth: "1.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      color: 'var(--text-muted)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Heritage Union — Textarea
 * Multi-line field for application notes. Matches Input styling.
 */
function Textarea({
  label,
  hint,
  error,
  id,
  rows = 4,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? `hu-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '7px',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: 'var(--font-text)',
      fontSize: '13px',
      fontWeight: 500,
      letterSpacing: '0.04em',
      color: 'var(--ink-700)'
    }
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: inputId,
    rows: rows,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      fontFamily: 'var(--font-text)',
      fontSize: '16px',
      lineHeight: 1.6,
      color: 'var(--text-body)',
      background: 'var(--cream-50)',
      border: `1px solid ${error ? 'var(--status-error)' : focus ? 'var(--gold-500)' : 'var(--border-hairline)'}`,
      borderRadius: 'var(--radius-xs)',
      padding: '12px 14px',
      outline: 'none',
      boxShadow: focus ? 'var(--shadow-focus)' : 'none',
      transition: 'var(--transition-base)',
      resize: 'vertical',
      width: '100%'
    }
  }, rest)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      color: error ? 'var(--status-error)' : 'var(--text-muted)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// site/Scheduler.jsx
try { (() => {
// Heritage Union — Consultation Scheduler
// On-brand panel: dark context rail + embedded Calendly inline widget (themed to the palette).
function Scheduler() {
  const [vw, setVw] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  React.useEffect(() => {
    const f = () => setVw(window.innerWidth);
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  const mob = vw < 820;

  // Calendly themed to brand tokens: primary = burgundy-800, text = ink, bg = white.
  const calUrl = 'https://calendly.com/james-heritage-union/30min' + '?hide_event_type_details=1&hide_gdpr_banner=1' + '&primary_color=4a2023&text_color=16202e&background_color=ffffff';
  const ref = React.useRef(null);
  React.useEffect(() => {
    let cancelled = false;
    const init = () => {
      if (cancelled || !window.Calendly || !ref.current) return;
      ref.current.innerHTML = '';
      window.Calendly.initInlineWidget({
        url: calUrl,
        parentElement: ref.current
      });
    };
    if (window.Calendly) {
      init();
      return () => {
        cancelled = true;
      };
    }
    let s = document.querySelector('script[src*="assets.calendly.com/assets/external/widget.js"]');
    if (!s) {
      s = document.createElement('script');
      s.src = 'https://assets.calendly.com/assets/external/widget.js';
      s.async = true;
      document.body.appendChild(s);
    }
    s.addEventListener('load', init);
    return () => {
      cancelled = true;
      s && s.removeEventListener('load', init);
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: panelWrap
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: mob ? '1fr' : '0.82fr 1.18fr',
      minHeight: mob ? 0 : 700
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--ink-800)',
      color: 'var(--cream-50)',
      padding: mob ? '36px 26px' : '48px 42px',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hu-eyebrow",
    style: {
      color: 'var(--gold-400)',
      marginBottom: 18
    }
  }, "Free initial consultation"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      color: 'var(--cream-50)',
      fontSize: 32,
      lineHeight: 1.1,
      margin: '0 0 10px'
    }
  }, "A private conversation with the founder."), /*#__PURE__*/React.createElement("hr", {
    style: {
      width: 48,
      height: 1,
      border: 0,
      background: 'var(--gold-500)',
      margin: '8px 0 24px'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--ink-200)',
      fontSize: 15.5,
      lineHeight: 1.7,
      margin: '0 0 28px'
    }
  }, "Thirty unhurried minutes with James to understand your hopes and answer your questions \u2014 discreet, considered, and entirely without obligation."), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, [['Clock', '30 minutes, by private video call'], ['Lock', 'Confidential from the first word'], ['UserRound', 'Directly with our founder, James'], ['HeartHandshake', 'No obligation, no pressure']].map(([ic, label]) => /*#__PURE__*/React.createElement("li", {
    key: label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13
    }
  }, /*#__PURE__*/React.createElement(SIcon, {
    name: ic
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: 'var(--cream-50)'
    }
  }, label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: mob ? 28 : 'auto',
      paddingTop: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontSize: 18,
      color: 'var(--gold-300)',
      lineHeight: 1.4
    }
  }, "\u201CSelective, screened and guided every step of the way.\u201D"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      fontSize: 13,
      color: 'var(--ink-200)'
    }
  }, "Prefer to write first? ", /*#__PURE__*/React.createElement("a", {
    href: "mailto:team@heritage-union.com",
    style: {
      color: 'var(--gold-300)',
      borderBottom: '1px solid rgba(216,192,136,0.4)'
    }
  }, "team@heritage-union.com")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--white)',
      padding: mob ? '4px' : '6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: "calendly-inline-widget",
    "data-url": calUrl,
    style: {
      minWidth: 320,
      width: '100%',
      height: mob ? 1040 : 700
    }
  }))));
}
const panelWrap = {
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-lg)',
  border: '1px solid var(--cream-200)',
  background: 'var(--white)'
};
function SIcon({
  name
}) {
  const data = window.lucide && window.lucide[name];
  if (!data) return null;
  const kids = Array.isArray(data) ? data : data.children || [];
  return /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--gold-400)",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flex: 'none'
    }
  }, kids.map(([t, a], i) => React.createElement(t, {
    key: i,
    ...a
  })));
}
Object.assign(window, {
  Scheduler
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "site/Scheduler.jsx", error: String((e && e.message) || e) }); }

// site/sections.jsx
try { (() => {
// Heritage Union — Website sections
const HU = () => window.HeritageUnionDesignSystem_8eb14e;

// Viewport hook — drives responsive layout (inline styles can't use media queries)
function useVW() {
  const [w, setW] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  React.useEffect(() => {
    const f = () => setW(window.innerWidth);
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return w;
}
function LucideIcon({
  name,
  size = 24,
  color = 'currentColor',
  sw = 1.5,
  style = {}
}) {
  const data = window.lucide && window.lucide[name];
  if (!data) return null;
  const kids = Array.isArray(data) ? data : data.children || [];
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: style,
    "aria-hidden": "true"
  }, kids.map(([t, a], i) => React.createElement(t, {
    key: i,
    ...a
  })));
}
const scrollToBook = () => {
  const el = document.getElementById('book');
  if (el) window.scrollTo({
    top: el.getBoundingClientRect().top + window.pageYOffset - 16,
    behavior: 'smooth'
  });
};
const goTo = (id, off = 70) => {
  const el = document.getElementById(id);
  if (el) window.scrollTo({
    top: el.getBoundingClientRect().top + window.pageYOffset - off,
    behavior: 'smooth'
  });
};

// Shared horizontal rhythm. G = page gutter; EDGE aligns full-bleed split sections
// (hero, Vietnam) to the same content edge as the centered 1280px sections.
const G = 'clamp(24px, 5vw, 40px)';
const EDGE = `max(${G}, calc((100vw - 1280px) / 2))`;

/* ---------------- Nav ---------------- */
function SiteNav() {
  const {
    Logo,
    Button
  } = HU();
  const vw = useVW();
  const mob = vw < 860;
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.pageYOffset > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links = [['process', 'The Process'], ['vietnam', 'Why Vietnam'], ['story', 'Our Story'], ['faq', 'FAQ']];
  const go = id => {
    setOpen(false);
    goTo(id);
  };
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--cream-100)',
      borderBottom: '1px solid ' + (scrolled || open ? 'var(--cream-300)' : 'transparent'),
      transition: 'border-color 240ms ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: mob ? `14px ${G}` : `16px ${G}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => window.scrollTo({
      top: 0,
      behavior: 'smooth'
    }),
    style: {
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: mob ? 'mark-only' : 'primary',
    height: mob ? 36 : 42
  })), !mob && /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 36
    }
  }, links.map(([id, label]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    onClick: () => go(id),
    style: {
      fontSize: 15,
      letterSpacing: '0.03em',
      color: 'var(--ink-700)',
      cursor: 'pointer'
    },
    onMouseEnter: e => e.currentTarget.style.color = 'var(--burgundy-700)',
    onMouseLeave: e => e.currentTarget.style.color = 'var(--ink-700)'
  }, label)), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    onClick: scrollToBook
  }, "Book a consultation")), mob && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    onClick: scrollToBook
  }, "Book a consultation"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(!open),
    "aria-label": "Menu",
    style: {
      background: 'none',
      border: 0,
      padding: 6,
      cursor: 'pointer',
      color: 'var(--burgundy-700)'
    }
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: open ? 'X' : 'Menu',
    size: 26,
    color: "var(--burgundy-700)"
  }))))), mob && open && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `8px ${G} 22px`,
      borderTop: '1px solid var(--cream-200)'
    }
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      maxWidth: 1280,
      margin: '0 auto'
    }
  }, links.map(([id, label]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    onClick: () => go(id),
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 22,
      color: 'var(--burgundy-700)',
      cursor: 'pointer',
      padding: '8px 0'
    }
  }, label)))));
}

/* ---------------- Hero ---------------- */
function SiteHero() {
  const {
    EyebrowLabel,
    Button
  } = HU();
  const vw = useVW();
  const mob = vw < 900;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'grid',
      gridTemplateColumns: mob ? '1fr' : '1fr 1fr',
      minHeight: mob ? 0 : 660,
      background: 'var(--cream-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: mob ? `48px ${G} 40px` : `48px clamp(40px, 4vw, 72px) 48px ${EDGE}`,
      order: mob ? 2 : 1
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    items: ['Companionship', 'Marriage', 'Family'],
    style: {
      marginBottom: mob ? 18 : 26
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      color: 'var(--text-strong)',
      fontSize: 'clamp(40px, 9vw, 78px)',
      lineHeight: 1.06,
      letterSpacing: '-0.015em',
      margin: '0 0 24px',
      maxWidth: '13ch'
    }
  }, "A union built to last generations."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'clamp(17px, 2.4vw, 20px)',
      lineHeight: 1.65,
      color: 'var(--ink-700)',
      fontWeight: 300,
      maxWidth: '46ch',
      margin: '0 0 34px'
    }
  }, "For the man entering a meaningful chapter who wants more than company \u2014 a partner, a family, a legacy worth building with care."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: mob ? 20 : 28,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: scrollToBook,
    style: mob ? {
      width: '100%'
    } : {}
  }, "Schedule a free consultation"), /*#__PURE__*/React.createElement("a", {
    onClick: () => goTo('process'),
    style: {
      fontSize: 16,
      color: 'var(--burgundy-700)',
      borderBottom: '1px solid var(--burgundy-700)',
      paddingBottom: 2,
      cursor: 'pointer'
    }
  }, "How it works")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: mob ? 22 : 30,
      marginTop: mob ? 36 : 48,
      flexWrap: 'wrap'
    }
  }, [['Trust-led', 'process, not access'], ['Selective', 'by application only'], ['Discreet', 'from first word']].map(([a, b]) => /*#__PURE__*/React.createElement("div", {
    key: a
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 22,
      color: 'var(--burgundy-700)'
    }
  }, a), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, b))))), /*#__PURE__*/React.createElement("div", {
    style: {
      order: mob ? 1 : 2,
      minHeight: mob ? 320 : 'auto',
      backgroundImage: 'url(../assets/images/lifestyle-04.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center 20%'
    }
  }));
}

/* ---------------- Trust / why apps fail ---------------- */
function TrustSection() {
  const {
    EyebrowLabel
  } = HU();
  const vw = useVW();
  const cols = vw < 680 ? 1 : vw < 1040 ? 2 : 4;
  const points = [['ShieldCheck', 'Trust before introductions', 'Every client and candidate is screened. You will always know the process is handled with integrity and care.'], ['EyeOff', 'Discretion as standard', 'Calm, mature and confidential from the first conversation. Nothing about this is loud or sales-driven.'], ['Globe', 'Cultural understanding', 'A lasting international union asks for more than attraction. We guide communication, expectations and culture.'], ['HeartHandshake', 'Built for the long term', 'Companionship, marriage, family and legacy — grounded and real. Never a catalogue, never a transaction.']];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--ink-800)',
      color: 'var(--cream-50)',
      padding: 'clamp(64px, 9vw, 100px) clamp(24px, 5vw, 40px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 780
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    color: "var(--gold-400)",
    style: {
      marginBottom: 18
    }
  }, "The market chased scale. We restore trust."), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      color: 'var(--cream-50)',
      fontSize: 'clamp(34px, 6vw, 46px)',
      lineHeight: 1.05,
      margin: '0 0 18px'
    }
  }, "A consultancy, not a dating app."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'clamp(17px, 2.4vw, 19px)',
      lineHeight: 1.7,
      color: 'var(--ink-200)',
      fontWeight: 300,
      margin: 0
    }
  }, "Apps offer access, scale and convenience \u2014 but strip out trust, screening, guidance and cultural understanding. Heritage Union restores the human layer that serious relationships require.")), /*#__PURE__*/React.createElement("hr", {
    style: {
      width: 48,
      height: 1,
      border: 0,
      background: 'var(--gold-500)',
      margin: 'clamp(36px,5vw,44px) 0 clamp(40px,5vw,52px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 'clamp(32px, 4vw, 44px)'
    }
  }, points.map(([ic, t, b]) => /*#__PURE__*/React.createElement("div", {
    key: t
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: ic,
    size: 30,
    color: "var(--gold-400)",
    sw: 1.25
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      color: 'var(--cream-50)',
      fontSize: 24,
      margin: '18px 0 10px',
      lineHeight: 1.15
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      lineHeight: 1.7,
      color: 'var(--ink-200)',
      margin: 0
    }
  }, b))))));
}

/* ---------------- Process ---------------- */
function ProcessSection() {
  const {
    EyebrowLabel,
    Card
  } = HU();
  const vw = useVW();
  const cols = vw < 760 ? 1 : 2;
  const steps = [['01', 'A private conversation', 'We begin with a free, discreet consultation to understand your hopes, your circumstances and what a meaningful future looks like for you.'], ['02', 'Selective acceptance', 'Not every enquiry becomes a client. We accept those who are serious — which protects the integrity of the process for everyone involved.'], ['03', 'Considered introductions', 'With local Vietnamese expertise, we introduce screened candidates chosen for genuine, long-term compatibility. Never a catalogue of profiles.'], ['04', 'Guided, every step', 'Cultural guidance and concierge support continue throughout — discreet from first conversation to lasting marriage.']];
  return /*#__PURE__*/React.createElement("section", {
    id: "process",
    style: {
      background: 'var(--cream-100)',
      padding: 'clamp(64px, 9vw, 100px) clamp(24px, 5vw, 40px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 720,
      marginBottom: 'clamp(36px, 5vw, 50px)'
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    style: {
      marginBottom: 18
    }
  }, "The Process"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      color: 'var(--text-strong)',
      fontSize: 'clamp(32px, 6vw, 46px)',
      lineHeight: 1.05,
      margin: '0 0 16px'
    }
  }, "Trust-led, from first conversation to lasting marriage."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'clamp(17px, 2.4vw, 19px)',
      lineHeight: 1.7,
      color: 'var(--ink-700)',
      fontWeight: 300,
      margin: 0
    }
  }, "A serious process for serious intentions \u2014 built around the long term, never the transaction.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 24
    }
  }, steps.map(([n, t, b]) => /*#__PURE__*/React.createElement(Card, {
    key: n,
    surface: "white",
    elevation: "border",
    padding: "clamp(28px, 4vw, 36px) clamp(26px, 4vw, 38px)",
    hover: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 42,
      color: 'var(--gold-600)',
      lineHeight: 1,
      marginBottom: 16
    }
  }, n), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      color: 'var(--text-strong)',
      fontSize: 'clamp(24px, 3vw, 28px)',
      margin: '0 0 10px'
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      lineHeight: 1.7,
      color: 'var(--ink-700)',
      margin: 0
    }
  }, b))))));
}

/* ---------------- Vietnam ---------------- */
function VietnamSection() {
  const {
    EyebrowLabel,
    Button
  } = HU();
  const vw = useVW();
  const mob = vw < 900;
  return /*#__PURE__*/React.createElement("section", {
    id: "vietnam",
    style: {
      background: 'var(--cream-50)',
      display: 'grid',
      gridTemplateColumns: mob ? '1fr' : '1fr 1fr',
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      order: mob ? 1 : 1,
      minHeight: mob ? 300 : 600,
      backgroundImage: 'url(../assets/images/lifestyle-01.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      order: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: mob ? `56px ${G}` : `96px ${EDGE} 96px clamp(40px, 4vw, 72px)`
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    style: {
      marginBottom: 18
    }
  }, "Why Vietnam"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      color: 'var(--text-strong)',
      fontSize: 'clamp(32px, 6vw, 46px)',
      lineHeight: 1.05,
      margin: '0 0 18px',
      maxWidth: '14ch'
    }
  }, "A trusted cultural bridge."), /*#__PURE__*/React.createElement("hr", {
    style: {
      width: 48,
      height: 1,
      border: 0,
      background: 'var(--gold-500)',
      margin: '0 0 28px'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 18,
      lineHeight: 1.75,
      color: 'var(--ink-700)',
      margin: '0 0 18px',
      maxWidth: '48ch'
    }
  }, "International relationships ask for more than attraction. They ask for cultural awareness, honest communication and carefully managed expectations."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 18,
      lineHeight: 1.75,
      color: 'var(--ink-700)',
      margin: '0 0 34px',
      maxWidth: '48ch'
    }
  }, "Through genuine local Vietnamese expertise, we offer the human layer the technology-led platforms have removed \u2014 values of loyalty, family and warmth that endure."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "md",
    onClick: scrollToBook
  }, "Talk it through with us"))));
}

/* ---------------- Founder's note / story ---------------- */
function StorySection() {
  const {
    EyebrowLabel
  } = HU();
  return /*#__PURE__*/React.createElement("section", {
    id: "story",
    style: {
      background: 'var(--cream-100)',
      padding: 'clamp(64px, 9vw, 100px) clamp(24px, 5vw, 40px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 920,
      margin: '0 auto',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    align: "center",
    style: {
      marginBottom: 22
    }
  }, "Our Story"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 400,
      fontSize: 'clamp(25px, 4.5vw, 34px)',
      lineHeight: 1.35,
      color: 'var(--text-strong)',
      margin: '0 0 28px'
    }
  }, "We built Heritage Union for the man who has reached a meaningful moment and wants something worth keeping \u2014 and for the women who deserve to be met with the same respect and seriousness."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'clamp(17px, 2.4vw, 18px)',
      lineHeight: 1.8,
      color: 'var(--ink-700)',
      maxWidth: '62ch',
      margin: '0 auto 36px'
    }
  }, "Where the rest of the category sells access, we offer permanence: a selective, trust-led path toward marriage, companionship and family. Every introduction is considered. Every client is guided. Nothing is left to chance."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontSize: 24,
      color: 'var(--burgundy-700)'
    }
  }, "Huyen & James"), /*#__PURE__*/React.createElement("div", {
    className: "hu-eyebrow"
  }, "Founders \xB7 Vietnam & the West"))));
}

/* ---------------- Promise quote ---------------- */
function PromiseBand() {
  const {
    Logo
  } = HU();
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--burgundy-700)',
      color: 'var(--cream-50)',
      padding: 'clamp(72px, 10vw, 108px) clamp(24px, 5vw, 40px)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 900,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "mark-only",
    height: 40,
    style: {
      justifyContent: 'center',
      marginBottom: 34
    }
  }), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 400,
      fontSize: 'clamp(26px, 4.6vw, 40px)',
      lineHeight: 1.3,
      color: 'var(--cream-50)',
      margin: '0 0 30px'
    }
  }, "\u201CWe are not selling access to profiles. We sell confidence, guidance and cultural understanding \u2014 a credible, premium environment for serious relationship formation.\u201D"), /*#__PURE__*/React.createElement("div", {
    className: "hu-eyebrow",
    style: {
      color: 'var(--gold-300)'
    }
  }, "The Heritage Union promise")));
}

/* ---------------- Testimonials ---------------- */
function Testimonials() {
  const {
    EyebrowLabel,
    Card
  } = HU();
  const vw = useVW();
  const cols = vw < 760 ? 1 : 3;
  const items = [['I had grown tired of apps and shallow conversations. Heritage Union treated my hopes seriously and guided me with real care.', 'D.M.', 'United Kingdom'], ['What reassured me most was the screening and the discretion. It never once felt transactional — it felt human.', 'R.S.', 'United States'], ['The cultural guidance made all the difference. I felt understood, and so did she. We are building a life together now.', 'J.A.', 'Australia']];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--cream-50)',
      padding: 'clamp(64px, 9vw, 100px) clamp(24px, 5vw, 40px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      maxWidth: 720,
      margin: '0 auto clamp(36px,5vw,50px)'
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    align: "center",
    style: {
      marginBottom: 18
    }
  }, "In their words"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      color: 'var(--text-strong)',
      fontSize: 'clamp(32px, 6vw, 44px)',
      lineHeight: 1.05,
      margin: 0
    }
  }, "Quiet confidence, earned.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 24
    }
  }, items.map(([quote, who, where]) => /*#__PURE__*/React.createElement(Card, {
    key: who,
    surface: "white",
    elevation: "shadow",
    padding: "34px 34px"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--gold-500)',
      fontFamily: 'var(--font-display)',
      fontSize: 48,
      lineHeight: 0.6,
      height: 24
    }
  }, "\u201C"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontSize: 21,
      lineHeight: 1.5,
      color: 'var(--text-strong)',
      margin: '6px 0 22px'
    }
  }, quote), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-text)',
      fontSize: 14,
      letterSpacing: '0.04em',
      color: 'var(--ink-700)'
    }
  }, who, " \xB7 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, where))))), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      fontSize: 13,
      color: 'var(--text-muted)',
      marginTop: 28
    }
  }, "Initials used to protect client privacy.")));
}

/* ---------------- FAQ ---------------- */
function FAQ() {
  const {
    EyebrowLabel
  } = HU();
  const faqs = [['Is the first consultation really free?', 'Yes. The initial consultation is a free, no-obligation conversation — thirty private minutes to understand your hopes and answer your questions. There is no pressure to proceed.'], ['How is this different from a dating app or agency?', 'We are a consultancy, not a platform. There is no database to browse and no catalogue of profiles. We screen, guide and introduce — selectively and with discretion — toward genuine long-term outcomes.'], ['Who do you accept as clients?', 'We work with serious, financially established men seeking marriage, companionship and family. Acceptance is selective, which protects the integrity of the process for everyone involved.'], ['How are candidates screened?', 'Both clients and candidates are carefully screened. Our local Vietnamese expertise allows us to assess intention, character and long-term compatibility before any introduction is made.'], ['Is my enquiry confidential?', 'Entirely. Discretion is central to how we work — your details are never shared, and every conversation is held in strict confidence from the first word.']];
  const [open, setOpen] = React.useState(0);
  return /*#__PURE__*/React.createElement("section", {
    id: "faq",
    style: {
      background: 'var(--cream-100)',
      padding: 'clamp(64px, 9vw, 100px) clamp(24px, 5vw, 40px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 'clamp(34px,5vw,48px)'
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    align: "center",
    style: {
      marginBottom: 18
    }
  }, "Questions, answered"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      color: 'var(--text-strong)',
      fontSize: 'clamp(32px, 6vw, 44px)',
      lineHeight: 1.05,
      margin: 0
    }
  }, "Before you apply.")), /*#__PURE__*/React.createElement("div", null, faqs.map(([q, a], i) => {
    const isOpen = open === i;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        borderTop: '1px solid var(--cream-300)'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(isOpen ? -1 : i),
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '22px 4px',
        background: 'none',
        border: 0,
        cursor: 'pointer',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(20px, 3.4vw, 24px)',
        color: 'var(--text-strong)'
      }
    }, q), /*#__PURE__*/React.createElement(LucideIcon, {
      name: isOpen ? 'Minus' : 'Plus',
      size: 22,
      color: "var(--burgundy-700)",
      style: {
        flex: 'none'
      }
    })), isOpen && /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 17,
        lineHeight: 1.75,
        color: 'var(--ink-700)',
        margin: '0 4px 26px',
        maxWidth: '64ch'
      }
    }, a));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--cream-300)'
    }
  }))));
}

/* ---------------- Booking section ---------------- */
function BookingSection() {
  const {
    EyebrowLabel
  } = HU();
  return /*#__PURE__*/React.createElement("section", {
    id: "book",
    style: {
      background: 'var(--cream-50)',
      padding: `clamp(64px, 9vw, 100px) ${G}`,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'url(../assets/images/lifestyle-03.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center 30%',
      opacity: 0.16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 1280,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      maxWidth: 760,
      margin: '0 auto clamp(34px,5vw,46px)'
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    align: "center",
    style: {
      marginBottom: 18
    }
  }, "Apply for a private consultation"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      color: 'var(--text-strong)',
      fontSize: 'clamp(36px, 7vw, 52px)',
      lineHeight: 1.02,
      margin: '0 0 16px'
    }
  }, "Build something that lasts."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'clamp(17px, 2.6vw, 20px)',
      lineHeight: 1.7,
      color: 'var(--ink-700)',
      fontWeight: 300,
      margin: 0
    }
  }, "A free, no-obligation conversation with our founder. Choose a time that suits you \u2014 discreet, considered and entirely confidential.")), /*#__PURE__*/React.createElement(Scheduler, null)));
}

/* ---------------- Footer ---------------- */
function SiteFooter() {
  const {
    Logo,
    Button
  } = HU();
  const vw = useVW();
  const cols = vw < 760 ? '1fr' : '1.4fr 1fr 1fr';
  const links = [['The Process', 'process'], ['Why Vietnam', 'vietnam'], ['Our Story', 'story'], ['FAQ', 'faq']];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--ink-900)',
      color: 'var(--cream-50)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `clamp(56px,8vw,80px) ${G} clamp(40px,6vw,56px)`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: cols,
      gap: 'clamp(36px, 5vw, 56px)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Logo, {
    variant: "reversed",
    height: 34,
    showDescriptor: true
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--ink-200)',
      fontSize: 16,
      lineHeight: 1.7,
      maxWidth: '38ch',
      margin: '24px 0 24px'
    }
  }, "A premium international relationship and family-formation consultancy. A serious consultancy for serious men."), /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    onClick: scrollToBook
  }, "Schedule a free consultation")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hu-eyebrow",
    style: {
      color: 'var(--gold-300)',
      marginBottom: 18
    }
  }, "Heritage Union"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, links.map(([l, id]) => /*#__PURE__*/React.createElement("a", {
    key: l,
    onClick: () => goTo(id),
    style: {
      color: 'var(--ink-200)',
      fontSize: 15,
      cursor: 'pointer'
    }
  }, l)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hu-eyebrow",
    style: {
      color: 'var(--gold-300)',
      marginBottom: 18
    }
  }, "Contact"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "mailto:team@heritage-union.com",
    style: {
      color: 'var(--ink-200)',
      fontSize: 15
    }
  }, "team@heritage-union.com"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-400)',
      fontSize: 15
    }
  }, "heritage-union.com"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-400)',
      fontSize: 15
    }
  }, "By application only"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-on-dark)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `24px ${G}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-400)',
      fontSize: 13,
      letterSpacing: '0.04em'
    }
  }, "\xA9 2026 Heritage Union \xB7 Private & Confidential"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-400)',
      fontSize: 13,
      letterSpacing: '0.04em'
    }
  }, "Web Design by ", /*#__PURE__*/React.createElement("a", {
    href: "https://generateleads.online/",
    target: "_blank",
    rel: "noopener",
    style: {
      color: 'var(--gold-300)',
      borderBottom: '1px solid rgba(216,192,136,0.4)'
    }
  }, "GLO"))))));
}
Object.assign(window, {
  SiteNav,
  SiteHero,
  TrustSection,
  ProcessSection,
  VietnamSection,
  StorySection,
  PromiseBand,
  Testimonials,
  FAQ,
  BookingSection,
  SiteFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "site/sections.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/App.jsx
try { (() => {
// Heritage Union — Process page header + body
function ProcessPage() {
  const {
    EyebrowLabel,
    Button
  } = window.HeritageUnionDesignSystem_8eb14e;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--cream-50)',
      padding: '90px 80px 70px',
      textAlign: 'center',
      borderBottom: '1px solid var(--cream-200)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '820px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    align: "center",
    style: {
      marginBottom: '20px'
    }
  }, "How it works"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: '64px',
      lineHeight: 1.02,
      margin: '0 0 22px'
    }
  }, "A serious process, for serious intentions."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '20px',
      fontWeight: 300,
      lineHeight: 1.7,
      color: 'var(--ink-700)',
      margin: 0
    }
  }, "Selective, screened and guided every step of the way \u2014 built around the long term, never the transaction."))), window.ProcessSection ? React.createElement(window.ProcessSection, {
    compact: true
  }) : null, window.ValuesSection ? React.createElement(window.ValuesSection) : null);
}

// Root app with simple client-side routing
function App() {
  const [route, setRoute] = React.useState('home');
  const onNavigate = r => {
    const map = {
      story: 'home',
      vietnam: 'home'
    };
    setRoute(map[r] || r);
    window.scrollTo({
      top: 0,
      left: 0
    });
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Nav, {
    route: route,
    onNavigate: onNavigate
  }), route === 'home' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Hero, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(ValuesSection, null), /*#__PURE__*/React.createElement(ProcessSection, null), /*#__PURE__*/React.createElement(CulturalSection, null), /*#__PURE__*/React.createElement(TestimonialSection, null), /*#__PURE__*/React.createElement(Footer, {
    onNavigate: onNavigate
  })), route === 'process' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ProcessPage, null), /*#__PURE__*/React.createElement(Footer, {
    onNavigate: onNavigate
  })), route === 'apply' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ApplyPage, null), /*#__PURE__*/React.createElement(Footer, {
    onNavigate: onNavigate
  })));
}
Object.assign(window, {
  App,
  ProcessPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ApplyPage.jsx
try { (() => {
// Heritage Union — Apply page (interactive multi-step application funnel)
function ApplyPage() {
  const {
    EyebrowLabel,
    Divider,
    Button,
    Input,
    Select,
    Textarea,
    Checkbox,
    Card,
    Logo
  } = window.HeritageUnionDesignSystem_8eb14e;
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    name: '',
    email: '',
    country: 'United States',
    age: '50–55',
    notes: '',
    consent: false
  });
  const set = k => e => setData(d => ({
    ...d,
    [k]: e.target.value
  }));
  const steps = ['About you', 'Your hopes', 'Confirm'];
  if (step === 3) {
    return /*#__PURE__*/React.createElement("section", {
      style: {
        background: 'var(--cream-100)',
        minHeight: '720px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px'
      }
    }, /*#__PURE__*/React.createElement(Card, {
      surface: "white",
      elevation: "shadow",
      padding: "60px 64px",
      style: {
        maxWidth: '620px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement(Logo, {
      variant: "mark-only",
      height: 44,
      style: {
        justifyContent: 'center',
        marginBottom: '28px'
      }
    }), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: '40px',
        margin: '0 0 16px'
      }
    }, "Thank you, ", data.name ? data.name.split(' ')[0] : 'and welcome', "."), /*#__PURE__*/React.createElement(Divider, {
      align: "center",
      style: {
        margin: '0 auto 24px'
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: '18px',
        lineHeight: 1.7,
        color: 'var(--ink-700)',
        margin: '0 0 8px'
      }
    }, "Your application has been received in confidence. A member of our team will reply within two business days to arrange a private consultation."), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: '15px',
        color: 'var(--text-muted)',
        margin: '20px 0 0'
      }
    }, "Discreet from first conversation to lasting marriage.")));
  }
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--cream-100)',
      minHeight: '720px',
      padding: '70px 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '720px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    style: {
      marginBottom: '16px'
    }
  }, "Private application"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: '48px',
      margin: '0 0 10px'
    }
  }, "Apply for a consultation."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '18px',
      color: 'var(--ink-700)',
      lineHeight: 1.7,
      margin: '0 0 30px',
      maxWidth: '52ch'
    }
  }, "Not for everyone \u2014 and that is the point. A few details begin a discreet, no-obligation conversation."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      marginBottom: '40px'
    }
  }, steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s,
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '3px',
      background: i <= step ? 'var(--gold-500)' : 'var(--cream-300)',
      borderRadius: '2px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '8px',
      fontFamily: 'var(--font-text)',
      fontSize: '12px',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: i <= step ? 'var(--burgundy-700)' : 'var(--text-muted)'
    }
  }, String(i + 1).padStart(2, '0'), " \xB7 ", s)))), /*#__PURE__*/React.createElement(Card, {
    surface: "white",
    elevation: "border",
    padding: "40px 44px"
  }, step === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '22px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Full name",
    placeholder: "Your name",
    value: data.name,
    onChange: set('name'),
    style: {
      gridColumn: '1 / -1'
    }
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    value: data.email,
    onChange: set('email'),
    style: {
      gridColumn: '1 / -1'
    }
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Where are you based?",
    options: ['United States', 'United Kingdom', 'Australia', 'Other'],
    value: data.country,
    onChange: set('country')
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Age range",
    options: ['50–55', '56–60', '61+'],
    value: data.age,
    onChange: set('age')
  })), step === 1 && /*#__PURE__*/React.createElement(Textarea, {
    label: "What are you hoping for?",
    rows: 6,
    placeholder: "A partner, a family, a fresh chapter \u2014 tell us a little about what matters to you.",
    value: data.notes,
    onChange: set('notes'),
    hint: "A few sentences is plenty \u2014 we'll explore the rest together."
  }), step === 2 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '18px 28px',
      marginBottom: '26px'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Name",
    value: data.name || '—'
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Email",
    value: data.email || '—'
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Based in",
    value: data.country
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Age",
    value: data.age
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Hopes",
    value: data.notes || '—',
    full: true
  })), /*#__PURE__*/React.createElement(Checkbox, {
    label: "I understand this is a selective, application-based process, handled with discretion.",
    checked: data.consent,
    onChange: e => setData(d => ({
      ...d,
      consent: e.target.checked
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '34px'
    }
  }, step > 0 ? /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => setStep(step - 1)
  }, "Back") : /*#__PURE__*/React.createElement("span", null), step < 2 ? /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => setStep(step + 1)
  }, "Continue") : /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    disabled: !data.consent,
    onClick: () => setStep(3)
  }, "Submit application")))));
}
function Field({
  label,
  value,
  full
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: full ? '1 / -1' : 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-text)',
      fontSize: '11px',
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: '5px'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-text)',
      fontSize: '16px',
      color: 'var(--text-body)',
      lineHeight: 1.5
    }
  }, value));
}
Object.assign(window, {
  ApplyPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ApplyPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/CulturalSection.jsx
try { (() => {
// Heritage Union — Cultural / Vietnam section (image + text split on cream-50)
function CulturalSection() {
  const {
    EyebrowLabel,
    Divider,
    Button
  } = window.HeritageUnionDesignSystem_8eb14e;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--cream-50)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundImage: 'url(../../assets/images/couple-vietnam.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '560px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '90px 80px'
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    style: {
      marginBottom: '18px'
    }
  }, "Why Vietnam"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: '46px',
      margin: '0 0 18px',
      maxWidth: '16ch'
    }
  }, "A trusted cultural bridge."), /*#__PURE__*/React.createElement(Divider, {
    style: {
      marginBottom: '28px'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '18px',
      lineHeight: 1.75,
      color: 'var(--ink-700)',
      margin: '0 0 18px',
      maxWidth: '48ch'
    }
  }, "International relationships ask for more than attraction. They ask for cultural awareness, honest communication and carefully managed expectations."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '18px',
      lineHeight: 1.75,
      color: 'var(--ink-700)',
      margin: '0 0 34px',
      maxWidth: '48ch'
    }
  }, "Through local Vietnamese expertise, we offer that human layer \u2014 guidance that the technology-led platforms have removed."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "md"
  }, "Read our founder's story"))));
}
Object.assign(window, {
  CulturalSection
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/CulturalSection.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Footer.jsx
try { (() => {
// Heritage Union — Footer + closing CTA
function Footer({
  onNavigate
}) {
  const {
    Logo,
    Button,
    Divider
  } = window.HeritageUnionDesignSystem_8eb14e;
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--ink-900)',
      color: 'var(--cream-50)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '90px 80px 60px',
      display: 'grid',
      gridTemplateColumns: '1.3fr 1fr',
      gap: '60px',
      alignItems: 'start',
      maxWidth: '1240px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      color: 'var(--cream-50)',
      fontSize: '44px',
      margin: '0 0 20px',
      maxWidth: '16ch'
    }
  }, "Build something that lasts."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--ink-200)',
      fontSize: '18px',
      lineHeight: 1.7,
      maxWidth: '42ch',
      margin: '0 0 30px'
    }
  }, "A serious consultancy for serious men. Apply for a private consultation \u2014 discreet, considered, and entirely confidential."), /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    size: "lg",
    onClick: () => onNavigate('apply')
  }, "Apply for a private consultation")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      justifySelf: 'end'
    }
  }, ['The Process', 'Our Story', 'Vietnam', 'Candidate Screening', 'FAQs', 'Privacy'].map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    style: {
      color: 'var(--ink-200)',
      fontFamily: 'var(--font-text)',
      fontSize: '15px',
      cursor: 'pointer'
    }
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-on-dark)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '26px 80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: '1240px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "reversed",
    height: 26
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-400)',
      fontFamily: 'var(--font-text)',
      fontSize: '13px',
      letterSpacing: '0.04em'
    }
  }, "\xA9 2026 Heritage Union \xB7 Private & Confidential"))));
}
Object.assign(window, {
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Hero.jsx
try { (() => {
// Heritage Union — Homepage hero (split: cream text panel + full-bleed photo)
function Hero({
  onNavigate
}) {
  const {
    EyebrowLabel,
    Button
  } = window.HeritageUnionDesignSystem_8eb14e;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: '620px',
      background: 'var(--cream-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 80px'
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    items: ['Companionship', 'Marriage', 'Family'],
    style: {
      marginBottom: '26px'
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: '76px',
      lineHeight: 0.98,
      letterSpacing: '-0.01em',
      margin: '0 0 26px',
      maxWidth: '12ch'
    }
  }, "A union built to last generations."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '20px',
      lineHeight: 1.65,
      color: 'var(--ink-700)',
      fontWeight: 300,
      maxWidth: '46ch',
      margin: '0 0 38px'
    }
  }, "For the man entering a meaningful chapter who wants more than company \u2014 a partner, a family, a legacy worth building with care."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '28px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: () => onNavigate('apply')
  }, "Apply for a private consultation"), /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate('process'),
    style: {
      fontFamily: 'var(--font-text)',
      fontSize: '16px',
      color: 'var(--burgundy-700)',
      borderBottom: '1px solid var(--burgundy-700)',
      paddingBottom: '2px',
      cursor: 'pointer'
    }
  }, "How it works"))), /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundImage: 'url(../../assets/images/couple-garden.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center 25%'
    }
  }));
}
Object.assign(window, {
  Hero
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Nav.jsx
try { (() => {
// Heritage Union — Top navigation
function Nav({
  route,
  onNavigate
}) {
  const {
    Logo,
    Button
  } = window.HeritageUnionDesignSystem_8eb14e;
  const links = [{
    id: 'process',
    label: 'The Process'
  }, {
    id: 'story',
    label: 'Our Story'
  }, {
    id: 'vietnam',
    label: 'Vietnam'
  }];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '22px 48px',
      background: 'var(--cream-100)',
      borderBottom: '1px solid var(--cream-200)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate('home'),
    style: {
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    height: 34
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '40px'
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.id,
    onClick: () => onNavigate(l.id),
    style: {
      fontFamily: 'var(--font-text)',
      fontSize: '15px',
      letterSpacing: '0.04em',
      color: route === l.id ? 'var(--burgundy-700)' : 'var(--ink-700)',
      cursor: 'pointer',
      borderBottom: route === l.id ? '1px solid var(--gold-500)' : '1px solid transparent',
      paddingBottom: '2px',
      transition: 'var(--transition-base)'
    }
  }, l.label)), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    onClick: () => onNavigate('apply')
  }, "Apply")));
}
Object.assign(window, {
  Nav
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Nav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ProcessSection.jsx
try { (() => {
// Heritage Union — The Process (numbered steps on cream)
function ProcessSection({
  compact = false
}) {
  const {
    EyebrowLabel,
    Divider,
    Card
  } = window.HeritageUnionDesignSystem_8eb14e;
  const steps = [{
    n: '01',
    title: 'A private conversation',
    body: 'We begin with a discreet consultation to understand your hopes, your circumstances and what a meaningful future looks like for you.'
  }, {
    n: '02',
    title: 'Selective acceptance',
    body: 'Not every enquiry becomes a client. We accept those who are serious — which protects the integrity of the process for everyone.'
  }, {
    n: '03',
    title: 'Considered introductions',
    body: 'With local Vietnamese expertise, we introduce screened candidates chosen for genuine, long-term compatibility — never a catalogue.'
  }, {
    n: '04',
    title: 'Guided, every step',
    body: 'Cultural guidance and concierge support continue before, during and after — discreet from first conversation to lasting marriage.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--cream-100)',
      padding: compact ? '80px 80px' : '96px 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '1240px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    style: {
      marginBottom: '18px'
    }
  }, "The Process"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: '46px',
      margin: '0 0 14px',
      maxWidth: '20ch'
    }
  }, "Trust-led, from first conversation to lasting marriage."), /*#__PURE__*/React.createElement(Divider, {
    style: {
      marginBottom: '52px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '24px'
    }
  }, steps.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.n,
    surface: "white",
    elevation: "border",
    padding: "34px 36px",
    hover: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '40px',
      color: 'var(--gold-600)',
      lineHeight: 1,
      marginBottom: '14px'
    }
  }, s.n), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '28px',
      margin: '0 0 10px'
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '16px',
      lineHeight: 1.7,
      color: 'var(--ink-700)',
      margin: 0
    }
  }, s.body))))));
}
Object.assign(window, {
  ProcessSection
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ProcessSection.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/TestimonialSection.jsx
try { (() => {
// Heritage Union — Testimonial / quote band (burgundy)
function TestimonialSection() {
  const {
    Logo
  } = window.HeritageUnionDesignSystem_8eb14e;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--burgundy-700)',
      color: 'var(--cream-50)',
      padding: '110px 80px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '900px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "mark-only",
    height: 40,
    style: {
      justifyContent: 'center',
      marginBottom: '34px'
    }
  }), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 400,
      fontStyle: 'italic',
      fontSize: '40px',
      lineHeight: 1.3,
      letterSpacing: '-0.005em',
      color: 'var(--cream-50)',
      margin: '0 0 30px'
    }
  }, "\u201CWe are not selling access to profiles. We sell confidence, guidance and cultural understanding \u2014 a credible, premium environment for serious relationship formation.\u201D"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-text)',
      fontSize: '13px',
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: 'var(--gold-300)'
    }
  }, "The Heritage Union promise")));
}
Object.assign(window, {
  TestimonialSection
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/TestimonialSection.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ValuesSection.jsx
try { (() => {
// Heritage Union — Values section (on ink) + Process steps (on cream)
function ValuesSection() {
  const {
    EyebrowLabel,
    Divider
  } = window.HeritageUnionDesignSystem_8eb14e;
  const values = [{
    icon: 'ShieldCheck',
    title: 'Trust',
    body: 'Trust in the process, the people, the screening and the advice — the value everything else rests on.'
  }, {
    icon: 'EyeOff',
    title: 'Discretion',
    body: 'Calm, mature and confidential — from first conversation onward. Never loud, never sales-driven.'
  }, {
    icon: 'Globe',
    title: 'Cultural understanding',
    body: 'Awareness, communication and expectation management — the heart of a lasting international union.'
  }, {
    icon: 'HeartHandshake',
    title: 'Family',
    body: 'Long-term companionship, marriage, family and legacy — grounded and real, never fantasised.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--ink-800)',
      color: 'var(--cream-50)',
      padding: '96px 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '1240px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    color: "var(--gold-400)",
    style: {
      marginBottom: '18px'
    }
  }, "What we stand for"), /*#__PURE__*/React.createElement("h2", {
    style: {
      color: 'var(--cream-50)',
      fontSize: '46px',
      margin: '0 0 14px',
      maxWidth: '18ch'
    }
  }, "A consultancy, not a dating agency."), /*#__PURE__*/React.createElement(Divider, {
    style: {
      marginBottom: '56px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '48px'
    }
  }, values.map(v => /*#__PURE__*/React.createElement("div", {
    key: v.title
  }, /*#__PURE__*/React.createElement(Icon, {
    name: v.icon,
    size: 30,
    color: "var(--gold-400)",
    strokeWidth: 1.25
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      color: 'var(--cream-50)',
      fontSize: '26px',
      margin: '20px 0 10px'
    }
  }, v.title), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--ink-200)',
      fontSize: '15px',
      lineHeight: 1.7,
      margin: 0
    }
  }, v.body))))));
}
Object.assign(window, {
  ValuesSection
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ValuesSection.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/icons.jsx
try { (() => {
// Heritage Union — Icon wrapper around Lucide (loaded via CDN UMD as window.lucide)
// Thin, even-stroke line icons matching the editorial brand feel.
function Icon({
  name,
  size = 22,
  color = 'currentColor',
  strokeWidth = 1.5,
  style = {}
}) {
  const data = window.lucide && window.lucide[name];
  if (!data) return null;
  const children = Array.isArray(data) ? data : data.children || [];
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: style,
    "aria-hidden": "true"
  }, children.map(([tag, attrs], i) => React.createElement(tag, {
    key: i,
    ...attrs
  })));
}
Object.assign(window, {
  Icon
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/icons.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.EyebrowLabel = __ds_scope.EyebrowLabel;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Textarea = __ds_scope.Textarea;

})();
