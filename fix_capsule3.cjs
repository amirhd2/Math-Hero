const fs = require('fs');
let code = fs.readFileSync('src/components/DigitCapsuleControl.tsx', 'utf8');

code = code.replace(
  '{toPersianDigits(value)} {label !== "" && <span className="text-[10px] font-normal text-slate-400">رقم</span>}',
  '{toPersianDigits(value)} {label !== undefined && label !== "" && <span className="text-[10px] font-normal text-slate-400">رقم</span>}'
);

fs.writeFileSync('src/components/DigitCapsuleControl.tsx', code);
