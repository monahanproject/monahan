import { logRuleApplication } from './play.js';

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX 📙 Specific track rules (TRACKS 1-8) XXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// R00: Rule 0 (only for Track 0): The Oth track must have the placement end (we'll be moving this to the end).
// export function r60(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
//   const trackName = track.name;
//   const ruleType = `📙 Base track rule:`;
//   const logMessage = `${track.name} The 0th (eventually final) track includes the placement end (placement ${track.placement})`;

//   if (trackIndex === 0 && !track.placement.includes("end")) {
//     logRuleApplication(60, track.name, logMessage, false, ruleType);
//     return false;
//   }
//   // If the conditions are met, return true to indicate rule followed
//   logRuleApplication(60, logMessage, true, ruleType);
//   return true;
// }

// R61: Rule 1 (only for Track 1): The 1st track must have the tag 'intro'.
export function r61(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The track's index is ${trackIndex}. The 1st track must have the tag intro (track's tags are ${track.tags})`;

  if (trackIndex === 1 && !track.tags.includes("intro")) {
    logRuleApplication(61, track.name, logMessage, false, ruleType);
    return false;
  }
  // If the conditions are met, return true to indicate rule followed
  logRuleApplication(61, logMessage, true, ruleType);
  return true;
}

// R62: Rule 2 (only for Track 2):The 2nd track must have the placement 'beginning'.
export function r62(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The track's index is ${trackIndex}. The 2nd track must have the placement beginning (track's placement is ${track.placement})`;

  if (trackIndex === 2 && !track.placement.includes("beginning")) {
    logRuleApplication(62, track.name, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(62, logMessage, true, ruleType);
  return true;
}

// R63: Rule 3 (only for Track 3): The 3rd track must have the placement beginning and a different form than the 2nd track.
export function r63(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The track's index is ${trackIndex}. The 3rd track must have the placement beginning (track's placement is ${track.placement}) and a different form (track's form is ${track.form}) than the 2nd track (the 2nd track's form is ${prevTrack1.form})`;

  if ((trackIndex === 3 && !track.placement.includes("beginning")) || (trackIndex === 3 && track.form === prevTrack1.form)) {
    logRuleApplication(63, track.name, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(63, logMessage, true, ruleType);
  return true;
}

// R64: Rule 4 (only for Track 4): The 4th track must have the placement middle and a different form than the 3rd track.
export function r64(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The track's index is ${trackIndex}. The 4th track must have the placement middle (track's placement is ${track.placement}); and a different form (track's form is ${track.form}); than the 3rd track (the 3rd track's form is ${prevTrack1.form})`;

  if ((trackIndex === 4 && !track.placement.includes("middle")) || (trackIndex === 4 && track.form === prevTrack1.form)) {
    logRuleApplication(64, track.name, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(64, logMessage, true, ruleType);
  return true;
}

// R65: Rule 5 (only for Track 5): The 5th track must have the length 'short'; must have the placement 'middle'; and have a different form than the 4th track.
export function r65(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The track's index is ${trackIndex}. The 5th track must have the length short (track's length is ${track.length}); must have the placement MIDDLE (track's placement is ${track.placement}); and a different form (track's form is ${track.form}) from the 4th track (the 4th track's form is ${prevTrack1.form})`;

  if (
    (trackIndex === 5 && track.length !== "short") ||
    (trackIndex === 5 && !track.placement.includes("middle")) ||
    (trackIndex === 5 && track.form === prevTrack1.form)
  ) {
    logRuleApplication(65, track.name, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(65, logMessage, true, ruleType);
  return true;
}

// R66: Rule 6 (only for Track 6): The 6th track must have the placement 'middle' and a different form than the 5th track.
export function r66(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `The track's index is ${trackIndex}. The 6th track has the placement MIDDLE (track's placement is ${track.placement}); and has a different form (track's form is ${track.form}) vs the 5th track (the 5th's track's form is ${prevTrack1.form})`;

  if (trackIndex === 6 && !track.placement.includes("middle")) {
    logRuleApplication(66, track.name, logMessage, false, ruleType);
    return false;
  }
  if (trackIndex === 6 && track.form === prevTrack1.form) {
    logRuleApplication(66, track.name, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(66, logMessage, true, ruleType);
  return true;
}

// R67: Rule 7 (only for Track 7): The 7th track must have the placement 'middle' and a different form than the 6th track
export function r67(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The track's index is ${trackIndex}. The 7th track must have the placement MIDDLE (track's placement is ${track.placement}) and has a different form (track's form is ${track.form}) vs the 6th track (the 6th track's form is ${prevTrack1.form}); AND unless the form of the 7th track is MUSIC (the 7th track's form is ${track.form}), the 7th track also has a different language (the 7th track's language is ${track.language}) from the 6th track (the 6th track's language is ${prevTrack1.language})`;

  if (trackIndex === 7 && (!track.placement.includes("middle") || (track.form === prevTrack1.form && track.form !== "music"))) {
    logRuleApplication(67, track.name, logMessage, false, ruleType);
    return false;
  }
  if (trackIndex === 7 && track.form === prevTrack1.form) {
    logRuleApplication(67, track.name, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(67, logMessage, true, ruleType);
  return true;
}

// R68: Rule 8 (only for Track 8): The 8th track must have the placement 'middle', a different form than previous track
export function r68(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const trackName = track.name;
  const ruleType = `📙 Base track rule:`;
  const logMessage = `${track.name} The track's index is ${trackIndex}. The 8th track must have the placement MIDDLE (track's placement is ${track.placement}); and a different form (track's form is ${track.form}) vs the 7th track (the 7th track's form is ${prevTrack1.form}) or 6th track (the 6th track's form is ${prevTrack2.form}); and has a different language (track's language is ${track.language}) vs the 7th track (the 7th track's language is ${prevTrack1.language}) or the 6th track (the 6th track's language is ${prevTrack2.language})`;

  if (trackIndex === 8 && (!track.placement.includes("middle") || (track.form === prevTrack1.form && track.form !== "music"))) {
    logRuleApplication(68, track.name, logMessage, false, ruleType);
    return false;
  }
  if (trackIndex === 8 && track.form === prevTrack1.form) {
    logRuleApplication(68, track.name, logMessage, false, ruleType);
    return false;
  }
  logRuleApplication(68, logMessage, true, ruleType);
  return true;
}