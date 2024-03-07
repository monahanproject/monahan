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
import { calculateOrUpdatecuratedTracklistDuration, MAX_PLAYLIST_DURATION_SECONDS, getFinalcuratedTracklistDuration } from "./play.js";


let myTracklistDuration = 0;

export function logRuleApplication(ruleNumber, trackName, logMessage, isApplied, ruleType) {
  const ruleStatus = isApplied ? "passed" : "failed"; // Use "failed" for consistency
  const statusIcon = isApplied ? "🌱" : "🫧"; // Add status icon based on isApplied
  // Rxxx duration is 113 failed undefined undefined 
  // console.log(`${statusIcon} R${ruleNumber} ${ruleStatus} ${trackName} ${logMessage} `); //findme
}

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

function addNextValidTrack(track, curatedTracklist, tracks) {
  console.log(`Updating myTracklistDuration: ${track.name} ${myTracklistDuration} + ${track.duration} = ${myTracklistDuration + track.duration}`);

  curatedTracklist.push(track);
  const trackIndex = tracks.findIndex((t) => t === track);
  if (trackIndex !== -1) {
    tracks.splice(trackIndex, 1);
  }
}

//  ///////////////////////////////////////////////////
//  //////////  A LONG AND COMPLICATED FUNCTION ///////
//  //////////  THAT MAKES A CURATED TRACKLIST ////////
//  //////////  BY FOLLOWING THE RULES  ///////////////
//  ///////////////////////////////////////////////////

// ~~~ Initialization Functions ~~~
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

// ~~~ Utility Functions ~~~
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

function preFilterLastTracks(tracklist, curatedTracklist, generalRuleFunctions) {
  let potentialLastTracks = [];
  for (let track of tracklist) {
    if (track.placement.includes("end")) {
      let simulatedPrevTrack1 = curatedTracklist[curatedTracklist.length - 1] || {};
      let simulatedPrevTrack2 = curatedTracklist.length > 1 ? curatedTracklist[curatedTracklist.length - 2] : {};

      if (ensureGeneralRules(generalRuleFunctions, track, simulatedPrevTrack1, simulatedPrevTrack2, curatedTracklist, curatedTracklist.length)) {
        potentialLastTracks.push(track);
      }
    }
  }
  return potentialLastTracks;
}

function finalizeTracklist(tracklist, curatedTracklist, generalRuleFunctions) {
  if (curatedTracklist.length > 0) {
    let possibleLastTracks = preFilterLastTracks(tracklist, curatedTracklist, generalRuleFunctions);

    let lastTrack = findSuitableLastTrack(possibleLastTracks, curatedTracklist, generalRuleFunctions);

    if (lastTrack) {
      curatedTracklist.push(lastTrack);
    } else {
      console.log("No suitable last track found that meets the general rules and is not already in the list.");
    }
  }
  return curatedTracklist;
}

function findSuitableLastTrack(possibleLastTracks, curatedTracklist, generalRuleFunctions) {
  for (let track of possibleLastTracks) {
    if (
      !trackAlreadyInList(track, curatedTracklist) &&
      ensureGeneralRules(
        generalRuleFunctions,
        track,
        curatedTracklist[curatedTracklist.length - 1],
        curatedTracklist[curatedTracklist.length - 2],
        curatedTracklist,
        curatedTracklist.length
      )
    ) {
      return track;
    }
  }
  return null;
}

function trackAlreadyInList(track, curatedTracklist) {
  return curatedTracklist.some((curatedTrack) => curatedTrack.name === track.name);
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
    let tracksTried = 0; // Counter for the number of tracks tried
    let specificRuleDescription = eval(`r${61 + i}rule`); // Assumes rule descriptions are like r60rule, r61rule, etc.

    while (!ruleMet && tracksTried < tracklist.length) {
      let track = tracklist[tracksTried];

      if (applySpecificRule(specificRuleFunctions[i], track, prevTrack1, prevTrack2, curatedTracklist, trackIndex + 1)) {
        if (i < 2 || isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex, generalRuleFunctions)) {
          addNextValidTrack(track, curatedTracklist, tracklist);
          myTracklistDuration = calculateOrUpdatecuratedTracklistDuration(track, curatedTracklist);
          [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
          console.log(`${curatedTracklist.length}:✅ Added ${track.name} to the curated tracklist`);
          trackIndex++;
          ruleMet = true;
        } else {
          // console.log(`🫧 General Rules Failed for ${track.name}`);
          tracksTried++;
        }
      } else {
        // console.log(`🫧 Specific Rule Failed for ${track.name}: ${specificRuleDescription}`);
        ruleFailureCounts[i]++; // Increment failure count for the specific rule
        tracksTried++;
      }
    }

    if (!ruleMet) {
      const mostFrequentRuleIndex = ruleFailureCounts.indexOf(Math.max(...ruleFailureCounts));
      const mostFrequentRuleDescription = eval(`r${61 + mostFrequentRuleIndex}rule`);
      console.log(`OHHHHH NOOOOOO No suitable track found for specific rule: ${specificRuleDescription}.`);
      console.log(`Total tracks tried: ${tracksTried}. Most frequently broken rule: ${mostFrequentRuleDescription}`);
    }
  }
}

