const fs = require('fs');

let levelContent = fs.readFileSync('src/gamification/levelCalculator.ts', 'utf8');
const newThresholds = {
  1: 0,
  2: 350,
  3: 850,
  4: 1500,
  5: 2400,
  6: 3600,
  7: 5000,
  8: 6600,
  9: 8400,
  10: 10500,
  11: 13000,
  12: 15800,
  13: 19000,
  14: 22500,
  15: 26500,
  16: 31000,
  17: 36500,
  18: 43000,
  19: 50000,
  20: 60000
};

levelContent = levelContent.replace(/level:\s*(\d+),\s*xpThreshold:\s*(\d+)/g, (match, levelStr, oldXp) => {
  const level = parseInt(levelStr);
  if (newThresholds[level] !== undefined) {
    return `level: ${level}, xpThreshold: ${newThresholds[level]}`;
  }
  return match;
});
fs.writeFileSync('src/gamification/levelCalculator.ts', levelContent);

let badgeContent = fs.readFileSync('src/gamification/badgeRegistry.ts', 'utf8');
// Multiply badge targets
badgeContent = badgeContent.replace(/target:\s*(\d+),/g, (match, p1) => {
  const num = parseInt(p1);
  if (num === 1) return `target: 3,`;
  if (num === 2) return `target: 5,`;
  if (num === 3) return `target: 10,`;
  if (num === 4) return `target: 12,`;
  if (num === 5) return `target: 15,`;
  if (num === 7) return `target: 20,`;
  if (num === 10) return `target: 25,`;
  if (num === 14) return `target: 40,`;
  if (num === 15) return `target: 45,`;
  if (num === 20) return `target: 50,`;
  if (num === 30) return `target: 80,`;
  if (num === 50) return `target: 150,`;
  if (num === 100) return `target: 300,`;
  if (num === 300) return `target: 800,`;
  if (num === 500) return `target: 1500,`;
  return `target: ${num * 3},`;
});
// Update the description text to match the new targets
badgeContent = badgeContent.replace(/([۰-۹]+)\s/g, (match, p1) => {
    // We can't simply regex the Persian text safely. It's better to convert back and forth or just manually do some.
    return match;
});
fs.writeFileSync('src/gamification/badgeRegistry.ts', badgeContent);
