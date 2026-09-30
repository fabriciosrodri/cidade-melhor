/**
 * Validações de formulário.
 * Cada função devolve uma MENSAGEM DE ERRO (texto) ou uma string vazia se estiver tudo certo.
 */

export function validarObrigatorio(valor, nomeCampo = 'Este campo') {
  return String(valor ?? '').trim() ? '' : `${nomeCampo} é obrigatório.`;
}

export function validarEmail(email) {
  if (!email.trim()) return 'Informe seu e-mail.';
  const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  return formatoValido ? '' : 'Digite um e-mail válido (ex.: nome@email.com).';
}

export function validarSenha(senha) {
  if (!senha) return 'Informe uma senha.';
  return senha.length >= 6 ? '' : 'A senha precisa ter pelo menos 6 caracteres.';
}

export function validarTamanho(valor, minimo, maximo, nomeCampo, feminino = false) {
  const tamanho = String(valor ?? '').trim().length;
  if (tamanho === 0) return `${nomeCampo} é ${feminino ? 'obrigatória' : 'obrigatório'}.`;
  if (tamanho < minimo) return `${nomeCampo} precisa ter pelo menos ${minimo} caracteres.`;
  if (tamanho > maximo) return `${nomeCampo} pode ter no máximo ${maximo} caracteres.`;
  return '';
}

/* ---------- Exibição dos erros na tela ---------- */

/**
 * Mostra (ou limpa) a mensagem de erro logo abaixo do campo.
 * O HTML esperado é: <div class="campo"> ... <input> ... <p class="campo-erro"></p> </div>
 */
export function mostrarErroCampo(campo, mensagem) {
  const grupo = campo.closest('.campo');
  const areaErro = grupo && grupo.querySelector('.campo-erro');
  campo.classList.toggle('invalido', Boolean(mensagem));
  campo.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
  if (areaErro) areaErro.textContent = mensagem || '';
  return !mensagem; // true = válido
}

export function limparErros(formulario) {
  formulario.querySelectorAll('.invalido').forEach((campo) => mostrarErroCampo(campo, ''));
}

/** Coloca o foco no primeiro campo com erro, para o usuário ver o que corrigir. */
export function focarPrimeiroErro(formulario) {
  const primeiro = formulario.querySelector('.invalido');
  if (primeiro) primeiro.focus();
}
