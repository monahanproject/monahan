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

  /* 2. Define an array introTracks containing an object representing an intro track. Each object 
  in the array is processed using the addAudioFromUrl function. (right now it's just one track */

  const standardIntro = [
    {
      name: "INTRO_2",
      url: "./sounds/00_INTRO/INTRO_2.mp3",
      duration: 113,
      author: "",
      form: "",
      placement: [""],
      length: "",
      language: "",
      sentiment: " ",
      tags: ["intro"],
      backgroundMusic: "",
      credit: "",
    },
  ].map(addAudioFromUrl);

  /* Define an empty array creditsArray. */
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

  function checkRulesForCuratedPlaylist(curatedPlaylist) {
    function logError(ruleNumber, track, message) {
      console.error(
        `Rule ${ruleNumber} broken for track: ${track.name}. ${message}`
      );
    }

    for (let i = 0; i < curatedPlaylist.length; i++) {
      const currentTrack = curatedPlaylist[i];
      const prevTrack = curatedPlaylist[i - 1];
      const nextTrack = curatedPlaylist[i + 1];

      // Rule 1: No more than two tracks from the same author in a tracklist.
      const authorCount = curatedPlaylist.filter(
        (track) => track.author === currentTrack.author
      ).length;
      if (authorCount > 2) {
        logError(
          1,
          currentTrack,
          `More than two tracks from the same author: ${currentTrack.author}.`
        );
      }

      // Rule 2: Tracks with the form shorts and the language musical can never follow tracks with the form music.
      if (
        currentTrack.form === "shorts" &&
        currentTrack.language === "musical" &&
        prevTrack?.form === "music"
      ) {
        logError(
          2,
          currentTrack,
          "Follows track with form 'music' and language 'musical'."
        );
      }

      // Rule 3: Tracks with the form music can never follow tracks with both the form shorts and the language musical.
      if (
        currentTrack.form === "music" &&
        prevTrack?.form === "shorts" &&
        prevTrack?.language === "musical"
      ) {
        logError(
          3,
          currentTrack,
          "Follows track with form 'shorts' and language 'musical'."
        );
      }

      // Rule 4: The value for backgroundMusic should never be the same as the author of the immediately preceding track or the immediately following track.
      if (
        (prevTrack && currentTrack.backgroundMusic === prevTrack.author) ||
        (nextTrack && currentTrack.backgroundMusic === nextTrack.author)
      ) {
        logError(
          4,
          currentTrack,
          "Background music matches author of the preceding or following track."
        );
      }

      // Rule 5: If a track has the sentiment 'heavy', then the track right before it cannot have the 'laughter' tag.
      if (
        currentTrack.sentiment === "heavy" &&
        prevTrack?.tags.includes("laughter")
      ) {
        logError(
          5,
          currentTrack,
          "Track with sentiment 'heavy' follows track with 'laughter' tag."
        );
      }

      // Rule 6: If any of the tracks I_KIM_03, I_KIM_04, or I_KIM_05 are added to the tracklist, none of the other two tracks should be added to the tracklist.
      const forbiddenTracks = ["I_KIM_03", "I_KIM_04", "I_KIM_05"];
      if (forbiddenTracks.includes(currentTrack.name)) {
        const forbiddenInCurated = curatedPlaylist.some((track) =>
          forbiddenTracks.includes(track.name)
        );
        if (forbiddenInCurated) {
          logError(
            6,
            currentTrack,
            "Another forbidden track is present in the tracklist."
          );
        }
      }

      // Rule 7: If there is one track with the author 'Sarah' and the form 'Interview' in the tracklist, there should not be any more tracks with the author 'Sarah' and the form 'Interview' in the tracklist.
      if (
        currentTrack.author === "Sarah" &&
        currentTrack.form === "Interview" &&
        curatedPlaylist.some(
          (track) =>
            track.author === "Sarah" &&
            track.form === "Interview" &&
            track !== currentTrack
        )
      ) {
        logError(
          7,
          currentTrack,
          "Another track with 'Sarah' and form 'Interview' is present in the tracklist."
        );
      }

      // Rule 8: If there is one track with the author 'Louella' in the tracklist, there should not be any more tracks with the author 'Louella' in the tracklist.
      if (
        currentTrack.author === "Louella" &&
        curatedPlaylist.some(
          (track) => track.author === "Louella" && track !== currentTrack
        )
      ) {
        logError(
          8,
          currentTrack,
          "Another track with 'Louella' is present in the tracklist."
        );
      }
    }
    console.log("checked");
  }

  function followTracklistRules(tracklist) {
    // ooo
    let curatedTracklist = [];
    console.log(curatedTracklist);

    function trackExistsWithAttributes(curatedTracklist, attribute, value) {
      return curatedTracklist.some((track) => track[attribute] === value);
    }

    // Log helper function to make logging more informative
    function logRuleApplication(ruleNumber, description, isApplied) {
      const ruleStatus = isApplied ? "applied" : "broken";
      console.log(`Rule ${ruleNumber} ${ruleStatus}: ${description}`);
    }

    // Updated function to check if a track is valid based on the new rules.
    function isValidTrack(track, prevTrack1, prevTrack2, curatedTracklist) {
      const index = curatedTracklist.length;

      // Rule only for Track 2: The 2nd track should have the placement 'beginning'.
      if (index === 1 && !track.placement.includes("beginning")) return false;

      // Rule only for Track 3: The 3rd track should have the placement 'beginning' and a different form than the 2nd track.
      if (index === 2) {
        if (!track.placement.includes("beginning")) return false;
        if (track.form === prevTrack1.form) return false;
      }

      // Rule only for Track 4: The 4th track should have the placement 'middle' and a different form than the 3rd track.
      if (index === 3) {
        if (!track.placement.includes("middle")) return false;
        if (track.form === prevTrack1.form) return false;
      }

      // Rule only for Track 5: The 5th track should have the length 'short', not have the placement 'beginning',
      // and have a different language than the 4th track.
      if (index === 4) {
        if (track.length !== "short") return false;
        if (track.placement.includes("beginning")) return false;
        if (track.language === prevTrack1.language) return false;
      }

      // Rule only for Track 6: The 6th track should have the placement 'middle' and a different form than the 5th track.
      if (index === 5) {
        if (!track.placement.includes("middle")) return false;
        if (track.form === prevTrack1.form) return false;
      }

      // Rule only for Track 7: The 7th track should have the placement 'middle', a different form than the 6th track,
      // and unless the form of the 7th track is 'MUSIC', it must also have a different language from the 6th track.
      if (index === 6) {
        if (!track.placement.includes("middle")) return false;
        if (track.form === prevTrack1.form) return false;
        if (track.form !== "MUSIC" && track.language === prevTrack1.language) {
          return false;
        }
      }

      // Rule only for Track 8: The 8th track should have the placement 'middle', a different form than the 6th and 7th tracks,
      // and a different language than the 6th and 7th tracks.
      if (index === 7) {
        if (!track.placement.includes("middle")) return false;
        if (track.form === prevTrack1.form || track.form === prevTrack2.form)
          return false;
        if (
          track.language === prevTrack1.language ||
          track.language === prevTrack2.language
        ) {
          return false;
        }
      }

      // GENERAL RULES

      // Rule: No more than two tracks from the same author in a tracklist.
      const authorCount = curatedTracklist.filter(
        (t) => t.author === track.author
      ).length;
      if (authorCount >= 2) {
        return false;
      }

      // Rule: Tracks with the form shorts and the language musical can never follow tracks with the form music.
      if (
        track.form === "shorts" &&
        track.language === "musical" &&
        curatedTracklist.some((prevTrack) => prevTrack.form === "music")
      ) {
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
        return false;
      }

      // Rule: The value for backgroundMusic should never be the same as the author of the track right before it or the immediately following track.
      const nextTrack = curatedTracklist[curatedTracklist.length - 1];
      if (
        (prevTrack1 && track.backgroundMusic === prevTrack1.author) ||
        (nextTrack && track.backgroundMusic === nextTrack.author)
      ) {
        return false;
      }

      // Rule: If a track has the sentiment heavy, then the track right before it cannot have the laughter tag.
      if (
        track.sentiment === "heavy" &&
        prevTrack1 &&
        prevTrack1.tags.includes("laughter")
      ) {
        return false;
      }

      // Rule: If any of the tracks I_KIM_03, I_KIM_04, or I_KIM_05 are added to the tracklist,
      // none of the other two tracks should be added to the tracklist.
      const forbiddenTracks = ["I_KIM_03", "I_KIM_04", "I_KIM_05"];
      if (
        forbiddenTracks.includes(track.name) &&
        curatedTracklist.some((t) => forbiddenTracks.includes(t.name))
      ) {
        return false;
      }

      // Rule: If there is one track with the author Sarah and the form Interview in the tracklist,
      // there should not be any more tracks with the author Sarah and the form Interview in the tracklist.
      if (
        track.author === "Sarah" &&
        track.form === "Interview" &&
        curatedTracklist.some(
          (prevTrack) =>
            prevTrack.author === "Sarah" && prevTrack.form === "Interview"
        )
      ) {
        return false;
      }

      // Rule: If there is one track with the author Louella in the tracklist,
      // there should not be any more tracks with the author Louella in the tracklist.
      if (
        track.author === "Louella" &&
        curatedTracklist.some((prevTrack) => prevTrack.author === "Louella")
      ) {
        return false;
      }

      // Rule: IF WE ARE LATER IN THE TRACKLIST
      // Rule: IF WE ARE LATER IN THE TRACKLIST
      // Rule: IF WE ARE LATER IN THE TRACKLIST

      if (index > 8) {
        // Helper function to check if a track exists with the given attribute and value in the curated tracklist
        function trackExistsWithAttributes(curatedTracklist, attribute, value) {
          return curatedTracklist.some((track) => track[attribute] === value);
        }

        // Rule: Ensure that the tracklist contains at least one track with the author "albert".
        if (!trackExistsWithAttributes(curatedPlaylist, "author", "albert") && track.author !== "albert" ) {
          console.log("no albert here!")
          return false;
        }

        // Rule: Ensure that the tracklist contains at least one track with the author "birds".
        if (!trackExistsWithAttributes(curatedPlaylist, "author", "birds") && track.author !== "birds" ) {
          console.log("no birds here!")
          return false;
        }

        // Rule: Ensure that the tracklist contains at least one track with the form "interview".
        if (!trackExistsWithAttributes(curatedPlaylist, "form", "interview") && track.form !== "interview" ) {
          return false;
        }

        // Rule: Ensure that the tracklist contains at least one track with the form "music".
        if (!trackExistsWithAttributes(curatedPlaylist, "form", "music") && track.form !== "music" ) {
          return false;
        }

        // Helper variables to track certain conditions for the later in the tracklist rules
        let kikoTypeInterviewPresent = false;
        let geeseTagPresent = false;

        // Loop through the curated tracklist to apply the later in the tracklist rules
        for (let i = 0; i < curatedPlaylist.length; i++) {
          const currentTrack = curatedPlaylist[i];

          // Rule: If a track with the author "kiko" and the form "typeInterview" is present in the tracklist,
          // ensure that another track with the author "kiko" and the form "typeMusic" or "typeShort" is added at some point later in the tracklist.
          if (
            i > 8 &&
            currentTrack.author === "kiko" &&
            currentTrack.form === "typeInterview"
          ) {
            kikoTypeInterviewPresent = true;
          }

          if (
            i > 8 &&
            kikoTypeInterviewPresent &&
            currentTrack.author === "kiko" &&
            (currentTrack.form === "typeMusic" ||
              currentTrack.form === "typeShort")
          ) {
            kikoTypeInterviewPresent = false;
          }

          // Rule: If there is a track in the tracklist with the "geese" tag,
          // add another track with the "geese" tag later in the tracklist.
          if (i > 8 && currentTrack.tags.includes("geese")) {
            geeseTagPresent = true;
          }

          if (i > 8 && geeseTagPresent && currentTrack.tags.includes("geese")) {
            geeseTagPresent = false;
          }
        }
      }

      // Rule: IF WE ARE LATER IN THE TRACKLIST
      // Rule: IF WE ARE LATER IN THE TRACKLIST
      // Rule: IF WE ARE LATER IN THE TRACKLIST

      // if (index > 10) {
      //   return false;
      // }

      // If all conditions are met, the track is considered valid.
      return true;
    }

    // This function adds the next valid track to the curated tracklist from the given tracklist.
    function addNextValidTrack(curatedTracklist, tracklist) {
      // Get the previous two tracks in the curated tracklist for checking the validity of the next track.
      const prevTrack1 = curatedTracklist[curatedTracklist.length - 1];
      const prevTrack2 = curatedTracklist[curatedTracklist.length - 2];

      // Find the next valid track in the tracklist using the isValidTrack function.
      const nextValidTrack = tracklist.find((track) =>
        isValidTrack(track, prevTrack1, prevTrack2, curatedTracklist)
      );

      if (nextValidTrack) {
        // If a valid track is found, add it to the curated tracklist and remove it from the original tracklist.
        curatedTracklist.push(nextValidTrack);
        tracklist.splice(tracklist.indexOf(nextValidTrack), 1);
        return nextValidTrack;
      } else {
        // If no valid track is found, return null to indicate that no valid track was found.
        return null;
      }
    }

    // Loop through the rules until there are no valid tracks left
    let isRuleApplied = true;
    while (isRuleApplied && tracklist.length > 0) {
      isRuleApplied = false; // Reset the flag at the beginning of each iteration

      // Rule 1: The 1st track should have the tag standardIntro.
      let introTrack = tracklist.find((track) => track.tags.includes("intro"));
      if (introTrack) {
        curatedTracklist.push(introTrack);
        tracklist.splice(tracklist.indexOf(introTrack), 1);
        logRuleApplication(
          1,
          `The 1st track → has the tag standardIntro (${introTrack.tag}); name: ${introTrack.name};`,
          true
        );
      } else {
        introTrack;
        logRuleApplication(
          1,
          "The 1st track should have the tag standardIntro.",
          false
        );
      }

      // Rule 2: The 2nd track should have the placement beginning.
      let r2Track = addNextValidTrack(curatedTracklist, tracklist);
      if (r2Track && !r2Track.placement.includes("beginning")) {
        logRuleApplication(
          2,
          `The 2nd track should have the placement beginning.`,
          false
        );
      } else {
        logRuleApplication(
          2,
          `The 2nd track → has the placement beginning: (${r2Track.placement}); name: ${r2Track.name};`,
          true
        );
      }

      // Rule 3: The 3rd track should have the placement beginning and should have a different form than the 2nd track.
      let r3Track = addNextValidTrack(curatedTracklist, tracklist);
      if (!r3Track) {
        console.log("No valid track found for Rule 3.");
      } else if (
        !r3Track.placement.includes("beginning") &&
        r3Track.form !== r2Track.form
      ) {
        logRuleApplication(
          3,
          "The 3rd track should have the placement beginning and should have a different form than the 2nd track.",
          false
        );
      } else {
        logRuleApplication(
          3,
          `The 3rd track → has the placement beginning (${r3Track.placement}); and a different form (${r3Track.form}) vs the 2nd track (${r2Track.form}); name: ${r3Track.name};`,
          true
        );
      }

      // Rule 4: The 4th track should have the placement middle and should have a different form from the 3rd track.
      let r4Track = addNextValidTrack(curatedTracklist, tracklist);
      if (!r4Track) {
        console.log("No valid track found for Rule 4.");
      } else if (
        r4Track.placement.includes === "middle" &&
        r4Track.form !== r3Track.form
      ) {
        console.log(
          "The 4th track should have the placement middle and should have a different form from the 3rd track",
          false
        );
      } else {
        logRuleApplication(
          4,
          `The 4th track → has the placement middle (${r4Track.placement}); and a different form (${r4Track.form}) vs the 3nd track (${r3Track.form}); name: ${r3Track.name};`,
          true
        );
      }

      // Rule 5: The 5th track should have the length short and should NOT have the placement beginning and should have a different language from the 4th track.
      let r5Track = addNextValidTrack(curatedTracklist, tracklist);
      if (
        r5Track &&
        r5Track.length !== "short" &&
        !r5Track.placement.includes("beginning") &&
        r5Track.language === r4Track.language
      ) {
        logRuleApplication(
          5,
          `The 5th track should have the length short and should NOT have the placement beginning and should have a different language from the 4th track.`,
          false
        );
      } else {
        logRuleApplication(
          5,
          `The 5th track → has the length short (${r5Track.length}); and should NOT have the placement beginning (${r5Track.placement}); and has a different language: (${r5Track.language}); from track 4 (${r4Track.language}); name: ${r5Track.name};`,
          true
        );
      }

      // Rule 6: The 6th track should have the placement MIDDLE, and should have a different form from the 5th track.
      let r6Track = addNextValidTrack(curatedTracklist, tracklist);
      if (
        r6Track &&
        r6Track.placement.includes === "middle" &&
        r6Track.form !== r5Track.form
      ) {
        logRuleApplication(
          6,
          `The 6th track should have the placement MIDDLE, and should have a different form from the 5th track.`,
          false
        );
      } else {
        logRuleApplication(
          6,
          `The 6th track → has the placement MIDDLE (${r6Track.placement}); and has a different form (${r6Track.form}) vs the 5th track: (${r5Track.form}); name: ${r3Track.name};`,
          true
        );
      }

      // Rule 7: The 7th track should have the placement MIDDLE, and a different form from the 6th track. Additionally, unless the form of the 7th track is MUSIC, the 7th track must also have a different language from the 6th track.
      let r7Track = addNextValidTrack(curatedTracklist, tracklist);
      if (
        (r7Track &&
          r7Track.placement.includes === "middle" &&
          r7Track.form !== r6Track.form &&
          r7Track.music) ||
        r7Track.language !== r6Track.language
      ) {
        logRuleApplication(
          7,
          `The 7th track → has the placement MIDDLE (${r7Track.placement}); and has a different form (${r7Track.form}) vs the 6th track: (${r6Track.form}); AND unless the form of the 7th track is MUSIC (${r6Track.form}) the 7th track also has a different language (${r7Track.language}) from the 6th track (${r6Track.language}); name: ${r3Track.name};`,
          true
        );
      } else {
        logRuleApplication(
          7,
          `The 7th track should have the placement MIDDLE, and a different form from the 6th track. Additionally, unless the form of the 7th track is MUSIC, the 7th track must also have a different language from the 6th track.`,
          false
        );
      }

      // Rule 8: The 8th track should have the placement MIDDLE, and should have a different form from the 6th and 7th tracks, and a different language from the 6th and 7th tracks.
      let r8Track = addNextValidTrack(curatedTracklist, tracklist);
      if (
        r8Track &&
        r8Track.placement.includes === "middle" &&
        (r8Track.form !== r7Track.form) !== r6Track.form &&
        (r8Track.language !== r7Track.language) !== r6Track.language
      ) {
        logRuleApplication(
          8,
          `The 8th track should have the placement MIDDLE, and should have a different form from the 6th and 7th tracks, and a different language from the 6th and 7th tracks.`,
          false
        );
      } else {
        logRuleApplication(
          8,
          `The 8th track → has the placement MIDDLE (${r8Track.placement}); and a different form (${r8Track.form}) vs the 7th track (${r7Track.form}) or 6th track (${r6Track.form}); and has have a different language (${r8Track.language}) vs the 7th track(${r7Track.language}) or the 6th track (${r6Track.language}); name: ${r3Track.name};`,
          true
        );
      }
    }

    // Loop through the remaining tracklist to apply general rules and check if each track is valid
  for (const track of tracklist) {
    // Get the previous two tracks in the curated tracklist for checking the validity of the next track.
    const prevTrack1 = curatedTracklist[curatedTracklist.length - 1];
    const prevTrack2 = curatedTracklist[curatedTracklist.length - 2];

    // Check if the track is valid using the isValidTrack function.
    const isValid = isValidTrack(track, prevTrack1, prevTrack2, curatedTracklist);

    if (isValid) {
      // If the track is valid, add it to the curatedTracklist
      curatedTracklist.push(track);
    } else {
      // If the track is not valid, log an error or take appropriate action
      console.error(`Track '${track.name}' does not pass the general rules.`);
      // ... (you can handle the error or continue to the next track, based on your requirement)
    }
  }

    console.log("Curated Tracklist: ", curatedTracklist);

    checkRulesForCuratedPlaylist(curatedTracklist);

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

  function gatherAndPrintDebugInfo(song, index) {
    if (song) {
      // get debug ids so I can fill in debug info
      const currTrackNameHTMLElement = document.getElementById("currTrackName");
      const currURLHTMLElement = document.getElementById("currURL");
      const currTagsHTMLElement = document.getElementById("currTags");
      const currDurrHTMLElement = document.getElementById("currDurr");
      const currCreditHTMLElement = document.getElementById("currCredit");
      const currIndexNokHTMLElement = document.getElementById("indexNo");
      // const currCreditStackHTMLElement = document.getElementById("creditsStack");
      // const currTotalIndexHTMLElement = document.getElementById("totalIndex");

      console.log(index);
      // get the info for THIS song so I can print it to the debug
      const currTags = song.tags;
      const currUrl = song.url;
      const currDurr = song.duration;
      const currName = song.name;
      const currCredit = song.credit;
      const currIndex = index;

      function displayDebugText(element, text, defaultText) {
        if (text && text !== "") {
          element.textContent = " " + text;
        } else {
          element.textContent = defaultText;
        }
      }

      displayDebugText(currTrackNameHTMLElement, currName, "no name");
      displayDebugText(currURLHTMLElement, currUrl, "no url");
      displayDebugText(currTagsHTMLElement, currTags, "no tags");
      displayDebugText(currDurrHTMLElement, currDurr, "no duration");
      displayDebugText(currCreditHTMLElement, currCredit, "no credit");
      displayDebugText(currIndexNokHTMLElement, currIndex, "no index");
    } else {
      console.log("OH NO, NO SONG!");
      return;
    }
  }

  function printEntireTracklistDebug(shuffledSongsWithOpen) {
    // now we will print all the shuffled songs for the debug
    const currTrackNameElement = document.getElementById("fullList");
    while (currTrackNameElement.firstChild) {
      currTrackNameElement.removeChild(currTrackNameElement.firstChild);
    }

    for (let i = 0; i < shuffledSongsWithOpen.length; i++) {
      const itemElement = document.createElement("div");
      itemElement.textContent =
        shuffledSongsWithOpen[i].name +
        ", " +
        shuffledSongsWithOpen[i].author +
        ", " +
        shuffledSongsWithOpen[i].form +
        ", " +
        shuffledSongsWithOpen[i].placement +
        ", " +
        shuffledSongsWithOpen[i].language +
        ", " +
        shuffledSongsWithOpen[i].sentiment +
        ", " +
        shuffledSongsWithOpen[i].tags.join(", ") +
        ". ";
      shuffledSongsWithOpen[i].backgroundMusic +
        "." +
        currTrackNameElement.appendChild(itemElement);
    }

    if (shuffledSongsWithOpen.length > 0) {
      currTrackNameElement.style.display = "block";
    } else {
      // console.log("no shuffle");
    }
  }

  /* 
  Queue next track (I have no idea what this is doing)


  Each time the track changes, I should get the credits info and add it to the creditsArray

  Are we out of time? If yes, it's time to play the final tracks 
      There could be some kind of trigger point when I hit a certain amount of time remaining (only do this once!)
      (if total_duration - currentRuntime <= 90???) where I trigger or add the  outroAudioSounds
*/

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

  // code to update the timer
  function updateProgressTimer(seconds, previousDuration) {
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
      updateProgressTimer(deltaSeconds, previousDuration);
    }, 200);
  }
});
