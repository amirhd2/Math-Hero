import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AccordionSectionProps {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  id,
  icon,
  title,
  subtitle,
  badge,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <div
      id={id}
      className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
        isOpen
          ? 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-800/80 shadow-xl shadow-indigo-500/5'
          : 'bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
        className="w-full text-right flex items-center justify-between p-4 sm:p-5 gap-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-transform ${
              isOpen
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                : 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            {icon}
          </div>

          <div className="min-w-0 flex-1 text-right">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-base sm:text-lg text-slate-800 dark:text-slate-100 truncate">
                {title}
              </h3>
              {badge && (
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 transition-transform duration-200 ${
            isOpen ? 'rotate-180 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' : ''
          }`}
        >
          <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`${id}-content`}
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-4 sm:px-6 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
