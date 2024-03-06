timerjs backup


import { timerStateManager } from './play.js';



//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//  XXXXXXXXXXX  TIMER  XXXXXXXXXXXXX
//  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX





export function updateProgressTimerr(elapsedSeconds, previousDuration) {
    console.log(`updateProgressTimerr called with elapsedSeconds: ${elapsedSeconds}, previousDuration: ${previousDuration}`);
    
    const progressBar = document.getElementById("progress-bar");
    const progressDot = document.getElementById("progress-dot");
    const timePlayedElement = document.getElementById("time-played");
    const timeRemainingElement = document.getElementById("time-remaining");
  
    if (!timePlayedElement || !timeRemainingElement || !progressBar || !progressDot) {
      console.error("Error: Missing elements");
      return;
    }
  
    let timeSecs = timerStateManager.getTimeSecs();
    let durSecs = timerStateManager.getDurSecs();
    console.log(`timeSecs: ${timeSecs}, durSecs: ${durSecs}`);
    
    durSecs = timeSecs;
    const remainingDurationSeconds = durSecs - (elapsedSeconds + previousDuration);
    console.log(`remainingDurationSeconds: ${remainingDurationSeconds}`);
    
    const playedPercentage = ((elapsedSeconds + previousDuration) / durSecs) * 100;
    console.log(`playedPercentage: ${playedPercentage}`);
  
    progressBar.style.width = `${playedPercentage}%`;
    progressDot.style.left = `calc(${playedPercentage}% - 5px)`;
  
    const playedTime = calculateMinutesAndSeconds(elapsedSeconds + previousDuration);
    const remainingTime = calculateMinutesAndSeconds(remainingDurationSeconds);
    console.log(`playedTime: ${playedTime.minutes}:${playedTime.seconds}, remainingTime: ${remainingTime.minutes}:${remainingTime.seconds}`);
    
    timePlayedElement.innerText = `${playedTime.minutes}:${playedTime.seconds}`;
    timeRemainingElement.innerText = `-${remainingTime.minutes}:${remainingTime.seconds}`;
}

  
  export function handleTimerCompletion() {
    const timeRemainingElement = document.getElementById("time-remaining");
  
    if (!timeRemainingElement) {
      console.error("Error: Missing element 'time-remaining'");
      return; // Exit the function to prevent further errors
    }
    timeRemainingElement.innerHTML = "Done";
  }
  
  export function calculateMinutesAndSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });
    return { minutes, seconds: remainingSeconds };
  }
  
  export function calculateRemainingTime(elapsedSeconds) {
    let durSecs = timerStateManager.getDurSecs();

    return durSecs - elapsedSeconds;
  }
  
  export function createTimerLoopAndUpdateProgressTimer() {
    console.log("Creating timer loop");
    var start = Date.now();
    const player = timerStateManager.getPlayer();
    if (!player) {
        console.error("Player not found");
        return;
    }
    return setInterval(() => {
        let delta = Date.now() - start;
        let deltaSeconds = Math.floor(delta / 1000);
        console.log(`Interval running - deltaSeconds: ${deltaSeconds}, player.currentTime: ${player.currentTime}`);
        
        let timDuration = timerStateManager.getTimerDuration();
        updateProgressTimerr(Math.floor(player.currentTime), timDuration);
        let remTime = timerStateManager.getRemTime();
        remTime = calculateRemainingTime(deltaSeconds);
        console.log(`Updated timerDuration: ${timDuration}, Updated remTime: ${remTime}`);
    }, 1000);
}

