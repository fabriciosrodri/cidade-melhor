/** MEUS PINS (meus-pins.html) — ocorrências criadas pelo usuário logado. */
import { iniciarPagina } from '../app.js';
import { icone } from '../utils/icons.js';
import { $, $$, formatarNumero } from '../utils/dom.js';
import { STATUS } from '../config/status.js';
import { listarOcorrencias } from '../services/problemService.js';
import { cardOcorrencia } from '../components/problemCard.js';
import { estadoVazio, skeletonCards } from '../components/badges.js';
import { excluirComConfirmacao } from '../components/problemDetails.js';

const usuario = iniciarPagina({ exigeLogin: true });

const estado = { ocorrencias: [], status: 'todos', ordenacao: 'recentes' };

function desenharResumo() {
  const lista = estado.ocorrencias;
  const contar = (id) => lista.filter((o) => o.status === id).length;
  const totalVotos = lista.reduce((soma, o) => soma + o.totalVotos, 0);
  const itens = [
    { valor: lista.length, texto: 'Pins criados', icone: 'map-pin', cor: 'var(--azul)' },
    { valor: contar('reportado'), texto: 'Reportados', icone: 'flag', cor: '#64748B' },
    { valor: contar('em_analise'), texto: 'Em análise', icone: 'clock', cor: '#F59E0B' },
    { valor: contar('em_andamento'), texto: 'Em andamento', icone: 'hammer', cor: '#2563EB' },
    { valor: contar('resolvido'), texto: 'Resolvidos', icone: 'circle-check', cor: 'var(--sucesso)' },
    { valor: totalVotos, texto: 'Upvotes recebidos', icone: 'thumbs-up', cor: '#7C3AED' },
  ];
  $('#resumo').innerHTML = itens
    .map(
      (item) => `
      <div class="indicador">
        <span class="indicador-icone" style="--cor:${item.cor}">${icone(item.icone, { tamanho: 20 })}</span>
        <span><strong>${formatarNumero(item.valor)}</strong><span>${item.texto}</span></span>
      </div>`
    )
    .join('');
}

function desenharAbas() {
  const abas = [{ id: 'todos', nome: 'Todos' }, ...STATUS];
  $('#abas').innerHTML = abas
    .map((aba) => {
      const total = aba.id === 'todos' ? estado.ocorrencias.length : estado.ocorrencias.filter((o) => o.status === aba.id).length;
      const ativa = aba.id === estado.status;
      return `<button type="button" class="aba ${ativa ? 'ativa' : ''}" role="tab" aria-selected="${ativa}" data-status="${aba.id}">${aba.nome} <span class="aba-contador">${total}</span></button>`;
    })
    .join('');
  $$('#abas .aba').forEach((botao) =>
    botao.addEventListener('click', () => {
      estado.status = botao.dataset.status;
      desenharAbas();
      desenharLista();
    })
  );
}

function desenharLista() {
  const lista = $('#lista');

  if (estado.ocorrencias.length === 0) {
    lista.innerHTML = estadoVazio({
      iconeNome: 'map-pin-plus',
      titulo: 'Você ainda não reportou nenhum problema',
      texto: 'Viu um buraco, poste apagado ou lixo acumulado? Marque no mapa e ajude a cidade a resolver.',
      acao: `<a href="reportar.html" class="btn btn-primario">${icone('plus', { tamanho: 18 })} Reportar meu primeiro problema</a>`,
    });
    return;
  }

  let filtradas = estado.ocorrencias.filter((o) => estado.status === 'todos' || o.status === estado.status);
  filtradas = [...filtradas].sort((a, b) =>
    estado.ordenacao === 'votados' ? b.totalVotos - a.totalVotos : new Date(b.criadoEm) - new Date(a.criadoEm)
  );

  if (filtradas.length === 0) {
    lista.innerHTML = estadoVazio({
      iconeNome: 'filter',
      titulo: 'Nenhum pin com este status',
      texto: 'Escolha outra aba para ver os seus outros pins.',
    });
    return;
  }

  lista.innerHTML = filtradas.map((o) => cardOcorrencia(o, { acoesDoAutor: true })).join('');

  $$('[data-excluir]', lista).forEach((botao) =>
    botao.addEventListener('click', async () => {
      const ocorrencia = estado.ocorrencias.find((o) => o.id === Number(botao.dataset.excluir));
      if (await excluirComConfirmacao(ocorrencia)) {
        estado.ocorrencias = estado.ocorrencias.filter((o) => o.id !== ocorrencia.id);
        desenharTudo();
      }
    })
  );
}

function desenharTudo() {
  desenharResumo();
  desenharAbas();
  desenharLista();
}

async function iniciar() {
  $('#botao-novo').innerHTML = `${icone('plus', { tamanho: 20 })} Reportar problema`;
  $('#lista').innerHTML = skeletonCards(3);
  $('#ordenacao').addEventListener('change', (e) => {
    estado.ordenacao = e.target.value;
    desenharLista();
  });

  estado.ocorrencias = await listarOcorrencias({ autorId: usuario.id });
  desenharTudo();
}

if (usuario) iniciar();
