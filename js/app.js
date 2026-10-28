/* Simulação do filme (ou vídeo real, se existir) e inicialização. */
(function () {
  const A = window.App;
  const DUR = 4200;

  A.sim = function (el) {
    const box = el.querySelector('[data-sim]'); if (!box) return;
    const stage = box.querySelector('[data-simstage]'), btn = box.querySelector('[data-play]'), scs = Array.from(box.querySelectorAll('[data-simsc]'));
    if (!box._init) {
      box._init = true; box._k = 0; box._t = null;
      const show = k => { box._k = k; scs.forEach((s, i) => { s.classList.remove('on'); if (i === k) { void s.offsetWidth; s.classList.add('on'); } }); };
      const stop = () => { clearInterval(box._t); box._t = null; btn.textContent = '▶ Reproduzir'; };
      const play = () => { if (box._t) { stop(); return; } if (box._k >= scs.length - 1) show(0); else show(box._k); btn.textContent = '❚❚ Pausar';
        box._t = setInterval(() => { if (box._k >= scs.length - 1) { stop(); return; } show(box._k + 1); }, DUR); };
      box._show = show; box._stop = stop; btn.addEventListener('click', play);
      // vídeo real, se existir
      const v = document.createElement('video'); v.preload = 'metadata'; v.muted = true; v.controls = true; v.playsInline = true;
      v.addEventListener('loadedmetadata', () => { stage.innerHTML = ''; stage.appendChild(v); v.style.cssText = 'width:100%;height:100%;object-fit:cover;background:#000'; btn.remove();
        const n = box.querySelector('[data-simnote]'); const b = box.querySelector('.badge'); if (b) { b.className = 'badge b-real'; b.textContent = 'VÍDEO REAL · GOOGLE FLOW'; } if (n) n.textContent = 'Vídeo carregado de assets/videos/film.mp4.'; });
      v.addEventListener('error', () => {}); v.src = window.ASSET_SLOTS.film.file;
    }
    box._show(0);
  };
  A.simStop = function (el) { const box = el.querySelector('[data-sim]'); if (box && box._stop) box._stop(); };

  /* Planta baixa que "sobe" até virar o modelo 3D (slide O modelo inicial) */
  A.build = function (el) {
    const b = el.querySelector('[data-build]'); if (!b) return;
    const r = b.querySelector('input'), plan = b.querySelector('.bl-plan'), mod = b.querySelector('.bl-model'), scan = b.querySelector('.bl-scan'), lab = b.querySelector('[data-bstage]');
    const set = p => {
      mod.style.clipPath = 'inset(' + (100 - p) + '% 0 0 0)';
      plan.style.opacity = 1 - Math.max(0, Math.min(1, (p / 100 - .35) / .4));
      scan.style.top = (100 - p) + '%'; scan.style.opacity = p > 0 && p < 100 ? 1 : 0;
      lab.textContent = p < 30 ? 'Planta baixa — a organização dos espaços' : p < 95 ? 'A planta sobe: paredes, lajes e volumes' : 'Modelo 3D — a casa que usamos';
      r.value = p;
    };
    if (b._video) { b._video.currentTime = 0; b._video.play().catch(() => {}); return; }
    if (!b._probed) {
      b._probed = true;
      const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.controls = true; v.preload = 'auto';
      v.addEventListener('loadedmetadata', () => {
        const m = b.querySelector('.build'); m.innerHTML = ''; m.appendChild(v); v.style.cssText = 'width:100%;height:100%;object-fit:cover;background:#000'; m.style.background = '#000';
        const sl = b.querySelector('.bslide'); if (sl) sl.remove(); const bd = b.querySelector('.badge'); if (bd) { bd.className = 'badge b-real'; bd.textContent = 'VÍDEO REAL · GOOGLE FLOW'; }
        const c = b.querySelector('[data-bstage]'); if (c) c.textContent = 'Da planta baixa ao modelo 3D';
        cancelAnimationFrame(b._raf); clearTimeout(b._to); b._video = v; v.play().catch(() => {});
      });
      v.src = 'assets/videos/planta-modelo.mp4';
    }
    cancelAnimationFrame(b._raf); clearTimeout(b._to); set(0);
    r.oninput = () => { cancelAnimationFrame(b._raf); clearTimeout(b._to); set(+r.value); };
    const T = 5200;
    b._to = setTimeout(() => { const t0 = performance.now(); const tick = now => { const k = Math.min(1, (now - t0) / T), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; set(Math.round(e * 100)); if (k < 1) b._raf = requestAnimationFrame(tick); }; b._raf = requestAnimationFrame(tick); }, 700);
  };

  /* QR codes do último slide, gerados no navegador (sem internet) */
  A.contact = function (el) {
    const box = el.querySelector('[data-contact]'); if (!box || box._ok) return; box._ok = true;
    const C = window.CONTACT || {};
    const qr = url => { const q = window.qrcode(0, 'M'); q.addData(url); q.make(); return q.createSvgTag({ cellSize: 6, margin: 0, scalable: true }); };
    const ig = String(C.instagram || '').replace(/^@/, '').trim(), wa = String(C.whatsapp || '').replace(/\D/g, '');
    const cards = [
      ['Instagram', ig ? '@' + ig : '', ig ? 'https://instagram.com/' + ig : ''],
      ['WhatsApp', wa ? '+' + wa : '', wa ? 'https://wa.me/' + wa + (C.whatsappMsg ? '?text=' + encodeURIComponent(C.whatsappMsg) : '') : '']
    ];
    box.innerHTML = '<div class="who"><span class="nm">' + (C.name || '') + '</span><b>' + (C.role || '') + '</b></div><div class="qrs">' + cards.map(c =>
      '<div class="qrc"><div class="qrimg">' + (c[2] ? qr(c[2]) : '<span>defina em<br>project-data.js</span>') + '</div><div><span class="mono">' + c[0].toUpperCase() + '</span><b>' + (c[1] || '—') + '</b></div></div>').join('') + '</div>';
  };

  try { A.init(); } catch (e) { console.error(e); document.body.insertAdjacentHTML('beforeend', '<pre style="color:#fff;padding:20px">Erro ao iniciar: ' + e.message + '</pre>'); }
})();
