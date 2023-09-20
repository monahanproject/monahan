var myLang = localStorage["lang"] || "defaultValue";
var player;
var audioContext = null;
var volumeNode = null;
// var previousVolume = "100";
let playerPlayState = "play";
// let muteState = "unmute";
let hasSkippedToEnd = false;
let displayConsoleLog = "<br>";
let curatedTracklistTotalTime = 0;
let curatedTracklistTotalTimeInMins;

let curatedTracklist;
let timerDuration = 0;

const MAX_PLAYLIST_DURATION_SECONDS = 1140; //(19m)

var totalDurationSeconds = MAX_PLAYLIST_DURATION_SECONDS;
var elapsedDurationSeconds = 0;
var remainingDurationSeconds = totalDurationSeconds;
let currentTimeElement;
let timerInterval; // Declare timerInterval

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
  // wrapper div
  let wrapperDiv = document.createElement("div");
  wrapperDiv.id = "wrapper";
  musicPlayerDiv.append(wrapperDiv);

  // player div
  let audioPlayerContainer = document.createElement("div");
  audioPlayerContainer.id = "audio-player-container";
  wrapperDiv.append(audioPlayerContainer);

  // music player audio element
  let musicPlayer = document.createElement("audio");
  musicPlayer.id = "music_player";
  audioPlayerContainer.append(musicPlayer);

  // inputs
  let currTime = document.createElement("span");
  currTime.classList.add("time");
  currTime.id = "current-time";
  currTime.innerHTML = "0:00";
  audioPlayerContainer.append(currTime);

  // Create a container div for the buttons
  let buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");
  audioPlayerContainer.appendChild(buttonContainer);

  // Create skip backward button
  let skipBackwardButton = document.createElement("button");
  skipBackwardButton.classList.add("skip-button");
  skipBackwardButton.innerHTML = "<<20";
  buttonContainer.appendChild(skipBackwardButton);

  // Create play button and append it to the button container
  let playIconContainer = document.createElement("button");
  playIconContainer.id = "play-icon";
  playIconContainer.classList.add("play-icon");
  playIconContainer.classList.add("paused");
  buttonContainer.appendChild(playIconContainer); // Append to the button container

  playIconContainer.addEventListener("click", () => {
    if (playerPlayState === "play") {
      // Pause the audio and store the current time
      playIconContainer.classList.remove("paused");
      player.pause();
      timerDuration = Math.floor(player.currentTime);
      playerPlayState = "pause";
      audioContext.suspend();
      clearInterval(timerInterval);
    } else {
      // Check if we have a stored timerDuration (indicating a paused state)
      if (timerDuration > 0) {
        // Set the player's current time to the stored time
        player.currentTime = timerDuration;
      } else {
        // This is a new play, start from the beginning
        player.currentTime = 0;
      }

      // Play the audio and update the UI
      player.play();
      playIconContainer.classList.add("paused");
      playerPlayState = "play";
      audioContext.resume();
      timerInterval = createTimerLoopAndUpdateProgressTimer(timerDuration);
    }
  });

  let currentTrackIndex = 0;

  // Create skip forward button
  let skipForwardButton = document.createElement("button");
  skipForwardButton.classList.add("skip-button");
  skipForwardButton.innerHTML = "20>>";
  buttonContainer.appendChild(skipForwardButton);

  skipBackwardButton.addEventListener("click", () => {
    if (playerPlayState === "play") {
      let newTime = player.currentTime - 20;
      player.currentTime = Math.max(newTime, 0);
      // Directly update the timer display based on the new time
      updateProgressTimer(Math.floor(newTime), timerDuration);
    }
  });

  skipForwardButton.addEventListener("click", () => {
    // console.log(`skip forward button - pressed`);
    if (playerPlayState === "play") {
      // console.log(`skip forward button - playerstate is play`);
      let newTime = player.currentTime + 20;
      newTime = Math.min(newTime, totalDurationSeconds); //findmee
      // Directly update the timer display based on the new time
      updateProgressTimer(Math.floor(newTime), timerDuration);
      player.currentTime = newTime;
    }
  });

  let volumeSlider = document.createElement("input");
  volumeSlider.type = "range";
  volumeSlider.id = "volume-slider";
  volumeSlider.max = "100";
  volumeSlider.min = "0";
  volumeSlider.value = "100";
  audioPlayerContainer.append(volumeSlider);
  volumeSlider.addEventListener("change", (event) => {
    volumeNode.gain.value = getCurrentSliderVolume();
  });

  function getCurrentSliderVolume() {
    let value = volumeSlider.value;
    return parseFloat(value) / 100;
  }

  // Create a div for the currently playing track name
  let trackNameContainer = document.createElement("div");
  trackNameContainer.id = "playerTrackNameContainer";
  audioPlayerContainer.appendChild(trackNameContainer);

  // Create an element (e.g., a <p> element) to display the track name
  let trackNameElement = document.createElement("p");
  trackNameElement.id = "playerTrackName";
  trackNameElement.innerText = ""; // Replace with the actual track name
  trackNameContainer.appendChild(trackNameElement);

  let exitBtn = document.createElement("button");
  exitBtn.innerHTML = "exit";
  // exitBtn.type = "submit";
  exitBtn.name = "exitBtn";
  exitBtn.id = "exitBtn";
  exitBtn.classList.add("btn");
  musicPlayerDiv.appendChild(exitBtn);

  exitBtn.addEventListener("click", (event) => {
    audioContext.suspend();
    clearInterval(timerInterval);

    musicPlayerh1.innerHTML = "";
    document.getElementById("wrapper").remove();
    document.getElementById("exitBtn").remove();

    let beginAgainBtn = document.createElement("button");
    beginAgainBtn.innerHTML = "Begin again";
    beginAgainBtn.name = "beginAgainBtn";
    beginAgainBtn.classList.add("beginAgainBtn");
    musicPlayerDiv.appendChild(beginAgainBtn);

    beginAgainBtn.addEventListener("click", (event) => {
      window.location.href = "monahan.html";
    });
  });

  startplayer();
  let timerDuration = 0; // Declare timerDuration as a local variable
  // timerInterval = createTimerLoopAndUpdateProgressTimer(timerDuration);

  timerInterval = createTimerLoopAndUpdateProgressTimer(0);
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXX  TIMER  XXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function updateProgressTimer(elapsedSeconds, previousDuration) {
  currentTimeElement = document.getElementById("current-time");
  if (!currentTimeElement) {
    throw new Error("Missing element: current-time");
  }
  totalDurationSeconds = curatedTracklistTotalTime;

  const remainingDurationSeconds = totalDurationSeconds - (elapsedSeconds + previousDuration);

  // Determine the timer display based on remaining time
  const { minutes, seconds } = calculateMinutesAndSeconds(remainingDurationSeconds);
  updateTimeDisplay(minutes, seconds);
}

