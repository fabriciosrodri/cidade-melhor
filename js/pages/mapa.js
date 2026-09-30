/**
 * PÁGINA DO MAPA (mapa.html) — a mais importante do projeto.
 *
 * Organização:
 *  1. Estado da página (dados carregados + filtros escolhidos)
 *  2. Sidebar (categorias e filtros)
 *  3. Mapa e pins
 *  4. Painel de detalhes
 *  5. Controles, legenda e indicadores
 *  6. Inicialização
 */
import { iniciarPagina } from '../app.js';
import { icone } from '../utils/icons.js';
import { $, $$, parametroUrl, formatarNumero } from '../utils/dom.js';
import { CATEGORIAS } from '../config/categories.js';
import { STATUS } from '../config/status.js';
import { listarOcorrencias, obterOcorrencia } from '../services/problemService.js';
import { obterResumo } from '../services/statsService.js';
import { obterLocalizacaoAtual } from '../services/geoService.js';
import { criarMapa, criarIconePin, criarIconeLocalizacao, criarIconeCluster } from '../components/mapMarker.js';
import { filtrarOcorrencias, OPCOES_PERIODO, opcoesSelect } from '../components/filters.js';
import { renderizarPainel } from '../components/problemDetails.js';
import { criarBarraBusca } from '../components/searchBar.js';
import { mostrarToast } from '../components/toast.js';

const usuario = iniciarPagina({ paginaAtiva: 'mapa' });

/* =========================================================
   1. ESTADO
   ========================================================= */
const categoriaInicial = parametroUrl('categoria');
const estado = {
  ocorrencias: [],
  selecionadaId: null,
  filtros: {
    categoria: CATEGORIAS.some((c) => c.id === categoriaInicial) ? categoriaInicial : 'todas',
    status: 'todos',
    periodo: '',
    apenasMeus: false,
  },
};

let mapa;
let grupoPins;                 // grupo com clustering
const marcadores = new Map();  // id da ocorrência → marcador do Leaflet
let marcadorBusca = null;
let marcadorUsuario = null;

const ehCelular = () => window.matchMedia('(max-width: 900px)').matches;

/** Ocorrências que passam pelos filtros escolhidos. */
function ocorrenciasFiltradas({ ignorarCategoria = false } = {}) {
  const { categoria, status, periodo, apenasMeus } = estado.filtros;
  return filtrarOcorrencias(estado.ocorrencias, {
    categoria: ignorarCategoria ? 'todas' : categoria,
    status,
    periodo,
    autorId: apenasMeus && usuario ? usuario.id : undefined,
  });
}

/* =========================================================
   2. SIDEBAR
   ========================================================= */
