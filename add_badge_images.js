const fs = require('fs');

const path = 'src/gamification/badgeRegistry.ts';
let content = fs.readFileSync(path, 'utf8');

// The file contains an array BADGE_REGISTRY = [ { id: '...', ... }, ... ];
// We need to inject `imageUrl: '/assets/medals/X.png',` inside each object.
// We can use a regex to match the start of each object `{ id:` or `id: ` inside the array.

let badgeIndex = 1;

content = content.replace(/id:\s*['"][^'"]+['"],/g, (match) => {
    const replacement = `${match}\n    imageUrl: '/assets/medals/${badgeIndex}.png',`;
    badgeIndex++;
    return replacement;
});

fs.writeFileSync(path, content, 'utf8');
console.log(`Updated ${badgeIndex - 1} badges.`);
