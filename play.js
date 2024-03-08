import { r10, r11, r12, r13, r14, r15, r16 } from "./generalRules.js";
import { r21, r22, r23, r24 } from "./ensureRules.js";
import { r61, r62, r63, r64, r65, r66, r67, r68 } from "./specificRules.js";
import {
  r10rule,
  r11rule,
  r12rule,
  r13rule,
  r14rule,
  r15rule,
  r16rule,
  r21rule,
  r22rule,
  r23rule,
  r24rule,
  r25rule,
  r61rule,
  r62rule,
  r63rule,
  r64rule,
  r65rule,
  r66rule,
  r67rule,
  r68rule,
} from "./ruleStrings.js";
import { gatherTheCreditSongs } from "./credits.js";
import { createTranscriptContainer } from "./transcript.js";
import { checkPlaylistRules } from "./checkRules.js";
// import { handleVolumeChange } from "./volumeControl.js";
import { isValidTracklist } from "./checkTracks.js";

import { shuffleTracklist, shuffleArrayOfRules } from "./shuffle.js";
import { printEntireTracklistDebug, gatherAndPrintDebugInfo } from "./debug.js";
import { followTracklistRules, logRuleApplication } from "./playlistBuilder.js";


// window.addEventListener("load", () => {

let myLang = localStorage["lang"] || "defaultValue";
let player;
let audioContext = null;
let volumeNode;
let playerPlayState = "play";
let hasSkippedToEnd = false;
let displayConsoleLog = "<br>";
export let curatedTracklistTotalTimeInSecs;
curatedTracklistTotalTimeInSecs = 0;
let curatedTracklistTotalTimeInMins;
export let curatedTracklist;
let timerDuration = 0;

let currentIndex = 0; // Initialize to 0, assuming the first track in the playlist
export const MAX_PLAYLIST_DURATION_SECONDS = 1140; //(19m)

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXX generate player  XXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

let globalAudioElement = document.createElement("audio");
globalAudioElement.controls = false; // Assuming want to keep it headless


//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXX SET UP THE PLAYER  XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

player = document.getElementById("music_player");
player.controls = false;

let playButton = document.getElementById("play-button");
const svgContainer = document.getElementById("play-button-svg-container");
const textContainer = document.getElementById("play-button-text-container");
const skipBackwardButton = document.getElementById("skipBackwardButton");
const skipForwardButton = document.getElementById("skipForwardButton");


function handleSkipForwardClick() {
  const skipAmount = 20; // seconds
  if (!isNaN(globalAudioElement.duration)) {
    // Calculate new time without exceeding the track's duration
    const newTime = Math.min(globalAudioElement.currentTime + skipAmount, globalAudioElement.duration);
    globalAudioElement.currentTime = newTime;
    
    console.log(`Skipped Forward. CurrentTime: ${newTime}, Duration: ${globalAudioElement.duration}`);
  } else {
    console.error('Skipping failed: Duration is not available.');
  }
}


function createVolumeSlider() {
  const volumeSlider = document.getElementById("volume-slider");
  if (volumeSlider) {
    volumeSlider.type = "range";
    volumeSlider.max = "100";
    volumeSlider.min = "0";
    volumeSlider.value = "75";
  }
  return volumeSlider;
}
const volumeSlider = createVolumeSlider();

function handleVolumeChange(event) {
  const newVolume = parseFloat(event.target.value) / 100;
  globalAudioElement.volume = newVolume; // Directly set the volume on the global audio element
}

if (volumeSlider) {
  volumeSlider.addEventListener("change", handleVolumeChange);
  document.addEventListener("DOMContentLoaded", () => {
    handleVolumeChange({ target: { value: volumeSlider.value } });
  });
}



function handleSkipBackwardClick() {
  const skipAmount = -20; // seconds (negative for backward)
  const newTime = Math.max(globalAudioElement.currentTime + skipAmount, 0);
  globalAudioElement.currentTime = newTime;
  
  // Adjust cumulativeElapsedTime for the skip, ensuring it doesn't go negative
  cumulativeElapsedTime = Math.max(0, cumulativeElapsedTime + skipAmount); // Note: skipAmount is negative for backward skips
  updateProgressUI();
}

