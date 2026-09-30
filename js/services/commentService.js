/** COMENTÁRIOS de uma ocorrência. */
import { ler, salvar, gerarId, simularLatencia } from './storage.js';
import { usuarioAtual, nomeDoUsuario, perfilDoUsuario } from './authService.js';
import { criarNotificacao } from './notificationService.js';

export async function listarComentarios(ocorrenciaId) {
  await simularLatencia(120);
  const usuario = usuarioAtual();
  return ler('comentarios', [])
    .filter((comentario) => comentario.ocorrenciaId === Number(ocorrenciaId))
    .sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm))
    .map((comentario) => ({
      ...comentario,
      autorNome: nomeDoUsuario(comentario.usuarioId),
      autorEhGestor: perfilDoUsuario(comentario.usuarioId) === 'gestor',
      ehDoUsuario: Boolean(usuario && usuario.id === comentario.usuarioId),
    }));
}

export async function adicionarComentario(ocorrenciaId, texto) {
  await simularLatencia(250);
  const usuario = usuarioAtual();
  if (!usuario) throw new Error('Entre na sua conta para comentar.');
  const conteudo = texto.trim();
  if (conteudo.length < 2) throw new Error('Escreva um comentário.');
  if (conteudo.length > 500) throw new Error('O comentário pode ter no máximo 500 caracteres.');

  const id = Number(ocorrenciaId);
  const ocorrencia = ler('ocorrencias', []).find((item) => item.id === id);
  if (!ocorrencia) throw new Error('Ocorrência não encontrada.');

  const comentarios = ler('comentarios', []);
  const novo = { id: gerarId('c'), ocorrenciaId: id, usuarioId: usuario.id, texto: conteudo, criadoEm: new Date().toISOString() };
  comentarios.push(novo);
  salvar('comentarios', comentarios);

  criarNotificacao({
    usuarioId: ocorrencia.autorId,
    tipo: 'comentario',
    ocorrenciaId: id,
    mensagem: `${usuario.nome} comentou em "${ocorrencia.titulo}".`,
  });
  return novo;
}

export async function excluirComentario(comentarioId) {
  await simularLatencia(200);
  const usuario = usuarioAtual();
  const comentarios = ler('comentarios', []);
  const comentario = comentarios.find((item) => item.id === comentarioId);
  if (!comentario) throw new Error('Comentário não encontrado.');
  if (!usuario || comentario.usuarioId !== usuario.id) throw new Error('Você só pode excluir os seus comentários.');
  salvar('comentarios', comentarios.filter((item) => item.id !== comentarioId));
}
