import { curatedTracklist, initializeApp } from "./play.js";
import { getState, setState, getLangState, setLangState, updateAriaStatusMessage } from "./state.js";
import { Transcript } from "./transcriptMaker.js";

// Initialize theme inversion state from localStorage
let isInverted = getState(); 

// If the themeInverted key doesn't exist in localStorage, initialize it to false
if (localStorage.getItem("themeInverted") === null) {
  localStorage.setItem("themeInverted", "false");
}

// Simple Audio Player class
export class SimpleAudioPlayer {
  constructor(tracklist) {
    this.tracklist = tracklist;
    this.currentIndex = 0;
    this.globalAudioElement = document.createElement("audio");
    this.isPlaying = false;
    this.firstPlayDone = false;

    this.totalPlaylistDuration = 0;
    this.isUpdatingTime = false; 
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

    this.lowerVolumeBtn = document.getElementById("lower-vol");
    this.raiseVolumeBtn = document.getElementById("raise-vol");


    this.playButton = document.getElementById("play-button");

    this.playingSVG = `<img id="play-icon" class="svg-icon" src="images/svg/playButton.svg" alt="Play Icon">`;
    this.playingInvertedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/playButtonInvert.svg" alt="Play Icon">`;

    this.pausedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/pauseButton.svg" alt="Pause Icon">`;
    this.pausedInvertedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/pauseButtonInvert.svg" alt="Pause Icon">`;

    this.playlistEnded = false; // Track whether the current playlist has ended

    this.createTimerLoopAndUpdateProgressTimer();
    this.setupInitialUserInteraction();
    this.createVolumeSlider();
    this.calcTotalPlaylistDuration();
    this.calcTotalPlaylistRemainingTime();

    this.globalAudioElement.onplay = () => this.handlePlay();
    this.globalAudioElement.onpause = () => this.handlePause();
    this.globalAudioElement.onended = () => this.handleEnded();
  }

  // Toggle aria-pressed attribute
  toggleAriaPressed(element) {
    let isPressed = element.getAttribute('aria-pressed') === 'true';
    element.setAttribute('aria-pressed', !isPressed);
  }

  calcTotalPlaylistDuration() {
    this.totalPlaylistDuration = this.tracklist.reduce((acc, track) => acc + Number(track.duration), 0);
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

  setupInitialUserInteraction() {
    if (this.playButton) {
      this.playButton.addEventListener("click", () => this.startPlayback());
    }
    if (this.skipBackwardButton) {
      this.skipBackwardButton.addEventListener("click", () => {
        this.handleSkipBackward();
        setTimeout(() => this.skipBackwardButton.focus(), 0); // Add a small delay before focusing
      });
    }
    if (this.skipForwardButton) {
      this.skipForwardButton.addEventListener("click", () => {
        this.handleSkipForward();
        setTimeout(() => this.skipForwardButton.focus(), 0); // Add a small delay before focusing
      });

    }
    this.setupVolumeControlButtons();
  }

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

        this.globalAudioElement.volume = parseFloat(volumeSlider.value) / 100;
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

    if (this.lowerVolumeBtn) {
      this.lowerVolumeBtn.addEventListener("click", () => {
        this.globalAudioElement.volume = 0;
        const volumeSlider = document.getElementById("volume-slider");
        if (volumeSlider && volumeSlider instanceof HTMLInputElement) {
          volumeSlider.value = "0"; // Update the slider position
        }
        this.updateVolumeIndicator(0); // Update the UI to reflect the volume change
        this.toggleAriaPressed(this.lowerVolumeBtn); // Update aria-pressed
        setTimeout(() => this.lowerVolumeBtn.focus(), 0); // Add a small delay before focusing
      });

    }

    if (this.raiseVolumeBtn) {
      this.raiseVolumeBtn.addEventListener("click", () => {
        this.globalAudioElement.volume = 1;
        const volumeSlider = document.getElementById("volume-slider");
        if (volumeSlider && volumeSlider instanceof HTMLInputElement) {
          volumeSlider.value = "100"; // Update the slider position
        }
        this.updateVolumeIndicator(100); // Update the UI to reflect the volume change
        this.toggleAriaPressed(this.raiseVolumeBtn); // Update aria-pressed
        setTimeout(() => this.raiseVolumeBtn.focus(), 0); // Add a small delay before focusing
      });

    }
  }

  handlePlay() {
    updateAriaStatusMessage("Starting playback");
    this.isPlaying = true;
    this.toggleButtonVisuals(true);
    this.toggleAriaPressed(document.getElementById("play-button"));
    setTimeout(() => this.playButton.focus(), 0); // Add a small delay before focusing
  }

  handlePause() {
    updateAriaStatusMessage("Pausing playback");
    this.isPlaying = false;
    this.toggleButtonVisuals(false);
    this.toggleAriaPressed(document.getElementById("play-button"));
    setTimeout(() => this.playButton.focus(), 0); // Add a small delay before focusing
  }

