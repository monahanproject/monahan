import { getState, setState } from "./state.js";
let isInverted = getState(); // This will initialize isInverted based on localStorage


let settingsBtn = document.getElementById("accessiblityNav");
let monochromeBtn = document.getElementById("monochromeBtn");
let increaseTextSizeBtn = document.getElementById("increaseTextSizeBtn");
let decreaseTextSizeBtn = document.getElementById("decreaseTextSizeBtn");
let resetBtn = document.getElementById("resetBtn");

function replaceSvgContent() {
  const isDesktop = window.matchMedia("(min-width: 900px)").matches; // Check if it's desktop
  let logoPath; // Variable to hold the path for the logo

  if (isDesktop) {
    logoPath = isInverted ? "images/svg/monohanLogoDesktopInvert2.svg" : "images/svg/monohanLogoDesktop2.svg";
  } else {
    logoPath = isInverted ? "images/svg/monohanLogoMobileInvert2.svg" : "images/svg/monohanLogoMobile2.svg";
  }
  console.log(`Selected logo path: ${logoPath}`);

  let svgContainer = document.getElementById("titleText");
  // Check if the container already contains an <img> element
  let imageElement = svgContainer.querySelector("img#monSvg");

  if (imageElement) {
    // If <img> exists, just update its src attribute
    imageElement.src = logoPath;
  } else {
    imageElement = document.createElement("img");
    imageElement.src = logoPath;
    imageElement.className = "lettersBox";
    imageElement.id = "monSvg";
    imageElement.alt = "Monahan: Art, Public Art";
    svgContainer.appendChild(imageElement);
  }
}

let invertColoursBtn = document.getElementById("invertColoursBtn"); // Get the invert colors button
const imageSourceMap = {
  "images/svg/accessIconInvert.svg": "images/svg/accessIcon.svg",
  "images/svg/invertColors.svg": "images/svg/invertColorsInvert.svg",
  "images/svg/monochrome1.svg": "images/svg/monochromeInvert.svg",
  "images/svg/firn.svg": "images/svg/firnInvert.svg",
  "images/svg/svg-upPlant.svg": "images/svg/svg-upPlantInvert.svg",
  "images/svg/separator.svg": "images/svg/separatorInvert.svg",
  "images/svg/30.svg": "images/svg/30Invert.svg",
  "images/svg/15.svg": "images/svg/15Invert.svg",
  // "images/svg/-contributors1.svg": "images/svg/-contributors1Invert.svg",
  "images/svg/cityOfOttawaLogo.svg": "images/svg/cityOfOttawaLogoInvert.svg",
  "images/svg/PublicArtLogo.svg": "images/svg/PublicArtLogoInvert.svg",
  "images/svg/stopButton.svg": "images/svg/stopButtonInvert.svg",
  "images/svg/playButton.svg": "images/svg/playButtonInvert.svg",
};

function toggleImageSources() {
  console.log(`Toggling image sources. Current isInverted state: ${isInverted}`); // Log current state
  const images = document.querySelectorAll("img"); // Select all <img> elements
  images.forEach((img) => {
    const src = img.getAttribute("src");
    let newSrc;

    if (isInverted) {
      // Directly use inverted images based on the mapping
      newSrc = imageSourceMap[src] ? imageSourceMap[src] : src;
      console.log(`Mapping to inverted: ${newSrc}`); // Correctly log intended new source
    } else {
      // Attempt to find the original source, this is correct for reverting
      const originalSrc = Object.keys(imageSourceMap).find((key) => imageSourceMap[key] === src);
      newSrc = originalSrc ? originalSrc : src;
      console.log(`Mapping to original: ${newSrc}`); // Log intended new source
    }

    img.setAttribute("src", newSrc); // Update the image source
  });
}

function toggleSvgBackgrounds() {
  const svgClasses = [
    { original: "svg-about", invert: "svg-about-invert" },
    { original: "svg-upPlant", invert: "svg-upPlant-invert" },
    { original: "svg-works", invert: "svg-works-invert" },
    { original: "svg-sideways", invert: "svg-sideways-invert" },
  ];

  svgClasses.forEach(({ original, invert }) => {
    document.querySelectorAll(`.${original}, .${invert}`).forEach((element) => {
      element.classList.toggle(invert, isInverted); // Add if isInverted, remove if not
      if (!isInverted) {
        element.classList.remove(invert); // Ensure inverted class is removed if not inverted
      }
    });
  });

  // Select all divs with either class
  const allDivs = document.querySelectorAll(".svg-contributors, .svg-contributors2");

  // Iterate through the NodeList
  allDivs.forEach((div) => {
    // Check if the div has the 'svg-contributors2' class
    if (div.classList.contains("svg-contributors2")) {
      // It has 'svg-contributors2', so we remove it
      div.classList.remove("svg-contributors2");
    } else {
      // It doesn't have 'svg-contributors2', so we add it
      div.classList.add("svg-contributors2");
    }
  });
}

