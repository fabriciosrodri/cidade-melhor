/**
 * DETALHES DA OCORRÊNCIA
 * - Painel lateral do mapa (renderizarPainel)
 * - Blocos reaproveitados na página ocorrencia.html (votos, status, exclusão)
 */
import { icone } from '../utils/icons.js';
import { escaparHtml, iniciais, formatarNumero } from '../utils/dom.js';
import { dataRelativa } from '../utils/formatDate.js';
import { STATUS } from '../config/status.js';
import { alternarVoto } from '../services/voteService.js';
import { alterarStatus, excluirOcorrencia } from '../services/problemService.js';
import { badgeCategoria, badgeStatus } from './badges.js';
import { mostrarToast } from './toast.js';
import { confirmar } from './modal.js';
import { obterCategoria } from '../config/categories.js';

/* ---------- Bloco de votos (upvote) ---------- */

function textoVotos(total) {
  if (total === 0) return 'Ninguém confirmou ainda. Seja o primeiro!';
  if (total === 1) return '<strong>1 pessoa</strong> confirmou este problema';
  return `<strong>${formatarNumero(total)} pessoas</strong> confirmaram este problema`;
}

export function htmlBlocoVotos(ocorrencia, usuario) {
  let botao;
  if (!usuario) {
    const voltar = encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
    botao = `<a class="btn btn-secundario btn-bloco" href="login.html?voltar=${voltar}">${icone('log-in')} Entre para confirmar</a>`;
  } else if (ocorrencia.ehDoUsuario) {
    botao = `<button type="button" class="btn btn-secundario btn-bloco" disabled data-tooltip="Você não pode votar no próprio pin">${icone('user')} Este problema é seu</button>`;
  } else {
    botao = `
      <button type="button" class="btn btn-bloco ${ocorrencia.usuarioVotou ? 'btn-suave' : 'btn-primario'}" data-acao="votar" aria-pressed="${ocorrencia.usuarioVotou}">
        ${icone('thumbs-up')} ${ocorrencia.usuarioVotou ? 'Você confirmou · Retirar' : 'Confirmar problema'}
      </button>`;
  }
  return `
    <div class="bloco-votos">
      <p class="bloco-votos-texto">👍 <span data-texto-votos>${textoVotos(ocorrencia.totalVotos)}</span></p>
      ${botao}
    </div>`;
}

/** Liga o clique do botão de voto. `aoMudar` é chamado com a ocorrência atualizada. */
export function configurarVoto(container, ocorrencia, usuario, aoMudar) {
  const botao = container.querySelector('[data-acao="votar"]');
  if (!botao) return;
  botao.addEventListener('click', async () => {
    botao.disabled = true;
    try {
      const { votou, total } = await alternarVoto(ocorrencia.id);
      const atualizada = { ...ocorrencia, usuarioVotou: votou, totalVotos: total };
      mostrarToast(votou ? 'Obrigado! Você confirmou este problema.' : 'Confirmação retirada.', votou ? 'sucesso' : 'info');
      // Redesenha o bloco com o novo estado
      const bloco = container.querySelector('.bloco-votos');
      bloco.outerHTML = htmlBlocoVotos(atualizada, usuario);
      configurarVoto(container, atualizada, usuario, aoMudar);
      if (aoMudar) aoMudar(atualizada);
    } catch (erro) {
      mostrarToast(erro.message, 'erro');
      botao.disabled = false;
    }
  });
}

/* ---------- Seletor de status (somente gestor) ---------- */

export function htmlSeletorStatus(ocorrencia) {
  const opcoes = STATUS.map(
    (status) => `<option value="${status.id}" ${status.id === ocorrencia.status ? 'selected' : ''}>${status.nome}</option>`
  ).join('');
  return `
    <div class="bloco-gestor">
      <label class="campo-label" for="seletor-status-${ocorrencia.id}">${icone('shield-check', { tamanho: 16 })} Alterar status (gestor)</label>
      <select class="campo-select" id="seletor-status-${ocorrencia.id}" data-acao="status">${opcoes}</select>
    </div>`;
}

export function configurarSeletorStatus(container, ocorrencia, aoMudar) {
  const seletor = container.querySelector('[data-acao="status"]');
  if (!seletor) return;
  seletor.addEventListener('change', async () => {
    seletor.disabled = true;
    try {
      const atualizada = await alterarStatus(ocorrencia.id, seletor.value);
      mostrarToast(`Status alterado para "${STATUS.find((s) => s.id === seletor.value).nome}".`);
      if (aoMudar) aoMudar(atualizada);
    } catch (erro) {
      mostrarToast(erro.message, 'erro');
      seletor.value = ocorrencia.status;
    } finally {
      seletor.disabled = false;
    }
  });
}

/* ---------- Exclusão ---------- */

/** Pede confirmação e exclui. Devolve true se excluiu. */
export async function excluirComConfirmacao(ocorrencia) {
  const confirmou = await confirmar({
    titulo: 'Excluir ocorrência?',
    mensagem: `A ocorrência "${ocorrencia.titulo}" será removida junto com seus votos e comentários. Essa ação não pode ser desfeita.`,
    textoConfirmar: 'Sim, excluir',
    perigo: true,
  });
  if (!confirmou) return false;
  try {
    await excluirOcorrencia(ocorrencia.id);
    mostrarToast('Ocorrência excluída.');
    return true;
  } catch (erro) {
    mostrarToast(erro.message, 'erro');
    return false;
  }
}

