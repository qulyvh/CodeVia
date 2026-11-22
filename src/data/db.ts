import type { Course, CourseQuiz, Enrollment, Lesson, Notification, Payment, User } from '../types'
import {
  seedCourses,
  seedEnrollments,
  seedLessons,
  seedNotifications,
  seedPayments,
  seedQuizzes,
  seedUsers,
} from './seed'

export interface Database {
  users: User[]
  courses: Course[]
  lessons: Lesson[]
  enrollments: Enrollment[]
  payments: Payment[]
  quizzes: CourseQuiz[]
  notifications: Notification[]
}

const STORAGE_KEY = 'codevia_lms_db_v1'

function freshDB(): Database {
  return {
    users: structuredClone(seedUsers),
    courses: structuredClone(seedCourses),
    lessons: structuredClone(seedLessons),
    enrollments: structuredClone(seedEnrollments),
    payments: structuredClone(seedPayments),
    quizzes: structuredClone(seedQuizzes),
    notifications: structuredClone(seedNotifications),
  }
}

function readStorage(): Database | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Database
    if (!parsed || !Array.isArray(parsed.users) || parsed.users.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

let database: Database = readStorage() ?? freshDB()

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database))
  } catch {
    /* ignore quota errors */
  }
}

export function getDB(): Database {
  return database
}

export function saveDB(): void {
  persist()
}

export function resetDB(): void {
  database = freshDB()
  persist()
}

/** Baza üzərində dəyişiklik edir və avtomatik saxlayır */
export function mutate<T>(fn: (db: Database) => T): T {
  const result = fn(database)
  persist()
  return result
}
