/* Explicação e artigo de cada pergunta ilustrada (Banco de Perguntas v0.1).
   «A confirmar» = o instrutor deve indicar o artigo. «Boa prática» = condução defensiva, sem artigo. */
(function (global) {
  var E = {
    "1.1": ["Sem sinalização, cede-se a passagem a quem se apresenta pela direita. Ir em frente ou chegar primeiro não dá prioridade.", "Art. 30.º"],
    "1.2": ["Para o outro condutor, tu és quem vem da direita. A regra é a mesma, vista do outro lado.", "Art. 30.º"],
    "1.3": ["Os sinais prevalecem sobre as regras gerais. Com STOP, paras sempre e cedes a quem circula na outra via, venha de onde vier.", "Art. 7.º, n.º 1"],
    "1.4": ["O sinal de cedência obriga a ceder a todos os que circulam na via com prioridade. A regra da direita deixa de se aplicar.", "Art. 7.º, n.º 1"],
    "1.5": ["Quem muda de direção para a esquerda cede a passagem aos veículos que vêm em sentido contrário. O pisca avisa, mas não dá prioridade.", "A confirmar"],
    "2.1": ["Ao entrar, cede-se a passagem a quem já circula na rotunda, seja qual for a via em que esteja.", "Art. 14.º-A, n.º 1, al. a)"],
    "2.2": ["Para sair na primeira saída, ocupa-se a via da direita.", "Art. 14.º-A, n.º 1, al. b)"],
    "2.3": ["Para as saídas que não são a primeira, só se ocupa a via da direita depois de passar a saída imediatamente anterior, com as devidas precauções.", "Art. 14.º-A, n.º 1, al. c)"],
    "2.4": ["Não se sai da rotunda a partir da via interior. Sem espaço para passar à direita, dá-se mais uma volta.", "Art. 14.º-A, n.º 1, al. c)"],
    "2.5": ["Pesados, velocípedes e veículos de tração animal podem circular pela via mais à direita, facilitando a saída dos outros.", "Art. 14.º-A, n.º 2"],
    "3.1": ["Quem entra numa autoestrada pelo ramal de acesso cede a passagem a quem nela circula. A regra da direita não se aplica.", "Art. 31.º, n.º 1, al. b)"],
    "3.2": ["A via de aceleração permite ajustar a velocidade à do trânsito e escolher o momento de entrar, cedendo a passagem. Termina à frente: não serve para circular até à saída seguinte.", "Art. 31.º, n.º 1, al. b)"],
    "3.4": ["A prioridade é tua, mas facilitar a entrada evita travagens e situações de risco. Mudar de via de trânsito só se houver espaço e depois de sinalizar.", "Boa prática"],
    "3.5": ["Sem marcha de urgência, a ambulância é um veículo como os outros e cede a passagem ao entrar.", "Art. 31.º, n.º 1, al. b)"],
    "4.1": ["O peão que já iniciou a travessia tem de a poder concluir em segurança. Passar perto ou buzinar põe-no em perigo.", "Art. 11.º, n.º 3; regra da passadeira a confirmar"],
    "4.3": ["Além de proibido, é perigoso: o carro parado pode estar a deixar passar um peão que tu não vês.", "Art. 41.º, n.º 1, al. d)"],
    "4.4": ["Parar junto à passadeira tapa a visão de peões e condutores. A lei proíbe parar a menos de 5 m antes dela.", "Art. 49.º, n.º 1, al. d)"],
    "4.5": ["Na ultrapassagem a velocípedes, a lei exige uma distância lateral de pelo menos 1,5 m.", "Art. 18.º, n.º 3"],
    "5.1": ["A ultrapassagem faz-se pela esquerda.", "Art. 36.º, n.º 1"],
    "5.2": ["Sem ver o que vem em sentido contrário, não há forma segura de ultrapassar.", "Art. 41.º, n.º 1, al. e)"],
    "5.4": ["Junto a cruzamentos há veículos a entrar e a mudar de direção que não esperam alguém na via de trânsito do sentido contrário.", "Art. 41.º, n.º 1, al. c)"],
    "6.1": ["Os veículos em marcha de urgência têm de passar. O condutor facilita-lhes a passagem sem pôr ninguém em perigo.", "A confirmar"],
    "6.2": ["Em marcha de urgência, a ambulância tem prioridade, mas não pode pôr os outros em perigo. Quem circula na autoestrada facilita a entrada.", "A confirmar"],
    "6.3": ["O verde não te dá prioridade sobre um veículo em marcha de urgência.", "A confirmar"],
    "6.4": ["Libertar a via de trânsito da esquerda é a forma mais segura de deixar passar o veículo de socorro.", "A confirmar"],
    "7.1": ["A forma diz o tipo de sinal: triângulo com bordo vermelho é perigo, círculo com bordo vermelho é proibição, círculo azul é obrigação.", "A confirmar (Regulamento de Sinalização)"],
    "7.2": ["Bordo vermelho indica proibição. A velocidade mínima usa um sinal azul.", "A confirmar (Regulamento de Sinalização)"],
    "7.3": ["Sinais redondos azuis são de obrigação: faz-se o que a seta indica.", "A confirmar (Regulamento de Sinalização)"],
    "8.2": ["A regra dos 2 segundos adapta-se à velocidade: quanto mais depressa, mais metros. Com chuva, deve ser mais.", "Boa prática (Art. 18.º, n.º 1 só exige «distância suficiente»)"]
  };
  var api = {};
  Object.keys(E).forEach(function (k) { api[k] = { explicacao: E[k][0], artigo: E[k][1] }; });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.CartaXExplicacoes = api;
})(this);
