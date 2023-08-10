var myLang = localStorage["lang"] || "defaultValue";
var player;
var audioContext = null;
var volumeNode = null;
// var previousVolume = "100";
var timerInterval;
var timerDuration;
var remainingTime;
let playerPlayState = "play";
// let muteState = "unmute";
let hasSkippedToEnd = false;
const MAXPLAYLISTDURATION = 410;
const EONSOFTIME = 400;
const SOMETIME = 200;
let eonsOfTimeLeft = true;
let someTimeLeft = true;
let noTimeLeft = true;
let first8RulesMet = false;

let creditStack;
let displayConsoleLog = "<br>";

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
      timerInterval = createTimerLoop(timerDuration);
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
  timerInterval = createTimerLoop(0);
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

/* 1. Define two functions: addAudioFromUrl and addAudioFromCredit. These functions take a song 
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

const addAudioFromCredit = (song) => {
  if (!song.credit) {
    console.log("song has no credit", song);
  }
  song.audio = createAudioElement(song.url);
  return song;
};

/* 2. Define an empty array creditsArray. */
let creditsArray = [];

/* 4. Define two more arrays outroAudioSounds and finalOutroAudioSounds, each containing an object
   representing an outro track. Again, each object is processed using the addAudioFromUrl function. */

const outroAudioSounds = [
  {
    name: "OUTRO_2.2",
    url: "./sounds/XX_OUTRO/OUTRO_2.2.mp3",
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
    name: "OUTRO_2.2",
    url: "./sounds/XX_OUTRO/OUTRO_2.2.mp3",
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

/* 6. Set the value of the total_duration variable (in seconds). */
var total_duration = MAXPLAYLISTDURATION;

/* 7. set how many seconds before a song is completed to pre-fetch the next song */
const PREFETCH_BUFFER_SECONDS = 8;

/* 8. followTracklistRules takes a tracklist array as input, applies certain
  rules to modify the tracklist, and returns the modified tracklist.
  */


  function getTheCreditStack(curatedTracklist) {
    const credits = curatedTracklist.map((item) =>
      item.credit.replace(/\.\/sounds\/XX_OUTRO\/NAMES\/NAMES_/g, "")
    );
    return credits.join(", ");
  }

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXX TRACKLIST CREATION XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// Helper function for isThisAValidTrack to check if a track exists with the given attribute and value in the curated tracklist
function trackExistsWithAttributes(curatedTracklist, attribute, value) {
  return curatedTracklist.some((track) => track[attribute] === value);
}

function updateLogDisplay() {
  const logElement = document.getElementById("displayConsoleLog");
  logElement.innerHTML = displayConsoleLog;
}

// Helper function for logging rules
function logRuleApplication(ruleNumber, description, isApplied) {
  const ruleStatus = isApplied ? "applied" : "broken";
  console.log(`Track ${ruleNumber} Rules ${ruleStatus}: ${description}`);
  displayConsoleLog += `→ Track ${ruleNumber} Rules ${ruleStatus}: ${description}<br>`;
  updateLogDisplay();
}


function checkAndLogRule(condition, message) {
  if (!condition) {
    displayConsoleLog += `→ ${message}<br>`;
    updateLogDisplay();
    return false;
  }
  return true;
}

////////////////////////////////////////////////////
/////////////  isThisAValidTrack   ////////////////
////////////////////////////////////////////////////

// Updated function to check if a track is valid based on the new rules.
function isThisAValidTrack(track, prevTrack1, prevTrack2, curatedTracklist) {
  const index = curatedTracklist.length;

  //  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  //  XXXXXXXX GENERAL RULES XXXXXXXXXX
  //  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

  // Rule: No more than two tracks from the same author in a tracklist.
  const authorCount = curatedTracklist
    .filter((t) => t.author.trim() !== "") // Filter out tracks with blank authors
    .filter((t) => t.author === track.author).length;

  if (authorCount >= 2) {
    console.log(
      `Track skipped (${track.name}): No more than two tracks from the same author (this author ${track.author}).`
    );
    return false;
  }

  // Rule: Tracks with the form shorts and the language musical can never follow tracks with the form music.
  if (
    track.form === "shorts" &&
    track.language === "musical" &&
    curatedTracklist.some((prevTrack) => prevTrack.form === "music")
  ) {
    console.log(
      `Track skipped (${track.name}): Tracks with form 'shorts' and language 'musical' (this track's form ${track.form} and (${track.language}) cannot follow tracks with form 'music' (last track's form ${prevTrack1.form}).`
    );
    return false;
  }

  // Rule: Tracks with the form music can never follow tracks with both the form shorts and the language musical.
  if (
    track.form === "music" &&
    curatedTracklist.some(
      (prevTrack) =>
        prevTrack.form === "shorts" && prevTrack.language === "musical"
    )
  ) {
    console.log(
      `Track skipped (${track.name}): Tracks with form 'music' (this track's form  ${track.form}) cannot follow tracks with form 'shorts' and language 'musical' (last track's form ${prevTrack1.form} and language ${prevTrack1.language}).`
    );
    return false;
  }

  // Rule: The value for backgroundMusic should never be the same as the author of the track right before it or the immediately following track.
  const nextTrack = curatedTracklist[curatedTracklist.length - 1];
  if (
    (prevTrack1 &&
      prevTrack1.author.trim() !== "" &&
      track.backgroundMusic.trim() !== "" &&
      track.backgroundMusic === prevTrack1.author) ||
    (nextTrack &&
      nextTrack.author.trim() !== "" &&
      track.backgroundMusic.trim() !== "" &&
      track.backgroundMusic === nextTrack.author)
  ) {
    console.log(
      `Track skipped (${track.name}): The value for backgroundMusic (this track's ${track.backgroundMusic}) should never match the author of the track before or after (last track's ${prevTrack1.author}).`
    );
    return false;
  }

  // Rule: If a track has the sentiment heavy, then the track right before it cannot have the laughter tag.
  if (
    track.sentiment === "heavy" &&
    prevTrack1 &&
    prevTrack1.tags.includes("laughter")
  ) {
    console.log(
      `Track skipped (${track.name}): If a track has sentiment 'heavy' (this track's ${track.sentiment}), the track before cannot have 'laughter' tag (last track's ${prevTrack1.tags}).`
    );
    return false;
  }

  // Rule: If a track has the length long and the form music, then the immediately preceding track should have the form interview.
  if (
    track.length === "long" &&
    track.form === "music" &&
    prevTrack1 &&
    prevTrack1.form !== "interview"
  ) {
    console.log(
      `Rule ENFORCED (${track.name}): If a track has length 'long' (this track's length ${track.length}) and form 'music' (this track's form ${track.form}), the preceding track should have form 'interview' (last track's ${prevTrack1.form}).`
    );
    return false;
  }

  // Rule: If any of the tracks I_KIM_03, I_KIM_04, or I_KIM_05 are added to the tracklist,
  // none of the other two tracks should be added to the tracklist.
  const forbiddenTracks = ["I_KIM_03", "I_KIM_04", "I_KIM_05"];
  if (
    forbiddenTracks.includes(track.name) &&
    curatedTracklist.some((t) => forbiddenTracks.includes(t.name))
  ) {
    console.log(
      `Track skipped (${track.name}): If any of the tracks I_KIM_03, I_KIM_04, or I_KIM_05 are added, the others should not be.`
    );
    return false;
  }

  // Rule: If there is one track with the author SARAH and the form Interview in the tracklist,
  // there should not be any more tracks with the author SARAH and the form Interview in the tracklist.
  if (
    track.author === "SARAH" &&
    track.form === "Interview" &&
    trackExistsWithAttributes(curatedTracklist, "author", "SARAH") &&
    trackExistsWithAttributes(curatedTracklist, "form", "Interview")
  ) {
    console.log(
      `Track skipped (${track.name}): If there is a track with author 'SARAH' (this track's ${track.author}) and form 'Interview' (this track's ${track.form}), no more such tracks should be added.`
    );
    return false;
  }

  // Rule: If there is one track with the author LOUELLA in the tracklist,
  // there should not be any more tracks with the author LOUELLA in the tracklist.
  if (
    track.author === "LOUELLA" &&
    trackExistsWithAttributes(curatedTracklist, "author", "LOUELLA")
  ) {
    console.log(
      `Track skipped (${track.name}): If there is a track with author 'LOUELLA' (this track's author ${track.author}), no more tracks with that author should be added.`
    );
    return false;
  }

  ////////////////////////////////////////////////////
  ///~~~~~   create our base tracks  ~~~~~~~~////
  ////////////////////////////////////////////////////

  // Rule only for Track 1: The 1st track should have the tag 'intro'.
  if (index === 0 && !track.tags.includes("intro")) {
    console.log("Track 1 Rule: The 1st track should have the tag 'intro'.");
    return false;
  }
  // Rule only for Track 2: The 2nd track should have the placement 'beginning'.
  if (index === 1 && !track.placement.includes("beginning")) {
    console.log(
      "Track 2 Rule: The 2nd track should have the placement 'beginning'."
    );
    return false;
  }
  // Rule only for Track 3: The 3rd track should have the placement 'beginning' and a different form than the 2nd track.
  if (index === 2) {
    if (!track.placement.includes("beginning")) {
      console.log(
        "Track 3 Rule: The 3rd track should have the placement 'beginning'."
      );
      return false;
    }
    if (track.form === prevTrack1.form) {
      console.log(
        "Track 3 Rule: The 3rd track should have a different form than the 2nd track."
      );
      return false;
    }
  }
  // Rule only for Track 4: The 4th track should have the placement 'middle' and a different form than the 3rd track.
  if (index === 3) {
    if (!track.placement.includes("middle")) {
      console.log(
        "Track 4 Rule: The 4th track should have the placement 'middle'."
      );
      return false;
    }
    if (track.form === prevTrack1.form) {
      console.log(
        "Track 4 Rule: The 4th track should have a different form than the 3rd track."
      );
      return false;
    }
  }
  // Rule only for Track 5: The 5th track should have the length 'short', not have the placement 'beginning', and have a different language than the 4th track.
  if (index === 4) {
    if (track.length !== "short") {
      console.log(
        "Track 5 Rule: The 5th track should have the length 'short'."
      );
      return false;
    }
    if (track.placement.includes("beginning")) {
      console.log(
        "Track 5 Rule: The 5th track should not have the placement 'beginning'."
      );
      return false;
    }
    if (track.language === prevTrack1.language) {
      console.log(
        "Track 5 Rule: The 5th track should have a different language than the 4th track."
      );
      return false;
    }
  }
  // Rule only for Track 6: The 6th track should have the placement 'middle' and a different form than the 5th track.
  if (index === 5) {
    if (!track.placement.includes("middle")) {
      console.log(
        "Track 6 Rule: The 6th track should have the placement 'middle'."
      );
      return false;
    }
    if (track.form === prevTrack1.form) {
      console.log(
        "Track 6 Rule: The 6th track should have a different form than the 5th track."
      );
      return false;
    }
  }
  // Rule only for Track 7: The 7th track should have the placement 'middle', a different form than the 6th track, and unless the form of the 7th track is 'MUSIC', it must also have a different language from the 6th track.
  if (index === 6) {
    if (!track.placement.includes("middle")) {
      console.log(
        "Track 7 Rule: The 7th track should have the placement 'middle'."
      );
      return false;
    }
    if (track.form === prevTrack1.form) {
      console.log(
        "Track 7 Rule: The 7th track should have a different form than the 6th track."
      );
      return false;
    }
    if (track.form !== "MUSIC" && track.language === prevTrack1.language) {
      console.log(
        "Track 7 Rule: Unless the form is 'MUSIC', the 7th track should have a different language from the 6th track."
      );
      return false;
    }
  }
  // Rule only for Track 8: The 8th track should have the placement 'middle', a different form than the 6th and 7th tracks,and a different language than the 6th and 7th tracks.
  if (index === 7) {
    if (!track.placement.includes("middle")) {
      console.log(
        "Track 8 Rule: The 8th track should have the placement 'middle'."
      );
      return false;
    }
    if (track.form === prevTrack1.form || track.form === prevTrack2.form) {
      console.log(
        "Track 8 Rule: The 8th track should have a different form than the 6th and 7th tracks."
      );
      return false;
    }
    if (
      track.language === prevTrack1.language ||
      track.language === prevTrack2.language
    ) {
      console.log(
        "Track 8 Rule: The 8th track should have a different language than the 6th and 7th tracks."
      );
      return false;
    }
  }

  ////////////////////////////////////////////////////
  ///~~~~~  if we have our base tracks  ~~~~~~~~/////
  ////////////////////////////////////////////////////

  if (curatedTracklist.length >= 9) {
    const makeSureWeHaveAlbertRule = checkAndLogRule(
      trackExistsWithAttributes(curatedTracklist, "author", "ALBERT") ||
        track.author === "ALBERT",
      "no albert"
    );

    const makeSureWeHaveAnInterviewRule = checkAndLogRule(
      trackExistsWithAttributes(curatedTracklist, "form", "interview") ||
        track.form === "interview",
      `Skipping ${track.name}, ${track.form} because we need an interview`
    );

    const makeSureWeHaveMusicRule = checkAndLogRule(
      trackExistsWithAttributes(curatedTracklist, "form", "music") ||
        track.form === "music",
      `Skipping ${track.name}, ${track.form} because we need music`
    );

    const ifWeHave1Kiko2KikoRule =
      trackExistsWithAttributes(curatedTracklist, "author", "KIKO") &&
      trackExistsWithAttributes(curatedTracklist, "form", "interview");

    const ifWeHave1Goose2GeeseRule = trackExistsWithAttributes(
      curatedTracklist,
      "tags",
      "geese"
    );

    if (ifWeHave1Kiko2KikoRule) {
      if (
        track.author === "KIKO" &&
        (track.form === "music" || track.form === "short")
      ) {
        console.log("KIKO Interview Rule: Track added as a related track.");
      } else {
        console.log(
          "KIKO Interview Rule: Track not added. Another related KIKO track is required."
        );
        return false; // Exit the function and indicate it's an invalid track
      }
    }

    if (ifWeHave1Goose2GeeseRule) {
      if (track.tags.includes("geese")) {
        console.log("Geese Tag Rule: Track added as a related track.");
      } else {
        console.log(
          "Geese Tag Rule: Track not added. Another track with the 'geese' tag is required."
        );
        return false; // Exit the function and indicate it's an invalid track
      }
    }
  }
  return true;
}

function addNextValidTrack(curatedTracklist, tracklist) {
  const nextValidTrackIndex = curatedTracklist.length;

  const myPrevTrack1 =
    nextValidTrackIndex > 0 ? curatedTracklist[nextValidTrackIndex - 1] : null;
  const myPrevTrack2 =
    nextValidTrackIndex > 1 ? curatedTracklist[nextValidTrackIndex - 2] : null;
  let tracksSearched = 0;

  const nextValidTrack = tracklist.find((track) => {
    tracksSearched++;
    return isThisAValidTrack(
      track,
      myPrevTrack1,
      myPrevTrack2,
      curatedTracklist
    );
  });

  if (nextValidTrack) {
    curatedTracklist.push(nextValidTrack);
    const indexToRemove = tracklist.indexOf(nextValidTrack);
    if (indexToRemove !== -1) {
      // console.log("remove " + indexToRemove + " ~ " + nextValidTrack.name);
      tracklist.splice(indexToRemove, 1); // Remove the track from tracklist.
    }
    // console.log(`Searched through ${tracksSearched} tracks.`);
    return nextValidTrack;
  } else {
    const tracksNotSearched = tracklist.length - tracksSearched;
    // console.log("No valid track found!!!");
    // console.log(`Searched through ${tracksSearched} tracks.`);
    // console.log(`Didn't search through ${tracksNotSearched} tracks.`);
    return null;
  }
}

// Rule 1 - The 1st track should have the tag standardIntro.
function reportOnRule1(curatedTracklist, tracklist, prevTrack1, prevTrack2) {
  const r1Track = addNextValidTrack(curatedTracklist, tracklist);
  let msg = `The 1st track → has the tag intro: (${r1Track.tags}); name: ${r1Track.name}`;
  console.log(`prevTrack1: ${prevTrack1}`);
  console.log(`prevTrack2: ${prevTrack2}`);

  if (!r1Track) {
    logRuleApplication(1, "No valid track found for Rule 1.", false);
    return {
      success: false,
      message: "No valid track found for Rule 1.",
    };
  } else if (r1Track && !r1Track.tags.includes("intro")) {
    logRuleApplication(1, msg, false);
    return {
      success: false,
      message: msg,
    };
  } else {
    // Since Rule 1 is the first rule, there are no previous tracks
    // prevTrack1 = null;
    // prevTrack2 = null;
    logRuleApplication(1, msg, true);
    return {
      success: true,
      message: msg,
      updatedPrevTrack1: r1Track, // Update prevTrack1 for the next rule
      updatedPrevTrack2: null, // No change to prevTrack2
    };
  }
}

// Rule 2 - The 2nd track should have the placement beginning.
function reportOnRule2(curatedTracklist, tracklist, prevTrack1, prevTrack2) {
  const r2Track = addNextValidTrack(curatedTracklist, tracklist);
  let msg = `The 2nd track → has the placement beginning: (${r2Track.placement}); name: ${r2Track.name}`;
  console.log(`prevTrack1 name: ${prevTrack1.name}`);
  console.log(`prevTrack2 name: ${prevTrack2}`);

  // console.log(`prevTrack1: ${prevTrack1}`);
  // console.log(`prevTrack1 name: ${prevTrack1.name}`);
  // console.log(`prevTrack2 name: ${prevTrack2.name}`);

  // console.log(`prevTrack2: ${prevTrack2}`);

  if (!r2Track) {
    logRuleApplication(2, "No valid track found for Rule 2.", false);
    return {
      success: false,
      message: "No valid track found for Rule 2.",
    };
  } else if (r2Track && !r2Track.placement.includes("beginning")) {
    logRuleApplication(2, msg, false);
    return {
      success: false,
      message: msg,
    };
  } else {
    // Since Rule 2 is the second rule, there is only one previous track
    prevTrack2 = prevTrack1;
    prevTrack1 = r2Track;

    logRuleApplication(2, msg, true);
    return {
      success: true,
      message: msg,
      updatedPrevTrack1: prevTrack1,
      updatedPrevTrack2: prevTrack2,
    };
  }
}

// Rule 3 - The 3rd track should have the placement beginning and a different form from the 2nd track.
function reportOnRule3(curatedTracklist, tracklist, prevTrack1, prevTrack2) {
  const r3Track = addNextValidTrack(curatedTracklist, tracklist);
  let msg = `The 3rd track → has the placement beginning (${r3Track.placement}); and a different form (${r3Track.form}); than the 2nd track (${prevTrack1.form}); name: ${r3Track.name};`;
  // console.log(`prevTrack1: ${prevTrack1}`);
  // console.log(`prevTrack2: ${prevTrack2}`);
  console.log(`prevTrack1 name: ${prevTrack1.name}`);
  console.log(`prevTrack2 name: ${prevTrack2.name}`);

  if (!r3Track) {
    logRuleApplication(3, msg, false);
    return {
      success: false,
      message: msg,
    };
  } else if (
    !r3Track.placement.includes("beginning") ||
    r3Track.form === prevTrack1.form
  ) {
    console.log(
      `SAME FORM prevTrack1 form: ${prevTrack1.form} vs my form: ${r3Track.form}`
    );

    logRuleApplication(3, msg, false);
    return {
      success: false,
      message: msg,
    };
  } else {
    // For Rule 3, both prevTrack1 and prevTrack2 will be updated
    prevTrack2 = prevTrack1;
    prevTrack1 = r3Track;

    logRuleApplication(3, msg, true);
    return {
      success: true,
      message: msg,
      updatedPrevTrack1: prevTrack1,
      updatedPrevTrack2: prevTrack2,
    };
  }
}

// Rule 4 - The 4th track should have the placement middle and a different form from the 3rd track.
function reportOnRule4(curatedTracklist, tracklist, prevTrack1, prevTrack2) {
  const r4Track = addNextValidTrack(curatedTracklist, tracklist);
  let msg = `The 4th track → has the placement middle (${r4Track.placement}); and a different form (${r4Track.form}); from the 3rd track (${prevTrack1.form}); name: ${r4Track.name};`;
  console.log(`prevTrack1 name: ${prevTrack1.name}`);
  console.log(`prevTrack2 name: ${prevTrack2.name}`);

  if (!r4Track) {
    logRuleApplication(4, "No valid track found for Rule 4.", false);
    return {
      success: false,
      message: "No valid track found for Rule 4.",
    };
  } else if (
    !r4Track.placement.includes("middle") ||
    r4Track.form === prevTrack1.form
  ) {
    logRuleApplication(4, msg, false);
    return {
      success: false,
      message:
        "The 4th track should have the placement middle and a different form from the 3rd track.",
    };
  } else {
    // For Rule 4, both prevTrack1 and prevTrack2 will be updated
    prevTrack2 = prevTrack1;
    prevTrack1 = r4Track;

    logRuleApplication(4, msg, true);
    return {
      success: true,
      message: msg,
      updatedPrevTrack1: prevTrack1,
      updatedPrevTrack2: prevTrack2,
    };
  }
}

// Rule 5 - The 5th track should have the length short and should NOT have the placement beginning and should have a different language from the 4th track.
function reportOnRule5(curatedTracklist, tracklist, prevTrack1, prevTrack2) {
  const r5Track = addNextValidTrack(curatedTracklist, tracklist);
  let msg = `The 5th track → has the length short (${r5Track.length}); and should NOT have the placement beginning (${r5Track.placement}); and does not have the same language (${r5Track.language}) as the 4th track (${prevTrack1.language}); name: ${r5Track.name};`;
  console.log(`prevTrack1 name: ${prevTrack1.name}`);
  console.log(`prevTrack2 name: ${prevTrack2.name}`);

  if (!r5Track) {
    logRuleApplication(5, "No valid track found for Rule 5.", false);
    return {
      success: false,
      message: "No valid track found for Rule 5.",
    };
  } else if (
    r5Track.length !== "short" ||
    r5Track.placement.includes("beginning") ||
    r5Track.language === prevTrack1.language
  ) {
    logRuleApplication(5, msg, false);
    return {
      success: false,
      message: msg,
    };
  } else {
    prevTrack2 = prevTrack1;
    prevTrack1 = r5Track;

    logRuleApplication(5, msg, true);
    return {
      success: true,
      message: msg,
      updatedPrevTrack1: prevTrack1,
      updatedPrevTrack2: prevTrack2,
    };
  }
}

// Rule 6 -  "The 6th track should have the placement MIDDLE, and should have a different form from the 5th track.".
function reportOnRule6(curatedTracklist, tracklist, prevTrack1, prevTrack2) {
  const r6Track = addNextValidTrack(curatedTracklist, tracklist);
  let msg = `The 6th track → has the placement MIDDLE (${r6Track.placement}); and has a different form (${r6Track.form}) vs the 5th track (${prevTrack1.form}); name: ${r6Track.name};`;
  console.log(`prevTrack1 name: ${prevTrack1.name}`);
  console.log(`prevTrack2 name: ${prevTrack2.name}`);

  if (!r6Track) {
    logRuleApplication(6, "No valid track found for Rule 6.", false);
    return {
      success: false,
      message: "No valid track found for Rule 6.",
    };
  } else if (
    r6Track &&
    r6Track.placement.includes("middle") &&
    r6Track.form === prevTrack1.form
  ) {
    logRuleApplication(6, msg, false);
    return {
      success: false,
      message: "ugh." + msg,
    };
  } else {
    prevTrack2 = prevTrack1;
    prevTrack1 = r6Track;

    logRuleApplication(6, msg, true);
    return {
      success: true,
      message: msg,
      updatedPrevTrack1: prevTrack1,
      updatedPrevTrack2: prevTrack2,
    };
  }
}

function reportOnRule7(curatedTracklist, tracklist, prevTrack1, prevTrack2) {
  const r7Track = addNextValidTrack(curatedTracklist, tracklist);
  console.log(`prevTrack1 name: ${prevTrack1.name}`);
  console.log(`prevTrack2 name: ${prevTrack2.name}`);
  if (!r7Track) {
    logRuleApplication(7, "No valid track found for Rule 7.", false);
    console.log("No valid track found for Rule 7.");
    return {
      success: false,
      message: "No valid track found for Rule 7.",
    };
  }

  const msg = `The 7th track → has the placement MIDDLE (${r7Track.placement}); and has a different form (${r7Track.form}) vs the 6th track: (${prevTrack1.form}); AND unless the form of the 7th track is MUSIC (${r7Track.form}), the 7th track also has a different language (${r7Track.language}) from the 6th track (${prevTrack1.language}); name: ${r7Track.name};`;

  let conditionFailed = null;

  if (!r7Track.placement.includes("middle")) {
    conditionFailed = "Condition 1 (placement)";
  } else if (r7Track.form === prevTrack1.form) {
    conditionFailed = "Condition 2 (form)";
  } else if (
    r7Track.form !== "MUSIC" &&
    r7Track.language === prevTrack1.language
  ) {
    conditionFailed = "Condition 3 (language)";
  }

  if (conditionFailed) {
    console.log("Condition for Rule 7 failed:", conditionFailed);

    logRuleApplication(7, msg, false);
    return {
      success: false,
      message: "No " + msg,
    };
  } else {
    prevTrack2 = prevTrack1;
    prevTrack1 = r7Track;

    logRuleApplication(7, msg, true);
    return {
      success: true,
      message: msg,
      updatedPrevTrack1: prevTrack1,
      updatedPrevTrack2: prevTrack2,
    };
  }
}
// Rule 8 - The 8th track should have the placement MIDDLE, and should have a different form from the 6th and 7th tracks, and a different language from the 6th and 7th tracks.
function reportOnRule8(curatedTracklist, tracklist, prevTrack1, prevTrack2) {
  const r8Track = addNextValidTrack(curatedTracklist, tracklist);
  let msg = `The 8th track → has the placement MIDDLE (${r8Track.placement}); and a different form (${r8Track.form}) vs the 7th track (${prevTrack1.form}) or 6th track (${prevTrack2.form}); and has a different language (${r8Track.language}) vs the 7th track (${prevTrack1.language}) or the 6th track (${prevTrack2.language}); name: ${r8Track.name};`;

  console.log(
    `this track name: ${r8Track.name} ${r8Track.form} ${r8Track.language}`
  );
  console.log(
    `prevTrack1 name: ${prevTrack1.name} ${prevTrack1.form} ${prevTrack1.language}`
  );
  console.log(
    `prevTrack2 name: ${prevTrack2.name} ${prevTrack2.form} ${prevTrack2.language}`
  );

  const hasMiddlePlacement = r8Track.placement.includes("middle");
  const hasSameFormAsPrevTrack1 =
    r8Track.form === prevTrack1.form || r8Track.form === prevTrack2.form;
  const hasSameLanguageAsPrevTrack1 =
    r8Track.language === prevTrack1.language ||
    r8Track.language === prevTrack2.language;

  if (!r8Track) {
    console.log("Rule 8 Step 1: No valid track found for Rule 8.");
    logRuleApplication(8, "No valid track found for Rule 8.", false);
    return {
      success: false,
      message: "No valid track found for Rule 8.",
    };
  } else if (!hasMiddlePlacement) {
    console.log(
      "Rule 8 Step 2: Rule conditions not met: hasDifferentPlacement."
    );
    logRuleApplication(8, msg, false);
    return {
      success: false,
      message: msg,
    };
  } else if (hasSameFormAsPrevTrack1) {
    console.log(
      "Rule 8 Step 2: Rule conditions not met: hasSameFormAsPrevTrack1 or 2."
    );
    logRuleApplication(8, msg, false);
    return {
      success: false,
      message: msg,
    };
  } else if (hasSameLanguageAsPrevTrack1) {
    console.log(
      "Rule 8 Step 2: Rule conditions not met: hasSameLanguageAsPrevTrack1 or 2."
    );
    logRuleApplication(8, msg, false);
    return {
      success: false,
      message: msg,
    };
  } else {
    console.log("Rule 8 Step 3: Rule successfully applied.");
    prevTrack2 = prevTrack1;
    prevTrack1 = r8Track;

    logRuleApplication(8, msg, true);
    return {
      success: true,
      message: msg,
      updatedPrevTrack1: prevTrack1,
      updatedPrevTrack2: prevTrack2,
    };
  }
}

// Rule 9 More Tracks -
function reportOnRuleMoreTracks(
  curatedTracklist,
  tracklist,
  prevTrack1,
  prevTrack2
) {
  const anotherTrack = addNextValidTrack(curatedTracklist, tracklist);
  let msg = anotherTrack
    ? `Adding another track! (${anotherTrack.name})`
    : "No valid track found for Rule 9.";
  // console.log(`prevTrack1 name: ${prevTrack1.name}`);
  // console.log(`prevTrack2 name: ${prevTrack2.name}`);
  if (!anotherTrack) {
    logRuleApplication(
      9,
      "No valid track found for applyRuleMoreTracks",
      false
    );
    return {
      success: false,
      message: "No valid track found for Rule 9.",
    };
  } else {
    prevTrack2 = prevTrack1;
    prevTrack1 = anotherTrack;

    logRuleApplication(9, msg, true);
    return {
      success: true,
      message: msg,
      updatedPrevTrack1: prevTrack1,
      updatedPrevTrack2: prevTrack2,
    };
  }
}

function followTracklistRules(tracklist) {
  let curatedTracklist = [];
  let prevTrack1 = null;
  let prevTrack2 = null;

  const rules = [
    reportOnRule1,
    reportOnRule2,
    reportOnRule3,
    reportOnRule4,
    reportOnRule5,
    reportOnRule6,
    reportOnRule7,
    reportOnRule8,
  ];

  for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
    const ruleFunction = rules[ruleIndex];
    const result = ruleFunction(
      curatedTracklist,
      tracklist,
      prevTrack1,
      prevTrack2
    );

    if (result.success) {
      // Assign the updated values to prevTrack1 and prevTrack2
      prevTrack1 =
        result.updatedPrevTrack1 !== undefined
          ? result.updatedPrevTrack1
          : prevTrack1;
      prevTrack2 =
        result.updatedPrevTrack2 !== undefined
          ? result.updatedPrevTrack2
          : prevTrack2;

      // console.log(`Rule ${ruleIndex + 1} applied successfully.`);
    } else {
      console.log(
        `RULE FAILED!! Rule ${ruleIndex + 1} not applicable: ${result.message}`
      );
      break; // Stop applying rules if one rule fails
    }
  }

  // Add 10 more tracks using addNextValidTrack
  for (let i = 0; i < 10; i++) {
    const result = reportOnRuleMoreTracks(
      curatedTracklist,
      tracklist,
      prevTrack1,
      prevTrack2
    );

    if (result.success) {
      // Assign the updated values to prevTrack1 and prevTrack2
      prevTrack1 =
        result.updatedPrevTrack1 !== undefined
          ? result.updatedPrevTrack1
          : prevTrack1;
      prevTrack2 =
        result.updatedPrevTrack2 !== undefined
          ? result.updatedPrevTrack2
          : prevTrack2;

      // console.log(`Rule ${ruleIndex + 1} applied successfully.`);
    } else {
      console.log(`RULE FAILED!! Rule 9 not applicable: ${result.message}`);
      break; // Stop applying rules if one rule fails
    }
  }

  creditStack = getTheCreditStack(curatedTracklist);

  // iii
  console.log("Curated Tracklist:", curatedTracklist);
  return curatedTracklist;
}

/* 9. shuffleTracklist takes a tracklist array as input, shuffles its elements
randomly, and returns the shuffled and modified tracklist. */

function shuffleTracklist(tracklist) {
  for (let i = tracklist.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
    // const displayConsoleLogHTMLElement = document.getElementById("displayConsoleLog");
    const currCreditHTMLElement = document.getElementById("currCredit");
    const currIndexNokHTMLElement = document.getElementById("indexNo");
    const currCreditStackHTMLElement = document.getElementById("creditsStack");
    // const currTotalIndexHTMLElement = document.getElementById("totalIndex");

    // get the info for THIS song so I can print it to the debug
    const currTags = song.tags;
    const currUrl = song.url;
    const currDurr = song.duration;
    const currName = song.name;
    const currCredit = song.credit;
    const currIndex = index;
    // creditstack defined elsewhere

    displayDebugText(currTrackNameHTMLElement, currName, "no name");
    displayDebugText(currURLHTMLElement, currUrl, "no url");
    displayDebugText(currTagsHTMLElement, currTags, "no tags");
    displayDebugText(currDurrHTMLElement, currDurr, "no duration");
    // displayDebugText(displayConsoleLogHTMLElement, displayConsoleLog, "no log");
    displayDebugText(currCreditHTMLElement, currCredit, "no credit");
    displayDebugText(currCreditStackHTMLElement, creditStack, "no credit");
    displayDebugText(currIndexNokHTMLElement, currIndex, "no index");
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
      ", " +
      shuffledSongsWithOpen[i].author +
      ", " +
      shuffledSongsWithOpen[i].form +
      ", " +
      shuffledSongsWithOpen[i].placement.join(", ") +
      ", " +
      shuffledSongsWithOpen[i].language +
      ", " +
      shuffledSongsWithOpen[i].sentiment +
      ", " +
      shuffledSongsWithOpen[i].tags.join(", ") +
      ", " +
      shuffledSongsWithOpen[i].backgroundMusic +
      ".";

    currTrackNameElement.appendChild(itemElement);
  }

  if (shuffledSongsWithOpen.length > 0) {
    currTrackNameElement.style.display = "block";
  } else {
    // console.log("no shuffle");
  }
}

/* 

Are we out of time? If yes, it's time to play the final tracks 
    There could be some kind of trigger point when I hit a certain amount of time remaining (only do this once!)
    (if total_duration - currentRuntime <= 90???) where I trigger or add the  outroAudioSounds
*/

function calculateRemainingTime(currentRuntime) {
  return total_duration - currentRuntime;
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
  let shuffledWithRulesAppliedTracklist = followTracklistRules(shuffledSongs); // next we apply the rules and get our new curated tracklist
  // next we add the intro to the beginning -- I'm doing this in the rules right now
  // const shuffledSongsWithOpen = [...introTracks, ...shuffledSongs];
  const shuffledSongsWithOpen = [...shuffledWithRulesAppliedTracklist];

  printEntireTracklistDebug(shuffledSongsWithOpen); // print the whole tracklist

  window.caches
    .open("audio-pre-cache")
    .then((cache) => queueNextTrack(shuffledSongsWithOpen, 0, 0, cache));
});

