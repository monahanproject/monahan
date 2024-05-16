import {} from "./play.js";

//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX CREATE AND PRINT DEBUG TEXT SO LAURA CAN SEE DETAILS XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function displayDebugText(element, text, defaultText) {
  if (element) {
    element.textContent = text && text !== "" ? ` ${text}` : defaultText;
  } else {
    console.log("No element found");
  }
}

export function gatherAndPrintDebugInfo(song, index) {
  if (!song) {
    console.log("OH NO, NO SONG!");
    return;
  }

  const elements = {
    currTrackName: document.getElementById("currTrackName"),
    currURL: document.getElementById("currURL"),
    currTags: document.getElementById("currTags"),
    currDurr: document.getElementById("currDurr"),
    totalDurr: document.getElementById("totalDurr"),
    currCredit: document.getElementById("currCredit"),
    currIndexNo: document.getElementById("indexNo"),
  };

  const songInfo = {
    currTrackName: song.name,
    currURL: song.url,
    currTags: song.tags,
    currDurr: song.duration,
    currCredit: song.credit,
    currIndexNo: index,
  };

  for (const [key, element] of Object.entries(elements)) {
    displayDebugText(element, songInfo[key], `no ${key}`);
  }
}

export function printEntireTracklistDebug(shuffledSongsWithOpen) {
  const fullListElement = document.getElementById("fullList");

  if (!fullListElement) {
    console.log("No element found for full tracklist");
    return;
  }

  // Clear existing content
  fullListElement.innerHTML = "";

  if (shuffledSongsWithOpen.length === 0) {
    console.log("No items to display.");
    fullListElement.style.display = "none";
    return;
  }

  shuffledSongsWithOpen.forEach((song, index) => {
    const trackDiv = document.createElement("div");
    let trackDetails = `<strong style="color: orange; font-style: bold;">Track ${index + 1}:</strong> <br/>`;

    for (const [key, value] of Object.entries(song)) {
      if (!["engTrans", "frTrans", "url", "credit", "audio"].includes(key)) {
        trackDetails += `<strong style="color: teal;">${key}:</strong> ${Array.isArray(value) ? value.join(", ") : value || "none"} <br/>`;
      }
    }

    trackDiv.innerHTML = trackDetails;
    fullListElement.appendChild(trackDiv);
  });

  fullListElement.style.display = "block";
}

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "d") {
    const debugDiv = document.getElementById("debugdiv");
    if (debugDiv) {
      debugDiv.style.display = debugDiv.style.display === "none" ? "block" : "none";
      console.log(debugDiv.style.display === "block" ? "show div" : "hide div");
    } else {
      console.log("No element found for debug div");
    }
  }
});
