import {
  API_URL,
  TYPE_IMAGE_URL,
  PAGE_SIZE,
  CAUGHT_POKEMON_KEY,
  POKEBALL_ICON,
  CAUGHT_POKEBALL_ICON,
  typeDetails,
} from "./src/modules/constants.js";

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
const STORAGE_KEY = "caughtPokemon";

let nextPageUrl = `${API_URL}/pokemon?limit=${PAGE_SIZE}`;
let isLoading = false;
let loadedPokemon = 0;
let activeCry = null;
let searchController = null;
let caughtPokemon = readCaughtPokemon();

const pokemonCache = new Map();

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

function createTypeBadge(type) {
  const [name, color] = typeDetails[type] ?? [capitalize(type), "#64748b"];

  return `
    <span
      class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-white"
      style="background-color: ${color}"
    >
      <img
        class="size-4 brightness-0 invert"
        src="${TYPE_IMAGE_URL}/${type}-mono.svg"
        alt=""
      />
      ${name}
    </span>
  `;
}

function getBaseStat(pokemon, statName) {
  return (
    pokemon.stats.find(({ stat }) => stat.name === statName)?.base_stat ?? 0
  );
}

function getStatPercentage(value) {
  return Math.min((value / 180) * 100, 100);
}

function readCaughtPokemon() {
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

function writeCaughtPokemon(pokemon) {
  try {
    localStorage.setItem(CAUGHT_POKEMON_KEY, JSON.stringify(pokemon));
    return true;
  } catch (error) {
    console.warn("Gefangene Pokémon konnten nicht gespeichert werden.", error);
    return false;
  }
}

function isPokemonCaught(pokemonId) {
  return caughtPokemon.some(({ id }) => id === pokemonId);
}

function createStoredPokemon(pokemon) {
  const image =
    pokemon.sprites.other["official-artwork"].front_default ??
    pokemon.sprites.front_default;

  return {
    id: pokemon.id,
    name: pokemon.name,
    image,
    types: pokemon.types.map(({ type }) => type.name),
    abilities: pokemon.abilities.map(({ ability }) => ability.name),
    stats: {
      hp: getBaseStat(pokemon, "hp"),
      attack: getBaseStat(pokemon, "attack"),
      defense: getBaseStat(pokemon, "defense"),
    },
    height: pokemon.height,
    weight: pokemon.weight,
    cry: pokemon.cries.latest ?? pokemon.cries.legacy ?? "",
    caughtAt: new Date().toISOString(),
    note: "",
  };
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

function createPokemonCard(pokemon) {
  pokemonCache.set(pokemon.id, pokemon);

  const primaryType = pokemon.types[0].type;
  const accent = typeDetails[primaryType.name]?.[1] ?? "#64748b";
  const image =
    pokemon.sprites.other["official-artwork"].front_default ??
    pokemon.sprites.front_default;
  const typeImage = `${TYPE_IMAGE_URL}/${primaryType.name}-mono.svg`;
  const abilities = pokemon.abilities
    .slice(0, 2)
    .map(({ ability }) => capitalize(ability.name.replaceAll("-", " ")))
    .join(", ");
  const hp = getBaseStat(pokemon, "hp");
  const attack = getBaseStat(pokemon, "attack");
  const defense = getBaseStat(pokemon, "defense");
  const cry = pokemon.cries.latest ?? pokemon.cries.legacy ?? "";
  const isCaught = isPokemonCaught(pokemon.id);
  const caughtClass = isCaught ? "is-caught" : "";

  return `
    <article
      class="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-white/20"
      data-cry="${cry}"
      data-pokemon-id="${pokemon.id}"
    >
      <div
        class="relative isolate h-64 bg-slate-900 p-6"
      >
        <div
          class="absolute -left-16 -top-28 -z-10 h-80 w-[130%] rotate-[-8deg] rounded-[50%] opacity-80"
          style="background-color: ${accent}"
        ></div>
        <div class="my-2.5 text-sm font-black tracking-widest text-white/70">
          ID ${String(pokemon.id).padStart(5, "0")}
        </div>
        <button
          class="catch-button ${caughtClass} absolute right-5 top-5 grid size-12 cursor-pointer place-items-center rounded-full border border-transparent bg-slate-950/20 backdrop-blur-sm transition hover:bg-red-500"
          type="button"
          data-catch-button
        >
          <img
            class="catch-icon size-8"
            src="${isCaught ? CAUGHT_POKEBALL_ICON : POKEBALL_ICON}"
            alt="${isCaught ? "Freilassen" : "Catch’em!"}"
          />
          <span
            class="caught-indicator absolute -bottom-1 -right-1 hidden size-5 place-items-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40"
          >
            <img
              class="size-3"
              src="./assets/icons/check.svg"
              alt=""
            />
          </span>
        </button>
        <img
          class="absolute left-1/2 top-1/2 -z-10 w-56 -translate-x-1/2 -translate-y-1/2 brightness-0 invert opacity-15 transition duration-300 group-hover:scale-90"
          src="${typeImage}"
          alt=""
        />
        <img
          class="mx-auto h-56 w-56 object-contain drop-shadow-[0_20px_18px_rgba(15,23,42,0.4)] transition duration-300 group-hover:scale-110"
          src="${image}"
          alt="${capitalize(pokemon.name)}"
          loading="lazy"
        />
      </div>
      <div class="p-6">
        <h2 class="text-2xl font-black tracking-tight text-white">
          ${capitalize(pokemon.name)}
        </h2>
        <div class="mt-4 flex flex-wrap gap-2">
          ${pokemon.types
            .map(({ type }) => createTypeBadge(type.name))
            .join("")}
        </div>
        <div class="mt-6 space-y-4 border-t border-white/10 pt-5">
          <div>
            <div class="mb-2 flex items-center justify-between text-sm">
              <span class="flex items-center gap-2 font-semibold text-slate-400">
                <img
                  class="size-4"
                  src="./assets/icons/heart.svg"
                  alt=""
                />
                KP
              </span>
              <span class="font-black text-white">${hp}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                class="h-full rounded-full transition-[width] duration-500"
                style="width: ${getStatPercentage(hp)}%; background-color: ${accent}"
              ></div>
            </div>
          </div>
          <div>
            <div class="mb-2 flex items-center justify-between text-sm">
              <span class="flex items-center gap-2 font-semibold text-slate-400">
                <img
                  class="size-4"
                  src="./assets/icons/sword.svg"
                  alt=""
                />
                Angriff
              </span>
              <span class="font-black text-white">${attack}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                class="h-full rounded-full transition-[width] duration-500"
                style="width: ${getStatPercentage(attack)}%; background-color: ${accent}"
              ></div>
            </div>
          </div>
          <div>
            <div class="mb-2 flex items-center justify-between text-sm">
              <span class="flex items-center gap-2 font-semibold text-slate-400">
                <img
                  class="size-4"
                  src="./assets/icons/shield.svg"
                  alt=""
                />
                Verteidigung
              </span>
              <span class="font-black text-white">${defense}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                class="h-full rounded-full transition-[width] duration-500"
                style="width: ${getStatPercentage(defense)}%; background-color: ${accent}"
              ></div>
            </div>
          </div>
        </div>
        <dl class="mt-6 grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-white/5 p-3">
            <dt
              class="text-[11px] font-bold uppercase tracking-wider text-slate-500"
            >
              Gewicht
            </dt>
            <dd class="mt-1 font-bold text-slate-100">
              ${(pokemon.weight / 10).toLocaleString("de-DE")} kg
            </dd>
          </div>
          <div class="rounded-2xl bg-white/5 p-3">
            <dt
              class="text-[11px] font-bold uppercase tracking-wider text-slate-500"
            >
              Größe
            </dt>
            <dd class="mt-1 font-bold text-slate-100">
              ${(pokemon.height / 10).toLocaleString("de-DE")} m
            </dd>
          </div>
          <div class="col-span-2 rounded-2xl bg-white/5 p-3">
            <dt
              class="text-[11px] font-bold uppercase tracking-wider text-slate-500"
            >
              Fähigkeiten
            </dt>
            <dd class="mt-1 truncate font-bold text-slate-100">
              ${abilities}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  `;
}

function playPokemonCry(url) {
  if (!url) return;

  if (activeCry) {
    activeCry.pause();
    activeCry.currentTime = 0;
  }

  activeCry = new Audio(url);
  activeCry.volume = 0.15;
  activeCry.play().catch(() => {
    console.warn("Die Audiodatei konnte nicht abgespielt werden.");
  });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-catch-button]");

  if (!button) return;

  const card = button.closest("[data-cry]");
  const pokemonId = Number(card.dataset.pokemonId);

  playPokemonCry(card.dataset.cry);
  toggleCaughtPokemon(pokemonId);
});

