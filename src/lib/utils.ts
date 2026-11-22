import type {
  CardValidationResult,
  CourseLevel,
  CourseMode,
  EnrollmentStatus,
  LessonType,
  PackageOption,
  PackageTier,
  PaymentStatus,
  Role,
  ScheduleSlot,
  TeachingMode,
  UserStatus,
} from '../types'

/* ------------------------------------------------------------------ */
/* class helper                                                        */
/* ------------------------------------------------------------------ */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`
}

export function slugify(text: string): string {
  const map: Record<string, string> = {
    ə: 'e', ı: 'i', ö: 'o', ü: 'u', ç: 'c', ş: 's', ğ: 'g', İ: 'i', Ə: 'e',
    Ö: 'o', Ü: 'u', Ç: 'c', Ş: 's', Ğ: 'g',
  }
  return text
    .split('')
    .map((c) => map[c] ?? c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function percent(part: number, total: number): number {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

/* ------------------------------------------------------------------ */
/* labels (Azərbaycan dili)                                            */
/* ------------------------------------------------------------------ */
export const ROLE_LABEL: Record<Role, string> = {
  student: 'Tələbə',
  teacher: 'Müəllim',
  admin: 'Administrator',
}

export const LEVEL_LABEL: Record<CourseLevel, string> = {
  baslangic: 'Başlanğıc',
  orta: 'Orta',
  pesekar: 'Peşəkar',
}

export const MODE_LABEL: Record<CourseMode, string> = {
  online: 'Onlayn',
  offline: 'Oflayn',
  hybrid: 'Hibrid',
}

export const SLOT_LABEL: Record<ScheduleSlot, string> = {
  seher: 'Səhər (09:00 – 12:00)',
  gunorta: 'Günorta (13:00 – 16:00)',
  axsam: 'Axşam (18:00 – 21:00)',
  heftesonu: 'Həftəsonu (10:00 – 14:00)',
}

export const SLOT_SHORT: Record<ScheduleSlot, string> = {
  seher: 'Səhər',
  gunorta: 'Günorta',
  axsam: 'Axşam',
  heftesonu: 'Həftəsonu',
}

export const ENROLLMENT_STATUS_LABEL: Record<EnrollmentStatus, string> = {
  pending: 'Gözləmədə',
  active: 'Aktiv',
  completed: 'Tamamlandı',
  cancelled: 'Ləğv edildi',
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'Gözləmədə',
  paid: 'Ödənilib',
  failed: 'Uğursuz',
  refunded: 'Geri qaytarılıb',
}

export const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  video: 'Video dərs',
  live: 'Canlı dərs',
  project: 'Layihə',
  quiz: 'Test',
}

export const TEACHING_LABEL: Record<TeachingMode, string> = {
  group: 'Qrup tədrisi',
  individual: 'Fərdi tədris',
}

export const TEACHING_DESC: Record<TeachingMode, string> = {
  group: '8-12 nəfərlik qrupda birlikdə təhsil',
  individual: 'Yalnız sizinlə müəllim — fərdi proqram',
}

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: 'Aktiv',
  blocked: 'Bloklanmış',
  pending: 'Təsdiq gözləyir',
  rejected: 'Rədd edildi',
}

export const WEEKDAYS: { value: number; short: string; label: string }[] = [
  { value: 1, short: 'B.e', label: 'Bazar ertəsi' },
  { value: 2, short: 'Ç.a', label: 'Çərşənbə axşamı' },
  { value: 3, short: 'Ç', label: 'Çərşənbə' },
  { value: 4, short: 'C.a', label: 'Cümə axşamı' },
  { value: 5, short: 'C', label: 'Cümə' },
  { value: 6, short: 'Ş', label: 'Şənbə' },
  { value: 7, short: 'B', label: 'Bazar' },
]

export function dayLabel(value: number): string {
  return WEEKDAYS.find((d) => d.value === value)?.short ?? '—'
}

export const CAMPUSES = [
  'Bakı — Nizami filialı',
  'Bakı — Yasamal filialı',
  'Sumqayıt filialı',
  'Gəncə filialı',
]

/* ------------------------------------------------------------------ */
/* formatters                                                          */
/* ------------------------------------------------------------------ */
export function formatAZN(value: number): string {
  const rounded = Math.round(value)
  return `${rounded.toLocaleString('ru-RU').replace(/\u00a0/g, ' ')} ₼`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const months = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr',
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${formatDate(iso)}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function todayISO(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'indi'
  if (mins < 60) return `${mins} dəq əvvəl`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} saat əvvəl`
  const days = Math.round(hours / 24)
  if (days < 31) return `${days} gün əvvəl`
  return formatDate(iso)
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase()
}

