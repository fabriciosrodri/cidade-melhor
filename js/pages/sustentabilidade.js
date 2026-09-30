/** SUSTENTABILIDADE / ODS (sustentabilidade.html) — página educativa. */
import { iniciarPagina } from '../app.js';
import { icone } from '../utils/icons.js';
import { $, $$ } from '../utils/dom.js';
import { ODS, ODS_DO_PROJETO, ACOES_DIA_A_DIA } from '../data/ods.js';
import { badgeCategoria } from '../components/badges.js';
import { abrirModal } from '../components/modal.js';

iniciarPagina({ paginaAtiva: 'sustentabilidade' });

const obterOds = (numero) => ODS.find((ods) => ods.numero === numero);

function cardOds(ods) {
  return `
    <button type="button" class="ods-card" style="--cor:${ods.cor}" data-ods="${ods.numero}" aria-label="ODS ${ods.numero}: ${ods.nome}">
      <span class="ods-numero">${ods.numero}</span>
      <span class="ods-nome">${ods.nome}</span>
    </button>`;
}

function montarHero() {
  $('#botao-acoes').innerHTML = `${icone('leaf', { tamanho: 20 })} Como posso ajudar?`;
  // Mosaico decorativo com as cores dos 17 ODS
  $('#mosaico').innerHTML = ODS.map((ods) => `<span style="--cor:${ods.cor}">${ods.numero}</span>`).join('') + `<span class="mosaico-logo">${icone('globe', { tamanho: 28 })}</span>`;
}

function montarAgenda() {
  const blocos = [
    { icone: 'globe', titulo: 'O que é?', texto: 'Em 2015, os 193 países da ONU, incluindo o Brasil, assinaram a Agenda 2030: um plano com 17 objetivos e 169 metas para o desenvolvimento sustentável.' },
    { icone: 'scale', titulo: 'Três dimensões', texto: 'Os ODS equilibram três pilares: o <strong>social</strong> (pessoas), o <strong>ambiental</strong> (planeta) e o <strong>econômico</strong> (prosperidade).' },
    { icone: 'building-2', titulo: 'E as cidades?', texto: 'Mais da metade da população mundial vive em cidades. Por isso, o ODS 11 pede cidades inclusivas, seguras, resilientes e sustentáveis.' },
    { icone: 'hand-heart', titulo: 'Qual o meu papel?', texto: 'Governos e empresas têm grande responsabilidade, mas cada cidadão pode ajudar: cuidando do espaço público e cobrando melhorias.' },
  ];
  $('#agenda-cards').innerHTML = blocos
    .map(
      (bloco) => `
      <div class="agenda-bloco">
        <span class="agenda-icone">${icone(bloco.icone, { tamanho: 22 })}</span>
        <h3>${bloco.titulo}</h3>
        <p>${bloco.texto}</p>
      </div>`
    )
    .join('');
}

function montarOdsDoProjeto() {
  $('#ods-projeto').innerHTML = ODS_DO_PROJETO.map((item) => {
    const ods = obterOds(item.numero);
    return `
      <article class="ods-projeto" style="--cor:${ods.cor}">
        <div class="ods-projeto-topo">
          <span class="ods-projeto-numero">${ods.numero}</span>
          <h3>${ods.nome}</h3>
        </div>
        <p>${item.relacao}</p>
        <div class="ods-projeto-categorias">${item.categorias.map((id) => badgeCategoria(id, { suave: true, curto: true })).join('')}</div>
      </article>`;
  }).join('');
}

function montarGradeOds() {
  $('#grade-ods').innerHTML = ODS.map(cardOds).join('');
  $$('#grade-ods .ods-card').forEach((card) =>
    card.addEventListener('click', () => {
      const ods = obterOds(Number(card.dataset.ods));
      const doProjeto = ODS_DO_PROJETO.find((item) => item.numero === ods.numero);
      abrirModal({
        titulo: `ODS ${ods.numero}`,
        conteudo: `
          <div class="modal-ods" style="--cor:${ods.cor}">
            <span class="ods-numero">${ods.numero}</span>
            <strong>${ods.nome}</strong>
          </div>
          <p>${ods.descricao}</p>
          ${doProjeto ? `<p class="modal-ods-relacao">${icone('map-pin', { tamanho: 16 })} <span><strong>No Cidade Melhor:</strong> ${doProjeto.relacao}</span></p>` : ''}`,
        rodape: '<button type="button" class="btn btn-primario" data-fechar data-principal>Fechar</button>',
      });
    })
  );
}

function montarAcoes() {
  $('#grade-acoes').innerHTML = ACOES_DIA_A_DIA.map((acao) => {
    const ods = obterOds(acao.ods);
    return `
      <article class="acao-card">
        <span class="acao-icone">${icone(acao.icone, { tamanho: 24 })}</span>
        <h3>${acao.titulo}</h3>
        <p>${acao.texto}</p>
        <span class="acao-ods" style="--cor:${ods.cor}">ODS ${ods.numero} · ${ods.nome}</span>
      </article>`;
  }).join('');

  $('#cta-ods').innerHTML = `
    <div>
      <h2>Faça sua parte agora</h2>
      <p>Viu algum problema no caminho? Registre no mapa em menos de um minuto e ajude Sorocaba a cumprir a Agenda 2030.</p>
    </div>
    <a href="mapa.html" class="btn btn-lg btn-branco">${icone('map-pin', { tamanho: 20 })} Abrir o mapa</a>`;
}

montarHero();
montarAgenda();
montarOdsDoProjeto();
montarGradeOds();
montarAcoes();
