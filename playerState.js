// export let isFirstPlay = true;
// export let player;
// export let audioContext;

// export function initializePlayer() {
//   if (isFirstPlay) {
//     prepareAudioContext();
//     // Additional player setup as needed.
//     isFirstPlay = false;
//   }
// }

// function prepareAudioContext() {
//   if (!audioContext) {
//     const AudioContext = window.AudioContext || window.webkitAudioContext;
//     audioContext = new AudioContext();
//     // Further audio context setup.
//   }
// }

// export function togglePlayPause() {
//   if (player.paused) {
//     player.play();
//     audioContext.resume();
//   } else {
//     player.pause();
//     audioContext.suspend();
//   }
// }
