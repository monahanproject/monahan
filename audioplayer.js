import { curatedTracklist, initializeApp } from "./play.js";
import { getState, setState, getLangState, setLangState, updateAriaStatusMessage } from "./state.js";
import { Transcript } from "./transcriptMaker.js";

let isInverted = getState(); // This will initialize isInverted based on localStorage

if (localStorage.getItem("themeInverted") === null) {
  // If the key doesn't exist, initialize it to false
  localStorage.setItem("themeInverted", "false");
}

// let lang = localStorage.getItem("lang") || "EN"; // Retrieve initial language setting
// console.log(lang);

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXX  SIMPLE AUDIO PLAYER class  XXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

export class SimpleAudioPlayer {
  constructor(tracklist) {
    // console.log("SimpleAudioPlayer initialized with tracklist:", tracklist);
    this.tracklist = tracklist;
    this.currentIndex = 0;
    this.globalAudioElement = document.createElement("audio");
    this.isPlaying = false;
    this.firstPlayDone = false;

    this.totalPlaylistDuration = 0;
    this.isUpdatingTime = false; // Flag to prevent rapid updates
    this.timerDuration = 0;
    this.remainingTime = 0;
    this.allowProgressUpdate = true;

    this.transcript = new Transcript(this);
    this.lang = localStorage.getItem("lang") || "EN";

    this.beginAgain = `<img id="begin-again" class="svg-icon" src="images/svg/beginAgain.svg" alt="Begin again">`;
    this.beginAgainInvert = `<img id="begin-again" class="svg-icon" src="images/svg/beginAgainInvert.svg" alt="Begin again">`;

    this.skipBackwardButton = document.getElementById("skipBackwardButton");
    this.skipForwardButton = document.getElementById("skipForwardButton");
    this.skipBackwardsImpossible = true;

    this.playButton = document.getElementById("play-button");

    this.playingSVG = `<img id="play-icon" class="svg-icon" src="images/svg/playButton.svg" alt="Play Icon">`;
    this.playingInvertedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/playButtonInvert.svg" alt="Play Icon">`;

    this.pausedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/pauseButton.svg" alt="Pause Icon">`;
    this.pausedInvertedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/pauseButtonInvert.svg" alt="Pause Icon">`;

    this.playlistEnded = false; // Track whether the current playlist has ended

    this.createTimerLoopAndUpdateProgressTimer();

    this.setupInitialUserInteraction();
    this.createVolumeSlider();
    // this.initializeButtonVisuals();
    this.calcTotalPlaylistDuration();
    this.calcTotalPlaylistRemainingTime();

    this.globalAudioElement.onplay = () => this.handlePlay();
    this.globalAudioElement.onpause = () => this.handlePause();
    this.globalAudioElement.onended = () => this.handleEnded();
  }

  

  toggleAriaPressed(element) {
    let isPressed = element.getAttribute('aria-pressed') === 'true';
    element.setAttribute('aria-pressed', !isPressed);
  }

  // TIMER

  calcTotalPlaylistDuration() {
    this.totalPlaylistDuration = this.tracklist.reduce((acc, track, index) => {
      let durationToAdd = Number(track.duration);
      return acc + durationToAdd;
    }, 0);
    return this.totalPlaylistDuration;
  }

  calcTotalPlaylistRemainingTime() {
    this.remainingTime = this.totalPlaylistDuration;
    return this.remainingTime;
  }

  updateProgressUI(elapsedSeconds, previousDuration) {
    if (this.playlistEnded) {
      const timeRemainingElement = document.getElementById("time-remaining");
      timeRemainingElement.innerText = `00:00`;
      return;
    }

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
        progressBar.setAttribute("aria-valuenow", playedPercentage.toFixed(0));

        timePlayedElement.innerText = `${playedTime.minutes}:${playedTime.seconds}`;
        timeRemainingElement.innerText = `-${remainingTime.minutes}:${remainingTime.seconds}`;

        timePlayedElement.setAttribute('aria-hidden', 'true');
        timeRemainingElement.setAttribute('aria-hidden', 'true');
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
    let checkCounter = 0; // Counter to track when to perform the skip backward check

    this.updateIntervalId = setInterval(() => {
      let delta = Date.now() - start;
      let deltaSeconds = Math.floor(delta / 1000);
      this.updateProgressUI(Math.floor(this.globalAudioElement.currentTime), this.timerDuration);

      checkCounter++;
      if (checkCounter >= 15) {
        // Perform the check every 15 seconds
        this.checkAndEnableSkipBackward();
        checkCounter = 0; // Reset counter after the check
      }
    }, 1000);
  }

