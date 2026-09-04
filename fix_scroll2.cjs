const fs = require('fs');

const aggressiveScroll = `  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      const root = document.getElementById('root');
      if (root) root.scrollTop = 0;
    };
    scrollToTop();
    setTimeout(scrollToTop, 10);
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 150);
  }, []);`;

let code = fs.readFileSync('src/screens/QuizSetupScreen.tsx', 'utf8');
code = code.replace(
  `  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setTimeout(() => window.scrollTo(0, 0), 10);
  }, []);`,
  aggressiveScroll
);
fs.writeFileSync('src/screens/QuizSetupScreen.tsx', code);

let activeCode = fs.readFileSync('src/screens/QuizActiveScreen.tsx', 'utf8');
activeCode = activeCode.replace(
  `  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setTimeout(() => window.scrollTo(0, 0), 10);
  }, []);`,
  aggressiveScroll
);
fs.writeFileSync('src/screens/QuizActiveScreen.tsx', activeCode);

