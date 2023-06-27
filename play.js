/*
Make a playlist generator

It needs to follow a number of rules about which tracks are first and last and which kinds of tracks follow other kinds of tracks.

*/

window.addEventListener("load", (event) => {
  var myLang = localStorage["lang"] || "defaultValue";
  var player;
  var audioContext = null;
  var volumeNode = null;
  // var previousVolume = "100";
  var timerInterval;
  var timerDuration;
  let playerPlayState = "play";
  // let muteState = "unmute";
  let hasSkippedToEnd = false;
  const MAXPLAYLISTDURATION = 1080;

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

      musicPlayerh1.innerHTML = "Thank you for joining us";
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
    document.getElementById("textTranscript").remove();
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

  /* 1. Define two functions: addAudioFromUrl and addAudioFromCredit. These functions take a song 
  object as input, create an audio element for the song's URL, assign it to the song.audio property, 
  and return the modified song object.*/

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

  /* 2. Define an array introTracks containing an object representing an intro track. Each object 
  in the array is processed using the addAudioFromUrl function. */
  const introTracks = [
    {
      name: "intro",
      url: "./sounds/00_INTRO/INTRO1V2.mp3",
      duration: 113,
      medium: "special",
      tags: ["intro"],
      credit: "",
    },
  ].map(addAudioFromUrl);

  /* Define an empty array creditsArray. */
  let creditsArray = [];

  /* 4. Define two more arrays outroAudioSounds and finalOutroAudioSounds, each containing an object
   representing an outro track. Again, each object is processed using the addAudioFromUrl function. */

  const outroAudioSounds = [
    {
      name: "outro",
      url: "./sounds/XX_OUTRO/OUTRO2PT1SOLO.mp3",
      duration: 99,
      medium: "special",
      tags: ["outro"],
      credit: "",
    },
  ].map(addAudioFromUrl);

  const finalOutroAudioSounds = [
    {
      name: "outroBGMusic",
      url: "./sounds/XX_OUTRO/OUTRO2PT2SOLO.mp3",
      duration: 60,
      medium: "special",
      tags: ["outro"],
      credit: "",
    },
  ].map(addAudioFromUrl);

  /* 5. Define an array SONGS containing multiple song objects. Each song object is processed using 
the addAudioFromUrl function.
 */

  const SONGS = [
    {
      name: "M_TURKWAZ_02",
      url: "./sounds/MUSIC/M_TURKWAZ_02.mp3",
      duration: 395,
      medium: "typeMusic",
      tags: [
        "Long",
        "Middle",
        "Verbal",
        "Moderate",
        "Sound",
        "Home",
        "Nature",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/TURKWAZ.mp3",
    },
    {
      name: "M_TURKWAZ_03",
      url: "./sounds/MUSIC/M_TURKWAZ_03.mp3",
      duration: 319,
      medium: "typeMusic",
      tags: [
        "Long",
        "Middle",
        "Verbal",
        "Heavy",
        "Nature",
        "Home",
        "Wellness",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/TURKWAZ.mp3",
    },
    {
      name: "M_TURKWAZ_01",
      url: "./sounds/MUSIC/M_TURKWAZ_01.mp3",
      duration: 384,
      medium: "typeMusic",
      tags: [
        "Long",
        "Beginning",
        "Middle",
        "End",
        "Verbal",
        "Moderate",
        "Sound",
        "Home",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/TURKWAZ.mp3",
    },
    {
      name: "M_TURKWAZ_04",
      url: "./sounds/MUSIC/M_TURKWAZ_04.mp3",
      duration: 111,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "Verbal",
        "Light",
        "Sound",
        "Nature",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/TURKWAZ.mp3",
    },
    {
      name: "M_TURKWAZ_10",
      url: "./sounds/MUSIC/M_TURKWAZ_10.mp3",
      duration: 160,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "Verbal",
        "Moderate",
        "Sound",
        "Home",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/TURKWAZ.mp3",
    },
    {
      name: "M_DEMI_08",
      url: "./sounds/MUSIC/M_DEMI_08.mp3",
      duration: 75,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "Non-Verbal",
        "Moderate",
        "Sound",
        "Home",
        "Vibration",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "M_TURKWAZ_05",
      url: "./sounds/MUSIC/M_TURKWAZ_05.mp3",
      duration: 247,
      medium: "typeMusic",
      tags: [
        "Long",
        "Middle",
        "Verbal",
        "Light",
        "Sound",
        "Nature",
        "Home",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/TURKWAZ.mp3",
    },
    {
      name: "M_KIKO_B_03",
      url: "./sounds/MUSIC/M_KIKO_B_03.mp3",
      duration: 113,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "Non-Verbal",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
        "Listening",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "M_KIKO_Z_02",
      url: "./sounds/MUSIC/M_KIKO_Z_02.mp3",
      duration: 158,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "Non-Verbal",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
        "Listening",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "M_KIKO_B_02",
      url: "./sounds/MUSIC/M_KIKO_B_02.mp3",
      duration: 148,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "Non-Verbal",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
        "Listening",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "M_KIKO_Z_01",
      url: "./sounds/MUSIC/M_KIKO_Z_01.mp3",
      duration: 77,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "Non-Verbal",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
        "Listening",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "M_KIKO_B_01",
      url: "./sounds/MUSIC/M_KIKO_B_01.mp3",
      duration: 162,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "Non-Verbal",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
        "Listening",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "M_KIKO_S_02",
      url: "./sounds/MUSIC/M_KIKO_S_02.mp3",
      duration: 63,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "Non-Verbal",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
        "Listening",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "M_DEMI_13",
      url: "./sounds/MUSIC/M_DEMI_13.mp3",
      duration: 102,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "Non-Verbal",
        "Moderate",
        "Sound",
        "Home",
        "Vibration",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "M_DEMI_06",
      url: "./sounds/MUSIC/M_DEMI_06.mp3",
      duration: 111,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "Non-Verbal",
        "Moderate",
        "Sound",
        "Home",
        "Vibration",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "M_CHARLOTTE_16",
      url: "./sounds/MUSIC/M_CHARLOTTE_16.mp3",
      duration: 68,
      medium: "typeMusic",
      tags: [
        "Medium",
        "End",
        "Middle",
        "Verbal",
        "Moderate",
        "Wellness",
        "Home",
        "Nature",
        "Wetland",
        "Unselfing",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_CHARLOTTE_14",
      url: "./sounds/MUSIC/M_CHARLOTTE_14.mp3",
      duration: 76,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "End",
        "Verbal",
        "Moderate",
        "Wellness",
        "Nature",
        "Wetland",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_DEMI_11",
      url: "./sounds/MUSIC/M_DEMI_11.mp3",
      duration: 87,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "Verbal",
        "Moderate",
        "Sound",
        "Home",
        "Vibration",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "M_DEMI_05",
      url: "./sounds/MUSIC/M_DEMI_05.mp3",
      duration: 34,
      medium: "typeMusic",
      tags: [
        "Short",
        "Middle",
        "Non-Verbal",
        "Moderate",
        "Sound",
        "Home",
        "Vibration",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "M_TURKWAZ_09",
      url: "./sounds/MUSIC/M_TURKWAZ_09.mp3",
      duration: 241,
      medium: "typeMusic",
      tags: ["Long", "Middle", "Verbal", "Light", "Sound", "Home", "Ancestors"],
      credit: "./sounds/XX_OUTRO/NAMES/TURKWAZ.mp3",
    },
    {
      name: "M_CHARLOTTE_15",
      url: "./sounds/MUSIC/M_CHARLOTTE_15.mp3",
      duration: 60,
      medium: "typeMusic",
      tags: ["Short", "End", "Verbal", "Moderate", "Home", "Nature", "Wetland"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_CHARLOTTE_11",
      url: "./sounds/MUSIC/M_CHARLOTTE_11.mp3",
      duration: 94,
      medium: "typeMusic",
      tags: [
        "Short",
        "Middle",
        "End",
        "Verbal",
        "Moderate",
        "Sound",
        "Home",
        "Listening",
        "Wetland",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_KIKO_C_06",
      url: "./sounds/MUSIC/M_KIKO_C_06.mp3",
      duration: 79,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "Non-Verbal",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
        "Listening",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "M_CHARLOTTE_10",
      url: "./sounds/MUSIC/M_CHARLOTTE_10.mp3",
      duration: 130,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "End",
        "Verbal",
        "Moderate",
        "Home",
        "Wellness",
        "Nature",
        "Wetland",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_CHARLOTTE_12",
      url: "./sounds/MUSIC/M_CHARLOTTE_12.mp3",
      duration: 141,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "End",
        "Verbal",
        "Moderate",
        "Home",
        "Ancestors",
        "Wetland",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_DEMI_02",
      url: "./sounds/MUSIC/M_DEMI_02.mp3",
      duration: 45,
      medium: "typeMusic",
      tags: [
        "Short",
        "Middle",
        "Non-Verbal",
        "Moderate",
        "Sound",
        "Home",
        "Vibration",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "M_DEMI_03",
      url: "./sounds/MUSIC/M_DEMI_03.mp3",
      duration: 42,
      medium: "typeMusic",
      tags: [
        "Short",
        "Middle",
        "Non-Verbal",
        "Moderate",
        "Sound",
        "Home",
        "Vibration",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "M_CHARLOTTE_13",
      url: "./sounds/MUSIC/M_CHARLOTTE_13.mp3",
      duration: 146,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "End",
        "Verbal",
        "Moderate",
        "Wellness",
        "Wetland",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_KIKO_C_05",
      url: "./sounds/MUSIC/M_KIKO_C_05.mp3",
      duration: 61,
      medium: "typeMusic",
      tags: [
        "Medium",
        "Middle",
        "Non-Verbal",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
        "Listening",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "P_ALBERT_15",
      url: "./sounds/POETRY/P_ALBERT_15.mp3",
      duration: 110,
      medium: "typePoem",
      tags: [
        "Medium",
        "Middle",
        "Verbal",
        "Light",
        "Moderate",
        "Nature",
        "Trees",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_01",
      url: "./sounds/POETRY/P_ALBERT_01.mp3",
      duration: 57,
      medium: "typePoem",
      tags: [
        "Short",
        "Middle",
        "Verbal",
        "Heavy",
        "Nature",
        "Home",
        "Trees",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_14",
      url: "./sounds/POETRY/P_ALBERT_14.mp3",
      duration: 127,
      medium: "typePoem",
      tags: [
        "Medium",
        "Middle",
        "Verbal",
        "Heavy",
        "Nature",
        "Home",
        "Trees",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_02",
      url: "./sounds/POETRY/P_ALBERT_02.mp3",
      duration: 268,
      medium: "typePoem",
      tags: [
        "Long",
        "Middle",
        "Verbal",
        "Heavy",
        "Nature",
        "Wellness",
        "Home",
        "Ancestors",
        "Unselfing",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_16",
      url: "./sounds/POETRY/P_ALBERT_16.mp3",
      duration: 27,
      medium: "typePoem",
      tags: [
        "Short",
        "Beginning",
        "Middle",
        "End",
        "Verbal",
        "Moderate",
        "Wellness",
        "Nature",
        "Trees",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_17",
      url: "./sounds/POETRY/P_ALBERT_17.mp3",
      duration: 62,
      medium: "typePoem",
      tags: [
        "Medium",
        "Beg",
        "Mid",
        "End",
        "Verbal",
        "Light",
        "Moderate",
        "Nature",
        "Home",
        "Sound",
        "Trees",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_03",
      url: "./sounds/POETRY/P_ALBERT_03.mp3",
      duration: 41,
      medium: "typePoem",
      tags: [
        "Short",
        "Beginning",
        "Middle",
        "End",
        "Verbal ",
        "Moderate",
        "Wellness",
        "Sound",
        "Home",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_07",
      url: "./sounds/POETRY/P_ALBERT_07.mp3",
      duration: 36,
      medium: "typePoem",
      tags: [
        "Short",
        "Middle",
        "Verbal",
        "Heavy",
        "Nature",
        "Home",
        "Wellness",
        "Sound",
        "Unselfing",
        "Ancestors",
        "Listening",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_13",
      url: "./sounds/POETRY/P_ALBERT_13.mp3",
      duration: 73,
      medium: "typePoem",
      tags: [
        "Medium",
        "Middle",
        "Verbal",
        "Moderate",
        "Nature",
        "Wellness",
        "Trees",
        "Unselfing",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_12",
      url: "./sounds/POETRY/P_ALBERT_12.mp3",
      duration: 48,
      medium: "typePoem",
      tags: [
        "Short",
        "Beg",
        "Middle",
        "Verbal",
        "Moderate",
        "Home",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_06",
      url: "./sounds/POETRY/P_ALBERT_06.mp3",
      duration: 45,
      medium: "typePoem",
      tags: [
        "Short",
        "Beg",
        "End",
        "Verbal",
        "Heavy",
        "Sound",
        "Home",
        "Wellness",
        "Ancestors",
        "Vibration",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_10",
      url: "./sounds/POETRY/P_ALBERT_10.mp3",
      duration: 23,
      medium: "typePoem",
      tags: [
        "Short",
        "Middle",
        "Verbal",
        "Heavy",
        "Home",
        "Sound",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_04",
      url: "./sounds/POETRY/P_ALBERT_04.mp3",
      duration: 53,
      medium: "typePoem",
      tags: [
        "Short",
        "Middle",
        "Verbal ",
        "Heavy",
        "Wellness",
        "Home",
        "Nature",
        "Sound",
        "Ancestors",
        "Trees",
        "Unselfing",
        "Listening",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_05",
      url: "./sounds/POETRY/P_ALBERT_05.mp3",
      duration: 38,
      medium: "typePoem",
      tags: [
        "Short",
        "Middle",
        "Verbal ",
        "Heavy",
        "Nature",
        "Home",
        "Trees",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_11",
      url: "./sounds/POETRY/P_ALBERT_11.mp3",
      duration: 89,
      medium: "typePoem",
      tags: [
        "Medium",
        "Middle",
        "End",
        "Verbal",
        "Moderate",
        "Home",
        "Sound",
        "Wellness",
        "Ancestors",
        "Listening",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_08",
      url: "./sounds/POETRY/P_ALBERT_08.mp3",
      duration: 49,
      medium: "typePoem",
      tags: [
        "Short",
        "Middle",
        "Verbal",
        "Moderate",
        "Nature",
        "Wellness",
        "Trees",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_NAMITHA_03",
      url: "./sounds/POETRY/P_NAMITHA_03.mp3",
      duration: 30,
      medium: "typePoem",
      tags: ["Short", "Middle", "Verbal", "Heavy", "Nature", "Wellness", ""],
      credit: "./sounds/XX_OUTRO/NAMES/NAMITHA.mp3",
    },
    {
      name: "P_NAMITHA_02",
      url: "./sounds/POETRY/P_NAMITHA_02.mp3",
      duration: 55,
      medium: "typePoem",
      tags: [
        "Short",
        "Middle",
        "Verbal",
        "Moderate",
        "Nature",
        "Home",
        "Sound",
        "Vibration",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/NAMITHA.mp3",
    },
    {
      name: "P_ALBERT_09",
      url: "./sounds/POETRY/P_ALBERT_09.mp3",
      duration: 36,
      medium: "typePoem",
      tags: ["Short", "Middle", "End", "Verbal", "Heavy", "Nature", "Wellness"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_NAMITHA_01",
      url: "./sounds/POETRY/P_NAMITHA_01.mp3",
      duration: 47,
      medium: "typePoem",
      tags: ["Short", "Middle", "Verbal", "Light", "Moderate", "Nature", ""],
      credit: "./sounds/XX_OUTRO/NAMES/NAMITHA.mp3",
    },
    {
      name: "P_NAMITHA_05",
      url: "./sounds/POETRY/P_NAMITHA_05.mp3",
      duration: 29,
      medium: "typePoem",
      tags: [
        "Short",
        "Beg",
        "Middle",
        "Verbal",
        "Heavy",
        "Home",
        "Nature",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/NAMITHA.mp3",
    },
    {
      name: "P_NAMITHA_04",
      url: "./sounds/POETRY/P_NAMITHA_04.mp3",
      duration: 26,
      medium: "typePoem",
      tags: [
        "Short",
        "Middle",
        "Verbal",
        "Heavy",
        "Nature",
        "Trees",
        "Home",
        "Ancestors",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/NAMITHA.mp3",
    },
    {
      name: "P_NAMITHA_06",
      url: "./sounds/POETRY/P_NAMITHA_06.mp3",
      duration: 11,
      medium: "typePoem",
      tags: [
        "Short",
        "Middle",
        "Verbal",
        "Moderate",
        "Nature",
        "Wellness",
        "Sound",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/NAMITHA.mp3",
    },
    {
      name: "P_ALBERT_18",
      url: "./sounds/POETRY/P_ALBERT_18.mp3",
      duration: 64,
      medium: "typePoem",
      tags: [
        "Medium",
        "Middle",
        "End",
        "Verbal",
        "Moderate",
        "Nature",
        "Wellness",
        "Home",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "S_KIKO_S_04",
      url: "./sounds/SHORTS/S_KIKO_S_04.mp3",
      duration: 36,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Music",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "S_KIKO_S_03",
      url: "./sounds/SHORTS/S_KIKO_S_03.mp3",
      duration: 36,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Music",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "S_KIKO_S_02",
      url: "./sounds/SHORTS/S_KIKO_S_02.mp3",
      duration: 28,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Music",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "S_BIRDS_17",
      url: "./sounds/SHORTS/S_BIRDS_17.mp3",
      duration: 64,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_BIRDS_03",
      url: "./sounds/SHORTS/S_BIRDS_03.mp3",
      duration: 71,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_DEMI_16",
      url: "./sounds/SHORTS/S_DEMI_16.mp3",
      duration: 22,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "End",
        "Music",
        "Light",
        "Sound",
        "Home",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "S_KIKO_C_01",
      url: "./sounds/SHORTS/S_KIKO_C_01.mp3",
      duration: 54,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Music",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "S_DEMI_17",
      url: "./sounds/SHORTS/S_DEMI_17.mp3",
      duration: 11,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "End",
        "Music",
        "Light",
        "Sound",
        "Home",
        "Ancestors",
      ],
      credit: "",
    },
    // {
    //   name: "S_CHARLOTTE_09",
    //   url: "./sounds/SHORTS/S_CHARLOTTE_09.mp3",
    //   duration: 22,
    //   medium: "typeShort", tags: ["Short", "Middle", "Verbal", "Light", "Nature", "Wetlands"],
    //   credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    // },
    {
      name: "S_BIRDS_02",
      url: "./sounds/SHORTS/S_BIRDS_02.mp3",
      duration: 84,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_BIRDS_16",
      url: "./sounds/SHORTS/S_BIRDS_16.mp3",
      duration: 32,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_BIRDS_14",
      url: "./sounds/SHORTS/S_BIRDS_14.mp3",
      duration: 73,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_DEMI_15",
      url: "./sounds/SHORTS/S_DEMI_15.mp3",
      duration: 10,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "End",
        "Music",
        "Light",
        "Sound",
        "Home",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "S_KIKO_C_02",
      url: "./sounds/SHORTS/S_KIKO_C_02.mp3",
      duration: 37,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Music",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "S_DEMI_14",
      url: "./sounds/SHORTS/S_DEMI_14.mp3",
      duration: 14,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "End",
        "Music",
        "Light",
        "Sound",
        "Home",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "S_BIRDS_15",
      url: "./sounds/SHORTS/S_BIRDS_15.mp3",
      duration: 35,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_BIRDS_01",
      url: "./sounds/SHORTS/S_BIRDS_01.mp3",
      duration: 96,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_BIRDS_05",
      url: "./sounds/SHORTS/S_BIRDS_05.mp3",
      duration: 66,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_BIRDS_11",
      url: "./sounds/SHORTS/S_BIRDS_11.mp3",
      duration: 41,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_BIRDS_10",
      url: "./sounds/SHORTS/S_BIRDS_10.mp3",
      duration: 65,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_BIRDS_04",
      url: "./sounds/SHORTS/S_BIRDS_04.mp3",
      duration: 60,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_BIRDS_12",
      url: "./sounds/SHORTS/S_BIRDS_12.mp3",
      duration: 31,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_BIRDS_06",
      url: "./sounds/SHORTS/S_BIRDS_06.mp3",
      duration: 88,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_BIRDS_07",
      url: "./sounds/SHORTS/S_BIRDS_07.mp3",
      duration: 92,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_BIRDS_13",
      url: "./sounds/SHORTS/S_BIRDS_13.mp3",
      duration: 56,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_DEMI_23",
      url: "./sounds/SHORTS/S_DEMI_23.mp3",
      duration: 21,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "End",
        "Music",
        "Light",
        "Sound",
        "Home",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "S_CHARLOTTE_01",
      url: "./sounds/SHORTS/S_CHARLOTTE_01.mp3",
      duration: 74,
      medium: "typeShort",
      tags: [
        "Medium",
        "End",
        "Verbal",
        "Moderate",
        "Nature",
        "Wellness",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_KIKO_C_09",
      url: "./sounds/SHORTS/S_KIKO_C_09.mp3",
      duration: 41,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Music",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "S_DEMI_22",
      url: "./sounds/SHORTS/S_DEMI_22.mp3",
      duration: 22,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "End",
        "Music",
        "Light",
        "Sound",
        "Home",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "S_LAUGHING_01",
      url: "./sounds/SHORTS/S_LAUGHING_01.mp3",
      duration: 15,
      medium: "typeShort",
      tags: ["Short", "Middle", "Non-Verbal", "Light", "Sound", "Wellness", ""],
      credit: "",
    },
    {
      name: "S_BIRDS_09",
      url: "./sounds/SHORTS/S_BIRDS_09.mp3",
      duration: 46,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_DEMI_20",
      url: "./sounds/SHORTS/S_DEMI_20.mp3",
      duration: 22,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "End",
        "Music",
        "Light",
        "Sound",
        "Home",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "S_CHARLOTTE_02",
      url: "./sounds/SHORTS/S_CHARLOTTE_02.mp3",
      duration: 25,
      medium: "typeShort",
      tags: [
        "Short",
        "Beginning",
        "Middle",
        "Verbal",
        "Light",
        "Nature",
        "Wetlands",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_CHARLOTTE_03",
      url: "./sounds/SHORTS/S_CHARLOTTE_03.mp3",
      duration: 31,
      medium: "typeShort",
      tags: ["Short", "Middle", "Verbal", "Light", "Nature", "Wetlands"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_DEMI_21",
      url: "./sounds/SHORTS/S_DEMI_21.mp3",
      duration: 10,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "End",
        "Music",
        "Light",
        "Sound",
        "Home",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "S_LAUGHING_02",
      url: "./sounds/SHORTS/S_LAUGHING_02.mp3",
      duration: 28,
      medium: "typeShort",
      tags: ["Short", "Middle", "Non-Verbal", "Light", "Sound", "Wellness", ""],
      credit: "",
    },
    {
      name: "S_BIRDS_08",
      url: "./sounds/SHORTS/S_BIRDS_08.mp3",
      duration: 57,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_BIRDS_18",
      url: "./sounds/SHORTS/S_BIRDS_18.mp3",
      duration: 63,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Non-Human",
        "Light",
        "Nature",
        "Sound",
        "Wetlands",
        "Listening",
      ],
      credit: "",
    },
    {
      name: "S_CHARLOTTE_07",
      url: "./sounds/SHORTS/S_CHARLOTTE_07.mp3",
      duration: 41,
      medium: "typeShort",
      tags: ["Short", "Middle", "Verbal", "Light", "Nature", "Wetlands"],
      credit: "",
    },
    {
      name: "S_DEMI_19",
      url: "./sounds/SHORTS/S_DEMI_19.mp3",
      duration: 15,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "End",
        "Music",
        "Light",
        "Sound",
        "Home",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "S_DEMI_18",
      url: "./sounds/SHORTS/S_DEMI_18.mp3",
      duration: 21,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "End",
        "Music",
        "Light",
        "Sound",
        "Home",
        "Ancestors",
      ],
      credit: "",
    },
    {
      name: "S_KIKO_B_04",
      url: "./sounds/SHORTS/S_KIKO_B_04.mp3",
      duration: 21,
      medium: "typeShort",
      tags: [
        "Short",
        "Middle",
        "Music",
        "Moderate",
        "Sound",
        "Wellness",
        "Vibration",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "I_JAYNE_02",
      url: "./sounds/INTERVIEWS/I_JAYNE_02.mp3",
      duration: 79,
      medium: "typeInterview",
      tags: [
        "Interview",
        "Medium",
        "Middle",
        "Verbal",
        "Light",
        "Nature",
        "Informative",
        "Unselfing",
      ],
      credit: "",
    },
    {
      name: "I_JAYNE_03",
      url: "./sounds/INTERVIEWS/I_JAYNE_03.mp3",
      duration: 149,
      medium: "typeInterview",
      tags: [
        "Interview",
        "Medium",
        "Middle",
        "Verbal",
        "Light",
        "Nature",
        "Sound",
        "Informative",
        "Vibration",
        "Unselfing",
      ],
      credit: "",
    },
    {
      name: "I_JAYNE_01",
      url: "./sounds/INTERVIEWS/I_JAYNE_01.mp3",
      duration: 226,
      medium: "typeInterview",
      tags: [
        "Interview",
        "Long",
        "Middle",
        "Verbal",
        "Light",
        "Nature",
        "Sound",
        "Informative",
        "Vibration",
      ],
      credit: "",
    },
    {
      name: "I_LOUELLA_02",
      url: "./sounds/INTERVIEWS/I_LOUELLA_02.mp3",
      duration: 140,
      medium: "typeInterview",
      tags: [
        "Interview",
        "Medium",
        "Middle",
        "Verbal",
        "Moderate",
        "Nature",
        "Home",
        "Wellness ",
        "Unselfing",
        "Ancestors",
        "Wetland",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/LOUELLA.mp3",
    },
    {
      name: "I_ELLEN_02_TempMusic",
      url: "./sounds/INTERVIEWS/I_ELLEN_02_TempMusic.mp3",
      duration: 133,
      medium: "typeInterview",
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/ELLEN.mp3",
    },
    {
      name: "I_LOUELLA_03",
      url: "./sounds/INTERVIEWS/I_LOUELLA_03.mp3",
      duration: 198,
      medium: "typeInterview",
      tags: [
        "Interview",
        "Long",
        "Middle",
        "Verbal",
        "Moderate",
        "Wellness",
        "Nature",
        "Informative",
        "Trees",
        "Listening",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/LOUELLA.mp3",
    },
    {
      name: "I_LOUELLA_01",
      url: "./sounds/INTERVIEWS/I_LOUELLA_01.mp3",
      duration: 237,
      medium: "typeInterview",
      tags: [
        "Interview",
        "Long",
        "Middle",
        "Verbal",
        "Moderate",
        "Sound",
        "Wellness",
        "Informative",
        "Nature",
        "Trees",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/LOUELLA.mp3",
    },
    {
      name: "I_KIKO_02",
      url: "./sounds/INTERVIEWS/I_KIKO_02.mp3",
      duration: 247,
      medium: "typeInterview",
      tags: [
        "Interview",
        "Long",
        "End",
        "Verbal",
        "Heavy",
        "Sound",
        "Wellness",
        "Listening",
        "Vibration",
        "Unselfing",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "I_KIKO_03",
      url: "./sounds/INTERVIEWS/I_KIKO_03.mp3",
      duration: 174,
      medium: "typeInterview",
      tags: [
        "Interview",
        "Long",
        "Middle",
        "Verbal",
        "Moderate",
        "Sound",
        "Wellness",
        "Listening",
        "Vibration",
        "Unselfing",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "I_KIKO_01",
      url: "./sounds/INTERVIEWS/I_KIKO_01.mp3",
      duration: 233,
      medium: "typeInterview",
      tags: [
        "Interview",
        "Long",
        "Middle",
        "Verbal",
        "Moderate",
        "Sound",
        "Wellness",
        "Listening",
        "Vibration",
        "Unselfing",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "I_ELLEN_01_TempMusic",
      url: "./sounds/INTERVIEWS/I_ELLEN_01_TempMusic.mp3",
      duration: 172,
      medium: "typeInterview",
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/ELLEN.mp3",
    },
    {
      name: "I_JESSE_01",
      url: "./sounds/INTERVIEWS/I_JESSE_01.mp3",
      duration: 229,
      medium: "typeInterview",
      tags: [
        "Interview",
        "Long",
        "End",
        "Middle",
        "Verbal",
        "Heavy",
        "Sound",
        "Nature",
        "Wellness",
        "Informative",
        "Wetlands",
        "Listening",
        "Unselfing",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/JESSE.mp3",
    },
    {
      name: "I_ELLEN_03",
      url: "./sounds/INTERVIEWS/I_ELLEN_03.mp3",
      duration: 244,
      medium: "typeInterview",
      tags: [
        "Interview",
        "Long",
        "Middle",
        "Verbal",
        "Moderate",
        "Home",
        "Sound",
        "Informative",
        "Unselfing",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ELLEN.mp3",
    },
    {
      name: "I_SAM_01",
      url: "./sounds/INTERVIEWS/I_SAM_01.mp3",
      duration: 137,
      medium: "typeInterview",
      tags: [
        "Interview",
        "Medium",
        "Middle",
        "Verbal",
        "Light",
        "Nature",
        "Informative",
        "Wetlands",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/SAM.mp3",
    },
    {
      name: "I_ELLEN_04",
      url: "./sounds/INTERVIEWS/I_ELLEN_04.mp3",
      duration: 154,
      medium: "typeInterview",
      tags: [
        "Interview",
        "Medium",
        "Beginning",
        "Middle",
        "End",
        "Verbal",
        "Light",
        "Sound",
        "Nature",
        "Listening",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ELLEN.mp3",
    },
    {
      name: "I_ELLEN_05",
      url: "./sounds/INTERVIEWS/I_ELLEN_05.mp3",
      duration: 151,
      medium: "typeInterview",
      tags: [
        "Interview",
        "Medium",
        "Beginning",
        "Middle",
        "Verbal",
        "Light",
        "Sound",
        "Wellness",
        "Vibration",
      ],
      credit: "./sounds/XX_OUTRO/NAMES/ELLEN.mp3",
    },
  ].map(addAudioFromUrl);

  // amount of time selected for the walk in seconds

  // let total_duration = parseInt(
  //   document.getElementById("total-duration").value
  // );

  /* 6. Set the value of the total_duration variable (in seconds). */
  var total_duration = MAXPLAYLISTDURATION;

  /* 7. Define PREFETCH_BUFFER_SECONDS (how many seconds before a song is completed that we 
  should pre-fetch the next song */
  const PREFETCH_BUFFER_SECONDS = 8;

  /* 8. followTracklistRules takes a tracklist array as input and applies certain
  rules to modify the tracklist. The function does the following:

  * Moves an object with the tag "Beginning" to the beginning of the tracklist.
  * Moves all objects with the tag "Long" to the end of the tracklist.
  * Checks for forbidden tag combinations and prints an error message if found.
  * Modifies the tracklist by adding an intro track at the beginning and an end object at the end.
  * Returns the modified tracklist.
  */

  function followTracklistRules(tracklist) {
    // Move an object with the tag "Beginning" to the beginning of the tracklist.
    let beginningObject = tracklist.find((obj) =>
      obj.tags.includes("Beginning")
    );
    if (beginningObject) {
      tracklist.splice(tracklist.indexOf(beginningObject), 1);
      tracklist.unshift(beginningObject);
    }

    // Moves all objects with the tag "Long" to the end of the tracklist. Is this even what I want?
    let longObjects = tracklist.filter((obj) => obj.tags.includes("Long"));

    if (longObjects.length > 0) {
      const longTitles = longObjects.map((obj) =>
        obj.title && typeof obj.title === "string" ? obj.title : "Untitled"
      );
      longObjects.forEach((obj) => {
        const index = tracklist.indexOf(obj);
        tracklist.splice(index, 1);
        // console.log(`Moved "${obj.name}" to the end of the tracklist`);
      });
      tracklist.push(...longObjects);
      // console.log(`Moved ${longObjects.length} "Long" objects to the end of the tracklist`);
    }

    // Checks for forbidden tag combinations and prints an error message if found.
    // if a list item has a "Heavy" tag, it should not be followed by an object with a "Laughing" tag
    for (let i = 0; i < tracklist.length - 1; i++) {
      let currentObj = tracklist[i];
      let nextObj = tracklist[i + 1];
      if (
        currentObj.tags.includes("Heavy") &&
        nextObj.tags.includes("Laughing")
      ) {
        console.log(
          `Error: "${currentObj.name}" object with "Heavy" tag is followed by "${nextObj.name}" object with "Laughing" tag`
        );
      }
    }

    // findme

    // // start the newrules logic
    // function sortTracklist(tracklist) {
    //   let lastPoemOrInterviewIndex = -1;
    //   let lastShortOrMusicIndex = -1;

    //   for (let i = 0; i < tracklist.length; i++) {
    //     if (tracklist[i].medium === 'typePoem' || tracklist[i].medium === 'typeInterview') {
    //       if (lastShortOrMusicIndex > lastPoemOrInterviewIndex) {
    //         const temp = tracklist[i];
    //         tracklist.splice(i, 1);
    //         tracklist.splice(lastShortOrMusicIndex + 1, 0, temp);
    //         lastPoemOrInterviewIndex = lastShortOrMusicIndex + 1;
    //         i--;
    //       } else {
    //         lastPoemOrInterviewIndex = i;
    //       }
    //     } else if (tracklist[i].medium === 'typeShort' || tracklist[i].medium === 'typeMusic') {
    //       if (lastPoemOrInterviewIndex > lastShortOrMusicIndex) {
    //         const temp = tracklist[i];
    //         tracklist.splice(i, 1);
    //         tracklist.splice(lastPoemOrInterviewIndex + 1, 0, temp);
    //         lastShortOrMusicIndex = lastPoemOrInterviewIndex + 1;
    //         i--;
    //       } else {
    //         lastShortOrMusicIndex = i;
    //       }
    //     } else {
    //       console.error('Invalid medium value: ' + tracklist[i].medium);
    //     }
    //   }
    //   return(tracklist);
    // }
    // // tracklist.push({ title: "New Song", medium: "typeMusic" });
    // // sortTracklist(tracklist);

    // // end the newrules logic

    let durationSum = 0;
    let objectsToRemove = [];
    let indexToRemove = -1;
    let endObject = null;

    // Store the end object separately, if present
    for (let i = 0; i < tracklist.length; i++) {
      const object = tracklist[i];
      if (object.tags.includes("End") && !object.tags.includes("Start")) {
        endObject = object;
        durationSum += endObject.duration; // add duration of end object
        break;
      } else {
        // console.log(
        //   `Warning: Found multiple "End" objects in tracklist. Using first one and ignoring the rest.`
        // );
      }
    }

    for (let i = 0; i < tracklist.length; i++) {
      const object = tracklist[i];
      if (object.duration && typeof object.duration === "number") {
        durationSum += object.duration;
        // console.log(`${object.name} durationSum: ${durationSum}`);
        if (durationSum >= 1000 && indexToRemove === -1) {
          indexToRemove = i + 1;
        }
      } else {
        objectsToRemove.push(object);
      }
    }

    // Subtract duration of end object from maximum duration limit
    let maxDurationMinusEndTrackDur = MAXPLAYLISTDURATION - endObject.duration;

    // get the length of the introtrack
    let lauraIntroTrack = introTracks.find((obj) => obj.tags.includes("intro"));

    // * Modify the tracklist by adding an intro track at the beginning and an end object at the end.
    if (lauraIntroTrack) {
      tracklist.splice(tracklist.indexOf(lauraIntroTrack), 1);
      tracklist.unshift(lauraIntroTrack);
    }

    // Subtract duration of intro object from maximum duration limit
    let maxDurationMinusEndAndOpenTrack =
      maxDurationMinusEndTrackDur - lauraIntroTrack.duration;

    if (durationSum > maxDurationMinusEndAndOpenTrack && indexToRemove !== -1) {
      const removed = tracklist.splice(indexToRemove);
      objectsToRemove.push(...removed);
      durationSum -= removed.reduce((acc, obj) => acc + obj.duration, 0);
    }

    if (endObject !== null && !objectsToRemove.includes(endObject)) {
      tracklist.push(endObject);
    }

    if (endObject === null) {
      console.log("Error: No end object found in tracklist.");
      return;
    }

    if (lauraIntroTrack === undefined) {
      console.log("Error: No intro track found in tracklist.");
      return;
    }

    tracklist.forEach((obj) => {
      // console.log(`${obj.name} (${obj.duration} seconds)`);
    });
    return tracklist;
  }

  /* 9. Define a function shuffleTracklist that takes a tracklist array as input, shuffles its elements
  randomly, and applies the followTracklistRules function to the shuffled tracklist. The function 
  returns the shuffled and modified tracklist. */

  function shuffleTracklist(tracklist) {
    for (let i = tracklist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracklist[i], tracklist[j]] = [tracklist[j], tracklist[i]];
    }
    followTracklistRules(tracklist);
    return tracklist;
  }



/* 10. Define a function fetchAndCacheAudio that takes an audioFileUrl and a cache object as input. The 
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

  let LastSeenTags = []; // store the tags of the last track, so we can make rules
  // const currentTrackUrlElement = document.getElementById("currTrack");

  // This recursive function processes each audio file at a time and then queues up
  // work for the next audio file to be processed.
  function playAndQueue(songs, index, currentRuntime, cache) {
    // if we're out of tracks or out of time, stop everything (should fade out eventually)
    if (index == songs.length || total_duration - currentRuntime < -100) {
      return;
    }

    // If we are near the end of the playlist, play the final three tracks.
    if (total_duration - currentRuntime <= 90) {
      function skipToEndOfThePlaylistFunction(songs, currentIndex, newIndex) {
        if (!hasSkippedToEnd) {
          const numElementsToEnd = songs.length - currentIndex - 1;
          index = index + numElementsToEnd;
          let newIndex = index;
          songs.push(...outroAudioSounds);
          // songs.push(...creditsArray);
          creditsArray.forEach((credit) => songs.push(credit));
          // songs.push(...creditsArray);
          songs.push(...finalOutroAudioSounds);
          hasSkippedToEnd = true;
        } else {
          // console.log("Action already performed, skipping...");
        }
      }
      skipToEndOfThePlaylistFunction(songs, index);
    }

    // get the song object
    const song = songs[index];

    if (song) {
      const currTagsHTMLElement = document.getElementById("currTags");
      const currURLHTMLElement = document.getElementById("currTrack");
      const currDurrHTMLElement = document.getElementById("currDurr");
      const currTrackNameHTMLElement = document.getElementById("currTrackName");
      const currCreditStackHTMLElement =
        document.getElementById("creditsStack");
      const currIndexNokHTMLElement = document.getElementById("indexNo");
      const currTotalIndexHTMLElement = document.getElementById("totalIndex");

      const currTags = song.tags;
      const currUrl = song.url;
      const currDurr = song.duration;
      const currName = song.name;
      const currCredit = song.credit;
      const currIndex = index;

      // don't play long tracks
      // console.log(currDurr);
      if (currDurr > 1070) {
        console.log("forbidden!");
        playAndQueue(songs, index + 1, currentRuntime, cache);
        return;
      }

      if (currTags && currTags != "") {
        currTagsHTMLElement.textContent = " " + currTags;
      } else {
        console.log("no tags");
      }

      const forbiddenTagCombinations = [
        { firstTag: "drone", secondTag: "drone" },
        { firstTag: "interviews", secondTag: "interviews" },
        { firstTag: "shorts", secondTag: "shorts" },
        { firstTag: "music", secondTag: "music" },
        { firstTag: "longmusic", secondTag: "longmusic" },
        // Add more forbidden tag combinations as needed
      ];

      // need to make sure this still works - esp w mult tags
      if (LastSeenTags.length > 0) {
        const forbiddenCombination = forbiddenTagCombinations.find(
          (combination) =>
            combination.firstTag === LastSeenTags[0] &&
            combination.secondTag === currTags[0]
        );
        if (forbiddenCombination) {
          console.log("forbidden!");
          playAndQueue(songs, index + 1, currentRuntime, cache);
          return;
        }
      }
      LastSeenTags = currTags;

      if (currUrl && currUrl != "") {
        currURLHTMLElement.textContent = " " + currUrl;
      } else {
        console.log("no url");
      }

      if (currDurr && currDurr != "") {
        currDurrHTMLElement.textContent = " " + currDurr;
      } else {
        console.log("no dur");
      }

      if (currIndex) {
        currIndexNokHTMLElement.textContent = " " + currIndex;
      } else {
        // console.log("no index");
      }

      if (songs) {
        currTotalIndexHTMLElement.textContent = " " + songs.length;
      } else {
        console.log("no index");
      }

      if (currName && currName != "") {
        currTrackNameHTMLElement.textContent = " " + currName;
      } else {
        console.log("no name");
      }

      if (currCredit && currCredit !== "") {
        console.log(song);

        // creditsArray.push(song);
        const createCreditObj = function (song) {
          const creditObj = {
            name: song.name,
            url: song.credit, //flip on purpose
            duration: song.duration,
            tags: song.tags,
            credit: song.url,
          };
          return creditObj;
        };

        const creditObj = createCreditObj(song);
        creditsArray.push(addAudioFromCredit(creditObj));
        console.log(creditsArray);
        console.log(songs);

        creditsArray.forEach((credit) => {
          // console.log(`credits ${JSON.stringify(credit)}`);
        });
        // extract credits from the array of objects and join them with newlines
        const mycredits = creditsArray.map((song) => song.credit);
        const creditsText = mycredits
          .map((credit) => credit.substring(credit.lastIndexOf("/") + 1))
          .join("\n");
        currCreditStackHTMLElement.textContent = creditsText;
      } else {
        // console.log("no credit");
      }
    } else {
      console.log("NO SONG!!!");
      return;
    }

    const audio = song.audio;
    // Update player to current audio
    player = audio;
    // hopefully tell the browser to start downloading audio
    if (audio) {
      audio.preload = "auto";
    }

    const track = audioContext.createMediaElementSource(audio);
    track.connect(volumeNode);

    // when the song has ended, queue up the next one
    audio.addEventListener("ended", (e) => {
      const duration = audio.duration;
      playAndQueue(songs, index + 1, currentRuntime + duration, cache);
    });

    // When metadata has been loaded, we know the
    // audio duration. With the audio duration, we
    // do two things depending on where we are in the
    // play queue:
    //
    // 1. If the currentRuntime is greater than the total
    //    duration, then we set a timeout to pause the song.
    // 2. else, if there is a next song, we set a timeout
    //    that will try and preload the song.
    audio.addEventListener("loadedmetadata", (e) => {
      const duration = audio.duration;
      const durationInMin = Math.floor(duration / 60);
      const remainingSec = Math.round(duration % 60);
      const formattedMin =
        durationInMin < 10 ? `0${durationInMin}` : durationInMin;
      const formattedSec =
        remainingSec < 10 ? `0${remainingSec}` : remainingSec;
      const formattedDuration = `${formattedMin}:${formattedSec}`;

      if (currentRuntime + duration > total_duration) {
        const remainingMs = (total_duration - currentRuntime) * 1000;
        setTimeout(() => {
          audioContext.suspend();
          clearInterval(timerInterval);
        }, remainingMs);
      } else if (index < songs.length - 1) {
        // set a timer to preload the next file
        const timeoutDurationMs = (duration - PREFETCH_BUFFER_SECONDS) * 1000;
        setTimeout(() => {
          const nextAudio = songs[index + 1];
          nextAudio.preload = "auto";
          fetchAndCacheAudio(nextAudio.url, cache).then(
            (p) => console.log(`loaded ${nextAudio.url} into cache`)
            // document.getElementById("nextUp").innerHTML = nextAudio.url;
          );
        }, timeoutDurationMs);
      }
    });
    // console.log(audio);
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

    // first we copy the array of songs
    const allSongs = [...SONGS];
    // next we shuffle it
    const shuffledSongs = shuffleTracklist(allSongs);

    // next we add the intro to the beginning
    // const shuffledSongsWithOpen = [...introTracks, ...shuffledSongs];
    const shuffledSongsWithOpen = [...shuffledSongs];

    // now we will print all the shuffled songs for the debug
    const currTrackNameElement = document.getElementById("fullList");
    while (currTrackNameElement.firstChild) {
      currTrackNameElement.removeChild(currTrackNameElement.firstChild);
    }

    for (let i = 0; i < shuffledSongsWithOpen.length; i++) {
      const itemElement = document.createElement("div");
      itemElement.textContent =
        shuffledSongsWithOpen[i].name +
        " [" +
        shuffledSongsWithOpen[i].medium +
        "] (" +
        shuffledSongsWithOpen[i].tags.join(", ") +
        ")";
      currTrackNameElement.appendChild(itemElement);
    }

    if (shuffledSongsWithOpen.length > 0) {
      currTrackNameElement.style.display = "block";
    } else {
      // console.log("no shuffle");
    }

    window.caches
      .open("audio-pre-cache")
      .then((cache) => playAndQueue(shuffledSongsWithOpen, 0, 0, cache));
  });

  const totalDurationInput = document.getElementById("total-duration");
  
  let totalDuration = total_duration / 60; // use a separate variable to store the value in minutes
  if (totalDurationInput) {
    totalDurationInput.value = totalDuration;
    totalDurationInput.addEventListener("input", (event) => {
      totalDuration = parseInt(event.target.value);
      total_duration = totalDuration * 60; // update the global variable in seconds
    });
  }
  function updateProgress(seconds, previousDuration) {
    let currTime = document.getElementById("current-time");
    if (!currTime) {
      throw new Error("Missing element: current-time");
    }
    timerDuration = seconds + previousDuration;
    if (currTime == null) {
      //do nothing. there is a delay whe the player is made.
    } else {
      let remaining = total_duration - (seconds + previousDuration);
      let minutes = Math.floor(remaining / 60);
      if (remaining <= 0) {
        currTime.innerHTML = "done";
      } else {
        let remainingSeconds = (remaining % 60).toLocaleString("en-US", {
          minimumIntegerDigits: 2,
          useGrouping: false,
        });
        currTime.innerHTML = `${minutes}:${remainingSeconds}`;
      }
    }
  }

  function createTimerLoop(previousDuration) {
    var start = Date.now();
    return setInterval(() => {
      let delta = Date.now() - start; // milliseconds since elapsed
      let deltaSeconds = Math.floor(delta / 1000);
      updateProgress(deltaSeconds, previousDuration);
    }, 200);
  }
});
