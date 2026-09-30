/**
 * OCORRÊNCIAS (os "pins") — CRUD completo + alteração de status.
 *
 * Todas as funções são async, como se estivessem chamando um servidor.
 * Numa versão com backend, cada função vira um fetch(), por exemplo:
 *   listarOcorrencias()  →  GET    /api/ocorrencias
 *   criarOcorrencia()    →  POST   /api/ocorrencias
 *   atualizarOcorrencia()→  PUT    /api/ocorrencias/:id
 *   excluirOcorrencia()  →  DELETE /api/ocorrencias/:id
 */
import { ler, salvar, simularLatencia } from './storage.js';
import { usuarioAtual, ehGestor, nomeDoUsuario } from './authService.js';
import { criarNotificacao } from './notificationService.js';
import { obterStatus } from '../config/status.js';

/**
 * Junta na ocorrência as informações de outras "tabelas"
 * (nome do autor, número de votos e comentários), como um JOIN no banco de dados.
 */
function enriquecer(ocorrencia, votos, comentarios) {
  const usuario = usuarioAtual();
  const votosDaOcorrencia = votos.filter((voto) => voto.ocorrenciaId === ocorrencia.id);
  return {
    ...ocorrencia,
    autorNome: nomeDoUsuario(ocorrencia.autorId),
    totalVotos: votosDaOcorrencia.length,
    totalComentarios: comentarios.filter((comentario) => comentario.ocorrenciaId === ocorrencia.id).length,
    usuarioVotou: Boolean(usuario && votosDaOcorrencia.some((voto) => voto.usuarioId === usuario.id)),
    ehDoUsuario: Boolean(usuario && usuario.id === ocorrencia.autorId),
  };
}

/** Lista todas as ocorrências (mais recentes primeiro). Filtros ficam em components/filters.js. */
export async function listarOcorrencias({ autorId } = {}) {
  await simularLatencia();
  const votos = ler('votos', []);
  const comentarios = ler('comentarios', []);
  return ler('ocorrencias', [])
    .filter((ocorrencia) => !autorId || ocorrencia.autorId === autorId)
    .map((ocorrencia) => enriquecer(ocorrencia, votos, comentarios))
    .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
}

export async function obterOcorrencia(id) {
  await simularLatencia(120);
  const ocorrencia = ler('ocorrencias', []).find((item) => item.id === Number(id));
  if (!ocorrencia) return null;
  return enriquecer(ocorrencia, ler('votos', []), ler('comentarios', []));
}

export async function criarOcorrencia(dados) {
  await simularLatencia(500);
  const usuario = usuarioAtual();
  if (!usuario) throw new Error('Você precisa estar logado para reportar um problema.');

  const ocorrencias = ler('ocorrencias', []);
  const id = ler('proximoIdOcorrencia', 3000);
  const agora = new Date().toISOString();

  const nova = {
    id,
    titulo: dados.titulo.trim(),
    descricao: dados.descricao.trim(),
    categoria: dados.categoria,
    latitude: Number(dados.latitude),
    longitude: Number(dados.longitude),
    endereco: dados.endereco.trim(),
    bairro: (dados.bairro || '').trim(),
    fotos: dados.fotos || [],
    autorId: usuario.id,
    status: 'reportado', // toda ocorrência nasce como "Reportado"
    historicoStatus: [{ status: 'reportado', data: agora, alteradoPor: usuario.id }],
    criadoEm: agora,
    atualizadoEm: agora,
    resolvidoEm: null,
  };

  ocorrencias.push(nova);
  salvar('ocorrencias', ocorrencias); // pode lançar ErroArmazenamentoCheio
  salvar('proximoIdOcorrencia', id + 1);
  return enriquecer(nova, [], []);
}

/** Busca a ocorrência e confere se o usuário logado é o autor. */
function obterParaEdicao(ocorrencias, id) {
  const usuario = usuarioAtual();
  const indice = ocorrencias.findIndex((item) => item.id === Number(id));
  if (indice === -1) throw new Error('Ocorrência não encontrada.');
  if (!usuario || ocorrencias[indice].autorId !== usuario.id) {
    throw new Error('Somente o autor pode alterar esta ocorrência.');
  }
  return indice;
}

export async function atualizarOcorrencia(id, dados) {
  await simularLatencia(400);
  const ocorrencias = ler('ocorrencias', []);
  const indice = obterParaEdicao(ocorrencias, id);

  // Só estes campos podem ser editados pelo autor (status, autor e datas não)
  const camposEditaveis = ['titulo', 'descricao', 'categoria', 'latitude', 'longitude', 'endereco', 'bairro', 'fotos'];
  const atualizada = { ...ocorrencias[indice] };
  camposEditaveis.forEach((campo) => {
    if (dados[campo] !== undefined) atualizada[campo] = typeof dados[campo] === 'string' ? dados[campo].trim() : dados[campo];
  });
  atualizada.latitude = Number(atualizada.latitude);
  atualizada.longitude = Number(atualizada.longitude);
  atualizada.atualizadoEm = new Date().toISOString();

  ocorrencias[indice] = atualizada;
  salvar('ocorrencias', ocorrencias);
  return enriquecer(atualizada, ler('votos', []), ler('comentarios', []));
}

export async function excluirOcorrencia(id) {
  await simularLatencia(300);
  const ocorrencias = ler('ocorrencias', []);
  obterParaEdicao(ocorrencias, id);
  const idNumero = Number(id);

  // Remove a ocorrência e tudo que depende dela (votos, comentários, notificações)
  salvar('ocorrencias', ocorrencias.filter((item) => item.id !== idNumero));
  salvar('votos', ler('votos', []).filter((item) => item.ocorrenciaId !== idNumero));
  salvar('comentarios', ler('comentarios', []).filter((item) => item.ocorrenciaId !== idNumero));
  salvar('notificacoes', ler('notificacoes', []).filter((item) => item.ocorrenciaId !== idNumero));
}

/** Somente o GESTOR pode mudar o status (Reportado → Em análise → Em andamento → Resolvido). */
export async function alterarStatus(id, novoStatus) {
  await simularLatencia(300);
  const usuario = usuarioAtual();
  if (!ehGestor(usuario)) throw new Error('Somente gestores podem alterar o status.');

  const ocorrencias = ler('ocorrencias', []);
  const ocorrencia = ocorrencias.find((item) => item.id === Number(id));
  if (!ocorrencia) throw new Error('Ocorrência não encontrada.');
  if (ocorrencia.status === novoStatus) return enriquecer(ocorrencia, ler('votos', []), ler('comentarios', []));

  const agora = new Date().toISOString();
  ocorrencia.status = novoStatus;
  ocorrencia.historicoStatus = [...(ocorrencia.historicoStatus || []), { status: novoStatus, data: agora, alteradoPor: usuario.id }];
  ocorrencia.atualizadoEm = agora;
  // Data de resolução: usada na página "Resolvidos" para calcular o tempo até resolver
  ocorrencia.resolvidoEm = novoStatus === 'resolvido' ? agora : null;

  salvar('ocorrencias', ocorrencias);

  criarNotificacao({
    usuarioId: ocorrencia.autorId,
    tipo: 'status',
    ocorrenciaId: ocorrencia.id,
    mensagem: `Sua ocorrência "${ocorrencia.titulo}" agora está ${obterStatus(novoStatus).nome}.`,
  });

  return enriquecer(ocorrencia, ler('votos', []), ler('comentarios', []));
}
