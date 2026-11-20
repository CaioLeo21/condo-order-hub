/* @ds-bundle: {"format":4,"namespace":"IPackage","components":[{"name":"Button"},{"name":"Input"},{"name":"StatusBadge"},{"name":"PackageCard"},{"name":"AppBar"},{"name":"OptionGroup"},{"name":"SignaturePad"},{"name":"Icon"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;

  function cx() {
    return Array.prototype.filter.call(arguments, Boolean).join(" ");
  }
  function omit(obj, keys) {
    var out = {};
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && keys.indexOf(k) === -1) out[k] = obj[k];
    return out;
  }
  function svg(paths) {
    return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
      paths.map(function (d, i) { return h("path", { key: i, d: d }); }));
  }
  var icons = {
    clock: function () { return svg(["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"]); },
    check: function () { return svg(["M20 6 9 17l-5-5"]); },
    box: function () { return svg(["M21 8 12 3 3 8v8l9 5 9-5V8z", "M3 8l9 5 9-5", "M12 13v8"]); },
    mail: function () { return svg(["M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z", "m3 7 9 6 9-6"]); },
    ruler: function () { return svg(["M3 17 17 3l4 4L7 21z", "M7 13l2 2", "M10 10l2 2", "M13 7l2 2"]); },
    search: function () { return svg(["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "m21 21-4.3-4.3"]); },
    plus: function () { return svg(["M12 5v14", "M5 12h14"]); },
    camera: function () { return svg(["M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z", "M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]); },
    pen: function () { return svg(["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"]); },
    building: function () { return svg(["M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17", "M3 21h18", "M10 7h1", "M13 7h1", "M10 11h1", "M13 11h1", "M10 15h4v6h-4z"]); },
    user: function () { return svg(["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4 21a8 8 0 0 1 16 0"]); },
    arrowLeft: function () { return svg(["M19 12H5", "m12 19-7-7 7-7"]); }
  };

  function Icon(props) {
    var f = icons[props.name];
    return f ? h("span", { className: cx("ip-icon", props.className), "aria-hidden": true }, f()) : null;
  }

  function Button(props) {
    var variant = props.variant || "primary";
    var size = props.size || "md";
    var rest = omit(props, ["variant", "size", "block", "icon", "className", "children"]);
    return h("button", Object.assign({ type: "button" }, rest, {
      className: cx("ip-btn", "ip-btn--" + variant, "ip-btn--" + size, props.block && "ip-btn--block", props.className)
    }), props.icon ? h("span", { className: "ip-btn__icon", "aria-hidden": true }, props.icon) : null, props.children);
  }

  var seq = 0;
  function Input(props) {
    var autoId = React.useId ? React.useId() : "ip-" + (++seq);
    var id = props.id || autoId;
    var hintId = id + "-hint";
    var rest = omit(props, ["label", "hint", "error", "mono", "className", "id"]);
    var describedBy = props.error || props.hint ? hintId : undefined;
    return h("div", { className: cx("ip-field", props.error && "ip-field--error", props.className) },
      props.label ? h("label", { className: "ip-field__label", htmlFor: id }, props.label) : null,
      h("input", Object.assign({}, rest, { id: id, className: cx("ip-input", props.mono && "ip-input--mono"), "aria-invalid": props.error ? true : undefined, "aria-describedby": describedBy })),
      props.error ? h("span", { id: hintId, className: "ip-field__error" }, props.error)
        : props.hint ? h("span", { id: hintId, className: "ip-field__hint" }, props.hint) : null);
  }

  var STATUS = {
    pendente: { label: "Pendente", icon: icons.clock },
    retirada: { label: "Retirada", icon: icons.check }
  };
  function StatusBadge(props) {
    var s = STATUS[props.status] || STATUS.pendente;
    return h("span", { className: cx("ip-badge", "ip-badge--" + (STATUS[props.status] ? props.status : "pendente"), props.className) },
      s.icon(), props.children || s.label);
  }

  var TIPO_ICON = { Envelope: icons.mail, Caixa: icons.box, Embalagem: icons.box, Outros: icons.box };
  function PackageCard(props) {
    var status = props.status || "pendente";
    var tipoIcon = TIPO_ICON[props.tipo] || icons.box;
    var rows = [];
    if (props.remetente) rows.push(["Remetente", props.remetente]);
    if (props.chegadaEm) rows.push(["Chegada", props.chegadaEm]);
    if (props.recebidoPor) rows.push(["Recebida por", props.recebidoPor]);
    if (status === "retirada" && props.retiradaEm) rows.push(["Retirada", props.retiradaEm + (props.retiradoPor ? " · " + props.retiradoPor : "")]);
    if (props.observacao) rows.push(["Obs.", props.observacao]);
    return h("article", { className: cx("ip-card", props.className) },
      h("div", { className: "ip-card__head" },
        h("div", null,
          h("div", { className: "ip-card__unit" }, props.unidade),
          h("h3", { className: "ip-card__resident" }, props.morador)),
        h(StatusBadge, { status: status })),
      h("div", { className: "ip-card__meta" },
        props.tipo ? h("span", { className: "ip-chip" }, tipoIcon(), props.tipo) : null,
        props.tamanho ? h("span", { className: "ip-chip" }, icons.ruler(), props.tamanho) : null,
        props.codigo ? h("span", { className: "ip-card__code" }, props.codigo) : null),
      rows.length ? h("dl", { className: "ip-card__detail" },
        rows.map(function (r) { return [h("dt", { key: r[0] + "t" }, r[0]), h("dd", { key: r[0] + "d" }, r[1])]; })) : null,
      status === "pendente" && props.onRegistrarRetirada
        ? h(Button, { variant: "primary", block: true, icon: icons.check(), onClick: props.onRegistrarRetirada }, "Registrar retirada")
        : null);
  }

  function initials(name) {
    return String(name || "").split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p[0].toUpperCase(); }).join("");
  }
  function AppBar(props) {
    return h("header", { className: cx("ip-appbar", props.className) },
      h("div", { className: "ip-appbar__brand" },
        h("span", { className: "ip-wordmark" }, h("span", { className: "ip-wordmark__i" }, "i"), "Package"),
        props.condominio ? h("span", { className: "ip-appbar__condo" }, icons.building(), props.condominio) : null),
      h("div", { className: "ip-appbar__right" },
        props.children,
        props.usuario ? h("span", { className: "ip-appbar__user" },
          h("span", { className: "ip-avatar", "aria-hidden": true }, initials(props.usuario)),
          h("span", null, h("span", { className: "ip-appbar__name" }, props.usuario),
            props.turno ? h("span", { className: "ip-appbar__shift" }, props.perfil ? props.perfil + " · " + props.turno : props.turno) : null)) : null));
  }

  function OptionGroup(props) {
    var options = props.options || [];
    function pick(v) { if (props.onChange) props.onChange(v); }
    function onKey(e, i) {
      var d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = (i + d + options.length) % options.length;
      pick(options[n].value);
      var sib = e.currentTarget.parentNode.children[n];
      if (sib) sib.focus();
    }
    var selIndex = -1;
    options.forEach(function (o, i) { if (o.value === props.value) selIndex = i; });
    return h("div", { className: cx("ip-field", props.className) },
      props.label ? h("span", { className: "ip-field__label", id: props.name + "-label" }, props.label) : null,
      h("div", { className: cx("ip-options", props.columns && "ip-options--cols"), role: "radiogroup", "aria-labelledby": props.label ? props.name + "-label" : undefined,
        style: props.columns ? { gridTemplateColumns: "repeat(" + props.columns + ", minmax(0, 1fr))" } : undefined },
        options.map(function (o, i) {
          var on = o.value === props.value;
          return h("button", {
            key: o.value, type: "button", role: "radio", "aria-checked": on,
            tabIndex: on || (selIndex === -1 && i === 0) ? 0 : -1,
            className: cx("ip-option", on && "ip-option--on"),
            onClick: function () { pick(o.value); }, onKeyDown: function (e) { onKey(e, i); }
          },
            o.icon && icons[o.icon] ? h("span", { className: "ip-option__icon", "aria-hidden": true }, icons[o.icon]()) : null,
            h("span", { className: "ip-option__text" }, h("span", { className: "ip-option__label" }, o.label),
              o.description ? h("span", { className: "ip-option__desc" }, o.description) : null),
            h("span", { className: "ip-option__check", "aria-hidden": true }, on ? icons.check() : null));
        })),
      props.error ? h("span", { className: "ip-field__error" }, props.error) : null);
  }

  function SignaturePad(props) {
    var ref = React.useRef(null);
    var drawing = React.useRef(false);
    var last = React.useRef(null);
    var st = React.useState(false), has = st[0], setHas = st[1];
    var height = props.height || 180;
    React.useEffect(function () {
      var c = ref.current; if (!c) return;
      var dpr = window.devicePixelRatio || 1;
      c.width = c.clientWidth * dpr; c.height = height * dpr;
      var ctx = c.getContext("2d"); ctx.scale(dpr, dpr);
    }, [height]);
    function pos(e) { var r = ref.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function down(e) { drawing.current = true; last.current = pos(e); ref.current.setPointerCapture && ref.current.setPointerCapture(e.pointerId); }
    function move(e) {
      if (!drawing.current) return;
      var p = pos(e), ctx = ref.current.getContext("2d");
      ctx.strokeStyle = getComputedStyle(ref.current).color; ctx.lineWidth = 2.25; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last.current = p;
      if (!has) { setHas(true); if (props.onChange) props.onChange(true); }
    }
    function up() { drawing.current = false; }
    function clear() {
      var c = ref.current; c.getContext("2d").clearRect(0, 0, c.width, c.height);
      setHas(false); if (props.onChange) props.onChange(false);
    }
    return h("div", { className: cx("ip-field", props.className) },
      h("div", { className: "ip-sign__head" },
        h("span", { className: "ip-field__label" }, props.label || "Assinatura"),
        h(Button, { variant: "ghost", size: "sm", onClick: clear, disabled: !has }, "Limpar")),
      h("div", { className: "ip-sign" },
        h("canvas", { ref: ref, className: "ip-sign__canvas", style: { height: height + "px" }, role: "img", "aria-label": has ? "Assinatura registrada" : "Área para assinar com o dedo",
          onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerLeave: up }),
        h("span", { className: "ip-sign__line", "aria-hidden": true }),
        has ? null : h("span", { className: "ip-sign__hint", "aria-hidden": true }, icons.pen(), "Assine aqui com o dedo")));
  }

  window.IPackage = Object.assign(window.IPackage || {}, {
    Button: Button,
    Input: Input,
    StatusBadge: StatusBadge,
    PackageCard: PackageCard,
    AppBar: AppBar,
    OptionGroup: OptionGroup,
    SignaturePad: SignaturePad,
    Icon: Icon
  });
})();
