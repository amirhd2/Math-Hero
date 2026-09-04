/**
 * Math Hero Backup, Restore, Migration & Data Management Service.
 * Centralizes all export, import, validation, merging, and reset workflows.
 */

import {
  UserProfile,
  AppSettings,
  QuizResult,
  MistakeRecord,
  Achievement,
  TestPattern,
} from '../types';
import { storage } from './storage';
import {
  loadGamificationState,
  saveGamificationState,
} from '../gamification/gamificationPersistence';
import { GamificationState } from '../gamification/gamificationTypes';
import { invalidateSmartReviewCache } from '../smartReview/smartReviewPersistence';
import { SmartTeacherEngine } from '../adaptive/smartTeacherEngine';
import { AdaptiveLearningPlan, PromotionEvent } from '../adaptive/adaptiveTypes';

export const BACKUP_FORMAT_VERSION = 1;
export const APP_VERSION = '1.0.0';
export const DATA_SCHEMA_VERSION = 1;

export interface MathHeroBackupMetadata {
  backupFormatVersion: number;
  appVersion: string;
  dataSchemaVersion: number;
  createdAt: number;
  language: 'fa' | 'en';
  itemCounts: {
    results: number;
    mistakes: number;
    achievements: number;
    testPatterns: number;
    promotions?: number;
  };
}

export interface MathHeroBackupData {
  metadata: MathHeroBackupMetadata;
  profile: UserProfile;
  settings: AppSettings;
  results: QuizResult[];
  mistakes: MistakeRecord[];
  achievements: Achievement[];
  testPatterns: TestPattern[];
  gamification?: GamificationState;
  learningPlan?: AdaptiveLearningPlan;
  promotions?: PromotionEvent[];
}

export interface BackupValidationResult {
  valid: boolean;
  errorFa?: string;
  errorEn?: string;
  data?: MathHeroBackupData;
  summary?: {
    profileName: string;
    profileLevel: number;
    createdAt: number;
    resultsCount: number;
    mistakesCount: number;
    patternsCount: number;
    achievementsCount: number;
    appVersion: string;
    backupFormatVersion: number;
  };
}

export interface StoredDataCounts {
  results: number;
  mistakes: number;
  patterns: number;
  achievements: number;
  xp: number;
  level: number;
  streakDays: number;
  coins: number;
}

/**
 * Returns a live count of all user data stored in this device.
 */
export async function getStoredDataCounts(): Promise<StoredDataCounts> {
  try {
    const [profile, results, mistakes, patterns, achievements] = await Promise.all([
      storage.getProfile(),
      storage.getResults(),
      storage.getMistakes(),
      storage.getTestPatterns(),
      storage.getAchievements(),
    ]);

    return {
      results: results.length,
      mistakes: mistakes.length,
      patterns: patterns.length,
      achievements: achievements.filter((a) => a.unlocked).length,
      xp: profile.xp || 0,
      level: profile.level || 1,
      streakDays: profile.streakDays || 1,
      coins: profile.coins || 0,
    };
  } catch (err) {
    console.error('Error computing stored data counts:', err);
    return {
      results: 0,
      mistakes: 0,
      patterns: 0,
      achievements: 0,
      xp: 0,
      level: 1,
      streakDays: 1,
      coins: 0,
    };
  }
}

/**
 * Generates a complete Math Hero application backup object.
 */
export async function createFullBackup(): Promise<{ filename: string; json: string; data: MathHeroBackupData }> {
  const [profile, settings, results, mistakes, achievements, testPatterns, gamification, learningPlan, promotions] =
    await Promise.all([
      storage.getProfile(),
      storage.getSettings(),
      storage.getResults(),
      storage.getMistakes(),
      storage.getAchievements(),
      storage.getTestPatterns(),
      loadGamificationState(),
      SmartTeacherEngine.getLearningPlan(),
      SmartTeacherEngine.getPromotions(),
    ]);

  const now = Date.now();
  const d = new Date(now);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const filename = `MathHero-Backup-${year}-${month}-${day}.json`;

  const backupData: MathHeroBackupData = {
    metadata: {
      backupFormatVersion: BACKUP_FORMAT_VERSION,
      appVersion: APP_VERSION,
      dataSchemaVersion: DATA_SCHEMA_VERSION,
      createdAt: now,
      language: settings.language || 'fa',
      itemCounts: {
        results: results.length,
        mistakes: mistakes.length,
        achievements: achievements.length,
        testPatterns: testPatterns.length,
        promotions: promotions.length,
      },
    },
    profile,
    settings,
    results,
    mistakes,
    achievements,
    testPatterns,
    gamification,
    learningPlan,
    promotions,
  };

  const json = JSON.stringify(backupData, null, 2);
  return { filename, json, data: backupData };
}

