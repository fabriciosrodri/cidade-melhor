/** NOTIFICAÇÕES: avisam o autor quando seu pin recebe voto, comentário ou muda de status. */
import { ler, salvar, gerarId, simularLatencia } from './storage.js';
import { usuarioAtual } from './authService.js';

/** Cria uma notificação (usado pelos outros services, não pelas páginas). */
export function criarNotificacao({ usuarioId, tipo, ocorrenciaId, mensagem }) {
  const atual = usuarioAtual();
  if (atual && atual.id === usuarioId) return; // ninguém é notificado das próprias ações

  const notificacoes = ler('notificacoes', []);
  notificacoes.push({
    id: gerarId('n'),
    usuarioId,
    tipo,
    ocorrenciaId,
    mensagem,
    lida: false,
    criadoEm: new Date().toISOString(),
  });
  // Guarda só as 100 mais recentes para não ocupar espaço à toa
  salvar('notificacoes', notificacoes.slice(-100));
}

export async function listarNotificacoes(limite = 10) {
  await simularLatencia(80);
  const usuario = usuarioAtual();
  if (!usuario) return [];
  return ler('notificacoes', [])
    .filter((notificacao) => notificacao.usuarioId === usuario.id)
    .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
    .slice(0, limite);
}

export function contarNaoLidas() {
  const usuario = usuarioAtual();
  if (!usuario) return 0;
  return ler('notificacoes', []).filter((item) => item.usuarioId === usuario.id && !item.lida).length;
}

export async function marcarTodasComoLidas() {
  const usuario = usuarioAtual();
  if (!usuario) return;
  const notificacoes = ler('notificacoes', []).map((item) =>
    item.usuarioId === usuario.id ? { ...item, lida: true } : item
  );
  salvar('notificacoes', notificacoes);
}
