// Import necessary modules and rules
import { r10, r11, r12, r13, r14, r15, r16, r17 } from "./generalRules.js";
import { r21, r22, r23, r24 } from "./ensureRules.js";
import { r61, r62, r63, r64, r65, r66, r67, r68, r69, r70 } from "./specificRules.js";
import {
  r10rule,
  r11rule,
  r12rule,
  r13rule,
  r14rule,
  r15rule,
  r16rule,
  r17rule,
  r21rule,
  r22rule,
  r23rule,
  r24rule,
  r25rule,
  r61rule,
  r62rule,
  r63rule,
  r64rule,
  r65rule,
  r66rule,
  r67rule,
  r68rule,
  r69rule,
  r70rule
} from "./ruleStrings.js";
import { shuffleTracklist, shuffleArrayOfRules } from "./shuffleTracklist.js";

// Maximum playlist duration and tracklist duration variables
let MAX_PLAYLIST_DURATION_SECONDS = 1140; //(19m)
let myTracklistDuration = 0;
let CREDITSANDOUTROESTDUR = 44;
let lastTrackEstDur = 150;
let modifiedMaxPlaylistDurationSecs;

let geeseTrackCounter = 0;

/**
 * Updates the geese track counter and rearranges the tracklist if necessary.
 * @param {object} track - The current track object.
 * @param {array} tracklist - The current tracklist array.
 * @returns {array} - The rearranged tracklist.
 */
function updateGeeseTrackCounterAndRearrange(track, tracklist) {
  if (track.tags && track.tags.includes("geese")) {
    geeseTrackCounter++;
    if (geeseTrackCounter === 1) {
      const geeseTracks = tracklist.filter(t => t.tags && t.tags.includes("geese"));
      const nonGeeseTracks = tracklist.filter(t => !t.tags || !t.tags.includes("geese"));
      return insertGeeseTracksAfterIndex(geeseTracks, nonGeeseTracks, 3);
    } else if (geeseTrackCounter > 1) {
      return tracklist.filter(t => !t.tags || !t.tags.includes("geese"));
    }
  }
  return tracklist;
}

/**
 * Inserts geese tracks after a specified index in the non-geese tracks array.
 * @param {array} geeseTracks - Array of geese tracks.
 * @param {array} nonGeeseTracks - Array of non-geese tracks.
 * @param {number} index - Index after which geese tracks should be inserted.
 * @returns {array} - The rearranged tracklist.
 */
function insertGeeseTracksAfterIndex(geeseTracks, nonGeeseTracks, index) {
  const rearrangedTracklist = [];
  let nonGeeseCount = 0;
  for (let i = 0; i < nonGeeseTracks.length; i++) {
    rearrangedTracklist.push(nonGeeseTracks[i]);
    nonGeeseCount++;
    if (nonGeeseCount === index) {
      rearrangedTracklist.push(...geeseTracks);
    }
  }
  return rearrangedTracklist;
}

/**
 * Updates the duration of the curated tracklist.
 * @param {array} curatedTracklist - The curated tracklist array.
 * @returns {number} - The total duration of the curated tracklist.
 */
export function updatePlaylistDuration(curatedTracklist) {
  myTracklistDuration = curatedTracklist.reduce((total, track) => total + (track.duration || 0), 0);
  return myTracklistDuration;
}

/**
 * Checks if a new track can be added without exceeding the maximum playlist duration.
 * @param {number} newTrackDuration - The duration of the new track.
 * @param {number} myCurrentTracklistDuration - The current total duration of the tracklist.
 * @returns {boolean} - Whether the track can be added.
 */
function canAddTrackWithoutBreakingMaxPlaylistDur(newTrackDuration, myCurrentTracklistDuration) {
  return myCurrentTracklistDuration + (newTrackDuration || 0) <= modifiedMaxPlaylistDurationSecs;
}

/**
 * Checks if the last track can be added without exceeding the maximum playlist duration.
 * @param {number} newTrackDuration - The duration of the new track.
 * @param {number} myCurrentTracklistDuration - The current total duration of the tracklist.
 * @returns {boolean} - Whether the last track can be added.
 */
function canAddLastTrack(newTrackDuration, myCurrentTracklistDuration) {
  return myCurrentTracklistDuration + newTrackDuration <= MAX_PLAYLIST_DURATION_SECONDS;
}

