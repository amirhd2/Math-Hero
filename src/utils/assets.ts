/**
 * Asset abstraction architecture for Math Hero.
 * Maps logical identifiers to icons, colors, or vector representations.
 */

import { AssetId, CharacterGender, CharacterPose } from '../types';

export function getAssetLabel(assetId: AssetId): string {
  switch (assetId) {
    case 'boy-master': return 'پسر قهرمان';
    case 'girl-master': return 'دختر قهرمان';
    case 'boy-thinking': return 'پسر متفکر';
    case 'girl-thinking': return 'دختر متفکر';
    case 'boy-celebrating': return 'پسر پیروز';
    case 'girl-celebrating': return 'دختر پیروز';
    case 'addition': return 'عمل جمع';
    case 'subtraction': return 'عمل تفریق';
    case 'multiplication': return 'عمل ضرب';
    case 'division': return 'عمل تقسیم';
    case 'badge-level-1': return 'نشان برنزی';
    case 'badge-level-2': return 'نشان نقره‌ای';
    case 'badge-level-3': return 'نشان طلایی';
    case 'trophy': return 'جام قهرمانی';
    case 'star': return 'ستاره امتیاز';
    default: return 'قهرمان ریاضی';
  }
}
