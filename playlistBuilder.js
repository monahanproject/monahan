// import { trackExistsWithAttributes, addAudioFromUrl } from './play.js';

import { r10, r11, r12, r13, r14, r15, r16 } from "./generalRules.js";
import { r21, r22, r23, r24 } from "./ensureRules.js";
import { r61, r62, r63, r64, r65, r66, r67, r68 } from "./specificRules.js";
import {
  r10rule,
  r11rule,
  r12rule,
  r13rule,
  r14rule,
  r15rule,
  r16rule,
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
} from "./ruleStrings.js";

import { r25 } from "./geeseRule.js";
import { shuffleTracklist, shuffleArrayOfRules } from "./shuffle.js";
import { MAX_PLAYLIST_DURATION_SECONDS } from "./play.js";

let myTracklistDuration = 0;
let CREDITSANDOUTROESTDUR = 44;
let lastTrackEstDur = 150;
let modifiedMaxPlaylistDurationSecs;

//  ///////////////////////////////////////////////////
//         ~~~ Playlist Duration ~~~
//  ///////////////////////////////////////////////////

export function updatePlaylistDuration(curatedTracklist) {
  myTracklistDuration = curatedTracklist.reduce((total, track) => total + (track.duration || 0), 0);
  console.log(`Updated playlist duration: ${myTracklistDuration} && modifiedMaxPlaylistDurationSecs is ${modifiedMaxPlaylistDurationSecs}`);
  return myTracklistDuration;
}

function canAddTrackWithoutBreakingMaxPlaylistDur(newTrackDuration, myCurrentTracklistDuration) {
  const result = myCurrentTracklistDuration + (newTrackDuration || 0) <= modifiedMaxPlaylistDurationSecs;
  // console.log(
  //   `Add track? ${result} | myCurTracklistDur: ${myCurrentTracklistDuration} + newTrackDuration: ${newTrackDuration} <= modifiedMaxPlaylistDurationSecs: ${modifiedMaxPlaylistDurationSecs}`
  // );
  return result;
}

function canAddLastTrack(newTrackDuration, myCurrentTracklistDuration) {
  // Directly compare against modifiedMaxPlaylistDurationSecs without subtracting lastTrackEstDur
  const result = myCurrentTracklistDuration + newTrackDuration <= MAX_PLAYLIST_DURATION_SECONDS;
  console.log(
    `Checking if last track can be added: ${result} | Current Duration: ${myCurrentTracklistDuration}, Track Duration: ${myCurrentTracklistDuration}, Credits/Outro: ${CREDITSANDOUTROESTDUR}, Max: ${modifiedMaxPlaylistDurationSecs}`
  );
  return result;
}

function addNextValidTrackAndUpdateMyTracklistDur(track, curatedTracklist, tracks) {
  console.log(`adding: ${track.name} with duration ${track.duration}`);
  curatedTracklist.push(track);
  myTracklistDuration = updatePlaylistDuration(curatedTracklist);
  const trackIndex = tracks.findIndex((t) => t === track);
  if (trackIndex !== -1) {
    tracks.splice(trackIndex, 1);
  }
}

function addTrackDurationToTotal(totalTimeInSecs, track) {
  return totalTimeInSecs + (track.duration || 0);
}
// updateMyTracklistDuration
// calculateOrUpdatecuratedTracklistDuration

//  ///////////////////////////////////////////////////
//         ~~~ Initialization Functions ~~~
//  ///////////////////////////////////////////////////

function initializecuratedTracklist() {
  return [];
}

function initializeGeneralRules() {
  return [r10, r11, r12, r13, r14, r15, r16];
}

function initializeEnsureRules(rules, fixedRules = []) {
  // Separate the rules that should not be shuffled
  const rulesToShuffle = rules.filter((rule) => !fixedRules.includes(rule));
  const shuffledEnsureRules = shuffleArrayOfRules(rulesToShuffle).concat(fixedRules);

  const ensureRulesEnforced = {};
  shuffledEnsureRules.forEach((rule) => {
    ensureRulesEnforced[`r${parseInt(rule.name.match(/\d+/)[0])}`] = false;
  });

  return { shuffledEnsureRules, ensureRulesEnforced };
}