function montarSidebar() {
  const itensCategoria = [{ id: 'todas', curto: 'Todos', icone: 'layout-grid', cor: 'var(--azul)' }, ...CATEGORIAS]
    .map(
      (categoria) => `
      <li>
        <button type="button" class="filtro-categoria" data-categoria="${categoria.id}" style="--cor:${categoria.cor}">
          <span class="bolinha-categoria">${icone(categoria.icone, { tamanho: 15 })}</span>
          <span class="filtro-categoria-nome">${categoria.id === 'todas' ? 'Todos' : categoria.nome}</span>
          <span class="filtro-contador" data-contador="${categoria.id}">0</span>
        </button>
      </li>`
    )
    .join('');

  const opcoesStatus = [{ valor: 'todos', texto: 'Todos os status' }, ...STATUS.map((s) => ({ valor: s.id, texto: s.nome }))];

  $('#sidebar-conteudo').innerHTML = `
    <a href="reportar.html" class="btn btn-primario btn-lg btn-bloco">${icone('plus', { tamanho: 20 })} Reportar problema</a>

    <h2 class="sidebar-titulo">Tipos de problema</h2>
    <ul class="lista-categorias">${itensCategoria}</ul>

    <h2 class="sidebar-titulo">Filtros</h2>
    <div class="campo campo-compacto">
      <label class="campo-label" for="filtro-periodo">${icone('calendar', { tamanho: 16 })} Período</label>
      <select class="campo-select" id="filtro-periodo">${opcoesSelect(OPCOES_PERIODO, estado.filtros.periodo)}</select>
    </div>
    <div class="campo campo-compacto">
      <label class="campo-label" for="filtro-status">${icone('circle-check', { tamanho: 16 })} Status</label>
      <select class="campo-select" id="filtro-status">${opcoesSelect(opcoesStatus, estado.filtros.status)}</select>
    </div>
    ${usuario ? '<label class="checkbox"><input type="checkbox" id="filtro-meus"> Mostrar apenas meus pins</label>' : ''}
    <button type="button" class="btn btn-fantasma btn-sm btn-limpar" id="limpar-filtros">${icone('rotate-ccw', { tamanho: 15 })} Limpar filtros</button>

    <div class="dica-card">
      <div>
        <strong>Não encontrou algo?</strong>
        <p>Dê zoom na área do mapa ou ajuste os filtros.</p>
      </div>
      ${icone('map-pinned', { tamanho: 36, espessura: 1.5 })}
    </div>`;

  // Eventos
  $$('.filtro-categoria').forEach((botao) =>
    botao.addEventListener('click', () => {
      estado.filtros.categoria = botao.dataset.categoria;
      aplicarFiltros();
      if (ehCelular()) fecharSidebar();
    })
  );
  $('#filtro-periodo').addEventListener('change', (e) => {
    estado.filtros.periodo = e.target.value;
    aplicarFiltros();
  });
  $('#filtro-status').addEventListener('change', (e) => {
    estado.filtros.status = e.target.value;
    aplicarFiltros();
  });
  $('#filtro-meus')?.addEventListener('change', (e) => {
    estado.filtros.apenasMeus = e.target.checked;
    aplicarFiltros();
  });
  $('#limpar-filtros').addEventListener('click', () => {
    estado.filtros = { categoria: 'todas', status: 'todos', periodo: '', apenasMeus: false };
    $('#filtro-periodo').value = '';
    $('#filtro-status').value = 'todos';
    if ($('#filtro-meus')) $('#filtro-meus').checked = false;
    aplicarFiltros();
  });

  // Gaveta no celular
  $('#fechar-sidebar').innerHTML = icone('x', { tamanho: 20 });
  $('#abrir-sidebar').innerHTML = `${icone('sliders-horizontal', { tamanho: 18 })}<span class="texto-botao">Filtros</span>`;
  $('#abrir-sidebar').setAttribute('aria-label', 'Abrir filtros');
  $('#abrir-sidebar').addEventListener('click', abrirSidebar);
  $('#fechar-sidebar').addEventListener('click', fecharSidebar);
  $('#sidebar-fundo').addEventListener('click', fecharSidebar);
}

function abrirSidebar() {
  $('#sidebar').classList.add('aberta');
  $('#sidebar-fundo').hidden = false;
}

function fecharSidebar() {
  $('#sidebar').classList.remove('aberta');
  $('#sidebar-fundo').hidden = true;
}

/** Atualiza contadores e o destaque da categoria escolhida. */
function atualizarSidebar() {
  const base = ocorrenciasFiltradas({ ignorarCategoria: true });
  $$('[data-contador]').forEach((contador) => {
    const id = contador.dataset.contador;
    contador.textContent = id === 'todas' ? base.length : base.filter((o) => o.categoria === id).length;
  });
  $$('.filtro-categoria').forEach((botao) => {
    const ativo = botao.dataset.categoria === estado.filtros.categoria;
    botao.classList.toggle('ativo', ativo);
    botao.setAttribute('aria-pressed', String(ativo));
  });
}

function aplicarFiltros() {
  atualizarSidebar();
  desenharPins();
}

/* =========================================================
   3. MAPA E PINS
   ========================================================= */
function montarMapa() {
  mapa = criarMapa('mapa');
  grupoPins = L.markerClusterGroup({
    iconCreateFunction: criarIconeCluster,
    showCoverageOnHover: false,
    maxClusterRadius: 45,
    disableClusteringAtZoom: 16,
  });
  mapa.addLayer(grupoPins);
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(mapa);
}

function desenharPins() {
  grupoPins.clearLayers();
  marcadores.clear();

  const visiveis = ocorrenciasFiltradas();
  visiveis.forEach((ocorrencia) => {
    const marcador = L.marker([ocorrencia.latitude, ocorrencia.longitude], {
      icon: criarIconePin(ocorrencia, { selecionado: ocorrencia.id === estado.selecionadaId }),
      title: ocorrencia.titulo,
      keyboard: true,
      riseOnHover: true,
      zIndexOffset: ocorrencia.status === 'resolvido' ? -500 : ocorrencia.totalVotos,
    });
    marcador.on('click', () => abrirPainel(ocorrencia.id));
    marcadores.set(ocorrencia.id, marcador);
  });
  grupoPins.addLayers([...marcadores.values()]);

  // Se a ocorrência aberta sumiu por causa do filtro, fecha o painel
  if (estado.selecionadaId && !marcadores.has(estado.selecionadaId)) fecharPainel();

  $('#mapa-vazio')?.remove();
  if (visiveis.length === 0) {
    $('.mapa-area').insertAdjacentHTML(
      'beforeend',
      `<div class="mapa-vazio" id="mapa-vazio">${icone('search-x', { tamanho: 20 })} Nenhuma ocorrência com esses filtros. <button type="button" class="link-botao" id="vazio-limpar">Limpar filtros</button></div>`
    );
    $('#vazio-limpar').addEventListener('click', () => $('#limpar-filtros').click());
  }
}

