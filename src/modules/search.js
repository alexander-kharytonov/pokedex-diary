import { searchPokemonByQuery } from "./api.js";
import { createPokemonCard, createSkeletonCard } from "./pokemon-card.js";
import { normalizeSearchQuery } from "./pokemon-utils.js";

export function initPokemonSearch({
  searchForm,
  searchInput,
  searchToggle,
  searchToggleLabel,
  searchDialog,
  searchDialogClose,
  searchResult,
  caughtPokemon,
}) {
  let searchController = null;

  function showSearchFeedback(title, message) {
    searchResult.innerHTML = `
      <div class="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
        <img
          class="mx-auto size-14 opacity-60"
          src="./assets/icons/pokeball.svg"
          alt=""
        />
        <h3 class="mt-5 text-xl font-black text-white">${title}</h3>
        <p class="mt-2 text-sm leading-6 text-slate-400">${message}</p>
      </div>
    `;
  }

  async function searchPokemon(query) {
    searchController?.abort();
    searchController = new AbortController();
    searchResult.innerHTML = createSkeletonCard();

    if (!searchDialog.open) searchDialog.showModal();

    try {
      const pokemon = await searchPokemonByQuery(
        query,
        searchController.signal,
      );

      if (!pokemon) {
        showSearchFeedback(
          "Pokémon nicht gefunden",
          "Prüfe den Namen oder die numerische ID und versuche es erneut.",
        );

        return;
      }

      caughtPokemon.rememberPokemon(pokemon);
      searchResult.innerHTML = createPokemonCard(
        pokemon,
        caughtPokemon.isPokemonCaught(pokemon.id),
      );
    } catch (error) {
      if (error.name === "AbortError") return;

      showSearchFeedback(
        "Suche fehlgeschlagen",
        `${error.message}. Bitte versuche es später erneut.`,
      );
    }
  }

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const query = normalizeSearchQuery(searchInput.value);

    if (!query || query === "0") {
      if (!searchDialog.open) searchDialog.showModal();
      showSearchFeedback(
        "Ungültige Eingabe",
        "Gib einen Pokémon-Namen oder eine numerische ID größer als 0 ein.",
      );

      return;
    }

    searchPokemon(query);
  });

  searchToggle.addEventListener("click", () => {
    const isOpening = searchForm.classList.contains("hidden");

    searchForm.classList.toggle("hidden", !isOpening);
    searchToggleLabel.textContent = isOpening
      ? "Suche schließen"
      : "Suche öffnen";

    if (isOpening) searchInput.focus();
  });

  searchDialogClose.addEventListener("click", () => {
    searchDialog.close();
  });

  searchDialog.addEventListener("click", (event) => {
    if (event.target === searchDialog) searchDialog.close();
  });
}
