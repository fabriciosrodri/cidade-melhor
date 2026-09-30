/**
 * OS 17 OBJETIVOS DE DESENVOLVIMENTO SUSTENTÁVEL (Agenda 2030 da ONU)
 * Cores oficiais de cada ODS. Os cards são desenhados com CSS (sem usar logotipos).
 */
export const ODS = [
  { numero: 1,  nome: 'Erradicação da pobreza',                 cor: '#E5243B', descricao: 'Acabar com a pobreza em todas as suas formas, em todos os lugares.' },
  { numero: 2,  nome: 'Fome zero e agricultura sustentável',    cor: '#DDA63A', descricao: 'Acabar com a fome, alcançar a segurança alimentar, melhorar a nutrição e promover a agricultura sustentável.' },
  { numero: 3,  nome: 'Saúde e bem-estar',                      cor: '#4C9F38', descricao: 'Assegurar uma vida saudável e promover o bem-estar para todas as pessoas, em todas as idades.' },
  { numero: 4,  nome: 'Educação de qualidade',                  cor: '#C5192D', descricao: 'Garantir educação inclusiva, equitativa e de qualidade, e oportunidades de aprendizagem ao longo da vida.' },
  { numero: 5,  nome: 'Igualdade de gênero',                    cor: '#FF3A21', descricao: 'Alcançar a igualdade de gênero e empoderar todas as mulheres e meninas.' },
  { numero: 6,  nome: 'Água potável e saneamento',              cor: '#26BDE2', descricao: 'Garantir disponibilidade e gestão sustentável da água e saneamento para todas as pessoas.' },
  { numero: 7,  nome: 'Energia limpa e acessível',              cor: '#FCC30B', descricao: 'Garantir acesso a fontes de energia confiáveis, sustentáveis e modernas para todas as pessoas.' },
  { numero: 8,  nome: 'Trabalho decente e crescimento econômico', cor: '#A21942', descricao: 'Promover o crescimento econômico sustentado, inclusivo e sustentável, emprego pleno e trabalho decente.' },
  { numero: 9,  nome: 'Indústria, inovação e infraestrutura',   cor: '#FD6925', descricao: 'Construir infraestruturas resilientes, promover a industrialização inclusiva e sustentável e fomentar a inovação.' },
  { numero: 10, nome: 'Redução das desigualdades',              cor: '#DD1367', descricao: 'Reduzir a desigualdade dentro dos países e entre eles.' },
  { numero: 11, nome: 'Cidades e comunidades sustentáveis',     cor: '#FD9D24', descricao: 'Tornar as cidades e os assentamentos humanos inclusivos, seguros, resilientes e sustentáveis.' },
  { numero: 12, nome: 'Consumo e produção responsáveis',        cor: '#BF8B2E', descricao: 'Assegurar padrões de produção e de consumo sustentáveis.' },
  { numero: 13, nome: 'Ação contra a mudança global do clima',  cor: '#3F7E44', descricao: 'Tomar medidas urgentes para combater a mudança climática e seus impactos.' },
  { numero: 14, nome: 'Vida na água',                           cor: '#0A97D9', descricao: 'Conservar e usar de forma sustentável os oceanos, os mares e os recursos marinhos.' },
  { numero: 15, nome: 'Vida terrestre',                         cor: '#56C02B', descricao: 'Proteger, recuperar e promover o uso sustentável dos ecossistemas terrestres e deter a perda de biodiversidade.' },
  { numero: 16, nome: 'Paz, justiça e instituições eficazes',   cor: '#00689D', descricao: 'Promover sociedades pacíficas e inclusivas, acesso à justiça para todos e instituições eficazes e responsáveis.' },
  { numero: 17, nome: 'Parcerias e meios de implementação',     cor: '#19486A', descricao: 'Fortalecer os meios de implementação e revitalizar a parceria global para o desenvolvimento sustentável.' },
];

/** ODS diretamente ligados ao Cidade Melhor e como o site contribui com cada um. */
export const ODS_DO_PROJETO = [
  { numero: 11, relacao: 'É o coração do projeto: mapear buracos, calçadas quebradas, iluminação e vandalismo ajuda a tornar Sorocaba mais segura, acessível e bem cuidada.', categorias: ['buraco', 'calcada', 'iluminacao', 'vandalismo'] },
  { numero: 6,  relacao: 'Denúncias de vazamento de esgoto e bueiros entupidos aceleram reparos de saneamento e evitam a contaminação da água e do solo.', categorias: ['esgoto', 'alagamento'] },
  { numero: 9,  relacao: 'Os dados colaborativos mostram onde a infraestrutura urbana mais precisa de manutenção, ajudando a planejar investimentos.', categorias: ['buraco', 'iluminacao'] },
  { numero: 12, relacao: 'Registrar descarte irregular de lixo e entulho incentiva a coleta correta, a reciclagem e o consumo mais consciente.', categorias: ['lixo'] },
  { numero: 13, relacao: 'Alagamentos recorrentes são sinais das mudanças no clima; mapeá-los ajuda a cidade a se adaptar a chuvas mais intensas.', categorias: ['alagamento'] },
  { numero: 15, relacao: 'Cuidar das árvores urbanas e das margens do rio preserva a vegetação, a sombra e a biodiversidade da cidade.', categorias: ['arvores'] },
];

/** Ações simples do dia a dia e o ODS relacionado. */
export const ACOES_DIA_A_DIA = [
  { titulo: 'Economize água', texto: 'Feche a torneira ao escovar os dentes, reduza o tempo do banho e conserte vazamentos rapidamente.', icone: 'droplet', ods: 6 },
  { titulo: 'Descarte o lixo corretamente', texto: 'Use as lixeiras, respeite os dias de coleta e leve entulho e móveis velhos aos Ecopontos.', icone: 'trash-2', ods: 12 },
  { titulo: 'Recicle', texto: 'Separe plástico, papel, metal e vidro. Lave as embalagens antes de descartar.', icone: 'recycle', ods: 12 },
  { titulo: 'Evite o desperdício', texto: 'Planeje as compras, reaproveite alimentos e desligue luzes e aparelhos que não estão em uso.', icone: 'leaf', ods: 12 },
  { titulo: 'Use transporte sustentável', texto: 'Prefira caminhar, pedalar, usar o transporte público ou dividir caronas.', icone: 'bus', ods: 13 },
  { titulo: 'Cuide dos espaços públicos', texto: 'Praças, parques e pontos de ônibus são de todos. Preserve e incentive outras pessoas a fazerem o mesmo.', icone: 'trees', ods: 11 },
  { titulo: 'Reporte problemas urbanos', texto: 'Viu um buraco, poste apagado ou lixo acumulado? Registre no Cidade Melhor e confirme os relatos de vizinhos.', icone: 'megaphone', ods: 11 },
];
