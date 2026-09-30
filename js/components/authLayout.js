/** Partes compartilhadas entre as páginas de Login e Cadastro. */
import { icone } from '../utils/icons.js';
import { $$ } from '../utils/dom.js';

export function renderizarLateralAuth() {
  const lateral = document.getElementById('auth-lateral');
  lateral.innerHTML = `
    <div class="auth-lateral-conteudo">
      <span class="sobretitulo">Cidade Melhor · Sorocaba</span>
      <h2>Juntos por uma <span>cidade melhor.</span></h2>
      <p>Registre problemas urbanos, confirme relatos de vizinhos e acompanhe cada solução pelo mapa.</p>
      <ul class="auth-beneficios">
        <li>${icone('map-pin', { tamanho: 18 })} Marque o problema no local exato</li>
        <li>${icone('thumbs-up', { tamanho: 18 })} Dê força aos relatos da comunidade</li>
        <li>${icone('bell', { tamanho: 18 })} Receba avisos quando o status mudar</li>
      </ul>
      <div class="auth-ilustracao" aria-hidden="true">
        <div class="auth-pin" style="--cor:#F59E0B;left:12%;top:30%">${icone('construction', { tamanho: 18 })}</div>
        <div class="auth-pin" style="--cor:#22C55E;left:46%;top:12%">${icone('lightbulb', { tamanho: 18 })}</div>
        <div class="auth-pin" style="--cor:#8B5CF6;left:72%;top:42%">${icone('trash-2', { tamanho: 18 })}</div>
        <div class="auth-pin" style="--cor:#EF4444;left:30%;top:62%">${icone('waves', { tamanho: 18 })}</div>
      </div>
      <div class="auth-selo">${icone('leaf', { tamanho: 18 })} Pequenas atitudes, grandes mudanças.</div>
    </div>`;
}

/** Coloca o ícone indicado em data-icone dentro dos campos. */
export function configurarIconesCampos() {
  $$('.campo-com-icone[data-icone]').forEach((grupo) => {
    grupo.insertAdjacentHTML('afterbegin', icone(grupo.dataset.icone, { tamanho: 18 }));
  });
}

/** Botão de olho para mostrar/ocultar a senha. */
export function configurarMostrarSenha() {
  $$('[data-mostrar-senha]').forEach((botao) => {
    const campo = document.getElementById(botao.dataset.mostrarSenha);
    const atualizar = () => {
      const visivel = campo.type === 'text';
      botao.innerHTML = icone(visivel ? 'eye-off' : 'eye', { tamanho: 18 });
      botao.setAttribute('aria-label', visivel ? 'Ocultar senha' : 'Mostrar senha');
    };
    botao.addEventListener('click', () => {
      campo.type = campo.type === 'password' ? 'text' : 'password';
      atualizar();
      campo.focus();
    });
    atualizar();
  });
}

/** Coloca o botão em modo "carregando" e devolve uma função para restaurar. */
export function botaoCarregando(botao, texto) {
  const original = botao.innerHTML;
  botao.disabled = true;
  botao.classList.add('carregando');
  botao.innerHTML = `<span class="spinner"></span> ${texto}`;
  return () => {
    botao.disabled = false;
    botao.classList.remove('carregando');
    botao.innerHTML = original;
  };
}
