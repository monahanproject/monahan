import { getState, setState, getLangState, setLangState, updateAriaStatusMessage } from "./state.js";
import { productionPageEN, productionPageFR, contributorsPageEN, contributorsPageFR, strings } from "./translationStrings.js";
import { toggleAriaPressed } from "./settingsmenu.js";

let lang = localStorage.getItem("lang") || "EN"; // Retrieve initial language setting


function toggleLanguageAndStorePref() {
  console.log("toggled lang");
  lang = getLangState() === "EN" ? "FR" : "EN"; // Toggle the language
  setLangState(lang); // Update language in localStorage
  updateTexts(); // Update the UI to reflect the new language
  toggleAriaPressed(document.getElementById("toggleLanguage"));
}

function updateTexts() {
  // Example function calls that would need to be updated to support dynamic language change
  updateLanguageLabel();
  updatePageContent();
  adjustFontSize("play-button-text-container");
  changeEachLangDiv(); // Update all dynamic strings to the current language

  if (lang === "FR") {
    const playButtonTextContainer = document.getElementById("play-button-text-container");
    playButtonTextContainer.style.left = "40%";
    adjustFontSize("play-button-text-container");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateTexts(); // Initialize texts based on the stored language
  document.querySelector("#toggleLanguage").addEventListener("click", toggleLanguageAndStorePref);
});

function updateLanguageLabel() {
  const langToggleButton = document.getElementById("langToggle");

  if (langToggleButton) {
    const newSrc = lang === "EN" ? "images/svg/FR.svg" : "images/svg/EN.svg";
    langToggleButton.src = `${newSrc}?${new Date().getTime()}`; // Prevent caching
  } else {
    console.error("Language toggle image not found");
  }
}

function updatePageContent() {
  const contributorsPage = document.getElementById("contributorsTeamPageInner");
  const productionPage = document.getElementById("productionTeamPageInner");

  if (contributorsPage) {
    contributorsPage.innerHTML = lang === "EN" ? contributorsPageEN : contributorsPageFR;
  } else {
    console.error("Contributors page element not found");
  }

  if (productionPage) {
    productionPage.innerHTML = lang === "EN" ? productionPageEN : productionPageFR;
  } else {
    console.error("Production team page element not found");
  }
}

function changeEachLangDiv() {
  strings.forEach(changeEachString);
  buttonStrings.forEach(changeEachBtnString);
}

// Update individual strings to the current language and adjust font sizes for specific elements
function changeEachString(string) {
  const element = document.getElementById(string.id);
  if (element) {
    element.innerHTML = lang === "FR" ? string.fr : string.en;
    adjustFontSize(string.id); // Adjust font size based on language
  } else {
    console.error(`Element with ID '${string.id}' not found.`);
  }
}

// Update button strings to the current language
function changeEachBtnString(string) {
  const element = document.querySelector("#" + string.id);
  if (element) {
    element.innerHTML = lang === "FR" ? string.fr : string.en;
  } else {
    console.error(`Button element with ID '${string.id}' not found.`);
  }
}

const buttonStrings = [
  { id: "invertColorsTxt", en: "Invert Colours", fr: "Inverser les couleurs" },
  { id: "textSizeTxt", en: "Text Size", fr: "Taille du Texte" },
  { id: "resetBtn", en: "Reset", fr: "Réinitialiser" },
  { id: "transcriptButton", en: "TRANSCRIPT", fr: "TRANSCRIPTION" },
  { id: "play-button-text-container", en: "BEGIN", fr: "COMMENCER" },
];

const originalFontSizes = {};

function adjustFontSize(elementId) {
  const sizeReductions = {
    curiousEarsTxt: 0.6,
  };

  if (!window.matchMedia("(min-width: 900px)").matches) {
    console.log("Viewport is less than 900px wide");
    sizeReductions["play-button-text-container"] = 0.9;
  } else {
    sizeReductions["play-button-text-container"] = 0.6;
  }

  if (sizeReductions.hasOwnProperty(elementId)) {
    const element = document.getElementById(elementId);

    if (lang === "FR") {
      if (!originalFontSizes.hasOwnProperty(elementId)) {
        const computedStyle = window.getComputedStyle(element);
        originalFontSizes[elementId] = computedStyle.fontSize;
      }

      const newSize = parseFloat(originalFontSizes[elementId]) * sizeReductions[elementId];
      element.style.fontSize = `${newSize}px`;
    } else {
      if (originalFontSizes.hasOwnProperty(elementId)) {
        element.style.fontSize = originalFontSizes[elementId];
      }
    }
  }
}
