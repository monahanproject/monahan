//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX CHECK THOSE TRACKS!!!! XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

export async function isValidTracklist(tracklist) {
  const invalidTracks = [];

  for (let i = 0; i < tracklist.length; i++) {
    const track = tracklist[i];

    // Check track URL
    if (!(await isValidUrl(track.url))) {
      invalidTracks.push({ type: "Track", url: track.url });
    }

    // Check credit URL
    if (track.credit && !(await isValidUrl(track.credit))) {
      invalidTracks.push({ type: "Credit", url: track.credit });
    }
  }

  if (invalidTracks.length > 0) {
    console.log("Invalid URLs:");
    console.log(invalidTracks);
  } else {
    // console.log("All URLs are valid.");
  }

  // Return true if there are no invalid tracks
  return invalidTracks.length === 0;
}

async function isValidUrl(url) {
  try {
    const response = await fetch(url);
    return response.status === 200;
  } catch (error) {
    return false;
  }
} 