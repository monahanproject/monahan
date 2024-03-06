// import { timerStateManager } from './play.js';
// import { r61, r62, r63, r64, r65, r66, r67, r68 } from "./specificRules.js";
// import { r61rule, r62rule, r63rule, r64rule, r65rule, r66rule, r67rule, r68rule, applySpecificRule, addNextValidTrack, calculateOrUpdatecuratedTracklistDuration, curatedTracklistTotalTimeInSecs } from "./play.js";


// // ~~~ Phase Functions ~~~
// export function executePhase1(tracklist, curatedTracklist, generalRuleFunctions) {
//     console.log("🚀🚀🚀🚀🚀🚀🚀 Starting Phase 1: Apply specific rules and general rules");
  
//     const specificRuleFunctions = [r61, r62, r63, r64, r65, r66, r67, r68];
//     let ruleFailureCounts = specificRuleFunctions.map(() => 0); // Initialize failure counts for each rule
//     let prevTrack1 = null;
//     let prevTrack2 = null;
//     let trackIndex = 0;
  
//     for (let i = 0; i < specificRuleFunctions.length; i++) {
//       let ruleMet = false;
//       let tracksTried = 0; // Counter for the number of tracks tried
//       let specificRuleDescription = eval(`r${61 + i}rule`); // Assumes rule descriptions are like r60rule, r61rule, etc.
  
//       while (!ruleMet && tracksTried < tracklist.length) {
//         let track = tracklist[tracksTried];
  
//         if (applySpecificRule(specificRuleFunctions[i], track, prevTrack1, prevTrack2, curatedTracklist, trackIndex + 1)) {
//           if (i < 2 || isTrackValidForGeneralRules(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex, generalRuleFunctions)) {
//             addNextValidTrack(track, curatedTracklist, tracklist);
//             curatedTracklistTotalTimeInSecs = calculateOrUpdatecuratedTracklistDuration(track, curatedTracklist);
//             [prevTrack1, prevTrack2] = updatePrevTracks(track, prevTrack1, prevTrack2);
//             console.log(`${curatedTracklist.length}:✅ Added ${track.name} to the curated tracklist`);
//             trackIndex++;
//             ruleMet = true;
//           } else {
//             // console.log(`🫧 General Rules Failed for ${track.name}`);
//             tracksTried++;
//           }
//         } else {
//           // console.log(`🫧 Specific Rule Failed for ${track.name}: ${specificRuleDescription}`);
//           ruleFailureCounts[i]++; // Increment failure count for the specific rule
//           tracksTried++;
//         }
//       }
  
//       if (!ruleMet) {
//         const mostFrequentRuleIndex = ruleFailureCounts.indexOf(Math.max(...ruleFailureCounts));
//         const mostFrequentRuleDescription = eval(`r${61 + mostFrequentRuleIndex}rule`);
//         console.log(`OHHHHH NOOOOOO No suitable track found for specific rule: ${specificRuleDescription}.`);
//         console.log(`Total tracks tried: ${tracksTried}. Most frequently broken rule: ${mostFrequentRuleDescription}`);
//       }
//     }
//   }