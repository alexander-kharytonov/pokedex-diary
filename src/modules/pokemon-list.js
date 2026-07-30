import { API_URL, PAGE_SIZE } from "./constants.js";
import { fetchPokemonPage } from "./api.js";
import { playPokemonCry } from "./audio.js";
import { createPokemonCard, createSkeletonCard } from "./pokemon-card.js";
import { createCaughtPokemonCollection } from "./caught-pokemon.js";
import { initPokemonSearch } from "./search.js";

export function initPokemonListPage() {
  const grid = document.querySelector("#pokemon-grid");
  const sentinel = document.querySelector("#pokemon-sentinel");
  const total = document.querySelector("#pokemon-total");
  const searchForm = document.querySelector("#pokemon-search-form");
  const searchInput = document.querySelector("#pokemon-search");
  const searchToggle = document.querySelector("#search-toggle");
  const searchToggleLabel = document.querySelector("#search-toggle-label");
  const searchDialog = document.querySelector("#search-dialog");
  const searchDialogClose = document.querySelector("#search-dialog-close");
  const searchResult = document.querySelector("#search-result");

  let nextPageUrl = `${API_URL}/pokemon?limit=${PAGE_SIZE}`;
  let isLoading = false;
  const caughtPokemon = createCaughtPokemonCollection();

  function showLoadingSkeleton() {
    sentinel.className = "grid gap-6 py-6 sm:grid-cols-2 xl:grid-cols-3";
    sentinel.innerHTML = [
      createSkeletonCard(),
      createSkeletonCard("hidden sm:block"),
      createSkeletonCard("hidden xl:block"),
    ].join("");
  }

  function showSentinelMessage(message, className = "text-slate-400") {
    sentinel.className = `py-16 text-center ${className}`;
    sentinel.textContent = message;
  }

  async function loadNextPage() {
    if (isLoading || !nextPageUrl) return;

    isLoading = true;
    showLoadingSkeleton();

    try {
      const { page, pokemon } = await fetchPokemonPage(nextPageUrl);

      pokemon.forEach(caughtPokemon.rememberPokemon);
      grid.insertAdjacentHTML(
        "beforeend",
        pokemon
          .map((pokemonItem) =>
            createPokemonCard(
              pokemonItem,
              caughtPokemon.isPokemonCaught(pokemonItem.id),
            ),
          )
          .join(""),
      );

      nextPageUrl = page.next;
      total.textContent = page.count;

      if (!nextPageUrl) {
        sentinel.replaceChildren();
        sentinel.className = "";
        observer.unobserve(sentinel);
      } else {
        sentinel.className = "h-1";
        sentinel.replaceChildren();
      }
    } catch (error) {
      showSentinelMessage(
        `${error.message}. Bitte lade die Seite neu.`,
        "text-red-400",
      );
      observer.unobserve(sentinel);
    } finally {
      isLoading = false;
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadNextPage();
    },
    { rootMargin: "500px 0px" },
  );

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-catch-button]");

    if (!button) return;

    const card = button.closest("[data-cry]");
    const pokemonId = Number(card.dataset.pokemonId);

    playPokemonCry(card.dataset.cry);
    caughtPokemon.toggleCaughtPokemon(pokemonId);
  });

  initPokemonSearch({
    searchForm,
    searchInput,
    searchToggle,
    searchToggleLabel,
    searchDialog,
    searchDialogClose,
    searchResult,
    caughtPokemon,
  });

  showLoadingSkeleton();
  observer.observe(sentinel);
}
