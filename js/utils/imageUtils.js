import { TAMANHO_MAX_FOTO, QUALIDADE_FOTO } from '../config/constants.js';

/**
 * Reduz uma foto escolhida pelo usuário antes de salvar.
 * Por quê? Uma foto de celular tem 3–8 MB e o localStorage só aguenta ~5 MB no total.
 * Redimensionando para no máximo 1024px e comprimindo em JPEG, ela cai para ~100 KB.
 *
 * Devolve uma Promise com a imagem em base64 ("data:image/jpeg;base64,...").
 */
export function redimensionarImagem(arquivo, tamanhoMaximo = TAMANHO_MAX_FOTO, qualidade = QUALIDADE_FOTO) {
  return new Promise((resolver, rejeitar) => {
    if (!arquivo.type.startsWith('image/')) {
      rejeitar(new Error('O arquivo escolhido não é uma imagem.'));
      return;
    }

    const leitor = new FileReader();
    leitor.onerror = () => rejeitar(new Error('Não foi possível ler a imagem.'));
    leitor.onload = () => {
      const imagem = new Image();
      imagem.onerror = () => rejeitar(new Error('Formato de imagem não suportado.'));
      imagem.onload = () => {
        // Mantém a proporção: o lado maior vira no máximo `tamanhoMaximo`
        const escala = Math.min(1, tamanhoMaximo / Math.max(imagem.width, imagem.height));
        const largura = Math.round(imagem.width * escala);
        const altura = Math.round(imagem.height * escala);

        const canvas = document.createElement('canvas');
        canvas.width = largura;
        canvas.height = altura;
        canvas.getContext('2d').drawImage(imagem, 0, 0, largura, altura);
        resolver(canvas.toDataURL('image/jpeg', qualidade));
      };
      imagem.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}
