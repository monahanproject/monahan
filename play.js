import { SimpleAudioPlayer } from "./buildAudioplayer.js";
import { gatherTheCreditSongs } from "./gatherCredits.js";
import { checkPlaylistRules } from "./checkRules.js";
import { shuffleTracklist } from "./shuffleTracklist.js";
import { printEntireTracklistDebug } from "./debug.js";
import { followTracklistRules } from "./playlistBuilder.js";
import { outroAudioSounds, finalOutroAudioSounds } from "./outroAudio.js";
import { isValidTracklist } from "./checkEachTrackForValidity.js";

// Global variables to hold the curated tracklist and its total time
export let curatedTracklist;
export let curatedTracklistTotalTimeInSecs = 0;

// Function to initialize the application
export async function initializeApp() {
  await loadSongs(); // Load songs and prepare the tracklist
  // Any additional setup...
}

// Initialize the application and handle errors
initializeApp().catch(console.error);

// Function to add outro and credit songs to the tracklist
function addOutrosAndCreditsToTracklist(curatedTracklist) {
  curatedTracklist.push(...outroAudioSounds.map(prepareSongForPlayback));
  curatedTracklist.push(...gatherTheCreditSongs(curatedTracklist));
  curatedTracklist.push(...finalOutroAudioSounds.map(prepareSongForPlayback));
  return curatedTracklist;
}

// Function to prepare a song for playback (placeholder)
export const prepareSongForPlayback = (song) => {
  return song;
};

// Global variable to hold the list of songs
let songs;

// Function to load songs from a JSON file
async function loadSongs() {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch("songs.json");
      const data = await response.json();
      songs = data.map(prepareSongForPlayback);
      // console.log("Songs loaded successfully.");

      // Prepare and queue tracks after songs are loaded
      curatedTracklist = prepareCuratedTracklist(songs);
      resolve();
    } catch (error) {
      console.error("Error loading JSON data:", error);
      reject(error);
    }
  });
}

// Function to prepare the curated tracklist
function prepareCuratedTracklist(songs) {
  const allSongs = [...songs];
  const shuffledSongs = shuffleTracklist(allSongs);
  curatedTracklist = followTracklistRules(shuffledSongs);
  // isValidTracklist(shuffledSongs);
  // checkPlaylistRules(curatedTracklist);
  curatedTracklist = addOutrosAndCreditsToTracklist(curatedTracklist);
  printEntireTracklistDebug(curatedTracklist);
  
  // Create and play the SimpleAudioPlayer with the curated tracklist
  const makeASimpleAudioPlayerAndPlayIt = new SimpleAudioPlayer(curatedTracklist);
}
