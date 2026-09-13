const fs = require('fs');

let content = fs.readFileSync('src/gamification/trophyManager.ts', 'utf8');

const newReqs = {
  1: { level: 1, badges: 0, tiers: 0, ops: 0 },
  2: { level: 5, badges: 5, tiers: 2, ops: 1 },
  3: { level: 10, badges: 12, tiers: 4, ops: 2 },
  4: { level: 14, badges: 18, tiers: 6, ops: 3 },
  5: { level: 17, badges: 25, tiers: 10, ops: 4 },
  6: { level: 20, badges: 30, tiers: 14, ops: 4 }
};

content = content.replace(/stage:\s*(\d+),[\s\S]*?distinctOpsRequired:\s*\d+,/g, (match, stageStr) => {
  const st = parseInt(stageStr);
  const req = newReqs[st];
  if (req) {
    return match
      .replace(/levelRequired:\s*\d+/, `levelRequired: ${req.level}`)
      .replace(/badgesRequired:\s*\d+/, `badgesRequired: ${req.badges}`)
      .replace(/masteredTiersRequired:\s*\d+/, `masteredTiersRequired: ${req.tiers}`)
      .replace(/distinctOpsRequired:\s*\d+/, `distinctOpsRequired: ${req.ops}`);
  }
  return match;
});

// Fix descriptions to match
// Stage 2: 
content = content.replace(/تسلط بر نخستین مهارت ریاضی/, 'تسلط بر ۲ مهارت ریاضی');
// Stage 3:
content = content.replace(/در ۲ مرحله مهارت/, 'در ۴ مرحله مهارت');
// Stage 4:
content = content.replace(/۴ مرحله مهارت در حداقل ۲ عملیات ریاضی/, '۶ مرحله مهارت در ۳ عملیات ریاضی');
// Stage 5:
content = content.replace(/با ۶ مرحله مسلط‌شده/, 'با ۱۰ مرحله مسلط‌شده در ۴ عملیات');
// Stage 6:
content = content.replace(/بر ۸ مرحله در ۳ عملیات مختلف/, 'بر ۱۴ مرحله در ۴ عملیات مختلف');

fs.writeFileSync('src/gamification/trophyManager.ts', content);
