import React, { useState } from 'react';

type Temperature = 'Cold' | 'Room' | 'Hot';
type Size = 'Small' | 'Medium' | 'Large';
type Hardness = 'Soft' | 'Medium' | 'Hard';

const App: React.FC = () => {
  const [temperature, setTemperature] = useState<Temperature>('Cold');
  const [size, setSize] = useState<Size>('Medium');
  const [hardness, setHardness] = useState<Hardness>('Medium');
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const timeOptions: Record<Temperature, Record<Size, Record<Hardness, number>>> = {
    Cold: { Small: { Soft: 3, Medium: 4, Hard: 5 }, Medium: { Soft: 4, Medium: 5, Hard: 6 }, Large: { Soft: 5, Medium: 6, Hard: 7 } },
    Room: { Small: { Soft: 2, Medium: 3, Hard: 4 }, Medium: { Soft: 3, Medium: 4, Hard: 5 }, Large: { Soft: 4, Medium: 5, Hard: 6 } },
    Hot: { Small: { Soft: 1, Medium: 2, Hard: 3 }, Medium: { Soft: 2, Medium: 3, Hard: 4 }, Large: { Soft: 3, Medium: 4, Hard: 5 } }
  };

  const startTimer = () => {
    const selectedTime = timeOptions[temperature][size][hardness];
    setTime(selectedTime * 60);
    setIsRunning(true);
    const interval = setInterval(() => {
      setTime(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(interval);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
  };

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 text-orange-900 dark:text-orange-100 transition-colors duration-500`}>
      <button onClick={toggleDarkMode} className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300">
        {darkMode ? '☀️' : '🌙'}
      </button>
      <div className="bg-white/90 dark:bg-orange-950/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 border-2 border-orange-200 dark:border-orange-800">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          🥚 Egg Timer 🍳
        </h1>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Temperature</label>
            <select value={temperature} onChange={(e) => setTemperature(e.target.value as Temperature)} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Cold</option>
              <option>Room</option>
              <option>Hot</option>
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
              <option>Soft</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>
        <div className="relative w-full h-20 bg-orange-100 dark:bg-orange-900 rounded-full overflow-hidden shadow-inner">
          <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000`} style={{ width: `${(time / (timeOptions[temperature][size][hardness] * 60)) * 100}%` }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
          </div>
        </div>
        <div className="text-4xl font-bold text-center">{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</div>
        <div className="flex justify-center space-x-4">
          <button onClick={startTimer} disabled={isRunning} className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-green-200/50 active:scale-95">
            Start
          </button>
          <button onClick={stopTimer} disabled={!isRunning} className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-red-200/50 active:scale-95">
            Stop
          </button>
          <button onClick={resetTimer} className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-orange-200/50 active:scale-95">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
