/** CARD DE OCORRÊNCIA usado nas listas (Meus Pins, Home...). */
import { icone } from '../utils/icons.js';
import { escaparHtml, formatarNumero } from '../utils/dom.js';
import { dataRelativa } from '../utils/formatDate.js';
import { badgeCategoria, badgeStatus, fotoOcorrencia } from './badges.js';

/**
 * @param {object} ocorrencia - ocorrência enriquecida (com totalVotos, autorNome...)
 * @param {object} opcoes
 * @param {boolean} opcoes.acoesDoAutor - mostra Editar/Excluir
 */
export function cardOcorrencia(ocorrencia, { acoesDoAutor = false } = {}) {
  const acoesAutor = acoesDoAutor
    ? `<a class="btn btn-secundario btn-sm" href="reportar.html?id=${ocorrencia.id}" data-tooltip="Editar">${icone('pencil', { tamanho: 15 })}<span class="sr-only">Editar</span></a>
       <button type="button" class="btn btn-perigo-suave btn-sm" data-excluir="${ocorrencia.id}" data-tooltip="Excluir">${icone('trash-2', { tamanho: 15 })}<span class="sr-only">Excluir</span></button>`
    : '';

  return `
    <article class="card-ocorrencia" data-id="${ocorrencia.id}">
      <a class="card-ocorrencia-foto" href="ocorrencia.html?id=${ocorrencia.id}" tabindex="-1" aria-hidden="true">${fotoOcorrencia(ocorrencia, 36)}</a>
      <div class="card-ocorrencia-info">
        <div class="card-ocorrencia-topo">
          ${badgeCategoria(ocorrencia.categoria, { suave: true, curto: true })}
          ${badgeStatus(ocorrencia.status)}
          <span class="card-ocorrencia-id">#${ocorrencia.id}</span>
        </div>
        <h3><a href="ocorrencia.html?id=${ocorrencia.id}">${escaparHtml(ocorrencia.titulo)}</a></h3>
        <div class="card-ocorrencia-meta">
          <span>${icone('map-pin', { tamanho: 14 })}${escaparHtml(ocorrencia.endereco)}${ocorrencia.bairro ? ` · ${escaparHtml(ocorrencia.bairro)}` : ''}</span>
          <span>${icone('calendar', { tamanho: 14 })}${dataRelativa(ocorrencia.criadoEm)}</span>
          <span>${icone('message-circle', { tamanho: 14 })}${formatarNumero(ocorrencia.totalComentarios)}</span>
        </div>
      </div>
      <div class="card-ocorrencia-lateral">
        <span class="contador-votos" data-tooltip="Pessoas que confirmaram">${icone('thumbs-up', { tamanho: 16 })}${formatarNumero(ocorrencia.totalVotos)}</span>
        <div class="card-ocorrencia-acoes">
          <a class="btn btn-secundario btn-sm" href="mapa.html?id=${ocorrencia.id}" data-tooltip="Ver no mapa">${icone('map', { tamanho: 15 })}<span class="sr-only">Ver no mapa</span></a>
          <a class="btn btn-suave btn-sm" href="ocorrencia.html?id=${ocorrencia.id}">Ver detalhes</a>
          ${acoesAutor}
        </div>
      </div>
    </article>`;
}