  /////////////////////////////////////////////////////
  /////////         USER INTERACTIONS     ///////////
  /////////////////////////////////////////////////////

  setupInitialUserInteraction() {
    if (this.playButton) {
      this.playButton.addEventListener("click", () => this.startPlayback());
    }
    if (this.skipBackwardButton) {
      this.skipBackwardButton.addEventListener("click", () => {
        this.handleSkipBackward();
      });
    }
    if (this.skipForwardButton) {
      this.skipForwardButton.addEventListener("click", () => {
        this.handleSkipForward();
      });
    }
    this.setupVolumeControlButtons();

  }

  /////////////////////////////////////////////////////
  /////////         HANDLE VOLUME     ///////////
  /////////////////////////////////////////////////////

  createVolumeSlider() {
    const volumeSlider = document.getElementById("volume-slider");
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

        // Initial UI update for volume indicators if necessary
        this.updateVolumeIndicator(parseFloat(volumeSlider.value));
    }
}

handleVolumeChange(event) {
    const volumeSlider = event.target;
    if (volumeSlider instanceof HTMLInputElement) {
        const volumeLevel = parseFloat(volumeSlider.value) / 100;
        this.globalAudioElement.volume = volumeLevel;
        volumeSlider.setAttribute("aria-valuenow", volumeSlider.value);
        this.updateVolumeIndicator(volumeLevel);
    }
}


  updateVolumeIndicator(volumeLevel) {
    const volumeFiller = document.getElementById("volume-bar-filler");
    const volumeThinner = document.getElementById("volume-bar-thinner");

    if (volumeFiller) {
      volumeFiller.style.width = `${volumeLevel}%`;
      const volumeSlider = document.getElementById("volume-slider");
      if (volumeSlider) {
        volumeSlider.setAttribute("aria-valuenow", volumeLevel);
      }
    }

    if (volumeThinner) {
      volumeThinner.style.width = `${100 - volumeLevel}%`;
      volumeThinner.style.left = `${volumeLevel}%`;
    }
  }

  setupVolumeControlButtons() {
    const lowerVolumeBtn = document.getElementById("lower-vol");
    const raiseVolumeBtn = document.getElementById("raise-vol");
  
    if (lowerVolumeBtn) {
      lowerVolumeBtn.addEventListener("click", () => {
        this.globalAudioElement.volume = 0;
        const volumeSlider = document.getElementById("volume-slider");
        if (volumeSlider) {
          volumeSlider.value = "0"; // Update the slider position
        }
        this.updateVolumeIndicator(0); // Update the UI to reflect the volume change
        this.toggleAriaPressed(lowerVolumeBtn); // Update aria-pressed
      });
    }
  
    if (raiseVolumeBtn) {
      raiseVolumeBtn.addEventListener("click", () => {
        this.globalAudioElement.volume = 1;
        const volumeSlider = document.getElementById("volume-slider");
        if (volumeSlider) {
          volumeSlider.value = "100"; // Update the slider position
        }
        this.updateVolumeIndicator(100); // Update the UI to reflect the volume change
        this.toggleAriaPressed(raiseVolumeBtn); // Update aria-pressed
      });
    }
  }
  

  /////////////////////////////////////////////////////
  /////////         HANDLE PAUSE / PLAY     ///////////
  /////////////////////////////////////////////////////

  handlePlay() {
    updateAriaStatusMessage("Starting playback");
    this.isPlaying = true;
    this.toggleButtonVisuals(true);
    this.toggleAriaPressed(document.getElementById("play-button"));

  }

  handlePause() {
    updateAriaStatusMessage("Pausing playback");
    // this.globalAudioElement.pause();
    this.isPlaying = false;
    this.toggleButtonVisuals(false);
    this.toggleAriaPressed(document.getElementById("play-button"));

  }

  /////////////////////////////////////////////////////
  /////////         HANDLE THE END     ///////////////
  /////////////////////////////////////////////////////

  handleEnded() {
    console.log("Playlist ended. Preparing to regenerate playlist.");

    this.playlistEnded = true; // Mark playlist as ended
    this.isPlaying = false; // Ensure isPlaying is set to false

    // Update the text of the play button to "Regenerate"
    this.updatePlayButtonText("");

    // Insert or update the overlay SVG
    // Ensure the parent container is positioned relatively
    const existingOverlay = document.getElementById("play-button");
    existingOverlay.style.position = "relative";
    // Check if the overlay SVG already exists to avoid duplicates
    let overlaySvgElement = existingOverlay.querySelector(".overlay-svg");
    if (!overlaySvgElement) {
      // Create a new overlay SVG element if it does not exist
      overlaySvgElement = document.createElement("div");
      overlaySvgElement.className = "overlay-svg";
      overlaySvgElement.style.position = "absolute"; // Position it absolutely within the parent
      overlaySvgElement.style.top = "25%"; // Adjust these values as needed
      overlaySvgElement.style.left = "10%";
      overlaySvgElement.style.width = "50%"; // Ensure it covers the parent
      overlaySvgElement.style.height = "50%";
      overlaySvgElement.style.zIndex = "10"; // Ensure it's on top
      existingOverlay.appendChild(overlaySvgElement);

      let isThemeInverted = getState();
      if (!isThemeInverted) {
        console.log("theme not inverted");
        overlaySvgElement.innerHTML = this.beginAgain;
      } else {
        console.log("theme inverted");
        overlaySvgElement.innerHTML = this.beginAgainInvert;
      }
    }

    // Change the event listener on the play button to reload the page
    if (this.playButton) {
      // Properly remove any existing event listeners to avoid memory leaks or unwanted behavior
      // Note: This requires storing references to the original event listeners somewhere
      // For simplicity, this example directly sets a new listener, assuming no prior listeners exist
      this.playButton.onclick = () => {
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


    // hide these from aria because aria is reporting these values twice
    timePlayedElement.setAttribute('aria-hidden', 'true');
    timeRemainingElement.setAttribute('aria-hidden', 'true');


    if (progressBar && progressDot && timePlayedElement && timeRemainingElement) {
      progressBar.style.width = "0%";
      progressDot.style.left = "0%";
      timePlayedElement.innerText = "00:00";
      timeRemainingElement.innerText = "00:00"; // Adjust according to total duration if available
    }
  }



  ///////////////////////////////////
  ////// skip forward and back /////
  ///////////////////////////////////

  applySvgGlowEffect = (buttonElement) => {
    buttonElement.classList.add("svg-glow");
    if (buttonElement) {
      setTimeout(() => {
        buttonElement.classList.remove("svg-glow");
      }, 500); // Match the duration with CSS
    }
  };

  handleSkipForward() {
    console.log("Attempting to skip forward. Remaining time:", this.remainingTime);
    if (!this.isSkipForwardAllowed()) {
      this.skipForwardButton.style.opacity = ".4";
      return;
    }
    this.updateUIForSkip("forward");
    this.calculateAndAdjustTime(20, "forward");
    this.toggleAriaPressed(this.skipForwardButton);

  }

  handleSkipBackward() {
    console.log("Attempting to skip backward. Current time:", this.globalAudioElement.currentTime);
    if (!this.isSkipBackwardAllowed()) {
      this.skipBackwardButton.style.opacity = ".4";
      return;
    }
    this.updateUIForSkip("backward");
    this.calculateAndAdjustTime(-15, "backward");
    this.toggleAriaPressed(this.skipBackwardButton);

  }

  isSkipForwardAllowed() {
    if (this.remainingTime <= 80) {
      console.log("Skip forward blocked: Not enough remaining time.");
      updateAriaStatusMessage("Can't skip forwards, we're near the end of the playlist");
      return false;
    }
    return true;
  }

  isSkipBackwardAllowed() {
    if (this.globalAudioElement.currentTime < 16) {
      updateAriaStatusMessage("Can't skip backwards, have reached the beginning of this track");
      return false;
    }
    return true;
  }

  // Time adjustment
  calculateAndAdjustTime(timeChange, direction) {
    if (this.isUpdatingTime) {
        console.log(`Skip ${direction} is currently updating, request ignored.`);
        return;
    }
    this.isUpdatingTime = true;
    const disableDuration = 10;  

    const targetButton = direction === "forward" ? this.skipForwardButton : this.skipBackwardButton;
    targetButton.classList.add("disabled-button");
    // targetButton.disabled = true;  // Disable the button

    const initialTime = this.globalAudioElement.currentTime;
    const newPlayerTime = Math.max(0, Math.min(initialTime + timeChange, this.totalPlaylistDuration));
    console.log(`Initial time: ${initialTime}, Calculated new player time: ${newPlayerTime}`);

    this.globalAudioElement.currentTime = newPlayerTime;
    setTimeout(() => {
        this.checkIfTimeUpdated(initialTime);
        targetButton.classList.remove("disabled-button");
        // targetButton.disabled = false;  // Re-enable the button after 2 seconds
        this.isUpdatingTime = false;
    }, disableDuration);  // Match the timeout to the animation duration
}


  // UI updates
  updateUIForSkip(direction) {
    console.log(direction);
    const targetButton = direction === "forward" ? this.skipForwardButton : this.skipBackwardButton;
    console.log(targetButton);
    this.applySvgGlowEffect(targetButton);
  }

  checkIfTimeUpdated(initialTime) {
    console.log("Timeout check: Current time after attempt:", this.globalAudioElement.currentTime);
    if (this.globalAudioElement.currentTime === initialTime) {
      updateAriaStatusMessage("Unable to skip, possibly at the end or beginning of the track");
    }
    this.isUpdatingTime = false;
  }

  checkAndEnableSkipBackward() {
    if (this.globalAudioElement.currentTime > 16) {
      this.skipBackwardButton.style.opacity = "1.0";
      this.skipBackwardsImpossible = false;
    }
  }

  /////////////////////////////////////////////////////
  /////////         START PLAYBACK     ///////////////
  /////////////////////////////////////////////////////

  async startPlayback() {
    document.getElementById("ffrw-button-container").style.opacity = "1";
    // check if there are tracks left in the playlist to play or resume.
    if (this.currentIndex < this.tracklist.length) {
      if (!this.isPlaying) {
        console.log("Playing or resuming track at index:", this.currentIndex);
        if (!this.firstPlayDone) {
          // First play of the playlist.
          console.log("First play of the new playlist.");
          await this.playTrack(this.currentIndex);
          this.firstPlayDone = true; // Prevents re-initialization in future plays.
          document.getElementById("hidePlayerControls").classList.remove("hidden");
        } else {
          // Resume playback.
          console.log("Resuming playback.");
          this.globalAudioElement.play();
        }
        this.toggleButtonVisuals(true); // Update UI to show playing state.
      } else {
        // Currently playing, so pause.
        console.log("double pause.");
        this.globalAudioElement.pause();

        // this.handlePause();
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
    // Return a new promise that will handle the play process.
    return new Promise((resolve, reject) => {
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

      // every time any track ends...
      this.globalAudioElement.onended = () => {
        // Log current track information and timing before updates
        console.log(
          `Track ${this.currentIndex} ended. Name: ${this.tracklist[this.currentIndex].name}. Duration: ${this.globalAudioElement.duration}`
        );

        // Update the timerDuration and log before and after values
        this.timerDuration += this.globalAudioElement.duration;
        this.remainingTime -= this.globalAudioElement.duration;

        // Move to the next track
        this.currentIndex++;

        // If there are more tracks to play, recursively call playTrack to play the next one.
        if (this.currentIndex < this.tracklist.length) {
          this.playTrack(this.currentIndex).then(resolve).catch(reject);
        } else {
          console.log("End of playlist reached.");
          this.handleEnded();
          resolve(); // Indicate that the playlist has finished.
        }
      };
    });
    document.getElementById("play-button").focus();

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
    const playButtonTextContainer = document.getElementById("play-button-text-container");
    const svgContainer = document.getElementById("play-button-svg-container");

    let currLang = localStorage.getItem("lang");
    if (!currLang) {
      console.log(currLang);
      currLang = "EN"; // Set to "EN" if not already set
    }

    let svgToUse;
    if (isPlaying) {

      svgToUse = isThemeInverted ? this.pausedInvertedSVG : this.pausedSVG;
    } else {

      svgToUse = isThemeInverted ? this.playingInvertedSVG : this.playingSVG;
    }

    // Apply the determined SVG and text
    if (isPlaying) {
      if (!this.playButton.classList.contains("playing")) {
        playButtonTextContainer.style.left = "50%";
        svgContainer.innerHTML = svgToUse; // Use determined SVG
        // console.log(currLang);
        if (currLang === "EN") {
          playButtonTextContainer.textContent = "STOP";
        } else {
          playButtonTextContainer.textContent = "ARRÊTER";
        }
      }
    } else {
      if (!this.playButton.classList.contains("paused")) {
        if (!this.firstPlayDone) {
          // we're in a begin state
        } else {
          // Check to prevent redundant operations
          playButtonTextContainer.style.left = "35%";
          svgContainer.innerHTML = svgToUse; // Use determined SVG
          // console.log(currLang);

          if (currLang === "EN") {
            playButtonTextContainer.textContent = "PLAY";
          } else {
            playButtonTextContainer.style.left = "40%";
            playButtonTextContainer.textContent = "COMMENCER";
          }
        }
      }
    }
    this.playButton.classList.toggle("playing", isPlaying);
    this.playButton.classList.toggle("paused", !isPlaying);
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  const returnToSpot = localStorage.getItem("returnToSpot");
  if (returnToSpot === "audio-player-container") {
    const element = document.getElementById("play-button"); // Adjust based on actual ID
    if (element) element.scrollIntoView();
    localStorage.removeItem("returnToSpot"); // Clean up
  }
});