export function avatarGradient(seed: string): string {
  const palette = [
    'from-brand-500 to-accent-400',
    'from-neon-500 to-brand-400',
    'from-emerald-400 to-accent-500',
    'from-amber-400 to-rose-500',
    'from-rose-500 to-neon-500',
    'from-sky-400 to-brand-600',
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 997
  return palette[hash % palette.length]
}

/* ------------------------------------------------------------------ */
/* youtube                                                             */
/* ------------------------------------------------------------------ */
export function youtubeEmbed(id: string): string {
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
}

export function youtubeThumb(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

export function youtubeUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`
}

/* ------------------------------------------------------------------ */
/* generated imagery                                                   */
/* ------------------------------------------------------------------ */
export function generatedImage(prompt: string, size: string): string {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${size}`
}

export function courseCover(prompt: string): string {
  return generatedImage(
    `${prompt}, dark navy tech illustration, glowing indigo and cyan neon accents, clean modern flat 3d style, professional edtech course cover, no text, ultra detailed, cinematic lighting`,
    'landscape_16_9',
  )
}

/* ------------------------------------------------------------------ */
/* pricing                                                             */
/* ------------------------------------------------------------------ */
export const PACKAGES: PackageOption[] = [
  {
    tier: 'start',
    name: 'Start',
    multiplier: 1,
    tagline: 'Özünü sınamaq üçün ideal başlanğıc',
    features: [
      'Qrup dərsləri (12 nəfərə qədər)',
      'Bütün video dərslərə giriş',
      'Həftəlik ev tapşırıqları',
      'Kurs materialları (PDF)',
      'Kursun sonunda sertifikat',
    ],
    highlight: false,
  },
  {
    tier: 'pro',
    name: 'Pro',
    multiplier: 1.35,
    tagline: 'Ən çox seçilən paket — praktika gücləndirilir',
    features: [
      'Start paketinin hər şeyi',
      'Kiçik qrup (6 nəfərə qədər)',
      'Ayda 4 ədəd fərdi mentor seansı',
      'Real layihələr + portfolio dəstəyi',
      'CV və LinkedIn hazırlanması',
      'Prioritet dəstək (24 saat)',
    ],
    highlight: true,
  },
  {
    tier: 'elite',
    name: 'Elite',
    multiplier: 1.85,
    tagline: 'İşə düzəlməyə fokuslanan tam paket',
    features: [
      'Pro paketin hər şeyi',
      'Fərdi dərslər (1-on-1)',
      'Həftədə 2 ədəd birebir mentor seansı',
      'Rəsmi internship (2 ay)',
      'İş yerinə yerləşdirilmə dəstəyi',
      'Şirkət müsahibələrinə hazırlıq',
      'Ömürlük məzun icmasına giriş',
    ],
    highlight: false,
  },
]

export function packagePrice(basePrice: number, tier: PackageTier): number {
  const pkg = PACKAGES.find((p) => p.tier === tier)
  return Math.round(basePrice * (pkg?.multiplier ?? 1))
}

export function packageOf(tier: PackageTier): PackageOption {
  return PACKAGES.find((p) => p.tier === tier) ?? PACKAGES[0]
}

/* ------------------------------------------------------------------ */
/* scheduling                                                          */
/* ------------------------------------------------------------------ */
export function isoWeekday(date: Date): number {
  const d = date.getDay()
  return d === 0 ? 7 : d
}

/** Keçmiş tarixləri atlayaraq növbəti dərs günlərini qaytarır */
export function nextLessonDates(startDate: string, days: number[], count = 4): string[] {
  const out: string[] = []
  const start = new Date(startDate)
  if (Number.isNaN(start.getTime()) || days.length === 0) return out
  const cursor = new Date(Math.max(start.getTime(), Date.now()))
  cursor.setHours(12, 0, 0, 0)
  for (let i = 0; i < 500 && out.length < count; i += 1) {
    if (days.includes(isoWeekday(cursor))) out.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
}

export const MONTHS_SHORT_AZ = [
  'Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek',
]

/* ------------------------------------------------------------------ */
/* errors                                                             */
/* ------------------------------------------------------------------ */
export function getErrMsg(error: unknown): string {
  if (!error) return ''
  if (typeof error === 'string') return error
  if (typeof error === 'object') {
    const e = error as { message?: string; error?: string; data?: unknown }
    if (typeof e.data === 'string') return e.data
    if (typeof e.error === 'string') return e.error
    if (typeof e.message === 'string') return e.message
  }
  return 'Gözlənilməz xəta baş verdi.'
}

/* ------------------------------------------------------------------ */
export const TEST_CARDS = [
  { number: '4242 4242 4242 4242', label: 'Visa — uğurlu ödəniş', ok: true },
  { number: '5555 5555 5555 4444', label: 'Mastercard — uğurlu ödəniş', ok: true },
  { number: '4111 1111 1111 1111', label: 'Visa Debit — uğurlu ödəniş', ok: true },
  { number: '4000 0000 0000 0002', label: 'Bank tərəfindən rədd edilir', ok: false },
  { number: '1234 5678 9012 3456', label: 'Yanlış kart nömrəsi (Luhn)', ok: false },
]

const AZ_LETTERS = /[əıöüçşğİƏÖÜÇŞĞ]/i

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatCardNumber(value: string): string {
  const digits = digitsOnly(value).slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

export function cardBrand(value: string): string {
  const digits = digitsOnly(value)
  if (/^4/.test(digits)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard'
  if (/^3[47]/.test(digits)) return 'Amex'
  if (/^9/.test(digits)) return 'UnionPay'
  return 'Kart'
}

export function luhnCheck(value: string): boolean {
  const digits = digitsOnly(value)
  if (digits.length < 13) return false
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i])
    if (double) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    double = !double
  }
  return sum % 10 === 0
}

export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export interface CardInput {
  number: string
  holder: string
  expiry: string
  cvv: string
}

export function validateCard(card: CardInput): CardValidationResult {
  const errors: CardValidationResult['errors'] = {}
  const digits = digitsOnly(card.number)

  /* --- kart nömrəsi: yalnız rəqəm + Luhn --- */
  if (card.number.replace(/\s/g, '').length > 0 && /[^\d\s]/.test(card.number)) {
    errors.number = 'Kart nömrəsində yalnız rəqəm ola bilər — hərf daxil etdiniz.'
  } else if (digits.length === 0) {
    errors.number = 'Kart nömrəsini daxil edin.'
  } else if (digits.length < 16) {
    errors.number = `Kart nömrəsi 16 rəqəm olmalıdır (daxil edilib: ${digits.length}).`
  } else if (!luhnCheck(digits)) {
    errors.number = 'Kart nömrəsi yanlışdır — yoxlama alqoritmi uğursuz oldu.'
  }

  /* --- kart sahibinin adı: yalnız latın hərfləri --- */
  const holder = card.holder.trim()
  if (!holder) {
    errors.holder = 'Kart sahibinin adını daxil edin.'
  } else if (AZ_LETTERS.test(holder)) {
    errors.holder =
      'Azərbaycan əlifbası hərfləri (ə, ı, ö, ü, ç, ş, ğ) qəbul edilmir. Adı latın hərfləri ilə yazın.'
  } else if (!/^[A-Za-z ]+$/.test(holder)) {
    errors.holder = 'Ad və soyad yalnız latın hərfləri və boşluqdan ibarət olmalıdır.'
  } else if (holder.trim().split(/\s+/).length < 2) {
    errors.holder = 'Ad və soyadı tam şəkildə daxil edin.'
  }

  /* --- son istifadə tarixi --- */
  const expDigits = digitsOnly(card.expiry)
  if (expDigits.length !== 4) {
    errors.expiry = 'Son istifadə tarixi AA/İİ formatında olmalıdır.'
  } else {
    const mm = Number(expDigits.slice(0, 2))
    const yy = Number(expDigits.slice(2))
    const now = new Date()
    if (mm < 1 || mm > 12) errors.expiry = 'Ay 01–12 aralığında olmalıdır.'
    else if (yy < now.getFullYear() % 100 || (yy === now.getFullYear() % 100 && mm < now.getMonth() + 1))
      errors.expiry = 'Kartın istifadə müddəti bitib.'
  }

  /* --- CVV --- */
  const cvvDigits = digitsOnly(card.cvv)
  const expectedCvv = cardBrand(card.number) === 'Amex' ? 4 : 3
  if (cvvDigits.length !== expectedCvv) {
    errors.cvv = `CVV ${expectedCvv} rəqəm olmalıdır.`
  }

  const ok = Object.keys(errors).length === 0
  let message = ok ? 'Kart məlumatları təsdiqləndi.' : 'Kart məlumatlarında xəta var.'
  if (ok && digits === '4000000000000002') message = 'Bank ödənişi rədd etdi.'
  return { ok, brand: cardBrand(card.number), errors, message }
}
