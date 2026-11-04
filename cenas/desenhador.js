/*
 * CartaX — desenhador de cenas
 * Recebe uma descrição de cena (JSON) e devolve uma ilustração SVG, vista de cima.
 * A geometria vem sempre do código: a IA só escolhe a peça, os elementos, os lugares e os estados.
 *
 * Uso: CartaXCenas.desenhar(cena, { semente: 1 }) -> { svg, erros, avisos }
 */
(function (global) {
  "use strict";

  var VERSAO = "0.1.0";
  var W = 1000, H = 1000;

  /* ---------- números aleatórios reprodutíveis (a mesma semente dá sempre a mesma variante) ---------- */
  function rng(seed) {
    var s = (seed >>> 0) || 1;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }

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

  /* ---------- peças de estrada ---------- */
  // Cada peça desenha a estrada e define os lugares onde os elementos podem estar.
  // Sentido de marcha "para cima" = rumo 0 graus. Os lugares retos têm x fixo e y de y0 (avanço 0) a y1 (avanço 1).
  var PECAS = {};

  PECAS.entrada_autoestrada = (function () {
    var RC = { x: 1010, y: 640 }, R = 300; // eixo do ramal (quarto de circunferência)
    function pontoRamal(t) { // t: 0 início visível, 1 ligação à via de aceleração
      var a = (88 - 88 * t) * Math.PI / 180;
      return { x: RC.x - R * Math.cos(a), y: RC.y + R * Math.sin(a), rumo: -(88 - 88 * t) };
    }
    var lugares = {
      faixa_esquerda: { reto: true, x: 410, y0: 960, y1: 40, rumo: 0, nome: "faixa da esquerda" },
      faixa_central: { reto: true, x: 510, y0: 960, y1: 40, rumo: 0, nome: "faixa central" },
      faixa_direita: { reto: true, x: 610, y0: 960, y1: 40, rumo: 0, nome: "faixa da direita" },
      via_aceleracao: { reto: true, x: 710, y0: 610, y1: 320, rumo: 0, nome: "via de aceleração" },
      ramal: { reto: false, ponto: pontoRamal, nome: "ramal de entrada" },
      sentido_contrario: { reto: true, x: 170, y0: 40, y1: 960, rumo: 180, nome: "faixa do sentido contrário" }
    };

    function arco(raio) {
      var p0 = { x: RC.x - raio * Math.cos(Math.PI / 2), y: RC.y + raio };
      var p1 = { x: RC.x - raio, y: RC.y };
      return "M" + p0.x + " " + p0.y + " A" + raio + " " + raio + " 0 0 1 " + p1.x + " " + p1.y;
    }

    function estrada(amb) {
      var a = amb.asfalto, branco = "#f3f1ea", s = [];
      // faixas de rodagem
      s.push('<rect x="40" y="0" width="260" height="1000" fill="' + a + '"/>');
      s.push('<rect x="300" y="0" width="60" height="1000" fill="#a9a59a"/>');
      s.push('<rect x="326" y="0" width="8" height="1000" fill="#8a8a86"/>');
      s.push('<line x1="318" y1="0" x2="318" y2="1000" stroke="#d9dbde" stroke-width="4"/>');
      s.push('<line x1="342" y1="0" x2="342" y2="1000" stroke="#d9dbde" stroke-width="4"/>');
      s.push('<rect x="360" y="0" width="300" height="1000" fill="' + a + '"/>');
      // ramal e via de aceleração
      s.push('<path d="' + arco(R) + '" fill="none" stroke="' + a + '" stroke-width="100"/>');
      s.push('<polygon points="660,642 760,642 760,300 660,120" fill="' + a + '"/>');
      // ilhéu (nariz) entre o ramal e a autoestrada, com zebrado
      s.push('<clipPath id="nariz"><path d="M660 640 L660 1000 L1000 1000 ' + "L" + (RC.x - 350 * Math.cos(Math.PI / 2)) + " " + (RC.y + 350) +
        ' A350 350 0 0 1 660 640 Z"/></clipPath>');
      var z = [];
      for (var i = 0; i < 9; i++) { var yy = 650 + i * 22; z.push('<line x1="660" y1="' + yy + '" x2="720" y2="' + (yy - 60) + '" stroke="' + branco + '" stroke-width="7"/>'); }
      // marcas: sentido contrário
      s.push(linhaCont(44, 0, 44, 1000, branco));
      s.push(linhaCont(296, 0, 296, 1000, branco));
      s.push(tracejado(127, 0, 127, 1000, branco, 6, 40, 60));
      s.push(tracejado(213, 0, 213, 1000, branco, 6, 40, 60));
      // marcas: autoestrada
      s.push(linhaCont(364, 0, 364, 1000, branco));
      s.push(tracejado(460, 0, 460, 1000, branco, 6, 40, 60));
      s.push(tracejado(560, 0, 560, 1000, branco, 6, 40, 60));
      s.push(linhaCont(656, 0, 656, 120, branco));
      s.push(linhaCont(656, 642, 656, 1000, branco));
      s.push(tracejado(660, 132, 660, 636, branco, 9, 22, 22)); // linha de aceleração, mais larga
      s.push('<polyline points="756,646 756,300 660,124" fill="none" stroke="' + branco + '" stroke-width="5"/>');
      // bordos do ramal
      s.push('<path d="' + arco(R + 46) + '" fill="none" stroke="' + branco + '" stroke-width="5"/>');
      s.push('<path d="' + arco(R - 46) + '" fill="none" stroke="' + branco + '" stroke-width="5"/>');
      // zebrado do nariz (atrás dos veículos que entram)
      s.push('<g clip-path="url(#nariz)">' + z.join("") + "</g>");
      // setas de convergência na via de aceleração
      s.push(setaConvergencia(710, 270, branco));
      return s.join("");
    }

    // pontos onde não se pode pôr árvores (estrada e bermas próximas)
    function livre(x, y) {
      if (x < 800 && y < 660) return false;
      if (x < 690) return false;
      var d = Math.hypot(x - RC.x, y - RC.y);
      if (d > R - 90 && d < R + 90 && y > RC.y - 20) return false;
      if (x > 900 && y > 880) return false;
      return true;
    }

    return { lugares: lugares, estrada: estrada, livre: livre, nome: "Entrada de autoestrada" };
  })();

  /* ---------- traços ---------- */
  function linhaCont(x1, y1, x2, y2, c) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="5"/>'; }
  function tracejado(x1, y1, x2, y2, c, w, d, g) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="' + w + '" stroke-dasharray="' + d + " " + g + '"/>'; }
  function setaConvergencia(x, y, c) {
    // seta curva a apontar para a esquerda (para a autoestrada)
    return '<g transform="translate(' + x + " " + y + ')" fill="' + c + '" opacity="0.92">' +
      '<path d="M14 40 L14 6 Q14 -10 -6 -14 L-6 -24 L-26 -6 L-6 12 L-6 2 Q4 4 4 10 L4 40 Z"/></g>';
  }

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
      s += '<circle cx="' + x + '" cy="' + (-h / 2 + 5) + '" r="5" fill="#ffb000"/><circle cx="' + x + '" cy="' + (h / 2 - 5) + '" r="5" fill="#ffb000"/>';
    });
    return s;
  }
  function travao(w, h, on) {
    if (!on) return '<rect x="' + (-w / 2 + 4) + '" y="' + (h / 2 - 5) + '" width="9" height="4" fill="#7a1d1d"/><rect x="' + (w / 2 - 13) + '" y="' + (h / 2 - 5) + '" width="9" height="4" fill="#7a1d1d"/>';
    return '<rect x="' + (-w / 2 + 3) + '" y="' + (h / 2 - 6) + '" width="11" height="6" fill="#ff2a2a"/><rect x="' + (w / 2 - 14) + '" y="' + (h / 2 - 6) + '" width="11" height="6" fill="#ff2a2a"/>';
  }

  var VEICULOS = {
    ligeiro: function (r, estado, amb) {
      var m = pick(r, MODELOS_LIGEIRO), cor = pick(r, CORES_LIGEIRO), w = m.w, h = m.h;
      var s = sombra(w, h, amb);
      s += '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="11" fill="' + cor + '" stroke="#1d1f22" stroke-width="2"/>';
      s += '<path d="M' + (-w / 2 + 5) + " " + (-h / 2 + 22) + " L" + (w / 2 - 5) + " " + (-h / 2 + 22) + " L" + (w / 2 - 8) + " " + (-h / 2 + 36) + " L" + (-w / 2 + 8) + " " + (-h / 2 + 36) + ' Z" fill="#1f2a33"/>';
      s += '<rect x="' + (-w / 2 + 7) + '" y="' + (-h / 2 + 38) + '" width="' + (w - 14) + '" height="' + (h - 62) + '" rx="5" fill="' + cor + '" stroke="rgba(0,0,0,0.25)"/>';
      s += '<path d="M' + (-w / 2 + 7) + " " + (h / 2 - 22) + " L" + (w / 2 - 7) + " " + (h / 2 - 22) + " L" + (w / 2 - 5) + " " + (h / 2 - 12) + " L" + (-w / 2 + 5) + " " + (h / 2 - 12) + ' Z" fill="#1f2a33"/>';
      s += '<rect x="' + (-w / 2 + 4) + '" y="' + (-h / 2 + 2) + '" width="9" height="5" rx="2" fill="#fff6d8"/><rect x="' + (w / 2 - 13) + '" y="' + (-h / 2 + 2) + '" width="9" height="5" rx="2" fill="#fff6d8"/>';
      s += travao(w, h, estado.travao) + piscas(w, h, estado.pisca);
      return { svg: s, w: w, h: h };
    },
    ambulancia: function (r, estado, amb) {
      var w = 54, h = 124, s = sombra(w, h, amb);
      if (estado.emergencia) {
        s += '<ellipse cx="0" cy="' + (-h / 2 + 28) + '" rx="78" ry="58" fill="url(#brilhoAzul)"/>';
      }
      s += '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="9" fill="#f4cd00" stroke="#1d1f22" stroke-width="2"/>';
      s += '<path d="M' + (-w / 2 + 5) + " " + (-h / 2 + 8) + " L" + (w / 2 - 5) + " " + (-h / 2 + 8) + " L" + (w / 2 - 7) + " " + (-h / 2 + 20) + " L" + (-w / 2 + 7) + " " + (-h / 2 + 20) + ' Z" fill="#1f2a33"/>';
      // faixas refletoras laterais (vermelho e amarelo)
      for (var i = 0; i < 6; i++) {
        var y = -h / 2 + 34 + i * 14;
        s += '<rect x="' + (-w / 2 + 1) + '" y="' + y + '" width="6" height="7" fill="#d4202a"/><rect x="' + (w / 2 - 7) + '" y="' + y + '" width="6" height="7" fill="#d4202a"/>';
      }
      // barra de luzes
      var luz = estado.emergencia ? "#1f6bff" : "#1b2c55";
      s += '<rect x="' + (-w / 2 + 6) + '" y="' + (-h / 2 + 23) + '" width="' + (w - 12) + '" height="9" rx="3" fill="#2a2d33"/>';
      s += '<rect x="' + (-w / 2 + 8) + '" y="' + (-h / 2 + 24) + '" width="14" height="7" rx="2" fill="' + luz + '"/>';
      s += '<rect x="' + (w / 2 - 22) + '" y="' + (-h / 2 + 24) + '" width="14" height="7" rx="2" fill="' + luz + '"/>';
      if (estado.emergencia) {
        s += '<rect x="' + (-w / 2 + 11) + '" y="' + (-h / 2 + 26) + '" width="7" height="3" rx="1" fill="#e6f0ff"/>';
        s += '<rect x="' + (w / 2 - 19) + '" y="' + (-h / 2 + 26) + '" width="7" height="3" rx="1" fill="#e6f0ff"/>';
      }
      // tejadilho: escotilha e grelha de ventilação (sem texto nem símbolos)
      s += '<rect x="-14" y="-4" width="28" height="22" rx="3" fill="#e2bd00" stroke="rgba(0,0,0,0.25)"/>';
      s += '<rect x="-10" y="30" width="20" height="14" rx="2" fill="#d0ad00" stroke="rgba(0,0,0,0.25)"/>';
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
    var porId = {}, colocados = [];
    var lista = (cena.elementos || []).slice();
    // os elementos com junto_a vão depois daquele a que se referem
    var pendentes = lista.slice(), voltas = 0;
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
    // sobreposições
    for (var i = 0; i < colocados.length; i++) for (var j = i + 1; j < colocados.length; j++) {
      var a = colocados[i], b = colocados[j];
      if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 - 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2 - 2)
        avisos.push('"' + a.ref + '" e "' + b.ref + '" ficam sobrepostos.');
    }
    return colocados;
  }

  function colocarUm(el, porId, peca, r, erros, avisos) {
    var ref = el.id || el.tipo;
    var fazer = VEICULOS[el.tipo];
    if (!fazer) { erros.push('Elemento "' + el.tipo + '" ainda não existe. Disponíveis: ' + Object.keys(VEICULOS).join(", ") + "."); return null; }
    var lug = peca.lugares[el.lugar];
    if (!lug) { erros.push('Lugar "' + el.lugar + '" não existe nesta peça. Lugares: ' + Object.keys(peca.lugares).join(", ") + "."); return null; }
    var estado = el.estado || {};
    var v = fazer(r, estado, AMB_ATUAL);
    var x, y, rumo;
    if (el.junto_a) {
      var alvo = porId[el.junto_a];
      if (!lug.reto || !alvo.reto) { erros.push('"' + ref + '": as posições relativas só funcionam em lugares retos.'); return null; }
      var sentido = lug.y1 < lug.y0 ? -1 : 1; // -1 = a subir
      var off = 0;
      if (el.posicao === "atras") off = -sentido * ((alvo.h + v.h) / 2 + DIST);
      else if (el.posicao === "a_frente") off = sentido * ((alvo.h + v.h) / 2 + DIST);
      else if (el.posicao && el.posicao !== "ao_lado") { erros.push('"' + ref + '": posição "' + el.posicao + '" desconhecida (usar ao_lado, atras ou a_frente).'); return null; }
      x = lug.x; y = alvo.y + off; rumo = lug.rumo;
      var lo = Math.min(lug.y0, lug.y1), hi = Math.max(lug.y0, lug.y1);
      if (y < lo || y > hi) avisos.push('"' + ref + '" fica fora do troço visível de ' + lug.nome + ".");
    } else {
      var t = el.avanco == null ? 0.5 : Math.max(0, Math.min(1, +el.avanco));
      if (lug.reto) { x = lug.x; y = lug.y0 + (lug.y1 - lug.y0) * t; rumo = lug.rumo; }
      else { var p = lug.ponto(t); x = p.x; y = p.y; rumo = p.rumo; }
    }
    return { ref: ref, tipo: el.tipo, x: x, y: y, rumo: rumo, w: v.w, h: v.h, svg: v.svg, reto: lug.reto };
  }

  /* ---------- árvores e arbustos nas bermas ---------- */
  function vegetacao(peca, r, amb) {
    var s = [], n = 26;
    for (var i = 0, tent = 0; i < n && tent < 400; tent++) {
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
    var erros = [], avisos = [];
    var semente = opcoes.semente || 1;
    var r = rng(semente * 7919 + 13);
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
    s.push(peca.estrada(amb));
    if (amb.molhado) {
      for (var k = 0; k < 14; k++) {
        var mx = 380 + r() * 360, my = r() * 1000;
        s.push('<ellipse cx="' + mx + '" cy="' + my + '" rx="' + (8 + r() * 14) + '" ry="' + (30 + r() * 50) + '" fill="rgba(200,215,235,0.10)"/>');
      }
    }
    elementos.forEach(function (e) {
      s.push('<g transform="translate(' + e.x.toFixed(1) + " " + e.y.toFixed(1) + ") rotate(" + e.rumo.toFixed(1) + ')">' + e.svg + "</g>");
    });
    if (amb.tinta) s.push('<rect width="1000" height="1000" fill="' + amb.tinta + '"/>');
    s.push("</svg>");
    return { svg: s.join(""), erros: erros, avisos: avisos, ambiente: nomeAmb, versao: VERSAO };
  }

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var api = {
    versao: VERSAO,
    desenhar: desenhar,
    pecas: function () { return Object.keys(PECAS).map(function (k) { return { id: k, nome: PECAS[k].nome, lugares: Object.keys(PECAS[k].lugares) }; }); },
    elementos: function () { return Object.keys(VEICULOS); },
    ambientes: function () { return Object.keys(AMBIENTES); }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.CartaXCenas = api;
})(this);