/**
 * Triggers a browser download of the backup file.
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Migration pipeline: adapts older or partial backup structures to current schema.
 */
export function migrateBackup(raw: any): MathHeroBackupData {
  const now = Date.now();

  // If already matches modern schema
  if (raw.metadata && typeof raw.metadata.backupFormatVersion === 'number') {
    return {
      metadata: {
        backupFormatVersion: raw.metadata.backupFormatVersion,
        appVersion: raw.metadata.appVersion || APP_VERSION,
        dataSchemaVersion: raw.metadata.dataSchemaVersion || DATA_SCHEMA_VERSION,
        createdAt: raw.metadata.createdAt || now,
        language: raw.metadata.language || 'fa',
        itemCounts: raw.metadata.itemCounts || {
          results: Array.isArray(raw.results) ? raw.results.length : 0,
          mistakes: Array.isArray(raw.mistakes) ? raw.mistakes.length : 0,
          achievements: Array.isArray(raw.achievements) ? raw.achievements.length : 0,
          testPatterns: Array.isArray(raw.testPatterns) ? raw.testPatterns.length : 0,
        },
      },
      profile: raw.profile || {},
      settings: raw.settings || {},
      results: Array.isArray(raw.results) ? raw.results : [],
      mistakes: Array.isArray(raw.mistakes) ? raw.mistakes : [],
      achievements: Array.isArray(raw.achievements) ? raw.achievements : [],
      testPatterns: Array.isArray(raw.testPatterns) ? raw.testPatterns : [],
      gamification: raw.gamification,
    };
  }

  // Legacy or unversioned backup structure adaptation
  return {
    metadata: {
      backupFormatVersion: 1,
      appVersion: APP_VERSION,
      dataSchemaVersion: 1,
      createdAt: now,
      language: raw.settings?.language || 'fa',
      itemCounts: {
        results: Array.isArray(raw.results) ? raw.results.length : 0,
        mistakes: Array.isArray(raw.mistakes) ? raw.mistakes.length : 0,
        achievements: Array.isArray(raw.achievements) ? raw.achievements.length : 0,
        testPatterns: Array.isArray(raw.testPatterns) ? raw.testPatterns.length : 0,
      },
    },
    profile: raw.profile || {},
    settings: raw.settings || {},
    results: Array.isArray(raw.results) ? raw.results : [],
    mistakes: Array.isArray(raw.mistakes) ? raw.mistakes : [],
    achievements: Array.isArray(raw.achievements) ? raw.achievements : [],
    testPatterns: Array.isArray(raw.testPatterns) ? raw.testPatterns : [],
    gamification: raw.gamification,
  };
}

/**
 * Validates raw backup file content.
 * Guarantees that current data remains untouched if validation fails.
 */
