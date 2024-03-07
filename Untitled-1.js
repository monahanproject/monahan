




function queueNextTrack(songs, index, currentRuntime, cache) {
  if (index >= songs.length) {
    console.log("All tracks have been queued.");
    return; // Exit if there are no more songs to queue
  }

  try {
    const song = songs[index]; // Get the song object
    const audio = document.createElement("audio"); // Create a new audio element for each song
    document.body.appendChild(audio); // Append it to the DOM

    audio.src = song.url; // Assuming each song object has a URL property
    audio.preload = "auto";
    
    console.log(`Queueing song: ${song.name}, Index: ${index}, Current Runtime: ${currentRuntime}`);
    
    // When the song has ended, queue up the next one
    audio.addEventListener("ended", () => {
      const duration = audio.duration;
      console.log("Queueing next track with the following values:");
      console.log(`Queueing- Index: ${index + 1}`);
      console.log(`Queueing- Current Runtime: ${currentRuntime}`);
      queueNextTrack(songs, index + 1, currentRuntime + duration, cache); // Updated currentRuntime
    });

    // Assuming song.duration is in seconds and PREFETCH_BUFFER_SECONDS is defined
    const timeoutDurationMs = (song.duration - PREFETCH_BUFFER_SECONDS) * 1000;
    setTimeout(() => {
      if (index + 1 < songs.length) {
        const nextAudio = songs[index + 1];
        fetchAndCacheAudio(nextAudio.url, cache).then(() => console.log(`Loaded ${nextAudio.url} into cache`));
      }
    }, timeoutDurationMs);

    audio.play(); // Play the audio
  } catch (error) {
    console.error("An error occurred in queueNextTrack:", error);
  }
}






///////

function playTrack(index) {
    if (index >= curatedTracklist.length) return; // Exit if no more tracks
  
    const track = curatedTracklist[index];
    let audioElement = document.createElement("audio");
    audioElement.src = track.url;
    document.body.appendChild(audioElement);
  
    audioElement.addEventListener("ended", () => {
      audioElement.remove(); // Clean up the finished track
      playTrack(index + 1); // Play the next track
    });
  
    audioElement.play();
  }

  audio.play();