playButton.addEventListener("click", handlePlayPauseClick);
skipBackwardButton.addEventListener("click", handleSkipBackwardClick);
skipForwardButton.addEventListener("click", handleSkipForwardClick);
volumeSlider.addEventListener("change", handleVolumeChange);


// https://css-tricks.com/lets-create-a-custom-audio-player/
function createHTMLMusicPlayer() {}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXX  TIMER  XXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

let cumulativeElapsedTime = 0; // Reset when a new playlist is loaded or when needed
let totalPlaylistDuration = 0; // Initialize

// handles the scenario when the timer completes
function handleTimerCompletion() {
  const timeRemainingElement = document.getElementById("time-remaining");
  if (!timeRemainingElement) {
    console.error("Error: Missing element 'time-remaining'");
    return; // Exit the function to prevent further errors
  }
  timeRemainingElement.innerHTML = "Done";
}

function calculateMinutesAndSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60); // Round seconds to avoid float
  return {
    minutes: minutes,
    seconds: remainingSeconds.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    }),
  };
}

function updateProgressUI() {
  let elapsedSecondsInCurrentTrack = Math.round(globalAudioElement.currentTime);
  let totalElapsedSeconds = Math.round(cumulativeElapsedTime) + elapsedSecondsInCurrentTrack;
  let remainingSeconds = totalPlaylistDuration - totalElapsedSeconds;

  // Ensure playedPercentage does not exceed 100%
  let playedPercentage = Math.min((totalElapsedSeconds / totalPlaylistDuration) * 100, 100);

  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    progressBar.style.width = `${playedPercentage}%`;
  }

  const progressDot = document.getElementById("progress-dot");
  if (progressDot) {
    // Ensure the progress dot does not go past the end of the progress bar
    progressDot.style.left = `calc(${Math.min(playedPercentage, 100)}% - 5px)`;
  }

  // Recalculate minutes and seconds for both played and remaining times
  const playedTime = calculateMinutesAndSeconds(totalElapsedSeconds);
  // Prevent displaying negative remaining time
  const adjustedRemainingSeconds = Math.max(0, remainingSeconds);
  const remainingTimeDisplay = calculateMinutesAndSeconds(adjustedRemainingSeconds);

  // Updating the time played element
  const timePlayedElement = document.getElementById("time-played");
  if (timePlayedElement) {
    timePlayedElement.innerText = `${playedTime.minutes}:${playedTime.seconds}`;
  }

  // Update the remaining time element, preventing it from showing negative values
  const timeRemainingElement = document.getElementById("time-remaining");
  if (timeRemainingElement) {
    timeRemainingElement.innerText = `-${remainingTimeDisplay.minutes}:${remainingTimeDisplay.seconds}`;
  }
}


let isPlaying = false; // A flag to manage the playback state

function handlePlay() {
  isPlaying = true;
  toggleButtonVisuals(true);
}

function handlePause() {
  isPlaying = false;
  toggleButtonVisuals(false);
}

function handleEnded() {
  // let trackActualDuration = curatedTracklist[currentIndex].duration; // This needs to be determined based on the actual data structure


  isPlaying = false; // Update state when a track ends
  toggleButtonVisuals(false); // Ensure UI reflects this state

  console.log(`Before End - CumulativeElapsedTime: ${cumulativeElapsedTime}, Track Duration: ${Math.round(globalAudioElement.duration)}`);
  cumulativeElapsedTime += Math.round(globalAudioElement.duration); // Ensure it's rounded to the nearest second for consistency
  console.log(`After End - CumulativeElapsedTime: ${cumulativeElapsedTime}`);

  handleTimerCompletion(); // Proceed with timer completion logic
  updateProgressUI(); // Reflect changes in the UI
}


