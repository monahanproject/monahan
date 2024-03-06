// import { generatePlayer, createAudioElement, prepareAndQueueTracks } from './play.js';

// export let player;
// export let audioContext = null;
// export let volumeNode;
// export let playButton = document.getElementById("play-button"); // Define playButton in a shared scope


// export function createVolumeSlider() {
//     const volumeSlider = document.getElementById("volume-slider");
//     if (volumeSlider) {
//         volumeSlider.type = "range";
//         volumeSlider.max = "100";
//         volumeSlider.min = "0";
//         volumeSlider.value = "75"; 
//     }
//     return volumeSlider;
// }

// export function handleVolumeChange(event) {
//     if (volumeNode !== undefined) {
//         const newVolume = parseFloat(event.target.value) / 100;
//         volumeNode.gain.value = newVolume;
//     }
// }

// export function initializePlayer() {
//     player = document.getElementById("music_player");
//     player.controls = false;

//     const playButton = document.getElementById("play-button");
//     playButton.addEventListener("click", handlePlayPauseClick);

//     const volumeSlider = createVolumeSlider();
//     if (volumeSlider) {
//         volumeSlider.addEventListener("change", handleVolumeChange);
//         document.addEventListener("DOMContentLoaded", () => {
//             handleVolumeChange({ target: { value: volumeSlider.value } });
//         });
//     }
// }

// export function prepareAudioContext() {
//     if (audioContext == null) {
//         const AudioContext = window.AudioContext || window.webkitAudioContext;
//         audioContext = new AudioContext();
//         volumeNode = audioContext.createGain();
//         volumeNode.connect(audioContext.destination);
//     }
// }


// let firstPlay = true;

// var svgContainer = document.getElementById("play-button-svg-container");
// var textContainer = document.getElementById("play-button-text-container");
//   const playIcon = document.getElementById("play-icon");
//   const pauseIcon = document.getElementById("pause-icon");
//   const skipBackwardButton = document.getElementById("skipBackwardButton");
//   const skipForwardButton = document.getElementById("skipForwardButton");

//   var playButtonTextContainer = document.getElementById("play-button-text-container");

//   const playingSVG = `<img id="play-icon" class="svg-icon" src="images/svg/playButton.svg" alt="Play Icon">`;
//   const pausedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/pauseButton.svg" alt="Pause Icon">`;

//   // Text Constants
//   const playingText = "PLAY";
//   const pausedText = "STOP";

//   function toggleButtonVisuals(playButton, isPlaying) {
//     playButtonTextContainer.style.left = isPlaying ? "50%" : "35%";
//     svgContainer.innerHTML = isPlaying ? pausedSVG : playingSVG; // Update the SVG content.
//     textContainer.textContent = isPlaying ? "STOP" : "PLAY"; // Update the button text.
//     playButton.classList.toggle("playing", isPlaying);
//     playButton.classList.toggle("paused", !isPlaying);
// }

// function handlePlayPauseClick() {
//     console.log("Entering handlePlayPauseClick function");

//     try {
//       // Existing code inside handlePlayPauseClick...
//     } catch (error) {
//       console.error("Error in handlePlayPauseClick: ", error);
//     }

//     try {
//       // Existing code inside handlePlayPauseClick...
//     } catch (error) {
//       console.error("Error in handlePlayPauseClick: ", error);
//     }

//     if (firstPlay) {
//       // playBackgroundMusic();

//       toggleButtonVisuals(playButton, true); // or false depending on the state
//       generatePlayer();
//       prepareAudioContext();
//       prepareAndQueueTracks();
//       player.play();
//       playerPlayState = "play";
//       audioContext.resume();
//       isValidTracklist(curatedTracklist);
//       firstPlay = false; // Set firstPlay to false after handling the first play
//     } else {
//       // Handle subsequent toggles between play and pause
//       if (playButton.classList.contains("playing")) {
//         console.log("Pausing");
//         toggleButtonVisuals(playButton, false); // or false depending on the state
//         player.pause();
//         playerPlayState = "pause";
//         audioContext.suspend();
//       } else {
//         console.log("Playing");
//         toggleButtonVisuals(true); // Update visuals to reflect play state
//         player.play();
//         playerPlayState = "play";
//         audioContext.resume();
//       }
//     }
//   } 

  