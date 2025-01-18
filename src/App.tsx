import React, { useState, useRef, useEffect } from 'react';

type Temperature = 'Fridge' | 'Room';
type Size = 'Small' | 'Medium' | 'Large';
type Hardness = 'Runny' | 'Soft' | 'Hard';

const App: React.FC = () => {
  const [temperature, setTemperature] = useState<Temperature>('Room');
  const [size, setSize] = useState<Size>('Medium');
  const [hardness, setHardness] = useState<Hardness>('Runny');
  const [time, setTime] = useState(0);
  const baseTimes: Record<Hardness, number> = {
    Runny: 1,
    Soft: 7, 
    Hard: 10
  };

  const [isCooking, setIsCooking] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showBoilConfirm, setShowBoilConfirm] = useState(false);
  const [showBoilWarning, setShowBoilWarning] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [showAlarmPreference, setShowAlarmPreference] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const alarmAudioRef = useRef<HTMLAudioElement>(new Audio('/alarm.mp3'));

  useEffect(() => {
    // Initialize audio element
    const audio = alarmAudioRef.current;
    audio.id = 'alarm';
    audio.preload = 'auto';
    
    return () => {
      // Cleanup audio on unmount
      audio.pause();
      audio.currentTime = 0;
      setIsAlarmPlaying(false);
    };
  }, []);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  const workerRef = useRef<Worker>();

  const createMessageHandler = () => (e: MessageEvent) => {
    if (e.data.done) {
      setShowAlarm(true);
      setIsCooking(false);
      setTime(0);
      
      // Stop any existing alarm
      if (alarmAudioRef.current && isAlarmPlaying) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current.currentTime = 0;
        setIsAlarmPlaying(false);
      }
      
      // Only play new alarm if enabled
      const enableAlarm = e.data.enableAlarm ?? false;
      console.log('Alarm preference:', enableAlarm);
      
      if (enableAlarm && alarmAudioRef.current) {
        // Wait for pause to complete before playing
        setTimeout(() => {
          alarmAudioRef.current.loop = true;
          alarmAudioRef.current.play()
            .then(() => setIsAlarmPlaying(true))
            .catch((error) => {
              console.log('Alarm playback failed:', error);
              setIsAlarmPlaying(false);
            });
        }, 100); // Small delay to ensure pause completes
      }
      
      // Stop the worker when done
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'stop' });
      }
    } else if (typeof e.data.time === 'number' && !isNaN(e.data.time)) {
      const newTime = Math.floor(e.data.time);
      if (!isNaN(newTime)) {
        setTime(newTime);
        requestAnimationFrame(() => {
          setTime(prev => prev);
        });
      }
    }
  };

  useEffect(() => {
    // Only initialize worker if it doesn't already exist
    if (!workerRef.current) {
      const initializeWorker = async () => {
        try {
          const worker = new Worker(new URL('./timer.worker.ts', import.meta.url));
          worker.onmessage = createMessageHandler();
          worker.onerror = (error) => {
            console.error('Worker error:', error);
          };
          workerRef.current = worker;
          console.log('Worker initialized successfully');

          // Test worker communication
          worker.postMessage({ type: 'ping' });

          // Add error listener for unhandled worker errors
          worker.addEventListener('error', (event) => {
            console.error('Worker error event:', event);
          });

          // Add messageerror listener
          worker.addEventListener('messageerror', (event) => {
            console.error('Worker message error:', event);
          });
        } catch (error) {
          console.error('Failed to initialize worker:', error);
        }
      };

      initializeWorker();
    }

    return () => {
      // Only terminate worker if it exists and we're not in development mode
      if (workerRef.current && process.env.NODE_ENV !== 'development') {
        workerRef.current.terminate();
        console.log('Worker terminated');
        workerRef.current = undefined;
      }
    };
  }, []);

  const startTimer = () => {
    setShowBoilConfirm(true);
  };

  const confirmBoil = () => {
    setShowBoilConfirm(false);
    setShowAlarmPreference(true);
  };

  const confirmAlarmPreference = (enable: boolean) => {
    setShowAlarmPreference(false);
    
    // Initialize or reset alarm audio
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
      if (enable) {
        // Initialize audio by briefly playing silently
        alarmAudioRef.current.volume = 0;
        alarmAudioRef.current.play()
          .then(() => {
            console.log('Alarm audio initialized');
            // Reset volume to normal after brief play
            setTimeout(() => {
              alarmAudioRef.current.pause();
              alarmAudioRef.current.currentTime = 0;
              alarmAudioRef.current.volume = 1;
            }, 20); // Play silently for 20ms
          })
          .catch((error) => {
            console.log('Alarm initialization failed:', error);
          });
      }
    }
    
    // Log the alarm preference
    console.log('Alarm preference set to:', enable);
    
    // Calculate adjusted time
    let adjustedTime = baseTimes[hardness] * 60;
    if (size === 'Small') adjustedTime -= 30;
    if (size === 'Large') adjustedTime += 30;
    if (temperature === 'Fridge') adjustedTime += 45;
    
    // Start timer with current alarm preference
    setTime(adjustedTime);
    setIsCooking(true);
    workerRef.current?.postMessage({ 
      type: 'start', 
      time: adjustedTime,
      enableAlarm: enable // Pass alarm preference to worker
    });
    
    // Store alarm preference in localStorage
    try {
      localStorage.setItem('enableAlarm', JSON.stringify(enable));
    } catch (error) {
      console.error('Failed to store alarm preference:', error);
    }
  };

  const cancelBoil = () => {
    setShowBoilConfirm(false);
    setShowBoilWarning(true);
  };

  const resetTimer = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    // Clear animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
    
    // Stop worker but don't terminate
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'stop' });
    }
    
    // Reset all state
    setTime(0);
    setIsCooking(false);
    setShowResetConfirm(false);
    setShowAlarm(false);
    
    // Stop any alarm
    if (alarmAudioRef.current && isAlarmPlaying) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
      setIsAlarmPlaying(false);
    }
    
    // Reinitialize worker
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = undefined;
    }
    const initializeWorker = async () => {
      try {
        const worker = new Worker(new URL('./timer.worker.ts', import.meta.url));
        worker.onmessage = createMessageHandler();
        worker.onerror = (error) => {
          console.error('Worker error:', error);
        };
        workerRef.current = worker;
        console.log('Worker reinitialized after reset');
      } catch (error) {
        console.error('Failed to reinitialize worker:', error);
      }
    };
    initializeWorker();
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-orange-100 to-orange-200 text-orange-900">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)]">
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-center text-orange-600 mb-8 flex flex-row items-center justify-center">
        <span className="inline-block transform rotate-12 text-white [text-shadow:_0_0_2px_rgba(0,0,0,0.3)] mr-2 sm:mr-4">🥚</span>
        <span>Perfect Egg Timer</span>
        <span className="inline-block transform -rotate-12 text-white [text-shadow:_0_0_2px_rgba(0,0,0,0.3)] ml-2 sm:ml-4">🐣</span>
      </h1>
      <button 
        onClick={() => setShowInstructions(true)}
        className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-2 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-orange-200/50 active:scale-95 mb-8"
      >
        Boiling Instructions
      </button>

      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-[48rem] space-y-4 border-2 border-orange-200">
            <h2 className="text-xl font-bold text-orange-800 mb-4">Boiling Instructions:</h2>
            <ol className="list-decimal list-inside space-y-2 text-orange-700">
              <li>Fill a pot with enough water to completely submerge the eggs by at least 1 inch.</li>
              <li>Place the eggs in water.</li>
              <li>Bring the water to a boil (large rapidly forming bubbles at water surface).</li>
              <li>Once the water is boliling, start the egg timer with correct settings.</li>
              <li>When the timer goes off, transfer the eggs to a bowl of ice water, or run them under cold water. This is important to stop the cooking process!</li>
            </ol>
            <div className="flex justify-center">
              <button
                onClick={() => setShowInstructions(false)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-gray-200/50 active:scale-95 mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mx-4 sm:mx-8 md:mx-8 lg:mx-12 w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] md:w-[calc(100%-4rem)] lg:w-full max-w-[48rem] space-y-6 border-2 border-orange-200 mb-2">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Temperature</label>
            <select value={temperature} onChange={(e) => setTemperature(e.target.value as Temperature)} className="mt-1 block w-full p-1.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm">
              <option>Fridge</option>
              <option>Room</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Egg Size</label>
            <select value={size} onChange={(e) => setSize(e.target.value as Size)} className="mt-1 block w-full p-1.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm">
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Yolk Type</label>
            <select value={hardness} onChange={(e) => setHardness(e.target.value as Hardness)} className="mt-1 block w-full p-1.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm">
              <option>Runny</option>
              <option>Soft</option>
              <option>Hard</option>
            </select>
          </div>
        </div>
