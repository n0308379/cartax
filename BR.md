# CartaX — Regras de Negócio (MoSCoW)

Oct 24, 2026 · @Eunice Lee

## Objetivo e âmbito

A versão 1.0 da CartaX tem 26 regras **Must**: lições curtas, tutor que explica cada erro, simulador 2D e treino de perceção de perigo, com conteúdo validado por um instrutor antes de chegar aos alunos. As restantes regras ficam para versões seguintes ou fora de âmbito.

A CartaX é uma app para alunos de condução em Portugal. O objetivo é preparar para a estrada, e não só para o exame teórico do IMT. Este documento define as regras de negócio do produto, com base no protótipo publicado em [cartax.skyxlee.com](https://cartax.skyxlee.com), e prioriza-as para a primeira versão comercial.

Fora deste documento: arquitetura técnica, design visual e modelo de preços detalhado.

## Classificação MoSCoW

Cada regra tem um identificador (BR-nn), uma prioridade e o estado no protótipo atual.

| Prioridade | Significado nesta versão |
| --- | --- |
| **Must** | Obrigatória para lançar a v1.0. Sem ela, o produto não cumpre o objetivo ou não é legal. |
| **Should** | Importante, entra na v1.0 se houver capacidade; caso contrário, na versão seguinte. |
| **Could** | Desejável, com baixo impacto se ficar de fora. Avaliar depois de haver utilizadores. |
| **Won't** | Fora da v1.0 por decisão. Fica registada para não voltar à discussão sem motivo novo. |

Na coluna *Protótipo*: **Sim** = já funciona, **Parcial** = existe numa forma simplificada, **Não** = por fazer.

## Aprendizagem e progressão

O aluno avança por níveis temáticos em lições de até 10 minutos, e só termina uma lição quando acerta todas as perguntas.

| ID | Regra | MoSCoW | Protótipo |
| --- | --- | --- | --- |
| BR-01 | O conteúdo está organizado em níveis temáticos (ex.: Prioridades, Sinalização, Rotundas). | Must | Sim |
| BR-02 | Cada lição tem entre 4 e 10 perguntas e completa-se em 10 minutos ou menos. | Must | Sim |
| BR-03 | Cada pergunta tem 2 a 4 opções e uma única resposta correta. | Must | Sim |
| BR-04 | Uma pergunta errada volta no fim da mesma lição, até ser acertada. A lição só termina com todas acertadas. | Must | Sim |
| BR-05 | O resultado da lição é a percentagem de perguntas acertadas à primeira tentativa. | Must | Sim |
| BR-06 | As perguntas de situação têm um cenário ilustrado (cruzamento, rotunda, passadeira). | Must | Sim |
| BR-07 | Os temas falhados são revistos na sessão seguinte (repetição espaçada). | Should | Parcial (só é listado no fim da lição) |
| BR-08 | O nível seguinte só desbloqueia com 80% ou mais no nível anterior. | Should | Não (todos abertos) |
| BR-09 | O Exame final reproduz o formato do exame teórico do IMT (número de perguntas, tempo, critério de aprovação). | Should | Não |
| BR-10 | Cada nível abre com uma lição em vídeo de 1 a 2 minutos. | Could | Não |

## Tutor

Quando o aluno erra, o tutor explica porque é que aquela opção está errada, usando só conteúdo validado.

| ID | Regra | MoSCoW | Protótipo |
| --- | --- | --- | --- |
| BR-11 | Ao errar, o aluno vê uma explicação específica para a opção que escolheu, e não uma explicação genérica da pergunta. | Must | Sim |
| BR-12 | O tutor só mostra a explicação depois de o aluno responder. Nunca revela a resposta antes. | Must | Sim |
| BR-13 | O aluno pode pedir um exemplo adicional sobre a mesma regra. | Must | Sim |
| BR-14 | Se as explicações forem geradas por IA, só podem usar a base de conteúdo validado (BR-35). Sem resposta segura, mostra-se a explicação pré-escrita. | Must | Não (explicações escritas à mão) |
| BR-15 | Cada explicação indica o artigo do Código da Estrada em que se baseia. | Should | Não |
| BR-16 | O aluno pode fazer perguntas abertas ao tutor, em conversa livre. | Could | Não |

## Simulador de condução

O simulador 2D avalia decisões concretas (ceder, escolher a via, sinalizar e controlar a velocidade) e explica cada erro no fim da missão.

| ID | Regra | MoSCoW | Protótipo |
| --- | --- | --- | --- |
| BR-17 | Em cada missão, o simulador avalia: ceder à entrada, via correta para a saída, sinalização das mudanças de via, momento do pisca para sair e velocidade. | Must | Sim (rotunda) |
| BR-18 | No fim da missão, cada decisão aparece como certa ou errada, e cada erro tem uma explicação do tutor. | Must | Sim |
| BR-19 | Não se pode sair da rotunda a partir da via interior. Se o carro chegar à saída nessa via, dá mais uma volta e o erro fica registado. | Must | Sim |
| BR-20 | O limite de velocidade é definido por cenário e validado por um instrutor (valor atual da rotunda: 30 km/h, a confirmar). | Must | Parcial (valor fixo) |
| BR-21 | Há cenários para cruzamentos, passadeiras e condução com chuva. | Should | Não |
| BR-22 | O simulador tem uma versão 3D, na primeira pessoa. | Won't | Não |
| BR-23 | O simulador pode ser usado com óculos de realidade virtual. | Won't | Não |

## Perceção de perigo

Quanto mais cedo o aluno deteta o perigo, mais pontos ganha. Toques sem perigo não contam.

| ID | Regra | MoSCoW | Protótipo |
| --- | --- | --- | --- |
| BR-24 | Cada perigo tem uma janela de deteção. Um toque até 1 s depois do início vale 5 pontos, até 2 s vale 3, e até ao fim da janela vale 1. Fora da janela, 0. | Must | Sim |
| BR-25 | No fim da missão, cada perigo é explicado: o que era, que sinal o antecipava e o que fazer. | Must | Sim |
| BR-26 | Tocar repetidamente sem haver perigo anula a pontuação desse perigo. | Should | Parcial (só conta os toques) |
| BR-27 | As missões usam vídeos filmados em estrada real, em vez de animação. | Could | Não |
| BR-28 | A app reconhece sinais e marcações reais através da câmara (realidade aumentada). | Won't | Não |

## Gamificação

A gamificação recompensa a consistência e o acerto, mas nunca expõe dados de alunos a desconhecidos.

| ID | Regra | MoSCoW | Protótipo |
| --- | --- | --- | --- |
| BR-29 | XP: 10 por pergunta certa à primeira, 5 se acertar na revisão; 5 por decisão certa no simulador; 4 por ponto na perceção de perigo. | Must | Sim |
| BR-30 | A contagem de dias seguidos aumenta com pelo menos uma atividade concluída no dia, e volta a zero ao fim de um dia sem atividade. | Must | Parcial (valor de exemplo) |
| BR-31 | Há uma meta diária de 10 minutos, com progresso visível no ecrã inicial. | Should | Parcial (estimada por atividade) |
| BR-32 | Ranking semanal entre amigos, que volta a zero à segunda-feira. | Could | Parcial (amigos de exemplo) |
| BR-33 | Conquistas por marcos (ex.: primeiro nível completo, 7 dias seguidos). | Could | Não |
| BR-34 | Ranking público com todos os utilizadores. | Won't | Não |

## Conteúdo e conformidade

Nenhuma pergunta, explicação ou cenário chega aos alunos sem ser validado por um instrutor certificado.

| ID | Regra | MoSCoW | Protótipo |
| --- | --- | --- | --- |
| BR-35 | Todo o conteúdo (perguntas, explicações, cenários do simulador) é validado por um instrutor certificado antes de ser publicado. | Must | Não |
| BR-36 | O conteúdo segue a versão em vigor do Código da Estrada e os temas do exame do IMT, e é revisto sempre que a lei muda. | Must | Não |
| BR-37 | As perguntas são originais. Não se copiam perguntas de bancos de exame oficiais ou comerciais. | Must | Sim |
| BR-38 | A app indica claramente que complementa a escola de condução e não a substitui. | Must | Não |
| BR-39 | Cada pergunta regista a fonte legal e a data da última validação. | Should | Não |

## Dados e privacidade

Muitos alunos têm 17 ou 18 anos, por isso a app recolhe o mínimo de dados e cumpre o RGPD desde o primeiro dia.

| ID | Regra | MoSCoW | Protótipo |
| --- | --- | --- | --- |
| BR-40 | O registo cumpre o RGPD, incluindo as regras de consentimento para utilizadores menores de idade em Portugal. | Must | Não (sem contas) |
| BR-41 | Só se recolhem os dados necessários: nome ou alcunha, email e progresso de aprendizagem. | Must | Sim (só progresso, no dispositivo) |
| BR-42 | O aluno só aparece no ranking de amigos que aceitou, e o ranking não mostra outros dados pessoais. | Must | Não |
| BR-43 | O aluno pode exportar os seus dados e apagar a conta a qualquer momento. | Must | Não |
| BR-44 | O progresso fica guardado na conta e sincroniza entre dispositivos. | Should | Não (só no browser) |
| BR-45 | Os dados só são partilhados com uma escola de condução parceira se o aluno der consentimento explícito. | Should | Não |

## Resumo MoSCoW

Das 45 regras, 26 são Must. Destas, 9 ainda faltam ou estão só em parte no protótipo, quase todas sobre validação de conteúdo, contas e RGPD.

| Prioridade | N.º | Regras |
| --- | --- | --- |
| Must | 26 | BR-01 a BR-06, BR-11 a BR-14, BR-17 a BR-20, BR-24, BR-25, BR-29, BR-30, BR-35 a BR-38, BR-40 a BR-43 |
| Should | 10 | BR-07, BR-08, BR-09, BR-15, BR-21, BR-26, BR-31, BR-39, BR-44, BR-45 |
| Could | 5 | BR-10, BR-16, BR-27, BR-32, BR-33 |
| Won't | 4 | BR-22, BR-23, BR-28, BR-34 |

**Musts em falta para a v1.0:** BR-14 (tutor com IA sobre base validada), BR-20 (limites de velocidade validados), BR-30 (dias seguidos reais), BR-35 e BR-36 (validação e atualização do conteúdo), BR-38 (aviso de complemento à escola), BR-40, BR-42 e BR-43 (contas e RGPD, ranking privado, exportar e apagar dados).

## Pressupostos e questões em aberto

**Pressupostos**

- O público principal são alunos da categoria B (ligeiros) em Portugal continental.
- A v1.0 é uma web app (PWA) para telemóvel. As apps nativas ficam para depois.
- Os valores de pontuação e XP vêm do protótipo e podem ser afinados com dados de uso.

**Questões em aberto**

- [ ] Que instrutor ou escola de condução valida o conteúdo (BR-35), e com que periodicidade?
- [ ] O tutor da v1.0 usa IA ou só explicações pré-escritas? Isto decide o âmbito de BR-14.
- [ ] Que número de perguntas, tempo e critério de aprovação tem o exame atual do IMT (BR-09)?
- [ ] O modelo de negócio é B2C (assinatura do aluno), B2B (licença para escolas e parceiros) ou ambos? Isto afeta BR-45.
- [ ] Quem detém os direitos do conteúdo e do protótipo, se houver parceria com terceiros?
