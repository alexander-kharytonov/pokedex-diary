import { CAUGHT_POKEMON_KEY } from "./constants.js";
export function readCaughtPokemon() {
  try {
    const storedPokemon = JSON.parse(
      localStorage.getItem(CAUGHT_POKEMON_KEY) ?? "[]",
    );

    return Array.isArray(storedPokemon)
      ? storedPokemon.filter(
          (pokemon) => pokemon && Number.isInteger(pokemon.id),
        )
      : [];
  } catch (error) {
    console.warn("Gefangene Pokémon konnten nicht gelesen werden.", error);
    return [];
  }
}

export function writeCaughtPokemon(pokemon) {
  try {
    localStorage.setItem(CAUGHT_POKEMON_KEY, JSON.stringify(pokemon));
    return true;
  } catch (error) {
    console.warn("Gefangene Pokémon konnten nicht gespeichert werden.", error);
    return false;
  }
}