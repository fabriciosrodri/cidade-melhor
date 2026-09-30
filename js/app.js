/**
 * INICIALIZAÇÃO COMUM A TODAS AS PÁGINAS
 * Cada página chama iniciarPagina() logo no começo do seu script.
 */
import { inicializarDados } from './services/storage.js';
import { usuarioAtual } from './services/authService.js';
import { renderizarHeader } from './components/header.js';
import { renderizarFooter } from './components/footer.js';
import { mostrarToastAgendado } from './components/toast.js';

/**
 * @param {object} opcoes
 * @param {string}  opcoes.paginaAtiva - id do link do menu que fica destacado
 * @param {boolean} opcoes.exigeLogin  - se true, manda para o login quem não estiver logado
 * @returns o usuário logado (ou null). Se a página exige login e não há usuário, redireciona.
 */
export function iniciarPagina({ paginaAtiva = '', exigeLogin = false } = {}) {
  inicializarDados();
  const usuario = usuarioAtual();

  if (exigeLogin && !usuario) {
    // Guarda a página atual para voltar depois do login
    const voltar = window.location.pathname.split('/').pop() + window.location.search;
    window.location.replace(`login.html?voltar=${encodeURIComponent(voltar)}`);
    return null;
  }

  renderizarHeader(paginaAtiva);
  renderizarFooter();
  mostrarToastAgendado();
  return usuario;
}
