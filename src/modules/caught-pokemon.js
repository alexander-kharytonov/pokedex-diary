import {
  CAUGHT_POKEBALL_ICON,
  POKEBALL_ICON,
} from "./constants.js";
import {
  readCaughtPokemon,
  writeCaughtPokemon,
} from "./storage.js";
import { createCaughtPokemonCard } from "./pokemon-card.js";
import { createStoredPokemon } from "./pokemon-utils.js";

export function createCaughtPokemonCollection() {
  let caughtPokemon = readCaughtPokemon();
  const pokemonCache = new Map();

  function rememberPokemon(pokemon) {
    pokemonCache.set(pokemon.id, pokemon);
  }

  function isPokemonCaught(pokemonId) {
    return caughtPokemon.some(({ id }) => id === pokemonId);
  }

  function syncCatchButtons(pokemonId) {
    const isCaught = isPokemonCaught(pokemonId);
    const cards = document.querySelectorAll(`[data-pokemon-id="${pokemonId}"]`);

    cards.forEach((card) => {
      const button = card.querySelector("[data-catch-button]");
      const icon = button?.querySelector(".catch-icon");

      button?.classList.toggle("is-caught", isCaught);
      if (icon) {
        icon.src = isCaught ? CAUGHT_POKEBALL_ICON : POKEBALL_ICON;
        icon.alt = isCaught ? "Freilassen" : "Catch’em!";
      }
    });
  }

  function toggleCaughtPokemon(pokemonId) {
    const isCaught = isPokemonCaught(pokemonId);
    let nextCaughtPokemon;

    if (isCaught) {
      nextCaughtPokemon = caughtPokemon.filter(({ id }) => id !== pokemonId);
    } else {
      const pokemon = pokemonCache.get(pokemonId);

      if (!pokemon) return;

      nextCaughtPokemon = [...caughtPokemon, createStoredPokemon(pokemon)];
    }

    if (!writeCaughtPokemon(nextCaughtPokemon)) return;

    caughtPokemon = nextCaughtPokemon;
    syncCatchButtons(pokemonId);
  }

  return {
    rememberPokemon,
    isPokemonCaught,
    toggleCaughtPokemon,
  };
}

export function initCaughtPokemonPage() {
  const grid = document.querySelector("#caught-pokemon-grid");
  const emptyMessage = document.querySelector("#empty-pokedex-message");
  const total = document.querySelector("#pokemon-total");

  function renderCaughtPokemon() {
    const caughtPokemon = readCaughtPokemon();

    grid.innerHTML = caughtPokemon.map(createCaughtPokemonCard).join("");
    total.textContent = caughtPokemon.length;
    emptyMessage.classList.toggle("hidden", caughtPokemon.length > 0);
  }

  function saveNote(event) {
    const noteInput = event.target.closest("[data-note-id]");

    if (!noteInput) return;

    const caughtPokemon = readCaughtPokemon();
    const pokemon = caughtPokemon.find(
      ({ id }) => id === Number(noteInput.dataset.noteId),
    );

    if (!pokemon) return;

    pokemon.note = noteInput.value;
    writeCaughtPokemon(caughtPokemon);
  }

  grid.addEventListener("input", saveNote);
  renderCaughtPokemon();
}