/**
 * Adds the next valid track to the curated tracklist and updates its duration.
 * @param {object} track - The track object to add.
 * @param {array} curatedTracklist - The curated tracklist array.
 * @param {array} tracks - The original tracklist array.
 */
function addNextValidTrackAndUpdateMyTracklistDur(track, curatedTracklist, tracks) {
  curatedTracklist.push(track);
  myTracklistDuration = updatePlaylistDuration(curatedTracklist);
  const trackIndex = tracks.findIndex((t) => t === track);
  if (trackIndex !== -1) {
    tracks.splice(trackIndex, 1);
  }
}

/**
 * Adds the duration of a track to the total time in seconds.
 * @param {number} totalTimeInSecs - The current total time in seconds.
 * @param {object} track - The track object.
 * @returns {number} - The updated total time in seconds.
 */
function addTrackDurationToTotal(totalTimeInSecs, track) {
  return totalTimeInSecs + (track.duration || 0);
}

/**
 * Initializes an empty curated tracklist.
 * @returns {array} - An empty array.
 */
function initializeCuratedTracklist() {
  return [];
}

/**
 * Initializes the general rules.
 * @returns {array} - An array of general rule functions.
 */
function initializeGeneralRules() {
  return [r10, r11, r12, r13, r14, r15, r16, r17];
}

/**
 * Initializes the ensure rules by shuffling them and marking them as unenforced.
 * @param {array} rules - The array of ensure rules.
 * @param {array} fixedRules - The array of fixed rules that should not be shuffled.
 * @returns {object} - An object containing the shuffled ensure rules and their enforcement status.
 */
function initializeEnsureRules(rules, fixedRules = []) {
  const rulesToShuffle = rules.filter((rule) => !fixedRules.includes(rule));
  const shuffledEnsureRules = shuffleArrayOfRules(rulesToShuffle).concat(fixedRules);

  const ensureRulesEnforced = {};
  shuffledEnsureRules.forEach((rule) => {
    ensureRulesEnforced[`r${parseInt(rule.name.match(/\d+/)[0])}`] = false;
  });

  return { shuffledEnsureRules, ensureRulesEnforced };
}

/**
 * Logs the application of a rule.
 * @param {number} ruleNumber - The rule number.
 * @param {string} trackName - The name of the track.
 * @param {string} logMessage - The log message.
 * @param {boolean} isApplied - Whether the rule was applied.
 * @param {string} ruleType - The type of the rule.
 */
export function logRuleApplication(ruleNumber, trackName, logMessage, isApplied, ruleType) {
  const ruleStatus = isApplied ? "passed" : "failed";
  const statusIcon = isApplied ? "🌱" : "🫧";
  console.log(`${statusIcon} R${ruleNumber} ${ruleStatus} ${trackName} ${logMessage}`);
}

/**
 * Updates the previous tracks with the current track.
 * @param {object} track - The current track.
 * @param {object} prevTrack1 - The previous track 1.
 * @param {object} prevTrack2 - The previous track 2.
 * @returns {array} - An array containing the updated previous tracks.
 */
function updatePrevTracks(track, prevTrack1, prevTrack2) {
  if (prevTrack1 === null) {
    prevTrack1 = track;
  } else if (prevTrack2 === null) {
    prevTrack2 = prevTrack1;
    prevTrack1 = track;
  } else {
    prevTrack2 = prevTrack1;
    prevTrack1 = track;
  }
  return [prevTrack1, prevTrack2];
}

/**
 * Ensures that all general rules are met for the given track.
 * @param {array} generalRuleFunctions - The array of general rule functions.
 * @param {object} track - The track object.
 * @param {object} prevTrack1 - The previous track 1.
 * @param {object} prevTrack2 - The previous track 2.
 * @param {array} curatedTracklist - The curated tracklist array.
 * @param {number} currIndex - The current index in the tracklist.
 * @returns {boolean} - Whether all general rules are met.
 */
