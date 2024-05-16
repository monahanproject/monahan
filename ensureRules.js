import { logRuleApplication } from './playlistBuilder.js';

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXX ENSURE RULES (NEAR THE END) XXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// Helper function to check if a tracklist contains at least one track meeting a condition
function tracklistContains(tracklist, condition) {
  return tracklist.some(condition);
}

// R21. The tracklist must contain at least one track with the author ALBERT.
export function r21(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const ruleType = `👀 Ensure rule:`;
  const logMessage = `Ensure track rule: The tracklist must contain at least one track with the author ALBERT`;

  const condition = t => t.author === "ALBERT";
  const isRuleSatisfied = tracklistContains(curatedTracklist, condition) || condition(track);

  logRuleApplication(21, track.name, logMessage, isRuleSatisfied, ruleType);
  return isRuleSatisfied;
}

// R22. The tracklist must contain at least one track with the author PIERREELLIOTT.
export function r22(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const ruleType = `👀 Ensure rule:`;
  const logMessage = `Ensure track rule: The tracklist must contain at least one track with the author PIERREELLIOTT`;

  const condition = t => t.author === "PIERREELLIOTT";
  const isRuleSatisfied = tracklistContains(curatedTracklist, condition) || condition(track);

  logRuleApplication(22, track.name, logMessage, isRuleSatisfied, ruleType);
  return isRuleSatisfied;
}

// R23. The tracklist must contain at least one track with the form interview.
export function r23(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const ruleType = `👀 Ensure rule:`;
  const logMessage = `Ensure track rule: The tracklist must contain at least one track with the form interview`;

  const condition = t => t.form === "interview";
  const isRuleSatisfied = tracklistContains(curatedTracklist, condition) || condition(track);

  logRuleApplication(23, track.name, logMessage, isRuleSatisfied, ruleType);
  return isRuleSatisfied;
}

// R24. The tracklist must contain at least one track with the form music.
export function r24(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  const ruleType = `👀 Ensure rule:`;
  const logMessage = `Ensure track rule: The tracklist must contain at least one track with the form music`;

  const condition = t => t.form === "music";
  const isRuleSatisfied = tracklistContains(curatedTracklist, condition) || condition(track);

  logRuleApplication(24, track.name, logMessage, isRuleSatisfied, ruleType);
  return isRuleSatisfied;
}
