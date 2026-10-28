# PASSO A PASSO — como gerar as imagens e o vídeo

Siga na ordem. Cada passo diz: **onde ir → o que anexar → o que colar → onde salvar**.
Todos os arquivos vão para a pasta `assets/images/` (o vídeo, para `assets/videos/`). Use exatamente esses nomes: o site detecta sozinho e troca a ilustração pela sua imagem.

**Ferramentas:** Google Earth (earth.google.com), Gemini (gemini.google.com, modelo de imagem "Nano Banana"), Google Flow (labs.google/flow), um editor de vídeo qualquer (DaVinci Resolve é grátis).
Faça tudo na **mesma conversa do Gemini** sempre que possível, para ele "lembrar" da casa.

---

## PASSO 1 — Terreno (Google Earth)  →  `site-context.jpg`
1. Abra **earth.google.com**.
2. Procure o terreno/quadra que você quer usar e deixe a vista **de cima** (câmera em 2D, sem inclinação).
3. Enquadre o terreno com rua e vizinhos em volta, em formato de tela larga (16:9).
4. Tire um **print da tela** e salve como `assets/images/site-context.jpg`.
5. Deixe a atribuição do Google visível na imagem. Se o terreno for real, não divulgue o endereço sem autorização.

## PASSO 2 — Casa no terreno (Nano Banana)  →  `site-concept.jpg`
1. Abra **gemini.google.com**, escolha criar/editar imagem (Nano Banana).
2. **Anexe** `site-context.jpg`.
3. **Cole:**
```
Using the supplied aerial image, place a contemporary single-storey Brazilian house inside the lot: two flat exposed-concrete roof planes (social wing and private wing side by side), a wood-clad entrance, a rectangular pool and tropical landscaping to the south. Preserve the neighbouring buildings, streets and trees exactly as in the reference. Top-down aerial view, soft daylight, realistic shadows, no text, no watermark.
```
4. Gere algumas versões, escolha a melhor e salve como `assets/images/site-concept.jpg`.

## PASSO 3 — Volumetria branca (o "print do modelo")  →  `model-print.jpg`
*(Se você tem um modelo 3D da casa no SketchUp/Revit/Blender, tire um print dele em vista elevada pelo sudeste e salve com este nome. Pule para o Passo 4.)*

Sem modelo 3D, gere a volumetria no Gemini (nova conversa):
1. **Cole:**
```
Clean architectural massing model screenshot of a contemporary single-storey house, white and light-grey materials only, thin black edges, no trees, light grid ground, elevated south-east isometric camera. Two flat concrete roof planes side by side (the left one slightly higher and cantilevering over a covered veranda on two slim columns), a continuous glazed south wall under the left slab, a small wood-clad entrance volume between the two wings, a lower service block at the far left, a rectangular pool in front. 16:9, no text.
```
2. Escolha uma versão limpa e salve como `assets/images/model-print.jpg`.
3. **Daqui em diante, essa imagem é a casa oficial.** Não gere outra casa.

## PASSO 4 — Render realista  →  `render-final.jpg`
1. No Gemini, **anexe** `model-print.jpg`.
2. **Cole:**
```
Transform the supplied architectural model screenshot into a photorealistic architectural visualization. Preserve the original building geometry, rooflines, window positions, proportions, camera angle and composition. Use exposed architectural concrete, natural wood, realistic glass reflections, tropical Brazilian landscaping and soft late-afternoon sunlight. Physically plausible materials, realistic global illumination, natural shadows, professional architectural photography, high detail, no structural modifications.
```
3. Gere 4 a 8 versões. Fique com a que **mais parece a volumetria** (mesmas lajes, mesmas aberturas, mesma câmera). Se a casa mudou, descreva o erro ("a laje da esquerda ficou mais baixa, mantenha como no print") e gere de novo.
4. Salve como `assets/images/render-final.jpg`.

## PASSO 5 — Capa  →  `hero.jpg`
1. Anexe `render-final.jpg`.
2. **Cole:**
```
Edit the supplied render keeping the building, camera and composition identical. Make it a cinematic golden-hour photograph: warm low sun, long soft shadows, warm reflections on the glass, pool reflecting the sky. No text, no watermark.
```
3. Salve como `assets/images/hero.jpg`.

## PASSO 6 — Quatro iluminações (um prompt de cada vez, sempre anexando `render-final.jpg`)
Em cada um, **anexe** `render-final.jpg` e cole o prompt:

**6a → salve `light-manha.jpg`**
```
Keep the house, camera and composition identical. Change only the lighting to morning: soft diffuse natural light, short moderate shadows, well-defined vegetation, balanced exposure, calm atmosphere.
```
**6b → salve `light-golden.jpg`**
```
Keep the house, camera and composition identical. Change only the lighting to golden hour: warm low sun, long shadows, golden reflections on glass and pool, cinematic atmosphere.
```
**6c → salve `light-blue.jpg`**
```
Keep the house, camera and composition identical. Change only the lighting to blue hour: deep blue sky, warm interior lights visible through the glazing, balanced interior and exterior exposure.
```
**6d → salve `light-noite.jpg`**
```
Keep the house, camera and composition identical. Change only the lighting to night: soft architectural lighting, indirect light under the slabs, low bollard lights along the path, materials highlighted, gently lit planting, glowing pool.
```
Se a casa mudar, apague e gere de novo.

