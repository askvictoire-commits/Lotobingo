// Shared sound utilities for LotoBingo
// Uses Web Audio API — no external files

export function playQuineSound() {
  try {
    const audio = new Audio('/quine-son.mp3');
    audio.play().catch(() => {});
  } catch {
    //
  }
}

export function playBingoSound() {
  try {
    const audio = new Audio('/bingo-son.wav');
    audio.play().catch(() => {});
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 5000);
  } catch {
    //
  }
}
