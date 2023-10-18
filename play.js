var myLang = localStorage["lang"] || "defaultValue";
var player;
var audioContext = null;
var volumeNode = null;
// var previousVolume = "100";
let playerPlayState = "play";
let hasSkippedToEnd = false;
let displayConsoleLog = "<br>";
let curatedTracklistTotalTimeInSecs = 0;
let curatedTracklistTotalTimeInMins;

let curatedTracklist;
let timerDuration = 0;

const MAX_PLAYLIST_DURATION_SECONDS = 1140; //(19m)

var totalDurationSeconds = 1140; //(19m)
let currentTimeElement; // Element to display current time
// let randomValueSomeTimerThing;

const PREFETCH_BUFFER_SECONDS = 8; /* set how many seconds before a song is completed to pre-fetch the next song */

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXX SET UP THE PLAYER  XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function startplayer() {
  player = document.getElementById("music_player");
  player.controls = false;
}

function change_vol(event) {
  volumeNode.gain.value = parseFloat(event.target.value);
}

// https://css-tricks.com/lets-create-a-custom-audio-player/
function createHTMLMusicPlayer(musicPlayerDiv, musicPlayerh1) {
  const wrapperDiv = createDiv("wrapper");
  const audioPlayerContainer = createDiv("audio-player-container");
  const musicPlayer = createAudioElement("music_player");
  const currTime = createTimerCountdownElement();
  const buttonContainer = createDiv("button-container");
  const playIconContainer = createPlayIconContainer();
  const skipBackwardButton = createSkipButton("<<20");
  const skipForwardButton = createSkipButton("20>>");
  const volumeSlider = createVolumeSlider();
  const trackNameContainer = createDiv("playerTrackNameContainer");
  const trackNameElement = createTrackNameElement();
  const exitBtn = createExitButton();

  skipBackwardButton.setAttribute("id", "skipBackwardButton");
  skipForwardButton.setAttribute("id", "skipForwardButton");

  appendElements(musicPlayerDiv, [wrapperDiv, audioPlayerContainer, exitBtn]);
  appendElements(wrapperDiv, [audioPlayerContainer, exitBtn]);
  appendElements(audioPlayerContainer, [musicPlayer, currTime, buttonContainer, volumeSlider, trackNameContainer]);
  appendElements(buttonContainer, [skipBackwardButton, playIconContainer, skipForwardButton]);
  appendElements(trackNameContainer, [trackNameElement]);

  playIconContainer.addEventListener("click", handlePlayPauseClick);
  skipBackwardButton.addEventListener("click", handleSkipBackwardClick);
  skipForwardButton.addEventListener("click", handleSkipForwardClick);
  volumeSlider.addEventListener("change", handleVolumeChange);
  exitBtn.addEventListener("click", handleExitClick);

  function createDiv(id) {
    const div = document.createElement("div");
    div.id = id;
    return div;
  }

  function createAudioElement(id) {
    const audio = document.createElement("audio");
    audio.id = id;
    return audio;
  }

  function createTimerCountdownElement() {
    const currentTime = document.createElement("span");
    currentTime.classList.add("time");
    currentTime.id = "current-time";
    currentTime.innerHTML = "0:00";
    return currentTime;
  }

  function createPlayIconContainer() {
    const playIconContainer = document.createElement("button");
    playIconContainer.id = "play-icon";
    playIconContainer.classList.add("play-icon", "paused");
    return playIconContainer;
  }

  function createSkipButton(label) {
    const skipButton = document.createElement("button");
    skipButton.classList.add("skip-button");
    skipButton.innerHTML = label;
    return skipButton;
  }

  function createVolumeSlider() {
    const volumeSlider = document.createElement("input");
    volumeSlider.type = "range";
    volumeSlider.id = "volume-slider";
    volumeSlider.max = "100";
    volumeSlider.min = "0";
    volumeSlider.value = "100";
    return volumeSlider;
  }

  function createTrackNameElement() {
    const trackNameElement = document.createElement("p");
    trackNameElement.id = "playerTrackName";
    trackNameElement.innerText = ""; // Replace with the actual track name
    return trackNameElement;
  }

  function createExitButton() {
    const exitBtn = document.createElement("button");
    exitBtn.innerHTML = "exit";
    exitBtn.name = "exitBtn";
    exitBtn.id = "exitBtn";
    exitBtn.classList.add("btn");
    return exitBtn;
  }

  function appendElements(parent, elements) {
    elements.forEach((element) => {
      parent.appendChild(element);
    });
  }

  function handlePlayPauseClick() {
    const playIconContainer = document.getElementById("play-icon");

    // Check if the audio is currently playing
    if (playerPlayState === "play") {
      // Pause the audio
      playIconContainer.classList.remove("paused");
      player.pause();
      playerPlayState = "pause";
      audioContext.suspend();
    }
    // Check if the audio is currently paused
    else if (playerPlayState === "pause") {
      player.play();
      playIconContainer.classList.add("paused");
      playerPlayState = "play";
      audioContext.resume();
      // createTimerLoopAndUpdateProgressTimer();
    } else {
    }
  }

  let isUpdatingTime = false; // Flag to prevent rapid updates

  function handleSkipForwardClick() {
    if (playerPlayState === "play") {
      let newPlayerTime = player.currentTime + 10;

      newPlayerTime = Math.min(newPlayerTime, totalDurationSeconds);
      if (!isUpdatingTime) {
        isUpdatingTime = true; // Set a flag to prevent rapid updates
        // createTimerLoopAndUpdateProgressTimer();
        setTimeout(() => {
          player.currentTime = newPlayerTime;
          isUpdatingTime = false;
        }, 100); // Adjust the delay as needed (100 milliseconds in this case)
      }
    }
  }

  function handleSkipBackwardClick() {
    if (playerPlayState === "play") {
      let newTime = player.currentTime - 10;
      if (!isUpdatingTime) {
        isUpdatingTime = true;
        setTimeout(() => {
          player.currentTime = Math.max(newTime, 0);
          updateProgressTimerr(Math.floor(newTime), timerDuration);
          // createTimerLoopAndUpdateProgressTimer();
          isUpdatingTime = false; // Reset the flag
        }, 100); // Adjust the delay as needed
      }
    }
  }

  function handleVolumeChange(event) {
    // Get the current volume value from the volume slider
    const newVolume = parseFloat(event.target.value) / 100;
    // Apply the new volume to the audio
    volumeNode.gain.value = newVolume;
    console.log("rrr Volume changed to: " + newVolume);
  }

  function handleExitClick() {
    // Suspend audio context and clear the timer interval
    audioContext.suspend();
    // Remove player elements and exit button
    musicPlayerh1.innerHTML = "";
    document.getElementById("wrapper").remove();
    document.getElementById("exitBtn").remove();

    // Add a "Begin Again" button with its click handler
    const beginAgainBtn = document.createElement("button");
    beginAgainBtn.innerHTML = "Begin again";
    beginAgainBtn.name = "beginAgainBtn";
    beginAgainBtn.classList.add("beginAgainBtn");
    musicPlayerDiv.appendChild(beginAgainBtn);

    beginAgainBtn.addEventListener("click", (event) => {
      // Redirect to a new page (replace with your desired URL)
      window.location.href = "monahan.html";
    });

    console.log("rrr Exited the player and added 'Begin Again' button");
  }
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXX  TIMER  XXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function updateProgressTimerr(elapsedSeconds, previousDuration) {
  currentTimeElement = document.getElementById("current-time");
  if (!currentTimeElement) {
    console.error("Error: Missing element 'current-time'");
    return;
  }

  totalDurationSeconds = curatedTracklistTotalTimeInSecs;
  const remainingDurationSeconds = totalDurationSeconds - (elapsedSeconds + previousDuration);
  const { minutes, seconds } = calculateMinutesAndSeconds(remainingDurationSeconds);
  updateTimeDisplay(minutes, seconds);
}
function handleTimerCompletion() {
  currentTimeElement = document.getElementById("current-time");

  if (!currentTimeElement) {
    // Handle the case where the "current-time" element is missing
    console.error("Error: Missing element 'current-time'");
    return; // Exit the function to prevent further errors
  }

  currentTimeElement.innerHTML = "Done";
}

function calculateMinutesAndSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  return { minutes, seconds: remainingSeconds };
}

