/** Logo do Cidade Melhor (desenhado em SVG, sem precisar de imagem). */
export const MARCA_SVG = `
  <svg class="logo-marca" viewBox="0 0 40 40" aria-hidden="true">
    <defs>
      <linearGradient id="gradienteLogo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3B7BFF"/>
        <stop offset="1" stop-color="#1A5CE5"/>
      </linearGradient>
    </defs>
    <path d="M20 2C12.3 2 6 8.1 6 15.7c0 10 12.2 21 13 21.7a1.5 1.5 0 0 0 2 0C21.8 36.7 34 25.7 34 15.7 34 8.1 27.7 2 20 2Z" fill="url(#gradienteLogo)"/>
    <circle cx="20" cy="15.5" r="7.5" fill="#fff"/>
    <circle cx="20" cy="15.5" r="3.6" fill="#0F1B3D"/>
  </svg>`;

export function logoHtml({ comSlogan = true } = {}) {
  return `
    <a href="index.html" class="logo" aria-label="Cidade Melhor - página inicial">
      ${MARCA_SVG}
      <span class="logo-texto">
        <span class="logo-nome">Cidade <span>Melhor</span></span>
        ${comSlogan ? '<span class="logo-slogan">Sua cidade, nossa responsabilidade.</span>' : ''}
      </span>
    </a>`;
}
