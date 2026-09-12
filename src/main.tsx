import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';
import { preloadAllAssets } from './utils/assetPreloader';

// Initialize background asset preloader for 100% offline support
preloadAllAssets();

// Register PWA Service Worker for 100% offline support and PWABuilder compliance
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    registerSW({
      immediate: true,
      onOfflineReady() {
        console.log('PWA is ready for 100% offline usage!');
      },
    });
  } catch {
    // Fallback standard service worker registration
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration fallback info:', err);
      });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
