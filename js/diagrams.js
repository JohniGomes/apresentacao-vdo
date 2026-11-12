/* Planta esquemática, diagrama de bolhas, implantação (vista de topo) e texturas do moodboard.
   Tudo derivado de PROJECT. Unidade conceitual "u" — sem escala real. */
(function () {
  const P = window.PROJECT, R = P.rooms, G = P.geometryReferences;
  const C = P.colorPalette;
  const f1 = n => (+n).toFixed(1);
  const rng = seed => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

  const SECTOR = { social: { name: 'Social', color: '#727B65' }, intimo: { name: 'Íntimo', color: '#B66D4D' }, servico: { name: 'Serviço', color: '#8d8d86' }, neutro: { name: 'Circulação', color: '#c9c5b9' } };
  const sectorOf = id => { const z = P.zoning; return z.social.includes(id) ? 'social' : z.intimo.includes(id) ? 'intimo' : z.servico.includes(id) ? 'servico' : 'neutro'; };
  const center = id => { const rs = R[id].rects; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; rs.forEach(r => { x0 = Math.min(x0, r[0]); y0 = Math.min(y0, r[1]); x1 = Math.max(x1, r[0] + r[2]); y1 = Math.max(y1, r[1] + r[3]); }); return [(x0 + x1) / 2, (y0 + y1) / 2]; };

  /* Bolhas: posição de diagrama (dx,dy), raio ilustrativo, relações e justificativa. */
  const BUBBLES = [
    { id: 'lavanderia', dx: 6, dy: 8, r: 7, links: ['servico', 'cozinha'], why: 'Fica colada à cozinha para encurtar o fluxo de roupas e insumos, longe da área social.' },
    { id: 'servico', dx: 6, dy: 30, r: 6, links: ['lavanderia', 'cozinha'], why: 'Acesso independente de serviço, sem atravessar a sala de estar.' },
    { id: 'cozinha', dx: 28, dy: 16, r: 10, links: ['jantar', 'lavanderia', 'servico', 'estar'], why: 'Conecta serviço e jantar; integrada ao estar por abertura contínua.' },
    { id: 'jantar', dx: 50, dy: 8, r: 9, links: ['cozinha', 'estar', 'circulacao'], why: 'Entre cozinha e estar: serve às duas e fica próxima da entrada.' },
    { id: 'estar', dx: 40, dy: 40, r: 14, links: ['jantar', 'cozinha', 'varanda', 'jardim', 'circulacao'], why: 'Coração social, voltada ao jardim; o grande vão de vidro liga interior e exterior.' },
    { id: 'varanda', dx: 40, dy: 64, r: 9, links: ['estar', 'jardim'], why: 'Transição coberta pela laje: sombra, abrigo e extensão da sala.' },
    { id: 'jardim', dx: 68, dy: 72, r: 12, links: ['varanda', 'estar', 'suite'], why: 'Paisagismo e piscina ao sul, visíveis da sala e da suíte.' },
    { id: 'circulacao', dx: 66, dy: 28, r: 6, links: ['estar', 'jantar', 'suite', 'quartos', 'banhos'], why: 'Eixo que separa o setor social do íntimo e distribui os acessos.' },
    { id: 'suite', dx: 88, dy: 10, r: 11, links: ['circulacao', 'banhos', 'jardim'], why: 'Mais reservada: ao fundo da ala íntima, com banheiro próprio e vista do jardim.' },
    { id: 'banhos', dx: 96, dy: 32, r: 7, links: ['suite', 'quartos', 'circulacao'], why: 'Agrupados em faixa para concentrar as instalações hidráulicas.' },
    { id: 'quartos', dx: 84, dy: 54, r: 12, links: ['circulacao', 'banhos'], why: 'Abertos à ala íntima e ao jardim; compartilham os banheiros.' }
  ];
  const FLOWS = [['jardim', 'varanda', 'estar'], ['cozinha', 'jantar', 'estar'], ['circulacao', 'quartos']];

  /* ---------- Planta ---------- */
  const DOORS = [[54, 0, 1, 0, 0, 1, 6], [62, 18, 1, 0, 0, -1, 3.2], [62, 24, 1, 0, 0, 1, 3.2], [82, 24, 1, 0, 0, 1, 3.2], [82, 12, 0, 1, -1, 0, 3], [91, 18, 1, 0, 0, -1, 3], [14, 2, 0, 1, -1, 0, 3.2], [0, 13, 0, 1, -1, 0, 3]];
  const WINS = [[16, 44, 52, 44], [14, 24, 14, 40], [18, 0, 30, 0], [38, 0, 50, 0], [64, 0, 78, 0], [84, 0, 88, 0], [93, 0, 97, 0], [64, 44, 76, 44], [84, 44, 96, 44], [100, 4, 100, 14], [100, 28, 100, 40], [4, 0, 9, 0]];
  const GAPS = [[14, 18, 54, 18], [34, 1.5, 34, 16.5], [54, 19, 54, 23]];
  const LABELS = [['estar', 'SALA DE ESTAR', 34, 31, 2.1], ['jantar', 'JANTAR', 44, 13.5, 1.8], ['cozinha', 'COZINHA', 24, 13.5, 1.8], ['suite', 'SUÍTE', 71, 14.5, 1.9], ['quartos', 'QUARTO', 70, 41, 1.8], ['quartos', 'QUARTO', 90, 41, 1.8], ['banhos', 'WC', 86, 16, 1.4], ['banhos', 'WC', 95, 16, 1.4], ['circulacao', 'CIRC.', 77, 21.4, 1.2], ['circulacao', 'HALL', 57, 11, 1.1], ['lavanderia', 'LAV.', 7, 6, 1.4], ['servico', 'SERV.', 7, 15, 1.3], ['varanda', 'VARANDA COBERTA', 35, 49, 1.7], ['jardim', 'JARDIM', 78, 66, 2.2]];

  function planInner(o) {
    o = Object.assign({ tint: true, furn: true, labels: true, flow: false, paper: '#F4F1EA', ink: '#101110', ext: true }, o);
    const ink = o.ink; let s = '';
    if (o.ext) {
      s += '<rect x="-4" y="-6" width="108" height="90" fill="none" stroke="' + ink + '" stroke-opacity=".25" stroke-width=".25" stroke-dasharray="1.2 1"/>';
      s += '<rect x="0" y="52" width="100" height="30" fill="#727B65" fill-opacity=".10"/>';
      const dk = G.deck, pl = G.pool;
      s += '<rect x="' + dk[0] + '" y="' + dk[1] + '" width="' + dk[2] + '" height="' + dk[3] + '" fill="#a8774a" fill-opacity=".25" stroke="' + ink + '" stroke-width=".25"/>';
      for (let x = dk[0] + 2; x < dk[0] + dk[2]; x += 2) s += '<line x1="' + x + '" y1="' + dk[1] + '" x2="' + x + '" y2="' + (dk[1] + dk[3]) + '" stroke="' + ink + '" stroke-opacity=".18" stroke-width=".15"/>';
      s += '<rect x="' + pl[0] + '" y="' + pl[1] + '" width="' + pl[2] + '" height="' + pl[3] + '" fill="#7fb3bd" fill-opacity=".45" stroke="' + ink + '" stroke-width=".35"/>';
      [[8, 70], [88, 66], [60, 76], [34, 76], [10, 62], [94, 76], [70, 58]].forEach((t, i) => { s += '<circle cx="' + t[0] + '" cy="' + t[1] + '" r="' + (3 + i % 3) + '" fill="#727B65" fill-opacity=".35" stroke="' + ink + '" stroke-width=".2"/>'; });
      s += '<rect x="54" y="-6" width="6" height="6" fill="#999" fill-opacity=".25" stroke="' + ink + '" stroke-width=".2"/><text x="57" y="-7" font-size="1.3" text-anchor="middle" fill="' + ink + '" font-family="monospace">ACESSO</text>';
    }
    if (o.tint) Object.keys(R).forEach(id => {
      if (id === 'jardim' || id === 'varanda') return;
      const sec = sectorOf(id), col = SECTOR[sec].color, op = sec === 'neutro' ? .25 : .22;
      R[id].rects.forEach(r => { s += '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" fill="' + col + '" fill-opacity="' + op + '"/>'; });
    });
    Object.keys(R).forEach(id => { if (id === 'jardim' || id === 'varanda') return; R[id].rects.forEach(r => { s += '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" fill="none" stroke="' + ink + '" stroke-width=".55"/>'; }); });
    G.boxes.forEach(b => { s += '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.d + '" fill="none" stroke="' + ink + '" stroke-width="1.1"/>'; });
    GAPS.forEach(g => { s += '<line x1="' + g[0] + '" y1="' + g[1] + '" x2="' + g[2] + '" y2="' + g[3] + '" stroke="' + o.paper + '" stroke-width="1.5"/>'; });
    WINS.forEach(w => {
      const v = w[0] === w[2];
      s += '<line x1="' + w[0] + '" y1="' + w[1] + '" x2="' + w[2] + '" y2="' + w[3] + '" stroke="' + o.paper + '" stroke-width="1.5"/>';
      [-.45, .45].forEach(k => { s += '<line x1="' + (w[0] + (v ? k : 0)) + '" y1="' + (w[1] + (v ? 0 : k)) + '" x2="' + (w[2] + (v ? k : 0)) + '" y2="' + (w[3] + (v ? 0 : k)) + '" stroke="' + ink + '" stroke-width=".22"/>'; });
    });
    DOORS.forEach(d => {
      const [hx, hy, dx, dy, nx, ny, L] = d, ex = hx + dx * L, ey = hy + dy * L, ox = hx + nx * L, oy = hy + ny * L, sw = (dx * ny - dy * nx) > 0 ? 1 : 0;
      s += '<line x1="' + hx + '" y1="' + hy + '" x2="' + ex + '" y2="' + ey + '" stroke="' + o.paper + '" stroke-width="1.5"/>';
      s += '<line x1="' + hx + '" y1="' + hy + '" x2="' + ox + '" y2="' + oy + '" stroke="' + ink + '" stroke-width=".3"/><path d="M' + ex + ',' + ey + ' A' + L + ',' + L + ' 0 0 ' + sw + ' ' + ox + ',' + oy + '" fill="none" stroke="' + ink + '" stroke-width=".18" stroke-dasharray=".7 .5"/>';
    });
    if (o.furn) {
      const fr = (x, y, w, h, r = .4) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="' + o.paper + '" fill-opacity=".7" stroke="' + ink + '" stroke-width=".22"/>';
      s += fr(22, 34, 14, 5) + fr(18, 28, 4, 5) + fr(25, 27.5, 8, 4.5) + fr(46, 24, 5, 10);          // sofá, poltrona, mesa, estante
      s += fr(37, 5, 12, 5, .6) + [38.5, 42, 45.5].map(x => fr(x, 3.4, 1.6, 1.3, .3) + fr(x, 10.3, 1.6, 1.3, .3)).join(''); // jantar
      s += fr(15, 1, 18, 2.4, .2) + fr(19, 9, 11, 3.2, .3);                                                // bancada e ilha
      s += fr(62, 6, 10, 9, .5) + fr(62, 4, 3.5, 1.6, .5) + fr(67, 4, 3.5, 1.6, .5);                     // cama suíte
      s += fr(62, 33, 8, 8, .5) + fr(82, 33, 8, 8, .5) + fr(1, 1, 5, 6, .3) + fr(8, 12, 5, 4, .3);        // camas, lavadora
      [[83, 2, 3, 3], [84, 13, 5, 2.5], [92, 2, 4, 3], [93, 12, 5, 2.5]].forEach(a => { s += fr(a[0], a[1], a[2], a[3], .8); });
    }
    if (o.flow) FLOWS.concat([['entrada', 'circulacao', 'estar']]).forEach(f => {
      let path;
      if (f[0] === 'entrada') path = [[57, -5], [57, 20], [52, 22]];
      else path = f.map(id => center(id));
      s += '<polyline points="' + path.map(p => p.join(',')).join(' ') + '" fill="none" stroke="#B66D4D" stroke-width=".7" stroke-dasharray="1.6 1" marker-end="url(#ar)"/>';
    });
    if (o.labels) LABELS.forEach(l => { s += '<text x="' + l[2] + '" y="' + l[3] + '" font-family="Inter,Arial,sans-serif" font-weight="600" font-size="' + l[4] + '" letter-spacing=".12" text-anchor="middle" fill="' + ink + '">' + l[1] + '</text>'; });
    return s;
  }
  const arrowDef = '<marker id="ar" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#B66D4D"/></marker>';
  function planSVG(o) { return '<svg viewBox="-6 -9 112 94" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Planta esquemática da Casa Entre Planos"><defs>' + arrowDef + '</defs>' + planInner(o) + '</svg>'; }

  /* ---------- Implantação / vista de topo ---------- */
  const T = 6, SX = x => 800 + (x - 50) * T, SY = y => 450 + (y - 30) * T;
  function siteSVG(stage, layers) {
    layers = layers || {};
    const r = rng(11), L = P.siteAssumptions.lot;
    let s = '<rect width="1600" height="900" fill="#5f6a52"/>';
    // lotes vizinhos e ruas
    s += '<rect x="0" y="' + SY(-40) + '" width="1600" height="' + (T * 16) + '" fill="#34363a"/><line x1="0" y1="' + SY(-32) + '" x2="1600" y2="' + SY(-32) + '" stroke="#e9e3c9" stroke-width="2" stroke-dasharray="26 22" opacity=".7"/>';
    s += '<rect x="0" y="' + SY(-24) + '" width="1600" height="' + (T * 7) + '" fill="#a8a59c"/>';
    s += '<rect x="' + SX(135) + '" y="' + SY(-24) + '" width="' + (T * 14) + '" height="900" fill="#34363a"/>';
    const nb = [[-70, -14, 32, 52, '#b05a43'], [-70, 46, 30, 38, '#8f8f8a'], [118, -14, 30, 40, '#9a9a94'], [118, 40, 36, 44, '#b66d4d']];
    nb.forEach(n => { s += '<rect x="' + SX(n[0] - 6) + '" y="' + SY(n[1] - 4) + '" width="' + (T * (n[2] + 12)) + '" height="' + (T * (n[3] + 8)) + '" fill="#6d7a5c"/><rect x="' + SX(n[0]) + '" y="' + SY(n[1]) + '" width="' + (T * n[2]) + '" height="' + (T * n[3]) + '" fill="' + n[4] + '" stroke="#00000044" stroke-width="2"/><line x1="' + SX(n[0]) + '" y1="' + SY(n[1] + n[3] / 2) + '" x2="' + SX(n[0] + n[2]) + '" y2="' + SY(n[1] + n[3] / 2) + '" stroke="#00000033" stroke-width="2"/>'; });
    // lote
    s += '<rect x="' + SX(L.x) + '" y="' + SY(L.y) + '" width="' + (T * L.w) + '" height="' + (T * L.d) + '" fill="#7d8c62"/>';
    const tree = (x, y, rad, o) => { let g = '<circle cx="' + SX(x) + '" cy="' + SY(y) + '" r="' + rad * T + '" fill="#000" opacity=".18" transform="translate(5,6)"/>'; for (let i = 0; i < 4; i++) g += '<circle cx="' + (SX(x) + (r() - .5) * rad * T * .6) + '" cy="' + (SY(y) + (r() - .5) * rad * T * .6) + '" r="' + (rad * T * (.55 + r() * .3)) + '" fill="' + ['#3f6b34', '#4d7c3b', '#35592c'][i % 3] + '" opacity="' + (o || 1) + '"/>'; return g; };
    const existing = [[-6, -8, 4], [108, -10, 3.6], [-8, 70, 5], [110, 84, 4.4], [102, 20, 3]];
    const keep = stage === 'concept' ? [[-8, 70, 5], [110, 84, 4.4], [-6, -8, 4], [108, -10, 3.6]] : existing;
    [[-60, -20, 4], [-52, 30, 4.5], [-60, 70, 4], [130, -6, 4], [138, 60, 4.5], [124, 92, 4]].forEach(t => { s += tree(t[0], t[1], t[2]); });
    keep.forEach(t => { s += tree(t[0], t[1], t[2]); });
    if (stage === 'concept') {
      const dk = G.deck, pl = G.pool, sh = 4;
      s += '<rect x="' + SX(54) + '" y="' + SY(-24) + '" width="' + (T * 6) + '" height="' + (T * 24) + '" fill="#b7b2a6"/>';                                  // acesso
      s += '<rect x="' + SX(dk[0]) + '" y="' + SY(dk[1]) + '" width="' + (T * dk[2]) + '" height="' + (T * dk[3]) + '" fill="#a8774a"/>';
      s += '<rect x="' + SX(pl[0] - 2) + '" y="' + SY(pl[1] - 2) + '" width="' + (T * (pl[2] + 4)) + '" height="' + (T * (pl[3] + 4)) + '" fill="#b9b5aa"/><rect x="' + SX(pl[0]) + '" y="' + SY(pl[1]) + '" width="' + (T * pl[2]) + '" height="' + (T * pl[3]) + '" fill="#58a8b6"/>';
      [[4, 66, 3], [14, 82, 3.4], [58, 82, 3.4], [88, 76, 3.6], [76, 66, 3], [96, 60, 2.8]].forEach(t => { s += tree(t[0], t[1], t[2]); });
      // sombra e lajes (vista de topo)
      const roof = (x, y, w, d, fill, sd) => (sd ? '<rect x="' + (SX(x) + 7) + '" y="' + (SY(y) + 9) + '" width="' + (T * w) + '" height="' + (T * d) + '" fill="#000" opacity=".3"/>' : '') + '<rect x="' + SX(x) + '" y="' + SY(y) + '" width="' + (T * w) + '" height="' + (T * d) + '" fill="' + fill + '"/>';
      s += roof(0, 0, 14, 18, '#7b756a', 1) + roof(54, 0, 6, 24, '#a8774a', 0);
      s += roof(58, -3, 44, 50, '#a7a49c', 1) + roof(11, -3, 46, 57, '#b8b5ad', 1);
      s += '<g stroke="#00000022" stroke-width="2"><line x1="' + SX(11) + '" y1="' + SY(20) + '" x2="' + SX(57) + '" y2="' + SY(20) + '"/><line x1="' + SX(58) + '" y1="' + SY(22) + '" x2="' + SX(102) + '" y2="' + SY(22) + '"/></g>';
    }
    // contorno do lote
    s += '<rect x="' + SX(L.x) + '" y="' + SY(L.y) + '" width="' + (T * L.w) + '" height="' + (T * L.d) + '" fill="none" stroke="#B66D4D" stroke-width="5" stroke-dasharray="22 10"/>';
    // legendas
    const lab = (x, y, t, a) => '<text x="' + x + '" y="' + y + '" font-family="JetBrains Mono,Consolas,monospace" font-size="19" letter-spacing="1.5" fill="#F4F1EA" text-anchor="' + (a || 'start') + '" style="paint-order:stroke" stroke="#101110" stroke-width="5" stroke-linejoin="round">' + t + '</text>';
    s += lab(SX(L.x) + 10, SY(L.y + L.d) + 28, 'LOTE CONCEITUAL (NÃO É ENDEREÇO REAL)');
    s += lab(800, SY(-34) + 8, 'RUA (ACESSO)', 'middle') + lab(SX(135) + 42, 120, 'RUA', 'middle');
    if (layers.access || stage === 'analysis' && layers.access !== false) {}
    // camadas analíticas
    if (stage === 'analysis') {
      const arrow = (x1, y1, x2, y2, col, w) => '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="' + (w || 6) + '" marker-end="url(#ah' + col.slice(1) + ')"/>';
      const mk = c => '<marker id="ah' + c.slice(1) + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + c + '"/></marker>';
      s += '<defs>' + mk('#F4F1EA') + mk('#B66D4D') + mk('#ffd479') + '</defs>';
      if (layers.acessos) s += '<g>' + arrow(SX(57), SY(-36), SX(57), SY(-2), '#F4F1EA', 8) + arrow(SX(30), SY(-27), SX(12), SY(-27), '#F4F1EA', 5) + lab(SX(60), SY(-8), 'ACESSO PRINCIPAL') + lab(SX(2), SY(-30), 'VIA / CALÇADA') + '</g>';
      if (layers.vegetacao) s += '<g>' + existing.map(t => '<circle cx="' + SX(t[0]) + '" cy="' + SY(t[1]) + '" r="' + (t[2] * T + 14) + '" fill="none" stroke="#9fd68a" stroke-width="4" stroke-dasharray="8 6"/>').join('') + lab(SX(-10), SY(76) + 8, 'VEGETAÇÃO A AVALIAR') + '</g>';
      if (layers.barreiras) s += '<g stroke="#ffd479" stroke-width="10" opacity=".85"><line x1="' + SX(-14) + '" y1="' + SY(-16) + '" x2="' + SX(-14) + '" y2="' + SY(96) + '"/><line x1="' + SX(114) + '" y1="' + SY(-16) + '" x2="' + SX(114) + '" y2="' + SY(96) + '"/></g>' + (layers.barreiras ? lab(SX(-14) - 12, SY(40), 'VIZINHO', 'end') + lab(SX(114) + 14, SY(10), 'VIZINHO') : '');
      if (layers.condicionantes) s += '<g>' + lab(SX(50), SY(-11), 'RECUO FRONTAL (A VERIFICAR NA LEGISLAÇÃO)', 'middle') + '<line x1="' + SX(-14) + '" y1="' + SY(-8) + '" x2="' + SX(114) + '" y2="' + SY(-8) + '" stroke="#B66D4D" stroke-width="3" stroke-dasharray="6 8"/></g>';
      if (layers.hipoteses) s += '<g><rect x="' + SX(2) + '" y="' + SY(-2) + '" width="' + (T * 100) + '" height="' + (T * 52) + '" fill="#B66D4D" fill-opacity=".18" stroke="#B66D4D" stroke-width="4"/>' + lab(SX(52), SY(24), 'HIPÓTESE: BLOCO ALONGADO LESTE–OESTE', 'middle') + '<rect x="' + SX(2) + '" y="' + SY(54) + '" width="' + (T * 100) + '" height="' + (T * 36) + '" fill="#727B65" fill-opacity=".3" stroke="#9fd68a" stroke-width="4" stroke-dasharray="10 8"/>' + lab(SX(52), SY(74), 'HIPÓTESE: JARDIM + PISCINA AO SUL (ESQUEMA)', 'middle') + '</g>';
    }
    return '<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vista de topo do lote conceitual">' + s + '</svg>';
  }

  /* ---------- Texturas / vinhetas do moodboard ---------- */
  function tex(kind, seed, light) {
    const r = rng(seed || 3), W = 400, H = 300;
    let s = '', bg = '#777';
    const rect = (x, y, w, h, f, o) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + f + '"' + (o ? ' opacity="' + o + '"' : '') + '/>';
    if (kind === 'concrete') { s += rect(0, 0, W, H, '#8e8c85'); for (let y = 0; y < H; y += 30) s += rect(0, y, W, 1.5, '#000', .18); for (let i = 0; i < 140; i++) s += '<circle cx="' + r() * W + '" cy="' + r() * H + '" r="' + r() * 2.2 + '" fill="#000" opacity="' + r() * .12 + '"/>'; for (let x = 60; x < W; x += 120) for (let y = 15; y < H; y += 60) s += '<circle cx="' + x + '" cy="' + y + '" r="3.2" fill="#000" opacity=".35"/>'; }
    else if (kind === 'wood') { s += rect(0, 0, W, H, '#a8774a'); for (let x = 0; x < W; x += 22) { s += rect(x, 0, 20, H, ['#9a6c40', '#b0814f', '#a37246'][Math.floor(r() * 3)]); for (let k = 0; k < 6; k++) s += '<path d="M' + (x + 3 + r() * 14) + ',0 Q' + (x + r() * 20) + ',' + H / 2 + ' ' + (x + 3 + r() * 14) + ',' + H + '" stroke="#000" stroke-opacity=".12" fill="none"/>'; } }
    else if (kind === 'stone') { s += rect(0, 0, W, H, '#6f695e'); for (let y = 0; y < H; y += 38) { let x = -r() * 40; while (x < W) { const w = 50 + r() * 70; s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="36" fill="' + ['#7b7467', '#69645a', '#857e70', '#5f5b52'][Math.floor(r() * 4)] + '" stroke="#2c2a26" stroke-width="2"/>'; x += w; } } }
    else if (kind === 'glass') { s += '<defs><linearGradient id="gl' + seed + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fb0bf"/><stop offset="1" stop-color="#e2e8e3"/></linearGradient></defs>' + rect(0, 0, W, H, 'url(#gl' + seed + ')'); s += '<polygon points="60,0 130,0 70,300 0,300" fill="#fff" opacity=".18"/><polygon points="200,0 240,0 180,300 140,300" fill="#fff" opacity=".12"/>'; for (let x = 0; x <= W; x += 133) s += rect(x - 3, 0, 6, H, '#15171a'); s += rect(0, 0, W, 8, '#15171a') + rect(0, H - 8, W, 8, '#15171a'); }
    else if (kind === 'landscape') { s += '<defs><linearGradient id="ls' + seed + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9e2cf"/><stop offset="1" stop-color="#b8c4a0"/></linearGradient></defs>' + rect(0, 0, W, H, 'url(#ls' + seed + ')') + rect(0, 230, W, 70, '#5b7a45'); for (let i = 0; i < 5; i++) { const x = 40 + i * 80 + r() * 20, h = 130 + r() * 90; s += '<path d="M' + x + ',260 Q' + (x + 8) + ',' + (260 - h / 2) + ' ' + x + ',' + (260 - h) + '" stroke="#6f5a3e" stroke-width="5" fill="none"/>'; for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28; s += '<path d="M' + x + ',' + (260 - h) + ' q' + Math.cos(a) * 25 + ',' + (Math.sin(a) * 12 - 18) + ' ' + Math.cos(a) * 46 + ',' + (Math.sin(a) * 20 + 12) + '" stroke="#3f6b34" stroke-width="6" fill="none" stroke-linecap="round"/>'; } } for (let i = 0; i < 18; i++) s += '<ellipse cx="' + r() * W + '" cy="' + (245 + r() * 40) + '" rx="' + (14 + r() * 14) + '" ry="' + (8 + r() * 8) + '" fill="' + ['#3f6b34', '#4d7c3b', '#2f5428'][i % 3] + '"/>'; }
    else if (kind === 'light') { s += rect(0, 0, W, H, '#0c1020'); s += rect(40, 130, 320, 100, '#2a2d32') + rect(60, 150, 280, 70, '#e9a24f') + rect(20, 100, 360, 20, '#1d2024'); for (let x = 60; x < 340; x += 56) s += rect(x, 150, 4, 70, '#15171a'); for (let i = 0; i < 6; i++) s += '<circle cx="' + (60 + i * 56) + '" cy="250" r="26" fill="#ffc67a" opacity=".22"/>' + rect(54 + i * 56, 244, 12, 6, '#ffe3a8'); s += '<ellipse cx="200" cy="262" rx="190" ry="14" fill="#ffc67a" opacity=".12"/>'; }
    else if (kind === 'furniture') { s += rect(0, 0, W, H, '#d6d1c4') + rect(0, 220, W, 80, '#a8774a', .85); s += rect(70, 140, 190, 54, '#2d2a27') + rect(70, 100, 190, 52, '#3a3632') + rect(56, 150, 22, 60, '#2d2a27') + rect(252, 150, 22, 60, '#2d2a27') + rect(84, 194, 8, 28, '#15171a') + rect(240, 194, 8, 28, '#15171a'); s += '<circle cx="330" cy="140" r="46" fill="none" stroke="#15171a" stroke-width="6"/>' + rect(327, 186, 6, 34, '#15171a') + '<rect x="300" y="205" width="62" height="16" fill="#B66D4D"/>'; }
    else if (kind === 'interior') return House.render({ light: light || 'golden', view: 'interior', alt: 'Interior da sala de estar conectada ao jardim' });
    else if (kind === 'detail') { s += rect(0, 0, W, H, '#F4F1EA') + '<g stroke="#101110" fill="none" stroke-width="2.2"><path d="M40,120 H360 V150 H40 Z" fill="#c9c6bd"/><path d="M60,150 V270 M340,150 V270"/></g><g stroke="#101110" stroke-width="1" fill="none" stroke-dasharray="4 3"><path d="M60,135 H340"/></g>' + rect(150, 175, 100, 95, '#9db8c4', .7) + '<g font-family="monospace" font-size="12" fill="#101110"><text x="46" y="108">LAJE DE CONCRETO APARENTE</text><text x="150" y="170">VIDRO + ESQUADRIA FINA</text><text x="46" y="290">DETALHE ESQUEMÁTICO (SEM COTAS)</text></g><line x1="46" y1="96" x2="150" y2="122" stroke="#B66D4D" stroke-width="2"/>'; }
    else if (kind === 'hall') return House.render({ light: light || 'golden', view: 'acesso', rot: 1, alt: 'Acesso principal em madeira' });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
  }

  window.Diagrams = { SECTOR, sectorOf, center, BUBBLES, FLOWS, planSVG, planInner, arrowDef, siteSVG, tex };
})();
