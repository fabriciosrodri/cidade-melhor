/** Pequenos pedaços de HTML reutilizados em várias páginas. */
import { obterCategoria } from '../config/categories.js';
import { obterStatus } from '../config/status.js';
import { icone } from '../utils/icons.js';
import { escaparHtml } from '../utils/dom.js';

/** Badge colorido com o status (Reportado, Em análise...). */
export function badgeStatus(statusId) {
  const status = obterStatus(statusId);
  return `<span class="badge badge-status" style="--cor:${status.cor};--fundo-badge:${status.fundo}">${icone(status.icone, { tamanho: 14 })}${status.nome}</span>`;
}

/** Badge da categoria. `suave` = fundo clarinho em vez de cor cheia. */
export function badgeCategoria(categoriaId, { suave = false, curto = false } = {}) {
  const categoria = obterCategoria(categoriaId);
  return `<span class="badge ${suave ? 'badge-categoria-suave' : 'badge-categoria'}" style="--cor:${categoria.cor}">${icone(categoria.icone, { tamanho: 14 })}${curto ? categoria.curto : categoria.nome}</span>`;
}

/** Bolinha colorida com o ícone da categoria. */
export function bolinhaCategoria(categoriaId, tamanho = 32) {
  const categoria = obterCategoria(categoriaId);
  return `<span class="bolinha-categoria" style="--cor:${categoria.cor};width:${tamanho}px;height:${tamanho}px">${icone(categoria.icone, { tamanho: Math.round(tamanho * 0.5) })}</span>`;
}

/** Foto da ocorrência ou, se não houver, uma ilustração com o ícone da categoria. */
export function fotoOcorrencia(ocorrencia, tamanhoIcone = 40) {
  if (ocorrencia.fotos && ocorrencia.fotos.length > 0) {
    return `<img src="${ocorrencia.fotos[0]}" alt="Foto do problema: ${escaparHtml(ocorrencia.titulo)}" loading="lazy">`;
  }
  const categoria = obterCategoria(ocorrencia.categoria);
  return `<div class="foto-padrao" style="--cor:${categoria.cor}" role="img" aria-label="${escaparHtml(categoria.nome)} (sem foto)">${icone(categoria.icone, { tamanho: tamanhoIcone, espessura: 1.6 })}</div>`;
}

/** Estado vazio: ícone + título + texto + botão opcional. */
export function estadoVazio({ iconeNome = 'map-pin', titulo, texto, acao = '' }) {
  return `
    <div class="estado-vazio">
      <div class="estado-vazio-icone">${icone(iconeNome, { tamanho: 28 })}</div>
      <h3>${titulo}</h3>
      <p>${texto}</p>
      ${acao}
    </div>`;
}

/** Bloco "carregando..." */
export function blocoCarregando(texto = 'Carregando...') {
  return `<div class="carregando-bloco"><span class="spinner spinner-grande"></span>${texto}</div>`;
}

/** Placeholders cinza enquanto a lista carrega. */
export function skeletonCards(quantidade = 3) {
  return Array.from({ length: quantidade }, () => '<div class="skeleton skeleton-card"></div>').join('');
}
