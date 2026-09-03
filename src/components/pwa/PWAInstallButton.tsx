import React from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // If already running as an installed PWA standalone app or not installable, hide the button
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={install}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
    >
      <span>📲</span>
      <span>نصب اپلیکیشن</span>
    </button>
  );
};
