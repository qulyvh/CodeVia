import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  AdminStats,
  CardValidationResult,
  Course,
  CourseMode,
  CourseQuiz,
  Enrollment,
  Lesson,
  Notification,
  PackageTier,
  Payment,
  Role,
  ScheduleSlot,
  StudentStats,
  TeacherStats,
  TeachingMode,
  User,
} from '../../types'
import {
  MONTHS_SHORT_AZ,
  digitsOnly,
  packagePrice,
  todayISO,
  uid,
  validateCard,
} from '../../lib/utils'
import type { CardInput } from '../../lib/utils'
import { getDB, mutate, resetDB } from '../../data/db'

/* ------------------------------------------------------------------ */
/* köməkçilər                                                          */
/* ------------------------------------------------------------------ */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface LoginRequest {
  email: string
  password: string
}
export interface LoginResponse {
  user: User
  token: string
}

/** Qeydiyyat — tələbə və ya müəllim müraciəti */
export interface RegisterPayload {
  role: Role
  fullName: string
  email: string
  password: string
  phone: string
  city: string
  bio?: string
  /* müəllim müraciəti üçün əlavə sahələr */
  specialization?: string
  experienceYears?: number
  education?: string
  skills?: string[]
  languages?: string[]
  hourlyRate?: number
  cvText?: string
  cvFileName?: string
}

export interface EnrollPayload {
  studentId: string
  courseId: string
  packageTier: PackageTier
  mode: CourseMode
  teaching?: TeachingMode
  campus?: string
  slot: ScheduleSlot
  startDate: string
  days: number[]
  amount: number
  quizScore: number
  note?: string
}

export interface PaymentRequest {
  enrollmentId: string
  card: CardInput
  method: 'card' | 'installment'
  installmentMonths?: number
}

export interface PaymentResult {
  payment: Payment
  ok: boolean
  message: string
}

export interface EnrollmentQuery {
  studentId?: string
  courseId?: string
  teacherId?: string
}

export interface PaymentQuery {
  studentId?: string
  teacherId?: string
}

export type { CardInput }

/* ------------------------------------------------------------------ */
/* statistikalar                                                       */
/* ------------------------------------------------------------------ */
function buildAdminStats(): AdminStats {
  const db = getDB()
  const students = db.users.filter((u) => u.role === 'student')
  const teachers = db.users.filter((u) => u.role === 'teacher')
  const paid = db.payments.filter((p) => p.status === 'paid')
  const revenue = paid.reduce((sum, p) => sum + p.amount, 0)

  const now = new Date()
  const revenueByMonth: AdminStats['revenueByMonth'] = []
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthPayments = paid.filter((p) => p.date.slice(0, 7) === key)
    revenueByMonth.push({
      month: MONTHS_SHORT_AZ[d.getMonth()],
      online: monthPayments
        .filter((p) => db.enrollments.find((e) => e.id === p.enrollmentId)?.mode === 'online')
        .reduce((s, p) => s + p.amount, 0),
      offline: monthPayments
        .filter((p) => db.enrollments.find((e) => e.id === p.enrollmentId)?.mode !== 'online')
        .reduce((s, p) => s + p.amount, 0),
    })
  }

  const categoryColors: Record<string, string> = {
    Frontend: '#6366f1',
    Backend: '#22d3ee',
    'Data & AI': '#a855f7',
    Dizayn: '#f472b6',
    Kibertəhlükəsizlik: '#10b981',
    Mobil: '#38bdf8',
    DevOps: '#f59e0b',
    Marketinq: '#fb7185',
    'Keyfiyyət (QA)': '#06b6d4',
  }

  const categoryMap = new Map<string, number>()
  db.enrollments.forEach((e) => {
    const course = db.courses.find((c) => c.id === e.courseId)
    if (!course) return
    categoryMap.set(course.category, (categoryMap.get(course.category) ?? 0) + 1)
  })

  const topCourses = db.courses
    .map((c) => {
      const count = db.enrollments.filter((e) => e.courseId === c.id).length
      const rev = db.payments
        .filter((p) => p.courseId === c.id && p.status === 'paid')
        .reduce((s, p) => s + p.amount, 0)
      return { id: c.id, title: c.title, students: count, revenue: rev, rating: c.rating }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const modeSplit = (['online', 'offline', 'hybrid'] as CourseMode[]).map((mode) => ({
    name: mode === 'online' ? 'Onlayn' : mode === 'offline' ? 'Oflayn' : 'Hibrid',
    value: db.enrollments.filter((e) => e.mode === mode).length,
  }))

  const completed = db.enrollments.filter((e) => e.status === 'completed').length
  const activeEnrollments = db.enrollments.filter((e) => e.status === 'active').length

  return {
    students: students.length,
    teachers: teachers.length,
    courses: db.courses.length,
    activeEnrollments,
    revenue,
    pendingPayments: db.payments.filter((p) => p.status === 'pending').length,
    completionRate: db.enrollments.length ? Math.round((completed / db.enrollments.length) * 100) : 0,
    averageRating:
      Math.round((db.courses.reduce((s, c) => s + c.rating, 0) / (db.courses.length || 1)) * 10) / 10,
    revenueByMonth,
    enrollmentsByCategory: Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] ?? '#6366f1',
    })),
    topCourses,
    modeSplit,
  }
}

