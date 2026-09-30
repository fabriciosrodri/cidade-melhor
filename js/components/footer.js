/** FOOTER — inserido por JavaScript em todas as páginas. */
import { logoHtml } from './logo.js';

export function renderizarFooter() {
  const container = document.getElementById('footer');
  if (!container) return;
  const ano = new Date().getFullYear();

  container.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grade">
          <div>
            ${logoHtml()}
            <p>Plataforma colaborativa para mapear problemas urbanos de Sorocaba-SP e aproximar cidadãos e poder público de uma cidade mais sustentável.</p>
          </div>
          <div>
            <h4>Plataforma</h4>
            <ul>
              <li><a href="mapa.html">Mapa de ocorrências</a></li>
              <li><a href="reportar.html">Reportar problema</a></li>
              <li><a href="resolvidos.html">Problemas resolvidos</a></li>
              <li><a href="relatorios.html">Relatórios</a></li>
            </ul>
          </div>
          <div>
            <h4>Projeto</h4>
            <ul>
              <li><a href="index.html#como-funciona">Como funciona</a></li>
              <li><a href="sustentabilidade.html">ODS e sustentabilidade</a></li>
              <li><a href="sobre.html">Sobre nós</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-base">
          <span>© ${ano} Cidade Melhor · Projeto UPX 2 – Desenvolvimento Sustentável</span>
          <span>Mapas © colaboradores do OpenStreetMap</span>
        </div>
      </div>
    </footer>`;
}
