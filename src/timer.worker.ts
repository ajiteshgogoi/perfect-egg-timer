declare const self: Worker;

let timer: NodeJS.Timeout | null = null;
let startTime = 0;
let remainingTime = 0;

let enableAlarm = true;

self.onmessage = (e: MessageEvent<{ type: string; time: number; enableAlarm?: boolean }>) => {
  const { type, time, enableAlarm: alarmSetting } = e.data;
  
  if (alarmSetting !== undefined) {
    enableAlarm = alarmSetting;
  }
  
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
        if (enableAlarm) {
          self.postMessage({ done: true });
        } else {
          self.postMessage({ done: false });
        }
      }
    }, 100); // Update every 100ms instead of 1000ms
  }
  
  if (type === 'update' && typeof e.data.enableAlarm === 'boolean') {
    enableAlarm = e.data.enableAlarm;
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
};

export {};
