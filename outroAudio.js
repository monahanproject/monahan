export const prepareSongForPlayback = (song) => {
    return song;
  };

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX CREATE OUTRO AUDIO! XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* Define two more arrays outroAudioSounds and finalOutroAudioSounds, each containing an object
   representing an outro track. Each object is processed using the prepareSongForPlayback function. */

   export const outroAudioSounds = [
    {
      name: "OUTRO2PT1SOLO",
      url: "./sounds/INTRO_OUTRO_NAMES/OUTRO_2.1.mp3",
      duration: 8.616,
      author: "",
      form: "",
      placement: [""],
      length: "",
      language: "",
      sentiment: "",
      tags: ["outro"],
      backgroundMusic: "",
      credit: "",
      engTrans: "^Laura^^: In this version of MONAHAN you’ve heard from… ",
      frTrans: "Dans cette version de MONAHAN, vous avez entendu…",
    },
  ].map(prepareSongForPlayback);
  
  export const finalOutroAudioSounds = [
    {
      name: "OUTRO2PT2withMUSIC",
      url: "./sounds/INTRO_OUTRO_NAMES/OUTRO_2.2_MUSIC.mp3",
      duration: 29.088,
      author: "",
      form: "",
      placement: [""],
      length: "",
      language: "",
      sentiment: "",
      tags: ["outro"],
      backgroundMusic: "",
      credit: "",
      engTrans: "^Laura^^: Please visit the MONAHAN website to find out more about each contributor. We hope you will come again for a different experience.  Thank you for listening.  ",
      frTrans: "^Laura^^ : Rendez-vous sur le site Web de MONAHAN pour en savoir plus sur chaque personne qui a collaboré au projet. Nous espérons que vous reviendrez pour une autre expérience. Merci de votre écoute.",
    },
  ].map(prepareSongForPlayback);