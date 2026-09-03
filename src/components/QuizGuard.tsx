/**
 * QuizGuard component to manage controlled navigation during active quiz sessions.
 */

import React, { useEffect } from 'react';

interface QuizGuardProps {
  isActive: boolean;
  onAttemptExit: () => void;
}

export const QuizGuard: React.FC<QuizGuardProps> = ({ isActive, onAttemptExit }) => {
  useEffect(() => {
    if (!isActive) return;

    // Push history state to intercept back button
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      onAttemptExit();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isActive, onAttemptExit]);

  return null;
};
