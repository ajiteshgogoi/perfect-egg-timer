declare const self: Worker;

let timer: NodeJS.Timeout | null = null;
let startTime = 0;
let remainingTime = 0;
let alarmEnabled = false;

self.onmessage = (e: MessageEvent<{ type: string; time?: number; enableAlarm?: boolean }>) => {
  try {
    const { type, time, enableAlarm } = e.data;
    
    if (type === 'ping') {
      self.postMessage({ type: 'pong' });
      return;
    }
    
      if (type === 'start' && typeof time === 'number') {
      startTime = Date.now();
      remainingTime = time;
      alarmEnabled = enableAlarm ?? false;
      
      timer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newTime = Math.max(0, remainingTime - elapsed);
        
        // Send progress updates more frequently
        self.postMessage({ 
          time: newTime,
          progress: 1 - (newTime / remainingTime),
          enableAlarm: alarmEnabled
        });
        
        if (newTime <= 0) {
          clearInterval(timer!);
          self.postMessage({ 
            done: true,
            enableAlarm: alarmEnabled
          });
        }
      }, 100); // Update every 100ms instead of 1000ms
    }
    
    if (type === 'stop') {
      if (timer) {
        clearInterval(timer);
        timer = null;
        remainingTime = 0;
        startTime = 0;
        self.postMessage({ done: true });
      }
    }
  } catch (error) {
    console.error('Worker error:', error);
    self.postMessage({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export {};
