const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  `  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setTimeout(() => window.scrollTo(0, 0), 50);
  }, [currentScreen]);`,
  `  useEffect(() => {
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
  }, [currentScreen]);`
);
fs.writeFileSync('src/App.tsx', appCode);
