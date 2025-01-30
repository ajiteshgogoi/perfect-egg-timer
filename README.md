# Perfect Egg Timer

A modern Progressive Web App designed to help you cook eggs exactly to your preference. Features an elegant interface with smart timing adjustments and reliable background processing.

🍳 **[Try Perfect Egg Timer](https://perfect-egg-timer.vercel.app)**

## Key Features

- **Smart Timing**: Automatically adjusts cooking time based on egg size, temperature, and desired yolk consistency
- **Background Processing**: Reliable timer functionality using Web Workers
- **Audio Alerts**: Configurable sound notifications when eggs are ready
- **Offline Support**: Works without internet as a Progressive Web App
- **Mobile Optimized**: Responsive design that works beautifully on all devices
- **Boiling Guide**: Clear instructions for perfect results every time

## How It Works

1. **Setup**: 
   - Select egg temperature (room/fridge)
   - Choose egg size (small/medium/large)
   - Pick yolk type (runny/soft/hard)

2. **Processing**:
   - Smart timer adjusts duration based on your selections
   - Background processing ensures reliable timing
   - Visual progress bar shows remaining time

3. **Completion**:
   - Audio alert when eggs are ready (optional)
   - Clear instructions for ice bath to stop cooking
   - Perfect eggs every time!

## Technical Stack

- Frontend: React, TypeScript, Tailwind CSS
- Processing: Web Workers for background timing
- PWA: Service Workers for offline support
- Audio: Web Audio API for alerts
- State Management: React Hooks
- Build System: Create React App

## Developer Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Support

For bugs or feedback, please contact ajitesh gogoi.

<p align="left">
  <a href="https://ko-fi.com/gogoi">
    <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-Support_Development-FFDD00?style=for-the-badge&logo=ko-fi&logoColor=black" alt="Buy Me A Coffee" />
  </a>
</p>
