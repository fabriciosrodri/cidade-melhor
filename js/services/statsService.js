/**
 * INDICADORES E RELATÓRIOS
 * Tudo é calculado a partir dos dados salvos, então os números mudam conforme o uso.
 */
import { ler, simularLatencia } from './storage.js';
import { CATEGORIAS } from '../config/categories.js';
import { STATUS } from '../config/status.js';
import { diasEntre } from '../utils/formatDate.js';

export async function obterResumo() {
  await simularLatencia(120);
  const ocorrencias = ler('ocorrencias', []);
  const usuarios = ler('usuarios', []);
  const contar = (status) => ocorrencias.filter((item) => item.status === status).length;
  const resolvidos = contar('resolvido');

  return {
    total: ocorrencias.length,
    reportados: contar('reportado'),
    emAnalise: contar('em_analise'),
    emAndamento: contar('em_andamento'),
    resolvidos,
    cidadaos: usuarios.filter((usuario) => usuario.perfil === 'cidadao').length,
    taxaResolucao: ocorrencias.length ? Math.round((resolvidos / ocorrencias.length) * 100) : 0,
    totalVotos: ler('votos', []).length,
  };
}

export async function obterRelatorios() {
  await simularLatencia(200);
  const ocorrencias = ler('ocorrencias', []);
  const votos = ler('votos', []);

  const porCategoria = CATEGORIAS.map((categoria) => ({
    ...categoria,
    total: ocorrencias.filter((item) => item.categoria === categoria.id).length,
  }));

  const porStatus = STATUS.map((status) => ({
    ...status,
    total: ocorrencias.filter((item) => item.status === status.id).length,
  }));

  // Últimos 6 meses, do mais antigo para o mais recente
  const porMes = [];
  const hoje = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const doMes = (iso) => {
      const data = new Date(iso);
      return data.getMonth() === mes.getMonth() && data.getFullYear() === mes.getFullYear();
    };
    porMes.push({
      rotulo: mes.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      reportados: ocorrencias.filter((item) => doMes(item.criadoEm)).length,
      resolvidos: ocorrencias.filter((item) => item.resolvidoEm && doMes(item.resolvidoEm)).length,
    });
  }

  const maisVotadas = ocorrencias
    .map((item) => ({ ...item, totalVotos: votos.filter((voto) => voto.ocorrenciaId === item.id).length }))
    .sort((a, b) => b.totalVotos - a.totalVotos)
    .slice(0, 5);

  const resolvidas = ocorrencias.filter((item) => item.resolvidoEm);
  const tempoMedio = resolvidas.length
    ? Math.round(resolvidas.reduce((soma, item) => soma + diasEntre(item.criadoEm, item.resolvidoEm), 0) / resolvidas.length)
    : 0;

  return { porCategoria, porStatus, porMes, maisVotadas, tempoMedio };
}
