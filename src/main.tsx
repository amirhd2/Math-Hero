import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/600.css';
import '@fontsource/vazirmatn/700.css';
import '@fontsource/vazirmatn/800.css';
import '@fontsource/vazirmatn/900.css';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { preloadAllAssets } from './utils/assetPreloader';

// 1. Mount React application inside ErrorBoundary first
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}

// 2. Preload game assets in background after UI is mounted
if (typeof window !== 'undefined') {
  const schedulePreload = () => {
    try {
      preloadAllAssets();
    } catch (preloadErr) {
      console.warn('[Assets] Preload warning:', preloadErr);
    }
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(schedulePreload, { timeout: 3000 });
  } else {
    setTimeout(schedulePreload, 2000);
  }
}

// 3. Register Service Worker for 100% offline support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = import.meta.env.DEV ? '/dev-sw.js?dev-sw' : '/sw.js';
    const swOptions: RegistrationOptions = {
      scope: '/',
      type: import.meta.env.DEV ? 'module' : 'classic',
    };

    navigator.serviceWorker
      .register(swUrl, swOptions)
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully:', registration.scope);

        // Force check for updates
        registration.update().catch(() => {});

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New version available and ready.');
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration info:', err?.message || err);
      });
  });
}

