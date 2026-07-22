const STORAGE_KEY = "caughtPokemon";
const grid = document.querySelector("#caught-pokemon-grid");
const emptyMessage = document.querySelector("#empty-pokedex-message");
const total = document.querySelector("#pokemon-total");

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

function createPokemonCard(pokemon) {
  return `
    <article class="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/20">
      <div class="bg-slate-800 p-6 text-center">
        <p class="text-left text-sm font-black tracking-widest text-white/70">ID ${String(pokemon.id).padStart(5, "0")}</p>
        <img class="mx-auto h-56 w-56 object-contain drop-shadow-[0_20px_18px_rgba(15,23,42,0.4)]" src="${pokemon.image}" alt="${capitalize(pokemon.name)}" />
      </div>
      <div class="p-6">
        <h2 class="text-2xl font-black tracking-tight text-white">${capitalize(pokemon.name)}</h2>
        <p class="mt-3 text-sm font-semibold text-red-400">Typen: ${pokemon.types.map(capitalize).join(", ")}</p>
        <dl class="mt-6 grid grid-cols-3 gap-3 text-center">
          <div class="rounded-2xl bg-white/5 p-3"><dt class="text-xs font-bold text-slate-400">KP</dt><dd class="mt-1 font-black text-white">${pokemon.stats.hp}</dd></div>
          <div class="rounded-2xl bg-white/5 p-3"><dt class="text-xs font-bold text-slate-400">Angriff</dt><dd class="mt-1 font-black text-white">${pokemon.stats.attack}</dd></div>
          <div class="rounded-2xl bg-white/5 p-3"><dt class="text-xs font-bold text-slate-400">Verteidigung</dt><dd class="mt-1 font-black text-white">${pokemon.stats.defense}</dd></div>
        </dl>
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