function updateTimeDisplay(minutes, seconds) {
  currentTimeElement = document.getElementById("current-time");

  if (!currentTimeElement) {
    console.error("Error: Missing element 'current-time'");
    return; // Exit the function to prevent further errors
  }

  currentTimeElement.innerHTML = `${minutes}:${seconds}`;
}

function calculateRemainingTime(elapsedSeconds) {
  return totalDurationSeconds - elapsedSeconds;
}

function createTimerLoopAndUpdateProgressTimer() {
  var start = Date.now(); // Record the start time of the loop
  return setInterval(() => {
    let delta = Date.now() - start; // Calculate elapsed milliseconds
    let deltaSeconds = Math.floor(delta / 1000); // Convert milliseconds to seconds
    // findmeeee
    updateProgressTimerr(Math.floor(player.currentTime), timerDuration);
    remainingTime = calculateRemainingTime(deltaSeconds);
  }, 1000); // Run the loop every x milliseconds
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXX LOADING GIF  XXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function displayLoadingGifAndGeneratePlayer() {
  const musicPlayerDiv = document.getElementById("musicPlayerDiv");
  const musicPlayerh1 = document.getElementById("musicPlayerH1");

  updateTheStatusMessage(musicPlayerh1, "Generating beautiful sounds for you, this might take a minute");
  removeAnElementByID("launchMusicPlayerForm");

  const loaderDiv = createALoaderDiv();
  musicPlayerDiv.appendChild(loaderDiv);

  // Simulate loading for a brief period (50 milliseconds in this case)
  setTimeout(() => {
    // Remove the loader and clear the message
    loaderDiv.remove();
    updateTheStatusMessage(musicPlayerh1, "");

    // Create the HTML music player
    createHTMLMusicPlayer(musicPlayerDiv, musicPlayerh1);
  }, 50);
}

// Function to create an audio element
function createAudioElement(url) {
  const audio = new Audio();
  audio.preload = "none";
  audio.src = url;
  audio.controls = false;
  return audio;
}

function updateTheStatusMessage(element, message) {
  element.innerHTML = message;
}

function removeAnElementByID(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.remove();
  }
}

