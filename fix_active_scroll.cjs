const fs = require('fs');

let code = fs.readFileSync('src/screens/QuizActiveScreen.tsx', 'utf8');

if (!code.includes('id="active-screen-container"')) {
    code = code.replace(
        'className="relative w-full min-h-[100dvh]',
        'id="active-screen-container"\n      className="relative w-full min-h-[100dvh]'
    );
    
    code = code.replace(
        /const root = document\.getElementById\('root'\);\n\s*if \(root\) root\.scrollTop = 0;/g,
        `const root = document.getElementById('root');
      if (root) root.scrollTop = 0;
      const activeContainer = document.getElementById('active-screen-container');
      if (activeContainer) activeContainer.scrollTop = 0;`
    );
    
    fs.writeFileSync('src/screens/QuizActiveScreen.tsx', code);
}
