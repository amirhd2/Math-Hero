export type CharacterGender = 'boy' | 'girl';
export type Gender = CharacterGender;

export type CharacterPose = 
  | 'master' 
  | 'thinking' 
  | 'celebrating' 
  | 'greeting' 
  | 'encouraging' 
  | 'sad';

export type AssetId =
  | 'boy-master'
  | 'girl-master'
  | 'boy-thinking'
  | 'girl-thinking'
  | 'boy-celebrating'
  | 'girl-celebrating'
  | 'boy-encouraging'
  | 'girl-encouraging'
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'badge-level-1'
  | 'badge-level-2'
  | 'badge-level-3'
  | 'trophy'
  | 'star';

export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';

export type QuizMode = 'practice' | 'test';

export interface AdditionConfig {
  operand1Digits: number; // 1 to 4 digits
  operand2Digits: number; // 1 to 4 digits
}

export interface SubtractionConfig {
  operand1Digits: number; // 1 to 4 digits
  operand2Digits: number; // 1 to 4 digits
  allowNegative: boolean; // default false for elementary learners
}

export interface MultiplicationConfig {
  mode: 'free' | 'table';
  operand1Digits: number; // for free mode
  operand2Digits: number; // for free mode
  tableNumber: number; // for table mode (e.g. 2 through 12)
}

export interface DivisionConfig {
  mode: 'free' | 'table';
  dividendDigits: number; // for free mode
  divisorDigits: number; // for free mode
  tableNumber: number; // for inverse multiplication table division (e.g. 2 through 12)
  allowRemainder: boolean; // default false for clean integer division
}

export interface OperationSettings {
  addition: AdditionConfig;
  subtraction: SubtractionConfig;
  multiplication: MultiplicationConfig;
  division: DivisionConfig;
}

export interface QuizConfiguration {
  id?: string;
  title?: string;
  mode: QuizMode;
  questionCount: number;
  selectedOperations: OperationType[];
  operationSettings: OperationSettings;
  distribution: Record<OperationType, number>;
  smartReviewEnabled: boolean;
  isAdaptive?: boolean;
  adaptiveSkillTier?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface TestPattern {
  id: string;
  title: string;
  description?: string;
  icon: string;
  config: QuizConfiguration;
  isCustom?: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface QuizQuestionResponse {
  questionId: string;
  userAnswer: number;
  isCorrect: boolean;
  attemptsCount: number;
  timeSpentMs: number;
  revealedInPractice?: boolean;
}

export interface QuizSession {
  id: string;
  config: QuizConfiguration;
  mode: QuizMode;
  totalQuestions: number;
  currentIndex: number;
  questions: QuizQuestion[];
  currentQuestion: QuizQuestion;
  answers: Record<number, number | string>;
  attempts: Record<number, number>;
  correctAnswers: number;
  incorrectAnswers: number;
  responseTimes: Record<number, number>; // question index -> milliseconds spent
  questionResponses: Record<number, QuizQuestionResponse>;
  startedAt: number;
  completedAt?: number;
  isCompleted: boolean;
  xpEarned: number;
  startTime?: number;
  endTime?: number;
  isParentOverride?: boolean;
  source?:
    | 'normal'
    | 'child-quick-start'
    | 'child-combined'
    | 'smart-review'
    | 'mistakes-practice'
    | 'retry'
    | 'parent-manual'
    | 'test-pattern'
    | string;
  smartReviewMetadata?: {
    targetedSkills?: string[];
    targetOperations?: OperationType[];
    insightFa?: string;
    preReviewAccuracy?: number;
  };
  adaptiveMetadata?: {
    targetTier?: number;
    operation?: OperationType;
    isAdaptive?: boolean;
    isGrindingMasteredTier?: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  gender: CharacterGender;
  age: number;
  avatarId: string;
  xp: number;
  level: number;
  coins: number;
  streakDays: number;
  createdAt: number;
  onboardingCompleted?: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'fa' | 'en';
  numberFormat: 'persian' | 'english';

  soundEnabled: boolean;
  hapticsEnabled: boolean;
  celebrationSoundEnabled: boolean;
  quizFeedbackEnabled: boolean;

  autoOpenKeyboard: boolean;
  autoFocusAnswer: boolean;
  showQuizCharacter: boolean;
  confirmExitQuiz: boolean;

  // Optional legacy compatibility
  musicEnabled?: boolean;
  highContrast?: boolean;
  reducedMotion?: boolean;
}

export interface QuizPreset {
  id: string;
  title: string;
  operation: OperationType;
  questionCount: number;
  timeLimitPerQuestion?: number; // seconds
  minNumber: number;
  maxNumber: number;
  icon: string;
}

export interface QuizQuestion {
  id: string;
  num1: number;
  num2: number;
  operation: OperationType;
  correctAnswer: number;
  operatorSymbol?: string;
  remainder?: number;
  options?: number[]; // for multiple choice if used
}

export interface QuizOperationStat {
  operation: OperationType;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  timeSpentMs?: number;
  accuracy: number;
}

export interface QuizResult {
  id: string;
  timestamp: number;
  mode?: QuizMode;
  operation: OperationType;
  operations?: OperationType[];
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  score: number;
  xpEarned: number;
  timeElapsed: number; // seconds
  presetId?: string;
  config?: QuizConfiguration;
  levelBefore?: number;
  levelAfter?: number;
  leveledUp?: boolean;
  unlockedAchievements?: Achievement[];
  mistakes?: MistakeRecord[];
  questions?: QuizQuestion[];
  questionResponses?: Record<number, QuizQuestionResponse>;
  operationBreakdown?: Partial<Record<OperationType, QuizOperationStat>>;
  source?:
    | 'normal'
    | 'child-quick-start'
    | 'child-combined'
    | 'smart-review'
    | 'mistakes-practice'
    | 'retry'
    | 'parent-manual'
    | 'test-pattern'
    | string;
  smartReviewMetadata?: {
    targetedSkills?: string[];
    targetOperations?: OperationType[];
    insightFa?: string;
    preReviewAccuracy?: number;
    postReviewAccuracy?: number;
    accuracyDelta?: number;
  };
  adaptiveMetadata?: {
    targetTier?: number;
    operation?: OperationType;
    isAdaptive?: boolean;
    isGrindingMasteredTier?: boolean;
  };
}

export interface MistakeRecord {
  id: string;
  timestamp: number;
  question: QuizQuestion;
  userAnswer: number;
  resolved: boolean;
  questionNumber?: number;
  attempts?: number;
  responseTimeMs?: number;
  mode?: QuizMode;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: number;
}

export type ScreenId =
  | 'home'
  | 'onboarding'
  | 'profile'
  | 'quiz_setup'
  | 'quiz_active'
  | 'quiz_results'
  | 'mistakes'
  | 'progress'
  | 'achievements'
  | 'presets'
  | 'settings'
  | 'parent_dashboard';

export type AppMode = 'child' | 'parent';
