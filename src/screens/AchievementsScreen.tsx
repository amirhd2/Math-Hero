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
import { getAssetUrl, getFallbackAssetUrl } from '../utils/assetPaths';

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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allBadges.length };
    allBadges.forEach((b) => {
      counts[b.category] = (counts[b.category] || 0) + 1;
    });
    return counts;
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

        {/* Filter & Search Card */}
        <div
          id="achievements-filter-card"
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-5"
        >
          {/* Top Header: Title, Matched Count, and Reset Filters */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black shadow-inner">
                🎯
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  گنجینه نشان‌های افتخار
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  نمایش {formatNumber(filteredBadges.length, 'persian')} از {formatNumber(allBadges.length, 'persian')} نشان
                </p>
              </div>
            </div>

            {/* Clear Filters Button (Visible only when filters are active) */}
            {(searchQuery || selectedCategory !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setStatusFilter('all');
                }}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
              >
                <span>✕</span>
                <span>پاک کردن فیلترها</span>
              </button>
            )}
          </div>

          {/* Primary Controls Row: Search Input & Status Filter */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 items-center">
            {/* Search Input Box */}
            <div className="col-span-1 md:col-span-6 lg:col-span-7 relative">
              <div className="relative flex items-center">
                <span className="absolute right-3.5 text-slate-400 text-base pointer-events-none select-none">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجوی نام نشان، مهارت یا شرایط دریافت..."
                  className="w-full pr-10 pl-10 py-2.5 sm:py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center text-xs transition-colors cursor-pointer"
                    title="پاک کردن متن جستجو"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Status Segmented Control */}
            <div className="col-span-1 md:col-span-6 lg:col-span-5 flex items-center bg-slate-100/90 dark:bg-slate-950/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>همه</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800">
                  {formatNumber(allBadges.length, 'persian')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('unlocked')}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  statusFilter === 'unlocked'
                    ? 'bg-white dark:bg-slate-850 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>✓ باز شده</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  {formatNumber(unlockedCount, 'persian')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('locked')}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  statusFilter === 'locked'
                    ? 'bg-white dark:bg-slate-850 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>🔒 در انتظار</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100/70 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                  {formatNumber(allBadges.length - unlockedCount, 'persian')}
                </span>
              </button>
            </div>
          </div>

          {/* Categories Pill Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 px-1">
              <span>دسته‌بندی موضوعی نشان‌ها:</span>
              <span className="sm:hidden text-[10px]">قابلیت اسکرول افقی ⟵</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-slate-700 select-none flex-nowrap sm:flex-wrap">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] ?? 0;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 sm:gap-2 border shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/25 scale-[1.03]'
                        : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-300 shadow-xs'
                    }`}
                  >
                    <span className="text-sm leading-none">{cat.icon}</span>
                    <span>{cat.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {formatNumber(count, 'persian')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Badges Grid (Full Width) */}
        <div className="space-y-4">

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

