# Inteligência Artificial na Arquitetura — Casa Entre Planos

Apresentação navegável (23 slides, 16:9) em HTML/CSS/JS puro, sem build e sem dependências. Um único projeto conceitual, a **CASA ENTRE PLANOS**, atravessa seis ferramentas: situação, moodboard, bolhas, render, iluminação e filme.

## Executar
Abra `index.html` no Chrome/Edge (duplo clique funciona). Opcional, servidor local:

```bash
node tools/serve.js 5173
```

Depois acesse http://localhost:5173. A janela do apresentador (P) usa BroadcastChannel e é mais confiável via servidor local.

## Navegação e atalhos
| Tecla | Ação |
|---|---|
| → / Espaço | Avançar (revela etapas nos slides com etapas) |
| ← | Voltar |
| F | Tela cheia (Esc sai) |
| I | Índice de capítulos |
| N | Painel de notas (fora da tela projetada, oculto por padrão) |
| P | Janela do apresentador (notas, próximo slide, cronômetro, botões) |
| 1–6 | Iluminação (cap. 05) ou cenas (cap. 06) |
| Esc | Fecha painéis e ampliação |
| Home / End | Primeiro / último slide |

Clique em qualquer imagem para ampliar. Barra inferior some após 3 s sem movimento.

## Estrutura
```
index.html
css/styles.css
js/project-data.js   Bíblia visual (fonte única de verdade) + slots de ativos reais
js/qrcode.js        Gerador de QR code (qrcode-generator, MIT) para o último slide
js/house.js          Motor SVG da casa: volumetria, "render", luzes, estilos
js/diagrams.js       Planta esquemática, bolhas, implantação, texturas
js/interactions.js   Comparador, filtros, bolhas, iluminação, camadas, carregador de ativos
js/slides.js         Conteúdo e notas de cada slide
js/navigation.js     Navegação, escala, HUD, índice, notas, apresentador
js/app.js            Simulação do filme / vídeo real e inicialização
assets/images|videos|icons|fonts
tools/serve.js       Servidor estático opcional
```

## Ativos incluídos nesta versão
Imagens reais em `assets/images/` (otimizadas para 1920 px; originais 2752×1536 guardados em `assets/originais/`): hero, site-context, site-concept, model-print, render-final, 4 luzes e scene-1…6. Vídeo final `assets/videos/film.mp4` (38 s, 1920×1080, H.264; corte editado por você, convertido de IMG_9317.MOV; o corte automático anterior está em `assets/originais/film-corte-automatico.mp4`). Ainda ilustrações por código: moodboard, bolhas, planta, estilos opcionais (minimalismo/tropical/brutalismo) e miniaturas de contexto.

## Honestidade sobre os ativos
(Texto abaixo vale para qualquer slot sem arquivo real.)
**Nenhuma imagem desta versão foi gerada por IA ou ferramenta externa.** Todas as imagens (render, planta, implantação, storyboard) são **ilustrações vetoriais geradas por código** a partir de `project-data.js`, o que garante a mesma casa em todas as etapas. Cada uma leva um selo (ILUSTRAÇÃO VETORIAL, SIMULAÇÃO VISUAL, ESQUEMÁTICO — NÃO VALIDADO, ESQUEMA CONCEITUAL).

## Substituir por imagens e vídeos reais
Coloque o arquivo com o nome abaixo; ele é detectado automaticamente e substitui a ilustração (selo passa a "ATIVO REAL"). Lista também no Índice (I).

| Arquivo | Onde aparece |
|---|---|
| `assets/images/hero.jpg` | Capa e DNA do projeto |
| `moodboard-cozinha.jpg`, `-sala.jpg`, `-banheiro.jpg`, `-quarto.jpg` | Cap. 02 (moodboards dos ambientes e DNA) |
| `site-context.jpg`, `site-concept.jpg` | Cap. 01 (Google Earth / Nano Banana) |
| `model-print.jpg`, `render-final.jpg` | Cap. 04 |
| `light-manha.jpg`, `light-golden.jpg`, `light-blue.jpg`, `light-noite.jpg` | Cap. 05 |
| `scene-1.jpg` … `scene-6.jpg` | Slots de storyboard (previstos; as miniaturas atuais ainda usam as ilustrações) |
| `assets/videos/film.mp4` | Cap. 06: troca a simulação pelo vídeo real |

Mantenha 16:9, ~1920×1080, mesma câmera e mesma casa (compare com a bíblia visual). O slider do cap. 04 usa o print e o render ilustrativos; para usar os reais, troque `model-print`/`render-final` e ajuste o slide `c4e` em `js/slides.js`.

## Adicionar slides / atualizar a bíblia visual
- Slides: adicione um objeto em `js/slides.js` (`id`, `ch`, `title`, `theme`, `steps`, `html()`, `enter()`, `notes[5]`). Capítulos em `CHAPTERS`.
- Bíblia visual: edite `js/project-data.js` (ambientes em `rooms`, volumes em `geometryReferences`, paleta, limitações). Planta, volumetria e implantação se redesenham. Aberturas ficam em `OPEN` (`house.js`) e portas/janelas da planta em `diagrams.js`.

## Recursos que exigem internet
Fontes Google (Fraunces, Inter, JetBrains Mono; há fallback local) e os links de fontes no slide do Google Flow. O resto funciona offline.

## Integrações reais × simuladas
- **Reais:** navegação, comparadores, filtros, bolhas, camadas, seletor de luz/estilo, storyboard, revisão (marcações salvas em localStorage), notas, janela do apresentador, detecção de ativos.
- **Simuladas:** todas as imagens, o "Pinterest", o "Nano Banana", o "Google Flow" (simulação por animação de interface). Não há integração com APIs.
- **A validar:** recursos atuais, planos e exportação do Google Flow (pesquisa de mídia de 2025); termos de uso do Google Earth se usar capturas reais.

## Pendências
4 moodboards; vídeo do Flow; teste ao vivo de Nano Banana; referências licenciadas para o moodboard.

## Último slide: contatos
Edite `window.CONTACT` em `js/project-data.js` (`instagram`, `whatsapp` com DDI+DDD, só dígitos). Os QR codes são gerados no navegador, sem internet.
