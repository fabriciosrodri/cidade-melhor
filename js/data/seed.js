/**
 * DADOS DE DEMONSTRAÇÃO (seed)
 * Carregados no primeiro acesso ao site (ou ao clicar em "Restaurar dados de demonstração").
 *
 * As ocorrências são fictícias, mas usam ruas e bairros de Sorocaba-SP com
 * coordenadas aproximadas. As datas são calculadas a partir de HOJE, para que
 * os filtros "últimos 7 dias", "últimos 30 dias" etc. sempre tenham resultado.
 */

// Hash SHA-256 de "123456" — senha de todas as contas de demonstração.
const HASH_SENHA_DEMO = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';

const UM_DIA = 24 * 60 * 60 * 1000;

/* ---------- Usuários principais ---------- */
const USUARIOS_PRINCIPAIS = [
  { id: 'u1', nome: 'João Silva',          email: 'cidadao@cidademelhor.com', perfil: 'cidadao' },
  { id: 'u2', nome: 'Ana Paula Rodrigues', email: 'ana.rodrigues@email.com',  perfil: 'cidadao' },
  { id: 'u3', nome: 'Carlos Eduardo Lima', email: 'carlos.lima@email.com',    perfil: 'cidadao' },
  { id: 'u4', nome: 'Fernanda Oliveira',   email: 'fernanda.oli@email.com',   perfil: 'cidadao' },
  { id: 'u5', nome: 'Rafael Santos',       email: 'rafael.santos@email.com',  perfil: 'cidadao' },
  { id: 'u6', nome: 'Juliana Costa',       email: 'juliana.costa@email.com',  perfil: 'cidadao' },
  { id: 'u7', nome: 'Marcos Pereira',      email: 'marcos.pereira@email.com', perfil: 'cidadao' },
  { id: 'u8', nome: 'Beatriz Almeida',     email: 'bia.almeida@email.com',    perfil: 'cidadao' },
  { id: 'g1', nome: 'Gestor Municipal',    email: 'gestor@cidademelhor.com',  perfil: 'gestor' },
];

// Moradores que não criaram pins, mas confirmam (votam) problemas.
// Gerados combinando nomes e sobrenomes, para termos votos suficientes.
const NOMES = ['Pedro', 'Luana', 'Gabriel', 'Camila', 'Lucas', 'Larissa', 'Mateus', 'Patrícia', 'Thiago', 'Aline', 'Bruno', 'Renata'];
const SOBRENOMES = ['Martins', 'Barbosa', 'Ribeiro', 'Carvalho', 'Gomes'];

/* ---------- Ocorrências ----------
 * [título, categoria, endereço, bairro, lat, lng, diasAtrás, status, votos, autor, diasAtéResolver, descrição]
 */
