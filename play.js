import { r10, r11, r12, r13, r14, r15, r16 } from "./generalRules.js";
import { r21, r22, r23, r24 } from "./ensureRules.js";
import { r61, r62, r63, r64, r65, r66, r67, r68 } from "./specificRules.js";
import { r25 } from "./geeseRule.js";
import { gatherTheCreditSongs } from "./credits.js";
import { createTranscriptContainer } from "./transcript.js";
import { checkPlaylistRules } from "./checkRules.js";
import { isValidTracklist } from "./checkTracks.js";
import { shuffleTracklist, shuffleArrayOfRules } from "./shuffle.js";
import { printEntireTracklistDebug, gatherAndPrintDebugInfo } from "./debug.js";


// need to add the credit durations to the duration

// window.addEventListener("load", () => {

let myLang = localStorage["lang"] || "defaultValue";
let player;
let audioContext = null;
let volumeNode;
let playerPlayState = "play";
let hasSkippedToEnd = false;
let displayConsoleLog = "<br>";
export let curatedTracklistTotalTimeInSecs;
curatedTracklistTotalTimeInSecs = 0;
let curatedTracklistTotalTimeInMins;
let curatedTracklist;
let timerDuration = 0;

let remainingTime;
let geeseTrackCounter;

const MAX_PLAYLIST_DURATION_SECONDS = 1140; //(19m)
// 1140
var totalDurationSeconds = 2140; //(19m)
let currentTimeElement; // Element to display current time
const PREFETCH_BUFFER_SECONDS = 8; /* set how many seconds before a song is completed to pre-fetch the next song */



export const timerStateManager = {
  getTimerDuration: () => timerDuration,
  setTimerDuration: (newTimerDuration) => timerDuration = newTimerDuration,

  getPlayer: () => player,
  setPlayer: (newPlayer) => player = newPlayer,
  getTimeSecs: () => curatedTracklistTotalTimeInSecs,
  setTimeSecs: (newTimeSecs) => curatedTracklistTotalTimeInSecs = newTimeSecs,
  getDurSecs: () => totalDurationSeconds,
  setDurSecs: (newDurSecs) => totalDurationSeconds = newDurSecs,
  getRemTime: () => totalDurationSeconds,
  setRemTime: (newRemTime) => remainingTime = newRemTime,
};

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
    volumeSlider.type = "range";
    volumeSlider.max = "100";
    volumeSlider.min = "0";
    volumeSlider.value = "75";
  }
  return volumeSlider;
}
const volumeSlider = createVolumeSlider();

function handleVolumeChange(event) {
  if (volumeNode !== undefined) {
    const newVolume = parseFloat(event.target.value) / 100;
    volumeNode.gain.value = newVolume;
  }
}

