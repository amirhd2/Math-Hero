const fs = require('fs');

const p2e = s => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
const e2p = s => s.replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

let content = fs.readFileSync('src/gamification/badgeRegistry.ts', 'utf8');

// I'll define a mapping for badge id to a desired target and description.
// Let's just reset the file from a template if needed, or simply string match for specific badges.
// Since there are only 35 badges, let's manually write replacements for the most obvious ones.

const updates = [
  { id: 'first_step', target: 3, desc: '۳ آزمون کامل کن', name: 'شروع قدرتمند', full: 'تکمیل ۳ آزمون ریاضی و شروع سفر ماجراجویی' },
  { id: 'practice_5', target: 15, desc: '۱۵ آزمون کامل کن', full: 'تکمیل ۱۵ آزمون ریاضی با اراده و پشتکار عالی' },
  { id: 'practice_15', target: 45, desc: '۴۵ آزمون کامل کن', full: 'تکمیل ۴۵ آزمون ریاضی؛ تمرین مداوم کلید موفقیت است' },
  { id: 'practice_30', target: 80, desc: '۸۰ آزمون کامل کن', full: 'تکمیل ۸۰ چالش محاسباتی؛ تو یک قهرمان واقعی هستی' },
  { id: 'practice_50', target: 150, desc: '۱۵۰ آزمون کامل کن', full: '۱۵۰ آزمون کامل شده؛ نام تو در تاریخ قهرمانان ثبت شد' },
  { id: 'first_perfect', target: 3, desc: '۳ آزمون بدون خطا کامل کن', name: 'ذهن تیزبین', full: 'کسب نمره کامل ۱۰۰٪ در ۳ آزمون بدون حتی یک اشتباه' },
  { id: 'perfect_5', target: 15, desc: '۱۵ آزمون بدون خطا کامل کن', full: '۱۵ آزمون ۱۰۰٪ بدون خطا؛ تمرکز شما فوق‌العاده است' },
  { id: 'perfect_10', target: 25, desc: '۲۵ آزمون بدون خطا کامل کن', full: '۲۵ آزمون ۱۰۰٪ بدون خطا؛ استاد بلامنازع دقت' },
  { id: 'correct_20', target: 50, desc: 'به ۵۰ سوال درست پاسخ بده', full: 'حل ۵۰ سوال به صورت صحیح' },
  { id: 'correct_100', target: 300, desc: 'به ۳۰۰ سوال درست پاسخ بده', full: 'حل ۳۰۰ سوال ریاضی؛ ماشین حساب زنده!' },
  { id: 'correct_300', target: 800, desc: 'به ۸۰۰ سوال درست پاسخ بده', full: 'حل ۸۰۰ سوال صحیح؛ تسلط در سطح المپیاد' },
  { id: 'correct_500', target: 1500, desc: 'به ۱۵۰۰ سوال درست پاسخ بده', full: 'حل ۱۵۰۰ سوال؛ رکوردی دست‌نیافتنی برای قهرمان مطلق' },
  { id: 'getting_stronger', target: 10, desc: '۱۰ آزمون پشت‌سرهم با نمره عالی ثبت کن', full: 'ثبت ۱۰ آزمون پیاپی با نمره ۱۰۰ یا رو‌به‌رشد' },
  { id: 'resolve_mistakes', target: 10, desc: '۱۰ سوال از اشتباهاتت رو حل کن', full: 'حل و یادگیری ۱۰ سوالی که قبلا اشتباه پاسخ داده بودی' },
  { id: 'add_1', target: 45, desc: '۴۵ پاسخ صحیح در جمع', full: 'ثبت ۴۵ پاسخ صحیح در چالش‌های جمع' },
  { id: 'add_master_50', target: 150, desc: '۱۵۰ پاسخ صحیح جمع', full: 'ثبت ۱۵۰ تمرین جمع با حداقل ۸۰٪ دقت' },
  { id: 'add_master_100', target: 300, desc: '۳۰۰ پاسخ صحیح جمع', full: 'ثبت ۳۰۰ تمرین جمع با بیش از ۹۰٪ دقت' },
  { id: 'sub_1', target: 45, desc: '۴۵ پاسخ صحیح در تفریق', full: 'ثبت ۴۵ پاسخ صحیح در چالش‌های تفریق' },
  { id: 'sub_master_50', target: 150, desc: '۱۵۰ پاسخ صحیح تفریق', full: 'ثبت ۱۵۰ تمرین تفریق با حداقل ۸۰٪ دقت' },
  { id: 'sub_master_100', target: 300, desc: '۳۰۰ پاسخ صحیح تفریق', full: 'ثبت ۳۰۰ تمرین تفریق با بیش از ۹۰٪ دقت' },
  { id: 'mul_1', target: 45, desc: '۴۵ پاسخ صحیح در ضرب', full: 'ثبت ۴۵ پاسخ صحیح در چالش‌های ضرب' },
  { id: 'mul_master_50', target: 150, desc: '۱۵۰ پاسخ صحیح ضرب', full: 'ثبت ۱۵۰ تمرین ضرب با حداقل ۸۰٪ دقت' },
  { id: 'mul_master_100', target: 300, desc: '۳۰۰ پاسخ صحیح ضرب', full: 'ثبت ۳۰۰ تمرین ضرب با بیش از ۹۰٪ دقت' },
  { id: 'div_1', target: 45, desc: '۴۵ پاسخ صحیح در تقسیم', full: 'ثبت ۴۵ پاسخ صحیح در چالش‌های تقسیم' },
  { id: 'div_master_50', target: 150, desc: '۱۵۰ پاسخ صحیح تقسیم', full: 'ثبت ۱۵۰ تمرین تقسیم با حداقل ۸۰٪ دقت' },
  { id: 'div_master_100', target: 300, desc: '۳۰۰ پاسخ صحیح تقسیم', full: 'ثبت ۳۰۰ تمرین تقسیم با بیش از ۹۰٪ دقت' },
  { id: 'streak_3', target: 10, desc: '۱۰ روز متوالی تمرین کن', full: 'حفظ زنجیره تمرین ریاضی برای ۱۰ روز متوالی' },
  { id: 'streak_7', target: 20, desc: '۲۰ روز متوالی تمرین کن', full: '۲۰ روز تمرین بی‌وقفه؛ نظم رمز پیروزی است' },
  { id: 'streak_14', target: 40, desc: '۴۰ روز متوالی تمرین کن', full: '۴۰ روز مداوم؛ تعهدی تزلزل‌ناپذیر به یادگیری' },
  { id: 'streak_30', target: 80, desc: '۸۰ روز متوالی تمرین کن', full: '۸۰ روز زنجیره تمرین؛ اسطوره استقامت و نظم' },
  { id: 'smart_review_1', target: 3, desc: '۳ جلسه آزمون مرور هوشمند را تمام کن', full: 'تکمیل ۳ آزمون کامل از مرور اشتباهات گذشته' },
  { id: 'smart_review_5', target: 15, desc: '۱۵ آزمون مرور هوشمند را تمام کن', full: 'تکمیل ۱۵ جلسه آزمون از سیستم پیشنهاد هوشمند جغد دانا' },
  { id: 'smart_review_15', target: 45, desc: '۴۵ جلسه مرور هوشمند را تمام کن', full: 'تکمیل ۴۵ جلسه هدفمند برای رفع اشکالات آموزشی' },
  { id: 'level_5', target: 15, desc: 'به سطح ۱۵ قهرمانی برس', full: 'کسب سطح ۱۵ از طریق تمرین و ارتقاء مهارت' },
  { id: 'level_10', target: 25, desc: 'به سطح ۲۵ قهرمانی برس', full: 'صعود به سطح ۲۵؛ اثبات نبوغ و تسلط همه جانبه' }
];

let res = content;

// Replace all occurrences based on ID using block parsing
updates.forEach(upd => {
  const regex = new RegExp(`(id:\\s*'${upd.id}'[^\\}]+?description:\\s*')[^']+(',[^\\}]+?requirement:\\s*\\{[^\\}]+?descriptionFa:\\s*')[^']+(')`, 's');
  res = res.replace(regex, (match, p1, p2, p3) => {
    return `${p1}${upd.full}${p2}${upd.desc}${p3}`;
  });
});

fs.writeFileSync('src/gamification/badgeRegistry.ts', res);