export function validateBackupContent(fileText: string): BackupValidationResult {
  if (!fileText || typeof fileText !== 'string') {
    return {
      valid: false,
      errorFa: 'فایل انتخابی خالی یا نامعتبر است.',
      errorEn: 'The selected backup file is empty or invalid.',
    };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(fileText);
  } catch {
    return {
      valid: false,
      errorFa: 'فرمت فایل معتبر نیست (خطای ساختار JSON). داده‌های فعلی شما تغییر نکرده‌اند.',
      errorEn: 'Invalid file format (JSON syntax error). Your current data has not been modified.',
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      valid: false,
      errorFa: 'این فایل پشتیبان معتبر نیست.',
      errorEn: 'This backup file is invalid.',
    };
  }

  // Check version incompatibility (e.g. from future version with incompatible format)
  if (parsed.metadata?.backupFormatVersion && parsed.metadata.backupFormatVersion > BACKUP_FORMAT_VERSION + 1) {
    return {
      valid: false,
      errorFa: 'نسخه این فایل با نسخه فعلی برنامه سازگار نیست. لطفا برنامه را به‌روزرسانی کنید.',
      errorEn: 'This backup version is incompatible with the current app version. Please update the app.',
    };
  }

  // Check for presence of at least profile or results
  const hasProfile = parsed.profile && (typeof parsed.profile === 'object');
  const hasResults = Array.isArray(parsed.results);
  const hasSettings = parsed.settings && (typeof parsed.settings === 'object');

  if (!hasProfile && !hasResults && !hasSettings) {
    return {
      valid: false,
      errorFa: 'اطلاعات برنامه قابل بازیابی نیست. داده‌های فعلی شما تغییر نکرده‌اند.',
      errorEn: 'Application data cannot be restored. Your current data has not been modified.',
    };
  }

  const migrated = migrateBackup(parsed);

  return {
    valid: true,
    data: migrated,
    summary: {
      profileName: migrated.profile.name || 'قهرمان ناشناس',
      profileLevel: migrated.profile.level || 1,
      createdAt: migrated.metadata.createdAt,
      resultsCount: migrated.results.length,
      mistakesCount: migrated.mistakes.length,
      patternsCount: migrated.testPatterns.length,
      achievementsCount: migrated.achievements.filter((a) => a.unlocked).length,
      appVersion: migrated.metadata.appVersion || '1.0.0',
      backupFormatVersion: migrated.metadata.backupFormatVersion || 1,
    },
  };
}

/**
 * Executes a deterministic restore operation.
 * Supports 'replace' and 'merge' modes.
 */
