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
  r70rule,
} from "./ruleStrings.js";

export function checkPlaylistRules(playlist) {
  let prevTrack = null;
  const authorCounts = {};
  let hasAlbert = false;
  let hasPierreElliott = false;
  let hasInterview = false;
  let hasMusic = false;
  let geeseTracksCount = 0;

  for (let i = 0; i < playlist.length; i++) {
    const track = playlist[i];

    // Update flags when conditions are met
    if (track.author === "ALBERT") {
      hasAlbert = true;
    }
    if (track.author === "PIERREELLIOTT") {
      hasPierreElliott = true;
    }
    if (track.form === "interview") {
      hasInterview = true;
    }
    if (track.form === "music") {
      hasMusic = true;
    }
    if (track.tags && track.tags.includes("geese")) {
      geeseTracksCount++;
    }

    // Increment the count for the author
    authorCounts[track.author] = (authorCounts[track.author] || 0) + 1;

    // CHECK R61: The 0th track must have the tag 'intro'
    if (i === 0 && !track.tags.includes("intro")) {
      console.log(`❌❌❌ R61 violated at Track 1 (${track.name}) does not have the tag 'intro'. ${r61rule}`);
    }

    // CHECK R62: The 1st track must have the placement 'beginning'
    if (i === 1 && !track.placement.includes("beginning")) {
      console.log(`❌❌❌ R62 violated at Track 2 (${track.name}) does not have placement 'beginning'. ${r62rule}`);
    }

    // CHECK R63: The 2nd track must have placement 'beginning' and a different form than the 1st track
    if (i === 2 && (!track.placement.includes("beginning") || track.form === playlist[i - 1].form)) {
      console.log(`❌❌❌ R63 violated at Track 3 (${track.name}) does not meet the criteria of ${r63rule}`);
    }

    // CHECK R64: The 3rd track must have the placement 'middle' and a different form than the 2nd track
    if (i === 3 && (!track.placement.includes("middle") || track.form === playlist[i - 1].form)) {
      console.log(`❌❌❌ R64 violated at Track 4 (${track.name}) does not meet the criteria of ${r64rule}`);
    }

    // CHECK R65: The 4th track must have the length 'short', the placement 'middle', and a different form than the 3rd track
    if (i === 4) {
      let ruleViolations = [];

      if (track.length !== "short") {
        ruleViolations.push("Track length is not 'short': " + track.length);
      }

      if (!track.placement.includes("middle")) {
        ruleViolations.push("Track placement is not 'middle': " + track.placement);
      }

      if (track.form === playlist[i - 1].form) {
        ruleViolations.push(`Track form is the same as the 3rd track (${track.form})`);
      }

      if (ruleViolations.length > 0) {
        console.log(`❌❌❌ R65 violated at Track 5 (${track.name}). Reasons: ${ruleViolations.join(", ")}. Rule description: ${r65rule}`);
      }
    }

    // CHECK R66: The 5th track must have placement 'middle' and a different form than the 4th track
    if (i === 5) {
      let ruleViolationsR66 = [];

      if (!track.placement.includes("middle")) {
        ruleViolationsR66.push("Track placement is not 'middle'");
      }

      if (track.form === playlist[i - 1].form) {
        ruleViolationsR66.push(`Track form is the same as the 4th track (${track.form})`);
      }

      if (ruleViolationsR66.length > 0) {
        console.log(`❌❌❌ R66 violated at Track 6 (${track.name}). Reasons: ${ruleViolationsR66.join(", ")}. Rule description: ${r66rule}`);
      }
    }

    // CHECK R67: The 6th track must have placement 'middle' and a different form than the 5th track
    if (i === 6) {
      let ruleViolationsR67 = [];

      if (!track.placement.includes("middle")) {
        ruleViolationsR67.push("Track placement is not 'middle'");
      }

      if (track.form === playlist[i - 1].form) {
        ruleViolationsR67.push(`Track form is the same as the 5th track (${track.form})`);
      }

      if (ruleViolationsR67.length > 0) {
        console.log(`❌❌❌ R67 violated at Track 7 (${track.name}). Reasons: ${ruleViolationsR67.join(", ")}. Rule description: ${r67rule}`);
      }
    }

    // CHECK R68: The 7th track must have placement 'middle' and a different form than the 6th track
    if (i === 7 && (!track.placement.includes("middle") || track.form === playlist[i - 1].form)) {
      console.log(`❌❌❌ R68 violated at Track 8 (${track.name}) does not meet the criteria of ${r68rule}`);
    }

    // CHECK R69: The 8th track have a different form than the previous track
    if (i === 8 && track.form === playlist[i - 1].form) {
      console.log(`❌❌❌ R69 violated at Track 9 (${track.name}) does not meet the criteria of ${r69rule}`);
    }

    // CHECK R70: The 9th track must have a different form than the previous track
    if (i === 9 && track.form === playlist[i - 1].form) {
      console.log(`❌❌❌ R70 violated at Track 10 (${track.name}) does not meet the criteria of ${r70rule}`);
    }

    // Apply general rules only if the track index is less than 4 or after the specific rules phase.
    if (i < 4 || i >= 8) {
      // CHECK R10: The current track must have a different author than the last track
      if (prevTrack && track.author === prevTrack.author) {
        console.log(`❌❌❌ R10 violated at Curated Track ${i + 1} (${track.name}): Same author as the previous track. ${r10rule}`);
      }

      // CHECK R11: No more than one track from the same author in a tracklist
      if (authorCounts[track.author] > 1) {
        console.log(`❌❌❌ R11 violated at Curated Track ${i + 1} (${track.name}): More than two tracks from the same author. ${r11rule}`);
      }

      // CHECK R12: Tracks with the form short and the language musical can never follow tracks with the form music.
      if (track.form === "short" && track.language === "musical" && prevTrack && prevTrack.form === "music") {
        console.log(`❌❌❌ R12 violated! (${track.name}): short (musical) followed by music, does not meet the criteria of ${r12rule}`);
      }

      // CHECK R13: Tracks with the form music can never follow tracks with both the form short and the language musical.
      if (track.form === "music" && prevTrack && prevTrack.form === "short" && prevTrack.language === "musical") {
        console.log(`❌❌❌ R13 violated! (${track.name}): Music followed by short (musical), does not meet the criteria of ${r13rule}`);
      }

      // CHECK R14: The value for backgroundMusic should never match the author of the track right before it, and the author of the track should never match the backgroundMusic of the track right before it.
      if (prevTrack && (track.backgroundMusic === prevTrack.author || track.author === prevTrack.backgroundMusic)) {
        console.log(
          `❌❌❌ R14 violated! Current Track: '${track.name}' - Author: '${track.author}', Background Music: '${track.backgroundMusic}'. ` +
            `Previous Track: '${prevTrack.name}' - Author: '${prevTrack.author}', Background Music: '${prevTrack.backgroundMusic}'. ` +
            `Violation: ${
              track.backgroundMusic === prevTrack.author
                ? "Current track's background music matches previous track's author."
                : "Current track's author matches previous track's background music."
            }`
        );
      }

      // CHECK R15: If the previous track has the sentiment heavy, this track cannot have the the laughter tag.
      if (prevTrack && prevTrack.tags.includes("laughter") && track.tags.includes("heavy")) {
        console.log(`❌❌❌ R15 violated! (${track.name}): Laughter followed by heavy sentiment. does not meet the criteria of ${r15rule}`);
      }

      // CHECK R16: If the previous track has length long and form music, this track must have the form interview or poetry`;
      if (prevTrack && prevTrack.length === "long" && prevTrack.form === "music") {
        if (track.form !== "interview" && track.form !== "poetry") {
          console.log(`❌❌❌ R16 violated! (${track.name}): Long music track not followed by an interview or poetry.`);
        }
      }

      // CHECK R17: The current track must have a different form than the previous track`;
      if (track.form && playlist[i - 1].form && track.form === playlist[i - 1].form) {
        console.log(`❌❌❌ R17 violated! (${track.name}): has ${track.form} and the previous track ${playlist[i - 1].form}. This does not meet the criteria of ${r17rule}`);
      }
    }

    // CHECK R00: Last track must have the placement 'end'
    if (i === playlist.length - 1 && !track.placement.includes("end")) {
      console.log(`❌❌❌ R00 violated! (${track.name}): Last track does not have placement 'end', does not meet the criteria of {r00rule}`);
    }

    prevTrack = track; // Set the current track as the previous track for the next iteration
  }

  // Check for c21, c22, c23, c24, c25 after iterating through the playlist
  if (!hasAlbert) {
    console.log("❌❌❌ Rule c21 violated: Playlist does not contain a track with the author ALBERT. does not meet the criteria");
  }
  if (!hasPierreElliott) {
    console.log("❌❌❌ Rule c22 violated: Playlist does not contain a track with the author PIERREELLIOTT. does not meet the criteria");
  }
  if (!hasInterview) {
    console.log("❌❌❌ Rule c23 violated: Playlist does not contain a track with the form interview. does not meet the criteria");
  }
  if (!hasMusic) {
    console.log("❌❌❌ Rule c24 violated: Playlist does not contain a track with the form music. does not meet the criteria");
  }
  // Check for geese after iterating through the playlist
  if (geeseTracksCount === 1) {
    console.log("❌❌❌ Rule c25 violated: Playlist contains exactly one track with the tag geese, which is not allowed.");
  } else if (geeseTracksCount === 0 || geeseTracksCount > 1) {
    // console.log(`🎉 Acceptable number of 'geese' tracks found: ${geeseTracksCount}.`);
  }
}

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// //  XXXXXXXX 👀 ENSURE CHECKS (NEAR THE END) XXXXXXX
// //  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// // Rule C21 The tracklist must contain at least one track with the author ALBERT
// function c21(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
//   const trackName = track.name;
//   const ruleType = `👀 Ensure rule:`;