//  ///////////////////////////////////////////////////
//         ~~~ Log Rules ~~~
//  ///////////////////////////////////////////////////

export function logRuleApplication(ruleNumber, trackName, logMessage, isApplied, ruleType) {
  const ruleStatus = isApplied ? "passed" : "failed"; // Use "failed" for consistency
  const statusIcon = isApplied ? "🌱" : "🫧"; // Add status icon based on isApplied
  // Rxxx duration is 113 failed undefined undefined
  // console.log(`${statusIcon} R${ruleNumber} ${ruleStatus} ${trackName} ${logMessage} `); //findme
}

//  ///////////////////////////////////////////////////
//         ~~~ Update prev tracks ~~~
//  ///////////////////////////////////////////////////

// Helper function to manage prevTrack1 and prevTrack2
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

//  ///////////////////////////////////////////////////
//     ~~~ helper functions for checking rules ~~~
//  ///////////////////////////////////////////////////

function ensureGeneralRules(generalRuleFunctions, track, prevTrack1, prevTrack2, curatedTracklist, currIndex) {
  for (const generalRule of generalRuleFunctions) {
    // Handle null values for prevTrack1 and prevTrack2
    let safePrevTrack1 = prevTrack1 || {}; // Use an empty object if prevTrack1 is null
    let safePrevTrack2 = prevTrack2 || {}; // Use an empty object if prevTrack2 is null

    // Now pass the safePrevTrack1 and safePrevTrack2 to the rule function
    if (!generalRule(track, safePrevTrack1, safePrevTrack2, curatedTracklist, currIndex)) {
      // console.log(`🫧 General rule failed for ${track.name} by rule ${generalRule.name}`);
      return false; // General rule failed
    }
  }
  return true; // All general rules passed
}

function isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, index, generalRuleFunctions) {
  return generalRuleFunctions.every((rule) => rule(track, prevTrack1, prevTrack2, curatedTracklist, index));
}

function applySpecificRule(ruleFunction, track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  return ruleFunction(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex);
}

function applyGeneralRules(generalRuleFunctions, track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
  return isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex, generalRuleFunctions);
}

function ensureTrack(track, currIndex, ensureRules, ensureRulesEnforced, curatedTracklist) {
  for (const rule of ensureRules) {
    const ruleNumber = parseInt(rule.name.match(/\d+/)[0]);

    if (!isEnsureRuleEnforced(ensureRulesEnforced, ruleNumber)) {
      if (!rule(track, null, null, curatedTracklist, currIndex)) {
        return false; // Ensure rule failed, exit the loop
      }
      // Mark the rule as enforced once it passes
      markEnsureRuleEnforced(ensureRulesEnforced, ruleNumber);
    }
  }
  return true; // All ensure rules passed
}

function checkAllEnsureRulesEnforced(ensureRulesEnforced) {
  return Object.values(ensureRulesEnforced).every((flag) => flag === true);
}

function isEnsureRuleEnforced(ensureRulesEnforced, ruleNumber) {
  return ensureRulesEnforced[`r${ruleNumber}`];
}

function markEnsureRuleEnforced(ensureRulesEnforced, ruleNumber) {
  ensureRulesEnforced[`r${ruleNumber}`] = true;
}

//  ///////////////////////////////////////////////////
//     ~~~ helper functions for last track ~~~
//  ///////////////////////////////////////////////////

