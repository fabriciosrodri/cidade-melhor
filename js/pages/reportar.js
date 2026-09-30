/**
 * CRIAR E EDITAR OCORRÊNCIA (reportar.html e reportar.html?id=2801)
 */
import { iniciarPagina } from '../app.js';
import { icone } from '../utils/icons.js';
import { $, $$, parametroUrl, escaparHtml } from '../utils/dom.js';
import { validarTamanho, mostrarErroCampo, limparErros, focarPrimeiroErro } from '../utils/validators.js';
import { redimensionarImagem } from '../utils/imageUtils.js';
import { CATEGORIAS } from '../config/categories.js';
import { MAX_FOTOS } from '../config/constants.js';
import { obterOcorrencia, criarOcorrencia, atualizarOcorrencia } from '../services/problemService.js';
import { enderecoReverso, dentroDeSorocaba, obterLocalizacaoAtual } from '../services/geoService.js';
import { criarMapa, criarIconeSelecao } from '../components/mapMarker.js';
import { mostrarToast, agendarToast } from '../components/toast.js';
import { estadoVazio, blocoCarregando } from '../components/badges.js';
import { botaoCarregando } from '../components/authLayout.js';

const usuario = iniciarPagina({ exigeLogin: true });

const idEdicao = Number(parametroUrl('id')) || null;
const estado = {
  latitude: null,
  longitude: null,
  categoria: null,
  fotos: [],
};

let mapa;
let marcador = null;
let bairroFoiDigitado = false; // se o usuário digitou o bairro, não sobrescrevemos

/* ---------- Mapa para escolher o local ---------- */
function montarMapa() {
  mapa = criarMapa('mapa-selecao', { zoom: 13 });
  mapa.on('click', (evento) => definirLocal(evento.latlng.lat, evento.latlng.lng));

  // Botões de zoom simples
  L.control.zoom({ position: 'topright', zoomInTitle: 'Aproximar', zoomOutTitle: 'Afastar' }).addTo(mapa);
}

async function definirLocal(latitude, longitude, { buscarEndereco = true, mover = false } = {}) {
  if (!dentroDeSorocaba(latitude, longitude)) {
    $('#erro-local').textContent = 'Escolha um local dentro de Sorocaba-SP.';
    mostrarToast('O local precisa estar dentro de Sorocaba.', 'erro');
    return;
  }
  $('#erro-local').textContent = '';
  $('#mapa-selecao').classList.remove('invalido');

  estado.latitude = Number(latitude.toFixed(6));
  estado.longitude = Number(longitude.toFixed(6));
  $('#latitude').value = estado.latitude;
  $('#longitude').value = estado.longitude;
  $('#coordenadas').innerHTML = `${icone('circle-check', { tamanho: 16 })} Local marcado`;
  $('#coordenadas').classList.add('ok');

  if (!marcador) {
    marcador = L.marker([latitude, longitude], { icon: criarIconeSelecao(estado.categoria || 'outros'), draggable: true, autoPan: true }).addTo(mapa);
    marcador.on('dragend', () => {
      const posicao = marcador.getLatLng();
      definirLocal(posicao.lat, posicao.lng);
    });
  } else {
    marcador.setLatLng([latitude, longitude]);
  }
  if (mover) mapa.setView([latitude, longitude], 17);

  if (buscarEndereco) preencherEndereco(latitude, longitude);
}

async function preencherEndereco(latitude, longitude) {
  const carregando = $('#endereco-carregando');
  carregando.hidden = false;
  try {
    const { endereco, bairro } = await enderecoReverso(latitude, longitude);
    if (endereco) {
      $('#endereco').value = endereco;
      mostrarErroCampo($('#endereco'), '');
    }
    if (bairro && !bairroFoiDigitado) $('#bairro').value = bairro;
  } catch {
    mostrarToast('Não conseguimos descobrir o endereço automaticamente. Digite-o no campo.', 'info');
  } finally {
    carregando.hidden = true;
  }
}

/* ---------- Seleção da categoria ---------- */
function montarCategorias() {
  $('#seletor-categorias').innerHTML = CATEGORIAS.map(
    (categoria) => `
      <button type="button" class="opcao-categoria" role="radio" aria-checked="false" data-categoria="${categoria.id}" style="--cor:${categoria.cor}">
        <span class="bolinha-categoria">${icone(categoria.icone, { tamanho: 16 })}</span>
        <span>${categoria.nome}</span>
      </button>`
  ).join('');

  $$('.opcao-categoria').forEach((botao) => botao.addEventListener('click', () => escolherCategoria(botao.dataset.categoria)));
}

