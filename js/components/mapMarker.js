/**
 * MAPA E PINS (Leaflet)
 * A biblioteca Leaflet é carregada via CDN e fica disponível como `window.L`.
 */
import { obterCategoria } from '../config/categories.js';
import { CENTRO_SOROCABA, ZOOM_INICIAL, URL_TILES, ATRIBUICAO_MAPA, VOTOS_EM_ALTA } from '../config/constants.js';
import { icone } from '../utils/icons.js';

/** Cria um mapa com o visual padrão do projeto. */
export function criarMapa(elemento, { centro = CENTRO_SOROCABA, zoom = ZOOM_INICIAL, interativo = true, ...opcoesExtras } = {}) {
  const mapa = L.map(elemento, {
    center: centro,
    zoom,
    zoomControl: false, // usamos nossos próprios botões
    attributionControl: true,
    dragging: interativo,
    scrollWheelZoom: interativo,
    doubleClickZoom: interativo,
    touchZoom: interativo,
    boxZoom: interativo,
    keyboard: interativo,
    ...opcoesExtras,
  });
  mapa.attributionControl.setPrefix(false);

  L.tileLayer(URL_TILES, { maxZoom: 19, attribution: ATRIBUICAO_MAPA }).addTo(mapa);
  return mapa;
}

/**
 * Ícone do pin, desenhado com HTML/CSS (L.divIcon).
 * - Cor e ícone vêm da categoria
 * - "Em alta" (muitos votos) = pin maior + selo com o número de votos
 * - Resolvido = pin mais apagado
 */
export function criarIconePin(ocorrencia, { selecionado = false } = {}) {
  const categoria = obterCategoria(ocorrencia.categoria);
  const emAlta = (ocorrencia.totalVotos || 0) >= VOTOS_EM_ALTA && ocorrencia.status !== 'resolvido';
  const resolvido = ocorrencia.status === 'resolvido';
  const tamanho = emAlta ? 48 : 38;

  const classes = ['pin', emAlta && 'pin-alta', resolvido && 'pin-resolvido', selecionado && 'pin-selecionado']
    .filter(Boolean)
    .join(' ');

  return L.divIcon({
    className: 'pin-leaflet',
    html: `
      <div class="${classes}" style="--cor:${categoria.cor}">
        <div class="pin-corpo">${icone(categoria.icone, { tamanho: emAlta ? 20 : 16, espessura: 2.4 })}</div>
        ${emAlta ? `<span class="pin-selo" title="Em alta">${icone('flame', { tamanho: 10, espessura: 3 })}${ocorrencia.totalVotos}</span>` : ''}
      </div>`,
    iconSize: [tamanho, tamanho],
    // A "ponta" do pin fica embaixo à esquerda do quadrado girado 45°
    iconAnchor: [tamanho / 2, tamanho * 1.2],
    tooltipAnchor: [tamanho / 2, -tamanho / 2],
  });
}

/** Ícone simples usado ao escolher um local (formulário de reportar). */
export function criarIconeSelecao(categoriaId = 'outros') {
  return criarIconePin({ categoria: categoriaId, totalVotos: 0, status: 'reportado' }, { selecionado: true });
}

/** Ponto azul "você está aqui". */
export function criarIconeLocalizacao() {
  return L.divIcon({ className: 'pin-leaflet', html: '<div class="ponto-localizacao"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
}

/** Ícone dos grupos de pins (marker clustering). */
export function criarIconeCluster(cluster) {
  const quantidade = cluster.getChildCount();
  const tamanho = quantidade < 10 ? 40 : quantidade < 30 ? 48 : 56;
  return L.divIcon({
    className: 'cluster-leaflet',
    html: `<div class="cluster">${quantidade}</div>`,
    iconSize: [tamanho, tamanho],
  });
}
