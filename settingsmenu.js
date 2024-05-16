import { getState, setState, getLangState, setLangState, updateAriaStatusMessage } from "./state.js";

// Initialization
document.addEventListener("DOMContentLoaded", init);

let isInverted = getState(); // Initialize isInverted based on localStorage
let settingsBtn, monochromeBtn, increaseTextSizeBtn, decreaseTextSizeBtn, resetBtn, invertColoursBtn;
let isMonochrome = false;

function init() {
  cacheDOMElements();
  bindEvents();
  replaceSvgContent();
  initializeUserSettings();
}

function cacheDOMElements() {
  settingsBtn = document.getElementById("accessibilityNav");
  monochromeBtn = document.getElementById("monochromeBtn");
  increaseTextSizeBtn = document.getElementById("increaseTextSizeBtn");
  decreaseTextSizeBtn = document.getElementById("decreaseTextSizeBtn");
  resetBtn = document.getElementById("resetBtn");
  invertColoursBtn = document.getElementById("invertColoursBtn");
}

function bindEvents() {
  settingsBtn.addEventListener("click", toggleMenu);
  monochromeBtn.addEventListener("click", toggleMonochrome);
  increaseTextSizeBtn.addEventListener("click", () => changeTextSize(true));
  decreaseTextSizeBtn.addEventListener("click", () => changeTextSize(false));
  resetBtn.addEventListener("click", resetSettings);
  invertColoursBtn.addEventListener("click", swapColors);
  window.addEventListener("click", closeMenuOnClickOutside);
  window.addEventListener("keydown", handleGlobalKeydown);
  settingsBtn.addEventListener("keydown", handleMenuButtonKeydown);
  const menuItems = document.querySelectorAll("#slidein [role='menuitem']");
  menuItems.forEach(item => item.addEventListener('keydown', handleMenuItemKeydown));
}

function initializeUserSettings() {
  const userFontSize = localStorage.getItem("userFontSize");
  if (userFontSize) {
    document.documentElement.style.setProperty("--base-font-size", `${userFontSize}px`);
  }
}

// Utility Functions
export function toggleAriaPressed(element) {
  const isPressed = element.getAttribute("aria-pressed") === "true";
  element.setAttribute("aria-pressed", !isPressed);
}

function replaceSvgContent() {
  const isDesktop = window.matchMedia("(min-width: 900px)").matches;
  const logoPath = isDesktop ?
    (isInverted ? "images/svg/monohanLogoDesktopInvert2.svg" : "images/svg/monohanLogoDesktop2.svg") :
    (isInverted ? "images/svg/monohanLogoMobileInvert3.svg" : "images/svg/monohanLogoMobile2.svg");
  const svgContainer = document.getElementById("titleText");
  let imageElement = svgContainer.querySelector("img#monSvg");
  if (imageElement instanceof HTMLImageElement) {
    imageElement.src = logoPath;
  } else {
    imageElement = document.createElement("img");
    imageElement.src = logoPath;
    imageElement.className = "lettersBox";
    imageElement.id = "monSvg";
    svgContainer.appendChild(imageElement);
  }
}

const imageSourceMap = {
  "images/svg/invertColors.svg": "images/svg/invertColorsInvert.svg",
  "images/svg/monochrome1.svg": "images/svg/monochromeInvert.svg",
  "images/svg/firn.svg": "images/svg/firnInvert.svg",
  "images/svg/svg-upPlant.svg": "images/svg/svg-upPlantInvert.svg",
  "images/svg/separator.svg": "images/svg/separatorInvert.svg",
  "images/svg/30.svg": "images/svg/30Invert.svg",
  "images/svg/15.svg": "images/svg/15Invert.svg",
  "images/svg/cityOfOttawaLogo.svg": "images/svg/cityOfOttawaLogoInvert.svg",
  "images/svg/PublicArtLogo.svg": "images/svg/PublicArtLogoInvert.svg",
  "images/svg/stopButton.svg": "images/svg/stopButtonInvert.svg",
  "images/svg/playButton.svg": "images/svg/playButtonInvert.svg",
  "images/svg/pauseButton.svg": "images/svg/pauseButtonInvert.svg",
};

function toggleImageSources() {
  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    const src = img.getAttribute("src");
    const newSrc = isInverted ? (imageSourceMap[src] || src) : (Object.keys(imageSourceMap).find(key => imageSourceMap[key] === src) || src);
    img.setAttribute("src", newSrc);
  });
}

function toggleSvgBackgrounds() {
  const svgClasses = [
    { original: "svg-about", invert: "svg-about-invert" },
    { original: "svg-upPlant", invert: "svg-upPlant-invert" },
    { original: "svg-map", invert: "svg-map-invert" },
    { original: "svg-works", invert: "svg-works-invert" },
    { original: "svg-sideways", invert: "svg-sideways-invert" },
  ];

  svgClasses.forEach(({ original, invert }) => {
    document.querySelectorAll(`.${original}, .${invert}`).forEach((element) => {
      element.classList.toggle(invert, isInverted);
      if (!isInverted) {
        element.classList.remove(invert);
      }
    });
  });

  const allDivs = document.querySelectorAll(".svg-contributors, .svg-contributors2");
  allDivs.forEach((div) => {
    div.classList.toggle("svg-contributors2");
  });
}