function buildTeacherStats(teacherId: string): TeacherStats {
  const db = getDB()
  const courses = db.courses.filter((c) => c.teacherId === teacherId)
  const courseIds = courses.map((c) => c.id)
  const enrollments = db.enrollments.filter((e) => courseIds.includes(e.courseId))
  const uniqueStudents = new Set(enrollments.map((e) => e.studentId))
  const revenue = db.payments
    .filter((p) => courseIds.includes(p.courseId) && p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0)

  return {
    courses: courses.length,
    students: uniqueStudents.size,
    activeStudents: enrollments.filter((e) => e.status === 'active').length,
    lessons: db.lessons.filter((l) => courseIds.includes(l.courseId)).length,
    avgProgress: enrollments.length
      ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
      : 0,
    avgRating: courses.length
      ? Math.round((courses.reduce((s, c) => s + c.rating, 0) / courses.length) * 10) / 10
      : 0,
    revenue,
    upcoming: enrollments
      .filter((e) => e.status === 'active' || e.status === 'pending')
      .slice(0, 5)
      .map((e) => ({
        courseId: e.courseId,
        courseTitle: courses.find((c) => c.id === e.courseId)?.title ?? '—',
        slot: e.slot,
        days: e.days,
        students: enrollments.filter((x) => x.courseId === e.courseId).length,
      })),
    progressByCourse: courses.map((c) => {
      const list = enrollments.filter((e) => e.courseId === c.id)
      return {
        name: c.title.length > 22 ? `${c.title.slice(0, 20)}…` : c.title,
        value: list.length ? Math.round(list.reduce((s, e) => s + e.progress, 0) / list.length) : 0,
      }
    }),
  }
}

