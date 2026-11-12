/* BÍBLIA VISUAL — fonte única de verdade da CASA ENTRE PLANOS.
   Toda geometria (planta, volumetria, implantação) é gerada a partir daqui. */
window.PROJECT = {
  name: 'CASA ENTRE PLANOS',
  description: 'Residência contemporânea brasileira de alto padrão, horizontal, composta por planos de concreto sobre blocos de vidro, madeira e pedra.',
  projectType: 'Residência unifamiliar térrea (conceitual)',
  architecturalConcept: 'Dois planos horizontais de concreto aparente (um sobre o setor social, outro sobre o íntimo) abrigam blocos protegidos e abrem a casa para o jardim ao sul.',
  siteAssumptions: {
    status: 'LOTE 100% CONCEITUAL — sem endereço, cadastro, topografia ou orientação solar reais.',
    lot: { x: -14, y: -16, w: 128, d: 112 }, // unidades conceituais (u)
    street: 'norte da planta (topo), acesso de pedestres e veículos',
    solarNote: 'Orientação solar apenas esquemática; não calculada.'
  },
  units: 'u = unidade conceitual (sem escala real, sem cotas aprovadas)',
  programOfNeeds: ['Sala de estar','Sala de jantar','Cozinha','Suíte principal','Quartos secundários','Banheiros','Circulação','Lavanderia','Área de serviço','Jardim','Varanda'],
  zoning: { social: ['estar','jantar','cozinha','varanda','jardim'], intimo: ['suite','quartos','banhos'], servico: ['lavanderia','servico'], neutro: ['circulacao'] },
  /* Cômodos: retângulos [x,y,w,h] no sistema da planta (y cresce para o sul/jardim). */
  rooms: {
    lavanderia: { label:'Lavanderia', rects:[[0,0,14,10]] },
    servico:    { label:'Área de serviço', rects:[[0,10,14,8]] },
    cozinha:    { label:'Cozinha', rects:[[14,0,20,18]] },
    jantar:     { label:'Sala de jantar', rects:[[34,0,20,18]] },
    estar:      { label:'Sala de estar', rects:[[14,18,40,26]] },
    circulacao: { label:'Circulação', rects:[[54,0,6,24],[60,18,40,6]] },
    suite:      { label:'Suíte principal', rects:[[60,0,22,18]] },
    banhos:     { label:'Banheiros', rects:[[82,0,8,18],[90,0,10,18]] },
    quartos:    { label:'Quartos', rects:[[60,24,20,20],[80,24,20,20]] },
    varanda:    { label:'Varanda coberta', rects:[[14,44,42,8]] },
    jardim:     { label:'Jardim e piscina', rects:[[0,56,100,24]] }
  },
  geometryReferences: {
    volumes: 4,
    description: 'Bloco de serviço (baixo, pedra), bloco social (vidro ao sul), hall em madeira, ala íntima (concreto e brises de madeira) e dois planos de laje: social (balanço sobre a varanda, apoiado em parede de pedra e dois pilares) e íntimo (levemente mais baixo).',
    boxes: [
      { id:'servico', x:0,  y:0, w:14, d:18, z:0, h:11, mat:'stone' },
      { id:'social',  x:14, y:0, w:40, d:44, z:0, h:13.6, mat:'glassSouth' },
      { id:'hall',    x:54, y:0, w:6,  d:24, z:0, h:12, mat:'wood' },
      { id:'intimo',  x:60, y:0, w:40, d:44, z:0, h:12.8, mat:'concreteSlats' }
    ],
    planes: [
      { id:'lajeSocial', x:11, y:-3, w:46, d:57, z:13.6, t:1.6 },
      { id:'lajeIntimo', x:58, y:-3, w:44, d:50, z:12.8, t:1.4 }
    ],
    supports: [ {x:56,y:44.5,w:1.4,d:8,h:13.6,mat:'stone'}, {x:14,y:51,w:1.2,d:1.2,h:13.6,mat:'concrete'}, {x:34,y:51,w:1.2,d:1.2,h:13.6,mat:'concrete'} ],
    pool: [20,58,30,10], deck: [14,44,42,8]
  },
  materials: {
    concrete: 'Concreto aparente com marcas de fôrma horizontais',
    wood: 'Madeira natural (hall, brises e deck)',
    stone: 'Pedra em pontos selecionados (serviço e parede de apoio)',
    glass: 'Grandes planos de vidro ao sul, esquadria escura fina'
  },
  colorPalette: { grafite:'#101110', mineral:'#171816', branco:'#F4F1EA', tecnico:'#A6A6A0', oliva:'#727B65', terracota:'#B66D4D', linhas:'#3A3B37' },
  landscaping: 'Paisagismo tropical brasileiro em camadas: palmeiras e árvores altas, arbustos médios, forrações baixas; gramado e piscina ao sul.',
  lighting: ['manha','golden','blue','noite'],
  cameraViews: {
    hero:   { name:'Vista principal (sudeste, elevada)', note:'Câmera de referência de TODAS as imagens' },
    aerea:  { name:'Planta de situação (topo)' }
  },
  referenceAssets: [],
  approvedAssets: [],   // preenchido automaticamente quando arquivos reais são detectados em assets/images
  pendingAssets: [],
  intentionalChanges: [ 'Nenhuma: a mesma geometria é usada em planta, volumetria, ilustrações e storyboard.' ],
  technicalLimitations: [
    'Ilustrações vetoriais geradas por código a partir da bíblia visual: NÃO são renders de IA nem fotografias.',
    'Planta esquemática sem cotas, escala ou norte: não é arquivo CAD.',
    'Capacidades de CadCraft não confirmadas em documentação — marcadas "a validar".'
  ]
};

