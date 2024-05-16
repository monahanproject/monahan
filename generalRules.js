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
    logRuleApplication(10, trackName, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(10, trackName, logMessage, true, ruleType);
  return true;
}

// R11: No more than one track from the same author in a tracklist
export function r11(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const trackName = track.name;
  const ruleType = `✉️ General rule:`;

  const isNewAddition = !curatedTracklist.some((t) => t.name === track.name);
  const authorCount = curatedTracklist.filter((t) => t.author.trim() === track.author.trim()).length + (isNewAddition ? 1 : 0);

  if (authorCount > 1) {
    const violatingTracks = curatedTracklist
      .filter((t) => t.author === track.author)
      .map((t) => t.name)
      .join(", ");
    const logMessage = `No more than one track from the same author (${track.author}) allowed in a tracklist. Violating tracks are: ${violatingTracks}`;
    logRuleApplication(11, trackName, logMessage, false, ruleType);
    return false;
  }
  const logMessage = `No more than one track from the same author (${track.author}) allowed in a tracklist.`;
  logRuleApplication(11, trackName, logMessage, true, ruleType);
  return true;
}

// R12: Tracks with the form short and the language musical can never follow tracks with the form music.
export function r12(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const trackName = track.name;
  const ruleType = `✉️ General rule:`;
  const logMessage = `Tracks with form 'short' and language 'musical' (track's form is ${track.form}) and language (track's language is ${track.language}) cannot follow tracks with form 'music' (last track's form is ${prevTrack1.form})`;

  if (track.form === "short" && track.language === "musical" && prevTrack1.form === "music") {
    logRuleApplication(12, trackName, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(12, trackName, logMessage, true, ruleType);
  return true;
}

// R13: Tracks with the form music can never follow tracks with BOTH the form short AND the language musical.
export function r13(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const trackName = track.name;
  const ruleType = `✉️ General rule:`;
  const logMessage = `Tracks with form 'music' (track's form ${track.form}) cannot follow tracks with form 'short' and language 'musical' (last track's form was ${prevTrack1?.form} and language was ${prevTrack1?.language})`;

  if (track.form === "music" && prevTrack1 && prevTrack1.form === "short" && prevTrack1.language === "musical") {
    logRuleApplication(13, trackName, logMessage, false, ruleType);
    return false; // Rule is violated if the current track is music and previous track is short and musical
  }
  logRuleApplication(13, trackName, logMessage, true, ruleType);
  return true;
}

// R14: The value for backgroundMusic should never match the author of the track right before it, and the author of the track should never match the backgroundMusic of the track right before it.
export function r14(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const trackName = track.name;
  const ruleType = "✉️ General rule:";
  const trackBackgroundMusic = track.backgroundMusic || "";
  const trackAuthor = track.author || "";
  const prevTrackAuthor = prevTrack1?.author?.trim() || "";
  const prevTrackBackgroundMusic = prevTrack1?.backgroundMusic?.trim() || "";
  const logMessage = `Track (${trackName}): The background music ('${trackBackgroundMusic}') should not match the author of the previous track ('${prevTrackAuthor}'), and the author ('${trackAuthor}') should not match the background music of the previous track ('${prevTrackBackgroundMusic}')`;

  const backgroundMusicViolation = trackBackgroundMusic === prevTrackAuthor;
  const authorViolation = trackAuthor === prevTrackBackgroundMusic;

  if (prevTrack1 && (backgroundMusicViolation || authorViolation)) {
    logRuleApplication(14, trackName, logMessage, false, ruleType); // Log rule violation
    return false; // Rule violation
  }

  logRuleApplication(14, trackName, logMessage, true, ruleType); // Log rule followed
  return true; // Rule followed
}

// R15: If the previous track has the sentiment heavy, this track cannot have the laughter tag.
export function r15(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const trackName = track.name;
  const ruleType = `✉️ General rule:`;
  const logMessage = `If the previous track has the sentiment heavy (previous track's sentiment is ${prevTrack1.sentiment}), this track cannot have the laughter tag (track's tags are ${track.tags})`;

  if (prevTrack1.sentiment === "heavy" && track.tags.includes("laughter")) {
    logRuleApplication(15, trackName, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(15, trackName, logMessage, true, ruleType);
  return true;
}

// R16: If the previous track has length long and form music, this track must have the form interview or poetry
export function r16(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const trackName = track.name;
  const ruleType = `✉️ General rule:`;
  const logMessage = `If the previous track has length 'long' and form 'music' (previous track's length is ${prevTrack1.length} and form is ${prevTrack1.form}), this track must have the form 'interview' or 'poetry' (current track's form is ${track.form})`;

  if (prevTrack1 && prevTrack1.length === "long" && prevTrack1.form === "music") {
    if (track.form !== "interview" && track.form !== "poetry") {
      logRuleApplication(16, trackName, logMessage, false, ruleType);
      return false; // Rule is broken if the current track is not an interview.
    }
  }
  logRuleApplication(16, trackName, logMessage, true, ruleType);
  return true;
}

// R17: The current track must have a different form than previous track
export function r17(track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  const trackName = track.name;
  const ruleType = `✉️ General rule:`;
  const logMessage = `${track.name} The current track must have a different form (track's form is ${track.form}) than the previous track (the previous track's form is ${prevTrack1.form})`;

  if (track.form && track.form === prevTrack1.form) {
    logRuleApplication(17, trackName, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(17, trackName, logMessage, true, ruleType);
  return true;
}