const OCORRENCIAS = [
  ['Buraco grande no meio da pista', 'buraco', 'Av. General Carneiro, 1200', 'Vila Lucy', -23.4928, -47.4655, 3, 'em_analise', 37, 'u1', null,
    'Buraco com cerca de 1 metro de diâmetro na faixa da direita. Vários carros já tiveram pneu furado e os motociclistas desviam para a faixa ao lado, o que é perigoso.'],
  ['Alagamento recorrente em dias de chuva', 'alagamento', 'Av. Dom Aguirre, altura do nº 3000', 'Santa Rosália', -23.4975, -47.4478, 5, 'em_andamento', 52, 'u2', null,
    'Sempre que chove forte a água toma as duas faixas e invade a calçada. Pedestres ficam sem passagem e os carros andam com água acima da roda.'],
  ['Caçamba de entulho transbordando', 'lixo', 'Rua da Penha, 540', 'Centro', -23.5031, -47.4571, 2, 'reportado', 14, 'u3', null,
    'A caçamba está cheia há mais de uma semana e o entulho já ocupa metade da calçada. Há restos de madeira com pregos expostos.'],
  ['Postes apagados na praça', 'iluminacao', 'Praça Coronel Fernando Prestes', 'Centro', -23.5016, -47.4585, 8, 'em_analise', 21, 'u1', null,
    'Três postes da praça estão apagados há vários dias. À noite o local fica muito escuro e as pessoas evitam passar por ali.'],
  ['Calçada quebrada com desnível', 'calcada', 'Rua XV de Novembro, 180', 'Centro', -23.5004, -47.4559, 12, 'reportado', 9, 'u4', null,
    'Placas de concreto soltas e um desnível de uns 10 cm. Idosos e cadeirantes não conseguem passar sem descer para a rua.'],
  ['Bueiro vazando esgoto', 'esgoto', 'Av. Itavuvu, 2500', 'Zona Norte', -23.4700, -47.4700, 4, 'em_analise', 28, 'u5', null,
    'Esgoto saindo pela tampa do bueiro e escorrendo pela sarjeta. O cheiro é muito forte e já atrai insetos para as casas próximas.'],
  ['Pichação no muro da escola', 'vandalismo', 'Rua Coronel Cavalheiros, 300', 'Centro', -23.4985, -47.4595, 20, 'em_andamento', 11, 'u6', null,
    'O muro da escola foi todo pichado no fim de semana. Os alunos e a comunidade sugerem uma pintura nova ou até um mural artístico.'],
  ['Galho caído bloqueando a calçada', 'arvores', 'Av. Antônio Carlos Comitre, 900', 'Campolim', -23.5265, -47.4705, 1, 'reportado', 6, 'u7', null,
    'Depois do vento forte de ontem, um galho grande caiu e bloqueia a calçada inteira. Os pedestres precisam andar pela rua.'],
  ['Carro abandonado há meses', 'veiculo', 'Rua Aparecida, 1100', 'Vila Carvalho', -23.4890, -47.4735, 35, 'em_analise', 16, 'u8', null,
    'Carro sem placa, com vidros quebrados e pneus murchos, parado no mesmo lugar há pelo menos três meses. Acumula lixo e água parada.'],
  ['Cratera perto do cruzamento', 'buraco', 'Av. Ipanema, 2100', 'Vila Barcelona', -23.4810, -47.4860, 15, 'resolvido', 64, 'u2', 9,
    'Cratera funda logo depois do semáforo. Um ônibus ficou preso nela na semana passada e o trânsito parou por quase uma hora.'],
  ['Rua alaga e a água entra nas casas', 'alagamento', 'Av. Nogueira Padilha, 800', 'Vila Hortência', -23.5000, -47.4400, 40, 'resolvido', 48, 'u3', 25,
    'A boca de lobo não dá conta e a água chega a entrar nas garagens das casas da parte baixa da rua.'],
  ['Descarte irregular em terreno baldio', 'lixo', 'Av. Américo Figueiredo, 1800', 'Wanel Ville', -23.5085, -47.4960, 6, 'reportado', 19, 'u4', null,
    'Pessoas estão jogando sofás, restos de obra e sacos de lixo no terreno. Já apareceram ratos e escorpiões na vizinhança.'],
  ['Semáforo piscando no amarelo', 'iluminacao', 'Av. Afonso Vergueiro, próximo ao Terminal Santo Antônio', 'Centro', -23.4978, -47.4628, 1, 'em_analise', 25, 'u5', null,
    'O semáforo está piscando no amarelo desde ontem à tarde. O cruzamento é muito movimentado e quase aconteceram acidentes.'],
  ['Rampa de acessibilidade destruída', 'calcada', 'Av. São Paulo, 400', 'Além Ponte', -23.4960, -47.4440, 18, 'em_andamento', 13, 'u1', null,
    'A rampa da esquina está quebrada e com ferros aparentes. Cadeirantes e pessoas com carrinho de bebê não conseguem atravessar.'],
  ['Tampa de bueiro quebrada com vazamento', 'esgoto', 'Av. Independência, 1500', 'Éden', -23.4300, -47.4150, 22, 'resolvido', 17, 'u6', 6,
    'A tampa quebrou e há vazamento de esgoto. O buraco aberto também é um risco para quem passa a pé.'],
  ['Ponto de ônibus depredado', 'vandalismo', 'Av. Washington Luiz, 1800', 'Jardim Emília', -23.5180, -47.4560, 9, 'reportado', 8, 'u7', null,
    'O vidro da cobertura foi quebrado e o banco arrancado. Quem espera o ônibus fica no sol e na chuva.'],
  ['Árvore inclinada com risco de queda', 'arvores', 'Praça do Jardim Vergueiro', 'Jardim Vergueiro', -23.5150, -47.4820, 11, 'em_analise', 30, 'u8', null,
    'A árvore está bem inclinada sobre a rua e a raiz levantou a calçada. Com a chuva, os moradores têm medo de que ela caia sobre os carros.'],
  ['Caminhão abandonado ocupando a via', 'veiculo', 'Av. Victor Andrew, 2000', 'Zona Industrial', -23.4450, -47.4230, 50, 'resolvido', 10, 'u3', 30,
    'Caminhão parado há semanas ocupando uma faixa inteira da avenida, sem sinalização. À noite é muito difícil de enxergar.'],
  ['Placa de rua caída', 'outros', 'Av. General Osório, 1300', 'Vila Trujillo', -23.5080, -47.4430, 26, 'reportado', 4, 'u2', null,
    'A placa com o nome da rua caiu e está no chão há semanas. Entregadores e visitantes se perdem com frequência.'],
  ['Asfalto afundando perto do bueiro', 'buraco', 'Av. Barão de Tatuí, 700', 'Vila Jardini', -23.5060, -47.4640, 25, 'resolvido', 41, 'u1', 12,
    'O asfalto em volta do bueiro está afundando e já formou um degrau. Motos precisam desviar em cima da hora.'],
  ['Rua inteira sem iluminação', 'iluminacao', 'Av. Dr. Armando Pannunzio, 700', 'Jardim Vera Cruz', -23.4880, -47.4870, 7, 'em_andamento', 33, 'u4', null,
    'Todos os postes do quarteirão estão apagados. Moradores relatam que ficou perigoso voltar do trabalho à noite.'],
  ['Lixo espalhado após a feira livre', 'lixo', 'Av. Moreira César, 200', 'Vila Nova Sorocaba', -23.4930, -47.4450, 30, 'resolvido', 22, 'u5', 2,
    'Depois da feira de domingo, restos de frutas e caixas ficam espalhados pela rua até a terça-feira.'],
  ['Buraco na calçada em frente à UBS', 'calcada', 'Rua Souza Pereira, 450', 'Centro', -23.5045, -47.4545, 45, 'resolvido', 18, 'u6', 20,
    'Buraco grande na calçada bem na entrada da unidade de saúde. Muitos idosos passam por ali todos os dias.'],
  ['Boca de lobo entupida', 'alagamento', 'Av. Eng. Carlos Reinaldo Mendes, 3000', 'Alto da Boa Vista', -23.4770, -47.4500, 13, 'reportado', 12, 'u7', null,
    'A boca de lobo está entupida de folhas e lixo. Com qualquer chuva forma uma poça enorme na faixa da direita.'],
  ['Esgoto a céu aberto', 'esgoto', 'Av. Três de Março, 1200', 'Aparecidinha', -23.4500, -47.4300, 60, 'em_andamento', 45, 'u8', null,
    'Esgoto correndo a céu aberto ao lado da calçada, perto de onde as crianças brincam. O mau cheiro é constante.'],
  ['Banco da praça quebrado e pichado', 'vandalismo', 'Parque Campolim', 'Campolim', -23.5230, -47.4745, 70, 'resolvido', 7, 'u2', 15,
    'Dois bancos do parque foram quebrados e pichados. São muito usados por quem caminha no fim da tarde.'],
  ['Sequência de buracos na avenida', 'buraco', 'Av. Juscelino Kubitschek de Oliveira, 1500', 'Jardim Faculdade', -23.5155, -47.4655, 10, 'reportado', 15, 'u3', null,
    'São pelo menos cinco buracos em sequência em menos de 100 metros. À noite é quase impossível desviar de todos.'],
  ['Raízes levantando a calçada', 'arvores', 'Rua Dr. Álvaro Soares, 900', 'Centro', -23.4995, -47.4610, 90, 'resolvido', 12, 'u4', 40,
    'As raízes da árvore levantaram as pedras da calçada e já causaram tombos de pedestres.'],
  ['Moto abandonada na calçada', 'veiculo', 'Av. São Paulo, 1100', 'Além Ponte', -23.4945, -47.4460, 16, 'reportado', 5, 'u5', null,
    'Moto sem placa e sem rodas largada na calçada há semanas. Está atrapalhando a passagem.'],
  ['Lâmpada queimada em frente à escola', 'iluminacao', 'Av. Independência, 800', 'Éden', -23.4330, -47.4190, 120, 'resolvido', 26, 'u1', 10,
    'O poste em frente ao portão da escola está com a lâmpada queimada. Os alunos do período noturno saem no escuro.'],
  ['Lixo acumulado na margem do rio', 'lixo', 'Av. Dom Aguirre, Parque das Águas', 'Parque das Águas', -23.4893, -47.4535, 150, 'resolvido', 58, 'u6', 18,
    'Muito lixo plástico acumulado na margem do Rio Sorocaba. Com a chuva, tudo é levado pela correnteza.'],
  ['Fiação solta pendurada no poste', 'outros', 'Av. Américo Figueiredo, 2400', 'Wanel Ville', -23.5070, -47.4990, 3, 'em_analise', 20, 'u7', null,
    'Fios soltos pendurados na altura das pessoas. Não sabemos se é energia ou telefonia, mas é um risco para quem passa.'],
  ['Buraco perto da rotatória', 'buraco', 'Av. Itavuvu, 7000', 'Zona Norte', -23.4500, -47.4720, 170, 'resolvido', 34, 'u8', 14,
    'Buraco na entrada da rotatória, bem onde os carros reduzem. Já causou batidas traseiras.'],
  ['Água acumulada na passagem subterrânea', 'alagamento', 'Av. Afonso Vergueiro, passagem subterrânea', 'Centro', -23.4965, -47.4610, 0, 'reportado', 3, 'u2', null,
    'A passagem subterrânea está com água acumulada desde a chuva da madrugada. Carros baixos estão ficando presos.'],
  ['Calçada sem acessibilidade perto do terminal', 'calcada', 'Rua Coronel Nogueira Padilha, 50', 'Centro', -23.4990, -47.4640, 1, 'reportado', 4, 'u1', null,
    'A calçada é estreita, cheia de degraus e sem piso tátil. Pessoas com deficiência visual não conseguem chegar ao terminal com segurança.'],
];

