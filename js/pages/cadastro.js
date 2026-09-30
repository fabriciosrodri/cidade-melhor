/** PÁGINA DE CADASTRO (cadastro.html) */
import { iniciarPagina } from '../app.js';
import { $, parametroUrl, enderecoInternoSeguro } from '../utils/dom.js';
import { icone } from '../utils/icons.js';
import {
  validarObrigatorio,
  validarEmail,
  validarSenha,
  mostrarErroCampo,
  limparErros,
  focarPrimeiroErro,
} from '../utils/validators.js';
import { cadastrar, emailJaCadastrado } from '../services/authService.js';
import { abrirModal } from '../components/modal.js';
import { agendarToast } from '../components/toast.js';
import { renderizarLateralAuth, configurarIconesCampos, configurarMostrarSenha, botaoCarregando } from '../components/authLayout.js';

const usuarioLogado = iniciarPagina();
const destino = enderecoInternoSeguro(parametroUrl('voltar'), 'mapa.html');
if (usuarioLogado) window.location.replace(destino);

renderizarLateralAuth();
configurarIconesCampos();
configurarMostrarSenha();

if (parametroUrl('voltar')) {
  $('#link-login').href = `login.html?voltar=${encodeURIComponent(destino)}`;
}

$('#ver-termos').addEventListener('click', (evento) => {
  evento.preventDefault(); // não marcar o checkbox ao clicar no link
  abrirModal({
    titulo: 'Termos de uso',
    largo: true,
    conteudo: `
      <p><strong>1.</strong> O Cidade Melhor é um protótipo acadêmico (Projeto UPX 2) para registrar problemas urbanos de Sorocaba-SP.</p>
      <p><strong>2.</strong> Publique apenas relatos verdadeiros, sem ofensas, dados pessoais de terceiros ou fotos que identifiquem pessoas.</p>
      <p><strong>3.</strong> Você é responsável pelo conteúdo que publica e pode editá-lo ou excluí-lo a qualquer momento.</p>
      <p><strong>4.</strong> Neste protótipo, os dados ficam salvos apenas no seu navegador e não são enviados para nenhum servidor.</p>`,
    rodape: '<button type="button" class="btn btn-primario" data-fechar data-principal>Fechar</button>',
  });
});

const formulario = $('#form-cadastro');

/** Valida todos os campos e devolve true se estiver tudo certo. */
async function validarFormulario() {
  const nome = $('#nome');
  const email = $('#email');
  const senha = $('#senha');
  const confirmacao = $('#confirmar-senha');
  const termos = $('#termos');

  let erroEmail = validarEmail(email.value);
  if (!erroEmail && (await emailJaCadastrado(email.value))) {
    erroEmail = 'Este e-mail já está cadastrado. Que tal entrar?';
  }

  let erroNome = validarObrigatorio(nome.value, 'O nome');
  if (!erroNome && nome.value.trim().length < 3) erroNome = 'Digite pelo menos 3 letras.';

  const erroConfirmacao = !confirmacao.value
    ? 'Confirme a sua senha.'
    : confirmacao.value !== senha.value
      ? 'As senhas não são iguais.'
      : '';

  const resultados = [
    mostrarErroCampo(nome, erroNome),
    mostrarErroCampo(email, erroEmail),
    mostrarErroCampo(senha, validarSenha(senha.value)),
    mostrarErroCampo(confirmacao, erroConfirmacao),
    mostrarErroCampo(termos, termos.checked ? '' : 'Você precisa aceitar os termos de uso.'),
  ];
  return resultados.every(Boolean);
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  limparErros(formulario);
  $('#erro-cadastro').hidden = true;

  if (!(await validarFormulario())) {
    focarPrimeiroErro(formulario);
    return;
  }

  const restaurar = botaoCarregando($('#botao-cadastrar'), 'Criando conta...');
  try {
    const usuario = await cadastrar({ nome: $('#nome').value, email: $('#email').value, senha: $('#senha').value });
    agendarToast(`Conta criada! Bem-vindo(a), ${usuario.nome.split(' ')[0]}.`);
    window.location.href = destino;
  } catch (erro) {
    restaurar();
    const alerta = $('#erro-cadastro');
    alerta.innerHTML = `${icone('circle-alert', { tamanho: 18 })} ${erro.message}`;
    alerta.hidden = false;
  }
});

// Validação "ao sair do campo" para dar retorno mais rápido
$('#confirmar-senha').addEventListener('blur', (evento) => {
  const campo = evento.target;
  if (campo.value) mostrarErroCampo(campo, campo.value !== $('#senha').value ? 'As senhas não são iguais.' : '');
});
