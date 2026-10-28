/* Componentes interativos reutilizáveis. API: UI.* (HTML) e UI.bind(el) (comportamento). */
(function () {
  const $ = (r, s) => r.querySelector(s), $$ = (r, s) => Array.from(r.querySelectorAll(s));
  const BADGES = {
    ilus: 'ILUSTRAÇÃO VETORIAL', sim: 'SIMULAÇÃO VISUAL', real: 'DEMONSTRAÇÃO REAL', ia: 'GERADO POR IA', doc: 'ESQUEMÁTICO — NÃO VALIDADO', conc: 'ESQUEMA CONCEITUAL', wait: 'AGUARDANDO ARQUIVO'
  };
  const badge = (k, txt) => '<span class="badge b-' + k + '">' + (txt || BADGES[k]) + '</span>';

  /* figura com slot para ativo real: se o arquivo existir em assets/, substitui a ilustração */
  function fig(slot, media, caption, bk, cls) {
    return '<figure class="fig ' + (cls || '') + '"' + (slot ? ' data-slot="' + slot + '"' : '') + '><div class="fig-media zoomable" tabindex="0" role="button" aria-label="Ampliar imagem">' + media + '</div>' +
      '<figcaption>' + (bk ? badge(bk) : '') + '<span>' + (caption || '') + '</span></figcaption></figure>';
  }

  function compare(a, b, la, lb, sa, sb) {
    return '<div class="cmp" data-cmp style="--p:50"><div class="cmp-a"' + (sa ? ' data-aimg="' + sa + '"' : '') + '>' + a + '</div><div class="cmp-b"' + (sb ? ' data-aimg="' + sb + '"' : '') + '>' + b + '</div>' +
      '<span class="cmp-l cmp-la">' + la + '</span><span class="cmp-l cmp-lb">' + lb + '</span><span class="cmp-h" aria-hidden="true"><i></i></span>' +
      '<input type="range" min="0" max="100" value="50" aria-label="Comparar: ' + lb + ' à esquerda, ' + la + ' à direita"></div>';
  }

  function probe(path, ok, bad) { const i = new Image(); i.onload = () => ok(i); i.onerror = () => bad && bad(); i.src = path; }
  function loadAssets(el) {
    loadAimg(el);
    $$(el, '[data-slot]').forEach(f => {
      const slot = f.dataset.slot, a = window.ASSET_SLOTS[slot]; if (!a) return;
      probe(a.file, () => {
        const m = $(f, '.fig-media');
        m.innerHTML = '<img src="' + a.file + '" alt="' + (f.dataset.alt || slot) + '" loading="lazy">';
        const b = $(f, '.badge'); if (b) { b.className = 'badge b-real'; b.textContent = 'ATIVO REAL · ' + a.kind; }
        if (window.PROJECT.approvedAssets.indexOf(slot) < 0) window.PROJECT.approvedAssets.push(slot);
      });
    });
  }

  function loadAimg(el) {
    $$(el, '[data-aimg]').forEach(n => { const s = window.ASSET_SLOTS[n.dataset.aimg]; if (!s) return; probe(s.file, () => { n.innerHTML = '<img src="' + s.file + '" alt="' + n.dataset.aimg + '" loading="lazy">'; }); });
    $$(el, '[data-badgeof]').forEach(b => { const s = window.ASSET_SLOTS[b.dataset.badgeof]; if (s) probe(s.file, () => { b.className = 'badge b-real'; b.textContent = 'ATIVO REAL · ' + s.kind; }); });
  }

  function bind(el) {
    $$(el, '[data-cmp]').forEach(c => {
      const r = $(c, 'input');
      const upd = () => c.style.setProperty('--p', r.value);
      r.addEventListener('input', upd);
      r.addEventListener('pointerup', () => r.blur());
      r.addEventListener('keydown', e => { if (e.key === 'Escape') r.blur(); });
    });
    $$(el, '[data-tabs]').forEach(g => {
      const btns = $$(g, '[data-tab]'), panes = $$(g, '[data-pane]');
      const sel = k => {
        btns.forEach(b => { const on = b.dataset.tab === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
        panes.forEach(p => p.classList.toggle('on', p.dataset.pane === k));
        g.dispatchEvent(new CustomEvent('tabchange', { detail: k }));
      };
      btns.forEach(b => b.addEventListener('click', () => sel(b.dataset.tab)));
      g._sel = sel; g._keys = btns.map(b => b.dataset.tab);
      sel(g.dataset.tabs || btns[0].dataset.tab);
    });
    bindMood(el); bindBubbles(el); bindLights(el); bindSite(el);
  }

  /* ---- Moodboard ---- */
  function bindMood(el) {
    const m = $(el, '[data-mood]'); if (!m) return;
    const tiles = $$(m, '.tile'), btns = $$(el, '[data-filter]');
    const set = f => {
      btns.forEach(b => { const on = b.dataset.filter === f; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      tiles.forEach(t => { const show = f === 'tudo' || t.dataset.cats.split(' ').includes(f); t.classList.toggle('off', !show); });
      const n = tiles.filter(t => !t.classList.contains('off')).length;
      const c = $(el, '[data-count]'); if (c) c.textContent = n + ' de ' + tiles.length + ' referências';
    };
    btns.forEach(b => b.addEventListener('click', () => set(b.dataset.filter)));
    set('tudo');
  }

  /* ---- Bolhas + planta ---- */
  function bindBubbles(el) {
    const svg = $(el, '[data-bubbles]'); if (!svg) return;
    const D = window.Diagrams, P = window.PROJECT;
    const bs = $$(svg, '.bub'), links = $$(svg, '.lnk');
    const info = $(el, '[data-info]');
    let cur = null;
    const select = id => {
      cur = id;
      const B = D.BUBBLES.find(b => b.id === id), rel = new Set(B ? [id].concat(B.links) : []);
      svg.classList.toggle('has-sel', !!B);
      bs.forEach(g => { g.classList.toggle('sel', g.dataset.id === id); g.classList.toggle('rel', rel.has(g.dataset.id) && g.dataset.id !== id); });
      links.forEach(l => l.classList.toggle('act', !!B && (l.dataset.a === id || l.dataset.b === id)));
      if (info) info.innerHTML = B ? '<h3>' + P.rooms[id].label + '</h3><p>' + B.why + '</p><p class="mono">Relações: ' + B.links.map(l => P.rooms[l].label).join(' · ') + '</p>' +
        '<p class="mono tag s-' + D.sectorOf(id) + '">Setor ' + D.SECTOR[D.sectorOf(id)].name + '</p>' : '<p class="muted">Selecione uma bolha para ver sua justificativa funcional e as relações de proximidade.</p>';
    };
    bs.forEach(g => {
      g.addEventListener('click', () => select(cur === g.dataset.id ? null : g.dataset.id));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g.click(); } });
    });
    select(null);
    const mb = $(el, '[data-morph]');
    if (mb) {
      const go = on => {
        svg.classList.toggle('plan', on); mb.setAttribute('aria-pressed', on);
        mb.textContent = on ? '← Voltar ao diagrama' : 'Transformar em planta →';
        bs.forEach(g => {
          const B = D.BUBBLES.find(b => b.id === g.dataset.id), c = D.center(B.id);
          g.style.transform = on ? 'translate(' + (c[0] - B.dx) + 'px,' + (c[1] - B.dy) + 'px)' : 'translate(0,0)';
        });
      };
      mb.addEventListener('click', () => go(!svg.classList.contains('plan')));
      el._morph = go;
    }
  }

  /* ---- Iluminação x estilo ---- */
  function bindLights(el) {
    const box = $(el, '[data-lights]'); if (!box) return;
    const cache = {}, st = { l: box.dataset.start || 'golden', v: 'base' };
    const layers = $$(box, '.lay'); let top = 0;
    const L = window.House.LIGHTS;
    const INFO = {
      manha: ['Manhã', 'Luz natural suave e difusa, sombras curtas e vegetação bem definida.', 'Leitura clara dos materiais; atmosfera tranquila e equilibrada.'],
      golden: ['Golden hour', 'Luz quente de fim de tarde, sombras longas e reflexos dourados.', 'Contraste natural e atmosfera cinematográfica; o concreto esquenta de tom.'],
      blue: ['Blue hour', 'Céu azul profundo com a iluminação interna já visível.', 'Equilíbrio entre interior e exterior; os vidros passam a brilhar.'],
      noite: ['Noite', 'Luz indireta, balizadores e paisagismo iluminado com moderação.', 'A arquitetura é lida pela luz: materiais e volumes se destacam do escuro.']
    };
    const VINFO = { base: '', minimal: 'Minimalismo contemporâneo — menos elementos, concreto claro, vegetação contida.', tropical: 'Tropical brasileiro — vegetação densa e saturada emoldurando a casa.', brutal: 'Brutalismo contemporâneo — concreto escuro e pesado, vegetação austera.' };
    const imgFor = () => {
      const k = st.l + '/' + st.v;
      if (!cache[k]) cache[k] = window.House.render({ light: st.l, variant: st.v, view: box.dataset.view || 'hero', alt: 'Casa Entre Planos — ' + INFO[st.l][0] + ' — ' + VINFO[st.v] });
      return cache[k];
    };
    const show = () => {
      const slot = 'light-' + st.l, real = st.v === 'base' && window.ASSET_SLOTS[slot];
      const next = layers[1 - top];
      next.innerHTML = imgFor();
      const bd = $(box, '.badge'); if (bd) { bd.className = 'badge b-ilus'; bd.textContent = 'ILUSTRAÇÃO VETORIAL'; }
      if (real) probe(real.file, () => { next.innerHTML = '<img src="' + real.file + '" alt="Render ' + INFO[st.l][0] + '">'; if (bd && st.v === 'base') { bd.className = 'badge b-real'; bd.textContent = 'ATIVO REAL · ' + real.kind; } });
      next.classList.add('on'); layers[top].classList.remove('on'); top = 1 - top;
      const t = $(el, '[data-ltitle]'), d = $(el, '[data-ldesc]'), x = $(el, '[data-ldiff]'), v = $(el, '[data-vdesc]');
      if (t) t.textContent = INFO[st.l][0]; if (d) d.textContent = INFO[st.l][1]; if (x) x.textContent = INFO[st.l][2]; if (v) v.textContent = VINFO[st.v];
      $$(el, '[data-light]').forEach(b => { const on = b.dataset.light === st.l; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      $$(el, '[data-variant]').forEach(b => { const on = b.dataset.variant === st.v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    };
    $$(el, '[data-light]').forEach(b => b.addEventListener('click', () => { st.l = b.dataset.light; show(); }));
    $$(el, '[data-variant]').forEach(b => b.addEventListener('click', () => { st.v = st.v === b.dataset.variant ? 'base' : b.dataset.variant; show(); }));
    el._lightsKeys = k => { const ls = ['manha', 'golden', 'blue', 'noite']; if (ls[k]) { st.l = ls[k]; show(); } };
    show();
  }

  /* ---- Camadas da leitura do terreno ---- */
  function bindSite(el) {
    const box = $(el, '[data-site]'); if (!box) return;
    const st = { acessos: 1, vegetacao: 1, barreiras: 0, condicionantes: 0, hipoteses: 0 };
    const draw = () => { $(box, '.site-img').innerHTML = window.Diagrams.siteSVG('analysis', st); $$(el, '[data-layer]').forEach(b => { b.classList.toggle('on', !!st[b.dataset.layer]); b.setAttribute('aria-pressed', !!st[b.dataset.layer]); }); };
    $$(el, '[data-layer]').forEach(b => b.addEventListener('click', () => { st[b.dataset.layer] = st[b.dataset.layer] ? 0 : 1; draw(); }));
    draw();
  }

  window.UI = { badge, fig, compare, bind, loadAssets, probe, $, $$ };
})();