async function fetchPokemonDetails(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Pokémon-Details konnten nicht geladen werden");
  }

  return response.json();
}

function createSkeletonCard(visibilityClass = "") {
  return `
    <div
      class="animate-pulse overflow-hidden rounded-3xl border border-white/10 bg-slate-900 ${visibilityClass}"
    >
      <div class="h-64 bg-slate-800"></div>
      <div class="space-y-5 p-6">
        <div class="h-7 w-2/3 rounded-lg bg-white/10"></div>
        <div class="flex gap-2">
          <div class="h-7 w-20 rounded-full bg-white/10"></div>
          <div class="h-7 w-24 rounded-full bg-white/10"></div>
        </div>
        <div class="space-y-3 border-t border-white/10 pt-5">
          <div class="h-3 rounded-full bg-white/10"></div>
          <div class="h-3 w-4/5 rounded-full bg-white/10"></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="h-16 rounded-2xl bg-white/5"></div>
          <div class="h-16 rounded-2xl bg-white/5"></div>
          <div class="col-span-2 h-16 rounded-2xl bg-white/5"></div>
        </div>
      </div>
    </div>
  `;
}

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

function normalizeSearchQuery(value) {
  const query = value.trim().toLowerCase();

  if (/^\d+$/.test(query)) {
    return String(Number(query));
  }

  return query.replaceAll(" ", "-");
}

