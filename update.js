const fs = require('fs');

// 1. Update QuizCardContent.tsx
let contentCode = fs.readFileSync('src/components/quiz/QuizCardContent.tsx', 'utf8');

// Update props
contentCode = contentCode.replace(
  "  maxAttempts?: number;\n}",
  "  maxAttempts?: number;\n  streak?: number;\n}"
);

contentCode = contentCode.replace(
  "  maxAttempts = 3,\n}) => {",
  "  maxAttempts = 3,\n  streak = 0,\n}) => {"
);

// Remove getOperationIcon and opInfo entirely
contentCode = contentCode.replace(/  const getOperationIcon = \(op: string\) => \{[\s\S]*?  \};\n\n  const opInfo = getOperationIcon\(question\.operation\);\n/m, "");

// Rewrite the return structure
const returnStructure = `  return (
    <>
      {/* Full Width Header (Spans across both halves) */}
      <div className="w-full flex flex-row items-center justify-between px-3 sm:px-5 pt-3 sm:pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/80 shrink-0 bg-transparent">
        {/* Right side (RTL): Attempts */}
        <div className="w-1/3 flex justify-start">
          {isPractice ? (
            <span className="text-[10px] sm:text-xs font-bold px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
              تلاش {toPersianDigits(currentAttempts + 1)} از {toPersianDigits(maxAttempts)}
            </span>
          ) : (
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              آزمون
            </span>
          )}
        </div>

        {/* Center: Mode Badge */}
        <div className="w-1/3 flex justify-center">
          <span
            className={\`text-[10px] sm:text-[11px] px-3 sm:px-4 py-1.5 rounded-full font-black border shadow-2xs whitespace-nowrap \${
              isPractice
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
            }\`}
          >
            {isPractice ? 'تمرین یادگیری 🌱' : 'آزمون استاندارد 🎯'}
          </span>
        </div>

        {/* Left side (RTL): Streak Badge */}
        <div className="w-1/3 flex justify-end">
          {streak >= 2 ? (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black shadow-sm animate-bounce border border-amber-300/50 dark:border-amber-700/50 whitespace-nowrap">
              <span>🔥</span>
              <span>{toPersianDigits(streak)} متوالی!</span>
            </div>
          ) : <div />}
        </div>
      </div>

      {/* Main Content Split: Right 60% Math, Left 40% Image */}
      <div className="flex-1 flex flex-row w-full overflow-hidden">
        {/* Right Half: Math Question Content (60%) */}
        <div className="w-[60%] p-3 sm:p-5 flex flex-col justify-center items-center h-full">
          <div className="my-auto w-full flex items-center justify-center">
            <QuestionRenderer question={question} />
          </div>
        </div>

        {/* Left Half: Random Image (40%) */}
        <div className="w-[40%] relative h-full flex flex-col justify-end items-start p-0 m-0 bg-transparent">
          <img 
            src={\`/assets/characters/\${characterGender}/half-body/\${imageId}.webp\`} 
            alt="Character"
            className="w-full max-h-[90%] object-contain object-left-bottom absolute left-0 bottom-0 pointer-events-none"
            style={{ margin: 0, padding: 0 }}
          />
        </div>
      </div>
    </>
  );`;
  
contentCode = contentCode.replace(/  return \(\n    <>\n[\s\S]*?    <\/>\n  \);/, returnStructure);
fs.writeFileSync('src/components/quiz/QuizCardContent.tsx', contentCode);

// 2. Update QuizCardStack.tsx
let stackCode = fs.readFileSync('src/components/quiz/QuizCardStack.tsx', 'utf8');

// Change `flex-row` to `flex-col` for BackCardLayer
stackCode = stackCode.replace(
  'className="w-full h-full flex flex-row overflow-hidden pointer-events-none opacity-80"',
  'className="w-full h-full flex flex-col overflow-hidden pointer-events-none opacity-80"'
);

// Change `flex flex-row` to `flex flex-col` for Active Card
stackCode = stackCode.replace(
  'transition-all duration-300 cursor-text flex flex-row h-full overflow-hidden',
  'transition-all duration-300 cursor-text flex flex-col h-full overflow-hidden'
);

// Remove the Animated Streak Banner block from active card in stackCode
const streakBannerBlock = `        {/* Animated Streak Banner (Top Left) */}
        {streak >= 2 && (
           <div className="absolute top-3 left-3 z-40">
             <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black shadow-lg animate-bounce border border-amber-300/50 dark:border-amber-700/50">
                <span>🔥</span>
                <span>{toPersianDigits(streak)} متوالی!</span>
             </div>
           </div>
        )}`;
stackCode = stackCode.replace(streakBannerBlock, "");

// Add `streak={streak}` to QuizCardContent inside active card
stackCode = stackCode.replace(
  "          maxAttempts={maxAttempts}\n        />",
  "          maxAttempts={maxAttempts}\n          streak={streak}\n        />"
);

fs.writeFileSync('src/components/quiz/QuizCardStack.tsx', stackCode);
