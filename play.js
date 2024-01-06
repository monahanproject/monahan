// need to add the credit durations to the duration

var myLang = localStorage["lang"] || "defaultValue";
var player;
var audioContext = null;
var volumeNode;
let playerPlayState = "play";
let hasSkippedToEnd = false;
let displayConsoleLog = "<br>";
let curatedTracklistTotalTimeInSecs = 0;
let curatedTracklistTotalTimeInMins;
let curatedTracklist;
let timerDuration = 0;

const MAX_PLAYLIST_DURATION_SECONDS = 3140; //(19m)

var totalDurationSeconds = 1140; //(19m)
let currentTimeElement; // Element to display current time
const PREFETCH_BUFFER_SECONDS = 8; /* set how many seconds before a song is completed to pre-fetch the next song */

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXX SET UP THE PLAYER  XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

player = document.getElementById("music_player");
player.controls = false;

const playButton = document.getElementById("play-button");
var svgContainer = document.getElementById("play-button-svg-container");
var textContainer = document.getElementById("play-button-text-container");
const playIcon = document.getElementById("play-icon");
const pauseIcon = document.getElementById("pause-icon");
const skipBackwardButton = document.getElementById("skipBackwardButton");
const skipForwardButton = document.getElementById("skipForwardButton");
const trackNameContainer = document.getElementById("playerTrackNameContainer");

function createVolumeSlider() {
  const volumeSlider = document.getElementById("volume-slider");
  if (volumeSlider) {
    // Check if the element exists
    volumeSlider.type = "range";
    volumeSlider.max = "100";
    volumeSlider.min = "0";
    volumeSlider.value = "75"; // Set this to your preferred starting value, e.g., 75 for 75%
  }
  return volumeSlider;
}
const volumeSlider = createVolumeSlider();
function createAudioElement(id) {
  const audio = document.createElement("audio");
  audio.id = id;
  return audio;
}

function handleVolumeChange(event) {
  if (volumeNode !== undefined) {
    const newVolume = parseFloat(event.target.value) / 100;
    volumeNode.gain.value = newVolume;
  }
}

if (volumeSlider) {
  volumeSlider.addEventListener("change", handleVolumeChange);

  // Initialize the volume to the slider's starting value when the page loads
  document.addEventListener("DOMContentLoaded", () => {
    handleVolumeChange({ target: { value: volumeSlider.value } });
  });
}

let isUpdatingTime = false; // Flag to prevent rapid updates

function handleSkipForwardClick() {
  let newPlayerTime = player.currentTime + 20;
  newPlayerTime = Math.min(newPlayerTime, totalDurationSeconds);
  if (!isUpdatingTime) {
    isUpdatingTime = true; // Set a flag to prevent rapid updates
    setTimeout(() => {
      player.currentTime = newPlayerTime;
      isUpdatingTime = false;
    }, 20); // Adjust the delay as needed (100 milliseconds in this case)
  }
}

function handleSkipBackwardClick() {
  let newPlayerTime = player.currentTime - 20;
  newPlayerTime = Math.min(newPlayerTime, totalDurationSeconds);
  if (!isUpdatingTime) {
    isUpdatingTime = true; // Set a flag to prevent rapid updates
    setTimeout(() => {
      player.currentTime = newPlayerTime;
      isUpdatingTime = false;
    }, 20); // Adjust the delay as needed (100 milliseconds in this case)
  }
}

// const trackNameElement = createTrackNameElement();
playButton.addEventListener("click", handlePlayPauseClick);
skipBackwardButton.addEventListener("click", handleSkipBackwardClick);
skipForwardButton.addEventListener("click", handleSkipForwardClick);
volumeSlider.addEventListener("change", handleVolumeChange);

// https://css-tricks.com/lets-create-a-custom-audio-player/
function createHTMLMusicPlayer() {}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXX  TIMER  XXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function updateProgressTimerr(elapsedSeconds, previousDuration) {
  const progressBar = document.getElementById("progress-bar");
  const progressDot = document.getElementById("progress-dot");
  const timePlayedElement = document.getElementById("time-played");
  const timeRemainingElement = document.getElementById("time-remaining");

  if (!timePlayedElement || !timeRemainingElement || !progressBar || !progressDot) {
    console.error("Error: Missing elements");
    return;
  }

  totalDurationSeconds = curatedTracklistTotalTimeInSecs;
  const remainingDurationSeconds = totalDurationSeconds - (elapsedSeconds + previousDuration);

  // Calculate the percentage of the track that's been played
  const playedPercentage = ((elapsedSeconds + previousDuration) / totalDurationSeconds) * 100;

  // Update the progress bar and dot
  progressBar.style.width = `${playedPercentage}%`;
  progressDot.style.left = `calc(${playedPercentage}% - 5px)`; // Adjust based on the dot's size

  // Update the time labels
  const playedTime = calculateMinutesAndSeconds(elapsedSeconds + previousDuration);
  const remainingTime = calculateMinutesAndSeconds(remainingDurationSeconds);

  timePlayedElement.innerText = `${playedTime.minutes}:${playedTime.seconds}`;
  timeRemainingElement.innerText = `-${remainingTime.minutes}:${remainingTime.seconds}`;
}

function handleTimerCompletion() {
  const timeRemainingElement = document.getElementById("time-remaining");

  if (!timeRemainingElement) {
    console.error("Error: Missing element 'time-remaining'");
    return; // Exit the function to prevent further errors
  }
  timeRemainingElement.innerHTML = "Done";
}

function calculateMinutesAndSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  return { minutes, seconds: remainingSeconds };
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
//  XXXXXXXXX generate player  XXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function generatePlayer() {}

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
    url: "./sounds/INTRO_OUTRO_NAMES/OUTRO_2.1.mp3",
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
    url: "./sounds/INTRO_OUTRO_NAMES/OUTRO_2.2_MUSIC.mp3",
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

    // curatedTracklistTotalTimeInSecs = calculateOrUpdateCuratedTracklistDuration(song, curatedTracklist);
    // console.log(`adding credit, gopefully song is ${song}, hopefully song duration is ${song.duration}`);
  }
  return arrayOfCreditSongs;
}