//   let trackWithAttribute = trackExistsWithAttributes(curatedTracklist, "author", "ALBERT");
//   if (!trackWithAttribute) {
//     const logMessage = `The tracklist must contain at least one track with the author ALBERT `;
//     logRuleApplication(21, track.name, logMessage, false, ruleType);
//     return false;
//   }
//   const logMessage = `The tracklist must contain at least one track with the author ALBERT (trackWithAttribute is ${trackWithAttribute.name}, author is ${trackWithAttribute.author})`;
//   logRuleApplication(21, logMessage, true, ruleType);
//   return true;
// }

// // Rule C22 The tracklist must contain at least one track with the author PIERREELLIOTT
// function c22(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
//   const trackName = track.name;
//   const ruleType = `👀 Ensure rule:`;
//   const logMessage = `✨ Ensure track rule: The tracklist must contain at least one track with the author PIERREELLIOTT (trackWithAttribute is ${trackWithAttribute.name}, author is ${trackWithAttribute.author})`;

//   let trackWithAttribute = trackExistsWithAttributes(curatedTracklist, "author", "PIERREELLIOTT");
//   if (!trackWithAttribute) {
//     logRuleApplication(22, track.name, logMessage, false, ruleType);
//     return false;
//   }
//   logRuleApplication(22, logMessage, true, ruleType);
//   return true;
// }

