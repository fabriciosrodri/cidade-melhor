/** DETALHES DA OCORRÊNCIA (ocorrencia.html?id=2801) */
import { iniciarPagina } from '../app.js';
import { icone } from '../utils/icons.js';
import { $, parametroUrl, escaparHtml, iniciais } from '../utils/dom.js';
import { formatarDataHora, formatarData, dataRelativa } from '../utils/formatDate.js';
import { STATUS } from '../config/status.js';
import { obterCategoria } from '../config/categories.js';
import { obterOcorrencia } from '../services/problemService.js';
import { listarComentarios, adicionarComentario, excluirComentario } from '../services/commentService.js';
import { badgeCategoria, badgeStatus, estadoVazio } from '../components/badges.js';
import {
  htmlGaleria,
  configurarGaleria,
  htmlBlocoVotos,
  configurarVoto,
  htmlSeletorStatus,
  configurarSeletorStatus,
  excluirComConfirmacao,
} from '../components/problemDetails.js';
import { criarMapa, criarIconePin } from '../components/mapMarker.js';
import { mostrarToast, agendarToast } from '../components/toast.js';
import { confirmar } from '../components/modal.js';

const usuario = iniciarPagina({ paginaAtiva: 'mapa' });
const id = Number(parametroUrl('id'));
let miniMapa = null;

/* ---------- Linha do tempo do status ---------- */
function htmlLinhaDoTempo(ocorrencia) {
  const indiceAtual = STATUS.findIndex((status) => status.id === ocorrencia.status);
  const historico = ocorrencia.historicoStatus || [];

  return `
    <ol class="linha-tempo">
      ${STATUS.map((status, indice) => {
        // Data mais recente em que a ocorrência entrou neste status
        const registro = [...historico].reverse().find((item) => item.status === status.id);
        const situacao = indice < indiceAtual ? 'concluida' : indice === indiceAtual ? 'atual' : 'pendente';
        return `
          <li class="etapa ${situacao}" style="--cor:${status.cor}">
            <span class="etapa-marcador">${situacao === 'pendente' ? '' : icone(situacao === 'atual' ? status.icone : 'check', { tamanho: 14, espessura: 3 })}</span>
            <div>
              <strong>${status.nome}</strong>
              <small>${registro && situacao !== 'pendente' ? formatarDataHora(registro.data) : 'Aguardando'}</small>
            </div>
          </li>`;
      }).join('')}
    </ol>`;
}

/* ---------- Comentários ---------- */
async function carregarComentarios() {
  const lista = $('#lista-comentarios');
  lista.innerHTML = '<div class="skeleton" style="height:72px"></div>';
  const comentarios = await listarComentarios(id);
  $('#total-comentarios').textContent = comentarios.length;

  if (comentarios.length === 0) {
    lista.innerHTML = `<p class="comentarios-vazio">${icone('message-circle', { tamanho: 20 })} Ainda não há comentários. Conte o que você sabe sobre este problema.</p>`;
    return;
  }

  lista.innerHTML = comentarios
    .map(
      (comentario) => `
      <li class="comentario">
        <span class="avatar ${comentario.autorEhGestor ? 'avatar-gestor' : ''}">${iniciais(comentario.autorNome)}</span>
        <div class="comentario-corpo">
          <div class="comentario-topo">
            <strong>${escaparHtml(comentario.autorNome)}</strong>
            ${comentario.autorEhGestor ? '<span class="badge badge-gestor">Gestor</span>' : ''}
            <small>${dataRelativa(comentario.criadoEm)}</small>
            ${comentario.ehDoUsuario ? `<button type="button" class="btn-icone comentario-excluir" data-excluir-comentario="${comentario.id}" aria-label="Excluir comentário" data-tooltip="Excluir">${icone('trash-2', { tamanho: 15 })}</button>` : ''}
          </div>
          <p>${escaparHtml(comentario.texto)}</p>
        </div>
      </li>`
    )
    .join('');

  lista.querySelectorAll('[data-excluir-comentario]').forEach((botao) =>
    botao.addEventListener('click', async () => {
      const ok = await confirmar({ titulo: 'Excluir comentário?', mensagem: 'O comentário será removido permanentemente.', textoConfirmar: 'Excluir', perigo: true });
      if (!ok) return;
      try {
        await excluirComentario(botao.dataset.excluirComentario);
        mostrarToast('Comentário excluído.');
        carregarComentarios();
      } catch (erro) {
        mostrarToast(erro.message, 'erro');
      }
    })
  );
}

