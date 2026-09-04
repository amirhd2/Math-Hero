const fs = require('fs');
let code = fs.readFileSync('src/screens/QuizSetupScreen.tsx', 'utf8');

const replacement = `
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            سیستم آموزشی
          </span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setIsAdaptive(true)}
              className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${isAdaptive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}\`}
            >
              مسیر هوشمند 🧠
            </button>
            <button
              onClick={() => setIsAdaptive(false)}
              className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${!isAdaptive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}\`}
            >
              کنترل دستی ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Mode (Practice / Test) */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
          <span>🎯</span>
          <span>حالت فعالیت</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode('practice')}
            className={\`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 \${
              mode === 'practice'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 hover:border-slate-300'
            }\`}
          >
            <span className="text-xl">🧘</span>
            <span className="font-bold text-sm">تمرین آزاد</span>
            <span className="text-[10px] opacity-70">بدون محدودیت زمان</span>
          </button>
          <button
            onClick={() => setMode('test')}
            className={\`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 \${
              mode === 'test'
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-sm'
                : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 hover:border-slate-300'
            }\`}
          >
            <span className="text-xl">⏱️</span>
            <span className="font-bold text-sm">آزمون زمان‌دار</span>
            <span className="text-[10px] opacity-70">با محاسبه امتیاز</span>
          </button>
        </div>
      </div>

      {/* Question Count */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <span>📝</span>
            <span>تعداد سوالات چالش</span>
          </h3>
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 rounded-lg">
            {toPersianDigits(questionCount)} سوال
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {[5, 10, 20, 30].map(num => (
            <button
              key={num}
              onClick={() => setQuestionCount(num)}
              className={\`flex-1 min-w-[50px] py-2 rounded-xl text-sm font-bold transition-all border \${
                questionCount === num
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }\`}
            >
              {toPersianDigits(num)}
            </button>
          ))}
          <div className="flex-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-1">
             <DigitCapsuleControl 
               value={questionCount} 
               onChange={setQuestionCount} 
               min={MIN_QUESTIONS} 
               max={MAX_QUESTIONS}
               label=""
             />
          </div>
        </div>
      </div>
`;

code = code.replace(
  /<div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200\/80 dark:border-slate-800 shadow-sm space-y-3">[\s\S]*?<\/div>\s*<\/div>/,
  replacement
);

fs.writeFileSync('src/screens/QuizSetupScreen.tsx', code);
