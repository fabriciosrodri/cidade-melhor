/**
 * GEOLOCALIZAÇÃO E ENDEREÇOS
 * - Busca de endereço (texto → coordenadas) e endereço reverso (coordenadas → texto)
 *   usando o Nominatim, serviço gratuito do OpenStreetMap.
 * - Localização atual do usuário pelo GPS/rede do navegador.
 *
 * Regra de uso do Nominatim: no máximo 1 requisição por segundo.
 * Por isso existe a "fila" abaixo, que espera o tempo necessário entre as chamadas.
 */
import { URL_NOMINATIM, LIMITES_SOROCABA } from '../config/constants.js';

let ultimaRequisicao = 0;

async function aguardarVez() {
  const espera = ultimaRequisicao + 1100 - Date.now();
  if (espera > 0) await new Promise((resolver) => setTimeout(resolver, espera));
  ultimaRequisicao = Date.now();
}

async function consultarNominatim(caminho, parametros) {
  await aguardarVez();
  const url = `${URL_NOMINATIM}/${caminho}?${new URLSearchParams({ format: 'json', 'accept-language': 'pt-BR', ...parametros })}`;
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error('O serviço de endereços não respondeu. Tente novamente em instantes.');
  return resposta.json();
}

/** Transforma o endereço detalhado do Nominatim em "Rua X, 123" + bairro. */
function resumirEndereco(resultado) {
  const partes = resultado.address || {};
  const rua = partes.road || partes.pedestrian || partes.footway || partes.square || partes.park || '';
  const numero = partes.house_number ? `, ${partes.house_number}` : '';
  const bairro = partes.suburb || partes.neighbourhood || partes.quarter || partes.city_district || '';
  const principal = rua ? `${rua}${numero}` : (resultado.display_name || '').split(',').slice(0, 2).join(',');
  return { endereco: principal.trim(), bairro };
}

/** Busca endereços em Sorocaba a partir de um texto. */
export async function buscarEndereco(texto) {
  const { oeste, norte, leste, sul } = LIMITES_SOROCABA;
  const resultados = await consultarNominatim('search', {
    q: `${texto}, Sorocaba`,
    viewbox: `${oeste},${norte},${leste},${sul}`,
    bounded: 1,
    addressdetails: 1,
    limit: 5,
    countrycodes: 'br',
  });
  return resultados.map((resultado) => ({
    ...resumirEndereco(resultado),
    descricao: resultado.display_name,
    latitude: Number(resultado.lat),
    longitude: Number(resultado.lon),
  }));
}

/** Descobre o endereço de um ponto do mapa. */
export async function enderecoReverso(latitude, longitude) {
  const resultado = await consultarNominatim('reverse', { lat: latitude, lon: longitude, zoom: 18, addressdetails: 1 });
  if (!resultado || resultado.error) return { endereco: '', bairro: '' };
  return resumirEndereco(resultado);
}

/** true se o ponto está dentro do retângulo aproximado de Sorocaba. */
export function dentroDeSorocaba(latitude, longitude) {
  const { sul, norte, oeste, leste } = LIMITES_SOROCABA;
  return latitude >= sul && latitude <= norte && longitude >= oeste && longitude <= leste;
}

/** Pede a localização atual ao navegador (o usuário precisa permitir). */
export function obterLocalizacaoAtual() {
  return new Promise((resolver, rejeitar) => {
    if (!navigator.geolocation) {
      rejeitar(new Error('Seu navegador não permite obter a localização.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicao) => resolver({ latitude: posicao.coords.latitude, longitude: posicao.coords.longitude }),
      (erro) => {
        const mensagens = {
          1: 'Você não permitiu o acesso à localização. Libere nas configurações do navegador.',
          2: 'Não foi possível descobrir sua localização agora.',
          3: 'A localização demorou demais para responder.',
        };
        rejeitar(new Error(mensagens[erro.code] || 'Não foi possível obter sua localização.'));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
