/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  AppSettings,
  QuizPreset,
  QuizResult,
  ScreenId,
  TestPattern,
  QuizConfiguration,
  QuizSession,
  AppMode,
  OperationType,
} from './types';
import { storage, DEFAULT_PROFILE, DEFAULT_SETTINGS, DEFAULT_PRESETS, DEFAULT_TEST_PATTERNS } from './utils/storage';
import { createQuizSession, DEFAULT_OPERATION_SETTINGS } from './utils/questionGenerator';
import { createSmartReviewSession } from './smartReview/smartReviewEngine';
import { SmartTeacherEngine } from './adaptive/smartTeacherEngine';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { PresetsScreen } from './screens/PresetsScreen';
import { QuizSetupScreen } from './screens/QuizSetupScreen';
import { QuizActiveScreen } from './screens/QuizActiveScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { MistakesScreen } from './screens/MistakesScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { AchievementsScreen } from './screens/AchievementsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ParentDashboardScreen } from './screens/ParentDashboardScreen';
import { ParentGateModal } from './components/parent/ParentGateModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [presets, setPresets] = useState<QuizPreset[]>(DEFAULT_PRESETS);
  const [testPatterns, setTestPatterns] = useState<TestPattern[]>(DEFAULT_TEST_PATTERNS);

  // App Mode: 'child' (default) vs 'parent'
  const [appMode, setAppMode] = useState<AppMode>('child');
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);

  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      const root = document.getElementById('root');
      if (root) root.scrollTop = 0;
    };
    scrollToTop();
    setTimeout(scrollToTop, 10);
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 150);
  }, [currentScreen]);
  const [activePreset, setActivePreset] = useState<QuizPreset>(DEFAULT_PRESETS[0]);
  const [activeSession, setActiveSession] = useState<QuizSession | null>(null);
  const [activeQuizConfig, setActiveQuizConfig] = useState<Partial<QuizConfiguration> | undefined>(undefined);
  const [editingPattern, setEditingPattern] = useState<TestPattern | null>(null);

  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data from storage
  useEffect(() => {
    async function loadData() {
      try {
        const [loadedProfile, loadedSettings, loadedPresets, loadedPatterns] = await Promise.all([
          storage.getProfile(),
          storage.getSettings(),
          storage.getPresets(),
          storage.getTestPatterns(),
        ]);
        setProfile(loadedProfile);
        setSettings(loadedSettings);
        setPresets(loadedPresets);
        setTestPatterns(loadedPatterns && loadedPatterns.length > 0 ? loadedPatterns : DEFAULT_TEST_PATTERNS);

        // Direct new users to Onboarding screen
        if (!loadedProfile.onboardingCompleted) {
          setCurrentScreen('onboarding');
        } else {
          setCurrentScreen('home');
        }
      } catch (err) {
        console.error('Error loading initial storage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCompleteOnboarding = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await storage.saveProfile(newProfile);
    setCurrentScreen('home');
  };

  // Synchronize dark/light/system theme and status bar meta color
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    const applyTheme = () => {
      let isDark = false;
      if (settings.theme === 'system') {
        isDark = mediaQuery ? mediaQuery.matches : false;
      } else {
        isDark = settings.theme === 'dark';
      }

      if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        document.body.classList.remove('dark');
      }

      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#090d16' : '#4f46e5');
      }
    };

    applyTheme();

    if (settings.theme === 'system' && mediaQuery) {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [settings.theme]);

  const handleUpdateProfile = async (updated: UserProfile) => {
    setProfile(updated);
    await storage.saveProfile(updated);
  };

  const handleUpdateSettings = async (updated: AppSettings) => {
    setSettings(updated);
    await storage.saveSettings(updated);
  };

  // Open Quiz Setup Screen with optional pre-configured values or editing pattern
  const handleOpenQuizSetup = (
    config?: Partial<QuizConfiguration>,
    patternToEdit?: TestPattern
  ) => {
    setActiveQuizConfig(config);
    setEditingPattern(patternToEdit || null);
    setCurrentScreen('quiz_setup');
  };

  // Start Quiz directly from generated Quiz Configuration (Parent Manual Setup)
  const handleStartQuizWithConfig = async (config: QuizConfiguration) => {
    try {
      if (config.isAdaptive && config.selectedOperations.length === 1) {
        const op = config.selectedOperations[0];
        const adaptiveQuestions = await SmartTeacherEngine.generateAdaptiveQuestions(
          op,
          config.questionCount,
          config.adaptiveSkillTier
        );
        const baseSession = createQuizSession(config);
        const session: QuizSession = {
          ...baseSession,
          source: 'parent-manual',
          isParentOverride: true,
          questions: adaptiveQuestions.length > 0 ? adaptiveQuestions : baseSession.questions,
          currentQuestion: (adaptiveQuestions.length > 0 ? adaptiveQuestions : baseSession.questions)[0],
          adaptiveMetadata: {
            isAdaptive: true,
            operation: op,
            targetTier: config.adaptiveSkillTier,
          },
        };
        setActiveSession(session);
        setCurrentScreen('quiz_active');
        return;
      }

      const session = createQuizSession(config);
      session.source = 'parent-manual';
      session.isParentOverride = true;
      setActiveSession(session);
      setCurrentScreen('quiz_active');
    } catch (err) {
      console.error('Failed to create quiz session:', err);
    }
  };

  // Start Quiz directly from Saved Test Pattern
  const handleStartPattern = (pattern: TestPattern) => {
    try {
      const session = createQuizSession(pattern.config);
      session.source = 'test-pattern';
      session.isParentOverride = true;
      setActiveSession(session);
      setCurrentScreen('quiz_active');
    } catch (err) {
      console.error('Failed to start pattern quiz:', err);
    }
  };

  // Start child quick practice directly for a selected operation (Adaptive & Simple)
  const handleStartChildQuickOperation = async (op: OperationType) => {
    try {
      const plan = await SmartTeacherEngine.getLearningPlan();
      const currentTier = plan.operations[op]?.currentTier || 1;
      const adaptiveQuestions = await SmartTeacherEngine.generateAdaptiveQuestions(
        op,
        10,
        currentTier
      );
      const config: QuizConfiguration = {
        id: `child-${op}-${Date.now()}`,
        title: `تمرین هوشمند ${op === 'addition' ? 'جمع' : op === 'subtraction' ? 'تفریق' : op === 'multiplication' ? 'ضرب' : 'تقسیم'}`,
        mode: 'practice',
        isAdaptive: true,
        adaptiveSkillTier: currentTier,
        selectedOperations: [op],
        questionCount: 10,
        operationSettings: DEFAULT_OPERATION_SETTINGS,
        distribution: {
          addition: op === 'addition' ? 100 : 0,
          subtraction: op === 'subtraction' ? 100 : 0,
          multiplication: op === 'multiplication' ? 100 : 0,
          division: op === 'division' ? 100 : 0,
          mixed: 0,
        },
        smartReviewEnabled: true,
      };
      const baseSession = createQuizSession(config);
      const session: QuizSession = {
        ...baseSession,
        source: 'child-adaptive',
        isParentOverride: false,
        questions: adaptiveQuestions.length > 0 ? adaptiveQuestions : baseSession.questions,
        currentQuestion: (adaptiveQuestions.length > 0 ? adaptiveQuestions : baseSession.questions)[0],
        adaptiveMetadata: {
          isAdaptive: true,
          operation: op,
          targetTier: currentTier,
        },
      };
      setActiveSession(session);
      setCurrentScreen('quiz_active');
    } catch (err) {
      console.error('Failed to start child quick operation:', err);
    }
  };

  // Start child combined challenge across operations
  const handleStartChildCombined = async () => {
    try {
      const plan = await SmartTeacherEngine.getLearningPlan();
      const mistakes = await storage.getMistakes();
      const sampleMistakes = mistakes.map((m) => m.question);
      const adaptiveQuestions = SmartTeacherEngine.generateCombinedAdaptiveQuestions(
        plan,
        sampleMistakes
      );
      const operations: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];
      const config: QuizConfiguration = {
        id: `child-combined-${Date.now()}`,
        title: 'چالش جامع چهار عمل اصلی',
        mode: 'test',
        isAdaptive: true,
        selectedOperations: operations,
        questionCount: adaptiveQuestions.length,
        operationSettings: DEFAULT_OPERATION_SETTINGS,
        distribution: {
          addition: 25,
          subtraction: 25,
          multiplication: 25,
          division: 25,
          mixed: 0,
        },
        smartReviewEnabled: true,
      };
      const baseSession = createQuizSession(config);
      const session: QuizSession = {
        ...baseSession,
        source: 'child-adaptive',
        isParentOverride: false,
        questions: adaptiveQuestions.length > 0 ? adaptiveQuestions : baseSession.questions,
        currentQuestion: (adaptiveQuestions.length > 0 ? adaptiveQuestions : baseSession.questions)[0],
        adaptiveMetadata: {
          isAdaptive: true,
          operation: 'mixed',
        },
      };
      setActiveSession(session);
      setCurrentScreen('quiz_active');
    } catch (err) {
      console.error('Failed to start child combined quiz:', err);
    }
  };

  // Parent Gate & Mode Switching
  const handleOpenParentGate = () => {
    setIsParentGateOpen(true);
  };

  const handleParentGateSuccess = () => {
    setIsParentGateOpen(false);
    setAppMode('parent');
    setCurrentScreen('parent_dashboard');
  };

  const handleExitToChildMode = () => {
    setAppMode('child');
    if (currentScreen === 'parent_dashboard' || currentScreen === 'quiz_setup' || currentScreen === 'presets') {
      setCurrentScreen('home');
    }
  };

  // Edit an existing Test Pattern
  const handleEditPattern = (pattern: TestPattern) => {
    handleOpenQuizSetup(pattern.config, pattern);
  };

  // Delete a Test Pattern
  const handleDeletePattern = async (id: string) => {
    await storage.deleteTestPattern(id);
    const updated = await storage.getTestPatterns();
    setTestPatterns(updated);
  };

  // Legacy preset support
  const handleStartQuiz = (preset?: QuizPreset) => {
    if (preset) {
      setActivePreset(preset);
    } else {
      setActivePreset(presets[0]);
    }
    setActiveSession(null);
    setCurrentScreen('quiz_active');
  };

  // Start Quiz directly with pre-built QuizSession (e.g. from Results Retry or Practice Mistakes)
  const handleStartSession = (session: QuizSession) => {
    setActiveSession(session);
    setCurrentScreen('quiz_active');
  };

  // Start Adaptive Smart Review Quiz
  const handleStartSmartReview = async () => {
    try {
      const { session } = await createSmartReviewSession();
      if (session) {
        setActiveSession(session);
        setCurrentScreen('quiz_active');
      } else {
        handleOpenQuizSetup({ mode: 'practice', questionCount: 10 });
      }
    } catch (err) {
      console.error('Failed to start smart review session:', err);
    }
  };

  const handleFinishQuiz = async (result: QuizResult) => {
    setLastResult(result);
    try {
      const freshProfile = await storage.getProfile();
      setProfile(freshProfile);
    } catch (err) {
      console.warn('Failed to refresh profile after quiz:', err);
    }
    setCurrentScreen('quiz_results');
  };

  const handleToggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    handleUpdateSettings({ ...settings, theme: newTheme });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-black mx-auto animate-bounce shadow-xl shadow-indigo-500/30">
            🧮
          </div>
          <p className="font-bold text-slate-600 dark:text-slate-400">در حال آماده‌سازی قهرمان ریاضی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-['Vazirmatn',sans-serif] selection:bg-amber-400 selection:text-slate-900 transition-colors">


      {/* Main Screen Content */}
      <main className={`flex-1 ${currentScreen === 'quiz_active' ? '' : 'pb-16'}`}>
        {currentScreen === 'onboarding' && (
          <OnboardingScreen onComplete={handleCompleteOnboarding} />
        )}
        {currentScreen === 'home' && (
          <HomeScreen
            profile={profile}
            presets={presets}
            testPatterns={testPatterns}
            appMode={appMode}
            onOpenSetup={handleOpenQuizSetup}
            onStartPattern={handleStartPattern}
            onStartQuiz={handleStartQuiz}
            onNavigate={setCurrentScreen}
            onStartSmartReview={handleStartSmartReview}
            onStartChildQuickOperation={handleStartChildQuickOperation}
            onStartChildCombined={handleStartChildCombined}
          />
        )}
        {currentScreen === 'parent_dashboard' && (
          <ParentDashboardScreen
            profile={profile}
            testPatterns={testPatterns}
            onOpenSetup={(cfg) => handleOpenQuizSetup(cfg)}
            onStartPattern={handleStartPattern}
            onNavigate={setCurrentScreen}
            onExitToChildMode={handleExitToChildMode}
          />
        )}
        {currentScreen === 'quiz_setup' && (
          <QuizSetupScreen
            initialConfig={activeQuizConfig}
            editingPattern={editingPattern}
            onStartQuiz={handleStartQuizWithConfig}
            onBack={() => setCurrentScreen(appMode === 'parent' ? 'parent_dashboard' : 'home')}
            onNavigate={setCurrentScreen}
          />
        )}
        {currentScreen === 'presets' && (
          <PresetsScreen
            patterns={testPatterns}
            onStartPattern={handleStartPattern}
            onEditPattern={handleEditPattern}
            onDeletePattern={handleDeletePattern}
            onCreateNew={() => handleOpenQuizSetup()}
            onNavigate={setCurrentScreen}
          />
        )}
        {currentScreen === 'profile' && (
          <ProfileScreen
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBack={() => setCurrentScreen('home')}
            onNavigate={setCurrentScreen}
          />
        )}
        {currentScreen === 'quiz_active' && (
          <QuizActiveScreen
            session={activeSession || undefined}
            preset={activePreset}
            profile={profile}
            settings={settings}
            soundEnabled={settings.soundEnabled}
            onFinishQuiz={handleFinishQuiz}
            onCancelQuiz={() => setCurrentScreen(appMode === 'parent' ? 'parent_dashboard' : 'home')}
          />
        )}
        {currentScreen === 'quiz_results' && lastResult && (
          <ResultsScreen
            result={lastResult}
            profile={profile}
            settings={settings}
            onNavigate={setCurrentScreen}
            onStartSession={handleStartSession}
          />
        )}
        {currentScreen === 'mistakes' && (
          <MistakesScreen
            onNavigate={setCurrentScreen}
            onStartSession={handleStartSession}
          />
        )}
        {currentScreen === 'progress' && (
          <ProgressScreen
            profile={profile}
            onNavigate={setCurrentScreen}
            onOpenSetup={handleOpenQuizSetup}
          />
        )}
        {currentScreen === 'achievements' && (
          <AchievementsScreen onNavigate={setCurrentScreen} settings={settings} />
        )}
        {currentScreen === 'settings' && (
          <SettingsScreen
            settings={settings}
            profile={profile}
            appMode={appMode}
            onUpdateSettings={handleUpdateSettings}
            onNavigate={setCurrentScreen}
            onOpenParentGate={handleOpenParentGate}
            onExitToChildMode={handleExitToChildMode}
          />
        )}
      </main>

      {/* Floating Bottom Quick Nav for non-quiz screens (Settings does NOT use persistent bottom nav) */}
      {currentScreen !== 'quiz_active' && currentScreen !== 'onboarding' && currentScreen !== 'quiz_setup' && currentScreen !== 'settings' && (
        <nav 
          className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pt-2.5 px-6 z-40 flex justify-around items-center max-w-lg mx-auto md:hidden rounded-t-3xl shadow-lg"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.75rem)' }}
        >
          <button onClick={() => setCurrentScreen('home')} className={`flex flex-col items-center gap-1 ${currentScreen === 'home' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
            <span className="text-xl">🏠</span>
            <span className="text-[10px]">خانه</span>
          </button>
          {appMode === 'parent' ? (
            <button onClick={() => setCurrentScreen('parent_dashboard')} className={`flex flex-col items-center gap-1 ${currentScreen === 'parent_dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
              <span className="text-xl">👨‍🏫</span>
              <span className="text-[10px]">میز مربی</span>
            </button>
          ) : (
            <button onClick={() => setCurrentScreen('mistakes')} className={`flex flex-col items-center gap-1 ${currentScreen === 'mistakes' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
              <span className="text-xl">💡</span>
              <span className="text-[10px]">گنجینه</span>
            </button>
          )}
          <button onClick={() => setCurrentScreen('progress')} className={`flex flex-col items-center gap-1 ${currentScreen === 'progress' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
            <span className="text-xl">📊</span>
            <span className="text-[10px]">آمار</span>
          </button>
          <button onClick={() => setCurrentScreen('achievements')} className={`flex flex-col items-center gap-1 ${currentScreen === 'achievements' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
            <span className="text-xl">🏆</span>
            <span className="text-[10px]">نشان‌ها</span>
          </button>
          <button onClick={() => setCurrentScreen('settings')} className={`flex flex-col items-center gap-1 ${currentScreen === 'settings' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
            <span className="text-xl">⚙️</span>
            <span className="text-[10px]">تنظیمات</span>
          </button>
        </nav>
      )}

      {/* Parent Security Gate Modal */}
      <ParentGateModal
        isOpen={isParentGateOpen}
        onSuccess={handleParentGateSuccess}
        onClose={() => setIsParentGateOpen(false)}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