function createALoaderDiv() {
  const loaderDiv = document.createElement("div");
  loaderDiv.classList.add("loader");
  return loaderDiv;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX AUDIO CACHING SO WE DOWNLOAD SONGS AS WE GO XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* fetchAndCacheAudio takes an audioFileUrl and a cache object as input. The 
function checks if the audio file is already in the cache, and if not, fetches it from the network, 
adds it to the cache, and returns the audio response. */

function fetchAndCacheAudio(audioFileUrl, cache) {
  // Check first if audio is in the cache.
  return cache.match(audioFileUrl).then((cacheResponse) => {
    // return cached response if audio is already in the cache.
    if (cacheResponse) {
      return cacheResponse;
    }
    // Otherwise, fetch the audio from the network.
    return fetch(audioFileUrl).then((networkResponse) => {
      // Add the response to the cache and return network response in parallel.
      cache.put(audioFileUrl, networkResponse.clone());
      return networkResponse;
    });
  });
}
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXX CREATE EACH SONG! XXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* Takes a song object as input, create an audio element for the song's URL, 
assignS it to the song.audio property, and returns the modified song object.*/

const addAudioFromUrl = (song) => {
  song.audio = createAudioElement(song.url);
  return song;
};

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX CREATE OUTRO AUDIO! XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* Define two more arrays outroAudioSounds and finalOutroAudioSounds, each containing an object
   representing an outro track. Each object is processed using the addAudioFromUrl function. */

const outroAudioSounds = [
  {
    name: "OUTRO2PT1SOLO",
    url: "./sounds/XX_OUTRO/OUTRO_2.1.mp3",
    duration: 6,
    author: "",
    form: "",
    placement: [""],
    length: "",
    language: "",
    sentiment: "",
    tags: ["outro"],
    backgroundMusic: "",
    credit: "",
    engTrans: "[TODO.]",
    frTrans: "[TODO.]",
  },
].map(addAudioFromUrl);

const finalOutroAudioSounds = [
  {
    name: "OUTRO2PT2withMUSIC",
    url: "./sounds/XX_OUTRO/OUTRO_2.2_MUSIC.mp3",
    duration: 6,
    author: "",
    form: "",
    placement: [""],
    length: "",
    language: "",
    sentiment: "",
    tags: ["outro"],
    backgroundMusic: "",
    credit: "",
  },
].map(addAudioFromUrl);

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX GET OUR SONGS & TURN THEM INTO SONG OBJECTS! XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* 5. Define an array SONGS containing multiple song objects, each song object is 
  processed using the addAudioFromUrl function. */

let songs; // Initialize SONGS with the data

// Load JSON data from the file
fetch("songs.json")
  .then((response) => response.json())
  .then((data) => {
    // Use the JSON data in your script
    songs = data.map(addAudioFromUrl);
    // ...
  })
  .catch((error) => {
    console.error("Error loading JSON data:", error);
  });

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXX CREDITS STUFF XXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

let arrayOfCreditSongs = [];
let creditsLog = [];

function addToCreditsLog(songCredit) {
  const strippedCredit = songCredit.substring(songCredit.lastIndexOf("_") + 1);
  creditsLog.push(`${strippedCredit}<br>`);
}

function createCreditObjectAndAddToArray(song) {
  const creditObj = {
    name: song.name,
    url: song.credit, //flip on purpose
    duration: "2",
    author: song.author,
    form: "",
    placement: [""],
    length: "",
    language: "",
    sentiment: "",
    backgroundMusic: "",
    tags: [""],
    credit: song.url,
  };
  arrayOfCreditSongs.push(addAudioFromUrl(creditObj));
}

function gatherTheCreditSongs(curatedTracklist) {
  for (let index = 0; index < curatedTracklist.length; index++) {
    const song = curatedTracklist[index];

    const songTitles = arrayOfCreditSongs.map((song) => song.credit).join(", ");

    if (song.credit == "") {
      // No credit information, do nothing
    } else {
      const matchingCreditSong = trackExistsWithAttributes(arrayOfCreditSongs, "url", song.credit);

      if (matchingCreditSong) {
        // Matching credit song found, do nothing
      } else {
        addToCreditsLog(song.credit);
        createCreditObjectAndAddToArray(song);
        // Credit being added
      }
    }
  }
  return arrayOfCreditSongs;
}

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  ~~~~~~ transcript CREATION ~~~~~~~
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
let transcript = ""; // Global variable to store the transcript
let language = "english"; // Global variable to set the language with English as the default
let transcriptVisible = false; // Flag to track if transcript is visible
let transcriptContent; // Define transcriptContent as a global variable

// Function to create the transcript container
function createTranscriptContainer() {
  const transcriptContainer = document.createElement("div");
  transcriptContainer.id = "transcriptContainer";
  // transcriptContainer.style.position = "fixed";
  // transcriptContainer.style.top = "0";
  // transcriptContainer.style.left = "0";
  transcriptContainer.style.paddingBottom = "5rem";

  // transcriptContainer.style.right = "0";
  // transcriptContainer.style.zIndex = "999"; // Adjust z-index as needed
  document.body.appendChild(transcriptContainer);

  createTranscriptButton(transcriptContainer);
  createTranscriptContent(transcriptContainer);
}

function createHTMLFromText(text) {
  const container = document.createElement("div");
  let currentParagraph = document.createElement("p");
  currentParagraph.style.marginTop = "3rem";
  currentParagraph.style.marginBottom = "4rem";
  currentParagraph.style.padding = "1rem";

  currentParagraph.style.backgroundColor = "#f0ebf8";
  currentParagraph.style.marginLeft = "0";
  currentParagraph.style.marginRight = "0";

  // Define regex patterns for all formatting rules
  const boldTextPattern = /\^([^]+?)\^\^/g;
  const centerTextPattern = /@([^]+?)@@/g;
  const italicsTextPattern = /\$([^]+?)\$\$/g;

  const lineBreakPattern = /%/g;
  const doubleLineBreakPattern = /\*/g;

  try {
    // Replace bold text using regex
    text = text.replace(boldTextPattern, '<span style="font-weight: bold;">$1</span>');

    // Replace centered text using regex
    text = text.replace(centerTextPattern, '<span style="display: block; text-align: center;">$1</span>');

    // Replace italicized text using regex
    text = text.replace(italicsTextPattern, '<span style="font-style: italic;">$1</span>');

    // Replace line breaks using regex
    text = text.replace(lineBreakPattern, "</br>");

    // Replace double line breaks using regex
    text = text.replace(doubleLineBreakPattern, "<p></br></br></p>");

    // Set the HTML content of the current paragraph
    currentParagraph.innerHTML = text;

    // Append the paragraph to the container
    container.appendChild(currentParagraph);
  } catch (error) {
    console.error("nnn Error while processing input text:", error);
  }

  // Log the generated HTML for debugging
  console.log("nnn Generated HTML:", container.innerHTML);

  return container;
}

// Function to update the transcript based on the selected language
function updateTranscript() {
  console.log("qqq updateTranscript function called");

  const transcriptContainer = document.getElementById("transcriptContainer");

  if (!transcriptContainer) {
    console.error("qqq transcriptContentDiv not found.");
    return;
  }
  transcript = ""; // Reset the transcript
  for (let index = 0; index < curatedTracklist.length; index++) {
    const song = curatedTracklist[index];

    let inputString;
    if (language === "english") {
      inputString = song.engTrans;
    } else {
      inputString = song.frTrans;
    }

    if (inputString && inputString.trim() !== "") {
      const htmlContainer = createHTMLFromText(inputString);
      transcriptContainer.appendChild(htmlContainer);
      transcriptContainer.style.display = "block"; // Make it initially visible
    }
  }

  if (language === "english") {
    copyRight = "$All recordings and transcripts are copyright protected. All rights reserved.$$";
  } else {
    copyRight = "$Les enregistrements et les transcriptions sont protégés par le droit d’auteur. Tous droits réservés.$$";
  }

  const htmlContainer = createHTMLFromText(copyRight);
  transcriptContainer.appendChild(htmlContainer);
}

// Function to create the transcript button
function createTranscriptButton(container) {
  const transcriptButton = document.createElement("button");
  transcriptButton.textContent = "Show Transcript";
  transcriptButton.id = "transcriptButton"; // Assign an ID for styling
  transcriptButton.addEventListener("click", toggleTranscript);
  container.appendChild(transcriptButton);
}

// Function to create the transcript content element
function createTranscriptContent(container) {
  const transcriptContent = document.createElement("div");
  transcriptContent.id = "transcriptContent";
  transcriptContent.style.display = "block"; // Make it initially visible

  container.appendChild(transcriptContent);
}

// Function to toggle the transcript visibility
function toggleTranscript() {
  const transcriptContent = document.getElementById("transcriptContent");
  const transcriptButton = document.getElementById("transcriptButton");

  if (transcriptVisible) {
    transcriptContent.style.display = "none";
    transcriptButton.textContent = "Show Transcript";
  } else {
    updateTranscript();
    transcriptContent.textContent = transcript;
    // transcriptButton.textContent = "Hide Transcript";
    transcriptContent.style.display = "block";
  }
  transcriptVisible = !transcriptVisible; // Toggle the flag
}

// Call the function to create the transcript container
// createTranscriptContainer();

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  ~~~~~~ TRACKLIST CREATION ~~~~~~~
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX GENERAL RULES XXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// Rule 10: The current track must have a different author than the last track
function r10(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  if (prevTrack1 && track.author === prevTrack1.author) {
    // If the current track has the same author as the previous track, log a rule violation
    const logMessage = `❌ ${track.name}: The current track must have a different author (${track.author}) than the previous track (${prevTrack1.author})`;

    logRuleApplication(10, logMessage, false);
    return false;
  }
  // If the current track has a different author than the previous track, log successful rule application
  const logMessage = `🌱 ${track.name}: The current track must have a different author (${track.author}) than the previous track (${prevTrack1.author})`;
  logRuleApplication(10, logMessage, true);
  return true;
}
// Rule 11: No more than one track from the same author in a tracklist unless it is CHARLOTTE
function r11(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  // Check if the author is CHARLOTTE
  if (track.author === "CHARLOTTE") {
    // Count the number of tracks from CHARLOTTE in the curatedTracklist
    const CHARLOTTECount = curatedTracklist
      .filter((t) => t.author.trim() !== "") // Filter out tracks with no author
      .filter((t) => t.author === "CHARLOTTE").length;

    if (CHARLOTTECount >= 2) {
      // If there are already 2 tracks from CHARLOTTE, log a rule violation
      const logMessage = `❌ ${track.name}: No more than one track from the same author (track's author is ${track.author}) in a tracklist unless it is CHARLOTTE. No more than 2 tracks from author CHARLOTTE (CHARLOTTECount is  ${CHARLOTTECount})`;
      logRuleApplication(11, logMessage, false);
      return false;
    }
  } else {
    // For authors other than CHARLOTTE, count the number of tracks by the same author
    const authorCount = curatedTracklist
      .filter((t) => t.author.trim() !== "") // Filter out tracks with no author
      .filter((t) => t.author === track.author).length;

    if (authorCount >= 1) {
      // If there is already a track from the same author, log a rule violation
      const violatingTracks = curatedTracklist
        .filter((t) => t.author === track.author)
        .map((t) => t.name)
        .join(", ");
      const logMessage = `❌ ${track.name}: No more than one track from the same author (track's author is ${track.author}) in a tracklist unless it is CHARLOTTE. Violating tracks are: ${violatingTracks}`;
      logRuleApplication(11, logMessage, false);
      return false;
    }
  }

  // If the condition is met (no rule violation), log successful rule application
  const logMessage = ` 🌱! ${track.name}: No more than one track from the same author (track's author is ${track.author}) in a tracklist unless it is CHARLOTTE`;
  logRuleApplication(11, logMessage, true);
  return true;
}
// Rule 12: Tracks with the form shorts and the language musical can never follow tracks with the form music.
function r12(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  if (track.form === "shorts" && track.language === "musical" && prevTrack1.form === "music") {
    const logMessage = `❌ ${track.name}: Tracks with form 'shorts' (track's form is ${track.form}) and language 'musical' (track's language is ${track.language}) cannot follow tracks with form 'music' (last track's form is ${prevTrack1.form})`;
    logRuleApplication(12, logMessage, false);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = ` 🌱! ${track.name}: Tracks with form 'shorts' and language 'musical' (track's form is ${track.form}) and language (track's language is ${track.language}) cannot follow tracks with form 'music' (last track's form is ${prevTrack1.form})`;
  logRuleApplication(12, logMessage, true);
  return true;
}
// Rule 13: Tracks with the form music can never follow tracks with both the form shorts and the language musical.
function r13(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  if (track.form === "music" && curatedTracklist.some((prevTrack) => prevTrack.form === "shorts" && prevTrack.language === "musical")) {
    const logMessage = `❌ ${track.name}: Tracks with form 'music' (track's form ${track.form}) cannot follow tracks with form 'shorts' and language 'musical' (last track's form was ${prevTrack1.form} and language was ${prevTrack1.language})`;
    logRuleApplication(13, logMessage, false);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = ` 🌱! ${track.name}: Tracks with form 'music' (track's form ${track.form}) cannot follow tracks with form 'shorts' and language 'musical' (last track's form was ${prevTrack1.form} and language was ${prevTrack1.language})`;
  logRuleApplication(13, logMessage, true);
  return true;
}
// Rule 14: The value for backgroundMusic should never match the author of the track right before it, and the author of the track should never match the backgroundMusic of the track right before it.
function r14(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  if (
    prevTrack1 &&
    prevTrack1.author.trim() !== "" &&
    track.backgroundMusic.trim() !== "" &&
    (track.backgroundMusic === prevTrack1.author || track.author === prevTrack1.backgroundMusic)
  ) {
    const logMessage = `❌ ${track.name}: The value for backgroundMusic (track's background Music is '${track.backgroundMusic}') should never match the author of the track before (last track's author is '${prevTrack1.author}') or the backgroundMusic of the track before (last track's backgroundMusic is ${prevTrack1.backgroundMusic})`;
    logRuleApplication(14, logMessage, false);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = ` 🌱! ${track.name}: The value for backgroundMusic (track's background Music is '${track.backgroundMusic}') should never match the author of the track before (last track's author is '${prevTrack1.author}') or the backgroundMusic of the track before (last track's backgroundMusic is ${prevTrack1.backgroundMusic})`;
  logRuleApplication(14, logMessage, true);
  return true;
}
// Rule 15: If the previous track has the sentiment heavy, this track cannot have the the laughter tag.
function r15(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  if (track.tags.includes("laughter") && track && prevTrack1.sentiment === "" && prevTrack1.sentiment === "heavy") {
    const logMessage = `❌ ${track.name}: If the previous track has the sentiment heavy (previous track's sentiment is ${prevTrack1.sentiment}), this track cannot have the laughter tag (track's tags are ${track.tags})`;
    logRuleApplication(15, logMessage, false);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = ` 🌱! ${track.name}: if the previous track has the sentiment heavy (previous track's sentiment is ${prevTrack1.sentiment}), this track cannot have the laughter tag (track's tags are ${track.tags})`;
  logRuleApplication(15, logMessage, true);
  return true;
}
// Rule 16: If the previous track has length long and form music, this track must have the form interview`;
function r16(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  if (prevTrack1 && prevTrack1.length === "long" && prevTrack1.form === "music" && track.form !== "interview") {
    const logMessage = `❌ ${track.name}: If the previous track has length 'long' (last track's length is ${prevTrack1.length}) and form 'music' (last track's form is ${prevTrack1.form}), this track must have the form 'interview' (track's form is ${track.form})`;
    logRuleApplication(16, logMessage, false);
    return false; // Return false to indicate the rule is broken.
  }

  // If the rule is not violated, return true to indicate that the rule is followed.
  const logMessage = ` 🌱! ${track.name}: If the previous track has length 'long' (last track's length is ${prevTrack1.length}) and form 'music' (last track's form is ${prevTrack1.form}), this track must have the form 'interview' (track's form is ${track.form})`;
  logRuleApplication(16, logMessage, true);
  return true;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX BASE TRACK RULES (TRACKS 1-8) XXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// Rule 00: Rule 0 (only for Track 0): The Oth track must have the placement end (we'll be moving this to the end).
function r60(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 0 && !track.placement.includes("end")) {
    const logMessage = `❌ ${track.name}: The 0th (eventually final) track includes the placement end (placement ${track.placement})`;
    logRuleApplication(60, logMessage, false);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `  ✅ ${track.name}: The 0th (eventually final) track includes the placement end (placement ${track.placement})`;
  logRuleApplication(60, logMessage, true);
  return true;
}

// Rule 61: Rule 1 (only for Track 1): The 1st track must have the tag 'intro'.
function r61(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 1 && !track.tags.includes("intro")) {
    const logMessage = `❌ (${track.name}): The track's index is ${trackIndex}. The 1st track must have the tag intro (track's tags are ${track.tags})`;
    logRuleApplication(61, logMessage, false);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `✅ (${track.name}): The 1st track must have the tag intro (track's tags are ${track.tags})`;
  logRuleApplication(61, logMessage, true);
  return true;
}

// Rule 62: Rule 2 (only for Track 2):The 2nd track must have the placement 'beginning'.
function r62(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 2 && !track.placement.includes("beginning")) {
    const logMessage = `❌ (${track.name}): The track's index is ${trackIndex}. The 2nd track must have the placement beginning (track's placement is ${track.placement})`;
    logRuleApplication(62, logMessage, false);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `  ✅! (${track.name}): The track's index is ${trackIndex}. The 2nd track must have the placement beginning (track's placement is ${track.placement})`;
  logRuleApplication(62, logMessage, true);
  return true;
}

// Rule 63: Rule 3 (only for Track 3): The 3rd track must have the placement beginning and a different form than the 2nd track.
function r63(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if ((trackIndex === 3 && !track.placement.includes("beginning")) || (trackIndex === 2 && track.form === prevTrack1.form)) {
    const logMessage = `❌ (${track.name}): The track's index is ${trackIndex}. The 3rd track must have the placement beginning (track's placement is ${track.placement}) and a different form (track's form is ${track.form}) than the 2nd track (the 2nd track's form is ${prevTrack1.form})`;
    logRuleApplication(63, logMessage, false);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `  ✅! (${track.name}): The track's index is ${trackIndex}. The 3rd track must have the placement beginning (track's placement is ${track.placement}) and a different form (track's form is ${track.form}) than the 2nd track (the 2nd track's form is ${prevTrack1.form})`;
  logRuleApplication(63, logMessage, true);
  return true;
}
// Rule 64: Rule 4 (only for Track 4): The 4th track must have the placement middle and a different form than the 3rd track.
function r64(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if ((trackIndex === 4 && !track.placement.includes("middle")) || (trackIndex === 3 && track.form === prevTrack1.form)) {
    const logMessage = `❌ (${track.name}): The track's index is ${trackIndex}. The 4th track must have the placement middle (track's placement is ${track.placement}); and a different form (track's form is ${track.form}); than the 3rd track (the 3rd track's form is ${prevTrack1.form})`;
    logRuleApplication(64, logMessage, false);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `  ✅! (${track.name}): The track's index is ${trackIndex}. The 4th track must have the placement middle (track's placement is ${track.placement}); and a different form (track's form is ${track.form}); than the 3rd track (the 3rd track's form is ${prevTrack1.form})`;
  logRuleApplication(64, logMessage, true);
  return true;
}

// Rule 65: Rule 5 (only for Track 5): The 5th track must have the form 'short'; must have the placement 'middle'; and have a different language than the 4th track.
function r65(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 5) {
    if (track.form !== "short" || !track.placement.includes("middle") || track.language === prevTrack1.language) {
      const logMessage = `❌ (${track.name}): The track's index is ${trackIndex}. The 5th track must have the form short (track's form is ${track.form}); must have the placement MIDDLE (track's placement is ${track.placement}); and a different language (track's language is ${track.language}) from the 4th track (the 4th track's language is ${prevTrack1.language})`;
      logRuleApplication(65, logMessage, false);
      return false;
    }
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `✅! (${track.name}): The 5th track must have the form short (track's form is ${track.form}); must have the placement MIDDLE (track's placement is ${track.placement}); and a different language (track's language is ${track.language}) from the 4th track (the 4th track's language is ${prevTrack1.language})`;
  logRuleApplication(65, logMessage, true);
  return true;
}

// Rule 66: Rule 6 (only for Track 6): The 6th track must have the placement 'middle' and a different form than the 5th track.
function r66(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 6) {
    if (!track.placement.includes("middle")) {
      const logMessage = `❌ (${track.name}): The track's index is ${trackIndex}. The 6th track has the placement MIDDLE (track's placement is ${track.placement}); and has a different form (track's form is ${track.form}) vs the 5th track (the 5th's track's form is ${prevTrack1.form})`;
      logRuleApplication(66, logMessage, false);
      return false;
    }
    if (track.form === prevTrack1.form) {
      const logMessage = `❌ (${track.name}): The track's index is ${trackIndex}. The 6th track has the placement MIDDLE (track's placement is ${track.placement}); and has a different form (track's form is ${track.form}) vs the 5th track (the 5th's track's form is ${prevTrack1.form})`;
      logRuleApplication(66, logMessage, false);
      return false;
    }
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `✅! (${track.name}): The track's index is ${trackIndex}. The 6th track has the placement MIDDLE (track's placement is ${track.placement}); and has a different form (track's form is ${track.form}) vs the 5th track (the 5th track's form is ${prevTrack1.form})`;
  logRuleApplication(66, logMessage, true);
  return true;
}

// Rule 67: Rule 7 (only for Track 7): The 7th track must have the placement 'middle', a different form than the 6th track, and unless the form of the 7th track is 'MUSIC', it must also have a different language from the 6th track.
function r67(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 7) {
    if (!track.placement.includes("middle") || track.form === prevTrack1.form || (track.form !== "MUSIC" && track.language === prevTrack1.language)) {
      const logMessage = `❌ (${track.name}): The track's index is ${trackIndex}. The 7th track must have the placement MIDDLE (track's placement is ${track.placement}) and has a different form (track's form is ${track.form}) vs the 6th track (the 6th track's form is ${prevTrack1.form}); AND unless the form of the 7th track is MUSIC (the 7th track's form is ${track.form}), the 7th track also has a different language (the 7th track's language is ${track.language}) from the 6th track (the 6th track's language is ${prevTrack1.language})`;
      logRuleApplication(67, logMessage, false);
      return false;
    }
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = ` ✅! (${track.name}): The track's index is ${trackIndex}. The 7th track must have the placement MIDDLE (track's placement is ${track.placement}) and has a different form (track's form is ${track.form}) vs the 6th track (the 6th track's form is ${prevTrack1.form}); AND unless the form of the 7th track is MUSIC (the 7th track's form is ${track.form}), the 7th track also has a different language (the 7th track's language is ${track.language}) from the 6th track (the 6th track's language is ${prevTrack1.language})`;
  logRuleApplication(67, logMessage, true);
  return true;
}

// Rule 68: Rule 8 (only for Track 8): The 8th track must have the placement 'middle', a different form than the 6th and 7th tracks, and a different language than the 6th and 7th tracks.
function r68(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 7) {
    if (!track.placement.includes("middle")) {
      const logMessage = `❌ (${track.name}): The track's index is ${trackIndex}. The 8th track must have the placement MIDDLE (track's placement is ${track.placement}); and a different form (track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}); and has a different language (track's language is ${track.language}) vs the 7th track (the 7th track's language is ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;
      logRuleApplication(68, logMessage, false);
      return false;
    }
    if (track.form === prevTrack1.form || track.form === prevTrack2.form) {
      const logMessage = `❌ (${track.name}): The track's index is ${trackIndex}. The 8th track must have the placement MIDDLE (track's placement is ${track.placement}); and a different form (track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}); and has a different language (track's language is ${track.language}) vs the 7th track (the 7th track's language is ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;
      logRuleApplication(68, logMessage, false);
      return false;
    }
    if (track.language === prevTrack1.language || track.language === prevTrack2.language) {
      const logMessage = `❌ (${track.name}): The track's index is ${trackIndex}. The 8th track must have the placement MIDDLE (track's placement is ${track.placement}); and a different form (track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}) and has a different language (track's language ${track.language}) vs the 7th track (the 7th track's language ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;
      logRuleApplication(68, logMessage, false);
      return false;
    }
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `✅! (${track.name}): The track's index is ${trackIndex}. The 8th track must have the placement MIDDLE (track's placement is ${track.placement}); and a different form (track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}) and has a different language (track's language ${track.language}) vs the 7th track (the 7th track's language ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;
  logRuleApplication(68, logMessage, true);
  return true;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX ENSURE CHECKS (NEAR THE END) XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function c21(curatedTracklist) {
  let trackWithAttribute = trackExistsWithAttributes(curatedTracklist, "author", "ALBERT");
  if (!trackWithAttribute) {
    const logMessage = `❌ Ensure! The tracklist must contain at least one track with the author ALBERT`;
    logRuleApplication(21, logMessage, false);
    return false;
  }
  const logMessage = `✨ Ensure! The tracklist must contain at least one track with the author ALBERT (trackWithAttribute is ${trackWithAttribute.name}, author is ${trackWithAttribute.author})`;
  logRuleApplication(21, logMessage, true);
  return true;
}

function c22(curatedTracklist) {
  let trackWithAttribute = trackExistsWithAttributes(curatedTracklist, "author", "PIERREELLIOTT");
  if (!trackWithAttribute) {
    const logMessage = `❌ Ensure! The tracklist must contain at least one track with the author PIERREELLIOTT`;
    logRuleApplication(22, logMessage, false);
    return false;
  }
  const logMessage = `✨ Ensure! The tracklist must contain at least one track with the author PIERREELLIOTT (trackWithAttribute is ${trackWithAttribute.name}, author is ${trackWithAttribute.author})`;
  logRuleApplication(22, logMessage, true);
  return true;
}

function c23(curatedTracklist) {
  let trackWithAttribute = trackExistsWithAttributes(curatedTracklist, "form", "interview");
  if (!trackWithAttribute) {
    const logMessage = `❌ Ensure! The tracklist must contain at least one track with the form interview`;
    logRuleApplication(23, logMessage, false);
    return false;
  }
  const logMessage = `✨ Ensure! The tracklist must contain at least one track with the form interview (trackWithAttribute is ${trackWithAttribute.name}, form is ${trackWithAttribute.form})`;
  logRuleApplication(23, logMessage, true);
  return true;
}

function c24(curatedTracklist) {
  let trackWithAttribute = trackExistsWithAttributes(curatedTracklist, "form", "music");

  if (!trackWithAttribute) {
    const logMessage = `❌ Ensure! The tracklist must contain at least one track with the form music`;
    logRuleApplication(24, logMessage, false);
    return false;
  }
  const logMessage = ` ✨! Ensure! The tracklist must contain at least one track with the form music (trackWithAttribute is ${trackWithAttribute.name}, form is ${trackWithAttribute.form})`;
  logRuleApplication(24, logMessage, true);
  return true;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX ENSURE RULES (NEAR THE END) XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// Rule 21. The tracklist must contain at least one track with the author ALBERT.
function r21(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (track.author != "ALBERT") {
    const logMessage = `❌ ${track.name}: Ensure! The tracklist must contain at least one track with the author ALBERT (track's name is ${track.name}, track's author is ${track.author})`;
    logRuleApplication(21, logMessage, false);
    return false;
  }
  const logMessage = `✨ ${track.name}: Ensure! The tracklist must contain at least one track with the author ALBERT (track's name is ${track.name}, track's author is ${track.author})`;
  logRuleApplication(21, logMessage, true);
  return true;
}

// Rule 22. The tracklist must contain at least one track with the author PIERREELLIOTT.
function r22(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (track.author !== "PIERREELLIOTT") {
    const logMessage = `❌ ${track.name}: Ensure! The tracklist must contain at least one track with the author PIERREELLIOTT (track's name is ${track.name}, track's author is ${track.author})`;
    logRuleApplication(22, logMessage, false);
    return false;
  }
  const logMessage = `✨ ${track.name}: Ensure! The tracklist must contain at least one track with the author PIERREELLIOTT (track's author is ${track.name}, track's author is ${track.author})`;
  logRuleApplication(22, logMessage, true);
  return true;
}

// Rule 23. The tracklist must contain at least one track with the form interview.
function r23(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (track.form !== "interview") {
    const logMessage = `❌ ${track.name}:  Ensure! The tracklist must contain at least one track with the form interview (track's name is ${track.name}, track's form is ${track.form})`;
    logRuleApplication(23, logMessage, false);
    return false;
  }
  const logMessage = `✨ ${track.name}: Ensure! The tracklist must contain at least one track with the form interview (track's name is ${track.name}, track's form is ${track.form})`;
  logRuleApplication(23, logMessage, true);
  return true;
}

// Rule 24. The tracklist must contain at least one track with the form music.
function r24(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (track.form !== "music") {
    const logMessage = `❌ ${track.name}: Ensure! The tracklist must contain at least one track with the form music (track's name is ${track.name}, track's form is ${track.form})`;
    logRuleApplication(24, logMessage, false);
    return false;
  }
  const logMessage = ` ✨! ${track.name}: Ensure! The tracklist must contain at least one track with the form music (track's name is ${track.name}, track's form is ${track.form})`;
  logRuleApplication(24, logMessage, true);
  return true;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX Geese RULE (AT THE VERY END) XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function r25(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  let trackHasGeeseTag = track.tags.includes("geese");
  // const prevTrack1HasGeeseTag = prevTrack1 && prevTrack1.tags.includes("geese");
  let curatedTracklistAlreadyHasGeeseTag = trackExistsWithAttributes(curatedTracklist, "tags", "geese");

  if (trackHasGeeseTag && curatedTracklistAlreadyHasGeeseTag) {
    console.log(
      `🦆! ${track.name}: Ensure! If there is one geese, we need two geese! trackHasGeeseTag: ${trackHasGeeseTag} and curatedTracklistAlreadyHasGeeseTag: ${curatedTracklistAlreadyHasGeeseTag[0]}`
    );
    return true;
  } else {
    console.log(`❌ ${track.name}: Ensure! If there is one geese, we need two geese!`);
    return false;
  }
}

// if this track has the tag "geese" AND if a track with the tag "geese" is already in curatedTracklist AND if prevTrack1 does NOT have the tag geese:
// function r25(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
//   console.log(`🦆 Running geese rule`);

//   const trackHasgeeseTag = track.tags.includes("geese");
//   const prevTrack1HasgeeseTag = prevTrack1 && prevTrack1.tags.includes("geese");
//   const curatedTracklistAlreadyHasAgeeseTag = trackExistsWithAttributes(curatedTracklist, "tags", "geese");

//   if (trackHasgeeseTag && !prevTrack1HasgeeseTag && curatedTracklistAlreadyHasAgeeseTag) {
//     const logMessage = ` 🦆! ${track.name}: If there is one geese, we need two geese! Track has a geese tag ${trackHasgeeseTag}; and a different has a geese tag ${curatedTracklistAlreadyHasAgeeseTag}; `;
//     logRuleApplication(25, logMessage, true);
//     return true;
//   } else {
//     let rejectionReasons = [];
//     if (!curatedTracklistAlreadyHasAgeeseTag) {
//       rejectionReasons.push("no need! no track with the 'geese' tag currently in the curated tracklist");
//     }
//     if (prevTrack1HasgeeseTag) {
//       rejectionReasons.push("prevTrack1 has the 'geese' tag, two geese in a row feels bad");
//     }
//     if (!trackHasgeeseTag) {
//       rejectionReasons.push("this track doesn't have a geese tag");
//     }

//     const logMessage = `❌ ${track.name}: If there is one geese, we need two geese! Reason for rejection ${rejectionReasons.join(", ")}`;
//     logRuleApplication(25, logMessage, false);
//     return false;
//   }
// }

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX HELPER FUNCTIONS (FOR CHECKING TRACK VALIDITY) XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function calculateOrUpdateCuratedTracklistDuration(track, curatedTracklist) {
  if (curatedTracklistTotalTimeInSecs === 0) {
    for (const track of curatedTracklist) {
      console.log("ttt track name is " + track.name);
      console.log("ttt track time is " + (track.duration || 0)); // Use 0 if duration is undefined or null
      curatedTracklistTotalTimeInSecs += track.duration || 0;
    }
  } else if (track) {
    // console.log("curatedTracklistTotalTime is " + curatedTracklistTotalTime);
    curatedTracklistTotalTimeInSecs += track.duration || 0;
  }

  curatedTracklistTotalTimeInMins = Math.floor(curatedTracklistTotalTimeInSecs / 60);

  return curatedTracklistTotalTimeInSecs;
}

function addNextValidTrack(track, curatedTracklist, tracks) {
  curatedTracklist.push(track);
  const trackIndex = tracks.findIndex((t) => t === track);
  if (trackIndex !== -1) {
    tracks.splice(trackIndex, 1);
  }
}

function trackExistsWithAttributes(curatedTracklist, attribute, value) {
  for (const track of curatedTracklist) {
    if (typeof track === "object" && track.hasOwnProperty(attribute)) {
      // Check if track[attribute] is an array
      if (Array.isArray(track[attribute])) {
        // Check if any element in track[attribute] matches any element in value
        if (track[attribute].some((item) => value.includes(item))) {
          return track; // Return the first matching track
        }
      } else if (track[attribute] === value) {
        return track; // Return the first matching track
      }
    }
  }
  return null; // Return null if no matching track is found
}

function logRuleApplication(ruleNumber, description, isApplied, message = null) {
  const ruleStatus = isApplied ? "passed" : "failed"; // Use "failed" for consistency
  console.log(`Rule ${ruleNumber} ${ruleStatus}: ${description}`);
  // addToLogDisplay(`Rule ${ruleNumber} ${ruleStatus}: ${description}`); // commented out to stop log

  if (message !== null) {
    displayConsoleLog += `→ Track ${ruleNumber} Rules ${ruleStatus}: ${description}<br>`;
    updateLogDisplay();
  }
}

// Helper function to update the log display on the webpage
function addToLogDisplay(logMessage) {
  const logElement = document.getElementById("displayConsoleLog");
  logElement.innerHTML += logMessage + "<br>";
}

// Helper function to manage prevTrack1 and prevTrack2
function updatePrevTracks(track, prevTrack1, prevTrack2) {
  if (prevTrack1 === null) {
    prevTrack1 = track;
  } else if (prevTrack2 === null) {
    prevTrack2 = prevTrack1;
    prevTrack1 = track;
  } else {
    prevTrack2 = prevTrack1;
    prevTrack1 = track;
  }
  return [prevTrack1, prevTrack2];
}

//  ///////////////////////////////////////////////////
//  //////////  A LONG AND COMPLICATED FUNCTION ///////
//  //////////  THAT MAKES A CURATED TRACKLIST ////////
//  //////////  BY FOLLOWING THE RULES  ///////////////
//  ///////////////////////////////////////////////////

function followTracklistRules(tracklist) {
  let curatedTracklist = [];
  let prevTrack1 = null;
  let prevTrack2 = null;
  let currIndex = 0; // Used to loop through tracklist
  let trackIndex = 0; // Used to index curatedTracklist

  const generalRuleFunctions = [r10, r11, r12, r13, r14, r15, r16];
  const unshuffledEnsureRules = [r21, r22, r23, r24, r25];
  // const lateCheckRules = [r25];

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Phase 1: Apply track-specific rules and general rules
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  for (let i = 0; i < 8; i++) {
    // Get the specific rule function based on index
    const ruleFunction = window["r" + (i + 60)];
    const description = `Rule ${i + 60} description`;

    // Reset the current index for each rule iteration
    currIndex = 0;
    let trackPassedRule = false;

    // Loop through the tracklist until a track passes the specific rule
    while (!trackPassedRule && currIndex < tracklist.length) {
      const track = tracklist[currIndex];
      // Apply the specific rule to the current track
      const isSpecificRuleApplied = ruleFunction(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex);

      // Check if the specific rule is met
      if (!isSpecificRuleApplied) {
        // Move to the next track in the tracklist
        currIndex++;
        continue; // Skip the rest of the loop and move to the next iteration
      }
      // Apply general rule functions for the track
      let generalRulesPassed = true;
      // so we don't deal with previous tracks before we have them
      if (trackIndex > 2) {
        for (const generalRule of generalRuleFunctions) {
          if (!generalRule(track, prevTrack1, prevTrack2, curatedTracklist, currIndex)) {
            console.log(`General rule failed for track: ${track.name}`);
            generalRulesPassed = false;
            break; // Stop checking other general rules
          }
        }
      }

      // Check if general rules are passed
      if (generalRulesPassed) {
        // All conditions met, add the track to curatedTracklist
        addNextValidTrack(track, curatedTracklist, tracklist);
        curatedTracklistTotalTimeInSecs = calculateOrUpdateCuratedTracklistDuration(track, curatedTracklist);
        console.log(`⭐ Added Base Track! ${track.name} ⭐`);

        // Update the previous tracks with the added track
        [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);

        trackPassedRule = true; // Mark that the track has passed the current rule
        trackIndex++; // Increment trackIndex to move to the next track in curatedTracklist
      }

      // Move to the next track in the tracklist
      currIndex++;
    }
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Phase 2: Ensure rules and final check rules
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  let geeseTracks;

  // Flags to track successfully enforced ensure rules
  const ensureRulesEnforced = {};

  // Initialize ensure rules and set flags based on other functions
  // Initialize ensure rules and set flags based on other functions
  function initializeEnsureRules() {
    const shuffledEnsureRules = shuffleArrayOfRules(unshuffledEnsureRules);

    shuffledEnsureRules.forEach((rule) => {
      const ruleNumber = parseInt(rule.name.match(/\d+/)[0]);
      ensureRulesEnforced[`r${ruleNumber}`] = false;
    });

    // Mark ensure rules as enforced based on conditions
    if (c21(curatedTracklist)) {
      markEnsureRuleEnforced(21);
    }
    if (c22(curatedTracklist)) {
      markEnsureRuleEnforced(22);
    }
    if (c23(curatedTracklist)) {
      markEnsureRuleEnforced(23);
    }
    if (c24(curatedTracklist)) {
      markEnsureRuleEnforced(24);
    }

    // init geese time!
    let isFirstTimeGeeseSeeking = true; // Introduce a flag variable

    if (isFirstTimeGeeseSeeking) {
      geeseTracks = curatedTracklist.filter((t) => t.tags.includes("geese"));
      console.log(`🦆! geeseTrackzzz! ${JSON.stringify(geeseTracks)}`);

      isFirstTimeGeeseSeeking = false;
      if (!geeseTracks) {
        markEnsureRuleEnforced(25);
        console.log(`🦆! Ensure rules enforced?If I have no geese, the 25 flag is true ${ensureRulesEnforced}`);
        // If I have no geese, the 25 flag is true
        markEnsureRuleEnforced(25);
      } else if (geeseTracks.length === 1) {
        // If I have 1 geese the r25 flag is false, hopefully by default
        console.log(`🦆! Curated tracklist already has a geese`);
        console.log(
          `🦆! Ensure rules enforced? If I have 1 geese the r25 flag is false, hopefully by default ${JSON.stringify(ensureRulesEnforced)}`
        );
      } else if (geeseTracks.length === 2) {
        console.log(`🦆! Curated tracklist already has 2 geese: ${curatedTracklistAlreadyHasGeeseTag[0]}, ${curatedTracklistAlreadyHasGeeseTag[1]}`);
        // If I have no geese, the r25 flag is true
        markEnsureRuleEnforced(25);
        console.log(`🦆! Ensure rules enforced? If I have no geese, the r25 flag is true markEnsureRuleEnforced(25); ${ensureRulesEnforced}`);
      }
    }

    // Return the initialized ensureRules (corrected variable name)
    return shuffledEnsureRules;
  }

  // Check if all ensure rules are enforced
  function checkAllEnsureRulesEnforced() {
    return Object.values(ensureRulesEnforced).every((flag) => flag === true);
  }

  // Check if a specific ensure rule is enforced
  function isEnsureRuleEnforced(ruleNumber) {
    return ensureRulesEnforced[`r${ruleNumber}`];
  }

  // Mark an ensure rule as enforced
  function markEnsureRuleEnforced(ruleNumber) {
    ensureRulesEnforced[`r${ruleNumber}`] = true;
  }

  // Ensure a single track against all ensure rules
  function ensureTrack(track, currIndex, ensureRules) {
    for (const rule of ensureRules) {
      const ruleNumber = parseInt(rule.name.match(/\d+/)[0]);

      while (!isEnsureRuleEnforced(ruleNumber)) {
        if (!rule(track, prevTrack1, prevTrack2, curatedTracklist, currIndex)) {
          return false; // Ensure rule failed, exit the loop
        }

        // Mark the rule as enforced once it passes
        markEnsureRuleEnforced(ruleNumber);
      }
    }
    return true; // All ensure rules passed
  }

  // Ensure a single track against general rules
  function ensureGeneralRules(track, currIndex) {
    for (const generalRule of generalRuleFunctions) {
      if (!generalRule(track, prevTrack1, prevTrack2, curatedTracklist, currIndex)) {
        return false; // General rule failed
      }
    }
    return true; // All general rules passed
  }

  // Main ensure rules loop
  function followEnsureRulesLoop(ensureRules) {
    let iterationCounter = 0;

    while (curatedTracklistTotalTimeInSecs <= MAX_PLAYLIST_DURATION_SECONDS && !checkAllEnsureRulesEnforced() && iterationCounter < 3) {
      if (currIndex >= tracklist.length) {
        currIndex = 0;
        iterationCounter++;
      }

      if (!checkAllEnsureRulesEnforced()) {
        const track = tracklist[currIndex];
        if (ensureTrack(track, currIndex, ensureRules)) {
          // i have time for this track
          if (MAX_PLAYLIST_DURATION_SECONDS - (curatedTracklistTotalTimeInSecs + track.duration)) {
            markEnsureRuleEnforced(track, currIndex); // this might be weird on the goose track

            addNextValidTrack(track, curatedTracklist, tracklist);

            // if track is a geese track
            if (track.tags.includes("geese")) {
              console.log(`🦆! My track is a geese ${track.tags}`);

              if (geeseTracks.length === 0) {
                // and it's the first geese track
                ensureRulesEnforced[r25] = false;
                console.log(`🦆! It's the first geese track ${track.tags}`);
              } else {
                // not the first
                ensureRulesEnforced[r25] = true;
                console.log(`🦆! It's not the first geese track ${track.tags}`);
              }
              // update geeseTracks so we have an accurate length
              geeseTracks = curatedTracklist.filter((t) => t.tags.includes("geese"));
              console.log(`🦆! updated list of geese! ${JSON.stringify(geeseTracks)}`);
            }

            console.log(`⭐ Added Ensure Track! ${track.name} ⭐`);
            calculateOrUpdateCuratedTracklistDuration(track, curatedTracklist);
            console.log(`⏰ Playlist duration: ${curatedTracklistTotalTimeInSecs} seconds (${curatedTracklistTotalTimeInMins} minutes)`);
          }
        }
        currIndex++;
      }
    }
  }

  // Main general rules loop
  function followGeneralRulesLoop() {
    while (curatedTracklistTotalTimeInSecs <= MAX_PLAYLIST_DURATION_SECONDS) {
      if (currIndex >= tracklist.length) {
        currIndex = 0;
      }
      const track = tracklist[currIndex];
      if (ensureGeneralRules(track, currIndex)) {
        //         // i have time for this track
        // if (MAX_PLAYLIST_DURATION_SECONDS - (curatedTracklistTotalTime + track.duration)) {

        console.log(`⭐ Added General Track! ${track.name} ⭐`);

        addNextValidTrack(track, curatedTracklist, tracklist);

        // if track is a geese track
        if (track.tags.includes("geese")) {
          if (geeseTracks.length === 0) {
            // and it's the first geese track
            ensureRulesEnforced[r25] = false;
          } else {
            // not the first
            ensureRulesEnforced[r25] = true;
          }
          // update geeseTracks so we have an accurate length
          geeseTracks = curatedTracklist.filter((t) => t.tags.includes("geese"));
        }

        calculateOrUpdateCuratedTracklistDuration(track, curatedTracklist);
        console.log(`⏰ Playlist duration: ${curatedTracklistTotalTimeInSecs} seconds (${curatedTracklistTotalTimeInMins} minutes)`);
      }
      currIndex++;
    }
    console.log("⏰ Out of time!");
  }

  // Main execution
  let initEnsureRules = initializeEnsureRules(); // Get the initialized ensureRules
  followEnsureRulesLoop(initEnsureRules);
  followGeneralRulesLoop();

  // Finally, move the first track to the end of the curatedTracklist
  if (curatedTracklist.length > 0) {
    const firstElement = curatedTracklist.shift(); // Remove the first element
    curatedTracklist.push(firstElement); // Add it to the end
  }

  return curatedTracklist;
}

/* 9. shuffleTracklist takes a tracklist array as input, shuffles its elements
randomly, and returns the shuffled and modified tracklist. */

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX BEFORE THE RULES, WE SHUFFLE OUR TRACKLIST XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function shuffleTracklist(tracklist) {
  // Skip the first track and shuffle the rest of the tracks
  for (let i = tracklist.length - 1; i > 1; i--) {
    const j = Math.floor(Math.random() * (i - 1)) + 1; // Ensure j is at least 1
    [tracklist[i], tracklist[j]] = [tracklist[j], tracklist[i]];
  }
  // console.log(tracklist);
  return tracklist;
}

function shuffleArrayOfRules(shuffledRulesArray) {
  const lastElement = shuffledRulesArray.pop(); // Remove the last element
  for (let i = shuffledRulesArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledRulesArray[i], shuffledRulesArray[j]] = [shuffledRulesArray[j], shuffledRulesArray[i]]; // Swap elements at i and j
  }
  shuffledRulesArray.push(lastElement); // Add the last element back to the end
  return shuffledRulesArray; // Return the shuffled array
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX CHECK THOSE TRACKS!!!! XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

async function isValidTracklist(tracklist) {
  const invalidTracks = [];

  for (let i = 0; i < tracklist.length; i++) {
    const track = tracklist[i];

    // Check track URL
    if (!(await isValidUrl(track.url))) {
      invalidTracks.push({ type: "Track", url: track.url });
    }

    // Check credit URL
    if (track.credit && !(await isValidUrl(track.credit))) {
      invalidTracks.push({ type: "Credit", url: track.credit });
    }
  }

  if (invalidTracks.length > 0) {
    console.log("Invalid URLs:");
    console.log(invalidTracks);
  } else {
    console.log("All URLs are valid.");
  }

  // Return true if there are no invalid tracks
  return invalidTracks.length === 0;
}

async function isValidUrl(url) {
  try {
    const response = await fetch(url);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX CREATE AND PRINT DEBUG TEXT SO LAURA CAN SEE DETAILS XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function displayDebugText(element, text, defaultText) {
  if (element) {
    if (text && text !== "") {
      element.textContent = " " + text;
    } else {
      element.textContent = defaultText;
    }
  } else {
    console.log("no element"); // TODO - why is there no element sometimes?
  }
}

function gatherAndPrintDebugInfo(song, index) {
  if (song) {
    // get debug ids so I can fill in debug info
    const currTrackNameHTMLElement = document.getElementById("currTrackName");
    // const playerTrackNameHTMLElement =
    document.getElementById("playerTrackName");

    const currURLHTMLElement = document.getElementById("currURL");
    const currTagsHTMLElement = document.getElementById("currTags");
    const currDurrHTMLElement = document.getElementById("currDurr");
    const totalDurrHTMLElement = document.getElementById("totalDurr");
    // const displayConsoleLogHTMLElement = document.getElementById("displayConsoleLog");
    const currCreditHTMLElement = document.getElementById("currCredit");
    const currIndexNokHTMLElement = document.getElementById("indexNo");
    // const currCreditStackHTMLElement = document.getElementById("creditStackHTML");
    // const currTotalIndexHTMLElement = document.getElementById("totalIndex");

    // get the info for THIS song so I can print it to the debug
    const currTags = song.tags;
    const currUrl = song.url;
    const currDurr = song.duration;
    const totalDurr = Math.floor(curatedTracklistTotalTimeInSecs / 60);
    const currName = song.name;
    const currCredit = song.credit;
    const ohcurrIndex = index;
    // creditstack defined elsewhere

    displayDebugText(currTrackNameHTMLElement, currName, "no name");
    // displayDebugText(playerTrackNameHTMLElement, currName, "no name");
    displayDebugText(currURLHTMLElement, currUrl, "no url");
    displayDebugText(currTagsHTMLElement, currTags, "no tags");
    displayDebugText(currDurrHTMLElement, currDurr, "no duration");
    displayDebugText(totalDurrHTMLElement, totalDurr, "no duration");

    // displayDebugText(displayConsoleLogHTMLElement, displayConsoleLog, "no log");
    displayDebugText(currCreditHTMLElement, currCredit, "no credit");
    // displayDebugText(currCreditStackHTMLElement, creditsArray, "no credit");
    displayDebugText(currIndexNokHTMLElement, ohcurrIndex, "no index");
  } else {
    console.log("OH NO, NO SONG!");
    return;
  }
}

function printEntireTracklistDebug(shuffledSongsWithOpen) {
  const currTrackNameElement = document.getElementById("fullList");

  // Clear the existing content
  while (currTrackNameElement.firstChild) {
    currTrackNameElement.removeChild(currTrackNameElement.firstChild);
  }

  // Loop through the shuffled songs and add each track with a number
  for (let i = 0; i < shuffledSongsWithOpen.length; i++) {
    const itemElement = document.createElement("div");
    const trackNumber = i + 1; // Adding 1 to the index to start numbering from 1
    let itemText = trackNumber + ". ";

    // Define an object with the properties you want to include
    const songInfo = {
      Name: shuffledSongsWithOpen[i].name,
      Author: shuffledSongsWithOpen[i].author,
      Duration: shuffledSongsWithOpen[i].duration,
      Form: shuffledSongsWithOpen[i].form,
      Language: shuffledSongsWithOpen[i].language,
      Sentiment: shuffledSongsWithOpen[i].sentiment,
      BackgroundMusic: shuffledSongsWithOpen[i].backgroundMusic,
    };

    // Define CSS styles for labels (teal and bold)
    const labelStyle = "color: teal; font-weight: bold;";

    // Iterate through the properties and add non-empty values to itemText
    for (const property in songInfo) {
      const value = songInfo[property];
      if (value !== undefined && value !== null && value !== "") {
        // Add labels with styling
        itemText += `<span style="${labelStyle}">${property}:</span> ${value}, `;
      }
    }

    // Handle placement and tags separately
    const placement = shuffledSongsWithOpen[i].placement;
    const tags = shuffledSongsWithOpen[i].tags;

    if (Array.isArray(placement) && placement.some((value) => value !== "")) {
      itemText += `<span style="${labelStyle}">placement:</span> ${placement.filter((value) => value !== "").join(", ")}, `;
    }

    if (Array.isArray(tags) && tags.some((value) => value !== "")) {
      itemText += `<span style="${labelStyle}">tags:</span> ${tags.filter((value) => value !== "").join(", ")}, `;
    }

    // Remove the trailing ", " if it exists
    if (itemText.endsWith(", ")) {
      itemText = itemText.slice(0, -2);
    }

    // Set the HTML content with formatted labels
    itemElement.innerHTML = itemText;
    currTrackNameElement.appendChild(itemElement);
  }

  if (shuffledSongsWithOpen.length > 0) {
    currTrackNameElement.style.display = "block";
  } else {
    console.log("No items to display.");
  }
}

// first time is queueNextTrack(curatedTracklist, 0, 0, cache));
function queueNextTrack(songs, index, currentRuntime, cache) {
  try {
    const song = songs[index]; // get the song object
    const audio = song.audio;
    player = audio; // Update player to the current audio

    // Log current song information
    console.log(`Queueing song: ${song.name}, Index: ${index}, Current Runtime: ${currentRuntime}`);
    // currentRuntime = randomValueSomeTimerThing;

    // Tell the browser to start downloading audio
    if (audio) {
      audio.preload = "auto";
    }

    const track = audioContext.createMediaElementSource(audio);
    track.connect(volumeNode);

    // When the song has ended, queue up the next one
    audio.addEventListener("ended", (e) => {
      const duration = audio.duration;
      // console.log(`Song ended: ${song.name}, Duration: ${duration}`);
      timerDuration += Math.floor(duration); // Update currentRuntime with the cumulative duration
      // Queue up the next song (songs, index, currentRuntime, cache) {
      console.log("Queueing next track with the following values:");
      console.log(`Queueing- Index: ${index + 1}`);
      console.log(`Queueing- Current Runtime: ${currentRuntime}`);
      // console.log(`Queueing- Current duration: ${duration}`);
      // console.log(`Queueing- Current Runtime + duration: ${currentRuntime + duration}`);
      // console.log(`Queueing- Cache: ${cache}`);
      queueNextTrack(songs, index + 1, currentRuntime, cache);
    });

    // Set a timer to preload the next file
    const timeoutDurationMs = (song.duration - PREFETCH_BUFFER_SECONDS) * 1000;
    setTimeout(() => {
      const nextAudio = songs[index + 1];
      nextAudio.preload = "auto";
      fetchAndCacheAudio(nextAudio.url, cache).then((p) => console.log(`Loaded ${nextAudio.url} into cache`));
    }, timeoutDurationMs);

    // Log the debug information
    gatherAndPrintDebugInfo(song, index);

    // Play the audio
    audio.play();

    // Update the progress timer for the first time
    // createTimerLoopAndUpdateProgressTimer();
  } catch (error) {
    // Log any errors that occur
    console.error("An error occurred in queueNextTrack:", error);
  }
}

const button = document.getElementById("generate-playlist-btn");
button.addEventListener("click", (event) => {
  displayLoadingGifAndGeneratePlayer();

  if (audioContext == null) {
    // for browser compatibility, redefine AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    volumeNode = audioContext.createGain();
    volumeNode.connect(audioContext.destination);
  }

  const allSongs = [...songs]; // first we copy the array of songs
  // const checkValidityOfURLS = isValidTracklist(allSongs); //

  const shuffledSongs = shuffleTracklist(allSongs); // next we shuffle it

  curatedTracklist = followTracklistRules(shuffledSongs); // next we apply the rules and get our new curated tracklist

  const outro1 = outroAudioSounds.map(addAudioFromUrl);
  curatedTracklist.push(...outro1);

  let creditsTracklist = gatherTheCreditSongs(curatedTracklist);

  curatedTracklist.push(...creditsTracklist);

  const outro2 = finalOutroAudioSounds.map(addAudioFromUrl);
  curatedTracklist.push(...outro2);

  createTranscriptContainer();

  printEntireTracklistDebug(curatedTracklist);

  console.log("Queueing next track with the following values:");
  window.caches.open("audio-pre-cache").then((cache) => queueNextTrack(curatedTracklist, 0, 0, cache));
  createTimerLoopAndUpdateProgressTimer();
});