## PASSO 7 — Seis cenas do filme (frames)
Em cada uma, **anexe** `render-final.jpg`, cole o prompt e salve. *(Opcional: o site ainda não exibe estes arquivos; eles servem de ponto de partida no Flow.)*

| Salvar como | Cole |
|---|---|
| `scene-1.jpg` | `Same house. Wide aerial view of the whole residence and its surroundings, late afternoon. Keep geometry identical.` |
| `scene-2.jpg` | `Same house. Frontal view of the main south facade with the glazing, concrete slab and wood louvers. Keep geometry identical.` |
| `scene-3.jpg` | `Same house. Approach to the main entrance: the wood-clad hall volume under the concrete slab, stone wall, tropical planting.` |
| `scene-4.jpg` | `Same house. Interior of the living room opening to the garden: wood ceiling, large glass wall, soft light. Furniture grounded.` |
| `scene-5.jpg` | `Same house. Close-up of materials: board-marked concrete, natural wood slats, stone cladding, glass reflections.` |
| `scene-6.jpg` | `Same house. Wide view of the whole house at dusk with interior lights on.` |

## PASSO 8 — O filme (Google Flow)  →  `assets/videos/film.mp4`
1. Abra **labs.google/flow** e crie um projeto. (Confira se sua conta tem acesso e quais recursos existem hoje.)
2. Envie `render-final.jpg` e os `scene-1…6.jpg` como imagens de referência/ponto de partida.
3. Para cada cena, **cole**:
   - Cena 1: `Slow aerial push-in over the same contemporary Brazilian residence, late-afternoon light. Preserve building geometry.`
   - Cena 2: `Smooth frontal tracking shot toward the main facade with glazing, concrete slab and wood louvers. Stable straight lines.`
   - Cena 3: `Controlled dolly-in toward the entrance under the concrete slab. Reveal the threshold between outside and inside.`
   - Cena 4: `Slow lateral tracking inside the living room opening to the garden. Furniture stays fixed.`
   - Cena 5: `Gentle push-in on concrete, wood, stone and glass details. No deformation or flicker.`
   - Cena 6: `Slow pull-back to a wide view of the whole house at dusk with interior lights on.`
   E, em todas, acrescente no fim: `Preserve the building geometry, facade, window positions, materials and landscaping. Realistic reflections. Avoid structural deformation and flickering materials.`
4. Gere 2 a 3 versões de cada cena e **descarte** as em que a casa deforma ou os materiais piscam.
5. Baixe os 6 clipes bons, junte na ordem 1→6 num editor de vídeo e exporte em **MP4 1920×1080**.
6. Salve como `assets/videos/film.mp4`.

## PASSO 9 — Quatro moodboards (formato "flat lay" vertical)  →  `moodboard-cozinha.jpg`, `moodboard-sala.jpg`, `moodboard-banheiro.jpg`, `moodboard-quarto.jpg`
Em cada um: Gemini, **anexe** `render-final.jpg` (a casa) **e a sua imagem de referência do formato**, e cole o prompt. Salve em `assets/images/`.

Prompt base: `Create a vertical interior material moodboard in the exact style of the supplied format reference: a top-down flat-lay of physical material samples arranged in an overlapping asymmetric composition on a clean white background, soft studio lighting, subtle shadows, followed below by a row of four rounded pill-shaped color swatches. Portrait 2:3. Derive the materials and colors from the supplied house render (board-marked concrete, natural wood, stone, glass, tropical greenery), not from the reference's blue palette. No text, no logos, no watermark.` + o trecho do ambiente:

- **Cozinha:** `Samples: wood cabinet veneer, concrete or stone countertop slab, matte black metal handle, ceramic tile, linen textile, a small ceramic bowl, a sprig of green leaves. Palette pills: concrete grey, warm wood, stone beige, deep green.`
- **Sala:** `Samples: wood ceiling slats, linen sofa fabric, leather swatch, stone coaster, woven rug texture, a round ceramic object, a sprig of tropical leaves. Palette pills: concrete grey, warm wood, sand, olive green.`
- **Banheiro:** `Samples: honed stone tile, concrete microcement swatch, wood vanity veneer, matte black faucet finish, white ceramic basin piece, frosted glass, a fern frond. Palette pills: stone grey, off-white, warm wood, dark graphite.`
- **Quarto:** `Samples: wood headboard veneer, linen bedding, wool throw, concrete texture, a small ceramic lamp base, a dried grass sprig. Palette pills: concrete grey, warm wood, linen beige, terracotta.`

Se aparecer texto ou logotipo, ou se ele copiar o azul da referência, gere de novo.

## Contatos
Em `js/project-data.js`, preencha `instagram` e `whatsapp` em `window.CONTACT`: os QR codes do último slide são gerados sozinhos.

---

## Conferir antes de apresentar
- Todas as imagens parecem a **mesma casa**?
- Sem texto estranho nem marca-d'água?
- Abra `index.html` e passe os slides: as suas imagens devem aparecer com o selo "ATIVO REAL". Se uma não aparecer, o nome do arquivo está errado.
- Imagem gerada por IA deve ser dita como gerada por IA na fala.

