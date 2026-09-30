/**
 * HEADER — inserido por JavaScript em todas as páginas.
 * Assim, se mudarmos um link aqui, ele muda no site inteiro.
 */
import { logoHtml } from './logo.js';
import { icone } from '../utils/icons.js';
import { escaparHtml, iniciais } from '../utils/dom.js';
import { dataRelativa } from '../utils/formatDate.js';
import { usuarioAtual, sair } from '../services/authService.js';
import { listarNotificacoes, contarNaoLidas, marcarTodasComoLidas } from '../services/notificationService.js';
import { agendarToast } from './toast.js';

const LINKS = [
  { id: 'mapa', texto: 'Mapa', href: 'mapa.html' },
  { id: 'como-funciona', texto: 'Como funciona', href: 'index.html#como-funciona' },
  { id: 'resolvidos', texto: 'Resolvidos', href: 'resolvidos.html' },
  { id: 'relatorios', texto: 'Relatórios', href: 'relatorios.html' },
  { id: 'sustentabilidade', texto: 'Sustentabilidade', href: 'sustentabilidade.html' },
  { id: 'sobre', texto: 'Sobre', href: 'sobre.html' },
];

const ICONES_NOTIFICACAO = { upvote: 'thumbs-up', comentario: 'message-circle', status: 'circle-check' };

function htmlAreaUsuario(usuario) {
  if (!usuario) {
    return `
      <a href="login.html" class="btn btn-secundario">Entrar</a>
      <a href="cadastro.html" class="btn btn-primario btn-cadastrar">Cadastrar</a>`;
  }

  const naoLidas = contarNaoLidas();
  const ehGestor = usuario.perfil === 'gestor';
  return `
    <div class="dropdown" id="dropdown-notificacoes">
      <button type="button" class="btn-icone" id="botao-notificacoes" aria-label="Notificações" aria-expanded="false" data-tooltip="Notificações" data-tooltip-lado="baixo">
        ${icone('bell', { tamanho: 22 })}
        ${naoLidas ? `<span class="contador-notificacoes">${naoLidas > 9 ? '9+' : naoLidas}</span>` : ''}
      </button>
      <div class="dropdown-painel painel-notificacoes" id="painel-notificacoes" hidden></div>
    </div>

    <div class="dropdown" id="dropdown-usuario">
      <button type="button" class="menu-usuario-botao" id="botao-usuario" aria-label="Menu do usuário" aria-expanded="false">
        <span class="avatar ${ehGestor ? 'avatar-gestor' : ''}">${iniciais(usuario.nome)}</span>
        <span class="menu-usuario-nome">${escaparHtml(usuario.nome)}</span>
        ${icone('chevron-down', { tamanho: 16 })}
      </button>
      <div class="dropdown-painel" id="painel-usuario" hidden>
        <div class="dropdown-cabecalho">
          <strong>${escaparHtml(usuario.nome)} ${ehGestor ? '<span class="badge badge-gestor">Gestor</span>' : ''}</strong>
          <span>${escaparHtml(usuario.email)}</span>
        </div>
        <a class="dropdown-item" href="meus-pins.html">${icone('map-pin')} Meus pins</a>
        <a class="dropdown-item" href="reportar.html">${icone('circle-plus')} Reportar problema</a>
        <a class="dropdown-item" href="mapa.html">${icone('map')} Ver mapa</a>
        <div class="dropdown-divisor"></div>
        <button type="button" class="dropdown-item perigo" id="botao-sair">${icone('log-out')} Sair</button>
      </div>
    </div>`;
}

export function renderizarHeader(paginaAtiva = '') {
  const container = document.getElementById('header');
  if (!container) return;
  const usuario = usuarioAtual();

  const links = LINKS.map(
    (link) => `<a href="${link.href}" class="${link.id === paginaAtiva ? 'ativo' : ''}" ${link.id === paginaAtiva ? 'aria-current="page"' : ''}>${link.texto}</a>`
  ).join('');

  // Itens extras que só aparecem no menu do celular
  const extrasMobile = usuario
    ? `<a href="meus-pins.html" class="btn btn-secundario">${icone('map-pin')} Meus pins</a>
       <a href="reportar.html" class="btn btn-primario">${icone('plus')} Reportar problema</a>`
    : `<a href="cadastro.html" class="btn btn-primario">Criar conta grátis</a>`;

  container.innerHTML = `
    <header class="header">
      <div class="header-interno">
        ${logoHtml()}
        <nav class="header-nav" id="menu-principal" aria-label="Menu principal">
          ${links}
          <div class="header-nav-extra">${extrasMobile}</div>
        </nav>
        <div class="header-acoes">
          ${htmlAreaUsuario(usuario)}
          <button type="button" class="btn-icone btn-menu-mobile" id="botao-menu" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu-principal">
            ${icone('menu', { tamanho: 24 })}
          </button>
        </div>
      </div>
    </header>`;

  configurarMenuMobile();
  if (usuario) configurarDropdowns();
}

