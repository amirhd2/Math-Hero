/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserProfile, AppSettings, QuizPreset, QuizResult, ScreenId, TestPattern, QuizConfiguration, QuizSession, AppMode, OperationType } from './types';
import { storage, DEFAULT_PROFILE, DEFAULT_SETTINGS, DEFAULT_PRESETS, DEFAULT_TEST_PATTERNS } from './utils/storage';
import { createQuizSession, DEFAULT_OPERATION_SETTINGS } from './utils/questionGenerator';
import { createSmartReviewSession } from './smartReview/smartReviewEngine';
import { SmartTeacherEngine } from './adaptive/smartTeacherEngine';
import { getLevelProgress } from './gamification/levelCalculator';
import { formatNumber } from './utils/persian';
import { getAssetUrl, getFallbackAssetUrl } from './utils/assetPaths';
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
import { IOSSwipeBackContainer } from './components/navigation/IOSSwipeBackContainer';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [presets, setPresets] = useState<QuizPreset[]>(DEFAULT_PRESETS);
  const [testPatterns, setTestPatterns] = useState<TestPattern[]>(DEFAULT_TEST_PATTERNS);

  // App Mode: 'child' (default) vs 'parent'
  const [appMode, setAppMode] = useState<AppMode>('child');
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);

  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [navigationHistory, setNavigationHistory] = useState<ScreenId[]>(['home']);

  const getDefaultPreviousScreen = (screen: ScreenId, mode: AppMode): ScreenId | null => {
    if (screen === 'home' || screen === 'onboarding') return null;
    if (screen === 'quiz_setup') return mode === 'parent' ? 'parent_dashboard' : 'home';
    if (screen === 'presets') return mode === 'parent' ? 'parent_dashboard' : 'home';
    if (screen === 'parent_dashboard') return 'home';
    return 'home';
  };

  const getPreviousScreen = (): ScreenId | null => {
    if (currentScreen === 'home' || currentScreen === 'onboarding') {
      return null;
    }
    if (navigationHistory.length > 1) {
      return navigationHistory[navigationHistory.length - 2];
    }
    return getDefaultPreviousScreen(currentScreen, appMode);
  };

  const handleNavigate = (targetScreen: ScreenId) => {
    if (targetScreen === currentScreen) return;

    if (targetScreen === 'home') {
      setNavigationHistory(['home']);
      setCurrentScreen('home');
      return;
    }

    const existingIndex = navigationHistory.lastIndexOf(targetScreen);
    if (existingIndex !== -1 && existingIndex === navigationHistory.length - 2) {
      setNavigationHistory(prev => prev.slice(0, -1));
      setCurrentScreen(targetScreen);
      return;
    }

    setNavigationHistory(prev => [...prev, targetScreen]);
    setCurrentScreen(targetScreen);
  };

  const handleGoBack = () => {
    if (navigationHistory.length > 1) {
      const nextHistory = navigationHistory.slice(0, -1);
      const prevScreen = nextHistory[nextHistory.length - 1];
      setNavigationHistory(nextHistory);
      setCurrentScreen(prevScreen);
    } else {
      const defaultPrev = getDefaultPreviousScreen(currentScreen, appMode);
      if (defaultPrev) {
        setNavigationHistory([defaultPrev]);
        setCurrentScreen(defaultPrev);
      }
    }
  };

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
    handleNavigate('quiz_setup');
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
        handleNavigate('quiz_active');
        return;
      }

      const session = createQuizSession(config);
      session.source = 'parent-manual';
      session.isParentOverride = true;
      setActiveSession(session);
      handleNavigate('quiz_active');
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
      handleNavigate('quiz_active');
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
      handleNavigate('quiz_active');
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
      handleNavigate('quiz_active');
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
    handleNavigate('parent_dashboard');
  };

  const handleExitToChildMode = () => {
    setAppMode('child');
    if (currentScreen === 'parent_dashboard' || currentScreen === 'quiz_setup' || currentScreen === 'presets') {
      handleNavigate('home');
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
    handleNavigate('quiz_active');
  };

  // Start Quiz directly with pre-built QuizSession (e.g. from Results Retry or Practice Mistakes)
  const handleStartSession = (session: QuizSession) => {
    setActiveSession(session);
    handleNavigate('quiz_active');
  };

  // Start Adaptive Smart Review Quiz
  const handleStartSmartReview = async () => {
    try {
      const { session } = await createSmartReviewSession();
      if (session) {
        setActiveSession(session);
        handleNavigate('quiz_active');
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
    handleNavigate('quiz_results');
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

  // Render individual screen component
  const renderScreen = (screenId: ScreenId) => {
    switch (screenId) {
      case 'onboarding':
        return <OnboardingScreen onComplete={handleCompleteOnboarding} />;
      case 'home':
        return (
          <HomeScreen
            profile={profile}
            presets={presets}
            testPatterns={testPatterns}
            appMode={appMode}
            onOpenSetup={handleOpenQuizSetup}
            onStartPattern={handleStartPattern}
            onStartQuiz={handleStartQuiz}
            onNavigate={handleNavigate}
            onStartSmartReview={handleStartSmartReview}
            onStartChildQuickOperation={handleStartChildQuickOperation}
            onStartChildCombined={handleStartChildCombined}
          />
        );
      case 'parent_dashboard':
        return (
          <ParentDashboardScreen
            profile={profile}
            testPatterns={testPatterns}
            onOpenSetup={(cfg?: any) => handleOpenQuizSetup(cfg)}
            onStartPattern={handleStartPattern}
            onNavigate={handleNavigate}
            onExitToChildMode={handleExitToChildMode}
          />
        );
      case 'quiz_setup':
        return (
          <QuizSetupScreen
            initialConfig={activeQuizConfig}
            editingPattern={editingPattern}
            onStartQuiz={handleStartQuizWithConfig}
            onBack={handleGoBack}
            onNavigate={handleNavigate}
          />
        );
      case 'presets':
        return (
          <PresetsScreen
            patterns={testPatterns}
            onStartPattern={handleStartPattern}
            onEditPattern={handleEditPattern}
            onDeletePattern={handleDeletePattern}
            onCreateNew={() => handleOpenQuizSetup()}
            onNavigate={handleNavigate}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBack={handleGoBack}
            onNavigate={handleNavigate}
          />
        );
      case 'quiz_active':
        return (
          <QuizActiveScreen
            session={activeSession || undefined}
            preset={activePreset}
            profile={profile}
            settings={settings}
            soundEnabled={settings.soundEnabled}
            onFinishQuiz={handleFinishQuiz}
            onCancelQuiz={handleGoBack}
          />
        );
      case 'quiz_results':
        return lastResult ? (
          <ResultsScreen
            result={lastResult}
            profile={profile}
            settings={settings}
            onNavigate={handleNavigate}
            onStartSession={handleStartSession}
          />
        ) : null;
      case 'mistakes':
        return (
          <MistakesScreen
            onNavigate={handleNavigate}
            onStartSession={handleStartSession}
          />
        );
      case 'progress':
        return (
          <ProgressScreen
            profile={profile}
            onNavigate={handleNavigate}
            onOpenSetup={handleOpenQuizSetup}
          />
        );
      case 'achievements':
        return (
          <AchievementsScreen
            onNavigate={handleNavigate}
            settings={settings}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            settings={settings}
            profile={profile}
            appMode={appMode}
            onUpdateSettings={handleUpdateSettings}
            onNavigate={handleNavigate}
            onOpenParentGate={handleOpenParentGate}
            onExitToChildMode={handleExitToChildMode}
          />
        );
      default:
        return null;
    }
  };

  const hasBottomNav = (screenId: ScreenId) =>
    screenId !== 'quiz_active' &&
    screenId !== 'onboarding' &&
    screenId !== 'quiz_setup' &&
    screenId !== 'settings';

  // Render the full screen view with its main container, desktop header, and mobile bottom nav
  const renderScreenView = (screenId: ScreenId, isBackground: boolean = false) => {
    const showDesktopNav = screenId !== 'quiz_active' && screenId !== 'onboarding';
    const levelInfo = getLevelProgress(profile.xp);
    const gender = profile.gender === 'girl' ? 'girl' : 'boy';

    return (
      <div className="w-full min-h-screen flex flex-col justify-between">
        {/* Desktop & Tablet Top Navigation Header */}
        {showDesktopNav && (
          <header className={`hidden md:flex sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors ${isBackground ? 'pointer-events-none' : ''}`}>
            <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between gap-4">
              
              {/* Brand & Logo (Removed as requested) */}

              {/* Navigation Links */}
              <nav className="flex items-center gap-1 lg:gap-2">
                <button
                  onClick={() => !isBackground && handleNavigate('home')}
                  className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-black flex items-center gap-1.5 transition-all ${
                    screenId === 'home'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>🏠</span>
                  <span>خانه</span>
                </button>

                {/* Removed میز مربی (Parent Dashboard) as requested */}
                
                {appMode !== 'parent' && (
                  <button
                    onClick={() => !isBackground && handleNavigate('mistakes')}
                    className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-black flex items-center gap-1.5 transition-all ${
                      screenId === 'mistakes'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>💡</span>
                    <span>گنجینه اشتباهات</span>
                  </button>
                )}

                <button
                  onClick={() => !isBackground && handleNavigate('progress')}
                  className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-black flex items-center gap-1.5 transition-all ${
                    screenId === 'progress'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>📊</span>
                  <span>کارنامه و آمار</span>
                </button>

                {/* Removed نشان‌ها و افتخارات (Level/Badges button) as requested */}
                
                <button
                  onClick={() => !isBackground && handleNavigate('presets')}
                  className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-black flex items-center gap-1.5 transition-all ${
                    screenId === 'presets'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>⭐</span>
                  <span>الگوها</span>
                </button>

                <button
                  onClick={() => !isBackground && handleNavigate('settings')}
                  className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-black flex items-center gap-1.5 transition-all ${
                    screenId === 'settings'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>⚙️</span>
                  <span>تنظیمات</span>
                </button>
              </nav>

              {/* Right Side Stats & Profile Button */}
              <div className="flex items-center gap-2.5 lg:gap-3 shrink-0">
                {/* Streak */}
                <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-black text-amber-700 dark:text-amber-300">
                  <span>🔥</span>
                  <span>{formatNumber(profile.streakDays, 'persian')} روز</span>
                </div>

                {/* Coins */}
                <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800/60 text-xs font-black text-yellow-700 dark:text-yellow-300">
                  <span>🪙</span>
                  <span>{formatNumber(profile.coins, 'persian')}</span>
                </div>

                {/* Profile Avatar Button */}
                <button
                  onClick={() => !isBackground && handleNavigate('profile')}
                  className={`flex items-center gap-2 p-1 pl-3 rounded-2xl border transition-all cursor-pointer ${
                    screenId === 'profile'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                  title="مشاهده و ویرایش پروفایل"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    <img
                      src={getAssetUrl(`assets/characters/${gender}/head.webp`)}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.fallback) {
                          target.dataset.fallback = '1';
                          target.src = getFallbackAssetUrl(`assets/characters/${gender}/head.webp`);
                        }
                      }}
                    />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 max-w-[80px] truncate">
                    {profile.name}
                  </span>
                </button>
              </div>
            </div>
          </header>
        )}

        <main
          className={`flex-1 w-full overflow-x-hidden ${screenId === 'quiz_active' ? '' : 'pb-16 md:pb-8 pt-safe'}`}
          style={{
            paddingTop: screenId === 'quiz_active' ? undefined : 'env(safe-area-inset-top, 0px)',
          }}
        >
          {renderScreen(screenId)}
        </main>

        {hasBottomNav(screenId) && (
          <nav 
            className={`fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1 px-4 z-40 flex justify-around items-center max-w-lg mx-auto md:hidden rounded-t-2xl shadow-lg ${isBackground ? 'pointer-events-none' : ''}`}
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)' }}
          >
            <button
              onClick={() => !isBackground && handleNavigate('home')}
              className={`flex flex-col items-center py-0.5 px-2 rounded-xl transition-all ${screenId === 'home' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="text-lg leading-none">🏠</span>
              <span className="text-[10px] font-medium leading-tight">خانه</span>
            </button>
            {appMode === 'parent' ? (
              <button
                onClick={() => !isBackground && handleNavigate('parent_dashboard')}
                className={`flex flex-col items-center py-0.5 px-2 rounded-xl transition-all ${screenId === 'parent_dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <span className="text-lg leading-none">👨‍🏫</span>
                <span className="text-[10px] font-medium leading-tight">میز مربی</span>
              </button>
            ) : (
              <button
                onClick={() => !isBackground && handleNavigate('mistakes')}
                className={`flex flex-col items-center py-0.5 px-2 rounded-xl transition-all ${screenId === 'mistakes' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <span className="text-lg leading-none">💡</span>
                <span className="text-[10px] font-medium leading-tight">گنجینه</span>
              </button>
            )}
            <button
              onClick={() => !isBackground && handleNavigate('progress')}
              className={`flex flex-col items-center py-0.5 px-2 rounded-xl transition-all ${screenId === 'progress' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="text-lg leading-none">📊</span>
              <span className="text-[10px] font-medium leading-tight">آمار</span>
            </button>
            <button
              onClick={() => !isBackground && handleNavigate('achievements')}
              className={`flex flex-col items-center py-0.5 px-2 rounded-xl transition-all ${screenId === 'achievements' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="text-lg leading-none">🏆</span>
              <span className="text-[10px] font-medium leading-tight">نشان‌ها</span>
            </button>
            <button
              onClick={() => !isBackground && handleNavigate('settings')}
              className={`flex flex-col items-center py-0.5 px-2 rounded-xl transition-all ${(screenId as string) === 'settings' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="text-lg leading-none">⚙️</span>
              <span className="text-[10px] font-medium leading-tight">تنظیمات</span>
            </button>
          </nav>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-['Vazirmatn',sans-serif] selection:bg-amber-400 selection:text-slate-900 transition-colors">
      {/* iOS Interactive Swipe-Back Navigation View */}
      <IOSSwipeBackContainer
        currentScreenId={currentScreen}
        previousScreenId={getPreviousScreen()}
        canGoBack={getPreviousScreen() !== null}
        onBack={handleGoBack}
        renderScreenView={renderScreenView}
      />

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
