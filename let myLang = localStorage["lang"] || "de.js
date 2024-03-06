  let myLang = localStorage["lang"] || "defaultValue";
  let player;
  let audioContext = null;
  let volumeNode;
  let playerPlayState = "play";
  let hasSkippedToEnd = false;
  let displayConsoleLog = "<br>";
  let curatedTracklistTotalTimeInSecs = 0;
  let curatedTracklistTotalTimeInMins;
  let curatedTracklist;
  let timerDuration = 0;

  const MAX_PLAYLIST_DURATION_SECONDS = 1140; //(19m)
  // 1140
  var totalDurationSeconds = 2140; //(19m)
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
    console.log("createAudioElement");
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
    // console.log("DEMI DEMI DEMI");
    // song.audio = createAudioElement("./sounds/CONTENT/S_DEMI_14.mp3");
    return song;
  };



  //  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  //  XXXXX GET OUR SONGS & TURN THEM INTO SONG OBJECTS! XXXXXX
  //  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

  /* 5. Define an array SONGS containing multiple song objects, each song object is 
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

      // Log current song information
      console.log(`Queueing song: ${song.name}, Index: ${index}, Current Runtime: ${currentRuntime}`);
      // currentRuntime = randomValueSomeTimerThing;

      // Tell the browser to start downloading audio
      if (audio) {
        audio.preload = "auto";
      }

      const track = audioContext.createMediaElementSource(audio);
      track.connect(volumeNode);

      audio.addEventListener("ended", (e) => {
        const duration = audio.duration;
        timerDuration += Math.floor(duration); // Update currentRuntime with the cumulative duration
        queueNextTrack(songs, index + 1, currentRuntime, cache);
      });

      // Set a timer to preload the next file
      const timeoutDurationMs = (song.duration - PREFETCH_BUFFER_SECONDS) * 1000;
      setTimeout(() => {
        const nextAudio = songs[index + 1];
        nextAudio.preload = "auto";
        fetchAndCacheAudio(nextAudio.url, cache).then((p) => console.log(`Loaded ${nextAudio.url} into cache`));
      }, timeoutDurationMs);
      // Play the audio
      audio.play();
    
    } catch (error) {
      // Log any errors that occur
      console.error("An error occurred in queueNextTrack:", error);
    }
  }


  let firstPlay = true;
  var playButtonTextContainer = document.getElementById("play-button-text-container");


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

    //window.caches.open("audio-pre-cache").then((cache) => queueNextTrack(curatedTracklist, 0, 0, cache));
    let zaudio = document.createElement("audio");
    document.body.appendChild(zaudio);
    zaudio.setAttribute("src", "./sounds/CONTENT/S_KIKO_S_02.mp3");
    zaudio.play();
    createTimerLoopAndUpdateProgressTimer();
  }


  222

    // findme
    window.caches.open("audio-pre-cache").then((cache) => queueNextTrack(curatedTracklist, 0, 0, cache));
    let zaudio = document.createElement("audio");
    document.body.appendChild(zaudio);
    zaudio.setAttribute("src", "./sounds/CONTENT/S_KIKO_S_02.mp3");
    //zaudio.play();
    createTimerLoopAndUpdateProgressTimer();
  }

  222


  function handlePlayPauseClick() {
    
    if (firstPlay) {
      toggleButtonVisuals(true); // Assume playing state on first play
      generatePlayer();
      prepareAudioContext();
      prepareAndQueueTracks();
      player.play();
      playerPlayState = "play";
      audioContext.resume();
      isValidTracklist(curatedTracklist);
      firstPlay = false; // Set firstPlay to false after handling the first play
      requestWakeLock();
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
});