export async function restoreBackup(
  backup: MathHeroBackupData,
  mode: 'replace' | 'merge'
): Promise<{ success: boolean; messageFa: string; messageEn: string }> {
  try {
    if (mode === 'replace') {
      // 1. Replace Profile
      if (backup.profile) {
        await storage.saveProfile(backup.profile);
      }

      // 2. Replace Settings
      if (backup.settings) {
        await storage.saveSettings(backup.settings);
      }

      // 3. Replace Results
      if (Array.isArray(backup.results)) {
        await storage.saveResultsBulk(backup.results);
      }

      // 4. Replace Mistakes
      if (Array.isArray(backup.mistakes)) {
        await storage.saveMistakesBulk(backup.mistakes);
      }

      // 5. Replace Achievements
      if (Array.isArray(backup.achievements)) {
        await storage.saveAchievements(backup.achievements);
      }

      // 6. Replace Test Patterns
      if (Array.isArray(backup.testPatterns)) {
        await storage.saveTestPatternsBulk(backup.testPatterns);
      }

      // 7. Replace Gamification
      if (backup.gamification) {
        await saveGamificationState(backup.gamification);
      }

      // 8. Replace Adaptive Learning Plan & Promotions
      if (backup.learningPlan) {
        await SmartTeacherEngine.saveLearningPlan(backup.learningPlan);
      }
      if (Array.isArray(backup.promotions)) {
        try {
          localStorage.setItem('math_hero_promotions_v1', JSON.stringify(backup.promotions));
        } catch (e) {
          console.warn('Failed to restore promotions', e);
        }
      }

      invalidateSmartReviewCache();

      return {
        success: true,
        messageFa: 'تمامی اطلاعات پشتیبان با موفقیت جایگزین شد.',
        messageEn: 'All backup data was successfully replaced.',
      };
    }

    // MERGE MODE (Deterministic merge using stable IDs)
    const [currentProfile, currentSettings, currentResults, currentMistakes, currentAchievements, currentPatterns, currentGamification] =
      await Promise.all([
        storage.getProfile(),
        storage.getSettings(),
        storage.getResults(),
        storage.getMistakes(),
        storage.getAchievements(),
        storage.getTestPatterns(),
        loadGamificationState(),
      ]);

    // 1. Merge Profile (keep higher XP and level, max streak, combine coins)
    const mergedProfile: UserProfile = {
      ...currentProfile,
      name: backup.profile?.name?.trim() || currentProfile.name,
      gender: backup.profile?.gender || currentProfile.gender,
      age: backup.profile?.age || currentProfile.age,
      avatarId: backup.profile?.avatarId || currentProfile.avatarId,
      xp: Math.max(currentProfile.xp || 0, backup.profile?.xp || 0),
      level: Math.max(currentProfile.level || 1, backup.profile?.level || 1),
      streakDays: Math.max(currentProfile.streakDays || 1, backup.profile?.streakDays || 1),
      coins: Math.max(currentProfile.coins || 0, backup.profile?.coins || 0),
      onboardingCompleted: currentProfile.onboardingCompleted || backup.profile?.onboardingCompleted || true,
    };
    await storage.saveProfile(mergedProfile);

    // 2. Merge Settings (keep current theme/language preferences if already set, but fill missing)
    const mergedSettings: AppSettings = {
      ...backup.settings,
      ...currentSettings,
    };
    await storage.saveSettings(mergedSettings);

    // 3. Merge Results (deduplicate by stable id)
    const resultsMap = new Map<string, QuizResult>();
    currentResults.forEach((r) => resultsMap.set(r.id, r));
    if (Array.isArray(backup.results)) {
      backup.results.forEach((r) => {
        if (!resultsMap.has(r.id)) {
          resultsMap.set(r.id, r);
        }
      });
    }
    const mergedResults = Array.from(resultsMap.values()).sort((a, b) => b.timestamp - a.timestamp);
    await storage.saveResultsBulk(mergedResults);

    // 4. Merge Mistakes (deduplicate by id, keep resolved if true in either)
    const mistakesMap = new Map<string, MistakeRecord>();
    currentMistakes.forEach((m) => mistakesMap.set(m.id, m));
    if (Array.isArray(backup.mistakes)) {
      backup.mistakes.forEach((m) => {
        const existing = mistakesMap.get(m.id);
        if (existing) {
          if (m.resolved && !existing.resolved) {
            existing.resolved = true;
          }
        } else {
          mistakesMap.set(m.id, m);
        }
      });
    }
    const mergedMistakes = Array.from(mistakesMap.values());
    await storage.saveMistakesBulk(mergedMistakes);

    // 5. Merge Achievements (match by id, preserve unlocked and take max progress)
    const achievementsMap = new Map<string, Achievement>();
    currentAchievements.forEach((a) => achievementsMap.set(a.id, a));
    if (Array.isArray(backup.achievements)) {
      backup.achievements.forEach((a) => {
        const existing = achievementsMap.get(a.id);
        if (existing) {
          existing.unlocked = existing.unlocked || a.unlocked;
          existing.progress = Math.max(existing.progress, a.progress);
          if (a.unlockedAt && (!existing.unlockedAt || a.unlockedAt < existing.unlockedAt)) {
            existing.unlockedAt = a.unlockedAt;
          }
        } else {
          achievementsMap.set(a.id, a);
        }
      });
    }
    await storage.saveAchievements(Array.from(achievementsMap.values()));

    // 6. Merge Test Patterns (deduplicate by id)
    const patternsMap = new Map<string, TestPattern>();
    currentPatterns.forEach((p) => patternsMap.set(p.id, p));
    if (Array.isArray(backup.testPatterns)) {
      backup.testPatterns.forEach((p) => {
        if (!patternsMap.has(p.id)) {
          patternsMap.set(p.id, p);
        }
      });
    }
    await storage.saveTestPatternsBulk(Array.from(patternsMap.values()));

    // 7. Merge Gamification State
    if (backup.gamification) {
      const mergedBadges = Array.from(
        new Set([...currentGamification.unlockedBadges, ...(backup.gamification.unlockedBadges || [])])
      );
      const mergedTimestamps = {
        ...backup.gamification.badgeUnlockTimestamps,
        ...currentGamification.badgeUnlockTimestamps,
      };

      const mergedGamification: GamificationState = {
        ...currentGamification,
        totalXp: Math.max(currentGamification.totalXp, backup.gamification.totalXp || 0),
        currentLevel: Math.max(currentGamification.currentLevel, backup.gamification.currentLevel || 1),
        currentStreak: Math.max(currentGamification.currentStreak, backup.gamification.currentStreak || 1),
        bestStreak: Math.max(currentGamification.bestStreak, backup.gamification.bestStreak || 1),
        unlockedBadges: mergedBadges,
        badgeUnlockTimestamps: mergedTimestamps,
        trophyStage: Math.max(currentGamification.trophyStage, backup.gamification.trophyStage || 1),
        stats: {
          ...currentGamification.stats,
          totalQuizzesCompleted: Math.max(
            currentGamification.stats.totalQuizzesCompleted,
            backup.gamification.stats?.totalQuizzesCompleted || 0
          ),
          totalQuestionsAnswered: Math.max(
            currentGamification.stats.totalQuestionsAnswered,
            backup.gamification.stats?.totalQuestionsAnswered || 0
          ),
          totalCorrectAnswers: Math.max(
            currentGamification.stats.totalCorrectAnswers,
            backup.gamification.stats?.totalCorrectAnswers || 0
          ),
        },
      };
      await saveGamificationState(mergedGamification);
    }

    // 8. Merge Adaptive Learning Plan & Promotions
    if (backup.learningPlan) {
      await SmartTeacherEngine.saveLearningPlan(backup.learningPlan);
    }
    if (Array.isArray(backup.promotions)) {
      try {
        const currentPromotions = await SmartTeacherEngine.getPromotions();
        const promoIds = new Set(currentPromotions.map((p) => p.id));
        const mergedPromotions = [...currentPromotions];
        backup.promotions.forEach((p) => {
          if (!promoIds.has(p.id)) mergedPromotions.push(p);
        });
        localStorage.setItem('math_hero_promotions_v1', JSON.stringify(mergedPromotions));
      } catch (e) {
        console.warn('Failed to merge promotions', e);
      }
    }

    invalidateSmartReviewCache();

    return {
      success: true,
      messageFa: 'اطلاعات با موفقیت و بدون حذف رکوردهای قبلی ترکیب شدند.',
      messageEn: 'Data merged successfully without duplicating or losing previous records.',
    };
  } catch (err: any) {
    console.error('Failed to restore backup:', err);
    return {
      success: false,
      messageFa: `خطا در بازیابی: ${err.message || 'داده‌های شما تغییر نکرده‌اند.'}`,
      messageEn: `Restore error: ${err.message || 'Your existing data has not been modified.'}`,
    };
  }
}