/* Slots de ativos reais: se o arquivo existir, substitui a ilustração. */
window.ASSET_SLOTS = {
  'hero':          { file:'assets/images/hero.jpg',            kind:'Render IA' },
  'site-context':  { file:'assets/images/site-context.jpg',    kind:'Captura Google Earth (verificar termos)' },
  'site-concept':  { file:'assets/images/site-context-situacao.jpg', kind:'Mapa de situação (Gemini)' },
  'model-print':   { file:'assets/images/model-print.jpg',     kind:'Print do modelo 3D' },
  'render-final':  { file:'assets/images/render-final.jpg',    kind:'Render IA a partir do print' },
  'light-manha':   { file:'assets/images/light-manha.jpg',     kind:'Render IA' },
  'light-golden':  { file:'assets/images/light-golden.jpg',    kind:'Render IA' },
  'light-blue':    { file:'assets/images/light-blue.jpg',      kind:'Render IA' },
  'light-noite':   { file:'assets/images/light-noite.jpg',     kind:'Render IA' },
  'scene-1': {file:'assets/images/scene-1.jpg',kind:'Frame storyboard'}, 'scene-2': {file:'assets/images/scene-2.jpg',kind:'Frame storyboard'},
  'scene-3': {file:'assets/images/scene-3.jpg',kind:'Frame storyboard'}, 'scene-4': {file:'assets/images/scene-4.jpg',kind:'Frame storyboard'},
  'scene-5': {file:'assets/images/scene-5.jpg',kind:'Frame storyboard'}, 'scene-6': {file:'assets/images/scene-6.jpg',kind:'Frame storyboard'},
  'mood-cozinha': { file:'assets/images/moodboard-cozinha.jpg', kind:'Moodboard IA' },
  'mood-sala': { file:'assets/images/moodboard-sala.jpg', kind:'Moodboard IA' },
  'mood-banheiro': { file:'assets/images/moodboard-banheiro.jpg', kind:'Moodboard IA' },
  'mood-quarto': { file:'assets/images/moodboard-quarto.jpg', kind:'Moodboard IA' },
  'film':          { file:'assets/videos/film.mp4',            kind:'Vídeo gerado (Google Flow)' }
};

/* Contato do último slide. Preencha e os QR codes são gerados na hora (sem internet). */
window.CONTACT = {
  name: 'Johni Michael Gomes',
  role: 'Desenvolvedor e Especialista em IA',
  instagram: 'johnisgomes_',
  whatsapp: '5561981834833',
  whatsappMsg: 'Olá! Vi sua palestra sobre IA na arquitetura.'
};
