# Qriativa · Site portfólio

Site estático (HTML + CSS + JS puro) baseado na apresentação de portfólio do Canva da Qriativa.
Não precisa de build: basta abrir o `index.html` ou publicar a pasta em qualquer hospedagem estática
(GitHub Pages, Vercel, Netlify, Hostinger...).

## Rodar localmente

```bash
python -m http.server 5500
```

Depois abra <http://localhost:5500>.

## Estrutura

```
index.html        conteúdo e seções
css/style.css     todos os estilos (paleta, flor, nav, hero, seções, responsivo)
js/main.js        navegação, menu mobile, prévias de vídeo, lightbox e fallback de animação
js/motion.js      animações de entrada e de scroll (GSAP + ScrollTrigger + Lenis)
assets/
  favicon.svg
  brand/          textura de papel dos slides
  fotos/          foto da Qetlei + fotografia corporativa
  cases/          vídeos, prévias e fotos dos clientes de vídeo e eventos
  social/         posts, impressos e reels dos clientes de social media
  logos/          logos dos clientes
```

## Animações

As animações usam [GSAP](https://gsap.com) com ScrollTrigger e [Lenis](https://lenis.darkroom.engineering) (rolagem suave), carregados do jsDelivr.
Se esses scripts não carregarem, ou se o sistema estiver com "reduzir movimento" ligado, o site continua funcionando com uma entrada simples em fade.

## Mídias

Todas as fotos, vídeos e logos vieram da apresentação do Canva da Qriativa.
Os vídeos foram convertidos para web: cada um tem três arquivos em `assets/cases/`.

| Arquivo | Uso |
|---------|-----|
| `nome.mp4` | vídeo completo com som (480px), abre no lightbox ao clicar |
| `nome-prev.mp4` | prévia muda de 5 segundos, toca em loop quando aparece na tela |
| `nome.jpg` | capa exibida antes da prévia carregar |

Outras pastas:

- `assets/fotos/`: foto da Qetlei, centro cirúrgico e retratos corporativos.
- `assets/logos/`: logos dos clientes com fundo transparente.
- `assets/brand/textura.png`: textura de papel usada no fundo das seções, igual à dos slides.

Para trocar ou adicionar um vídeo, gere os três arquivos com o mesmo nome e copie um `<figure class="phone vid">` (ou `card-v vid`) existente no `index.html`, ajustando o nome.
Com ffmpeg:

```bash
ffmpeg -i original.mp4 -vf scale=480:-2 -c:v libx264 -crf 30 -c:a aac -b:a 64k -ac 1 -movflags +faststart nome.mp4
```

## Contatos usados no site

- Instagram: @qriativa e @qetlei
- WhatsApp: (85) 9 9628.7631
- E-mail: aqriativa@gmail.com

Para mudar, edite as seções `#contato` e o botão "Reservar data" no `index.html`.
# Portf-lio-Qriativa