// // Rule C23 The tracklist must contain at least one track with the form interview
// function c23(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
//   const trackName = track.name;
//   const ruleType = `👀 Ensure rule:`;

//   let trackWithAttribute = trackExistsWithAttributes(curatedTracklist, "form", "interview");
//   if (!trackWithAttribute) {
//     const logMessage = `Ensure track rule: The tracklist must contain at least one track with the form interview`;
//     logRuleApplication(23, track.name, logMessage, false, ruleType);
//     return false;
//   }
//   const logMessage = `✨ Ensure track rule: The tracklist must contain at least one track with the form interview (trackWithAttribute is ${trackWithAttribute.name}, form is ${trackWithAttribute.form})`;
//   logRuleApplication(23, logMessage, true, ruleType);
//   return true;
// }

// // Rule C24 The tracklist must contain at least one track with the form music
// function c24(track, prevTrack1, prevTrack2, curatedTracklist, trackIndex) {
//   const trackName = track.name;
//   const ruleType = `👀 Ensure rule:`;

//   let trackWithAttribute = trackExistsWithAttributes(curatedTracklist, "form", "music");

//   if (!trackWithAttribute) {
//     const logMessage = `Ensure track rule: The tracklist must contain at least one track with the form music`;
//     logRuleApplication(24, track.name, logMessage, false, ruleType);
//     return false;
//   }
//   const logMessage = ` ✨! Ensure track rule: The tracklist must contain at least one track with the form music (trackWithAttribute is ${trackWithAttribute.name}, form is ${trackWithAttribute.form})`;
//   logRuleApplication(24, logMessage, true, ruleType);
//   return true;
// }
