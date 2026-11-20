/* Perguntas do Banco de Perguntas v0.1 que não têm cena desenhada.
   imagem = o que está previsto no Banco («Sem cena» = pergunta de conhecimento; «Fotografia IA» = por fazer). */
(function (global) {
  var C = function (t, certa) { return [t, !!certa]; };
  var L = [
    { id: "3.3", tema: "Autoestrada", enunciado: "Qual é a velocidade mínima permitida numa autoestrada?",
      opcoes: [C("50 km/h", 1), C("40 km/h"), C("60 km/h")], imagem: "Sem cena" },
    { id: "4.2", tema: "Peões, ciclistas e passadeiras", enunciado: "Aproximas-te de uma passadeira. Um peão está parado no passeio, a olhar para atravessar. O que fazes?",
      opcoes: [C("Moderas a velocidade e preparas-te para parar", 1), C("Manténs a velocidade, porque ainda não está na passadeira"), C("Fazes sinal de luzes para ele esperar")],
      imagem: "Fotografia IA · rua urbana · peão no passeio junto à passadeira, de costas ou de lado" },
    { id: "5.3", tema: "Ultrapassagem", enunciado: "Estás a subir uma lomba atrás de um pesado. Podes ultrapassá-lo?",
      opcoes: [C("Não: é proibido ultrapassar nas lombas", 1), C("Sim, se o pesado estiver muito lento"), C("Sim, se ligares os máximos")],
      imagem: "Fotografia IA · estrada de 2 sentidos a subir uma lomba, pesado à frente vista do lugar do condutor" },
    { id: "5.5", tema: "Ultrapassagem", enunciado: "Antes de começar uma ultrapassagem, o que tens de confirmar?",
      opcoes: [C("Que o espaço à frente está livre, que ninguém te está a ultrapassar, e sinalizar com o pisca", 1), C("Só que não vem ninguém em sentido contrário"), C("Que o carro da frente te deu sinal para passar")],
      imagem: "Sem cena" },
    { id: "6.5", tema: "Veículos em marcha de urgência", enunciado: "Ao ouvires uma sirene, deves travar a fundo de imediato?",
      opcoes: [C("Não: localizas o veículo, sinalizas e desvias-te com calma e segurança", 1), C("Sim, para mostrar que o deixas passar"), C("Sim, e ligas os quatro piscas")],
      imagem: "Sem cena" },
    { id: "7.4", tema: "Sinalização", enunciado: "Num cruzamento, o semáforo está vermelho, mas um agente de trânsito faz-te sinal para avançar. O que fazes?",
      opcoes: [C("Avanças, obedecendo ao agente", 1), C("Esperas pelo verde"), C("Buzinas para confirmar a ordem")],
      imagem: "Fotografia IA · cruzamento urbano · agente de trânsito de colete refletor, de lado ou de costas, semáforo vermelho visível" },
    { id: "7.5", tema: "Sinalização", enunciado: "O semáforo passa a amarelo quando já estás muito perto da linha de paragem. O que fazes?",
      opcoes: [C("Paras, a não ser que já não o consigas fazer em segurança", 1), C("Aceleras para passar antes do vermelho"), C("Paras sempre, mesmo com travagem brusca")],
      imagem: "Fotografia IA · semáforo em amarelo, vista do lugar do condutor, linha de paragem perto" },
    { id: "8.1", tema: "Condições adversas e distância de segurança", enunciado: "Começa a chover com intensidade. O que fazes à distância para o carro da frente?",
      opcoes: [C("Aumentas a distância", 1), C("Manténs a mesma distância"), C("Aproximas-te para veres melhor as luzes dele")],
      imagem: "Fotografia IA · estrada com chuva intensa, vista do lugar do condutor, ligeiro à frente" },
    { id: "8.3", tema: "Condições adversas e distância de segurança", enunciado: "Estás a conduzir com nevoeiro muito denso e quase não vês nada à frente. O que fazes?",
      opcoes: [C("Reduzes a velocidade e ligas as luzes de nevoeiro", 1), C("Ligas os máximos para veres mais longe"), C("Segues as luzes traseiras do carro da frente, bem colado a ele")],
      imagem: "Fotografia IA · estrada com nevoeiro denso, vista do lugar do condutor" },
    { id: "8.4", tema: "Condições adversas e distância de segurança", enunciado: "À noite, com os máximos ligados, aproxima-se um veículo em sentido contrário. O que fazes?",
      opcoes: [C("Passas para os médios", 1), C("Manténs os máximos"), C("Desligas as luzes por instantes")],
      imagem: "Fotografia IA · estrada à noite, vista do lugar do condutor, faróis de um veículo a aproximar-se" },
    { id: "8.5", tema: "Condições adversas e distância de segurança", enunciado: "Sentes que o carro está a perder aderência numa poça de água (aquaplanagem). O que fazes?",
      opcoes: [C("Tiras o pé do acelerador, seguras o volante a direito e não travas a fundo", 1), C("Travas a fundo"), C("Viras o volante com força para sair da poça")],
      imagem: "Fotografia IA · estrada com poças largas, vista do lugar do condutor" }
  ];
  if (typeof module !== "undefined" && module.exports) module.exports = L;
  else global.CartaXSemCena = L;
})(this);