/** Troca o ícone do pin selecionado (anel colorido em volta). */
function destacarPin(id, selecionado) {
  const marcador = marcadores.get(id);
  const ocorrencia = estado.ocorrencias.find((o) => o.id === id);
  if (marcador && ocorrencia) marcador.setIcon(criarIconePin(ocorrencia, { selecionado }));
}

/**
 * Centraliza o mapa no ponto, deslocando para o painel não cobrir o pin
 * (à direita no computador, embaixo no celular).
 */
function centralizarComPainel(latitude, longitude, zoom = Math.max(mapa.getZoom(), 16)) {
  const tamanho = mapa.getSize();
  const deslocamento = ehCelular() ? L.point(0, tamanho.y * 0.28) : L.point(Math.min(200, tamanho.x * 0.2), 0);
  const ponto = mapa.project([latitude, longitude], zoom).add(deslocamento);
  mapa.flyTo(mapa.unproject(ponto, zoom), zoom, { duration: 0.6 });
}

/* =========================================================
   4. PAINEL DE DETALHES
   ========================================================= */
async function abrirPainel(id, { centralizar = true } = {}) {
  const painel = $('#painel');
  if (estado.selecionadaId && estado.selecionadaId !== id) destacarPin(estado.selecionadaId, false);
  estado.selecionadaId = id;
  destacarPin(id, true);

  painel.hidden = false;
  $('.mapa-area').classList.add('com-painel');
  painel.innerHTML = '<div class="carregando-bloco"><span class="spinner spinner-grande"></span>Carregando...</div>';

  const ocorrencia = await obterOcorrencia(id);
  if (!ocorrencia) {
    fecharPainel();
    mostrarToast('Esta ocorrência não existe mais.', 'erro');
    return;
  }
  if (estado.selecionadaId !== id) return; // o usuário clicou em outro pin enquanto carregava

  renderizarPainel(painel, ocorrencia, {
    usuario,
    aoFechar: fecharPainel,
    aoMudar: atualizarOcorrencia,
    aoExcluir: removerOcorrencia,
  });

  if (centralizar) centralizarComPainel(ocorrencia.latitude, ocorrencia.longitude);
  history.replaceState(null, '', `mapa.html?id=${id}`);
}

function fecharPainel() {
  if (estado.selecionadaId) destacarPin(estado.selecionadaId, false);
  estado.selecionadaId = null;
  $('#painel').hidden = true;
  $('.mapa-area').classList.remove('com-painel');
  history.replaceState(null, '', 'mapa.html');
}

/** Chamado quando a ocorrência muda (voto, status) para atualizar pin, painel e números. */
function atualizarOcorrencia(atualizada) {
  estado.ocorrencias = estado.ocorrencias.map((o) => (o.id === atualizada.id ? { ...o, ...atualizada } : o));
  aplicarFiltros();
  if (estado.selecionadaId === atualizada.id && marcadores.has(atualizada.id)) {
    abrirPainel(atualizada.id, { centralizar: false });
  }
  carregarIndicadores();
}

function removerOcorrencia(ocorrencia) {
  estado.ocorrencias = estado.ocorrencias.filter((o) => o.id !== ocorrencia.id);
  fecharPainel();
  aplicarFiltros();
  carregarIndicadores();
}

/* =========================================================
   5. CONTROLES, LEGENDA E INDICADORES
   ========================================================= */
