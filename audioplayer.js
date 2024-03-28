import { curatedTracklist, initializeApp } from "./play.js";
import { getState, setState } from "./state.js";
let isInverted = getState(); // This will initialize isInverted based on localStorage

if (localStorage.getItem("themeInverted") === null) {
  // If the key doesn't exist, initialize it to false
  localStorage.setItem("themeInverted", "false");
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXX  SIMPLE AUDIO PLAYER class  XXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

export class SimpleAudioPlayer {
  constructor(tracklist) {
    console.log("SimpleAudioPlayer initialized with tracklist:", tracklist);
    this.tracklist = tracklist;
    this.currentIndex = 0;
    this.globalAudioElement = document.createElement("audio");
    this.isPlaying = false;
    this.firstPlayDone = false;
    this.currentRuntime = 0;

    this.cumulativeElapsedTime = 0;
    this.totalPlaylistDuration = 0; // Initialize with the sum of durations of all tracks in the playlist
    this.isUpdatingTime = false; // Flag to prevent rapid updates
    this.timerDuration = 0;
    this.allowProgressUpdate = true;

    this.transcript = "";
    this.language = "english";
    this.transcriptVisible = false;
    this.transcriptContent = null;
    this.transcriptContainer = document.getElementById("transcriptContainer");

    this.playingSVG = `<img id="play-icon" class="svg-icon" src="images/svg/playButton.svg" alt="Play Icon">`;
    this.playingInvertedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/playButtonInvert.svg" alt="Play Icon">`;

    this.pausedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/pauseButton.svg" alt="Pause Icon">`;
    this.pausedInvertedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/pauseButtonInvert.svg" alt="Pause Icon">`;

    this.playingText = "PLAY";
    this.pausedText = "STOP";

    this.playlistEnded = false; // Track whether the current playlist has ended

    this.createTimerLoopAndUpdateProgressTimer();

    this.setupInitialUserInteraction();
    this.createVolumeSlider();
    this.initializeButtonVisuals();
    this.calcDuration();

    this.globalAudioElement.onplay = () => this.handlePlay();
    this.globalAudioElement.onpause = () => this.handlePause();
    this.globalAudioElement.onended = () => this.handleEnded();
  }

  // TIMER

  calcDuration() {
    this.totalPlaylistDuration = this.tracklist.reduce((acc, track) => acc + Number(track.duration), 0);
    // console.log(`xxx [calculateTotalPlaylistDuration] Total playlist duration: ${this.totalPlaylistDuration}s`);
    return this.totalPlaylistDuration;
  }

  updateProgressUI(elapsedSeconds, previousDuration) {
    if (!this.allowProgressUpdate || this.totalPlaylistDuration === 0) return; // Add totalPlaylistDuration check

    // console.log("updateProgressUI");
    // console.log("updateProgressUI didn't exit out");

    //findme
    // console.log(`Updating UI: Elapsed ${elapsedSeconds}, Previous ${previousDuration}, Total Duration ${this.totalPlaylistDuration}`);

    // Additional condition to ensure the UI update is relevant to the current playlist state
    if (this.totalPlaylistDuration <= 0) {
      console.error("Total playlist duration is not set correctly.");
      return; // Early return if the total duration isn't calculated yet.
    }

    try {
      const progressBar = document.getElementById("progress-bar");
      const progressDot = document.getElementById("progress-dot");
      const timePlayedElement = document.getElementById("time-played");
      const timeRemainingElement = document.getElementById("time-remaining");

      let remainingDurationSeconds = this.totalPlaylistDuration - (elapsedSeconds + previousDuration);
      // Ensure remainingDurationSeconds never goes below 0
      remainingDurationSeconds = Math.max(0, remainingDurationSeconds);

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
    console.log("createTimerLoopAndUpdateProgressTimer");

    // Clear any existing interval to prevent duplicates
    clearInterval(this.updateIntervalId);

    var start = Date.now(); // Record the start time of the loop
    this.updateIntervalId = setInterval(() => {
      // Store the interval ID
      let delta = Date.now() - start;
      let deltaSeconds = Math.floor(delta / 1000);
      // find me 
      // console.log(Math.floor(this.globalAudioElement.currentTime) + this.timerDuration);

      this.updateProgressUI(Math.floor(this.globalAudioElement.currentTime), this.timerDuration);
    }, 1000);
  }

  initializeButtonVisuals() {
    // console.log( "intializing button visuals");
    this.toggleButtonVisuals(false);
  }

  // TRANSCRIPT

  // Helper function to create elements with attributes
  createElement(type, attributes) {
    const element = document.createElement(type);
    Object.keys(attributes).forEach((attr) => (element[attr] = attributes[attr]));
    return element;
  }

  // create the transcript container and button
  createTranscriptContainer() {
    if (!this.transcriptContainer) {
      console.error("Transcript container not found.");
      return;
    }

    // Check if the transcript button already exists
    let transcriptButton = document.getElementById("transcriptButton");
    if (!transcriptButton) {
      // Only create and append the button if it doesn't exist
      transcriptButton = this.createElement("button", {
        type: "button",
        className: "btn",
        id: "transcriptButton",
        textContent: "TRANSCRIPT",
      });

      const transBtnContainer = document.getElementById("transButtonContainer");
      transBtnContainer.appendChild(transcriptButton);
      transcriptButton.addEventListener("click", this.toggleTranscript.bind(this));
    }

    // Initialize or clear transcriptContent as needed
    if (!this.transcriptContent) {
      this.transcriptContent = this.createElement("div", { id: "transcriptContent", style: "display: none" });
      this.transcriptContainer.appendChild(this.transcriptContent);
    } else {
      // Clear existing content if transcriptContent already exists
      this.transcriptContent.innerHTML = "";
    }
  }

  // Function to apply formatting to text
  formatText(text) {
    const formatPatterns = {
      bold: /\^([^]+?)\^\^/g,
      center: /@([^]+?)@@/g,
      italics: /\$([^]+?)\$\$/g,
      lineBreak: /%/g,
      doubleLineBreak: /\*/g,
    };

    return text
      .replace(formatPatterns.bold, '<span style="font-weight: bold;">$1</span>')
      .replace(formatPatterns.center, '<span style="display: block; text-align: center;">$1</span>')
      .replace(formatPatterns.italics, '<span style="font-style: italic;">$1</span>')
      .replace(formatPatterns.lineBreak, "</br>")
      .replace(formatPatterns.doubleLineBreak, "<p></br></br></p>");
  }

  createHTMLFromText(text) {
    const container = this.createElement("div", {});
    const currentParagraph = this.createElement("p", {
      style: "margin-top: 3rem; margin-bottom: 1rem; padding: 1rem; background-color: #bfffc2; margin-left: 0; margin-right: 0;",
    });

    try {
      currentParagraph.innerHTML = this.formatText(text); // Refactored to formatText function
      container.appendChild(currentParagraph);
    } catch (error) {
      console.error("Error while processing input text:", error);
    }

    return container;
  }

  // Function to update the transcript based on the selected language
  updateTranscript() {
    if (!this.transcriptContainer) {
      console.error("Transcript container not found.");
      return;
    }

    this.transcriptContainer.innerHTML = ""; // Clear previous content

    const langKey = this.language === "english" ? "engTrans" : "frTrans";
    const copyRightText =
      this.language === "english"
        ? "$All recordings and transcripts are copyright protected. All rights reserved.$$"
        : "$Les enregistrements et les transcriptions sont protégés par le droit d’auteur. Tous droits réservés.$$";

    this.tracklist.forEach((song) => {
      const inputString = song[langKey];
      if (inputString && inputString.trim() !== "") {
        this.transcriptContainer.appendChild(this.createHTMLFromText(inputString));
      }
    });

    this.transcriptContainer.appendChild(this.createHTMLFromText(copyRightText));
    this.transcriptContainer.style.display = "block";
  }

  // Function to toggle the transcript visibility
  toggleTranscript() {
    const transcriptButton = document.getElementById("transcriptButton");

    this.transcriptVisible = !this.transcriptVisible; // Toggle the flag first for more predictable logic
    if (this.transcriptVisible) {
      this.updateTranscript(); // Update before showing
      this.transcriptContainer.style.display = "block";
      transcriptButton.textContent = "Hide Transcript";
    } else {
      this.transcriptContainer.style.display = "none";
      transcriptButton.textContent = "Show Transcript";
    }
  }

  // INTERACTIONS
  setupInitialUserInteraction() {
    const playButton = document.getElementById("play-button");
    const skipBackwardButton = document.getElementById("skipBackwardButton");
    const skipForwardButton = document.getElementById("skipForwardButton");

    if (playButton) {
      playButton.addEventListener("click", () => this.startPlayback());
    }
    if (skipBackwardButton) {
      skipBackwardButton.addEventListener("click", () => this.handleSkipBackward());
    }
    if (skipForwardButton) {
      skipForwardButton.addEventListener("click", () => this.handleSkipForward());
    }
  }

  createVolumeSlider() {
    var volumeSlider = document.getElementById("volume-slider");
    if (volumeSlider && volumeSlider instanceof HTMLInputElement) {
      volumeSlider.type = "range";
      volumeSlider.max = "100";
      volumeSlider.min = "0";
      volumeSlider.value = "75"; // Set default volume

      volumeSlider.addEventListener("input", (event) => {
        this.handleVolumeChange(event);
      });

      // Immediately set the volume based on the slider's initial value
      this.globalAudioElement.volume = parseFloat(volumeSlider.value) / 100;
    }

    // Initial UI update for volume indicators if necessary
    this.updateVolumeIndicator(parseFloat(volumeSlider.value));
  }

  handleVolumeChange(event) {
    const volumeLevel = parseFloat(event.target.value) / 100;
    this.globalAudioElement.volume = volumeLevel;
    this.updateVolumeIndicator(event.target.value); // Assuming this method exists to update the UI
  }

  updateVolumeIndicator(volumeLevel) {
    const volumeFiller = document.getElementById("volume-bar-filler");
    const volumeThinner = document.getElementById("volume-bar-thinner");

    if (volumeFiller) {
      volumeFiller.style.width = `${volumeLevel}%`;
    }

    if (volumeThinner) {
      volumeThinner.style.width = `${100 - volumeLevel}%`;
      volumeThinner.style.left = `${volumeLevel}%`;
    }
  }

  pausePlayback() {
    this.globalAudioElement.pause();
    this.isPlaying = false;
    this.toggleButtonVisuals(false);
  }

  handlePlay() {
    this.isPlaying = true;
    this.toggleButtonVisuals(true);
  }

  handlePause() {
    this.isPlaying = false;
    this.toggleButtonVisuals(false);
  }

  handleEnded() {
    console.log("handleEnded");
    console.log("Track ended. Current index:", this.currentIndex, "of", this.tracklist.length);
    this.playlistEnded = true;
    console.log("Playlist ended flag set to true.");

    this.allowProgressUpdate = false;
    // Log the end of playback
    console.log("handleEnded being called");

    // Stop the interval that updates the progress UI, ensuring no further updates occur
    clearInterval(this.updateIntervalId);

    // Immediately pause and reset the audio element to its initial state
    this.globalAudioElement.pause();
    this.globalAudioElement.currentTime = 0;

    // Reset the player's internal state to ensure it's ready for a new session
    this.isPlaying = false;
    this.currentIndex = 0;
    this.cumulativeElapsedTime = 0;
    this.firstPlayDone = false;
    this.currentRuntime = 0;
    this.totalPlaylistDuration = 0; // Ensure this is recalculated when a new playlist is loaded
    this.timerDuration = 0;

    // Re-initialize the audio element for a fresh start
    this.globalAudioElement = document.createElement("audio");

    // Reset progress UI elements to their initial state
    this.resetProgressUI();

    // Optionally, hide and clear the transcript container if visible
    this.resetTranscriptUI();

    // Update button visuals to reflect the reset state and re-enable progress updates
    this.toggleButtonVisuals(false);
    // this.allowProgressUpdate = true;

    // Update the play button text to indicate readiness for a new session
    this.updatePlayButtonText("BEGIN");
  }

  resetProgressUI() {
    console.log("Resetting Progress UI for new playlist");
    const progressBar = document.getElementById("progress-bar");
    const progressDot = document.getElementById("progress-dot");
    const timePlayedElement = document.getElementById("time-played");
    const timeRemainingElement = document.getElementById("time-remaining");

    if (progressBar && progressDot && timePlayedElement && timeRemainingElement) {
      progressBar.style.width = "0%";
      progressDot.style.left = "0%";
      timePlayedElement.innerText = "00:00";
      timeRemainingElement.innerText = "00:00"; // Adjust according to total duration if available
    }
  }

  resetTranscriptUI() {
    console.log("resetTranscriptUI");
    // findme - need to actually remove this
    if (this.transcriptContainer && this.transcriptVisible) {
      this.transcriptContainer.style.display = "none";
      this.transcriptVisible = false;
      this.transcriptContainer.innerHTML = ""; // Clear any previous transcript
    }
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
      }, 20);
    }
  }

  newPlaylist() {
    console.log("newPlaylist() called");
    this.tracklist = curatedTracklist; // Assuming this gets the new playlist tracks.
    this.resetProgressUI(); // Reset UI elements to their initial states.

    this.calcDuration(); // Recalculate total duration immediately
    this.currentIndex = 0; // Reset to start of the new playlist.
    this.allowProgressUpdate = false; // Allow UI updates.
    // this.createTimerLoopAndUpdateProgressTimer(); // Reset and start the new update interval

    // this.startPlayback(); // Begin playback of the new playlist.
  }

  // Function to start or resume playback of the tracklist.
  async startPlayback() {
    console.log("startPlayback called. Current index:", this.currentIndex, "Playlist ended:", this.playlistEnded, "Is playing:", this.isPlaying);

    // Prioritize checking if a new playlist needs to be started.
    if (this.playlistEnded && !this.isPlaying) {
      console.log("End of playlist was detected. Preparing a new playlist...");
      await initializeApp(); // Assuming this re-initializes your app or loads new tracks.
      this.newPlaylist(); // Prepare and start a new playlist.
      return; // Exit early to avoid further execution.
    }

    // Then check if there are tracks left in the playlist to play or resume.
    if (this.currentIndex < this.tracklist.length) {
      if (!this.isPlaying) {
        console.log("Playing or resuming track at index:", this.currentIndex);
        if (!this.firstPlayDone) {
          // First play of the playlist.
          console.log("First play of the new playlist.");
          await this.playTrack(this.currentIndex);
          this.firstPlayDone = true; // Prevents re-initialization in future plays.
          this.createTranscriptContainer(); // Setup UI for transcripts if needed.
        } else {
          // Resume playback.
          console.log("Resuming playback.");
          this.globalAudioElement.play();
        }
        this.toggleButtonVisuals(true); // Update UI to show playing state.
      } else {
        // Currently playing, so pause.
        console.log("Playback is currently active. Pausing playback.");
        this.pausePlayback();
      }
    } else {
      // This condition might be redundant now but serves as a fallback.
      console.log("Fallback: Reached end of playlist, preparing new playlist...");
      await initializeApp();
      this.newPlaylist();
    }
  }

  // Function to play a track from the tracklist at a given index.
  playTrack(index) {
    console.log("playTrack(index)");

    // Return a new promise that will handle the play process.
    return new Promise((resolve, reject) => {
      // Check if the index is beyond the tracklist's length, indicating the end of the playlist.
      if (index >= this.tracklist.length) {
        // Log that the end of the playlist has been reached.
        console.log("All tracks in the tracklist have been played.");
        console.log(`[playTrack] End of playlist reached. Index=${index}`);
        // Set the isPlaying flag to false as nothing is playing now.
        this.isPlaying = false;
        // Reject the promise indicating we've reached the end of the playlist.
        reject(new Error("End of playlist"));
        return; // Exit early since there's nothing to play.
      }

      // Retrieve the track object from the tracklist at the specified index.
      const track = this.tracklist[index];

      // Set the source of the global audio element to the URL of the current track.
      this.globalAudioElement.src = track.url;

      // Attempt to play the current track.
      this.globalAudioElement
        .play()
        .then(() => {
          // On success, set isPlaying flag to true.
          this.isPlaying = true;

          // Preload the next track if there is one.
          if (index + 1 < this.tracklist.length) {
            const nextTrack = this.tracklist[index + 1];
            // Create a new audio element for preloading the next track.
            const audioPreload = new Audio(nextTrack.url);
            audioPreload.preload = "auto"; // Set preload attribute to auto.
            audioPreload.addEventListener("canplaythrough", () => {
              // This event listener is set up for preloading, no action needed here.
            });
            audioPreload.load(); // Start loading the next track.
          }

          // Resolve the promise as the track is successfully playing.
          resolve();
        })
        .catch((error) => {
          // If playing the track fails, reject the promise with the error.
          reject(error);
        });

      // Set up an event listener for when the track ends.
      this.globalAudioElement.onended = () => {
        // Obtain the duration of the track that just finished playing.
        const duration = this.globalAudioElement.duration;
        // Update the timerDuration with the floor value of the track's duration.
        this.timerDuration += Math.floor(duration);

        // Update cumulativeElapsedTime with the track's duration.
        this.cumulativeElapsedTime += Number(track.duration);

        // Increment currentIndex to move to the next track.
        this.currentIndex++;

        // If there are more tracks to play, recursively call playTrack to play the next one.
        if (this.currentIndex < this.tracklist.length) {
          this.playTrack(this.currentIndex).then(resolve).catch(reject);
        } else {
          // If all tracks have been played, set isPlaying to false and resolve the promise.
          // this.isPlaying = false;
          this.handleEnded();
          resolve(); // Indicate that the playlist has finished.
        }
      };
    });
  }

  updatePlayButtonText(text) {
    const playButtonTextContainer = document.getElementById("play-button-text-container");
    if (playButtonTextContainer) playButtonTextContainer.textContent = text;
  }

  toggleButtonVisuals(isPlaying) {
    let isThemeInverted = getState(); // This will initialize isInverted based on localStorage

    // console.log(isThemeInverted);

    const svgIcon = document.querySelector("#play-button-svg-container .svg-icon");
    const playButton = document.querySelector("#play-button");
    const playButtonTextContainer = document.getElementById("play-button-text-container");
    const svgContainer = document.getElementById("play-button-svg-container");

    // Determine which SVG to use based on isPlaying and isThemeInverted
    let svgToUse;
    if (isPlaying) {
      svgToUse = isThemeInverted ? this.pausedInvertedSVG : this.pausedSVG;
    } else {
      svgToUse = isThemeInverted ? this.playingInvertedSVG : this.playingSVG;
    }

    // Apply the determined SVG and text
    if (isPlaying) {
      if (!playButton.classList.contains("playing")) {
        playButtonTextContainer.style.left = "50%";
        svgContainer.innerHTML = svgToUse; // Use determined SVG
        playButtonTextContainer.textContent = this.pausedText;
      }
    } else {
      if (!playButton.classList.contains("paused")) {
        if (!this.firstPlayDone) {
          // we're in a begin state
        } else {
          // Check to prevent redundant operations
          playButtonTextContainer.style.left = "35%";
          svgContainer.innerHTML = svgToUse; // Use determined SVG
          playButtonTextContainer.textContent = this.playingText;
        }
      }
    }
    playButton.classList.toggle("playing", isPlaying);
    playButton.classList.toggle("paused", !isPlaying);
  }
}