// This function updates the progress timer displayed on the webpage.
// It takes the time in seconds and the previous duration as inputs.
function updateProgressTimer(seconds, previousDuration) {
  // Get the HTML element for displaying the current time
  let currTime = document.getElementById("current-time");

  // Throw an error if the current time element is missing
  if (!currTime) {
    throw new Error("Missing element: current-time");
  }

  // Calculate the remaining time until the end of the playlist
  let remaining = total_duration - (seconds + previousDuration);
  let minutes = Math.floor(remaining / 60);

  // If time has run out, display "done"
  if (remaining <= 0) {
    currTime.innerHTML = "done";
  } else {
    // Calculate remaining seconds and format the time display
    let remainingSeconds = (remaining % 60).toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });
    currTime.innerHTML = `${minutes}:${remainingSeconds}`;
  }
}

// This function creates a loop that updates the progress timer at intervals.
function createTimerLoop(previousDuration) {
  var start = Date.now(); // Record the start time of the loop

  // Set up an interval to run the loop every 200 milliseconds
  return setInterval(() => {
    let delta = Date.now() - start; // Calculate elapsed milliseconds
    let deltaSeconds = Math.floor(delta / 1000); // Convert milliseconds to seconds
    let timerDuration = deltaSeconds + previousDuration; // Calculate the timer duration

    updateProgressTimer(deltaSeconds, previousDuration); // Update the timer display

    // Calculate remaining time using the calculateRemainingTime function
    remainingTime = calculateRemainingTime(timerDuration);

    // console.log("remainingTime " + remainingTime);
    // console.log("EONSOFTIME" + EONSOFTIME);

    // Update flags based on remaining time
    if (remainingTime <= EONSOFTIME && eonsOfTimeLeft) {
      console.log("timer entered");
      eonsOfTimeLeft = false;
      // Trigger other actions for eons of time left
    }

    if (remainingTime <= SOMETIME && someTimeLeft) {
      someTimeLeft = false;
      // Trigger other actions for some time left
    }

    if (remainingTime <= 0 && noTimeLeft) {
      noTimeLeft = false;
      // Trigger other actions for no time left
    }

    // Perform other actions based on remaining time if needed
  }, 200); // Run the loop every 200 milliseconds
}

