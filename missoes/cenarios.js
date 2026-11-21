/* CartaX · Cenários das missões «Vê o perigo».
 * Cada cenário: estrada (rua, residencial, escola, avenida, nacional), ambiente (dia, noite, chuva) e perigos.
 * Cada perigo: tipo (ver TIPOS em missoes/motor.js), t0 = segundo em que a pista fica visível, nome e dica.
 * As dicas são boa prática de condução defensiva e passam pela revisão do instrutor antes de chegar aos alunos. */
(function (global) {
  var L = [
    { id: "rua", nome: "Rua com carros estacionados", ambiente: "dia", estrada: "rua",
      perigos: [
        { tipo: "carro_sai", t0: 3.2, dica: "Um carro estacionado com o pisca ligado e alguém ao volante vai sair. Abranda e prepara-te para lhe dar espaço." },
        { tipo: "bola_crianca", t0: 8.6, dica: "Uma bola a rolar para a estrada quase sempre traz uma criança atrás. Quem a viu na bola ganhou mais um segundo para travar." }
      ] },
    { id: "residencial", nome: "Bairro residencial", ambiente: "dia", estrada: "residencial",
      perigos: [
        { tipo: "carro_garagem", t0: 3.0, dica: "Luzes brancas de marcha atrás num carro numa entrada de garagem: vai sair para a estrada e vê-te mal. Abranda e prepara-te para parar." },
        { tipo: "porta_abre", t0: 7.6, dica: "Alguém sentado ao volante de um carro estacionado pode abrir a porta sem olhar. Afasta-te o que puderes e abranda ao passar." },
        { tipo: "peao_entre_carros", t0: 12.2, dica: "Um peão a espreitar entre carros estacionados está prestes a atravessar. Entre carros, ele vê-te mal e tu vê-lo tarde: abranda." }
      ] },
    { id: "escola", nome: "Perto de uma escola", ambiente: "dia", estrada: "escola",
      extras: [{ tipo: "sinal_criancas", d: 420 }, { tipo: "escola", d: 1320 }],
      perigos: [
        { tipo: "peao_passadeira", t0: 3.6, crianca: true, nome: "Criança a correr para a passadeira", dica: "Com o sinal de crianças, conta com elas a correr para a passadeira sem olhar. Modera a velocidade e prepara-te para parar." },
        { tipo: "peao_entre_carros", t0: 8.4, crianca: true, roupa: "#3d7fd6", nome: "Criança escondida entre carros", dica: "Uma criança pequena fica escondida atrás de um carro estacionado. Perto de escolas, conta com crianças a sair de onde não as vês." },
        { tipo: "carro_sai", t0: 13.0, cor: "#59705b", dica: "À hora de saída da escola, há carros a arrancar a toda a hora. Pisca ligado e alguém ao volante: vai sair." }
      ] },
    { id: "avenida", nome: "Avenida com autocarro", ambiente: "dia", estrada: "avenida", estacionados: false,
      extras: [{ tipo: "paragem", d: 680 }],
      perigos: [
        { tipo: "autocarro_peoes", t0: 3.4, dica: "Um autocarro parado tapa quem vai atravessar à frente dele. Ao passar por um autocarro parado, abranda e afasta-te: pode sair um peão." },
        { tipo: "ciclista_desvia", t0: 8.2, dica: "Um ciclista com um buraco à frente vai desviar-se para a tua via. Dá-lhe espaço desde já e, ao ultrapassar, deixa pelo menos 1,5 m." },
        { tipo: "trava_frente", t0: 14.5, dica: "Pisca e luzes de travagem no carro da frente: vai abrandar para virar. Mantém a distância de segurança e prepara-te para travar." }
      ] },
    { id: "nacional_noite", nome: "Estrada nacional, à noite", ambiente: "noite", estrada: "nacional",
      perigos: [
        { tipo: "animal", t0: 3.4, dica: "Dois pontos a brilhar na berma, à noite, são os olhos de um animal. Abranda logo: pode atravessar de repente." },
        { tipo: "ultrapassagem_contrario", t0: 8.6, dica: "Um carro em sentido contrário, atrás de um camião e com o pisca, vai ultrapassar. Abranda e encosta-te à direita para lhe deixar espaço." },
        { tipo: "ciclista_desvia", t0: 13.6, nome: "Ciclista na berma, à noite", dica: "À noite, um ciclista na berma só aparece quando os faróis o apanham. Sem iluminação, modera a velocidade para conseguires parar no espaço que vês." }
      ] },
    { id: "chuva", nome: "Rua à chuva", ambiente: "chuva", estrada: "rua",
      perigos: [
        { tipo: "peao_entre_carros", t0: 3.4, guardaChuva: true, roupa: "#556b8a", nome: "Peão de guarda-chuva a atravessar", dica: "Com chuva, os peões andam de guarda-chuva ou capuz, a olhar para o chão, e atravessam com pressa. Vês-los pior e eles veem-te pior." },
        { tipo: "carro_cruzamento", t0: 8.2, dica: "Um carro que chega depressa a um STOP pode não parar, sobretudo com o piso molhado. Mesmo com prioridade, abranda e prepara-te para evitar o acidente." },
        { tipo: "trava_frente", t0: 15.0, dica: "Com chuva, a distância de travagem aumenta. Pisca e luzes de travagem no carro da frente: abranda já e aumenta a distância." }
      ] }
  ];
  if (typeof module !== "undefined" && module.exports) module.exports = L;
  else global.CartaXMissoesCenarios = L;
})(this);