//////////////////////////////////////
////////// TRANSCRIPT STUFF //////////
/////////////////////////////////////

// Global variables
let transcript = ""; // Store the transcript
let language = "english"; // Default language
let transcriptVisible = false; // Track visibility of transcript
let transcriptContent; // Define transcriptContent as a global variable
const transcriptContainer = document.getElementById("transcriptContainer"); // Moved to global scope

// Helper function to create elements with attributes
function createElement(type, attributes) {
  const element = document.createElement(type);
  Object.keys(attributes).forEach((attr) => (element[attr] = attributes[attr]));
  return element;
}

// Function to create the transcript container and button
function createTranscriptContainer() {
  if (!transcriptContainer) {
    console.error("Transcript container not found.");
    return;
  }
  const transcriptButton = createElement("button", {
    type: "button",
    className: "btn",
    id: "transcriptButton",
    textContent: "TRANSCRIPT",
  });

  const transBtnContainer = document.getElementById("transButtonContainer");
  transBtnContainer.appendChild(transcriptButton);
  transcriptButton.addEventListener("click", toggleTranscript);
  // Initialize transcriptContent here to avoid re-declaration later
  transcriptContent = createElement("div", { id: "transcriptContent", style: "display: none" });
  transcriptContainer.appendChild(transcriptContent); // Append to the container
}