function ensureGeneralRules(generalRuleFunctions, track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  for (const generalRule of generalRuleFunctions) {
    let safePrevTrack1 = prevTrack1 || {};
    let safePrevTrack2 = prevTrack2 || {};

    if (!generalRule(track, safePrevTrack1, safePrevTrack2, curatedTracklist, currIndex)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if the track is valid for general rules.
 * @param {object} track - The track object.
 * @param {object} prevTrack1 - The previous track 1.
 * @param {object} prevTrack2 - The previous track 2.
 * @param {array} curatedTracklist - The curated tracklist array.
 * @param {number} index - The current index in the tracklist.
 * @param {array} generalRuleFunctions - The array of general rule functions.
 * @returns {boolean} - Whether the track is valid for general rules.
 */
function isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, index, generalRuleFunctions) {
  return generalRuleFunctions.every((rule) => rule(track, prevTrack1, prevTrack2, curatedTracklist, index));
}

/**
 * Applies a specific rule to a track.
 * @param {function} ruleFunction - The specific rule function.
 * @param {object} track - The track object.
 * @param {object} prevTrack1 - The previous track 1.
 * @param {object} prevTrack2 - The previous track 2.
 * @param {array} curatedTracklist - The curated tracklist array.
 * @param {number} trackIndex - The current index in the tracklist.
 * @returns {boolean} - Whether the rule was successfully applied.
 */
function applySpecificRule(ruleFunction, track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  return ruleFunction(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex);
}

/**
 * Applies general rules to a track.
 * @param {array} generalRuleFunctions - The array of general rule functions.
 * @param {object} track - The track object.
 * @param {object} prevTrack1 - The previous track 1.
 * @param {object} prevTrack2 - The previous track 2.
 * @param {array} curatedTracklist - The curated tracklist array.
 * @param {number} trackIndex - The current index in the tracklist.
 * @returns {boolean} - Whether all general rules were successfully applied.
 */
function applyGeneralRules(generalRuleFunctions, track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  return isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex, generalRuleFunctions);
}

/**
 * Ensures that the track meets all the ensure rules.
 * @param {object} track - The track object.
 * @param {number} currIndex - The current index in the tracklist.
 * @param {array} ensureRules - The array of ensure rules.
 * @param {object} ensureRulesEnforced - The object containing the enforcement status of ensure rules.
 * @param {array} curatedTracklist - The curated tracklist array.
 * @returns {boolean} - Whether the track meets all the ensure rules.
 */
function ensureTrack(track, currIndex, ensureRules, ensureRulesEnforced, curatedTracklist) {
  for (const rule of ensureRules) {
    const ruleNumber = parseInt(rule.name.match(/\d+/)[0]);

    if (!isEnsureRuleEnforced(ensureRulesEnforced, ruleNumber)) {
      if (!rule(track, null, null, curatedTracklist, currIndex)) {
        return false; // Ensure rule failed
      }
      markEnsureRuleEnforced(ensureRulesEnforced, ruleNumber);
    }
  }
  return true;
}

/**
 * Checks if all ensure rules are enforced.
 * @param {object} ensureRulesEnforced - The object containing the enforcement status of ensure rules.
 * @returns {boolean} - Whether all ensure rules are enforced.
 */
function checkAllEnsureRulesEnforced(ensureRulesEnforced) {
  return Object.values(ensureRulesEnforced).every((flag) => flag === true);
}

/**
 * Checks if a specific ensure rule is enforced.
 * @param {object} ensureRulesEnforced - The object containing the enforcement status of ensure rules.
 * @param {number} ruleNumber - The rule number.
 * @returns {boolean} - Whether the specific ensure rule is enforced.
 */
function isEnsureRuleEnforced(ensureRulesEnforced, ruleNumber) {
  return ensureRulesEnforced[`r${ruleNumber}`];
}

/**
 * Marks a specific ensure rule as enforced.
 * @param {object} ensureRulesEnforced - The object containing the enforcement status of ensure rules.
 * @param {number} ruleNumber - The rule number.
 */
function markEnsureRuleEnforced(ensureRulesEnforced, ruleNumber) {
  ensureRulesEnforced[`r${ruleNumber}`] = true;
}

/**
 * Filters the potential last tracks from the tracklist.
 * @param {array} tracklist - The tracklist array.
 * @param {array} curatedTracklist - The curated tracklist array.
 * @param {array} generalRuleFunctions - The array of general rule functions.
 * @returns {array} - The array of potential last tracks.
 */
function preFilterLastTracks(tracklist, curatedTracklist, generalRuleFunctions) {
  let potentialLastTracks = [];
  let indexesToRemove = [];

  for (let i = 0; i < tracklist.length; i++) {
    let track = tracklist[i];
    if (track.placement.includes("end")) {
      potentialLastTracks.push(track);
      indexesToRemove.push(i);
    }
  }

  for (let i = indexesToRemove.length - 1; i >= 0; i--) {
    tracklist.splice(indexesToRemove[i], 1);
  }

  return potentialLastTracks;
}

/**
 * Checks if a track is already in the curated tracklist.
 * @param {object} track - The track object.
 * @param {array} curatedTracklist - The curated tracklist array.
 * @returns {boolean} - Whether the track is already in the curated tracklist.
 */
function trackAlreadyInList(track, curatedTracklist) {
  return curatedTracklist.some((curatedTrack) => curatedTrack.name === track.name);
}

/**
 * Attempts to add the last track to the curated tracklist.
 * @param {array} curatedTracklist - The curated tracklist array.
 * @param {array} potentialLastTracks - The array of potential last tracks.
 * @param {array} generalRuleFunctions - The array of general rule functions.
 * @returns {array} - The possibly modified curated tracklist.
 */
function attemptToAddLastTrack(curatedTracklist, potentialLastTracks, generalRuleFunctions) {
  let lastTrackAdded = false;

  for (let lastTrack of potentialLastTracks) {
    if (
      !trackAlreadyInList(lastTrack, curatedTracklist) &&
      canAddLastTrack(lastTrack.duration, updatePlaylistDuration(curatedTracklist)) &&
      ensureGeneralRules(
        generalRuleFunctions,
        lastTrack,
        curatedTracklist[curatedTracklist.length - 1],
        curatedTracklist[curatedTracklist.length - 2],
        curatedTracklist,
        curatedTracklist.length
      )
    ) {
      addNextValidTrackAndUpdateMyTracklistDur(lastTrack, curatedTracklist, potentialLastTracks);
      lastTrackAdded = true;
      break; // Exit the loop once a last track is successfully added
    }
  }

  if (!lastTrackAdded) {
    console.log("Unable to add a suitable last track within the duration limit.");
  }

  return curatedTracklist;
}

/**
 * Executes Phase 1: Applying specific rules and general rules.
 * @param {array} tracklist - The tracklist array.
 * @param {array} curatedTracklist - The curated tracklist array.
 * @param {array} generalRuleFunctions - The array of general rule functions.
 */
function executePhase1(tracklist, curatedTracklist, generalRuleFunctions) {
  const specificRuleFunctions = [r61, r62, r63, r64, r65, r66, r67, r68];
  let ruleFailureCounts = specificRuleFunctions.map(() => 0);
  let prevTrack1 = null;
  let prevTrack2 = null;
  let trackIndex = 0;

  for (let i = 0; i < specificRuleFunctions.length; i++) {
    let ruleMet = false;
    let tracksTried = 0;
    let specificRuleDescription = eval(`r${61 + i}rule`);

    while (!ruleMet && tracksTried < tracklist.length) {
      if (Math.abs(myTracklistDuration - modifiedMaxPlaylistDurationSecs) < 20) {
        break;
      }

      let track = tracklist[tracksTried];

      if (canAddTrackWithoutBreakingMaxPlaylistDur(track.duration, myTracklistDuration)) {
        if (applySpecificRule(specificRuleFunctions[i], track, prevTrack1, prevTrack2, curatedTracklist, trackIndex + 1)) {
          if (i < 2 || isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex, generalRuleFunctions)) {
            addNextValidTrackAndUpdateMyTracklistDur(track, curatedTracklist, tracklist);
            [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
            trackIndex++;
            ruleMet = true;
            break;
          }
        } else {
          ruleFailureCounts[i]++;
        }
      }
      tracksTried++;
    }

    if (!ruleMet) {
      const mostFrequentRuleIndex = ruleFailureCounts.indexOf(Math.max(...ruleFailureCounts));
      const mostFrequentRuleDescription = eval(`r${61 + mostFrequentRuleIndex}rule`);
      console.log(`No suitable track found for specific rule: ${specificRuleDescription}. Most frequently broken rule: ${mostFrequentRuleDescription}`);
    }
  }
}

/**
 * Executes Phase 2: Ensuring rules and final check rules.
 * @param {array} tracklist - The tracklist array.
 * @param {array} curatedTracklist - The curated tracklist array.
 * @param {array} generalRuleFunctions - The array of general rule functions.
 * @param {array} shuffledEnsureRules - The array of shuffled ensure rules.
 * @param {object} ensureRulesEnforced - The object containing the enforcement status of ensure rules.
 */
function executePhase2(tracklist, curatedTracklist, generalRuleFunctions, shuffledEnsureRules, ensureRulesEnforced) {
  let prevTrack1 = curatedTracklist.length > 0 ? curatedTracklist[curatedTracklist.length - 1] : null;
  let prevTrack2 = curatedTracklist.length > 1 ? curatedTracklist[curatedTracklist.length - 2] : null;

  for (let rule of shuffledEnsureRules) {
    let ruleMet = false;
    let ruleNumber = rule.name.replace("r", "");
    let ruleDescVarName = `r${ruleNumber}rule`;
    let ruleDescription = eval(ruleDescVarName);

    for (let track of curatedTracklist) {
      if (rule(track, null, null, curatedTracklist, curatedTracklist.indexOf(track))) {
        markEnsureRuleEnforced(ensureRulesEnforced, ruleNumber);
        ruleMet = true;
        break;
      }
    }

    if (!ruleMet) {
      for (let track of tracklist) {
        if (canAddTrackWithoutBreakingMaxPlaylistDur(track.duration, myTracklistDuration) && !trackAlreadyInList(track, curatedTracklist)) {
          if (
            rule(track, null, null, curatedTracklist, curatedTracklist.length) &&
            isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, curatedTracklist.length, generalRuleFunctions)
          ) {
            addNextValidTrackAndUpdateMyTracklistDur(track, curatedTracklist, tracklist);
            [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
            ruleMet = true;
            markEnsureRuleEnforced(ensureRulesEnforced, ruleNumber);
            break;
          }
        }
      }
    }

    if (!ruleMet) {
      console.log(`Unable to find a track to satisfy the rule: ${ruleDescription}. Consider adjusting your rules or tracklist.`);
    }
  }
}

/**
 * Executes Phase 3: Applying main general rules loop.
 * @param {array} tracklist - The tracklist array.
 * @param {array} curatedTracklist - The curated tracklist array.
 * @param {array} generalRuleFunctions - The array of general rule functions.
 */
function executePhase3(tracklist, curatedTracklist, generalRuleFunctions) {
  let prevTrack1 = curatedTracklist.length > 0 ? curatedTracklist[curatedTracklist.length - 1] : null;
  let prevTrack2 = curatedTracklist.length > 1 ? curatedTracklist[curatedTracklist.length - 2] : null;

  let trackIndex = curatedTracklist.length;

  for (const track of tracklist) {
    if (!trackAlreadyInList(track, curatedTracklist)) {
      if (canAddTrackWithoutBreakingMaxPlaylistDur(track.duration, myTracklistDuration)) {
        if (isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex, generalRuleFunctions)) {
          addNextValidTrackAndUpdateMyTracklistDur(track, curatedTracklist, tracklist);
          tracklist = updateGeeseTrackCounterAndRearrange(track, tracklist);
          [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
          trackIndex++;
        }
      } else {
        break;
      }
    }
  }
}

/**
 * Converts seconds to a string representation of minutes and seconds.
 * @param {number} seconds - The total seconds.
 * @returns {string} - The formatted string of minutes and seconds.
 */
export function secondsToMinutesAndSeconds(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} mins and ${secs} secs`;
}

/**
 * Follows the tracklist rules to curate a playlist.
 * @param {array} tracklist - The tracklist array.
 * @returns {array} - The curated tracklist.
 */
export function followTracklistRules(tracklist) {
  let curatedTracklist = initializeCuratedTracklist();
  const generalRuleFunctions = initializeGeneralRules();

  const { shuffledEnsureRules, ensureRulesEnforced } = initializeEnsureRules([r21, r22, r23, r24]);
  modifiedMaxPlaylistDurationSecs = MAX_PLAYLIST_DURATION_SECONDS - (CREDITSANDOUTROESTDUR + lastTrackEstDur);
  let potentialLastTracks = preFilterLastTracks(tracklist, curatedTracklist, generalRuleFunctions);
  executePhase1(tracklist, curatedTracklist, generalRuleFunctions);
  executePhase2(tracklist, curatedTracklist, generalRuleFunctions, shuffledEnsureRules, ensureRulesEnforced);
  executePhase3(tracklist, curatedTracklist, generalRuleFunctions);
  let curatedTracklistTotalTimeInSec = updatePlaylistDuration(curatedTracklist);

  if (curatedTracklistTotalTimeInSec > modifiedMaxPlaylistDurationSecs) {
    console.log("Ran out of duration time before completing the tracklist curation!");
  }

  let finalizedTracklist = attemptToAddLastTrack(curatedTracklist, potentialLastTracks, generalRuleFunctions);
  return finalizedTracklist;
}
