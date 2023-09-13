var myLang = localStorage["lang"] || "defaultValue";
var player;
var audioContext = null;
var volumeNode = null;
// var previousVolume = "100";
let playerPlayState = "play";
// let muteState = "unmute";
let hasSkippedToEnd = false;
let displayConsoleLog = "<br>";

const MAX_PLAYLIST_DURATION_SECONDS = 1020;
const ALMOST_DONE_THRESHOLD_SECONDS = 800;
const NO_TIME_LEFT_THRESHOLD_SECONDS = 1;

// const MAXPLAYLISTDURATION = 1080;

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXX SET UP THE PLAYER  XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
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

  let playIconContainer = document.createElement("button");
  playIconContainer.id = "play-icon";
  playIconContainer.classList.add("play-icon");
  playIconContainer.classList.add("paused");
  // playIconContainer.innerHTML = "pause";
  audioPlayerContainer.append(playIconContainer);

  playIconContainer.addEventListener("click", () => {
    if (playerPlayState === "play") {
      // playIconContainer.innerHTML = "play";
      playIconContainer.classList.remove("paused");
      playerPlayState = "pause";
      audioContext.suspend();
      clearInterval(timerInterval);
    } else {
      player.currentTime = 0;
      // playIconContainer.innerHTML = "pause";
      playIconContainer.classList.add("paused");
      playerPlayState = "play";
      audioContext.resume();
      timerInterval = createTimerLoopAndUpdateProgressTimer(timerDuration);
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
  timerInterval = createTimerLoopAndUpdateProgressTimer(0);
}

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

/* 1. Define two functions: addAudioFromUrl and addAudioFromUrl. These functions take a song 
  object as input, create an audio element for the song's URL, assign it to the song.audio property, 
  and return the modified song object.*/

function createAudioElement(url) {
  const audio = new Audio();
  audio.preload = "none";
  audio.src = url;
  audio.controls = false;
  return audio;
}

const addAudioFromUrl = (song) => {
  song.audio = createAudioElement(song.url);
  return song;
};

/* 4. Define two more arrays outroAudioSounds and finalOutroAudioSounds, each containing an object
   representing an outro track. Again, each object is processed using the addAudioFromUrl function. */

/* Ideally, the OUTRO would have music underneath the text like in the files:
To create this type of OUTRO we have provided a series of files the would be played in the following order:
OUTRO MUSIC ONLY (SHORT or LONG)
Then on top of that you would add 
OUTRO 2 PT 1 SOLO
Then the required NAMES that correspond to the chapters that have just played
OUTRO 2 PT 2 SOLO 
If it’s too cumbersome to program more than one file to play at the same time, you could tell the code to play:

OUTRO PT 1 SOLO (no music underneath)
Then the required NAMES that correspond to the chapters that have just played (no music underneath)
Then OUTRO 2 PT 2 with MUSIC
*/

const outroAudioSounds = [
  {
    name: "OUTRO2PT1SOLO",
    url: "./sounds/XX_OUTRO/OUTRO2PT1SOLO.mp3",
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
    url: "./sounds/XX_OUTRO/OUTRO2PT2withMUSIC.mp3",
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

/* 5. Define an array SONGS containing multiple song objects, each song object is 
  processed using the addAudioFromUrl function. */
const SONGS = SONGSRAW.map(addAudioFromUrl);

/* 7. set how many seconds before a song is completed to pre-fetch the next song */
const PREFETCH_BUFFER_SECONDS = 8;

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXX CREDITS XXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

let arrayOfCreditSongs = []; // TODO - find out where to store this
let creditsLog = []; // TODO - find out where to store this

function addToCreditsLog(songCredit) {
  const strippedCredit = songCredit.substring(songCredit.lastIndexOf("_") + 1);
  creditsLog.push(`${strippedCredit}<br>`);
}

function createCreditObjectAndAddToArray(song) {
  const creditObj = {
    name: song.name,
    url: song.credit, //flip on purpose
    duration: "",
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

  console.log(arrayOfCreditSongs);
  return arrayOfCreditSongs;
}

/* 8. followTracklistRules takes a tracklist array as input, applies certain
  rules to modify the tracklist, and returns the modified tracklist.
  */

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  XXXXXX TRACKLIST CREATION XXXXXXX
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

// Rule 11: No more than two tracks from the same author in a tracklist.
function r11(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  // Count the number of tracks in curatedTracklist by the same author as the current track
  const authorCount = curatedTracklist
    .filter((t) => t.author.trim() !== "") // Filter out tracks with no author
    .filter((t) => t.author === track.author).length;

  if (authorCount >= 2) {
    // Get the names of the tracks from the same author in the curated playlist
    const violatingTracks = curatedTracklist
      .filter((t) => t.author === track.author)
      .map((t) => t.name)
      .join(", ");

    // If the condition is met (authorCount >= 2), log a rule violation
    const logMessage = `❌ ${track.name}: Rule enforced! No more than two tracks from the same author (this track's author is ${track.author}). Violating tracks are: ${violatingTracks}`;
    logRuleApplication(11, logMessage, false);
    return false;
  }
  // If the condition is met (authorCount < 2), log successful rule application
  const logMessage = `🌱! ${track.name}: Track passes this rule: No more than two tracks from the same author (this track's author is ${track.author})`;
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
// if the last track is heavy, this one can't be laughter TODO FINDME
function r15(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  if (
    track.sentiment === "heavy" &&
    prevTrack1 &&
    prevTrack1.tags.includes("laughter")
  ) {
    const logMessage = `❌ ${track.name}: Rule enforced! If a track has sentiment 'heavy' (this track's sentiment is ${track.sentiment}), the track before cannot have 'laughter' tag (last track's tags are ${prevTrack1.tags})`;
    logRuleApplication(15, logMessage, false);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = `🌱! ${track.name}: Track passes this rule: If a track has sentiment 'heavy' (this track's sentiment is ${track.sentiment}), the track before cannot have 'laughter' tag (last track's tags are ${prevTrack1.tags})`;
  logRuleApplication(15, logMessage, true);
  return true;
}

// the way I'm handling this is a bit sideways, I'd like to think of something better
// Rule 16: If a track has the length long and the form music, then the immediately preceding track should have the form interview.
function r16(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  // Check if the current track's length is "long" and its form is "music",
  // and if there is a preceding track (prevTrack1) in the curated tracklist.
  if (
    track.length === "long" &&
    track.form === "music" &&
    prevTrack1 &&
    prevTrack1.form !== "interview"
  ) {
    const logMessage = `❌ ${track.name}: Rule enforced! If a track has length 'long' (this track's length is ${track.length}) and form 'music' (this track's form ${track.form}), the preceding track should have the form 'interview' (last track's form was ${prevTrack1.form})`;
    logRuleApplication(16, logMessage, false);
    return false; // Return false to indicate the rule is broken.
  }
  // or the preceding track's form is "interview"), return true to indicate rule followed.
  const logMessage = `🌱! ${track.name}: Track passes this rule: If a track has length 'long' (this track's length is ${track.length}) and form 'music' (this track's form ${track.form}), the preceding track should have the form 'interview' (last track's form was ${prevTrack1.form})`;
  logRuleApplication(16, logMessage, true);
  return true;
}

// Rule 17: If any of the tracks I_KIM_03, I_KIM_04, or I_KIM_05 are added to the tracklist, none of the other two tracks should be added to the tracklist.
function r17(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const forbiddenTracks = ["I_KIM_03", "I_KIM_04", "I_KIM_05"];
  const violatingForbiddenTracks = curatedTracklist
    .filter((t) => forbiddenTracks.includes(t.name))
    .map((t) => t.name)
    .join(", ");

  if (
    forbiddenTracks.includes(track.name) &&
    curatedTracklist.some((t) => forbiddenTracks.includes(t.name))
  ) {
    const logMessage = `❌ ${track.name}: Rule enforced! If any of the tracks I_KIM_03, I_KIM_04, or I_KIM_05 are added, the others should not be. Violating tracks: ${violatingForbiddenTracks}`;
    logRuleApplication(17, logMessage, false);
    return false;
  }

  // If the condition is not met, return true to indicate rule followed
  const logMessage = `🌱! ${track.name}: Track passes this rule: If any of the tracks I_KIM_03, I_KIM_04, or I_KIM_05 are added, the others should not be.`;
  logRuleApplication(17, logMessage, true);
  return true;
}

// Rule 18: If there is one track with the author SARAH and the form Interview in the tracklist, there should not be any more tracks with the author SARAH and the form Interview in the tracklist.
function r18(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const sarahInterviewExists = curatedTracklist.some(
    (t) => t.author === "SARAH" && t.form === "Interview"
  );

  if (
    track.author === "SARAH" &&
    track.form === "Interview" &&
    sarahInterviewExists
  ) {
    const violatingTracks = curatedTracklist
      .filter((t) => t.author === "SARAH" && t.form === "Interview")
      .map((t) => t.name)
      .join(", ");

    const logMessage = `x${track.name}: Rule enforced! If there is a track with author 'SARAH' (this track's ${track.author}) and form 'Interview' (this track's ${track.form}), no more such tracks should be added. Violating tracks: ${violatingTracks}`;
    logRuleApplication(18, logMessage, false);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = `🌱! ${track.name}: Track passes this rule: If there is a track with author 'SARAH' (this track's ${track.author}) and form 'Interview' (this track's ${track.form}), no more such tracks should be added.`;
  logRuleApplication(18, logMessage, true);
  return true;
}

// Rule 19: If there is one track with the author LOUELLA in the tracklist, there should not be any more tracks with the author LOUELLA in the tracklist.
function r19(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const louellaExists = curatedTracklist.some((t) => t.author === "LOUELLA");

  if (track.author === "LOUELLA" && louellaExists) {
    const violatingTracks = curatedTracklist
      .filter((t) => t.author === "LOUELLA")
      .map((t) => t.name)
      .join(", ");

    const logMessage = `❌ ${track.name}: Rule enforced! If there is a track with author 'LOUELLA' (this track's author ${track.author}), no more tracks with that author should be added. Violating tracks: ${violatingTracks}`;
    logRuleApplication(19, logMessage, false);
    return false;
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = `🌱! ${track.name}: Track passes this rule: If there is a track with author 'LOUELLA' (this track's author ${track.author}), no more tracks with that author should be added.`;
  logRuleApplication(19, logMessage, true);
  return true;
}

////////////////////////////////////////////////////
///~~~~~   create our base tracks  ~~~~~~~~////
////////////////////////////////////////////////////

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
  const logMessage = `🌻! (${track.name}): Found valid track. The 2nd track → has the placement beginning. (This track's placement is ${track.placement})`;
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
  const logMessage = `🌻! (${track.name}): Found valid track. The 3rd track → has the placement beginning (this track's placement is ${track.placement}) and a different form (this track's form is ${track.form}) than the 2nd track (the 2nd track's form is ${prevTrack1.form})`;
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
  const logMessage = `🌻! (${track.name}): Found valid track. The 4th track → has the placement middle (this track's placement is ${track.placement}); and a different form (this track's form is ${track.form}); than the 3rd track (${prevTrack1.form})`;
  logRuleApplication(64, logMessage, true);
  return true;
}

// Rule 65: Rule 5 (only for Track 5): The 5th track should have the form 'short'; should have the placement 'middile'; and have a different language than the 4th track.
// TODO FINDME
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
  const logMessage = `🌻! (${track.name}): Found valid track. The 5th track → has the form "short" (this track's form is ${track.form}); should have the placement MIDDLE (this track's placement is ${track.placement}); and a different language (this track's language is ${track.language}) from the 4th track (the 4th track's language is ${prevTrack1.language})`;
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
  const logMessage = `🌻! (${track.name}): Found valid track. The 6th track → has the placement MIDDLE (this track's placement is ${track.placement}); and has a different form (this track's form is ${track.form}) vs the 5th track (the 5th track's form is ${prevTrack1.form})`;
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
  const logMessage = `🌻! (${track.name}): Found valid track. The 7th track → has the placement MIDDLE (this track's placement is ${track.placement}) and has a different form (this track's form is ${track.form}) vs the 6th track (the 6th track's form is ${prevTrack1.form}); AND unless the form of the 7th track is MUSIC (the 7th track's form is ${track.form}), the 7th track also has a different language (the 7th track's language is ${track.language}) from the 6th track (the 6th track's language is ${prevTrack1.language})`;
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
  const logMessage = `🌻! (${track.name}): Found valid track. The 8th track → has the placement MIDDLE (this track's placement is ${track.placement}); and a different form (this track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}) and has a different language (this track's language ${track.language}) vs the 7th track (the 7th track's language ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;
  logRuleApplication(68, logMessage, true);
  return true;
}

////////////////////////////////////////////////////
///~~~~~  if we have our base tracks  ~~~~~~~~/////
////////////////////////////////////////////////////

// Rule 21. Ensure that the tracklist contains at least one track with the author albert.
function r21(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  // console.log("yooooooooo");
  console.log("my auth is " + track.author);
  if (curatedTracklist.length >= 9) {
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
  const logMessage = `🌻! ${track.name}: Found valid track. We need an Albert and this track's author is ${track.author}`;
  logRuleApplication(r21, logMessage, true);
  return true;
}

// Rule 22. Ensure that the tracklist contains at least one track with the author birds (PIERREELLIOTT).
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
  const logMessage = `🌻! ${track.name}: Found valid track. We need a birds track and this track's author is ${track.author}`;
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
  const logMessage = `🌻! ${track.name}: Found valid track. We need an interview track and this track's form is ${track.form}`;
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
  const logMessage = `🌻! ${track.name}: Found valid track. We need a music track and this track's form is ${track.form}`;
  logRuleApplication(24, logMessage, true);
  return true;
}

////////////////////////////////////////////////////
///~~~~~  buggy rules  ~~~~~~~~/////
////////////////////////////////////////////////////

// Rule 32: If the curatedTracklist already has a track that contains the geese tag, add another track that contains the geese tag.
function r32(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  if (trackIndex >= 9) {
    const ifWeHave1Goose2GeeseRule = trackExistsWithAttributes(
      curatedTracklist,
      "tags",
      "geese"
    );
    if (ifWeHave1Goose2GeeseRule) {
      if (track.tags.includes("geese")) {
        console.log("Geese Tag Rule: Track added as a related track.");
      } else {
        const logMessage = `❌ ${track.name}: Geese Tag Rule: Track not added. Another track with the 'geese' tag is required`;
        logRuleApplication(32, logMessage, false);
        return false;
      }
    }
  }
  // If the condition is not met, return true to indicate rule followed
  const logMessage = `v`;
  logRuleApplication(32, logMessage, true);
  return true;
}

////////////////////////////////////////////////////
/////////////  helper functions   ////////////////
////////////////////////////////////////////////////

let curatedTracklistTotalTime = 0;

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
  return curatedTracklist.some((track) => track[attribute] === value);
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

////////////////////////////////////////////////////
////////////////////////////////////////////////////
/////////////  isThisAValidTrack   ////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////

function followTracklistRules(tracklist) {
  const curatedTracklist = [];
  let prevTrack1 = null;
  let prevTrack2 = null;
  // Initialize index variables for iterating through the tracklist
  let currIndex = 0; // Used to loop through tracklist
  let trackIndex = 0; // Used to index curatedTracklist

  // Define general rule functions for phase 1
  const generalRuleFunctions = [
    r10,
    r11,
    r12,
    r13,
    r14,
    r15,
    r16,
    r17,
    r18,
    r19,
  ];

  // Define ensure and final check rules for phase 2
  const ensureRules = [r21, r22, r23, r24];
  const finalCheckRules = [r32];

  // Define closing track rules
  const closingTracksRules = [r11];

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Phase 1: Apply track-specific rules and general rules
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  for (let i = 0; i < 8; i++) {
    // Get the specific rule function based on index
    const ruleFunction = window["r" + (i + 61)];
    const description = `Rule ${i + 61} description`;

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

      // Log the application of the specific rule
      // logRuleApplication(ruleFunction.ruleNumber, description, isSpecificRuleApplied);

      // Check if the specific rule is met
      if (!isSpecificRuleApplied) {
        // console.log(`Specific rule failed for track: ${track.name}`);
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

  // const ALMOST_DONE_THRESHOLD_SECONDS = 800;
  // const NO_TIME_LEFT_THRESHOLD_SECONDS = 1;


// while the total time of the playlist is less than the actual time limit
  while (curatedTracklistTotalTime <= MAX_PLAYLIST_DURATION_SECONDS) {
    console.log("sss we still have time because the curatedTracklistTotalTime is " + curatedTracklistTotalTime + "and the MAX_PLAYLIST_DURATION_SECONDS is " + MAX_PLAYLIST_DURATION_SECONDS + " and the last track name is " + prevTrack1.name + " and the last track duration is " + prevTrack1.duration);
    const track = tracklist[currIndex]; // Get the track at the current index from the tracklist array

    // Decide which set of rules to apply based on the current total duration
    let rulesToApply;
    // while the total time of the playlist is less than the "almost done" time limit
    // todo: need to get more fine-tuned control over the last tracks that we add. 
    // currently the track might be very long and push us past our limit
    // I can do this by checking how long the track is

    if (curatedTracklistTotalTime < ALMOST_DONE_THRESHOLD_SECONDS) {
      console.log("sss we STILL have time because the curatedTracklistTotalTime is " + curatedTracklistTotalTime + "and the ALMOST_DONE_THRESHOLD_SECONDS is " + ALMOST_DONE_THRESHOLD_SECONDS + " and the last track name is " + prevTrack1.name + " and the last track duration is " + prevTrack1.duration);
      rulesToApply = finalCheckRules;
    } else {
      rulesToApply = ensureRules;
    }

    // Initialize a flag to track if any rule fails for the current track
    let ruleFailed = false;

    // Iterate through the selected set of rules (either final check or ensure rules)
    for (const rule of rulesToApply) {
      // Check if the current track violates the rule
      if (!rule(track, prevTrack1, prevTrack2, curatedTracklist, currIndex)) {
        console.log(`Ensure/Final rule failed for track: ${track.name}`);
        ruleFailed = true;
        break; // Exit the loop early since a rule has failed
      }

      // Apply general rule functions for the track
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
          ruleFailed = true;
          break; // Exit the loop early since a rule has failed
        }
      }
    }

    // If no rules have failed, add the track to the curated tracklist
    if (!ruleFailed) {
      addNextValidTrack(track, curatedTracklist, tracklist);
      calculateOrUpdateCuratedTracklistDuration(
        track,
        curatedTracklist
      );
      [prevTrack1, prevTrack2] = updatePrevTracks(
        track,
        prevTrack1,
        prevTrack2
      );
     
    }

    // Move to the next track in the tracklist for the next iteration
    currIndex++;
  }
  console.log("sss out of time because the curatedTracklistTotalTime is " + curatedTracklistTotalTime + "and the MAX_PLAYLIST_DURATION_SECONDS is " + MAX_PLAYLIST_DURATION_SECONDS);
  console.log("sss shifting to closing tracks now");

 






  //  // Search for closing tracks that meet conditions
  //  for (const track of tracklist) {
  //   let ruleFailed = false;

  //   // Iterate through closing track rules to check if any rule fails for the current track
  //   for (const rule of closingTracksRules) {
  //     if (!rule(track, prevTrack1, prevTrack2, curatedTracklist, currIndex)) {
  //       // If a closing track rule fails, mark the rule as failed and exit the loop
  //       ruleFailed = true;
  //       break; // Exit the loop since a rule has failed
  //     }
  //   }

  //   // If no closing track rules have failed, proceed to additional checks
  //   if (!ruleFailed) {
  //     // Iterate through general rule functions to perform additional checks
  //     for (const generalRule of generalRuleFunctions) {
  //       if (
  //         !generalRule(
  //           track,
  //           prevTrack1,
  //           prevTrack2,
  //           curatedTracklist,
  //           currIndex
  //         )
  //       ) {
  //         console.log(`General rule failed for track: ${track.name}`);
  //         ruleFailed = true;
  //         break; // Exit the loop since a rule has failed
  //       }
  //     }
  //   }

  //   // If both closing track rules and general rules have passed, add the track to curatedTracklist
  //   if (!ruleFailed) {
  //     addNextValidTrack(track, curatedTracklist, tracklist);
  //     calculateOrUpdateCuratedTracklistDuration(
  //       track,
  //       curatedTracklist
  //     );
  //     [prevTrack1, prevTrack2] = updatePrevTracks(
  //       track,
  //       prevTrack1,
  //       prevTrack2
  //     );
  //   }
  // }



  // console.log("Curated Tracklist:", curatedTracklist);

  // Return the final curated tracklist
  return curatedTracklist;
}

/* 9. shuffleTracklist takes a tracklist array as input, shuffles its elements
randomly, and returns the shuffled and modified tracklist. */

function shuffleTracklist(tracklist) {
  // Skip the first track and shuffle the rest of the tracks
  for (let i = tracklist.length - 1; i > 1; i--) {
    const j = Math.floor(Math.random() * (i - 1)) + 1; // Ensure j is at least 1
    [tracklist[i], tracklist[j]] = [tracklist[j], tracklist[i]];
  }
  return tracklist;
}

/* 10. fetchAndCacheAudio  takes an audioFileUrl and a cache object as input. The 
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

function displayDebugText(element, text, defaultText) {
  if (text && text !== "") {
    element.textContent = " " + text;
  } else {
    element.textContent = defaultText;
  }
}

function gatherAndPrintDebugInfo(song, index) {
  if (song) {
    // get debug ids so I can fill in debug info
    const currTrackNameHTMLElement = document.getElementById("currTrackName");
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
    const totalDurr = Math.floor(curatedTracklistTotalTime/60);
    const currName = song.name;
    const currCredit = song.credit;
    const ohcurrIndex = index;
    // creditstack defined elsewhere

    displayDebugText(currTrackNameHTMLElement, currName, "no name");
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
    itemElement.textContent =
      trackNumber +
      ". " +
      shuffledSongsWithOpen[i].name +
      "- " +
      shuffledSongsWithOpen[i].author +
      " (" +
      shuffledSongsWithOpen[i].duration +
      " seconds)";

    // itemElement.textContent =
    //   trackNumber +
    //   ". " +
    //   shuffledSongsWithOpen[i].name +
    //   ", " +
    //   shuffledSongsWithOpen[i].author +
    //   ", " +
    //   shuffledSongsWithOpen[i].form +
    //   ", " +
    //   shuffledSongsWithOpen[i].placement.join(", ") +
    //   ", " +
    //   shuffledSongsWithOpen[i].language +
    //   ", " +
    //   shuffledSongsWithOpen[i].sentiment +
    //   ", " +
    //   shuffledSongsWithOpen[i].tags.join(", ") +
    //   ", " +
    //   shuffledSongsWithOpen[i].backgroundMusic +
    //   ".";

    currTrackNameElement.appendChild(itemElement);
  }

  if (shuffledSongsWithOpen.length > 0) {
    currTrackNameElement.style.display = "block";
  } else {
    // console.log("no shuffle");
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

  const allSongs = [...SONGS]; // first we copy the array of songs
  const shuffledSongs = shuffleTracklist(allSongs); // next we shuffle it
  let curatedTracklist = followTracklistRules(shuffledSongs); // next we apply the rules and get our new curated tracklist

  const outro1 = outroAudioSounds.map(addAudioFromUrl);
  curatedTracklist.push(...outro1);

  let creditsTracklist = gatherTheCreditSongs(curatedTracklist);

  curatedTracklist.push(...creditsTracklist);

  const outro2 = finalOutroAudioSounds.map(addAudioFromUrl);
  curatedTracklist.push(...outro2);

  printEntireTracklistDebug(curatedTracklist);

  window.caches
    .open("audio-pre-cache")
    .then((cache) => queueNextTrack(curatedTracklist, 0, 0, cache));
});

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXX  TIMER  XXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// var timerInterval;
// var timerDuration;
// var remainingTime;

// Constants
// const MAX_PLAYLIST_DURATION_SECONDS = 1020;
// const ALMOST_DONE_THRESHOLD_SECONDS = 1010;
// const NO_TIME_LEFT_THRESHOLD_SECONDS = 1;

// Initialize variables
var totalDurationSeconds = MAX_PLAYLIST_DURATION_SECONDS;
var elapsedDurationSeconds = 0;
var remainingDurationSeconds = totalDurationSeconds;

/* 6. Set the value of the total_duration variable (in seconds). */
var totalDurationSeconds = MAXPLAYLISTDURATION;

// This function updates the progress timer displayed on the webpage.
// It takes the time in seconds and the previous duration as inputs.

/* updateProgressTimer(seconds, previousDuration): This function updates the progress timer 
displayed on the webpage. It takes the current time in seconds and the previous duration 
as input parameters. It performs the following steps:

It gets the HTML element with the ID "current-time," the element where the timer is displayed.
It checks if the "current-time" element exists. If it doesn't, it throws an error.

It calculates the remaining time until the end of the playlist by subtracting the current time 
and previous duration from the total duration.

It calculates the remaining minutes and, based on some conditions, either displays "done" 
if there's no time left or formats the remaining time in minutes and seconds and updates 
the "current-time" element.
*/

function updateProgressTimer(elapsedSeconds, previousDuration) {
  // Get the HTML element for displaying the current time
  let currentTimeElement = document.getElementById("current-time");

  // Throw an error if the current time element is missing
  if (!currentTimeElement) {
    throw new Error("Missing element: current-time");
  }

  // Calculate the remaining time until the end of the playlist
  let remainingDurationSeconds =
    totalDurationSeconds - (elapsedSeconds + previousDuration);
  let remainingDurationMinutes = Math.floor(remainingDurationSeconds / 60);

  // Check if there's no time left
  if (remainingDurationSeconds <= NO_TIME_LEFT_THRESHOLD_SECONDS) {
    console.log("out");
    currentTimeElement.innerHTML = "Done";
  } else if (remainingDurationSeconds <= ALMOST_DONE_THRESHOLD_SECONDS) {
    console.log("ALMOST out");
  } else {
    // Calculate remaining seconds and format the time display
    let remainingMinutes = Math.floor(remainingDurationSeconds / 60);
    let remainingSeconds = (remainingDurationSeconds % 60).toLocaleString(
      "en-US",
      {
        minimumIntegerDigits: 2,
        useGrouping: false,
      }
    );
    currentTimeElement.innerHTML = `${remainingMinutes}:${remainingSeconds}`;
  }
}

// Calculate the remaining time
function calculateRemainingTime(elapsedSeconds) {
  return totalDurationSeconds - elapsedSeconds;
}

function createTimerLoopAndUpdateProgressTimer(previousDuration) {
  var start = Date.now(); // Record the start time of the loop

  // Set up an interval to run the loop every 200 milliseconds
  // In the callback function, calculate the elapsed time in milliseconds since the start of the loop
  // and convert it to seconds.
  return setInterval(() => {
    let delta = Date.now() - start; // Calculate elapsed milliseconds
    let deltaSeconds = Math.floor(delta / 1000); // Convert milliseconds to seconds
    timerDuration = deltaSeconds + previousDuration; // Calculate the timer duration by adding the delta seconds to the previous duration.

    // Call the updateProgressTimer function to update the timer display based on the calculated timer
    // duration.
    updateProgressTimer(deltaSeconds, previousDuration);
    // Calculate remaining time using the calculateRemainingTime function
    remainingTime = calculateRemainingTime(timerDuration);
  }, 200); // Run the loop every 200 milliseconds
}
