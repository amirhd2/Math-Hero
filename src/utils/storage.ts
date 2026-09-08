/**
 * IndexedDB storage abstraction for Math Hero persistent application data.
 * Supports profiles, settings, quiz results, mistakes, achievements, and presets.
 */

import { UserProfile, AppSettings, QuizResult, MistakeRecord, Achievement, QuizPreset, TestPattern } from '../types';

const DB_NAME = 'MathHeroDB';
const DB_VERSION = 1;

export const DEFAULT_PROFILE: UserProfile = {
  id: 'default_user',
  name: '',
  gender: 'boy',
  age: 8,
  avatarId: 'boy-master',
  xp: 0,
  level: 1,
  coins: 10,
  streakDays: 1,
  createdAt: Date.now(),
  onboardingCompleted: false,
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  language: 'fa',
  numberFormat: 'persian',

  soundEnabled: true,
  hapticsEnabled: true,
  celebrationSoundEnabled: true,
  quizFeedbackEnabled: true,

  autoOpenKeyboard: true,
  autoFocusAnswer: true,
  showQuizCharacter: true,
  confirmExitQuiz: true,

  musicEnabled: false,
  highContrast: false,
  reducedMotion: false,
};

export const DEFAULT_PRESETS: QuizPreset[] = [
  { id: 'add_easy', title: 'جمع آسان', operation: 'addition', questionCount: 10, minNumber: 1, maxNumber: 10, icon: 'addition' },
  { id: 'sub_easy', title: 'تفریق آسان', operation: 'subtraction', questionCount: 10, minNumber: 1, maxNumber: 10, icon: 'subtraction' },
  { id: 'mul_table', title: 'جدول ضرب', operation: 'multiplication', questionCount: 12, minNumber: 1, maxNumber: 10, icon: 'multiplication' },
  { id: 'div_basic', title: 'تقسیم مقدماتی', operation: 'division', questionCount: 10, minNumber: 1, maxNumber: 10, icon: 'division' },
  { id: 'mixed_pro', title: 'چالش مخلوط قهرمان', operation: 'mixed', questionCount: 15, minNumber: 1, maxNumber: 20, icon: 'trophy' },
];