/**
 * Resets all user data to fresh defaults.
 */
export async function resetApplicationData(): Promise<void> {
  await storage.resetAllData();
  try {
    localStorage.removeItem('math_hero_learning_plan_v1');
    localStorage.removeItem('math_hero_promotions_v1');
  } catch {
    // ignore
  }
  invalidateSmartReviewCache();
}

/**
 * Exports Quiz History as CSV.
 */
export async function exportQuizHistoryCSV(): Promise<{ filename: string; csv: string }> {
  const results = await storage.getResults();
  const headers = ['ID', 'Date', 'Operation', 'Mode', 'Questions', 'Correct', 'Incorrect', 'ScorePercent', 'XPEarned', 'TimeSeconds'];
  
  const rows = results.map((r) => [
    r.id,
    new Date(r.timestamp).toISOString(),
    r.operation,
    r.mode || 'test',
    r.totalQuestions,
    r.correctCount,
    r.incorrectCount,
    r.score,
    r.xpEarned,
    r.timeElapsed || 0,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const d = new Date();
  const filename = `MathHero-QuizHistory-${d.toISOString().slice(0, 10)}.csv`;

  return { filename, csv };
}

/**
 * Exports Learning & Statistics data as JSON.
 */
export async function exportLearningStatsJSON(): Promise<{ filename: string; json: string }> {
  const [profile, results, mistakes, gamification] = await Promise.all([
    storage.getProfile(),
    storage.getResults(),
    storage.getMistakes(),
    loadGamificationState(),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: {
      name: profile.name,
      level: profile.level,
      xp: profile.xp,
      streakDays: profile.streakDays,
    },
    totalQuizzes: results.length,
    unresolvedMistakesCount: mistakes.filter((m) => !m.resolved).length,
    gamificationStats: gamification.stats,
    achievementsUnlocked: gamification.unlockedBadges.length,
  };

  const json = JSON.stringify(exportData, null, 2);
  const filename = `MathHero-StatsExport-${new Date().toISOString().slice(0, 10)}.json`;

  return { filename, json };
}

/**
 * Safely clears temporary cache assets via Service Worker / CacheStorage API.
 * Explicitly DOES NOT touch IndexedDB or localStorage.
 */
export async function clearTemporaryCache(): Promise<{ count: number; success: boolean }> {
  let clearedCount = 0;
  try {
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cacheKeys = await window.caches.keys();
      for (const key of cacheKeys) {
        await window.caches.delete(key);
        clearedCount++;
      }
    }
    return { count: clearedCount, success: true };
  } catch (err) {
    console.warn('Could not clear browser caches:', err);
    return { count: 0, success: false };
  }
}
