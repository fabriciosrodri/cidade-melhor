/**
 * CAMADA DE ARMAZENAMENTO
 * É o ÚNICO arquivo do projeto que conversa diretamente com o localStorage.
 * Os outros services usam as funções daqui; as páginas usam os services.
 *
 * Quando existir um backend (Node.js + Express + PostgreSQL), os services
 * passarão a usar fetch() para a API e este arquivo deixará de ser necessário.
 */
import { gerarDadosIniciais } from '../data/seed.js';
import { VERSAO_DADOS } from '../config/constants.js';

const PREFIXO = 'cidadeMelhor:';
const TABELAS = ['usuarios', 'ocorrencias', 'votos', 'comentarios', 'notificacoes', 'proximoIdOcorrencia'];

/** Erro lançado quando o navegador não tem mais espaço (localStorage cheio). */
export class ErroArmazenamentoCheio extends Error {
  constructor() {
    super('O armazenamento do navegador está cheio. Tente usar fotos menores ou remova ocorrências antigas.');
    this.name = 'ErroArmazenamentoCheio';
  }
}

export function ler(chave, valorPadrao = null) {
  try {
    const texto = localStorage.getItem(PREFIXO + chave);
    return texto === null ? valorPadrao : JSON.parse(texto);
  } catch {
    return valorPadrao; // dado corrompido ou localStorage bloqueado
  }
}

export function salvar(chave, valor) {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch (erro) {
    // O navegador lança QuotaExceededError quando passa do limite (~5 MB)
    if (erro && (erro.name === 'QuotaExceededError' || erro.code === 22)) {
      throw new ErroArmazenamentoCheio();
    }
    throw erro;
  }
}

export function remover(chave) {
  try {
    localStorage.removeItem(PREFIXO + chave);
  } catch {
    /* ignora */
  }
}

/** Gera um id único simples (ex.: "k3f9x2ab"). */
export function gerarId(prefixo = '') {
  return prefixo + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * Simula o tempo de resposta de um servidor.
 * Assim os "carregando..." aparecem como numa aplicação real.
 */
export function simularLatencia(ms = 180) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

/** Carrega os dados de demonstração no primeiro acesso (ou se a versão mudou). */
export function inicializarDados() {
  if (ler('versao') === VERSAO_DADOS) return;
  carregarDadosDemonstracao();
}

function carregarDadosDemonstracao() {
  const dados = gerarDadosIniciais();
  TABELAS.forEach((tabela) => salvar(tabela, dados[tabela]));
  salvar('versao', VERSAO_DADOS);
}

/** Apaga tudo e volta aos dados de demonstração (botão na página "Sobre"). */
export function restaurarDemonstracao() {
  Object.keys(localStorage)
    .filter((chave) => chave.startsWith(PREFIXO))
    .forEach((chave) => localStorage.removeItem(chave));
  try {
    sessionStorage.removeItem(PREFIXO + 'sessao');
  } catch {
    /* ignora */
  }
  carregarDadosDemonstracao();
}
