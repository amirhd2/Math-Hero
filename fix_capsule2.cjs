const fs = require('fs');
let code = fs.readFileSync('src/components/DigitCapsuleControl.tsx', 'utf8');

code = code.replace(
  'max = 4,',
  'max = 100,'
);

fs.writeFileSync('src/components/DigitCapsuleControl.tsx', code);
