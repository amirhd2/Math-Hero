const fs = require('fs');
let code = fs.readFileSync('src/components/quiz/QuizCardContent.tsx', 'utf8');

// I notice line 102 to 106 has an issue with closing tags.
// Let's replace the whole bottom part to be sure.
const newBottom = `        {/* Left Half: Random Image (40%) */}
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
  );
};
`;

code = code.replace(/\{\/\* Left Half: Random Image \(40\%\) \*\/\}[\s\S]*?\}\;\n$/m, newBottom);

fs.writeFileSync('src/components/quiz/QuizCardContent.tsx', code);