/* ---------- Comentários (índice da ocorrência na lista acima) ---------- */
const COMENTARIOS = [
  [0, 'u3', 'Passo ali todo dia de moto, é muito perigoso mesmo. Já vi dois acidentes.', 2],
  [0, 'u6', 'Confirmo! Meu carro furou o pneu nesse buraco semana passada.', 1],
  [1, 'u5', 'Ontem a água chegou quase na altura da porta do carro.', 4],
  [1, 'g1', 'A equipe de drenagem iniciou a limpeza das galerias da região. Previsão de conclusão em 15 dias.', 1],
  [3, 'u8', 'Sim, está muito escuro. Evito passar por lá depois das 19h.', 6],
  [5, 'u2', 'O cheiro está insuportável, principalmente à tarde.', 3],
  [9, 'u1', 'Ficou ótimo depois do conserto, obrigado a todos que confirmaram!', 2],
  [16, 'u4', 'Essa árvore balança muito quando venta. Por favor, olhem com urgência.', 9],
];

/* ---------- Funções auxiliares ---------- */

// Gerador de números "aleatórios" com semente: sempre gera a mesma sequência,
// então os dados de demonstração ficam iguais toda vez que forem restaurados.
function criarAleatorio(semente) {
  let valor = semente;
  return () => {
    valor = (valor * 16807) % 2147483647;
    return (valor - 1) / 2147483646;
  };
}

