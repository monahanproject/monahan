window.addEventListener("load", (event) => {
  var myLang = localStorage["lang"] || "defaultValue";
  var player;
  var audioContext = null;
  var gainNode = null;
  var previousVolume = "100";
  var timerInterval;
  var timerDuration;

  let playState = "play";
  let muteState = "unmute";

  function startplayer() {
    player = document.getElementById("music_player");
    player.controls = false;
  }

  function change_vol(event) {
    gainNode.gain.value = parseFloat(event.target.value);
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
      if (playState === "play") {
        // playIconContainer.innerHTML = "play";
        playIconContainer.classList.remove("paused");
        playState = "pause";
        audioContext.suspend();
        clearInterval(timerInterval);
      } else {
        player.currentTime = 0;
        // playIconContainer.innerHTML = "pause";
        playIconContainer.classList.add("paused");
        playState = "play";
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
      gainNode.gain.value = getCurrentSliderVolume();
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

  const introTracks = [
    {
      name: "intro",
      url: "./sounds/CREDITS/fakeIntro.mp3",
      // url: "./sounds/00_INTRO/INTRO2.mp3",
      tags: ["intro"],
    },
  ].map((song) => {
    song.audio = createAudioElement(song.url);
    return song;
  });

  const SONGS = [
    {
      name: "M_TURKWAZ_02",
      url: "./sounds/MUSIC/M_TURKWAZ_02.mp3",
      duration: 395,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/TURKWAZ.mp3",
    },
    {
      name: "M_TURKWAZ_03",
      url: "./sounds/MUSIC/M_TURKWAZ_03.mp3",
      duration: 319,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/TURKWAZ.mp3",
    },
    {
      name: "M_TURKWAZ_01",
      url: "./sounds/MUSIC/M_TURKWAZ_01.mp3",
      duration: 384,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/TURKWAZ.mp3",
    },
    {
      name: "M_TURKWAZ_04",
      url: "./sounds/MUSIC/M_TURKWAZ_04.mp3",
      duration: 111,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/TURKWAZ.mp3",
    },
    {
      name: "M_TURKWAZ_10",
      url: "./sounds/MUSIC/M_TURKWAZ_10.mp3",
      duration: 160,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/TURKWAZ.mp3",
    },
    {
      name: "M_DEMI_08",
      url: "./sounds/MUSIC/M_DEMI_08.mp3",
      duration: 75,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_TURKWAZ_05",
      url: "./sounds/MUSIC/M_TURKWAZ_05.mp3",
      duration: 247,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/TURKWAZ.mp3",
    },
    {
      name: "M_KIKO_B_03",
      url: "./sounds/MUSIC/M_KIKO_B_03.mp3",
      duration: 113,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "M_KIKO_Z_02",
      url: "./sounds/MUSIC/M_KIKO_Z_02.mp3",
      duration: 158,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "M_KIKO_B_02",
      url: "./sounds/MUSIC/M_KIKO_B_02.mp3",
      duration: 148,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "M_KIKO_Z_01",
      url: "./sounds/MUSIC/M_KIKO_Z_01.mp3",
      duration: 77,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "M_KIKO_B_01",
      url: "./sounds/MUSIC/M_KIKO_B_01.mp3",
      duration: 162,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "M_KIKO_S_02",
      url: "./sounds/MUSIC/M_KIKO_S_02.mp3",
      duration: 63,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "M_DEMI_13",
      url: "./sounds/MUSIC/M_DEMI_13.mp3",
      duration: 102,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_DEMI_06",
      url: "./sounds/MUSIC/M_DEMI_06.mp3",
      duration: 111,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_CHARLOTTE_16",
      url: "./sounds/MUSIC/M_CHARLOTTE_16.mp3",
      duration: 68,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_CHARLOTTE_14",
      url: "./sounds/MUSIC/M_CHARLOTTE_14.mp3",
      duration: 76,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_DEMI_11",
      url: "./sounds/MUSIC/M_DEMI_11.mp3",
      duration: 87,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_DEMI_05",
      url: "./sounds/MUSIC/M_DEMI_05.mp3",
      duration: 34,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_TURKWAZ_09",
      url: "./sounds/MUSIC/M_TURKWAZ_09.mp3",
      duration: 241,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/TURKWAZ.mp3",
    },
    {
      name: "M_CHARLOTTE_15",
      url: "./sounds/MUSIC/M_CHARLOTTE_15.mp3",
      duration: 60,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_CHARLOTTE_11",
      url: "./sounds/MUSIC/M_CHARLOTTE_11.mp3",
      duration: 94,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_KIKO_C_06",
      url: "./sounds/MUSIC/M_KIKO_C_06.mp3",
      duration: 79,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "M_CHARLOTTE_10",
      url: "./sounds/MUSIC/M_CHARLOTTE_10.mp3",
      duration: 130,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_CHARLOTTE_12",
      url: "./sounds/MUSIC/M_CHARLOTTE_12.mp3",
      duration: 141,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_DEMI_02",
      url: "./sounds/MUSIC/M_DEMI_02.mp3",
      duration: 45,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_DEMI_03",
      url: "./sounds/MUSIC/M_DEMI_03.mp3",
      duration: 42,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_CHARLOTTE_13",
      url: "./sounds/MUSIC/M_CHARLOTTE_13.mp3",
      duration: 146,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "M_KIKO_C_05",
      url: "./sounds/MUSIC/M_KIKO_C_05.mp3",
      duration: 61,
      tags: ["music"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "P_ALBERT_15",
      url: "./sounds/POETRY/P_ALBERT_15.mp3",
      duration: 110,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_01",
      url: "./sounds/POETRY/P_ALBERT_01.mp3",
      duration: 57,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_14",
      url: "./sounds/POETRY/P_ALBERT_14.mp3",
      duration: 127,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_02",
      url: "./sounds/POETRY/P_ALBERT_02.mp3",
      duration: 268,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_16",
      url: "./sounds/POETRY/P_ALBERT_16.mp3",
      duration: 27,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_17",
      url: "./sounds/POETRY/P_ALBERT_17.mp3",
      duration: 62,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_03",
      url: "./sounds/POETRY/P_ALBERT_03.mp3",
      duration: 41,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_07",
      url: "./sounds/POETRY/P_ALBERT_07.mp3",
      duration: 36,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_13",
      url: "./sounds/POETRY/P_ALBERT_13.mp3",
      duration: 73,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_12",
      url: "./sounds/POETRY/P_ALBERT_12.mp3",
      duration: 48,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_06",
      url: "./sounds/POETRY/P_ALBERT_06.mp3",
      duration: 45,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_10",
      url: "./sounds/POETRY/P_ALBERT_10.mp3",
      duration: 23,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_04",
      url: "./sounds/POETRY/P_ALBERT_04.mp3",
      duration: 53,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_05",
      url: "./sounds/POETRY/P_ALBERT_05.mp3",
      duration: 38,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_11",
      url: "./sounds/POETRY/P_ALBERT_11.mp3",
      duration: 89,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_ALBERT_08",
      url: "./sounds/POETRY/P_ALBERT_08.mp3",
      duration: 49,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_NAMITHA_03",
      url: "./sounds/POETRY/P_NAMITHA_03.mp3",
      duration: 30,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/NAMITHA.mp3",
    },
    {
      name: "P_NAMITHA_02",
      url: "./sounds/POETRY/P_NAMITHA_02.mp3",
      duration: 55,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/NAMITHA.mp3",
    },
    {
      name: "P_ALBERT_09",
      url: "./sounds/POETRY/P_ALBERT_09.mp3",
      duration: 36,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "P_NAMITHA_01",
      url: "./sounds/POETRY/P_NAMITHA_01.mp3",
      duration: 47,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/NAMITHA.mp3",
    },
    {
      name: "P_NAMITHA_05",
      url: "./sounds/POETRY/P_NAMITHA_05.mp3",
      duration: 29,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/NAMITHA.mp3",
    },
    {
      name: "P_NAMITHA_04",
      url: "./sounds/POETRY/P_NAMITHA_04.mp3",
      duration: 26,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/NAMITHA.mp3",
    },
    {
      name: "P_NAMITHA_06",
      url: "./sounds/POETRY/P_NAMITHA_06.mp3",
      duration: 11,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/NAMITHA.mp3",
    },
    {
      name: "P_ALBERT_18",
      url: "./sounds/POETRY/P_ALBERT_18.mp3",
      duration: 64,
      tags: ["poetry"],
      credit: "./sounds/XX_OUTRO/NAMES/ALBERT.mp3",
    },
    {
      name: "S_KIKO_S_04",
      url: "./sounds/SHORTS/S_KIKO_S_04.mp3",
      duration: 36,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "S_KIKO_S_03",
      url: "./sounds/SHORTS/S_KIKO_S_03.mp3",
      duration: 36,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "S_KIKO_S_02",
      url: "./sounds/SHORTS/S_KIKO_S_02.mp3",
      duration: 28,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "S_BIRDS_17",
      url: "./sounds/SHORTS/S_BIRDS_17.mp3",
      duration: 64,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_03",
      url: "./sounds/SHORTS/S_BIRDS_03.mp3",
      duration: 71,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_DEMI_16",
      url: "./sounds/SHORTS/S_DEMI_16.mp3",
      duration: 22,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_KIKO_C_01",
      url: "./sounds/SHORTS/S_KIKO_C_01.mp3",
      duration: 54,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "S_DEMI_17",
      url: "./sounds/SHORTS/S_DEMI_17.mp3",
      duration: 11,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_CHARLOTTE_09",
      url: "./sounds/SHORTS/S_CHARLOTTE_09.mp3",
      duration: 22,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_02",
      url: "./sounds/SHORTS/S_BIRDS_02.mp3",
      duration: 84,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_16",
      url: "./sounds/SHORTS/S_BIRDS_16.mp3",
      duration: 32,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_14",
      url: "./sounds/SHORTS/S_BIRDS_14.mp3",
      duration: 73,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_DEMI_15",
      url: "./sounds/SHORTS/S_DEMI_15.mp3",
      duration: 10,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_KIKO_C_02",
      url: "./sounds/SHORTS/S_KIKO_C_02.mp3",
      duration: 37,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "S_DEMI_14",
      url: "./sounds/SHORTS/S_DEMI_14.mp3",
      duration: 14,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_15",
      url: "./sounds/SHORTS/S_BIRDS_15.mp3",
      duration: 35,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_01",
      url: "./sounds/SHORTS/S_BIRDS_01.mp3",
      duration: 96,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_05",
      url: "./sounds/SHORTS/S_BIRDS_05.mp3",
      duration: 66,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_11",
      url: "./sounds/SHORTS/S_BIRDS_11.mp3",
      duration: 41,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_10",
      url: "./sounds/SHORTS/S_BIRDS_10.mp3",
      duration: 65,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_04",
      url: "./sounds/SHORTS/S_BIRDS_04.mp3",
      duration: 60,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_12",
      url: "./sounds/SHORTS/S_BIRDS_12.mp3",
      duration: 31,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_06",
      url: "./sounds/SHORTS/S_BIRDS_06.mp3",
      duration: 88,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_07",
      url: "./sounds/SHORTS/S_BIRDS_07.mp3",
      duration: 92,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_13",
      url: "./sounds/SHORTS/S_BIRDS_13.mp3",
      duration: 56,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_DEMI_23",
      url: "./sounds/SHORTS/S_DEMI_23.mp3",
      duration: 21,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_CHARLOTTE_01",
      url: "./sounds/SHORTS/S_CHARLOTTE_01.mp3",
      duration: 74,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_KIKO_C_09",
      url: "./sounds/SHORTS/S_KIKO_C_09.mp3",
      duration: 41,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "S_DEMI_22",
      url: "./sounds/SHORTS/S_DEMI_22.mp3",
      duration: 22,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_LAUGHING_01",
      url: "./sounds/SHORTS/S_LAUGHING_01.mp3",
      duration: 15,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_09",
      url: "./sounds/SHORTS/S_BIRDS_09.mp3",
      duration: 46,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_DEMI_20",
      url: "./sounds/SHORTS/S_DEMI_20.mp3",
      duration: 22,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_CHARLOTTE_02",
      url: "./sounds/SHORTS/S_CHARLOTTE_02.mp3",
      duration: 25,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_CHARLOTTE_03",
      url: "./sounds/SHORTS/S_CHARLOTTE_03.mp3",
      duration: 31,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_DEMI_21",
      url: "./sounds/SHORTS/S_DEMI_21.mp3",
      duration: 10,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_LAUGHING_02",
      url: "./sounds/SHORTS/S_LAUGHING_02.mp3",
      duration: 28,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_08",
      url: "./sounds/SHORTS/S_BIRDS_08.mp3",
      duration: 57,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_BIRDS_18",
      url: "./sounds/SHORTS/S_BIRDS_18.mp3",
      duration: 63,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_CHARLOTTE_07",
      url: "./sounds/SHORTS/S_CHARLOTTE_07.mp3",
      duration: 41,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_DEMI_19",
      url: "./sounds/SHORTS/S_DEMI_19.mp3",
      duration: 15,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_DEMI_18",
      url: "./sounds/SHORTS/S_DEMI_18.mp3",
      duration: 21,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "S_KIKO_B_04",
      url: "./sounds/SHORTS/S_KIKO_B_04.mp3",
      duration: 21,
      tags: ["shorts"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "I_JAYNE_02",
      url: "./sounds/INTERVIEWS/I_JAYNE_02.mp3",
      duration: 79,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "I_JAYNE_03",
      url: "./sounds/INTERVIEWS/I_JAYNE_03.mp3",
      duration: 149,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "I_JAYNE_01",
      url: "./sounds/INTERVIEWS/I_JAYNE_01.mp3",
      duration: 226,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/CHARLOTTE.mp3",
    },
    {
      name: "I_LOUELLA_02",
      url: "./sounds/INTERVIEWS/I_LOUELLA_02.mp3",
      duration: 140,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/LOUELLA.mp3",
    },
    {
      name: "I_ELLEN_02_TempMusic",
      url: "./sounds/INTERVIEWS/I_ELLEN_02_TempMusic.mp3",
      duration: 133,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/ELLEN.mp3",
    },
    {
      name: "I_LOUELLA_03",
      url: "./sounds/INTERVIEWS/I_LOUELLA_03.mp3",
      duration: 198,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/LOUELLA.mp3",
    },
    {
      name: "I_LOUELLA_01",
      url: "./sounds/INTERVIEWS/I_LOUELLA_01.mp3",
      duration: 237,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/LOUELLA.mp3",
    },
    {
      name: "I_KIKO_02",
      url: "./sounds/INTERVIEWS/I_KIKO_02.mp3",
      duration: 247,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "I_KIKO_03",
      url: "./sounds/INTERVIEWS/I_KIKO_03.mp3",
      duration: 174,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "I_KIKO_01",
      url: "./sounds/INTERVIEWS/I_KIKO_01.mp3",
      duration: 233,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/KIKO.mp3",
    },
    {
      name: "I_ELLEN_01_TempMusic",
      url: "./sounds/INTERVIEWS/I_ELLEN_01_TempMusic.mp3",
      duration: 172,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/ELLEN.mp3",
    },
    {
      name: "I_JESSE_01",
      url: "./sounds/INTERVIEWS/I_JESSE_01.mp3",
      duration: 229,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/JESSE.mp3",
    },
    {
      name: "I_ELLEN_03",
      url: "./sounds/INTERVIEWS/I_ELLEN_03.mp3",
      duration: 244,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/ELLEN.mp3",
    },
    {
      name: "I_SAM_01",
      url: "./sounds/INTERVIEWS/I_SAM_01.mp3",
      duration: 137,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/SAM.mp3",
    },
    {
      name: "I_ELLEN_04",
      url: "./sounds/INTERVIEWS/I_ELLEN_04.mp3",
      duration: 154,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/ELLEN.mp3",
    },
    {
      name: "I_ELLEN_05",
      url: "./sounds/INTERVIEWS/I_ELLEN_05.mp3",
      duration: 151,
      tags: ["interviews"],
      credit: "./sounds/XX_OUTRO/NAMES/ELLEN.mp3",
    },
  ].map((song) => {
    song.audio = createAudioElement(song.url);
    return song;
  });

  // amount of time selected for the walk in seconds
  let total_duration = parseInt(
    document.getElementById("total-duration").value
  );
  // var total_duration = 600;

  // how many seconds before a song is completed
  // that we should pre-fetch the next song
  const PREFETCH_BUFFER_SECONDS = 8;

  // shuffle an array https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
  function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // function to fetch and cache audio
  function fetchAndCache(audioFileUrl, cache) {
    // Check first if audio is in the cache.
    return cache.match(audioFileUrl).then((cacheResponse) => {
      // Let's return cached response if audio is already in the cache.
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

  const forbiddenTagCombinations = [
    { firstTag: "drone", secondTag: "drone" },
    { firstTag: "interviews", secondTag: "interviews" },
    { firstTag: "shorts", secondTag: "shorts" },
    { firstTag: "music", secondTag: "music" },
    { firstTag: "longmusic", secondTag: "shorts, music, longmusic, drone" },
    // Add more forbidden tag combinations as needed
  ];

  // Set up event listener for when the outro audio ends
  // outroAudio1.addEventListener("ended", () => {

  let creditsArray = []; // initialize an empty array to store the credits for each song
  let lastTags = []; // store the tags of the last track, so we can make rules
  // const currentTrackUrlElement = document.getElementById("currTrack");

  // This is a recursive function. It processes
  // each audio file at a time and then queues up
  // work for the next audio file to be processed.
  // For example: it plays the current audio. And then
  // the function adds an event listener for when the
  // current audio song ends. When this song ends,
  // this function is called on the next audio (the
  // recursion).

  function playAndQueue(songs, index, currentRuntime, cache) {
    console.log("total duration " + total_duration);
    console.log("currentRuntime " + currentRuntime);
    console.log(total_duration - currentRuntime);

    // if we're out of tracks or out of time, stop everything (should fade out eventually)
    if (index == songs.length || total_duration - currentRuntime < 0) {
      return;
    }

    // If we are near the end of the playlist, play the final three tracks.
if (total_duration - currentRuntime < 110) {
  // Define the outro audio sounds.
  const outroAudioSounds = [
    {
      name: "outro",
      url: "./sounds/XX_OUTRO/OUTRO2PT1SOLO.mp3",
      duration: 3,
      tags: ["outro"],
      credit: ""
    }
  ].map(song => {
    // Create an audio element for each song and return the updated song object.
    song.audio = createAudioElement(song.url);
    return song;
  });

  // Add the contents of creditsArray to the playlist.
  const creditAudioSounds = creditsArray.map(song => {
    // Create a new object with the credit audio file URL.
    const creditSong = {
      name: song.name,
      url: "",
      duration: "",
      tags: [],
      credit: song.credit,
      audio: createAudioElement(song.creditAudio)
    };
    return creditSong;
  });

  // Define the final outro audio sounds.
  const finalOutroAudioSounds = [
    {
      name: "outroBGMusic",
      url: "./sounds/XX_OUTRO/OUTRO2PT2SOLO.mp3",
      duration: 6,
      tags: ["outro"],
      credit: ""
    }
  ].map(song => {
    // Create an audio element for each song and return the updated song object.
    song.audio = createAudioElement(song.url);
    return song;
  });

  // Remove all songs from the playlist and replace them with the outro tracks and credits.
  songs.splice(0, songs.length, ...outroAudioSounds, ...creditAudioSounds, ...finalOutroAudioSounds);
  // Play all the songs in the updated playlist, starting from the beginning of the credits.
  playPlaylist(songs, outroAudioSounds.length, currentIndex => {
    currentIndex++;
    if (currentIndex < songs.length) {
      playPlaylist(songs, currentIndex, callback);
    }
  });
}

// Function to play songs in a playlist, starting from a specified index.
function playPlaylist(playlist, startIndex, callback) {
  let currentIndex = startIndex;
  playlist[currentIndex].audio.play();
  playlist[currentIndex].audio.addEventListener("ended", () => {
    if (callback) {
      callback(currentIndex);
    }
  });
  // return();
}



    // get the song object
    const song = songs[index];
    // console.log(song);


    const currentTags = song.tags;
    if (lastTags.length > 0) {
      const forbiddenCombination = forbiddenTagCombinations.find(
        (combination) =>
          combination.firstTag === lastTags[0] &&
          combination.secondTag === currentTags[0]
      );
      if (forbiddenCombination) {
        console.log("forbidden!");
        playAndQueue(songs, index + 1, currentRuntime, cache);
        return;
      }
    }

    const currTagsElement = document.getElementById("currTags");
    if (currTagsElement) {
      currTagsElement.textContent = " " + song.tags;
    } else {
      log("no tags");
    }

    const name = song.name;
    const currTrackNameElement = document.getElementById("currTrackName");
    if (currTrackNameElement) {
      currTrackNameElement.textContent = " " + name;
    } else {
      log("no name");
    }

    const url = song.url;
    const currURLElement = document.getElementById("currTrack");
    if (currURLElement) {
      currURLElement.textContent = " " + url;
    } else {
      log("no url");
    }


    // get the credits (if there are any and push them to the array and print them)
    const creditsStack = document.getElementById("creditsStack");
    if (song.credit && song.credit !== "") {
      const currCredit = song.credit;
      creditsArray.push(song);
      creditsStack.textContent = creditsArray;
    } else {
      console.log("nope");
    }


    const audio = song.audio;
    // Update player to current audio
    player = audio;
    // hopefully tell the browser to start downloading audio
    audio.preload = "auto";

    const track = audioContext.createMediaElementSource(audio);
    track.connect(gainNode);

    // Store the credits for the current song
    const credit = song.credits;

    lastTags = currentTags;

    // when the song has ended, queue up
    // the next one
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

      const currDurr = document.getElementById("currDurr");
      if (currDurr) {
        currDurr.textContent = ` ${formattedDuration}`;
      } else {
        log("no durr");
      }

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
          fetchAndCache(nextAudio.url, cache).then(
            (p) => console.log(`loaded ${nextAudio.url} into cache`)
            // document.getElementById("nextUp").innerHTML = nextAudio.url;
          );
        }, timeoutDurationMs);
      }
    });

    audio.play();
  }

  // const nextUpp = document.getElementById("nextUp");
  // nextUpp.textContent = " " + nextAudio.url;

  const button = document.getElementById("play");

  // largely following this article:
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
  button.addEventListener("click", (event) => {
    displayLoadingGif();

    if (audioContext == null) {
      // for browser compatibility, redefine AudioContext
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContext();
      gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
    }

    // shuffle the songs around so
    // they play in a random order
    // first we copy the array
    const shuffledSongs = [...SONGS];

    // next we shuffle it
    shuffleArray(shuffledSongs);

    // console.log(shuffledSongs);

    // next we add the intro to the beginning
    const shuffledSongsWithOpen = [...introTracks, ...shuffledSongs];

    // now we will print all the shuffled songs for the debug
    // now we will print all the shuffled songs for the debug
    const currTrackNameElement = document.getElementById("fullList");

    while (currTrackNameElement.firstChild) {
      currTrackNameElement.removeChild(currTrackNameElement.firstChild);
    }

    for (let i = 0; i < shuffledSongsWithOpen.length; i++) {
      const itemElement = document.createElement("div");
      itemElement.textContent =
        shuffledSongsWithOpen[i].name + " " + shuffledSongsWithOpen[i].tags;
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