function htmlFormularioComentario() {
  if (!usuario) {
    return `<div class="comentar-login">${icone('lock', { tamanho: 18 })} <span><a href="login.html?voltar=${encodeURIComponent(`ocorrencia.html?id=${id}`)}">Entre na sua conta</a> para comentar.</span></div>`;
  }
  return `
    <form class="form-comentario" id="form-comentario" novalidate>
      <span class="avatar">${iniciais(usuario.nome)}</span>
      <div class="campo">
        <label class="sr-only" for="texto-comentario">Escreva um comentário</label>
        <textarea class="campo-textarea" id="texto-comentario" rows="3" maxlength="500" placeholder="Escreva um comentário..."></textarea>
        <p class="campo-erro"></p>
        <div class="form-comentario-acoes">
          <small id="contador-comentario">0/500</small>
          <button type="submit" class="btn btn-primario btn-sm">${icone('send', { tamanho: 15 })} Comentar</button>
        </div>
      </div>
    </form>`;
}

function configurarFormularioComentario() {
  const formulario = $('#form-comentario');
  if (!formulario) return;
  const campo = $('#texto-comentario');
  campo.addEventListener('input', () => ($('#contador-comentario').textContent = `${campo.value.length}/500`));

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const botao = formulario.querySelector('button[type="submit"]');
    botao.disabled = true;
    try {
      await adicionarComentario(id, campo.value);
      campo.value = '';
      $('#contador-comentario').textContent = '0/500';
      campo.classList.remove('invalido');
      formulario.querySelector('.campo-erro').textContent = '';
      mostrarToast('Comentário publicado!');
      carregarComentarios();
    } catch (erro) {
      campo.classList.add('invalido');
      formulario.querySelector('.campo-erro').textContent = erro.message;
    } finally {
      botao.disabled = false;
    }
  });
}

