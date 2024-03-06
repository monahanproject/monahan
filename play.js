// import {  } from "./playerSetup.js";

import { r10, r11, r12, r13, r14, r15, r16 } from "./generalRules.js";
import { r21, r22, r23, r24 } from "./ensureRules.js";
import { r61, r62, r63, r64, r65, r66, r67, r68 } from "./specificRules.js";
import { r25 } from "./geeseRule.js";
import { r10rule, r11rule, r12rule, r13rule, r14rule, r15rule, r16rule, r21rule, r22rule, r23rule, r24rule, r25rule, r61rule, r62rule, r63rule, r64rule, r65rule, r66rule, r67rule, r68rule } from "./ruleStrings.js";
import { gatherTheCreditSongs } from "./credits.js";
import { createTranscriptContainer } from "./transcript.js";
import { checkPlaylistRules } from "./checkRules.js";
import { isValidTracklist } from "./checkTracks.js";
import { shuffleTracklist, shuffleArrayOfRules } from "./shuffle.js";
import { printEntireTracklistDebug, gatherAndPrintDebugInfo } from "./debug.js";
import { followTracklistRules } from "./playlistBuilder.js";


// need to add the credit durations to the duration

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
let curatedTracklist;
let timerDuration = 0;

let remainingTime;
let geeseTrackCounter;

export const MAX_PLAYLIST_DURATION_SECONDS = 1140; //(19m)
// 1140
var totalDurationSeconds = 2140; //(19m)
let currentTimeElement; // Element to display current time
const PREFETCH_BUFFER_SECONDS = 8; /* set how many seconds before a song is completed to pre-fetch the next song */



export const timerStateManager = {
  getTimerDuration: () => timerDuration,
  setTimerDuration: (newTimerDuration) => timerDuration = newTimerDuration,

  getPlayer: () => player,
  setPlayer: (newPlayer) => player = newPlayer,
  getTimeSecs: () => curatedTracklistTotalTimeInSecs,
  setTimeSecs: (newTimeSecs) => curatedTracklistTotalTimeInSecs = newTimeSecs,
  getDurSecs: () => totalDurationSeconds,
  setDurSecs: (newDurSecs) => totalDurationSeconds = newDurSecs,
  getRemTime: () => totalDurationSeconds,
  setRemTime: (newRemTime) => remainingTime = newRemTime,
};

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXX SET UP THE PLAYER  XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX



player = document.getElementById("music_player");
player.controls = false;

const playButton = document.getElementById("play-button");
var svgContainer = document.getElementById("play-button-svg-container");
var textContainer = document.getElementById("play-button-text-container");
const playIcon = document.getElementById("play-icon");
const pauseIcon = document.getElementById("pause-icon");
const skipBackwardButton = document.getElementById("skipBackwardButton");
const skipForwardButton = document.getElementById("skipForwardButton");
const trackNameContainer = document.getElementById("playerTrackNameContainer");

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
  if (volumeNode !== undefined) {
    const newVolume = parseFloat(event.target.value) / 100;
    volumeNode.gain.value = newVolume;
  }
}

if (volumeSlider) {
  volumeSlider.addEventListener("change", handleVolumeChange);
  document.addEventListener("DOMContentLoaded", () => {
    handleVolumeChange({ target: { value: volumeSlider.value } });
  });
}

let isUpdatingTime = false; // Flag to prevent rapid updates

function handleSkipForwardClick() {
  let newPlayerTime = player.currentTime + 20;
  newPlayerTime = Math.min(newPlayerTime, totalDurationSeconds);
  if (!isUpdatingTime) {
    isUpdatingTime = true; // Set a flag to prevent rapid updates
    setTimeout(() => {
      player.currentTime = newPlayerTime;
      isUpdatingTime = false;
    }, 20); // Adjust the delay as needed (100 milliseconds in this case)
  }
}

