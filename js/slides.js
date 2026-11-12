/* Conteúdo dos slides. Cada slide: id, ch (capítulo), theme, steps, html(), enter(el), notes[5]. */
(function () {
  const P = window.PROJECT, D = window.Diagrams, H = window.House, U = window.UI;
  const fig = U.fig, badge = U.badge;
  const kick = t => '<div class="kick">' + t + '</div>';
  const qa = (a, b, c, d) => '<div class="qa">' + [['O problema', a], ['A ferramenta', b], ['O resultado', c], ['Alimenta a próxima etapa', d]].map(x => '<div><span>' + x[0] + '</span><p>' + x[1] + '</p></div>').join('') + '</div>';
  const trans = t => '<div class="trans"><span>Transição</span>' + t + '</div>';
  const R = (o) => H.render(o);
  const resp = '<div class="resp">A IA acelera estudos, referências e visualizações, mas não substitui levantamento de campo, análise legal, dimensionamento, compatibilização ou responsabilidade técnica.</div>';

  const CH = [
    { k: 'abertura', label: 'Abertura' }, { k: 'intro', label: 'Introdução' }, { k: 'c1', label: '01 · Mapa de Situação' }, { k: 'c2', label: '02 · Moodboard' },
    { k: 'c4', label: '03 · Render' }, { k: 'c6', label: '04 · Vídeo' }, { k: 'fim', label: 'Encerramento' }
  ];

  /* ---------- Storyboard ---------- */
  const SCENES = [
    { t: 'Estabelecimento', d: 'Vista ampla da residência e de seu contexto.', obj: 'Apresentar a implantação e a relação com o terreno.', mov: 'Aproximação aérea lenta', dur: '6 s', cont: 'Mesma volumetria dos dois planos de laje; vegetação e piscina ao sul.', th: () => R({ view: 'wide', light: 'golden' }) },
    { t: 'Fachada', d: 'Aproximação da câmera à fachada principal.', obj: 'Revelar volumetria, materiais e aberturas.', mov: 'Travelling frontal suave', dur: '5 s', cont: 'Vidro contínuo no bloco social; brises de madeira na ala íntima.', th: () => R({ view: 'facade', light: 'golden' }) },
    { t: 'Acesso', d: 'Aproximação da entrada principal.', obj: 'Apresentar a transição entre exterior e interior.', mov: 'Dolly-in controlado', dur: '5 s', cont: 'Porta em madeira no hall; parede de pedra no volume de serviço.', th: () => R({ view: 'acesso', rot: 1, light: 'golden' }) },
    { t: 'Interior', d: 'Sala de estar conectada ao jardim.', obj: 'Demonstrar a integração espacial e a entrada de luz.', mov: 'Travelling lateral lento', dur: '6 s', cont: 'Forro de madeira, parede de vidro ao sul; mobiliário fixo no chão.', th: () => R({ view: 'interior', light: 'golden' }) },
    { t: 'Materiais', d: 'Detalhes de concreto, madeira, pedra e vidro.', obj: 'Valorizar texturas e acabamentos.', mov: 'Aproximação suave, sem deformar materiais', dur: '4 s', cont: 'Concreto com marcas de fôrma, madeira natural, pedra em pontos selecionados.', th: () => '<div class="matgrid">' + ['concrete', 'wood', 'stone', 'glass'].map((k, i) => D.tex(k, i + 3)).join('') + '</div>' },
    { t: 'Encerramento', d: 'Vista geral da residência ao entardecer.', obj: 'Concluir a narrativa visual.', mov: 'Afastamento lento / aéreo controlado', dur: '6 s', cont: 'Mesma casa da cena 01, agora com iluminação interna acesa.', th: () => R({ view: 'fim', light: 'blue' }) }
  ];


  /* ---------- Moodboard ---------- */
  const TILES = [
    ['Fachada sudeste', 'fachadas', () => R({ view: 'facade', light: 'golden' }), 'w3 h3'],
    ['Concreto aparente', 'materiais', () => D.tex('concrete', 5), 'w2 h2'],
    ['Madeira natural', 'materiais', () => D.tex('wood', 7), 'w1 h3'],
    ['Pedra em pontos selecionados', 'materiais', () => D.tex('stone', 9), 'w2 h2'],
    ['Vidro e esquadria fina', 'materiais fachadas', () => D.tex('glass', 11), 'w2 h1'],
    ['Paisagismo tropical', 'paisagismo', () => D.tex('landscape', 13), 'w2 h2'],
    ['Luz noturna', 'iluminacao fachadas', () => D.tex('light', 15), 'w2 h2'],
    ['Sala conectada ao jardim', 'interiores', () => D.tex('interior', 17), 'w3 h2'],
    ['Mobiliário contemporâneo', 'interiores', () => D.tex('furniture', 19), 'w2 h2'],
    ['Detalhe da laje', 'materiais fachadas', () => D.tex('detail', 21), 'w2 h1'],
    ['Acesso em madeira', 'fachadas', () => D.tex('hall', 23), 'w2 h2'],
    ['Blue hour', 'iluminacao fachadas', () => R({ view: 'facade', light: 'blue' }), 'w2 h1'],
    ['Jardim e piscina', 'paisagismo', () => R({ view: 'mat', light: 'manha' }), 'w2 h2'],
    ['Ripado de madeira', 'materiais', () => D.tex('wood', 31), 'w1 h2']
  ];

  /* ---------- Bolhas ---------- */
  function bubblesSVG(morph) {
    const B = D.BUBBLES, byId = {}; B.forEach(b => byId[b.id] = b);
    const seen = new Set(); let lines = '';
    B.forEach(b => b.links.forEach(l => { const k = [b.id, l].sort().join('|'); if (seen.has(k)) return; seen.add(k); const o = byId[l];
      lines += '<line class="lnk" data-a="' + b.id + '" data-b="' + l + '" x1="' + b.dx + '" y1="' + b.dy + '" x2="' + o.dx + '" y2="' + o.dy + '"/>'; }));
    const groups = B.map(b => { const col = D.SECTOR[D.sectorOf(b.id)].color;
      return '<g class="bub" data-id="' + b.id + '" tabindex="0" role="button" aria-label="' + P.rooms[b.id].label + '"><circle cx="' + b.dx + '" cy="' + b.dy + '" r="' + b.r + '" fill="' + col + '" /><circle class="ring" cx="' + b.dx + '" cy="' + b.dy + '" r="' + b.r + '" fill="none"/><text x="' + b.dx + '" y="' + (b.dy + .8) + '" text-anchor="middle" font-size="' + (b.r > 9 ? 2.2 : 1.7) + '">' + P.rooms[b.id].label.toUpperCase().replace(' E PISCINA', '').replace(' COBERTA', '') + '</text></g>'; }).join('');
    return '<svg class="bsvg" data-bubbles viewBox="-6 -9 112 94" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Diagrama de bolhas"><defs>' + D.arrowDef + '</defs>' +
      '<g class="planlayer">' + D.planInner({ ink: '#F4F1EA', paper: '#171816', furn: true, labels: false, tint: true }) + '</g><g class="lnks">' + lines + '</g>' + groups + '</svg>';
  }
  const legend = '<div class="legend">' + ['social', 'intimo', 'servico', 'neutro'].map(k => '<span><i style="background:' + D.SECTOR[k].color + '"></i>' + D.SECTOR[k].name + '</span>').join('') + '</div>';

  /* ---------- Marcadores do slide de análise do print ---------- */
  function pct(x, y) { return 'left:' + x + '%;top:' + y + '%'; }
  const ANN = [
    ['Volumetria', 'Dois planos horizontais sobre blocos: nada de acrescentar ou remover volumes.', [36, 24]],
    ['Aberturas', 'Vão de vidro contínuo ao sul e janelas em brises: posições fixas.', [40, 53]],
    ['Proporções', 'Espessura das lajes e relação largura × altura devem ser mantidas.', [67, 21]],
    ['Câmera', 'Ângulo e enquadramento do print definem a composição final.', [91, 62]],
    ['Relação entre volumes', 'Hall, bloco social e ala íntima mantêm a mesma justaposição.', [52, 43]]
  ];

  const MOODS = [['cozinha', 'Cozinha'], ['sala', 'Sala'], ['banheiro', 'Banheiro'], ['quarto', 'Quarto']];
  const chip = (a, t, extra) => '<button class="chip" ' + a + (extra || '') + '>' + t + '</button>';

  /* ======================= SLIDES ======================= */
  const S = [];

  S.push({
    id: 'capa', ch: 'abertura', title: 'Capa', theme: 'cover',
    html: () => '<div class="cover-bg">' + fig('hero', R({ view: 'hero', light: 'golden', alt: 'Casa Entre Planos ao fim de tarde' }), '', '', 'bleed') + '</div><div class="cover-shade"></div>' +
      '<div class="cover-txt"><h1 class="a2">INTELIGÊNCIA ARTIFICIAL<br>NA ARQUITETURA</h1><p class="sub a3">Seis ferramentas para deixar o seu dia a dia mais produtivo.</p></div>' +
      '<div class="cover-tag"><span class="badge b-ilus" data-badgeof="hero">ILUSTRAÇÃO VETORIAL</span></div>',
    notes: ['Abrir com a imagem, não com o texto: esta é a casa que o público vai acompanhar até o final.', 'Apresente a proposta: um único projeto, a CASA ENTRE PLANOS, atravessando seis ferramentas. Avise que o lote é conceitual e que as imagens desta versão são ilustrações geradas por código a partir de uma mesma geometria.', 'Deixe a animação de entrada terminar; clique em “Iniciar” ou use a seta →.', 'Quem aqui já usou IA em algum momento do projeto de arquitetura?', 'Vamos começar pelo lugar: o terreno antes da casa.']
  });

  S.push({
    id: 'jornada', ch: 'intro', title: 'A jornada', theme: 'dark',
    html: () => kick('VISÃO GERAL') + '<h2 class="t">Como usar seis ferramentas de IA no seu dia a dia</h2><div class="journey">' +
      [['01', 'Como criar o mapa de situação', 'Google Earth + Gemini'], ['02', 'Como criar moodboards', 'Pinterest + Gemini'], ['03', 'Como gerar o render a partir de um print', 'Nano Banana / Gemini'], ['04', 'Como criar o vídeo do projeto', 'Google Flow']].map(x => '<div><b>' + x[0] + '</b><h3>' + x[1] + '</h3><p>' + x[2] + '</p></div>').join('') + '</div>',
    notes: ['A narrativa é a construção progressiva de uma casa, não uma lista de ferramentas.', 'Passe os olhos pelas quatro etapas. Diga que a mesma casa aparece em todos.', 'Nenhuma.', 'Alguma dessas ferramentas é novidade para vocês?', 'Começamos pelo lugar: o terreno antes da casa.']
  });

  /* ---- Capítulo 01 ---- */
  S.push({
    id: 'c1a', ch: 'c1', title: 'O lugar',
    html: () => kick('CAPÍTULO 01 · CRIANDO MAPA DE SITUAÇÃO COM GOOGLE EARTH E GEMINI') + '<h2 class="t">Como capturar o satélite no Google Earth</h2><div class="split fill">' + fig('site-context', D.siteSVG('context'), 'Captura de satélite do Google Earth: o ponto de partida do mapa de situação.', 'ilus', 'wide zoomable') +
      '<div class="side"><p class="lead">Acesse earth.google.com, faça login e, na barra de pesquisa, digite a cidade ou o endereço e tire um print.</p></div></div>' +
      qa('Entender o entorno antes de propor volumes.', 'Google Earth fornece a imagem de satélite do entorno.', 'Uma vista aérea de referência do lote.', 'Vira o mapa de situação no Gemini.'),
    notes: ['Todo projeto começa pelo lugar.', 'Explique que a captura vem do Google Earth, respeitando atribuição e termos de uso.', 'Mostre os elementos: lote, ruas, vizinhos, vegetação, acesso.', 'O que você olha primeiro quando recebe um terreno?', 'Com o contexto em mãos, vamos testar a casa dentro do lote.']
  });

  S.push({
    id: 'c1c', ch: 'c1', title: 'Mapa de situação',
    html: () => kick('CAPÍTULO 01 · GEMINI') + '<h2 class="t">Como criar o mapa de situação no Gemini</h2><div class="split fill">' + fig('site-concept', D.siteSVG('concept'), 'Mapa de situação gerado no Gemini a partir da captura de satélite.', 'ia', 'wide zoomable') +
            '<div class="side"><p class="lead">O Gemini transforma o print do satélite em um mapa de situação, com os pontos de interesse da região marcados.</p></div></div>',
    notes: ['A IA ajuda a visualizar a implantação, não a medi-la.', 'Mostre a captura de satélite e o mapa de situação gerado no Gemini a partir dela. Reforce que a IA reinterpreta a imagem: confira limites e entorno.', 'Se houver acesso, mostre a geração ao vivo no Gemini.', 'Como você validaria o resultado contra o levantamento topográfico?', 'Vamos comparar o contexto e a interpretação lado a lado.']
  });

  S.push({
    id: 'c1d', ch: 'c1', title: 'Do satélite para a situação',
    html: () => kick('CAPÍTULO 01 · ANTES E DEPOIS') + '<h2 class="t">Do Satélite para a Situação</h2><div class="stack">' + U.compare(D.siteSVG('context'), D.siteSVG('concept'), 'Satélite', 'Situação', 'site-context', 'site-concept') + '</div>' +
      '<div class="legend3"><span><i></i>Satélite (Google Earth)</span><span><i></i>Mapa de situação (Gemini)</span></div>' + trans('Conhecer o lugar não basta: o projeto precisa de identidade. Próxima etapa — materiais, cores e atmosfera.'),
    notes: ['Mesma base, duas leituras: o satélite e o mapa de situação.', 'Arraste o controle. Note o que o Gemini manteve e o que simplificou.', 'Arraste o slider devagar sobre o lote.', 'O que você pediria para a IA preservar neste tipo de edição?', 'Agora que sabemos onde, precisamos decidir como a casa parece: o moodboard.']
  });

  /* ---- Capítulo 02 ---- */
  S.push({
    id: 'c2a', ch: 'c2', title: 'Casa e moodboards',
    html: () => kick('CAPÍTULO 02 · PINTEREST + MOODBOARDS') + '<h2 class="t">Como criar moodboards</h2><div class="pair">' +
      fig('hero', R({ view: 'hero', light: 'golden', alt: 'Casa Entre Planos' }), 'A casa', 'ilus', 'zoomable') + '<div class="fan">' + MOODS.map((m, i) => fig('mood-' + m[0], '<div class="waitbox"><b>' + m[0] + '</b></div>', m[1], '', 'card c' + i)).join('') + '</div>' + '</div>',
    notes: ['Cada ambiente tem o seu moodboard, montado a partir dos materiais da própria casa.', 'Mostre como a casa e os moodboards falam a mesma língua: concreto, madeira, pedra e vidro.', 'Aponte materiais e paleta; abra o README para mostrar a bíblia visual (project-data.js).', 'Vocês documentam as decisões visuais de um projeto? Onde?', 'O moodboard define a aparência; agora o programa: como os espaços se relacionam.']
  });

  S.push({
    id: 'c2b', ch: 'c2', title: 'Como criamos os moodboards', theme: 'light',
    html: () => kick('CAPÍTULO 02 · PASSO A PASSO') + '<h2 class="t">Como criar moodboards: passo a passo</h2><div class="proc">' +
      '<div class="au pc"><div class="ph"><b class="mono">01</b><h3>Pinterest</h3><p>Pesquise “moodboard” e faça um print de um modelo de formato.</p></div>' +
      '<div class="win browser zoomable" tabindex="0" role="button" aria-label="Ampliar"><div class="bar"><i></i><i></i><i></i><span>pinterest.com</span></div><div class="shot"><img src="assets/images/processo-pinterest.webp" alt="Busca de moodboard no Pinterest"></div></div></div>' +
      '<i class="au parrow">→</i>' +
      '<div class="au pc"><div class="ph"><b class="mono">02</b><h3>Gemini</h3><p>Anexe a casa (materiais), o modelo (formato) e o pedido de cada ambiente.</p></div>' +
      '<div class="win chat"><div class="bar"><i></i><i></i><i></i><span>gemini.google.com</span></div><div class="shot attach"><figure><img src="assets/images/hero.jpg" alt="Casa de referência"><figcaption>Casa de referência</figcaption></figure><figure><img src="assets/images/processo-pinterest.webp" alt="Modelo de moodboard"><figcaption>Modelo de moodboard</figcaption></figure></div></div></div>' +
      '<i class="au parrow">→</i>' +
      '<div class="au pc"><div class="ph"><b class="mono">03</b><h3>Um por ambiente</h3><p>Repita para cozinha, sala, banheiro e quarto.</p></div>' +
      '<div class="fan">' + MOODS.map((m, i) => fig('mood-' + m[0], '<div class="waitbox"><b>' + m[0] + '</b></div>', m[1], '', 'card c' + i)).join('') + '</div></div></div>',
    enter: el => { (el._ts || []).forEach(clearTimeout); const L = el.querySelectorAll('.au'); L.forEach(n => n.classList.remove('in')); el._ts = Array.from(L).map((n, i) => setTimeout(() => n.classList.add('in'), 500 + i * 900)); },
    notes: ['O processo é simples e repetível.', 'Passo 1: busca no Pinterest e print de um modelo. Passo 2: no Gemini, a casa e o modelo anexados. Passo 3: repetir por ambiente.', 'Os três passos aparecem sozinhos.', 'Que ambiente você testaria primeiro?', 'Agora o render.']
  });

  /* ---- Capítulo 03 ---- */

  S[S.length - 1].qa = 1;

  /* ---- Capítulo 04 ---- */
  S.push({
    id: 'c4a', ch: 'c4', title: 'O modelo inicial',
    html: () => kick('CAPÍTULO 03 · RENDER A PARTIR DE PRINT') + '<h2 class="t">Como fazer renderização com Nano Banana ou Gemini</h2><div class="split fill" data-build><div class="fig wide"><div class="fig-media build"><div class="bl-plan"><div class="paper">' + D.planSVG({ labels: false, furn: true }) + '</div></div><div class="bl-model" data-aimg="model-print">' + R({ style: 'model', light: 'manha', view: 'hero', alt: 'Captura do modelo 3D volumétrico' }) + '</div><i class="bl-scan"></i></div><figcaption>' + badge('ilus') + '<span data-bstage>Planta baixa</span></figcaption></div>' +
      '<div class="side"><p class="lead">Tanto o Nano Banana quanto o Gemini entregam resultados excelentes para renderização de imagens.</p><label class="bslide"><span class="mono">PLANTA</span><input type="range" min="0" max="100" value="0" aria-label="Da planta ao modelo"><span class="mono">MODELO</span></label></div></div>' +
      qa('Dar realismo sem refazer o modelo.', 'Modelo de imagem guiado pelo print.', 'Uma visualização fotorrealista.', 'Base para variar luz e narrar em vídeo.'),
    enter: el => window.App.build(el),
    notes: ['Tudo o que for gerado dependerá da qualidade deste print.', 'A animação começa na planta baixa e “levanta” até o modelo 3D: é a mesma casa, do desenho ao volume. Use o controle para voltar e parar em qualquer ponto. A planta é um desenho por código; o modelo é o print real.', 'Deixe a animação rodar e depois arraste o controle.', 'Seu modelo costuma estar pronto para virar um print assim?', 'O que, no seu projeto, não pode mudar?'],
  });

  S.push({
    id: 'c4c', ch: 'c4', title: 'Passo a passo do render', theme: 'dark',
    html: () => kick('CAPÍTULO 03 · PASSO A PASSO') + '<h2 class="t">Como gerar o render: passo a passo</h2><div class="split fill pw"><ol class="steps">' +
      [['Acesse o Gemini ou o Flow', '<b>gemini.google.com</b> ou <b>flow.google.com</b>.'],
       ['Escolha criar imagem', 'No Flow, selecione <b>criar imagem</b> e o modelo <b>Nano Banana</b>. No Gemini, use <b>Criar imagem</b>.'],
       ['Anexe o print do projeto', 'Envie o print do modelo 3D: é ele que trava a geometria.'],
       ['Peça o render', 'Descreva materiais, vegetação e luz, e gere algumas versões.'],
       ['Escolha a mais fiel', 'Fique com a que mantém lajes, aberturas e câmera do print.']].map((x, i) =>
        '<li class="au"><b class="mono">0' + (i + 1) + '</b><div><h3>' + x[0] + '</h3><p>' + x[1] + '</p></div></li>').join('') + '</ol>' +
      fig('render-final', R({ light: 'golden', view: 'hero', alt: 'Render da Casa Entre Planos' }), '', '', 'wide zoomable au') + '</div>',
    enter: el => { (el._ts || []).forEach(clearTimeout); const L = el.querySelectorAll('.au'); L.forEach(n => n.classList.remove('in')); el._ts = Array.from(L).map((n, i) => setTimeout(() => n.classList.add('in'), 500 + i * 900)); },
    notes: ['O render depende de três coisas: ferramenta, print e pedido.', 'Percorra os cinco passos. Avise que a IA pode alterar a geometria: sempre compare com o print.', 'Os passos aparecem sozinhos.', 'Você prefere o Gemini ou o Flow para imagens?', 'Vamos comparar o print com o render.']
  });

  S.push({
    id: 'c4e', ch: 'c4', title: 'Comparação',
    html: () => kick('CAPÍTULO 03 · COMPARAÇÃO') + '<h2 class="t">Resultado</h2><div class="stack">' + U.compare(R({ style: 'model', light: 'manha', view: 'hero', alt: 'Print do modelo' }), R({ light: 'golden', view: 'hero', alt: 'Render' }), 'Print do modelo', 'Visualização', 'model-print', 'render-final') + '</div><div class="foot mono"><span class="badge b-ilus" data-badgeof="render-final">ILUSTRAÇÃO VETORIAL</span> Mesma casa e mesma câmera nos dois lados. ' + trans('Com a arquitetura realista, vejamos como a luz transforma a percepção do mesmo espaço.').replace('class="trans"', 'class="trans inline"') + '</div>',
    notes: ['A prova do método: a geometria permanece.', 'Arraste o controle e observe lajes, hall e vãos. Em um caso real, procure deformações.', 'Arraste devagar e pare em pontos de interesse.', 'Você assinaria embaixo desta imagem como representação do projeto?', 'Mesma casa, outras horas do dia.']
  });

  /* ---- Capítulo 05 ---- */
  /* ---- Capítulo 06 ---- */
  const autoIn = (ms) => el => { (el._ts || []).forEach(clearTimeout); const L = el.querySelectorAll('.au'); L.forEach(n => n.classList.remove('in')); el._ts = Array.from(L).map((n, i) => setTimeout(() => n.classList.add('in'), 400 + i * ms)); };

  const sceneGrid = f => '<div class="atm six">' + SCENES.map((sc, i) => '<div class="acell"><div class="fig"><div class="fig-media zoomable"><div class="tm" data-aimg="scene-' + (i + 1) + '">' + sc.th() + '</div></div></div><div><h3>0' + (i + 1) + ' · ' + sc.t + '</h3><p class="pdesc">' + f(sc) + '</p></div></div>').join('') + '</div>';

  S.push({
    id: 'c6b', ch: 'c6', title: 'Vídeo · passo 1: as cenas', theme: 'dark',
    html: () => kick('CAPÍTULO 04 · PASSO 1 DE 3') + '<h2 class="t">Como criar um vídeo do projeto</h2><p class="lead sub-l"><b>Passo 1.</b> Acesse flow.google.com e crie as seis cenas a partir da imagem renderizada.</p>' + sceneGrid(sc => sc.d),
    notes: ['O vídeo começa em imagens: seis cenas geradas a partir do render.', 'Explique as seis cenas: aérea, fachada, acesso, interior, materiais e entardecer.', 'Clique nas imagens para ampliar.', 'Qual cena você cortaria para um vídeo de 30 segundos?', 'Agora cada cena vira um vídeo.']
  });

  S.push({
    id: 'c6b2', ch: 'c6', title: 'Vídeo · passo 2: um vídeo por cena', theme: 'dark',
    html: () => kick('CAPÍTULO 04 · PASSO 2 DE 3') + '<h2 class="t">Como criar um vídeo do projeto</h2><p class="lead sub-l"><b>Passo 2.</b> No Google Flow, escolha o modelo de <b>vídeo</b> e crie um vídeo para cada cena.</p>' + sceneGrid(sc => sc.mov + ' · ' + sc.dur),
    notes: ['Cada cena vira um clipe curto, com um movimento de câmera.', 'Gere duas ou três versões de cada cena e descarte as em que a casa deforma ou os materiais piscam.', 'Mostre o movimento de cada cena.', 'O que mais preocupa você em vídeo gerado por IA: deformação ou consistência?', 'Falta juntar tudo em um único vídeo.']
  });

  S.push({
    id: 'c6b3', ch: 'c6', title: 'Vídeo · passo 3: montagem', theme: 'dark',
    html: () => kick('CAPÍTULO 04 · PASSO 3 DE 3') + '<h2 class="t">Como criar um vídeo do projeto</h2><p class="lead sub-l"><b>Passo 3.</b> Junte todas as cenas em um único vídeo. Você pode usar o CapCut.</p><ol class="steps wide">' +
      [['Abra o CapCut', 'No computador ou no celular, crie um novo projeto.'], ['Importe os seis clipes', 'Coloque-os na linha do tempo na ordem 1 → 6.'], ['Ajuste os cortes', 'Corte o início e o fim de cada clipe e adicione transições suaves.'], ['Inclua uma trilha', 'Escolha uma música calma, compatível com o ritmo das cenas.'], ['Exporte', 'Salve no formato e tamanho que preferir.']].map((x, i) =>
        '<li class="au"><b class="mono">0' + (i + 1) + '</b><div><h3>' + x[0] + '</h3><p>' + x[1] + '</p></div></li>').join('') + '</ol>',
    enter: el => { (el._ts || []).forEach(clearTimeout); const L = el.querySelectorAll('.au'); L.forEach(n => n.classList.remove('in')); el._ts = Array.from(L).map((n, i) => setTimeout(() => n.classList.add('in'), 500 + i * 900)); },
    notes: ['A montagem é simples: ordem, cortes, trilha e exportação.', 'O CapCut é uma opção; qualquer editor serve.', 'Os passos aparecem sozinhos.', 'Qual editor de vídeo você já usa?', 'Veja o filme final.']
  });

  S.push({
    id: 'c6c', ch: 'c6', title: 'O filme', theme: 'dark',
    html: () => kick('CAPÍTULO 04 · O FILME') + '<h2 class="t">Como ficou o vídeo</h2><div class="split fill one"><div class="fig wide sim" data-sim><div class="fig-media simstage" data-simstage>' + SCENES.map((s, i) => '<div class="simsc m' + (i % 3) + '" data-simsc="' + i + '"><div class="tm" data-aimg="scene-' + (i + 1) + '">' + s.th() + '</div><span class="cap mono">CENA 0' + (i + 1) + ' · ' + s.t.toUpperCase() + '</span></div>').join('') + '</div><figcaption>' + badge('sim') + '<span data-simnote>Simulação por animação de interface — NÃO é um vídeo gerado pelo Flow. Coloque assets/videos/film.mp4 para usar o vídeo real.</span><button class="chip" data-play>▶ Reproduzir</button></figcaption></div>' +
      '</div>' + trans('O filme apresenta o projeto ao cliente. Para fechar, vejamos como todas as representações formam um único projeto.'),
    enter: el => window.App.sim(el), leave: el => window.App.simStop(el),
    notes: ['O vídeo precisa parecer a mesma casa em todas as cenas.', 'Esta simulação mostra a sequência e o tipo de movimento; com vídeo real, ele substitui a simulação automaticamente.', 'Clique em Reproduzir.', 'O que você exigiria de um vídeo antes de enviá-lo ao cliente?', 'Para fechar, como usar a IA com responsabilidade.']
  });

  /* ---- Capítulo 07 ---- */
  S.push({
    id: 'limites', ch: 'fim', title: 'Limites e responsabilidades',
    html: () => kick('ENCERRAMENTO') + '<h2 class="t">Use a IA com responsabilidade</h2><div class="three">' + [['Confira a geometria', 'Compare sempre o resultado com o modelo: lajes, aberturas e proporções não podem mudar.'], ['Valide o que é técnico', 'Medidas, normas, estrutura e legislação continuam com o arquiteto, com levantamento de campo.'], ['Mantenha a autoria', 'A IA amplia as possibilidades de exploração. A intenção, o critério e a decisão continuam sendo do arquiteto.']].map(x => '<div><h3>' + x[0] + '</h3><p>' + x[1] + '</p></div>').join('') + '</div>',
    notes: ['Transparência é parte do profissionalismo.', 'Percorra os três cuidados: geometria, validação técnica e autoria.', 'Dê um exemplo de cada.', 'Como vocês comunicam o uso de IA aos clientes?', 'A conclusão.']
  });

  S.push({
    id: 'fim', ch: 'fim', title: 'Conclusão', theme: 'cover', steps: 2, enter: el => window.App.contact(el),
    html: () => '<div class="cover-bg">' + fig('light-blue', R({ view: 'fim', light: 'blue', alt: 'Casa Entre Planos ao anoitecer' }), '', '', 'bleed') + '</div><div class="cover-shade end"></div><div class="end-txt"><div class="quote2 rv" data-s="1">“A inteligência artificial amplia as possibilidades de exploração.<br>O arquiteto continua responsável pelas decisões.”</div><p class="impact rv" data-s="2">O futuro da arquitetura não depende apenas de quem domina mais ferramentas, mas de quem sabe transformar tecnologia em intenção, experiência e projeto.</p><div class="contact rv" data-s="2" data-contact></div></div><div class="cover-tag">CASA ENTRE PLANOS</div>',
    notes: ['Volte à casa da abertura: a mesma residência, agora ao anoitecer.', 'Revele a frase e, depois, a mensagem de impacto; junto com ela aparecem seus contatos. Faça uma pausa antes de agradecer e deixe os QR codes na tela.', 'Nenhuma.', 'Perguntas?', 'Encerramento e agradecimentos.']
  });

  window.SLIDES = S; window.CHAPTERS = CH; window.SCENES = SCENES;
})();
