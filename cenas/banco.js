/*
 * CartaX — banco de perguntas v0.1 (rascunho, por validar por um instrutor)
 * Só as perguntas com ilustração. Fonte: documento "CartaX — Banco de Perguntas v0.1".
 * Cada cena segue o formato do desenhador (desenhador.js).
 */
(function (global) {
  var C = function (t, ok) { return [t, !!ok]; };
  var BANCO = [
    /* ---------- Tema 1 — Prioridades em cruzamentos ---------- */
    { id: "1.1", tema: "Prioridades em cruzamentos",
      enunciado: "Chegas a um cruzamento sem sinais nem semáforos. Um ligeiro aproxima-se pela tua direita. Quem passa primeiro?",
      opcoes: [C("O ligeiro da direita", 1), C("Tu, porque vais em frente"), C("Quem chegar primeiro ao cruzamento")],
      cena: { peca: "cruzamento_x", elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "sul", avanco: 0.95, tu: true },
        { id: "direita", tipo: "ligeiro", lugar: "este", avanco: 0.8 }],
        elementos_criticos: ["cruzamento sem sinais nem semáforos", "ligeiro a vir da tua direita"] } },
    { id: "1.2", tema: "Prioridades em cruzamentos",
      enunciado: "No mesmo cruzamento sem sinais, o ligeiro aproxima-se agora pela tua esquerda. O que acontece?",
      opcoes: [C("Passas tu; é ele que te cede a passagem", 1), C("Cedes-lhe a passagem"), C("Param os dois e combinam por gestos")],
      cena: { peca: "cruzamento_x", elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "sul", avanco: 0.95, tu: true },
        { id: "esquerda", tipo: "ligeiro", lugar: "oeste", avanco: 0.8 }],
        elementos_criticos: ["cruzamento sem sinais nem semáforos", "ligeiro a vir da tua esquerda"] } },
    { id: "1.3", tema: "Prioridades em cruzamentos",
      enunciado: "Tens um sinal STOP. Na via principal, sem sinais, vem um ligeiro pela tua esquerda. O que fazes?",
      opcoes: [C("Paras e cedes-lhe a passagem", 1), C("Paras e avanças, porque ele vem da esquerda"), C("Abrandas e passas se ele estiver longe")],
      cena: { peca: "entroncamento_t", sinais: { sul: "stop" }, elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "sul", avanco: 1, tu: true },
        { id: "esquerda", tipo: "ligeiro", lugar: "oeste", avanco: 0.7 }],
        elementos_criticos: ["sinal STOP e linha de paragem na tua via", "ligeiro na via principal a vir da esquerda"] } },
    { id: "1.4", tema: "Prioridades em cruzamentos",
      enunciado: "Tens sinal de cedência de passagem. Na via principal vêm dois ligeiros: um pela direita e outro pela esquerda. A quem cedes?",
      opcoes: [C("Aos dois", 1), C("Só ao da direita"), C("Só ao da esquerda")],
      cena: { peca: "cruzamento_x", sinais: { sul: "cedencia" }, elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "sul", avanco: 0.95, tu: true },
        { id: "direita", tipo: "ligeiro", lugar: "este", avanco: 0.75 },
        { id: "esquerda", tipo: "ligeiro", lugar: "oeste", avanco: 0.7 }],
        elementos_criticos: ["sinal de cedência de passagem na tua entrada", "ligeiro a vir da direita", "ligeiro a vir da esquerda"] } },
    { id: "1.5", tema: "Prioridades em cruzamentos",
      enunciado: "Num cruzamento sem sinais, vais virar à esquerda. Em sentido contrário vem um ligeiro que segue em frente. Quem passa primeiro?",
      opcoes: [C("O ligeiro que segue em frente", 1), C("Tu, porque já sinalizaste com o pisca"), C("Quem estiver mais perto do centro do cruzamento")],
      cena: { peca: "cruzamento_x", elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "sul", avanco: 0.95, tu: true, estado: { pisca: "esquerdo" } },
        { id: "frente", tipo: "ligeiro", lugar: "norte", avanco: 0.9 }],
        elementos_criticos: ["o teu pisca esquerdo ligado", "ligeiro em sentido contrário, a seguir em frente"] } },

    /* ---------- Tema 2 — Rotundas ---------- */
    { id: "2.1", tema: "Rotundas",
      enunciado: "Vais entrar numa rotunda. Um ligeiro já circula nela e aproxima-se pela tua esquerda. O que fazes?",
      opcoes: [C("Cedes-lhe a passagem e só entras quando houver espaço", 1), C("Entras, porque ele vem da esquerda"), C("Entras e ele abranda")],
      cena: { peca: "rotunda_2vias", elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "entrada_sul", avanco: 1, tu: true },
        { id: "rotunda", tipo: "ligeiro", lugar: "via_exterior", avanco: 0.86 }],
        elementos_criticos: ["tu na entrada, junto à linha de cedência", "ligeiro na rotunda a aproximar-se da tua entrada"] } },
    { id: "2.2", tema: "Rotundas",
      enunciado: "Rotunda de duas vias. Vais sair na primeira saída. Que via usas?",
      opcoes: [C("A via da direita, do início ao fim", 1), C("A via interior, passando para a direita na saída"), C("Qualquer uma, desde que use o pisca")],
      cena: { peca: "rotunda_2vias", saida_destacada: "este", elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "via_exterior", avanco: 0.08, tu: true, estado: { pisca: "direito" } }],
        elementos_criticos: ["tu na via exterior (da direita)", "pisca direito ligado", "1.ª saída destacada"] } },
    { id: "2.3", tema: "Rotundas",
      enunciado: "Rotunda de duas vias. Vais sair na terceira saída. Quando deves passar para a via da direita?",
      opcoes: [C("Depois de passares a segunda saída", 1), C("Logo à entrada"), C("Em frente à terceira saída")],
      cena: { peca: "rotunda_2vias", saida_destacada: "oeste", elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "via_interior", avanco: 0.6, tu: true }],
        elementos_criticos: ["tu na via interior, entre a 2.ª e a 3.ª saída", "3.ª saída destacada"] } },
    { id: "2.4", tema: "Rotundas",
      enunciado: "Estás na via interior e chegas à tua saída com um ligeiro na via da direita, ao teu lado. O que fazes?",
      opcoes: [C("Continuas na rotunda e sais na volta seguinte", 1), C("Sais à frente dele, com pisca"), C("Paras na via interior até ele passar")],
      cena: { peca: "rotunda_2vias", saida_destacada: "oeste", elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "via_interior", avanco: 0.72, tu: true },
        { id: "lado", tipo: "ligeiro", lugar: "via_exterior", junto_a: "tu", posicao: "ao_lado" }],
        elementos_criticos: ["tu na via interior, junto à saída", "ligeiro na via exterior, ao teu lado", "a tua saída destacada"] } },
    { id: "2.5", tema: "Rotundas",
      enunciado: "Um pesado vai sair na terceira saída e circula sempre pela via da direita. Está correto?",
      opcoes: [C("Sim, os pesados podem ocupar a via da direita, sem prejudicar quem sai", 1), C("Não, devia usar a via interior"), C("Só se tiver o pisca direito ligado")],
      cena: { peca: "rotunda_2vias", elementos: [
        { id: "pesado", tipo: "pesado", lugar: "via_exterior", avanco: 0.38 }],
        elementos_criticos: ["pesado na via exterior (da direita), entre a 1.ª e a 2.ª saída"] } },

    /* ---------- Tema 3 — Autoestrada ---------- */
    { id: "3.1", tema: "Autoestrada",
      enunciado: "Estás na via de aceleração para entrar na autoestrada. Um ligeiro circula na faixa da direita, ao teu lado. O que fazes?",
      opcoes: [C("Cedes-lhe a passagem e entras atrás dele", 1), C("Entras, porque estás à direita dele"), C("Paras no fim da via de aceleração")],
      cena: { peca: "entrada_autoestrada", elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "via_aceleracao", avanco: 0.5, tu: true, estado: { pisca: "esquerdo" } },
        { id: "lado", tipo: "ligeiro", lugar: "faixa_direita", junto_a: "tu", posicao: "ao_lado" }],
        elementos_criticos: ["tu na via de aceleração", "ligeiro na faixa da direita, ao teu lado"] } },
    { id: "3.2", tema: "Autoestrada",
      enunciado: "Para que serve a via de aceleração?",
      opcoes: [C("Para ganhar velocidade e entrar quando houver espaço na faixa da direita", 1), C("Para circular como uma faixa extra até à saída seguinte"), C("Para entrar à mesma velocidade do ramal")],
      cena: { peca: "entrada_autoestrada", elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "via_aceleracao", avanco: 0.3, tu: true, estado: { pisca: "esquerdo" } }],
        elementos_criticos: ["tu na via de aceleração", "via de aceleração a terminar à frente"] } },
    { id: "3.4", tema: "Autoestrada",
      enunciado: "Circulas na faixa da direita e vês um ligeiro na via de aceleração, a preparar-se para entrar. O que é mais seguro fazer?",
      opcoes: [C("Se for seguro, passar para a faixa do meio e facilitar a entrada", 1), C("Acelerar para ele não entrar à tua frente"), C("Travar a fundo para o deixar entrar")],
      cena: { peca: "entrada_autoestrada", elementos: [
        { id: "entra", tipo: "ligeiro", lugar: "via_aceleracao", avanco: 0.55, estado: { pisca: "esquerdo" } },
        { id: "tu", tipo: "ligeiro", lugar: "faixa_direita", junto_a: "entra", posicao: "atras", tu: true }],
        elementos_criticos: ["tu na faixa da direita", "ligeiro na via de aceleração, à tua frente, com pisca esquerdo", "faixa central livre"] } },
    { id: "3.5", tema: "Autoestrada",
      enunciado: "Uma ambulância, sem luzes nem sirene, vai entrar na autoestrada. Tu circulas na faixa da direita. Quem tem prioridade?",
      opcoes: [C("Tu, que já circulas na autoestrada", 1), C("A ambulância, por ser um veículo de socorro"), C("Quem estiver à frente")],
      cena: { peca: "entrada_autoestrada", elementos: [
        { id: "amb", tipo: "ambulancia", lugar: "via_aceleracao", avanco: 0.6, estado: { emergencia: false, pisca: "esquerdo" } },
        { id: "tu", tipo: "ligeiro", lugar: "faixa_direita", junto_a: "amb", posicao: "atras", tu: true }],
        elementos_criticos: ["ambulância na via de aceleração", "luzes de emergência apagadas", "tu na faixa da direita"] } },

    /* ---------- Tema 4 — Peões, ciclistas e passadeiras ---------- */
    { id: "4.1", tema: "Peões, ciclistas e passadeiras",
      enunciado: "Um peão já começou a atravessar na passadeira à tua frente. O que fazes?",
      opcoes: [C("Paras antes da passadeira e deixas que atravesse", 1), C("Passas atrás dele, se houver espaço"), C("Buzinas para ele se despachar")],
      cena: { peca: "passadeira_rua", elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "via", avanco: 0.4, tu: true },
        { id: "peao", tipo: "peao", lugar: "passadeira", avanco: 0.5 }],
        elementos_criticos: ["passadeira à tua frente", "peão a meio da passadeira"] } },
    { id: "4.3", tema: "Peões, ciclistas e passadeiras",
      enunciado: "Na faixa ao lado, um ligeiro está parado mesmo antes de uma passadeira. Podes ultrapassá-lo?",
      opcoes: [C("Não: é proibido ultrapassar imediatamente antes e na passadeira", 1), C("Sim, se não vires nenhum peão"), C("Sim, se buzinares antes")],
      cena: { peca: "passadeira_avenida", elementos: [
        { id: "parado", tipo: "ligeiro", lugar: "faixa_direita", avanco: 0.43, estado: { travao: true } },
        { id: "tu", tipo: "ligeiro", lugar: "faixa_esquerda", junto_a: "parado", posicao: "atras", tu: true },
        { id: "peao", tipo: "peao", lugar: "passadeira", avanco: 0.25 }],
        elementos_criticos: ["ligeiro parado antes da passadeira, na faixa da direita", "tu na faixa da esquerda, atrás dele", "peão na passadeira, à frente do carro parado"] } },
    { id: "4.4", tema: "Peões, ciclistas e passadeiras",
      enunciado: "Queres deixar sair um passageiro e paras a 3 metros de uma passadeira. Está correto?",
      opcoes: [C("Não: é proibido parar a menos de 5 m antes de uma passadeira", 1), C("Sim, se for por pouco tempo"), C("Sim, se ligares os quatro piscas")],
      cena: { peca: "passadeira_rua", elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "junto_passeio", avanco: 0.38, tu: true, estado: { pisca: "ambos" } }],
        elementos_criticos: ["tu parado junto ao passeio", "passadeira logo à frente"] } },
    { id: "4.5", tema: "Peões, ciclistas e passadeiras",
      enunciado: "Vais ultrapassar um ciclista numa estrada sem trânsito em sentido contrário. Que distância lateral mínima tens de deixar?",
      opcoes: [C("1,5 m", 1), C("0,5 m"), C("1 m")],
      cena: { peca: "estrada_2sentidos", elementos: [
        { id: "ciclista", tipo: "bicicleta", lugar: "junto_berma", avanco: 0.6 },
        { id: "tu", tipo: "ligeiro", lugar: "via", avanco: 0.3, tu: true, estado: { pisca: "esquerdo" } }],
        elementos_criticos: ["ciclista junto à berma direita", "tu atrás, com pisca esquerdo", "sentido contrário livre"] } },

    /* ---------- Tema 5 — Ultrapassagem ---------- */
    { id: "5.1", tema: "Ultrapassagem",
      enunciado: "Numa estrada de dois sentidos, queres ultrapassar um trator lento. Por que lado o fazes?",
      opcoes: [C("Pela esquerda", 1), C("Pela direita, pela berma"), C("Pelo lado que tiver mais espaço")],
      cena: { peca: "estrada_2sentidos", elementos: [
        { id: "trator", tipo: "trator", lugar: "via", avanco: 0.6 },
        { id: "tu", tipo: "ligeiro", lugar: "via", junto_a: "trator", posicao: "atras", tu: true }],
        elementos_criticos: ["trator à tua frente", "sentido contrário livre"] } },
    { id: "5.2", tema: "Ultrapassagem",
      enunciado: "Segues atrás de um ligeiro lento e aproximas-te de uma curva onde não vês o que vem do outro lado. Podes ultrapassar?",
      opcoes: [C("Não: é proibido ultrapassar em curvas de visibilidade reduzida", 1), C("Sim, se acelerares bem"), C("Sim, se buzinares antes da curva")],
      cena: { peca: "estrada_curva", elementos: [
        { id: "lento", tipo: "ligeiro", lugar: "via", avanco: 0.3 },
        { id: "tu", tipo: "ligeiro", lugar: "via", avanco: 0.17, tu: true }],
        elementos_criticos: ["curva para a esquerda", "mato a tapar a vista para lá da curva", "ligeiro lento à tua frente"] } },
    { id: "5.4", tema: "Ultrapassagem",
      enunciado: "Vais a chegar a um cruzamento, atrás de um ligeiro lento. Podes ultrapassá-lo antes do cruzamento?",
      opcoes: [C("Não: é proibido ultrapassar imediatamente antes e nos cruzamentos", 1), C("Sim, se tiveres prioridade"), C("Sim, se o cruzamento tiver semáforos verdes")],
      cena: { peca: "cruzamento_x", elementos: [
        { id: "lento", tipo: "ligeiro", lugar: "sul", avanco: 0.75 },
        { id: "tu", tipo: "ligeiro", lugar: "sul", junto_a: "lento", posicao: "atras", tu: true }],
        elementos_criticos: ["cruzamento logo à frente", "ligeiro lento à tua frente"] } },

    /* ---------- Tema 6 — Veículos em marcha de urgência ---------- */
    { id: "6.1", tema: "Veículos em marcha de urgência",
      enunciado: "Uma ambulância, com luzes e sirene ligadas, aproxima-se por trás de ti. O que fazes?",
      opcoes: [C("Sinalizas e desvias-te para a direita quando for seguro, facilitando a passagem", 1), C("Aceleras para não a atrasar"), C("Manténs a marcha, porque a faixa é tua")],
      cena: { peca: "estrada_2sentidos", elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "via", avanco: 0.65, tu: true },
        { id: "amb", tipo: "ambulancia", lugar: "via", junto_a: "tu", posicao: "atras", estado: { emergencia: true } }],
        elementos_criticos: ["ambulância atrás de ti", "luzes de emergência acesas"] } },
    { id: "6.2", tema: "Veículos em marcha de urgência",
      enunciado: "A ambulância, com luzes e sirene ligadas, deve ceder a passagem ao entrar na autoestrada?",
      opcoes: [C("Não: em marcha de urgência são os outros que lhe facilitam a passagem", 1), C("Sim, como qualquer veículo que entra na autoestrada"), C("Só se a faixa da direita estiver ocupada")],
      cena: { peca: "entrada_autoestrada", elementos: [
        { id: "amb", tipo: "ambulancia", lugar: "via_aceleracao", avanco: 0.5, estado: { emergencia: true } },
        { id: "lado", tipo: "ligeiro", lugar: "faixa_direita", junto_a: "amb", posicao: "ao_lado" }],
        elementos_criticos: ["ambulância na via de aceleração", "luzes de emergência acesas", "ligeiro na faixa da direita, ao lado"] } },
    { id: "6.3", tema: "Veículos em marcha de urgência",
      enunciado: "Tens o semáforo verde. Pela tua esquerda aproxima-se um veículo dos bombeiros com luzes e sirene ligadas. O que fazes?",
      opcoes: [C("Paras e deixas passar o veículo dos bombeiros", 1), C("Avanças, porque tens verde"), C("Avanças depressa, para sair do caminho")],
      cena: { peca: "cruzamento_x", semaforos: { sul: "verde", oeste: "vermelho" }, elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "sul", avanco: 0.95, tu: true },
        { id: "bombeiros", tipo: "bombeiros", lugar: "oeste", avanco: 0.7, estado: { emergencia: true } }],
        elementos_criticos: ["semáforo verde na tua entrada", "veículo dos bombeiros a vir da esquerda", "luzes de emergência acesas"] } },
    { id: "6.4", tema: "Veículos em marcha de urgência",
      enunciado: "Na autoestrada, segues na faixa da esquerda e uma ambulância em marcha de urgência aproxima-se por trás. O que fazes?",
      opcoes: [C("Sinalizas e passas para a direita assim que for seguro", 1), C("Travas para ela te ultrapassar pela direita"), C("Paras na berma da esquerda")],
      cena: { peca: "troco_autoestrada", elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "faixa_esquerda", avanco: 0.6, tu: true, estado: { pisca: "direito" } },
        { id: "amb", tipo: "ambulancia", lugar: "faixa_esquerda", junto_a: "tu", posicao: "atras", estado: { emergencia: true } },
        { id: "outro", tipo: "ligeiro", lugar: "faixa_direita", avanco: 0.75 }],
        elementos_criticos: ["tu na faixa da esquerda", "ambulância atrás de ti, com luzes acesas", "faixa central livre"] } },

    /* ---------- Tema 7 — Sinalização ---------- */
    { id: "7.1", tema: "Sinalização",
      enunciado: "Um sinal triangular, branco com bordo vermelho, indica o quê?",
      opcoes: [C("Perigo à frente", 1), C("Uma proibição"), C("Uma obrigação")],
      cena: { peca: "sinal_isolado", sinal: "perigo", elementos: [],
        elementos_criticos: ["sinal triangular branco com bordo vermelho"] } },
    { id: "7.2", tema: "Sinalização",
      enunciado: "Um sinal redondo, branco com bordo vermelho e o número 50, significa:",
      opcoes: [C("Proibido exceder 50 km/h", 1), C("Velocidade recomendada de 50 km/h"), C("Velocidade mínima de 50 km/h")],
      cena: { peca: "sinal_isolado", sinal: "limite_50", elementos: [],
        elementos_criticos: ["sinal redondo branco com bordo vermelho e o número 50"] } },
    { id: "7.3", tema: "Sinalização",
      enunciado: "Um sinal redondo azul com uma seta branca a apontar para a direita obriga-te a quê?",
      opcoes: [C("A virar à direita", 1), C("A não virar à direita"), C("A ceder a passagem a quem vem da direita")],
      cena: { peca: "entroncamento_t", sinais: { sul: "obrigacao_direita" }, elementos: [
        { id: "tu", tipo: "ligeiro", lugar: "sul", avanco: 0.85, tu: true }],
        elementos_criticos: ["sinal de obrigação de virar à direita na tua via"] } },

    /* ---------- Tema 8 — Condições adversas e distância de segurança ---------- */
    { id: "8.2", tema: "Condições adversas e distância de segurança",
      enunciado: "Como se mede uma distância de segurança prática com tempo seco?",
      opcoes: [C("Pelo menos 2 segundos atrás do veículo da frente", 1), C("Um carro de distância"), C("10 metros, seja qual for a velocidade")],
      cena: { peca: "estrada_2sentidos", marcos_berma: [0.62], elementos: [
        { id: "frente", tipo: "ligeiro", lugar: "via", avanco: 0.75 },
        { id: "tu", tipo: "ligeiro", lugar: "via", avanco: 0.42, tu: true }],
        elementos_criticos: ["dois ligeiros no mesmo sentido", "marco na berma entre os dois"] } }
  ];
  if (typeof module !== "undefined" && module.exports) module.exports = BANCO;
  else global.CartaXBanco = BANCO;
})(this);