async function searchPokemon(query) {
  searchController?.abort();
  searchController = new AbortController();
  searchResult.innerHTML = createSkeletonCard();

  if (!searchDialog.open) searchDialog.showModal();

  try {
    const response = await fetch(
      `${API_URL}/pokemon/${encodeURIComponent(query)}`,
      { signal: searchController.signal },
    );

    if (response.status === 404) {
      showSearchFeedback(
        "Pokémon nicht gefunden",
        "Prüfe den Namen oder die numerische ID und versuche es erneut.",
      );

      return;
    }

    if (!response.ok) {
      throw new Error("Die Suche konnte nicht ausgeführt werden");
    }

    const pokemon = await response.json();
    searchResult.innerHTML = createPokemonCard(pokemon);
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

async function loadNextPage() {
  if (isLoading || !nextPageUrl) return;

  isLoading = true;
  showLoadingSkeleton();

  try {
    const response = await fetch(nextPageUrl);

    if (!response.ok) {
      throw new Error("Pokémon konnten nicht geladen werden");
    }

    const page = await response.json();
    const pokemon = await Promise.all(
      page.results.map(({ url }) => fetchPokemonDetails(url)),
    );

    grid.insertAdjacentHTML(
      "beforeend",
      pokemon.map(createPokemonCard).join(""),
    );

    loadedPokemon += pokemon.length;
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

showLoadingSkeleton();
observer.observe(sentinel);