// Function to apply formatting to text
function formatText(text) {
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

function createHTMLFromText(text) {
  const container = createElement("div", {});
  const currentParagraph = createElement("p", {
    style: "margin-top: 3rem; margin-bottom: 4rem; padding: 1rem; background-color: #f0ebf8; margin-left: 0; margin-right: 0;",
  });

  try {
    currentParagraph.innerHTML = formatText(text); // Refactored to formatText function
    container.appendChild(currentParagraph);
  } catch (error) {
    console.error("Error while processing input text:", error);
  }

  return container;
}

// Function to update the transcript based on the selected language
function updateTranscript() {
  if (!transcriptContainer) {
    console.error("Transcript container not found.");
    return;
  }

  transcriptContainer.innerHTML = ""; // Clear previous content

  const langKey = language === "english" ? "engTrans" : "frTrans";
  const copyRightText =
    language === "english"
      ? "$All recordings and transcripts are copyright protected. All rights reserved.$$"
      : "$Les enregistrements et les transcriptions sont protégés par le droit d’auteur. Tous droits réservés.$$";

  curatedTracklist.forEach((song) => {
    const inputString = song[langKey];
    if (inputString && inputString.trim() !== "") {
      transcriptContainer.appendChild(createHTMLFromText(inputString));
    }
  });

  transcriptContainer.appendChild(createHTMLFromText(copyRightText));
  transcriptContainer.style.display = "block";
}

// Function to toggle the transcript visibility
function toggleTranscript() {
  const transcriptButton = document.getElementById("transcriptButton");

  transcriptVisible = !transcriptVisible; // Toggle the flag first for more predictable logic
  if (transcriptVisible) {
    updateTranscript(); // Update before showing
    transcriptContainer.style.display = "block";
    transcriptButton.textContent = "Hide Transcript";
  } else {
    transcriptContainer.style.display = "none";
    transcriptButton.textContent = "Show Transcript";
  }
}

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  ~~~~~~ TRACKLIST CREATION ~~~~~~~
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX ✉️ GENERAL RULES XXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

let r10rule = "The current track must have a different author than the last track";
let r11rule = "No more than two tracks from the same author in a tracklist";
let r12rule = "Tracks with the form short and the language musical can never follow tracks with the form music";
let r13rule = "Tracks with the form music can never follow tracks with both the form short and the language musical";
let r14rule = "The value for backgroundMusic should never match the author of the track right before it, and the author of the track should never match the backgroundMusic of the track right before it";
let r15rule = "If the previous track has the sentiment heavy, this track cannot have the the laughter tag";
let r16rule = "If the previous track has length long and form music, this track must have the form interview";

let r60rule = "The 0th track must have the placement end (we'll be moving this to the end)";
let r61rule = "The 1st track must have the tag 'intro'";
let r62rule = "The 2nd track must have the placement 'beginning'";
let r63rule = "The 3rd track must have the placement beginning and a different form than the 2nd track";
let r64rule = "The 4th track must have the placement middle and a different form than the 3rd track";
let r65rule = "The 5th track must have the length 'short'; must have the placement 'middle'; and have a different language than the 4th track";
let r66rule = "The 6th track must have the placement 'middle' and a different form than the 5th track";
let r67rule = "The 7th track must have the placement 'middle' and a different form than the 6th track";
let r68rule = "The 8th track must have the placement 'middle', a different form than previous track";

let r21rule = "The tracklist must contain at least one track with the author ALBERT";
let r22rule = "The tracklist must contain at least one track with the author PIERREELLIOTT";
let r23rule = "The tracklist must contain at least one track with the form interview";
let r24rule = "The tracklist must contain at least one track with the form music";

let r25rule = "The tracklist must contain at least one track with the tag 'geese'";



// R10: The current track must have a different author than the last track
function r10(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const trackName = track.name;
  const ruleType = `✉️ General rule:`;
  const logMessage = `The current track must have a different author (${track.author}) than the previous track (${prevTrack1.author})`;
  if (prevTrack1 && track.author === prevTrack1.author) {
    logRuleApplication(10, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(10, logMessage, true, ruleType);
  return true;
}
// R11: No more than two tracks from the same author in a tracklist
function r11(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const trackName = track.name;
  const ruleType = `✉️ General rule:`; 

  // Adjust the count based on whether the track is being added for the first time
  const isNewAddition = !curatedTracklist.some(t => t.name === track.name);
  const authorCount = curatedTracklist.filter(t => t.author.trim() === track.author.trim()).length + (isNewAddition ? 1 : 0);

  // If there are already 2 or more tracks from the same author before this track, log a rule violation
  if (authorCount > 2) {
    const violatingTracks = curatedTracklist
      .filter((t) => t.author === track.author)
      .map((t) => t.name)
      .join(", ");
    const logMessage = `No more than two tracks from the same author (${track.author}) allowed in a tracklist. Violating tracks are: ${violatingTracks}`;
    logRuleApplication(11, logMessage, false, ruleType);
    return false;
  }
  // If the condition is met (no rule violation), log successful rule application
  const logMessage = `No more than two tracks from the same author (${track.author}) allowed in a tracklist.`;
  logRuleApplication(11, logMessage, true, ruleType);
  return true;
}



// R12: Tracks with the form short and the language musical can never follow tracks with the form music.
function r12(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const trackName = track.name;
  const ruleType = `✉️ General rule:`;
  const logMessage = `Tracks with form 'short' and language 'musical' (track's form is ${track.form}) and language (track's language is ${track.language}) cannot follow tracks with form 'music' (last track's form is ${prevTrack1.form})`;

  if (track.form === "short" && track.language === "musical" && prevTrack1.form === "music") {
    logRuleApplication(12, logMessage, false, ruleType);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  logRuleApplication(12, logMessage, true, ruleType);
  return true;
}
// R13: Tracks with the form music can never follow tracks with both the form short and the language musical.
function r13(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const trackName = track.name;
  const ruleType = `✉️ General rule:`;
  const logMessage = `Tracks with form 'music' (track's form ${track.form}) cannot follow tracks with form 'short' and language 'musical' (last track's form was ${prevTrack1.form} and language was ${prevTrack1.language})`;

  if (track.form === "music" && curatedTracklist.some((prevTrack) => prevTrack.form === "short" && prevTrack.language === "musical")) {
    logRuleApplication(13, logMessage, false, ruleType);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  logRuleApplication(13, logMessage, true, ruleType);
  return true;
}
// R14: The value for backgroundMusic should never match the author of the track right before it, and the author of the track should never match the backgroundMusic of the track right before it.
function r14(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const trackName = track.name;
  const ruleType = `✉️ General rule:`;
  const logMessage = `The value for backgroundMusic (track's background Music is '${track.backgroundMusic}') should never match the author of the track before (last track's author is '${prevTrack1.author}') or the backgroundMusic of the track before (last track's backgroundMusic is ${prevTrack1.backgroundMusic})`;

  if (
    prevTrack1 &&
    prevTrack1.author.trim() !== "" &&
    track.backgroundMusic.trim() !== "" &&
    (track.backgroundMusic === prevTrack1.author || track.author === prevTrack1.backgroundMusic)
  ) {
    logRuleApplication(14, logMessage, false, ruleType);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  logRuleApplication(14, logMessage, true, ruleType);
  return true;
}
// R15: If the previous track has the sentiment heavy, this track cannot have the the laughter tag.
function r15(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const trackName = track.name;
  const ruleType = `✉️ General rule:`;
  const logMessage = `If the previous track has the sentiment heavy (previous track's sentiment is ${prevTrack1.sentiment}), this track cannot have the laughter tag (track's tags are ${track.tags})`;
  if (track.tags.includes("laughter") && prevTrack1.sentiment === "heavy") {
    logRuleApplication(15, logMessage, false, ruleType);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  logRuleApplication(15, logMessage, true, ruleType);
  return true;
}
// R16: If the previous track has length long and form music, this track must have the form interview`;
function r16(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const trackName = track.name;
  const ruleType = `✉️ General rule:`;
  const logMessage = `If the previous track has length 'long' (last track's length is ${prevTrack1.length}) and form 'music' (last track's form is ${prevTrack1.form}), this track must have the form 'interview' (track's form is ${track.form})`;

  if (prevTrack1 && prevTrack1.length === "long" && prevTrack1.form === "music" && track.form !== "interview") {
    logRuleApplication(16, logMessage, false, ruleType);
    return false; // Return false to indicate the rule is broken.
  }
  // If the rule is not violated, return true to indicate that the rule is followed.
  logRuleApplication(16, logMessage, true, ruleType);
  return true;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX 📙 Base track rules (TRACKS 1-8) XXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// R00: Rule 0 (only for Track 0): The Oth track must have the placement end (we'll be moving this to the end).
function r60(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The 0th (eventually final) track includes the placement end (placement ${track.placement})`;

  if (trackIndex === 0 && !track.placement.includes("end")) {
    logRuleApplication(60, logMessage, false, ruleType);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  logRuleApplication(60, logMessage, true, ruleType);
  return true;
}

// R61: Rule 1 (only for Track 1): The 1st track must have the tag 'intro'.
function r61(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The track's index is ${trackIndex}. The 1st track must have the tag intro (track's tags are ${track.tags})`;

  if (trackIndex === 1 && !track.tags.includes("intro")) {
    logRuleApplication(61, logMessage, false, ruleType);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  logRuleApplication(61, logMessage, true, ruleType);
  return true;
}

// R62: Rule 2 (only for Track 2):The 2nd track must have the placement 'beginning'.
function r62(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The track's index is ${trackIndex}. The 2nd track must have the placement beginning (track's placement is ${track.placement})`;

  if (trackIndex === 2 && !track.placement.includes("beginning")) {
    logRuleApplication(62, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(62, logMessage, true, ruleType);
  return true;
}

// R63: Rule 3 (only for Track 3): The 3rd track must have the placement beginning and a different form than the 2nd track.
function r63(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The track's index is ${trackIndex}. The 3rd track must have the placement beginning (track's placement is ${track.placement}) and a different form (track's form is ${track.form}) than the 2nd track (the 2nd track's form is ${prevTrack1.form})`;

  if ((trackIndex === 3 && !track.placement.includes("beginning")) || (trackIndex === 3 && track.form === prevTrack1.form)) {
    logRuleApplication(63, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(63, logMessage, true, ruleType);
  return true;
}

// R64: Rule 4 (only for Track 4): The 4th track must have the placement middle and a different form than the 3rd track.
function r64(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The track's index is ${trackIndex}. The 4th track must have the placement middle (track's placement is ${track.placement}); and a different form (track's form is ${track.form}); than the 3rd track (the 3rd track's form is ${prevTrack1.form})`;

  if ((trackIndex === 4 && !track.placement.includes("middle")) || (trackIndex === 4 && track.form === prevTrack1.form)) {
    logRuleApplication(64, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(64, logMessage, true, ruleType);
  return true;
}

// R65: Rule 5 (only for Track 5): The 5th track must have the length 'short'; must have the placement 'middle'; and have a different language than the 4th track.
function r65(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The track's index is ${trackIndex}. The 5th track must have the length short (track's length is ${track.length}); must have the placement MIDDLE (track's placement is ${track.placement}); and a different language (track's language is ${track.language}) from the 4th track (the 4th track's language is ${prevTrack1.language})`;

  if (
    (trackIndex === 5 && track.length !== "short") ||
    (trackIndex === 5 && !track.placement.includes("middle")) ||
    (trackIndex === 5 && track.language === prevTrack1.language)
  ) {
    logRuleApplication(65, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(65, logMessage, true, ruleType);
  return true;
}

// R66: Rule 6 (only for Track 6): The 6th track must have the placement 'middle' and a different form than the 5th track.
function r66(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `The track's index is ${trackIndex}. The 6th track has the placement MIDDLE (track's placement is ${track.placement}); and has a different form (track's form is ${track.form}) vs the 5th track (the 5th's track's form is ${prevTrack1.form})`;

  if (trackIndex === 6 && !track.placement.includes("middle")) {
    logRuleApplication(66, logMessage, false, ruleType);
    return false;
  }
  if (trackIndex === 6 && track.form === prevTrack1.form) {
    logRuleApplication(66, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(66, logMessage, true, ruleType);
  return true;
}

// R67: Rule 7 (only for Track 7): The 7th track must have the placement 'middle' and a different form than the 6th track
function r67(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The track's index is ${trackIndex}. The 7th track must have the placement MIDDLE (track's placement is ${track.placement}) and has a different form (track's form is ${track.form}) vs the 6th track (the 6th track's form is ${prevTrack1.form}); AND unless the form of the 7th track is MUSIC (the 7th track's form is ${track.form}), the 7th track also has a different language (the 7th track's language is ${track.language}) from the 6th track (the 6th track's language is ${prevTrack1.language})`;

  if (trackIndex === 7 && (!track.placement.includes("middle") || (track.form === prevTrack1.form && track.form !== "music"))) {
    logRuleApplication(67, logMessage, false, ruleType);
    return false;
  }
  if (trackIndex === 7 && track.form === prevTrack1.form) {
    logRuleApplication(67, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(67, logMessage, true, ruleType);
  return true;
}

// R68: Rule 8 (only for Track 8): The 8th track must have the placement 'middle', a different form than previous track
function r68(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The track's index is ${trackIndex}. The 8th track must have the placement MIDDLE (track's placement is ${track.placement}); and a different form (track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}); and has a different language (track's language is ${track.language}) vs the 7th track (the 7th track's language is ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;

  if (trackIndex === 8 && (!track.placement.includes("middle") || (track.form === prevTrack1.form && track.form !== "music"))) {
    logRuleApplication(68, logMessage, false, ruleType);
    return false;
  }
  if (trackIndex === 8 && track.form === prevTrack1.form) {
    logRuleApplication(68, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(68, logMessage, true, ruleType);
  return true;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX ENSURE RULES (NEAR THE END) XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// R21. The tracklist must contain at least one track with the author ALBERT.
function r21(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `👀 Ensure rule:`;
  const logMessage = `✨ ${track.name}: Ensure track rule: The tracklist must contain at least one track with the author ALBERT (track's name is ${track.name}, track's author is ${track.author})`;

  if (track.author != "ALBERT") {
    logRuleApplication(21, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(21, logMessage, true, ruleType);
  return true;
}

// R22. The tracklist must contain at least one track with the author PIERREELLIOTT.
function r22(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `👀 Ensure rule:`;
  const logMessage = `Ensure track rule: The tracklist must contain at least one track with the author PIERREELLIOTT (track's name is ${track.name}, track's author is ${track.author})`;

  if (track.author !== "PIERREELLIOTT") {
    logRuleApplication(22, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(22, logMessage, true, ruleType);
  return true;
}

// R23. The tracklist must contain at least one track with the form interview.
function r23(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `👀 Ensure rule:`;
  const logMessage = ` Ensure track rule: The tracklist must contain at least one track with the form interview (track's name is ${track.name}, track's form is ${track.form})`;

  if (track.form !== "interview") {
    logRuleApplication(23, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(23, logMessage, true, ruleType);
  return true;
}

// R24. The tracklist must contain at least one track with the form music.
function r24(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `👀 Ensure rule:`;
  const logMessage = `Ensure track rule: The tracklist must contain at least one track with the form music (track's name is ${track.name}, track's form is ${track.form})`;

  if (track.form !== "music") {
    logRuleApplication(24, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(24, logMessage, true, ruleType);
  return true;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX Geese RULE (AT THE VERY END) XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function r25(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const ruleType = `👀 Ensure rule:`;
  let geeseTracks = curatedTracklist.filter((t) => t.tags && t.tags.includes("geese"));

  // Print a message at the end of processing all tracks
  if (trackIndex === curatedTracklist.length - 1) {
    if (geeseTracks.length === 1) {
      console.log(`${ruleType} Rule c25 violated: Exactly one track with the tag 'geese' found, which is not acceptable.`);
      return false;  // Rule is violated if exactly one 'geese' track is found
    } else if (geeseTracks.length === 0 || geeseTracks.length > 1) {
      console.log(`${ruleType} Acceptable number of 'geese' tracks found. Count: ${geeseTracks.length}`);
      return true;  // Rule is followed if 0 or more than 1 'geese' tracks are found
    }
  }
  return true;  // Default return true for tracks before the last one
}


//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX 👀 ENSURE CHECKS (NEAR THE END) XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// Rule C21 The tracklist must contain at least one track with the author ALBERT
function c21(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `👀 Ensure rule:`;

  let trackWithAttribute = trackExistsWithAttributes(curatedTracklist, "author", "ALBERT");
  if (!trackWithAttribute) {
    const logMessage = `The tracklist must contain at least one track with the author ALBERT `;
    logRuleApplication(21, logMessage, false, ruleType);
    return false;
  }
  const logMessage = `The tracklist must contain at least one track with the author ALBERT (trackWithAttribute is ${trackWithAttribute.name}, author is ${trackWithAttribute.author})`;
  logRuleApplication(21, logMessage, true, ruleType);
  return true;
}

// Rule C22 The tracklist must contain at least one track with the author PIERREELLIOTT
function c22(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `👀 Ensure rule:`;
  const logMessage = `✨ Ensure track rule: The tracklist must contain at least one track with the author PIERREELLIOTT (trackWithAttribute is ${trackWithAttribute.name}, author is ${trackWithAttribute.author})`;

  let trackWithAttribute = trackExistsWithAttributes(curatedTracklist, "author", "PIERREELLIOTT");
  if (!trackWithAttribute) {
    logRuleApplication(22, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(22, logMessage, true, ruleType);
  return true;
}

// Rule C23 The tracklist must contain at least one track with the form interview
function c23(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `👀 Ensure rule:`;

  let trackWithAttribute = trackExistsWithAttributes(curatedTracklist, "form", "interview");
  if (!trackWithAttribute) {
    const logMessage = `Ensure track rule: The tracklist must contain at least one track with the form interview`;
    logRuleApplication(23, logMessage, false, ruleType);
    return false;
  }
  const logMessage = `✨ Ensure track rule: The tracklist must contain at least one track with the form interview (trackWithAttribute is ${trackWithAttribute.name}, form is ${trackWithAttribute.form})`;
  logRuleApplication(23, logMessage, true, ruleType);
  return true;
}

// Rule C24 The tracklist must contain at least one track with the form music
function c24(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `👀 Ensure rule:`;

  let trackWithAttribute = trackExistsWithAttributes(curatedTracklist, "form", "music");

  if (!trackWithAttribute) {
    const logMessage = `Ensure track rule: The tracklist must contain at least one track with the form music`;
    logRuleApplication(24, logMessage, false, ruleType);
    return false;
  }
  const logMessage = ` ✨! Ensure track rule: The tracklist must contain at least one track with the form music (trackWithAttribute is ${trackWithAttribute.name}, form is ${trackWithAttribute.form})`;
  logRuleApplication(24, logMessage, true, ruleType);
  return true;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX HELPER FUNCTIONS (FOR CHECKING TRACK VALIDITY) XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function calculateOrUpdateCuratedTracklistDuration(track, curatedTracklist) {
  if (curatedTracklistTotalTimeInSecs === 0) {
    for (const track of curatedTracklist) {
      // console.log("ttt track name is " + track.name);
      // console.log("ttt track time is " + (track.duration || 0)); // Use 0 if duration is undefined or null
      curatedTracklistTotalTimeInSecs += track.duration || 0;
    }
  } else if (track) {
    // console.log("curatedTracklistTotalTime is " + curatedTracklistTotalTime);
    curatedTracklistTotalTimeInSecs += track.duration || 0;
  }

  curatedTracklistTotalTimeInMins = Math.floor(curatedTracklistTotalTimeInSecs / 60);

  return curatedTracklistTotalTimeInSecs;
}

function getFinalCuratedTracklistDuration(tracklist) {
  let curatedTracklistTotalTimeInSecs = 0;

  for (const track of curatedTracklist) {
    console.log("Track name is " + track.name);
    const duration = track.duration || 0; // Use 0 if duration is undefined or null
    console.log("Track duration is " + duration);

    curatedTracklistTotalTimeInSecs += duration;
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

function logRuleApplication(ruleNumber, trackName, isApplied, ruleType, message = null) {
  // function logRuleApplication(ruleNumber, description, isApplied, message = null) {
  const ruleStatus = isApplied ? "passed" : "failed"; // Use "failed" for consistency
  const statusIcon = isApplied ? "🌱" : "❌"; // Add status icon based on isApplied

  console.log(
    `status icon:: ${statusIcon} trackName:: ${trackName} isapplied:: ${isApplied} rulestatus:: ${ruleStatus} ruletype:: ${ruleType} R${ruleNumber}`
  );

  // console.log(`${statusIcon} ${description} ${ruleStatus} 📙 Base track rule R${ruleNumber}`);

  // console.log(`R${ruleNumber} ${ruleStatus}: ${description}`);
  // addToLogDisplay(`Rule ${ruleNumber} ${ruleStatus}: ${description}`); // commented out to stop log

  if (message !== null) {
    displayConsoleLog += `→ Track ${ruleNumber} Rules ${ruleStatus}: ${trackName}<br>`;
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

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Phase 1: Apply track-specific rules and general rules
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  console.log("PHASE 1 Apply track-specific rules and general rules");
  for (let i = 0; i < 8; i++) {
    // Get the specific rule function based on index
    const ruleFunction = window["r" + (i + 60)];
    const description = `Rule ${i + 60} description`;
    const ruleJustForLogging = `R${i + 60}`;

    // Reset the current index for each rule iteration
    currIndex = 0;
    let ruleMet = false; // Flag to check if the current rule can be met
    let tracksTried = 0; // Keep track of how many tracks have been tried

    // Loop through the tracklist until a track passes the specific rule or all tracks are exhausted
    while (!ruleMet && currIndex < tracklist.length) {
      const track = tracklist[currIndex];
      console.log(`🤞🤞🤞 Trying ${track.name} for ${ruleJustForLogging}. Tracklist length is ${tracklist.length}`);

      // Apply the specific rule to the current track
      const isSpecificRuleApplied = ruleFunction(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex);

      // Increment the count of tracks tried
      tracksTried++;

      // Check if the specific rule is met
      if (!isSpecificRuleApplied) {
        // Move to the next track in the tracklist
        console.log(`${ruleJustForLogging} WAS NOT MET, ITERATING INDEX - AM I STARTING AGAIN?`);

        currIndex++;
        continue; // Skip the rest of the loop and move to the next iteration
      }

      // Apply general rule functions for the track
      let generalRulesPassed = true;
      // Make sure you don't deal with previous tracks before you have them
      if (trackIndex > 2) {
        for (const generalRule of generalRuleFunctions) {
          console.log(`TRYING A RULE`);
          if (!generalRule(track, prevTrack1, prevTrack2, curatedTracklist, currIndex)) {
            console.log(`General rule failed for track: ${track.name}`);
            generalRulesPassed = false;
            break; // Stop checking other general rules
            console.log("I WONDER WHAT HAPPENS HERE?");
          }
        }
      }

      // Check if general rules are passed
      if (generalRulesPassed) {
        console.log(`ALL CONDITIONS HAVE BEEN MET (generalRulesPassed), WE'RE ADDING IT`);

        // All conditions met, add the track to curatedTracklist
        addNextValidTrack(track, curatedTracklist, tracklist);
        curatedTracklistTotalTimeInSecs = calculateOrUpdateCuratedTracklistDuration(track, curatedTracklist);
        console.log(`✅ Added Base Track for ${ruleJustForLogging}: ${track.name}`);

        // Update the previous tracks with the added track
        [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);

        ruleMet = true; // Mark that the current rule can be met
        trackIndex++; // Increment trackIndex to move to the next track in curatedTracklist
      } else {
        // The general rules were not met for this track, so the current rule cannot be met
        console.log(`Cannot meet Rule ${i + 60} for track: ${track.name}`);
        currIndex++; // Move to the next track in the tracklist
      }
    }


    // findme: I think I'm not actually checking r65 (for example)

    if (!ruleMet) {
      // Log an error message if the current rule cannot be met for any track
      console.log(`EgadsEgads!!! ❌ Rule ${i + 60} cannot be met for any track.`);
      // You can choose to handle this situation as needed
    }

    // Log the count of tracks tried for the current rule
    console.log(`I tried ${tracksTried}/${tracklist.length} tracks for Rule ${i + 60} `);
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Phase 2: Ensure rules and final check rules
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  console.log("PHASE 2 Ensure rules and final check rules");
  console.log("PHASE 2 Ensure rules and final check rules");
  console.log("PHASE 2 Ensure rules and final check rules");
  console.log("PHASE 2 Ensure rules and final check rules");
  console.log("PHASE 2 Ensure rules and final check rules");
  console.log("PHASE 2 Ensure rules and final check rules");

  // Flags to track successfully enforced ensure rules
  const ensureRulesEnforced = {};

  // Initialize ensure rules and set flags based on other functions
  function initializeEnsureRules() {
    const shuffledEnsureRules = shuffleArrayOfRules(unshuffledEnsureRules);

    shuffledEnsureRules.forEach((rule) => {
      const ruleNumber = parseInt(rule.name.match(/\d+/)[0]);
      ensureRulesEnforced[`r${ruleNumber}`] = false;
    });

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
        // Check if we've gone through the whole tracklist
        if (currIndex >= tracklist.length) {
            currIndex = 0;
            iterationCounter++;
        }

        // If not all ensure rules are enforced, try to apply them
        if (!checkAllEnsureRulesEnforced()) {
            const track = tracklist[currIndex];
            
            // Check if the track meets ensure rules and there's enough time left to add it
            if (ensureTrack(track, currIndex, ensureRules) && (MAX_PLAYLIST_DURATION_SECONDS - (curatedTracklistTotalTimeInSecs + track.duration) > 0)) {
                let allGeneralRulesPassed = true;

                // Check if the track passes all general rules
                for (const generalRule of generalRuleFunctions) {
                    if (!generalRule(track, prevTrack1, prevTrack2, curatedTracklist, currIndex)) {
                        allGeneralRulesPassed = false;
                        break; // Stop checking other general rules
                    }
                }

                // If all general rules are passed, add the track
                if (allGeneralRulesPassed) {
                    markEnsureRuleEnforced(track, currIndex); // Mark the ensure rule as enforced
                    addNextValidTrack(track, curatedTracklist, tracklist); // Add the track to the playlist
                    calculateOrUpdateCuratedTracklistDuration(track, curatedTracklist); // Update the total duration
                    console.log(`✅ Added Ensure Track! ${track.name}`);
                    console.log(`⏰ Playlist duration: ${curatedTracklistTotalTimeInSecs} seconds (${curatedTracklistTotalTimeInMins} minutes)`);
                    break; // Important to break here to avoid adding the same track repeatedly
                }
            }
        }

        currIndex++; // Move to the next track in the tracklist
    }
}

console.log("PHASE 3 Main general rules loop");
console.log("PHASE 3 Main general rules loop");
console.log("PHASE 3 Main general rules loop");
console.log("PHASE 3 Main general rules loop");
console.log("PHASE 3 Main general rules loop");
console.log("PHASE 3 Main general rules loop");

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

        console.log(`✅ Added General Track! ${track.name}`);

        addNextValidTrack(track, curatedTracklist, tracklist);
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

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX BEFORE THE RULES, WE SHUFFLE OUR TRACKLIST XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function shuffleTracklist(tracklist) {
  // Skip the first track (intro) and shuffle the rest of the tracks
  for (let i = tracklist.length - 1; i > 1; i--) {
    const j = Math.floor(Math.random() * (i - 1)) + 1; // Ensure j is at least 1
    [tracklist[i], tracklist[j]] = [tracklist[j], tracklist[i]];
  }
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

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX CHECK THOSE TRACKS!!!! XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

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

function checkPlaylistRules(playlist) {
  let prevTrack = null;
  const authorCounts = {};
  let hasAlbert = false;
  let hasPierreElliott = false;
  let hasInterview = false;
  let hasMusic = false;
  let geeseTracksCount = 0;  // Count of tracks with 'geese' tag


  for (let i = 0; i < playlist.length; i++) {
    const track = playlist[i];

    // Update flags when conditions are met
    if (track.author === "ALBERT") {
      hasAlbert = true;
    }
    if (track.author === "PIERREELLIOTT") {
      hasPierreElliott = true;
    }
    if (track.form === "interview") {
      hasInterview = true;
    }
    if (track.form === "music") {
      hasMusic = true;
    }
    if (track.tags && track.tags.includes("geese")) {
      geeseTracksCount++;
    }

    // Increment the count for the author
    authorCounts[track.author] = (authorCounts[track.author] || 0) + 1;

    // CHECK R61: The 0th track must have the tag 'intro'
    if (i === 0 && !track.tags.includes("intro")) {
      console.log(`❌❌❌ R61 violated at Track 1 (${track.name}) does not have the tag 'intro'. ${r61rule}`);
    }

    // CHECK R62: The 1st track must have the placement 'beginning'
    if (i === 1 && !track.placement.includes("beginning")) {
      console.log(`❌❌❌ R62 violated at Track 2 (${track.name}) does not have placement 'beginning'. ${r62rule}`);
    }

    // CHECK R63: The 2nd track must have placement 'beginning' and a different form than the 1st track
    if (i === 2 && (!track.placement.includes("beginning") || track.form === playlist[i - 1].form)) {
      console.log(`❌❌❌ R63 violated at Track 3 (${track.name}) does not meet the criteria of ${r63rule}`);
    }

    // CHECK R64: The 3rd track must have the placement 'middle' and a different form than the 2nd track
    if (i === 3 && (!track.placement.includes("middle") || track.form === playlist[i - 1].form)) {
      console.log(`❌❌❌ R64 violated at Track 4 (${track.name}) does not meet the criteria of ${r64rule}`);
    }

    // CHECK R65: The 4th track must have length 'short', placement 'middle', and a different language than the 3rd track
    if (i === 4 && (track.length !== "short" || !track.placement.includes("middle") || track.language === playlist[i - 1].language)) {
      console.log(`❌❌❌ R65 violated at Track 5 (${track.name}) does not meet the criteria of ${r65rule}`);
    }

    // CHECK R66: The 5th track must have placement 'middle' and a different form than the 4th track
    if (i === 5 && (!track.placement.includes("middle") || track.form === playlist[i - 1].form)) {
      console.log(`❌❌❌ R66 violated at Track 6 (${track.name}) does not meet the criteria of ${r66rule}`);
    }

    // CHECK R67: The 6th track must have placement 'middle' and a different form than the 5th track
    if (i === 6 && (!track.placement.includes("middle") || track.form === playlist[i - 1].form)) {
      console.log(`❌❌❌ R67 violated at Track 7 (${track.name}) does not meet the criteria of ${r67rule}`);
    }

    // CHECK R68: The 7th track must have placement 'middle' and a different form than the 6th track
    if (i === 7 && (!track.placement.includes("middle") || track.form === playlist[i - 1].form)) {
      console.log(`❌❌❌ R68 violated at Track 8 (${track.name}) does not meet the criteria of ${r68rule}`);
    }

    // CHECK R10: The current track must have a different author than the last track
    if (prevTrack && track.author === prevTrack.author) {
      console.log(`❌❌❌ R10 R11 violated! ${track.name} Same author as the previous track. does not meet the criteria of ${r10rule}`);
    }

    // CHECK R11: No more than two tracks from the same author in a tracklist
    if (authorCounts[track.author] > 2) {
      console.log(`❌❌❌ R11 violated! ${track.name} has more than two tracks, does not meet the criteria of ${r11rule}`);
    }

    // CHECK R12: Tracks with the form short and the language musical can never follow tracks with the form music.
    if (track.form === "short" && track.language === "musical" && prevTrack && prevTrack.form === "music") {
      console.log(`❌❌❌ R12 violated! (${track.name}): short (musical) followed by music, does not meet the criteria of ${r12rule}`);
    }

    // CHECK R13: Tracks with the form music can never follow tracks with both the form short and the language musical.
    if (track.form === "music" && prevTrack && prevTrack.form === "short" && prevTrack.language === "musical") {
      console.log(`❌❌❌ R13 violated! (${track.name}): Music followed by short (musical), does not meet the criteria of ${r13rule}`);
    }

    // CHECK R14: The value for backgroundMusic should never match the author of the track right before it, and the author of the track should never match the backgroundMusic of the track right before it.
    if (prevTrack && (track.backgroundMusic === prevTrack.author || track.author === prevTrack.backgroundMusic)) {
      console.log(`❌❌❌ R14 violated! (${track.name}): Author matches backgroundMusic. does not meet the criteria of ${r14rule}`);
    }

    // CHECK R15: If the previous track has the sentiment heavy, this track cannot have the the laughter tag.
    if (prevTrack && prevTrack.tags.includes("laughter") && track.tags.includes("heavy")) {
      console.log(`❌❌❌ R15 violated! (${track.name}): Laughter followed by heavy sentiment. does not meet the criteria of ${r15rule}`);
    }

    // CHECK R16: If the previous track has length long and form music, this track must have the form interview`;
    if (track.length === "long" && track.form === "music" && prevTrack && prevTrack.form !== "interview") {
      console.log(`❌❌❌ R16 violated! (${track.name}): Long music track not followed by an interview, does not meet the criteria of ${r16rule}`);
    }

    // CHECK R00: Last track must have the placement 'end'
    if (i === playlist.length - 1 && !track.placement.includes("end")) {
      console.log(`❌❌❌ R00 violated! (${track.name}): Last track does not have placement 'end', does not meet the criteria of ${r00rule}`);
    }

    prevTrack = track; // Set the current track as the previous track for the next iteration
  }

  // Check for c21, c22, c23, c24, c25 after iterating through the playlist
  if (!hasAlbert) {
    console.log("❌❌❌ Rule c21 violated: Playlist does not contain a track with the author ALBERT. does not meet the criteria");
  }
  if (!hasPierreElliott) {
    console.log("❌❌❌ Rule c22 violated: Playlist does not contain a track with the author PIERREELLIOTT. does not meet the criteria");
  }
  if (!hasInterview) {
    console.log("❌❌❌ Rule c23 violated: Playlist does not contain a track with the form interview. does not meet the criteria");
  }
  if (!hasMusic) {
    console.log("❌❌❌ Rule c24 violated: Playlist does not contain a track with the form music. does not meet the criteria");
  }
  // Check for geese after iterating through the playlist
  if (geeseTracksCount === 1) {
    console.log("❌❌❌ Rule c25 violated: Playlist contains exactly one track with the tag geese, which is not allowed.");
  } else if (geeseTracksCount === 0 || geeseTracksCount > 1) {
    console.log(`✅ Acceptable number of 'geese' tracks found: ${geeseTracksCount}.`);
  }
}

let firstPlay = true;
var playButtonTextContainer = document.getElementById("play-button-text-container");

const playingSVG = `<svg
    id="play-icon"
    class="svg-icon"
    role="img"
    viewBox="0 0 279 319"
    fill="none"
    aria-hidden="true"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M272.64 151.621C278.64 155.085 278.64 163.745 272.64 167.209L14.6396 316.166C8.63964 319.63 1.13965 315.3 1.13965 308.371L1.13966 10.4587C1.13966 3.53053 8.63966 -0.79959 14.6397 2.66451L272.64 151.621Z"
      fill="#224E43"
      stroke="#224E43"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round" />
  </svg>`; //
const pausedSVG = `<svg
    id="play-icon"
    class="svg-icon"
    role="img"
    viewBox="0 0 282 282" fill="none" 
    aria-hidden="true"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg">
    <rect x="0.416992" y="0.485352" width="281.424" height="281.424" rx="9" fill="#224E43"/>
  </svg>`;

// Text Constants
const playingText = "PLAY";
const pausedText = "PAUSE";

function toggleButtonVisuals(isPlaying) {
  // Set the left position of the button text container
  playButtonTextContainer.style.left = isPlaying ? "50%" : "35%";
  // Set the inner HTML of the SVG container based on whether it's playing or paused
  svgContainer.innerHTML = isPlaying ? pausedSVG : playingSVG;
  // Set the text content of the text container based on whether it's playing or paused
  textContainer.textContent = isPlaying ? "PAUSE" : "PLAY";
  // Toggle the playButton class to "playing" or "paused" based on the isPlaying state
  playButton.classList.toggle("playing", isPlaying);
  playButton.classList.toggle("paused", !isPlaying);
}

function prepareAudioContext() {
  if (audioContext == null) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    volumeNode = audioContext.createGain();
    volumeNode.connect(audioContext.destination);
  }
}

function prepareAndQueueTracks() {
  const allSongs = [...songs];
  const shuffledSongs = shuffleTracklist(allSongs);
  curatedTracklist = followTracklistRules(shuffledSongs);
  checkPlaylistRules(curatedTracklist);

  addOutrosAndCreditsToTracklist();
  createTranscriptContainer();
  printEntireTracklistDebug(curatedTracklist);

  window.caches.open("audio-pre-cache").then((cache) => queueNextTrack(curatedTracklist, 0, 0, cache));
  createTimerLoopAndUpdateProgressTimer();
}

function addOutrosAndCreditsToTracklist() {
  curatedTracklist.push(...outroAudioSounds.map(addAudioFromUrl));
  curatedTracklist.push(...gatherTheCreditSongs(curatedTracklist));
  curatedTracklist.push(...finalOutroAudioSounds.map(addAudioFromUrl));
}

function handlePlayPauseClick() {
  if (firstPlay) {
    // Handle the first play
    console.log("First play");
    toggleButtonVisuals(true); // Assume playing state on first play
    generatePlayer();
    prepareAudioContext();
    prepareAndQueueTracks();
    player.play();
    playerPlayState = "play";
    audioContext.resume();
    isValidTracklist(curatedTracklist);

    firstPlay = false; // Set firstPlay to false after handling the first play
  } else {
    // Handle subsequent toggles between play and pause
    if (playButton.classList.contains("playing")) {
      console.log("Pausing");
      toggleButtonVisuals(false); // Update visuals to reflect pause state
      player.pause();
      playerPlayState = "pause";
      audioContext.suspend();
    } else {
      console.log("Playing");
      toggleButtonVisuals(true); // Update visuals to reflect play state
      player.play();
      playerPlayState = "play";
      audioContext.resume();
    }
  }
}
