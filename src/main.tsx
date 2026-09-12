import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preloadAllAssets } from './utils/assetPreloader';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for seamless 100% offline support
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New version ready, updating...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[PWA] Math Hero is fully cached and ready for offline use!');
  },
  onRegistered(r) {
    console.log('[PWA] Service Worker registered:', r);
  },
  onRegisterError(error) {
    console.warn('[PWA] Service Worker registration failed:', error);
  },
});

// Initialize background asset preloader for 100% offline instant image rendering
preloadAllAssets();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