function dataDiasAtras(agora, dias, hora) {
  const data = new Date(agora - dias * UM_DIA);
  data.setHours(hora, (hora * 7) % 60, 0, 0);
  // Nunca criar uma data no futuro (ex.: "hoje às 17h" quando ainda são 10h)
  if (data.getTime() > agora) return new Date(agora - 2 * 60 * 60 * 1000).toISOString();
  return data.toISOString();
}

function somarDias(iso, dias, agora) {
  const data = new Date(new Date(iso).getTime() + dias * UM_DIA);
  return new Date(Math.min(data.getTime(), agora - 60 * 60 * 1000)).toISOString();
}

/** Monta o histórico de status coerente com o status atual. */
function montarHistorico(criadoEm, status, diasAtras, diasAteResolver, agora) {
  const historico = [{ status: 'reportado', data: criadoEm, alteradoPor: null }];
  if (status === 'reportado') return { historico, resolvidoEm: null };

  const duracao = diasAteResolver ?? Math.max(diasAtras, 1);
  historico.push({ status: 'em_analise', data: somarDias(criadoEm, Math.max(1, Math.round(duracao * 0.2)), agora), alteradoPor: 'g1' });
  if (status === 'em_analise') return { historico, resolvidoEm: null };

  historico.push({ status: 'em_andamento', data: somarDias(criadoEm, Math.max(1, Math.round(duracao * 0.5)), agora), alteradoPor: 'g1' });
  if (status === 'em_andamento') return { historico, resolvidoEm: null };

  const resolvidoEm = somarDias(criadoEm, duracao, agora);
  historico.push({ status: 'resolvido', data: resolvidoEm, alteradoPor: 'g1' });
  return { historico, resolvidoEm };
}

