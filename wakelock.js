const wakeLockCheckbox = document.querySelector('#wakeLockCheckbox');
const statusDiv = document.querySelector('#statusDiv');
const reaquireCheckbox = document.querySelector('#reacquireCheckbox');
const fullScreenButton = document.querySelector('#fullScreenButton');

console.log("hello!");

// Web Audio API setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = null;

function startSound() {
  // Resume AudioContext if it's suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  oscillator = audioContext.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  oscillator.connect(audioContext.destination);
  oscillator.start();
}

function stopSound() {
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
  }

  // Optionally suspend the AudioContext
  // if (audioContext.state === 'running') {
  //   audioContext.suspend();
  // }
}

fullScreenButton.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fullScreenButton.textContent = 'Leave Full Screen';
  } else {
    document.exitFullscreen();
    fullScreenButton.textContent = 'Enter Full Screen';
  }
});

if ('WakeLock' in window && 'request' in window.WakeLock) {  
  let wakeLock = null;
  
  const requestWakeLock = () => {
    const controller = new AbortController();
    const signal = controller.signal;
    window.WakeLock.request('screen', {signal})
      .then(() => {
        console.log("Start sound");
        startSound(); // Start sound when wake lock is active
      })
      .catch((e) => {      
        if (e.name === 'AbortError') {
          wakeLockCheckbox.checked = false;
          statusDiv.textContent = 'Wake Lock was aborted';
          console.log('Wake Lock was aborted');
        } else {
          statusDiv.textContent = `${e.name}, ${e.message}`;
          console.error(`${e.name}, ${e.message}`);
        }
      });
    wakeLockCheckbox.checked = true;
    statusDiv.textContent = 'Wake Lock is active';
    console.log('Wake Lock is active');
    return controller;
  };
  
  wakeLockCheckbox.addEventListener('change', () => {
    if (wakeLockCheckbox.checked) {
      // User interaction starts here
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('AudioContext resumed!');
          startSound(); // Start sound after resuming AudioContext
          wakeLock = requestWakeLock(); // Request wake lock after starting sound
        });
      } else {
        startSound(); // Start sound directly if AudioContext is running
        wakeLock = requestWakeLock();
      }
    } else {
      if (wakeLock) {
        wakeLock.abort(); // Abort wake lock when unchecked
      }
      stopSound(); // Stop sound when wake lock is not active
      wakeLock = null;
    }
  });
  
  const handleVisibilityChange = () => {    
    if (wakeLock !== null && document.visibilityState === 'visible') {
      wakeLock = requestWakeLock();
    }
  };    
  
  reaquireCheckbox.addEventListener('change', () => {
    if (reaquireCheckbox.checked) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', handleVisibilityChange);
    } else {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleVisibilityChange);      
    }
  });  
} else if ('wakeLock' in navigator && 'request' in navigator.wakeLock) {  
  let wakeLock = null;
  
  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      startSound(); // Start sound when wake lock is active
      wakeLock.addEventListener('release', (e) => {
        console.log(e);
        wakeLockCheckbox.checked = false;
        statusDiv.textContent = 'Wake Lock was released';
        console.log('Wake Lock was released');
        stopSound(); // Stop sound when wake lock is released                    
      });
      wakeLockCheckbox.checked = true;
      statusDiv.textContent = 'Wake Lock is active';
      console.log('Wake Lock is active');      
    } catch (e) {      
      wakeLockCheckbox.checked = false;
      statusDiv.textContent = `${e.name}, ${e.message}`;
      console.error(`${e.name}, ${e.message}`);
      stopSound(); // Stop sound if wake lock request fails
    } 
  };
  
  wakeLockCheckbox.addEventListener('change', () => {
    if (wakeLockCheckbox.checked) {
      requestWakeLock();
    } else {
      wakeLock.release();
      stopSound(); // Stop sound when wake lock is not active
      wakeLock = null;
    }
  });
  
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Resume AudioContext and reacquire wake lock if needed
      if (wakeLock !== null) {
        wakeLock = requestWakeLock();
      }
      startSound(); // This will also resume the AudioContext
    } else {
      // Optionally, stop sound when the tab goes into the background
      // stopSound();
    }
  };   
  
  reaquireCheckbox.addEventListener('change', () => {
    if (reaquireCheckbox.checked) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', handleVisibilityChange);
    } else {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleVisibilityChange);      
    }
  });  
} else {  
  statusDiv.textContent = 'Wake Lock API not supported.';
  console.error('Wake Lock API not supported.');
}
