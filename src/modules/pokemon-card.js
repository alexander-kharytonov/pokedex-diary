import {
  CAUGHT_POKEBALL_ICON,
  POKEBALL_ICON,
  TYPE_IMAGE_URL,
  typeDetails,
} from "./constants.js";
import {
  capitalize,
  escapeHtml,
  getBaseStat,
  getPokemonCry,
  getPokemonImage,
  getStatPercentage,
} from "./pokemon-utils.js";

export function createTypeBadge(type) {
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

export function createPokemonCard(pokemon, isCaught = false) {
  const primaryType = pokemon.types[0].type;
  const accent = typeDetails[primaryType.name]?.[1] ?? "#64748b";
  const image = getPokemonImage(pokemon);
  const typeImage = `${TYPE_IMAGE_URL}/${primaryType.name}-mono.svg`;
  const abilities = pokemon.abilities
    .slice(0, 2)
    .map(({ ability }) => capitalize(ability.name.replaceAll("-", " ")))
    .join(", ");
  const hp = getBaseStat(pokemon, "hp");
  const attack = getBaseStat(pokemon, "attack");
  const defense = getBaseStat(pokemon, "defense");
  const cry = getPokemonCry(pokemon);
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

export function createCaughtPokemonCard(pokemon) {
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

export function createSkeletonCard(visibilityClass = "") {
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
