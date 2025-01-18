import React, { useState } from 'react';

type Temperature = 'Fridge' | 'Room';
type Size = 'Small' | 'Medium' | 'Large';
type Hardness = 'Runny' | 'Soft' | 'Hard';

const App: React.FC = () => {
  const [temperature, setTemperature] = useState<Temperature>('Fridge');
  const [size, setSize] = useState<Size>('Medium');
  const [hardness, setHardness] = useState<Hardness>('Soft');
  const [time, setTime] = useState(0);
  const baseTimes: Record<Hardness, number> = {
    Runny: 5,
    Soft: 7, 
    Hard: 10
  };

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isCooking, setIsCooking] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const startTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    let adjustedTime = baseTimes[hardness] * 60;
    if (size === 'Small') adjustedTime -= 30;
    if (size === 'Large') adjustedTime += 30;
    if (temperature === 'Fridge') adjustedTime += 45;
    setTime(adjustedTime);
    setIsCooking(true);
    const id = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 0) {
          clearInterval(id);
          setIsCooking(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    setIntervalId(id);
  };

  const resetTimer = () => {
    if (intervalId) {
      setShowResetConfirm(true);
    }
  };

  const confirmReset = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setTime(0);
      setIsCooking(false);
    }
    setShowResetConfirm(false);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-yellow-50 to-orange-50 text-orange-900">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 border-2 border-orange-200">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          🥚 Egg Timer 🍳
        </h1>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Temperature</label>
            <select value={temperature} onChange={(e) => setTemperature(e.target.value as Temperature)} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Fridge</option>
              <option>Room</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Size</label>
            <select value={size} onChange={(e) => setSize(e.target.value as Size)} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Hardness</label>
            <select value={hardness} onChange={(e) => setHardness(e.target.value as Hardness)} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Runny</option>
              <option>Soft</option>
              <option>Hard</option>
            </select>
          </div>
        </div>
        <div className="relative w-full h-20 bg-orange-100 rounded-full overflow-hidden shadow-inner">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000" style={{ width: `${(time / ((baseTimes[hardness] * 60) + (size === 'Small' ? -30 : size === 'Large' ? 30 : 0) + (temperature === 'Fridge' ? 45 : 0))) * 100}%` }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
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
                : 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600'
            } text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-green-200/50 active:scale-95`}
          >
            {isCooking ? 'Cooking...' : 'Start'}
          </button>
          <button onClick={resetTimer} className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-red-200/50 active:scale-95">
            Reset
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 border-2 border-orange-200">
            <h2 className="text-2xl font-bold text-center text-orange-900">
              Reset Timer?
            </h2>
            <p className="text-center text-orange-700">
              Are you sure you want to reset the timer?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmReset}
                className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-red-200/50 active:scale-95"
              >
                Yes, Reset
              </button>
              <button
                onClick={cancelReset}
                className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-gray-200/50 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
