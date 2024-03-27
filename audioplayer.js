import { curatedTracklist } from "./play.js";
import { getState, setState } from './state.js';
let isInverted = getState(); // This will initialize isInverted based on localStorage

if (localStorage.getItem('themeInverted') === null) {
    // If the key doesn't exist, initialize it to false
    localStorage.setItem('themeInverted', 'false');
}


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
    this.currentRuntime = 0;

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
    this.playingInvertedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/playButtonInvert.svg" alt="Play Icon">`;

    this.pausedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/pauseButton.svg" alt="Pause Icon">`;
    this.pausedInvertedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/pauseButtonInvert.svg" alt="Pause Icon">`;

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
    const transcriptButton = this.createElement("button", {
      type: "button",
      className: "btn",
      id: "transcriptButton",
      textContent: "TRANSCRIPT",
    });

    const transBtnContainer = document.getElementById("transButtonContainer");
    transBtnContainer.appendChild(transcriptButton);
    transcriptButton.addEventListener("click", this.toggleTranscript.bind(this));
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
    const volumeFiller = document.getElementById('volume-bar-filler');
    const volumeThinner = document.getElementById('volume-bar-thinner');
  
    if (volumeFiller) {
      volumeFiller.style.width = `${volumeLevel}%`;
    }
  
    if (volumeThinner) {
      volumeThinner.style.width = `${100 - volumeLevel}%`;
      volumeThinner.style.left = `${volumeLevel}%`;
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

// Function to start or resume playback of the tracklist.
startPlayback() {
  // Check if playback is not currently active and there are tracks left to play.
  if (!this.isPlaying && this.currentIndex < this.tracklist.length) {
    // If this is the first attempt to play music.
    if (!this.firstPlayDone) {
      // Play the track at the current index.
      this.playTrack(this.currentIndex);
      // Mark that the first play has occurred to avoid reinitializing on future plays.
      this.firstPlayDone = true;
      // Additional setup like creating the transcript container goes here.
      this.createTranscriptContainer();
    } else {
      // If not the first play, resume playback of the global audio element.
      this.globalAudioElement.play();
    }
  } else if (!this.isPlaying && this.currentIndex >= this.tracklist.length) {
    // If playback is not active and there are no tracks left, stop playback entirely.
    // This could involve actions like resetting the player to its initial state.
    this.handleEnded(); // This is a hypothetical method. You'll need to implement it.
  } else {
    // If playback is active (music is playing), pause it.
    this.pausePlayback();
  }
}


  

stopPlayback() {
  console.log("stopplayback being called");

  // Pause the audio element and reset its current time to the start.
  this.globalAudioElement.pause();
  this.globalAudioElement.currentTime = 0;

  // Reset playback state flags.
  this.isPlaying = false;
  this.firstPlayDone = false;
  this.currentIndex = 0; // Reset the index to allow the playlist to start from the beginning.
  this.cumulativeElapsedTime = 0; // Reset the cumulative elapsed time.

  // Ensure the button visuals reflect the reset state.
  this.toggleButtonVisuals(false); // This will switch the button visuals back to the "play" state.

  // Reset the progress UI elements to their initial state.
  this.resetProgressUI();

  // Optionally hide the transcript container and reset its content if needed.
  if (this.transcriptContainer && this.transcriptVisible) {
    this.transcriptContainer.style.display = "none";
    this.transcriptVisible = false; // Reset the visibility flag.
    this.transcriptContainer.innerHTML = ""; // Clear the transcript content.
  }

  // Any other UI or state resets that are necessary for your application...
}

resetProgressUI() {
  const progressBar = document.getElementById("progress-bar");
  const progressDot = document.getElementById("progress-dot");
  const timePlayedElement = document.getElementById("time-played");
  const timeRemainingElement = document.getElementById("time-remaining");

  // Reset progress bar and progress dot to initial state.
  if (progressBar && progressDot) {
    progressBar.style.width = `0%`;
    progressDot.style.left = `-5px`; // Reset based on the initial position of your dot.
  }

  // Reset time played and time remaining to reflect the full duration of the playlist.
  if (timePlayedElement && timeRemainingElement) {
    timePlayedElement.innerText = `00:00`;
    // Assuming `calculateMinutesAndSeconds` returns a zero-padded string of minutes and seconds.
    const totalDuration = this.calculateMinutesAndSeconds(this.totalPlaylistDuration);
    timeRemainingElement.innerText = `-${totalDuration.minutes}:${totalDuration.seconds}`;
  }
}




 // Function to play a track from the tracklist at a given index.
playTrack(index) {
  // Return a new promise that will handle the play process.
  return new Promise((resolve, reject) => {
    // Check if the index is beyond the tracklist's length, indicating the end of the playlist.
    if (index >= this.tracklist.length) {
      // Log that the end of the playlist has been reached.
      console.log("All tracks in the tracklist have been played.");
      console.log(`[playTrack] End of playlist reached. Index=${index}`);
      // Set the isPlaying flag to false as nothing is playing now.
      this.isPlaying = false;
      // Directly call handleEnded here to handle any necessary cleanup or UI updates
      this.handleEnded();
      // Reject the promise indicating we've reached the end of the playlist.
      reject(new Error("End of playlist"));
      return; // Exit early since there's nothing to play.
    }

    // Retrieve the track object from the tracklist at the specified index.
    const track = this.tracklist[index];
    this.globalAudioElement.src = track.url; // Set the source of the global audio element to the URL of the current track.

    // Attempt to play the current track.
    this.globalAudioElement.play().then(() => {
      this.isPlaying = true; // On success, set isPlaying flag to true.
      if (index + 1 < this.tracklist.length) {
        const nextTrack = this.tracklist[index + 1];
        const audioPreload = new Audio(nextTrack.url); // Preload the next track if there is one.
        audioPreload.preload = "auto";
        audioPreload.load(); // Start loading the next track.
      }
      resolve(); // Resolve the promise as the track is successfully playing.
    }).catch(error => {
      reject(error); // If playing the track fails, reject the promise with the error.
    });

    // Set up an event listener for when the track ends.
    this.globalAudioElement.onended = () => {
      const duration = this.globalAudioElement.duration; // Obtain the duration of the track that just finished playing.
      this.timerDuration += Math.floor(duration); // Update the timerDuration with the floor value of the track's duration.
      this.cumulativeElapsedTime += Number(track.duration); // Update cumulativeElapsedTime with the track's duration.
      this.currentIndex++; // Increment currentIndex to move to the next track.
      
      if (this.currentIndex < this.tracklist.length) {
        this.playTrack(this.currentIndex).then(resolve).catch(reject); // If there are more tracks to play, recursively call playTrack to play the next one.
      } else {
        this.isPlaying = false; // If all tracks have been played, set isPlaying to false.
        resolve(); // Resolve the promise, indicating that the playlist has finished.
      }
    };
  });
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
    console.log("handleEnded being called");
      this.stopPlayback();
  }


  toggleButtonVisuals(isPlaying) {
    let isThemeInverted = getState(); // This will initialize isInverted based on localStorage

    console.log(isThemeInverted);

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
