/**
 * Status possíveis de uma ocorrência, na ordem do fluxo:
 * Reportado → Em análise → Em andamento → Resolvido
 */
export const STATUS = [
  { id: 'reportado',    nome: 'Reportado',    cor: '#475569', fundo: '#F1F5F9', icone: 'flag' },
  { id: 'em_analise',   nome: 'Em análise',   cor: '#B45309', fundo: '#FEF3C7', icone: 'clock' },
  { id: 'em_andamento', nome: 'Em andamento', cor: '#1D4ED8', fundo: '#DBEAFE', icone: 'hammer' },
  { id: 'resolvido',    nome: 'Resolvido',    cor: '#15803D', fundo: '#DCFCE7', icone: 'circle-check' },
];

export function obterStatus(id) {
  return STATUS.find((status) => status.id === id) || STATUS[0];
}
