//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXX CREDITS STUFF XXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

let arrayOfCreditSongs = []; // Array to store credit song objects
let creditsLog = []; // Array to store credits log

/**
 * Adds a credit to the credits log.
 */
function addToCreditsLog(songCredit) {
  const strippedCredit = songCredit.substring(songCredit.lastIndexOf("_") + 1);
  creditsLog.push(`${strippedCredit}<br>`);
}

/**
 * Creates a credit object from a song and adds it to the credit songs array.
 */
function createCreditObjectAndAddToArray(song) {
  const creditObj = {
    name: song.name,
    url: song.credit, // Flip on purpose to use the credit URL
    duration: song.creditDur,
    author: song.author,
    engTrans: song.authorCredit,
    frTrans: song.authorCredit,
  };
  arrayOfCreditSongs.push(creditObj);
}

/**
 * Checks if a track with specific attributes exists in the curated tracklist.
 * @returns {object|null} - The matching track object or null if not found.
 */
function trackExistsWithAttributes(curatedTracklist, attribute, value) {
  for (const track of curatedTracklist) {
    if (typeof track === "object" && track.hasOwnProperty(attribute)) {
      if (Array.isArray(track[attribute])) {
        if (track[attribute].some((item) => value.includes(item))) {
          return track; // Return the first matching track
        }
      } else if (track[attribute] === value) {
        return track; // Return the first matching track
      }
    }
  }
  return null; // Return null if no matching track is found
}

/**
 * Plays a credit song using the global audio element.
 */
function playCreditSong(creditSong) {
  if (!globalAudioElement) {
    console.log("Global audio element is not initialized.");
    return;
  }

  globalAudioElement.src = creditSong.url; // Use the credit song's URL for playback
  globalAudioElement.play().catch((error) => {
    console.error("Playback failed", error);
  });
}

/**
 * Gathers the credit songs from the curated tracklist.
 * @returns {array} - The array of credit songs.
 */
export function gatherTheCreditSongs(curatedTracklist) {
  for (let index = 0; index < curatedTracklist.length; index++) {
    const song = curatedTracklist[index];

    if (song.credit !== "") {
      const matchingCreditSong = trackExistsWithAttributes(arrayOfCreditSongs, "url", song.credit);

      if (!matchingCreditSong) {
        addToCreditsLog(song.credit);
        createCreditObjectAndAddToArray(song);
      }
    }
  }
  return arrayOfCreditSongs;
}
