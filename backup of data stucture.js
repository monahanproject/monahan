const introTracks = [
    {
      url: "./sounds/00_INTRO/INTRO1V2.mp3",
      tags: ["intro"],
    }].map((song) => {
    song.audio = createAudioElement(song.url);
    return song;
  });

  const outroTracks = [
    {
      url: "./sounds/XX_OUTRO/OUTRO2PT2withMUSIC.mp3",
      tags: ["outro"],
    }
].map((song) => {
    song.audio = createAudioElement(song.url);
    return song;
  });

 

  const droneTracks = [
    {
      url: "./sounds/Story_WhatRemainsTheSame.mp3",
      tags: ["drone"],
    },
    {
      url: "./sounds/Story_TheSpirit.mp3",
      tags: ["drone"],
    },
  ].map((song) => {
    song.audio = createAudioElement(song.url);
    return song;
  });


  const interviewTracks = [
    {
      url: "./sounds/INTERVIEWS/I_LOUELLA_03.mp3",
      tags: ["interviews"],
    },
    {
      url: "./sounds/INTERVIEWS/I_SAM_01.mp3",
      tags: ["interviews"],
    }
  ].map((song) => {
    song.audio = createAudioElement(song.url);
    return song;
  });


  const musicTracks = [
    {
      url: "./sounds/MUSIC/M_CHARLOTTE_10.mp3",
      tags: ["music"],
    },
    {
      url: "./sounds/MUSIC/M_CHARLOTTE_11.mp3",
      tags: ["music"],
    }
  ].map((song) => {
    song.audio = createAudioElement(song.url);
    return song;
  });

  const poetryTracks = [
    {
      url: "./sounds/POETRY/P_ALBERT_01.mp3",
      tags: ["poetry"],
    },
    {
      url: "./sounds/POETRY/P_ALBERT_02.mp3",
      tags: ["poetry"],
    }
  ].map((song) => {
    song.audio = createAudioElement(song.url);
    return song;
  });

  const shortsTracks = [
    {
      url: "./sounds/SHORTS/S_BIRDS_01.mp3",
      tags: ["shorts"],
    },
    {
      url: "./sounds/SHORTS/S_BIRDS_02.mp3",
      tags: ["shorts"],
    },
  
    {
      url: "./sounds/SHORTS/S_KIKO_S_04.mp3",
      tags: ["shorts"],
    }
  ].map((song) => {
    song.audio = createAudioElement(song.url);
    return song;
  });

  const allTracks = [
    ...droneTracks,
    ...interviewTracks,
    ...poetryTracks,
    ...shortsTracks,
    ...musicTracks,
  ];