  handleEnded() {
    console.log("Playlist ended. Preparing to regenerate playlist.");

    this.playlistEnded = true;
    this.isPlaying = false;

    this.updatePlayButtonText("");

    const existingOverlay = document.getElementById("play-button");
    existingOverlay.style.position = "relative";
    
    let overlaySvgElement = existingOverlay.querySelector(".overlay-svg");
    if (!overlaySvgElement) {
      overlaySvgElement = document.createElement("div");
      overlaySvgElement.className = "overlay-svg";
      overlaySvgElement.style.position = "absolute"; 
      overlaySvgElement.style.top = "25%"; 
      overlaySvgElement.style.left = "10%";
      overlaySvgElement.style.width = "50%"; 
      overlaySvgElement.style.height = "50%";
      overlaySvgElement.style.zIndex = "10"; 
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

    if (this.playButton) {
      this.playButton.onclick = () => {
        localStorage.setItem("returnToSpot", "play-button"); 
        window.location.reload();
      };
    }
  }

  resetProgressUI() {
    console.log("Resetting Progress UI for new playlist");
    const progressBar = document.getElementById("progress-bar");
    const progressDot = document.getElementById("progress-dot");
    const timePlayedElement = document.getElementById("time-played");
    const timeRemainingElement = document.getElementById("time-remaining");

    timePlayedElement.setAttribute('aria-hidden', 'true');
    timeRemainingElement.setAttribute('aria-hidden', 'true');

    if (progressBar && progressDot && timePlayedElement && timeRemainingElement) {
      progressBar.style.width = "0%";
      progressDot.style.left = "0%";
      timePlayedElement.innerText = "00:00";
      timeRemainingElement.innerText = "00:00"; 
    }
  }

  applySvgGlowEffect(buttonElement) {
    buttonElement.classList.add("svg-glow");
    if (buttonElement) {
      setTimeout(() => {
        buttonElement.classList.remove("svg-glow");
      }, 500);
    }
  }

  handleSkipForward() {
    console.log("Attempting to skip forward. Remaining time:", this.remainingTime);
    if (!this.isSkipForwardAllowed()) {
      this.skipForwardButton.style.opacity = ".4";
      return;
    }
    this.updateUIForSkip("forward");
    this.calculateAndAdjustTime(20, "forward");
    this.toggleAriaPressed(this.skipForwardButton);
    // this.skipForwardButton.focus();

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
    // this.skipBackwardButton.focus();

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

  calculateAndAdjustTime(timeChange, direction) {
    if (this.isUpdatingTime) {
        console.log(`Skip ${direction} is currently updating, request ignored.`);
        return;
    }
    this.isUpdatingTime = true;
    const disableDuration = 10;  

    const targetButton = direction === "forward" ? this.skipForwardButton : this.skipBackwardButton;
    targetButton.classList.add("disabled-button");

    const initialTime = this.globalAudioElement.currentTime;
    const newPlayerTime = Math.max(0, Math.min(initialTime + timeChange, this.totalPlaylistDuration));
    console.log(`Initial time: ${initialTime}, Calculated new player time: ${newPlayerTime}`);

    this.globalAudioElement.currentTime = newPlayerTime;
    setTimeout(() => {
        this.checkIfTimeUpdated(initialTime);
        targetButton.classList.remove("disabled-button");
        this.isUpdatingTime = false;
    }, disableDuration);
  }

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

  async startPlayback() {
    document.getElementById("ffrw-button-container").style.opacity = "1";
    if (this.currentIndex < this.tracklist.length) {
      if (!this.isPlaying) {
        console.log("Playing or resuming track at index:", this.currentIndex);
        if (!this.firstPlayDone) {
          console.log("First play of the new playlist.");
          await this.playTrack(this.currentIndex);
          this.firstPlayDone = true; // Prevents re-initialization in future plays.
          document.getElementById("hidePlayerControls").classList.remove("hidden");
        } else {
          console.log("Resuming playback.");
          this.globalAudioElement.play();
        }
        this.toggleButtonVisuals(true); // Update UI to show playing state.
      } else {
        console.log("double pause.");
        this.globalAudioElement.pause();
      }
    } else {
      console.log("Fallback: Reached end of playlist, preparing new playlist...");
    }
  }

  playTrack(index) {
    return new Promise((resolve, reject) => {
      const track = this.tracklist[index];
      this.globalAudioElement.src = track.url;

      this.globalAudioElement
        .play()
        .then(() => {
          this.isPlaying = true;
          // this.playButton.focus();

          if (index + 1 < this.tracklist.length) {
            const nextTrack = this.tracklist[index + 1];
            const audioPreload = new Audio(nextTrack.url);
            audioPreload.preload = "auto";
            audioPreload.addEventListener("canplaythrough", () => {});
            audioPreload.load();
          }

          resolve();
        })
        .catch((error) => {
          reject(error);
        });

      this.globalAudioElement.onended = () => {
        console.log(
          `Track ${this.currentIndex} ended. Name: ${this.tracklist[this.currentIndex].name}. Duration: ${this.globalAudioElement.duration}`
        );

        this.timerDuration += this.globalAudioElement.duration;
        this.remainingTime -= this.globalAudioElement.duration;

        this.currentIndex++;

        if (this.currentIndex < this.tracklist.length) {
          this.playTrack(this.currentIndex).then(resolve).catch(reject);
        } else {
          console.log("End of playlist reached.");
          this.handleEnded();
          resolve();
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

    if (isPlaying) {
      if (!this.playButton.classList.contains("playing")) {
        playButtonTextContainer.style.left = "50%";
        svgContainer.innerHTML = svgToUse; 
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
          playButtonTextContainer.style.left = "35%";
          svgContainer.innerHTML = svgToUse; 
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

// Scroll to a specific element on page load if indicated in localStorage
document.addEventListener("DOMContentLoaded", (event) => {
  const returnToSpot = localStorage.getItem("returnToSpot");
  if (returnToSpot === "play-button") {
    const element = document.getElementById("play-button"); 
    if (element) element.scrollIntoView();
    localStorage.removeItem("returnToSpot"); 
  }
});
