/** SOBRE NÓS (sobre.html) */
import { iniciarPagina } from '../app.js';
import { icone } from '../utils/icons.js';
import { $, escaparHtml, iniciais } from '../utils/dom.js';
import { EQUIPE, INFO_ACADEMICA } from '../data/team.js';
import { restaurarDemonstracao } from '../services/storage.js';
import { confirmar } from '../components/modal.js';
import { agendarToast } from '../components/toast.js';

iniciarPagina({ paginaAtiva: 'sobre' });

const BLOCOS = [
  {
    icone: 'map-pinned',
    titulo: 'O que é o Cidade Melhor',
    texto: 'Uma plataforma colaborativa em que qualquer cidadão marca no mapa problemas urbanos — buracos, esgoto, lixo, iluminação, vandalismo — e outras pessoas confirmam o relato com um upvote.',
  },
  {
    icone: 'lightbulb',
    titulo: 'Por que foi criado',
    texto: 'Muitos problemas da cidade são vistos todos os dias, mas não chegam a quem pode resolvê-los. Faltava um jeito simples, visual e transparente de reunir essas informações num só lugar.',
  },
  {
    icone: 'leaf',
    titulo: 'Relação com a sustentabilidade',
    texto: 'O projeto contribui com os ODS da ONU, principalmente o ODS 11 (Cidades e comunidades sustentáveis), além dos ODS 6, 9, 12, 13 e 15.',
  },
];

const IMPORTANCIA = [
  { icone: 'eye', titulo: 'Visibilidade', texto: 'Problemas que antes ficavam "invisíveis" passam a ter endereço, foto e data.' },
  { icone: 'thumbs-up', titulo: 'Prioridade', texto: 'Os upvotes mostram quais problemas afetam mais pessoas e merecem atenção primeiro.' },
  { icone: 'chart-column', titulo: 'Dados para decidir', texto: 'Relatórios por categoria, status e período ajudam a planejar a manutenção da cidade.' },
  { icone: 'handshake', titulo: 'Transparência', texto: 'Todos acompanham o andamento, do reporte à solução, na linha do tempo de cada ocorrência.' },
];

function montarPagina() {
  $('#sobre-blocos').innerHTML = BLOCOS.map(
    (bloco) => `
      <article class="sobre-bloco">
        <span class="sobre-icone">${icone(bloco.icone, { tamanho: 24 })}</span>
        <h2>${bloco.titulo}</h2>
        <p>${bloco.texto}</p>
      </article>`
  ).join('');

  $('#objetivo').innerHTML = `
    <span class="objetivo-icone">${icone('target', { tamanho: 32 })}</span>
    <div>
      <span class="sobretitulo">Objetivo geral</span>
      <blockquote>“Desenvolver um protótipo de site para registrar reclamações e problemas vivenciados no cotidiano da cidade, com a finalidade de auxiliar na resolução de problemas urbanos.”</blockquote>
    </div>`;

  $('#importancia').innerHTML = IMPORTANCIA.map(
    (item) => `
      <div class="importancia-item">
        <span class="importancia-icone">${icone(item.icone, { tamanho: 22 })}</span>
        <h3>${item.titulo}</h3>
        <p>${item.texto}</p>
      </div>`
  ).join('');

  $('#info-academica').innerHTML = `${escaparHtml(INFO_ACADEMICA.projeto)} · ${escaparHtml(INFO_ACADEMICA.curso)} · ${escaparHtml(INFO_ACADEMICA.instituicao)} · ${INFO_ACADEMICA.ano}`;

  $('#equipe').innerHTML = EQUIPE.map(
    (pessoa) => `
      <article class="membro">
        <span class="avatar avatar-grande">${iniciais(pessoa.nome)}</span>
        <h3>${escaparHtml(pessoa.nome)}</h3>
        <p>${escaparHtml(pessoa.funcao)}</p>
        <small>${escaparHtml(pessoa.ra)}</small>
      </article>`
  ).join('');

  $('#demo-card').innerHTML = `
    <div class="demo-texto">
      <span class="demo-icone">${icone('database', { tamanho: 22 })}</span>
      <div>
        <h3>Dados de demonstração</h3>
        <p>Este protótipo guarda tudo no seu navegador (localStorage). Use o botão ao lado para apagar as alterações e voltar aos dados iniciais — útil antes de uma apresentação.</p>
      </div>
    </div>
    <button type="button" class="btn btn-secundario" id="restaurar">${icone('rotate-ccw', { tamanho: 16 })} Restaurar dados de demonstração</button>`;

  $('#restaurar').addEventListener('click', async () => {
    const ok = await confirmar({
      titulo: 'Restaurar dados de demonstração?',
      mensagem: 'Todas as ocorrências, votos, comentários e contas criadas neste navegador serão apagados, e você sairá da sua conta.',
      textoConfirmar: 'Restaurar',
      perigo: true,
    });
    if (!ok) return;
    restaurarDemonstracao();
    agendarToast('Dados de demonstração restaurados.');
    window.location.reload();
  });
}

montarPagina();