/* ---------- Galeria simples ---------- */

export function htmlGaleria(ocorrencia, tamanhoIcone = 56) {
  const fotos = ocorrencia.fotos || [];
  if (fotos.length === 0) {
    const categoria = obterCategoria(ocorrencia.categoria);
    return `<div class="galeria"><div class="foto-padrao" style="--cor:${categoria.cor}" role="img" aria-label="Sem foto">${icone(categoria.icone, { tamanho: tamanhoIcone, espessura: 1.5 })}<span class="galeria-sem-foto">Sem foto</span></div></div>`;
  }
  return `
    <div class="galeria" data-galeria data-indice="0">
      <img src="${fotos[0]}" alt="Foto 1 do problema">
      ${fotos.length > 1 ? `
        <button type="button" class="galeria-seta anterior" aria-label="Foto anterior">${icone('chevron-left')}</button>
        <button type="button" class="galeria-seta proxima" aria-label="Próxima foto">${icone('chevron-right')}</button>
        <span class="galeria-contador">1/${fotos.length}</span>` : ''}
    </div>`;
}

export function configurarGaleria(container, ocorrencia) {
  const galeria = container.querySelector('[data-galeria]');
  if (!galeria) return;
  const fotos = ocorrencia.fotos;
  const imagem = galeria.querySelector('img');
  const contador = galeria.querySelector('.galeria-contador');
  let indice = 0;
  function mostrar(novo) {
    indice = (novo + fotos.length) % fotos.length;
    imagem.src = fotos[indice];
    imagem.alt = `Foto ${indice + 1} do problema`;
    if (contador) contador.textContent = `${indice + 1}/${fotos.length}`;
  }
  galeria.querySelector('.anterior')?.addEventListener('click', () => mostrar(indice - 1));
  galeria.querySelector('.proxima')?.addEventListener('click', () => mostrar(indice + 1));
}

/* ---------- Painel lateral do mapa ---------- */

/**
 * @param {HTMLElement} container
 * @param {object} ocorrencia
 * @param {object} contexto { usuario, aoFechar, aoMudar, aoExcluir }
 */
export function renderizarPainel(container, ocorrencia, { usuario, aoFechar, aoMudar, aoExcluir }) {
  const ehGestor = usuario && usuario.perfil === 'gestor';

  container.innerHTML = `
    <div class="painel-alca" aria-hidden="true"></div>
    <div class="painel-topo">
      ${badgeCategoria(ocorrencia.categoria)}
      <span class="painel-id">ID: #${ocorrencia.id}</span>
      <button type="button" class="btn-icone" data-acao="fechar" aria-label="Fechar painel">${icone('x', { tamanho: 20 })}</button>
    </div>
    <div class="painel-rolagem">
      ${htmlGaleria(ocorrencia, 48)}
      <h2 class="painel-titulo">${escaparHtml(ocorrencia.titulo)}</h2>
      <p class="painel-endereco">${icone('map-pin', { tamanho: 16 })}<span>${escaparHtml(ocorrencia.endereco)}<small>${escaparHtml(ocorrencia.bairro || '')}${ocorrencia.bairro ? ', ' : ''}Sorocaba - SP</small></span></p>
      <p class="painel-descricao">${escaparHtml(ocorrencia.descricao)}</p>

      <div class="painel-autor">
        <span class="avatar">${iniciais(ocorrencia.autorNome)}</span>
        <span><strong>${escaparHtml(ocorrencia.autorNome)}</strong><small>${dataRelativa(ocorrencia.criadoEm)}</small></span>
      </div>

      <div class="painel-linha"><span>Status</span>${badgeStatus(ocorrencia.status)}</div>
      <div class="painel-linha"><span>Comentários</span><a href="ocorrencia.html?id=${ocorrencia.id}#comentarios" class="painel-comentarios">${icone('message-circle', { tamanho: 16 })} ${ocorrencia.totalComentarios}</a></div>

      ${htmlBlocoVotos(ocorrencia, usuario)}
      ${ehGestor ? htmlSeletorStatus(ocorrencia) : ''}

      <a class="btn btn-primario btn-bloco" href="ocorrencia.html?id=${ocorrencia.id}">Ver detalhes ${icone('arrow-right', { tamanho: 16 })}</a>
      ${ocorrencia.ehDoUsuario ? `
        <div class="painel-acoes-autor">
          <a class="btn btn-secundario" href="reportar.html?id=${ocorrencia.id}">${icone('pencil', { tamanho: 16 })} Editar</a>
          <button type="button" class="btn btn-perigo-suave" data-acao="excluir">${icone('trash-2', { tamanho: 16 })} Excluir</button>
        </div>` : ''}
    </div>`;

  container.querySelector('[data-acao="fechar"]').addEventListener('click', aoFechar);
  configurarGaleria(container, ocorrencia);
  configurarVoto(container, ocorrencia, usuario, aoMudar);
  configurarSeletorStatus(container, ocorrencia, aoMudar);

  const botaoExcluir = container.querySelector('[data-acao="excluir"]');
  if (botaoExcluir) {
    botaoExcluir.addEventListener('click', async () => {
      if (await excluirComConfirmacao(ocorrencia)) aoExcluir(ocorrencia);
    });
  }
}
