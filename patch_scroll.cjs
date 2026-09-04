const fs = require('fs');

let code = fs.readFileSync('src/screens/QuizSetupScreen.tsx', 'utf8');
code = code.replace(
  'const [mode, setMode] = useState<QuizMode>(initialConfig?.mode || \'practice\');',
  `useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setTimeout(() => window.scrollTo(0, 0), 10);
  }, []);
  const [mode, setMode] = useState<QuizMode>(initialConfig?.mode || 'practice');`
);
fs.writeFileSync('src/screens/QuizSetupScreen.tsx', code);

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  `  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentScreen]);`,
  `  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setTimeout(() => window.scrollTo(0, 0), 50);
  }, [currentScreen]);`
);
fs.writeFileSync('src/App.tsx', appCode);

let quizActiveCode = fs.readFileSync('src/screens/QuizActiveScreen.tsx', 'utf8');
quizActiveCode = quizActiveCode.replace(
  'const [showExitModal, setShowExitModal] = useState(false);',
  `const [showExitModal, setShowExitModal] = useState(false);
  
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setTimeout(() => window.scrollTo(0, 0), 10);
  }, []);`
);
fs.writeFileSync('src/screens/QuizActiveScreen.tsx', quizActiveCode);
