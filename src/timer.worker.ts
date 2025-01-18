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
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newTime = Math.max(0, remainingTime - elapsed);
      
      self.postMessage({ time: newTime });
      
      if (newTime <= 0) {
        clearInterval(timer!);
        self.postMessage({ done: true });
      }
    }, 1000);
  }
  
  if (type === 'stop') {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
};

export {};
