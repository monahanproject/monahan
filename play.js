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

  // todo
  // this.globalAudioElement.ontimeupdate = () => {
  //   updateProgressUI();
  // };

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

    this.setupInitialUserInteraction();
    this.createVolumeSlider();
    this.initializeButtonVisuals();
    this.calcDuration();
    this.globalAudioElement.onplay = () => this.handlePlay();
    this.globalAudioElement.onpause = () => this.handlePause();
    this.globalAudioElement.onended = () => this.handleEnded();
    this.globalAudioElement.ontimeupdate = () => this.updateProgressUI();
  }

  calcDuration() {
    for (let i = 0; i < curatedTracklist.length; i++) {
      const track = curatedTracklist[i];
      this.totalPlaylistDuration += Number(track.duration);
    }
    console.log(`this.totalPlaylistDuration is ${this.totalPlaylistDuration}`);
    return this.totalPlaylistDuration;
  }

  updateProgressUI() {
    let elapsedSecondsInCurrentTrack = Math.round(this.globalAudioElement.currentTime);
    let totalElapsedSeconds = this.cumulativeElapsedTime + elapsedSecondsInCurrentTrack;
    // Ensure totalElapsedSeconds does not exceed the total playlist duration before calculating remainingSeconds
    totalElapsedSeconds = Math.min(totalElapsedSeconds, this.totalPlaylistDuration);
    let remainingSeconds = this.totalPlaylistDuration - totalElapsedSeconds;
    let playedPercentage = (totalElapsedSeconds / this.totalPlaylistDuration) * 100;

    // console.log(`Updating UI: Total Elapsed Seconds = ${totalElapsedSeconds}, Played Percentage = ${playedPercentage}%`);

    // console.log(`Updating Progress UI:
    //   Elapsed Seconds in Current Track: ${elapsedSecondsInCurrentTrack}s,
    //   Cumulative Elapsed Time: ${this.cumulativeElapsedTime}s,
    //   Total Elapsed Seconds: ${totalElapsedSeconds}s,
    //   Remaining Seconds: ${remainingSeconds}s,
    //   Played Percentage: ${playedPercentage}%`);

    // Update progress bar
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
      progressBar.style.width = `${playedPercentage}%`;
    }

    // Update progress dot position
    const progressDot = document.getElementById("progress-dot");
    if (progressDot) {
      progressDot.style.left = `calc(${playedPercentage}% - 5px)`; // Adjust as needed
    }

    // Calculate and update played and remaining time display
    const playedTime = this.calculateMinutesAndSeconds(totalElapsedSeconds);
    const remainingTimeDisplay = this.calculateMinutesAndSeconds(remainingSeconds);

    const timePlayedElement = document.getElementById("time-played");
    if (timePlayedElement) {
      timePlayedElement.innerText = `${playedTime.minutes}:${playedTime.seconds}`;
    }

    const timeRemainingElement = document.getElementById("time-remaining");
    if (timeRemainingElement) {
      timeRemainingElement.innerText = `-${remainingTimeDisplay.minutes}:${remainingTimeDisplay.seconds}`;
    }
  }

  handleTimerCompletion() {
    // Assuming there's a UI element to show the timer or end of playlist message
    const timeRemainingElement = document.getElementById("time-remaining");
    if (timeRemainingElement) {
      timeRemainingElement.textContent = "Playback finished"; // Customize as needed
    }
    // Reset or perform additional cleanup as necessary
    this.isPlaying = false;
    this.currentIndex = 0; // Optionally reset to start or handle as per your logic
    // this.updatePlayPauseUI(); // Reflect the updated state in the UI
  }

  calculateMinutesAndSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return {
      // Use template literals with a conditional ternary operator for padding
      minutes: `${minutes < 10 ? "0" : ""}${minutes}`,
      seconds: `${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`,
    };
  }

  initializeButtonVisuals() {
    this.toggleButtonVisuals(false);
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
    console.log(`Before skip: Cumulative Elapsed Time = ${this.cumulativeElapsedTime}`);

    const skipAmount = 30; // seconds
    let currentTime = this.globalAudioElement.currentTime;
    let duration = this.globalAudioElement.duration;

    console.log(`Skipping forward... Current track time left: ${duration - currentTime}s, Skip Amount: ${skipAmount}s`);

    if (duration - currentTime > skipAmount) {
      // Simple skip within the current track
      this.globalAudioElement.currentTime += skipAmount;
      // this.cumulativeElapsedTime += skipAmount;
    } else {
      // Calculate the full duration of the track to add to cumulativeElapsedTime
      let fullTrackTimeElapsed = duration - currentTime + currentTime; // This simplifies to just 'duration'
      this.cumulativeElapsedTime += fullTrackTimeElapsed; // Add the full duration of the track

      console.log(`Adding full track duration to cumulative: ${fullTrackTimeElapsed}s`);

      this.currentIndex++;
      if (this.currentIndex >= this.tracklist.length) {
        console.log("At the end of the playlist. Handling as per app logic.");
        this.currentIndex = this.tracklist.length - 1; // Prevent going beyond the last track
        this.handleTimerCompletion(); // Handle the end of playback, if necessary
      } else {
        // Reset currentTime for the new track
        this.globalAudioElement.currentTime = 0;
        this.playTrack(this.currentIndex);
      }
    }

    this.updateProgressUI();
    console.log(`After skip: Cumulative Elapsed Time = ${this.cumulativeElapsedTime}`);
  }

  skipBackward() {
    console.log(`Before skip backward: Cumulative Elapsed Time = ${this.cumulativeElapsedTime}`);

    const skipAmount = 15; // seconds
    let currentTime = this.globalAudioElement.currentTime;

    if (currentTime > skipAmount) {
        // Simple skip within the current track
        this.globalAudioElement.currentTime -= skipAmount;
    } else {
        if (this.currentIndex > 0) {
            // Prepare to move to the previous track
            this.currentIndex--;

            // Assuming each track in the tracklist has a 'duration' property
            const previousTrackDuration = this.tracklist[this.currentIndex].duration || 0;

            // Play the previous track
            this.playTrack(this.currentIndex);

            // Instead of waiting for 'canplaythrough', directly seek to the last few seconds of the previous track
            // This immediate seek might need adjustment based on how quickly your setup can handle the seek after a track change
            setTimeout(() => {
                // Calculate new position, considering the overflow from the skipAmount
                let newPosition = Math.max(previousTrackDuration - (skipAmount - currentTime), 0);
                this.globalAudioElement.currentTime = newPosition;

                // Update the UI and log the action after the skip is performed
                this.updateProgressUI();
                console.log(`Skipped backward into previous track: New Cumulative Elapsed Time = ${this.cumulativeElapsedTime}`);
            }, 1000); // Delay might need adjustment based on track loading behavior

            // Adjust cumulativeElapsedTime accurately considering the skip back into the previous track
            // This simplistic adjustment may need refinement based on your tracking of cumulativeElapsedTime
            this.cumulativeElapsedTime -= (currentTime + skipAmount); // Reduce the overflow time from the cumulative
        } else {
            console.log("Already at the beginning of the playlist.");
            this.globalAudioElement.currentTime = 0;
            // Optionally, handle UI update or other actions when at the start of the playlist
        }
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

  // "url": "./sounds/INTRO_OUTRO_NAMES/INTRO_2.mp3",

  playTrack(index) {
    if (index >= this.tracklist.length) {
        console.log("End of playlist");
        this.isPlaying = false;
        return;
    }
    const track = this.tracklist[index];
    this.globalAudioElement.src = track.url;
    
    // Reset currentTime to 0 for accurate tracking
    // This should happen right after setting a new src to ensure the track starts from the beginning
    this.globalAudioElement.currentTime = 0;

    // Attempt to play the track
    this.globalAudioElement.play().then(() => {
        this.isPlaying = true;
        console.log(`Now playing: ${track.url}`);
        // Preload the next track if possible

        if (index + 1 < this.tracklist.length) {
          const nextTrack = this.tracklist[index + 1];
          const audioPreload = new Audio(nextTrack.url);
          audioPreload.addEventListener('canplaythrough', () => {
              this.nextTrackIsReady = true; // Indicate that the next track is ready to play
          });
          audioPreload.load(); // Start loading the next track
      } else {
          this.nextTrackIsReady = false; // No more tracks to preload
      }
    }).catch((error) => {
        console.error("Playback initiation error:", error);
    });

    // IMPORTANT: Chain the next track to play after the current one ends
    this.globalAudioElement.onended = () => {
        console.log(`Track ended: ${track.url}`);
        this.cumulativeElapsedTime += Number(track.duration);
        this.currentIndex++; // Move to the next track
        if (this.currentIndex < this.tracklist.length) {
            this.playTrack(this.currentIndex); // Automatic play for the next track
        } else {
            console.log("Finished playing all tracks.");
            this.isPlaying = false;
            // Optionally reset currentIndex to 0 for replaying or handle it according to your app logic
        }
    };
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