function swapColors() {
  isInverted = !isInverted; // Toggle the inversion state
  setState(isInverted); // Update the state in localStorage and application state

  // Update CSS variables for color inversion
  const root = document.documentElement;
  root.style.setProperty("--lightgreen", isInverted ? "rgb(35, 78, 68)" : "rgb(191, 255, 194)");
  root.style.setProperty("--darkgreen", isInverted ? "rgb(191, 255, 194)" : "rgb(35, 78, 68)");
  root.style.setProperty("--black", isInverted ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)");
  root.style.setProperty("--white", isInverted ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)");
  root.style.setProperty("--grey", isInverted ? "rgb(122, 122, 122)" : "rgb(35, 78, 68)");

  const transcriptContainer = document.getElementById("transcriptContainer");
  transcriptContainer.classList.toggle("invert-colors", isInverted);

  replaceSvgContent(); // Update the logo based on the new state
  toggleImageSources(); // Update other images if needed
  toggleSvgBackgrounds(); // Also, ensure SVG backgrounds are toggled if needed
}

invertColoursBtn.addEventListener("click", swapColors);

function toggleMonochrome() {
  document.body.classList.toggle("monochrome");
}

// Example: Increasing the root font size by 0.1rem each time
function changeTextSize(increase) {
  let root = document.documentElement;
  let currentSize = parseFloat(getComputedStyle(root).getPropertyValue("--base-font-size-rem")) || 1; // Default to 1rem if not set

  if (increase) {
    currentSize += 0.1; // Increase by 0.1rem
  } else {
    currentSize -= 0.1; // Decrease by 0.1rem
  }

  root.style.setProperty("--base-font-size-rem", `${currentSize}rem`);

  root.style.fontSize = `${currentSize}rem`;
}

settingsBtn.addEventListener("click", function () {
  document.getElementById("slidein").classList.toggle("show");
});

monochromeBtn.addEventListener("click", toggleMonochrome);
increaseTextSizeBtn.addEventListener("click", () => changeTextSize(true));
decreaseTextSizeBtn.addEventListener("click", () => changeTextSize(false));
resetBtn.addEventListener("click", resetSettings);

document.addEventListener("DOMContentLoaded", function () {
  replaceSvgContent(); // This now handles setting the initial correct logo

  //   if (window.matchMedia("(min-width: 900px)").matches) {
  //     console.log("Desktop version");
  //     var svgContainer = document.getElementById('titleText');
  //     svgContainer.innerHTML = '<img src="images/svg/monohanLogoDesktopInvert.svg" class="lettersBox" id="desktopSvg" alt="Monahan: Art, Public Art">';
  // }

  const userFontSize = localStorage.getItem("userFontSize");
  if (userFontSize) {
    document.documentElement.style.setProperty("--base-font-size", `${userFontSize}px`);
  }

  // Invert Colors Click Area Expansion
  const invertColorsContainer = document.querySelector(".dropdownContainer.invertColors"); // Add a class or use an existing one
  invertColorsContainer.addEventListener("click", function () {
    document.getElementById("invertColoursBtn").click(); // Programmatically click the button
  });

  // Monochrome Click Area Expansion
  const monochromeContainer = document.querySelector(".dropdownContainer.monochromee"); // Add a class or use an existing one
  monochromeContainer.addEventListener("click", function () {
    document.getElementById("monochromeBtn").click(); // Programmatically click the button
  });

  // Make sure to prevent the event from firing twice if the button itself is clicked
  document.querySelectorAll(".dropdownContainer button").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent the li's click event from firing
    });
  });
});

// Close the menu by clicking outside
window.addEventListener("click", function (e) {
  if (!document.getElementById("slidein").contains(e.target) && !settingsBtn.contains(e.target)) {
    document.getElementById("slidein").classList.remove("show");
  }
});

// Close the menu with the Escape key
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.getElementById("slidein").classList.remove("show");
  }
});

function resetSettings() {
  // Remove the monochrome class
  document.body.classList.remove("monochrome");

  // Reset font size to default
  let defaultFontSize = "6.9vw";
  document.documentElement.style.setProperty("--base-font-size", defaultFontSize);
  localStorage.removeItem("userFontSize"); // Clear stored font size

    // Remove the invert-colors class from the transcript container
    const transcriptContainer = document.getElementById("transcriptContainer");
    if (transcriptContainer.classList.contains("invert-colors")) {
      transcriptContainer.classList.remove("invert-colors");
    }

  // Reset color theme variables
  const root = document.documentElement;
  root.style.setProperty("--lightgreen", "rgb(191, 255, 194)");
  root.style.setProperty("--darkgreen", "rgb(35, 78, 68)");
  root.style.setProperty("--black", "rgb(0, 0, 0)");
  root.style.setProperty("--white", "rgb(255, 255, 255)");
  root.style.setProperty("--grey", "rgb(122, 122, 122)"); // Reset any other modified CSS variables to their defaults

  // Ensure isInverted is reset correctly
  if (isInverted) {
    isInverted = false;
    setState(isInverted); // This ensures the central state and localStorage are updated.
    toggleImageSources(); // Ensure images are reset to their original sources
    toggleSvgBackgrounds(); // Ensure SVG backgrounds are reset
  }

  let defaultRootFontSize = "1rem"; // Default root font size
  document.documentElement.style.setProperty("--base-font-size-rem", defaultRootFontSize);
  document.documentElement.style.fontSize = defaultRootFontSize;
}

document.addEventListener("keydown", function (event) {
  if (event.key === "d" || event.key === "D") {
    // This makes it case-insensitive
    var debugDiv = document.getElementById("debugdiv");
    if (debugDiv.style.display === "none") {
      debugDiv.style.display = "block"; // Show the div
      console.log("show div");
    } else {
      debugDiv.style.display = "none"; // Hide the div
      console.log("hide div");
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {});