if (volumeSlider) {
  volumeSlider.addEventListener("change", handleVolumeChange);
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
  // const audio = new Audio();
  const audio = document.createElement("audio");
  audio.preload = "none";
  audio.src = url;
  // audio.id = id;
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

export const addAudioFromUrl = (song) => {
  song.audio = createAudioElement(song.url);
  // song.audio = createAudioElement("./sounds/CONTENT/S_DEMI_14.mp3");
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

/* Define an array SONGS containing multiple song objects, each song object is 
  processed using the addAudioFromUrl function. */

let songs;

async function loadSongs() {
  try {
    const response = await fetch("songs.json");
    const data = await response.json();
    songs = data.map(addAudioFromUrl);
    // Now you can use songs
    const allSongs = [...songs];
    // ... rest of your code that uses allSongs
  } catch (error) {
    console.error("Error loading JSON data:", error);
  }
}

loadSongs();

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
let r16rule = "If the previous track has length long and form music, this track must have the form interview or poetry";
// let r60rule = "the 0th track must have the placement end (we'll be moving this to the end)";
let r61rule = "the 1st track must have the tag 'intro'";
let r62rule = "the 2nd track must have the placement 'beginning'";
let r63rule = "the 3rd track must have the placement beginning and a different form than the 2nd track";
let r64rule = "the 4th track must have the placement middle and a different form than the 3rd track";
let r65rule = "the 5th track must have the length 'short'; must have the placement 'middle'; and have a different form than the 4th track";
let r66rule = "the 6th track must have the placement 'middle' and a different form than the 5th track";
let r67rule = "the 7th track must have the placement 'middle' and a different form than the 6th track";
let r68rule = "the 8th track must have the placement 'middle', a different form than previous track";
let r21rule = "minimum one track with the author ALBERT";
let r22rule = "minimum one track with the author PIERREELLIOTT";
let r23rule = "minimum one track with the form interview";
let r24rule = "minimum one track with the form music";
let r25rule = "The tracklist cannot contain one track with the tag 'geese'";

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX HELPER FUNCTIONS (DURATION) XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function addTrackDurationToTotal(totalTimeInSecs, track) {
  return totalTimeInSecs + (track.duration || 0);
}

function calculateOrUpdatecuratedTracklistDuration(track, curatedTracklist) {
  if (curatedTracklistTotalTimeInSecs === 0) {
    for (const track of curatedTracklist) {
      curatedTracklistTotalTimeInSecs = addTrackDurationToTotal(curatedTracklistTotalTimeInSecs, track);
    }
  } else if (track) {
    curatedTracklistTotalTimeInSecs = addTrackDurationToTotal(curatedTracklistTotalTimeInSecs, track);
  }

  curatedTracklistTotalTimeInMins = Math.floor(curatedTracklistTotalTimeInSecs / 60);

  return curatedTracklistTotalTimeInSecs;
}

function getFinalcuratedTracklistDuration(curatedTracklist) {
  let curatedTracklistTotalTimeInSecs = 0;

  if (!Array.isArray(curatedTracklist)) {
    console.error("Error: curatedTracklist is not an array");
    return curatedTracklistTotalTimeInSecs;
  }

  for (const track of curatedTracklist) {
    console.log("Track name is " + track.name);
    curatedTracklistTotalTimeInSecs = addTrackDurationToTotal(curatedTracklistTotalTimeInSecs, track);
    console.log("Track duration is " + (track.duration || 0));
  }

  curatedTracklistTotalTimeInMins = Math.floor(curatedTracklistTotalTimeInSecs / 60);

  return curatedTracklistTotalTimeInSecs;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX HELPER FUNCTIONS (FOR CHECKING TRACK VALIDITY) XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, index, generalRuleFunctions) {
  return generalRuleFunctions.every((rule) => rule(track, prevTrack1, prevTrack2, curatedTracklist, index));
}

function addNextValidTrack(track, curatedTracklist, tracks) {
  curatedTracklist.push(track);
  const trackIndex = tracks.findIndex((t) => t === track);
  if (trackIndex !== -1) {
    tracks.splice(trackIndex, 1);
  }
}

export function trackExistsWithAttributes(curatedTracklist, attribute, value) {
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

export function logRuleApplication(ruleNumber, trackName, logMessage, isApplied, ruleType) {
  const ruleStatus = isApplied ? "passed" : "failed"; // Use "failed" for consistency
  const statusIcon = isApplied ? "🌱" : "🫧"; // Add status icon based on isApplied
  console.log(`${statusIcon} R${ruleNumber} ${ruleStatus} ${trackName} ${logMessage} `); //findme
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

// ~~~ Initialization Functions ~~~
function initializecuratedTracklist() {
  return [];
}

function initializeGeneralRules() {
  return [r10, r11, r12, r13, r14, r15, r16];
}

function initializeEnsureRules(rules, fixedRules = []) {
  // Separate the rules that should not be shuffled
  const rulesToShuffle = rules.filter((rule) => !fixedRules.includes(rule));
  const shuffledEnsureRules = shuffleArrayOfRules(rulesToShuffle).concat(fixedRules);

  const ensureRulesEnforced = {};
  shuffledEnsureRules.forEach((rule) => {
    ensureRulesEnforced[`r${parseInt(rule.name.match(/\d+/)[0])}`] = false;
  });

  return { shuffledEnsureRules, ensureRulesEnforced };
}

function ensureGeneralRules(generalRuleFunctions, track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  for (const generalRule of generalRuleFunctions) {
    // Handle null values for prevTrack1 and prevTrack2
    let safePrevTrack1 = prevTrack1 || {}; // Use an empty object if prevTrack1 is null
    let safePrevTrack2 = prevTrack2 || {}; // Use an empty object if prevTrack2 is null

    // Now pass the safePrevTrack1 and safePrevTrack2 to the rule function
    if (!generalRule(track, safePrevTrack1, safePrevTrack2, curatedTracklist, currIndex)) {
      // console.log(`🫧 General rule failed for ${track.name} by rule ${generalRule.name}`);
      return false; // General rule failed
    }
  }
  return true; // All general rules passed
}

// ~~~ Utility Functions ~~~
function applySpecificRule(ruleFunction, track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  return ruleFunction(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex);
}

function applyGeneralRules(generalRuleFunctions, track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  return isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex, generalRuleFunctions);
}

function ensureTrack(track, currIndex, ensureRules, ensureRulesEnforced, curatedTracklist) {
  for (const rule of ensureRules) {
    const ruleNumber = parseInt(rule.name.match(/\d+/)[0]);

    if (!isEnsureRuleEnforced(ensureRulesEnforced, ruleNumber)) {
      if (!rule(track, null, null, curatedTracklist, currIndex)) {
        return false; // Ensure rule failed, exit the loop
      }
      // Mark the rule as enforced once it passes
      markEnsureRuleEnforced(ensureRulesEnforced, ruleNumber);
    }
  }
  return true; // All ensure rules passed
}

function checkAllEnsureRulesEnforced(ensureRulesEnforced) {
  return Object.values(ensureRulesEnforced).every((flag) => flag === true);
}

function isEnsureRuleEnforced(ensureRulesEnforced, ruleNumber) {
  return ensureRulesEnforced[`r${ruleNumber}`];
}

function markEnsureRuleEnforced(ensureRulesEnforced, ruleNumber) {
  ensureRulesEnforced[`r${ruleNumber}`] = true;
}

function preFilterLastTracks(tracklist, curatedTracklist, generalRuleFunctions) {
  let potentialLastTracks = [];
  for (let track of tracklist) {
    if (track.placement.includes("end")) {
      let simulatedPrevTrack1 = curatedTracklist[curatedTracklist.length - 1] || {};
      let simulatedPrevTrack2 = curatedTracklist.length > 1 ? curatedTracklist[curatedTracklist.length - 2] : {};

      if (ensureGeneralRules(generalRuleFunctions, track, simulatedPrevTrack1, simulatedPrevTrack2, curatedTracklist, curatedTracklist.length)) {
        potentialLastTracks.push(track);
      }
    }
  }
  return potentialLastTracks;
}

function finalizeTracklist(tracklist, curatedTracklist, generalRuleFunctions) {
  if (curatedTracklist.length > 0) {
    let possibleLastTracks = preFilterLastTracks(tracklist, curatedTracklist, generalRuleFunctions);

    let lastTrack = findSuitableLastTrack(possibleLastTracks, curatedTracklist, generalRuleFunctions);

    if (lastTrack) {
      curatedTracklist.push(lastTrack);
    } else {
      console.log("No suitable last track found that meets the general rules and is not already in the list.");
    }
  }
  return curatedTracklist;
}

function findSuitableLastTrack(possibleLastTracks, curatedTracklist, generalRuleFunctions) {
  for (let track of possibleLastTracks) {
    if (
      !trackAlreadyInList(track, curatedTracklist) &&
      ensureGeneralRules(
        generalRuleFunctions,
        track,
        curatedTracklist[curatedTracklist.length - 1],
        curatedTracklist[curatedTracklist.length - 2],
        curatedTracklist,
        curatedTracklist.length
      )
    ) {
      return track;
    }
  }
  return null;
}

function trackAlreadyInList(track, curatedTracklist) {
  return curatedTracklist.some((curatedTrack) => curatedTrack.name === track.name);
}

// ~~~ Phase Functions ~~~
function executePhase1(tracklist, curatedTracklist, generalRuleFunctions) {
  console.log("🚀🚀🚀🚀🚀🚀🚀 Starting Phase 1: Apply specific rules and general rules");

  const specificRuleFunctions = [r61, r62, r63, r64, r65, r66, r67, r68];
  let ruleFailureCounts = specificRuleFunctions.map(() => 0); // Initialize failure counts for each rule
  let prevTrack1 = null;
  let prevTrack2 = null;
  let trackIndex = 0;

  for (let i = 0; i < specificRuleFunctions.length; i++) {
    let ruleMet = false;
    let tracksTried = 0; // Counter for the number of tracks tried
    let specificRuleDescription = eval(`r${61 + i}rule`); // Assumes rule descriptions are like r60rule, r61rule, etc.

    while (!ruleMet && tracksTried < tracklist.length) {
      let track = tracklist[tracksTried];

      if (applySpecificRule(specificRuleFunctions[i], track, prevTrack1, prevTrack2, curatedTracklist, trackIndex + 1)) {
        if (i < 2 || isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex, generalRuleFunctions)) {
          addNextValidTrack(track, curatedTracklist, tracklist);
          curatedTracklistTotalTimeInSecs = calculateOrUpdatecuratedTracklistDuration(track, curatedTracklist);
          [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
          console.log(`${curatedTracklist.length}:✅ Added ${track.name} to the curated tracklist`);
          trackIndex++;
          ruleMet = true;
        } else {
          // console.log(`🫧 General Rules Failed for ${track.name}`);
          tracksTried++;
        }
      } else {
        // console.log(`🫧 Specific Rule Failed for ${track.name}: ${specificRuleDescription}`);
        ruleFailureCounts[i]++; // Increment failure count for the specific rule
        tracksTried++;
      }
    }

    if (!ruleMet) {
      const mostFrequentRuleIndex = ruleFailureCounts.indexOf(Math.max(...ruleFailureCounts));
      const mostFrequentRuleDescription = eval(`r${61 + mostFrequentRuleIndex}rule`);
      console.log(`OHHHHH NOOOOOO No suitable track found for specific rule: ${specificRuleDescription}.`);
      console.log(`Total tracks tried: ${tracksTried}. Most frequently broken rule: ${mostFrequentRuleDescription}`);
    }
  }
}

function executePhase2(tracklist, curatedTracklist, generalRuleFunctions, shuffledEnsureRules, ensureRulesEnforced) {
  console.log("🚀🚀🚀🚀🚀🚀🚀 Starting Phase 2: Ensure rules and final check rules");

  let prevTrack1 = curatedTracklist.length > 0 ? curatedTracklist[curatedTracklist.length - 1] : null;
  let prevTrack2 = curatedTracklist.length > 1 ? curatedTracklist[curatedTracklist.length - 2] : null;

  for (let rule of shuffledEnsureRules) {
    let ruleNumber = rule.name.replace("r", "");
    let ruleDescVarName = `r${ruleNumber}rule`;
    let ruleDescription = eval(ruleDescVarName);
    let ruleMet = false;

    console.log(`🔍 Checking if "${ruleDescription}" is already met in curatedTracklist.`);
    // Check if the rule is satisfied by any track in the curatedTracklist
    for (let track of curatedTracklist) {
      if (rule(track, null, null, curatedTracklist, curatedTracklist.indexOf(track))) {
        // console.log(`💯 ${ruleDescription} is already met by ${track.name} in curatedTracklist.`);
        markEnsureRuleEnforced(ensureRulesEnforced, ruleNumber); // Mark the rule as enforced
        ruleMet = true;
        break; // Rule is satisfied, no need to check further
      }
    }

    // If rule not met in curatedTracklist, find a track in tracklist to satisfy the rule
    if (!ruleMet) {
      console.log(`🔍 "${ruleDescription}" wasn't met, gotta go fishing!`);
      for (let track of tracklist) {
        console.log(`🔍 Checking if "${track.name}" meets "${ruleDescription}"`);
        if (rule(track, null, null, curatedTracklist, curatedTracklist.length)) {
          if (isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, curatedTracklist.length, generalRuleFunctions)) {
            if (curatedTracklistTotalTimeInSecs + (track.duration || 0) > MAX_PLAYLIST_DURATION_SECONDS) {
              console.log(
                `NICE! OUT OF TIME while trying to add a track that meets ensure rules! curatedTracklistTotalTimeInSecs is ${curatedTracklistTotalTimeInSecs} and MAX_PLAYLIST_DURATION_SECONDS is ${MAX_PLAYLIST_DURATION_SECONDS}`
              );
              break; // Stop processing if the maximum duration is exceeded
            }

            addNextValidTrack(track, curatedTracklist, tracklist);
            curatedTracklistTotalTimeInSecs = calculateOrUpdatecuratedTracklistDuration(track, curatedTracklist);
            [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
            console.log(`✅ Added "${track.name}" to curatedTracklist to meet "${ruleDescription}"`);
            markEnsureRuleEnforced(ensureRulesEnforced, ruleNumber); // Mark the rule as enforced
            ruleMet = true;
            break; // Suitable track found, stop searching
          } else {
            // console.log(`🫧 "${track.name}" meets "${ruleDescription}" but does not satisfy general rules.`);
          }
        }
      }
    }

    if (!ruleMet) {
      console.log(`Oh nooooooooooo ❌ Could not find a suitable track to satisfy the rule: ${ruleDescription}`);
      // Handle the situation where no track can satisfy the rule
    }
  }

  // Check the 'geese' tag rule
  if (geeseTrackCounter === 1) {
    const geeseTracks = tracklist.filter((track) => track.tags.includes("geese"));
    let geeseTrackAdded = false;

    for (const geeseTrack of geeseTracks) {
      console.log(`🔍 Checking if 'geese' track: ${geeseTrack.name} meets general rules.`);
      if (
        // true
        isTrackValidForGeneralRules(geeseTrack, prevTrack1, prevTrack2, curatedTracklist, curatedTracklist.length, generalRuleFunctions)
      ) {
        if (curatedTracklistTotalTimeInSecs + (geeseTrack.duration || 0) > MAX_PLAYLIST_DURATION_SECONDS) {
          console.log(
            `NICE! OUT OF TIME while trying to add a goose track that meets ensure rules! curatedTracklistTotalTimeInSecs is ${curatedTracklistTotalTimeInSecs} and MAX_PLAYLIST_DURATION_SECONDS is ${MAX_PLAYLIST_DURATION_SECONDS}`
          );
          break; // Stop processing if the maximum duration is exceeded
        }

        addNextValidTrack(geeseTrack, curatedTracklist, tracklist);
        curatedTracklistTotalTimeInSecs = calculateOrUpdatecuratedTracklistDuration(geeseTrack, curatedTracklist);
        geeseTrackCounter++;
        geeseTrackAdded = true;
        break; // Stop the loop as we have added a valid geese track
      } else {
        console.log(`🚫 'geese' track: ${geeseTrack.name} does not meet general rules.`);
      }
    }

    if (!geeseTrackAdded) {
      console.log(`🚫 Could not find an additional 'geese' track that meets general rules.`);
    }
  }
}

function executePhase3(tracklist, curatedTracklist, generalRuleFunctions, gooseRule) {
  console.log("🚀🚀🚀🚀🚀🚀🚀 Starting Phase 3: Main general rules loop");

  // Get the last two tracks added to the curated list for rule comparisons
  let prevTrack1 = curatedTracklist.length > 0 ? curatedTracklist[curatedTracklist.length - 1] : null;
  let prevTrack2 = curatedTracklist.length > 1 ? curatedTracklist[curatedTracklist.length - 2] : null;

  // Iterate through each track in the provided tracklist
  for (const track of tracklist) {
    // Check if adding the current track exceeds the maximum playlist duration

    if (curatedTracklistTotalTimeInSecs + (track.duration || 0) > MAX_PLAYLIST_DURATION_SECONDS) {
      console.log(
        `NICE! OUT OF TIME in phase 3! curatedTracklistTotalTimeInSecs is ${curatedTracklistTotalTimeInSecs} and MAX_PLAYLIST_DURATION_SECONDS is ${MAX_PLAYLIST_DURATION_SECONDS}`
      );
      break; // Stop processing if the maximum duration is exceeded
    }

    // Apply general rules to the track
    if (isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, curatedTracklist.length, generalRuleFunctions)) {
      // Add the track to the curated list if it passes all checks
      addNextValidTrack(track, curatedTracklist, tracklist);
      curatedTracklistTotalTimeInSecs = calculateOrUpdatecuratedTracklistDuration(track, curatedTracklist);
      [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
    } else {
      // console.log(`🫧 General Rules Failed for ${track.name}`);
    }

    // Check the 'geese' tag rule
    if (geeseTrackCounter === 1) {
      const geeseTracks = tracklist.filter((track) => track.tags.includes("geese"));
      let geeseTrackAdded = false;

      for (const geeseTrack of geeseTracks) {
        console.log(`🔍 Checking if 'geese' track: ${geeseTrack.name} meets general rules.`);

        if (
          // true
          isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, curatedTracklist.length, generalRuleFunctions)
        ) {
          addNextValidTrack(geeseTrack, curatedTracklist, tracklist);
          curatedTracklistTotalTimeInSecs = calculateOrUpdatecuratedTracklistDuration(track, curatedTracklist);
          [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
          geeseTrackCounter++;
          console.log(`✅ Additional 'geese' track added: ${geeseTrack.name}`);
          geeseTrackAdded = true;
          break; // Stop the loop as we have added a valid geese track
        } else {
          console.log(`🚫 'geese' track: ${geeseTrack.name} does not meet general rules.`);
        }
      }

      if (!geeseTrackAdded) {
        console.log(`🚫 Couldn't find an additional 'geese' track that meets general rules.`);
      }
    }
  }

  // Log the completion of Phase 3 with the final duration
  console.log(
    `✅ Phase 3 completed with curated tracklist duration: ${curatedTracklistTotalTimeInSecs} seconds and MAX_PLAYLIST_DURATION_SECONDS is ${MAX_PLAYLIST_DURATION_SECONDS}`
  );
}

function followTracklistRules(tracklist) {
  console.log("🚀 Starting to follow tracklist rules");
  let curatedTracklist = initializecuratedTracklist();
  const generalRuleFunctions = initializeGeneralRules();

  const { shuffledEnsureRules, ensureRulesEnforced } = initializeEnsureRules([r21, r22, r23, r24, r25], [r25]);

  executePhase1(tracklist, curatedTracklist, generalRuleFunctions);
  executePhase2(tracklist, curatedTracklist, generalRuleFunctions, shuffledEnsureRules, ensureRulesEnforced);
  executePhase3(tracklist, curatedTracklist, generalRuleFunctions);

  let curatedTracklistTotalTimeInSecs = getFinalcuratedTracklistDuration(curatedTracklist);
  console.log("curatedTracklistTotalTimeInSecs is " + curatedTracklistTotalTimeInSecs);

  if (curatedTracklistTotalTimeInSecs > MAX_PLAYLIST_DURATION_SECONDS) {
    console.log("⏰ Ran out of time before completing the tracklist curation!");
  } else {
    console.log("✅ Finished curating the tracklist");
  }

  return finalizeTracklist(tracklist, curatedTracklist, generalRuleFunctions);
}




// first time is queueNextTrack(curatedTracklist, 0, 0, cache));
function queueNextTrack(songs, index, currentRuntime, cache) {
  try {
    const song = songs[index]; // get the song object
    const audio = song.audio;
    player = audio; // Update player to the current audio

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



let firstPlay = true;
var playButtonTextContainer = document.getElementById("play-button-text-container");

const playingSVG = `<img id="play-icon" class="svg-icon" src="images/svg/playButton.svg" alt="Play Icon">`;
const pausedSVG = `<img id="play-icon" class="svg-icon" src="images/svg/pauseButton.svg" alt="Pause Icon">`;

// Text Constants
const playingText = "PLAY";
const pausedText = "STOP";

function toggleButtonVisuals(isPlaying) {
  playButtonTextContainer.style.left = isPlaying ? "50%" : "35%";
  svgContainer.innerHTML = isPlaying ? pausedSVG : playingSVG;
  textContainer.textContent = isPlaying ? "STOP" : "PLAY";
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

function playTrack(index) {
  if (index >= curatedTracklist.length) return; // Exit if no more tracks

  const track = curatedTracklist[index];
  let audioElement = document.createElement("audio");
  audioElement.src = track.url; // Assuming 'track.url' exists
  document.body.appendChild(audioElement);

  audioElement.addEventListener("ended", () => {
    audioElement.remove(); // Clean up the finished track
    playTrack(index + 1); // Play the next track
  });

  audioElement.play();
}

function addOutrosAndCreditsToTracklist() {
  curatedTracklist.push(...outroAudioSounds.map(addAudioFromUrl));
  curatedTracklist.push(...gatherTheCreditSongs(curatedTracklist));
  curatedTracklist.push(...finalOutroAudioSounds.map(addAudioFromUrl));
}

function handlePlayPauseClick() {
  console.log("Entering handlePlayPauseClick function");

  try {
    // Existing code inside handlePlayPauseClick...
  } catch (error) {
    console.error("Error in handlePlayPauseClick: ", error);
  }

  try {
    // Existing code inside handlePlayPauseClick...
  } catch (error) {
    console.error("Error in handlePlayPauseClick: ", error);
  }

  if (firstPlay) {
    // playBackgroundMusic();

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
// });
