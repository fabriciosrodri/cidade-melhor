/** Pequenos atalhos para trabalhar com o DOM. */

export const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
export const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];

/**
 * Escapa caracteres especiais de HTML.
 * MUITO IMPORTANTE: todo texto digitado pelo usuário (título, descrição,
 * comentário...) passa por aqui antes de ir para o innerHTML. Sem isso,
 * alguém poderia escrever <script> num comentário e rodar código no site
 * de outras pessoas (ataque conhecido como XSS).
 */
export function escaparHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Lê um parâmetro da URL. Ex.: em "ocorrencia.html?id=2801", parametroUrl('id') → "2801" */
export function parametroUrl(nome) {
  return new URLSearchParams(window.location.search).get(nome);
}

/**
 * Debounce: só executa a função depois que o usuário PARA de chamar por `espera` ms.
 * Usado na busca de endereço para não disparar uma requisição a cada tecla.
 */
export function debounce(funcao, espera = 400) {
  let temporizador;
  return (...argumentos) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => funcao(...argumentos), espera);
  };
}

/** Número formatado no padrão brasileiro: 1248 → "1.248" */
export function formatarNumero(numero) {
  return Number(numero || 0).toLocaleString('pt-BR');
}

/** Iniciais para o avatar: "João Silva" → "JS" */
export function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

/** Plural simples: plural(1, 'voto', 'votos') → "1 voto" */
export function plural(quantidade, singular, pluralTexto) {
  return `${formatarNumero(quantidade)} ${quantidade === 1 ? singular : pluralTexto}`;
}

/**
 * Garante que o endereço de retorno após o login é uma página do próprio site
 * (evita que um link malicioso redirecione o usuário para outro domínio).
 */
export function enderecoInternoSeguro(endereco, padrao = 'mapa.html') {
  if (!endereco) return padrao;
  const pareceExterno = /^[a-z]+:|^\/\//i.test(endereco);
  return pareceExterno ? padrao : endereco;
}
