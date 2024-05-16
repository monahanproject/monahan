//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXX BEFORE THE RULES, WE SHUFFLE OUR TRACKLIST XXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

export function shuffleTracklist(tracklist) {
    // Skip the first track (intro) and shuffle the rest of the tracks
    for (let i = tracklist.length - 1; i > 1; i--) {
      const j = Math.floor(Math.random() * (i - 1)) + 1; // Ensure j is at least 1
      [tracklist[i], tracklist[j]] = [tracklist[j], tracklist[i]];
    }
    return tracklist;
  }
  
  export function shuffleArrayOfRules(shuffledRulesArray) {
    const lastElement = shuffledRulesArray.pop(); // Remove the last element
    for (let i = shuffledRulesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledRulesArray[i], shuffledRulesArray[j]] = [shuffledRulesArray[j], shuffledRulesArray[i]]; // Swap elements at i and j
    }
    shuffledRulesArray.push(lastElement); // Add the last element back to the end
    return shuffledRulesArray; // Return the shuffled array
  }