<div className="relative w-full h-16 bg-gray-100 rounded-2xl overflow-hidden shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)] border border-gray-300/75">
  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-300 to-orange-400 rounded-2xl transition-all duration-1000" style={{ width: `${(time / ((baseTimes[hardness] * 60) + (size === 'Small' ? -30 : size === 'Large' ? 30 : 0) + (temperature === 'Fridge' ? 45 : 0))) * 100}%` }}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 to-transparent"></div>
          </div>
        </div>
        <div className="text-4xl font-bold text-center">{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</div>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={startTimer} 
            disabled={isCooking}
            className={`${
    isCooking 
      ? 'bg-gray-400 cursor-not-allowed' 
      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            } text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-green-200/50 active:scale-95`}
          >
            {isCooking ? 'Cooking...' : 'Start'}
          </button>
            <button onClick={resetTimer} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-red-200/50 active:scale-95">
            Reset
          </button>
        </div>
      </div>

      {showBoilConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 border-2 border-orange-200">
            <h2 className="text-2xl font-bold text-center text-orange-900 mb-4">
              Is the water boiling?
            </h2>
            <p className="text-center text-orange-700 mb-6">
              Only start the timer when the water is boiling
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmBoil}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-green-200/50 active:scale-95"
              >
                Yes
              </button>
              <button
                onClick={cancelBoil}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-gray-200/50 active:scale-95"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlarmPreference && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 border-2 border-orange-200">
            <h2 className="text-2xl font-bold text-center text-orange-900 mb-4">
              Alarm Sound
            </h2>
            <p className="text-center text-orange-700 mb-6">
              Do you want an alarm to play when the timer ends?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => confirmAlarmPreference(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-green-200/50 active:scale-95"
              >
                Yes
              </button>
              <button
                onClick={() => confirmAlarmPreference(false)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-gray-200/50 active:scale-95"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showBoilWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 border-2 border-orange-200">
            <h2 className="text-2xl font-bold text-center text-orange-900 mb-4">
              Water Not Boiling
            </h2>
            <p className="text-center text-orange-700 mb-6">
              Please wait for water to boil before starting timer
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowBoilWarning(false)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-gray-200/50 active:scale-95"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlarm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 border-2 border-orange-200">
            <h2 className="text-2xl font-bold text-center text-orange-900 mb-4">
              Your eggs are ready!
            </h2>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  if (alarmAudioRef.current) {
                    alarmAudioRef.current.pause();
                    alarmAudioRef.current.currentTime = 0;
                  }
                  setShowAlarm(false);
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-green-200/50 active:scale-95"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 border-2 border-orange-200">
            <h2 className="text-2xl font-bold text-center text-orange-900">
              Reset Timer
            </h2>
            <p className="text-center text-orange-700">
              Are you sure you want to reset the timer?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmReset}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-red-200/50 active:scale-95"
              >
                Yes, reset
              </button>
              <button
                onClick={cancelReset}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-gray-200/50 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
        <div className="mt-auto mt-2 py-4 flex flex-col items-center space-y-1 z-30 w-full">
          <a 
            href="https://ko-fi.com/gogoi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#E84A8F] text-white font-bold py-1.5 px-3 rounded-2xl transition-all duration-300 active:scale-95 flex items-center space-x-2 text-xs hover:bg-[#F05FA4] hover:shadow-[0_4px_12px_rgba(232,74,143,0.2)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
            </svg>
            <span>Buy Me a Coffee</span>
          </a>
          <div className="text-xs text-gray-800">© ajitesh gogoi</div>
        </div>
      </div>
    </>
  );
};

export default App;
