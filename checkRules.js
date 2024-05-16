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
  if (!Array.isArray(playlist) || playlist.length === 0) {
    throw new Error("Playlist is empty or not an array.");
  }

  let prevTrack = null;
  const authorCounts = {};
  let hasAlbert = false;
  let hasPierreElliott = false;
  let hasInterview = false;
  let hasMusic = false;
  let geeseTracksCount = 0;
  const ruleViolationCounts = {};

  function logViolation(ruleNumber, track, message) {
    console.log(`❌❌❌ R${ruleNumber} violated at Track ${track.index + 1} (${track.name}): ${message}`);
    ruleViolationCounts[ruleNumber] = (ruleViolationCounts[ruleNumber] || 0) + 1;
  }

  function checkRule(ruleNumber, condition, track, message) {
    if (!condition) {
      logViolation(ruleNumber, track, message);
    }
  }

  for (let i = 0; i < playlist.length; i++) {
    const track = playlist[i];
    track.index = i;

    // Update flags when conditions are met
    if (track.author === "ALBERT") hasAlbert = true;
    if (track.author === "PIERREELLIOTT") hasPierreElliott = true;
    if (track.form === "interview") hasInterview = true;
    if (track.form === "music") hasMusic = true;
    if (track.tags && track.tags.includes("geese")) geeseTracksCount++;

    // Increment the count for the author
    authorCounts[track.author] = (authorCounts[track.author] || 0) + 1;

    // Specific track rules
    switch (i) {
      case 0:
        checkRule(61, track.tags.includes("intro"), track, r61rule);
        break;
      case 1:
        checkRule(62, track.placement.includes("beginning"), track, r62rule);
        break;
      case 2:
        checkRule(63, track.placement.includes("beginning") && track.form !== playlist[i - 1].form, track, r63rule);
        break;
      case 3:
        checkRule(64, track.placement.includes("middle") && track.form !== playlist[i - 1].form, track, r64rule);
        break;
      case 4:
        checkRule(
          65,
          track.length === "short" && track.placement.includes("middle") && track.form !== playlist[i - 1].form,
          track,
          r65rule
        );
        break;
      case 5:
        checkRule(66, track.placement.includes("middle") && track.form !== playlist[i - 1].form, track, r66rule);
        break;
      case 6:
        checkRule(67, track.placement.includes("middle") && track.form !== playlist[i - 1].form, track, r67rule);
        break;
      case 7:
        checkRule(68, track.placement.includes("middle") && track.form !== playlist[i - 1].form, track, r68rule);
        break;
      case 8:
        checkRule(69, track.form !== playlist[i - 1].form, track, r69rule);
        break;
      case 9:
        checkRule(70, track.form !== playlist[i - 1].form, track, r70rule);
        break;
      default:
        break;
    }

    // General rules for all other tracks or specific track indices
    if (i < 4 || i >= 8) {
      checkRule(10, !prevTrack || track.author !== prevTrack.author, track, r10rule);
      checkRule(11, authorCounts[track.author] <= 1, track, r11rule);
      checkRule(12, !(track.form === "short" && track.language === "musical" && prevTrack && prevTrack.form === "music"), track, r12rule);
      checkRule(13, !(track.form === "music" && prevTrack && prevTrack.form === "short" && prevTrack.language === "musical"), track, r13rule);
      checkRule(
        14,
        !(prevTrack && (track.backgroundMusic === prevTrack.author || track.author === prevTrack.backgroundMusic)),
        track,
        r14rule
      );
      checkRule(15, !(prevTrack && prevTrack.sentiment === "heavy" && track.tags.includes("laughter")), track, r15rule);
      checkRule(
        16,
        !(prevTrack && prevTrack.length === "long" && prevTrack.form === "music" && track.form !== "interview" && track.form !== "poetry"),
        track,
        r16rule
      );
      checkRule(17, !(track.form === (playlist[i - 1]?.form)), track, r17rule);
    }

    // Check last track placement
    if (i === playlist.length - 1) {
      checkRule(0, track.placement.includes("end"), track, `{r00rule}`);
    }

    prevTrack = track; // Set the current track as the previous track for the next iteration
  }

  // Final checks for required content after iterating through the playlist
  checkRule("c21", hasAlbert, { name: "N/A", index: "N/A" }, r21rule);
  checkRule("c22", hasPierreElliott, { name: "N/A", index: "N/A" }, r22rule);
  checkRule("c23", hasInterview, { name: "N/A", index: "N/A" }, r23rule);
  checkRule("c24", hasMusic, { name: "N/A", index: "N/A" }, r24rule);
  checkRule("c25", geeseTracksCount !== 1, { name: "N/A", index: "N/A" }, r25rule);

  // Log the most frequently broken rule
  const mostFrequentRule = Object.keys(ruleViolationCounts).reduce((a, b) => (ruleViolationCounts[a] > ruleViolationCounts[b] ? a : b));
  console.log(`❌ Most frequently broken rule: R${mostFrequentRule}`);
}
