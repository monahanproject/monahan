import { curatedTracklist } from "./play.js";

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXX  SIMPLE AUDIO PLAYER class  XXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

export class SimpleAudioPlayer {
  constructor(tracklist) {
    this.tracklist = tracklist;
    this.currentIndex = 0;
    this.globalAudioElement = document.createElement("audio");
    this.isPlaying = false;
    this.firstPlayDone = false;

    this.cumulativeElapsedTime = 0;
    this.totalPlaylistDuration = 0; // Initialize with the sum of durations of all tracks in the playlist
    this.isUpdatingTime = false; // Flag to prevent rapid updates
    this.timerDuration = 0;

    this.transcript = "";
    this.language = "english";
    this.transcriptVisible = false;
    this.transcriptContent = null;
    this.transcriptContainer = document.getElementById("transcriptContainer");

    this.playingSVG = `<img id="play-icon" class="svg-icon" src="images/svg/playButton.svg" alt="Play Icon">`;
    this.pausedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/pauseButton.svg" alt="Pause Icon">`;
    this.playingText = "PLAY";
    this.pausedText = "STOP";

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
      // Code here will run whether an error has occurred or not
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
    const transcriptButton = this.createElement("button", {
      type: "button",
      className: "btn",
      id: "transcriptButton",
      textContent: "TRANSCRIPT",
    });

    const transBtnContainer = document.getElementById("transButtonContainer");
    transBtnContainer.appendChild(transcriptButton);
    transcriptButton.addEventListener("click", this.toggleTranscriptVisibiilty.bind(this));
    // Initialize transcriptContent here to avoid re-declaration later
    this.transcriptContent = this.createElement("div", { id: "transcriptContent", style: "display: none" });
    this.transcriptContainer.appendChild(this.transcriptContent); // Append to the container
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

  updateTranscriptBasedOnLanguage() {
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

  toggleTranscriptVisibiilty() {
    const transcriptButton = document.getElementById("transcriptButton");

    this.transcriptVisible = !this.transcriptVisible; // Toggle the flag first for more predictable logic
    if (this.transcriptVisible) {
      this.updateTranscriptBasedOnLanguage(); // Update before showing
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
    const volumeDot = document.getElementById("volume-dot");
    var volumeBar = document.getElementById("volume-slider");
    if (volumeBar && volumeBar instanceof HTMLInputElement) {
      // Runtime check
      volumeBar.type = "range";
      volumeBar.max = "100";
      volumeBar.min = "0";
      volumeBar.value = "75"; // Default volume
      volumeBar.addEventListener(
        "change",
        function (event) {
          this.handleVolumeChange(event);
        }.bind(this)
      );
      this.globalAudioElement.volume = parseFloat(volumeBar.value) / 100;
    }
  }

  handleVolumeChange(event) {
    const newVolume = parseFloat(event.target.value) / 100;
    this.globalAudioElement.volume = newVolume;
        // TODO visual volume indicators in the UI here

        // volumeBar.style.width = `${volPercentage}%`;
        // volumeDot.style.left = `calc(${volumePercentage}% - 5px)`; // Adjust based on the dot's size
  }

  handleSkipForward() {
    let newPlayerTime = this.globalAudioElement.currentTime + 20;
    newPlayerTime = Math.min(newPlayerTime, this.totalPlaylistDuration);
    if (!this.isUpdatingTime) {
      this.isUpdatingTime = true; // Set a flag to prevent rapid updates
      setTimeout(() => {
        this.globalAudioElement.currentTime = newPlayerTime;
        this.isUpdatingTime = false;
      }, 20); // Adjust the delay as neede
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
        this.createTranscriptContainer();

      } else {
        // If not the first play, just resume the player
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
      // console.log(`[playTrack] Starting. Index=${index}, Track URL=${track.url}, Expected Duration=${track.duration}s`);

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
    // console.log("handlePlay");
    this.isPlaying = true;
    this.toggleButtonVisuals(true);
  }

  handlePause() {
    // console.log("handlePause");
    this.isPlaying = false;
    this.toggleButtonVisuals(false);
  }

    // handleTimerCompletion() {
  //   const timeRemainingElement = document.getElementById("time-remaining");

  //   if (!timeRemainingElement) {
  //     console.error("Error: Missing element 'time-remaining'");
  //     return; // Exit the function to prevent further errors
  //   }
  //   timeRemainingElement.innerHTML = "Done";
  // }

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
        svgContainer.innerHTML = this.pausedSVG;
        playButtonTextContainer.textContent = this.pausedText;
      }
    } else {
      if (!playButton.classList.contains("paused")) {
        if (!this.firstPlayDone) {

          // we're in a begin state
        } else {
          // Check to prevent redundant operations
          playButtonTextContainer.style.left = "35%";
          svgContainer.innerHTML = this.playingSVG;
          playButtonTextContainer.textContent = this.playingText;
        }
      }
    }
    // Toggle these classes regardless of current state, as they control other visual aspects that may need to be updated
    // playButton.classList.toggle("playing", isPlaying);
    // playButton.classList.toggle("paused", !isPlaying);
  }
}
