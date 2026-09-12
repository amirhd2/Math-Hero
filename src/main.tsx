import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preloadAllAssets } from './utils/assetPreloader';

// Initialize background asset preloader for 100% offline support
preloadAllAssets();

// In development mode only, clean up any old dev service workers so live preview updates immediately.
// In production / PWA standalone mode, preserve the PWA service worker and image cache.
if (import.meta.env.DEV && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
