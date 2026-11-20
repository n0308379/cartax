/* Programa da prova teórica (RHLC, anexo VII, parte I) e formato do exame da categoria B.
   Formato: RHLC art. 43.º (30 perguntas, 2 a 4 opções, uma certa), art. 46.º (30 minutos), art. 47.º (aprovado com 27 certas).
   «alvo» = quantas perguntas da unidade terá o banco de 200 (plano no Banco de Perguntas); serve para equilibrar o exame simulado. */
(function (global) {
  var P = {
    exame: { perguntas: 30, minutos: 30, minimoCertas: 27, base: "RHLC, art. 43.º, 46.º e 47.º" },
    unidades: [
      { id: "I-a", nome: "Princípios gerais", alvo: 15 },
      { id: "I-b", nome: "Sinalização", alvo: 40 },
      { id: "I-c", nome: "Regras de trânsito e manobras", alvo: 55 },
      { id: "II", nome: "O condutor", alvo: 20 },
      { id: "III", nome: "O condutor e o veículo", alvo: 25 },
      { id: "IV", nome: "Os outros utentes da via", alvo: 15 },
      { id: "V", nome: "A via e os fatores externos", alvo: 15 },
      { id: "VI", nome: "Diversos", alvo: 15 }
    ],
    /* unidade de cada pergunta do banco */
    pergunta: {
      "1.1": "I-c", "1.2": "I-c", "1.3": "I-c", "1.4": "I-c", "1.5": "I-c",
      "2.1": "I-c", "2.2": "I-c", "2.3": "I-c", "2.4": "I-c", "2.5": "I-c",
      "3.1": "I-c", "3.2": "I-c", "3.3": "I-c", "3.4": "I-c", "3.5": "I-c",
      "4.1": "IV", "4.2": "IV", "4.3": "I-c", "4.4": "I-c", "4.5": "IV",
      "5.1": "I-c", "5.2": "I-c", "5.3": "I-c", "5.4": "I-c", "5.5": "I-c",
      "6.1": "I-c", "6.2": "I-c", "6.3": "I-c", "6.4": "I-c", "6.5": "I-c",
      "7.1": "I-b", "7.2": "I-b", "7.3": "I-b", "7.4": "I-b", "7.5": "I-b",
      "8.1": "V", "8.2": "I-a", "8.3": "V", "8.4": "III", "8.5": "V"
    }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = P;
  else global.CartaXPrograma = P;
})(this);