export const DEFAULT_TEST_PATTERNS: TestPattern[] = [
  {
    id: 'pattern_addition_easy',
    title: 'جمع ۲ رقمی شاداب',
    description: 'جمع اعداد ۲ رقمی با تمرین و یادگیری آرام',
    icon: '➕',
    isCustom: false,
    createdAt: 1700000000000,
    config: {
      mode: 'practice',
      questionCount: 10,
      selectedOperations: ['addition'],
      operationSettings: {
        addition: { operand1Digits: 2, operand2Digits: 2 },
        subtraction: { operand1Digits: 2, operand2Digits: 1, allowNegative: false },
        multiplication: { mode: 'table', operand1Digits: 1, operand2Digits: 1, tableNumber: 9 },
        division: { mode: 'table', dividendDigits: 2, divisorDigits: 1, tableNumber: 9, allowRemainder: false },
      },
      distribution: { addition: 100, subtraction: 0, multiplication: 0, division: 0, mixed: 0 },
      smartReviewEnabled: true,
    },
  },
  {
    id: 'pattern_subtraction_fun',
    title: 'تفریق ۲ رقمی از ۱ رقمی',
    description: 'تفریق اعداد مثبت مناسب پایه‌های دبستان',
    icon: '➖',
    isCustom: false,
    createdAt: 1700000001000,
    config: {
      mode: 'practice',
      questionCount: 10,
      selectedOperations: ['subtraction'],
      operationSettings: {
        addition: { operand1Digits: 2, operand2Digits: 2 },
        subtraction: { operand1Digits: 2, operand2Digits: 1, allowNegative: false },
        multiplication: { mode: 'table', operand1Digits: 1, operand2Digits: 1, tableNumber: 9 },
        division: { mode: 'table', dividendDigits: 2, divisorDigits: 1, tableNumber: 9, allowRemainder: false },
      },
      distribution: { addition: 0, subtraction: 100, multiplication: 0, division: 0, mixed: 0 },
      smartReviewEnabled: true,
    },
  },
  {
    id: 'pattern_multiplication_table_9',
    title: 'آزمون طلایی جدول ضرب ۹',
    description: 'سنجش دقیق و حرفه‌ای تسلط بر جدول ۹',
    icon: '✖️',
    isCustom: false,
    createdAt: 1700000002000,
    config: {
      mode: 'test',
      questionCount: 10,
      selectedOperations: ['multiplication'],
      operationSettings: {
        addition: { operand1Digits: 2, operand2Digits: 2 },
        subtraction: { operand1Digits: 2, operand2Digits: 1, allowNegative: false },
        multiplication: { mode: 'table', operand1Digits: 1, operand2Digits: 1, tableNumber: 9 },
        division: { mode: 'table', dividendDigits: 2, divisorDigits: 1, tableNumber: 9, allowRemainder: false },
      },
      distribution: { addition: 0, subtraction: 0, multiplication: 100, division: 0, mixed: 0 },
      smartReviewEnabled: true,
    },
  },
  {
    id: 'pattern_division_table_6',
    title: 'تقسیم معکوس جدول ۶',
    description: 'تقسیم‌های دقیق و مهندسی شده بر مبنای ضرب ۶',
    icon: '➗',
    isCustom: false,
    createdAt: 1700000003000,
    config: {
      mode: 'practice',
      questionCount: 10,
      selectedOperations: ['division'],
      operationSettings: {
        addition: { operand1Digits: 2, operand2Digits: 2 },
        subtraction: { operand1Digits: 2, operand2Digits: 1, allowNegative: false },
        multiplication: { mode: 'table', operand1Digits: 1, operand2Digits: 1, tableNumber: 6 },
        division: { mode: 'table', dividendDigits: 2, divisorDigits: 1, tableNumber: 6, allowRemainder: false },
      },
      distribution: { addition: 0, subtraction: 0, multiplication: 0, division: 100, mixed: 0 },
      smartReviewEnabled: true,
    },
  },
  {
    id: 'pattern_grand_mixed',
    title: 'آزمون قهرمانی ۴ عمل اصلی',
    description: 'چالش هیجان‌انگیز ترکیبی شامل جمع، تفریق، ضرب و تقسیم',
    icon: '🏆',
    isCustom: false,
    createdAt: 1700000004000,
    config: {
      mode: 'test',
      questionCount: 20,
      selectedOperations: ['addition', 'subtraction', 'multiplication', 'division'],
      operationSettings: {
        addition: { operand1Digits: 2, operand2Digits: 2 },
        subtraction: { operand1Digits: 2, operand2Digits: 1, allowNegative: false },
        multiplication: { mode: 'table', operand1Digits: 1, operand2Digits: 1, tableNumber: 8 },
        division: { mode: 'table', dividendDigits: 2, divisorDigits: 1, tableNumber: 6, allowRemainder: false },
      },
      distribution: { addition: 25, subtraction: 25, multiplication: 25, division: 25, mixed: 0 },
      smartReviewEnabled: true,
    },
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_quiz', title: 'اولین قدم', description: 'اولین تمرین ریاضی خود را تمام کنید', icon: 'star', unlocked: true, progress: 1, maxProgress: 1 },
  { id: 'streak_3', title: 'قهرمان پیوسته', description: '۳ روز متوالی تمرین کنید', icon: 'trophy', unlocked: true, progress: 3, maxProgress: 3 },
  { id: 'correct_20', title: 'ذهن خلاق', description: '۲۰ پاسخ درست ثبت کنید', icon: 'badge-level-1', unlocked: false, progress: 12, maxProgress: 20 },
  { id: 'multiplication_master', title: 'استاد ضرب', description: 'یک آزمون ضرب را بدون غلط کامل کنید', icon: 'badge-level-2', unlocked: false, progress: 0, maxProgress: 1 },
];

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private currentDb: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.currentDb) {
      return this.currentDb;
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        return reject(new Error('IndexedDB is not supported in this environment.'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        this.dbPromise = null;
        this.currentDb = null;
        reject(request.error || new Error('Failed to open IndexedDB'));
      };

      request.onblocked = () => {
        console.warn('IndexedDB open request was blocked');
      };

      request.onsuccess = () => {
        const db = request.result;
        this.currentDb = db;

        db.onversionchange = () => {
          try {
            db.close();
          } catch {}
          this.currentDb = null;
          this.dbPromise = null;
        };

        db.onclose = () => {
          this.currentDb = null;
          this.dbPromise = null;
        };

        db.onerror = () => {
          this.currentDb = null;
          this.dbPromise = null;
        };

        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('results')) {
          db.createObjectStore('results', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('mistakes')) {
          db.createObjectStore('mistakes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('achievements')) {
          db.createObjectStore('achievements', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('presets')) {
          db.createObjectStore('presets', { keyPath: 'id' });
        }
      };
    });

    return this.dbPromise;
  }

  private async executeTx<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore, tx: IDBTransaction) => Promise<T> | T
  ): Promise<T> {
    const run = async (): Promise<T> => {
      const db = await this.getDB();
      return new Promise<T>((resolve, reject) => {
        let tx: IDBTransaction;
        try {
          tx = db.transaction(storeName, mode);
        } catch (err: any) {
          this.currentDb = null;
          this.dbPromise = null;
          return reject(err);
        }

        const store = tx.objectStore(storeName);

        let opResult: any;
        try {
          opResult = operation(store, tx);
        } catch (opErr) {
          return reject(opErr);
        }

        if (opResult && typeof opResult.then === 'function') {
          opResult.then(
            (val: T) => {
              if (mode === 'readonly') {
                resolve(val);
              } else {
                tx.oncomplete = () => resolve(val);
              }
            },
            (err: any) => reject(err)
          );
        } else {
          if (mode === 'readwrite') {
            tx.oncomplete = () => resolve(opResult as T);
          } else {
            resolve(opResult as T);
          }
        }

        tx.onerror = () => {
          this.currentDb = null;
          this.dbPromise = null;
          reject(tx.error || new Error('Transaction failed'));
        };

        tx.onabort = () => {
          this.currentDb = null;
          this.dbPromise = null;
          reject(tx.error || new Error('Transaction aborted'));
        };
      });
    };

    try {
      return await run();
    } catch (firstErr: any) {
      const msg = String(firstErr?.message || firstErr || '');
      if (
        msg.includes('closing') ||
        msg.includes('closed') ||
        msg.includes('InvalidStateError') ||
        msg.includes('connection')
      ) {
        this.currentDb = null;
        this.dbPromise = null;
        return await run();
      }
      throw firstErr;
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const result = await this.executeTx('profile', 'readonly', (store) => {
        return new Promise<any>((resolve, reject) => {
          const req = store.get('default_user');
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      });

      if (result) {
        return {
          ...DEFAULT_PROFILE,
          ...result,
          onboardingCompleted: result.onboardingCompleted ?? Boolean(result.name && result.name !== ''),
        };
      }
    } catch {
      // fallback
    }

    const local = localStorage.getItem('math_hero_profile');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          onboardingCompleted: parsed.onboardingCompleted ?? Boolean(parsed.name && parsed.name !== ''),
        };
      } catch {
        return { ...DEFAULT_PROFILE, onboardingCompleted: false };
      }
    }
    return { ...DEFAULT_PROFILE, onboardingCompleted: false };
  }

  async resetProfile(): Promise<void> {
    try {
      await this.executeTx('profile', 'readwrite', (store) => {
        store.delete('default_user');
      });
    } catch {
      // fallback
    } finally {
      localStorage.removeItem('math_hero_profile');
    }
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await this.executeTx('profile', 'readwrite', (store) => {
        store.put(profile);
      });
    } catch {
      // fallback
    }
    try {
      localStorage.setItem('math_hero_profile', JSON.stringify(profile));
    } catch {}
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const result = await this.executeTx('settings', 'readonly', (store) => {
        return new Promise<any>((resolve, reject) => {
          const req = store.get('app_settings');
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      });
      if (result) {
        return { ...DEFAULT_SETTINGS, ...result };
      }
    } catch {
      // fallback
    }

    const local = localStorage.getItem('math_hero_settings');
    if (local) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(local) };
      } catch {}
    }
    return DEFAULT_SETTINGS;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await this.executeTx('settings', 'readwrite', (store) => {
        store.put({ ...settings, id: 'app_settings' });
      });
    } catch {
      // fallback
    }
    try {
      localStorage.setItem('math_hero_settings', JSON.stringify(settings));
    } catch {}
  }

  async getResults(): Promise<QuizResult[]> {
    try {
      const result = await this.executeTx('results', 'readonly', (store) => {
        return new Promise<QuizResult[]>((resolve, reject) => {
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
      });
      if (result && Array.isArray(result)) {
        return result;
      }
    } catch {
      // fallback
    }

    const local = localStorage.getItem('math_hero_results');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return [];
  }

  async saveResult(result: QuizResult): Promise<void> {
    try {
      await this.executeTx('results', 'readwrite', (store) => {
        store.put(result);
      });
    } catch {
      // fallback
    }
    try {
      const results = await this.getResults();
      const idx = results.findIndex(r => r.id === result.id);
      if (idx >= 0) {
        results[idx] = result;
      } else {
        results.unshift(result);
      }
      localStorage.setItem('math_hero_results', JSON.stringify(results));
    } catch {}
  }

  async getMistakes(): Promise<MistakeRecord[]> {
    try {
      const result = await this.executeTx('mistakes', 'readonly', (store) => {
        return new Promise<MistakeRecord[]>((resolve, reject) => {
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
      });
      if (result && Array.isArray(result)) {
        return result;
      }
    } catch {
      // fallback
    }

    const local = localStorage.getItem('math_hero_mistakes');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return [];
  }

  async saveMistake(mistake: MistakeRecord): Promise<void> {
    try {
      await this.executeTx('mistakes', 'readwrite', (store) => {
        store.put(mistake);
      });
    } catch {
      // fallback
    }
    try {
      const mistakes = await this.getMistakes();
      const idx = mistakes.findIndex(m => m.id === mistake.id);
      if (idx >= 0) {
        mistakes[idx] = mistake;
      } else {
        mistakes.unshift(mistake);
      }
      localStorage.setItem('math_hero_mistakes', JSON.stringify(mistakes));
    } catch {}
  }

  async getAchievements(): Promise<Achievement[]> {
    try {
      const result = await this.executeTx('achievements', 'readonly', (store) => {
        return new Promise<Achievement[]>((resolve, reject) => {
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
      });
      if (result && result.length > 0) {
        return result;
      }
    } catch {
      // fallback
    }

    const local = localStorage.getItem('math_hero_achievements');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return INITIAL_ACHIEVEMENTS;
  }

  async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await this.executeTx('achievements', 'readwrite', (store) => {
        achievements.forEach(ach => store.put(ach));
      });
    } catch {
      // fallback
    }
    try {
      localStorage.setItem('math_hero_achievements', JSON.stringify(achievements));
    } catch {}
  }

  async getPresets(): Promise<QuizPreset[]> {
    try {
      const result = await this.executeTx('presets', 'readonly', (store) => {
        return new Promise<QuizPreset[]>((resolve, reject) => {
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
      });
      if (result && result.length > 0) {
        return result;
      }
    } catch {
      // fallback
    }

    const local = localStorage.getItem('math_hero_presets');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return DEFAULT_PRESETS;
  }

  async getTestPatterns(): Promise<TestPattern[]> {
    try {
      const result = await this.executeTx('presets', 'readonly', (store) => {
        return new Promise<any[]>((resolve, reject) => {
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
      });
      const patternsOnly = (result || []).filter((item: any) => item && item.config && item.config.selectedOperations);
      if (patternsOnly.length > 0) {
        return patternsOnly as TestPattern[];
      }
    } catch {
      // fallback
    }

    const local = localStorage.getItem('math_hero_test_patterns');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return DEFAULT_TEST_PATTERNS;
  }

  async saveTestPattern(pattern: TestPattern): Promise<void> {
    try {
      await this.executeTx('presets', 'readwrite', (store) => {
        store.put(pattern);
      });
    } catch {
      // Fallback to localStorage
    }
    // Also mirror to localStorage for reliability
    try {
      const current = await this.getTestPatterns();
      const idx = current.findIndex(p => p.id === pattern.id);
      if (idx >= 0) {
        current[idx] = pattern;
      } else {
        current.unshift(pattern);
      }
      localStorage.setItem('math_hero_test_patterns', JSON.stringify(current));
    } catch (e) {
      console.error('Failed to mirror test pattern to localStorage', e);
    }
  }

  async deleteTestPattern(id: string): Promise<void> {
    try {
      await this.executeTx('presets', 'readwrite', (store) => {
        store.delete(id);
      });
    } catch {
      // Fallback
    }
    try {
      const current = await this.getTestPatterns();
      const filtered = current.filter(p => p.id !== id);
      localStorage.setItem('math_hero_test_patterns', JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete test pattern from localStorage', e);
    }
  }

  async clearResults(): Promise<void> {
    try {
      await this.executeTx('results', 'readwrite', (store) => {
        store.clear();
      });
    } catch {
      // Fallback
    } finally {
      localStorage.removeItem('math_hero_results');
    }
  }

  async clearMistakes(): Promise<void> {
    try {
      await this.executeTx('mistakes', 'readwrite', (store) => {
        store.clear();
      });
    } catch {
      // Fallback
    } finally {
      localStorage.removeItem('math_hero_mistakes');
    }
  }

  async saveResultsBulk(results: QuizResult[]): Promise<void> {
    try {
      await this.executeTx('results', 'readwrite', (store) => {
        store.clear();
        results.forEach((item) => store.put(item));
      });
    } catch {
      // Fallback
    } finally {
      localStorage.setItem('math_hero_results', JSON.stringify(results));
    }
  }

  async saveMistakesBulk(mistakes: MistakeRecord[]): Promise<void> {
    try {
      await this.executeTx('mistakes', 'readwrite', (store) => {
        store.clear();
        mistakes.forEach((item) => store.put(item));
      });
    } catch {
      // Fallback
    } finally {
      localStorage.setItem('math_hero_mistakes', JSON.stringify(mistakes));
    }
  }

  async saveTestPatternsBulk(patterns: TestPattern[]): Promise<void> {
    try {
      await this.executeTx('presets', 'readwrite', (store) => {
        patterns.forEach((item) => store.put(item));
      });
    } catch {
      // Fallback
    } finally {
      localStorage.setItem('math_hero_test_patterns', JSON.stringify(patterns));
    }
  }

  async resetAllData(): Promise<void> {
    try {
      await this.resetProfile();
      await this.saveProfile(DEFAULT_PROFILE);
      await this.saveSettings(DEFAULT_SETTINGS);
      await this.clearResults();
      await this.clearMistakes();
      await this.saveAchievements(INITIAL_ACHIEVEMENTS);
      await this.saveTestPatternsBulk(DEFAULT_TEST_PATTERNS);
    } catch (err) {
      console.error('Error during resetAllData:', err);
    } finally {
      localStorage.removeItem('math_hero_gamification_state_v1');
      localStorage.removeItem('math_hero_profile');
      localStorage.removeItem('math_hero_settings');
      localStorage.removeItem('math_hero_results');
      localStorage.removeItem('math_hero_mistakes');
      localStorage.removeItem('math_hero_test_patterns');
      localStorage.removeItem('math_hero_achievements');
    }
  }
}

export const storage = new StorageService();
