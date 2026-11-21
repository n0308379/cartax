/* CartaX · Motor das missões «Vê o perigo».
 * Cada missão é uma descrição (missoes/cenarios.js): tipo de estrada, ambiente e uma lista de perigos.
 * O motor desenha a estrada a passar (vista de cima, em canvas 360×440), anima cada perigo e pontua os toques.
 *
 * Uso:
 *   var inst = CartaXMissoes.preparar(cenario, semente);   // semente 1 = valores base; 2..20 = variantes
 *   CartaXMissoes.desenhar(ctx, inst, t, toques);           // t em segundos desde o início
 *   var r = CartaXMissoes.tocar(inst, t);                   // { acerto, indice, pontos }
 *
 * Pontuação de cada perigo: a janela começa quando a pista fica visível (t0).
 *   tocar no 1.º segundo = 5 pontos · até 2 s = 3 · até ao fim da janela = 1 · fora de qualquer janela = toque falso.
 */
(function (global) {
  var W = 360, H = 440, YTU = 360, V = 110; // V = pixéis por segundo (a tua velocidade)
  var P = { road: "#4a4e55", paint: "#ece8dc", walk: "#7c7f84", curb: "#5a5e64", grass: "#3c6b3f", tree: "#2f5c33",
    you: "#5b9be6", amber: "#f2b634", red: "#d63d2f", ok: "#44a96d", white: "#f4f1ea", skin: "#e0b48a", dark: "#1b1b1b" };
  var CORES = ["#8d939b", "#a35b4a", "#c9c3b4", "#6f7f95", "#d9d3c3", "#59705b", "#9a8f7d", "#3f4a5a"];

  /* ---------- números aleatórios reprodutíveis ---------- */
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  /* ---------- geometria de cada tipo de estrada ---------- */
  var ESTRADAS = {
    rua:         { x0: 70, x1: 290, centro: 180, tu: 232, contra: 128, estR: 266, estL: null, passeio: true, cena: "arvores" },
    residencial: { x0: 70, x1: 290, centro: 180, tu: 232, contra: 128, estR: 266, estL: 94, passeio: true, cena: "casas" },
    escola:      { x0: 70, x1: 290, centro: 180, tu: 232, contra: 128, estR: 266, estL: null, passeio: true, cena: "escola" },
    avenida:     { x0: 60, x1: 300, centro: 180, tu: 236, contra: 124, estR: 276, estL: null, passeio: true, cena: "avenida" },
    nacional:    { x0: 95, x1: 265, centro: 180, tu: 222, contra: 138, estR: null, estL: null, passeio: false, cena: "campo" }
  };

  /* ---------- desenho básico ---------- */
  function rr(c, x, y, w, h, r) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); c.fill(); }
  function carro(c, x, y, cor, o) {
    o = o || {}; c.save(); c.translate(x, y); c.rotate(o.ang || 0);
    var w = o.w || 26, h = o.h || 44;
    c.fillStyle = cor; rr(c, -w / 2, -h / 2, w, h, 6);
    c.fillStyle = "rgba(10,12,15,.6)"; rr(c, -w / 2 + 3, -h / 2 + 8, w - 6, 9, 2);
    c.fillStyle = "rgba(10,12,15,.45)"; rr(c, -w / 2 + 3, h / 2 - 12, w - 6, 6, 2);
    if (o.pisca) { c.fillStyle = P.amber; var sx = o.pisca === "D" ? w / 2 - 2 : -w / 2 + 2; c.beginPath(); c.arc(sx, -h / 2 + 3, 4, 0, 7); c.arc(sx, h / 2 - 3, 4, 0, 7); c.fill(); }
    if (o.travao) { c.fillStyle = "#ff3b2f"; c.fillRect(-w / 2 + 2, h / 2 - 3, 7, 3); c.fillRect(w / 2 - 9, h / 2 - 3, 7, 3); }
    if (o.re) { c.fillStyle = "#ffffff"; c.fillRect(-w / 2 + 3, h / 2 - 3, 5, 3); c.fillRect(w / 2 - 8, h / 2 - 3, 5, 3); }
    if (o.condutor) { c.fillStyle = "#2a2a2a"; c.beginPath(); c.arc(-w / 2 + 8, -2, 4.5, 0, 7); c.fill(); }
    c.restore();
  }
  function pessoa(c, x, y, cor, o) {
    o = o || {}; var r = o.crianca ? 6 : 8;
    c.fillStyle = cor; c.beginPath(); c.arc(x, y + 3, r, 0, 7); c.fill();
    if (o.mochila) { c.fillStyle = o.mochila; rr(c, x - r + 1, y + 4, r * 2 - 2, r, 3); }
    c.fillStyle = "#3a2a1e"; c.beginPath(); c.arc(x, y, r * 0.6, 0, 7); c.fill();
    if (o.guarda) { c.fillStyle = "rgba(30,40,60,.85)"; c.beginPath(); c.arc(x, y, r + 7, 0, 7); c.fill(); }
  }
  function blink(t) { return Math.floor(t * 3) % 2 === 0; }
  function lerp(a, b, p) { return a + (b - a) * Math.max(0, Math.min(1, p)); }
  function vizinhos(c, g, y, cor1, cor2) { carro(c, g.estR, y - 62, cor1); carro(c, g.estR, y + 62, cor2); }

  /* ---------- biblioteca de perigos ----------
   * y = posição do perigo no ecrã (desce com a estrada), tl = segundos desde t0 (negativo antes da pista).
   * yAparece = onde está o perigo no ecrã no instante t0; mov = quando começa a ação, depois da pista. */
  // Os atores não entram no espaço do teu carro: perto de ti, param na beira da tua via.
  function beira(x, y, g) { return (y > YTU - 115 && x > g.tu - 20) ? Math.max(x, g.tu + 26) : x; }

  var TIPOS = {
    carro_sai: { yAparece: 30, mov: 0.8, nome: "Carro a sair do estacionamento",
      desenhar: function (c, g, y, tl, h) {
        var x = g.estR, ang = 0, m = tl - this.mov;
        if (m > 0) { var p = Math.min(1, m / 1.4); x = g.estR - p * 36; ang = -0.35 * Math.sin(p * Math.PI); if (m > 1.4) y -= (m - 1.4) * 160; }
        carro(c, x, y, h.cor || "#d9d3c3", { ang: ang, pisca: tl >= 0 && m < 1.6 && blink(tl) ? "E" : null, condutor: true });
      } },
    bola_crianca: { yAparece: 40, mov: 0.9, nome: "Bola na estrada, criança atrás",
      desenhar: function (c, g, y, tl) {
        vizinhos(c, g, y, "#8d939b", "#6f7f95");
        if (tl >= 0) { var bx = Math.max(g.x0 + 40, g.x1 + 10 - tl * 80); c.fillStyle = P.red; c.beginPath(); c.arc(bx, y, 7, 0, 7); c.fill(); c.fillStyle = "#fff"; c.fillRect(bx - 7, y - 1.5, 14, 3); }
        if (tl > this.mov) pessoa(c, beira(g.x1 + 22 - Math.min(75, (tl - this.mov) * 50), y + 4, g), y + 4, P.amber, { crianca: true });
      } },
    porta_abre: { yAparece: 50, mov: 1.1, nome: "Porta a abrir num carro estacionado",
      desenhar: function (c, g, y, tl, h) {
        carro(c, g.estR, y, h.cor || "#a35b4a", { condutor: true });
        if (tl > this.mov) {
          var a = Math.min(1, (tl - this.mov) / 0.4) * 0.95;
          c.save(); c.translate(g.estR - 13, y - 8); c.rotate(a); c.fillStyle = h.cor || "#a35b4a"; c.fillRect(-4, 0, 4, 16); c.restore();
          if (tl > this.mov + 0.6) pessoa(c, g.estR - 6, y + 14, "#4c6a8c");
        }
      } },
    peao_entre_carros: { yAparece: 40, mov: 0.9, nome: "Peão a sair entre carros estacionados",
      desenhar: function (c, g, y, tl, h) {
        vizinhos(c, g, y, "#c9c3b4", "#59705b");
        if (tl < 0) return;
        var px = tl < this.mov ? g.x1 + 14 - Math.min(8, tl * 8) : g.x1 + 6 - (tl - this.mov) * 44;
        pessoa(c, beira(Math.max(g.x0 + 30, px), y, g), y, h.roupa || "#7a4fa0", { crianca: !!h.crianca, mochila: h.crianca ? P.amber : null, guarda: !!h.guardaChuva });
      } },
    ciclista_desvia: { yAparece: 40, mov: 1.2, nome: "Ciclista a desviar-se de um obstáculo",
      desenhar: function (c, g, y, tl) {
        // y = buraco na estrada (parado); o ciclista vem à frente dele, mais devagar do que tu, desvia-se para a tua via e volta
        var xb = (g.estR || g.x1 - 22) - 2, cy = y + 92 - 45 * tl;
        c.fillStyle = "#2b2b2b"; c.beginPath(); c.ellipse(xb + 2, y, 12, 7, 0, 0, 7); c.fill();
        c.fillStyle = "#3a3a3a"; c.beginPath(); c.ellipse(xb + 2, y, 8, 4, 0, 0, 7); c.fill();
        if (cy > H + 40) return;
        var x = xb, m = tl - this.mov;
        if (m > 0) x = m < 1.1 ? lerp(xb, g.tu + 2, m / 0.6) : lerp(g.tu + 2, xb, (m - 1.1) / 0.6);
        c.fillStyle = "#222"; c.fillRect(x - 2, cy - 16, 4, 32);
        pessoa(c, x, cy - 2, "#2e8b57");
      } },
    trava_frente: { yAparece: 150, mov: 0.8, nome: "O carro da frente vai virar e trava",
      fixo: true, // anda à tua frente, à tua velocidade: não desce com a estrada
      desenhar: function (c, g, y, tl, h) {
        if (tl < -4) return;
        var yy = tl < -2 ? lerp(-60, 150, (tl + 4) / 2) : 150, x = g.tu, ang = 0, m = tl - this.mov;
        if (m > 0) yy += Math.min(140, 0.5 * 160 * m * m);
        var gira = m > 1.6 ? Math.min(1, (m - 1.6) / 1) : 0;
        if (gira > 0) { x -= gira * 46; yy -= gira * 30; ang = -gira * 1.2; }
        if (m > 2.6) { yy -= (m - 2.6) * 160; x -= (m - 2.6) * 90; }
        if (yy < -80 || x < -40) return;
        carro(c, x, yy, h.cor || "#6f7f95", { ang: ang, pisca: tl >= 0 && blink(tl) ? "E" : null, travao: tl >= 0 && gira < 1 });
      } },
    autocarro_peoes: { yAparece: 40, mov: 1.0, nome: "Peão a atravessar à frente do autocarro",
      desenhar: function (c, g, y, tl) {
        var bx = g.x1 - 16;
        c.fillStyle = "#2d6cb5"; rr(c, bx - 16, y - 20, 32, 100, 6);
        c.fillStyle = "rgba(10,12,15,.55)"; rr(c, bx - 13, y - 14, 26, 10, 2);
        c.fillStyle = "#f4f1ea"; c.font = "700 10px Arial"; c.textAlign = "center"; c.fillText("BUS", bx, y + 40);
        if (tl >= 0 && blink(tl)) { c.fillStyle = P.amber; c.beginPath(); c.arc(bx - 14, y - 17, 3.5, 0, 7); c.arc(bx + 14, y - 17, 3.5, 0, 7); c.fill(); }
        if (tl > this.mov) pessoa(c, beira(bx - 4 - (tl - this.mov) * 42, y - 32, g), y - 32, "#b0413e");
        else if (tl >= 0) pessoa(c, bx + 2, y - 32, "#b0413e");
      } },
    peao_passadeira: { yAparece: 30, mov: 1.0, nome: "Peão a chegar à passadeira",
      desenhar: function (c, g, y, tl, h) {
        c.fillStyle = "#f4f1ea"; for (var x = g.x0 + 8; x < g.x1 - 8; x += 22) c.fillRect(x, y - 16, 12, 32);
        if (tl < -1.5) return;
        var px = g.x1 + 20, py = y + 34 - Math.min(34, Math.max(0, tl + 1.5) * 16);
        if (tl > this.mov) { px = g.x1 + 14 - (tl - this.mov) * 46; py = y; }
        pessoa(c, beira(Math.max(g.x0 + 10, px), py, g), py, h.roupa || "#d0602c", { crianca: !!h.crianca, mochila: h.crianca ? "#3d7fd6" : null });
      } },
    carro_garagem: { yAparece: 40, mov: 0.8, nome: "Carro a sair de marcha atrás de uma garagem",
      desenhar: function (c, g, y, tl, h) {
        c.fillStyle = "#9a9da2"; c.fillRect(g.x1 + 4, y - 26, W - g.x1 - 4, 52); // entrada da garagem no passeio
        var x = 330, ang = 0;
        if (tl > this.mov) { var p = Math.min(1, (tl - this.mov) / 1.6); x = 330 - p * 62; ang = -p * 0.8; }
        if (y > YTU - 130) x = Math.max(x, g.tu + 40);
        carro(c, x, y, h.cor || "#c9c3b4", { ang: Math.PI / 2 + ang, re: tl >= 0 });
      } },
    animal: { yAparece: 30, mov: 0.9, nome: "Animal na berma, à noite",
      pos: function (g, y, tl) { return beira(tl > this.mov ? g.x1 + 18 - (tl - this.mov) * 75 : g.x1 + 18, y, g); },
      desenhar: function (c, g, y, tl) {
        if (tl < 0) return; var x = this.pos(g, y, tl);
        c.fillStyle = "#6b5440"; c.beginPath(); c.ellipse(x, y, 12, 7, 0, 0, 7); c.fill(); c.beginPath(); c.arc(x - 12, y - 2, 5, 0, 7); c.fill();
      },
      luz: function (c, g, y, tl) {
        if (tl < 0) return; var x = this.pos(g, y, tl);
        c.fillStyle = "#d7ff7a"; c.beginPath(); c.arc(x - 14, y - 4, 2.2, 0, 7); c.arc(x - 10, y - 5, 2.2, 0, 7); c.fill();
      } },
    ultrapassagem_contrario: { yAparece: 20, mov: 0.8, nome: "Ultrapassagem em sentido contrário",
      fixo: true,
      pos: function (g, tl) {
        var camY = 20 + 100 * tl, carY = -50 + 170 * tl, x = g.contra;
        if (tl > this.mov) x = lerp(g.contra, g.tu - 8, (tl - this.mov) / 0.5);
        if (tl > 1.9) x = lerp(g.tu - 8, g.contra, (tl - 1.9) / 0.5);
        return { camY: camY, carY: carY, x: x };
      },
      desenhar: function (c, g, y, tl) {
        if (tl < -0.5) return; var q = this.pos(g, tl);
        carro(c, g.contra, q.camY, "#c4c8cc", { ang: Math.PI, w: 30, h: 70 });
        carro(c, q.x, q.carY, "#a35b4a", { ang: Math.PI, pisca: tl >= 0 && tl < this.mov + 0.4 && blink(tl) ? "D" : null });
      },
      luz: function (c, g, y, tl) {
        if (tl < -0.5) return; var q = this.pos(g, tl);
        [[g.contra, q.camY + 35], [q.x, q.carY + 22]].forEach(function (p) {
          var gr = c.createRadialGradient(p[0], p[1], 2, p[0], p[1] + 40, 70); gr.addColorStop(0, "rgba(255,245,200,.55)"); gr.addColorStop(1, "rgba(255,245,200,0)");
          c.fillStyle = gr; c.beginPath(); c.moveTo(p[0] - 12, p[1]); c.lineTo(p[0] - 40, p[1] + 110); c.lineTo(p[0] + 40, p[1] + 110); c.lineTo(p[0] + 12, p[1]); c.fill();
          c.fillStyle = "#fff8d0"; c.beginPath(); c.arc(p[0] - 9, p[1], 3, 0, 7); c.arc(p[0] + 9, p[1], 3, 0, 7); c.fill();
        });
      } },
    carro_cruzamento: { yAparece: 40, mov: 1.1, nome: "Carro a chegar depressa a um STOP",
      desenhar: function (c, g, y, tl, h) {
        c.fillStyle = P.road; c.fillRect(g.x1, y - 30, W - g.x1, 60);
        if (g.passeio) { c.fillStyle = P.curb; c.fillRect(g.x1, y - 34, W - g.x1, 4); c.fillRect(g.x1, y + 30, W - g.x1, 4); c.fillStyle = P.road; c.fillRect(g.x1, y - 30, 4, 60); }
        c.fillStyle = P.paint; c.fillRect(g.x1 + 8, y - 28, 4, 26); // linha de paragem
        c.save(); c.translate(g.x1 + 26, y - 46); c.fillStyle = "#c62828"; c.beginPath();
        for (var i = 0; i < 8; i++) { var a = Math.PI / 8 + i * Math.PI / 4; c.lineTo(11 * Math.cos(a), 11 * Math.sin(a)); } c.fill();
        c.fillStyle = "#fff"; c.font = "700 6px Arial"; c.textAlign = "center"; c.fillText("STOP", 0, 2); c.restore();
        if (tl < -0.5) return;
        var x = 460 - (tl + 0.5) * 100, yy = y - 14, ang = -Math.PI / 2;
        if (tl > this.mov) { var p = Math.min(1, (tl - this.mov) / 1.1); x = lerp(300, g.tu, p); yy = y - 14 - p * 46; ang = -Math.PI / 2 * (1 - p); if (p >= 1) yy -= (tl - this.mov - 1.1) * 160; }
        carro(c, x, yy, h.cor || "#59705b", { ang: ang });
      } }
  };

  /* ---------- cenário de fundo ---------- */
  function fundo(c, g, s, cen, R) {
    c.fillStyle = g.passeio ? P.walk : P.grass; c.fillRect(0, 0, W, H);
    c.fillStyle = P.road; c.fillRect(g.x0, 0, g.x1 - g.x0, H);
    if (g.passeio) { c.fillStyle = P.curb; c.fillRect(g.x0 - 4, 0, 4, H); c.fillRect(g.x1, 0, 4, H); }
    else { c.fillStyle = P.paint; c.fillRect(g.x0 + 4, 0, 3, H); c.fillRect(g.x1 - 7, 0, 3, H); }
    c.fillStyle = P.paint; for (var y = -40 + (s % 40); y < H; y += 40) c.fillRect(g.centro - 2, y, 4, 22);
    var k, yy;
    if (g.cena === "arvores" || g.cena === "escola" || g.cena === "avenida") {
      for (k = 0; k < 12; k++) { yy = ((k * 95 + s) % (H + 120)) - 60; c.fillStyle = P.tree; c.beginPath(); c.arc(30, yy, 20, 0, 7); if (g.cena !== "escola" || k % 3) c.arc(330, yy + 40, 20, 0, 7); c.fill(); }
    } else if (g.cena === "casas") {
      for (k = 0; k < 6; k++) { yy = ((k * 150 + s) % (H + 180)) - 90; c.fillStyle = ["#b9a58c", "#9fb1bd", "#c9b8a0"][k % 3]; c.fillRect(0, yy, 40, 80); c.fillRect(322, yy + 60, 38, 80);
        c.fillStyle = "#7d4f3c"; c.fillRect(0, yy, 40, 8); c.fillRect(322, yy + 60, 38, 8); }
    } else if (g.cena === "campo") {
      for (k = 0; k < 14; k++) { yy = ((k * 70 + s) % (H + 100)) - 50; c.fillStyle = P.tree; c.beginPath(); c.arc(30 + (k % 3) * 18, yy, 16, 0, 7); c.arc(320 - (k % 2) * 20, yy + 30, 16, 0, 7); c.fill(); }
    }
    // extras fixos do cenário (sinais, escola), em posição no mundo
    (cen.extras || []).forEach(function (e) {
      var ey = YTU - (e.d - s);
      if (ey < -120 || ey > H + 120) return;
      if (e.tipo === "sinal_criancas") {
        c.save(); c.translate(g.x1 + 22, ey); c.fillStyle = "#fff"; c.strokeStyle = "#c62828"; c.lineWidth = 3;
        c.beginPath(); c.moveTo(0, -12); c.lineTo(12, 9); c.lineTo(-12, 9); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = "#222"; c.beginPath(); c.arc(-3, 0, 2.2, 0, 7); c.arc(3, 1, 2.2, 0, 7); c.fill(); c.restore();
      } else if (e.tipo === "escola") {
        c.fillStyle = "#d8c7a0"; c.fillRect(g.x1 + 8, ey - 90, W - g.x1 - 8, 180); c.fillStyle = "#b53b2e"; c.fillRect(g.x1 + 8, ey - 90, W - g.x1 - 8, 10);
        c.fillStyle = "#333"; c.font = "700 11px Arial"; c.textAlign = "center"; c.save(); c.translate(g.x1 + 38, ey); c.rotate(-Math.PI / 2); c.fillText("ESCOLA", 0, 4); c.restore();
      } else if (e.tipo === "paragem") {
        c.fillStyle = "#9fb3c8"; c.fillRect(g.x1 + 10, ey - 30, 10, 60);
      }
    });
  }

  function estacionados(c, g, s, inst) {
    inst.parados.forEach(function (p) { var y = YTU - (p.d - s); if (y > -60 && y < H + 60) carro(c, p.x, y, p.cor); });
  }

  /* ---------- preparar uma instância (variante) ---------- */
  function preparar(cen, semente) {
    semente = semente || 1;
    var R = rng(semente * 7919 + 17), g = ESTRADAS[cen.estrada] || ESTRADAS.rua;
    var perigos = cen.perigos.map(function (p) {
      var T = TIPOS[p.tipo];
      var t0 = p.t0 + (semente > 1 ? (R() - 0.5) * 0.8 : 0);
      var yA = p.yAparece != null ? p.yAparece : T.yAparece;
      return { tipo: p.tipo, T: T, spec: p, t0: t0, t1: t0 + (p.janela || 3.2), d: t0 * V + (YTU - yA), nome: p.nome || T.nome, dica: p.dica || "" };
    });
    var fim = Math.max.apply(null, perigos.map(function (p) { return p.t1; })) + 1.5;
    var duracao = Math.max(cen.duracao || 0, fim);
    // carros estacionados de enchimento, longe dos perigos
    var parados = [], lados = [];
    if (g.estR && cen.estacionados !== false) lados.push(g.estR);
    if (g.estL && cen.estacionados !== false) lados.push(g.estL);
    lados.forEach(function (x) {
      for (var d = -60; d < duracao * V + 500; d += 70 + R() * 50) {
        var livre = perigos.every(function (p) { return p.T.fixo || Math.abs(p.d - d) > (x === g.estR ? 110 : 40); });
        if (livre && R() < (cen.densidade || 0.75)) parados.push({ x: x, d: d, cor: CORES[Math.floor(R() * CORES.length)] });
      }
    });
    return { cen: cen, g: g, semente: semente, perigos: perigos, parados: parados, duracao: duracao, hits: perigos.map(function () { return null; }), falsos: 0, R: R };
  }

  /* ---------- desenhar um instante ---------- */
  function desenhar(c, inst, t, toques) {
    var g = inst.g, cen = inst.cen, s = t * V;
    fundo(c, g, s, cen);
    estacionados(c, g, s, inst);
    inst.perigos.forEach(function (p) {
      var tl = t - p.t0, y = p.T.fixo ? p.T.yAparece : YTU - (p.d - s);
      if (!p.T.fixo && (y < -160 || y > H + 160)) return;
      c.save(); p.T.desenhar(c, g, y, tl, p.spec, t); c.restore();
    });
    carro(c, g.tu, YTU, P.you);
    c.font = "800 13px 'Barlow Condensed', Arial"; c.fillStyle = P.amber; c.textAlign = "center"; c.fillText("TU", g.tu, YTU + 40);

    if (cen.ambiente === "noite") {
      // escuro com o cone dos teus faróis; depois as luzes dos outros
      c.save(); c.fillStyle = "rgba(6,10,24,.78)"; c.beginPath(); c.rect(0, 0, W, H);
      c.moveTo(g.tu - 12, YTU - 22); c.lineTo(g.tu - 70, YTU - 250); c.lineTo(g.tu + 70, YTU - 250); c.lineTo(g.tu + 12, YTU - 22); c.closePath();
      c.fill("evenodd");
      var gr = c.createLinearGradient(0, YTU - 22, 0, YTU - 250); gr.addColorStop(0, "rgba(255,240,190,.10)"); gr.addColorStop(1, "rgba(6,10,24,.55)");
      c.fillStyle = gr; c.beginPath(); c.moveTo(g.tu - 12, YTU - 22); c.lineTo(g.tu - 70, YTU - 250); c.lineTo(g.tu + 70, YTU - 250); c.lineTo(g.tu + 12, YTU - 22); c.closePath(); c.fill();
      c.restore();
      inst.perigos.forEach(function (p) { if (!p.T.luz) return; var tl = t - p.t0, y = p.T.fixo ? p.T.yAparece : YTU - (p.d - s); c.save(); p.T.luz(c, g, y, tl, p.spec); c.restore(); });
      c.fillStyle = "#c22"; c.fillRect(g.tu - 11, YTU + 19, 6, 3); c.fillRect(g.tu + 5, YTU + 19, 6, 3);
    } else if (cen.ambiente === "chuva") {
      c.fillStyle = "rgba(70,90,120,.22)"; c.fillRect(0, 0, W, H);
      c.strokeStyle = "rgba(220,230,245,.45)"; c.lineWidth = 1.2; c.beginPath();
      for (var i = 0; i < 70; i++) { var rx = (i * 53 + Math.floor(t * 40) * 17) % W, ry = (i * 97 + t * 900) % (H + 40) - 20; c.moveTo(rx, ry); c.lineTo(rx - 3, ry + 14); }
      c.stroke();
    }
    // toques: moldura verde (acerto) ou vermelha (falso)
    (toques || []).forEach(function (tp) { var a = 1 - (t - tp.t) / 0.8; if (a > 0) { c.globalAlpha = a; c.strokeStyle = tp.ok ? P.ok : P.red; c.lineWidth = 6; c.strokeRect(3, 3, W - 6, H - 6); c.globalAlpha = 1; } });
    // tempo que falta
    c.fillStyle = "rgba(20,22,26,.7)"; rr(c, 10, 10, 64, 26, 6); c.fillStyle = P.paint; c.font = "700 16px 'Barlow Condensed', Arial"; c.textAlign = "left";
    c.fillText(Math.max(0, inst.duracao - t).toFixed(1) + " s", 20, 29);
  }

  /* ---------- tocar no botão PERIGO ---------- */
  function tocar(inst, t) {
    var r = { acerto: false, indice: -1, pontos: 0 };
    inst.perigos.forEach(function (p, i) {
      if (inst.hits[i] == null && t >= p.t0 && t <= p.t1 && !r.acerto) {
        var d = t - p.t0; inst.hits[i] = d < 1 ? 5 : d < 2 ? 3 : 1; r = { acerto: true, indice: i, pontos: inst.hits[i] };
      }
    });
    if (!r.acerto) inst.falsos++;
    return r;
  }

  var api = { W: W, H: H, TIPOS: TIPOS, ESTRADAS: ESTRADAS, preparar: preparar, desenhar: desenhar, tocar: tocar };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.CartaXMissoes = api;
})(this);
