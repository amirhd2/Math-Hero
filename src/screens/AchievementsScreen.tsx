/**
 * AchievementsScreen component for Math Hero.
 * Comprehensive, child-friendly gamification hub showcasing:
 * - Central Evolving Math Hero Trophy
 * - Shared Level & XP Progression
 * - Recently Unlocked Badges
 * - Category Filterable Badge Collection (Common, Rare, Epic, Legendary)
 * - Friendly Locked Badge Hints
 * - Responsive design supporting Mobile Portrait, Mobile Landscape, Tablet Portrait & Landscape
 */

import React, { useEffect, useState, useMemo } from 'react';
import { ScreenId, UserProfile, AppSettings } from '../types';
import { storage } from '../utils/storage';
import { formatNumber } from '../utils/persian';
import { gamificationEngine } from '../gamification/gamificationEngine';
import {
  Badge,
  BadgeCategory,
  LevelInfo,
  TrophyInfo,
} from '../gamification/gamificationTypes';
import { TrophyHeroCard } from '../components/gamification/TrophyHeroCard';
import { CurrentBadgeCard } from '../components/CurrentBadgeCard';
import { TrophyPathCard } from '../components/gamification/TrophyPathCard';
import { LevelProgressCard } from '../components/gamification/LevelProgressCard';
import { BackButton } from '../components/common/BackButton';
import { BadgeCard } from '../components/gamification/BadgeCard';
import { RecentlyUnlockedList } from '../components/gamification/RecentlyUnlockedList';
import { BadgeDetailModal } from '../components/gamification/BadgeDetailModal';
import { StagesRoadmapModal } from '../components/gamification/StagesRoadmapModal';
import { sound } from '../utils/sound';
import { getTrophyCupUrl, getTrophyCupFallbackUrl, getAssetUrl, getFallbackAssetUrl } from '../utils/assetPaths';

