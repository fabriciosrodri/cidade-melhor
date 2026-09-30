/**
 * AUTENTICAÇÃO (SIMULADA)
 * ⚠️ Protótipo: não existe segurança real aqui, porque tudo fica no navegador.
 * Numa versão com backend, o servidor é quem confere a senha e devolve um token.
 *
 * Mesmo assim, não guardamos a senha em texto puro: guardamos o HASH SHA-256.
 * Hash é uma "impressão digital" da senha: dá para comparar, mas não dá para
 * descobrir a senha original a partir dele.
 */
import { ler, salvar, gerarId, simularLatencia } from './storage.js';

const CHAVE_SESSAO = 'cidadeMelhor:sessao';

/** Calcula o hash SHA-256 de um texto usando a API de criptografia do navegador. */
export async function gerarHash(texto) {
  const bytes = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Remove o hash antes de devolver o usuário para as páginas. */
function semSenha(usuario) {
  if (!usuario) return null;
  const { senhaHash, ...dadosPublicos } = usuario;
  return dadosPublicos;
}

/* ---------- Sessão ---------- */

function lerSessao() {
  try {
    const texto = localStorage.getItem(CHAVE_SESSAO) || sessionStorage.getItem(CHAVE_SESSAO);
    return texto ? JSON.parse(texto) : null;
  } catch {
    return null;
  }
}

function salvarSessao(usuarioId, lembrar) {
  const sessao = JSON.stringify({ usuarioId, iniciadaEm: new Date().toISOString() });
  // "Lembrar de mim": localStorage continua depois de fechar o navegador; sessionStorage não.
  if (lembrar) localStorage.setItem(CHAVE_SESSAO, sessao);
  else sessionStorage.setItem(CHAVE_SESSAO, sessao);
}

/**
 * Usuário logado agora (ou null).
 * É síncrona de propósito: o header precisa dessa informação imediatamente.
 */
export function usuarioAtual() {
  const sessao = lerSessao();
  if (!sessao) return null;
  const usuario = ler('usuarios', []).find((item) => item.id === sessao.usuarioId);
  return semSenha(usuario);
}

export function ehGestor(usuario = usuarioAtual()) {
  return Boolean(usuario && usuario.perfil === 'gestor');
}

/* ---------- Ações ---------- */

export async function entrar(email, senha, lembrar = false) {
  await simularLatencia(400);
  const usuarios = ler('usuarios', []);
  const usuario = usuarios.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  const hash = await gerarHash(senha);

  // Mensagem genérica de propósito: não revelamos se o e-mail existe.
  if (!usuario || usuario.senhaHash !== hash) {
    throw new Error('E-mail ou senha incorretos.');
  }
  salvarSessao(usuario.id, lembrar);
  return semSenha(usuario);
}

export async function emailJaCadastrado(email) {
  const usuarios = ler('usuarios', []);
  return usuarios.some((item) => item.email.toLowerCase() === email.trim().toLowerCase());
}

export async function cadastrar({ nome, email, senha }) {
  await simularLatencia(500);
  if (await emailJaCadastrado(email)) {
    throw new Error('Este e-mail já está cadastrado.');
  }
  const usuarios = ler('usuarios', []);
  const novoUsuario = {
    id: gerarId('u'),
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    perfil: 'cidadao',
    senhaHash: await gerarHash(senha),
    criadoEm: new Date().toISOString(),
  };
  usuarios.push(novoUsuario);
  salvar('usuarios', usuarios);
  salvarSessao(novoUsuario.id, true);
  return semSenha(novoUsuario);
}

export function sair() {
  localStorage.removeItem(CHAVE_SESSAO);
  sessionStorage.removeItem(CHAVE_SESSAO);
}

/** Nome de um usuário pelo id (usado para mostrar o autor de pins e comentários). */
export function nomeDoUsuario(usuarioId) {
  const usuario = ler('usuarios', []).find((item) => item.id === usuarioId);
  return usuario ? usuario.nome : 'Usuário removido';
}

export function perfilDoUsuario(usuarioId) {
  const usuario = ler('usuarios', []).find((item) => item.id === usuarioId);
  return usuario ? usuario.perfil : 'cidadao';
}
