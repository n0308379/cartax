/* Ligação da ficha à folha de revisão (Google Forms → Google Sheets).
   acao   = endereço «formResponse» do formulário;
   campos = o «entry.N» de cada pergunta do formulário.
   Enquanto «acao» estiver vazio, a ficha funciona em modo de demonstração: a revisão fica guardada só neste aparelho. */
window.CartaXRevisao = {
  acao: "",
  campos: { pergunta: "", decisao: "", comentario: "", revisor: "", versao: "" }
};
