/** PÁGINA INICIAL (index.html) */
import { iniciarPagina } from '../app.js';
import { icone } from '../utils/icons.js';
import { $, escaparHtml, formatarNumero } from '../utils/dom.js';
import { CATEGORIAS, obterCategoria } from '../config/categories.js';
import { listarOcorrencias } from '../services/problemService.js';
import { obterResumo } from '../services/statsService.js';
import { criarMapa, criarIconePin, criarIconeLocalizacao } from '../components/mapMarker.js';
import { badgeStatus, fotoOcorrencia } from '../components/badges.js';
import { dataRelativa } from '../utils/formatDate.js';

const usuario = iniciarPagina({ paginaAtiva: 'inicio' });

const PASSOS = [
  { icone: 'user-round', titulo: '1. Cadastre-se', texto: 'Crie sua conta ou faça login para começar.' },
  { icone: 'map-pin', titulo: '2. Marque no mapa', texto: 'Selecione o local e o tipo do problema.' },
  { icone: 'file-text', titulo: '3. Descreva o problema', texto: 'Adicione detalhes e fotos para ajudar na identificação.' },
  { icone: 'bell', titulo: '4. Acompanhe', texto: 'Veja o status e as atualizações da sua ocorrência.' },
];

// Categorias que aparecem na prévia do mapa (como na referência visual)
const CATEGORIAS_PREVIA = ['buraco', 'alagamento', 'lixo', 'iluminacao', 'calcada'];
// id da ocorrência de demonstração e lado da etiqueta, para não se sobreporem
const DESLOCAMENTOS = { left: [-44, 0], right: [6, 0], bottom: [-19, 4], top: [-19, -30] };
const PREVIA = {
  buraco: { id: 2801, lado: 'right' },
  alagamento: { id: 2802, lado: 'left' },
  lixo: { id: 2803, lado: 'left' },
  iluminacao: { id: 2804, lado: 'right' },
  calcada: { id: 2835, lado: 'top' },
};

function preencherTextosFixos() {
  $('#botao-ver-mapa').innerHTML = `${icone('map-pin', { tamanho: 20 })} Ver mapa da cidade`;
  $('#botao-como-funciona').innerHTML = `${icone('play', { tamanho: 18 })} Como funciona`;
  $('#botao-previa-reportar').innerHTML = `${icone('circle-plus', { tamanho: 20 })} Reportar problema`;
  $('#botao-ver-todos').innerHTML = `Ver todos no mapa ${icone('arrow-right', { tamanho: 16 })}`;
  $('#previa-busca').innerHTML = `${icone('search', { tamanho: 18 })}<span>Buscar endereço ou lugar...</span>`;

  $('#passos').innerHTML = PASSOS.map(
    (passo) => `
      <div class="passo">
        <div class="passo-icone">${icone(passo.icone, { tamanho: 28, espessura: 1.8 })}</div>
        <div>
          <h3>${passo.titulo}</h3>
          <p>${passo.texto}</p>
        </div>
      </div>`
  ).join('');

  $('#grade-categorias').innerHTML = CATEGORIAS.map(
    (categoria) => `
      <a class="categoria-item" href="mapa.html?categoria=${categoria.id}" style="--cor:${categoria.cor}">
        <span class="bolinha-categoria">${icone(categoria.icone, { tamanho: 18 })}</span>
        <span>${categoria.nome}</span>
      </a>`
  ).join('');

  const textoCta = usuario
    ? { botao: 'Reportar problema', link: 'reportar.html' }
    : { botao: 'Cadastrar agora', link: 'cadastro.html' };
  $('#faixa-cta').innerHTML = `
    <div class="faixa-cta-texto">
      <span class="faixa-cta-icone">${icone('users', { tamanho: 26 })}</span>
      <p>Transparência, participação e atitude. <strong>Juntos por uma cidade melhor.</strong></p>
    </div>
    <a href="${textoCta.link}" class="btn btn-primario btn-lg">${textoCta.botao}</a>`;
}

