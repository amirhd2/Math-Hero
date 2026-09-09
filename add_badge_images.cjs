const fs = require('fs');

const path = 'src/gamification/badgeRegistry.ts';
let content = fs.readFileSync(path, 'utf8');

let badgeIndex = 1;
content = content.replace(/id:\s*['"][^'"]+['"],/g, (match) => {
    const replacement = `${match}\n    imageUrl: getAssetUrl('assets/medals/${badgeIndex}.png'),`;
    badgeIndex++;
    return replacement;
});

// Also need to import getAssetUrl in badgeRegistry.ts
if (!content.includes('getAssetUrl')) {
    content = "import { getAssetUrl } from '../utils/assetPaths';\n" + content;
}

fs.writeFileSync(path, content, 'utf8');
console.log(`Updated ${badgeIndex - 1} badges.`);
