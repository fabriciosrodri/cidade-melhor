/**
 * TOAST: mensagem rápida no canto da tela (substitui o alert()).
 *   mostrarToast('Ocorrência publicada!', 'sucesso')
 */
import { icone } from '../utils/icons.js';
import { escaparHtml } from '../utils/dom.js';

const ICONES = { sucesso: 'circle-check', erro: 'circle-alert', info: 'info' };
const CHAVE_PENDENTE = 'cidadeMelhor:toastPendente';

function obterContainer() {
  let container = document.querySelector('.toasts');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toasts';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  return container;
}

export function mostrarToast(mensagem, tipo = 'sucesso', duracao = 3800) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.innerHTML = `${icone(ICONES[tipo] || 'info', { tamanho: 20 })}<p>${escaparHtml(mensagem)}</p>`;
  obterContainer().appendChild(toast);

  setTimeout(() => {
    toast.classList.add('saindo');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duracao);
}

/**
 * Guarda um toast para aparecer na PRÓXIMA página.
 * Ex.: depois de publicar, o site vai para o mapa e lá mostra "Ocorrência publicada!".
 */
export function agendarToast(mensagem, tipo = 'sucesso') {
  sessionStorage.setItem(CHAVE_PENDENTE, JSON.stringify({ mensagem, tipo }));
}

export function mostrarToastAgendado() {
  const texto = sessionStorage.getItem(CHAVE_PENDENTE);
  if (!texto) return;
  sessionStorage.removeItem(CHAVE_PENDENTE);
  try {
    const { mensagem, tipo } = JSON.parse(texto);
    mostrarToast(mensagem, tipo);
  } catch {
    /* ignora */
  }
}
