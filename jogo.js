/*
 * Central de Conexões do TaskInput: lógica do jogo.
 *
 * Fluxo: tela inicial -> 6 estações (ligar códigos a efeitos com cabos) -> tela final.
 * O conteúdo está em dados.js, os desenhos em ilustracoes.js e o celular
 * simulado em celular.js. Este arquivo cuida de cabos, dicas, desfazer,
 * tutorial, janelas, pontuação e telas.
 *
 * Nada é gravado no navegador (sem localStorage): fechar a página zera o jogo.
 */
(function () {
  "use strict";

  var D = window.DADOS;
  var IL = window.ILUSTRACOES;
  var CEL = window.CELULAR;

  /* ------------------------------------------------------------ utilidades */

  function $(sel, raiz) {
    return (raiz || document).querySelector(sel);
  }
  function $$(sel, raiz) {
    return Array.prototype.slice.call((raiz || document).querySelectorAll(sel));
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  /* texto com `trechos de código` */
  function md(s) {
    return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  function umaLinha(s) {
    return String(s).replace(/\s*\n\s*/g, " ");
  }
  function rng(semente) {
    var a = semente >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function embaralhar(lista, r) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  /* ------------------------------------------------------------ estado */

  var N = D.estacoes.length;
  var S = {
    fase: "inicio",
    est: 0,
    dicasMax: D.dicasPadrao,
    ilimitadas: false,
    dicasUsadas: 0,
    resultados: [],
    ligacoes: [],
    errosEst: 0,
    dicasEst: 0,
    dicaNivel: {},
    sel: null,
    ponta: null,
    arrasto: null,
    alvo: null,
    cabosErro: null,
    novoCabo: null,
    concluindo: false,
    suprimirClick: false,
    notaPendente: null,
    pedirTutorial: true
  };
  var modalAtual = null;
  var ordens = [];
  var timerToast = null;
  var timerConclusao = null;

  /* ordem fixa (por semente) dos cartões de cada estação, sem pares na mesma linha */
  function preparaOrdens() {
    for (var i = 0; i < N; i++) {
      var est = D.estacoes[i];
      var r = rng(4100 + i * 97);
      var c = embaralhar(est.conceitos.map(function (x) { return x.id; }), r);
      var e;
      var tentativas = 0;
      do {
        e = embaralhar(est.efeitos.map(function (x) { return x.id; }), r);
        tentativas++;
      } while (pontosFixos(est, c, e) > 1 && tentativas < 200);
      ordens.push({ c: c, e: e });
    }
  }
  function pontosFixos(est, ordC, ordE) {
    var n = 0;
    for (var i = 0; i < ordC.length; i++) {
      var conc = est.conceitos.filter(function (x) { return x.id === ordC[i]; })[0];
      if (ordE[i] === conc.efeito) n++;
    }
    return n;
  }

  function estacao() {
    return D.estacoes[S.est];
  }
  function conceito(id) {
    return estacao().conceitos.filter(function (c) { return c.id === id; })[0];
  }
  function efeito(id) {
    return estacao().efeitos.filter(function (e) { return e.id === id; })[0];
  }
  function noDe(lado, id) {
    return $('.no[data-lado="' + lado + '"][data-id="' + id + '"]');
  }
  function ligacaoDoConceito(id) {
    return S.ligacoes.filter(function (l) { return l.c === id; })[0];
  }

  /* ------------------------------------------------------------ avisos */

  function anunciar(txt) {
    var a = $("#anuncio");
    a.textContent = "";
    setTimeout(function () {
      a.textContent = txt;
    }, 30);
  }

  function aviso(txt) {
    var t = $("#toast");
    t.textContent = txt;
    t.hidden = false;
    clearTimeout(timerToast);
    timerToast = setTimeout(function () {
      t.hidden = true;
    }, 3600);
    anunciar(txt);
  }

  /* ------------------------------------------------------------ janelas */

  function abrirModal(op) {
    fecharModal(true);
    var camada = $("#camada-modal");
    camada.innerHTML =
      '<div class="modal ' + (op.classe || "") + '" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">' +
      '<div class="modal-corpo">' + op.html + "</div>" +
      '<div class="modal-botoes"></div></div>';
    var area = $(".modal-botoes", camada);
    var primario = null;
    (op.botoes || []).forEach(function (b) {
      var el = document.createElement("button");
      el.type = "button";
      el.className = "botao" + (b.primario ? " botao-primario" : "");
      el.textContent = b.rotulo;
      el.addEventListener("click", function () {
        b.aoClicar();
      });
      area.appendChild(el);
      if (b.primario) primario = el;
    });
    modalAtual = { op: op, anterior: document.activeElement };
    camada.hidden = false;
    var foco = primario || $(".botao", area);
    if (foco) foco.focus();
    var corpo = $(".modal-corpo", camada);
    if (corpo) corpo.scrollTop = 0;
  }

  function fecharModal(semFoco) {
    var camada = $("#camada-modal");
    if (!modalAtual) {
      camada.hidden = true;
      return;
    }
    var anterior = modalAtual.anterior;
    modalAtual = null;
    camada.hidden = true;
    camada.innerHTML = "";
    if (!semFoco && anterior && document.body.contains(anterior)) {
      try {
        anterior.focus({ preventScroll: true });
      } catch (e) {
        /* sem foco, tudo bem */
      }
    }
  }

  function prenderFoco(e) {
    if (!modalAtual || e.key !== "Tab") return;
    var foco = $$("button, [href], input, select, textarea", $("#camada-modal")).filter(function (x) { return !x.disabled; });
    if (!foco.length) return;
    var primeiro = foco[0];
    var ultimo = foco[foco.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  }

  /* ------------------------------------------------------------ telas */

  function mostrarTela(qual) {
    $("#tela-inicio").hidden = qual !== "inicio";
    $("#tela-jogo").hidden = qual !== "jogo";
    $("#tela-fim").hidden = qual !== "fim";
    S.fase = qual;
    window.scrollTo(0, 0);
  }

  function comecar(e) {
    if (e) e.preventDefault();
    var ilimitada = $('input[name="dicas"]:checked').value === "ilimitada";
    S.ilimitadas = ilimitada;
    S.dicasUsadas = 0;
    S.resultados = [];
    S.pedirTutorial = $("#opt-tutorial").checked;
    mostrarTela("jogo");
    iniciarEstacao(0);
    if (S.pedirTutorial) tutIniciar();
  }

  function reiniciar() {
    tutFim();
    fecharModal(true);
    S.resultados = [];
    S.dicasUsadas = 0;
    mostrarTela("inicio");
    $("#btn-comecar").focus();
  }

  /* ------------------------------------------------------------ estação */

  function iniciarEstacao(i) {
    clearTimeout(timerConclusao);
    S.est = i;
    S.ligacoes = [];
    S.errosEst = 0;
    S.dicasEst = 0;
    S.dicaNivel = {};
    S.sel = null;
    S.ponta = null;
    S.arrasto = null;
    S.alvo = null;
    S.cabosErro = null;
    S.novoCabo = null;
    S.concluindo = false;
    S.notaPendente = null;
    var est = estacao();

    $("#est-nome").textContent = "Estação " + (i + 1) + ": " + est.nome;
    $("#est-missao").innerHTML = md(est.missao);

    var colC = $("#col-conceitos");
    var colE = $("#col-efeitos");
    colC.innerHTML = "";
    colE.innerHTML = "";
    ordens[i].c.forEach(function (id) {
      colC.appendChild(cartaoConceito(est.conceitos.filter(function (c) { return c.id === id; })[0]));
    });
    ordens[i].e.forEach(function (id) {
      colE.appendChild(cartaoEfeito(est.efeitos.filter(function (e) { return e.id === id; })[0]));
    });

    CEL.configurar(est.base, { raiox: i === N - 1 ? "arquivos" : "memoria" });
    desenharLeds();
    limparDica();
    limparNota();
    atualizarCabecalho();
    atualizarBotoes();
    desenharCabos();
    requestAnimationFrame(desenharCabos);
    var primeiro = $(".no-conceito");
    if (primeiro) primeiro.focus({ preventScroll: true });
    anunciar("Estação " + (i + 1) + " de " + N + ": " + est.nome);
  }

  function cartaoConceito(c) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "no no-conceito";
    b.dataset.lado = "c";
    b.dataset.id = c.id;
    b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", "Código: " + umaLinha(c.codigo) + ". " + c.rotulo + ".");
    b.innerHTML =
      '<span class="no-icone">' + IL.icone(c.icone) + "</span>" +
      '<span class="no-texto"><span class="no-rotulo">' + esc(c.rotulo) + '</span><code class="no-codigo">' + esc(c.codigo) + "</code></span>" +
      '<span class="jack"></span>';
    return b;
  }

  function cartaoEfeito(e) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "no no-efeito";
    b.dataset.lado = "e";
    b.dataset.id = e.id;
    b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", "Efeito: " + e.titulo + ".");
    b.innerHTML =
      '<span class="jack"></span>' +
      '<span class="no-cena">' + IL.cena(e.cena) + "</span>" +
      '<span class="no-titulo">' + esc(e.titulo) + "</span>";
    return b;
  }

  function atualizarCabecalho() {
    var passos = $("#passos");
    passos.innerHTML = "";
    for (var i = 0; i < N; i++) {
      var li = document.createElement("li");
      var r = S.resultados[i];
      li.className = "passo" + (i === S.est ? " atual" : "") + (r ? " feito" : "");
      li.textContent = String(i + 1);
      li.title = "Estação " + (i + 1) + ": " + D.estacoes[i].nome + (r ? " (" + r.estrelas + (r.estrelas === 1 ? " estrela" : " estrelas") + ")" : "");
      if (i === S.est) li.setAttribute("aria-current", "step");
      passos.appendChild(li);
    }
    var total = 0;
    S.resultados.forEach(function (r) {
      if (r) total += r.estrelas;
    });
    var dicas = S.ilimitadas ? "Dicas ilimitadas" : "Dicas: " + Math.max(0, S.dicasMax - S.dicasUsadas) + " de " + S.dicasMax;
    $("#topo-info").innerHTML = "<span>" + dicas + '</span><span><span class="mini-estrela">' + IL.estrela(true) + "</span>" + total + "</span>";
  }

  function atualizarBotoes() {
    var restantes = S.ilimitadas ? Infinity : S.dicasMax - S.dicasUsadas;
    var bd = $("#btn-dica");
    bd.textContent = S.ilimitadas ? "Dica" : "Dica (" + Math.max(0, restantes) + ")";
    bd.disabled = false;
    bd.title = "Pede uma pista sobre um código (tecla H)";
    $("#btn-desfazer").disabled = !S.ligacoes.length;
    $("#btn-desfazer").title = "Retira o último cabo (tecla Z)";
  }

  function desenharLeds() {
    var el = CEL.elementos().leds;
    var ligadas = {};
    S.ligacoes.forEach(function (l) {
      var c = conceito(l.c);
      if (c.liga && c.liga.chave) ligadas[c.liga.chave] = true;
    });
    el.innerHTML = estacao()
      .leds.map(function (led) {
        return '<span class="led' + (ligadas[led.chave] ? " on" : "") + '">' + esc(led.rotulo) + "</span>";
      })
      .join("");
  }

  /* ------------------------------------------------------------ cabos */

  function centro(no) {
    var j = $(".jack", no);
    var r = j.getBoundingClientRect();
    var m = $("#mesa").getBoundingClientRect();
    return { x: r.left + r.width / 2 - m.left, y: r.top + r.height / 2 - m.top };
  }

  function caminho(a, b) {
    if (a.x > b.x) {
      var t = a;
      a = b;
      b = t;
    }
    var dist = Math.abs(b.x - a.x);
    var dx = Math.max(36, dist * 0.45);
    var pende = 22 + dist * 0.1;
    return "M" + a.x + "," + a.y + " C" + (a.x + dx) + "," + (a.y + pende) + " " + (b.x - dx) + "," + (b.y + pende) + " " + b.x + "," + b.y;
  }

  function cabo(a, b, cor, classe) {
    var d = caminho(a, b);
    return (
      '<g class="' + (classe || "") + '">' +
      '<path class="cabo-sombra" d="' + d + '" transform="translate(0 4)"/>' +
      '<path class="cabo-fio" d="' + d + '" stroke="' + cor + '"/>' +
      '<path class="cabo-brilho" d="' + d + '" transform="translate(0 -1.6)"/>' +
      plugue(a, cor) + plugue(b, cor) +
      "</g>"
    );
  }

  function plugue(p, cor) {
    return '<rect class="plugue" x="' + (p.x - 11) + '" y="' + (p.y - 9) + '" width="22" height="18" rx="5" fill="' + cor + '"/><circle cx="' + p.x + '" cy="' + p.y + '" r="3.2" fill="#fff"/>';
  }

  function desenharCabos() {
    var svg = $("#cabos");
    if (!svg || S.fase !== "jogo") return;
    var h = "";
    S.ligacoes.forEach(function (l) {
      var a = noDe("c", l.c);
      var b = noDe("e", l.e);
      if (!a || !b) return;
      h += cabo(centro(a), centro(b), l.cor, S.novoCabo === l.c ? "cabo-entra" : "");
    });
    if (S.cabosErro) {
      var ea = noDe("c", S.cabosErro.c);
      var eb = noDe("e", S.cabosErro.e);
      if (ea && eb) h += cabo(centro(ea), centro(eb), "#d92d4a", "cabo-erro");
    }
    if (S.sel) {
      var origem = centro(S.sel);
      var destino = S.ponta;
      if (S.alvo) destino = centro(S.alvo);
      if (!destino) {
        var dir = S.sel.dataset.lado === "c" ? 1 : -1;
        destino = { x: origem.x + dir * 80, y: origem.y + 38 };
      }
      h += cabo(origem, destino, "#1d4ed8", "cabo-provisorio");
    }
    svg.innerHTML = h;
  }

  function posicaoNaMesa(e) {
    var m = $("#mesa").getBoundingClientRect();
    return { x: e.clientX - m.left, y: e.clientY - m.top };
  }

  /* ------------------------------------------------------------ seleção e arrasto */

  function bloqueado() {
    return S.concluindo || !!modalAtual;
  }

  function selecionar(no) {
    limparSelecao();
    S.sel = no;
    no.classList.add("selecionado");
    no.setAttribute("aria-pressed", "true");
    desenharCabos();
    anunciar((no.dataset.lado === "c" ? "Código" : "Efeito") + " selecionado. Escolha agora um item da outra coluna.");
  }

  function limparSelecao() {
    if (S.sel) {
      S.sel.classList.remove("selecionado");
      S.sel.setAttribute("aria-pressed", "false");
    }
    if (S.alvo) S.alvo.classList.remove("alvo");
    S.sel = null;
    S.alvo = null;
    S.ponta = null;
    desenharCabos();
  }

  function livre(no) {
    return no && !no.classList.contains("ligado");
  }

  function noSobPonteiro(e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);
    var no = el && el.closest ? el.closest(".no") : null;
    return no;
  }

  function aoPressionar(e) {
    if (S.fase !== "jogo" || bloqueado() || e.button > 0) return;
    var no = e.target.closest(".no");
    if (!no || !livre(no)) return;
    if (e.pointerType === "touch" && !e.target.closest(".jack")) return;
    if (tutorialBloqueiaSelecao(no)) return;
    S.arrasto = { no: no, x: e.clientX, y: e.clientY, ativo: false };
  }

  function aoMover(e) {
    if (S.arrasto) {
      var a = S.arrasto;
      if (!a.ativo && Math.abs(e.clientX - a.x) + Math.abs(e.clientY - a.y) > 6) {
        a.ativo = true;
        document.body.classList.add("arrastando");
        selecionar(a.no);
      }
      if (a.ativo) {
        S.ponta = posicaoNaMesa(e);
        var sob = noSobPonteiro(e);
        var valido = sob && sob !== a.no && sob.dataset.lado !== a.no.dataset.lado && livre(sob) ? sob : null;
        if (S.alvo && S.alvo !== valido) S.alvo.classList.remove("alvo");
        S.alvo = valido;
        if (valido) valido.classList.add("alvo");
        desenharCabos();
      }
    } else if (S.sel && S.fase === "jogo") {
      S.ponta = posicaoNaMesa(e);
      desenharCabos();
    }
  }

  function aoSoltar(e) {
    var a = S.arrasto;
    S.arrasto = null;
    document.body.classList.remove("arrastando");
    if (!a || !a.ativo) return;
    S.suprimirClick = true;
    setTimeout(function () {
      S.suprimirClick = false;
    }, 0);
    var sob = noSobPonteiro(e);
    var origem = a.no;
    if (sob && sob !== origem && sob.dataset.lado !== origem.dataset.lado && livre(sob)) {
      limparSelecao();
      tentarLigar(origem, sob);
    } else {
      limparSelecao();
    }
  }

  function aoCancelar() {
    if (S.arrasto) {
      S.arrasto = null;
      document.body.classList.remove("arrastando");
      limparSelecao();
    }
  }

  function aoClicar(e) {
    if (S.suprimirClick || S.fase !== "jogo" || bloqueado()) return;
    var no = e.target.closest(".no");
    if (!no) {
      if (S.sel && !e.target.closest(".placa-celular")) limparSelecao();
      return;
    }
    if (no.classList.contains("ligado")) {
      aviso("Esse já está ligado. Use Desfazer para voltar um passo.");
      return;
    }
    if (tutorialBloqueiaSelecao(no)) return;
    if (!S.sel) {
      selecionar(no);
    } else if (S.sel === no) {
      limparSelecao();
    } else if (S.sel.dataset.lado === no.dataset.lado) {
      selecionar(no);
    } else {
      var origem = S.sel;
      limparSelecao();
      tentarLigar(origem, no);
    }
  }

  function aoTeclaNoCartao(e) {
    var no = e.target.closest ? e.target.closest(".no") : null;
    if (!no || bloqueado()) return;
    var tecla = e.key;
    if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].indexOf(tecla) < 0) return;
    e.preventDefault();
    var lado = no.dataset.lado;
    var mesmaColuna = $$('.no[data-lado="' + lado + '"]').filter(livre);
    var outraColuna = $$('.no[data-lado="' + (lado === "c" ? "e" : "c") + '"]').filter(livre);
    var idx = mesmaColuna.indexOf(no);
    var alvo = null;
    if (tecla === "ArrowDown") alvo = mesmaColuna[Math.min(mesmaColuna.length - 1, idx + 1)];
    if (tecla === "ArrowUp") alvo = mesmaColuna[Math.max(0, idx - 1)];
    if ((tecla === "ArrowRight" && lado === "c") || (tecla === "ArrowLeft" && lado === "e")) {
      alvo = outraColuna[Math.min(outraColuna.length - 1, Math.max(0, idx))];
    }
    if (alvo) alvo.focus();
  }

  function aoFocarCartao(e) {
    var no = e.target.closest ? e.target.closest(".no") : null;
    if (!no || !S.sel || S.arrasto) return;
    if (no !== S.sel && no.dataset.lado !== S.sel.dataset.lado && livre(no)) {
      if (S.alvo) S.alvo.classList.remove("alvo");
      S.alvo = no;
      no.classList.add("alvo");
      desenharCabos();
    } else if (S.alvo) {
      S.alvo.classList.remove("alvo");
      S.alvo = null;
      desenharCabos();
    }
  }

  /* ------------------------------------------------------------ ligar */

  function tentarLigar(noA, noB) {
    var cNo = noA.dataset.lado === "c" ? noA : noB;
    var eNo = noA.dataset.lado === "e" ? noA : noB;
    var c = conceito(cNo.dataset.id);
    var ef = efeito(eNo.dataset.id);
    if (tutorialBloqueiaLigacao(c, ef)) return;
    if (c.efeito === ef.id) acerto(c, ef);
    else erro(c, ef);
  }

  function chavesDasLigacoes() {
    var cfg = {};
    var base = estacao().base;
    for (var k in base) cfg[k] = base[k];
    S.ligacoes.forEach(function (l) {
      var c = conceito(l.c);
      if (!c.liga || !c.liga.chave) return;
      var k2 = c.liga.chave;
      if (k2 === "press") cfg.press = "ref";
      else if (k2 === "touchable") cfg.touchable = "opacity";
      else cfg[k2] = true;
    });
    return cfg;
  }

  function acerto(c, ef) {
    var cor = D.cores[S.ligacoes.length % D.cores.length];
    S.ligacoes.push({ c: c.id, e: ef.id, cor: cor });
    [noDe("c", c.id), noDe("e", ef.id)].forEach(function (no) {
      no.classList.add("ligado");
      no.classList.remove("pulsa-dica");
      no.style.setProperty("--cor", cor);
      no.setAttribute("aria-label", no.getAttribute("aria-label") + " Já ligado.");
    });
    S.novoCabo = c.id;
    desenharCabos();
    setTimeout(function () {
      S.novoCabo = null;
    }, 600);

    if (CEL.emDemo()) CEL.pararDemo();
    CEL.aplicar(chavesDasLigacoes());
    if (c.liga && c.liga.demo) CEL.demo(c.liga.demo);
    desenharLeds();
    atualizarBotoes();
    limparDicaDoConceito(c.id);
    mostrarNota(c, cor);
    anunciar("Ligação certa: " + umaLinha(c.codigo) + ", " + ef.titulo + ".");
    tutEvento("ligou");
    if (S.ligacoes.length === estacao().conceitos.length) agendarConclusao();
  }

  function erro(c, ef) {
    S.errosEst++;
    var cNo = noDe("c", c.id);
    var eNo = noDe("e", ef.id);
    [cNo, eNo].forEach(function (no) {
      no.classList.remove("tremor");
      void no.offsetWidth;
      no.classList.add("tremor");
    });
    S.cabosErro = { c: c.id, e: ef.id };
    desenharCabos();
    anunciar("Ligação errada.");

    var corpo =
      '<div class="modal-ilu"><span class="ilu-codigo">' + IL.icone(c.icone) + "</span>" +
      '<span class="modal-faisca">' + faisca() + "</span>" +
      '<span class="ilu-efeito">' + IL.cena(ef.cena) + "</span></div>" +
      '<h2 class="modal-titulo" id="modal-titulo">Cabo desligado</h2>' +
      "<p>" + (ef.isca
        ? "O efeito “" + esc(ef.titulo) + "” não pertence a nenhum código deste painel."
        : "<code>" + esc(umaLinha(c.codigo)) + "</code> não leva a “" + esc(ef.titulo) + "”.") + "</p>" +
      (ef.isca ? '<p class="modal-pista isca">' + md(ef.motivo) + "</p>" : "") +
      '<p class="modal-pista">' + md(c.pistaErro) + "</p>";
    abrirModal({
      classe: "modal-erro",
      html: corpo,
      botoes: [{ rotulo: "OK", primario: true, aoClicar: fecharErro }]
    });
  }

  function fecharErro() {
    fecharModal();
    S.cabosErro = null;
    desenharCabos();
  }

  function faisca() {
    return (
      '<svg viewBox="0 0 56 26" aria-hidden="true" focusable="false">' +
      '<path d="M2 13 H18 L24 4 L32 22 L38 13 H54" fill="none" stroke="#D92D4A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    );
  }

  /* ------------------------------------------------------------ desfazer */

  function desfazer() {
    if (S.fase !== "jogo" || bloqueado()) return;
    if (tutorialBloqueiaAcao("desfazer")) return;
    var l = S.ligacoes.pop();
    if (!l) {
      aviso("Ainda não há cabos para desfazer.");
      return;
    }
    [noDe("c", l.c), noDe("e", l.e)].forEach(function (no) {
      no.classList.remove("ligado");
      no.style.removeProperty("--cor");
      no.setAttribute("aria-label", no.getAttribute("aria-label").replace(" Já ligado.", ""));
    });
    if (CEL.emDemo()) CEL.pararDemo();
    CEL.aplicar(chavesDasLigacoes());
    desenharCabos();
    desenharLeds();
    atualizarBotoes();
    limparNota();
    anunciar("Último cabo desfeito.");
  }

  /* ------------------------------------------------------------ dicas */

  function alvoDaDica() {
    if (S.sel && S.sel.dataset.lado === "c") return conceito(S.sel.dataset.id);
    var ordem = ordens[S.est].c;
    for (var i = 0; i < ordem.length; i++) {
      if (!ligacaoDoConceito(ordem[i])) return conceito(ordem[i]);
    }
    return null;
  }

  function pedirDica() {
    if (S.fase !== "jogo" || bloqueado()) return;
    if (tutorialBloqueiaAcao("dica")) return;
    var c = alvoDaDica();
    if (!c) {
      aviso("Todos os códigos desta estação já estão ligados.");
      return;
    }
    var gratis = tutAtivo();
    var nivelAtual = S.dicaNivel[c.id] || 0;
    var cobra = !gratis && nivelAtual < 2;
    if (cobra && !S.ilimitadas && S.dicasUsadas >= S.dicasMax) {
      aviso("As dicas acabaram. Use o que já aprendeu nas explicações.");
      return;
    }
    var nivel = Math.min(2, nivelAtual + 1);
    S.dicaNivel[c.id] = nivel;
    if (cobra) {
      S.dicasUsadas++;
      S.dicasEst++;
    }
    var selo = gratis ? "Dica do tutorial" : S.ilimitadas ? "Dica" : "Dica " + S.dicasUsadas + " de " + S.dicasMax;
    $("#faixa-selo").textContent = selo;
    $("#faixa-texto").innerHTML = "<strong>" + md(umaLinha(c.codigo)) + ":</strong> " + md(nivel === 1 ? c.dica : c.dicaForte);
    $("#faixa-dica").hidden = false;
    pulsar(noDe("c", c.id));
    if (nivel === 2) pulsar(noDe("e", c.efeito));
    atualizarCabecalho();
    atualizarBotoes();
    anunciar(selo + ". " + (nivel === 1 ? c.dica : c.dicaForte));
    tutEvento("dica");
  }

  function pulsar(no) {
    if (!no || no.classList.contains("ligado")) return;
    no.classList.remove("pulsa-dica");
    void no.offsetWidth;
    no.classList.add("pulsa-dica");
  }

  function limparDica() {
    $("#faixa-dica").hidden = true;
    $$(".pulsa-dica").forEach(function (n) {
      n.classList.remove("pulsa-dica");
    });
  }

  function limparDicaDoConceito(id) {
    var t = $("#faixa-texto").textContent;
    if (!$("#faixa-dica").hidden && t.indexOf(umaLinha(conceito(id).codigo)) === 0) $("#faixa-dica").hidden = true;
  }

  /* ------------------------------------------------------------ explicação */

  function limparNota() {
    $("#nota").innerHTML =
      '<div class="nota-vazia">Cada cabo certo mostra aqui o que o código faz. Clique na explicação para ler tudo.</div>';
  }

  function mostrarNota(c, cor) {
    if (tutAtivo()) {
      S.notaPendente = { c: c, cor: cor };
      return;
    }
    var nota = $("#nota");
    nota.innerHTML =
      '<div class="nota-card" role="button" tabindex="0" style="--cor:' + cor + '" aria-label="Explicação: ' + esc(c.flash.titulo) + '. Clique para ler tudo.">' +
      '<span class="nota-ilu">' + IL.icone(c.icone) + "</span>" +
      '<span class="nota-corpo"><span class="nota-titulo">' + esc(c.flash.titulo) + '<span class="nota-mais">clique para ler tudo</span></span><span class="nota-texto">' + md(c.flash.texto) + "</span></span>" +
      '<pre class="nota-codigo">' + esc(c.flash.codigo) + "</pre></div>";
    var card = $(".nota-card", nota);
    card.addEventListener("click", function () {
      abrirNotaCompleta(c, cor);
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrirNotaCompleta(c, cor);
      }
    });
  }

  function abrirNotaCompleta(c, cor) {
    if (bloqueado()) return;
    abrirModal({
      classe: "modal-flash",
      html:
        '<div class="flash-topo" style="--cor:' + cor + '"><span class="flash-ilu">' + IL.icone(c.icone) + "</span>" +
        '<h2 class="modal-titulo" id="modal-titulo">' + esc(c.flash.titulo) + "</h2></div>" +
        '<p class="flash-texto">' + md(c.flash.texto) + "</p>" +
        '<pre class="nota-codigo grande">' + esc(c.flash.codigo) + "</pre>",
      botoes: [{ rotulo: "Fechar", primario: true, aoClicar: function () { fecharModal(); } }]
    });
  }

  /* ------------------------------------------------------------ conclusão */

  function estrelasDaEstacao() {
    var pen = S.errosEst + S.dicasEst;
    return pen <= 1 ? 3 : pen <= 4 ? 2 : 1;
  }

  function htmlEstrelas(n, animar) {
    var h = '<div class="estrelas" role="img" aria-label="' + n + (n === 1 ? " estrela" : " estrelas") + ' de 3">';
    for (var i = 1; i <= 3; i++) h += '<span class="estrela' + (animar && i <= n ? " nova" : "") + '">' + IL.estrela(i <= n) + "</span>";
    return h + "</div>";
  }

  function agendarConclusao() {
    S.concluindo = true;
    clearTimeout(timerConclusao);
    timerConclusao = setTimeout(concluirEstacao, 1400);
  }

  function concluirEstacao() {
    var est = estacao();
    var estrelas = estrelasDaEstacao();
    S.resultados[S.est] = { estrelas: estrelas, erros: S.errosEst, dicas: S.dicasEst };
    atualizarCabecalho();
    var ultima = S.est === N - 1;
    var itens = S.ligacoes
      .map(function (l) {
        var c = conceito(l.c);
        return (
          '<li style="--cor:' + l.cor + '"><span class="mini-ilu">' + IL.icone(c.icone) + "</span><span>" +
          '<span class="res-codigo">' + esc(umaLinha(c.codigo)) + '</span><br><span class="res-texto">' + esc(c.resumo) + "</span></span></li>"
        );
      })
      .join("");
    var msg = estrelas === 3 ? "Central ligada sem falhas." : estrelas === 2 ? "Central ligada, com alguns ajustes pelo caminho." : "Central ligada. Releia as explicações e tente reduzir os erros.";
    abrirModal({
      classe: "modal-ok",
      html:
        '<h2 class="modal-titulo" id="modal-titulo">Estação ' + (S.est + 1) + " ligada: " + esc(est.nome) + "</h2>" +
        htmlEstrelas(estrelas, true) +
        '<p class="placar">' + msg + " Erros: " + S.errosEst + ". Dicas usadas: " + S.dicasEst + ".</p>" +
        '<ul class="lista-resumo">' + itens + "</ul>",
      botoes: [
        {
          rotulo: ultima ? "Ver resultado final" : "Próxima estação",
          primario: true,
          aoClicar: function () {
            fecharModal(true);
            if (ultima) mostrarFim();
            else iniciarEstacao(S.est + 1);
          }
        }
      ]
    });
    S.concluindo = false;
  }

  /* ------------------------------------------------------------ tela final */

  function mostrarFim() {
    var total = 0;
    S.resultados.forEach(function (r) {
      total += r.estrelas;
    });
    var media = total / N;
    var grandes = media >= 2.5 ? 3 : media >= 1.75 ? 2 : 1;
    var linhas = D.estacoes
      .map(function (est, i) {
        var r = S.resultados[i] || { estrelas: 0, erros: 0, dicas: 0 };
        var mini = "";
        for (var k = 1; k <= 3; k++) mini += "<span>" + IL.estrela(k <= r.estrelas) + "</span>";
        return (
          "<tr><td>" + (i + 1) + ". " + esc(est.nome) + '</td><td><span class="mini-estrelas" role="img" aria-label="' + r.estrelas + ' de 3">' + mini +
          "</span></td><td>" + r.erros + "</td><td>" + r.dicas + "</td></tr>"
        );
      })
      .join("");
    $("#fim-resumo").innerHTML =
      '<h1 class="fim-titulo">Central de Conexões funcionando</h1>' +
      '<div class="fim-total">' + htmlEstrelas(grandes, true) +
      "<p><strong>" + total + " de " + N * 3 + " estrelas.</strong> Todos os 24 códigos estão ligados aos seus efeitos.</p></div>" +
      '<table class="fim-tabela"><thead><tr><th>Estação</th><th>Estrelas</th><th>Erros</th><th>Dicas</th></tr></thead><tbody>' + linhas + "</tbody></table>" +
      '<div class="fim-botoes">' +
      '<button type="button" class="botao botao-primario" id="btn-imprimir">Imprimir a cola de revisão</button>' +
      '<button type="button" class="botao" id="btn-de-novo">Jogar de novo</button>' +
      '<button type="button" class="botao botao-discreto" id="btn-guia-fim">Guia do professor</button></div>';
    $("#cola").innerHTML = htmlCola();
    mostrarTela("fim");
    $("#btn-imprimir").addEventListener("click", function () {
      window.print();
    });
    $("#btn-de-novo").addEventListener("click", reiniciar);
    $("#btn-guia-fim").addEventListener("click", abrirGuia);
    $("#btn-imprimir").focus();
  }

  function htmlCola() {
    var h =
      '<h2 class="cola-titulo">Cola de revisão: o que cada código faz</h2>' +
      '<p class="cola-sub">Central de Conexões do TaskInput. Os 24 códigos ligados aos seus efeitos.</p><div class="cola-grade">';
    D.estacoes.forEach(function (est, i) {
      h += '<div class="cola-estacao"><h3>' + (i + 1) + ". " + esc(est.nome) + "</h3>";
      est.conceitos.forEach(function (c) {
        var ef = est.efeitos.filter(function (e) { return e.id === c.efeito; })[0];
        h +=
          '<div class="cola-par"><span class="c-ilu">' + IL.icone(c.icone) + "</span>" +
          '<span><span class="c-codigo">' + esc(umaLinha(c.codigo)) + '</span><br><span class="c-efeito">' + esc(ef.titulo) + "</span></span>" +
          '<span class="c-cena">' + IL.cena(ef.cena) + "</span></div>";
      });
      h += "</div>";
    });
    return h + "</div>";
  }

  /* ------------------------------------------------------------ guia do professor */

  function abrirGuia() {
    if (modalAtual && modalAtual.op.guia) {
      fecharModal();
      return;
    }
    var g = D.guia;
    var jogando = S.fase === "jogo";
    var gab = D.estacoes
      .map(function (est, i) {
        var linhas = est.conceitos
          .map(function (c) {
            var ef = est.efeitos.filter(function (e) { return e.id === c.efeito; })[0];
            return '<div class="guia-par"><code>' + esc(umaLinha(c.codigo)) + "</code><span>liga a</span><span>" + esc(ef.titulo) + "</span></div>";
          })
          .join("");
        var isca = est.efeitos.filter(function (e) { return e.isca; })[0];
        linhas += '<div class="guia-par isca"><span>Sem código (isca)</span><span></span><span>' + esc(isca.titulo) + "</span></div>";
        return (
          '<div class="guia-estacao"><h4><span>' + (i + 1) + ". " + esc(est.nome) + "</span>" +
          (jogando ? '<button type="button" class="botao-mini" data-ir="' + i + '">Ir para esta estação</button>' : "") +
          "</h4>" + linhas + "</div>"
        );
      })
      .join("");
    var lista = function (arr, tag) {
      return "<" + tag + ">" + arr.map(function (t) { return "<li>" + md(t) + "</li>"; }).join("") + "</" + tag + ">";
    };
    abrirModal({
      classe: "modal-largo",
      guia: true,
      html:
        '<h2 class="modal-titulo" id="modal-titulo">Guia do professor</h2><div class="guia">' +
        "<h3>Objetivo</h3><p>" + md(g.objetivo) + "</p>" +
        "<h3>Como conduzir</h3>" + lista(g.comoUsar, "ul") +
        "<h3>Gabarito</h3><div class=\"guia-tabela\">" + gab + "</div>" +
        "<h3>Pontos de atenção</h3>" + lista(g.atencao, "ul") +
        "<h3>Perguntas para discutir</h3>" + lista(g.perguntas, "ol") +
        "</div>",
      botoes: [{ rotulo: "Fechar", primario: true, aoClicar: function () { fecharModal(); } }]
    });
  }

  /* ------------------------------------------------------------ tutorial */

  var TUT = { ativo: false, passo: 0 };
  var PASSOS_TUT = [
    {
      texto: "Bem-vindo à central! À esquerda estão os códigos e, à direita, o que cada um provoca. Seu trabalho é ligar cada código ao seu efeito com um cabo.",
      botao: "Próximo"
    },
    {
      texto: "Vamos ao primeiro cabo. Arraste de <code>useState('')</code> até “Cria a caixinha de memória e começa vazia”. Se preferir, clique em um e depois no outro.",
      alvos: function () { return [noDe("c", "1a"), noDe("e", "1a")]; },
      espera: "ligou"
    },
    {
      texto: "Olhe o celular: a caixinha de memória nasceu e o campo ganhou vida. Digite qualquer coisa no campo dele.",
      alvos: function () { return [CEL.elementos().campo]; },
      espera: "digitou"
    },
    {
      texto: "Travou em algum código? O botão Dica mostra uma pista. No tutorial ela não conta. Clique em Dica.",
      alvos: function () { return [$("#btn-dica")]; },
      espera: "dica"
    },
    {
      texto: "Ligou errado ou quer voltar um passo? O botão Desfazer retira o último cabo e não custa nada.",
      alvos: function () { return [$("#btn-desfazer")]; },
      botao: "Próximo"
    },
    {
      texto: "Pronto! Ligue os outros três códigos desta estação. Cada acerto abre uma explicação aqui embaixo.",
      botao: "Começar a jogar"
    }
  ];

  function tutAtivo() {
    return TUT.ativo;
  }

  function tutIniciar() {
    TUT.ativo = true;
    TUT.passo = 0;
    tutMostrar();
  }

  function tutLimparDestaques() {
    $$(".destaque-tut").forEach(function (e) {
      e.classList.remove("destaque-tut");
    });
  }

  function tutMostrar() {
    var p = PASSOS_TUT[TUT.passo];
    tutLimparDestaques();
    var el = $("#tutorial");
    el.innerHTML =
      '<div class="tut-corpo"><div class="tut-passo">Tutorial, passo ' + (TUT.passo + 1) + " de " + PASSOS_TUT.length + "</div>" +
      '<p class="tut-texto">' + p.texto + "</p></div>" +
      '<div class="tut-botoes">' +
      (p.botao ? '<button type="button" class="botao botao-primario" id="tut-prox">' + p.botao + "</button>" : '<span class="tut-aguarda">Faça a ação para continuar</span>') +
      '<button type="button" class="botao-mini" id="tut-pular">Pular tutorial</button></div>';
    el.hidden = false;
    $("#tut-pular").addEventListener("click", tutFim);
    if (p.botao) {
      $("#tut-prox").addEventListener("click", tutAvancar);
      $("#tut-prox").focus({ preventScroll: true });
    }
    (p.alvos ? p.alvos() : []).forEach(function (a) {
      if (a) a.classList.add("destaque-tut");
    });
    anunciar("Tutorial, passo " + (TUT.passo + 1) + ". " + p.texto.replace(/<[^>]+>/g, ""));
  }

  function tutAvancar() {
    TUT.passo++;
    if (TUT.passo >= PASSOS_TUT.length) tutFim();
    else tutMostrar();
  }

  function tutFim() {
    if (!TUT.ativo) {
      $("#tutorial").hidden = true;
      return;
    }
    TUT.ativo = false;
    $("#tutorial").hidden = true;
    tutLimparDestaques();
    if (S.notaPendente && S.fase === "jogo") {
      mostrarNota(S.notaPendente.c, S.notaPendente.cor);
    }
    S.notaPendente = null;
    if (S.fase === "jogo") {
      var foco = $(".no.no-conceito:not(.ligado)");
      if (foco) foco.focus({ preventScroll: true });
    }
  }

  function tutEvento(nome) {
    if (!TUT.ativo) return;
    var p = PASSOS_TUT[TUT.passo];
    if (p && p.espera === nome) tutAvancar();
  }

  function tutPasso() {
    return TUT.ativo ? PASSOS_TUT[TUT.passo] : null;
  }

  function tutorialBloqueiaSelecao(no) {
    var p = tutPasso();
    if (!p) return false;
    if (p.espera === "ligou" && (no.dataset.id === "1a")) return false;
    aviso(p.espera === "ligou" ? "No tutorial, use o código e o efeito destacados." : "Siga o passo do tutorial ou toque em Pular tutorial.");
    return true;
  }

  function tutorialBloqueiaLigacao(c, ef) {
    var p = tutPasso();
    if (!p) return false;
    if (p.espera === "ligou" && c.id === "1a" && ef.id === "1a") return false;
    aviso(p.espera === "ligou" ? "No tutorial, ligue o código e o efeito destacados." : "Siga o passo do tutorial ou toque em Pular tutorial.");
    return true;
  }

  function tutorialBloqueiaAcao(qual) {
    var p = tutPasso();
    if (!p) return false;
    if (p.espera === qual) return false;
    if (qual === "desfazer" && p.botao && TUT.passo === 4) return false;
    aviso("Siga o passo do tutorial ou toque em Pular tutorial.");
    return true;
  }

  /* ------------------------------------------------------------ teclado */

  function aoTeclaGlobal(e) {
    var alvo = e.target;
    var digitando = alvo && (alvo.tagName === "INPUT" || alvo.tagName === "TEXTAREA" || alvo.isContentEditable);
    if (e.key === "Escape") {
      if (modalAtual) {
        e.preventDefault();
        if (modalAtual.op.guia) fecharModal();
        else if (modalAtual.op.classe && modalAtual.op.classe.indexOf("modal-erro") >= 0) fecharErro();
        else if (modalAtual.op.classe && modalAtual.op.classe.indexOf("modal-flash") >= 0) fecharModal();
        return;
      }
      if (S.sel) {
        limparSelecao();
        anunciar("Seleção cancelada.");
      }
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || digitando) return;
    var k = e.key.toLowerCase();
    if (k === "g") {
      e.preventDefault();
      abrirGuia();
      return;
    }
    if (modalAtual || S.fase !== "jogo") return;
    if (k === "h") {
      e.preventDefault();
      pedirDica();
    } else if (k === "z") {
      e.preventDefault();
      desfazer();
    }
  }

  /* ------------------------------------------------------------ início */

  function iniciar() {
    preparaOrdens();
    $("#marca-inicio").innerHTML = IL.logo();
    $("#marca-topo").innerHTML = IL.logo();
    $("#ilu-inicio").innerHTML = IL.heroi();
    CEL.montar($("#celular"));
    CEL.aoEvento(function (ev) {
      if (ev.tipo === "digitou") tutEvento("digitou");
    });

    $("#form-inicio").addEventListener("submit", comecar);
    $("#btn-dica").addEventListener("click", pedirDica);
    $("#btn-desfazer").addEventListener("click", desfazer);
    $("#btn-guia").addEventListener("click", abrirGuia);
    $("#faixa-fechar").addEventListener("click", function () {
      $("#faixa-dica").hidden = true;
    });

    var mesa = $("#mesa");
    mesa.addEventListener("pointerdown", aoPressionar);
    mesa.addEventListener("click", aoClicar);
    mesa.addEventListener("keydown", aoTeclaNoCartao);
    mesa.addEventListener("focusin", aoFocarCartao);
    mesa.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });
    window.addEventListener("pointermove", aoMover);
    window.addEventListener("pointerup", aoSoltar);
    window.addEventListener("pointercancel", aoCancelar);
    document.addEventListener("keydown", aoTeclaGlobal);
    document.addEventListener("keydown", prenderFoco);
    $("#camada-modal").addEventListener("click", function (e) {
      var ir = e.target.closest ? e.target.closest("[data-ir]") : null;
      if (ir) {
        var i = parseInt(ir.getAttribute("data-ir"), 10);
        fecharModal(true);
        tutFim();
        iniciarEstacao(i);
      }
    });

    var redesenhar = function () {
      desenharCabos();
    };
    window.addEventListener("resize", redesenhar);
    if (window.ResizeObserver) new ResizeObserver(redesenhar).observe(mesa);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redesenhar);

    mostrarTela("inicio");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