function handleSkipBackwardClick() {
  let newPlayerTime = player.currentTime - 20;
  newPlayerTime = Math.min(newPlayerTime, totalDurationSeconds);
  if (!isUpdatingTime) {
    isUpdatingTime = true; // Set a flag to prevent rapid updates
    setTimeout(() => {
      player.currentTime = newPlayerTime;
      isUpdatingTime = false;
    }, 20); // Adjust the delay as needed (100 milliseconds in this case)
  }
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

function updateProgressTimerr(elapsedSeconds, previousDuration) {
  const progressBar = document.getElementById("progress-bar");
  const progressDot = document.getElementById("progress-dot");
  const timePlayedElement = document.getElementById("time-played");
  const timeRemainingElement = document.getElementById("time-remaining");

  if (!timePlayedElement || !timeRemainingElement || !progressBar || !progressDot) {
    console.error("Error: Missing elements");
    return;
  }

  totalDurationSeconds = curatedTracklistTotalTimeInSecs;
  const remainingDurationSeconds = totalDurationSeconds - (elapsedSeconds + previousDuration);

  // Calculate the percentage of the track that's been played
  const playedPercentage = ((elapsedSeconds + previousDuration) / totalDurationSeconds) * 100;

  // Update the progress bar and dot
  progressBar.style.width = `${playedPercentage}%`;
  progressDot.style.left = `calc(${playedPercentage}% - 5px)`; // Adjust based on the dot's size

  // Update the time labels
  const playedTime = calculateMinutesAndSeconds(elapsedSeconds + previousDuration);
  const remainingTime = calculateMinutesAndSeconds(remainingDurationSeconds);

  timePlayedElement.innerText = `${playedTime.minutes}:${playedTime.seconds}`;
  timeRemainingElement.innerText = `-${remainingTime.minutes}:${remainingTime.seconds}`;
}

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
  const remainingSeconds = (seconds % 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  return { minutes, seconds: remainingSeconds };
}

function calculateRemainingTime(elapsedSeconds) {
  return totalDurationSeconds - elapsedSeconds;
}

function createTimerLoopAndUpdateProgressTimer() {
  var start = Date.now(); // Record the start time of the loop
  return setInterval(() => {
    let delta = Date.now() - start; // Calculate elapsed milliseconds
    let deltaSeconds = Math.floor(delta / 1000); // Convert milliseconds to seconds
    updateProgressTimerr(Math.floor(player.currentTime), timerDuration);
    remainingTime = calculateRemainingTime(deltaSeconds);
  }, 1000); // Run the loop every x milliseconds
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXX generate player  XXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function generatePlayer() {}

// Function to create an audio element
function createAudioElement(url) {
  // const audio = new Audio();
  const audio = document.createElement("audio");
  audio.preload = "none";
  audio.src = url;
  // audio.id = id;
  audio.controls = false;
  return audio;
}

function updateTheStatusMessage(element, message) {
  element.innerHTML = message;
}

function removeAnElementByID(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.remove();
  }
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX AUDIO CACHING SO WE DOWNLOAD SONGS AS WE GO XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* fetchAndCacheAudio takes an audioFileUrl and a cache object as input. The 
function checks if the audio file is already in the cache, and if not, fetches it from the network, 
adds it to the cache, and returns the audio response. */

function fetchAndCacheAudio(audioFileUrl, cache) {
  // Check first if audio is in the cache.
  return cache.match(audioFileUrl).then((cacheResponse) => {
    // return cached response if audio is already in the cache.
    if (cacheResponse) {
      return cacheResponse;
    }
    // Otherwise, fetch the audio from the network.
    return fetch(audioFileUrl).then((networkResponse) => {
      // Add the response to the cache and return network response in parallel.
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

export const addAudioFromUrl = (song) => {
  song.audio = createAudioElement(song.url);
  // song.audio = createAudioElement("./sounds/CONTENT/S_DEMI_14.mp3");
  return song;
};

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX CREATE OUTRO AUDIO! XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* Define two more arrays outroAudioSounds and finalOutroAudioSounds, each containing an object
   representing an outro track. Each object is processed using the addAudioFromUrl function. */

const outroAudioSounds = [
  {
    name: "OUTRO2PT1SOLO",
    url: "./sounds/INTRO_OUTRO_NAMES/OUTRO_2.1.mp3",
    duration: 6,
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
].map(addAudioFromUrl);

const finalOutroAudioSounds = [
  {
    name: "OUTRO2PT2withMUSIC",
    url: "./sounds/INTRO_OUTRO_NAMES/OUTRO_2.2_MUSIC.mp3",
    duration: 6,
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
].map(addAudioFromUrl);

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX GET OUR SONGS & TURN THEM INTO SONG OBJECTS! XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* Define an array SONGS containing multiple song objects, each song object is 
  processed using the addAudioFromUrl function. */

let songs;

async function loadSongs() {
  try {
    const response = await fetch("songs.json");
    const data = await response.json();
    songs = data.map(addAudioFromUrl);
    // Now you can use songs
    const allSongs = [...songs];
    // ... rest of your code that uses allSongs
  } catch (error) {
    console.error("Error loading JSON data:", error);
  }
}

loadSongs();

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  ~~~~~~ TRACKLIST CREATION ~~~~~~~
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX ✉️ GENERAL RULES XXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX HELPER FUNCTIONS (DURATION) XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX


function addTrackDurationToTotal(totalTimeInSecs, track) {
  return totalTimeInSecs + (track.duration || 0);
}

export function calculateOrUpdatecuratedTracklistDuration(track, curatedTracklist) {
  if (curatedTracklistTotalTimeInSecs === 0) {
    for (const track of curatedTracklist) {
      curatedTracklistTotalTimeInSecs = addTrackDurationToTotal(curatedTracklistTotalTimeInSecs, track);
    }
  } else if (track) {
    curatedTracklistTotalTimeInSecs = addTrackDurationToTotal(curatedTracklistTotalTimeInSecs, track);
  }

  curatedTracklistTotalTimeInMins = Math.floor(curatedTracklistTotalTimeInSecs / 60);

  return curatedTracklistTotalTimeInSecs;
}

export function getFinalcuratedTracklistDuration(curatedTracklist) {
  let curatedTracklistTotalTimeInSecs = 0;

  if (!Array.isArray(curatedTracklist)) {
    console.error("Error: curatedTracklist is not an array");
    return curatedTracklistTotalTimeInSecs;
  }

  for (const track of curatedTracklist) {
    console.log("Track name is " + track.name);
    curatedTracklistTotalTimeInSecs = addTrackDurationToTotal(curatedTracklistTotalTimeInSecs, track);
    console.log("Track duration is " + (track.duration || 0));
  }

  curatedTracklistTotalTimeInMins = Math.floor(curatedTracklistTotalTimeInSecs / 60);

  return curatedTracklistTotalTimeInSecs;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX HELPER FUNCTIONS (FOR CHECKING TRACK VALIDITY) XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX


export function trackExistsWithAttributes(curatedTracklist, attribute, value) {
  for (const track of curatedTracklist) {
    if (typeof track === "object" && track.hasOwnProperty(attribute)) {
      // Check if track[attribute] is an array
      if (Array.isArray(track[attribute])) {
        // Check if any element in track[attribute] matches any element in value
        if (track[attribute].some((item) => value.includes(item))) {
          return track; // Return the first matching track
        }
      } else if (track[attribute] === value) {
        return track; // Return the first matching track
      }
    }
  }
  return null; // Return null if no matching track is found
}





// first time is queueNextTrack(curatedTracklist, 0, 0, cache));
function queueNextTrack(songs, index, currentRuntime, cache) {
  try {
    const song = songs[index]; // get the song object
    const audio = song.audio;
    player = audio; // Update player to the current audio

    console.log(`Queueing song: ${song.name}, Index: ${index}, Current Runtime: ${currentRuntime}`);
    // currentRuntime = randomValueSomeTimerThing;

    // Tell the browser to start downloading audio
    if (audio) {
      audio.preload = "auto";
    }

    const track = audioContext.createMediaElementSource(audio);
    track.connect(volumeNode);

    // When the song has ended, queue up the next one
    audio.addEventListener("ended", (e) => {
      const duration = audio.duration;
      // console.log(`Song ended: ${song.name}, Duration: ${duration}`);
      timerDuration += Math.floor(duration); // Update currentRuntime with the cumulative duration
      // Queue up the next song (songs, index, currentRuntime, cache) {
      console.log("Queueing next track with the following values:");
      console.log(`Queueing- Index: ${index + 1}`);
      console.log(`Queueing- Current Runtime: ${currentRuntime}`);
      // console.log(`Queueing- Current Runtime + duration: ${currentRuntime + duration}`);
      // console.log(`Queueing- Cache: ${cache}`);
      queueNextTrack(songs, index + 1, currentRuntime, cache);
    });

    // Set a timer to preload the next file
    const timeoutDurationMs = (song.duration - PREFETCH_BUFFER_SECONDS) * 1000;
    setTimeout(() => {
      const nextAudio = songs[index + 1];
      nextAudio.preload = "auto";
      fetchAndCacheAudio(nextAudio.url, cache).then((p) => console.log(`Loaded ${nextAudio.url} into cache`));
    }, timeoutDurationMs);

    // Log the debug information
    gatherAndPrintDebugInfo(song, index);

    // Play the audio
    audio.play();

    // Update the progress timer for the first time
    // createTimerLoopAndUpdateProgressTimer();
  } catch (error) {
    // Log any errors that occur
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

function prepareAudioContext() {
  if (audioContext == null) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    volumeNode = audioContext.createGain();
    volumeNode.connect(audioContext.destination);
  }
}

function prepareAndQueueTracks() {
  const allSongs = [...songs];
  const shuffledSongs = shuffleTracklist(allSongs);
  curatedTracklist = followTracklistRules(shuffledSongs);
  checkPlaylistRules(curatedTracklist);

  addOutrosAndCreditsToTracklist();
  createTranscriptContainer();
  printEntireTracklistDebug(curatedTracklist);

  window.caches.open("audio-pre-cache").then((cache) => queueNextTrack(curatedTracklist, 0, 0, cache));
  createTimerLoopAndUpdateProgressTimer();
}

function playTrack(index) {
  if (index >= curatedTracklist.length) return; // Exit if no more tracks

  const track = curatedTracklist[index];
  let audioElement = document.createElement("audio");
  audioElement.src = track.url; // Assuming 'track.url' exists
  document.body.appendChild(audioElement);

  audioElement.addEventListener("ended", () => {
    audioElement.remove(); // Clean up the finished track
    playTrack(index + 1); // Play the next track
  });

  audioElement.play();
}

function addOutrosAndCreditsToTracklist() {
  curatedTracklist.push(...outroAudioSounds.map(addAudioFromUrl));
  curatedTracklist.push(...gatherTheCreditSongs(curatedTracklist));
  curatedTracklist.push(...finalOutroAudioSounds.map(addAudioFromUrl));
}

function handlePlayPauseClick() {
  console.log("Entering handlePlayPauseClick function");

  try {
    // Existing code inside handlePlayPauseClick...
  } catch (error) {
    console.error("Error in handlePlayPauseClick: ", error);
  }

  try {
    // Existing code inside handlePlayPauseClick...
  } catch (error) {
    console.error("Error in handlePlayPauseClick: ", error);
  }

  if (firstPlay) {
    // playBackgroundMusic();

    toggleButtonVisuals(true); // Assume playing state on first play
    generatePlayer();
    prepareAudioContext();
    prepareAndQueueTracks();
    player.play();
    playerPlayState = "play";
    audioContext.resume();
    isValidTracklist(curatedTracklist);
    firstPlay = false; // Set firstPlay to false after handling the first play
  } else {
    // Handle subsequent toggles between play and pause
    if (playButton.classList.contains("playing")) {
      console.log("Pausing");
      toggleButtonVisuals(false); // Update visuals to reflect pause state
      player.pause();
      playerPlayState = "pause";
      audioContext.suspend();
    } else {
      console.log("Playing");
      toggleButtonVisuals(true); // Update visuals to reflect play state
      player.play();
      playerPlayState = "play";
      audioContext.resume();
    }
  }
}
// });