/**
 * Gera todos os dados de demonstração.
 * Retorna um objeto com as "tabelas" que serão salvas no localStorage.
 */
export function gerarDadosIniciais() {
  const agora = Date.now();
  const aleatorio = criarAleatorio(42);

  // Usuários
  const usuarios = USUARIOS_PRINCIPAIS.map((usuario, indice) => ({
    ...usuario,
    senhaHash: HASH_SENHA_DEMO,
    criadoEm: dataDiasAtras(agora, 200 - indice * 5, 9),
  }));

  let contador = 1;
  for (const nome of NOMES) {
    for (const sobrenome of SOBRENOMES) {
      usuarios.push({
        id: `a${contador}`,
        nome: `${nome} ${sobrenome}`,
        email: `morador${contador}@email.com`,
        perfil: 'cidadao',
        senhaHash: HASH_SENHA_DEMO,
        criadoEm: dataDiasAtras(agora, Math.floor(aleatorio() * 180) + 1, 12),
      });
      contador += 1;
    }
  }

  // Ocorrências
  const primeiroId = 2801;
  const ocorrencias = OCORRENCIAS.map((linha, indice) => {
    const [titulo, categoria, endereco, bairro, latitude, longitude, diasAtras, status, , autorId, diasAteResolver, descricao] = linha;
    const criadoEm = dataDiasAtras(agora, diasAtras, 7 + ((indice * 5) % 13));
    const { historico, resolvidoEm } = montarHistorico(criadoEm, status, diasAtras, diasAteResolver, agora);
    return {
      id: primeiroId + indice,
      titulo,
      descricao,
      categoria,
      latitude,
      longitude,
      endereco,
      bairro,
      fotos: [],
      autorId,
      status,
      historicoStatus: historico,
      criadoEm,
      atualizadoEm: historico[historico.length - 1].data,
      resolvidoEm,
    };
  });

  // Votos: cada ocorrência recebe exatamente a quantidade definida na tabela,
  // de usuários diferentes e nunca do próprio autor nem do gestor.
  const eleitores = usuarios.filter((usuario) => usuario.perfil === 'cidadao');
  const votos = [];
  ocorrencias.forEach((ocorrencia, indice) => {
    const quantidade = OCORRENCIAS[indice][8];
    const candidatos = eleitores
      .filter((usuario) => usuario.id !== ocorrencia.autorId)
      .map((usuario) => ({ usuario, ordem: aleatorio() }))
      .sort((a, b) => a.ordem - b.ordem)
      .slice(0, quantidade);
    candidatos.forEach(({ usuario }) => {
      votos.push({
        id: `v${votos.length + 1}`,
        ocorrenciaId: ocorrencia.id,
        usuarioId: usuario.id,
        criadoEm: somarDias(ocorrencia.criadoEm, aleatorio() * 3, agora),
      });
    });
  });

  // Comentários
  const comentarios = COMENTARIOS.map(([indice, usuarioId, texto, diasAtras], posicao) => ({
    id: `c${posicao + 1}`,
    ocorrenciaId: ocorrencias[indice].id,
    usuarioId,
    texto,
    criadoEm: dataDiasAtras(agora, Math.min(diasAtras, OCORRENCIAS[indice][6]), 10 + posicao),
  }));

  // Algumas notificações iniciais para o usuário de demonstração
  const notificacoes = [
    { id: 'n1', usuarioId: 'u1', tipo: 'status', ocorrenciaId: 2801, mensagem: 'Sua ocorrência "Buraco grande no meio da pista" agora está Em análise.', lida: false, criadoEm: dataDiasAtras(agora, 1, 9) },
    { id: 'n2', usuarioId: 'u1', tipo: 'comentario', ocorrenciaId: 2801, mensagem: 'Juliana Costa comentou em "Buraco grande no meio da pista".', lida: false, criadoEm: dataDiasAtras(agora, 1, 15) },
    { id: 'n3', usuarioId: 'u1', tipo: 'upvote', ocorrenciaId: 2804, mensagem: 'Sua ocorrência "Postes apagados na praça" recebeu novas confirmações.', lida: true, criadoEm: dataDiasAtras(agora, 4, 11) },
  ];

  return {
    usuarios,
    ocorrencias,
    votos,
    comentarios,
    notificacoes,
    proximoIdOcorrencia: primeiroId + ocorrencias.length,
  };
}