function setupAudioEventHandlers() {
  globalAudioElement.onplay = handlePlay;
  globalAudioElement.onpause = handlePause;
  globalAudioElement.onended = handleEnded;
  globalAudioElement.ontimeupdate = updateProgressUI;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX AUDIO CACHING SO WE DOWNLOAD SONGS AS WE GO XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* fetchAndCacheAudio takes an audioFileUrl and a cache object as input. The 
function checks if the audio file is already in the cache, and if not, fetches it from the network, 
adds it to the cache, and returns the audio response. */

function fetchAndCacheAudio(audioFileUrl, cache) {
  return cache.match(audioFileUrl).then((cacheResponse) => {
    if (cacheResponse) {
      return cacheResponse;
    }
    return fetch(audioFileUrl).then((networkResponse) => {
      cache.put(audioFileUrl, networkResponse.clone());
      return networkResponse;
    });
  });
}
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXX CREATE EACH SONG! XXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* Takes a song object as input, create an audio element for the song's URL, 
assignS it to the song.audio property, and returns the modified song object.*/

export const prepareSongForPlayback = (song) => {
  return song;
};

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX CREATE OUTRO AUDIO! XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* Define two more arrays outroAudioSounds and finalOutroAudioSounds, each containing an object
   representing an outro track. Each object is processed using the prepareSongForPlayback function. */

const outroAudioSounds = [
  {
    name: "OUTRO2PT1SOLO",
    url: "./sounds/INTRO_OUTRO_NAMES/OUTRO_2.1.mp3",
    duration: 4,
    author: "",
    form: "",
    placement: [""],
    length: "",
    language: "",
    sentiment: "",
    tags: ["outro"],
    backgroundMusic: "",
    credit: "",
    engTrans: "[TODO.]",
    frTrans: "[TODO.]",
  },
].map(prepareSongForPlayback);

const finalOutroAudioSounds = [
  {
    name: "OUTRO2PT2withMUSIC",
    url: "./sounds/INTRO_OUTRO_NAMES/OUTRO_2.2_MUSIC.mp3",
    duration: 30,
    author: "",
    form: "",
    placement: [""],
    length: "",
    language: "",
    sentiment: "",
    tags: ["outro"],
    backgroundMusic: "",
    credit: "",
  },
].map(prepareSongForPlayback);

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX GET THE SONGS & TURN THEM INTO SONG OBJECTS! XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* Define an array SONGS containing multiple song objects, each song object is 
  processed using the prepareSongForPlayback function. */

let songs;

async function loadSongs() {
  try {
    const response = await fetch("songs.json");
    const data = await response.json();
    songs = data.map(prepareSongForPlayback);
    // Now we can use songs
    const allSongs = [...songs];
    // ... rest of the code that uses allSongs
  } catch (error) {
    console.error("Error loading JSON data:", error);
  }
}

loadSongs();


//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX ✉️ queue next track XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX


// first time is queueNextTrack(curatedTracklist, 0, 0, cache));
function queueNextTrack(songs, index, currentRuntime, cache) {
  try {
    if (index >= songs.length) {
      console.log("Finished playing all tracks.");
      return; // Exit if no more songs to queue
    }

    const song = songs[index];
    console.log(`Queueing and playing song: ${song.name}, Index: ${index}, Current Runtime: ${currentRuntime}`);

    currentIndex = index; // Update the global currentIndex with the current track's index

    // Set the global audio element's source to the current song's URL
    globalAudioElement.src = song.url;
    // No need for "preload" property since "play()" immediately requests the audio

    globalAudioElement.onended = () => {
      console.log(`Finished playing: ${song.name}`);
      // Calculate the new current runtime, if necessary
      const duration = song.duration;
      cumulativeElapsedTime += globalAudioElement.duration;
      logRuleApplication(`xxx duration is ${duration}`);
      timerDuration += Math.floor(duration); // Update currentRuntime with the cumulative duration

      const newCurrentRuntime = currentRuntime + (song.duration ? parseInt(song.duration, 10) : 0);
      queueNextTrack(songs, index + 1, newCurrentRuntime, cache); // Proceed to next song
    };

    // Immediately try to play the loaded song
    globalAudioElement.play().catch((error) => {
      console.error(`Playback failed for ${song.name}: `, error);
    });

    // Preload the next song in advance, if applicable
    if (index + 1 < songs.length) {
      const nextSong = songs[index + 1];
      fetchAndCacheAudio(nextSong.url, cache).then(() => console.log(`Pre-cached: ${nextSong.url}`));
    }
  } catch (error) {
    console.error("An error occurred in queueNextTrack:", error);
  }
}

let firstPlay = true;
var playButtonTextContainer = document.getElementById("play-button-text-container");

const playingSVG = `<img id="play-icon" class="svg-icon" src="images/svg/playButton.svg" alt="Play Icon">`;
const pausedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/pauseButton.svg" alt="Pause Icon">`;

// Text Constants
const playingText = "PLAY";
const pausedText = "STOP";

function toggleButtonVisuals(isPlaying) {
  playButtonTextContainer.style.left = isPlaying ? "50%" : "35%";
  svgContainer.innerHTML = isPlaying ? pausedSVG : playingSVG;
  textContainer.textContent = isPlaying ? "STOP" : "PLAY";
  playButton.classList.toggle("playing", isPlaying);
  playButton.classList.toggle("paused", !isPlaying);
}

if ("mediaSession" in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: "Track Title",
    artist: "Track Artist",
    album: "Track Album",
    // artwork: [{ src: "track-artwork.jpg", sizes: "512x512", type: "image/jpeg" }]
  });

  navigator.mediaSession.setActionHandler("play", function () {
    /* Handle play */
  });
  navigator.mediaSession.setActionHandler("pause", function () {
    /* Handle pause */
  });
}