async function carregarIndicadores() {
  const resumo = await obterResumo();
  const itens = [
    { valor: resumo.total, texto: 'Problemas reportados', icone: 'clipboard-list', cor: 'var(--azul)' },
    { valor: resumo.resolvidos, texto: 'Resolvidos', icone: 'check', cor: 'var(--sucesso)' },
    { valor: resumo.cidadaos, texto: 'Cidadãos ativos', icone: 'users', cor: '#F59E0B' },
  ];
  $('#indicadores-home').innerHTML = itens
    .map(
      (item) => `
      <div class="hero-indicador">
        <span class="indicador-icone" style="--cor:${item.cor}">${icone(item.icone, { tamanho: 20 })}</span>
        <span><strong>${formatarNumero(item.valor)}</strong><small>${item.texto}</small></span>
      </div>`
    )
    .join('');
}

/** Mapa de prévia: sem arrastar, com 5 pins e etiquetas flutuantes. */
function montarPrevia(ocorrencias) {
  const mapa = criarMapa('mapa-previa', { centro: [-23.4975, -47.4570], zoom: 15, interativo: false });

  // Ocorrências escolhidas à mão para ficarem bem espalhadas na prévia.
  // Se alguma tiver sido excluída, usa a mais votada da mesma categoria.
  const destaques = CATEGORIAS_PREVIA.map((categoriaId) => {
    const escolhida = ocorrencias.find((item) => item.id === PREVIA[categoriaId].id);
    return (
      escolhida ||
      ocorrencias
        .filter((item) => item.categoria === categoriaId && item.status !== 'resolvido')
        .sort((a, b) => b.totalVotos - a.totalVotos)[0]
    );
  }).filter(Boolean);

  destaques.forEach((ocorrencia) => {
    const direcao = (PREVIA[ocorrencia.categoria] || {}).lado || 'right';
    const marcador = L.marker([ocorrencia.latitude, ocorrencia.longitude], {
      icon: criarIconePin({ ...ocorrencia, totalVotos: 0 }), // sem selo "em alta" na prévia
      title: ocorrencia.titulo,
    }).addTo(mapa);
    marcador.bindTooltip(
      `<strong>${escaparHtml(obterCategoria(ocorrencia.categoria).nome)}</strong><span>${escaparHtml(ocorrencia.endereco)}</span>`,
      { permanent: true, direction: direcao, className: 'etiqueta-pin', offset: DESLOCAMENTOS[direcao] }
    );
    marcador.on('click', () => (window.location.href = `mapa.html?id=${ocorrencia.id}`));
  });

  // Ponto azul "você está aqui" (decorativo), um pouco abaixo e à direita do centro
  const tamanho = mapa.getSize();
  const pontoUsuario = mapa.containerPointToLatLng([tamanho.x * 0.6, tamanho.y * 0.7]);
  L.marker(pontoUsuario, { icon: criarIconeLocalizacao(), interactive: false }).addTo(mapa);
}

function montarEmAlta(ocorrencias) {
  const maisVotadas = ocorrencias
    .filter((item) => item.status !== 'resolvido')
    .sort((a, b) => b.totalVotos - a.totalVotos)
    .slice(0, 4);

  $('#em-alta').innerHTML = maisVotadas
    .map((ocorrencia) => {
      const categoria = obterCategoria(ocorrencia.categoria);
      return `
      <a class="card-alta" href="ocorrencia.html?id=${ocorrencia.id}">
        <div class="card-alta-foto">${fotoOcorrencia(ocorrencia, 44)}
          <span class="badge badge-categoria" style="--cor:${categoria.cor}">${icone(categoria.icone, { tamanho: 14 })}${categoria.curto}</span>
        </div>
        <div class="card-alta-corpo">
          <h3>${escaparHtml(ocorrencia.titulo)}</h3>
          <p>${icone('map-pin', { tamanho: 14 })}${escaparHtml(ocorrencia.endereco)}</p>
          <div class="card-alta-rodape">
            ${badgeStatus(ocorrencia.status)}
            <span class="contador-votos">${icone('thumbs-up', { tamanho: 16 })}${ocorrencia.totalVotos}</span>
          </div>
          <small>${dataRelativa(ocorrencia.criadoEm)}</small>
        </div>
      </a>`;
    })
    .join('');
}

async function iniciar() {
  preencherTextosFixos();
  carregarIndicadores();
  const ocorrencias = await listarOcorrencias();
  montarPrevia(ocorrencias);
  montarEmAlta(ocorrencias);
}

iniciar();
