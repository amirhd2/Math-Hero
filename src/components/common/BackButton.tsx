import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  title?: string;
  variant?: 'glass' | 'whiteGlass';
  className?: string;
  id?: string;
}

/**
 * Unified iOS-style circular glass back button with '<' (less-than chevron)
 */
export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  title = 'بازگشت',
  variant = 'glass',
  className = '',
  id,
}) => {
  const baseClasses =
    'w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-all duration-200 active:scale-95 select-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50';

  const variantClasses =
    variant === 'whiteGlass'
      ? 'bg-white/20 hover:bg-white/30 text-white border border-white/25 backdrop-blur-md shadow-xs'
      : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-md';

  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
      title={title}
      aria-label={title}
    >
      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
    </button>
  );
};
