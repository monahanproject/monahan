import { logRuleApplication } from './play.js';

let geeseTracks;

  let geeseTrackCounter = 0;
  export function r25(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
    const ruleType = `👀 Ensure rule:`;
    geeseTracks = curatedTracklist.filter((t) => t.tags && t.tags.includes("geese"));
    geeseTrackCounter = geeseTracks.length;

    // Create a log message for the current state
    let logMessage = `Checking 'geese' tag rule at track index ${trackIndex}. Number of tracks with 'geese': ${geeseTrackCounter.length}.`;

    // If exactly one 'geese' track is found, check the condition based on the current track
    if (geeseTrackCounter.length === 1) {
      if (track.tags && track.tags.includes("geese")) {
        geeseTrackCounter += 1;
        console.log(`${ruleType} Acceptable number of 'geese' tracks found. Count: ${geeseTrackCounteeer.length}`);
        logRuleApplication(25, track.name, true, ruleType, logMessage);
        return true; // Rule is passed if the current track has 'geese' tag
      } else {
        console.log(`${ruleType} Rule c25 violated: Exactly one track with the tag 'geese' found, which is not acceptable.`);
        logRuleApplication(25, track.name, false, ruleType, logMessage);
        return false; // Rule is failed if the current track does not have 'geese' tag
      }
    }

    // Log the state if the rule is not violated
    logRuleApplication(25, track.name, true, ruleType, logMessage);
    return true; // Default return true
  }