function escolherCategoria(id) {
  estado.categoria = id;
  $$('.opcao-categoria').forEach((botao) => {
    const ativa = botao.dataset.categoria === id;
    botao.classList.toggle('ativa', ativa);
    botao.setAttribute('aria-checked', String(ativa));
  });
  $('#erro-categoria').textContent = '';
  if (marcador) marcador.setIcon(criarIconeSelecao(id));
}

/* ---------- Fotos ---------- */
function desenharFotos() {
  const miniaturas = estado.fotos
    .map(
      (foto, indice) => `
      <div class="foto-miniatura">
        <img src="${foto}" alt="Foto ${indice + 1} selecionada">
        <button type="button" class="foto-remover" data-remover="${indice}" aria-label="Remover foto ${indice + 1}">${icone('x', { tamanho: 14 })}</button>
      </div>`
    )
    .join('');

  const botaoAdicionar =
    estado.fotos.length < MAX_FOTOS
      ? `<button type="button" class="foto-adicionar" id="adicionar-foto">${icone('image-plus', { tamanho: 24 })}<span>Adicionar foto</span></button>`
      : '';

  $('#fotos').innerHTML = miniaturas + botaoAdicionar;
  $('#adicionar-foto')?.addEventListener('click', () => $('#entrada-fotos').click());
  $$('[data-remover]').forEach((botao) =>
    botao.addEventListener('click', () => {
      estado.fotos.splice(Number(botao.dataset.remover), 1);
      desenharFotos();
    })
  );
}

async function aoEscolherFotos(evento) {
  const arquivos = [...evento.target.files].slice(0, MAX_FOTOS - estado.fotos.length);
  $('#erro-fotos').textContent = '';
  for (const arquivo of arquivos) {
    try {
      estado.fotos.push(await redimensionarImagem(arquivo));
    } catch (erro) {
      $('#erro-fotos').textContent = erro.message;
    }
  }
  if (evento.target.files.length > arquivos.length) {
    mostrarToast(`Você pode enviar no máximo ${MAX_FOTOS} fotos.`, 'info');
  }
  evento.target.value = ''; // permite escolher a mesma foto de novo
  desenharFotos();
}

/* ---------- Contadores de caracteres ---------- */
function configurarContadores() {
  [['titulo', 80], ['descricao', 500]].forEach(([id, maximo]) => {
    const campo = $(`#${id}`);
    const contador = $(`#contador-${id}`);
    const atualizar = () => (contador.textContent = `${campo.value.length}/${maximo}`);
    campo.addEventListener('input', atualizar);
    atualizar();
  });
}

/* ---------- Validação e envio ---------- */
function validar() {
  let valido = true;

  if (estado.latitude === null) {
    $('#erro-local').textContent = 'Clique no mapa para marcar onde está o problema.';
    $('#mapa-selecao').classList.add('invalido');
    valido = false;
  }
  if (!estado.categoria) {
    $('#erro-categoria').textContent = 'Escolha o tipo do problema.';
    valido = false;
  }
  valido = mostrarErroCampo($('#titulo'), validarTamanho($('#titulo').value, 5, 80, 'O título')) && valido;
  valido = mostrarErroCampo($('#descricao'), validarTamanho($('#descricao').value, 20, 500, 'A descrição', true)) && valido;
  valido = mostrarErroCampo($('#endereco'), validarTamanho($('#endereco').value, 3, 120, 'O endereço')) && valido;
  return valido;
}

async function enviar(evento) {
  evento.preventDefault();
  limparErros(evento.target);
  $('#erro-local').textContent = '';
  $('#erro-categoria').textContent = '';

  if (!validar()) {
    mostrarToast('Confira os campos destacados.', 'erro');
    // Leva o usuário até o primeiro problema
    const primeiroErro = document.querySelector('.invalido, .campo-erro:not(:empty)');
    if (primeiroErro) primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    focarPrimeiroErro(evento.target);
    return;
  }

  const dados = {
    titulo: $('#titulo').value,
    descricao: $('#descricao').value,
    categoria: estado.categoria,
    latitude: estado.latitude,
    longitude: estado.longitude,
    endereco: $('#endereco').value,
    bairro: $('#bairro').value,
    fotos: estado.fotos,
  };

  const restaurar = botaoCarregando($('#botao-publicar'), idEdicao ? 'Salvando...' : 'Publicando...');
  try {
    const ocorrencia = idEdicao ? await atualizarOcorrencia(idEdicao, dados) : await criarOcorrencia(dados);
    agendarToast(idEdicao ? 'Alterações salvas com sucesso!' : 'Ocorrência publicada! Obrigado por ajudar a cidade.');
    window.location.href = `mapa.html?id=${ocorrencia.id}`;
  } catch (erro) {
    restaurar();
    mostrarToast(erro.message, 'erro');
  }
}

