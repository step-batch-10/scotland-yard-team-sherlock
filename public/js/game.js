globalThis.onload = async () => {
  const res = await fetch("/game/player-positions");
  const positions = await res.json();

  const map = document.getElementById("map").contentDocument;

  for (const { position, color } of positions) {
    const pointer = map.getElementById(`pointer-${position}`);
    if (pointer) {
      pointer.setAttribute("fill", color);
    }
  }
};
