const fs = require('fs');

let code = fs.readFileSync('src/screens/QuizSetupScreen.tsx', 'utf8');

const newModeUI = `      {/* Quiz Mode (Practice / Test) */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="space-y-0.5">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <span>🎯</span>
            <span>حالت فعالیت</span>
          </h3>
          <p className="text-xs text-slate-500">نوع چالش ریاضی خود را انتخاب کنید</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Practice Mode */}
          <button
            type="button"
            onClick={() => setMode('practice')}
            className={\`p-4 rounded-2xl border-2 transition-all flex flex-col text-right gap-2 cursor-pointer \${
              mode === 'practice'
                ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }\`}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-sm flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <span>🌱</span>
                <span>حالت تمرین</span>
              </span>
              {mode === 'practice' && <span className="text-emerald-600 font-bold text-xs">✓ فعال</span>}
            </div>
            <ul className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-1.5">
                <span>✅</span>
                <span>اشتباهات بدون نمره منفی</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>💡</span>
                <span>۳ شانس پاسخ و راهنمای هوشمند</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>🔍</span>
                <span>نمایش پاسخ صحیح و بازخورد آموزنده</span>
              </li>
            </ul>
          </button>

          {/* Test Mode */}
          <button
            type="button"
            onClick={() => setMode('test')}
            className={\`p-4 rounded-2xl border-2 transition-all flex flex-col text-right gap-2 cursor-pointer \${
              mode === 'test'
                ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }\`}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-sm flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <span>⏱️</span>
                <span>حالت آزمون</span>
              </span>
              {mode === 'test' && <span className="text-rose-600 font-bold text-xs">✓ فعال</span>}
            </div>
            <ul className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-1.5">
                <span>⚠️</span>
                <span>هر خطا محاسبه می‌شود</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>🔒</span>
                <span>عدم نمایش پاسخ صحیح در حین آزمون</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>📊</span>
                <span>ارزیابی دقیق سرعت و زمان</span>
              </li>
            </ul>
          </button>
        </div>
      </div>`;

// Replace existing Mode UI block
code = code.replace(
  /{\/\* Quiz Mode \(Practice \/ Test\) \*\/}[\s\S]*?<\/div>\s*<\/div>/,
  newModeUI
);

fs.writeFileSync('src/screens/QuizSetupScreen.tsx', code);
