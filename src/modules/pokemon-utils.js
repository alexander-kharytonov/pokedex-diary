export function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function getBaseStat(pokemon, statName) {
  return (
    pokemon.stats.find(({ stat }) => stat.name === statName)?.base_stat ?? 0
  );
}

export function getStatPercentage(value) {
  return Math.min((value / 180) * 100, 100);
}

export function getPokemonImage(pokemon) {
  return (
    pokemon.sprites.other["official-artwork"].front_default ??
    pokemon.sprites.front_default
  );
}

export function getPokemonCry(pokemon) {
  return pokemon.cries.latest ?? pokemon.cries.legacy ?? "";
}

export function normalizeSearchQuery(value) {
  const query = value.trim().toLowerCase();

  if (/^\d+$/.test(query)) {
    return String(Number(query));
  }

  return query.replaceAll(" ", "-");
}

export function createStoredPokemon(pokemon) {
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: getPokemonImage(pokemon),
    types: pokemon.types.map(({ type }) => type.name),
    abilities: pokemon.abilities.map(({ ability }) => ability.name),
    stats: {
      hp: getBaseStat(pokemon, "hp"),
      attack: getBaseStat(pokemon, "attack"),
      defense: getBaseStat(pokemon, "defense"),
    },
    height: pokemon.height,
    weight: pokemon.weight,
    cry: getPokemonCry(pokemon),
    caughtAt: new Date().toISOString(),
    note: "",
  };
}
