import { getLangState } from "./state.js";

export class Transcript {
  constructor(audioPlayer) {
    this.audioPlayer = audioPlayer;
    this.transcriptVisible = false;
    this.transcriptContent = null;
    this.transcriptContainer = document.getElementById("transcriptContainer");
    this.lang = localStorage.getItem("lang") || "EN";

    this.beginAgain = `<img id="begin-again" class="svg-icon" src="images/svg/beginAgain.svg" alt="Begin again">`;
    this.beginAgainInvert = `<img id="begin-again" class="svg-icon" src="images/svg/beginAgainInvert.svg" alt="Begin again">`;

    this.createTranscriptContainer();
  }

  createElement(type, attributes) {
    const element = document.createElement(type);
    Object.keys(attributes).forEach((attr) => (element[attr] = attributes[attr]));
    return element;
  }

  createTranscriptContainer() {
    if (!this.transcriptContainer) {
      console.error("Transcript container not found.");
      return;
    }

    this.transcriptContainer.style.opacity = "0";
    this.transcriptContainer.style.transition = "opacity 0.5s ease-in-out";
    this.transcriptContainer.style.display = "none";

    let transcriptButton = document.getElementById("transcriptButton");
    if (!transcriptButton) {
      this.lang = getLangState();

      transcriptButton = this.createElement("button", {
        type: "button",
        className: "btn",
        id: "transcriptButton",
        textContent: this.lang === "EN" ? "Show Transcript" : "Afficher la Transcription",
      });

      const transBtnContainer = document.getElementById("transButtonContainer");
      transBtnContainer.appendChild(transcriptButton);
      transcriptButton.addEventListener("click", this.toggleTranscript.bind(this));
    }

    if (!this.transcriptContent) {
      this.transcriptContent = this.createElement("div", { id: "transcriptContent", style: "display: none" });
      this.transcriptContainer.appendChild(this.transcriptContent);
    } else {
      this.transcriptContent.innerHTML = "";
    }
  }

  formatText(text) {
    const formatPatterns = {
      bold: /\^([^]+?)\^\^/g,
      center: /@([^]+?)@@/g,
      italics: /\$([^]+?)\$\$/g,
      lineBreak: /%/g,
    };

    return text
      .replace(formatPatterns.bold, '<span style="font-weight: bold;">$1</span>')
      .replace(formatPatterns.center, '<span style="display: block; text-align: center;">$1</span>')
      .replace(formatPatterns.italics, '<span style="font-style: italic;">$1</span>')
      .replace(formatPatterns.lineBreak, "</br>");
  }

  createHTMLFromText(text) {
    const container = this.createElement("div", {});
    const currentParagraph = this.createElement("p", {
      style: "margin-top: 3rem; margin-bottom: 1rem; padding: 1rem; background-color: #bfffc2; margin-left: 0; margin-right: 0;",
    });

    try {
      currentParagraph.innerHTML = this.formatText(text);
      container.appendChild(currentParagraph);
    } catch (error) {
      console.error("Error while processing input text:", error);
    }

    return container;
  }

  updateTranscript() {
    if (!this.transcriptContainer) {
      console.error("Transcript container not found.");
      return;
    }

    this.transcriptContainer.innerHTML = "";
    const language = localStorage.getItem("lang");
    const langKey = language === "EN" ? "engTrans" : "frTrans";

    const copyRightText =
      language === "EN"
        ? "$All recordings and transcripts are copyright protected. All rights reserved.$$"
        : "$Les enregistrements et les transcriptions sont protégés par le droit d’auteur. Tous droits réservés.$$";

    this.audioPlayer.tracklist.forEach((song) => {
      const inputString = song[langKey];
      if (inputString && inputString.trim() !== "") {
        this.transcriptContainer.appendChild(this.createHTMLFromText(inputString));
      }
    });

    this.transcriptContainer.appendChild(this.createHTMLFromText(copyRightText));
    this.transcriptContainer.style.display = "block";
  }

  toggleTranscript() {
    const transcriptButton = document.getElementById("transcriptButton");

    this.transcriptVisible = !this.transcriptVisible;
    if (this.transcriptVisible) {
      this.updateTranscript();
      this.transcriptContainer.style.display = "block";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.transcriptContainer.style.opacity = "1";
          this.transcriptContainer.style.transform = "translateY(0px)";
        });
      });

      this.lang = getLangState();

      if (this.lang == "EN") {
        transcriptButton.textContent = "Hide Transcript";
      } else {
        transcriptButton.textContent = "Masquer la Transcription";
      }
    } else {
      this.transcriptContainer.style.opacity = "0";
      this.transcriptContainer.style.transform = "translateY(20px)";
      setTimeout(() => {
        this.transcriptContainer.style.display = "none";
      }, 500);

      this.lang = getLangState();

      if (this.lang == "EN") {
        transcriptButton.textContent = "Show Transcript";
      } else {
        transcriptButton.textContent = "Afficher la Transcription";
      }
    }
  }
}
