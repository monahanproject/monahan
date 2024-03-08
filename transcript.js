import { curatedTracklist } from "./play.js";

let transcript = "";
let language = "english";
let transcriptVisible = false;
let transcriptContent;
const transcriptContainer = document.getElementById("transcriptContainer");

// Helper function to create elements with attributes
function createElement(type, attributes) {
  const element = document.createElement(type);
  Object.keys(attributes).forEach((attr) => (element[attr] = attributes[attr]));
  return element;
}

// create the transcript container and button
export function createTranscriptContainer() {
  if (!transcriptContainer) {
    console.error("Transcript container not found.");
    return;
  }
  const transcriptButton = createElement("button", {
    type: "button",
    className: "btn",
    id: "transcriptButton",
    textContent: "TRANSCRIPT",
  });

  const transBtnContainer = document.getElementById("transButtonContainer");
  transBtnContainer.appendChild(transcriptButton);
  transcriptButton.addEventListener("click", toggleTranscript);
  // Initialize transcriptContent here to avoid re-declaration later
  transcriptContent = createElement("div", { id: "transcriptContent", style: "display: none" });
  transcriptContainer.appendChild(transcriptContent); // Append to the container
}

// Function to apply formatting to text
function formatText(text) {
  const formatPatterns = {
    bold: /\^([^]+?)\^\^/g,
    center: /@([^]+?)@@/g,
    italics: /\$([^]+?)\$\$/g,
    lineBreak: /%/g,
    doubleLineBreak: /\*/g,
  };

  return text
    .replace(formatPatterns.bold, '<span style="font-weight: bold;">$1</span>')
    .replace(formatPatterns.center, '<span style="display: block; text-align: center;">$1</span>')
    .replace(formatPatterns.italics, '<span style="font-style: italic;">$1</span>')
    .replace(formatPatterns.lineBreak, "</br>")
    .replace(formatPatterns.doubleLineBreak, "<p></br></br></p>");
}

function createHTMLFromText(text) {
  const container = createElement("div", {});
  const currentParagraph = createElement("p", {
    style: "margin-top: 3rem; margin-bottom: 1rem; padding: 1rem; background-color: #bfffc2; margin-left: 0; margin-right: 0;",
  });

  try {
    currentParagraph.innerHTML = formatText(text); // Refactored to formatText function
    container.appendChild(currentParagraph);
  } catch (error) {
    console.error("Error while processing input text:", error);
  }

  return container;
}

// Function to update the transcript based on the selected language
function updateTranscript() {
  if (!transcriptContainer) {
    console.error("Transcript container not found.");
    return;
  }

  transcriptContainer.innerHTML = ""; // Clear previous content

  const langKey = language === "english" ? "engTrans" : "frTrans";
  const copyRightText =
    language === "english"
      ? "$All recordings and transcripts are copyright protected. All rights reserved.$$"
      : "$Les enregistrements et les transcriptions sont protégés par le droit d’auteur. Tous droits réservés.$$";

  curatedTracklist.forEach((song) => {
    const inputString = song[langKey];
    if (inputString && inputString.trim() !== "") {
      transcriptContainer.appendChild(createHTMLFromText(inputString));
    } 
  });

  transcriptContainer.appendChild(createHTMLFromText(copyRightText));
  transcriptContainer.style.display = "block";
}

// Function to toggle the transcript visibility
function toggleTranscript() {
  const transcriptButton = document.getElementById("transcriptButton");

  transcriptVisible = !transcriptVisible; // Toggle the flag first for more predictable logic
  if (transcriptVisible) {
    updateTranscript(); // Update before showing
    transcriptContainer.style.display = "block";
    transcriptButton.textContent = "Hide Transcript";
  } else {
    transcriptContainer.style.display = "none";
    transcriptButton.textContent = "Show Transcript";
  }
}
