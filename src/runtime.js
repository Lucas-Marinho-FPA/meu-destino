/*
 * Meu Destino — runtime mínimo do protótipo web.
 *
 * Substitui o runtime do Canvas (que pertence à ferramenta e não faz parte do projeto).
 * Interpreta o mesmo formato de template usado no protótipo aprovado:
 *   {{caminho.pontuado}}            texto e atributos
 *   <sc-if value="{{x}}">           renderização condicional
 *   <sc-for list="{{l}}" as="i">    repetição
 *   onClick / onChange              eventos (delegados na raiz)
 *   ref="{{fn}}"                    callback com o elemento
 *   hint-*                          ignorados (metadados do editor)
 * Componente: classe com renderVals(), setState(), componentDidMount(), componentDidUpdate().
 *
 * Atualização da tela: o template é renderizado num fragmento novo e comparado ao DOM atual
 * ("morph" por posição), preservando elementos, foco, posição do cursor e rolagem.
 * Sem dependências externas.
 */
(function (global) {
  'use strict';

  function get(scope, path) {
    return path.trim().split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, scope);
  }
  var WHOLE = /^\s*\{\{([^}]+)\}\}\s*$/, HOLE = /\{\{([^}]+)\}\}/g;
  function interp(str, scope) {
    var m = str.match(WHOLE);
    if (m) return get(scope, m[1]);
    return str.replace(HOLE, function (_, p) { var v = get(scope, p); return v == null ? '' : v; });
  }
  function holeKey(a) { return a.replace(/[{}\s]/g, ''); }

  /* ---------- renderização do template para um fragmento novo ---------- */
  function build(node, scope, out, reg) {
    var kids = node.childNodes;
    for (var i = 0; i < kids.length; i++) {
      var ch = kids[i];
      if (ch.nodeType === 3) { out.appendChild(document.createTextNode(interp(ch.textContent, scope))); continue; }
      if (ch.nodeType !== 1) continue;
      var tag = ch.tagName.toLowerCase();
      if (tag === 'sc-if') { if (get(scope, holeKey(ch.getAttribute('value')))) build(ch, scope, out, reg); continue; }
      if (tag === 'sc-for') {
        var list = get(scope, holeKey(ch.getAttribute('list'))) || [], as = ch.getAttribute('as');
        for (var j = 0; j < list.length; j++) { var sc = Object.create(scope); sc[as] = list[j]; build(ch, sc, out, reg); }
        continue;
      }
      var el = ch.cloneNode(false), attrs = ch.attributes;
      for (var a = 0; a < attrs.length; a++) {
        var n = attrs[a].name, raw = attrs[a].value;
        if (n.indexOf('hint-') === 0) { el.removeAttribute(n); continue; }
        if (n === 'ref') { el.removeAttribute(n); var rf = get(scope, holeKey(raw)); if (typeof rf === 'function') { reg.refs.push(rf); el.setAttribute('data-md-ref', reg.refs.length - 1); } continue; }
        if (n === 'onclick' || n === 'onchange') {
          el.removeAttribute(n); var fn = get(scope, holeKey(raw));
          if (typeof fn === 'function') { reg.fns.push(fn); el.setAttribute(n === 'onclick' ? 'data-md-click' : 'data-md-change', reg.fns.length - 1); }
          continue;
        }
        var v = interp(raw, scope);
        if (n === 'disabled') { if (v === true || v === 'true') el.setAttribute('disabled', ''); else el.removeAttribute('disabled'); continue; }
        el.setAttribute(n, v == null ? '' : v);
      }
      build(ch.content || ch, scope, el, reg);
      out.appendChild(el);
    }
  }

  /* ---------- comparação com o DOM atual ---------- */
  function syncAttrs(oldEl, newEl) {
    var i, a;
    for (i = oldEl.attributes.length - 1; i >= 0; i--) { a = oldEl.attributes[i].name; if (!newEl.hasAttribute(a)) oldEl.removeAttribute(a); }
    for (i = 0; i < newEl.attributes.length; i++) { a = newEl.attributes[i]; if (oldEl.getAttribute(a.name) !== a.value) oldEl.setAttribute(a.name, a.value); }
  }
  function syncValue(oldEl, newEl) {
    var tag = oldEl.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') return;
    var v = newEl.getAttribute('value'); if (v === null) return;
    /* não interfere no campo que o usuário está digitando */
    if (oldEl === document.activeElement && tag !== 'SELECT') return;
    if (oldEl.value !== v) oldEl.value = v;
  }
  function morph(oldParent, newParent) {
    var newKids = Array.prototype.slice.call(newParent.childNodes), i;
    for (i = 0; i < newKids.length; i++) {
      var nw = newKids[i], old = oldParent.childNodes[i];
      if (!old) { oldParent.appendChild(nw); continue; }
      if (old.nodeType !== nw.nodeType || (old.nodeType === 1 && old.tagName !== nw.tagName)) { oldParent.replaceChild(nw, old); continue; }
      if (old.nodeType === 3) { if (old.nodeValue !== nw.nodeValue) old.nodeValue = nw.nodeValue; continue; }
      if (old.nodeType !== 1) { oldParent.replaceChild(nw, old); continue; }
      syncAttrs(old, nw);
      morph(old, nw);
      syncValue(old, nw);
    }
    while (oldParent.childNodes.length > newKids.length) oldParent.removeChild(oldParent.lastChild);
  }

  /* ---------- montagem ---------- */
  function mount(Component, root, template, props) {
    var app = new Component(props || {}), reg = { fns: [], refs: [] }, pending = false, mounted = false;
    app.setState = function (patch) {
      var p = typeof patch === 'function' ? patch(this.state, this.props) : patch;
      this.state = Object.assign({}, this.state, p);
      schedule();
    };
    function schedule() { if (pending) return; pending = true; Promise.resolve().then(render); }
    function render() {
      pending = false;
      var nreg = { fns: [], refs: [] }, frag = document.createDocumentFragment();
      build(template.content, app.renderVals(), frag, nreg);
      morph(root, frag);
      reg = nreg;
      root.querySelectorAll('[data-md-ref]').forEach(function (el) { var f = reg.refs[+el.getAttribute('data-md-ref')]; if (f) f(el); });
      if (!mounted) { mounted = true; if (app.componentDidMount) app.componentDidMount(); }
      else if (app.componentDidUpdate) app.componentDidUpdate();
    }
    /* eventos delegados: dispara do elemento mais interno para fora (como a propagação) */
    function fire(attr, ev) {
      var el = ev.target;
      while (el && el !== root) {
        if (el.nodeType === 1 && el.hasAttribute(attr)) { var f = reg.fns[+el.getAttribute(attr)]; if (f) f(ev); }
        el = el.parentNode;
      }
    }
    root.addEventListener('click', function (ev) { fire('data-md-click', ev); });
    root.addEventListener('input', function (ev) { if (ev.target.tagName !== 'SELECT') fire('data-md-change', ev); });
    root.addEventListener('change', function (ev) { if (ev.target.tagName === 'SELECT') fire('data-md-change', ev); });
    render();
    return { app: app, render: render };
  }

  /* Classe base esperada pelo componente (mesmo nome usado no protótipo do Canvas). */
  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (patch) { this.state = Object.assign({}, this.state, typeof patch === 'function' ? patch(this.state) : patch); };

  global.DCLogic = DCLogic;
  global.MeuDestinoRuntime = { mount: mount, _internal: { interp: interp, build: build, morph: morph } };
})(typeof window !== 'undefined' ? window : globalThis);
