# CartaX

**Aprende a pensar como um condutor, não a decorar respostas.**

CartaX é um protótipo de uma app para quem está a tirar a carta de condução. Junta lições curtas ao estilo Duolingo, um tutor que explica cada erro, um simulador de condução e treino de perceção de perigo. O foco é a segurança: preparar o aluno para a estrada, e não só para o exame.

## O que tem o protótipo

| Parte | O que faz |
|---|---|
| **Percurso de níveis** | Prioridades, Sinalização e Rotundas, com cenários desenhados, XP, dias seguidos e meta diária de 10 minutos. |
| **Tutor CartaX** | Quando o aluno erra, explica porquê e dá um exemplo. As perguntas falhadas voltam no fim da lição. |
| **Ao volante: Rotunda** | Simulador 2D. O aluno trava, acelera, muda de via e usa o pisca. O tutor avalia cada decisão: ceder à entrada, via certa, sinalização, momento do pisca e velocidade. |
| **Missão: Vê o perigo** | Treino de perceção de risco. O aluno toca em PERIGO quando antecipa um risco (um carro a sair do estacionamento, uma bola com uma criança atrás). Quanto mais cedo, mais pontos. |
| **Ranking** | Comparação semanal com amigos (dados de exemplo). |

## Como experimentar

É uma página HTML única, sem instalação nem servidor.

- **No computador:** abre o `index.html` no browser.
- **No telemóvel:** ativa o GitHub Pages (Settings → Pages → Branch `main`, pasta `/root`) e abre o link que aparece.

O progresso fica guardado no browser de cada pessoa.

### Instalar no telemóvel

O CartaX é uma app web instalável (PWA). Depois de abrir o link no telemóvel:

- **Android (Chrome):** menu ⋮ → **Instalar app** (ou **Adicionar ao ecrã principal**).
- **iPhone (Safari):** botão Partilhar → **Adicionar ao ecrã principal**.

Abre em ecrã inteiro, com ícone próprio, e funciona sem rede depois da primeira visita.

> Ao alterar a app, sobe a versão em `sw.js` (`cartax-v1` → `cartax-v2`) para os telemóveis receberem a versão nova.

## Limitações do protótipo

- As explicações do tutor estão escritas à mão. Na versão final, viriam de um modelo de IA treinado com o Código da Estrada.
- O conteúdo ainda tem de ser validado por um instrutor de condução.
- O ranking usa amigos fictícios e o Exame final está bloqueado ("em breve").

## Próximos passos

1. Validar o conteúdo com uma escola de condução.
2. Ligar o tutor a um modelo de IA, com respostas baseadas no Código da Estrada.
3. Simulador para cruzamentos, passadeiras e condução com chuva.
4. Exame final que mistura perguntas, simulador e perceção de perigo.
5. Mais tarde: simulador 3D e realidade aumentada para reconhecer sinais na rua.

## Tecnologia

HTML, CSS e JavaScript simples. Os cenários são desenhados em SVG e o simulador em Canvas. Não usa bibliotecas.

| Ficheiro | Para que serve |
|---|---|
| `index.html` | A app inteira. |
| `manifest.webmanifest` | Nome, cores e ícones para instalar a app. |
| `sw.js` | Service worker: guarda a app para funcionar sem rede. |
| `icons/` | Ícones da app (SVG e PNG). |

### Plataformas

1. **Web e telemóvel (agora):** a mesma página serve computador e telemóvel, e pode ser instalada como PWA.
2. **Conta e sincronização (a seguir):** guardar o progresso num backend (por exemplo Supabase ou Firebase) para passar entre aparelhos e ter um ranking real.
3. **App nas lojas (mais tarde):** embrulhar esta mesma app web com [Capacitor](https://capacitorjs.com) para publicar na App Store e no Google Play, com notificações push.
