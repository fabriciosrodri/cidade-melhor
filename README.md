# Cidade Melhor

**Sua cidade, nossa responsabilidade.**

Plataforma colaborativa para mapear problemas urbanos de **Sorocaba-SP**. O cidadão marca o problema no mapa (buraco, alagamento, esgoto, lixo, iluminação...), outras pessoas confirmam com um *upvote*, e o gestor municipal acompanha e atualiza o status até a resolução.

Projeto acadêmico **UPX 2 – Desenvolvimento Sustentável** · Engenharia da Computação.

---

## Funcionalidades

| Página | O que faz |
|---|---|
| `index.html` | Página inicial com prévia do mapa, indicadores, "Como funciona", categorias e problemas em alta |
| `login.html` / `cadastro.html` | Login e cadastro com validação dos campos |
| `mapa.html` | Mapa com pins coloridos por categoria, agrupamento de pins próximos, filtros (categoria, período, status, "meus pins"), busca de endereço, localização atual e painel de detalhes |
| `reportar.html` | Criar ocorrência: clique no mapa, endereço automático, categoria, título, descrição e até 3 fotos |
| `reportar.html?id=...` | Editar ocorrência (somente o autor) |
| `ocorrencia.html?id=...` | Detalhes, upvote, linha do tempo do status, comentários, mini mapa e compartilhar |
| `meus-pins.html` | Ocorrências do usuário com resumo, abas por status, ordenação, editar e excluir |
| `resolvidos.html` | Histórico de problemas resolvidos (estilo *changelog*), com tempo até a resolução |
| `relatorios.html` | Indicadores e gráficos (por categoria, por status, por mês e top 5) |
| `sustentabilidade.html` | Página educativa sobre os 17 ODS e ações para o dia a dia |
| `sobre.html` | Sobre o projeto, objetivo, equipe e botão para restaurar os dados de demonstração |

### Regras de permissão

| Ação | Quem pode |
|---|---|
| Ver ocorrências | Todos (inclusive sem login) |
| Criar ocorrência | Usuário logado |
| Editar / excluir | Somente o autor |
| Upvote | Usuário logado, 1 por ocorrência, pode retirar, não pode votar no próprio pin |
| Comentar | Usuário logado |
| Alterar status | Somente o **gestor** |

Pins com **20 ou mais upvotes** ficam maiores e com o selo "Em alta". Pins resolvidos aparecem mais apagados.

---

## Contas de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Cidadão | `cidadao@cidademelhor.com` | `123456` |
| Gestor (Prefeitura) | `gestor@cidademelhor.com` | `123456` |

Na tela de login há botões **"Usar"** que preenchem essas contas automaticamente.

---

## Tecnologias