function handleTimerCompletion() {
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
  currentTimeElement.innerHTML = `${minutes}:${seconds}`;
}

function calculateRemainingTime(elapsedSeconds) {
  return totalDurationSeconds - elapsedSeconds;
}

function createTimerLoopAndUpdateProgressTimer() {
  var start = Date.now(); // Record the start time of the loop

  // Set up an interval to run the loop every 200 milliseconds
  // In the callback function, calculate the elapsed time in milliseconds since the start of the loop.
  return setInterval(() => {
    let delta = Date.now() - start; // Calculate elapsed milliseconds
    let deltaSeconds = Math.floor(delta / 1000); // Convert milliseconds to seconds

    // Directly update the timer display based on the audio player's current time
    updateProgressTimer(Math.floor(player.currentTime), timerDuration);

    // Calculate remaining time using the calculateRemainingTime function
    remainingTime = calculateRemainingTime(deltaSeconds);
  }, 200); // Run the loop every 200 milliseconds
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXX LOADING GIF  XXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function displayLoadingGif() {
  let musicPlayerDiv = document.getElementById("musicPlayerDiv");
  let musicPlayerh1 = document.getElementById("musicPlayerH1");
  // need language logic here
  musicPlayerh1.innerHTML = "Generating beautiful sounds for you, this might take a minute";
  document.getElementById("launchMusicPlayerForm").remove();
  // document.getElementById("textTranscript").remove();
  // temp loader content
  let loaderDiv = document.createElement("div");
  loaderDiv.classList.add("loader");
  musicPlayerDiv.append(loaderDiv);
  setTimeout(() => {
    loaderDiv.remove();
    musicPlayerh1.innerHTML = "";
    createHTMLMusicPlayer(musicPlayerDiv, musicPlayerh1);
  }, 50);
}

function createAudioElement(url) {
  const audio = new Audio();
  audio.preload = "none";
  audio.src = url;
  audio.controls = false;
  return audio;
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
// Set up event listener for when the outro audio ends
// outroAudio1.addEventListener("ended", () => {
// This recursive function processes each audio file at a time and then queues up
// work for the next audio file to be processed.

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

  // const currCreditStackHTMLElement = document.getElementById("creditStackHTML");
  // currCreditStackHTMLElement.innerHTML = creditsLog;

  // console.log(arrayOfCreditSongs);
  return arrayOfCreditSongs;
}
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  ~~~~~~ transcript CREATION ~~~~~~~
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
let transcript = ''; // Global variable to store the transcript
let language = 'english'; // Global variable to set the language with English as the default
let transcriptVisible = false; // Flag to track if transcript is visible

// Function to process text segments and apply styles
function processTextSegment(segment) {
  let text = segment.text;

  // Check if the segment should be bold
  if (segment.bold) {
    text = `<strong>${text}</strong>`;
  }

  // Check for other styling conditions and apply them as needed
  // You can add more conditions here based on your requirements

  return text;
}

// Function to update the transcript based on the selected language
// Function to update the transcript based on the selected language
function updateTranscript() {
  const transcriptContainer = document.getElementById("transcriptContent");
  transcriptContainer.innerHTML = ''; // Clear previous content
  for (let index = 0; index < curatedTracklist.length; index++) {
    const song = curatedTracklist[index];

    // Check if the language is English and if "engTrans" exists and is not empty
    if (language === 'english' && song.engTrans && song.engTrans.trim() !== "") {
      const engTranscript = song.engTrans;

      // Create a new paragraph element to hold the HTML content
      const paragraph = document.createElement("p");
      paragraph.innerHTML = engTranscript;

      // Append the paragraph to the transcript container
      transcriptContainer.appendChild(paragraph);
    }

    // Add logic for other languages if needed
  }
}


// Function to create and toggle the transcript button
function createAndToggleTranscriptButton() {
  const transcriptButton = document.createElement("button");
  transcriptButton.textContent = "Show Transcript";
  transcriptButton.id = "transcriptButton"; // Assign an ID for styling
  document.body.appendChild(transcriptButton);

  transcriptButton.addEventListener("click", function () {
    if (transcriptVisible) {
      transcriptContent.style.display = "none";
      transcriptButton.textContent = "Show Transcript";
    } else {
      updateTranscript();
      transcriptContent.textContent = transcript;
      transcriptContent.style.display = "block";
      transcriptButton.textContent = "Hide Transcript";
    }
    transcriptVisible = !transcriptVisible; // Toggle the flag
  });
}

// Create a "transcriptContent" element
const transcriptContent = document.createElement("div");
transcriptContent.id = "transcriptContent"; // Assign the "id" attribute
transcriptContent.style.display = "none"; // Initially hide the transcript
document.body.appendChild(transcriptContent);


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
  if (trackIndex === 0 && !track.tags.includes("intro")) {
    const logMessage = `❌ (${track.name}): The 1st track must have the tag intro (track's tags are ${track.tags})`;
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
  if (trackIndex === 1 && !track.placement.includes("beginning")) {
    const logMessage = `❌ (${track.name}): The 2nd track must have the placement beginning (track's placement is ${track.placement})`;
    logRuleApplication(62, logMessage, false);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `  ✅! (${track.name}): The 2nd track must have the placement beginning (track's placement is ${track.placement})`;
  logRuleApplication(62, logMessage, true);
  return true;
}

// Rule 63: Rule 3 (only for Track 3): The 3rd track must have the placement beginning and a different form than the 2nd track.
function r63(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if ((trackIndex === 2 && !track.placement.includes("beginning")) || (trackIndex === 2 && track.form === prevTrack1.form)) {
    const logMessage = `❌ (${track.name}): The 3rd track must have the placement beginning (track's placement is ${track.placement}) and a different form (track's form is ${track.form}) than the 2nd track (the 2nd track's form is ${prevTrack1.form})`;
    logRuleApplication(63, logMessage, false);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `  ✅! (${track.name}): The 3rd track must have the placement beginning (track's placement is ${track.placement}) and a different form (track's form is ${track.form}) than the 2nd track (the 2nd track's form is ${prevTrack1.form})`;
  logRuleApplication(63, logMessage, true);
  return true;
}
// Rule 64: Rule 4 (only for Track 4): The 4th track must have the placement middle and a different form than the 3rd track.
function r64(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if ((trackIndex === 3 && !track.placement.includes("middle")) || (trackIndex === 3 && track.form === prevTrack1.form)) {
    const logMessage = `❌ (${track.name}): The 4th track must have the placement middle (track's placement is ${track.placement}); and a different form (track's form is ${track.form}); than the 3rd track (the 3rd track's form is ${prevTrack1.form})`;
    logRuleApplication(64, logMessage, false);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `  ✅! (${track.name}): The 4th track must have the placement middle (track's placement is ${track.placement}); and a different form (track's form is ${track.form}); than the 3rd track (the 3rd track's form is ${prevTrack1.form})`;
  logRuleApplication(64, logMessage, true);
  return true;
}

// Rule 65: Rule 5 (only for Track 5): The 5th track must have the form 'short'; must have the placement 'middle'; and have a different language than the 4th track.
function r65(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 4) {
    if (track.form !== "short" || !track.placement.includes("middle") || track.language === prevTrack1.language) {
      const logMessage = `❌ (${track.name}): The 5th track must have the form short (track's form is ${track.form}); must have the placement MIDDLE (track's placement is ${track.placement}); and a different language (track's language is ${track.language}) from the 4th track (the 4th track's language is ${prevTrack1.language})`;
      logRuleApplication(65, logMessage, false);
      return false;
    }
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `  ✅! (${track.name}): The 5th track must have the form short (track's form is ${track.form}); must have the placement MIDDLE (track's placement is ${track.placement}); and a different language (track's language is ${track.language}) from the 4th track (the 4th track's language is ${prevTrack1.language})`;
  logRuleApplication(65, logMessage, true);
  return true;
}

// Rule 66: Rule 6 (only for Track 6): The 6th track must have the placement 'middle' and a different form than the 5th track.
function r66(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 5) {
    if (!track.placement.includes("middle")) {
      const logMessage = `❌ (${track.name}): The 6th track has the placement MIDDLE (track's placement is ${track.placement}); and has a different form (track's form is ${track.form}) vs the 5th track (the 5th's track's form is ${prevTrack1.form})`;
      logRuleApplication(66, logMessage, false);
      return false;
    }
    if (track.form === prevTrack1.form) {
      const logMessage = `❌ (${track.name}): The 6th track has the placement MIDDLE (track's placement is ${track.placement}); and has a different form (track's form is ${track.form}) vs the 5th track (the 5th's track's form is ${prevTrack1.form})`;
      logRuleApplication(66, logMessage, false);
      return false;
    }
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `  ✅! (${track.name}): The 6th track has the placement MIDDLE (track's placement is ${track.placement}); and has a different form (track's form is ${track.form}) vs the 5th track (the 5th track's form is ${prevTrack1.form})`;
  logRuleApplication(66, logMessage, true);
  return true;
}

// Rule 67: Rule 7 (only for Track 7): The 7th track must have the placement 'middle', a different form than the 6th track, and unless the form of the 7th track is 'MUSIC', it must also have a different language from the 6th track.
function r67(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 6) {
    if (!track.placement.includes("middle") || track.form === prevTrack1.form || (track.form !== "MUSIC" && track.language === prevTrack1.language)) {
      const logMessage = `❌ (${track.name}): The 7th track must have the placement MIDDLE (track's placement is ${track.placement}) and has a different form (track's form is ${track.form}) vs the 6th track (the 6th track's form is ${prevTrack1.form}); AND unless the form of the 7th track is MUSIC (the 7th track's form is ${track.form}), the 7th track also has a different language (the 7th track's language is ${track.language}) from the 6th track (the 6th track's language is ${prevTrack1.language})`;
      logRuleApplication(67, logMessage, false);
      return false;
    }
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `  ✅! (${track.name}): The 7th track must have the placement MIDDLE (track's placement is ${track.placement}) and has a different form (track's form is ${track.form}) vs the 6th track (the 6th track's form is ${prevTrack1.form}); AND unless the form of the 7th track is MUSIC (the 7th track's form is ${track.form}), the 7th track also has a different language (the 7th track's language is ${track.language}) from the 6th track (the 6th track's language is ${prevTrack1.language})`;
  logRuleApplication(67, logMessage, true);
  return true;
}

// Rule 68: Rule 8 (only for Track 8): The 8th track must have the placement 'middle', a different form than the 6th and 7th tracks, and a different language than the 6th and 7th tracks.
function r68(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 7) {
    if (!track.placement.includes("middle")) {
      const logMessage = `❌ (${track.name}): The 8th track must have the placement MIDDLE (track's placement is ${track.placement}); and a different form (track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}); and has a different language (track's language is ${track.language}) vs the 7th track (the 7th track's language is ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;
      logRuleApplication(68, logMessage, false);
      return false;
    }
    if (track.form === prevTrack1.form || track.form === prevTrack2.form) {
      const logMessage = `❌ (${track.name}): The 8th track must have the placement MIDDLE (track's placement is ${track.placement}); and a different form (track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}); and has a different language (track's language is ${track.language}) vs the 7th track (the 7th track's language is ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;
      logRuleApplication(68, logMessage, false);
      return false;
    }
    if (track.language === prevTrack1.language || track.language === prevTrack2.language) {
      const logMessage = `❌ (${track.name}): The 8th track must have the placement MIDDLE (track's placement is ${track.placement}); and a different form (track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}) and has a different language (track's language ${track.language}) vs the 7th track (the 7th track's language ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;
      logRuleApplication(68, logMessage, false);
      return false;
    }
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `  ✅! (${track.name}): The 8th track must have the placement MIDDLE (track's placement is ${track.placement}); and a different form (track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}) and has a different language (track's language ${track.language}) vs the 7th track (the 7th track's language ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;
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
  const trackHasGeeseTag = track.tags.includes("geese");
  // const prevTrack1HasGeeseTag = prevTrack1 && prevTrack1.tags.includes("geese");
  const curatedTracklistAlreadyHasGeeseTag = trackExistsWithAttributes(curatedTracklist, "tags", "geese");

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
  if (curatedTracklistTotalTime === 0) {
    for (const track of curatedTracklist) {
      console.log("ttt track name is " + track.name);
      console.log("ttt track time is " + (track.duration || 0)); // Use 0 if duration is undefined or null
      curatedTracklistTotalTime += track.duration || 0;
    }
  } else if (track) {
    // console.log("curatedTracklistTotalTime is " + curatedTracklistTotalTime);
    curatedTracklistTotalTime += track.duration || 0;
  }

  curatedTracklistTotalTimeInMins = Math.floor(curatedTracklistTotalTime / 60);

  return curatedTracklistTotalTime;
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
  addToLogDisplay(`Rule ${ruleNumber} ${ruleStatus}: ${description}`);

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
        curatedTracklistTotalTime = calculateOrUpdateCuratedTracklistDuration(track, curatedTracklist);
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
        console.log(`🦆! Ensure rules enforced? If I have 1 geese the r25 flag is false, hopefully by default ${JSON.stringify(ensureRulesEnforced)}`);
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

    while (curatedTracklistTotalTime <= MAX_PLAYLIST_DURATION_SECONDS && !checkAllEnsureRulesEnforced() && iterationCounter < 3) {
      if (currIndex >= tracklist.length) {
        currIndex = 0;
        iterationCounter++;
      }

      if (!checkAllEnsureRulesEnforced()) {
        const track = tracklist[currIndex];
        if (ensureTrack(track, currIndex, ensureRules) && ensureGeneralRules(track, currIndex)) {
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
          console.log(`⏰ Playlist duration: ${curatedTracklistTotalTime} seconds (${curatedTracklistTotalTimeInMins} minutes)`);
        }
        currIndex++;
      }
    }
  }

  // Main general rules loop
  function followGeneralRulesLoop() {
    while (curatedTracklistTotalTime <= MAX_PLAYLIST_DURATION_SECONDS) {
      if (currIndex >= tracklist.length) {
        currIndex = 0;
      }
      const track = tracklist[currIndex];
      if (ensureGeneralRules(track, currIndex)) {
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
        console.log(`⏰ Playlist duration: ${curatedTracklistTotalTime} seconds (${curatedTracklistTotalTimeInMins} minutes)`);
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
    try {
      const response = await fetch(track.url);
      if (response.status !== 200) {
        // The URL is not valid
        invalidTracks.push(track.url); // Add the invalid URL to the array
      }
    } catch (error) {
      // There was an error fetching the URL
      invalidTracks.push(track.url); // Add the invalid URL to the array
    }
  }

  if (invalidTracks.length > 0) {
    console.log("Invalid track URLs:");
    console.log(invalidTracks);
  } else {
    console.log("All track URLs are valid.");
  }

  // Return true if there are no invalid tracks
  return invalidTracks.length === 0;
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
    const totalDurr = Math.floor(curatedTracklistTotalTime / 60);
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

function queueNextTrack(songs, index, currentRuntime, cache) {
  const song = songs[index]; // get the song object
  const audio = song.audio;
  player = audio; // Update player to current audio
  // hopefully tell the browser to start downloading audio
  if (audio) {
    audio.preload = "auto";
  }

  const track = audioContext.createMediaElementSource(audio);
  track.connect(volumeNode);

  // when the song has ended, queue up the next one
  audio.addEventListener("ended", (e) => {
    const duration = audio.duration;
    queueNextTrack(songs, index + 1, currentRuntime + duration, cache);
  });

  // set a timer to preload the next file
  const timeoutDurationMs = (song.duration - PREFETCH_BUFFER_SECONDS) * 1000;
  setTimeout(() => {
    const nextAudio = songs[index + 1];
    nextAudio.preload = "auto";
    fetchAndCacheAudio(nextAudio.url, cache).then((p) => console.log(`loaded ${nextAudio.url} into cache`));
  }, timeoutDurationMs);
  gatherAndPrintDebugInfo(song, index); // print all the debug info to screen

  // timerInterval = createTimerLoopAndUpdateProgressTimer(curatedTracklistTotalTime);
  // updateProgressTimer(Math.floor(player.currentTime), curatedTracklistTotalTime);

  audio.play();
}

const button = document.getElementById("play");
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
button.addEventListener("click", (event) => {
  displayLoadingGif();

  if (audioContext == null) {
    // for browser compatibility, redefine AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    volumeNode = audioContext.createGain();
    volumeNode.connect(audioContext.destination);
  }

  const allSongs = [...songs]; // first we copy the array of songs
  const checkValidityOfURLS = isValidTracklist(allSongs); //

  const shuffledSongs = shuffleTracklist(allSongs); // next we shuffle it

  curatedTracklist = followTracklistRules(shuffledSongs); // next we apply the rules and get our new curated tracklist

  const outro1 = outroAudioSounds.map(addAudioFromUrl);
  curatedTracklist.push(...outro1);

  let creditsTracklist = gatherTheCreditSongs(curatedTracklist);

  curatedTracklist.push(...creditsTracklist);

  const outro2 = finalOutroAudioSounds.map(addAudioFromUrl);
  curatedTracklist.push(...outro2);

  // Calculate curatedTracklistTotalTime - is this necessary?
  // calculateOrUpdateCuratedTracklistDuration(
  //   curatedTracklist[0],
  //   curatedTracklist
  // ); //new

  // console.log(`curatedTracklistTotalTime is ${curatedTracklistTotalTime}`); //new
  // timerDuration = curatedTracklistTotalTime; //new

  // updateProgressTimer(0, timerDuration);

  // findme

  printEntireTracklistDebug(curatedTracklist);
  createAndToggleTranscriptButton();


  window.caches.open("audio-pre-cache").then((cache) => queueNextTrack(curatedTracklist, 0, 0, cache));
});
