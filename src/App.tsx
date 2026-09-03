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
} from './types';
import { storage, DEFAULT_PROFILE, DEFAULT_SETTINGS, DEFAULT_PRESETS, DEFAULT_TEST_PATTERNS } from './utils/storage';
import { createQuizSession } from './utils/questionGenerator';
import { Navbar } from './components/Navbar';
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
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [presets, setPresets] = useState<QuizPreset[]>(DEFAULT_PRESETS);
  const [testPatterns, setTestPatterns] = useState<TestPattern[]>(DEFAULT_TEST_PATTERNS);

  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
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

  // Synchronize dark theme class and status bar meta color
  useEffect(() => {
    const root = document.documentElement;
    const isDark = settings.theme === 'dark';
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

  // Start Quiz directly from generated Quiz Configuration
  const handleStartQuizWithConfig = (config: QuizConfiguration) => {
    try {
      const session = createQuizSession(config);
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
      setActiveSession(session);
      setCurrentScreen('quiz_active');
    } catch (err) {
      console.error('Failed to start pattern quiz:', err);
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

  const handleFinishQuiz = (result: QuizResult) => {
    setLastResult(result);
    // Update profile XP & level
    const newXp = profile.xp + result.xpEarned;
    const newLevel = Math.floor(newXp / 200) + 1;
    const updatedProfile: UserProfile = {
      ...profile,
      xp: newXp,
      level: newLevel,
    };
    handleUpdateProfile(updatedProfile);
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
            ۵
          </div>
          <p className="font-bold text-slate-600 dark:text-slate-400">در حال آماده‌سازی قهرمان ریاضی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-['Vazirmatn',sans-serif] selection:bg-amber-400 selection:text-slate-900 transition-colors">
      {/* Top Navbar (hidden during active quiz to prevent accidental mid-quiz navigation) */}
      {currentScreen !== 'onboarding' && currentScreen !== 'quiz_active' && (
        <Navbar
          profile={profile}
          settings={settings}
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          onToggleTheme={handleToggleTheme}
        />
      )}

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
            onOpenSetup={handleOpenQuizSetup}
            onStartPattern={handleStartPattern}
            onStartQuiz={handleStartQuiz}
            onNavigate={setCurrentScreen}
          />
        )}
        {currentScreen === 'quiz_setup' && (
          <QuizSetupScreen
            initialConfig={activeQuizConfig}
            editingPattern={editingPattern}
            onStartQuiz={handleStartQuizWithConfig}
            onBack={() => setCurrentScreen('home')}
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
            soundEnabled={settings.soundEnabled}
            onFinishQuiz={handleFinishQuiz}
            onCancelQuiz={() => setCurrentScreen('home')}
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
          <MistakesScreen onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'progress' && (
          <ProgressScreen
            profile={profile}
            onNavigate={setCurrentScreen}
            onOpenSetup={handleOpenQuizSetup}
          />
        )}
        {currentScreen === 'achievements' && (
          <AchievementsScreen onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onNavigate={setCurrentScreen}
          />
        )}
      </main>

      {/* Floating Bottom Quick Nav for non-quiz screens */}
      {currentScreen !== 'quiz_active' && currentScreen !== 'onboarding' && currentScreen !== 'quiz_setup' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-3 px-6 z-40 flex justify-around items-center max-w-lg mx-auto md:hidden rounded-t-3xl shadow-lg">
          <button onClick={() => setCurrentScreen('home')} className={`flex flex-col items-center gap-1 ${currentScreen === 'home' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
            <span className="text-xl">🏠</span>
            <span className="text-[10px]">خانه</span>
          </button>
          <button onClick={() => setCurrentScreen('presets')} className={`flex flex-col items-center gap-1 ${currentScreen === 'presets' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
            <span className="text-xl">📋</span>
            <span className="text-[10px]">الگوها</span>
          </button>
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
      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