/* ---------- Página ---------- */
function renderizar(ocorrencia) {
  const categoria = obterCategoria(ocorrencia.categoria);
  const ehGestor = usuario && usuario.perfil === 'gestor';
  document.title = `${ocorrencia.titulo} · Cidade Melhor`;

  $('#conteudo').innerHTML = `
    <a href="mapa.html?id=${ocorrencia.id}" class="link-voltar">${icone('arrow-left', { tamanho: 16 })} Voltar ao mapa</a>

    <div class="detalhe-cabecalho">
      <div>
        <div class="detalhe-badges">
          ${badgeCategoria(ocorrencia.categoria)}
          ${badgeStatus(ocorrencia.status)}
          <span class="detalhe-id">#${ocorrencia.id}</span>
        </div>
        <h1>${escaparHtml(ocorrencia.titulo)}</h1>
        <p class="detalhe-local">${icone('map-pin', { tamanho: 18 })} ${escaparHtml(ocorrencia.endereco)}${ocorrencia.bairro ? ` · ${escaparHtml(ocorrencia.bairro)}` : ''} · Sorocaba - SP</p>
      </div>
      <div class="detalhe-acoes">
        <button type="button" class="btn btn-secundario" id="compartilhar">${icone('share-2', { tamanho: 16 })} Compartilhar</button>
        ${ocorrencia.ehDoUsuario ? `
          <a href="reportar.html?id=${ocorrencia.id}" class="btn btn-secundario">${icone('pencil', { tamanho: 16 })} Editar</a>
          <button type="button" class="btn btn-perigo-suave" id="excluir">${icone('trash-2', { tamanho: 16 })} Excluir</button>` : ''}
      </div>
    </div>

    <div class="detalhe-grade">
      <div class="detalhe-principal">
        <div class="card detalhe-galeria">${htmlGaleria(ocorrencia, 72)}</div>

        <div class="card card-corpo">
          <h2 class="card-titulo">Descrição</h2>
          <p class="detalhe-descricao">${escaparHtml(ocorrencia.descricao)}</p>
          <dl class="detalhe-infos">
            <div><dt>Categoria</dt><dd><span class="chip-cor" style="--cor:${categoria.cor}"></span>${categoria.nome}</dd></div>
            <div><dt>Reportado por</dt><dd>${escaparHtml(ocorrencia.autorNome)}</dd></div>
            <div><dt>Data de criação</dt><dd>${formatarDataHora(ocorrencia.criadoEm)}</dd></div>
            <div><dt>Coordenadas</dt><dd>${ocorrencia.latitude.toFixed(5)}, ${ocorrencia.longitude.toFixed(5)}</dd></div>
            ${ocorrencia.resolvidoEm ? `<div><dt>Resolvido em</dt><dd>${formatarData(ocorrencia.resolvidoEm)}</dd></div>` : ''}
          </dl>
        </div>

        <div class="card card-corpo" id="comentarios">
          <h2 class="card-titulo">${icone('message-circle', { tamanho: 20 })} Comentários <span class="aba-contador" id="total-comentarios">${ocorrencia.totalComentarios}</span></h2>
          <ul class="lista-comentarios" id="lista-comentarios"></ul>
          ${htmlFormularioComentario()}
        </div>
      </div>

      <aside class="detalhe-lateral">
        <div class="card card-corpo" id="card-votos">
          <h2 class="card-titulo">${icone('thumbs-up', { tamanho: 20 })} Apoio da comunidade</h2>
          <p class="votos-numero"><strong id="numero-votos">${ocorrencia.totalVotos}</strong> ${ocorrencia.totalVotos === 1 ? 'confirmação' : 'confirmações'}</p>
          ${htmlBlocoVotos(ocorrencia, usuario)}
        </div>

        <div class="card card-corpo">
          <h2 class="card-titulo">${icone('activity', { tamanho: 20 })} Andamento</h2>
          ${htmlLinhaDoTempo(ocorrencia)}
          ${ehGestor ? htmlSeletorStatus(ocorrencia) : ''}
        </div>

        <div class="card card-corpo">
          <h2 class="card-titulo">${icone('map', { tamanho: 20 })} Localização</h2>
          <div id="mini-mapa" class="mini-mapa"></div>
          <a href="mapa.html?id=${ocorrencia.id}" class="btn btn-suave btn-bloco btn-ver-mapa">Ver no mapa completo</a>
        </div>
      </aside>
    </div>`;

  configurarGaleria($('#conteudo'), ocorrencia);

  // Voto: ao mudar, atualiza o número grande do card
  configurarVoto($('#card-votos'), ocorrencia, usuario, (atualizada) => {
    $('#numero-votos').textContent = atualizada.totalVotos;
    $('.votos-numero').lastChild.textContent = atualizada.totalVotos === 1 ? ' confirmação' : ' confirmações';
  });

  // Status (gestor): ao mudar, redesenha a página inteira
  configurarSeletorStatus($('#conteudo'), ocorrencia, (atualizada) => {
    renderizar(atualizada);
  });

  $('#compartilhar').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      mostrarToast('Link copiado! Agora é só colar e compartilhar.');
    } catch {
      mostrarToast('Não foi possível copiar. Copie o endereço da barra do navegador.', 'info');
    }
  });

  $('#excluir')?.addEventListener('click', async () => {
    if (await excluirComConfirmacao(ocorrencia)) {
      agendarToast('Ocorrência excluída.');
      window.location.href = 'meus-pins.html';
    }
  });

  // Mini mapa com o pin
  if (miniMapa) miniMapa.remove();
  miniMapa = criarMapa('mini-mapa', { centro: [ocorrencia.latitude, ocorrencia.longitude], zoom: 16, interativo: false });
  L.marker([ocorrencia.latitude, ocorrencia.longitude], { icon: criarIconePin({ ...ocorrencia, totalVotos: 0 }), interactive: false }).addTo(miniMapa);

  $('#lista-comentarios').innerHTML = '';
  carregarComentarios();
  configurarFormularioComentario();

  if (window.location.hash === '#comentarios') {
    setTimeout(() => $('#comentarios').scrollIntoView({ behavior: 'smooth' }), 300);
  }
}

async function iniciar() {
  const ocorrencia = id ? await obterOcorrencia(id) : null;
  if (!ocorrencia) {
    document.title = 'Ocorrência não encontrada · Cidade Melhor';
    $('#conteudo').innerHTML = estadoVazio({
      iconeNome: 'search-x',
      titulo: 'Ocorrência não encontrada',
      texto: 'O link pode estar errado ou a ocorrência foi excluída pelo autor.',
      acao: `<a href="mapa.html" class="btn btn-primario">${icone('map', { tamanho: 18 })} Voltar ao mapa</a>`,
    });
    return;
  }
  renderizar(ocorrencia);
}

iniciar();
