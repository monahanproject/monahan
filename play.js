// I still don't have a track with the tag "end"

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
let curatedTracklist;
let timerDuration = 0;

const MAX_PLAYLIST_DURATION_SECONDS = 3140; //(19m)

// const MAX_PLAYLIST_DURATION_SECONDS = 1140; //(19m)

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
    if (playerPlayState === "play") {
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
  trackNameElement.innerText = "Currently Playing: Your Track Name"; // Replace with the actual track name
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

// const { minutes, seconds } = calculateMinutesAndSeconds(
//   curatedTracklistTotalTime
// );
// updateTimeDisplay(minutes, seconds);

function updateProgressTimer(elapsedSeconds, previousDuration) {
  // Get the HTML element for displaying the current time
  currentTimeElement = document.getElementById("current-time");
  // console.log(`current time element ${currentTimeElement}`);

  if (!currentTimeElement) {
    throw new Error("Missing element: current-time");
  }
  totalDurationSeconds = curatedTracklistTotalTime;

  const remainingDurationSeconds =
    totalDurationSeconds - (elapsedSeconds + previousDuration);

  // Determine the timer display based on remaining time
  const { minutes, seconds } = calculateMinutesAndSeconds(
    remainingDurationSeconds
  );
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
  // console.log(`currentTimeElement 1 is ${currentTimeElement}`);
  currentTimeElement = document.getElementById("current-time");
  // console.log(`currentTimeElement 2 is ${currentTimeElement}`);
  currentTimeElement.innerHTML = `${minutes}:${seconds}`;
}

// findme
// const { minutes, seconds } = calculateMinutesAndSeconds(
//   curatedTracklistTotalTime
// );
// updateTimeDisplay(minutes, seconds);

// Calculate the remaining time
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
  musicPlayerh1.innerHTML =
    "Generating beautiful sounds for you, this might take a minute";
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
//  XXXXXXX CREATE EACH SONG!  XXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* Takes a song object as input, create an audio element for the song's URL, 
assignS it to the song.audio property, and returns the modified song object.*/

const addAudioFromUrl = (song) => {
  song.audio = createAudioElement(song.url);
  return song;
};

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX CREATE OUTRO AUDIO!  XXXXXX
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
//  XXXXX GET OUR SONGS & TURN THEM INTO SONG OBJECTS!  XXXXXX
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

    // console.log(song.url);
    const songTitles = arrayOfCreditSongs.map((song) => song.credit).join(", ");
    // console.log("song credits are " + songTitles);

    if (song.credit == "") {
      // console.log("song has no credit");
    } else if (
      trackExistsWithAttributes(arrayOfCreditSongs, "url", song.credit)
    ) {
      // console.log("already got this credit " + song.credit);
    } else {
      addToCreditsLog(song.credit);
      createCreditObjectAndAddToArray(song);
      // console.log("credit being added " + song.credit);
    }
  }

  const currCreditStackHTMLElement = document.getElementById("creditStackHTML");
  currCreditStackHTMLElement.innerHTML = creditsLog;

  // console.log(arrayOfCreditSongs);
  return arrayOfCreditSongs;
}

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  ~~~~~~ TRACKLIST CREATION ~~~~~~~
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX GENERAL RULES XXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// Rule 10: The current track should have a different author than the last track
function r10(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  if (prevTrack1 && track.author === prevTrack1.author) {
    // If the current track has the same author as the previous track, log a rule violation
    const logMessage = `❌ ${track.name}: Rule enforced! The current track has the same author(${track.author}) as the previous track (${prevTrack1.author})`;
    logRuleApplication(10, logMessage, false);
    return false;
  }
  // If the current track has a different author than the previous track, log successful rule application
  const logMessage = `🌱 ${track.name}: Track passes this rule: The current track has a different author (${track.author}) than the previous track (${prevTrack1.author})`;
  logRuleApplication(10, logMessage, true);
  return true;
}
// Rule 11: No more than one track from the same author in a tracklist unless it is charlotte
function r11(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  // Check if the author is CHARLOTTE
  if (track.author === "CHARLOTTE") {
    // Count the number of tracks from CHARLOTTE in the curatedTracklist
    const charlotteCount = curatedTracklist
      .filter((t) => t.author.trim() !== "") // Filter out tracks with no author
      .filter((t) => t.author === "CHARLOTTE").length;

    if (charlotteCount >= 2) {
      // If there are already 2 tracks from CHARLOTTE, log a rule violation
      const logMessage = `❌ ${track.name}: Rule enforced! No more than two tracks from author CHARLOTTE.`;
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
      const logMessage = `❌ ${track.name}: Rule enforced! No more than one track from the same author (this track's author is ${track.author}). Violating tracks are: ${violatingTracks}`;
      logRuleApplication(11, logMessage, false);
      return false;
    }
  }

  // If the condition is met (no rule violation), log successful rule application
  const logMessage = `🌱! ${track.name}: Track passes this rule.`;
  logRuleApplication(11, logMessage, true);
  return true;
}
// Rule 12: Tracks with the form shorts and the language musical can never follow tracks with the form music.
function r12(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  console.log(`my track is ${track.name}`);
  if (
    track.form === "shorts" &&
    track.language === "musical" &&
    prevTrack1.form === "music"
  ) {
    const logMessage = `❌ ${track.name}: Rule enforced! Tracks with form 'shorts' (this track's form is ${track.form}) and language 'musical' (this track's language is ${track.language}) cannot follow tracks with form 'music' (last track's form is ${prevTrack1.form})`;
    logRuleApplication(12, logMessage, false);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = `🌱! ${track.name}): Track passes this rule: Tracks with form 'shorts' and language 'musical' (this track's form is ${track.form}) and language (this track's language is ${track.language}) cannot follow tracks with form 'music' (last track's form is ${prevTrack1.form})`;
  logRuleApplication(12, logMessage, true);
  return true;
}
// Rule 13: Tracks with the form music can never follow tracks with both the form shorts and the language musical.
function r13(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  if (
    track.form === "music" &&
    curatedTracklist.some(
      (prevTrack) =>
        prevTrack.form === "shorts" && prevTrack.language === "musical"
    )
  ) {
    const logMessage = `❌ ${track.name}: Rule enforced! Tracks with form 'music' (this track's form ${track.form}) cannot follow tracks with form 'shorts' and language 'musical' (last track's form was ${prevTrack1.form} and language was ${prevTrack1.language})`;
    logRuleApplication(13, logMessage, false);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = `🌱! ${track.name}: Track passes this rule: Tracks with form 'music' (this track's form ${track.form}) cannot follow tracks with form 'shorts' and language 'musical' (last track's form was ${prevTrack1.form} and language was ${prevTrack1.language})`;
  logRuleApplication(13, logMessage, true);
  return true;
}
// Rule 14: The value for backgroundMusic should never match the author of the track right before it, and the author of the track should never match the backgroundMusic of the track right before it.
function r14(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  if (
    prevTrack1 &&
    prevTrack1.author.trim() !== "" &&
    track.backgroundMusic.trim() !== "" &&
    (track.backgroundMusic === prevTrack1.author ||
      track.author === prevTrack1.backgroundMusic)
  ) {
    const logMessage = `❌ ${track.name}: Rule enforced! The value for backgroundMusic (this track's background Music is '${track.backgroundMusic}') should never match the author of the track before (last track's author is '${prevTrack1.author}') or the backgroundMusic of the track before (last track's backgroundMusic is ${prevTrack1.backgroundMusic})`;
    logRuleApplication(14, logMessage, false);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = `🌱! ${track.name}: Track passes this rule: The value for backgroundMusic (this track's  background Music is '${track.backgroundMusic}') should never match the author of the track before (last track's author is '${prevTrack1.author}') or the backgroundMusic of the track before (last track's backgroundMusic is ${prevTrack1.backgroundMusic})`;
  logRuleApplication(14, logMessage, true);
  return true;
}
// Rule 15: If a track has the sentiment heavy, then the track after it cannot have the laughter tag.
function r15(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  if (
    track.tags.includes("laughter") &&
    track &&
    prevTrack1.sentiment === "" &&
    prevTrack1.sentiment === "heavy"
  ) {
    const logMessage = `❌ ${track.name}: Rule enforced! If the previous track has the sentiment heavy (previous track's sentiment is ${prevTrack1.sentiment}), this track cannot have the laughter tag (this track's tags are ${track.tags})`;
    logRuleApplication(15, logMessage, false);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = `🌱! ${track.name}: Track passes this rule: if the previous track has the sentiment heavy (previous track's sentiment is ${prevTrack1.sentiment}), this track cannot have the laughter tag (this track's tags are ${track.tags})`;
  logRuleApplication(15, logMessage, true);
  return true;
}
// Rule 16: If this track has the length long and the form typeMusic, then the next track should have the
// form typeInterview.
function r16(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  if (
    prevTrack1 &&
    prevTrack1.length === "long" &&
    prevTrack1.form === "music" &&
    track.form !== "interview"
  ) {
    const logMessage = `❌ ${track.name}: Rule enforced! If the previous track has length 'long' (last track's length is ${prevTrack1.length}) and form 'music' (last track's form is ${prevTrack1.form}), this track should have the form 'interview' (this track's form is ${track.form})`;
    logRuleApplication(16, logMessage, false);
    return false; // Return false to indicate the rule is broken.
  }

  // If the rule is not violated, return true to indicate that the rule is followed.
  const logMessage = `🌱! ${track.name}: Track passes this rule: If the previous track has length 'long' (last track's length is ${prevTrack1.length}) and form 'music' (last track's form is ${prevTrack1.form}), this track should have the form 'interview' (this track's form is ${track.form})`;
  logRuleApplication(16, logMessage, true);
  return true;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX BASE TRACK RULES (TRACKS 1-8) XXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// Rule 60: Rule 0 (only for Track 0): The Oth track must have the tag 'intro'.
function r60(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 0 && !track.placement.includes("end")) {
    const logMessage = `❌ ${track.name}: End Rule: Last track must include the placement "end" (placement ${track.placement})`;
    logRuleApplication(60, logMessage, false);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `🌻 ${track.name}: Found valid track. The 0th (eventually final) track includes the placement "end" (placement ${track.placement})`;
  logRuleApplication(60, logMessage, true);
  return true;
}

// Rule 61: Rule 1 (only for Track 1): The 1st track must have the tag 'intro'.
function r61(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 0 && !track.tags.includes("intro")) {
    const logMessage = `❌ (${track.name}): The 1st track → has the tag intro. (This track's tags are ${track.tags})`;
    logRuleApplication(61, logMessage, false);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `🌻! (${track.name}): Found valid track. The 1st track → has the tag intro. (This track's tags are ${track.tags})`;
  logRuleApplication(61, logMessage, true);
  return true;
}
// Rule 62: Rule 2 (only for Track 2):The 2nd track should have the placement 'beginning'.
function r62(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 1 && !track.placement.includes("beginning")) {
    const logMessage = `❌ (${track.name}): The 2nd track → has the placement beginning. (This track's placement is ${track.placement})`;
    logRuleApplication(62, logMessage, false);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `🌻! (${track.name}): Passed this base track rule! The 2nd track → has the placement beginning. (This track's placement is ${track.placement})`;
  logRuleApplication(62, logMessage, true);
  return true;
}

// Rule 63: Rule 3 (only for Track 3): The 3rd track should have the placement 'beginning' and a different form than the 2nd track.
function r63(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (
    (trackIndex === 2 && !track.placement.includes("beginning")) ||
    (trackIndex === 2 && track.form === prevTrack1.form)
  ) {
    const logMessage = `❌ (${track.name}): The 3rd track → has the placement beginning (this track's placement is ${track.placement}) and a different form (this track's form is ${track.form}) than the 2nd track (the 2nd track's form is ${prevTrack1.form})`;
    logRuleApplication(63, logMessage, false);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `🌻! (${track.name}): Passed this base track rule! The 3rd track → has the placement beginning (this track's placement is ${track.placement}) and a different form (this track's form is ${track.form}) than the 2nd track (the 2nd track's form is ${prevTrack1.form})`;
  logRuleApplication(63, logMessage, true);
  return true;
}
// Rule 64: Rule 4 (only for Track 4): The 4th track should have the placement 'middle' and a different form than the 3rd track.
function r64(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (
    (trackIndex === 3 && !track.placement.includes("middle")) ||
    (trackIndex === 3 && track.form === prevTrack1.form)
  ) {
    const logMessage = `❌ (${track.name}): The 4th track → has the placement middle (this track's placement is ${track.placement}); and a different form (this track's form is ${track.form}); than the 3rd track (the 3rd track's form is ${prevTrack1.form})`;
    logRuleApplication(64, logMessage, false);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `🌻! (${track.name}): Passed this base track rule! The 4th track → has the placement middle (this track's placement is ${track.placement}); and a different form (this track's form is ${track.form}); than the 3rd track (${prevTrack1.form})`;
  logRuleApplication(64, logMessage, true);
  return true;
}

// Rule 65: Rule 5 (only for Track 5): The 5th track should have the form 'short'; should have the placement 'middle'; and have a different language than the 4th track.
function r65(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 4) {
    if (
      track.form !== "short" ||
      !track.placement.includes("middle") ||
      track.language === prevTrack1.language
    ) {
      const logMessage = `❌ (${track.name}): The 5th track → should have the form short (this track's form is ${track.form}); should have the placement MIDDLE (this track's placement is ${track.placement}); and a different language (this track's language is ${track.language}) from the 4th track (the 4th track's language is ${prevTrack1.language})`;
      logRuleApplication(65, logMessage, false);
      return false;
    }
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `🌻! (${track.name}): Passed this base track rule! The 5th track → has the form "short" (this track's form is ${track.form}); should have the placement MIDDLE (this track's placement is ${track.placement}); and a different language (this track's language is ${track.language}) from the 4th track (the 4th track's language is ${prevTrack1.language})`;
  logRuleApplication(65, logMessage, true);
  return true;
}

// Rule 66: Rule 6 (only for Track 6): The 6th track should have the placement 'middle' and a different form than the 5th track.
function r66(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 5) {
    if (!track.placement.includes("middle")) {
      const logMessage = `❌ (${track.name}): The 6th track → has the placement MIDDLE (this track's placement is ${track.placement}); and has a different form (this track's form is ${track.form}) vs the 5th track (the 5th's track's form is ${prevTrack1.form})`;
      logRuleApplication(66, logMessage, false);
      return false;
    }
    if (track.form === prevTrack1.form) {
      const logMessage = `❌ (${track.name}): The 6th track → has the placement MIDDLE (this track's placement is ${track.placement}); and has a different form (this track's form is ${track.form}) vs the 5th track (the 5th's track's form is ${prevTrack1.form})`;
      logRuleApplication(66, logMessage, false);
      return false;
    }
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `🌻! (${track.name}): Passed this base track rule! The 6th track → has the placement MIDDLE (this track's placement is ${track.placement}); and has a different form (this track's form is ${track.form}) vs the 5th track (the 5th track's form is ${prevTrack1.form})`;
  logRuleApplication(66, logMessage, true);
  return true;
}

// Rule 67: Rule 7 (only for Track 7): The 7th track should have the placement 'middle', a different form than the 6th track, and unless the form of the 7th track is 'MUSIC', it must also have a different language from the 6th track.
function r67(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 6) {
    if (
      !track.placement.includes("middle") ||
      track.form === prevTrack1.form ||
      (track.form !== "MUSIC" && track.language === prevTrack1.language)
    ) {
      const logMessage = `❌ (${track.name}): The 7th track → has the placement MIDDLE (this track's placement is ${track.placement}) and has a different form (this track's form is ${track.form}) vs the 6th track (the 6th track's form is ${prevTrack1.form}); AND unless the form of the 7th track is MUSIC (the 7th track's form is ${track.form}), the 7th track also has a different language (the 7th track's language is ${track.language}) from the 6th track (the 6th track's language is ${prevTrack1.language})`;
      logRuleApplication(67, logMessage, false);
      return false;
    }
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `🌻! (${track.name}): Passed this base track rule! The 7th track → has the placement MIDDLE (this track's placement is ${track.placement}) and has a different form (this track's form is ${track.form}) vs the 6th track (the 6th track's form is ${prevTrack1.form}); AND unless the form of the 7th track is MUSIC (the 7th track's form is ${track.form}), the 7th track also has a different language (the 7th track's language is ${track.language}) from the 6th track (the 6th track's language is ${prevTrack1.language})`;
  logRuleApplication(67, logMessage, true);
  return true;
}

// Rule 68: Rule 8 (only for Track 8): The 8th track should have the placement 'middle', a different form than the 6th and 7th tracks, and a different language than the 6th and 7th tracks. (NOTE: this rule is too restrictive, it breaks the playlist sometimes!)
function r68(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex === 7) {
    if (!track.placement.includes("middle")) {
      const logMessage = `❌ (${track.name}): The 8th track → has the placement MIDDLE (this track's placement is ${track.placement}); and a different form (this track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}); and has a different language (this track's language is ${track.language}) vs the 7th track (the 7th track's language is ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;
      logRuleApplication(68, logMessage, false);
      return false;
    }
    if (track.form === prevTrack1.form || track.form === prevTrack2.form) {
      const logMessage = `❌ (${track.name}): The 8th track → has the placement MIDDLE (this track's placement is ${track.placement}); and a different form (this track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}); and has a different language (this track's language is ${track.language}) vs the 7th track (the 7th track's language is ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;
      logRuleApplication(68, logMessage, false);
      return false;
    }
    if (
      track.language === prevTrack1.language ||
      track.language === prevTrack2.language
    ) {
      const logMessage = `❌ (${track.name}): The 8th track → has the placement MIDDLE (this track's placement is ${track.placement}); and a different form (this track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}) and has a different language (this track's language ${track.language}) vs the 7th track (the 7th track's language ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;
      logRuleApplication(68, logMessage, false);
      return false;
    }
  }
  // If the conditions are met, return true to indicate rule followed
  const logMessage = `🌻! (${track.name}): Passed this base track rule! The 8th track → has the placement MIDDLE (this track's placement is ${track.placement}); and a different form (this track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}) and has a different language (this track's language ${track.language}) vs the 7th track (the 7th track's language ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;
  logRuleApplication(68, logMessage, true);
  return true;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX ENSURE RULES (NEAR THE END) XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// Rule 21. Ensure that the tracklist contains at least one track with the author albert.
function r21(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  // console.log("my auth is " + track.author);
  if (track.name && curatedTracklist.length >= 9) {
    if (
      !trackExistsWithAttributes(curatedTracklist, "author", "ALBERT") &&
      track.author !== "ALBERT"
    ) {
      {
        const logMessage = `❌ ${track.name}: We need an Albert but we already have one or this one isn't an Albert (this track's author is ${track.author})`;
        logRuleApplication(r21, logMessage, false);
        return false;
      }
    }
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = `🌱! ${track.name}: Passed this ensure rule! We need an Albert and this track's author is ${track.author}`;
  logRuleApplication(r21, logMessage, true);
  return true;
}

// Rule 22. Ensure that the tracklist contains at least one track with the author PIERREELLIOTT.
function r22(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (curatedTracklist.length >= 9) {
    if (
      !trackExistsWithAttributes(curatedTracklist, "author", "PIERREELLIOTT") &&
      track.author !== "PIERREELLIOTT"
    ) {
      {
        const logMessage = `❌ ${track.name}: We need a PIERREELLIOTT track but we already have one or this one isn't a PIERREELLIOTT track (this track's author is ${track.author})`;
        logRuleApplication(22, logMessage, false);
        return false;
      }
    }
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = `🌱! ${track.name}: Passed this ensure rule! We need a birds track and this track's author is ${track.author}`;
  logRuleApplication(22, logMessage, true);
  return true;
}

// Rule 23. Ensure that the tracklist contains at least one track with the form interview.
function r23(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (curatedTracklist.length >= 9) {
    if (
      !trackExistsWithAttributes(curatedTracklist, "form", "interview") &&
      track.form !== "interview"
    ) {
      const logMessage = `❌ ${track.name}: We need an interview track track but we already have one or this one isn't an interview track (this track's form is ${track.form})`;
      logRuleApplication(23, logMessage, false);
      return false;
    }
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = `🌱! ${track.name}: Passed this ensure rule! We need an interview track and this track's form is ${track.form}`;
  logRuleApplication(23, logMessage, true);
  return true;
}

// Rule 24. Ensure that the tracklist contains at least one track with the form music.
function r24(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (curatedTracklist.length >= 9) {
    if (
      !trackExistsWithAttributes(curatedTracklist, "form", "music") &&
      track.form !== "music"
    ) {
      const logMessage = `❌ ${track.name}: We need an music track track but we already have one or this one isn't a music track (this track's form is ${track.form})`;
      logRuleApplication(24, logMessage, false);
      return false;
    }
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = `🌱! ${track.name}: Passed this ensure rule! We need a music track and this track's form is ${track.form}`;
  logRuleApplication(24, logMessage, true);
  return true;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX GOOSE RULE (AT THE VERY END) XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// if this track has the tag "geese" AND if a track with the tag "geese" is already in curatedTracklist AND if prevTrack1 does NOT have the tag geese:
function r32(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  // Check if prevTrack1 doesn't have the "geese" tag
  const attribute = "tags";
  const value = "geese";

  const prevTrack1HasGeeseTag = trackExistsWithAttributes(
    prevTrack1,
    attribute,
    value
  );

  // Check if curatedTracklist has at least one track with the "geese" tag
  const hasAtLeastOneGeeseTagInCurated = trackExistsWithAttributes(
    curatedTracklist,
    attribute,
    value
  );

  if (!prevTrack1HasGeeseTag) {
    if (hasAtLeastOneGeeseTagInCurated) {
      // Add the current track to the curatedTracklist if it meets the conditions
      curatedTracklist[trackIndex] = track;
      const logMessage = `🌱! ${track.name}: Passed this ensure rule! We got a second goose track`;
      logRuleApplication(32, logMessage, true);
      return true;
    } else {
      let rejectionReasons = [];
      if (!hasAtLeastOneGeeseTagInCurated) {
        rejectionReasons.push(
          "No track with the 'geese' tag in the curated tracklist"
        );
      }
      if (prevTrack1HasGeeseTag) {
        rejectionReasons.push("prevTrack1 has the 'geese' tag");
      }

      const logMessage = `❌ ${
        track.name
      }: Geese Tag Rule: Track not added. Reasons: ${rejectionReasons.join(
        ", "
      )}`;
      logRuleApplication(32, logMessage, false);
      return false;
    }
  } else {
    console.log("prevTrack1 has the 'geese' tag, rule not applied.");
    return false;
  }
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX HELPER FUNCTIONS (FOR CHECKING TRACK VALIDITY) XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function calculateOrUpdateCuratedTracklistDuration(track, curatedTracklist) {
  if (curatedTracklistTotalTime === 0) {
    for (const track of curatedTracklist) {
      console.log("ttt track name is " + track.name);
      console.log("ttt track time is " + track.duration);
      curatedTracklistTotalTime += track.duration; // Assuming track has a property 'duration'
    }
    return curatedTracklistTotalTime;
  } else {
    curatedTracklistTotalTime += track.duration; // Assuming track has a property 'duration'
    console.log("curatedTracklistTotalTime is " + curatedTracklistTotalTime);
    return curatedTracklistTotalTime;
  }
}

function addNextValidTrack(track, curatedTracklist, tracks) {
  curatedTracklist.push(track);
  const trackIndex = tracks.findIndex((t) => t === track);
  if (trackIndex !== -1) {
    tracks.splice(trackIndex, 1);
  }
}

// Helper function for isThisAValidTrack to check if a track exists with the given attribute and value in the curated tracklist
function trackExistsWithAttributes(curatedTracklist, attribute, value) {
  for (const key in curatedTracklist) {
    if (curatedTracklist.hasOwnProperty(key)) {
      const track = curatedTracklist[key];
      if (track[attribute] === value) {
        return true;
      }
    }
  }
  return false;
}

// Helper function for logging rules
function logRuleApplication(
  ruleNumber,
  description,
  isApplied,
  message = null
) {
  const ruleStatus = isApplied ? "passed" : "broken";
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
  // Initialize index variables for iterating through the tracklist
  let currIndex = 0; // Used to loop through tracklist
  let trackIndex = 0; // Used to index curatedTracklist

  // Define general rule functions for phase 1
  const generalRuleFunctions = [r10, r11, r12, r13, r14, r15, r16];

  // Define ensure and final check rules for phase 2
  // Define ensure and final check rules for phase 2
  const unshuffledEnsureRules = [r21, r22, r23, r24];
  // Shuffle the array
  shuffleArrayOfRules(unshuffledEnsureRules);

  const lateCheckRules = [r32];
  // Define closing track rules
  // const finalTrackRule = [r99];

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

      // console.log(`my track is ${track.name}`);

      // Apply the specific rule to the current track
      const isSpecificRuleApplied = ruleFunction(
        track,
        prevTrack1,
        prevTrack2,
        curatedTracklist,
        trackIndex
      );

      // Check if the specific rule is met
      if (!isSpecificRuleApplied) {
        // Move to the next track in the tracklist
        currIndex++;
        continue; // Skip the rest of the loop and move to the next iteration
      }
      // Apply general rule functions for the track
      let generalRulesPassed = true;
      // so we don't deal with previos tracks before we have them
      if (trackIndex > 2) {
        for (const generalRule of generalRuleFunctions) {
          if (
            !generalRule(
              track,
              prevTrack1,
              prevTrack2,
              curatedTracklist,
              currIndex
            )
          ) {
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
        curatedTracklistTotalTime = calculateOrUpdateCuratedTracklistDuration(
          track,
          curatedTracklist
        );

        // Update the previous tracks with the added track
        [prevTrack1, prevTrack2] = updatePrevTracks(
          track,
          prevTrack1,
          prevTrack2
        );

        // Mark that the track has passed the current rule
        trackPassedRule = true;

        // Increment trackIndex to move to the next track in curatedTracklist
        trackIndex++;
      }

      // Move to the next track in the tracklist
      currIndex++;
    }
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Phase 2: Ensure rules and final check rules
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Calculate the remaining time until the maximum playlist duration is reached
  const myRemainingTime =
    MAX_PLAYLIST_DURATION_SECONDS - curatedTracklistTotalTime;

  // let track;

  let iterationCounter = 0; // Initialize the iteration counter
  let ensureRulesApplied = {
    r21: false,
    r22: false,
    r23: false,
    r24: false,
  }; // Initialize flags for ensureRules

  let lateCheckRulesApplied = false; // Initialize late check rules flag

  while (curatedTracklistTotalTime <= MAX_PLAYLIST_DURATION_SECONDS) {
    // Check if currIndex exceeds the length of the tracklist so we can loop through the tracklist again
    if (currIndex >= tracklist.length) {
      currIndex = 0; // Reset currIndex to the beginning of the tracklist
      iterationCounter++; // Increment the iteration counter
    }

    // Check if we've exceeded the maximum number of iterations, so we should give up on trying to find a valid song
    if (iterationCounter >= 3) {
      console.log("Emergency stop: Maximum iterations reached.");
      break; // Exit the loop
    }
    const track = tracklist[currIndex];

    // Decide which set of rules to apply based on the current remaining time
    let rulesToApply;

    const ALMOSTOUTOFTIME = 900;
    const TOTHEWIRE = 800;

    if (myRemainingTime <= TOTHEWIRE) {
      if (!lateCheckRulesApplied) {
        rulesToApply = lateCheckRules;
      } else {
        // If lateCheckRules have already been applied, skip applying them
        rulesToApply = [];
      }
    } else {
      rulesToApply = [];

      // Apply ensureRules if they haven't been applied already
      if (!ensureRulesApplied.r21) {
        rulesToApply.push(r21);
      }
      if (!ensureRulesApplied.r22) {
        rulesToApply.push(r22);
      }
      if (!ensureRulesApplied.r23) {
        rulesToApply.push(r23);
      }
      if (!ensureRulesApplied.r24) {
        rulesToApply.push(r24);
      }
    }

    // Initialize a flag to track if any rule fails for the current track
    let ruleFailed = false;
    let rule; // Declare the rule variable here

    // Iterate through the selected set of rules (either final check or ensure rules)
    for (rule of rulesToApply) {
      // Remove the "const" declaration here
      console.log("track is " + track);
      // Check if the current track violates the rule
      if (!rule(track, prevTrack1, prevTrack2, curatedTracklist, currIndex)) {
        console.log(`Ensure/Final rule failed for track: ${track.name}`);
        ruleFailed = true;
        break; // Exit the loop early since a rule has failed
      }
    }

    // Apply general rule functions for the track, because tracks always need to follow general rules
    for (const generalRule of generalRuleFunctions) {
      if (
        !generalRule(track, prevTrack1, prevTrack2, curatedTracklist, currIndex)
      ) {
        console.log(`General rule failed for track: ${track.name}`);
        ruleFailed = true;
        break; // Exit the loop early since a rule has failed
      }
    }

    // If no rules have failed and ensureRules have not been applied, update the applied flag
    if (!ruleFailed) {
      if (!lateCheckRulesApplied) {
        lateCheckRulesApplied = true;
      }

      // Update the flags for ensureRules that have been applied
      if (!ensureRulesApplied.r21 && rule === r21) {
        ensureRulesApplied.r21 = true;
      }
      if (!ensureRulesApplied.r22 && rule === r22) {
        ensureRulesApplied.r22 = true;
      }
      if (!ensureRulesApplied.r23 && rule === r23) {
        ensureRulesApplied.r23 = true;
      }
      if (!ensureRulesApplied.r24 && rule === r24) {
        ensureRulesApplied.r24 = true;
      }

      addNextValidTrack(track, curatedTracklist, tracklist);
      calculateOrUpdateCuratedTracklistDuration(track, curatedTracklist);
      [prevTrack1, prevTrack2] = updatePrevTracks(
        track,
        prevTrack1,
        prevTrack2
      );
    }

    currIndex++; // Move to the next track in the tracklist
  }

  // finally, move the first track to the end, where it belongs
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
  console.log(tracklist);
  return tracklist;
}

function shuffleArrayOfRules(shuffledRulesArray) {
  for (let i = shuffledRulesArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledRulesArray[i], shuffledRulesArray[j]] = [
      shuffledRulesArray[j],
      shuffledRulesArray[i],
    ]; // Swap elements at i and j
  }

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
    const playerTrackNameHTMLElement =
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
    displayDebugText(playerTrackNameHTMLElement, currName, "no name");
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
      itemText += `<span style="${labelStyle}">placement:</span> ${placement
        .filter((value) => value !== "")
        .join(", ")}, `;
    }

    if (Array.isArray(tags) && tags.some((value) => value !== "")) {
      itemText += `<span style="${labelStyle}">tags:</span> ${tags
        .filter((value) => value !== "")
        .join(", ")}, `;
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
    fetchAndCacheAudio(nextAudio.url, cache).then((p) =>
      console.log(`loaded ${nextAudio.url} into cache`)
    );
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

  window.caches
    .open("audio-pre-cache")
    .then((cache) => queueNextTrack(curatedTracklist, 0, 0, cache));
});
