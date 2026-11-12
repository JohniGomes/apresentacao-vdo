/* Navegação, escala 16:9, HUD, índice, notas, tela cheia e janela do apresentador. */
(function () {
  const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
  const S = window.SLIDES, CH = window.CHAPTERS;
  const A = window.App = { i: -1, step: 0, built: {} };
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let chan = null; try { chan = new BroadcastChannel('vdo-presenter'); } catch (e) {}

  function fit() {
    const st = $('#stage'), k = Math.min(innerWidth / 1920, innerHeight / 1080);
    st.style.transform = 'translate(-50%,-50%) scale(' + k + ')';
  }

  function build(i) {
    if (A.built[i] || !S[i]) return A.built[i];
    const s = S[i], el = document.createElement('section');
    el.className = 'slide th-' + (s.theme || 'dark'); el.dataset.id = s.id; el.setAttribute('aria-label', s.title);
    el.innerHTML = '<div class="pad">' + s.html() + '</div>';
    $('#slides').appendChild(el);
    window.UI.bind(el); window.UI.loadAssets(el);
    el.querySelectorAll('img').forEach(im => im.addEventListener('error', () => im.replaceWith(Object.assign(document.createElement('div'), { className: 'imgfail', textContent: 'Imagem indisponível' }))));
    A.built[i] = el; return el;
  }

  function applyStep(el) {
    el.querySelectorAll('.rv').forEach(n => n.classList.toggle('in', +n.dataset.s <= A.step));
    const tl = el.querySelector('.tl-line i'); if (tl) tl.style.width = (A.step / 8 * 100) + '%';
  }

  function go(i, fromEnd) {
    i = Math.max(0, Math.min(S.length - 1, i)); if (i === A.i) return;
    const prev = A.built[A.i];
    if (prev) { prev.classList.remove('on'); prev.setAttribute('aria-hidden', 'true'); const ps = S[A.i]; if (ps.leave) ps.leave(prev); }
    A.i = i; A.step = fromEnd ? (S[i].steps || 0) : 0;
    const el = build(i); el.classList.add('on'); el.removeAttribute('aria-hidden');
    applyStep(el); if (S[i].enter) S[i].enter(el);
    if (i + 1 < S.length) (window.requestIdleCallback || setTimeout)(() => build(i + 1));
    hud(); notes(); try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) {}
    post();
  }

  function next() {
    const s = S[A.i];
    if (s.steps && A.step < s.steps) { A.step++; applyStep(A.built[A.i]); post(); return; }
    go(A.i + 1);
  }
  function prev() {
    if (A.step > 0) { A.step--; applyStep(A.built[A.i]); post(); return; }
    go(A.i - 1, true);
  }
  A.next = next; A.prev = prev; A.go = go;

  function hud() {
    const s = S[A.i], c = CH.find(x => x.k === s.ch);
    $('#chapter').textContent = (c ? c.label : '').toUpperCase() + ' — ' + s.title.toUpperCase();
    $('#counter').textContent = String(A.i + 1).padStart(2, '0') + ' / ' + String(S.length).padStart(2, '0');
    $('#prog i').style.width = ((A.i + 1) / S.length * 100) + '%';
    $('#stage').dataset.theme = s.theme || 'dark';
    $$('#toc-body a').forEach(a => a.classList.toggle('cur', +a.dataset.i === A.i));
  }

  const NF = ['Mensagem principal', 'Explicação sugerida', 'Demonstração a realizar', 'Pergunta ao público', 'Transição'];
  function notesHTML(i) { const s = S[i]; return '<h3>' + (i + 1) + '. ' + s.title + '</h3>' + s.notes.map((n, k) => '<h4>' + NF[k] + '</h4><p>' + n + '</p>').join(''); }
  function notes() { $('#notes-body').innerHTML = notesHTML(A.i); }
  function post() { if (chan) chan.postMessage({ type: 'state', i: A.i, step: A.step, total: S.length, html: notesHTML(A.i), title: S[A.i].title, nextTitle: S[A.i + 1] ? S[A.i + 1].title : '— fim —' }); }

  function toggle(sel, force) { const e = $(sel); const show = force == null ? e.hidden : force; e.hidden = !show; return show; }
  function closeAll() { let any = false; ['#toc', '#notes', '#help', '#lightbox'].forEach(s => { if (!$(s).hidden) { $(s).hidden = true; any = true; } }); return any; }
  A.closeAll = closeAll;

  function fs() {
    if (document.fullscreenElement) document.exitFullscreen && document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  }

  function tocBuild() {
    let h = '';
    CH.forEach(c => { const items = S.map((s, i) => [s, i]).filter(x => x[0].ch === c.k); if (!items.length) return; h += '<h3>' + c.label + '</h3>' + items.map(x => '<a href="#' + (x[1] + 1) + '" data-i="' + x[1] + '"><b>' + String(x[1] + 1).padStart(2, '0') + '</b>' + x[0].title + '</a>').join(''); });
    $('#toc-body').innerHTML = h;
    $('#toc-body').addEventListener('click', e => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); go(+a.dataset.i); toggle('#toc', false); });
  }
  function assetsStatus() {
    const slots = Object.keys(window.ASSET_SLOTS), ok = window.PROJECT.approvedAssets;
    $('#toc-assets').textContent = ok.length + ' de ' + slots.length + ' ativos reais detectados · pendentes: ' + (slots.filter(k => ok.indexOf(k) < 0).join(', ') || 'nenhum');
  }

  function typing(t) { return t && (t.isContentEditable || /^(TEXTAREA|SELECT)$/.test(t.tagName) || (t.tagName === 'INPUT' && !/^(checkbox|button|range)$/.test(t.type))); }

  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target; if (typing(t)) return;
    const k = e.key, onRange = t.tagName === 'INPUT' && t.type === 'range', onBtn = /^(BUTTON|INPUT|A)$/.test(t.tagName);
    if (k === 'Escape') { if (!closeAll()) { /* o navegador trata a saída da tela cheia */ } return; }
    if (k === 'ArrowRight' || k === 'PageDown') { if (onRange) return; e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { if (onRange) return; e.preventDefault(); prev(); }
    else if (k === ' ' && !onBtn) { e.preventDefault(); e.shiftKey ? prev() : next(); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(S.length - 1); }
    else if (k === 'f' || k === 'F') fs();
    else if (k === 'n' || k === 'N') toggle('#notes');
    else if (k === 'i' || k === 'I') { assetsStatus(); toggle('#toc'); }
    else if (k === 'p' || k === 'P') openPresenter();
    else if (k === '?') toggle('#help');
    else if (/^[1-6]$/.test(k)) { const el = A.built[A.i], n = +k - 1; if (el && el._lightsKeys) el._lightsKeys(n); if (el && el._scene) el._scene(n); }
  });

  function openPresenter() { window.open(location.pathname + '?presenter', 'vdo-presenter', 'width=1100,height=760'); setTimeout(post, 800); }

  function init() {
    fit(); addEventListener('resize', fit);
    tocBuild();
    $('#b-prev').onclick = prev; $('#b-next').onclick = next;
    $('#b-toc').onclick = () => { assetsStatus(); toggle('#toc'); };
    $('#b-notes').onclick = () => toggle('#notes'); $('#b-fs').onclick = fs; $('#b-pres').onclick = openPresenter; $('#b-help').onclick = () => toggle('#help');
    document.addEventListener('fullscreenchange', () => { $('#b-fs').textContent = document.fullscreenElement ? 'Sair da tela cheia' : 'Tela cheia'; fit(); });
    $$('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('aside,div[hidden],#help,#lightbox,#toc,#notes').hidden = true));
    document.addEventListener('click', e => {
      const n = e.target.closest('[data-next]'); if (n) { next(); return; }
      const c = e.target.closest('[data-copy]'); if (c) { const tx = document.querySelector(c.dataset.copy).textContent; const done = () => { const m = c.parentElement.querySelector('[data-copied]'); if (m) { m.textContent = 'Copiado ✓'; setTimeout(() => m.textContent = '', 2000); } };
        if (navigator.clipboard) navigator.clipboard.writeText(tx).then(done, () => fallbackCopy(tx, done)); else fallbackCopy(tx, done); return; }
      const z = e.target.closest('.fig-media.zoomable, figure.zoomable, .win.zoomable'); if (z && !e.target.closest('.pin,input,.cmp')) zoom(z);
    });
    document.addEventListener('keydown', e => { if ((e.key === 'Enter') && e.target.classList && e.target.classList.contains('zoomable')) zoom(e.target); });
    $('#lightbox').addEventListener('click', e => { if (!e.target.closest('#lb-body svg,#lb-body img')) $('#lightbox').hidden = true; });
    let t; const wake = () => { document.body.classList.remove('idle'); clearTimeout(t); t = setTimeout(() => document.body.classList.add('idle'), 3000); };
    ['mousemove', 'keydown', 'pointerdown'].forEach(ev => addEventListener(ev, wake)); wake();
    if (chan) chan.onmessage = m => { const d = m.data; if (d.type === 'cmd') { if (d.cmd === 'next') next(); else if (d.cmd === 'prev') prev(); else if (d.cmd === 'hello') post(); } };
    const h = parseInt(location.hash.slice(1), 10);
    go(h > 0 && h <= S.length ? h - 1 : 0);
    Object.keys(window.ASSET_SLOTS).filter(k => k !== 'film').forEach(k => window.UI.probe(window.ASSET_SLOTS[k].file, () => { if (window.PROJECT.approvedAssets.indexOf(k) < 0) window.PROJECT.approvedAssets.push(k); }));
    addEventListener('hashchange', () => { const n = parseInt(location.hash.slice(1), 10); if (n > 0 && n <= S.length && n - 1 !== A.i) go(n - 1); });
  }
  function fallbackCopy(tx, done) { const ta = document.createElement('textarea'); ta.value = tx; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} ta.remove(); }
  function zoom(z) { const m = z.querySelector('svg,img'); if (!m) return; const c = m.cloneNode(true); c.removeAttribute('width'); $('#lb-body').innerHTML = ''; $('#lb-body').appendChild(c); $('#lightbox').hidden = false; }

  /* ---------- Janela do apresentador ---------- */
  function presenter() {
    document.body.classList.add('presenter');
    document.body.innerHTML = '<div id="pm"><header><h1 id="pt">—</h1><div class="mono" id="pc"></div><div class="mono" id="pt-timer">00:00</div></header><main id="pn"></main><footer><div class="mono">Próximo: <b id="px"></b></div><div><button id="pp">← Voltar</button><button id="pn2">Avançar →</button></div></footer></div>';
    const t0 = Date.now(); setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); document.getElementById('pt-timer').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 1000);
    if (!chan) { document.getElementById('pn').innerHTML = '<p>Este navegador não permite sincronizar janelas (BroadcastChannel). Use o painel de Notas (N) na janela principal.</p>'; return; }
    chan.onmessage = m => { const d = m.data; if (d.type !== 'state') return; document.getElementById('pt').textContent = (d.i + 1) + '. ' + d.title; document.getElementById('pc').textContent = (d.i + 1) + ' / ' + d.total; document.getElementById('pn').innerHTML = d.html; document.getElementById('px').textContent = d.nextTitle; };
    document.getElementById('pp').onclick = () => chan.postMessage({ type: 'cmd', cmd: 'prev' }); document.getElementById('pn2').onclick = () => chan.postMessage({ type: 'cmd', cmd: 'next' });
    document.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === ' ') chan.postMessage({ type: 'cmd', cmd: 'next' }); if (e.key === 'ArrowLeft') chan.postMessage({ type: 'cmd', cmd: 'prev' }); });
    chan.postMessage({ type: 'cmd', cmd: 'hello' });
  }

  A.init = () => (/[?&]presenter/.test(location.search) ? presenter() : init());
})();
