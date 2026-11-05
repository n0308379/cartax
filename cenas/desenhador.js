/*
 * CartaX — desenhador de cenas
 * Recebe uma descrição de cena (JSON) e devolve uma ilustração SVG, vista de cima.
 * A geometria vem sempre do código: a IA só escolhe a peça, os elementos, os lugares e os estados.
 *
 * Uso: CartaXCenas.desenhar(cena, { semente: 1 }) -> { svg, erros, avisos, ambiente, versao }
 */
(function (global) {
  "use strict";

  var VERSAO = "0.2.0";
  var W = 1000, H = 1000;
  var BRANCO = "#f3f1ea";

  /* ---------- números aleatórios reprodutíveis (a mesma semente dá sempre a mesma variante) ---------- */
  function rng(seed) {
    var s = (seed >>> 0) || 1;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function rad(g) { return g * Math.PI / 180; }

  /* ---------- variações que nunca mudam a resposta ---------- */
  var CORES_LIGEIRO = ["#c8ccd2", "#8f959c", "#2f3640", "#f2f2ee", "#a3282b", "#2c4f86", "#3c6e4f", "#b9a27a"];
  var CORES_PESADO = ["#e9e9e4", "#2c4f86", "#a3282b", "#3c6e4f"];
  var MODELOS_LIGEIRO = [
    { nome: "utilitario", w: 42, h: 80 },
    { nome: "berlina", w: 44, h: 92 },
    { nome: "carrinha", w: 46, h: 98 }
  ];
  var AMBIENTES = {
    dia: { asfalto: "#4a4d52", relva: "#7aa25a", relvaEscura: "#5f8a45", sombra: [10, 12], tinta: null },
    fim_tarde: { asfalto: "#4b4c51", relva: "#86a05a", relvaEscura: "#677f45", sombra: [26, 12], tinta: "rgba(255,170,90,0.07)" },
    nublado: { asfalto: "#55585c", relva: "#6f8f59", relvaEscura: "#587647", sombra: [3, 4], tinta: "rgba(200,205,215,0.18)" },
    piso_molhado: { asfalto: "#36393d", relva: "#678f4f", relvaEscura: "#4f7640", sombra: [4, 5], tinta: "rgba(160,175,195,0.12)", molhado: true }
  };

  /* ---------- tipos de lugar ----------
   * linha: troço reto de p0 (avanço 0) a p1 (avanço 1)
   * curva: função ponto(t) -> {x, y, rumo}
   * anel:  circunferência de centro (cx, cy) e raio r; avanço 0 = junto à entrada sul,
   *        0.25 = este, 0.5 = norte, 0.75 = oeste (sentido de circulação: contrário aos ponteiros do relógio)
   * rumo em graus, no sentido dos ponteiros do relógio, 0 = para cima.
   */
  function linha(x0, y0, x1, y1, nome) {
    var dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
    return { tipo: "linha", x0: x0, y0: y0, x1: x1, y1: y1, L: L, ux: dx / L, uy: dy / L, rumo: Math.atan2(dx, -dy) * 180 / Math.PI, nome: nome };
  }
  function anel(cx, cy, r, nome) { return { tipo: "anel", cx: cx, cy: cy, r: r, nome: nome }; }
  function pontoAnel(l, t) {
    var th = rad(t * 360);
    return { x: l.cx + l.r * Math.sin(th), y: l.cy + l.r * Math.cos(th), rumo: Math.atan2(Math.cos(th), Math.sin(th)) * 180 / Math.PI };
  }
  function pontoLugar(l, t) {
    if (l.tipo === "linha") return { x: l.x0 + (l.x1 - l.x0) * t, y: l.y0 + (l.y1 - l.y0) * t, rumo: l.rumo };
    if (l.tipo === "anel") return pontoAnel(l, t);
    return l.ponto(t);
  }

  /* ---------- traços comuns ---------- */
  function seg(x1, y1, x2, y2, c, w) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="' + (w || 5) + '"/>'; }
  function tracejado(x1, y1, x2, y2, c, w, d, g) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="' + w + '" stroke-dasharray="' + d + " " + g + '"/>'; }
  function setaConvergencia(x, y, c) {
    return '<g transform="translate(' + x + " " + y + ')" fill="' + c + '" opacity="0.92">' +
      '<path d="M14 40 L14 6 Q14 -10 -6 -14 L-6 -24 L-26 -6 L-6 12 L-6 2 Q4 4 4 10 L4 40 Z"/></g>';
  }
  // linha de "dentes de tubarão" (cedência de passagem) ao longo de um segmento
  function dentes(x1, y1, x2, y2, apontaX, apontaY) {
    var L = Math.hypot(x2 - x1, y2 - y1), n = Math.floor(L / 22), s = "";
    var ux = (x2 - x1) / L, uy = (y2 - y1) / L;
    for (var i = 0; i < n; i++) {
      var ax = x1 + ux * (i * 22 + 3), ay = y1 + uy * (i * 22 + 3), bx = ax + ux * 16, by = ay + uy * 16;
      var mx = (ax + bx) / 2 + apontaX * 18, my = (ay + by) / 2 + apontaY * 18;
      s += '<polygon points="' + ax + "," + ay + " " + bx + "," + by + " " + mx + "," + my + '" fill="' + BRANCO + '"/>';
    }
    return s;
  }

  /* ---------- sinais e semáforos (vistos de frente, como ícones junto à via) ---------- */
  var SINAIS = {
    stop: function () {
      var p = [], i; for (i = 0; i < 8; i++) { var a = rad(22.5 + i * 45); p.push((22 * Math.cos(a)).toFixed(1) + "," + (22 * Math.sin(a)).toFixed(1)); }
      return '<polygon points="' + p.join(" ") + '" fill="#c62828" stroke="#fff" stroke-width="2.5"/><text x="0" y="5" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="12" fill="#fff">STOP</text>';
    },
    cedencia: function () { return '<polygon points="-23,-18 23,-18 0,22" fill="#fff" stroke="#c62828" stroke-width="5" stroke-linejoin="round"/>'; },
    perigo: function () { return '<polygon points="0,-22 23,18 -23,18" fill="#fff" stroke="#c62828" stroke-width="5" stroke-linejoin="round"/><rect x="-2.5" y="-8" width="5" height="14" fill="#1b1b1b"/><circle cx="0" cy="11" r="2.8" fill="#1b1b1b"/>'; },
    limite_50: function () { return '<circle r="22" fill="#fff" stroke="#c62828" stroke-width="6"/><text x="0" y="7" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="19" fill="#1b1b1b">50</text>'; },
    obrigacao_direita: function () { return '<circle r="22" fill="#1f5fae" stroke="#fff" stroke-width="2"/><path d="M-9 12 L-9 -1 Q-9 -6 -4 -6 L5 -6" fill="none" stroke="#fff" stroke-width="5"/><path d="M3 -13 L13 -6 L3 1 Z" fill="#fff"/>'; },
    prioridade: function () { return '<rect x="-16" y="-16" width="32" height="32" transform="rotate(45)" fill="#f5c400" stroke="#fff" stroke-width="5"/>'; }
  };
  function sinal(tipo, x, y) {
    if (!SINAIS[tipo]) return null;
    return '<g transform="translate(' + x.toFixed(1) + " " + y.toFixed(1) + ')"><circle r="30" fill="rgba(0,0,0,0.22)" cx="4" cy="5"/>' + SINAIS[tipo]() + "</g>";
  }
  function semaforo(cor, x, y, rumoAprox) {
    var cores = { vermelho: 0, amarelo: 1, verde: 2 }, acesa = cores[cor];
    if (acesa == null) return null;
    var fill = ["#ff3b30", "#ffbf00", "#2fd158"], s = '<g transform="translate(' + x.toFixed(1) + " " + y.toFixed(1) + ')">';
    s += '<rect x="-14" y="-38" width="28" height="76" rx="6" fill="#1f2226" stroke="#0e0f11" stroke-width="2"/>';
    for (var i = 0; i < 3; i++) {
      var on = i === acesa;
      if (on) s += '<circle cx="0" cy="' + (-22 + i * 22) + '" r="16" fill="' + fill[i] + '" opacity="0.28"/>';
      s += '<circle cx="0" cy="' + (-22 + i * 22) + '" r="8" fill="' + (on ? fill[i] : "#3a3d42") + '"/>';
    }
    return s + "</g>";
  }

  /* ---------- peças de estrada ---------- */
  var PECAS = {};

  /* Entrada de autoestrada: 3 faixas a subir, via de aceleração e ramal à direita */
  PECAS.entrada_autoestrada = (function () {
    var RC = { x: 1010, y: 640 }, R = 300;
    function pontoRamal(t) {
      var a = 88 - 88 * t;
      return { x: RC.x - R * Math.cos(rad(a)), y: RC.y + R * Math.sin(rad(a)), rumo: -a };
    }
    var lugares = {
      faixa_esquerda: linha(410, 960, 410, 40, "faixa da esquerda"),
      faixa_central: linha(510, 960, 510, 40, "faixa central"),
      faixa_direita: linha(610, 960, 610, 40, "faixa da direita"),
      via_aceleracao: linha(710, 610, 710, 320, "via de aceleração"),
      ramal: { tipo: "curva", ponto: pontoRamal, nome: "ramal de entrada" },
      sentido_contrario: linha(170, 40, 170, 960, "faixa do sentido contrário")
    };
    function arco(raio) { return "M" + RC.x + " " + (RC.y + raio) + " A" + raio + " " + raio + " 0 0 1 " + (RC.x - raio) + " " + RC.y; }
    function estrada(amb) {
      var a = amb.asfalto, s = [];
      s.push('<rect x="40" y="0" width="260" height="1000" fill="' + a + '"/>');
      s.push('<rect x="300" y="0" width="60" height="1000" fill="#a9a59a"/><rect x="326" y="0" width="8" height="1000" fill="#8a8a86"/>');
      s.push(seg(318, 0, 318, 1000, "#d9dbde", 4) + seg(342, 0, 342, 1000, "#d9dbde", 4));
      s.push('<rect x="360" y="0" width="300" height="1000" fill="' + a + '"/>');
      s.push('<path d="' + arco(R) + '" fill="none" stroke="' + a + '" stroke-width="100"/>');
      s.push('<polygon points="660,642 760,642 760,300 660,120" fill="' + a + '"/>');
      s.push('<clipPath id="nariz"><path d="M660 640 L660 1000 L1000 1000 L' + RC.x + " " + (RC.y + 350) + ' A350 350 0 0 1 660 640 Z"/></clipPath>');
      s.push(seg(44, 0, 44, 1000, BRANCO) + seg(296, 0, 296, 1000, BRANCO));
      s.push(tracejado(127, 0, 127, 1000, BRANCO, 6, 40, 60) + tracejado(213, 0, 213, 1000, BRANCO, 6, 40, 60));
      s.push(seg(364, 0, 364, 1000, BRANCO));
      s.push(tracejado(460, 0, 460, 1000, BRANCO, 6, 40, 60) + tracejado(560, 0, 560, 1000, BRANCO, 6, 40, 60));
      s.push(seg(656, 0, 656, 120, BRANCO) + seg(656, 642, 656, 1000, BRANCO));
      s.push(tracejado(660, 132, 660, 636, BRANCO, 9, 22, 22));
      s.push('<polyline points="756,646 756,300 660,124" fill="none" stroke="' + BRANCO + '" stroke-width="5"/>');
      s.push('<path d="' + arco(R + 46) + '" fill="none" stroke="' + BRANCO + '" stroke-width="5"/>');
      s.push('<path d="' + arco(R - 46) + '" fill="none" stroke="' + BRANCO + '" stroke-width="5"/>');
      var z = []; for (var i = 0; i < 9; i++) { var yy = 650 + i * 22; z.push(seg(660, yy, 720, yy - 60, BRANCO, 7)); }
      s.push('<g clip-path="url(#nariz)">' + z.join("") + "</g>");
      s.push(setaConvergencia(710, 270, BRANCO));
      return s.join("");
    }
    function livre(x, y) {
      if (x < 690 || (x < 800 && y < 660)) return false;
      var d = Math.hypot(x - RC.x, y - RC.y);
      if (d > R - 90 && d < R + 90 && y > RC.y - 20) return false;
      return !(x > 900 && y > 880);
    }
    return { lugares: lugares, estrada: estrada, livre: livre, nome: "Entrada de autoestrada", parametros: [] };
  })();

  /* Aproximações comuns às peças com 4 braços (cruzamento e rotunda).
   * Circulação pela direita: quem vem de sul sobe pela metade direita (x maior) da estrada. */
  function aproximacoes(cx, cy, meia, fim, nomeBase) {
    // fim = distância ao centro onde termina a aproximação (linha de paragem ou de cedência)
    var o = meia / 2; // centro da via de entrada
    return {
      sul: linha(cx + o, 960, cx + o, cy + fim + 50, nomeBase + " sul"),
      norte: linha(cx - o, 40, cx - o, cy - fim - 50, nomeBase + " norte"),
      este: linha(960, cy - o, cx + fim + 50, cy - o, nomeBase + " este"),
      oeste: linha(40, cy + o, cx - fim - 50, cy + o, nomeBase + " oeste")
    };
  }
  // posição junto à via (lado direito de quem se aproxima), perto do fim da aproximação
  function juntoAVia(l, lateral, recuo) {
    var nx = -l.uy, ny = l.ux; // normal à direita do sentido de marcha (y para baixo)
    return { x: l.x1 + nx * lateral - l.ux * recuo, y: l.y1 + ny * lateral - l.uy * recuo };
  }
  function moveis(cena, ap, s, avisos, lateralSinal) {
    // sinais e semáforos por aproximação: cena.sinais = {sul: "stop"}, cena.semaforos = {sul: "verde"}
    var nomes = Object.keys(ap);
    Object.keys(cena.sinais || {}).forEach(function (k) {
      if (!ap[k]) { avisos.push('Sinal numa aproximação que não existe: "' + k + '". Usar: ' + nomes.join(", ") + "."); return; }
      var p = juntoAVia(ap[k], lateralSinal, 40), g = sinal(cena.sinais[k], p.x, p.y);
      if (!g) avisos.push('Sinal "' + cena.sinais[k] + '" ainda não existe. Disponíveis: ' + Object.keys(SINAIS).join(", ") + ".");
      else s.push(g);
    });
    Object.keys(cena.semaforos || {}).forEach(function (k) {
      if (!ap[k]) { avisos.push('Semáforo numa aproximação que não existe: "' + k + '".'); return; }
      var p = juntoAVia(ap[k], lateralSinal + 2, -40), g = semaforo(cena.semaforos[k], p.x, p.y);
      if (!g) avisos.push('Cor de semáforo "' + cena.semaforos[k] + '" desconhecida (vermelho, amarelo, verde).');
      else s.push(g);
    });
  }

  /* Cruzamento em X: duas estradas de 2 sentidos (uma via por sentido) */
  PECAS.cruzamento_x = (function () {
    var C = 500, MEIA = 100, FIM = 150; // estrada de 200 de largura, cruzamento de 400 a 600
    var ap = aproximacoes(C, C, MEIA, FIM, "aproximação");
    var lugares = {
      sul: ap.sul, norte: ap.norte, este: ap.este, oeste: ap.oeste,
      saida_norte: linha(550, 360, 550, 40, "saída para norte"),
      saida_sul: linha(450, 640, 450, 960, "saída para sul"),
      saida_este: linha(640, 550, 960, 550, "saída para este"),
      saida_oeste: linha(360, 450, 40, 450, "saída para oeste")
    };
    function estrada(amb, cena, avisos) {
      var a = amb.asfalto, s = [];
      s.push('<rect x="400" y="0" width="200" height="1000" fill="' + a + '"/><rect x="0" y="400" width="1000" height="200" fill="' + a + '"/>');
      // passeios
      ["M0 392 H392 V0", "M608 0 V392 H1000", "M1000 608 H608 V1000", "M392 1000 V608 H0"].forEach(function (d) {
        s.push('<path d="' + d + '" fill="none" stroke="#c9c5ba" stroke-width="16"/>');
      });
      // bordos
      [[404, 0, 404, 396], [596, 0, 596, 396], [404, 604, 404, 1000], [596, 604, 596, 1000],
       [0, 404, 396, 404], [0, 596, 396, 596], [604, 404, 1000, 404], [604, 596, 1000, 596]].forEach(function (p) { s.push(seg(p[0], p[1], p[2], p[3], BRANCO, 4)); });
      // eixos: contínuos perto do cruzamento, tracejados mais longe
      s.push(tracejado(500, 0, 500, 260, BRANCO, 5, 40, 40) + seg(500, 260, 500, 390, BRANCO, 5));
      s.push(tracejado(500, 740, 500, 1000, BRANCO, 5, 40, 40) + seg(500, 610, 500, 740, BRANCO, 5));
      s.push(tracejado(0, 500, 260, 500, BRANCO, 5, 40, 40) + seg(260, 500, 390, 500, BRANCO, 5));
      s.push(tracejado(740, 500, 1000, 500, BRANCO, 5, 40, 40) + seg(610, 500, 740, 500, BRANCO, 5));
      // marcas de paragem ou cedência em cada entrada, conforme o sinal
      var sin = cena.sinais || {};
      var marcas = {
        sul: [502, 640, 598, 640, 0, 1], norte: [402, 360, 498, 360, 0, -1],
        este: [640, 402, 640, 498, 1, 0], oeste: [360, 502, 360, 598, -1, 0]
      };
      Object.keys(marcas).forEach(function (k) {
        var m = marcas[k];
        if (sin[k] === "stop") s.push(seg(m[0], m[1], m[2], m[3], BRANCO, 10));
        else if (sin[k] === "cedencia") s.push(dentes(m[0], m[1], m[2], m[3], m[4], m[5]));
        else if ((cena.semaforos || {})[k]) s.push(seg(m[0], m[1], m[2], m[3], BRANCO, 6));
      });
      moveis(cena, ap, s, avisos, 85);
      return s.join("");
    }
    function livre(x, y) { return Math.abs(x - 500) > 150 && Math.abs(y - 500) > 150; }
    return { lugares: lugares, estrada: estrada, livre: livre, nome: "Cruzamento em X", parametros: ["sinais", "semaforos"] };
  })();

  /* Rotunda de 2 vias com 4 braços. Saídas a partir da entrada sul: 1.ª este, 2.ª norte, 3.ª oeste. */
  PECAS.rotunda_2vias = (function () {
    var C = 500, R_ILHA = 120, R_INT = 165, R_EXT = 255, R_BORDO = 300;
    var ap = aproximacoes(C, C, 100, R_BORDO, "entrada");
    var lugares = {
      entrada_sul: ap.sul, entrada_norte: ap.norte, entrada_este: ap.este, entrada_oeste: ap.oeste,
      via_interior: anel(C, C, R_INT, "via interior da rotunda"),
      via_exterior: anel(C, C, R_EXT, "via exterior (da direita) da rotunda"),
      saida_este: linha(840, 550, 960, 550, "saída este"),
      saida_norte: linha(550, 160, 550, 40, "saída norte"),
      saida_oeste: linha(160, 450, 40, 450, "saída oeste"),
      saida_sul: linha(450, 840, 450, 960, "saída sul")
    };
    function estrada(amb, cena, avisos) {
      var a = amb.asfalto, s = [];
      // braços
      s.push('<rect x="400" y="0" width="200" height="1000" fill="' + a + '"/><rect x="0" y="400" width="1000" height="200" fill="' + a + '"/>');
      // anel
      s.push('<circle cx="' + C + '" cy="' + C + '" r="' + R_BORDO + '" fill="' + a + '"/>');
      // passeios exteriores (recortes simples entre os braços)
      s.push('<circle cx="' + C + '" cy="' + C + '" r="' + (R_BORDO + 8) + '" fill="none" stroke="#c9c5ba" stroke-width="16" stroke-dasharray="' + passeioDash().d + '" stroke-dashoffset="' + passeioDash().o + '"/>');
      // ilhas separadoras nos braços (triângulos entre entrada e saída)
      [[500, 800, 0], [500, 200, 180], [800, 500, 90], [200, 500, 270]].forEach(function (q) {
        s.push('<g transform="translate(' + q[0] + " " + q[1] + ") rotate(" + q[2] + ')"><path d="M-20 4 L20 4 L5 112 Q0 118 -5 112 Z" fill="#b9b4a6" stroke="' + BRANCO + '" stroke-width="3"/></g>');
      });
      // bordos dos braços
      [[404, 0, 404, 220], [596, 0, 596, 220], [404, 780, 404, 1000], [596, 780, 596, 1000],
       [0, 404, 220, 404], [0, 596, 220, 596], [780, 404, 1000, 404], [780, 596, 1000, 596]].forEach(function (p) { s.push(seg(p[0], p[1], p[2], p[3], BRANCO, 4)); });
      // marcas do anel
      s.push('<circle cx="' + C + '" cy="' + C + '" r="210" fill="none" stroke="' + BRANCO + '" stroke-width="5" stroke-dasharray="26 22"/>');
      // ilha central com faixa galgável
      s.push('<circle cx="' + C + '" cy="' + C + '" r="' + R_ILHA + '" fill="#b8b3a5" stroke="' + BRANCO + '" stroke-width="4"/>');
      s.push('<circle cx="' + C + '" cy="' + C + '" r="' + (R_ILHA - 16) + '" fill="' + amb.relva + '"/>');
      // linhas de cedência à entrada de cada braço (dentes a apontar para quem chega)
      s.push(dentes(502, 802, 598, 802, 0, 1) + dentes(402, 198, 498, 198, 0, -1) + dentes(802, 402, 802, 498, 1, 0) + dentes(198, 502, 198, 598, -1, 0));
      // sinais de cedência por omissão em todas as entradas (podem ser substituídos em cena.sinais)
      var c2 = { sinais: Object.assign({ sul: "cedencia", norte: "cedencia", este: "cedencia", oeste: "cedencia" }, cena.sinais || {}), semaforos: cena.semaforos };
      moveis(c2, ap, s, avisos, 85);
      // saída destacada (opcional): cena.saida_destacada = "este" | "norte" | "oeste" | "sul"
      var d = cena.saida_destacada, pts = { este: [900, 550, 90], norte: [550, 100, 0], oeste: [100, 450, -90], sul: [450, 900, 180] };
      if (d && pts[d]) {
        var p = pts[d];
        s.push('<g transform="translate(' + p[0] + " " + p[1] + ") rotate(" + p[2] + ')" fill="#ffb000" opacity="0.95"><path d="M-18 22 L0 -6 L18 22 L0 10 Z"/><path d="M-18 -4 L0 -32 L18 -4 L0 -16 Z"/></g>');
      } else if (d) avisos.push('Saída destacada "' + d + '" desconhecida (este, norte, oeste, sul).');
      return s.join("");
    }
    function passeioDash() {
      // passeio só entre os braços: arco de cada quadrante sem as aberturas
      var circ = 2 * Math.PI * (R_BORDO + 8), abertura = 2 * Math.asin(110 / (R_BORDO + 8)) * (R_BORDO + 8), resto = circ / 4 - abertura;
      return { d: resto.toFixed(1) + " " + abertura.toFixed(1), o: (resto + abertura / 2).toFixed(1) };
    }
    function livre(x, y) {
      var d = Math.hypot(x - C, y - C);
      if (d < R_ILHA - 30) return true;
      if (d < R_BORDO + 40) return false;
      return Math.abs(x - C) > 130 && Math.abs(y - C) > 130;
    }
    return { lugares: lugares, estrada: estrada, livre: livre, nome: "Rotunda de 2 vias", parametros: ["sinais", "semaforos", "saida_destacada"] };
  })();

  /* ---------- veículos (vistos de cima, a apontar para cima) ---------- */
  function sombra(w, h, amb) {
    var o = amb.sombra;
    return '<rect x="' + (-w / 2 + o[0]) + '" y="' + (-h / 2 + o[1]) + '" width="' + w + '" height="' + h + '" rx="10" fill="rgba(0,0,0,0.28)"/>';
  }
  function piscas(w, h, lado) {
    if (!lado) return "";
    var xs = lado === "esquerdo" ? [-w / 2 + 4] : lado === "direito" ? [w / 2 - 4] : [-w / 2 + 4, w / 2 - 4];
    var s = "";
    xs.forEach(function (x) {
      s += '<circle cx="' + x + '" cy="' + (-h / 2 + 5) + '" r="9" fill="#ffb000" opacity="0.35"/><circle cx="' + x + '" cy="' + (-h / 2 + 5) + '" r="5" fill="#ffb000"/>';
      s += '<circle cx="' + x + '" cy="' + (h / 2 - 5) + '" r="9" fill="#ffb000" opacity="0.35"/><circle cx="' + x + '" cy="' + (h / 2 - 5) + '" r="5" fill="#ffb000"/>';
    });
    return s;
  }
  function travao(w, h, on) {
    if (!on) return '<rect x="' + (-w / 2 + 4) + '" y="' + (h / 2 - 5) + '" width="9" height="4" fill="#7a1d1d"/><rect x="' + (w / 2 - 13) + '" y="' + (h / 2 - 5) + '" width="9" height="4" fill="#7a1d1d"/>';
    return '<rect x="' + (-w / 2 + 3) + '" y="' + (h / 2 - 6) + '" width="11" height="6" fill="#ff2a2a"/><rect x="' + (w / 2 - 14) + '" y="' + (h / 2 - 6) + '" width="11" height="6" fill="#ff2a2a"/>';
  }
  function barraEmergencia(w, h, on, y0) {
    var luz = on ? "#1f6bff" : "#1b2c55", s = "";
    if (on) s += '<ellipse cx="0" cy="' + (y0 + 4) + '" rx="78" ry="58" fill="url(#brilhoAzul)"/>';
    return s;
  }
  function luzesEmergencia(w, on, y0) {
    var luz = on ? "#1f6bff" : "#1b2c55", s = "";
    s += '<rect x="' + (-w / 2 + 6) + '" y="' + y0 + '" width="' + (w - 12) + '" height="9" rx="3" fill="#2a2d33"/>';
    s += '<rect x="' + (-w / 2 + 8) + '" y="' + (y0 + 1) + '" width="14" height="7" rx="2" fill="' + luz + '"/>';
    s += '<rect x="' + (w / 2 - 22) + '" y="' + (y0 + 1) + '" width="14" height="7" rx="2" fill="' + luz + '"/>';
    if (on) s += '<rect x="' + (-w / 2 + 11) + '" y="' + (y0 + 3) + '" width="7" height="3" rx="1" fill="#e6f0ff"/><rect x="' + (w / 2 - 19) + '" y="' + (y0 + 3) + '" width="7" height="3" rx="1" fill="#e6f0ff"/>';
    return s;
  }
  function parabrisas(w, h, y0, y1) {
    return '<path d="M' + (-w / 2 + 5) + " " + y0 + " L" + (w / 2 - 5) + " " + y0 + " L" + (w / 2 - 7) + " " + y1 + " L" + (-w / 2 + 7) + " " + y1 + ' Z" fill="#1f2a33"/>';
  }

  var VEICULOS = {
    ligeiro: function (r, estado, amb) {
      var m = pick(r, MODELOS_LIGEIRO), cor = pick(r, CORES_LIGEIRO), w = m.w, h = m.h;
      var s = sombra(w, h, amb);
      s += '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="11" fill="' + cor + '" stroke="#1d1f22" stroke-width="2"/>';
      s += parabrisas(w, h, -h / 2 + 22, -h / 2 + 36);
      s += '<rect x="' + (-w / 2 + 7) + '" y="' + (-h / 2 + 38) + '" width="' + (w - 14) + '" height="' + (h - 62) + '" rx="5" fill="' + cor + '" stroke="rgba(0,0,0,0.25)"/>';
      s += '<path d="M' + (-w / 2 + 7) + " " + (h / 2 - 22) + " L" + (w / 2 - 7) + " " + (h / 2 - 22) + " L" + (w / 2 - 5) + " " + (h / 2 - 12) + " L" + (-w / 2 + 5) + " " + (h / 2 - 12) + ' Z" fill="#1f2a33"/>';
      s += '<rect x="' + (-w / 2 + 4) + '" y="' + (-h / 2 + 2) + '" width="9" height="5" rx="2" fill="#fff6d8"/><rect x="' + (w / 2 - 13) + '" y="' + (-h / 2 + 2) + '" width="9" height="5" rx="2" fill="#fff6d8"/>';
      s += travao(w, h, estado.travao) + piscas(w, h, estado.pisca);
      return { svg: s, w: w, h: h };
    },
    ambulancia: function (r, estado, amb) {
      var w = 54, h = 124, s = sombra(w, h, amb);
      s += barraEmergencia(w, h, estado.emergencia, -h / 2 + 24);
      s += '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="9" fill="#f4cd00" stroke="#1d1f22" stroke-width="2"/>';
      s += parabrisas(w, h, -h / 2 + 8, -h / 2 + 20);
      for (var i = 0; i < 6; i++) {
        var y = -h / 2 + 34 + i * 14;
        s += '<rect x="' + (-w / 2 + 1) + '" y="' + y + '" width="6" height="7" fill="#d4202a"/><rect x="' + (w / 2 - 7) + '" y="' + y + '" width="6" height="7" fill="#d4202a"/>';
      }
      s += luzesEmergencia(w, estado.emergencia, -h / 2 + 23);
      s += '<rect x="-14" y="-4" width="28" height="22" rx="3" fill="#e2bd00" stroke="rgba(0,0,0,0.25)"/><rect x="-10" y="30" width="20" height="14" rx="2" fill="#d0ad00" stroke="rgba(0,0,0,0.25)"/>';
      s += travao(w, h, estado.travao) + piscas(w, h, estado.pisca);
      return { svg: s, w: w, h: h };
    },
    bombeiros: function (r, estado, amb) {
      var w = 58, h = 150, s = sombra(w, h, amb);
      s += barraEmergencia(w, h, estado.emergencia, -h / 2 + 30);
      s += '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="8" fill="#c8211d" stroke="#1d1f22" stroke-width="2"/>';
      s += parabrisas(w, h, -h / 2 + 8, -h / 2 + 22);
      s += luzesEmergencia(w, estado.emergencia, -h / 2 + 26);
      // escada no tejadilho
      s += '<rect x="-12" y="' + (-h / 2 + 46) + '" width="24" height="' + (h - 62) + '" fill="none" stroke="#d9d9d9" stroke-width="3"/>';
      for (var i = 0; i < 7; i++) s += seg(-12, -h / 2 + 56 + i * 12, 12, -h / 2 + 56 + i * 12, "#d9d9d9", 2);
      s += travao(w, h, estado.travao) + piscas(w, h, estado.pisca);
      return { svg: s, w: w, h: h };
    },
    pesado: function (r, estado, amb) {
      var w = 60, h = 178, cor = pick(r, CORES_PESADO), s = sombra(w, h, amb);
      s += '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="42" rx="8" fill="' + cor + '" stroke="#1d1f22" stroke-width="2"/>';
      s += '<rect x="' + (-w / 2 + 5) + '" y="' + (-h / 2 + 6) + '" width="' + (w - 10) + '" height="10" fill="#1f2a33"/>';
      s += '<rect x="' + (-w / 2) + '" y="' + (-h / 2 + 46) + '" width="' + w + '" height="' + (h - 46) + '" rx="4" fill="#d8d6cf" stroke="#1d1f22" stroke-width="2"/>';
      s += travao(w, h, estado.travao) + piscas(w, h, estado.pisca);
      return { svg: s, w: w, h: h };
    }
  };

  /* ---------- colocar elementos ---------- */
  var DIST = 26; // espaço entre veículos em "atrás" e "à frente"

  function colocar(cena, peca, r, erros, avisos) {
    var porId = {}, colocados = [], lista = (cena.elementos || []).slice(), pendentes = lista.slice(), voltas = 0;
    while (pendentes.length && voltas < 10) {
      voltas++;
      pendentes = pendentes.filter(function (el) {
        if (el.junto_a && !porId[el.junto_a]) {
          if (!lista.some(function (o) { return o.id === el.junto_a; })) { erros.push('"' + (el.id || el.tipo) + '" refere "' + el.junto_a + '", que não existe na cena.'); return false; }
          return true;
        }
        var feito = colocarUm(el, porId, peca, r, erros, avisos);
        if (feito) { porId[el.id || ("_" + colocados.length)] = feito; colocados.push(feito); }
        return false;
      });
    }
    for (var i = 0; i < colocados.length; i++) for (var j = i + 1; j < colocados.length; j++) {
      var a = colocados[i], b = colocados[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) < (a.w + b.w) / 2) avisos.push('"' + a.ref + '" e "' + b.ref + '" ficam sobrepostos.');
    }
    return colocados;
  }

  function colocarUm(el, porId, peca, r, erros, avisos) {
    var ref = el.id || el.tipo, fazer = VEICULOS[el.tipo];
    if (!fazer) { erros.push('Elemento "' + el.tipo + '" ainda não existe. Disponíveis: ' + Object.keys(VEICULOS).join(", ") + "."); return null; }
    var lug = peca.lugares[el.lugar];
    if (!lug) { erros.push('Lugar "' + el.lugar + '" não existe nesta peça. Lugares: ' + Object.keys(peca.lugares).join(", ") + "."); return null; }
    var v = fazer(r, el.estado || {}, AMB_ATUAL), t;
    if (el.junto_a) {
      var alvo = porId[el.junto_a], off = 0;
      if (el.posicao === "atras") off = -((alvo.h + v.h) / 2 + DIST);
      else if (el.posicao === "a_frente") off = (alvo.h + v.h) / 2 + DIST;
      else if (el.posicao && el.posicao !== "ao_lado") { erros.push('"' + ref + '": posição "' + el.posicao + '" desconhecida (usar ao_lado, atras ou a_frente).'); return null; }
      if (lug.tipo === "linha") {
        var proj = ((alvo.x - lug.x0) * lug.ux + (alvo.y - lug.y0) * lug.uy);
        t = (proj + off) / lug.L;
      } else if (lug.tipo === "anel") {
        var th = Math.atan2(alvo.x - lug.cx, alvo.y - lug.cy) * 180 / Math.PI; // ângulo a partir de sul
        t = ((th + off / lug.r * 180 / Math.PI) / 360 + 1) % 1;
      } else { erros.push('"' + ref + '": as posições relativas não funcionam em ' + lug.nome + "."); return null; }
      if (lug.tipo === "linha" && (t < -0.02 || t > 1.02)) avisos.push('"' + ref + '" fica fora do troço visível de ' + lug.nome + ".");
    } else {
      t = el.avanco == null ? 0.5 : Math.max(0, Math.min(1, +el.avanco));
    }
    var p = pontoLugar(lug, t);
    return { ref: ref, tipo: el.tipo, x: p.x, y: p.y, rumo: p.rumo, w: v.w, h: v.h, svg: v.svg, tu: !!el.tu };
  }

  // marca "TU" no veículo do aluno
  function marcaTu(e) {
    var s = '<rect x="' + (-e.w / 2 - 9) + '" y="' + (-e.h / 2 - 9) + '" width="' + (e.w + 18) + '" height="' + (e.h + 18) + '" rx="14" fill="none" stroke="#ffb000" stroke-width="4" stroke-dasharray="10 7"/>';
    var bx = e.x - Math.sin(rad(e.rumo)) * (e.h / 2 + 30), by = e.y + Math.cos(rad(e.rumo)) * (e.h / 2 + 30);
    var lbl = '<g transform="translate(' + bx.toFixed(1) + " " + by.toFixed(1) + ')"><rect x="-22" y="-14" width="44" height="26" rx="13" fill="#ffb000"/><text x="0" y="5" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="15" fill="#1b1b1b">TU</text></g>';
    return { contorno: s, etiqueta: lbl };
  }

  /* ---------- vegetação ---------- */
  function vegetacao(peca, r, amb) {
    var s = [];
    for (var i = 0, tent = 0; i < 26 && tent < 500; tent++) {
      var x = 20 + r() * 980, y = r() * 1000;
      if (!peca.livre(x, y)) continue;
      var raio = 14 + r() * 26;
      s.push('<circle cx="' + (x + amb.sombra[0]) + '" cy="' + (y + amb.sombra[1]) + '" r="' + raio + '" fill="rgba(0,0,0,0.18)"/>');
      s.push('<circle cx="' + x + '" cy="' + y + '" r="' + raio + '" fill="' + amb.relvaEscura + '"/>');
      s.push('<circle cx="' + (x - raio * 0.25) + '" cy="' + (y - raio * 0.25) + '" r="' + (raio * 0.55) + '" fill="rgba(255,255,255,0.08)"/>');
      i++;
    }
    return s.join("");
  }

  var AMB_ATUAL = AMBIENTES.dia;

  /* ---------- função principal ---------- */
  function desenhar(cena, opcoes) {
    opcoes = opcoes || {};
    var erros = [], avisos = [], semente = opcoes.semente || 1, r = rng(semente * 7919 + 13);
    if (!cena || typeof cena !== "object") return { svg: "", erros: ["A descrição da cena não é um objeto JSON."], avisos: [] };
    var peca = PECAS[cena.peca];
    if (!peca) return { svg: "", erros: ['Disposição não suportada: "' + cena.peca + '". Peças disponíveis: ' + Object.keys(PECAS).join(", ") + "."], avisos: [] };

    var nomeAmb = opcoes.ambiente || (semente === 1 ? "dia" : pick(r, Object.keys(AMBIENTES)));
    var amb = AMBIENTES[nomeAmb] || AMBIENTES.dia;
    AMB_ATUAL = amb;

    var elementos = colocar(cena, peca, r, erros, avisos);
    var s = [];
    s.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + esc(peca.nome) + '">');
    s.push('<defs><radialGradient id="brilhoAzul"><stop offset="0" stop-color="#3d86ff" stop-opacity="0.95"/><stop offset="0.45" stop-color="#3d86ff" stop-opacity="0.55"/><stop offset="1" stop-color="#3d86ff" stop-opacity="0"/></radialGradient></defs>');
    s.push('<rect width="1000" height="1000" fill="' + amb.relva + '"/>');
    s.push(vegetacao(peca, r, amb));
    s.push(peca.estrada(amb, cena, avisos));
    if (amb.molhado) {
      for (var k = 0; k < 16; k++) {
        var mx = 100 + r() * 800, my = r() * 1000;
        s.push('<ellipse cx="' + mx + '" cy="' + my + '" rx="' + (8 + r() * 14) + '" ry="' + (30 + r() * 50) + '" fill="rgba(200,215,235,0.10)"/>');
      }
    }
    var etiquetas = [];
    elementos.forEach(function (e) {
      var extra = "";
      if (e.tu) { var m = marcaTu(e); extra = m.contorno; etiquetas.push(m.etiqueta); }
      s.push('<g transform="translate(' + e.x.toFixed(1) + " " + e.y.toFixed(1) + ") rotate(" + e.rumo.toFixed(1) + ')">' + e.svg + extra + "</g>");
    });
    if (amb.tinta) s.push('<rect width="1000" height="1000" fill="' + amb.tinta + '"/>');
    s.push(etiquetas.join(""));
    s.push("</svg>");
    return { svg: s.join(""), erros: erros, avisos: avisos, ambiente: nomeAmb, versao: VERSAO };
  }

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var api = {
    versao: VERSAO,
    desenhar: desenhar,
    pecas: function () { return Object.keys(PECAS).map(function (k) { return { id: k, nome: PECAS[k].nome, lugares: Object.keys(PECAS[k].lugares), parametros: PECAS[k].parametros }; }); },
    elementos: function () { return Object.keys(VEICULOS); },
    sinais: function () { return Object.keys(SINAIS); },
    ambientes: function () { return Object.keys(AMBIENTES); }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.CartaXCenas = api;
})(this);
