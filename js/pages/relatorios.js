/**
 * RELATÓRIOS (relatorios.html)
 * Gráficos com a biblioteca Chart.js (carregada via CDN, disponível como window.Chart).
 */
import { iniciarPagina } from '../app.js';
import { icone } from '../utils/icons.js';
import { $, escaparHtml, formatarNumero } from '../utils/dom.js';
import { obterResumo, obterRelatorios } from '../services/statsService.js';
import { bolinhaCategoria, badgeStatus } from '../components/badges.js';

iniciarPagina({ paginaAtiva: 'relatorios' });

function desenharIndicadores(resumo, tempoMedio) {
  const itens = [
    { valor: formatarNumero(resumo.total), texto: 'Reportados', icone: 'clipboard-list', cor: 'var(--azul)' },
    { valor: formatarNumero(resumo.resolvidos), texto: 'Resolvidos', icone: 'circle-check', cor: 'var(--sucesso)' },
    { valor: formatarNumero(resumo.emAnalise), texto: 'Em análise', icone: 'clock', cor: '#F59E0B' },
    { valor: formatarNumero(resumo.emAndamento), texto: 'Em andamento', icone: 'hammer', cor: '#2563EB' },
    { valor: formatarNumero(resumo.cidadaos), texto: 'Cidadãos participantes', icone: 'users', cor: '#7C3AED' },
    { valor: `${resumo.taxaResolucao}%`, texto: `Taxa de resolução · média ${tempoMedio} dias`, icone: 'trending-up', cor: '#0EA5E9' },
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

function configurarChartJs() {
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
  Chart.defaults.color = '#5B6781';
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.tooltip.backgroundColor = '#0F1B3D';
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
}

function graficoCategorias(dados) {
  new Chart($('#grafico-categorias'), {
    type: 'bar',
    data: {
      labels: dados.map((c) => c.curto),
      datasets: [{ label: 'Ocorrências', data: dados.map((c) => c.total), backgroundColor: dados.map((c) => c.cor), borderRadius: 6, maxBarThickness: 42 }],
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#EEF2F8' } },
        x: { grid: { display: false } },
      },
    },
  });
}

function graficoStatus(dados) {
  new Chart($('#grafico-status'), {
    type: 'doughnut',
    data: {
      labels: dados.map((s) => s.nome),
      datasets: [{ data: dados.map((s) => s.total), backgroundColor: ['#94A3B8', '#F59E0B', '#2563EB', '#16A34A'], borderWidth: 3, borderColor: '#fff' }],
    },
    options: {
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: { legend: { position: 'bottom' } },
    },
  });
}

function graficoMeses(dados) {
  new Chart($('#grafico-meses'), {
    type: 'line',
    data: {
      labels: dados.map((m) => m.rotulo),
      datasets: [
        { label: 'Reportados', data: dados.map((m) => m.reportados), borderColor: '#1A5CE5', backgroundColor: 'rgba(26,92,229,0.1)', fill: true, tension: 0.35, pointRadius: 4 },
        { label: 'Resolvidos', data: dados.map((m) => m.resolvidos), borderColor: '#16A34A', backgroundColor: 'rgba(22,163,74,0.08)', fill: true, tension: 0.35, pointRadius: 4 },
      ],
    },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', align: 'end' } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#EEF2F8' } },
        x: { grid: { display: false } },
      },
    },
  });
}

function desenharRanking(maisVotadas) {
  $('#ranking').innerHTML = maisVotadas
    .map(
      (ocorrencia, indice) => `
      <li>
        <span class="ranking-posicao">${indice + 1}</span>
        ${bolinhaCategoria(ocorrencia.categoria, 34)}
        <a href="ocorrencia.html?id=${ocorrencia.id}" class="ranking-info">
          <strong>${escaparHtml(ocorrencia.titulo)}</strong>
          <small>${escaparHtml(ocorrencia.bairro || ocorrencia.endereco)}</small>
          ${badgeStatus(ocorrencia.status)}
        </a>
        <span class="contador-votos">${icone('thumbs-up', { tamanho: 15 })}${ocorrencia.totalVotos}</span>
      </li>`
    )
    .join('');
}

async function iniciar() {
  const [resumo, relatorios] = await Promise.all([obterResumo(), obterRelatorios()]);
  desenharIndicadores(resumo, relatorios.tempoMedio);
  desenharRanking(relatorios.maisVotadas);

  if (!window.Chart) {
    $('.grade-graficos').insertAdjacentHTML('afterbegin', '<p class="aviso-grafico">Não foi possível carregar os gráficos (verifique a conexão com a internet).</p>');
    return;
  }
  configurarChartJs();
  graficoCategorias(relatorios.porCategoria);
  graficoStatus(relatorios.porStatus);
  graficoMeses(relatorios.porMes);
}

iniciar();
