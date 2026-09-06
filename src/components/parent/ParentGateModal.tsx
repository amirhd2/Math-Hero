import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPersianDigits, parseNumericInput } from '../../utils/persian';
import { sound } from '../../utils/sound';

interface ParentGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  soundEnabled?: boolean;
}

export const ParentGateModal: React.FC<ParentGateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  soundEnabled = true,
}) => {
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(8);
  const [answerInput, setAnswerInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Generate a random arithmetic question each time the modal opens
  useEffect(() => {
    if (isOpen) {
      const n1 = Math.floor(Math.random() * 4) + 6; // 6, 7, 8, 9
      const n2 = Math.floor(Math.random() * 4) + 6; // 6, 7, 8, 9
      setNum1(n1);
      setNum2(n2);
      setAnswerInput('');
      setErrorMessage(null);
      setShake(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const expectedAnswer = num1 * num2;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseNumericInput(answerInput);

    if (parsed === expectedAnswer) {
      sound.playSuccess(soundEnabled);
      setErrorMessage(null);
      onSuccess();
    } else {
      sound.playError(soundEnabled);
      setErrorMessage('پاسخ صحیح نیست. لطفاً دوباره تلاش کنید.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setAnswerInput('');
    }
  };

  return (
    <AnimatePresence>
      <div
        id="parent-gate-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${
            shake ? 'animate-shake' : ''
          }`}
        >
          {/* Close button */}
          <button
            id="parent-gate-close-btn"
            onClick={onClose}
            className="absolute top-5 left-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shrink-0">
              👨‍🏫
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                ورود به بخش والدین و مربیان
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                برای تأیید، لطفاً به این سؤال ریاضی پاسخ دهید
              </p>
            </div>
          </div>

          {/* Challenge Card */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 text-center space-y-1.5">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              حاصل‌ضرب زیر چند است؟
            </span>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-wider font-mono">
              {toPersianDigits(num1)} × {toPersianDigits(num2)} = ؟
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                id="parent-gate-answer-input"
                type="text"
                inputMode="numeric"
                autoFocus
                value={toPersianDigits(answerInput)}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9۰-۹]/g, '');
                  setAnswerInput(cleaned);
                  setErrorMessage(null);
                }}
                placeholder="پاسخ را بنویسید..."
                className="w-full text-center py-3.5 px-4 text-xl font-black rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all font-mono"
              />
              {errorMessage && (
                <p className="text-xs text-rose-500 font-bold mt-2 text-center animate-fadeIn">
                  {errorMessage}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                id="parent-gate-confirm-btn"
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all active:scale-98 cursor-pointer"
              >
                تأیید و ورود به حالت والد 👨‍🏫
              </button>
              <button
                type="button"
                id="parent-gate-cancel-btn"
                onClick={onClose}
                className="py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
