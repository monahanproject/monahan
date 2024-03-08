import {  } from './play.js';

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX CREATE AND PRINT DEBUG TEXT SO LAURA CAN SEE DETAILS XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function displayDebugText(element, text, defaultText) {
  if (element) {
    if (text && text !== "") {
      element.textContent = " " + text;
    } else {
      element.textContent = defaultText;
    }
  } else {
    console.log("no element"); // TODO - why is there no element sometimes?
  }
}

export function gatherAndPrintDebugInfo(song, index) {
  if (song) {
    // get debug ids so I can fill in debug info
    const currTrackNameHTMLElement = document.getElementById("currTrackName");
    // const playerTrackNameHTMLElement =
    document.getElementById("playerTrackName");

    const currURLHTMLElement = document.getElementById("currURL");
    const currTagsHTMLElement = document.getElementById("currTags");
    const currDurrHTMLElement = document.getElementById("currDurr");
    const totalDurrHTMLElement = document.getElementById("totalDurr");
    const currCreditHTMLElement = document.getElementById("currCredit");
    const currIndexNokHTMLElement = document.getElementById("indexNo");
    // const currCreditStackHTMLElement = document.getElementById("creditStackHTML");
    // const currTotalIndexHTMLElement = document.getElementById("totalIndex");

    // get the info for THIS song so I can print it to the debug
    const currTags = song.tags;
    const currUrl = song.url;
    const currDurr = song.duration;
    // let timeSecs = timerStateManager.getTimeSecs();
    // const totalDurr = Math.floor(timeSecs / 60);
    const currName = song.name;
    // const bgMusic = song.backgroundMusic;

    const currCredit = song.credit;
    const ohcurrIndex = index;
    // creditstack defined elsewhere

    displayDebugText(currTrackNameHTMLElement, currName, "no name");
    // displayDebugText(playerTrackNameHTMLElement, currName, "no name");
    displayDebugText(currURLHTMLElement, currUrl, "no url");
    displayDebugText(currTagsHTMLElement, currTags, "no tags");
    // displayDebugText(currTagsHTMLElement, bgMusic, "no bgmusic");
    displayDebugText(currDurrHTMLElement, currDurr, "no duration");
    // displayDebugText(totalDurrHTMLElement, totalDurr, "no duration");

    // displayDebugText(displayConsoleLogHTMLElement, displayConsoleLog, "no log");
    displayDebugText(currCreditHTMLElement, currCredit, "no credit");
    // displayDebugText(currCreditStackHTMLElement, creditsArray, "no credit");
    displayDebugText(currIndexNokHTMLElement, ohcurrIndex, "no index");
  } else {
    console.log("OH NO, NO SONG!");
    return;
  }
}

export function printEntireTracklistDebug(shuffledSongsWithOpen) {
  const currTrackNameElement = document.getElementById("fullList");

  // Clear existing content
  currTrackNameElement.innerHTML = "";

  // Loop through shuffled songs and add each track with formatted details
  shuffledSongsWithOpen.forEach((song, index) => {
    const trackDiv = document.createElement("div");
    // Make Track number bold and a different color
    let trackDetails = `<strong style="color: orange; font-style: bold;">Track ${index + 1}:</strong> <br/>`;

    Object.keys(song).forEach((key) => {
      // Skip unwanted keys
      if (["engTrans", "frTrans", "url", "credit", "audio"].includes(key)) return;

      const value = Array.isArray(song[key]) ? song[key].join(", ") : song[key];
      // Keys in teal and bold, values in normal text
      trackDetails += `<strong style="color: teal;">${key}:</strong> ${value || "none"} <br/>`;
    });

    trackDiv.innerHTML = trackDetails;
    currTrackNameElement.appendChild(trackDiv);
  });

  // Show or log a message if no tracks are available
  currTrackNameElement.style.display = shuffledSongsWithOpen.length > 0 ? "block" : "none";
  if (shuffledSongsWithOpen.length === 0) {
    console.log("No items to display.");
  }
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'd' || event.key === 'D') { // This makes it case-insensitive
      var debugDiv = document.getElementById('debugdiv');
      if (debugDiv.style.display === 'none') {
          debugDiv.style.display = 'block'; // Show the div
          console.log("show div");
      } else {
          debugDiv.style.display = 'none'; // Hide the div
          console.log("hide div");

      }
  }
});