function preFilterLastTracks(tracklist, curatedTracklist, generalRuleFunctions) {
  let potentialLastTracks = [];
  let indexesToRemove = [];

  for (let i = 0; i < tracklist.length; i++) {
    let track = tracklist[i];
    if (track.placement.includes("end")) {
      // Assuming your commented-out code and any conditions go here
      potentialLastTracks.push(track);
      indexesToRemove.push(i); // Store the index for later removal
    }
  }

  // Remove the tracks in reverse order to not mess up the indexes of yet-to-be-removed tracks
  for (let i = indexesToRemove.length - 1; i >= 0; i--) {
    // tracklist.splice(indexesToRemove[i], 1);
  }

  // console.log(`last tracks are ${potentialLastTracks.map(track => track.name).join(', ')}`);
  // console.log(`last tracks are ${potentialLastTracks.map(track => track.duration).join(', ')}`);

  return potentialLastTracks;
}

function trackAlreadyInList(track, curatedTracklist) {
  return curatedTracklist.some((curatedTrack) => curatedTrack.name === track.name);
}

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
      console.log(`Successfully added last track: ${lastTrack.name}`);
      lastTrackAdded = true;
      break; // Exit the loop as we have successfully added a last track
    }
  }

  if (!lastTrackAdded) {
    console.log("Unable to add a suitable last track within the duration limit.");
    console.log(
      `nable to add a suitable last track within the duration limit. Updated playlist duration: ${myTracklistDuration} && modifiedMaxPlaylistDurationSecs is ${modifiedMaxPlaylistDurationSecs}`
    );
  }

  // Return the possibly modified curatedTracklist
  return curatedTracklist;
}

// ~~~ Phase Functions ~~~
function executePhase1(tracklist, curatedTracklist, generalRuleFunctions) {
  console.log("🚀🚀🚀🚀🚀🚀🚀 Starting Phase 1: Apply specific rules and general rules");

  const specificRuleFunctions = [r61, r62, r63, r64, r65, r66, r67, r68];
  let ruleFailureCounts = specificRuleFunctions.map(() => 0); // Initialize failure counts for each rule
  let prevTrack1 = null;
  let prevTrack2 = null;
  let trackIndex = 0;

  for (let i = 0; i < specificRuleFunctions.length; i++) {
    let ruleMet = false;
    let tracksTried = 0; // Initialize counter for the number of tracks tried

    let specificRuleDescription = eval(`r${61 + i}rule`); // Dynamic evaluation of rule descriptions
    // console.log(`Attempting to apply specific rule ${i + 61}: ${specificRuleDescription}`);

    while (!ruleMet && tracksTried < tracklist.length) {

      if (Math.abs(myTracklistDuration - modifiedMaxPlaylistDurationSecs) < 20) {
        console.log("we're basically out of time");
    }

      let track = tracklist[tracksTried];
      // console.log(`Evaluating track ${track.name} for rule ${i + 61}`);

      if (canAddTrackWithoutBreakingMaxPlaylistDur(track.duration, myTracklistDuration)) {
        if (applySpecificRule(specificRuleFunctions[i], track, prevTrack1, prevTrack2, curatedTracklist, trackIndex + 1)) {
          if (i < 2 || isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex, generalRuleFunctions)) {
            addNextValidTrackAndUpdateMyTracklistDur(track, curatedTracklist, tracklist);
            [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
            // console.log(`✅ Added ${track.name} to the curated tracklist using specific rule ${i + 61}.`);
            trackIndex++;
            ruleMet = true;
            break; // Break out of the loop once a track has been successfully added
          } else {
            // console.log(`🫧 General Rules Failed for ${track.name}.`);
          }
        } else {
          // console.log(`🫧 Specific Rule Failed for ${track.name}: ${specificRuleDescription}.`);
          ruleFailureCounts[i]++; // Increment failure count for the specific rule
        }
      } else {
        // console.log(`Skipping ${track.name} as it would exceed the playlist duration.`);
      }
      tracksTried++; // Increment tracksTried in all cases to ensure loop progression
    }

    if (!ruleMet) {
      const mostFrequentRuleIndex = ruleFailureCounts.indexOf(Math.max(...ruleFailureCounts));
      const mostFrequentRuleDescription = eval(`r${61 + mostFrequentRuleIndex}rule`);
      // console.log(`❌ No suitable track found for specific rule: ${specificRuleDescription}. Most frequently broken rule: ${mostFrequentRuleDescription}`);
      // console.log(`Total tracks tried for rule ${i + 61}: ${tracksTried}`);
    }
  }
}

