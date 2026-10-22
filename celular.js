/*
 * Celular simulado do jogo.
 *
 * É um TaskInput de verdade (campo, botão, alertas) que se comporta conforme
 * uma configuração (cfg). Cada ligação certa do jogo liga uma chave dessa
 * configuração, e o celular passa a reagir de outro jeito. O comportamento
 * reproduz o que foi medido na versão web do app (react-native-web):
 *
 *  - sem useState (variável comum), o campo fica travado em vazio;
 *  - value sem onChangeText: campo travado;
 *  - onChangeText sem value: digitar funciona, mas setTaskName('') não limpa;
 *  - onPress={handleAddTask()} roda a função ao montar a tela;
 *  - TouchableOpacity esmaece ao toque; Pressable sem estilo não muda nada;
 *  - trim() não remove o espaço de largura zero (U+200B), porque String.trim também não remove.
 *
 * API: montar, configurar, aplicar, demo, pararDemo, reverDemo, aoEvento, elementos.
 */
window.CELULAR = (function () {
  "use strict";

  var COMPLETA = {
    estado: true,
    value: true,
    onChange: true,
    placeholder: true,
    press: "ref", /* none | ref | call */
    touchable: "opacity", /* plain | opacity | pressable-estilo */
    alertErro: true,
    alertOk: true,
    trim: true,
    guard: true,
    ret: true,
    clear: true,
    rxNome: true,
    rxSetter: true,
    mExport: true,
    mImport: true,
    mJsx: true,
    navegador: false
  };

  var TEXTO_PLACEHOLDER = "Digite o nome da tarefa...";
  var MSG_ERRO = "Por favor, digite um nome para a tarefa";
  var LEGENDA_PADRAO = "Teste à vontade: digite no campo e toque em Adicionar.";

  var cfg = clonar(COMPLETA);
  var estado = { texto: "", solta: "", renders: 0, ultimaChamada: "" };
  var modoRX = "memoria";
  var el = {};
  var ouvinte = function () {};
  var registro = [];
  var fila = [];
  var alertaAtual = null;
  var demoId = 0;
  var emDemo = false;
  var ultimaDemo = null;
  var snapAtual = null;

  function clonar(o) {
    var r = {};
    for (var k in o) r[k] = o[k];
    return r;
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function dormir(ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  }
  function emitir(e) {
    try {
      ouvinte(e);
    } catch (err) {
      /* o jogo não pode quebrar por causa de um ouvinte */
    }
  }
  /* mostra espaços de forma visível no registro, sem confundir com texto vazio */
  function visivel(s) {
    return String(s).replace(/​/g, "␣").replace(/ /g, "·");
  }
  function lido() {
    return cfg.estado ? estado.texto : estado.solta;
  }

  /* ---------------------------------------------------------------- montagem */

  function montar(raiz) {
    el.raiz = raiz;
    raiz.innerHTML =
      '<div class="cel">' +
      '<div class="cel-topo"><h2 class="cel-titulo">Celular de teste</h2><button type="button" class="botao-mini cel-rever" hidden>Rever demonstração</button></div>' +
      '<div class="cel-leds" aria-label="Chaves ligadas"></div>' +
      '<div class="fone" data-toque="plain">' +
      '<div class="fone-barra"><span>9:41</span><span class="fone-camera"></span><span>5G</span></div>' +
      '<div class="fone-nav" hidden>localhost:8081 (navegador)</div>' +
      '<div class="fone-tela">' +
      '<div class="app-bloco">' +
      '<div class="app-titulo">Nova Tarefa</div>' +
      '<input class="app-campo" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Campo de nova tarefa do celular de teste">' +
      '<div class="app-botao" role="button" tabindex="0">+ Adicionar Tarefa</div>' +
      "</div>" +
      '<div class="app-vazio" hidden>Aqui vai o Input</div>' +
      '<div class="app-filtro">Aqui vai o Filtro</div>' +
      '<div class="app-lista">Aqui vai a Lista</div>' +
      "</div>" +
      '<div class="fone-alerta" hidden><div class="alerta-caixa" role="alertdialog" aria-modal="true" aria-labelledby="alerta-t" aria-describedby="alerta-m">' +
      '<div class="alerta-titulo" id="alerta-t"></div><div class="alerta-msg" id="alerta-m"></div>' +
      '<button type="button" class="alerta-ok">OK</button></div></div>' +
      '<div class="fone-codigo" hidden></div>' +
      "</div>" +
      '<div class="cel-legenda" aria-live="polite"><span class="leg-txt"></span><button type="button" class="botao-mini leg-parar" hidden>Parar</button></div>' +
      '<div class="cel-rx" aria-label="Raio-X do componente"></div>' +
      '<ol class="cel-registro" aria-label="Registro do que acontece"></ol>' +
      "</div>";

    el.fone = raiz.querySelector(".fone");
    el.campo = raiz.querySelector(".app-campo");
    el.botao = raiz.querySelector(".app-botao");
    el.bloco = raiz.querySelector(".app-bloco");
    el.vazio = raiz.querySelector(".app-vazio");
    el.nav = raiz.querySelector(".fone-nav");
    el.alerta = raiz.querySelector(".fone-alerta");
    el.alertaTitulo = raiz.querySelector(".alerta-titulo");
    el.alertaMsg = raiz.querySelector(".alerta-msg");
    el.alertaOk = raiz.querySelector(".alerta-ok");
    el.codigo = raiz.querySelector(".fone-codigo");
    el.legenda = raiz.querySelector(".leg-txt");
    el.parar = raiz.querySelector(".leg-parar");
    el.rever = raiz.querySelector(".cel-rever");
    el.rx = raiz.querySelector(".cel-rx");
    el.registro = raiz.querySelector(".cel-registro");
    el.leds = raiz.querySelector(".cel-leds");

    el.campo.addEventListener("input", aoDigitar);
    el.botao.addEventListener("click", function () {
      if (emDemo) return;
      toque();
    });
    el.botao.addEventListener("keydown", function (e) {
      if (emDemo) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        apertar(true);
        setTimeout(function () {
          apertar(false);
        }, 140);
        toque();
      }
    });
    el.botao.addEventListener("pointerdown", function () {
      if (!emDemo) apertar(true);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (nome) {
      el.botao.addEventListener(nome, function () {
        apertar(false);
      });
    });
    el.alertaOk.addEventListener("click", fecharAlerta);
    el.parar.addEventListener("click", function () {
      pararDemo();
    });
    el.rever.addEventListener("click", reverDemo);
    legenda(LEGENDA_PADRAO);
    renderizar();
  }

  /* ----------------------------------------------------------------- estado */

  function configurar(base, opcoes) {
    demoId++;
    emDemo = false;
    snapAtual = null;
    cfg = clonar(COMPLETA);
    for (var k in base || {}) cfg[k] = base[k];
    modoRX = (opcoes && opcoes.raiox) || "memoria";
    /* no modo dos arquivos o registro de chamadas não tem o que mostrar: o quadro dos arquivos usa o espaço dele */
    el.registro.hidden = modoRX === "arquivos";
    el.rx.classList.toggle("rx-grande", modoRX === "arquivos");
    estado = { texto: "", solta: "", renders: 0, ultimaChamada: "" };
    el.campo.value = "";
    registro = [];
    limparAlertas();
    el.codigo.hidden = true;
    el.parar.hidden = true;
    el.fone.classList.remove("em-demo");
    ultimaDemo = null;
    el.rever.hidden = true;
    legenda(LEGENDA_PADRAO);
    renderizar();
    renderizarRegistro();
  }

  function aplicar(patch) {
    for (var k in patch || {}) cfg[k] = patch[k];
    renderizar();
  }

  function setEstado(v) {
    if (v === estado.texto) return; /* o React descarta valor igual */
    estado.texto = v;
    estado.renders++;
    estado.ultimaChamada = "setTaskName('" + v + "')";
    if (cfg.value) el.campo.value = v;
    registrar("setTaskName('" + visivel(v) + "')");
    renderizarRX(true);
  }

  function aoDigitar() {
    var dig = el.campo.value;
    emitir({ tipo: "digitou" });
    if (!cfg.estado) {
      /* variável comum: o campo é refeito com o valor antigo e a tela não muda */
      estado.solta = dig;
      el.campo.value = "";
      registrar("taskName = '" + visivel(dig) + "' (variável comum)");
      renderizarRX(false);
      return;
    }
    if (cfg.onChange) registrar("onChangeText('" + visivel(dig) + "')");
    if (cfg.value && !cfg.onChange) {
      el.campo.value = estado.texto;
      registrar("value sem onChangeText: o estado não mudou");
      renderizarRX(false);
      return;
    }
    if (cfg.onChange) {
      setEstado(dig);
    } else {
      renderizarRX(false);
    }
  }

  /* ----------------------------------------------------------------- botão */

  function apertar(sim) {
    el.botao.classList.toggle("apertado", !!sim);
  }

  function toque() {
    emitir({ tipo: "toque" });
    if (cfg.press === "none") {
      registrar("toque: nenhuma função está ligada ao botão");
      return;
    }
    if (cfg.press === "call") {
      registrar("toque: o botão recebeu undefined, nada acontece");
      return;
    }
    executar();
  }

  function executar() {
    registrar("handleAddTask()");
    var bruto = lido();
    var nome = cfg.trim ? bruto.trim() : bruto;
    if (cfg.guard && !nome) {
      if (cfg.alertErro) alerta("Erro", MSG_ERRO);
      else registrar("texto vazio, mas não há alerta de erro");
      if (cfg.ret) {
        registrar("return: a função parou aqui");
        return;
      }
    }
    if (cfg.alertOk) alerta("Tarefa digitada", nome);
    else registrar("sem alerta de confirmação");
    if (cfg.clear) {
      if (cfg.estado) setEstado("");
      else estado.solta = "";
    }
  }

  /* ---------------------------------------------------------------- alertas */

  function alerta(titulo, msg) {
    if (cfg.navegador) {
      registrar("Alert.alert('" + titulo + "') chamado, mas nada aparece");
      return;
    }
    registrar("Alert.alert('" + titulo + "')");
    fila.push({ t: titulo, m: msg });
    mostrarProximo();
    emitir({ tipo: "alerta", titulo: titulo });
  }

  function mostrarProximo() {
    if (alertaAtual || !fila.length) return;
    alertaAtual = fila.shift();
    el.alertaTitulo.textContent = alertaAtual.t;
    el.alertaMsg.textContent = alertaAtual.m;
    el.alertaMsg.classList.toggle("vazia", !alertaAtual.m.trim());
    el.alerta.hidden = false;
    if (!emDemo) {
      try {
        el.alertaOk.focus({ preventScroll: true });
      } catch (e) {
        /* sem foco, tudo bem */
      }
    }
  }

  function fecharAlerta() {
    el.alerta.hidden = true;
    alertaAtual = null;
    el.alertaOk.classList.remove("destaque-ok");
    mostrarProximo();
    if (!alertaAtual && !emDemo) {
      try {
        el.campo.focus({ preventScroll: true });
      } catch (e) {
        /* sem foco, tudo bem */
      }
    }
  }

  function limparAlertas() {
    fila = [];
    alertaAtual = null;
    el.alerta.hidden = true;
    el.alertaOk.classList.remove("destaque-ok");
  }

  /* ----------------------------------------------------------- apresentação */

  function registrar(txt) {
    registro.unshift(txt);
    if (registro.length > 3) registro.length = 3;
    renderizarRegistro();
  }

  function renderizarRegistro() {
    if (!el.registro) return;
    if (!registro.length) {
      el.registro.innerHTML = '<li class="vazio">O registro das chamadas aparece aqui.</li>';
      return;
    }
    el.registro.innerHTML = registro
      .map(function (t) {
        return "<li>" + esc(t) + "</li>";
      })
      .join("");
  }

  function legenda(txt, tipo) {
    el.legenda.textContent = txt;
    el.legenda.parentNode.dataset.tipo = tipo || "";
  }

  function renderizar() {
    if (!el.fone) return;
    el.campo.placeholder = cfg.placeholder ? TEXTO_PLACEHOLDER : "";
    el.fone.dataset.toque = cfg.touchable;
    el.nav.hidden = !cfg.navegador;
    var montado = cfg.mExport && cfg.mImport && cfg.mJsx;
    el.bloco.hidden = !montado;
    el.vazio.hidden = montado;
    /* campo controlado: o React refaz o campo com o valor do estado assim que o value é ligado */
    if (cfg.estado && cfg.value && el.campo.value !== estado.texto) el.campo.value = estado.texto;
    renderizarRX(false);
  }

  function renderizarRX(pulsar) {
    if (!el.rx) return;
    var h = "";
    if (modoRX === "arquivos") {
      var ligado = cfg.mExport && cfg.mImport;
      h +=
        '<div class="rx-arqs">' +
        '<div class="rx-arq"><b>TaskInput.tsx</b><span class="rx-tag' + (cfg.mExport ? " on" : "") + '">export</span></div>' +
        '<span class="rx-fio' + (ligado ? " on" : "") + '" aria-hidden="true"></span>' +
        '<div class="rx-arq"><b>HomeScreen.tsx</b>' +
        '<span class="rx-tag' + (cfg.mImport ? " on" : "") + '">import</span>' +
        '<span class="rx-tag' + (cfg.mJsx && ligado ? " on" : "") + '">&lt;TaskInput /&gt;</span></div>' +
        "</div>" +
        '<div class="rx-rodape">' + (cfg.mExport && cfg.mImport && cfg.mJsx ? "Encaixou: o campo aparece na tela." : "Falta encaixar as peças.") + "</div>";
    } else if (!cfg.estado) {
      h +=
        '<div class="rx-linha"><div class="rx-caixa solta"><span class="rx-et">variável comum</span><span class="rx-val">' +
        esc("'" + visivel(estado.solta) + "'") + "</span></div></div>" +
        '<div class="rx-rodape">telas refeitas: <b>0</b> (a tela não percebe)</div>';
    } else {
      var rotulo = cfg.rxNome ? "taskName" : "?";
      var valor = cfg.rxNome ? '"' + visivel(estado.texto) + '"' : "•••";
      h +=
        '<div class="rx-linha"><div class="rx-caixa"><span class="rx-et">' + esc(rotulo) + '</span><span class="rx-val">' + esc(valor) + "</span></div>";
      if (cfg.rxSetter) {
        h += '<span class="rx-pill' + (pulsar ? " pulsa" : "") + '">' + esc(estado.ultimaChamada || "setTaskName(...)") + "</span>";
      }
      h += '</div><div class="rx-rodape">telas refeitas: <b>' + estado.renders + "</b></div>";
    }
    el.rx.innerHTML = h;
  }

  /* -------------------------------------------------------------- demonstrações */

  function guardar() {
    return { cfg: clonar(cfg), texto: estado.texto, solta: estado.solta, renders: estado.renders, ultima: estado.ultimaChamada, campo: el.campo.value };
  }

  function restaurar(snap) {
    cfg = snap.cfg;
    estado.texto = snap.texto;
    estado.solta = snap.solta;
    estado.renders = snap.renders;
    estado.ultimaChamada = snap.ultima;
    el.campo.value = snap.campo;
    limparAlertas();
    el.codigo.hidden = true;
    el.fone.classList.remove("em-demo", "remontando");
    el.parar.hidden = true;
    legenda(LEGENDA_PADRAO);
    renderizar();
  }

  async function digitarSim(texto, vivo) {
    for (var i = 0; i < texto.length; i++) {
      if (!vivo()) return false;
      el.campo.value += texto.charAt(i);
      el.campo.dispatchEvent(new Event("input"));
      await dormir(280);
    }
    return vivo();
  }

  async function apertarSim(vivo, ms) {
    if (!vivo()) return false;
    apertar(true);
    await dormir(ms || 700);
    apertar(false);
    await dormir(200);
    return vivo();
  }

  var DEMOS = {
    variavelComum: async function (v) {
      cfg.estado = false;
      renderizar();
      legenda("Variável comum: cada tecla muda a variável por dentro, mas a tela não se refaz.", "demo");
      await dormir(500);
      if (!v()) return;
      if (!(await digitarSim("abc", v))) return;
      legenda("O campo continua vazio: o React nunca foi avisado de que algo mudou.", "demo");
      await dormir(3200);
    },
    valueSemOnChange: async function (v) {
      cfg.estado = true;
      cfg.value = true;
      cfg.onChange = false;
      renderizar();
      legenda("Só o fio de leitura: o campo mostra o estado, e o estado nunca recebe as teclas.", "demo");
      await dormir(500);
      if (!v()) return;
      if (!(await digitarSim("abc", v))) return;
      legenda("Campo travado: nada aparece, por mais que se digite.", "demo");
      await dormir(3200);
    },
    pressChamado: async function (v) {
      cfg.press = "call";
      cfg.estado = true;
      cfg.alertErro = true;
      cfg.guard = true;
      cfg.ret = true;
      cfg.trim = true;
      renderizar();
      legenda("Com parênteses, a função roda na hora de montar a tela.", "demo");
      el.fone.classList.add("remontando");
      await dormir(700);
      if (!v()) return;
      el.fone.classList.remove("remontando");
      registrar("handleAddTask() rodou ao montar a tela");
      alerta("Erro", MSG_ERRO);
      await dormir(2600);
      if (!v()) return;
      fecharAlerta();
      legenda("Agora o botão recebeu undefined: tocar não faz mais nada.", "demo");
      await dormir(500);
      if (!(await apertarSim(v, 600))) return;
      toque();
      await dormir(2600);
    },
    pressable: async function (v) {
      cfg.touchable = "plain";
      renderizar();
      legenda("Pressable sem estilo: ao apertar, nada muda na aparência.", "demo");
      await dormir(700);
      if (!(await apertarSim(v, 900))) return;
      cfg.touchable = "pressable-estilo";
      renderizar();
      legenda("Com style={({ pressed }) => ...} o efeito aparece, mas quem programa é você.", "demo");
      await dormir(600);
      if (!(await apertarSim(v, 1200))) return;
      await dormir(1400);
    },
    okAuto: async function (v) {
      cfg.estado = true;
      cfg.alertOk = true;
      cfg.navegador = false;
      renderizar();
      setEstado("Comprar pão");
      legenda("Chamada só com título e mensagem, sem lista de botões.", "demo");
      await dormir(700);
      if (!v()) return;
      executar();
      el.alertaOk.classList.add("destaque-ok");
      legenda("O sistema colocou sozinho um botão OK.", "demo");
      await dormir(3600);
    },
    web: async function (v) {
      cfg.estado = true;
      cfg.alertOk = true;
      cfg.navegador = true;
      renderizar();
      legenda("No navegador (react-native-web): vamos digitar e tocar no botão.", "demo");
      await dormir(700);
      if (!v()) return;
      if (!(await digitarSim("Compra", v))) return;
      if (!(await apertarSim(v, 600))) return;
      executar();
      legenda("A função foi chamada, mas nenhuma caixa aparece: na web, Alert.alert é uma função vazia.", "demo");
      await dormir(3800);
    },
    props: async function (v) {
      legenda("O tipo React.FC sem props recusa qualquer propriedade vinda de fora.", "demo");
      el.codigo.innerHTML =
        '<div class="cod-linha">&lt;TaskInput <span class="cod-erro">nome="x"</span> /&gt;</div>' +
        '<div class="cod-msg">Property \'nome\' does not exist on type \'IntrinsicAttributes\'.</div>';
      el.codigo.hidden = false;
      await dormir(4600);
    }
  };

  async function demo(nome) {
    if (!DEMOS[nome]) return;
    if (emDemo && snapAtual) {
      /* uma demonstração em andamento é desfeita antes de começar a nova */
      demoId++;
      restaurar(snapAtual);
      emDemo = false;
      snapAtual = null;
    }
    var id = ++demoId;
    var vivo = function () {
      return id === demoId;
    };
    snapAtual = guardar();
    emDemo = true;
    ultimaDemo = nome;
    limparAlertas();
    el.fone.classList.add("em-demo");
    el.parar.hidden = false;
    el.rever.hidden = true;
    emitir({ tipo: "demo-inicio", nome: nome });
    try {
      await DEMOS[nome](vivo);
    } catch (e) {
      /* demonstração interrompida */
    }
    if (!vivo()) return; /* outra demonstração, o botão Parar ou outra estação assumiu */
    emDemo = false;
    restaurar(snapAtual);
    snapAtual = null;
    el.rever.hidden = false;
    emitir({ tipo: "demo-fim", nome: nome });
  }

  function pararDemo() {
    if (!emDemo) return;
    demoId++;
    emDemo = false;
    if (snapAtual) {
      restaurar(snapAtual);
      snapAtual = null;
    }
    el.rever.hidden = false;
    emitir({ tipo: "demo-fim", nome: ultimaDemo });
  }

  function reverDemo() {
    if (ultimaDemo && !emDemo) demo(ultimaDemo);
  }

  return {
    montar: montar,
    configurar: configurar,
    aplicar: aplicar,
    demo: demo,
    pararDemo: pararDemo,
    reverDemo: reverDemo,
    aoEvento: function (fn) {
      ouvinte = fn;
    },
    emDemo: function () {
      return emDemo;
    },
    elementos: function () {
      return el;
    },
    lido: lido
  };
})();
