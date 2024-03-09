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
import { outroAudioSounds, finalOutroAudioSounds } from "./outroAudio.js";

export let curatedTracklist;
export let MAX_PLAYLIST_DURATION_SECONDS = 1140; //(19m)

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
let timerDuration = 0;
const playingSVG = `<img id="play-icon" class="svg-icon" src="images/svg/playButton.svg" alt="Play Icon">`;
const pausedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/pauseButton.svg" alt="Pause Icon">`;
const playingText = "PLAY";
const pausedText = "STOP";

let currentIndex = 0; // Initialize to 0, assuming the first track in the playlist


loadSongs();


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

function updateRuntime(song, currentRuntime) {
  const duration = song.duration;
  cumulativeElapsedTime += globalAudioElement.duration;
  logRuleApplication(`xxx duration is ${duration}`);
  timerDuration += Math.floor(duration);
  return currentRuntime + (song.duration ? parseInt(song.duration, 10) : 0);
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

function addOutrosAndCreditsToTracklist(curatedTracklist) {
  curatedTracklist.push(...outroAudioSounds.map(prepareSongForPlayback));
  curatedTracklist.push(...gatherTheCreditSongs(curatedTracklist));
  curatedTracklist.push(...finalOutroAudioSounds.map(prepareSongForPlayback));
  return curatedTracklist;
}

function secondsToMinutesAndSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`; // Pads the seconds with a leading zero if necessary
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXX CREATE EACH SONG! XXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* Takes a song object as input, create an audio element for the song's URL, 
assignS it to the song.audio property, and returns the modified song object.*/

export const prepareSongForPlayback = (song) => {
  return song;
};

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
    console.log("Songs loaded successfully.");

    // Now call prepareAndQueueTracks here to ensure it happens after songs are loaded
    prepareAndQueueTracks();
  } catch (error) {
    console.error("Error loading JSON data:", error);
  }
}





function prepareAndQueueTracks() {
  // get all the songs from a json file
  const allSongs = [...songs];
  // shuffle those songs
  const shuffledSongs = shuffleTracklist(allSongs);
  // an external modle follows a set of complicated rules and returns a curated tracklist
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

  // todo
  // globalAudioElement.ontimeupdate = () => {
  //   updateProgressUI();
  // };

  createTranscriptContainer();
  printEntireTracklistDebug(curatedTracklist);

  // const combinedTracklist = [...tracklist, ...curatedTracklist];

  // todo
  // window.caches.open("audio-pre-cache").then((cache) => queueNextTrack(curatedTracklist, 0, 0, cache));
  const simpleAudioPlayer = new SimpleAudioPlayer(curatedTracklist);

}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXX  SIMPLE AUDIO PLAYER class  XXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

class SimpleAudioPlayer {
  constructor(tracklist) {
    this.tracklist = tracklist;
    this.currentIndex = 0;
    this.globalAudioElement = document.createElement("audio");
    this.isPlaying = false;
    this.hasPlayed = false;
    this.currentRuntime = 0;
    this.setupInitialUserInteraction();
    this.createVolumeSlider();
  }


  addTracks(newTracks) {
    // this.tracklist = [...this.tracklist, ...newTracks];

    if (this.isPlaying && this.currentIndex === this.tracklist.length - newTracks.length - 1) {
      this.preloadNextTrack();
    }

    // If the playlist was empty and a new tracklist is added, automatically start playback.
    if (!this.isPlaying && this.tracklist.length === newTracks.length) {
      this.playTrack(this.currentIndex);
    }
  }

  preloadNextTrack() {
    if (this.currentIndex + 1 < this.tracklist.length) {
      const nextTrack = this.tracklist[this.currentIndex + 1];
      const audioPreload = new Audio(nextTrack.url);
      audioPreload.preload = "auto";
    }
  }
  setupInitialUserInteraction() {
    const playButton = document.getElementById("play-button");
    const skipBackwardButton = document.getElementById("skipBackwardButton");
    const skipForwardButton = document.getElementById("skipForwardButton");

    if (playButton) {
      playButton.addEventListener("click", () => this.startPlayback());
      // playButton.addEventListener('touchend', () => this.startPlayback(), false);
    }
    if (skipBackwardButton) {
      skipBackwardButton.addEventListener("click", () => this.skipBackward());
      // playButton.addEventListener('touchend', () => this.startPlayback(), false);
    }
    if (skipForwardButton) {
      skipForwardButton.addEventListener("click", () => this.skipForward());
      // playButton.addEventListener('touchend', () => this.startPlayback(), false);
    }
  }

  createVolumeSlider() {
    const volumeSlider = document.getElementById("volume-slider");
    if (volumeSlider) {
      volumeSlider.type = "range";
      volumeSlider.max = "100";
      volumeSlider.min = "0";
      volumeSlider.value = "75"; // Default volume
      volumeSlider.addEventListener("change", (event) => this.handleVolumeChange(event));
      this.globalAudioElement.volume = parseFloat(volumeSlider.value) / 100;
    }
  }

  handleVolumeChange(event) {
    const newVolume = parseFloat(event.target.value) / 100;
    this.globalAudioElement.volume = newVolume;
    // Consider also updating any visual volume indicators in the UI here
  }

  // Skip forward by 30 seconds or to the next track if necessary
  skipForward() {
    const skipAmount = 30; // seconds
    let timeLeft = this.globalAudioElement.duration - this.globalAudioElement.currentTime;

    if (timeLeft > skipAmount) {
      // If enough time left in the current track, just skip forward.
      this.globalAudioElement.currentTime += skipAmount;
    } else if (this.currentIndex < this.curatedTracklist.length - 1) {
      // Move to the next track and apply the remaining skip time.
      this.queueNextTrack(this.currentIndex + 1);
      // Assume queueNextTrack plays the next track, so we need to wait until it's ready to play.
      this.globalAudioElement.oncanplaythrough = () => {
        this.globalAudioElement.currentTime = skipAmount - timeLeft;
      };
    }
    // No else needed, if there's not enough time left and we're at the last track, do nothing.
  }

  skipBackward() {
    const skipAmount = 15; // seconds
    if (this.globalAudioElement.currentTime > skipAmount) {
      // If more than skipAmount seconds into the current track, just skip back.
      this.globalAudioElement.currentTime -= skipAmount;
    } else if (this.currentIndex > 0) {
      // Move to the previous track and apply the skip from the end of that track.
      this.queueNextTrack(this.currentIndex - 1);
      this.globalAudioElement.oncanplaythrough = () => {
        this.globalAudioElement.currentTime = this.globalAudioElement.duration - (skipAmount - this.globalAudioElement.currentTime);
      };
    }
  }

  startPlayback() {
    if (!this.isPlaying && this.currentIndex < this.tracklist.length) {
      this.playTrack(this.currentIndex);
    }
  }

  playTrack(index) {
    console.log("yo");
    // prepareAndQueueTracks();

    if (index >= this.tracklist.length) {
      console.log("End of playlist");
      this.isPlaying = false;
      return;
    }
    const track = this.tracklist[index];
    this.globalAudioElement.src = track.url;
    this.globalAudioElement
      .play()
      .then(() => {
        this.isPlaying = true;
        console.log(`Now playing: ${track.url}`);
        // console.log(`Queueing and playing song: ${song.name}, Index: ${index}, Current Runtime: ${currentRuntime}`);

        // Preload the next track if possible
        if (index + 1 < this.tracklist.length) {
          const nextTrack = this.tracklist[index + 1];
          const audioPreload = new Audio(nextTrack.url);
          audioPreload.preload = "auto"; // This preloads the next track
        }
      })
      .catch((error) => {
        console.error("Playback initiation error:", error);
      });

    // Chain the next track to play after the current one ends
    this.globalAudioElement.onended = () => {
      console.log(`Track ended: ${track.url}`);
      this.currentIndex++; // Move to the next track
      if (this.currentIndex < this.tracklist.length) {
        this.playTrack(this.currentIndex); // Automatic play for the next track

        //need to fix this block
        // newCurrentRuntime = updateRuntime(track, currentRuntime);
        const duration = track.duration;
        cumulativeElapsedTime += this.globalAudioElement.duration;
        logRuleApplication(`xxx duration is ${duration}`);
        timerDuration += Math.floor(duration); // Update currentRuntime with the cumulative duration
        const newCurrentRuntime = this.currentRuntime + (track.duration ? parseInt(track.duration, 10) : 0);
      } else {
        console.log("Finished playing all tracks.");

        this.isPlaying = false;
        // Optionally reset currentIndex to 0 for replaying or handle it according to your app logic
      }
    };
  }

  togglePlayPause() {
    
    //first play
    if (!this.hasPlayed) {
      
      // Special things for the first play
      this.firstPlaySpecialStuff();
      this.toggleButtonVisuals(true);
    }
    //pause

    if (this.isPlaying) {
      this.globalAudioElement.pause();
      this.isPlaying = false;
      console.log("Pausing");
      this.toggleButtonVisuals(false);
      //play
    } else {
      this.startPlayback();
    }
  }

  firstPlaySpecialStuff() {
    console.log("yo");
    this.hasPlayed = true;
    // prepareAndQueueTracks();
  }

  toggleButtonVisuals(isPlaying) {
    const playButtonTextContainer = document.getElementById("play-button-text-container");
    const svgContainer = document.getElementById("play-button-svg-container");
    const textContainer = document.getElementById("play-button-text-container");
    const playButton = document.getElementById("play-button");

    playButtonTextContainer.style.left = isPlaying ? "50%" : "35%";
    svgContainer.innerHTML = isPlaying ? pausedSVG : playingSVG;
    textContainer.textContent = isPlaying ? "STOP" : "PLAY";
    playButton.classList.toggle("playing", isPlaying);
    playButton.classList.toggle("paused", !isPlaying);
  }
}

// const tracklist = [
//   { url: "./sounds/INTRO_OUTRO_NAMES/NAMES_DEMETRI.mp3" },
//   // { url: "./sounds/CONTENT/S_DEMI_18.mp3" },
//   // { url: "./sounds/CONTENT/S_BIRDS_15.mp3" },
//   // { url: "./sounds/CONTENT/S_DEMI_14.mp3" },
// ];


const tracklist = [
  {
    name: "NAMES_DEMETRI",
    url: "./sounds/INTRO_OUTRO_NAMES/NAMES_DEMETRI.mp3",
    duration: 2, // Placeholder duration, update with the actual duration in seconds
    author: "", // Update with the author's name if applicable
    form: "", // Update this with the type of content, e.g., "music", "interview"
    placement: [], // Use this to describe where in the playlist this might fit
    length: "", // Possible values: "short", "medium", "long", based on duration
    language: "", // e.g., "verbal", "nonHuman" for instrumental or nature sounds
    sentiment: "", // e.g., "light", "moderate", "heavy"
    tags: [], // Array of tags relevant to the track
    backgroundMusic: "", // URL if there is background music to mention
    credit: "", // URL to a credit track if applicable
    engTrans: "", // English transcript if available
    frTrans: "" // French transcript if available
  },
  {
    name: "demi",
    url: "./sounds/CONTENT/S_DEMI_18.mp3",
    duration: 20, // Placeholder duration, update with the actual duration in seconds
    author: "", // Update with the author's name if applicable
    form: "", // Update this with the type of content, e.g., "music", "interview"
    placement: [], // Use this to describe where in the playlist this might fit
    length: "", // Possible values: "short", "medium", "long", based on duration
    language: "", // e.g., "verbal", "nonHuman" for instrumental or nature sounds
    sentiment: "", // e.g., "light", "moderate", "heavy"
    tags: [], // Array of tags relevant to the track
    backgroundMusic: "", // URL if there is background music to mention
    credit: "", // URL to a credit track if applicable
    engTrans: "", // English transcript if available
    frTrans: "" // French transcript if available
  }
  // Repeat for other tracks, commenting out the ones you're currently not using
];

// prepareAndQueueTracks();

// const simpleAudioPlayer = new SimpleAudioPlayer(curatedTracklist);
// simpleAudioPlayer.addTracks(curatedTracklist);