function prepareAudioContext() {
  if (audioContext == null) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    volumeNode = audioContext.createGain();
    volumeNode.connect(audioContext.destination);
  }
}

function addOutrosAndCreditsToTracklist(curatedTracklist) {
  curatedTracklist.push(...outroAudioSounds.map(prepareSongForPlayback));
  curatedTracklist.push(...gatherTheCreditSongs(curatedTracklist));
  curatedTracklist.push(...finalOutroAudioSounds.map(prepareSongForPlayback));
  return curatedTracklist;
}

function secondsToMinutesAndSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`; // Pads the seconds with a leading zero if necessary
}


function prepareAndQueueTracks() {
  const allSongs = [...songs];
  const shuffledSongs = shuffleTracklist(allSongs);
  curatedTracklist = followTracklistRules(shuffledSongs);
  checkPlaylistRules(curatedTracklist);
  curatedTracklist = addOutrosAndCreditsToTracklist(curatedTracklist);
  totalPlaylistDuration = 0;
  console.log(curatedTracklist);

  for (let i = 0; i < curatedTracklist.length; i++) {
    const track = curatedTracklist[i];
    totalPlaylistDuration += Number(track.duration);
  }

  console.log(`Totalplaylistdur is ${secondsToMinutesAndSeconds(totalPlaylistDuration)}`); // Log the total duration in a readable format

  cumulativeElapsedTime = 0; // Reset for the new playlist

  globalAudioElement.ontimeupdate = () => {
    updateProgressUI();
  };

  createTranscriptContainer();
  printEntireTracklistDebug(curatedTracklist);

  window.caches.open("audio-pre-cache").then((cache) => queueNextTrack(curatedTracklist, 0, 0, cache));
}

function handlePlayPauseClick() {

  if (firstPlay) {
    prepareAudioContext(); // Ensure the audio context is ready
    prepareAndQueueTracks();
    firstPlay = false; // Prevent initialization from running again
  }

  if (globalAudioElement.paused) {
    console.log("Playing");
    globalAudioElement
      .play()
      .then(() => {
        console.log("Playback started");
        isPlaying = true; // Correctly update isPlaying here
        toggleButtonVisuals(true); // Reflect playing state in UI
      })
      .catch((error) => {
        console.error("Error starting playback:", error);
      });
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
  } else {
    console.log("Pausing");
    globalAudioElement.pause();
    isPlaying = false; // Ensure isPlaying is updated when pausing
    toggleButtonVisuals(false); // Reflect paused state in UI
    if (audioContext) {
      audioContext.suspend(); // Correctly suspend the audio context if not playing
    }
  }
}

// });
