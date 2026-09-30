/** PÁGINA DE LOGIN (login.html) */
import { iniciarPagina } from '../app.js';
import { $, parametroUrl, enderecoInternoSeguro } from '../utils/dom.js';
import { icone } from '../utils/icons.js';
import { validarEmail, mostrarErroCampo, limparErros, focarPrimeiroErro } from '../utils/validators.js';
import { entrar } from '../services/authService.js';
import { abrirModal } from '../components/modal.js';
import { agendarToast } from '../components/toast.js';
import { renderizarLateralAuth, configurarIconesCampos, configurarMostrarSenha, botaoCarregando } from '../components/authLayout.js';

const usuarioLogado = iniciarPagina();

// Para onde ir depois de entrar (ex.: login.html?voltar=reportar.html)
const destino = enderecoInternoSeguro(parametroUrl('voltar'), 'mapa.html');

// Quem já está logado não precisa ver o login
if (usuarioLogado) window.location.replace(destino);

renderizarLateralAuth();
configurarIconesCampos();
configurarMostrarSenha();

// Mantém o "voltar" também no link de cadastro
if (parametroUrl('voltar')) {
  $('#link-cadastro').href = `cadastro.html?voltar=${encodeURIComponent(destino)}`;
}

/* ---------- Contas de demonstração ---------- */
$('#contas-demo').innerHTML = `
  <div class="contas-demo-titulo">${icone('info', { tamanho: 16 })} Contas de demonstração <small>(senha: 123456)</small></div>
  <button type="button" class="conta-demo" data-email="cidadao@cidademelhor.com">
    <span class="avatar">JS</span>
    <span><strong>Cidadão</strong><small>cidadao@cidademelhor.com</small></span>
    <span class="conta-demo-usar">Usar</span>
  </button>
  <button type="button" class="conta-demo" data-email="gestor@cidademelhor.com">
    <span class="avatar avatar-gestor">GM</span>
    <span><strong>Gestor (Prefeitura)</strong><small>gestor@cidademelhor.com</small></span>
    <span class="conta-demo-usar">Usar</span>
  </button>`;

document.querySelectorAll('.conta-demo').forEach((botao) => {
  botao.addEventListener('click', () => {
    $('#email').value = botao.dataset.email;
    $('#senha').value = '123456';
    limparErros($('#form-login'));
    $('#botao-entrar').focus();
  });
});

/* ---------- Esqueci minha senha (apenas visual) ---------- */
$('#esqueci-senha').addEventListener('click', () => {
  abrirModal({
    titulo: 'Recuperar senha',
    conteudo: `
      <p>A recuperação de senha por e-mail estará disponível na versão do Cidade Melhor com servidor.</p>
      <p>Neste protótipo, você pode usar as <strong>contas de demonstração</strong> (senha <strong>123456</strong>) ou criar uma nova conta.</p>`,
    rodape: '<button type="button" class="btn btn-primario" data-fechar data-principal>Entendi</button>',
  });
});

/* ---------- Envio do formulário ---------- */
const formulario = $('#form-login');
const alerta = $('#erro-login');

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault(); // impede o recarregamento da página
  limparErros(formulario);
  alerta.hidden = true;

  const email = $('#email');
  const senha = $('#senha');
  const emailValido = mostrarErroCampo(email, validarEmail(email.value));
  const senhaValida = mostrarErroCampo(senha, senha.value ? '' : 'Informe sua senha.');
  if (!emailValido || !senhaValida) {
    focarPrimeiroErro(formulario);
    return;
  }

  const restaurar = botaoCarregando($('#botao-entrar'), 'Entrando...');
  try {
    const usuario = await entrar(email.value, senha.value, $('#lembrar').checked);
    agendarToast(`Olá, ${usuario.nome.split(' ')[0]}! Que bom ter você aqui.`);
    window.location.href = destino;
  } catch (erro) {
    restaurar();
    alerta.innerHTML = `${icone('circle-alert', { tamanho: 18 })} ${erro.message}`;
    alerta.hidden = false;
    senha.value = '';
    senha.focus();
  }
});
