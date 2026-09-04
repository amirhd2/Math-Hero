/**
 * Centralized Internationalization (i18n) dictionary and utilities for Math Hero.
 * Supports Persian (fa - Default RTL) and English (en - LTR).
 */

export type LanguageCode = 'fa' | 'en';

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  fa: {
    // Navigation & Common
    app_name: 'قهرمان ریاضی',
    app_subtitle: 'پلتفرم آموزشی و بازی‌وارسازی ریاضی برای کودکان',
    back_to_home: 'بازگشت به خانه',
    back: 'بازگشت',
    save: 'ذخیره',
    cancel: 'انصراف',
    confirm: 'تأیید',
    delete: 'حذف',
    edit: 'ویرایش',
    close: 'بستن',
    status: 'وضعیت',
    level: 'سطح',
    xp: 'امتیاز',
    streak: 'روزهای متوالی',
    coins: 'سکه',

    // Settings Header
    settings_title: 'تنظیمات برنامه',
    settings_subtitle: 'شخصی‌سازی ظاهر، زبان، صدا، یادگیری و مدیریت داده‌ها',

    // 1. Appearance
    appearance_title: 'حالت نمایش و تم',
    appearance_desc: 'انتخاب تم هماهنگ با سیستم، روشن یا تاریک برای راحتی چشم',
    theme_system: 'هماهنگ با سیستم',
    theme_light: 'روشن ☀️',
    theme_dark: 'تاریک 🌙',
    theme_note: 'حالت انتخاب شده بلافاصله بر نوار وضعیت دستگاه، PWA و کل صفحات اعمال می‌شود.',

    // 2. Language & Numbers
    lang_num_title: 'زبان و فرمت ارقام',
    lang_num_desc: 'تنظیم زبان رابط کاربری و نحوه نمایش ارقام در تمام بخش‌ها',
    language_label: 'زبان برنامه',
    numeral_style_label: 'فرمت نمایش اعداد',
    lang_fa: 'فارسی (FA)',
    lang_en: 'English (EN)',
    num_persian: 'ارقام فارسی (۰-۹)',
    num_english: 'ارقام انگلیسی (0-9)',
    num_preview_desc: 'این تغییر بلافاصله بر سوالات، نتایج، آمار، امتیازها و دکمه‌ها اعمال می‌شود.',

    // 3. Sound & Feedback
    sound_title: 'صدا و لرزش (بازخورد)',
    sound_desc: 'کنترل افکت‌های صوتی هوشمند، نواخت پیروزی و لرزش لمسی',
    sound_effects: 'افکت‌های صوتی کلی',
    sound_effects_desc: 'پخش صدا هنگام لمس دکمه‌ها و تعامل با برنامه',
    haptics: 'لرزش لمسی (Haptics)',
    haptics_desc: 'لرزش کوتاه هنگام پاسخ‌دهی (در دستگاه‌های پشتیبانی‌کننده)',
    celebration_sounds: 'آهنگ پیروزی و تشویق',
    celebration_sounds_desc: 'پخش شیپور و مارش پیروزی هنگام اتمام آزمون و ارتقای سطح',
    quiz_feedback_sounds: 'صدای پاسخ‌های آزمون',
    quiz_feedback_sounds_desc: 'صدای دینگ پاسخ درست و آوای ملایم تلاش دوباره',
    test_sound_btn: 'تست صدای تشویقی',

    // 4. Quiz & Learning
    quiz_learning_title: 'تنظیمات آزمون و یادگیری',
    quiz_learning_desc: 'ترجیحات عمومی یادگیری و رفتار هوشمند کادر پاسخ',
    auto_open_keyboard: 'باز شدن خودکار کیبورد عددی',
    auto_open_keyboard_desc: 'آماده‌سازی فوری صفحه کلید هنگام آغاز هر سوال',
    auto_focus_answer: 'تمرکز خودکار روی کادر پاسخ',
    auto_focus_answer_desc: 'فعال نگه داشتن نشانگر درون فیلد جواب بین سوالات',
    show_character: 'نمایش کاراکتر همراه قهرمان',
    show_character_desc: 'حضور کاراکتر انیمیشنی در گوشه کارت سوال برای تشویق و راهنمایی',
    confirm_exit_quiz: 'تأیید قبل از خروج از آزمون فعال',
    confirm_exit_quiz_desc: 'حفاظت در برابر بستن یا سوایپ ناخواسته هنگام حل سوالات',

    // 5. Test Patterns
    patterns_title: 'الگوهای آزمون (شخصی‌سازی)',
    patterns_desc: 'مدیریت و دسترسی سریع به الگوهای آماده و آزمون‌های اختصاصی',
    patterns_count_label: 'الگوی آزمون فعال و آماده شروع',
    open_patterns_btn: 'ورود به بخش الگوهای آزمون 📋',

    // 6. Data & Backup
    data_backup_title: 'پشتیبان‌گیری و مدیریت داده‌ها',
    data_backup_desc: 'تولید نسخه پشتیبان کامل (JSON)، بازیابی ایمن و حفظ پیشرفت‌ها',
    data_summary_title: 'خلاصه داده‌های ذخیره‌شده روی این دستگاه:',
    backup_create_btn: 'ایجاد و دانلود فایل پشتیبان کامل (JSON) 💾',
    backup_restore_btn: 'بازیابی اطلاعات از فایل پشتیبان 📥',
    export_history_btn: 'خروجی سوابق آزمون‌ها (CSV)',
    export_stats_btn: 'خروجی پرونده یادگیری (JSON)',
    reset_data_btn: 'حذف کامل داده‌ها و شروع مجدد ⚠️',

    // 7. App Management
    app_management_title: 'مدیریت و وضعیت برنامه',
    app_management_desc: 'اطلاعات نسخه، وضعیت آفلاین، نصب PWA و پاکسازی حافظه موقت',
    version_label: 'نسخه فعلی برنامه:',
    offline_status_online: 'دستگاه متصل است (آنلاین) 🟢',
    offline_status_offline: 'حالت آفلاین پایدار (بدون اینترنت) 🟠',
    offline_explanation: 'قهرمان ریاضی به صورت ۱۰۰٪ آفلاین‌فرست طراحی شده و تمامی بخش‌ها، آمارها و بازی‌وارسازی بدون اینترنت کار می‌کنند.',
    install_pwa_btn: 'نصب قهرمان ریاضی روی دستگاه 📲',
    pwa_installed_badge: 'وب‌اپلیکیشن مستقل (PWA) نصب شده است ✓',
    ios_install_title: 'راهنمای نصب در آیفون و آیپد (iOS Safari):',
    ios_install_step1: '۱. روی دکمه Share (اشتراک‌گذاری) در نوار ابزار سافاری بزنید.',
    ios_install_step2: '۲. به پایین اسکرول کرده و گزینه «Add to Home Screen» (افزودن به صفحه اصلی) را انتخاب کنید.',
    clear_cache_btn: 'پاکسازی حافظه موقت (کَش) 🧹',
    clear_cache_desc: 'فایل‌های موقت اینترنتی را بدون دست زدن به اطلاعات کاربر پاک می‌کند.',
    reload_app_btn: 'بارگذاری مجدد برنامه 🔄',

    // 8. About Math Hero
    about_title: 'درباره قهرمان ریاضی',
    about_desc: 'آشنایی با اهداف آموزشی، امنیت کودکان و فناوری‌های به کار رفته',
    about_body: 'قهرمان ریاضی (Math Hero) یک محیط آموزشی پویا، تشویقی و بازی‌وارسازی شده برای کودکان است تا مفاهیم پایه‌ای ریاضی (جمع، تفریق، جدول ضرب و تقسیم) را با لذت، بدون استرس و با تکیه بر تشویق و بازخورد مثبت فرا بگیرند.',
    about_privacy: 'حریم خصوصی کودکان: تمامی اطلاعات به صورت کاملاً محلی روی همین دستگاه ذخیره شده و هیچ‌گونه ردیاب یا تبلیغاتی در برنامه وجود ندارد.',
    about_tech: 'فناوری‌ها: React 19، Tailwind CSS، IndexedDB محلی، Web Audio API و سازگار با معماری استاندارد PWA.',

    // 9. Latest Changes
    changelog_title: 'آخرین تغییرات و به‌روزرسانی‌ها',
    changelog_desc: 'گزارش تغییرات و امکانات اضافه شده در هر نسخه',
  },

  en: {
    // Navigation & Common
    app_name: 'Math Hero',
    app_subtitle: 'Educational gamified math learning platform for kids',
    back_to_home: 'Back to Home',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    status: 'Status',
    level: 'Level',
    xp: 'XP Points',
    streak: 'Daily Streak',
    coins: 'Coins',

    // Settings Header
    settings_title: 'App Settings',
    settings_subtitle: 'Personalize appearance, language, audio, learning, and data backup',

    // 1. Appearance
    appearance_title: 'Appearance & Theme',
    appearance_desc: 'Choose system default, light, or dark theme for eye comfort',
    theme_system: 'System Default',
    theme_light: 'Light ☀️',
    theme_dark: 'Dark 🌙',
    theme_note: 'Selected theme immediately adapts status bar, PWA, and all views.',

    // 2. Language & Numbers
    lang_num_title: 'Language & Numerals',
    lang_num_desc: 'Select UI language and number display format across the entire app',
    language_label: 'Application Language',
    numeral_style_label: 'Numeral Format',
    lang_fa: 'فارسی (FA)',
    lang_en: 'English (EN)',
    num_persian: 'Persian Numerals (۰-۹)',
    num_english: 'English Numerals (0-9)',
    num_preview_desc: 'Applies instantly to questions, scores, XP, statistics, and results.',

    // 3. Sound & Feedback
    sound_title: 'Audio & Haptic Feedback',
    sound_desc: 'Control friendly sound synthesis, fanfares, and haptic vibration',
    sound_effects: 'Master Sound Effects',
    sound_effects_desc: 'Play sounds on button taps and interactions',
    haptics: 'Haptic Feedback (Vibration)',
    haptics_desc: 'Gentle vibration response on answers (supported devices)',
    celebration_sounds: 'Celebration & Fanfare',
    celebration_sounds_desc: 'Play level-up fanfares and completion jingles',
    quiz_feedback_sounds: 'Quiz Answer Feedback',
    quiz_feedback_sounds_desc: 'Positive ding for correct answers and soft encouraging prompts',
    test_sound_btn: 'Test Audio Chime',

    // 4. Quiz & Learning
    quiz_learning_title: 'Quiz & Learning Preferences',
    quiz_learning_desc: 'Global learning preferences and answer input behavior',
    auto_open_keyboard: 'Auto-Open Numeric Keypad',
    auto_open_keyboard_desc: 'Instantly prepare input keyboard when each question appears',
    auto_focus_answer: 'Persistent Focus on Answer Field',
    auto_focus_answer_desc: 'Maintain cursor inside answer box across card transitions',
    show_character: 'Show Companion Character',
    show_character_desc: 'Display animated hero in the corner for gentle hints and encouragement',
    confirm_exit_quiz: 'Confirm Before Leaving Active Quiz',
    confirm_exit_quiz_desc: 'Prevent accidental navigation or gesture back during an active test',

    // 5. Test Patterns
    patterns_title: 'Test Patterns & Presets',
    patterns_desc: 'Quick access and management of custom quiz configurations',
    patterns_count_label: 'active test patterns ready to start',
    open_patterns_btn: 'Open Test Patterns 📋',

    // 6. Data & Backup
    data_backup_title: 'Data & Backup Management',
    data_backup_desc: 'Create full JSON backups, restore securely, and preserve progress',
    data_summary_title: 'Data stored locally on this device:',
    backup_create_btn: 'Create & Download Full Backup (JSON) 💾',
    backup_restore_btn: 'Restore from Backup File 📥',
    export_history_btn: 'Export Quiz History (CSV)',
    export_stats_btn: 'Export Learning Portfolio (JSON)',
    reset_data_btn: 'Reset All Data & Start Fresh ⚠️',

    // 7. App Management
    app_management_title: 'App & Device Management',
    app_management_desc: 'Version details, offline availability, PWA installation & cache',
    version_label: 'Current Version:',
    offline_status_online: 'Device is Online 🟢',
    offline_status_offline: 'Offline Mode (No Internet) 🟠',
    offline_explanation: 'Math Hero is 100% offline-first. All quizzes, statistics, and gamification operate without network connection.',
    install_pwa_btn: 'Install Math Hero App 📲',
    pwa_installed_badge: 'Installed as Standalone PWA ✓',
    ios_install_title: 'How to install on iPhone & iPad (Safari):',
    ios_install_step1: '1. Tap the Share button in Safari toolbar.',
    ios_install_step2: '2. Scroll down and select "Add to Home Screen".',
    clear_cache_btn: 'Clear Temporary Cache 🧹',
    clear_cache_desc: 'Clears temporary network assets without touching any user data.',
    reload_app_btn: 'Reload Application 🔄',

    // 8. About Math Hero
    about_title: 'About Math Hero',
    about_desc: 'Educational goals, child safety, and technology overview',
    about_body: 'Math Hero is an encouraging, child-friendly educational platform designed to help elementary students master addition, subtraction, multiplication tables, and division through positive gamification, gentle practice, and confidence building.',
    about_privacy: 'Child Privacy: All data is stored 100% locally on your device. No trackers, ads, or external data harvesting.',
    about_tech: 'Built with React 19, Tailwind CSS, Local IndexedDB, Web Audio API, and modern PWA standards.',

    // 9. Latest Changes
    changelog_title: 'Latest Changes & Updates',
    changelog_desc: 'Release history and newly added capabilities',
  },
};

