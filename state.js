export function updateAriaStatusMessage(message) {
  const ariaStatus = document.getElementById("aria-status");
  
  if (ariaStatus) {
    // Check if the message is redundant and should be hidden
    if (message.includes("redundant message part")) {
      ariaStatus.setAttribute("aria-hidden", "true");
    } else {
      ariaStatus.removeAttribute("aria-hidden");
    }

    ariaStatus.textContent = message;
  }
}


// Initialize a variable to hold the initial state of 'isInverted' directly.
let initialState = false; // Default to false, as you're not loading from localStorage anymore.

// Define the 'state' object with a property 'isInverted' initialized to the value of 'initialState'.
let state = {
  isInverted: initialState
};

// Define a function 'getState' that returns the current state of 'isInverted'.
export const getState = () => state.isInverted;

// Define a function 'setState' to update the state of 'isInverted'.
// This function now only updates the state object without interacting with localStorage.
export const setState = (isInverted) => {
  state.isInverted = isInverted; // Update the state object with the new value.
};


// Initialize the language state based on localStorage or default to "EN"
export let lang = localStorage.getItem("lang") || "EN";

// Function to get the current language
export function getLangState() {
  return lang;
}

// Function to set the current language and update localStorage
export function setLangState(newLang) {
  lang = newLang;
  localStorage.setItem("lang", newLang);
}

// Export the language state directly (not necessary but can be useful if direct access is needed elsewhere)
export default lang;
