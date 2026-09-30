/**
 * MODAL: janela sobreposta. Fecha com Esc, clique fora ou no X.
 *
 *   const modal = abrirModal({ titulo: 'Olá', conteudo: '<p>Texto</p>' });
 *   modal.fechar();
 *
 *   const confirmou = await confirmar({ titulo: 'Excluir?', mensagem: '...', perigo: true });
 */
import { icone } from '../utils/icons.js';
import { escaparHtml } from '../utils/dom.js';

export function abrirModal({ titulo, conteudo, rodape = '', largo = false, aoFechar } = {}) {
  const elementoAnterior = document.activeElement; // para devolver o foco ao fechar

  const fundo = document.createElement('div');
  fundo.className = 'modal-fundo';
  fundo.innerHTML = `
    <div class="modal ${largo ? 'modal-largo' : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div class="modal-cabecalho">
        <h2 id="modal-titulo">${escaparHtml(titulo)}</h2>
        <button type="button" class="btn-icone" data-fechar aria-label="Fechar">${icone('x', { tamanho: 20 })}</button>
      </div>
      <div class="modal-corpo">${conteudo}</div>
      ${rodape ? `<div class="modal-rodape">${rodape}</div>` : ''}
    </div>`;

  document.body.appendChild(fundo);
  document.body.style.overflow = 'hidden';

  function fechar() {
    document.removeEventListener('keydown', aoPressionarTecla);
    fundo.remove();
    document.body.style.overflow = '';
    if (elementoAnterior && elementoAnterior.focus) elementoAnterior.focus();
    if (aoFechar) aoFechar();
  }

  function aoPressionarTecla(evento) {
    if (evento.key === 'Escape') fechar();

    // Mantém o Tab "preso" dentro do modal (acessibilidade)
    if (evento.key === 'Tab') {
      const focaveis = fundo.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focaveis.length === 0) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }
  }

  document.addEventListener('keydown', aoPressionarTecla);
  fundo.addEventListener('click', (evento) => {
    if (evento.target === fundo || evento.target.closest('[data-fechar]')) fechar();
  });

  // Foca o botão principal (ou o X) ao abrir
  const alvoFoco = fundo.querySelector('[data-principal]') || fundo.querySelector('[data-fechar]');
  if (alvoFoco) alvoFoco.focus();

  return { elemento: fundo, fechar };
}

/** Modal de confirmação. Devolve uma Promise: true (confirmou) ou false (cancelou). */
export function confirmar({ titulo, mensagem, textoConfirmar = 'Confirmar', perigo = false }) {
  return new Promise((resolver) => {
    let respondeu = false;
    const modal = abrirModal({
      titulo,
      conteudo: `
        ${perigo ? `<div class="modal-icone-perigo">${icone('triangle-alert', { tamanho: 24 })}</div>` : ''}
        <p>${escaparHtml(mensagem)}</p>`,
      rodape: `
        <button type="button" class="btn btn-secundario" data-fechar>Cancelar</button>
        <button type="button" class="btn ${perigo ? 'btn-perigo' : 'btn-primario'}" data-confirmar data-principal>${escaparHtml(textoConfirmar)}</button>`,
      aoFechar: () => {
        if (!respondeu) resolver(false);
      },
    });

    modal.elemento.querySelector('[data-confirmar]').addEventListener('click', () => {
      respondeu = true;
      modal.fechar();
      resolver(true);
    });
  });
}
