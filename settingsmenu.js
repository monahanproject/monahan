let settingsBtn = document.getElementById("accessiblityNav");
let monochromeBtn = document.getElementById("monochromeBtn");
let increaseTextSizeBtn = document.getElementById("increaseTextSizeBtn");
let decreaseTextSizeBtn = document.getElementById("decreaseTextSizeBtn");
let resetBtn = document.getElementById("resetBtn");

let isInverted = false;




function replaceSvgContent() {
  if (window.matchMedia("(min-width: 900px)").matches) {
      console.log("Desktop version");
      document.getElementById('titleText').innerHTML = '<img src="images/svg/MonohanLogoDesktop.svg" class="lettersBox" id="monSvg" alt="Monahan: Art, Public Art">';
  } else {
      console.log("Mobile version");
      // Replace with mobile SVG or other content as needed
      document.getElementById('titleText').innerHTML = '<img src="images/svg/MonohanLogoMobile.svg" class="lettersBox" id="monSvg" alt="Monahan: Art, Public Art"/>';
  }
}

// Listen for DOMContentLoaded to initially replace content
document.addEventListener("DOMContentLoaded", replaceSvgContent);

// Listen for resize event to dynamically replace content as the window size changes
window.addEventListener('resize', replaceSvgContent);


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
  "images/svg/-contributors1.svg": "images/svg/-contributors1Invert.svg",
  "images/svg/cityOfOttawaLogo.svg": "images/svg/cityOfOttawaLogoInvert.svg",
  "images/svg/PublicArtLogo.svg": "images/svg/PublicArtLogoInvert.svg",
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
  // List of classes to toggle
  const svgClasses = [
    { original: "svg-about", invert: "svg-about-invert" },
    { original: "svg-upPlant", invert: "svg-upPlant-invert" },
    { original: "svg-works", invert: "svg-works-invert" },
    { original: "svg-sideways", invert: "svg-sideways-invert" },
    { original: "svg-contributors", invert: "svg-contributors-invert" },
    { original: "svg-contributors2", invert: "svg-contributors2-invert" },
  ];

  svgClasses.forEach((svgClass) => {
    const elements = document.querySelectorAll("." + svgClass.original + ", ." + svgClass.invert);
    elements.forEach((element) => {
      if (isInverted) {
        if (!element.classList.contains(svgClass.invert)) {
          element.classList.add(svgClass.invert);
        }
      } else {
        if (element.classList.contains(svgClass.invert)) {
          element.classList.remove(svgClass.invert);
        }
      }
    });
  });
}

function swapColors() {
  console.log("swapColors called"); // Initial log
  requestAnimationFrame(() => {
    console.log(`Before toggling, isInverted is: ${isInverted}`); // Log before toggle
    isInverted = !isInverted;
    console.log(`After toggling, isInverted is now: ${isInverted}`); // Log after toggle

    const root = document.documentElement;
    root.style.setProperty("--lightgreen", isInverted ? "rgb(35, 78, 68)" : "rgb(191, 255, 194)");
    root.style.setProperty("--darkgreen", isInverted ? "rgb(191, 255, 194)" : "rgb(35, 78, 68)");

    root.style.setProperty("--black", isInverted ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)");
    root.style.setProperty("--white", isInverted ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)");

    root.style.setProperty("--grey", isInverted ? "rgb(122, 122, 122)" : "rgb(35, 78, 68)");

    // Apply the image source toggling within the same frame
    toggleImageSources();
    toggleSvgBackgrounds();
  });
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

document.addEventListener("DOMContentLoaded", () => {
  const userFontSize = localStorage.getItem("userFontSize");
  if (userFontSize) {
    document.documentElement.style.setProperty("--base-font-size", `${userFontSize}px`);
  }
});

settingsBtn.addEventListener("click", function () {
  document.getElementById("slidein").classList.toggle("show");
});

monochromeBtn.addEventListener("click", toggleMonochrome);
increaseTextSizeBtn.addEventListener("click", () => changeTextSize(true));
decreaseTextSizeBtn.addEventListener("click", () => changeTextSize(false));
resetBtn.addEventListener("click", resetSettings);


document.addEventListener('DOMContentLoaded', function() {
  // Invert Colors Click Area Expansion
  const invertColorsContainer = document.querySelector('.dropdownContainer.invertColors'); // Add a class or use an existing one
  invertColorsContainer.addEventListener('click', function() {
    document.getElementById('invertColoursBtn').click(); // Programmatically click the button
  });

  // Monochrome Click Area Expansion
  const monochromeContainer = document.querySelector('.dropdownContainer.monochromee'); // Add a class or use an existing one
  monochromeContainer.addEventListener('click', function() {
    document.getElementById('monochromeBtn').click(); // Programmatically click the button
  });

  // Make sure to prevent the event from firing twice if the button itself is clicked
  document.querySelectorAll('.dropdownContainer button').forEach(button => {
    button.addEventListener('click', function(e) {
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
    toggleImageSources(); // Resets images to their original sources
    toggleSvgBackgrounds(); // Ensure SVG backgrounds are also reset
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
