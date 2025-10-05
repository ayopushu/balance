import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register Service Worker for notifications
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('✅ Service Worker registered successfully');
    })
    .catch(err => {
      console.error('❌ Service Worker registration failed:', err);
    });
}

createRoot(document.getElementById("root")!).render(<App />);
