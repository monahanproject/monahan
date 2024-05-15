import { curatedTracklist, initializeApp } from "./play.js";
import { getState, setState, getLangState, setLangState, updateAriaStatusMessage } from "./state.js";

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

    this.transcript = "";
    this.lang = localStorage.getItem("lang") || "EN";

    this.transcriptVisible = false;
    this.transcriptContent = null;
    this.transcriptContainer = document.getElementById("transcriptContainer");
    this.beginAgain = `<img id="begin-again" class="svg-icon" src="images/svg/beginAgain.svg" alt="Begin again">`;
    this.beginAgainInvert = `<img id="begin-again" class="svg-icon" src="images/svg/beginAgainInvert.svg" alt="Begin again">`;

    this.skipBackwardButton = document.getElementById("skipBackwardButton");
    this.skipForwardButton = document.getElementById("skipForwardButton");
    this.skipBackwardsImpossible = true;

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

      console.log("get me out of here!");
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

        // console.log(`Progress Bar Updated: ${progressBar.style.width}`);
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

      this.lang = getLangState();

      if (this.lang == "EN") {
        // updateAriaStatusMessage("Created a transcript");
        transcriptButton = this.createElement("button", {
          type: "button",
          className: "btn",
          id: "transcriptButton",
          textContent: "Show Transcript",
        });
      } else {
        transcriptButton = this.createElement("button", {
          type: "button",
          className: "btn",
          id: "transcriptButton",
          textContent: "Afficher la Transcription",
        });
      }

      const transBtnContainer = document.getElementById("transButtonContainer");
      transBtnContainer.appendChild(transcriptButton);
      transcriptButton.addEventListener("click", this.toggleTranscript.bind(this));
    }

    // Initialize or clear transcriptContent as needed
    if (!this.transcriptContent) {
      this.language = localStorage.getItem("lang");

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
      // doubleLineBreak: /\*/g,
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
    let language = localStorage.getItem("lang");
    console.log(`lang is ${language}`);
    const langKey = language === "EN" ? "engTrans" : "frTrans";
    console.log(`langKey is ${langKey}`);

    const copyRightText =
      language === "EN"
        ? "$All recordings and transcripts are copyright protected. All rights reserved.$$"
        : "$Les enregistrements et les transcriptions sont protégés par le droit d’auteur. Tous droits réservés.$$";

    // Logging the start of transcript update process
    console.log("Starting to update transcript...");

    this.tracklist.forEach((song, index) => {
      const inputString = song[langKey];
      if (inputString && inputString.trim() !== "") {
        // Log each track name or identifier as its transcript is being processed
        // Assuming 'song' has a 'name' property or similar identifier
        // console.log(`Processing transcript for track #${index + 1}: ${song.name || "Unnamed Track"}`);

        this.transcriptContainer.appendChild(this.createHTMLFromText(inputString));
      }
    });

    // Log completion of adding tracks to the transcript
    console.log("All track transcripts processed.");

    this.transcriptContainer.appendChild(this.createHTMLFromText(copyRightText));
    this.transcriptContainer.style.display = "block";

    // Final log to indicate the entire update process is done
    console.log("Transcript update completed.");
  }

  // Function to toggle the transcript visibility
  toggleTranscript() {
    const transcriptButton = document.getElementById("transcriptButton");

    this.transcriptVisible = !this.transcriptVisible; // Toggle the flag first for more predictable logic
    if (this.transcriptVisible) {
      this.updateTranscript(); // Update before showing
      this.transcriptContainer.style.display = "block";
      // Use double requestAnimationFrame to ensure the transition starts after the element is displayed
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.transcriptContainer.style.opacity = "1"; // Fade in
          this.transcriptContainer.style.transform = "translateY(0px)"; // Move to final position
        });
      });
      // findme
      // let currLang = localStorage.getItem("lang");
      // console.log(currLang);
      // if (!currLang) {
      //   console.log(currLang);
      //   currLang = "EN"; // Set to "EN" if not already set
      // }

      this.lang = getLangState();

      if (this.lang == "EN") {
        transcriptButton.textContent = "Hide Transcript";
      } else {
        transcriptButton.textContent = "Masquer la Transcription";

        // { id: "transcriptButton", en: "Show Transcript", fr: "Afficher la Transcription" },

        // { id: "transcriptButton", en: "Hide Transcript", fr: "Masquer la Transcription" },
      }

      // if ((currLang = "EN")) {
      //   transcriptButton.textContent = "Hide Transcript";
      // } else {
      //   transcriptButton.textContent = "Masquer la Transcription";
      //   console.log("should be french");
      // }
    } else {
      this.transcriptContainer.style.opacity = "0"; // Fade out
      this.transcriptContainer.style.transform = "translateY(20px)"; // Start moving down
      // Wait for the fade-out transition before setting display to none
      setTimeout(() => {
        this.transcriptContainer.style.display = "none";
      }, 500); // The timeout duration should match the CSS transition duration

      // let currLang = localStorage.getItem("lang");
      // if (!currLang) {
      //   console.log(currLang);
      //   // currLang = "EN"; // Set to "EN" if not already set
      // }

      this.lang = getLangState();
      console.log(this.lang);

      if (this.lang == "EN") {
        transcriptButton.textContent = "Show Transcript";
        console.log("should be en");
      } else {
        transcriptButton.textContent = "Afficher la Transcription";
        console.log("should be french");
      }
    }
  }

  /////////////////////////////////////////////////////
  /////////         USER INTERACTIONS     ///////////
  /////////////////////////////////////////////////////

  setupInitialUserInteraction() {
    const playButton = document.getElementById("play-button");
    if (playButton) {
      playButton.addEventListener("click", () => this.startPlayback());
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

      // Setup volume control buttons
      this.setupVolumeControlButtons();
    }

    // Initial UI update for volume indicators if necessary
    this.updateVolumeIndicator(parseFloat(volumeSlider.value));
  }

  handleVolumeChange(event) {
    const volumeLevel = parseFloat(event.target.value) / 100;
    this.globalAudioElement.volume = volumeLevel;
    event.target.setAttribute("aria-valuenow", event.target.value);

    this.updateVolumeIndicator(event.target.value); // Assuming this method exists to update the UI
  }

  updateVolumeIndicator(volumeLevel) {
    const volumeFiller = document.getElementById("volume-bar-filler");
    const volumeThinner = document.getElementById("volume-bar-thinner");

    if (volumeFiller) {
      volumeFiller.style.width = `${volumeLevel}%`;
      document.getElementById("volume-slider").setAttribute("aria-valuenow", volumeLevel);
    }

    if (volumeThinner) {
      volumeThinner.style.width = `${100 - volumeLevel}%`;
      volumeThinner.style.left = `${volumeLevel}%`;
    }
  }

  setupVolumeControlButtons() {
    const lowerVolumeBtn = document.getElementById("lower-vol");
    const raiseVolumeBtn = document.getElementById("raise-vol");
    const volumeSlider = document.getElementById("volume-slider"); // Get the volume slider

    if (lowerVolumeBtn) {
      lowerVolumeBtn.addEventListener("click", () => {
        this.globalAudioElement.volume = 0;
        volumeSlider.value = "0"; // Update the slider position
        this.updateVolumeIndicator("0"); // Update the UI to reflect the volume change
      });
    }

    if (raiseVolumeBtn) {
      raiseVolumeBtn.addEventListener("click", () => {
        this.globalAudioElement.volume = 1;
        volumeSlider.value = "100"; // Update the slider position
        this.updateVolumeIndicator("100"); // Update the UI to reflect the volume change
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

  resetTranscriptUI() {
    console.log("resetTranscriptUI");
    // findme - need to actually remove this
    if (this.transcriptContainer && this.transcriptVisible) {
      this.transcriptContainer.style.display = "none";
      this.transcriptVisible = false;
      this.transcriptContainer.innerHTML = ""; // Clear any previous transcript
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
      this.skipForwardButton.style.opacity = ".1";
      return;
    }
    this.updateUIForSkip("forward");
    this.calculateAndAdjustTime(20, "forward");
    this.toggleAriaPressed(this.skipForwardButton);

  }

  handleSkipBackward() {
    console.log("Attempting to skip backward. Current time:", this.globalAudioElement.currentTime);
    if (!this.isSkipBackwardAllowed()) {
      this.skipBackwardButton.style.opacity = ".1";
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
    console.log("PLATINGGG");
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
          this.createTranscriptContainer();
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

    let currLang = localStorage.getItem("lang");
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
        // console.log(currLang);
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
