#!/bin/bash
sed -i.bak '/\/\* 2 Achieved Badges/,/<\/div>\n        <\/div>\n        \/\* Left Side/d' src/components/gamification/TrophyHeroCard.tsx