function executePhase2(tracklist, curatedTracklist, generalRuleFunctions, shuffledEnsureRules, ensureRulesEnforced) {
  console.log("🚀🚀🚀🚀🚀🚀🚀 Starting Phase 2: Ensure rules and final check rules");

  let prevTrack1 = curatedTracklist.length > 0 ? curatedTracklist[curatedTracklist.length - 1] : null;
  let prevTrack2 = curatedTracklist.length > 1 ? curatedTracklist[curatedTracklist.length - 2] : null;

  for (let rule of shuffledEnsureRules) {
    let ruleNumber = rule.name.replace("r", "");
    let ruleDescVarName = `r${ruleNumber}rule`;
    let ruleDescription = eval(ruleDescVarName);
    let ruleMet = false;

    console.log(`🔍 Checking if "${ruleDescription}" is already met in curatedTracklist.`);
    // Check if the rule is satisfied by any track in the curatedTracklist
    for (let track of curatedTracklist) {
      if (rule(track, null, null, curatedTracklist, curatedTracklist.indexOf(track))) {
        // console.log(`💯 ${ruleDescription} is already met by ${track.name} in curatedTracklist.`);
        markEnsureRuleEnforced(ensureRulesEnforced, ruleNumber); // Mark the rule as enforced
        ruleMet = true;
        break; // Rule is satisfied, no need to check further
      }
    }

    // If rule not met in curatedTracklist, find a track in tracklist to satisfy the rule
    if (!ruleMet) {
      console.log(`🔍 "${ruleDescription}" wasn't met, gotta go fishing!`);
      for (let track of tracklist) {
        console.log(`🔍 Checking if "${track.name}" meets "${ruleDescription}"`);
        if (rule(track, null, null, curatedTracklist, curatedTracklist.length)) {
          if (isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, curatedTracklist.length, generalRuleFunctions)) {
            let myTracklistDuration = calculateOrUpdatecuratedTracklistDuration();
            console.log(`Checking if adding "${track.name}" with duration ${track.duration} would exceed maximum duration.`);

            if (myTracklistDuration + (track.duration || 0) > MAX_PLAYLIST_DURATION_SECONDS) {
              console.log(
                `NICE! OUT OF duration TIME while trying to add a track that meets ensure rules! curatedTracklistTotalTimeInSecs is ${myTracklistDuration} and MAX_PLAYLIST_DURATION_SECONDS is ${MAX_PLAYLIST_DURATION_SECONDS}`
              );
              break; // Stop processing if the maximum duration is exceeded
            }

            addNextValidTrack(track, curatedTracklist, tracklist);
            myTracklistDuration = calculateOrUpdatecuratedTracklistDuration(track, curatedTracklist);
            [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
            console.log(`✅ Added "${track.name}" to curatedTracklist to meet "${ruleDescription}"`);
            markEnsureRuleEnforced(ensureRulesEnforced, ruleNumber); // Mark the rule as enforced
            ruleMet = true;
            break; // Suitable track found, stop searching
          } else {
            // console.log(`🫧 "${track.name}" meets "${ruleDescription}" but does not satisfy general rules.`);
          }
        }
      }
    }

    if (!ruleMet) {
      console.log(`Oh nooooooooooo ❌ Could not find a suitable track to satisfy the rule: ${ruleDescription}`);
      // Handle the situation where no track can satisfy the rule
    }
  }

  // Check the 'geese' tag rule
//   if (geeseTrackCounter === 1) {
//     const geeseTracks = tracklist.filter((track) => track.tags.includes("geese"));
//     let geeseTrackAdded = false;

//     for (const geeseTrack of geeseTracks) {
//       console.log(`🔍 Checking if 'geese' track: ${geeseTrack.name} meets general rules.`);
//       if (
//         // true
//         isTrackValidForGeneralRules(geeseTrack, prevTrack1, prevTrack2, curatedTracklist, curatedTracklist.length, generalRuleFunctions)
//       ) {
//         if (myTracklistDuration + (geeseTrack.duration || 0) > MAX_PLAYLIST_DURATION_SECONDS) {
//           console.log(
//             `NICE! OUT OF TIME while trying to add a goose track that meets ensure rules! curatedTracklistTotalTimeInSecs is ${myTracklistDuration} and MAX_PLAYLIST_DURATION_SECONDS is ${MAX_PLAYLIST_DURATION_SECONDS}`
//           );
//           break; // Stop processing if the maximum duration is exceeded
//         }

//         addNextValidTrack(geeseTrack, curatedTracklist, tracklist);
//         myTracklistDuration = calculateOrUpdatecuratedTracklistDuration(geeseTrack, curatedTracklist);
//         geeseTrackCounter++;
//         geeseTrackAdded = true;
//         break; // Stop the loop as we have added a valid geese track
//       } else {
//         console.log(`🚫 'geese' track: ${geeseTrack.name} does not meet general rules.`);
//       }
//     }

//     if (!geeseTrackAdded) {
//       console.log(`🚫 Could not find an additional 'geese' track that meets general rules.`);
//     }
//   }
}

