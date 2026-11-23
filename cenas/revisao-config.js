/* Ligação da ficha à folha de revisão (Google Forms → Google Sheets), conta Skyxlee.
   Formulário: «CartaX – revisão de perguntas» · folha: «CartaX – revisão de perguntas (Respostas)».
   acao   = endereço «formResponse» do formulário;
   campos = o «entry.N» de cada pergunta do formulário.
   Se «acao» ficar vazio, a ficha volta ao modo de demonstração (a revisão fica só no aparelho). */
window.CartaXRevisao = {
  acao: "https://docs.google.com/forms/d/e/1FAIpQLSfcjSUWk3c-X53ekIN4rEQLs9dHq_LSiTagxS2dhFttN3Bv5Q/formResponse",
  campos: {
    pergunta: "entry.1872061373",
    decisao: "entry.641542110",
    comentario: "entry.951417822",
    revisor: "entry.963214691",
    versao: "entry.1229321395"
  }
};
