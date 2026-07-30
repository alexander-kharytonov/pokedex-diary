let activeCry = null;

export function playPokemonCry(url) {
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