function executePhase3(tracklist, curatedTracklist, generalRuleFunctions, gooseRule) {
  console.log("🚀🚀🚀🚀🚀🚀🚀 Starting Phase 3: Main general rules loop");

  // Get the last two tracks added to the curated list for rule comparisons
  let prevTrack1 = curatedTracklist.length > 0 ? curatedTracklist[curatedTracklist.length - 1] : null;
  let prevTrack2 = curatedTracklist.length > 1 ? curatedTracklist[curatedTracklist.length - 2] : null;

  // Iterate through each track in the provided tracklist
  for (const track of tracklist) {
    // Check if adding the current track exceeds the maximum playlist duration
    console.log(`Checking if adding "${track.name}" with duration ${track.duration} would exceed maximum duration.`);

    if (myTracklistDuration + (track.duration || 0) > MAX_PLAYLIST_DURATION_SECONDS) {
      console.log(
        `NICE! OUT OF duration TIME in phase 3! curatedTracklistTotalTimeInSecs is ${myTracklistDuration} and MAX_PLAYLIST_DURATION_SECONDS is ${MAX_PLAYLIST_DURATION_SECONDS}`
      );
      break; // Stop processing if the maximum duration is exceeded
    }

    // Apply general rules to the track
    if (isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, curatedTracklist.length, generalRuleFunctions)) {
      // Add the track to the curated list if it passes all checks
      addNextValidTrack(track, curatedTracklist, tracklist);
      myTracklistDuration = calculateOrUpdatecuratedTracklistDuration(track, curatedTracklist);
      [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
    } else {
      // console.log(`🫧 General Rules Failed for ${track.name}`);
    }

    // Check the 'geese' tag rule
    // if (geeseTrackCounter === 1) {
    //   const geeseTracks = tracklist.filter((track) => track.tags.includes("geese"));
    //   let geeseTrackAdded = false;

    //   for (const geeseTrack of geeseTracks) {
    //     console.log(`🔍 Checking if 'geese' track: ${geeseTrack.name} meets general rules.`);

    //     if (
    //       // true
    //       isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, curatedTracklist.length, generalRuleFunctions)
    //     ) {
    //       addNextValidTrack(geeseTrack, curatedTracklist, tracklist);
    //       curatedTracklistTotalTimeInSecs = calculateOrUpdatecuratedTracklistDuration(track, curatedTracklist);
    //       [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
    //       geeseTrackCounter++;
    //       console.log(`✅ Additional 'geese' track added: ${geeseTrack.name}`);
    //       geeseTrackAdded = true;
    //       break; // Stop the loop as we have added a valid geese track
    //     } else {
    //       console.log(`🚫 'geese' track: ${geeseTrack.name} does not meet general rules.`);
    //     }
    //   }

    //   if (!geeseTrackAdded) {
    //     console.log(`🚫 Couldn't find an additional 'geese' track that meets general rules.`);
    //   }
    // }
  }

  // Log the completion of Phase 3 with the final duration
  console.log(
    `✅ Phase 3 completed with curated tracklist duration: ${myTracklistDuration} seconds and MAX_PLAYLIST_DURATION_SECONDS is ${MAX_PLAYLIST_DURATION_SECONDS}`
  );
}

export function followTracklistRules(tracklist) {
  console.log("🚀 Starting to follow tracklist rules");
  let curatedTracklist = initializecuratedTracklist();
  const generalRuleFunctions = initializeGeneralRules();

  const { shuffledEnsureRules, ensureRulesEnforced } = initializeEnsureRules([r21, r22, r23, r24, r25], [r25]);

  console.log(`Prephase 1 Total curated tracklist duration: ${myTracklistDuration} seconds and Max duration is ${MAX_PLAYLIST_DURATION_SECONDS}`);

  executePhase1(tracklist, curatedTracklist, generalRuleFunctions);
  console.log(`Prephase 2 Total curated tracklist duration: ${myTracklistDuration} seconds and Max duration is ${MAX_PLAYLIST_DURATION_SECONDS}`);

  executePhase2(tracklist, curatedTracklist, generalRuleFunctions, shuffledEnsureRules, ensureRulesEnforced);
  console.log(`Prephase 3 Total curated tracklist duration: ${myTracklistDuration} seconds and Max duration is ${MAX_PLAYLIST_DURATION_SECONDS}`);

  executePhase3(tracklist, curatedTracklist, generalRuleFunctions);

  let curatedTracklistTotalTimeInSec = getFinalcuratedTracklistDuration(curatedTracklist);
  console.log("curatedTracklistTotalTimeInSecs is " + curatedTracklistTotalTimeInSec);

  if (curatedTracklistTotalTimeInSec > MAX_PLAYLIST_DURATION_SECONDS) {
    console.log("⏰ Ran out of duration time before completing the tracklist curation!");
  } else {
    console.log("✅ Finished curating the tracklist");
  }

  return finalizeTracklist(tracklist, curatedTracklist, generalRuleFunctions);
}