interface AchievementsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  settings?: AppSettings;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  onNavigate,
  settings,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [trophyInfo, setTrophyInfo] = useState<TrophyInfo | null>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingBadge, setInspectingBadge] = useState<Badge | null>(null);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [streak, setStreak] = useState<number>(1);

  // Load centralized gamification data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const userProfile = await storage.getProfile();
        const overview = await gamificationEngine.getOverviewData();

        if (isMounted) {
          setProfile(userProfile);
          setLevelInfo(overview.levelInfo);
          setTrophyInfo(overview.trophyInfo);
          setAllBadges(overview.allBadges);
          setRecentlyUnlocked(overview.recentlyUnlocked);
          setStreak(overview.state.currentStreak || userProfile.streakDays || 1);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load achievements data:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered badges list
  const filteredBadges = useMemo(() => {
    return allBadges.filter((badge) => {
      // Category filter
      if (selectedCategory !== 'all' && badge.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (statusFilter === 'unlocked' && !badge.unlocked) {
        return false;
      }
      if (statusFilter === 'locked' && badge.unlocked) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = badge.name.toLowerCase().includes(query);
        const matchDesc = badge.description.toLowerCase().includes(query);
        const matchReq = badge.requirement.descriptionFa.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchReq) {
          return false;
        }
      }

      return true;
    });
  }, [allBadges, selectedCategory, statusFilter, searchQuery]);

  const unlockedCount = useMemo(() => {
    return allBadges.filter((b) => b.unlocked).length;
  }, [allBadges]);

  const categories: { id: BadgeCategory | 'all'; title: string; icon: string }[] = [
    { id: 'all', title: 'همه نشان‌ها', icon: '🌟' },
    { id: 'practice', title: 'تداوم و تمرین', icon: '📚' },
    { id: 'accuracy', title: 'دقت و تمرکز', icon: '🎯' },
    { id: 'improvement', title: 'پیشرفت و یادگیری', icon: '🚀' },
    { id: 'operations', title: '۴ عمل اصلی', icon: '➕' },
    { id: 'streak', title: 'زنجیره روزانه', icon: '🔥' },
    { id: 'smartReview', title: 'مرور هوشمند', icon: '🧠' },
    { id: 'mastery', title: 'استادی و قهرمان', icon: '👑' },
  ];

  const handleSelectBadge = (badge: Badge) => {
    if (settings?.soundEnabled) {
      sound.playClick(settings.soundEnabled);
    }
    setInspectingBadge(badge);
  };

  if (loading || !profile || !levelInfo || !trophyInfo) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500">در حال بارگذاری تالار افتخارات قهرمان...</p>
      </div>
    );
  }

  const gender = profile.gender === 'girl' ? 'girl' : 'boy';

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 overflow-x-clip text-right">
      {/* 1. Header Navigation Bar - Title on right, BackButton on left */}
      <div className="flex flex-row items-center justify-between gap-3 w-full mb-6">
        <div className="text-right flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 sm:gap-2.5 truncate">
            <span>🏆</span>
            <span>تالار نشان‌ها و جام قهرمانی</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            نگاه کن چقدر پیشرفت کردی و چقدر افتخار آفریدی!
          </p>
        </div>

        <div className="shrink-0">
          <BackButton onClick={() => onNavigate('home')} title="بازگشت به خانه" />
        </div>
      </div>

      {/* 2. Main Hero Section - 2-Column Grid on Tablet Landscape & Desktop (lg+) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start w-full">
        {/* Right Column (Hero Card + Trophy Path) in RTL */}
        <div className="col-span-1 lg:col-span-7 xl:col-span-8 w-full min-w-0 flex flex-col space-y-6 md:space-y-8">
          {/* Top Hero: Colored Trophy Hero Card */}
          <TrophyHeroCard
            profile={profile}
            trophyInfo={trophyInfo}
            levelInfo={levelInfo}
            unlockedBadgesCount={unlockedCount}
            totalBadgesCount={allBadges.length}
            streak={streak}
            className="w-full"
          />
          {/* Current Honor Badges & Cups Card */}
          <CurrentBadgeCard
            trophyInfo={trophyInfo}
            levelTitle={levelInfo.title}
            level={levelInfo.level}
            onNavigate={onNavigate}
            className="hidden lg:block w-full"
          />
        </div>
        {/* Left Column (Character Image on Desktop/Tablet Landscape - Sticky to viewport until LevelProgressCard) */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 w-full sticky top-6 self-start items-center justify-center pointer-events-none min-w-0 overflow-hidden">
          <img
            src={getAssetUrl(`assets/characters/${gender}/proud.webp`)}
            alt="Hero Character"
            className="w-auto max-h-[calc(100vh-8rem)] object-contain object-top filter drop-shadow-2xl pointer-events-auto select-none"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallback) {
                target.dataset.fallback = '1';
                target.src = getFallbackAssetUrl(`assets/characters/${gender}/proud.webp`);
              }
            }}
          />
        </div>
      </div>

      {/* 3. Full-Width Section: Trophy Path, Level Progression, Recent Unlocks, Search/Filter, and Badges Grid */}
      <div className="space-y-8 w-full mt-8 sm:mt-10 pt-2">
        {/* Dedicated Trophy Path Card (Full width - single row of 6 medals on lg+, next cup progress below) */}
        <TrophyPathCard
          trophyInfo={trophyInfo}
        />

        {/* Level Progression Card (Full width - RTL scrolling stage medals, hollow/filled connecting rods, roadmap button) */}
        <LevelProgressCard
          levelInfo={levelInfo}
        />

        {/* Recently Unlocked Highlights (Full width) */}
        <RecentlyUnlockedList
          badges={recentlyUnlocked}
          onSelectBadge={handleSelectBadge}
        />

        {/* Filter & Search Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          {/* Top Controls: Search and Status Segmented Control */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative w-full sm:w-80 md:w-96">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نشان یا عنوان..."
                className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <span className="absolute left-3.5 top-3 text-slate-400 text-sm">
                🔍
              </span>
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto justify-center">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                همه ({formatNumber(allBadges.length, 'persian')})
              </button>

              <button
                onClick={() => setStatusFilter('unlocked')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  statusFilter === 'unlocked'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                ✓ باز شده ({formatNumber(unlockedCount, 'persian')})
              </button>

              <button
                onClick={() => setStatusFilter('locked')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  statusFilter === 'locked'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                🔒 در حال تلاش ({formatNumber(allBadges.length - unlockedCount, 'persian')})
              </button>
            </div>
          </div>

          {/* Category Horizontal Scroll Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-105'
                    : 'bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid (Full Width) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>
              نمایش {formatNumber(filteredBadges.length, 'persian')} نشان افتخار
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-indigo-600 hover:underline"
              >
                پاک کردن جستجو ✕
              </button>
            )}
          </div>

          {filteredBadges.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-4xl">🔍</span>
              <h4 className="text-base font-black text-slate-800 dark:text-slate-100">
                هیچ نشانی با این فیلترها پیدا نشد!
              </h4>
              <p className="text-xs text-slate-500">
                می‌توانی فیلترها یا عبارت جستجو را تغییر دهی تا نشان‌های دیگر را ببینی.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs"
              >
                مشاهده همه نشان‌ها
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  onClick={handleSelectBadge}
                />
              ))}
            </div>
          )}
        </div>

        {/* Grand Math Hero Supreme Milestone Banner */}
        <div
          id="grand-math-hero-milestone"
          className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-950 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-3"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-right">
              <div className="w-16 h-16 rounded-2xl bg-white/40 p-1.5 flex items-center justify-center shadow-md shrink-0">
                <img
                  src={getTrophyCupUrl(6)}
                  alt="جام الماسین قهرمان قهرمانان"
                  className="w-full h-full object-contain filter drop-shadow animate-pulse"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = '1';
                      target.src = getTrophyCupFallbackUrl(6);
                    }
                  }}
                />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-3 py-1 rounded-xl">
                  اوج شکوه و قهرمانی
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-1">
                  قله افتخار: قهرمان قهرمانان ریاضی!
                </h3>
                <p className="text-xs sm:text-sm font-bold opacity-90 mt-0.5">
                  با رسیدن به سطح ۱۵ و کسب ۱۵ نشان افتخار، تاج زرین قهرمان ریاضی را بر سر می‌گذاری!
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('quiz_setup')}
              className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-sm rounded-2xl shadow-xl transition-all shrink-0 hover:scale-105"
            >
              ادامه تمرین برای قهرمانی 🚀
            </button>
          </div>
        </div>
      </div>

      {/* 4. Badge Detail Modal */}
      <BadgeDetailModal
        badge={inspectingBadge}
        onClose={() => setInspectingBadge(null)}
      />

      {/* 5. 20 Stages Roadmap Modal */}
      <StagesRoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
        currentLevel={levelInfo.level}
      />
    </div>
  );
};

