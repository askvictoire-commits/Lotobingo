let currentQuineAudio: HTMLAudioElement | null = null;
let currentBingoAudio: HTMLAudioElement | null = null;

export function playQuineSound() {
  try {
    if (currentQuineAudio) {
      currentQuineAudio.pause();
      currentQuineAudio.currentTime = 0;
    }
    currentQuineAudio = new Audio('/quine-son.mp3');
    currentQuineAudio.play().catch(() => {});
  } catch {
    //
  }
}

export function stopQuineSound() {
  try {
    if (currentQuineAudio) {
      currentQuineAudio.pause();
      currentQuineAudio.currentTime = 0;
    }
  } catch {}
}

export function playBingoSound() {
  try {
    if (currentBingoAudio) {
      currentBingoAudio.pause();
      currentBingoAudio.currentTime = 0;
    }
    currentBingoAudio = new Audio('/bingo-karcher.wav');
    currentBingoAudio.play().catch(() => {});
    
    setTimeout(() => {
      stopBingoSound();
    }, 10000);
  } catch {
    //
  }
}

export function stopBingoSound() {
  try {
    if (currentBingoAudio) {
      currentBingoAudio.pause();
      currentBingoAudio.currentTime = 0;
    }
  } catch {}
}
