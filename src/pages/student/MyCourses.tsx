import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Circle,
  Clock,
  CreditCard,
  GraduationCap,
  ListChecks,
  PlayCircle,
  Search,
} from 'lucide-react'
import type { Course, Enrollment, Lesson } from '../../types'
import { useAuth } from '../../app/hooks'
import {
  useGetCoursesQuery,
  useGetEnrollmentsQuery,
  useGetLessonsQuery,
  useGetUsersQuery,
} from '../../features/api/apiSlice'
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Loader,
  Modal,
  Progress,
  Tabs,
} from '../../components/ui'
import { CoverImage, PageHeader } from '../../components/common'
import {
  ENROLLMENT_STATUS_LABEL,
  LESSON_TYPE_LABEL,
  MODE_LABEL,
  packageOf,
} from '../../lib/utils'

type Filter = 'all' | 'active' | 'completed' | 'pending' | 'cancelled'

const STATUS_TONE: Record<Enrollment['status'], 'success' | 'brand' | 'warning' | 'danger'> = {
  active: 'success',
  completed: 'brand',
  pending: 'warning',
  cancelled: 'danger',
}

/* ------------------------------------------------------------------ */
/* Silabus modalı — dərsləri modul üzrə qruplaşdırır                   */
/* ------------------------------------------------------------------ */
function SyllabusModal({
  open,
  onClose,
  courseId,
  completedLessonIds,
}: {
  open: boolean
  onClose: () => void
  courseId: string
  completedLessonIds: string[]
}) {
  const { data: lessons = [], isLoading } = useGetLessonsQuery(courseId, { skip: !courseId })

  const modules = lessons.reduce<{ title: string; items: Lesson[] }[]>((acc, lesson) => {
    let module = acc.find((m) => m.title === lesson.moduleTitle)
    if (!module) {
      module = { title: lesson.moduleTitle, items: [] }
      acc.push(module)
    }
    module.items.push(lesson)
    return acc
  }, [])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Kurs silabusu"
      size="lg"
      footer={
        <Button variant="ghost" onClick={onClose}>
          Bağla
        </Button>
      }
    >
      {isLoading ? (
        <Loader label="Silabus yüklənir..." />
      ) : modules.length === 0 ? (
        <p className="text-sm text-slate-400">Bu kurs üzrə dərs tapılmadı.</p>
      ) : (
        <div className="space-y-5">
          {modules.map((module, mi) => (
            <div key={module.title}>
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500/15 text-xs font-bold text-brand-300">
                  {mi + 1}
                </span>
                <h4 className="text-sm font-bold text-white">{module.title}</h4>
                <span className="text-xs text-slate-500">{module.items.length} dərs</span>
              </div>
              <div className="space-y-1.5">
                {module.items.map((lesson) => {
                  const done = completedLessonIds.includes(lesson.id)
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5"
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-slate-600" />
                      )}
                      <span className="w-6 shrink-0 text-xs font-semibold text-slate-500">
                        {lesson.order}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-200">
                        {lesson.title}
                      </span>
                      <span className="hidden items-center gap-1 text-xs text-slate-500 sm:inline-flex">
                        <Clock className="h-3.5 w-3.5" /> {lesson.durationMin} dəq
                      </span>
                      <Badge tone="neutral">{LESSON_TYPE_LABEL[lesson.type]}</Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* Qeydiyyat kartı                                                     */
/* ------------------------------------------------------------------ */
function EnrollmentCard({
  enrollment,
  course,
  teacherName,
}: {
  enrollment: Enrollment
  course?: Course
  teacherName: string
}) {
  const [syllabusOpen, setSyllabusOpen] = useState(false)
  const { data: lessons = [] } = useGetLessonsQuery(course?.id ?? '', { skip: !course?.id })
  const total = lessons.length
  const done = enrollment.completedLessonIds.length

  return (
    <div className="panel panel-hover flex flex-col overflow-hidden p-0">
      <div className="relative p-3 pb-0">
        <CoverImage
          prompt={course?.coverPrompt ?? enrollment.courseId}
          title={course?.title ?? 'Kurs'}
          tech={course?.tech}
        />
        <div className="absolute left-6 top-6">
          <Badge tone={STATUS_TONE[enrollment.status]}>
            {ENROLLMENT_STATUS_LABEL[enrollment.status]}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone="neon">{packageOf(enrollment.packageTier).name} paket</Badge>
          <Badge tone={enrollment.mode === 'online' ? 'accent' : enrollment.mode === 'offline' ? 'warning' : 'neon'}>
            {MODE_LABEL[enrollment.mode]}
          </Badge>
        </div>

        <h3 className="line-clamp-2 text-base font-bold text-white">
          {course?.title ?? 'Kurs'}
        </h3>
        <p className="mt-1 text-xs text-slate-400">{teacherName}</p>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-slate-400">İrəliləyiş</span>
            <span className="text-xs font-bold text-white">{enrollment.progress}%</span>
          </div>
          <Progress value={enrollment.progress} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-white/8 bg-white/[0.03] py-2">
            <BookOpen className="mx-auto h-4 w-4 text-brand-300" />
            <p className="mt-1 text-xs font-bold text-white">
              {done}/{total || '—'}
            </p>
            <p className="text-[10px] text-slate-500">dərs</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] py-2">
            <CalendarCheck className="mx-auto h-4 w-4 text-accent-300" />
            <p className="mt-1 text-xs font-bold text-white">{enrollment.attendance}%</p>
            <p className="text-[10px] text-slate-500">davamiyyət</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] py-2">
            <Award className="mx-auto h-4 w-4 text-amber-300" />
            <p className="mt-1 text-xs font-bold text-white">
              {enrollment.grade ?? '—'}
            </p>
            <p className="text-[10px] text-slate-500">bal</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link to={`/panel/telebe/kurs/${enrollment.courseId}`} className="flex-1">
            <Button
              variant="primary"
              size="sm"
              full
              leftIcon={<PlayCircle className="h-4 w-4" />}
            >
              Davam et
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ListChecks className="h-4 w-4" />}
            onClick={() => setSyllabusOpen(true)}
          >
            Silabus
          </Button>
          <Link to="/panel/telebe/odenisler">
            <Button variant="ghost" size="sm" leftIcon={<CreditCard className="h-4 w-4" />}>
              Ödənişlər
            </Button>
          </Link>
        </div>
      </div>

      <SyllabusModal
        open={syllabusOpen}
        onClose={() => setSyllabusOpen(false)}
        courseId={course?.id ?? ''}
        completedLessonIds={enrollment.completedLessonIds}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Əsas səhifə                                                         */
/* ------------------------------------------------------------------ */
export default function StudentCourses() {
  const { user } = useAuth()
  const { data: enrollments = [], isLoading } = useGetEnrollmentsQuery(
    { studentId: user?.id },
    { skip: !user?.id },
  )
  const { data: courses = [] } = useGetCoursesQuery()
  const { data: users = [] } = useGetUsersQuery()

  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const courseOf = (id: string) => courses.find((c) => c.id === id)
  const teacherName = (teacherId?: string) =>
    users.find((u) => u.id === teacherId)?.fullName ?? 'Müəllim'

  const tabs: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: 'Hamısı', count: enrollments.length },
    { value: 'active', label: 'Aktiv', count: enrollments.filter((e) => e.status === 'active').length },
    {
      value: 'completed',
      label: 'Tamamlanan',
      count: enrollments.filter((e) => e.status === 'completed').length,
    },
    {
      value: 'pending',
      label: 'Gözləmədə',
      count: enrollments.filter((e) => e.status === 'pending').length,
    },
    {
      value: 'cancelled',
      label: 'Ləğv edilən',
      count: enrollments.filter((e) => e.status === 'cancelled').length,
    },
  ]

  const query = search.trim().toLowerCase()
  const filtered = enrollments.filter((e) => {
    const statusOk = filter === 'all' || e.status === filter
    const course = courseOf(e.courseId)
    const searchOk = !query || (course?.title ?? '').toLowerCase().includes(query)
    return statusOk && searchOk
  })

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <PageHeader
          title="Kurslarım"
          subtitle={`Qeydiyyatdan keçdiyiniz ${enrollments.length} kurs üzrə təhsilinizi idarə edin`}
          icon={<GraduationCap className="h-6 w-6" />}
          actions={
            <Link to="/kurslar">
              <Button variant="primary" leftIcon={<BookOpen className="h-4 w-4" />}>
                Yeni kurs
              </Button>
            </Link>
          }
        />
      </div>

      <div className="animate-fade-up animate-delay-100 flex flex-wrap items-center justify-between gap-4">
        <Tabs tabs={tabs} value={filter} onChange={setFilter} />
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kurs adı ilə axtar..."
            className="[&_input]:pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <Loader label="Kurslarınız yüklənir..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={enrollments.length === 0 ? 'Hələ kursa qeydiyyatınız yoxdur' : 'Uyğun kurs tapılmadı'}
          message={
            enrollments.length === 0
              ? 'Kataloqdan uyğun kurs seçib öyrənməyə başlayın.'
              : 'Axtarış və ya filtr şərtlərini dəyişərək yenidən yoxlayın.'
          }
          icon={<BookOpen className="h-6 w-6" />}
          action={
            <Link to="/kurslar">
              <Button variant="primary" leftIcon={<BookOpen className="h-4 w-4" />}>
                Kurslara bax
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid animate-fade-up animate-delay-200 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((enrollment) => {
            const course = courseOf(enrollment.courseId)
            return (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
                course={course}
                teacherName={teacherName(course?.teacherId)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
