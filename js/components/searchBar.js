/**
 * BARRA DE BUSCA do mapa.
 * Mostra primeiro as ocorrências que combinam com o texto e depois
 * endereços reais de Sorocaba (Nominatim).
 */
import { icone } from '../utils/icons.js';
import { escaparHtml, debounce } from '../utils/dom.js';
import { buscarEndereco } from '../services/geoService.js';
import { bolinhaCategoria } from './badges.js';

/**
 * @param {HTMLElement} container - onde a barra será desenhada
 * @param {object} opcoes
 * @param {() => Array} opcoes.obterOcorrencias - devolve as ocorrências carregadas
 * @param {(item) => void} opcoes.aoSelecionar  - recebe { tipo: 'ocorrencia'|'endereco', ... }
 */
export function criarBarraBusca(container, { obterOcorrencias, aoSelecionar }) {
  container.innerHTML = `
    <div class="busca">
      <label for="campo-busca" class="sr-only">Buscar endereço ou ocorrência</label>
      ${icone('search', { tamanho: 18 })}
      <input id="campo-busca" type="search" class="busca-input" placeholder="Buscar endereço ou problema..." autocomplete="off">
      <div class="busca-resultados" hidden role="listbox"></div>
    </div>`;

  const campo = container.querySelector('.busca-input');
  const resultados = container.querySelector('.busca-resultados');
  let itensAtuais = [];

  function desenhar(itens, carregandoEnderecos = false, erro = '') {
    itensAtuais = itens;
    const linhas = itens
      .map(
        (item, indice) => `
        <button type="button" class="busca-item" data-indice="${indice}" role="option">
          ${item.tipo === 'ocorrencia' ? bolinhaCategoria(item.categoria, 28) : `<span class="busca-item-icone">${icone('map-pin', { tamanho: 16 })}</span>`}
          <span>
            <strong>${escaparHtml(item.titulo)}</strong>
            <small>${escaparHtml(item.subtitulo)}</small>
          </span>
        </button>`
      )
      .join('');

    const rodape = carregandoEnderecos
      ? `<div class="busca-status"><span class="spinner"></span> Buscando endereços...</div>`
      : erro
        ? `<div class="busca-status">${escaparHtml(erro)}</div>`
        : itens.length === 0
          ? `<div class="busca-status">Nenhum resultado em Sorocaba.</div>`
          : '';

    resultados.innerHTML = linhas + rodape;
    resultados.hidden = false;
  }

  function ocorrenciasQueCombinam(termo) {
    const texto = termo.toLowerCase();
    return obterOcorrencias()
      .filter((item) => `${item.titulo} ${item.endereco} ${item.bairro}`.toLowerCase().includes(texto))
      .slice(0, 3)
      .map((item) => ({
        tipo: 'ocorrencia',
        id: item.id,
        categoria: item.categoria,
        titulo: item.titulo,
        subtitulo: `#${item.id} · ${item.endereco}`,
        latitude: item.latitude,
        longitude: item.longitude,
      }));
  }

  const buscar = debounce(async (termo) => {
    const locais = ocorrenciasQueCombinam(termo);
    desenhar(locais, true);
    try {
      const enderecos = await buscarEndereco(termo);
      if (campo.value.trim() !== termo) return; // o usuário já digitou outra coisa
      desenhar([
        ...locais,
        ...enderecos.map((endereco) => ({
          tipo: 'endereco',
          titulo: endereco.endereco || endereco.descricao.split(',')[0],
          subtitulo: endereco.bairro || endereco.descricao.split(',').slice(1, 3).join(','),
          latitude: endereco.latitude,
          longitude: endereco.longitude,
        })),
      ]);
    } catch {
      desenhar(locais, false, 'Busca de endereços indisponível no momento.');
    }
  }, 600);

  campo.addEventListener('input', () => {
    const termo = campo.value.trim();
    if (termo.length < 3) {
      resultados.hidden = true;
      return;
    }
    buscar(termo);
  });

  campo.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') resultados.hidden = true;
    if (evento.key === 'Enter' && itensAtuais[0]) {
      evento.preventDefault();
      selecionar(0);
    }
  });

  function selecionar(indice) {
    const item = itensAtuais[indice];
    if (!item) return;
    resultados.hidden = true;
    campo.value = item.titulo;
    aoSelecionar(item);
  }

  resultados.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.busca-item');
    if (botao) selecionar(Number(botao.dataset.indice));
  });

  document.addEventListener('click', (evento) => {
    if (!container.contains(evento.target)) resultados.hidden = true;
  });
}
