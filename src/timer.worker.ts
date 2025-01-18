declare const self: Worker;

let timer: NodeJS.Timeout | null = null;
let startTime = 0;
let remainingTime = 0;

self.onmessage = (e: MessageEvent<{ type: string; time: number }>) => {
  const { type, time } = e.data;
  
  if (type === 'start') {
    startTime = Date.now();
    remainingTime = time;
    
    timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const newTime = Math.max(0, remainingTime - elapsed);
      
      // Send progress updates more frequently
      self.postMessage({ 
        time: newTime,
        progress: 1 - (newTime / remainingTime)
      });
      
      if (newTime <= 0) {
        clearInterval(timer!);
        self.postMessage({ done: true });
      }
    }, 100); // Update every 100ms instead of 1000ms
  }
  
  if (type === 'stop') {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
};

export {};
