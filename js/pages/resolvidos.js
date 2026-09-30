/**
 * PROBLEMAS RESOLVIDOS (resolvidos.html)
 * Funciona como um "changelog" da cidade: linha do tempo agrupada por mês.
 */
import { iniciarPagina } from '../app.js';
import { icone } from '../utils/icons.js';
import { $, escaparHtml, formatarNumero } from '../utils/dom.js';
import { formatarData, formatarMesAno, textoTempoResolucao, diasEntre } from '../utils/formatDate.js';
import { CATEGORIAS } from '../config/categories.js';
import { listarOcorrencias } from '../services/problemService.js';
import { filtrarOcorrencias, OPCOES_PERIODO, opcoesSelect } from '../components/filters.js';
import { badgeCategoria, badgeStatus, bolinhaCategoria, estadoVazio, skeletonCards } from '../components/badges.js';

iniciarPagina({ paginaAtiva: 'resolvidos' });

let resolvidas = [];
const filtros = { categoria: 'todas', periodo: '' };

function desenharResumo() {
  const tempos = resolvidas.map((o) => diasEntre(o.criadoEm, o.resolvidoEm));
  const media = tempos.length ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 0;
  const votos = resolvidas.reduce((soma, o) => soma + o.totalVotos, 0);
  const ultimos30 = filtrarOcorrencias(resolvidas, { periodo: 30, campoData: 'resolvidoEm' }).length;

  const itens = [
    { valor: formatarNumero(resolvidas.length), texto: 'Problemas resolvidos', icone: 'circle-check', cor: 'var(--sucesso)' },
    { valor: `${media} dias`, texto: 'Tempo médio de resolução', icone: 'hourglass', cor: '#F59E0B' },
    { valor: formatarNumero(ultimos30), texto: 'Resolvidos nos últimos 30 dias', icone: 'trending-up', cor: 'var(--azul)' },
    { valor: formatarNumero(votos), texto: 'Confirmações da comunidade', icone: 'users', cor: '#7C3AED' },
  ];
  $('#resumo').innerHTML = itens
    .map(
      (item) => `
      <div class="indicador">
        <span class="indicador-icone" style="--cor:${item.cor}">${icone(item.icone, { tamanho: 20 })}</span>
        <span><strong>${item.valor}</strong><span>${item.texto}</span></span>
      </div>`
    )
    .join('');
}

function itemLinhaDoTempo(ocorrencia) {
  return `
    <li class="changelog-item">
      <span class="changelog-marcador">${bolinhaCategoria(ocorrencia.categoria, 36)}</span>
      <article class="card changelog-card">
        <div class="changelog-topo">
          <div class="changelog-badges">
            ${badgeStatus('resolvido')}
            ${badgeCategoria(ocorrencia.categoria, { suave: true, curto: true })}
            <span class="card-ocorrencia-id">#${ocorrencia.id}</span>
          </div>
          <span class="changelog-tempo">${icone('timer', { tamanho: 15 })} ${textoTempoResolucao(ocorrencia.criadoEm, ocorrencia.resolvidoEm)}</span>
        </div>
        <h3><a href="ocorrencia.html?id=${ocorrencia.id}">${escaparHtml(ocorrencia.titulo)}</a></h3>
        <p class="changelog-local">${icone('map-pin', { tamanho: 14 })} ${escaparHtml(ocorrencia.endereco)}${ocorrencia.bairro ? ` · ${escaparHtml(ocorrencia.bairro)}` : ''}</p>
        <div class="changelog-rodape">
          <span>${icone('flag', { tamanho: 14 })} Denunciado em <strong>${formatarData(ocorrencia.criadoEm)}</strong></span>
          <span>${icone('circle-check', { tamanho: 14 })} Resolvido em <strong>${formatarData(ocorrencia.resolvidoEm)}</strong></span>
          <span>${icone('thumbs-up', { tamanho: 14 })} <strong>${formatarNumero(ocorrencia.totalVotos)}</strong> confirmações</span>
          <a class="btn btn-secundario btn-sm" href="mapa.html?id=${ocorrencia.id}">${icone('map', { tamanho: 14 })} Ver no mapa</a>
        </div>
      </article>
    </li>`;
}

function desenharLinhaDoTempo() {
  const lista = filtrarOcorrencias(resolvidas, { ...filtros, campoData: 'resolvidoEm' });
  $('#contagem').textContent = `${lista.length} ${lista.length === 1 ? 'resultado' : 'resultados'}`;

  if (lista.length === 0) {
    $('#linha-do-tempo').innerHTML = estadoVazio({
      iconeNome: 'circle-check',
      titulo: 'Nenhum problema resolvido com esses filtros',
      texto: 'Tente outra categoria ou um período maior.',
    });
    return;
  }

  // Agrupa por mês de resolução: { "setembro de 2026": [...], ... }
  const grupos = {};
  lista.forEach((ocorrencia) => {
    const mes = formatarMesAno(ocorrencia.resolvidoEm);
    (grupos[mes] = grupos[mes] || []).push(ocorrencia);
  });

  $('#linha-do-tempo').innerHTML = Object.entries(grupos)
    .map(
      ([mes, itens]) => `
      <section class="changelog-mes">
        <h2>${mes.charAt(0).toUpperCase() + mes.slice(1)} <span>${itens.length} ${itens.length === 1 ? 'melhoria' : 'melhorias'}</span></h2>
        <ol class="changelog">${itens.map(itemLinhaDoTempo).join('')}</ol>
      </section>`
    )
    .join('');
}

async function iniciar() {
  const opcoesCategoria = [{ valor: 'todas', texto: 'Todas as categorias' }, ...CATEGORIAS.map((c) => ({ valor: c.id, texto: c.nome }))];
  $('#filtro-categoria').innerHTML = opcoesSelect(opcoesCategoria, 'todas');
  $('#filtro-periodo').innerHTML = opcoesSelect(OPCOES_PERIODO, '');
  $('#linha-do-tempo').innerHTML = skeletonCards(3);

  $('#filtro-categoria').addEventListener('change', (e) => {
    filtros.categoria = e.target.value;
    desenharLinhaDoTempo();
  });
  $('#filtro-periodo').addEventListener('change', (e) => {
    filtros.periodo = e.target.value;
    desenharLinhaDoTempo();
  });

  const todas = await listarOcorrencias();
  resolvidas = todas
    .filter((o) => o.status === 'resolvido' && o.resolvidoEm)
    .sort((a, b) => new Date(b.resolvidoEm) - new Date(a.resolvidoEm));

  desenharResumo();
  desenharLinhaDoTempo();
}

iniciar();