- **HTML5, CSS3 e JavaScript puro** (ES Modules), sem frameworks e sem etapa de build
- **[Leaflet](https://leafletjs.com/)** + **OpenStreetMap**: mapa gratuito
- **[Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)**: agrupa pins próximos
- **[Nominatim](https://nominatim.org/)**: busca de endereço e endereço automático (gratuito, limite de 1 requisição por segundo)
- **[Lucide](https://lucide.dev/)**: ícones
- **[Chart.js](https://www.chartjs.org/)**: gráficos
- Fonte **Inter** (Google Fonts)

Todas as bibliotecas são carregadas por CDN. Por isso é preciso **internet** para o site funcionar (inclusive para aparecer o mapa).

---

## Como rodar no computador

Os arquivos usam **ES Modules** (`import`/`export`). Por segurança, o navegador **não** carrega módulos abrindo o arquivo com dois cliques (`file://`). É preciso um pequeno servidor local:

**Opção 1: VS Code + Live Server (recomendado)**
1. Abra a pasta `cidade-melhor` no VS Code.
2. Instale a extensão **Live Server** (autor: Ritwick Dey).
3. Clique com o botão direito no `index.html` → **Open with Live Server**.

**Opção 2: Python**
```bash
cd cidade-melhor
python -m http.server 8000
```
Depois abra `http://localhost:8000` no navegador.

---

## Como publicar no GitHub Pages

1. Crie uma conta em [github.com](https://github.com) (se ainda não tiver).
2. Clique em **New repository**, dê o nome `cidade-melhor`, deixe como **Public** e crie.
3. Na página do repositório, clique em **uploading an existing file** e arraste **todo o conteúdo** da pasta `cidade-melhor` (o `index.html` precisa ficar na raiz, não dentro de outra pasta). Clique em **Commit changes**.
4. Vá em **Settings → Pages**.
5. Em **Source**, escolha **Deploy from a branch**; em **Branch**, escolha `main` e a pasta `/ (root)`. Clique em **Save**.
6. Aguarde 1 ou 2 minutos. O site ficará em:
   `https://SEU-USUARIO.github.io/cidade-melhor/`

Todos os caminhos do projeto são relativos, então funciona nesse endereço sem ajustes. O arquivo `.nojekyll` faz o GitHub publicar os arquivos exatamente como estão.

> A opção **"Minha localização"** exige HTTPS. No GitHub Pages ela funciona; no computador, funciona em `localhost`.

---

## Estrutura de pastas

```
cidade-melhor/
├── *.html                 → uma página por arquivo
├── css/
│   ├── variables.css      → cores, espaçamentos, sombras (design tokens)
│   ├── base.css           → reset, tipografia e utilitários
│   ├── components.css     → botões, cards, badges, formulários, header, footer, modal, toast, pins...
│   └── pages/             → estilos específicos de cada página
├── js/
│   ├── app.js             → inicialização comum (header, footer, login obrigatório)
│   ├── config/            → categorias, status e constantes (fonte única da verdade)
│   ├── data/              → dados de demonstração (seed), equipe e conteúdo dos ODS
│   ├── services/          → ÚNICA camada que lê e grava dados
│   ├── components/        → pedaços de interface reutilizáveis
│   ├── utils/             → funções auxiliares (datas, validação, imagens, ícones, DOM)
│   └── pages/             → um script por página
└── assets/icons/          → favicon
```

### Como os arquivos conversam

```
Página HTML  →  js/pages/mapa.js         (controla a tela)
                    ↓ usa
             js/components/*.js          (header, cards, modal, toast…)
                    ↓ pede dados para
             js/services/*.js            (funções async que simulam uma API)
                    ↓ leem e gravam em
             localStorage (storage.js)   → no futuro: fetch() para o backend
```

**Regra de ouro:** as páginas **nunca** acessam o `localStorage` diretamente. Tudo passa por `js/services/`.

---

## Onde editar

| Quero mudar... | Arquivo |
|---|---|
| Nomes, funções e RAs da equipe | `js/data/team.js` |
| Nome da faculdade / professor | `js/data/team.js` (`INFO_ACADEMICA`) |
| Categorias de problema (nome, cor, ícone) | `js/config/categories.js` |
| Cores do site | `css/variables.css` |
| Ocorrências de exemplo | `js/data/seed.js` (depois aumente `VERSAO_DADOS` em `js/config/constants.js` para recarregar) |
| Quantos votos para "Em alta" | `js/config/constants.js` (`VOTOS_EM_ALTA`) |

---

## Integração futura com backend (Node.js + Express + PostgreSQL)

Como todo acesso a dados está em `js/services/`, basta trocar o conteúdo dessas funções por chamadas `fetch()`. As páginas não mudam. Exemplo:

```js
// Hoje (localStorage)
export async function listarOcorrencias() {
  return ler('ocorrencias', []) /* ... */;
}

// Com backend
export async function listarOcorrencias() {
  const resposta = await fetch('https://api.cidademelhor.com/ocorrencias');
  return resposta.json();
}
```

Rotas sugeridas para a API:

| Método | Rota | Service |
|---|---|---|
| `POST` | `/auth/login`, `/auth/cadastro` | `authService` |
| `GET` / `POST` | `/ocorrencias` | `problemService` |
| `GET` / `PUT` / `DELETE` | `/ocorrencias/:id` | `problemService` |
| `PATCH` | `/ocorrencias/:id/status` | `problemService` (gestor) |
| `POST` / `DELETE` | `/ocorrencias/:id/voto` | `voteService` |
| `GET` / `POST` | `/ocorrencias/:id/comentarios` | `commentService` |
| `GET` | `/notificacoes` | `notificationService` |
| `GET` | `/relatorios` | `statsService` |

Os modelos de dados (usuário, ocorrência, voto, comentário, notificação) já seguem o formato de tabelas, então viram tabelas do PostgreSQL quase diretamente.

---

## Limitações do protótipo

- **Os dados ficam no navegador** (`localStorage`). Cada navegador/computador tem os seus próprios dados, e outras pessoas não veem as ocorrências que você criou. Para a apresentação, use sempre o mesmo computador e o botão **"Restaurar dados de demonstração"** (página Sobre) antes de começar.
- **A autenticação é simulada.** A senha é guardada como hash SHA-256 apenas para fins didáticos; não há segurança real sem um servidor.
- **"Esqueci minha senha"** é apenas visual.
- **As fotos** são reduzidas no navegador (máx. 1024 px) para caber no limite de ~5 MB do `localStorage`.
- **As ocorrências de exemplo são fictícias**, com ruas e bairros de Sorocaba e coordenadas aproximadas.
- **Sistema de medalhas/recompensas:** fora do escopo desta versão. Os dados de votos, comentários e ocorrências por usuário já permitem calcular medalhas no futuro.
