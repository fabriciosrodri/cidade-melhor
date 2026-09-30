/** Configurações gerais do projeto, reunidas num só lugar. */

// Centro aproximado de Sorocaba-SP
export const CENTRO_SOROCABA = [-23.5015, -47.4526];
export const ZOOM_INICIAL = 13;

// Retângulo aproximado que cobre o município (usado para validar o local do pin
// e para limitar a busca de endereços). Formato: [sul, oeste, norte, leste]
export const LIMITES_SOROCABA = { sul: -23.62, oeste: -47.58, norte: -23.38, leste: -47.33 };

// Mapa (OpenStreetMap é gratuito, mas exige a atribuição abaixo)
export const URL_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const ATRIBUICAO_MAPA = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

// Nominatim: serviço gratuito de busca de endereços do OpenStreetMap
export const URL_NOMINATIM = 'https://nominatim.openstreetmap.org';

// Regras de negócio
export const VOTOS_EM_ALTA = 20;        // a partir de quantos upvotes o pin ganha destaque
export const MAX_FOTOS = 3;
export const TAMANHO_MAX_FOTO = 1024;   // px (lado maior)
export const QUALIDADE_FOTO = 0.7;      // JPEG 0 a 1

// Versão dos dados de demonstração. Se o formato dos dados mudar,
// aumente este número para o site recarregar o seed automaticamente.
export const VERSAO_DADOS = 1;
