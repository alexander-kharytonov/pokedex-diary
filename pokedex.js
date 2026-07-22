const STORAGE_KEY = "caughtPokemon";
const grid = document.querySelector("#caught-pokemon-grid");
const emptyMessage = document.querySelector("#empty-pokedex-message");
const total = document.querySelector("#pokemon-total");
const TYPE_IMAGE_URL = "https://unpkg.com/@pokemonle/icons-svg@0.0.3/icons";

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

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getCaughtPokemon() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function createTypeBadge(type) {
  const [name, color] = typeDetails[type] ?? [capitalize(type), "#64748b"];

  return `
    <span class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-white" style="background-color: ${color}">
      <img class="size-4 brightness-0 invert" src="${TYPE_IMAGE_URL}/${type}-mono.svg" alt="" />
      ${name}
    </span>
  `;
}

function getStatPercentage(value) {
  return Math.min((value / 180) * 100, 100);
}

function createPokemonCard(pokemon) {
  const primaryType = pokemon.types[0] ?? "normal";
  const accent = typeDetails[primaryType]?.[1] ?? "#64748b";
  const typeImage = `${TYPE_IMAGE_URL}/${primaryType}-mono.svg`;

  return `
    <article class="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div class="relative isolate h-64 bg-slate-900 p-6">
        <div class="absolute -left-16 -top-28 -z-10 h-80 w-[130%] rotate-[-8deg] rounded-[50%] opacity-80" style="background-color: ${accent}"></div>
        <p class="my-2.5 text-sm font-black tracking-widest text-white/70">ID ${String(pokemon.id).padStart(5, "0")}</p>
        <img class="absolute left-1/2 top-1/2 -z-10 w-56 -translate-x-1/2 -translate-y-1/2 brightness-0 invert opacity-15 transition duration-300 group-hover:scale-90" src="${typeImage}" alt="" />
        <img class="mx-auto h-56 w-56 object-contain drop-shadow-[0_20px_18px_rgba(15,23,42,0.4)] transition duration-300 group-hover:scale-110" src="${pokemon.image}" alt="${capitalize(pokemon.name)}" loading="lazy" />
      </div>
      <div class="p-6">
        <h2 class="text-2xl font-black tracking-tight text-white">${capitalize(pokemon.name)}</h2>
        <div class="mt-4 flex flex-wrap gap-2">${pokemon.types.map(createTypeBadge).join("")}</div>
        <div class="mt-6 space-y-4 border-t border-white/10 pt-5">
          <div>
            <div class="mb-2 flex items-center justify-between text-sm"><span class="flex items-center gap-2 font-semibold text-slate-400"><img class="size-4" src="./assets/icons/heart.svg" alt="" />KP</span><span class="font-black text-white">${pokemon.stats.hp}</span></div>
            <div class="h-2 overflow-hidden rounded-full bg-white/10"><div class="h-full rounded-full transition-[width] duration-500" style="width: ${getStatPercentage(pokemon.stats.hp)}%; background-color: ${accent}"></div></div>
          </div>
          <div>
            <div class="mb-2 flex items-center justify-between text-sm"><span class="flex items-center gap-2 font-semibold text-slate-400"><img class="size-4" src="./assets/icons/sword.svg" alt="" />Angriff</span><span class="font-black text-white">${pokemon.stats.attack}</span></div>
            <div class="h-2 overflow-hidden rounded-full bg-white/10"><div class="h-full rounded-full transition-[width] duration-500" style="width: ${getStatPercentage(pokemon.stats.attack)}%; background-color: ${accent}"></div></div>
          </div>
          <div>
            <div class="mb-2 flex items-center justify-between text-sm"><span class="flex items-center gap-2 font-semibold text-slate-400"><img class="size-4" src="./assets/icons/shield.svg" alt="" />Verteidigung</span><span class="font-black text-white">${pokemon.stats.defense}</span></div>
            <div class="h-2 overflow-hidden rounded-full bg-white/10"><div class="h-full rounded-full transition-[width] duration-500" style="width: ${getStatPercentage(pokemon.stats.defense)}%; background-color: ${accent}"></div></div>
          </div>
        </div>
        <label class="mt-6 block text-sm font-bold text-slate-200" for="note-${pokemon.id}">Persönliche Notiz</label>
        <textarea id="note-${pokemon.id}" data-note-id="${pokemon.id}" class="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400 focus:ring-4 focus:ring-red-500/10" placeholder="Schreibe hier deine Notiz...">${escapeHtml(pokemon.note ?? "")}</textarea>
      </div>
    </article>
  `;
}

function renderCaughtPokemon() {
  const caughtPokemon = getCaughtPokemon();

  grid.innerHTML = caughtPokemon.map(createPokemonCard).join("");
  total.textContent = caughtPokemon.length;
  emptyMessage.classList.toggle("hidden", caughtPokemon.length > 0);
}

function saveNote(event) {
  const noteInput = event.target.closest("[data-note-id]");

  if (!noteInput) return;

  const caughtPokemon = getCaughtPokemon();
  const pokemon = caughtPokemon.find(
    ({ id }) => id === Number(noteInput.dataset.noteId),
  );

  if (!pokemon) return;

  pokemon.note = noteInput.value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(caughtPokemon));
}

grid.addEventListener("input", saveNote);
renderCaughtPokemon();
