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
// export let MAX_PLAYLIST_DURATION_SECONDS = 640; //(19m)

let myLang = localStorage["lang"] || "defaultValue";
export let curatedTracklistTotalTimeInSecs;
curatedTracklistTotalTimeInSecs = 0;
const playingSVG = `<img id="play-icon" class="svg-icon" src="images/svg/playButton.svg" alt="Play Icon">`;
const pausedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/pauseButton.svg" alt="Pause Icon">`;
const playingText = "PLAY";
const pausedText = "STOP";

let currentIndex = 0; // Initialize to 0, assuming the first track in the playlist

loadSongs();

function addOutrosAndCreditsToTracklist(curatedTracklist) {
  curatedTracklist.push(...outroAudioSounds.map(prepareSongForPlayback));
  curatedTracklist.push(...gatherTheCreditSongs(curatedTracklist));
  curatedTracklist.push(...finalOutroAudioSounds.map(prepareSongForPlayback));
  return curatedTracklist;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXX CREATE EACH SONG! XXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* Possibly does nothing!.*/

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
    curatedTracklist = prepareCuratedTracklist(songs);
  } catch (error) {
    console.error("Error loading JSON data:", error);
  }
}

function prepareCuratedTracklist(songs) {
  const allSongs = [...songs];
  const shuffledSongs = shuffleTracklist(allSongs);
  curatedTracklist = followTracklistRules(shuffledSongs);
  checkPlaylistRules(curatedTracklist);
  curatedTracklist = addOutrosAndCreditsToTracklist(curatedTracklist);
  createTranscriptContainer();
  printEntireTracklistDebug(curatedTracklist);
  const makeASimpleAudioPlayerAndPlayIt = new SimpleAudioPlayer(curatedTracklist);
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
    this.firstPlayDone = false;
    this.nextTrackIsReady = false; //not actually using this yet
    this.currentRuntime = 0;

    this.hasSkippedToEnd = false;
    this.cumulativeElapsedTime = 0;
    this.totalPlaylistDuration = 0; // Initialize with the sum of durations of all tracks in the playlist
    this.isDebouncingBackwardSkip = false;
    this.debounceTimeout = 500; // 500 milliseconds
    this.isUpdatingTime = false; // Flag to prevent rapid updates
    this.timerDuration = 0;

    this.createTimerLoopAndUpdateProgressTimer();

    this.setupInitialUserInteraction();
    this.createVolumeSlider();
    this.initializeButtonVisuals();
    this.calcDuration();

    this.globalAudioElement.onplay = () => this.handlePlay();
    this.globalAudioElement.onpause = () => this.handlePause();
    this.globalAudioElement.onended = () => this.handleEnded();
    // this.globalAudioElement.ontimeupdate = () => this.updateProgressUI();
  }

  calcDuration() {
    this.totalPlaylistDuration = this.tracklist.reduce((acc, track) => acc + Number(track.duration), 0);
    console.log(`xxx [calculateTotalPlaylistDuration] Total playlist duration: ${this.totalPlaylistDuration}s`);
    return this.totalPlaylistDuration;
  }

  updateProgressUI(elapsedSeconds, previousDuration) {
    try {
      const progressBar = document.getElementById("progress-bar");
      const progressDot = document.getElementById("progress-dot");
      const timePlayedElement = document.getElementById("time-played");
      const timeRemainingElement = document.getElementById("time-remaining");

      const remainingDurationSeconds = this.totalPlaylistDuration - (elapsedSeconds + previousDuration);
      // Calculate the percentage of the track that's been played
      const playedPercentage = ((elapsedSeconds + previousDuration) / this.totalPlaylistDuration) * 100;

      // Update the progress bar and dot
      progressBar.style.width = `${playedPercentage}%`;
      progressDot.style.left = `calc(${playedPercentage}% - 5px)`; // Adjust based on the dot's size
      // Update the time labels
      const playedTime = this.calculateMinutesAndSeconds(elapsedSeconds + previousDuration);
      const remainingTime = this.calculateMinutesAndSeconds(remainingDurationSeconds);

      timePlayedElement.innerText = `${playedTime.minutes}:${playedTime.seconds}`;
      timeRemainingElement.innerText = `-${remainingTime.minutes}:${remainingTime.seconds}`;
    } catch (error) {
      // Handle errors that occur in the try block
      console.error("An error occurred in updateProgressUI:", error);
    } finally {
      // Code here will run regardless of whether an error occurred
      // This block is optional and can be omitted if not needed
    }
  }

  // handleTimerCompletion() {
  //   const timeRemainingElement = document.getElementById("time-remaining");

  //   if (!timeRemainingElement) {
  //     console.error("Error: Missing element 'time-remaining'");
  //     return; // Exit the function to prevent further errors
  //   }
  //   timeRemainingElement.innerHTML = "Done";
  // }

  calculateMinutesAndSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return {
      minutes: `${minutes < 10 ? "0" : ""}${minutes}`,
      seconds: `${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`,
    };
  }

  calculateRemainingTime(elapsedSeconds) {
    return this.totalPlaylistDuration - elapsedSeconds;
  }

  createTimerLoopAndUpdateProgressTimer() {
    var start = Date.now(); // Record the start time of the loop
    return setInterval(() => {
      let delta = Date.now() - start; // Calculate elapsed milliseconds
      let deltaSeconds = Math.floor(delta / 1000); // Convert milliseconds to seconds
      // new name below
      this.updateProgressUI(Math.floor(this.globalAudioElement.currentTime), this.timerDuration);
      this.remainingTime = this.calculateRemainingTime(deltaSeconds);
    }, 1000); // Run the loop every x milliseconds
  }

  initializeButtonVisuals() {
    this.toggleButtonVisuals(false);
  }

  // preloadNextTrack() {
  //   if (this.currentIndex + 1 < this.tracklist.length) {
  //     const nextTrack = this.tracklist[this.currentIndex + 1];
  //     const audioPreload = new Audio(nextTrack.url);
  //     audioPreload.preload = "auto";
  //   }
  // }
  setupInitialUserInteraction() {
    const playButton = document.getElementById("play-button");
    const skipBackwardButton = document.getElementById("skipBackwardButton");
    const skipForwardButton = document.getElementById("skipForwardButton");

    if (playButton) {
      playButton.addEventListener("click", () => this.startPlayback());
      playButton.addEventListener("touchend", () => this.startPlayback(), false);
    }
    if (skipBackwardButton) {
      skipBackwardButton.addEventListener("click", () => this.handleSkipBackward());
      playButton.addEventListener("touchend", () => this.startPlayback(), false);
    }
    if (skipForwardButton) {
      skipForwardButton.addEventListener("click", () => this.handleSkipForward());
      playButton.addEventListener("touchend", () => this.startPlayback(), false);
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
    // TODO any visual volume indicators in the UI here
  }

  handleSkipForward() {
    let newPlayerTime = this.globalAudioElement.currentTime + 20;
    newPlayerTime = Math.min(newPlayerTime, this.totalPlaylistDuration);
    if (!this.isUpdatingTime) {
      this.isUpdatingTime = true; // Set a flag to prevent rapid updates
      setTimeout(() => {
        this.globalAudioElement.currentTime = newPlayerTime;
        this.isUpdatingTime = false;
      }, 20); // Adjust the delay as needed (100 milliseconds in this case)
    }
  }

  handleSkipBackward() {
    let newPlayerTime = this.globalAudioElement.currentTime - 20;
    newPlayerTime = Math.min(newPlayerTime, this.totalPlaylistDuration);
    if (!this.isUpdatingTime) {
      this.isUpdatingTime = true; // Set a flag to prevent rapid updates
      setTimeout(() => {
        this.globalAudioElement.currentTime = newPlayerTime;
        this.isUpdatingTime = false;
      }, 20); // Adjust the delay as needed (100 milliseconds in this case)
    }
  }

  startPlayback() {
    if (!this.isPlaying && this.currentIndex < this.tracklist.length) {
      if (!this.firstPlayDone) {
        // If it's the first play, start from the beginning
        this.playTrack(this.currentIndex);
        this.firstPlayDone = true; // Mark that first play has occurred
      } else {
        // If not the first play, just resume
        this.globalAudioElement.play();
      }
    } else {
      this.pausePlayback(); // Pause playback if we're currently playing
    }
  }

  playTrack(index) {
    return new Promise((resolve, reject) => {
      if (index >= this.tracklist.length) {
        console.log(`[playTrack] End of playlist reached. Index=${index}`);
        this.isPlaying = false;
        reject(new Error("End of playlist"));
        return;
      }

      const track = this.tracklist[index];
      console.log(`[playTrack] Starting. Index=${index}, Track URL=${track.url}, Expected Duration=${track.duration}s`);

      this.globalAudioElement.src = track.url;
      // this.globalAudioElement.currentTime = 0; // Ensure track starts from the beginning

      // Attempt to play the track
      this.globalAudioElement
        .play()
        .then(() => {
          this.isPlaying = true;
          console.log(`[playTrack] Now playing. Index=${index}, URL=${track.url}`);

          // Preload the next track if applicable
          if (index + 1 < this.tracklist.length) {
            const nextTrack = this.tracklist[index + 1];
            const audioPreload = new Audio(nextTrack.url);
            audioPreload.preload = "auto";
            audioPreload.addEventListener("canplaythrough", () => {
              console.log(`[playTrack] Preloaded next track. Index=${index + 1}, URL=${nextTrack.url}`);
            });
            audioPreload.load(); // Start loading the next track
          }

          resolve();
        })
        .catch((error) => {
          console.error(`[playTrack] Playback initiation error for track index=${index}, URL=${track.url}:`, error);
          reject(error);
        });

      // Handle track end
      this.globalAudioElement.onended = () => {
        const duration = this.globalAudioElement.duration;
        this.timerDuration += Math.floor(duration);

        console.log(`[playTrack] Track ended. Index=${index}, URL=${track.url}`);
        this.cumulativeElapsedTime += Number(track.duration); // Update cumulative time with track duration
        console.log(`[playTrack] Updated cumulativeElapsedTime after track end: ${this.cumulativeElapsedTime}s`);
        this.currentIndex++; // Move to the next track

        if (this.currentIndex < this.tracklist.length) {
          this.playTrack(this.currentIndex).then(resolve).catch(reject); // Recursive call to play next track
        } else {
          console.log("[playTrack] Finished playing all tracks. Playlist ended.");
          this.isPlaying = false;
          resolve(); // Resolve as playlist finished
        }
      };
    });
  }

  pausePlayback() {
    console.log("Pausing");
    this.globalAudioElement.pause();
    this.isPlaying = false;
    this.toggleButtonVisuals(false);
  }

  handlePlay() {
    console.log("handlePlay");
    this.isPlaying = true;
    this.toggleButtonVisuals(true);
  }

  handlePause() {
    console.log("handlePause");
    this.isPlaying = false;
    this.toggleButtonVisuals(false);
  }

  handleEnded() {
    console.log("handleEnded");
    this.isPlaying = false;
    this.toggleButtonVisuals(false);
    // console.log(`Before End - CumulativeElapsedTime: ${this.cumulativeElapsedTime}, Track Duration: ${Math.round(this.globalAudioElement.duration)}`);
    // this.cumulativeElapsedTime += Math.round(this.globalAudioElement.duration);
    // console.log(`After End - CumulativeElapsedTime: ${this.cumulativeElapsedTime}`);
    // this.handleTimerCompletion();
    // this.updateProgressUI();

    // // Automatically queue the next track if there is one
    // if (this.currentIndex < this.curatedTracklist.length - 1) {
    //   this.queueNextTrack(this.currentIndex + 1);
    // }
  }

  toggleButtonVisuals(isPlaying) {
    const svgIcon = document.querySelector("#play-button-svg-container .svg-icon");
    const playButton = document.querySelector("#play-button");
    const playButtonTextContainer = document.getElementById("play-button-text-container");
    const svgContainer = document.getElementById("play-button-svg-container");

    if (isPlaying) {
      if (!playButton.classList.contains("playing")) {
        // Check to prevent redundant operations
        playButtonTextContainer.style.left = "50%";
        svgContainer.innerHTML = pausedSVG;
        playButtonTextContainer.textContent = pausedText;
      }
    } else {
      if (!playButton.classList.contains("paused")) {
        if (!this.firstPlayDone) {
          // we're in a begin state
        } else {
          // Check to prevent redundant operations
          playButtonTextContainer.style.left = "35%";
          svgContainer.innerHTML = playingSVG;
          playButtonTextContainer.textContent = playingText;
        }
      }
    }
    // Toggle these classes regardless of current state, as they control other visual aspects that may need to be updated
    playButton.classList.toggle("playing", isPlaying);
    playButton.classList.toggle("paused", !isPlaying);
  }
}