function montarControles() {
  $('#mapa-controles').innerHTML = `
    <div class="grupo-controles">
      <button type="button" class="controle" id="zoom-mais" aria-label="Aproximar" data-tooltip="Aproximar" data-tooltip-lado="esquerda">${icone('plus', { tamanho: 20 })}</button>
      <button type="button" class="controle" id="zoom-menos" aria-label="Afastar" data-tooltip="Afastar" data-tooltip-lado="esquerda">${icone('minus', { tamanho: 20 })}</button>
    </div>
    <button type="button" class="controle controle-sozinho" id="minha-localizacao" aria-label="Minha localização" data-tooltip="Minha localização" data-tooltip-lado="esquerda">${icone('locate-fixed', { tamanho: 20 })}</button>
    <button type="button" class="controle controle-sozinho" id="ver-cidade" aria-label="Ver a cidade inteira" data-tooltip="Ver a cidade inteira" data-tooltip-lado="esquerda">${icone('maximize', { tamanho: 18 })}</button>`;

  $('#zoom-mais').addEventListener('click', () => mapa.zoomIn());
  $('#zoom-menos').addEventListener('click', () => mapa.zoomOut());
  $('#ver-cidade').addEventListener('click', () => {
    const limites = grupoPins.getBounds();
    if (limites.isValid()) mapa.flyToBounds(limites, { padding: [40, 40], duration: 0.6 });
  });

  $('#minha-localizacao').addEventListener('click', async (evento) => {
    const botao = evento.currentTarget;
    botao.innerHTML = '<span class="spinner"></span>';
    try {
      const { latitude, longitude } = await obterLocalizacaoAtual();
      if (marcadorUsuario) marcadorUsuario.remove();
      marcadorUsuario = L.marker([latitude, longitude], { icon: criarIconeLocalizacao(), interactive: false }).addTo(mapa);
      mapa.flyTo([latitude, longitude], 16, { duration: 0.6 });
    } catch (erro) {
      mostrarToast(erro.message, 'erro');
    } finally {
      botao.innerHTML = icone('locate-fixed', { tamanho: 20 });
    }
  });

  $('#reportar-flutuante').innerHTML = icone('plus', { tamanho: 26 });
}

function montarLegenda() {
  $('#mapa-legenda').innerHTML = CATEGORIAS.map(
    (categoria) => `<span class="legenda-item"><span class="bolinha-categoria" style="--cor:${categoria.cor}">${icone(categoria.icone, { tamanho: 11 })}</span>${categoria.curto}</span>`
  ).join('');
}

async function carregarIndicadores() {
  const resumo = await obterResumo();
  const itens = [
    { valor: resumo.total, texto: 'Problemas reportados', icone: 'clipboard-list', cor: 'var(--azul)' },
    { valor: resumo.resolvidos, texto: 'Resolvidos', icone: 'check', cor: 'var(--sucesso)' },
    { valor: resumo.emAnalise + resumo.emAndamento, texto: 'Em análise / andamento', icone: 'clock', cor: '#F59E0B' },
    { valor: resumo.cidadaos, texto: 'Cidadãos ativos', icone: 'users', cor: '#7C3AED' },
  ];
  $('#mapa-indicadores').innerHTML = `
    <div class="mapa-indicadores-lista">
      ${itens
        .map(
          (item) => `
        <div class="mapa-indicador">
          <span class="indicador-icone" style="--cor:${item.cor}">${icone(item.icone, { tamanho: 18 })}</span>
          <span><strong>${formatarNumero(item.valor)}</strong><small>${item.texto}</small></span>
        </div>`
        )
        .join('')}
    </div>
    <a href="relatorios.html" class="btn btn-secundario">Ver relatórios</a>`;
}

/* =========================================================
   6. INICIALIZAÇÃO
   ========================================================= */
async function iniciar() {
  montarSidebar();
  montarMapa();
  montarControles();
  montarLegenda();
  carregarIndicadores();

  criarBarraBusca($('#busca'), {
    obterOcorrencias: () => estado.ocorrencias,
    aoSelecionar: (item) => {
      if (item.tipo === 'ocorrencia') {
        // Garante que o pin está visível mesmo com filtros
        if (!marcadores.has(item.id)) $('#limpar-filtros').click();
        abrirPainel(item.id);
        return;
      }
      if (marcadorBusca) marcadorBusca.remove();
      marcadorBusca = L.marker([item.latitude, item.longitude], { icon: criarIconeLocalizacao(), interactive: false }).addTo(mapa);
      mapa.flyTo([item.latitude, item.longitude], 17, { duration: 0.6 });
    },
  });

  try {
    estado.ocorrencias = await listarOcorrencias();
  } catch (erro) {
    mostrarToast('Não foi possível carregar as ocorrências.', 'erro');
  }
  $('#mapa-carregando').hidden = true;
  aplicarFiltros();

  // mapa.html?id=2801 → abre direto no pin
  const idInicial = Number(parametroUrl('id'));
  if (idInicial && estado.ocorrencias.some((o) => o.id === idInicial)) {
    abrirPainel(idInicial);
  } else {
    // Enquadra todos os pins na tela
    const limites = grupoPins.getBounds();
    if (limites.isValid()) mapa.fitBounds(limites, { padding: [60, 60] });
    if (idInicial) mostrarToast('Ocorrência não encontrada.', 'erro');
  }

  // Fecha o painel com Esc
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && !document.querySelector('.modal-fundo')) {
      fecharPainel();
      fecharSidebar();
    }
  });
}

iniciar();
