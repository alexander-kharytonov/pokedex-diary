const API_URL = "https://pokeapi.co/api/v2";
const TYPE_IMAGE_URL = "https://unpkg.com/@pokemonle/icons-svg@0.0.3/icons";
const PAGE_SIZE = 12;

const typeDetails = {
  normal: ["Normal", "#a8a29e"],
  fire: ["Feuer", "#f97316"],
  water: ["Wasser", "#3b82f6"],
  electric: ["Elektro", "#eab308"],
  grass: ["Pflanze", "#22c55e"],
  ice: ["Eis", "#06b6d4"],
  fighting: ["Kampf", "#dc2626"],
  poison: ["Gift", "#a855f7"],
  ground: ["Boden", "#ca8a04"],
  flying: ["Flug", "#818cf8"],
  psychic: ["Psycho", "#ec4899"],
  bug: ["Käfer", "#84cc16"],
  rock: ["Gestein", "#a16207"],
  ghost: ["Geist", "#7c3aed"],
  dragon: ["Drache", "#6366f1"],
  dark: ["Unlicht", "#57534e"],
  steel: ["Stahl", "#64748b"],
  fairy: ["Fee", "#f472b6"],
};

const grid = document.querySelector("#pokemon-grid");
const sentinel = document.querySelector("#pokemon-sentinel");
const total = document.querySelector("#pokemon-total");

let nextPageUrl = `${API_URL}/pokemon?limit=${PAGE_SIZE}`;
let isLoading = false;
let loadedPokemon = 0;

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

function createPokemonCard(pokemon) {
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

  return `
    <article
      class="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-white/20"
    >
      <div
        class="relative isolate h-64 bg-slate-900 p-6"
      >
        <div
          class="absolute -left-16 -top-28 -z-10 h-80 w-[130%] rotate-[-8deg] rounded-[50%] opacity-80"
          style="background-color: ${accent}"
        ></div>
        <span class="text-sm font-black tracking-widest text-white/70">
          N°${String(pokemon.id).padStart(4, "0")}
        </span>
        <button
          class="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-slate-950/20 text-2xl text-white backdrop-blur-sm transition cursor-pointer hover:bg-red-500"
          type="button"
        >
          ♡
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
      showSentinelMessage("Alle Pokémon wurden geladen.");
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
