import { logRuleApplication } from './playlistBuilder.js';

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX 📙 Specific track rules (TRACKS 1-8) XXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// R61: Rule 1 (only for Track 1): The 1st track must have the tag 'intro'.
export function r61(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `The 1st track must have the tag 'intro' (track's tags are ${track.tags})`;

  if (trackIndex === 1 && !track.tags.includes("intro")) {
    logRuleApplication(61, trackName, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(61, trackName, logMessage, true, ruleType);
  return true;
}

// R62: Rule 2 (only for Track 2): The 2nd track must have the placement 'beginning'.
export function r62(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `The 2nd track must have the placement 'beginning' (track's placement is ${track.placement})`;

  if (trackIndex === 2 && !track.placement.includes("beginning")) {
    logRuleApplication(62, trackName, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(62, trackName, logMessage, true, ruleType);
  return true;
}

// R63: Rule 3 (only for Track 3): The 3rd track must have the placement 'beginning' and a different form than the 2nd track.
export function r63(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `The 3rd track must have the placement 'beginning' (track's placement is ${track.placement}) and a different form (track's form is ${track.form}) than the 2nd track (the 2nd track's form is ${prevTrack1.form})`;

  if (trackIndex === 3 && (!track.placement.includes("beginning") || track.form === prevTrack1.form)) {
    logRuleApplication(63, trackName, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(63, trackName, logMessage, true, ruleType);
  return true;
}

// R64: Rule 4 (only for Track 4): The 4th track must have the placement 'middle' and a different form than the 3rd track.
export function r64(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `The 4th track must have the placement 'middle' (track's placement is ${track.placement}) and a different form (track's form is ${track.form}) than the 3rd track (the 3rd track's form is ${prevTrack1.form})`;

  if (trackIndex === 4 && (!track.placement.includes("middle") || track.form === prevTrack1.form)) {
    logRuleApplication(64, trackName, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(64, trackName, logMessage, true, ruleType);
  return true;
}

// R65: Rule 5 (only for Track 5): The 5th track must have the length 'short', the placement 'middle', and a different form than the 4th track.
export function r65(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `The 5th track must have the length 'short' (track's length is ${track.length}), the placement 'middle' (track's placement is ${track.placement}), and a different form (track's form is ${track.form}) than the 4th track (the 4th track's form is ${prevTrack1.form})`;

  if (trackIndex === 5 && (track.length !== "short" || !track.placement.includes("middle") || track.form === prevTrack1.form)) {
    logRuleApplication(65, trackName, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(65, trackName, logMessage, true, ruleType);
  return true;
}

// R66: Rule 6 (only for Track 6): The 6th track must have the placement 'middle' and a different form than the 5th track.
export function r66(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `The 6th track must have the placement 'middle' (track's placement is ${track.placement}) and a different form (track's form is ${track.form}) than the 5th track (the 5th track's form is ${prevTrack1.form})`;

  if (trackIndex === 6 && (!track.placement.includes("middle") || track.form === prevTrack1.form)) {
    logRuleApplication(66, trackName, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(66, trackName, logMessage, true, ruleType);
  return true;
}

// R67: Rule 7 (only for Track 7): The 7th track must have the placement 'middle' and a different form than the 6th track.
export function r67(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `The 7th track must have the placement 'middle' (track's placement is ${track.placement}) and a different form (track's form is ${track.form}) than the 6th track (the 6th track's form is ${prevTrack1.form})`;

  if (trackIndex === 7 && (!track.placement.includes("middle") || track.form === prevTrack1.form)) {
    logRuleApplication(67, trackName, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(67, trackName, logMessage, true, ruleType);
  return true;
}

// R68: Rule 8 (only for Track 8): The 8th track must have the placement 'middle', a different form than the previous track.
export function r68(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `The 8th track must have the placement 'middle' (track's placement is ${track.placement}) and a different form (track's form is ${track.form}) than the 7th track (the 7th track's form is ${prevTrack1.form})`;

  if (trackIndex === 8 && (!track.placement.includes("middle") || track.form === prevTrack1.form)) {
    logRuleApplication(68, trackName, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(68, trackName, logMessage, true, ruleType);
  return true;
}

// R69: Rule 9 (only for Track 9): The 9th track must have a different form than the previous track.
export function r69(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `The 9th track must have a different form (track's form is ${track.form}) than the 8th track (the 8th track's form is ${prevTrack1.form})`;

  if (trackIndex === 9 && track.form === prevTrack1.form) {
    logRuleApplication(69, trackName, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(69, trackName, logMessage, true, ruleType);
  return true;
}

// R70: Rule 10 (only for Track 10): The 10th track must have a different form than the previous track.
export function r70(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `The 10th track must have a different form (track's form is ${track.form}) than the 9th track (the 9th track's form is ${prevTrack1.form})`;

  if (trackIndex === 10 && track.form === prevTrack1.form) {
    logRuleApplication(70, trackName, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(70, trackName, logMessage, true, ruleType);
  return true;
}
