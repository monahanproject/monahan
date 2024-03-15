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
