const fs = require('fs');
let code = fs.readFileSync('src/screens/QuizSetupScreen.tsx', 'utf8');

code = code.replace(
  /      <\/div>\n\n      {isAdaptive && \(/,
  '      {isAdaptive && ('
);

fs.writeFileSync('src/screens/QuizSetupScreen.tsx', code);
