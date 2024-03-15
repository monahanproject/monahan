// Initialize a variable to hold the initial state of 'isInverted'.
// This checks the browser's localStorage to see if 'isInverted' has been saved.
// If 'isInverted' is saved and set to 'true', initialState will be true.
// Otherwise, it defaults to false (e.g., when 'isInverted' is not in localStorage or is set to 'false').
let initialState = localStorage.getItem('isInverted') === 'true';


// Define the 'state' object with a property 'isInverted' initialized to the value of 'initialState'.
// This allows the state to persist across page reloads or sessions, based on the user's previous interactions.
let state = {
  isInverted: initialState
};

// Define a function 'getState' that returns the current state of 'isInverted'.
// This function provides a read-only access to the state, allowing other parts of the application
// to check the current theme without directly accessing the state object.
export const getState = () => state.isInverted;

// Define a function 'setState' to update the state of 'isInverted' and synchronize it with localStorage.
// This function serves two purposes:
// 1. It updates the 'isInverted' property of the state object with the new value provided as 'isInverted'.
// 2. It updates localStorage with the new 'isInverted' state. This ensures that the user's preference
//    for the inverted theme is remembered across sessions. When the user returns to the site,
//    the theme can automatically be set to their last choice.
export const setState = (isInverted) => {
  state.isInverted = isInverted; // Update the state object with the new value.
  localStorage.setItem('isInverted', isInverted); // Persist the new state in localStorage for future sessions.
};
