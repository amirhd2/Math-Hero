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
import { registerSW } from 'virtual:pwa-register';

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

// 2. Preload game assets in background
try {
  preloadAllAssets();
} catch (preloadErr) {
  console.warn('[Assets] Preload warning:', preloadErr);
}

// 3. Register Service Worker safely for 100% offline support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    let updateSWFunc: ((reloadPage?: boolean) => Promise<void>) | undefined;
    updateSWFunc = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[PWA] New version ready');
        if (typeof updateSWFunc === 'function') {
          updateSWFunc(true).catch(() => {});
        }
      },
      onOfflineReady() {
        console.log('[PWA] Math Hero is fully cached and ready for offline use!');
      },
      onRegistered(r) {
        console.log('[PWA] Service Worker registered:', r);
      },
      onRegisterError(error) {
        console.warn('[PWA] Service Worker registration skipped:', error);
      },
    });
  } catch (err) {
    console.warn('[PWA] registerSW skipped:', err);
  }
}

