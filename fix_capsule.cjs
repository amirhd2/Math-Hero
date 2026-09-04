const fs = require('fs');

let code = fs.readFileSync('src/components/DigitCapsuleControl.tsx', 'utf8');

code = code.replace(
    'const clamped = Math.max(min, Math.min(max, parsed));',
    'const clamped = Math.max(min, Math.min(max, parsed));'
);

code = code.replace(
    '{toPersianDigits(value)} <span className="text-[10px] font-normal text-slate-400">رقم</span>',
    '{toPersianDigits(value)} {label !== "" && <span className="text-[10px] font-normal text-slate-400">رقم</span>}'
);

fs.writeFileSync('src/components/DigitCapsuleControl.tsx', code);