function swapColors() {
  isInverted = !isInverted;
  setState(isInverted);
  updateCSSVariables();
  const transcriptContainer = document.getElementById("transcriptContainer");
  transcriptContainer.classList.toggle("invert-colors", isInverted);
  replaceSvgContent();
  toggleImageSources();
  toggleSvgBackgrounds();
  toggleAriaPressed(invertColoursBtn);
}

function updateCSSVariables() {
  const root = document.documentElement;
  root.style.setProperty("--lightgreen", isInverted ? "rgb(35, 78, 68)" : "rgb(191, 255, 194)");
  root.style.setProperty("--darkgreen", isInverted ? "rgb(191, 255, 194)" : "rgb(35, 78, 68)");
  root.style.setProperty("--black", isInverted ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)");
  root.style.setProperty("--white", isInverted ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)");
  root.style.setProperty("--grey", isInverted ? "rgb(122, 122, 122)" : "rgb(35, 78, 68)");
}

function toggleMonochrome(event) {
  event.preventDefault();
  event.stopPropagation();
  isMonochrome = !isMonochrome;

  document.body.style.filter = isMonochrome ? "grayscale(100%)" : "none";
  
  toggleAriaPressed(monochromeBtn);
}

function changeTextSize(increase) {
  const root = document.documentElement;
  let currentSize = parseFloat(getComputedStyle(root).getPropertyValue("--base-font-size-rem")) || 1;
  currentSize += increase ? 0.1 : -0.1;
  root.style.setProperty("--base-font-size-rem", `${currentSize}rem`);
  root.style.fontSize = `${currentSize}rem`;
  toggleAriaPressed(increase ? increaseTextSizeBtn : decreaseTextSizeBtn);
}

function toggleMenu() {
  const menu = document.getElementById("slidein");
  const isExpanded = settingsBtn.getAttribute("aria-expanded") === "true";
  settingsBtn.setAttribute("aria-expanded", !isExpanded);
  menu.classList.toggle("show");
  
  const menuVisibility = isExpanded ? "hidden" : "visible";
  menu.setAttribute("aria-hidden", isExpanded);
  
  updateAriaStatusMessage(`Menu is now ${menuVisibility}`);
  
  if (!isExpanded) {
    menu.querySelector('[role="menuitem"]').focus();
  } else {
    settingsBtn.focus();
  }
  toggleAriaPressed(settingsBtn);
}

function closeMenu() {
  const menu = document.getElementById("slidein");
  menu.classList.remove("show");
  menu.setAttribute("aria-hidden", "true");
  settingsBtn.setAttribute("aria-expanded", "false");
  settingsBtn.focus();
  updateAriaStatusMessage("Menu is now hidden");
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
});

function handleMenuButtonKeydown(event) {
  const menu = document.getElementById("slidein");
  const menuItems = menu.querySelectorAll('[role="menuitem"]');
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowUp':
      event.preventDefault();
      settingsBtn.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
      (event.key === 'ArrowDown' ? menuItems[0] : menuItems[menuItems.length - 1]).focus();
      break;
    case 'Escape':
      settingsBtn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      settingsBtn.focus();
      break;
  }
}

function handleMenuItemKeydown(event) {
  const menu = document.getElementById("slidein");
  const menuItems = menu.querySelectorAll('[role="menuitem"]');
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      (this.nextElementSibling || menuItems[0]).focus();
      break;
    case 'ArrowUp':
      event.preventDefault();
      (this.previousElementSibling || menuItems[menuItems.length - 1]).focus();
      break;
    case 'Escape':
      settingsBtn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      settingsBtn.focus();
      break;
  }
}

function closeMenuOnClickOutside(event) {
  if (!document.getElementById("slidein").contains(event.target) && !settingsBtn.contains(event.target)) {
    closeMenu();
  }
}

function handleGlobalKeydown(event) {
  if (event.key === "Escape") {
    closeMenu();
  }
}

function resetSettings() {

  // Turn off monochrome mode
  isMonochrome = false;
  document.body.style.filter = "none";
    
  document.body.classList.remove("monochrome");
  const root = document.documentElement;
  const defaultFontSize = "1rem";
  root.style.setProperty("--base-font-size-rem", defaultFontSize);
  root.style.fontSize = defaultFontSize;
  localStorage.removeItem("userFontSize");

  const transcriptContainer = document.getElementById("transcriptContainer");
  transcriptContainer.classList.remove("invert-colors");

  root.style.setProperty("--lightgreen", "rgb(191, 255, 194)");
  root.style.setProperty("--darkgreen", "rgb(35, 78, 68)");
  root.style.setProperty("--black", "rgb(0, 0, 0)");
  root.style.setProperty("--white", "rgb(255, 255, 255)");
  root.style.setProperty("--grey", "rgb(122, 122, 122)");

  if (isInverted) {
    isInverted = false;
    setState(isInverted);
    toggleImageSources();
    toggleSvgBackgrounds();
  }

  invertColoursBtn.setAttribute('aria-pressed', 'false');
  monochromeBtn.setAttribute('aria-pressed', 'false');
  increaseTextSizeBtn.setAttribute('aria-pressed', 'false');
  decreaseTextSizeBtn.setAttribute('aria-pressed', 'false');
  settingsBtn.setAttribute('aria-pressed', 'false');
  replaceSvgContent();
}