/* ---------- Modo edição ---------- */
async function carregarParaEdicao() {
  $('#titulo-pagina').textContent = `Editar ocorrência #${idEdicao}`;
  $('#subtitulo-pagina').textContent = 'Atualize as informações do problema. O status e a data de criação não mudam.';
  document.title = `Editar ocorrência #${idEdicao} · Cidade Melhor`;
  $('#botao-publicar').textContent = 'Salvar alterações';
  $('#botao-cancelar').href = `ocorrencia.html?id=${idEdicao}`;

  const formulario = $('#form-ocorrencia');
  formulario.hidden = true;
  $('#conteudo-formulario').insertAdjacentHTML('afterbegin', `<div id="carregando-edicao">${blocoCarregando('Carregando ocorrência...')}</div>`);

  const ocorrencia = await obterOcorrencia(idEdicao);
  $('#carregando-edicao').remove();

  if (!ocorrencia || !ocorrencia.ehDoUsuario) {
    $('#conteudo-formulario').innerHTML = estadoVazio({
      iconeNome: ocorrencia ? 'lock' : 'search-x',
      titulo: ocorrencia ? 'Acesso negado' : 'Ocorrência não encontrada',
      texto: ocorrencia
        ? 'Somente quem criou esta ocorrência pode editá-la. Você ainda pode confirmar o problema ou comentar.'
        : 'Ela pode ter sido excluída pelo autor.',
      acao: `<a class="btn btn-primario" href="${ocorrencia ? `ocorrencia.html?id=${idEdicao}` : 'mapa.html'}">${ocorrencia ? 'Ver ocorrência' : 'Voltar ao mapa'}</a>`,
    });
    return false;
  }

  formulario.hidden = false;
  $('#titulo').value = ocorrencia.titulo;
  $('#descricao').value = ocorrencia.descricao;
  $('#endereco').value = ocorrencia.endereco;
  $('#bairro').value = ocorrencia.bairro || '';
  bairroFoiDigitado = Boolean(ocorrencia.bairro);
  estado.fotos = [...(ocorrencia.fotos || [])];
  escolherCategoria(ocorrencia.categoria);
  return ocorrencia;
}

/* ---------- Inicialização ---------- */
async function iniciar() {
  $('#link-voltar').innerHTML = `${icone('arrow-left', { tamanho: 16 })} ${idEdicao ? 'Voltar' : 'Voltar ao mapa'}`;
  if (idEdicao) $('#link-voltar').href = `ocorrencia.html?id=${idEdicao}`;
  $('#dica-mapa').innerHTML = `${icone('mouse-pointer-click', { tamanho: 16 })} Clique no mapa para marcar o local. Você pode arrastar o pin para ajustar.`;
  $('#usar-localizacao').innerHTML = `${icone('locate-fixed', { tamanho: 16 })} Usar minha localização`;
  $('#aviso-automatico').innerHTML = `${icone('info', { tamanho: 16 })}<span>Data, autor e status inicial (<strong>Reportado</strong>) são preenchidos automaticamente. Publicando como <strong>${escaparHtml(usuario.nome)}</strong>.</span>`;

  montarCategorias();
  configurarContadores();

  let ocorrencia = null;
  if (idEdicao) {
    ocorrencia = await carregarParaEdicao();
    if (!ocorrencia) return;
    $('#aviso-automatico').innerHTML = `${icone('info', { tamanho: 16 })}<span>Somente você, autor(a), pode editar esta ocorrência.</span>`;
  }

  montarMapa();
  desenharFotos();
  if (ocorrencia) {
    definirLocal(ocorrencia.latitude, ocorrencia.longitude, { buscarEndereco: false, mover: true });
    ['titulo', 'descricao'].forEach((id) => $(`#${id}`).dispatchEvent(new Event('input')));
  }

  $('#entrada-fotos').addEventListener('change', aoEscolherFotos);
  $('#bairro').addEventListener('input', () => (bairroFoiDigitado = $('#bairro').value.trim() !== ''));
  $('#form-ocorrencia').addEventListener('submit', enviar);

  $('#usar-localizacao').addEventListener('click', async (evento) => {
    const botao = evento.currentTarget;
    const original = botao.innerHTML;
    botao.innerHTML = '<span class="spinner"></span> Localizando...';
    botao.disabled = true;
    try {
      const { latitude, longitude } = await obterLocalizacaoAtual();
      definirLocal(latitude, longitude, { mover: true });
    } catch (erro) {
      mostrarToast(erro.message, 'erro');
    } finally {
      botao.innerHTML = original;
      botao.disabled = false;
    }
  });
}

if (usuario) iniciar();
