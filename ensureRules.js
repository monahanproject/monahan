import { logRuleApplication } from './playlistBuilder.js';

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX ENSURE RULES (NEAR THE END) XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

  // R21. The tracklist must contain at least one track with the author ALBERT.
  export function r21(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
    const trackName = track.name;
    const ruleType = `👀 Ensure rule:`;
    const logMessage = `✨ ${track.name}: Ensure track rule: The tracklist must contain at least one track with the author ALBERT (track's name is ${track.name}, track's author is ${track.author})`;

    if (track.author != "ALBERT") {
      logRuleApplication(21, track.name, logMessage, false, ruleType);
      return false;
    }
    logRuleApplication(21, logMessage, true, ruleType);
    return true;
  }

  // R22. The tracklist must contain at least one track with the author PIERREELLIOTT.
  export function r22(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
    const trackName = track.name;
    const ruleType = `👀 Ensure rule:`;
    const logMessage = `Ensure track rule: The tracklist must contain at least one track with the author PIERREELLIOTT (track's name is ${track.name}, track's author is ${track.author})`;

    if (track.author !== "PIERREELLIOTT") {
      logRuleApplication(22, track.name, logMessage, false, ruleType);
      return false;
    }
    logRuleApplication(22, logMessage, true, ruleType);
    return true;
  }

  // R23. The tracklist must contain at least one track with the form interview.
  export function r23(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
    const trackName = track.name;
    const ruleType = `👀 Ensure rule:`;
    const logMessage = ` Ensure track rule: The tracklist must contain at least one track with the form interview (track's name is ${track.name}, track's form is ${track.form})`;

    if (track.form !== "interview") {
      logRuleApplication(23, track.name, logMessage, false, ruleType);
      return false;
    }
    logRuleApplication(23, logMessage, true, ruleType);
    return true;
  }

  // R24. The tracklist must contain at least one track with the form music.
  export function r24(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
    const trackName = track.name;
    const ruleType = `👀 Ensure rule:`;
    const logMessage = `Ensure track rule: The tracklist must contain at least one track with the form music (track's name is ${track.name}, track's form is ${track.form})`;

    if (track.form !== "music") {
      logRuleApplication(24, track.name, logMessage, false, ruleType);
      return false;
    }
    logRuleApplication(24, logMessage, true, ruleType);
    return true;
  }
  