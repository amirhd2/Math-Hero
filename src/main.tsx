import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preloadAllAssets } from './utils/assetPreloader';

// Initialize background asset preloader for 100% offline support
preloadAllAssets();

// Register PWA Service Worker for 100% offline support and PWABuilder compliance
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('PWA Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('PWA Service Worker registration info:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
