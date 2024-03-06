function prepareAndQueueTracks() {
    const allSongs = [...songs];
    const shuffledSongs = shuffleTracklist(allSongs);
    curatedTracklist = followTracklistRules(shuffledSongs);
    checkPlaylistRules(curatedTracklist);

    addOutrosAndCreditsToTracklist();
    createTranscriptContainer();
    printEntireTracklistDebug(curatedTracklist);

    // Pre-cache audio tracks if needed
    window.caches.open("audio-pre-cache").then((cache) => queueNextTrack(curatedTracklist, 0, 0, cache));

    if (curatedTracklist.length > 0) {
        const audioElement = document.querySelector("audio") || document.createElement("audio");
        if (!audioElement.isConnected) {
            document.body.appendChild(audioElement);
        }
        audioElement.src = curatedTracklist[0]; // Start with the first track

        // Function to play the next track
        let currentTrackIndex = 0;
        const playNextTrack = () => {
            currentTrackIndex++;
            if (currentTrackIndex < curatedTracklist.length) {
                audioElement.src = curatedTracklist[currentTrackIndex];
                audioElement.play();
            } else {
                console.log("End of playlist");
                // Optionally, handle the end of the playlist, like looping or stopping.
            }
        };

        // Add event listener to play next track when the current one ends
        audioElement.addEventListener('ended', playNextTrack);

        // Optionally, start playing the first track automatically
        // audioElement.play();
    }

    createTimerLoopAndUpdateProgressTimer();
} 













