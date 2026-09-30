/**
 * UPVOTES ("confirmar problema")
 * Regras: precisa estar logado, 1 voto por pessoa por ocorrência,
 * pode retirar o voto e não pode votar no próprio pin.
 */
import { ler, salvar, gerarId, simularLatencia } from './storage.js';
import { usuarioAtual } from './authService.js';
import { criarNotificacao } from './notificationService.js';

/**
 * Dá o voto se ainda não votou, ou retira se já votou.
 * Devolve { votou: boolean, total: number }.
 */
export async function alternarVoto(ocorrenciaId) {
  await simularLatencia(150);
  const usuario = usuarioAtual();
  if (!usuario) throw new Error('Entre na sua conta para confirmar problemas.');

  const id = Number(ocorrenciaId);
  const ocorrencia = ler('ocorrencias', []).find((item) => item.id === id);
  if (!ocorrencia) throw new Error('Ocorrência não encontrada.');
  if (ocorrencia.autorId === usuario.id) throw new Error('Você não pode confirmar o seu próprio problema.');

  let votos = ler('votos', []);
  const votoExistente = votos.find((voto) => voto.ocorrenciaId === id && voto.usuarioId === usuario.id);

  if (votoExistente) {
    votos = votos.filter((voto) => voto !== votoExistente);
  } else {
    votos.push({ id: gerarId('v'), ocorrenciaId: id, usuarioId: usuario.id, criadoEm: new Date().toISOString() });
    criarNotificacao({
      usuarioId: ocorrencia.autorId,
      tipo: 'upvote',
      ocorrenciaId: id,
      mensagem: `${usuario.nome} confirmou o seu problema "${ocorrencia.titulo}".`,
    });
  }

  salvar('votos', votos);
  return {
    votou: !votoExistente,
    total: votos.filter((voto) => voto.ocorrenciaId === id).length,
  };
}