/**
 * Helper to retrieve translated string.
 */
export function t(key: string, lang: LanguageCode = 'fa'): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.fa;
  return dict[key] || TRANSLATIONS.fa[key] || key;
}

/**
 * Structured Changelog for the "Latest Changes" accordion.
 */
export interface ChangelogEntry {
  version: string;
  dateFa: string;
  dateEn: string;
  highlightsFa: string[];
  highlightsEn: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: 'v1.0.0',
    dateFa: 'شهریور ۱۴۰۵',
    dateEn: 'September 2026',
    highlightsFa: [
      'پیاده‌سازی پنل تنظیمات جامع با ساختار آکاردئونی روان و پاسخ‌گو',
      'سیستم پشتیبان‌گیری و بازیابی کامل (Full JSON Backup) با اعتبارسنجی و ترکیب هوشمند',
      'مدیریت حافظه موقت و وضعیت آفلاین بدون دستکاری داده‌های کاربر',
      'پشتیبانی کامل از تم‌های روشن، تاریک و هماهنگ با سیستم همراه با نوار وضعیت',
      'پشتیبانی دو زبانه (فارسی و انگلیسی) و ارقام فارسی / انگلیسی',
    ],
    highlightsEn: [
      'Comprehensive Settings screen with responsive accordion architecture',
      'Full JSON Backup & Restore with validation and smart merge strategies',
      'Temporary cache management and offline indicator preserving user data',
      'Light, Dark, and System theme synchronizing with mobile status bar',
      'Bilingual support (Persian & English) with localized numeral formatting',
    ],
  },
  {
    version: 'v0.9.0',
    dateFa: 'مرداد ۱۴۰۵',
    dateEn: 'August 2026',
    highlightsFa: [
      'سیستم بازبینی هوشمند (Smart Review) برای تمرین روی مهارت‌های نیازمند تقویت',
      'بهینه‌سازی انیمیشن سه‌بعدی کنده شدن تقویمی کارت‌های آزمون',
      'تالار افتخارات و جام متحرک قهرمان با مراحل تکاملی',
      'موتور گیمیفیکیشن متمرکز و پاداش‌دهی به تلاش و پیشرفت',
    ],
    highlightsEn: [
      'Adaptive Smart Review engine targeting high-yield reinforcement skills',
      'Smoothed calendar tear-off 3D card transition animations',
      'Hall of Achievements with dynamic transforming champion trophy',
      'Centralized gamification engine rewarding effort and growth',
    ],
  },
  {
    version: 'v0.8.0',
    dateFa: 'تیر ۱۴۰۵',
    dateEn: 'July 2026',
    highlightsFa: [
      'کارنامه تحلیلی پیشرفت و نمودارهای عملکرد ۴ عمل اصلی',
      'دفترچه اشتباهات هوشمند برای مرور و حل دوباره سوالات بدون نمره منفی',
      'الگوهای آزمون آماده برای پایه‌های مختلف دبستان',
    ],
    highlightsEn: [
      'Analytics progress screen with 4 operations mastery charts',
      'Smart mistakes journal for stress-free review without penalties',
      'Pre-built test patterns tailored for elementary math curricula',
    ],
  },
  {
    version: 'v0.7.0',
    dateFa: 'خرداد ۱۴۰۵',
    dateEn: 'June 2026',
    highlightsFa: [
      'موتور آزمون تعاملی با صفحه کلید مجازی سریع',
      'پشتیبانی از حالت‌های تمرینی و آزمونی با محدودیت زمان دلخواه',
      'حفاظت خروج ناخواسته در حین آزمون فعال',
    ],
    highlightsEn: [
      'Interactive quiz engine with rapid virtual numeric pad',
      'Support for Practice and Test modes with optional time limits',
      'Active quiz navigation guard preventing accidental progress loss',
    ],
  },
];
