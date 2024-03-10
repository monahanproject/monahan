import { SimpleAudioPlayer } from "./audioplayer.js";
import { gatherTheCreditSongs } from "./credits.js";
import { checkPlaylistRules } from "./checkRules.js";
import { shuffleTracklist } from "./shuffle.js";
import { printEntireTracklistDebug } from "./debug.js";
import { followTracklistRules } from "./playlistBuilder.js";
import { outroAudioSounds, finalOutroAudioSounds } from "./outroAudio.js";

export let curatedTracklist;
export let MAX_PLAYLIST_DURATION_SECONDS = 1140; //(19m)

export let curatedTracklistTotalTimeInSecs;
curatedTracklistTotalTimeInSecs = 0;


async function initializeApp() {
  await loadSongs(); // This ensures songs are loaded before moving on
  // Any other initialization code that depends on curatedTracklist being populated
}

initializeApp().catch(console.error);


function addOutrosAndCreditsToTracklist(curatedTracklist) {
  curatedTracklist.push(...outroAudioSounds.map(prepareSongForPlayback));
  curatedTracklist.push(...gatherTheCreditSongs(curatedTracklist));
  curatedTracklist.push(...finalOutroAudioSounds.map(prepareSongForPlayback));
  return curatedTracklist;
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXX CREATE EACH SONG! XXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* Possibly does nothing!.*/

export const prepareSongForPlayback = (song) => {
  return song;
};

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX GET THE SONGS & TURN THEM INTO SONG OBJECTS! XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/* Define an array SONGS containing multiple song objects, each song object is 
  processed using the prepareSongForPlayback function. */

let songs;


async function loadSongs() {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch("songs.json");
      const data = await response.json();
      songs = data.map(prepareSongForPlayback);
      console.log("Songs loaded successfully.");
  
      // Now call prepareAndQueueTracks here to ensure it happens after songs are loaded
      curatedTracklist = prepareCuratedTracklist(songs);
    } catch (error) {
      console.error("Error loading JSON data:", error);
    }
  });
}


function prepareCuratedTracklist(songs) {
  const allSongs = [...songs];
  const shuffledSongs = shuffleTracklist(allSongs);
  curatedTracklist = followTracklistRules(shuffledSongs);
  checkPlaylistRules(curatedTracklist);
  curatedTracklist = addOutrosAndCreditsToTracklist(curatedTracklist);
  printEntireTracklistDebug(curatedTracklist);
  const makeASimpleAudioPlayerAndPlayIt = new SimpleAudioPlayer(curatedTracklist);
}



