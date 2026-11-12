/* Motor de desenho: gera TODAS as vistas da CASA ENTRE PLANOS a partir de PROJECT.
   Saída = ilustração vetorial (não é render de IA nem fotografia). */
(function () {
  const P = window.PROJECT, G = P.geometryReferences;
  let uid = 0;
  const rng = seed => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const sh = (h, k, t, ta = 0) => { const a = hex(h), b = t ? hex(t) : a; return 'rgb(' + a.map((v, i) => Math.max(0, Math.min(255, Math.round(v * k * (1 - ta) + b[i] * ta)))).join(',') + ')'; };

  const LIGHTS = {
    manha:  { label: 'Manhã', sky: ['#a9c7dc', '#eceadf'], a: .82, b: 1.0, top: 1.08, tint: '#fff2dc', ta: .06, shadow: [-1.1, .8, .22], glass: ['#9db8c4', '#d9e3e2'], gOp: .6, warm: 0, grass: '#7f8f68', pave: '#a09d95', water: ['#79b8c4', '#a8d6d8'] },
    golden: { label: 'Golden hour', sky: ['#587aa6', '#f3b983'], a: .98, b: .55, top: 1.12, tint: '#ff9a4a', ta: .16, shadow: [2.6, 1.0, .34], glass: ['#e7a766', '#f6d9a8'], gOp: .66, warm: .25, grass: '#8a8a55', pave: '#a5917a', water: ['#d8a273', '#f1cfa0'] },
    blue:   { label: 'Blue hour', sky: ['#0f2146', '#5d729b'], a: .52, b: .42, top: .6, tint: '#2c4a8c', ta: .42, shadow: [0, 0, .06], glass: ['#f0b25a', '#e8973c'], gOp: .24, warm: 1, grass: '#3e4a45', pave: '#4a4d57', water: ['#3f93a8', '#6fc3cf'] },
    noite:  { label: 'Noite', sky: ['#05070d', '#1a2238'], a: .3, b: .22, top: .32, tint: '#16203a', ta: .55, shadow: [0, 0, .0], glass: ['#f2b863', '#e5963a'], gOp: .16, warm: 1, grass: '#222d29', pave: '#353841', water: ['#2e8da3', '#5dc0cc'] }
  };

  const BASE0 = { concrete: '#8e8c85', slab: '#a09d96', wood: '#a8774a', stone: '#756f64' };

  let BASE = BASE0;
  const VAR = {
    base: {}, minimal: { base: { concrete: '#b4b2ab', slab: '#c4c1ba', wood: '#b88f63' }, trees: t => t[2] !== 'tree' || t[4] % 3 === 0, ts: .85, L: { grass: '#8d9a78' } },
    tropical: { base: {}, trees: () => true, ts: 1.35, L: { grass: '#5f8a45' } },
    brutal: { base: { concrete: '#5f5d58', slab: '#6c6a65', wood: '#8a6240', stone: '#5a554c' }, trees: t => t[2] !== 'shrub', ts: .9, L: { grass: '#6e7459' } }
  };
  function makeCtx(light, style, rot, variant) {
    const V = VAR[variant] || VAR.base;
    BASE = Object.assign({}, BASE0, V.base || {});
    const L = Object.assign({}, LIGHTS[light] || LIGHTS.golden, V.L || {}), S = 6, c = S * .866, s = S * .5, zk = S;
    const R = (x, y) => rot ? [100 - x, 70 - y] : [x, y];
    const pr = (x, y, z) => { const [a, b] = R(x, y); return [(a - b) * c, (a + b) * s - z * zk]; };
    return { L, light, style, rot, pr, model: style === 'model', V };
  }
  const pts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const poly = (a, fill, extra = '') => '<polygon points="' + pts(a) + '" fill="' + fill + '" ' + extra + '/>';

  function faceOf(b, name) {
    const { x, y, w, d } = b;
    return {
      south: { o: [x, y + d], u: [1, 0], len: w }, east: { o: [x + w, y], u: [0, 1], len: d },
      north: { o: [x, y], u: [1, 0], len: w }, west: { o: [x, y], u: [0, 1], len: d }
    }[name];
  }
  function mapper(ctx, b, name) {
    const f = faceOf(b, name), z0 = b.z || 0;
    return (u, v) => ctx.pr(f.o[0] + f.u[0] * u, f.o[1] + f.u[1] * u, z0 + v);
  }
  const quad = (m, u0, v0, u1, v1) => [m(u0, v0), m(u1, v0), m(u1, v1), m(u0, v1)];
  const ln = (a, b, stroke, w) => '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + stroke + '" stroke-width="' + w + '"/>';

  /* aberturas por caixa/face: [u0,u1,v0,v1,tipo] (u ao longo da face) */
  const OPEN = {
    social: { south: [[1.5, 38.5, .6, 11.8, 'glass']], west: [[25, 40, 1.2, 9.5, 'glass']], north: [[4, 16, 4.5, 10.5, 'win'], [24, 36, 4.5, 10.5, 'win']] },
    hall: { north: [[1, 5, 0, 9.6, 'door']] },
    intimo: { south: [[4, 16, 3, 10, 'louver'], [24, 36, 3, 10, 'louver']], east: [[4, 14, 3, 10, 'louver'], [28, 40, 3, 10, 'louver']], north: [[4, 18, 3, 10, 'louver'], [24, 28, 8, 10.5, 'win'], [33, 37, 8, 10.5, 'win']] },
    servico: { west: [[13, 16.5, 0, 8, 'door']], north: [[4, 9, 5, 8.5, 'win']] }
  };

  function drawFace(ctx, b, name, id) {
    const m = mapper(ctx, b, name), f = faceOf(b, name), L = ctx.L;
    const bright = (name === 'south' || name === 'north') ? L.a : L.b;
    const baseHex = BASE[b.mat === 'stone' ? 'stone' : b.mat === 'wood' ? 'wood' : b.mat === 'slab' ? 'slab' : 'concrete'];
    const full = quad(m, 0, 0, f.len, b.h);
    let out = '';
    if (ctx.model) {
      out += poly(full, name === 'south' || name === 'north' ? '#d3d1ca' : '#bcbab3', 'stroke="#2a2a28" stroke-width=".9" stroke-linejoin="round"');
    } else {
      out += poly(full, sh(baseHex, bright, L.tint, L.ta));
      const r = rng(Math.round(b.x * 7 + b.y * 13 + b.h * 3 + name.length));
      if (b.mat === 'wood') {
        for (let u = 0; u < f.len; u += 1.3) out += ln(m(u, 0), m(u, b.h), 'rgba(0,0,0,' + (Math.round(u / 1.3) % 2 ? .22 : .09) + ')', .8);
      } else if (b.mat === 'stone') {
        for (let v = 0; v < b.h; v += 2.4) {
          out += ln(m(0, v), m(f.len, v), 'rgba(0,0,0,.22)', .6);
          for (let u = r() * 3; u < f.len; u += 2.5 + r() * 3) out += ln(m(u, v), m(u, Math.min(b.h, v + 2.4)), 'rgba(0,0,0,.18)', .6);
        }
      } else if (b.mat !== 'slab') {
        for (let v = 2.4; v < b.h; v += 2.4) out += ln(m(0, v), m(f.len, v), 'rgba(0,0,0,.08)', .6);
        for (let u = 10; u < f.len; u += 10) out += ln(m(u, 0), m(u, b.h), 'rgba(0,0,0,.05)', .6);
      }
    }
    const ops = (OPEN[b.id] || {})[name] || [];
    ops.forEach(o => {
      const [u0, u1, v0, v1, t] = o, q = quad(m, u0, v0, u1, v1);
      if (ctx.model) { out += poly(q, '#a9bcc8', 'stroke="#2a2a28" stroke-width=".7"'); return; }
      if (t === 'door') {
        out += poly(q, sh(BASE.wood, .6 * bright + .15, L.tint, L.ta), 'stroke="rgba(0,0,0,.4)" stroke-width=".6"');
        out += ln(m(u1 - .8, 4.5), m(u1 - .8, 6.5), '#ddd', 1.6);
        if (L.warm > .5) out += poly(quad(m, u0 - 1.2, 0, u1 + 1.2, 1.5), 'rgba(255,190,100,.45)');
        return;
      }
      if (t === 'glass') {
        out += poly(q, L.warm ? 'url(#iw' + id + ')' : '#3a3228');
        if (name === 'south' || name === 'north') out += interior(ctx, m, u0, v0, u1, v1);
        out += poly(q, 'url(#g' + id + ')', 'opacity="' + L.gOp + '"');
        const w = u1 - u0, n = Math.max(2, Math.round(w / 6.2));
        for (let i = 0; i <= n; i++) { const u = u0 + w * i / n; out += ln(m(u, v0), m(u, v1), '#15171a', 1.5); }
        out += poly([m(u0 + w * .1, v0), m(u0 + w * .32, v0), m(u0 + w * .52, v1), m(u0 + w * .3, v1)], '#fff', 'opacity=".07"');
        out += poly(q, 'none', 'stroke="#15171a" stroke-width="1.6"');
        return;
      }
      if (t === 'louver') {
        out += poly(q, L.warm ? 'url(#iw' + id + ')' : '#2d2a25');
        out += poly(q, 'url(#g' + id + ')', 'opacity="' + L.gOp + '"');
        for (let u = u0; u < u1; u += .9) out += ln(m(u, v0), m(u, v1), sh(BASE.wood, .75 * bright + .15, L.tint, L.ta), 1.5);
        out += poly(q, 'none', 'stroke="#15171a" stroke-width="1.1"');
        return;
      }
      out += poly(q, L.warm ? 'url(#iw' + id + ')' : '#2a2c2e', 'stroke="#15171a" stroke-width="1"');
      out += poly(q, 'url(#g' + id + ')', 'opacity="' + L.gOp + '"');
    });
    return out;
  }

  function interior(ctx, m, u0, v0, u1, v1) {
    const L = ctx.L, d = '#241f1a';
    const R = (a, b, c, e, f, o = 1) => poly(quad(m, a, b, c, e), f, 'opacity="' + o + '"');
    let o = '';
    o += R(u0, v0, u1, v0 + 1, L.warm ? '#4a3a2b' : '#4b4034');
    o += R(u0, v1 - 1.3, u1, v1, L.warm ? '#c88a52' : '#7d5a39');
    o += R(14, .9, 28, 3, d, .92); o += R(14.5, 3, 27.5, 5.2, d, .92);
    o += R(18, .9, 24, 1.8, '#b66d4d', .85);
    o += R(29, 3.4, 37, 3.9, d, .92); o += R(30, .9, 30.5, 3.4, d); o += R(36, .9, 36.5, 3.4, d);
    for (const u of [31.5, 35]) { o += ln(m(u, v1 - 1.3), m(u, 8.2), '#111', .7) + R(u - .9, 7.6, u + .9, 8.4, L.warm ? '#ffe2a8' : '#ddd', .9); }
    o += R(u1 - 3, .9, u1 - .5, 9, '#3a2f25', .9);
    o += R(4, .9, 7, 4.5, '#3c5a3a', .9);
    if (L.warm) o += R(u0, v0, u1, v1, 'rgba(255,170,80,.12)', 1);
    return o;
  }

  function tree(ctx, t) {
    const L = ctx.L, [x, y, type, sz, seed] = t, [px, py] = ctx.pr(x, y, 0), r = rng(seed);
    const g = k => sh(type === 'palm' ? '#4f7a3b' : '#496b36', k, L.tint, L.ta);
    let o = '<ellipse cx="' + (px + 6 * sz).toFixed(1) + '" cy="' + (py + 2).toFixed(1) + '" rx="' + (14 * sz) + '" ry="' + (5 * sz) + '" fill="#000" opacity="' + (.15 + L.shadow[2] * .4) + '"/>';
    if (type === 'palm') {
      const h = 78 * sz, lean = (r() - .5) * 16, tx = px + lean, ty = py - h;
      o += '<path d="M' + px + ',' + py + ' Q' + (px + lean * .2) + ',' + (py - h * .5) + ' ' + tx + ',' + ty + '" stroke="' + sh('#7b6648', 1, L.tint, L.ta) + '" stroke-width="' + (3.4 * sz) + '" fill="none" stroke-linecap="round"/>';
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * Math.PI * 2 + r() * .3, len = (30 + r() * 10) * sz;
        const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * .45 + len * .25;
        o += '<path d="M' + tx + ',' + ty + ' Q' + (tx + Math.cos(a) * len * .5) + ',' + (ty - 10 * sz) + ' ' + ex + ',' + ey + '" stroke="' + g(.85 + r() * .3) + '" stroke-width="' + (4 * sz) + '" fill="none" stroke-linecap="round"/>';
      }
    } else if (type === 'shrub') {
      for (let i = 0; i < 4; i++) o += '<ellipse cx="' + (px + (r() - .5) * 26 * sz).toFixed(1) + '" cy="' + (py - (6 + r() * 8) * sz).toFixed(1) + '" rx="' + ((11 + r() * 6) * sz).toFixed(1) + '" ry="' + ((8 + r() * 4) * sz).toFixed(1) + '" fill="' + g(.7 + r() * .5) + '"/>';
    } else {
      const h = 54 * sz;
      o += '<path d="M' + px + ',' + py + ' L' + px + ',' + (py - h * .7) + '" stroke="' + sh('#5d4a36', 1, L.tint, L.ta) + '" stroke-width="' + (4 * sz) + '"/>';
      for (let i = 0; i < 6; i++) o += '<ellipse cx="' + (px + (r() - .5) * 46 * sz).toFixed(1) + '" cy="' + (py - h * .8 - r() * 26 * sz).toFixed(1) + '" rx="' + ((16 + r() * 12) * sz).toFixed(1) + '" ry="' + ((13 + r() * 9) * sz).toFixed(1) + '" fill="' + g(.6 + r() * .6) + '"/>';
    }
    if (ctx.light === 'noite' && type !== 'shrub') o += '<ellipse cx="' + px + '" cy="' + (py - 2) + '" rx="' + (16 * sz) + '" ry="' + (6 * sz) + '" fill="#ffc67a" opacity=".28"/>';
    return o;
  }

  const TREES = [];
  (function () {
    const r = rng(77), add = (x, y, t, s) => TREES.push([x, y, t, s, Math.floor(r() * 9999) + 1]);
    [[-9, 6], [-8, 26], [-10, 46], [-7, 66], [-9, 86]].forEach(p => add(p[0], p[1], 'tree', 1.25));
    [[106, 52], [108, 70], [105, 88], [110, 30]].forEach(p => add(p[0], p[1], 'tree', 1.2));
    [[4, 66, 'palm'], [12, 78, 'palm'], [56, 80, 'palm'], [88, 74, 'palm'], [70, 66, 'palm'], [96, 62, 'palm'], [-2, 52, 'palm']].forEach(p => add(p[0], p[1], p[2], 1.1 + r() * .25));
    [[30, 76], [44, 84], [72, 86], [84, 90], [20, 88], [100, 80]].forEach(p => add(p[0], p[1], 'tree', 1.05));
    [[16, 54], [27, 56], [52, 56], [8, 56], [62, 52], [72, 50], [98, 50], [-4, 36], [104, 44], [60, 62]].forEach(p => add(p[0], p[1], 'shrub', 1.0));
    [[-4, -10], [4, -12], [20, -12], [40, -12], [70, -12], [92, -12], [104, -10]].forEach(p => add(p[0], p[1], r() > .5 ? 'tree' : 'palm', 1.0));
  })();

  const NEIGHBORS = [
    { id: 'n1', x: -62, y: 8, w: 34, d: 40, z: 0, h: 16, mat: 'slab' }, { id: 'n2', x: 124, y: 22, w: 36, d: 34, z: 0, h: 14, mat: 'slab' },
    { id: 'n3', x: 30, y: -70, w: 44, d: 22, z: 0, h: 14, mat: 'slab' }
  ];

  const VIEWS = {
    hero: [-870, -380, 2000, 1125], wide: [-1100, -520, 2400, 1350], facade: [-330, 40, 620, 349],
    acesso: [-380, 170, 480, 270], interior: [-185, 92, 270, 152], mat: [-420, 170, 560, 315],
    fim: [-950, -400, 2100, 1181]
  };

  function render(o) {
    o = Object.assign({ light: 'golden', style: 'render', view: 'hero', rot: 0, label: '' }, o);
    const id = 'h' + (++uid), ctx = makeCtx(o.light, o.style, o.rot, o.variant), L = ctx.L, pr = ctx.pr, model = ctx.model;
    const v = Array.isArray(o.view) ? o.view : VIEWS[o.view] || VIEWS.hero;
    const bigGround = [[-500, -500], [600, -500], [600, 600], [-500, 600]].map(p => pr(p[0], p[1], 0));
    let defs = '<linearGradient id="g' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + L.glass[0] + '"/><stop offset="1" stop-color="' + L.glass[1] + '"/></linearGradient>';
    defs += '<linearGradient id="sky' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + L.sky[0] + '"/><stop offset="1" stop-color="' + L.sky[1] + '"/></linearGradient>';
    defs += '<linearGradient id="iw' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d98f3e"/><stop offset="1" stop-color="#7a4a22"/></linearGradient>';
    defs += '<linearGradient id="hz' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + L.sky[1] + '" stop-opacity=".95"/><stop offset="1" stop-color="' + L.sky[1] + '" stop-opacity="0"/></linearGradient>';
    defs += '<linearGradient id="wt' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + L.water[0] + '"/><stop offset="1" stop-color="' + L.water[1] + '"/></linearGradient>';
    let s = '<rect x="' + (v[0] - 400) + '" y="' + (v[1] - 400) + '" width="' + (v[2] + 800) + '" height="' + (v[3] + 800) + '" fill="url(#sky' + id + ')"/>';
    s += poly(bigGround, model ? '#dedcd6' : sh(L.grass, 1, L.tint, L.ta * .6));
    if (model) for (let i = -40; i <= 140; i += 10) {
      s += ln(pr(i, -40, 0), pr(i, 140, 0), '#c4c2bb', .8) + ln(pr(-40, i, 0), pr(140, i, 0), '#c4c2bb', .8);
    }
    const flat = (x, y, w, d, fill, extra = '') => poly([pr(x, y, 0), pr(x + w, y, 0), pr(x + w, y + d, 0), pr(x, y + d, 0)], fill, extra);
    if (!model) {
      s += flat(-200, -44, 500, 16, sh('#3c3d3f', 1, L.tint, L.ta));
      s += flat(-200, -28, 500, 4, sh(L.pave, 1.05, L.tint, L.ta * .5));
      s += flat(54, -24, 6, 24, sh(L.pave, 1.1, L.tint, L.ta * .5));
      const dk = G.deck, pl = G.pool;
      s += flat(dk[0], dk[1], dk[2], dk[3], sh(BASE.wood, 1, L.tint, L.ta));
      s += flat(pl[0] - 2, pl[1] - 2, pl[2] + 4, pl[3] + 4, sh(BASE.slab, 1, L.tint, L.ta));
      s += flat(pl[0], pl[1], pl[2], pl[3], 'url(#wt' + id + ')');
      s += poly([pr(pl[0] + 3, pl[1] + 2, 0), pr(pl[0] + 9, pl[1] + 2, 0), pr(pl[0] + 5, pl[1] + 8, 0), pr(pl[0] + 1, pl[1] + 8, 0)], '#fff', 'opacity=".18"');
    }
    const sv = L.shadow;
    if (!model && sv[2] > 0) {
      let g = '';
      const casters = G.boxes.map(b => [b.x, b.y, b.w, b.d, b.h]).concat(G.planes.map(p => [p.x, p.y, p.w, p.d, p.z + p.t, true]));
      casters.forEach(b => {
        const [x, y, w, d, h, fl] = b, dx = sv[0] * h, dy = sv[1] * h, c4 = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
        g += poly(c4.map(p => pr(p[0] + dx, p[1] + dy, 0)), '#000');
        if (!fl) for (let i = 0; i < 4; i++) {
          const a = c4[i], bb = c4[(i + 1) % 4];
          g += poly([pr(a[0], a[1], 0), pr(bb[0], bb[1], 0), pr(bb[0] + dx, bb[1] + dy, 0), pr(a[0] + dx, a[1] + dy, 0)], '#000');
        }
      });
      s += '<g opacity="' + sv[2] + '">' + g + '</g>';
    }
    const items = [], depth = (x, y) => { const [a, b] = ctx.rot ? [100 - x, 70 - y] : [x, y]; return a + b; };
    const faces = ctx.rot ? ['north', 'west'] : ['south', 'east'];
    const drawBox = b => {
      let out = '';
      faces.forEach(f => out += drawFace(ctx, b, f, id));
      const top = (b.z || 0) + b.h;
      const T = [pr(b.x, b.y, top), pr(b.x + b.w, b.y, top), pr(b.x + b.w, b.y + b.d, top), pr(b.x, b.y + b.d, top)];
      const tb = b.mat === 'slab' ? BASE.slab : b.mat === 'wood' ? BASE.wood : b.mat === 'stone' ? BASE.stone : BASE.concrete;
      out += poly(T, model ? '#ecebe6' : sh(tb, L.top, L.tint, L.ta), model ? 'stroke="#2a2a28" stroke-width=".9" stroke-linejoin="round"' : '');
      return out;
    };
    if (!model) NEIGHBORS.forEach(n => items.push({ k: depth(n.x + n.w / 2, n.y + n.d / 2), f: () => drawBox(n) }));
    G.boxes.forEach(b => items.push({ k: depth(b.x + b.w / 2, b.y + b.d / 2), f: () => drawBox(Object.assign({ z: 0 }, b)) }));
    G.supports.forEach(b => items.push({ k: depth(b.x + b.w / 2, b.y + b.d / 2) + 1, f: () => drawBox(Object.assign({ id: 'sup', z: 0 }, b)) }));
    G.planes.forEach(p => items.push({ k: depth(p.x + p.w, p.y + p.d) + 2, f: () => drawBox({ id: p.id, x: p.x, y: p.y, w: p.w, d: p.d, z: p.z, h: p.t, mat: 'slab' }) }));
    if (!model) TREES.filter(ctx.V.trees || (() => true)).forEach(t => items.push({ k: depth(t[0], t[1]) + (t[2] === 'shrub' ? .5 : 0), f: () => tree(ctx, [t[0], t[1], t[2], t[3] * (ctx.V.ts || 1), t[4]]) }));
    items.sort((a, b) => a.k - b.k);
    s += items.map(i => i.f()).join('');
    if (!model && L.warm > .5) {
      s += [[56, 52], [14, 52], [34, 52], [40, 70], [22, 70], [58, 62], [54, 30]].map(p => {
        const q = pr(p[0], p[1], 2);
        return '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="22" fill="#ffc46f" opacity="' + (ctx.light === 'noite' ? .2 : .13) + '"/><circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="2.2" fill="#ffe3a8"/>';
      }).join('');
    }
    if (!model) s += '<rect x="' + (v[0] - 400) + '" y="' + (v[1] - 400) + '" width="' + (v[2] + 800) + '" height="' + (v[3] * .5 + 400) + '" fill="url(#hz' + id + ')" opacity=".5"/>';
    const lbl = o.label ? '<text x="' + (v[0] + 18) + '" y="' + (v[1] + v[3] - 16) + '" font-family="monospace" font-size="' + (v[2] / 70) + '" fill="' + (model ? '#555' : '#f4f1ea') + '" opacity=".85">' + o.label + '</text>' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + v.join(' ') + '" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + (o.alt || 'Casa Entre Planos') + '"><defs>' + defs + '</defs>' + s + lbl + '</svg>';
  }

  window.House = { render, LIGHTS, VIEWS, pt: (x, y, z) => makeCtx('golden', 'render', 0).pr(x, y, z) };
})();
