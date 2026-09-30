/**
 * Gera o SVG de um ícone da biblioteca Lucide como texto (string).
 * Assim podemos usar ícones direto dentro de template strings:
 *   `<button>${icone('plus')} Novo</button>`
 *
 * A biblioteca é carregada via CDN em cada página e fica em window.lucide.
 */

// "trash-2" → "Trash2", "circle-check" → "CircleCheck"
function paraPascalCase(nome) {
  return nome
    .split('-')
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join('');
}

export function icone(nome, { tamanho = 18, classe = '', espessura = 2 } = {}) {
  const biblioteca = window.lucide && window.lucide.icons;
  const desenho = biblioteca && biblioteca[paraPascalCase(nome)];
  if (!desenho) return ''; // biblioteca não carregou: melhor sem ícone do que com erro

  // Cada ícone é uma lista de elementos: [["path", { d: "..." }], ["circle", {...}]]
  const elementos = desenho
    .map(([tag, atributos]) => {
      const attrs = Object.entries(atributos)
        .map(([chave, valor]) => `${chave}="${valor}"`)
        .join(' ');
      return `<${tag} ${attrs}/>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${espessura}" stroke-linecap="round" stroke-linejoin="round" class="icone ${classe}" aria-hidden="true">${elementos}</svg>`;
}
