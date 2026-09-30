/**
 * FILTROS de ocorrências — funções "puras": recebem a lista e devolvem a lista filtrada,
 * sem mexer na tela. Por isso são reaproveitadas no mapa, em Meus Pins e em Resolvidos.
 */
import { dentroDoPeriodo } from '../utils/formatDate.js';

export const OPCOES_PERIODO = [
  { valor: '', texto: 'Qualquer período' },
  { valor: '7', texto: 'Últimos 7 dias' },
  { valor: '30', texto: 'Últimos 30 dias' },
  { valor: '90', texto: 'Últimos 90 dias' },
  { valor: '365', texto: 'Último ano' },
];

/**
 * @param {Array} ocorrencias
 * @param {object} filtros { categoria, status, periodo (dias), autorId, busca, campoData }
 */
export function filtrarOcorrencias(ocorrencias, filtros = {}) {
  const { categoria, status, periodo, autorId, busca, campoData = 'criadoEm' } = filtros;
  const termo = (busca || '').trim().toLowerCase();

  return ocorrencias.filter((ocorrencia) => {
    if (categoria && categoria !== 'todas' && ocorrencia.categoria !== categoria) return false;
    if (status && status !== 'todos' && ocorrencia.status !== status) return false;
    if (autorId && ocorrencia.autorId !== autorId) return false;
    if (periodo && !dentroDoPeriodo(ocorrencia[campoData], Number(periodo))) return false;
    if (termo) {
      const texto = `${ocorrencia.titulo} ${ocorrencia.endereco} ${ocorrencia.bairro}`.toLowerCase();
      if (!texto.includes(termo)) return false;
    }
    return true;
  });
}

/** Gera as <option> de um <select>. */
export function opcoesSelect(lista, valorSelecionado = '') {
  return lista
    .map((item) => `<option value="${item.valor}" ${String(item.valor) === String(valorSelecionado) ? 'selected' : ''}>${item.texto}</option>`)
    .join('');
}