function buildStudentStats(studentId: string): StudentStats {
  const db = getDB()
  const enrollments = db.enrollments.filter((e) => e.studentId === studentId)
  const courseIds = enrollments.map((e) => e.courseId)
  const totalLessons = db.lessons.filter((l) => courseIds.includes(l.courseId)).length
  const lessonsDone = enrollments.reduce((s, e) => s + e.completedLessonIds.length, 0)
  const user = db.users.find((u) => u.id === studentId)
  const graded = enrollments.filter((e) => e.grade !== null)
  const days = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B']
  const seed = lessonsDone + 3

  return {
    activeCourses: enrollments.filter((e) => e.status === 'active').length,
    completedCourses: enrollments.filter((e) => e.status === 'completed').length,
    lessonsDone,
    totalLessons,
    attendance: enrollments.length
      ? Math.round(enrollments.reduce((s, e) => s + e.attendance, 0) / enrollments.length)
      : 0,
    avgGrade: graded.length
      ? Math.round(graded.reduce((s, e) => s + (e.grade ?? 0), 0) / graded.length)
      : 0,
    xp: user?.xp ?? 0,
    level: user?.level ?? 'Səviyyə 1',
    spent: db.payments
      .filter((p) => p.studentId === studentId && p.status === 'paid')
      .reduce((s, p) => s + p.amount, 0),
    weeklyActivity: days.map((day, i) => ({
      day,
      minutes: 25 + ((seed * (i + 3)) % 7) * 14,
    })),
  }
}

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery<string>(),
  tagTypes: ['User', 'Course', 'Lesson', 'Enrollment', 'Payment', 'Notification', 'Stats', 'Quiz'],
  endpoints: (build) => ({
    /* ---------------- auth ---------------- */
    login: build.mutation<LoginResponse, LoginRequest>({
      queryFn: async ({ email, password }) => {
        await delay(700)
        const user = getDB().users.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
        )
        if (!user || user.password !== password) {
          return { error: 'E-poçt və ya şifrə yanlışdır.' }
        }
        if (user.status === 'blocked') {
          return { error: 'Hesabınız bloklanıb. Administratorla əlaqə saxlayın.' }
        }
        if (user.status === 'pending') {
          return {
            error:
              'Müəllim müraciətiniz hələ təsdiqlənməyib. Administrator yoxladıqdan sonra giriş edə biləcəksiniz.',
          }
        }
        if (user.status === 'rejected') {
          return { error: 'Müraciətiniz rədd edilib. Ətraflı məlumat üçün administratorla əlaqə saxlayın.' }
        }
        return { data: { user, token: `cv.${user.role}.${user.id}` } }
      },
    }),

    register: build.mutation<User, RegisterPayload>({
      queryFn: async (payload) => {
        await delay(700)
        const exists = getDB().users.some(
          (u) => u.email.toLowerCase() === payload.email.trim().toLowerCase(),
        )
        if (exists) return { error: 'Bu e-poçt artıq qeydiyyatdan keçib.' }

        const isTeacher = payload.role === 'teacher'
        const user: User = {
          id: uid('u'),
          fullName: payload.fullName,
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
          role: payload.role,
          phone: payload.phone,
          city: payload.city,
          bio: payload.bio || (isTeacher ? 'CodeVia Academy müəllimi' : 'CodeVia Academy tələbəsi'),
          avatar: isTeacher ? 'from-accent-500 to-neon-400' : 'from-brand-500 to-accent-400',
          /* müəllim müraciəti admin təsdiqini gözləyir */
          status: isTeacher ? 'pending' : 'active',
          createdAt: todayISO(),
          ...(isTeacher
            ? {
                specialization: payload.specialization,
                experienceYears: payload.experienceYears,
                education: payload.education,
                skills: payload.skills,
                languages: payload.languages,
                hourlyRate: payload.hourlyRate,
                cvText: payload.cvText,
                cvFileName: payload.cvFileName,
                rating: 0,
                appliedAt: new Date().toISOString(),
              }
            : { xp: 0, level: 'Səviyyə 1', balance: 0 }),
        }
        mutate((db) => db.users.push(user))
        return { data: user }
      },
      invalidatesTags: ['User', 'Stats'],
    }),

    /** Admin müəllim müraciətini təsdiqləyir */
    approveTeacher: build.mutation<User, { id: string; note?: string }>({
      queryFn: async ({ id, note }) => {
        await delay(350)
        const user = mutate((db) => {
          const u = db.users.find((x) => x.id === id)
          if (!u) return null
          u.status = 'active'
          u.approvalNote = note
          return u
        })
        if (!user) return { error: 'İstifadəçi tapılmadı.' }
        return { data: user }
      },
      invalidatesTags: ['User', 'Stats'],
    }),

    /** Admin müəllim müraciətini rədd edir */
    rejectTeacher: build.mutation<User, { id: string; note?: string }>({
      queryFn: async ({ id, note }) => {
        await delay(350)
        const user = mutate((db) => {
          const u = db.users.find((x) => x.id === id)
          if (!u) return null
          u.status = 'rejected'
          u.approvalNote = note
          return u
        })
        if (!user) return { error: 'İstifadəçi tapılmadı.' }
        return { data: user }
      },
      invalidatesTags: ['User', 'Stats'],
    }),

    /* ---------------- users ---------------- */
    getUsers: build.query<User[], void>({
      queryFn: async () => {
        await delay(200)
        return { data: getDB().users }
      },
      providesTags: ['User'],
    }),

    updateUser: build.mutation<User, { id: string; patch: Partial<User> }>({
      queryFn: async ({ id, patch }) => {
        await delay(300)
        const updated = mutate((db) => {
          const user = db.users.find((u) => u.id === id)
          if (!user) return null
          Object.assign(user, patch)
          return user
        })
        if (!updated) return { error: 'İstifadəçi tapılmadı.' }
        return { data: updated }
      },
      invalidatesTags: ['User', 'Stats'],
    }),

    createUser: build.mutation<User, Omit<User, 'id' | 'avatar' | 'createdAt'>>({
      queryFn: async (payload) => {
        await delay(400)
        const user: User = {
          ...payload,
          id: uid('u'),
          avatar: 'from-brand-500 to-accent-400',
          createdAt: todayISO(),
        }
        mutate((db) => db.users.push(user))
        return { data: user }
      },
      invalidatesTags: ['User', 'Stats'],
    }),

    deleteUser: build.mutation<string, string>({
      queryFn: async (id) => {
        await delay(400)
        mutate((db) => {
          db.users = db.users.filter((u) => u.id !== id)
          db.enrollments = db.enrollments.filter((e) => e.studentId !== id)
          db.payments = db.payments.filter((p) => p.studentId !== id)
        })
        return { data: id }
      },
      invalidatesTags: ['User', 'Enrollment', 'Payment', 'Stats'],
    }),

    toggleUserStatus: build.mutation<User, string>({
      queryFn: async (id) => {
        await delay(250)
        const user = mutate((db) => {
          const u = db.users.find((x) => x.id === id)
          if (!u) return null
          u.status = u.status === 'active' ? 'blocked' : 'active'
          return u
        })
        if (!user) return { error: 'İstifadəçi tapılmadı.' }
        return { data: user }
      },
      invalidatesTags: ['User'],
    }),

    /* ---------------- courses ---------------- */
    getCourses: build.query<Course[], void>({
      queryFn: async () => {
        await delay(250)
        return { data: getDB().courses }
      },
      providesTags: ['Course'],
    }),

    getCourse: build.query<Course, string>({
      queryFn: async (id) => {
        await delay(200)
        const course = getDB().courses.find((c) => c.id === id || c.slug === id)
        if (!course) return { error: 'Kurs tapılmadı.' }
        return { data: course }
      },
      providesTags: ['Course'],
    }),

    createCourse: build.mutation<Course, Omit<Course, 'id' | 'slug' | 'createdAt'>>({
      queryFn: async (payload) => {
        await delay(450)
        const id = uid('c')
        const course: Course = { ...payload, id, slug: id, createdAt: todayISO() }
        mutate((db) => db.courses.unshift(course))
        return { data: course }
      },
      invalidatesTags: ['Course', 'Stats'],
    }),

    updateCourse: build.mutation<Course, { id: string; patch: Partial<Course> }>({
      queryFn: async ({ id, patch }) => {
        await delay(400)
        const course = mutate((db) => {
          const c = db.courses.find((x) => x.id === id)
          if (!c) return null
          Object.assign(c, patch)
          return c
        })
        if (!course) return { error: 'Kurs tapılmadı.' }
        return { data: course }
      },
      invalidatesTags: ['Course', 'Stats'],
    }),

    deleteCourse: build.mutation<string, string>({
      queryFn: async (id) => {
        await delay(400)
        mutate((db) => {
          db.courses = db.courses.filter((c) => c.id !== id)
          db.lessons = db.lessons.filter((l) => l.courseId !== id)
          db.enrollments = db.enrollments.filter((e) => e.courseId !== id)
        })
        return { data: id }
      },
      invalidatesTags: ['Course', 'Lesson', 'Enrollment', 'Stats'],
    }),

    /* ---------------- lessons ---------------- */
    getLessons: build.query<Lesson[], string>({
      queryFn: async (courseId) => {
        await delay(250)
        return {
          data: getDB()
            .lessons.filter((l) => l.courseId === courseId)
            .sort((a, b) => a.order - b.order),
        }
      },
      providesTags: ['Lesson'],
    }),

    createLesson: build.mutation<Lesson, Omit<Lesson, 'id' | 'order' | 'moduleOrder'>>({
      queryFn: async (payload) => {
        await delay(400)
        const lesson = mutate((db) => {
          const siblings = db.lessons.filter((l) => l.courseId === payload.courseId)
          const modules = Array.from(new Set(siblings.map((l) => l.moduleTitle)))
          const moduleOrder = modules.includes(payload.moduleTitle)
            ? (siblings.find((l) => l.moduleTitle === payload.moduleTitle)?.moduleOrder ?? 1)
            : modules.length + 1
          const created: Lesson = {
            ...payload,
            id: uid('l'),
            order: siblings.length + 1,
            moduleOrder,
          }
          db.lessons.push(created)
          return created
        })
        return { data: lesson }
      },
      invalidatesTags: ['Lesson', 'Stats'],
    }),

    updateLesson: build.mutation<Lesson, { id: string; patch: Partial<Lesson> }>({
      queryFn: async ({ id, patch }) => {
        await delay(350)
        const lesson = mutate((db) => {
          const l = db.lessons.find((x) => x.id === id)
          if (!l) return null
          Object.assign(l, patch)
          return l
        })
        if (!lesson) return { error: 'Dərs tapılmadı.' }
        return { data: lesson }
      },
      invalidatesTags: ['Lesson'],
    }),

    deleteLesson: build.mutation<string, string>({
      queryFn: async (id) => {
        await delay(350)
        mutate((db) => {
          db.lessons = db.lessons.filter((l) => l.id !== id)
          db.enrollments.forEach((e) => {
            e.completedLessonIds = e.completedLessonIds.filter((x) => x !== id)
          })
        })
        return { data: id }
      },
      invalidatesTags: ['Lesson', 'Enrollment', 'Stats'],
    }),

    getQuiz: build.query<CourseQuiz | null, string>({
      queryFn: async (courseId) => {
        await delay(250)
        const quiz = getDB().quizzes.find((q) => q.courseId === courseId)
        return { data: quiz ?? null }
      },
      providesTags: ['Quiz'],
    }),

    /* ---------------- enrollments ---------------- */
    getEnrollments: build.query<Enrollment[], EnrollmentQuery | void>({
      queryFn: async (args) => {
        await delay(250)
        const db = getDB()
        let list = [...db.enrollments]
        if (args?.studentId) list = list.filter((e) => e.studentId === args.studentId)
        if (args?.courseId) list = list.filter((e) => e.courseId === args.courseId)
        if (args?.teacherId) {
          const ids = db.courses.filter((c) => c.teacherId === args.teacherId).map((c) => c.id)
          list = list.filter((e) => ids.includes(e.courseId))
        }
        return { data: list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }
      },
      providesTags: ['Enrollment'],
    }),

    createEnrollment: build.mutation<Enrollment, EnrollPayload>({
      queryFn: async (payload) => {
        await delay(500)
        const db = getDB()
        const duplicate = db.enrollments.find(
          (e) => e.studentId === payload.studentId && e.courseId === payload.courseId,
        )
        if (duplicate && duplicate.status !== 'cancelled') {
          return { error: 'Siz artıq bu kursa qeydiyyatdan keçmisiniz.' }
        }
        const enrollment: Enrollment = {
          id: uid('e'),
          studentId: payload.studentId,
          courseId: payload.courseId,
          packageTier: payload.packageTier,
          mode: payload.mode,
          teaching: payload.teaching,
          campus: payload.campus,
          slot: payload.slot,
          startDate: payload.startDate,
          days: payload.days,
          status: 'pending',
          progress: 0,
          completedLessonIds: [],
          attendance: 0,
          grade: null,
          amount: payload.amount,
          createdAt: new Date().toISOString(),
          quizScore: payload.quizScore,
          note: payload.note,
        }
        mutate((d) => d.enrollments.unshift(enrollment))
        return { data: enrollment }
      },
      invalidatesTags: ['Enrollment', 'Stats'],
    }),

    updateEnrollment: build.mutation<Enrollment, { id: string; patch: Partial<Enrollment> }>({
      queryFn: async ({ id, patch }) => {
        await delay(350)
        const enrollment = mutate((db) => {
          const e = db.enrollments.find((x) => x.id === id)
          if (!e) return null
          Object.assign(e, patch)
          return e
        })
        if (!enrollment) return { error: 'Qeydiyyat tapılmadı.' }
        return { data: enrollment }
      },
      invalidatesTags: ['Enrollment', 'Stats'],
    }),

    deleteEnrollment: build.mutation<string, string>({
      queryFn: async (id) => {
        await delay(350)
        mutate((db) => {
          db.enrollments = db.enrollments.filter((e) => e.id !== id)
          db.payments = db.payments.filter((p) => p.enrollmentId !== id)
        })
        return { data: id }
      },
      invalidatesTags: ['Enrollment', 'Payment', 'Stats'],
    }),

    toggleLessonComplete: build.mutation<Enrollment, { enrollmentId: string; lessonId: string }>({
      queryFn: async ({ enrollmentId, lessonId }) => {
        await delay(200)
        const enrollment = mutate((db) => {
          const e = db.enrollments.find((x) => x.id === enrollmentId)
          if (!e) return null
          const total = db.lessons.filter((l) => l.courseId === e.courseId).length
          if (e.completedLessonIds.includes(lessonId)) {
            e.completedLessonIds = e.completedLessonIds.filter((x) => x !== lessonId)
          } else {
            e.completedLessonIds = [...e.completedLessonIds, lessonId]
          }
          e.progress = total ? Math.round((e.completedLessonIds.length / total) * 100) : 0
          if (e.progress === 100) e.status = 'completed'
          else if (e.status === 'completed') e.status = 'active'
          return e
        })
        if (!enrollment) return { error: 'Qeydiyyat tapılmadı.' }
        return { data: enrollment }
      },
      invalidatesTags: ['Enrollment', 'Stats'],
    }),

    /* ---------------- payments ---------------- */
    getPayments: build.query<Payment[], PaymentQuery | void>({
      queryFn: async (args) => {
        await delay(250)
        const db = getDB()
        let list = [...db.payments]
        if (args?.studentId) list = list.filter((p) => p.studentId === args.studentId)
        if (args?.teacherId) {
          const ids = db.courses.filter((c) => c.teacherId === args.teacherId).map((c) => c.id)
          list = list.filter((p) => ids.includes(p.courseId))
        }
        return { data: list.sort((a, b) => b.date.localeCompare(a.date)) }
      },
      providesTags: ['Payment'],
    }),

    processPayment: build.mutation<PaymentResult, PaymentRequest>({
      queryFn: async ({ enrollmentId, card, method }) => {
        await delay(1500)
        const db = getDB()
        const enrollment = db.enrollments.find((e) => e.id === enrollmentId)
        if (!enrollment) return { error: 'Qeydiyyat tapılmadı. Zəhmət olmasa yenidən cəhd edin.' }

        const validation: CardValidationResult = validateCard(card)
        const digits = digitsOnly(card.number)
        const declined = digits === '4000000000000002' || digits.startsWith('0000')
        const ok = validation.ok && !declined

        const failReason = !validation.ok
          ? Object.values(validation.errors)[0]
          : declined
            ? 'Bank tərəfindən rədd edildi (kart limiti kifayət etmir).'
            : undefined

        const payment: Payment = {
          id: uid('p'),
          enrollmentId,
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          amount: enrollment.amount,
          status: ok ? 'paid' : 'failed',
          cardHolder: card.holder.trim().toUpperCase(),
          cardLast4: digits.slice(-4) || '0000',
          brand: validation.brand,
          method,
          invoiceNo: `CV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          date: todayISO(),
          failReason,
        }

        mutate((d) => {
          d.payments.unshift(payment)
          if (ok) {
            const e = d.enrollments.find((x) => x.id === enrollmentId)
            if (e) e.status = 'active'
          }
        })

        return {
          data: {
            payment,
            ok,
            message: ok
              ? 'Ödəniş uğurla tamamlandı. Kursunuz aktivləşdirildi!'
              : (failReason ?? 'Ödəniş uğursuz oldu.'),
          },
        }
      },
      invalidatesTags: ['Payment', 'Enrollment', 'Stats'],
    }),

    refundPayment: build.mutation<Payment, string>({
      queryFn: async (id) => {
        await delay(400)
        const payment = mutate((db) => {
          const p = db.payments.find((x) => x.id === id)
          if (!p) return null
          p.status = 'refunded'
          return p
        })
        if (!payment) return { error: 'Ödəniş tapılmadı.' }
        return { data: payment }
      },
      invalidatesTags: ['Payment', 'Stats'],
    }),

    /* ---------------- bildirişlər ---------------- */
    getNotifications: build.query<Notification[], string>({
      queryFn: async (userId) => {
        await delay(150)
        return {
          data: getDB()
            .notifications.filter((n) => n.userId === userId)
            .sort((a, b) => b.date.localeCompare(a.date)),
        }
      },
      providesTags: ['Notification'],
    }),

    markNotificationRead: build.mutation<string, string>({
      queryFn: async (id) => {
        await delay(120)
        mutate((db) => {
          const n = db.notifications.find((x) => x.id === id)
          if (n) n.read = true
        })
        return { data: id }
      },
      invalidatesTags: ['Notification'],
    }),

    /* ---------------- statistikalar ---------------- */
    getAdminStats: build.query<AdminStats, void>({
      queryFn: async () => {
        await delay(350)
        return { data: buildAdminStats() }
      },
      providesTags: ['Stats'],
    }),

    getTeacherStats: build.query<TeacherStats, string>({
      queryFn: async (teacherId) => {
        await delay(300)
        return { data: buildTeacherStats(teacherId) }
      },
      providesTags: ['Stats'],
    }),

    getStudentStats: build.query<StudentStats, string>({
      queryFn: async (studentId) => {
        await delay(300)
        return { data: buildStudentStats(studentId) }
      },
      providesTags: ['Stats'],
    }),

    /* ---------------- sistem ---------------- */
    resetDatabase: build.mutation<{ ok: boolean }, void>({
      queryFn: async () => {
        await delay(600)
        resetDB()
        return { data: { ok: true } }
      },
      invalidatesTags: ['User', 'Course', 'Lesson', 'Enrollment', 'Payment', 'Notification', 'Stats', 'Quiz'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useApproveTeacherMutation,
  useRejectTeacherMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
  useGetCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetLessonsQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useGetQuizQuery,
  useGetEnrollmentsQuery,
  useCreateEnrollmentMutation,
  useUpdateEnrollmentMutation,
  useDeleteEnrollmentMutation,
  useToggleLessonCompleteMutation,
  useGetPaymentsQuery,
  useProcessPaymentMutation,
  useRefundPaymentMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useGetAdminStatsQuery,
  useGetTeacherStatsQuery,
  useGetStudentStatsQuery,
  useResetDatabaseMutation,
} = api

/** Paket qiymətini hesablayan köməkçi */
export { packagePrice }
