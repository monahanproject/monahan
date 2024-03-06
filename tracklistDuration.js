// import { timerStateManager } from './play.js';




// //  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// //  XXXXX HELPER FUNCTIONS (DURATION) XXXXXX
// //  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// function addTrackDurationToTotal(totalTimeInSecs, track) {
//     return totalTimeInSecs + (track.duration || 0);
//   }
  
  
//   export function calculateOrUpdatecuratedTracklistDuration(track, curatedTracklist) {
//     if (curatedTracklistTotalTimeInSecs === 0) {
//       for (const track of curatedTracklist) {
//         curatedTracklistTotalTimeInSecs = addTrackDurationToTotal(curatedTracklistTotalTimeInSecs, track);
//       }
//     } else if (track) {
//       curatedTracklistTotalTimeInSecs = addTrackDurationToTotal(curatedTracklistTotalTimeInSecs, track);
//     }
  
//     curatedTracklistTotalTimeInMins = Math.floor(curatedTracklistTotalTimeInSecs / 60);
  
//     return curatedTracklistTotalTimeInSecs;
//   }
  
//   export function getFinalcuratedTracklistDuration(curatedTracklist) {
//     let curatedTracklistTotalTimeInSecs = 0;
  
//     if (!Array.isArray(curatedTracklist)) {
//       console.error("Error: curatedTracklist is not an array");
//       return curatedTracklistTotalTimeInSecs;
//     }
  
//     for (const track of curatedTracklist) {
//       console.log("Track name is " + track.name);
//       curatedTracklistTotalTimeInSecs = addTrackDurationToTotal(curatedTracklistTotalTimeInSecs, track);
//       console.log("Track duration is " + (track.duration || 0));
//     }
  
//     curatedTracklistTotalTimeInMins = Math.floor(curatedTracklistTotalTimeInSecs / 60);
  
//     return curatedTracklistTotalTimeInSecs;
//   }