function executePhase2(tracklist, curatedTracklist, generalRuleFunctions, shuffledEnsureRules, ensureRulesEnforced) {
  console.log("🚀 Starting Phase 2: Ensure rules and final check rules");

  let prevTrack1 = curatedTracklist.length > 0 ? curatedTracklist[curatedTracklist.length - 1] : null;
  let prevTrack2 = curatedTracklist.length > 1 ? curatedTracklist[curatedTracklist.length - 2] : null;

  for (let rule of shuffledEnsureRules) {
    let ruleMet = false;
    let ruleNumber = rule.name.replace("r", "");
    let ruleDescVarName = `r${ruleNumber}rule`;
    let ruleDescription = eval(ruleDescVarName);
    console.log(`Checking for rule enforcement: ${ruleDescription}`);

    // First, check if the rule is already met by the existing tracks in the curatedTracklist
    for (let track of curatedTracklist) {
      if (rule(track, null, null, curatedTracklist, curatedTracklist.indexOf(track))) {
        console.log(`✅ Rule ${ruleDescription} is already met by ${track.name} in the curatedTracklist.`);
        markEnsureRuleEnforced(ensureRulesEnforced, ruleNumber);
        ruleMet = true;
        break;
      }
    }

    if (!ruleMet) {
      if (Math.abs(myTracklistDuration - modifiedMaxPlaylistDurationSecs) < 20) {
        console.log("we're basically out of time");
    }

      console.log(`Rule ${ruleDescription} not yet met. Searching through tracklist.`);
      // If the rule is not met, attempt to find a track that can satisfy the rule
      for (let track of tracklist) {
        if (canAddTrackWithoutBreakingMaxPlaylistDur(track.duration, myTracklistDuration) && !trackAlreadyInList(track, curatedTracklist)) {
          if (
            rule(track, null, null, curatedTracklist, curatedTracklist.length) &&
            isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, curatedTracklist.length, generalRuleFunctions)
          ) {
            console.log(`✅ Good news! Adding ${track.name} to meet the rule: ${ruleDescription}`);

            // console.log(`Adding ${track.name} to meet the rule: ${ruleDescription}`);
            addNextValidTrackAndUpdateMyTracklistDur(track, curatedTracklist, tracklist);
            [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
            ruleMet = true;
            markEnsureRuleEnforced(ensureRulesEnforced, ruleNumber);
            break; // Found a track that satisfies the rule, break out of the loop
          }
        }
      }
    }

    if (!ruleMet) {
      console.log(`❌ Unable to find a track to satisfy the rule: ${ruleDescription}. Consider adjusting your rules or tracklist.`);
    }
  }
}

function executePhase3(tracklist, curatedTracklist, generalRuleFunctions, gooseRule) {
  console.log("🚀 Starting Phase 3: Main general rules loop");

  // Get the last two tracks added to the curated list for rule comparisons
  let prevTrack1 = curatedTracklist.length > 0 ? curatedTracklist[curatedTracklist.length - 1] : null;
  let prevTrack2 = curatedTracklist.length > 1 ? curatedTracklist[curatedTracklist.length - 2] : null;

  // Track index for logging purposes
  let trackIndex = curatedTracklist.length;

  for (const track of tracklist) {
    // Ensure the track isn't already in the curated list
    if (!trackAlreadyInList(track, curatedTracklist)) {
      // Check if adding this track would stay within the max playlist duration
      if (canAddTrackWithoutBreakingMaxPlaylistDur(track.duration, myTracklistDuration)) {
        // Verify the track satisfies general rules
        if (isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex, generalRuleFunctions)) {
          console.log(`Adding ${track.name} to curatedTracklist. Meets general rules.`);
          addNextValidTrackAndUpdateMyTracklistDur(track, curatedTracklist, tracklist);
          [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
          trackIndex++;
        } else {
          console.log(`General Rules Failed for ${track.name}. Not added to curatedTracklist.`);
        }
      } else {
        console.log(`Adding ${track.name} would exceed max playlist duration. Stopping Phase 3.`);
        break; // Exiting the loop if adding any more tracks would exceed the maximum playlist duration
      }
    }
  }

  console.log(`Phase 3 completed. Curated tracklist now has ${curatedTracklist.length} tracks. Total duration: ${myTracklistDuration} seconds.`);
}

