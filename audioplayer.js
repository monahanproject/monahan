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

    this.cumulativeElapsedTimeInTotalPlaylist = 0;
    this.totalPlaylistDuration = 0; 
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
    this.totalPlaylistDuration = this.tracklist.reduce((acc, track, index) => {
      let durationToAdd = Number(track.duration);
      return acc + durationToAdd;
    }, 0);
    return this.totalPlaylistDuration;
  }

  updateProgressUI(elapsedSeconds, previousDuration) {
    const totalElapsedSeconds = elapsedSeconds + previousDuration;
    const remainingDurationSeconds = Math.max(0, this.totalPlaylistDuration - totalElapsedSeconds);
    const playedPercentage = (totalElapsedSeconds / this.totalPlaylistDuration) * 100;
    const playedTime = this.calculateMinutesAndSeconds(totalElapsedSeconds);
    const remainingTime = this.calculateMinutesAndSeconds(remainingDurationSeconds);
  
    requestAnimationFrame(() => {
      try {
        const progressBar = document.getElementById("progress-bar");
        const timePlayedElement = document.getElementById("time-played");
        const timeRemainingElement = document.getElementById("time-remaining");
  
        progressBar.style.width = `${playedPercentage}%`;
        timePlayedElement.innerText = `${playedTime.minutes}:${playedTime.seconds}`;
        timeRemainingElement.innerText = `-${remainingTime.minutes}:${remainingTime.seconds}`;
      } catch (error) {
        console.error("An error occurred in updateProgressUI:", error);
      }
    });
  }
  

  calculateMinutesAndSeconds(seconds) {
    seconds = Math.max(0, seconds); // Clamp seconds to a minimum of 0 to prevent negative values
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return {
      minutes: `${minutes < 10 ? "0" : ""}${minutes}`,
      seconds: `${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`,
    };
  }

  createTimerLoopAndUpdateProgressTimer() {

    clearInterval(this.updateIntervalId);

    var start = Date.now(); // Record the start time of the loop
    this.updateIntervalId = setInterval(() => {
      // Store the interval ID
      let delta = Date.now() - start;
      let deltaSeconds = Math.floor(delta / 1000);
      this.updateProgressUI(Math.floor(this.globalAudioElement.currentTime), this.timerDuration);
    }, 1000);
  }

  initializeButtonVisuals() {
    this.toggleButtonVisuals(false);
  }

  /////////////////////////////////////////////
  /////////         TRANSCRIPT      ///////////
  ////////////////////////////////////////////

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

    // Set initial style for the fade effect
    this.transcriptContainer.style.opacity = "0";
    this.transcriptContainer.style.transition = "opacity 0.5s ease-in-out";
    this.transcriptContainer.style.display = "none";

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
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.transcriptContainer.style.opacity = "1"; // Fade in
        });
      });
      transcriptButton.textContent = "Hide Transcript";
    } else {
      this.transcriptContainer.style.opacity = "0"; // Fade out
      // Wait for the fade-out transition before setting display to none
      setTimeout(() => {
        this.transcriptContainer.style.display = "none";
      }, 500); // The timeout duration should match the CSS transition duration
      transcriptButton.textContent = "Show Transcript";
    }
  }

  /////////////////////////////////////////////////////
  /////////         USER INTERACTIONS     ///////////
  /////////////////////////////////////////////////////

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

  /////////////////////////////////////////////////////
  /////////         HANDLE VOLUME     ///////////
  /////////////////////////////////////////////////////

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

  /////////////////////////////////////////////////////
  /////////         HANDLE PAUSE / PLAY     ///////////
  /////////////////////////////////////////////////////

  pausePlayback() {
    this.globalAudioElement.pause();
    this.isPlaying = false;
    // this.toggleButtonVisuals(false);
  }

  handlePlay() {
    this.isPlaying = true;
    this.toggleButtonVisuals(true);
  }

  handlePause() {
    this.isPlaying = false;
    this.toggleButtonVisuals(false);
  }

  /////////////////////////////////////////////////////
  /////////         HANDLE THE END     ///////////////
  /////////////////////////////////////////////////////

  handleEnded() {
    console.log("Playlist ended. Preparing to regenerate playlist.");

    this.playlistEnded = true; // Mark playlist as ended
    this.isPlaying = false; // Ensure isPlaying is set to false

    // Update the text of the play button to "Regenerate"
    this.updatePlayButtonText("AGAIN?");

    // Change the event listener on the play button to reload the page
    const playButton = document.getElementById("play-button");
    if (playButton) {
      // Properly remove any existing event listeners to avoid memory leaks or unwanted behavior
      // Note: This requires storing references to the original event listeners somewhere
      // For simplicity, this example directly sets a new listener, assuming no prior listeners exist
      playButton.onclick = () => {
        localStorage.setItem("returnToSpot", "playlistTop"); // Optionally save a value to scroll into view
        window.location.reload(); // Reload the webpage
      };
    }

    // Additional cleanup or UI updates can go here
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

      // Immediately update currentTime without setTimeout
      this.globalAudioElement.currentTime = newPlayerTime;

      // Use the 'seeked' event to know when the currentTime update is complete
      const onTimeUpdate = () => {
        this.isUpdatingTime = false;
        this.globalAudioElement.removeEventListener("seeked", onTimeUpdate);
      };

      this.globalAudioElement.addEventListener("seeked", onTimeUpdate);
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

  /////////////////////////////////////////////////////
  /////////         START PLAYBACK     ///////////////
  /////////////////////////////////////////////////////

  async startPlayback() {
    console.log("startPlayback called. Current index:", this.currentIndex, "Playlist ended:", this.playlistEnded, "Is playing:", this.isPlaying);
    // Prioritize checking if a new playlist needs to be started.
    if (this.playlistEnded && !this.isPlaying) {
      console.log("End of playlist was detected. here's where I'd make a new playlist...");
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
          this.createTranscriptContainer();
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
    }
  }

  /////////////////////////////////////////////////////
  /////////          PLAY TRACK      ///////////////
  /////////////////////////////////////////////////////

  playTrack(index) {
    console.log("playTrack(index)");

    if (index >= this.tracklist.length) {
      console.log("handling ended, shouldn't do this so soon");
      this.handleEnded();
      return Promise.reject(new Error("Reached the end of the playlist"));
    }

    // Return a new promise that will handle the play process.
    return new Promise((resolve, reject) => {
      // Check if the index is beyond the tracklist's length, indicating the end of the playlist.
      if (index >= this.tracklist.length) {
        // Log that the end of the playlist has been reached.
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
        // this.timerDuration += Math.floor(duration); findme
        this.timerDuration += this.globalAudioElement.duration;

        console.log(`[Track End] Current Index: ${this.currentIndex}, Track Duration: ${duration}, Updated Timer Duration: ${this.timerDuration}`);

        // Update cumulativeElapsedTime with the track's duration.
        this.cumulativeElapsedTimeInTotalPlaylist += Number(track.duration);

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

      // this.globalAudioElement.onended = () => {
      //   const duration = this.globalAudioElement.duration;
      //   this.timerDuration += duration;

      //   console.log(`[Track End] Index: ${this.currentIndex}, Duration: ${duration}, Timer: ${this.timerDuration}`);
      //   this.cumulativeElapsedTime += Number(track.duration);
      //   this.currentIndex++;

      //   if (this.currentIndex < this.tracklist.length) {
      //     this.playTrack(this.currentIndex).then(resolve).catch(reject);
      //   } else {
      //     console.log("Truly at the end of playlist. Handling ending.");
      //     this.handleEnded();
      //     resolve(); // End of playlist
      //   }
      // };
    });
  }

  /////////////////////////////////////////////////////
  /////////       PLAY BUTTON TEXT     ///////////////
  /////////////////////////////////////////////////////

  updatePlayButtonText(text) {
    const playButtonTextContainer = document.getElementById("play-button-text-container");
    if (playButtonTextContainer) playButtonTextContainer.textContent = text;
  }

  toggleButtonVisuals(isPlaying) {
    let isThemeInverted = getState(); // This will initialize isInverted based on localStorage
    const svgIcon = document.querySelector("#play-button-svg-container .svg-icon");
    const playButton = document.querySelector("#play-button");
    const playButtonTextContainer = document.getElementById("play-button-text-container");
    const svgContainer = document.getElementById("play-button-svg-container");

    let currLang = localStorage.getItem("preferredLanguage");
    if (!currLang) {
      console.log(currLang);
      currLang = "EN"; // Set to "EN" if not already set
    }

    // Determine which SVG to use based on isPlaying and isThemeInverted
    let svgToUse;
    if (isPlaying) {
      // playButton.style.backgroundColor = "#D3D3D3"; // Example playing state color

      svgToUse = isThemeInverted ? this.pausedInvertedSVG : this.pausedSVG;
    } else {
      // playButton.style.backgroundColor = "#FFFFFF"; // Example paused state color

      svgToUse = isThemeInverted ? this.playingInvertedSVG : this.playingSVG;
    }

    // Apply the determined SVG and text
    if (isPlaying) {
      if (!playButton.classList.contains("playing")) {
        playButtonTextContainer.style.left = "50%";
        svgContainer.innerHTML = svgToUse; // Use determined SVG
        console.log(currLang);
        if (currLang === "EN") {
          playButtonTextContainer.textContent = "STOP";
        } else {
          playButtonTextContainer.textContent = "ARRÊTER";
        }
      }
    } else {
      if (!playButton.classList.contains("paused")) {
        if (!this.firstPlayDone) {
          // we're in a begin state
        } else {
          // Check to prevent redundant operations
          playButtonTextContainer.style.left = "35%";
          svgContainer.innerHTML = svgToUse; // Use determined SVG
          console.log(currLang);

          if (currLang === "EN") {
            playButtonTextContainer.textContent = "PLAY";
          } else {
            playButtonTextContainer.style.left = "45%";
            playButtonTextContainer.textContent = "DÉBUTER";
          }
        }
      }
    }
    playButton.classList.toggle("playing", isPlaying);
    playButton.classList.toggle("paused", !isPlaying);
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  const returnToSpot = localStorage.getItem("returnToSpot");
  if (returnToSpot === "audio-player-container") {
    const element = document.getElementById("audio-player-container"); // Adjust based on actual ID
    if (element) element.scrollIntoView();
    localStorage.removeItem("returnToSpot"); // Clean up
  }
});
