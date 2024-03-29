// // TRANSCRIPT
// // import { curatedTracklist } from "./play.js";
// import { getState, setState } from "./state.js";
// let isInverted = getState(); // This will initialize isInverted based on localStorage

// if (localStorage.getItem("themeInverted") === null) {
//   // If the key doesn't exist, initialize it to false
//   localStorage.setItem("themeInverted", "false");
// }


// let transcript = "";
// let transcriptVisible = false;
// let transcriptContent = null;
// let transcriptContainer = document.getElementById("transcriptContainer");
// let savedLanguage = localStorage.getItem('preferredLanguage') || "EN"; // Default to "EN" if not found

// // Helper function to create elements with attributes
// function createElement(type, attributes) {
//   const element = document.createElement(type);
//   Object.keys(attributes).forEach((attr) => (element[attr] = attributes[attr]));
//   return element;
// }

// // create the transcript container and button
// export function createTranscriptContainer() {
//   if (!transcriptContainer) {
//     console.error("Transcript container not found.");
//     return;
//   }

//   // Check if the transcript button already exists
//   let transcriptButton = document.getElementById("transcriptButton");
//   if (!transcriptButton) {
//     // Only create and append the button if it doesn't exist
//     transcriptButton = createElement("button", {
//       type: "button",
//       className: "btn",
//       id: "transcriptButton",
//       textContent: "TRANSCRIPT",
//     });

//     const transBtnContainer = document.getElementById("transButtonContainer");
//     transBtnContainer.appendChild(transcriptButton);
//     transcriptButton.addEventListener("click", toggleTranscript.bind(this));
//   }

//   // Initialize or clear transcriptContent as needed
//   if (!transcriptContent) {
//     transcriptContent = createElement("div", { id: "transcriptContent", style: "display: none" });
//     transcriptContainer.appendChild(transcriptContent);
//   } else {
//     // Clear existing content if transcriptContent already exists
//     transcriptContent.innerHTML = "";
//   }
// }

// // Function to apply formatting to text
// function formatText(text) {
//   const formatPatterns = {
//     bold: /\^([^]+?)\^\^/g,
//     center: /@([^]+?)@@/g,
//     italics: /\$([^]+?)\$\$/g,
//     lineBreak: /%/g,
//     doubleLineBreak: /\*/g,
//   };

//   return text
//     .replace(formatPatterns.bold, '<span style="font-weight: bold;">$1</span>')
//     .replace(formatPatterns.center, '<span style="display: block; text-align: center;">$1</span>')
//     .replace(formatPatterns.italics, '<span style="font-style: italic;">$1</span>')
//     .replace(formatPatterns.lineBreak, "</br>")
//     .replace(formatPatterns.doubleLineBreak, "<p></br></br></p>");
// }

// function createHTMLFromText(text) {
//   const container = createElement("div", {});
//   const currentParagraph = createElement("p", {
//     style: "margin-top: 3rem; margin-bottom: 1rem; padding: 1rem; background-color: #bfffc2; margin-left: 0; margin-right: 0;",
//   });

//   try {
//     currentParagraph.innerHTML = formatText(text); // Refactored to formatText function
//     container.appendChild(currentParagraph);
//   } catch (error) {
//     console.error("Error while processing input text:", error);
//   }

//   return container;
// }

// // Function to update the transcript based on the selected language
// export function updateTranscript(curatedTracklist) { // Assume tracklist is passed as an argument
//   console.log(curatedTracklist);
//   if (!transcriptContainer) {
//     console.error("Transcript container not found.");
//     return;
//   }

//   transcriptContainer.innerHTML = ""; // Clear previous content

//   savedLanguage === "EN" ? "EN" : "FR";
//   const copyRightText =
//   savedLanguage === "EN"
//     ? "$All recordings and transcripts are copyright protected. All rights reserved.$$"
//     : "$Les enregistrements et les transcriptions sont protégés par le droit d’auteur. Tous droits réservés.$$";

//     curatedTracklist.forEach((song) => {
//     const inputString = song[savedLanguage];
//     if (inputString && inputString.trim() !== "") {
//       transcriptContainer.appendChild(createHTMLFromText(inputString));
//     }
//   });

//   transcriptContainer.appendChild(createHTMLFromText(copyRightText));
//   transcriptContainer.style.display = "block";
// }

// // Function to toggle the transcript visibility
// function toggleTranscript() {
//   const transcriptButton = document.getElementById("transcriptButton");

//   transcriptVisible = !transcriptVisible; // Toggle the flag first for more predictable logic
//   if (transcriptVisible) {
//     // console.log(curatedTracklist);
//     // updateTranscript(curatedTracklist); // Update before showing
//     transcriptContainer.style.display = "block";
//     transcriptButton.textContent = "Hide Transcript";
//   } else {
//     transcriptContainer.style.display = "none";
//     transcriptButton.textContent = "Show Transcript";
//   }
// }

// function resetTranscriptUI() {
//   console.log("resetTranscriptUI");
//   // findme - need to actually remove this
//   if (transcriptContainer && transcriptVisible) {
//     transcriptContainer.style.display = "none";
//     transcriptVisible = false;
//     transcriptContainer.innerHTML = ""; // Clear any previous transcript
//   }
// }
