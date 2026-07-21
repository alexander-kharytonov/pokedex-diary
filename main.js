const API_URL = "https://pokeapi.co/api/v2";

async function fetchPokemon() {
  try {
    const response = await fetch(`${API_URL}/pokemon?limit=10`);

    if (!response.ok) {
      throw new Error("Pokémon konnten nicht geladen werden");
    }

    const data = await response.json();

    const pokemonDetails = await Promise.all(
      data.results.map(async (pokemon) => {
        const response = await fetch(pokemon.url);

        if (!response.ok) {
          throw new Error(`${pokemon.name} konnte nicht geladen werden`);
        }

        return response.json();
      }),
    );

    console.log({ pokemonDetails });
  } catch (error) {
    console.error(error);
  }
}

fetchPokemon();
