// // PlaylistDurationManager.js

// let curatedTracklistTotalTimeInSecs = 0;

// export function addTrackDuration(trackDuration) {
//   curatedTracklistTotalTimeInSecs += trackDuration;
// }

// export function getCuratedTracklistTotalTimeInSecs() {
//   return curatedTracklistTotalTimeInSecs;
// }

// export function resetCuratedTracklistTotalTimeInSecs() {
//   curatedTracklistTotalTimeInSecs = 0;
// }

// export function calculateCuratedTracklistDuration(curatedTracklist) {
//   // Optionally reset the total time if you want to recalculate from scratch
//   resetCuratedTracklistTotalTimeInSecs();

//   for (const track of curatedTracklist) {
//     addTrackDuration(track.duration || 0);
//   }

//   return curatedTracklistTotalTimeInSecs;
// }

// export function updateCuratedTracklistDurationWithTrack(track) {
//   addTrackDuration(track.duration || 0);
//   return curatedTracklistTotalTimeInSecs;
// }
