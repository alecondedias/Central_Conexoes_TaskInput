/*
 * Verificação do conteúdo da Central de Conexões do TaskInput.
 * Não precisa de navegador nem de dependências: node testes/verificar.js
 *
 * 1. Confere se cada estação está completa e coerente (códigos, efeitos, isca, dicas, fichas).
 * 2. Confere se todo ícone, toda cena e toda demonstração do celular citados nos dados existem.
 * 3. Percorre todos os pares código x efeito e confirma que cada código tem exatamente uma ligação certa.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");

global.window = {};
require(path.join(raiz, "dados.js"));
require(path.join(raiz, "ilustracoes.js"));
const D = global.window.DADOS;
const IL = global.window.ILUSTRACOES;
const celularJs = fs.readFileSync(path.join(raiz, "celular.js"), "utf8");
const demosCelular = new Set((celularJs.match(/^\s{4}(\w+): async function/gm) || []).map((l) => l.trim().split(":")[0]));

const erros = [];
const erro = (m) => erros.push(m);
const icones = new Set(IL.chavesIcones());
const cenas = new Set(IL.chavesCenas());
const usadosIcones = new Set();
const usadasCenas = new Set();
let totalCodigos = 0, totalEfeitos = 0, totalIscas = 0, totalLigacoes = 0, totalErradas = 0;

if (!Array.isArray(D.cores) || D.cores.length < 4) erro("faltam cores de cabo em DADOS.cores");

for (const est of D.estacoes) {
  const nome = est.id;
  if (!est.nome || !est.missao) erro(`${nome}: falta nome ou missão`);
  const idsC = new Set(est.conceitos.map((c) => c.id));
  const idsE = new Set(est.efeitos.map((e) => e.id));
  if (idsC.size !== est.conceitos.length) erro(`${nome}: ids de código repetidos`);
  if (idsE.size !== est.efeitos.length) erro(`${nome}: ids de efeito repetidos`);
  if (est.conceitos.length !== 4) erro(`${nome}: esperados 4 códigos, achei ${est.conceitos.length}`);
  if (est.efeitos.length !== est.conceitos.length + 1) erro(`${nome}: esperado 1 efeito a mais que os códigos`);
  const iscas = est.efeitos.filter((e) => e.isca);
  if (iscas.length !== 1) erro(`${nome}: esperada exatamente 1 isca, achei ${iscas.length}`);
  const ledChaves = new Set((est.leds || []).map((l) => l.chave));
  const alvos = est.conceitos.map((c) => c.efeito);
  if (new Set(alvos).size !== alvos.length) erro(`${nome}: dois códigos ligam ao mesmo efeito`);

  for (const c of est.conceitos) {
    totalCodigos++;
    for (const k of ["rotulo", "codigo", "dica", "dicaForte", "resumo", "pistaErro", "icone"]) {
      if (!c[k]) erro(`${nome}.${c.id}: falta ${k}`);
    }
    if (!c.flash || !c.flash.titulo || !c.flash.texto || !c.flash.codigo) erro(`${nome}.${c.id}: ficha incompleta`);
    const ef = est.efeitos.find((e) => e.id === c.efeito);
    if (!ef) erro(`${nome}.${c.id}: efeito inexistente (${c.efeito})`);
    else if (ef.isca) erro(`${nome}.${c.id}: o gabarito aponta para a isca`);
    if (!c.liga || (!c.liga.chave && !c.liga.demo)) erro(`${nome}.${c.id}: falta o que o celular faz (liga.chave ou liga.demo)`);
    if (c.liga && c.liga.chave && !ledChaves.has(c.liga.chave)) erro(`${nome}.${c.id}: chave "${c.liga.chave}" não tem LED na estação`);
    if (c.liga && c.liga.demo && !demosCelular.has(c.liga.demo)) erro(`${nome}.${c.id}: demonstração "${c.liga.demo}" não existe em celular.js`);
    if (c.icone) { usadosIcones.add(c.icone); if (!icones.has(c.icone)) erro(`${nome}.${c.id}: ícone inexistente (${c.icone})`); }
  }
  for (const e of est.efeitos) {
    totalEfeitos++;
    if (!e.titulo) erro(`${nome}.${e.id}: falta título`);
    if (e.cena) { usadasCenas.add(e.cena); if (!cenas.has(e.cena)) erro(`${nome}.${e.id}: cena inexistente (${e.cena})`); }
    else erro(`${nome}.${e.id}: falta cena`);
    if (e.isca) { totalIscas++; if (!e.motivo) erro(`${nome}.${e.id}: isca sem motivo`); }
  }

  /* 3. todos os pares código x efeito: um certo por código, o resto errado */
  for (const c of est.conceitos) {
    for (const e of est.efeitos) {
      totalLigacoes++;
      if (c.efeito !== e.id) totalErradas++;
    }
  }
}
for (const i of icones) if (!usadosIcones.has(i)) erro(`ícone sem uso: ${i}`);
for (const c of cenas) if (!usadasCenas.has(c)) erro(`cena sem uso: ${c}`);

if (erros.length) {
  console.error("FALHOU:\n- " + erros.join("\n- "));
  process.exit(1);
}
console.log(
  `OK: ${D.estacoes.length} estações, ${totalCodigos} códigos, ${totalEfeitos} efeitos (${totalIscas} iscas), ` +
  `${icones.size} ícones e ${cenas.size} cenas em uso, ${totalLigacoes} pares código x efeito (${totalCodigos} certos e ${totalErradas} errados).`
);
