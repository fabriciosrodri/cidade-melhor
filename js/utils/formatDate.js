/** Funções de data no padrão brasileiro. As datas são salvas como texto ISO. */

const UM_DIA = 24 * 60 * 60 * 1000;

function inicioDoDia(data) {
  const copia = new Date(data);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

/** "30/09/2026" */
export function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

/** "30/09/2026 às 10:32" */
export function formatarDataHora(iso) {
  const data = new Date(iso);
  return `${data.toLocaleDateString('pt-BR')} às ${formatarHora(iso)}`;
}

/** "10:32" */
export function formatarHora(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** "setembro de 2026" */
export function formatarMesAno(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

/** Diferença em dias inteiros entre duas datas (ignora as horas). */
export function diasEntre(inicioIso, fimIso) {
  return Math.round((inicioDoDia(fimIso) - inicioDoDia(inicioIso)) / UM_DIA);
}

/**
 * Data amigável: "Hoje, 10:32", "Ontem, 18:05", "há 3 dias", "há 2 meses" ou a data completa.
 */
export function dataRelativa(iso) {
  const dias = diasEntre(iso, new Date());
  if (dias <= 0) return `Hoje, ${formatarHora(iso)}`;
  if (dias === 1) return `Ontem, ${formatarHora(iso)}`;
  if (dias < 30) return `há ${dias} dias`;
  const meses = Math.floor(dias / 30);
  if (meses < 12) return meses === 1 ? 'há 1 mês' : `há ${meses} meses`;
  return formatarData(iso);
}

/** "resolvido em 12 dias" / "resolvido no mesmo dia" */
export function textoTempoResolucao(inicioIso, fimIso) {
  const dias = diasEntre(inicioIso, fimIso);
  if (dias <= 0) return 'resolvido no mesmo dia';
  if (dias === 1) return 'resolvido em 1 dia';
  return `resolvido em ${dias} dias`;
}

/** true se a data está dentro dos últimos `dias` dias */
export function dentroDoPeriodo(iso, dias) {
  if (!dias) return true;
  return Date.now() - new Date(iso).getTime() <= dias * UM_DIA;
}
