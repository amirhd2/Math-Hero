/**
 * Streak Manager for Math Hero.
 * Tracks daily practice consistency using local calendar dates.
 * Child-friendly: missed days reset the current streak gently without shame,
 * while the child's all-time best streak is celebrated and preserved forever.
 */

/**
 * Returns formatted calendar date string (YYYY-MM-DD) in user's local timezone.
 */
export function getLocalCalendarDate(timestamp: number = Date.now()): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates calendar day difference between two YYYY-MM-DD dates.
 */
export function getDayDifference(dateStr1: string, dateStr2: string): number {
  try {
    const d1 = new Date(dateStr1 + 'T00:00:00');
    const d2 = new Date(dateStr2 + 'T00:00:00');
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export interface StreakEvaluationResult {
  currentStreak: number;
  bestStreak: number;
  isFirstActivityToday: boolean;
  streakIncremented: boolean;
}

/**
 * Evaluates streak status on completed session.
 */
export function evaluateStreak(
  lastActivityDate: string | null,
  currentStreak: number,
  bestStreak: number,
  currentTimestamp: number = Date.now()
): StreakEvaluationResult {
  const todayStr = getLocalCalendarDate(currentTimestamp);

  if (!lastActivityDate) {
    // Brand new user / first ever practice
    return {
      currentStreak: 1,
      bestStreak: Math.max(1, bestStreak),
      isFirstActivityToday: true,
      streakIncremented: true,
    };
  }

  if (lastActivityDate === todayStr) {
    // Child already practiced earlier today
    return {
      currentStreak: Math.max(1, currentStreak),
      bestStreak: Math.max(currentStreak, bestStreak),
      isFirstActivityToday: false,
      streakIncremented: false,
    };
  }

  const daysDiff = getDayDifference(lastActivityDate, todayStr);

  if (daysDiff === 1) {
    // Practiced yesterday! Streak continues!
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      bestStreak: Math.max(newStreak, bestStreak),
      isFirstActivityToday: true,
      streakIncremented: true,
    };
  }

  // More than 1 day missed: gently start a new streak with today's practice
  // All-time best streak is safely preserved!
  return {
    currentStreak: 1,
    bestStreak: Math.max(1, bestStreak),
    isFirstActivityToday: true,
    streakIncremented: true,
  };
}
