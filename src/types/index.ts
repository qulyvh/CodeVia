export type Role = 'student' | 'teacher' | 'admin'

export type CourseMode = 'online' | 'offline' | 'hybrid'

export type CourseLevel = 'baslangic' | 'orta' | 'pesekar'

export type CourseStatus = 'draft' | 'published' | 'archived'

export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type PackageTier = 'start' | 'pro' | 'elite'

export type ScheduleSlot = 'seher' | 'gunorta' | 'axsam' | 'heftesonu'

/** Dərsin keçirilmə forması */
export type TeachingMode = 'group' | 'individual'

export type LessonType = 'video' | 'live' | 'project' | 'quiz'

/** pending — müəllim müraciəti admin təsdiqini gözləyir */
export type UserStatus = 'active' | 'blocked' | 'pending' | 'rejected'

export interface User {
  id: string
  fullName: string
  email: string
  password: string
  role: Role
  phone: string
  city: string
  bio: string
  avatar: string
  /** Profil şəkli (data URL) */
  photo?: string
  status: UserStatus
  createdAt: string
  /** müəllim üçün */
  specialization?: string
  experienceYears?: number
  rating?: number
  skills?: string[]
  education?: string
  languages?: string[]
  hourlyRate?: number
  cvText?: string
  cvFileName?: string
  cvUrl?: string
  certificates?: string[]
  /** tələbə üçün */
  xp?: number
  level?: string
  balance?: number
  goal?: string
  interests?: string[]
  /** ümumi */
  social?: { label: string; url: string }[]
  /** müraciət tarixi (müəllim) */
  appliedAt?: string
  approvalNote?: string
}

export interface Course {
  id: string
  slug: string
  title: string
  category: string
  level: CourseLevel
  mode: CourseMode
  summary: string
  description: string
  teacherId: string
  durationWeeks: number
  lessonsPerWeek: number
  totalHours: number
  basePrice: number
  oldPrice?: number
  rating: number
  reviewCount: number
  studentCount: number
  tags: string[]
  outcomes: string[]
  requirements: string[]
  tech: string[]
  coverPrompt: string
  accent: string
  status: CourseStatus
  popular: boolean
  createdAt: string
}

export interface Lesson {
  id: string
  courseId: string
  moduleTitle: string
  moduleOrder: number
  order: number
  title: string
  description: string
  durationMin: number
  youtubeId: string
  type: LessonType
  isFree: boolean
  resources: { title: string; url: string }[]
}

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  packageTier: PackageTier
  mode: CourseMode
  teaching?: TeachingMode
  campus?: string
  slot: ScheduleSlot
  startDate: string
  days: number[]
  status: EnrollmentStatus
  progress: number
  completedLessonIds: string[]
  attendance: number
  grade: number | null
  amount: number
  createdAt: string
  quizScore: number
  note?: string
}

export interface Payment {
  id: string
  enrollmentId: string
  studentId: string
  courseId: string
  amount: number
  status: PaymentStatus
  cardHolder: string
  cardLast4: string
  brand: string
  method: 'card' | 'installment'
  invoiceNo: string
  date: string
  failReason?: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  topic: string
}

export interface CourseQuiz {
  courseId: string
  passScore: number
  questions: QuizQuestion[]
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  type: 'info' | 'success' | 'warning' | 'grade'
  read: boolean
  date: string
}

export interface PackageOption {
  tier: PackageTier
  name: string
  multiplier: number
  tagline: string
  features: string[]
  highlight: boolean
}

export interface CardValidationResult {
  ok: boolean
  brand: string
  errors: Partial<Record<'number' | 'holder' | 'expiry' | 'cvv', string>>
  message: string
}

export interface SessionUser {
  id: string
  fullName: string
  email: string
  role: Role
  avatar: string
  /** Profil şəkli (data URL) */
  photo?: string
}

export interface AdminStats {
  students: number
  teachers: number
  courses: number
  activeEnrollments: number
  revenue: number
  pendingPayments: number
  completionRate: number
  averageRating: number
  revenueByMonth: { month: string; online: number; offline: number }[]
  enrollmentsByCategory: { name: string; value: number; color: string }[]
  topCourses: { id: string; title: string; students: number; revenue: number; rating: number }[]
  modeSplit: { name: string; value: number }[]
}

export interface TeacherStats {
  courses: number
  students: number
  activeStudents: number
  lessons: number
  avgProgress: number
  avgRating: number
  revenue: number
  upcoming: { courseId: string; courseTitle: string; slot: ScheduleSlot; days: number[]; students: number }[]
  progressByCourse: { name: string; value: number }[]
}

export interface StudentStats {
  activeCourses: number
  completedCourses: number
  lessonsDone: number
  totalLessons: number
  attendance: number
  avgGrade: number
  xp: number
  level: string
  spent: number
  weeklyActivity: { day: string; minutes: number }[]
}

export interface SampleAccount {
  role: Role
  label: string
  email: string
  password: string
  name: string
  description: string
  accent: string
}