export function secondsToMinutesAndSeconds(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} mins and ${secs} secs`;
}

export function followTracklistRules(tracklist) {
  console.log("🚀 Starting to follow tracklist rules");
  let curatedTracklist = initializecuratedTracklist();
  const generalRuleFunctions = initializeGeneralRules();

  const { shuffledEnsureRules, ensureRulesEnforced } = initializeEnsureRules([r21, r22, r23, r24, r25], [r25]);
  modifiedMaxPlaylistDurationSecs = MAX_PLAYLIST_DURATION_SECONDS - (CREDITSANDOUTROESTDUR + lastTrackEstDur);
  console.log(`modifiedMaxPlaylistDurationSecs is ${modifiedMaxPlaylistDurationSecs}`);

  let potentialLastTracks = preFilterLastTracks(tracklist, curatedTracklist, generalRuleFunctions);

  console.log(
    `ttt Prephase 1 myTracklistDuration: ${myTracklistDuration} & modMaxPlaylistDurSecs: ${secondsToMinutesAndSeconds(
      modifiedMaxPlaylistDurationSecs
    )}`
  );
  executePhase1(tracklist, curatedTracklist, generalRuleFunctions);
  console.log(
    `ttt Prephase 2 myTracklistDuration: ${myTracklistDuration} & modMaxPlaylistDurSecs: ${secondsToMinutesAndSeconds(
      modifiedMaxPlaylistDurationSecs
    )}`
  );
  executePhase2(tracklist, curatedTracklist, generalRuleFunctions, shuffledEnsureRules, ensureRulesEnforced);
  console.log(
    `ttt Prephase 3 myTracklistDuration: ${myTracklistDuration} & modMaxPlaylistDurSecs: ${secondsToMinutesAndSeconds(
      modifiedMaxPlaylistDurationSecs
    )}`
  );
  executePhase3(tracklist, curatedTracklist, generalRuleFunctions);
  console.log(
    `ttt PreFinalTrack myTracklistDuration: ${myTracklistDuration} & modMaxPlaylistDurSecs: ${secondsToMinutesAndSeconds(
      modifiedMaxPlaylistDurationSecs
    )}`
  );

  let curatedTracklistTotalTimeInSec = updatePlaylistDuration(curatedTracklist);
  console.log(
    `ttt COMPARE this against curatedTracklistTotalTimeInSec: ${curatedTracklistTotalTimeInSec} & modMaxPlaylistDurSecs: ${secondsToMinutesAndSeconds(
      modifiedMaxPlaylistDurationSecs
    )}`
  );

  if (curatedTracklistTotalTimeInSec > modifiedMaxPlaylistDurationSecs) {
    console.log("⏰ OH NO Ran out of duration time before completing the tracklist curation!");
  } else {
    console.log("✅ Finished curating the tracklist");
  }

  let finalizedTracklist = attemptToAddLastTrack(curatedTracklist, potentialLastTracks, generalRuleFunctions);
  console.log(
    `ttt added final track! myTracklistDuration: ${myTracklistDuration} & modMaxPlaylistDurSecs: ${secondsToMinutesAndSeconds(
      modifiedMaxPlaylistDurationSecs
    )}`
  );
  console.log(`Updated playlist duration: ${myTracklistDuration} && modifiedMaxPlaylistDurationSecs is ${MAX_PLAYLIST_DURATION_SECONDS}`);

  return finalizedTracklist;
}
