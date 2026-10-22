/*
 * Ilustrações do jogo, todas desenhadas em SVG dentro deste arquivo
 * (nenhuma imagem externa, o jogo funciona offline).
 *
 *   ILUSTRACOES.icone("i-usestate")  -> SVG 64x64 do código (coluna da esquerda)
 *   ILUSTRACOES.cena("c-caixa-nasce") -> SVG 120x76 do efeito (coluna da direita)
 *   ILUSTRACOES.logo()               -> marca da central (tela inicial e cabeçalho)
 *   ILUSTRACOES.estrela(cheia)       -> estrela das pontuações
 */
window.ILUSTRACOES = (function () {
  "use strict";

  var K = {
    tinta: "#10213F",
    tinta2: "#41536F",
    cobalto: "#1D4ED8",
    cobaltoEsc: "#14349A",
    azul1: "#E6EEFF",
    azul2: "#BCD0FF",
    cinza1: "#F4F7FB",
    cinza2: "#D9E1EC",
    cinza3: "#8E9BB0",
    branco: "#FFFFFF",
    verde: "#12A150",
    verde1: "#DDF6E7",
    verm: "#D92D4A",
    verm1: "#FFE3E8",
    ambar: "#F2A100",
    ambarEsc: "#A86B00",
    ambar1: "#FFF0C7",
    roxo: "#7C3AED",
    rosa: "#E8365D"
  };
  var MONO = "Consolas, 'Cascadia Code', Menlo, 'Courier New', monospace";
  var SANS = "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function num(n) {
    return Math.round(n * 100) / 100;
  }

  /* ---------- primitivas ---------- */

  function R(x, y, w, h, o) {
    o = o || {};
    return (
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (o.r != null ? o.r : 3) +
      '" fill="' + (o.f || K.branco) + '" stroke="' + (o.s || K.tinta) + '" stroke-width="' + (o.sw != null ? o.sw : 1.2) + '"' +
      (o.d ? ' stroke-dasharray="' + o.d + '"' : "") +
      (o.op != null ? ' opacity="' + o.op + '"' : "") +
      (o.rot ? ' transform="rotate(' + o.rot + " " + (x + w / 2) + " " + (y + h / 2) + ')"' : "") +
      "/>"
    );
  }
  function C(cx, cy, r, o) {
    o = o || {};
    return (
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (o.f || "none") + '" stroke="' + (o.s || "none") +
      '" stroke-width="' + (o.sw != null ? o.sw : 1.2) + '"' + (o.d ? ' stroke-dasharray="' + o.d + '"' : "") +
      (o.op != null ? ' opacity="' + o.op + '"' : "") + "/>"
    );
  }
  function L(x1, y1, x2, y2, o) {
    o = o || {};
    return (
      '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (o.s || K.tinta) +
      '" stroke-width="' + (o.sw != null ? o.sw : 1.4) + '" stroke-linecap="round"' +
      (o.d ? ' stroke-dasharray="' + o.d + '"' : "") + (o.op != null ? ' opacity="' + o.op + '"' : "") + "/>"
    );
  }
  function P(d, o) {
    o = o || {};
    return (
      '<path d="' + d + '" fill="' + (o.f || "none") + '" stroke="' + (o.s || K.tinta) + '" stroke-width="' +
      (o.sw != null ? o.sw : 1.4) + '" stroke-linecap="round" stroke-linejoin="round"' +
      (o.d ? ' stroke-dasharray="' + o.d + '"' : "") + (o.op != null ? ' opacity="' + o.op + '"' : "") +
      (o.t ? ' transform="' + o.t + '"' : "") + "/>"
    );
  }
  function T(x, y, s, o) {
    o = o || {};
    return (
      '<text x="' + x + '" y="' + y + '" font-size="' + (o.t || 7) + '" font-weight="' + (o.w || 600) + '" fill="' +
      (o.f || K.tinta) + '" text-anchor="' + (o.a || "start") + '" font-family="' + (o.m ? MONO : SANS) + '"' +
      (o.rot ? ' transform="rotate(' + o.rot + " " + x + " " + y + ')"' : "") + ">" + esc(s) + "</text>"
    );
  }

  function seta(x1, y1, x2, y2, o) {
    o = o || {};
    var cor = o.s || K.cobalto;
    var ang = Math.atan2(y2 - y1, x2 - x1);
    var t = o.t || 4.5;
    var bx = x2 - Math.cos(ang) * t;
    var by = y2 - Math.sin(ang) * t;
    var px = Math.cos(ang + Math.PI / 2) * t * 0.62;
    var py = Math.sin(ang + Math.PI / 2) * t * 0.62;
    return (
      L(x1, y1, bx, by, { s: cor, sw: o.sw || 1.8, d: o.d }) +
      '<polygon points="' + num(x2) + "," + num(y2) + " " + num(bx + px) + "," + num(by + py) + " " +
      num(bx - px) + "," + num(by - py) + '" fill="' + cor + '"/>'
    );
  }

  function xis(cx, cy, r, cor) {
    cor = cor || K.verm;
    return (
      C(cx, cy, r + 2.2, { f: K.branco, s: cor, sw: 1.4 }) +
      L(cx - r * 0.55, cy - r * 0.55, cx + r * 0.55, cy + r * 0.55, { s: cor, sw: 2 }) +
      L(cx + r * 0.55, cy - r * 0.55, cx - r * 0.55, cy + r * 0.55, { s: cor, sw: 2 })
    );
  }
  function ok(cx, cy, r) {
    return (
      C(cx, cy, r + 2.2, { f: K.verde, s: K.verde, sw: 1 }) +
      P("M" + (cx - r * 0.55) + " " + cy + " L" + (cx - r * 0.1) + " " + (cy + r * 0.45) + " L" + (cx + r * 0.6) + " " + (cy - r * 0.45), { s: K.branco, sw: 1.8 })
    );
  }
  function brilho(cx, cy, r, cor) {
    cor = cor || K.ambar;
    return P(
      "M" + cx + " " + (cy - r) + " Q" + cx + " " + cy + " " + (cx + r) + " " + cy + " Q" + cx + " " + cy + " " + cx + " " + (cy + r) +
        " Q" + cx + " " + cy + " " + (cx - r) + " " + cy + " Q" + cx + " " + cy + " " + cx + " " + (cy - r) + " Z",
      { f: cor, s: cor, sw: 0.6 }
    );
  }
  function cadeado(cx, cy, s, cor) {
    s = s || 1;
    cor = cor || K.tinta;
    return (
      P("M" + (cx - 4 * s) + " " + (cy - 1 * s) + " V" + (cy - 5 * s) + " A" + 4 * s + " " + 4 * s + " 0 0 1 " + (cx + 4 * s) + " " + (cy - 5 * s) + " V" + (cy - 1 * s), { s: cor, sw: 1.6 }) +
      R(cx - 6 * s, cy - 1 * s, 12 * s, 9 * s, { r: 1.8, f: K.ambar, s: cor, sw: 1.3 }) +
      C(cx, cy + 3.4 * s, 1.3 * s, { f: cor })
    );
  }
  function toque(cx, cy, cor) {
    cor = cor || K.cobalto;
    return (
      C(cx, cy, 10, { s: cor, sw: 1, op: 0.35 }) +
      C(cx, cy, 6.5, { s: cor, sw: 1.2, op: 0.6 }) +
      C(cx, cy, 3, { f: cor, s: K.branco, sw: 1 })
    );
  }
  function tesoura(cx, cy, rot, cor) {
    cor = cor || K.tinta;
    return (
      '<g transform="translate(' + cx + " " + cy + ") rotate(" + (rot || 0) + ')">' +
      L(-1, 0, -8, -9, { s: cor, sw: 1.8 }) +
      L(1, 0, 8, -9, { s: cor, sw: 1.8 }) +
      C(-3.2, 5.5, 3.2, { s: cor, sw: 1.5, f: K.branco }) +
      C(3.2, 5.5, 3.2, { s: cor, sw: 1.5, f: K.branco }) +
      L(-1.6, 2.6, 1, -1, { s: cor, sw: 1.5 }) +
      L(1.6, 2.6, -1, -1, { s: cor, sw: 1.5 }) +
      "</g>"
    );
  }
  function borracha(cx, cy, rot) {
    return (
      '<g transform="translate(' + cx + " " + cy + ") rotate(" + (rot || -18) + ')">' +
      R(-11, -5, 22, 10, { r: 2, f: K.verm1, s: K.verm, sw: 1.3 }) +
      R(-3, -5, 14, 10, { r: 2, f: K.azul2, s: K.cobalto, sw: 1.3 }) +
      "</g>"
    );
  }
  function raio(cx, cy, s, cor) {
    s = s || 1;
    return (
      '<polygon points="' + num(cx + 2 * s) + "," + num(cy - 9 * s) + " " + num(cx - 5 * s) + "," + num(cy + 1 * s) + " " +
      num(cx - 0.5 * s) + "," + num(cy + 1 * s) + " " + num(cx - 2.5 * s) + "," + num(cy + 9 * s) + " " + num(cx + 5.5 * s) + "," +
      num(cy - 2 * s) + " " + num(cx + 0.5 * s) + "," + num(cy - 2 * s) + '" fill="' + (cor || K.ambar) + '" stroke="' + K.ambarEsc + '" stroke-width="0.9" stroke-linejoin="round"/>'
    );
  }
  function giro(cx, cy, r, cor) {
    cor = cor || K.cobalto;
    var a1 = "M" + (cx - r) + " " + cy + " A" + r + " " + r + " 0 0 1 " + (cx + r * 0.7) + " " + (cy - r * 0.7);
    var a2 = "M" + (cx + r) + " " + cy + " A" + r + " " + r + " 0 0 1 " + (cx - r * 0.7) + " " + (cy + r * 0.7);
    return (
      P(a1, { s: cor, sw: 1.8 }) +
      P(a2, { s: cor, sw: 1.8 }) +
      '<polygon points="' + num(cx + r * 0.7 + 2.5) + "," + num(cy - r * 0.7 - 2.5) + " " + num(cx + r * 0.7 - 3.2) + "," + num(cy - r * 0.7 - 2) + " " + num(cx + r * 0.7 + 0.5) + "," + num(cy - r * 0.7 + 3) + '" fill="' + cor + '"/>' +
      '<polygon points="' + num(cx - r * 0.7 - 2.5) + "," + num(cy + r * 0.7 + 2.5) + " " + num(cx - r * 0.7 + 3.2) + "," + num(cy + r * 0.7 + 2) + " " + num(cx - r * 0.7 - 0.5) + "," + num(cy + r * 0.7 - 3) + '" fill="' + cor + '"/>'
    );
  }

  /* peças do app */
  function campo(x, y, w, h, o) {
    o = o || {};
    var s = R(x, y, w, h, { r: Math.min(3, h / 3), f: K.branco, s: o.borda || K.cinza3, sw: 1 });
    var ts = o.t || Math.max(4.6, h * 0.52);
    if (o.txt) s += T(x + 3.5, y + h / 2 + ts * 0.36, o.txt, { t: ts, f: o.cor || K.tinta, w: 600 });
    else if (o.ph) s += T(x + 3.5, y + h / 2 + ts * 0.36, o.ph, { t: ts, f: "#9AA5B8", w: 500 });
    if (o.cur) {
      var cx = x + 3.5 + (o.curX != null ? o.curX : 2);
      s += L(cx, y + 2.5, cx, y + h - 2.5, { s: K.cobalto, sw: 1 });
    }
    return s;
  }
  function botao(x, y, w, h, o) {
    o = o || {};
    var ts = o.t || Math.max(4.4, h * 0.42);
    return (
      R(x, y, w, h, { r: Math.min(3, h / 3), f: o.f || K.cobalto, s: o.f || K.cobalto, sw: 0.6, op: o.op != null ? o.op : 1 }) +
      T(x + w / 2, y + h / 2 + ts * 0.35, o.txt || "+ Adicionar", { t: ts, f: K.branco, a: "middle", w: 700 })
    );
  }
  function fone(x, y, w, h) {
    return (
      R(x, y, w, h, { r: 6, f: K.branco, s: K.tinta, sw: 1.5 }) +
      R(x + w / 2 - 6, y + 2.2, 12, 2.4, { r: 1.2, f: K.tinta, s: K.tinta, sw: 0 })
    );
  }
  function alerta(x, y, w, h, o) {
    o = o || {};
    var meio = x + w / 2;
    var s = R(x, y, w, h, { r: 6, f: K.branco, s: K.tinta, sw: 1.4 });
    s += T(meio, y + 11, o.t || "Aviso", { t: 7.2, a: "middle", w: 700, f: o.corT || K.tinta });
    var m = o.m || [];
    for (var i = 0; i < m.length; i++) {
      s += T(meio, y + 21 + i * 7, m[i], { t: 5.4, a: "middle", w: 500, f: K.tinta2 });
    }
    s += L(x, y + h - 12, x + w, y + h - 12, { s: K.cinza2, sw: 1 });
    if (o.ok !== false) s += T(meio, y + h - 4, "OK", { t: 7, a: "middle", w: 700, f: K.cobalto });
    return s;
  }
  function gaveta(x, y, w, h, o) {
    o = o || {};
    var s = "";
    if (o.cont != null) {
      s += R(x + w * 0.07, y, w * 0.86, h * 0.42, { r: 2, f: K.branco, s: K.cinza3, sw: 1 });
      s += T(x + w / 2, y + h * 0.26, o.cont, { t: o.ct || 6.2, a: "middle", w: 700, m: true, f: K.tinta });
    }
    s += R(x, y + h * 0.3, w, h * 0.7, { r: 3, f: K.ambar1, s: K.ambarEsc, sw: 1.4 });
    s += L(x + 3, y + h * 0.3 + 4.5, x + w - 3, y + h * 0.3 + 4.5, { s: K.ambarEsc, sw: 0.8, op: 0.45 });
    if (o.rot != null) {
      var tw = Math.min(w - 10, o.rot.length * 3.9 + 6);
      s += R(x + w / 2 - tw / 2, y + h * 0.3 + 8, tw, 9.5, { r: 1.5, f: K.branco, s: K.ambarEsc, sw: 0.9 });
      s += T(x + w / 2, y + h * 0.3 + 15, o.rot, { t: 5.6, a: "middle", w: 700, m: true, f: K.ambarEsc });
    }
    s += R(x + w / 2 - 5, y + h - 7, 10, 3.6, { r: 1.8, f: K.ambarEsc, s: K.ambarEsc, sw: 0 });
    return s;
  }
  function arquivo(x, y, w, h, cor, nome) {
    var d = Math.min(7, w * 0.3);
    var s =
      P("M" + x + " " + y + " H" + (x + w - d) + " L" + (x + w) + " " + (y + d) + " V" + (y + h) + " H" + x + " Z", { f: K.branco, s: cor || K.cobalto, sw: 1.5 }) +
      P("M" + (x + w - d) + " " + y + " V" + (y + d) + " H" + (x + w), { f: K.azul1, s: cor || K.cobalto, sw: 1.2 });
    s += L(x + 3.5, y + h * 0.5, x + w - 3.5, y + h * 0.5, { s: K.cinza2, sw: 1.4 });
    s += L(x + 3.5, y + h * 0.66, x + w - 6, y + h * 0.66, { s: K.cinza2, sw: 1.4 });
    if (nome) s += T(x + w / 2, y + h + 7, nome, { t: 5.6, a: "middle", w: 700, f: K.tinta2 });
    return s;
  }
  function pasta(x, y, w, h, cor, nome) {
    var s =
      P("M" + x + " " + (y + 4) + " Q" + x + " " + y + " " + (x + 4) + " " + y + " H" + (x + w * 0.38) + " L" + (x + w * 0.46) + " " + (y + 4) + " H" + (x + w - 3) +
        " Q" + (x + w) + " " + (y + 4) + " " + (x + w) + " " + (y + 7) + " V" + (y + h - 3) + " Q" + (x + w) + " " + (y + h) + " " + (x + w - 3) + " " + (y + h) + " H" + (x + 3) +
        " Q" + x + " " + (y + h) + " " + x + " " + (y + h - 3) + " Z", { f: K.ambar1, s: cor || K.ambarEsc, sw: 1.4 });
    if (nome) s += T(x + w / 2, y + h / 2 + 4.2, nome, { t: 5.4, a: "middle", w: 700, f: K.ambarEsc, m: true });
    return s;
  }
  function janela(x, y, w, h, url) {
    var s = R(x, y, w, h, { r: 4, f: K.branco, s: K.tinta, sw: 1.4 });
    s += P("M" + x + " " + (y + 10) + " V" + (y + 4) + " Q" + x + " " + y + " " + (x + 4) + " " + y + " H" + (x + w - 4) + " Q" + (x + w) + " " + y + " " + (x + w) + " " + (y + 4) + " V" + (y + 10) + " Z", { f: K.cinza2, s: K.tinta, sw: 1.4 });
    s += C(x + 5, y + 5, 1.5, { f: K.verm }) + C(x + 10, y + 5, 1.5, { f: K.ambar }) + C(x + 15, y + 5, 1.5, { f: K.verde });
    if (url) {
      s += R(x + 20, y + 2.6, w - 25, 4.8, { r: 2.4, f: K.branco, s: K.cinza3, sw: 0.6 });
      s += T(x + 23, y + 6.2, url, { t: 3.8, m: true, f: K.tinta2, w: 500 });
    }
    return s;
  }
  function linhas(x, y, larguras, cor, passo) {
    var s = "";
    for (var i = 0; i < larguras.length; i++) {
      s += R(x, y + i * (passo || 6), larguras[i], 3, { r: 1.5, f: cor || K.cinza2, s: cor || K.cinza2, sw: 0 });
    }
    return s;
  }
  function tecla(x, y, letra) {
    return R(x, y, 11, 11, { r: 2.4, f: K.branco, s: K.tinta, sw: 1.2 }) + T(x + 5.5, y + 8, letra, { t: 7, a: "middle", w: 700, m: true });
  }
  function cancela(x, y, w) {
    var s = "";
    s += R(x, y - 10, 5, 22, { r: 1.5, f: K.tinta2, s: K.tinta, sw: 1 });
    var n = Math.max(3, Math.round(w / 8));
    var largura = w / n;
    s += R(x + 5, y - 3, w, 6.5, { r: 1.6, f: K.branco, s: K.tinta, sw: 1.2 });
    for (var i = 0; i < n; i += 2) {
      s += '<rect x="' + num(x + 5 + i * largura) + '" y="' + (y - 3) + '" width="' + num(largura) + '" height="6.5" fill="' + K.verm + '"/>';
    }
    s += R(x + 5, y - 3, w, 6.5, { r: 1.6, f: "none", s: K.tinta, sw: 1.2 });
    s += C(x + 2.5, y + 0.2, 1.5, { f: K.ambar, s: K.tinta, sw: 0.6 });
    return s;
  }

  /* molduras */
  function cena(inner, fundo) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 76" focusable="false" aria-hidden="true">' +
      '<rect width="120" height="76" rx="9" fill="' + (fundo || K.azul1) + '"/>' + inner + "</svg>"
    );
  }
  function icone(inner, fundo) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" focusable="false" aria-hidden="true">' +
      '<circle cx="32" cy="32" r="30.5" fill="' + (fundo || K.azul1) + '" stroke="' + K.azul2 + '" stroke-width="1.2"/>' + inner + "</svg>"
    );
  }

  /* ============================== CENAS (120 x 76) ============================== */
  var cenas = {};

  /* Estação 1 */
  cenas["c-caixa-nasce"] = function () {
    return (
      gaveta(31, 14, 58, 52, { rot: "taskName", cont: '""', ct: 8 }) +
      brilho(16, 20, 6) + brilho(104, 16, 5, K.cobalto) + brilho(100, 50, 4) + brilho(20, 54, 3.5, K.cobalto)
    );
  };
  cenas["c-entrega-texto"] = function () {
    return (
      gaveta(5, 15, 56, 52, { rot: "taskName", cont: "Comprar pão", ct: 6 }) +
      seta(64, 24, 80, 24, { s: K.cobalto }) +
      R(81, 10, 34, 28, { r: 5, f: K.branco, s: K.cobalto, sw: 1.4 }) +
      T(98, 21, "Comprar", { t: 6.4, a: "middle", f: K.tinta }) +
      T(98, 30, "pão", { t: 6.4, a: "middle", f: K.tinta }) +
      P("M88 38 L85 46 L95 38", { f: K.branco, s: K.cobalto, sw: 1.4 }) +
      T(98, 58, "lê", { t: 7, a: "middle", f: K.cobalto, w: 700 })
    );
  };
  cenas["c-troca-refaz"] = function () {
    return (
      R(4, 28, 36, 20, { r: 4, f: K.cobalto, s: K.cobaltoEsc, sw: 1.2 }) +
      T(22, 37, "setTask", { t: 5.4, a: "middle", f: K.branco, m: true }) +
      T(22, 44, "Name()", { t: 5.4, a: "middle", f: K.branco, m: true }) +
      seta(41, 38, 53, 38, { s: K.cobalto }) +
      gaveta(54, 20, 34, 40, { rot: "", cont: "novo", ct: 5.6 }) +
      seta(90, 38, 97, 38, { s: K.cobalto, t: 3.6 }) +
      giro(107, 38, 7, K.cobalto)
    );
  };
  cenas["c-muda-dentro"] = function () {
    return (
      fone(8, 5, 46, 66) +
      R(13, 14, 36, 8, { r: 2, f: K.azul1, s: K.azul1, sw: 0 }) +
      campo(13, 28, 36, 12, { cur: false }) +
      botao(13, 46, 36, 11) +
      L(60, 8, 60, 68, { s: K.cinza3, sw: 1, d: "3 3" }) +
      R(68, 24, 44, 28, { r: 3, f: K.ambar1, s: K.ambarEsc, sw: 1.3, rot: -7 }) +
      T(90, 36, "Comprar", { t: 6.6, a: "middle", rot: -7, f: K.ambarEsc }) +
      T(90, 45, "pão", { t: 6.6, a: "middle", rot: -7, f: K.ambarEsc }) +
      L(100, 14, 108, 10, { s: K.ambarEsc, sw: 1.2 }) +
      L(104, 20, 112, 18, { s: K.ambarEsc, sw: 1.2 }) +
      L(96, 58, 104, 62, { s: K.ambarEsc, sw: 1.2 })
    );
  };
  cenas["c-atribui-direto"] = function () {
    return (
      R(8, 10, 104, 24, { r: 5, f: K.tinta, s: K.tinta }) +
      T(13, 26, "taskName = 'x';", { t: 8.6, f: K.branco, m: true, w: 700 }) +
      cadeado(28, 56, 1.15) +
      T(42, 59, "const", { t: 10, f: K.tinta, m: true, w: 700 }) +
      T(78, 59, "= trava", { t: 8, f: K.tinta2, m: true, w: 600 }) +
      xis(106, 12, 5.5)
    );
  };

  /* Estação 2 */
  cenas["c-campo-mostra"] = function () {
    return (
      gaveta(4, 16, 48, 50, { rot: "taskName", cont: "Comprar pão", ct: 5.6 }) +
      seta(55, 40, 72, 40, { s: K.cobalto }) +
      T(63, 33, "value", { t: 6, a: "middle", f: K.cobalto, m: true, w: 700 }) +
      campo(73, 31, 42, 18, { txt: "Comprar pão", t: 5.6 })
    );
  };
  cenas["c-teclas-estado"] = function () {
    return (
      tecla(6, 20, "a") + tecla(19, 20, "b") + tecla(32, 20, "c") + tecla(12, 34, "d") + tecla(25, 34, "e") +
      seta(50, 36, 70, 36, { s: K.cobalto }) +
      T(60, 29, "on", { t: 6, a: "middle", f: K.cobalto, m: true, w: 700 }) +
      gaveta(71, 16, 44, 50, { rot: "taskName", cont: "abcde", ct: 6 })
    );
  };
  cenas["c-campo-travado"] = function () {
    return (
      campo(8, 38, 74, 20, {}) +
      cadeado(100, 44, 1.2) +
      tecla(10, 8, "a") + tecla(26, 8, "b") + tecla(42, 8, "c") +
      P("M15 20 Q15 30 14 34", { s: K.verm, sw: 1.3, d: "2 2" }) +
      P("M31 20 Q31 30 30 34", { s: K.verm, sw: 1.3, d: "2 2" }) +
      P("M47 20 Q47 30 46 34", { s: K.verm, sw: 1.3, d: "2 2" }) +
      xis(66, 18, 5)
    );
  };
  cenas["c-placeholder-some"] = function () {
    return (
      campo(14, 8, 92, 18, { ph: "Digite o nome da tarefa...", t: 6 }) +
      seta(60, 28, 60, 42, { s: K.cobalto }) +
      T(86, 38, "digitou", { t: 6, a: "middle", f: K.cobalto, w: 700 }) +
      campo(14, 46, 92, 18, { txt: "Comprar", t: 6.4, cur: true, curX: 33 })
    );
  };
  cenas["c-nao-limpa"] = function () {
    return (
      campo(8, 8, 104, 16, { txt: "abc", t: 6.4 }) +
      R(22, 30, 76, 14, { r: 7, f: K.cobalto, s: K.cobaltoEsc, sw: 1 }) +
      T(60, 40, "setTaskName('')", { t: 6.4, a: "middle", f: K.branco, m: true }) +
      campo(8, 52, 104, 16, { txt: "abc", t: 6.4 }) +
      xis(104, 40, 5)
    );
  };

  /* Estação 3 */
  cenas["c-toque-roda"] = function () {
    return (
      botao(6, 42, 52, 18, { txt: "+ Adicionar", t: 6.6 }) +
      toque(32, 30) +
      L(62, 51, 70, 51, { s: K.ambarEsc, sw: 1.6 }) +
      raio(75, 50, 0.9) +
      L(80, 51, 86, 51, { s: K.ambarEsc, sw: 1.6 }) +
      R(87, 36, 28, 30, { r: 5, f: K.branco, s: K.cobalto, sw: 1.5 }) +
      T(101, 56, "ƒ()", { t: 12, a: "middle", f: K.cobalto, m: true, w: 700 })
    );
  };
  cenas["c-abre-dispara"] = function () {
    return (
      fone(8, 5, 56, 66) +
      alerta(13, 20, 46, 34, { t: "Erro", corT: K.verm, m: ["campo vazio"] }) +
      toque(92, 40, K.cinza3) +
      L(82, 30, 102, 50, { s: K.verm, sw: 2 }) +
      T(92, 66, "ninguém tocou", { t: 6, a: "middle", f: K.tinta2, w: 600 })
    );
  };
  cenas["c-esmaece"] = function () {
    return (
      botao(5, 28, 46, 18, { txt: "+ Adicionar", t: 5.8 }) +
      seta(54, 37, 66, 37, { s: K.cobalto, t: 4 }) +
      botao(69, 28, 46, 18, { txt: "+ Adicionar", t: 5.8, op: 0.3 }) +
      toque(92, 50) +
      T(28, 62, "normal", { t: 6, a: "middle", f: K.tinta2, w: 600 }) +
      T(92, 66, "apertado", { t: 6, a: "middle", f: K.tinta2, w: 600 })
    );
  };
  cenas["c-efeito-seu"] = function () {
    return (
      botao(6, 26, 56, 20, { txt: "+ Adicionar", t: 6.4 }) +
      toque(34, 52) +
      T(88, 50, "{}", { t: 30, a: "middle", f: K.roxo, m: true, w: 700 }) +
      T(88, 63, "você escreve", { t: 5.6, a: "middle", f: K.tinta2, w: 600 })
    );
  };
  cenas["c-button-web"] = function () {
    return (
      janela(10, 8, 100, 60, "localhost") +
      R(34, 32, 52, 18, { r: 2.5, f: "#EFEFEF", s: "#767676", sw: 1.2 }) +
      T(60, 44, "Button", { t: 8.5, a: "middle", f: "#111111", w: 500 }) +
      xis(104, 14, 5.5)
    );
  };

  /* Estação 4 */
  cenas["c-alerta-erro"] = function () {
    return (
      alerta(22, 6, 76, 64, { t: "Erro", corT: K.verm, m: ["Por favor, digite um", "nome para a tarefa"] }) +
      P("M60 36 L68 50 L52 50 Z", { f: K.verm1, s: K.verm, sw: 1.3 }) +
      L(60, 41, 60, 46, { s: K.verm, sw: 1.5 }) +
      C(60, 48.2, 0.6, { f: K.verm, s: K.verm, sw: 0.8 })
    );
  };
  cenas["c-alerta-ok"] = function () {
    return (
      alerta(22, 6, 76, 64, { t: "Tarefa digitada", m: ["Comprar pão"] }) +
      ok(60, 42, 6.4)
    );
  };
  cenas["c-ok-auto"] = function () {
    return (
      alerta(22, 6, 76, 64, { t: "Título", m: ["Mensagem"], ok: false }) +
      R(40, 56, 40, 8, { r: 4, f: K.azul1, s: K.cobalto, sw: 1.6 }) +
      T(60, 62.4, "OK", { t: 7, a: "middle", f: K.cobalto, w: 700 }) +
      brilho(88, 54, 5) + brilho(32, 52, 4, K.cobalto) +
      T(60, 40, "(sem botões)", { t: 6, a: "middle", f: K.tinta2, w: 500 })
    );
  };
  cenas["c-web-vazio"] = function () {
    return (
      janela(8, 6, 104, 64, "localhost:8081") +
      R(20, 26, 80, 32, { r: 6, f: "none", s: K.cinza3, sw: 1.4, d: "3 3" }) +
      T(60, 46, "Alert.alert()", { t: 7, a: "middle", f: K.cinza3, m: true, w: 700 }) +
      L(24, 60, 96, 24, { s: K.verm, sw: 2 })
    );
  };
  cenas["c-espera-ok"] = function () {
    return (
      R(6, 10, 66, 9, { r: 3, f: K.cobalto, s: K.cobalto }) +
      T(10, 17, "Alert.alert(...)", { t: 5.8, f: K.branco, m: true }) +
      R(6, 25, 66, 9, { r: 3, f: K.azul2, s: K.cobalto, sw: 1 }) +
      T(10, 32, "setTaskName('')", { t: 5.8, f: K.tinta, m: true }) +
      R(6, 40, 66, 9, { r: 3, f: K.azul1, s: K.azul2, sw: 1 }) +
      seta(79, 14, 79, 36, { s: K.verde, t: 4.5 }) +
      C(98, 50, 13, { f: K.branco, s: K.tinta, sw: 1.5 }) +
      R(92.6, 43, 4, 14, { r: 1, f: K.tinta, s: K.tinta, sw: 0 }) +
      R(99.4, 43, 4, 14, { r: 1, f: K.tinta, s: K.tinta, sw: 0 }) +
      xis(111, 36, 4.2) +
      T(39, 66, "segue direto", { t: 6, a: "middle", f: K.tinta2, w: 600 })
    );
  };

  /* Estação 5 */
  cenas["c-corta-pontas"] = function () {
    return (
      R(8, 8, 104, 18, { r: 4, f: K.branco, s: K.cinza3, sw: 1 }) +
      R(11, 11, 14, 12, { r: 2, f: K.cinza2, s: K.cinza2, sw: 0 }) +
      R(95, 11, 14, 12, { r: 2, f: K.cinza2, s: K.cinza2, sw: 0 }) +
      T(60, 20.5, "Comprar pão", { t: 7.2, a: "middle" }) +
      L(26, 5, 26, 29, { s: K.verm, sw: 1.1, d: "2 2" }) +
      L(94, 5, 94, 29, { s: K.verm, sw: 1.1, d: "2 2" }) +
      tesoura(26, 36, 180, K.tinta) + tesoura(94, 36, 180, K.tinta) +
      seta(60, 40, 60, 50, { s: K.cobalto, t: 4 }) +
      campo(26, 52, 68, 16, { txt: "Comprar pão", t: 6.6 })
    );
  };
  cenas["c-vazio-falso"] = function () {
    return (
      R(5, 28, 24, 20, { r: 4, f: K.branco, s: K.cinza3, sw: 1.2 }) +
      T(17, 43, '""', { t: 12, a: "middle", m: true, w: 700 }) +
      seta(30, 38, 38, 38, { s: K.cobalto, t: 3.6 }) +
      R(39, 30, 26, 16, { r: 8, f: K.verm1, s: K.verm, sw: 1.3 }) +
      T(52, 41.4, "false", { t: 7.4, a: "middle", f: K.verm, m: true, w: 700 }) +
      C(73, 38, 6, { f: K.cobalto, s: K.cobalto }) +
      T(73, 42.8, "!", { t: 11, a: "middle", f: K.branco, w: 700 }) +
      seta(80, 38, 87, 38, { s: K.cobalto, t: 3.6 }) +
      R(88, 30, 26, 16, { r: 8, f: K.verde1, s: K.verde, sw: 1.3 }) +
      T(101, 41.4, "true", { t: 7.4, a: "middle", f: K.verde, m: true, w: 700 }) +
      T(60, 66, "cai no erro", { t: 6.4, a: "middle", f: K.tinta2, w: 600 })
    );
  };
  cenas["c-cancela"] = function () {
    return (
      R(6, 7, 70, 8, { r: 3, f: K.cobalto, s: K.cobalto }) +
      R(6, 19, 70, 8, { r: 3, f: K.cobalto, s: K.cobalto }) +
      seta(84, 8, 84, 25, { s: K.verde, t: 4 }) + T(91, 19, "roda", { t: 6, f: K.verde, w: 700 }) +
      cancela(6, 36, 90) +
      R(6, 47, 70, 8, { r: 3, f: "none", s: K.cinza3, sw: 1, d: "3 2" }) +
      R(6, 59, 70, 8, { r: 3, f: "none", s: K.cinza3, sw: 1, d: "3 2" }) +
      T(98, 64, "não roda", { t: 6, a: "middle", f: K.tinta2, w: 600 })
    );
  };
  cenas["c-campo-limpo"] = function () {
    return (
      campo(14, 7, 92, 17, { txt: "Comprar pão", t: 6.6 }) +
      borracha(60, 36, -12) +
      brilho(88, 36, 5, K.cobalto) +
      seta(60, 44, 60, 52, { s: K.cobalto, t: 3.6 }) +
      campo(14, 54, 92, 17, { cur: true, curX: 0 })
    );
  };
  cenas["c-corta-meio"] = function () {
    return (
      R(8, 14, 104, 18, { r: 4, f: K.branco, s: K.cinza3, sw: 1 }) +
      T(54, 26.5, "Comprar", { t: 7.2, a: "end" }) +
      T(66, 26.5, "pão", { t: 7.2, a: "start" }) +
      R(55.5, 17, 9, 12, { r: 1.5, f: K.verm1, s: K.verm, sw: 0.9, d: "1.6 1.6" }) +
      tesoura(60, 46, 180, K.tinta) +
      xis(100, 48, 6) +
      T(32, 62, "o meio fica", { t: 6.4, a: "middle", f: K.tinta2, w: 600 })
    );
  };

  /* Estação 6 */
  cenas["c-export"] = function () {
    return (
      arquivo(7, 12, 34, 42, K.cobalto, "TaskInput") +
      R(41, 27, 22, 12, { r: 4, f: K.cobalto, s: K.cobaltoEsc, sw: 1 }) +
      T(52, 35.6, "export", { t: 5.8, a: "middle", f: K.branco, m: true }) +
      seta(63, 33, 79, 33, { s: K.cobalto }) +
      arquivo(82, 6, 26, 28, K.cinza3, null) +
      arquivo(82, 42, 26, 28, K.cinza3, null) +
      L(70, 33, 76, 20, { s: K.cobalto, sw: 1.4 }) +
      L(70, 33, 76, 56, { s: K.cobalto, sw: 1.4 })
    );
  };
  cenas["c-import-sobe"] = function () {
    return (
      pasta(40, 4, 40, 18, null, "src") +
      pasta(6, 44, 46, 24, null, "screens") +
      pasta(68, 44, 46, 24, null, "components") +
      L(29, 44, 29, 14, { s: K.cobalto, sw: 1.8 }) +
      L(29, 14, 40, 14, { s: K.cobalto, sw: 1.8 }) +
      L(80, 13, 91, 13, { s: K.cobalto, sw: 1.8 }) +
      seta(91, 13, 91, 43, { s: K.cobalto }) +
      T(18, 31, "../", { t: 8, a: "middle", f: K.cobalto, m: true, w: 700 })
    );
  };
  cenas["c-na-tela"] = function () {
    return (
      T(4, 27, "<TaskInput />", { t: 5.8, m: true, f: K.cobalto, w: 700 }) +
      seta(24, 31, 56, 36, { s: K.cobalto, t: 4 }) +
      fone(58, 4, 56, 68) +
      R(63, 14, 46, 30, { r: 3, f: K.azul1, s: K.cobalto, sw: 1.4, d: "2.5 2" }) +
      campo(66, 21, 40, 8, { t: 4 }) +
      botao(66, 32, 40, 8, { txt: "+ Adicionar", t: 3.6 }) +
      R(63, 48, 46, 7, { r: 2, f: K.cinza1, s: K.cinza2, sw: 1 }) +
      R(63, 58, 46, 8, { r: 2, f: K.cinza1, s: K.cinza2, sw: 1 })
    );
  };
  cenas["c-sem-props"] = function () {
    return (
      R(48, 10, 66, 56, { r: 6, f: K.branco, s: K.cobalto, sw: 1.6 }) +
      T(81, 24, "TaskInput", { t: 7, a: "middle", f: K.cobalto, m: true, w: 700 }) +
      campo(54, 31, 54, 9, { t: 4 }) +
      botao(54, 44, 54, 9, { txt: "+ Adicionar", t: 4 }) +
      R(43, 28, 5, 24, { r: 1.5, f: K.verm, s: K.verm, sw: 0 }) +
      R(4, 22, 34, 12, { r: 3, f: K.ambar1, s: K.ambarEsc, sw: 1.1 }) +
      T(21, 30.2, 'nome="x"', { t: 5.8, a: "middle", f: K.ambarEsc, m: true }) +
      P("M24 36 Q34 46 22 50", { s: K.verm, sw: 1.3, d: "2 2" }) +
      xis(14, 54, 4.6)
    );
  };
  cenas["c-lista"] = function () {
    return (
      fone(34, 4, 52, 68) +
      T(60, 18, "Lista", { t: 6.4, a: "middle" }) +
      R(40, 24, 40, 9, { r: 2, f: "none", s: K.cinza3, sw: 1, d: "2.5 2" }) +
      R(40, 37, 40, 9, { r: 2, f: "none", s: K.cinza3, sw: 1, d: "2.5 2" }) +
      T(60, 44, "?", { t: 9, a: "middle", f: K.cinza3, w: 700 }) +
      T(60, 31, "?", { t: 9, a: "middle", f: K.cinza3, w: 700 }) +
      alerta(4, 36, 42, 34, { t: "Tarefa", m: ["Comprar pão"] }) +
      xis(100, 48, 6)
    );
  };

  /* ============================== ÍCONES (64 x 64) ============================== */
  var icones = {};

  icones["i-usestate"] = function () {
    return gaveta(8, 10, 48, 46, { rot: "state", ct: 6 }) + brilho(52, 14, 5) + brilho(12, 18, 3.5, K.cobalto);
  };
  icones["i-taskname"] = function () {
    return (
      P("M14 32 L30 14 H50 V34 L34 52 Z", { f: K.ambar1, s: K.ambarEsc, sw: 1.8 }) +
      C(41, 22, 3, { f: K.branco, s: K.ambarEsc, sw: 1.5 }) +
      T(33, 40, "Aa", { t: 11, a: "middle", f: K.ambarEsc, w: 700, rot: -45 })
    );
  };
  icones["i-settaskname"] = function () {
    return (
      R(14, 40, 36, 10, { r: 3, f: K.ambar1, s: K.ambarEsc, sw: 1.6 }) +
      L(20, 45, 44, 45, { s: K.ambarEsc, sw: 1.4 }) +
      seta(32, 12, 32, 38, { s: K.cobalto, sw: 3, t: 8 }) +
      R(24, 8, 16, 7, { r: 2, f: K.cobalto, s: K.cobalto })
    );
  };
  icones["i-let"] = function () {
    return (
      R(14, 14, 36, 34, { r: 3, f: K.ambar1, s: K.ambarEsc, sw: 1.6, rot: -8 }) +
      T(32, 36, "let", { t: 14, a: "middle", f: K.ambarEsc, m: true, w: 700, rot: -8 }) +
      L(10, 52, 18, 56, { s: K.cinza3, sw: 1.6 }) + L(46, 56, 54, 52, { s: K.cinza3, sw: 1.6 })
    );
  };
  icones["i-value"] = function () {
    return gaveta(5, 22, 26, 28, { ct: 5 }) + seta(32, 36, 42, 36, { s: K.cobalto, t: 5 }) + campo(43, 28, 17, 16, { txt: "ab", t: 6 });
  };
  icones["i-onchange"] = function () {
    return tecla(5, 30, "a") + seta(18, 36, 33, 36, { s: K.cobalto, t: 5 }) + gaveta(34, 22, 26, 28, { ct: 5 });
  };
  icones["i-valuesem"] = function () {
    return (
      seta(8, 22, 54, 22, { s: K.cobalto, sw: 2.4, t: 6 }) +
      L(54, 42, 36, 42, { s: K.cobalto, sw: 2.4 }) +
      L(24, 42, 10, 42, { s: K.cobalto, sw: 2.4, d: "2 4" }) +
      tesoura(30, 42, 90) +
      brilho(30, 52, 3, K.ambar)
    );
  };
  icones["i-placeholder"] = function () {
    return campo(7, 22, 50, 20, { ph: "Aa...", t: 8 }) + L(11, 25, 11, 39, { s: K.cobalto, sw: 1.2 });
  };
  icones["i-onpress"] = function () {
    return (
      R(8, 22, 18, 20, { r: 4, f: K.cinza2, s: K.tinta, sw: 1.6 }) +
      L(26, 28, 31, 28, { s: K.tinta, sw: 2 }) + L(26, 36, 31, 36, { s: K.tinta, sw: 2 }) +
      R(31, 20, 22, 24, { r: 4, f: K.cobalto, s: K.cobaltoEsc, sw: 1.6 }) +
      L(53, 32, 58, 32, { s: K.tinta, sw: 2 })
    );
  };
  icones["i-onpresscall"] = function () {
    return raio(25, 32, 2.1) + T(47, 41, "()", { t: 20, a: "middle", f: K.verm, m: true, w: 700 });
  };
  icones["i-touchable"] = function () {
    return botao(6, 22, 44, 20, { txt: "Toque", t: 8, op: 0.45 }) + toque(44, 44);
  };
  icones["i-pressable"] = function () {
    return botao(5, 20, 38, 20, { txt: "Toque", t: 8 }) + toque(36, 42) + T(51, 22, "{}", { t: 13, a: "middle", f: K.roxo, m: true, w: 700 });
  };
  icones["i-alerterro"] = function () {
    return (
      R(10, 12, 44, 40, { r: 6, f: K.branco, s: K.tinta, sw: 1.8 }) +
      P("M32 18 L43 38 L21 38 Z", { f: K.verm1, s: K.verm, sw: 2 }) +
      L(32, 25, 32, 31, { s: K.verm, sw: 2.2 }) + C(32, 34.4, 1, { f: K.verm, s: K.verm, sw: 1 }) +
      L(10, 42, 54, 42, { s: K.cinza2, sw: 1.2 }) +
      T(32, 49.5, "OK", { t: 7, a: "middle", f: K.cobalto, w: 700 })
    );
  };
  icones["i-alertok"] = function () {
    return (
      R(10, 12, 44, 40, { r: 6, f: K.branco, s: K.tinta, sw: 1.8 }) +
      ok(32, 28, 7.5) +
      L(10, 42, 54, 42, { s: K.cinza2, sw: 1.2 }) +
      T(32, 49.5, "OK", { t: 7, a: "middle", f: K.cobalto, w: 700 })
    );
  };
  icones["i-semBotoes"] = function () {
    return (
      R(10, 10, 44, 36, { r: 6, f: K.branco, s: K.tinta, sw: 1.8 }) +
      linhas(17, 18, [30, 22], K.cinza2, 7) +
      R(19, 33, 26, 10, { r: 5, f: K.azul1, s: K.cobalto, sw: 1.8 }) +
      T(32, 41, "OK", { t: 7.4, a: "middle", f: K.cobalto, w: 700 }) +
      brilho(52, 50, 5) + brilho(12, 52, 3.5, K.cobalto)
    );
  };
  icones["i-web"] = function () {
    return (
      C(32, 32, 19, { f: K.branco, s: K.tinta, sw: 1.8 }) +
      '<ellipse cx="32" cy="32" rx="8" ry="19" fill="none" stroke="' + K.tinta + '" stroke-width="1.5"/>' +
      L(13, 32, 51, 32, { s: K.tinta, sw: 1.5 }) +
      P("M16 22 H48 M16 42 H48", { s: K.tinta, sw: 1.3 }) +
      L(14, 50, 50, 14, { s: K.verm, sw: 3 })
    );
  };
  icones["i-trim"] = function () {
    return tesoura(32, 40, 0, K.tinta).replace("translate(32 40)", "translate(32 38) scale(2.1)") + "";
  };
  icones["i-if"] = function () {
    return (
      P("M32 8 L56 32 L32 56 L8 32 Z", { f: K.azul1, s: K.cobalto, sw: 2 }) +
      T(32, 41, "?", { t: 26, a: "middle", f: K.cobalto, w: 700 })
    );
  };
  icones["i-return"] = function () {
    return cancela(6, 32, 50).replace(/\n/g, "") + T(32, 54, "return", { t: 9, a: "middle", f: K.verm, m: true, w: 700 });
  };
  icones["i-limpa"] = function () {
    return borracha(32, 32, -20).replace("translate(32 32)", "translate(32 32) scale(1.7)") + brilho(48, 14, 5, K.cobalto) + brilho(14, 50, 3.5);
  };
  icones["i-export"] = function () {
    return (
      R(8, 22, 30, 30, { r: 4, f: K.branco, s: K.tinta, sw: 1.8 }) +
      seta(24, 38, 54, 12, { s: K.cobalto, sw: 3.2, t: 8 }) +
      T(23, 46, "TSX", { t: 7.4, a: "middle", f: K.tinta2, m: true, w: 700 })
    );
  };
  icones["i-import"] = function () {
    return (
      R(26, 22, 30, 30, { r: 4, f: K.branco, s: K.tinta, sw: 1.8 }) +
      seta(8, 12, 36, 36, { s: K.cobalto, sw: 3.2, t: 8 }) +
      T(41, 46, "TSX", { t: 7.4, a: "middle", f: K.tinta2, m: true, w: 700 })
    );
  };
  icones["i-jsx"] = function () {
    return T(32, 40, "</>", { t: 24, a: "middle", f: K.cobalto, m: true, w: 700 });
  };
  icones["i-fc"] = function () {
    return (
      P("M10 24 H44 L56 32 L44 40 H10 Z", { f: K.cobalto, s: K.cobaltoEsc, sw: 1.8 }) +
      T(28, 37, "FC", { t: 13, a: "middle", f: K.branco, m: true, w: 700 }) +
      T(47, 54, "{}", { t: 11, a: "middle", f: K.cinza3, m: true, w: 700 }) +
      L(40, 58, 54, 46, { s: K.verm, sw: 2.2 })
    );
  };

  /* ---------- marca e estrela ---------- */
  function logo() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" focusable="false" aria-hidden="true">' +
      R(3, 3, 42, 42, { r: 10, f: K.cobalto, s: K.cobaltoEsc, sw: 1.4 }) +
      C(14, 17, 4.2, { f: K.branco, s: K.branco }) + C(14, 31, 4.2, { f: K.branco, s: K.branco }) +
      C(34, 17, 4.2, { f: K.branco, s: K.branco }) + C(34, 31, 4.2, { f: K.branco, s: K.branco }) +
      P("M14 17 C24 17 24 31 34 31", { s: "#FFC23D", sw: 3 }) +
      P("M14 31 C24 31 24 17 34 17", { s: "#FF6B8B", sw: 3 }) +
      "</svg>"
    );
  }
  function estrela(cheia) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false" aria-hidden="true">' +
      '<path d="M12 2.8l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 17l-5.8 3.3 1.4-6.4-4.9-4.4 6.5-.7z" fill="' + (cheia ? "#F2A100" : "none") +
      '" stroke="' + (cheia ? "#A86B00" : "#8E9BB0") + '" stroke-width="1.5" stroke-linejoin="round"/></svg>'
    );
  }

  /* ---------- ilustração grande da tela inicial ---------- */
  function heroi() {
    var codigos = ["useState('')", "value={taskName}", "onPress={handleAddTask}", "taskName.trim()"];
    var cenasHeroi = ["c-caixa-nasce", "c-campo-mostra", "c-toque-roda", "c-corta-pontas"];
    var yC = [52, 130, 208, 286];
    var s2 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 410" focusable="false" aria-hidden="true">';
    s2 += R(6, 14, 214, 372, { r: 18, f: "#F6F8FC", s: "#B9C5D6", sw: 2 });
    s2 += R(380, 14, 214, 372, { r: 18, f: "#F6F8FC", s: "#B9C5D6", sw: 2 });
    var i;
    for (i = 0; i < 4; i++) {
      s2 += R(20, yC[i], 188, 64, { r: 10, f: K.branco, s: "#B9C5D6", sw: 1.6 });
      s2 += T(32, yC[i] + 37, codigos[i], { t: 11, m: true, w: 700, f: K.tinta });
    }
    var origem = [yC[0] + 32, yC[1] + 32, yC[2] + 32, yC[3] + 32];
    var destino = [yC[2] + 32, yC[0] + 32, yC[3] + 32, yC[1] + 32];
    var cores = ["#E8365D", "#F59E0B", "#0EA5A4", "#7C3AED"];
    var ordemDir = [cenasHeroi[1], cenasHeroi[3], cenasHeroi[0], cenasHeroi[2]];
    for (i = 0; i < 4; i++) {
      s2 += R(392, yC[i], 190, 64, { r: 10, f: K.branco, s: "#B9C5D6", sw: 1.6 });
      s2 += '<svg x="398" y="' + (yC[i] + 4) + '" width="100" height="56" viewBox="0 0 120 76">' +
        '<rect width="120" height="76" rx="9" fill="' + K.azul1 + '"/>' + cenas[ordemDir[i]]() + "</svg>";
    }
    /* cabos: esquerda i liga a direita j, de modo que cada código encontre seu efeito */
    var destinoLinha = [2, 0, 3, 1]; /* useState -> caixa (ordemDir[2]); value -> campo (ordemDir[0]); onPress -> toque (ordemDir[3]); trim -> pontas (ordemDir[1]) */
    for (i = 0; i < 4; i++) {
      var y1 = origem[i];
      var y2 = yC[destinoLinha[i]] + 32;
      var cor = cores[i];
      var caminho = "M214," + y1 + " C300," + (y1 + 46) + " 296," + (y2 + 46) + " 386," + y2;
      s2 += '<path d="' + caminho + '" fill="none" stroke="#10213F" stroke-opacity=".16" stroke-width="12" stroke-linecap="round" transform="translate(0 4)"/>';
      s2 += '<path d="' + caminho + '" fill="none" stroke="' + cor + '" stroke-width="7" stroke-linecap="round"/>';
      s2 += '<path d="' + caminho + '" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round" transform="translate(0 -1.5)"/>';
      s2 += R(204, y1 - 8, 18, 16, { r: 4, f: cor, s: K.tinta, sw: 1.6 });
      s2 += R(378, y2 - 8, 18, 16, { r: 4, f: cor, s: K.tinta, sw: 1.6 });
      s2 += C(208, y1, 3, { f: K.branco });
      s2 += C(392, y2, 3, { f: K.branco });
    }
    s2 += "</svg>";
    return s2;
  }

  return {
    cores: K,
    icone: function (chave) {
      var f = icones[chave];
      if (!f) throw new Error("Ícone inexistente: " + chave);
      return icone(f());
    },
    cena: function (chave) {
      var f = cenas[chave];
      if (!f) throw new Error("Cena inexistente: " + chave);
      return cena(f());
    },
    chavesIcones: function () {
      return Object.keys(icones);
    },
    chavesCenas: function () {
      return Object.keys(cenas);
    },
    logo: logo,
    heroi: heroi,
    estrela: estrela
  };
})();
