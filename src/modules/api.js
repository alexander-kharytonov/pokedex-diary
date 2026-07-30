import { API_URL } from "./constants.js";

export async function fetchPokemonDetails(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Pokémon-Details konnten nicht geladen werden");
  }

  return response.json();
}

export async function fetchPokemonPage(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Pokémon konnten nicht geladen werden");
  }

  const page = await response.json();
  const pokemon = await Promise.all(
    page.results.map(({ url: detailsUrl }) => fetchPokemonDetails(detailsUrl)),
  );

  return { page, pokemon };
}

export async function searchPokemonByQuery(query, signal) {
  const response = await fetch(
    `${API_URL}/pokemon/${encodeURIComponent(query)}`,
    { signal },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Die Suche konnte nicht ausgeführt werden");
  }

  return response.json();
}
