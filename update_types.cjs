const fs = require('fs');
const path = 'src/gamification/gamificationTypes.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/icon:\s*string;/, "icon: string;\n  imageUrl?: string;");

fs.writeFileSync(path, content, 'utf8');
console.log('Updated types.');