// // This function updates the progress timer displayed on the webpage.
// // It takes the time in seconds and the previous duration as inputs.
// function updateProgressTimer(seconds, previousDuration) {
//   // Get the HTML element for displaying the current timehttps://www.reddit.com/r/graphic_design/?f=flair_name%3A%22Asking%20Question%20(Rule%204)%22
//   let currTime = document.getElementById("current-time");

//   // Throw an error if the current time element is missing
//   if (!currTime) {
//     throw new Error("Missing element: current-time");
//   }

//   // Calculate the total timer duration by adding seconds and previous duration
//   timerDuration = seconds + previousDuration;

//   // If the current time element exists
//   if (currTime == null) {
//     // Do nothing, there might be a delay when the player is initialized
//   } else {
//     // Calculate the remaining time until the end of the playlist
//     let remaining = total_duration - (seconds + previousDuration);
//     let minutes = Math.floor(remaining / 60);

//     // let eonsOfTimeLeft = true;
//     // let someTimeLeft = true;
//     // let noTimeLeft = true;

//     // If time has run out, display "done"
//     if (remaining <= 0) {
//       currTime.innerHTML = "done";
//     } else {
//       // Calculate remaining seconds and format the time display
//       let remainingSeconds = (remaining % 60).toLocaleString("en-US", {
//         minimumIntegerDigits: 2,
//         useGrouping: false,
//       });
//       currTime.innerHTML = `${minutes}:${remainingSeconds}`;
//     }
//   }
// }

