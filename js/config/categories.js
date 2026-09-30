/**
 * Categorias de problema — ÚNICA fonte da verdade do site.
 * Mapa, filtros, badges, formulários e gráficos leem daqui.
 * Para criar uma nova categoria, basta adicionar um item nesta lista.
 *
 * - id:    identificador salvo nos dados (nunca muda)
 * - nome:  texto exibido para o usuário
 * - curto: versão curta para legendas e filtros
 * - cor:   cor principal do pin e do badge
 * - icone: nome do ícone da biblioteca Lucide (https://lucide.dev/icons)
 */
export const CATEGORIAS = [
  { id: 'buraco',     nome: 'Buraco / asfalto danificado',     curto: 'Buracos',         cor: '#F59E0B', icone: 'construction' },
  { id: 'alagamento', nome: 'Alagamento',                      curto: 'Alagamentos',     cor: '#EF4444', icone: 'waves' },
  { id: 'esgoto',     nome: 'Vazamento de esgoto',             curto: 'Esgoto',          cor: '#92400E', icone: 'droplets' },
  { id: 'lixo',       nome: 'Lixo acumulado / entulho',        curto: 'Lixo',            cor: '#8B5CF6', icone: 'trash-2' },
  { id: 'iluminacao', nome: 'Iluminação pública',              curto: 'Iluminação',      cor: '#22C55E', icone: 'lightbulb' },
  { id: 'calcada',    nome: 'Calçada quebrada',                curto: 'Calçadas',        cor: '#2563EB', icone: 'footprints' },
  { id: 'vandalismo', nome: 'Pichação / vandalismo',           curto: 'Vandalismo',      cor: '#EC4899', icone: 'spray-can' },
  { id: 'arvores',    nome: 'Árvores ou galhos obstruindo',    curto: 'Árvores',         cor: '#15803D', icone: 'tree-pine' },
  { id: 'veiculo',    nome: 'Veículo abandonado',              curto: 'Veículos',        cor: '#475569', icone: 'car' },
  { id: 'outros',     nome: 'Outros',                          curto: 'Outros',          cor: '#9CA3AF', icone: 'ellipsis' },
];

/** Busca uma categoria pelo id. Se não existir, devolve "Outros" para não quebrar a tela. */
export function obterCategoria(id) {
  return CATEGORIAS.find((categoria) => categoria.id === id) || CATEGORIAS[CATEGORIAS.length - 1];
}