function configurarMenuMobile() {
  const botao = document.getElementById('botao-menu');
  const menu = document.getElementById('menu-principal');
  botao.addEventListener('click', () => {
    const aberto = menu.classList.toggle('aberto');
    botao.setAttribute('aria-expanded', String(aberto));
    botao.innerHTML = icone(aberto ? 'x' : 'menu', { tamanho: 24 });
    document.body.style.overflow = aberto ? 'hidden' : '';
  });
  // Fecha o menu ao clicar num link (útil para a âncora "Como funciona")
  menu.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => {
      menu.classList.remove('aberto');
      botao.innerHTML = icone('menu', { tamanho: 24 });
      document.body.style.overflow = '';
    })
  );
}

function configurarDropdowns() {
  const pares = [
    { botao: document.getElementById('botao-usuario'), painel: document.getElementById('painel-usuario') },
    { botao: document.getElementById('botao-notificacoes'), painel: document.getElementById('painel-notificacoes'), aoAbrir: abrirNotificacoes },
  ];

  function fecharTodos(excetoPainel) {
    pares.forEach(({ botao, painel }) => {
      if (painel !== excetoPainel) {
        painel.hidden = true;
        botao.setAttribute('aria-expanded', 'false');
      }
    });
  }

  pares.forEach(({ botao, painel, aoAbrir }) => {
    botao.addEventListener('click', (evento) => {
      evento.stopPropagation();
      const vaiAbrir = painel.hidden;
      fecharTodos(painel);
      painel.hidden = !vaiAbrir;
      botao.setAttribute('aria-expanded', String(vaiAbrir));
      if (vaiAbrir && aoAbrir) aoAbrir(painel, botao);
    });
    painel.addEventListener('click', (evento) => evento.stopPropagation());
  });

  document.addEventListener('click', () => fecharTodos());
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') fecharTodos();
  });

  document.getElementById('botao-sair').addEventListener('click', () => {
    sair();
    agendarToast('Você saiu da sua conta. Até logo!', 'info');
    window.location.href = 'index.html';
  });
}

async function abrirNotificacoes(painel, botao) {
  painel.innerHTML = `<div class="dropdown-cabecalho"><strong>Notificações</strong></div><div class="carregando-bloco"><span class="spinner"></span></div>`;
  const notificacoes = await listarNotificacoes(10);

  const itens = notificacoes.length
    ? notificacoes
        .map(
          (notificacao) => `
          <a class="notificacao ${notificacao.lida ? '' : 'nao-lida'}" href="ocorrencia.html?id=${notificacao.ocorrenciaId}">
            <span class="notificacao-icone ${notificacao.tipo}">${icone(ICONES_NOTIFICACAO[notificacao.tipo] || 'bell', { tamanho: 16 })}</span>
            <span>
              <p>${escaparHtml(notificacao.mensagem)}</p>
              <small>${dataRelativa(notificacao.criadoEm)}</small>
            </span>
          </a>`
        )
        .join('')
    : `<div class="notificacoes-vazio">${icone('bell-off', { tamanho: 28, classe: 'centralizar' })}<p>Nenhuma notificação por enquanto.</p></div>`;

  painel.innerHTML = `
    <div class="dropdown-cabecalho"><strong>Notificações</strong><span>Votos, comentários e mudanças de status dos seus pins</span></div>
    <div class="lista-notificacoes">${itens}</div>`;

  // Ao abrir, marca como lidas e remove o contador vermelho
  await marcarTodasComoLidas();
  const contador = botao.querySelector('.contador-notificacoes');
  if (contador) contador.remove();
}