// // This function creates a loop that updates the progress timer at intervals.
// function createTimerLoop(previousDuration) {
//   var start = Date.now(); // Record the start time of the loop

//   // Set up an interval to run the loop every 200 milliseconds
//   return setInterval(() => {
//     let delta = Date.now() - start; // Calculate elapsed milliseconds
//     let deltaSeconds = Math.floor(delta / 1000); // Convert milliseconds to seconds
//     updateProgressTimer(deltaSeconds, previousDuration); // Update the timer display

//     // Update the timerDuration variable with elapsed time
//     timerDuration = deltaSeconds + previousDuration;

//     // Calculate remaining time using the calculateRemainingTime function
//     remainingTime = calculateRemainingTime(timerDuration);

//     // Log the remaining time to the console
//     // console.log("Remaining time:", remainingTime);

//     // Perform other actions based on remaining time if needed

//   }, 200); // Run the loop every 200 milliseconds
// }

window.addEventListener("load", (event) => {
  // Create a div element to hold the output
  const outputContainer = document.createElement("div");
  outputContainer.id = "errorBox"; // Set the id attribute

  // Add content to the output container
  //   outputContainer.innerHTML = `
  //   <p class="debugHeader">Test Results</p>
  //   <p>Songs raw length: ${SONGSRAW.length}</p>
  // `;

  // Get the target container where you want to add the output
  const targetContainer = document.getElementById("debugdiv");

  // Append the output container to the target container
  targetContainer.appendChild(outputContainer);
});
