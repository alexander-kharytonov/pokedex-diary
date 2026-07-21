const API_URL = "https://pokeapi.co/api/v2";

const pokemonGrid = document.getElementById("pokemon-grid");
function renderPokemonCard(pokemon) {
  const card = document.createElement("article");
  const image = document.createElement("img");

  image.src = pokemon.sprites.front_default;
  image.alt = pokemon.name;
  image.className = "mx-auto size-32 object-contain";

  card.className =
    "rounded-2xl border border-white/10 bg-slate-900 p-5 text-center shadow-lg";

  const title = document.createElement("h2");
  const id = document.createElement("p");
  const hp = document.createElement("p");
  const attack = document.createElement("p");
  const defense = document.createElement("p");

  attack.textContent = `Attack: ${pokemon.stats[1].base_stat}`;
  defense.textContent = `Defense: ${pokemon.stats[2].base_stat}`;

  title.textContent = pokemon.name;
  id.textContent = `#${pokemon.id}`;
  hp.textContent = `HP: ${pokemon.stats[0].base_stat}`;

  card.append(image, title, id, hp, attack, defense);
  pokemonGrid.append(card);
}

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

    pokemonDetails.forEach((pokemon) => {
      renderPokemonCard(pokemon);
    });
  } catch (error) {
    console.error(error);
  }
}

fetchPokemon();
