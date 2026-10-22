/*
 * Conteúdo do jogo "Central de Conexões do TaskInput".
 *
 * Cada estação tem 4 códigos (coluna da esquerda) e 5 efeitos (coluna da
 * direita): 4 efeitos corretos e 1 isca. Nada aqui mexe na tela: este arquivo
 * só guarda dados. A lógica fica em jogo.js e o celular simulado em celular.js.
 *
 * Marcação usada nos textos: `assim` vira trecho de código.
 *
 * Campo "liga" de cada código:
 *   { chave: "x" }  liga uma chave do celular simulado quando a ligação acerta
 *   { demo: "x" }   roda uma demonstração no celular (códigos que mostram um defeito)
 */
window.DADOS = {
  titulo: "Central de Conexões do TaskInput",
  cores: ["#E8365D", "#F59E0B", "#0EA5A4", "#7C3AED", "#EA580C", "#0284C7"],
  dicasPadrao: 6,

  estacoes: [
    /* ------------------------------------------------------------------ */
    {
      id: "memoria",
      nome: "A caixinha de memória",
      missao:
        "Uma variável comum não faz a tela se atualizar. O `useState` cria uma caixinha de memória que o React acompanha. Ligue cada código ao que ele faz.",
      base: { estado: false, rxNome: false, rxSetter: false },
      leds: [
        { chave: "estado", rotulo: "useState" },
        { chave: "rxNome", rotulo: "taskName" },
        { chave: "rxSetter", rotulo: "setTaskName" }
      ],
      conceitos: [
        {
          id: "1a",
          icone: "i-usestate",
          rotulo: "Cria a caixinha",
          codigo: `useState('')`,
          efeito: "1a",
          liga: { chave: "estado" },
          dica: "Pense no que precisa existir antes de qualquer texto ser guardado: um lugar, que já nasce com um valor inicial.",
          dicaForte: "O valor inicial é uma string vazia, porque o campo começa vazio. Procure o efeito que fala em criar a caixinha.",
          resumo: "Cria a caixinha de memória com valor inicial vazio.",
          pistaErro: "Lembrete: `useState('')` só cria a caixinha e define o valor inicial. Quem lê e quem troca o valor são outras peças.",
          flash: {
            titulo: "useState('')",
            texto: "Cria a caixinha de memória do componente. O valor inicial é uma string vazia, porque o campo começa vazio. O React acompanha essa caixinha e refaz a tela quando ela muda.",
            codigo: `const [taskName, setTaskName] = useState('');`
          }
        },
        {
          id: "1b",
          icone: "i-taskname",
          rotulo: "Valor atual",
          codigo: "taskName",
          efeito: "1b",
          liga: { chave: "rxNome" },
          dica: "É o primeiro nome do par entre colchetes. Quando você o lê, o que vem?",
          dicaForte: "Ele só serve para ler: mostra o texto que está sendo digitado naquele momento. Procure o efeito de entregar o que está guardado.",
          resumo: "Entrega o texto que está guardado agora.",
          pistaErro: "Lembrete: `taskName` é só o valor que está guardado. Ele não troca nada sozinho.",
          flash: {
            titulo: "taskName",
            texto: "É o valor atual da caixinha, o texto que está sendo digitado naquele momento. Como o valor inicial é uma string, o TypeScript infere sozinho que `taskName` é do tipo string.",
            codigo: `const [taskName, setTaskName] = useState('');`
          }
        },
        {
          id: "1c",
          icone: "i-settaskname",
          rotulo: "Função do estado",
          codigo: "setTaskName",
          efeito: "1c",
          liga: { chave: "rxSetter" },
          dica: "Alterar o valor guardado só é permitido por uma porta. Qual das peças do par é uma função?",
          dicaForte: "Cada chamada dessa função agenda uma nova renderização. Procure o efeito que fala em trocar o valor e refazer a tela.",
          resumo: "Troca o valor guardado e manda refazer a tela.",
          pistaErro: "Lembrete: `setTaskName` é uma função que se chama com o novo valor. Ela não cria a caixinha e não serve só para ler.",
          flash: {
            titulo: "setTaskName",
            texto: "É a única função autorizada a alterar o valor. Toda chamada agenda e executa uma nova renderização do componente, que reaparece na tela com o valor novo.",
            codigo: `setTaskName('Comprar pão');`
          }
        },
        {
          id: "1d",
          icone: "i-let",
          rotulo: "Variável comum",
          codigo: `let taskName = ''`,
          efeito: "1d",
          liga: { demo: "variavelComum" },
          dica: "Uma variável declarada dentro da função não sobrevive de uma renderização para a próxima, e o React não a acompanha.",
          dicaForte: "Alterar uma variável comum não avisa o React. Procure o efeito em que algo muda por dentro, mas a tela fica igual.",
          resumo: "Muda por dentro, mas a tela continua igual.",
          pistaErro: "Lembrete: o React só refaz a tela quando uma caixinha de estado é atualizada pela função correta.",
          flash: {
            titulo: "Variável comum",
            texto: "Dentro de um componente funcional, uma variável comum é esquecida a cada renderização e, mesmo que seja alterada, a tela não se atualiza. Nos testes, o campo ficou travado em vazio.",
            codigo: `let taskName = '';\ntaskName = 'Comprar pão'; // a tela não vê`
          }
        }
      ],
      efeitos: [
        { id: "1a", cena: "c-caixa-nasce", titulo: "Cria a caixinha de memória e começa vazia" },
        { id: "1b", cena: "c-entrega-texto", titulo: "Entrega o texto que está guardado agora" },
        { id: "1c", cena: "c-troca-refaz", titulo: "Troca o valor guardado e manda refazer a tela" },
        { id: "1d", cena: "c-muda-dentro", titulo: "Muda por dentro, mas a tela continua igual" },
        {
          id: "1x",
          cena: "c-atribui-direto",
          titulo: "Troca o valor com uma atribuição: taskName = 'x'",
          isca: true,
          motivo: "Atribuir direto não funciona: `taskName` é uma constante e o TypeScript recusa a linha. O único jeito de alterar o valor é chamar `setTaskName`."
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: "fios",
      nome: "Os dois fios do campo",
      missao:
        "Um campo controlado tem dois fios ligados ao estado: um para mostrar o valor e outro para escutar o que foi digitado. Ligue cada código ao que ele provoca.",
      base: { value: false, onChange: false, placeholder: false },
      leds: [
        { chave: "value", rotulo: "value" },
        { chave: "onChange", rotulo: "onChangeText" },
        { chave: "placeholder", rotulo: "placeholder" }
      ],
      conceitos: [
        {
          id: "2a",
          icone: "i-value",
          rotulo: "Fio de leitura",
          codigo: "value={taskName}",
          efeito: "2a",
          liga: { chave: "value" },
          dica: "Uma das duas propriedades que fazem o React, e não o campo do sistema, ser a fonte da verdade sobre o que aparece.",
          dicaForte: "Esse fio vai do estado para o campo. Procure o efeito em que o campo sempre mostra o que está guardado.",
          resumo: "O campo sempre mostra o que está guardado.",
          pistaErro: "Lembrete: `value` manda o conteúdo do estado para o campo. Ele não escuta teclas.",
          flash: {
            titulo: "value",
            texto: "O campo sempre exibe exatamente o que está guardado no estado. É isso que torna o componente controlado: o React, e não o campo de texto do sistema, é a fonte da verdade.",
            codigo: `<TextInput\n  value={taskName}\n  onChangeText={setTaskName}\n/>`
          }
        },
        {
          id: "2b",
          icone: "i-onchange",
          rotulo: "Fio de escrita",
          codigo: "onChangeText={setTaskName}",
          efeito: "2b",
          liga: { chave: "onChange" },
          dica: "A outra propriedade escuta o campo. O TextInput já entrega o novo texto como único parâmetro.",
          dicaForte: "Esse fio vai do campo para o estado, a cada tecla digitada, apagada ou colada. Procure o efeito das teclas.",
          resumo: "Cada tecla digitada vai parar no estado.",
          pistaErro: "Lembrete: `onChangeText` leva o texto do campo para o estado. Quem mostra o estado no campo é outra propriedade.",
          flash: {
            titulo: "onChangeText",
            texto: "Toda tecla digitada, apagada ou colada atualiza o estado. O TextInput entrega o novo texto como único parâmetro e `setTaskName` espera exatamente um parâmetro, então não precisa de função no meio.",
            codigo: `onChangeText={setTaskName}`
          }
        },
        {
          id: "2c",
          icone: "i-valuesem",
          rotulo: "Só um fio",
          codigo: `value={taskName}\n// sem onChangeText`,
          efeito: "2c",
          liga: { demo: "valueSemOnChange" },
          dica: "O estado manda no campo, mas ninguém avisa o estado do que foi digitado. O que o React faz com cada tecla?",
          dicaForte: "O campo é refeito sempre com o mesmo valor. Procure o efeito em que digitar não muda nada na tela.",
          resumo: "Digitar não aparece: o campo fica travado.",
          pistaErro: "Lembrete: com `value` e sem `onChangeText`, o estado nunca recebe o que foi digitado.",
          flash: {
            titulo: "value sem onChangeText",
            texto: "Com um fio só, o campo mostra o estado, mas o estado nunca muda. Nos testes, digitar “abc” não mostrou nada e o campo ficou travado em vazio.",
            codigo: `<TextInput value={taskName} />\n// campo travado`
          }
        },
        {
          id: "2d",
          icone: "i-placeholder",
          rotulo: "Texto de exemplo",
          codigo: `placeholder=\n"Digite o nome da tarefa..."`,
          efeito: "2d",
          liga: { chave: "placeholder" },
          dica: "Não tem nada a ver com controlar o valor. É só uma orientação visual para quem vai digitar.",
          dicaForte: "Ele só aparece enquanto o campo está vazio. Procure o efeito do texto cinza.",
          resumo: "Texto cinza de exemplo enquanto o campo está vazio.",
          pistaErro: "Lembrete: `placeholder` só orienta quem vai digitar. Ele não liga o campo ao estado.",
          flash: {
            titulo: "placeholder",
            texto: "É o texto de exemplo mostrado enquanto o campo está vazio. Junto com `placeholderTextColor` e `style`, é só estilização: não tem relação com o controle do valor do campo.",
            codigo: `placeholder="Digite o nome da tarefa..."\nplaceholderTextColor={colors.lightText}`
          }
        }
      ],
      efeitos: [
        { id: "2a", cena: "c-campo-mostra", titulo: "O campo sempre mostra o que está guardado" },
        { id: "2b", cena: "c-teclas-estado", titulo: "Cada tecla digitada vai parar no estado" },
        { id: "2c", cena: "c-campo-travado", titulo: "Campo travado: digitar não mostra nada" },
        { id: "2d", cena: "c-placeholder-some", titulo: "Texto cinza que some quando você digita" },
        {
          id: "2x",
          cena: "c-nao-limpa",
          titulo: "Aceita digitar, mas o texto não é limpo depois",
          isca: true,
          motivo: "Isso acontece com `defaultValue` no lugar de `value`: o campo deixa de ser controlado. Digitar funciona, mas `setTaskName('')` não esvazia a tela. Nos testes, “abc” continuou no campo depois do toque."
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: "botao",
      nome: "O botão que escuta o toque",
      missao:
        "O botão precisa executar a função só quando o dedo toca nele. Ligue cada código ao comportamento que ele cria.",
      base: { press: "none", touchable: "plain" },
      leds: [
        { chave: "press", rotulo: "onPress" },
        { chave: "touchable", rotulo: "TouchableOpacity" }
      ],
      conceitos: [
        {
          id: "3a",
          icone: "i-onpress",
          rotulo: "Passa a função",
          codigo: "onPress={handleAddTask}",
          efeito: "3a",
          liga: { chave: "press" },
          dica: "Repare que a função é entregue, sem nada depois do nome. O React guarda e usa quando for a hora.",
          dicaForte: "O React chama a função por conta própria, no toque. Procure o efeito que só acontece quando o dedo toca.",
          resumo: "A função roda só quando o dedo toca no botão.",
          pistaErro: "Lembrete: `onPress={handleAddTask}` entrega a função ao React, que a executa no toque.",
          flash: {
            titulo: "onPress={handleAddTask}",
            texto: "Conecta o toque à lógica do componente: sempre que a pessoa toca dentro da área do botão, a função `handleAddTask` é executada. A função é passada, não chamada.",
            codigo: `<TouchableOpacity\n  onPress={handleAddTask}\n>`
          }
        },
        {
          id: "3b",
          icone: "i-onpresscall",
          rotulo: "Chama na hora",
          codigo: "onPress={handleAddTask()}",
          efeito: "3b",
          liga: { demo: "pressChamado" },
          dica: "Os parênteses mudam tudo: a função deixa de ser entregue e passa a ser executada.",
          dicaForte: "Ela roda ao montar a tela e o botão recebe só o retorno. Procure o efeito que acontece sem ninguém tocar.",
          resumo: "Dispara ao abrir a tela e o toque não faz nada.",
          pistaErro: "Lembrete: parênteses depois do nome significam executar agora, e não esperar o toque.",
          flash: {
            titulo: "onPress={handleAddTask()}",
            texto: "Com parênteses, a função roda durante a montagem da tela e o botão recebe o retorno dela (`undefined`). Nos testes, o alerta de erro apareceu ao abrir a tela e o toque não fez nada. O TypeScript também recusa essa linha.",
            codigo: `onPress={handleAddTask()}\n// roda ao abrir a tela`
          }
        },
        {
          id: "3c",
          icone: "i-touchable",
          rotulo: "Área tocável",
          codigo: "<TouchableOpacity>",
          efeito: "3c",
          liga: { chave: "touchable" },
          dica: "Ele envolve o conteúdo visual para torná-lo tocável, já que o React Native não tem um botão nativo tão simples de estilizar.",
          dicaForte: "Além de tocável, ele dá um retorno visual no instante do toque. Procure o efeito que esmaece o botão.",
          resumo: "Deixa o botão tocável e esmaece ao apertar.",
          pistaErro: "Lembrete: `TouchableOpacity` envolve o conteúdo e mostra um retorno visual ao toque. Quem dispara a função é o `onPress`.",
          flash: {
            titulo: "TouchableOpacity",
            texto: "Torna qualquer conteúdo dentro dele tocável (um texto, um ícone, uma View) e dá um feedback visual de opacidade reduzida no instante em que o dedo toca a área.",
            codigo: `<TouchableOpacity\n  style={[styles.button, styles.buttonPrimary]}\n  onPress={handleAddTask}\n>\n  <Text>+ Adicionar Tarefa</Text>\n</TouchableOpacity>`
          }
        },
        {
          id: "3d",
          icone: "i-pressable",
          rotulo: "Alternativa mais nova",
          codigo: "<Pressable>",
          efeito: "3d",
          liga: { demo: "pressable" },
          dica: "A documentação a descreve como mais completa e preparada para o futuro, mas o visual de apertado não vem pronto.",
          dicaForte: "Sem programar o estilo de apertado, nada muda na aparência. Procure o efeito em que o visual de apertar fica por sua conta.",
          resumo: "Recebe o toque, mas o efeito de apertar é por sua conta.",
          pistaErro: "Lembrete: `Pressable` também recebe o toque, mas a aparência de apertado precisa ser programada.",
          flash: {
            titulo: "Pressable",
            texto: "Dispara o toque igual ao `TouchableOpacity`. Sem efeito visual, a menos que você programe `style={({ pressed }) => ...}`. Nos testes, o campo foi limpo do mesmo jeito que com o `TouchableOpacity`.",
            codigo: `<Pressable\n  onPress={handleAddTask}\n  style={({ pressed }) => ({\n    opacity: pressed ? 0.6 : 1\n  })}\n>`
          }
        }
      ],
      efeitos: [
        { id: "3a", cena: "c-toque-roda", titulo: "A função roda só quando o dedo toca no botão" },
        { id: "3b", cena: "c-abre-dispara", titulo: "Dispara ao abrir a tela e o toque não faz nada" },
        { id: "3c", cena: "c-esmaece", titulo: "Deixa o botão tocável e esmaece ao apertar" },
        { id: "3d", cena: "c-efeito-seu", titulo: "Recebe o toque, mas o efeito de apertar é seu" },
        {
          id: "3x",
          cena: "c-button-web",
          titulo: "É um botão nativo pronto, igual ao button da web",
          isca: true,
          motivo: "O React Native não tem um elemento de botão nativo tão simples de estilizar quanto o da web. Por isso o padrão é envolver o conteúdo visual em um componente tocável, como `TouchableOpacity` ou `Pressable`."
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: "alertas",
      nome: "Os alertas na tela",
      missao:
        "Os alertas são a resposta do componente a quem toca no botão. Ligue cada chamada ao que a pessoa vê.",
      base: { alertErro: false, alertOk: false },
      leds: [
        { chave: "alertErro", rotulo: "alerta de erro" },
        { chave: "alertOk", rotulo: "alerta de confirmação" }
      ],
      conceitos: [
        {
          id: "4a",
          icone: "i-alerterro",
          rotulo: "Alerta de erro",
          codigo: `Alert.alert('Erro',\n  'Por favor, digite...')`,
          efeito: "4a",
          liga: { chave: "alertErro" },
          dica: "Título fixo e uma mensagem que explica o que precisa ser corrigido. Quando a pessoa chega nesse alerta?",
          dicaForte: "Só quando ela tenta adicionar uma tarefa sem escrever nada. Procure o efeito que avisa que falta o nome.",
          resumo: "Avisa que falta o nome quando o campo está vazio.",
          pistaErro: "Lembrete: o alerta de título `'Erro'` é o aviso para o caso de tarefa vazia.",
          flash: {
            titulo: "Alert.alert de erro",
            texto: "Título fixo “Erro” e uma mensagem que explica o que precisa ser corrigido. É mostrado quando a pessoa tenta adicionar uma tarefa vazia. No celular, usa a caixa de diálogo nativa do sistema.",
            codigo: `Alert.alert(\n  'Erro',\n  'Por favor, digite um nome para a tarefa'\n);`
          }
        },
        {
          id: "4b",
          icone: "i-alertok",
          rotulo: "Alerta de confirmação",
          codigo: `Alert.alert(\n  'Tarefa digitada', trimmedName)`,
          efeito: "4b",
          liga: { chave: "alertOk" },
          dica: "Título fixo e, como mensagem, entra uma variável. De onde vem o conteúdo exibido?",
          dicaForte: "Por enquanto o app só simula que a tarefa foi adicionada, mostrando o texto de volta. Procure o efeito que devolve o texto.",
          resumo: "Mostra de volta o texto que a pessoa digitou.",
          pistaErro: "Lembrete: o alerta de título `'Tarefa digitada'` devolve para a pessoa o texto que ela escreveu.",
          flash: {
            titulo: "Alert.alert de confirmação",
            texto: "Título fixo “Tarefa digitada” e, como mensagem, o próprio conteúdo digitado pela pessoa. É um comportamento temporário: por enquanto o app apenas simula que a tarefa foi adicionada.",
            codigo: `Alert.alert('Tarefa digitada', trimmedName);`
          }
        },
        {
          id: "4c",
          icone: "i-semBotoes",
          rotulo: "Sem lista de botões",
          codigo: `Alert.alert(title, message)\n// sem terceiro argumento`,
          efeito: "4c",
          liga: { demo: "okAuto" },
          dica: "Os dois alertas do app foram chamados só com título e mensagem. E os botões? Quem decide?",
          dicaForte: "Sem a lista de botões, o sistema se encarrega. Procure o efeito do botão que aparece sozinho.",
          resumo: "O sistema coloca sozinho um botão OK.",
          pistaErro: "Lembrete: sem o terceiro argumento, a lista de botões fica por conta do sistema.",
          flash: {
            titulo: "Alert.alert sem botões",
            texto: "Quando você não passa a lista de botões, o sistema coloca um botão OK. O `Alert.alert` não faz parte do JSX: é uma chamada de função que abre a caixa de diálogo do sistema.",
            codigo: `Alert.alert(title, message?, buttons?, options?)`
          }
        },
        {
          id: "4d",
          icone: "i-web",
          rotulo: "Rodando na web",
          codigo: `Alert.alert(...)\n// react-native-web`,
          efeito: "4d",
          liga: { demo: "web" },
          dica: "O app roda em celular, mas também dá para abrir no navegador. O que o navegador faz com essa função?",
          dicaForte: "No navegador a função existe, mas não faz nada. Procure o efeito em que nenhuma caixa aparece.",
          resumo: "Na versão web, nenhuma caixa aparece.",
          pistaErro: "Lembrete: o comportamento de `Alert.alert` muda conforme a plataforma em que o app roda.",
          flash: {
            titulo: "Alert.alert na web",
            texto: "No react-native-web, `Alert.alert` é uma função vazia: nenhuma caixa aparece, nem mesmo a do navegador. Quem testa só na versão web não vê alerta algum. Teste também no celular ou no emulador.",
            codigo: `static alert() {}\n// react-native-web`
          }
        }
      ],
      efeitos: [
        { id: "4a", cena: "c-alerta-erro", titulo: "Avisa que falta o nome quando o campo está vazio" },
        { id: "4b", cena: "c-alerta-ok", titulo: "Mostra de volta o texto que a pessoa digitou" },
        { id: "4c", cena: "c-ok-auto", titulo: "O sistema coloca sozinho um botão OK" },
        { id: "4d", cena: "c-web-vazio", titulo: "Na versão web, nenhuma caixa aparece" },
        {
          id: "4x",
          cena: "c-espera-ok",
          titulo: "A execução pausa até a pessoa tocar no botão OK",
          isca: true,
          motivo: "`Alert.alert` não bloqueia: ele devolve o controle na hora e a linha seguinte roda sem esperar o OK. Por isso `setTaskName('')` já limpa o campo logo depois de chamar o alerta."
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: "porteiro",
      nome: "O porteiro da validação",
      missao:
        "Antes de aceitar uma tarefa, o componente confere o texto. Ligue cada trecho do porteiro ao que ele faz.",
      base: { trim: false, guard: false, ret: false, clear: false },
      leds: [
        { chave: "trim", rotulo: "trim()" },
        { chave: "guard", rotulo: "if" },
        { chave: "ret", rotulo: "return" },
        { chave: "clear", rotulo: "setTaskName('')" }
      ],
      conceitos: [
        {
          id: "5a",
          icone: "i-trim",
          rotulo: "Corta as pontas",
          codigo: `const trimmedName =\n  taskName.trim();`,
          efeito: "5a",
          liga: { chave: "trim" },
          dica: "Sem isso, um texto só com espaços passaria pela validação. Ele mexe em qual parte do texto?",
          dicaForte: "Só nas pontas, no começo e no fim. Procure o efeito de tirar espaços.",
          resumo: "Tira os espaços do começo e do fim do texto.",
          pistaErro: "Lembrete: `trim()` só limpa o começo e o fim do texto. Ele não decide sozinho se algo é erro.",
          flash: {
            titulo: "taskName.trim()",
            texto: "Remove os espaços do início e do fim e guarda o resultado em `trimmedName`. Sem isso, um texto só com espaços passaria pela validação. Nos testes, espaços, tabs, quebras de linha e espaço sem quebra foram removidos; o espaço de largura zero (U+200B) não.",
            codigo: `const trimmedName = taskName.trim();`
          }
        },
        {
          id: "5b",
          icone: "i-if",
          rotulo: "Pergunta se ficou vazio",
          codigo: `if (!trimmedName) {\n  ...\n}`,
          efeito: "5b",
          liga: { chave: "guard" },
          dica: "Em JavaScript e TypeScript, um tipo específico de texto é tratado como valor falso. Qual?",
          dicaForte: "A string vazia vale como falso, e o ponto de exclamação inverte. Procure o efeito do vazio contar como falso.",
          resumo: "Texto vazio conta como falso e cai no erro.",
          pistaErro: "Lembrete: `if (!trimmedName)` só faz a pergunta. Cortar espaços e interromper a função são outras peças.",
          flash: {
            titulo: "if (!trimmedName)",
            texto: "Verifica se a string ficou vazia depois do `trim()`. Uma string vazia é tratada como valor falso em JavaScript e TypeScript; o `!` inverte, então o bloco roda quando não sobrou nada.",
            codigo: `if (!trimmedName) {\n  Alert.alert('Erro', '...');\n  return;\n}`
          }
        },
        {
          id: "5c",
          icone: "i-return",
          rotulo: "Cláusula de guarda",
          codigo: `Alert.alert('Erro', '...');\nreturn;`,
          efeito: "5c",
          liga: { chave: "ret" },
          dica: "Depois de avisar o erro, o que impede o código de seguir em frente até o alerta de confirmação?",
          dicaForte: "Ele encerra a função ali mesmo. Procure o efeito que barra o caminho.",
          resumo: "Interrompe a função e nada abaixo roda.",
          pistaErro: "Lembrete: `return` encerra a função naquele ponto. Ele não faz pergunta nem corta texto.",
          flash: {
            titulo: "return (cláusula de guarda)",
            texto: "Interrompe a função ali mesmo quando a validação falha. Sem o `return`, o alerta de erro apareceria e o código continuaria para o alerta de confirmação e para a limpeza do campo.",
            codigo: `if (!trimmedName) {\n  Alert.alert('Erro', '...');\n  return;\n}`
          }
        },
        {
          id: "5d",
          icone: "i-limpa",
          rotulo: "Esvazia o campo",
          codigo: `Alert.alert(...);\nsetTaskName('');`,
          efeito: "5d",
          liga: { chave: "clear" },
          dica: "Só roda quando a validação passou. Prepara o campo para a tarefa seguinte, usando a porta oficial do estado.",
          dicaForte: "Troca o valor guardado por uma string vazia, e como o campo é controlado, ele esvazia. Procure o efeito do campo limpo.",
          resumo: "Deixa o campo limpo para a próxima tarefa.",
          pistaErro: "Lembrete: `setTaskName('')` só esvazia o estado e, por consequência, o campo. A pergunta de validação vem antes.",
          flash: {
            titulo: "setTaskName('')",
            texto: "Depois do alerta de confirmação, o estado volta a ser vazio e, como o campo é controlado, ele fica limpo para a próxima tarefa. Com só espaços, o erro aparece e o campo não é limpo, porque o `return` vem antes.",
            codigo: `Alert.alert('Tarefa digitada', trimmedName);\nsetTaskName('');`
          }
        }
      ],
      efeitos: [
        { id: "5a", cena: "c-corta-pontas", titulo: "Tira os espaços do começo e do fim do texto" },
        { id: "5b", cena: "c-vazio-falso", titulo: "Texto vazio conta como falso e cai no erro" },
        { id: "5c", cena: "c-cancela", titulo: "Interrompe a função e nada abaixo roda" },
        { id: "5d", cena: "c-campo-limpo", titulo: "Deixa o campo limpo para a próxima tarefa" },
        {
          id: "5x",
          cena: "c-corta-meio",
          titulo: "Remove os espaços do começo, do fim e do meio",
          isca: true,
          motivo: "`trim()` só mexe nas pontas. Em “Comprar pão”, o espaço do meio continua lá. E ele não remove tudo que é invisível: nos testes, o espaço de largura zero (U+200B) passou pela validação."
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: "montagem",
      nome: "A montagem dos dois arquivos",
      missao:
        "Dois arquivos precisam se encaixar: o `TaskInput.tsx` oferece e a `HomeScreen.tsx` usa. Ligue cada peça à sua função.",
      base: { mExport: false, mImport: false, mJsx: false },
      leds: [
        { chave: "mExport", rotulo: "export" },
        { chave: "mImport", rotulo: "import" },
        { chave: "mJsx", rotulo: "<TaskInput />" }
      ],
      conceitos: [
        {
          id: "6a",
          icone: "i-export",
          rotulo: "Porta de saída",
          codigo: "export const TaskInput",
          efeito: "6a",
          liga: { chave: "mExport" },
          dica: "Sem isso, o componente existe só dentro do próprio arquivo. Falta algo para os outros enxergarem.",
          dicaForte: "É o lado que oferece, em `TaskInput.tsx`. Procure o efeito de deixar disponível para outros arquivos.",
          resumo: "Deixa o componente disponível para outros arquivos.",
          pistaErro: "Lembrete: `export` abre a porta do arquivo que oferece. Quem usa o componente é outro arquivo.",
          flash: {
            titulo: "export const TaskInput",
            texto: "Declara o componente e o deixa disponível para outros arquivos. É uma exportação nomeada, então quem importa precisa usar chaves.",
            codigo: `export const TaskInput: React.FC = () => {\n  ...\n};`
          }
        },
        {
          id: "6b",
          icone: "i-import",
          rotulo: "Porta de entrada",
          codigo: `import { TaskInput }\n  from '../components/TaskInput'`,
          efeito: "6b",
          liga: { chave: "mImport" },
          dica: "Está na `HomeScreen`. O caminho começa com dois pontos e uma barra: o que isso quer dizer para as pastas?",
          dicaForte: "Subir uma pasta, saindo de `screens`, e entrar em `components`. Procure o efeito do caminho.",
          resumo: "Sobe uma pasta e traz o componente de components.",
          pistaErro: "Lembrete: `import` fica na `HomeScreen` e traz algo que já foi exportado em outro arquivo.",
          flash: {
            titulo: "import { TaskInput }",
            texto: "Traz o componente de `'../components/TaskInput'`: sobe uma pasta, saindo de `screens`, e entra em `components`. As chaves são necessárias porque a exportação é nomeada; sem elas, o TypeScript reclama que não existe export default.",
            codigo: `import { TaskInput } from '../components/TaskInput';`
          }
        },
        {
          id: "6c",
          icone: "i-jsx",
          rotulo: "Uso na tela",
          codigo: "<TaskInput />",
          efeito: "6c",
          liga: { chave: "mJsx" },
          dica: "É onde o componente aparece de verdade, no lugar do bloco que só avisava que ali iria o campo.",
          dicaForte: "Aparece sem nenhuma prop, porque ele cuida sozinho do próprio estado. Procure o efeito de colocar na tela da HomeScreen.",
          resumo: "Coloca o campo e o botão na tela da HomeScreen.",
          pistaErro: "Lembrete: `<TaskInput />` só funciona depois que o componente foi exportado e importado.",
          flash: {
            titulo: "<TaskInput />",
            texto: "Coloca o campo e o botão na tela, sem nenhuma prop: o `TaskInput` funciona isolado e cuida sozinho do seu próprio estado interno.",
            codigo: `<View style={styles.container}>\n  <TaskInput />\n  ...\n</View>`
          }
        },
        {
          id: "6d",
          icone: "i-fc",
          rotulo: "Tipo do componente",
          codigo: `export const TaskInput:\n  React.FC = () => {`,
          efeito: "6d",
          liga: { demo: "props" },
          dica: "É a anotação de tipo do componente. Escrita assim, sem nada entre colchetes, o que ela diz sobre o que chega de fora?",
          dicaForte: "Sem props declaradas, passar qualquer uma gera erro no TypeScript. Procure o efeito de não receber nada de fora.",
          resumo: "Avisa que o componente não recebe props de fora.",
          pistaErro: "Lembrete: `React.FC` descreve o tipo do componente e do que ele aceita receber. Ele não exporta nem importa.",
          flash: {
            titulo: "React.FC",
            texto: "Declara o componente sem props entre colchetes: ele não espera receber nada de fora. Nos testes, passar `<TaskInput nome=\"x\" />` gerou erro de tipo.",
            codigo: `export const TaskInput: React.FC = () => {`
          }
        }
      ],
      efeitos: [
        { id: "6a", cena: "c-export", titulo: "Deixa o componente disponível para outros arquivos" },
        { id: "6b", cena: "c-import-sobe", titulo: "Sobe uma pasta e traz o componente de components" },
        { id: "6c", cena: "c-na-tela", titulo: "Coloca o campo e o botão na tela da HomeScreen" },
        { id: "6d", cena: "c-sem-props", titulo: "Avisa que o componente não recebe props de fora" },
        {
          id: "6x",
          cena: "c-lista",
          titulo: "Guarda a tarefa digitada na lista de tarefas da tela",
          isca: true,
          motivo: "Ainda não existe lista: por enquanto o `TaskInput` só mostra um alerta com o texto e limpa o campo. Conectar o componente de verdade ao estado da lista é um passo seguinte do projeto."
        }
      ]
    }
  ],

  guia: {
    objetivo:
      "Fixar, ligando cada trecho de código ao efeito que ele provoca, os quatro conceitos do TaskInput (useState, componente controlado, TouchableOpacity com Alert.alert e validação simples) e a montagem dos dois arquivos.",
    comoUsar: [
      "Projete a tela e deixe a sala ditar as ligações. Uma pessoa controla o mouse, mas a decisão é discutida antes de soltar o cabo.",
      "Em duplas, cada dupla assume uma estação e depois conta aos outros o que o celular mostrou ao final.",
      "Depois de cada estação, peça que alguém explique uma ligação sem olhar a tela.",
      "Não há cronômetro. As dicas podem ser limitadas (6 no jogo todo) ou ilimitadas; a escolha é feita na tela inicial.",
      "Os erros não tiram nada do jogo: só reduzem as estrelas da estação, e cada erro explica o que o código realmente faz."
    ],
    atencao: [
      "O celular da tela é uma simulação feita no navegador. Ela reproduz o que foi medido na versão web do app (react-native-web). A caixa de alerta real do celular, o teclado virtual e o efeito de opacidade no toque real não foram testados.",
      "Na versão web, `Alert.alert` é uma função vazia e nenhuma caixa aparece. O celular do jogo desenha os alertas por finalidade didática, exceto na demonstração “Rodando na web”.",
      "`trim()` remove espaços, tabs, quebras de linha e espaço sem quebra, mas não remove o espaço de largura zero (U+200B): esse caso passa pela validação.",
      "`Alert.alert` não bloqueia a execução: a linha seguinte roda sem esperar o OK. Por isso o campo já está limpo quando o alerta aparece.",
      "Com só espaços, o erro aparece e o campo não é limpo, porque o `return` acontece antes do `setTaskName('')`.",
      "Com `value` e sem `onChangeText`, o campo trava. Com `defaultValue` no lugar de `value`, digitar funciona, mas o campo não é limpo pelo `setTaskName('')`.",
      "`TouchableOpacity` não está marcado como obsoleto na documentação, mas ela recomenda `Pressable` como opção mais completa. O `SafeAreaView` importado de `react-native` (usado na HomeScreen dos slides) é obsoleto desde o React Native 0.81."
    ],
    perguntas: [
      "O que muda se trocarmos `value` por `defaultValue`? Teste no celular ao ligar só um dos fios.",
      "Por que `onPress={handleAddTask()}` mostra o alerta de erro assim que a tela abre?",
      "Se retirarmos o `return` do porteiro, o que a pessoa vê quando toca com o campo vazio?",
      "Por que o texto “Comprar pão” continua com o espaço do meio depois do `trim()`?"
    ]
  }
};
