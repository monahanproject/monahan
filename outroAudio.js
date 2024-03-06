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