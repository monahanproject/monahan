import { logRuleApplication } from './playlistBuilder.js';

  //  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  //  XXXXXXXX ✉️ GENERAL RULES XXXXXXXXXX
  //  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// R10: The current track must have a different author than the last track
export function r10(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
    const trackName = track.name;
    const ruleType = `✉️ General rule:`;
    const logMessage = `The current track must have a different author (${track.author}) than the previous track (${prevTrack1.author})`;
    if (prevTrack1 && track.author === prevTrack1.author) {
      logRuleApplication(10, track.name, logMessage, false, ruleType);
      return false;
    }
    logRuleApplication(10, logMessage, true, ruleType);
    return true;
  }
  // R11: No more than one track from the same author in a tracklist
  export function r11(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
    const trackName = track.name;
    const ruleType = `✉️ General rule:`;

    // Adjust the count based on whether the track is being added for the first time
    const isNewAddition = !curatedTracklist.some((t) => t.name === track.name);
    const authorCount = curatedTracklist.filter((t) => t.author.trim() === track.author.trim()).length + (isNewAddition ? 1 : 0);

    // If there are already 2 or more tracks from the same author before this track, log a rule violation
    if (authorCount > 1) {
      const violatingTracks = curatedTracklist
        .filter((t) => t.author === track.author)
        .map((t) => t.name)
        .join(", ");
      const logMessage = `No more than one track from the same author (${track.author}) allowed in a tracklist. Violating tracks are: ${violatingTracks}`;
      logRuleApplication(11, track.name, logMessage, false, ruleType);
      return false;
    }
    // If the condition is met (no rule violation), log successful rule application
    const logMessage = `No more than one track from the same author (${track.author}) allowed in a tracklist.`;
    logRuleApplication(11, logMessage, true, ruleType);
    return true;
  }

  // R12: Tracks with the form short and the language musical can never follow tracks with the form music.
  export function r12(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
    const trackName = track.name;
    const ruleType = `✉️ General rule:`;
    const logMessage = `Tracks with form 'short' and language 'musical' (track's form is ${track.form}) and language (track's language is ${track.language}) cannot follow tracks with form 'music' (last track's form is ${prevTrack1.form})`;

    if (track.form === "short" && track.language === "musical" && prevTrack1.form === "music") {
      logRuleApplication(12, track.name, logMessage, false, ruleType);
      return false;
    }
    // If the condition is not met, return true to indicate rule followed
    logRuleApplication(12, logMessage, true, ruleType);
    return true;
  }
  // R13: Tracks with the form music can never follow tracks with BOTH the form short AND the language musical.
  export function r13(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
    const trackName = track.name;
    const ruleType = `✉️ General rule:`;
    const logMessage = `Tracks with form 'music' (track's form ${track.form}) cannot follow tracks with form 'short' and language 'musical' (last track's form was ${prevTrack1?.form} and language was ${prevTrack1?.language})`;

    if (track.form === "music" && prevTrack1 && prevTrack1.form === "short" && prevTrack1.language === "musical") {
      logRuleApplication(13, trackName, false, ruleType, logMessage);
      return false; // Rule is violated if the current track is music and previous track is short and musical
    }
    // If the condition is not met, return true to indicate rule followed
    logRuleApplication(13, trackName, true, ruleType, logMessage);
    return true;
  }

  // R14: The value for backgroundMusic should never match the author of the track right before it, and the author of the track should never match the backgroundMusic of the track right before it.
  export function r14(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
    // Safe checks for undefined properties
    const trackBackgroundMusic = track.backgroundMusic || "";
    const trackAuthor = track.author || "";
    const prevTrackAuthor = prevTrack1 && prevTrack1.author ? prevTrack1.author.trim() : "";
    const prevTrackBackgroundMusic = prevTrack1 && prevTrack1.backgroundMusic ? prevTrack1.backgroundMusic.trim() : "";

    // Log message setup
    const trackName = track.name;
    const ruleType = "✉️ General rule:";
    const logMessage = `Track (${trackName}): The background music ('${trackBackgroundMusic}') should not match the author of the previous track ('${prevTrackAuthor}'), and the author ('${trackAuthor}') should not match the background music of the previous track ('${prevTrackBackgroundMusic}')`;

    // Check if the backgroundMusic of the current track matches the author of the previous track
    const backgroundMusicViolation = trackBackgroundMusic !== "" && trackBackgroundMusic === prevTrackAuthor;

    // Check if the author of the current track matches the backgroundMusic of the previous track
    const authorViolation = trackAuthor !== "" && trackAuthor === prevTrackBackgroundMusic;

    if (prevTrack1 && (backgroundMusicViolation || authorViolation)) {
      logRuleApplication(14, trackName, logMessage, false, ruleType); // Log rule violation
      return false; // Rule violation
    }

    logRuleApplication(14, trackName, logMessage, true, ruleType); // Log rule followed
    return true; // Rule followed
  }

  // R15: If the previous track has the sentiment heavy, this track cannot have the the laughter tag.
  export function r15(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
    const trackName = track.name;
    const ruleType = `✉️ General rule:`;
    const logMessage = `If the previous track has the sentiment heavy (previous track's sentiment is ${prevTrack1.sentiment}), this track cannot have the laughter tag (track's tags are ${track.tags})`;
    if (track.tags.includes("laughter") && prevTrack1.sentiment === "heavy") {
      logRuleApplication(15, track.name, logMessage, false, ruleType);
      return false;
    }
    // If the condition is not met, return true to indicate rule followed
    logRuleApplication(15, logMessage, true, ruleType);
    return true;
  }
  // R16: If the previous track has length long and form music, this track must have the form interview or poetry`;
  export function r16(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
    const trackName = track.name;
    const ruleType = `✉️ General rule:`;
    const logMessage = `If the previous track has length 'long' and form 'music' (previous track's length is ${prevTrack1.length} and form is ${prevTrack1.form}), this track must have the form 'interview' or 'poetry' (current track's form is ${track.form})`;

    if (prevTrack1 && prevTrack1.length === "long" && prevTrack1.form === "music") {
      // findme
      if (track.form !== "interview" && track.form !== "poetry") {
        logRuleApplication(16, track.name, logMessage, false, ruleType);
        return false; // Rule is broken if the current track is not an interview.
      }
    }
    // If the rule is not violated or does not apply, return true and log.
    logRuleApplication(16, logMessage, true, ruleType);
    return true;
  }